/* screens-inquiry R79 (T51-119): `dash-project`, a project's dashboard, on interface-shell's served page over a scripted
 * plane of its own. Every expectation is a word read by key (R44) or arithmetic the kit shares (`cs.date`); no test holds a
 * sentence's English. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { word, hasWord } from "../../../src/setup-words/index.mjs";
import { COMMON } from "../../../src/screens-inquiry/common.mjs";
import { dashProjectScreen } from "../../../src/screens-inquiry/dashproject.mjs";
import { boot, ok, refused, refusedIn } from "../interface-shell/harness.mjs";
import "./fixtures.mjs";

const P = "PROJ-2026-0007";
const Q1 = "INQ-2026-0001-seven-days", Q2 = "INQ-2026-0002-closed", Q3 = "INQ-2026-0003-third";
const DOC = "INFO-2026-0004", NEWER = "9".repeat(64);
const SHA1 = "a".repeat(64), SHA2 = "b".repeat(64);
const SCREEN = dashProjectScreen(COMMON);

const projectMd = ["---", `id: ${P}`, "object_type: project", "title: \"Pothole repairs\"",
  "objective: \"Is the city repairing reported potholes as its own policy requires?\"", "references:",
  "  - target: ENT-17", "    rel: cites", "    status: active", "  - target: EVT-4", "    rel: cites", "    status: active", "---", "", "## Summary", ""].join("\n");
const docMd = ["---", `id: ${DOC}`, "object_type: information", "title: \"The 2024 lease amendment\"", "---", ""].join("\n");

const STRENGTH = {
  [Q1]: { capture: { state: "graded", grade: "A" }, connection: { state: "graded", grade: "B" } },
  [Q2]: { capture: { state: "graded", grade: "B" }, connection: { state: "graded", grade: "B" } },
  [Q3]: { capture: { state: "graded", grade: "C" }, connection: { state: "unrated" } },
};
const heldRow = (id, address) => ({ bundle_id: id, title: "A photo", source: { address }, capture: { sha256: id === "INFO-H1" ? SHA1 : SHA2 } });
const NOTICE = { id: "FINDING::newer-capture-affects-reference::N1", class: "FINDING", kind: "newer-capture-affects-reference",
  case: { ancestors: [{ id: Q1, depth: 0 }, { id: P, depth: 1 }] }, subject: { kind: "notice", id: "N1", holder: Q1, target: DOC } };

/** The plane a dashboard reads from, keyed by op; a test overrides any op. */
function plane(o = {}) {
  return {
    projectstage: ok({ ok: true, project: P, stage: "investigating", questions: { read: 3, with_legs: 2, concluded: 0 } }),
    image: (r) => ok(r.query.id === P ? { "bundle.md": projectMd } : r.query.id === DOC ? { "bundle.md": docMd } : null),
    projectparticipants: ok({ ok: true, projectId: P, participants: [{ handle: "dev", state: "joined", owner: 1 }, { handle: "mai", state: "joined", owner: 0 },
      { handle: "rosa", state: "joined", owner: 0 }, { handle: "ana", state: "invited", owner: 0 }] }),
    strengthbarof: ok({ ok: true, project: P, bar: { declared: true, source: "project", capture: "B", connection: "B" } }),
    projectquestions: ok({ ok: true, project: P, items: [{ inquiry: Q1, title: "Seven days?" }, { inquiry: Q2, title: "Closed means repaired?" }, { inquiry: Q3, title: "Third?" }], cursor: null }),
    inquirystrength: (r) => ok({ ok: true, target: r.query.id, ...(STRENGTH[r.query.id] || {}) }),
    queue: ok({ ok: true, items: [NOTICE] }),
    heldcaptures: (r) => ok({ ok: true, held: r.query.member
      ? [heldRow("INFO-H1", "the east gate"), heldRow("INFO-H2", "the east gate")] : [heldRow("INFO-H1", "the east gate"), heldRow("INFO-H2", "the east gate")] }),
    casedrafts: ok({ ok: true, drafts: [{ draft_id: "DRAFT-1", case: { case_id: "CASE-1", edition: 3 } }] }),
    reviewcopy: ok({ ok: true, project: P, case: { case_id: "CASE-1", edition: 3, newCase: false }, findings: [{ target: Q1 }, { target: Q2 }] }),
    publishpreflight: ok({ ok: true, ready: true, first: null, blockers: [], steps: [{ pinned: [{ target: Q1 }, { target: Q2 }] }] }),
    timeline: ok({ ok: true,
      world: { items: [
        { event_id: "EVT-1", kind: "adopted", when: { value: "2024-01-12", precision: "day" } },
        { event_id: "EVT-2", kind: "effective", when: { value: "2024-03", precision: "edtf" }, order: { undetermined: true, with: ["EVT-3"] } },
        { event_id: "EVT-3", kind: "issued", when: { value: "2024-04", precision: "edtf" }, order: { undetermined: true, with: ["EVT-2"] } },
        { event_id: "EVT-4", kind: "meeting", when: { value: "2026-09-18", precision: "day" } }], placed_nowhere: [], truncated: false },
      ours: { sources: [{ source: "actions", items: [{ at: "2026-09-19T10:00:00Z", ref: "ACTN-1", label: "Demand to rescind" }] }] } }),
    projectlist: ok({ ok: true, projects: [{ id: "PROJ-2026-0001", name: "Elsewhere" }, { id: P, name: "Pothole repairs", stage: "investigating",
      members: [{ member: "dev", handle: "dev" }, { member: "mai", handle: "mai" }, { member: "f", handle: null, founder: true }],
      activity: [1, 2, 0, 1, 3, 1, 1, 6], lastChange: "2026-10-08T09:00:00Z" }], count: 2, truncated: false, next: null }),
    projectdirectory: ok({ ok: true, projects: [] }),
    ...o,
  };
}
const at = "/app/dash-project/" + P;
const open = async (o = {}, boots = {}) => { const p = await boot({ screens: [SCREEN], plane: plane(o), path: at, ...boots }); await p.settle(); return p; };
const main = (p) => p.doc.getElementById("cs-main");
const said = (el, key, vars) => String(el && el.textContent || "").includes(word(key, vars || {}));
const section = (p, key) => main(p).querySelectorAll("section").find((s) => s.querySelector("h2").textContent === word(key, {}));
const heads = (p) => main(p).querySelectorAll("section h2").map((h) => h.textContent);
const acts = (el) => el.querySelectorAll("button[data-act]").map((b) => b.getAttribute("data-act"));
const fill = (p, v) => { for (const [id, x] of Object.entries(v)) { const el = p.doc.getElementById(id); assert.ok(el, id); el.value = x; } };

