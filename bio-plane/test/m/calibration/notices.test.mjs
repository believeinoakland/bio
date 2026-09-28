/* calibration: the post-write notices (R18, R19), requirement-named tests at the module's interface
   (build/requirements/calibration.md). Each test names the requirement ids it checks in its title. The module runs
   over `storage.mjs` with record-core's real instance and the module's clock injected; a fresh storage per test. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { listenerRefusal, MODULE_ORDER } from "../../../src/membership/index.mjs";
import { calibrationOf, calibrationOps } from "../../../src/calibration/index.mjs";
import { storage, dump } from "./storage.mjs";

const DAY = 24 * 60 * 60 * 1000;
const T0 = Date.UTC(2026, 8, 1);
const WHO = { principal: "member:m1" };
const probe = (over = {}) => ({ engine: "pdfjs", version: "4.0", at: "2026-09-01T00:00:00Z", cap: "B",
  probe_id: "P-1", probe_inputs: { corpus: "c1" }, scores: { cer: 0.02 }, ...over });

function fresh(deps = {}) {
  const s = storage();
  const clock = { t: T0 };
  const c = calibrationOf({ storage: s }, { now: () => clock.t, ...deps });
  return { s, c, clock };
}

/* The two notices, by the service that registers a listener and the act after which it is told. */
const SLOTS = {
  R18: { on: "onSubjectRegistered", act: (c, body) => c.calibrationSubjectRegister(body),
         good: { engine: "pdfjs", probe_id: "P-1" },
         notice: (r) => ({ engine: r.engine, probe_id: r.probe_id, next_probe: r.next_probe }) },
  R19: { on: "onSignalRecorded", act: (c, body) => c.calibrationSignalRecord(body),
         good: { engine: "pdfjs", source: "notes" },
         notice: (r) => ({ engine: r.engine, next_probe: r.next_probe }) },
};

for (const [id, slot] of Object.entries(SLOTS)) {
  test(`${id}: ${slot.on} registers a later module once; a second by the same module is LISTENER_DECLARED and a malformed one LISTENER_MALFORMED, both membership's listenerRefusal`, async () => {
    const { c } = fresh();
    assert.deepEqual(c[slot.on]("scheduler", () => {}), { ok: true, module: "scheduler" });
    const again = c[slot.on]("scheduler", () => {});
    assert.equal(again.ok, false); assert.equal(again.reason, "LISTENER_DECLARED"); assert.equal(again.module, "scheduler");
    assert.deepEqual(again, listenerRefusal([{ module: "scheduler" }], "scheduler", () => {}),
                     "the refusal is membership R81's own, minted at its one site");
    for (const [m, f] of [["", () => {}], [null, () => {}], [7, () => {}], ["x", null], ["x", "fn"], [undefined, undefined]]) {
      const r = c[slot.on](m, f);
      assert.equal(r.ok, false); assert.equal(r.reason, "LISTENER_MALFORMED");
      assert.deepEqual(r, listenerRefusal([], m, f));
    }
    /* The slots are separate: the same module registers once in each. */
    for (const other of ["onSubjectRegistered", "onSignalRecorded", "onCalibration"].filter((o) => o !== slot.on))
      assert.equal(c[other]("scheduler", () => []).ok, true, other);
    let calls = 0;
    const { c: c2 } = fresh();
    c2[slot.on]("scheduler", () => { calls++; });
    c2[slot.on]("scheduler", () => { calls += 100; });
    c2[slot.on]("", () => { calls += 1000; });
    await slot.act(c2, slot.good);
    assert.equal(calls, 1, "only the accepted registration is told");
  });

  test(`${id}: every registered listener is told once, in the modules' total order, unknown modules last in registration order`, async () => {
    const { c } = fresh({ order: ["calibration", "extraction", "scheduler", "legacy-store"] });
    const seen = [];
    for (const m of ["unlisted-b", "legacy-store", "scheduler", "unlisted-a", "extraction"])
      c[slot.on](m, async () => { await new Promise((r) => setTimeout(r, 2)); seen.push(m); });
    await slot.act(c, slot.good);
    assert.deepEqual(seen, ["extraction", "scheduler", "legacy-store", "unlisted-b", "unlisted-a"],
                     "each told once, the next only after the last has settled");
    await slot.act(c, slot.good);
    assert.equal(seen.length, 10, "once per act");
  });

  test(`${id}: with no order given, listeners run in membership's MODULE_ORDER`, async () => {
    const { c } = fresh();
    const seen = [];
    const late = MODULE_ORDER.filter((m) => MODULE_ORDER.indexOf(m) > MODULE_ORDER.indexOf("calibration")).reverse();
    for (const m of ["unlisted", ...late]) c[slot.on](m, () => { seen.push(m); });
    await slot.act(c, slot.good);
    assert.deepEqual(seen, [...late.slice().reverse(), "unlisted"]);
  });

  test(`${id}: a listener that throws, rejects, answers or changes its notice never changes the write, its answer or another listener's notice`, async () => {
    const plain = fresh();
    const want = await slot.act(plain.c, slot.good);
    const hostile = fresh();
    const told = [];
    hostile.c[slot.on]("extraction", (n) => { told.push(structuredClone(n)); n.engine = "other"; if (n.next_probe) n.next_probe.at = -1; throw new Error("boom"); });
    hostile.c[slot.on]("content", async (n) => { told.push(structuredClone(n)); throw new Error("rejected"); });
    hostile.c[slot.on]("scheduler", (n) => { told.push(structuredClone(n)); return { ok: false, refuse: true }; });
    hostile.c[slot.on]("legacy-store", (n) => { told.push(structuredClone(n)); return Promise.reject(new Error("late")); });
    const got = await slot.act(hostile.c, slot.good);
    assert.deepEqual(got, want, "the answer is the one no listener would have changed");
    assert.deepEqual(dump(hostile.s), dump(plain.s), "the write is the same");
    assert.equal(told.length, 4, "a throwing listener stops no later one");
    for (const n of told) assert.deepEqual(n, slot.notice(want), "each told the notice as written, not as another changed it");
  });

  test(`${id}: a refused act tells no listener`, async () => {
    const { c } = fresh();
    let calls = 0;
    c[slot.on]("scheduler", () => { calls++; });
    const bad = id === "R18"
      ? [{}, { engine: "pdfjs" }, { engine: " ", probe_id: "P" }, null]
      : [{}, { engine: "pdfjs" }, null, { engine: "pdfjs", source: "n", cap: "A" }, { engine: "pdfjs", source: "n", scores: {} }];
    for (const b of bad) assert.equal((await slot.act(c, b)).ok, false, JSON.stringify(b));
    assert.equal(calls, 0);
  });
}

