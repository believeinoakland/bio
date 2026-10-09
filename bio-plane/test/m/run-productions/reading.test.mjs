/* run-productions: reading inside a held document (R21–R24, T41-24; N820; D2, D3, D4, D22; K2463, K2472, K2482),
   with R15's run, R17's purge and R13's rows on the new acts. Each requirement is tested at the module's interface, with
   a negative control removing the condition alone (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { EXTRACT_PROPOSE_CHECKS, runProductionsOps, migrateRunProductions, passageProposalId, PROPOSED_CONNECTION_SAYS,
         BEARING_NOTE_SAYS, READ_PAGES_AT_A_TIME, DOC_PARAS_PER_PAGE } from "../../../src/run-productions/index.mjs";
import { ACCEPTANCE_FORMS } from "../../../src/record-grammar/index.mjs";
import { world, LAYER, Q, Q2, PROJ, DOC, DOC2, HIDDEN_PROJ, ALICE, BOB, MACHINE, sha } from "./fixture.mjs";

const AK = "class:ai/k1";
const P1 = { kind: "pdf-page", page: 0, ref: "page 1" }, P2 = { kind: "pdf-page", page: 1, ref: "page 2" };
const TEXT = ["The Board approved ordinance 12 on 3 March 2026, for $4,500.", "Minutes of the Clerk, page two."];
/* OCR chains whose engine was measured at B and at C: the capture's own ceiling (`text-chain.captureBound`, the
   weaker of the bytes' B and the measured fidelity) is B and C. An unmeasured text layer's is undetermined. */
const ocr = (cap) => [{ step: "pixels", extent: { kind: "pages", pages: [0, 1] } },
                      { step: "ocr", engine: "tesseract", version: "5.3.4", cap, confidence: { basis: "none" },
                        extent: { kind: "pages", pages: [0, 1] } }];
const OCR_B = ocr("B"), OCR_C = ocr("C");

function refusedAs(r, code) {
  assert.equal(r.ok, false, JSON.stringify(r).slice(0, 300));
  assert.equal(r.code, code, `${r.code}: ${r.detail}`);
  const row = EXTRACT_PROPOSE_CHECKS[code];
  if (row) { assert.equal(r.check, row.check); assert.equal(r.translation, row.translation); }
}

/* A question, a document whose capture's units hold TEXT on two pages (a text layer: its own ceiling is B), and an
   extract run over the question holding a mints and a pages bound. */
function base({ mints = 10, pages = 3, chain = OCR_B } = {}) {
  const w = world();
  w.inquiry(Q); w.inquiry(Q2);
  const cap = w.doc(DOC);
  w.ex.readings[cap] = { chain, pageCount: 2 };
  w.units(cap, TEXT);
  w.run("RUN-E", { mode: "extract", principal_plane: AK, mints, pages });
  const propose = (over = {}) => w.p.extractPropose({ run: "RUN-E", bundleId: DOC, fn: "propose-reading", version: "0.1.0",
    refs: [], proposedBy: AK, viewer: ALICE, caller: AK, ...over });
  const connect = (c, over = {}) => propose({ connections: [{ to_kind: "question", to: Q2, quote: "ordinance 12", source: P1,
                                                              how: "shared_identifier", key: "12", ...c }], ...over });
  return { w, cap, propose, connect };
}

test("R21 (D4; K2463, K2472): a passage's quote is checked by extraction R42 against the record's text in the unit containing its place, read after the viewer's gate; verified it keeps the capture's own ceiling with every figure named; one byte changed, another page's unit, past the unit's cap and no unit holding the place each read unverified", () => {
  const { w, cap, propose } = base();
  const name = { ref: "the board", label: "The Board" };
  const r = propose({ refs: [{ ...name, quote: "approved ordinance 12 on 3 March 2026, for $4,500", source: P1 }] });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  const [p] = r.proposed;
  assert.deepEqual([p.earned, p.verified_quote], ["B", true], "a name alone earns C; its verified quote keeps the capture's B");
  assert.deepEqual(p.check.map((f) => [f.kind, f.text]), [["number", "12"], ["date", "3 March 2026"], ["number", "$4,500"]]);
  assert.match(p.earned_because, /^earned B: .*capture's own text at its place/);
  assert.match(p.id, /^prp:[0-9a-f]{64}$/);
  assert.equal(p.id, passageProposalId("RUN-E", cap, "the board"));
  const row = w.row(`SELECT earned, quote, verified, figures, why FROM proposed_readings WHERE id=?`, p.id);
  assert.deepEqual([row.earned, row.quote, row.verified, JSON.parse(row.figures).length], ["B", p.quote, 1, 3]);
  /* Negative controls, each removing one condition. */
  const unverified = (over, ref) => {
    const x = propose({ refs: [{ ...name, ref, ...over }] }).proposed[0];
    assert.deepEqual([x.earned, x.verified_quote, x.check], ["C", false, []], ref);
  };
  unverified({ quote: "approved ordinance 13", source: P1 }, "one byte");
  unverified({ quote: "approved Ordinance 12", source: P1 }, "case folded");
  unverified({ quote: "Minutes of the Clerk", source: P1 }, "another page's words");
  unverified({ quote: "approved ordinance 12", source: { kind: "pdf-page", page: 7, ref: "page 8" } }, "no unit holds the place");
  unverified({ quote: "approved ordinance 12" }, "no place");
  /* The control for those: the second page's own words at the second page verify. */
  assert.equal(propose({ refs: [{ ...name, ref: "p2", quote: "Minutes of the Clerk", source: P2 }] }).proposed[0].verified_quote, true);
  /* Past the unit's cap: a unit held to its cap holds only its prefix, so a quote beyond it is not found there. */
  w.units(cap, [{ extent: { kind: "pdf-page", page: 0, rect: null }, ref: "page 1", text: TEXT[0].slice(0, 20), truncated: true }]);
  unverified({ quote: "ordinance 12", source: P1 }, "past the cap");
  assert.equal(propose({ refs: [{ ...name, ref: "inside cap", quote: "The Board approved", source: P1 }] }).proposed[0].verified_quote, true);
  /* The viewer's gate comes first: a document bob may not see is refused as absent and its text is never read. */
  w.project(HIDDEN_PROJ, ["carol"]);
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, HIDDEN_PROJ, DOC); w.membership.reindexProjectSight(DOC);
  w.ex.unitsAsked.length = 0;
  refusedAs(propose({ viewer: BOB, refs: [{ ...name, ref: "x", quote: "The Board", source: P1 }] }), "NO_SUCH_BUNDLE");
  assert.deepEqual(w.ex.unitsAsked, [], "unitsOf is not viewer-gated, so it is never asked before the gate");
});

