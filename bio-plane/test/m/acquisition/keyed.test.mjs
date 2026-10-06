/* acquisition R36, R37 (T33-21; K1449; A COURTS 3): the keyed-service fetch path and CourtListener's Citation Lookup, its
   first client, at the module's interface (`keyedFetch(store, …)`, `citationLookup(store, …)`), over a scripted network
   and the store handed in (fixture.mjs) carrying a credentials stand-in that answers `keyedServiceFor` as credentials
   R29 states it: the key while the service is on, else its `KEYED_SERVICE_OFF` refusal. The service's answers are
   shaped as its own documentation shows them (CourtListener v4, "Citation Lookup and Verification API"). A sentinel key
   is checked absent from every answer, receipt, document, error and log. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, network, text } from "./fixture.mjs";
import { keyedFetch, citationLookup, KEYED_SERVICE_HOSTS, CITATION_LOOKUP_URL, CITATION_TEXT_MAX, CITATION_LOOKUP_LABEL,
         civicsmithUserAgent } from "../../../src/acquisition/index.mjs";

const KEY = "SENTINEL-KEY-9f3a7c1e5b";
const HOST = "www.courtlistener.com";
const OFF = { ok: false, reason: "KEYED_SERVICE_OFF", code: "KEYED_SERVICE_OFF", check: "C-96.21",
              translation: "The group's key for this service is off.", service: "courtlistener" };

/* credentials R29's `keyedServiceFor`, as the store hands it in: each call recorded. */
const credentials = ({ on = true, key = KEY, answer = null } = {}) => {
  const calls = [];
  return { calls, async keyedServiceFor({ service }) { calls.push(service);
    if (answer) return answer;
    return on ? { ok: true, service, key } : { ...OFF, detail: "the group's key for this service is off or not held; the caller goes on without it." }; } };
};
const withCreds = (w, c) => { w.store.credentials = c; return w; };

/* Every log line written while `fn` runs, and its result. */
async function logged(fn) {
  const lines = [], saved = {};
  for (const k of ["log", "info", "warn", "error", "debug"]) { saved[k] = console[k]; console[k] = (...a) => lines.push(a.map(String).join(" ")); }
  try { return { out: await fn(), lines }; } finally { Object.assign(console, saved); }
}
async function call(w, routes, fn) {
  const net = network(routes);
  try { const { out, lines } = await logged(() => fn(w.store)); return { out, net, lines }; } finally { net.restore(); }
}
/* The key is nowhere: the answer, the store's receipts and documents, the governor's calls, the evidence store, the logs. */
const keyNowhere = (w, x, what) => {
  const all = JSON.stringify([x.out, x.lines, w.prov.receipts, w.store.state, w.gov.calls, [...w.b.held.keys()]]);
  assert.ok(!all.includes(KEY), `${what}: the key is nowhere`);
  assert.deepEqual([w.prov.receipts.length, w.b.calls.filter((c) => c[0] === "put").length], [0, 0], `${what}: nothing filed or stored`);
};

const LOOKUP = CITATION_LOOKUP_URL;
const json = (v, status = 200, headers = {}) => new Response(JSON.stringify(v), { status, headers: { "content-type": "application/json", ...headers } });
const req = (extra = {}) => ({ service: "courtlistener", purpose: "citation-lookup", request: { url: LOOKUP, method: "POST", form: { text: "x" } }, ...extra });