test("R79 the screen is registered by this module: `dash-project`, its subject read marked, drawn at /app/dash-project/<project>", async () => {
  const { SCREENS } = await import("../../../src/screens-inquiry/index.mjs");
  const s = SCREENS.find((x) => x.id === "dash-project");
  assert.ok(s && s.reads({ subject: P }).stage.subject === true, "R21: its subject read is marked");
  assert.deepEqual(s.acts.map((a) => a.op).sort(), ["adoptversion", "keepversion", "release"]);
  for (const k of s.words) assert.ok(hasWord(k), k);
  assert.equal(SCREENS.findIndex((x) => x.id === "dash-project"), SCREENS.findIndex((x) => x.id === "project") + 1);
  const p = await open();
  assert.ok(main(p).querySelector("h1"), "the page is drawn");
});

test("R79 R39 R40 the head: the project's title, then its objective, owner by handle and stage in one line; never a record id", async () => {
  const p = await open();
  assert.equal(main(p).querySelector("h1").textContent, "Pothole repairs");
  const line = main(p).querySelector("p.mk-sub");
  assert.ok(line.textContent.includes("Is the city repairing reported potholes"), "the objective, as the record states it");
  assert.ok(said(line, "screen.projects.owner", { handle: "dev" }), "the owner by handle");
  assert.ok(said(line, "screen.project.stage.investigating"), "the stage in its word");
  assert.ok(!main(p).querySelectorAll("h1, h2").some((h) => /PROJ-|INQ-|INFO-/.test(h.textContent)), "R39: no heading is a record id");
  /* R39: a record with no title draws undetermined; R40: the unnamed founder owner by key, never `admin` */
  const q = await open({ image: ok({ "bundle.md": projectMd.replace(/title: "Pothole repairs"\n/, "") }),
    projectparticipants: ok({ ok: true, participants: [{ handle: null, founder: true, state: "joined", owner: 1 }, { handle: "mai", state: "joined", owner: 0 }] }) });
  assert.ok(said(main(q).querySelector("h1"), "state.undetermined", { reason: "" }));
  assert.ok(said(main(q).querySelector("p.mk-sub"), "screen.projects.owner", { handle: word("member.founder.unnamed") }));
  assert.ok(!main(q).textContent.includes("admin"));
});

