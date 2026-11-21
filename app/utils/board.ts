// Tabs set on the departure board's dark panel, in either theme: the board's
// lettering, dimmed until picked, over a signal-yellow line
export const BOARD_TABS_UI = {
  root: 'gap-0',
  list: 'gap-1 border-white/10 px-2 pt-2 pb-0',
  indicator: 'h-0.5 bg-signal-500',
  trigger:
    'cursor-pointer font-semibold data-[state=active]:text-flap-ink data-[state=inactive]:text-flap-ink/55 hover:data-[state=inactive]:not-disabled:text-flap-ink focus-visible:outline-2 focus-visible:outline-signal-500',
  leadingIcon: 'size-4',
  content: 'rounded-none focus-visible:outline-signal-500',
}
