<script setup lang="ts">
/**
 * UserDataImportDialog - Import confirmation modal
 */
import AppModal from "@/components/common/AppModal.vue";
import AppButton from "@/components/common/AppButton.vue";

interface ExportData {
    version: string;
    exportedAt: string;
    pantryItems: any[];
    ledgerSessions: any[];
    ledgerEntries: any[];
    favorites: any[];
    userAchievements: any[];
    achievementMetrics: any[];
}

defineProps<{
    /** Whether dialog is shown */
    show: boolean;
    /** Import data to display info about */
    importData: ExportData | null;
}>();

const emit = defineEmits<{
    (e: "close"): void;
    (e: "import", mode: "wipe" | "append"): void;
}>();
</script>

<template>
    <AppModal :show="show" max-width="500px" @close="emit('close')">
        <div v-if="importData" class="import-dialog">
            <h3 class="import-dialog__title">Import Options</h3>
            <p class="import-dialog__desc">
                Found data from
                <strong>{{ new Date(importData.exportedAt).toLocaleDateString() }}</strong>.
                <br />Contains {{ importData.pantryItems.length }} pantry items,
                {{ importData.favorites.length }} favorites, etc.
            </p>

            <div class="import-dialog__actions">
                <div class="action-group">
                    <AppButton variant="coral" class="action-btn" @click="emit('import', 'wipe')">
                        Wipe & Replace
                    </AppButton>
                    <span class="action-hint">Deletes current data first. Dangerous!</span>
                </div>

                <div class="action-group">
                    <AppButton variant="primary" class="action-btn" @click="emit('import', 'append')">
                        Append (Merge)
                    </AppButton>
                    <span class="action-hint">Adds to current data. May create duplicates.</span>
                </div>
            </div>

            <button class="import-dialog__cancel" @click="emit('close')">Cancel</button>
        </div>
    </AppModal>
</template>

<style lang="scss" scoped>
@use "@/styles/variables" as *;

.import-dialog {
    text-align: center;

    &__title {
        margin-top: 0;
        margin-bottom: $space-md;
        font-size: $font-size-h3;
    }

    &__desc {
        color: $text-dark-secondary;
        margin-bottom: $space-xl;
    }

    &__actions {
        display: flex;
        flex-direction: column;
        gap: $space-lg;
        margin-bottom: $space-lg;

        @include tablet-up {
            flex-direction: row;
            justify-content: space-around;
        }
    }

    &__cancel {
        background: none;
        border: none;
        color: $text-dark-muted;
        text-decoration: underline;
        cursor: pointer;
        font-size: $font-size-body-sm;

        &:hover {
            color: $text-dark-primary;
        }
    }
}

.action-group {
    display: flex;
    flex-direction: column;
    gap: $space-xs;
    align-items: center;
}

.action-hint {
    font-size: $font-size-tiny;
    color: $text-dark-muted;
}
</style>
