/* case-authoring: the act inside a caller's transaction (R18), stamps (R25), the purge declaration (R28), the checks
   that moved here (R29), no place named (R30), and the ops that route to the module (K3). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { world, V, AUTHORED } from "./fixture.mjs";
import { caseAuthoringOps, caseAuthoringOwns, CASE_AUTHORING_TABLES, CASE_DERIVATION_CHECKS, STATEMENT_ACK_CHECKS,
         CASE_DISCLOSURE_CHECKS, PUBLISH_ACT_CHECKS, STATEMENT_ACK_MAX, SEARCHED_LEVEL_OUTCOMES }
  from "../../../src/case-authoring/index.mjs";
import * as CHECKS from "../../../src/case-authoring/checks.mjs";
import * as DISCLOSURES from "../../../src/case-disclosures/index.mjs";

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

test("R25: every authorship field is a stamp — the author, an acknowledger, the draft link's namer — and statement_by is read from the record, never a body's", () => {
  const { w, P } = setup();
  w.draft("DRAFT-2026-0001", P, { statement: AUTHORED.statement }, { statementBy: "bo" });
  const url = new URL(`http://do/publishcase?author=alice&viewer=${encodeURIComponent(V("alice"))}&project=${P}&draft=DRAFT-2026-0001`);
  const body = { ...AUTHORED, targets: [Q], roles: { [Q]: "load_bearing" }, author: "mallory", viewer: V("mallory"),
                 statement_by: "mallory", statementBy: "mallory", draft: "DRAFT-2026-0099" };
  const r = caseAuthoringOps(w.ca, url, body).publishcase();
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual([r.author, r.completeness.author, r.completeness.statement_by, r.completeness.draft.named_by,
                    r.completeness.draft.draft_id], ["alice", "alice", "bo", "alice", "DRAFT-2026-0001"]);
  const fm = w.fm(w.row(`SELECT text FROM case_documents WHERE case_id=?`, r.caseId).text);
  assert.deepEqual([fm.completeness.author, fm.completeness.statement_by, fm.completeness.draft_named_by], ["alice", "bo", "alice"]);
  /* the acknowledger is the viewer the control plane stamped; a body names nobody */
  const au = new URL(`http://do/statementack?case=${r.caseId}&edition=1&viewer=${encodeURIComponent(V("cy"))}&reason=read`);
  const a = caseAuthoringOps(w.ca, au, { viewer: V("mallory"), by: "mallory" }).statementack();
  assert.deepEqual([a.ok, a.acknowledgement.by], [true, "cy"]);
});

test("R28: statement_acknowledgements is declared whole to record-core's purge, with R39's what_changed_drafts beside it: a whole-store purge clears it, a bundle's purge does not", () => {
  const { w, P } = setup();
  assert.deepEqual(CASE_AUTHORING_TABLES, [{ name: "statement_acknowledgements", keys: [] },
                                           { name: "what_changed_drafts", keys: [] }]);
  assert.deepEqual([caseAuthoringOwns("statement_acknowledgements"), caseAuthoringOwns({ name: "statement_acknowledgements" }),
                    caseAuthoringOwns("case_documents")], [true, true, false]);
  const pub = w.publish(P, "alice", [Q]);
  assert.equal(w.ca.acknowledgeStatement({ viewer: V("bo"), caseId: pub.caseId, edition: 1, reason: "read" }).ok, true);
  const one = w.record.purge({ bundleId: Q });
  assert.equal(w.count("statement_acknowledgements"), 1, "keyed to no bundle");
  assert.ok("statement_acknowledgements" in (one.removed || one.tables || one.counts || one), "named in the report");
  w.record.purge({});
  assert.equal(w.count("statement_acknowledgements"), 0);
});

