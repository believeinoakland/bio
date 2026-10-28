/* ai-catalogue: the payload's schema, judged whole (R36), pure and shared: the issuer calls `validatePayload` before it
 * publishes and a copy before it applies. One invalid part refuses the whole payload (no partial catalogue). It applies
 * R1–R23, R43, R44 and R53–R55, table-driven where a shape is a list of keys, and names the FIRST offending path
 * (`entries[0].checks.P1`).
 *
 * The forms of a claim (R1, R2). A claim is `{value, ev}` with `ev` `{grade, source, date}` (`page` and `quote` too
 * where it is a check answer, a restriction or a binding term), or OPEN, `{open: true}`, never defaulted. The fields R1
 * lists that R4, R7, R16 give a value set (`capabilities.*`, `limits.*`, `zero_retention`, a plan's `scope`, `runtimes`,
 * `token_storage`, `money`, `means_allowed`, `free_tier_trains`) are claims of that form. The records with fields of
 * their own (`effort_set`, `effort_classes`, `prices`, `standard_task_costs`, `price_basis`, a gate record, a
 * characterization property, a binding term, guidance and warnings) carry their `ev` beside their fields. A check is
 * `{answer, ev}`, `{answer: "OPEN"}` or `{open: true}`. A restriction is R16's `{kind, quote, page, date}`. */
import { CATALOGUE_CHECKS } from "./checks.mjs";

export const ENTRY_ID_MAX = 96;
export const DISPLAY_NAME_MAX = 60;
export const EFFORT_WORD_MAX = 16;

export const GRADES = Object.freeze(["REPRODUCED", "REPORTED", "STATED"]);
export const MEASURED_GRADES = Object.freeze(["REPRODUCED", "REPORTED"]);
export const LIFECYCLE = Object.freeze(["listed", "watch", "lapsed", "retired"]);
export const CHECK_IDS = Object.freeze(["P1", "P2", "P3", "P4", "P5", "P6", "P7"]);
export const SHOWN_IDS = Object.freeze(["terms_permit_use", "breach_notification"]);
export const VERDICTS = Object.freeze(["passes", "passes_with_limits", "not_suitable", "not_yet_rated"]);
export const LIMIT_KINDS = Object.freeze(["context_depth", "no_image_input", "no_streaming", "no_parallel_tools", "output_cap"]);
export const CH_IDS = Object.freeze(["CH1", "CH2", "CH3", "CH4", "CH5", "CH6", "CH7", "CH8", "CH9", "CH10"]);
export const HOST_KINDS = Object.freeze(["direct", "aggregator", "gateway", "builtin", "custom"]);
export const PLAN_KINDS = Object.freeze(["api", "subscription", "aggregator", "gateway", "builtin", "custom"]);
export const SCOPES = Object.freeze(["member", "project", "team", "unconfirmed"]);
export const CREDENTIAL_KINDS = Object.freeze(["api_key", "signin_token", "none"]);
export const CONNECTION_WAYS = Object.freeze(["pasted_key", "provider_signin", "built_in"]);
export const MEANS = Object.freeze(["gateway", "sealed", "reference", "issued", "none"]);
export const MONEY = Object.freeze(["reported", "priced", "none"]);
export const RUNTIMES = Object.freeze(["shared_worker", "member_runtime", "member_device"]);
export const TOKEN_STORAGE = Object.freeze(["sealed", "reference_only", "member_device"]);
export const STEP_KINDS = Object.freeze(["link", "choose", "copy", "approve", "confirm"]);
export const TERM_KINDS = Object.freeze(["political_use", "high_risk_review", "indemnity", "no_sla", "deprecation_notice", "other"]);
/* R7: the capability names and value sets, `agent-model` R30's */
const BOOL = (v) => typeof v === "boolean";
const oneOf = (list) => (v) => list.includes(v);
export const CAPABILITIES = Object.freeze({
  tools: BOOL, parallel_tools: BOOL, schema_output: BOOL, schema_with_tools: BOOL, image_input: BOOL,
  streaming: oneOf(["none", "text", "tool_calls"]), session: oneOf(["none", "provider_state", "resend_only"]),
  caching: oneOf(["none", "automatic", "explicit"]), batch: BOOL,
});
export const LIMIT_KEYS = Object.freeze(["context_stated", "context_effective", "max_output", "image_max_bytes"]);

const E = "CATALOGUE_ENTRY_INVALID", P = "CATALOGUE_PLAN_INVALID", EV = "CATALOGUE_EVIDENCE_MISSING",
  PL = "CATALOGUE_PAYLOAD_INVALID";

/* ------------------------------------------------------------------ the shapes */

class Bad { constructor(reason, path) { this.reason = reason; this.path = path; } }
const fail = (reason, path) => { throw new Bad(reason, path); };

export const isObj = (x) => x !== null && typeof x === "object" && !Array.isArray(x)
  && (Object.getPrototypeOf(x) === Object.prototype || Object.getPrototypeOf(x) === null);
