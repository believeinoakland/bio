/* hypotheses in T41 (T41-16; D33, D46 A, D3, D18): the system's proposals (R16–R18) and a note shared with a project
   (R19–R21, R14 as amended), at the interface: the acts, the reads, the leg check through a promotion, the ops, and
   the store read directly for what a withdrawal and a deletion leave behind. Each with a negative control (K874). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, ANN, OUTSIDER, BOSS, INQ, E1, E2, E3 } from "./fixture.mjs";
import { hypothesesOps, HYPOTHESES_CHECKS, SYSTEM_LABEL, PROPOSALS_HEADING, PROPOSALS_TABLE, SHARES_TABLE, SHARE_ID_RE }
  from "../../../src/hypotheses/index.mjs";
import { ACCEPTANCE_FORMS, isHypothesisId } from "../../../src/record-grammar/index.mjs";
import { isRecordId } from "../../../src/connection-grammar/index.mjs";
import * as inquiryModule from "../../../src/inquiry/index.mjs";

const PROJ = "PROJ-2026-0001";
const HIDDEN = "INQ-2026-0009-hidden";
const VERA = "member:vera";
const row = (code) => HYPOTHESES_CHECKS[code];
const url = (op, q = {}) => { const u = new URL(`https://plane.example/?op=${op}`); for (const [k, v] of Object.entries(q)) u.searchParams.set(k, v); return u; };
const refusedAs = (r, code) => assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, code, code, row(code).check, row(code).translation], JSON.stringify(r).slice(0, 200));
const everything = (w) => w.rows(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)
  .map((t) => `${t.name}:${JSON.stringify(w.rows(`SELECT * FROM "${t.name}"`))}`).join("\n");
const PROPOSAL = { inquiry: INQ, kind: "relation", statement: "E1 and E2 share an officer.", about: { from: E1, to: E2 },
                   how: "Two filings name the same treasurer.", false_alarm_rate: 0.12, run: "RUN-7" };

/** A world with an open inquiry, a fenced one in PROJ (Ann joined), and vera, a second joined participant of PROJ. */
function setup(deps = {}) {
  const w = world(deps);
  w.bundle(INQ);
  w.fenced(HIDDEN, PROJ, "ann");
  w.st.sql.exec(`INSERT INTO members (member_id, cover, role, status, created, updated) VALUES ('vera', 'c', 'member', 'active', '2026-01-01', '2026-01-01')`);
  w.st.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner, created, updated) VALUES (?, 'vera', 'joined', 0, '2026-01-01', '2026-01-01')`, PROJ);
  return w;
}

/* ---- R16 ---------------------------------------------------------------------------------------------------------- */

test("R16 hypothesisPropose, the machine's only door: stored apart, labelled the system's with how and its false-alarm rate, answered to everyone who sees the inquiry under a heading of its own, never in hypothesesOf as held, never a fact or a leg", () => {
  const w = setup();
  const r = w.h.hypothesisPropose(PROPOSAL);
  assert.deepEqual(Object.keys(r).sort(), ["at", "kind", "label", "ok", "proposal"]);
  assert.deepEqual([r.ok, r.kind, r.label], [true, "relation", SYSTEM_LABEL]);
  assert.ok(isHypothesisId(r.proposal));
  const held = w.hold();
  /* stored apart: never among the held, and no read of a hypothesis answers it */
  const list = w.h.hypothesesOf({ inquiry: INQ, viewer: OUTSIDER });
  assert.deepEqual(list.hypotheses.map((h) => h.hypothesis_id), [held], "the negative control: a member's hold is held");
  assert.deepEqual([list.system_proposals.heading, list.system_proposals.label], [PROPOSALS_HEADING, SYSTEM_LABEL]);
  const [p] = list.system_proposals.items;
  assert.deepEqual([p.proposal, p.label, p.by, p.fact, p.grade, p.how, p.false_alarm_rate, p.run, p.status, p.statement],
    [r.proposal, SYSTEM_LABEL, SYSTEM_LABEL, false, null, PROPOSAL.how, 0.12, "RUN-7", "open", PROPOSAL.statement]);
  assert.deepEqual(w.h.proposalsOf({ inquiry: INQ, viewer: OUTSIDER }).proposals, [p], "to everyone who sees the inquiry");
  assert.equal(w.h.read({ hypothesisId: r.proposal, viewer: ANN }).reason, "NO_SUCH_HYPOTHESIS");
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM hypotheses WHERE hypothesis_id = ?`, r.proposal)[0].n, 0);
  /* no hunch hop from a proposal; the held one's is the control */
  assert.deepEqual(w.h.neighbours({ node: E1, viewer: ANN, scope: INQ }).items.map((i) => i.id), [held]);
  /* offered with its finds: a run's own */
  w.h.hypothesisPropose({ ...PROPOSAL, run: "RUN-8", statement: "Another." });
  assert.deepEqual(w.h.proposalsOf({ inquiry: INQ, viewer: ANN, run: "RUN-7" }).proposals.map((x) => x.proposal), [r.proposal]);
  assert.equal(w.h.proposalsOf({ inquiry: INQ, viewer: ANN }).proposals.length, 2);
  /* never a leg */
  const leg = w.promote("INQ-2026-0002-q", [{ target: r.proposal }]);
  assert.deepEqual([leg.reason, leg.findings[0].code], ["BASIS_REFUSED", "HYPOTHESIS_NOT_A_LEG"]);
  assert.equal(w.promote("INQ-2026-0003-q", [{ target: "INFO-2026-0001-doc" }]).ok, true, "the negative control lands");
  /* a hidden inquiry's proposals answer an outsider exactly as an absent inquiry */
  w.h.hypothesisPropose({ ...PROPOSAL, inquiry: HIDDEN });
  const hid = w.h.proposalsOf({ inquiry: HIDDEN, viewer: OUTSIDER });
  const abs = w.h.proposalsOf({ inquiry: "INQ-2026-0404-x", viewer: OUTSIDER });
  assert.deepEqual({ ...hid, inquiry: null }, { ...abs, inquiry: null });
  assert.equal(w.h.proposalsOf({ inquiry: HIDDEN, viewer: ANN }).proposals.length, 1);
  /* the table: the inquiry's sight, purged with it */
  const d = w.record.declaredTables().find((t) => t.module === "hypotheses" && t.name === PROPOSALS_TABLE);
  assert.deepEqual([d.keys, d.sight, d.export, d.purge], [["bundle_id"], "bundle", "yes", "clear"]);
});

