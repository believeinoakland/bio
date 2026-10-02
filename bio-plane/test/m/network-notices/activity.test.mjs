/* network-notices: the activity level (R7, R8, R9, R10, R28) and the attestations that carry it (R12, R13), at the
   module's interface. The member acts are real history entries committed through record-core at stated instants. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createPublicKey, verify } from "node:crypto";
import { seeded, post, prepare, V, MACHINE, NOW, DAY, WEEK, monday, day } from "./fixture.mjs";
import { ACTIVITY_LEVELS, ACTIVITY_METHOD, ACTIVITY_METHOD_VERSION, ACTIVITY_WINDOW, ATTESTATION_FORMAT, levelOf }
  from "../../../src/network-notices/index.mjs";
import { instanceStatement } from "../../../src/provenance/index.mjs";
import { canonicalJson } from "../../../src/record-grammar/json.mjs";
import { createHash } from "node:crypto";

const A = V("alice");
const sha = (s) => createHash("sha256").update(s, "utf8").digest("hex");
const postedActivity = async (w, project = w.P, who = "alice") => (await post(w, { project }, who)).attestation.json.activity;
const at = (iso) => Date.parse(iso);

test("R7 the level is one of five words by counted weeks, with the cut-offs at 0/1, 3/4, 6/7 and 9/10", async () => {
  assert.deepEqual(ACTIVITY_LEVELS.map((l) => [l.level, l.min, l.max]),
    [["Very active", 10, 13], ["Active", 7, 9], ["Some work", 4, 6], ["Quiet", 1, 3], ["Dormant", 0, 0]]);
  const want = { 0: "Dormant", 1: "Quiet", 3: "Quiet", 4: "Some work", 6: "Some work", 7: "Active", 9: "Active", 10: "Very active", 13: "Very active" };
  for (const [k, level] of Object.entries(want)) {
    assert.equal(levelOf(Number(k)), level);
    const w = seeded();
    w.weeksOfWork(w.P, Number(k));
    const a = await postedActivity(w);
    assert.equal(a.weeks_counted, Number(k));
    assert.equal(a.level, level, `${k} counted weeks`);
  }
});

test("R8 R28 a member act is a member-authored write to the project's records; machine, AI and mechanical writes never count, nor do other projects'", async () => {
  const w = seeded();
  const wk = (i) => monday(NOW) - i * WEEK + DAY;
  w.act(w.P, wk(1), { author: MACHINE });                       /* an AI run's write */
  w.act(w.P, wk(2), { author: "token:ingest" });                /* a machine credential */
  w.act(w.P, wk(3), { author: "claude" });                      /* a non-member author */
  w.act(w.P, wk(4), { author: A, writer: "mechanical" });       /* a mechanical writer */
  w.act(w.Q, wk(5), { author: V("dave") });                     /* another project's record */
  w.act(w.P, wk(6), { author: "" });                            /* no author */
  assert.equal((await postedActivity(w)).weeks_counted, 0, "an AI-only week counts zero");
  /* a member's adoption of a machine draft counts; the draft does not */
  const w2 = seeded();
  const draft = w2.act(w2.P, wk(2), { author: MACHINE });
  w2.act(w2.P, wk(1), { author: V("carol"), bundle: draft });
  w2.commit(w2.P, { at: wk(3), author: V("bob"), type: "project", state: "forming" });   /* the project's own record */
  const a = await postedActivity(w2);
  assert.equal(a.weeks_counted, 2);
});

test("R8 R28 volume never moves the level: fifty acts in one week count as one week", async () => {
  const w = seeded();
  for (let i = 0; i < 50; i++) w.act(w.P, monday(NOW) - WEEK + i * 60000);
  const a = await postedActivity(w);
  assert.equal(a.weeks_counted, 1);
  assert.equal(a.level, "Quiet");
});