export const isOpen = (x) => isObj(x) && Object.keys(x).length === 1 && x.open === true;
export const TOKEN_RE = /^[a-z0-9._:-]+$/;
const isToken = (s, max = ENTRY_ID_MAX) => typeof s === "string" && s.length >= 1 && s.length <= max && TOKEN_RE.test(s);
const isText = (s, max = 2000) => typeof s === "string" && s.trim().length >= 1 && s.length <= max;
const isNum = (n) => typeof n === "number" && Number.isFinite(n) && n >= 0;
const isWhole = (n, least = 0) => Number.isSafeInteger(n) && n >= least;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
/** A `YYYY-MM-DD` that exists. */
export function isDate(s) {
  const m = typeof s === "string" ? DATE_RE.exec(s) : null;
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
}
const INSTANT_RE = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})Z$/;
export function isInstant(s) {
  const m = typeof s === "string" ? INSTANT_RE.exec(s) : null;
  return !!m && isDate(m[1]) && +m[2] < 24 && +m[3] < 60 && +m[4] < 60;
}
const LANG_RE = /^[a-z]{2,3}(-[A-Za-z0-9]{1,8})*$/;

/* Keys: none outside `allowed`, every one of `required`; `reason` names the path of the first offence. */
function keys(x, path, reason, allowed, required = allowed) {
  if (!isObj(x)) fail(reason, path);
  for (const k of Object.keys(x)) if (!allowed.includes(k)) fail(reason, `${path}.${k}`);
  for (const k of required) if (!Object.hasOwn(x, k)) fail(reason, `${path}.${k}`);
}

/* R1, R3: evidence, named by the claim's path. `measured` refuses STATED; `quoted` needs `page` and `quote`. */
function ev(x, path, { measured = false, quoted = false } = {}) {
  /* DEC-49 REGION is-claim-evidenced */
  if (!isObj(x)) fail(EV, path);
  if (!GRADES.includes(x.grade) || !isText(x.source) || !isDate(x.date)) fail(EV, path);
  if (measured && !MEASURED_GRADES.includes(x.grade)) fail(EV, path);
  if (quoted && (!isText(x.quote, 8000) || !isText(x.page))) fail(EV, path);
  /* END DEC-49 REGION is-claim-evidenced */
}

/* A claim `{value, ev}` or OPEN; `valueOk` judges the value, a bad one refused `reason` at the path. */
function claim(x, path, reason, valueOk, opts) {
  if (isOpen(x)) return;
  if (!isObj(x)) fail(reason, path);
  for (const k of Object.keys(x)) if (k !== "value" && k !== "ev") fail(reason, `${path}.${k}`);
  if (!Object.hasOwn(x, "ev")) fail(EV, path);
  ev(x.ev, path, opts);
  if (!valueOk(x.value)) fail(reason, path);
}
/* A record with its own fields and an `ev` beside them, or OPEN when `open` allows it. */
function evidenced(x, path, reason, allowed, required, { open = true, ...opts } = {}) {
  if (open && isOpen(x)) return false;
  if (!isObj(x)) fail(reason, path);
  if (!Object.hasOwn(x, "ev")) fail(EV, path);
  keys(x, path, reason, [...allowed, "ev"], required);
  ev(x.ev, path, opts);
  return true;
}
const subset = (list, { nonEmpty = true } = {}) => (v) => Array.isArray(v) && (!nonEmpty || v.length > 0)
  && v.every((x) => list.includes(x)) && new Set(v).size === v.length;
const words = (x, path, reason) => {
  if (!isObj(x) || !Object.keys(x).length) fail(reason, path);
  for (const [tag, w] of Object.entries(x)) if (!LANG_RE.test(tag) || !isText(w, 8000)) fail(reason, `${path}.${tag}`);
  /* R51: every text people read carries `en` */
  if (!Object.hasOwn(x, "en")) fail(E, `${path}.en`);
};
const ids = (list, path, reason, idKey) => {
  if (!Array.isArray(list)) fail(reason, path);
  const seen = new Set();
  list.forEach((x, i) => {
    if (!isObj(x) || !isToken(x[idKey])) fail(reason, `${path}[${i}].${idKey}`);
    if (seen.has(x[idKey])) fail(reason, `${path}[${i}].${idKey}`);
    seen.add(x[idKey]);
  });
  return new Map(list.map((x) => [x[idKey], x]));
};

/* ------------------------------------------------------------------ the checks (R11–R13) */

function check(x, path, { barred = false } = {}) {
  if (isOpen(x)) return;
  if (!isObj(x)) fail(E, path);
  for (const k of Object.keys(x)) if (k !== "answer" && k !== "ev") fail(E, `${path}.${k}`);
  if (x.answer === "OPEN") return;
  if (x.answer !== "met" && x.answer !== "not_met") fail(E, path);
  if (!Object.hasOwn(x, "ev")) fail(EV, path);
  ev(x.ev, path, { quoted: true });
  /* R12: a developer in `policy.origin.barred` never carries P7 met */
  if (barred && x.answer === "met") fail(E, path);
}

/* ------------------------------------------------------------------ gate and characterization (R3, R9, R14) */

