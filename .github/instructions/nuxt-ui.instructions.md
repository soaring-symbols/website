---
name: nuxt-ui-instructions
description: "Auto-activated instructions for Nuxt UI component development in this Soaring Symbols project"
applyTo: "**/*.vue,**/*.ts"
---

# Nuxt UI Development Guidelines

This project uses **Nuxt UI** for all component development. When working on Vue components or Nuxt-related TypeScript files, follow these guidelines automatically:

## Key Principles

1. **Always Use Nuxt UI Components**: For any UI element, prefer Nuxt UI components (UButton, UCard, UContainer, etc.) over custom HTML
2. **Component Auto-Import**: All Nuxt UI components are auto-imported; no manual imports needed
3. **Icon System**: Use Hugeicons via `hugeicons:*` format (e.g., `icon="hugeicons:heart-check"`)
4. **Dark Mode Support**: Ensure components work in both light and dark modes using Tailwind classes

## Vue File Conventions

- **Block order**: `<template>` → `<script setup>` → `<style scoped>`
- **Script language**: Use plain JavaScript (`<script setup>`) — no `lang="ts"`

## Component Usage Patterns

### Cards & Containers

```vue
<!-- Layout wrapper -->
<UContainer class="py-12">
  <!-- Content card -->
  <UCard title="Title" description="Description">
    <p>Content here</p>
  </UCard>
</UContainer>
```

### Buttons & Icons

```vue
<!-- Button with icon -->
<UButton
  icon="hugeicons:refresh"
  size="sm"
  color="gray"
  variant="ghost"
  @click="handleClick"
/>
```

### Forms & Inputs

```vue
<UForm :schema="schema" @submit="onSubmit">
  <UFormGroup label="Field Label" name="fieldName">
    <UInput v-model="form.fieldName" />
  </UFormGroup>
</UForm>
```

## Helpful Tools

When developing Nuxt UI components, I have access to:

- **Component Documentation**: `mcp_nuxt_ui_get-component` - Get detailed component docs
- **Component Search**: `mcp_nuxt_ui_search-components` - Find components by name
- **Code Examples**: `mcp_nuxt_ui_get-example` - View real implementation examples
- **Icons Search**: `mcp_nuxt_ui_search-icons` - Find available Lucide icons

## File Structure

- `/components/` - Reusable Nuxt UI components
- `/composables/` - Vue composables (hooks)
- `/data/` - Static data and constants
- `/pages/` - Page components (add as needed)

## Key Libraries

- **@nuxt/ui**: ^4.7.1 - UI component library
- **Tailwind CSS**: Built-in with Nuxt UI for styling
- **Hugeicons**: Icon system (5000+ icons available)
- **Nuxt**: ^4.4.5

## Auto-Apply This

Whenever you work with Vue components (`.vue` files) or Nuxt TypeScript files in this project, these guidelines are automatically applied. No need to repeat instructions about Nuxt UI usage.
