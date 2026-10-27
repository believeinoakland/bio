/* installer-steps R7 to R15: the probes, the plane's bytes, bindings and uploads, and the read-back. */
import test from "node:test";
import assert from "node:assert/strict";
import { scriptExists, PLAN_PROBE, establishPlan, ensureBuckets, ensureSubdomain, planeLimits, memberLimits, reportsBuilds, LIMITS_NOT_STATED,
  selfBinding, BROWSER_BINDING, instanceAiBinding, instanceAiOk, sealBinding, profilesBinding, ownHostsBinding, memberBindings, membersPresent, heldBindings,
  hostOf, BINDING_OF, SEAL_BINDING, INSTANCE_AI_BINDING, PROFILES_BINDING, OWN_HOSTS_BINDING, uploadInstall, uploadUpdate, scriptHash, releaseSha, readBack,
  planeInSync, putSecret, rotateSecrets, namesFor, hex, ascii, find, rand, Sha256, hashStream, hashPart } from "../../src/steps/index.mjs";
import { word } from "../../../bio-plane/src/setup-words/index.mjs";
import { FLEET_BINDINGS } from "../../../bio-plane/src/setup-fleet.mjs";
import { ApproveAgain } from "../../src/steps/index.mjs";
import { TOK, session, immediateTimers, account, heldCopy, sequence, release, chosen, sha, VERSION, LIMITS, CAPABLE_SRC, realFetch, cfok, cferr } from "./world.mjs";

let restoreTimers;
test.beforeEach(() => { restoreTimers = immediateTimers(); });
test.afterEach(() => { restoreTimers(); globalThis.fetch = realFetch; });
const MEMBERS = FLEET_BINDINGS.map(([m]) => m);
const NAMES = namesFor("grp");
const SECRETS = { boot: "boot-secret", probe: "probe-secret", daemon: "daemon-secret", seal: "seal-secret" };
const byName = (meta, name) => meta.bindings.find((b) => b.name === name);

test("R7: 100328 is free, a 500 is unknown with the platform's message, an accepted upload is paid and the probe is gone", async () => {
  let w = account({ plan: "free" });
  assert.deepEqual(await establishPlan(session(), "A1"), { plan: "free" });
  w.restore();
  w = account({ plan: "unknown" });
  assert.deepEqual(await establishPlan(session(), "A1"), { plan: "unknown", detail: "internal error" });
  w.restore();
  w = account();
  assert.deepEqual(await establishPlan(session(), "A1"), { plan: "paid", leftover: false });
  assert.equal(w.scripts.has(PLAN_PROBE), false);
  assert.equal(w.probeMeta.limits.cpu_ms > 0, true);
  assert.ok(w.calls.every((c) => /bio-plan-probe/.test(c.u)), "no plan field of any reply is read: only the probe is touched");
  assert.ok(w.calls.some((c) => c.method === "DELETE" && c.u.endsWith("bio-plan-probe?force=true")));
  w.restore();
});

test("R7: a refused deletion answers paid with leftover", async () => {
  const w = account({ probeDelete: "fail" });
  assert.deepEqual(await establishPlan(session(), "A1"), { plan: "paid", leftover: true });
  w.restore();
});

test("R8: an existing bucket is named in the answer, a refused creation throws with the platform's message, a 404 is false and a 500 throws", async () => {
  let w = account({ r2: "exists" });
  assert.deepEqual(await ensureBuckets(session(), "A1", NAMES), [NAMES.captures]);
  assert.ok(w.buckets.has(NAMES.published));
  const posts = w.calls.filter((c) => c.method === "POST" && c.u.endsWith("/r2/buckets")).map((c) => JSON.parse(c.init.body).name);
  assert.deepEqual(posts, [NAMES.captures, NAMES.published], "the captures bucket and then the published one");
  w.restore();
  w = account({ r2: "refused" });
  await assert.rejects(ensureBuckets(session(), "A1", NAMES), (e) => e.status === 403 && e.code === 10042, "the measured not-entitled answer (403, 10042) is thrown as it is");
  w.restore();
  w = account({ pre: { there: [] }, lookupFail: ["bad"], preClasses: {} });
  assert.equal(await scriptExists(session(), "A1", "there"), true);
  assert.equal(await scriptExists(session(), "A1", "nowhere"), false);
  w.scripts.set("bad", []);
  await assert.rejects(scriptExists(session(), "A1", "bad"), (e) => e.status === 500);
  w.restore();
});

test("R9 (R44): a held prefix is used and the copy's address enabled; with none held nothing is registered and nothing enabled; a refused enabling throws", async () => {
  let w = account({ subdomain: "held" });
  assert.deepEqual(await ensureSubdomain(session(), "A1", "grp"), { sub: "held", registered: null });
  assert.ok(w.enabled.has("grp"));
  assert.ok(w.calls.every((c) => c.method !== "PUT" || !c.u.endsWith("/workers/subdomain")), "no registration");
  w.restore();
  w = account({ subdomain: "" });
  await assert.rejects(ensureSubdomain(session(), "A1", "grp"), (e) => e.noPrefix === true);
  assert.equal(w.prefix(), "", "control: ensureSubdomain registers nothing itself");
  assert.equal(w.enabled.has("grp"), false);
  w.restore();
  w = account({ enableFail: true });
  await assert.rejects(ensureSubdomain(session(), "A1", "grp"), /could not enable/);
  w.restore();
});

