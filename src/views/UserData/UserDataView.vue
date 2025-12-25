<script setup lang="ts">
import { ref, toRaw } from "vue";
import semver from "semver";
import { db, wipeDatabase } from "@/services/database";
import { useToastStore } from "@/stores/toast";
import WaveLayout from "@/components/layout/WaveLayout.vue";
import UserDataExportCard from "./components/UserDataExportCard.vue";
import UserDataImportCard from "./components/UserDataImportCard.vue";
import UserDataDeleteCard from "./components/UserDataDeleteCard.vue";
import UserDataImportDialog from "./components/UserDataImportDialog.vue";
import UserDataDeleteDialog from "./components/UserDataDeleteDialog.vue";
import {
  DATA_EXPORT_VERSION,
  MIN_SUPPORTED_DATA_VERSION,
} from "@/config/constants";

const toastStore = useToastStore();
const importCardRef = ref<InstanceType<typeof UserDataImportCard> | null>(null);
const isProcessing = ref(false);

interface ExportData {
  version: string;
  exportedAt: string;
  pantryItems: any[];
  ledgerSessions: any[];
  ledgerEntries: any[];
  favorites: any[];
  userAchievements: any[];
  achievementMetrics: any[];
}

// Basic HMAC for integrity check
async function computeHmac(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode("fking-mixology-integrity-secret");
  const dataBuffer = encoder.encode(data);

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, dataBuffer);

  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Obfuscation Helpers
function obfuscate(text: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  const shifted = bytes.map((b) => (b + 42) % 256);
  let binary = "";
  for (let i = 0; i < shifted.length; i++) {
    binary += String.fromCharCode(shifted[i]);
  }
  return btoa(binary);
}

function deobfuscate(encoded: string): string {
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const original = bytes.map((b) => (b - 42 + 256) % 256);
  const decoder = new TextDecoder();
  return decoder.decode(original);
}

