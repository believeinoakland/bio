/* case-authoring: the act inside a caller's transaction (R18), stamps (R25), no table of its own and `case-inputs` created
   at its creation (T47; N908; case-inputs R11, R16), the checks that moved here (R29), no place named (R30), and the ops
   that route to the module (K3). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, AUTHORED, storage } from "./fixture.mjs";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { caseAuthoringOf, caseAuthoringOps, CASE_DERIVATION_CHECKS, CASE_DISCLOSURE_CHECKS, PUBLISH_ACT_CHECKS,
         SEARCHED_LEVEL_OUTCOMES } from "../../../src/case-authoring/index.mjs";
import { caseInputsOf, caseInputsOps, CASE_INPUTS_TABLES, CARRIED_OUTCOME_CHECKS, STATEMENT_ACK_CHECKS }
  from "../../../src/case-inputs/index.mjs";
import * as CHECKS from "../../../src/case-authoring/checks.mjs";
import * as DISCLOSURES from "../../../src/case-disclosures/index.mjs";
import { list as listProfiles } from "../../../../jurisdictions/index.mjs";

const DOC = "INFO-2026-0001-a", Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-q";

function setup(opts) {
  const w = world(opts);
  for (const m of ["alice", "bo", "cy", "mallory"]) w.member(m);
  w.doc(DOC);
  w.finding(Q, [{ target: DOC }]);
  w.finding(Q2, [{ target: DOC }]);
  const P = w.project("Team", "alice", [Q, Q2]);
  w.join(P, "bo"); w.join(P, "cy");
  return { w, P };
}
const ROLLBACK = Symbol("rollback");

test("R18: publishCase is synchronous and writes only inside the caller's transaction, so a caller may run it and roll it back (the review copy's missing-list): no row survives", () => {
  const { w, P } = setup();
  const before = w.snapshot();
  let out = null;
  try {
    w.st.transactionSync(() => { out = w.publish(P, "alice", [Q]); throw ROLLBACK; });
  } catch (e) { if (e !== ROLLBACK) throw e; }
  assert.equal(out instanceof Promise, false, "synchronous");
  assert.equal(out.ok, true, JSON.stringify(out).slice(0, 300));
  assert.deepEqual(w.snapshot(), before, "the document, the minted id and every other row rolled back");
  /* a refusal, after an id was drawn, takes it back too: the act is one transaction */
  const n = w.count("minted_ids");
  assert.equal(w.publish(P, "alice", [Q], { draft: "DRAFT-2026-0404" }).ok, false);
  assert.equal(w.count("minted_ids"), n);
});

test("R25, R65: every authorship field is a stamp — the author, an acknowledger (case-inputs R13's stamp, T47), the draft link's namer — and statement_by is read from the record, never a body's: a body naming it is refused CASE_FIELD_NOT_ALLOWED", async () => {
  const { w, P } = setup();
  w.draft("DRAFT-2026-0001", P, { statement: AUTHORED.statement }, { statementBy: "bo" });
  /* the acknowledger is the viewer the control plane stamped (case-inputs R13), a body naming nobody; the document lists that stamp */
  const au = new URL(`http://do/statementack?draft=DRAFT-2026-0001&viewer=${encodeURIComponent(V("cy"))}&reason=read`);
  const a = caseInputsOps(w.ci, au, { viewer: V("mallory"), by: "mallory" }).statementack();
  assert.deepEqual([a.ok, a.acknowledgement.by], [true, "cy"]);
  const url = new URL(`http://do/publishcase?author=alice&viewer=${encodeURIComponent(V("alice"))}&project=${P}&draft=DRAFT-2026-0001`);
  const body = { ...AUTHORED, targets: [Q], roles: { [Q]: "load_bearing" }, author: "mallory", viewer: V("mallory"),
                 draft: "DRAFT-2026-0099" };
  /* R65 (T41): a body naming the writer is not ignored but refused, the fields named; nothing written */
  const named = await caseAuthoringOps(w.ca, url, { ...body, statement_by: "mallory", statementBy: "mallory" }).publishcase();
  assert.deepEqual([named.ok, named.reason, named.fields], [false, "CASE_FIELD_NOT_ALLOWED", ["statementBy", "statement_by"]]);
  assert.equal(w.count("case_documents"), 0, "nothing written");
  const r = await caseAuthoringOps(w.ca, url, body).publishcase();
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual([r.author, r.completeness.author, r.completeness.statement_by, r.completeness.draft.named_by,
                    r.completeness.draft.draft_id], ["alice", "alice", "bo", "alice", "DRAFT-2026-0001"]);
  const fm = w.fm(w.row(`SELECT text FROM case_documents WHERE case_id=?`, r.caseId).text);
  assert.deepEqual([fm.completeness.author, fm.completeness.statement_by, fm.completeness.draft_named_by], ["alice", "bo", "alice"]);
  assert.deepEqual(r.completeness.acknowledgements.map((x) => x.by), ["cy"]);
  assert.deepEqual(fm.completeness_acknowledgements.map((x) => x.by), ["cy"], "the stamp, never the body's mallory");
});

