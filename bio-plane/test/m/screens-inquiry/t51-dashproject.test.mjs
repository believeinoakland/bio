/* screens-inquiry R79 (T51-119): `dash-project`, a project's dashboard, on interface-shell's served page over the real world (store-request's
 * `storeWorld`, K5054): the project, its members, its questions and their strength, its held captures and its bar are made by real acts and the page reads the
 * real answers; only what the world cannot yet make stays scripted for its op (the timeline's events, the queue's newer-capture notice, a draft case, the
 * founder's unnamed roster row, a paged project list). Every expectation is a word read by key (R44) or arithmetic the kit shares (`cs.date`); no test holds a
 * sentence's English. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { word, hasWord } from "../../../src/setup-words/index.mjs";
import { COMMON } from "../../../src/screens-inquiry/common.mjs";
import { dashProjectScreen } from "../../../src/screens-inquiry/dashproject.mjs";
import { boot, ok, refused, refusedIn } from "../interface-shell/harness.mjs";
import { storeWorld } from "./fixtures.mjs";
import { instant, hex } from "../store-request/door.mjs";


const GATE = "https://records.example.org/east-gate";
const OBJECTIVE = "Is the city repairing reported potholes as its own policy requires?";
const SCREEN = dashProjectScreen(COMMON);

/** A project started as Home's "Start a project" starts it, with the document's own references (the people and events it cites), by the real `promote`. */
async function startProject(world, as, title, { refs = true, hidden = false } = {}) {
  const now = instant(world);
  const text = ["---", "object_type: project", `title: ${JSON.stringify(title)}`, `objective: ${JSON.stringify(OBJECTIVE)}`, "current_state: forming", `created: "${now}"`, `last_updated: "${now}"`,
    ...(refs ? ["references:", "  - target: ENT-17", "    rel: cites", "    status: active", "  - target: EVT-4", "    rel: cites", "    status: active"] : []),
    "---", "", "## Session Log", ""].join("\n");
  const made = await as.act("promote", { body: { base: null, snapKey: now.replace(/[-:]/g, "") + "_" + hex(title).slice(0, 8),
    meta: { object_type: "project", title, current_state: "forming", created: now, last_updated: now }, files: [{ path: "bundle.md", text }], register: [], visibility: "discoverable" } });
  if (hidden) await as.act("projectvisibilityset", { query: { projectId: made.bundleId, setting: "hidden", reason: "it is not for the street yet" }, body: {} });
  return made.bundleId;
}

/** A page of a public address held in the project by `as`, as the capture screen holds it: the member's own `acquire` of the address (the world's network answers
 *  it, scripted), then the document promoted at `collected` with that address as its place. (The world has no recipe for it: `recipes.hold` holds an upload.) */
