/* installer-steps R27 to R33: verification, the Logpush check, and the keys that sign. */
import test from "node:test";
import assert from "node:assert/strict";
import * as steps from "../../src/steps/index.mjs";
import { verifyInstall, servingVerdict, verifyServing, waitForAnswer, currentDeployment, rollBack, withByteLags, failedLags, logsStep, logpushCheck, filterExcludes,
  PER_REQUEST_DATASET, copyWorkers, namesFor, ARMED_SIGNERS, loadFleet, BINDING_OF, WAIT_BOUND_MINUTES } from "../../src/steps/index.mjs";
import { RELEASE_KEYS, verifySshsig, NS_FLEET, fleetStatement } from "../../../bio-plane/src/sshsig.mjs";
import { selftestAnswer } from "../../../bio-plane/test/m/instance-setup/fixtures.mjs";
import { bootstrapVersions } from "../../../bio-plane/test/m/credentials/fixtures.mjs";
import { session, sink, immediateTimers, account, sequence, release, chosen, armWith, restoreSigners, SIGNER, STRANGER, jres, cferr, cfok, realFetch, TOK } from "./world.mjs";

const NAMES = namesFor("grp");
const BASE = "https://grp.pfx.workers.dev";
const PROBE = "PROBE-SENTINEL-CREDENTIAL";
let restoreTimers;
test.beforeEach(() => { restoreTimers = immediateTimers(); });
test.afterEach(() => { restoreTimers(); restoreSigners(); globalThis.fetch = realFetch; });

const grp = { grp: [{ type: "plain_text", name: "VERSION", text: "1.0.0" }] };

test("R27: the probe credential travels only in the Authorization header, in no address; the reply is answered once ok with STORE", async () => {
  const w = account({ pre: grp, subdomain: "pfx" });
  const waits = [];
  const reply = await verifyInstall(BASE, PROBE, (a, b) => waits.push([a, b]));
  assert.deepEqual(reply, { ok: true, bindings: { STORE: true } });
  const asks = w.calls.filter((c) => c.u.startsWith(BASE));
  assert.ok(asks.length >= 1);
  for (const c of asks) {
    assert.equal(c.init.headers.authorization, "Bearer " + PROBE);
    assert.ok(!c.u.includes(PROBE));
    assert.ok(c.u.endsWith("/api/?op=selftest"));
  }
  assert.deepEqual(waits, [], "answered at once: nothing to wait for");
  w.restore();
});

test("R27: an address that answers after the third try answers the reply; one that never answers answers null after the bound, calling onWait at the start and every 30 seconds", async () => {
  let w = account({ pre: grp, subdomain: "pfx", wakeAfter: 3 });
  assert.equal((await verifyInstall(BASE, PROBE)).ok, true);
  assert.equal(w.addressRequests.length, 4);
  w.restore();
  w = account({ pre: grp, subdomain: "pfx", silentAddress: true });
  const waits = [];
  assert.equal(await verifyInstall(BASE, PROBE, (a, b) => waits.push([a, b])), null);
  assert.ok(w.addressRequests.length > 50, "every WAKE_EVERY_S seconds of nominal waiting, a failed request being a wait");
  assert.deepEqual(waits[0], [0, WAIT_BOUND_MINUTES * 60]);
  assert.ok(waits.slice(1).every(([a, b]) => a === 1 && b === 300));
  assert.equal(waits.length, 10, "at the start and every 30 seconds of a 300-second bound");
  w.restore();
  const { status, ...unbound } = await selftestAnswer();
  w = account({ pre: grp, subdomain: "pfx", copy: { selftest: () => jres(unbound, status) } });
  assert.equal(await verifyInstall(BASE, PROBE), null, "a copy whose store is not bound is not an answer");
  w.restore();
});

const WANT = "2.0.0";
const mv = (over = {}) => ({ "pdf-worker": { state: "SERVING", version: WANT }, ...over });
const good = (over = {}) => ({ version: WANT, storeVersion: WANT, memberVersions: mv(), ...over });
const lagsOf = (j, installed = [], capable = true, failed = []) => servingVerdict(j, WANT, installed, capable, failed);

