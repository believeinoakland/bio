/* docket: the entry format's two labels (R6; DEC-124, K1365), the feed's permanent ids under both (R15), and the exact
   form of the public answer a citing copy reads, with `captures: "omit"` (R24; DEC-101 (3), N534), at the module's
   interface. An entry published before T31 is the row the code before T31 left: its bytes, under the old label, signed
   by the manager over `signatures.docketStatement`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, file, post, fileAndPlace, legacyEntry, V, CASE, NOW, DAY, keyFor, sha } from "./fixture.mjs";
import { ENTRY_FORMAT, LEGACY_ENTRY_FORMAT, ENTRY_FORMATS, isEntryFormat, FEED_ID_PREFIX, feedAddress }
  from "../../../src/docket/index.mjs";
import { docketStatement, verifySshsig, NS_DOCKET } from "../../../src/sshsig.mjs";
import { canonicalJson } from "../../../src/record-grammar/json.mjs";

const verifies = async (e) => (await verifySshsig(e.signature, docketStatement(CASE, e.seq, e.digest), NS_DOCKET, [keyFor("alice").b64])).ok;

test("R6 the labels: a new entry carries civicsmith-docket-entry/1; civicos-docket-entry/1 is accepted as the same format, forever", () => {
  assert.equal(ENTRY_FORMAT, "civicsmith-docket-entry/1");
  assert.equal(LEGACY_ENTRY_FORMAT, "civicos-docket-entry/1");
  assert.deepEqual([...ENTRY_FORMATS], [ENTRY_FORMAT, LEGACY_ENTRY_FORMAT]);
  for (const l of [ENTRY_FORMAT, LEGACY_ENTRY_FORMAT]) assert.equal(isEntryFormat(l), true, l);
  for (const l of ["civicsmith-docket-entry/2", "civicos-docket-entry/2", "bio-docket-entry/1", "", null, undefined])
    assert.equal(isEntryFormat(l), false, `negative control: ${l}`);
});

test("R6 R14 R15 a case's chain holding both labels: an old-label entry still verifies, a new one carries the new label, and the chain reads whole and in order", async () => {
  const w = seeded();
  /* two entries published before T31, under the old label */
  const g1 = legacyEntry(w, { shelf: "listed", kind: "standing-granted", edition: 1, holder: "The Tenants' Union", reason: "named" });
  w.clock.now = NOW + DAY;
  const g2 = legacyEntry(w, { shelf: "listed", kind: "standing-granted", edition: 1, holder: "The Ratepayers", reason: "named too" });
  /* the old entry, as stored, still verifies: the owner's signature over signatures.docketStatement */
  const before = await w.docket.docketPublic({ case: CASE });
  assert.deepEqual(before.entries.map((e) => [e.seq, e.fields.format]), [[1, LEGACY_ENTRY_FORMAT], [2, LEGACY_ENTRY_FORMAT]]);
  for (const e of before.entries) assert.equal(await verifies(e), true, `old-label entry #${e.seq} verifies`);
  assert.equal(before.entries[0].json, g1.text, "its bytes are kept");
  /* negative control: the same entry's bytes relabelled no longer match its signature */
  const relabelled = canonicalJson({ ...g1.json, format: ENTRY_FORMAT });
  assert.equal(await verifies({ ...before.entries[0], digest: sha(relabelled) }), false);
  /* the old-label grant is a grant like any other: a holder files under it (R10) */
  w.clock.now = NOW + 2 * DAY;
  const held = file(w, { from: { kind: "holder", grant: 1 } });
  assert.equal(held.ok, true, JSON.stringify(held).slice(0, 200));
  /* new entries after them: the new label, previous the prior entry's digest over its own stored bytes */
  const placed = await post(w, { kind: "response", entry: held.entry });
  const p3 = JSON.parse(placed.prepared.entry);
  assert.equal(p3.format, ENTRY_FORMAT);
  assert.equal(p3.previous, g2.digest, "previous is the old-label entry's digest over its own stored bytes");
  assert.equal(p3.from, "The Tenants' Union", "the holder's name as the old-label grant gave it");
  w.clock.now = NOW + 3 * DAY;
  const back = await post(w, { kind: "take-back", edition: 1, takesBack: 1, reason: "Granted in error." });
  const withdrawn = await post(w, { kind: "standing-withdrawn", edition: 1, grant: 2, reason: "They asked to stop." });
  assert.equal(JSON.parse(withdrawn.prepared.entry).holder, "The Ratepayers");
  /* R14: the chain whole, in order, each label as stored, each signature verifying, the old entry marked taken back */
  const pub = await w.docket.docketPublic({ case: CASE });
  assert.deepEqual(pub.entries.map((e) => [e.seq, e.fields.format]),
                   [[1, LEGACY_ENTRY_FORMAT], [2, LEGACY_ENTRY_FORMAT], [3, ENTRY_FORMAT], [4, ENTRY_FORMAT], [5, ENTRY_FORMAT]]);
  for (const [i, e] of pub.entries.entries()) {
    assert.equal(sha(e.json), e.digest);
    assert.equal(await verifies(e), true, `#${e.seq} verifies`);
    assert.equal(e.fields.previous, i ? pub.entries[i - 1].digest : null, `#${e.seq} chains to the one before`);
  }
  assert.deepEqual(pub.entries[0].taken_back, { seq: back.seq, date: "2026-10-04" });
  assert.equal(pub.entries[0].json, g1.text, "a take-back never changes the old entry's bytes");
  assert.equal(pub.last_entry, "2026-10-04");
  assert.equal(w.docket.lastEntryOf({ case: CASE }), "2026-10-04");
  /* R15: the feed carries every entry of the chain, newest first, its ids under urn:civicos: whatever the label */
  const feed = await w.docket.docketFeed({ case: CASE });
  assert.equal(FEED_ID_PREFIX, "urn:civicos:docket");
  assert.match(feed, /^  <id>urn:civicos:docket:test-group:CASE-2026-0101<\/id>$/m, "the feed's own id");
  const ids = [...feed.matchAll(/<id>urn:civicos:docket:test-group:CASE-2026-0101:(\d+)<\/id>/g)].map((m) => Number(m[1]));
  assert.deepEqual(ids, [5, 4, 3, 2, 1], "every entry, newest first, each id unchanged by its label");
  assert.equal(/urn:civicsmith/.test(feed), false, "no id moves to the new name");
  /* R9: the old-label grant's holder's response, once placed, is no longer due */
  assert.equal(w.docket.coreDue({ case: CASE, viewer: V("alice") }).items.some((i) => i.ref === held.entry), false);
});

