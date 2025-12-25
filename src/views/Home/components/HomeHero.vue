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
@use "sass:color";
@use "@/styles/variables" as *;

.hero {
  text-align: center;
  margin-bottom: $space-xl;
  padding: 0 $space-md;

  &__icon {
    font-size: 4rem;
    margin-bottom: $space-md;
    animation: float-gentle 3s ease-in-out infinite;
    display: inline-block;
    filter: drop-shadow(0 4px 12px color.change($accent-coral, $alpha: 0.2));

    @include mobile-only {
      font-size: 3rem;
    }
  }

  &__title {
    font-family: $font-display;
    font-size: $font-size-display;
    font-weight: $font-weight-extrabold;
    color: $text-dark-primary;
    margin-bottom: $space-sm;
    letter-spacing: -0.03em;
    line-height: 1.1;

    @include tablet-up {
      font-size: $font-size-hero;
    }

    @include mobile-only {
      font-size: $font-size-h1;
    }

    .text-gradient {
      background: linear-gradient(135deg,
          $accent-coral 0%,
          $accent-coral-dark 50%,
          $accent-gold 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  &__subtitle {
    font-size: $font-size-body-lg;
    color: $text-dark-muted;
    max-width: 400px;
    margin: 0 auto;
    line-height: 1.5;

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
