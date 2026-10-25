/* screens-wizards' tests over `store-request`'s world (K5175, K5178; `op-tables.md` §5.3): the real store, real sign-ins and the page's
   real door. What the old fake plane scripted is made by the acts that make it: the team's members by `signIn`, a project by the
   recipe, a copy of a Civicsmith wizard by `wizarddraft`, `wizardsubmit` and `wizardapprove`, a proposal by `wizardpropose`, a finish
   by `wizardprogress`. The values a test asserts are read back from these answers, never copied from a literal. */
import { storeWorld } from "../store-request/fixtures.mjs";
import { CIVICSMITH_LIBRARY } from "../../../src/wizard-scripts/index.mjs";

export { CIVICSMITH_LIBRARY };

/** The team: the founder's world with `rosa` (an administrator, who holds every capability), `mai` (contributes and starts projects) and
 *  `ivy` (contributes but is in no project) and `teo` (holds none, so reads only). `P1` is `mai`'s project, with `rosa` its second owner, `P2` `rosa`'s, each by the recipe. Nothing is a group wizard yet; `projects: false` starts none. */
export async function team({ projects = true } = {}) {
  /* `group: null`: the world already records its producing team from the installer's INSTANCE_NAME (store-assembly, K5149); a second
     `instancegroupseed` is refused GROUP_ALREADY_RECORDED (reported to BOB for store-request) */
  const world = await storeWorld({ group: null });
  const rosa = await world.signIn("rosa", { admin: true });
  const mai = await world.signIn("mai", { capabilities: ["contribute", "create_projects"] });
  const teo = await world.signIn("teo", { capabilities: [] });
  const ivy = await world.signIn("ivy", { capabilities: ["contribute"] });
  if (!projects) return { world, rosa, mai, teo, ivy, P1: null, P2: null, projects: {}, names: {} };
  const P1 = await world.recipes.project(mai, "Pothole repairs");
  /* `rosa` joins `P1` and `mai`, its sole owner, adds her as its second owner, so an owner other than a script's author can approve it */
  await mai.act("projectinvite", { query: { projectId: P1, handle: "rosa" } });
  await rosa.act("projectjoin", { query: { projectId: P1 } });
  await mai.act("projectowneradd", { query: { projectId: P1, handle: "rosa", reason: "she carries it with me" } });
  const P2 = await world.recipes.project(rosa, "The Coliseum lease");
  return { world, rosa, mai, teo, ivy, P1, P2, projects: { P1, P2 }, names: { [P1]: "Pothole repairs", [P2]: "The Coliseum lease" } };
}

/** The Civicsmith wizards the team is offered that have no side trip and need no template, in the library's order, as `wizards` lists them
 *  to `as`: the scripts a member can copy, submit and have approved. */
export async function copyable(as) {
  const offered = (await as.read("wizards")).scripts.filter((s) => s.origin === "civicsmith");
  return CIVICSMITH_LIBRARY.filter((l) => offered.some((s) => s.id === l.id) && l.steps.length >= 2
    && l.steps.every((st) => !st.via && !(st.draft && typeof st.draft === "object" && st.draft.template))).map((l) => offered.find((s) => s.id === l.id));
}

/** `n` finished walks of a version, by `wizardprogress`'s tally (unattributed): its `use.finish` is then `n`. */
export async function finished(as, script, version, n) {
  for (let i = 0; i < n; i++) {
    await as.act("wizardprogress", { body: { script, version, event: "start" } });
    await as.act("wizardprogress", { body: { script, version, event: "finish" } });
  }
}

/** A copy of a Civicsmith wizard in `project`, drafted by `author` under `name`; `submit` submits it, `approve` has `approver` approve it
 *  (not the author). Answers `{script, version, base, ...}` as `wizarddraft` answers. */
export async function copyOf(t, base, { project = t.P1, name, author = t.mai, submit = false, approve = null } = {}) {
  const made = await author.act("wizarddraft", { body: { copy: base.versions[0].id, project, name } });
  if (submit || approve) await author.act("wizardsubmit", { body: { version: made.version, reason: "ready" } });
  if (approve) await approve.act("wizardapprove", { body: { version: made.version, reason: "good" } });
  return { ...made, name };
}

/** The door's own answer to an act, refusals included (`as.act` throws on one): the answer a page is drawn from. */
export async function refusalOf(t, as, op, { query = {}, body } = {}) {
  const a = await t.world.door({ url: `/api/?${new URLSearchParams({ op, ...query })}`,
    init: body === undefined ? { method: "GET" } : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } }, as);
  return a.json;
}

/** The library as the old fixtures drew it, made by acts: a Civicsmith wizard finished twice (`civ`); `mai`'s approved copy of it with a
 *  newer draft of it by her (`copy`, `draft`); a copy `mai` submitted (`submitted`); a copy retired for a reason (`retired`); a copy whose
 *  base has since changed (`changed`); and two open proposals (`proposal`, `other`). Every name, id and count is read back from the world. */
