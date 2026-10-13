/* case-inputs (T23; DEC-101 (1), K1025, K1058): drafts of a new edition's statement of what changed (R6, was
   case-authoring R39), and the one read of a draft `case-authoring` R38 makes (R7). Copied from case-authoring's
   drafts.test.mjs; its R38 arm (a draft adopted or rewritten at op=publish) stays with case-authoring. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { caseInputsOps, WHAT_CHANGED_MAX, WHAT_CHANGED_DRAFTS_MAX } from "../../../src/case-inputs/index.mjs";
import { proposalLabel, PROPOSAL_STATES } from "../../../src/record-grammar/index.mjs";

const AI = "class:ai";

/* Edition 1 of a case prepared and signed by alice's project (bo joined); mallory is a member who cannot see the
   project. */
function setup() {
  const w = world();
  for (const m of ["alice", "bo", "mallory"]) w.member(m);
  const P = w.project("Team", "alice");
  w.join(P, "bo");
  const caseId = w.ratifiedCase(P, "alice");
  return { w, P, caseId };
}

test("R6: a machine's draft is stored labelled machine work by proposalLabel(proposedBy, \"edition_statement\") and is never a statement — no case document, no edition, nothing on the case — and a member's is labelled a member's proposal", () => {
  const { w, caseId } = setup();
  const docs = w.snapshot().case_documents, cases = w.snapshot().published_cases;
  const m = w.ci.proposeWhatChanged({ case: caseId, text: "The amendments now appear by name.", proposedBy: AI, viewer: AI });
  assert.equal(m.ok, true, JSON.stringify(m));
  assert.match(m.draft.id, /^WCD-\d{4}-\d{4}$/);
  assert.deepEqual(m.draft.label, proposalLabel(AI, "edition_statement"));
  assert.deepEqual([m.draft.label.machine_work, m.draft.label.state, m.draft.label.says],
    [true, "machine_proposed", PROPOSAL_STATES.edition_statement.machine_proposed]);
  assert.match(m.next, /never the group's statement/);
  const b = w.ci.proposeWhatChanged({ case: caseId, text: "We excluded the amendments.", proposedBy: "bo", viewer: V("bo") });
  assert.deepEqual([b.draft.label.machine_work, b.draft.label.state, b.draft.label.by], [false, "member_proposed", "bo"]);
  /* never a statement: nothing authored, no edition, the published record untouched */
  assert.equal(w.snapshot().case_documents, docs);
  assert.equal(w.snapshot().published_cases, cases);
  /* negative control: the label is the proposer's, and a blank proposer is `unstated`, never a member */
  const u = w.ci.proposeWhatChanged({ case: caseId, text: "x", proposedBy: "  ", viewer: AI });
  assert.deepEqual([u.draft.label.state, u.draft.label.by], ["unstated", null]);
});

test("R6: whatChangedDrafts lists the case's drafts oldest first, each with its id, text, label and when; drafts are append-only, two identical proposals two drafts; another case's drafts are not this case's", () => {
  const { w, P, caseId } = setup();
  const times = ["2026-09-28T01:00:00.001Z", "2026-09-28T01:00:00.002Z", "2026-09-28T01:00:00.003Z"];
  const made = [];
  for (const [i, [text, by]] of [["first", AI], ["second", "bo"], ["first", AI]].entries()) {
    w.clock.ms = times[i];
    made.push(w.ci.proposeWhatChanged({ case: caseId, text, proposedBy: by, viewer: by === AI ? AI : V(by) }).draft);
  }
  const list = w.ci.whatChangedDrafts({ case: caseId, viewer: V("alice") });
  assert.deepEqual(list, { ok: true, case: caseId, truncated: false,
    drafts: made.map((d) => ({ id: d.id, text: d.text, label: d.label, at: d.at })) });
  assert.deepEqual(list.drafts.map((d) => [d.text, d.at]), [["first", times[0]], ["second", times[1]], ["first", times[2]]]);
  assert.equal(new Set(list.drafts.map((d) => d.id)).size, 3, "two identical proposals are two drafts");
  /* append-only: reading one for an edition (R7) leaves every draft as it was */
  const before = w.snapshot().what_changed_drafts;
  assert.deepEqual(w.ci.whatChangedDraftOf(caseId, made[0].id), { draft_id: made[0].id, text: "first" });
  assert.equal(w.snapshot().what_changed_drafts, before, "nothing updated or removed");
  /* another case's drafts are not this case's */
  const o = w.ratifiedCase(P, "alice");
  w.ci.proposeWhatChanged({ case: o, text: "elsewhere", proposedBy: AI, viewer: AI });
  assert.equal(w.ci.whatChangedDrafts({ case: caseId, viewer: V("alice") }).drafts.length, 3);
  assert.equal(w.ci.whatChangedDrafts({ case: o, viewer: V("alice") }).drafts.length, 1);
});

test("R6: a list names at most WHAT_CHANGED_DRAFTS_MAX (500) drafts, oldest first, and says so (truncated); 500 are not truncated", () => {
  const { w, caseId } = setup();
  assert.equal(WHAT_CHANGED_DRAFTS_MAX, 500);
  for (let i = 0; i < 501; i++)
    w.st.sql.exec(`INSERT INTO what_changed_drafts (draft_id, case_id, text, proposed_by, label, at) VALUES (?,?,?,?,?,?)`,
                  `WCD-2026-${String(i).padStart(4, "0")}`, caseId, `draft ${i}`, "bo",
                  JSON.stringify(proposalLabel("bo", "edition_statement")), "2026-09-28T01:00:00.000Z");
  const cut = w.ci.whatChangedDrafts({ case: caseId, viewer: V("bo") });
  assert.deepEqual([cut.drafts.length, cut.truncated, cut.drafts[0].text, cut.drafts[499].text], [500, true, "draft 0", "draft 499"]);
  w.st.sql.exec(`DELETE FROM what_changed_drafts WHERE draft_id='WCD-2026-0500'`);
  const whole = w.ci.whatChangedDrafts({ case: caseId, viewer: V("bo") });
  assert.deepEqual([whole.drafts.length, whole.truncated], [500, false]);
});

test("R6: a case not published, one the viewer cannot see, and none at all are NO_SUCH_CASE, answered alike, and an empty, blank, non-string or over-8,000-character text BAD_WHAT_CHANGED; each writes nothing", () => {
  const { w, P, caseId } = setup();
  /* a case authored and not signed: edition 1 of a new case, prepared only */
  const prepared = w.prepare(P, "alice");
  const before = w.snapshot();
  const answers = [
    w.ci.proposeWhatChanged({ case: prepared.caseId, text: "t", proposedBy: "alice", viewer: V("alice") }),
    w.ci.proposeWhatChanged({ case: caseId, text: "t", proposedBy: "mallory", viewer: V("mallory") }),
    w.ci.proposeWhatChanged({ case: caseId, text: "t", proposedBy: "x", viewer: "nobody" }),
    w.ci.proposeWhatChanged({ case: "CASE-2026-0404", text: "t", proposedBy: "alice", viewer: V("alice") }),
    w.ci.proposeWhatChanged({ text: "t", proposedBy: "alice", viewer: V("alice") }),
    w.ci.whatChangedDrafts({ case: prepared.caseId, viewer: V("alice") }),
    w.ci.whatChangedDrafts({ case: caseId, viewer: V("mallory") }),
    w.ci.whatChangedDrafts({ case: "CASE-2026-0404", viewer: V("alice") }),
  ];
  for (const a of answers) assert.equal(a.reason, "NO_SUCH_CASE", JSON.stringify(a));
  assert.equal(new Set(answers.map((a) => JSON.stringify(a))).size, 1, "byte-identical");
  /* NO_SUCH_CASE first: an unseen case with bad words is still NO_SUCH_CASE */
  assert.equal(w.ci.proposeWhatChanged({ case: caseId, text: "", viewer: V("mallory") }).reason, "NO_SUCH_CASE");
  for (const text of [undefined, null, 7, "", "   ", "\n\t", "x".repeat(WHAT_CHANGED_MAX + 1),
                      "\u{1F4DC}".repeat(WHAT_CHANGED_MAX + 1)]) {
    const r = w.ci.proposeWhatChanged({ case: caseId, text, proposedBy: AI, viewer: AI });
    assert.deepEqual([r.ok, r.reason, r.max], [false, "BAD_WHAT_CHANGED", 8000], JSON.stringify(text)?.slice(0, 20));
  }
  assert.deepEqual(w.snapshot(), before, "nothing written: no draft, no minted id");
  /* negative controls: exactly 8,000 code points, astral or not, and a participant who sees the project */
  for (const text of ["x".repeat(WHAT_CHANGED_MAX), "\u{1F4DC}".repeat(WHAT_CHANGED_MAX)])
    assert.equal(w.ci.proposeWhatChanged({ case: caseId, text, proposedBy: AI, viewer: AI }).ok, true);
  assert.equal(w.ci.proposeWhatChanged({ case: caseId, text: "t", proposedBy: "bo", viewer: V("bo") }).ok, true);
  assert.equal(w.ci.whatChangedDrafts({ case: caseId, viewer: V("bo") }).drafts.length, 3);
  assert.equal(WHAT_CHANGED_MAX, 8000);
});

test("R7: whatChangedDraftOf answers {draft_id, text} for the draft of the case the id names, or null when none does — a draft of another case, an id no draft holds, a blank or absent argument; it asks no viewer, writes nothing and never throws", () => {
  const { w, P, caseId } = setup();
  const d = w.ci.proposeWhatChanged({ case: caseId, text: "The amendments now appear by name.", proposedBy: AI, viewer: AI }).draft;
  const o = w.ratifiedCase(P, "alice");
  const other = w.ci.proposeWhatChanged({ case: o, text: "elsewhere", proposedBy: AI, viewer: AI }).draft;
  const before = w.snapshot();
  assert.deepEqual(w.ci.whatChangedDraftOf(caseId, d.id), { draft_id: d.id, text: "The amendments now appear by name." });
  assert.deepEqual(w.ci.whatChangedDraftOf(` ${caseId} `, ` ${d.id} `), { draft_id: d.id, text: d.text }, "trimmed");
  for (const [c, id] of [[caseId, other.id], [o, d.id], [caseId, "WCD-2026-0000"], [caseId, ""], [caseId, null], [null, d.id],
                         [undefined, undefined], ["CASE-2026-0404", d.id]])
    assert.equal(w.ci.whatChangedDraftOf(c, id), null, `${c} ${id}`);
  assert.deepEqual(w.snapshot(), before, "it writes nothing");
  /* never throws: a store that fails to read answers null */
  w.st.db.exec(`ALTER TABLE what_changed_drafts RENAME TO wcd_gone`);
  assert.equal(w.ci.whatChangedDraftOf(caseId, d.id), null);
  w.st.db.exec(`ALTER TABLE wcd_gone RENAME TO what_changed_drafts`);
  /* a draft of a case the reader cannot see is still answered: it asks no viewer (R38 judges sight itself) */
  assert.deepEqual(w.ci.whatChangedDraftOf(o, other.id), { draft_id: other.id, text: "elsewhere" });
});

test("R6, R16 (K3): the ops route a draft's words from the body and the case from either; proposedBy is the author stamp and viewer the viewer stamp, a body's copies never honoured; R11: a whole-store purge clears the drafts", () => {
  const { w, caseId } = setup();
  const url = (op, s = "") => new URL(`http://do/${op}?viewer=${encodeURIComponent(AI)}&author=${encodeURIComponent(AI)}${s}`);
  const r = caseInputsOps(w.ci, url("whatchangedpropose", `&case=${caseId}`),
                          { text: "From the body.", proposedBy: "alice", viewer: V("alice") }).whatchangedpropose();
  assert.deepEqual([r.ok, r.draft.text, r.draft.label.by, r.draft.label.machine_work], [true, "From the body.", AI, true]);
  const viaBody = caseInputsOps(w.ci, url("whatchangedpropose"), { case: caseId, text: "Case in the body." }).whatchangedpropose();
  assert.equal(viaBody.ok, true);
  const viaQuery = caseInputsOps(w.ci, url("whatchangedpropose", `&case=${caseId}&text=${encodeURIComponent("From the query.")}`), null)
    .whatchangedpropose();
  assert.deepEqual([viaQuery.ok, viaQuery.draft.text], [true, "From the query."], "the words from the query when the body has none");
  const list = caseInputsOps(w.ci, url("whatchangeddrafts", `&case=${caseId}`), { viewer: V("mallory") }).whatchangeddrafts();
  assert.deepEqual(list.drafts.map((d) => d.text), ["From the body.", "Case in the body.", "From the query."]);
  /* each arm answers exactly what its service answers */
  assert.deepEqual(list, w.ci.whatChangedDrafts({ case: caseId, viewer: AI }));
  /* negative control: the viewer stamp, not a body's, decides sight */
  const hidden = caseInputsOps(w.ci, new URL(`http://do/whatchangeddrafts?viewer=${encodeURIComponent(V("mallory"))}&case=${caseId}`),
                               { viewer: AI }).whatchangeddrafts();
  assert.equal(hidden.reason, "NO_SUCH_CASE");
  w.record.purge({ bundleId: "INQ-2026-0001-q" });
  assert.equal(w.count("what_changed_drafts"), 3, "keyed to no bundle");
  w.record.purge({});
  assert.equal(w.count("what_changed_drafts"), 0);
});
