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
        <a
          href="https://github.com/Janca/fking-mixology"
          target="_blank"
          rel="noopener"
          >GitHub</a
        >
        <span class="separator">•</span>
        <a href="https://www.thecocktaildb.com/" target="_blank" rel="noopener"
          >TheCocktailDB</a
        >
        <span class="separator">•</span>
        <a href="https://antigravity.google" target="_blank" rel="noopener"
          >Google Antigravity</a
        >
        <span class="separator">•</span>
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
        &copy; {{ currentYear }} Mixology Matcher
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.app-footer {
  margin-top: $space-3xl;
  border-top: 1px solid color.change(#fff, $alpha: 0.05);
  padding-top: $space-xl;
  padding-bottom: $space-lg;
  color: $text-light-muted;
  opacity: 0.7;
  transition: opacity $transition-normal;

  &:hover {
    opacity: 1;
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $space-md;
    text-align: center;
  }

  &__links {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: $space-sm;
    font-size: $font-size-body-sm;

    a,
    .footer-link-btn {
      color: $text-light-secondary;
      text-decoration: none;
      transition: color $transition-fast;
      background: none;
      border: none;
      padding: 0;
      font: inherit;
      cursor: pointer;

      &:hover {
        color: $accent-gold;
        text-decoration: underline;
      }
    }

    .separator {
      color: $text-light-muted;
      opacity: 0.5;
    }
  }

  &__disclaimer {
    font-size: $font-size-tiny;
    max-width: 400px;
    padding: $space-xs $space-md;
    background: color.change(#fff, $alpha: 0.03);
    border-radius: $radius-md;
    border: 1px solid color.change(#fff, $alpha: 0.05);

    p {
      display: flex;
      align-items: center;
      justify-content: left;
      text-align: left;
      gap: $space-xs;
      margin: 0;
      line-height: 1.4;
    }

    .icon {
      font-size: 14px;
      font-weight: 800;
      text-transform: uppercase;
      color: $accent-warning;
    }
  }

  &__copy {
    font-size: $font-size-tiny;
    opacity: 0.5;
  }
}
</style>
