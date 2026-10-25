/* screens-inquiry fix round 3 (T51), `dash-project`: C66 (R79: the queue is asked within the door's bound), C94 (members named by handle,
 * never by id). On interface-shell's served page over the real world (store-request's `storeWorld`, K5054); every expectation is a word read by key (R44). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { word } from "../../../src/setup-words/index.mjs";
import { COMMON } from "../../../src/screens-inquiry/common.mjs";
import { dashProjectScreen } from "../../../src/screens-inquiry/dashproject.mjs";
import { boot, ok, refused } from "../interface-shell/harness.mjs";
import { storeWorld, WORLD_FOUNDER_HANDLE } from "./fixtures.mjs";

const SCREEN = dashProjectScreen(COMMON);
const SCREENS = [SCREEN];
const main = (p) => p.doc.getElementById("cs-main");
const said = (el, key, vars) => String(el && el.textContent || "").includes(word(key, vars || {}));

/** A project of ann's with a document held in it and a question drawn on it, by real acts; the page is booted as `as` (ann unless given) over the world. */
async function state(o = {}) {
  const world = await storeWorld();
  const ann = await world.signIn("ann", { capabilities: ["contribute", "create_projects"] });
  const project = await world.recipes.project(ann, "Pothole repairs");
  const doc = await world.recipes.hold(ann, "The 2024 lease amendment", "The lease was amended in 2024.", project);
  const q = await world.recipes.question(ann, project, { title: "Seven days", text: "Do crews repair each pothole within seven days?", legs: [{ target: doc.bundle, role: "supports" }], draw: true });
  const open = async (as, plane) => {
    const { door, session } = world.boot(as);
    const p = await boot({ screens: SCREENS, door, session, path: "/app/dash-project/" + project, ...(plane ? { plane } : {}) });
    await p.settle();
    return p;
  };
  return { world, ann, project, doc: doc.bundle, question: q.id, open };
}

/* The queue door clamps `limit` to 1..500 (queue R6) and the default is 200; the walk saw the page's `limit=500` answered 400, and the plan caps
   the ask at 200. */
const DOOR_BOUND = 200;

test("R79 C66 the queue is asked within the door's bound (never 500), and the dashboard still draws its next step from it; control: a queue holding no such notice draws no such step", async () => {
  const t = await state();
  /* a newer capture of the cited document: the queue's FINDING, which no act of the door raises by itself (recipes.queue makes obligations only) */
  const notice = { id: "FINDING::newer-capture-affects-reference::N1", class: "FINDING", kind: "newer-capture-affects-reference",
    case: { ancestors: [{ id: t.question, depth: 0 }, { id: t.project, depth: 1 }] }, subject: { kind: "notice", id: "N1", holder: t.question, target: t.doc } };
  const p = await t.open(t.ann, { queue: ok({ ok: true, items: [notice] }) });
  /* the shell's own frame read (`queue` with `background`, for its counts) is the shell's; this is the screen's */
  const asks = p.byOp("queue").filter((r) => !r.query.background);
  assert.ok(asks.length >= 1, "the queue is read");
  for (const r of asks) assert.ok(r.query.limit === undefined || Number(r.query.limit) <= DOOR_BOUND, "limit " + r.query.limit + " is within " + DOOR_BOUND);
  assert.ok(said(main(p), "screen.dash-project.next.newer", { document: "The 2024 lease amendment" }), "the next step still comes from the queue");
  const none = await t.open(t.ann);
  assert.ok(!said(main(none), "screen.dash-project.next.newer", { document: "The 2024 lease amendment" }), "control: no notice, no step");
});

test("R79 R40 C94 the dashboard names members by handle, never by id: an owner or a member the roster gives by id, the founder's id; control: an id no roster holds is the plain word", async () => {
  const world = await storeWorld();
  const founder = await world.signIn(WORLD_FOUNDER_HANDLE);
  const ann = await world.signIn("ann", { capabilities: ["contribute", "create_projects"] });
  const rosa = await world.signIn("rosa", { capabilities: ["contribute"] });
  const bob = await world.signIn("bob", { capabilities: ["contribute"] });
  /* the founder's project, with ann and rosa joined and rosa an owner beside her: the founder's member id is `admin`, her handle is not */
  const project = await world.recipes.project(founder, "Pothole repairs");
  for (const [who, h] of [[ann, "ann"], [rosa, "rosa"]]) {
    await founder.act("projectinvite", { query: { projectId: project, handle: h }, body: {} });
    await who.act("projectjoin", { query: { projectId: project }, body: {} });
  }
  await founder.act("projectowneradd", { query: { projectId: project, handle: "rosa" }, body: {} });
  const open = async (as, plane) => {
    const { door, session } = world.boot(as);
    const p = await boot({ screens: SCREENS, door, session, path: "/app/dash-project/" + project, ...(plane ? { plane } : {}) });
    await p.settle();
    return p;
  };
  const p = await open(ann);
  const glance = main(p).textContent;
  assert.ok(glance.includes("rosa"), "a member given by id is drawn by her handle");
  assert.ok(glance.includes(WORLD_FOUNDER_HANDLE), "the founder, given by her id, is drawn by her handle");
  assert.doesNotMatch(glance, /\badmin\b/, "never the id");
  /* the project she is not in (discoverable, so the real directory lists it): its owners, as the existence answer names them by member id. The real answer
     names owners of a hidden project to an administrator alone, and a hidden project is never listed to her, so the page could not draw them; the one read
     `projectstage` is scripted with the owners as ids (the founder's `admin` among them) */
  const seen = (owners) => ({ projectstage: refused("PROJECT_SEEN_NOT_A_PARTICIPANT", "", 403, { name: "Pothole repairs", owners }) });
  const known = await open(bob, seen(["admin", "rosa"]));
  assert.ok(said(main(known), "screen.project.notjoined.owners", { owners: WORLD_FOUNDER_HANDLE + ", rosa" }), "the owners by handle");
  assert.doesNotMatch(main(known).textContent, /\badmin\b/);
  /* an id no roster holds: the roster read answers no member (the world's roster always holds them, so this one read is scripted) */
  const quiet = await open(bob, { memberlist: ok({ ok: true, members: [] }), ...seen(["admin", "rosa"]) });
  assert.ok(said(main(quiet), "screen.project.notjoined.owners", { owners: word("member.founder.unnamed") + ", " + word("shell.card.member") }), "control: no handle known, the fallback words");
});
