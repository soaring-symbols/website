// A setting guessed from each upload, which a pick by hand overrides until
// the next guess. `from` says what the guess was read from ('file name',
// 'viewBox', 'colors'), and is null once the user picks.
export function useGuess<T>(initial: T) {
  const guess = reactive({
    value: initial,
    from: null as string | null,
    // A guess that finds nothing keeps the value and drops its source
    set(value: T | undefined, from: string | null) {
      if (value !== undefined) guess.value = value as never
      guess.from = value === undefined ? null : from
    },
    pick(value: T) {
      guess.value = value as never
      guess.from = null
    },
  })

  return guess
}
