/* screens-investigate R61 (T51 fix round 10; K5271; live walk C and E): what the walkers met on the money trail, the standard, the timeline, the connection graph and the
   due-date page. Over `store-request`'s world (K5148, K5054): the real store behind the page's door and a real sign-in; every state is made by the member's own acts and every
   value asserted is read back from the world's answers. Scripted: only a record the live copy holds that this build does not make (`changing`, K5044 (1)). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { inWorld, openAs, settled, rewrite, readHeld, refused, declareStandard } from "./world.mjs";
import { main, fill, press, word, drew, dayOf } from "./fixtures.mjs";

const REASON = "The document says so.";
const DOC = { kind: "document" };
const resultOf = (a) => (a && a.json && a.json.result !== undefined ? a.json.result : a && a.json);
const changing = (world, me, op, fn) => rewrite(world, me, (req, a) => (a && a.json && a.json.result && req.url.includes("op=" + op)
  ? { ...a, json: { ...a.json, result: fn(a.json.result) } } : a));
const hex = (s) => createHash("sha256").update(s).digest("hex");
const iso = (world) => new Date(world.now()).toISOString().replace(/\.\d{3}Z$/, "Z");
/** A project (as `recipes.project` starts one) whose document cites `targets`, as a project's document cites the people and events it follows. */
async function projectCiting(world, me, title, targets) {
  const now = iso(world);
  const refs = targets.length ? ["references:", ...targets.flatMap((t) => [`  - target: ${t}`, "    rel: cites", "    status: active"])] : [];
  const text = ["---", "object_type: project", "title: " + JSON.stringify(title), "objective: " + JSON.stringify(title), "current_state: forming", `created: "${now}"`, `last_updated: "${now}"`,
    ...refs, "---", "", "## Session Log", "", `### Session ${now} | Formation | interactive`, "Trigger: test", "Changes: created.", ""].join("\n");
  const made = await me.act("promote", { body: { base: null, snapKey: now.replace(/[-:]/g, "") + "_" + hex(title).slice(0, 8),
    meta: { object_type: "project", title, current_state: "forming", created: now, last_updated: now }, files: [{ path: "bundle.md", text }], register: [], visibility: "discoverable" } });
  return made.bundleId;
}
const plain = (t) => String(t).replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: "\"", "#39": "'" }[e]));

/* ---- (1) money: the period's start is required, said before anything is sent ---- */

async function trailWorld({ place }) {
  const { world, me } = await inWorld();
  if (place) await world.recipes.profiles(me, ["oakland-alameda"]);
  const project = await world.recipes.project(me, "Pothole repairs");
  const lease = await world.recipes.hold(me, "Lease amendment 1", "The adopted budget moves 4,200,000 dollars from the Sewer Fund to the General Fund.", project);
  const trail = await world.recipes.trail(me, project, "Stormwater fund transfers");
  return { world, me, project, lease, trail };
}
const readFigure = async (p, lease, dates) => {
  fill(p, { "mf-amount": "4200000.00", "mf-asread": "4,200,000", "mf-doc": lease.sha, ...dates });
  await press(p, "recordfact", { el: main(p).querySelectorAll('button[data-act="recordfact"]')[0], reason: REASON });
  await settled(p);
};

test("R61 (1) Money: a figure read with the period's start empty is refused before anything is sent, the sentence naming the start field and not 'left empty'; control: a start sends", async () => {
  const { world, me, lease, trail } = await trailWorld({ place: true });
  const p = await openAs(world, me, "/app/money/" + trail);
  await readFigure(p, lease, { "mf-from-date": "", "mf-to-date": "" });
  assert.equal(p.byOp("recordfact").length, 0, "nothing is sent");
  const said = main(p).querySelector('[data-gap="refused"][data-refusal="NO_PERIOD"]');
  assert.ok(said, "the refusal is drawn");
  assert.ok(said.textContent.includes(word("screen.money.f.periodfrom")), "it names the start field");
  assert.ok(said.textContent.includes(word("money.index.a_period_states_its_start")), "and says a period needs one");
  assert.ok(!main(p).textContent.includes(word("refusal.BAD_VALIDITY")), "never 'left empty when the passage does not state it'");
  assert.ok(!said.textContent.includes(word("screen.group.timezone")), "a team that holds a time zone is not sent to set one");
  /* an end alone is no start */
  await readFigure(p, lease, { "mf-from-date": "", "mf-to-date": "2022-06-30" });
  assert.equal(p.byOp("recordfact").length, 0, "an end alone sends nothing");
  /* control: with a start the figure is sent */
  await readFigure(p, lease, { "mf-from-date": "2021-07-01", "mf-to-date": "2022-06-30" });
  assert.equal(p.byOp("recordfact").length, 1, "a start sends");
  assert.ok(!main(p).querySelector('[data-refusal="NO_PERIOD"]'), "and the refusal is gone");
  assert.equal(p.byOp("recordfact")[0].body.period.from, "2021-07-01");
});

