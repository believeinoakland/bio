/* screens-inquiry FR-28 (B15), R107: a rerun project's "Compare with the original" tab on `project`, on interface-shell's served
 * page over a scripted plane. `rerunread` and `rerunpair` are `case-import`'s declared ops (its R31, R30), their fixtures the
 * shapes `rerunRead` answers; the harness compares every request with the owner's declaration (R104). Every expectation is a
 * word read by key (R44); grades are read through the kit's marks. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn } from "../interface-shell/harness.mjs";
import { importedFindingRef } from "../../../src/inquiry-grammar/index.mjs";
import { open, main, actsIn, button, fill, press, says, section, word, P, Q, Q2 } from "./fixtures.mjs";

/* every owner's declarations, registered once before the first read (test-support R17, K4245) */
/* the weights of the two owners whose acts these tests press (registering every owner's weights is refused today by `accountusesset`'s row, an owner's defect reported to BOB) */


const at = "/app/project/" + P;
const IMPORT = "a".repeat(64);
const F1 = "INQ-2026-0004-port-paid-less", F2 = "INQ-2026-0005-council-not-told";
const ref = (f) => importedFindingRef(IMPORT, f);
const PAIR = (c, k) => ({ capture: { state: "graded", grade: c }, connection: { state: "graded", grade: k } });
const TITLE_Q = "Is the city repairing reported potholes within seven days?", TITLE_Q2 = "Does closed mean repaired?";
/* case-import R31's answer: per declared rerun, per source finding in the edition's order, with the lens difference once */
const RERUN = (over = {}, run = {}) => ({ ok: true, project: P, limit: "A re-check re-weighs the analysis that exists.", disagreement_note: "The disagreement shown is the difference between the two lenses.", wrote: false,
  reruns: [{ rerun: "RER-1", project: P, import: IMPORT, group: "west-oakland", case: "port-lease-revenue", edition: 2, declared_by: "mai", declared_at: "2026-10-05T09:00:00Z",
    findings: [
      { finding: F1, ref: ref(F1), role: "supports", source: { pair: PAIR("B", "B"), lens_statements: [] }, paired: true, pairings: [{ own_finding: Q, pair: PAIR("B", "C"), agree: false }] },
      { finding: F2, ref: ref(F2), role: "supports", source: { pair: PAIR("C", "C"), lens_statements: [] }, paired: false, pairings: [] }],
    lens_difference: { only_source: [{ kind: "scrutiny", subject: "the Port Authority", text: "We read the Authority's own reports closely." }],
      only_own: [{ kind: "inference", subject: "the City Administrator", text: "A late reply is not read as a refusal." }], shared: 2 },
    pairing_history: [], ...run }], ...over });
const compare = (p) => main(p).querySelector('[data-rerun="compare"]');
const rowOf = (p, finding) => compare(p).querySelector(`[data-source-finding="${finding}"]`);
const tab = async (p) => { await press(p, "rerunread"); return compare(p); };

