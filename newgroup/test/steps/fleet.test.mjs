/* installer-steps R16 to R25: the fleet, verified in full, held as hashes, and installed beside the plane. */
import test from "node:test";
import assert from "node:assert/strict";
import { fetchVerified, SourceUnavailable, loadFleet, installFleet, bindMembers, namesFor, ARMED_SIGNERS, containerDescriptor, containerClasses, workerDescriptor,
  vpcServiceOk, VPC_BINDING, VPC_MEMBER, objectMigrations, MEMBER_OBJECTS, imageWhy, lacksOf, IMAGE_UNPULLABLE, BINDING_OF, WAIT_BOUND_MINUTES,
  CONTAINER_PART, WORKER_PART, confirmContainers, withByteLags } from "../../src/steps/index.mjs";
import { word } from "../../../bio-plane/src/setup-words/index.mjs";
import { FLEET_BINDINGS } from "../../../bio-plane/src/setup-fleet.mjs";
import { session, sink, immediateTimers, account, heldCopy, sequence, release, chosen, sha, armWith, restoreSigners, SIGNER, STRANGER, VERSION,
  RUNNER, SCANNER, DESCRIPTOR, SCANNER_CLASSES, SCANNER_WORKER, AGENT_OBJECTS, IMAGE, VPC_ID, realFetch, jres, cferr, MEMBER_SRC, WASM } from "./world.mjs";

const NAMES = namesFor("grp");
const ALL = FLEET_BINDINGS.map(([m]) => m);
const CTX = { names: NAMES, scope: "containers.write", plan: { plan: "paid" } };
let restoreTimers;
test.beforeEach(() => { restoreTimers = immediateTimers(); armWith(SIGNER.line); });
test.afterEach(() => { restoreTimers(); restoreSigners(); globalThis.fetch = realFetch; });

/* A fleet world: the account serving `rel`, the plane held; the chosen release; the loaded fleet and its install. */
async function fleet({ rel: relOpts = {}, acct = {}, ctx = {}, install = true, relOverride = {} } = {}) {
  const rel = await release(relOpts);
  const w = account({ pre: { grp: [] }, rel, ...acct });
  const release_ = await chosen(rel, relOverride);
  const out = { w, rel, release_ };
  out.loaded = await loadFleet(release_);
  if (install) { out.emit = sink(); out.result = await installFleet(out.emit, session(), "A1", "grp", release_, out.loaded, { ...CTX, ...ctx }); }
  return out;
}
const uploadOf = (w, name) => w.puts.find((p) => p.name === name);
const byName = (meta, name) => meta.bindings.find((b) => b.name === name);

test("R16: 503 three times then 200 answers the bytes; 503 for the whole bound throws SourceUnavailable naming what; a 404 throws as a 404; a changed byte throws the integrity error", async () => {
  const want = await sha("abc");
  const waits = [];
  const down = new Response("unavailable", { status: 503 });
  let calls = sequence([down, down, down, new Response("abc")]);
  assert.equal(new TextDecoder().decode(await fetchVerified("https://x.test/f", want, "pdf-worker", (w) => waits.push(w))), "abc");
  assert.equal(calls.length, 4);
  assert.equal(waits.length, 3);
  assert.equal(calls[0].init.headers["user-agent"], "bio-installer");
  assert.equal(calls[0].init.redirect, "follow");
  sequence([down]);
  await assert.rejects(fetchVerified("https://x.test/f", want, "pdf-worker x"), (e) => e instanceof SourceUnavailable && e.source === true && e.message.startsWith("pdf-worker x") && e.cause.lasting === true);
  sequence([new Error("ENOTFOUND")]);
  await assert.rejects(fetchVerified("https://x.test/f", want, "m"), (e) => e.source === true);
  sequence([new Response("nope", { status: 404 })]);
  await assert.rejects(fetchVerified("https://x.test/f", want, "m"), (e) => !e.source && e.status === 404);
  sequence([new Response("abd")]);
  await assert.rejects(fetchVerified("https://x.test/f", want, "ocr-worker"), (e) => !e.source && e.message.includes("ocr-worker"));
});

test("R17: a signed fleet installs every member, container members first, and answers {done, left, imageLags, completed, containers}", async () => {
  const f = await fleet({ rel: { container: true, scanner: true } });
  assert.deepEqual(Object.keys(f.result).sort(), ["completed", "containers", "done", "imageLags", "left"]);
  assert.deepEqual([...f.result.done].sort(), [...ALL].sort());
  assert.deepEqual(f.result.left, []);
  assert.deepEqual(f.result.done.slice(0, 2).sort(), [RUNNER, SCANNER].sort(), "container members first: a member bound to a class is refused while the class is not there");
  assert.deepEqual(f.loaded.fleet, new Set(ALL));
  for (const m of ALL) assert.ok(uploadOf(f.w, `${m}-grp`), m);
  assert.equal(byName(uploadOf(f.w, "agent-worker-grp").meta, "PLANE").service, "grp", "a bio-plane service is bound to the slug");
  assert.equal(f.emit.last("fleet").k, "ok");
  assert.equal(f.emit.events[0].k, "step");
  f.w.restore();
});

const skipCases = async () => {
  const cases = {};
  cases.nomanifest = { relOverride: { man: null } };
  cases.nofleet = { rel: { fleet: false } };
  cases.nosigner = { before: () => armWith() };
  cases.nostatement = {};
  cases.tampered = { rel: { signedMembers: ["pdf-worker"] } };
  cases.otherplane = { relOverride: { sha: "0".repeat(64) } };
  cases.otherversion = { relOverride: { version: "0.0.1" } };
  cases.nosig = { rel: { fleetSig: "none" } };
  return cases;
};

