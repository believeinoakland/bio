/* screens-publish, T51 fix round 6 (G20; S11): the docket's document picker reaches every held document, or says how many it lists. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open, main, drew, ok, refusedIn, P, C } from "./fixtures.mjs";

const PATH = `/app/docket/${P}/${C}`;
const sha = (i) => i.toString(16).padStart(64, "0");
const ROWS = (n) => Array.from({ length: n }, (_, i) => ({ bundle_id: `INFO-2026-${String(i + 1).padStart(4, "0")}`, title: `Held document ${i + 1}`, since: "2026-10-12T10:00:00Z", capture: { sha256: sha(i + 1) } }));
/** `heldcaptures` as capture R77 pages it: `limit` rows, `truncated` and `next` (the last row's index) while more remain, `after` resuming. */
const held = (n, fail = null) => (req) => {
  const q = req.query || {}, at = q.after ? Number(q.after) : 0, lim = Number(q.limit);
  if (fail !== null && at >= fail) return refusedIn("HELD_UNREADABLE");
  const rows = ROWS(n).slice(at, at + lim), end = at + rows.length;
  return ok({ ok: true, held: rows, limit: lim, truncated: end < n, next: end < n ? String(end) : null });
};
const values = (p) => p.doc.getElementById("dk-capture").querySelectorAll("option").map((o) => o.getAttribute("value"));

test("R8 G20 the docket's picker reaches the 250th held document: the next page is read from `next` and none is claimed past what is listed", async () => {
  const p = await open(PATH, { plane: { heldcaptures: held(250) } });
  assert.equal(values(p).length, 250, "all 250, not the first 200");
  assert.ok(values(p).includes(sha(250)));
  assert.equal(p.byOp("heldcaptures").length, 2);
  assert.equal(p.byOp("heldcaptures")[1].query.after, "200");
  assert.equal(main(p).querySelector("[data-captures-more]"), null, "control: nothing is said to be left out when nothing is");
  const few = await open(PATH, { plane: { heldcaptures: held(40) } });
  assert.equal(values(few).length, 40);
  assert.equal(few.byOp("heldcaptures").length, 1, "control: one page when it is all");
});

test("R8 G20 a page that cannot be read is drawn failed and the picker is not given as the whole list", async () => {
  const p = await open(PATH, { plane: { heldcaptures: held(250, 200) } });
  assert.ok(!p.doc.getElementById("dk-capture"), "a partial list is not offered as the whole");
  assert.ok(main(p).querySelector('[data-state="failed"]'), "the failure is drawn");
});
