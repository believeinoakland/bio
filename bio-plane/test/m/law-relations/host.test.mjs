/* law-relations: the host contract (R13), the tables and their declaration (R15, R16), and the invariants R17 and R18.
   Driven over the test's host, with no `standards` table held. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, seeded, V, MACHINE, REASON, codeOf } from "./fixture.mjs";
import { LawRecords, HOST_READS, LAW_TABLES, LAW_RELATIONS_CHECKS, LAW_CODES, MODULE } from "../../../src/law-relations/index.mjs";

const NAMES = ["law_relations", "court_links", "court_treatments", "law_withdrawals", "law_proposals"];

test("R13 new LawRecords(host) constructs the module over its host's reads; construction with any read missing throws a TypeError naming every read missing and writes nothing; what the module knows of a standard is what the host answers, and it never reads or writes a standards table", async () => {
  assert.deepEqual([...HOST_READS].sort(), ["citationLookup", "content", "eventDay", "eventWhen", "gradeOf", "idsAtKey", "idsCovering",
    "idsOfKind", "inForceAt", "membership", "nonce", "noSuchStandard", "one", "periodOf", "portionUnknown", "readable", "recognise",
    "record", "refuseDateInvalid", "refuseFieldUnknown", "refuseNoId", "refuseNoSuchProposal", "refuseProposalAdopted",
    "refuseProposerUnnamed", "refuseReason", "refuseWhyInvalid", "row", "rows", "sql", "texts", "when", "zone"].sort());
  const w = world({ construct: false });
  const before = w.snapshot();
  for (const host of [undefined, null, 7, "host", []])
    assert.throws(() => new LawRecords(host), (e) => e instanceof TypeError && HOST_READS.every((k) => e.message.includes(k)), String(host));
  for (const k of HOST_READS) {
    const host = { ...w.reads };
    delete host[k];
    assert.throws(() => new LawRecords(host), (e) => e instanceof TypeError && new RegExp(`\\b${k}\\b`).test(e.message), k);
  }
  const host = { ...w.reads, row: undefined, texts: null, idsCovering: undefined };
  assert.throws(() => new LawRecords(host), (e) => e instanceof TypeError && /row, texts, .*idsCovering/.test(e.message), "every one named");
  assert.deepEqual(w.snapshot(), before, "a refused construction writes nothing");
  assert.deepEqual(w.record.declaredTables().filter((d) => d.module === MODULE), [], "and declares nothing");
  /* over a complete host, with no standards table held, every service answers */
  const s = seeded();
  assert.equal(s.tables().has("standards"), false);
  const a = s.standard({ key: "/eli/x/1", portion: "1" }), b = s.standard(), court = s.standard({ kind: "court" }), later = s.standard({ kind: "court" });
  const ev = s.event({ day: "2022-01-01" });
  const r = s.law.lawRelate({ type: "renumbers", from: a.id, to: b.id, citation: a.t, effective: "2020-01-01", reason: REASON, author: V("bob"), viewer: V("bob") });
  assert.equal(r.ok, true);
  assert.equal(s.law.courtLink({ type: "applies", from: court.id, to: a.id, citation: court.t, reason: REASON, author: V("bob") }).ok, true);
  assert.equal(s.law.courtTreat({ decision: court.id, treatment: "affirmed", by_decision: later.id, citation: later.t, reason: REASON, author: V("bob") }).ok, true);
  assert.equal(s.law.lawPropose({ what: "relation", why: "w", proposer: MACHINE }).ok, true);
  assert.equal(s.law.lawRelationsOf({ standard: a.id, viewer: V("bob") }).ok, true);
  assert.equal(s.law.addressesOf({ key: "/eli/x/1", viewer: V("bob") }).addresses.length, 1);
  assert.equal(s.law.stillStanding({ decision: court.id, date: "2025-01-01", viewer: V("bob") }).ok, true);
  assert.equal((await s.law.resolveCourtCitation({ citation: "5 Cal. 4th 100", viewer: V("bob") })).ok, true);
  assert.ok(s.law.neighbours({ node: ev, at: "2022-01-01T12:00:00Z", viewer: V("bob") }).items.length > 0);
  assert.equal(s.law.boundsOn(b.id).length, 1);
  assert.equal(s.law.lawWithdraw({ relation: r.relation.id, reason: "x", author: V("bob") }).ok, true);
  assert.equal(s.tables().has("standards"), false, "no standards table was read or written");
  /* the host's answers are what the module answers: a standard the host stops answering is gone here too */
  s.standards.delete(b.id);
  assert.equal(codeOf(s.law.lawRelationsOf({ standard: b.id, viewer: V("bob") })), "NO_SUCH_STANDARD");
  /* the host's refusals are answered exactly as the host gives them */
  const mine = { ok: false, reason: "NO_SUCH_STANDARD", code: "NO_SUCH_STANDARD", mark: Symbol("host") };
  s.reads.noSuchStandard = () => mine;
  assert.equal(s.law.lawRelationsOf({ standard: b.id, viewer: V("bob") }), mine);
});

