/* sources: R23, a handed-in capture's source is linked for listed members only (`sourceLinksFor`). */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V, MACHINE, SECRET } from "./fixture.mjs";

/** A knock pulled into the record whose bytes are also held in an information bundle (so the capture has a home and a
 *  receipt of route `doorbell`), and the source behind it. `via` is the receipt's route. */
async function handedIn(w, { via = "doorbell", secret = SECRET, content } = {}) {
  const text = content ?? `handed-in material ${Math.random()}`;
  const row = await w.knock({ content: text, secret });
  await w.pull(row);
  const cap = w.captured({ text, via });
  const sourceId = w.s.sourceOf({ captureSha: row.sha256, viewer: V("bob") }).sourceId;
  return { sha: cap.sha, sourceId, row };
}
const one = (w, sha, viewer) => w.s.sourceLinksFor({ captureShas: [sha], viewer }).links[0];

test("R23 a listed member gets the source for a doorbell capture; an unlisted member, and an administrator who is not listed, get handed_in true and no source", async () => {
  const w = seeded();
  const h = await handedIn(w);
  assert.equal(w.disclose(h.sourceId).ok, true, "a name stored with bob in its sight list");
  assert.deepEqual(one(w, h.sha, V("bob")), { captureSha: h.sha, handed_in: true, source: h.sourceId });
  assert.deepEqual(one(w, h.sha, V("carol")), { captureSha: h.sha, handed_in: true });
  assert.deepEqual(one(w, h.sha, V("alice")), { captureSha: h.sha, handed_in: true }, "an administrator who is not listed is unlisted");
  assert.deepEqual(one(w, h.sha, MACHINE), { captureSha: h.sha, handed_in: true });
});

test("R23 a source with nothing recorded has no listed member; a detail known and not recorded lists no one", async () => {
  const w = seeded();
  const h = await handedIn(w);
  assert.equal(one(w, h.sha, V("bob")).source, undefined);
  const r = w.disclose(h.sourceId, { recorded: false, revealed: { kind: "name" }, sight: undefined });
  assert.equal(r.ok, true);
  assert.equal(one(w, h.sha, V("bob")).source, undefined, "not recorded, so no sight list");
  assert.equal(one(w, h.sha, V("bob")).handed_in, true);
});

test("R23 an upload and an email capture answer handed_in false; a capture with no source answers no source", async () => {
  const w = seeded();
  const up = w.captured({ via: "direct" }), mail = w.captured({ via: "email" }), att = w.captured({ via: "email-attachment" });
  for (const c of [up, mail, att]) assert.deepEqual(one(w, c.sha, V("bob")), { captureSha: c.sha, handed_in: false });
  const door = w.captured({ via: "doorbell" });
  assert.deepEqual(one(w, door.sha, V("bob")), { captureSha: door.sha, handed_in: true }, "doorbell route, but no knock stands behind it");
});

test("R23 a capture the viewer may not see is answered as one with no source; the source's existence is not told", async () => {
  const w = seeded();
  const h = await handedIn(w);
  w.disclose(h.sourceId);
  const unknown = "0".repeat(64);
  assert.deepEqual(one(w, unknown, V("bob")), { captureSha: unknown, handed_in: false });
  assert.deepEqual(one(w, h.sha, null), { captureSha: h.sha, handed_in: false });
  assert.deepEqual(one(w, h.sha, "nobody"), { captureSha: h.sha, handed_in: false });
  /* a capture whose home is a project its viewer does not see */
  w.st.sql.exec(`UPDATE bundles SET object_type = 'project' WHERE bundle_id = ?`, w.prov.homeOf(h.sha).bundleId);
  assert.deepEqual(one(w, h.sha, V("bob")), { captureSha: h.sha, handed_in: false });
});

test("R23 many captures in one answer, in order, at most 50; writes nothing, logs no read, holds nothing private", async () => {
  const w = seeded();
  const a = await handedIn(w), b = await handedIn(w, { via: "direct" });
  w.disclose(a.sourceId);
  const before = w.snapshot();
  const ans = w.s.sourceLinksFor({ captureShas: [b.sha, a.sha], viewer: V("bob") });
  assert.deepEqual(ans.links.map((l) => l.captureSha), [b.sha, a.sha]);
  assert.deepEqual(ans.links.map((l) => l.handed_in), [false, true]);
  assert.deepEqual(w.snapshot(), before, "no row written, no read logged");
  const text = JSON.stringify(ans);
  for (const secret of [a.row.knock_id, a.row.pseudonym, a.row.knocker_digest, "Pat Q. Example", "SRCE-"])
    if (secret) assert.equal(text.includes(secret), false, "no knock id, pseudonym, digest, value or entry");
  const many = w.s.sourceLinksFor({ captureShas: Array(60).fill(a.sha), viewer: V("bob") });
  assert.equal(many.links.length, 50);
  assert.equal(many.truncated, true);
  for (const bad of [undefined, null, 7, "x", [null, 3, {}]])
    assert.doesNotThrow(() => w.s.sourceLinksFor({ captureShas: bad, viewer: V("bob") }));
  assert.doesNotThrow(() => w.s.sourceLinksFor());
});