const stmt = (tag, body) => `${tag} ${body}`;
test("R10: planeLimits reads text and bytes alike; none, two, malformed and unsorted statements are named; a bundler's quoting reads; the member's tag is never read as the plane's", () => {
  const good = `export const A = "${stmt("bio-plane-limits/1", "cpu_ms=300000 subrequests=10000")}";`;
  const t = planeLimits(good), b = planeLimits(new TextEncoder().encode(good));
  assert.deepEqual(t, b);
  assert.deepEqual(t.limits, { cpu_ms: 300000, subrequests: 10000 });
  assert.equal(Object.isFrozen(t.limits), true);
  assert.deepEqual(planeLimits("export {}"), { ok: false, why: "none" });
  assert.deepEqual(planeLimits(42), { ok: false, why: "none" });
  const two = good + `export const B = '${stmt("bio-plane-limits/1", "cpu_ms=1")}';`;
  for (const src of [two, new TextEncoder().encode(two)]) {
    const r = planeLimits(src); assert.equal(r.ok, false); assert.equal(r.why, "unreadable"); assert.ok(r.detail);
  }
  for (const body of ["subrequests=10000 cpu_ms=300000", "cpu_ms=0", "cpu_ms", "CPU=1", "cpu_ms=5 cpu_ms=6"]) {
    const r = planeLimits(`"${stmt("bio-plane-limits/1", body)}"`);
    assert.deepEqual([r.ok, r.why], [false, "unreadable"], body);
  }
  assert.equal(planeLimits(`const x = \`${stmt("bio-plane-limits/1", "a=1")}\`;`).ok, true, "a backtick-quoted statement reads");
  assert.equal(planeLimits(`"${stmt("bio-member-limits/1", "cpu_ms=3")}"`).why, "none", "a member's statement is never read as the plane's");
  assert.deepEqual(Object.keys(LIMITS_NOT_STATED).sort(), ["none", "unreadable"]);
});

test("R10: reportsBuilds needs both fields as whole words, in text and in bytes; never throws", () => {
  const both = "export {storeVersion, memberVersions}";
  assert.equal(reportsBuilds(both), true);
  assert.equal(reportsBuilds(new TextEncoder().encode(both)), true);
  assert.equal(reportsBuilds("export {storeVersion}"), false);
  assert.equal(reportsBuilds("xstoreVersion memberVersions"), false);
  assert.equal(reportsBuilds(new TextEncoder().encode("storeVersion_ memberVersions")), false);
  for (const odd of [null, undefined, 7, {}]) assert.equal(reportsBuilds(odd), false);
});

test("R11: the shared bindings, each over good, absent and malformed input; no value is ever generated for INSTANCE_AI_TOKEN", () => {
  assert.deepEqual(selfBinding("grp"), { type: "service", name: "SELF", service: "grp" });
  assert.deepEqual(BROWSER_BINDING, { type: "browser", name: "BROWSER" });
  const ok = "a".repeat(16);
  assert.deepEqual(instanceAiBinding(ok), [{ type: "secret_text", name: INSTANCE_AI_BINDING, text: ok }]);
  for (const bad of [undefined, null, "", "short", "a".repeat(513), "has space 1234567890", 12, "tab\t1234567890123456"]) {
    assert.deepEqual(instanceAiBinding(bad), [], String(bad));
    assert.equal(instanceAiOk(bad), false);
  }
  assert.equal(instanceAiOk("a".repeat(512)), true);
  assert.deepEqual(sealBinding("s"), [{ type: "secret_text", name: SEAL_BINDING, text: "s" }]);
  assert.deepEqual([sealBinding(""), sealBinding(undefined), sealBinding(5)], [[], [], []]);
  assert.deepEqual(profilesBinding(["a", "b"]), [{ type: "plain_text", name: PROFILES_BINDING, text: "a,b" }]);
  assert.deepEqual([profilesBinding([]), profilesBinding(undefined)], [[], []]);
  assert.deepEqual(ownHostsBinding(["h1", "h2"]), [{ type: "plain_text", name: OWN_HOSTS_BINDING, text: "h1,h2" }]);
  assert.deepEqual([ownHostsBinding([]), ownHostsBinding("x")], [[], []]);
  assert.equal(hostOf("https://grp.pfx.workers.dev/path"), "grp.pfx.workers.dev");
  assert.equal(hostOf("not a url"), null);
  assert.equal(hostOf(null), null);
  assert.deepEqual(memberBindings(MEMBERS, NAMES), FLEET_BINDINGS.map(([m, name]) => ({ type: "service", name, service: `${m}-grp` })));
  const omitted = MEMBERS.slice(1);
  assert.equal(memberBindings(omitted, NAMES).length, omitted.length);
  assert.deepEqual(memberBindings(undefined, NAMES), []);
  assert.deepEqual([...BINDING_OF], FLEET_BINDINGS);
});