test("R15 R16 the five tables are declared explicitly through record-core.declareTable under law-relations: version_chain true, sight group, the other classes as declarePurge's default form gives them, keyed for a single-bundle purge by the standard ids each row names; constructing the module creates them all where absent, so its services and record-core's purge succeed with no caller migrating; names and columns as before the split; append-only", () => {
  const w = world({ construct: false });
  w.member("bob");
  for (const name of NAMES) assert.ok(!w.tables().has(name), name);
  const law = w.build();
  for (const name of NAMES) assert.ok(w.tables().has(name), name);
  assert.deepEqual(LAW_TABLES.map((t) => t.name), NAMES);
  const declared = w.record.declaredTables().filter((d) => d.module === "law-relations");
  assert.deepEqual(declared.map((d) => d.name), NAMES);
  for (const d of declared)
    assert.deepEqual({ purge: d.purge, expunge: d.expunge, export: d.export, sight: d.sight, derive: d.derive, version_chain: d.version_chain }, { purge: "clear", expunge: "none", export: "admin-only", sight: "group", derive: "stored", version_chain: true }, d.name);
  assert.deepEqual(Object.fromEntries(declared.map((d) => [d.name, d.keys ? [...d.keys] : null])),
                   { law_relations: ["from_standard", "to_standard"], court_links: ["from_standard", "to_standard"],
                     court_treatments: ["decision", "by_decision"], law_withdrawals: [], law_proposals: [] });
  /* the columns, as before the split, and R9's edition */
  const cols = (t) => w.rows(`PRAGMA table_info(${t})`).map((c) => c.name);
  assert.deepEqual(cols("law_relations"), ["relation_id", "type", "class", "from_standard", "from_portion", "to_standard", "to_portion", "citation",
                                           "effective_date", "effective_event", "effective_edge", "proposal_id", "reason", "author", "at", "edition"]);
  assert.deepEqual(cols("court_links"), ["link_id", "type", "from_standard", "to_standard", "to_portion", "citation", "proposal_id", "reason", "author", "at"]);
  assert.deepEqual(cols("court_treatments"), ["treatment_id", "decision", "treatment", "by_decision", "citation", "proposal_id", "reason", "author", "at"]);
  assert.deepEqual(cols("law_withdrawals"), ["item_id", "reason", "withdrawn_by", "withdrawn_at"]);
  assert.deepEqual(cols("law_proposals"), ["proposal_id", "what", "fields_json", "why", "proposed_by", "proposed_at"]);
  /* a second construction over the same record is a defect of the wiring */
  assert.throws(() => w.build(), /refused its tables: TABLE_DECLARED/);
  /* append-only: a relation, its withdrawal and a treatment leave every earlier row as it was */
  const a = w.standard(), b = w.standard(), c = w.standard({ kind: "court" }), d = w.standard({ kind: "court" });
  const snap = () => Object.fromEntries(NAMES.map((t) => [t, w.rows(`SELECT * FROM ${t}`)]));
  const r = law.lawRelate({ type: "amends", from: b.id, to: a.id, citation: b.t, effective: "2020-01-01", reason: REASON, author: V("bob") });
  const one = snap();
  law.lawWithdraw({ relation: r.relation.id, reason: "wrong", author: V("bob") });
  law.courtTreat({ decision: c.id, treatment: "affirmed", by_decision: d.id, citation: d.t, reason: REASON, author: V("bob") });
  law.lawPropose({ what: "relation", why: "w", proposer: MACHINE });
  const two = snap();
  assert.deepEqual(two.law_relations, one.law_relations, "the relation row is untouched by its withdrawal");
  assert.deepEqual([two.law_withdrawals.length, two.court_treatments.length, two.law_proposals.length], [1, 1, 1]);
  /* purge: a single-bundle purge clears the rows keyed to that standard; the whole-store form every row */
  law.courtLink({ type: "applies", from: c.id, to: a.id, citation: c.t, reason: REASON, author: V("bob") });
  const p = w.record.purge({ bundleId: a.id });
  assert.deepEqual([p.removed.law_relations, p.removed.court_links, p.removed.court_treatments], [1, 1, 0]);
  const all = w.record.purge({});
  for (const name of NAMES) assert.ok(name in all.removed, name);
  for (const name of NAMES) assert.equal(w.count(name), 0, name);
});

