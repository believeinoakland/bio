/* R19: every act naming a project the caller cannot see answers byte for byte as an id that names nothing, and sight is
   asked before position; the existence answer (membership R77) comes first. Moved from membership's `sight.test.mjs`
   (its R44's list and R61) and `no-such-project.test.mjs` (R78 at this module's acts), renamed (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { noSuchProject } from "../../../src/membership/index.mjs";

/* H hidden, D discoverable, both owned by ann; bob invited to H; cal outside both */
async function sightWorld() {
  const w = await world().group("ann", "bob", "cal");
  w.project("PROJ-H", "Hidden H");
  w.project("PROJ-D", "Discoverable D");
  for (const p of ["PROJ-H", "PROJ-D"]) w.m.projectClaimOwner({ projectId: p, memberId: "ann" });
  w.m.projectInvite({ projectId: "PROJ-H", handle: "bob", by: "ann", viewer: V("ann") });
  w.m.projectVisibilitySet({ projectId: "PROJ-D", setting: "discoverable", by: "ann", viewer: V("ann") });
  return w;
}
const acts = (w, projectId, by = "cal", viewer = V("cal")) => ({
  projectOwnerAdd: w.r.projectOwnerAdd({ projectId, handle: "bob", by, viewer }),
  projectOwnerRemove: w.r.projectOwnerRemove({ projectId, handle: "ann", by, reason: "r", viewer }),
  projectOwnerRescue: w.r.projectOwnerRescue({ projectId, handle: "cal", by, reason: "r", viewer }),
  projectVisibility: w.r.projectVisibility({ projectId, viewer }),
  projectRequest: w.r.projectRequest({ projectId, by, viewer }),
  projectRequestAnswer: w.r.projectRequestAnswer({ projectId, handle: "cal", answer: "grant", by, viewer }),
  projectRequests: w.r.projectRequests({ projectId, by, viewer }),
  projectParticipants: w.r.projectParticipants({ projectId, by }),
});

test("R19 every act naming a project the caller cannot see answers byte for byte as an id that names nothing (membership R78), and an outsider never learns a position", async () => {
  const w = await sightWorld();
  for (const id of ["PROJ-NEVER", "PROJ-H"])
    for (const [name, got] of Object.entries(acts(w, id))) assert.deepEqual(got, noSuchProject(id), `${name} ${id}`);
  const as = (id) => Object.values(acts(w, id)).map((x) => JSON.stringify(x).replaceAll(id, "<id>"));
  assert.deepEqual(as("PROJ-H"), as("PROJ-NEVER"));
  for (const a of as("PROJ-H")) assert.doesNotMatch(a, /NOT_THE_OWNER|NOT_AN_ADMIN|NOT_VISIBLE|ANSWER_NOT_THE_OWNER/);
  /* an unrecognised viewer sees nothing, and is answered the same (the request and the roster ask who asks first) */
  for (const [name, got] of Object.entries(acts(w, "PROJ-H", "cal", "junk")))
    if (name !== "projectRequest" && name !== "projectParticipants")
      assert.deepEqual(got, noSuchProject("PROJ-H"), `${name} junk viewer`);
  /* sight before position at a project the caller does see: the positional refusal is said only then */
  assert.equal(w.r.projectOwnerAdd({ projectId: "PROJ-H", handle: "ann", by: "bob", viewer: V("bob") }).reason, "NOT_THE_OWNER");
  assert.equal(w.r.projectOwnerRescue({ projectId: "PROJ-H", handle: "bob", by: "bob", reason: "r", viewer: V("bob") }).reason,
    "NOT_AN_ADMIN");
  /* an act with no viewer sent is an internal caller: not asked (the roster acts' rule) */
  assert.equal(w.r.projectOwnerAdd({ projectId: "PROJ-H", handle: "bob", by: "cal" }).reason, "NOT_THE_OWNER");
  /* through the ops too */
  assert.deepEqual(w.ops(`projectId=PROJ-H&handle=bob&by=cal&viewer=${encodeURIComponent(V("cal"))}`).projectowneradd(),
    noSuchProject("PROJ-H"));
});

test("R19 at EXISTENCE every act naming the project answers membership's existence refusal (C-70.1), before any other check; the request alone is open", async () => {
  const w = await sightWorld();
  const ex = w.m.existenceAct("PROJ-D", V("cal"));
  assert.deepEqual([ex.reason, ex.check, ex.project, ex.name], ["PROJECT_SEEN_NOT_A_PARTICIPANT", "C-70.1", "PROJ-D", "Discoverable D"]);
  for (const [name, got] of Object.entries(acts(w, "PROJ-D"))) {
    if (name === "projectRequest") { assert.equal(got.ok, true, "asking to join is the one act open at EXISTENCE"); continue; }
    if (name === "projectParticipants") { assert.deepEqual(got, noSuchProject("PROJ-D"), "a read inside it: absent"); continue; }
    if (name === "projectVisibility") { assert.deepEqual(got, noSuchProject("PROJ-D"), "a read inside it: absent"); continue; }
    assert.deepEqual(got, ex, name);
  }
  /* FULL is never EXISTENCE: the owner and the invited reach their positional answers */
  assert.equal(w.r.projectOwnerAdd({ projectId: "PROJ-D", handle: "zed", by: "ann", viewer: V("ann") }).reason, "NO_SUCH_HANDLE");
});