const SUITE_KEYS = ["bank", "scorer", "thresholds", "image"];
function gateRecord(x, path) {
  const allowed = ["verdict", "limits", "partial_coverage", "suiteVersions", "tier", "at", "run_ref"];
  evidenced(x, path, E, allowed, allowed, { open: false, measured: true });
  if (!VERDICTS.includes(x.verdict)) fail(E, `${path}.verdict`);
  if (!Array.isArray(x.limits)) fail(E, `${path}.limits`);
  x.limits.forEach((l, i) => {
    keys(l, `${path}.limits[${i}]`, E, ["kind", "value"]);
    if (!LIMIT_KINDS.includes(l.kind)) fail(E, `${path}.limits[${i}].kind`);
  });
  if (x.verdict === "passes_with_limits" ? x.limits.length === 0 : x.limits.length !== 0) fail(E, `${path}.limits`);
  if (typeof x.partial_coverage !== "boolean") fail(E, `${path}.partial_coverage`);
  keys(x.suiteVersions, `${path}.suiteVersions`, E, SUITE_KEYS);
  for (const k of SUITE_KEYS) {
    const v = x.suiteVersions[k];
    if (!(v === null || isText(v, 200) || isWhole(v))) fail(E, `${path}.suiteVersions.${k}`);
  }
  if (!(x.tier === null || isText(x.tier, 64))) fail(E, `${path}.tier`);
  if (!(isInstant(x.at) || isDate(x.at))) fail(E, `${path}.at`);
  if (!(x.run_ref === null || isText(x.run_ref, 200))) fail(E, `${path}.run_ref`);
  /* R3: a Civicsmith run names its run */
  if (x.ev.grade === "REPRODUCED" && x.run_ref === null) fail(EV, path);
}

function characterization(x, path) {
  keys(x, path, E, CH_IDS);
  for (const id of CH_IDS) {
    const p = x[id], at = `${path}.${id}`;
    if (id === "CH10") { keys(p, at, E, ["ref"]); if (p.ref !== "checks") fail(E, `${at}.ref`); continue; }
    if (isOpen(p)) continue;
    const allowed = ["value", "method", "samples", "conditions"];
    evidenced(p, at, E, id === "CH4" ? [...allowed, "reviewer"] : allowed, allowed, { open: false, measured: true });
    if (!isText(p.method, 400)) fail(E, `${at}.method`);
    if (!(isWhole(p.samples) || p.samples === null)) fail(E, `${at}.samples`);
    /* R9: the reasonableness reading is a person's, REPORTED, naming who and when */
    if (id === "CH4" && (p.ev.grade !== "REPORTED" || !isText(p.reviewer, 200))) fail(EV, at);
  }
}

/* ------------------------------------------------------------------ entries (R4–R15) */

const ENTRY_KEYS = ["entry_id", "display_name", "provider", "host", "model", "version", "version_kind", "plan_ids",
  "adapter_type", "profile", "developer", "capabilities", "effort_set", "effort_classes", "limits", "prices",
  "zero_retention", "standard_task_costs", "pin", "served_ids", "checks", "shown", "gate", "characterization",
  "lifecycle", "confirmed_at", "shutdown_date"];
const ENTRY_OPTIONAL = ["effort_classes", "pin", "characterization", "shutdown_date"];
const ENTRY_REQUIRED = ENTRY_KEYS.filter((k) => !ENTRY_OPTIONAL.includes(k));
const PRICE_FIGURES = ["input", "output", "cache_read", "cache_write"];