test("R29: each check moved here as an invariant with its row — C-44.1, C-44.3–C-44.5, C-82.2–C-82.8 (C-82.8 new, DEC-88), C-32.6 (and R3's C-33.14) — every refusal carrying its check, code and translation; the family C-120.1–C-120.8 and C-120.10–C-120.13 (C-120.9 withdrawn unstamped) is case-disclosures' (its R22, N529), re-exported here and held nowhere in this module's own families (K529)", () => {
  assert.deepEqual(Object.entries(CASE_DERIVATION_CHECKS).map(([k, v]) => [k, v.check]),
    [["CASE_IDENTITY_AMBIGUOUS", "C-44.1"], ["PUBLISH_DRAFT_NOT_FOUND", "C-44.3"], ["PUBLISH_DRAFT_NOT_THIS_CASE", "C-44.4"],
     ["PUBLISH_DRAFT_ALREADY_BOUND", "C-44.5"]]);
  assert.deepEqual(Object.entries(STATEMENT_ACK_CHECKS).map(([k, v]) => [k, v.check]),
    [["STATEMENT_ACK_NO_SUBJECT", "C-82.2"], ["STATEMENT_ACK_ALREADY_SIGNED", "C-82.3"],
     ["STATEMENT_ACK_NOT_A_PARTICIPANT", "C-82.4"], ["STATEMENT_ACK_NO_STATEMENT", "C-82.5"],
     ["STATEMENT_ACK_BY_ITS_AUTHOR", "C-82.6"], ["STATEMENT_ACK_AUTHOR_UNDETERMINED", "C-82.7"],
     ["STATEMENT_ACK_NO_REASON", "C-82.8"]]);
  /* C-82.8's translation is the requirements' own, word for word (case-authoring.md, "Row C-82.8") */
  assert.equal(STATEMENT_ACK_CHECKS.STATEMENT_ACK_NO_REASON.translation, "An acknowledgement of a statement is recorded "
    + "with your own words on it, and none were given, or they are longer than 2,000 characters. Write them. Nothing was "
    + "written.");
  assert.equal(STATEMENT_ACK_CHECKS.STATEMENT_ACK_NO_REASON.where,
    "src/case-authoring/index.mjs acknowledgeStatement > is-statement-ack-reasoned");
  assert.deepEqual(Object.values(CASE_DISCLOSURE_CHECKS).map((v) => v.check),
    ["C-120.1", "C-120.2", "C-120.3", "C-120.4", "C-120.5", "C-120.6", "C-120.7", "C-120.8", "C-120.10", "C-120.11",
     "C-120.12", "C-120.13"]);
  assert.equal(Object.values(CASE_DISCLOSURE_CHECKS).some((v) => v.check === "C-120.9"), false, "withdrawn, never used");
  assert.deepEqual(Object.entries(PUBLISH_ACT_CHECKS).map(([k, v]) => [k, v.check]),
    [["MACHINE_CANNOT_PUBLISH", "C-32.6"], ["NO_STATEMENT", "C-33.14"]]);
  assert.equal(CASE_DISCLOSURE_CHECKS, DISCLOSURES.CASE_DISCLOSURE_CHECKS, "case-disclosures' one table, re-exported");
  for (const row of Object.values(CASE_DISCLOSURE_CHECKS))
    assert.match(row.where, /^src\/case-disclosures\/index\.mjs \S+ > [a-z-]+$/, "each C-120 row names case-disclosures' region");
  /* K529: this module's own family file holds no C-120 row and no disclosure code */
  const own = Object.values(CHECKS).filter((v) => v && typeof v === "object").flatMap((f) => Object.entries(f));
  assert.equal(own.some(([k, v]) => k in CASE_DISCLOSURE_CHECKS || /^C-120\./.test(v.check)), false, "no C-120 row held here");
  for (const row of [...Object.values(CASE_DERIVATION_CHECKS), ...Object.values(STATEMENT_ACK_CHECKS),
                     ...Object.values(CASE_DISCLOSURE_CHECKS), ...Object.values(PUBLISH_ACT_CHECKS)]) {
    assert.match(row.where, /^src\/case-(authoring|disclosures)\/index\.mjs \S+ > [a-z-]+$/, "each row names its module's region");
    assert.ok(typeof row.translation === "string" && row.translation.length > 40, "a member's sentence");
    assert.ok(!/[A-Z]{2,}_[A-Z_]+/.test(row.translation), "no code in a member's words");
  }
  /* one row per code and per check id across this module's families: no code or id is held twice here */
  const all = [...Object.entries(CASE_DERIVATION_CHECKS), ...Object.entries(STATEMENT_ACK_CHECKS),
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
  assert.equal(STATEMENT_ACK_MAX, 500);
});

test("R30: no place is named in this module's behaviour or outward text — every document, answer and refusal it writes, and every row's words, name no place a jurisdiction profile covers", () => {
  /* the places the profiles cover, read from the profiles' own data */
  const dir = new URL("../../../../jurisdictions/profiles/", import.meta.url);
  const places = new Set();
  for (const f of readdirSync(dir)) {
    const text = readFileSync(new URL(f, dir), "utf8");
    for (const m of text.matchAll(/covers:\s*\[([^\]]*)\]/g))
      for (const q of m[1].matchAll(/"([^"]+)"/g)) {
        places.add(q[1]);
        places.add(q[1].replace(/^(City|Town|County) of /, "").replace(/ (County|City)$/, ""));
      }
  }
  assert.ok(places.size >= 4, "the profiles name places");
  const { w, P } = setup();
  w.draft("DRAFT-2026-0001", P, { statement: AUTHORED.statement }, { statementBy: "bo" });
  const said = [];
  const say = (x) => said.push(JSON.stringify(x));
  const pub = w.publish(P, "alice", [Q], { draft: "DRAFT-2026-0001", excluded: [{ description: "d", reason: "r" }] });
  say(pub);
  say(w.row(`SELECT text FROM case_documents WHERE case_id=?`, pub.caseId).text);
  say(w.ca.acknowledgeStatement({ viewer: V("bo"), caseId: pub.caseId, edition: 1, reason: "read" }));
  say(w.ca.acknowledgeStatement({ viewer: V("bo"), draft: "DRAFT-2026-0001", reason: "read" }));
  for (const over of [{ author: "" }, { project: null }, { project: "PROJ-2026-0000-x" }, { targets: [] }, { statement: "" },
                      { subjectPosition: "x" }, { subjectJustification: "" }, { excluded: null }, { scope: "" },
                      { biasAcknowledgement: "" }, { excluded: [{}] }, { statement: 'a "q"' }, { roles: [] },
                      { roles: { [Q]: "x" } }, { caseId: "CASE-2026-0001", newCase: true }, { caseId: "CASE-2026-0001" },
                      { draft: "DRAFT-2026-0404" }])
    say(w.publish(P, "alice", [Q], over));
  say(w.ca.acknowledgeStatement({ viewer: V("bo") }));
  say(Object.values(CASE_DERIVATION_CHECKS)); say(Object.values(STATEMENT_ACK_CHECKS)); say(SEARCHED_LEVEL_OUTCOMES);
  say(Object.values(CASE_DISCLOSURE_CHECKS)); say(Object.values(PUBLISH_ACT_CHECKS));
  const all = said.join("\n");
  for (const p of places) assert.equal(all.includes(p), false, `names ${p}`);
});

