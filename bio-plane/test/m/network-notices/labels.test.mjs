/* network-notices: the rename to Civicsmith (DEC-124, K1365) at the module's interface. A record written from T31 on
   carries the `civicsmith-…` label; one published before keeps its bytes and its `civicos-…` label, and every reader
   accepts both, forever, as the same format (R3, R10, R12, R13, R17). The seal construction keeps its published name
   (R14), and the timestamp requests name the product (R15).

   A notice published before T31 is written into this module's own tables exactly as the earlier code's post left it
   (its revision signed by its owner over `signatures.noticeStatement`, its `posted` attestation signed with the
   instance key over `attestation.instanceStatement` under the earlier label); everything after is driven through the
   interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createPublicKey, verify } from "node:crypto";
import { seeded, post, keyFor, sha, V, SLUG, NOW, DAY, WEEK, monday, day, iso } from "./fixture.mjs";
import * as nn from "../../../src/network-notices/index.mjs";
import { instanceStatement } from "../../../src/attestation/index.mjs";
import { verifySshsig, noticeStatement, NS_NOTICE } from "../../../src/sshsig.mjs";
import { canonicalJson } from "../../../src/record-grammar/json.mjs";
import { signSshsig } from "../../../scripts/sign-sshsig.mjs";

const A = V("alice");
const LAST = monday(NOW) - WEEK;
const OLD = { notice: "civicos-working-on/1", attestation: "civicos-working-on-attestation/1",
              opening: "civicos-working-on-opening/1", activity: "civicos-working-on-activity/1" };
const NEW = { notice: "civicsmith-working-on/1", attestation: "civicsmith-working-on-attestation/1",
              opening: "civicsmith-working-on-opening/1", activity: "civicsmith-working-on-activity/1" };

/* A notice alice published on P before T31: revision 1 and its `posted` attestation, both under the earlier labels. */
async function earlierNotice(w, { nid = "NOTE-2026-0901", at = Date.parse("2026-09-20T10:00:00Z") } = {}) {
  assert.equal(w.record.transact(() => w.record.recordOpaqueId(nid)).ok, true);
  const revision = { format: OLD.notice, group: SLUG, notice: nid, revision: 1, previous: null,
                     wording: "Tracing the budget transfers", since: "2026-02-01", posted: day(at), collaborate: false,
                     status: "open", others_welcome: nn.OTHERS_WELCOME };
  const text = canonicalJson(revision), digest = sha(text);
  const signature = signSshsig(keyFor("alice").env, Buffer.from(noticeStatement(nid, 1, digest)), NS_NOTICE);
  w.st.sql.exec(`INSERT INTO nn_notices (notice_id, project, opened_at) VALUES (?,?,?)`, nid, w.P, iso(at));
  w.st.sql.exec(`INSERT INTO nn_revisions (notice_id, revision, digest, json, status, signature, signer_key, published_at)
                 VALUES (?,1,?,?,'open',?,?,?)`, nid, digest, text, signature, keyFor("alice").b64, iso(at));
  const att = { format: OLD.attestation, group: SLUG, notice: nid, as_of: day(at), kind: "posted", revision: digest,
                status: "open", activity: { level: "Dormant", weeks_counted: 0, window: 13, as_of: day(at), method: OLD.activity },
                cases: [], seals: [], openings: [] };
  const attText = canonicalJson(att), attDigest = sha(attText);
  const signed = await w.attestation.instanceSign(instanceStatement(OLD.attestation, attDigest));
  assert.equal(signed.ok, true);
  w.st.sql.exec(`INSERT INTO nn_attestations (notice_id, kind, ref, as_of, level, status, json, digest, signature, key_id, published_at)
                 VALUES (?,'posted',?,?,'Dormant','open',?,?,?,?,?)`, nid, digest, day(at), attText, attDigest,
                signed.signature, signed.key_id, iso(at));
  return { nid, digest, text, signature, attDigest };
}

