/**
 * AI2Fin public Tax MCP — a stateless, no-auth Cloudflare Worker that exposes
 * deterministic tax tools over the Model Context Protocol (JSON-RPC/HTTP).
 * embracingearth.space
 *
 * This is SEPARATE from the authenticated app MCP (app.ai2fin.com/mcp, OAuth,
 * user data). It computes over public rate data only — vendored from the same
 * @ai2/tax-plugins pipeline that powers the website (data/rates.json, kept in
 * sync by the site's gen:tax). Speaks as "Fin"; every answer carries a
 * not-tax-advice note. Tools: lookup, GST/VAT compute, country comparison.
 */
import rates from '../data/rates.json';
import { LANDING_HTML } from './landing';

interface Row {
  code: string;
  country: string;
  family: string;
  localName: string;
  standardRate: number;
  rateDisplay: string;
  reducedRates: number[];
  incomeTopRate: string;
  companyRate: string;
}

const ROWS = rates as Row[];
const byCode = (c: unknown) => ROWS.find((r) => r.code === String(c ?? '').toUpperCase());
const DISCLAIMER = 'General information only, not tax advice. Rates change — confirm with the local tax authority.';
const round2 = (n: number) => Math.round(n * 100) / 100;
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

// Source authority (+ an optional sourced fun fact) per country, so every tool
// carries provenance — like the website's ProvenanceBadge. The headline rate data
// was last confirmed against these authorities on VERIFIED_ON; every response
// gets an explicit "Source:" line (specific authority, or a generic fallback).
const VERIFIED_ON = '2026-06-01'; // ISO anchor for the confirmation date
const VERIFIED_LABEL = 'Jun 2026'; // human label — keep in step with VERIFIED_ON
const STALE_AFTER_DAYS = 365;
// Freshness guard: once the data is materially old, stop asserting it's "current
// as of" a month that has silently gone stale and ask the reader to verify
// instead. (The durable fix is the shared @ai2/tax-plugins rate-watch layer; this
// keeps the standalone Worker honest until it reads that provenance directly.)
function isStale(): boolean {
  return (Date.now() - Date.parse(`${VERIFIED_ON}T00:00:00Z`)) / 86_400_000 > STALE_AFTER_DAYS;
}
function freshness(): string {
  return isStale()
    ? `verified ${VERIFIED_LABEL} — may be out of date; confirm with the authority`
    : `current as of ${VERIFIED_LABEL}`;
}
/** Provenance block carried by every structured tool result (matches PROVENANCE_PROPS). */
function prov(code: string): { source: string; dataVerifiedOn: string; mayBeStale: boolean; disclaimer: string } {
  const m = META[String(code ?? '').toUpperCase()];
  return { source: m ? m.source : 'the national tax authority', dataVerifiedOn: VERIFIED_ON, mayBeStale: isStale(), disclaimer: DISCLAIMER };
}
const META: Record<string, { source: string; facts?: string[] }> = {
  AU: { source: 'ATO — ato.gov.au', facts: [
    'Australia’s GST has sat at 10% since 2000 — changing it needs the unanimous agreement of every state and territory plus both houses of Parliament.',
    'A fumbled live-TV answer about whether a birthday cake would be cheaper or dearer under GST is widely blamed for sinking an Australian election.',
  ] },
  NZ: { source: 'IRD — ird.govt.nz', facts: [
    'New Zealand’s GST is one of the world’s broadest — it even applies to most food, which many countries exempt.',
  ] },
  GB: { source: 'GOV.UK / HMRC — gov.uk', facts: [
    'The UK zero-rates most food but taxes “luxuries” — a famous court case turned on whether a Jaffa Cake is a cake (zero-rated) or a biscuit (taxed). The cake won.',
  ] },
  IN: { source: 'Income Tax Department — incometax.gov.in', facts: [
    'India switched on GST at the stroke of midnight on 1 July 2017 in a special session of Parliament, echoing the 1947 independence-midnight session.',
  ] },
  US: { source: 'IRS — irs.gov', facts: [
    'The US has no national sales tax at all — only state and local sales taxes, which range from 0% to over 10%.',
  ] },
  CA: { source: 'CRA — canada.ca', facts: [
    'Canada layers a federal 5% GST with separate provincial sales taxes — some provinces blend them into a single “HST”.',
  ] },
  DE: { source: 'Bundesfinanzministerium — bundesfinanzministerium.de', facts: [
    'Germany applies its reduced 7% VAT to some surprising things — famously, a live donkey — while many staples sit at the full 19%.',
  ] },
  SG: { source: 'IRAS — iras.gov.sg' },
  FR: { source: 'DGFiP — impots.gouv.fr' },
  IE: { source: 'Revenue — revenue.ie' },
  NL: { source: 'Belastingdienst — belastingdienst.nl' },
  IT: { source: 'Agenzia delle Entrate — agenziaentrate.gov.it' },
  ES: { source: 'Agencia Tributaria — agenciatributaria.gob.es' },
  JP: { source: 'NTA — nta.go.jp' },
  ZA: { source: 'SARS — sars.gov.za' },
  AE: { source: 'FTA — tax.gov.ae' },
  CH: { source: 'ESTV — estv.admin.ch' },
  SE: { source: 'Skatteverket — skatteverket.se' },
};

/** "Source: X · current as of <month>" for a country. EVERY supported country
 *  gets an explicit Source: line — a specific authority when one is on file, or a
 *  generic "the national tax authority" fallback — so the sourced-response
 *  contract never silently drops. freshness() supplies the date qualifier. */
function srcLine(code: string): string {
  const m = META[String(code ?? '').toUpperCase()];
  return `Source: ${m ? m.source : 'the national tax authority'} · ${freshness()}.`;
}

