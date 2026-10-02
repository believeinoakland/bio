/* network-notices: the project reference (R19), the public reads (R20, R21), the member reads (R22, R23), the
   invariants (R24, R25, R26, R29), and the ops, public reads and scheduler consumers it publishes, at the interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, post, prepare, keyFor, V, MACHINE, NOW, DAY, WEEK, monday } from "./fixture.mjs";
import * as nn from "../../../src/network-notices/index.mjs";
import { Attestation } from "../../../src/attestation/index.mjs";
import { generateKeyPairSync } from "node:crypto";

const A = V("alice");
const LAST = monday(NOW) - WEEK;

/* A world with every kind of answer in it: two notices, a change, a stop, seals, an opening, monthlies. */
async function busy() {
  const w = seeded();
  w.weeksOfWork(w.P, 3);
  const x = w.act(w.P, LAST + DAY);
  const p = await post(w, { collaborate: true, body: "transfers" });
  const q = await post(w, { project: w.Q }, "dave");
  await w.nn.sealTick();
  w.publish(w.P, "CASE-2026-0001-budget", 1, [x]);
  await w.nn.openSeals({ case: "CASE-2026-0001-budget", edition: 1 });
  w.clock.now = Date.parse("2026-11-01T00:10:00Z");
  await w.nn.attestTick();
  await post(w, { notice: p.notice, wording: "Changed", collaborate: true });
  await post(w, { project: w.Q, notice: q.notice, final: "stopped", handoff: "Handed to another group" }, "dave");
  return { w, p, q };
}

test("R19 noticeReferenceOf answers the open notice, else the most recent, else null; never the project's id", async () => {
  const w = seeded();
  assert.equal(w.nn.noticeReferenceOf(w.P), null);
  assert.equal(w.nn.noticeReferenceOf(null), null);
  const one = await post(w);
  assert.equal(w.nn.noticeReferenceOf(w.P), one.notice);
  assert.notEqual(one.notice, w.P);
  await post(w, { notice: one.notice, final: "stopped" });
  assert.equal(w.nn.noticeReferenceOf(w.P), one.notice, "the most recent, stopped");
  w.clock.now += DAY;
  const two = await post(w, { wording: "Again" });
  assert.equal(w.nn.noticeReferenceOf(w.P), two.notice);
  assert.equal(w.nn.noticeReferenceOf(w.Q), null);
});

test("R20 noticesPublic answers every revision and attestation in order of notice then first-published instant, paged, nothing removed, no prepared revision", async () => {
  const { w, p, q } = await busy();
  await prepare(w, { notice: p.notice, wording: "only prepared" });
  const all = w.nn.noticesPublic({});
  assert.equal(all.ok, true);
  assert.equal(all.limit, 200);
  assert.equal(all.truncated, false);
  const keys = all.items.map((i) => [i.notice, i.published_at]);
  assert.deepEqual(keys, [...keys].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0)));
  assert.equal(all.items.filter((i) => i.type === "revision").length, w.count("nn_revisions"));
  assert.equal(all.items.filter((i) => i.type === "attestation").length, w.count("nn_attestations"));
  assert.ok(!JSON.stringify(all).includes("only prepared"), "a prepared revision never appears");
  for (const i of all.items) {
    if (i.type === "revision") { assert.match(i.signature, /^-----BEGIN SSH SIGNATURE-----/); assert.ok(i.json.format); }
    else { assert.ok(i.signature.instance_signature && i.signature.key_id); assert.ok(Array.isArray(i.openings)); }
  }
  assert.ok(all.items.some((i) => i.notice === q.notice && i.json.status === "stopped"), "a stopped notice stays served");
  /* paged */
  const seen = [];
  let next = null;
  do { const pg = w.nn.noticesPublic({ after: next, limit: 2 }); seen.push(...pg.items); next = pg.next; assert.ok(pg.items.length <= 2); } while (next);
  assert.deepEqual(seen, all.items);
  assert.equal(w.nn.noticesPublic({ limit: 5000 }).limit, 1000);
});

