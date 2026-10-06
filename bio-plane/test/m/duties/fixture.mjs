/* duties over the real modules it uses (K1563 (1), K1580): record-core, membership, promotion, provenance, content,
   entities, events, lines, money and standards on one host, a real SQLite database (node:sqlite) at the plane's shape
   (`sql.exec` answers a cursor). The host is built by standards' own test world (`../standards/fixture.mjs`), which
   composes promotion, content (with extraction's reading stubbed as standards' tests stub it), provenance and events;
   entities, lines and money are added on the same storage, each its real module. connection-grammar's registry is a
   fresh one per world. The jurisdiction view duties reads is a fictional one (no real place, R23), as
   `jurisdictions.combine` would answer it, carrying the rule set and response vocabulary T33 adds (N561 is the profile
   key's own entry); the other modules read the held test profile. Every test drives `duties` at its interface. */
import { seeded as standardsWorld, profile, src } from "../standards/fixture.mjs";
import { Entities } from "../../../src/entities/index.mjs";
import { Lines } from "../../../src/lines/index.mjs";
import { Money } from "../../../src/money/index.mjs";
import { createRegistry } from "../../../src/connection-grammar/index.mjs";
import { sha256HexSync } from "../../../src/record-grammar/index.mjs";
import { combine } from "../../../../jurisdictions/index.mjs";
import { dutiesOf, dutiesOps } from "../../../src/duties/index.mjs";

export const V = (id) => `member:${id}`;
export const BOB = V("bob"), CAROL = V("carol");
export const MACHINE = "class:ai";
export const NOW = "2026-03-02T12:00:00.000Z";
export const ZONE = "America/Halifax";
export const ent = (n) => `ENT-2026-${String(n).padStart(4, "0")}`;
export const evt = (s) => `EVT-2026-${String(s).padEnd(16, "0").slice(0, 16)}`;
export const mny = (s) => `MNY-2026-${String(s).padEnd(16, "0").slice(0, 16)}`;
export const SHA = (s) => sha256HexSync(String(s));

/** The entities every world registers, in this order, through the real `entities`; their ids are filled in by the
 *  first world (each fresh store allocates them alike). */
const REGISTER = [
  ["clerk", "office", "Town Clerk"],
  ["council", "body", "Town Council", { sector: "government" }],
  ["contractor", "institution", "Harbour Waste Co.", { sector: "company" }],
  ["private", "institution", "Private Co.", { sector: "company" }],
  ["filer", "person", "A Filer"],
  ["parcel", "parcel", "Lot 9"],
  ["case", "proceeding", "Superior Court case", { proceeding: { forum: "@council", kind: "commitment_suit", number: "MC-26-1001" } }],
  ["group", "movement", "The Group", { sector: "association" }],
  ["auditor", "office", "Town Auditor"],
  ["fund", "fund", "General Fund"],
  ["undet", "institution", "Unsorted Inc."],
];
export const E = {};

/** A written test profile beside the held test profile: a code cited "Test Code § n" with its instrument key segments,
 *  under the held test profile's instrument_key segment, so standards composes one instrument key per section and its versions share it (standards R18). */
const LAW_PROFILE = { ...profile("test-duties-law", [src("test-code", "^Test Code § \\d+", { key: "tc" })]) };

/** A fictional jurisdiction view (the shape `jurisdictions.combine` answers; T33-2's fields). */
export function fictionalView(extra = {}) {
  const closures = (year, days) => ({ year, list: "court_days", days, status: "researched", basis: "TEST", citation: "Test Code §135" });
  return {
    id: "test-fiction", name: "Fiction", covers: ["Fictional Town"], test: true, profiles: ["test-fiction"],
    time_zone: { value: ZONE, status: "researched", basis: "TEST" },
    weekend: { days: ["sat", "sun"], citation: "Test Code §12a", status: "researched", basis: "TEST" },
    holidays: [closures(2026, [{ date: "2026-01-01", name: "New Year" }, { date: "2026-03-16", name: "Founders' Day" }]),
               closures(2027, [{ date: "2027-01-01", name: "New Year" }])],
    deadlines: [
      { rule: "records_response", applies_to: "records_request", units: "days", amount: 10, count: "calendar", starts: "received",
        roll: true, closures: "court_days", citation: "Test Code §7922", status: "researched", basis: "TEST" },
      { rule: "monthly_report", applies_to: "claim", units: "months", amount: 1, starts: "act", citation: "Test Code §9",
        status: "researched", basis: "TEST" },
    ],
    response_statuses: [
      { status: "implemented", label: "has been implemented", citation: "Test Penal Code §933", basis: "TEST" },
      { status: "will_implement", label: "will be implemented", citation: "Test Penal Code §933", basis: "TEST" },
      { status: "will_not_implement", label: "will not be implemented", citation: "Test Penal Code §933", basis: "TEST" },
    ],
    ...extra,
  };
}