/** rate_lookup: the source/date line, plus one fun fact when we have one. */
function metaLines(code: string): string[] {
  const out = [srcLine(code)];
  const m = META[String(code ?? '').toUpperCase()];
  if (m?.facts?.length) out.push(`💡 ${m.facts[Math.floor(Math.random() * m.facts.length)]!}`);
  return out;
}

// ── Vendored income / company / CGT data ──────────────────────────────────────
// Kept in sync with the website's lib/incomeTaxCalc.ts, lib/companyTaxCalc.ts and
// lib/cgtCalc.ts (which vendor from @ai2/tax-plugins). The Worker is a separate
// runtime, so it carries its own copy; the website's jest anchors guard drift.

interface Band { upTo: number | null; rate: number; }
interface IncomeCountry { currency: string; timeZone: string; medicare: number; lito: boolean; sets: { effectiveFrom: string; label: string; bands: Band[] }[]; }

const auBands = (first: number): Band[] => [
  { upTo: 18200, rate: 0 }, { upTo: 45000, rate: first }, { upTo: 135000, rate: 0.3 }, { upTo: 190000, rate: 0.37 }, { upTo: null, rate: 0.45 },
];
const INCOME: Record<string, IncomeCountry> = {
  AU: {
    currency: 'AUD', timeZone: 'Australia/Sydney', medicare: 0.02, lito: true,
    sets: [
      { effectiveFrom: '2027-07-01', label: '2027-28', bands: auBands(0.14) },
      { effectiveFrom: '2026-07-01', label: '2026-27', bands: auBands(0.15) },
      { effectiveFrom: '2025-07-01', label: '2025-26', bands: auBands(0.16) },
      { effectiveFrom: '2024-07-01', label: '2024-25', bands: auBands(0.16) },
    ],
  },
  NZ: {
    currency: 'NZD', timeZone: 'Pacific/Auckland', medicare: 0, lito: false,
    sets: [
      { effectiveFrom: '2025-04-01', label: '2025-26', bands: [
        { upTo: 15600, rate: 0.105 }, { upTo: 53500, rate: 0.175 }, { upTo: 78100, rate: 0.3 }, { upTo: 180000, rate: 0.33 }, { upTo: null, rate: 0.39 },
      ] },
    ],
  },
};

function localToday(tz: string): string {
  const p = new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const g = (t: string) => p.find((x) => x.type === t)?.value ?? '';
  return `${g('year')}-${g('month')}-${g('day')}`;
}
function resolveIncomeSet(c: IncomeCountry, taxYear?: string) {
  if (taxYear) { const m = c.sets.find((s) => s.label === taxYear); if (m) return m; }
  const today = localToday(c.timeZone);
  return c.sets.find((s) => s.effectiveFrom <= today) ?? c.sets[c.sets.length - 1];
}
function progressive(income: number, bands: Band[]): number {
  let tax = 0, lower = 0;
  for (const b of bands) {
    const upper = b.upTo ?? Infinity;
    if (income > lower) tax += (Math.min(income, upper) - lower) * b.rate;
    lower = upper;
    if (income <= upper) break;
  }
  return tax;
}
function auLito(taxable: number): number {
  let lito = 0;
  if (taxable <= 37500) lito = 700;
  else if (taxable <= 45000) lito = Math.round(700 - (taxable - 37500) * 0.05);
  else if (taxable <= 66667) lito = Math.round(325 - (taxable - 45000) * 0.015);
  return Math.max(0, lito);
}
function estimateIncome(code: unknown, gross: number, taxYear?: string) {
  const c = INCOME[String(code ?? '').toUpperCase()];
  if (!c) return null;
  const set = resolveIncomeSet(c, taxYear);
  const g = gross > 0 ? gross : 0;
  const incomeTax = Math.round(progressive(g, set.bands));
  const medicare = Math.round(g * c.medicare);
  const lito = c.lito ? auLito(g) : 0;
  const totalTax = Math.max(0, incomeTax + medicare - lito);
  return { country: String(code).toUpperCase(), currency: c.currency, taxYear: set.label, gross: g, incomeTax, medicare, lito, totalTax, takeHome: g - totalTax };
}

interface CompanyInfo { rate: number; small?: number; smallAll?: boolean; label: string; authority: string; note: string; }
const COMPANY: Record<string, CompanyInfo> = {
  AU: { rate: 0.3, small: 0.25, smallAll: true, label: 'Company tax', authority: 'ATO', note: 'Base-rate entities (turnover under $50m) pay 25%; other companies 30%.' },
  US: { rate: 0.21, label: 'Corporate income tax', authority: 'IRS', note: 'Flat 21% federal; states add 0–~12%, not included.' },
  GB: { rate: 0.25, small: 0.19, smallAll: false, label: 'Corporation Tax', authority: 'HMRC', note: 'Main 25% (profits over £250k); 19% small-profits (under £50k) with marginal relief.' },
  IN: { rate: 0.25, small: 0.22, smallAll: true, label: 'Corporate tax', authority: 'Income Tax Department', note: '25% (turnover up to ₹400cr) or 22% concessional; surcharge + 4% cess extra.' },
  CA: { rate: 0.15, small: 0.09, smallAll: false, label: 'Corporate income tax', authority: 'CRA', note: 'Federal general 15%; small-business 9% (first $500k); provincial tax extra.' },
};
function estimateCompany(code: unknown, profit: number, smallBusiness: boolean) {
  const c = COMPANY[String(code ?? '').toUpperCase()];
  if (!c) return null;
  const p = profit > 0 ? profit : 0;
  const useSmall = smallBusiness && c.small != null && c.smallAll === true;
  const rate = useSmall ? (c.small as number) : c.rate;
  const tax = Math.round(p * rate);
  return { country: String(code).toUpperCase(), label: c.label, authority: c.authority, rate, tax, afterTax: p - tax, note: c.note };
}

