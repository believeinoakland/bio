/* capture, fix round 6 of T51 (G32; A-14: a held file is downloaded again): `op=acquire` of an address the record already holds from a plain
   fetch is made conditional on that copy, so a source that has not changed is not pulled a second time. At the module's interface: the
   route `acquire` as the store's door calls it (`captureOps`), over a real first acquire whose answer is promoted into the register as the
   plane promotes it, and a scripted upstream that counts the bytes it is asked for. R106 (proposed: the digest handed to acquisition's
   conditional fetch), R73 (the act), R22 of `acquisition` (the 304). The tests that need acquisition's option `opts.heldSha` (ACQUISITION
   #29, BOB's K4604) say so in their titles and stay red by name until it merges. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket, network, governor, sha } from "./fixture.mjs";
import { captureOps } from "../../../src/capture/index.mjs";

const MiB = 1024 * 1024;
const ADDR = "https://nps.example/files/plan.pdf";
const ADMIN = "class:admin";
const route = (c, qs, body) => captureOps(c, new URL(`http://x/acquire?${qs}`), body, c.env).acquire();
const MEMBER = "cls=member&member=1&sessMember=member:m1&store=bio&viewer=member:m1";
const BEARER = `cls=admin&member=0&store=bio&viewer=${encodeURIComponent(ADMIN)}`;

/* A throttled upstream: the document is an ETag'd text of about 1 MiB served in 64 KiB pulls; a request carrying the held validator is
   answered 304 with no body. `pulled` counts the bytes the caller read from the body. */
const BODY = new TextEncoder().encode(`${"the plan of the park, section by section.\n".repeat(26000)}`);
function upstream({ etag = '"v1"' } = {}) {
  const t = { pulled: 0, requests: [], conditional: 0 };
  const serve = (_u, init = {}) => {
    const h = Object.fromEntries(Object.entries(init.headers ?? {}).map(([k, v]) => [k.toLowerCase(), v]));
    t.requests.push(h);
    if (etag && h["if-none-match"] === etag) { t.conditional++; return new Response(null, { status: 304, headers: { etag } }); }
    let at = 0;
    const stream = new ReadableStream({ pull(ctl) {
      if (at >= BODY.length) return ctl.close();
      const n = Math.min(64 * 1024, BODY.length - at);
      ctl.enqueue(BODY.subarray(at, at + n)); at += n; t.pulled += n;
    } }, { highWaterMark: 0 });
    return new Response(stream, { status: 200, headers: { "content-type": "text/plain", "content-length": String(BODY.length), ...(etag ? { etag } : {}) } });
  };
  return { t, routes: { [ADDR]: serve } };
}

