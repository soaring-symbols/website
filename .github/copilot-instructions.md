---
name: soaring-symbols-instructions
description: "Workspace instructions for the Soaring Symbols website project"
---

# Soaring Symbols Website

This is a Nuxt 4 website showcasing world airlines and their iconic symbols.

## Project Overview

- **Framework**: Nuxt 4 + Vue 3
- **UI Library**: Nuxt UI (all components use Nuxt UI)
- **Styling**: Tailwind CSS
- **Icons**: Hugeicons

## Key Features

1. **Homepage with Project Info Section**: Introduction to the Soaring Symbols project
2. **Featured Airline Section**: Randomly displays an airline with logo and details (refreshable)
3. **Responsive Design**: Works on all device sizes
4. **Dark Mode Support**: Full light/dark theme support
5. **Hugeicons**: 5000+ icons available for UI components

## Project Structure

```
/components     - Nuxt UI components (AirlineFeature, etc.)
/composables    - Vue composables (useRandomAirline)
/data           - Static data (airlines.ts)
/app            - Root app component
/public         - Static assets
```

## Development Commands

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Generate static site
bun run generate
```

## Important Notes

- **All UI uses Nuxt UI**: No custom HTML elements, always prefer Nuxt UI components
- **Component Auto-Import**: No imports needed for Nuxt UI components
- **Dark Mode**: Components automatically support both light/dark modes
- **Icons**: Use `hugeicons:*` format for icons (e.g., `icon="hugeicons:heart"`)
- **Vue Script**: Use `<script setup>` (plain JavaScript, no `lang="ts"`)
- **Vue Block Order**: `<template>` → `<script setup>` → `<style scoped>`

## Customization

When working on this project:

1. Add new components to `/components`
2. Add reusable logic to `/composables`
3. Update `/data/airlines.ts` to add more airlines
4. The `.github/instructions/nuxt-ui.instructions.md` file provides Nuxt UI guidelines

All UI development should follow the Nuxt UI component library conventions.