test("R61 (1) Money: with no time zone held the refusal names the time-zone setting too, as a door to it; control: a team that holds one names none", async () => {
  const none = await trailWorld({ place: false });
  assert.equal((await none.me.read("factstatus", {})).facts.filter((f) => f.fact && f.fact.fact === "time_zone" && f.governs && f.governs.value).length, 0, "the team holds no time zone");
  const p = await openAs(none.world, none.me, "/app/money/" + none.trail);
  await readFigure(p, none.lease, { "mf-from-date": "", "mf-to-date": "" });
  assert.equal(p.byOp("recordfact").length, 0, "nothing is sent");
  const said = main(p).querySelector('[data-refusal="NO_PERIOD"]');
  assert.ok(said, "the refusal is drawn");
  assert.ok(said.textContent.includes(word("screen.money.f.periodfrom")), "it names the start field");
  assert.ok(said.textContent.includes(word("money.index.the_period_states_no_zone")), "it says no time zone is held");
  const door = said.querySelector('a[href="/app/group"]');
  assert.ok(door && door.textContent.includes(word("screen.group.timezone")), "and names the setting as a door to it");
  const held = await trailWorld({ place: true });
  assert.ok((await held.me.read("factstatus", {})).facts.some((f) => f.fact && f.fact.fact === "time_zone" && f.governs && f.governs.value), "this team holds one");
  const q = await openAs(held.world, held.me, "/app/money/" + held.trail);
  await readFigure(q, held.lease, { "mf-from-date": "", "mf-to-date": "" });
  assert.ok(!main(q).querySelector('[data-refusal="NO_PERIOD"] a'), "control: no door to the setting");
});

/* ---- (2) standard: the issuer by its label; a whole-document passage whole to a stated bound ---- */

const lines = (n) => Array.from({ length: n }, (_, i) => `Section ${i + 1}. The council sets the rule number ${i + 1}.`).join("\n\n");
async function standardWorld(n) {
  const { world, me } = await inWorld();
  const project = await world.recipes.project(me, "Rent rules");
  const body = (await me.act("entitycreate", { body: { kind: "body", label: "City of Walkton", note: "The city." } })).entity_id;
  const doc = await world.recipes.hold(me, "Ordinance.txt", lines(n), project);
  const units = await readHeld(world, me, doc.sha);
  const std = await declareStandard(me, { cite: "Ordinance 8.22", kind: "ordinance", issuer: body, sha: doc.sha, extent: DOC });
  return { world, me, project, body, doc, units, std };
}

test("R61 (2) Standard: the issuer is drawn by its label, on the standard's page and in the project's list, never as ENT-; control: a typed name is drawn as typed", async () => {
  const S = await standardWorld(5);
  const held = await S.me.read("standard", { query: { id: S.std } });
  assert.match(held.issuer, /^ENT-/, "the store holds the issuer as the body's id");
  assert.equal(held.owner.label, "City of Walkton", "and answers its label");
  for (const path of ["/app/standard/" + S.std, "/app/standard/" + S.std + "/" + S.project, "/app/standard/" + S.project]) {
    const p = await openAs(S.world, S.me, path);
    const text = main(p).textContent + " " + p.doc.documentElement.outerHTML.match(/data-tip="[^"]*"/g)?.join(" ");
    assert.ok(main(p).textContent.includes("City of Walkton"), path + ": the label is drawn");
    assert.ok(!/ENT-\d/.test(text), path + ": no entity id is drawn");
  }
  /* control: a name typed by the member (no entity) is drawn as she typed it */
  const typed = await declareStandard(S.me, { cite: "Policy 9.1", kind: "policy", issuer: "Public Works Department", sha: S.doc.sha, extent: S.units[0].extent });
  const q = await openAs(S.world, S.me, "/app/standard/" + typed);
  assert.ok(main(q).textContent.includes("Public Works Department"), "control: the typed name");
});

