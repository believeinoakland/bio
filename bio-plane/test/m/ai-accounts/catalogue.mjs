/* The one place the tests meet ai-catalogue: its real service over the world's database, seeded from a payload built with its
   published fixture (`../ai-catalogue/fixture.mjs`: payload, plan, entry and the throwaway key that signs it; K4990, K4993).
   The providers are made up: `anthropic` (direct), `freeco` (direct) and `civicsmith` (built in), with the plans and entries
   below; every fact about them is payload data. A variation (an entry's verdict for a part, its answer to a check, its lifecycle, a
   plan's terms) is a newer signed payload received through the channel, as a team's copy receives one; the catalogue
   unreadable is a copy that holds none. */
import { aiCatalogueOf } from "../../../src/ai-catalogue/index.mjs";
import { KEY, payload, plan, entry, profile, provider, publish, pull, claim, OPEN, ev, met, gateOf, quoted, allChecks, PARTS } from "../ai-catalogue/fixture.mjs";

export const PLANS = Object.freeze({ provider: "anthropic", teamApi: "api-team", memberApi: "api-member",
  subscription: "sub-personal", teamSubscription: "sub-team", freeProvider: "freeco", freeApi: "api-free",
  builtinProvider: "civicsmith", builtin: "builtin-ai" });
export const ENTRIES = Object.freeze({ a: "claude-a", b: "claude-b", free: "free-m", builtin: "builtin-m" });
/* each entry's host is the recipient of what an act sends it (R51) */
export const HOSTS = Object.freeze({ main: "anthropic", free: "freeco", builtin: "civicsmith" });
const AT = "2026-10-02T00:00:00Z";

const text = (en) => ({ en });
export function baseDoc() {
  const apiPlan = (id, over = {}) => plan(id, { provider: "anthropic", ...over });
  const plans = [
    apiPlan(PLANS.teamApi, { scope: claim("team"), means_allowed: claim(["gateway", "sealed", "reference"]) }),
    apiPlan(PLANS.memberApi, { scope: claim("member"), means_allowed: claim(["sealed", "reference"]) }),
    apiPlan(PLANS.subscription, { kind: "subscription", scope: claim("member"), credential_kind: "signin_token", means_allowed: claim(["issued"]),
      connection_ways: ["provider_signin"], token_bounds: { min_length: 20, max_length: 200 } }),
    apiPlan(PLANS.teamSubscription, { kind: "subscription", scope: claim("team"), credential_kind: "signin_token", means_allowed: claim(["issued"]),
      connection_ways: ["provider_signin"] }),
    plan(PLANS.freeApi, { provider: "freeco", scope: OPEN, means_allowed: claim(["sealed"]), free_tier_trains: claim(true), warning_id: "w-free" }),
    plan(PLANS.builtin, { provider: "civicsmith", kind: "builtin", scope: claim("team"), credential_kind: "none", means_allowed: claim(["none"]),
      connection_ways: ["built_in"] }),
  ];
  const mk = (id, prov, host, planIds) => entry(id, { provider: prov, host, plan_ids: planIds, profile: { id: `p-${host}`, min_version: 1 }, served_ids: [`model-${id}`], model: `model-${id}` });
  return payload({
    providers: [provider("anthropic"), provider("freeco"), provider("civicsmith", "builtin")],
    profiles: ["anthropic", "freeco", "civicsmith"].map((h) => profile({ id: `p-${h}`, allowed_hosts: [`api.${h}.example`] })),
    plans,
    warnings: [{ warning_id: "w-free", text: text("This free plan may train on what is sent."), ev: ev() }],
    entries: [
      mk(ENTRIES.a, "anthropic", "anthropic", [PLANS.teamApi, PLANS.memberApi, PLANS.subscription, PLANS.teamSubscription]),
      mk(ENTRIES.b, "anthropic", "anthropic", [PLANS.teamApi, PLANS.memberApi, PLANS.subscription]),
      mk(ENTRIES.free, "freeco", "freeco", [PLANS.freeApi]),
      mk(ENTRIES.builtin, "civicsmith", "civicsmith", [PLANS.builtin]),
    ],
  });
}