function entry(x, path, ctx) {
  /* DEC-49 REGION is-entry-valid */
  keys(x, path, E, ENTRY_KEYS, ENTRY_REQUIRED);
  if (!isToken(x.entry_id)) fail(E, `${path}.entry_id`);
  if (!isText(x.display_name, DISPLAY_NAME_MAX)) fail(E, `${path}.display_name`);
  /* R5: provider and host are the payload's providers; the plans are the host's */
  if (!ctx.providers.has(x.provider)) fail(E, `${path}.provider`);
  if (!ctx.providers.has(x.host)) fail(E, `${path}.host`);
  if (!isText(x.model, 200)) fail(E, `${path}.model`);
  if (!isText(x.version, 200)) fail(E, `${path}.version`);
  if (x.version_kind !== "dated" && x.version_kind !== "fixed") fail(E, `${path}.version_kind`);
  if (!Array.isArray(x.plan_ids) || !x.plan_ids.length || new Set(x.plan_ids).size !== x.plan_ids.length
      || !x.plan_ids.every((id) => ctx.plans.has(id) && ctx.plans.get(id).provider === x.host)) fail(E, `${path}.plan_ids`);
  if (!isToken(x.adapter_type, 64)) fail(E, `${path}.adapter_type`);
  /* R53: the profile resolves, at a version that serves it */
  keys(x.profile, `${path}.profile`, E, ["id", "min_version"]);
  const prof = ctx.profiles.get(x.profile.id);
  if (!prof || !isWhole(x.profile.min_version, 1) || x.profile.min_version > prof.version
      || prof.adapter_type !== x.adapter_type) fail(E, `${path}.profile`);
  keys(x.developer, `${path}.developer`, E, ["name", "jurisdiction"]);
  if (!isText(x.developer.name, 200)) fail(E, `${path}.developer.name`);
  const j = x.developer.jurisdiction;
  if (!(isOpen(j) || (typeof j === "string" && /^[A-Za-z0-9-]{1,16}$/.test(j)))) fail(E, `${path}.developer.jurisdiction`);
  /* R7 */
  keys(x.capabilities, `${path}.capabilities`, E, Object.keys(CAPABILITIES));
  for (const [k, ok] of Object.entries(CAPABILITIES)) claim(x.capabilities[k], `${path}.capabilities.${k}`, E, ok);
  const es = x.effort_set;
  evidenced(es, `${path}.effort_set`, E, ["values", "default"], ["values"], { open: false });
  const effortWord = (w) => typeof w === "string" && w.length <= EFFORT_WORD_MAX && /^[a-z]+$/.test(w);
  if (!Array.isArray(es.values) || !es.values.every(effortWord) || new Set(es.values).size !== es.values.length)
    fail(E, `${path}.effort_set.values`);
  if (es.values.length === 0 ? !(es.default === undefined || es.default === null) : !es.values.includes(es.default))
    fail(E, `${path}.effort_set.default`);
  if (x.effort_classes !== undefined) {
    if (!es.values.length) fail(E, `${path}.effort_classes`);
    evidenced(x.effort_classes, `${path}.effort_classes`, E, ["low", "medium"], ["low", "medium"], { open: false });
    for (const k of ["low", "medium"]) if (!es.values.includes(x.effort_classes[k])) fail(E, `${path}.effort_classes.${k}`);
  }
  keys(x.limits, `${path}.limits`, E, LIMIT_KEYS);
  for (const k of LIMIT_KEYS) claim(x.limits[k], `${path}.limits.${k}`, E, isNum);
  /* R8: an unstated price is null, never 0 */
  if (evidenced(x.prices, `${path}.prices`, E, ["unit", ...PRICE_FIGURES, "tiers", "date"], ["unit", ...PRICE_FIGURES, "date"])) {
    if (x.prices.unit !== "usd_per_million_tokens") fail(E, `${path}.prices.unit`);
    for (const k of PRICE_FIGURES) if (!(x.prices[k] === null || isNum(x.prices[k]))) fail(E, `${path}.prices.${k}`);
    if (!isDate(x.prices.date)) fail(E, `${path}.prices.date`);
    if (x.prices.tiers !== undefined && !(Array.isArray(x.prices.tiers) && x.prices.tiers.every(isObj))) fail(E, `${path}.prices.tiers`);
  }
  claim(x.zero_retention, `${path}.zero_retention`, E, BOOL);
  if (evidenced(x.standard_task_costs, `${path}.standard_task_costs`, E, ["unit", "by_part", "price_date"], ["unit", "by_part", "price_date"])) {
    const c = x.standard_task_costs;
    if (!isText(c.unit, 64)) fail(E, `${path}.standard_task_costs.unit`);
    if (!isDate(c.price_date)) fail(E, `${path}.standard_task_costs.price_date`);
    if (!isObj(c.by_part)) fail(E, `${path}.standard_task_costs.by_part`);
    for (const [part, r] of Object.entries(c.by_part)) {
      const at = `${path}.standard_task_costs.by_part.${part}`;
      if (!ctx.parts.has(part)) fail(E, at);
      keys(r, at, E, ["low", "high"]);
      if (!isNum(r.low) || !isNum(r.high) || r.low > r.high) fail(E, at);
    }
  }
  /* R6: a host that routes to others is pinned; never a fallback */
  const kind = ctx.providers.get(x.host).kind;
  if (kind === "aggregator" || kind === "gateway") {
    const pin = x.pin;
    keys(pin, `${path}.pin`, E, ["only", "allow_fallbacks", "deny_collection", "require_parameters", "zero_retention"],
      ["only", "allow_fallbacks", "deny_collection", "require_parameters"]);
    if (!Array.isArray(pin.only) || !pin.only.length || !pin.only.every((p) => ctx.providers.has(p))) fail(E, `${path}.pin`);
    if (pin.allow_fallbacks !== false || pin.deny_collection !== true || typeof pin.require_parameters !== "boolean") fail(E, `${path}.pin`);
    const zr = x.zero_retention && !isOpen(x.zero_retention) && x.zero_retention.value === true;
    if (zr ? pin.zero_retention !== true : !(pin.zero_retention === undefined || typeof pin.zero_retention === "boolean")) fail(E, `${path}.pin`);
  } else if (!(x.pin === undefined || x.pin === null)) fail(E, `${path}.pin`);
  if (!Array.isArray(x.served_ids) || !x.served_ids.length || !x.served_ids.every((s) => isText(s, 200))) fail(E, `${path}.served_ids`);
  /* R11, R12 */
  if (!isObj(x.checks)) fail(E, `${path}.checks`);
  for (const k of Object.keys(x.checks)) if (!CHECK_IDS.includes(k)) fail(E, `${path}.checks.${k}`);
  const barred = typeof j === "string" && ctx.barred.has(j);
  for (const id of CHECK_IDS) {
    if (!Object.hasOwn(x.checks, id)) fail(E, `${path}.checks.${id}`);
    check(x.checks[id], `${path}.checks.${id}`, { barred: id === "P7" && barred });
  }
  /* R13 */
  keys(x.shown, `${path}.shown`, E, SHOWN_IDS);
  for (const id of SHOWN_IDS) check(x.shown[id], `${path}.shown.${id}`);
  /* R14 */
  if (!isObj(x.gate)) fail(E, `${path}.gate`);
  for (const [part, g] of Object.entries(x.gate)) {
    if (!ctx.parts.has(part)) fail(E, `${path}.gate.${part}`);
    gateRecord(g, `${path}.gate.${part}`);
  }
  /* R9: a listed or watched entry carries its characterization */
  if (!LIFECYCLE.includes(x.lifecycle)) fail(E, `${path}.lifecycle`);
  if (x.characterization === undefined || x.characterization === null) {
    if (x.lifecycle === "listed" || x.lifecycle === "watch") fail(E, `${path}.characterization`);
  } else characterization(x.characterization, `${path}.characterization`);
  if (!isDate(x.confirmed_at)) fail(E, `${path}.confirmed_at`);
  if (x.shutdown_date !== undefined && !isDate(x.shutdown_date)) fail(E, `${path}.shutdown_date`);
  /* END DEC-49 REGION is-entry-valid */
}

