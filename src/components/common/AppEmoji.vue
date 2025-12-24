<script setup lang="ts">
/**
 * AppEmoji - Consistent Emoji Formatting
 * Uses Noto Color Emoji to ensure consistent cross-platform emoji rendering.
 */
defineOptions({
  name: "AppEmoji",
});
</script>

<template>
  <span class="app-emoji">
    <slot />
  </span>
</template>

<style scoped>
.app-emoji {
  display: inline-block;
  font-family: "Noto Color Emoji", sans-serif;
  font-weight: 400;
  font-style: normal;
  /* Ensure emojis don't break line-heights awkwardly */
  line-height: 1;
  vertical-align: middle;
}
</style>
