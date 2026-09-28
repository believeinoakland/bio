/* scheduler: the invariants (R14, R18–R20). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import * as scheduler from "../../../src/scheduler/index.mjs";
import { world, consumer, NOW } from "./fixture.mjs";

const config = (p) => JSON.parse(readFileSync(fileURLToPath(new URL(p, import.meta.url)), "utf8")
  .replace(/"(?:[^"\\]|\\.)*"|\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, (m) => (m[0] === '"' ? m : "")).replace(/,\s*([}\]])/g, "$1"));

test("R14: the deployed configuration declares no cron trigger; the Durable Object's alarm is the one periodic mechanism", () => {
  const c = config("../../../wrangler.jsonc");
  const crons = (c.triggers && c.triggers.crons) || [];
  assert.deepEqual(crons, []);
  assert.ok(Array.isArray(c.durable_objects?.bindings) && c.durable_objects.bindings.some((b) => b.class_name === "Store"),
    "the plane runs in the Durable Object whose alarm this is");
  for (const env of Object.values(c.env || {})) assert.deepEqual((env.triggers && env.triggers.crons) || [], []);
});

test("R14: no consumer sets an alarm of its own: each firing and each arm sets the one alarm at most once, to the earliest wake", async () => {
  const { s, st } = world({ "ai-run-reap": { due: 1, wake: NOW + 30 }, "notice-sweep": { due: NOW, wake: NOW + 20 } });
  s.register("m", consumer("c", { key: "c", due: (n) => n, wake: NOW + 10 }));
  for (const act of [() => s.onAlarm(NOW), () => s.arm(NOW), () => s.start(NOW)]) {
    st.alarm = null; st.log.length = 0;
    await act();
    const sets = st.log.filter(([m]) => m === "setAlarm");
    assert.deepEqual(sets, [["setAlarm", NOW + 10]]);
  }
});

test("R18: it keeps no table and carries no check: it runs over a storage with no SQL, writing only the alarm and the probe value", async () => {
  const { s, st } = world({ "bias-debt": { due: NOW, wake: NOW + 5 } }, { SCHED_PROBE: JSON.stringify([{ name: "p", period: 9, fires: 1 }]) });
  assert.equal("sql" in st, false);
  await s.probeArm(NOW); await s.onAlarm(NOW); await s.arm(NOW); await s.start(NOW);
  const touched = new Set(st.log.map(([m, k]) => (k === undefined || typeof k === "number" ? m : `${m}:${k}`)));
  for (const x of touched) assert.ok(/^(getAlarm|setAlarm|deleteAlarm|get:sched_probe|put:sched_probe)$/.test(x), x);
  for (const name of Object.keys(scheduler))
    assert.doesNotMatch(name, /SCHEMA|CHECKS|TABLES|PURGE|migrate/i, `${name}: the module exports no schema, table or check`);
});

test("R19: it raises no queue item and holds no notification kind of its own: nothing it answers or exports is a kind", async () => {
  const { s } = world({ "ai-run-reap": { due: 1, tick: { reaped: [] } } });
  const r = await s.onAlarm(NOW);
  assert.equal(JSON.stringify(r).includes("\"kind\""), false);
  for (const [name, v] of Object.entries(scheduler))
    assert.doesNotMatch(`${name} ${typeof v === "object" ? JSON.stringify(v) : ""}`, /KIND|notification|queue item/i, name);
});

test("R20: no place is named in this module's behaviour or outward text; a consumer named after one is scheduled like any other", async () => {
  const places = /oakland|alameda|california|\bbay area\b|san francisco|berkeley|\bCA\b/i;
  const said = [];
  const { s } = world({ "ai-run-reap": { due: 1, throws: "tick" } }, { SCHED_PROBE: "[{\"name\":\"p\",\"period\":1,\"fires\":1}]" });
  said.push(JSON.stringify(await s.probeArm(NOW)), JSON.stringify(await s.onAlarm(NOW + 1)));
  said.push(JSON.stringify(s.register("m", null)), JSON.stringify(s.register("m", consumer("x", { key: "swept" }))));
  said.push(JSON.stringify(Object.entries(scheduler).map(([k, v]) => [k, typeof v === "function" ? "" : v])));
  for (const x of said) assert.doesNotMatch(x, places, x);
  const w = world();
  w.s.register("m", consumer("oakland-clock", { key: "oaklandclock", due: (n) => n, wake: NOW + 1, tick: { oaklandclock: 1 } }));
  w.s.register("m", consumer("springfield-clock", { key: "springfieldclock", due: (n) => n, wake: NOW + 1, tick: { springfieldclock: 1 } }));
  const r = await w.s.onAlarm(NOW);
  assert.deepEqual([r.oaklandclock, r.springfieldclock, r.nextAt], [1, 1, NOW + 1]);
});
