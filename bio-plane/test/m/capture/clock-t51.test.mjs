/* capture, T51 fix round 10 (K5132, K5148; B42): the instance clock (R115). Every instant the module records or judges without a
   caller's handed `at`/`now` is read at one clock: the function `captureOf` was handed as `now` (R90), else the store's
   environment's `BIO_NOW_MS` (handed in by the ops map), else the wall clock. At the module's interface: its ops map
   (`captureOps`), its services, over this module's fixture. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket } from "./fixture.mjs";
import { captureOps } from "../../../src/capture/index.mjs";

const te = new TextEncoder();
const PIN = Date.parse("2031-03-04T05:06:07Z");
const PINNED = "2031-03-04T05:06:07Z";
/* the ops map for the pinned environment, as the plane hands it */
const pin = (c, ms = PIN) => captureOps(c, new URL("http://x/"), null, { BIO_NOW_MS: String(ms) });
const op = (c, name, qs = "", body = null, env = { BIO_NOW_MS: String(PIN) }) => captureOps(c, new URL(`http://x/${name}?${qs}`), body, env)[name]();
const STATE = { walk: 1 };
const save = (c, session, extra = {}) => c.saveCaptureSession({ session, locator: "https://a.example/p", primarySha: "a".repeat(64), primaryFile: "snapshots/p", base: "https://a.example/", state: STATE, ...extra });
const near = (iso, ms) => Math.abs(Date.parse(iso) - ms) < 5000;

test("R115 R86: an upload's receipt instant and its document's `retrieved` follow BIO_NOW_MS pinned through the ops map; control: with none pinned they read the wall clock", async () => {
  const f = fresh({ evidence: bucket() });
  pin(f.c);
  const r = await f.c.uploadCapture({ bytes: te.encode("the budget memo"), statement: "handed to me", by: "m1" });
  assert.equal(r.ok, true);
  assert.equal(r.receipt.retrieved, PINNED);
  assert.equal(r.document.retrieved, PINNED);
  const w = fresh({ evidence: bucket() });
  const before = Date.now();
  const r2 = await w.c.uploadCapture({ bytes: te.encode("another memo"), statement: "handed to me", by: "m1" });
  assert.ok(near(r2.receipt.retrieved, before), "wall clock");
  assert.notEqual(r2.receipt.retrieved, PINNED);
  /* an `at` the caller hands wins */
  const r3 = await f.c.uploadCapture({ bytes: te.encode("a third memo"), statement: "handed to me", by: "m1", at: "2030-01-01T00:00:00Z" });
  assert.equal(r3.receipt.retrieved, "2030-01-01T00:00:00Z");
});

test("R115 R22: a saved session's created, updated and expires follow the pinned clock; its expired judgement is made at it; control: the wall clock when none is pinned", () => {
  const { c } = fresh();
  const out = (name, qs, body) => op(c, name, qs, body);
  out("savecapturesession", "", { session: "s1", locator: "l", primarySha: "a".repeat(64), primaryFile: "f", base: "b", state: STATE, ttlMs: 60000 });
  const row = (s) => c.liveCaptureSessions(PIN - 1).find((x) => x.session === s);
  assert.deepEqual([row("s1").created, row("s1").updated, row("s1").expires], [PINNED, PINNED, "2031-03-04T05:07:07Z"]);
  assert.equal(out("loadcapturesession", "session=s1").expired, false);
  /* the clock moves past the expiry: the session is found, expired */
  assert.equal(op(c, "loadcapturesession", "session=s1", null, { BIO_NOW_MS: String(PIN + 61000) }).expired, true);
  /* a second save updates at the clock */
  op(c, "savecapturesession", "", { session: "s1", locator: "l", primarySha: "a".repeat(64), primaryFile: "f", base: "b", state: STATE, ttlMs: 60000 }, { BIO_NOW_MS: String(PIN + 10000) });
  assert.deepEqual([row("s1").created, row("s1").updated, row("s1").expires], [PINNED, "2031-03-04T05:06:17Z", "2031-03-04T05:07:17Z"]);
  /* control: no pin reads the wall clock */
  const w = fresh().c;
  const before = Date.now();
  save(w, "w1");
  const live = w.liveCaptureSessions(before - 1000)[0];
  assert.ok(near(live.created, before) && near(live.expires, before + 3600000), "wall clock");
});

test("R115 R46: liveCaptureSessions with no `now` lists at the pinned clock, and a session past its expiry on it leaves the list; a `now` handed wins; control: the wall clock when none is pinned", () => {
  const { c } = fresh();
  save(c, "early", { ttlMs: 1000, at: "2031-03-04T05:00:00Z" });
  save(c, "late", { ttlMs: 3600000, at: "2031-03-04T05:00:00Z" });
  pin(c);   /* 05:06:07: "early" expired at 05:00:01, "late" lives until 06:00:00 */
  assert.deepEqual(c.liveCaptureSessions().map((x) => x.session), ["late"]);
  pin(c, Date.parse("2031-03-04T04:59:00Z"));
  assert.deepEqual(c.liveCaptureSessions().map((x) => x.session), ["early", "late"]);
  assert.deepEqual(c.liveCaptureSessions("2031-03-04T07:00:00Z").map((x) => x.session), [], "a handed now wins");
  /* control: no pin, the wall clock */
  const w = fresh().c;
  save(w, "w", { ttlMs: 3600000, at: "2030-01-01T00:00:00Z" });
  assert.deepEqual(w.liveCaptureSessions().map((x) => x.session), ["w"], "live at the wall clock (2026), which the pinned 2031 would have expired");
});

test("R115 R90: a clock handed as `now` answers before BIO_NOW_MS; a clock at fault reads the next", () => {
  const { c } = fresh();
  c.clock = () => PIN + 5000;
  pin(c, PIN + 999999);
  save(c, "h");
  assert.equal(c.liveCaptureSessions(0)[0].created, "2031-03-04T05:06:12Z");
  c.clock = () => NaN;
  save(c, "g");
  assert.equal(c.liveCaptureSessions(0).find((x) => x.session === "g").created, "2031-03-04T05:22:46Z");
});