test("R21 (D4): a verified quote keeps the capture's own ceiling, which may be weaker than B or undetermined — a key's B lowered to an OCR capture's C, and an unmeasured text layer's null stored as null with the reason stated", () => {
  const { w, propose } = base({ chain: OCR_C });
  const key = { ref: "ordinance:12", refKind: "ordinance", refKey: "12", quote: "ordinance 12", source: P1 };
  const x = propose({ refs: [key] }).proposed[0];
  assert.deepEqual([x.earned, x.verified_quote], ["C", true]);
  const plain = propose({ refs: [{ ...key, ref: "ordinance:12b", quote: "not in the text" }] }).proposed[0];
  assert.deepEqual([plain.earned, plain.verified_quote], ["B", false], "the control: unverified, the key's B");
  const u = base({ chain: LAYER });
  const n = u.propose({ refs: [key] });
  assert.equal(n.ok, true, JSON.stringify(n).slice(0, 300));
  assert.deepEqual([n.proposed[0].earned, n.proposed[0].verified_quote], [null, true]);
  assert.match(n.proposed[0].earned_because, /earned undetermined/);
  assert.equal(u.w.row(`SELECT earned FROM proposed_readings WHERE ref='ordinance:12'`).earned, null);
});

test("R21 (AI Roles §3 rule 3): a connection — to a body, a person in a public role, another document, a question — is tied to its exact quote and graded by how its link is established: A the source's own link, B a shared identifier, C a name or a date; never offered and never D; a quote that is not the record's text leaves it undetermined", () => {
  const { w, cap, propose, connect } = base();
  w.doc(DOC2, "other");
  w.st.sql.exec(`INSERT INTO reading_refs (capture_sha, bundle_id, ref, ref_kind, ref_key) VALUES (?, ?, 'ordinance:12', 'ordinance', '12')`, cap, DOC);
  const r = propose({ connections: [
    { to_kind: "document", to: DOC2, quote: "ordinance 12", source: P1, how: "source_link", ref: "ordinance:12" },
    { to_kind: "question", to: Q2, quote: "ordinance 12", source: P1, how: "shared_identifier", key: "12" },
    { to_kind: "body", to: "ENT-2026-0001", quote: "The Board approved", source: P1, how: "name", name: "The Board" },
    { to_kind: "person", to: "ENT-2026-0002", role: "clerk", quote: "Minutes of the Clerk", source: P2, how: "name", name: "Clerk" },
    { to_kind: "question", to: Q, quote: "3 March 2026", source: P1, how: "date", date: "3 March 2026" },
    { to_kind: "question", to: Q, quote: "ordinance 12 of 1999", source: P1, how: "shared_identifier", key: "12" },
  ] });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  assert.deepEqual(r.connections.map((c) => [c.to_kind, c.earned, c.verified_quote]),
    [["document", "A", true], ["question", "B", true], ["body", "C", true], ["person", "C", true], ["question", "C", true],
     ["question", null, false]]);
  assert.match(r.connections[5].earned_because, /earned undetermined/);
  assert.ok(r.connections.every((c) => c.says === PROPOSED_CONNECTION_SAYS && /^prc:[0-9a-f]{64}$/.test(c.id)));
  assert.deepEqual(r.connections[3].role, "clerk");
  assert.deepEqual(r.connections[4].check.map((f) => f.kind), ["date"], "a verified quote's figures named");
  assert.equal(r.minted, 0, "a connection mints nothing");
  assert.equal(w.count("proposed_connections"), 6);
  /* Listed beside the passages, through the same gate. */
  const listed = w.p.extractProposals({ run: "RUN-E", viewer: ALICE });
  assert.deepEqual(listed.connections.map((c) => c.id).sort(), r.connections.map((c) => c.id).sort());
  assert.equal(w.p.extractProposals({ run: "RUN-E", viewer: "nobody" }).connections.length, 0);
  /* The same connection again is left as it was. */
  w.clock.now = "2026-09-28T05:00:00Z";
  connect({}, { at: "2026-09-28T05:00:00Z" });
  assert.equal(w.count("proposed_connections"), 6);
  /* Refusals, each with nothing written, the batch refused whole naming the ordinal; each removed alone lands. */
  const before = w.snapshot();
  const bad = [
    [{ grade: "B" }, "CONNECTION_GRADE_OFFERED"], [{ earned: "A" }, "CONNECTION_GRADE_OFFERED"],
    [{ to_kind: "family" }, "CONNECTION_NO_TARGET"], [{ to: "" }, "CONNECTION_NO_TARGET"],
    [{ to: "INQ-2026-0099-none" }, "CONNECTION_NO_TARGET"], [{ to: DOC2 }, "CONNECTION_NO_TARGET"],
    [{ to_kind: "body", to: "the Board" }, "CONNECTION_NO_TARGET"],
    [{ to_kind: "person", to: "ENT-2026-0002" }, "CONNECTION_PERSON_NO_ROLE"],
    [{ quote: "" }, "CONNECTION_NO_QUOTE"], [{ source: null }, "CONNECTION_NO_QUOTE"],
    [{ source: { kind: "dom", ref: "x" } }, "CONNECTION_NO_QUOTE"],
    [{ how: "machine_says" }, "CONNECTION_NOT_ESTABLISHED"], [{ how: undefined }, "CONNECTION_NOT_ESTABLISHED"],
    [{ key: "13" }, "CONNECTION_NOT_ESTABLISHED"],
    [{ how: "source_link", ref: "ordinance:99" }, "CONNECTION_NOT_ESTABLISHED"],
    [{ how: "name", name: "Mayor" }, "CONNECTION_NOT_ESTABLISHED"],
  ];
  for (const [over, code] of bad) {
    const x = propose({ refs: [{ ref: "k:1", refKind: "k", refKey: "1", source: P1 }],
                        connections: [{ to_kind: "question", to: Q2, quote: "ordinance 12", source: P1, how: "shared_identifier",
                                        key: "12" }, { to_kind: "question", to: Q2, quote: "ordinance 12", source: P1,
                                                       how: "shared_identifier", key: "12", ...over }] });
    refusedAs(x, code);
    assert.equal(x.at_index, 1, code);
  }
  assert.deepEqual(w.snapshot(), before, "nothing written on any, the passage beside it included");
  /* A question bob may not see answers as an absent one. */
  w.project(HIDDEN_PROJ, ["carol"]);
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, HIDDEN_PROJ, Q2); w.membership.reindexProjectSight(Q2);
  w.run("RUN-B", { mode: "extract", principal_plane: AK, mints: 5, context_id: Q });
  const strip = (x, id) => JSON.parse(JSON.stringify(x).replaceAll(id, "X"));
  assert.deepEqual(strip(connect({}, { run: "RUN-B", viewer: BOB }), Q2),
                   strip(connect({ to: "INQ-2026-0099-none" }, { run: "RUN-B", viewer: BOB }), "INQ-2026-0099-none"));
});

