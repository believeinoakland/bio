/* network-notices: posting and changing a notice (R4, R5, R6, R11, R24), at the module's interface. Every R4 refusal is
   shown with its negative control, and none writes anything. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, prepare, post, sign, keyFor, V, MACHINE, NOW } from "./fixture.mjs";
import { NETWORK_NOTICE_CHECKS } from "../../../src/network-notices/index.mjs";
import { signSshsig } from "../../../scripts/sign-sshsig.mjs";

const A = V("alice");
const rowOk = (r, code) => {
  assert.equal(r.ok, false, JSON.stringify(r).slice(0, 200));
  assert.equal(r.reason, code);
  assert.equal(r.check, NETWORK_NOTICE_CHECKS[code].check);
  assert.equal(r.translation, NETWORK_NOTICE_CHECKS[code].translation);
};
const postOf = (w, p, x = {}) => w.nn.postNotice({ digest: p.digest, signature: sign(p), acknowledged: true, by: A, viewer: A, ...x });
async function refusedThenAccepted(w, bad, good, code) {
  const before = w.snapshot();
  rowOk(await bad(), code);
  assert.deepEqual(w.snapshot(), before, `${code}: nothing written`);
  const ok = await good();
  assert.equal(ok.ok, true, `${code}'s control: ${JSON.stringify(ok).slice(0, 200)}`);
}

test("R4 R1's caller refusals are asked again at the instant of posting", async () => {
  const w = seeded();
  const p = await prepare(w);
  w.st.sql.exec(`UPDATE project_participants SET owner=0 WHERE project_id=? AND member_id='alice'`, w.P);
  await refusedThenAccepted(w, () => postOf(w, p),
    () => { w.st.sql.exec(`UPDATE project_participants SET owner=1 WHERE project_id=? AND member_id='alice'`, w.P); return postOf(w, p); },
    "NOTICE_NOT_THE_OWNER");
  const q = await prepare(w, { project: w.Q }, "dave");
  rowOk(await w.nn.postNotice({ digest: q.digest, signature: sign(q, "dave"), acknowledged: true, by: MACHINE, viewer: MACHINE }),
        "MACHINE_CANNOT_POST_NOTICE");
  /* a notice opened between prepare and post: the first revision is refused, as R1 would refuse it now */
  const w2 = seeded();
  const first = await prepare(w2, { wording: "first" });
  await post(w2, { wording: "second" });
  rowOk(await postOf(w2, first), "NOTICE_ALREADY_OPEN");
});

test("R4 `acknowledged` other than exactly true is NOTICE_WARNING_NOT_ACKNOWLEDGED", async () => {
  const w = seeded();
  const p = await prepare(w);
  for (const acknowledged of [false, "true", 1, null, undefined])
    rowOk(await postOf(w, p, { acknowledged }), "NOTICE_WARNING_NOT_ACKNOWLEDGED");
  assert.equal((await postOf(w, p)).ok, true);
});

test("R4 no prepared answer from `by` with this digest, or one past `expires`, is NOTICE_STALE", async () => {
  const w = seeded();
  const p = await prepare(w);
  rowOk(await postOf(w, p, { digest: "0".repeat(64) }), "NOTICE_STALE");
  /* prepared by bob, posted by alice: not alice's prepared answer */
  const b = await prepare(w, { wording: "bob's" }, "bob");
  rowOk(await w.nn.postNotice({ digest: b.digest, signature: sign(b), acknowledged: true, by: A, viewer: A }), "NOTICE_STALE");
  /* past expires */
  w.clock.now = NOW + 3600000 + 1000;
  const before = w.snapshot();
  rowOk(await postOf(w, p), "NOTICE_STALE");
  assert.deepEqual(w.snapshot(), before);
  /* control: prepared again, posted within the hour */
  const again = await prepare(w);
  assert.equal((await postOf(w, again)).ok, true);
});

test("R4 R24 a signature the verifier rejects is NOTICE_SIGNATURE_REFUSED with its reason: only the owner's own registered key, in NS_NOTICE, over exactly the statement", async () => {
  const w = seeded();
  const p = await prepare(w);
  const cases = [
    [sign(p, "bob"), "UNKNOWN_KEY"],                                                   /* another owner's key */
    [signSshsig(keyFor("alice").env, Buffer.from(p.statement), "bio-ratify"), "NAMESPACE"],   /* a ratification namespace */
    [signSshsig(keyFor("alice").env, Buffer.from(p.statement.replace(" 1 ", " 2 ")), "bio-working-on"), "BAD_SIGNATURE"],
    [signSshsig(keyFor("stranger").env, Buffer.from(p.statement), "bio-working-on"), "UNKNOWN_KEY"],
    ["not a signature", "MALFORMED"],
  ];
  for (const [signature, reason] of cases) {
    const before = w.snapshot();
    const r = await postOf(w, p, { signature });
    rowOk(r, "NOTICE_SIGNATURE_REFUSED");
    assert.equal(r.verifier, reason);
    assert.deepEqual(w.snapshot(), before);
  }
  /* a revoked key no longer attests */
  w.st.sql.exec(`UPDATE signers SET status='revoked' WHERE member_id='alice'`);
  assert.equal((await postOf(w, p)).verifier, "UNKNOWN_KEY");
  w.st.sql.exec(`UPDATE signers SET status='active' WHERE member_id='alice'`);
  assert.equal((await postOf(w, p)).ok, true);
});

