/* control-plane R41 (K585 (1), K674 (1); agent-worker R48, N157; T36: N695, K2135): `op=agentpack` alone serves the
   published fences and the rendered pack; the untargeted `op=affordances` answer is affordances' own, with neither key.
   Driven through `makeFetch(hooks)`, the handler answering affordances R17's untargeted shape from affordances' own
   tables, as plane's door arm (`affordancesOp`) does. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { M, O, world, call } from "./harness.mjs";
import { ACTS, CAPTURE_ACTS, vocabulariesFor } from "../../../src/affordances.mjs";
import { machineFences, renderPack } from "../../../src/skillpack.mjs";

const untargeted = () => ({ target: null, catalog: ACTS.map((a) => ({ ...O.decorateAct(a), appliesTo: a.types })),
                            vocabularies: vocabulariesFor(undefined), capture_acts: CAPTURE_ACTS.map(O.decorateAct), detail: "d" });
const hooksAnswering = (answer, seen = []) => ({
  publicOp: async () => M.json({ ok: true }),
  gatedOp: async (ctx) => { seen.push(ctx.op); return answer(ctx); },
  publicInstanceGroup: async () => ({ answered: true, result: {} }),
});

test("R41 (T36): `op=agentpack` answers `fences` (machineFences over CHECK_FAMILIES) and `pack` (renderPack over the untargeted affordances answer with those fences, whole with its version), only those two keys, for a session, an agent credential, a binding and a probe; the moved fences are published", async () => {
  const w = world();
  const base = untargeted();
  const seen = [];
  const hooks = hooksAnswering((ctx) => (ctx.op === "affordances" ? M.json({ ok: true, result: base }, 200) : undefined), seen);
  for (const token of [w.env.ADMIN_TOKEN, w.S.ann, w.A.ann, w.env.PROBE_TOKEN]) {
    seen.length = 0;
    const r = await call(w.env, { op: "agentpack", token, params: token === w.env.PROBE_TOKEN ? { store: "scratch" } : {}, hooks });
    assert.equal(r.status, 200, r.text.slice(0, 200));
    assert.deepEqual(seen, ["affordances"], "the untargeted affordances handler is asked, once");
    const fences = machineFences(M.CHECK_FAMILIES);
    const { ok, fences: got, pack, store, tokenClass, ...rest } = r.json;
    assert.deepEqual([ok, typeof store, typeof tokenClass, rest], [true, "string", "string", {}], "only the two keys, not the rest of the answer");
    assert.deepEqual(got, JSON.parse(JSON.stringify(fences)));
    assert.ok(got.length > 10, String(got.length));
    /* N337, N403: fences whose rows left the catalogue are published (tasks' C-32.10, C-32.11) */
    for (const code of ["MACHINE_CANNOT_FORWARD", "MACHINE_CANNOT_RESOLVE"]) assert.ok(got.some((f) => f.code === code), code);
    assert.deepEqual(pack, JSON.parse(JSON.stringify(renderPack({ ...base, fences }))));
    assert.equal(typeof pack.version, "string");
    assert.deepEqual(pack.resident.boundary.fences, got);
    assert.equal("pack_absent" in r.json, false);
  }
});

test("R41 (T36): the untargeted `op=affordances` answer is the handler's exactly, with no `fences` and no `pack` (its `act_help` and every other key kept); a targeted answer, a refusal and another op's answer pass unchanged (negative control: `op=agentpack` over the same handler carries both)", async () => {
  const w = world();
  const base = { ...untargeted(), act_help: { publish: "Publish the case." } };
  const hooks = hooksAnswering(() => M.json({ ok: true, result: base }, 200));
  for (const token of [w.env.ADMIN_TOKEN, w.S.ann, w.A.ann]) {
    const r = await call(w.env, { op: "affordances", token, hooks });
    assert.equal(r.status, 200);
    assert.deepEqual(r.json.result, JSON.parse(JSON.stringify(base)), "the handler's answer as it stands");
    assert.deepEqual(["fences" in r.json.result, "pack" in r.json.result, "pack_absent" in r.json.result], [false, false, false]);
  }
  const targeted = { target: "INQ-1", acts: [], vocabularies: {} };
  let r = await call(w.env, { op: "affordances", token: w.env.ADMIN_TOKEN, params: { target: "INQ-1" },
                              hooks: hooksAnswering(() => M.json({ ok: true, result: targeted })) });
  assert.deepEqual(r.json.result, targeted);
  r = await call(w.env, { op: "affordances", token: w.env.ADMIN_TOKEN,
                          hooks: hooksAnswering(() => M.json({ ok: false, reason: "NO_SUCH_BUNDLE" }, 404)) });
  assert.deepEqual([r.status, r.json.ok, "fences" in r.json, "pack" in r.json], [404, false, false, false]);
  r = await call(w.env, { op: "index", token: w.env.ADMIN_TOKEN, hooks: hooksAnswering(() => M.json({ ok: true, result: { a: 1 } })) });
  assert.deepEqual(r.json.result, { a: 1 });
  /* negative control */
  const a = await call(w.env, { op: "agentpack", token: w.S.ann, hooks });
  assert.deepEqual([typeof a.json.pack?.version, Array.isArray(a.json.fences)], ["string", true]);
});

