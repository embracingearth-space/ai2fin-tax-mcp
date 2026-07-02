# Deploying the Tax MCP Worker

Two ways to ship it to Cloudflare Workers. **Path A needs no CLI** (handy when
`wrangler`/npm is blocked); Path B is the canonical, repeatable one.

The worker is stateless and dependency-free. Target custom domain:
`taxmcp.ai2fin.com` (the `ai2fin.com` zone already lives in this Cloudflare
account, alongside the Pages site).

---

## Path A — Cloudflare dashboard, copy-paste (≈2 min, no CLI)

Use the pre-built single-file bundle: [`dist/worker.js`](dist/worker.js). It is
`src/index.ts` with `data/rates.json` inlined and the types stripped — one ES
module, nothing to install. Rebuild it any time with `npm run bundle`
(`node scripts/bundle-worker.mjs`).

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Create Worker**.
2. Name it **`ai2fin-tax-mcp`** → **Deploy** (accept the hello-world stub).
3. **Edit code** → in the editor select-all (Ctrl/Cmd-A) and delete, then paste
   the entire contents of `dist/worker.js` → **Deploy**.
4. You now have a live URL: `https://ai2fin-tax-mcp.<your-subdomain>.workers.dev`.
5. **Map the custom domain** (so the site's MCP page endpoint resolves):
   the worker → **Settings** → **Domains & Routes** → **Add** → **Custom domain**
   → `taxmcp.ai2fin.com` → **Add domain**. Cloudflare provisions the cert.

> The dashboard Worker editor is a single module. That's why we inline the data
> into one file — a multi-file `import` won't paste cleanly there.

## Path B — wrangler CLI (canonical, on a machine with working npm)

```bash
cd tax-mcp
npm install
npx wrangler login                 # interactive — or export CLOUDFLARE_API_TOKEN
npm run deploy                     # = wrangler deploy (uses src/index.ts)
```

Then add the custom domain in the dashboard as in Path A step 5 (or via
`wrangler` routes). The CLI deploys `src/index.ts` directly — no bundle needed.

A scoped API token (instead of `wrangler login`) needs the **Workers Scripts:Edit**
permission, plus **Zone:Edit** on `ai2fin.com` if you map the custom domain via CLI.

---

## Verify after deploy

```bash
# server info
curl -s https://taxmcp.ai2fin.com

# a real tool call
curl -s https://taxmcp.ai2fin.com -X POST -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"compute_gst_vat","arguments":{"country":"AU","amount":4400,"mode":"remove"}}}'
# -> "...GST: 400 ... Total including GST: 4400 ..."

# the handshake clients use
curl -s https://taxmcp.ai2fin.com -X POST -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Then connect it in any MCP-compatible assistant (Claude → Settings →
Connectors → custom connector; ChatGPT developer mode; Cursor; or your own
agent) by pasting `https://taxmcp.ai2fin.com`.

## After it's live

- The website's MCP page (`/tools/taxmcp`) already points at
  `https://taxmcp.ai2fin.com` — no code change needed once the domain is mapped.
- List it in the registries: see [`REGISTRY.md`](REGISTRY.md).
- Abuse protection is the Cloudflare dashboard (rate limiting + WAF), not auth.
