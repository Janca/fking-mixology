<script setup lang="ts">
/**
 * LedgerView - Session Manager with Statistics
 * Displays all drinking sessions with management controls and analytics
 */
import { ref, onMounted, computed } from "vue";
import { useLedgerStore } from "@/stores/ledger";
import WaveLayout from "@/components/layout/WaveLayout.vue";
import AppButton from "@/components/common/AppButton.vue";
import type { GlobalLedgerStats, LedgerSession } from "@/types";

// Components
import LedgerHeader from "./components/LedgerHeader.vue";
import LedgerSessionCard from "./components/LedgerSessionCard.vue";
import LedgerGlobalStats from "./components/LedgerGlobalStats.vue";
import LedgerEmptyState from "./components/LedgerEmptyState.vue";
import LedgerMergeDialog from "./components/LedgerMergeDialog.vue";
import LedgerRenameDialog from "./components/LedgerRenameDialog.vue";
import LedgerDeleteDialog from "./components/LedgerDeleteDialog.vue";

defineOptions({
  name: "LedgerView",
});

const ledgerStore = useLedgerStore();

const globalStats = ref<GlobalLedgerStats | null>(null);
const isLoadingStats = ref(false);
const viewMode = ref<"sessions" | "analytics">("sessions");

// Selection mode for merge
const isSelectMode = ref(false);
const selectedSessionIds = ref<number[]>([]);

// Dialog states
const showMergeDialog = ref(false);
const showRenameDialog = ref(false);
const showDeleteDialog = ref(false);
const sessionToRename = ref<LedgerSession | null>(null);
const sessionToDelete = ref<LedgerSession | null>(null);

const hasSessions = computed(() => ledgerStore.sessions.length > 0);
const canMerge = computed(() => selectedSessionIds.value.length >= 2);

async function loadData() {
  await ledgerStore.loadSessions();
  await loadGlobalStats();
}

async function loadGlobalStats() {
  isLoadingStats.value = true;
  try {
    globalStats.value = await ledgerStore.getGlobalStats();
  } finally {
    isLoadingStats.value = false;
  }
}

function toggleSelectMode() {
  isSelectMode.value = !isSelectMode.value;
  if (!isSelectMode.value) {
    selectedSessionIds.value = [];
  }
}

function toggleSessionSelection(sessionId: number) {
  const index = selectedSessionIds.value.indexOf(sessionId);
  if (index > -1) {
    selectedSessionIds.value.splice(index, 1);
  } else {
    selectedSessionIds.value.push(sessionId);
  }
}

function openRenameDialog(session: LedgerSession) {
  sessionToRename.value = session;
  showRenameDialog.value = true;
}

function openDeleteDialog(session: LedgerSession) {
  sessionToDelete.value = session;
  showDeleteDialog.value = true;
}

async function handleRename(newName: string) {
  if (sessionToRename.value) {
    await ledgerStore.renameSession(sessionToRename.value.id!, newName);
    showRenameDialog.value = false;
    sessionToRename.value = null;
  }
}

async function handleDelete() {
  if (sessionToDelete.value) {
    await ledgerStore.deleteSession(sessionToDelete.value.id!);
    await loadGlobalStats();
    showDeleteDialog.value = false;
    sessionToDelete.value = null;
  }
}

async function handleMerge(targetName: string) {
  await ledgerStore.mergeSessions(selectedSessionIds.value, targetName);
  await loadGlobalStats();
  showMergeDialog.value = false;
  selectedSessionIds.value = [];
  isSelectMode.value = false;
}

async function handleResume(sessionId: number) {
  await ledgerStore.resumeSession(sessionId);
}

async function handleEnd(sessionId: number) {
  await ledgerStore.endSession(sessionId);
}

onMounted(loadData);
</script>

<template>
  <WaveLayout title="Drink Ledger" icon="📒" subtitle="Track your cocktail sessions">
    <template #header-content>
      <LedgerHeader :view-mode="viewMode" :is-select-mode="isSelectMode" :selected-count="selectedSessionIds.length"
        @toggle-view="
          viewMode = viewMode === 'sessions' ? 'analytics' : 'sessions'
          " @toggle-select="toggleSelectMode" @open-merge="showMergeDialog = true" />
    </template>

    <div class="ledger-content">
      <!-- Analytics View -->
      <Transition name="fade-slide" mode="out-in">
        <LedgerGlobalStats v-if="viewMode === 'analytics' && globalStats" key="analytics" :stats="globalStats"
          :is-loading="isLoadingStats" />

        <!-- Sessions List View -->
        <div v-else-if="hasSessions" key="sessions" class="sessions-list">
          <TransitionGroup name="session-list" tag="div" class="sessions-grid">
            <LedgerSessionCard v-for="session in ledgerStore.sortedSessions" :key="session.id" :session="session"
              :is-select-mode="isSelectMode" :is-selected="selectedSessionIds.includes(session.id!)"
              :is-active="ledgerStore.activeSession?.id === session.id" @select="toggleSessionSelection(session.id!)"
              @rename="openRenameDialog(session)" @delete="openDeleteDialog(session)"
              @resume="handleResume(session.id!)" @end="handleEnd(session.id!)"
              @view="$router.push(`/ledger/${session.id}`)" />
          </TransitionGroup>
        </div>

        <!-- Empty State -->
        <LedgerEmptyState v-else key="empty" />
      </Transition>
    </div>

    <!-- Floating Action for Merge (when selecting) -->
    <Transition name="pop-up">
      <div v-if="isSelectMode && canMerge" class="merge-fab">
        <AppButton variant="teal" size="lg" rounded @click="showMergeDialog = true">
          Merge {{ selectedSessionIds.length }} Sessions
        </AppButton>
      </div>
    </Transition>

    <!-- Dialogs -->
    <LedgerMergeDialog :show="showMergeDialog" :session-count="selectedSessionIds.length"
      @close="showMergeDialog = false" @confirm="handleMerge" />

    <LedgerRenameDialog :show="showRenameDialog" :session="sessionToRename" @close="showRenameDialog = false"
      @confirm="handleRename" />

    <LedgerDeleteDialog :show="showDeleteDialog" :session="sessionToDelete" @close="showDeleteDialog = false"
      @confirm="handleDelete" />
  </WaveLayout>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.ledger-content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 $space-md $space-2xl;
}

.sessions-list {
  width: 100%;
}

.sessions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: $space-lg;
  width: 100%;

  @include mobile-only {
    grid-template-columns: 1fr;
    gap: $space-md;
  }
}

.merge-fab {
  position: fixed;
  bottom: $space-xl;
  left: 50%;
  transform: translateX(-50%);
  z-index: $z-sticky;
}

// Transitions
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.session-list-move,
.session-list-enter-active,
.session-list-leave-active {
  transition: all 0.4s $spring-bounce;
}

.session-list-enter-from,
.session-list-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.session-list-leave-active {
  position: absolute;
}

.pop-up-enter-active,
.pop-up-leave-active {
  transition: all 0.3s $spring-bounce;
}

.pop-up-enter-from,
.pop-up-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px) scale(0.9);
}
</style>
