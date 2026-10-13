/* case-inputs: the purge declaration (R11, was case-authoring R28 and R71's purge clause), no place named (R15, a copy of
   case-authoring R30), and the one instance per host with its tables and its ops map (R16). Copied in part from
   case-authoring's invariants.test.mjs. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, storage, V, WORDS, STATEMENT } from "./fixture.mjs";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { caseInputsOf, caseInputsOps, CASE_INPUTS_TABLES, CASE_INPUTS_SCHEMA, STATEMENT_ACK_CHECKS, CARRIED_OUTCOME_CHECKS,
         CASE_INPUTS_WORDS, OPEN_REQUESTS_UNREAD_SENTENCE, openRequestLine, withheldWriterStated, ackBodyLines,
         statementSha } from "../../../src/case-inputs/index.mjs";
import { list as listProfiles } from "../../../../jurisdictions/index.mjs";

const TABLES = ["statement_acknowledgements", "what_changed_drafts", "carried_outcomes", "carried_outcome_withdrawals"];
const OUTCOME = { kind: "success", text: "The council published the amended minutes.", cites: [], on: "2026-09-20" };

/* A bare host: record-core's schema and membership, nothing of this module's. */
function bareHost() {
  const host = { storage: storage() };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) host.storage.db.exec(t);
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  return { host, record, membership };
}
const tablesOf = (host) => host.storage.sql.exec(`SELECT name FROM sqlite_master WHERE type='table'`).map((r) => r.name);

function setup() {
  const w = world();
  for (const m of ["alice", "bo", "cy"]) w.member(m);
  const P = w.project("Team", "alice");
  w.join(P, "bo"); w.join(P, "cy");
  return { w, P };
}

test("R11: the four tables are declared whole to record-core's purge as working material, under case-inputs: a whole-store purge clears them, a bundle's purge does not", () => {
  assert.deepEqual(CASE_INPUTS_TABLES, TABLES.map((name) => ({ name, keys: [] })));
  assert.ok(Object.isFrozen(CASE_INPUTS_TABLES));
  const { w, P } = setup();
  const declared = w.record.declaredTables().filter((d) => TABLES.includes(d.name));
  assert.deepEqual(declared.map((d) => [d.module, d.name, d.keys, d.purge]), TABLES.map((t) => ["case-inputs", t, [], "clear"]));
  /* a row in each */
  const pub = w.prepare(P, "alice");
  assert.equal(w.ci.acknowledgeStatement({ viewer: V("bo"), caseId: pub.caseId, edition: 1, reason: WORDS }).ok, true);
  w.ratify(pub, P);
  assert.equal(w.ci.proposeWhatChanged({ case: pub.caseId, text: "t", proposedBy: "bo", viewer: V("bo") }).ok, true);
  const o = w.ci.carryOutcome({ case: pub.caseId, ...OUTCOME, by: "alice" }).outcome;
  assert.equal(w.ci.withdrawCarriedOutcome({ outcome: o, reason: "wrong", by: "alice" }).ok, true);
  assert.deepEqual(TABLES.map((t) => w.count(t)), [1, 1, 1, 1]);
  const one = w.record.purge({ bundleId: P });
  assert.deepEqual(TABLES.map((t) => w.count(t)), [1, 1, 1, 1], "keyed to no bundle");
  assert.deepEqual(TABLES.map((t) => one.removed[t]), [0, 0, 0, 0], "named in the report, nothing removed by a bundle's purge");
  const all = w.record.purge({});
  assert.deepEqual(TABLES.map((t) => all.removed[t]), [1, 1, 1, 1]);
  assert.deepEqual(TABLES.map((t) => w.count(t)), [0, 0, 0, 0]);
});