/* The owner's signature over the revision's statement (R4's check), as any reader makes it. */
const revisionVerifies = (item, who = "alice") =>
  verifySshsig(item.signature, noticeStatement(item.notice, item.revision, item.digest), NS_NOTICE, [keyFor(who).b64]);
/* The instance signature over `instanceStatement(label, digest)`, against the copy key `groupKeysPublic` lists. */
function attestationVerifies(w, item, label) {
  const k = w.nn.groupKeysPublic().copy.find((c) => c.key_id === item.signature.key_id);
  const pub = createPublicKey({ key: { kty: "OKP", crv: "Ed25519", x: Buffer.from(k.public_key, "base64").toString("base64url") }, format: "jwk" });
  return verify(null, Buffer.from(instanceStatement(label, item.digest)), pub, Buffer.from(item.signature.instance_signature, "base64"));
}

test("R3 R20 a revision signed with the old label still verifies; a new one carries civicsmith-working-on/1; a notice holding both is served whole and in order", async () => {
  const w = seeded();
  const old = await earlierNotice(w);
  /* a change to the earlier notice, through the interface: the new label, `previous` over the old revision's stored bytes */
  const two = await post(w, { notice: old.nid, wording: "Tracing the reserve transfers" });
  assert.equal(two.revision, 2);
  const j2 = JSON.parse(two.prepared.revision);
  assert.equal(j2.format, NEW.notice);
  assert.equal(nn.NOTICE_FORMAT, NEW.notice);
  assert.deepEqual(nn.NOTICE_FORMATS, [NEW.notice, OLD.notice]);
  assert.equal(j2.previous, old.digest);
  assert.equal(j2.previous, sha(w.rows(`SELECT json FROM nn_revisions WHERE notice_id=? AND revision=1`, old.nid)[0].json));
  /* a stop of it is a third revision, new label, chained to the second */
  w.clock.now += DAY;
  const three = await post(w, { notice: old.nid, final: "stopped", handoff: "Continued by another group" });
  assert.equal(JSON.parse(three.prepared.revision).format, NEW.notice);
  /* served whole and in order: both labels, the old revision byte for byte as published */
  const items = w.nn.noticesPublic({}).items.filter((i) => i.notice === old.nid);
  assert.deepEqual(items.map((i) => [i.type, i.type === "revision" ? i.revision : i.kind, i.json.format]), [
    ["revision", 1, OLD.notice], ["attestation", "posted", OLD.attestation],
    ["revision", 2, NEW.notice], ["attestation", "posted", NEW.attestation],
    ["revision", 3, NEW.notice], ["attestation", "posted", NEW.attestation]]);
  const revs = items.filter((i) => i.type === "revision");
  assert.equal(canonicalJson(revs[0].json), old.text, "the earlier revision's bytes, unchanged");
  assert.equal(revs[0].signature, old.signature);
  for (const r of revs) {
    assert.equal(sha(canonicalJson(r.json)), r.digest);
    const v = await revisionVerifies(r);
    assert.equal(v.ok, true, `revision ${r.revision} (${r.json.format}): ${v.reason}`);
  }
  assert.deepEqual(revs.map((r) => r.json.previous), [null, revs[0].digest, revs[1].digest], "one chain across both labels");
  /* negative control: the old revision relabelled is not what its owner signed */
  const relabelled = sha(canonicalJson({ ...revs[0].json, format: NEW.notice }));
  assert.equal((await revisionVerifies({ ...revs[0], digest: relabelled })).reason, "BAD_SIGNATURE");
  /* a first revision of a new notice carries the new label */
  const q = await post(w, { project: w.Q }, "dave");
  assert.equal(JSON.parse(q.prepared.revision).format, NEW.notice);
  /* the member read serves both labels too */
  assert.deepEqual(w.nn.noticesOf({ project: w.P, viewer: A }).notices[0].revisions.map((r) => r.json.format),
                   [OLD.notice, NEW.notice, NEW.notice]);
});

