/* capture-requests: retry with what a member supplied (R42), and the invariants (R31–R33, R36). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, T0, refused, sha } from "./fixture.mjs";
import { captureRequestsOps, captureRequestAttribution, CAPTURE_REQUEST_TTL_MS } from "../../../src/capture-requests/index.mjs";
import { CAPTURE_REQUEST_CHECKS } from "../../../checks/bio-checks.mjs";

const iso = (ms) => new Date(ms).toISOString().replace(/\.\d+Z$/, "Z");

test("R42 a refused request whose reason is the source's, under a target the viewer can see, returns to requested: attempts, last code and reason kept, expires now + 24 h; the drain judges it again and fetches with what R41 holds", async () => {
  const w = world().scene();
  const id = w.ask({ address: "https://login.example.org/doc" }).request;
  w.capture.script.set("https://login.example.org/doc", [refused(401)]);
  await w.cr.drain({});
  assert.deepEqual([w.req(id).state, w.req(id).source_reason], ["refused", "login"]);
  w.tick(3_600_000);
  w.st.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, created, updated)
                 VALUES ('ann', 'c', 'ann', 'member', 'active', 't', 't')`);
  const s = await w.creds.credentialSupply({ kind: "login", host: "login.example.org", secret: "pw", scope: "group", by: "ann" });
  assert.equal(s.ok, true);
  const url = new URL("http://x/capturerequestretry?viewer=member%3Aann&principal=member%3Aann%2Ftok1");
  const a = captureRequestsOps(w.cr, url, { request: id }).capturerequestretry();
  assert.deepEqual([a.ok, a.state, a.attempts, a.code, a.source_reason, a.expires],
                   [true, "requested", 1, "CAPTURE_SOURCE_REFUSED", "login", iso(T0 + 3_600_000 + CAPTURE_REQUEST_TTL_MS)]);
  const r = w.req(id);
  assert.deepEqual([r.state, r.attempts, r.code, r.source_reason, r.expires, r.updated],
                   ["requested", 1, "CAPTURE_SOURCE_REFUSED", "login", a.expires, iso(T0 + 3_600_000)]);
  const d = await w.cr.drain({});
  assert.equal(d.captured.length, 1);
  assert.equal(w.capture.calls.at(-1).opts.captureRequest.credential.secret, "pw");
  assert.deepEqual([w.req(id).state, w.req(id).source_reason, w.req(id).attempts], ["captured", null, 2]);
});

test("R42 any other request is refused CAPTURE_REQUEST_NOT_RETRYABLE (C-28.18) and nothing is written; it never throws", async () => {
  const w = world().scene();
  w.project("PROJ-H");
  const ids = {
    queued: w.ask({ address: "https://q.example.org/" }).request,
    conduct: w.ask({ address: "https://c.example.org/", purpose: "nope" }).request,
    source: w.ask({ address: "https://s.example.org/" }).request,
    held: w.ask({ address: "https://h.example.org/" }).request,
  };
  w.capture.script.set("https://s.example.org/", refused(402));
  w.capture.script.set("https://h.example.org/", refused(503));
  await w.cr.drain({});
  const hiddenId = w.ask({ address: "https://z.example.org/" }).request;
  w.st.sql.exec(`UPDATE capture_requests SET state='refused', source_reason='login', target='PROJ-H' WHERE request=?`, hiddenId);
  w.st.sql.exec(`INSERT INTO capture_requests (request, run, target, address, host, purpose, ua_mode, principal_plane,
                 principal_claude, state, attempts, requested_at, updated, expires, source_reason)
                 VALUES ('CR-EXP', 'R-1', 'INQ-1', 'https://e.org/', 'e.org', 'investigate', 'civicos', 'p', 'c', 'expired', 1,
                 't', 't', 't', 'login')`);
  const before = w.rows(`SELECT * FROM capture_requests ORDER BY request`);
  const no = (request, viewer = V("ann")) => {
    const a = w.cr.captureRequestRetry({ request }, { viewer });
    assert.deepEqual([a.ok, a.code, a.reason, a.check, a.translation],
      [false, "CAPTURE_REQUEST_NOT_RETRYABLE", "CAPTURE_REQUEST_NOT_RETRYABLE", "C-28.18",
       CAPTURE_REQUEST_CHECKS.CAPTURE_REQUEST_NOT_RETRYABLE.translation], String(request));
  };
  for (const id of [ids.queued, ids.conduct, ids.held, "CR-EXP", hiddenId, "CR-NONE", "", null]) no(id);
  no(ids.source, null);
  no(ids.source, "nobody");
  assert.deepEqual(w.rows(`SELECT * FROM capture_requests ORDER BY request`), before, "nothing written");
  for (const junk of [null, undefined, 7, { request: { toString: null } }])
    assert.doesNotThrow(() => w.cr.captureRequestRetry(junk, {}));
  assert.equal(w.cr.captureRequestRetry({ request: ids.source }, { viewer: V("ann") }).ok, true);
});

test("R31 the AI does not capture: the door writes a row and fetches nothing, the drain is the only path from a row to a fetch, and what leaves is what conduct judged, read from the row", async () => {
  const w = world().scene();
  const id = w.ask({ address: "https://a.example.org/doc", purpose: "acquire" }).request;
  assert.equal(w.capture.calls.length, 0, "the door fetched nothing");
  /* a body cannot change what leaves: the row's values are the arm's */
  w.st.sql.exec(`UPDATE capture_requests SET address='https://a.example.org/moved' WHERE request=?`, id);
  await w.cr.drain({});
  assert.deepEqual(w.capture.calls.map((c) => [c.opts.captureRequest.locator, c.opts.captureRequest.purpose]),
                   [["https://a.example.org/moved", "acquire"]]);
});

