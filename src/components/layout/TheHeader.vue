<script setup lang="ts">
/**
 * TheHeader - Sticky Header with Integrated Search
 */
import { ref, computed, watch } from "vue";
import { RouterLink, useRouter, useRoute } from "vue-router";
import { useIngredientsStore } from "@/stores/ingredients";
import { getIngredientEmoji } from "@/utils/cocktailUtils";
import AppEmoji from "@/components/common/AppEmoji.vue";
import AppAutocomplete, { type AutocompleteItem } from "@/components/common/AppAutocomplete.vue";

const router = useRouter();
const route = useRoute();
const ingredientsStore = useIngredientsStore();

const searchInput = ref(ingredientsStore.searchQuery);
const isSearchFocused = ref(false);
const isMobileMenuOpen = ref(false);
const isSelectionClear = ref(false);

// Check if we should show back button (not on main pages)
const showBackButton = computed(() => {
  const mainPages = ["home", "browse", "pantry", "ledger", "achievements"];
  return !mainPages.includes(route.name as string);
});

// Check if we should show search bar
const shouldShowSearch = computed(() => {
  const noSearchPages = [
    "cocktail",
    "pantry",
    "browse",
    "ledger",
    "achievements",
    "user-data",
    "session-detail"
  ];
  return !noSearchPages.includes(route.name as string);
});

// Manage logo visibility on mobile to prevent layout jank
const isLogoHiddenOnMobile = ref(false);

const targetLogoHiddenState = computed(() => {
  // If search is hidden, we have room for the logo
  if (!shouldShowSearch.value) return false;
  // If search is visible and back button is visible, hide logo on mobile
  return showBackButton.value;
});

watch(
  targetLogoHiddenState,
  (shouldHide) => {
    if (shouldHide) {
      // Hide immediately
      isLogoHiddenOnMobile.value = true;
    } else {
      // Delay showing
      setTimeout(() => {
        isLogoHiddenOnMobile.value = false;
      }, 220);
    }
  },
  { immediate: true }
);

// Debounced search for efficiency, but also immediate search for responsiveness
let searchTimeout: ReturnType<typeof setTimeout>;

function performSearch(value: string) {
  ingredientsStore.search(value);
}

// Watch for input changes - immediate search + debounced follow-up
watch(searchInput, (value) => {
  // If the input was cleared due to a selection, don't re-search/re-open dropdown
  if (value === "" && isSelectionClear.value) {
    isSelectionClear.value = false;
    return;
  }

  performSearch(value);
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    performSearch(value);
  }, 150);
});

// Watch route changes to close mobile menu
watch(
  () => route.path,
  () => {
    isMobileMenuOpen.value = false;
  }
);

function handleFocus() {
  isSearchFocused.value = true;
  performSearch(searchInput.value);
}

const showDropdown = computed(
  () =>
    isSearchFocused.value && ingredientsStore.filteredSearchResults.length > 0
);

// Transform search results to autocomplete items format
const autocompleteItems = computed(() =>
  ingredientsStore.filteredSearchResults.slice(0, 6).map((ing) => ({
    id: ing.id!,
    name: ing.name,
    ingredient: ing,
  }))
);

function handleIngredientSelect(item: AutocompleteItem) {
  const ingredient = item.ingredient as { id: number; name: string; normalizedName: string };
  if (ingredient.id) {
    ingredientsStore.addIngredient(ingredient);
    // Set flag to prevent search dropdown from reopening immediately
    isSelectionClear.value = true;
    searchInput.value = "";
    ingredientsStore.clearSearch();

    if (router.currentRoute.value.name !== "home") {
      router.push("/");
    }
  }
}

function handleBlur() {
  setTimeout(() => {
    isSearchFocused.value = false;
  }, 200);
}

function handleClear() {
  searchInput.value = "";
  ingredientsStore.clearSearch();
}

function goBack() {
  if (window.history.length > 2) {
    router.back();
  } else {
    router.push("/");
  }
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
}
</script>