test("R107 a rerun project draws its tab; pressing it draws the source's findings, the two grades side by side, the pairing and the lens difference as two lists with their count", async () => {
  const p = await open(at, { plane: { rerunread: ok(RERUN()) } });
  assert.equal(p.byOp("rerunread")[0].query.project, P);
  assert.ok(says(button(p, "rerunread"), "act.owed_rerunread.label.project"), "the tab");
  assert.ok(says(main(p).querySelector('[data-rerun="head"]'), "screen.project.cmp_head", { title: "port-lease-revenue", edition: "2", team: "west-oakland" })
    && says(main(p).querySelector('[data-rerun="head"]'), "screen.project.cmp_unchanged"));
  assert.equal(compare(p), null, "the comparison opens on the tab");
  const c = await tab(p);
  assert.ok(says(c, "screen.project.cmp_names") && says(c, "screen.project.cmp_not_cause"), "the system names the lens difference and the pairing, not a cause");
  /* the lens difference above the findings: two lists and what both hold */
  const theirs = c.querySelector('[data-lens="only_source"]'), ours = c.querySelector('[data-lens="only_own"]');
  assert.ok(says(theirs, "screen.project.cmp_only_theirs") && theirs.textContent.includes("the Port Authority") && theirs.textContent.includes("We read the Authority's own reports closely."));
  assert.ok(ours.textContent.includes("the City Administrator") && ours.textContent.includes("A late reply is not read as a refusal."));
  assert.ok(says(c, "screen.project.cmp_both", { count: "2" }));
  const order = [...c.querySelectorAll("[data-lens], [data-source-finding]")].map((e) => e.getAttribute("data-lens") || e.getAttribute("data-source-finding"));
  assert.deepEqual(order, ["only_source", "only_own", F1, F2], "the lens difference above the findings");
  assert.ok(says(c, "screen.project.cmp_lens_diff") && says(c, "screen.project.cmp_findings"));
  /* the paired and disagreeing finding: both pairs side by side, the pairing, and that the two readings differ */
  const one = rowOf(p, F1);
  const marks = one.querySelectorAll(".cs-grade").map((g) => [g.getAttribute("data-scale"), g.textContent.slice(-1)]);
  assert.deepEqual(marks, [["capture", "B"], ["connection", "B"], ["capture", "B"], ["connection", "C"]], "theirs then ours");
  assert.ok(says(one, "screen.project.cmp_paired", { finding: TITLE_Q }) && says(one, "screen.project.cmp_differ"));
  assert.equal(one.getAttribute("data-agree"), "false");
  /* the other finding: unpaired, with the choice among this project's findings and the pairing act */
  const two = rowOf(p, F2);
  assert.ok(says(two, "screen.project.cmp_unpaired") && !says(two, "screen.project.cmp_differ"));
  assert.deepEqual(two.querySelectorAll(".cs-grade").map((g) => g.textContent.slice(-1)), ["C", "C"]);
  const options = p.doc.getElementById("project-pair-own-1").querySelectorAll("option").map((o) => [o.getAttribute("value"), o.textContent]);
  assert.deepEqual(options, [["", word("screen.project.cmp_pair_none")], [Q, TITLE_Q], [Q2, TITLE_Q2]], "none chosen for her");
  assert.ok(says(two, "screen.project.cmp_pair_label") && says(button(p, "rerunpair", two), "act.owed_rerunpair.label.project"));
  for (const k of ["cmp_pair_is", "cmp_pair_strength", "cmp_pair_withdraw"]) assert.ok(says(c, "screen.project." + k), k);
  /* control: pressing the tab again closes it */
  await press(p, "rerunread");
  assert.equal(compare(p), null);
});

test("R107 pairing sends rerunpair with the project, the source finding's reference, her own finding and the edition; withdrawing sends the same with withdraw; the page then reads again", async () => {
  let paired = false;
  const read = () => ok(RERUN({}, paired ? { findings: [
    { finding: F1, ref: ref(F1), role: "supports", source: { pair: PAIR("B", "B"), lens_statements: [] }, paired: true, pairings: [{ own_finding: Q, pair: PAIR("B", "C"), agree: false }] },
    { finding: F2, ref: ref(F2), role: "supports", source: { pair: PAIR("C", "C"), lens_statements: [] }, paired: true, pairings: [{ own_finding: Q2, pair: PAIR("C", "C"), agree: true }] }] } : {}));
  const p = await open(at, { plane: { rerunread: read, rerunpair: () => { paired = true; return ok({ ok: true }); } } });
  await tab(p);
  /* control: nothing chosen sends nothing and says so */
  assert.ok(says(await press(p, "rerunpair", { within: rowOf(p, F2) }), "screen.project.cmp_pair_none"));
  assert.equal(p.byOp("rerunpair").length, 0);
  fill(p, { "project-pair-own-1": Q2 });
  await press(p, "rerunpair", { within: rowOf(p, F2) });
  assert.deepEqual(p.byOp("rerunpair").map((r) => r.body), [{ project: P, source_finding: ref(F2), own_finding: Q2, edition: 2 }]);
  assert.equal(p.byOp("rerunread").length, 2, "read again after the pairing");
  assert.ok(says(rowOf(p, F2), "screen.project.cmp_paired", { finding: TITLE_Q2 }), "now paired");
  assert.equal(rowOf(p, F2).getAttribute("data-agree"), "true");
  assert.ok(!says(rowOf(p, F2), "screen.project.cmp_differ"), "the two readings agree: no difference said");
  /* withdrawing a pairing */
  await press(p, "rerunpair", { within: rowOf(p, F1) });
  assert.deepEqual(p.byOp("rerunpair")[1].body, { project: P, source_finding: ref(F1), own_finding: Q, edition: 2, withdraw: true });
  assert.ok(!actsIn(rowOf(p, F1)).some((op) => op !== "rerunpair"));
});