test("R21 groupKeysPublic: the slug, the owners' keys with status and first-listed date, the copy's keys; revoked keys stay listed", async () => {
  const w = seeded();
  assert.deepEqual(w.nn.groupKeysPublic().copy, [], "no attestation yet: no copy key");
  await post(w);
  const k = w.nn.groupKeysPublic();
  assert.equal(k.group, "test-group");
  const listed = new Set(k.owners.map((o) => o.key));
  for (const m of ["alice", "bob", "dave"]) assert.ok(listed.has(`ssh-ed25519 ${keyFor(m).b64}`), `${m} owns a project`);
  assert.ok(!listed.has(`ssh-ed25519 ${keyFor("carol").b64}`), "carol owns nothing and signed nothing");
  for (const o of k.owners) { assert.equal(o.status, "attests"); assert.equal(o.first_listed, "2026-09-01"); }
  assert.equal(k.copy.length, 1);
  assert.equal(k.copy[0].label, nn.COPY_KEY_LABEL);
  assert.ok(k.copy[0].public_key && k.copy[0].first_used);
  /* a key that signed a published edition is listed, owner or not */
  w.st.sql.exec(`INSERT INTO published_bundles (bundle_id, edition, bundle_sha, ratified_at, attestor_key, gate_version, sig_armored)
                 VALUES ('INFO-2026-0001-x', 1, 'x', 't', ?, 'g', 's')`, `ssh-ed25519 ${keyFor("carol").b64} c`);
  assert.ok(new Set(w.nn.groupKeysPublic().owners.map((o) => o.key)).has(`ssh-ed25519 ${keyFor("carol").b64}`));
  /* a revoked key stays listed (its own date: the next test) */
  w.st.sql.exec(`UPDATE signers SET status='revoked', status_at='2026-09-20T10:00:00Z' WHERE member_id='alice'`);
  assert.equal(w.nn.groupKeysPublic().owners.find((o) => o.key.includes(keyFor("alice").b64)).status, "revoked");
});

test("R21 owners: every key that signed a public docket entry (docket.docketSigners, its R5; N520) is listed, owner or not, and stays listed when revoked", async () => {
  const w = seeded();
  w.member("erin");
  w.member("frank");
  const listed = () => new Set(w.nn.groupKeysPublic().owners.map((o) => o.key));
  const line = (who) => `ssh-ed25519 ${keyFor(who).b64}`;
  /* negative control: carol, erin and frank own nothing and have signed nothing */
  for (const m of ["carol", "erin", "frank"]) assert.ok(!listed().has(line(m)), `${m} is not listed before signing`);
  w.publish(w.P, "CASE-2026-0001");
  w.docketEntry("CASE-2026-0001", "carol", { seq: 1 });
  w.docketEntry("CASE-2026-0001", "erin", { seq: 2, at: w.clock.now + 1000 });
  w.docketEntry("CASE-2026-0001", "carol", { seq: 3, at: w.clock.now + 2000 });
  /* every docket signer is listed, each once, and nobody else who owns nothing and signed nothing */
  const signers = w.docket.docketSigners().map((s) => s.keyB64);
  assert.deepEqual(signers, [keyFor("carol").b64, keyFor("erin").b64]);
  for (const k of signers) assert.equal(w.nn.groupKeysPublic().owners.filter((o) => o.key === `ssh-ed25519 ${k}`).length, 1);
  assert.ok(!listed().has(line("frank")), "frank signed nothing");
  const erin = w.nn.groupKeysPublic().owners.find((o) => o.key === line("erin"));
  assert.deepEqual([erin.status, erin.first_listed], ["attests", "2026-09-01"]);
  for (const v of ["erin", "Cover erin", "h_erin"]) assert.ok(!JSON.stringify(w.nn.groupKeysPublic()).includes(v), `no member named: ${v}`);
  /* a revoked docket signer stays listed, with its own date */
  w.st.sql.exec(`UPDATE signers SET status='revoked', status_at='2026-09-25T08:00:00Z' WHERE member_id='erin'`);
  const gone = w.nn.groupKeysPublic().owners.find((o) => o.key === line("erin"));
  assert.deepEqual([gone.status, gone.revoked_on], ["revoked", "2026-09-25"]);
});

