/* journey-check R3: the walk runs only against an instance whose `bootstrap` answers `test_instance: true`, and its own
   requests to the instance are that one read: the refusal comes before anything is written or a browser opened. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { requireTestInstance, WalkRefused } from "../../../src/journey-check/guard.mjs";
import { runLive } from "../../../src/journey-check/run.mjs";
import { FAIL } from "../../../src/journey-check/walker.mjs";

const BASE = "https://grp.test.workers.dev";
const instance = (boot, status = 200) => {
  const seen = [];
  const f = async (req) => { seen.push(`${req.method} ${req.url}`); return new Response(JSON.stringify(boot), { status, headers: { "content-type": "application/json" } }); };
  return { f, seen };
};
const refusal = async (p) => { try { await p; } catch (e) { return e; } return null; };

test("R3: the walker refuses a non-test instance: bootstrap answering test_instance false, absent, or anything but true exactly, and one that does not answer; control: test_instance true is accepted", async () => {
  for (const boot of [{ ok: true, test_instance: false }, { ok: true }, { ok: true, test_instance: "true" }, { ok: true, test_instance: 1 }]) {
    const e = await refusal(requireTestInstance(BASE, instance(boot).f));
    assert.ok(e instanceof WalkRefused, JSON.stringify(boot));
    assert.equal(e.code, "NOT_A_TEST_INSTANCE");
  }
  assert.equal((await refusal(requireTestInstance(BASE, instance({ ok: false }, 500).f))).code, "INSTANCE_UNREACHABLE");
  assert.equal((await refusal(requireTestInstance(BASE, async () => { throw new Error("ENOTFOUND"); }))).code, "INSTANCE_UNREACHABLE");
  const yes = instance({ ok: true, test_instance: true, version: "1.0.0" });
  assert.equal((await requireTestInstance(BASE, yes.f)).test_instance, true);
  assert.deepEqual(yes.seen, [`GET ${BASE}/api/?op=bootstrap`], "the guard's one request is a read of bootstrap");
});

test("R3: the live arm against a non-test instance stops at the refusal: its only request is the bootstrap read, no browser opens, and nothing is written", async () => {
  const dir = mkdtempSync(join(tmpdir(), "jc-guard-"));
  try {
    const live = instance({ ok: true, test_instance: false });
    const env = { JOURNEY_ADMIN_HANDLE: "ada", JOURNEY_ADMIN_PASSWORD: "admin-pass-xyz", JOURNEY_MEMBER_HANDLE: "mai", JOURNEY_MEMBER_PASSWORD: "member-pass-xyz" };
    const r = await runLive({ base: BASE, env, out: dir, fetchOf: live.f });
    assert.equal(r.ok, false);
    assert.deepEqual(r.walk.failures.map((f) => f.kind), [FAIL.REFUSAL]);
    assert.match(r.walk.failures[0].detail, /NOT_A_TEST_INSTANCE/);
    assert.deepEqual(live.seen, [`GET ${BASE}/api/?op=bootstrap`]);
    assert.deepEqual(r.walk.steps, [], "no step was walked");
    for (const v of Object.values(env).filter((v) => v.includes("pass"))) assert.equal(r.report.includes(v), false, "no credential printed");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
