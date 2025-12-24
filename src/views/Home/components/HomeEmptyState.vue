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
@use "@/styles/variables" as *;

.empty-state {
  text-align: center;
  padding: $space-3xl $space-xl;
  color: $text-light-muted;

  &__illustration {
    position: relative;
    width: 120px;
    height: 120px;
    margin: 0 auto $space-xl;
    display: flex;
    align-items: center;
    justify-content: center;

    &::before {
      content: ""; // Circle bg
      position: absolute;
      inset: 0;
      background: rgba(white, 0.05);
      border-radius: $radius-full;
    }
  }

  &__glass {
    font-size: 4rem;
    position: relative;
    z-index: 1;
  }

  &__bubbles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .bubble {
    position: absolute;
    color: rgba($accent-teal, 0.5);
    font-size: 10px;
    animation: bubble-float 4s infinite ease-in;

    &--1 {
      left: 30%;
      top: 60%;
      animation-delay: 0s;
    }
    &--2 {
      left: 60%;
      top: 50%;
      animation-delay: 1.5s;
    }
    &--3 {
      left: 45%;
      top: 70%;
      animation-delay: 2.5s;
    }
  }

  &__title {
    font-family: $font-display;
    font-size: $font-size-h2;
    font-weight: $font-weight-bold;
    color: $text-light-primary;
    margin-bottom: $space-md;
  }

  &__text {
    font-size: $font-size-body-lg;
    max-width: 400px;
    margin: 0 auto $space-xl;
    line-height: 1.6;
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