test("R21 a revoked key's date is its own status_at (credentials R8, R21), never the date this copy saw it; null when status_at was never recorded", async () => {
  const w = seeded();
  await post(w);
  const ownerOf = (who) => w.nn.groupKeysPublic().owners.find((o) => o.key === `ssh-ed25519 ${keyFor(who).b64}`);
  const statusAt = (who) => w.credentials.signerList().signers.find((s) => s.key_b64 === keyFor(who).b64).status_at;
  /* revoked by credentials' own act (R10): its status_at is that act's instant, and R21 answers its date */
  assert.equal(w.credentials.signerRevokeOwn({ keyB64: keyFor("alice").b64, by: "alice" }).ok, true);
  const at = statusAt("alice");
  assert.match(at, /^\d{4}-\d\d-\d\dT/);
  assert.deepEqual([ownerOf("alice").status, ownerOf("alice").revoked_on], ["revoked", at.slice(0, 10)]);
  /* a key revoked on a stated past instant keeps that date, however much later this copy reads it, ticks included */
  w.st.sql.exec(`UPDATE signers SET status='revoked', status_by='admin', status_at='2026-09-03T23:30:00Z' WHERE member_id='bob'`);
  w.clock.now += 40 * DAY;
  await w.nn.attestTick();
  await w.nn.sealTick();
  assert.deepEqual([ownerOf("bob").status, ownerOf("bob").revoked_on], ["revoked", "2026-09-03"]);
  /* a revocation recorded before status_at was kept (the column null): "not recorded", never a date this copy saw */
  w.st.sql.exec(`UPDATE signers SET status='revoked', status_at=NULL WHERE member_id='dave'`);
  await w.nn.attestTick();
  w.clock.now += DAY;
  assert.equal(statusAt("dave"), null);
  assert.deepEqual([ownerOf("dave").status, ownerOf("dave").revoked_on], ["revoked", null]);
  /* control: a key that attests carries no revocation date at all */
  w.member("erin");
  w.join(w.P, "erin", "joined", true);
  assert.deepEqual([ownerOf("erin").status, "revoked_on" in ownerOf("erin")], ["attests", false]);
});

