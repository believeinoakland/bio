/* following R12–R14, R16, R17: due, wake and the tick for `scheduler`; what members see; the invariants. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, body, MEMBER, OUTSIDER, MACHINE, T0, DAY } from "./fixture.mjs";
import { FOLLOWING_TABLES } from "../../../src/following/index.mjs";

const REG = (n) => `https://registry.ellery.example/r/${n}`;
const reg = (w, n, x = {}) => w.f.followRegister({ address: REG(n), author: MEMBER, viewer: MEMBER, ...x });

test("R12 due while any follow or per_meeting capture is due; wake is the earliest instant one falls due, or null; a follow is due daily from its last read unless it names a longer cadence", async () => {
  const w = world();
  assert.equal(w.f.followDue(T0), false);
  assert.equal(w.f.followWake(T0), null, "no follow, no wake");
  reg(w, 1);
  reg(w, 2, { cadence: "weekly" });
  assert.equal(w.f.followDue(T0), true, "never read: due now");
  assert.equal(w.f.followWake(T0), T0);
  w.serve(REG(1), "a"); w.serve(REG(2), "b");
  await w.f.followTick(T0);
  assert.equal(w.f.followDue(T0 + 1000), false);
  assert.equal(w.f.followWake(T0 + 1000), T0 + DAY, "the daily follow is next, a day from its read");
  assert.equal(w.f.followDue(T0 + DAY), true);
  await w.f.followTick(T0 + DAY);
  assert.equal(w.f.followWake(T0 + DAY + 1000), T0 + 2 * DAY);
  w.f.unfollow({ follow: 1, author: MEMBER });
  assert.equal(w.f.followWake(T0 + DAY + 1000), T0 + 7 * DAY, "the weekly follow, seven days from its read");
  /* a per_meeting capture is a candidate too */
  const b = body(w);
  w.bundle("INFO-2026-0100-agenda");
  w.watched.push({ bundle: "INFO-2026-0100-agenda", address: "https://ellery.example/agenda" });
  w.f.perMeetingBody({ address: "https://ellery.example/agenda", body: b, notice: "notice_of_sitting", author: MEMBER, viewer: MEMBER });
  assert.equal(w.f.followWake(T0 + DAY + 1000), Date.parse("2026-10-12T10:00:00Z"));
});

test("R13 a tick reads at most 50 due subjects, oldest due first or in the rank's order, each claimed under the host's epoch so a retry never reads one twice; it answers its fields, and paused it reads nothing", async () => {
  const w = world();
  for (let i = 1; i <= 55; i++) { reg(w, i); w.serve(REG(i), `r${i}`); }
  /* make 1–5 the oldest due: read once, a day and more ago */
  const t = await w.f.followTick(T0);
  assert.deepEqual(Object.keys(t).sort(), ["at", "captured", "configured", "epoch", "failed", "member_act_required", "paused", "read", "unscheduled"].sort());
  assert.equal(t.configured, true);
  assert.equal(t.read.length, 50);
  assert.deepEqual(t.read.map((r) => r.follow), Array.from({ length: 50 }, (_, i) => i + 1), "never read, then by id");
  /* the five left over are the oldest due on the next tick */
  const t2 = await w.f.followTick(T0 + 1000);
  assert.deepEqual(t2.read.map((r) => r.follow), [51, 52, 53, 54, 55]);
  /* the rank's order, offered as {kind, id, waitingSince} */
  let offered = null;
  const rank = (items) => { offered = items; return [...items].reverse(); };
  const t3 = await w.f.followTick(T0 + DAY + 5000, rank);
  assert.equal(offered.length, 55);
  assert.deepEqual(offered[0], { kind: "follow:register", id: "follow:1", waitingSince: T0 + DAY });
  assert.deepEqual(t3.read.slice(0, 3).map((r) => r.follow), [55, 54, 53]);
  /* a throwing rank leaves the order read */
  const t4 = await w.f.followTick(T0 + 3 * DAY, () => { throw new Error("x"); });
  assert.equal(t4.read[0].follow, 1);
  /* a retry under an open epoch reads no subject twice: one failed, so the epoch stays open */
  const w2 = world();
  reg(w2, 1); reg(w2, 2);
  w2.serve(REG(1), "a");                           /* REG(2) does not answer */
  const a = await w2.f.followTick(T0);
  assert.equal(a.failed.length, 1);
  const before = w2.fetches.length;
  const b = await w2.f.followTick(T0 + 1000);
  assert.equal(w2.fetches.length, before, "both subjects were claimed under the open epoch");
  assert.deepEqual(b.skipped, ["follow:2"]);
  /* not re-entrant */
  w2.sweepHost.running.add("following");
  assert.equal((await w2.f.followTick(T0 + 2000)).busy, true);
  w2.sweepHost.running.delete("following");
  /* paused: nothing read, and it says so */
  w2.paused = true;
  const p = await w2.f.followTick(T0 + 2 * DAY);
  assert.equal(p.paused.paused, true);
  assert.equal(p.read.length + p.captured.length, 0);
  assert.equal(w2.fetches.length, before);
});

