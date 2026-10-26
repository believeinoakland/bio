/* K5175 (fix round 10): the answers `fixtures.mjs` publishes for the five ops the screens and the door read are the real code's.
   Each is the door's answer over the module's real methods; each control reads or refuses as the real code does. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { rowOk, door, V } from "./fixture.mjs";
import { importedCasesAnswer, importedCaseAnswer, rerunStartAnswer, rerunPairAnswer, rerunReadAnswer } from "./fixtures.mjs";
import { LENS_LIMIT, RERUN_DISAGREEMENT } from "../../../src/case-import/index.mjs";

const RERUN_PROJECT = "PRJ-2026-0001-rerun";
const RERUN_OWN1 = "INQ-2026-0101-own-transfers";

test("R4 R26 importedcases: the published answer is the door's answer over the real importedCases, the list draws both imports with their latest editions, and a viewer who is not an active member reads no import", async () => {
  const { w, answer } = await importedCasesAnswer();
  assert.deepEqual(answer, w.ci.importedCases({ viewer: V("alice") }), "the door answers what the module answers");
  assert.deepEqual([answer.ok, answer.count, answer.wrote], [true, 2, false]);
  assert.deepEqual(answer.imports.map((i) => [i.group, i.latest_edition]).sort(), [["other-group", 1], ["source-group", 2]]);
  const outsider = door(w, "importedcases", { viewer: V("dave") });
  assert.deepEqual([outsider.imports, outsider.count], [[], 0], "control: an invited member reads no import");
});

test("R4 importedcase: the published answer is the door's answer over the real importedCase; the latest edition by default, a named edition, and an edition no import holds is refused IMPORT_NO_SUCH_EDITION", async () => {
  const latest = await importedCaseAnswer();
  assert.deepEqual(latest.answer, latest.w.ci.importedCase({ import: latest.import, edition: null, viewer: V("alice") }));
  assert.deepEqual([latest.answer.ok, latest.answer.import, latest.answer.edition.edition, latest.answer.wrote], [true, latest.import, 2, false]);
  const first = await importedCaseAnswer({ edition: 1 });
  assert.equal(first.answer.edition.edition, 1, "the named edition");
  const none = await importedCaseAnswer({ edition: 9 });
  rowOk(none.answer, "IMPORT_NO_SUCH_EDITION");
});

test("R29 rerunstart: the published answer is the door's answer over the real rerunStart, one declaration of this module's own, and a second declaration of the same edition is refused RERUN_ALREADY writing nothing", async () => {
  const { w, import: importId, answer } = await rerunStartAnswer();
  assert.deepEqual([answer.ok, answer.project, answer.import, answer.edition, answer.by], [true, RERUN_PROJECT, importId, 1, "alice"]);
  assert.equal(w.count("case_import_reruns"), 1);
  const again = await rerunStartAnswer({ twice: true });
  rowOk(again.answer, "RERUN_ALREADY");
  assert.equal(again.w.count("case_import_reruns"), 1, "the refused declaration writes nothing");
});

test("R30 rerunpair: the published answer is the door's answer over the real rerunPair, and the pairing it states is the one rerunread reads back from the same world", async () => {
  const { w, answer } = await rerunPairAnswer();
  assert.deepEqual([answer.ok, answer.project, answer.edition, answer.withdrawn], [true, RERUN_PROJECT, 1, false]);
  const read = door(w, "rerunread", { viewer: V("alice"), project: RERUN_PROJECT });
  const f1 = read.reruns[0].findings.find((x) => x.finding === "INQ-2026-0001-transfers");
  assert.deepEqual(f1.pairings.map((x) => x.own_finding), [RERUN_OWN1], "the pairing stands in the real read");
});

test("R31 rerunread: the published answer is the door's answer over the real rerunRead; the pairing is drawn once paired and not before, and the lens limit and disagreement note are the module's", async () => {
  const paired = await rerunReadAnswer({ paired: true });
  assert.deepEqual(paired.answer, paired.w.ci.rerunRead({ project: RERUN_PROJECT, viewer: V("alice") }), "the door answers what the module answers");
  assert.deepEqual([paired.answer.ok, paired.answer.project, paired.answer.reruns.length, paired.answer.wrote], [true, RERUN_PROJECT, 1, false]);
  assert.deepEqual([paired.answer.limit, paired.answer.disagreement_note], [LENS_LIMIT, RERUN_DISAGREEMENT]);
  const unpaired = await rerunReadAnswer({ paired: false });
  const f1 = unpaired.answer.reruns[0].findings.find((x) => x.finding === "INQ-2026-0001-transfers");
  assert.deepEqual([f1.paired, f1.pairings], [false, []], "control: nothing paired, nothing drawn as paired");
});

test("R29 R31 each published answer builds its own world, so no answer is shared between two calls", async () => {
  const a = await rerunStartAnswer();
  const b = await rerunStartAnswer();
  assert.notEqual(a.w, b.w);
  assert.deepEqual([a.w.count("case_import_reruns"), b.w.count("case_import_reruns")], [1, 1]);
});