test("R11: membersPresent lists the bindable members the account holds; a failing lookup counts as not present; heldBindings is a Map with a list or null", async () => {
  const held = heldCopy({ slug: "grp", members: ["pdf-worker", "agent-worker"] });
  let w = account({ ...held, lookupFail: ["agent-worker-grp"] });
  assert.deepEqual(await membersPresent(session(), "A1", NAMES), ["pdf-worker"]);
  const map = await heldBindings(session(), "A1", "grp");
  assert.equal(map.get("VERSION"), "plain_text");
  assert.ok(Array.isArray(map.list) && map.list.length > 5);
  assert.equal(await heldBindings(session(), "A1", "nope"), null);
  w.restore();
  w = account({ ...held, settingsBlind: true });
  assert.equal(await heldBindings(session(), "A1", "grp"), null, "unknown, never none");
  w.restore();
  w = account({ ...held, expireAfter: 0 });
  await assert.rejects(membersPresent(session(), "A1", NAMES), (e) => e.approveAgain === true);
  await assert.rejects(heldBindings(session(), "A1", "grp"), (e) => e.approveAgain === true);
  w.restore();
});

test("R12: the install's upload states exactly the listed metadata; the module part is the release's blob as it is; nothing invented for INSTANCE_AI_TOKEN", async () => {
  const w = account({ pre: { "pdf-worker-grp": [] } });
  const rel = await release();
  const release_ = await chosen(rel);
  await uploadInstall(session(), "A1", "grp", { ...SECRETS, instanceAi: "i".repeat(20) }, release_, { names: NAMES, members: ["pdf-worker"], profiles: ["us-ca"] });
  const put = w.puts.at(-1);
  assert.equal(put.name, "grp");
  assert.deepEqual(put.meta, {
    main_module: "index.mjs", compatibility_date: "2026-07-01", compatibility_flags: ["nodejs_compat"], limits: { subrequests: 10000 },
    bindings: [
      { type: "durable_object_namespace", name: "STORE", class_name: "Store" },
      { type: "plain_text", name: "VERSION", text: VERSION },
      { type: "plain_text", name: "INSTANCE_NAME", text: "grp" },
      { type: "secret_text", name: "ADMIN_TOKEN", text: "boot-secret" },
      { type: "secret_text", name: "PROBE_TOKEN", text: "probe-secret" },
      { type: "secret_text", name: "DAEMON_TOKEN", text: "daemon-secret" },
      { type: "secret_text", name: "INSTANCE_AI_TOKEN", text: "i".repeat(20) },
      { type: "secret_text", name: "ACCOUNT_SEAL_SECRET", text: "seal-secret" },
      { type: "plain_text", name: "JURISDICTION_PROFILES", text: "us-ca" },
      { type: "r2_bucket", name: "CAPTURES", bucket_name: "bio-captures-grp" },
      { type: "r2_bucket", name: "PUBLISHED", bucket_name: "bio-published-grp" },
      { type: "service", name: "SELF", service: "grp" },
      { type: "browser", name: "BROWSER" },
      { type: "service", name: BINDING_OF.get("pdf-worker"), service: "pdf-worker-grp" },
    ],
    observability: { enabled: true },
    migrations: { new_tag: "v1", new_sqlite_classes: ["Store"] },
  });
  assert.equal(await put.form.get("index.mjs").text(), rel.src);
  w.restore();
});

test("R12: a member present is bound and one absent is not; noSelf omits SELF and nothing else; a refusal throws; no INSTANCE_AI_TOKEN is invented", async () => {
  const w = account({ pre: { "pdf-worker-grp": [] } });
  const release_ = await chosen(await release());
  await uploadInstall(session(), "A1", "grp", SECRETS, release_, { names: NAMES, members: ["pdf-worker"] });
  const full = w.puts.at(-1).meta;
  w.classes.clear();
  await uploadInstall(session(), "A1", "grp", { boot: "b", probe: "p", daemon: "d" }, release_, { names: NAMES, members: ["pdf-worker"], noSelf: true });
  const noSelf = w.puts.at(-1).meta;
  assert.equal(byName(noSelf, "SELF"), undefined);
  assert.deepEqual(noSelf.bindings.map((b) => b.name), full.bindings.map((b) => b.name).filter((n) => n !== "SELF" && n !== SEAL_BINDING));
  for (const m of [full, noSelf]) {
    assert.equal(byName(m, INSTANCE_AI_BINDING), undefined);
    assert.equal(byName(m, BINDING_OF.get("ocr-worker")), undefined, "an absent member is not bound");
    assert.equal(byName(m, "JURISDICTION_PROFILES"), undefined);
  }
  w.restore();
  const refusing = account({ refuseAllPlane: true });
  await assert.rejects(uploadInstall(session(), "A1", "grp", SECRETS, release_, { names: NAMES }), /refused/);
  refusing.restore();
});