test("R16 hypothesisPropose's refusals in order, each writing nothing: NO_SUCH_BUNDLE, NOT_AN_INQUIRY, UNKNOWN_HYPOTHESIS_KIND, HYPOTHESIS_NO_STATEMENT, BAD_ABOUT, PROPOSAL_NO_HOW, PROPOSAL_NO_RATE, PROPOSAL_NO_RUN", () => {
  const w = setup();
  w.bundle("INFO-2026-0001-doc", { type: "information" });
  const expect = (args, code) => {
    const before = everything(w);
    refusedAs(w.h.hypothesisPropose({ ...PROPOSAL, ...args }), code);
    assert.equal(everything(w), before, "nothing was written");
  };
  const all = { kind: "z", statement: "", about: null, how: "", false_alarm_rate: null, run: "" };
  expect({ ...all, inquiry: "INQ-2026-0404-x" }, "NO_SUCH_BUNDLE");
  expect({ ...all, inquiry: null }, "NO_SUCH_BUNDLE");
  expect({ ...all, inquiry: "INFO-2026-0001-doc" }, "NOT_AN_INQUIRY");
  expect(all, "UNKNOWN_HYPOTHESIS_KIND");
  expect({ ...all, kind: "cause" }, "HYPOTHESIS_NO_STATEMENT");
  expect({ ...all, kind: "cause", statement: "s", about: [E1] }, "BAD_ABOUT");
  expect({ ...all, kind: "cause", statement: "s", about: { from: E1, to: E2 }, how: "  " }, "PROPOSAL_NO_HOW");
  for (const false_alarm_rate of [null, -0.01, 1.01, NaN, "0.1", Infinity]) expect({ false_alarm_rate, run: "" }, "PROPOSAL_NO_RATE");
  for (const run of [null, "", "  ", 7]) expect({ run }, "PROPOSAL_NO_RUN");
  for (const false_alarm_rate of [0, 1]) assert.equal(w.h.hypothesisPropose({ ...PROPOSAL, false_alarm_rate }).ok, true, "the bounds are kept");
  assert.deepEqual(["PROPOSAL_NO_HOW", "PROPOSAL_NO_RATE", "PROPOSAL_NO_RUN"].map((c) => row(c).check), ["C-134.20", "C-134.21", "C-134.22"]);
});

