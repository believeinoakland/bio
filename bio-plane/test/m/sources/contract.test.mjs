/* sources: the `source_knocks` read contract later modules read (R15; N377, K547), a source id that cannot be drawn
   (R1 through record-core's `mintExhausted`, its R62; K576), and a link heard by the linked source's listeners (R10). */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V, SECRET, OTHER_SECRET, sha } from "./fixture.mjs";
import { RECORD_CORE_CHECKS, mintExhausted } from "../../../src/record-core/index.mjs";

const COLUMNS = ["knock_id", "source_id", "capture_sha", "bytes", "received"];
const VALUE = "Unmistakable Value 5510";

test("R15 source_knocks is a read contract: exactly the columns (knock_id, source_id, capture_sha, bytes, received), one row per pulled knock a minted source stands behind, written when the source is minted, holding no value, secret or contact", async () => {
  const w = seeded();
  assert.deepEqual(w.rows(`PRAGMA table_info(source_knocks)`).map((c) => c.name), COLUMNS,
                   "its columns keep these names, and it has no other");
  const table = () => w.rows(`SELECT ${COLUMNS.join(", ")} FROM source_knocks ORDER BY knock_id`);
  /* the rows, from the inbox: every pulled knock whose source is minted, and nothing else */
  const expected = (ids) => w.rows(`SELECT knock_id, sha256 AS capture_sha, bytes, received FROM inbox WHERE knock_id IN (${ids.map(() => "?").join(",")})
                                    ORDER BY knock_id`, ...ids);
  const expect = (bySource) => {
    const want = [];
    for (const [sourceId, knocks] of bySource)
      for (const r of expected(knocks.map((k) => k.knock_id))) want.push({ knock_id: r.knock_id, source_id: sourceId, capture_sha: r.capture_sha,
                                                                             bytes: r.bytes, received: r.received });
    return want.sort((a, b) => (a.knock_id < b.knock_id ? -1 : 1));
  };
  /* a pseudonym's knocks: two pulled before any read, one left new, one discarded */
  const p1 = await w.knock({ secret: SECRET }), p2 = await w.knock({ secret: SECRET });
  const pNew = await w.knock({ secret: SECRET }), pGone = await w.knock({ secret: SECRET });
  await w.pull(p1); await w.pull(p2);
  assert.equal(w.cap.inboxResolve({ knockId: pGone.knock_id, status: "discarded", by: "bob", reason: "not material for the group" }).ok, true);
  /* knocks without a secret: one pulled and read, one pulled and never read */
  const b1 = await w.knock(), b2 = await w.knock();
  await w.pull(b1); await w.pull(b2);
  assert.deepEqual(table(), [], "nothing before a source is minted");
  /* reading one of the pseudonym's captures mints its source, and binds every knock of it already pulled */
  const P = w.s.sourceOf({ captureSha: p1.sha256, viewer: V("bob") }).sourceId;
  const B1 = w.s.sourceOf({ captureSha: b1.sha256, viewer: V("bob") }).sourceId;
  assert.deepEqual(table(), expect([[P, [p1, p2]], [B1, [b1]]]),
                   "p2's row is written when the source is minted, though its capture was never read; b2's source is not minted");
  /* each row is the receipt the capture's own source states (capture R65) */
  const stated = w.s.sourceOf({ captureSha: p2.sha256, viewer: V("carol") }).source.receipt;
  const row = table().find((r) => r.knock_id === p2.knock_id);
  assert.deepEqual({ knock_id: row.knock_id, sha256: row.capture_sha, bytes: row.bytes, received: row.received }, stated);
  /* a knock pulled after the minting is bound before any act that may move the source's rung, so R10's move names it */
  const p3 = await w.knock({ secret: SECRET });
  await w.pull(p3);
  const moves = [];
  assert.equal(w.s.onDisclosure("reevaluation", (m) => { moves.push({ ...m, bound: table().some((r) => r.knock_id === p3.knock_id) }); }).ok, true);
  const e = w.disclose(P, { revealed: { kind: "name", value: VALUE } });
  assert.equal(e.ok, true);
  assert.deepEqual(moves, [{ source: P, entry: e.entry, rung_before: "same_knocker", rung_after: "known_to_group", bound: true }]);
  /* a consent binds the same way */
  const p4 = await w.knock({ secret: SECRET });
  await w.pull(p4);
  w.tick();
  assert.equal(w.s.recordConsent({ source: P, entry: e.entry, audience: "group", evidence: "a signed note", by: "bob" }).ok, true);
  /* two knocks with the same bytes pulled into one capture: a row each, the same capture */
  const same = "a memo two people handed over";
  const s1 = await w.knock({ content: same, secret: OTHER_SECRET }), s2 = await w.knock({ content: same });
  await w.pull(s1); await w.pull(s2);
  const both = w.s.sourceOf({ captureSha: sha(same), viewer: V("bob") });
  const [S1, S2] = both.sources.map((x) => x.sourceId);
  const all = expect([[P, [p1, p2, p3, p4]], [B1, [b1]], [S1, [s1]], [S2, [s2]]]);
  assert.deepEqual(table(), all, "one row per pulled knock a minted source stands behind");
  /* every read again, and every act, writes no second row and changes none */
  for (const k of [p1, p2, p3, p4, b1]) w.s.sourceOf({ captureSha: k.sha256, viewer: V("alice") });
  w.tick();
  await w.s.linkClaim({ source: P, to: B1, evidence: "the same handwriting", by: "bob" });
  assert.deepEqual(table(), all, "written once, never changed");
  assert.equal(w.rows(`SELECT COUNT(DISTINCT knock_id) AS n FROM source_knocks`)[0].n, w.count("source_knocks"));
  /* no value, secret or contact: nothing the knocker sent but the receipt, and no disclosure */
  const text = JSON.stringify(w.rows(`SELECT * FROM source_knocks`));
  const digests = w.rows(`SELECT knocker_digest, pseudonym FROM inbox WHERE knocker_digest IS NOT NULL`);
  for (const secret of [SECRET, OTHER_SECRET, VALUE, "someone@example.org", "a note", ...digests.flatMap((d) => [d.knocker_digest, d.pseudonym])])
    assert.ok(!text.includes(secret), `source_knocks holds no ${secret}`);
});

