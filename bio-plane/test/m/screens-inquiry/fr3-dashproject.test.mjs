/* screens-inquiry fix round 3 (T51), `dash-project`: C66 (R79: the queue is asked within the door's bound), C94 (members named by handle,
 * never by id). On interface-shell's served page over a scripted plane; every expectation is a word read by key (R44). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { word } from "../../../src/setup-words/index.mjs";
import { COMMON } from "../../../src/screens-inquiry/common.mjs";
import { dashProjectScreen } from "../../../src/screens-inquiry/dashproject.mjs";
import { boot, ok, refused } from "../interface-shell/harness.mjs";
import { batchStrength } from "./fixtures.mjs";

const P = "PROJ-2026-0007";
const Q1 = "INQ-2026-0001-seven-days";
const DOC = "INFO-2026-0004";
const SCREEN = dashProjectScreen(COMMON);
const projectMd = ["---", `id: ${P}`, "object_type: project", "title: \"Pothole repairs\"", "objective: \"Is the city repairing reported potholes?\"", "references: []", "---", ""].join("\n");
const docMd = ["---", `id: ${DOC}`, "object_type: information", "title: \"The 2024 lease amendment\"", "---", ""].join("\n");
const NOTICE = { id: "FINDING::newer-capture-affects-reference::N1", class: "FINDING", kind: "newer-capture-affects-reference",
  case: { ancestors: [{ id: Q1, depth: 0 }, { id: P, depth: 1 }] }, subject: { kind: "notice", id: "N1", holder: Q1, target: DOC } };
const ROSTER = ok({ ok: true, members: [{ member_id: "admin", handle: "sparky", founder: true }, { member_id: "u-7", handle: "rosa" }] });

function plane(o = {}) {
  return {
    projectstage: ok({ ok: true, project: P, stage: "investigating", questions: { read: 1, with_legs: 1, concluded: 0 } }),
    image: (r) => ok(r.query.id === P ? { "bundle.md": projectMd } : r.query.id === DOC ? { "bundle.md": docMd } : null),
    projectparticipants: ok({ ok: true, projectId: P, participants: [{ handle: "mai", state: "joined", owner: 1 }, { member: "u-7", state: "joined", owner: 0 }] }),
    strengthbarof: ok({ ok: true, project: P, bar: { declared: true, source: "project", capture: "B", connection: "B" } }),
    projectquestions: ok({ ok: true, project: P, items: [{ inquiry: Q1, title: "Seven days?" }], cursor: null }),
    inquirystrength: batchStrength(() => ({ ok: true, capture: { state: "graded", grade: "A" }, connection: { state: "graded", grade: "B" } })),
    queue: ok({ ok: true, items: [NOTICE] }),
    heldcaptures: ok({ ok: true, held: [] }),
    casedrafts: ok({ ok: true, drafts: [] }),
    timeline: ok({ ok: true, world: { items: [], placed_nowhere: [] }, ours: { sources: [] } }),
    projectlist: ok({ ok: true, projects: [{ id: P, name: "Pothole repairs", stage: "investigating", members: [{ member: "u-7" }, { member: "f", handle: null, founder: true }],
      activity: [1, 2, 0, 1, 3, 1, 1, 6], lastChange: "2026-10-08T09:00:00Z" }], count: 1, truncated: false, next: null }),
    projectdirectory: ok({ ok: true, projects: [] }),
    memberlist: ROSTER,
    ...o,
  };
}
const at = "/app/dash-project/" + P;
const open = async (o = {}) => { const p = await boot({ screens: [SCREEN], plane: plane(o), path: at }); await p.settle(); return p; };
const main = (p) => p.doc.getElementById("cs-main");
const said = (el, key, vars) => String(el && el.textContent || "").includes(word(key, vars || {}));

/* The queue door clamps `limit` to 1..500 (queue R6) and the default is 200; the walk saw the page's `limit=500` answered 400, and the plan caps
   the ask at 200. */
const DOOR_BOUND = 200;

test("R79 C66 the queue is asked within the door's bound (never 500), and the dashboard still draws its next step from it; control: a queue holding no such notice draws no such step", async () => {
  const p = await open();
  /* the shell's own frame read (`queue` with `background`, for its counts) is the shell's; this is the screen's */
  const asks = p.byOp("queue").filter((r) => !r.query.background);
  assert.ok(asks.length >= 1, "the queue is read");
  for (const r of asks) assert.ok(r.query.limit === undefined || Number(r.query.limit) <= DOOR_BOUND, "limit " + r.query.limit + " is within " + DOOR_BOUND);
  assert.ok(said(main(p), "screen.dash-project.next.newer", { document: "The 2024 lease amendment" }), "the next step still comes from the queue");
  const none = await open({ queue: ok({ ok: true, items: [] }) });
  assert.ok(!said(main(none), "screen.dash-project.next.newer", { document: "The 2024 lease amendment" }), "control: no notice, no step");
});

test("R79 R40 C94 the dashboard names members by handle, never by id: an owner or a member the roster gives by id, the founder's id; control: an id no roster holds is the plain word", async () => {
  const p = await open();
  await p.settle();
  const glance = main(p).textContent;
  assert.ok(glance.includes("rosa"), "a member given by id is drawn by her handle");
  assert.doesNotMatch(glance, /\bu-7\b|\badmin\b/, "never the id");
  /* the project she is not in: its owners, as the existence answer names them */
  const seen = (owners) => open({ projectstage: refused("PROJECT_SEEN_NOT_A_PARTICIPANT", "", 403, { name: "Pothole repairs", owners }),
    projectparticipants: refused("PROJECT_SEEN_NOT_A_PARTICIPANT", "", 403), strengthbarof: refused("PROJECT_SEEN_NOT_A_PARTICIPANT", "", 403),
    projectdirectory: ok({ ok: true, projects: [{ id: P, name: "Pothole repairs" }] }) });
  const known = await seen(["admin", "u-7"]);
  assert.ok(said(main(known), "screen.project.notjoined.owners", { owners: "sparky, rosa" }), "the owners by handle");
  assert.doesNotMatch(main(known).textContent, /\bu-7\b|\badmin\b/);
  const quiet = await open({ memberlist: ok({ ok: true, members: [] }), projectstage: refused("PROJECT_SEEN_NOT_A_PARTICIPANT", "", 403, { name: "Pothole repairs", owners: ["admin", "u-7"] }),
    projectparticipants: refused("PROJECT_SEEN_NOT_A_PARTICIPANT", "", 403), strengthbarof: refused("PROJECT_SEEN_NOT_A_PARTICIPANT", "", 403),
    projectdirectory: ok({ ok: true, projects: [{ id: P, name: "Pothole repairs" }] }) });
  assert.ok(said(main(quiet), "screen.project.notjoined.owners", { owners: word("member.founder.unnamed") + ", " + word("shell.card.member") }), "control: no handle known, the fallback words");
});
