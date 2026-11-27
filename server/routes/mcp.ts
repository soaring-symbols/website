import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'

// The MCP server (Streamable HTTP): https://soaringsymbols.org/mcp, the
// tools in server/utils/mcp.ts. Stateless, with plain JSON answers and no
// session or stream, so each request is handled on its own like the rest of
// the API, by a fresh server and transport.
const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, DELETE, OPTIONS',
  'access-control-allow-headers':
    'content-type, accept, mcp-protocol-version, mcp-session-id, last-event-id',
  'access-control-expose-headers': 'mcp-session-id, mcp-protocol-version',
}

export default defineEventHandler(async (event) => {
  if (event.method === 'OPTIONS') {
    setResponseHeaders(event, CORS_HEADERS)

    return sendNoContent(event)
  }

  const server = createMcpServer(apiOrigin(event))
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  })
  await server.connect(transport)

  try {
    const response = await transport.handleRequest(toWebRequest(event))
    const headers = new Headers(response.headers)
    for (const [name, value] of Object.entries(CORS_HEADERS)) {
      headers.set(name, value)
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  } finally {
    await server.close()
  }
})
