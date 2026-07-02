# Tax-data architecture — single source, provenance, freshness

How tax figures flow from a verified source to the website calculators and the
Tax MCP, who owns each piece, and what's left to finish. The goal: **every number
a user or assistant sees carries a source + a verified date, lives in one place,
and is checked for staleness automatically.**

The good news: the hard part already exists in `@ai2/tax-plugins` (the engine the
main app also runs on). This documents it and the work to extend it.

---

## The principle

> A number with no source + verified date may not be presented as fact.
> A change is **never an in-place edit** — you close the current row and append a
> new one (so history is preserved and future changes activate by date).
> Updates are **never auto-ingested** — a cron *detects* staleness and opens an
> issue; a human/agent re-verifies before anything ships.

## The layers

```
┌─ SINGLE SOURCE: @ai2/tax-plugins ──────────────────────────────────────────┐
│  src/data/rateLedger.data.ts   GST/VAT — effective-dated, append-only.      │
│                                Each row: { standardRate, effectiveFrom,      │
│                                effectiveTo, source:{authority,url,           │
│                                citationDate,verified,note} }   ✅ ~50+ ctry  │
│  src/data/companyTax.ts        company tax + provenance fields              ✅ │
│  src/countries/*IncomeTax.ts   income tax — logic only, NO provenance yet   ❌ │
│  src/data/rateLedger.ts        resolver: resolveRateRow(code, asOf)           │
│  src/rateWatch.ts              analyzeLedger() → stale / recent / upcoming    │
└────────────────────────────────────────────────────────────────────────────┘
        │  npm run gen:tax  (scripts/generate-tax-data.mjs)
        ▼
┌─ CONSUMERS ────────────────────────────────────────────────────────────────┐
│  website  content/taxData.ts          → ProvenanceBadge (Source · verified) │
│  Tax MCP  tax-mcp/data/rates.json      → "Source: <authority> · current as   │
│           tax-mcp/data/sources.json       of <date>" on every tool response  │
│  main app (later — adopts the same ledger; not mentioned publicly)           │
└────────────────────────────────────────────────────────────────────────────┘
        ▲
        │  schedule (GitHub Action)
┌─ FRESHNESS ────────────────────────────────────────────────────────────────┐
│  .github/workflows/rate-watch.yml  + scripts/rate-watch/run.cjs              │
│  Runs analyzeLedger() → opens a human-review issue for: citations older than │
│  365 days, rows that just activated, and announced upcoming changes.      ✅ │
└────────────────────────────────────────────────────────────────────────────┘
```

## What's done vs left

| Piece | Status |
|---|---|
| Effective-dated **GST/VAT ledger** with per-row source + date | ✅ done |
| **Company tax** provenance | ✅ done |
| **rateWatch** + scheduled **GitHub Action** (the freshness cron) | ✅ done (GST/VAT) |
| **Income tax** provenance (source + verifiedDate + effectiveFrom) | ❌ to build |
| Consumers read the **ledger** (website `gen:tax`, MCP) instead of the flat `COUNTRY_TAX_RATES` / hardcoded data | ❌ to wire |
| **CGT** in the provenance system (multi-country) | ❌ later |

## The remaining work (in order)

1. **Income provenance, ledger-style.** Add `src/data/incomeLedger.data.ts` (or
   enrich the income modules) so each country-year carries `source` +
   `citationDate` + `effectiveFrom`, mirroring `rateLedger`. Additive — does not
   change the existing app calc logic.
2. **Wire the consumers to the ledger.** Point `gen:tax` at `resolveRateRow()` /
   the income ledger so `content/taxData.ts` and `tax-mcp/data/sources.json`
   carry the ledger's provenance — retiring the website's flat table and the
   Worker's interim hardcoded `META`/dates.
3. **Extend `rateWatch`** to the income ledger so the same cron flags stale
   income citations and upcoming bracket changes (e.g. AU's legislated 15%→14%).
4. **Later:** multi-country CGT and withholding/treaty data, same pattern.

## Invariants (don't break these)

- Append rows, never edit a rate in place (`effectiveTo` closes the old one).
- `source.verified` is `true` only against an `https` authority URL.
- The cron **detects**; humans **verify**. No automated rate writes.
- A country with no verified data **degrades** ("not available" / "confirm with
  the authority") rather than showing an unverified number.
