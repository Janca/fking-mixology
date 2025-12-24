<script setup lang="ts">
// Static hero
import AppEmoji from "@/components/common/AppEmoji.vue";
</script>

<template>
  <div class="hero">
    <AppEmoji class="hero__icon">🍹</AppEmoji>
    <h1 class="hero__title">
      What can you <span class="text-gradient">make</span>?
    </h1>
    <p class="hero__subtitle">
      Use the search above to add ingredients from your bar
    </p>
  </div>
</template>

<style lang="scss" scoped>
@use "@/styles/variables" as *;

.hero {
  text-align: center;
  margin-bottom: $space-lg;
  padding: 0 $space-md;

  &__icon {
    font-size: 3.5rem;
    margin-bottom: $space-md;
    animation: float-gentle 3s ease-in-out infinite;
  }

  &__title {
    font-family: $font-display;
    font-size: $font-size-display;
    font-weight: $font-weight-extrabold;
    color: $text-dark-primary;
    margin-bottom: $space-sm;
    letter-spacing: -0.03em;

    @include mobile-only {
      font-size: $font-size-h1;
    }
  }

  &__subtitle {
    font-size: $font-size-body-lg;
    color: $text-dark-muted;

    @include mobile-only {
      font-size: $font-size-body;
    }
  }
}

@keyframes float-gentle {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