/* ---- R17 ---------------------------------------------------------------------------------------------------------- */

test("R17 hypothesisTakeUp, a member's act (record-grammar R52): holds the proposal by R1 as hers, as proposed, edited or her own instead, noting it came from the system; the acceptance record is kept", () => {
  const w = setup();
  for (const form of ACCEPTANCE_FORMS) {
    const p = w.h.hypothesisPropose(PROPOSAL).proposal;
    const words = form === "as_proposed" ? undefined : `In my words (${form}).`;
    const r = w.h.hypothesisTakeUp({ proposal: p, form, statement: words, by: ANN });
    assert.equal(r.ok, true, JSON.stringify(r));
    assert.ok(isHypothesisId(r.hypothesis_id) && r.hypothesis_id !== p);
    assert.deepEqual(r.acceptance, { proposal: p, form, by: ANN, at: r.acceptance.at, kind: "hypothesis" });
    const h = w.h.read({ hypothesisId: r.hypothesis_id, viewer: ANN }).hypothesis;
    assert.deepEqual([h.held_by, h.label, h.kind, h.statement, h.about], [ANN, "hypothesis", "relation", words ?? PROPOSAL.statement, PROPOSAL.about], "hers, by R1");
    assert.deepEqual(h.came_from, { source: SYSTEM_LABEL, proposal: p, form, how: PROPOSAL.how, false_alarm_rate: 0.12 });
    const view = w.h.proposalsOf({ inquiry: INQ, viewer: OUTSIDER }).proposals.find((x) => x.proposal === p);
    assert.deepEqual([view.status, view.taken_up.by, view.taken_up.form, view.taken_up.hypothesis_id], ["taken_up", ANN, form, r.hypothesis_id]);
  }
  /* the held list holds them as hers; the negative control: one she held herself notes no system */
  const own = w.hold();
  assert.equal("came_from" in w.h.read({ hypothesisId: own, viewer: ANN }).hypothesis, false);
  assert.equal(w.h.hypothesesOf({ inquiry: INQ, viewer: ANN }).hypotheses.length, 4);
  /* the ops arm: the stamp in the body is the member */
  const p = w.h.hypothesisPropose(PROPOSAL).proposal;
  assert.equal(hypothesesOps(w.h, url("hypothesistakeup"), { proposal: p, form: "as_proposed", by: "class:ai" }).hypothesistakeup().reason, "MACHINE_CANNOT_HYPOTHESISE");
  assert.equal(hypothesesOps(w.h, url("hypothesistakeup"), { proposal: p, form: "as_proposed", by: ANN }).hypothesistakeup().ok, true);
  assert.equal(hypothesesOps(w.h, url("hypothesistakeup"), null).hypothesistakeup().reason, "NO_SUCH_PROPOSAL", "an empty body is refused, never thrown");
});

test("R17 hypothesisTakeUp's refusals in order, each writing nothing: NO_SUCH_PROPOSAL (absent, hidden or a held hypothesis, one answer), MACHINE_CANNOT_HYPOTHESISE, PROPOSAL_FORM_UNKNOWN, PROPOSAL_NOT_OPEN, HYPOTHESIS_NO_STATEMENT", () => {
  const w = setup();
  const p = w.h.hypothesisPropose(PROPOSAL).proposal;
  const hiddenP = w.h.hypothesisPropose({ ...PROPOSAL, inquiry: HIDDEN }).proposal;
  const held = w.hold();
  const expect = (args, code) => {
    const before = everything(w);
    const r = w.h.hypothesisTakeUp(args);
    refusedAs(r, code);
    assert.equal(everything(w), before, "nothing was written");
    return r;
  };
  const absent = expect({ proposal: "HYP-2026-0404", form: "x", by: OUTSIDER }, "NO_SUCH_PROPOSAL");
  for (const proposal of [hiddenP, held, null, "nope"])
    assert.deepEqual({ ...expect({ proposal, form: "x", by: OUTSIDER }, "NO_SUCH_PROPOSAL"), proposal: null }, { ...absent, proposal: null });
  for (const by of ["class:ai", "class:daemon"]) expect({ proposal: p, form: "x", by }, "MACHINE_CANNOT_HYPOTHESISE");
  const f = expect({ proposal: p, form: "accept", by: ANN }, "PROPOSAL_FORM_UNKNOWN");
  assert.deepEqual(f.forms, ["as_proposed", "edited", "own_instead"]);
  for (const form of ["edited", "own_instead"]) for (const statement of [undefined, "", "  "]) expect({ proposal: p, form, statement, by: ANN }, "HYPOTHESIS_NO_STATEMENT");
  assert.equal(w.h.hypothesisTakeUp({ proposal: hiddenP, form: "as_proposed", by: ANN }).ok, true, "the negative control: who sees it takes it up");
  assert.equal(w.h.hypothesisTakeUp({ proposal: p, form: "as_proposed", by: OUTSIDER }).ok, true);
  const again = expect({ proposal: p, form: "as_proposed", by: ANN }, "PROPOSAL_NOT_OPEN");
  assert.equal(again.status, "taken_up");
});

