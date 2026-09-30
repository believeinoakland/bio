/* publication — the tensions a published case disclosed (R10's `tensions`, with DEC-85's highlight) and those found
   since (R50). Driven at the module's interface. The section is written as case-authoring writes it (its R14, R31);
   `contradiction` R29's `unresolvedRecordOn` is a stand-in the test controls, answering exactly R29's shapes (a seen
   candidate with both sides; an unseen one with its seen side only; `undetermined`, `truncated`), so each arm of R50 is
   reached without an AI run minting candidates. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { planeWorld as world, V, SIG } from "./fixture.mjs";
import { TENSION_STATE_WORDS, TENSION_HIGHLIGHT_SENTENCE, TENSIONS_PREDATE_SENTENCE, TENSIONS_UNREADABLE_SENTENCE,
         TENSION_DEPTH_SENTENCE, CASE_TENSIONS_MAX, caseTensionsOf } from "../../../src/publication/index.mjs";

const F = "INQ-2026-0001", G = "INQ-2026-0002", DOC = "INFO-2026-0001-minutes";
const roster = (roles) => roles.map((r) => ({ bundle_id: r.target, version_sha: r.version_sha, role: "load_bearing" }));

const side = (p, x) => ({ [`${p}_kind`]: "claim", [`${p}_text`]: `${x} says so`, [`${p}_source`]: `SRC-${x}`,
                          [`${p}_date`]: "2026-09-01", [`${p}_doctype`]: "minutes", [`${p}_capture`]: null });
/* Four disclosed tensions on F, one per state, and one highlighted on G. The highlighted row is written here with a
   planted other side, explanation and kind, which R10 must never answer (DEC-85 held at the read too). */
const SECRET = "THE-HIDDEN-RECORD";
const ROWS = [
  { candidate: "c-open", finding: F, state: "open", kind: null, unseen_other_side: false, depth: 1,
    acknowledged_by: V("olive"), acknowledged_at: "2026-09-29T00:00:00Z", words: "We know.", explanation: null,
    ...side("a", "A1"), ...side("b", "B1") },
  { candidate: "c-expl", finding: F, state: "explained_not_shown", kind: null, unseen_other_side: false, depth: 1,
    acknowledged_by: V("olive"), acknowledged_at: "2026-09-29T00:00:00Z", words: null, explanation: "Different dates.",
    ...side("a", "A2"), ...side("b", "B2") },
  { candidate: "c-up", finding: F, state: "taken_up", kind: null, unseen_other_side: false, depth: 1,
    acknowledged_by: V("olive"), acknowledged_at: "2026-09-29T00:00:00Z", words: null, explanation: null,
    ...side("a", "A3"), ...side("b", "B3") },
  { candidate: "c-irr", finding: F, state: "resolved", kind: "irreconcilable", unseen_other_side: false, depth: 1,
    acknowledged_by: V("olive"), acknowledged_at: "2026-09-29T00:00:00Z", words: null, explanation: null,
    ...side("a", "A4"), ...side("b", "B4") },
  { candidate: "c-hid", finding: G, state: "open", kind: "irreconcilable", unseen_other_side: true, depth: 1,
    acknowledged_by: V("olive"), acknowledged_at: "2026-09-29T00:00:00Z", words: "Disclosed as asked.",
    explanation: SECRET, ...side("side", "S5"), ...side("b", SECRET), highlight: "anything" },
];
const SENTENCES = [
  { target: F, candidate: "c-open", template: "in_tension", sentence: "In tension, not yet resolved: A1 against B1." },
  { target: F, candidate: "c-expl", template: "explained", sentence: "Explained, not yet shown: A2 against B2." },
  { target: G, candidate: "c-hid", template: "unseen", sentence: "Rests on a side in conflict with a record not shown: S5." },
];

