/* network-notices: proof of activity (R14, R15, R16, R17, R18) and the one outbound call (R30), at the module's
   interface. The timestamp authorities are stubbed (fixture `tsa`); `verifyOpening` is also run from its pure export
   alone, as a stranger would run it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, post, V, MACHINE, NOW, DAY, WEEK, monday } from "./fixture.mjs";
import { verifyOpening, SEAL_SLOTS, weekLabel, leafHash, nodeHash } from "../../../src/network-notices/index.mjs";
import { TSA_ENDPOINTS, parseTimestampResponse } from "../../../src/tsa.mjs";

const A = V("alice");
const LAST = monday(NOW) - WEEK;                 /* the last complete week's Monday */
const W = weekLabel(LAST);
const answersOf = (w) => JSON.stringify([w.nn.noticesPublic({}), w.nn.groupKeysPublic(), w.nn.noticesOf({ project: w.P, viewer: A }),
                                         w.nn.noticesOf({ project: w.Q, viewer: V("dave") })]);

test("R14 after a week ends, each project not closed is sealed over its member acts, whether or not it has a notice; leaves name no author", async () => {
  const w = seeded();
  w.R = w.project("closed-one", "alice");
  const x = w.act(w.P, LAST + DAY), y = w.act(w.P, LAST + 2 * DAY, { author: V("carol") });
  w.act(w.Q, LAST + DAY, { author: V("dave") });
  w.act(w.R, LAST + DAY);
  w.close(w.R, { at: LAST + 3 * DAY });
  w.act(w.P, LAST + 3 * DAY, { author: MACHINE });          /* not a member act: no leaf */
  assert.equal(w.nn.sealDue(), NOW);
  const t = await w.nn.sealTick();
  assert.deepEqual(t.sealed, [{ week: W, projects: 2, timestamped: true }]);
  const seals = w.rows(`SELECT * FROM nn_week_seals ORDER BY project`);
  assert.deepEqual(seals.map((s) => s.project).sort(), [w.P, w.Q].sort(), "P (with or without a notice) and Q; never closed R");
  const leaves = w.rows(`SELECT * FROM nn_week_leaves WHERE project=? ORDER BY at`, w.P);
  assert.deepEqual(leaves.map((l) => l.bundle_id), [x, y]);
  for (const l of leaves) {
    assert.match(l.salt, /^[0-9a-f]{64}$/);
    assert.match(l.digest, /^[0-9a-f]{64}$/);
    assert.equal(l.digest, w.record.head(l.bundle_id).bundleSha, "the bundle's digest after the act");
    assert.equal(l.operation, "promotion");
    assert.ok(!Object.keys(l).some((k) => /author/.test(k)) && !JSON.stringify(l).includes("alice") && !JSON.stringify(l).includes("carol"));
  }
  assert.equal(w.nn.sealDue(), null, "sealed once");
  assert.equal(w.nn.sealWake(), monday(NOW) + WEEK);
  assert.equal((await w.nn.sealTick()).sealed.length, 0);
});

test("R14 the seal is a padded Merkle root: the slot count does not follow the act count, and the same acts seal differently", async () => {
  const a = seeded(), b = seeded();
  a.act(a.P, LAST + DAY);
  for (let i = 0; i < 9; i++) b.act(b.P, LAST + DAY + i * 1000);
  await a.nn.sealTick();
  await b.nn.sealTick();
  const sa = a.rows(`SELECT * FROM nn_week_seals`)[0], sb = b.rows(`SELECT * FROM nn_week_seals`)[0];
  assert.equal(sa.size, SEAL_SLOTS);
  assert.equal(sb.size, SEAL_SLOTS, "one act and nine acts pad to the same size");
  /* the root is not the unpadded root over the act's own leaf */
  const leaf = a.rows(`SELECT * FROM nn_week_leaves`)[0];
  assert.notEqual(sa.seal, leafHash({ bundle: leaf.bundle_id, digest: leaf.digest, operation: leaf.operation, at: leaf.at, salt: leaf.salt }));
  /* a week with no member act has no seal */
  const c = seeded();
  c.act(c.P, LAST + DAY, { author: MACHINE });
  await c.nn.sealTick();
  assert.equal(c.count("nn_week_seals"), 0);
  assert.equal(c.tsa.calls.length, 0, "nothing to timestamp");
});