test("R79 Next for you here: the vouch, the newer version and the ceremony, in that order, the first the one to take now, each the act itself", async () => {
  const p = await open();
  const s = section(p, "screen.dash-project.next.heading");
  const steps = s.querySelectorAll("ol.mk-next > li");
  assert.equal(steps.length, 3);
  assert.ok(said(steps[0], "screen.dash-project.next.vouch", { count: "2", place: "the east gate" }));
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
  assert.deepEqual(p.byOp("publishpreflight")[0].body.targets, [Q1, Q2]);
  /* the section stands under the head, above the glance */
  const h = heads(p);
  assert.ok(h.indexOf(word("screen.dash-project.next.heading")) < h.indexOf(word("screen.dash-project.glance.heading")));
});

test("R79 Next for you here: no step a read does not support; with none, no section; a notice of another project, a preflight not ready and a draft with no edition give none", async () => {
  const none = await open({ heldcaptures: ok({ ok: true, held: [] }), queue: ok({ ok: true, items: [] }), casedrafts: ok({ ok: true, drafts: [] }) });
  assert.equal(section(none, "screen.dash-project.next.heading"), undefined);
  const other = await open({ heldcaptures: ok({ ok: true, held: [] }), casedrafts: ok({ ok: true, drafts: [] }),
    queue: ok({ ok: true, items: [{ ...NOTICE, case: { ancestors: [{ id: "PROJ-2026-0099", depth: 1 }] }, subject: { ...NOTICE.subject, holder: "INQ-2026-0099-other" } }] }) });
  assert.equal(section(other, "screen.dash-project.next.heading"), undefined, "a notice of another project is not a step here");
  const notReady = await open({ heldcaptures: ok({ ok: true, held: [] }), queue: ok({ ok: true, items: [] }),
    publishpreflight: ok({ ok: true, ready: false, first: { code: "X" }, blockers: [], steps: [{ pinned: [{ target: Q1 }] }] }) });
  assert.equal(section(notReady, "screen.dash-project.next.heading"), undefined, "findings that do not meet the bar prepare nothing");
  const noEdition = await open({ heldcaptures: ok({ ok: true, held: [] }), queue: ok({ ok: true, items: [] }),
    casedrafts: ok({ ok: true, drafts: [{ draft_id: "DRAFT-1", case: { case_id: null, edition: null } }] }) });
  assert.equal(section(noEdition, "screen.dash-project.next.heading"), undefined, "no edition stated, no step composed");
  assert.equal(noEdition.byOp("publishpreflight").length, 0);
});

test("R79 the vouch step sends select over the held captures, then release with the handle and her two statements; with one missing nothing is sent", async () => {
  const p = await open({ select: ok({ ok: true, handle: "SEL-1" }), release: ok({ ok: true, released: ["INFO-H1", "INFO-H2"] }) });
  const s = section(p, "screen.dash-project.next.heading");
  await p.click(s.querySelector('button[data-act="release"]'));
  assert.equal(p.byOp("select").length + p.byOp("release").length, 0, "no statement, nothing sent");
  fill(p, { "dp-vouch-0-ack": "They are what the gate cameras gave", "dp-vouch-0-mitigation": "I compared each with the original" });
  await p.click(s.querySelector('button[data-act="release"]'));
  await p.settle();
  const sent = p.byOp("select")[0];
  assert.deepEqual(sent.body.ids, ["INFO-H1", "INFO-H2"]);
  const rel = p.byOp("release")[0];
  assert.deepEqual([rel.query.handle, rel.query.acknowledgment, rel.query.mitigation], ["SEL-1", "They are what the gate cameras gave", "I compared each with the original"]);
});

