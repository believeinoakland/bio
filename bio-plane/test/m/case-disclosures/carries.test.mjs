/* case-disclosures (DEC-112 (3)(4)(5), DEC-119; DEC-96 item 4): what a case carries — the method it is signed under
   (R5), every document and observation its findings reach with what this copy holds whole (R6) and who attests it
   (R7), the terms (R8), off-the-record material presentable like any other (R9) with its attesting member stated at
   their level (R10), a chain stopping at another group's finding (R12), each reached finding's grading facts and
   passages (R15), no case-level strength (R19) and nothing composed (R20). At this module's interface:
   `materialsJudged`, `disclosureBlocks`, `findingFacts`, `methodOf`, `carriesBodyLines`. Ported from case-authoring's
   `carries` and `rests` arms (N529). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, T0, sha } from "./fixture.mjs";
import { CASE_DISCLOSURE_CHECKS, carriesBodyLines, chainsOf, materialHeld, materialRows } from "../../../src/case-disclosures/index.mjs";
import { GRADING_METHOD_VERSION, DEPTH_BOUND, recomputePair } from "../../../src/strength/index.mjs";
import { CATALOG_VERSION } from "../../../src/promotion/index.mjs";
import { canonicalJson } from "../../../src/record-grammar/index.mjs";
import { CASE_DOCUMENT_FORMAT, extractedTextOf, materialBlockLines, methodBlockLines, materialsOf, methodOf, GRADING_FACT_FIELDS,
         gradingFactsLines, passagesLines, gradingFactsOf, passagesOf } from "../../../src/case-grammar/index.mjs";

const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b";
const Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-q", Q3 = "INQ-2026-0003-q";
const CO_ATTESTED = { attestations: [{ kind: "rfc3161", service: "tsa.example", file: "snapshots/timestamp-abc.tsr",
                                       sha256: "d".repeat(64) }],
                      co_archive: { service: "archive.example", locator: "https://archive.example/web/x" } };
const AT = "2026-09-28T01:00:00Z";
/* A case document's front matter of `lines`, at the format that requires the DEC-112 blocks. */
const fmOf = (w, lines) => w.fm(["---", `format: ${CASE_DOCUMENT_FORMAT}`, ...lines, "---", ""].join("\n"));
const textSha = (bundle) => sha(canonicalJson([{ extent: { kind: "doc-para", para: 1 }, ref: "paragraph 1",
                                                 text: `the text of ${bundle}` }]));
const account = (w, capture, text = "I saved it myself.") => w.st.sql.exec(`INSERT INTO capture_accounts (capture_sha, seq,
  by, text, signature, key_b64, at) VALUES (?, 1, 'alice', ?, 'SIG-of-alice-7f3', 'AAAA', ?)`, capture, text, "2026-09-27T12:00:00Z");
function refused(r, code) {
  assert.equal(r.ok, false, JSON.stringify(r).slice(0, 400));
  assert.deepEqual([r.reason, r.code, r.check, r.translation],
    [code, code, CASE_DISCLOSURE_CHECKS[code].check, CASE_DISCLOSURE_CHECKS[code].translation]);
}
function setup() { const w = world(); for (const m of ["alice", "bo"]) w.member(m); return w; }
const judged = (w, members, supporting = [], viewer = V("alice")) => w.cd.materialsJudged(w.prepared(members), w.roles(members, supporting), viewer);
/* What `publishCase` asks after its last refusal, in its order: R4's sources, then the blocks. */
function blocks(w, members, { attributionOf = new Map(), project = "PROJ-x", supporting = [] } = {}) {
  const reached = judged(w, members, supporting);
  const docs = reached.materials.filter((m) => m.kind === "document").map((m) => m.sha);
  const withheld = w.cd.withheldOf(w.cd.sourcesStated(docs, V("alice")));
  return { reached, withheld, out: w.cd.disclosureBlocks({ reached, withheld, attributionOf, project, author: "alice", at: AT }) };
}

