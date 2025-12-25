<script setup lang="ts">
/**
 * WaveLayout.vue
 * Reusable layout component providing a light header section,
 * an animated wave divider, and a dark content section.
 */

import { useSlots, computed } from "vue";
import AppEmoji from "@/components/common/AppEmoji.vue";
import TheFooter from "@/components/layout/TheFooter.vue";

const props = defineProps<{
  /** Optional class for the header section */
  headerClass?: string;
  /** Optional class for the content section */
  contentClass?: string;
  /** Page title for default header */
  title?: string;
  /** Emoji icon for default header */
  icon?: string;
  /** Subtitle text for default header */
  subtitle?: string;
}>();

const slots = useSlots();

const hasHeaderTitleContent = computed(() => slots['header-icon'] || props.icon || slots['header-title'] || props.title)
const hasHeaderSubtitleContent = computed(() => slots['header-subtitle'] || props.subtitle)
</script>

<template>
  <div class="wave-layout">
    <!-- Light Header Section -->
    <section class="wave-layout__header" :class="headerClass">
      <!-- Default Page Header (when props provided and no slot override) -->
      <!-- <div v-if="!slots.header && title" class="page-header">
        <AppEmoji v-if="icon" class="page-header__emoji">{{ icon }}</AppEmoji>
        <h1 class="page-header__title">{{ title }}</h1>
        <p v-if="subtitle" class="page-header__subtitle">{{ subtitle }}</p>
      </div> -->

      <!-- Custom Header Slot -->
      <slot name="header">
        <div v-if="hasHeaderTitleContent || hasHeaderSubtitleContent || slots['header-content']" class="page-header">
          <div v-if="hasHeaderTitleContent" class="page-header__section">
            <div v-if="hasHeaderTitleContent" class="page-header__title-wrapper">
              <slot name="header-icon">
                <template v-if="slots['header-icon'] || icon">
                  <AppEmoji v-if="icon" class="page-header__emoji" v-text="icon" />
                </template>
              </slot>
              <template v-if="slots['header-title'] || title">
                <span class="page-header__title">
                  <slot name="header-title">
                    <h1 v-text="title" />
                  </slot>
                </span>
              </template>
            </div>
            <template v-if="hasHeaderSubtitleContent">
              <p class="page-header__subtitle">
                <slot name="header-subtitle">
                  {{ subtitle }}
                </slot>
              </p>
            </template>
          </div>
          <div v-if="slots['header-content']" class="page-header__section">
            <slot name="header-content" />
          </div>
        </div>
      </slot>

      <!-- Animated Layered Wave Divider -->
      <div class="wave-divider">
        <svg class="wave wave--back" viewBox="0 0 4800 150" preserveAspectRatio="none">
          <path class="wave__path wave__path--silver"
            d="M0,75 Q300,120 600,75 T1200,75 T1800,75 T2400,75 T3000,75 T3600,75 T4200,75 T4800,75 L4800,150 L0,150 Z" />
        </svg>
        <svg class="wave wave--middle" viewBox="0 0 4800 150" preserveAspectRatio="none">
          <path class="wave__path wave__path--gray"
            d="M0,85 Q300,115 600,85 T1200,85 T1800,85 T2400,85 T3000,85 T3600,85 T4200,85 T4800,85 L4800,150 L0,150 Z" />
        </svg>
        <svg class="wave wave--front" viewBox="0 0 4800 150" preserveAspectRatio="none">
          <path class="wave__path wave__path--dark"
            d="M0,100 Q300,130 600,100 T1200,100 T1800,100 T2400,100 T3000,100 T3600,100 T4200,100 T4800,100 L4800,150 L0,150 Z" />
        </svg>
      </div>
    </section>

    <!-- Dark Content Section -->
    <section class="wave-layout__content" :class="contentClass">
      <slot></slot>

      <slot name="footer">
        <TheFooter />
      </slot>
    </section>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.wave-layout {
  flex: 1;
  display: flex;
  flex-direction: column;

  overflow: hidden;

  &__header {
    position: relative;
    background: $surface-light-200;
    padding: 120px $space-sm $space-xl;
    padding-bottom: 120px; // Space for wave

    @include desktop-up {
      padding: 120px $space-xl $space-2xl;
      padding-bottom: 200px;
    }
  }

  &__content {
    flex: 1;
    // Match the darkest wave color ($surface-dark-400 is #1c1f35 in variables)
    // We hardcode it here to ensure perfect seam match with the SVG fill
    background: #1c1f35;
    padding: $space-xl $space-sm $space-2xl;
    min-height: 400px;
    // Critical fix for seam: overlap slightly to cover sub-pixel rendering gaps
    margin-top: -1px;
    position: relative;
    z-index: 1; // Ensure content sits on top if needed

    @include desktop-up {
      padding: $space-3xl $space-xl;
    }
  }
}

// Default Page Header
.page-header {
  display: flex;
  flex-direction: column;

  text-align: center;
  max-width: 1200px;
  margin: 0 auto $space-xl;
  padding: 0 $space-md;

  gap: $space-2xl;

  &__section {
    display: flex;
    flex-direction: column;
    flex: 1 1 100%;
    gap: $space-xs;
    //margin-bottom: $space-lg;
  }

  &__title-wrapper {
    display: flex;
    flex-flow: row nowrap;
    gap: $space-sm;
    margin: 0 auto;
    align-items: center;
    justify-content: center;
  }

  &__emoji {
    font-size: 3rem;
    display: block;
    animation: float-gentle 4s ease-in-out infinite;
  }

  &__title {
    font-family: $font-display;

    >h1 {
      font-size: $font-size-display;
      font-weight: $font-weight-extrabold;
      color: $text-dark-primary;
      letter-spacing: -0.03em;
      margin: 0;
    }

    @include mobile-only {
      >h1 {
        font-size: $font-size-h1;
      }
    }
  }

  &__subtitle {
    font-size: $font-size-body-lg;
    color: $text-dark-muted;
  }
}

// Wave Animation
.wave-divider {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 150px;
  overflow: hidden;
  pointer-events: none; // Allow clicks to pass through if necessary closer to top

  @include desktop-up {
    height: 180px;
  }
}

.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  min-width: 2400px; // Prevent waves from compressing too much on small screens
  height: 100%;
  max-width: none; // Override global responsive max-width to allow seamless animation

  &--back {
    animation: wave-drift 25s linear infinite;
    opacity: 0.5;
  }

  &--middle {
    animation: wave-drift 18s linear infinite;
    animation-delay: -5s;
    opacity: 0.7;
  }

  &--front {
    animation: wave-drift 12s linear infinite;
    animation-delay: -8s;
  }

  &__path {
    &--silver {
      fill: #c8d1e5;
    }

    &--gray {
      fill: #3d4260;
    }

    &--dark {
      // Must match .wave-layout__content background
      fill: #1c1f35;
    }
  }
}

// Wave drift animation
@keyframes wave-drift {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(-50%);
  }
}

@keyframes wave-drift {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(-50%);
  }
}

@keyframes float-gentle {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-6px);
  }
}
</style>
