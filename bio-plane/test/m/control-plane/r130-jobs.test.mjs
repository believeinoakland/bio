/* control-plane R130 (fix round 9, G126a-c; K4811 (6), K4835 (2); plane R97, R98): THE CHECKED JOB REGISTRATION, `jobs.mjs`' `jobRegistrar`. The door registers a document's `reading`
   row (and an archive's `unpack` row) through the store-internal `pendingadd`, which answers plane's registrar as `{ok: true}` or `{ok: false, reason}`; the answer is READ. A throw, a
   silence or a refusal is tried once more through a FRESH stub (`storeStub(env, name)`: `env.STORE.idFromName` then `get`), and when the row still cannot be written the caller is told
   (`{ok: false, reason}`) and says no `reading_pending`. Each failed try writes `{event: "pendsha_failed", kind, sha, name, message}` BEFORE the retry, and no line holds a secret.
   Driven with fake stubs and a fake `env.STORE`; the whole path with a broken stub is the plane's seam. Counts and fields only. Controls throughout (K874).

   Red against the tree before round 9's change (`pendSha` was a `catch {}` around `pendingadd` that read no answer): the retry cases (a broken first stub was never replaced, so the
   row stayed unwritten and `reading_pending` was still said), the `{ok: false, reason}` cases (the old function answered nothing a caller could read), the `pendsha_failed` line (none was
   written) and the `JOB_SHA_INVALID` case (a bad digest was sent to the store). The control (a first-time success makes no second stub call) is green before and after. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { jobRegistrar } from "../../../src/control-plane/jobs.mjs";

const SHA = "b".repeat(64);
const SECRET = "secret-deploy-token-0123456789abcdef";
const reply = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
/* the store's answers to a `pendingadd`, as the plane gives them */
const KEPT = () => reply({ ok: true, result: { ok: true, existed: false, state: "queued" } });
const NOT_KEPT = () => reply({ ok: true, result: { ok: false, reason: "PENDING_NOT_KEPT", detail: "the row was not kept" } });
// fixtures-generic: UNKNOWN_ROUTE (a refusal of the route, any code: the registrar retries and relays whatever reason the route gave)
const REFUSED = () => reply({ ok: false, reason: "UNKNOWN_ROUTE" }, 404);
const SILENT = () => new Response("an error page", { status: 500 });

/* a fake namespace: every stub it hands out answers from the next script entry of its own, and everything is recorded in `trail` in the order it happened */
function world({ first, later = [KEPT], hint = undefined, generation = undefined } = {}) {
  const trail = [], requests = [], gets = [], ids = [];
  const scripts = [first, ...later.map((l) => [l])];   /* stub 0 is the request's own; each get() after it hands a fresh one */
  let made = 0;
  /* "throw" is a stub whose `fetch` REJECTS (a real stub's fetch is async: a reset's closed stub fails so), "throw-sync" one whose `fetch` throws as it is called */
  const stubFor = (n) => ({
    fetch(input) {
      const req = input instanceof Request ? input : new Request(String(input));
      requests.push({ stub: n, url: new URL(req.url), method: req.method });
      trail.push(`fetch${n}`);
      const answers = scripts[n] ?? [KEPT];
      const next = answers[Math.min(requests.filter((r) => r.stub === n).length - 1, answers.length - 1)];
      if (next === "throw-sync") throw new Error("the stub is broken: a reset closed it");
      if (next === "throw") return Promise.reject(new Error("the stub is broken: a reset closed it"));
      return Promise.resolve(next());
    },
  });
  const env = { ADMIN_TOKEN: SECRET, MEMBER_TOKEN: `${SECRET}-m`, STORE_LOCATION: hint, STORE_GENERATION: generation,
    STORE: { idFromName(name) { ids.push(name); return { name }; }, get(id, opts) { gets.push({ id, opts }); trail.push("get"); made += 1; return stubFor(made); } } };
  const lines = [];
  const log = (line) => { trail.push("log"); lines.push(line); };
  return { env, trail, requests, gets, ids, lines, log, stub0: stubFor(0), made: () => made };
}
const registrarOf = (w, extra = {}) => jobRegistrar({ stub: w.stub0, env: w.env, storeName: "bio", log: w.log, ...extra });

/* ---- control: a registration that succeeds the first time ---- */

test("R130 (control): a registration that succeeds the first time is one POST to `pendingadd` with the kind and the whole digest, makes no second stub call, writes no line and asks the namespace nothing", async () => {
  const w = world({ first: [KEPT] });
  const r = await registrarOf(w)(SHA, "reading", "report.pdf");
  assert.deepEqual(r, { ok: true });
  assert.equal(w.requests.length, 1, "one call to the stub");
  const q = w.requests[0];
  assert.deepEqual([q.method, q.url.pathname, q.url.searchParams.get("kind"), q.url.searchParams.get("sha"), q.url.searchParams.get("store")], ["POST", "/pendingadd", "reading", SHA, "bio"]);
  assert.deepEqual([w.gets.length, w.ids.length, w.lines.length], [0, 0, 0], "no fresh stub, no line");
  for (const kind of ["ocr", "unpack", "keep"]) assert.deepEqual(await registrarOf(world({ first: [KEPT] }))(SHA, kind), { ok: true }, kind);
  assert.equal((await registrarOf(world({ first: [KEPT] }))(SHA)).ok, true, "the kind defaults to `reading`");
});