test("R36: with the service on, the request goes to the service's own host under the group's key, read at the call, through the governor under R9's agent; the key is in no answer, receipt, document, error or log", async () => {
  const w = withCreds(world(), credentials());
  const x = await call(w, { [LOOKUP]: json([]) }, (s) => keyedFetch(s, req()));
  assert.deepEqual([x.out.ok, x.out.service, x.out.status, x.out.text, x.out.content_type], [true, "courtlistener", 200, "[]", "application/json"]);
  assert.equal(x.net.seen.length, 1);
  const sent = x.net.seen[0];
  assert.equal(sent.url, LOOKUP);
  assert.deepEqual([sent.init.method, sent.init.redirect, sent.init.headers.authorization, sent.init.headers["content-type"], sent.init.body],
                   ["POST", "manual", `Token ${KEY}`, "application/x-www-form-urlencoded", "text=x"]);
  assert.equal(sent.init.headers["user-agent"], civicsmithUserAgent("9.9.9", "inst", "citation-lookup"), "R9's agent, naming the purpose");
  assert.deepEqual(w.gov.calls.filter((c) => c[1] === HOST).map((c) => c.slice(0, 3)), [["admit", HOST], ["report", HOST, 200]], "admitted and reported");
  assert.deepEqual(w.store.credentials.calls, ["courtlistener"], "the key read once, at the call");
  assert.equal(KEYED_SERVICE_HOSTS.courtlistener, HOST);
  keyNowhere(w, x, "on");
  /* the key is read at each call: switched off between two calls, the second is refused */
  w.store.credentials = credentials({ on: false });
  const y = await call(w, { [LOOKUP]: json([]) }, (s) => keyedFetch(s, req()));
  assert.deepEqual([y.out.ok, y.out.reason, y.net.seen.length], [false, "KEYED_SERVICE_OFF", 0]);
});

test("R36: while the service is off, holds no key, or no credentials are handed in, it answers KEYED_SERVICE_OFF and fetches nothing; nothing in the copy needs it on", async () => {
  for (const [what, creds] of [["off", credentials({ on: false })], ["no key", credentials({ answer: { ...OFF } })], ["none handed in", null],
                               ["an empty key", credentials({ key: "" })], ["credentials throwing", { keyedServiceFor() { throw new Error(`boom ${KEY}`); } }]]) {
    const w = world();
    if (creds) w.store.credentials = creds;
    const x = await call(w, { [LOOKUP]: json([]) }, (s) => keyedFetch(s, req()));
    assert.deepEqual([x.out.ok, x.out.reason, x.out.service, x.net.seen.length], [false, "KEYED_SERVICE_OFF", "courtlistener", 0], what);
    assert.equal(w.gov.calls.length, 0, `${what}: not even the governor is asked`);
    keyNowhere(w, x, what);
  }
  /* credentials' own refusal is passed on whole, its row with it */
  const w = withCreds(world(), credentials({ on: false }));
  const x = await call(w, {}, (s) => keyedFetch(s, req()));
  assert.deepEqual([x.out.check, x.out.translation], [OFF.check, OFF.translation]);
});

test("R36 R28: only a public https address on the service's own host is fetched, by GET or POST with a flat form; an unknown service or a machine's act is refused; none reads the key or fetches", async () => {
  const bad = [
    ["another host", { request: { url: "https://evil.example/api/rest/v4/citation-lookup/", method: "POST" } }, "BAD_KEYED_REQUEST"],
    ["a look-alike host", { request: { url: "https://www.courtlistener.com.evil.example/x", method: "GET" } }, "BAD_KEYED_REQUEST"],
    ["plain http", { request: { url: "http://www.courtlistener.com/api/", method: "GET" } }, "BAD_KEYED_REQUEST"],
    ["credentials in the address", { request: { url: "https://u:p@www.courtlistener.com/api/", method: "GET" } }, "BAD_KEYED_REQUEST"],
    ["a DELETE", { request: { url: LOOKUP, method: "DELETE" } }, "BAD_KEYED_REQUEST"],
    ["a form of non-strings", { request: { url: LOOKUP, method: "POST", form: { text: 7 } } }, "BAD_KEYED_REQUEST"],
    ["no request", { request: null }, "BAD_KEYED_REQUEST"],
    ["an unknown service", { service: "regulations.gov" }, "UNKNOWN_KEYED_SERVICE"],
    ["no service", { service: undefined }, "UNKNOWN_KEYED_SERVICE"],
    ["the daemon", { viewer: "class:daemon" }, "NOT_PERMITTED"],
    ["a machine token", { viewer: "token:monitor" }, "NOT_PERMITTED"],
  ];
  for (const [what, extra, reason] of bad) {
    const w = withCreds(world(), credentials());
    const x = await call(w, () => json([]), (s) => keyedFetch(s, req(extra)));
    assert.deepEqual([x.out.ok, x.out.reason, x.net.seen.length], [false, reason, 0], what);
    assert.deepEqual(w.store.credentials.calls, [], `${what}: the key is not read`);
    keyNowhere(w, x, what);
  }
  /* negative controls: a member's act, a GET with no form, and the in-plane caller's own act with no viewer named */
  for (const extra of [{ viewer: "member:m1" }, { request: { url: `https://${HOST}/api/rest/v4/search/?q=x` } }, {}]) {
    const w = withCreds(world(), credentials());
    const x = await call(w, () => json([]), (s) => keyedFetch(s, req(extra)));
    assert.equal(x.out.ok, true, JSON.stringify(extra));
  }
});