test("R13: the update's upload states exactly the listed metadata, keeps secrets, the Durable Object and (without R2) the buckets, and never keeps service", async () => {
  const w = account({ pre: { "pdf-worker-grp": [] } });
  const release_ = await chosen(await release());
  await uploadUpdate(session(), "A1", "grp", true, release_, { names: NAMES, members: [], daemon: "fixed-daemon", ownHosts: ["grp.pfx.workers.dev"] });
  assert.deepEqual(w.puts.at(-1).meta, {
    main_module: "index.mjs", compatibility_date: "2026-07-01", compatibility_flags: ["nodejs_compat"], limits: { subrequests: 10000 },
    bindings: [
      { type: "plain_text", name: "VERSION", text: VERSION }, { type: "plain_text", name: "INSTANCE_NAME", text: "grp" },
      { type: "r2_bucket", name: "CAPTURES", bucket_name: "bio-captures-grp" }, { type: "r2_bucket", name: "PUBLISHED", bucket_name: "bio-published-grp" },
      { type: "service", name: "SELF", service: "grp" }, { type: "browser", name: "BROWSER" },
      { type: "secret_text", name: "DAEMON_TOKEN", text: "fixed-daemon" },
      { type: "plain_text", name: "OWN_HOSTS", text: "grp.pfx.workers.dev" },
    ],
    keep_bindings: ["secret_text", "durable_object_namespace"],
    observability: { enabled: true },
  });
  await uploadUpdate(session(), "A1", "grp", false, release_, { names: NAMES, members: ["pdf-worker"] });
  const noR2 = w.puts.at(-1).meta;
  assert.deepEqual(noR2.keep_bindings, ["secret_text", "durable_object_namespace", "r2_bucket"], "with withR2 false the buckets are kept, not restated");
  assert.equal(byName(noR2, "CAPTURES"), undefined);
  assert.ok(byName(noR2, BINDING_OF.get("pdf-worker")), "a member present is bound");
  assert.ok(!noR2.keep_bindings.includes("service"));
  assert.equal(noR2.migrations, undefined);
  assert.equal(byName(noR2, "DAEMON_TOKEN").text.length > 8, true, "a new random value when none is given");
  w.restore();
});

test("R13: credentials are restated only from opts.secrets; a seal only when given; the instance credential only when valid; profiles and noSelf as stated", async () => {
  const w = account({ pre: { pdf: [] }, preClasses: {} });
  w.scripts.set("pdf-worker-grp", []);
  const release_ = await chosen(await release());
  const put = async (opts) => { await uploadUpdate(session(), "A1", "grp", true, release_, { names: NAMES, ...opts }); return w.puts.at(-1).meta; };
  let m = await put({});
  for (const n of ["ADMIN_TOKEN", "PROBE_TOKEN", SEAL_BINDING, INSTANCE_AI_BINDING, "JURISDICTION_PROFILES"]) assert.equal(byName(m, n), undefined, n);
  m = await put({ secrets: SECRETS, instanceAi: "i".repeat(16), seal: "held-never", profiles: ["p"], noSelf: true, members: ["pdf-worker"] });
  assert.equal(byName(m, "ADMIN_TOKEN").text, "boot-secret");
  assert.equal(byName(m, "PROBE_TOKEN").text, "probe-secret");
  assert.equal(byName(m, "DAEMON_TOKEN").text, "daemon-secret");
  assert.equal(byName(m, SEAL_BINDING).text, "seal-secret", "a resumed install's credentials replace the kept ones");
  assert.equal(byName(m, INSTANCE_AI_BINDING).text.length, 16);
  assert.equal(byName(m, "JURISDICTION_PROFILES").text, "p");
  assert.equal(byName(m, "SELF"), undefined);
  assert.ok(byName(m, BINDING_OF.get("pdf-worker")));
  m = await put({ seal: "new-seal" });
  assert.equal(byName(m, SEAL_BINDING).text, "new-seal");
  m = await put({ instanceAi: "short" });
  assert.equal(byName(m, INSTANCE_AI_BINDING), undefined);
  w.restore();
});

const BYTES = Uint8Array.from([...ascii("export default 1;/*"), ...Array.from({ length: 32 }, (_, i) => 0x80 + i), ...ascii("*/")]);
const multipart = (index, boundary = "bnd") => {
  const enc = (s) => Buffer.from(s, "latin1");
  return Buffer.concat([enc(`--${boundary}\r\ncontent-disposition: form-data; name="metadata"\r\n\r\n{}\r\n--${boundary}\r\ncontent-disposition: form-data; name="index.mjs"; filename="index.mjs"\r\n\r\n`),
    Buffer.from(index), enc(`\r\n--${boundary}--\r\n`)]);
};

