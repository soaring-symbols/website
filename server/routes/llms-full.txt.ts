// /llms.txt plus every airline and alliance in the package, one line each;
// prerendered, see server/utils/llms.ts
export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'text/plain; charset=utf-8')

  return llmsFull(apiOrigin(event))
})