test("R24 docketPublic's exact form: {ok, case, group, entries, captures, last_entry, feed}; each entry {seq, entry, digest, json, fields, signature, published_at, taken_back}", async () => {
  const w = seeded();
  const legacy = legacyEntry(w, { shelf: "listed", kind: "standing-granted", edition: 1, holder: "The Tenants' Union", reason: "named" });
  const listed = await fileAndPlace(w);
  w.clock.now = NOW + DAY;
  await fileAndPlace(w, { kind: "reaction", from: { kind: "other", name: "The Daily Example" }, capture: w.swept.sha }, { summary: "A column." });
  await post(w, { kind: "take-back", edition: 1, takesBack: 2, reason: "Placed twice." });
  const pub = await w.docket.docketPublic({ case: CASE });
  assert.deepEqual(Object.keys(pub).sort(), ["captures", "case", "entries", "feed", "group", "last_entry", "ok"]);
  assert.deepEqual([pub.ok, pub.case, pub.group, pub.feed, pub.last_entry], [true, CASE, "test-group", feedAddress(CASE), "2026-10-02"]);
  assert.equal(pub.entries.length, 4);
  for (const e of pub.entries) {
    assert.deepEqual(Object.keys(e).sort(), ["digest", "entry", "fields", "json", "published_at", "seq", "signature", "taken_back"]);
    assert.equal(e.entry, `${CASE}#${e.seq}`);
    /* json is the exact canonical JSON whose SHA-256 is digest; fields is json parsed */
    assert.equal(e.json, canonicalJson(JSON.parse(e.json)));
    assert.equal(sha(e.json), e.digest);
    assert.deepEqual(e.fields, JSON.parse(e.json));
    /* signature is the armored SSHSIG over signatures.docketStatement(case, seq, digest) in NS_DOCKET */
    assert.match(e.signature, /^-----BEGIN SSH SIGNATURE-----\n[\s\S]+\n-----END SSH SIGNATURE-----\n?$/);
    assert.equal(await verifies(e), true);
    assert.match(e.published_at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    assert.ok(e.taken_back === null || (Object.keys(e.taken_back).sort().join() === "date,seq"), "taken_back is {seq, date} or null");
  }
  assert.deepEqual(pub.entries[1].taken_back, { seq: 4, date: "2026-10-02" });
  assert.equal(pub.entries[0].json, legacy.text, "an old-label entry answers in the same form");
  /* the listed entry's capture by its hash, base64; never a reaction's */
  assert.deepEqual(Object.keys(pub.captures), [w.cap.sha]);
  assert.deepEqual(Buffer.from(pub.captures[w.cap.sha], "base64"), w.cap.bytes);
  assert.equal(listed.posted.ok, true);
  /* a capture the store cannot answer is null, in the same form */
  w.evidence.m.delete(`bio/captures/${w.cap.sha}`);
  const unread = await w.docket.docketPublic({ case: CASE });
  assert.deepEqual(Object.keys(unread).sort(), Object.keys(pub).sort());
  assert.equal(unread.captures[w.cap.sha], null);
});

test("R24 with captures: \"omit\", captures is {} and the answer adds captures_omitted: true; no capture's bytes are read", async () => {
  const w = seeded();
  await fileAndPlace(w);
  await fileAndPlace(w, { kind: "statement", capture: w.swept.sha });
  const full = await w.docket.docketPublic({ case: CASE });
  assert.equal(Object.keys(full.captures).length, 2, "negative control: without omit, both captures' bytes are answered");
  const gets = w.evidence.gets.length;
  const snap = w.snapshot();
  const omitted = await w.docket.docketPublic({ case: CASE, captures: "omit" });
  assert.equal(w.evidence.gets.length, gets, "no capture's bytes are read");
  assert.deepEqual(w.snapshot(), snap, "writes nothing");
  assert.deepEqual(omitted.captures, {});
  assert.equal(omitted.captures_omitted, true);
  assert.deepEqual(Object.keys(omitted).sort(), ["captures", "captures_omitted", "case", "entries", "feed", "group", "last_entry", "ok"]);
  const { captures: _a, captures_omitted: _b, ...rest } = omitted;
  const { captures: _c, ...restFull } = full;
  assert.deepEqual(rest, restFull, "everything else is as without omit");
  assert.equal("captures_omitted" in full, false, "only an omitting read says so");
  /* any other value reads the bytes as R14 says */
  for (const captures of [undefined, null, "all", "OMIT", true]) {
    const r = await w.docket.docketPublic({ case: CASE, captures });
    assert.deepEqual(r, full, `captures: ${captures}`);
  }
  /* a case with no ratified edition answers null, omitted or not */
  assert.equal(await w.docket.docketPublic({ case: "CASE-2026-9999", captures: "omit" }), null);
});
