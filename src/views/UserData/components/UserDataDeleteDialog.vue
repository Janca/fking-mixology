<script setup lang="ts">
/**
 * UserDataDeleteDialog - Delete confirmation modal with verification
 */
import { ref, computed } from "vue";
import AppModal from "@/components/common/AppModal.vue";
import AppButton from "@/components/common/AppButton.vue";
import AppInput from "@/components/common/AppInput.vue";

defineProps<{
    /** Whether dialog is shown */
    show: boolean;
}>();

const emit = defineEmits<{
    (e: "close"): void;
    (e: "confirm"): void;
}>();

const confirmText = ref("");
const REQUIRED_TEXT = "DELETE";

const isValid = computed(() => confirmText.value === REQUIRED_TEXT);

function handleClose() {
    confirmText.value = "";
    emit("close");
}

function handleConfirm() {
    if (isValid.value) {
        emit("confirm");
        handleClose();
    }
}
</script>

<template>
    <AppModal :show="show" max-width="500px" @close="handleClose">
        <div class="delete-dialog">
            <h3 class="delete-dialog__title">Are you absolutely sure?</h3>
            <p class="delete-dialog__desc">
                This action cannot be undone. This will permanently delete your
                <strong>favorites, pantry items, ledger history, and achievements</strong>.
            </p>

            <div class="delete-dialog__form">
                <label class="confirm-label">
                    Type <strong>{{ REQUIRED_TEXT }}</strong> to confirm:
                </label>
                <AppInput v-model="confirmText" placeholder="Type DELETE to confirm" @keyup.enter="handleConfirm" />
            </div>

            <div class="delete-dialog__actions">
                <AppButton variant="secondary" @click="handleClose">
                    Cancel
                </AppButton>
                <AppButton variant="coral" :disabled="!isValid" @click="handleConfirm">
                    Yes, Delete Everything
                </AppButton>
            </div>
        </div>
    </AppModal>
</template>

<style lang="scss" scoped>
@use "@/styles/variables" as *;

.delete-dialog {
    text-align: center;

    &__title {
        margin-top: 0;
        margin-bottom: $space-md;
        font-size: $font-size-h3;
        color: $accent-coral;
    }

    &__desc {
        color: $text-dark-secondary;
        margin-bottom: $space-xl;
        line-height: 1.6;
    }

    &__form {
        margin-bottom: $space-xl;
        text-align: left;
    }

    &__actions {
        display: flex;
        flex-direction: column-reverse;
        gap: $space-md;

        @include tablet-up {
            flex-direction: row;
            justify-content: flex-end;
        }
    }
}

.confirm-label {
    display: block;
    margin-bottom: $space-sm;
    color: $text-dark-primary;
    font-size: $font-size-body-sm;
}
</style>