test("R14: a module holding bytes 0x80-0x9F reads back as itself and as a multipart part, and equals the release", async () => {
  const want = await sha(BYTES);
  const rel = { version: VERSION, blob: new Blob([BYTES]) };
  sequence([new Response(BYTES, { headers: { "content-type": "application/javascript+module" } })]);
  assert.equal(await scriptHash(session(), "A1", "grp"), want);
  assert.equal(await readBack(session(), "A1", "grp", rel), null);
  assert.equal(rel.sha, want, "the release's hash is taken once and kept");
  sequence([new Response(multipart(BYTES), { headers: { "content-type": 'multipart/form-data; boundary="bnd"' } })]);
  assert.equal(await scriptHash(session(), "A1", "grp"), want);
  assert.equal(await readBack(session(), "A1", "grp", rel), null);
  assert.equal(await releaseSha({ blob: new Blob(["x"]) }), await sha("x"));
});

test("R14: a changed byte is named with the first 16 digits of both hashes, a failed read is named, a read that differs once and then matches is null", async () => {
  const rel = { version: VERSION, blob: new Blob([BYTES]) };
  const altered = Uint8Array.from([...BYTES, 33]);
  sequence([new Response(altered)]);
  const lag = await readBack(session(), "A1", "grp", rel);
  assert.ok(lag.includes((await sha(altered)).slice(0, 16)) && lag.includes((await sha(BYTES)).slice(0, 16)) && lag.includes(VERSION));
  sequence([cferr("trouble", 500)]);
  const failed = await readBack(session(), "A1", "grp", { version: VERSION, blob: new Blob([BYTES]) });
  assert.ok(typeof failed === "string" && failed.includes(VERSION) && !/[0-9a-f]{16}…/.test(failed));
  sequence([new Response(altered), new Response(BYTES)]);
  assert.equal(await readBack(session(), "A1", "grp", { version: VERSION, blob: new Blob([BYTES]) }), null);
  for (const odd of [new Response("x", { headers: { "content-type": "multipart/form-data" } }),
    new Response(multipart(BYTES, "other"), { headers: { "content-type": "multipart/form-data; boundary=bnd" } })]) {
    sequence([odd]);
    assert.equal(await scriptHash(session(), "A1", "grp"), null);
  }
  sequence([new Error("net")]);
  assert.equal(await scriptHash(session(), "A1", "grp"), null);
  assert.equal(hex(new Uint8Array([1, 171]).buffer), "01ab");
  assert.equal(find(ascii("abcabc"), ascii("ca")), 2);
  assert.equal(await hashPart(new Response("junk").body, "bnd"), null);
});

async function heldPlane(over = {}) {
  const rel = await release({ fleet: false });
  const release_ = await chosen(rel);
  const held = heldCopy({ slug: "grp", version: VERSION, members: MEMBERS });
  const w = account({ ...held, preSources: { grp: rel.src }, ...over });
  return { w, rel, release_ };
}
const opts = { names: NAMES, members: MEMBERS, profiles: [] };

test("R15: a held plane equal to R12's upload answers true; with the bytes the same and one binding dropped, false, for each binding in turn", async () => {
  const { w, release_ } = await heldPlane();
  const held = (await heldBindings(session(), "A1", "grp")).list;
  assert.equal(await planeInSync(session(), "A1", "grp", release_, held, opts), true);
  for (const b of held) {
    const without = held.filter((x) => x !== b);
    const expected = ["BROWSER", "CAPTURES", "PUBLISHED", "VERSION", "STORE", "INSTANCE_NAME", "ADMIN_TOKEN", "PROBE_TOKEN", "DAEMON_TOKEN", SEAL_BINDING, "SELF",
      ...FLEET_BINDINGS.map(([, n]) => n)].includes(b.name) ? false : true;
    assert.equal(await planeInSync(session(), "A1", "grp", release_, without, opts), expected, b.name);
  }
  w.restore();
});

test("R15: a different version, a different bucket, a wrong kind, a member bound elsewhere, profiles chosen and not held, or different bytes: each false", async () => {
  const { w, release_ } = await heldPlane();
  const held = (await heldBindings(session(), "A1", "grp")).list;
  const swap = (name, patch) => held.map((b) => (b.name === name ? { ...b, ...patch } : b));
  assert.equal(await planeInSync(session(), "A1", "grp", { ...release_, version: "0.0.1" }, held, opts), false);
  assert.equal(await planeInSync(session(), "A1", "grp", release_, swap("CAPTURES", { bucket_name: "other" }), opts), false);
  assert.equal(await planeInSync(session(), "A1", "grp", release_, swap("SELF", { type: "plain_text" }), opts), false);
  assert.equal(await planeInSync(session(), "A1", "grp", release_, swap(FLEET_BINDINGS[0][1], { service: "elsewhere" }), opts), false);
  assert.equal(await planeInSync(session(), "A1", "grp", release_, held, { ...opts, profiles: ["us-ca"] }), false);
  w.sources.set("grp", CAPABLE_SRC + " ");
  assert.equal(await planeInSync(session(), "A1", "grp", release_, held, opts), false, "identical bindings alone are never already done");
  w.restore();
});