async function handleExport() {
  try {
    isProcessing.value = true;

    const [
      pantryItems,
      ledgerSessions,
      ledgerEntries,
      favorites,
      userAchievements,
      achievementMetrics,
    ] = await Promise.all([
      db.pantryItems.toArray(),
      db.ledgerSessions.toArray(),
      db.ledgerEntries.toArray(),
      db.favorites.toArray(),
      db.userAchievements.toArray(),
      db.achievementMetrics.toArray(),
    ]);

    const exportData: ExportData = {
      version: DATA_EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      pantryItems,
      ledgerSessions,
      ledgerEntries,
      favorites,
      userAchievements,
      achievementMetrics,
    };

    const jsonString = JSON.stringify(exportData);
    const obfuscated = obfuscate(jsonString);
    const hmac = await computeHmac(obfuscated);
    const finalContent = `${hmac}:${obfuscated}`;

    const blob = new Blob([finalContent], {
      type: "application/octet-stream",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `mixology_matcher_backup_${new Date().toISOString().split("T")[0]
      }.fkm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toastStore.addToast({
      title: "Export Successful",
      message: "Your user data has been exported.",
      type: "success",
    });
  } catch (e: any) {
    console.error("Export failed", e);
    toastStore.addToast({
      title: "Export Failed",
      message: e.message || "An error occurred during export.",
      type: "error",
    });
  } finally {
    isProcessing.value = false;
  }
}

const pendingImportData = ref<ExportData | null>(null);

async function handleFileSelect(file: File) {
  isProcessing.value = true;

  try {
    const text = await file.text();
    let jsonString = text;

    const separatorIndex = text.indexOf(":");

    if (separatorIndex === 64) {
      const providedHmac = text.substring(0, separatorIndex);
      const content = text.substring(separatorIndex + 1);

      const calculatedHmac = await computeHmac(content);

      if (providedHmac !== calculatedHmac) {
        throw new Error(
          "File integrity check failed. The file may have been tampered with."
        );
      }

      try {
        jsonString = deobfuscate(content);
      } catch {
        throw new Error("File format is invalid despite valid signature.");
      }
    } else {
      console.warn("No valid HMAC found, attempting legacy read.");
      try {
        jsonString = deobfuscate(text);
      } catch {
        // Try raw JSON
      }
    }

    const data: ExportData = JSON.parse(jsonString);

    // Version Check
    let importVersion = "0.0.0";
    if (data.version) {
      importVersion = String(data.version);
    }

    if (!semver.valid(importVersion) && !isNaN(Number(importVersion))) {
      importVersion = `${importVersion}.0.0`;
    }

    if (!semver.valid(importVersion)) {
      throw new Error(`Invalid backup version: ${data.version}`);
    }

    if (semver.lt(importVersion, MIN_SUPPORTED_DATA_VERSION)) {
      throw new Error(
        `Backup version ${importVersion} is too old. Minimum supported is ${MIN_SUPPORTED_DATA_VERSION}.`
      );
    }

    if (!data.exportedAt || !data.pantryItems) {
      throw new Error("Invalid file format.");
    }

    pendingImportData.value = data;
  } catch (e: any) {
    console.error("Import read failed", e);
    toastStore.addToast({
      title: "Import Failed",
      message:
        e.message || "Could not read the file. Ensure it is a valid backup.",
      type: "error",
    });
    if (importCardRef.value?.fileInput) {
      importCardRef.value.fileInput.value = "";
    }
  } finally {
    isProcessing.value = false;
  }
}

async function executeImport(mode: "wipe" | "append") {
  if (!pendingImportData.value) return;

  const data = JSON.parse(JSON.stringify(toRaw(pendingImportData.value)));

  isProcessing.value = true;

  try {
    await db.transaction(
      "rw",
      [
        db.pantryItems,
        db.ledgerSessions,
        db.ledgerEntries,
        db.favorites,
        db.userAchievements,
        db.achievementMetrics,
      ],
      async () => {
        if (mode === "wipe") {
          await db.pantryItems.clear();
          await db.ledgerSessions.clear();
          await db.ledgerEntries.clear();
          await db.favorites.clear();
          await db.userAchievements.clear();
          await db.achievementMetrics.clear();
        }

        const stripIds = (items: any[]) => items.map(({ id, ...rest }) => rest);

        await db.pantryItems.bulkAdd(stripIds(data.pantryItems));
        await db.ledgerSessions.bulkAdd(stripIds(data.ledgerSessions));
        await db.ledgerEntries.bulkAdd(stripIds(data.ledgerEntries));
        await db.favorites.bulkAdd(stripIds(data.favorites));
        await db.userAchievements.bulkAdd(stripIds(data.userAchievements));

        if (mode === "wipe") {
          await db.achievementMetrics.bulkAdd(data.achievementMetrics);
        } else {
          await db.achievementMetrics.bulkPut(data.achievementMetrics);
        }
      }
    );

    toastStore.addToast({
      title: "Import Complete",
      message: `Successfully imported ${mode === "wipe" ? "and replaced" : "and appended"
        } user data.`,
      type: "success",
    });

    setTimeout(() => window.location.reload(), 1500);
  } catch (e: any) {
    console.error("Import transaction failed", e);
    toastStore.addToast({
      title: "Import Error",
      message: "Database error during import. " + e.message,
      type: "error",
    });
  } finally {
    isProcessing.value = false;
    pendingImportData.value = null;
    if (importCardRef.value?.fileInput) {
      importCardRef.value.fileInput.value = "";
    }
  }
}

function handleDialogClose() {
  pendingImportData.value = null;
  if (importCardRef.value?.fileInput) {
    importCardRef.value.fileInput.value = "";
  }
}

const showDeleteDialog = ref(false);

async function executeDelete() {
  try {
    isProcessing.value = true;
    await wipeDatabase();

    toastStore.addToast({
      title: "Reset Complete",
      message: "Application storage cleared. Reloading...",
      type: "success",
    });

    setTimeout(() => {
      window.location.href = "/";
    }, 1500);
  } catch (e: any) {
    console.error("Delete failed", e);
    toastStore.addToast({
      title: "Reset Failed",
      message: e.message || "An error occurred while wiping data.",
      type: "error",
    });
    isProcessing.value = false;
  } finally {
    showDeleteDialog.value = false;
  }
}
</script>

<template>
  <WaveLayout title="User Data Management" icon="💾" subtitle="Export your progress or restore a backup">
    <div class="user-data-content">
      <div class="card-grid">
        <UserDataExportCard :is-processing="isProcessing" @export="handleExport" />
        <UserDataImportCard ref="importCardRef" :is-processing="isProcessing" @select-file="handleFileSelect" />
        <UserDataDeleteCard :is-processing="isProcessing" @delete="showDeleteDialog = true" />
      </div>

      <UserDataImportDialog :show="!!pendingImportData" :import-data="pendingImportData" @close="handleDialogClose"
        @import="executeImport" />

      <UserDataDeleteDialog :show="showDeleteDialog" @close="showDeleteDialog = false" @confirm="executeDelete" />
    </div>
  </WaveLayout>
</template>

<style lang="scss" scoped>
@use "@/styles/variables" as *;

.user-data-content {
  max-width: 800px;
  margin: 0 auto;
}

.card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: $space-lg;

  @include tablet-up {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