test("R14 the first run seals the last complete week; later runs seal each week after the last sealed one", async () => {
  const w = seeded();
  w.act(w.P, LAST - 3 * WEEK);                    /* before the module ran: never sealed */
  w.act(w.P, LAST + DAY);
  await w.nn.sealTick();
  assert.deepEqual(w.rows(`SELECT week FROM nn_week_roots`).map((r) => r.week), [W]);
  w.act(w.P, LAST + WEEK + DAY);
  w.act(w.P, LAST + 2 * WEEK + DAY);
  w.clock.now = NOW + 2 * WEEK;
  const t = await w.nn.sealTick();
  assert.deepEqual(t.sealed.map((s) => s.week), [weekLabel(LAST + WEEK), weekLabel(LAST + 2 * WEEK)]);
});

test("R15 one timestamp per instance per week, over the root of all the week's project seals, through the governor, authorities in order", async () => {
  const w = seeded();
  w.act(w.P, LAST + DAY);
  w.act(w.Q, LAST + DAY, { author: V("dave") });
  await w.nn.sealTick();
  assert.equal(w.tsa.calls.length, 1, "one request for two projects");
  assert.equal(w.tsa.calls[0].url, TSA_ENDPOINTS[0]);
  assert.equal(w.tsa.calls[0].method, "POST");
  assert.equal(w.tsa.calls[0].headers["content-type"], "application/timestamp-query");
  assert.deepEqual(w.governed, [new URL(TSA_ENDPOINTS[0]).host]);
  const root = w.rows(`SELECT * FROM nn_week_roots`)[0];
  assert.equal(root.untimestamped, 0);
  assert.equal(parseTimestampResponse(new Uint8Array(Buffer.from(root.response, "base64")), root.root).ok, true, "bound to the week's root");
  assert.match(root.token_sha, /^[0-9a-f]{64}$/);
});

test("R15 when every authority fails, the seals are kept and marked untimestamped, and their weeks still count", async () => {
  const w = seeded();
  w.weeksOfWork(w.P, 1);
  w.tsa.mode = "refuse";
  const t = await w.nn.sealTick();
  assert.deepEqual(t.sealed, [{ week: W, projects: 1, timestamped: false }]);
  assert.deepEqual(w.tsa.calls.map((c) => c.url), [...TSA_ENDPOINTS], "each authority, in order");
  assert.equal(w.count("nn_week_seals"), 1);
  const r = await post(w);
  assert.equal(r.attestation.json.activity.weeks_counted, 1);
  assert.deepEqual(r.attestation.json.seals.map((s) => [s.week, s.untimestamped, s.timestamp_sha]), [[W, true, null]]);
});

test("R16 salts and leaves are in no answer until opened, and then only the opened ones", async () => {
  const w = seeded();
  const x = w.act(w.P, LAST + DAY), y = w.act(w.P, LAST + DAY + 1000);
  await w.nn.sealTick();
  await post(w);
  const secrets = w.rows(`SELECT salt, digest FROM nn_week_leaves`).map((l) => l.salt)
    .concat(w.rows(`SELECT secret FROM nn_week_seals UNION SELECT secret FROM nn_week_roots`).map((r) => r.secret));
  const before = answersOf(w);
  for (const s of secrets) assert.ok(!before.includes(s), "no salt or secret before opening");
  w.publish(w.P, "CASE-2026-0001-budget", 1, [x]);
  await w.nn.openSeals({ case: "CASE-2026-0001-budget", edition: 1 });
  const after = answersOf(w);
  const saltOf = (b) => w.rows(`SELECT salt FROM nn_week_leaves WHERE bundle_id=?`, b)[0].salt;
  assert.ok(after.includes(saltOf(x)), "the opened leaf's salt is served");
  assert.ok(!after.includes(saltOf(y)), "an unopened leaf's salt is not");
  for (const s of w.rows(`SELECT secret FROM nn_week_seals UNION SELECT secret FROM nn_week_roots`)) assert.ok(!after.includes(s.secret));
});

test("R17 openSeals publishes the leaves of acts on the edition's bundles, with salts, paths and the token; idempotent; a published attestation follows", async () => {
  const w = seeded();
  const notice = await post(w);
  const x = w.act(w.P, LAST + DAY), y = w.act(w.P, LAST + DAY + 1000);
  await w.nn.sealTick();
  w.publish(w.P, "CASE-2026-0001-budget", 1, [x]);
  const r = await w.nn.openSeals({ case: "CASE-2026-0001-budget", edition: 1 });
  assert.deepEqual(r.opened, [W]);
  assert.equal(r.attestation.kind, "published");
  const o = JSON.parse(w.rows(`SELECT json FROM nn_openings`)[0].json);
  assert.deepEqual(o.leaves.map((l) => l.leaf.bundle), [x], "only the edition's bundles; nothing else of the week");
  assert.ok(!JSON.stringify(o).includes(y));
  assert.equal(o.timestamp, w.rows(`SELECT response FROM nn_week_roots`)[0].response);
  assert.equal(verifyOpening(o).ok, true);
  /* idempotent per (case, edition, week) */
  const again = await w.nn.openSeals({ case: "CASE-2026-0001-budget", edition: 1 });
  assert.deepEqual(again.opened, []);
  assert.equal(again.attestation, null);
  assert.equal(w.count("nn_openings"), 1);
  /* the attestation references the opening, and the public read carries it */
  const att = w.nn.noticesPublic({}).items.filter((i) => i.type === "attestation" && i.kind === "published")[0];
  assert.equal(att.notice, notice.notice);
  assert.deepEqual(att.json.openings, [{ case: "CASE-2026-0001-budget", edition: 1, week: W }]);
  assert.deepEqual(att.json.cases, [{ case: "CASE-2026-0001-budget", edition: 1 }]);
  assert.deepEqual(att.openings, [o]);
  /* an edition never ratified opens nothing */
  assert.equal((await w.nn.openSeals({ case: "CASE-2026-0009-none", edition: 1 })).ok, false);
});

