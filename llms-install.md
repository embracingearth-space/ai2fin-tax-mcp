# Install the AI2Fin Tax MCP

This is a **remote** MCP server — no build, no API key, nothing to run locally.

- **Endpoint:** `https://taxmcp.ai2fin.com` (MCP streamable HTTP; POST JSON-RPC)
- **Auth:** none. Stateless; nothing you send is stored.

## Cline

Add to `cline_mcp_settings.json` (MCP Servers → Configure MCP Servers):

```json
{
  "mcpServers": {
    "ai2fin-tax": {
      "type": "streamableHttp",
      "url": "https://taxmcp.ai2fin.com",
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

## Claude (Desktop / claude.ai)

Settings → Connectors → Add custom connector → `https://taxmcp.ai2fin.com`

## Cursor

`.cursor/mcp.json`:

```json
{ "mcpServers": { "ai2fin-tax": { "url": "https://taxmcp.ai2fin.com" } } }
```

## Verify it works

```bash
curl -s https://taxmcp.ai2fin.com -X POST -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Expect 6 tools: `tax_rate_lookup`, `compute_gst_vat`, `compare_countries`,
`income_tax_estimate`, `company_tax_estimate`, `cgt_estimate`.