test("R11, R16 (K2675's form): a declaration record-core refuses is thrown at creation and no instance is kept — another owner already holding statement_acknowledgements (TABLE_DECLARED) leaves none of this module's tables declared, so caseInputsOf throws naming the refusal and the next call throws again; negative control: a host where no other owner holds them creates the instance and declares them", () => {
  const { host, record, membership } = bareHost();
  assert.equal(record.declarePurge("another-owner", [{ name: "statement_acknowledgements", keys: [] }]).ok !== false, true);
  for (let i = 0; i < 2; i++)
    assert.throws(() => caseInputsOf(host, { record, membership }),
                  /^Error: case-inputs: record-core refused its table declaration: TABLE_DECLARED \(statement_acknowledgements\)$/);
  assert.equal(record.declaredTables().some((d) => d.module === "case-inputs"), false, "none declared");
  /* negative control */
  const ok = bareHost();
  const c = caseInputsOf(ok.host, { record: ok.record, membership: ok.membership });
  assert.ok(c);
  assert.deepEqual(ok.record.declaredTables().filter((d) => d.module === "case-inputs").map((d) => d.name), TABLES);
});

test("R16: caseInputsOf answers the one instance for a host — every caller for the same host gets the same instance, later deps ignored — and creates its four tables at creation, declared once; another host gets its own", () => {
  const { host, record, membership } = bareHost();
  assert.equal(TABLES.some((t) => tablesOf(host).includes(t)), false, "none before");
  const c = caseInputsOf(host, { record, membership });
  for (const t of TABLES) assert.ok(tablesOf(host).includes(t), t);
  assert.equal(caseInputsOf(host), c, "the same instance");
  assert.equal(caseInputsOf(host, { record: null, membership: null }), c, "later deps are not a second creation");
  assert.equal(record.declaredTables().filter((d) => d.module === "case-inputs").length, 4, "declared once");
  const other = bareHost();
  assert.notEqual(caseInputsOf(other.host, { record: other.record, membership: other.membership }), c);
  /* with no deps at all, record-core and membership are reached on the host */
  const bareDeps = bareHost();
  assert.ok(caseInputsOf(bareDeps.host).record);
});

test("R16: deps (publication, publishSchedule, account) are each reached lazily on the host unless given: a host holding only record-core and membership creates the instance without them, and its first act that needs one reaches it on the host", () => {
  const { host, record, membership } = bareHost();
  const c = caseInputsOf(host, { record, membership });
  assert.equal(tablesOf(host).includes("case_documents"), false, "publication not reached at creation");
  /* the case door asks publication's review provider and its table: reached on the host, with no provider registered */
  const r = c.acknowledgeStatement({ viewer: V("bo"), caseId: "CASE-2026-0001", edition: 1, reason: WORDS });
  assert.equal(r.reason, "NO_REVIEW_COPY", "publication reached on the host: no provider, the bare dead answer");
  assert.ok(tablesOf(host).includes("case_documents"), "publication created on the host by the first act needing it");
  assert.equal(c.openRequestsOn({ case: "CASE-2026-0001" }).ok, true, "R8 reaches no other module");
  /* given deps are used, not created */
  const { w } = setup();
  assert.equal(w.ci.publication, w.publication);
  assert.equal(w.ci.publishSchedule, w.publishSchedule);
  assert.equal(w.ci.account, w.account);
});

