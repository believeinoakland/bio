/* installer-steps R1 to R6: the call to Cloudflare, and what the account holds. */
import test from "node:test";
import assert from "node:assert/strict";
import { cfCall, cf, apiOf, special, approve, patiently, sleep, Session, WAIT_BOUND_MINUTES, CF_API, namesFor, schemeOf, inventory, allCopies,
  freeName, listScripts, listBuckets, listNamespaces, listApps, bindingsOf, readCopyFacts, countsViaApi, resourcesOf, deleteResources,
  takeLock, touchLock, dropLock, MARK, LOCK_SCRIPT, LOCK_LIVE_MS, SLUG_SCHEME, LEGACY_SCHEME } from "../../src/steps/index.mjs";
import { TOK, jres, cfok, cferr, session, immediateTimers, sequence, account, heldCopies, heldCopy, realFetch } from "./world.mjs";

const MEMBERS = ["pdf-worker", "ocr-worker", "agent-worker"];
let restoreTimers;
test.beforeEach(() => { restoreTimers = immediateTimers(); });
test.afterEach(() => { restoreTimers(); globalThis.fetch = realFetch; });

test("R1: a 429 then a 200 completes after one announced wait; the answer is the reply's result", async () => {
  const calls = sequence([cferr("slow down", 429), cfok({ id: 7 })]);
  const waits = [];
  const out = await cf(session((w, b) => waits.push([w, b])), "/accounts/A1/x");
  assert.deepEqual(out, { id: 7 });
  assert.equal(calls.length, 2);
  assert.deepEqual(waits, [[0, WAIT_BOUND_MINUTES * 60]]);
});

test("R1: a 401 throws approveAgain after one request and is never retried", async () => {
  const calls = sequence([cferr("Invalid access token", 401, 9109)]);
  await assert.rejects(cf(session(), "/x"), (e) => e.approveAgain === true && e.status === 401);
  assert.equal(calls.length, 1);
  assert.equal(approve(await cf(session(), "/x").catch((e) => e)), true);
});

test("R1: a 401 carries the API's code: the measured Containers answer on a Free account is 1000, a plain 401 has the code it was given or none", async () => {
  sequence([new Response(JSON.stringify({ success: false, result: null, messages: [], errors: [{ code: 1000, message: '{"error":"Unauthorized"}' }] }), { status: 401 })]);
  await assert.rejects(cf(session(), "/accounts/A1/containers/applications"), (e) => e.approveAgain === true && e.status === 401 && e.code === 1000);
  sequence([cferr("Invalid access token", 401, 9109)]);
  await assert.rejects(cf(session(), "/x"), (e) => e.approveAgain === true && e.code === 9109);
  sequence([new Response("{}", { status: 401 })]);
  await assert.rejects(cf(session(), "/x"), (e) => e.approveAgain === true && e.status === 401 && e.code === undefined, "control: no code given, none invented");
});

test("R1: a 503 for the whole bound throws lasting, having announced each wait, with the cause's message, status and code", async () => {
  sequence([cferr("upstream trouble", 503, 7000)]);
  const waits = [];
  await assert.rejects(cf(session((w, b) => waits.push([w, b])), "/x"), (e) => {
    assert.equal(e.lasting, true);
    assert.equal(e.message, "upstream trouble");
    assert.equal(e.status, 503);
    assert.equal(e.code, 7000);
    assert.equal(special(e), true);
    assert.equal(approve(e), false);
    return true;
  });
  assert.ok(waits.length > 5);
  assert.deepEqual(waits[0], [0, 300]);
  assert.ok(waits.every(([w, b]) => w < b && b === 300), "each wait is announced before it, inside the bound");
  assert.ok(waits.every(([w], i) => i === 0 || w > waits[i - 1][0]));
});

test("R1: a network failure is waited out and the HTTP status is the message when the API names none", async () => {
  const calls = sequence([new Error("boom"), new Response("not json", { status: 404 })]);
  await assert.rejects(cf(session(), "/x"), (e) => e.message === "HTTP 404" && e.status === 404 && !e.lasting);
  assert.equal(calls.length, 2);
});