/* ---- R18 ---------------------------------------------------------------------------------------------------------- */

test("R18 a proposal set aside by a member stays readable with her reason; refusals in order, each writing nothing: NO_SUCH_PROPOSAL, MACHINE_CANNOT_HYPOTHESISE, PROPOSAL_NO_REASON, PROPOSAL_NOT_OPEN; R1's MACHINE_CANNOT_HYPOTHESISE stands for hold", () => {
  const w = setup();
  const p = w.h.hypothesisPropose(PROPOSAL).proposal;
  const expect = (args, code) => {
    const before = everything(w);
    refusedAs(w.h.hypothesisSetAside(args), code);
    assert.equal(everything(w), before, "nothing was written");
  };
  expect({ proposal: "HYP-2026-0404", reason: "", by: ANN }, "NO_SUCH_PROPOSAL");
  expect({ proposal: p, reason: "", by: "class:ai" }, "MACHINE_CANNOT_HYPOTHESISE");
  expect({ proposal: p, reason: "  ", by: ANN }, "PROPOSAL_NO_REASON");
  const r = w.h.hypothesisSetAside({ proposal: p, reason: "The treasurer is a different person.", by: ANN });
  assert.deepEqual([r.ok, r.proposal, r.set_aside.by, r.set_aside.reason], [true, p, ANN, "The treasurer is a different person."]);
  for (const viewer of [ANN, OUTSIDER]) {
    const v = w.h.proposalsOf({ inquiry: INQ, viewer }).proposals[0];
    assert.deepEqual([v.status, v.statement, v.set_aside], ["set_aside", PROPOSAL.statement, r.set_aside], "readable, with her reason");
  }
  expect({ proposal: p, reason: "again", by: OUTSIDER }, "PROPOSAL_NOT_OPEN");
  refusedAs(w.h.hypothesisTakeUp({ proposal: p, form: "as_proposed", by: OUTSIDER }), "PROPOSAL_NOT_OPEN");
  /* hold stays a member's act alone: a machine's stamp is refused; the member's is the control */
  refusedAs(w.h.hold({ inquiry: INQ, kind: "relation", statement: "s", about: { from: E1, to: E2 }, by: "class:ai" }), "MACHINE_CANNOT_HYPOTHESISE");
  assert.equal(w.h.hold({ inquiry: INQ, kind: "relation", statement: "s", about: { from: E1, to: E2 }, by: ANN }).ok, true);
  assert.deepEqual(["NO_SUCH_PROPOSAL", "PROPOSAL_NOT_OPEN", "PROPOSAL_FORM_UNKNOWN", "PROPOSAL_NO_REASON"].map((c) => row(c).check), ["C-134.23", "C-134.24", "C-134.25", "C-134.26"]);
});

/* ---- R19 ---------------------------------------------------------------------------------------------------------- */

