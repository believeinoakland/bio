/* installer-steps R34 to R36: nothing it writes carries a credential; it reaches back into nothing and keeps nothing; its sentences stand as they were. */
import test from "node:test";
import assert from "node:assert/strict";
import * as steps from "../../src/steps/index.mjs";
import { establishPlan, ensureBuckets, ensureSubdomain, uploadInstall, uploadUpdate, loadFleet, installFleet, bindMembers, verifyInstall, verifyServing,
  logsStep, readBack, planeInSync, rotateSecrets, namesFor, releaseSha, cf, heldBindings, inventory, apiOf, copyWorkers } from "../../src/steps/index.mjs";
import { verifySshsig, NS_FLEET, fleetStatement } from "../../../bio-plane/src/sshsig.mjs";
import { readdirSync, readFileSync } from "node:fs";
import { word, hasWord } from "../../../bio-plane/src/setup-words/index.mjs";
import { TOK, session, sink, immediateTimers, account, heldCopy, release, chosen, armWith, restoreSigners, SIGNER, realFetch, VERSION, sha, CAPABLE_SRC } from "./world.mjs";

const NAMES = namesFor("grp");
const SENT = { boot: "SENTINEL-BOOT-CREDENTIAL", probe: "SENTINEL-PROBE-CREDENTIAL", daemon: "SENTINEL-DAEMON-CREDENTIAL", seal: "SENTINEL-SEAL-CREDENTIAL", instanceAi: "SENTINEL-AI-CREDENTIAL-1234" };
const FORBIDDEN = ["MEMBER_TOKEN", "INSTANCE_CLAUDE_TOKEN", "ASSISTANT_ENABLED", "CIVICSMITH_TEST_INSTANCE"];
let restoreTimers;
test.beforeEach(() => { restoreTimers = immediateTimers(); armWith(SIGNER.line); });
test.afterEach(() => { restoreTimers(); restoreSigners(); globalThis.fetch = realFetch; });

test("R34: the upload metadata of R12 and R13, and of every member, holds none of the four forbidden names; the member binding names are instance-setup's", async () => {
  const rel = await release({ container: true, scanner: true });
  const w = account({ rel, pre: { grp: [] } });
  const release_ = await chosen(rel);
  const loaded = await loadFleet(release_);
  await installFleet(sink(), session(), "A1", "grp", release_, loaded, { names: NAMES, scope: "containers.write", plan: { plan: "paid" } });
  w.classes.delete("grp");
  w.scripts.delete("grp");
  await uploadInstall(session(), "A1", "grp", SENT, release_, { names: NAMES, members: ["agent-worker"] });
  await uploadUpdate(session(), "A1", "grp", true, release_, { names: NAMES, members: ["agent-worker"], secrets: SENT, instanceAi: SENT.instanceAi, seal: SENT.seal });
  assert.ok(w.puts.length >= 8, `${w.puts.length} uploads`);
  for (const p of w.puts) {
    const text = JSON.stringify(p.meta);
    for (const name of FORBIDDEN) assert.ok(!text.includes(name), `${p.name} carries ${name}`);
  }
  w.restore();
});

test("R34: a run with a sentinel token and sentinel credentials emits and returns none of them", async () => {
  const rel = await release({ scanner: true });
  const w = account({ rel, subdomain: "pfx", pre: { "pdf-worker-grp": [] } });
  const release_ = await chosen(rel);
  const emit = sink();
  const seen = [];
  seen.push(await establishPlan(session(), "A1"), await ensureBuckets(session(), "A1", NAMES), await ensureSubdomain(session(), "A1", "grp"));
  await uploadInstall(session(), "A1", "grp", SENT, release_, { names: NAMES, members: ["pdf-worker"] });
  const loaded = await loadFleet(release_);
  seen.push(await installFleet(emit, session(), "A1", "grp", release_, loaded, { names: NAMES, scope: "containers.write", plan: { plan: "paid" } }));
  seen.push(await bindMembers(emit, session(), "A1", "grp", release_, ["pdf-worker"], { done: ["agent-worker"] }, { withR2: true, names: NAMES, daemon: SENT.daemon, ownHosts: ["grp.pfx.workers.dev"] }));
  seen.push(await readBack(session(), "A1", "grp", release_), await verifyInstall("https://grp.pfx.workers.dev", SENT.probe), await verifyServing("https://grp.pfx.workers.dev", VERSION, [], true, []));
  seen.push(await logsStep(emit, session(), "A1", copyWorkers("grp", release_, NAMES)));
  await rotateSecrets(session(), "A1", "grp", SENT, []);
  seen.push(await heldBindings(session(), "A1", "grp").then((m) => m?.list), await inventory(apiOf(session(), "A1"), ["pdf-worker"]));
  /* a refused call: its error carries neither the token nor the credentials */
  const err = await uploadInstall(session(), "A1", "grp", SENT, release_, { names: NAMES }).catch((e) => e);
  seen.push({ message: err.message, code: err.code, status: err.status });
  const out = JSON.stringify([emit.events, seen, String(session()), [...session() ? Object.keys(session()) : []]]);
  for (const secret of [TOK, ...Object.values(SENT)]) assert.ok(!out.includes(secret), secret);
  w.restore();
});

