/* public-read — R3's `what_changed` (DEC-101; Publication §5A) and `lens` (DEC-103), read from the signed document
   through `case-grammar`'s readers (its R8, R9), never live. Every document here is written with `case-grammar`'s own
   line builders (`whatChangedBlockLines`, `whatChangedSectionLines`, `lensBlockLines`, `lensSectionLines`), as
   case-authoring writes them, into the fixture's /5 document; each claim has its negative control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, caseDoc, inquiryMd, V, NOW } from "./fixture.mjs";
import { whatChangedBlockLines, whatChangedSectionLines, lensBlockLines, lensSectionLines, LENS_CLOSING_SENTENCES,
         LENS_HEAD } from "../../../src/case-grammar/index.mjs";
import { LENS_FINGERPRINT_SENTENCE, LENS_NONE_IN_FORCE_SENTENCE, LENS_NO_DOCUMENT_SENTENCE,
         LENS_FINGERPRINT_UNDETERMINED_SENTENCE }
  from "../../../src/public-read/index.mjs";

const CASE = "CASE-2026-0001", F = "INQ-2026-0001", DOC = "INFO-2026-0001-minutes", BIAS = "BIAS-2026-0001";
const FP = "a".repeat(64);
const ACK = "We are a parks group and read the city's minutes with that in mind.";
const SECRET = "WITHHELD-CITATION-NAME";
const STATEMENTS = [
  { bundle: BIAS, id: "s1", kind: "scrutiny", subject: "the city's press office", text: "We check its releases twice.",
    justification: "Two releases were corrected after publication.",
    citations: ["INFO-2026-0009", { citation: SECRET, printed: false }, { citation: "INFO-2026-0010", printed: true }] },
  { bundle: BIAS, id: "s2", kind: "inference", subject: "budget lines", text: "We do not infer intent from a cut.",
    justification: "A cut has many causes.", citations: [{ citation: `${SECRET}-2` }] },
];
const STMT = (n) => `Edition ${n} re-pins the finding after the minutes were corrected.`;

/* The fixture's /5 document with the blocks inserted before its closing fence and the sections at the top of its
   body, as `case-authoring` places them (DEC-101: the statement at the top). */
function docWith(caseId, edition, opts, { whatChanged = null, lens = null, manifest = null } = {}) {
  const text = caseDoc(caseId, edition, { ...opts, format: "bio-case-document/5" });
  const lines = text.split("\n");
  const close = lines.indexOf("---", 1);
  const fm = [`bias_acknowledgement: "${ACK}"`,
    ...(manifest ? ["bias_manifest:", `  in_force: ${manifest.in_force}`, `  statements_sha: ${manifest.sha ?? "null"}`] : []),
    ...(whatChanged ? whatChangedBlockLines(whatChanged) : []),
    ...(lens ? lensBlockLines(lens.statements) : [])];
  const body = [...(whatChanged ? ["", ...whatChangedSectionLines(whatChanged.statement)] : []),
    ...(lens ? ["", ...lensSectionLines({ acknowledgement: ACK, statements: lens.statements, inForce: lens.inForce ?? true })] : [])];
  return [...lines.slice(0, close), ...fm, "---", ...body, ...lines.slice(close + 1)].join("\n");
}

/* Case editions 1..n over F, each signed and published; `per(edition)` gives that edition's blocks. */
function published(n, per) {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.doc(DOC);
  w.inquiry(F, { legs: [{ target: DOC }] });
  for (let ed = 1; ed <= n; ed++) {
    if (ed > 1) assert.equal(w.promote(F, inquiryMd(F, { question: `Is it answered, edition ${ed}?`, legs: [{ target: DOC }] })).ok, true);
    const pin = w.head(F);
    const text = docWith(CASE, ed, { project: proj, roles: [{ target: F, version_sha: pin, ...(ed > 1 ? { edition: ed } : {}) }] }, per(ed));
    const stored = w.p.storeCaseDocument({ case: CASE, edition: ed, text, author: V("olive"), at: NOW });
    assert.equal(stored.ok, true, JSON.stringify(stored));
    assert.equal(w.signCase(CASE, ed, { project: proj, roster: [{ bundle_id: F, version_sha: pin, role: "load_bearing" }] }).ok, true);
    const signed = w.signFinding(F, { edition: ed });
    assert.equal(signed.ok, true, JSON.stringify(signed).slice(0, 300));
  }
  return w;
}
const both = (ed) => ({ whatChanged: ed > 1 ? { statement: STMT(ed), began_as: "member" } : null,
                        lens: { statements: STATEMENTS }, manifest: { in_force: true, sha: FP } });
