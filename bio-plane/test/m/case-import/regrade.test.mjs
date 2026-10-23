/* case-import: regrade another group's case under a lens (R27, R28; T51; K4169; UC-076), at the module's interface through
   the door (`op=importregrade`) over a fixture edition with one lowered grade. Every refusal is shown with its negative control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { rowOk, seeded, imp, caseFile, door, V, F1, F2, F3 } from "./fixture.mjs";
import { importedFindingRef } from "../../../src/inquiry-grammar/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";
import { LENS_LIMIT, LENS_UNDETERMINED, REGRADE_UNTOUCHED, REGRADE_NO_OWN_LENS, againstBar } from "../../../src/case-import/index.mjs";

const g = (grade) => ({ state: "graded", grade });
const S1 = "scrutiny-official-statements", S2 = "pattern-late-filings";
/* the edition prints two statements of its lens; F1's capture was lowered from B to C by S1 at its first leg */
const PRINTED = [
  { bundle: "BIA-src", id: S1, kind: "scrutiny", subject: "official statements", text: "Check each official statement twice.", justification: "j", citations: [] },
  { bundle: "BIA-src", id: S2, kind: "pattern", subject: "late filings", text: "Late filings are usual here.", justification: "j", citations: [] },
];
const APPS = [{ finding: F1, ord: 0, target: "leg", statement: S1, effect: "grade_lowered", from: "B", to: "C" }];
const OWN_BAR = { capture: "B", connection: "C" };

async function setup() {
  const w = seeded();
  w.script.set(F1, { role: "load_bearing", result: "recreated", pair: { capture: g("C"), connection: g("C") } });
  w.bar(OWN_BAR);
  const a = await imp(w, caseFile({ apps: APPS, printedLens: PRINTED }));
  assert.equal(a.ok, true, JSON.stringify(a).slice(0, 300));
  const regrade = (lens, who = "alice", x = {}) => door(w, "importregrade", { viewer: V(who), import: a.import, edition: 1, lens, ...x });
  return { w, a, regrade };
}
const by = (r) => Object.fromEntries(r.findings.map((f) => [f.finding, f]));

test("R27 as_published moves nothing: every finding is as the source published it, nothing moved, no statement named, and the answer states the checker's limit by its key", async () => {
  const { w, a, regrade } = await setup();
  const before = w.snapshot();
  const r = await regrade("as_published");
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual([r.import, r.edition, r.lens, r.wrote], [a.import, 1, "as_published", false]);
  assert.deepEqual(r.findings.map((f) => f.finding), [F1, F2, F3], "in the edition's order");
  for (const f of r.findings) {
    assert.equal(f.moved, false, f.finding);
    assert.deepEqual(f.because, [], f.finding);
    assert.deepEqual(f.pair, f.published.pair);
    assert.deepEqual(f.bar_met, f.published.bar_met);
    assert.equal(f.ref, importedFindingRef(a.import, f.finding));
  }
  assert.equal(r.limit, word("case-checker.lens_limit_statement"));
  assert.equal(r.limit, LENS_LIMIT);
  assert.deepEqual(w.snapshot(), before, "a read writes nothing");
});

test("R27 removed restores the lowered grade and names the statement that moved it, with what it touched and the statement as the edition prints it, against this group's bar and the source's", async () => {
  const { regrade } = await setup();
  const f = by(await regrade("removed"));
  assert.deepEqual(f[F1].published.pair, { capture: g("C"), connection: g("C") });
  assert.deepEqual(f[F1].pair, { capture: g("B"), connection: g("C") }, "capture restored to what it was before the statement lowered it");
  assert.equal(f[F1].moved, true);
  assert.deepEqual(f[F1].because, [{ statement: S1, kind: "scrutiny", subject: "official statements", text: PRINTED[0].text,
    touched: { target: "leg", ord: 0, effect: "grade_lowered", from: "B", to: "C" } }]);
  /* this group's bar (B, C): short on capture as published, met once restored; the source's bar (B, B) is read beside it */
  assert.deepEqual(f[F1].published.bar_met, { own: againstBar("load_bearing", { capture: g("C"), connection: g("C") }, OWN_BAR).meets,
                                                 source: againstBar("load_bearing", { capture: g("C"), connection: g("C") }, { capture: "B", connection: "B" }).meets });
  assert.equal(f[F1].published.bar_met.own, false);
  assert.equal(f[F1].bar_met.own, true);
  assert.equal(f[F1].bar_met.source, false, "the source's bar is read on connection C, which the restored capture does not change");
  /* control: a finding the file records no application for is not moved and says nothing in the lens touches it */
  assert.deepEqual([f[F2].moved, f[F2].because, f[F2].stated], [false, [], REGRADE_UNTOUCHED]);
  assert.deepEqual(f[F2].pair, f[F2].published.pair);
  assert.equal(f[F1].stated, undefined, "a finding the lens touches carries no such sentence");
});

