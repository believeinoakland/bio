/* screens-action's tests over `store-request`'s world (K5148; op-tables §5.3): the real store, a member really signed in, the page's door.
   What a test's table scripted becomes the acts that make it: an action is `actioncreate` of its document, a reply is `actioncorrespond`
   (a legal-pressure mark is the reply's own `pressure`), pressure outside any action is `pressurerecord`; the ids a test asserts are read
   back from the world's own answers, never copied from a literal. */
import { inWorld, bootAs } from "../interface-shell/world.mjs";
const { SCREENS } = await import("../../../src/screens-action/index.mjs");

export { inWorld };

/** The document of an action `actioncreate` takes: a records request to the Town Clerk of the Town of Port Ellery, in `project`. */
export const actionDoc = (project, { title = "Inspection logs, 2025", kind = "records_request", extra = [] } = {}) => ["---", "object_type: action", `title: ${title}`,
  "current_state: planned", `action_kind: ${kind}`, `project: ${project}`, "counterparty:", "  state: named", "  role: Town Clerk", "  body: Town of Port Ellery", ...extra,
  "---", "", "An action.", ""].join("\n");

/** A fresh world with `handle` signed in, a project she starts and an action in it. Answers `{world, me, project, action}`. */
export async function actionWorld({ handle = "olive", title = "Stormwater", ...o } = {}) {
  const { world, me } = await inWorld({ handle, ...o });
  const project = await world.recipes.project(me, title);
  const made = await me.act("actioncreate", { body: { document: actionDoc(project), project } });
  return { world, me, project, action: made.id };
}

/** `me` records a message sent (`sent`) or received (`received`) in `action`; a legal-pressure mark rides on the reply as its `pressure`. Answers the entry's `ord`. */
export async function correspond(me, action, direction, { at = "2026-09-30", pressure = null, account = direction === "sent" ? "asked" : "answered" } = {}) {
  const r = await me.act("actioncorrespond", { query: { target: action, direction, at, medium: "email", party: "Town Clerk", account }, body: pressure ? { pressure } : {} });
  return r.ord;
}

/** `boot` of the screens as `me` over the world's door; `plane` is the table of ops the test still scripts (none of an earlier module's). */
export const openIn = (world, me, path, plane = {}, options = {}) => bootAs(world, me, { screens: SCREENS, path, plane, ...options });

/** A hidden project the member makes a counsel matter (`promote` with `visibility: "hidden"`, then `projectscopeset`). Answers its bundle id. */
export async function counselMatter(world, me, title = "The rent dispute", reason = "the owner's lawyer wrote to us") {
  const now = new Date(world.now()).toISOString().replace(/\.\d{3}Z$/, "Z");
  const text = "---\nobject_type: project\ntitle: " + JSON.stringify(title) + "\nobjective: " + JSON.stringify(title) + "\ncurrent_state: forming\ncreated: \"" + now
    + "\"\nlast_updated: \"" + now + "\"\n---\n\n## Session Log\n\n### Session " + now + " | Formation | interactive\nTrigger: test\nChanges: created.\n";
  const made = await me.act("promote", { body: { base: null, snapKey: now.replace(/[-:]/g, "") + "_" + title.replace(/[^a-z]/gi, "").slice(0, 8).toLowerCase(),
    meta: { object_type: "project", title, current_state: "forming", created: now, last_updated: now }, files: [{ path: "bundle.md", text }], register: [], visibility: "hidden" } });
  await me.act("projectscopeset", { query: { projectId: made.bundleId, scope: "counsel_matter", reason } });
  return made.bundleId;
}
