# THEME MIGRATION TASK

## Samvidhan Sarthi – Constitutional Light Theme Migration

### Context

This project is a Constitutional Literacy Platform called **Samvidhan Sarthi**.

The current frontend uses a dark SaaS-style theme based on:

* Black/slate backgrounds
* Sky-blue primary colors
* Purple secondary colors
* Glow effects
* Dashboard-like aesthetics

This visual style does not align with the project's purpose.

The goal is to migrate the application to a light constitutional theme inspired by:

* Constitution of India
* Government of India digital platforms
* Educational platforms
* Civic technology products

---

# IMPORTANT RULES

## Allowed

* Change colors
* Change Tailwind theme tokens
* Change color utilities
* Change borders
* Change shadows
* Change hover colors
* Change focus states
* Change gradients if needed
* Improve visual consistency

---

## NOT ALLOWED

Do NOT:

* Redesign layouts
* Move components
* Change page structure
* Change routing
* Change responsiveness
* Change navigation
* Change business logic
* Change state management
* Rename components
* Delete features
* Introduce new screens

This is a THEME MIGRATION only.

---

# PROJECT ANALYSIS REQUIREMENT

Before making changes:

1. Analyze the entire codebase.
2. Identify all sources of styling.
3. Identify all color definitions.
4. Identify all hardcoded colors.
5. Identify all custom Tailwind colors.
6. Identify shared UI components.
7. Determine how colors propagate through the application.

Do not blindly apply replacements.

Use architectural judgment.

---

# THEME DIRECTION

The application should feel:

* Educational
* Trustworthy
* Government-inspired
* Accessible
* Modern
* Citizen-friendly

The application should NOT feel:

* Futuristic
* Cyberpunk
* Gaming dashboard
* NASA interface
* Crypto application
* Developer tool

---

# COLOR SYSTEM

## Primary Color

Ashoka Chakra Blue

```text
#054187
```

Use for:

* Navigation
* Headers
* Primary buttons
* Active states
* Links

---

## Secondary Color

Indian Saffron

```text
#FF9933
```

Use for:

* Secondary actions
* Highlights
* Quiz accents
* Progress indicators

---

## Success Color

India Green

```text
#138808
```

Use for:

* Success states
* Completion indicators
* Achievements
* Correct answers

---

# SURFACE COLORS

Primary Surface

```text
#FFFFFF
```

Secondary Surface

```text
#F8F9FA
```

Tertiary Surface

```text
#F5F7F2
```

Soft Surface

```text
#FFFDF7
```

---

# TEXT COLORS

Primary

```text
#1F2937
```

Secondary

```text
#6B7280
```

Muted

```text
#9CA3AF
```

---

# EXISTING THEME MIGRATION

The current codebase contains:

* dark color palette
* slate backgrounds
* sky-blue primary palette
* purple secondary palette
* glow shadows

These should be replaced.

Claude should determine the safest migration strategy.

---

# TAILWIND REQUIREMENTS

Review:

* tailwind.config.js
* global CSS
* utility classes
* reusable components

Create a cleaner color system.

Avoid introducing duplicated color definitions.

All colors should originate from centralized theme tokens.

---

# DARK THEME REMOVAL

Remove visual dependency on:

* dark backgrounds
* dark cards
* dark panels
* dark sidebars
* dark dropdowns
* dark search results

Replace with light surfaces while preserving structure.

---

# COMPONENT AUDIT

Analyze and update:

* Layout
* Sidebar
* Header
* Search components
* Topic cards
* Content cards
* Quiz screens
* Profile pages
* Progress pages
* Game pages
* Learning pages
* Shared UI components

Preserve behavior.

Only improve visual theme consistency.

---

# SHADOWS

Current glow-style shadows should be removed.

Replace with subtle elevation.

Preferred style:

* Soft shadows
* Educational application feel
* Clean card hierarchy

Avoid:

* Neon glow
* Colored shadows
* Cyberpunk effects

---

# BORDERS

Use soft borders where needed.

Prefer:

```text
rgba(0,0,0,0.05)
```

or equivalent Tailwind utilities.

---

# ACCESSIBILITY

Ensure:

* Readable text contrast
* Clear hover states
* Clear active states
* Clear focus states

No light text on light backgrounds.

No low-contrast combinations.

---

# RESPONSIVE SAFETY

Do not alter:

* breakpoints
* flex layouts
* grid layouts
* spacing system

Only change theme-related styles.

---

# EXPECTED RESULT

The application should look like:

"A modern constitutional learning platform for Indian citizens."

It should visually align with:

* civic education
* government awareness initiatives
* educational technology

without looking like a dashboard product.

---

# DELIVERABLES

After completing the migration provide:

1. Files modified
2. Theme files modified
3. New color system created
4. Major theme decisions made
5. Remaining hardcoded colors
6. Components requiring manual review

Think through the architecture before making changes.

Do not perform blind search-and-replace operations.

# TECHNICAL COLOR MIGRATION RULES

## Current Theme Analysis

The current application uses:

### Primary Palette