/* ---- one failure is tried again through a fresh stub ---- */

test("R130 (G126c): a throw, a silence, a refusal of the route and a `{ok: false}` of the registrar are each tried once more through a FRESH stub, and a second answer of `ok` is the registration (`retried: true`)", async () => {
  for (const [what, broken] of [["a rejection", "throw"], ["a throw as the stub is called", "throw-sync"], ["a silence", SILENT], ["a refusal of the route", REFUSED], ["a registrar's PENDING_NOT_KEPT", NOT_KEPT]]) {
    const w = world({ first: [broken], later: [KEPT] });
    const r = await registrarOf(w)(SHA, "reading");
    assert.deepEqual(r, { ok: true, retried: true }, what);
    assert.deepEqual(w.requests.map((x) => x.stub), [0, 1], `${what}: the second call went to another stub than the first`);
    assert.equal(w.gets.length, 1, `${what}: the namespace was asked for a stub once`);
    assert.deepEqual(w.ids, ["bio"], `${what}: for the store's own name`);
    assert.equal(w.requests[1].url.searchParams.get("sha"), SHA, `${what}: the same digest and kind again`);
    assert.equal(w.requests[1].url.searchParams.get("kind"), "reading");
    assert.equal(w.lines.length, 1, `${what}: one failed try, one line`);
  }
});

test("R130 (G126c): the fresh stub is made the way the plane makes the room's stub: the store's name, its location hint where the binding sets one, and its generation's suffix", async () => {
  const hinted = world({ first: ["throw"], later: [KEPT], hint: "wnam" });
  await registrarOf(hinted)(SHA);
  assert.deepEqual(hinted.gets[0].opts, { locationHint: "wnam" });
  const plain = world({ first: ["throw"], later: [KEPT] });
  await registrarOf(plain)(SHA);
  assert.equal(plain.gets[0].opts, undefined, "no hint, none passed");
  const gen = world({ first: ["throw"], later: [KEPT], generation: "2" });
  await registrarOf(gen)(SHA);
  assert.deepEqual(gen.ids, ["bio~g2"], "a development copy's new room");
  const named = world({ first: ["throw"], later: [KEPT] });
  await jobRegistrar({ stub: named.stub0, env: named.env, storeName: "scratch", log: named.log })(SHA);
  assert.deepEqual(named.ids, ["scratch"]);
  assert.equal(named.requests[1].url.searchParams.get("store"), "scratch");
});

/* ---- both failing is a stated failure ---- */

test("R130 (G126c): both tries failing answers `{ok: false, reason}` with the reason of the second failure by name, and the caller says no `reading_pending`", async () => {
  const cases = [["a rejection twice", ["throw"], ["throw"], "STORE_DID_NOT_ANSWER"], ["a throw twice as the stub is called", ["throw-sync"], ["throw-sync"], "REGISTER_THREW"],
                 ["a silence twice", [SILENT], [SILENT], "STORE_DID_NOT_ANSWER"],
                 ["a refusal then a registrar refusal", [REFUSED], [NOT_KEPT], "PENDING_NOT_KEPT"], ["a registrar refusal twice", [NOT_KEPT], [NOT_KEPT], "PENDING_NOT_KEPT"],
                 ["a route refusal twice", [REFUSED], [REFUSED], "UNKNOWN_ROUTE"], ["a throw then a silence", ["throw-sync"], [SILENT], "STORE_DID_NOT_ANSWER"], ["a silence then a throw", [SILENT], ["throw-sync"], "REGISTER_THREW"]];
  for (const [what, a, b, reason] of cases) {
    const w = world({ first: a, later: [b[0]] });
    const r = await registrarOf(w)(SHA, "reading");
    assert.equal(r.ok, false, what);
    assert.equal(r.reason, reason, what);
    assert.equal(r.retried, undefined, what);
    assert.equal(w.requests.length, 2, `${what}: tried once more and no more`);
    assert.equal(w.lines.length, 2, `${what}: a line for each failed try`);
  }
  /* a stub that stays broken is not asked twice: the retry is a fresh stub even when the first fresh one is broken too */
  const broken = world({ first: ["throw-sync"], later: ["throw-sync"] });
  assert.equal((await registrarOf(broken)(SHA)).reason, "REGISTER_THREW");
  assert.equal(broken.gets.length, 1, "one fresh stub, not a loop");
});

