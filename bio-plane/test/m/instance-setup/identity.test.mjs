/* The display name and the verified domain (R5–R11) and R27, at the module's interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { boot, providers } from "./fixture.mjs";
import { GROUP_DOMAIN_CHECKS_MAX, GROUP_WELL_KNOWN_MAX_BYTES, NO_GROUP_RECORDED } from "../../../src/setup.mjs";
import { civicosUserAgent } from "../../../src/acquisition/index.mjs";

const ADDR = "https://river.example";
const file = (o, status = 200) => () => new Response(typeof o === "string" ? o : JSON.stringify(o), { status });
const world = async (env = { INSTANCE_NAME: "river-town" }) => {
  const w = await boot({ env });
  w.prov.admins = new Set(["admin", "member:ada"]);
  return w;
};

test("R5 both sets are refused GROUP_IDENTITY_NOT_ADMIN (C-64.5) unless by is an administrator, before anything is read or validated", async () => {
  const w = await world();
  for (const by of [null, "", "member:bob", "class:admin"]) {
    const a = w.m.groupNameSet({ name: "", by });                     // malformed too: the gate answers first
    const b = await w.m.groupDomainSet({ domain: "not a domain", by, origin: ADDR });
    for (const r of [a, b]) { assert.equal(r.reason, "GROUP_IDENTITY_NOT_ADMIN"); assert.equal(r.check, "C-64.5"); }
  }
  assert.equal(w.prov.fetched.length, 0);
  assert.equal(w.st.db.prepare(`SELECT count(*) n FROM group_identity_history`).get().n, 0);
  assert.equal(w.m.groupNameSet({ name: "River Town", by: "member:ada" }).ok, true);   // an enrolled administrator
});

test("R6 a display name is trimmed text of 1 to 120 characters on one line with no control characters, else GROUP_DISPLAY_NAME_MALFORMED (C-64.6); each set appends to the history", async () => {
  const w = await world();
  for (const bad of ["", "   ", "a".repeat(121), "two\nlines", "tab\there", "bell\u0007", "nel\u0085x", "ls x", 42, null]) {
    const r = w.m.groupNameSet({ name: bad, by: "admin" });
    assert.equal(r.reason, "GROUP_DISPLAY_NAME_MALFORMED", JSON.stringify(bad)); assert.equal(r.check, "C-64.6");
  }
  assert.equal(w.m.groupNameSet({ name: "é".repeat(120), by: "admin" }).ok, true);          // characters, not bytes
  assert.equal(w.m.groupNameSet({ name: "😀".repeat(120), by: "admin" }).ok, true);        // code points, not UTF-16 units
  const r = w.m.groupNameSet({ name: "  River Town Watch  ", by: "member:ada" });
  assert.equal(r.display_name, "River Town Watch");
  assert.equal(r.set_by, "member:ada");
  assert.deepEqual(r.history.map((h) => h.value), ["é".repeat(120), "😀".repeat(120), "River Town Watch"]);
  for (const h of r.history) assert.deepEqual(Object.keys(h).sort(), ["set_at", "set_by", "value"]);
});

test("R7 a domain is lower-cased, its trailing dot removed, and must be a bare host, else GROUP_DOMAIN_MALFORMED (C-64.7); each set appends the claim with the stamped origin, checks it and answers claim, check, shown_publicly and history", async () => {
  const w = await world();
  for (const bad of ["", "https://river.example", "river.example/path", "river.example:8443", "10.0.0.1", "localhost",
                     "river..example", "-river.example", "river.example.123", "a b.org"]) {
    const r = await w.m.groupDomainSet({ domain: bad, by: "admin", origin: ADDR });
    assert.equal(r.reason, "GROUP_DOMAIN_MALFORMED", bad); assert.equal(r.check, "C-64.7");
  }
  w.prov.answer = file({ instance: ADDR, group: "river-town" });
  const r = await w.m.groupDomainSet({ domain: "  River.Example.ORG. ", by: "admin", origin: "HTTPS://River.Example/some/path" });
  assert.equal(r.ok, true);
  assert.equal(r.domain, "river.example.org");
  assert.equal(r.instance_address, ADDR);
  assert.equal(r.check.verdict, "verified");
  assert.equal(r.shown_publicly, true);
  assert.deepEqual(r.history.map((h) => h.value), ["river.example.org"]);
  assert.equal(w.prov.arms.length, 1, "armed after the set (scheduler R9), and not at start");
  w.prov.answer = file("", 404);
  const r2 = await w.m.groupDomainSet({ domain: "other.example", by: "admin", origin: "ftp://nope" });
  assert.equal(r2.instance_address, null);
  assert.equal(r2.shown_publicly, false);
  assert.deepEqual(r2.history.map((h) => h.value), ["river.example.org", "other.example"]);
});

test("R8 the check: governed fetch of the well-known file, no redirect followed, at most 16 KiB read, one dated verdict with its trigger — verified, absent, mismatched, undetermined", async () => {
  const cases = [
    ["verified", file({ instance: ADDR + "/", group: "river-town", extra: 1 })],
    ["absent", file("gone", 404)], ["absent", file("gone", 410)],
    ["absent", () => new Response(null, { status: 301, headers: { location: "https://elsewhere.example/x" } })],
    ["absent", () => new Response(null, { status: 302 })],
    ["mismatched", file({ instance: "https://other.example", group: "river-town" })],
    ["mismatched", file({ instance: ADDR, group: "other-town" })],
    ["mismatched", file("not json")], ["mismatched", file("[1,2]")], ["mismatched", file("null")],
    ["mismatched", file({ instance: ADDR })],
    ["undetermined", file("err", 500)], ["undetermined", file("err", 429)], ["undetermined", file("err", 403)],
    ["undetermined", () => { throw new Error("connection refused"); }],
  ];
  for (const [want, answer] of cases) {
    const w = await world();
    w.prov.answer = answer;
    const r = await w.m.groupDomainSet({ domain: "river.example.org", by: "admin", origin: ADDR });
    assert.equal(r.check.verdict, want, `${want}: ${r.check.detail}`);
    assert.equal(r.check.trigger, "set");
    assert.match(r.check.checked_at, /^\d{4}-\d\d-\d\dT/);
    assert.equal(w.prov.fetched.length, 1);
    assert.equal(w.prov.fetched[0].url, "https://river.example.org/.well-known/civicos-group.json");
    assert.equal(w.prov.fetched[0].init.redirect, "manual");
    /* the agent is acquisition's one composer (its R24), for this instance and this purpose */
    assert.equal(w.prov.fetched[0].init.headers["user-agent"], civicosUserAgent(undefined, "river-town", "group-domain"));
    assert.deepEqual(w.prov.governed[0], ["admit", "river.example.org"]);
    /* admit, then report the status: a fetch that did not complete has no status to report */
    if (r.check.status === null) assert.equal(w.prov.governed.length, 1);
    else assert.deepEqual(w.prov.governed[1], ["report", "river.example.org", r.check.status]);
  }
  /* the governor holding the host: nothing fetched, undetermined, never absent */
  const held = await world();
  held.prov.governorHold = "cooling_off";
  const h = await held.m.groupDomainSet({ domain: "river.example.org", by: "admin", origin: ADDR });
  assert.equal(h.check.verdict, "undetermined"); assert.equal(held.prov.fetched.length, 0);
  /* no slug, and no address: undetermined, nothing fetched */
  const noSlug = await world({});
  const n = await noSlug.m.groupDomainSet({ domain: "river.example.org", by: "admin", origin: ADDR });
  assert.equal(n.check.verdict, "undetermined"); assert.equal(noSlug.prov.fetched.length, 0);
  const noAddr = await world();
  const a = await noAddr.m.groupDomainSet({ domain: "river.example.org", by: "admin", origin: "not an origin" });
  assert.equal(a.check.verdict, "undetermined"); assert.equal(noAddr.prov.fetched.length, 0);
  /* at most 16 KiB is read: the file's first 16 KiB are its whole text */
  const big = await world();
  const pad = " ".repeat(GROUP_WELL_KNOWN_MAX_BYTES);
  let pulled = 0;
  big.prov.answer = () => new Response(new ReadableStream({
    pull(c) { pulled += 1; if (pulled > 40) { c.close(); return; } c.enqueue(new TextEncoder().encode(pulled === 1 ? JSON.stringify({ instance: ADDR, group: "river-town" }) : pad)); },
  }), { status: 200 });
  assert.equal((await big.m.groupDomainSet({ domain: "river.example.org", by: "admin", origin: ADDR })).check.verdict, "verified");
  assert.ok(pulled <= 4, `read ${pulled} chunks`);
  const cut = await world();
  cut.prov.answer = file(pad + JSON.stringify({ instance: ADDR, group: "river-town" }));
  assert.equal((await cut.m.groupDomainSet({ domain: "river.example.org", by: "admin", origin: ADDR })).check.verdict, "mismatched");
});