test("R1: a POST not marked idem answering 500 is not repeated, a POST answering 429 is, an idem POST is repeated on 500", async () => {
  let calls = sequence([cferr("bad", 500), cfok(1)]);
  await assert.rejects(cf(session(), "/x", { method: "POST", body: "{}" }), (e) => e.status === 500 && !e.lasting);
  assert.equal(calls.length, 1);
  calls = sequence([cferr("slow", 429), cfok(2)]);
  assert.equal(await cf(session(), "/x", { method: "POST", body: "{}" }), 2);
  assert.equal(calls.length, 2);
  calls = sequence([cferr("bad", 500), cfok(3)]);
  assert.equal(await cf(session(), "/x", { method: "POST", body: "{}", idem: true }), 3);
  assert.equal(calls.length, 2);
});

test("R1: the bearer is read only where a request is made, no error or answer carries the token, and cfCall/apiOf/patiently/sleep bind as stated", async () => {
  const s = session();
  assert.equal(String(s), "[session]");
  assert.equal(JSON.stringify(Object.keys(s)), JSON.stringify(["onWait"]));
  let calls = sequence([cferr("nope " + "x", 400)]);
  const e = await cf(s, "/x").catch((x) => x);
  assert.ok(!JSON.stringify({ m: e.message, c: e.code, s: e.status }).includes(TOK));
  assert.equal(calls[0].init.headers.authorization, "Bearer " + TOK);
  calls = sequence([cfok(1)]);
  await cfCall(s, "/y", {}, "https://example.test/base");
  assert.equal(calls[0].u, "https://example.test/base/y");
  await cf(s, "/z");
  assert.equal(calls.at(-1).u, CF_API + "/z");
  await apiOf(s, "A9")("/workers/scripts");
  assert.equal(calls.at(-1).u, CF_API + "/accounts/A9/workers/scripts");
  let n = 0;
  assert.equal(await patiently(async () => { if (n++ < 2) throw Object.assign(new Error("t"), { status: 503 }); return "done"; }, { minutes: 1 }), "done");
  await sleep(1);
});

test("R1 control: with every timer immediate the same waits are counted, and no clock is read", async () => {
  const realNow = Date.now, realDate = globalThis.Date;
  let reads = 0;
  globalThis.Date.now = () => { reads++; return realNow(); };
  try {
    sequence([cferr("trouble", 503)]);
    const waits = [];
    await cf(session((w) => waits.push(w)), "/x").catch(() => {});
    const first = waits.length;
    waits.length = 0;
    await cf(session((w) => waits.push(w)), "/x").catch(() => {});
    assert.equal(waits.length, first);
    assert.equal(reads, 0);
  } finally { globalThis.Date.now = realNow; assert.equal(globalThis.Date, realDate); }
});

test("R2: names in both schemes for a one-class and a two-class member; frozen; role", () => {
  const n = namesFor("grp");
  assert.equal(Object.isFrozen(n), true);
  assert.equal(n.scheme, SLUG_SCHEME);
  assert.deepEqual([n.slug, n.captures, n.published], ["grp", "bio-captures-grp", "bio-published-grp"]);
  assert.equal(n.member("pdf-worker"), "pdf-worker-grp");
  assert.equal(n.app("agent-runner", "AgentRunner", false), "agent-runner-grp");
  assert.equal(n.app("file-scanner", "SafeViewRenderer", true), "file-scanner-safeviewrenderer-grp");
  assert.equal(n.role("captures"), "bio-captures-grp");
  assert.equal(n.role("published"), "bio-published-grp");
  assert.equal(n.role("anything"), "bio-published-grp");
  const l = namesFor("grp", LEGACY_SCHEME);
  assert.deepEqual([l.captures, l.published, l.member("pdf-worker")], ["bio-captures", "bio-published", "pdf-worker"]);
  assert.equal(l.app("agent-runner", "AgentRunner", false), "agent-runner");
  assert.equal(l.app("file-scanner", "FileScanner", true), "file-scanner-filescanner");
  assert.equal(l.role("captures"), "bio-captures");
  assert.equal(l.role("published"), "bio-published");
});

test("R2: schemeOf reads the CAPTURES r2 binding; null for neither or absent; pure and never throws", () => {
  const b = (bucket_name) => [{ name: "CAPTURES", type: "r2_bucket", bucket_name }];
  assert.equal(schemeOf(b("bio-captures"), "grp"), LEGACY_SCHEME);
  assert.equal(schemeOf(b("bio-captures-grp"), "grp"), SLUG_SCHEME);
  assert.equal(schemeOf(b("elsewhere"), "grp"), null);
  assert.equal(schemeOf([], "grp"), null);
  assert.equal(schemeOf(undefined, "grp"), null);
  assert.equal(schemeOf([null, { name: "CAPTURES", type: "plain_text" }], "grp"), null);
  /* control: two slugs share no name in the slug scheme */
  const a = namesFor("aaa"), z = namesFor("zzz");
  const all = (x) => [x.captures, x.published, x.member("m"), x.app("m", "C", true), x.app("m", "C", false)];
  assert.equal(all(a).filter((x) => all(z).includes(x)).length, 0);
});

