<script setup lang="ts">
/**
 * AchievementsFilters - Category filter pills for achievements
 */
import AppFilterPills, { type FilterOption } from "@/components/common/AppFilterPills.vue";
import { ACHIEVEMENT_CATEGORIES } from "@/config/achievements";
import { computed } from "vue";

const modelValue = defineModel<string>({ required: true });

const filterOptions = computed<FilterOption[]>(() => {
    const options: FilterOption[] = [{ id: "all", label: "All" }];

    for (const [key, config] of Object.entries(ACHIEVEMENT_CATEGORIES)) {
        options.push({
            id: key,
            label: config.label,
        });
    }

    return options;
});
</script>

<template>
    <AppFilterPills v-model="modelValue" :options="filterOptions" variant="glass" />
</template>
