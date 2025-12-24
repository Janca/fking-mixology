<script setup lang="ts">
/**
 * LedgerResumeCard - Shows on landing page when there's a previous session to resume
 */
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useLedgerStore } from "@/stores/ledger";
import AppButton from "@/components/common/AppButton.vue";
import type { LedgerSession } from "@/types";

const router = useRouter();
const ledgerStore = useLedgerStore();

const previousSession = ref<LedgerSession | null>(null);
const isVisible = ref(false);
const isDismissed = ref(false);

async function loadPreviousSession() {
  await ledgerStore.loadSessions();

  // Only show if there's a previous session that isn't currently active
  if (ledgerStore.hasPreviousSession && !ledgerStore.hasActiveSession) {
    previousSession.value = await ledgerStore.getPreviousSession();
    if (previousSession.value) {
      // Slight delay for animation
      setTimeout(() => {
        isVisible.value = true;
      }, 300);
    }
  }
}

function formatSessionInfo(session: LedgerSession): string {
  const date = new Date(session.updatedAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago • ${
      session.totalDrinks
    } drinks`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago • ${
      session.totalDrinks
    } drinks`;
  } else {
    return `Just now • ${session.totalDrinks} drinks`;
  }
}

async function handleResume() {
  if (previousSession.value) {
    await ledgerStore.resumeSession(previousSession.value.id!);
  }
  isVisible.value = false;
}

async function handleDismiss() {
  // End the previous session so the next drink creates a new one
  if (previousSession.value) {
    await ledgerStore.endSession(previousSession.value.id!);
  }
  isDismissed.value = true;
  isVisible.value = false;
}

function goToLedger() {
  router.push("/ledger");
}

onMounted(loadPreviousSession);
</script>

<template>
  <Transition name="slide-down">
    <div
      v-if="isVisible && !isDismissed && previousSession"
      class="resume-card"
    >
      <div class="resume-content">
        <div class="resume-icon">📒</div>
        <div class="resume-info">
          <h4 class="resume-title">Continue your session?</h4>
          <p class="resume-meta">
            {{ previousSession.name }} •
            {{ formatSessionInfo(previousSession) }}
          </p>
        </div>
      </div>
      <div class="resume-actions">
        <button class="dismiss-btn" @click="handleDismiss">✕</button>
        <AppButton variant="dark" size="sm" rounded @click="goToLedger">
          View All
        </AppButton>
        <AppButton variant="teal" size="sm" rounded @click="handleResume">
          Resume
        </AppButton>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
@use "@/styles/variables" as *;

.resume-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-md;
  background: $surface-light-100;
  border: 2px solid $accent-teal;
  border-radius: $radius-xl;
  padding: $space-md $space-lg;
  margin: 0 $space-lg $space-lg;
  max-width: 800px;
  margin-inline: auto;
  box-shadow: $shadow-light-raised-sm, $glow-teal;

  @include mobile-only {
    flex-direction: column;
    align-items: flex-start;
    margin: 0 $space-md $space-md;
    padding: $space-md;
  }
}

.resume-content {
  display: flex;
  align-items: center;
  gap: $space-md;
  flex: 1;
  min-width: 0;
}

.resume-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.resume-info {
  min-width: 0;
}

.resume-title {
  font-family: $font-display;
  font-size: $font-size-body-lg;
  font-weight: $font-weight-bold;
  color: $text-dark-primary;
  margin-bottom: 2px;
}

.resume-meta {
  font-size: $font-size-body-sm;
  color: $text-dark-secondary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @include mobile-only {
    white-space: normal;
  }
}

.resume-actions {
  display: flex;
  align-items: center;
  gap: $space-sm;
  flex-shrink: 0;

  @include mobile-only {
    width: 100%;
    justify-content: flex-end;
    padding-top: $space-sm;
    border-top: 1px solid $surface-light-300;
  }
}

.dismiss-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: $radius-full;
  color: $text-dark-muted;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    background: $surface-light-300;
    color: $text-dark-primary;
  }
}

// Transitions
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.4s $spring-bounce;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
