/* public-read — the tensions a published case disclosed (R3's `tensions`, with DEC-85's highlight; R13 for a document
   before /5). Copied from `test/m/publication/tensions.test.mjs`' R10 arms (publication R10 is this module's R3, K651)
   and renamed; driven through this module's `publishedcase` op. The section is written as case-authoring writes it (its
   R14, R31). `contradiction` R29 is a stand-in: R3 reads the signed document and never asks it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, SIG } from "./fixture.mjs";
import { TENSION_STATE_WORDS, TENSION_HIGHLIGHT_SENTENCE, TENSIONS_PREDATE_SENTENCE, TENSIONS_UNREADABLE_SENTENCE,
         TENSION_DEPTH_SENTENCE, caseTensionsOf } from "../../../src/case-grammar/index.mjs";
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


test("R3 a /5 document's tension section round-trips to `tensions`: each disclosed contradiction with its finding, both sides, its state in words, the explanation, who acknowledged it and when, depth 1 with its sentence", () => {
  const { w } = published();
  const c = w.read("publishedcase", { id: "CASE-2026-0001" });
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

test("R3 DEC-85 a disclosed contradiction with a side the publisher could not see is highlighted, counted, and answers nothing of the unseen record", () => {
  const { w } = published();
  const c = w.read("publishedcase", { id: "CASE-2026-0001" });
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

test("R3 R13 a document before /5 answers `tensions: null` with the sentence that its format predates the disclosure; a /5 document with no readable section is undetermined, never empty", () => {
  const old = published({ tensions: null, format: "bio-case-document/4" }).w.read("publishedcase", { id: "CASE-2026-0001" });
  assert.deepEqual([old.tensions, old.highlighted, old.tensions_detail], [null, null, TENSIONS_PREDATE_SENTENCE]);
  assert.deepEqual(old.findings.map((f) => f.tensions), [null, null]);
  const bare = published({ tensions: null, format: "bio-case-document/5" }).w.read("publishedcase", { id: "CASE-2026-0001" });
  assert.deepEqual([bare.tensions, bare.highlighted, bare.tensions_detail], [null, null, TENSIONS_UNREADABLE_SENTENCE]);
  const none = published({ tensions: { rows: [], sentences: [] } }).w.read("publishedcase", { id: "CASE-2026-0001" });
  assert.deepEqual([none.tensions, none.highlighted, none.findings.map((f) => f.tensions)], [[], 0, [[], []]]);
  assert.equal(caseTensionsOf(null).tensions, null);
  assert.equal(caseTensionsOf("not a document").detail, TENSIONS_PREDATE_SENTENCE);
  /* a ratified bundle in no case discloses nothing, and says so */
  const { w } = published();
  w.signFinding(DOC, { sig: SIG(7) });
  const loose = w.read("publishedcase", { id: DOC });
  assert.deepEqual([loose.caseId, loose.tensions], [null, null]);
  assert.match(loose.tensions_detail, /not a case/);
});

test("R3 K499 the member legs the conflict read could not examine are carried as the document states them; none is an empty list, and a document silent about them states null", () => {
  const unread = [{ target: F, legs: 2 }];
  const c = published({ tensions: { rows: ROWS, sentences: SENTENCES, unread } }).w.read("publishedcase", { id: "CASE-2026-0001" });
  assert.deepEqual(c.tensions_unread, [{ member: F, legs: 2 }]);
  const none = published({ tensions: { rows: [], sentences: [], unread: [] } }).w.read("publishedcase", { id: "CASE-2026-0001" });
  assert.deepEqual(none.tensions_unread, []);
  const silent = published().w.read("publishedcase", { id: "CASE-2026-0001" });
  assert.equal(silent.tensions_unread, null);
  const old = published({ tensions: null, format: "bio-case-document/4" }).w.read("publishedcase", { id: "CASE-2026-0001" });
  assert.equal(old.tensions_unread, null);
});

test("R3 the tensions are read from the signed document, never live: what contradiction answers now does not change them", () => {
  const ctr = standIn({ [F]: { ok: true, candidates: [seen("c-new")], truncated: false } });
  const { w } = published({ contradiction: ctr });
  const c = w.read("publishedcase", { id: "CASE-2026-0001" });
  assert.equal(c.tensions.some((x) => x.candidate === "c-new"), false);
  assert.equal(ctr.calls.length, 0, "the public read asks contradiction nothing");
});

