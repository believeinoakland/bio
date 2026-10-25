/* doorbell R13 (T50; N1194; JOURNEYS V4 B-40): a knock whose bytes the record already holds is marked pulled to the
   holder, names it only to a viewer who may see it, and writes nothing else. At the module's interface (`pullKnock`,
   `inboxResolve`, and the routes), over fixture.mjs; provenance's real `homeOf` (its R4, `homeOfOver`) answers over the same storage. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket, sha, register } from "./fixture.mjs";
import { doorbellOps } from "../../../src/doorbell/index.mjs";
import { MACHINE_CLASS_PREFIX } from "../../../src/record-grammar/index.mjs";
import { homeOfOver } from "../provenance/fixtures.mjs";

/* provenance R4 as the doorbell reaches it: the register row, only while its bundle exists. */
function setup() {
  const b = bucket();
  const f = fresh({ evidence: b, env: { INSTANCE_NAME: "inst" } });
  f.c.provenance.homeOf = homeOfOver({ host: f.ctx, record: f.core }).homeOf;
  return { ...f, b, prov: f.c.provenance };
}
const everything = (rows) => rows(`SELECT name FROM sqlite_master WHERE type='table'`).map((r) => r.name)
  .map((t) => [t, JSON.stringify(rows(`SELECT * FROM ${t}`))]);
const butInbox = (rows) => everything(rows).filter(([t]) => t !== "inbox");
const route = (c, name, qs = "", body = null) => doorbellOps(c, new URL(`http://x/${name}?${qs}`), body)[name]();
const ALICE = "member:alice";

test("R13: a knock whose bytes a registered capture holds answers existed with its holder for a viewer who sees it, is marked pulled to that digest, and writes no receipt, document, actor, register row or bytes, calling within not at all", async () => {
  const { c, s, rows, prov, b } = setup();
  const k = await c.knock({ content: "already in the record", note: "again", sourceAddress: "1.1.1.1" });
  const d = sha("already in the record");
  register(s, d, "BUNDLE-1");
  const before = butInbox(rows), held = new Set(b.held.keys());
  let called = 0;
  const r = await c.pullKnock({ knockId: k.knockId, by: "member:bob", viewer: ALICE, at: "2026-10-01T10:00:00Z", within: () => { called++; return { ok: true }; } });
  assert.deepEqual(r, { ok: true, existed: true, knockId: k.knockId, capture: { sha256: d, bytes: 21 }, holder: "BUNDLE-1",
                        pulled_by: "member:bob", pulled_at: "2026-10-01T10:00:00Z" });
  assert.equal("document" in r, false, "no document");
  assert.equal(called, 0, "within is not called");
  assert.deepEqual(prov.receipts, [], "no receipt");
  assert.deepEqual(butInbox(rows), before, "receipts, actors, register rows and every other table as they were");
  assert.deepEqual(new Set(b.held.keys()), held, "no bytes written");
  const row = rows(`SELECT status, resolved_by, capture_sha, pulled_by, pulled_at FROM inbox WHERE knock_id = ?`, k.knockId)[0];
  assert.deepEqual({ ...row }, { status: "pulled", resolved_by: "member:bob", capture_sha: d, pulled_by: "member:bob", pulled_at: "2026-10-01T10:00:00Z" });
});

test("R13: the holder is named only to a viewer who may see it (membership R43): one who may not, or none at all, is answered holder null, the pull otherwise the same", async () => {
  for (const viewer of ["member:carol", null, undefined, "", "nonsense"]) {
    const { c, s, rows } = setup();
    const k = await c.knock({ content: "private holding", sourceAddress: "1.1.1.1" });
    const d = sha("private holding");
    register(s, d, "PROJ-HELD", { project: "PROJ-A" });
    const r = await c.pullKnock({ knockId: k.knockId, by: "member:bob", viewer });
    assert.deepEqual([r.ok, r.existed, r.holder, r.capture], [true, true, null, { sha256: d, bytes: 15 }], String(viewer));
    assert.equal(rows(`SELECT capture_sha FROM inbox`)[0].capture_sha, d, "marked pulled to the digest all the same");
  }
  /* a machine credential sees every bundle */
  const { c, s } = setup();
  const k = await c.knock({ content: "m", sourceAddress: "1.1.1.1" });
  register(s, sha("m"), "PROJ-HELD", { project: "PROJ-A" });
  assert.equal((await c.pullKnock({ knockId: k.knockId, by: "member:bob", viewer: `${MACHINE_CLASS_PREFIX}admin` })).holder, "PROJ-HELD");
});