test("R17: each failing condition installs none and says which; the install is not failed over it", async () => {
  const cases = await skipCases();
  const skips = new Map();
  for (const [name, c] of Object.entries(cases)) {
    c.before?.();
    const rel = await release(c.rel || {});
    if (name === "nostatement") delete rel.manifest.fleet[0].compat;
    const w = account({ pre: { grp: [] }, rel });
    const release_ = await chosen(rel, c.relOverride || {});
    const loaded = await loadFleet(release_);
    assert.equal(typeof loaded.skip, "string", name);
    assert.ok(loaded.skip.length > 10, name);
    skips.set(name, loaded.skip);
    const emit = sink();
    assert.equal(await installFleet(emit, session(), "A1", "grp", release_, loaded, CTX), undefined, name);
    assert.equal(w.puts.length, 0, `${name}: no member is installed`);
    assert.equal(emit.last("fleet").k, "ok", `${name}: the fleet step ends ok, never failed`);
    assert.equal(emit.last("fleet").label, loaded.skip);
    w.restore();
    armWith(SIGNER.line);
  }
  /* "says which": every cause names itself, and no two share a sentence unless they are the same cause (an unarmed list and no signature are different) */
  assert.ok(new Set(skips.values()).size >= 6, "the causes are told apart");
});

test("R17: an unknown part type leaves that member out alone; a failing member degrades alone and is named; a fleet statement with a member dropped does not verify", async () => {
  let f = await fleet({ rel: { badType: "ocr-worker" } });
  assert.deepEqual(f.result.left.map((l) => l.member), ["ocr-worker"]);
  assert.equal(f.result.left[0].why, word("installer.fleet.why.part"));
  assert.deepEqual([...f.result.done].sort(), ALL.filter((m) => m !== "ocr-worker").sort());
  f.w.restore();
  f = await fleet({ rel: { missing: "pdf-worker" } });
  assert.deepEqual(f.result.left.map((l) => l.member), ["pdf-worker"]);
  assert.equal(f.result.left[0].why, word("installer.fleet.why.http", { status: 404 }));
  assert.match(f.emit.last("fleet").label, new RegExp(word("installer.fleet.left.item", { member: "pdf-worker", why: word("installer.fleet.why.http", { status: 404 }) }).replace(/[()]/g, "\\$&")));
  assert.equal(f.result.done.length, ALL.length - 1);
  assert.match(f.emit.last("fleet").label, /pdf-worker/);
  f.w.restore();
  f = await fleet({ rel: { signedMembers: ALL.slice(1) }, install: false });
  assert.equal(typeof f.loaded.skip, "string");
  assert.equal(f.w.puts.length, 0);
  f.w.restore();
});

test("R17: installFleet throws only for an approveAgain or a lasting error", async () => {
  const rel = await release();
  const w = account({ pre: { grp: [] }, rel, expireAfter: 2 });
  const release_ = await chosen(rel);
  const loaded = await loadFleet(release_);
  await assert.rejects(installFleet(sink(), session(), "A1", "grp", release_, loaded, CTX), (e) => e.approveAgain === true);
  w.restore();
  const lasting = account({ pre: { grp: [] }, rel, cfFlaky: { status: 503, times: 1000 } });
  await assert.rejects(installFleet(sink(), session(), "A1", "grp", release_, loaded, CTX), (e) => e.lasting === true);
  lasting.restore();
});

const bigSrc = (n) => MEMBER_SRC + "/*" + "x".repeat(n) + "*/";
function bigBytes(value, seen = new Set(), path = "$") {
  if (value === null || typeof value !== "object" && typeof value !== "function") return [];
  if (seen.has(value)) return [];
  seen.add(value);
  if (value instanceof Uint8Array || value instanceof ArrayBuffer) return value.byteLength > 1024 ? [path] : [];
  if (typeof Blob !== "undefined" && value instanceof Blob) return value.size > 1024 ? [path] : [];
  if (typeof value === "function") return [];
  return Object.entries(value instanceof Map ? Object.fromEntries(value) : value instanceof Set ? [...value] : value)
    .flatMap(([k, v]) => bigBytes(v, seen, `${path}.${k}`));
}

test("R18: after loadFleet the result holds no Uint8Array, ArrayBuffer or Blob of more than 1 KB anywhere in its graph, and nothing was created", async () => {
  const f = await fleet({ rel: { container: true, scanner: true, memberSrc: Object.fromEntries(ALL.map((m) => [m, bigSrc(5000)])) }, install: false });
  assert.ok(f.loaded.members.length === ALL.length);
  assert.deepEqual(bigBytes(f.loaded), []);
  assert.equal(typeof f.loaded.members[0].bytes, "function");
  assert.equal(f.w.puts.length, 0, "the whole fleet is verified before anything is created");
  assert.equal(f.w.calls.filter((c) => c.method !== "GET").length, 0);
  /* control: the walk does see a held byte array */
  assert.deepEqual(bigBytes({ a: { b: new Uint8Array(2048) } }), ["$.a.b"]);
  f.w.restore();
});

