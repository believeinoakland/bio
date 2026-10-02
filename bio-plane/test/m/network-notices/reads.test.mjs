/* network-notices: the project reference (R19), the public reads (R20, R21), the member reads (R22, R23), the
   invariants (R24, R25, R26, R29), and the ops, public reads and scheduler consumers it publishes, at the interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, post, prepare, keyFor, V, MACHINE, NOW, DAY, WEEK, monday } from "./fixture.mjs";
import * as nn from "../../../src/network-notices/index.mjs";

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
  /* a revoked key stays listed, with the date this copy saw it revoked */
  w.st.sql.exec(`UPDATE signers SET status='revoked' WHERE member_id='alice'`);
  w.clock.now += DAY;
  await w.nn.attestTick();
  const a = w.nn.groupKeysPublic().owners.find((o) => o.key.includes(keyFor("alice").b64));
  assert.deepEqual([a.status, a.revoked_on], ["revoked", "2026-10-02"]);
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
  const text = JSON.stringify(answers);
  for (const m of ["alice", "bob", "carol", "dave"])
    for (const s of [m, `h_${m}`, `Cover ${m}`, `member:${m}`]) assert.ok(!text.includes(s), `${s} named`);
});

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

test("the ops map reads the control plane's stamps from the query, never the body; the public reads and scheduler consumers answer through the module", async () => {
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
  const reads = nn.networkNoticesPublicReads(w.nn);
  assert.deepEqual(Object.keys(reads), ["noticespublic", "groupkeys", "noticemethod"]);
  assert.equal(reads.noticespublic(url({ limit: "1" })).items.length, 1);
  assert.equal(reads.groupkeys().group, "test-group");
  assert.equal(reads.noticemethod().version, nn.ACTIVITY_METHOD_VERSION);
  const c = nn.networkNoticesConsumers(w.nn);
  assert.deepEqual(Object.keys(c), ["working-on-seal", "working-on-attest"]);
  w.act(w.P, LAST + DAY);
  assert.equal(c["working-on-seal"].due(NOW), NOW);
  assert.equal((await c["working-on-seal"].tick(NOW)).workingonseal.sealed.length, 1);
  assert.equal(c["working-on-seal"].wake(NOW), monday(NOW) + WEEK);
  assert.ok("workingonattest" in await c["working-on-attest"].tick(NOW));
});