test("R16 a store created before the split, its five tables already held, is read with no migration by any caller: construction adds what is absent (R9's edition, never filled for an earlier row) and keeps every row", () => {
  const w = world({ construct: false });
  w.member("bob");
  w.st.db.exec(`CREATE TABLE law_relations (relation_id TEXT PRIMARY KEY, type TEXT NOT NULL, class TEXT NOT NULL, from_standard TEXT NOT NULL,
    from_portion TEXT, to_standard TEXT NOT NULL, to_portion TEXT, citation TEXT NOT NULL, effective_date TEXT, effective_event TEXT,
    effective_edge TEXT, proposal_id TEXT, reason TEXT NOT NULL, author TEXT NOT NULL, at TEXT NOT NULL)`);
  const a = w.standard(), b = w.standard();
  w.st.sql.exec(`INSERT INTO law_relations VALUES ('lrel-000000000000000000000001','refers_to','referential',?,NULL,?,NULL,?,NULL,NULL,NULL,NULL,'r','member:bob','2026-01-01T00:00:00Z')`,
                a.id, b.id, a.t);
  const law = w.build();
  const read = law.lawRelationsOf({ standard: b.id, viewer: V("bob") });
  assert.deepEqual(read.referential.map((r) => [r.id, r.type, r.direction]), [["lrel-000000000000000000000001", "refers_to", "in"]]);
  assert.equal(w.rows(`SELECT edition FROM law_relations`)[0].edition, null);
  assert.equal(law.lawRelate({ type: "incorporates", from: a.id, to: b.id, citation: a.t, edition: "2020", reason: REASON, author: V("bob") }).relation.edition, "2020");
});

