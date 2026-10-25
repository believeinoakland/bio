/* acquisition R95: `acquire`'s answer carries the milliseconds each of its stages took, by stage name (T51; K4194). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, network, text } from "./fixture.mjs";
import { acquire, stageTimes } from "../../../src/acquisition/index.mjs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/* a 75 KB PDF: the header, filler to size, the trailer */
const PDF_BYTES = new Uint8Array(75 * 1024);
PDF_BYTES.set(new TextEncoder().encode("%PDF-1.4\n"), 0);
PDF_BYTES.fill(0x20, 9, PDF_BYTES.length - 6);
PDF_BYTES.set(new TextEncoder().encode("%%EOF\n"), PDF_BYTES.length - 6);
const pdf = () => new Response(PDF_BYTES, { headers: { "content-type": "application/pdf" } });

const whole = (n) => Number.isInteger(n) && n >= 0;
const without = (b) => { const { timings, ...rest } = b; return rest; };

test("R95: acquire of a 75 KB PDF from a source that answers in one second carries a time for every stage that ran, summing to no more than the whole", async () => {
  const w = world();
  const url = "https://oakland.example/agenda.pdf";
  const r = await run(w, { [url]: async () => { await sleep(1000); return pdf(); } }, { locator: url });
  assert.equal(r.status, 200);
  const t = r.body.timings;
  assert.ok(t && typeof t === "object", "the answer carries timings");
  assert.ok(whole(t.total_ms));
  /* every stage that ran: the ask of the address's reputation, the governed fetch, the body, the receipt, the profile, the
     co-attestation; and none that did not (no render, no archive, no walk, no archive opening) */
  assert.deepEqual(Object.keys(t.stages).sort(), ["attest", "fetch", "profile", "read", "receipt", "reputation"]);
  for (const [name, ms] of Object.entries(t.stages)) assert.ok(whole(ms), `${name} is a whole number of milliseconds`);
  assert.ok(t.stages.fetch >= 900, `the second the source took is in fetch (${t.stages.fetch} ms)`);
  assert.ok(Object.values(t.stages).reduce((a, b) => a + b, 0) <= t.total_ms, "the stages sum to no more than the whole");
  assert.ok(t.total_ms >= t.stages.fetch);
  assert.equal(t.running, undefined, "a finished call has no stage under way");
});

test("R95: a refusal carries the times of the stages that ran, and only those", async () => {
  const w = world();
  const bad = await run(w, {}, { locator: "http://a.example/x" });
  assert.equal(bad.body.reason, "BAD_LOCATOR");
  assert.deepEqual(bad.body.timings.stages, {}, "nothing ran before the locator was refused");
  assert.ok(whole(bad.body.timings.total_ms));

  const refused = await run(w, { "https://a.example/x": new Response("no", { status: 403 }) }, { locator: "https://a.example/x" });
  assert.equal(refused.body.reason, "SOURCE_REFUSED");
  assert.deepEqual(Object.keys(refused.body.timings.stages).sort(), ["fetch", "reputation"]);

  const w2 = world({ gov: { refuse: ["cool.example"] } });
  const cool = await run(w2, {}, { locator: "https://cool.example/x" });
  assert.equal(cool.body.reason, "HOST_COOLING_OFF");
  assert.deepEqual(Object.keys(cool.body.timings.stages).sort(), ["fetch", "reputation"]);

  const gone = await run(w, { "https://a.example/y": new Error("connection reset") }, { locator: "https://a.example/y" });
  assert.equal(gone.body.reason, "FETCH_FAILED");
  assert.ok("fetch" in gone.body.timings.stages);
});

