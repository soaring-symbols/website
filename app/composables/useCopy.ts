// Copies text to the clipboard. When the browser refuses (a denied
// permission, an insecure page, or one without focus) it says what to do
// instead and returns false. On success it returns true and holds the text
// in copied for a moment, so a button can show a check: copied is truthy
// for a single button, and equal to its own text for one of several
export function useCopy() {
  const toast = useToast()
  const copied = ref<string | null>(null)
  let timer: ReturnType<typeof setTimeout> | undefined

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      toast.add({
        title: 'Couldn’t copy',
        description:
          'Your browser blocked the clipboard. Select the text and copy it yourself.',
        color: 'error',
        icon: 'solar:danger-triangle-linear',
      })
      return false
    }

    copied.value = text
    clearTimeout(timer)
    timer = setTimeout(() => (copied.value = null), 1500)
    return true
  }

  return { copy, copied }
}