test("R1 a source id that cannot be drawn answers record-core's mintExhausted for SRC (its R62, C-59.6), and nothing is written, not even a knock bound in the same read", async () => {
  const w = seeded();
  /* the negative control: a source minted while ids remain */
  const a = await w.pulled({ secret: SECRET });
  assert.equal(a.answer.ok, true);
  /* one capture: the pseudonym's knock (its source held) and a knock without a secret (a source to mint) */
  const same = "the memo, knocked twice";
  const k1 = await w.knock({ content: same, secret: SECRET }), k2 = await w.knock({ content: same });
  await w.pull(k1); await w.pull(k2);
  const fresh = await w.knock();
  await w.pull(fresh);
  /* every source id of the clock's year already handed out (record-core R8: never drawn again) */
  const year = new Date(w.clock.now).getUTCFullYear();
  w.record.transact(() => {
    for (let i = 0; i < 10000; i++)
      w.st.sql.exec(`INSERT OR IGNORE INTO minted_ids (id, recorded_at, source) VALUES (?, ?, 'mint')`,
                    `SRC-${year}-${String(i).padStart(4, "0")}`, new Date(w.clock.now).toISOString());
    return { ok: true };
  });
  const before = w.snapshot();
  const row = RECORD_CORE_CHECKS.MINT_EXHAUSTED;
  for (const captureSha of [fresh.sha256, sha(same)]) {
    const r = w.s.sourceOf({ captureSha, viewer: V("bob") });
    assert.equal(r.ok, false);
    assert.equal(r.reason, "MINT_EXHAUSTED");
    assert.equal(r.code, "MINT_EXHAUSTED");
    assert.equal(r.prefix, "SRC");
    assert.equal(r.check, row.check);
    assert.equal(r.check, "C-59.6");
    assert.equal(r.translation, row.translation);
    /* the detail as record-core R82 words it (T35-13; DEC-149): the group's own Civicsmith, never "the plane" */
    assert.equal(r.detail, "your group's Civicsmith could not find a free source id: every one it drew was already taken. Nothing was written.");
    assert.deepEqual(r, mintExhausted("SRC"), "record-core's one answer, nothing of this module's added or replaced");
  }
  assert.deepEqual(w.snapshot(), before, "nothing is written: the pseudonym's knock read beside it is not bound either");
  /* a source already minted still answers */
  assert.equal(w.s.sourceOf({ captureSha: a.row.sha256, viewer: V("bob") }).sourceId, a.sourceId);
});

test("R10 a link that moves the linked source's rung (a same_secret basis) calls each listener for that source too, with the same entry; an evidence link, which moves it not, only for the source", async () => {
  const w = seeded();
  const k = await w.pulled({ secret: SECRET }), bare = await w.pulled(), other = await w.pulled();
  const seen = [];
  assert.equal(w.s.onDisclosure("reevaluation", (p) => { seen.push(p); }).ok, true);
  const l1 = await w.s.linkClaim({ source: k.sourceId, to: other.sourceId, evidence: "similar style", by: "bob" });
  assert.deepEqual(seen, [{ source: k.sourceId, entry: l1.entry, rung_before: "same_knocker", rung_after: "same_knocker" }]);
  assert.equal(l1.notified, 1);
  seen.length = 0;
  const l2 = await w.s.linkClaim({ source: k.sourceId, to: bare.sourceId, evidence: "presented", by: "bob", knockerSecret: SECRET });
  assert.equal(l2.basis, "same_secret");
  assert.deepEqual(seen, [{ source: k.sourceId, entry: l2.entry, rung_before: "same_knocker", rung_after: "same_knocker" },
                          { source: bare.sourceId, entry: l2.entry, rung_before: "unknown", rung_after: "same_knocker" }]);
  assert.equal(l2.notified, 2);
  assert.equal(w.s.rungOf({ source: bare.sourceId, viewer: V("carol") }).rung, "same_knocker");
});
