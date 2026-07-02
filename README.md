# Tax MCP

The [Model Context Protocol](https://modelcontextprotocol.io) server behind the free tax tools at **[ai2fin.com/tools/compare](https://ai2fin.com/tools/compare)** — so assistants (Claude, ChatGPT, agents) can call them directly.

> **Stateless and no-auth.** It computes over public rate data only and stores nothing. (This is separate from the authenticated app MCP at `app.ai2fin.com/mcp`, which works on your real financial data behind OAuth.)

## Tools

| Tool | What it does |
|---|---|
| `tax_rate_lookup` | A country's GST/VAT, income and company tax rates |
| `compute_gst_vat` | Add or remove a country's GST/VAT on an amount |
| `compare_countries` | Compare tax across countries — [ai2fin.com/tools/compare](https://ai2fin.com/tools/compare) as a callable |

`income_tax_estimate` is intentionally **not** exposed yet — it's the highest-liability tool and will ship once income-tax brackets are generated (not vendored). Every result carries a "general information, not tax advice" note.

## Data = single source

`data/rates.json` is produced by the website's `gen:tax` pipeline — the same source behind the [calculator and comparison pages](https://ai2fin.com/tools/compare) — so the MCP, the widgets and the pages never disagree. Don't hand-edit it.

## Run / deploy

```bash
cd tax-mcp
npm install
npm run dev      # local: POST JSON-RPC to http://localhost:8787
npm run deploy   # to Cloudflare; then map a route e.g. taxmcp.ai2fin.com
npm run bundle   # writes dist/worker.js — a single paste-ready file for the
                 # Cloudflare dashboard editor when the CLI isn't available
```

Full deploy steps (dashboard copy-paste **or** CLI): **[DEPLOY.md](DEPLOY.md)**.
Listing it in the MCP directories: **[REGISTRY.md](REGISTRY.md)**.

Abuse protection is via the Cloudflare dashboard (rate limiting + WAF) — not auth.

## Connect

Add the deployed URL as a custom MCP connector in Claude (Settings → Connectors) or ChatGPT (developer mode). A `GET` to the root returns server info; the MCP handshake is `POST` JSON-RPC (`initialize` → `tools/list` → `tools/call`). It pairs with the live comparison tool at [ai2fin.com/tools/compare](https://ai2fin.com/tools/compare).

## Quick check

```bash
curl -s https://taxmcp.ai2fin.com -X POST -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"compute_gst_vat","arguments":{"country":"AU","amount":100,"mode":"add"}}}'
```