function estimateAuCgt(income: number, proceeds: number, costBase: number, losses: number, held: boolean) {
  // Reject non-finite inputs up front so NaN can't leak into the response — this
  // also makes the dispatch's `!r` guard a live, meaningful check.
  if (![income, proceeds, costBase, losses].every((n) => Number.isFinite(n))) return null;
  const gross = Math.max(0, proceeds - costBase);
  const lossOffset = Math.min(Math.max(0, losses), gross);
  const net = gross - lossOffset;
  const discountApplied = held && net > 0;
  const taxableGain = discountApplied ? net * 0.5 : net;
  const without = estimateIncome('AU', Math.max(0, income));
  const withGain = estimateIncome('AU', Math.max(0, income) + taxableGain);
  if (!without || !withGain) return null;
  const cgt = Math.max(0, withGain.totalTax - without.totalTax);
  return { grossGain: gross, lossOffset, discountApplied, taxableGain, cgtPayable: cgt, taxYear: withGain.taxYear };
}

// Every tool is a pure, read-only calculation over the same verified dataset —
// the annotations below say so once, and each description then spends its words
// on what annotations can't carry: when to pick THIS tool over its siblings,
// coverage limits, and how it degrades (per Glama's TDQS rubric).
const READ_ONLY_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false, // fixed vendored dataset — no live/external calls
};

// Provenance fields shared by every structured result (and their schema), so
// agents consuming structuredContent still get the source + freshness contract.
const PROVENANCE_PROPS = {
  source: { type: 'string', description: "The national tax authority the figures were verified against (e.g. 'ATO — ato.gov.au')" },
  dataVerifiedOn: { type: 'string', description: 'ISO date the rate data was last confirmed against the authority' },
  mayBeStale: { type: 'boolean', description: 'True once the verification date is over a year old — re-confirm with the authority' },
  disclaimer: { type: 'string', description: 'General-information note that must accompany any figure shown to a person' },
} as const;
const PROVENANCE_REQUIRED = ['source', 'dataVerifiedOn', 'mayBeStale', 'disclaimer'];

const ISO_COUNTRY = { type: 'string', pattern: '^[A-Za-z]{2}$', minLength: 2, maxLength: 2 } as const;