test("R17 a week still being worked when the edition is committed is opened once sealed, by the retried opening", async () => {
  const w = seeded();
  await post(w);
  const x = w.act(w.P, monday(NOW) + 3600000);    /* this week, not yet sealed */
  w.publish(w.P, "CASE-2026-0001-budget", 1, [x]);
  assert.deepEqual((await w.nn.openSeals({ case: "CASE-2026-0001-budget", edition: 1 })).opened, []);
  assert.equal(w.nn.attestDue(), NOW, "an opening waits to be retried");
  w.clock.now = NOW + WEEK;
  await w.nn.sealTick();
  const t = await w.nn.attestTick();
  assert.deepEqual(t.openings, [{ case: "CASE-2026-0001-budget", edition: 1, weeks: [weekLabel(monday(NOW))] }]);
  assert.equal(w.rows(`SELECT settled_at FROM nn_open_requests`)[0].settled_at !== null, true);
});

test("R18 verifyOpening is pure: an opening verifies without this instance; a tampered leaf, path or root fails", async () => {
  const w = seeded();
  const x = w.act(w.P, LAST + DAY);
  w.act(w.P, LAST + DAY + 5000, { bundle: x });
  await w.nn.sealTick();
  w.publish(w.P, "CASE-2026-0001-budget", 1, [x]);
  await w.nn.openSeals({ case: "CASE-2026-0001-budget", edition: 1 });
  const o = JSON.parse(w.rows(`SELECT json FROM nn_openings`)[0].json);
  assert.equal(o.leaves.length, 2);
  /* a stranger: only the JSON and the pure function */
  const v = verifyOpening(JSON.parse(JSON.stringify(o)));
  assert.deepEqual([v.ok, v.leaves, v.seal, v.timestamp], [true, true, true, "bound"]);
  const tamper = (f) => { const c = structuredClone(o); f(c); return verifyOpening(c); };
  assert.equal(tamper((c) => { c.leaves[0].leaf.operation = "edit"; }).leaves, false, "a tampered leaf fails");
  assert.equal(tamper((c) => { c.leaves[1].leaf.salt = "0".repeat(64); }).ok, false);
  assert.equal(tamper((c) => { c.leaves[0].position ^= 1; }).leaves, false);
  assert.equal(tamper((c) => { c.leaves[0].path[3] = "f".repeat(64); }).leaves, false);
  const forged = tamper((c) => { c.week_root = nodeHash(c.week_root, c.week_root); });
  assert.equal(forged.seal, false);
  assert.equal(forged.timestamp, "not_bound");
  assert.equal(verifyOpening(null).ok, false);
  assert.equal(verifyOpening({ seal: 1 }).ok, false);
  assert.equal(w.nn.verifyOpening(o).ok, true, "the instance's door answers the same");
  /* an untimestamped week opens and says so */
  const u = seeded();
  const ux = u.act(u.P, LAST + DAY);
  u.tsa.mode = "refuse";
  await u.nn.sealTick();
  u.publish(u.P, "CASE-2026-0001-budget", 1, [ux]);
  await u.nn.openSeals({ case: "CASE-2026-0001-budget", edition: 1 });
  const uv = verifyOpening(JSON.parse(u.rows(`SELECT json FROM nn_openings`)[0].json));
  assert.deepEqual([uv.ok, uv.leaves, uv.seal, uv.timestamp], [false, true, true, "untimestamped"]);
});

