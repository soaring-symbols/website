// Turns a sample result into comment lines under the code that returns it
export function usageComment(text: string) {
  return text
    .split('\n')
    .map((line) => `// ${line}`)
    .join('\n')
}