test("R21 copy: every instance key that signed an attestation (attestation.instanceKeys, its R5), first used, labelled; a replaced key stays listed, a receipt-only key is not", async () => {
  const w = seeded();
  const fresh = () => generateKeyPairSync("ed25519").privateKey.export({ type: "pkcs8", format: "der" }).toString("base64");
  const other = (signingKey) => new Attestation({ storage: w.st, record: w.record, provenance: w.provenance, signingKey,
                                                  now: () => new Date(w.clock.now).toISOString().replace(/\.\d{3}Z$/, "Z") });
  const copy = () => w.nn.groupKeysPublic().copy;
  const want = (ids) => w.attestation.instanceKeys().filter((k) => ids.includes(k.key_id))
    .map((k) => ({ key_id: k.key_id, public_key: k.public_key, first_used: k.first_used, label: nn.COPY_KEY_LABEL }));
  /* a key that has signed only a receipt (attestation R4) is the instance's, but has signed no attestation: not listed */
  const receiptOnly = other(fresh());
  assert.equal((await receiptOnly.signReceipt({ captureSha: "a".repeat(64), retrievalLocator: "https://example.org/x", retrieved: "2026-09-30T00:00:00Z" })).ok, true);
  assert.equal(w.attestation.instanceKeys().length, 1);
  assert.deepEqual(copy(), [], "no attestation yet: no copy key");
  const one = await post(w);
  const first = w.rows(`SELECT DISTINCT key_id FROM nn_attestations`).map((r) => r.key_id);
  assert.equal(first.length, 1);
  assert.deepEqual(copy(), want(first));
  assert.equal(copy()[0].first_used, "2026-10-01T12:00:00Z", "the date it was first used");
  /* the operator replaces the instance key: the next attestation is signed with the new one, and the old stays listed */
  const replaced = other(fresh());
  w.attestation.instanceSign = replaced.instanceSign.bind(replaced);
  w.clock.now += 2 * DAY;
  await post(w, { notice: one.notice, wording: "Changed after the key was replaced" });
  const both = w.rows(`SELECT DISTINCT key_id FROM nn_attestations`).map((r) => r.key_id);
  assert.equal(both.length, 2);
  assert.deepEqual(copy(), want(both));
  assert.deepEqual(copy().map((k) => k.first_used), ["2026-10-01T12:00:00Z", "2026-10-03T12:00:00Z"]);
  assert.equal(w.attestation.instanceKeys().length, 3, "the receipt-only key is held by attestation, and still not listed");
  /* each listed key verifies the attestations it signed */
  const { createPublicKey, verify } = await import("node:crypto");
  for (const a of w.rows(`SELECT digest, signature, key_id FROM nn_attestations`)) {
    const k = copy().find((c) => c.key_id === a.key_id);
    const pub = createPublicKey({ key: { kty: "OKP", crv: "Ed25519", x: Buffer.from(k.public_key, "base64").toString("base64url") }, format: "jwk" });
    assert.equal(verify(null, Buffer.from(w.attestation.instanceStatement(nn.ATTESTATION_FORMAT, a.digest)), pub, Buffer.from(a.signature, "base64")), true);
  }
});

test("R22 noticesOf answers a viewer who can see the project its notices, dates, misses and sealed weeks, never the salts", async () => {
  const { w, p } = await busy();
  assert.equal(w.nn.noticesOf({ project: w.P, viewer: V("dave") }).reason, "NO_SUCH_PROJECT");
  assert.equal(w.nn.noticesOf({ project: null, viewer: A }).reason, "REQUIRED_ARGUMENT_MISSING");
  const r = w.nn.noticesOf({ project: w.P, viewer: V("carol") });       /* a participant, not an owner */
  assert.equal(r.ok, true);
  assert.equal(r.methodVersion, nn.ACTIVITY_METHOD_VERSION);
  const n = r.notices[0];
  assert.equal(n.notice, p.notice);
  assert.equal(n.status, "open");
  assert.deepEqual(n.revisions.map((v) => v.revision), [1, 2]);
  assert.deepEqual(n.attestations.map((a) => a.kind), ["posted", "published", "monthly", "posted"]);
  assert.equal(n.next_monthly, "2026-12-01");
  assert.equal(n.lapse_date, null);
  assert.deepEqual(n.missed_monthlies, []);
  assert.deepEqual(r.sealed_weeks.map((s) => [s.week, s.timestamped]), [[nn.weekLabel(LAST), true]]);
  const text = JSON.stringify(r);
  for (const l of w.rows(`SELECT salt FROM nn_week_leaves WHERE bundle_id NOT IN (SELECT bundle_id FROM published_case_members)`))
    assert.ok(!text.includes(l.salt));
});

