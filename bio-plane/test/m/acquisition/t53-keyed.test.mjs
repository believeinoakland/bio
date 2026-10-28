/* acquisition T53 (T53-97, T53-547; K5513, K5527 (6), K5666): R36's one machine use, R130's purposes and the officers lookup's service id,
   R131's durable count of a keyed service's stated limits, R134's G7, at the module's interface (`keyedFetch(store, …)`,
   `keyedServiceUsage(store, …)`) over a scripted network and the store handed in (fixture.mjs). The keyed service is a made-up key
   (`KEY`); the profile that states each service's call limits is the test profile with one more system for CourtListener's host. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, network } from "./fixture.mjs";
import { keyedFetch, keyedServiceUsage, KEYED_PURPOSES, POLL_SHARE_DEFAULT, civicsmithUserAgent } from "../../../src/acquisition/index.mjs";
import { get } from "../../../../jurisdictions/index.mjs";

const KEY = "SENTINEL-KEY-4c61d0b2e9";
const CL = "www.courtlistener.com";
const DOCKET = (id) => `https://${CL}/api/rest/v4/docket-entries/?docket=${id}`;
const DAY = 86_400_000;
const T0 = Date.UTC(2026, 9, 28, 9, 0, 0);

/* the test profile with CourtListener's stated limits (M-R5's published defaults, 5, 50 and 125) */
const withCourtListener = (limits = { per_minute: 5, per_hour: 50, per_day: 125 }) => {
  const base = get("test-port-ellery");
  return { ...base, systems: [...base.systems, { origin: "courtlistener_keyed", name: "the national docket service", hosts: [CL], gated: "none",
    ...(limits ? { rate_limits: { ...limits, basis: "TEST", measured_at: "2026-09-03" } } : {}), basis: "TEST" }] };
};
const credentials = ({ on = true } = {}) => {
  const calls = [];
  return { calls, async keyedServiceFor({ service }) { calls.push(service);
    return on ? { ok: true, service, key: KEY } : { ok: false, reason: "KEYED_SERVICE_OFF", code: "KEYED_SERVICE_OFF", service }; } };
};
/* a world with credentials, a profile view, a clock and the follows the member's acts left (`follows`: a Set of followed case ids) */
function setup({ profile = withCourtListener(), on = true, now = T0 } = {}) {
  const w = world({ env: { BIO_NOW_MS: String(now) } });
  w.store.credentials = credentials({ on });
  const follows = new Set();
  w.store.followStanding = async ({ follow, service }) => service === "courtlistener" && follows.has(follow);
  if (profile) { const real = w.core.getSetting.bind(w.core); w.core.getSetting = (k, ...a) => (k === "jurisdiction_profiles" ? [profile] : real(k, ...a)); }
  return { w, follows };
}
const json = (v, status = 200) => new Response(JSON.stringify(v), { status, headers: { "content-type": "application/json" } });
async function call(w, routes, fn) {
  const net = network(routes);
  try { return { out: await fn(w.store), net }; } finally { net.restore(); }
}
const daily = (follow, extra = {}) => ({ service: "courtlistener", purpose: "docket-entries", viewer: "class:daemon", standing: { follow }, request: { url: DOCKET(follow) }, ...extra });
const count = (w) => Number([...w.rows("SELECT count(*) AS n FROM keyed_calls")][0].n);

test("R36 R130 R134: a daemon fetches only for the daily check of a followed case, once a day, and stops at the last unfollow", async () => {
  const { w, follows } = setup();
  follows.add("dkt-1");
  const first = await call(w, () => json({ results: [] }), (s) => keyedFetch(s, daily("dkt-1")));
  assert.deepEqual([first.out.ok, first.out.service, first.net.seen.length], [true, "courtlistener", 1]);
  assert.equal(first.net.seen[0].url, DOCKET("dkt-1"));
  assert.equal(first.net.seen[0].init.headers.authorization, `Token ${KEY}`);
  assert.equal(first.net.seen[0].init.headers["user-agent"], civicsmithUserAgent("9.9.9", "inst", "docket-entries"), "R9's agent, naming the purpose");
  /* not again that day */
  const again = await call(w, () => json({}), (s) => keyedFetch(s, daily("dkt-1")));
  assert.deepEqual([again.out.ok, again.out.reason, again.net.seen.length], [false, "ALREADY_CHECKED_TODAY", 0]);
  /* the next day's alarm fetches again */
  const next = await call(w, () => json({}), (s) => keyedFetch(s, daily("dkt-1", { at: T0 + DAY })));
  assert.deepEqual([next.out.ok, next.net.seen.length], [true, 1]);
  /* a second followed case has its own check */
  follows.add("dkt-2");
  assert.equal((await call(w, () => json({}), (s) => keyedFetch(s, daily("dkt-2")))).out.ok, true);
  /* after the last unfollow the next alarm fetches nothing */
  follows.delete("dkt-1");
  const gone = await call(w, () => json({}), (s) => keyedFetch(s, daily("dkt-1", { at: T0 + 2 * DAY })));
  assert.deepEqual([gone.out.ok, gone.out.reason, gone.net.seen.length], [false, "NOT_PERMITTED", 0]);
});