/* ------------------------------------------------------------------ plans (R16–R23) */

const PLAN_KEYS = ["plan_id", "provider", "kind", "scope", "credential_kind", "means_allowed", "connection_ways", "runtimes",
  "token_storage", "token_bounds", "price_basis", "money", "restrictions", "binding_terms", "guidance_id",
  "free_tier_trains", "warning_id", "lifecycle", "confirmed_at"];
const PLAN_REQUIRED = PLAN_KEYS.filter((k) => k !== "token_bounds" && k !== "warning_id");

/** R17: the means a credential kind may be held by. */
export function meansAllowedFor(credentialKind, means) {
  if (!Array.isArray(means) || !means.length || new Set(means).size !== means.length || !means.every((m) => MEANS.includes(m))) return false;
  if (means.includes("none")) return credentialKind === "none" && means.length === 1;
  if (credentialKind === "none") return false;
  if (means.includes("gateway") && credentialKind !== "api_key") return false;
  if (means.includes("issued") && credentialKind !== "signin_token") return false;
  return true;
}

function plan(x, path, ctx) {
  /* DEC-49 REGION is-plan-valid */
  keys(x, path, P, PLAN_KEYS, PLAN_REQUIRED);
  if (!isToken(x.plan_id)) fail(P, `${path}.plan_id`);
  if (!ctx.providers.has(x.provider)) fail(P, `${path}.provider`);
  if (!PLAN_KINDS.includes(x.kind)) fail(P, `${path}.kind`);
  claim(x.scope, `${path}.scope`, P, oneOf(SCOPES));
  if (!CREDENTIAL_KINDS.includes(x.credential_kind)) fail(P, `${path}.credential_kind`);
  claim(x.means_allowed, `${path}.means_allowed`, P, (v) => meansAllowedFor(x.credential_kind, v));
  if (!subset(CONNECTION_WAYS)(x.connection_ways)) fail(P, `${path}.connection_ways`);
  claim(x.runtimes, `${path}.runtimes`, P, subset(RUNTIMES));
  claim(x.token_storage, `${path}.token_storage`, P, oneOf(TOKEN_STORAGE));
  if (x.token_bounds !== undefined) {
    keys(x.token_bounds, `${path}.token_bounds`, P, ["min_length", "max_length"]);
    const { min_length: lo, max_length: hi } = x.token_bounds;
    if (x.credential_kind !== "signin_token" || !isWhole(lo, 1) || !isWhole(hi, 1) || lo > hi) fail(P, `${path}.token_bounds`);
  }
  if (evidenced(x.price_basis, `${path}.price_basis`, P, ["basis", "amount", "currency", "period", "includes", "limits", "date"],
    ["basis", "includes", "limits", "date"])) {
    const b = x.price_basis;
    if (!isText(b.basis, 64)) fail(P, `${path}.price_basis.basis`);
    if (b.amount !== undefined && !(b.amount === null || isNum(b.amount))) fail(P, `${path}.price_basis.amount`);
    if (!isDate(b.date)) fail(P, `${path}.price_basis.date`);
  }
  claim(x.money, `${path}.money`, P, oneOf(MONEY));
  if (!Array.isArray(x.restrictions)) fail(P, `${path}.restrictions`);
  x.restrictions.forEach((r, i) => {
    const at = `${path}.restrictions[${i}]`;
    if (isOpen(r)) return;
    if (!isObj(r)) fail(P, at);
    for (const k of Object.keys(r)) if (!["kind", "quote", "page", "date"].includes(k)) fail(P, `${at}.${k}`);
    if (!isText(r.quote, 8000) || !isText(r.page) || !isDate(r.date)) fail(EV, at);
    if (!isText(r.kind, 64)) fail(P, `${at}.kind`);
  });
  /* R22: a binding term carries its quote; it restricts nothing */
  if (!Array.isArray(x.binding_terms)) fail(P, `${path}.binding_terms`);
  x.binding_terms.forEach((t, i) => {
    const at = `${path}.binding_terms[${i}]`;
    const allowed = ["doc", "version", "section", "quote", "effective_from", "effective_to", "kind"];
    if (!isObj(t)) fail(P, at);
    if (!isText(t.quote, 8000)) fail(EV, at);
    evidenced(t, at, P, allowed, allowed.filter((k) => k !== "effective_to"), { open: false, quoted: false });
    if (!isText(t.doc, 400) || !isText(String(t.version ?? ""), 64) || !isText(t.section, 200)) fail(P, at);
    if (!isDate(t.effective_from) || (t.effective_to !== undefined && !isDate(t.effective_to))) fail(P, at);
    if (!TERM_KINDS.includes(t.kind)) fail(P, `${at}.kind`);
  });
  if (!isToken(x.guidance_id)) fail(P, `${path}.guidance_id`);
  claim(x.free_tier_trains, `${path}.free_tier_trains`, P, BOOL);
  /* R21: a free tier that trains carries its warning */
  const trains = !isOpen(x.free_tier_trains) && x.free_tier_trains.value === true;
  if (x.warning_id !== undefined && !isToken(x.warning_id)) fail(P, `${path}.warning_id`);
  if (trains && !(x.warning_id !== undefined && ctx.warnings.has(x.warning_id))) fail(P, `${path}.warning_id`);
  if (!LIFECYCLE.includes(x.lifecycle)) fail(P, `${path}.lifecycle`);
  if (!isDate(x.confirmed_at)) fail(P, `${path}.confirmed_at`);
  /* END DEC-49 REGION is-plan-valid */
}