test("R13: inboxResolve to pulled passes the viewer on and records the reason on the row with the pull; the routes pass the stamped viewer, never the body's", async () => {
  const { c, s, rows } = setup();
  const k = await c.knock({ content: "route me", sourceAddress: "1.1.1.1" });
  const d = sha("route me");
  register(s, d, "BUNDLE-2");
  const r = await c.inboxResolve({ knockId: k.knockId, status: "pulled", by: "member:bob", reason: "we hold this", viewer: ALICE });
  assert.deepEqual([r.ok, r.existed, r.holder], [true, true, "BUNDLE-2"]);
  assert.equal(rows(`SELECT resolve_reason FROM inbox`)[0].resolve_reason, "we hold this");
  /* the routes */
  const k2 = await c.knock({ content: "route two", sourceAddress: "1.1.1.2" });
  register(s, sha("route two"), "PROJ-HELD-2", { project: "PROJ-B" });
  const seen = await route(c, "inboxpull", `by=member:bob&viewer=${ALICE}`, { knockId: k2.knockId, viewer: `${MACHINE_CLASS_PREFIX}admin` });
  assert.equal(seen.holder, null, "the stamp in the query, not the body's copy");
  const k3 = await c.knock({ content: "route three", sourceAddress: "1.1.1.3" });
  register(s, sha("route three"), "BUNDLE-3");
  const resolved = await route(c, "inboxresolve", `viewer=${ALICE}`, { knockId: k3.knockId, status: "pulled", by: "member:bob", reason: "r", viewer: `${MACHINE_CLASS_PREFIX}admin` });
  assert.equal(resolved.holder, "BUNDLE-3");
});

test("R13 (controls): a knock of new bytes is the pull unchanged; one whose home bundle was deleted is pulled afresh; a discarded knock answers KNOCK_DISCARDED first; a knock already pulled answers existed with its document and no holder key", async () => {
  const { c, s, rows, prov } = setup();
  /* new bytes: the act unchanged */
  const fresh1 = await c.knock({ content: "brand new", sourceAddress: "1.1.1.1" });
  const r1 = await c.pullKnock({ knockId: fresh1.knockId, by: "member:bob", viewer: ALICE, at: "2026-10-01T10:00:00Z" });
  assert.deepEqual([r1.ok, r1.existed, "holder" in r1, typeof r1.document], [true, false, false, "object"]);
  assert.equal(prov.receipts.length, 1);
  /* home bundle gone: a register row alone is no home */
  const k2 = await c.knock({ content: "orphaned", sourceAddress: "1.1.1.2" });
  register(s, sha("orphaned"), "GONE");
  rows(`DELETE FROM bundles WHERE bundle_id = 'GONE'`);
  const r2 = await c.pullKnock({ knockId: k2.knockId, by: "member:bob", viewer: ALICE });
  assert.deepEqual([r2.ok, r2.existed, typeof r2.document], [true, false, "object"]);
  /* discarded first */
  const k3 = await c.knock({ content: "set aside", sourceAddress: "1.1.1.3" });
  register(s, sha("set aside"), "BUNDLE-4");
  c.inboxResolve({ knockId: k3.knockId, status: "discarded", by: "member:bob", reason: "no" });
  const r3 = await c.pullKnock({ knockId: k3.knockId, by: "member:bob", viewer: ALICE });
  assert.deepEqual([r3.ok, r3.reason], [false, "KNOCK_DISCARDED"]);
  /* already pulled: R13's own existed, with the document, even though the digest is now held */
  register(s, sha("brand new"), "BUNDLE-5");
  const r4 = await c.pullKnock({ knockId: fresh1.knockId, by: "member:bob", viewer: ALICE });
  assert.deepEqual([r4.ok, r4.existed, "holder" in r4, typeof r4.document], [true, true, false, "object"]);
  assert.equal(prov.receipts.length, 2, "only the two afresh pulls wrote a receipt");
});
