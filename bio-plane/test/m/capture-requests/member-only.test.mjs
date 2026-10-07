/* capture-requests: a personal site or a login-gated platform is captured only by a member's own act in their own
   browser (R46; T33-51, K1492 (2), (4)), driven at `captureRequest`, `drain`, `captureRequestRetry` and the platform
   marks; and the explicit table declarations (R47). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, refused } from "./fixture.mjs";
import { CAPTURE_REQUEST_CHECKS, MEMBER_ROUTE, SITE_KINDS, CAPTURE_REQUESTS_TABLES, captureRequestsOps }
  from "../../../src/capture-requests/index.mjs";

const ONLY = CAPTURE_REQUEST_CHECKS.MEMBER_CAPTURE_ONLY;
const count = (w) => w.row(`SELECT count(*) AS n FROM capture_requests`).n;
const member = (w, id) => w.st.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, created, updated)
                                          VALUES (?, 'c', ?, 'member', 'active', 't', 't')`, id, id);
const memberOnly = (a, why) => {
  assert.deepEqual([a.ok, a.code, a.reason, a.check, a.translation, a.route],
                   [false, "MEMBER_CAPTURE_ONLY", "MEMBER_CAPTURE_ONLY", "C-28.20", ONLY.translation, "member"], why);
  assert.ok(a.detail.includes(MEMBER_ROUTE), why);
};

test("R46 a request the run judges a personal site or a login-gated platform is refused MEMBER_CAPTURE_ONLY (C-28.20), routed to the members with the sentence, before anything is written — a standing row for the key included — and nobody is told", () => {
  const w = world().scene();
  assert.deepEqual([...SITE_KINDS], ["personal", "platform"]);
  assert.equal(Object.isFrozen(SITE_KINDS), true);
  assert.match(MEMBER_ROUTE, /member's own act in their own browser/);
  assert.match(MEMBER_ROUTE, /never by the daemon/);
  const heard = [];
  w.cr.onRequestFiled("listener", (n) => heard.push(n));
  for (const site_kind of ["personal", "platform", " personal ", "platform  "]) {
    const a = w.ask({ address: "https://jane.example.org/about", site_kind });
    memberOnly(a, site_kind);
    assert.equal(a.site_kind, site_kind.trim());
    assert.equal(a.address, "https://jane.example.org/about");
    assert.match(a.detail, site_kind.trim() === "personal" ? /a private person's own site/ : /a login-gated platform/);
    assert.equal("request" in a, false, "no request id: nothing was queued");
  }
  assert.equal(count(w), 0);
  assert.deepEqual(heard, []);
  /* a row standing for the same (run, address, render) does not answer in its place */
  const plain = w.ask({ address: "https://jane.example.org/about" });
  assert.equal(plain.ok, true);
  memberOnly(w.ask({ address: "https://jane.example.org/about", site_kind: "personal" }), "standing");
  assert.equal(count(w), 1);
  /* the op reads site_kind from the body, as it reads the address */
  const url = new URL("http://x/capturerequest?viewer=member%3Aann&principal=member%3Aann%2Ftok1");
  w.hold("https://p.example.org/x");
  memberOnly(captureRequestsOps(w.cr, url, { run: "R-1", address: "https://p.example.org/x", target: "INQ-1",
                                             purpose: "investigate", site_kind: "platform" }).capturerequest(), "op");
  assert.equal(count(w), 1);
  assert.equal(w.capture.calls.length, 0);
});

test("R46 any other site_kind is CAPTURE_REQUEST_SITE_KIND_UNKNOWN (C-28.21) and nothing is queued; absent, null or blank is an ordinary public page", () => {
  const w = world().scene();
  for (const site_kind of ["Personal", "PLATFORM", "social", "public", "personal-site", 7, true, false, {}, ["personal"]]) {
    const a = w.ask({ address: "https://x.example.org/a", site_kind });
    assert.deepEqual([a.ok, a.code, a.reason, a.check, a.translation],
      [false, "CAPTURE_REQUEST_SITE_KIND_UNKNOWN", "CAPTURE_REQUEST_SITE_KIND_UNKNOWN", "C-28.21",
       CAPTURE_REQUEST_CHECKS.CAPTURE_REQUEST_SITE_KIND_UNKNOWN.translation], String(site_kind));
    assert.equal(typeof a.detail, "string");
  }
  assert.equal(count(w), 0);
  for (const [i, site_kind] of [undefined, null, "", "   "].entries())
    assert.equal(w.ask({ address: `https://x.example.org/${i}`, site_kind }).ok, true, String(site_kind));
  assert.equal(count(w), 4);
  for (const junk of [{ run: "R-1", address: "https://e.org/j", target: "INQ-1", site_kind: Symbol("s") },
                      { run: "R-1", address: "https://e.org/k", target: "INQ-1", site_kind: 10n }])
    assert.doesNotThrow(() => w.cr.captureRequest(junk, { viewer: V("ann"), caller: "member:ann/tok1" }));
});