test("R79 the newer-version step: keeping sends the notice; adopting sends the notice with her reason, and without one the plane's own refusal is drawn by its words", async () => {
  const p = await open({ keepversion: ok({ ok: true }), adoptversion: refusedIn("VERSION_ADOPT_NO_REASON") });
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
  const p = await open();
  const s = section(p, "screen.dash-project.glance.heading");
  const tiles = s.querySelectorAll(".mk-tile");
  const by = (key) => tiles.find((t) => t.textContent.includes(word(key)));
  const q = by("screen.dash-project.tile.questions");
  assert.equal(q.querySelector("b.v").textContent, "3", "the three questions the project holds");
  assert.ok(said(q, "screen.home.area.meetbar", { count: "2" }), "two meet the bar of B and B");
  const ev = by("screen.dash-project.tile.events");
  assert.equal(ev.querySelector("b.v").textContent, "5", "four events of the world lane and one of the team's");
  assert.ok(said(ev, "screen.dash-project.tile.events.undetermined", { n: "2" }), "the two undetermined in order, by its own key");
  const m = by("screen.dash-project.tile.members");
  assert.equal(m.querySelector("b.v").textContent, "3", "the invited member is not a member yet");
  assert.ok(m.textContent.includes("dev, mai, rosa"), "their handles");
  assert.equal(tiles.length, 3);
  assert.ok(!main(p).textContent.includes(word("screen.dash-project.tile.documents")), "the Documents reading has no read: not drawn");
  /* a project with no bar says no count of those that meet it, and none at zero */
  const nobar = await open({ strengthbarof: ok({ ok: true, project: P, bar: { declared: false } }) });
  assert.ok(!said(section(nobar, "screen.dash-project.glance.heading"), "screen.home.area.meetbar", { count: "0" }));
  assert.ok(!main(nobar).textContent.includes(word("screen.home.area.meetbar", { count: "2" })));
  const nonemeet = await open({ inquirystrength: ok({ ok: true, capture: { state: "unrated" }, connection: { state: "unrated" } }) });
  assert.ok(!main(nonemeet).textContent.includes(word("screen.home.area.meetbar", { count: "0" })), "no count at zero");
});

test("R79 The story so far: what they did above the line, what the team did below it, a month-known event never placed, the undetermined said, and the timeline opened", async () => {
  const p = await open();
  const s = section(p, "screen.dash-project.story.heading");
  const evs = s.querySelectorAll(".mk-tl .ev");
  assert.equal(evs.length, 3, "the two whole-dated events they did and the one the team did");
  assert.deepEqual(evs.map((e) => e.getAttribute("class").includes("us")), [false, false, true], "in date order; ours below the line");
  assert.ok(said(evs[0], "screen.timeline.kind", { kind: "adopted" }));
  assert.ok(evs[2].textContent.includes("Demand to rescind"), "the team's own words");
  assert.equal(evs.filter((e) => e.textContent.includes(word("screen.timeline.kind", { kind: "effective" }))).length, 0);
  assert.ok(said(s, "screen.dash-project.story.undetermined", { events: "effective, issued", precision: word("screen.dash-project.precision.edtf") }));
  const link = s.querySelector("a[href='/app/timeline/" + P + "']");
  assert.ok(link && said(link, "shell.glance.timeline"), "Open the timeline");
  assert.equal(p.byOp("timeline")[0].query.set, "ENT-17,EVT-4", "the project's set is the people and events its document cites");
  assert.equal(p.byOp("timeline")[0].query.captures, SHA1 + "," + SHA2);
});

