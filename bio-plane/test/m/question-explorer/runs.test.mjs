/* question-explorer: the acts an exploring run's work goes through (R3's sight and capture door, R8, R9, R10, R12's
   actual cost, R13). Each with a negative control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, Q, Q2, DOC, DOC2, HDOC, PROJ, HPROJ, ENT, PERSON, PERSON2, CAP, CAP2, HCAP, CALLER } from "./fixture.mjs";
import { EXPLORE_PERSON_CAP, EXPLORE_CHECKS, EXPLORE_PAGES_AT_ONCE } from "../../../src/question-explorer/index.mjs";

test("R3: it reads within its principal's sight: the group's, what every member may see; a project's, its participants'", async () => {
  const w = await world().standard();
  w.project(HPROJ, ["bob"]);
  w.doc(HDOC, HCAP, { project: HPROJ });
  const g = await w.openRun("group");
  assert.equal(w.p.find({ run: g.run, kind: "capture", ref: CAP, bearing: "unclear", how: "a mention", caller: CALLER }).ok, true);
  const hidden = w.p.find({ run: g.run, kind: "capture", ref: HCAP, bearing: "unclear", how: "a mention", caller: CALLER });
  assert.equal(hidden.code, "EXPLORE_FIND_UNKNOWN", "a project's document is not what every member may see");
  /* A project's account sees what its participants see. */
  const w2 = await world().standard();
  w2.project(HPROJ, ["bob"], { owners: ["bob"] });
  w2.doc(HDOC, HCAP, { project: HPROJ });
  w2.draw(Q, HPROJ);
  await w2.setExplore("group", "no");
  const p = await w2.openRun(`project:${HPROJ}`);
  assert.equal(w2.p.find({ run: p.run, kind: "capture", ref: HCAP, bearing: "unclear", how: "a mention", caller: CALLER }).ok, true);
  /* A member's own account explores nothing yet (ai-use R6, D36), so its sight (hers) is reached by no run here. */
});

test("R3: it asks to capture only through capture-requests, each request carrying the step; an address the record does not hold is named to the members R5 reaches, who capture it", async () => {
  const w = await world().standard();
  const o = await w.openRun("group");
  w.held.add("https://example.org/held");
  const ok = w.p.capture({ run: o.run, address: "https://example.org/held", caller: CALLER });
  assert.equal(ok.ok, true);
  const [req] = w.calledAs("captureRequest");
  assert.deepEqual([req.args.run, req.args.target, req.args.step, req.args.address], [o.run, Q, o.step, "https://example.org/held"]);
  assert.equal(w.count("explore_finds"), 0, "a held address is asked, not named");
  /* Negative control: an address the record does not hold is refused there and named to the members here. */
  const not = w.p.capture({ run: o.run, address: "https://elsewhere.example/page", caller: CALLER });
  assert.equal(not.code, "CAPTURE_REQUEST_ADDRESS_NOT_HELD");
  assert.equal(not.named_to_members, true);
  const items = w.p.findsFor({ viewer: "member:alice" }).finds;
  assert.deepEqual(items.map((f) => [f.kind, f.ref]), [["page", "https://elsewhere.example/page"]]);
  assert.equal(w.p.findsFor({ viewer: "member:bob" }).finds.length, 0, "only to the members R5 reaches");
  /* Not a run the caller holds: refused, nothing asked. */
  assert.equal(w.p.capture({ run: o.run, address: "https://example.org/held", caller: "member:alice" }).code, "EXPLORE_NO_RUN");
  assert.equal(w.calledAs("captureRequest").length, 2);
});

