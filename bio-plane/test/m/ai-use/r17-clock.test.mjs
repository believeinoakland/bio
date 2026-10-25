/* ai-use R17 (T51 fix round 10; STORE-REQUEST #5; K5192, K5132, K5148): every instant this module records, and every judgement
   of one, reads the store's clock. A handed `now` answers first, else the store's `env.BIO_NOW_MS`, else the wall clock.
   Failing-first: before the fix, an instant recorded under a pinned `BIO_NOW_MS` read the wall clock. Each case has a
   negative control on the wall clock (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { standard, usage } from "./fixture.mjs";
import { AiUse, aiUseOps } from "../../../src/ai-use/index.mjs";

/* The pinned world's clock, whole seconds, as `BIO_NOW_MS` spells it (a string, as an environment variable is). */
const PINNED_ISO = "2026-03-14T09:26:53Z";
const PINNED = String(Date.parse(PINNED_ISO));
const HANDED_ISO = "2026-05-02T18:04:11Z";
const HANDED = Date.parse(HANDED_ISO);
const url = (q) => new URL(`http://x/?${q}`);

test("R17 an instant an op records under a pinned BIO_NOW_MS reads that clock; with none, the wall clock", async () => {
  const w = await standard();
  const body = { owner: "member:ann", scope: "overall", unit: "calls", period: "day", amount: 5 };
  const pinned = aiUseOps(w.u, url("by=ann"), body, { BIO_NOW_MS: PINNED }).ailimitset();
  assert.equal(pinned.ok, true);
  assert.equal(pinned.set_at, PINNED_ISO, "the limit's set_at reads the pinned clock");
  assert.equal(w.row("SELECT at FROM ai_limit_history WHERE owner = 'member:ann' ORDER BY seq DESC LIMIT 1").at, PINNED_ISO,
    "the history's instant reads the pinned clock");
  /* a fresh world: the environment, once handed, stays with its instance (as credentials' does) */
  const control = await standard();
  const before = Math.floor(Date.now() / 1000) * 1000;
  const wall = aiUseOps(control.u, url("by=ann"), { ...body, scope: "ask", amount: 7 }, null).ailimitset();
  const after = Date.now();
  const ms = Date.parse(wall.set_at);
  assert.ok(ms >= before && ms <= after, `control: with no environment the wall clock answers (${wall.set_at})`);
  assert.notEqual(wall.set_at, PINNED_ISO, "control: the pinned clock is not used without an environment");
});

test("R17 a handed now answers first, before the store's BIO_NOW_MS; the day it judges and the instant it records are that clock's", async () => {
  const w = await standard();
  const u = new AiUse(w.ctx, { record: w.rc, membership: w.m, accounts: w.a, now: () => HANDED, env: { BIO_NOW_MS: PINNED } });
  assert.equal(u.aiLimitSet({ owner: "member:ann", scope: "overall", unit: "calls", period: "day", amount: 1, by: "ann" }).set_at,
    HANDED_ISO, "a handed now beats the environment");
  const counted = u.countUsage({ owner: "member:ann", member: "ann", use: "ask", mode: "ask", model: "m",
    usage: usage(10, 0, null), calls: 1, act: "run-r17-1" });
  assert.equal(counted.ok, true);
  assert.equal(counted.day, "2026-05-02", "the counter's day is the handed clock's local day");
  assert.equal(w.row("SELECT first_at FROM ai_use_acts WHERE act = 'run-r17-1'").first_at, HANDED_ISO);
  const judged = u.useCheck({ owner: "member:ann", member: "ann", use: "ask" });
  assert.equal(judged && judged.code, "AI_LIMIT_REACHED", "the judgement reads the handed day: its one call reaches the limit");
  assert.equal(w.u.useCheck({ owner: "member:ann", member: "ann", use: "ask" }), null,
    "control: the wall clock's day holds no use, so nothing is reached");
});

test("R17 with the environment only (no handed now), a judgement and an instant read BIO_NOW_MS", async () => {
  const w = await standard();
  const u = new AiUse(w.ctx, { record: w.rc, membership: w.m, accounts: w.a, env: { BIO_NOW_MS: PINNED } });
  assert.equal(u.countUsage({ owner: "member:ann", member: "ann", use: "ask", mode: "ask", model: "m",
    usage: usage(3, 0, null), calls: 1, act: "run-r17-2" }).day, "2026-03-14");
  assert.equal(w.row("SELECT first_at FROM ai_use_acts WHERE act = 'run-r17-2'").first_at, PINNED_ISO);
});