<template>
  <header class="the-header">
    <div class="the-header__container">
      <!-- Back Button (Mobile/Desktop logic handled via CSS/Layout) -->
      <Transition name="fade-slide">
        <button v-if="showBackButton" class="the-header__back" @click="goBack">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
      </Transition>

      <!-- Logo -->
      <RouterLink to="/" class="the-header__logo" :class="{
        'the-header__logo--hidden-mobile': isLogoHiddenOnMobile,
        'the-header__logo--expanded-mobile': !shouldShowSearch,
      }">
        <AppEmoji class="the-header__logo-emoji">🍸</AppEmoji>
        <span class="the-header__logo-text">Mixology</span>
      </RouterLink>

      <!-- Search Input (Centered) -->
      <Transition name="search-pop">
        <div v-if="shouldShowSearch" class="the-header__search">
          <AppAutocomplete v-model="searchInput" :items="autocompleteItems" :show-dropdown="showDropdown"
            placeholder="Add ingredients..." variant="light" size="sm" bordered color="coral" clearable
            teleport-to="body" @input="performSearch" @focus="handleFocus" @blur="handleBlur" @clear="handleClear"
            @select="handleIngredientSelect">
            <template #prefix>
              <AppEmoji class="search-box__icon">🔍</AppEmoji>
            </template>
            <template #item="{ item }">
              <AppEmoji class="search-dropdown__emoji">{{ getIngredientEmoji(String(item.name)) }}</AppEmoji>
              <span class="search-dropdown__name">{{ item.name }}</span>
              <span class="search-dropdown__add">+</span>
            </template>
          </AppAutocomplete>
        </div>
      </Transition>

      <!-- Desktop Navigation (Hidden on Mobile) -->
      <nav class="the-header__nav the-header__nav--desktop">
        <RouterLink to="/" class="the-header__nav-link">Match</RouterLink>
        <RouterLink to="/browse" class="the-header__nav-link">Browse</RouterLink>
        <RouterLink to="/pantry" class="the-header__nav-link">Pantry</RouterLink>
        <RouterLink to="/ledger" class="the-header__nav-link">Ledger</RouterLink>
        <RouterLink to="/achievements" class="the-header__nav-link">
          Cheevos
        </RouterLink>
      </nav>

      <!-- Hamburger Menu Button (Visible on Mobile) -->
      <button class="the-header__hamburger" :class="{ 'the-header__hamburger--active': isMobileMenuOpen }"
        @click="toggleMobileMenu">
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
    </div>
  </header>

  <!-- Mobile Drawer Overlay - Teleported to body to avoid header's backdrop-filter containing block -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isMobileMenuOpen" class="mobile-menu-overlay" @click="isMobileMenuOpen = false" />
    </Transition>

    <!-- Mobile Drawer Panel -->
    <Transition name="slide-right">
      <aside v-if="isMobileMenuOpen" class="mobile-menu-drawer">
        <div class="mobile-menu-header">
          <span class="mobile-menu-title">Menu</span>
          <button class="mobile-menu-close" @click="isMobileMenuOpen = false">
            ✕
          </button>
        </div>
        <nav class="mobile-menu-nav">
          <RouterLink to="/" class="mobile-menu-link">
            <AppEmoji class="mobile-menu-icon">🎯</AppEmoji>
            Match
          </RouterLink>
          <RouterLink to="/browse" class="mobile-menu-link">
            <AppEmoji class="mobile-menu-icon">📖</AppEmoji>
            Browse
          </RouterLink>
          <RouterLink to="/pantry" class="mobile-menu-link">
            <AppEmoji class="mobile-menu-icon">🍻</AppEmoji>
            Pantry
          </RouterLink>
          <RouterLink to="/ledger" class="mobile-menu-link">
            <AppEmoji class="mobile-menu-icon">📒</AppEmoji>
            Ledger
          </RouterLink>
          <RouterLink to="/achievements" class="mobile-menu-link">
            <AppEmoji class="mobile-menu-icon">🏆</AppEmoji>
            Cheevos
          </RouterLink>
        </nav>
      </aside>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.the-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: $z-sticky;
  display: flex;
  align-items: center;
  // Fixed height to prevent reflow when search is shown/hidden
  height: 60px;
  min-height: 60px;
  // Reduced mobile padding as requested
  padding: $space-sm $space-sm;
  background: linear-gradient(180deg,
      color.change($surface-light-100, $alpha: 0.97) 0%,
      color.change($surface-light-100, $alpha: 0.92) 100%);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border-bottom: 1px solid color.change($surface-light-300, $alpha: 0.6);
  box-shadow: 0 1px 3px color.change(#000, $alpha: 0.03),
    0 4px 12px color.change(#000, $alpha: 0.02);

  @include tablet-up {
    height: 64px;
    min-height: 64px;
    padding: $space-sm $space-lg;
  }

  @include desktop-up {
    height: 72px;
    min-height: 72px;
    padding: $space-md $space-xl;
  }

  &__container {
    display: flex;
    align-items: center;
    gap: $space-sm; // Reduced gap for mobile
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    // Removed fixed padding-left, using flex layout instead
    justify-content: space-between;

    @include tablet-up {
      gap: $space-md;
    }

    @include desktop-up {
      gap: $space-lg;
    }
  }

  // Back button
  &__back {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: $surface-light-200;
    border: none;
    border-radius: $radius-full;
    color: $text-dark-secondary;
    cursor: pointer;
    transition: all $transition-normal;
    box-shadow: $shadow-light-raised-sm;
    flex-shrink: 0;
    margin-right: $space-xs;

    @include desktop-up {
      width: 40px;
      height: 40px;
      margin-right: $space-md;
    }

    svg {
      width: 20px;
      height: 20px;
    }

    &:hover {
      background: $surface-light-300;
      transform: translateX(-2px);
    }

    &:active {
      box-shadow: $shadow-light-inset-sm;
    }
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: $space-xs;
    text-decoration: none;
    flex-shrink: 0;
    margin-right: auto; // Pushes everything else to the right if possible, but search will take precedent via flex-grow
    margin-right: 0; // Reset, let flex handle it

    &:focus-visible {
      outline: 2px solid $accent-coral;
      outline-offset: 4px;
      border-radius: $radius-sm;
    }

    &--hidden-mobile {
      @include mobile-only {
        display: none;
      }
    }

    &--expanded-mobile {
      .the-header__logo-text {
        @include mobile-only {
          display: block;
          animation: fade-in 0.4s ease forwards;
        }
      }
    }
  }

  &__logo-emoji {
    font-size: 1.5rem;
  }

  &__logo-text {
    font-family: $font-display;
    font-size: $font-size-body-lg;
    font-weight: $font-weight-extrabold;
    color: $text-dark-primary;
    letter-spacing: -0.02em;

    @include mobile-only {
      display: none;
    }
  }

  &__search {
    flex: 1; // Take up available space
    max-width: 100%; // Allowed to expand
    position: relative;
    margin: 0 $space-xs; // Spacing around search

    @include desktop-up {
      max-width: 400px;
      margin: 0 $space-md;
    }
  }

  // Navigation (Desktop)
  &__nav {
    display: none; // Hidden by default (mobile)

    @include desktop-up {
      display: flex; // Visible on desktop
      align-items: center;
      gap: $space-xs;
      flex-shrink: 0;
      margin-left: auto; // Push to far right
    }

    &--mobile {
      display: flex; // Visible in mobile drawer
      flex-direction: column;
      width: 100%;
    }
  }

  &__nav-link {
    padding: $space-xs $space-sm;
    font-size: $font-size-body-sm;
    font-weight: $font-weight-medium;
    color: $text-dark-muted;
    text-decoration: none;
    border-radius: $radius-sm;
    transition: all $transition-fast;
    white-space: nowrap;

    &:hover {
      color: $text-dark-primary;
    }

    &.router-link-exact-active {
      color: $accent-coral;
      font-weight: $font-weight-semibold;
    }
  }

  // Hamburger Button (Mobile)
  &__hamburger {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 5px;
    width: 36px;
    height: 36px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    z-index: $z-sticky + 1;
    margin-left: $space-xs;

    @include desktop-up {
      display: none;
    }

    .hamburger-line {
      width: 24px;
      height: 2px;
      background-color: $text-dark-primary;
      border-radius: 2px;
      transition: all $transition-normal;
    }

    &--active {
      .hamburger-line:nth-child(1) {
        transform: translateY(7px) rotate(45deg);
      }

      .hamburger-line:nth-child(2) {
        opacity: 0;
      }

      .hamburger-line:nth-child(3) {
        transform: translateY(-7px) rotate(-45deg);
      }
    }
  }
}

// Search Box
.search-box {
  display: flex;
  align-items: center;
  gap: $space-sm;
  height: 40px;
  padding: 0 $space-sm;
  background: $surface-light-200;
  border: 1px solid color.change($surface-light-400, $alpha: 0.5);
  border-radius: $radius-full;
  transition: all $transition-normal;
  width: 100%;
  box-shadow: inset 0 1px 2px color.change(#000, $alpha: 0.03);

  @include tablet-up {
    height: 44px;
    padding: 0 $space-md;
  }

  @include desktop-up {
    height: 48px;
    padding: 0 $space-lg;
  }

  &:focus-within {
    background: $surface-light-100;
    border-color: $accent-coral;
    box-shadow: 0 0 0 4px color.change($accent-coral, $alpha: 0.12),
      inset 0 1px 2px color.change(#000, $alpha: 0.02);
    transform: scale(1.01);
  }

  &__icon {
    font-size: 0.85rem;
    flex-shrink: 0;
  }

  &__input {
    flex: 1;
    min-width: 0;
    background: transparent;
    border: none;
    color: $text-dark-primary;
    font-family: $font-body;
    font-size: $font-size-body-sm;
    font-weight: $font-weight-medium;
    padding: 0;
    appearance: none;

    &::placeholder {
      color: $text-dark-muted;
      font-weight: $font-weight-regular;
    }

    &:focus {
      outline: none;
      box-shadow: none;
    }
  }

  &__clear {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    padding: 0;
    background: $text-dark-muted;
    border: none;
    border-radius: $radius-full;
    color: white;
    font-size: 9px;
    cursor: pointer;
    transition: all $transition-fast;
    flex-shrink: 0;

    &:hover {
      background: $accent-coral;
      transform: scale(1.1);
    }
  }
}

// Search Dropdown
.search-dropdown {
  position: absolute;
  top: calc(100% + $space-sm);
  left: 0;
  right: 0;
  background: $surface-light-100;
  border-radius: $radius-xl;
  box-shadow: 0 12px 40px color.change(#000, $alpha: 0.15),
    0 4px 12px color.change(#000, $alpha: 0.08),
    0 0 0 1px color.change(#000, $alpha: 0.03);
  max-height: 360px;
  overflow-y: auto;
  z-index: $z-dropdown;
  padding: $space-sm;
  border: 1px solid color.change($surface-light-300, $alpha: 0.8);

  &__item {
    display: flex;
    align-items: center;
    gap: $space-sm;
    width: 100%;
    padding: $space-sm $space-md;
    background: transparent;
    border: none;
    border-radius: $radius-md;
    color: $text-dark-primary;
    font-family: $font-body;
    font-size: $font-size-body-sm;
    font-weight: $font-weight-medium;
    text-align: left;
    cursor: pointer;
    transition: all $transition-fast;

    &:hover {
      background: $surface-light-200;

      .search-dropdown__add {
        background: $accent-coral;
        color: white;
      }
    }
  }

  &__emoji {
    font-size: 0.9rem;
  }

  &__name {
    flex: 1;
  }

  &__add {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $surface-light-300;
    border-radius: $radius-full;
    color: $text-dark-muted;
    font-size: 11px;
    font-weight: $font-weight-bold;
    transition: all $transition-fast;
  }
}

// Mobile Menu Overlay & Drawer
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: color.change(#000, $alpha: 0.5);
  backdrop-filter: blur(4px);
  z-index: $z-modal-backdrop;
}

.mobile-menu-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 85%; // 85% of screen width - no max-width to allow full 85%
  background: color.change($surface-light-100, $alpha: 0.85); // Light glass panel
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: -8px 0 32px color.change(#000, $alpha: 0.2);
  z-index: $z-modal;
  padding: $space-lg;
  display: flex;
  flex-direction: column;
  border-left: 1px solid color.change($surface-light-100, $alpha: 0.3);

  // Light theme text
  color: $text-dark-primary;
}

.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $space-xl;
  padding-bottom: $space-md;
  border-bottom: 1px solid color.change($surface-light-100, $alpha: 0.4);
}

.mobile-menu-title {
  font-family: $font-display;
  font-size: $font-size-h2;
  font-weight: $font-weight-bold;
  color: $text-dark-primary;
  letter-spacing: -0.02em;
}

.mobile-menu-close {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $surface-light-200;
  border: 1px solid color.change($surface-light-400, $alpha: 0.5);
  border-radius: $radius-full;
  color: $text-dark-secondary;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all $transition-normal;
  box-shadow: 0 2px 8px color.change(#000, $alpha: 0.06);

  &:hover {
    background: $surface-light-100;
    color: $accent-coral;
    transform: rotate(90deg);
    box-shadow: 0 4px 12px color.change(#000, $alpha: 0.1);
  }

  &:active {
    transform: rotate(90deg) scale(0.95);
  }
}

.mobile-menu-nav {
  display: flex;
  flex-direction: column;
  gap: $space-xs;
}

.mobile-menu-link {
  display: flex;
  align-items: center;
  gap: $space-md;
  padding: $space-md $space-lg;
  background: transparent;
  border-radius: $radius-xl;
  text-decoration: none;
  color: $text-dark-secondary;
  font-size: $font-size-body-lg;
  font-weight: $font-weight-medium;
  transition: all $transition-normal;
  position: relative;
  overflow: hidden;

  .mobile-menu-icon {
    font-size: 1.6rem;
    transition: transform $transition-normal;
  }

  &:hover,
  &:active {
    background: $surface-light-200;
    color: $text-dark-primary;
    transform: translateX(8px);

    .mobile-menu-icon {
      transform: scale(1.1);
    }
  }

  &.router-link-exact-active {
    background: linear-gradient(135deg,
        color.change($accent-coral, $alpha: 0.12) 0%,
        color.change($accent-coral, $alpha: 0.05) 100%);
    color: $accent-coral;
    font-weight: $font-weight-semibold;
    border: 1px solid color.change($accent-coral, $alpha: 0.2);

    .mobile-menu-icon {
      transform: scale(1.1);
    }
  }
}

// Transitions
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}

.search-pop-enter-active,
.search-pop-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.search-pop-enter-from,
.search-pop-leave-to {
  opacity: 0;
  max-width: 0;
  margin: 0;
  padding: 0;
  transform: scaleY(0.8);
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
