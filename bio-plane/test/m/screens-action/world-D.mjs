/* screens-action's plan screens over `store-request`'s world (group D): the questions a project draws on, and the plans it opens, are the
   acts that make them (`promote` of an inquiry, `drawquestion`, `planopen`, `planpause`, `planclose`); every id a test asserts is read back
   from the world's own answers. Import "./world.mjs" before "./page.mjs" (this file does). */
import { actionWorld, openIn } from "./world.mjs";

export { actionWorld, openIn };

const stamp = (now) => now.replace(/[-:]/g, "");

/** A question `me` asks in `project`: the inquiry promoted, then the project draws on it. Answers its id. */
export async function question(world, me, project, title = "Is closed the same as repaired?") {
  const now = new Date(world.now()).toISOString().replace(/\.\d{3}Z$/, "Z");
  const { id: base } = await me.read("allocid", { query: { prefix: "INQ", year: now.slice(0, 4) } });
  const id = base + "-" + title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40).replace(/-+$/, "");
  const text = ["---", "id: " + id, "object_type: inquiry", "schema: inquiry@1", "title: " + JSON.stringify(title), "current_state: open", "prior_state: null",
    "created: " + now, "last_updated: " + now, "project: " + project, "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []",
    "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", "surfaced_by: human",
    "---", "", "## Question", "", title, "", "## Session Log", "", "## Review Notes", ""].join("\n");
  await me.act("promote", { body: { bundleId: id, base: null, snapKey: stamp(now) + "_" + base.slice(-4).padStart(8, "0"),
    meta: { object_type: "inquiry", title, current_state: "open", created: now, last_updated: now }, files: [{ path: "bundle.md", text }] } });
  await me.act("drawquestion", { query: { project, inquiry: id, note: "for the plan" } });
  return id;
}

/** A question `me` draws on in `project` that the record gives no title (its question text is empty). Answers its id. */
export async function untitledQuestion(world, me, project) {
  const now = new Date(world.now()).toISOString().replace(/\.\d{3}Z$/, "Z");
  const { id } = await me.read("allocid", { query: { prefix: "INQ", year: now.slice(0, 4) } });
  const text = ["---", "id: " + id, "object_type: inquiry", "schema: inquiry@1", "current_state: open", "prior_state: null", "created: " + now, "last_updated: " + now,
    "project: " + project, "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []", "state_history: []", "annotations_open: 0",
    "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", "surfaced_by: human", "---", "", "## Question", "", "", "## Session Log", "",
    "## Review Notes", ""].join("\n");
  await me.act("promote", { body: { bundleId: id, base: null, snapKey: stamp(now) + "_" + id.slice(-4).padStart(8, "0"),
    meta: { object_type: "inquiry", current_state: "open", created: now, last_updated: now }, files: [{ path: "bundle.md", text }] } });
  await me.act("drawquestion", { query: { project, inquiry: id, note: "for the plan" } });
  return id;
}

/** `me` opens a plan titled `title` in `project` about `inquiry`. Answers the plan's id. */
export async function planOn(me, project, inquiry, title) {
  const r = await me.act("planopen", { query: { project, title }, body: { subjects: [{ kind: "inquiry", inquiry }] } });
  return r.id;
}

const MINUTE = 60000;

/** A colleague `handle`: signed in, invited to `project` by `me` and joined. Answers her signed-in member. */
export async function colleague(world, me, project, handle) {
  const her = await world.signIn(handle);
  await me.act("projectinvite", { query: { projectId: project, handle } });
  await her.act("projectjoin", { query: { projectId: project } });
  return her;
}

/** A plan `who` (default `me`) opens in `project` about a question of its own, then `state`: "open", "paused" or "closed", on the world's
 *  clock `minutes` minutes after the last (a session idle for 30 locks). Answers the plan's row as `plans` reads it. */
export async function planIn(world, me, project, title, { state = "open", who = me, minutes = 1 } = {}) {
  await world.tick(minutes * MINUTE);
  /* `action-plans` stamps a plan's `opened_at` from the wall clock to the second, not from the world's pinned one: wait for a second no plan of the project has */
  const last = (await me.read("plans", { query: { project } })).items.reduce((m, x) => (x.opened_at > m ? x.opened_at : m), "");
  while (new Date().toISOString().replace(/\.\d{3}Z$/, "Z") <= last) await new Promise((r) => setTimeout(r, 50));
  const id = await planOn(who, project, await question(world, me, project, "Question for " + title), title);
  if (state === "paused") await who.act("planpause", { query: { id }, body: { reason: "waiting on the clerk", look_again: "2027-01-01" } });
  if (state === "closed") await who.act("planclose", { query: { id }, body: { reason: "it is done" } });
  return (await me.read("plans", { query: { project } })).items.find((x) => x.id === id);
}

/** An option `me` adds to `plan` (about `inquiry`): a legal one with a regulated date unless told otherwise. Answers its id, as the plan lists it. */
export async function optionOn(me, plan, inquiry, { summary = "Public comment", category = "legal", dates = [{ date: "2026-11-30", basis: "the law" }] } = {}) {
  const made = await me.act("optionadd", { query: { plan }, body: { summary, category, subjects: [`inquiry:${inquiry}`], dates } });
  return made.option;
}

/** The owner's own sentence for a refusal: `me` makes the act again with `body` (it must refuse, as it did through the page) and the start of
 *  the `translation` the door answers is returned (the door's error text is cut, so 60 characters), the sentence the screen must not draw in the owner's words. */
export async function refusalSentence(me, op, body) {
  try { await me.act(op, { body }); } catch (e) { const m = /"translation":"((?:[^"\\]|\\.)*)/.exec(String(e.message)); return m ? m[1].slice(0, 60) : ""; }
  throw new Error(`${op} was not refused`);
}
