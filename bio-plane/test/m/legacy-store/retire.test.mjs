/* legacy-store: `op=retire`, the bulk retirement of verified Information over a selection at weight `refuse` — the
   retire arm of the old `refuse-gate` suite, converted (K674 (4)). A query selection whose answer SWAPS AT A CONSTANT
   COUNT (one member purged, one new member joining, so nothing was added or removed on the count and only the digest
   says the answer changed) is refused SET_MOVED, and no document moves state; a selection made fresh over the same
   criterion retires every member. Driven through the store's door, on a real store. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { store, sha } from "./fixture.mjs";

const STAMP = "viewer=class:member&owner=class:member";
const AUTHOR = "m-riley";
const ACK = encodeURIComponent("Batch of uniform public postings; bulk-release risks weighed.");
const MIT = encodeURIComponent("Sampled 12 of 40; checked sender domains and posting dates.");
const DATASET = JSON.stringify({ v: 1 });
const CAPTURE = "<html/>";
/* The two files verified state requires (C-2.7), so an entry-requirement refusal cannot pass for a gate refusal. */
const FULL = [
  { path: "data/dataset.json", text: DATASET, bytes: DATASET.length, sha256: sha(DATASET) },
  { path: "snapshots/capture.html", text: CAPTURE, bytes: CAPTURE.length, sha256: sha(CAPTURE) },
];
const infoMd = (id, mark) => `---
id: ${id}
object_type: information
schema: information@1
title: "Info ${id}"
current_state: collected
prior_state: null
created: "2026-07-01T00:00:00Z"
last_updated: "2026-07-02T00:00:00Z"
produced_by:
  mode: assisted
  capability_tier: session
group: believe-in-oakland
references: []
state_history: []
annotations_open: 0
reeval_pending:
  flag: false
  since: null
  source: null
visuals: []
criticality: supporting
source_status: unchanged
content_hash: "sha256:${sha(DATASET)}"
source:
  locator: "https://example.org/${id}"
  authority: "Example Jobs Board"
  retrieved: "2026-07-01"
monitoring:
  enabled: false
  frequency: none
  last_checked: null
---

## Summary

A ${mark} posting.

## Provenance Notes

Grade B fetch, hashed at receipt.

## Session Log

### Session 2026-07-02T00:00:00Z | Formation | assisted
Trigger: intake
Changes: created.

## Review Notes
`;

test("op=retire is refused SET_MOVED over a query selection swapped at a constant count, moving nothing; a fresh selection retires", async () => {
  const { call } = await store();
  const mkInfo = async (id) => {
    const text = infoMd(id, "retirefixture");
    const r = await call("/promote", {
      bundleId: id, base: null, snapKey: `${id}-new`, author: "suite",
      files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }, ...FULL],
      meta: { object_type: "information", group: "believe-in-oakland", title: `Info ${id}`, current_state: "collected",
              prior_state: null, created: "2026-07-01T00:00:00Z", last_updated: "2026-07-02T00:00:00Z",
              criticality: "supporting" } });
    assert.equal(r.ok, true, `${id} is written: ${JSON.stringify(r).slice(0, 300)}`);
  };
  const stateOf = async (id) => (await call(`/projection?id=${id}&viewer=class:member`))?.current_state;
  const selectQuery = (q) => call(`/select?${STAMP}&q=${encodeURIComponent(q)}`);
  const selectIds = (ids) => call(`/select?${STAMP}&q=`, { ids });
  const resolve = (h, weight) => call(`/selection?handle=${h}&${STAMP}&weight=${weight}`);
  const release = (h) => call(`/release?handle=${h}&acknowledgment=${ACK}&mitigation=${MIT}&author=${AUTHOR}&${STAMP}`);
  const retire = (h) => call(`/retire?handle=${h}&reason=${encodeURIComponent("superseded by the consolidated record")}`
    + `&author=${AUTHOR}&${STAMP}`);
  const id = (n) => `INFO-2026-061${n}-retirefixture`;

  for (const n of [1, 2, 3, 4, 5]) await mkInfo(id(n));
  /* Four of the five are carried to `verified` through an unmoved enumeration, the only legal route into retire's state. */
  const rel = await release((await selectIds([1, 2, 3, 4].map(id))).handle);
  assert.equal((rel.released || []).length, 4, JSON.stringify(rel).slice(0, 300));
  const s = await selectQuery("state:verified retirefixture");
  assert.equal(s.kind, "query");
  assert.equal(s.n, 4);

  /* The swap, at a constant count: one leaves the answer, one joins it. */
  await call(`/purge?bundleId=${id(1)}`);
  assert.equal(((await release((await selectIds([id(5)])).handle)).released || []).length, 1);
  const rep = await resolve(s.handle, "report");
  assert.deepEqual([rep.n, rep.moved, rep.drift?.added, rep.drift?.removed, rep.drift?.digestChanged], [4, false, 0, 0, true]);

  const r = await retire(s.handle);
  assert.equal(r.ok, false);
  assert.equal(r.reason, "SET_MOVED");
  for (const n of [2, 3, 4, 5]) assert.equal(await stateOf(id(n)), "verified", `${id(n)} did not move`);

  const fresh = await selectQuery("state:verified retirefixture");
  const done = await retire(fresh.handle);
  assert.equal(done.ok, true, JSON.stringify(done).slice(0, 300));
  assert.equal(done.weight, "refuse");
  assert.deepEqual(done.retired, [2, 3, 4, 5].map(id));
  for (const n of [2, 3, 4, 5]) assert.equal(await stateOf(id(n)), "retired", `${id(n)} is retired`);
});