test("K3: the ops route the stamps from the query after the body — publishcase takes targets, caseId, project and draft from either, newCase's string forms spelled out; statementack takes its subject from the query", () => {
  const { w, P } = setup();
  const q = (s) => new URL(`http://do/x?viewer=${encodeURIComponent(V("alice"))}&author=alice&${s}`);
  const base = { ...AUTHORED, roles: { [Q]: "load_bearing", [Q2]: "load_bearing" } };
  const viaQuery = caseAuthoringOps(w.ca, q(`targets=${Q},${Q2}&project=${P}&newCase=false`), base).publishcase();
  assert.deepEqual([viaQuery.ok, viaQuery.findings.map((f) => f.target), viaQuery.minted], [true, [Q, Q2], true]);
  const w2 = setup().w; const P2 = w2.project("Two", "alice", [Q]);
  for (const [v, want] of [["true", true], ["1", true], ["yes", true], ["false", false], ["0", false], ["no", false]]) {
    const r = caseAuthoringOps(w2.ca, q(`target=${Q}&project=${P2}&caseId=CASE-2026-0001&newCase=${v}`), base).publishcase();
    assert.equal(r.reason, want ? "CASE_IDENTITY_AMBIGUOUS" : "NO_SUCH_CASE", `newCase=${v}`);
  }
  const b = caseAuthoringOps(w2.ca, q(""), { ...base, targets: [Q], project: P2, newCase: true, caseId: "CASE-2026-0001" }).publishcase();
  assert.equal(b.reason, "CASE_IDENTITY_AMBIGUOUS", "the body's own newCase and caseId when the query has none");
  const ack = caseAuthoringOps(w.ca, new URL(`http://do/statementack?case=${viaQuery.caseId}&edition=1&viewer=${encodeURIComponent(V("bo"))}&reason=${encodeURIComponent("I read it whole.")}`), null).statementack();
  assert.deepEqual([ack.ok, ack.acknowledgement.reason], [true, "I read it whole."], "the reason from the query (R19)");
  const none = caseAuthoringOps(w.ca, new URL(`http://do/statementack?case=${viaQuery.caseId}&edition=1&viewer=${encodeURIComponent(V("cy"))}`), { reason: "a body's words" }).statementack();
  assert.equal(none.reason, "STATEMENT_ACK_NO_REASON", "a body's reason is not read: the arm reads the query (R19)");
});
