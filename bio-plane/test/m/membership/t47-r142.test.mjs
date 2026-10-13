/* T47 (K3078; MEMBERSHIP #37 J5): R142's three parts, each with its control.
   (1) `handleCheck`'s viewer arm answers a member's own current or earlier handle `taken` (R16, R123; DEC-197).
   (2) C-56.6 `PROJECT_GUARD_UNCHECKED` reads `words.json`'s `refusal.PROJECT_GUARD_UNCHECKED` by key (DEC-198 (7)).
   (3) R61's and R78's "every act" is proven by a census over `membershipOps`' project acts, never a sample. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { world, V } from "./fixture.mjs";
import { Membership, MEMBERSHIP_CHECKS, REFUSAL_WORDS, noSuchProject, notAParticipant }
  from "../../../src/membership/index.mjs";

const wordsJson = async () =>
  JSON.parse(await readFile(new URL("../../../../docs/development/ux-substrate/screens/words.json", import.meta.url), "utf8")).words;

/* ---------------------------------------------------------------- R142 (1) ------------------------------------------ */

test("R142 (1) handleCheck's viewer arm answers a member's own current and earlier handles taken, as to everyone else; control: a handle nobody holds is free to them", async () => {
  const w = await world().group("ann", "bob");
  /* a change made before T46 left ann's earlier handle in the history */
  w.sql.exec(`UPDATE members SET handle='ann-new' WHERE member_id='ann'`);
  w.sql.exec(`INSERT INTO handle_history (member_id, from_handle, to_handle, at) VALUES ('ann','ann','ann-new','2026-10-01T00:00:00.000Z')`);
  for (const [viewer, handle] of [["ann", "ann-new"], ["ann", "ann"], ["bob", "bob"], ["bob", "ann-new"], ["bob", "ann"]]) {
    const r = await w.m.handleCheck({ viewer: V(viewer), handle });
    assert.deepEqual([r.ok, r.state, r.words.key], [true, "taken", "handle.taken"], `${handle} to ${viewer}`);
    assert.notEqual(r.suggestion, handle, "the suggestion is another handle");
    assert.equal((await w.m.handleCheck({ viewer: V(viewer), handle: r.suggestion })).state, "free", "and it is free");
  }
  /* the same answer to the holder and to another member: taken is one answer, never "yours" */
  const own = await w.m.handleCheck({ viewer: V("ann"), handle: "ann-new" });
  const other = await w.m.handleCheck({ viewer: V("bob"), handle: "ann-new" });
  assert.deepEqual(own, other);
  /* through the op, as the control plane routes it */
  assert.equal((await w.ops(`viewer=${encodeURIComponent(V("ann"))}`, { handle: "ann-new" }).handlecheck()).state, "taken");
  /* control: a handle nobody holds or held is free to the same member */
  assert.equal((await w.m.handleCheck({ viewer: V("ann"), handle: "zed" })).state, "free");
});

/* ---------------------------------------------------------------- R142 (2) ------------------------------------------ */

test("R142 (2) R128 PROJECT_GUARD_UNCHECKED (C-56.6) reads words.json's refusal.PROJECT_GUARD_UNCHECKED by key, and the refusal minted carries it; control: the draft it replaced is not it", async () => {
  const words = await wordsJson();
  const entry = words.find((x) => x.key === "refusal.PROJECT_GUARD_UNCHECKED");
  assert.ok(entry, "the key exists in words.json");
  assert.equal(REFUSAL_WORDS["refusal.PROJECT_GUARD_UNCHECKED"], entry.en, "held verbatim");
  assert.ok(Object.isFrozen(REFUSAL_WORDS));
  const row = MEMBERSHIP_CHECKS.PROJECT_GUARD_UNCHECKED;
  assert.deepEqual([row.check, row.translation], ["C-56.6", entry.en]);
  assert.ok(row.translation.includes("Your group's Civicsmith"), "R112's name");
  /* the refusal an act mints when the guard cannot answer */
  const w = await world().group("ann", "bob");
  w.project("PROJ-G");
  w.m.projectClaimOwner({ projectId: "PROJ-G", memberId: "ann" });
  assert.equal(w.m.registerProjectActGuard("project-roster", () => { throw new Error("down"); }).ok, true);
  const r = w.m.projectInvite({ projectId: "PROJ-G", handle: "bob", by: "ann", viewer: V("ann") });
  assert.deepEqual([r.code, r.check, r.translation], ["PROJECT_GUARD_UNCHECKED", "C-56.6", entry.en]);
  /* control: MEMBERSHIP #34's draft, which R128 kept until the word conformed, is no longer the row's */
  const draft = "Whether this project's own rules allow that could not be checked, so nothing was changed. Try again in a moment.";
  assert.notEqual(row.translation, draft);
});

/* ---------------------------------------------------------------- R142 (3) ------------------------------------------ */