const read = (w, edition = null) => w.read("publishedcase", { id: CASE, ...(edition ? { edition } : {}) });

test("R3 a /5 edition 2 with both blocks answers `what_changed` at the top and `lens` as signed, through case-grammar's readers", () => {
  const w = published(2, both);
  const c = read(w, 2);
  assert.equal(c.ok, true);
  assert.deepEqual(c.what_changed, { statement: STMT(2), began_as: "member", draft: null, adopted_as_drafted: null });
  assert.deepEqual(Object.keys(c).slice(0, 6), ["ok", "caseId", "edition", "withdrawn", "docket_last_entry", "what_changed"],
                   "at the top of the answer, beside R20's withdrawal stamp and the docket's last date");
  assert.equal(c.lens.bias_acknowledgement, ACK, "the acknowledgement first");
  assert.deepEqual(c.lens.statements.map((s) => [s.id, s.kind, s.subject, s.text, s.justification, s.citations, s.withheld]), [
    ["s1", "scrutiny", "the city's press office", "We check its releases twice.",
     "Two releases were corrected after publication.", ["INFO-2026-0009", "INFO-2026-0010"], 1],
    ["s2", "inference", "budget lines", "We do not infer intent from a cut.", "A cut has many causes.", [], 1]],
    "each statement with its justification, its printed citations and its withheld count, in the document's order");
  assert.deepEqual(c.lens.closing, [...LENS_CLOSING_SENTENCES], "then the two sentences the document prints");
  /* The print form is the signed body section, whole: exactly the lines case-grammar wrote. */
  const section = lensSectionLines({ acknowledgement: ACK, statements: STATEMENTS, inForce: true }).join("\n").replace(/\s+$/, "");
  assert.equal(c.lens.print, section);
  assert.ok(c.lens.print.startsWith(LENS_HEAD));
  assert.ok(c.document.text.includes(c.lens.print), "the section as the signed bytes hold it");
  assert.equal(c.lens_fingerprint, null);
  assert.equal(c.lens_detail, null);
  /* a statement begun as a machine draft says so, and whether it was adopted as drafted */
  const d = read(published(2, (ed) => ({ ...both(ed), whatChanged: ed > 1
    ? { statement: STMT(ed), began_as: "machine_draft", draft: "DRAFT-7", adopted_as_drafted: true } : null })), 2);
  assert.deepEqual(d.what_changed, { statement: STMT(2), began_as: "machine_draft", draft: "DRAFT-7", adopted_as_drafted: true });
  const r = read(published(2, (ed) => ({ ...both(ed), whatChanged: ed > 1
    ? { statement: STMT(ed), began_as: "machine_draft", draft: "DRAFT-7", adopted_as_drafted: false } : null })), 2);
  assert.equal(r.what_changed.adopted_as_drafted, false);
});

test("R3 `what_changed` and `lens` are read from the signed document, never live: changing the lens's record and the case's state after signing leaves the answer byte-identical", () => {
  const w = published(2, both);
  const before = JSON.stringify(read(w, 2));
  /* the working record changes under the lens's statements (a record appears at their bundle id), and the case's
     published acknowledgement row is rewritten: neither is what the edition signed */
  assert.equal(w.doc(BIAS).ok, true);
  assert.notEqual(w.head(BIAS), null, "negative control: the record did change");
  w.st.sql.exec(`UPDATE published_cases SET bias_acknowledgement='CHANGED LIVE' WHERE case_id=?`, CASE);
  const after = read(w, 2);
  const { bias_acknowledgement: _live, ...a } = after;
  const { bias_acknowledgement: _was, ...b } = JSON.parse(before);
  assert.equal(after.bias_acknowledgement, "CHANGED LIVE", "negative control: the live column did change");
  assert.equal(JSON.stringify(a), JSON.stringify(b), "the answer, the lens and the statement with it, is unchanged");
  assert.equal(after.lens.bias_acknowledgement, ACK);
});