test("R9 activity is {level, weeks_counted, window: 13, as_of, method} over the 13 complete weeks before as_of", async () => {
  const w = seeded();
  w.act(w.P, monday(NOW) + 3600000);                 /* this week, not complete: not counted */
  w.act(w.P, monday(NOW) - 13 * WEEK);               /* the window's first instant: counted */
  w.act(w.P, monday(NOW) - 13 * WEEK - 1000);        /* just before the window: not counted */
  const a = await postedActivity(w);
  assert.deepEqual(a, { level: "Quiet", weeks_counted: 1, window: ACTIVITY_WINDOW, as_of: day(NOW), method: ACTIVITY_METHOD_VERSION });
});

test("R10 activityMethod answers the method as fixed text with its version, with no credential; attestations name the version", async () => {
  const w = seeded();
  const m = w.nn.activityMethod();
  assert.equal(m.ok, true);
  assert.equal(m.version, ACTIVITY_METHOD_VERSION);
  assert.deepEqual(m.method, ACTIVITY_METHOD);
  for (const k of ["window", "counted", "member_act", "levels", "never_counted"]) assert.ok(m.method[k], k);
  assert.match(m.method.window, /13 complete UTC ISO weeks/);
  assert.equal(m.method.levels.length, 5);
  assert.equal(JSON.stringify(w.nn.activityMethod()), JSON.stringify(m), "fixed");
  assert.equal((await postedActivity(w)).method, ACTIVITY_METHOD_VERSION);
  /* an earlier attestation keeps naming the version it was computed under: its stored JSON is never re-written */
  const stored = w.rows(`SELECT json FROM nn_attestations`)[0].json;
  assert.equal(JSON.parse(stored).activity.method, ACTIVITY_METHOD_VERSION);
});

test("R12 an attestation carries exactly its fields, and is signed (R13) with the instance key over provenance's statement", async () => {
  const w = seeded();
  w.weeksOfWork(w.P, 2);
  w.publish(w.P, "CASE-2026-0001-budget");
  const r = await post(w);
  const json = r.attestation.json;
  assert.deepEqual(Object.keys(json).sort(), ["activity", "as_of", "cases", "format", "group", "kind", "notice", "openings", "revision", "seals", "status"]);
  assert.equal(json.format, ATTESTATION_FORMAT);
  assert.equal(json.kind, "posted");
  assert.equal(json.status, "open");
  assert.equal(json.revision, r.prepared.digest);
  assert.deepEqual(json.cases, [{ case: "CASE-2026-0001-budget", edition: 1 }]);
  assert.deepEqual(json.seals, []);
  assert.deepEqual(json.openings, []);
  const row = w.rows(`SELECT * FROM nn_attestations`)[0];
  assert.equal(row.digest, sha(canonicalJson(json)));
  const key = w.provenance.instanceKeys().find((k) => k.key_id === row.key_id);
  const pub = createPublicKey({ key: { kty: "OKP", crv: "Ed25519", x: Buffer.from(key.public_key, "base64").toString("base64url") }, format: "jwk" });
  assert.equal(verify(null, Buffer.from(instanceStatement(ATTESTATION_FORMAT, row.digest)), pub, Buffer.from(row.signature, "base64")), true);
});

test("R12 a monthly attestation is issued on each month's first day while the notice is open, once; never after a stop", async () => {
  const w = seeded();
  const one = await post(w);
  w.clock.now = at("2026-10-15T00:00:00Z");
  assert.equal((await w.nn.attestTick()).monthly.length, 0, "the notice's own month takes none");
  w.clock.now = at("2026-11-01T00:10:00Z");
  assert.equal(w.nn.attestDue(), w.clock.now);
  const t = await w.nn.attestTick();
  assert.deepEqual(t.monthly.map((m) => [m.kind, m.as_of]), [["monthly", "2026-11-01"]]);
  assert.equal((await w.nn.attestTick()).monthly.length, 0, "each issued once");
  assert.equal(w.nn.attestDue(w.clock.now + 3600000), null);
  assert.equal(w.nn.attestWake(), at("2026-11-02T00:00:00Z"));
  await post(w, { notice: one.notice, final: "stopped" });
  w.clock.now = at("2026-12-01T00:10:00Z");
  assert.equal((await w.nn.attestTick()).monthly.length, 0, "a stopped notice takes no monthly");
  assert.equal(w.nn.noticesOf({ project: w.P, viewer: A }).notices[0].attestations.filter((a) => a.kind === "monthly").length, 1);
});