test("R30 no outbound call but the timestamp authorities, and nothing is pushed to any directory", async () => {
  const w = seeded();
  const real = globalThis.fetch;
  const elsewhere = [];
  globalThis.fetch = async (u) => { elsewhere.push(String(u)); throw new Error("no network in this test"); };
  try {
    w.weeksOfWork(w.P, 2);
    const x = w.act(w.P, LAST + DAY);
    const n = await post(w, { collaborate: true });
    await w.nn.sealTick();
    w.publish(w.P, "CASE-2026-0001-budget", 1, [x]);
    await w.nn.openSeals({ case: "CASE-2026-0001-budget", edition: 1 });
    w.clock.now = Date.parse("2026-11-01T00:10:00Z");
    await w.nn.attestTick();
    await w.nn.sealTick();
    await post(w, { notice: n.notice, final: "stopped" });
    w.nn.directorySubmission({ case: "CASE-2026-0001-budget", viewer: A });
    w.nn.noticesPublic({}); w.nn.groupKeysPublic(); w.nn.noticesOf({ project: w.P, viewer: A });
  } finally { globalThis.fetch = real; }
  assert.deepEqual(elsewhere, [], "the global fetch was never called");
  assert.ok(w.tsa.calls.length >= 1);
  for (const c of w.tsa.calls) assert.ok(TSA_ENDPOINTS.includes(c.url), c.url);
});

test("R17 R16 an edition committed but not yet published whole is opened by no call: the request is kept, and the tick opens it once the edition is whole; an uncommitted edition keeps nothing", async () => {
  const w = seeded();
  await post(w);
  const x = w.act(w.P, LAST + DAY);
  await w.nn.sealTick();
  /* the case commit (publication R40): a case row and a ratified case document, the edition still awaiting a member */
  w.st.sql.exec(`INSERT INTO cases (case_id, project_id, opened) VALUES ('CASE-2026-0001-budget', ?, 't')`, w.P);
  w.st.sql.exec(`INSERT INTO case_documents (case_id, edition, doc_sha, text, authored_at, sig_armored, ratified_at)
                 VALUES ('CASE-2026-0001-budget', 1, 'd', 'doc', 't', 'sig', 't')`);
  w.st.sql.exec(`INSERT INTO published_cases (case_id, edition, opened, ratified_at) VALUES ('CASE-2026-0001-budget', 1, 't', NULL)`);
  w.st.sql.exec(`INSERT INTO published_case_members (case_id, edition, ord, bundle_id, version_sha, role) VALUES ('CASE-2026-0001-budget', 1, 0, ?, NULL, 'supporting')`, x);
  const r = await w.nn.openSeals({ case: "CASE-2026-0001-budget", edition: 1 });
  assert.deepEqual([r.ok, r.reason, r.kept], [false, "NO_PUBLISHED_EDITION", true]);
  assert.equal(w.count("nn_openings"), 0, "nothing opened before the edition is whole");
  assert.equal(w.rows(`SELECT 1 FROM nn_open_requests WHERE case_id='CASE-2026-0001-budget' AND settled_at IS NULL`).length, 1);
  w.clock.now += DAY;
  assert.equal(w.nn.attestDue(), w.clock.now);
  assert.deepEqual((await w.nn.attestTick()).openings, [], "still not whole: the tick opens nothing");
  assert.equal(w.count("nn_openings"), 0);
  /* the edition is published whole (publication R53 stamps ratified_at) */
  w.st.sql.exec(`UPDATE published_cases SET ratified_at='t2' WHERE case_id='CASE-2026-0001-budget' AND edition=1`);
  const t = await w.nn.attestTick();
  assert.deepEqual(t.openings, [{ case: "CASE-2026-0001-budget", edition: 1, weeks: [W] }]);
  assert.equal(verifyOpening(JSON.parse(w.rows(`SELECT json FROM nn_openings`)[0].json)).ok, true);
  assert.equal(w.rows(`SELECT 1 FROM nn_attestations WHERE kind='published'`).length, 1);
  /* an edition with no committed case document keeps nothing */
  const r2 = await w.nn.openSeals({ case: "CASE-2026-0002-none", edition: 1 });
  assert.deepEqual([r2.reason, r2.kept], ["NO_PUBLISHED_EDITION", false]);
  w.st.sql.exec(`INSERT INTO cases (case_id, project_id, opened) VALUES ('CASE-2026-0003-draft', ?, 't')`, w.P);
  w.st.sql.exec(`INSERT INTO case_documents (case_id, edition, doc_sha, text, authored_at) VALUES ('CASE-2026-0003-draft', 1, 'd', 'doc', 't')`);
  assert.equal((await w.nn.openSeals({ case: "CASE-2026-0003-draft", edition: 1 })).kept, false, "an unsigned document is not committed");
  assert.equal(w.rows(`SELECT 1 FROM nn_open_requests WHERE case_id IN ('CASE-2026-0002-none','CASE-2026-0003-draft')`).length, 0);
});
