/* control-plane R41 (K585 (1), K674 (1); agent-worker R48, N157): the untargeted `op=affordances` answer carries the
   published fences and the rendered pack. Driven through `makeFetch(hooks)`, the handler answering affordances R17's
   untargeted shape from affordances' own tables, as plane's door arm (`affordancesOp`) does. */
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

test("R41: the untargeted op=affordances answer is the handler's with `fences` (machineFences over CHECK_FAMILIES) and `pack` (renderPack over that answer with its fences, whole with its version); the moved fences are published", async () => {
  const w = world();
  const base = untargeted();
  const hooks = hooksAnswering(() => M.json({ ok: true, result: base }, 200));
  for (const token of [w.env.ADMIN_TOKEN, w.S.ann, w.A.ann, w.env.PROBE_TOKEN]) {
    const r = await call(w.env, { op: "affordances", token, hooks });
    assert.equal(r.status, 200);
    const fences = machineFences(M.CHECK_FAMILIES);
    const { pack, fences: got, ...rest } = r.json.result;
    assert.deepEqual(rest, JSON.parse(JSON.stringify(base)), "the handler's answer is kept whole");
    assert.deepEqual(got, JSON.parse(JSON.stringify(fences)));
    assert.ok(got.length > 10, String(got.length));
    /* N337, N403: fences whose rows left the catalogue are published (tasks' C-32.10, C-32.11) */
    for (const code of ["MACHINE_CANNOT_FORWARD", "MACHINE_CANNOT_RESOLVE"]) assert.ok(got.some((f) => f.code === code), code);
    assert.deepEqual(pack, JSON.parse(JSON.stringify(renderPack({ ...base, fences }))));
    assert.equal(typeof pack.version, "string");
    assert.deepEqual(pack.resident.boundary.fences, got);
    assert.equal("pack_absent" in r.json.result, false);
  }
});

test("R41: a targeted answer carries neither key, nor does a refusal or another op's answer; a render that throws publishes pack: null and pack_absent, never a partial pack", async () => {
  const w = world();
  const targeted = { target: "INQ-1", acts: [], vocabularies: {} };
  let r = await call(w.env, { op: "affordances", token: w.env.ADMIN_TOKEN, params: { target: "INQ-1" },
                              hooks: hooksAnswering(() => M.json({ ok: true, result: targeted })) });
  assert.deepEqual(r.json.result, targeted);
  /* a refusal passes unchanged, at its status */
  r = await call(w.env, { op: "affordances", token: w.env.ADMIN_TOKEN,
                          hooks: hooksAnswering(() => M.json({ ok: false, reason: "NO_SUCH_BUNDLE" }, 404)) });
  assert.deepEqual([r.status, r.json.ok, "fences" in r.json, "pack" in r.json], [404, false, false, false]);
  /* another op's answer is not decorated */
  r = await call(w.env, { op: "index", token: w.env.ADMIN_TOKEN, hooks: hooksAnswering(() => M.json({ ok: true, result: { a: 1 } })) });
  assert.deepEqual(r.json.result, { a: 1 });
  /* a render that throws (no published vocabularies): fences published, no pack, its sentence stated */
  const bare = { ...untargeted(), vocabularies: {} };
  r = await call(w.env, { op: "affordances", token: w.env.ADMIN_TOKEN, hooks: hooksAnswering(() => M.json({ ok: true, result: bare })) });
  assert.equal(r.json.result.pack, null);
  assert.match(r.json.result.pack_absent, /vocabular/);
  assert.ok(r.json.result.fences.length > 10);
  /* negative control: the same answer with its vocabularies renders */
  r = await call(w.env, { op: "affordances", token: w.env.ADMIN_TOKEN, hooks: hooksAnswering(() => M.json({ ok: true, result: untargeted() })) });
  assert.equal(typeof r.json.result.pack?.version, "string");
});

test("R41 (affordances R37; skills R9, R10): `screens` and `wizard_scripts` in the untargeted answer are passed to renderPack whole, so the pack carries the scripts as its driven layer; a script naming a screen the answer does not publish renders no pack (`pack: null`, `pack_absent` naming it), never a partial pack (negative control: without them the layer states its absence)", async () => {
  const w = world();
  const screens = [{ id: "case.summary", acts: ["publish", "statementack"] }, { id: "inbox", acts: ["inboxresolve"] }];
  const wizard_scripts = [{ id: "WIZ-a", version: 1, name: "Publish a case", steps: [
    { screen: "case.summary", act: null, what: "Read the summary.", why: "So you know what you publish." },
    { screen: "case.summary", act: "publish", what: "Press publish.", why: "Only you can publish it." }] }];
  const answerWith = (extra) => hooksAnswering(() => M.json({ ok: true, result: { ...untargeted(), ...extra } }));
  let r = await call(w.env, { op: "affordances", token: w.S.ann, hooks: answerWith({ screens, wizard_scripts }) });
  const fences = machineFences(M.CHECK_FAMILIES);
  const { pack, ...published } = r.json.result;
  assert.deepEqual([published.screens, published.wizard_scripts], [screens, wizard_scripts], "both kept in the answer");
  assert.deepEqual(pack, JSON.parse(JSON.stringify(renderPack({ ...untargeted(), screens, wizard_scripts, fences }))));
  assert.deepEqual(pack.disclosed.wizard_scripts.body, wizard_scripts);
  assert.equal(pack.disclosed.wizard_scripts.sourcing, "driven");
  /* a script whose step names an unpublished screen: no pack, the sentence names it */
  const broken = [{ ...wizard_scripts[0], steps: [{ screen: "nowhere", act: null, what: "x", why: "y" }] }];
  r = await call(w.env, { op: "affordances", token: w.S.ann, hooks: answerWith({ screens, wizard_scripts: broken }) });
  assert.equal(r.json.result.pack, null);
  assert.match(r.json.result.pack_absent, /WIZ-a.*nowhere/);
  /* negative control: with neither published, the layer is the stated absence */
  r = await call(w.env, { op: "affordances", token: w.S.ann, hooks: answerWith({}) });
  assert.deepEqual(r.json.result.pack.disclosed.wizard_scripts.body, []);
  assert.equal(typeof r.json.result.pack.disclosed.wizard_scripts.absent_because, "string");
});