test("R61 (2) Standard: a passage that is the whole document is drawn whole, every line; control: past the bound it says how many were left, by a gap mark", async () => {
  const S = await standardWorld(5);
  assert.equal(S.units.length, 5, "the reading holds five lines");
  const p = await openAs(S.world, S.me, "/app/standard/" + S.std);
  const passage = main(p).querySelector("blockquote[data-words]");
  assert.ok(passage, "the words are drawn");
  for (const u of S.units) assert.ok(passage.textContent.includes(String(u.text).trim()), "line drawn: " + String(u.text).trim());
  assert.ok(!main(p).querySelector("[data-passage-more]"), "nothing is left, no mark");
  /* control: more than the bound */
  const big = await standardWorld(260);
  assert.equal(big.units.length, 260);
  const q = await openAs(big.world, big.me, "/app/standard/" + big.std);
  const drawn = main(q).querySelector("blockquote[data-words]");
  const left = main(q).querySelector("[data-passage-more]");
  assert.ok(drawn && left, "the passage and the mark");
  const shown = big.units.filter((u) => drawn.textContent.includes(String(u.text).trim())).length;
  assert.ok(shown > 5 && shown < 260, "drawn to a bound: " + shown);
  assert.ok(left.textContent.includes(word("screen.timeline.more.people", { n: String(260 - shown) })), "the mark says how many were left");
  assert.ok(left.querySelector('[data-gap="undetermined"]'), "a gap mark");
});

/* ---- (3) timeline: events named by kind, date and document; an undated one drawn with who took part ---- */

async function eventWorld() {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const entity = async (kind, label) => (await me.act("entitycreate", { body: { kind, label, note: "Named in the minutes." } })).entity_id;
  const org = await entity("office", "Public Works Director");
  const chen = await entity("person", "Lin Chen");
  const project = await projectCiting(world, me, "Pothole repairs", [org]);
  const d1 = await world.recipes.hold(me, "Lease amendment 1", "The amendment was adopted by the council.", project);
  const d2 = await world.recipes.hold(me, "Rent schedule", "The rent schedule for the year.", project);
  const fact = async (d, value) => (await me.act("recorddatedfact", { body: { captureSha: d.sha, extent: DOC, kind: "adopted", value, method: "stated in the document" } })).dated_fact.dated_fact_id;
  const ev = async (b) => (await me.act("createevent", { body: b })).event_id;
  const dated = await ev({ kind: "meeting", attestations: [{ datedFactId: await fact(d1, "2024-01-12") }], concerns: [org] });
  const dated2 = await ev({ kind: "meeting", attestations: [{ datedFactId: await fact(d2, "2024-03-15") }], concerns: [org] });
  const undated = await ev({ kind: "meeting", attestations: [{ captureSha: d2.sha, extent: DOC }], concerns: [org], participants: [{ entityId: chen, role: "actor", attestation: 0 }] });
  return { world, me, org, chen, project, d1, d2, dated, dated2, undated };
}

test("R61 (3) Timeline: each event the forms offer is named by its kind, its date (or undated) and its document's title, never its id; control: two meetings differ by date and document", async () => {
  const E = await eventWorld();
  const p = await openAs(E.world, E.me, "/app/timeline/" + E.project);
  const kind = word("screen.timeline.evkind.meeting");
  const want = {
    [E.dated]: `${kind} · ${dayOf("2024-01-12")} · Lease amendment 1`,
    [E.dated2]: `${kind} · ${dayOf("2024-03-15")} · Rent schedule`,
    [E.undated]: `${kind} · ${plain(word("screen.timeline.undated.head"))} · Rent schedule`,
  };
  for (const id of ["tl-event", "tl-to"]) {
    const options = p.doc.getElementById(id).querySelectorAll("option").filter((o) => o.getAttribute("value"));
    assert.deepEqual(options.map((o) => [o.getAttribute("value"), o.textContent]).sort(), Object.entries(want).sort(), id + ": kind, date or undated, and the document");
    assert.ok(!options.some((o) => /EVT-/.test(o.textContent)), id + ": no event id");
  }
});