test("R28: a verdict with no lag is confirmed; each lag in turn from a stub reply", () => {
  const ok = lagsOf(good());
  assert.deepEqual([ok.confirmed, ok.lags, ok.capable], [true, [], true]);
  const one = (j, installed, name) => { const v = lagsOf(j, installed); assert.equal(v.confirmed, false, name); assert.equal(v.lags.length, 1, `${name}: ${v.lags}`); return v.lags[0]; };
  one(good({ version: "1.0.0" }), [], "another version");
  assert.ok(one(good({ version: "1.0.0" }), [], "another version").includes("1.0.0"));
  one(good({ version: undefined }), [], "no version");
  one({ version: WANT, memberVersions: mv() }, [], "no storeVersion");
  one(good({ storeVersion: null }), [], "null store");
  assert.ok(one(good({ storeVersion: "1.9.9" }), [], "other store").includes("1.9.9"));
  one(good({ memberVersions: undefined }), [], "no memberVersions");
  assert.ok(one(good({ memberVersions: mv({ "ocr-worker": { state: "SERVING", version: "1.0.0" } }) }), [], "member another version").includes("ocr-worker"));
  assert.ok(one(good({ memberVersions: mv({ "ocr-worker": { state: "MISNAMED", name: "intruder" } }) }), [], "misnamed").includes("intruder"));
  assert.ok(one(good({ memberVersions: mv({ "ocr-worker": { state: "SILENT" } }) }), [], "silent").includes("ocr-worker"));
  const unbound = good({ memberVersions: mv({ "ocr-worker": { state: "UNBOUND" } }) });
  assert.equal(lagsOf(unbound, []).confirmed, true, "unbound and not installed by this act is not a lag");
  assert.ok(one(unbound, ["ocr-worker"], "installed but unbound").includes("ocr-worker"));
  assert.ok(one(good(), ["sheet-worker"], "installed but unknown").includes("sheet-worker"));
  const silentInstalled = lagsOf(good({ memberVersions: mv({ "ocr-worker": { state: "SILENT" } }) }), ["ocr-worker"]).lags[0];
  const silentOther = lagsOf(good({ memberVersions: mv({ "ocr-worker": { state: "SILENT" } }) }), []).lags[0];
  assert.notEqual(silentInstalled, silentOther, "a member this step installed is said so");
});

test("R28: the address that gave no answer; failed members the plane binds whatever the plane answers, except the ones left out (out); a member the plane does not bind is not a lag here", () => {
  const dark = lagsOf(null);
  assert.deepEqual([dark.confirmed, dark.lags.length], [false, 1]);
  const bound = [...BINDING_OF.keys()][0];
  const failed = [{ member: bound, why: "refused" }, { member: "not-bound-by-plane", why: "x" }, { member: [...BINDING_OF.keys()][1], why: "y", out: true }];
  assert.equal(failedLags(failed).length, 1);
  assert.ok(failedLags(failed)[0].includes(bound) && failedLags(failed)[0].includes("refused"));
  const v = lagsOf(good(), [], true, failed);
  assert.deepEqual([v.confirmed, v.lags.length], [false, 1]);
  assert.equal(lagsOf(null, [], true, failed).lags.length, 2);
  assert.equal(lagsOf(good(), [], true, [failed[2]]).confirmed, true, "a part left out is named at the fleet step, never a lag");
  assert.deepEqual(failedLags(), []);
});

test("R28 control: a not-capable release is given a lag only for the address and the failed members, not for fields it could not report", () => {
  const old = { version: WANT };
  assert.deepEqual(lagsOf(old, [], false), { confirmed: true, lags: [], capable: false });
  assert.equal(lagsOf({ version: "1.0.0" }, [], false).lags.length, 1);
  assert.equal(lagsOf(old, [], false, [{ member: [...BINDING_OF.keys()][0], why: "z" }]).lags.length, 1);
  assert.equal(lagsOf({ version: WANT, storeVersion: "other" }, ["pdf-worker"], false).confirmed, true);
});

test("R28: verifyServing confirms when a reply gives all the right versions after the third try; one that never does answers the last verdict with its lags", async () => {
  let n = 0;
  const early = await bootstrapVersions({ storeVersion: "1.0.0" });
  const right = await bootstrapVersions({ storeVersion: WANT, memberVersions: mv() });
  let w = account({ pre: grp, subdomain: "pfx", copy: { bootstrap: () => jres(++n < 3 ? early : right) } });
  const waits = [];
  const v = await verifyServing(BASE, WANT, ["pdf-worker"], true, [], (a, b) => waits.push([a, b]));
  assert.equal(v.confirmed, true);
  assert.equal(n, 3);
  assert.ok(w.addressRequests.every((r) => r.op === "bootstrap") && w.calls.filter((c) => c.u.startsWith(BASE)).every((c) => c.u.includes("op=bootstrap&members=1")));
  assert.deepEqual(waits[0], [0, 300]);
  w.restore();
  const lagging = await bootstrapVersions({ storeVersion: "1.0.0", version: WANT, memberVersions: mv() });
  w = account({ pre: grp, subdomain: "pfx", copy: { bootstrap: () => jres(lagging) } });
  const last = await verifyServing(BASE, WANT, [], true, []);
  assert.deepEqual([last.confirmed, last.lags.length], [false, 1]);
  assert.ok(w.addressRequests.length > 50, "asked until the bound has passed");
  w.restore();
  w = account({ pre: grp, subdomain: "pfx", silentAddress: true });
  const dark = await verifyServing(BASE, WANT, [], true, []);
  assert.deepEqual([dark.confirmed, dark.lags.length], [false, 1]);
  w.restore();
});