test("R3: a fake account with a finished copy, an unfinished one under its slug, one under the fixed names and stray buckets: each in its place", async () => {
  const held = heldCopies({ slug: "fin" }, { slug: "half", finished: false }, { slug: "old", scheme: "legacy" });
  const w = account({ ...held, preBuckets: [...held.preBuckets, "bio-captures-gone", "bio-published-gone"] });
  w.scripts.set("pdf-worker-gone", []);
  const api = apiOf(session(), "A1");
  const inv = await inventory(api, MEMBERS);
  const bySlug = Object.fromEntries(inv.planes.map((p) => [p.slug, p]));
  assert.equal(bySlug.fin.finished, true); assert.equal(bySlug.fin.scheme, SLUG_SCHEME);
  assert.equal(bySlug.half.finished, false); assert.equal(bySlug.half.scheme, SLUG_SCHEME);
  assert.equal(bySlug.old.finished, true); assert.equal(bySlug.old.scheme, LEGACY_SCHEME);
  assert.deepEqual([...inv.orphans.slugged.keys()], ["gone"]);
  assert.deepEqual([...inv.orphans.slugged.get("gone")].sort(), ["bio-captures-gone", "bio-published-gone", "pdf-worker-gone"]);
  assert.deepEqual(inv.orphans.legacy, []);
  assert.ok(inv.scripts instanceof Map && inv.scripts.has("fin"));
  assert.ok(inv.buckets.includes("bio-captures-fin"));
  const copies = allCopies(inv);
  assert.deepEqual(copies.filter((c) => c.plane).map((c) => c.slug).sort(), ["fin", "half", "old"]);
  assert.deepEqual(copies.filter((c) => !c.plane).map((c) => c.slug), ["gone"]);
  assert.equal(w.calls.filter((c) => /\/secrets/.test(c.u)).length, 0, "a secret's value is never read");
  w.restore();
});

test("R3: fixed-name remains with no plane are listed under bio-captures; a lookup that fails throws; freeName and the listers", async () => {
  const w = account({ preBuckets: ["bio-captures", "bio-published"] });
  const inv = await inventory(apiOf(session(), "A1"), MEMBERS);
  assert.deepEqual(inv.orphans.legacy, ["bio-captures", "bio-published"]);
  const rest = allCopies(inv);
  assert.equal(rest.length, 1);
  assert.deepEqual([rest[0].slug, rest[0].scheme, rest[0].plane, rest[0].finished], ["bio-captures", LEGACY_SCHEME, false, false]);
  w.restore();
  const held = heldCopy({ slug: "bad" });
  const failing = account({ ...held, lookupFail: ["bad"] });
  await assert.rejects(inventory(apiOf(session(), "A1"), MEMBERS), /could not be read/);
  assert.equal(await bindingsOf(apiOf(session(), "A1"), "bad"), null, "unknown, never none");
  failing.restore();
  assert.equal(freeName("grp", new Set(["grp-2", "grp-3"]), () => true), "grp-4");
  assert.equal(freeName("grp", new Set(), (c) => c !== "grp-2"), "grp-3");
  assert.equal(freeName("x".repeat(60), new Set(), () => true).length <= 40, true);
  assert.equal(freeName("grp", new Set(), () => false), null);
  sequence([cfok({ not: "a list" })]);
  const api = apiOf(session(), "A1");
  assert.equal((await listScripts(api)).size, 0);
  assert.deepEqual(await listNamespaces(api), []);
  assert.deepEqual(await listApps(api), []);
  assert.deepEqual(await listBuckets(api), []);
});

