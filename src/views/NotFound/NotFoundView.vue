<script setup lang="ts">
import { useRouter } from "vue-router";
import AppButton from "@/components/common/AppButton.vue";
import WaveLayout from "@/components/layout/WaveLayout.vue";

const router = useRouter();

function goHome() {
  router.push("/");
}
</script>

<template>
  <WaveLayout>
    <template #header>
      <div class="not-found-container">
        <div class="dizzy-emoji">😵‍💫</div>
        <h1 class="title">404: Too Drunk to Function?</h1>
        <p class="subtitle">
          Looks like you've stumbled into the wrong bar. Let's get you some
          water and a ride home.
        </p>
        <AppButton variant="primary" size="lg" @click="goHome">
          Go Home (You're Drunk)
        </AppButton>
      </div>
    </template>

    <div class="dark-content">
      <div class="spilled-drink">🍸</div>
    </div>
  </WaveLayout>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.not-found-container {
  text-align: center;
  padding: $space-3xl $space-lg;
  max-width: 600px;
  margin: 0 auto;
}

.dizzy-emoji {
  font-size: 6rem;
  margin-bottom: $space-lg;
  animation: wobble 3s ease-in-out infinite;
}

.title {
  font-family: $font-display;
  font-size: $font-size-display;
  font-weight: $font-weight-extrabold;
  color: $text-dark-primary;
  margin-bottom: $space-md;
  line-height: 1.1;

  @include mobile-only {
    font-size: $font-size-h1;
  }
}

.subtitle {
  font-size: $font-size-body-lg;
  color: $text-dark-muted;
  margin-bottom: $space-2xl;
  line-height: 1.6;
}

.dark-content {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: $space-3xl;
  min-height: 300px;
}

.spilled-drink {
  font-size: 8rem;
  transform: rotate(90deg);
  opacity: 0.3;
  filter: blur(2px);
}

@keyframes wobble {
  0%,
  100% {
    transform: rotate(-10deg) translateX(-5px);
  }
  50% {
    transform: rotate(10deg) translateX(5px);
  }
}
</style>
