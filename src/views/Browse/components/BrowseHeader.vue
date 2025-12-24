<script setup lang="ts">
import AppInput from "@/components/common/AppInput.vue";
import AppEmoji from "@/components/common/AppEmoji.vue";

defineProps<{
  // search query
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();
</script>

<template>
  <div>
    <div class="browse-header">
      <AppEmoji class="browse-header__emoji">📚</AppEmoji>
      <h1 class="browse-header__title">Recipe Book</h1>
      <p class="browse-header__subtitle">Explore our collection of recipes</p>
    </div>

    <!-- Category Search -->
    <div class="category-search">
      <AppInput
        :model-value="modelValue"
        placeholder="Search within category..."
        variant="light"
        size="md"
        clearable
        @update:model-value="emit('update:modelValue', $event)"
      >
        <template #prefix>
          <AppEmoji>🔍</AppEmoji>
        </template>
      </AppInput>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.browse-header {
  text-align: center;
  margin-bottom: $space-xl;
  padding: 0 $space-md;

  &__emoji {
    font-size: 3rem;
    margin-bottom: $space-md;
  }

  &__title {
    font-family: $font-display;
    font-size: $font-size-display;
    font-weight: $font-weight-extrabold;
    color: $text-dark-primary;
    letter-spacing: -0.03em;
    margin-bottom: $space-xs;

    @include mobile-only {
      font-size: $font-size-h1;
    }
  }

  &__subtitle {
    font-size: $font-size-body;
    color: $text-dark-muted;
  }
}

.category-search {
  max-width: 500px;
  width: 100%;
  margin: 0 auto $space-lg;
  padding: 0 $space-md;
}
</style>
