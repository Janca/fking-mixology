<script setup lang="ts">
/**
 * UserDataExportCard - Export functionality card
 */
import AppCard from "@/components/common/AppCard.vue";
import AppButton from "@/components/common/AppButton.vue";
import AppEmoji from "@/components/common/AppEmoji.vue";

defineProps<{
    /** Whether export is in progress */
    isProcessing: boolean;
}>();

const emit = defineEmits<{
    (e: "export"): void;
}>();
</script>

<template>
    <AppCard variant="dark" padding="xl">
        <div class="export-card">
            <AppEmoji class="export-card__icon">📤</AppEmoji>
            <h2 class="export-card__title">Export Data</h2>
            <p class="export-card__desc">
                Download a FKM file containing your Pantry, Favorites, Ledger History,
                and Achievements. You should do this periodically to prevent data loss.
            </p>
            <AppButton variant="primary" :loading="isProcessing" @click="emit('export')">
                Export Backup
            </AppButton>
        </div>
    </AppCard>
</template>

<style lang="scss" scoped>
@use "@/styles/variables" as *;

.export-card {
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
}
</style>