```js
primary
50-950
```

Current visual identity:

```text
Sky Blue SaaS Theme
```

---

### Secondary Palette

```js
secondary
50-950
```

Current visual identity:

```text
Purple Accent Theme
```

---

### Dark Palette

```js
dark
100-500
```

Used extensively for:

* backgrounds
* cards
* headers
* sidebars
* search results
* navigation
* panels

This palette should be completely removed.

---

# NEW TAILWIND PALETTE

Replace existing colors with:

```js
colors: {
  primary: {
    50: '#EAF2FF',
    100: '#D6E6FF',
    200: '#AFCFFF',
    300: '#7DAEFF',
    400: '#4D8DFF',
    500: '#054187',
    600: '#04356F',
    700: '#032B59',
    800: '#022044',
    900: '#01152E'
  },

  secondary: {
    50: '#FFF4E6',
    100: '#FFE8CC',
    200: '#FFD199',
    300: '#FFBA66',
    400: '#FFA333',
    500: '#FF9933',
    600: '#E67F00',
    700: '#B36200',
    800: '#804600',
    900: '#4D2A00'
  },

  success: {
    50: '#EAF7EA',
    100: '#D5EFD5',
    200: '#ABDFAB',
    300: '#81CF81',
    400: '#57BF57',
    500: '#138808',
    600: '#0F6D06',
    700: '#0B5205',
    800: '#073703',
    900: '#031C02'
  },

  surface: {
    100: '#FFFFFF',
    200: '#FAFAFA',
    300: '#F8F9FA',
    400: '#F5F7F2',
    500: '#ECEFF1'
  }
}
```

---

# GLOBAL CSS MIGRATION

Replace:

```css
body {
  @apply text-gray-100;
  @apply bg-dark-400;
}
```

With:

```css
body {
  @apply text-gray-800;
  @apply bg-surface-300;
}
```

---

# COMPONENT CLASS REPLACEMENTS

## Backgrounds

Replace:

```text
bg-dark-500
bg-dark-400
bg-dark-300
bg-dark-200
bg-dark-100
```

Mapping:

```text
bg-dark-500 → bg-surface-400
bg-dark-400 → bg-surface-300
bg-dark-300 → bg-white
bg-dark-200 → bg-surface-200
bg-dark-100 → bg-surface-100
```

---

# Borders

Replace:

```text
border-dark-200
border-dark-300
border-gray-700
border-gray-800
```

With:

```text
border-gray-200
border-gray-300
```

Use lighter borders throughout.

---

# Text Migration

Replace:

```text
text-white
```

With:

```text
text-gray-900
```

for headings.

---

Replace:

```text
text-gray-300
```

With:

```text
text-gray-700
```

---

Replace:

```text
text-gray-400
```

With:

```text
text-gray-600
```

---

Replace:

```text
text-gray-500
```

With:

```text
text-gray-500
```

(no change)

---

# Hover States

Replace:

```text
hover:bg-dark-200
```

With:

```text
hover:bg-gray-100
```

---

Replace:

```text
hover:bg-dark-300
```

With:

```text
hover:bg-gray-50
```

---

# Navigation

Current:

```jsx
bg-primary-700/20
text-primary-400
```

Replace active navigation styling with:

```jsx
bg-primary-50
text-primary-600
border-l-4 border-primary-500
```

Keep layout unchanged.

---

# Cards

Current:

```jsx
.card {
  @apply bg-dark-300;
  @apply border-dark-200;
}
```

Replace:

```jsx
.card {
  @apply bg-white;
  @apply border border-gray-200;
  @apply shadow-sm;
}
```

---

# Inputs

Current:

```jsx
.input {
  @apply bg-dark-200;
}
```

Replace:

```jsx
.input {
  @apply bg-white;
  @apply border-gray-300;
  @apply text-gray-800;
}
```

---

# Search Dropdowns

Current search dropdowns use:

```text
bg-dark-200
bg-dark-300
```

Replace with:

```text
bg-white
bg-surface-200
```

---

# Topic Category Colors

Current hardcoded colors:

```js
#3498db
#9b59b6
#2ecc71
#e74c3c
#f39c12
```

Replace with theme colors.

Example:

```js
Fundamental Rights → primary-500
Directive Principles → secondary-500
Federal Structure → success-500
Judiciary → primary-600
Historical → secondary-400
```

Avoid random colors.

---

# Remove Glow Effects

Delete:

```js
shadow-glow
shadow-glow-purple
```

Replace with:

```js
shadow-sm
shadow
shadow-md
```

only.

---

# Dark Mode

Current:

```js
darkMode: 'class'
```

If application does not support dark mode:

Remove dark mode configuration completely.

If dark mode exists elsewhere:

Keep configuration but do not use dark theme styles.

---

# Final Validation

After migration:

Search project for:

```text
bg-dark-
border-dark-
shadow-glow
shadow-glow-purple

#0ea5e9
#d946ef

#111827
#0f172a
#1e293b

text-white
```

Review each remaining occurrence manually.

No dark dashboard styling should remain.