/* ------------------------------------------------------------------ guidance, warnings, profiles (R20, R21, R51, R53) */

function guidance(x, path) {
  evidenced(x, path, E, ["guidance_id", "plan_id", "steps"], ["guidance_id", "plan_id", "steps"], { open: false });
  if (!isToken(x.plan_id)) fail(E, `${path}.plan_id`);
  if (!Array.isArray(x.steps) || !x.steps.length) fail(E, `${path}.steps`);
  x.steps.forEach((s, i) => {
    const at = `${path}.steps[${i}]`;
    keys(s, at, E, ["kind", "text", "url"], ["kind", "text"]);
    if (!STEP_KINDS.includes(s.kind)) fail(E, `${at}.kind`);
    words(s.text, `${at}.text`, E);
    if (s.url !== undefined && !(typeof s.url === "string" && /^https:\/\/[^\s]+$/.test(s.url))) fail(E, `${at}.url`);
  });
}
function warning(x, path) {
  evidenced(x, path, E, ["warning_id", "text"], ["warning_id", "text"], { open: false });
  words(x.text, `${path}.text`, E);
}
const AUTH_RE = /^(bearer|header:[A-Za-z0-9-]{1,64}|binding|none)$/;
const PROFILE_KEYS = ["id", "adapter_type", "version", "base_url", "allowed_hosts", "auth_style", "mappings", "pin_map",
  "idempotency", "reasoning_billing", "features", "quirks", "served_report", "key_shapes"];
const shapeOrNull = (v) => v === null || typeof v === "string" || isObj(v);
function profile(x, path) {
  keys(x, path, PL, PROFILE_KEYS);
  if (!isToken(x.adapter_type, 64)) fail(PL, `${path}.adapter_type`);
  if (!isWhole(x.version, 1)) fail(PL, `${path}.version`);
  if (!(typeof x.base_url === "string" && /^https:\/\/[^\s]+$/.test(x.base_url))) fail(PL, `${path}.base_url`);
  if (!Array.isArray(x.allowed_hosts) || !x.allowed_hosts.every((h) => typeof h === "string" && /^[a-z0-9.-]+$/.test(h)))
    fail(PL, `${path}.allowed_hosts`);
  if (!(typeof x.auth_style === "string" && AUTH_RE.test(x.auth_style))) fail(PL, `${path}.auth_style`);
  if (!isObj(x.mappings)) fail(PL, `${path}.mappings`);
  if (!(x.pin_map === null || isObj(x.pin_map))) fail(PL, `${path}.pin_map`);
  for (const k of ["idempotency", "served_report"]) if (!shapeOrNull(x[k])) fail(PL, `${path}.${k}`);
  if (!(isOpen(x.reasoning_billing) || x.reasoning_billing === "in_output" || x.reasoning_billing === "apart"))
    fail(PL, `${path}.reasoning_billing`);
  if (!(Array.isArray(x.features) || isObj(x.features))) fail(PL, `${path}.features`);
  if (!Array.isArray(x.quirks) || !x.quirks.every((q) => typeof q === "string" && /^[a-z_]+$/.test(q))) fail(PL, `${path}.quirks`);
  if (!Array.isArray(x.key_shapes)) fail(PL, `${path}.key_shapes`);
  x.key_shapes.forEach((k, i) => {
    let ok = typeof k === "string" && k.length > 0 && k.length <= 400;
    if (ok) { try { new RegExp(k); } catch { ok = false; } }
    if (!ok) fail(PL, `${path}.key_shapes[${i}]`);
  });
}

/* ------------------------------------------------------------------ the results library (R43, R44, R54, R55) */

const LIBRARY_KEYS = ["row_id", "subject_id", "suiteVersions", "parts", "speed", "task_cost", "tested_by", "tested_at",
  "grade", "repeated_by_civicsmith", "team_name", "consent_ref"];
const TESTED_KEYS = ["subject_id", "display_name", "provider_name", "host_name", "model", "version", "developer"];
const COMBINED_KEYS = ["subject_id", "part", "as_of", "window", "results", "left_out", "groups", "verdict", "limits", "speed",
  "task_cost", "suiteVersions", "confirmed"];
const figure = (v) => v === null || isNum(v) || isOpen(v);
const verdictsOf = (x, path, parts) => {
  if (!isObj(x)) fail(PL, path);
  for (const [part, r] of Object.entries(x)) {
    if (!parts.has(part)) fail(PL, `${path}.${part}`);
    keys(r, `${path}.${part}`, PL, ["verdict", "limits"]);
    if (!VERDICTS.includes(r.verdict) || !Array.isArray(r.limits)) fail(PL, `${path}.${part}`);
  }
};
const costOf = (c, path) => {
  if (isOpen(c)) return;
  keys(c, path, PL, ["low", "high", "unit", "price_date"]);
  if (!figure(c.low) || !figure(c.high) || !isText(c.unit, 64) || !isDate(c.price_date)) fail(PL, path);
};