test("R79 Activity: who works on it, how busy it is and when it last changed, from projectlist; the founder unnamed by key", async () => {
  const p = await open();
  const s = section(p, "screen.dash-project.activity.heading");
  const people = s.querySelector(".mk-people");
  assert.ok(people.getAttribute("aria-label").includes(word("shell.glance.people", { n: "3", names: "dev, mai, " + word("member.founder.unnamed") }).replace(/&#39;/g, "'")), "the members' names, the founder unnamed by key");
  assert.equal(people.querySelectorAll("i").length, 3);
  assert.ok(s.querySelector(".mk-spark"), "eight weeks of bars");
  assert.ok(s.querySelector(".mk-spark").getAttribute("aria-label").includes("1, 2, 0, 1, 3, 1, 1, 6"));
  assert.ok(s.textContent.includes(word("screen.projects.lastchange", { date: "" }).split(" ")[0]), "when it last changed");
  assert.ok(!s.textContent.includes(word("screen.dash-project.activity.events", { name: "", count: "", day: "" })), "no named member and count is read, so the line is not drawn");
  /* the list is paged until the project is found */
  const paged = await open({ projectlist: (r) => ok(r.query.after
    ? { ok: true, projects: [{ id: P, name: "x", members: [{ handle: "dev" }], activity: [0, 0, 0, 0, 0, 0, 0, 1], lastChange: null }], truncated: false, next: null }
    : { ok: true, projects: [{ id: "PROJ-2026-0001", name: "Elsewhere" }], truncated: true, next: "PROJ-2026-0001" }) });
  assert.ok(section(paged, "screen.dash-project.activity.heading"));
  assert.equal(paged.byOp("projectlist").length, 2);
  assert.ok(said(section(paged, "screen.dash-project.activity.heading"), "screen.projects.lastchange.none"));
  /* a project the list does not hold draws no Activity */
  const absent = await open({ projectlist: ok({ ok: true, projects: [], truncated: false, next: null }) });
  assert.equal(section(absent, "screen.dash-project.activity.heading"), undefined);
});

test("R79 R20 no section is drawn from a read that failed as if it were empty: each is drawn failed by `cs.state`", async () => {
  const p = await open({ queue: refused("X", "", 500), projectquestions: refused("X", "", 500), projectlist: refused("X", "", 500), heldcaptures: refused("X", "", 500) });
  const states = main(p).querySelectorAll('.cs-state[data-state="failed"]');
  assert.ok(states.length >= 4, "the next steps, the questions, the story's documents and the activity each say so");
  for (const s of states) assert.ok(said(s, "shell.unread") || s.textContent.length > 0);
  const next = section(p, "screen.dash-project.next.heading");
  assert.ok(next.querySelector('.cs-state[data-state="failed"]'));
  assert.ok(!main(p).textContent.includes(word("screen.dash-project.tile.questions")), "no Questions reading from a failed read");
  assert.ok(section(p, "screen.dash-project.activity.heading").querySelector('.cs-state[data-state="failed"]'));
});

test("R79 R20 an empty project draws no empty section and no zero: the head alone", async () => {
  const p = await open({ projectquestions: ok({ ok: true, items: [], cursor: null }), queue: ok({ ok: true, items: [] }), heldcaptures: ok({ ok: true, held: [] }),
    casedrafts: ok({ ok: true, drafts: [] }), timeline: ok({ ok: true, world: { items: [], placed_nowhere: [] }, ours: { sources: [] } }),
    projectlist: ok({ ok: true, projects: [], truncated: false, next: null }),
    image: ok({ "bundle.md": projectMd.replace(/references:\n(  .*\n)+/, "") }),
    projectparticipants: ok({ ok: true, participants: [] }) });
  assert.deepEqual(heads(p), []);
  assert.ok(main(p).querySelector("h1"));
  assert.ok(!/\b0\b/.test(main(p).textContent), "no count at zero");
});

test("R79 R21 bare, not found: only 'Nothing is here' (interface-shell R61); R60 a project she is not in draws its states, no dashboard beneath", async () => {
  const gone = await open({ projectstage: refused("NO_SUCH_PROJECT", "", 404) });
  assert.equal(main(gone).querySelectorAll("section").length, 0);
  assert.equal(["reviewcopy", "publishpreflight", "timeline", "doctitle"].reduce((n, op) => n + gone.byOp(op).length, 0), 0, "no read the screen makes as it draws is made for a project that is not there");
  /* R60: hidden: unavailable b; findable: its name and the way to ask, which the project page holds, never the dashboard */
  const hidden = await open({ projectstage: refused("PROJECT_SEEN_NOT_A_PARTICIPANT", "", 403, { name: "Pothole repairs", owners: [{ handle: "dev" }] }),
    projectparticipants: refused("PROJECT_SEEN_NOT_A_PARTICIPANT", "", 403), strengthbarof: refused("PROJECT_SEEN_NOT_A_PARTICIPANT", "", 403) });
  assert.ok(said(main(hidden), "shell.unavailable.notyours.title"));
  assert.equal(main(hidden).querySelectorAll("section").length, 0);
  const findable = await open({ projectstage: refused("PROJECT_SEEN_NOT_A_PARTICIPANT", "", 403, { name: "Pothole repairs", owners: [{ handle: "dev" }] }),
    projectparticipants: refused("PROJECT_SEEN_NOT_A_PARTICIPANT", "", 403), strengthbarof: refused("PROJECT_SEEN_NOT_A_PARTICIPANT", "", 403),
    projectdirectory: ok({ ok: true, projects: [{ id: P, name: "Pothole repairs" }] }) });
  assert.ok(said(main(findable), "screen.project.notjoined"));
  assert.ok(main(findable).querySelector(`a[href='/app/project/${P}']`) || main(findable).textContent.includes("Pothole repairs"));
  assert.equal(section(findable, "screen.dash-project.next.heading"), undefined);
  assert.equal(findable.byOp("timeline").length + findable.byOp("projectlist").length - hidden.byOp("projectlist").length, 0, "nothing of the dashboard is read for it");
});

test("R79 R20 the module's real SCREENS compose under the shell with `dash-project` among them, each class defined; a request writes nothing", async () => {
  const { SCREENS } = await import("../../../src/screens-inquiry/index.mjs");
  const p = await boot({ screens: SCREENS, plane: plane(), path: at });
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
  const up = (id, extra) => ({ bundle_id: id, title: "A photo", source: { address: "upload:" + id, via: "upload", ...extra }, capture: { sha256: SHA1 } });
  const none = (id) => ({ bundle_id: id, title: "A photo", capture: { sha256: SHA2 } });
  const two = await open({ heldcaptures: ok({ ok: true, held: [up("INFO-U1"), none("INFO-U2")] }), queue: ok({ ok: true, items: [] }), casedrafts: ok({ ok: true, drafts: [] }) });
  const steps = section(two, "screen.dash-project.next.heading").querySelectorAll("ol.mk-next > li");
  assert.equal(steps.length, 1);
  assert.ok(said(steps[0], "screen.dash-project.next.vouch.noplace", { count: "2" }));
  assert.ok(!steps[0].textContent.includes("upload:"), "no address is drawn as a place");
  assert.deepEqual(acts(steps[0]), ["release"]);
  const one = await open({ heldcaptures: ok({ ok: true, held: [up("INFO-U1")] }), queue: ok({ ok: true, items: [] }), casedrafts: ok({ ok: true, drafts: [] }) });
  assert.ok(said(section(one, "screen.dash-project.next.heading"), "screen.dash-project.next.vouch.noplace.one"));
  const mixed = await open({ heldcaptures: ok({ ok: true, held: [heldRow("INFO-H1", "the east gate"), up("INFO-U1")] }), queue: ok({ ok: true, items: [] }), casedrafts: ok({ ok: true, drafts: [] }) });
  const m = section(mixed, "screen.dash-project.next.heading").querySelectorAll("ol.mk-next > li");
  assert.equal(m.length, 2);
  assert.ok(said(m[0], "screen.dash-project.next.vouch.one", { place: "the east gate" }) && !said(m[0], "screen.dash-project.next.vouch", { count: "1", place: "the east gate" }));
  assert.ok(said(m[1], "screen.dash-project.next.vouch.noplace.one"));
  /* the vouch sends the no-place group's own ids */
  const p = await open({ heldcaptures: ok({ ok: true, held: [up("INFO-U1"), none("INFO-U2")] }), queue: ok({ ok: true, items: [] }), casedrafts: ok({ ok: true, drafts: [] }),
    select: ok({ ok: true, handle: "SEL-2" }), release: ok({ ok: true }) });
  fill(p, { "dp-vouch-0-ack": "Mine", "dp-vouch-0-mitigation": "Checked" });
  await p.click(section(p, "screen.dash-project.next.heading").querySelector('button[data-act="release"]'));
  await p.settle();
  assert.deepEqual(p.byOp("select")[0].body.ids, ["INFO-U1", "INFO-U2"]);
});

test("R79 The story so far: the undetermined line names each event and the precision it is dated to by the precision key; the Events note is drawn only where an order is undetermined", async () => {
  for (const code of ["day", "minute", "second", "edtf"]) {
    const items = ["EVT-2", "EVT-3"].map((id, i) => ({ event_id: id, kind: i ? "issued" : "effective", when: { value: "2024-03", precision: code }, order: { undetermined: true } }));
    const p = await open({ timeline: ok({ ok: true, world: { items, placed_nowhere: [] }, ours: { sources: [] } }) });
    assert.ok(said(section(p, "screen.dash-project.story.heading"), "screen.dash-project.story.undetermined", { events: "effective, issued", precision: word("screen.dash-project.precision." + code) }), code);
    assert.ok(said(section(p, "screen.dash-project.glance.heading"), "screen.dash-project.tile.events.undetermined", { n: "2" }), code);
  }
  const settled = await open({ timeline: ok({ ok: true, world: { items: [{ event_id: "EVT-1", kind: "adopted", when: { value: "2024-01-12", precision: "day" } }], placed_nowhere: [] }, ours: { sources: [] } }) });
  assert.ok(!main(settled).textContent.includes(word("screen.dash-project.tile.events.undetermined", { n: "0" })), "no count at zero");
  assert.ok(!said(section(settled, "screen.dash-project.glance.heading"), "screen.dash-project.tile.events.undetermined", { n: "1" }));
});