test("R29: waitForAnswer answers an object after the third try and null when none comes; the deployment read, the roll-back body, and a refused roll-back is false", async () => {
  let w = account({ pre: grp, subdomain: "pfx", wakeAfter: 3 });
  assert.equal((await waitForAnswer(BASE)).ok, true);
  w.restore();
  w = account({ pre: grp, subdomain: "pfx", silentAddress: true });
  const waits = [];
  assert.equal(await waitForAnswer(BASE, (a, b) => waits.push([a, b])), null);
  assert.deepEqual(waits[0], [0, 300]);
  w.restore();
  w = account({ pre: grp, subdomain: "pfx", copy: { bootstrap: () => new Response("not json at all") } });
  assert.equal(await waitForAnswer(BASE), null, "an answer that is not an object is not an answer");
  w.restore();
  w = account({ pre: grp });
  assert.equal(await currentDeployment(session(), "A1", "grp"), "v-current-grp");
  assert.equal(await rollBack(session(), "A1", "grp", "v-old"), true);
  assert.deepEqual(w.rolledBack, [{ name: "grp", body: { strategy: "percentage", versions: [{ percentage: 100, version_id: "v-old" }] }, version: "v-old" }]);
  assert.equal(w.calls.at(-1).method, "POST");
  w.restore();
  sequence([cferr("no", 400)]);
  assert.equal(await rollBack(session(), "A1", "grp", "v-old"), false);
  assert.equal(await currentDeployment(session(), "A1", "grp"), null);
  sequence([cfok({ deployments: [] })]);
  assert.equal(await currentDeployment(session(), "A1", "grp"), null);
  sequence([cfok([{ versions: [{ version_id: "v-array" }] }])]);
  assert.equal(await currentDeployment(session(), "A1", "grp"), "v-array");
  sequence([cferr("Invalid access token", 401, 9109)]);
  await assert.rejects(currentDeployment(session(), "A1", "grp"), (e) => e.approveAgain === true);
  await assert.rejects(rollBack(session(), "A1", "grp", "v"), (e) => e.approveAgain === true);
});

const WORKERS = copyWorkers("grp", { man: { fleet: [{ member: "pdf-worker" }, { member: "extra-member" }, null, {}] } }, NAMES);
const job = (over = {}) => ({ id: "j1", name: "all", dataset: PER_REQUEST_DATASET, enabled: true, ...over });
const filter = (key, operator, value) => JSON.stringify({ where: { key, operator, value } });

test("R30: copyWorkers lists the plane and every member it binds or the release names, once", () => {
  assert.ok(WORKERS.includes("grp") && WORKERS.includes("pdf-worker-grp") && WORKERS.includes("extra-member-grp"));
  assert.equal(new Set(WORKERS).size, WORKERS.length);
  for (const [member] of BINDING_OF) assert.ok(WORKERS.includes(`${member}-grp`));
  assert.deepEqual(copyWorkers("grp", {}, NAMES).sort(), ["grp", ...[...BINDING_OF.keys()].map((m) => `${m}-grp`)].sort());
});

test("R30: a job over the dataset with no filter, a filter on other Workers, a filter naming them with !in, with in, an unparseable filter; a job over another dataset is ignored", async () => {
  const cases = [
    ["no filter", job(), true], ["filter on other workers (!in)", job({ filter: filter("ScriptName", "!in", ["other"]) }), true],
    ["!in naming them all", job({ filter: filter("ScriptName", "!in", WORKERS) }), false],
    ["!eq naming one only", job({ filter: filter("ScriptName", "!eq", "grp") }), true],
    ["in naming none of them", job({ filter: filter("ScriptName", "in", ["other"]) }), false],
    ["in naming one of them", job({ filter: filter("ScriptName", "in", ["grp", "other"]) }), true],
    ["unparseable", job({ filter: "{not json" }), true], ["another key", job({ filter: filter("Outcome", "!in", WORKERS) }), true],
    ["and with a ScriptName condition", job({ filter: JSON.stringify({ where: { and: [{ key: "Outcome", operator: "eq", value: "ok" }, { key: "ScriptName", operator: "!in", value: WORKERS }] } }) }), false],
    ["another dataset", job({ dataset: "http_requests" }), "ignored"],
  ];
  for (const [name, j, named] of cases) {
    const w = account({ logpush: [j] });
    const r = await logpushCheck(session(), "A1", WORKERS);
    if (named === "ignored") assert.equal(r.state, "clear", name);
    else assert.equal(r.state, named ? "named" : "clear", name);
    if (named === true) assert.deepEqual(r.jobs, [j], name);
    w.restore();
  }
  assert.equal(filterExcludes(null, WORKERS), false);
  assert.equal(filterExcludes({ where: { key: "ScriptName", operator: "!in", value: WORKERS } }, WORKERS), true, "an object filter reads like its string");
});

