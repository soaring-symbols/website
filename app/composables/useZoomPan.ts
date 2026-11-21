import type { Ref } from 'vue'

// Zoom and pan for a box (`viewport`) that shows one element (`content`),
// centered in it and scaled around its center: buttons call zoomBy/reset,
// Ctrl or ⌘ + scroll (a trackpad pinch sends the same) and a double-click
// zoom at the pointer, and a drag moves the content once it is larger than
// the box. Bind `transform` as the content's style and the handlers on the
// viewport; give the viewport overflow-clip, not hidden, since a hidden box
// still scrolls when the browser brings a focused button into view.
export function useZoomPan(
  viewport: Ref<HTMLElement | null>,
  content: Ref<HTMLElement | null>,
  { min = 1, max = 16, step = 2 } = {},
) {
  const zoom = ref(1)
  const offset = reactive({ x: 0, y: 0 })
  const dragging = ref(false)
  // Whether the scaled content is larger than the box, so a drag can move it
  const pannable = ref(false)
  let drag: { x: number; y: number } | null = null

  // Keep the content over the box: it moves only as far as it overflows
  function clamp() {
    const box = viewport.value
    const inner = content.value
    if (!box || !inner) return
    const reach = (boxSize: number, size: number) =>
      Math.max(0, (size * zoom.value - boxSize) / 2)
    const x = reach(box.clientWidth, inner.offsetWidth)
    const y = reach(box.clientHeight, inner.offsetHeight)
    offset.x = Math.min(x, Math.max(-x, offset.x))
    offset.y = Math.min(y, Math.max(-y, offset.y))
    pannable.value = x > 0 || y > 0
  }

  // Zoom to `next`, keeping what is under `point` (from the box's center)
  // where it is
  function zoomTo(next: number, point = { x: 0, y: 0 }) {
    const target = Math.min(max, Math.max(min, next))
    const ratio = target / zoom.value
    offset.x = point.x - (point.x - offset.x) * ratio
    offset.y = point.y - (point.y - offset.y) * ratio
    zoom.value = target
    clamp()
  }

  const zoomBy = (factor: number, point?: { x: number; y: number }) =>
    zoomTo(zoom.value * factor, point)

  function reset() {
    zoom.value = 1
    offset.x = 0
    offset.y = 0
    clamp()
  }

  const pointOf = (event: MouseEvent) => {
    const rect = viewport.value!.getBoundingClientRect()
    return {
      x: event.clientX - rect.left - rect.width / 2,
      y: event.clientY - rect.top - rect.height / 2,
    }
  }

  // A plain scroll still scrolls the page
  function onWheel(event: WheelEvent) {
    if (!event.ctrlKey && !event.metaKey) return
    event.preventDefault()
    zoomBy(Math.exp(-event.deltaY * 0.01), pointOf(event))
  }

  function onDoubleClick(event: MouseEvent) {
    if (zoom.value >= max) reset()
    else zoomBy(step, pointOf(event))
  }

  function onPointerDown(event: PointerEvent) {
    if (!pannable.value || event.button !== 0) return
    viewport.value!.setPointerCapture(event.pointerId)
    drag = { x: event.clientX - offset.x, y: event.clientY - offset.y }
    dragging.value = true
  }

  function onPointerMove(event: PointerEvent) {
    if (!drag) return
    offset.x = event.clientX - drag.x
    offset.y = event.clientY - drag.y
    clamp()
  }

  function onPointerUp() {
    drag = null
    dragging.value = false
  }

  const transform = computed(
    () => `translate(${offset.x}px, ${offset.y}px) scale(${zoom.value})`,
  )
  const cursor = computed(() =>
    pannable.value ? (dragging.value ? 'cursor-grabbing' : 'cursor-grab') : '',
  )

  return {
    zoom,
    transform,
    cursor,
    zoomBy,
    reset,
    handlers: {
      wheel: onWheel,
      dblclick: onDoubleClick,
      pointerdown: onPointerDown,
      pointermove: onPointerMove,
      pointerup: onPointerUp,
      pointercancel: onPointerUp,
    },
  }
}