test("R46 a source asking a login on a host a member has marked a platform is refused MEMBER_CAPTURE_ONLY at the drain, routed to the members, R40's reason kept; no supplied login is ever sent to a marked host; elsewhere R40–R41 stand", async () => {
  const w = world().scene();
  member(w, "ann");
  assert.equal(w.cr.markPlatform({ host: "Social.Example.COM" }, { viewer: V("ann") }).ok, true);
  const login = await w.creds.credentialSupply({ kind: "login", host: "social.example.com", secret: "pw", scope: "group", by: "ann" });
  const other = await w.creds.credentialSupply({ kind: "login", host: "portal.example.gov", secret: "pw2", scope: "group", by: "ann" });
  assert.deepEqual([login.ok, other.ok], [true, true]);
  const ids = {
    gated: w.ask({ address: "https://social.example.com/in/jane" }).request,
    paid: w.ask({ address: "https://social.example.com/paid" }).request,
    portal: w.ask({ address: "https://portal.example.gov/doc" }).request,
  };
  w.capture.script.set("https://social.example.com/in/jane", refused(401));
  w.capture.script.set("https://social.example.com/paid", refused(402));
  w.capture.script.set("https://portal.example.gov/doc", refused(401));
  /* two requests share a host, so they go out on two ticks (R14's one fetch per host per tick) */
  const d1 = await w.cr.drain({});
  w.tick(60_000);
  const d2 = await w.cr.drain({});
  const d = { refused: [...d1.refused, ...d2.refused] };
  const gated = w.req(ids.gated);
  assert.deepEqual([gated.state, gated.code, gated.source_reason, gated.capture_sha], ["refused", "MEMBER_CAPTURE_ONLY", "login", null]);
  assert.match(gated.detail, /HTTP 401/);
  assert.ok(gated.detail.includes(MEMBER_ROUTE));
  const entry = d.refused.find((x) => x.request === ids.gated);
  assert.deepEqual([entry.code, entry.check, entry.translation, entry.source_reason, entry.route],
                   ["MEMBER_CAPTURE_ONLY", "C-28.20", ONLY.translation, "login", "member"]);
  const look = w.log().filter((l) => l.subject === gated.address).at(-1);
  assert.deepEqual([look.state, look.governed], ["LOOKED_INDETERMINATE", 0]);
  assert.match(look.detail, /^C-28\.20 MEMBER_CAPTURE_ONLY: /);
  /* every read states the source's reason (R40) and the code */
  const read = w.cr.requestById({ request: ids.gated, viewer: V("ann") });
  assert.deepEqual([read.code, read.source_reason], ["MEMBER_CAPTURE_ONLY", "login"]);
  /* a payment asked on the marked host is the source's ordinary refusal, retryable (R40, R42) */
  assert.deepEqual([w.req(ids.paid).code, w.req(ids.paid).source_reason], ["CAPTURE_SOURCE_REFUSED", "paywall"]);
  /* the supplied login never went to the marked host; on an unmarked host it rode as R41 says */
  const by = (loc) => w.capture.calls.filter((c) => c.opts.captureRequest.locator === loc).map((c) => c.opts.captureRequest);
  for (const c of [...by("https://social.example.com/in/jane"), ...by("https://social.example.com/paid")])
    assert.equal("credential" in c, false, c.locator);
  assert.equal(by("https://portal.example.gov/doc")[0].credential.secret, "pw2");
  assert.deepEqual([w.req(ids.portal).code, w.req(ids.portal).source_reason], ["CAPTURE_SOURCE_REFUSED", "login"]);
  assert.equal(JSON.stringify([w.rows(`SELECT * FROM capture_requests`), w.log(), d]).includes("\"pw\""), false);
});

test("R46 a non-login setting still rides to a marked host, and a withdrawn mark marks nothing", async () => {
  const w = world().scene();
  member(w, "ann");
  w.cr.markPlatform({ host: "social.example.com" }, { viewer: V("ann") });
  const ua = await w.creds.credentialSupply({ kind: "user-agent", host: "social.example.com", secret: "UA/1", scope: "group", by: "ann" });
  assert.equal(ua.ok, true);
  w.ask({ address: "https://social.example.com/a" });
  await w.cr.drain({});
  assert.equal(w.capture.calls.at(-1).opts.captureRequest.credential.secret, "UA/1");
  /* withdrawn: the drain treats the host as any other */
  const w2 = world().scene();
  member(w2, "ann");
  w2.cr.markPlatform({ host: "social.example.com" }, { viewer: V("ann") });
  w2.cr.unmarkPlatform({ host: "social.example.com" }, { viewer: V("ann") });
  await w2.creds.credentialSupply({ kind: "login", host: "social.example.com", secret: "pw", scope: "group", by: "ann" });
  const id = w2.ask({ address: "https://social.example.com/b" }).request;
  w2.capture.script.set("https://social.example.com/b", refused(401));
  await w2.cr.drain({});
  assert.equal(w2.capture.calls.at(-1).opts.captureRequest.credential.secret, "pw");
  assert.deepEqual([w2.req(id).code, w2.req(id).source_reason], ["CAPTURE_SOURCE_REFUSED", "login"]);
});