test("R21 (steps R9): the step the work serves is carried by every proposal and tied through steps' recordProduct — the capture read and each passage newly minted — in the batch's transaction; a step steps does not hold rolls the batch back and is relayed, nothing spent; a malformed step is STEP_UNREADABLE; no step ties nothing", () => {
  const { w, cap, propose } = base();
  const step = w.step(Q);
  const tied = () => w.steps.productsOf({ step, viewer: ALICE }).products.map((p) => [p.kind, p.id]);
  assert.deepEqual(tied(), []);
  const r = propose({ step, refs: [{ ref: "k:1", refKind: "k", refKey: "1", source: P1 }, { ref: "k:2", label: "two" }],
                      connections: [{ to_kind: "question", to: Q2, quote: "ordinance 12", source: P1, how: "shared_identifier", key: "12" }] });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.equal(r.step, step);
  assert.deepEqual(tied(), [["capture", cap], ["content", r.proposed[0].content_id]]);
  assert.deepEqual(w.rows(`SELECT step FROM proposed_readings`).map((x) => x.step), [step, step]);
  assert.equal(w.row(`SELECT step FROM proposed_connections`).step, step);
  /* A step steps does not hold: its refusal relayed whole, the batch rolled back, nothing spent. */
  const before = w.snapshot();
  const other = "STP-2026-zzzzzzzz00000000";
  const refused = propose({ step: other, refs: [{ ref: "k:3", refKind: "k", refKey: "3", source: P2 }] });
  assert.deepEqual([refused.ok, refused.step], [false, other]);
  assert.ok(refused.code, JSON.stringify(refused));
  assert.deepEqual(w.snapshot(), before);
  assert.deepEqual(w.calls.filter((c) => c.name === "consumeBound").map((c) => c.a.n), [1], "only the first batch spent");
  refusedAs(propose({ step: "step one", refs: [{ ref: "k:4", label: "x" }] }), "STEP_UNREADABLE");
  assert.deepEqual(w.snapshot(), before);
  /* No step: nothing tied (the control). */
  const n = tied().length;
  assert.equal(propose({ refs: [{ ref: "k:5", label: "five", source: P2 }] }).step, null);
  assert.equal(tied().length, n);
});