/* Every op of `membershipOps` that names a project, with the answer its requirement gives a caller who cannot see the
   project (R61): an id naming nothing and a hidden project the caller is outside of answer byte for byte alike, and
   each is the requirement's own answer. `projectclaimowner` (R31) takes no viewer: it is the internal call a creation
   makes (R71's), so only its absent answer is the caller's (R78). */
const ACTS = {
  projectinvite: { ask: (id) => `projectId=${id}&handle=bob&by=cal`, want: (id) => noSuchProject(id) },                 // R32, R78
  projectvisibilityset: { ask: (id) => `projectId=${id}&setting=hidden&by=cal`, want: (id) => noSuchProject(id) },      // R45, R78
  projectjoin: { ask: (id) => `projectId=${id}&by=cal`,
    want: () => ({ ok: false, reason: "NOT_INVITED",
                   detail: "a member joins a project they were invited to. Being uninvited is not a refusal you can see." }) }, // R34
  projectleave: { ask: (id) => `projectId=${id}&by=cal`, want: (id) => notAParticipant(id, "cal") },                     // R35, R87
  projectremove: { ask: (id) => `projectId=${id}&handle=bob&by=cal`, want: () => ({ ok: false, reason: "NOT_THE_OWNER",
    detail: "only an owner of this project removes a participant from it. This REVERSES the earlier rule, under which an "
          + "administrator removed and an owner could not." }) },                                                        // R36
  projectownerarith: { ask: (id) => `projectId=${id}`, want: (id) => ({ ok: true,
    table: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => Membership.ownerMath(n)), live: Membership.ownerMath(0), projectId: id }) }, // R38
  projectclaimowner: { internal: true, body: (id) => ({ projectId: id, memberId: "cal" }), want: (id) => noSuchProject(id) }, // R31
};

async function censusWorld() {
  const w = await world().group("ann", "bob", "cal");
  for (const [id, title] of [["PROJ-H", "Hidden H"], ["PROJ-D", "Discoverable D"]]) {
    w.project(id, title);
    w.m.projectClaimOwner({ projectId: id, memberId: "ann" });
    w.m.projectInvite({ projectId: id, handle: "bob", by: "ann", viewer: V("ann") });
  }
  w.m.projectVisibilitySet({ projectId: "PROJ-D", setting: "discoverable", by: "ann", viewer: V("ann") });
  return w;
}
const run = async (w, op, id, viewer = V("cal")) => {
  const a = ACTS[op];
  return a.internal ? w.ops("", a.body(id))[op]()
    : w.ops(`${a.ask(id)}&viewer=${encodeURIComponent(viewer)}`)[op]();
};
const asAbsent = (answer, id) => JSON.parse(JSON.stringify(answer).split(id).join("PROJ-NEVER"));

test("R142 (3) R61 R78 census: every project act membershipOps routes answers a project the caller cannot see byte for byte as an id that names nothing, each its requirement's own answer; control: a table missing an op, and an answer that differs, are caught", async () => {
  const w = await censusWorld();
  /* the census: the ops that name a project are exactly the table's, so a new one cannot escape it */
  const projectOps = (ops) => Object.keys(ops).filter((k) => /^project/.test(k)).sort();
  assert.deepEqual(projectOps(w.ops("")), Object.keys(ACTS).sort());
  for (const op of Object.keys(ACTS)) {
    const absent = await run(w, op, "PROJ-NEVER");
    assert.deepEqual(absent, ACTS[op].want("PROJ-NEVER"), `${op} on an id naming nothing`);
    if (ACTS[op].internal) continue;
    for (const viewer of [V("cal"), "junk"]) {
      const hidden = await run(w, op, "PROJ-H", viewer);
      assert.deepEqual(hidden, ACTS[op].want("PROJ-H"), `${op} on a hidden project, ${viewer}`);
      assert.deepEqual(asAbsent(hidden, "PROJ-H"), absent, `${op}: hidden reads as absent, ${viewer}`);
    }
  }
  /* control: a census that left an op out is refused */
  const { projectjoin, ...short } = ACTS;
  assert.notDeepEqual(projectOps(w.ops("")), Object.keys(short).sort());
  /* control: the comparison catches an answer that differs: at a discoverable project the caller is at EXISTENCE
     (R77's C-70.1), which is not the absent answer */
  const existence = await run(w, "projectinvite", "PROJ-D");
  assert.equal(existence.code, "PROJECT_SEEN_NOT_A_PARTICIPANT");
  assert.notDeepEqual(asAbsent(existence, "PROJ-D"), await run(w, "projectinvite", "PROJ-NEVER"));
  /* control: a participant (bob, invited) is answered by position, not as absent */
  assert.notDeepEqual(asAbsent(await run(w, "projectinvite", "PROJ-H", V("bob")), "PROJ-H"),
    await run(w, "projectinvite", "PROJ-NEVER", V("bob")));
});