const TOOLS = [
  {
    name: 'tax_rate_lookup',
    title: 'Country tax rate lookup',
    description:
      "Look up one country's headline tax rates: GST/VAT standard and reduced rates, top personal income tax rate, and company tax rate. " +
      'Use it for a single country; to see several countries side by side use compare_countries, and to apply GST/VAT to an amount use compute_gst_vat. ' +
      'Rates come from a fixed dataset verified against the national tax authority — every answer names its source and verification date, and an unsupported country returns a clear error rather than a guess.',
    annotations: { ...READ_ONLY_ANNOTATIONS },
    inputSchema: {
      type: 'object',
      properties: {
        country: { ...ISO_COUNTRY, description: '2-letter ISO 3166-1 code of the country to look up (case-insensitive)', examples: ['AU', 'GB', 'DE'] },
      },
      required: ['country'],
      additionalProperties: false,
    },
    outputSchema: {
      type: 'object',
      properties: {
        country: { type: 'string', description: 'Country name' },
        code: { type: 'string', description: '2-letter ISO country code' },
        taxFamily: { type: 'string', description: "Consumption-tax family, e.g. 'GST', 'VAT' or a non-VAT system like retail sales tax" },
        taxLocalName: { type: 'string', description: "The tax's local name, e.g. 'GST', 'USt'" },
        standardRate: { type: 'number', description: 'Standard consumption-tax rate as a fraction (0.1 = 10%)' },
        standardRateDisplay: { type: 'string', description: 'Standard rate formatted for display' },
        reducedRates: { type: 'array', items: { type: 'number' }, description: 'Reduced rates as fractions; empty when none' },
        incomeTopRate: { type: 'string', description: 'Top personal income tax rate (display string; may note surcharges)' },
        companyRate: { type: 'string', description: 'Headline company tax rate (display string)' },
        ...PROVENANCE_PROPS,
      },
      required: ['country', 'code', 'taxFamily', 'taxLocalName', 'standardRate', 'standardRateDisplay', 'reducedRates', 'incomeTopRate', 'companyRate', ...PROVENANCE_REQUIRED],
      additionalProperties: false,
    },
  },
  {
    name: 'compute_gst_vat',
    title: 'GST/VAT add or remove calculator',
    description:
      "Add or remove a country's GST/VAT on a monetary amount, returning the net / tax / gross split. " +
      'Use it to convert between tax-exclusive and tax-inclusive prices (invoices, quotes, receipts); for the rates themselves use tax_rate_lookup. ' +
      "Pure arithmetic on the country's current standard rate, rounded to 2 decimals, in the country's local currency. Countries without a single national GST/VAT (e.g. the US) return an explanatory error instead of a wrong number.",
    annotations: { ...READ_ONLY_ANNOTATIONS },
    inputSchema: {
      type: 'object',
      properties: {
        country: { ...ISO_COUNTRY, description: '2-letter ISO 3166-1 code of the country whose GST/VAT rate applies (case-insensitive)', examples: ['AU', 'GB'] },
        amount: { type: 'number', minimum: 0, description: 'The monetary amount in the local currency — tax-exclusive when mode=add, tax-inclusive when mode=remove' },
        mode: { type: 'string', enum: ['add', 'remove'], default: 'add', description: "'add' puts tax on top of a net amount; 'remove' extracts the tax already inside a gross amount" },
      },
      required: ['country', 'amount'],
      additionalProperties: false,
    },
    outputSchema: {
      type: 'object',
      properties: {
        country: { type: 'string', description: 'Country name' },
        code: { type: 'string', description: '2-letter ISO country code' },
        taxLocalName: { type: 'string', description: "The tax's local name, e.g. 'GST', 'VAT'" },
        rate: { type: 'number', description: 'Standard rate applied, as a fraction' },
        mode: { type: 'string', enum: ['add', 'remove'], description: 'Which conversion was performed' },
        net: { type: 'number', description: 'Amount before tax (local currency, 2 dp)' },
        tax: { type: 'number', description: 'The GST/VAT portion (local currency, 2 dp)' },
        gross: { type: 'number', description: 'Amount including tax (local currency, 2 dp)' },
        ...PROVENANCE_PROPS,
      },
      required: ['country', 'code', 'taxLocalName', 'rate', 'mode', 'net', 'tax', 'gross', ...PROVENANCE_REQUIRED],
      additionalProperties: false,
    },
  },
  {
    name: 'compare_countries',
    title: 'Multi-country tax comparison',
    description:
      'Compare headline tax rates — GST/VAT, top personal income tax and company tax — across several countries at once. ' +
      "Use it to shortlist or contrast jurisdictions (relocation, expansion, pricing); for one country's full detail use tax_rate_lookup, and to apply a rate to an amount use compute_gst_vat. " +
      'Codes the dataset does not cover are reported back in unmatchedCodes rather than silently dropped; every matched row cites its national tax authority.',
    annotations: { ...READ_ONLY_ANNOTATIONS },
    inputSchema: {
      type: 'object',
      properties: {
        countries: {
          type: 'array',
          items: { ...ISO_COUNTRY, description: '2-letter ISO 3166-1 country code (case-insensitive)' },
          minItems: 1,
          maxItems: 60,
          description: 'Countries to compare — two or more makes a meaningful comparison',
          examples: [['AU', 'GB', 'SG']],
        },
      },
      required: ['countries'],
      additionalProperties: false,
    },
    outputSchema: {
      type: 'object',
      properties: {
        rows: {
          type: 'array',
          description: 'One row per matched country',
          items: {
            type: 'object',
            properties: {
              country: { type: 'string', description: 'Country name' },
              code: { type: 'string', description: '2-letter ISO country code' },
              taxLocalName: { type: 'string', description: 'Local consumption-tax name' },
              standardRateDisplay: { type: 'string', description: 'GST/VAT standard rate (display string)' },
              incomeTopRate: { type: 'string', description: 'Top personal income tax rate (display string)' },
              companyRate: { type: 'string', description: 'Headline company tax rate (display string)' },
              source: { type: 'string', description: 'National tax authority for this row' },
            },
            required: ['country', 'code', 'taxLocalName', 'standardRateDisplay', 'incomeTopRate', 'companyRate', 'source'],
            additionalProperties: false,
          },
        },
        unmatchedCodes: { type: 'array', items: { type: 'string' }, description: 'Requested codes with no data — nothing was guessed for these' },
        ...PROVENANCE_PROPS,
      },
      required: ['rows', 'unmatchedCodes', ...PROVENANCE_REQUIRED],
      additionalProperties: false,
    },
  },
  {
    name: 'income_tax_estimate',
    title: 'Income tax & take-home estimate (AU, NZ)',
    description:
      'Estimate personal income tax and take-home pay for Australia or New Zealand from gross annual income, using effective-dated brackets that roll over automatically each financial year (AU includes the Medicare levy and Low Income Tax Offset). ' +
      "Use it for individual salary and take-home questions in AU or NZ only — other countries return 'not available' rather than a guess; their headline rates live in tax_rate_lookup. " +
      'This is a resident-individual estimate, not a filing calculation: deductions, offsets beyond LITO, and student-loan repayments are out of scope.',
    annotations: { ...READ_ONLY_ANNOTATIONS },
    inputSchema: {
      type: 'object',
      properties: {
        country: { type: 'string', enum: ['AU', 'NZ'], description: 'Country with bracket data: AU (Australia) or NZ (New Zealand)' },
        income: { type: 'number', minimum: 0, description: 'Gross annual income in local currency (AUD for AU, NZD for NZ), before tax' },
        taxYear: { type: 'string', pattern: '^\\d{4}-\\d{2}$', description: "Financial-year label like '2025-26'; omit to use the current financial year in that country's timezone", examples: ['2025-26'] },
      },
      required: ['country', 'income'],
      additionalProperties: false,
    },
    outputSchema: {
      type: 'object',
      properties: {
        country: { type: 'string', enum: ['AU', 'NZ'], description: 'Country estimated' },
        currency: { type: 'string', description: 'Currency of every monetary field (AUD or NZD)' },
        taxYear: { type: 'string', description: 'Financial year the brackets belong to' },
        gross: { type: 'number', description: 'Gross annual income used' },
        incomeTax: { type: 'number', description: 'Income tax before levies and offsets' },
        medicareLevy: { type: 'number', description: 'Medicare levy (AU only; 0 for NZ)' },
        lito: { type: 'number', description: 'Low Income Tax Offset applied (AU only; 0 otherwise)' },
        totalTax: { type: 'number', description: 'Total tax after levies and offsets' },
        takeHome: { type: 'number', description: 'Gross minus total tax' },
        ...PROVENANCE_PROPS,
      },
      required: ['country', 'currency', 'taxYear', 'gross', 'incomeTax', 'medicareLevy', 'lito', 'totalTax', 'takeHome', ...PROVENANCE_REQUIRED],
      additionalProperties: false,
    },
  },
  {
    name: 'company_tax_estimate',
    title: 'Company tax estimate (AU, US, GB, IN, CA)',
    description:
      'Estimate company/corporate income tax on an annual profit for Australia, the US, the UK, India or Canada — the five countries with source-verified company rates — applying the small-business/concessional rate where it covers all income. ' +
      'Use it for company profit questions in those countries; individuals belong to income_tax_estimate, and any other country’s headline rate to tax_rate_lookup. ' +
      'Headline-rate arithmetic only: US state tax, Canadian provincial tax, Indian surcharge/cess and UK marginal relief are flagged in the response note but not computed. A negative profit returns an explanation (losses carry forward), never a negative tax.',
    annotations: { ...READ_ONLY_ANNOTATIONS },
    inputSchema: {
      type: 'object',
      properties: {
        country: { type: 'string', enum: ['AU', 'US', 'GB', 'IN', 'CA'], description: 'Country with source-verified company-tax data' },
        profit: { type: 'number', description: 'Annual taxable profit in local currency; a negative value (a loss) returns an explanatory message instead of tax' },
        smallBusiness: { type: 'boolean', default: false, description: 'Apply the small-business/concessional rate — only honoured where it covers all income (AU base-rate entity, IN s.115BAA); GB/CA thresholds are noted instead' },
      },
      required: ['country', 'profit'],
      additionalProperties: false,
    },
    outputSchema: {
      type: 'object',
      properties: {
        country: { type: 'string', enum: ['AU', 'US', 'GB', 'IN', 'CA'], description: 'Country estimated' },
        taxLabel: { type: 'string', description: "The country's name for the tax, e.g. 'Corporation Tax'" },
        rateApplied: { type: 'number', description: 'Rate actually applied, as a fraction' },
        tax: { type: 'number', description: 'Company tax on the profit (local currency, rounded)' },
        afterTax: { type: 'number', description: 'Profit after tax' },
        note: { type: 'string', description: 'What the headline calculation excludes (state/provincial tax, surcharge/cess, marginal relief …)' },
        ...PROVENANCE_PROPS,
      },
      required: ['country', 'taxLabel', 'rateApplied', 'tax', 'afterTax', 'note', ...PROVENANCE_REQUIRED],
      additionalProperties: false,
    },
  },
  {
    name: 'cgt_estimate',
    title: 'Australian capital gains tax estimate',
    description:
      'Estimate Australian capital gains tax for a resident individual by taxing the gain at the marginal rate on top of other income (the difference of two income-tax calculations). ' +
      "Use it for AU asset-sale questions (shares, property, crypto); for pay without an asset sale use income_tax_estimate — other countries' CGT is not covered and returns an error. " +
      'Applies capital losses before the 50% discount for assets held over 12 months, per ATO ordering; the main-residence exemption and non-resident rules are out of scope.',
    annotations: { ...READ_ONLY_ANNOTATIONS },
    inputSchema: {
      type: 'object',
      properties: {
        income: { type: 'number', minimum: 0, description: 'Other taxable income for the year in AUD (salary etc.) — sets the marginal rate the gain stacks on' },
        proceeds: { type: 'number', minimum: 0, description: 'Sale price of the asset in AUD' },
        costBase: { type: 'number', minimum: 0, description: 'Cost base in AUD — what the asset cost, including eligible incidental costs' },
        capitalLosses: { type: 'number', minimum: 0, default: 0, description: 'Capital losses to offset, in AUD — applied against the gross gain before any discount' },
        heldMoreThan12Months: { type: 'boolean', description: 'True when the asset was held over 12 months, which halves the taxable gain (the 50% CGT discount)' },
      },
      required: ['income', 'proceeds', 'costBase', 'heldMoreThan12Months'],
      additionalProperties: false,
    },
    outputSchema: {
      type: 'object',
      properties: {
        country: { type: 'string', enum: ['AU'], description: 'Always AU — this tool is Australia-only' },
        taxYear: { type: 'string', description: 'Financial year whose brackets were used' },
        grossGain: { type: 'number', description: 'Proceeds minus cost base, floored at 0 (AUD)' },
        lossOffset: { type: 'number', description: 'Capital losses actually applied (AUD)' },
        discountApplied: { type: 'boolean', description: 'Whether the 50% discount halved the taxable gain' },
        taxableGain: { type: 'number', description: 'Gain added on top of other income (AUD)' },
        cgtPayable: { type: 'number', description: 'Extra tax caused by the gain (AUD)' },
        ...PROVENANCE_PROPS,
      },
      required: ['country', 'taxYear', 'grossGain', 'lossOffset', 'discountApplied', 'taxableGain', 'cgtPayable', ...PROVENANCE_REQUIRED],
      additionalProperties: false,
    },
  },
];