test("R22 (D3; record-grammar R52): proposalAccept is the member's one act on a proposed passage or connection — as proposed (the meaning recorded as proposed), edited (her words), or her own instead (the machine's set aside); one per member; only then does acceptedFor answer that a leg may cite it as hers", () => {
  const { w, propose } = base();
  const r = propose({ refs: [{ ref: "the board", label: "The Board", quote: "The Board approved", source: P1 }],
                      connections: [{ to_kind: "question", to: Q2, quote: "ordinance 12", source: P1, how: "shared_identifier", key: "12" }] });
  const [passage] = r.proposed, [link] = r.connections;
  const contentId = passage.content_id;
  assert.deepEqual(w.p.acceptedFor({ content_id: contentId, by: ALICE }), { accepted: false, form: null, at: null });
  const a = w.p.proposalAccept({ proposal: passage.id, form: "as_proposed", by: ALICE, viewer: ALICE });
  assert.equal(a.ok, true, JSON.stringify(a));
  assert.deepEqual(a.acceptance, { proposal: passage.id, form: "as_proposed", by: ALICE, at: "2026-09-28T01:00:00Z", kind: "passage" });
  assert.equal(Object.isFrozen(a.acceptance), true, "record-grammar R52's one shape");
  assert.deepEqual([a.meaning, a.meaning_of, a.content_id, a.set_aside], ['The Board: "The Board approved"', "proposal", contentId, false]);
  assert.deepEqual(w.p.acceptedFor({ content_id: contentId, by: ALICE }), { accepted: true, form: "as_proposed", at: "2026-09-28T01:00:00Z" });
  assert.equal(w.p.acceptedFor({ content_id: contentId, by: BOB }).accepted, false, "hers, not bob's");
  const e = w.p.proposalAccept({ proposal: passage.id, form: "edited", edit: "  the board's approval  ", by: BOB, viewer: BOB });
  assert.deepEqual([e.ok, e.meaning, e.meaning_of], [true, "the board's approval", "member"]);
  const o = w.p.proposalAccept({ proposal: link.id, form: "own_instead", edit: "the minutes link it", by: ALICE, viewer: ALICE });
  assert.deepEqual([o.ok, o.set_aside, o.to_kind, o.to, o.acceptance.kind], [true, true, "question", Q2, "connection"]);
  assert.equal(w.p.acceptedFor({ proposal: link.id, by: ALICE }).form, "own_instead");
  /* Refusals in order, nothing written on any; each removed alone lets the next speak. */
  const before = w.snapshot();
  const A = (o2) => w.p.proposalAccept({ proposal: link.id, form: "as_proposed", by: BOB, viewer: BOB, ...o2 });
  refusedAs(A({ by: "" }), "ACCEPT_NOT_A_MEMBER");
  refusedAs(A({ by: MACHINE }), "ACCEPT_NOT_A_MEMBER");
  refusedAs(A({ proposal: "prc:" + "0".repeat(64) }), "READING_PROPOSAL_ABSENT");
  refusedAs(A({ proposal: contentId }), "READING_PROPOSAL_ABSENT");
  refusedAs(A({ form: "half" }), "ACCEPT_FORM_UNKNOWN");
  refusedAs(A({ form: "edited" }), "ACCEPT_NEEDS_HER_WORDS");
  refusedAs(A({ form: "own_instead", edit: "x".repeat(2001) }), "ACCEPT_NEEDS_HER_WORDS");
  refusedAs(A({ edit: "my words" }), "ACCEPT_AS_PROPOSED_TAKES_NO_WORDS");
  refusedAs(w.p.proposalAccept({ proposal: passage.id, form: "as_proposed", by: ALICE, viewer: ALICE }), "PROPOSAL_ALREADY_ACCEPTED");
  assert.deepEqual(w.snapshot(), before);
  assert.equal(A({}).ok, true, "the control: every fault removed, it lands");
  /* A proposal on a document the member may not see answers as an absent one. */
  w.project(HIDDEN_PROJ, ["carol"]);
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, HIDDEN_PROJ, DOC); w.membership.reindexProjectSight(DOC);
  const strip = (x, id) => JSON.parse(JSON.stringify(x).replaceAll(id, "X"));
  const hidden = "prp:" + "f".repeat(64);
  assert.deepEqual(strip(w.p.proposalAccept({ proposal: passage.id, form: "edited", edit: "w", by: "member:dan", viewer: "member:dan" }), passage.id),
                   strip(w.p.proposalAccept({ proposal: hidden, form: "edited", edit: "w", by: "member:dan", viewer: "member:dan" }), hidden));
  /* acceptanceCounts: per kind and form, group-wide only, naming no member, project or proposal. */
  const counts = w.p.acceptanceCounts();
  assert.deepEqual(counts, { ok: true, scope: "group", counts: {
    passage: { as_proposed: 1, edited: 1, own_instead: 0 }, connection: { as_proposed: 1, edited: 0, own_instead: 1 } } });
  assert.deepEqual(Object.keys(counts.counts.passage), [...ACCEPTANCE_FORMS]);
  assert.ok(!/member:|INQ-|PROJ-|prp:|prc:/.test(JSON.stringify(counts)));
});