test("R19 noteShare by the note's author, a joined participant: copies the note's current words into a share of that project, seen by its participants, labelled hers and narrative; never evidence, a leg target or a record id, never exported", () => {
  const w = setup();
  const { note } = w.h.noteWrite({ text: "first words", by: ANN });
  w.h.noteRevise({ note, text: "The clerk said March.", by: ANN });
  const r = w.h.noteShare({ note, project: PROJ, by: ANN });
  assert.deepEqual([r.ok, r.project, r.by, r.kind, "warning" in r], [true, PROJ, "ann", "narrative", false]);
  assert.match(r.share, SHARE_ID_RE);
  assert.equal(isRecordId(r.share), false, "no record id");
  for (const viewer of [ANN, VERA]) {
    const s = w.h.sharesOf({ project: PROJ, viewer }).shares;
    assert.deepEqual(s.map((x) => [x.share, x.by, x.text, x.kind, x.evidence]), [[r.share, "ann", "The clerk said March.", "narrative", false]], viewer);
  }
  /* a copy: the note revised after leaves the share's words, and the note stays hers alone */
  w.h.noteRevise({ note, text: "Later thoughts.", by: ANN });
  assert.equal(w.h.sharesOf({ project: PROJ, viewer: VERA }).shares[0].text, "The clerk said March.");
  assert.deepEqual(w.h.notesOf({ viewer: VERA }).notes, []);
  /* never a leg target */
  const leg = w.promote("INQ-2026-0002-q", [{ target: r.share }]);
  assert.deepEqual([leg.reason, leg.findings[0].code, leg.findings[0].check], ["BASIS_REFUSED", "NARRATIVE_NOT_A_LEG", "C-134.28"]);
  assert.equal(w.promote("INQ-2026-0003-q", [{ target: "INFO-2026-0001-doc" }]).ok, true, "the negative control lands");
  const d = w.record.declaredTables().find((t) => t.module === "hypotheses" && t.name === SHARES_TABLE);
  assert.deepEqual([d.keys, d.sight, d.export, d.purge], [["project_id"], "bundle", "never", "clear"]);
  /* the op: the stamp is the body's */
  const n2 = w.h.noteWrite({ text: "via the op", by: VERA }).note;
  assert.equal(hypothesesOps(w.h, url("noteshare"), { note: n2, project: PROJ, by: VERA }).noteshare().ok, true);
  assert.equal(hypothesesOps(w.h, url("noteshare"), null).noteshare().reason, "MACHINE_CANNOT_NOTE", "an empty body is refused, never thrown");
});

test("R19 noteShare's refusals in order, each writing nothing: MACHINE_CANNOT_NOTE, NO_SUCH_NOTE (another's, an administrator's included), PROJECT_ACT_NOT_A_PARTICIPANT (not joined, an administrator, an unknown project)", () => {
  const w = setup();
  w.bundle("PROJ-2026-0002", { type: "project" });
  const { note } = w.h.noteWrite({ text: "mine", by: ANN });
  const out = w.h.noteWrite({ text: "the outsider's", by: OUTSIDER }).note;
  const boss = w.h.noteWrite({ text: "the boss's", by: BOSS }).note;
  const expect = (args, code) => {
    const before = everything(w);
    const r = w.h.noteShare(args);
    assert.deepEqual([r.ok, r.reason], [false, code], JSON.stringify(r).slice(0, 200));
    assert.equal(everything(w), before, "nothing was written");
  };
  for (const by of [null, "", "class:ai"]) expect({ note, project: PROJ, by }, "MACHINE_CANNOT_NOTE");
  expect({ note: 9999, project: PROJ, by: ANN }, "NO_SUCH_NOTE");
  expect({ note: 2, project: PROJ, by: ANN }, "NO_SUCH_NOTE");
  expect({ note, project: "PROJ-2026-0002", by: ANN }, "PROJECT_ACT_NOT_A_PARTICIPANT");
  expect({ note: out, project: PROJ, by: OUTSIDER }, "PROJECT_ACT_NOT_A_PARTICIPANT");
  expect({ note: boss, project: PROJ, by: BOSS }, "PROJECT_ACT_NOT_A_PARTICIPANT");
  for (const project of ["PROJ-2026-0404", null, ""]) expect({ note, project, by: ANN }, "PROJECT_ACT_NOT_A_PARTICIPANT");
  assert.equal(w.h.noteShare({ note, project: PROJ, by: ANN }).ok, true, "the negative control");
});