test("R27 the reader's own lens re-weighs under the statements in force here: with the statement in force the lowered grade stands", async () => {
  const { w, regrade } = await setup();
  w.lens.inForce.set(S1, true);
  const f = by(await regrade("own"));
  assert.equal(f[F1].moved, false, "S1 is in this group's lens, so its application stands as published");
  assert.deepEqual(f[F1].pair, f[F1].published.pair);
  /* the lens is the reading member's: asked at scope instance with the viewer */
  assert.deepEqual(w.lens.asked.at(-1), { statement: S1, scope: "instance", viewer: V("alice") });
});

test("R27 refusals: another lens is REGRADE_LENS_UNKNOWN naming lens; an import or an edition not held and a viewer who is no active member are answered as R4 answers, with the same bytes", async () => {
  const { w, a, regrade } = await setup();
  const before = w.snapshot();
  const bad = await regrade("sideways");
  rowOk(bad, "REGRADE_LENS_UNKNOWN");
  assert.match(bad.detail, /\blens\b/);
  rowOk(await regrade(undefined), "REGRADE_LENS_UNKNOWN");
  const none = await door(w, "importregrade", { viewer: V("alice"), import: "0".repeat(64), edition: 1, lens: "removed" });
  rowOk(none, "IMPORT_NO_SUCH_EDITION");
  const noEdition = await door(w, "importregrade", { viewer: V("alice"), import: a.import, edition: 9, lens: "removed" });
  rowOk(noEdition, "IMPORT_NO_SUCH_EDITION");
  for (const who of ["carol", "dave"]) {
    const r = await regrade("removed", who);
    rowOk(r, "IMPORT_NO_SUCH_EDITION");
    assert.deepEqual(r, await door(w, "importregrade", { viewer: V(who), import: a.import, edition: 1, lens: "removed" }));
  }
  assert.equal((await regrade("removed", "carol")).import, a.import, "the refusal names what was asked, as R4's absence does");
  assert.deepEqual(w.snapshot(), before, "nothing written");
  /* control: the same call by an active member answers */
  assert.equal((await regrade("removed", "bob")).ok, true);
});

test("R28 own with no group statement in force answers the same findings as removed and says, by key, that this group has no lens in force; with a statement in force it differs", async () => {
  const { w, regrade } = await setup();
  const removed = await regrade("removed");
  const own = await regrade("own");
  assert.equal(own.lens, "own");
  assert.deepEqual(own.findings, removed.findings, "no statement in force: every carried application reads as removed");
  assert.equal(own.lens_note, REGRADE_NO_OWN_LENS);
  assert.equal(removed.lens_note, undefined, "only the reader's own lens has the note");
  /* control: with statements in force the answer differs from removed, and carries no such note */
  w.lens.inForce.set(S1, true);
  const withLens = await regrade("own");
  assert.notDeepEqual(withLens.findings, removed.findings);
  assert.equal(withLens.lens_note, undefined);
});

test("R28 a lens that cannot be read answers lens undetermined and, for each finding, no moved, no pair and no bar_met, never false", async () => {
  const { w, regrade } = await setup();
  w.lens.inForce.set(S1, null);
  const r = await regrade("own");
  assert.equal(r.ok, true);
  assert.equal(r.lens, "undetermined");
  assert.equal(r.requested_lens, "own");
  assert.equal(r.stated, LENS_UNDETERMINED);
  for (const f of r.findings) {
    assert.equal(Object.hasOwn(f, "moved"), false, f.finding);
    assert.deepEqual([f.pair, f.bar_met], [null, null], f.finding);
    assert.ok(f.published.pair !== undefined, "the published pair stays beside");
  }
  /* control: the same edition read when determined carries moved */
  w.lens.inForce.set(S1, false);
  assert.equal(Object.hasOwn(by(await regrade("own"))[F1], "moved"), true);
  /* a re-weighing that cannot be made reads the same way */
  w.lens.throws = true;
  const down = await regrade("removed");
  assert.equal(down.lens, "undetermined");
  assert.equal(Object.hasOwn(down.findings[0], "moved"), false);
});
