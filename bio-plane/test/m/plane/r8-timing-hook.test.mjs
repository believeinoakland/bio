/* plane R96 (fix round 8, G106, G120; K4822; control-plane R128, R129): THE DOOR HANDS MODULES THE TIMING HOOK, AND THE OBJECT STATES ITS AGE.
   (1) `gatedOp`, which the control-plane door calls with the context it gives the plane, passes the `stateTiming(name, ms)` it was handed into
   the context of every module handler it reaches, and an entry a handler states reaches the door's list; absent when the door gave none.
   The handlers are replaced by recording stand-ins in a child process (node's module mocks), which state one entry each through the
   context they receive and nothing else; the door itself is real. (2) The real object's answers carry `object-age;dur=<ms>` beside R78's
   `object;dur`, the age growing between two answers of one instance (a real wait between them). */
import "../../../src/store-assembly/register.mjs";   /* R68: the start's registration before any op table is read */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { store } from "./fixture.mjs";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "../../../src");
const FIXTURE = join(dirname(fileURLToPath(import.meta.url)), "fixture.mjs");
const file = (p) => "file://" + join(SRC, p);

/* The child: each handler a door reaches is a stand-in that records the type of `stateTiming` in its context and, when it is a function, states
   one entry through it; the door hands `stateTiming` (or none) to `gatedOp`, and the entries it received are printed. */
function viaDoor(hand) {
  const handlers = [["ratification/ops.mjs", "ratificationOp"], ["extraction/ops.mjs", "extractionOp"], ["extraction/ops.mjs", "pageTranscribeOp"],
    ["attestation/index.mjs", "attestOp"], ["monitoring/index.mjs", "monitorOp"], ["capture/ops.mjs", "captureOp"]];
  const mocks = [...new Set(handlers.map(([f]) => f))].map((f) => `
    { const real = { ...(await import(${JSON.stringify(file(f) + "?real")})) };
      const over = {};
      for (const name of ${JSON.stringify(handlers.filter(([g]) => g === f).map(([, n]) => n))}) over[name] = (...a) => {
        const c = a[a.length - 1];
        if (name === "captureOp" && a[0] !== "acquire") return null;
        seen.push([name, typeof (c && c.stateTiming)]);
        if (c && typeof c.stateTiming === "function") c.stateTiming("probe-" + name, 7);
        return new Response("{}");
      };
      mock.module(${JSON.stringify(file(f))}, { namedExports: { ...real, ...over } }); }`).join("\n");
  const script = `
    import { mock } from "node:test";
    await import(${JSON.stringify("file://" + FIXTURE)});
    const seen = [];
    ${mocks}
    const { gatedOp } = await import(${JSON.stringify(file("plane/door.mjs"))});
    const { EXTRACTION_OPS } = await import(${JSON.stringify(file("extraction/ops.mjs") + "?real")});
    const entries = [];
    const stateTiming = ${hand ? "(name, ms) => { entries.push([name, ms]); }" : "undefined"};
    const stamps = { cls: "admin", viaSession: false, storeName: "bio", stub: { fetch: async () => new Response("{}") }, env: { STORE: { idFromName: (n) => n, get: () => ({ fetch: async () => new Response("{}") }) } } };
    for (const op of ["acquire", EXTRACTION_OPS[0], "pagetranscribe", "attest", "monitor", "ratifyprobe"]) {
      const u = new URL("http://w/" + op);
      await gatedOp({ ...stamps, req: new Request(u, { method: "POST", body: "{}" }), url: u, op, ...(stateTiming ? { stateTiming } : {}) });
    }
    console.log("RESULT " + JSON.stringify({ seen, entries }));`;
  const out = execFileSync(process.execPath, ["--experimental-test-module-mocks", "--no-warnings", "--input-type=module", "-e", script],
    { encoding: "utf8", cwd: join(SRC, "..") });
  return JSON.parse(/^RESULT (.*)$/m.exec(out)[1]);
}

test("R96 (G106, G120): a handler reached through the door receives the `stateTiming` the door was handed, and an entry it states reaches the door's list; control: none handed, every handler runs as before and receives none", () => {
  const names = ["captureOp", "extractionOp", "pageTranscribeOp", "attestOp", "monitorOp", "ratificationOp"];
  const handed = viaDoor(true);
  assert.deepEqual(handed.seen.map(([n]) => n).sort(), [...names].sort(), "each handler was reached once");
  for (const [n, t] of handed.seen) assert.equal(t, "function", `${n} receives stateTiming`);
  assert.deepEqual(handed.entries.map(([n]) => n).sort(), names.map((n) => `probe-${n}`).sort(), "every entry a handler states reaches the door's list");
  assert.ok(handed.entries.every(([, ms]) => ms === 7));
  const none = viaDoor(false);
  assert.deepEqual(none.seen.map(([n]) => n).sort(), [...names].sort(), "the same handlers are reached with no hook");
  for (const [n, t] of none.seen) assert.equal(t, "undefined", `${n} receives none when the door gives none`);
  assert.deepEqual(none.entries, []);
});