test("R22 (membership R55): a proposal made under a run over a project is accepted only by a joined participant of that project; an invited one is refused PROJECT_ACT_NOT_A_PARTICIPANT, relayed", () => {
  const { w } = base();
  w.project(PROJ, ["alice"]);
  w.st.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner, created, updated) VALUES (?, 'bob', 'invited', 0, 't', 't')`, PROJ);
  w.membership.reindexProjectSight(PROJ);
  w.run("RUN-P", { mode: "extract", principal_plane: AK, mints: 5, context_type: "project", context_id: PROJ });
  const r = w.p.extractPropose({ run: "RUN-P", bundleId: DOC, fn: "propose-reading", version: "0.1.0", refs: [{ ref: "k:1", label: "x" }],
                                 proposedBy: AK, viewer: ALICE, caller: AK });
  const id = r.proposed[0].id;
  const bob = w.p.proposalAccept({ proposal: id, form: "as_proposed", by: BOB, viewer: BOB });
  assert.deepEqual([bob.ok, bob.code], [false, "PROJECT_ACT_NOT_A_PARTICIPANT"]);
  assert.equal(w.count("proposal_acceptances"), 0);
  assert.equal(w.p.proposalAccept({ proposal: id, form: "as_proposed", by: ALICE, viewer: ALICE }).ok, true, "a joined participant");
});

test("R23 (D22; K2472, K2482): bearingNote keeps each sentence whose quote passes extraction R42's byte-exact check at its place, leaves out and names the rest, refuses a note with none tied; stored apart — never content, never a proposal, no leg target — and read only beside its source; run optional for a member's interactive draft, never for a machine", () => {
  const { w, cap } = base();
  const S = [{ text: "It records the approval of ordinance 12.", quote: "approved ordinance 12", source: P1 },
             { text: "It does not say who moved it.", quote: "moved by", source: P1 },
             { text: "The Clerk kept the minutes.", quote: "Minutes of the Clerk", source: P2 },
             { text: "", quote: "The Board", source: P1 }];
  const before = w.snapshot();
  const r = w.p.bearingNote({ capture: cap, question: Q, run: "RUN-E", sentences: S, viewer: ALICE, caller: AK });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual(r.note.sentences.map((x) => x.text), [S[0].text, S[2].text]);
  assert.deepEqual(r.left_out.map((x) => x.index), [1, 3]);
  assert.equal(r.kept, 2);
  assert.equal(r.says, BEARING_NOTE_SAYS);
  assert.match(r.note.id, /^brn:[0-9a-f]{64}$/, "no content id or proposal id: nothing a leg accepts");
  const after = w.snapshot();
  assert.deepEqual(Object.keys(after).filter((t) => after[t] !== before[t]), ["bearing_notes"], "never stored as content or as a proposal");
  /* Read beside its source, never in its place: listed on the document, through the viewer's gate on its question. */
  const beside = w.p.bearingNotes({ bundleId: DOC, viewer: ALICE });
  assert.deepEqual(beside.notes.map((n) => [n.id, n.question, n.left_out]), [[r.note.id, Q, 2]]);
  assert.equal(beside.notes[0].says, BEARING_NOTE_SAYS);
  w.project(HIDDEN_PROJ, ["carol"]);
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, HIDDEN_PROJ, Q); w.membership.reindexProjectSight(Q);
  assert.deepEqual(w.p.bearingNotes({ bundleId: DOC, viewer: BOB }).notes, [], "a note on a question bob may not see is not his to read");
  w.st.sql.exec(`UPDATE bundles SET project=NULL WHERE bundle_id=?`, Q); w.membership.reindexProjectSight(Q);
  /* Refusals, nothing kept on any. */
  const B = (o) => w.p.bearingNote({ capture: cap, question: Q, run: "RUN-E", sentences: S, viewer: ALICE, caller: AK, ...o });
  const held = w.snapshot();
  refusedAs(B({ question: DOC }), "BEARING_NO_QUESTION");
  refusedAs(B({ question: "INQ-2026-0099-none" }), "BEARING_NO_QUESTION");
  refusedAs(B({ capture: sha("never held") }), "BEARING_NO_CAPTURE");
  refusedAs(B({ capture: "x" }), "BEARING_NO_CAPTURE");
  refusedAs(B({ sentences: [] }), "BEARING_NO_SENTENCES");
  refusedAs(B({ sentences: Array.from({ length: 41 }, () => S[0]) }), "BEARING_NO_SENTENCES");
  const none = B({ sentences: [S[1]] });
  refusedAs(none, "BEARING_NOTHING_TIED");
  assert.deepEqual(none.left_out.map((x) => x.index), [0]);
  /* R15: a run its caller does not hold. */
  assert.equal(B({ caller: BOB }).code, "AI_RUN_NOT_PRINCIPAL");
  assert.deepEqual(w.snapshot(), held);
  /* K2482: drafted interactively, no run: a member's own act; a machine or an unstamped caller is NO_RUN. */
  const mine = B({ run: undefined, caller: ALICE });
  assert.deepEqual([mine.ok, mine.note.run], [true, null]);
  assert.equal(w.row(`SELECT written_by FROM bearing_notes WHERE id=?`, mine.note.id).written_by, ALICE);
  refusedAs(B({ run: undefined, caller: AK }), "NO_RUN");
  refusedAs(B({ run: undefined, caller: "" }), "NO_RUN");
  /* A member who may not see the question cannot note on it. */
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, HIDDEN_PROJ, Q); w.membership.reindexProjectSight(Q);
  refusedAs(B({ run: undefined, caller: BOB, viewer: BOB }), "BEARING_NO_QUESTION");
});

test("R24 (D2; run-rules R26): a run reads a held document a few pages at a time within its pages bound, spent through ai-runs; a page already read costs nothing; a slice the bound cuts stops and says how far it read; a spent bound is refused saying how far; no bound, a run of another mode and a document under a 'no AI' limit are refused", () => {
  const { w, cap } = base({ pages: 7 });
  const pages = Array.from({ length: 9 }, (_, i) => `text of page ${i + 1}`);
  w.units(cap, pages);
  const read = (o = {}) => w.p.readPages({ run: "RUN-E", bundleId: DOC, viewer: ALICE, caller: AK, ...o });
  const first = read();
  assert.equal(first.ok, true, JSON.stringify(first).slice(0, 300));
  assert.equal(READ_PAGES_AT_A_TIME, 5);
  assert.deepEqual(first.pages.map((p) => [p.page, p.ref, p.text, p.charged]),
    pages.slice(0, 5).map((t, i) => [i, `page ${i + 1}`, t, true]));
  assert.deepEqual([first.read_to, first.page_count, first.next_from, first.stopped, first.charged, first.index_state],
                   [5, 9, 5, null, 5, "whole"]);
  assert.deepEqual(first.bound, { bound: "pages", allowed: 7, consumed: 5 });
  /* Read again: nothing charged. */
  const again = read({ from: 3 });
  assert.deepEqual([again.charged, again.pages.map((p) => [p.page, p.charged]), again.stopped, again.read_to],
                   [2, [[3, false], [4, false], [5, true], [6, true]], "pages", 7], "pages 3 and 4 were read already; the bound cut page 8");
  assert.deepEqual(again.bound, { bound: "pages", allowed: 7, consumed: 7 });
  /* The bound reached: refused, saying how far it read in this document. */
  const spent = read({ from: 8 });
  refusedAs(spent, "PAGES_BOUND_REACHED");
  assert.deepEqual([spent.read_to, spent.pages_read, spent.page_count], [7, 7, 9]);
  assert.match(spent.detail, /as far as page 7 of 9/);
  assert.deepEqual(w.calls.filter((c) => c.name === "consumeBound" && c.a.bound === "pages").map((c) => c.a.n), [5, 2]);
  /* A slice the bound cuts: it stops and says how far. */
  const cut = base({ pages: 2 });
  cut.w.units(cut.cap, pages);
  const c = cut.w.p.readPages({ run: "RUN-E", bundleId: DOC, viewer: ALICE, caller: AK });
  assert.deepEqual([c.ok, c.pages.length, c.stopped, c.read_to, c.next_from], [true, 2, "pages", 2, 2]);
  assert.match(c.says, /stopped at its pages bound after page 2 of 9/);
  assert.equal(cut.w.count("run_pages_read"), 2);
  /* Refusals, nothing read or spent on any; each removed alone lets the next speak. */
  const before = w.snapshot();
  w.run("RUN-CHECK", { mode: "check", principal_plane: AK, pages: 5 });
  w.run("RUN-INV", { mode: "investigate", principal_plane: AK, pages: 5 });
  w.run("RUN-NOPAGES", { mode: "extract", principal_plane: AK });
  w.run("RUN-ZERO", { mode: "extract", principal_plane: AK, pages: 0 });
  refusedAs(read({ run: "" }), "NO_RUN");
  refusedAs(read({ run: "RUN-NEVER" }), "NO_SUCH_RUN");
  assert.equal(read({ caller: ALICE }).code, "AI_RUN_NOT_PRINCIPAL");
  refusedAs(read({ run: "RUN-CHECK" }), "NOT_A_READING_RUN");
  refusedAs(read({ run: "RUN-NOPAGES" }), "NO_PAGES_BOUND");
  refusedAs(read({ run: "RUN-ZERO" }), "NO_PAGES_BOUND");
  refusedAs(read({ run: "RUN-NOPAGES", bundleId: Q }), "NOT_A_DOCUMENT");
  assert.equal(read({ run: "RUN-NOPAGES", bundleId: "INFO-2026-0099-none" }).code, "NO_SUCH_BUNDLE");
  assert.deepEqual(w.snapshot(), before);
  assert.equal(read({ run: "RUN-INV" }).ok, true, "a run in mode investigate reads too");
});

test("R24 (run-rules R26, credentials R57): a document under a 'no AI' material limit covering reading is refused whatever the bound, run-rules' checkPagesRead judging credentials' limits, its refusal relayed; a limit not covering reading, or on another project, refuses nothing", () => {
  const { w, cap } = base({ pages: 20 });
  w.project(PROJ, ["alice"]);
  w.st.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner, created, updated) VALUES (?, 'olive', 'joined', 1, 't', 't')`, PROJ);
  w.membership.reindexProjectSight(PROJ);
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, PROJ, DOC); w.membership.reindexProjectSight(DOC);
  const read = () => w.p.readPages({ run: "RUN-E", bundleId: DOC, viewer: ALICE, caller: AK });
  assert.equal(read().ok, true, "no limit set");
  const askOnly = w.credentials.projectAiKeepAwaySet({ project: PROJ, on: true, uses: ["ask"], reason: "draft material", by: "member:olive" });
  assert.equal(askOnly.ok, true, JSON.stringify(askOnly));
  assert.equal(read().ok, true, "a limit on asking only does not cover reading");
  assert.equal(w.credentials.projectAiKeepAwaySet({ project: PROJ, on: true, uses: ["read"], reason: "sealed records", by: "member:olive" }).ok, true);
  const before = w.snapshot();
  const kept = read();
  refusedAs(kept, "AI_RUN_READ_NO_AI");
  assert.equal(kept.check, "C-22.23", "run-rules' row (its R26)");
  assert.deepEqual([kept.run, kept.bundle_id], ["RUN-E", DOC]);
  assert.deepEqual(w.snapshot(), before, "nothing read or spent");
  /* The same limit on a document outside the project: read. */
  w.st.sql.exec(`UPDATE bundles SET project=NULL WHERE bundle_id=?`, DOC); w.membership.reindexProjectSight(DOC);
  assert.equal(read().ok, true);
  void cap;
});

