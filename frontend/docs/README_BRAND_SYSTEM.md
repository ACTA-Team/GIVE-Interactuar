This document summarizes the **brand rules and design system** of Interactuar for use inside this repository.

It is intended to be used by:

- developers
- designers
- AI agents
- code generation tools
- UI generation tools

This document acts as the **single source of truth** for visual and design decisions inside the repository.

If UI, CSS, or components are generated automatically, they **must follow the rules defined here unless explicitly instructed otherwise**.

---

# 1. Brand Identity

The Interactuar logo is primarily **typographic**, where the letter **"i" acts as a symbol** connecting two points.

This visual metaphor represents:

- interaction
- connection
- collaboration
- business growth
- support and progress

Design outputs should try to reflect these values through:

- clarity
- simplicity
- professional tone
- structured layouts

---

# 2. Core Brand Colors

The brand uses **three primary colors**.

The **deep blue must dominate the interface** and should represent **more than 60% of the visual composition**.

## Primary Palette

| Color     | HEX       | RGB        | Usage                |
| --------- | --------- | ---------- | -------------------- |
| Deep Blue | `#021442` | 2,20,66    | Primary brand color  |
| Cyan      | `#20A7D1` | 32,167,209 | Interactive elements |
| Orange    | `#EA4E2F` | 234,78,47  | Alerts / CTAs        |

## Secondary Palette

| Color  | HEX       | Usage          |
| ------ | --------- | -------------- |
| Gray   | `#808080` | Secondary text |
| Yellow | `#FFAB00` | Warnings       |

### Color Usage Rules

Deep blue should dominate the UI.

Use cyan for:

- buttons
- links
- active states
- highlights

Use orange only for:

- important actions
- alerts
- notifications

Secondary palette should be used **sparingly**.

---

# 3. Design Tokens

All UI implementations should derive colors from these tokens.

```css
:root {
  /* Brand */
  --color-primary: #021442;
  --color-accent: #20a7d1;
  --color-danger: #ea4e2f;

  /* Supporting */
  --color-gray: #808080;
  --color-warning: #ffab00;

  /* Backgrounds */
  --bg-primary: #ffffff;
  --bg-secondary: #f5f7fb;

  /* Text */
  --text-primary: #021442;
  --text-secondary: #808080;
}
```

AI-generated components should reference these tokens instead of hardcoded values.

---

# 4. Typography

Primary typeface:

```
Manrope
```

Recommended weights:

```
Light
Medium
Semibold
Bold
```

Fallback typeface:

```
Arial
```

Arial should only be used for:

- documents
- emails
- Office environments

All UI components should prioritize **Manrope**.

---

# 5. Logo Usage

Minimum sizes:

| Medium  | Minimum Size |
| ------- | ------------ |
| Print   | 2.5 cm       |
| Digital | 70 px        |

The logo must **never be used below these sizes**.

---

# 6. Logo Protection Area

The protection area around the logo is defined by **X**, where:

```
X = height of the letter "i" in the logo
```

A minimum margin of **X** must be maintained around the logo.

This ensures visibility and visual clarity.

---

# 7. Incorrect Logo Usage

The following modifications are not allowed:

- changing logo colors
- altering proportions
- separating the symbol from the typography
- adding shadows
- rearranging logo elements
- replacing the word "Interactuar"
- embedding the logo inside paragraphs or text blocks

The logo must remain consistent across all interfaces.

---

# 8. UI Guidelines

When generating UI components, the interface should follow these principles.

### Layout

Prefer:

- card-based layouts
- structured grids
- clear hierarchy
- generous spacing

Avoid:

- cluttered layouts
- overly decorative UI
- heavy gradients

---

# 9. Backgrounds

Recommended backgrounds:

```
white
very light gray
subtle tinted brand colors
```

Avoid dark backgrounds unless the layout explicitly requires it.

---

# 10. Recommended Component System

Interfaces should be built with reusable components.

Recommended base components:

```
Button
Input
Select
Card
StatCard
Table
Badge
Modal
Tabs
Sidebar
Topbar
ChartCard
Pagination
EmptyState
```

Components should be **generic and reusable** rather than tied to specific pages.

Example:

Good

```
Table
```

Bad

```
ClientTable
```

The specific implementation should wrap the generic component.

---

# 11. Dashboard Structure

Most interfaces in this repository will follow a dashboard pattern.

Typical structure:

```
Sidebar
Topbar
Content Area
Cards
Tables
Charts
```

Sidebar should use the **primary blue color**.

Content areas should remain **light and neutral**.

---

# 12. Visual Principles

All generated interfaces should aim for:

```
clarity
consistency
readability
simplicity
professional tone
```

Avoid:

```
visual noise
too many colors
inconsistent spacing
mixed typography
```

---

# 13. AI Generation Rules

When an AI tool generates:

- UI
- CSS
- components
- layouts
- dashboards

it must follow these rules:

1. Use the brand color tokens.
2. Prefer Manrope typography.
3. Maintain a blue-dominant visual hierarchy.
4. Prefer reusable components.
5. Avoid introducing new colors unless necessary.
6. Maintain simple, clean layouts.

If design decisions are unclear, prioritize:

```
simplicity
consistency
brand blue dominance
```

---

# 14. Purpose of This Document

This file exists so that **AI systems interacting with this repository** understand the brand system and produce **consistent UI and code outputs**.

If conflicts arise between generated code and this document, **this document takes precedence**.
