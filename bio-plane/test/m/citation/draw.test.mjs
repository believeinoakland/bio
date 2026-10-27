/* citation: `drawQuestion` (R14; T47-17, N975), one served act drawing a question into a case with no selection and no
   document sent, at the module's interface: the edge and the answer `cite` writes for a one-member selection naming
   the question, every refusal one `cite` answers, and the case then drawing on the question as the real `inquiry`
   (booted on the host) reads it. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, STAMP, NOW, projMd, inqMd } from "./fixture.mjs";
import { Citation, CITE_CHECKS, citationOps } from "../../../src/citation/index.mjs";
import { noSuchProject } from "../../../src/membership/index.mjs";
import { INLINE_MAX } from "../../../src/promotion/index.mjs";
import { localize } from "../../../src/setup-words/index.mjs";
import { basisRefusals } from "../inquiry/fixtures.mjs";

const ANN = { viewer: V("ann"), author: "member:ann", identity: V("ann") };
const VERA = { viewer: V("vera"), author: "member:vera", identity: V("vera") };
const Q = "INQ-2026-0001-q";

const carries = (r, code) => {
  assert.equal(r.ok, false, JSON.stringify(r).slice(0, 300));
  assert.equal(r.reason, code);
  assert.equal(r.check, CITE_CHECKS[code].check);
  assert.equal(r.translation, CITE_CHECKS[code].translation);
};
const blockOf = (md, key) => {
  const m = new RegExp(`\\n${key}:\\n((?:  .*\\n)+)`).exec(md);
  return m ? m[1] : null;
};
const logOf = (md) => md.split("## Session Log\n\n")[1];

function setup(opts = {}) {
  const w = world(opts);
  w.info("INFO-2026-0001-doc");
  w.inquiry(Q);
  return { w, p: w.project() };
}

test("R14: draws the question into the case as one confirmed cites edge carrying the note, the references block and the answer those cite writes for a one-member selection naming it; the Session Log names the question in place of a selection", async () => {
  const { w, p } = setup();
  const p2 = w.project("The twin case");
  const h = await w.select([Q]);
  const viaCite = w.cit.cite({ project: p2, handle: h, ...ANN, owner: "o", note: "the budget team asks this too" });
  const before = w.md(p);
  const r = w.cit.drawQuestion({ project: p, inquiry: Q, ...ANN, note: "the budget team asks this too" });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.equal(blockOf(w.md(p), "references"), blockOf(w.md(p2), "references"));
  assert.equal(blockOf(w.md(p), "references"),
               `  - rel: cites\n    target: ${Q}\n    status: confirmed\n    note: "the budget team asks this too"\n`);
  /* Nothing else in the document is rewritten: the rest is the held text with last_updated moved and one entry added. */
  assert.equal(w.md(p).replace(/\n## Session Log\n[\s\S]*$/, ""),
               before.replace("references: []", `references:\n${blockOf(w.md(p), "references").trimEnd()}`)
                     .replace(/last_updated: .*/, `last_updated: "${STAMP}"`).replace(/\n## Session Log\n[\s\S]*$/, ""));
  assert.equal(logOf(w.md(p)), localize("citation.index.session_cited_one_record", "### Session {when} | Cited 1 record | {who}\n", { when: STAMP, who: "member:ann" })
    + localize("citation.index.trigger_question_drawn", "Trigger: question {qid} drawn into this case\n", { qid: Q })
    + localize("citation.index.changes_cites_edges_added", "Changes: cites edges added to {listed}.{note}\n",
      { listed: Q, note: localize("citation.index.log_note", " Note: {note}.", { note: "the budget team asks this too" }) }));
  /* R3's case answer, handle null and drift and moved false, with no selection's gate. */
  const head = w.record.head(p);
  assert.deepEqual(Object.keys(r).sort(), Object.keys(viaCite).sort());
  assert.deepEqual({ ...r, project: 0, handle: 0, drift: 0, gate: 0, expires: 0, bundleSha: 0, rowVersion: 0 },
                   { ...viaCite, project: 0, handle: 0, drift: 0, gate: 0, expires: 0, bundleSha: 0, rowVersion: 0 });
  assert.deepEqual([r.handle, r.drift, r.moved, r.weight, r.cited, r.alreadyCited, r.question, r.pinned_captures, r.gate, r.expires],
                   [null, false, false, "report", [Q], [], null, { [Q]: null }, null, null]);
  assert.deepEqual([r.bundleSha, r.rowVersion, w.fm(p).last_updated], [head.bundleSha, head.rowVersion, STAMP]);
  /* With no note the entry names none, as cite's does. */
  const p3 = w.project("Third");
  assert.equal(w.cit.drawQuestion({ project: p3, inquiry: Q, ...ANN }).ok, true);
  assert.equal(logOf(w.md(p3)), localize("citation.index.session_cited_one_record", "### Session {when} | Cited 1 record | {who}\n", { when: STAMP, who: "member:ann" })
    + localize("citation.index.trigger_question_drawn", "Trigger: question {qid} drawn into this case\n", { qid: Q })
    + localize("citation.index.changes_cites_edges_added", "Changes: cites edges added to {listed}.{note}\n", { listed: Q, note: "" }));
});

test("R14: the case then draws on the question — the real inquiry reads it among the projects drawing on it — and a case that already draws on it answers ok, cited empty, writing nothing", async () => {
  const { w, p } = setup({ inquiry: true });
  assert.deepEqual([...w.inquiryModule.projectsDrawingOn(Q)], [], "a control: nothing draws on it before");
  assert.equal(w.cit.drawQuestion({ project: p, inquiry: Q, ...ANN }).ok, true);
  assert.deepEqual([...w.inquiryModule.projectsDrawingOn(Q)], [p]);
  const snap = w.snapshot();
  const head = w.record.head(p);
  const again = w.cit.drawQuestion({ project: p, inquiry: Q, ...ANN, note: "again" });
  assert.deepEqual([again.ok, again.cited, again.alreadyCited, again.severed, again.handle, again.drift, again.bundleSha, again.rowVersion],
                   [true, [], [Q], [], null, false, head.bundleSha, null]);
  assert.deepEqual(w.snapshot(), snap, "nothing written");
  /* A proposed edge, written by hand, is drawing on it too. */
  const p2 = w.project("Proposed");
  w.revise(p2, w.md(p2).replace("references: []", `references:\n  - rel: cites\n    target: ${Q}\n    status: proposed\n    note: ""`));
  assert.deepEqual(w.cit.drawQuestion({ project: p2, inquiry: Q, ...ANN }).alreadyCited, [Q]);
});

test("R14, R9: the citing object as R1 — an absent case and one the viewer may not see answer NO_SUCH_PROJECT alike, existence-only sight membership's C-70.1; NOT_A_PROJECT for anything not a case, a question included", () => {
  const { w, p } = setup();
  const hidden = w.cit.drawQuestion({ project: p, inquiry: Q, ...VERA });
  const absent = w.cit.drawQuestion({ project: "PROJ-2026-0000-none", inquiry: Q, ...VERA });
  assert.deepEqual(hidden, noSuchProject(p));
  assert.deepEqual({ ...hidden, project: null }, { ...absent, project: null });
  assert.equal(w.cit.drawQuestion({ project: null, inquiry: Q, ...ANN }).reason, "NO_SUCH_PROJECT");
  const disc = w.project("Open door", "ann", { visibility: "discoverable" });
  assert.deepEqual(w.cit.drawQuestion({ project: disc, inquiry: Q, ...VERA }), w.membership.existenceAct(disc, V("vera")));
  w.inquiry("INQ-2026-0002-q");
  for (const [at, got] of [[Q, "inquiry"], ["INFO-2026-0001-doc", "information"]]) {
    const r = w.cit.drawQuestion({ project: at, inquiry: "INQ-2026-0002-q", ...ANN });
    assert.deepEqual([r.ok, r.reason, r.project, r.got], [false, "NOT_A_PROJECT", at, got]);
  }
  assert.doesNotMatch(w.md(Q), /INQ-2026-0002-q/);
});

test("R14: the actor must have joined the case (membership.projectAuthority): an invited administrator is refused by position, the joined owner is not", () => {
  const { w } = setup();
  const p = w.project("Invited", "ann", { visibility: "discoverable" });
  assert.equal(w.membership.projectInvite({ projectId: p, handle: "adm", by: "ann" }).ok, true);
  const before = w.md(p);
  const r = w.cit.drawQuestion({ project: p, inquiry: Q, viewer: V("adm"), author: "member:adm", identity: V("adm") });
  assert.deepEqual([r.ok, r.reason, r.act], [false, "PROJECT_ACT_NOT_A_PARTICIPANT", "drawquestion"]);
  assert.equal(w.md(p), before);
  assert.equal(w.cit.drawQuestion({ project: p, inquiry: Q, ...ANN }).ok, true);
});

test("R14, R11: BAD_NOTE (C-33.15) over 200 characters or with a quote, backslash or newline, carrying its row; a 200-character note passes", () => {
  const { w, p } = setup();
  for (const note of ["x".repeat(201), 'a"b', "a\\b", "a\nb", "a\rb"]) carries(w.cit.drawQuestion({ project: p, inquiry: Q, ...ANN, note }), "BAD_NOTE");
  assert.equal(w.cit.drawQuestion({ project: p, inquiry: Q, ...ANN, note: "y".repeat(200) }).ok, true);
});

test("R14, R11: the question — NO_SUCH_QUESTION (C-33.52) alike for an absent, unnamed or unseen one, NOT_AN_INQUIRY (C-33.53) for a seen item that is not a question, each writing nothing", () => {
  const { w, p } = setup();
  const vp = w.project("Vera's case", "vera");
  const hiddenQ = "INQ-2026-0009-hidden";
  w.put(hiddenQ, inqMd(hiddenQ, [`project: ${p}`]));   // inside ann's hidden case: vera may not see it
  const snap = w.snapshot();
  const answers = [];
  for (const inquiry of ["INQ-2026-9999-none", hiddenQ]) {
    const r = w.cit.drawQuestion({ project: vp, inquiry, ...VERA });
    carries(r, "NO_SUCH_QUESTION");
    answers.push(r);
  }
  assert.deepEqual({ ...answers[0], question: null }, { ...answers[1], question: null }, "unseen answers as absent");
  for (const inquiry of [null, undefined, "", "  "]) carries(w.cit.drawQuestion({ project: vp, inquiry, ...VERA }), "NO_SUCH_QUESTION");
  for (const inquiry of ["INFO-2026-0001-doc", p]) {
    const r = w.cit.drawQuestion({ project: p, inquiry, ...ANN });
    carries(r, "NOT_AN_INQUIRY");
    assert.equal(r.question, inquiry);
  }
  assert.deepEqual(w.snapshot(), snap, "nothing written");
  /* Controls: ann sees the question inside her case and draws it into it; a legacy question spelling is a question. */
  assert.equal(w.cit.drawQuestion({ project: p, inquiry: ` ${hiddenQ} `, ...ANN }).cited[0], hiddenQ);
  w.put("FOCUS-2026-0001", inqMd("FOCUS-2026-0001").replace("object_type: inquiry", "object_type: focus").replace("schema: inquiry@1", "schema: focus@1"));
  assert.deepEqual(w.cit.drawQuestion({ project: p, inquiry: "FOCUS-2026-0001", ...ANN }).cited, ["FOCUS-2026-0001"]);
});

test("R14, R5: RETIRED_NOT_CITABLE (C-33.39) is asked of the question through R5's one predicate", () => {
  const { w, p } = setup();
  /* No question's state machine carries `retired` today, so R5 answers false for every one; the act asks it all the
     same, and a question R5 answers true for is refused, naming it. */
  assert.equal(w.cit.retiredNotCitable(Q), false);
  /* So the act is driven over a record whose head reads the question `retired`, the state R5 asks of any type. */
  const record = new Proxy(w.record, { get(t, k) {
    if (k === "head") return (id) => { const h = t.head(id); return id === Q && h ? { ...h, currentState: "retired" } : h; };
    const v = t[k]; return typeof v === "function" ? v.bind(t) : v;
  } });
  const ask = new Citation({ record, membership: w.membership, promotion: w.promotion, content: w.content,
                             retrieval: w.retrieval, provenance: w.prov, inquiry: w.inq, now: () => NOW });
  assert.equal(ask.retiredNotCitable(Q), true, "a control: R5 answers true for it");
  const r = ask.drawQuestion({ project: p, inquiry: Q, ...ANN });
  carries(r, "RETIRED_NOT_CITABLE");
  assert.deepEqual(r.offenders, [Q]);
  assert.doesNotMatch(w.md(p), new RegExp(Q));
});

test("R14: SEVERED_EDGE (C-33.19) when the case holds a severed edge to the question, which reinstate (R4) restores and drawQuestion never re-draws", async () => {
  const { w, p } = setup();
  assert.equal(w.cit.drawQuestion({ project: p, inquiry: Q, ...ANN }).ok, true);
  const h = await w.select([Q]);
  assert.equal(w.cit.sever({ project: p, handle: h, ...ANN, owner: "o", reason: "answered" }).ok, true);
  const before = w.md(p);
  const r = w.cit.drawQuestion({ project: p, inquiry: Q, ...ANN });
  carries(r, "SEVERED_EDGE");
  assert.deepEqual(r.offenders, [Q]);
  assert.equal(w.md(p), before);
  assert.equal(w.cit.reinstate({ project: p, handle: h, ...ANN, owner: "o", reason: "live again" }).ok, true);
  assert.deepEqual(w.cit.drawQuestion({ project: p, inquiry: Q, ...ANN }).alreadyCited, [Q]);
});

test("R14: NO_BUNDLE_MD, UNPARSEABLE_FRONTMATTER, UNSPLICEABLE_REFERENCES and CITATION_TOO_LARGE, each writing nothing", () => {
  const { w, p } = setup();
  assert.deepEqual(w.withDocument(p, null).drawQuestion({ project: p, inquiry: Q, ...ANN }), { ok: false, reason: "NO_BUNDLE_MD", project: p });
  assert.equal(w.withDocument(p, "no frontmatter").drawQuestion({ project: p, inquiry: Q, ...ANN }).reason, "UNPARSEABLE_FRONTMATTER");
  assert.equal(w.withDocument(p, w.md(p).replace("references: []", "references: somewhere")).drawQuestion({ project: p, inquiry: Q, ...ANN }).reason,
               "UNSPLICEABLE_REFERENCES");
  const big = w.project("Big case", "ann", { body: "\n" + "z".repeat(INLINE_MAX - projMd("Big case").length - 120) + "\n" });
  const before = w.md(big);
  const r = w.cit.drawQuestion({ project: big, inquiry: Q, ...ANN });
  assert.deepEqual([r.ok, r.reason, r.requested, r.limit, r.roomFor], [false, "CITATION_TOO_LARGE", 1, INLINE_MAX, 0]);
  assert.ok(r.bytes > INLINE_MAX);
  assert.equal(w.md(big), before);
});

test("R14: a refusal from the write is answered unchanged, with handle null and drift false, nothing written; the write refusing nothing, the edge lands", () => {
  const { w, p } = setup();
  let refusal = basisRefusals().basisRefused;
  w.promotion.registerStep("citation-test", { check: (c) => (c.bundleId === p ? refusal : null) });
  const before = w.md(p);
  assert.deepEqual(w.cit.drawQuestion({ project: p, inquiry: Q, ...ANN }), { ...refusal, project: p, handle: null, drift: false });
  assert.equal(w.md(p), before);
  refusal = null;
  assert.equal(w.cit.drawQuestion({ project: p, inquiry: Q, ...ANN }).ok, true);
});

test("R14: the refusals come in the stated order — the case, the actor, the note, the question, then the document", () => {
  const { w, p } = setup();
  const order = (args) => w.cit.drawQuestion({ project: p, inquiry: Q, ...ANN, ...args }).reason;
  assert.equal(order({ ...VERA, note: '"', inquiry: "nope" }), "NO_SUCH_PROJECT");
  const disc = w.project("Door", "ann", { visibility: "discoverable" });
  assert.equal(w.membership.projectInvite({ projectId: disc, handle: "vera", by: "ann" }).ok, true);
  assert.equal(w.cit.drawQuestion({ project: disc, inquiry: "nope", ...VERA, note: '"' }).reason, "PROJECT_ACT_NOT_A_PARTICIPANT");
  assert.equal(order({ note: '"', inquiry: "nope" }), "BAD_NOTE");
  assert.equal(order({ inquiry: "nope" }), "NO_SUCH_QUESTION");
  assert.equal(w.withDocument(p, null).drawQuestion({ project: p, inquiry: "INFO-2026-0001-doc", ...ANN }).reason, "NOT_AN_INQUIRY");
  assert.equal(w.withDocument(p, null).drawQuestion({ project: p, inquiry: Q, ...ANN }).reason, "NO_BUNDLE_MD");
});

test("R14, R7, R10, R12: through the op route at report weight whatever the caller sends; its words name no place and call the Civicsmith nothing else", () => {
  const { w, p } = setup();
  const url = new URL(`http://x/?project=${p}&inquiry=${Q}&viewer=member:ann&identity=member:ann&author=member:ann&weight=refuse&note=n`);
  const r = citationOps(w.cit, url).drawquestion();
  assert.deepEqual([r.ok, r.weight, r.cited], [true, "report", [Q]]);
  const answers = [r, w.cit.drawQuestion({ project: p, inquiry: Q, ...ANN }), w.cit.drawQuestion({ project: p, inquiry: "nope", ...ANN }),
    w.cit.drawQuestion({ project: p, inquiry: "INFO-2026-0001-doc", ...ANN }), w.cit.drawQuestion({ project: Q, inquiry: Q, ...ANN }),
    w.cit.drawQuestion({ project: p, inquiry: Q, ...ANN, note: '"' })];
  assert.ok(answers.filter((a) => typeof a.detail === "string").length >= 5, "the details are read (a control)");
  for (const a of answers) {
    assert.doesNotMatch(JSON.stringify(a), /oakland|alameda|california|berkeley|san francisco|county|city of/i);
    if (typeof a.detail === "string") assert.doesNotMatch(a.detail, /\b(instance|plane|server|copy)\b/i, a.reason);
  }
});