test("R5 the revision is stored with its armored signature and first-published instant, and its posted attestation is issued in the same transaction, served from that instant", async () => {
  const w = seeded();
  const p = await prepare(w);
  const signature = sign(p);
  const r = await w.nn.postNotice({ digest: p.digest, signature, acknowledged: true, by: A, viewer: A });
  assert.equal(r.ok, true);
  const rev = JSON.parse(p.revision);
  assert.equal(r.notice, rev.notice);
  assert.equal(r.revision, 1);
  assert.equal(r.published_at, "2026-10-01T12:00:00Z");
  const row = w.rows(`SELECT * FROM nn_revisions`)[0];
  assert.equal(row.json, p.revision);
  assert.equal(row.signature, signature);
  assert.equal(row.published_at, r.published_at);
  const att = w.rows(`SELECT * FROM nn_attestations`);
  assert.equal(att.length, 1);
  assert.equal(att[0].kind, "posted");
  assert.equal(att[0].published_at, r.published_at);
  assert.equal(JSON.parse(att[0].json).revision, p.digest);
  assert.equal(r.attestation.digest, att[0].digest);
  const pub = w.nn.noticesPublic({});
  assert.deepEqual(pub.items.map((i) => [i.type, i.published_at]), [["revision", r.published_at], ["attestation", r.published_at]]);
  /* posting the same prepared answer twice publishes once */
  rowOk(await w.nn.postNotice({ digest: p.digest, signature, acknowledged: true, by: A, viewer: A }), "NOTICE_STALE");
  assert.equal(w.count("nn_revisions"), 1);
});

test("R6 a change is a new revision naming the prior one, which stays served; it never changes group or notice", async () => {
  const w = seeded();
  const one = await post(w);
  w.clock.now += 3600000;
  const two = await post(w, { notice: one.notice, wording: "Now tracing the reserve transfers", collaborate: true });
  assert.equal(two.notice, one.notice);
  assert.equal(two.revision, 2);
  const j2 = JSON.parse(two.prepared.revision);
  assert.equal(j2.previous, one.prepared.digest);
  assert.equal(j2.group, "test-group");
  assert.equal(j2.notice, one.notice);
  const revs = w.nn.noticesPublic({}).items.filter((i) => i.type === "revision");
  assert.deepEqual(revs.map((i) => i.revision), [1, 2]);
  assert.equal(revs[0].json.wording, "Tracing the budget transfers");
  /* each kind of change is accepted: body, matter, collaborate, a later since */
  const three = await post(w, { notice: one.notice, wording: j2.wording, collaborate: true, since: "2026-03-01" });
  assert.equal(three.revision, 3);
  /* an earlier since, and a revision that changes nothing, are refused; so is a change to a notice not the project's open one */
  rowOk(await prepare(w, { notice: one.notice, wording: j2.wording, collaborate: true, since: "2026-02-01" }), "NOTICE_SINCE_EARLIER");
  rowOk(await prepare(w, { notice: one.notice, wording: j2.wording, collaborate: true, since: "2026-03-01" }), "NOTICE_UNCHANGED");
  const q = await post(w, { project: w.Q }, "dave");
  rowOk(await prepare(w, { notice: q.notice, wording: "x" }), "NOTICE_NOT_OPEN");
  rowOk(await prepare(w, { notice: "NOTE-2026-0000", wording: "x" }), "NOTICE_NOT_OPEN");
  /* another owner may change it */
  assert.equal((await post(w, { notice: one.notice, wording: "bob's change", since: "2026-03-01" }, "bob")).revision, 4);
});