test("case-inputs R11, R16 (T47; N908; K2982): case-authoring holds no table and declares none; its factory creates case-inputs' one instance on the host, whose four tables are declared to record-core's purge as case-inputs'", () => {
  const { w } = setup();
  assert.equal(caseInputsOf(w.host), w.ci, "the one instance on the host");
  const declared = w.record.declaredTables();
  assert.equal(declared.some((d) => d.module === "case-authoring"), false, "this module declares nothing");
  assert.deepEqual(CASE_INPUTS_TABLES.map((t) => declared.find((d) => d.name === t.name)?.module),
                   CASE_INPUTS_TABLES.map(() => "case-inputs"));
  /* created at case-authoring's creation, on a host where nothing else asked for it */
  const host = { storage: storage() };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) host.storage.db.exec(t);
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  caseAuthoringOf(host, { record, membership });
  assert.deepEqual(record.declaredTables().filter((d) => d.module === "case-inputs").map((d) => d.name).sort(),
                   CASE_INPUTS_TABLES.map((t) => t.name).sort());
});

test("case-inputs R11, R16 (K2675's form): a declaration record-core refuses at case-inputs' creation is thrown by case-authoring's creation, and no instance of it is kept — the next call throws again; negative control: the fixture's host creates it", () => {
  const host = { storage: storage() };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) host.storage.db.exec(t);
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  assert.equal(record.declarePurge("another-owner", [{ name: "statement_acknowledgements", keys: [] }]).ok !== false, true);
  for (let i = 0; i < 2; i++)
    assert.throws(() => caseAuthoringOf(host, { record, membership }),
                  /^Error: case-inputs: record-core refused its table declaration: TABLE_DECLARED \(statement_acknowledgements\)$/);
  const { w } = setup();
  assert.equal(caseAuthoringOf(w.host), w.ca, "the one instance");
});

