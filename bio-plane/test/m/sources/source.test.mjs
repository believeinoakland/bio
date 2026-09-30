/* sources: where a source comes from (R1) and who is never one (R12). */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V, MACHINE, SECRET, OTHER_SECRET, sha } from "./fixture.mjs";
import { SOURCES_CHECKS } from "../../../src/sources/index.mjs";

const codeOf = (r) => (r && r.ok === false ? r.reason : "ok");

test("R1 a source exists for each pulled knock: one per pseudonym, one per knock sent without a secret; sourceOf answers the capture's own source verbatim and the source's current history beside it", async () => {
  const w = seeded();
  const a = await w.pulled({ secret: SECRET });
  assert.equal(a.answer.ok, true);
  assert.match(a.sourceId, /^SRC-2026-\d{4}$/, "a source's id is minted opaque (record-core mintOpaqueId)");
  /* verbatim: capture R65's source, from the knock's receipt */
  assert.deepEqual(a.answer.source, { kind: "knocker", named: false, pseudonym: a.row.pseudonym,
    receipt: { knock_id: a.row.knock_id, sha256: a.row.sha256, bytes: a.row.bytes, received: a.row.received } });
  assert.deepEqual(a.answer.history, [], "the current history, empty until something is disclosed");
  /* one per pseudonym: a second knock with the same secret is the same source */
  const a2 = await w.pulled({ secret: SECRET });
  assert.equal(a2.sourceId, a.sourceId, "the same knocker secret is the same source");
  assert.equal(a2.answer.source.receipt.knock_id, a2.row.knock_id, "each capture keeps its own stated source");
  /* a different secret: a different source */
  const b = await w.pulled({ secret: OTHER_SECRET });
  assert.notEqual(b.sourceId, a.sourceId);
  /* one per knock without a secret */
  const c1 = await w.pulled(), c2 = await w.pulled();
  assert.notEqual(c1.sourceId, c2.sourceId, "two knocks without a secret are two sources");
  assert.equal(c1.answer.source.pseudonym, null);
  assert.notEqual(c1.sourceId, a.sourceId);
  /* minted and kept: a later read answers the same id, and mints nothing */
  const minted = w.count("minted_ids");
  assert.equal(w.s.sourceOf({ captureSha: c1.row.sha256, viewer: V("carol") }).sourceId, c1.sourceId);
  assert.equal(w.count("minted_ids"), minted, "a second read mints nothing");
  assert.equal(w.count("sources"), 4, "four sources: two pseudonyms, two knocks without a secret");
  /* the history beside it is the current one */
  const d = w.disclose(a.sourceId);
  const again = w.s.sourceOf({ captureSha: a.row.sha256, viewer: V("bob") });
  assert.deepEqual(again.history.map((e) => e.entry), [d.entry]);
  assert.deepEqual(again.source, a.answer.source, "a capture's stated source never changes");
  /* a capture's stated source never changes, even as the history grows and the source is linked */
  const after = w.s.sourceOf({ captureSha: a.row.sha256, viewer: V("bob") }).source;
  assert.deepEqual(after, a.answer.source);
  /* two knocks with the same bytes pulled apart: the earliest received is the source, every one listed */
  const same = "the same leaked memo";
  const k1 = await w.knock({ content: same, secret: SECRET, at: Date.parse("2026-09-30T09:00:00.000Z") });
  const k2 = await w.knock({ content: same, at: Date.parse("2026-09-30T09:30:00.000Z") });
  await w.pull(k2); await w.pull(k1);
  const both = w.s.sourceOf({ captureSha: sha(same), viewer: V("bob") });
  assert.equal(both.source.receipt.knock_id, k1.knock_id);
  assert.equal(both.sourceId, a.sourceId, "the earliest knock's source (the pseudonym's)");
  assert.deepEqual(both.sources.map((x) => x.source.receipt.knock_id), [k1.knock_id, k2.knock_id]);
  /* one keyed read of capture's per read (its R72), never a walk of the inbox */
  for (let i = 0; i < 50; i++) await w.pull(await w.knock());
  const reads = w.spy.reads;
  assert.equal(w.s.sourceOf({ captureSha: c2.row.sha256, viewer: V("bob") }).ok, true);
  assert.equal(w.spy.reads, reads + 1);
});

test("R1 refusals: NO_SUCH_SOURCE for a capture that is not a pulled knock, a knock not pulled or discarded, a malformed digest, and a viewer naming no active member; each carries its row and writes nothing", async () => {
  const w = seeded();
  const fresh = await w.knock({ secret: SECRET });
  const discarded = await w.knock();
  assert.equal(w.cap.inboxResolve({ knockId: discarded.knock_id, status: "discarded", by: "bob" }).ok, true);
  const row = await w.knock({ secret: OTHER_SECRET });
  await w.pull(row);
  const before = w.snapshot();
  for (const [captureSha, viewer, why] of [
    [fresh.sha256, V("bob"), "a knock still new"],
    [discarded.sha256, V("bob"), "a discarded knock"],
    [sha("fetched, never knocked"), V("bob"), "a capture that is not a knock"],
    ["not-a-digest", V("bob"), "a malformed digest"],
    [undefined, V("bob"), "no digest"],
    [row.sha256, MACHINE, "a machine credential"],
    [row.sha256, undefined, "no viewer"],
    [row.sha256, V("dave"), "a revoked member"],
    [row.sha256, V("nobody"), "an unknown member"],
  ]) {
    const r = w.s.sourceOf({ captureSha, viewer });
    assert.equal(codeOf(r), "NO_SUCH_SOURCE", why);
    assert.equal(r.check, SOURCES_CHECKS.NO_SUCH_SOURCE.check);
    assert.equal(r.translation, SOURCES_CHECKS.NO_SUCH_SOURCE.translation);
  }
  assert.deepEqual(w.snapshot(), before, "a refused read mints nothing");
  /* the negative controls: a member, the founder's two spellings, an administrator */
  for (const viewer of [V("bob"), V("alice"), "admin", "member:admin"])
    assert.equal(w.s.sourceOf({ captureSha: row.sha256, viewer }).ok, true, viewer);
});

test("R12 the capturing member is never recorded as the source of what someone else gave them: a source is a knocker's, never the pulling member's, and a capture a member fetched has none", async () => {
  const w = seeded();
  const row = await w.knock({ secret: SECRET });
  const pulled = await w.pull(row, "bob");
  assert.equal(pulled.document.capture.actor, "bob", "bob is the capture's actor (capture R65)");
  const r = w.s.sourceOf({ captureSha: row.sha256, viewer: V("bob") });
  assert.equal(r.source.kind, "knocker");
  assert.equal(r.source.named, false);
  assert.ok(!JSON.stringify(r.source).includes("bob"), "the stated source names no member");
  const src = w.rows(`SELECT * FROM sources WHERE source_id = ?`, r.sourceId)[0];
  assert.ok(!Object.values(src).includes("bob"), "the source row names no member");
  assert.equal(codeOf(w.s.sourceOf({ captureSha: sha("a page bob fetched"), viewer: V("bob") })), "NO_SUCH_SOURCE",
               "a capture a member fetched has no source here");
  /* every act that records something about a source is about the source, never names the member who recorded it as it */
  const d = w.disclose(r.sourceId);
  assert.equal(d.by, "bob", "the member is who recorded it");
  assert.equal(d.source, r.sourceId, "and the source is the knocker's");
});
