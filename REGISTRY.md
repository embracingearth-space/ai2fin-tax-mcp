# Listing the Tax MCP in the directories

Goal: get `taxmcp.ai2fin.com` discoverable in the places agents and developers
look for MCP servers. **All of these need the worker deployed first** (a live
URL) — see [`DEPLOY.md`](DEPLOY.md).

Order matters: publish to the **official registry** first; PulseMCP and others
ingest from it automatically, so one good publish does most of the work.

---

## 0. Prerequisite: a public repo for the server

The directories link to and (for the official registry) verify ownership via a
**public GitHub repo**. This server currently lives inside the private
`ai2fin-Website-Front` repo, so before listing, mirror `tax-mcp/` into a small
public repo, e.g. `github.com/embracingearth-space/ai2fin-tax-mcp`, and point
[`server.json`](server.json) `repository.url` at it (already set to that path).

## 1. Official MCP Registry (registry.modelcontextprotocol.io)

The manifest is [`server.json`](server.json) — already filled in (schema
`2025-12-11`, remote `streamable-http` → `https://taxmcp.ai2fin.com`). The
`name` is `io.github.embracingearth-space/ai2fin-tax-mcp`; the `io.github.<org>`
namespace is authorised by logging in as that GitHub org/owner.

```bash
# one-time: install the publisher CLI (needs working npm)
npm i -g @modelcontextprotocol/publisher    # or: brew install mcp-publisher

cd tax-mcp
mcp-publisher login github                  # OAuth as embracingearth-space
mcp-publisher validate server.json          # checks against the live schema
mcp-publisher publish server.json
```

If the headline tool surface changes, bump `version` and re-publish.

## 2. PulseMCP (pulsemcp.com)

PulseMCP crawls the official registry and GitHub, and accepts manual submissions.
After step 1, either wait for ingestion or submit directly at
**https://www.pulsemcp.com/submit** with:
- Server name: **AI2Fin Tax MCP**
- Repo: the public repo from step 0
- Hosted URL: `https://taxmcp.ai2fin.com`
- One-liner: *Free, no-auth GST/VAT, income and company tax lookup, GST/VAT
  add-remove, and country comparison for 50 countries.*

## 3. mcp.so

Submit at **https://mcp.so/submit** (or the "Submit" link in the nav) with the
same name, repo, hosted URL and one-liner as above. mcp.so also picks up servers
that are in the official registry.

---

## Listing copy (reuse everywhere)

- **Name:** AI2Fin Tax MCP
- **Category:** Finance / Tax / Developer tools
- **Transport:** Remote, `streamable-http` (HTTP JSON-RPC), no auth, stateless
- **Endpoint:** `https://taxmcp.ai2fin.com`
- **Tools:** `tax_rate_lookup`, `compute_gst_vat`, `compare_countries`
- **Tagline:** Live GST/VAT, income and company tax for 50 countries — the same
  data behind the free calculators at https://ai2fin.com/tools/compare.
- **Description:** A free, public Model Context Protocol server that lets any
  assistant look up a country's tax rates, add or remove GST/VAT on an amount,
  and compare tax across countries. Public rate data only; nothing is stored.
  Separate from the authenticated in-app assistant at app.ai2fin.com.

## Transport note (verify before publishing)

The worker answers `POST` JSON-RPC with a single `application/json` response —
the stateless mode of MCP **Streamable HTTP**, which is what `server.json`
declares. It does not open the optional `GET` SSE channel (a `GET` returns
server-info JSON instead). Mainstream clients (Claude connector, Cursor) work
with POST-only; if a stricter client needs the SSE channel, add it before
publishing. Smoke-test with the `curl` calls in [`DEPLOY.md`](DEPLOY.md).