/** A tool outcome: prose for the model to read, structured data matching the
 *  tool's outputSchema for programmatic consumers, or a correctable error
 *  (isError → the agent can fix its arguments and retry). */
interface ToolResult { text: string; structured?: Record<string, unknown>; isError?: boolean }
const toolError = (text: string): ToolResult => ({ text, isError: true });

function callTool(name: string, args: Record<string, unknown>): ToolResult {
  if (name === 'tax_rate_lookup') {
    const r = byCode(args.country);
    if (!r) return toolError(`Fin doesn't have tax data for "${args.country}". Try a 2-letter ISO code like AU, GB or DE.`);
    const reduced = r.reducedRates?.length ? r.reducedRates.map((x) => `${+(x * 100).toFixed(2)}%`).join(', ') : 'none';
    const text = [
      `${r.country} (${r.code}):`,
      `• ${r.localName} (${r.family}) standard rate: ${r.rateDisplay}`,
      `• Reduced rates: ${reduced}`,
      `• Top personal income tax: ${r.incomeTopRate}`,
      `• Company tax: ${r.companyRate}`,
      ...metaLines(r.code),
      DISCLAIMER,
    ].join('\n');
    return {
      text,
      structured: {
        country: r.country, code: r.code, taxFamily: r.family, taxLocalName: r.localName,
        standardRate: r.standardRate, standardRateDisplay: r.rateDisplay, reducedRates: r.reducedRates ?? [],
        incomeTopRate: r.incomeTopRate, companyRate: r.companyRate, ...prov(r.code),
      },
    };
  }

  if (name === 'compute_gst_vat') {
    const r = byCode(args.country);
    if (!r) return toolError(`Fin doesn't have GST/VAT data for "${args.country}".`);
    if (r.family !== 'GST' && r.family !== 'VAT') {
      return toolError(`${r.country} uses ${r.family} (${r.localName}), not a single-rate GST/VAT this tool can add or remove. Try tax_rate_lookup instead.`);
    }
    if (!(r.standardRate > 0)) return toolError(`${r.country} has no national GST/VAT to compute (${r.family}).`);
    const amount = Number(args.amount);
    if (!Number.isFinite(amount) || amount < 0) return toolError('Please pass a valid non-negative amount.');
    const mode = args.mode === 'remove' ? 'remove' : 'add';
    const rate = r.standardRate;
    let net: number, tax: number, gross: number;
    if (mode === 'remove') {
      gross = amount; tax = round2((amount * rate) / (1 + rate)); net = round2(gross - tax);
    } else {
      net = amount; tax = round2(amount * rate); gross = round2(net + tax);
    }
    const text = [
      `${r.country} ${r.localName} at ${r.rateDisplay} (${mode === 'add' ? 'added to' : 'extracted from'} ${amount}):`,
      `• Price before ${r.localName}: ${net}`,
      `• ${r.localName}: ${tax}`,
      `• Total including ${r.localName}: ${gross}`,
      srcLine(r.code),
      DISCLAIMER,
    ].join('\n');
    return { text, structured: { country: r.country, code: r.code, taxLocalName: r.localName, rate, mode, net, tax, gross, ...prov(r.code) } };
  }

  if (name === 'compare_countries') {
    const codes = Array.isArray(args.countries) ? args.countries : [];
    const found = codes.map(byCode).filter(Boolean) as Row[];
    if (!found.length) return toolError('Pass an array of 2-letter ISO country codes, e.g. ["AU","GB"].');
    const matched = new Set(found.map((r) => r.code));
    const unmatchedCodes = [...new Set(codes.map((c) => String(c ?? '').toUpperCase()).filter((c) => !matched.has(c)))];
    const lines = found.map((r) => {
      const m = META[r.code];
      // Keep the FULL authority string (incl. domain) so each row stays
      // verifiable — matching the provenance bar of the other tools.
      const auth = m ? ` — ${m.source}` : '';
      return `${r.country}: ${r.localName} ${r.rateDisplay} | income top ${r.incomeTopRate} | company ${r.companyRate}${auth}`;
    });
    if (unmatchedCodes.length) lines.push(`No data for: ${unmatchedCodes.join(', ')} — nothing was guessed for these.`);
    const text = [`Tax comparison (headline rates, ${freshness()}):`, ...lines, DISCLAIMER].join('\n');
    return {
      text,
      structured: {
        rows: found.map((r) => ({
          country: r.country, code: r.code, taxLocalName: r.localName, standardRateDisplay: r.rateDisplay,
          incomeTopRate: r.incomeTopRate, companyRate: r.companyRate,
          source: META[r.code] ? META[r.code].source : 'the national tax authority',
        })),
        unmatchedCodes,
        ...prov(''), // multi-country: the top-level source is the generic fallback; each row carries its own
      },
    };
  }

  if (name === 'income_tax_estimate') {
    const income = Number(args.income);
    if (!Number.isFinite(income)) return toolError('Please pass a valid numeric income.');
    const r = estimateIncome(args.country, income, typeof args.taxYear === 'string' ? args.taxYear : undefined);
    if (!r) return toolError(`Fin has income-tax data for AU and NZ only — not "${args.country}". Use tax_rate_lookup for other countries' headline rates.`);
    const lines = [`${r.country} income tax & take-home, ${r.taxYear} (on ${fmt(r.gross)} ${r.currency}):`, `• Income tax: ${fmt(r.incomeTax)}`];
    if (r.medicare > 0) lines.push(`• Medicare levy: ${fmt(r.medicare)}`);
    if (r.lito > 0) lines.push(`• Low Income Tax Offset: -${fmt(r.lito)}`);
    lines.push(`• Total tax: ${fmt(r.totalTax)}`, `• Take-home: ${fmt(r.takeHome)}`);
    lines.push(srcLine(r.country)); // source + date; the GST fact would be off-topic on a take-home figure
    lines.push(DISCLAIMER);
    return {
      text: lines.join('\n'),
      structured: {
        country: r.country, currency: r.currency, taxYear: r.taxYear, gross: r.gross,
        incomeTax: r.incomeTax, medicareLevy: r.medicare, lito: r.lito,
        totalTax: r.totalTax, takeHome: r.takeHome, ...prov(r.country),
      },
    };
  }

  if (name === 'company_tax_estimate') {
    const profit = Number(args.profit);
    if (!Number.isFinite(profit)) return toolError('Please pass a valid numeric profit.');
    if (profit < 0) return toolError('A loss is not taxed — company tax applies to positive profit only (losses generally carry forward, which this tool does not model).');
    const r = estimateCompany(args.country, profit, args.smallBusiness === true);
    if (!r) return toolError(`Fin has source-verified company-tax data for AU, US, GB, IN and CA only — not "${args.country}".`);
    const text = [
      `${r.country} ${r.label} at ${+(r.rate * 100).toFixed(2)}% (on ${fmt(profit)} profit):`,
      `• Company tax: ${fmt(r.tax)}`,
      `• Profit after tax: ${fmt(r.afterTax)}`,
      `Source: ${r.authority} · ${freshness()}. ${r.note}`,
      DISCLAIMER,
    ].join('\n');
    return {
      text,
      structured: { country: r.country, taxLabel: r.label, rateApplied: r.rate, tax: r.tax, afterTax: r.afterTax, note: r.note, ...prov(r.country) },
    };
  }

  if (name === 'cgt_estimate') {
    const income = Number(args.income);
    const proceeds = Number(args.proceeds);
    const costBase = Number(args.costBase);
    const losses = args.capitalLosses === undefined ? 0 : Number(args.capitalLosses);
    // heldMoreThan12Months drives the 50% discount, so require a real boolean —
    // don't let a missing/odd value silently mean "not held" (no discount).
    if (![income, proceeds, costBase, losses].every((n) => Number.isFinite(n)) || typeof args.heldMoreThan12Months !== 'boolean') {
      return toolError('Could not estimate CGT — pass income, proceeds, costBase and heldMoreThan12Months.');
    }
    const r = estimateAuCgt(income, proceeds, costBase, losses, args.heldMoreThan12Months);
    if (!r) return toolError('Could not estimate CGT — pass income, proceeds, costBase and heldMoreThan12Months.');
    const lines = [`Australian CGT, ${r.taxYear} (resident individual; amounts in AUD):`, `• Gross capital gain: ${fmt(r.grossGain)}`];
    if (r.lossOffset > 0) lines.push(`• Less capital losses: -${fmt(r.lossOffset)}`);
    if (r.discountApplied) lines.push(`• 50% discount applied (held over 12 months)`);
    lines.push(`• Taxable gain: ${fmt(r.taxableGain)}`, `• CGT payable: ${fmt(r.cgtPayable)}`, srcLine('AU'), DISCLAIMER);
    return {
      text: lines.join('\n'),
      structured: {
        country: 'AU', taxYear: r.taxYear, grossGain: r.grossGain, lossOffset: r.lossOffset,
        discountApplied: r.discountApplied, taxableGain: r.taxableGain, cgtPayable: r.cgtPayable, ...prov('AU'),
      },
    };
  }

  return toolError(`Unknown tool: ${name}`);
}