test("R12 R13 an attestation signed with the old label still verifies over civicos-working-on-attestation/1; a new one carries and is signed over civicsmith-working-on-attestation/1", async () => {
  const w = seeded();
  const old = await earlierNotice(w);
  assert.equal(nn.ATTESTATION_FORMAT, NEW.attestation);
  assert.deepEqual(nn.ATTESTATION_FORMATS, [NEW.attestation, OLD.attestation]);
  /* the notice goes on under the new code: a revision's posted attestation and the next month's monthly */
  await post(w, { notice: old.nid, wording: "Changed" });
  w.clock.now = Date.parse("2026-11-01T00:10:00Z");
  assert.equal((await w.nn.attestTick()).monthly.length, 1);
  const atts = w.nn.noticesPublic({}).items.filter((i) => i.type === "attestation");
  assert.deepEqual(atts.map((a) => [a.kind, a.json.format]),
                   [["posted", OLD.attestation], ["posted", NEW.attestation], ["monthly", NEW.attestation]]);
  for (const a of atts) {
    assert.equal(sha(canonicalJson(a.json)), a.digest);
    /* each verifies over its own format's statement, and over no other label */
    const own = a.json.format, other = own === OLD.attestation ? NEW.attestation : OLD.attestation;
    assert.equal(attestationVerifies(w, a, own), true, `${a.kind} over ${own}`);
    assert.equal(attestationVerifies(w, a, other), false, `${a.kind} never over ${other}`);
  }
  assert.equal(atts[0].digest, old.attDigest, "the earlier attestation's bytes, unchanged");
  /* R12's fields are the same under either label */
  for (const a of atts) assert.deepEqual(Object.keys(a.json).sort(),
    ["activity", "as_of", "cases", "format", "group", "kind", "notice", "openings", "revision", "seals", "status"]);
  /* the old attestation still counts as the notice's state: the monthly states it open, and R22 reads it whole */
  assert.equal(atts[2].json.status, "open");
  assert.deepEqual(w.nn.noticesOf({ project: w.P, viewer: A }).notices[0].attestations.map((a) => a.json.format),
                   [OLD.attestation, NEW.attestation, NEW.attestation]);
});

test("R10 activityMethod names the method civicsmith-working-on-activity/1 and lists civicos-working-on-activity/1 as the same method; an earlier attestation finds its method", async () => {
  const w = seeded();
  const old = await earlierNotice(w);
  const m = w.nn.activityMethod();
  assert.equal(m.version, NEW.activity);
  assert.equal(nn.ACTIVITY_METHOD_VERSION, NEW.activity);
  assert.deepEqual(m.earlier_labels, [OLD.activity]);
  assert.deepEqual(m.method.earlier_labels, [OLD.activity]);
  assert.match(m.method.same_method, /same method/);
  /* served the same with no credential (public-read R18) */
  assert.deepEqual(w.publicRead.publicRead("activitymethod", {}).result, m);
  /* every attestation's method is found in the answer: the earlier one by its earlier label, a new one by the version */
  await post(w, { notice: old.nid, wording: "Changed" });
  const methods = w.nn.noticesPublic({}).items.filter((i) => i.type === "attestation").map((a) => a.json.activity.method);
  assert.deepEqual(methods, [OLD.activity, NEW.activity]);
  for (const label of methods) assert.ok([m.version, ...m.earlier_labels].includes(label), label);
  /* renaming the label is not a change to the method: the window, the cut-offs and what counts are as before */
  assert.match(m.method.window, /^The 13 complete UTC ISO weeks/);
  assert.deepEqual(m.method.levels, ["Very active: 10 to 13 counted weeks", "Active: 7 to 9 counted weeks",
    "Some work: 4 to 6 counted weeks", "Quiet: 1 to 3 counted weeks", "Dormant: 0 counted weeks"]);
  assert.equal(w.nn.noticesOf({ project: w.P, viewer: A }).methodVersion, NEW.activity);
});