test("R30: logsStep draws the step logs, answers {lags, state}; clear is ok, named jobs are lags for the verdict and a failure on the step, a refused list is undetermined and never passed", async () => {
  let w = account({ logpush: [] });
  let emit = sink();
  assert.deepEqual(await logsStep(emit, session(), "A1", WORKERS), { lags: [], state: "clear" });
  assert.deepEqual(emit.events.map((e) => [e.k, e.id]), [["step", "logs"], ["ok", "logs"]]);
  w.restore();
  const jobs = [job({ id: "a", name: "first" }), job({ id: "b", name: "second", enabled: false }), job({ id: "c", dataset: "other" })];
  w = account({ logpush: jobs });
  emit = sink();
  const named = await logsStep(emit, session(), "A1", WORKERS);
  assert.equal(named.state, "named");
  assert.equal(named.lags.length, 2);
  assert.ok(named.lags[0].includes("first") && named.lags[0].includes("a") && named.lags[1].includes("second"));
  for (const n of WORKERS) assert.ok(named.lags[0].includes(n));
  assert.equal(emit.last("logs").k, "no");
  w.restore();
  for (const logpush of ["refused", "garbled"]) {
    w = account({ logpush });
    emit = sink();
    const r = await logsStep(emit, session(), "A1", WORKERS);
    assert.deepEqual(r, { lags: [], state: "undetermined" }, logpush);
    assert.equal(emit.last("logs").k, "no", "never passed");
    assert.ok(WORKERS.every((n) => emit.last("logs").label.includes(n)));
    w.restore();
  }
  assert.ok(w.calls.every((c) => !/account-logs/.test(JSON.stringify(c))), "no Logs scope is asked for");
});

test("R32: withByteLags joins the caller's lags to the verdict's, first; none leaves the verdict unchanged; with no verdict it makes one", () => {
  const verdict = { confirmed: true, lags: ["v1"], capable: true };
  assert.equal(withByteLags(verdict, [], true), verdict);
  assert.equal(withByteLags(null, [], true), null);
  assert.deepEqual(withByteLags(verdict, ["b1", "b2"], true), { confirmed: false, lags: ["b1", "b2", "v1"], capable: true });
  assert.deepEqual(withByteLags(null, ["b1"], false), { confirmed: false, lags: ["b1"], capable: false });
  const lagged = withByteLags({ confirmed: true, lags: [], capable: true }, ["only"], true);
  assert.equal(lagged.confirmed, false, "no success is claimed while one stands");
});

test("R33: ARMED_SIGNERS is read from RELEASE_KEYS as an array of its own; arming one for an act and restoring it leaves the list as shipped", () => {
  assert.deepEqual([...ARMED_SIGNERS], [...RELEASE_KEYS]);
  assert.notEqual(ARMED_SIGNERS, RELEASE_KEYS);
  assert.ok(Array.isArray(ARMED_SIGNERS) && steps.ARMED_SIGNERS === ARMED_SIGNERS);
  const shipped = [...ARMED_SIGNERS];
  armWith(SIGNER.line);
  assert.deepEqual([...ARMED_SIGNERS], [SIGNER.line]);
  assert.deepEqual([...RELEASE_KEYS], shipped, "arming changes this module's list only");
  restoreSigners();
  assert.deepEqual([...ARMED_SIGNERS], shipped);
});

test("R33: a fleet statement signed by another key is refused and named; the same signature is accepted by the one verifier", async () => {
  const rel = await release({ signWith: STRANGER });
  const w = account({ rel });
  armWith(SIGNER.line);
  const loaded = await loadFleet(await chosen(rel));
  assert.equal(typeof loaded.skip, "string", "signed by a key this installer does not trust");
  const good = await release({});
  const ok = await loadFleet(await chosen(good));
  assert.ok(Array.isArray(ok.members));
  const payload = fleetStatement({ version: good.version, plane: { sha256: good.manifest.sha256, bytes: good.manifest.bytes, asset: "bio-plane.bundled.mjs" }, members: good.manifest.fleet });
  const bytes = new TextEncoder().encode(payload);
  assert.equal((await verifySshsig(good.manifest.fleetSig, bytes, NS_FLEET, [SIGNER.line])).ok, true);
  assert.equal((await verifySshsig(rel.manifest.fleetSig, bytes, NS_FLEET, [SIGNER.line])).ok, false);
  assert.equal((await verifySshsig(rel.manifest.fleetSig, bytes, NS_FLEET, [STRANGER.line])).ok, true, "the signature is well formed: it is the key that is not trusted");
  w.restore();
});
