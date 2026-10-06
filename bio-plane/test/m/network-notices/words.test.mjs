/* network-notices: what a member, and the public, read the group's own installation called (DEC-149, T34-87; K1784,
   K1811). Members read "your group's Civicsmith", or a sentence that needs no name; nothing this module answers calls it
   "this copy", "this instance", "this plane", "the plane" or a server. The public's key label says this group's
   Civicsmith (K1833), never "your group's" (a stranger reads it) and never "copy". Each changed string is driven through the
   refusal or the read that answers it, and checked whole. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, world, prepare, post, sign, V, NOW } from "./fixture.mjs";
import * as nn from "../../../src/network-notices/index.mjs";

const A = V("alice");
/* "this/the/your … copy|instance|plane", and "server", as DEC-149's grep reads them (`plan/draft-T34-dec149.md`). */
const OLD_NAME = /\b(?:this|the|your|our|its)\s+(?:group's\s+)?(?:civicsmith\s+)?(?:copy|instance|plane)\b|\bservers?\b/i;
/* every string anywhere in an answer, keys excluded */
const strings = (v, out = []) => {
  if (typeof v === "string") out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out));
  else if (v && typeof v === "object") Object.values(v).forEach((x) => strings(x, out));
  return out;
};
const noOldName = (answer, what) => {
  for (const s of strings(answer)) assert.doesNotMatch(s, OLD_NAME, `${what}: ${s}`);
};

test("R1 (DEC-149) NOTICE_NO_GROUP_SLUG and NOTICE_NO_INSTANCE_KEY tell the member about their group and your group's Civicsmith, never this copy", async () => {
  const noSlug = world({ slug: null });
  noSlug.member("alice");
  noSlug.P = noSlug.project("budget", "alice");
  const slug = await prepare(noSlug);
  assert.equal(slug.reason, "NOTICE_NO_GROUP_SLUG");
  assert.equal(slug.translation, "Your group has no name recorded yet, and a notice is never anonymous. Record the group's name "
    + "first. Nothing was published.");
  noOldName(slug, "C-127.4");

  const noKey = world({ key: false });
  noKey.member("alice");
  noKey.P = noKey.project("budget", "alice");
  const key = await prepare(noKey);
  assert.equal(key.reason, "NOTICE_NO_INSTANCE_KEY");
  assert.equal(key.check, "C-127.5");
  assert.equal(key.translation, "Your group's Civicsmith holds no signing key of its own, so it cannot sign the activity level a "
    + "notice is always published with. The operator binds one. Nothing was published.");
  assert.equal(key.detail, "your group's Civicsmith holds no signing key of its own, and a notice is never published without "
    + "its signed level");
  noOldName(key, "C-127.5");

  /* the post's own key check (R4, R13) answers the same words: the key goes between prepare and post */
  const w = seeded();
  const p = await prepare(w);
  w.attestation.instanceSign = async () => ({ ok: false, reason: "RECEIPT_NO_KEY" });
  const late = await w.nn.postNotice({ digest: p.digest, signature: sign(p), acknowledged: true, by: A, viewer: A });
  assert.deepEqual([late.reason, late.translation, late.detail], ["NOTICE_NO_INSTANCE_KEY", key.translation, key.detail]);
  /* negative control: with a slug and a key the same call is answered, and says nothing of either */
  assert.equal((await prepare(seeded())).ok, true);
});

test("R4 (DEC-149) NOTICE_STALE says your group's Civicsmith holds no prepared notice, never this copy", async () => {
  const w = seeded();
  const p = await prepare(w);
  const stale = await w.nn.postNotice({ digest: "0".repeat(64), signature: sign(p), acknowledged: true, by: A, viewer: A });
  assert.equal(stale.reason, "NOTICE_STALE");
  assert.equal(stale.check, "C-127.12");
  assert.equal(stale.translation, "Your group's Civicsmith holds no prepared notice from you with this fingerprint, or it was "
    + "prepared more than an hour ago. Prepare it again and sign what it shows. Nothing was published.");
  noOldName(stale, "C-127.12");
  /* past its hour: the same row */
  w.clock.now = NOW + 3600000 + 1000;
  assert.equal((await w.nn.postNotice({ digest: p.digest, signature: sign(p), acknowledged: true, by: A, viewer: A })).translation,
               stale.translation);
});

test("R21 (DEC-149) groupKeysPublic labels each key of the group's own Civicsmith as this group's Civicsmith key, never this copy's, nor your group's to a stranger", async () => {
  const w = seeded();
  await post(w);
  const keys = w.nn.groupKeysPublic();
  assert.equal(nn.COPY_KEY_LABEL, "this group's Civicsmith key");
  assert.equal(keys.copy.length, 1);
  assert.equal(keys.copy[0].label, "this group's Civicsmith key");
  for (const k of keys.copy) assert.doesNotMatch(k.label, /copy|instance|plane|server|your/i);
  noOldName(keys, "groupkeyspublic");
  /* served the same with no credential (public-read R18) */
  assert.deepEqual(w.publicRead.publicRead("groupkeyspublic", {}).result.copy.map((k) => k.label), ["this group's Civicsmith key"]);
});

test("R1 R4 R21 (DEC-149) no row, refusal or answer of this module calls the group's Civicsmith this copy, this instance or the plane", async () => {
  /* every row's translation */
  for (const [code, row] of Object.entries(nn.NETWORK_NOTICE_CHECKS)) assert.doesNotMatch(row.translation, OLD_NAME, code);
  noOldName([nn.ACTIVITY_METHOD, nn.OUTWARD_ACT_WARNING, nn.OTHERS_WELCOME, nn.COPY_KEY_LABEL], "constants");
  /* every answer of a busy world: the member reads, the public reads, a prepared answer */
  const w = seeded();
  w.weeksOfWork(w.P, 2);
  const p = await post(w, { collaborate: true });
  await w.nn.sealTick();
  noOldName([w.nn.noticesPublic({}), w.nn.groupKeysPublic(), w.nn.activityMethod(), w.nn.noticesOf({ project: w.P, viewer: A }),
             await prepare(w, { notice: p.notice, wording: "Changed" })], "answers");
  /* negative control: the pattern catches the old words wherever they sit */
  for (const old of ["This copy holds no prepared notice", "this copy's key", "no key of this instance", "the plane signs", "a server"])
    assert.throws(() => noOldName({ nested: [old] }, "control"), /control/);
  assert.doesNotThrow(() => noOldName(["nothing: copy these fields, or open them", "a review copy"], "control"),
                      "copy in its other meanings stays");
});