test("R16: the tables are created with the DDL case-authoring created them by, CREATE TABLE IF NOT EXISTS, the reason column added where absent: a running store's rows are kept with no data move", () => {
  const { host, record, membership } = bareHost();
  /* a store as case-authoring left it before T22's reason column, with a row in each table */
  host.storage.db.exec(`CREATE TABLE statement_acknowledgements (ack_id INTEGER PRIMARY KEY AUTOINCREMENT, project_id TEXT NOT NULL,
    case_id TEXT, edition INTEGER NOT NULL, statement_sha TEXT NOT NULL, draft_id TEXT, acknowledger_kind TEXT NOT NULL,
    acknowledger TEXT NOT NULL, recipient TEXT, at TEXT NOT NULL)`);
  host.storage.sql.exec(`INSERT INTO statement_acknowledgements (project_id, case_id, edition, statement_sha, acknowledger_kind,
    acknowledger, at) VALUES ('P', 'CASE-2026-0001', 1, ?, 'participant', 'cy', 't')`, statementSha(STATEMENT));
  const ddl = CASE_INPUTS_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of ddl.split(";").map((x) => x.trim()).filter((x) => x && !x.includes("statement_acknowledgements"))) host.storage.db.exec(s);
  host.storage.sql.exec(`INSERT INTO what_changed_drafts (draft_id, case_id, text, proposed_by, label, at) VALUES ('WCD-2026-0001', 'C', 't', 'bo', '{}', 't')`);
  host.storage.sql.exec(`INSERT INTO carried_outcomes (outcome_id, case_id, kind, text, cites, on_date, carried_by, at) VALUES ('OUTC-2026-0001', 'C', 'cure', 't', '[]', '2026-09-20', 'bo', 't')`);
  host.storage.sql.exec(`INSERT INTO carried_outcome_withdrawals (outcome_id, reason, by, at) VALUES ('OUTC-2026-0001', 'r', 'bo', 't')`);
  const before = TABLES.map((t) => JSON.stringify(host.storage.sql.exec(`SELECT * FROM ${t}`)));
  caseInputsOf(host, { record, membership });
  assert.ok(host.storage.sql.exec(`PRAGMA table_info(statement_acknowledgements)`).some((c) => c.name === "reason"), "added");
  const after = TABLES.map((t) => host.storage.sql.exec(`SELECT * FROM ${t}`));
  assert.deepEqual(after[0], [{ ...JSON.parse(before[0])[0], reason: null }], "the old row kept, its reason null, never filled");
  assert.deepEqual(after.slice(1).map((r) => JSON.stringify(r)), before.slice(1), "every other row kept as it was");
  /* the DDL is case-authoring's: the same four CREATE TABLE IF NOT EXISTS and their two indexes */
  assert.deepEqual([...CASE_INPUTS_SCHEMA.matchAll(/CREATE (TABLE|INDEX) IF NOT EXISTS (\w+)/g)].map((m) => m[2]),
    ["statement_acknowledgements", "statement_acknowledgements_statement", "what_changed_drafts", "what_changed_drafts_case",
     "carried_outcomes", "carried_outcomes_case", "carried_outcome_withdrawals"]);
});

test("R16 (K3): caseInputsOps publishes exactly the three ops, statementack, whatchangedpropose and whatchangeddrafts, one arm each, each answering exactly what its service answers; viewer and author are the query's stamps", () => {
  const { w, P } = setup();
  const pub = w.prepare(P, "alice");
  const url = (q) => new URL(`http://do/x?${q}`);
  assert.deepEqual(Object.keys(caseInputsOps(w.ci, url(""), null)).sort(), ["statementack", "whatchangeddrafts", "whatchangedpropose"]);
  /* statementack: draft, case, edition, bySecret and reason from the query, the viewer its stamp */
  const viaOp = caseInputsOps(w.ci, url(`case=${pub.caseId}&edition=1&viewer=${encodeURIComponent(V("bo"))}&reason=${encodeURIComponent(WORDS)}`),
                              { case: "CASE-2026-0404", reason: "a body's words", viewer: V("cy") }).statementack();
  assert.deepEqual([viaOp.ok, viaOp.acknowledgement.by, viaOp.acknowledgement.reason, viaOp.acknowledgement.case_id],
    [true, "bo", WORDS, pub.caseId]);
  const again = w.ci.acknowledgeStatement({ caseId: pub.caseId, edition: "1", viewer: V("bo"), reason: WORDS });
  assert.deepEqual(caseInputsOps(w.ci, url(`case=${pub.caseId}&edition=1&viewer=${encodeURIComponent(V("bo"))}&reason=${encodeURIComponent(WORDS)}`), null)
    .statementack(), again, "exactly what the service answers");
  const none = caseInputsOps(w.ci, url(`case=${pub.caseId}&edition=1&viewer=${encodeURIComponent(V("cy"))}`), { reason: "a body's words" }).statementack();
  assert.equal(none.reason, "STATEMENT_ACK_NO_REASON", "a body's reason is not read: the arm reads the query (R1)");
  /* whatchangedpropose and whatchangeddrafts: the case's sight is the viewer stamp's */
  w.ratify(pub, P);
  const p = caseInputsOps(w.ci, url(`case=${pub.caseId}&viewer=${encodeURIComponent(V("bo"))}&author=bo`), { text: "words", proposedBy: "cy" })
    .whatchangedpropose();
  assert.deepEqual([p.ok, p.draft.label.by], [true, "bo"]);
  assert.deepEqual(caseInputsOps(w.ci, url(`case=${pub.caseId}&viewer=${encodeURIComponent(V("bo"))}`), null).whatchangeddrafts(),
                   w.ci.whatChangedDrafts({ case: pub.caseId, viewer: V("bo") }));
});