test("R23 directorySubmission prefills a directory's fields for a published edition, and sends nothing", async () => {
  const w = seeded();
  w.publish(w.P, "CASE-2026-0001-budget", 1, []);
  w.st.sql.exec(`INSERT INTO case_documents (case_id, edition, doc_sha, text, authored_at, sig_armored) VALUES (?, 1, 'd', ?, 't', 'sig')`,
                "CASE-2026-0001-budget", "---\ntitle: \"Where the fund went\"\n---\n\n# Where the fund went\n");
  const r = w.nn.directorySubmission({ case: "CASE-2026-0001-budget", viewer: A });
  assert.deepEqual(r, { ok: true, group: "test-group", case: "CASE-2026-0001-budget", edition: 1,
    link: "?op=publishedcase&caseId=CASE-2026-0001-budget&edition=1", title: "Where the fund went",
    summary: "What the case covers.", sends: "nothing: copy these fields, or open them" });
  assert.equal(w.nn.directorySubmission({ case: "CASE-2026-0001-budget", viewer: V("dave") }).ok, false, "a project the viewer cannot see");
  assert.equal(w.nn.directorySubmission({ case: "CASE-2026-0009-none", viewer: A }).ok, false);
});

test("R24 only an owner's own signature publishes a revision: no machine, AI run or administrator posts, re-words or back-dates one", async () => {
  const w = seeded();
  w.member("erin", { role: "admin" });
  for (const who of [MACHINE, "token:x", "admin", V("erin")]) {
    const r = await w.nn.prepareNotice({ project: w.P, wording: "x", since: "2026-02-01", by: who, viewer: who.startsWith("member:") || who === "admin" ? who : MACHINE });
    assert.ok(["MACHINE_CANNOT_POST_NOTICE", "NOTICE_NOT_THE_OWNER"].includes(r.reason), `${who}: ${r.reason}`);
  }
  const p = await post(w);
  /* a prepared change signed with another member's key is refused */
  const change = await prepare(w, { notice: p.notice, since: "2026-01-06" });
  assert.equal(change.reason, "NOTICE_SINCE_EARLIER", "never back-dated by a change");
  /* attestations state only computed facts: no field of an attestation is taken from a caller */
  const att = w.rows(`SELECT json FROM nn_attestations`).map((r) => JSON.parse(r.json))[0];
  assert.deepEqual(Object.keys(att).sort(), ["activity", "as_of", "cases", "format", "group", "kind", "notice", "openings", "revision", "seals", "status"]);
});

test("R25 no answer of this module names a member: revisions, attestations, keys, leaves and openings, over every answer", async () => {
  const { w, p } = await busy();
  const answers = [w.nn.noticesPublic({ limit: 1000 }), w.nn.groupKeysPublic(), w.nn.activityMethod(),
                   w.nn.noticesOf({ project: w.P, viewer: A }), w.nn.noticesOf({ project: w.Q, viewer: V("dave") }),
                   await prepare(w, { notice: p.notice, wording: "x", collaborate: true }),
                   w.nn.directorySubmission({ case: "CASE-2026-0001-budget", viewer: A }),
                   ...w.rows(`SELECT json FROM nn_openings`).map((o) => JSON.parse(o.json))];
  assert.deepEqual(namedMembers(answers), []);
  /* negative controls: a real leak, in any of the forms a member is known by, is caught wherever it sits; a member's
     letters inside encoded material (a key, a salt, a signature) are not a name */
  const leaks = [{ by: "member:bob" }, ["Prepared by Cover carol."], { handle: "h_dave" }, { note: "alice" },
                 { nested: { revision: JSON.stringify({ wording: "with dave" }) } }];
  leaks.forEach((l) => assert.notDeepEqual(namedMembers([...answers, l]), [], JSON.stringify(l)));
  assert.deepEqual(namedMembers([{ key: "ssh-ed25519 AAAAbobQ+alice/carol=", salt: "0bob1dave", sig: "xh_bobx" }]), []);
});

/* R25: the members a set of answers names: every maximal run of identifier and encoding characters, over the answers'
   JSON (keys, values and JSON nested in strings alike), that is a member's id or handle. Their display name ("Cover <id>")
   and their viewer stamp ("member:<id>") contain the id as such a run, so both are caught; a member's letters inside a
   longer run (base64, hex, an id) are not a name. */
