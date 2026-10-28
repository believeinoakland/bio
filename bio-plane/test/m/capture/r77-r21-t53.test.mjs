/* capture R77 as T53 amends it (JOURNEYS R-21, D1 capture R?1): a member's own testimony is in `heldCaptures` for that member. The author's stamp is the one `provenance`
   writes on the testimony's register row (its R48's `author`, with `authored` 1), read by `heldCaptures`' `member` filter as an upload's actor is. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, register, sha } from "./fixture.mjs";

const world = () => {
  const f = fresh({});
  const words = sha("what I saw at the counter"), upload = sha("an uploaded printout"), other = sha("another member's words");
  register(f.s, words, "INFO-2026-0001-observation", { author: "member:ann" });
  register(f.s, upload, "INFO-2026-0002");
  f.c.recordCaptureActor({ captureSha: upload, actor: "member:ann", at: "2026-10-28T12:00:00Z" });
  register(f.s, other, "INFO-2026-0003-observation", { author: "member:bea" });
  return { ...f, words, upload, other };
};
const ids = (r) => r.held.map((x) => x.bundle_id);

test("R77 (R-21): `testify` as member M, then heldCaptures({member: M}) lists the testimony beside M's uploads; another member's list does not", async () => {
  const w = world();
  const mine = await w.c.heldCaptures({ member: "ann", viewer: "member:ann" });
  assert.deepEqual(ids(mine).sort(), ["INFO-2026-0001-observation", "INFO-2026-0002"]);
  assert.deepEqual(ids(await w.c.heldCaptures({ member: "member:ann", viewer: "member:ann" })).sort(), ["INFO-2026-0001-observation", "INFO-2026-0002"], "the stamp spelled with its prefix is the same member");
  assert.deepEqual(ids(await w.c.heldCaptures({ member: "bea", viewer: "member:ann" })), ["INFO-2026-0003-observation"], "another member's testimony is hers alone");
  assert.equal(ids(await w.c.heldCaptures({ member: "cy", viewer: "member:ann" })).length, 0);
});

test("R77 (R-21): a testimony row answers its author's stamp as the capture's actor; control: an upload is listed as before, and an unauthored register row with an author column set is not taken for testimony", async () => {
  const w = world();
  const held = await w.c.heldCaptures({ viewer: "member:ann", now: "2026-10-28T12:00:00Z" });
  const row = (id) => held.held.find((x) => x.bundle_id === id);
  assert.equal(row("INFO-2026-0001-observation").actor, "member:ann");
  assert.equal(row("INFO-2026-0002").actor, "member:ann");
  const trap = sha("not testimony");
  w.s.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, authored, author) VALUES (?, 'INFO-2026-0004', 'x', 0, 'member:ann')`, trap);
  w.s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version) VALUES ('INFO-2026-0004', 'information', 'g', 't', 'collected', '2026-01-01', '2026-01-01', 'x', 1)`);
  assert.equal(ids(await w.c.heldCaptures({ member: "ann", viewer: "member:ann" })).includes("INFO-2026-0004"), false);
});