test("R5: methodOf answers strength's GRADING_METHOD_VERSION and promotion's CATALOG_VERSION at the call, which case-grammar's methodBlockLines and carriesBodyLines write inside the signed bytes", () => {
  const w = world();
  const m = w.cd.methodOf();
  assert.deepEqual(m, { grading: GRADING_METHOD_VERSION, checks: CATALOG_VERSION });
  const fm = fmOf(w, methodBlockLines(m));
  assert.deepEqual(methodOf(fm), m);
  const body = carriesBodyLines(m, { rows: [], attestations: [] }, "g").join("\n");
  assert.ok(body.includes(`by the grading method ${GRADING_METHOD_VERSION}, and the case was checked under the publication checks ${CATALOG_VERSION}.`));
  assert.ok(carriesBodyLines(null, { rows: [] }, null).join("\n").includes("grading method (not stated)"));
});

test("R6, R7: materialsJudged lists every document a member's chain reaches with what this copy holds — bytes and extracted text, its fingerprint — included when whole; material only a supporting member reaches, not held whole, is listed included: false and never refused", () => {
  const w = setup();
  const a = w.doc(DOC, CO_ATTESTED, { receipt: true }), b = w.doc(DOC2, {}, { indexed: false });
  w.finding(Q, [{ target: DOC }]);
  w.finding(Q2, [{ target: DOC2 }]);
  const r = judged(w, [Q, Q2], [Q2]);
  assert.deepEqual(r.refusals, []);
  assert.deepEqual(r.materials.map((m) => [m.ref, m.kind, m.sha, m.members, m.rests_under, m.included, m.held]), [
    [DOC, "document", a, [Q], "load_bearing", true, { bytes: true, text: true, text_sha: textSha(DOC), whole: true, missing: [] }],
    [DOC2, "document", b, [Q2], "supporting", false, { bytes: true, text: false, text_sha: null, whole: false, missing: ["extracted_text"] }]]);
  assert.deepEqual([r.refs, r.findings], [[], [{ id: Q, member: Q }, { id: Q2, member: Q2 }]]);
  const { out } = blocks(w, [Q, Q2], { supporting: [Q2] });
  assert.deepEqual(out.materials.rows, [
    { ref: DOC, kind: "document", sha: a, text_sha: textSha(DOC), origin: `https://example.org/${DOC}`,
      archived_copy: "https://archive.example/web/x", included: true, rests_under: "load_bearing" },
    { ref: DOC2, kind: "document", sha: b, text_sha: null, origin: null, archived_copy: null, included: false, rests_under: "supporting" }]);
  /* read back through case-grammar's one reader */
  const fm = fmOf(w, materialBlockLines({ materials: out.materials.rows, attestations: out.materials.attestations }));
  assert.deepEqual(materialsOf(fm).materials, out.materials.rows);
  const body = carriesBodyLines(w.cd.methodOf(), out.materials, out.group).join("\n");
  assert.ok(body.includes("## What This Case Carries"));
  assert.ok(body.includes(`- ${DOC2}, a document, fingerprint ${b}: NOT INCLUDED`));
  assert.ok(body.includes(`- ${DOC}, a document, fingerprint ${a}: travels whole with this case; relied on by a load-bearing finding`));
});

