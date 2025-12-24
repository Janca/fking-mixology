# Mixology Matcher - Visual Style Guide

## Brand Identity

**Mixology Matcher** is an exclusive, underground speakeasy experience. The interface should feel like stepping into a dimly lit, premium cocktail bar—intimate, sophisticated, and alive.

---

## Color Palette

### Primary Colors

| Name      | Hex       | RGB        | Usage                               |
| --------- | --------- | ---------- | ----------------------------------- |
| Deep Noir | `#0A0A0F` | 10, 10, 15 | Primary background                  |
| Charcoal  | `#14141A` | 20, 20, 26 | Card backgrounds, elevated surfaces |
| Slate     | `#1E1E26` | 30, 30, 38 | Secondary backgrounds, borders      |
| Dim       | `#2A2A35` | 42, 42, 53 | Subtle highlights, disabled states  |

### Accent Colors

| Name      | Hex       | RGB           | Usage                            |
| --------- | --------- | ------------- | -------------------------------- |
| Acid Lime | `#BAFF39` | 186, 255, 57  | Primary accent, CTAs, highlights |
| Lime Glow | `#D4FF7A` | 212, 255, 122 | Hover states, glows              |
| Lime Dim  | `#5C8020` | 92, 128, 32   | Muted accent states              |

### Text Colors

| Name       | Hex       | RGB           | Usage                       |
| ---------- | --------- | ------------- | --------------------------- |
| Pure White | `#FFFFFF` | 255, 255, 255 | Primary headings, emphasis  |
| Soft White | `#E8E8EF` | 232, 232, 239 | Body text                   |
| Muted      | `#8A8A9A` | 138, 138, 154 | Secondary text, labels      |
| Subtle     | `#5A5A6A` | 90, 90, 106   | Tertiary text, placeholders |

### Semantic Colors

| Name    | Hex       | RGB           | Usage          |
| ------- | --------- | ------------- | -------------- |
| Success | `#4ADE80` | 74, 222, 128  | Success states |
| Warning | `#FBBF24` | 251, 191, 36  | Warnings       |
| Error   | `#F87171` | 248, 113, 113 | Error states   |
| Info    | `#60A5FA` | 96, 165, 250  | Informational  |

---

## Typography

### Font Families

- **Display / Headings**: `'Outfit'`, sans-serif (Variable weight 100-900)
- **Body / UI**: `'Inter'`, sans-serif (Variable weight 100-900)
- **Monospace / Measurements**: `'JetBrains Mono'`, monospace

### Type Scale

| Name       | Size     | Weight | Line Height | Letter Spacing | Usage               |
| ---------- | -------- | ------ | ----------- | -------------- | ------------------- |
| Display XL | 4rem     | 700    | 1.1         | -0.02em        | Hero headlines      |
| Display    | 3rem     | 700    | 1.15        | -0.015em       | Section titles      |
| H1         | 2.25rem  | 600    | 1.2         | -0.01em        | Page titles         |
| H2         | 1.75rem  | 600    | 1.25        | -0.005em       | Card titles         |
| H3         | 1.25rem  | 600    | 1.3         | 0              | Subsection headings |
| Body L     | 1.125rem | 400    | 1.6         | 0.01em         | Featured body text  |
| Body       | 1rem     | 400    | 1.5         | 0.01em         | Standard body text  |
| Body S     | 0.875rem | 400    | 1.5         | 0.015em        | Secondary text      |
| Caption    | 0.75rem  | 500    | 1.4         | 0.02em         | Labels, timestamps  |
| Overline   | 0.625rem | 700    | 1.2         | 0.15em         | Category labels     |

---

## Spacing System

Base unit: `4px`

| Token | Value | Usage                    |
| ----- | ----- | ------------------------ |
| xs    | 4px   | Tight spacing, icon gaps |
| sm    | 8px   | Compact elements         |
| md    | 16px  | Standard padding         |
| lg    | 24px  | Section spacing          |
| xl    | 32px  | Large gaps               |
| 2xl   | 48px  | Page sections            |
| 3xl   | 64px  | Major section breaks     |

---

## Border Radius