test("R18: the source is asked twice for each bundle and each non-description part and once for each description; the second read is the one just before that member's upload", async () => {
  const f = await fleet({ rel: { container: true, scanner: true, memberSrc: Object.fromEntries(ALL.map((m) => [m, bigSrc(2000)])) } });
  const asked = (p) => f.w.sourceRequests.filter((x) => x === p).length;
  for (const m of ALL) assert.equal(asked(`${m}.bundled.mjs`), 2, m);
  assert.equal(asked("ocr-worker/assets/x.wasm"), 2);
  assert.equal(asked("agent-runner/container.json"), 1);
  for (const p of ["container/FileScanner.json", "container/SafeViewRenderer.json", "worker.json"]) assert.equal(asked(`file-scanner/${p}`), 1, p);
  assert.equal(asked("bio-plane.bundled.mjs"), 0);
  /* order: every first read precedes every upload; each second read follows the first and precedes its member's own upload */
  const idx = (pred) => f.w.calls.map((c, i) => (pred(c) ? i : -1)).filter((i) => i >= 0);
  const firstPut = Math.min(...idx((c) => c.method === "PUT" && /\/workers\/scripts\//.test(c.u)));
  for (const m of ALL) {
    const reads = idx((c) => c.u.endsWith(`/${m}.bundled.mjs`));
    const put = idx((c) => c.method === "PUT" && c.u.endsWith(`/workers/scripts/${m}-grp`))[0];
    assert.ok(reads[0] < firstPut, `${m}: first read before any creation`);
    assert.ok(reads[1] > reads[0] && reads[1] < put, `${m}: second read before its upload`);
  }
  /* the bytes uploaded are the second read's (equal to the signed ones, or the hash check would have left the member out) */
  for (const m of ALL) assert.equal(await uploadOf(f.w, `${m}-grp`).form.get("index.mjs").text(), bigSrc(2000));
  assert.equal(await uploadOf(f.w, "ocr-worker-grp").form.get("assets/x.wasm").arrayBuffer().then((b) => b.byteLength), WASM.length);
  assert.equal(uploadOf(f.w, "agent-runner-grp").form.get("container.json"), null, "a description is never uploaded as a module");
  f.w.restore();
});

test("R18 control: a bundle that changes between the two reads leaves that member out (failed its integrity check) and uploads nothing of it while the others install", async () => {
  const f = await fleet({ acct: { sourceChange: (p, n) => (p === "ocr-worker.bundled.mjs" && n >= 2 ? new Response("changed") : null) } });
  assert.deepEqual(f.result.left.map((l) => l.member), ["ocr-worker"]);
  assert.equal(f.result.left[0].why, word("installer.fleet.why.integrity"));
  assert.equal(uploadOf(f.w, "ocr-worker-grp"), undefined);
  assert.equal(f.result.done.length, ALL.length - 1);
  assert.equal(f.emit.last("fleet").k, "ok");
  f.w.restore();
});

test("R18 control: a source that fails at the second read leaves that member out, named, and installFleet throws nothing; one that fails at the first still throws SourceUnavailable with nothing created", async () => {
  const f = await fleet({ acct: { sourceChange: (p, n) => (p === "pdf-worker.bundled.mjs" && n >= 2 ? new Response("unavailable", { status: 503 }) : null) } });
  assert.deepEqual(f.result.left.map((l) => l.member), ["pdf-worker"]);
  assert.equal(f.result.left[0].why, word("installer.fleet.why.refetch"));
  assert.equal(uploadOf(f.w, "pdf-worker-grp"), undefined);
  assert.equal(f.result.done.length, ALL.length - 1);
  f.w.restore();
  const rel = await release();
  const w = account({ pre: { grp: [] }, rel, sourceDown: true });
  await assert.rejects(loadFleet(await chosen(rel)), (e) => e instanceof SourceUnavailable);
  assert.equal(w.puts.length, 0);
  w.restore();
});

test("R18: a part that cannot be completed at the first read ends the run; the ocr part is read twice and a changed part is left out like a bundle", async () => {
  const f = await fleet({ acct: { sourceChange: (p, n) => (p === "ocr-worker/assets/x.wasm" && n >= 2 ? new Response("other") : null) } });
  assert.deepEqual(f.result.left.map((l) => l.member), ["ocr-worker"]);
  assert.equal(uploadOf(f.w, "ocr-worker-grp"), undefined);
  f.w.restore();
});

test("R19: a member added gives one re-upload bound to all; none added and no hosts, none; hosts alone give one upload carrying OWN_HOSTS; a refused re-upload is named and the members stay", async () => {
  const held = heldCopy({ slug: "grp", version: VERSION, members: ["agent-worker", "pdf-worker", "ocr-worker"] });
  const rel = await release({ fleet: false });
  const release_ = await chosen(rel);
  const opts = { withR2: true, names: NAMES, daemon: "d", ownHosts: ["grp.pfx.workers.dev"] };
  let w = account({ ...held, preClasses: {} });
  const emit = sink();
  const r = await bindMembers(emit, session(), "A1", "grp", release_, ["agent-worker"], { done: ["pdf-worker"] }, { ...opts, writeHosts: false });
  assert.deepEqual(r, { bound: ["agent-worker", "pdf-worker"], unbound: [], put: true, hosts: false });
  assert.equal(w.puts.length, 1);
  assert.deepEqual(w.puts[0].meta.bindings.filter((b) => b.type === "service" && b.name !== "SELF").map((b) => b.name), ["AGENT_WORKER", "PDF_WORKER"]);
  assert.equal(emit.events[0].id, "bind");
  assert.equal(emit.last("bind").k, "ok");
  w.puts.length = 0;
  const none = sink();
  assert.deepEqual(await bindMembers(none, session(), "A1", "grp", release_, ["agent-worker"], { done: [] }, { ...opts, writeHosts: false }), { bound: ["agent-worker"], unbound: [] });
  assert.equal(w.puts.length, 0);
  assert.equal(none.events.length, 0, "no upload, no step");
  const hosts = await bindMembers(sink(), session(), "A1", "grp", release_, ["agent-worker"], { done: [] }, { ...opts, writeHosts: true });
  assert.deepEqual([hosts.put, hosts.hosts], [true, true]);
  assert.equal(w.puts.length, 1);
  assert.equal(byName(w.puts[0].meta, "OWN_HOSTS").text, "grp.pfx.workers.dev");
  w.restore();
  w = account({ ...held, preClasses: {}, refuseAllPlane: true });
  const refused = sink();
  const bad = await bindMembers(refused, session(), "A1", "grp", release_, ["agent-worker"], { done: ["pdf-worker"] }, { ...opts, writeHosts: true });
  assert.deepEqual([bad.bound, bad.unbound, bad.hosts], [["agent-worker"], ["pdf-worker"], false]);
  assert.equal(refused.last("bind").k, "no");
  assert.ok(w.scripts.has("pdf-worker-grp"), "the members stay installed");
  w.restore();
});

test("R20: a release whose container descriptors name ghcr.io images installs every other member and leaves both out as 'out', never a lag", async () => {
  const ghcr = "ghcr.io/civicos/agent-runner@sha256:" + "a".repeat(64);
  const f = await fleet({ rel: { container: true, scanner: true, descriptor: { ...DESCRIPTOR, image: ghcr }, scannerParts: Object.fromEntries(SCANNER_CLASSES.map((c) => [`container/${c.class_name}.json`, { ...c, image: "ghcr.io/civicos/" + c.class_name.toLowerCase() + "@sha256:" + "d".repeat(64) }])) } });
  assert.deepEqual(f.result.left.map((l) => l.member).sort(), [RUNNER, SCANNER].sort());
  assert.ok(f.result.left.every((l) => l.out === true && l.why === word("installer.fleet.why.unpullable")));
  assert.equal(imageWhy(ghcr), IMAGE_UNPULLABLE);
  assert.equal(f.result.left.find((l) => l.member === SCANNER).lacks, lacksOf(SCANNER));
  assert.ok(f.emit.last("fleet").label.includes(lacksOf(SCANNER)), "what the copy then lacks is said beside the reasons");
  assert.equal(f.result.left.find((l) => l.member === RUNNER).lacks, undefined);
  assert.equal(lacksOf(RUNNER), "", "the assistant lacks nothing without agent-runner");
  assert.equal(f.result.done.length, ALL.length - 2);
  assert.equal(f.result.imageLags.length, 0);
  f.w.restore();
});

test("R20 control: a docker.io descriptor installs; each container class gets an application under the copy's names and the class is bound cross-script into agent-worker", async () => {
  const f = await fleet({ rel: { container: true, scanner: true } });
  assert.deepEqual(f.w.apps.map((a) => a.name).sort(), ["agent-runner-grp", "file-scanner-filescanner-grp", "file-scanner-safeviewrenderer-grp"]);
  for (const a of f.w.apps) assert.deepEqual([a.scheduling_policy, a.instances], ["default", 0]);
  assert.equal(f.w.apps.find((a) => a.name === "agent-runner-grp").configuration.image, IMAGE);
  const runner = uploadOf(f.w, "agent-runner-grp").meta;
  assert.deepEqual(runner.migrations, { new_tag: "v1", new_sqlite_classes: ["AgentRunner"] });
  const worker = uploadOf(f.w, "agent-worker-grp").meta;
  assert.deepEqual(byName(worker, "RUNNER"), { type: "durable_object_namespace", name: "RUNNER", class_name: "AgentRunner", script_name: "agent-runner-grp" });
  const scanner = uploadOf(f.w, "file-scanner-grp").meta;
  assert.deepEqual(scanner.migrations.new_sqlite_classes, ["FileScanner", "SafeViewRenderer"]);
  assert.deepEqual(byName(scanner, "SCANNER"), { type: "durable_object_namespace", name: "SCANNER", class_name: "FileScanner" });
  assert.deepEqual(byName(scanner, "RENDERER"), { type: "durable_object_namespace", name: "RENDERER", class_name: "SafeViewRenderer" });
  f.w.restore();
});

const FRAGMENT = { nopermission: word("installer.fleet.why.nopermission"), permissionunknown: word("installer.fleet.why.permissionunknown"),
  freeplan: word("installer.fleet.why.freeplan"), planunknown: word("installer.fleet.why.planunknown") };
test("R20: each condition in turn leaves the container members out: no Containers scope, an unreadable Containers API, Workers Free, a plan not verified", async () => {
  const cases = [
    { ctx: { scope: "workers-scripts.write" }, why: "nopermission" },
    { ctx: { scope: null }, acct: { containers: "read" }, why: "permissionunknown" },
    { ctx: { plan: { plan: "free" } }, why: "freeplan" },
    { ctx: { plan: { plan: "unknown", detail: "no answer" } }, why: "planunknown" },
  ];
  for (const c of cases) {
    const f = await fleet({ rel: { container: true, scanner: true }, ctx: c.ctx, acct: c.acct });
    assert.deepEqual(f.result.left.map((l) => l.member).sort(), [RUNNER, SCANNER].sort(), JSON.stringify(c.ctx));
    assert.ok(f.result.left.every((l) => l.out === true && l.why === FRAGMENT[c.why]));
    assert.equal(f.w.apps.length, 0);
    f.w.restore();
  }
  const f = await fleet({ rel: { container: true }, ctx: { scope: null, plan: null } });
  assert.ok(f.result.done.includes(RUNNER), "one read of the Containers API decides when the token response states no scope, and the plan is established by the probe");
  f.w.restore();
});

test("R20: a descriptor that does not read, a part not named for its class, or a class described twice leaves the member out; an attempted upload that fails is not 'out'", async () => {
  let f = await fleet({ rel: { container: true, descriptor: "{not json" } });
  assert.deepEqual(f.result.left.map((l) => l.member), [RUNNER]);
  assert.equal(f.result.left[0].out, true);
  f.w.restore();
  f = await fleet({ rel: { container: true }, acct: { containers: "create" } });
  const failed = f.result.left.find((l) => l.member === RUNNER);
  assert.ok(failed && failed.out === undefined, "an upload attempted and failed is a failure of the verdict, not a part left out");
  f.w.restore();
  const enc = (o) => new TextEncoder().encode(JSON.stringify(o));
  const why = (o) => containerDescriptor(enc(o)).why;
  assert.equal(why({ ...DESCRIPTOR, scheduling_policy: "other" }), word("installer.fleet.why.container.policy"));
  assert.equal(why({ ...DESCRIPTOR, max_instances: 0 }), word("installer.fleet.why.container.size"));
  assert.equal(why({ ...DESCRIPTOR, instance_type: "Bad Size" }), word("installer.fleet.why.container.size"));
  assert.equal(why({ ...DESCRIPTOR, class_name: "1bad" }), word("installer.fleet.why.container.class"));
  assert.equal(why({ ...DESCRIPTOR, bind: [{ member: "m", binding: "lower" }] }), word("installer.fleet.why.container.bindings"));
  assert.equal(why([]), word("installer.fleet.why.container.parse"));
  assert.equal(containerDescriptor(new TextEncoder().encode("{x")).why, word("installer.fleet.why.container.parse"));
  assert.equal(why({ ...DESCRIPTOR, image: "docker.io/x/y:latest" }), word("installer.fleet.why.unpinned"));
  assert.equal(why({ ...DESCRIPTOR, image: "ghcr.io/x/y@sha256:" + "a".repeat(64) }), word("installer.fleet.why.unpullable"));
  assert.deepEqual(containerDescriptor(enc(DESCRIPTOR)).d.bind, DESCRIPTOR.bind);
  const parts = SCANNER_CLASSES.map((c) => ({ path: `container/${c.class_name}.json` }));
  const bytes = Object.fromEntries(SCANNER_CLASSES.map((c) => [`container/${c.class_name}.json`, enc(c)]));
  assert.equal(containerClasses(parts, (p) => bytes[p]).classes.length, 2);
  assert.equal(containerClasses([{ path: "container/Other.json" }, parts[1]], (p) => bytes[p] ?? bytes["container/FileScanner.json"]).why, word("installer.fleet.why.container.path"));
  assert.equal(containerClasses([{ path: "x.json" }, parts[1]], (p) => bytes[p]).why, word("installer.fleet.why.container.path"));
  assert.equal(containerClasses([parts[0], parts[0]], (p) => bytes[p]).why, word("installer.fleet.why.container.duplicate"));
  assert.equal(CONTAINER_PART, "Container"); assert.equal(WORKER_PART, "Worker");
});

test("R20: a rollout that keeps the old image is asked once more and then reported as a lag naming the container", async () => {
  const old = "docker.io/civicos/agent-runner@sha256:" + "b".repeat(64);
  const f = await fleet({ rel: { container: true }, acct: { rolloutKeepsImage: true, preClasses: { "agent-runner-grp": ["AgentRunner"] }, pre: { grp: [], "agent-runner-grp": [] },
    preApps: [{ id: "app1", name: "agent-runner-grp", durable_objects: { namespace_id: "ns-agent-runner-grp-AgentRunner" }, configuration: { image: old } }] } });
  assert.equal(f.w.rollouts.length, 2);
  assert.equal(f.result.imageLags.length, 1);
  assert.ok(f.result.imageLags[0].includes("agent-runner-grp"));
  assert.ok(f.result.done.includes(RUNNER), "the member is installed; the image lag goes to the verdict, not to success");
  f.w.restore();
  const ok = await fleet({ rel: { container: true }, acct: { preClasses: { "agent-runner-grp": ["AgentRunner"] }, pre: { grp: [], "agent-runner-grp": [] },
    preApps: [{ id: "app1", name: "agent-runner-grp", durable_objects: { namespace_id: "ns-agent-runner-grp-AgentRunner" }, configuration: { image: old } }] } });
  assert.equal(ok.w.rollouts.length, 1);
  assert.deepEqual(ok.result.imageLags, []);
  assert.deepEqual(ok.result.completed.includes(RUNNER), true);
  ok.w.restore();
});

test("R21: a member whose bundle states its limits is uploaded with exactly those; none stated, none sent; an unreadable statement leaves it out and names it", async () => {
  const f = await fleet({ rel: { memberSrc: { "sheet-worker": MEMBER_SRC + ` const L = "bio-member-limits/1 cpu_ms=300000";`, "pdf-worker": MEMBER_SRC + ` const L = "bio-member-limits/1 Z=1";` } } });
  assert.deepEqual(uploadOf(f.w, "sheet-worker-grp").meta.limits, { cpu_ms: 300000 });
  assert.equal("limits" in uploadOf(f.w, "agent-worker-grp").meta, false);
  assert.deepEqual(f.result.left.map((l) => l.member), ["pdf-worker"]);
  assert.equal(uploadOf(f.w, "pdf-worker-grp"), undefined);
  f.w.restore();
});

test("R22: file-scanner is installed with its CAPTURES bucket, its two classes, its schedule from the Worker part, and SECURITY_VPC only as R23 says", async () => {
  const f = await fleet({ rel: { scanner: true } });
  const meta = uploadOf(f.w, "file-scanner-grp").meta;
  assert.deepEqual(byName(meta, "CAPTURES"), { type: "r2_bucket", name: "CAPTURES", bucket_name: "bio-captures-grp" });
  assert.equal(byName(meta, VPC_BINDING), undefined);
  assert.deepEqual(f.w.schedules.get("file-scanner-grp"), ["17 4 * * *"]);
  assert.equal(f.w.schedules.size, 1, "no other member is given a schedule");
  assert.deepEqual(byName(uploadOf(f.w, "agent-worker-grp").meta, "FILE_SCANNER"), undefined, "the plane, not agent-worker, is bound to the scanner");
  assert.equal(BINDING_OF.get("file-scanner"), "FILE_SCANNER");
  f.w.restore();
});

test("R22: a release without the Worker part installs the member without bucket or schedule and the step names what it lacks; a refused schedule is named and the member stays", async () => {
  let f = await fleet({ rel: { scanner: true, scannerWorker: null } });
  assert.ok(f.result.done.includes(SCANNER));
  assert.equal(byName(uploadOf(f.w, "file-scanner-grp").meta, "CAPTURES"), undefined);
  assert.equal(f.w.schedules.size, 0);
  assert.match(f.emit.last("fleet").label, /file-scanner/);
  const withPart = await fleet({ rel: { scanner: true } });
  assert.ok(f.emit.last("fleet").label.length > withPart.emit.last("fleet").label.length, "what it lacks is said");
  f.w.restore(); withPart.w.restore();
  f = await fleet({ rel: { scanner: true }, acct: { refuseSchedules: true } });
  assert.ok(f.result.done.includes(SCANNER));
  assert.ok(f.emit.last("fleet").label.includes("17 4 * * *"), "the refused schedule is named");
  f.w.restore();
  const enc = (o) => new TextEncoder().encode(typeof o === "string" ? o : JSON.stringify(o));
  assert.deepEqual(workerDescriptor(enc(SCANNER_WORKER)), { ok: true, d: { r2_buckets: [{ binding: "CAPTURES", bucket: "captures" }], crons: ["17 4 * * *"] } });
  for (const bad of ["{x", "[]", { r2_buckets: [{ binding: "CAPTURES", bucket: "evidence" }] }, { r2_buckets: [{ binding: "lower", bucket: "captures" }] },
    { crons: ["* * * *"] }, { crons: ["* * * * *", "* * * * *", "* * * * *", "* * * * *"] }, { crons: "nope" }]) {
    assert.equal(workerDescriptor(enc(bad)).ok, false, JSON.stringify(bad));
  }
  assert.deepEqual(workerDescriptor(enc({})), { ok: true, d: { r2_buckets: [], crons: [] } });
});

test("R23: a good VPC id binds SECURITY_VPC; a refused one installs the member without it and says so; an id with no scanner installed is said; no id, no binding and no note", async () => {
  assert.equal(vpcServiceOk(VPC_ID), true);
  assert.equal(vpcServiceOk("01234567-89ab-cdef-0123-456789abcdef"), true);
  for (const bad of [undefined, "", "xyz", VPC_ID + "0", 5]) assert.equal(vpcServiceOk(bad), false);
  assert.equal(VPC_MEMBER, SCANNER);
  let f = await fleet({ rel: { scanner: true }, ctx: { vpc: VPC_ID } });
  assert.deepEqual(byName(uploadOf(f.w, "file-scanner-grp").meta, VPC_BINDING), { type: "vpc_service", name: VPC_BINDING, service_id: VPC_ID });
  assert.ok(f.emit.last("fleet").label.includes(word("installer.fleet.note.vpc.connected", { member: SCANNER })), "the connection is said");
  f.w.restore();
  f = await fleet({ rel: { scanner: true }, ctx: { vpc: VPC_ID }, acct: { refuseVpc: true } });
  assert.ok(f.result.done.includes(SCANNER));
  assert.equal(byName(f.w.puts.filter((p) => p.name === "file-scanner-grp").at(-1).meta, VPC_BINDING), undefined);
  assert.equal(f.w.puts.filter((p) => p.name === "file-scanner-grp").length, 2, "uploaded again without it");
  assert.ok(f.emit.last("fleet").label.includes(word("installer.fleet.note.vpc.refused", { member: SCANNER, said: "VPC service not found or not permitted <b>by the fake</b>" })));
  f.w.restore();
  f = await fleet({ rel: { members: ALL.filter((m) => m !== SCANNER) }, ctx: { vpc: VPC_ID } });
  assert.ok(f.emit.last("fleet").label.includes(word("installer.fleet.note.vpc.unused", { member: SCANNER })), "an id named when no scanner was installed is said");
  assert.equal(f.w.puts.some((p) => byName(p.meta, VPC_BINDING)), false);
  f.w.restore();
  f = await fleet({ rel: { scanner: true } });
  assert.ok(!f.emit.last("fleet").label.includes(word("installer.fleet.note.vpc.unused", { member: SCANNER })) && !f.emit.last("fleet").label.includes(word("installer.fleet.note.vpc.connected", { member: SCANNER })));
  assert.equal(f.w.puts.some((p) => byName(p.meta, VPC_BINDING)), false);
  f.w.restore();
});

test("R24: the upload of agent-worker carries SEGMENTS and CHECKS with both migrations, in order; a script holding v1 gets v2 alone", async () => {
  const f = await fleet();
  const meta = uploadOf(f.w, "agent-worker-grp").meta;
  assert.deepEqual(byName(meta, "SEGMENTS"), { type: "durable_object_namespace", name: "SEGMENTS", class_name: "SegmentDriver" });
  assert.deepEqual(byName(meta, "CHECKS"), { type: "durable_object_namespace", name: "CHECKS", class_name: "CheckRecord" });
  assert.deepEqual(meta.migrations, { new_tag: "v2", steps: [{ new_sqlite_classes: ["SegmentDriver"] }, { new_sqlite_classes: ["CheckRecord"] }] });
  for (const m of ALL.filter((x) => x !== "agent-worker")) assert.equal(uploadOf(f.w, `${m}-grp`).meta.migrations, undefined, m);
  f.w.restore();
  const held = await fleet({ acct: { pre: { grp: [], "agent-worker-grp": [] }, preTags: { "agent-worker-grp": "v1" }, preClasses: { "agent-worker-grp": ["SegmentDriver"] } } });
  assert.deepEqual(uploadOf(held.w, "agent-worker-grp").meta.migrations, { old_tag: "v1", new_tag: "v2", steps: [{ new_sqlite_classes: ["CheckRecord"] }] });
  held.w.restore();
  assert.deepEqual(objectMigrations("v2", AGENT_OBJECTS), null);
  assert.equal(objectMigrations(null, undefined), null, "control: a member stating no objects gets no migration");
  assert.deepEqual(objectMigrations(null, AGENT_OBJECTS).steps.length, 2);
});

test("R37: a member's Durable Objects are those its signed Worker part states and no others: a part stating fewer deploys fewer, and a part stating none deploys none", async () => {
  let f = await fleet({ rel: { agentWorker: { r2_buckets: [], crons: [], durable_objects: { bindings: [{ name: "SEGMENTS", class_name: "SegmentDriver" }],
    migrations: [{ tag: "v1", classes: ["SegmentDriver"] }] } } } });
  let meta = uploadOf(f.w, "agent-worker-grp").meta;
  assert.deepEqual(meta.bindings.filter((b) => b.type === "durable_object_namespace"), [{ type: "durable_object_namespace", name: "SEGMENTS", class_name: "SegmentDriver" }],
    "the bindings are the part's, not the remembered two");
  assert.deepEqual(meta.migrations, { new_tag: "v1", steps: [{ new_sqlite_classes: ["SegmentDriver"] }] });
  f.w.restore();
  f = await fleet({ rel: { agentWorker: { r2_buckets: [], crons: [] } } });
  meta = uploadOf(f.w, "agent-worker-grp").meta;
  assert.equal(meta.bindings.some((b) => b.type === "durable_object_namespace"), false, "control: a part stating none binds none");
  assert.equal(meta.migrations, undefined, "control: and migrates none, never a remembered one");
  f.w.restore();
  assert.deepEqual(MEMBER_OBJECTS, {}, "the installer's own table is gone");
});

test("R25: an instance_type in container.json is passed to the create call and to a rollout; none is created without the field; an unreadable one leaves the member out", async () => {
  let f = await fleet({ rel: { container: true, descriptor: { ...DESCRIPTOR, instance_type: "standard-1" } } });
  assert.equal(f.w.apps[0].configuration.instance_type, "standard-1");
  f.w.restore();
  f = await fleet({ rel: { container: true } });
  assert.equal("instance_type" in f.w.apps[0].configuration, false);
  f.w.restore();
  f = await fleet({ rel: { container: true, descriptor: { ...DESCRIPTOR, instance_type: "standard-1" } }, acct: { pre: { grp: [], "agent-runner-grp": [] }, preClasses: { "agent-runner-grp": ["AgentRunner"] },
    preApps: [{ id: "app1", name: "agent-runner-grp", durable_objects: { namespace_id: "ns-agent-runner-grp-AgentRunner" }, configuration: { image: IMAGE } }] } });
  assert.equal(f.w.rollouts[0].target_configuration.instance_type, "standard-1");
  f.w.restore();
  f = await fleet({ rel: { container: true, descriptor: { ...DESCRIPTOR, instance_type: "Standard 1" } } });
  assert.deepEqual(f.result.left.map((l) => l.member), [RUNNER]);
  assert.equal(f.w.apps.length, 0);
  f.w.restore();
});

test("R20 (F10): a class a later release adds to an installed container member is created by a migration from the tag it holds; none when it holds every class", async () => {
  const held = (classes) => ({ pre: { grp: [], "file-scanner-grp": [] }, preClasses: { "file-scanner-grp": classes }, preTags: { "file-scanner-grp": "v1" } });
  let f = await fleet({ rel: { scanner: true }, acct: held(["FileScanner"]) });
  assert.deepEqual(uploadOf(f.w, "file-scanner-grp").meta.migrations, { old_tag: "v1", new_tag: "v2", new_sqlite_classes: ["SafeViewRenderer"] });
  assert.ok(f.result.done.includes(SCANNER));
  f.w.restore();
  f = await fleet({ rel: { scanner: true }, acct: held(["FileScanner", "SafeViewRenderer"]) });
  assert.equal(uploadOf(f.w, "file-scanner-grp").meta.migrations, undefined, "control: nothing to create, no migration");
  f.w.restore();
});

test("R24 (F10): a member's Durable Objects are read from its signed Worker part when it states them; a malformed statement leaves the member out", async () => {
  const objects = { bindings: [{ name: "EXTRA", class_name: "ExtraObj" }], migrations: [{ tag: "v1", classes: ["FileScanner", "SafeViewRenderer"] }, { tag: "v2", classes: ["ExtraObj"] }] };
  const held = { pre: { grp: [], "file-scanner-grp": [] }, preClasses: { "file-scanner-grp": ["FileScanner", "SafeViewRenderer"] }, preTags: { "file-scanner-grp": "v1" } };
  let f = await fleet({ rel: { scanner: true, scannerWorker: { ...SCANNER_WORKER, durable_objects: objects } }, acct: held });
  const meta = uploadOf(f.w, "file-scanner-grp").meta;
  assert.deepEqual(meta.bindings.find((b) => b.name === "EXTRA"), { type: "durable_object_namespace", name: "EXTRA", class_name: "ExtraObj" });
  assert.deepEqual(meta.migrations, { old_tag: "v1", new_tag: "v2", steps: [{ new_sqlite_classes: ["ExtraObj"] }] });
  assert.equal(byName(uploadOf(f.w, "agent-worker-grp").meta, "SEGMENTS").class_name, "SegmentDriver", "agent-worker deploys the objects its own part states");
  f.w.restore();
  assert.deepEqual(objectMigrations("v1", objects), { old_tag: "v1", new_tag: "v2", steps: [{ new_sqlite_classes: ["ExtraObj"] }] });
  f = await fleet({ rel: { scanner: true, scannerWorker: { ...SCANNER_WORKER, durable_objects: { bindings: [{ name: "lower", class_name: "X" }], migrations: [] } } } });
  assert.deepEqual(f.result.left.map((l) => l.member), [SCANNER]);
  assert.equal(f.result.left[0].why, word("installer.fleet.why.program"));
  f.w.restore();
});

/* F5: whether the platform could pull the image, read from the application after the create or the rollout. */
const waitsOf = () => { const waits = []; return { waits, onWait: (w, b) => waits.push([w, b]) }; };
async function runnerFleet(acct, onWait = null) {
  const rel = await release({ container: true });
  const w = account({ pre: { grp: [] }, rel, ...acct });
  const release_ = await chosen(rel);
  const loaded = await loadFleet(release_);
  const emit = sink();
  const result = await installFleet(emit, session(onWait), "A1", "grp", release_, loaded, CTX);
  return { w, emit, result, release_ };
}
const OLD_APP = { id: "app1", name: "agent-runner-grp", durable_objects: { namespace_id: "ns-agent-runner-grp-AgentRunner" }, configuration: { image: "docker.io/civicos/agent-runner@sha256:" + "b".repeat(64) } };
const HELD_RUNNER = { preClasses: { "agent-runner-grp": ["AgentRunner"] }, pre: { grp: [], "agent-runner-grp": [] }, preApps: [OLD_APP] };

test("R20 (F5): an instance that failed to start, or a rollout that failed, leaves the member out as pullfailed, named with what it lacks, after its upload was attempted", async () => {
  for (const [how, acct] of [["health", { pullFails: "health" }], ["rollout", { ...HELD_RUNNER, pullFails: "rollout" }]]) {
    const f = await runnerFleet(acct);
    const left = f.result.left.find((l) => l.member === RUNNER);
    assert.ok(left, how);
    assert.equal(left.why, word("installer.fleet.why.pullfailed"), how);
    assert.notEqual(left.why, word("installer.fleet.why.unpullable"), "placed but not started is not 'not published'");
    assert.equal(left.out, undefined, "the upload was attempted: a failure of the verdict, not a part left out");
    assert.ok(!f.result.done.includes(RUNNER), how);
    assert.ok(f.w.puts.some((p) => p.name === "agent-runner-grp"), "its Worker was uploaded");
    assert.ok(!f.emit.last("fleet").label.includes("installer-steps"), how);
    f.w.restore();
  }
  const ok = await runnerFleet({});
  assert.ok(ok.result.done.includes(RUNNER) && ok.result.left.length === 0, "control: a healthy application installs");
  ok.w.restore();
});

test("R20 (F5): it waits, drawn through onWait, only while the rollout is pending or an instance is starting; an application that starts nothing is not waited on", async () => {
  const quiet = waitsOf();
  const none = await runnerFleet({}, quiet.onWait);
  assert.deepEqual(quiet.waits, [], "no wait when nothing is pending");
  assert.ok(none.w.appReads <= 2);
  none.w.restore();
  const slow = waitsOf();
  const f = await runnerFleet({ startingFor: 3 }, slow.onWait);
  assert.equal(slow.waits.length, 3, "one announced wait for each read that found it starting");
  assert.ok(f.result.done.includes(RUNNER), "a pull that completes after waiting installs");
  f.w.restore();
  const never = waitsOf();
  const g = await runnerFleet({ startingFor: 10000 }, never.onWait);
  assert.equal(never.waits.length, WAIT_BOUND_MINUTES * 60 / 5, "nominal waiting stops at the bound");
  assert.ok(g.result.done.includes(RUNNER), "a start still pending at the bound is not a pull failure");
  g.w.restore();
});

test("R20 (S9): placed applications are answered as {member, id, appName, config}, and a member still on the old build after placement is restarted by a further rollout and then confirmed", async () => {
  const VERSIONED = { pre: { grp: [{ type: "plain_text", name: "VERSION", text: VERSION }] } };
  const f = await runnerFleet({ ...VERSIONED, memberServes: { [RUNNER]: 1 } });
  assert.deepEqual(f.result.containers, [{ member: RUNNER, id: "app1", appName: "agent-runner-grp", config: { image: IMAGE } }]);
  assert.equal(f.w.rollouts.length, 0, "created, not rolled out");
  const r = await confirmContainers(session(), "A1", "https://grp.grp.workers.dev", f.release_, f.result);
  assert.deepEqual([r.confirmed, r.restarted, r.lags], [[RUNNER], [RUNNER], []]);
  assert.equal(f.w.rollouts.length, 1);
  assert.deepEqual(f.w.rollouts[0].target_configuration, { image: IMAGE }, "the restart rolls out to the release's own configuration");
  f.w.restore();
  const fine = await runnerFleet({ ...VERSIONED, memberServes: { [RUNNER]: 0 } });
  const again = await confirmContainers(session(), "A1", "https://grp.grp.workers.dev", fine.release_, fine.result);
  assert.deepEqual([again.confirmed, again.restarted, again.lags], [[RUNNER], [], []], "control: a member already on the release is not restarted");
  assert.equal(fine.w.rollouts.length, 0);
  fine.w.restore();
});

test("R20 (S9): a member still old after the restart is the named lag 'still runs <version>', never success; a member the plane does not report is no reading and is not restarted", async () => {
  const VERSIONED = { pre: { grp: [{ type: "plain_text", name: "VERSION", text: VERSION }] } };
  const f = await runnerFleet({ ...VERSIONED, memberServes: { [RUNNER]: 99 } });
  const r = await confirmContainers(session(), "A1", "https://grp.grp.workers.dev", f.release_, f.result);
  assert.deepEqual(r.confirmed, []);
  assert.deepEqual(r.restarted, [RUNNER]);
  assert.deepEqual(r.lags, [word("installer.lag.member.version", { name: RUNNER, version: "0.0.1" })]);
  assert.equal(f.w.rollouts.length, 1, "one restart, not a loop");
  const joined = withByteLags({ confirmed: false, lags: r.lags, capable: true }, r.lags, true);
  assert.deepEqual(joined.lags, r.lags, "the same sentence in the verdict is said once");
  f.w.restore();
  const silent = await runnerFleet({ ...VERSIONED });
  const none = await confirmContainers(session(), "A1", "https://grp.grp.workers.dev", silent.release_, silent.result);
  assert.deepEqual([none.confirmed, none.restarted, none.lags], [[RUNNER], [], []]);
  assert.equal(silent.w.rollouts.length, 0);
  const left = await runnerFleet({ pullFails: "health" });
  assert.deepEqual(await confirmContainers(session(), "A1", "https://grp.grp.workers.dev", left.release_, left.result), { confirmed: [], restarted: [], lags: [] },
    "a member left out is nothing to confirm");
  silent.w.restore(); left.w.restore();
});