test("R8: a run stopped by a limit ends its step set_aside with the reason; only its enabling owner is told; no place is named", async () => {
  const w = await world().standard();
  const o = await w.openRun("group");
  const e = w.p.end({ run: o.run, end: "set_aside", reason: "fetches", bound: "fetches", caller: CALLER });
  assert.deepEqual([e.ok, e.end, e.reason], [true, "set_aside", "fetches"]);
  assert.deepEqual(w.calledAs("stepEnd").map((a) => [a.step, a.end, a.reason]), [[o.step, "set_aside", "fetches"]]);
  assert.equal(w.calledAs("close")[0].bound, "fetches");
  const told = w.p.stopsFor({ viewer: "member:dana" }).stops;
  assert.deepEqual(told.map((s) => [s.key, s.reason]), [[`explore-stopped:${o.run}`, "fetches"]]);
  assert.equal(w.p.stopsFor({ viewer: "member:alice" }).stops.length, 0, "negative control: not the enabling owner");
  for (const s of [...told.map((x) => x.says), ...Object.values(EXPLORE_CHECKS).map((r) => r.translation)])
    assert.doesNotMatch(s, /\b(Oakland|California|county|city of|jurisdiction)\b/i, "no place named");
  /* An ended run answers as it ended; acts under it are refused. */
  assert.equal(w.p.end({ run: o.run, caller: CALLER }).already, true);
  assert.equal(w.p.find({ run: o.run, kind: "capture", ref: CAP, bearing: "unclear", how: "x", caller: CALLER }).code, "EXPLORE_RUN_ENDED");
  /* A normal end: ended, every outcome undetermined (none recorded by the machine). */
  const w2 = await world().standard();
  const o2 = await w2.openRun("group");
  w2.p.end({ run: o2.run, caller: CALLER });
  const [se] = w2.calledAs("stepEnd");
  assert.deepEqual([se.end, se.outcomes, se.reason], ["ended", undefined, undefined]);
  assert.equal(w2.p.stopsFor({ viewer: "member:dana" }).stops.length, 0, "an ended run is no stop");
});

test("R9: a look aimed at a person no member tied to the question is refused EXPLORE_PERSON_NOT_TIED, recorded on the run, and the run goes on; a tied person is looked at", async () => {
  const w = await world().standard();
  w.entity(PERSON, "person");
  w.entity(PERSON2, "person");
  w.entity(ENT, "body");
  w.question(Q, { subject: PERSON, surfacedBy: "human", recipients: ["alice"] });
  const o = await w.openRun("group");
  assert.deepEqual(w.p.look({ run: o.run, entity: PERSON, aim: "search the minutes", caller: CALLER }).person, true, "the subject a member raised");
  const no = w.p.look({ run: o.run, entity: PERSON2, aim: "search a name", caller: CALLER });
  assert.deepEqual([no.ok, no.code, no.goes_on], [false, "EXPLORE_PERSON_NOT_TIED", true]);
  assert.deepEqual(w.p.refusalsOn(o.run).map((r) => [r.code, r.entity]), [["EXPLORE_PERSON_NOT_TIED", PERSON2]]);
  assert.equal(w.p.look({ run: o.run, entity: ENT, caller: CALLER }).ok, true, "not a person: no tie needed");
  assert.equal(w.p.find({ run: o.run, kind: "capture", ref: CAP, bearing: "unclear", how: "x", caller: CALLER }).ok, true, "the run goes on");
  /* A member ties PERSON2 by connecting the question to a document resolving to that person (connections R53). */
  w.resolve(CAP2, DOC2, PERSON2);
  w.asserted[Q] = [{ a_bundle_id: DOC2, b_bundle_id: Q, asserted_by: "member", author: "member:alice" }];
  assert.equal(w.p.look({ run: o.run, entity: PERSON2, caller: CALLER }).person, true);
  /* An entity the registry cannot place is read as a person (fail closed). */
  assert.equal(w.p.look({ run: o.run, entity: "ENT-2026-19999", caller: CALLER }).code, "EXPLORE_PERSON_NOT_TIED");
});

test("R10: an exploring run gathers about at most 20 distinct persons; a look past the cap is refused EXPLORE_PERSON_CAP_REACHED and the run ends its step set_aside with that reason", async () => {
  assert.equal(EXPLORE_PERSON_CAP, 20);
  const w = await world().standard();
  const people = Array.from({ length: 21 }, (_, i) => `ENT-2026-${20000 + i}`);
  for (const [i, p] of people.entries()) { w.entity(p, "person"); w.resolve(sha64(i), DOC2, p); }
  w.asserted[Q] = [{ a_bundle_id: DOC2, b_bundle_id: Q, asserted_by: "member", author: "member:alice" }];
  const o = await w.openRun("group");
  for (const p of people.slice(0, 20)) assert.equal(w.p.look({ run: o.run, entity: p, caller: CALLER }).ok, true);
  assert.equal(w.p.look({ run: o.run, entity: people[3], caller: CALLER }).ok, true, "negative control: a person already gathered about is no new one");
  const past = w.p.look({ run: o.run, entity: people[20], caller: CALLER });
  assert.deepEqual([past.code, past.cap, past.ended.end, past.ended.reason], ["EXPLORE_PERSON_CAP_REACHED", 20, "set_aside", "EXPLORE_PERSON_CAP_REACHED"]);
  assert.deepEqual(w.calledAs("stepEnd").map((a) => [a.end, a.reason]), [["set_aside", "EXPLORE_PERSON_CAP_REACHED"]]);
  assert.equal(w.p.look({ run: o.run, entity: people[0], caller: CALLER }).code, "EXPLORE_RUN_ENDED");
});

