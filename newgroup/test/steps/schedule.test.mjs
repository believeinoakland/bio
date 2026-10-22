/* installer-steps R39 (K4566; fix round 6, G1): the plane's own schedule, set by the install and by the update from the signed bundle. */
import test from "node:test";
import assert from "node:assert/strict";
import { uploadInstall, uploadUpdate, planeCrons, planeCronsOfStream, namesFor } from "../../src/steps/index.mjs";
import { word } from "../../../bio-plane/src/setup-words/index.mjs";
import { session, immediateTimers, account, release, chosen, realFetch, CAPABLE_SRC, CRONS_STATEMENT, sha, VERSION, LIMITS, sequence, cfok, cferr } from "./world.mjs";

let restoreTimers;
test.beforeEach(() => { restoreTimers = immediateTimers(); });
test.afterEach(() => { restoreTimers(); globalThis.fetch = realFetch; });
const NAMES = namesFor("grp");
const SECRETS = { boot: "boot-secret", probe: "probe-secret", daemon: "daemon-secret", seal: "seal-secret" };
const without = (src) => src.replace(/ export const PLANE_CRONS_STATEMENT = "[^"]*";/, "");
const withStatement = (src, stmt) => without(src) + ` export const PLANE_CRONS_STATEMENT = "${stmt}";`;
const install = (rel, opts = {}) => uploadInstall(session(), "A1", "grp", SECRETS, rel, { names: NAMES, members: [], ...opts });
const update = (rel, opts = {}) => uploadUpdate(session(), "A1", "grp", true, rel, { names: NAMES, members: [], ...opts });
const bundle = async (src) => chosen(await release({ src }));
const order = (w) => w.calls.map((c) => `${c.method} ${c.u.split("/accounts/A1")[1]}`);

test("R39: the install and the update each set the plane's schedule from the crons the signed bundle states, after the upload", async () => {
  for (const [name, act] of [["install", install], ["update", update]]) {
    const w = account({ pre: name === "update" ? { grp: [] } : {} });
    await act(await bundle(CAPABLE_SRC));
    assert.deepEqual(w.schedules.get("grp"), ["*/5 * * * *"], name);
    const calls = order(w);
    assert.ok(calls.indexOf("PUT /workers/scripts/grp/schedules") > calls.indexOf("PUT /workers/scripts/grp"), name + ": the schedule is set once the script is there");
    assert.equal(w.schedules.size, 1, name + ": the plane's schedule alone");
    w.restore();
  }
});

test("R39: the crons are the bundle's, never the installer's own: another stated schedule is the one set, on both acts", async () => {
  for (const act of [install, update]) {
    const w = account({ pre: { grp: [] } });
    await act(await bundle(withStatement(CAPABLE_SRC, "bio-plane-crons/1 7 */3 * * 1-5")));
    assert.deepEqual(w.schedules.get("grp"), ["7 */3 * * 1-5"]);
    w.restore();
  }
});

test("R39: a refused schedule stops the install and the update, with the platform's message and not a note", async () => {
  for (const act of [install, update]) {
    const w = account({ pre: { grp: [] }, refuseSchedules: true });
    await assert.rejects(act(await bundle(CAPABLE_SRC)), (e) => /schedules refused/.test(e.message) && !e.approveAgain);
    assert.equal(w.schedules.size, 0);
    w.restore();
  }
  /* control: the same account without the refusal sets it */
  const ok = account({ pre: { grp: [] } });
  await install(await bundle(CAPABLE_SRC));
  assert.equal(ok.schedules.size, 1);
  ok.restore();
});

test("R39: a bundle without the statement, or with one that cannot be read, stops both acts before anything is uploaded", async () => {
  const bad = {
    none: without(CAPABLE_SRC),
    two: withStatement(CAPABLE_SRC, "bio-plane-crons/1 */5 * * * *") + ` const b = "bio-plane-crons/1 */10 * * * *";`,
    notacron: withStatement(CAPABLE_SRC, "bio-plane-crons/1 every five minutes"),
    fourfields: withStatement(CAPABLE_SRC, "bio-plane-crons/1 */5 * * *"),
    empty: withStatement(CAPABLE_SRC, "bio-plane-crons/1 "),
  };
  for (const [why, src] of Object.entries(bad)) for (const act of [install, update]) {
    const w = account({ pre: { grp: [] } });
    await assert.rejects(act(await bundle(src)), (e) => e.message === word("installer.fleet.why.program"), why);
    assert.equal(w.puts.length, 0, why + ": nothing was uploaded");
    assert.equal(w.schedules.size, 0, why);
    w.restore();
  }
});