export async function libraryTeam() {
  const t = await team();
  const bases = await copyable(t.mai);
  const [a, b, c, d] = bases;
  await finished(t.mai, a.id, a.versions[0].id, 2);
  const copy = await copyOf(t, a, { name: "Get it, Oakland style", approve: t.rosa });
  const draft = { ...(await t.mai.act("wizarddraft", { body: { from: copy.version, name: copy.name } })), name: copy.name };
  const submitted = await copyOf(t, b, { name: "Our council-meeting checklist", submit: true });
  const retiring = await copyOf(t, c, { name: "Old checklist", approve: t.rosa });
  const retired = { ...(await t.rosa.act("wizardretire", { body: { script: retiring.script, reason: "replaced" } })), script: retiring.script, reason: "replaced" };
  const changed = await copyOf(t, d, { name: "Our copy of a moving wizard", approve: t.rosa });
  /* the library gains a version only when the product ships one, which no act makes: the copy's recorded base is set one version back
     in its own row (`wiz_copies`), so the store reads a copy whose base has since changed (op-tables §5.4) */
  t.world.sql.exec("UPDATE wiz_copies SET based_on = ? WHERE script_id = ?", `${d.id}@${d.versions[0].version - 1}`, changed.script);
  const propose = async (why, what) => (await t.mai.act("wizardpropose", { body: { project: t.P1, steps: [{ screen: "finder", act: "search", what, why: "First" }], why } })).proposal;
  const proposal = await propose("Members keep missing the search", "Search");
  const other = await propose("Members forget to look for the record first", "Look first");
  const civ = (await t.mai.read("wizards")).scripts.find((x) => x.id === a.id);
  return { ...t, bases: { a, b, c, d }, civ, copy, draft, submitted, retiring, retired, changed, proposal, other };
}

/** A group wizard written step by step in the advanced editor (`rosa` grants it), submitted by `author` and approved by `approver` (and made the whole team's when `widen`):
 *  answers `{script, version, name, steps}` with the id and the steps as `wizardread` reads them back. */
export async function authored(t, { name, steps, project = t.P1, author = t.mai, approver = t.rosa, approve = true, widen = false }) {
  await approver.act("wizardeditorgrant", { body: { member: author.member } });
  const made = await author.act("wizarddraft", { body: { project, name } });
  await author.act("wizardrevise", { body: { version: made.version, steps, reason: "the steps" } });
  if (approve) {
    await author.act("wizardsubmit", { body: { version: made.version, reason: "ready" } });
    await approver.act("wizardapprove", { body: { version: made.version, reason: "good" } });
    if (widen) await approver.act("wizardapprove", { body: { version: made.version, widen: true, reason: "for the whole team" } });
  }
  const read = await author.read("wizardread", { query: { script: made.script, version: made.version } });
  return { script: made.script, version: made.version, name, steps: read.version.steps };
}

/** The Civicsmith library as the store reads it to `as` (`wizardread` of each script's latest version): `{id, version, name, steps}` each. */
export async function libraryRead(as, id) {
  const r = await as.read("wizardread", { query: { script: id } });
  return { id, version: r.version.id, name: r.script.name, steps: r.version.steps };
}

/** The library scripts by id, as the library export carries them (their steps and names are the product's own data). */
export const libraryScript = (id) => CIVICSMITH_LIBRARY.find((s) => s.id === id);
export const GET_RECORD = libraryScript("WIZ-cb0ad18a17a04233");
export const WELCOME_SCRIPT = libraryScript("WIZ-7db08189cc0e58c3");
export const FIRSTQ_SCRIPT = libraryScript("WIZ-86b7f4007e3b0e3c");

/** The questions and documents `as` holds in `project`, by the recipes (`promote` of an inquiry, `captureupload` and `promote` of a document),
 *  the clock moved on a minute between each so the later is the more recently updated. Answers `{questions: [ids], documents: [ids]}` in the
 *  order made. */
export async function withSubjects(t, { questions = 0, documents = 0, as = t.mai, project = t.P1 } = {}) {
  const out = { questions: [], documents: [] };
  for (let i = 0; i < questions; i++) {
    out.questions.push((await t.world.recipes.question(as, project, { title: `Question ${i + 1}`, text: `Is ${i + 1} so?` })).id);
    t.world.tick(60 * 1000);
  }
  for (let i = 0; i < documents; i++) {
    out.documents.push((await t.world.recipes.hold(as, `Document ${i + 1}`, `The text of document ${i + 1}.`, project)).bundle);
    t.world.tick(60 * 1000);
  }
  return out;
}

/** The ids `list` gives `as` for a type (`inquiry` or `information`), with each bundle's `last_updated`, as the guide reads them. */
export async function listed(as, type) {
  return (await as.read("list", { query: { type, limit: "500" } })).bundles;
}

/** The team's filing template `name` with `text`, written by `author`, sent for review, approved by `approver` and made the whole team's
 *  (an administrator's act), by the acts that do it. Answers `{template, version, name, text}` as the store reads it by its handle. */
export async function template(t, { name = "Records request", text = "Dear {agency}, please send {records}.", author = t.mai, approver = t.rosa } = {}) {
  const made = await author.act("templatedraft", { body: { project: t.P1, kind: "records_request", use: "brief", profiles: "general", name, text } });
  await author.act("templatesubmit", { body: { version: made.version, reviewers: [approver.member], reason: "ready" } });
  await approver.act("templateapprove", { body: { version: made.version, reason: "good" } });
  await approver.act("templateapprove", { body: { version: made.version, widen: true, reason: "for the whole team" } });
  return { template: made.template, version: made.version, name, text };
}