const REGISTER = [{ type: "generic_chat", profiles: { "p-anthropic": 1, "p-freeco": 1, "p-civicsmith": 1 } }];

/* The real catalogue over `ctx`, seeded with `doc` (async: the payload is signed). `ready` resolves when it holds it. */
export function catalogueFor(ctx, { record, doc = baseDoc() } = {}) {
  const cat = aiCatalogueOf(ctx, { record, keys: [KEY.line] });
  cat.registerAdapterTypes?.(REGISTER);
  cat.doc = doc;
  cat.seeded = (async () => {
    await cat.ready;
    cat.registerAdapterTypes(REGISTER);
    const pub = await publish(doc);
    const r = await cat.loadSeed({ ...pub, at: "2026-10-01T00:00:00Z" });
    if (!r.ok) throw new Error(`catalogue seed refused: ${JSON.stringify(r)}`);
  })();
  return cat;
}

/* A copy that holds no payload: every read answers as `unavailable` (R63). */
export async function emptyCatalogue() {
  const { DatabaseSync } = await import("node:sqlite");
  const { recordOf, RECORD_SCHEMA } = await import("../../../src/record-core/index.mjs");
  const db = new DatabaseSync(":memory:");
  const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);
  const sql = { exec(q, ...args) { const st = db.prepare(q); return st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []); } };
  const storage = { sql, transactionSync(fn) { db.exec("SAVEPOINT t"); try { const r = fn(); db.exec("RELEASE t"); return r; } catch (e) { db.exec("ROLLBACK TO t"); db.exec("RELEASE t"); throw e; } } };
  for (const st of RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n").split(";")) { const t = st.trim(); if (t) db.exec(t); }
  const ctx = { storage };
  const record = recordOf(ctx);
  if (typeof record.migrate === "function") record.migrate();
  const cat = aiCatalogueOf(ctx, { record, keys: [KEY.line] });
  await cat.ready;
  cat.registerAdapterTypes(REGISTER);
  return cat;
}

/* A newer signed payload from `change(doc)`, received by the world's catalogue as a pull. */
async function vary(w, change) {
  await w.catalogue.seeded;
  const doc = structuredClone(w.catalogue.doc);
  change(doc);
  doc.seq = (w.catalogue.doc.seq ?? 1) + 1;
  const pub = await publish(doc);
  const r = await pull(w.catalogue, pub, { at: AT });
  if (!r.payload?.ok) throw new Error(`variation refused: ${JSON.stringify(r)}`);
  w.catalogue.doc = doc;
}
const entryOf = (doc, id) => doc.entries.find((e) => e.entry_id === id);
const planOf = (doc, id) => doc.plans.find((p) => p.plan_id === id);

/* an entry's verdict for a part: passes, not_suitable or not_yet_rated */
export const setGate = (w, id, part, verdict) => vary(w, (d) => { entryOf(d, id).gate[part] = gateOf(verdict); });
/* an entry's answer to a check: true (met), false (not met) or null (open) */
export const setCheck = (w, id, check, answer) => vary(w, (d) => {
  entryOf(d, id).checks[check] = answer === true ? met("met") : answer === false ? { answer: "not_met", ev: quoted() } : { answer: "OPEN" };
});
export const setLifecycle = (w, id, state) => vary(w, (d) => { entryOf(d, id).lifecycle = state; if (state === "lapsed" || state === "retired") entryOf(d, id).shutdown_date = "2026-10-01"; });
/* a binding term on a plan, changing its terms version, effective from `from` (a date) */
export const addTerm = (w, id, { doc = "usage-policy", version = "v9", from = "2026-10-01" } = {}) => vary(w, (d) => {
  planOf(d, id).binding_terms.push({ doc, version, section: "1", quote: "a fixture term", effective_from: from, kind: "other", ev: ev("STATED") });
});