/* A stand-in for contradiction R29: `answers` maps finding -> (viewer) -> R29's answer; every call is recorded. */
function standIn(answers = {}) {
  const calls = [];
  return { calls, unresolvedRecordOn({ finding, sha, viewer }) {
    calls.push({ finding, sha, viewer });
    const a = answers[finding];
    const out = typeof a === "function" ? a(viewer, sha) : a;
    return out ?? { ok: true, wrote: false, finding, sha, candidates: [], truncated: false };
  } };
}
const seen = (id, state = "open") => ({ candidate: id, key: "K2", a: { kind: "claim", text: "a" }, b: { kind: "claim", text: "b" },
                                        state, explanation: null, inquiry: null, depth: 1 });
const unseen = (id) => ({ candidate: id, unseen_other_side: true, state: "open", depth: 1, side: { kind: "claim", text: "mine" } });

/* CASE-2026-0001 edition 1 over F and G, signed and published; the document /5 with ROWS unless `tensions` is given. */
function published({ tensions = { rows: ROWS, sentences: SENTENCES }, format = null, contradiction = null } = {}) {
  const w = world({ contradiction: contradiction || standIn() });
  w.member("olive"); w.member("bo");
  const proj = w.project("Parks", "olive");
  w.doc(DOC);
  w.inquiry(F, { legs: [{ target: DOC }] });
  w.inquiry(G, { legs: [{ target: DOC }] });
  const roles = [{ target: F, version_sha: w.head(F) }, { target: G, version_sha: w.head(G) }];
  w.prepare("CASE-2026-0001", 1, { project: proj, roles, tensions, ...(format ? { format } : {}) });
  assert.equal(w.signCase("CASE-2026-0001", 1, { project: proj, roster: roster(roles) }).ok, true);
  assert.equal(w.signFinding(F, { sig: SIG(8) }).ok, true);
  assert.equal(w.signFinding(G, { sig: SIG(9) }).ok, true);
  return { w, proj, roles };
}

test("R10 a /5 document's tension section round-trips to `tensions`: each disclosed contradiction with its finding, both sides, its state in words, the explanation, who acknowledged it and when, depth 1 with its sentence", () => {
  const { w } = published();
  const c = w.op("publishedcase", { id: "CASE-2026-0001" });
  assert.equal(c.ok, true);
  const t = c.tensions;
  assert.deepEqual(t.map((x) => x.candidate), ["c-open", "c-expl", "c-up", "c-irr", "c-hid"]);
  assert.deepEqual(t.slice(0, 4).map((x) => x.state), [TENSION_STATE_WORDS.open, TENSION_STATE_WORDS.explained_not_shown,
                                                       TENSION_STATE_WORDS.taken_up, TENSION_STATE_WORDS.irreconcilable]);
  assert.deepEqual(Object.values(TENSION_STATE_WORDS), ["open", "explained, not yet shown", "taken up as a question",
                                                        "held irreconcilable, to be reopened by new evidence"]);
  const open = t[0];
  assert.deepEqual([open.finding, open.depth, open.depth_stated, open.acknowledged_by, open.acknowledged_at, open.highlighted],
                   [F, 1, TENSION_DEPTH_SENTENCE, V("olive"), "2026-09-29T00:00:00Z", false]);
  assert.deepEqual(open.sides.a, { kind: "claim", text: "A1 says so", source: "SRC-A1", date: "2026-09-01", doctype: "minutes", capture: null });
  assert.equal(open.sides.b.text, "B1 says so");
  assert.deepEqual(open.owner_words, { text: "We know.", by: "the case's owner" });
  assert.equal(t[1].explanation, "Different dates.");
  assert.equal(t[3].kind, "irreconcilable");
  /* beside each member, its attributed sentences */
  const byMember = Object.fromEntries(c.findings.map((f) => [f.bundle_id, f.tensions]));
  assert.deepEqual(byMember[F].map((s) => [s.candidate, s.template, s.highlighted]),
                   [["c-open", "in_tension", false], ["c-expl", "explained", false]]);
  assert.match(byMember[F][0].sentence, /^In tension, not yet resolved/);
  assert.equal("strength" in c, false, "no case-level strength (R26)");
});

