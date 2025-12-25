<script setup lang="ts">
/**
 * AppModal - Reusable modal/overlay component
 */
defineProps<{
    /** Whether the modal is shown */
    show: boolean;
    /** Maximum width of the modal */
    maxWidth?: string;
    /** Whether to show close button */
    showClose?: boolean;
}>();

const emit = defineEmits<{
    (e: "close"): void;
}>();
</script>

<template>
    <Teleport to="body">
        <Transition name="fade">
            <div v-if="show" class="app-modal-overlay" @click="emit('close')">
                <Transition name="modal-slide">
                    <div v-if="show" class="app-modal" :style="{ maxWidth: maxWidth || '500px' }" @click.stop>
                        <button v-if="showClose" class="app-modal__close" @click="emit('close')">
                            ✕
                        </button>
                        <slot />
                    </div>
                </Transition>
            </div>
        </Transition>
    </Teleport>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.app-modal-overlay {
    position: fixed;
    inset: 0;
    background: color.change(#000, $alpha: 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: $z-modal-backdrop;
    padding: $space-md;
}

.app-modal {
    background: $surface-light-100;
    color: $text-dark-primary;
    padding: $space-xl;
    border-radius: $radius-lg;
    width: 100%;
    box-shadow: $shadow-dark-lg;
    position: relative;

    &__close {
        position: absolute;
        top: $space-md;
        right: $space-md;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: $surface-light-200;
        border: none;
        border-radius: $radius-full;
        color: $text-dark-secondary;
        font-size: 1.25rem;
        cursor: pointer;
        transition: all $transition-fast;

        &:hover {
            background: $surface-light-300;
            color: $text-dark-primary;
        }
    }
}

// Transitions
.fade-enter-active,
.fade-leave-active {
    transition: opacity $transition-normal;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.modal-slide-enter-active,
.modal-slide-leave-active {
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-slide-enter-from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
}

.modal-slide-leave-to {
    opacity: 0;
    transform: scale(0.9);
}
</style>
