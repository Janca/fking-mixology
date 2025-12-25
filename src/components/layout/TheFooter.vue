<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();
const currentYear = new Date().getFullYear();

function goToUserData() {
  router.push({ name: "user-data" });
}
</script>

<template>
  <footer class="app-footer">
    <div class="app-footer__content">
      <div class="app-footer__links">
        <a href="https://github.com/Janca/fking-mixology" target="_blank" rel="noopener">GitHub</a>
        <a href="https://www.thecocktaildb.com/" target="_blank" rel="noopener">TheCocktailDB</a>
        <a href="https://antigravity.google" target="_blank" rel="noopener">Google Antigravity</a>
        <button class="footer-link-btn" @click="goToUserData">User Data</button>
      </div>

      <div class="app-footer__disclaimer">
        <p>
          <span class="material-icons-round icon">info</span>
          Data is stored locally in your browser. Clearing your cache will
          result in data loss.
        </p>
      </div>

      <div class="app-footer__copy">
        &copy; {{ currentYear }} fking mixology
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.app-footer {
  margin-top: $space-3xl;
  border-top: 1px solid color.change(#fff, $alpha: 0.08);
  padding-top: $space-xl;
  padding-bottom: $space-xl;
  color: $text-light-muted;
  transition: opacity $transition-normal;

  @include mobile-only {
    padding-left: $space-md;
    padding-right: $space-md;
    padding-bottom: $space-2xl;
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $space-lg;
    text-align: center;
    max-width: 600px;
    margin: 0 auto;
  }

  &__links {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: $space-md $space-lg;
    font-size: $font-size-body-sm;

    a,
    .footer-link-btn {
      color: $text-light-secondary;
      text-decoration: none;
      transition: all $transition-normal;
      background: none;
      border: none;
      padding: $space-xs $space-sm;
      font: inherit;
      cursor: pointer;
      border-radius: $radius-sm;
      position: relative;

      // Animated underline
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 0;
        height: 2px;
        background: $gradient-gold;
        transition: all $transition-normal;
        transform: translateX(-50%);
        border-radius: $radius-full;
      }

      &:hover {
        color: $accent-gold;

        &::after {
          width: calc(100% - #{$space-sm});
        }
      }

      &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 2px color.change($accent-gold, $alpha: 0.4);
      }
    }
  }

  &__disclaimer {
    font-size: $font-size-caption;
    max-width: 420px;
    padding: $space-sm $space-md;
    background: linear-gradient(135deg,
        color.change(#fff, $alpha: 0.04) 0%,
        color.change(#fff, $alpha: 0.02) 100%);
    border-radius: $radius-lg;
    border: 1px solid color.change(#fff, $alpha: 0.06);
    backdrop-filter: blur(8px);

    p {
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: $space-sm;
      margin: 0;
      line-height: 1.5;
      color: $text-light-secondary;
    }

    .icon {
      font-size: 16px;
      font-weight: 700;
      color: $accent-warning;
      flex-shrink: 0;
    }
  }

  &__copy {
    font-size: $font-size-tiny;
    color: $text-light-muted;
    opacity: 0.6;
    letter-spacing: 0.02em;
  }
}
</style>