function namedMembers(answers, members = ["alice", "bob", "carol", "dave"]) {
  const names = new Set(members.flatMap((m) => [m, `h_${m}`]));
  const runs = JSON.stringify(answers).replace(/\\./g, " ").match(/[A-Za-z0-9_+\/=-]+/g) || [];
  return [...new Set(runs.filter((r) => names.has(r)))].sort();
}

test("R26 published rows are never altered; a bundle purge leaves a published notice standing; only the whole-store purge clears", async () => {
  const w = seeded();
  const rowsOf = () => Object.fromEntries(nn.NETWORK_NOTICES_TABLES.map((t) => [t, w.rows(`SELECT * FROM ${t}`).map((r) => JSON.stringify(r))]));
  let was = rowsOf();
  const step = async (fn) => { await fn(); const now = rowsOf();
    for (const t of ["nn_notices", "nn_revisions", "nn_attestations", "nn_week_seals", "nn_week_leaves", "nn_week_roots", "nn_openings"])
      assert.deepEqual(now[t].slice(0, was[t].length), was[t], `${t}: earlier rows unchanged`);
    was = now; };
  let p, x;
  await step(async () => { x = w.act(w.P, LAST + DAY); p = await post(w); });
  await step(() => w.nn.sealTick());
  await step(async () => { w.publish(w.P, "CASE-2026-0001-budget", 1, [x]); await w.nn.openSeals({ case: "CASE-2026-0001-budget", edition: 1 }); });
  await step(async () => { w.clock.now = Date.parse("2026-11-01T00:10:00Z"); await w.nn.attestTick(); });
  await step(() => post(w, { notice: p.notice, final: "stopped" }));
  assert.equal(w.record.declarePurge("x", ["nn_revisions"]).reason, "TABLE_DECLARED");
  for (const t of nn.NETWORK_NOTICES_TABLES) assert.equal(nn.networkNoticesOwns(t), true);
  const before = rowsOf();
  w.purge({ bundleId: w.P });
  w.purge({ bundleId: x });
  assert.deepEqual(rowsOf(), before, "a bundle purge leaves every row");
  w.purge({});
  for (const t of nn.NETWORK_NOTICES_TABLES) assert.equal(w.count(t), 0, t);
});

test("R29 no place is named in this module's outward text or answers", async () => {
  const { w } = await busy();
  /* the places the instance's profiles and the test profile name (`jurisdictions` is not this module's to import) */
  const places = ["Oakland", "Alameda", "California", "Port Ellery", "Ellery", "Harbour"];
  const outward = JSON.stringify([nn.NETWORK_NOTICE_CHECKS, nn.ACTIVITY_METHOD, nn.OUTWARD_ACT_WARNING, nn.OTHERS_WELCOME, nn.SEAL_METHOD,
                                  w.nn.noticesPublic({ limit: 1000 }), w.nn.groupKeysPublic(), w.nn.noticesOf({ project: w.P, viewer: A })]);
  for (const p of places) assert.ok(!outward.toLowerCase().includes(p.toLowerCase()), `names ${p}`);
});

