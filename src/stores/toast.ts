import { defineStore } from "pinia";
import { ref } from "vue";

export interface ToastAction {
  icon: string; // Material symbol name or similar
  label: string; // Accessible label or tooltip
  onClick: () => void;
  variant?: "default" | "danger" | "primary";
}

export interface ToastOptions {
  title: string;
  message?: string; // Optional longer text
  badge?: string;
  duration?: number; // In seconds. If 0 or missing and not sticky, defaults to 5s.
  sticky?: boolean;
  actions?: ToastAction[];
  type?: "info" | "success" | "warning" | "error"; // For potential icon/color subtle variations
  onDismiss?: (e?: MouseEvent) => void;
  onClick?: () => void;
}

export interface Toast extends ToastOptions {
  id: string;
  createdAt: number;
  timeLeft: number; // For progress bar calculation if needed
  timerId?: any;
}

export const useToastStore = defineStore("toast", () => {
  const toasts = ref<Toast[]>([]);

  function addToast(options: ToastOptions) {
    const id =
      Date.now().toString(36) + Math.random().toString(36).substring(2);

    // Default duration: 5s if not sticky, otherwise infinity (handled by sticky flag)
    // If sticky is true, duration is ignored for auto-removal, but we might keep it if we want a "time elapsed" or if sticky is false.
    // If sticky is false and duration is undefined, default to 5.
    const duration = options.sticky ? 0 : options.duration || 5;

    const toast: Toast = {
      ...options,
      id,
      createdAt: Date.now(),
      timeLeft: duration,
      duration, // Ensure it's set
    };

    toasts.value.push(toast);

    if (!toast.sticky && duration > 0) {
      toast.timerId = setTimeout(() => {
        removeToast(id);
      }, duration * 1000);
    }
  }

  function removeToast(id: string) {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      const toast = toasts.value[index];
      if (toast.timerId) {
        clearTimeout(toast.timerId);
      }
      toasts.value.splice(index, 1);
    }
  }

  return {
    toasts,
    addToast,
    removeToast,
  };
});