test("R6 (C-120.8): a load-bearing member resting on material not held whole — text not indexed, indexed in part, a unit cut, or its bytes gone — is RELIED_ON_NOT_PRESENTABLE, naming each member and material and what it lacks; it writes nothing", () => {
  for (const [why, lacks, spoil] of [
    ["not indexed", ["extracted_text"], () => {}],
    ["partial", ["extracted_text"], (w, c) => w.indexText(c, DOC2, [{ text: "half" }], "partial")],
    ["a unit cut", ["extracted_text"], (w, c) => w.indexText(c, DOC2, [{ text: "cut", truncated: true }])],
    ["bytes gone", ["bytes"], (w, c) => { w.indexText(c, DOC2); w.st.sql.exec(`DELETE FROM files WHERE bundle_id=? AND path='snapshots/c0.txt'`, DOC2); }],
  ]) {
    const w = setup();
    w.doc(DOC);
    const c = w.doc(DOC2, {}, { indexed: false });
    spoil(w, c);
    w.finding(Q, [{ target: DOC }, { target: DOC2 }]);
    const before = w.snapshot();
    const r = judged(w, [Q]);
    assert.equal(r.refusals.length, 1, why);
    refused(r.refusals[0], "RELIED_ON_NOT_PRESENTABLE");
    assert.deepEqual(r.refusals[0].not_presentable, [{ target: Q, materials: [{ ref: DOC2, kind: "document", sha: c, missing: lacks }] }], why);
    assert.deepEqual(w.snapshot(), before, `${why}: nothing written`);
  }
  /* negative control: the same material under a supporting member only */
  const w = setup(); w.doc(DOC); w.doc(DOC2, {}, { indexed: false });
  w.finding(Q, [{ target: DOC }]); w.finding(Q2, [{ target: DOC2 }]);
  assert.deepEqual(judged(w, [Q, Q2], [Q2]).refusals, []);
  refused(judged(w, [Q2]).refusals[0], "RELIED_ON_NOT_PRESENTABLE");
});

test("R8: a chain reaches what its legs target, through inquiry legs, to strength's depth bound and no further, as the viewer sees the record; findings lists every inquiry reached, members first", () => {
  const w = setup();
  w.doc(DOC);
  const c = w.doc(DOC2, {}, { indexed: false });
  w.finding(Q3, [{ target: DOC2 }]);
  w.finding(Q2, [{ target: Q3 }]);
  w.finding(Q, [{ target: DOC }, { target: Q2 }]);
  const r = judged(w, [Q]);
  assert.deepEqual(r.refusals[0].not_presentable[0].materials.map((m) => m.sha), [c], "two inquiries down");
  assert.deepEqual(r.findings, [{ id: Q, member: Q }, { id: Q2, member: Q }, { id: Q3, member: Q }]);
  assert.equal(DEPTH_BOUND, 6);
  const ids = Array.from({ length: DEPTH_BOUND + 1 }, (_, i) => `INQ-2026-01${String(i).padStart(2, "0")}-d`);
  const deep = (n) => {
    const x = setup(); x.doc(DOC); x.doc(DOC2, {}, { indexed: false });
    x.finding(ids[n], [{ target: DOC2 }]);
    for (let i = n - 1; i >= 0; i--) x.finding(ids[i], [{ target: DOC }, { target: ids[i + 1] }]);
    return judged(x, [ids[0]]);
  };
  assert.deepEqual(deep(DEPTH_BOUND).refusals, [], `the document ${DEPTH_BOUND + 1} inquiries down is past the bound`);
  refused(deep(DEPTH_BOUND - 1).refusals[0], "RELIED_ON_NOT_PRESENTABLE");
  /* a target the viewer may not see is not followed and not listed */
  const h = setup();
  h.doc(DOC);
  const H = h.project("Hidden", "bo", []);
  h.finding(Q, [{ target: DOC }]);
  h.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, H, DOC);
  assert.deepEqual(judged(h, [Q], [], V("bo")).materials.map((m) => m.ref), [DOC], "bo sees H's document");
  assert.deepEqual(judged(h, [Q], [], V("alice")).materials, [], "alice does not: not followed, not listed (R17)");
  void T0;
});

