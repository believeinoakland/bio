/* case-authoring: the act inside a caller's transaction (R18), stamps (R25), the purge declaration (R28), the checks
   that moved here (R29), no place named (R30), and the ops that route to the module (K3). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { world, V, AUTHORED } from "./fixture.mjs";
import { caseAuthoringOps, caseAuthoringOwns, CASE_AUTHORING_TABLES, CASE_DERIVATION_CHECKS, STATEMENT_ACK_CHECKS,
         STATEMENT_ACK_MAX, SEARCHED_LEVEL_OUTCOMES } from "../../../src/case-authoring/index.mjs";
import { MACHINE_FENCE_CHECKS, CASE_DERIVATION_CHECKS as CATALOGUE_C44 } from "../../../checks/bio-checks.mjs";
import * as CATALOGUE from "../../../checks/bio-checks.mjs";

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
  const au = new URL(`http://do/statementack?case=${r.caseId}&edition=1&viewer=${encodeURIComponent(V("cy"))}`);
  const a = caseAuthoringOps(w.ca, au, { viewer: V("mallory"), by: "mallory" }).statementack();
  assert.deepEqual([a.ok, a.acknowledgement.by], [true, "cy"]);
});

test("R28: statement_acknowledgements is declared whole to record-core's purge: a whole-store purge clears it, a bundle's purge does not", () => {
  const { w, P } = setup();
  assert.deepEqual(CASE_AUTHORING_TABLES, [{ name: "statement_acknowledgements", keys: [] }]);
  assert.deepEqual([caseAuthoringOwns("statement_acknowledgements"), caseAuthoringOwns({ name: "statement_acknowledgements" }),
                    caseAuthoringOwns("case_documents")], [true, true, false]);
  const pub = w.publish(P, "alice", [Q]);
  assert.equal(w.ca.acknowledgeStatement({ viewer: V("bo"), caseId: pub.caseId, edition: 1 }).ok, true);
  const one = w.record.purge({ bundleId: Q });
  assert.equal(w.count("statement_acknowledgements"), 1, "keyed to no bundle");
  assert.ok("statement_acknowledgements" in (one.removed || one.tables || one.counts || one), "named in the report");
  w.record.purge({});
  assert.equal(w.count("statement_acknowledgements"), 0);
});

test("R29: each check moved here as an invariant with its row — C-44.1, C-44.3–C-44.5, C-82.2–C-82.7 — every refusal carrying its check, code and translation; C-32.6 is the catalogue's row, which this module answers with", () => {
  assert.deepEqual(Object.entries(CASE_DERIVATION_CHECKS).map(([k, v]) => [k, v.check]),
    [["CASE_IDENTITY_AMBIGUOUS", "C-44.1"], ["PUBLISH_DRAFT_NOT_FOUND", "C-44.3"], ["PUBLISH_DRAFT_NOT_THIS_CASE", "C-44.4"],
     ["PUBLISH_DRAFT_ALREADY_BOUND", "C-44.5"]]);
  assert.deepEqual(Object.entries(STATEMENT_ACK_CHECKS).map(([k, v]) => [k, v.check]),
    [["STATEMENT_ACK_NO_SUBJECT", "C-82.2"], ["STATEMENT_ACK_ALREADY_SIGNED", "C-82.3"],
     ["STATEMENT_ACK_NOT_A_PARTICIPANT", "C-82.4"], ["STATEMENT_ACK_NO_STATEMENT", "C-82.5"],
     ["STATEMENT_ACK_BY_ITS_AUTHOR", "C-82.6"], ["STATEMENT_ACK_AUTHOR_UNDETERMINED", "C-82.7"]]);
  for (const row of [...Object.values(CASE_DERIVATION_CHECKS), ...Object.values(STATEMENT_ACK_CHECKS)]) {
    assert.match(row.where, /^src\/case-authoring\/index\.mjs \S+ > [a-z-]+$/, "each row names this module's region");
    assert.ok(typeof row.translation === "string" && row.translation.length > 40, "a member's sentence");
    assert.ok(!/[A-Z]{2,}_[A-Z_]+/.test(row.translation), "no code in a member's words");
  }
  /* the rows left the catalogue: one row per code, here */
  for (const k of Object.keys(CASE_DERIVATION_CHECKS)) assert.equal(k in CATALOGUE_C44, false, k);
  assert.equal("STATEMENT_ACK_CHECKS" in CATALOGUE, false);
  /* the machine fence answers with the catalogue's C-32.6 row */
  assert.equal(MACHINE_FENCE_CHECKS.MACHINE_CANNOT_PUBLISH.check, "C-32.6");
  const { w, P } = setup();
  const m = w.publish(P, "alice", [Q], { author: "class:daemon" });
  assert.deepEqual([m.check, m.translation], ["C-32.6", MACHINE_FENCE_CHECKS.MACHINE_CANNOT_PUBLISH.translation]);
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
  say(w.ca.acknowledgeStatement({ viewer: V("bo"), caseId: pub.caseId, edition: 1 }));
  say(w.ca.acknowledgeStatement({ viewer: V("bo"), draft: "DRAFT-2026-0001" }));
  for (const over of [{ author: "" }, { project: null }, { project: "PROJ-2026-0000-x" }, { targets: [] }, { statement: "" },
                      { subjectPosition: "x" }, { subjectJustification: "" }, { excluded: null }, { scope: "" },
                      { biasAcknowledgement: "" }, { excluded: [{}] }, { statement: 'a "q"' }, { roles: [] },
                      { roles: { [Q]: "x" } }, { caseId: "CASE-2026-0001", newCase: true }, { caseId: "CASE-2026-0001" },
                      { draft: "DRAFT-2026-0404" }])
    say(w.publish(P, "alice", [Q], over));
  say(w.ca.acknowledgeStatement({ viewer: V("bo") }));
  say(Object.values(CASE_DERIVATION_CHECKS)); say(Object.values(STATEMENT_ACK_CHECKS)); say(SEARCHED_LEVEL_OUTCOMES);
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
  const ack = caseAuthoringOps(w.ca, new URL(`http://do/statementack?case=${viaQuery.caseId}&edition=1&viewer=${encodeURIComponent(V("bo"))}`), null).statementack();
  assert.equal(ack.ok, true);
});
