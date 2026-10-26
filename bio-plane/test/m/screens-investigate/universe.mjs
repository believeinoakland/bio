/* screens-investigate's tests: the one world holding something for every screen (each subject made by the member's own real acts), shared by the
 * files that open every screen (common.test.mjs, states-a.test.mjs, states-b.test.mjs); each file builds its own, as each runs in its own process. */
import { createHash } from "node:crypto";
import { refusedIn, silent, pending } from "../interface-shell/harness.mjs";
import { inWorld, openAs, rewrite, readHeld, declareStandard } from "./world.mjs";

export const VARIANTS = { refused: refusedIn("SOME_REFUSAL", "The plane refused this read."), silent, pending };

/* ---- one world holding something for every screen: each subject is made by the member's own real acts; the screens are opened at the ids the world gave ---- */
export const hex = (v) => createHash("sha256").update(v).digest("hex");
export const DOC = { kind: "document" };
export const iso = (world) => new Date(world.now()).toISOString().replace(/\.\d{3}Z$/, "Z");
/** A project (as `recipes.project` starts one) whose document cites `targets`, as a project's document cites the people it follows. */
async function projectCiting(world, me, title, targets) {
  const now = iso(world);
  const refs = ["references:", ...targets.flatMap((t) => [`  - target: ${t}`, "    rel: cites", "    status: active"])];
  const text = ["---", "object_type: project", "title: " + JSON.stringify(title), "objective: " + JSON.stringify(title), "current_state: forming", `created: "${now}"`, `last_updated: "${now}"`,
    ...refs, "---", "", "## Session Log", "", `### Session ${now} | Formation | interactive`, "Trigger: test", "Changes: created.", ""].join("\n");
  const made = await me.act("promote", { body: { base: null, snapKey: now.replace(/[-:]/g, "") + "_" + hex(title).slice(0, 8),
    meta: { object_type: "project", title, current_state: "forming", created: now, last_updated: now }, files: [{ path: "bundle.md", text }], register: [], visibility: "discoverable" } });
  return made.bundleId;
}
export async function universe() {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const ent = async (kind, label, note = "Named in the minutes.", more = {}) => (await me.act("entitycreate", { body: { kind, label, note, ...more } })).entity_id;
  const org = await ent("office", "Public Works Director", "The city's office for repairs."), chen = await ent("person", "Lin Chen", "Council member who moved the vote.");
  const voter = await ent("person", "Dev Patel", "Council member who voted against.");
  const project = await projectCiting(world, me, "Pothole repairs", [org]);
  const lease = await world.recipes.hold(me, "Lease amendment 1", "The amendment was adopted by the council. The adopted budget moves 4,200,000 dollars from the Sewer Fund to the General Fund.", project);
  /* person: a post */
  await me.act("recordline", { body: { kind: "holds", from: chen, to: org, capacity: "employee", basis: { captureSha: lease.sha, extent: DOC },
    valid: { from: "2022-03-01", to: "2030-12-31", precision: "day", zone: "UTC" } } });
  /* timeline: an event the minutes date, decided by the office with two voters */
  const day = (await me.act("recorddatedfact", { body: { captureSha: lease.sha, extent: DOC, kind: "adopted", value: "2024-01-12", method: "stated in the document" } })).dated_fact.dated_fact_id;
  const event = (await me.act("createevent", { body: { kind: "vote", attestations: [{ datedFactId: day }], concerns: [org],
    participants: [{ entityId: org, role: "decider", attestation: 0 }, { entityId: chen, role: "voted", voteValue: "yes", attestation: 0 }, { entityId: voter, role: "voted", voteValue: "no", attestation: 0 }] } })).event_id;
  /* money: a trail a member of her own starts (the founder's session names no member, so the trail's card would name no one), with one figure included, between two offices */
  const rosa = await world.signIn("rosa", { admin: true });
  const treasurer = await ent("office", "City Treasurer", "The city's office for money.");
  const trail = await world.recipes.trail(rosa, project, "Stormwater fund transfers, FY2023");
  const fact = (await rosa.act("recordfact", { body: { currency: "USD", sign: "+", precision: "exact", period: { from: "2021-07-01", to: "2022-06-30" }, source: { capture_sha: lease.sha, extent: DOC },
    amount: "4200000.00", as_read: "4,200,000", kind: "transfer", phase: "adopted", basis: "budgetary", from: { entity: org, as_written: "Sewer Fund" }, to: { entity: treasurer, as_written: "General Fund" } } })).fact_id;
  await rosa.act("moneysetpropose", { body: { setId: trail, factId: fact, method: "member:recordfact" } });
  await rosa.act("include", { body: { setId: trail, factId: fact, reason: "the transfer we ask about" } });
  /* calculation: a table, a draw over it, a visit, the estimate over the draw (the page that rests on a draw) */
  const csv = await world.recipes.hold(me, "Reports.csv", "id,closed\n1,y\n2,y\n3,n\n", project);
  const table = (await me.act("tabledeclare", { body: { source: { capture_sha: csv.sha, extent: DOC }, header: ["id", "closed"], schema: { fields: [{ name: "id", type: "string" }, { name: "closed", type: "string" }] } } })).sha;
  const draw = (await me.act("calculationdraw", { body: { set: table, n: 3, seed: "2026-10-05-7f31", question: "Was the pothole repaired?", project, reason: "a sample to visit" } })).draw;
  const item = (await me.read("spotcheck", { query: { draw } })).items[0].item;
  const words = await me.act("testify", { body: { words: "What I saw at report " + item + ".", observedAt: "2026-10-06" } });
  await me.act("spotcheckvisit", { body: { draw, item, finding: "yes", testimony: words.capture_sha, reason: "I visited it" } });
  const calc = (await me.act("calculationcreate", { body: { question: "Share of drawn reports repaired", period: { from: "2025-07-01", to: "2026-06-30" }, kind: "estimate", project, inputs: [{ name: "sample", draw }] } })).calc_id;
  /* proceeding: a court and a case before it */
  const court = await ent("body", "Alameda Housing Tribunal", "A court.", { forum_kind: "court" });
  const proc = await ent("proceeding", "Lease rent case", "From the caption.", { proceeding: { forum: court, kind: "civil", number: "24CV123456" } });
  /* due-date: a records request sent to the clerk, its date proposed and adopted */
  const action = (await me.act("actioncreate", { body: { document: ["---", "id: PENDING", "object_type: action", 'title: "The rent schedules"', "current_state: planned", 'created: "2026-10-01T12:00:00Z"',
    'last_updated: "2026-10-01T12:00:00Z"', "project: " + project, 'action_kind: "records_request"', "counterparty:", '  state: "named"', '  role: "City Clerk"', '  body: "City Council"', "---", "", "The rent schedules.", ""].join("\n") } })).id;
  await me.act("actioncorrespond", { query: { target: action, direction: "sent", at: "2026-11-23", account: "We asked for the rent schedules." } });
  await me.act("clockpropose", { body: { target: action, rule: "records_response" } });
  const proposal = (await me.read("clockproposals", { query: { action } })).proposals.find((x) => x.rule === "records_response");
  await me.act("clockadopt", { body: { target: action, proposal: proposal.key, why: "The clerk received it that day." } });
  /* standard: declared over the first passage of a held ordinance */
  const law = await world.recipes.hold(me, "Ordinance.txt", "Section 8.22.050 No landlord shall increase the rent above the limit the board sets.", project);
  const units = await readHeld(world, me, law.sha);
  const std = await declareStandard(me, { cite: "Ordinance 8.22", kind: "ordinance", sha: law.sha, extent: units[0].extent });
  /* ties and themes */
  await me.act("declaretie", { body: { entity: org, kind: "employer", note: "Public Works Director", attribution: "group" } });
  await me.act("themedeclare", { body: { name: "Deferred maintenance", test: "repairs put off" } });
  const PATHS = { people: "/app/people", person: "/app/person/" + chen, theme: "/app/theme", explore: "/app/explore/" + chen, timeline: "/app/timeline/" + project, money: "/app/money/" + trail,
    calculation: "/app/calculation/" + calc, help: "/app/help", proceeding: "/app/proceeding/" + proc, "due-date": "/app/due-date/" + action, standard: "/app/standard/" + std, ties: "/app/ties" };
  return { world, me, PATHS, chen, org, voter, project, trail, fact, calc, draw, event };
}
/** The world's own answer to `op`, with `fn` applied to its result: a grade the live copy holds on a record this build does not make (a member's upload is never graded). */
let shared = null;
/** The one world the read-only tests share (nothing here writes to it). */
export const theWorld = () => (shared ||= universe());
export const TIES = "/app/ties";
export const changing = (world, me, op, fn) => rewrite(world, me, (req, a) => (a && a.json && a.json.result && req.url.includes("op=" + op) ? { ...a, json: { ...a.json, result: fn(a.json.result, req) } } : a));
/** The reads a screen makes beyond the shell's own: every op the page asked, less those the help page (which reads nothing) asks of the frame. */
export const readsOf = async (U, id) => {
  const frame = new Set((await openAs(U.world, U.me, "/app/help")).requests.map((r) => r.op));
  const p = await openAs(U.world, U.me, U.PATHS[id]);
  return [...new Set(p.requests.map((r) => r.op))].filter((op) => !frame.has(op));
};