/* The first acquire, and the promotion the plane makes of its document: the register row, the bundle and the register document. */
async function held(opts = {}) {
  const f = fresh({ evidence: bucket(), gov: governor() });
  const up = upstream(opts);
  const net = network(up.routes);
  try {
    const first = await route(f.c, MEMBER, { locator: ADDR });
    assert.equal(first.status, 200);
    const d = first.body.document.capture.sha256;
    f.s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version)
                  VALUES ('INFO-1', 'information', 'g', 't', 'collected', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z', 'x', 1)`);
    f.s.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, bytes) VALUES (?, 'INFO-1', 'x', ?)`, d, BODY.length);
    f.s.sql.exec(`INSERT INTO files (bundle_id, path, content, blob_sha, bytes, sha256) VALUES ('INFO-1', 'data/provenance.json', ?, NULL, 1, 'x')`,
                 JSON.stringify({ documents: [first.body.document] }));
    return { ...f, d, up, net, first };
  } catch (e) { net.restore(); throw e; }
}

test("R106 G32 (fix round 6): the arm hands acquisition the digest of the held plain copy as heldSha, the document having been promoted into the register (the real first acquire's own document)", async () => {
  const w = await held();
  try {
    const seen = [];
    const acquire = w.c.acquire.bind(w.c);
    w.c.acquire = (b, o) => { seen.push(o); return acquire(b, o); };
    await route(w.c, MEMBER, { locator: ADDR });
    await route(w.c, BEARER, { locator: ADDR });
    assert.deepEqual(seen.map((o) => o.heldSha), [w.d, w.d], "under a member's session and under an admin bearer alike");
  } finally { w.net.restore(); }
});

test("R106 G32 (fix round 6, controls): no heldSha when the caller's sight shows no copy, none was stated, the body asks for more than the plain document, the address is another, or the copy was not a plain fetch", async () => {
  const w = await held();
  try {
    const seen = [];
    w.c.acquire = (b, o) => { seen.push(o); return Promise.resolve({ status: 200, body: { ok: true } }); };
    const ask = async (qs, body) => { seen.length = 0; await route(w.c, qs, body); return seen[0].heldSha ?? null; };
    assert.equal(await ask(MEMBER, { locator: ADDR }), w.d, "the baseline");
    assert.equal(await ask("cls=member&member=1&sessMember=member:m1&store=bio&viewer=junk", { locator: ADDR }), null, "a viewer who sees no copy");
    assert.equal(await ask("cls=member&member=1&sessMember=member:m1&store=bio", { locator: ADDR }), null, "no viewer stated sees nothing");
    for (const extra of [{ render: true }, { via: "archive.org" }, { subresources: true }, { continue: "s1" }, { file: "x" }])
      assert.equal(await ask(MEMBER, { locator: ADDR, ...extra }), null, JSON.stringify(extra));
    assert.equal(await ask(MEMBER, { locator: "https://nps.example/files/other.pdf" }), null, "an address the record does not hold");
    assert.equal(await ask(MEMBER, { locator: "http://nps.example/files/plan.pdf" }), null, "no public https locator");
    assert.equal(await ask(MEMBER, {}), null, "no locator");
    /* a rendered capture is not a plain copy: the register document says how it was captured */
    w.s.sql.exec(`UPDATE files SET content = ? WHERE bundle_id = 'INFO-1'`,
                 JSON.stringify({ documents: [{ ...w.first.body.document, capture: { ...w.first.body.document.capture, method: "rendered" } }] }));
    assert.equal(await ask(MEMBER, { locator: ADDR }), null, "a rendered capture");
    w.s.sql.exec(`DELETE FROM files WHERE bundle_id = 'INFO-1'`);
    assert.equal(await ask(MEMBER, { locator: ADDR }), null, "the record cannot say how it was captured");
  } finally { w.net.restore(); }
});

test("R106 G32 (fix round 6; needs acquisition's opts.heldSha, ACQUISITION #29): a second acquire of the held file pulls no body: the source is asked with the held ETag, answers 304, and the answer is `unchanged` naming the held capture, under a member's session and under an admin bearer (red by name until acquisition merges)", async () => {
  for (const qs of [MEMBER, BEARER]) {
    const w = await held();
    try {
      const before = w.up.t.pulled;
      assert.equal(before, BODY.length, "the first acquire pulled the document once");
      const again = await route(w.c, qs, { locator: ADDR });
      assert.equal(again.status, 200);
      assert.deepEqual([again.body.existed, again.body.unchanged, again.body.capture.sha256, again.body.document], [true, true, w.d, undefined], qs);
      assert.equal(w.up.t.pulled, before, `the second acquire pulled no body (${qs})`);
      assert.equal(w.up.t.conditional, 1, "the one second request carried the held validator");
    } finally { w.net.restore(); }
  }
});

test("R106 G32 (fix round 6, control): a source that has changed (a new ETag) is fetched and filed as it always was, and a held copy with no validators recorded is fetched unconditionally (a member asking again still gets a copy)", async () => {
  const w = await held();
  try {
    const quiet = network({ [ADDR]: () => new Response(new TextEncoder().encode("a new edition of the plan"), { headers: { "content-type": "text/plain", etag: '"v2"' } }) });
    try {
      const changed = await route(w.c, MEMBER, { locator: ADDR });
      assert.equal(changed.status, 200);
      assert.deepEqual([changed.body.existed, changed.body.unchanged ?? false, changed.body.document.capture.sha256 === w.d], [false, false, false]);
    } finally { quiet.restore(); }
  } finally { w.net.restore(); }
  const bare = await held({ etag: null });
  try {
    assert.equal(bare.c.validatorsOf({ addressNorm: ADDR, captureSha: bare.d }), null, "the source sent no validator");
    const again = await route(bare.c, MEMBER, { locator: ADDR });
    assert.deepEqual([again.status, again.body.unchanged ?? false, again.body.existed], [200, false, true], "fetched again, the identical bytes answered held");
    assert.equal(bare.up.t.conditional, 0);
    assert.equal(sha(BODY), bare.d);
  } finally { bare.net.restore(); }
});
