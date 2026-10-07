/* following R20, R21: every policy the group holds watched at its published copy, every version seen kept, and the
   changes a member reviews as "Noticed". */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha, MEMBER, BOB, OUTSIDER, MACHINE, T0, DAY } from "./fixture.mjs";

const ADDR = "https://ellery.example/policies/records-retention";
const HELD = "2026-10-01T00:00:00Z";
const DUE = Date.parse("2026-10-08T00:00:00Z");
const V1 = "<h1>Records retention</h1><p>Keep for 2 years.</p>";
const V2 = "<h1>Records retention</h1><p>Keep for 1 year.</p>";

/* A held policy whose text is a passage of a capture of `address` (the bytes V1 at ADDR, else its own), filed in
   `bundle`. */
function policy(w, { id = "STD-2026-0001-policy", address = ADDR, bundle = "INFO-2026-0300-policy", ...x } = {}) {
  w.bundle(bundle, { project: x.project || "" });
  const text = w.policyText(`cid-${id}`, sha(address === ADDR ? V1 : `held at ${address}`), bundle, address, HELD);
  const p = { id, text: [text], ...x };
  w.policies.push(p);
  return p;
}
const watches = (w, viewer = MEMBER) => w.f.follows({ viewer, now: w.t }).items.filter((i) => i.kind === "policy");

test("R20 every held policy whose text is from a capture of a public https address is watched with no member act, author none, due 7 days from its last read; one held cited, at no public address, superseded, or not a policy is not", () => {
  const w = world();
  const told = [];
  w.f.onFollowed("scheduler", (x) => told.push(x));
  policy(w);
  policy(w, { id: "STD-2026-0002-policy", held: "cited" });
  policy(w, { id: "STD-2026-0003-policy", address: "http://ellery.example/p", bundle: "INFO-2026-0301-p" });
  policy(w, { id: "STD-2026-0004-policy", superseded_by: "STD-2026-0001-policy", bundle: "INFO-2026-0302-p" });
  policy(w, { id: "STD-2026-0005-ordinance", kind: "ordinance", bundle: "INFO-2026-0303-p" });
  const ws = watches(w);
  assert.equal(ws.length, 1);
  const [x] = ws;
  assert.deepEqual([x.subject.standard, x.subject.address, x.author, x.cadence, x.last_read, x.next_due],
                   ["STD-2026-0001-policy", ADDR, null, "weekly", HELD, "2026-10-08T00:00:00Z"]);
  assert.match(x.watch, /standing watch/);
  assert.deepEqual(told, [{ follow: x.follow, due: "2026-10-08T00:00:00Z" }], "the watch's making is told once, with its next due");
  assert.equal(w.f.followDue(T0), false);
  assert.equal(w.f.followWake(T0), DUE);
  /* only the policy itself ends it: no member unfollows the group's standing watch */
  assert.equal(w.f.unfollow({ follow: x.follow, author: MEMBER }).reason, "NOT_THE_AUTHOR");
  assert.equal(w.f.unfollow({ follow: x.follow, author: MACHINE }).reason, "NOT_THE_AUTHOR");
  assert.equal(watches(w).length, 1, "made once, however often it is read");
});

