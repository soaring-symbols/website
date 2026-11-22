// Copies text to the clipboard. When the browser refuses (a denied
// permission, an insecure page, or one without focus) it says what to do
// instead and returns false; on success it returns true and leaves the
// confirmation (a check, a toast) to the caller
export function useCopy() {
  const toast = useToast()

  return async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      return true
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
  }
}
