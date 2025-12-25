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
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.category-search {
  max-width: 500px;
  width: 100%;
  margin: 0 auto $space-lg;
  padding: 0 $space-md;
}
</style>