test("R15: putSecret sets one secret without an upload; rotateSecrets restates the three credentials and the seal only when not held", async () => {
  const w = account({ pre: { grp: [{ type: "secret_text", name: SEAL_BINDING }] } });
  await putSecret(session(), "A1", "grp", "ADMIN_TOKEN", "t");
  assert.deepEqual(w.secretPuts, ["grp/ADMIN_TOKEN"]);
  assert.equal(w.puts.length, 0, "no upload");
  w.secretPuts.length = 0;
  await rotateSecrets(session(), "A1", "grp", SECRETS, [{ name: SEAL_BINDING }]);
  assert.deepEqual(w.secretPuts, ["grp/ADMIN_TOKEN", "grp/PROBE_TOKEN", "grp/DAEMON_TOKEN"], "a held seal is not restated");
  w.secretPuts.length = 0;
  await rotateSecrets(session(), "A1", "grp", SECRETS, []);
  assert.deepEqual(w.secretPuts, ["grp/ADMIN_TOKEN", "grp/PROBE_TOKEN", "grp/DAEMON_TOKEN", "grp/ACCOUNT_SEAL_SECRET"]);
  assert.equal(w.calls.filter((c) => c.init?.body && String(c.init.body).includes(TOK)).length, 0);
  w.restore();
});

test("R21: a member's limits, in the shape R10 reads; none stated is null; an unreadable statement is not ok", () => {
  const stated = `"bio-member-limits/1 cpu_ms=300000"`;
  assert.deepEqual(memberLimits(stated), { ok: true, limits: { cpu_ms: 300000 } });
  assert.deepEqual(memberLimits(new TextEncoder().encode(stated)), { ok: true, limits: { cpu_ms: 300000 } });
  assert.deepEqual(memberLimits("export {}"), { ok: true, limits: null });
  const two = `"bio-member-limits/1 cpu_ms=1" '"bio-member-limits/1 cpu_ms=2"'`.replace(`'"`, `'`).replace(`"'`, `'`);
  assert.equal(memberLimits(two).ok, false);
  const bad = memberLimits(`"bio-member-limits/1 Z=1"`);
  assert.equal(bad.ok, false); assert.ok(typeof bad.why === "string");
  assert.equal(memberLimits(`"bio-plane-limits/1 cpu_ms=1"`).limits, null, "the plane's statement is not a member's");
});

test("R43: storageEntitlement reads and writes nothing: on, not entitled by R2's code, permission, unknown with Cloudflare's message", async () => {
  const { storageEntitlement } = await import("../../src/steps/index.mjs");
  for (const [r2, want] of [["ok", { state: "on" }], ["refused", { state: "not_entitled" }], ["permission", { state: "permission" }],
                           ["unknown", { state: "unknown", said: "The fake could not say" }]]) {
    const w = account({ r2 });
    assert.deepEqual(await storageEntitlement(session(), "A1"), want, r2);
    assert.ok(w.calls.every((c) => c.method === "GET"), `${r2}: nothing is written`);
    w.restore();
  }
  const w = account({ r2: "ok" });
  w.calls.length = 0;
  await storageEntitlement(session(), "A1");
  assert.deepEqual(w.calls.map((c) => c.u.replace(/^.*\/accounts\/A1/, "")), ["/r2/buckets"], "one read of the bucket list");
  w.restore();
});

test("R43: ensureBuckets reads 'already exists' by R2's code 10073, never by words", async () => {
  let w = account({ r2: "exists" });
  assert.deepEqual(await ensureBuckets(session(), "A1", NAMES), [NAMES.captures]);
  w.restore();
  w = account({ r2: "exists" });
  const fetch0 = globalThis.fetch;
  globalThis.fetch = async (u, init) => {
    const r = await fetch0(u, init);
    if (init?.method !== "POST" || !String(u).endsWith("/r2/buckets")) return r;
    const j = await r.clone().json();
    if (j.success !== false) return r;
    return new Response(JSON.stringify({ success: false, errors: [{ code: 1, message: "The bucket you tried to create already exists" }] }), { status: 409 });
  };
  try { await assert.rejects(ensureBuckets(session(), "A1", NAMES), /already exists/, "control: the words without the code are not the conflict"); }
  finally { globalThis.fetch = fetch0; w.restore(); }
});

