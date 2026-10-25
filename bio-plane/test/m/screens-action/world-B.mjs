/* screens-action's group-B tests over `store-request`'s world (K5148; op-tables §5.3): the clocks, the queue and the dashboard. What a test's table
   scripted becomes the acts that make it: the team's profile is active (so an action's day is judged in its zone), an action holds the clock
   entries its document states, a reminder is `reminderset`; the ids a test asserts are read back from the world's own answers. */
import { inWorld, actionDoc, correspond } from "./world.mjs";

export * from "./world.mjs";

/** The clock entries of an action's document: `[date, text]` pairs, each pending. */
export const clockLines = (entries) => ["clock:", ...entries.flatMap(([date, text]) => [`  - text: "${text}"`, '    description: "the records law"', `    date: ${date}`, '    basis: "ten days from receipt"', "    status: pending"])];

/** A fresh world with `handle` signed in, the Oakland profile active (an action's zone is then held, and a reminder's day can come), a project she
 *  starts and an action in it that states `clock` (`[date, text]` pairs), sent when `sent`. Answers `{world, me, project, action}`. */
export async function clockWorld({ handle = "olive", title = "Stormwater", clock = [["2026-10-12", "Response due"], ["2099-10-26", "Extension ends"]], sent = true } = {}) {
  const { world, me } = await inWorld({ handle });
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const project = await world.recipes.project(me, title);
  const made = await me.act("actioncreate", { body: { document: actionDoc(project, { extra: clockLines(clock) }), project } });
  if (sent) await correspond(me, made.id, "sent", { at: "2026-10-02" });
  return { world, me, project, action: made.id };
}

const stamp = (now) => now.replace(/[-:]/g, "");

/** A question `me` asks in `project`: the inquiry promoted, then the project draws on it. Answers its id. */
async function question(world, me, project, title = "Is closed the same as repaired?") {
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

/** `me` opens a plan in `project` about a question, adds an option, chooses it, sets a scenario whose phase holds a checkpoint; with `start`, starts the
 *  option as a records request (the plan's option then names the action it made). Answers `{plan, option, action}` (`action` null unless started). */
export async function plannedIn(world, me, project, { start = true, summary = "Write to the clerk" } = {}) {
  const inquiry = await question(world, me, project);
  const plan = (await me.act("planopen", { query: { project, title: "What we do" }, body: { subjects: [{ kind: "inquiry", inquiry }] } })).id;
  const added = await me.act("optionadd", { query: { plan }, body: { summary, category: "legal", subjects: [`inquiry:${inquiry}`], dates: [{ date: "2026-11-30", basis: "the law" }] } });
  const option = added.id ?? added.option;
  await me.act("optiondispose", { query: { plan }, body: { options: [option], disposition: "chosen" } });
  await me.act("scenarioset", { query: { plan, scenario: 1 }, body: { name: "Quick", phases: [{ id: "q", name: "Q", options: [option], starts: "plan_start", checkpoint: { after_days: 3 } }] } });
  const started = start ? await me.act("optionstart", { query: { plan, option, kind: "records_request" } }) : null;
  return { plan, option, action: started ? started.action : null };
}