test("R4: a stub copy answering name, release and counts gives every fact known; a silent one every fact unknown with silent; a version without counts is older", async () => {
  const w = account({ subdomain: "pfx", copy: { held: { other: { team_name: "Oakland Team", installed_at: "2026-01-02T03:04:05Z", last_used_at: "2026-02-03",
    count_projects: 3, count_documents: 0, count_published: 1, count_members: 7 } } } });
  const facts = await readCopyFacts("https://other.pfx.workers.dev");
  for (const k of ["team", "installed", "used", "release", "projects", "documents", "published", "members"]) assert.equal(facts[k].known, true, k);
  assert.equal(facts.team.value, "Oakland Team"); assert.equal(facts.release.value, "0.80.0"); assert.equal(facts.documents.value, 0);
  assert.equal(w.addressRequests.length, 1);
  assert.equal(w.addressRequests[0].op, "bootstrap");
  assert.equal(w.calls.at(-1).init.headers, undefined, "no credential");
  w.restore();
  const silent = await readCopyFacts("https://nobody.pfx.workers.dev").catch(() => "threw");
  assert.notEqual(silent, "threw");
  sequence([new Error("down")]);
  const dark = await readCopyFacts("https://x.y.workers.dev");
  for (const f of Object.values(dark)) assert.deepEqual(f, { known: false, why: "silent" });
  assert.deepEqual(await readCopyFacts(null).then((f) => f.team), { known: false, why: "silent" });
  sequence([jres({ ok: true, version: "0.70.0", team_name: "" })]);
  const older = await readCopyFacts("https://x.y.workers.dev");
  assert.deepEqual(older.team, { known: false, why: "older" });
  assert.deepEqual(older.projects, { known: false, why: "older" });
  assert.equal(older.release.known, true);
  sequence([new Response("nope", { status: 500 })]);
  assert.equal((await readCopyFacts("https://x.y.workers.dev")).release.why, "silent");
});

test("R4: countsViaApi answers the copy's Workers, container applications and objects, null for a count that cannot be read", async () => {
  const held = heldCopy({ slug: "fin" });
  const w = account({ ...held, objects: { "bio-captures-fin": ["a", "b"] },
    preApps: [{ id: "app1", name: "x", durable_objects: { namespace_id: "ns-fin-Store" } }, { id: "app2", name: "y", durable_objects: { namespace_id: "ns-other-Store" } }] });
  const api = apiOf(session(), "A1");
  const copy = { slug: "fin", scheme: SLUG_SCHEME };
  const counts = await countsViaApi(api, copy, MEMBERS, await listScripts(api), await listNamespaces(api), await listApps(api));
  assert.deepEqual(counts, { workers: 4, containers: 1, captured: 2, published: 0 });
  w.buckets.delete("bio-published-fin");
  const again = await countsViaApi(api, copy, MEMBERS, await listScripts(api), await listNamespaces(api), await listApps(api));
  assert.equal(again.published, null);
  w.restore();
});

test("R5: resourcesOf lists a copy's apps, members, plane, then buckets; deleteResources deletes in that order and nothing else", async () => {
  const held = heldCopies({ slug: "mine" }, { slug: "yours" });
  const w = account({ ...held, objects: { "bio-captures-mine": ["k1", "k2"] },
    preApps: [{ id: "app1", name: "agent-mine", durable_objects: { namespace_id: "ns-mine-Store" } }] });
  const api = apiOf(session(), "A1");
  const list = await resourcesOf(api, { slug: "mine", scheme: SLUG_SCHEME }, MEMBERS);
  assert.deepEqual(list.map((r) => r.kind), ["app", "worker", "worker", "worker", "worker", "bucket", "bucket"]);
  assert.equal(list.at(3).name, "agent-worker-mine"); assert.equal(list[4].name, "mine");
  assert.equal(w.removed.length, 0, "resourcesOf alone deletes nothing");
  const done = [];
  await deleteResources(api, list, (r) => done.push(r.name));
  assert.deepEqual(done, list.map((r) => r.name));
  assert.ok(![...w.scripts.keys()].some((n) => n === "mine" || n.endsWith("-mine")));
  assert.ok(w.scripts.has("yours") && w.scripts.has("pdf-worker-yours"));
  assert.ok(w.buckets.has("bio-captures-yours") && !w.buckets.has("bio-captures-mine"));
  assert.ok(w.calls.some((c) => c.method === "DELETE" && c.u.includes("/scripts/mine?force=true")));
  assert.ok(w.calls.some((c) => c.u.includes("/objects/k1")));
  w.restore();
});

