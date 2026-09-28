/* capture-requests: the drain (R10–R22, R37–R41), driven at `drain`, `drainPending` and `drainIntervalMs`, with
   `capture`'s in-process arm a scripted stand-in that records exactly what it was handed. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, T0, ENV, refused, renderRefusal, sha } from "./fixture.mjs";
import { captureRequestAttribution, CAPTURE_REQUEST_TICK_BATCH, CAPTURE_REQUEST_TTL_MS, CAPTURE_SOURCE_CHECKS,
         sourceReasonOf, captureRequestsOps } from "../../../src/capture-requests/index.mjs";
import { CAPTURE_REQUEST_CHECKS, RENDER_CAPTURE_CHECKS, civicosUserAgent, userAgentIsLegible }
  from "../../../checks/bio-checks.mjs";

const iso = (ms) => new Date(ms).toISOString().replace(/\.\d+Z$/, "Z");
const addr = (i) => `https://h${i}.example.org/doc`;
const inquiryMd = (ua) => ["---", "id: INQ-UA", "object_type: inquiry", ...(ua ? [`member_user_agent: "${ua}"`] : []),
                           "---", "", "## Question", "", "q", ""].join("\n");

test("R10 the attribution names the daemon as a machine-shaped actor at the session's request, both principals trimmed, its statement composed from them; one or none present is refused naming which", () => {
  const row = { run: "R-1", target: "INQ-1", principal_plane: "  member:ann/tok1 ", principal_claude: " instance " };
  const a = captureRequestAttribution(row);
  assert.deepEqual(a, {
    ok: true, actor: "token:daemon", machine_attributed: true,
    at_the_request_of: { run: "R-1", inquiry: "INQ-1" },
    principals: { plane: "member:ann/tok1", claude: "instance" },
    statement: "the daemon captured this, at the investigative session's request (run R-1), under member:ann/tok1, paid by instance",
  });
  for (const [p, c, want] of [["x", "", { plane: "x", claude: null }], ["", "y", { plane: null, claude: "y" }],
                              [" ", " ", { plane: null, claude: null }]])
    assert.deepEqual(captureRequestAttribution({ ...row, principal_plane: p, principal_claude: c }),
                     { ok: false, code: "CAPTURE_ATTRIBUTION_ONE_PRINCIPAL", ...want });
  assert.deepEqual(captureRequestAttribution(null), { ok: false, code: "CAPTURE_ATTRIBUTION_ONE_PRINCIPAL", plane: null, claude: null });
});

test("R11 unconfigured, the drain answers configured: false and drains nothing; not re-entrant: a drain while one runs answers busy and does nothing", async () => {
  const cold = world({ env: { VERSION: "1", INSTANCE_NAME: "i" } }).scene();
  cold.ask();
  const d = await cold.cr.drain({});
  assert.deepEqual([d.configured, d.drained, d.captured, d.remaining], [false, 0, [], 0]);
  assert.equal(cold.capture.calls.length, 0);
  assert.equal(cold.req(cold.rows(`SELECT request FROM capture_requests`)[0].request).state, "requested");

  const w = world().scene();
  w.ask();
  let release;
  w.capture.script.set("https://example.org/a", () => new Promise((r) => { release = r; }));
  const first = w.cr.drain({});
  await new Promise((r) => setImmediate(r));
  const second = await w.cr.drain({});
  assert.deepEqual([second.configured, second.busy, second.drained], [true, true, 0]);
  release({ status: 200, body: { ok: true, document: { capture: { sha256: sha("a"), grade: "B" } } } });
  assert.equal((await first).captured.length, 1);
  assert.equal(w.capture.calls.length, 1);
});

test("R37 drainPending is the number of requested rows, 0 when unconfigured; drainIntervalMs is 60,000 or the binding when it reads as a number ≥ 0; both never throw and write nothing", () => {
  const w = world().scene();
  assert.equal(w.cr.drainPending(), 0);
  w.ask({ address: "https://example.org/1" }); w.ask({ address: "https://example.org/2" });
  assert.equal(w.cr.drainPending(), 2);
  w.st.sql.exec(`UPDATE capture_requests SET state='captured' WHERE address='https://example.org/2'`);
  assert.equal(w.cr.drainPending(), 1);
  assert.equal(world({ env: {} }).scene().cr.drainPending(), 0);
  const off = world({ env: {} }).scene(); off.ask();
  assert.equal(off.cr.drainPending(), 0, "an unconfigured instance holds no alarm");
  assert.equal(world({ configured: () => { throw new Error("x"); } }).cr.drainPending(), 0);
  for (const [v, want] of [[undefined, 60000], ["", 60000], ["  ", 60000], [null, 60000], ["5000", 5000], [0, 0],
                           ["0", 0], ["-1", 60000], ["soon", 60000], [2500, 2500], [Infinity, 60000]])
    assert.equal(world({ env: { ...ENV, CAPTURE_REQUEST_TICK_MS: v } }).cr.drainIntervalMs(), want, String(v));
  const before = w.rows(`SELECT * FROM capture_requests`);
  w.cr.drainPending(); w.cr.drainIntervalMs();
  assert.deepEqual(w.rows(`SELECT * FROM capture_requests`), before);
});

test("R12 a tick acts on at most 10 rows (limit lowers, never raises), oldest first by requested_at then request", async () => {
  const w = world().scene();
  for (let i = 0; i < 13; i++) { w.ask({ address: addr(i) }); w.tick(1000); }
  const d = await w.cr.drain({ limit: 50 });
  assert.equal(d.captured.length, CAPTURE_REQUEST_TICK_BATCH);
  assert.deepEqual(d.captured.map((c) => c.address), [...Array(10).keys()].map(addr));
  assert.equal(d.remaining, 3);
  const e = await w.cr.drain({ limit: 2 });
  assert.equal(e.captured.length, 2);
  assert.equal((await w.cr.drain({ limit: 0 })).captured.length, 1, "a limit of 0 is the batch, never none");
});

test("R12 expired rows are released before selection, so none takes a slot", async () => {
  const w = world().scene();
  for (let i = 0; i < 3; i++) w.ask({ address: addr(i) });
  w.tick(CAPTURE_REQUEST_TTL_MS - 10_000);
  for (let i = 3; i < 6; i++) { w.ask({ address: addr(i) }); w.tick(1000); }
  w.tick(8000);
  const d = await w.cr.drain({ limit: 3 });
  assert.equal(d.expired.length, 3);
  assert.deepEqual(d.captured.map((c) => c.address), [addr(3), addr(4), addr(5)]);
});

test("R13 R14 conduct refusals and holds: code, detail and attempts + 1 written, terminal to refused, temporary left requested; each appended LOOKED_INDETERMINATE, governed exactly for our pacing", async () => {
  const w = world().scene();
  w.bundle("INQ-UA", "inquiry", { md: inquiryMd(null) });
  w.run("R-UA", { context: "INQ-UA" });
  w.run("R-HALF", { claude: " " });
  const ask = (over) => w.ask(over).request;
  const ids = {
    attribution: ask({ run: "R-HALF", address: "https://a.example.org/x" }),
    purpose: ask({ purpose: "shopping", address: "https://b.example.org/x" }),
    mode: ask({ ua_mode: "spoofed", address: "https://c.example.org/x" }),
    unrecorded: ask({ run: "R-UA", target: "INQ-UA", ua_mode: "member-browser", address: "https://d.example.org/x" }),
  };
  await w.governor.governorReport({ host: "e.example.org", status: 429, retry_after_ms: 600000 });
  ids.held = ask({ address: "https://e.example.org/x" });
  w.tick(1000);
  ids.first = ask({ address: "https://f.example.org/1" });
  w.tick(1000);
  ids.spent = ask({ address: "https://f.example.org/2" });
  const d = await w.cr.drain({});
  const by = (list) => Object.fromEntries(list.map((x) => [x.request, x]));
  const R = by(d.refused), H = by(d.held);
  const expectRow = (id, code, state, governed, condition) => {
    const r = w.req(id);
    assert.deepEqual([r.state, r.code, r.attempts], [state, code, 1], id);
    const x = (state === "refused" ? R : H)[id];
    assert.deepEqual([x.code, x.check, x.translation], [code, CAPTURE_REQUEST_CHECKS[code].check, CAPTURE_REQUEST_CHECKS[code].translation]);
    assert.equal(typeof x.detail, "string");
    const look = w.log().filter((l) => l.subject === r.address).at(-1);
    assert.deepEqual([look.state, look.governed, look.condition, look.authority_kind, look.authority],
                     ["LOOKED_INDETERMINATE", governed ? 1 : 0, condition, "run", r.run]);
    assert.match(look.detail, new RegExp(`${CAPTURE_REQUEST_CHECKS[code].check} ${code}`));
  };
  expectRow(ids.attribution, "CAPTURE_ATTRIBUTION_ONE_PRINCIPAL", "refused", false, null);
  expectRow(ids.purpose, "CAPTURE_CONDUCT_NO_PURPOSE", "refused", false, null);
  expectRow(ids.mode, "CAPTURE_CONDUCT_UA_ILLEGIBLE", "refused", false, null);
  expectRow(ids.unrecorded, "CAPTURE_CONDUCT_UA_UNRECORDED", "refused", false, null);
  expectRow(ids.held, "CAPTURE_CONDUCT_HOST_HELD", "requested", true, "governor-holding-host");
  expectRow(ids.spent, "CAPTURE_CONDUCT_TICK_SPENT", "requested", true, "governor-holding-host");
  assert.equal(w.req(ids.first).state, "captured");
  assert.deepEqual(w.capture.calls.map((c) => c.opts.captureRequest.locator), ["https://f.example.org/1"],
    "nothing refused or held left the instance");
});

test("R14 conduct's order: attribution before purpose before agent before rate, the first failing rule deciding", async () => {
  const w = world().scene();
  w.run("R-HALF", { claude: "" });
  await w.governor.governorReport({ host: "held.example.org", status: 403 });
  const a = w.ask({ run: "R-HALF", purpose: "bad", ua_mode: "bad", address: "https://held.example.org/1" }).request;
  const b = w.ask({ purpose: "bad", ua_mode: "bad", address: "https://held.example.org/2" }).request;
  const c = w.ask({ ua_mode: "bad", address: "https://held.example.org/3" }).request;
  await w.cr.drain({});
  assert.deepEqual([a, b, c].map((id) => w.req(id).code),
                   ["CAPTURE_ATTRIBUTION_ONE_PRINCIPAL", "CAPTURE_CONDUCT_NO_PURPOSE", "CAPTURE_CONDUCT_UA_ILLEGIBLE"]);
});

test("R14 the civicos agent is the catalogue's composer and legible; a recorded member agent is delegated verbatim; no robots.txt is read and a Disallow path is captured (BOB-3)", async () => {
  const UA = "Mozilla/5.0 (X11; Linux x86_64) Firefox/140.0";
  const w = world().scene();
  w.bundle("INQ-UA", "inquiry", { md: inquiryMd(UA) });
  w.run("R-UA", { context: "INQ-UA" });
  const touched = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (u) => { touched.push(String(u)); throw new Error("no network in this test"); };
  try {
    w.ask({ address: "https://www.example.gov/private/disallowed/report.pdf" });
    w.ask({ run: "R-UA", target: "INQ-UA", ua_mode: "member-browser", address: "https://m.example.org/x" });
    w.ask({ purpose: "acquire", address: "https://p.example.org/x" });
    const d = await w.cr.drain({});
    assert.equal(d.captured.length, 3);
  } finally { globalThis.fetch = realFetch; }
  assert.deepEqual(touched, [], "no robots.txt, nor anything else, fetched by the drain itself");
  const by = Object.fromEntries(w.capture.calls.map((c) => [c.opts.captureRequest.locator, c.opts.captureRequest]));
  assert.equal(by["https://m.example.org/x"].agent, UA);
  assert.equal(by["https://p.example.org/x"].purpose, "acquire");
  assert.equal(by["https://www.example.gov/private/disallowed/report.pdf"].agent, null);
  const ua = civicosUserAgent(ENV.VERSION, ENV.INSTANCE_NAME, "investigate");
  assert.equal(userAgentIsLegible(ua), true);
});

test("R15 a row passing conduct is set draining in the tick that fires, counts one fetch for its host, and is fired with the row's address, purpose, agent and render and nothing else", async () => {
  const w = world().scene();
  const id = w.ask({ address: "https://s.example.org/doc", render: true }).request;
  let seen = null;
  w.capture.script.set("https://s.example.org/doc", (body, opts) => {
    seen = w.req(id).state;
    return { status: 200, body: { ok: true, existed: false, document: { capture: { sha256: sha("s"), grade: "A" } } } };
  });
  const d = await w.cr.drain({});
  assert.equal(seen, "draining");
  assert.equal(w.capture.calls.length, 1);
  const call = w.capture.calls[0];
  assert.deepEqual(call.body, {});
  assert.deepEqual(call.opts, { cls: "daemon", member: false, storeName: "bio",
    captureRequest: { locator: "https://s.example.org/doc", purpose: "investigate", agent: null, render: true } });
  const r = w.req(id);
  assert.deepEqual([r.state, r.code, r.capture_sha, r.captured_at, r.attempts], ["captured", null, sha("s"), iso(T0), 1]);
  assert.equal(r.detail, captureRequestAttribution(r).statement);
  assert.deepEqual(d.captured, [{ request: id, address: "https://s.example.org/doc", sha: sha("s"), grade: "A",
                                  attribution: captureRequestAttribution(r), already_held: false }]);
  const look = w.log().at(-1);
  assert.deepEqual([look.state, look.result_kind, look.result_ref, look.detail, look.governed],
                   ["PRESENT", "capture", sha("s"), r.detail, 0]);
});

test("R16 nothing outside the drain makes the instance fetch for a request: the drain fires capture's in-process arm, and op=acquire refuses via capture-request from any caller (C-28.13)", async () => {
  const { acquire } = await import("../../../src/capture/acquire.mjs");
  const fakeCap = { core: { evidenceStore: () => ({ head: async () => null, get: async () => null, put: async () => ({}) }) } };
  for (const cls of ["admin", "member", "probe", "daemon", "ai", null]) {
    const res = await acquire(fakeCap, { via: "capture-request", request: "CR-x", locator: "https://example.org/a" }, { cls });
    assert.equal(res.status, 403);
    assert.equal(res.body.code, "CAPTURE_NOT_DRAINING");
    assert.equal(res.body.check, "C-28.13");
  }
  const w = world().scene();
  w.ask();
  await w.cr.drain({});
  assert.equal(w.capture.calls.length, 1);
  assert.ok(w.capture.calls[0].opts.captureRequest, "the drain's fire is the in-process arm");
});

test("R17 a render capture refuses before fetching (C-83.3, .4, .5, .8) holds the row under that code, gives the host's slot back, is governed render-deferred, and is answered held with capture's own word", async () => {
  for (const [code, word, state] of [["RENDER_NO_RENDERER", null, "deferred"], ["RENDER_DEFERRED", "deferred", "deferred"],
                                     ["RENDER_HOST_COOLING_OFF", null, "deferred"], ["RENDER_AT_CAPACITY", "waiting", "waiting"]]) {
    const w = world().scene();
    const r = w.ask({ address: "https://r.example.org/page", render: true }).request;
    w.tick(1000);
    const p = w.ask({ address: "https://r.example.org/plain" }).request;
    w.capture.script.set("https://r.example.org/page", renderRefusal(code, word));
    const d = await w.cr.drain({});
    const row = w.req(r);
    assert.deepEqual([row.state, row.code, row.capture_sha, row.attempts], ["requested", code, null, 1], code);
    assert.deepEqual(d.held.map((h) => [h.request, h.code, h.check, h.render]),
                     [[r, code, RENDER_CAPTURE_CHECKS[code].check, { state, content: "undetermined" }]]);
    assert.equal(w.req(p).state, "captured", "the slot was given back: the plain request for the same host went out");
    const look = w.log().find((l) => l.subject === "https://r.example.org/page");
    assert.deepEqual([look.state, look.governed, look.condition], ["LOOKED_INDETERMINATE", 1, "render-deferred"]);
  }
});

test("R18 a render result decided after the page was fetched spends the slot: RENDER_NOT_A_PAGE is refused, RENDER_FAILED holds", async () => {
  for (const [code, state, list] of [["RENDER_NOT_A_PAGE", "refused", "refused"], ["RENDER_FAILED", "requested", "held"]]) {
    const w = world().scene();
    const r = w.ask({ address: "https://r.example.org/page", render: true }).request;
    w.tick(1000);
    const p = w.ask({ address: "https://r.example.org/plain" }).request;
    w.capture.script.set("https://r.example.org/page", renderRefusal(code));
    const d = await w.cr.drain({});
    assert.deepEqual([w.req(r).state, w.req(r).code], [state, code]);
    assert.equal(d[list][0].check, RENDER_CAPTURE_CHECKS[code].check);
    assert.deepEqual([w.req(p).state, w.req(p).code], ["requested", "CAPTURE_CONDUCT_TICK_SPENT"],
      "the host's slot stays spent: the page was fetched");
  }
});

test("R19 any other failure holds the row requested under C-28.17 with its check and translation, not governed, answered in held; a thrown error's words are never carried", async () => {
  const w = world().scene();
  const a = w.ask({ address: "https://x.example.org/500" }).request;
  const b = w.ask({ address: "https://y.example.org/thrown" }).request;
  w.capture.script.set("https://x.example.org/500", refused(503));
  w.capture.script.set("https://y.example.org/thrown", () => { throw new Error("secret https://y/?token=abc"); });
  const d = await w.cr.drain({});
  for (const id of [a, b]) {
    const r = w.req(id);
    assert.deepEqual([r.state, r.code], ["requested", "CAPTURE_FETCH_FAILED"]);
    const h = d.held.find((x) => x.request === id);
    assert.deepEqual([h.check, h.translation], [CAPTURE_REQUEST_CHECKS.CAPTURE_FETCH_FAILED.check,
                                                CAPTURE_REQUEST_CHECKS.CAPTURE_FETCH_FAILED.translation]);
    const look = w.log().find((l) => l.subject === r.address);
    assert.deepEqual([look.state, look.governed], ["LOOKED_INDETERMINATE", 0]);
  }
  assert.equal(JSON.stringify(w.rows(`SELECT * FROM capture_requests`)).includes("token=abc"), false);
  assert.equal(JSON.stringify(w.log()).includes("token=abc"), false);
});

test("R19 every code this module writes to a row is catalogued in C-28, C-83 or C-108 (K181)", async () => {
  const w = world().scene();
  w.run("R-HALF", { claude: "" });
  w.ask({ run: "R-HALF", address: "https://a.example.org/1" });
  w.ask({ purpose: "x", address: "https://b.example.org/1" });
  w.ask({ address: "https://c.example.org/1" }); w.ask({ address: "https://c.example.org/2" });
  w.ask({ address: "https://d.example.org/1" }); w.capture.script.set("https://d.example.org/1", refused(401));
  w.ask({ address: "https://e.example.org/1" }); w.capture.script.set("https://e.example.org/1", refused(500));
  w.ask({ address: "https://f.example.org/1", render: true });
  w.capture.script.set("https://f.example.org/1", renderRefusal("RENDER_DEFERRED", "deferred"));
  await w.cr.drain({});
  w.tick(CAPTURE_REQUEST_TTL_MS + 1000);
  await w.cr.drain({});
  const codes = w.rows(`SELECT DISTINCT code FROM capture_requests WHERE code IS NOT NULL`).map((r) => r.code);
  assert.ok(codes.length >= 6);
  for (const c of codes)
    assert.ok(c in CAPTURE_REQUEST_CHECKS || c in RENDER_CAPTURE_CHECKS || c in CAPTURE_SOURCE_CHECKS, c);
});

test("R20 every non-terminal row past its expires, plain or render, is released expired: last code kept, detail saying what it was held under, appended LOOKED_INDETERMINATE (a render governed render-deferred), never fetched; at most one batch per tick", async () => {
  const w = world().scene();
  const plain = w.ask({ address: "https://p.example.org/1" }).request;
  const render = w.ask({ address: "https://r.example.org/1", render: true }).request;
  w.capture.script.set("https://p.example.org/1", refused(500));
  w.capture.script.set("https://r.example.org/1", renderRefusal("RENDER_DEFERRED", "deferred"));
  await w.cr.drain({});
  const never = w.ask({ address: "https://n.example.org/1" }).request;
  w.tick(CAPTURE_REQUEST_TTL_MS + 5000);
  const calls = w.capture.calls.length;
  const d = await w.cr.drain({});
  assert.equal(w.capture.calls.length, calls, "nothing fetched after expiry");
  const e = Object.fromEntries(d.expired.map((x) => [x.request, x]));
  assert.deepEqual([w.req(plain).state, w.req(plain).code], ["expired", "CAPTURE_FETCH_FAILED"]);
  assert.match(w.req(plain).detail, /held under C-28\.17 CAPTURE_FETCH_FAILED/);
  assert.equal(e[plain].render, null);
  assert.deepEqual([w.req(never).state, w.req(never).code], ["expired", null]);
  assert.match(w.req(never).detail, /never attempted/);
  assert.deepEqual([w.req(render).state, w.req(render).code], ["expired", "RENDER_DEFERRED"]);
  assert.deepEqual(e[render].render, { state: "expired", content: "undetermined" });
  assert.equal(e[render].check, "C-83.4");
  const looks = Object.fromEntries(w.log().filter((l) => /expired UNDETERMINED/.test(l.detail || "")).map((l) => [l.subject, l]));
  assert.deepEqual([looks["https://r.example.org/1"].governed, looks["https://r.example.org/1"].condition], [1, "render-deferred"]);
  assert.deepEqual([looks["https://p.example.org/1"].governed, looks["https://p.example.org/1"].condition], [0, null]);

  const x = world().scene();
  for (let i = 0; i < 14; i++) x.ask({ address: addr(i) });
  x.tick(CAPTURE_REQUEST_TTL_MS + 1);
  assert.equal((await x.cr.drain({})).expired.length, 10);
  assert.equal((await x.cr.drain({})).expired.length, 4);
  assert.equal(x.capture.calls.length, 0);
});

test("R21 a row left draining by a tick that did not finish goes back to requested on the next tick, or is released when past expires", async () => {
  const w = world().scene();
  const a = w.ask({ address: "https://a.example.org/1" }).request;
  const b = w.ask({ address: "https://b.example.org/1" }).request;
  w.st.sql.exec(`UPDATE capture_requests SET state='draining'`);
  w.st.sql.exec(`UPDATE capture_requests SET expires='2000-01-01T00:00:00Z' WHERE request=?`, b);
  const d = await w.cr.drain({});
  assert.equal(w.req(a).state, "captured");
  assert.equal(w.req(b).state, "expired");
  assert.deepEqual(d.expired.map((x) => x.request), [b]);
  assert.equal(w.rows(`SELECT * FROM capture_requests WHERE state='draining'`).length, 0);
});

test("R22 remaining is the number of requested rows after the tick", async () => {
  const w = world().scene();
  for (let i = 0; i < 12; i++) { w.ask({ address: addr(i) }); w.tick(1000); }
  w.ask({ address: "https://h0.example.org/second" });
  const d = await w.cr.drain({});
  assert.equal(d.remaining, w.rows(`SELECT * FROM capture_requests WHERE state='requested'`).length);
  assert.equal(d.remaining, 3);
});

test("R38 (its promotion deferred, N141, K181): a captured row carries what the promotion at collected will name: the run, both principals and the target inquiry", async () => {
  const w = world().scene();
  const id = w.ask().request;
  await w.cr.drain({});
  const r = w.req(id);
  assert.deepEqual([r.run, r.principal_plane, r.principal_claude, r.target, r.state],
                   ["R-1", "member:ann/tok1", "instance", "INQ-1", "captured"]);
});

test("R39 bytes the record already held are recorded as that capture: the row points at its digest and the answer says it was already held", async () => {
  const w = world().scene();
  const id = w.ask().request;
  w.capture.script.set("https://example.org/a", { status: 200, body: { ok: true, existed: true,
    document: { capture: { sha256: sha("held"), grade: "B" } } } });
  const d = await w.cr.drain({});
  assert.equal(w.req(id).capture_sha, sha("held"));
  assert.equal(d.captured[0].already_held, true);
  assert.equal(d.captured[0].sha, sha("held"));
});

test("R40 a source's refusal states its reason (401/407 login, 402 paywall, 403/406 user-agent, 451 other: terminal C-108.1; any other answer held, other), on the row and in its reads, the source's answer in detail", async () => {
  const table = [[401, "login", true], [407, "login", true], [402, "paywall", true], [403, "user-agent", true],
                 [406, "user-agent", true], [451, "other", true], [404, "other", false], [429, "other", false],
                 [500, "other", false], [503, "other", false]];
  for (const [s, reason, terminal] of table) assert.deepEqual(sourceReasonOf(s), { reason, terminal }, String(s));
  const w = world().scene();
  const ids = table.map(([s], i) => {
    const address = `https://s${i}.example.org/x`;
    w.capture.script.set(address, refused(s));
    w.tick(1000);
    return w.ask({ address }).request;
  });
  const d = await w.cr.drain({});
  table.forEach(([s, reason, terminal], i) => {
    const r = w.req(ids[i]);
    assert.equal(r.source_reason, reason, String(s));
    assert.equal(r.state, terminal ? "refused" : "requested");
    assert.equal(r.code, terminal ? "CAPTURE_SOURCE_REFUSED" : "CAPTURE_FETCH_FAILED");
    assert.match(r.detail, new RegExp(`HTTP ${s}`));
    const x = [...d.refused, ...d.held].find((y) => y.request === ids[i]);
    assert.equal(x.source_reason, reason);
    if (terminal) assert.deepEqual([x.check, x.translation], [CAPTURE_SOURCE_CHECKS.CAPTURE_SOURCE_REFUSED.check,
                                                              CAPTURE_SOURCE_CHECKS.CAPTURE_SOURCE_REFUSED.translation]);
  });
  assert.equal(CAPTURE_SOURCE_CHECKS.CAPTURE_SOURCE_REFUSED.check, "C-108.1");
  const read = w.cr.captureRequests({ viewer: V("ann") }).requests;
  assert.deepEqual(read.map((r) => r.source_reason), table.map(([, reason]) => reason));
  /* our own refusals state no source reason */
  const own = world().scene();
  own.ask({ purpose: "x" });
  await own.cr.drain({});
  assert.equal(own.cr.captureRequests({ viewer: V("ann") }).requests[0].source_reason, null);
});