const sha64 = (i) => String(i).padStart(64, "0");

test("R12: at its close each run carries ai-runs R76's actual cost, answered to the paying account's owners only", async () => {
  const w = await world().standard();
  w.project(PROJ, ["alice", "bob"], { owners: ["alice"] });
  w.draw(Q, PROJ);
  await w.setExplore("group", "no");
  const o = await w.openRun(`project:${PROJ}`);
  w.p.end({ run: o.run, caller: CALLER });
  assert.deepEqual(w.p.runCost({ run: o.run, viewer: "member:alice" }).actual, { usd: 0.42 });
  assert.equal(w.p.runCost({ run: o.run, viewer: "member:bob" }), null, "a participant, not an owner");
  assert.equal(w.p.runCost({ run: o.run, viewer: "member:dana" }), null, "an administrator, not this account's owner");
});

test("R13: a run reads inside a held document a few pages at a time within its pages bound, never a document under a no-AI material limit; it says how far it read", async () => {
  const w = await world().standard();
  const o = await w.openRun("group");
  const r1 = w.p.read({ run: o.run, bundleId: DOC, pages: 5, caller: CALLER });
  assert.deepEqual([r1.ok, r1.from, r1.through, r1.step], [true, 0, 5, o.step]);
  assert.equal(w.p.read({ run: o.run, bundleId: DOC, pages: EXPLORE_PAGES_AT_ONCE + 1, caller: CALLER }).code, "EXPLORE_PAGES_BOUND", "a few at a time");
  for (let i = 0; i < 7; i++) w.p.read({ run: o.run, bundleId: DOC, pages: 5, caller: CALLER });
  const past = w.p.read({ run: o.run, bundleId: DOC, pages: 1, caller: CALLER });
  assert.deepEqual([past.code, past.read_through, past.allowed], ["EXPLORE_PAGES_BOUND", 40, 40]);
  assert.equal(w.bounds.get(`${o.run}|pages`).consumed, 40, "counted as the plane counts mints");
  /* Negative control: the group keeps its material from `read`: refused, nothing counted. */
  const w2 = await world().standard();
  const o2 = await w2.openRun("group");
  assert.equal(w2.credentials.aiKeepAwaySet({ on: true, uses: ["read"], reason: "a privileged file", by: "member:dana" }).ok, true);
  const kept = w2.p.read({ run: o2.run, bundleId: DOC, pages: 1, caller: CALLER });
  assert.equal(kept.code, "AI_RUN_READ_NO_AI", "run-rules R26's one refusal (checkPagesRead)");
  assert.equal(w2.bounds.get(`${o2.run}|pages`).consumed, 0);
  /* A project's own limit on `explore` keeps its documents away too; on `read`, run-rules R26's refusal. */
  const w3 = await world().standard();
  w3.project(PROJ, ["alice"], { owners: ["alice"] });
  w3.doc(HDOC, HCAP, { project: PROJ });
  w3.draw(Q, PROJ);
  await w3.setExplore("group", "no");
  const o3 = await w3.openRun(`project:${PROJ}`);
  assert.equal(w3.p.read({ run: o3.run, bundleId: HDOC, pages: 1, caller: CALLER }).ok, true);
  assert.equal(w3.credentials.projectAiKeepAwaySet({ project: PROJ, on: true, uses: ["explore"], reason: "kept", by: "member:alice" }).ok, true);
  assert.equal(w3.p.read({ run: o3.run, bundleId: HDOC, pages: 1, caller: CALLER }).code, "EXPLORE_READ_KEPT_AWAY");
  assert.equal(w3.p.read({ run: o3.run, bundleId: DOC, pages: 1, caller: CALLER }).ok, true, "a document outside that project is not kept");
  assert.equal(w3.credentials.projectAiKeepAwaySet({ project: PROJ, on: true, uses: ["read"], reason: "kept", by: "member:alice" }).ok, true);
  assert.equal(w3.p.read({ run: o3.run, bundleId: HDOC, pages: 1, caller: CALLER }).code, "AI_RUN_READ_NO_AI");
});
