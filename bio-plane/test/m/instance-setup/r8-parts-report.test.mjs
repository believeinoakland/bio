/* Fix round 8 (G118, G114) at the module's interface: R104 the fleet's versions are asked at most once a minute and
   `op=bootstrap` states how long its asks took; R103 `op=bootstrap` carries a signed-in viewer's language and the words
   stamp. Bindings that count their calls stand for the fleet; `deps.translations` stands for `translations` R20's
   `wordsVersion` where that service is not merged. */
import test from "node:test";
import assert from "node:assert/strict";
import { boot, stubOver, io, read } from "./fixture.mjs";
import { memberLanguageRead } from "../translations/fixtures.mjs";
import { bootstrapReport, bootstrapOp, PARTS_KEPT_MS, BOOTSTRAP_FACT_KEYS, BOOTSTRAP_VIEWER_KEYS } from "../../../src/setup.mjs";

/* translations' own answer to a first registration of the language read (its published fixture) */
const { registered } = memberLanguageRead();
const SECOND = 1000;
const storeAnswer = { claimed: false, rearmed: false, consumedAt: null, storeVersion: "s-1" };

/* The fleet as bindings: each counts its calls, and `gate` (when set) holds every answer until it is released. */
function fleet({ gate = null } = {}) {
  const calls = { AGENT_WORKER: 0, FILE_SCANNER: 0 };
  const member = (binding, name, extra = {}) => ({
    async fetch() {
      calls[binding] += 1;
      if (gate) await gate.promise;
      return Response.json({ name, version: "1.0.0", ...extra });
    },
  });
  return { calls, env: (more = {}) => ({ VERSION: "plane-9", AGENT_WORKER: member("AGENT_WORKER", "agent-worker", { runner: true }),
    FILE_SCANNER: member("FILE_SCANNER", "file-scanner"), ...more }) };
}
const deferred = () => { let release; const promise = new Promise((r) => { release = r; }); return { promise, release }; };
const clockAt = (start) => { let t = start; const now = () => t; now.advance = (ms) => { t += ms; }; return now; };

/* A store whose routes are counted by path, answering through this module's own frame. */
async function counted(more = {}, now = null) {
  const w = await boot({ env: { INSTANCE_NAME: "river-town" }, more, ...(now ? { now } : {}) });
  const paths = [];
  const inner = stubOver(w.m, { bootstrap: () => storeAnswer });
  const stub = { fetch: async (input, init) => { const req = input instanceof Request ? input : new Request(input, init);
    paths.push(new URL(req.url).pathname.slice(1) + (req.method === "POST" ? " POST" : "")); return inner.fetch(req, init); } };
  return { w, stub, paths };
}
const ask = async (env, stub, extra = {}) => (await read(await bootstrapReport(env, "fp", { stub, ...io, ...extra }))).body;

test("R104 two bootstrap answers in 10 s ask each fleet binding once; a third a minute on asks again; the kept parts are the same answer", async () => {
  /* the object and the Worker read one clock, as on the platform */
  const now = clockAt(Date.parse("2026-10-23T10:00:00Z"));
  const { stub } = await counted({}, now);
  const f = fleet();
  const env = f.env();
  const first = await ask(env, stub, { now });
  now.advance(10 * SECOND);
  const second = await ask(env, stub, { now });
  assert.deepEqual(f.calls, { AGENT_WORKER: 1, FILE_SCANNER: 1 }, "red before the fix: 2 each");
  for (const k of ["part_signin", "part_scanner", "part_safe_view"]) assert.equal(second[k], first[k], k);
  assert.deepEqual([first.part_signin, first.part_scanner, first.part_safe_view], [true, true, true]);
  now.advance(PARTS_KEPT_MS);
  await ask(env, stub, { now });
  assert.deepEqual(f.calls, { AGENT_WORKER: 2, FILE_SCANNER: 2 }, "after the minute the fleet is asked again");
  assert.equal(PARTS_KEPT_MS, 60_000);
});

test("R104 a bootstrap that finds the ask still running shares it and starts no second; a bootstrap within the minute does not wait for the fleet", async () => {
  const { stub } = await counted();
  const gate = deferred();
  const f = fleet({ gate });
  const env = f.env();
  const a = ask(env, stub);
  const b = ask(env, stub);
  await new Promise((r) => setTimeout(r, 20));
  assert.deepEqual(f.calls, { AGENT_WORKER: 1, FILE_SCANNER: 1 }, "concurrent callers share one ask");
  gate.release();
  const [x, y] = await Promise.all([a, b]);
  assert.equal(x.part_scanner, true);
  assert.deepEqual([y.part_signin, y.part_scanner], [true, true]);
  /* a later one is answered from the kept parts, at once */
  const t0 = Date.now();
  const later = await ask(env, stub);
  assert.ok(Date.now() - t0 < 1000, "kept parts are served at once");
  assert.equal(later.part_scanner, true);
});

test("R104 the parts of a read given its versions (members=1) are the versions it asked, and nothing is kept from them", async () => {
  const { stub } = await counted();
  const f = fleet();
  const env = f.env();
  const withMembers = await ask(env, stub, { members: true });
  assert.equal(withMembers.memberVersions["file-scanner"].state, "SERVING");
  const plain = await ask(env, stub);
  /* members=1 asked the whole fleet itself; the plain read after it asks (once) because that read kept nothing */
  assert.equal(plain.part_scanner, true);
  assert.equal(f.calls.FILE_SCANNER, 2);
});