const SERVER_INFO = { name: 'ai2fin-tax', title: '2Fin Tax MCP', version: '0.3.0' };
// Newest first. initialize echoes the client's requested version when supported,
// otherwise answers with the newest we speak (per the MCP spec's negotiation).
const SUPPORTED_PROTOCOLS = ['2025-06-18', '2025-03-26', '2024-11-05'];
// Shown to the model on connect — introduces Fin (2Fin's mascot) and makes the
// public-vs-account split explicit so agents route account questions correctly.
const INSTRUCTIONS =
  "You're connected to the 2Fin Tax MCP — Fin, the friendly tax helper from 2Fin (AI2Fin, ai2fin.com). " +
  'This is the FREE, PUBLIC tax server: it looks up and computes GST/VAT, income, company and ' +
  'capital-gains tax over published rates for many countries, with no login and no access to anyone’s ' +
  'account. For your OWN data — transactions, categories, your real tax position — connect the separate, ' +
  'authenticated 2Fin app MCP at https://api.ai2fin.com/mcp instead. ' + DISCLAIMER;
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// A friendly signature on the human-facing responses, for anyone who reads
// headers. ASCII only — header values can't carry emoji / non-Latin1.
const BRAND_HEADER = { 'X-Powered-By': 'Fin the dolphin - 2Fin Tax MCP - ai2fin.com/tools' };