test("R7: material_attestations states, per material, the attesting member's signed accounts at their named level, its co-attestation (timestamp and co-archive), the project's register row, and the group's own row signed 'case'; no table is added", () => {
  const w = setup();
  const a = w.doc(DOC, CO_ATTESTED, { receipt: true });
  account(w, a);
  w.finding(Q, [{ target: DOC }]);
  const tables = w.rows(`SELECT name FROM sqlite_master WHERE type='table'`).length;
  const before = w.snapshot();
  const { out } = blocks(w, [Q], { project: "PROJ-team" });
  const reg = w.row(`SELECT bundle_id, registered FROM register WHERE capture_sha=?`, a);
  const ts = w.cd.captureFacts(a).timestamp_at;
  assert.deepEqual(out.materials.attestations, [
    { ref: DOC, by_kind: "member", by: "alice", level: "name", at: "2026-09-27T12:00:00Z", signature: "SIG-of-alice-7f3", recorded_in: null },
    ...(ts ? [{ ref: DOC, by_kind: "co_attestation", by: "timestamp", level: null, at: ts, signature: null, recorded_in: null }] : []),
    { ref: DOC, by_kind: "co_attestation", by: "https://archive.example/web/x", level: null, at: null, signature: null, recorded_in: null },
    { ref: DOC, by_kind: "project", by: "PROJ-team", level: null, at: reg.registered, signature: null, recorded_in: reg.bundle_id },
    { ref: DOC, by_kind: "group", by: "test-group", level: null, at: AT, signature: "case", recorded_in: null }]);
  assert.equal(out.group, "test-group");
  assert.equal(w.rows(`SELECT name FROM sqlite_master WHERE type='table'`).length, tables, "no new table");
  assert.deepEqual(w.snapshot(), before, "nothing written");
  const body = carriesBodyLines(w.cd.methodOf(), out.materials, out.group).join("\n");
  for (const s of ["  - Attested: test-group vouches for it by signing this case.", `  - Attested: the record of PROJ-team holds it, registered ${reg.registered}, in ${reg.bundle_id}.`,
                   "  - Attested: a third party's co-archive at https://archive.example/web/x.",
                   "  - Attested: alice, credited at the name level as they chose, on 2026-09-27T12:00:00Z, with their signature."])
    assert.ok(body.includes(s), s);
  /* no producing group: the group row names none, and the words say "the group" */
  const g = world({ deps: { promotion: { fact: () => ({ ok: false, reason: "NO_SUCH_FACT" }) } } });
  g.member("alice"); g.doc(DOC); g.finding(Q, [{ target: DOC }]);
  const og = blocks(g, [Q]).out;
  assert.deepEqual([og.group, og.materials.attestations.at(-1).by], [null, null]);
  assert.ok(carriesBodyLines(null, og.materials, og.group).join("\n").includes("the group vouches for it by signing this case"));
});

test("R7, R8: an observation a chain reaches (a member's authored words, provenance R48's `authored`) is a material of kind observation, held whole by its own bytes, its member row from the attribution the caller hands", () => {
  const w = setup();
  w.doc(DOC);
  w.st.sql.exec(`UPDATE register SET authored=1 WHERE bundle_id=?`, DOC);
  w.finding(Q, [{ target: DOC }]);
  const r = judged(w, [Q]);
  assert.deepEqual(r.materials.map((m) => [m.kind, m.held]), [["observation", { bytes: true, text: true, text_sha: null, whole: true, missing: ["text"].slice(1) }]]);
  const attributionOf = new Map([[DOC, { observation: DOC, level: "name", shown: "alice" }]]);
  const { out } = blocks(w, [Q], { attributionOf });
  assert.deepEqual(out.materials.attestations[0], { ref: DOC, by_kind: "member", by: "alice", level: "name", at: null, signature: null, recorded_in: null });
  assert.equal(out.materials.rows[0].text_sha, null);
  const none = blocks(w, [Q]).out.materials.attestations[0];
  assert.deepEqual([none.by, none.level], [null, null], "no attribution: nobody named");
  assert.ok(carriesBodyLines(null, blocks(w, [Q]).out.materials, "g").join("\n")
    .includes("a member who has not yet chosen how they are credited, so not named"));
});