test("R10 DEC-85 a disclosed contradiction with a side the publisher could not see is highlighted, counted, and answers nothing of the unseen record", () => {
  const { w } = published();
  const c = w.op("publishedcase", { id: "CASE-2026-0001" });
  const hid = c.tensions.find((x) => x.candidate === "c-hid");
  assert.deepEqual([hid.unseen_other_side, hid.highlighted, hid.sentence, hid.state], [true, true, TENSION_HIGHLIGHT_SENTENCE, "open"]);
  assert.equal(TENSION_HIGHLIGHT_SENTENCE, "This finding rests on a side in conflict with a record not shown here. The "
    + "record and who holds it are not named.");
  assert.deepEqual(hid.side, { kind: "claim", text: "S5 says so", source: "SRC-S5", date: "2026-09-01", doctype: "minutes", capture: null });
  assert.equal(c.highlighted, 1);
  for (const k of ["sides", "explanation", "kind", "b", "a"]) assert.equal(k in hid, false, `no ${k}`);
  /* The signed bytes are served whole as `document` (here planted with the secret, which case-authoring R33 never
     writes); every answer R10 builds from them carries none of it. */
  const { document: _signed, ...built } = c;
  assert.equal(JSON.stringify(built).includes(SECRET), false, "the unseen record's text, source and explanation never reach R10's answer");
  const gBlock = c.findings.find((f) => f.bundle_id === G).tensions;
  assert.deepEqual(gBlock.map((s) => [s.candidate, s.template, s.highlighted]), [["c-hid", "unseen", true]]);
  /* the same through the reader other modules use */
  assert.equal(caseTensionsOf(w.row(`SELECT text FROM case_documents`).text).highlighted, 1);
});

test("R10 R28 a document before /5 answers `tensions: null` with the sentence that its format predates the disclosure; a /5 document with no readable section is undetermined, never empty", () => {
  const old = published({ tensions: null, format: "bio-case-document/4" }).w.op("publishedcase", { id: "CASE-2026-0001" });
  assert.deepEqual([old.tensions, old.highlighted, old.tensions_detail], [null, null, TENSIONS_PREDATE_SENTENCE]);
  assert.deepEqual(old.findings.map((f) => f.tensions), [null, null]);
  const bare = published({ tensions: null, format: "bio-case-document/5" }).w.op("publishedcase", { id: "CASE-2026-0001" });
  assert.deepEqual([bare.tensions, bare.highlighted, bare.tensions_detail], [null, null, TENSIONS_UNREADABLE_SENTENCE]);
  const none = published({ tensions: { rows: [], sentences: [] } }).w.op("publishedcase", { id: "CASE-2026-0001" });
  assert.deepEqual([none.tensions, none.highlighted, none.findings.map((f) => f.tensions)], [[], 0, [[], []]]);
  assert.equal(caseTensionsOf(null).tensions, null);
  assert.equal(caseTensionsOf("not a document").detail, TENSIONS_PREDATE_SENTENCE);
  /* a ratified bundle in no case discloses nothing, and says so */
  const { w } = published();
  w.signFinding(DOC, { sig: SIG(7) });
  const loose = w.op("publishedcase", { id: DOC });
  assert.deepEqual([loose.caseId, loose.tensions], [null, null]);
  assert.match(loose.tensions_detail, /not a case/);
});

test("R10 the tensions are read from the signed document, never live: what contradiction answers now does not change them", () => {
  const ctr = standIn({ [F]: { ok: true, candidates: [seen("c-new")], truncated: false } });
  const { w } = published({ contradiction: ctr });
  const c = w.op("publishedcase", { id: "CASE-2026-0001" });
  assert.equal(c.tensions.some((x) => x.candidate === "c-new"), false);
  assert.equal(ctr.calls.length, 0, "the public read asks contradiction nothing");
});