test("R34: every signature check goes through the one verifier: a fleet signature loadFleet accepts verifySshsig accepts, and the other way round", async () => {
  const good = await release();
  const w = account({ rel: good });
  const plane = { sha256: good.manifest.sha256, bytes: good.manifest.bytes, asset: "bio-plane.bundled.mjs" };
  const bytes = new TextEncoder().encode(fleetStatement({ version: good.version, plane, members: good.manifest.fleet }));
  const direct = await verifySshsig(good.manifest.fleetSig, bytes, NS_FLEET, [SIGNER.line]);
  const through = await loadFleet(await chosen(good));
  assert.equal(direct.ok, true);
  assert.equal("skip" in through, false);
  armWith();
  assert.equal((await verifySshsig(good.manifest.fleetSig, bytes, NS_FLEET, [])).ok, false);
  assert.equal(typeof (await loadFleet(await chosen(good))).skip, "string");
  w.restore();
});

/* every exported value that is not a function, as a stable picture of it */
const picture = () => JSON.stringify(Object.entries(steps).filter(([, v]) => typeof v !== "function").map(([k, v]) =>
  [k, v instanceof Map ? [...v] : v instanceof Set ? [...v] : v instanceof RegExp ? String(v) : v]));

test("R35: no top-level state a call can change: after a full install, update and removal every exported value is as it was, ARMED_SIGNERS aside", async () => {
  const before = picture();
  const rel = await release({ container: true, scanner: true });
  const w = account({ rel, subdomain: "pfx", pre: { grp: [] } });
  const release_ = await chosen(rel);
  const loaded = await loadFleet(release_);
  await installFleet(sink(), session(), "A1", "grp", release_, loaded, { names: NAMES, scope: "containers.write", plan: { plan: "paid" } });
  await uploadUpdate(session(), "A1", "grp", true, release_, { names: NAMES, members: ["agent-worker"] });
  await verifyServing("https://grp.pfx.workers.dev", VERSION, [], false, []);
  assert.equal(picture(), before);
  w.restore();
});