test("R29: each check moved here as an invariant with its row — C-44.1, C-44.3–C-44.5 (and R58's C-44.6, new, N681), C-32.6 (and R3's C-33.14), R56's CALCULATION_NOT_DISCLOSED (new, T33-69) and R61's STANDARDS_USE_REFUSED (C-136.2, new, T36) — every refusal carrying its check, code and translation; C-82.2–C-82.8 and C-136.3–C-136.8 case-inputs' (its R12, T47), held nowhere here; the family C-120.1–C-120.8 and C-120.10–C-120.29 (C-120.9 withdrawn unstamped; .14–.16 the people a case names, T33-68; .17–.18 a marked photo, T37; .19 an unchecked photo, T38; .20–.22 a member document's publication copy, T39, numbered provisionally until promotion's stamp; .23–.29 the account, T41) is case-disclosures' (its R22, N529), re-exported here and held nowhere in this module's own families (K529)", () => {
  assert.deepEqual(Object.entries(CASE_DERIVATION_CHECKS).map(([k, v]) => [k, v.check]),
    [["CASE_IDENTITY_AMBIGUOUS", "C-44.1"], ["PUBLISH_DRAFT_NOT_FOUND", "C-44.3"], ["PUBLISH_DRAFT_NOT_THIS_CASE", "C-44.4"],
     ["PUBLISH_DRAFT_ALREADY_BOUND", "C-44.5"], ["CASE_EDITION_WAITING", "C-44.6"]]);
  /* C-44.6's translation is the requirements' own, word for word (case-authoring.md, "Row C-44.6") */
  assert.equal(CASE_DERIVATION_CHECKS.CASE_EDITION_WAITING.translation, "An edition of this case is signed and waiting to "
    + "be published at the time set. Prepare the next edition after it is published, or cancel it first. Nothing was "
    + "prepared.");
  assert.equal(CASE_DERIVATION_CHECKS.CASE_EDITION_WAITING.where,
    "src/case-authoring/index.mjs #publishCase > is-case-edition-waiting");
  /* (T47; N908) C-82.2–C-82.8 and C-136.3–C-136.8 are case-inputs' (its R12): held nowhere in this module's files, and the
     C-136 family spans both modules, each id once */
  const OWN = Object.values(CHECKS).filter((v) => v && typeof v === "object").flatMap((f) => Object.values(f));
  assert.equal(OWN.some((v) => /^C-82\./.test(v.check)), false, "no C-82 row held here");
  assert.deepEqual([...Object.values(PUBLISH_ACT_CHECKS), ...Object.values(CARRIED_OUTCOME_CHECKS)]
    .map((v) => v.check).filter((c) => /^C-136\./.test(c)), ["C-136.1", "C-136.2", "C-136.3", "C-136.4", "C-136.5", "C-136.6",
    "C-136.7", "C-136.8"]);
  assert.equal(Object.values(STATEMENT_ACK_CHECKS).every((v) => v.where.startsWith("src/case-inputs/")), true);
  assert.deepEqual(Object.values(CASE_DISCLOSURE_CHECKS).map((v) => v.check),
    ["C-120.1", "C-120.2", "C-120.3", "C-120.4", "C-120.5", "C-120.6", "C-120.7", "C-120.8", "C-120.10", "C-120.11",
     "C-120.12", "C-120.13", "C-120.14", "C-120.15", "C-120.16", "C-120.17", "C-120.18", "C-120.19",
     "C-120.20", "C-120.21", "C-120.22", "C-120.23", "C-120.24", "C-120.25", "C-120.26", "C-120.27", "C-120.28", "C-120.29"]);
  assert.equal(Object.values(CASE_DISCLOSURE_CHECKS).some((v) => v.check === "C-120.9"), false, "withdrawn, never used");
  assert.deepEqual(Object.entries(PUBLISH_ACT_CHECKS).map(([k, v]) => [k, v.check]),
    [["MACHINE_CANNOT_PUBLISH", "C-32.6"], ["NO_STATEMENT", "C-33.14"], ["CALCULATION_NOT_DISCLOSED", "C-136.1"],
     ["STANDARDS_USE_REFUSED", "C-136.2"]]);
  /* R61's new row (T36): its region, and its translation the requirements' own, word for word (case-authoring.md R29) */
  assert.equal(PUBLISH_ACT_CHECKS.STANDARDS_USE_REFUSED.where, "src/case-authoring/index.mjs #publishCase > is-standards-use");
  assert.equal(PUBLISH_ACT_CHECKS.STANDARDS_USE_REFUSED.translation, "This case uses a standard as a published case may not: "
    + "it would carry the whole text of a standard that is not free to read, quote a passage of one that no finding relies "
    + "on, or call a finding that rests only on benchmarks \"violated\" or \"nonconforming\". Each is named below. Change "
    + "the case and prepare it again. Nothing was prepared.");
  /* R56's new row (T33-69), this module's own, never case-disclosures' */
  assert.equal(PUBLISH_ACT_CHECKS.CALCULATION_NOT_DISCLOSED.where,
    "src/case-authoring/index.mjs #calculationsJudged > is-calculation-disclosed");
  assert.equal(CASE_DISCLOSURE_CHECKS, DISCLOSURES.CASE_DISCLOSURE_CHECKS, "case-disclosures' one table, re-exported");
  for (const row of Object.values(CASE_DISCLOSURE_CHECKS))
    assert.match(row.where, /^src\/case-disclosures\/index\.mjs \S+ > [a-z-]+$/, "each C-120 row names case-disclosures' region");
  /* K529: this module's own family file holds no C-120 row and no disclosure code */
  const own = Object.values(CHECKS).filter((v) => v && typeof v === "object").flatMap((f) => Object.entries(f));
  assert.equal(own.some(([k, v]) => k in CASE_DISCLOSURE_CHECKS || /^C-120\./.test(v.check)), false, "no C-120 row held here");
  for (const row of [...Object.values(CASE_DERIVATION_CHECKS),
                     ...Object.values(CASE_DISCLOSURE_CHECKS), ...Object.values(PUBLISH_ACT_CHECKS)]) {
    assert.match(row.where, /^src\/case-(authoring|disclosures)\/index\.mjs \S+ > [a-z-]+$/, "each row names its module's region");
    assert.ok(typeof row.translation === "string" && row.translation.length > 40, "a member's sentence");
    assert.ok(!/[A-Z]{2,}_[A-Z_]+/.test(row.translation), "no code in a member's words");
  }
  /* one row per code and per check id across this module's families: no code or id is held twice here */
  const all = [...Object.entries(CASE_DERIVATION_CHECKS),
               ...Object.entries(CASE_DISCLOSURE_CHECKS), ...Object.entries(PUBLISH_ACT_CHECKS)];
  assert.equal(new Set(all.map(([k]) => k)).size, all.length, "each code once");
  assert.equal(new Set(all.map(([, v]) => v.check)).size, all.length, "each check id once");
  /* the machine fence and the missing statement answer with this module's own rows */
  const { w, P } = setup();
  const m = w.publish(P, "alice", [Q], { author: "class:daemon" });
  assert.deepEqual([m.code, m.check, m.translation],
    ["MACHINE_CANNOT_PUBLISH", "C-32.6", PUBLISH_ACT_CHECKS.MACHINE_CANNOT_PUBLISH.translation]);
  const s = w.publish(P, "alice", [Q], { statement: "" });
  assert.deepEqual([s.code, s.check, s.translation], ["NO_STATEMENT", "C-33.14", PUBLISH_ACT_CHECKS.NO_STATEMENT.translation]);
});

