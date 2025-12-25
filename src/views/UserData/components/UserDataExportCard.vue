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
@use "sass:color";
@use "@/styles/variables" as *;

.export-card {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $space-lg;

    &__icon {
        font-size: 3.5rem;
        filter: drop-shadow(0 4px 12px color.change($accent-coral, $alpha: 0.25));
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
}
</style>