test("R104 bootstrap states fleet;dur (0 when kept) and facts;dur (the store hops) through the door's stateTiming sink, each a whole number of ms, in every outcome", async () => {
  const { stub } = await counted();
  const f = fleet();
  const env = f.env();
  const entries = [];
  const stateTiming = (name, ms, desc) => entries.push([name, ms, desc]);
  const now = clockAt(Date.parse("2026-10-23T10:00:00Z"));
  await ask(env, stub, { stateTiming, now });
  /* G118b: and the isolate's age, its id as the third argument */
  assert.deepEqual(entries.map(([n]) => n).sort(), ["facts", "fleet", "isolate"]);
  for (const [, ms] of entries) assert.ok(Number.isInteger(ms) && ms >= 0);
  entries.length = 0;
  await ask(env, stub, { stateTiming, now });
  assert.equal(entries.find(([n]) => n === "fleet")[1], 0, "kept: fleet;dur is 0");
  assert.ok(entries.some(([n]) => n === "facts"));
  /* a store that does not answer still states facts; a sink that throws never fails the report */
  entries.length = 0;
  const silent = { fetch: async () => new Response("boom", { status: 500 }) };
  const r = await bootstrapReport(env, "fp", { stub: silent, ...io, stateTiming });
  assert.equal(r.status, 502);
  assert.ok(entries.some(([n]) => n === "facts"));
  const ok = await bootstrapOp(new URL("http://x/?op=bootstrap"), env, "fp", { stub, ...io, stateTiming: () => { throw new Error("sink"); } });
  assert.equal(ok.status, 200);
  /* no sink: nothing to call */
  assert.equal((await ask(env, stub)).ok, true);
});

const WORDS = { stamp: "w-1" };
const translationsStandIn = () => ({ registerMemberLanguageRead: () => registered, wordsVersion: () => WORDS.stamp });

test("R103 a signed-in caller's bootstrap answers the viewer's language and the words stamp in the store's one extra hop; an adoption changes the stamp; a member with none set answers language null", async () => {
  WORDS.stamp = "w-1";
  const { w, stub, paths } = await counted({ translations: translationsStandIn() });
  assert.equal(w.m.memberLanguageSet({ language: "es", by: "ada" }).ok, true);
  const f = fleet();
  const env = f.env();
  const before = await ask(env, stub, { caller: { viewer: "ada" } });
  assert.equal(before.language, "es");
  assert.equal(before.words_version, "w-1");
  assert.deepEqual(paths.filter((p) => p === "bootstrapfacts").length, 1, "one hop for the viewer's keys (the keep's one write is a POST beside it)");
  WORDS.stamp = "w-2";
  assert.equal((await ask(env, stub, { caller: { viewer: "ada" } })).words_version, "w-2", "an adoption changes the stamp");
  const none = await ask(env, stub, { caller: { viewer: "ruth" } });
  assert.equal(none.language, null);
  assert.equal(none.words_version, "w-2");
  /* a member is told none of the seven */
  for (const k of BOOTSTRAP_FACT_KEYS) assert.equal(k in none, false, k);
  for (const k of BOOTSTRAP_VIEWER_KEYS) assert.ok(before[k] === null || typeof before[k] === "string", `${k} is flat`);
});

test("R103 control: without a session neither key is in the answer, whatever the caller else is; an administrator's token without a viewer gets the seven and no language; a stamp that cannot be read is null", async () => {
  WORDS.stamp = "w-1";
  const { w, stub, paths } = await counted({ translations: translationsStandIn() });
  w.m.memberLanguageSet({ language: "es", by: "ada" });
  const env = fleet().env();
  for (const caller of [undefined, null, {}, { cls: "probe" }, { viewer: "" }, { viewer: "  " }, { viewer: "class:admin" }, { viewer: 7 }]) {
    const b = await ask(env, stub, { caller });
    for (const k of BOOTSTRAP_VIEWER_KEYS) assert.equal(k in b, false, `${JSON.stringify(caller)} ${k}`);
  }
  assert.equal(paths.includes("bootstrapfacts"), false, "a stranger costs no second hop");
  const admin = await ask(env, stub, { caller: { cls: "admin" } });
  for (const k of BOOTSTRAP_FACT_KEYS) assert.ok(k in admin, k);
  for (const k of BOOTSTRAP_VIEWER_KEYS) assert.equal(k in admin, false, k);
  /* an administrator's session is both: the seven and the viewer's two, in one hop */
  paths.length = 0;
  const both = await ask(env, stub, { caller: { administrator: true, viewer: "ada" } });
  assert.equal(both.language, "es");
  assert.equal(both.words_version, "w-1");
  for (const k of BOOTSTRAP_FACT_KEYS) assert.ok(k in both, k);
  assert.equal(paths.filter((p) => p === "bootstrapfacts").length, 1);
  /* a stamp that cannot be read, or a store route that does not answer, is null: never omitted, never guessed */
  const broken = await counted({ translations: { registerMemberLanguageRead: () => registered, wordsVersion() { throw new Error("no"); } } });
  broken.w.m.memberLanguageSet({ language: "es", by: "ada" });
  const b = await ask(env, broken.stub, { caller: { viewer: "ada" } });
  assert.deepEqual([b.language, b.words_version], ["es", null]);
  const silentFacts = stubOver(broken.w.m, { bootstrap: () => storeAnswer }, { silent: ["bootstrapfacts"] });
  const c = await ask(env, silentFacts, { caller: { viewer: "ada" } });
  assert.deepEqual([c.language, c.words_version], [null, null]);
  /* the store's own bootstrap answer sets neither key */
  const lying = stubOver(w.m, { bootstrap: () => ({ ...storeAnswer, language: "xx", words_version: "lie" }) });
  const d = await ask(env, lying, { caller: { viewer: "ruth" } });
  assert.deepEqual([d.language, d.words_version], [null, "w-1"]);
  const e = await ask(env, lying, {});
  assert.equal("language" in e, false);
  assert.equal("words_version" in e, false);
});