test("R24: a document read by paragraphs reads 40 paragraphs as one page; a slide is a page; a sheet is a page; the unit containing a sheet cell is the range holding it (R21)", async () => {
  const { pagesOf, unitContaining, cellInRange } = await import("../../../src/run-productions/index.mjs");
  assert.equal(DOC_PARAS_PER_PAGE, 40);
  const paras = Array.from({ length: 85 }, (_, i) => ({ extent: { kind: "doc-para", para: i, run: null }, ref: `¶${i + 1}`, text: `p${i}` }));
  const doc = pagesOf(paras);
  assert.deepEqual(doc.map((p) => [p.page, p.ref]), [[0, "¶1–¶40"], [1, "¶41–¶80"], [2, "¶81–¶85"]]);
  assert.equal(doc[0].text.split("\n").length, 40);
  const slides = pagesOf([1, 2].map((s) => ({ extent: { kind: "slide-shape", slide: s, shape: null }, ref: `slide ${s}`, text: `s${s}` })));
  assert.deepEqual(slides.map((p) => p.ref), ["slide 1", "slide 2"]);
  const sheet = { extent: { kind: "sheet-range", sheet: "Budget", range: "A1:D20" }, ref: "Budget!A1:D20", text: "a\tb" };
  assert.deepEqual(pagesOf([sheet]).map((p) => p.ref), ["Budget!A1:D20"]);
  assert.equal(unitContaining([sheet], { kind: "sheet-cell", sheet: "Budget", cell: "C7", ref: "Budget!C7" }), sheet);
  assert.equal(unitContaining([sheet], { kind: "sheet-cell", sheet: "Budget", cell: "E7", ref: "Budget!E7" }), null);
  assert.equal(unitContaining([sheet], { kind: "sheet-cell", sheet: "Other", cell: "C7", ref: "Other!C7" }), null);
  assert.equal(unitContaining(paras, { kind: "doc-para", para: 3, run: 1, ref: "¶4" }), paras[3]);
  assert.deepEqual([cellInRange("B2", "A1:C3"), cellInRange("D2", "A1:C3"), cellInRange("$A$1", "A1"), cellInRange("x", "A1:B2")],
                   [true, false, true, false]);
});