test("R14 follows answers every follow the viewer may see with its subject, author, period, cadence, last read, next due and unscheduled reason, so a follow not being read is visible without a tick", async () => {
  const w = world();
  const b = body(w);
  w.project("PRJ-2026-0001-a");
  w.bundle("INFO-2026-0002-a", { project: "PRJ-2026-0001-a" });
  w.f.followBody({ body: b, from: "2026-09-01", until: "2026-12-31", cadence: "weekly", author: MEMBER, viewer: MEMBER });
  reg(w, 1, { home: "INFO-2026-0002-a" });
  reg(w, 2, { gated: { kind: "account" } });
  w.bundle("INFO-2026-0100-agenda");
  w.watched.push({ bundle: "INFO-2026-0100-agenda", address: "https://ellery.example/agenda" });
  const items = w.f.follows({ viewer: MEMBER }).items;
  const bf = items.find((i) => i.kind === "body");
  assert.deepEqual([bf.subject.id, bf.author, bf.period, bf.cadence, bf.last_read, bf.next_due], [b, MEMBER, { from: "2026-09-01", until: "2026-12-31" }, "weekly", null, "2026-10-06T12:00:00Z"]);
  assert.match(items.find((i) => i.follow === 3).unscheduled, /member's own act/);
  assert.match(items.find((i) => i.kind === "per_meeting").unscheduled, /names no body/);
  /* sight: the outsider sees nothing of the project's follow */
  const theirs = w.f.follows({ viewer: OUTSIDER }).items;
  assert.equal(theirs.some((i) => i.follow === 2), false);
  assert.equal(theirs.some((i) => i.follow === 1), true);
  assert.equal(w.f.follows({ viewer: "nobody" }).items.length, 0, "an absent viewer sees nothing");
  w.serve(REG(1), "x");
  await w.f.followTick(T0);
  const after = w.f.follows({ viewer: MEMBER }).items.find((i) => i.follow === 2);
  assert.equal(after.last_read, "2026-10-06T12:00:00Z");
  assert.equal(after.next_due, "2026-10-07T12:00:00Z");
});

test("R16 following is mechanical: a tick captures and records, lands at collected and never verified, and states no meaning of a change", async () => {
  const w = world();
  reg(w, 1);
  w.serve(REG(1), "v1");
  await w.f.followTick(T0);
  w.serve(REG(1), "v2");
  const t = await w.f.followTick(T0 + DAY);
  assert.equal(t.captured.length, 1);
  for (const l of w.landed) {
    assert.match(l.say.notes, /Filed at collected and never higher: verifying it is a named member's decision/);
    assert.equal(l.filed.doc.verified, undefined);
  }
  assert.doesNotMatch(JSON.stringify(t), /\b(?:violat|breach|illegal|suspicious|finding|significan)/i);
});

test("R17 its tables are declared with their classes; a person query's follow takes the narrowest sight of its author's project", () => {
  const w = world();
  const decl = w.record.declaredTables().filter((d) => d.module === "following");
  assert.deepEqual(decl.map((d) => d.name).sort(), FOLLOWING_TABLES.map((t) => t.name).sort());
  for (const d of decl) for (const c of ["purge", "expunge", "export", "sight", "derive", "version_chain"]) assert.ok(d[c] !== undefined, `${d.name}.${c}`);
  assert.equal(decl.find((d) => d.name === "follows").sight, "bundle");
  w.project("PRJ-2026-0001-a");
  w.bundle("INFO-2026-0002-a", { project: "PRJ-2026-0001-a" });
  const r = w.f.followPersonQuery({ register: "ellery.licences", scheme: "ellery_licence", value: "L-00042", address: "https://licences.ellery.example/search?licence=L-00042",
                                    home: "INFO-2026-0002-a", author: MEMBER, viewer: MEMBER });
  assert.equal(r.ok, true);
  assert.equal(w.f.follows({ viewer: MEMBER }).items.length, 1);
  assert.equal(w.f.follows({ viewer: OUTSIDER }).items.length, 0, "a member outside the project sees no person query");
  assert.equal(w.f.followPersonQuery({ register: "ellery.licences", scheme: "ellery_licence", value: "L-00042", address: "https://licences.ellery.example/search?licence=L-00042",
                                       home: "INFO-2026-0002-a", author: OUTSIDER, viewer: OUTSIDER }).reason, "NO_SUCH_HOME");
  assert.equal(MACHINE, "class:daemon");
});