test("R61 (3) Timeline: an event no date places is drawn with who took part and a link to each, as a dated one is; control: an undated event with none says nobody is recorded", async () => {
  const E = await eventWorld();
  const none = (await E.me.act("createevent", { body: { kind: "meeting", attestations: [{ captureSha: E.d1.sha, extent: DOC }], concerns: [E.org] } })).event_id;
  const p = await openAs(E.world, E.me, "/app/timeline/" + E.project);
  const row = main(p).querySelector(`[data-event="${E.undated}"]`);
  assert.ok(row, "the undated event is a drawn item");
  assert.ok(row.querySelectorAll("a.cs-ref").some((a) => a.getAttribute("href") === "/app/person/" + E.chen), "its participant is a link to the person");
  drew(row, "screen.timeline.role", { role: word("screen.timeline.roles.actor") });
  const bare = main(p).querySelector(`[data-event="${none}"]`);
  assert.ok(bare, "control: the undated event with no participant");
  drew(bare, "screen.timeline.nobody");
});

/* ---- (4) the graph: a `capture:` source is a reference ---- */

test("R61 (4) Connect: a step whose evidence is a `capture:<hex>` source is drawn as a reference to the document, never as the 64 characters; control: another source is drawn as before", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const entity = async (kind, label) => (await me.act("entitycreate", { body: { kind, label, note: "Named in the minutes." } })).entity_id;
  const chen = await entity("person", "L. Chen"), alvarez = await entity("person", "R. Alvarez");
  const roster = await world.recipes.hold(me, "Roster.txt", "L. Chen and R. Alvarez work together.");
  await me.act("recordline", { body: { kind: "associate_of", from: chen, to: alvarez, valid: { from: "2020-01-01", to: "2030-01-01" }, basis: { captureSha: roster.sha, extent: DOC }, reason: "The roster says so." } });
  const sourced = (src) => changing(world, me, "exploregraph", (r) => ({ ...r, steps: r.steps.map((s) => ({ ...s, evidence: [{ source: src }] })) }));
  const p = await openAs(world, me, "/app/explore/" + chen, { plane: { exploregraph: sourced("capture:" + roster.sha) } });
  const g = main(p).querySelector(".mk-graph");
  assert.ok(g.querySelectorAll(".cs-card").some((r) => r.textContent === word("screen.explore.g.cited")), "a reference to the document (its card), as Explore's chains draw it");
  assert.ok(!g.textContent.includes(roster.sha) && !/[0-9a-f]{64}/.test(g.textContent), "no fingerprint is drawn");
  assert.ok(!g.textContent.includes("capture:"), "nor the source's own spelling");
  /* control: a source of another kind keeps being drawn as written */
  const q = await openAs(world, me, "/app/explore/" + chen, { plane: { exploregraph: sourced("the minutes of June") } });
  assert.ok(main(q).querySelector(".mk-graph").textContent.includes("the minutes of June"), "control: drawn as written");
});

/* ---- (5) due date: no sentence points to a box that is not there ---- */

test("R61 (5) Due date: a refusal that carries no deadline draws no sentence pointing to a box (control: R59's test, a refusal that carries deadlines, draws the box)", async () => {
  const { world, me } = await inWorld();
  const project = await world.recipes.project(me, "Rent schedules");
  const request = async () => (await me.act("actioncreate", { body: { document: ["---", "id: PENDING", "object_type: action", 'title: "The rent schedules"', "current_state: planned",
    'created: "2026-10-01T12:00:00Z"', 'last_updated: "2026-10-01T12:00:00Z"', "project: " + project, 'action_kind: "records_request"', "counterparty:", '  state: "named"', '  role: "City Clerk"', '  body: "City Council"',
    "---", "", "The rent schedules.", ""].join("\n") } })).id;
  const id = await request();
  const p = await openAs(world, me, "/app/due-date/" + id);
  await press(p, "clockpropose", { reason: REASON });
  const refusal = await refused(world, me, "clockpropose", p.byOp("clockpropose")[0].body);
  assert.equal(refusal.reason, "NO_SUCH_RULE");
  assert.deepEqual(refusal.deadlines, [], "the team's rules list no deadline");
  assert.ok(!main(p).querySelector("[data-rules]"), "no box is drawn");
  const said = main(p).querySelector('[data-gap="refused"]');
  assert.ok(said, "the refusal is drawn");
  assert.ok(!said.textContent.includes("box below") && !said.textContent.includes(word("refusal.NO_SUCH_RULE")), "no sentence points to a box");
  assert.ok(said.textContent.trim().length > 0, "it says something");
});
