/* money-checks R15: its refusal rows (DEC-49 arm A; N608, K1679). A missing citation is this module's own
   `MONEY_CHECK_NO_CITATION`, never record-grammar's `NO_CITATION`; `MEMBER_ACT_ONLY` stays this module's; every row's
   `check` is a catalogue id once promotion stamps it and null until then, never a requirement's name. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, contract, shareDetector, ALICE, ADMIN_BOB, MACHINE } from "./fixture.mjs";
import { MONEY_CHECKS_CHECKS, moneyChecksOps } from "../../../src/money-checks/index.mjs";

const CATALOGUE_ID = /^C-\d+\.\d+$/;

test("R15: every row carries as check a catalogue id or null, never a requirement's name, with its sentence", () => {
  const rows = Object.entries(MONEY_CHECKS_CHECKS);
  assert.ok(rows.length > 0);
  for (const [code, row] of rows) {
    assert.ok(row.check === null || CATALOGUE_ID.test(row.check), `${code}: ${row.check}`);
    assert.doesNotMatch(String(row.check), /money-checks|\bR\d+\b/, code);
    assert.equal(typeof row.translation, "string", code);
    assert.ok(row.translation.trim().length > 0, code);
  }
});

test("R15: the missing citation is MONEY_CHECK_NO_CITATION, no longer NO_CITATION; MEMBER_ACT_ONLY stays this module's", () => {
  assert.equal("NO_CITATION" in MONEY_CHECKS_CHECKS, false);
  assert.ok(MONEY_CHECKS_CHECKS.MONEY_CHECK_NO_CITATION);
  assert.ok(MONEY_CHECKS_CHECKS.MEMBER_ACT_ONLY);
  const w = world();
  const param = w.c.stateParameter({ check: "change_orders_past_share", name: "share", value: "10%", citation: "", by: ALICE });
  assert.equal(param.reason, "MONEY_CHECK_NO_CITATION");
  assert.equal(param.code, "MONEY_CHECK_NO_CITATION");
  const det = w.c.defineDetector(shareDetector({ parameters: [{ name: "share", value: "0.5", citation: " " }] }));
  assert.equal(det.reason, "MONEY_CHECK_NO_CITATION");
  assert.equal(w.c.switchDetector({ detectorId: "md-shipped-payee-share", project: "P", on: true, by: MACHINE }).reason, "MEMBER_ACT_ONLY");
});

test("R15: every refusal answered carries its row's check and sentence, which no caller field overrides", () => {
  const w = world();
  w.project("PROJ-2026-0001-a", ["alice"]);
  const d = w.c.defineDetector(shareDetector());
  const k = contract(w, { award: "1000" });
  const base = { check: "change_orders_past_share", name: "share", value: "10%", citation: "x", by: ALICE };
  const answered = [
    w.c.amountChecks({ contract: "" }),
    w.c.stateParameter({ ...base, check: "" }),
    w.c.stateParameter({ ...base, check: "nope" }),
    w.c.stateParameter({ ...base, name: "limit" }),
    w.c.stateParameter({ ...base, value: "" }),
    w.c.stateParameter({ ...base, value: "about 10%" }),
    w.c.stateParameter({ ...base, citation: "" }),
    w.c.stateParameter({ ...base, value: "HYP-2026-0001" }),
    w.c.stateParameter({ ...base, by: MACHINE }),
    w.c.parameters({ check: "nope" }),
    w.c.defineDetector(shareDetector({ label: "" })),
    w.c.defineDetector(shareDetector({ population: null })),
    w.c.defineDetector(shareDetector({ population: { per: "x" } })),
    w.c.defineDetector(shareDetector({ condition: { method: "bio-calc/9" } })),
    w.c.defineDetector(shareDetector({ denominator: "" })),
    w.c.defineDetector(shareDetector({ derivation: "" })),
    w.c.defineDetector(shareDetector({ parameters: [{ name: "share", value: "half", citation: "x" }] })),
    w.c.switchDetector({ detectorId: "md-x", project: "PROJ-2026-0001-a", on: true, by: ALICE }),
    w.c.switchDetector({ detectorId: d.detector_id, project: "", on: true, by: ALICE }),
    w.c.switchDetector({ detectorId: d.detector_id, project: "PROJ-2026-0001-a", on: "yes", by: ALICE }),
    w.c.runDetectors({ budgetMs: -1 }),
    w.c.recordGate({ detectorId: d.detector_id, version: 1, goldSet: "", falseAlarmRate: 0.1, by: ADMIN_BOB }),
    w.c.recordGate({ detectorId: d.detector_id, version: 1, goldSet: "g", falseAlarmRate: 2, by: ADMIN_BOB }),
    w.c.recordGate({ detectorId: "md-x", version: 1, goldSet: "g", falseAlarmRate: 0.1, by: ADMIN_BOB }),
    w.c.noticed({ project: "" }),
    w.c.noticed({ project: "PROJ-2026-0001-a", viewer: ALICE, limit: 0 }),
  ];
  const seen = new Set();
  for (const r of answered) {
    assert.equal(r.ok, false, JSON.stringify(r));
    const row = MONEY_CHECKS_CHECKS[r.reason];
    assert.ok(row, `${r.reason} is this module's row`);
    seen.add(r.reason);
    assert.equal(r.check, row.check, r.reason);
    assert.equal(r.translation, row.translation, r.reason);
  }
  /* the caller's check name travels as check_key, never as check */
  const unk = w.c.stateParameter({ ...base, check: "nope" });
  assert.equal(unk.check, null);
  assert.equal(unk.check_key, "nope");
  assert.ok(seen.size >= 18);
  assert.equal(k.id.length > 0, true);
  /* through the ops map too */
  assert.equal(moneyChecksOps(w.c, new URL("https://x/"), { ...base, citation: "" }).moneycheckparam().check, null);
});