test("R15: no place is named in this module's behaviour or outward text — every answer and refusal it writes, the lines it renders and every row's words name no place a jurisdiction profile covers", () => {
  /* the places the profiles cover, read through jurisdictions' interface (its R1: each held profile's `covers`), never
     scraped from the profiles' source (K1545) */
  const places = new Set();
  for (const p of listProfiles())
    for (const c of p.covers) {
      places.add(c);
      places.add(c.replace(/^(City|Town|County) of /, "").replace(/ (County|City)$/, ""));
    }
  assert.ok(places.size >= 4, "the profiles name places");
  const { w, P } = setup();
  w.draft("DRAFT-2026-0001", P, { statement: STATEMENT }, { statementBy: "bo" });
  const said = [];
  const say = (x) => said.push(JSON.stringify(x));
  const pub = w.prepare(P, "alice", { draft: "DRAFT-2026-0001" });
  say(w.docOf(pub.caseId, 1).text);
  say(w.ci.acknowledgeStatement({ viewer: V("cy"), caseId: pub.caseId, edition: 1, reason: "read" }));
  say(w.ci.acknowledgeStatement({ viewer: V("cy"), draft: "DRAFT-2026-0001", reason: "read" }));
  say(w.ci.acknowledgeStatement({ viewer: V("bo"), draft: "DRAFT-2026-0001", reason: "read" }));
  say(w.ci.acknowledgeStatement({ viewer: V("cy") }));
  say(w.ci.acknowledgeStatement({ viewer: V("cy"), caseId: pub.caseId, edition: 1 }));
  say(w.ci.statementWriter(P, pub.caseId, 1, STATEMENT, "alice", null));
  say(w.ci.statementWriter(P, pub.caseId, 1, "", "alice", null));
  w.ratify(pub, P);
  say(w.ci.proposeWhatChanged({ case: pub.caseId, text: "", viewer: V("bo") }));
  say(w.ci.proposeWhatChanged({ case: "CASE-2026-0404", text: "t", viewer: V("bo") }));
  say(w.ci.proposeWhatChanged({ case: pub.caseId, text: "t", proposedBy: "class:ai", viewer: V("bo") }));
  for (const over of [{ by: "class:daemon" }, { kind: "x" }, { on: "x" }, { case: "CASE-2026-0404" }])
    say(w.ci.carryOutcome({ case: pub.caseId, ...OUTCOME, by: "alice", ...over }));
  say(w.ci.withdrawCarriedOutcome({ outcome: "OUTC-2026-0000", reason: "r", by: "alice" }));
  say(w.ci.registerOpenRequests("x", {}));
  say(openRequestLine({ whom: "the office", asked_at: "2026-09-01", window_closes: null, answers: null }));
  say(withheldWriterStated(1, null)); say(withheldWriterStated(0, "bo"));
  say(ackBodyLines({ rows: [], unbound: 1, unboundWriterUndetermined: 1, link: { draft: "D", by: "a", at: "t" } }, P));
  say(Object.values(STATEMENT_ACK_CHECKS)); say(Object.values(CARRIED_OUTCOME_CHECKS)); say(CASE_INPUTS_WORDS);
  say(OPEN_REQUESTS_UNREAD_SENTENCE);
  const all = said.join("\n");
  for (const p of places) assert.equal(all.includes(p), false, `names ${p}`);
});