test("R19 a note naming a person in no public role carries inquiry R59's warning at the act, recorded with the share, never a refusal; one naming none carries no warning", () => {
  const WARN = { code: "PERSON_NO_PUBLIC_ROLE", persons: ["ENT-2026-0003"] };
  const asked = [];
  const w = setup({ personWarning: ({ text, viewer }) => { asked.push(viewer); return text.includes("ENT-2026-0003") ? WARN : null; } });
  const named = w.h.noteWrite({ text: `I think ${E3} is behind it.`, by: ANN }).note;
  const plain = w.h.noteWrite({ text: "The minutes were late.", by: ANN }).note;
  const r = w.h.noteShare({ note: named, project: PROJ, by: ANN });
  assert.deepEqual([r.ok, r.warning], [true, WARN], "warned, never refused");
  assert.equal(asked.at(-1), ANN);
  const ctl = w.h.noteShare({ note: plain, project: PROJ, by: ANN });
  assert.deepEqual([ctl.ok, "warning" in ctl], [true, false]);
  const s = w.h.sharesOf({ project: PROJ, viewer: VERA }).shares;
  assert.deepEqual(s.map((x) => x.warning ?? null), [null, WARN], "recorded with the share, newest first");
  /* a test that throws warns nothing and refuses nothing */
  const t = setup({ personWarning: () => { throw new Error("boom"); } });
  const n = t.h.noteWrite({ text: "x", by: ANN }).note;
  assert.deepEqual([t.h.noteShare({ note: n, project: PROJ, by: ANN }).ok], [true]);
});

test("R19 with no test injected, noteShare asks inquiry R59's own personWarning (K2479) and answers and records exactly what it answers (red until inquiry's T41 merge exports it)", () => {
  assert.equal(typeof inquiryModule.personWarning, "function", "inquiry exports personWarning (its R59)");
  const w = setup();
  for (const text of [`I think ${E3} is behind it.`, "The minutes were late."]) {
    const n = w.h.noteWrite({ text, by: ANN }).note;
    const r = w.h.noteShare({ note: n, project: PROJ, by: ANN });
    const expected = inquiryModule.personWarning({ text, entities: [], viewer: ANN }) ?? null;
    assert.deepEqual([r.ok, r.warning ?? null], [true, expected], text);
  }
});

/* ---- R20 ---------------------------------------------------------------------------------------------------------- */

test("R20 noteUnshare by its author withdraws it: its words leave every answer and every row; the project's record keeps that a note was shared by her on that date and withdrawn on that date; refusals MACHINE_CANNOT_NOTE, NO_SUCH_SHARE (absent, withdrawn or another's, one answer), each writing nothing", () => {
  const w = setup({ personWarning: () => ({ code: "PERSON_NO_PUBLIC_ROLE", persons: ["ENT-2026-0003"] }) });
  const { note } = w.h.noteWrite({ text: "A secret about the treasurer.", by: ANN });
  const sh = w.h.noteShare({ note, project: PROJ, by: ANN });
  const keep = w.h.noteShare({ note: w.h.noteWrite({ text: "vera's narrative", by: VERA }).note, project: PROJ, by: VERA });
  const expect = (args, code) => {
    const before = everything(w);
    const r = w.h.noteUnshare(args);
    assert.deepEqual([r.ok, r.reason], [false, code]);
    if (code === "NO_SUCH_SHARE") refusedAs(r, code);
    assert.equal(everything(w), before, "nothing was written");
    return r;
  };
  for (const by of [null, "class:ai"]) expect({ share: sh.share, by }, "MACHINE_CANNOT_NOTE");
  const absent = expect({ share: "share:00000000-0000-0000-0000-000000000000", by: VERA }, "NO_SUCH_SHARE");
  assert.deepEqual({ ...expect({ share: sh.share, by: VERA }, "NO_SUCH_SHARE"), share: null }, { ...absent, share: null }, "another's answers as an absent one");
  expect({ share: sh.share, by: BOSS }, "NO_SUCH_SHARE");
  const r = w.h.noteUnshare({ share: sh.share, by: ANN });
  assert.deepEqual([r.ok, r.share], [true, sh.share]);
  expect({ share: sh.share, by: ANN }, "NO_SUCH_SHARE");
  const read = w.h.sharesOf({ project: PROJ, viewer: VERA });
  assert.deepEqual(read.shares.map((s) => s.share), [keep.share], "the negative control stands");
  assert.deepEqual(read.withdrawn, [{ share: sh.share, by: "ann", shared: sh.at, withdrawn: r.withdrawn }]);
  assert.ok(!everything(w).replace(/^member_notes:.*$/m, "").includes("secret about the treasurer"), "its words are in no row but her own note");
  assert.ok(!JSON.stringify(w.rows(`SELECT * FROM ${SHARES_TABLE} WHERE share_id = ?`, sh.share)).includes("PERSON_NO_PUBLIC_ROLE"));
  /* the marker is the share's, never the note's: her note is unchanged and holds no sign of the share */
  assert.deepEqual(w.h.notesOf({ viewer: ANN }).notes.map((n) => [n.note, n.text, n.turned]), [[note, "A secret about the treasurer.", []]]);
  assert.equal(hypothesesOps(w.h, url("noteunshare"), { share: keep.share, by: VERA }).noteunshare().ok, true);
});