test("R9 the current claim is re-checked on the reconciling alarm one interval after its latest verdict; an instance claiming no domain holds no wake", async () => {
  const w = await world();
  const c = w.prov.consumers.find((x) => x.name === "group-domain-recheck");
  assert.deepEqual([c.module, c.key], ["instance-setup", "groupdomain"]);
  assert.equal(c.wake(Date.now()), null);
  assert.equal(c.due(Date.now()), null);
  w.prov.answer = file({ instance: ADDR, group: "river-town" });
  const set = await w.m.groupDomainSet({ domain: "river.example.org", by: "admin", origin: ADDR });
  assert.equal(c.wake(), Date.parse(set.check.checked_at) + 86_400_000);
  assert.equal(c.due(), c.wake());
  w.prov.answer = file("", 404);
  const t = await c.tick(Date.now());
  assert.equal(t.groupdomain.trigger, "alarm");
  assert.equal(t.groupdomain.verdict, "absent");
  assert.equal(c.wake(), Date.parse(t.groupdomain.checked_at) + 86_400_000);
  const quick = await world({ INSTANCE_NAME: "river-town", GROUP_DOMAIN_RECHECK_MS: "60000" });
  quick.prov.answer = file("", 404);
  const q = await quick.m.groupDomainSet({ domain: "river.example.org", by: "admin", origin: ADDR });
  assert.equal(quick.prov.consumers[0].wake(), Date.parse(q.check.checked_at) + 60000);
  for (const bad of ["0", "-5", "soon"]) {
    const x = await world({ INSTANCE_NAME: "river-town", GROUP_DOMAIN_RECHECK_MS: bad });
    x.prov.answer = file("", 404);
    const y = await x.m.groupDomainSet({ domain: "river.example.org", by: "admin", origin: ADDR });
    assert.equal(x.prov.consumers[0].wake(), Date.parse(y.check.checked_at) + 86_400_000, bad);
  }
});