test("R18 R8: the notice is {engine, probe_id, next_probe}, the registered subject's own, for every successful registration", async () => {
  const { c, clock } = fresh();
  const told = [];
  c.onSubjectRegistered("scheduler", (n) => { told.push(n); });
  const a = await c.calibrationSubjectRegister({ engine: " pdfjs ", probe_id: " P-1 ", version: "4.0" });
  assert.deepEqual(told, [{ engine: "pdfjs", probe_id: "P-1", next_probe: a.next_probe }]);
  assert.equal(told[0].next_probe.at, 0, "a never-probed subject is due at once");
  assert.equal(told[0].next_probe.from, "never-probed");
  await c.calibrationRecord(probe(), WHO);
  clock.t = T0 + DAY;
  const b = await c.calibrationSubjectRegister({ engine: "pdfjs", probe_id: "P-2" });
  assert.deepEqual(told[1], { engine: "pdfjs", probe_id: "P-2", next_probe: b.next_probe });
  assert.equal(told[1].next_probe.from, "cadence");
  const off = await c.calibrationSubjectRegister({ engine: "ocr", probe_id: "P-3", enabled: false });
  assert.equal(off.ok, true);
  assert.deepEqual(told[2], { engine: "ocr", probe_id: "P-3", next_probe: off.next_probe }, "a disabled registration succeeds too");
  assert.deepEqual(Object.keys(told[0]).sort(), ["engine", "next_probe", "probe_id"]);
});

test("R19 R7: the notice is {engine, next_probe}, the answer's next probe, null with no subject for the engine", async () => {
  const { c, clock } = fresh();
  const told = [];
  c.onSignalRecorded("scheduler", (n) => { told.push(n); });
  const none = await c.calibrationSignalRecord({ engine: "pdfjs", source: "notes" });
  assert.deepEqual(told, [{ engine: "pdfjs", next_probe: null }]);
  assert.equal(none.next_probe, null);
  await c.calibrationRecord(probe(), WHO);
  clock.t = T0 + DAY;
  const r = await c.calibrationSignalRecord({ engine: "pdfjs", source: "changelog", probe_by_ms: T0 + 3 * DAY });
  assert.deepEqual(told[1], { engine: "pdfjs", next_probe: r.next_probe });
  assert.equal(told[1].next_probe.at, T0 + 3 * DAY); assert.equal(told[1].next_probe.from, "signal");
  assert.deepEqual(Object.keys(told[1]).sort(), ["engine", "next_probe"]);
  assert.equal(told.length, 2, "once per recorded signal");
});

test("R18 R19: the ops op=calibrationsubject and op=calibrationsignal tell the listeners too", async () => {
  const { c } = fresh();
  const told = [];
  c.onSubjectRegistered("scheduler", (n) => { told.push(["subject", n.engine]); });
  c.onSignalRecorded("scheduler", (n) => { told.push(["signal", n.engine]); });
  const url = new URL("http://x/?identity=member:m1");
  assert.equal((await calibrationOps(c, url, { engine: "pdfjs", probe_id: "P" }).calibrationsubject()).ok, true);
  assert.equal((await calibrationOps(c, url, { engine: "pdfjs", source: "notes" }).calibrationsignal()).ok, true);
  assert.deepEqual(told, [["subject", "pdfjs"], ["signal", "pdfjs"]]);
});