test("R30: no place is named in this module's behaviour or outward text — every document, answer and refusal it writes, and every row's words, name no place a jurisdiction profile covers", () => {
  /* the places the profiles cover, read through jurisdictions' interface (its R1: each held profile's `covers`), never
     scraped from the profiles' source, where other fields also hold `covers:` lists (K1545) */
  const places = new Set();
  for (const p of listProfiles())
    for (const c of p.covers) {
      places.add(c);
      places.add(c.replace(/^(City|Town|County) of /, "").replace(/ (County|City)$/, ""));
    }
  assert.ok(places.size >= 4, "the profiles name places");
  const { w, P } = setup();
  w.draft("DRAFT-2026-0001", P, { statement: AUTHORED.statement }, { statementBy: "bo" });
  const said = [];
  const say = (x) => said.push(JSON.stringify(x));
  const pub = w.publish(P, "alice", [Q], { draft: "DRAFT-2026-0001", excluded: [{ description: "d", reason: "r" }] });
  say(pub);
  say(w.row(`SELECT text FROM case_documents WHERE case_id=?`, pub.caseId).text);
  for (const over of [{ author: "" }, { project: null }, { project: "PROJ-2026-0000-x" }, { targets: [] }, { statement: "" },
                      { subjectPosition: "x" }, { subjectJustification: "" }, { excluded: null }, { scope: "" },
                      { biasAcknowledgement: "" }, { excluded: [{}] }, { statement: 'a "q"' }, { roles: [] },
                      { roles: { [Q]: "x" } }, { caseId: "CASE-2026-0001", newCase: true }, { caseId: "CASE-2026-0001" },
                      { draft: "DRAFT-2026-0404" }])
    say(w.publish(P, "alice", [Q], over));
  say(Object.values(CASE_DERIVATION_CHECKS)); say(SEARCHED_LEVEL_OUTCOMES);
  say(Object.values(CASE_DISCLOSURE_CHECKS)); say(Object.values(PUBLISH_ACT_CHECKS));
  const all = said.join("\n");
  for (const p of places) assert.equal(all.includes(p), false, `names ${p}`);
});

test("K3: the ops route the stamps from the query after the body — publishcase takes targets, caseId, project and draft from either, newCase's string forms spelled out; it holds no statementack (case-inputs R16's, T47)", async () => {
  const { w, P } = setup();
  const q = (s) => new URL(`http://do/x?viewer=${encodeURIComponent(V("alice"))}&author=alice&${s}`);
  const base = { ...AUTHORED, roles: { [Q]: "load_bearing", [Q2]: "load_bearing" } };
  const viaQuery = await caseAuthoringOps(w.ca, q(`targets=${Q},${Q2}&project=${P}&newCase=false`), base).publishcase();
  assert.deepEqual([viaQuery.ok, viaQuery.findings.map((f) => f.target), viaQuery.minted], [true, [Q, Q2], true]);
  const w2 = setup().w; const P2 = w2.project("Two", "alice", [Q]);
  for (const [v, want] of [["true", true], ["1", true], ["yes", true], ["false", false], ["0", false], ["no", false]]) {
    const r = await caseAuthoringOps(w2.ca, q(`target=${Q}&project=${P2}&caseId=CASE-2026-0001&newCase=${v}`), base).publishcase();
    assert.equal(r.reason, want ? "CASE_IDENTITY_AMBIGUOUS" : "NO_SUCH_CASE", `newCase=${v}`);
  }
  const b = await caseAuthoringOps(w2.ca, q(""), { ...base, targets: [Q], project: P2, newCase: true, caseId: "CASE-2026-0001" }).publishcase();
  assert.equal(b.reason, "CASE_IDENTITY_AMBIGUOUS", "the body's own newCase and caseId when the query has none");
  assert.equal("statementack" in caseAuthoringOps(w.ca, q(""), null), false);
});
