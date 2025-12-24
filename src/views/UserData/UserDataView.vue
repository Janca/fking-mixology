<script setup lang="ts">
import { ref, toRaw } from "vue";
import semver from "semver";
import { db } from "@/services/database";
import { useToastStore } from "@/stores/toast";
import WaveLayout from "@/components/layout/WaveLayout.vue";
import AppButton from "@/components/common/AppButton.vue";
import {
  DATA_EXPORT_VERSION,
  MIN_SUPPORTED_DATA_VERSION,
} from "@/config/constants";

const toastStore = useToastStore();
const fileInput = ref<HTMLInputElement | null>(null);
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
  // Future: userSettings if added
}

// Basic HMAC for integrity check (Not secure key storage, just validity)
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

  // Convert buffer to hex string
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Obfuscation Helpers
function obfuscate(text: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  // Shift bytes by +42
  const shifted = bytes.map((b) => (b + 42) % 256);
  // Manual binary string creation to avoid stack overflow with Spread
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
  // Undo shift (-42)
  const original = bytes.map((b) => (b - 42 + 256) % 256);
  const decoder = new TextDecoder();
  return decoder.decode(original);
}

async function handleExport() {
  try {
    isProcessing.value = true;

    // Gather data
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

    // Add Integrity HMAC
    const hmac = await computeHmac(obfuscated);
    const finalContent = `${hmac}:${obfuscated}`;

    // Create blobs
    const blob = new Blob([finalContent], {
      type: "application/octet-stream",
    });
    const url = URL.createObjectURL(blob);

    // Download
    const a = document.createElement("a");
    a.href = url;
    a.download = `mixology_matcher_backup_${
      new Date().toISOString().split("T")[0]
    }.fkm`; // Custom extension requested implicitly "save file" style
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

function triggerImport() {
  fileInput.value?.click();
}

async function handleImportFile(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];
  isProcessing.value = true;

  try {
    const text = await file.text();
    let jsonString = text;

    // Check for HMAC format (hex:base64)
    // Hex SHA-256 is 64 chars.
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

      // Use content for deobfuscation
      try {
        jsonString = deobfuscate(content);
      } catch {
        throw new Error("File format is invalid despite valid signature.");
      }
    } else {
      // Legacy path or plain JSON fallback
      console.warn("No valid HMAC found, attempting legacy read.");
      try {
        // Try deobfuscating the whole text (old .fkm format)
        jsonString = deobfuscate(text);
      } catch {
        // Try raw JSON (old .json format)
        // Leave jsonString as text
      }
    }

    const data: ExportData = JSON.parse(jsonString);

    // Version Check
    let importVersion = "0.0.0";
    if (data.version) {
      importVersion = String(data.version);
    }

    // Normalize simple numbers to semver if possible (e.g. "1" -> "1.0.0")
    if (!semver.valid(importVersion) && !isNaN(Number(importVersion))) {
      importVersion = `${importVersion}.0.0`;
    }

    if (!semver.valid(importVersion)) {
      throw new Error(`Invalid backup version: ${data.version}`);
    }

    if (semver.lt(importVersion, MIN_SUPPORTED_DATA_VERSION)) {
      throw new Error(
        `Backup version ${importVersion} is too old. minimum supported is ${MIN_SUPPORTED_DATA_VERSION}.`
      );
    }

    // Basic validation
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
    input.value = ""; // Reset
  } finally {
    isProcessing.value = false;
  }
}

const pendingImportData = ref<ExportData | null>(null);

async function executeImport(mode: "wipe" | "append") {
  if (!pendingImportData.value) return;

  // Deep clone and strip reactivity to prevent DataCloneError with Dexie
  // This explicitly fixes [object Array] could not be cloned when passing Proxy arrays
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

        // Import logic
        // For 'append', we use bulkAdd (fails on duplicate keys if keys are same).
        // If IDs are in the data (they are), and we are in 'append' mode:
        // - If we preserve IDs, collisions will error.
        // - "inserting as new rows" implies ignoring IDs.
        // So we strip IDs before adding.

        const stripIds = (items: any[]) => items.map(({ id, ...rest }) => rest);

        // Pantry
        // Has ingredientId. If we append, we might have unique constraints?
        // Schema: "++id, ingredientId, updatedAt"
        // No unique index on ingredientId defined in schema stores string!
        // But logic usually assumes 1 item per ingredient.
        // If append, duplicate ingredientId is possible in DB schema, but logic might break?
        // Let's assume user wants "new rows". We'll just strip IDs.
        // If they end up with 2 Vodka entries, that's what 'Append' means raw.
        // Deduplication is hard logic.

        // Wait, schema for metrics is "key". Cannot have duplicates.
        // For metrics, wipe or merge?
        // Append mode for metrics: sum values? or overwrite?
        // User said "inserting as new rows". Metrics are key-value.
        // Let's assume merge via overwrite or max?
        // Actually, if I export current state, it has metrics=10.
        // If I append to existing metrics=5. Should it be 15? Or 10?
        // Let's Skip metrics for 'append' if key exists? or update?
        // Let's just use `bulkPut` for metrics? (Overwrite).

        await db.pantryItems.bulkAdd(stripIds(data.pantryItems));
        await db.ledgerSessions.bulkAdd(stripIds(data.ledgerSessions));
        await db.ledgerEntries.bulkAdd(stripIds(data.ledgerEntries));
        await db.favorites.bulkAdd(stripIds(data.favorites)); // Might duplicate favorites for same cocktailId.
        await db.userAchievements.bulkAdd(stripIds(data.userAchievements));

        if (mode === "wipe") {
          await db.achievementMetrics.bulkAdd(data.achievementMetrics);
        } else {
          // Merge metrics: sum them?
          // Simple approach: overwrite with imported values if higher?
          // Or just put.
          // Let's use bulkPut for metrics to ensure no key collision errors.
          await db.achievementMetrics.bulkPut(data.achievementMetrics);
        }
      }
    );

    toastStore.addToast({
      title: "Import Complete",
      message: `Successfully imported ${
        mode === "wipe" ? "and replaced" : "and appended"
      } user data.`,
      type: "success",
    });

    // Refresh page to ensure stores reload?
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
    if (fileInput.value) fileInput.value.value = "";
  }
}