test("R15, R8 (T41-24): through the ops, the run is the body's and the viewer, caller and accepting member are the control plane's stamps; a body's are never believed", () => {
  const { w, cap } = base();
  const url = (op, qs) => new URL(`https://plane/?op=${op}&${new URLSearchParams(qs)}`);
  const read = runProductionsOps(w.p, url("readpages", { viewer: ALICE, principal: AK }),
                                 { run: "RUN-E", bundleId: DOC, viewer: "admin", caller: BOB }).readpages();
  assert.equal(read.ok, true, JSON.stringify(read).slice(0, 200));
  const asBob = runProductionsOps(w.p, url("readpages", { viewer: ALICE, principal: BOB }), { run: "RUN-E", bundleId: DOC, caller: AK }).readpages();
  assert.equal(asBob.code, "AI_RUN_NOT_PRINCIPAL");
  const p = w.p.extractPropose({ run: "RUN-E", bundleId: DOC, fn: "propose-reading", version: "0.1.0", refs: [{ ref: "k:1", label: "x" }],
                                 proposedBy: AK, viewer: ALICE, caller: AK }).proposed[0].id;
  const acc = runProductionsOps(w.p, url("proposalaccept", { by: ALICE, viewer: ALICE }), { proposal: p, form: "as_proposed", by: BOB }).proposalaccept();
  assert.equal(acc.acceptance.by, ALICE);
  const note = runProductionsOps(w.p, url("bearingnote", { viewer: ALICE, principal: AK }),
    { capture: cap, question: Q, run: "RUN-E", sentences: [{ text: "It names the Clerk.", quote: "the Clerk", source: P2 }], caller: BOB }).bearingnote();
  assert.equal(note.ok, true);
  assert.equal(w.row(`SELECT written_by FROM bearing_notes`).written_by, AK);
  const notes = runProductionsOps(w.p, url("bearingnotes", { bundle: DOC, viewer: ALICE }), null).bearingnotes();
  assert.equal(notes.notes.length, 1);
  assert.deepEqual(runProductionsOps(w.p, url("acceptancecounts", {}), null).acceptancecounts().counts.passage.as_proposed, 1);
});

