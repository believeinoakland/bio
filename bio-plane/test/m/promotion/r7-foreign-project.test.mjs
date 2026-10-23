/* Fix round 7, G74 (BOB's decision, P17, from Bob's K4557): a member may file a document into a project only when she is
   its member or invited to it. `promote` refuses any other filer at the door with membership's one NOT_A_PARTICIPANT
   (its R87), whose served sentence holds the remedy, and writes nothing. R53 is the rule it fences (the project a document
   states); these tests name it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { makePromotion, doc, infoDoc, create, T0 } from "./fixtures.mjs";
import { localize } from "../../../src/setup-words/index.mjs";

function projectEnv() {
  const env = makePromotion();
  const made = env.p.promote({ base: null, snapKey: "p", author: "member:ann", ownerMemberId: "ann", meta: {},
    files: [{ path: "bundle.md", text: doc({ object_type: "project", title: "Sewer Fund", current_state: "forming",
      created: T0, last_updated: T0 }) }] });
  assert.equal(made.ok, true, JSON.stringify(made));
  env.membership.joined.set(made.bundleId, ["bob"]);
  env.membership.invited.set(made.bundleId, ["cid"]);
  return { ...env, project: made.bundleId };
}
const filing = (project, id, who, extra = {}) =>
  create(id, infoDoc(id, { project }), { actorMemberId: who, actorIdentity: `member:${who}`, actorViewer: `member:${who}`,
                                         author: `member:${who}`, ...extra });

test("R53 G74: a member who is neither in the project nor invited to it is refused PROMOTE_NOT_A_PARTICIPANT and nothing is written", () => {
  const { p, record, membership, project } = projectEnv();
  membership.hidden.add(project);
  membership.discoverable.add(project);
  const before = record.dump();
  const refused = p.promote(filing(project, "INFO-2026-0001", "dee"));
  assert.equal(refused.ok, false);
  assert.equal(refused.reason, "PROMOTE_NOT_A_PARTICIPANT");
  assert.equal(refused.act, "promote");
  /* the sentence names the project by its name, never its id (UX-DESIGN's row refusal.PROMOTE_NOT_A_PARTICIPANT) */
  assert.match(refused.detail, /Sewer Fund/);
  assert.ok(!refused.detail.includes(project));
  assert.equal(record.dump(), before, "no bundle, manifest entry, history or file was written");
  assert.equal(record.bundleInfo("INFO-2026-0001"), null);
});

test("R53 G74: the refusal's sentence is the keyed row's and states the condition and the remedy", () => {
  const { p, project } = projectEnv();
  const r = p.promote(filing(project, "INFO-2026-0011", "dee"));
  assert.equal(r.detail, localize("refusal.PROMOTE_NOT_A_PARTICIPANT", "Only the members of {project}, and those invited to it, can file documents into it. Nothing was filed. Ask an owner of the project to invite you, or file it into a project you are in.", { project: "Sewer Fund" }));
  assert.match(r.detail, /Nothing was filed\./);
  assert.match(r.detail, /invite you/);
});

test("R53 G74 control: a joined member files into the project", () => {
  const { p, project } = projectEnv();
  const r = p.promote(filing(project, "INFO-2026-0002", "bob"));
  assert.equal(r.ok, true, JSON.stringify(r));
});

test("R53 G74 control: the project's owner files into it", () => {
  const { p, project } = projectEnv();
  const r = p.promote(filing(project, "INFO-2026-0003", "ann"));
  assert.equal(r.ok, true, JSON.stringify(r));
});

test("R53 G74 control: an invited member who has not joined files into it (gathering stays open, K4557)", () => {
  const { p, project } = projectEnv();
  const r = p.promote(filing(project, "INFO-2026-0004", "cid"));
  assert.equal(r.ok, true, JSON.stringify(r));
});

test("R53 G74 control: a document naming no project, a machine credential and a replay are not asked", () => {
  const { p, project } = projectEnv();
  const none = p.promote(create("INFO-2026-0005", infoDoc("INFO-2026-0005"), { actorMemberId: "dee", actorIdentity: "member:dee" }));
  assert.equal(none.ok, true, JSON.stringify(none));
  const machine = p.promote(create("INFO-2026-0006", infoDoc("INFO-2026-0006", { project }),
    { actorIdentity: "token:capture", actorViewer: "token:capture", author: "token:capture" }));
  assert.equal(machine.ok, true, JSON.stringify(machine));
  const replay = p.promote(filing(project, "INFO-2026-0007", "dee", { replay: true }));
  assert.equal(replay.ok, true, JSON.stringify(replay));
});

test("R53 G74: a revision that moves a document into a project she is not in is refused too, and a project naming itself is not asked", () => {
  const { p, project } = projectEnv();
  const made = p.promote(create("INFO-2026-0008", infoDoc("INFO-2026-0008"), { actorMemberId: "dee", actorIdentity: "member:dee",
    actorViewer: "member:dee" }));
  assert.equal(made.ok, true);
  const moved = p.promote({ bundleId: "INFO-2026-0008", base: made.bundleSha, snapKey: "k2", author: "member:dee",
    actorMemberId: "dee", actorIdentity: "member:dee", actorViewer: "member:dee", meta: {},
    files: [{ path: "bundle.md", text: infoDoc("INFO-2026-0008", { project }) }] });
  assert.equal(moved.reason, "PROMOTE_NOT_A_PARTICIPANT");
});

test("R53 G74: a project that does not exist is refused alike, so the refusal tells a stranger nothing about which projects exist", () => {
  const { p, project } = projectEnv();
  const absent = p.promote(filing("PROJ-2026-9999-none", "INFO-2026-0009", "dee"));
  const foreign = p.promote(filing(project, "INFO-2026-0010", "dee"));
  assert.equal(absent.reason, "PROMOTE_NOT_A_PARTICIPANT");
  assert.deepEqual([absent.ok, absent.code, absent.act], [foreign.ok, foreign.code, foreign.act]);
});