test("R46 R42 a request refused for a login on a host since marked a platform is not retried with a login: the retry is refused MEMBER_CAPTURE_ONLY and nothing is written; an unseen one still answers CAPTURE_REQUEST_NOT_RETRYABLE; withdrawn, it is retryable", async () => {
  const w = world().scene();
  member(w, "ann");
  const id = w.ask({ address: "https://social.example.com/in/jane" }).request;
  const mc = w.ask({ address: "https://social2.example.com/x" }).request;
  w.capture.script.set("https://social.example.com/in/jane", refused(401));
  await w.cr.drain({});
  assert.deepEqual([w.req(id).code, w.req(id).source_reason], ["CAPTURE_SOURCE_REFUSED", "login"]);
  w.cr.markPlatform({ host: "social.example.com" }, { viewer: V("ann") });
  const before = w.rows(`SELECT * FROM capture_requests ORDER BY request`);
  const a = w.cr.captureRequestRetry({ request: id }, { viewer: V("ann") });
  memberOnly(a, "retry");
  assert.deepEqual([a.request, a.site_kind], [id, "platform"]);
  assert.match(a.detail, /Nothing was changed/);
  assert.equal("terminal" in a, false);
  assert.deepEqual(w.rows(`SELECT * FROM capture_requests ORDER BY request`), before, "nothing written");
  /* the gate comes first: an unseen viewer learns nothing of the mark */
  for (const viewer of [null, "nobody"])
    assert.equal(w.cr.captureRequestRetry({ request: id }, { viewer }).code, "CAPTURE_REQUEST_NOT_RETRYABLE");
  /* a row the drain refused MEMBER_CAPTURE_ONLY is refused the same way */
  w.cr.markPlatform({ host: "social2.example.com" }, { viewer: V("ann") });
  w.capture.script.set("https://social2.example.com/x", refused(407));
  w.st.sql.exec(`UPDATE capture_requests SET state='requested' WHERE request=?`, mc);
  await w.cr.drain({ now: w.clock.ms + 120_000 });
  assert.equal(w.req(mc).code, "MEMBER_CAPTURE_ONLY");
  memberOnly(w.cr.captureRequestRetry({ request: mc }, { viewer: V("ann") }), "drain-refused");
  /* withdrawn, the source's refusal is answered as R42 says */
  w.cr.unmarkPlatform({ host: "social.example.com" }, { viewer: V("ann") });
  const b = w.cr.captureRequestRetry({ request: id }, { viewer: V("ann") });
  assert.deepEqual([b.ok, b.state], [true, "requested"]);
});