test("R17 R14 an opening carries civicsmith-working-on-opening/1 with method civicos-working-on-seal/1; one with the old label still verifies; the seal's hash tags are unchanged", async () => {
  const w = seeded();
  await post(w);
  const x = w.act(w.P, LAST + DAY);
  await w.nn.sealTick();
  w.publish(w.P, "CASE-2026-0001-budget", 1, [x]);
  await w.nn.openSeals({ case: "CASE-2026-0001-budget", edition: 1 });
  const o = JSON.parse(w.rows(`SELECT json FROM nn_openings`)[0].json);
  assert.equal(o.format, NEW.opening);
  assert.equal(nn.OPENING_FORMAT, NEW.opening);
  assert.deepEqual(nn.OPENING_FORMATS, [NEW.opening, OLD.opening]);
  assert.equal(o.method, "civicos-working-on-seal/1", "the construction keeps its published name");
  assert.equal(nn.SEAL_METHOD.version, "civicos-working-on-seal/1");
  assert.equal(nn.verifyOpening(o).ok, true);
  /* an opening published before T31, its stored bytes carrying the earlier label, verifies the same */
  const earlier = { ...o, format: OLD.opening };
  assert.deepEqual(nn.verifyOpening(earlier), nn.verifyOpening(o));
  assert.equal(w.nn.verifyOpening(earlier).ok, true);
  w.st.sql.exec(`UPDATE nn_openings SET json=?`, canonicalJson(earlier));
  const served = w.nn.noticesPublic({}).items.find((i) => i.type === "attestation" && i.kind === "published").openings;
  assert.deepEqual(served.map((s) => s.format), [OLD.opening], "served as stored");
  assert.equal(nn.verifyOpening(served[0]).ok, true);
  /* a tampered leaf still fails under either label (the label decides nothing) */
  for (const format of [OLD.opening, NEW.opening]) {
    const t = structuredClone({ ...o, format });
    t.leaves[0].leaf.salt = "0".repeat(64);
    assert.equal(nn.verifyOpening(t).leaves, false, format);
  }
  /* R14: every leaf, node and week leaf is hashed under the four permanent tags, as before T31 */
  const leaf = o.leaves[0].leaf;
  assert.equal(nn.leafHash(leaf), sha(`civicos-seal-leaf/1\n${canonicalJson(leaf)}`));
  assert.equal(nn.nodeHash("a", "b"), sha("civicos-seal-node/1\nab"));
  assert.equal(nn.weekLeafHash(o.seal), sha(`civicos-week-leaf/1\n${o.seal}`));
  for (const tag of ["civicos-seal-leaf/1", "civicos-seal-node/1", "civicos-week-leaf/1"])
    assert.ok(JSON.stringify(nn.SEAL_METHOD).includes(tag), tag);
});

test("R15 the timestamp requests carry the user agent Civicsmith/<version> (working-on seal), never the old product name", async () => {
  const w = seeded();
  w.act(w.P, LAST + DAY);
  await w.nn.sealTick();
  assert.equal(w.tsa.calls.length, 1);
  assert.equal(w.tsa.calls[0].headers["user-agent"], "Civicsmith/0 (working-on seal)", "no VERSION bound: 0");
  /* with the instance's VERSION bound, it names it; each authority tried is asked with it */
  const v = seeded();
  v.nn.env.VERSION = "0.80.0";
  v.tsa.mode = "refuse";
  v.act(v.P, LAST + DAY);
  await v.nn.sealTick();
  assert.equal(v.tsa.calls.length, 3);
  for (const c of v.tsa.calls) assert.equal(c.headers["user-agent"], "Civicsmith/0.80.0 (working-on seal)");
  assert.ok(!JSON.stringify([...w.tsa.calls, ...v.tsa.calls]).includes("CivicOS"));
});