test("R107 the refusals of a pairing are drawn by their words with what to do next; a refusal the design holds no word for is drawn by the plane's own words", async () => {
  const draw = async (answer) => {
    const p = await open(at, { plane: { rerunread: ok(RERUN()), rerunpair: answer } });
    await tab(p);
    fill(p, { "project-pair-own-1": Q2 });
    return press(p, "rerunpair", { within: rowOf(p, F2) });
  };
  const member = await draw(refusedIn("PROJECT_ACT_NOT_A_PARTICIPANT"));
  assert.ok(says(member, "screen.project.cmp_refused_member") && says(member, "screen.project.cmp_refused_member_next"));
  const own = await draw(refusedIn("NO_SUCH_OWN_FINDING", "That is not a finding of this project."));
  assert.ok(says(own, "screen.project.cmp_refused_own") && says(own, "screen.project.cmp_refused_own_next"));
  const other = await draw(refusedIn("NOT_A_RERUN", "This project is declared no rerun of that edition."));
  assert.ok(other.textContent.includes("This project is declared no rerun of that edition."));
  assert.ok(!says(other, "screen.project.cmp_refused_member") && !says(other, "screen.project.cmp_refused_own"), "control: the other refusals are not these");
});

test("R107 controls: a project that is no rerun draws no tab and no comparison; a lens that could not be read draws its sentence, not an empty difference; an undetermined agreement says nothing of a difference", async () => {
  for (const answer of [ok({ ok: true, project: P, reruns: [] }), ok(null)]) {
    const p = await open(at, { plane: { rerunread: answer } });
    assert.ok(!actsIn(main(p)).includes("rerunread") && !actsIn(main(p)).includes("rerunpair"));
    assert.equal(main(p).querySelector('[data-rerun]'), null);
  }
  const lens = await open(at, { plane: { rerunread: ok(RERUN({}, { lens_difference: null, lens_difference_stated: "the plane states this note itself" })) } });
  const c = await tab(lens);
  assert.ok(c.textContent.includes("the plane states this note itself"));
  assert.equal(c.querySelector("[data-lens]"), null, "no empty difference is drawn");
  assert.ok(!says(c, "screen.project.cmp_both", { count: "0" }));
  const unknown = await open(at, { plane: { rerunread: ok(RERUN({}, { findings: [{ finding: F1, ref: ref(F1), role: "supports", source: { pair: PAIR("B", "B"), lens_statements: [] }, paired: true,
    pairings: [{ own_finding: Q, pair: { capture: { state: "unrated", grade: null }, connection: { state: "unrated", grade: null } }, agree: "undetermined" }] }] })) } });
  const u = await tab(unknown);
  assert.ok(says(rowOf(unknown, F1), "screen.project.cmp_paired", { finding: TITLE_Q }) && !says(rowOf(unknown, F1), "screen.project.cmp_differ"));
  assert.equal(rowOf(unknown, F1).getAttribute("data-agree"), "undetermined");
  assert.ok(u);
  /* a read that failed is drawn failed, beside the rest */
  const bad = await open(at, { plane: { rerunread: refusedIn("SOME_REFUSAL", "Could not read it.") } });
  assert.ok(main(bad).querySelector('[data-rerun="failed"] [data-state="failed"]'));
});