test("R44: addressState proposes the slug and registers nothing; registerSubdomain registers exactly the chosen name and answers taken", async () => {
  const { addressState, registerSubdomain } = await import("../../src/steps/index.mjs");
  let w = account({ subdomain: "held" });
  assert.deepEqual(await addressState(session(), "A1", "grp"), { sub: "held", proposed: null });
  w.restore();
  w = account({ subdomain: "", taken: ["mine"] });
  assert.deepEqual(await addressState(session(), "A1", "grp"), { sub: null, proposed: "grp" });
  assert.equal(w.prefix(), "", "nothing is registered by the proposal");
  assert.ok(w.calls.every((c) => c.method === "GET"));
  assert.deepEqual(await registerSubdomain(session(), "A1", "mine"), { ok: false, taken: true });
  assert.equal(w.prefix(), "");
  assert.deepEqual(await registerSubdomain(session(), "A1", "chosen"), { ok: true });
  assert.equal(w.prefix(), "chosen", "exactly the name chosen");
  const puts = w.calls.filter((c) => c.method === "PUT" && c.u.endsWith("/workers/subdomain")).map((c) => JSON.parse(c.init.body).subdomain);
  assert.deepEqual(puts, ["mine", "chosen"], "no other name is tried");
  w.restore();
  w = account({ subdomain: "", subdomainPut: "fail" });
  await assert.rejects(registerSubdomain(session(), "A1", "x"), /not permitted/, "any other refusal is thrown with Cloudflare's message: a 403 without code 10031 is not taken");
  w.restore();
  w = account({ subdomain: "", taken: ["mine"] });
  const fetch0 = globalThis.fetch;
  globalThis.fetch = async (u, init) => {
    const r = await fetch0(u, init);
    if (init?.method !== "PUT" || !String(u).endsWith("/workers/subdomain") || r.ok) return r;
    return new Response(JSON.stringify({ success: false, errors: [{ code: 0, message: "conflict" }] }), { status: 409 });
  };
  try { assert.deepEqual(await registerSubdomain(session(), "A1", "mine"), { ok: false, taken: true }, "HTTP 409 stays taken"); }
  finally { globalThis.fetch = fetch0; w.restore(); }
});

test("R14 (R1): the read-back waits out a 429 and a 503 as every call does, and a 401 asks for approval again", async () => {
  const rel = { version: VERSION, blob: new Blob([BYTES]) };
  const waits = [];
  const calls = sequence([cferr("slow down", 429), cferr("trouble", 503), new Response(BYTES)]);
  assert.equal(await readBack(session((w, b) => waits.push([w, b])), "A1", "grp", rel), null);
  assert.equal(calls.length, 3);
  assert.equal(waits.length, 2, "each wait announced");
  sequence([cferr("Invalid access token", 401, 9109)]);
  await assert.rejects(scriptHash(session(), "A1", "grp"), (e) => e instanceof ApproveAgain && e.approveAgain === true);
  const one = sequence([cferr("nope", 404)]);
  assert.equal(await scriptHash(session(), "A1", "grp"), null);
  assert.equal(one.length, 1, "a refusal that waiting cannot mend is not repeated");
  sequence([cferr("trouble", 503)]);
  assert.equal(await scriptHash(session(), "A1", "grp"), null, "a failure that never mended reads as nothing readable");
});

/* R38: a 29 MB module is uploaded and read back holding its bytes once, streamed. */
const MB29 = (() => {
  const b = new Uint8Array(29 * 2 ** 20);
  for (let i = 0; i < b.length; i++) b[i] = (i * 2654435761 >>> 24) & 255;
  b.set(Array.from({ length: 32 }, (_, i) => 0x80 + i), 1000);
  b.set(ascii(' "bio-plane-crons/1 */5 * * * *" '), b.length - 100);   /* R39: the plane states its schedule; its upload sets it */
  return b;
})();
/* A response that cannot be read whole: any call that holds the body as one buffer, string or blob is counted and refused. */
const streamed = (chunks, headers, seen) => {
  let i = 0;
  const body = new ReadableStream({ pull(c) { if (i < chunks.length) { seen.chunks++; seen.largest = Math.max(seen.largest, chunks[i].length); c.enqueue(chunks[i++]); } else c.close(); } });
  const r = new Response(body, { headers });
  for (const m of ["arrayBuffer", "text", "blob", "bytes", "json", "formData"]) r[m] = async () => { seen.whole.push(m); throw new Error("the body was held whole by " + m); };
  return r;
};
const slices = (bytes, n = 65536) => Array.from({ length: Math.ceil(bytes.length / n) }, (_, i) => bytes.subarray(i * n, (i + 1) * n));
const asMultipart = (bytes) => [ascii('--bnd\r\ncontent-disposition: form-data; name="metadata"\r\n\r\n{}\r\n--bnd\r\ncontent-disposition: form-data; name="index.mjs"; filename="index.mjs"\r\n\r\n'),
  ...slices(bytes), ascii("\r\n--bnd--\r\n")];

test("R38: the read-back of a 29 MB module, raw or as a multipart part, is hashed from the stream as downloaded, never held whole, and equals the whole-buffer hash; a different byte is still named", async () => {
  const want = await sha(MB29);
  assert.equal(await hashStream(new Blob([MB29]).stream()), want, "the incremental hash is the whole-buffer hash");
  assert.equal(await releaseSha({ blob: new Blob([MB29]) }), want);
  const rel = { version: VERSION, blob: new Blob([MB29]), sha: want };
  for (const [kind, chunks, headers] of [["raw", slices(MB29), { "content-type": "application/javascript+module" }],
    ["multipart", asMultipart(MB29), { "content-type": 'multipart/form-data; boundary="bnd"' }]]) {
    const seen = { chunks: 0, largest: 0, whole: [] };
    sequence([() => streamed(chunks, headers, seen)]);
    assert.equal(await scriptHash(session(), "A1", "grp"), want, kind);
    assert.deepEqual(seen.whole, [], kind + ": the body was never held whole");
    assert.ok(seen.chunks > 100 && seen.largest <= 65536, kind + ": read as a stream of small chunks");
    const again = { chunks: 0, largest: 0, whole: [] };
    sequence([() => streamed(chunks, headers, again)]);
    assert.equal(await readBack(session(), "A1", "grp", rel), null, kind);
  }
  const other = MB29.slice(); other[2 ** 24] ^= 1;
  const seen = { chunks: 0, largest: 0, whole: [] };
  sequence([() => streamed(asMultipart(other), { "content-type": "multipart/form-data; boundary=bnd" }, seen)]);
  assert.equal(await scriptHash(session(), "A1", "grp"), await sha(other), "control: a different byte is a different hash");
  sequence([() => streamed(slices(other), {}, { chunks: 0, largest: 0, whole: [] })]);
  const lag = await readBack(session(), "A1", "grp", rel);
  assert.ok(lag.includes((await sha(other)).slice(0, 16)) && lag.includes(want.slice(0, 16)), "control: a different byte is named");
});

