/* R102 (fix round 7 G83; K4752; runtime-limits R28): every site of this module that obtains the team's room does so through
   the one helper, so the room is created near the team (the hint) and named by its generation. Each entry path is driven
   over an `env.STORE` that records the arguments of every `get()` and every name given to `idFromName()`, with the hint,
   with a generation, with both and with neither (today's calls). `op=selftest` states what is configured, never a secret. */
import test from "node:test";
import assert from "node:assert/strict";
import { boot, stubOver, io, ioLegacy, read } from "./fixture.mjs";
import { publicInstanceGroup, instanceGroupOp, groupIdentityOp, groupLogoAsset, instanceSetupOp, selftest } from "../../../src/setup.mjs";
import { livefire } from "../../../src/livefire.mjs";

/* An `env.STORE` over one stub that records each `idFromName` name and each `get`'s whole argument list. */
function recordingEnv(stub, more = {}) {
  const names = [], gets = [];
  const STORE = {
    idFromName: (n) => { names.push(n); return { room: n }; },
    get: (...a) => { gets.push({ room: a[0] && a[0].room, args: a.length, options: a[1] }); return stub; },
  };
  return { env: { STORE, ...more }, names, gets };
}

const SECRET = "tok-secret-value-0123456789";
const SCENARIOS = [
  ["a hint", { STORE_LOCATION: "wnam" }, { suffix: "", options: { locationHint: "wnam" } }],
  ["a generation", { STORE_GENERATION: "2" }, { suffix: "~g2", options: undefined }],
  ["a hint and a generation", { STORE_LOCATION: "apac-ne", STORE_GENERATION: "3" }, { suffix: "~g3", options: { locationHint: "apac-ne" } }],
  ["neither", {}, { suffix: "", options: undefined }],
  /* not exactly a hint, or not a generation of 2 or more: no hint, the room named as today */
  ["a hint that is not exactly one", { STORE_LOCATION: "WNAM", STORE_GENERATION: "02" }, { suffix: "", options: undefined }],
  ["an empty hint and generation 1", { STORE_LOCATION: "", STORE_GENERATION: "1" }, { suffix: "", options: undefined }],
];

/* Every entry path of this module that obtains the room: [name, the call over (env, room name)]. */
const PATHS = [
  ["publicInstanceGroup", (s, room, h) => publicInstanceGroup(s.env, room, "instancegrouppublic", h.doAnswer)],
  ["instanceGroupOp (credentialed)", (s, room, h) => instanceGroupOp(s.env, room, { viewer: "admin", cls: "member" }, h)],
  ["instanceGroupOp (public)", (s, room, h) => instanceGroupOp(s.env, room, { viewer: "" }, h)],
  ["groupIdentityOp (credentialed)", (s, room, h) => groupIdentityOp(s.env, room, { viewer: "admin", cls: "member" }, h)],
  ["groupIdentityOp (public)", (s, room, h) => groupIdentityOp(s.env, room, {}, h)],
  ["groupLogoAsset", (s, room, h) => groupLogoAsset(s.env, room, h)],
  ["selftest", (s, room, h) => selftest(s.env, room, { cls: "probe", viewer: "" }, h)],
  ["instanceSetupOp selftest", (s, room, h) => instanceSetupOp("selftest", new URL("https://x/?op=selftest"), s.env, room, { cls: "probe", ...h })],
  ["instanceSetupOp runtime", (s, room, h) => instanceSetupOp("runtime", new URL("https://x/?op=runtime"), s.env, room, { cls: "probe", ...h })],
  ["instanceSetupOp cpuprobe", (s, room, h) => instanceSetupOp("cpuprobe", new URL("https://x/?op=cpuprobe&iterations=100000&budget_ms=50"), s.env, room, { cls: "probe", ...h })],
  ["instanceSetupOp livefire", (s, room, h) => instanceSetupOp("livefire", new URL("https://x/?op=livefire"), s.env, room, { cls: "probe", ...h })],
  /* the battery run on its own: it builds its stub before its first request, so the get is recorded whatever the store answers */
  ["livefire", async (s, room) => { try { await livefire(s.env, room); } catch { /* the stub is no real store; the get was made first */ } }],
];

async function drive([name, call], [label, more, want], room) {
  const w = await boot();
  const stub = stubOver(w.m, { stats: () => ({}), capturelimit: () => ({ ceiling: 50 }) });
  const rec = recordingEnv(stub, more);
  const s = { env: rec.env };
  try { await call(s, room, io); } catch { /* an entry path whose stub answer is thin may throw after the get; the get is the subject */ }
  return { ...rec, name, label, want };
}

test("R102 every entry path of this module obtains the room through the helper: each get passes the configured hint and no other option, names the room by its generation on the object's name only, and with neither configured is today's call", async () => {
  for (const scenario of SCENARIOS) for (const path of PATHS) for (const room of ["bio", "scratch"]) {
    const r = await drive(path, scenario, room);
    const at = `${r.name} · ${r.label} · ${room}`;
    assert.ok(r.gets.length >= 1, `${at}: the room was obtained`);
    for (const g of r.gets) {
      assert.equal(g.room, room + r.want.suffix, `${at}: the room's name`);
      assert.deepEqual(g.options, r.want.options, `${at}: the options of get()`);
      assert.equal(g.args, r.want.options ? 2 : 1, `${at}: no second argument unless a hint is configured`);
    }
    assert.deepEqual([...new Set(r.names)], [room + r.want.suffix], `${at}: every name given to idFromName`);
  }
});

test("R102 op=selftest states store_location, the configured hint or null, and store_generation, a whole number, described as configuration, and never a secret", async () => {
  for (const [label, more, want] of SCENARIOS) {
    const w = await boot();
    const stub = stubOver(w.m, { stats: () => ({}) });
    const { env } = recordingEnv(stub, { ADMIN_TOKEN: SECRET, PROBE_TOKEN: SECRET + "-probe", ...more });
    const res = await instanceSetupOp("selftest", new URL("https://x/?op=selftest"), env, "bio", { cls: "probe", ...io });
    const body = await res.json();
    assert.equal(body.store_location, want.options ? want.options.locationHint : null, label);
    assert.equal(body.store_generation, want.suffix ? Number(want.suffix.slice(2)) : 1, label);
    assert.ok(Number.isInteger(body.store_generation) && body.store_generation >= 1, label);
    assert.equal(typeof body.store_place_note, "string", label);
    assert.ok(body.store_place_note.length > 0, label);
    assert.equal(JSON.stringify(body).includes(SECRET), false, `${label}: never a secret`);
  }
});

test("R102 control: a store binding answering its own fetch is read as before, so the helper changes no answer: instanceGroupOp over a real store returns the row under a hint and a generation", async () => {
  const w = await boot();
  const stub = stubOver(w.m);
  const { env } = recordingEnv(stub, { STORE_LOCATION: "wnam", STORE_GENERATION: "2" });
  const r = await read(await instanceGroupOp(env, "bio", { viewer: "admin", cls: "member" }, io));
  assert.deepEqual([r.status, r.body.ok, r.body.store], [200, true, "bio"]);
  const lf = await read(await instanceGroupOp(env, "bio", { viewer: "" }, ioLegacy));
  assert.deepEqual([lf.status, lf.body.ok], [200, true]);
});