| Token | Value  | Usage           |
| ----- | ------ | --------------- |
| none  | 0      | Sharp edges     |
| sm    | 4px    | Subtle rounding |
| md    | 8px    | Buttons, inputs |
| lg    | 12px   | Cards, panels   |
| xl    | 16px   | Modal corners   |
| 2xl   | 24px   | Large cards     |
| full  | 9999px | Pills, avatars  |

---

## Shadows & Depth

### Neumorphic Inset (Cards)

```css
box-shadow: inset 2px 2px 4px rgba(0, 0, 0, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.03);
```

### Elevation Levels

```css
/* Level 1 - Subtle */
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

/* Level 2 - Cards */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);

/* Level 3 - Modals/Popovers */
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);

/* Level 4 - Floating Elements */
box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6);
```

### Glow Effects (Acid Lime)

```css
/* Subtle glow */
box-shadow: 0 0 16px rgba(186, 255, 57, 0.15);

/* Medium glow */
box-shadow: 0 0 24px rgba(186, 255, 57, 0.25);

/* Intense glow */
box-shadow: 0 0 32px rgba(186, 255, 57, 0.4);
```

---

## Effects

### Film Grain Overlay

A subtle, animated noise texture applied as a pseudo-element overlay to create that cinematic speakeasy atmosphere.

### Glassmorphism

```css
background: rgba(20, 20, 26, 0.8);
backdrop-filter: blur(16px);
border: 1px solid rgba(255, 255, 255, 0.05);
```

### Animated Pulse (Acid Lime Accent)

```css
@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 16px rgba(186, 255, 57, 0.2);
  }
  50% {
    box-shadow: 0 0 24px rgba(186, 255, 57, 0.4);
  }
}
```

---

## Interactive States

### Buttons

- **Default**: Solid background, no shadow
- **Hover**: Lighter background, subtle glow
- **Active**: Slightly darker, pressed-in appearance
- **Disabled**: Reduced opacity (0.5), no hover effects

### Cards

- **Default**: Neumorphic inset shadow
- **Hover**: Elevated with glow
- **Active/Selected**: Accent border glow

### Inputs

- **Default**: Subtle border, inset shadow
- **Focus**: Acid Lime border, outer glow
- **Error**: Error color border, red tint glow
- **Filled**: Slightly elevated appearance

---

## Animation Timings

| Name   | Duration | Easing                           | Usage                |
| ------ | -------- | -------------------------------- | -------------------- |
| Fast   | 150ms    | ease-out                         | Micro-interactions   |
| Normal | 250ms    | cubic-bezier(0.4, 0, 0.2, 1)     | Standard transitions |
| Smooth | 350ms    | cubic-bezier(0.4, 0, 0.2, 1)     | Page transitions     |
| Slow   | 500ms    | cubic-bezier(0.25, 0.1, 0.25, 1) | Emphasis animations  |

---

## Responsive Breakpoints

| Name    | Min Width | Max Width | Target Device               |
| ------- | --------- | --------- | --------------------------- |
| mobile  | 0         | 639px     | Phones (portrait)           |
| tablet  | 640px     | 1023px    | Tablets, phones (landscape) |
| desktop | 1024px    | 1439px    | Laptops, small desktops     |
| wide    | 1440px    | ∞         | Large monitors              |

---

## Component Patterns

### Ingredient Tags

- Pill-shaped with Acid Lime background
- Dark text for contrast
- Subtle scale animation on add/remove
- X button for removal

### Cocktail Cards

- Neumorphic dark cards
- Hover lifts card with glow
- Image or icon with gradient overlay
- Bold name with subtle method preview

### Recipe Modal

- Full-screen glass panel
- Magazine-style layout
- Large drink name typography
- Scalable ingredient list
- Interactive checklist mode

### Party Mode Slider

- Custom styled range input
- Acid Lime track fill
- Knob with glow effect
- Current scale prominently displayed

---

## Iconography

Use a consistent icon set (recommended: **Lucide Icons** or **Tabler Icons**):

- Stroke width: 1.5-2px
- Size: Match text size or use 24px default
- Color: Inherit from text color

---

## Accessibility Notes

- Ensure 4.5:1 contrast ratio for body text
- Ensure 3:1 contrast ratio for large text and UI elements
- Focus states should be clearly visible
- All interactive elements must be keyboard accessible
- Reduced motion preference should disable animations
