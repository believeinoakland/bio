/* case-import: the withdraw act as the door serves it (R7; T51; C51, DEC-374): `op=importacceptwithdraw`, 'Withdraw this
   acceptance, with a reason' on an imported case. The op takes a reason, refuses an import with nothing accepted, and after
   it the import counts for nothing again (R6). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { rowOk, seeded, imp, door, V, F1, F2, F3 } from "./fixture.mjs";
import { CASE_IMPORT_OPS } from "../../../src/case-import/index.mjs";

async function setup() {
  const w = seeded();
  const a = await imp(w);
  const accept = () => door(w, "importaccept", { viewer: V("alice"), by: V("alice"), import: a.import, edition: 1, findings: [F1, F2],
    checked: "every passage against its document", reason: "the chain holds" });
  const withdraw = (x = {}) => door(w, "importacceptwithdraw", { viewer: V("alice"), by: V("alice"), import: a.import, edition: 1,
    reason: "the source corrected the figure", ...x });
  return { w, a, accept, withdraw };
}

test("R7 R6 importacceptwithdraw withdraws the acceptance in force with the member's reason, and the import counts for nothing again; the history keeps both", async () => {
  const { w, a, accept, withdraw } = await setup();
  assert.ok(CASE_IMPORT_OPS.includes("importacceptwithdraw"));
  assert.equal((await accept()).ok, true);
  assert.equal(w.ci.acceptanceOf({ import: a.import, edition: 1, finding: F1 }).reason, "the chain holds");
  const r = await withdraw();
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual([r.import, r.edition, r.reason], [a.import, 1, "the source corrected the figure"]);
  assert.equal(r.reevaluation.ok, true, "the dependents are told (R7)");
  for (const f of [F1, F2]) assert.equal(w.ci.acceptanceOf({ import: a.import, edition: 1, finding: f }), null, "counts for nothing again");
  const read = w.ci.importedCase({ import: a.import, viewer: V("bob") }).edition.findings;
  for (const f of read) assert.equal(f.origin.acceptance, null, f.finding);
  assert.equal(w.count("case_import_acceptances"), 1, "the acceptance stays in the history, corrected forward");
  assert.equal(w.count("case_import_withdrawals"), 1);
});

test("R7 importacceptwithdraw refuses an import not accepted, and a missing reason, each writing nothing", async () => {
  const { w, a, accept, withdraw } = await setup();
  const before = w.snapshot();
  rowOk(await withdraw(), "IMPORT_NOTHING_ACCEPTED");
  assert.deepEqual(w.snapshot(), before);
  await accept();
  const afterAccept = w.snapshot();
  rowOk(await withdraw({ reason: undefined }), "IMPORT_ACCEPT_NO_REASON");
  rowOk(await withdraw({ reason: "   " }), "IMPORT_ACCEPT_NO_REASON");
  assert.deepEqual(w.snapshot(), afterAccept, "no reason, nothing written");
  assert.equal(w.ci.acceptanceOf({ import: a.import, edition: 1, finding: F1 }).by, "alice", "still accepted");
  /* control: with the reason it withdraws, and a second withdrawal finds nothing accepted */
  assert.equal((await withdraw()).ok, true);
  rowOk(await withdraw(), "IMPORT_NOTHING_ACCEPTED");
  /* a machine caller is refused first (R1) */
  rowOk(await door(w, "importacceptwithdraw", { viewer: V("alice"), by: "class:ai", import: a.import, edition: 1, reason: "r" }), "MACHINE_CANNOT_IMPORT");
});