test("R32 conduct and attribution are applied once, at the drain: a row that outlived the door's rules is judged again before anything leaves", async () => {
  const w = world().scene();
  const id = w.ask({ address: "https://a.example.org/" }).request;
  w.st.sql.exec(`UPDATE capture_requests SET principal_claude=' ', purpose='changed' WHERE request=?`, id);
  await w.cr.drain({});
  assert.deepEqual([w.req(id).state, w.req(id).code], ["refused", "CAPTURE_ATTRIBUTION_ONE_PRINCIPAL"]);
  assert.equal(w.capture.calls.length, 0);
});

test("R33 every capture made for a request is attributed to the daemon at the session's request, naming both principals and never a token value or a person on the act; none is made that cannot be so attributed", async () => {
  const w = world({ env: { DAEMON_TOKEN: "super-secret-daemon-token", VERSION: "1", INSTANCE_NAME: "i" } }).scene();
  const id = w.ask().request;
  const d = await w.cr.drain({});
  const at = d.captured[0].attribution;
  assert.equal(at.actor, "token:daemon");
  assert.deepEqual(at.principals, { plane: "member:ann/tok1", claude: "instance" });
  assert.match(at.statement, /^the daemon captured this, at the investigative session's request \(run R-1\), under member:ann\/tok1, paid by instance$/);
  const everything = JSON.stringify([w.rows(`SELECT * FROM capture_requests`), w.log(), d]);
  assert.equal(everything.includes("super-secret-daemon-token"), false);
  assert.deepEqual(w.log().at(-1).detail, captureRequestAttribution(w.req(id)).statement);
  const x = world().scene();
  x.run("R-ONE", { plane: "member:ann/tok1", claude: "" });
  x.ask({ run: "R-ONE" });
  await x.cr.drain({});
  assert.equal(x.capture.calls.length, 0);
});

test("R36 no place is named in the module's behaviour or text: its answers for a request anywhere carry no jurisdiction's name", async () => {
  const w = world({ env: { DAEMON_TOKEN: "d", VERSION: "1", INSTANCE_NAME: "elsewhere" } }).scene();
  w.ask({ address: "https://records.springfield.example/doc" });
  w.ask({ address: "https://x.example/r", render: "maybe" });
  w.ask({ address: "https://y.example/p", purpose: "nope" });
  const d = await w.cr.drain({});
  const out = JSON.stringify([d, w.cr.captureRequests({ viewer: V("ann") }), w.log(),
                              w.cr.captureRequestRetry({ request: "x" }, { viewer: V("ann") })]);
  for (const place of ["Oakland", "Alameda", "California"]) assert.equal(out.includes(place), false, place);
});
