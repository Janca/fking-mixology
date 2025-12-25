<script setup lang="ts">
/**
 * UserDataImportCard - Import functionality card
 */
import { ref } from "vue";
import AppCard from "@/components/common/AppCard.vue";
import AppButton from "@/components/common/AppButton.vue";
import AppEmoji from "@/components/common/AppEmoji.vue";

defineProps<{
    /** Whether import is in progress */
    isProcessing: boolean;
}>();

const emit = defineEmits<{
    (e: "selectFile", file: File): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);

function triggerImport() {
    fileInput.value?.click();
}

function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
        emit("selectFile", input.files[0]);
    }
}

// Expose the file input element for parent to reset
defineExpose({ fileInput });
</script>

<template>
    <AppCard variant="dark" padding="xl">
        <div class="import-card">
            <AppEmoji class="import-card__icon">📥</AppEmoji>
            <h2 class="import-card__title">Import Data</h2>
            <p class="import-card__desc">Restore from a previously exported FKM file.</p>

            <input ref="fileInput" type="file" accept=".fkm,.json" class="import-card__hidden-input"
                @change="handleFileChange" />

            <AppButton variant="secondary" :loading="isProcessing" @click="triggerImport">
                Select File...
            </AppButton>
        </div>
    </AppCard>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.import-card {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $space-lg;

    &__icon {
        font-size: 3.5rem;
        filter: drop-shadow(0 4px 12px color.change($accent-teal, $alpha: 0.25));
    }

    &__title {
        font-family: $font-display;
        font-size: $font-size-h3;
        color: $text-light-primary;
        margin: 0;
        letter-spacing: -0.02em;
    }

    &__desc {
        color: $text-light-secondary;
        font-size: $font-size-body-sm;
        margin-bottom: $space-md;
        flex: 1;
        line-height: 1.6;
        max-width: 280px;
    }

    &__hidden-input {
        display: none;
    }
}
</style>