test("R46 a member or the administrator marks a host a platform (group-wide, no secret), withdraws it keeping the row, and every recognised viewer lists the marks; a machine class, an absent viewer or a host that is not a bare host name is refused CAPTURE_PLATFORM_MARK_REFUSED (C-28.22) and nothing is written; it never throws", () => {
  const w = world().scene();
  const marks = () => w.rows(`SELECT * FROM capture_request_platforms ORDER BY mark`);
  const no = (a, why) => assert.deepEqual([a.ok, a.code, a.reason, a.check, a.translation],
    [false, "CAPTURE_PLATFORM_MARK_REFUSED", "CAPTURE_PLATFORM_MARK_REFUSED", "C-28.22",
     CAPTURE_REQUEST_CHECKS.CAPTURE_PLATFORM_MARK_REFUSED.translation], why);
  for (const viewer of [null, undefined, "", "nobody", "class:daemon", "class:ai", "class:probe", "class:member", "token:x"])
    no(w.cr.markPlatform({ host: "social.example.com" }, { viewer }), String(viewer));
  for (const host of ["", "  ", "https://social.example.com", "social.example.com/in", "social.example.com:443",
                      "user@social.example.com", "localhost", "-bad.example.com", "a b.example.com", 7, null, {}])
    no(w.cr.markPlatform({ host }, { viewer: V("ann") }), String(host));
  assert.deepEqual(marks(), []);
  const a = w.cr.markPlatform({ host: " Social.Example.COM " }, { viewer: V("ann") });
  assert.equal(a.ok, true);
  assert.equal(a.already, false);
  assert.match(a.mark.mark, /^PLM-\d{14}-[0-9a-f]{12}$/);
  assert.deepEqual({ ...a.mark, mark: null }, { mark: null, host: "social.example.com", kind: "platform", scope: "group",
    marked_by: "ann", marked_at: "2026-09-28T01:00:00Z", withdrawn_at: null, withdrawn_by: null });
  const again = w.cr.markPlatform({ host: "social.example.com" }, { viewer: V("bob") });
  assert.deepEqual([again.ok, again.already, again.mark.mark, again.mark.marked_by], [true, true, a.mark.mark, "ann"]);
  for (const viewer of ["admin", "class:admin"])
    assert.equal(w.cr.markPlatform({ host: `${viewer.replace(":", "-")}.example.net` }, { viewer }).mark.marked_by, "admin");
  assert.equal(marks().length, 3);
  /* the list: every recognised viewer, oldest first, bounded; an unrecognised one sees none */
  for (const viewer of [V("ann"), V("zed"), "class:daemon", "admin"])
    assert.deepEqual(w.cr.platformHosts({ viewer }).marks.map((m) => m.host),
                     ["social.example.com", "admin.example.net", "class-admin.example.net"], viewer);
  assert.deepEqual(w.cr.platformHosts({ viewer: null }), { count: 0, limit: 200, truncated: false, marks: [] });
  const cut = w.cr.platformHosts({ viewer: V("ann"), limit: 2 });
  assert.deepEqual([cut.count, cut.limit, cut.truncated], [2, 2, true]);
  /* withdrawing keeps the row, stamped; twice answers already; refused as marking is */
  no(w.cr.unmarkPlatform({ host: "social.example.com" }, { viewer: "class:ai" }), "ai");
  no(w.cr.unmarkPlatform({ host: "http://x" }, { viewer: V("ann") }), "bad host");
  w.tick(60_000);
  const u = w.cr.unmarkPlatform({ host: "SOCIAL.example.com" }, { viewer: V("bob") });
  assert.deepEqual([u.ok, u.already, u.mark.withdrawn_by, u.mark.withdrawn_at], [true, false, "bob", "2026-09-28T01:01:00Z"]);
  assert.deepEqual(w.cr.unmarkPlatform({ host: "social.example.com" }, { viewer: V("bob") }), { ok: true, already: true, host: "social.example.com" });
  assert.equal(marks().length, 3, "the withdrawn row stays");
  /* marked again after a withdrawal: a new mark */
  const re = w.cr.markPlatform({ host: "social.example.com" }, { viewer: V("ann") });
  assert.deepEqual([re.already, re.mark.mark === a.mark.mark], [false, false]);
  assert.equal(JSON.stringify(marks()).includes("secret"), false);
  for (const junk of [null, undefined, 5, { host: { toString: null } }])
    for (const f of ["markPlatform", "unmarkPlatform"]) assert.doesNotThrow(() => w.cr[f](junk, { viewer: V("ann") }));
  for (const junk of [null, undefined, 5]) assert.doesNotThrow(() => w.cr.platformHosts(junk ?? undefined));
});

test("R47 both tables are declared explicitly through record-core's declareTable with their classes: capture_requests keyed by target with lead_inquiry cleared (R35), bundle sight; the platform marks group sight and purge-exempt; a whole-store purge clears the requests and keeps the marks", () => {
  const w = world().scene();
  const mine = w.record.declaredTables().filter((d) => d.module === "capture-requests");
  assert.deepEqual(mine, [
    { module: "capture-requests", name: "capture_requests", keys: ["target"], clears: ["lead_inquiry"], purge: "clear",
      expunge: "none", export: "admin-only", sight: "bundle", derive: "stored", version_chain: false },
    { module: "capture-requests", name: "capture_request_platforms", purge: "exempt", expunge: "none",
      export: "admin-only", sight: "group", derive: "stored", version_chain: false },
    { module: "capture-requests", name: "records_requests", keys: ["standard"], purge: "clear", expunge: "none",
      export: "yes", sight: "bundle", derive: "stored", version_chain: false },
  ]);
  assert.equal(CAPTURE_REQUESTS_TABLES.length, 3);
  assert.equal(Object.isFrozen(CAPTURE_REQUESTS_TABLES), true);
  for (const t of ["capture_requests", "capture_request_platforms"])
    assert.equal(w.record.declareTable("x", [{ name: t, purge: "clear", expunge: "none", export: "yes", sight: "group",
                                               derive: "stored", version_chain: false }]).reason, "TABLE_DECLARED", t);
  w.ask();
  w.cr.markPlatform({ host: "social.example.com" }, { viewer: V("ann") });
  w.record.purge({});
  assert.equal(count(w), 0);
  assert.equal(w.row(`SELECT count(*) AS n FROM capture_request_platforms`).n, 1, "a reset corpus does not lift a mark");
});