test("R130 (G126c): with no `env` there is no fresh stub to try: one call, one line, the first failure's reason", async () => {
  const w = world({ first: [NOT_KEPT] });
  const r = await jobRegistrar({ stub: w.stub0, env: null, log: w.log })(SHA, "reading");
  assert.deepEqual(r, { ok: false, reason: "PENDING_NOT_KEPT" });
  assert.deepEqual([w.requests.length, w.lines.length], [1, 1]);
  const noNamespace = world({ first: ["throw-sync"] });
  assert.equal((await jobRegistrar({ stub: noNamespace.stub0, env: { STORE: {} }, log: noNamespace.log })(SHA)).ok, false, "a namespace that cannot hand a stub is no retry and no throw");
});

/* ---- the line ---- */

test("R130 (G126c; R-LOG): the `pendsha_failed` line is written BEFORE the retry, again after the second failure, and carries {event, kind, sha, name, message} and nothing else", async () => {
  const w = world({ first: ["throw-sync"], later: [NOT_KEPT] });
  await registrarOf(w)(SHA, "unpack", "archive.zip");
  assert.deepEqual(w.trail, ["fetch0", "log", "get", "fetch1", "log"], "the first line is out before the fresh stub is asked, the second after the last failure");
  assert.equal(w.lines.length, 2);
  for (const line of w.lines) {
    assert.deepEqual(Object.keys(line).sort(), ["event", "kind", "message", "name", "sha"]);
    assert.deepEqual([line.event, line.kind, line.sha, line.name], ["pendsha_failed", "unpack", SHA, "archive.zip"]);
    assert.equal(typeof line.message, "string");
  }
  assert.match(w.lines[0].message, /broken/, "the first line names the throw (a stub that throws as it is called)");
  assert.match(w.lines[1].message, /not kept|PENDING_NOT_KEPT/, "the second the registrar's refusal");
  /* the success after a failure writes the one line of the failure only */
  const ok = world({ first: [SILENT], later: [KEPT] });
  await registrarOf(ok)(SHA);
  assert.equal(ok.lines.length, 1);
  /* a name is shortened, and a name that is no string is null */
  const long = world({ first: [SILENT], later: [KEPT] });
  await registrarOf(long)(SHA, "reading", "n".repeat(500));
  assert.equal(long.lines[0].name.length, 120);
  const none = world({ first: [SILENT], later: [KEPT] });
  await registrarOf(none)(SHA, "reading", 7);
  assert.equal(none.lines[0].name, null);
  /* the default log is one JSON line to the console, and a log that throws changes nothing */
  const thrower = world({ first: [SILENT], later: [KEPT] });
  assert.deepEqual(await jobRegistrar({ stub: thrower.stub0, env: thrower.env, log: () => { throw new Error("logs are down"); } })(SHA), { ok: true, retried: true });
  const real = console.log, seen = [];
  console.log = (s) => seen.push(s);
  try { const d = world({ first: [SILENT], later: [KEPT] }); await jobRegistrar({ stub: d.stub0, env: d.env })(SHA); } finally { console.log = real; }
  assert.equal(seen.length, 1);
  assert.equal(JSON.parse(seen[0]).event, "pendsha_failed");
});

test("R130 (G126c; R-LOG): no line holds a secret: the digest and the kind are in it, the environment's tokens and the request's address are not", async () => {
  const w = world({ first: ["throw-sync"], later: [NOT_KEPT] });
  await registrarOf(w)(SHA, "reading", "report.pdf");
  const text = JSON.stringify(w.lines);
  assert.ok(!text.includes(SECRET), "no token of the environment");
  assert.ok(!text.includes("http://do"), "no address");
  assert.ok(!/authorization|bearer|cookie/i.test(text));
  /* a long message of an error is cut */
  const loud = world({ first: [KEPT], later: [KEPT] });
  await jobRegistrar({ stub: { fetch: () => { throw new Error("y".repeat(1000)); } }, env: loud.env, log: loud.log })(SHA);
  assert.ok(loud.lines[0].message.length <= 160, `the message is short (${loud.lines[0].message.length})`);
});

/* ---- a bad digest or kind ---- */

test("R130 (G126c): a digest that is not 64 lowercase hex, or a kind the job table's door does not register, is `JOB_SHA_INVALID` with no call to the store and no line", async () => {
  for (const [sha, kind] of [["short", "reading"], ["B".repeat(64), "reading"], ["b".repeat(63), "reading"], ["b".repeat(65), "reading"], [null, "reading"], [undefined, "reading"], [123, "reading"],
                             [`${"b".repeat(63)}g`, "reading"], [SHA, "fetch"], [SHA, "scan"], [SHA, ""], [SHA, "READING"], [SHA, null]]) {
    const w = world({ first: [KEPT] });
    const r = await registrarOf(w)(sha, kind);
    assert.deepEqual(r, { ok: false, reason: "JOB_SHA_INVALID" }, `${String(sha).slice(0, 12)} / ${String(kind)}`);
    assert.deepEqual([w.requests.length, w.gets.length, w.lines.length], [0, 0, 0], "nothing was sent or written");
  }
});