test("R20 the tick reads a watch every 7 days as a capture through acquire attributed to it: the same bytes land nothing new, different bytes are kept as a new capture beside every earlier one", async () => {
  const w = world();
  policy(w);
  w.serve(ADDR, V1);
  w.t = DUE - 1000;
  assert.equal((await w.f.followTick(w.t)).read.length, 0, "not due before 7 days");
  assert.equal(w.fetches.length, 0);
  w.t = DUE;
  const t1 = await w.f.followTick(w.t);
  assert.deepEqual(t1.read.map((r) => [r.kind, r.outcome]), [["policy", "unchanged"]]);
  const o = w.fetches[0];
  assert.deepEqual([o.cls, o.captureRequest.locator, o.captureRequest.purpose, o.captureRequest.heldSha, o.captureRequest.credential],
                   ["daemon", ADDR, "following", sha(V1), undefined], "a daemon read, conditional on the bytes held, with no credential");
  assert.equal(w.landed.length, 0, "the same bytes land nothing new");
  assert.equal(w.f.followWake(w.t + 1000), DUE + 7 * DAY);
  /* changed */
  w.serve(ADDR, V2);
  w.t = DUE + 7 * DAY;
  const t2 = await w.f.followTick(w.t);
  assert.equal(t2.captured.length, 1);
  assert.deepEqual([t2.captured[0].standard, t2.captured[0].capture, t2.captured[0].before.capture], ["STD-2026-0001-policy", sha(V2), sha(V1)]);
  assert.equal(w.landed.length, 1);
  assert.equal(w.landed[0].request.target, null, "a new capture, never replacing the earlier one");
  assert.match(w.landed[0].say.notes, /the group's standing watch of a policy it holds/);
  assert.match(w.landed[0].say.notes, /never higher: verifying it is a named member's decision/);
  assert.deepEqual(w.rows(`SELECT seq, capture_sha FROM policy_versions ORDER BY seq`).map((r) => [r.seq, r.capture_sha]),
                   [[1, sha(V1)], [2, sha(V2)]], "every version seen is kept");
  /* changed back: a third version, the first still kept */
  w.serve(ADDR, V1);
  w.t += 7 * DAY;
  await w.f.followTick(w.t);
  assert.deepEqual(w.rows(`SELECT capture_sha FROM policy_versions ORDER BY seq`).map((r) => r.capture_sha), [sha(V1), sha(V2), sha(V1)]);
});

test("R20 an address that does not answer is recorded failed with its reason and stays watched, read again 7 days on; one behind an account or a fee is never read on the tick (member_act_required)", async () => {
  const w = world();
  const told = [];
  w.f.onFollowed("scheduler", (x) => told.push(x));
  policy(w);
  policy(w, { id: "STD-2026-0002-policy", access: "paywalled", address: "https://paid.ellery.example/p", bundle: "INFO-2026-0301-p" });
  policy(w, { id: "STD-2026-0003-policy", access: "reading_room", address: "https://room.ellery.example/p", bundle: "INFO-2026-0302-p" });
  w.t = DUE;
  const t = await w.f.followTick(w.t);
  assert.equal(t.failed.length, 1);
  assert.deepEqual([t.failed[0].standard, t.failed[0].reason], ["STD-2026-0001-policy", "FETCH_FAILED"]);
  assert.deepEqual(t.member_act_required.map((m) => [m.standard, m.gate]).sort(), [["STD-2026-0002-policy", "paywalled"], ["STD-2026-0003-policy", "reading_room"]]);
  assert.deepEqual(w.fetches.map((o) => o.captureRequest.locator), [ADDR], "nothing gated is fetched");
  const listed = watches(w);
  assert.equal(listed.length, 3, "still watched");
  const failed = listed.find((i) => i.subject.standard === "STD-2026-0001-policy");
  assert.deepEqual([failed.last_outcome, failed.next_due], ["failed", "2026-10-15T00:00:00Z"]);
  assert.match(listed.find((i) => i.subject.access === "paywalled").unscheduled, /member's own act/);
  assert.equal(w.f.followDue(w.t + 1000), false, "a failed read is not retried before 7 days");
  w.serve(ADDR, V1);
  w.t = DUE + 7 * DAY;
  assert.deepEqual((await w.f.followTick(w.t)).read.find((r) => r.standard === "STD-2026-0001-policy").outcome, "unchanged");
});

test("R20 a watch ends when its policy is superseded, its listeners told; each capture takes the sight of the policy it watches", async () => {
  const w = world();
  const told = [];
  w.f.onFollowed("scheduler", (x) => told.push(x));
  const p = policy(w);
  w.project("PRJ-2026-0001-a");
  const hidden = policy(w, { id: "STD-2026-0002-policy", address: "https://ellery.example/policies/sources", bundle: "INFO-2026-0310-src",
                             project: "PRJ-2026-0001-a", sight: "bundle", readers: [MEMBER] });
  const [a, b] = watches(w).map((x) => x.follow);
  assert.deepEqual(watches(w, BOB).map((x) => x.subject.standard), ["STD-2026-0001-policy"], "a policy kept from a member keeps its watch from them");
  assert.equal(watches(w, "nobody").length, 0);
  w.serve(ADDR, V2);
  w.serve("https://ellery.example/policies/sources", "changed");
  w.t = DUE;
  await w.f.followTick(w.t);
  const land = (addr) => w.landed.find((l) => l.request.locators[0] === addr);
  assert.equal(land(ADDR).request.bundle, null, "a policy every member sees: its capture is the group's");
  assert.equal(land("https://ellery.example/policies/sources").request.bundle, "INFO-2026-0310-src", "kept from the public: its capture lands in its source's project");
  /* superseded: the watch ends, told with no next due */
  p.superseded_by = "STD-2026-0009-policy";
  assert.deepEqual(watches(w).map((x) => x.follow), [b]);
  assert.deepEqual(told.at(-1), { follow: a, due: null });
  assert.notEqual(w.one(`SELECT ended_at FROM follows WHERE follow_id=?`, a).ended_at, null);
  hidden.held = "absent";
  assert.equal(watches(w).length, 0, "no longer held with its text: no longer watched");
});

test("R21 policyChanges answers one entry per kept capture differing from the one before, in order, paged by cursor, with amendment_held; a change in a policy the viewer may not see is left out whole; it writes nothing and states no meaning", async () => {
  const w = world();
  const p = policy(w);
  w.project("PRJ-2026-0001-a");
  policy(w, { id: "STD-2026-0002-policy", address: "https://ellery.example/policies/sources", bundle: "INFO-2026-0310-src",
              project: "PRJ-2026-0001-a", sight: "bundle", readers: [MEMBER] });
  w.f.follows({ viewer: MEMBER });
  const versions = [V2, V1, "<p>third</p>"];
  for (let i = 0; i < versions.length; i++) {
    w.serve(ADDR, versions[i]);
    w.serve("https://ellery.example/policies/sources", `s${i}`);
    w.t = DUE + i * 7 * DAY;
    await w.f.followTick(w.t);
  }
  const before = JSON.stringify(w.rows(`SELECT * FROM policy_versions`)) + JSON.stringify(w.rows(`SELECT * FROM follows`));
  const all = w.f.policyChanges({ viewer: MEMBER });
  assert.equal(all.ok, true);
  assert.equal(all.changes.length, 6);
  assert.equal(all.cursor, null);
  const mine = all.changes.filter((c) => c.standard === "STD-2026-0001-policy");
  assert.deepEqual(mine.map((c) => [c.before.capture, c.after.capture]), [[sha(V1), sha(V2)], [sha(V2), sha(V1)], [sha(V1), sha("<p>third</p>")]]);
  assert.deepEqual(Object.keys(mine[0]).sort(), ["address", "after", "amendment_held", "before", "standard", "watch"]);
  assert.deepEqual([mine[0].address, mine[0].before.at, mine[0].after.at], [ADDR, HELD, "2026-10-08T00:00:00Z"]);
  assert.ok(all.changes.every((c, i, a) => i === 0 || a[i - 1].after.at <= c.after.at), "in order of the later capture's instant");
  /* sight: the hidden policy's changes are left out whole */
  assert.deepEqual([...new Set(w.f.policyChanges({ viewer: BOB }).changes.map((c) => c.standard))], ["STD-2026-0001-policy"]);
  assert.equal(w.f.policyChanges({ viewer: null }).changes.length, 0);
  /* paging: limit, cursor, clamp */
  const p1 = w.f.policyChanges({ viewer: MEMBER, limit: 4 });
  assert.equal(p1.changes.length, 4);
  const p2 = w.f.policyChanges({ viewer: MEMBER, limit: 4, after: p1.cursor });
  assert.deepEqual([...p1.changes, ...p2.changes], all.changes);
  assert.equal(p2.cursor, null);
  assert.equal(w.f.policyChanges({ viewer: MEMBER, limit: 0 }).changes.length, 1, "clamped to 1–200");
  assert.equal(w.f.policyChanges({ viewer: MEMBER, limit: 999 }).changes.length, 6);
  /* amendment_held: none held */
  assert.deepEqual(mine.map((c) => c.amendment_held), [false, false, false]);
  /* a superseding version effective between the first two captures */
  w.policies.push({ id: "STD-2026-0009-policy", text: [], period: { from: "2026-10-05", to: null } });
  p.superseded_by = "STD-2026-0009-policy";
  assert.deepEqual(w.f.policyChanges({ viewer: MEMBER }).changes.filter((c) => c.standard === p.id).map((c) => c.amendment_held), [true, false, false]);
  /* an amendment (an adopted temporal relation into the policy) effective between the last two */
  p.superseded_by = null;
  p.temporal = [{ type: "amends", direction: "in", effective: { date: "2026-10-20" } },
                { type: "amends", direction: "out", effective: { date: "2026-10-09" } },
                { type: "amends", direction: "in", withdrawn: { by: MEMBER }, effective: { date: "2026-10-10" } }];
  assert.deepEqual(w.f.policyChanges({ viewer: MEMBER }).changes.filter((c) => c.standard === p.id).map((c) => c.amendment_held), [false, false, true]);
  assert.equal(JSON.stringify(w.rows(`SELECT * FROM policy_versions`)) + JSON.stringify(w.rows(`SELECT * FROM follows`)), before, "it writes nothing");
  assert.doesNotMatch(JSON.stringify(all), /\b(?:violat|breach|illegal|suspicious|significan|silent)/i);
  assert.match(all.note, /never a finding/);
  assert.equal(OUTSIDER.startsWith("member:"), true);
});
