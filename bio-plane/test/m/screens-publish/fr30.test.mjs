/* screens-publish FR-30 (T51 fix round; K4165, K4168, K4192, K4194, K4197): R52 the docket starts the next edition. Each sentence is
 * asserted by its key (R24); every request is compared with its owner's declaration by the harness (interface-shell R104). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open, main, drew, ops, press, last, fill, P, C, DR } from "./fixtures.mjs";

const DOCKET = `/app/docket/${P}/${C}`;
const boxes = (p) => p.doc.getElementById("dk-next-findings").querySelectorAll("input");

test("R52 'Start the next edition' sends casedraft with the published case's caseId, the findings chosen and the scope, and opens the case editor on the new draft", async () => {
  const p = await open(DOCKET, { plane: { casedraft: { status: 200, json: { ok: true, result: { ok: true, draftId: DR, project: P, caseId: C } } } } });
  assert.ok(drew(p, "screen.docket.next.heading"));
  assert.ok(ops(p).includes("casedraft"));
  assert.equal(boxes(p).length, 1);
  boxes(p)[0].checked = true;
  fill(p, { "dk-next-scope": "Corrects the 2025 rent schedule." });
  await press(p, "casedraft");
  const body = last(p, "casedraft").body;
  assert.equal(body.caseId, C);
  assert.equal(body.project, P);
  assert.deepEqual(body.targets, ["FND-2026-0031"]);
  assert.equal(body.scope, "Corrects the 2025 rent schedule.");
  assert.equal(decodeURIComponent(p.location.pathname), `/app/case-editor/${P}/${DR}`, "the editor opens on the new draft");
});

test("R52 with no finding chosen, or no scope, nothing is sent and the refusal is in its fold (controls)", async () => {
  const p = await open(DOCKET);
  fill(p, { "dk-next-scope": "Corrects it." });
  await press(p, "casedraft");
  assert.equal(p.byOp("casedraft").length, 0);
  assert.ok(drew(p, "screen.docket.next.refused.nofinding"));
  boxes(p)[0].checked = true;
  fill(p, { "dk-next-scope": "" });
  await press(p, "casedraft");
  assert.equal(p.byOp("casedraft").length, 0);
  assert.ok(drew(p, "screen.docket.next.refused.noscope"));
  assert.ok(main(p));
});

const IMPORT = (acc) => ({ importedcase: { status: 200, json: { ok: true, result: { import: "IMP-2026-0001", group: "West Oakland Neighbors", case: "Port lease revenue",
  edition: { edition: 2, findings: [{ finding: "FND-W-1", title: "Port lease revenue fell short", result: "recreated", origin: acc ? { acceptance: { by: "ana", at: "2026-10-02T09:00:00Z", reason: "checked", checked: "x" } } : {} }] } } } } });

test("R55 an accepted import offers 'Withdraw this acceptance, with a reason' and the act sends the reason", async () => {
  const p = await open("/app/imported/IMP-2026-0001/2", { plane: IMPORT(true) });
  assert.ok(ops(p).includes("importacceptwithdraw"));
  await press(p, "importacceptwithdraw", { values: { "im-withdraw": "The schedule was later corrected." } });
  const body = last(p, "importacceptwithdraw").body;
  assert.equal(body.import, "IMP-2026-0001");
  assert.equal(body.edition, 2);
  assert.equal(body.reason, "The schedule was later corrected.");
});

test("R55 a non-accepted import offers no withdrawal, and a withdrawal with no reason sends nothing (controls)", async () => {
  const none = await open("/app/imported/IMP-2026-0001/2", { plane: IMPORT(false) });
  assert.ok(!ops(none).includes("importacceptwithdraw"));
  const p = await open("/app/imported/IMP-2026-0001/2", { plane: IMPORT(true) });
  await press(p, "importacceptwithdraw", { values: { "im-withdraw": "  " } });
  assert.equal(p.byOp("importacceptwithdraw").length, 0);
});