test("R10 R20 R21 the ops map reads the control plane's stamps from the query, never the body; the public reads and scheduler consumers answer through the module", async () => {
  const w = seeded();
  const url = (q) => new URL(`http://x/?${new URLSearchParams(q)}`);
  const ops = nn.networkNoticesOps(w.nn, url({ by: A, viewer: A }), { project: w.P, wording: "Via the op", since: "2026-02-01", by: V("carol") });
  assert.deepEqual(Object.keys(ops), ["noticeprepare", "noticepost", "notices", "directorysubmission"]);
  const p = await ops.noticeprepare();
  assert.equal(p.ok, true, "alice's stamp, not the body's carol");
  const { sign } = await import("./fixture.mjs");
  const posted = await nn.networkNoticesOps(w.nn, url({ by: A, viewer: A }), { digest: p.digest, signature: sign(p), acknowledged: true }).noticepost();
  assert.equal(posted.ok, true);
  assert.equal((await nn.networkNoticesOps(w.nn, url({ by: A, viewer: A, project: w.P }), {}).notices()).notices.length, 1);
  /* R10 R20 R21: registered at start with public-read (its R18) under the names K1150 fixed, served with no credential */
  assert.deepEqual(w.nn.publicReadsRegistration, { ok: true, module: "network-notices", names: ["activitymethod", "noticespublic", "groupkeyspublic"] });
  assert.deepEqual(w.publicRead.publicReads().filter((r) => r.module === "network-notices"),
    [{ name: "activitymethod", module: "network-notices", params: [] }, { name: "groupkeyspublic", module: "network-notices", params: [] },
     { name: "noticespublic", module: "network-notices", params: ["after", "limit"] }]);
  const served = w.publicRead.publicRead("noticespublic", { limit: "1", viewer: A, by: A });
  assert.equal(served.ok, true);
  assert.equal(served.result.items.length, 1);
  assert.equal(w.publicRead.publicRead("groupkeyspublic", {}).result.group, "test-group");
  assert.equal(w.publicRead.publicRead("activitymethod", {}).result.version, nn.ACTIVITY_METHOD_VERSION);
  assert.equal(w.publicRead.publicRead("groupkeys", {}).ok, false, "only the names K1150 fixed");
  assert.equal(w.publicRead.registerPublicReads("network-notices", nn.networkNoticesPublicReads(w.nn)).reason, "PROVIDER_DECLARED");
  const c = nn.networkNoticesConsumers(w.nn);
  assert.deepEqual(Object.keys(c), ["working-on-seal", "working-on-attest"]);
  w.act(w.P, LAST + DAY);
  assert.equal(c["working-on-seal"].due(NOW), NOW);
  assert.equal(c["working-on-seal"].wake(NOW), NOW);
  assert.equal((await c["working-on-seal"].tick(NOW)).workingonseal.sealed.length, 1);
  assert.equal(c["working-on-seal"].wake(NOW), null, "nothing left to seal");
  w.act(w.P, NOW);
  assert.equal(c["working-on-seal"].wake(NOW), monday(NOW) + WEEK);
  assert.ok("workingonattest" in await c["working-on-attest"].tick(NOW));
  assert.equal(c["working-on-attest"].wake(NOW), monday(NOW) + 4 * DAY, "an open notice: the next UTC day");
});

test("R22 noticesOf answers a discoverable project the viewer sees only at existence with membership.existenceAct's refusal (C-70.1), never noSuchProject", async () => {
  const w = seeded();
  await post(w);
  assert.equal(w.membership.projectVisibilitySet({ projectId: w.P, setting: "discoverable", by: "alice", viewer: A }).ok, true);
  const r = w.nn.noticesOf({ project: w.P, viewer: V("dave") });
  assert.deepEqual(r, w.membership.existenceAct(w.P, V("dave")));
  assert.deepEqual([r.reason, r.check, r.project], ["PROJECT_SEEN_NOT_A_PARTICIPANT", "C-70.1", w.P]);
  assert.ok(!JSON.stringify(r).includes("NOTE-"), "nothing of the notices");
  /* negative controls: hidden, the same viewer is answered as absent; a participant reads it whole */
  assert.equal(w.membership.projectVisibilitySet({ projectId: w.P, setting: "hidden", by: "alice", viewer: A }).ok, true);
  assert.equal(w.nn.noticesOf({ project: w.P, viewer: V("dave") }).reason, "NO_SUCH_PROJECT");
  assert.equal(w.nn.noticesOf({ project: w.P, viewer: V("carol") }).ok, true);
  /* through the op, the control plane's viewer stamp */
  const url = new URL(`http://x/?${new URLSearchParams({ project: w.P, viewer: V("dave"), by: V("dave") })}`);
  assert.equal((await nn.networkNoticesOps(w.nn, url, {}).notices()).reason, "NO_SUCH_PROJECT");
});