test("R5: a refused bucket names itself and what follows; an approveAgain is rethrown unchanged", async () => {
  const held = heldCopy({ slug: "mine" });
  const w = account({ ...held, refuseDelete: ["bio-captures-mine"] });
  const api = apiOf(session(), "A1");
  const list = await resourcesOf(api, { slug: "mine", scheme: SLUG_SCHEME }, MEMBERS);
  await assert.rejects(deleteResources(api, list), (e) => {
    assert.deepEqual(e.remaining, ["bio-captures-mine", "bio-published-mine"]);
    assert.ok(e.cause && e.status === 403);
    return true;
  });
  w.restore();
  const expiring = account({ ...heldCopy({ slug: "mine" }), expireAfter: 4 });
  const api2 = apiOf(session(), "A1");
  let thrown = null;
  try { await deleteResources(api2, await resourcesOf(api2, { slug: "mine", scheme: SLUG_SCHEME }, MEMBERS)); } catch (e) { thrown = e; }
  assert.equal(thrown?.approveAgain, true);
  expiring.restore();
});

test("R6: a lock touched a moment ago stops a second run; one older than the bound does not; the continuing run is not stopped", async () => {
  const w = account();
  const api = apiOf(session(), "A1");
  assert.equal(MARK, "INSTALL_COMPLETE");
  const t0 = 1_000_000;
  assert.equal(await takeLock(api, { id: "run1" }, t0), true);
  const held = w.scripts.get(LOCK_SCRIPT);
  assert.deepEqual(held.map((b) => b.name).sort(), ["ID", "T"]);
  assert.equal(await takeLock(api, { id: "run2" }, t0 + 1000), false);
  assert.equal(await takeLock(api, { id: "run2" }, t0 + LOCK_LIVE_MS + 1), true);
  assert.equal(await takeLock(api, { id: "run3", again: "run2" }, t0 + LOCK_LIVE_MS + 2), true);
  assert.equal(LOCK_LIVE_MS, 3 * 60 * 1000);
  await touchLock(api, "run9", t0);
  assert.equal(w.scripts.get(LOCK_SCRIPT).find((b) => b.name === "ID").text, "run9");
  await dropLock(api);
  assert.equal(w.scripts.has(LOCK_SCRIPT), false);
  w.restore();
});

test("R6 control: dropLock on a refused delete throws nothing", async () => {
  const w = account({ pre: { [LOCK_SCRIPT]: [] }, refuseDelete: [LOCK_SCRIPT] });
  await dropLock(apiOf(session(), "A1"));
  assert.equal(w.scripts.has(LOCK_SCRIPT), true);
  w.restore();
});

test("R1 (F4): a 429 that says Retry-After is waited for that long, within the bound; without it the back-off is as before", async () => {
  const limited = (after) => new Response(JSON.stringify({ success: false, errors: [{ message: "slow down" }] }), { status: 429, headers: after ? { "retry-after": after } : {} });
  let waits = [];
  sequence([limited("45"), limited("45"), cfok(1)]);
  assert.equal(await cf(session((w, b) => waits.push([w, b])), "/x"), 1);
  assert.deepEqual(waits, [[0, 300], [45, 300]]);
  waits = [];
  sequence([limited(null), limited(null), cfok(1)]);
  await cf(session((w, b) => waits.push([w, b])), "/x");
  assert.deepEqual(waits, [[0, 300], [2, 300]], "control: no header, the first back-off");
  waits = [];
  sequence([limited("100000"), cfok(1)]);
  await cf(session((w) => waits.push(w)), "/x");
  sequence([limited("100000"), limited("100000"), cfok(1)]);
  const w2 = [];
  await assert.rejects(cf(session((w) => w2.push(w)), "/x").then(() => { throw new Error("completed"); }), /completed|slow down/).catch(() => {});
  assert.ok(w2.every((w) => w <= 300), "a wait never passes the bound");
});

test("R4 (R1): a copy that answers 429 or 503 is waited on, then read; one that never mends is silent; no answer at all is not waited on", async () => {
  const waits = [];
  const calls = sequence([new Response("slow", { status: 429, headers: { "retry-after": "4" } }), new Response("trouble", { status: 503 }),
    jres({ ok: true, version: "0.80.0", team_name: "Oakland Team" })]);
  const facts = await readCopyFacts("https://x.y.workers.dev", (w, b) => waits.push([w, b]));
  assert.equal(facts.team.value, "Oakland Team");
  assert.equal(calls.length, 3);
  assert.equal(waits.length, 2);
  sequence([new Response("trouble", { status: 503 })]);
  const dark = await readCopyFacts("https://x.y.workers.dev");
  assert.deepEqual(dark.team, { known: false, why: "silent" });
  const gone = sequence([new Error("ENOTFOUND")]);
  await readCopyFacts("https://x.y.workers.dev");
  assert.equal(gone.length, 1, "an address that is not there is not waited on");
});