test("R41 the one credential capture-sources admits for the request's scope (its plane principal, target and host) rides to capture's arm; none admitted, none rides", async () => {
  const w = world().scene();
  w.st.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, created, updated) VALUES ('ann', 'c', 'ann', 'member', 'active', 't', 't')`);
  const s = await w.creds.credentialSupply({ kind: "login", host: "paywalled.example.org", secret: "hunter2", scope: "member", by: "ann" });
  assert.equal(s.ok, true, JSON.stringify(s));
  w.ask({ address: "https://paywalled.example.org/doc" });
  w.ask({ address: "https://other.example.org/doc" });
  await w.cr.drain({});
  w.run("R-BOB", { plane: "member:bob/t" });
  w.ask({ run: "R-BOB", address: "https://paywalled.example.org/bob" }, { caller: "member:bob/t" });
  await w.cr.drain({});
  const by = Object.fromEntries(w.capture.calls.map((c) => [c.opts.captureRequest.locator, c.opts.captureRequest]));
  assert.deepEqual(by["https://paywalled.example.org/doc"].credential,
                   { credential: s.credential.credential, kind: "login", secret: "hunter2", supplied_by: "ann", scope: "member", project: null });
  assert.equal("credential" in by["https://other.example.org/doc"], false, "another host");
  assert.equal("credential" in (by["https://paywalled.example.org/bob"] || {}), false, "another member's run");
  /* never stored on the row or in the log */
  assert.equal(JSON.stringify(w.rows(`SELECT * FROM capture_requests`)).includes("hunter2"), false);
  assert.equal(JSON.stringify(w.log()).includes("hunter2"), false);
});

test("R11 R15 op=capturerequestdrain drives the same drain", async () => {
  const w = world().scene();
  w.ask();
  const d = await captureRequestsOps(w.cr, new URL("http://x/capturerequestdrain"), { actor: "suite" }).capturerequestdrain();
  assert.deepEqual([d.configured, d.actor, d.captured.length], [true, "suite", 1]);
});
