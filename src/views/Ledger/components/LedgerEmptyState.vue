<script setup lang="ts">
/**
 * LedgerEmptyState - Shown when no sessions exist
 */
import { useRouter } from "vue-router";
import AppButton from "@/components/common/AppButton.vue";

const router = useRouter();

function goHome() {
  router.push("/");
}
</script>

<template>
  <div class="empty-state">
    <div class="empty-icon">📒</div>
    <h2 class="empty-title">No Sessions Yet</h2>
    <p class="empty-text">
      Your drink ledger is empty. When you complete a cocktail in prep mode, it
      will automatically be recorded here!
    </p>
    <AppButton variant="primary" size="lg" rounded @click="goHome">
      Start Mixing
    </AppButton>
  </div>
</template>

<style lang="scss" scoped>
@use "@/styles/variables" as *;

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: $space-4xl $space-lg;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: $space-lg;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.empty-title {
  font-family: $font-display;
  font-size: $font-size-h1;
  font-weight: $font-weight-bold;
  color: $text-light-primary;
  margin-bottom: $space-sm;
}

.empty-text {
  font-size: $font-size-body-lg;
  color: $text-light-secondary;
  max-width: 400px;
  margin-bottom: $space-xl;
  line-height: $line-height-relaxed;
}
</style>
