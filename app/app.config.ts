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
      arrowDown: 'hugeicons:arrow-down-02',
      arrowLeft: 'hugeicons:arrow-left-02',
      arrowRight: 'hugeicons:arrow-right-02',
      arrowUp: 'hugeicons:arrow-up-02',
      check: 'hugeicons:tick-02',
      chevronDoubleLeft: 'hugeicons:arrow-left-double',
      chevronDoubleRight: 'hugeicons:arrow-right-double',
      chevronDown: 'hugeicons:arrow-down-01',
      chevronLeft: 'hugeicons:arrow-left-01',
      chevronRight: 'hugeicons:arrow-right-01',
      chevronUp: 'hugeicons:arrow-up-01',
      close: 'hugeicons:cancel-01',
      external: 'hugeicons:arrow-up-right-01',
      search: 'hugeicons:search-01',
      system: 'hugeicons:computer',
      light: 'hugeicons:sun-02',
      dark: 'hugeicons:moon-02',
      ellipsis: 'hugeicons:more-horizontal',
      file: 'hugeicons:file-01',
      folder: 'hugeicons:folder-01',
      folderOpen: 'hugeicons:folder-02',
      loading: 'hugeicons:loading-03',
      minus: 'hugeicons:minus-sign',
      plus: 'hugeicons:plus-sign',
      upload: 'hugeicons:upload-03',
      caution: 'hugeicons:alert-circle',
      copy: 'hugeicons:copy-01',
      copyCheck: 'hugeicons:tick-double-02',
      error: 'hugeicons:cancel-circle',
      eye: 'hugeicons:view',
      eyeOff: 'hugeicons:view-off-slash',
      hash: 'hugeicons:grid',
      info: 'hugeicons:information-circle',
      menu: 'hugeicons:menu-01',
      panelClose: 'hugeicons:layout-align-left',
      panelOpen: 'hugeicons:layout-align-right',
      reload: 'hugeicons:rotate-clockwise',
      stop: 'hugeicons:square',
      success: 'hugeicons:checkmark-circle-02',
      tip: 'hugeicons:idea-01',
      warning: 'hugeicons:alert-02',
      sortNumberAsc: 'hugeicons:sorting-1-9',
      sortNumberDesc: 'hugeicons:sorting-9-1',
      sortAlphaAsc: 'hugeicons:sorting-a-z-02',
      sortAlphaDesc: 'hugeicons:sorting-z-a-01',
      sortManual: 'hugeicons:arrange',
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
    // rule between them, headed on the left like the rest of the site
    pageSection: {
      slots: {
        root: 'border-t border-default',
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
    // Board-colored tiles, as behind the airline marks
    pageFeature: {
      slots: {
        root: 'min-w-0',
        wrapper: 'min-w-0',
        leading: 'size-10 shrink-0 rounded-md bg-board',
        leadingIcon: 'text-flap-ink',
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
