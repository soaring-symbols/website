export default defineAppConfig({
  ui: {
    colors: {
      primary: 'signal',
      secondary: 'indigo',
      success: 'emerald',
      info: 'teal',
      warning: 'amber',
      error: 'rose',
      neutral: 'slate',
    },
    icons: {
      arrowDown: 'solar:arrow-down-linear',
      arrowLeft: 'solar:arrow-left-linear',
      arrowRight: 'solar:arrow-right-linear',
      arrowUp: 'solar:arrow-up-linear',
      check: 'solar:check-linear',
      chevronDoubleLeft: 'solar:double-alt-arrow-left-linear',
      chevronDoubleRight: 'solar:double-alt-arrow-right-linear',
      chevronDown: 'solar:alt-arrow-down-linear',
      chevronLeft: 'solar:alt-arrow-left-linear',
      chevronRight: 'solar:alt-arrow-right-linear',
      chevronUp: 'solar:alt-arrow-up-linear',
      close: 'solar:close-linear',
      external: 'solar:arrow-right-up-linear',
      search: 'solar:magnifier-linear',
      system: 'solar:monitor-linear',
      light: 'solar:sun-2-linear',
      dark: 'solar:moon-linear',
      ellipsis: 'solar:menu-dots-linear',
      file: 'solar:file-linear',
      folder: 'solar:folder-linear',
      folderOpen: 'solar:folder-open-linear',
      loading: 'solar:refresh-linear',
      minus: 'solar:minus-linear',
      plus: 'solar:add-linear',
      upload: 'solar:upload-minimalistic-linear',
      caution: 'solar:danger-circle-linear',
      copy: 'solar:copy-linear',
      copyCheck: 'solar:check-read-linear',
      error: 'solar:close-circle-linear',
      eye: 'solar:eye-linear',
      eyeOff: 'solar:eye-closed-linear',
      hash: 'solar:hashtag-linear',
      info: 'solar:info-circle-linear',
      menu: 'solar:hamburger-menu-linear',
      panelClose: 'solar:sidebar-minimalistic-linear',
      panelOpen: 'solar:sidebar-minimalistic-linear',
      reload: 'solar:restart-linear',
      stop: 'solar:stop-linear',
      success: 'solar:check-circle-linear',
      tip: 'solar:lightbulb-linear',
      warning: 'solar:danger-triangle-linear',
      sortNumberAsc: 'solar:sort-from-bottom-to-top-linear',
      sortNumberDesc: 'solar:sort-from-top-to-bottom-linear',
      sortAlphaAsc: 'solar:sort-by-alphabet-linear',
      sortAlphaDesc: 'solar:sort-alphabetically-linear',
      sortManual: 'solar:sort-vertical-linear',
    },
    alert: {
      defaultVariants: {
        variant: 'soft',
      },
    },
    badge: {
      defaultVariants: {
        color: 'neutral',
        variant: 'soft',
      },
    },
    button: {
      slots: {
        base: 'cursor-pointer',
        label: 'hidden md:block',
      },
      defaultVariants: {
        color: 'neutral',
        variant: 'soft',
      },
    },
    formField: {
      slots: {
        help: 'text-xs',
      },
    },
    modal: {
      slots: {
        content: 'divide-none',
        body: '!pt-0',
        footer: 'justify-end',
      },
    },
    radioGroup: {
      slots: {
        fieldset: 'gap-x-4',
        description: 'text-xs',
      },
    },
    pageCard: {
      slots: {
        footer: 'flex gap-2',
        container: 'p-3 sm:p-4',
      },
    },
    pageColumns: {
      base: 'gap-4',
    },
    pageGrid: {
      base: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4',
    },
    pageHeader: {
      slots: {
        root: 'border-none py-0',
        wrapper: 'sm:flex-row sm:items-center sm:justify-between',
        // Page titles; a section heading on a page header sets its own size
        title:
          'cap-center min-w-0 text-4xl sm:text-5xl font-extrabold tracking-tight text-balance',
        description: 'text-lg text-toned',
        links: 'shrink-0',
      },
      variants: {
        title: {
          true: { description: 'mt-3' },
        },
      },
    },
    // Sections sit inside the layout's container, one under another with a
    // rule between them (none above the first, right under the page header),
    // headed on the left like the rest of the site
    pageSection: {
      slots: {
        root: 'border-t border-default first-of-type:border-t-0',
        container: 'px-0 sm:px-0 lg:px-0 sm:py-16 lg:py-24 gap-10 sm:gap-10',
        // A one-column template, so a long line in a feature cannot widen it
        features: 'grid-cols-1',
        title: 'sm:text-3xl lg:text-3xl font-extrabold text-balance',
        description: 'sm:text-base text-toned',
      },
      variants: {
        orientation: {
          vertical: {
            headline: 'justify-start',
            leading: 'justify-start',
            title: 'text-start',
            description: 'text-start text-pretty',
            links: 'justify-start',
          },
          // Text and its companion start level rather than centered
          horizontal: { container: 'lg:items-start' },
        },
        title: {
          true: { description: 'mt-3' },
        },
      },
      compoundVariants: [
        { orientation: 'vertical', title: true, class: { body: 'mt-10' } },
        {
          orientation: 'vertical',
          description: true,
          class: { body: 'mt-10' },
        },
      ],
    },
    // Board-colored tiles, as behind the airline marks; in dark mode the mark
    // takes the signal yellow, like a sign at the gate
    pageFeature: {
      slots: {
        root: 'min-w-0',
        wrapper: 'min-w-0',
        leading: 'size-10 shrink-0 rounded-md bg-board',
        leadingIcon: 'text-flap-ink dark:text-signal-500',
        title: 'font-bold',
        description: 'text-sm text-toned',
      },
      variants: {
        orientation: {
          horizontal: { root: 'gap-4', leading: 'p-0' },
        },
      },
    },
    marquee: {
      slots: {
        root: 'max-w-(--ui-container)',
      },
    },
    select: {
      slots: {
        content: 'min-w-fit',
      },
    },
  },
})