test("R38: the multipart part is found whatever the chunking, across preambles, other parts and delimiters split anywhere; the stream may end inside the part", async () => {
  const body = Buffer.from(multipart(BYTES));
  const want = await sha(BYTES);
  for (const n of [1, 2, 3, 5, 7, 16, 64, body.length]) {
    const chunks = Array.from({ length: Math.ceil(body.length / n) }, (_, i) => new Uint8Array(body.subarray(i * n, (i + 1) * n)));
    assert.equal(await hashPart(new Response(new ReadableStream({ start(c) { chunks.forEach((x) => c.enqueue(x)); c.close(); } })).body, "bnd"), want, "chunks of " + n);
  }
  assert.equal(await hashPart(new Response(multipart(BYTES, "other")).body, "bnd"), null, "another boundary finds nothing");
  assert.equal(await hashPart(new Response("--bnd\r\ncontent-disposition: form-data; name=\"metadata\"\r\n\r\n{}\r\n--bnd--\r\n").body, "bnd"), null, "no index.mjs part");
  const cut = Buffer.from(multipart(BYTES)).subarray(0, -11);
  assert.equal(await hashPart(new Response(cut).body, "bnd"), want, "a part the stream ends inside is hashed as far as it goes");
});

test("R38: the upload carries the release's Blob as it is, never turned into a string or a buffer, whose bytes reach the account once", async () => {
  const calls = sequence([cfok({}), cfok({ observability: { enabled: true } }), cfok({})]);
  const seen = [];
  const blob = new Blob([MB29]);
  for (const m of ["text", "arrayBuffer", "bytes"]) blob[m] = async () => { seen.push(m); throw new Error("held whole by " + m); };
  const rel = { version: VERSION, blob, limits: LIMITS, sha: await sha(MB29) };
  await uploadInstall(session(), "A1", "grp", SECRETS, rel, { names: NAMES, members: [] });
  const part = calls.find((c) => c.init?.body instanceof FormData).init.body.get("index.mjs");
  assert.deepEqual(seen, [], "no whole-body copy was asked of the release's Blob");
  assert.equal(part.size, MB29.length, "the part is the module's bytes, once");
  seen.length = 0;
  /* R42: the update reads the held settings first (the place it restates), then uploads, reads the logs setting, sets the schedule */
  sequence([cfok({ bindings: [] }), cfok({}), cfok({ observability: { enabled: true } }), cfok({})]);
  await uploadUpdate(session(), "A1", "grp", true, rel, { secrets: SECRETS, names: NAMES });
  assert.deepEqual(seen, [], "the update's upload likewise");
});

test("R38: the incremental SHA-256 equals the whole-buffer hash for every length around a block and for uneven chunking", async () => {
  const src = Uint8Array.from({ length: 300 }, (_, i) => (i * 37 + 11) & 255);
  for (let n = 0; n <= 200; n++) {
    const bytes = src.subarray(0, n), h = new Sha256();
    for (let i = 0, k = 1; i < n; i += k, k = (k * 3) % 29 + 1) h.update(bytes.subarray(i, i + k));
    assert.equal(h.hex(), await sha(bytes), "length " + n);
  }
});

test("R45: missingScopes answers the needed scopes absent from the granted space-separated scope", async () => {
  const { missingScopes } = await import("../../src/steps/index.mjs");
  const needed = ["workers-scripts.write", "workers-r2.write", "account-settings.read", "containers.write"];
  assert.deepEqual(missingScopes("workers-scripts.write workers-r2.write account-settings.read containers.write account-logs.read", needed), []);
  assert.deepEqual(missingScopes("workers-scripts.write  account-settings.read", needed), ["workers-r2.write", "containers.write"], "in the order of needed, extra spaces ignored");
  assert.deepEqual(missingScopes("workers-r2.writer", ["workers-r2.write"]), ["workers-r2.write"], "a longer name is not the scope");
  assert.deepEqual(missingScopes("a", []), []);
  for (const none of ["", "   ", undefined, null, 5]) assert.deepEqual(missingScopes(none, needed), [], "control: a response that states no scope names none missing (R20 reads the API then)");
});