test("R41: a render that throws answers `pack: null` and `pack_absent` (its sentence), with the fences, never a partial pack; a refusal of the handler is answered as given, with neither key; a targeted `agentpack` asks the handler untargeted (negative control: the same answer with its vocabularies renders)", async () => {
  const w = world();
  const bare = { ...untargeted(), vocabularies: {} };
  let r = await call(w.env, { op: "agentpack", token: w.env.ADMIN_TOKEN, hooks: hooksAnswering(() => M.json({ ok: true, result: bare })) });
  assert.equal(r.json.pack, null);
  assert.match(r.json.pack_absent, /vocabular/);
  assert.ok(r.json.fences.length > 10);
  const targets = [];
  r = await call(w.env, { op: "agentpack", token: w.env.ADMIN_TOKEN, params: { target: "INQ-1" },
                          hooks: hooksAnswering((ctx) => { targets.push(ctx.url.searchParams.get("target")); return M.json({ ok: true, result: untargeted() }); }) });
  assert.deepEqual(targets, [null]);
  assert.equal(typeof r.json.pack?.version, "string");
  assert.equal("pack_absent" in r.json, false);
  const refusing = hooksAnswering(() => M.json({ ok: false, reason: "NO_SUCH_BUNDLE" }, 404));
  r = await call(w.env, { op: "agentpack", token: w.S.ann, hooks: refusing });
  assert.deepEqual([r.status, r.json.reason, "pack" in r.json, "fences" in r.json], [404, "NO_SUCH_BUNDLE", false, false]);
});

test("R41 (affordances R37; skills R9, R10): `screens` and `wizard_scripts` in the untargeted answer are passed to renderPack whole, so `op=agentpack`'s pack carries the scripts as its driven layer; a script naming a screen the answer does not publish renders no pack (`pack: null`, `pack_absent` naming it), never a partial pack (negative control: without them the layer states its absence)", async () => {
  const w = world();
  const screens = [{ id: "case.summary", acts: ["publish", "statementack"] }, { id: "inbox", acts: ["inboxresolve"] }];
  const wizard_scripts = [{ id: "WIZ-a", version: 1, name: "Publish a case", steps: [
    { screen: "case.summary", act: null, what: "Read the summary.", why: "So you know what you publish." },
    { screen: "case.summary", act: "publish", what: "Press publish.", why: "Only you can publish it." }] }];
  const answerWith = (extra) => hooksAnswering(() => M.json({ ok: true, result: { ...untargeted(), ...extra } }));
  let r = await call(w.env, { op: "agentpack", token: w.S.ann, hooks: answerWith({ screens, wizard_scripts }) });
  const fences = machineFences(M.CHECK_FAMILIES);
  assert.deepEqual(r.json.pack, JSON.parse(JSON.stringify(renderPack({ ...untargeted(), screens, wizard_scripts, fences }))));
  assert.deepEqual(r.json.pack.disclosed.wizard_scripts.body, wizard_scripts);
  assert.equal(r.json.pack.disclosed.wizard_scripts.sourcing, "driven");
  const u = await call(w.env, { op: "affordances", token: w.S.ann, hooks: answerWith({ screens, wizard_scripts }) });
  assert.deepEqual([u.json.result.screens, u.json.result.wizard_scripts], [screens, wizard_scripts], "both kept in the affordances answer");
  const broken = [{ ...wizard_scripts[0], steps: [{ screen: "nowhere", act: null, what: "x", why: "y" }] }];
  r = await call(w.env, { op: "agentpack", token: w.S.ann, hooks: answerWith({ screens, wizard_scripts: broken }) });
  assert.equal(r.json.pack, null);
  assert.match(r.json.pack_absent, /WIZ-a.*nowhere/);
  r = await call(w.env, { op: "agentpack", token: w.S.ann, hooks: answerWith({}) });
  assert.deepEqual(r.json.pack.disclosed.wizard_scripts.body, []);
  assert.equal(typeof r.json.pack.disclosed.wizard_scripts.absent_because, "string");
});
