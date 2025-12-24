<script setup lang="ts">
/**
 * CategoryView - Category Detail Page
 */
import { useRoute } from "vue-router";

const route = useRoute();
</script>

<template>
  <main class="category-view">
    <h1>{{ route.params.slug }}</h1>
    <p>This view will display cocktails from a specific category.</p>
  </main>
</template>

<style lang="scss" scoped>
@use "@/styles/variables" as *;

.category-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $space-xl;
  text-align: center;
  background: $surface-light-200;

  h1 {
    margin-bottom: $space-md;
    color: $text-dark-primary;
  }

  p {
    color: $text-dark-muted;
  }
}
</style>
