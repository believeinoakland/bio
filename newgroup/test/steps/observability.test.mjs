/* installer-steps R40 (G54, fix round 6; K4702): the plane's Workers Logs are switched on by the install and the update, and read back. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { uploadInstall, uploadUpdate, namesFor, OBSERVABILITY } from "../../src/steps/index.mjs";
import { word, hasWord } from "../../../bio-plane/src/setup-words/index.mjs";
import { session, immediateTimers, account, release, chosen, realFetch, CAPABLE_SRC } from "./world.mjs";

let restoreTimers;
test.beforeEach(() => { restoreTimers = immediateTimers(); });
test.afterEach(() => { restoreTimers(); globalThis.fetch = realFetch; });
const NAMES = namesFor("grp");
const SECRETS = { boot: "boot-secret", probe: "probe-secret", daemon: "daemon-secret", seal: "seal-secret" };
const install = (rel, opts = {}) => uploadInstall(session(), "A1", "grp", SECRETS, rel, { names: NAMES, members: [], ...opts });
const update = (rel, opts = {}) => uploadUpdate(session(), "A1", "grp", true, rel, { names: NAMES, members: [], ...opts });
const bundle = async () => chosen(await release({ src: CAPABLE_SRC }));
const ACTS = [["install", install, {}], ["update", update, { grp: [] }]];

test("R40: the install and the update each send observability enabled in the plane's metadata", async () => {
  for (const [name, act, pre] of ACTS) {
    const w = account({ pre });
    await act(await bundle());
    assert.deepEqual(w.puts.find((p) => p.name === "grp").meta.observability, { enabled: true }, name);
    w.restore();
  }
});

test("R40: the constant equals the plane's own wrangler setting, so the two cannot drift", () => {
  const cfg = readFileSync(new URL("../../../bio-plane/wrangler.jsonc", import.meta.url), "utf8");
  const stated = JSON.parse(/"observability":\s*(\{[^}]*\})/.exec(cfg)[1]);
  assert.deepEqual(OBSERVABILITY, stated);
});

test("R40: an account that does not hold observability after the upload stops the install and the update, stated", async () => {
  for (const [name, act, pre] of ACTS) {
    const w = account({ pre, dropObservability: true });
    await assert.rejects(act(await bundle()), (e) => e.message === word("installer.fleet.why.program") && !e.approveAgain, name);
    assert.equal(w.schedules.size, 0, name + ": nothing after the refusal");
    w.restore();
  }
  /* control: the same account keeping it completes */
  const ok = account({ pre: { grp: [] } });
  await update(await bundle());
  assert.equal(ok.schedules.size, 1);
  ok.restore();
});

test("R40: a settings answer that states observability disabled is refused as one that states none", async () => {
  const w = account({ pre: { grp: [] } });
  const ask = globalThis.fetch;
  globalThis.fetch = async (u, init) => {
    const r = await ask(u, init);
    if (!/\/scripts\/grp\/settings$/.test(String(u))) return r;
    const j = await r.json();
    return Response.json({ ...j, result: { ...j.result, observability: { enabled: false } } });
  };
  await assert.rejects(update(await bundle()), (e) => e.message === word("installer.fleet.why.program"));
  w.restore();
});

test("R40: settings that cannot be read do not stop the act: it continues and says the logs could not be confirmed (a lasting failure is rethrown, as heldBindings does)", async () => {
  for (const [name, act, pre] of ACTS) {
    /* R42: an update refuses a script whose settings it cannot read before uploading, so the unreadable read-back is the one
       AFTER the upload (`blindAfterPut`); the install reads no held settings, so it is blind from the start as before. */
    for (const blind of [{ blindAfterPut: true }]) {
      const w = account({ pre, ...blind });
      const said = [];
      await act(await bundle(), { note: (t) => said.push(t) });
      assert.deepEqual(said, [word("installer.fleet.logsunconfirmed")], name);
      assert.equal(w.schedules.size, 1, name + ": the schedule is still set");
      w.restore();
    }
  }
  const w = account({ pre: { grp: [] } });
  const said = [];
  await update(await bundle(), { note: (t) => said.push(t) });
  assert.deepEqual(said, [], "readable settings say nothing");
  w.restore();
});

test("R40: the act finishes whether or not the row of the unconfirmed-logs note is in the word table: the note is said when the row exists and skipped when it does not", async () => {
  for (const [name, act, pre] of ACTS) {
    const w = account({ pre, blindAfterPut: true });
    const said = [];
    await act(await bundle(), { note: (t) => said.push(t) });
    assert.deepEqual(said, hasWord("installer.fleet.logsunconfirmed") ? [word("installer.fleet.logsunconfirmed")] : [], name);
    assert.equal(w.schedules.size, 1, name + ": the act went on to the schedule");
    w.restore();
  }
});