test("R9, R10: off-the-record material (a knocker's capture stated Withheld) is presentable like any other — included, never refused — its origin not stated, and its attesting member's row and account carry the account's text only, never their handle or signature, until they choose cover or name", () => {
  const w = setup();
  const k = w.doc(DOC, CO_ATTESTED);
  w.knocked(k);
  account(w, k, "Handed to me at the door.");
  w.finding(Q, [{ target: DOC }]);
  const prep = w.prepared([Q]);
  const reached = judged(w, [Q]);
  assert.deepEqual([reached.refusals, reached.materials[0].included], [[], true], "never refused because it is off-the-record");
  const withheld = w.cd.withheldOf(w.cd.sourcesStated([k], V("alice")));
  assert.deepEqual([...withheld], [k]);
  const resting = w.cd.restingCaptures(prep);
  const facts = new Map([[k, w.cd.captureFacts(k)]]);
  for (const level of [null, "group", "project"]) {
    const attributionOf = new Map(level ? [[k, { capture: k, level, shown: null }]] : []);
    const out = w.cd.disclosureBlocks({ resting, facts: new Map(facts), reached, withheld, attributionOf, project: "P", author: "alice", at: AT });
    assert.equal(out.materials.rows[0].origin, null, "no knock address, no origin");
    assert.deepEqual(out.materials.attestations.filter((x) => x.by_kind === "member"),
      [{ ref: DOC, by_kind: "member", by: null, level, at: "2026-09-27T12:00:00Z", signature: null, recorded_in: null }], String(level));
    assert.deepEqual(out.captures[0].accounts, [{ by: null, at: "2026-09-27T12:00:00Z", text: "Handed to me at the door.", signature: null }]);
    assert.equal(out.captures[0].grade, w.prov.captureGrade(k).grade, "the grade as recorded");
    const said = JSON.stringify(out) + carriesBodyLines(null, out.materials, out.group).join("\n");
    for (const leak of ["SIG-of-alice-7f3", "AAAA", "h_alice", "\"alice\""]) assert.equal(said.includes(leak), false, `${level}: names ${leak}`);
  }
  for (const level of ["cover", "name"]) {
    const attributionOf = new Map([[k, { capture: k, level, shown: level === "name" ? "alice" : "Cover alice" }]]);
    const out = w.cd.disclosureBlocks({ resting, facts: new Map(facts), reached, withheld, attributionOf, project: "P", author: "alice", at: AT });
    assert.deepEqual(out.materials.attestations.filter((x) => x.by_kind === "member").map((x) => [x.by, x.level, x.signature]),
      [[level === "name" ? "alice" : "Cover alice", level, "SIG-of-alice-7f3"]]);
    assert.equal(out.captures[0].accounts[0].signature, "SIG-of-alice-7f3");
    assert.equal(out.materials.rows[0].origin, null, "its origin is still not stated");
  }
  /* an off-the-record capture with no account: one row for the member, at their level, naming nobody */
  const x = setup(); const k2 = x.doc(DOC); x.knocked(k2); x.finding(Q, [{ target: DOC }]);
  const o2 = blocks(x, [Q]).out;
  assert.deepEqual(o2.materials.attestations.filter((a) => a.by_kind === "member"),
    [{ ref: DOC, by_kind: "member", by: null, level: null, at: null, signature: null, recorded_in: null }]);
});

test("R12: a chain stops at a leg on another group's finding — none of that group's material is asked of this copy — and the leg is answered in refs", () => {
  const w = setup();
  w.doc(DOC);
  w.imports.edition("a".repeat(64), 2, { findings: [{ finding: "INQ-2026-0042-x", result: "recreated" }] });
  const ref = w.imports.accept("a".repeat(64), 2, "INQ-2026-0042-x");
  w.finding(Q, [{ target: DOC }, { target: ref, target_edition: 2 }]);
  w.finding(Q2, [{ target: Q }]);
  const r = judged(w, [Q2]);
  assert.deepEqual(r.refs, [{ member: Q2, leg_of: Q, ord: 1, ref }]);
  assert.deepEqual(r.materials.map((m) => m.ref), [DOC], "only this group's document");
  assert.deepEqual(r.refusals, []);
  /* chainsOf is the walk: a ref is never read as a local id */
  const asked = [];
  const io = { rows: () => [{ ord: 0, target_id: ref, content_id: null }], one: (q, id) => { asked.push(id); return null; },
               parseRef: (t) => (t === ref ? { ok: true } : null), visible: () => true, normalizeType: (t) => t };
  assert.deepEqual(chainsOf([{ id: Q, role: "load_bearing" }], io, 1), { materials: [], refs: [{ member: Q, leg_of: Q, ord: 0, ref }], findings: [{ id: Q, member: Q }] });
  assert.deepEqual(asked, []);
});

