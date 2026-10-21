/* host-governor R30 (fix round 4, N-slow-refuse): a refused host answers at once. Each test names the requirement id it
   checks. Two real stub HTTP hosts (127.0.0.1) answer 403 and 429 + `Retry-After: 60`; the governor is the real one over
   SQLite on the REAL clock, and `governedFetch` is entered by the act a caller presses. */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { world } from "./fixture.mjs";
import { governedFetch } from "../../../src/host-governor/index.mjs";

const serve = (status, headers = {}) => new Promise((resolve) => {
  const s = http.createServer((_q, p) => { p.writeHead(status, headers); p.end("no"); });
  s.hits = 0; s.on("request", () => { s.hits++; });
  s.listen(0, "127.0.0.1", () => resolve(s));
});
const url = (s) => `http://127.0.0.1:${s.address().port}/x`;
const inProcess = (g) => ({ admit: (q) => g.governorAdmit(q), report: (q) => g.governorReport(q) });
const realWorld = (opts = {}) => { const w = world({ t0: Date.now(), ...opts }); w.g.now = () => Date.now(); return w; };

let s403, s429;
before(async () => { s403 = await serve(403); s429 = await serve(429, { "retry-after": "60" }); });
after(() => { s403.close(); s429.close(); });

for (const [label, srv, cooloff] of [["403", () => s403, 30_000], ["429 with Retry-After: 60", () => s429, 60_000]]) {
  test(`R30: a host answering ${label} is refused to the caller in under 3 s with retry_in_ms, and the second request is refused at once`, async () => {
    const w = realWorld();
    const target = url(srv());
    const t0 = Date.now();
    const first = await governedFetch(target, { governor: inProcess(w.g) });
    assert.ok(Date.now() - t0 < 3000, "the first request answers in under 3 s");
    assert.ok(first.res && first.res.status === Number(label.slice(0, 3)));
    assert.ok(first.retry_in_ms > cooloff - 2000 && first.retry_in_ms <= cooloff, `retry_in_ms ${first.retry_in_ms} is the cool-off R9 records`);
    const hits = srv().hits;
    const t1 = Date.now();
    const second = await governedFetch(target, { governor: inProcess(w.g) });
    assert.ok(Date.now() - t1 < 50, "the second request is refused at once");
    assert.equal(second.refusedByGovernor, true);
    assert.equal(second.reason, "cooling_off");
    assert.ok(second.retry_in_ms > cooloff - 3000 && second.retry_in_ms <= cooloff);
    assert.equal(srv().hits, hits, "nothing was fetched");
    assert.equal(w.row(`127.0.0.1:${srv().address().port}`).cooloff_until > Date.now(), true);   // recorded as R9 records it
  });
}

test("R30: a wait longer than maxWaitMs is refused as R5 refuses, never slept, and spends no token", async () => {
  const w = realWorld({ random: 0.5 });
  const host = "slow.example";
  w.g.governorConfig({ host, appetite_per_min: 1 });                    // gap 60 s × 1.05
  w.g.governorAdmit({ host });                                          // the first grant, now
  const before = w.row(host);
  const slept = [];
  let fetched = 0;
  const t0 = Date.now();
  const out = await governedFetch(`http://${host}/x`, { governor: inProcess(w.g), sleep: (ms) => { slept.push(ms); return Promise.resolve(); },
                                                         fetch: async () => { fetched++; return { status: 200, headers: { get: () => null } }; } });
  assert.ok(Date.now() - t0 < 3000);
  assert.equal(out.refusedByGovernor, true);
  assert.equal(out.reason, "appetite");
  assert.ok(out.retry_in_ms > 50_000, `retry_in_ms ${out.retry_in_ms} names the wait`);
  assert.deepEqual(slept, []);
  assert.equal(fetched, 0);
  assert.equal(w.row(host).granted, before.granted, "no grant booked");
  assert.equal(w.row(host).last_grant_at, before.last_grant_at);
  assert.equal(w.row(host).refused_total, before.refused_total + 1);
});

test("R30: governorAdmit with maxWaitMs refuses a longer wait as R5 does and admits a shorter one as R6 does", () => {
  const w = world({ random: 0.5 });
  w.g.governorConfig({ host: "a.example", appetite_per_min: 12 });
  w.g.governorAdmit({ host: "a.example" });
  w.step(1_000);                                                        // gap 5250 − 1000 = 4250 ms
  const refused = w.g.governorAdmit({ host: "a.example", maxWaitMs: 3_000 });
  assert.equal(refused.admitted, false);
  assert.equal(refused.reason, "appetite");
  assert.equal(refused.retry_in_ms, 4_250);
  const granted = w.row("a.example").granted;
  assert.deepEqual(w.g.governorAdmit({ host: "a.example", maxWaitMs: 5_000 }), { admitted: true, wait_ms: 4_250, appetite_per_min: 12 });
  assert.equal(w.row("a.example").granted, granted + 1);
});

test("R30 control: an admitted fetch waits wait_ms as R16 says, within maxWaitMs; an unrefused status changes nothing", async () => {
  const w = realWorld({ random: 0 });                                   // j = 0.6: a 3000 ms gap, at the cap
  const host = "paced.example";
  w.g.governorAdmit({ host });
  const slept = [];
  const ok = { status: 200, headers: { get: () => null } };
  const out = await governedFetch(`http://${host}/x`, { governor: inProcess(w.g), sleep: (ms) => { slept.push(ms); return Promise.resolve(); },
                                                         fetch: async () => ok });
  assert.equal(out.res, ok);
  assert.equal(out.retry_in_ms, undefined, "an unrefused status carries no retry_in_ms");
  assert.equal(slept.length, 1);
  assert.ok(slept[0] > 0 && slept[0] <= 3_000, `slept ${slept[0]}`);
  assert.equal(w.row(host).cooloff_until, 0);
  assert.equal(w.row(host).refusals, 0);
});