test("R96 (G106, G120): every route answer of the object states `object-age;dur=<ms>` beside `object;dur`, the milliseconds since the instance started; it grows between two answers of one instance; a younger instance states less", async () => {
  const age = async (x, path = "/ailimits?cls=member&viewer=member:ann") => {
    const res = await x.fetch(path);
    const h = res.headers.get("server-timing");
    const m = /(?:^|,)\s*object-age;dur=(\d+)/.exec(h);
    assert.ok(m, `object-age;dur in ${h}`);
    assert.match(h, /(?:^|,)\s*object;dur=\d+/, "R78's entry is still there");
    return Number(m[1]);
  };
  const x = await store();
  const first = await age(x);
  await new Promise((r) => setTimeout(r, 60));
  const second = await age(x);
  assert.ok(second >= first + 50, `the age grew by the wait: ${first} then ${second}`);
  assert.ok(await age(x, "/owedwork?cls=member&viewer=member:ann") >= second, "a second kind of route states it too");
  const young = await store();
  assert.ok(await age(young) < second, "an instance started later is younger");
});

/* instance-setup R103 (K4825): `op=bootstrap` through the real door and the real object, the session read (`caseReader`, admission's) the only stand-in,
   in a child (node's module mocks). A signed-in member's report carries her `language` and `words_version`; without a session, or with a machine identity,
   neither; the door's `stateTiming` reaches the report, which states entries through it. */
function bootstrapViaDoor(readers) {
  const script = `
    import "${file("store-assembly/register.mjs")}";
    import { mock } from "node:test";
    const real = { ...(await import(${JSON.stringify(file("control-plane/index.mjs") + "?real")})) };
    let reader = { viewer: "" };
    mock.module(${JSON.stringify(file("control-plane/index.mjs"))}, { namedExports: { ...real, caseReader: async () => reader } });
    const { store } = await import(${JSON.stringify("file://" + FIXTURE)});
    const { publicOp } = await import(${JSON.stringify(file("plane/door.mjs"))});
    const { instanceSetupOf } = await import(${JSON.stringify(file("setup.mjs"))});
    const x = await store();
    instanceSetupOf(x.ctx).memberLanguageSet({ language: "es", by: "member:ada" });
    const stub = { fetch: (r, i) => x.s.fetch(r instanceof Request ? r : new Request(r, i)) };
    const env = { ...x.env, VERSION: "1", STORE: { idFromName: (n) => n, get: () => stub } };
    const out = [];
    for (const r of ${JSON.stringify(readers)}) {
      reader = r;
      const u = new URL("http://w/api/?op=bootstrap");
      const entries = [];
      const res = await publicOp({ req: new Request(u), url: u, env, op: "bootstrap", stub, fp: "fp", presentedAi: { cred: null }, stateTiming: (n) => entries.push(n) });
      out.push({ body: await res.json(), entries });
    }
    console.log("RESULT " + JSON.stringify(out));`;
  const out = execFileSync(process.execPath, ["--experimental-test-module-mocks", "--no-warnings", "--import", join(SRC, "../test/platform-sqlite.mjs"),
    "--input-type=module", "-e", script], { encoding: "utf8", cwd: join(SRC, "..") });
  return JSON.parse(/^RESULT (.*)$/m.exec(out)[1]);
}

test("R96 (K4825; instance-setup R103): a member's bootstrap through the door carries language and words_version; without a session, or for a machine identity, neither; the door's stateTiming reaches the report", () => {
  const [member, none, machine, admin] = bootstrapViaDoor([{ viewer: "member:ada", cls: "member" }, { viewer: "" }, { viewer: "class:member", cls: "member" },
    { viewer: "member:ada", cls: "admin" }]);
  assert.equal(member.body.language, "es");
  assert.equal(typeof member.body.words_version, "string");
  for (const r of [none, machine]) { assert.equal("language" in r.body, false); assert.equal("words_version" in r.body, false); }
  assert.equal(admin.body.language, "es", "an administrator's session is a member too");
  assert.ok(member.entries.length > 0 && none.entries.length > 0, "the report states its entries through the door's hook");
});