test("R17 a fact the record does not supply is answered undetermined, never a default; no place is named in the module's behaviour or outward text (its rows, refusals and answers), and its tests run against no place's profile", async () => {
  const w = seeded();
  const lower = w.standard({ kind: "court", from: null, to: null }), later = w.standard({ kind: "court", from: null, to: null });
  const s = w.law.stillStanding({ decision: lower.id, date: "2020-01-01", viewer: V("bob") });
  assert.equal(s.state, "undetermined", "no later history: never standing by default");
  w.law.courtTreat({ decision: lower.id, treatment: "reversed", by_decision: later.id, citation: later.t, reason: REASON, author: V("bob") });
  assert.equal(w.law.stillStanding({ decision: lower.id, date: "2020-01-01", viewer: V("bob") }).state, "undetermined", "no date stated: never ended by default");
  const open = w.standard({ from: null, to: null }), x = w.standard();
  const rid = w.law.lawRelate({ type: "refers_to", from: open.id, to: x.id, citation: open.t, reason: REASON, author: V("bob") }).relation.id;
  const item = w.law.neighbours({ node: x.id, at: "2020-01-01T00:00:00Z", viewer: V("bob") }).items.find((i) => i.id === rid);
  assert.ok(item.undetermined && item.undetermined.why, "a period the record does not state: undetermined, marked");
  assert.match((await w.law.resolveCourtCitation({ citation: "1 U.S. 1", viewer: V("bob") })).why, /not decided here/, "unverified is never 'no such case'");
  /* outward text: every row, and every answer and refusal the services give here */
  const places = /oakland|alameda|california|port ellery|marlow|san francisco/i;
  for (const [code, row] of Object.entries(LAW_RELATIONS_CHECKS)) assert.doesNotMatch(row.translation, places, code);
  const texts = [];
  const walk = (v) => { if (typeof v === "string") texts.push(v); else if (v && typeof v === "object") Object.values(v).forEach(walk); };
  walk([s, item, w.law.lawRelationsOf({ standard: x.id, viewer: V("bob") }), w.law.addressesOf({ key: "/eli/none" }),
        w.law.lawRelate({ type: "nope", from: x.id, to: open.id, author: V("bob") }), w.law.lawWithdraw({ relation: "x", reason: "r", author: V("bob") }),
        w.law.courtTreat({ treatment: "x", author: V("bob") }), w.law.lawPropose({ what: "relation", why: "w", proposer: MACHINE })]);
  for (const t of texts) assert.doesNotMatch(t, places, t);
});

test("R18 no service accepts or answers a judgment of a law's merit or desirability: every act refuses a field outside its own (the host's STANDARD_FIELD_UNKNOWN), and no answer carries one; a relation, link or treatment is a reading of the cited text", () => {
  const w = seeded();
  const a = w.standard(), b = w.standard(), court = w.standard({ kind: "court" }), later = w.standard({ kind: "court" });
  const merit = { merit: "good", desirable: true, position: "should be repealed" };
  const acts = [
    (m) => w.law.lawRelate({ type: "refers_to", from: a.id, to: b.id, citation: a.t, reason: REASON, author: V("bob"), ...m }),
    (m) => w.law.courtLink({ type: "applies", from: court.id, to: a.id, citation: court.t, reason: REASON, author: V("bob"), ...m }),
    (m) => w.law.courtTreat({ decision: court.id, treatment: "affirmed", by_decision: later.id, citation: later.t, reason: REASON, author: V("bob"), ...m }),
    (m) => w.law.lawPropose({ what: "relation", why: "w", proposer: MACHINE, ...m }),
  ];
  const before = w.snapshot();
  for (const act of acts) for (const [k, v] of Object.entries(merit)) {
    const r = act({ [k]: v });
    assert.deepEqual([codeOf(r), r.rejected], ["STANDARD_FIELD_UNKNOWN", [k]], k);
  }
  assert.deepEqual(w.snapshot(), before, "nothing written");
  const answers = acts.map((act) => act({}));
  const keys = new Set();
  const walk = (v) => { if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) { keys.add(k); walk(x); } };
  walk([...answers, w.law.lawRelationsOf({ standard: a.id, viewer: V("bob") }), w.law.stillStanding({ decision: court.id, date: "2030-01-01", viewer: V("bob") })]);
  for (const k of ["merit", "desirable", "desirability", "position", "score", "rating", "good", "bad"]) assert.ok(!keys.has(k), k);
  assert.deepEqual(LAW_CODES, Object.keys(LAW_RELATIONS_CHECKS));
  for (const [code, row] of Object.entries(LAW_RELATIONS_CHECKS)) assert.doesNotMatch(row.translation, /\b(good|bad|desirable|merit|should be)\b/i, code);
});
