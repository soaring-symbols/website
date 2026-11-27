// What the site, its API, the MCP server and the package offer, for AI
// assistants (https://llmstxt.org); prerendered, see server/utils/llms.ts
export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'text/plain; charset=utf-8')

  return llmsTxt(apiOrigin(event))
})