/* ---- R21 ---------------------------------------------------------------------------------------------------------- */

test("R21 sharesOf answers the project's participants its standing shares, newest first, at most 200; any other viewer, an administrator, a machine and none, reads exactly as a project with no shares", () => {
  const w = setup();
  const ids = [];
  for (let i = 0; i < 205; i++) {
    const n = w.h.noteWrite({ text: `share ${i}`, by: i % 2 ? VERA : ANN }).note;
    ids.push(w.h.noteShare({ note: n, project: PROJ, by: i % 2 ? VERA : ANN }).share);
  }
  const page = w.h.sharesOf({ project: PROJ, viewer: ANN });
  assert.deepEqual([page.shares.length, page.truncated], [200, true]);
  assert.deepEqual(page.shares.map((s) => s.share), [...ids].reverse().slice(0, 200), "newest first");
  assert.deepEqual(page.shares.slice(0, 2).map((s) => [s.text, s.by]), [["share 204", "ann"], ["share 203", "vera"]]);
  const empty = setup().h.sharesOf({ project: PROJ, viewer: ANN });
  assert.deepEqual(empty, { ok: true, project: PROJ, shares: [], truncated: false, withdrawn: [] });
  for (const viewer of [OUTSIDER, BOSS, "admin", "class:ai", null, undefined, ""])
    assert.deepEqual(w.h.sharesOf({ project: PROJ, viewer }), empty, String(viewer));
  assert.deepEqual(hypothesesOps(w.h, url("shares", { project: PROJ, viewer: OUTSIDER }), { viewer: ANN }).shares(), empty, "a body's viewer is ignored");
  assert.equal(hypothesesOps(w.h, url("shares", { project: PROJ, viewer: VERA }), {}).shares().shares.length, 200);
});

/* ---- R14 as amended ----------------------------------------------------------------------------------------------- */

test("R14 never shared except by its author's R19 act, which shares a copy of its words: the no-history rule holds for the private note (a deleted note leaves no sign of itself, even shared), and R20's marker is the share's, never the note's", () => {
  const w = setup();
  const before = w.h.noteWrite({ text: "kept apart", by: ANN }).note;
  const { note } = w.h.noteWrite({ text: "the shared words", by: ANN });
  /* nothing but her act shares a note: no read of the project answers it before */
  assert.deepEqual(w.h.sharesOf({ project: PROJ, viewer: VERA }).shares, []);
  const sh = w.h.noteShare({ note, project: PROJ, by: ANN });
  /* the share holds no note number: its row names none */
  const [shareRow] = w.rows(`SELECT * FROM ${SHARES_TABLE}`);
  assert.deepEqual(Object.keys(shareRow).sort(), ["member", "project_id", "share_id", "shared_at", "text", "warning_json", "withdrawn_at"]);
  /* revised, the note's earlier text is in no row but the share's copy */
  w.h.noteRevise({ note, text: "now different", by: ANN });
  const rows = everything(w);
  assert.equal(rows.split("the shared words").length - 1, 1, "only the copy");
  assert.ok(rows.split("\n").find((l) => l.includes("the shared words")).startsWith(`${SHARES_TABLE}:`));
  /* deleted, the note leaves no sign of itself; the share stands as the copy she shared */
  w.h.noteDelete({ note, by: ANN });
  assert.deepEqual(w.h.notesOf({ viewer: ANN }).notes.map((n) => n.note), [before]);
  assert.ok(!everything(w).includes("now different"));
  assert.deepEqual(w.h.sharesOf({ project: PROJ, viewer: VERA }).shares.map((s) => [s.share, s.text]), [[sh.share, "the shared words"]]);
  /* withdrawn, the marker is the share's; the notes tables hold nothing of it */
  w.h.noteUnshare({ share: sh.share, by: ANN });
  for (const t of ["member_notes", "member_note_turns"]) assert.ok(!JSON.stringify(w.rows(`SELECT * FROM ${t}`)).includes("share"), t);
  /* a note never shared stays her own alone: the negative control */
  assert.ok(!JSON.stringify(w.h.sharesOf({ project: PROJ, viewer: VERA })).includes("kept apart"));
});