// ── The endpoint's three faces (for a browser GET it's the landing page) ──────
const EXAMPLE_CURL =
  "curl -s https://taxmcp.ai2fin.com -X POST -H 'content-type: application/json' " +
  `-d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":` +
  `{"name":"compute_gst_vat","arguments":{"country":"AU","amount":100}}}'`;

/** ASCII business card — shown when a terminal (curl/wget/httpie) hits GET. */
function asciiCard(): string {
  const t = TOOLS.map((x) => x.name);
  return `
  🐬  FIN'S TAX MCP  —  the tax brain your agent calls
  ${'─'.repeat(54)}

         _.--._                 source-cited tax tools for
      .-'      '-.              your assistant or agent.
     (    o       )             ${ROWS.length} countries · ${TOOLS.length} tools ·
      '-._    _.-'              every answer cites its national
          '--'                  tax authority, with a date.
  ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

  TOOLS
    ${t.slice(0, 3).join('   ')}
    ${t.slice(3).join('   ')}

  CONNECT   add this URL in Claude → Settings → Connectors
            (ChatGPT, Cursor or your own agent too — no login, no key)

  TRY IT    ${EXAMPLE_CURL}

  BROWSER   open https://taxmcp.ai2fin.com for the full page 🌊
  YOUR DATA the authenticated 2Fin app MCP → https://api.ai2fin.com/mcp

  no login · no key · nothing stored · general info, not tax advice
`;
}

/** Branded JSON discovery — for a programmatic GET (an agent or a script). */
function jsonDiscovery() {
  return {
    name: SERVER_INFO.name,
    title: SERVER_INFO.title,
    greeting:
      "🐬 You found Fin's Tax MCP — the tax brain your agent calls. Every answer is source-cited to the national tax authority with a verified date.",
    version: SERVER_INFO.version,
    protocol: 'MCP (JSON-RPC 2.0 over HTTP) — POST your messages to this URL.',
    scope: 'Public tax rates & calculators only — no login, no account data, nothing stored.',
    accountServer:
      'For your own 2Fin data (transactions, live tax position), use the authenticated app MCP at https://api.ai2fin.com/mcp',
    countries: ROWS.length,
    tools: TOOLS.map((x) => ({ name: x.name, description: x.description })),
    quickstart: {
      connect:
        'Add https://taxmcp.ai2fin.com as a custom MCP connector in Claude (Settings → Connectors), ChatGPT, Cursor, or your own agent.',
      example: { method: 'tools/call', params: { name: 'compute_gst_vat', arguments: { country: 'AU', amount: 100 } } },
      curl: EXAMPLE_CURL,
    },
    web: 'https://ai2fin.com/tools/taxmcp',
    note: DISCLAIMER,
  };
}