test("R10 the public projection: the slug, the name only beside a slug, the domain with its date only while the latest verdict on the current claim is verified", async () => {
  const none = await world({});
  none.m.groupNameSet({ name: "Nameless", by: "admin" });
  assert.deepEqual(none.m.groupIdentityPublic(), { ok: true, group: null, display_name: null, domain: null,
                                                   domain_verified_at: null, detail: NO_GROUP_RECORDED });
  const w = await world();
  assert.deepEqual(w.m.groupIdentityPublic(), { ok: true, group: "river-town", display_name: null, domain: null, domain_verified_at: null });
  w.m.groupNameSet({ name: "River Town Watch", by: "admin" });
  w.prov.answer = file({ instance: ADDR, group: "river-town" });
  const v = await w.m.groupDomainSet({ domain: "river.example.org", by: "admin", origin: ADDR });
  assert.deepEqual(w.m.groupIdentityPublic(), { ok: true, group: "river-town", display_name: "River Town Watch",
                                               domain: "river.example.org", domain_verified_at: v.check.checked_at });
  /* a later verdict that is not verified withdraws it */
  w.prov.answer = file("", 500);
  await w.prov.consumers[0].tick(Date.now());
  assert.equal(w.m.groupIdentityPublic().domain, null);
  /* a new claim not yet verified is not shown, though an earlier claim was */
  w.prov.answer = file({ instance: ADDR, group: "river-town" });
  await w.prov.consumers[0].tick(Date.now());
  assert.equal(w.m.groupIdentityPublic().domain, "river.example.org");
  w.prov.answer = file("", 404);
  await w.m.groupDomainSet({ domain: "new.example.org", by: "admin", origin: ADDR });
  assert.deepEqual([w.m.groupIdentityPublic().domain, w.m.groupIdentityPublic().domain_verified_at], [null, null]);
});

