<script setup lang="ts">
import { useRouter } from "vue-router";
import AppEmoji from "@/components/common/AppEmoji.vue";
import AppButton from "@/components/common/AppButton.vue";

const router = useRouter();
</script>

<template>
  <div class="empty-state">
    <div class="empty-state__illustration">
      <AppEmoji class="empty-state__glass">🍸</AppEmoji>
      <div class="empty-state__bubbles">
        <span class="bubble bubble--1">○</span>
        <span class="bubble bubble--2">○</span>
        <span class="bubble bubble--3">○</span>
      </div>
    </div>
    <h2 class="empty-state__title">Your bar is empty</h2>
    <p class="empty-state__text">
      Search for ingredients above or stock your pantry to discover cocktails
    </p>
    <AppButton variant="dark" @click="router.push('/pantry')">
      Stock Your Pantry
    </AppButton>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.empty-state {
  text-align: center;
  padding: $space-3xl $space-xl;
  color: $text-light-muted;

  &__illustration {
    position: relative;
    width: 140px;
    height: 140px;
    margin: 0 auto $space-2xl;
    display: flex;
    align-items: center;
    justify-content: center;

    &::before {
      content: ""; // Circle bg
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg,
          color.change(white, $alpha: 0.08) 0%,
          color.change(white, $alpha: 0.03) 100%);
      border-radius: $radius-full;
      border: 1px solid color.change(white, $alpha: 0.1);
    }

    &::after {
      content: "";
      position: absolute;
      inset: -10px;
      background: radial-gradient(circle at center,
          color.change($accent-coral, $alpha: 0.1) 0%,
          transparent 70%);
      border-radius: $radius-full;
      animation: pulse-glow 3s ease-in-out infinite;
    }
  }

  &__glass {
    font-size: 4.5rem;
    position: relative;
    z-index: 1;
    filter: drop-shadow(0 8px 24px color.change(#000, $alpha: 0.2));
  }

  &__bubbles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 2;
  }

  .bubble {
    position: absolute;
    color: color.change($surface-light-100, $alpha: 0.6);
    font-size: 8px;
    animation: bubble-float 4s infinite ease-in;

    &--1 {
      left: 30%;
      top: 60%;
      animation-delay: 0s;
    }

    &--2 {
      left: 65%;
      top: 55%;
      animation-delay: 1.5s;
      font-size: 10px;
    }

    &--3 {
      left: 48%;
      top: 65%;
      animation-delay: 2.5s;
      font-size: 6px;
    }
  }

  &__title {
    font-family: $font-display;
    font-size: $font-size-h2;
    font-weight: $font-weight-bold;
    color: $text-light-primary;
    margin-bottom: $space-md;
    letter-spacing: -0.02em;
  }

  &__text {
    font-size: $font-size-body-lg;
    max-width: 420px;
    margin: 0 auto $space-xl;
    line-height: 1.6;
    color: $text-light-secondary;
  }
}

@keyframes pulse-glow {

  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(1.05);
  }
}

@keyframes bubble-float {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0;
  }

  20% {
    opacity: 1;
  }

  100% {
    transform: translateY(-40px) scale(1.5);
    opacity: 0;
  }
}
</style>
