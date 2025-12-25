<script setup lang="ts">
/**
 * UserDataDeleteCard - Danger zone card for wiping data
 */
import AppCard from "@/components/common/AppCard.vue";
import AppButton from "@/components/common/AppButton.vue";
import AppEmoji from "@/components/common/AppEmoji.vue";

defineProps<{
    isProcessing: boolean;
}>();

const emit = defineEmits<{
    (e: "delete"): void;
}>();
</script>

<template>
    <AppCard variant="dark" padding="xl" class="delete-card-wrapper">
        <div class="delete-card">
            <AppEmoji class="delete-card__icon">💥</AppEmoji>
            <h2 class="delete-card__title">Danger Zone</h2>
            <p class="delete-card__desc">
                Permanently delete all local data, including your Pantry, Favorites, and History.
                This cannot be undone.
            </p>
            <AppButton variant="coral" :loading="isProcessing" @click="emit('delete')">
                Delete Everything
            </AppButton>
        </div>
    </AppCard>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.delete-card-wrapper {
    border: 1px solid color.change($accent-coral, $alpha: 0.3);
}

.delete-card {
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
        color: $accent-coral;
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