test("R95: a caller that stops waiting reads the stage under way and the stages done from the timings it handed in", async () => {
  const w = world();
  const url = "https://slow.example/page.pdf";
  const live = {};
  const net = network({ [url]: async () => { await sleep(500); return pdf(); } });
  try {
    const call = acquire(w.store, { locator: url }, { cls: "member", member: true, sessMember: "m1", storeName: "bio", timings: live });
    await sleep(150);                                   /* the caller's bound passes while the source is still answering */
    const stopped = stageTimes(live);
    assert.equal(stopped.running, "fetch", "the stage under way is named");
    assert.ok("reputation" in stopped.stages, "a stage already done is timed");
    assert.ok(stopped.stages.fetch >= 100, "the running stage's time so far is reported");
    assert.ok(Object.values(stopped.stages).reduce((a, b) => a + b, 0) <= stopped.total_ms);
    const done = await call;                            /* the call itself goes on, as the door's does (control-plane R105) */
    assert.equal(done.status, 200);
    const after = stageTimes(live);
    assert.equal(after.running, undefined);
    assert.deepEqual(after, done.body.timings, "the object handed in ends as the answer's timings");
  } finally { net.restore(); }
});

test("R95: the times are the only difference; the same capture answers the same without its timings key", async () => {
  const bytes = "same bytes every time";
  const one = await run(world(), { "https://a.example/d": text(bytes) }, { locator: "https://a.example/d" });
  const two = await run(world(), { "https://a.example/d": text(bytes) }, { locator: "https://a.example/d" });
  assert.equal(one.status, 200);
  assert.ok(one.body.timings && two.body.timings);
  const strip = (b) => JSON.stringify(without(b), (k, v) => (k === "retrieved" || k === "at" || k === "checked_at" || k === "attempted" ? undefined : v));
  assert.equal(strip(one.body), strip(two.body));
  assert.equal(Object.keys(one.body).filter((k) => k === "timings").length, 1);
});

test("R95 (fix round 4, C5a): a call that throws in `read` answers a refusal with `fetch` timed and `read` running; control: a call that ends normally names no running stage", async () => {
  const w = world();
  w.b.put = async () => { throw new Error("bucket exploded"); };
  const url = "https://oakland.example/throws.pdf";
  const handed = {};
  const r = await run(w, { [url]: pdf }, { locator: url }, { timings: handed });
  assert.equal(r.status, 500);
  assert.equal(r.body.ok, false);
  assert.equal(r.body.reason, "ACQUIRE_FAILED");
  const t = r.body.timings;
  assert.ok(whole(t.stages.fetch), "fetch was timed");
  assert.equal(t.running, "read", "the stage the throw cut is reported as running");
  assert.ok(whole(t.stages.read));
  assert.equal(Object.values(t.stages).reduce((a, b) => a + b, 0) <= t.total_ms, true);
  /* R95 (G177): the cut and the close are one clock reading, so the caller's own object ends exactly as the answer says, the cut stage included */
  const later = stageTimes(handed);
  assert.deepEqual(later.stages, t.stages);
  assert.equal(later.total_ms, t.total_ms);
  const ok = await run(world(), { [url]: pdf }, { locator: url });
  assert.equal(ok.status, 200);
  assert.equal(ok.body.timings.running, undefined);
});

test("R95 (fix round 9, G177): a clock that moves 1.5 ms between reads leaves a thrown call's answer and the caller's timings object equal, exactly", async () => {
  const w = world();
  const url = "https://oakland.example/throws-clock.pdf";
  let moving = false;
  w.b.put = async () => { moving = true; throw new Error("bucket exploded"); };
  const real = performance.now.bind(performance);
  let drift = 0;
  performance.now = () => { if (moving) drift += 1.5; return real() + drift; };
  try {
    const handed = {};
    const r = await run(w, { [url]: pdf }, { locator: url }, { timings: handed });
    assert.equal(r.body.reason, "ACQUIRE_FAILED");
    const later = stageTimes(handed);
    assert.deepEqual(later.stages, r.body.timings.stages, "the answer's stages are the object's");
    assert.equal(later.total_ms, r.body.timings.total_ms);
    assert.equal(r.body.timings.running, "read", "the stage the throw cut is still reported as running");
  } finally { performance.now = real; }
});
