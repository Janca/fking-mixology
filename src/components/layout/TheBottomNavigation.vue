<script setup lang="ts">
import { useRoute } from "vue-router";
import { useMobileFullscreen } from "@/composables/useMobileFullscreen";

const route = useRoute();
const { isMobileFullscreen } = useMobileFullscreen();

// Navigation Items
const navItems = [
    {
        label: "Pantry",
        route: "/pantry",
        icon: "🍻",
        matches: ["pantry"],
    },
    {
        label: "Search",
        route: "/browse",
        icon: "🔍",
        matches: ["browse"],
    },
    // Center item is handled separately
    {
        label: "History",
        route: "/ledger",
        icon: "🕒",
        matches: ["ledger", "session-detail"],
    },
    {
        label: "Cheevos",
        route: "/achievements",
        icon: "🏆",
        matches: ["achievements"],
    },
];

const isActive = (matches: string[]) => {
    return matches.includes(route.name as string);
};



const props = withDefaults(defineProps<{
    theme?: 'light' | 'dark' | 'glass';
}>(), {
    theme: 'glass'
});
</script>

<template>
    <Transition name="slide-up">
        <nav v-if="isMobileFullscreen" class="bottom-nav" :class="`bottom-nav--${theme}`">
            <div class="bottom-nav__container">
                <!-- Left Items -->
                <router-link :to="navItems[0].route" class="bottom-nav__item"
                    :class="{ 'bottom-nav__item--active': isActive(navItems[0].matches) }">
                    <span class="bottom-nav__icon">{{ navItems[0].icon }}</span>
                    <span class="bottom-nav__label">{{ navItems[0].label }}</span>
                </router-link>

                <router-link :to="navItems[1].route" class="bottom-nav__item"
                    :class="{ 'bottom-nav__item--active': isActive(navItems[1].matches) }">
                    <span class="bottom-nav__icon">{{ navItems[1].icon }}</span>
                    <span class="bottom-nav__label">{{ navItems[1].label }}</span>
                </router-link>

                <!-- Center Match Button -->
                <div class="bottom-nav__center">
                    <router-link to="/" class="match-button">
                        <span class="match-button__icon">🍹</span>
                    </router-link>
                </div>

                <!-- Right Items -->
                <router-link :to="navItems[2].route" class="bottom-nav__item"
                    :class="{ 'bottom-nav__item--active': isActive(navItems[2].matches) }">
                    <span class="bottom-nav__icon">{{ navItems[2].icon }}</span>
                    <span class="bottom-nav__label">{{ navItems[2].label }}</span>
                </router-link>

                <router-link :to="navItems[3].route" class="bottom-nav__item"
                    :class="{ 'bottom-nav__item--active': isActive(navItems[3].matches) }">
                    <span class="bottom-nav__icon">{{ navItems[3].icon }}</span>
                    <span class="bottom-nav__label">{{ navItems[3].label }}</span>
                </router-link>
            </div>
        </nav>
    </Transition>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/variables" as *;

.bottom-nav {
    position: fixed;
    bottom: 24px; // Floating
    left: 16px;
    right: 16px;
    z-index: $z-sticky;
    display: flex;
    justify-content: center;
    padding-bottom: env(safe-area-inset-bottom);
    pointer-events: none; // Allow clicks through around the pill
}

.bottom-nav__container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: 400px;
    height: 64px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(20px);
    border-radius: $radius-2xl;
    padding: 0 $space-md;
    pointer-events: auto;
    position: relative;

    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6); // Stronger shadow to separate from similar bg
    border: 1px solid rgba(255, 255, 255, 0.08);
}

.bottom-nav__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    text-decoration: none;
    color: $text-dark-primary;
    font-weight: 400;
    transition: all $transition-normal;
    height: 100%;
    gap: $space-2xs;

    &--active {
        color: $accent-purple;

        .bottom-nav__icon {
            transform: translateY(-2px);
            text-shadow: 0 4px 12px rgba($accent-purple, 0.3);
        }
    }
}

.bottom-nav__icon {
    font-family: "Noto Emoji", sans-serif;
    font-size: 1.125rem;
    font-weight: 800;
    line-height: 1;
    transition: transform $transition-bounce;
}

.bottom-nav__label {
    font-size: 0.625rem;
    font-weight: $font-weight-medium;
    opacity: 0.8;
}

// Center Button Styles
.bottom-nav__center {
    position: relative;
    width: 64px;
    height: 0; // Don't take up height in flow
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
    margin: 0 8px;
}

.match-button {
    //position: absolute;
    //bottom: -24px;
    width: 64px; // Slightly larger as requested "large"
    height: 64px;
    border-radius: 50%;
    background: $gradient-blue;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: -$space-xl;
    margin-right: -$space-xl;
    box-shadow: 0 8px 24px rgba($accent-purple, 0.4);
    border: 4px solid $surface-light-100;
    color: white;
    text-decoration: none;
    transform: translateY(-12px); // Moved down from -20px
    transition: transform $transition-bounce, box-shadow $transition-normal;

    @media (prefers-color-scheme: dark) {
        border-color: #292d48; // Hand-picked to match glass bg approx
        border: none;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    }

    &:active {
        transform: translateY(-2px) scale(0.95);
    }

    &__icon {
        font-family: "Noto Emoji", sans-serif;
        font-size: 2rem;
        color: white;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }
}

// Transition
.slide-up-enter-active,
.slide-up-leave-active {
    transition: transform $transition-bounce, opacity $transition-normal;
}

.slide-up-enter-from,
.slide-up-leave-to {
    transform: translateY(100%);
    opacity: 0;
}
</style>