test("R11 the credentialed read: R10, the recorded name, both histories oldest first, the current claim with its latest check, and the 20 newest checks with the limit and a measured truncation", async () => {
  const w = await world();
  w.m.groupNameSet({ name: "One", by: "admin" });
  w.m.groupNameSet({ name: "Two", by: "member:ada" });
  w.prov.answer = file("", 404);
  await w.m.groupDomainSet({ domain: "first.example", by: "admin", origin: ADDR });
  await w.m.groupDomainSet({ domain: "second.example", by: "admin", origin: ADDR });
  for (let i = 0; i < GROUP_DOMAIN_CHECKS_MAX - 2; i++) await w.prov.consumers[0].tick(Date.now());
  let r = w.m.groupIdentity();
  assert.equal(r.display_name_recorded, "Two");
  assert.deepEqual(r.display_name_history.map((h) => [h.value, h.set_by]), [["One", "admin"], ["Two", "member:ada"]]);
  assert.deepEqual(r.domain_history.map((h) => h.value), ["first.example", "second.example"]);
  assert.equal(r.domain_claim.domain, "second.example");
  assert.equal(r.domain_claim.instance_address, ADDR);
  assert.equal(r.domain_claim.latest.trigger, "alarm");
  assert.equal(r.domain_checks.length, 20);
  assert.equal(r.domain_checks_limit, 20);
  assert.equal(r.domain_checks_truncated, false);
  assert.equal(r.domain_checks[r.domain_checks.length - 1].domain, "first.example");   // newest first
  for (const k of ["group", "display_name", "domain", "domain_verified_at"]) assert.ok(k in r, k);
  await w.prov.consumers[0].tick(Date.now());
  r = w.m.groupIdentity();
  assert.equal(r.domain_checks.length, 20);
  assert.equal(r.domain_checks_truncated, true);
});

test("R27 the display name is presentation only: it enters no signed bytes — the group fact and every stamp read the slug", async () => {
  const w = await world();
  w.m.groupNameSet({ name: "River Town Watch", by: "admin" });
  assert.equal(w.prov.promotion.fact("producingGroup").value, "river-town");
  assert.equal(w.m.instanceGroup().group, "river-town");
  const writes = w.st.statements.filter((q) => /^\s*(INSERT|UPDATE)/i.test(q) && /display_name/.test(q));
  for (const q of writes) assert.match(q, /INSERT INTO group_identity_history/);
});

test("R9 at start the consumer is registered before the scheduler's own start reconciles (its R11), and booting with SCHED_PROBE bound arms no probe (K419)", async () => {
  const w = await world();
  assert.deepEqual(w.prov.starts, [["group-domain-recheck"]]);
  assert.equal(w.prov.arms.length, 0);
  /* the real scheduler over a storage stand-in, its owners idle: a boot starts no probe the seam would arm */
  const { Scheduler } = await import("../../../src/scheduler/index.mjs");
  const kv = new Map(); let alarm = null;
  const store = { async getAlarm() { return alarm; }, async setAlarm(t) { alarm = t; }, async deleteAlarm() { alarm = null; },
                  async get(k) { return kv.get(k); }, async put(k, v) { kv.set(k, v); } };
  const idle = new Proxy({}, { get: () => new Proxy({}, { get: () => () => null }) });
  const env = { INSTANCE_NAME: "river-town", SCHED_PROBE: JSON.stringify([{ name: "probe-a", period: 1000, fires: 3 }]) };
  const scheduler = new Scheduler({ storage: store, env, owners: idle });
  const b = await boot({ env, prov: { ...providers(), scheduler } });
  assert.equal(b.started.consumer.ok, true);
  assert.equal(alarm, null, "no probe armed and no consumer wanting a wake");
  assert.equal(kv.size, 0, "the probe's state is not written at boot");
  /* while the producers' door, arm, does start it: the seam is live, only the boot leaves it alone */
  await scheduler.arm();
  assert.notEqual(alarm, null);
});