test("R15: findingFacts answers one grading_facts row per leg of each finding reached, as strength.gradingFacts answers it (levels null), and one passage per leg naming a content row with the extracted unit's text at that extent, null where none is held; a refused finding contributes no row and is answered in unread", () => {
  const w = setup();
  const a = w.doc(DOC, {}, { receipt: true });
  w.doc(DOC2);
  const cid = sha("passage of DOC");
  w.content(cid, a, DOC, "paragraph 1", canonicalJson({ kind: "doc-para", para: 1 }));
  const gone = sha("passage nobody indexed");
  w.content(gone, sha("unindexed"), DOC2, "paragraph 9", canonicalJson({ kind: "doc-para", para: 9 }));
  w.finding(Q2, [{ target: DOC2, grade: "C", grade_axis: "capture", grade_source: "capture" }]);
  w.finding(Q, [{ target: DOC, content_id: cid, grade: "B", grade_axis: "capture", grade_source: "capture" },
                { target: Q2 }, { target: DOC2, content_id: gone }]);
  const reached = judged(w, [Q]);
  const f = w.cd.findingFacts(reached.findings, V("alice"));
  assert.deepEqual(f.unread, []);
  for (const id of [Q, Q2]) {
    const given = w.strength.gradingFacts({ inquiry: id, levels: null, viewer: V("alice") }).legs;
    assert.deepEqual(f.grading.filter((g) => g.finding === id), given.map((g, ord) => ({ finding: id, ord, ...g })), id);
  }
  const fm = fmOf(w, [...gradingFactsLines(f.grading), ...passagesLines(f.passages)]);
  const facts = gradingFactsOf(fm);
  for (const id of [Q, Q2]) {
    const re = recomputePair({ legs: facts[id], version: GRADING_METHOD_VERSION });
    const live = w.strength.strengthOf(id);
    for (const axis of ["capture", "connection"]) assert.deepEqual([re[axis].state, re[axis].grade], [live[axis].state, live[axis].grade], `${id} ${axis}`);
  }
  assert.ok(GRADING_FACT_FIELDS.length > 2);
  const p = f.passages.filter((x) => x.finding === Q);
  assert.deepEqual(p.find((x) => x.content_id === cid), { finding: Q, ord: 0, content_id: cid, capture_sha: a,
    extent: canonicalJson({ kind: "doc-para", para: 1 }), chain: null, quoted: `the text of ${DOC}` });
  assert.equal(p.find((x) => x.content_id === gone).quoted, null, "none held there: null, never filled");
  assert.deepEqual(passagesOf(fm)[Q].map((x) => x.content_id).sort(), p.map((x) => x.content_id).sort());
  assert.ok(extractedTextOf(w.extraction.unitsOf(a).units).includes(JSON.stringify(`the text of ${DOC}`)));
  /* a refusing or throwing gradingFacts: no row, answered in unread */
  for (const gf of [() => ({ ok: false, reason: "NO_SUCH_INQUIRY" }), () => { throw new Error("down"); }]) {
    const x = world({ deps: { strength: { gradingFacts: gf } } });
    const out = x.cd.findingFacts([{ id: Q, member: Q }, { id: Q, member: Q2 }], V("alice"));
    assert.deepEqual([out.grading, out.passages, out.unread.map((u) => u.finding)], [[], [], [Q]]);
    assert.ok(out.unread[0].reason);
  }
});

