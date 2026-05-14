<template>
  <UDashboardPanel>
    <template #body>
      <UPageHeader title="SVG Validator">
        <template #description>
          Validate your airline SVG assets against the
          <a
            href="https://github.com/anhthang/soaring-symbols/blob/main/CONTRIBUTING.md"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary hover:underline"
            >contribution guidelines</a
          >.
        </template>
      </UPageHeader>

      <SvgValidator />
    </template>
  </UDashboardPanel>
</template>