function cancelImport() {
  pendingImportData.value = null;
  if (fileInput.value) fileInput.value.value = "";
}
</script>

<template>
  <WaveLayout>
    <template #header>
      <div class="user-data-header">
        <h1 class="title">User Data Management</h1>
        <p class="subtitle">Export your progress or restore a backup.</p>
      </div>
    </template>

    <div class="user-data-content">
      <div class="card-grid">
        <!-- Export Card -->
        <div class="data-card">
          <div class="card-icon">📤</div>
          <h2 class="card-title">Export Data</h2>
          <p class="card-desc">
            Download a FKM file containing your Pantry, Favorites, Ledger
            History, and Achievements. You should do this periodically to
            prevent data loss.
          </p>
          <AppButton
            variant="primary"
            :loading="isProcessing"
            @click="handleExport"
          >
            Export Backup
          </AppButton>
        </div>

        <!-- Import Card -->
        <div class="data-card">
          <div class="card-icon">📥</div>
          <h2 class="card-title">Import Data</h2>
          <p class="card-desc">Restore from a previously exported FKM file.</p>

          <input
            ref="fileInput"
            type="file"
            accept=".fkm,.json"
            class="hidden-input"
            @change="handleImportFile"
          />

          <AppButton
            variant="secondary"
            :loading="isProcessing"
            @click="triggerImport"
          >
            Select File...
          </AppButton>
        </div>
      </div>

      <!-- Import Confirmation Modal/Panel -->
      <Transition name="fade">
        <div v-if="pendingImportData" class="import-confirm-overlay">
          <div class="import-confirm-modal">
            <h3>Import Options</h3>
            <p>
              Found data from
              <strong>{{
                new Date(pendingImportData.exportedAt).toLocaleDateString()
              }}</strong
              >. <br />Contains
              {{ pendingImportData.pantryItems.length }} pantry items,
              {{ pendingImportData.favorites.length }} favorites, etc.
            </p>

            <div class="actions">
              <div class="action-group">
                <AppButton
                  variant="coral"
                  class="action-btn"
                  @click="executeImport('wipe')"
                >
                  Wipe & Replace
                </AppButton>
                <span class="action-hint"
                  >Deletes current data first. Dangerous!</span
                >
              </div>

              <div class="action-group">
                <AppButton
                  variant="primary"
                  class="action-btn"
                  @click="executeImport('append')"
                >
                  Append (Merge)
                </AppButton>
                <span class="action-hint"
                  >Adds to current data. May create duplicates.</span
                >
              </div>
            </div>

            <button class="cancel-link" @click="cancelImport">Cancel</button>
          </div>
        </div>
      </Transition>
    </div>
  </WaveLayout>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.user-data-header {
  text-align: center;
  margin-bottom: $space-lg;

  .title {
    font-family: $font-display;
    font-size: $font-size-h1;
    color: $text-dark-primary;
    margin-bottom: $space-sm;
  }

  .subtitle {
    color: $text-dark-secondary;
  }
}

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

.data-card {
  background: $surface-dark-200;
  border-radius: $radius-lg;
  padding: $space-xl;
  text-align: center;
  border: 1px solid color.change(#fff, $alpha: 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-md;

  .card-icon {
    font-size: 3rem;
  }

  .card-title {
    font-family: $font-display;
    font-size: $font-size-h3;
    color: $text-light-primary;
    margin: 0;
  }

  .card-desc {
    color: $text-light-muted;
    font-size: $font-size-body-sm;
    margin-bottom: $space-md;
    flex: 1;
  }
}

.hidden-input {
  display: none;
}

.import-confirm-overlay {
  position: fixed;
  inset: 0;
  background: color.change(#000, $alpha: 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: $space-md;
}

.import-confirm-modal {
  background: $surface-light-100;
  color: $text-dark-primary;
  padding: $space-xl;
  border-radius: $radius-lg;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: $shadow-dark-lg;

  h3 {
    margin-top: 0;
    margin-bottom: $space-md;
    font-size: $font-size-h3;
  }

  p {
    color: $text-dark-secondary;
    margin-bottom: $space-xl;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: $space-lg;
    margin-bottom: $space-lg;

    @include tablet-up {
      flex-direction: row;
      justify-content: space-around;
    }
  }

  .action-group {
    display: flex;
    flex-direction: column;
    gap: $space-xs;
    align-items: center;
  }

  .action-hint {
    font-size: $font-size-tiny;
    color: $text-dark-muted;
  }

  .cancel-link {
    background: none;
    border: none;
    color: $text-dark-muted;
    text-decoration: underline;
    cursor: pointer;
    font-size: $font-size-body-sm;

    &:hover {
      color: $text-dark-primary;
    }
  }
}

// Transitions
.fade-enter-active,
.fade-leave-active {
  transition: opacity $transition-normal;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