test("R35: two interleaved loadFleet calls over two stub sources see only their own requests", async () => {
  const a = await release({ version: "1.1.1", members: ["pdf-worker"], memberSrc: { "pdf-worker": "export default { a: 1 };" } });
  const b = await release({ version: "2.2.2", members: ["ocr-worker", "agent-worker"], memberSrc: { "ocr-worker": "export default { b: 2 };" } });
  const seen = { a: [], b: [] };
  globalThis.fetch = async (input) => {
    const u = typeof input === "string" ? input : input.url;
    const [side, rel] = u.startsWith("https://a.test/") ? ["a", a] : ["b", b];
    const p = u.replace(/^https:\/\/[ab]\.test\/r\//, "");
    seen[side].push(p);
    await new Promise((res) => setTimeout(res, 0));
    return p in rel.assets ? new Response(rel.assets[p]) : new Response("gone", { status: 404 });
  };
  const [la, lb] = await Promise.all([chosen(a, { base: "https://a.test/r" }), chosen(b, { base: "https://b.test/r" })].map((p) => p.then((r) => loadFleet(r))));
  assert.deepEqual(la.members.map((m) => m.m.member), ["pdf-worker"]);
  assert.deepEqual(lb.members.map((m) => m.m.member).sort(), ["agent-worker", "ocr-worker"]);
  assert.deepEqual(seen.a, ["pdf-worker.bundled.mjs"]);
  assert.ok(seen.b.every((p) => !p.startsWith("pdf-worker")) && seen.b.length === 4, "ocr-worker's bundle and part, agent-worker's bundle and Worker part");
  const again = await Promise.all([la.members[0].bytes(), lb.members[0].bytes()]);
  assert.equal(new TextDecoder().decode(again[0].bundle), "export default { a: 1 };");
  assert.ok(seen.a.length === 2 && seen.b.length > 3 && seen.a.every((p) => p === "pdf-worker.bundled.mjs"), "a member's bytes come from its own source");
});

test("R35 control: a release object frozen before releaseSha fails only the memo; one that holds its hash needs no write", async () => {
  const blob = new Blob([CAPABLE_SRC]);
  await assert.rejects(releaseSha(Object.freeze({ blob })), TypeError);
  const loose = { blob };
  assert.equal(await releaseSha(loose), await sha(CAPABLE_SRC));
  assert.equal(loose.sha, await sha(CAPABLE_SRC));
  assert.equal(await releaseSha(Object.freeze({ blob: new Blob(["other"]), sha: "kept" })), "kept");
  const rel = await release();
  const w = account({ rel, pre: { grp: [] } });
  const frozen = Object.freeze(await chosen(rel));
  assert.ok(Array.isArray((await loadFleet(frozen)).members));
  w.restore();
});

const SRC = new URL("../../src/steps/", import.meta.url);
const literalKeys = (text) => [...text.matchAll(/\bword\(\s*"([A-Za-z0-9_.-]+)"/g)].map((m) => m[1]);
const inlineWords = (text) => [...text.matchAll(/\b(?:word|localize)\(\s*[^"\s)]/g)];

test("R36: every sentence is read by key: the keys it reads are the list STEP_KEYS holds, each is a row, and no call reads a key built at run time", async () => {
  const files = readdirSync(SRC).filter((f) => f.endsWith(".mjs"));
  const read = new Set(files.flatMap((f) => literalKeys(readFileSync(new URL(f, SRC), "utf8"))));
  assert.deepEqual([...read].sort(), [...steps.STEP_KEYS].sort(), "the list and the source agree");
  for (const key of steps.STEP_KEYS) assert.equal(hasWord(key), true, key);
  for (const f of files) assert.deepEqual(inlineWords(readFileSync(new URL(f, SRC), "utf8")), [], `${f}: a key is a literal at the call`);
  /* the families the keys stage names, each read */
  for (const family of ["installer.fleet.", "installer.image.", "installer.lag.", "installer.logs.", "installer.connect.", "installer.probe.", "installer.release."])
    assert.ok(steps.STEP_KEYS.some((k) => k.startsWith(family)) || family === "installer.release.", family);
  /* control: the detectors find a key built at run time and see a literal key */
  assert.equal(inlineWords('word(`installer.${x}`)').length, 1);
  assert.deepEqual(literalKeys('word("installer.a.b", { x })'), ["installer.a.b"]);
});

test("R36: the sentences it draws are the design's: each result is the row's English with its variables filled, and a missing variable is refused by name", async () => {
  const rel = await release({ container: true, scanner: true, scannerWorker: null });
  const w = account({ rel, subdomain: "pfx", pre: { grp: [] } });
  const release_ = await chosen(rel);
  const emit = sink();
  const loaded = await loadFleet(release_);
  const r = await installFleet(emit, session(), "A1", "grp", release_, loaded, { names: NAMES, scope: "containers.write", plan: { plan: "paid" } });
  assert.equal(emit.events[0].label, word("installer.step.helpers"));
  assert.ok(emit.last("fleet").label.startsWith(word("installer.fleet.done.other", { n: r.done.length, names: r.done.join(", ") })));
  assert.ok(emit.last("fleet").label.includes(word("installer.fleet.note.scanner", { member: "file-scanner" })));
  assert.equal((await loadFleet(await chosen(rel, { man: null }))).skip, word("installer.fleet.skip.unreachable"));
  assert.throws(() => word("installer.fleet.done.other", { n: 1 }), /WORD_VAR_MISSING/);
  w.restore();
});