test("R39: an approval the platform withdraws at the schedule is thrown as ApproveAgain and not repeated, as every other call", async () => {
  const calls = sequence([cfok({}), cferr("auth", 401)]);
  await assert.rejects(install(await bundle(CAPABLE_SRC)), (e) => e.approveAgain === true);
  assert.equal(calls.length, 2, "a 401 is not repeated");
});

test("R39: planeCrons reads text and bytes alike: one distinct quoted statement of one five-field schedule", () => {
  const enc = (s) => new TextEncoder().encode(s);
  for (const q of ['"', "'", "`"]) {
    const src = `x = ${q}bio-plane-crons/1 */5 * * * *${q};`;
    assert.deepEqual(planeCrons(src), { ok: true, crons: ["*/5 * * * *"] });
    assert.deepEqual(planeCrons(enc(src)), { ok: true, crons: ["*/5 * * * *"] });
  }
  assert.equal(Object.isFrozen(planeCrons(CAPABLE_SRC).crons), true);
  assert.deepEqual(planeCrons("nothing"), { ok: false, why: "none" });
  assert.deepEqual(planeCrons('a = "bio-plane-limits/1 subrequests=10000";'), { ok: false, why: "none" }, "the limits statement is never read as it");
  assert.equal(planeCrons('a = "bio-plane-crons/1 */5 * * * *"; b = "bio-plane-crons/1 */6 * * * *";').why, "unreadable");
  assert.equal(planeCrons('a = "bio-plane-crons/1 */5 * * * *"; b = "bio-plane-crons/1 */5 * * * *";').ok, true, "the same statement twice is one");
  assert.equal(planeCrons('a = "bio-plane-crons/1 */5 * * *";').why, "unreadable");
  assert.equal(planeCrons(12).why, "none");
});

test("R39: the statement is found in a stream whatever the chunking, even split inside the tag, the quotes or the schedule", async () => {
  const src = new TextEncoder().encode("x".repeat(3000) + `;export const A = "${CRONS_STATEMENT}";` + "y".repeat(3000));
  const at = src.length - 3000 - CRONS_STATEMENT.length - 3;
  for (let cut = at - 2; cut < at + CRONS_STATEMENT.length + 5; cut++) {
    const stream = new Blob([src.subarray(0, cut), src.subarray(cut)]).stream();
    assert.deepEqual(await planeCronsOfStream(stream), { ok: true, crons: ["*/5 * * * *"] }, "cut at " + cut);
  }
  const bytewise = new ReadableStream({ start(c) { for (const b of src) c.enqueue(Uint8Array.of(b)); c.close(); } });
  assert.deepEqual(await planeCronsOfStream(bytewise), { ok: true, crons: ["*/5 * * * *"] });
  assert.deepEqual(await planeCronsOfStream(new Blob([src.subarray(0, 3000)]).stream()), { ok: false, why: "none" });
});

test("R39: the schedule is read from a 29 MB release streamed, never held whole (R38): the Blob refuses text, arrayBuffer and bytes", async () => {
  const big = new Uint8Array(29 * 2 ** 20);
  for (let i = 0; i < big.length; i++) big[i] = (i * 2654435761 >>> 24) & 127;
  const tail = new TextEncoder().encode(` "${CRONS_STATEMENT}" `);
  big.set(tail, big.length - tail.length - 100);
  const blob = new Blob([big]);
  const seen = [];
  for (const m of ["text", "arrayBuffer", "bytes"]) blob[m] = async () => { seen.push(m); throw new Error("held whole by " + m); };
  const rel = { version: VERSION, blob, limits: LIMITS, sha: await sha(big) };
  for (const act of [install, update]) {
    const w = account({ pre: { grp: [] } });
    await act(rel);
    assert.deepEqual(w.schedules.get("grp"), ["*/5 * * * *"]);
    w.restore();
  }
  assert.deepEqual(seen, []);
});
