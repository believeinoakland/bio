/* case-check's published fixtures (fixtures.mjs): each is called and its real answer checked (K4990, K4993). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { caseCheckOfNoSuchCase } from "./fixtures.mjs";
import { CASE_CHECK_CHECKS } from "../../../src/case-check/index.mjs";
import { V } from "./fixture.mjs";

test("R2: the caseCheckOfNoSuchCase fixture is caseCheckOf's real refusal for a viewer without standing — NO_SUCH_CASE, byte-identical to a case that is not there, while a participant reads the held state — made afresh at call time, writing nothing", () => {
  const f = caseCheckOfNoSuchCase();
  const before = f.world.snapshot();
  const r = f.refusal;
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation],
                   [false, "NO_SUCH_CASE", "NO_SUCH_CASE", CASE_CHECK_CHECKS.NO_SUCH_CASE.check, CASE_CHECK_CHECKS.NO_SUCH_CASE.translation]);
  assert.equal(JSON.stringify(f.absent), JSON.stringify(r), "not permitted and not there are one answer");
  assert.equal(f.world.c.caseCheckOf({ case: f.case, viewer: V("ann") }).state, "held", "control: a participant reads the case");
  assert.deepEqual(f.world.snapshot(), before, "nothing written");
  assert.equal(caseCheckOfNoSuchCase().refusal.reason, "NO_SUCH_CASE", "made afresh");
});