test("R50 a tension formed after ratification appears, with its case, edition, member, candidate and state; a disclosed one does not; a disclosed one no longer answered is resolved_since; the signed edition never changes", () => {
  const ctr = standIn({
    [F]: { ok: true, candidates: [seen("c-open"), seen("c-new", "explained_not_shown")], truncated: false },
    [G]: { ok: true, candidates: [], truncated: false },
  });
  const { w, proj, roles } = published({ contradiction: ctr });
  const before = w.row(`SELECT doc_sha, text FROM case_documents`);
  const snap = w.snapshot();
  const r = w.p.caseTensions({ project: proj });
  assert.deepEqual(w.snapshot(), snap, "it writes nothing");
  assert.equal(r.ok, true);
  assert.equal(r.cases.length, 1);
  const one = r.cases[0];
  assert.deepEqual([one.case, one.edition, one.project], ["CASE-2026-0001", 1, proj]);
  assert.deepEqual(one.tensions.map((x) => [x.case, x.edition, x.member, x.candidate, x.state, x.depth]),
                   [["CASE-2026-0001", 1, F, "c-new", "explained_not_shown", 1]]);
  assert.ok(one.tensions[0].a && one.tensions[0].b, "a candidate the owners see whole carries both sides");
  assert.deepEqual(one.resolved_since.map((x) => [x.candidate, x.resolved_since]).sort(),
                   [["c-expl", true], ["c-hid", true], ["c-irr", true], ["c-up", true]]);
  assert.deepEqual(ctr.calls.map((c) => [c.finding, c.sha, c.viewer]), roles.map((x) => [x.target, x.version_sha, V("olive")]),
                   "each member at its pinned sha, under the owner's sight");
  assert.deepEqual(w.row(`SELECT doc_sha, text FROM case_documents`), before, "R24: the edition's bytes are unchanged");
  assert.equal(JSON.stringify(r).match(/"(strength|grade)"/), null, "R26: no strength is composed");
  /* a later edition that discloses it: the tension leaves */
  const pin = { F: w.head(F), G: w.head(G) };
  w.prepare("CASE-2026-0001", 2, { project: proj, roles, tensions: { rows: [{ ...ROWS[0], candidate: "c-new" }, ROWS[0]] } });
  w.signCase("CASE-2026-0001", 2, { project: proj, roster: roster(roles), sig: SIG(22) });
  assert.deepEqual([pin.F, pin.G], [roles[0].version_sha, roles[1].version_sha]);
  w.rows(`UPDATE published_cases SET ratified_at='2026-09-30T00:00:00Z' WHERE edition=2`);
  const later = w.p.caseTensions({ project: proj }).cases[0];
  assert.equal(later.edition, 2);
  assert.deepEqual(later.tensions, []);
  assert.deepEqual(later.resolved_since, []);
});

test("R50 DEC-85 a candidate with a side any of the project's owners may not see is answered as unresolvedRecordOn answers it, with nothing of that side; a project with no owner is read by nobody", () => {
  const ctr = standIn({ [F]: (viewer) => ({ ok: true, truncated: false,
    candidates: [viewer === V("bo") ? unseen("c-x") : seen("c-x")] }) });
  const { w, proj } = published({ contradiction: ctr, tensions: { rows: [], sentences: [] } });
  /* bo becomes a second owner, who may not see one side */
  w.rows(`INSERT INTO project_participants (project_id, member_id, state, owner, owner_order, created, updated)
          VALUES (?, 'bo', 'joined', 1, 9, 't', 't')`, proj);
  const owners = w.membership.projectOwners(proj);
  assert.deepEqual(owners, ["olive", "bo"]);
  const r = w.p.caseTensions({ project: proj }).cases[0];
  const x = r.tensions.find((t) => t.candidate === "c-x");
  assert.deepEqual([x.unseen_other_side, x.side], [true, { kind: "claim", text: "mine" }]);
  for (const k of ["a", "b", "explanation", "kind"]) assert.equal(k in x, false, `no ${k}`);
  assert.deepEqual([...new Set(ctr.calls.map((c) => c.viewer))].sort(), owners.map(V).sort());
  /* no owner: asked with a viewer that sees nothing */
  const ctr2 = standIn();
  const { w: w2, proj: p2 } = published({ contradiction: ctr2, tensions: { rows: [], sentences: [] } });
  w2.rows(`UPDATE project_participants SET owner=0 WHERE project_id=?`, p2);
  const all = w2.p.caseTensions({});
  assert.equal(all.cases[0].project, p2);
  assert.deepEqual([...new Set(ctr2.calls.map((c) => c.viewer))], [""]);
  assert.deepEqual(w2.p.caseTensions({ project: "PROJ-OTHER" }).cases, [], "a case its project does not own is not that project's");
});