function libraryRow(x, path, ctx) {
  /* R44: the row is closed; nothing of a team's own travels but a consented name */
  if (!isObj(x)) fail(PL, path);
  for (const k of Object.keys(x)) if (!LIBRARY_KEYS.includes(k)) fail(PL, `${path}.library_private`);
  if (x.team_name !== undefined && !(isText(x.team_name, 120) && isText(x.consent_ref, 200))) fail(PL, `${path}.library_private`);
  if (x.consent_ref !== undefined && x.team_name === undefined) fail(PL, `${path}.library_private`);
  keys(x, path, PL, LIBRARY_KEYS, LIBRARY_KEYS.filter((k) => k !== "team_name" && k !== "consent_ref"));
  if (!isToken(x.row_id)) fail(PL, `${path}.row_id`);
  if (!ctx.entryIds.has(x.subject_id) && !ctx.testedIds.has(x.subject_id)) fail(PL, `${path}.subject_id`);
  if (!isObj(x.suiteVersions)) fail(PL, `${path}.suiteVersions`);
  verdictsOf(x.parts, `${path}.parts`, ctx.parts);
  if (!isOpen(x.speed)) {
    keys(x.speed, `${path}.speed`, PL, ["median_ms", "p90_ms", "window"]);
    if (!figure(x.speed.median_ms) || !figure(x.speed.p90_ms)) fail(PL, `${path}.speed`);
  }
  costOf(x.task_cost, `${path}.task_cost`);
  if (x.tested_by !== "civicsmith" && x.tested_by !== "team") fail(PL, `${path}.tested_by`);
  if (!isDate(x.tested_at)) fail(PL, `${path}.tested_at`);
  /* R43: Civicsmith's own are REPRODUCED, a team's REPORTED */
  if (x.grade !== (x.tested_by === "civicsmith" ? "REPRODUCED" : "REPORTED")) fail(EV, `${path}.grade`);
  if (typeof x.repeated_by_civicsmith !== "boolean") fail(PL, `${path}.repeated_by_civicsmith`);
  if (x.tested_by === "civicsmith" && x.team_name !== undefined) fail(PL, `${path}.library_private`);
}

function tested(x, path, ctx) {
  if (!isObj(x)) fail(PL, path);
  for (const k of Object.keys(x)) if (!TESTED_KEYS.includes(k)) fail(PL, `${path}.tested`);
  keys(x, path, PL, TESTED_KEYS);
  /* R54: a tested AI has an entry's form of id, never an entry's id */
  if (!isToken(x.subject_id)) fail(PL, `${path}.subject_id`);
  if (ctx.entryIds.has(x.subject_id)) fail(PL, `${path}.subject_id`);
  if (!isText(x.display_name, DISPLAY_NAME_MAX)) fail(PL, `${path}.display_name`);
  for (const k of ["provider_name", "host_name", "model", "version"]) if (!isText(x[k], 200)) fail(PL, `${path}.${k}`);
  keys(x.developer, `${path}.developer`, PL, ["name", "jurisdiction"]);
}

function combined(x, path, ctx) {
  keys(x, path, PL, COMBINED_KEYS);
  if (!ctx.entryIds.has(x.subject_id) && !ctx.testedIds.has(x.subject_id)) fail(PL, `${path}.subject_id`);
  if (!ctx.parts.has(x.part)) fail(PL, `${path}.part`);
  if (!isDate(x.as_of)) fail(PL, `${path}.as_of`);
  keys(x.window, `${path}.window`, PL, ["from", "to"]);
  keys(x.results, `${path}.results`, PL, ["total", "reproduced", "reported"]);
  const { total, reproduced, reported } = x.results;
  if (![total, reproduced, reported].every((n) => isWhole(n))) fail(PL, `${path}.results`);
  /* R55: the counts add up, and `confirmed` says what they say */
  if (total !== reproduced + reported) fail(PL, `${path}.results`);
  if (typeof x.confirmed !== "boolean" || x.confirmed !== (total > 0 && reported === 0)) fail(PL, `${path}.confirmed`);
  if (!isWhole(x.left_out)) fail(PL, `${path}.left_out`);
  if (!isObj(x.groups)) fail(PL, `${path}.groups`);
  for (const [g, r] of Object.entries(x.groups)) {
    keys(r, `${path}.groups.${g}`, PL, ["k", "n", "wilson_low", "wilson_high"]);
    if (!isWhole(r.k) || !isWhole(r.n) || r.k > r.n) fail(PL, `${path}.groups.${g}`);
  }
  if (!VERDICTS.includes(x.verdict) || !Array.isArray(x.limits)) fail(PL, `${path}.verdict`);
  if (!isOpen(x.speed)) {
    keys(x.speed, `${path}.speed`, PL, ["median_ms", "p90_ms"]);
    if (!figure(x.speed.median_ms) || !figure(x.speed.p90_ms)) fail(PL, `${path}.speed`);
  }
  costOf(x.task_cost, `${path}.task_cost`);
  if (!isObj(x.suiteVersions)) fail(PL, `${path}.suiteVersions`);
}