test("R36 R130 R134 control: any other daemon call is NOT_PERMITTED, sends nothing and does not read the key", async () => {
  const { w, follows } = setup();
  follows.add("dkt-1");
  const cases = [
    ["no standing", { standing: null }],
    ["a standing of nothing", { standing: { follow: "  " } }],
    ["a case no member follows", { standing: { follow: "dkt-9" } }],
    ["another purpose of the same service", { purpose: "citation-lookup", request: { url: "https://www.courtlistener.com/api/rest/v4/citation-lookup/", method: "POST", form: { text: "x" } } }],
    ["another service", { service: "ca-officers", purpose: "officers-lookup", request: { url: "https://api.company.state.example/officers?company=C1" } }],
    ["the officers lookup", { service: "ca-officers", purpose: "officers-lookup", standing: { follow: "dkt-1" }, request: { url: "https://api.company.state.example/officers?company=C1" } }],
    ["a token, not the daemon", { viewer: "token:monitor", standing: null }],
  ];
  for (const [what, extra] of cases) {
    const x = await call(w, () => json({}), (s) => keyedFetch(s, daily("dkt-1", extra)));
    assert.deepEqual([x.out.ok, x.out.reason, x.net.seen.length], [false, "NOT_PERMITTED", 0], what);
  }
  assert.deepEqual(w.store.credentials.calls, [], "the key is never read for a refused machine call");
  assert.equal(count(w), 0, "nothing sent, nothing counted");
  /* control: a store that cannot say who follows fails closed */
  delete w.store.followStanding;
  const closed = await call(w, () => json({}), (s) => keyedFetch(s, daily("dkt-1")));
  assert.deepEqual([closed.out.reason, closed.net.seen.length], ["NOT_PERMITTED", 0]);
});

test("R130 R134: a member's docket read fetches; with the service off nothing is sent; an unknown purpose is refused; the key is in no answer", async () => {
  const { w } = setup();
  const m = await call(w, () => json({ results: [] }), (s) => keyedFetch(s, daily("dkt-1", { viewer: "member:m1", standing: null })));
  assert.deepEqual([m.out.ok, m.net.seen.length], [true, 1]);
  assert.ok(!JSON.stringify(m.out).includes(KEY));
  const off = setup({ on: false });
  const o = await call(off.w, () => json({}), (s) => keyedFetch(s, daily("dkt-1", { viewer: "member:m1", standing: null })));
  assert.deepEqual([o.out.ok, o.out.reason, o.net.seen.length], [false, "KEYED_SERVICE_OFF", 0]);
  const bad = await call(w, () => json({}), (s) => keyedFetch(s, daily("dkt-1", { viewer: "member:m1", purpose: "mass-download" })));
  assert.deepEqual([bad.out.reason, bad.net.seen.length], ["UNKNOWN_KEYED_PURPOSE", 0]);
  assert.deepEqual(Object.keys(KEYED_PURPOSES).sort(), ["citation-lookup", "docket-entries", "officers-lookup"]);
});

test("R131: a call that would pass a stated limit is RATE_HELD with retry_in_ms and sends nothing; the count is durable and a member's act is counted the same", async () => {
  const { w } = setup();
  const member = (i) => keyedFetch(w.store, daily(`d${i}`, { viewer: "member:m1", standing: null }));
  const net = network(() => json({}));
  try {
    for (let i = 0; i < 5; i++) assert.equal((await member(i)).ok, true, `call ${i + 1}`);
    const sixth = await member(5);
    assert.deepEqual([sixth.ok, sixth.reason, sixth.window], [false, "RATE_HELD", "minute"]);
    assert.ok(sixth.retry_in_ms > 0 && sixth.retry_in_ms <= 60_000);
    assert.equal(net.seen.length, 5, "the sixth sent nothing");
  } finally { net.restore(); }
  assert.equal(count(w), 5, "the ledger is a table, so a restart does not reset it");
  /* a minute later the window has moved */
  const later = await call(w, () => json({}), (s) => keyedFetch(s, daily("d6", { viewer: "member:m1", standing: null, at: T0 + 61_000 })));
  assert.equal(later.out.ok, true);
});