test("R36 R9 R23: a governed refusal, a thrown fetch, a redirect and a refusal are each answered by name with the key carried in none; a redirect is never followed", async () => {
  const cool = withCreds(world({ gov: { refuse: [HOST] } }), credentials());
  const c = await call(cool, { [LOOKUP]: json([]) }, (s) => keyedFetch(s, req()));
  assert.deepEqual([c.out.ok, c.out.reason, c.out.retry_in_ms, c.net.seen.length], [false, "HOST_COOLING_OFF", 5000, 0]);
  keyNowhere(cool, c, "cooling");
  const thrown = withCreds(world(), credentials());
  const t = await call(thrown, () => new Error(`connection reset carrying Token ${KEY}`), (s) => keyedFetch(s, req()));
  assert.deepEqual([t.out.ok, t.out.reason], [false, "FETCH_FAILED"]);
  assert.match(t.out.detail, /not carried because the group's key rode it/);
  keyNowhere(thrown, t, "thrown");
  const moved = withCreds(world(), credentials());
  const m = await call(moved, { [LOOKUP]: new Response("", { status: 302, headers: { location: "https://elsewhere.example/" } }) }, (s) => keyedFetch(s, req()));
  assert.deepEqual([m.out.ok, m.out.reason, m.out.status], [false, "SOURCE_REFUSED", 302]);
  assert.deepEqual(m.net.seen.map((x) => x.url), [LOOKUP], "the redirect is the answer; nothing at its target is fetched");
  keyNowhere(moved, m, "redirect");
  const refused = withCreds(world(), credentials());
  const r = await call(refused, { [LOOKUP]: json({ detail: "Invalid token." }, 401) }, (s) => keyedFetch(s, req()));
  assert.deepEqual([r.out.ok, r.out.reason, r.out.status], [false, "SOURCE_REFUSED", 401]);
  keyNowhere(refused, r, "401");
  assert.ok(refused.gov.calls.some((x) => x[0] === "report" && x[2] === 401), "reported to the governor");
});

/* The service's answer to the documentation's examples. */
const OBERGEFELL = { citation: "576 U.S. 644", normalized_citations: ["576 U.S. 644"], start_index: 22, end_index: 34, status: 200, error_message: "",
  clusters: [{ case_name: "Obergefell v. Hodges", date_filed: "2015-06-26", absolute_url: "/opinion/2812209/obergefell-v-hodges/", court_id: "scotus" }] };
const AMBIGUOUS = { citation: "1 H. 150", normalized_citations: ["1 Handy 150", "1 Haw. 150", "1 Hill 150"], start_index: 40, end_index: 48, status: 300,
  clusters: [{ case_name: "Louis v. Steamboat Buckeye", date_filed: "1854-01-01", absolute_url: "/opinion/1/louis/" },
             { case_name_full: "Fell v. Parke", date_filed: "1855-01-01", absolute_url: "https://evil.example/opinion/2/" }] };
const NOT_FOUND = { citation: "1 U.S. 200", normalized_citations: ["1 U.S. 200"], start_index: 60, end_index: 70, status: 404, error_message: "Citation not found: '1 U.S. 200'", clusters: [] };
const BAD_REPORTER = { citation: "33 Umbrella 422", normalized_citations: [], start_index: 80, end_index: 95, status: 400, error_message: "", clusters: [] };
const TOO_MANY = { citation: "576 U.S. 644", normalized_citations: ["576 U.S. 644"], start_index: 10002, end_index: 10013, status: 429, error_message: "Too many citations requested.", clusters: [] };
const TEXT = "Obergefell v. Hodges (576 U.S. 644) and 1 H. 150 and 1 U.S. 200 and 33 Umbrella 422.";

test("R37 R36: citationLookup sends the text through the keyed path and answers each citation's offsets and the service's matches, every one labelled the service's answer and never verified", async () => {
  const w = withCreds(world(), credentials());
  const x = await call(w, { [LOOKUP]: json([OBERGEFELL, AMBIGUOUS, NOT_FOUND, BAD_REPORTER, TOO_MANY]) }, (s) => citationLookup(s, { text: TEXT, viewer: "member:m1" }));
  assert.equal(x.out.ok, true, JSON.stringify(x.out));
  assert.deepEqual([x.out.service, x.out.verified, x.out.label], ["courtlistener", false, CITATION_LOOKUP_LABEL]);
  assert.match(CITATION_LOOKUP_LABEL, /not verified: a citation is verified only by a held capture stating it/);
  const sent = x.net.seen[0];
  assert.deepEqual([sent.url, sent.init.method, new URLSearchParams(sent.init.body).get("text")], [LOOKUP, "POST", TEXT], "the text, as the service's documentation sends it");
  const [ob, amb, nf, br, tm] = x.out.citations;
  assert.deepEqual(ob, { citation: "576 U.S. 644", normalized: ["576 U.S. 644"], start: 22, end: 34, lookup: "found", service_status: 200, service_message: null,
    matches: [{ case_name: "Obergefell v. Hodges", court: "scotus", date: "2015-06-26", address: "https://www.courtlistener.com/opinion/2812209/obergefell-v-hodges/", basis: "service_answer" }],
    basis: "service_answer", verified: false });
  assert.deepEqual([amb.lookup, amb.normalized.length, amb.matches.map((m) => m.case_name), amb.matches.map((m) => m.court)],
                   ["several_matches", 3, ["Louis v. Steamboat Buckeye", "Fell v. Parke"], [null, null]], "a court the answer does not name is null");
  assert.deepEqual(amb.matches.map((m) => m.address), ["https://www.courtlistener.com/opinion/1/louis/", null], "an address off the service's own site is not kept");
  assert.deepEqual([nf.lookup, nf.service_status, nf.service_message, nf.matches], ["not_found", 404, "Citation not found: '1 U.S. 200'", []]);
  assert.deepEqual([br.lookup, tm.lookup, tm.start], ["unknown_reporter", "not_looked_up", 10002]);
  assert.ok(x.out.citations.every((c) => c.verified === false && c.basis === "service_answer" && c.matches.every((m) => m.basis === "service_answer")));
  assert.ok(!/"verified":true/.test(JSON.stringify(x.out)), "nothing is called verified");
  /* it writes nothing: no receipt, no object, no store bookkeeping */
  assert.deepEqual([w.store.state.outcomes, w.store.state.events, w.store.state.links], [[], [], []]);
  keyNowhere(w, x, "lookup");
  /* no citations is an empty list, not a refusal */
  const none = await call(withCreds(world(), credentials()), { [LOOKUP]: json([]) }, (s) => citationLookup(s, { text: "Put some text here", viewer: "member:m1" }));
  assert.deepEqual([none.out.ok, none.out.citations], [true, []]);
});

test("R37: with the service off it answers R36's refusal and sends nothing, the recogniser's reading standing alone; the service's throttle is answered with its wait_until", async () => {
  for (const creds of [credentials({ on: false }), null]) {
    const w = world();
    if (creds) w.store.credentials = creds;
    const x = await call(w, { [LOOKUP]: json([OBERGEFELL]) }, (s) => citationLookup(s, { text: TEXT, viewer: "member:m1" }));
    assert.deepEqual([x.out.ok, x.out.reason, x.net.seen.length], [false, "KEYED_SERVICE_OFF", 0]);
    assert.match(x.out.note, /recogniser's own reading stands alone/);
    keyNowhere(w, x, "off");
  }
  const w = withCreds(world(), credentials());
  const t = await call(w, { [LOOKUP]: json({ wait_until: "2026-10-06T00:10:00Z" }, 429, { "retry-after": "60" }) }, (s) => citationLookup(s, { text: TEXT, viewer: "member:m1" }));
  assert.deepEqual([t.out.ok, t.out.reason, t.out.status, t.out.wait_until, t.out.retry_after], [false, "SERVICE_THROTTLED", 429, "2026-10-06T00:10:00Z", "60"]);
  assert.ok(w.gov.calls.some((c) => c[0] === "report" && c[1] === HOST && c[2] === 429 && c[3] === 60000), "the governor holds the host");
  keyNowhere(w, t, "throttled");
  /* a 200 that is not the documented list is unreadable, and its body is not carried */
  const u = withCreds(world(), credentials());
  const r = await call(u, { [LOOKUP]: text(`not a list ${KEY}`) }, (s) => citationLookup(s, { text: TEXT, viewer: "member:m1" }));
  assert.deepEqual([r.out.ok, r.out.reason], [false, "SERVICE_ANSWER_UNREADABLE"]);
  keyNowhere(u, r, "unreadable");
  /* another refusal of the service carries its status, not its body */
  const e = withCreds(world(), credentials());
  const er = await call(e, { [LOOKUP]: new Response(`oops ${KEY}`, { status: 500 }) }, (s) => citationLookup(s, { text: TEXT, viewer: "member:m1" }));
  assert.deepEqual([er.out.ok, er.out.reason, er.out.status, "text" in er.out], [false, "SOURCE_REFUSED", 500, false]);
  keyNowhere(e, er, "500");
});

test("R37 R36: the text is bounded as the service bounds it, the act is a member's or an operator's, never a machine's; each refusal sends nothing", async () => {
  const cases = [
    ["no text", { text: "", viewer: "member:m1" }, "BAD_TEXT"],
    ["blank text", { text: "   ", viewer: "member:m1" }, "BAD_TEXT"],
    ["not text", { text: 42, viewer: "member:m1" }, "BAD_TEXT"],
    ["over the service's bound", { text: "x".repeat(CITATION_TEXT_MAX + 1), viewer: "member:m1" }, "TEXT_TOO_LONG"],
    ["no viewer", { text: TEXT }, "NOT_PERMITTED"],
    ["the daemon", { text: TEXT, viewer: "class:daemon" }, "NOT_PERMITTED"],
  ];
  for (const [what, args, reason] of cases) {
    const w = withCreds(world(), credentials());
    const x = await call(w, { [LOOKUP]: json([]) }, (s) => citationLookup(s, args));
    assert.deepEqual([x.out.ok, x.out.reason, x.net.seen.length], [false, reason, 0], what);
    assert.deepEqual(w.store.credentials.calls, [], `${what}: the key is not read`);
  }
  assert.equal(CITATION_TEXT_MAX, 64000, "the service's own documented bound");
  /* negative control: exactly at the bound the text is sent */
  const w = withCreds(world(), credentials());
  const ok = await call(w, { [LOOKUP]: json([]) }, (s) => citationLookup(s, { text: "x".repeat(CITATION_TEXT_MAX), viewer: "member:m1" }));
  assert.deepEqual([ok.out.ok, ok.net.seen.length], [true, 1]);
});