test("R50 a member whose read fails, is cut or throws is stated, never dropped, and nothing is called resolved on a partial read; it never throws", () => {
  const ctr = standIn({ [F]: { ok: true, candidates: [], truncated: false, undetermined: true },
                        [G]: { ok: true, candidates: [seen("c-g")], truncated: true } });
  const r = published({ contradiction: ctr }).w.p.caseTensions({});
  const one = r.cases[0];
  assert.deepEqual(one.unread, [{ member: F, undetermined: true }, { member: G, truncated: true }]);
  assert.deepEqual(one.resolved_since, [], "a disclosure is never called resolved on a read not made whole");
  assert.deepEqual(one.tensions.map((t) => t.candidate), ["c-g"]);
  const boom = published({ contradiction: { unresolvedRecordOn() { throw new Error("down"); } } }).w.p.caseTensions({});
  assert.deepEqual(boom.cases[0].unread.map((u) => u.undetermined), [true, true]);
  const worse = published().w;
  worse.rows(`DROP TABLE published_case_members`);
  const out = worse.p.caseTensions({});
  assert.deepEqual([out.ok, out.cases, out.undetermined], [true, [], true]);
});

test("R50 pages by case id after `after`, at most `limit` (1–200, 200 by default), the cursor the last case when more follow; only each case's latest ratified edition", () => {
  const { w, proj, roles } = published({ tensions: { rows: [], sentences: [] } });
  for (let i = 2; i <= 4; i++) {
    const id = `CASE-2026-000${i}`;
    w.prepare(id, 1, { project: proj, roles, tensions: { rows: [], sentences: [] } });
    w.signCase(id, 1, { project: proj, roster: roster(roles), sig: SIG(30 + i) });
  }
  w.rows(`UPDATE published_cases SET ratified_at='2026-09-30T00:00:00Z'`);
  const all = w.p.caseTensions({});
  assert.deepEqual([all.cases.map((c) => c.case), all.limit, all.cursor],
                   [["CASE-2026-0001", "CASE-2026-0002", "CASE-2026-0003", "CASE-2026-0004"], CASE_TENSIONS_MAX, null]);
  assert.equal(CASE_TENSIONS_MAX, 200);
  const p1 = w.p.caseTensions({ limit: 2 });
  assert.deepEqual([p1.cases.map((c) => c.case), p1.cursor], [["CASE-2026-0001", "CASE-2026-0002"], "CASE-2026-0002"]);
  const p2 = w.p.caseTensions({ limit: 2, after: p1.cursor });
  assert.deepEqual([p2.cases.map((c) => c.case), p2.cursor], [["CASE-2026-0003", "CASE-2026-0004"], null]);
  assert.equal(w.p.caseTensions({ limit: 0 }).limit, CASE_TENSIONS_MAX);
  assert.equal(w.p.caseTensions({ limit: -5 }).limit, 1);
  assert.equal(w.p.caseTensions({ limit: 999 }).limit, CASE_TENSIONS_MAX);
  assert.equal(w.p.caseTensions({ limit: "x" }).limit, CASE_TENSIONS_MAX);
  /* an unratified edition is not the latest ratified one */
  w.prepare("CASE-2026-0001", 2, { project: proj, roles, tensions: { rows: [], sentences: [] } });
  w.signCase("CASE-2026-0001", 2, { project: proj, roster: roster(roles), sig: SIG(50) });
  w.rows(`UPDATE published_cases SET ratified_at=NULL WHERE case_id='CASE-2026-0001' AND edition=2`);
  assert.equal(w.p.caseTensions({ limit: 1 }).cases[0].edition, 1);
});