test("R19: no answer or row composes a case-level strength — every pair is per member and per axis, and no answer carries a strength key", () => {
  const w = setup();
  w.doc(DOC, CO_ATTESTED, { receipt: true });
  w.finding(Q2, [{ target: DOC, grade: "C", grade_axis: "capture", grade_source: "capture" }]);
  w.finding(Q, [{ target: DOC }, { target: Q2 }]);
  const reached = judged(w, [Q]);
  const f = w.cd.findingFacts(reached.findings, V("alice"));
  const out = blocks(w, [Q]).out;
  for (const answer of [reached, f, out, w.cd.restingCaptures(w.prepared([Q])), w.cd.methodOf()]) {
    const json = JSON.stringify(answer, (k, v) => (v instanceof Map ? [...v] : v instanceof Set ? [...v] : v));
    assert.equal(/"(strength|case_strength|pair)"/.test(json), false, json.slice(0, 120));
  }
  assert.ok(f.grading.every((g) => g.finding && Number.isInteger(g.ord)), "each row per finding and leg");
});

test("R20: everything a row asserts arrived as an argument or was read from the record at the call — the blocks restate the facts handed in, and the author and instant are the caller's stamps; nothing is composed", () => {
  const w = setup();
  const a = w.doc(DOC, CO_ATTESTED, { receipt: true });
  w.finding(Q, [{ target: DOC }]);
  const reached = judged(w, [Q]);
  const resting = w.cd.restingCaptures(w.prepared([Q]));
  const facts = new Map([[a, { ...w.cd.captureFacts(a), grade: "Z-as-handed", co_archive: "https://handed.example/x" }]]);
  const out = w.cd.disclosureBlocks({ resting, facts, reached, project: "P-handed", author: "someone", at: "AT-handed" });
  assert.equal(out.captures[0].grade, "Z-as-handed");
  assert.equal(out.materials.rows[0].archived_copy, "https://handed.example/x");
  assert.ok(out.materials.attestations.some((x) => x.by_kind === "co_attestation" && x.by === "https://handed.example/x"));
  assert.ok(out.materials.attestations.some((x) => x.by_kind === "project" && x.by === "P-handed"));
  assert.ok(out.materials.attestations.some((x) => x.by_kind === "group" && x.at === "AT-handed"));
  /* the flag rows are R14's judgment and the stamps, as handed */
  const flags = { open: [{ ref: "r", edition: 2, flag: "F1", issue: "i", at: "t0" }], byFlag: new Map([["F1", { flag: "F1", words: "w" }]]) };
  assert.deepEqual(w.cd.disclosureBlocks({ flags, author: "someone", at: "AT-handed" }).flags,
    [{ ref: "r", edition: 2, flag: "F1", issue: "i", flagged_at: "t0", words: "w", acknowledged_by: "someone", acknowledged_at: "AT-handed" }]);
  /* the pure helpers restate what they are handed */
  const held = materialHeld({ kind: "document", sha: a }, { one: () => null, readFile: () => null, unitsOf: () => null });
  assert.deepEqual(held, { bytes: false, text: false, text_sha: null, whole: false, missing: ["bytes", "extracted_text"] });
  const rows = materialRows([{ ref: "x", kind: "observation", sha: "s", held: { text_sha: null }, included: true, rests_under: "supporting" }],
    { project: "p", group: "g", at: "t", facts: () => { throw new Error("not asked for an observation"); }, origin: () => "o",
      registered: () => null, member: () => [] });
  assert.deepEqual(rows, { rows: [{ ref: "x", kind: "observation", sha: "s", text_sha: null, origin: "o", archived_copy: null,
    included: true, rests_under: "supporting" }], attestations: [{ ref: "x", by_kind: "group", by: "g", level: null, at: "t", signature: "case", recorded_in: null }] });
});