test("R17 (T41-24): the four new tables are declared to record-core's purge — by the document read, and a bearing note by its question too", () => {
  const { w, cap, propose } = base();
  const r = propose({ refs: [{ ref: "k:1", label: "x" }],
                      connections: [{ to_kind: "question", to: Q2, quote: "ordinance 12", source: P1, how: "shared_identifier", key: "12" }] });
  w.p.proposalAccept({ proposal: r.proposed[0].id, form: "as_proposed", by: ALICE, viewer: ALICE });
  w.p.bearingNote({ capture: cap, question: Q2, run: "RUN-E", sentences: [{ text: "It names it.", quote: "ordinance 12", source: P1 }], viewer: ALICE, caller: AK });
  w.p.readPages({ run: "RUN-E", bundleId: DOC, viewer: ALICE, caller: AK });
  const counts = () => ["proposed_connections", "proposal_acceptances", "bearing_notes", "run_pages_read"].map((t) => w.count(t));
  assert.deepEqual(counts(), [1, 1, 1, 2]);
  w.record.purge({ bundleId: Q2 });
  assert.deepEqual(counts(), [1, 1, 0, 2], "the note goes with its question");
  w.record.purge({ bundleId: DOC });
  assert.deepEqual(counts(), [0, 0, 0, 0]);
});

test("R11, R21 (migration): a store whose proposed_readings predates T41-24 is rebuilt once in the new shape, every row kept and named, its earned now nullable; a second migration moves nothing", () => {
  const w = world();
  w.st.db.exec(`DROP TABLE proposed_readings`);
  w.st.db.exec(`CREATE TABLE proposed_readings (run TEXT NOT NULL, capture_sha TEXT NOT NULL, bundle_id TEXT NOT NULL, ref TEXT NOT NULL,
    ref_kind TEXT, ref_key TEXT, label TEXT, fn TEXT NOT NULL, fn_version TEXT NOT NULL, chain TEXT NOT NULL, cap TEXT,
    earned TEXT NOT NULL, pos_kind TEXT, pos TEXT, pos_ref TEXT, content_id TEXT, proposed_by TEXT NOT NULL, at TEXT NOT NULL,
    PRIMARY KEY (run, capture_sha, ref))`);
  w.st.db.exec(`INSERT INTO proposed_readings (run, capture_sha, bundle_id, ref, fn, fn_version, chain, earned, proposed_by, at)
                VALUES ('RUN-OLD', '${"a".repeat(64)}', '${DOC}', 'k:1', 'propose-reading', '0.1.0', '[]', 'B', '${AK}', 't')`);
  migrateRunProductions(w.st.sql);
  const row = w.row(`SELECT * FROM proposed_readings`);
  assert.deepEqual([row.run, row.ref, row.earned, row.verified, row.id], ["RUN-OLD", "k:1", "B", 0, passageProposalId("RUN-OLD", "a".repeat(64), "k:1")]);
  assert.equal(w.rows(`PRAGMA table_info(proposed_readings)`).find((c) => c.name === "earned").notnull, 0);
  const snap = w.snapshot();
  migrateRunProductions(w.st.sql);
  assert.deepEqual(w.snapshot(), snap);
});
