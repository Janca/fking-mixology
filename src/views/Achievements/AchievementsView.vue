<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import { useAchievementsStore } from "@/stores/achievements";
import WaveLayout from "@/components/layout/WaveLayout.vue";
import AchievementsProgress from "./components/AchievementsProgress.vue";
import AchievementsFilters from "./components/AchievementsFilters.vue";
import AchievementsList from "./components/AchievementsList.vue";

defineOptions({
  name: "AchievementsView",
});

const store = useAchievementsStore();
const route = useRoute();
const selectedCategory = ref<string>("all");

onMounted(async () => {
  await store.loadData();

  if (route.hash) {
    // Wait for DOM update
    await nextTick();
    // Small timeout to ensure layout is stable
    setTimeout(() => {
      const el = document.querySelector(route.hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // Add a temporary highlight effect
        el.classList.add("highlight-pulse");
        setTimeout(() => el.classList.remove("highlight-pulse"), 2000);
      }
    }, 100);
  }
});

const filteredAchievements = computed(() => {
  let list = store.achievementsList;

  if (selectedCategory.value !== "all") {
    list = list.filter((a) => a.category === selectedCategory.value);
  }

  // Sort: Unlocked first, then by tiered order
  return list.sort((a, b) => {
    if (a.isUnlocked && !b.isUnlocked) return -1;
    if (!a.isUnlocked && b.isUnlocked) return 1;
    return 0; // Keep config order
  });
});
</script>

<template>
  <WaveLayout title="Cheevos" icon="🏆">
    <template #header-content>
      <!-- Overall Progress -->
      <AchievementsProgress :total-unlocked="store.totalUnlocked" :total-achievements="store.totalAchievements"
        :progress-percentage="store.progressPercentage" />

      <!-- Category Filters -->
      <AchievementsFilters v-model="selectedCategory" />
    </template>

    <!-- Achievements Grid -->
    <AchievementsList :achievements="filteredAchievements" />
  </WaveLayout>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

// Highlight pulse animation for hash navigation
:deep(.highlight-pulse) {
  animation: card-highlight 2s ease-out;
}

@keyframes card-highlight {
  0% {
    box-shadow: 0 0 0 0 color.change($accent-gold, $alpha: 0.7);
    border-color: $accent-gold;
  }

  50% {
    box-shadow: 0 0 0 15px color.change($accent-gold, $alpha: 0);
    border-color: $accent-gold;
  }

  100% {
    box-shadow: 0 0 0 0 color.change($accent-gold, $alpha: 0);
  }
}
</style>
