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

// The CSS tab: a mark as a background, and a monochrome one as a mask over
// currentColor, the one way CSS can paint a file in the text color around
// it (an <img> or a background keeps the file's own black). Both set a size
// and inline-block, or an empty <span> shows nothing: the mark 48px like
// the HTML line, the monochrome one 1em, to sit in a line of text. The
// prefixed mask is for Chromium before 120.
export function usageCssTab(
  className: string,
  url: string,
  mono?: { className: string; url: string },
) {
  return {
    id: 'css',
    label: 'CSS',
    items: [
      {
        label: 'A mark as a background',
        code: [
          `.${className} {`,
          '  display: inline-block;',
          '  width: 48px;',
          '  height: 48px;',
          `  background: url(${url}) center / contain no-repeat;`,
          '}',
        ].join('\n'),
      },
      mono && {
        label: 'A monochrome mark in the text color',
        code: [
          `.${mono.className} {`,
          '  display: inline-block;',
          '  width: 1em;',
          '  height: 1em;',
          '  background: currentColor;',
          `  -webkit-mask: url(${mono.url}) center / contain no-repeat;`,
          `  mask: url(${mono.url}) center / contain no-repeat;`,
          '}',
        ].join('\n'),
      },
    ].filter((item) => !!item),
  }
}