export function world({ now = NOW, view = fictionalView(), deps = {} } = {}) {
  /* every module reads the held test profile; standards alone also reads the written code profile, beside it */
  const sw = standardsWorld({ now, combine: (ids) => combine([...ids, LAW_PROFILE]) });
  const { st, host, record, membership, content, prov, events: ev, s: standards, clock } = sw;
  const entities = new Entities(st, { record, membership, provenance: prov });
  entities.migrate();
  for (const [key, kind, label, extra = {}] of REGISTER) {
    const x = JSON.parse(JSON.stringify(extra).replace(/"@([a-z]+)"/g, (_, k) => JSON.stringify(E[k])));
    const r = entities.createEntity({ kind, label, note: "registered by the duties tests", declaredBy: BOB, ...x });
    if (!r.ok) throw new Error(`fixture entity refused: ${JSON.stringify(r).slice(0, 300)}`);
    if (E[key] && E[key] !== r.entity_id) throw new Error(`fixture: ${key} allocated ${r.entity_id}, expected ${E[key]}`);
    E[key] = r.entity_id;
  }
  const registry = createRegistry();
  const lines = new Lines(st, { record, provenance: prov, content, entities, events: ev, registry: createRegistry(), now: () => clock.now });
  lines.migrate();
  const money = new Money(st, { record, membership, entities, provenance: prov, events: ev, lines, now: () => clock.now.replace(/\.\d{3}Z$/, "Z") });
  money.migrate();
  let viewNow = view;
  const duties = dutiesOf(host, {
    record, membership, registry, entities, standards, events: ev, lines, money, provenance: prov, content,
    view: () => viewNow, now: () => clock.now, clockMs: () => 0, ...deps,
  });
  const fail = (what, r) => { throw new Error(`fixture ${what} refused: ${JSON.stringify(r).slice(0, 400)}`); };
  let n = 0;

  const w = {
    ...sw, sw, duties, registry, entities, lines, money, ev, standards,
    sqlRows: (q, ...a) => st.rows(q, ...a),
    at(iso) { clock.now = iso; return w; },
    setView(v) { viewNow = v; return w; },
    /** A standard declared by bob over a fresh passage: `portion` a section path held with its passage, `period`
     *  `{from, to}` (to null: no end stated), `kind` and `cite` as declared. Its id. */
    standard({ portion = "s7922", period = { from: "2000-01-01", to: "2099-12-31" }, kind = "statute", cite = "Test Code § 7922" } = {}) {
      const p = sw.passage();
      const r = sw.declare({ cite, kind, text: [p.contentId], period, ...(portion ? { portion: { path: portion, content_id: p.contentId } } : {}) });
      if (!r.ok) fail("standard", r);
      return r.id;
    },
    /** A real event (events R6), attested by bob's testimony, dated `value` (a day or a date-time) or undated. */
    event({ kind = "communication", value = null, concerns = [] } = {}) {
      const r = ev.createEvent({ kind, concerns, attestations: [{ testimony: `I saw the ${kind}.`, ...(value !== null ? { value } : {}) }], by: BOB });
      if (!r.ok) fail("event", r);
      return r.event_id;
    },
    /** A real line (lines R1), on bob's testimony; withdrawn when asked. */
    line({ kind, from, to, withdrawn = false }) {
      const r = lines.recordLine({ kind, from, to, basis: { statement: `the ${kind} the test states` }, by: BOB });
      if (!r.ok) fail("line", r);
      if (withdrawn) { const x = lines.withdrawLine({ lineId: r.line_id, reason: "the test withdraws it", by: BOB }); if (!x.ok) fail("withdrawal", x); }
      return r.line_id;
    },
    /** A real money fact (money R1) read from a fresh passage: `amount` an exact decimal, `precision`, `kind`, the
     *  parties (`from`/`to` `{entity?, fund?}`), `concerns`. Its id. */
    fact({ amount = "100.00", precision = "exact", kind = "payment", from = { fund: E.fund }, to = null, concerns = [], low, high } = {}) {
      const p = sw.passage();
      const r = money.recordFact({ amount: precision === "range" ? { low, high } : amount,
        as_read: `$${amount}`, currency: "USD", sign: "+", precision, kind, phase: "actual", stage: kind === "payment" ? "paid" : "incurred", basis: "cash",
        period: { from: "2026-01-01", to: "2026-12-31", precision: "day", zone: ZONE }, from, ...(to ? { to } : {}), concerns,
        source: { capture_sha: p.capSha, extent: { kind: "pdf-page", page: 0 } }, by: BOB });
      if (!r.ok) fail("money fact", r);
      return r.fact_id;
    },
    /** A captured document's passage (content id, bundle and capture), through promotion and content. */
    passage: (...a) => sw.passage(...a),
    /** A project owned by `owner` (a member id), through promotion: its contents are fenced from others. */
    project: (owner) => sw.project(`Project ${++n}`, owner),
    ops(query = "", body = null) { return dutiesOps(duties, new URL(`http://x/?${query}`), body); },
    /** A valid duty's fields over the real modules, with `over` laid on top. */
    fields(over = {}) {
      if (!w.recordsLaw) w.recordsLaw = w.standard();
      return {
        modality: "duty", obligor: E.clerk, obligee: E.group,
        performance: { act: "respond to the records request" },
        source: { kind: "standard", standard: w.recordsLaw, portion: "s7922" },
        trigger: { kind: "date", date: "2026-02-02" },
        time: { basis: "rule", rule: "records_response", applies_to: "records_request" },
        ...over,
      };
    },
    declare(over = {}, by = BOB) { return duties.declare({ ...w.fields(over), clause: "s7922(a): respond within 10 days", by }); },
  };
  return w;
}