test("R12 a project reaching closed while the notice is open gets a closed attestation at once; an owner may still stop it with a handoff", async () => {
  const w = seeded();
  const one = await post(w);
  w.clock.now += DAY;
  w.close(w.P);
  const t = await w.nn.attestTick();
  assert.deepEqual(t.closed, [one.notice]);
  const n = w.nn.noticesOf({ project: w.P, viewer: A }).notices[0];
  assert.equal(n.status, "closed");
  assert.equal(n.attestations.at(-1).json.status, "closed");
  w.clock.now = at("2026-11-01T00:10:00Z");
  assert.equal((await w.nn.attestTick()).monthly.length, 0, "a closed notice takes no monthly");
  const stop = await post(w, { notice: one.notice, final: "stopped", handoff: "The council took it up" });
  assert.equal(stop.revision, 2);
  assert.equal(w.nn.noticesOf({ project: w.P, viewer: A }).notices[0].status, "stopped");
});

test("R12 a lapse after two consecutive Dormant monthlies with no revision between; a revision between avoids it", async () => {
  const lapse = seeded();
  const one = await post(lapse);
  lapse.clock.now = at("2026-11-01T00:10:00Z");
  await lapse.nn.attestTick();
  const n1 = lapse.nn.noticesOf({ project: lapse.P, viewer: A }).notices[0];
  assert.equal(n1.level.level, "Dormant");
  assert.equal(n1.lapse_date, "2026-12-01", "the lapse date while one is running");
  lapse.clock.now = at("2026-12-01T00:10:00Z");
  const t = await lapse.nn.attestTick();
  assert.deepEqual(t.lapsed, [one.notice]);
  const n2 = lapse.nn.noticesOf({ project: lapse.P, viewer: A }).notices[0];
  assert.equal(n2.status, "lapsed");
  assert.equal(n2.attestations.at(-1).kind, "lapsed");
  lapse.clock.now = at("2027-01-01T00:10:00Z");
  assert.equal((await lapse.nn.attestTick()).monthly.length, 0, "a lapsed notice takes no monthly");
  assert.equal(lapse.nn.noticesPublic({}).items.length, 5, "it stays served");

  const kept = seeded();
  const k1 = await post(kept);
  kept.clock.now = at("2026-11-01T00:10:00Z");
  await kept.nn.attestTick();
  kept.clock.now = at("2026-11-20T10:00:00Z");
  await post(kept, { notice: k1.notice, wording: "Still at it" });
  assert.equal(kept.nn.noticesOf({ project: kept.P, viewer: A }).notices[0].lapse_date, null);
  kept.clock.now = at("2026-12-01T00:10:00Z");
  const t2 = await kept.nn.attestTick();
  assert.deepEqual(t2.lapsed, []);
  assert.equal(kept.nn.noticesOf({ project: kept.P, viewer: A }).notices[0].status, "open");
});

test("R13 a monthly falling due with no key bound is not issued; the miss is stated and the last attested level shown with its date", async () => {
  const w = seeded();
  w.weeksOfWork(w.P, 4);
  await post(w);
  const sign = w.provenance.instanceSign;
  w.provenance.instanceSign = async () => ({ ok: false, reason: "RECEIPT_NO_KEY" });
  w.clock.now = at("2026-11-01T00:10:00Z");
  const t = await w.nn.attestTick();
  assert.equal(t.monthly.length, 0);
  assert.deepEqual(t.missed.map((m) => m.month), ["2026-11"]);
  const n = w.nn.noticesOf({ project: w.P, viewer: A }).notices[0];
  assert.deepEqual(n.missed_monthlies.map((m) => m.month), ["2026-11"]);
  assert.deepEqual(n.level, { level: "Some work", as_of: "2026-10-01" });
  assert.equal(n.attestations.length, 1);
  /* the key bound again later: the month stays missed, never issued late */
  w.provenance.instanceSign = sign;
  w.clock.now += DAY;
  assert.equal((await w.nn.attestTick()).monthly.length, 0);
});