test("R11 a final revision stops the notice, with its handoff; a stopped notice takes no further revision", async () => {
  const w = seeded();
  const one = await post(w);
  rowOk(await prepare(w, { final: "stopped" }), "NOTICE_NOT_OPEN");    /* a stop names its notice */
  const stop = await post(w, { notice: one.notice, final: "stopped", handoff: "Continued by the harbour group" });
  const j = JSON.parse(stop.prepared.revision);
  assert.equal(j.status, "stopped");
  assert.equal(j.handoff, "Continued by the harbour group");
  assert.equal(JSON.parse(w.rows(`SELECT json FROM nn_attestations ORDER BY seq DESC LIMIT 1`)[0].json).status, "stopped");
  rowOk(await prepare(w, { notice: one.notice, wording: "again" }), "NOTICE_NOT_OPEN");
  rowOk(await prepare(w, { notice: one.notice, final: "stopped" }), "NOTICE_NOT_OPEN");
  /* a new notice may follow */
  assert.equal((await post(w, { wording: "A new effort" })).revision, 1);
  assert.equal(w.nn.noticesOf({ project: w.P, viewer: A }).notices[0].status, "stopped");
});

test("R4 the post records its notice id through record-core.recordOpaqueId in its own transaction; a first revision whose id is spent is NOTICE_STALE, and nothing is written", async () => {
  const w = seeded();
  const ledger = (id) => w.rows(`SELECT source FROM minted_ids WHERE id=?`, id).map((r) => r.source);
  /* recorded from the post's instant, as a chosen id (record-core R75), never only from a boot seed */
  const one = await post(w);
  assert.deepEqual(ledger(one.notice), ["chosen"]);
  assert.equal(w.record.transact(() => w.record.recordOpaqueId(one.notice)).reason, "OPAQUE_ID_SPENT");
  /* a change is a revision of a recorded notice: nothing more recorded */
  await post(w, { notice: one.notice, wording: "changed" });
  assert.deepEqual(ledger(one.notice), ["chosen"]);
  /* spent between prepare and post (another act recorded it): NOTICE_STALE, nothing written, the ledger as it was */
  const p = await prepare(w, { project: w.Q }, "dave");
  const nid = JSON.parse(p.revision).notice;
  assert.equal(w.record.transact(() => w.record.recordOpaqueId(nid)).ok, true);
  const before = w.snapshot(), minted = w.count("minted_ids");
  const r = await w.nn.postNotice({ digest: p.digest, signature: sign(p, "dave"), acknowledged: true, by: V("dave"), viewer: V("dave") });
  rowOk(r, "NOTICE_STALE");
  assert.deepEqual(w.snapshot(), before);
  assert.equal(w.count("minted_ids"), minted);
  /* negative control: prepared again, a fresh id is drawn and the post publishes it */
  const again = await prepare(w, { project: w.Q }, "dave");
  assert.notEqual(JSON.parse(again.revision).notice, nid, "the spent id is never offered again");
  const ok = await w.nn.postNotice({ digest: again.digest, signature: sign(again, "dave"), acknowledged: true, by: V("dave"), viewer: V("dave") });
  assert.equal(ok.ok, true);
  assert.deepEqual(ledger(ok.notice), ["chosen"]);
  /* a post that is refused after the id is recorded takes it back with it: none is recorded by a failed post */
  const w2 = seeded();
  const p2 = await prepare(w2);
  rowOk(await w2.nn.postNotice({ digest: p2.digest, signature: "not a signature", acknowledged: true, by: A, viewer: A }), "NOTICE_SIGNATURE_REFUSED");
  assert.deepEqual(w2.rows(`SELECT 1 FROM minted_ids WHERE id=?`, JSON.parse(p2.revision).notice), []);
});

test("R4 R1 the post asks the instance key again through provenance.instanceKeyBound, and answers C-70.1 to a caller now at existence", async () => {
  const w = seeded();
  const p = await prepare(w);
  const bound = w.provenance.instanceKeyBound.bind(w.provenance);
  w.provenance.instanceKeyBound = async () => false;
  await refusedThenAccepted(w, () => postOf(w, p), () => { w.provenance.instanceKeyBound = bound; return postOf(w, p); },
                            "NOTICE_NO_INSTANCE_KEY");
  /* alice prepares on Q as its owner; Q set discoverable and alice's part in it ended before she posts */
  const w2 = seeded();
  w2.join(w2.Q, "alice", "joined", true);
  const q = await prepare(w2, { project: w2.Q });
  assert.equal(w2.membership.projectVisibilitySet({ projectId: w2.Q, setting: "discoverable", by: "dave", viewer: V("dave") }).ok, true);
  w2.st.sql.exec(`DELETE FROM project_participants WHERE project_id=? AND member_id='alice'`, w2.Q);
  const before = w2.snapshot();
  const r = await postOf(w2, q);
  assert.deepEqual([r.reason, r.check], ["PROJECT_SEEN_NOT_A_PARTICIPANT", "C-70.1"]);
  assert.deepEqual(w2.snapshot(), before);
  /* negative control: her part restored, the same prepared answer posts */
  w2.join(w2.Q, "alice", "joined", true);
  assert.equal((await postOf(w2, q)).ok, true);
});