/** llms.txt — the emerging convention agents & crawlers read to self-orient. */
function llmsTxt(): string {
  return [
    "# Fin's Tax MCP (2Fin / AI2Fin)",
    '',
    `> A free, public Model Context Protocol server. Your assistant or agent calls it to look up and compute tax — GST/VAT, income, company and capital-gains — across ${ROWS.length} countries. Every answer is source-cited to the national tax authority with a verified date. No login, no API key, nothing stored.`,
    '',
    '## Connect',
    '- Endpoint: https://taxmcp.ai2fin.com (MCP, JSON-RPC 2.0 over HTTP — POST messages here)',
    '- In Claude: Settings → Connectors → Add custom connector → paste the endpoint. Same idea in ChatGPT, Cursor, or any MCP agent.',
    '',
    '## Tools',
    ...TOOLS.map((x) => `- ${x.name}: ${x.description}`),
    '',
    '## Scope & data',
    '- Public rates & calculators only. For a 2Fin account holder’s own data, use the authenticated app MCP: https://api.ai2fin.com/mcp',
    `- ${DISCLAIMER}`,
    '',
    '## More',
    '- Human page: https://ai2fin.com/tools/taxmcp',
    '- Browser calculators: https://ai2fin.com/tools',
    '',
  ].join('\n');
}

function rpc(id: unknown, result: unknown) {
  return { jsonrpc: '2.0', id, result };
}
function rpcError(id: unknown, code: number, message: string) {
  return { jsonrpc: '2.0', id, error: { code, message } };
}

function handle(msg: any): object | null {
  if (!msg || typeof msg !== 'object' || typeof msg.method !== 'string') {
    return rpcError(msg?.id ?? null, -32600, 'Invalid Request');
  }
  switch (msg.method) {
    case 'initialize': {
      const requested = typeof msg.params?.protocolVersion === 'string' ? msg.params.protocolVersion : '';
      const protocolVersion = SUPPORTED_PROTOCOLS.includes(requested) ? requested : SUPPORTED_PROTOCOLS[0];
      return rpc(msg.id, { protocolVersion, capabilities: { tools: { listChanged: false } }, serverInfo: SERVER_INFO, instructions: INSTRUCTIONS });
    }
    case 'notifications/initialized':
      return null; // notification, no response
    case 'ping':
      return rpc(msg.id, {});
    case 'tools/list':
      return rpc(msg.id, { tools: TOOLS });
    case 'tools/call': {
      const { name, arguments: args } = msg.params ?? {};
      // Unknown tool = a protocol-level mistake (invalid params), not a tool
      // execution error — per the MCP spec's two error channels.
      if (!TOOLS.some((t) => t.name === name)) {
        return rpcError(msg.id ?? null, -32602, `Unknown tool: ${String(name)}. Available: ${TOOLS.map((t) => t.name).join(', ')}`);
      }
      try {
        const r = callTool(name, args ?? {});
        if (r.isError) return rpc(msg.id, { content: [{ type: 'text', text: r.text }], isError: true });
        return rpc(msg.id, { content: [{ type: 'text', text: r.text }], structuredContent: r.structured });
      } catch (e) {
        return rpc(msg.id, { content: [{ type: 'text', text: `Error: ${(e as Error).message}` }], isError: true });
      }
    }
    default:
      return rpcError(msg.id ?? null, -32601, `Method not found: ${msg.method}`);
  }
}

export default {
  async fetch(req: Request): Promise<Response> {
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (req.method === 'GET') {
      const path = new URL(req.url).pathname.replace(/\/+$/, '') || '/';
      const headers = { ...cors, ...BRAND_HEADER };

      // Tiny self-orientation routes for monitors and agents.
      if (path === '/health' || path === '/healthz' || path === '/ping') {
        return new Response("🐬 swimming — Fin's Tax MCP is up.\n", { headers: { 'Content-Type': 'text/plain; charset=utf-8', ...headers } });
      }
      if (path === '/llms.txt') {
        return new Response(llmsTxt(), { headers: { 'Content-Type': 'text/plain; charset=utf-8', ...headers } });
      }
      // A real robots.txt (previously this fell through to the ASCII card,
      // which parses as "no rules" but reads as sloppy). One page, all welcome.
      if (path === '/robots.txt') {
        return new Response('User-agent: *\nAllow: /\n\n# Single-page MCP endpoint. Human docs: https://ai2fin.com/tools/taxmcp\n', {
          headers: { 'Content-Type': 'text/plain; charset=utf-8', ...headers },
        });
      }

      // One endpoint, three faces — chosen by who's asking:
      //   • a browser (Accept: text/html)     → the marketing landing page
      //   • a terminal (curl/wget/httpie UA)  → an ASCII business card
      //   • an agent/script (everything else) → branded JSON discovery
      // The MCP protocol itself is POST-only (below), so this never interferes.
      const accept = req.headers.get('accept') || '';
      const ua = req.headers.get('user-agent') || '';
      if (accept.includes('text/html')) {
        return new Response(LANDING_HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8', ...headers } });
      }
      if (/\b(curl|wget|httpie)\b/i.test(ua)) {
        return new Response(asciiCard(), { headers: { 'Content-Type': 'text/plain; charset=utf-8', ...headers } });
      }
      return new Response(JSON.stringify(jsonDiscovery(), null, 2), { headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers } });
    }
    if (req.method !== 'POST') {
      return new Response(
        "🐬 Fin didn't catch that. POST a JSON-RPC message to call a tool, or open https://taxmcp.ai2fin.com in a browser. Tools: " + TOOLS.map((t) => t.name).join(', ') + '.\n',
        { status: 405, headers: { 'Content-Type': 'text/plain; charset=utf-8', Allow: 'GET, POST, OPTIONS', ...cors, ...BRAND_HEADER } },
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return Response.json(rpcError(null, -32700, 'Parse error'), { headers: cors });
    }

    // Support a single message or a batch.
    if (Array.isArray(body)) {
      const out = body.map(handle).filter(Boolean);
      return Response.json(out, { headers: cors });
    }
    const res = handle(body);
    if (res === null) return new Response(null, { status: 202, headers: cors });
    return Response.json(res, { headers: cors });
  },
};