test("R131: the daily checks use at most the poll share of the day's limit, a member's lookup still goes; a service with no stated limit is not polled", async () => {
  const { w, follows } = setup();
  follows.add("dkt-1");
  for (let i = 0; i < Math.floor(125 * POLL_SHARE_DEFAULT); i++)   // 100 daily checks, spread over the last day
    w.acq.keyedNote({ service: "courtlistener", purpose: "docket-entries", actor: "daemon", subject: `old-${i}`, atMs: T0 - 2 * 3_600_000 - i * 60_000 });
  const held = await call(w, () => json({}), (s) => keyedFetch(s, daily("dkt-1")));
  assert.deepEqual([held.out.ok, held.out.reason, held.out.poll, held.net.seen.length], [false, "RATE_HELD", true, 0]);
  const member = await call(w, () => json({}), (s) => keyedFetch(s, daily("dkt-1", { viewer: "member:m1", standing: null })));
  assert.equal(member.out.ok, true, "a member's act is never starved");
  const bare = setup({ profile: withCourtListener(null) });
  bare.follows.add("dkt-1");
  const none = await call(bare.w, () => json({}), (s) => keyedFetch(s, daily("dkt-1")));
  assert.deepEqual([none.out.reason, none.net.seen.length], ["NOT_PERMITTED", 0], "no stated limit, no poll");
  const noProfile = setup({ profile: null });
  noProfile.follows.add("dkt-1");
  assert.equal((await call(noProfile.w, () => json({}), (s) => keyedFetch(s, daily("dkt-1")))).out.reason, "NOT_PERMITTED");
});

test("R131: keyedServiceUsage answers the counts and the limits, and how many dockets a day may be checked, never a key", async () => {
  const { w } = setup();
  await call(w, () => json({}), (s) => keyedFetch(s, daily("d1", { viewer: "member:m1", standing: null })));
  const u = keyedServiceUsage(w.store, { service: "courtlistener" });
  assert.deepEqual([u.ok, u.limits, u.used, u.poll], [true, { per_minute: 5, per_hour: 50, per_day: 125 }, { minute: 1, hour: 1, day: 1 }, { share: POLL_SHARE_DEFAULT, per_day: 100 }]);
  assert.ok(!JSON.stringify(u).includes(KEY));
  assert.equal(keyedServiceUsage(w.store, { service: "nope" }).reason, "UNKNOWN_KEYED_SERVICE");
  const bare = keyedServiceUsage(setup({ profile: null }).w.store, { service: "courtlistener" });
  assert.deepEqual([bare.limits, bare.poll], [null, null]);
});

test("R84 R130 T53-547: the officers lookup's service id is ca-officers; it reaches the host the profile's officers register states, on a member's ask alone, and its stated limit holds", async () => {
  const { w } = setup({ profile: get("test-port-ellery") });
  const HOST = "api.company.state.example";
  const ask = (n, extra = {}) => ({ service: "ca-officers", purpose: "officers-lookup", viewer: "member:m1", request: { url: `https://${HOST}/officers?company=C${n}` }, ...extra });
  const net = network(() => json({ officers: [] }));
  try {
    const one = await keyedFetch(w.store, ask(1));
    assert.deepEqual([one.ok, one.service], [true, "ca-officers"]);
    assert.equal(net.seen[0].init.headers["ocp-apim-subscription-key"], KEY);
    assert.equal(net.seen[0].init.headers.authorization, undefined);
    assert.ok(!JSON.stringify(one).includes(KEY));
    /* only the officers service's host; no other */
    assert.equal((await keyedFetch(w.store, ask(2, { request: { url: `https://${CL}/officers?company=C2` } }))).reason, "BAD_KEYED_REQUEST");
    /* a machine, an alarm and a followed-case standing never reach it */
    assert.equal((await keyedFetch(w.store, ask(3, { viewer: "class:daemon", standing: { follow: "dkt-1" } }))).reason, "NOT_PERMITTED");
    /* the state's stated limit (three a minute in the test profile) */
    for (const n of [4, 5]) assert.equal((await keyedFetch(w.store, ask(n))).ok, true);
    const held = await keyedFetch(w.store, ask(6));
    assert.deepEqual([held.reason, held.window], ["RATE_HELD", "minute"]);
    assert.equal(net.seen.length, 3);
  } finally { net.restore(); }
  /* with no officers register in the profiles, there is no host to reach */
  const bare = setup({ profile: null });
  const none = await call(bare.w, () => json({}), (s) => keyedFetch(s, ask(1)));
  assert.deepEqual([none.out.reason, none.net.seen.length], ["BAD_KEYED_REQUEST", 0]);
  /* credentials' own list names both services */
  assert.equal((await keyedFetch(w.store, { service: "openfec", purpose: "officers-lookup", viewer: "member:m1" })).reason, "UNKNOWN_KEYED_SERVICE");
});