/* ------------------------------------------------------------------ the payload (R36) */

export const PAYLOAD_KEYS = Object.freeze(["schema_version", "seq", "issued_at", "providers", "parts", "policy", "profiles",
  "plans", "guidance", "warnings", "entries", "tested", "library", "combined"]);
const POLICY_KEYS = ["origin", "review_period_days", "stale_after_days"];

function payloadOf(x, supported) {
  /* DEC-49 REGION is-payload-valid */
  keys(x, "payload", PL, PAYLOAD_KEYS);
  if (!isWhole(x.schema_version, 1) || (Array.isArray(supported) && !supported.includes(x.schema_version))) fail(PL, "schema_version");
  if (!isWhole(x.seq, 1)) fail(PL, "seq");
  if (!isInstant(x.issued_at)) fail(PL, "issued_at");
  const providers = ids(x.providers, "providers", PL, "id");
  x.providers.forEach((p, i) => {
    keys(p, `providers[${i}]`, PL, ["id", "name", "kind"]);
    if (!isText(p.name, 200)) fail(PL, `providers[${i}].name`);
    if (!HOST_KINDS.includes(p.kind)) fail(PL, `providers[${i}].kind`);
  });
  if (!Array.isArray(x.parts) || !x.parts.length || !x.parts.every((p) => isToken(p, 32)) || new Set(x.parts).size !== x.parts.length)
    fail(PL, "parts");
  keys(x.policy, "policy", PL, POLICY_KEYS);
  keys(x.policy.origin, "policy.origin", PL, ["check", "barred"]);
  if (x.policy.origin.check !== "P7") fail(PL, "policy.origin.check");
  if (!Array.isArray(x.policy.origin.barred) || !x.policy.origin.barred.every((c) => typeof c === "string" && /^[A-Za-z0-9-]{1,16}$/.test(c)))
    fail(PL, "policy.origin.barred");
  if (!isWhole(x.policy.review_period_days, 1)) fail(PL, "policy.review_period_days");
  if (!isWhole(x.policy.stale_after_days, 1)) fail(PL, "policy.stale_after_days");
  const ctx = { providers, parts: new Set(x.parts), barred: new Set(x.policy.origin.barred) };
  ctx.profiles = ids(x.profiles, "profiles", PL, "id");
  x.profiles.forEach((p, i) => profile(p, `profiles[${i}]`));
  ctx.warnings = ids(x.warnings, "warnings", E, "warning_id");
  x.warnings.forEach((w, i) => warning(w, `warnings[${i}]`));
  ids(x.guidance, "guidance", E, "guidance_id");
  x.guidance.forEach((g, i) => guidance(g, `guidance[${i}]`));
  ctx.plans = ids(x.plans, "plans", P, "plan_id");
  x.plans.forEach((p, i) => plan(p, `plans[${i}]`, ctx));
  ctx.entryIds = new Set(ids(x.entries, "entries", E, "entry_id").keys());
  x.entries.forEach((e, i) => entry(e, `entries[${i}]`, ctx));
  if (!Array.isArray(x.tested)) fail(PL, "tested");
  const testedIds = new Set();
  x.tested.forEach((t, i) => {
    tested(t, `tested[${i}]`, ctx);
    if (testedIds.has(t.subject_id)) fail(PL, `tested[${i}].subject_id`);
    testedIds.add(t.subject_id);
  });
  ctx.testedIds = testedIds;
  if (!Array.isArray(x.library)) fail(PL, "library");
  const rowIds = new Set();
  x.library.forEach((r, i) => {
    libraryRow(r, `library[${i}]`, ctx);
    if (rowIds.has(r.row_id)) fail(PL, `library[${i}].row_id`);
    rowIds.add(r.row_id);
  });
  if (!Array.isArray(x.combined)) fail(PL, "combined");
  const pairs = new Set();
  x.combined.forEach((c, i) => {
    combined(c, `combined[${i}]`, ctx);
    const k = `${c.subject_id}\u0000${c.part}`;
    if (pairs.has(k)) fail(PL, `combined[${i}]`);
    pairs.add(k);
  });
  /* END DEC-49 REGION is-payload-valid */
}

/** R36: `{ok: true}` or `{ok: false, code: "CATALOGUE_PAYLOAD_INVALID", reason, path, check, word}`, `reason` the code of
 *  the rule the first offending path breaks (R1's `CATALOGUE_EVIDENCE_MISSING`, R4's `CATALOGUE_ENTRY_INVALID`, R16's
 *  `CATALOGUE_PLAN_INVALID`, or `CATALOGUE_PAYLOAD_INVALID`). Pure; never throws. `supported`, when given, is the list
 *  of schema versions the reader reads (R37). */
export function validatePayload(payload, { supported } = {}) {
  try {
    payloadOf(payload, supported);
    return Object.freeze({ ok: true });
  } catch (e) {
    if (!(e instanceof Bad)) return Object.freeze({ ok: false, code: PL, reason: PL, path: "payload", ...rowOf(PL) });
    return Object.freeze({ ok: false, code: PL, reason: e.reason, path: e.path, ...rowOf(e.reason) });
  }
}
const rowOf = (code) => ({ check: CATALOGUE_CHECKS[code].check, word: CATALOGUE_CHECKS[code].word });
