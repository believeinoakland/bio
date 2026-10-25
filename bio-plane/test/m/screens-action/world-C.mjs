/* screens-action's request / send / new-action screens over `store-request`'s world (group C): the questions a project draws on, the offices
   the record holds, the filings an action has prepared, approved and sent, and the refusals the owners give are the acts and states that make
   them; every id a test asserts is read back from the world's own answers. Import this file before "./page.mjs" (it imports "./world.mjs"). */
import { actionWorld, openIn, correspond } from "./world.mjs";

export { actionWorld, openIn, correspond };

const stamp = (now) => now.replace(/[-:]/g, "");
const instant = (world) => new Date(world.now()).toISOString().replace(/\.\d{3}Z$/, "Z");

/** `actionWorld` with the Oakland and Alameda profile active, so the kinds a profile defines (`grand_jury`, `media`, `public_comment`) are the vocabulary's. */
export async function profiledWorld(o = {}) {
  const w = await actionWorld(o);
  await w.world.recipes.profiles(w.me, ["oakland-alameda"]);
  return w;
}

/** A question `me` asks in `project`: the inquiry promoted, then the project draws on it. Answers its id. */
export async function question(world, me, project, title = "Is closed the same as repaired?") {
  const now = instant(world);
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

/** An entity `me` registers (`entitycreate`). Answers its id. */
export async function entityOf(me, kind, label) {
  return (await me.act("entitycreate", { body: { kind, label, note: "registered by the test", reason: "x" } })).entity_id;
}

/** The office `role` in the body `body`, held as custodian of `subject` by lines `me` records (`post_in`, `custodian_of`, each on her own word).
 *  Answers the office's entity id. */
export async function officeFor(me, subject, role, body) {
  const office = await entityOf(me, "office", role), bodyId = await entityOf(me, "body", body);
  const valid = { from: "2000-01-01", to: "2099-12-31", precision: "day", zone: "UTC" }, basis = { statement: "the office keeps these records" };
  await me.act("recordline", { body: { kind: "post_in", from: office, to: bodyId, basis, valid } });
  await me.act("recordline", { body: { kind: "custodian_of", from: office, to: subject, basis, valid } });
  return office;
}

/** The plane answer for `addresseesuggest` asked about a question: the owner's own answer for `entity`, the subject the record holds the offices
 *  for (the owner suggests offices for an entity or a record whose captures resolve to one; an inquiry holds no capture, so none could be made). */
export const suggestingFor = (world, me, entity) => (req) => world.boot(me).door({ ...req, url: req.url.replace(/subject=[^&]*/, "subject=" + encodeURIComponent(entity)) });

/** `op` as the owner answers it for `me`, whatever it answers: `{status, result}` (a refusal is read, not thrown). */
export async function answerOf(world, me, op, { query = {}, body } = {}) {
  const a = await world.door({ url: `/api/?${new URLSearchParams({ op, ...query })}`, init: body === undefined ? { method: "GET" }
    : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } }, me);
  return { status: a.status, result: a.json && a.json.result !== undefined ? a.json.result : a.json };
}

/** The actions `me` may see, in the store's own order. */
export async function actionsOf(me) {
  return (await me.read("actions", { query: {} })).items;
}

/** `me` prepares a communication in `action` (`communicationprepare`) and, with `approve`, approves it (`filingapprove`) and with `sent` records
 *  its sending (`filingrecordsent`). Answers the filing's id. */
export async function filingIn(me, action, { text = "We request the inspection logs.", approve = false, sent = false, at = "2026-10-10" } = {}) {
  const made = await me.act("communicationprepare", { body: { action, purpose: "request", text, language: "en" } });
  if (approve || sent) await me.act("filingapprove", { body: { filing: made.id } });
  if (sent) await me.act("filingrecordsent", { body: { filing: made.id, at, account: "on the portal", reference: "26-0001" } });
  return made.id;
}