async function holdAt(world, as, name, address, text, projectId) {
  world.script(address, async () => new Response(text, { status: 200, headers: { "content-type": "text/html" } }));
  const doc = (await as.act("acquire", { body: { locator: address, project: projectId } })).document;
  const now = instant(world);
  const id = (await as.read("allocid", { query: { prefix: "INFO", year: now.slice(0, 4) } })).id + "-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const sha = doc.capture.sha256;
  const front = ["---", "id: " + id, "object_type: information", "schema: information@2", "title: " + JSON.stringify(name), "current_state: collected", "prior_state: null",
    "created: " + now, "last_updated: " + now, "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []", "state_history: []", "annotations_open: 0",
    "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged", "content_hash: sha256:" + hex(sha),
    "source:", "  locator: " + JSON.stringify(doc.locator), "  authority: member-entered", "  retrieved: " + now, "monitoring:", "  enabled: false", "  frequency: none",
    "project: " + projectId, "---", "", "## Summary", "", name, "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
  const prov = JSON.stringify({ documents: [doc] }, null, 1), dataset = JSON.stringify({ documents: [{ bytes: doc.capture.bytes, locator: doc.locator, sha256: sha }] });
  const len = (s) => new TextEncoder().encode(s).length;
  const files = [{ path: "bundle.md", text: front, bytes: len(front), sha256: hex(front) }, { path: "data/provenance.json", text: prov, bytes: len(prov), sha256: hex(prov) },
    { path: "data/dataset.json", text: dataset, bytes: len(dataset), sha256: hex(dataset) }, { path: doc.file, blobSha: sha, sha256: sha, bytes: doc.capture.bytes }];
  const made = await as.act("promote", { body: { bundleId: id, base: null, snapKey: now.replace(/[-:]/g, "") + "_" + hex(id).slice(0, 8),
    meta: { object_type: "information", title: name, current_state: "collected", created: now, last_updated: now }, files, register: [{ sha256: sha, path: doc.file, encoding: doc.capture.encoding, bytes: doc.capture.bytes }] } });
  return { bundle: made.bundleId || id, sha };
}

/** The world of a dashboard, by real acts: dev's project (owner), mai and rosa joined, ana invited and not yet in; the lease amendment held in it and three questions
 *  resting on it (two with a capture grade of B, one of C), the project's bar (a capture grade of B); and what mai captured and has not vouched for (`held`: each
 *  "gate" a page of the east gate's address, each "upload" an upload with no place). `bar: false` declares none; `graded: false` leaves the questions' legs ungraded;
 *  `questions: false` holds no document and asks nothing; `refs: false` cites no person or event. */
async function state({ held = ["gate", "gate"], bar = true, graded = true, questions = true, refs = true } = {}) {
  const world = await storeWorld();
  const dev = await world.signIn("dev", { capabilities: ["contribute", "create_projects"] });
  const mai = await world.signIn("mai", { capabilities: ["contribute"] });
  const rosa = await world.signIn("rosa", { capabilities: ["contribute"] });
  const ana = await world.signIn("ana", { capabilities: ["contribute"] });
  const ben = await world.signIn("ben", { capabilities: ["contribute"] });
  const project = await startProject(world, dev, "Pothole repairs", { refs });
  for (const [who, h] of [[mai, "mai"], [rosa, "rosa"]]) {
    await dev.act("projectinvite", { query: { projectId: project, handle: h }, body: {} });
    await who.act("projectjoin", { query: { projectId: project }, body: {} });
  }
  await dev.act("projectinvite", { query: { projectId: project, handle: "ana" }, body: {} });
  let doc = null;
  const qs = [];
  if (questions) {
    doc = await world.recipes.hold(dev, "The 2024 lease amendment", "The lease was amended in 2024.", project);
    for (const [title, grade] of [["Seven days?", "B"], ["Closed means repaired?", "B"], ["Third?", "C"]])
      qs.push((await world.recipes.question(dev, project, { title, text: title, draw: true,
        legs: [{ target: doc.bundle, role: "supports", ...(graded ? { grade, grade_axis: "capture", grade_source: "capture" } : {}) }] })).id);
  }
  if (bar) await dev.act("projectbarset", { body: { project, capture: "B", expected: { capture: null, connection: null }, reason: "the council meets on it" } });
  const mine = [];
  for (const [i, kind] of held.entries())
    mine.push(kind === "gate" ? (await holdAt(world, mai, "Gate photo " + (i + 1), GATE, `<html><head><title>Gate ${i + 1}</title></head><body><p>The east gate, photo ${i + 1}.</p></body></html>`, project)).bundle
      : (await world.recipes.hold(mai, "Upload " + (i + 1), "The photo's bytes, " + (i + 1) + ".", project)).bundle);
  return { world, project, dev, mai, rosa, ana, ben, doc, qs, mine };
}
/** The page of the project, booted as `as` (mai unless given) over the world; `o` scripts an op of another module the world cannot make the state of. */
const open = async (t, o = {}, { as = t.mai, project = t.project, ...boots } = {}) => {
  const { door, session } = t.world.boot(as);
  const p = await boot({ screens: [SCREEN], door, session, plane: o, path: "/app/dash-project/" + project, ...boots });
  await p.settle();
  return p;
};

/* what the world cannot make: a newer capture of a document one of the project's questions rests on (the queue's FINDING), a draft case holding findings
   (`casedrafts`, `reviewcopy`) and the timeline's events and the team's actions */
const noticeOf = (t) => ({ id: "FINDING::newer-capture-affects-reference::N1", class: "FINDING", kind: "newer-capture-affects-reference",
  case: { ancestors: [{ id: t.qs[0], depth: 0 }, { id: t.project, depth: 1 }] }, subject: { kind: "notice", id: "N1", holder: t.qs[0], target: t.doc.bundle } });
const draftsOf = (t) => ({
  casedrafts: ok({ ok: true, drafts: [{ draft_id: "DRAFT-1", case: { case_id: "CASE-1", edition: 3 } }] }),
  reviewcopy: ok({ ok: true, project: t.project, case: { case_id: "CASE-1", edition: 3, newCase: false }, findings: [{ target: t.qs[0] }, { target: t.qs[1] }] }),
  publishpreflight: ok({ ok: true, ready: true, first: null, blockers: [], steps: [{ pinned: [{ target: t.qs[0] }, { target: t.qs[1] }] }] }),
});
const TIMELINE = { timeline: ok({ ok: true,
  world: { items: [
    { event_id: "EVT-1", kind: "adopted", when: { value: "2024-01-12", precision: "day" } },
    { event_id: "EVT-2", kind: "effective", when: { value: "2024-03", precision: "edtf" }, order: { undetermined: true, with: ["EVT-3"] } },
    { event_id: "EVT-3", kind: "issued", when: { value: "2024-04", precision: "edtf" }, order: { undetermined: true, with: ["EVT-2"] } },
    { event_id: "EVT-4", kind: "meeting", when: { value: "2026-09-18", precision: "day" } }], placed_nowhere: [], truncated: false },
  ours: { sources: [{ source: "actions", items: [{ at: "2026-09-19T10:00:00Z", ref: "ACTN-1", label: "Demand to rescind" }] }] } }) };
const heldOf = async (t, as = t.mai) => (await as.read("heldcaptures", { query: { project: t.project, member: as.member, limit: "500", fields: "picker" } })).held;

const main = (p) => p.doc.getElementById("cs-main");
const said = (el, key, vars) => String(el && el.textContent || "").includes(word(key, vars || {}));
const section = (p, key) => main(p).querySelectorAll("section").find((s) => s.querySelector("h2").textContent === word(key, {}));
const heads = (p) => main(p).querySelectorAll("section h2").map((h) => h.textContent);
const acts = (el) => el.querySelectorAll("button[data-act]").map((b) => b.getAttribute("data-act"));
const fill = (p, v) => { for (const [id, x] of Object.entries(v)) { const el = p.doc.getElementById(id); assert.ok(el, id); el.value = x; } };

test("R79 the screen is registered by this module: `dash-project`, its subject read marked, drawn at /app/dash-project/<project>", async () => {
  const { SCREENS } = await import("../../../src/screens-inquiry/index.mjs");
  const s = SCREENS.find((x) => x.id === "dash-project");
  const t = await state({ held: [] });
  assert.ok(s && s.reads({ subject: t.project }).stage.subject === true, "R21: its subject read is marked");
  assert.deepEqual(s.acts.map((a) => a.op).sort(), ["adoptversion", "keepversion", "release"]);
  for (const k of s.words) assert.ok(hasWord(k), k);
  assert.equal(SCREENS.findIndex((x) => x.id === "dash-project"), SCREENS.findIndex((x) => x.id === "project") + 1);
  const p = await open(t);
  assert.ok(main(p).querySelector("h1"), "the page is drawn");
});

test("R79 R39 R40 the head: the project's title, then its objective, owner by handle and stage in one line; never a record id", async () => {
  const t = await state({ held: [] });
  const p = await open(t);
  assert.equal(main(p).querySelector("h1").textContent, "Pothole repairs");
  const line = main(p).querySelector("p.mk-sub");
  assert.ok(line.textContent.includes("Is the city repairing reported potholes"), "the objective, as the record states it");
  assert.ok(said(line, "screen.projects.owner", { handle: "dev" }), "the owner by handle");
  assert.ok(said(line, "screen.project.stage.investigating"), "the stage in its word");
  assert.ok(!main(p).querySelectorAll("h1, h2").some((h) => /PROJ-|INQ-|INFO-/.test(h.textContent)), "R39: no heading is a record id");
  /* R39: a record with no title draws undetermined; R40: the unnamed founder owner by key, never `admin` */
  const real = (await t.mai.read("image", { query: { id: t.project } }))["bundle.md"];
  const q = await open(t, { image: ok({ "bundle.md": real.replace(/title: "Pothole repairs"\n/, "") }),
    projectparticipants: ok({ ok: true, participants: [{ handle: null, founder: true, state: "joined", owner: 1 }, { handle: "mai", state: "joined", owner: 0 }] }) });
  assert.ok(said(main(q).querySelector("h1"), "state.undetermined", { reason: "" }));
  assert.ok(said(main(q).querySelector("p.mk-sub"), "screen.projects.owner", { handle: word("member.founder.unnamed") }));
  assert.ok(!main(q).textContent.includes("admin"));
});

test("R79 Next for you here: the vouch, the newer version and the ceremony, in that order, the first the one to take now, each the act itself", async () => {
  const t = await state();
  const p = await open(t, { queue: ok({ ok: true, items: [noticeOf(t)] }), ...draftsOf(t) });
  const s = section(p, "screen.dash-project.next.heading");
  const steps = s.querySelectorAll("ol.mk-next > li");
  assert.equal(steps.length, 3);
  assert.ok(said(steps[0], "screen.dash-project.next.vouch", { count: "2", place: GATE }));
  assert.ok(said(steps[1], "screen.dash-project.next.newer", { document: "The 2024 lease amendment" }));
  assert.ok(said(steps[2], "screen.dash-project.next.prepare", { edition: "3", count: "2" }));
  assert.equal(steps[0].getAttribute("aria-current"), "step");
  assert.equal(steps[1].getAttribute("aria-current"), null);
  assert.deepEqual(acts(steps[0]), ["release"]);
  assert.deepEqual(acts(steps[1]), ["adoptversion", "keepversion"]);
  assert.ok(said(steps[2], "screen.dash-project.next.prepare.label", { n: "3" }), "the ceremony, a reference opening `ceremony`, labelled by its own key");
  assert.ok(String(steps[2].querySelector(".cs-card").getAttribute("data-tip")).includes(word("shell.card.ceremony").replace(/<[^>]*>/g, "").slice(0, 20)), "its card is shell.card.ceremony");
  assert.equal(p.byOp("heldcaptures").filter((r) => r.query.member === "mai").length, 1, "her own held captures only");
  assert.equal(p.byOp("publishpreflight")[0].body.draft, "DRAFT-1");
  assert.deepEqual(p.byOp("publishpreflight")[0].body.targets, [t.qs[0], t.qs[1]]);
  /* the section stands under the head, above the glance */
  const h = heads(p);
  assert.ok(h.indexOf(word("screen.dash-project.next.heading")) < h.indexOf(word("screen.dash-project.glance.heading")));
});

test("R79 Next for you here: no step a read does not support; with none, no section; a notice of another project, a preflight not ready and a draft with no edition give none", async () => {
  const t = await state();
  /* rosa captured nothing of her own: the page asks for hers only, and the real queue and draft list of the project hold no such step */
  const none = await open(t, {}, { as: t.rosa });
  assert.equal(section(none, "screen.dash-project.next.heading"), undefined);
  const other = await open(t, { queue: ok({ ok: true, items: [{ ...noticeOf(t), case: { ancestors: [{ id: "PROJ-2026-0099", depth: 1 }] }, subject: { ...noticeOf(t).subject, holder: "INQ-2026-0099-other" } }] }) }, { as: t.rosa });
  assert.equal(section(other, "screen.dash-project.next.heading"), undefined, "a notice of another project is not a step here");
  const notReady = await open(t, { ...draftsOf(t), publishpreflight: ok({ ok: true, ready: false, first: { code: "X" }, blockers: [], steps: [{ pinned: [{ target: t.qs[0] }] }] }) }, { as: t.rosa });
  assert.equal(section(notReady, "screen.dash-project.next.heading"), undefined, "findings that do not meet the bar prepare nothing");
  const noEdition = await open(t, { casedrafts: ok({ ok: true, drafts: [{ draft_id: "DRAFT-1", case: { case_id: null, edition: null } }] }) }, { as: t.rosa });
  assert.equal(section(noEdition, "screen.dash-project.next.heading"), undefined, "no edition stated, no step composed");
  assert.equal(noEdition.byOp("publishpreflight").length, 0);
});

test("R79 the vouch step sends select over the held captures, then release with the handle and her two statements; with one missing nothing is sent", async () => {
  const t = await state();
  const p = await open(t);
  const s = section(p, "screen.dash-project.next.heading");
  await p.click(s.querySelector('button[data-act="release"]'));
  assert.equal(p.byOp("select").length + p.byOp("release").length, 0, "no statement, nothing sent");
  fill(p, { "dp-vouch-0-ack": "They are what the gate cameras gave", "dp-vouch-0-mitigation": "I compared each with the original" });
  await p.click(s.querySelector('button[data-act="release"]'));
  await p.settle();
  const sent = p.byOp("select")[0];
  assert.deepEqual([...sent.body.ids].sort(), [...t.mine].sort());
  const rel = p.byOp("release")[0];
  /* the handle is the one the real `select` allocated, and the real `release` took it: the photos are vouched for */
  assert.ok(typeof rel.query.handle === "string" && rel.query.handle.length > 0, "the handle `select` answered");
  assert.deepEqual([rel.query.acknowledgment, rel.query.mitigation], ["They are what the gate cameras gave", "I compared each with the original"]);
  assert.deepEqual((await heldOf(t)).map((r) => r.bundle_id), [], "nothing of hers is left unvouched");
});

test("R79 the newer-version step: keeping sends the notice; adopting sends the notice with her reason, and without one the plane's own refusal is drawn by its words", async () => {
  const t = await state();
  const p = await open(t, { queue: ok({ ok: true, items: [noticeOf(t)] }), keepversion: ok({ ok: true }), adoptversion: refusedIn("VERSION_ADOPT_NO_REASON") });
  const step = () => section(p, "screen.dash-project.next.heading");
  await p.click(step().querySelector('button[data-act="keepversion"]'));
  assert.deepEqual(p.byOp("keepversion")[0].body, { notice: "N1" });
  fill(p, { "dp-why-0-why": "It is the signed copy" });
  await p.click(step().querySelector('button[data-act="adoptversion"]'));
  await p.settle();
  assert.deepEqual(p.byOp("adoptversion").at(-1).body, { notice: "N1", why: "It is the signed copy" });
  assert.ok(said(main(p), "refusal.VERSION_ADOPT_NO_REASON"), "the plane's refusal drawn by its words");
});

test("R79 This project at a glance: Questions with how many meet the bar, Events and Members, each figure the reads' own; no Documents reading", async () => {
  const t = await state();
  const p = await open(t, TIMELINE);
  const s = section(p, "screen.dash-project.glance.heading");
  const tiles = s.querySelectorAll(".mk-tile");
  const by = (key) => tiles.find((t) => t.textContent.includes(word(key)));
  const q = by("screen.dash-project.tile.questions");
  assert.equal(q.querySelector("b.v").textContent, "3", "the three questions the project holds");
  assert.ok(said(q, "screen.home.area.meetbar", { count: "2" }), "two meet the bar (a capture grade of B)");
  const ev = by("screen.dash-project.tile.events");
  assert.equal(ev.querySelector("b.v").textContent, "5", "four events of the world lane and one of the team's");
  assert.ok(said(ev, "screen.dash-project.tile.events.undetermined", { n: "2" }), "the two undetermined in order, by its own key");
  const m = by("screen.dash-project.tile.members");
  assert.equal(m.querySelector("b.v").textContent, "3", "the invited member is not a member yet");
  assert.ok(m.textContent.includes("dev, mai, rosa"), "their handles");
  assert.equal(tiles.length, 3);
  assert.ok(!main(p).textContent.includes(word("screen.dash-project.tile.documents")), "the Documents reading has no read: not drawn");
  /* a project with no bar says no count of those that meet it, and none at zero */
  const nobar = await open(await state({ bar: false }));
  assert.ok(!said(section(nobar, "screen.dash-project.glance.heading"), "screen.home.area.meetbar", { count: "0" }));
  assert.ok(!main(nobar).textContent.includes(word("screen.home.area.meetbar", { count: "2" })));
  const nonemeet = await open(await state({ graded: false }));
  assert.ok(!main(nonemeet).textContent.includes(word("screen.home.area.meetbar", { count: "0" })), "no count at zero");
});

test("R79 The story so far: what they did above the line, what the team did below it, a month-known event never placed, the undetermined said, and the timeline opened", async () => {
  const t = await state();
  const p = await open(t, TIMELINE);
  const s = section(p, "screen.dash-project.story.heading");
  const evs = s.querySelectorAll(".mk-tl .ev");
  assert.equal(evs.length, 3, "the two whole-dated events they did and the one the team did");
  assert.deepEqual(evs.map((e) => e.getAttribute("class").includes("us")), [false, false, true], "in date order; ours below the line");
  assert.ok(said(evs[0], "screen.timeline.kind", { kind: "adopted" }));
  assert.ok(evs[2].textContent.includes("Demand to rescind"), "the team's own words");
  assert.equal(evs.filter((e) => e.textContent.includes(word("screen.timeline.kind", { kind: "effective" }))).length, 0);
  assert.ok(said(s, "screen.dash-project.story.undetermined", { events: "effective, issued", precision: word("screen.dash-project.precision.edtf") }));
  const link = s.querySelector("a[href='/app/timeline/" + t.project + "']");
  assert.ok(link && said(link, "shell.glance.timeline"), "Open the timeline");
  assert.equal(p.byOp("timeline")[0].query.set, "ENT-17,EVT-4", "the project's set is the people and events its document cites");
  const docs = (await t.mai.read("heldcaptures", { query: { project: t.project, limit: "200", fields: "picker" } })).held.map((r) => r.capture.sha256);
  assert.equal(docs.length, 1 + t.mine.length, "the lease and the photos she captured");
  assert.deepEqual(p.byOp("timeline")[0].query.captures.split(",").sort(), [...docs].sort(), "the capture digests of the project's documents");
});

test("R79 Activity: who works on it, how busy it is and when it last changed, from projectlist; the founder unnamed by key", async () => {
  const t = await state();
  const p = await open(t);
  const row = (await t.mai.read("projectlist", { query: { limit: "200" } })).projects.find((x) => x.id === t.project);
  const s = section(p, "screen.dash-project.activity.heading");
  const people = s.querySelector(".mk-people");
  assert.ok(people.getAttribute("aria-label").includes(word("shell.glance.people", { n: String(row.members.length), names: row.members.map((m) => m.handle).join(", ") }).replace(/&#39;/g, "'")), "the members' names as the project list gives them (the world's founder has her handle, so the unnamed founder is the head's test, over its scripted roster row)");
  assert.deepEqual(row.members.map((m) => m.handle), ["dev", "ana", "mai", "rosa"], "the list names the invited member too, beside those joined");
  assert.equal(people.querySelectorAll("i").length, row.members.length);
  assert.ok(s.querySelector(".mk-spark"), "eight weeks of bars");
  assert.ok(s.querySelector(".mk-spark").getAttribute("aria-label").includes(row.activity.join(", ")), "the eight weeks the list gives");
  assert.ok(s.textContent.includes(word("screen.projects.lastchange", { date: "" }).split(" ")[0]), "when it last changed");
  assert.ok(!s.textContent.includes(word("screen.dash-project.activity.events", { name: "", count: "", day: "" })), "no named member and count is read, so the line is not drawn");
  /* the list is paged until the project is found */
  const paged = await open(t, { projectlist: (r) => ok(r.query.after
    ? { ok: true, projects: [{ id: t.project, name: "x", members: [{ handle: "dev" }], activity: [0, 0, 0, 0, 0, 0, 0, 1], lastChange: null }], truncated: false, next: null }
    : { ok: true, projects: [{ id: "PROJ-2026-0001", name: "Elsewhere" }], truncated: true, next: "PROJ-2026-0001" }) });
  assert.ok(section(paged, "screen.dash-project.activity.heading"));
  assert.equal(paged.byOp("projectlist").length, 2);
  assert.ok(said(section(paged, "screen.dash-project.activity.heading"), "screen.projects.lastchange.none"));
  /* a project the list does not hold draws no Activity */
  const absent = await open(t, { projectlist: ok({ ok: true, projects: [], truncated: false, next: null }) });
  assert.equal(section(absent, "screen.dash-project.activity.heading"), undefined);
});

test("R79 R20 no section is drawn from a read that failed as if it were empty: each is drawn failed by `cs.state`", async () => {
  const p = await open(await state(), { queue: refused("X", "", 500), projectquestions: refused("X", "", 500), projectlist: refused("X", "", 500), heldcaptures: refused("X", "", 500) });
  const states = main(p).querySelectorAll('.cs-state[data-state="failed"]');
  assert.ok(states.length >= 4, "the next steps, the questions, the story's documents and the activity each say so");
  for (const s of states) assert.ok(said(s, "shell.unread") || s.textContent.length > 0);
  const next = section(p, "screen.dash-project.next.heading");
  assert.ok(next.querySelector('.cs-state[data-state="failed"]'));
  assert.ok(!main(p).textContent.includes(word("screen.dash-project.tile.questions")), "no Questions reading from a failed read");
  assert.ok(section(p, "screen.dash-project.activity.heading").querySelector('.cs-state[data-state="failed"]'));
});

test("R79 R20 an empty project draws no empty section and no zero: the head alone", async () => {
  /* a project that cites nothing and asks nothing, with no document held; its roster and the project list are the one place the world cannot be empty (she is a member of it) */
  const t = await state({ held: [], questions: false, bar: false, refs: false });
  const p = await open(t, { projectlist: ok({ ok: true, projects: [], truncated: false, next: null }), projectparticipants: ok({ ok: true, participants: [] }) });
  assert.deepEqual(heads(p), []);
  assert.ok(main(p).querySelector("h1"));
  assert.ok(!/\b0\b/.test(main(p).textContent), "no count at zero");
});

test("R79 R21 bare, not found: only 'Nothing is here' (interface-shell R61); R60 a project she is not in draws its states, no dashboard beneath", async () => {
  const t = await state();
  const gone = await open(t, {}, { project: "PROJ-2026-9999-nothing-here" });
  assert.equal(main(gone).querySelectorAll("section").length, 0);
  assert.equal(["reviewcopy", "publishpreflight", "timeline", "doctitle"].reduce((n, op) => n + gone.byOp(op).length, 0), 0, "no read the screen makes as it draws is made for a project that is not there");
  /* R60: hidden: unavailable b; findable: its name and the way to ask, which the project page holds, never the dashboard */
  const secret = await startProject(t.world, t.dev, "Pothole repairs, in private", { hidden: true });
  /* a hidden project is known only to its participants and, as existence, to an administrator who is neither invited nor joined; to anyone else it is not there */
  const adm = await t.world.signIn("adm", { admin: true });
  const bystander = await open(t, {}, { as: t.ben, project: secret });
  assert.equal(main(bystander).querySelectorAll("section").length, 0);
  const hidden = await open(t, {}, { as: adm, project: secret });
  assert.ok(said(main(hidden), "shell.unavailable.notyours.title"));
  assert.equal(main(hidden).querySelectorAll("section").length, 0);
  const findable = await open(t, {}, { as: t.ben });
  assert.ok(said(main(findable), "screen.project.notjoined"));
  assert.ok(main(findable).querySelector(`a[href='/app/project/${t.project}']`) || main(findable).textContent.includes("Pothole repairs"));
  assert.equal(section(findable, "screen.dash-project.next.heading"), undefined);
  assert.equal(findable.byOp("timeline").length + findable.byOp("projectlist").length - hidden.byOp("projectlist").length, 0, "nothing of the dashboard is read for it");
});

test("R79 R20 the module's real SCREENS compose under the shell with `dash-project` among them, each class defined; a request writes nothing", async () => {
  const { SCREENS } = await import("../../../src/screens-inquiry/index.mjs");
  const t = await state();
  const { door, session } = t.world.boot(t.mai);
  const p = await boot({ screens: SCREENS, door, session, path: "/app/dash-project/" + t.project });
  await p.settle();
  assert.ok(main(p).querySelector("h1") && section(p, "screen.dash-project.glance.heading"));
  const writes = p.requests.filter((r) => r.method !== "GET" && !["whoami"].includes(r.op) && /^(release|select|adoptversion|keepversion)$/.test(r.op || ""));
  assert.equal(writes.length, 0, "drawing the dashboard sends no act");
});

test("R79 journey-check no longer excepts it: the registry screen `dash-project` is a screen of this module with the registry's three acts", async () => {
  const { SCREENS } = await import("../../../src/screens-inquiry/index.mjs");
  const reg = JSON.parse((await import("node:fs")).readFileSync(new URL("../../../../docs/development/ux-substrate/screens/registry.json", import.meta.url), "utf8"));
  const row = reg.screens.find((s) => s.id === "dash-project");
  assert.deepEqual(row.acts.map((a) => a.op).sort(), SCREENS.find((s) => s.id === "dash-project").acts.map((a) => a.op).sort());
});

test("R79 the vouch step of a capture with no place: the no-place keys by count, one step of its own, never a place composed; the placed ones keep theirs", async () => {
  /* the photos she captured as uploads have no place: an upload's address is not one */
  const t2 = await state({ held: ["upload", "upload"], questions: false });
  const two = await open(t2);
  const steps = section(two, "screen.dash-project.next.heading").querySelectorAll("ol.mk-next > li");
  assert.equal(steps.length, 1);
  assert.ok(said(steps[0], "screen.dash-project.next.vouch.noplace", { count: "2" }));
  assert.ok(!steps[0].textContent.includes("upload:"), "no address is drawn as a place");
  assert.deepEqual(acts(steps[0]), ["release"]);
  const one = await open(await state({ held: ["upload"], questions: false }));
  assert.ok(said(section(one, "screen.dash-project.next.heading"), "screen.dash-project.next.vouch.noplace.one"));
  const t3 = await state({ held: ["gate", "upload"], questions: false });
  const mixed = await open(t3);
  const m = section(mixed, "screen.dash-project.next.heading").querySelectorAll("ol.mk-next > li");
  assert.equal(m.length, 2);
  assert.ok(said(m[0], "screen.dash-project.next.vouch.one", { place: GATE }) && !said(m[0], "screen.dash-project.next.vouch", { count: "1", place: GATE }));
  assert.ok(said(m[1], "screen.dash-project.next.vouch.noplace.one"));
  /* the vouch sends the no-place group's own ids */
  const p = await open(t2);
  fill(p, { "dp-vouch-0-ack": "Mine", "dp-vouch-0-mitigation": "Checked" });
  await p.click(section(p, "screen.dash-project.next.heading").querySelector('button[data-act="release"]'));
  await p.settle();
  assert.deepEqual([...p.byOp("select")[0].body.ids].sort(), [...t2.mine].sort());
});

test("R79 The story so far: the undetermined line names each event and the precision it is dated to by the precision key; the Events note is drawn only where an order is undetermined", async () => {
  const t = await state({ held: [] });
  for (const code of ["day", "minute", "second", "edtf"]) {
    const items = ["EVT-2", "EVT-3"].map((id, i) => ({ event_id: id, kind: i ? "issued" : "effective", when: { value: "2024-03", precision: code }, order: { undetermined: true } }));
    const p = await open(t, { timeline: ok({ ok: true, world: { items, placed_nowhere: [] }, ours: { sources: [] } }) });
    assert.ok(said(section(p, "screen.dash-project.story.heading"), "screen.dash-project.story.undetermined", { events: "effective, issued", precision: word("screen.dash-project.precision." + code) }), code);
    assert.ok(said(section(p, "screen.dash-project.glance.heading"), "screen.dash-project.tile.events.undetermined", { n: "2" }), code);
  }
  const settled = await open(t, { timeline: ok({ ok: true, world: { items: [{ event_id: "EVT-1", kind: "adopted", when: { value: "2024-01-12", precision: "day" } }], placed_nowhere: [] }, ours: { sources: [] } }) });
  assert.ok(!main(settled).textContent.includes(word("screen.dash-project.tile.events.undetermined", { n: "0" })), "no count at zero");
  assert.ok(!said(section(settled, "screen.dash-project.glance.heading"), "screen.dash-project.tile.events.undetermined", { n: "1" }));
});
