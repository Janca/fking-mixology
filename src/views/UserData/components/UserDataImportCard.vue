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
@use "@/styles/variables" as *;

.import-card {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $space-md;

    &__icon {
        font-size: 3rem;
    }

    &__title {
        font-family: $font-display;
        font-size: $font-size-h3;
        color: $text-light-primary;
        margin: 0;
    }

    &__desc {
        color: $text-light-muted;
        font-size: $font-size-body-sm;
        margin-bottom: $space-md;
        flex: 1;
    }

    &__hidden-input {
        display: none;
    }
}
</style>
