// A value as a single-quoted JavaScript string, for sample code
export function usageQuote(value: unknown) {
  return `'${String(value).replace(/'/g, "\\'")}'`
}

// Turns a sample result into comment lines under the code that returns it
export function usageComment(text: string) {
  return text
    .split('\n')
    .map((line) => `// ${line}`)
    .join('\n')
}
