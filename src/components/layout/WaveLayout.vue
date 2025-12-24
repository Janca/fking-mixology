<script setup lang="ts">
/**
 * WaveLayout.vue
 * Reusable layout component providing a light header section,
 * an animated wave divider, and a dark content section.
 */

defineProps<{
  /** Optional class for the header section */
  headerClass?: string;
  /** Optional class for the content section */
  contentClass?: string;
}>();
</script>

<template>
  <div class="wave-layout">
    <!-- Light Header Section -->
    <section class="wave-layout__header" :class="headerClass">
      <slot name="header"></slot>

      <!-- Animated Layered Wave Divider -->
      <div class="wave-divider">
        <svg
          class="wave wave--back"
          viewBox="0 0 4800 150"
          preserveAspectRatio="none"
        >
          <path
            class="wave__path wave__path--silver"
            d="M0,75 Q300,120 600,75 T1200,75 T1800,75 T2400,75 T3000,75 T3600,75 T4200,75 T4800,75 L4800,150 L0,150 Z"
          />
        </svg>
        <svg
          class="wave wave--middle"
          viewBox="0 0 4800 150"
          preserveAspectRatio="none"
        >
          <path
            class="wave__path wave__path--gray"
            d="M0,85 Q300,115 600,85 T1200,85 T1800,85 T2400,85 T3000,85 T3600,85 T4200,85 T4800,85 L4800,150 L0,150 Z"
          />
        </svg>
        <svg
          class="wave wave--front"
          viewBox="0 0 4800 150"
          preserveAspectRatio="none"
        >
          <path
            class="wave__path wave__path--dark"
            d="M0,100 Q300,130 600,100 T1200,100 T1800,100 T2400,100 T3000,100 T3600,100 T4200,100 T4800,100 L4800,150 L0,150 Z"
          />
        </svg>
      </div>
    </section>

    <!-- Dark Content Section -->
    <section class="wave-layout__content" :class="contentClass">
      <slot></slot>
    </section>
  </div>
</template>

<style lang="scss" scoped>
@use "@/styles/variables" as *;

.wave-layout {
  flex: 1;
  display: flex;
  flex-direction: column;

  overflow: hidden;

  &__header {
    position: relative;
    background: $gradient-light;
    padding: 80px $space-sm $space-xl;
    padding-bottom: 200px; // Space for wave

    @include desktop-up {
      padding: 120px $space-xl $space-2xl;
      padding-bottom: 240px;
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
</style>