test("R3 edition 1 answers no statement; an edition with a successor quotes the successor's statement beside its pointer, and the latest edition quotes none", () => {
  const w = published(3, both);
  const e1 = read(w, 1), e2 = read(w, 2), e3 = read(w, 3);
  assert.equal(e1.what_changed, null, "edition 1 states no statement");
  assert.deepEqual(e1.successor, { edition: 2, statement: STMT(2) });
  assert.equal(e2.what_changed.statement, STMT(2));
  assert.deepEqual(e2.successor, { edition: 3, statement: STMT(3) }, "the next edition's, not its own nor the latest's");
  assert.equal(e3.what_changed.statement, STMT(3));
  assert.equal(e3.successor, null, "the latest edition quotes none");
  assert.equal(e3.latest_edition, 3);
  /* edition 1's own document is not asked for a statement even when it carries one */
  const odd = published(2, (ed) => ({ ...both(ed), whatChanged: { statement: STMT(ed), began_as: "member" } }));
  assert.equal(read(odd, 1).what_changed, null);
  assert.equal(read(odd, 2).what_changed.statement, STMT(2));
});

test("R3 R13 a document without the \"What changed\" block answers `what_changed: null`, nothing filled in; a successor without one is quoted as null", () => {
  const w = published(2, (ed) => ({ ...both(ed), whatChanged: null }));
  const e2 = read(w, 2);
  assert.equal(e2.what_changed, null);
  assert.deepEqual(read(w, 1).successor, { edition: 2, statement: null });
  /* a block whose hash the section does not match states the statement undetermined (case-grammar R8), never fills it */
  const t = published(2, both);
  const row = t.row(`SELECT text FROM case_documents WHERE case_id=? AND edition=2`, CASE);
  t.st.sql.exec(`UPDATE case_documents SET text=? WHERE case_id=? AND edition=2`,
                row.text.replace(STMT(2), "Edited after signing."), CASE);
  assert.equal(read(t, 2).what_changed.statement, null);
});

test("R3 DEC-103 a document without the lens blocks answers `lens: null`, says it carries only the lens's fingerprint, and gives the manifest's fingerprint", () => {
  const w = published(2, (ed) => ({ ...both(ed), lens: null }));
  const c = read(w, 2);
  assert.deepEqual([c.lens, c.lens_fingerprint, c.lens_detail], [null, FP, LENS_FINGERPRINT_SENTENCE]);
  assert.match(LENS_FINGERPRINT_SENTENCE, /carries only the lens's fingerprint/);
  /* a manifest that states none was in force has no fingerprint to give, and says so */
  const none = read(published(1, () => ({ manifest: { in_force: false, sha: null } })), 1);
  assert.deepEqual([none.lens, none.lens_fingerprint, none.lens_detail], [null, null, LENS_NONE_IN_FORCE_SENTENCE]);
  /* a document whose manifest states no readable fingerprint says it is undetermined (R13), never fills one */
  const bare = read(published(1, () => ({})), 1);
  assert.deepEqual([bare.lens, bare.lens_fingerprint, bare.lens_detail], [null, null, LENS_FINGERPRINT_UNDETERMINED_SENTENCE]);
  /* negative control: with the blocks, the fingerprint is not offered in place of the lens */
  const full = read(published(1, both), 1);
  assert.notEqual(full.lens, null);
  assert.equal(full.lens_fingerprint, null);
  /* a document with no manifest in force but the blocks written says so in the signed section, whole */
  const empty = read(published(1, () => ({ lens: { statements: [], inForce: false }, manifest: { in_force: false } })), 1);
  assert.deepEqual(empty.lens.statements, []);
  assert.match(empty.lens.print, /No manifest was in force/);
  assert.deepEqual(empty.lens.closing, [...LENS_CLOSING_SENTENCES]);
  /* a ratified bundle in no case states no lens and no statement */
  w.signFinding(DOC);
  const loose = w.read("publishedcase", { id: DOC });
  assert.deepEqual([loose.caseId, loose.what_changed, loose.successor, loose.lens, loose.lens_fingerprint, loose.lens_detail],
                   [null, null, null, null, null, LENS_NO_DOCUMENT_SENTENCE]);
});

test("R3 DEC-103 a withheld citation is counted and named nowhere in the answer", () => {
  const w = published(2, both);
  const c = read(w, 2);
  assert.deepEqual(c.lens.statements.map((s) => s.withheld), [1, 1]);
  const { document: signed, ...built } = c;
  assert.equal(signed.text.includes(SECRET), false, "case-grammar never writes it into the signed bytes");
  assert.equal(JSON.stringify(built).includes(SECRET), false, "and the answer names it nowhere");
  assert.match(c.lens.print, /Citations withheld: 1 \(which ones is not stated\)/);
});
