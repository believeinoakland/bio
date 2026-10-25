/* screens-investigate R3: a project's timeline, on interface-shell's served page over `store-request`'s world (K5044, K5054): the real store behind the page's
   door and a real sign-in. Each state a test draws is made by the member's own real acts (`entitycreate`, `recorddatedfact`, `createevent`, `progressiondefine`,
   `thread`, `actioncreate` ...); the values a test asserts are read back from the world's own answers. Three things the world does not make stay scripted over the
   world's real answer (`rewrite`, K5044 (1)): a capture's grade (a member's upload is never graded; only a fetched one is), and the one record the live copy may
   hold that this build does not make (a bare-string `grade_why`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { inWorld, openAs, refused, rewrite } from "./world.mjs";
import { main, actsIn, button, fill, press, word, drew, notDrew, dayOf, hasWord } from "./fixtures.mjs";

const REASON = "The minutes record it.";
const hex = (s) => createHash("sha256").update(s).digest("hex");
const resultOf = (a) => (a && a.json && a.json.result !== undefined ? a.json.result : a && a.json);
const iso = (world) => new Date(world.now()).toISOString().replace(/\.\d{3}Z$/, "Z");
const DOC = { kind: "document" };
const OFFICE_REF = [{ kind: "office", key: "public-works", label: "Public Works Director" }];

/** A file the member holds, as `recipes.hold` holds it, with the reading the document carries: the references (`entities`) its reading names, so the record can
 *  resolve it to an entity (`resolve`), as a recognised document is. Answers `{sha, bundle}`. */
async function holdRead(world, me, name, text, project, entities = []) {
  const up = await world.door({ url: `/api/?${new URLSearchParams({ op: "captureupload", statement: name, name })}`,
    init: { method: "POST", headers: { "content-type": "text/plain" }, body: new TextEncoder().encode(text) } }, me);
  const doc = resultOf(up) && resultOf(up).document;
  assert.ok(doc && doc.capture, "the upload is held");
  const now = iso(world);
  const id = (await me.read("allocid", { query: { prefix: "INFO", year: now.slice(0, 4) } })).id + "-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const sha = doc.capture.sha256;
  const front = ["---", "id: " + id, "object_type: information", "schema: information@2", "title: " + JSON.stringify(name), "current_state: collected", "prior_state: null",
    "created: " + now, "last_updated: " + now, "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []", "state_history: []", "annotations_open: 0",
    "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged", "content_hash: sha256:" + hex(sha),
    "source:", "  locator: " + JSON.stringify(doc.locator || "upload"), "  authority: member-entered", "  retrieved: " + now, "monitoring:", "  enabled: false", "  frequency: none",
    ...(project ? ["project: " + project] : []), "---", "", "## Summary", "", name, "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
  const prov = JSON.stringify({ documents: [{ ...doc, reading: { content_type: "text/plain", found: entities.length > 0, entities, at: now } }] }, null, 1);
  const dataset = JSON.stringify({ documents: [{ bytes: doc.capture.bytes, locator: doc.locator || "upload", sha256: sha }] });
  const len = (s) => new TextEncoder().encode(s).length;
  const files = [{ path: "bundle.md", text: front, bytes: len(front), sha256: hex(front) }, { path: "data/provenance.json", text: prov, bytes: len(prov), sha256: hex(prov) },
    { path: "data/dataset.json", text: dataset, bytes: len(dataset), sha256: hex(dataset) }, { path: doc.file, blobSha: sha, sha256: sha, bytes: doc.capture.bytes }];
  const register = [{ sha256: sha, path: doc.file, encoding: doc.capture.encoding, bytes: doc.capture.bytes }];
  const made = await me.act("promote", { body: { bundleId: id, base: null, snapKey: now.replace(/[-:]/g, "") + "_" + hex(id).slice(0, 8),
    meta: { object_type: "information", title: name, current_state: "collected", created: now, last_updated: now }, files, register } });
  return { sha, bundle: made.bundleId || id };
}

/** A project (as `recipes.project` starts one) whose document cites `targets`, as a project's document cites the people, events and questions it follows. */
async function projectCiting(world, me, title, targets) {
  const now = iso(world);
  const refs = targets.length ? ["references:", ...targets.flatMap((t) => [`  - target: ${t}`, "    rel: cites", "    status: active"])] : [];
  const text = ["---", "object_type: project", "title: " + JSON.stringify(title), "objective: " + JSON.stringify(title), "current_state: forming", `created: "${now}"`, `last_updated: "${now}"`,
    ...refs, "---", "", "## Session Log", "", `### Session ${now} | Formation | interactive`, "Trigger: test", "Changes: created.", ""].join("\n");
  const made = await me.act("promote", { body: { base: null, snapKey: now.replace(/[-:]/g, "") + "_" + hex(title).slice(0, 8),
    meta: { object_type: "project", title, current_state: "forming", created: now, last_updated: now }, files: [{ path: "bundle.md", text }], register: [], visibility: "discoverable" } });
  return made.bundleId;
}

/** A question the team asks (an inquiry), as the record holds one. Answers its id. */
async function question(world, me, title) {
  const now = iso(world);
  const id = (await me.read("allocid", { query: { prefix: "INQ", year: now.slice(0, 4) } })).id + "-seven-days";
  const text = ["---", "id: " + id, "object_type: inquiry", "schema: inquiry@1", "title: " + JSON.stringify(title), "current_state: open", "prior_state: null", "references: []",
    "state_history: []", "surfaced_by: human", "---", "", "## Question", "", title, "", "## Session Log", "", "## Review Notes", ""].join("\n");
  const made = await me.act("promote", { body: { bundleId: id, base: null, snapKey: now.replace(/[-:]/g, "") + "_" + hex(id).slice(0, 8),
    meta: { object_type: "inquiry", title, current_state: "open", created: now, last_updated: now }, files: [{ path: "bundle.md", text }], register: [] } });
  return made.bundleId || id;
}

const STAGES = (loose) => [{ key: "sent", label: "Request sent", after: null, within: null, required: "always", cardinality: "1" },
  { key: "determination", label: "Determination", after: "sent", within: "10 days", required: "unless_exception", cardinality: loose ? "0..n" : "0..1" }];

/** The world of a project that follows the Public Works Director's office: the people and the question its document cites; two documents it holds (each reading
 *  names the office, and `resolve` ties it); three dated facts; a vote of three, two meetings whose order no date settles, a statement no date places; a records
 *  request the team sent (`ours`); a progression `pra` declared twice and threaded for the office with the first document at its first step, dated by a day
 *  the member stated (`matter`). `bare` makes the project and the people alone. */
async function scene({ bare = false, cites = true, ours = false, matter = false } = {}) {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const org = (await me.act("entitycreate", { body: { kind: "office", label: "Public Works Director", note: "The city's office for repairs." } })).entity_id;
  const chen = (await me.act("entitycreate", { body: { kind: "person", label: "Lin Chen", note: "Council member who moved the vote." } })).entity_id;
  const voter = (await me.act("entitycreate", { body: { kind: "person", label: "Dev Patel", note: "Council member who voted against." } })).entity_id;
  const inq = await question(world, me, "Is the city repairing reported potholes within seven days?");
  const project = await projectCiting(world, me, "Pothole repairs", cites ? [org, inq] : [inq]);
  const s = { world, me, org, chen, voter, inq, project };
  if (bare) return s;
  s.d1 = await holdRead(world, me, "Lease amendment 1", "The amendment was adopted by the council.", project, OFFICE_REF);
  s.d2 = await holdRead(world, me, "Rent schedule", "The rent schedule for the year.", project, OFFICE_REF);
  const fact = async (d, kind, value) => (await me.act("recorddatedfact", { body: { captureSha: d.sha, extent: DOC, kind, value, method: "stated in the document" } })).dated_fact.dated_fact_id;
  s.f1 = await fact(s.d1, "adopted", "2024-01-12");
  s.f2 = await fact(s.d1, "adopted", { value: "2024-03", precision: "edtf" });
  s.f3 = await fact(s.d2, "adopted", "2024-03-15");
  s.df = await fact(s.d1, "received", "2026-09-01");
  const ev = async (b) => (await me.act("createevent", { body: b })).event_id;
  s.e1 = await ev({ kind: "vote", attestations: [{ datedFactId: s.f1 }], concerns: [org],
    participants: [{ entityId: org, role: "decider", attestation: 0 }, { entityId: chen, role: "voted", voteValue: "yes", attestation: 0 }, { entityId: voter, role: "voted", voteValue: "no", attestation: 0 }] });
  s.e2 = await ev({ kind: "meeting", attestations: [{ datedFactId: s.f2 }], concerns: [org] });
  s.e3 = await ev({ kind: "meeting", attestations: [{ datedFactId: s.f3 }], concerns: [org] });
  s.e9 = await ev({ kind: "statement", attestations: [{ captureSha: s.d1.sha, extent: DOC }], concerns: [org] });
  if (ours) {
  const doc = ["---", "object_type: action", "title: Records request for the rent schedules", "current_state: planned", `created: "${iso(world)}"`, `last_updated: "${iso(world)}"`,
    "counterparty:", "  state: named", "  role: Director", "  body: City of Oakland", "  entity_id: " + org, "action_kind: records_request", "project: " + project, "---", "", "A request.", ""].join("\n");
  s.act = (await me.act("actioncreate", { body: { document: doc } })).id;
  await me.act("actioncorrespond", { query: { target: s.act, direction: "sent", at: "2026-09-04", medium: "email", party: "City Clerk", account: "I emailed the clerk for the rent schedules." }, body: {} });
  }
  if (!matter) return s;
  for (const d of [s.d1, s.d2]) await me.act("resolve", { body: { captureSha: d.sha } });
  await me.act("progressiondefine", { body: { progressionKey: "pra", label: "A public records request", basis: "first", citation: "Gov. Code 7922.535", stages: STAGES(true) } });
  await me.act("progressiondefine", { body: { progressionKey: "pra", label: "A public records request", basis: "the agency determines within 10 days", citation: "Gov. Code 7922.535", stages: STAGES(false) } });
  await me.act("thread", { body: { progressionKey: "pra", entityId: org, placements: [{ stage: "sent", captureSha: s.d1.sha, datedFact: s.df }] } });
  return s;
}

const pageOf = (s, path = "") => openAs(s.world, s.me, "/app/timeline/" + s.project + path, {});
const matterAt = (s) => "/matter/pra/" + s.org;
const timelineOf = (s) => s.me.read("timeline", { query: { set: s.org, captures: [s.d1.sha, s.d2.sha].join(",") } });
/** The world's real timeline answer with a capture's grade set (a member's upload is never graded, so the grade is the one scripted line, K5044 (1)). */
const graded = (s, edit) => rewrite(s.world, s.me, (req, a) => {
  const r = resultOf(a);
  if (!r || !r.world) return a;
  const w = JSON.parse(JSON.stringify(r.world));
  edit(w);
  return { ...a, json: { ...a.json, result: { ...r, world: w } } };
});
/** The overdue finding the record's proposals feed holds for the matter of `entity` in `pra`: it carries `says`, the finding's own sentence (`progressions` R45). */
const overdueOf = async (s, entity) => {
  const feed = await s.me.read("proposals");
  const mine = (feed.instances || []).find((i) => i.progression_key === "pra" && i.entity_id === entity);
  const f = mine && mine.findings.find((x) => x.kind === "overdue_successor");
  assert.ok(f && f.says, "the proposals feed holds the finding and its sentence");
  return f;
};
/** The world's `instance` answer with each finding's sentence (`says`) from the proposals feed, as `progressions` R45 describes the finding: the one scripted
 *  line of state b (K5044 (1)): this build's `instance` read does not carry it. */
const saying = async (s) => {
  const feed = await s.me.read("proposals");
  return rewrite(s.world, s.me, (req, a) => {
    const r = resultOf(a);
    if (!r || !Array.isArray(r.findings)) return a;
    const mine = (feed.instances || []).find((i) => i.progression_key === req.query.key && i.entity_id === req.query.id);
    const said = new Map(((mine && mine.findings) || []).filter((f) => f.kind === "overdue_successor").map((f) => [f.stage_key, f.says]));
    return { ...a, json: { ...a.json, result: { ...r, findings: r.findings.map((f) => (said.has(f.stage_key) ? { ...f, says: said.get(f.stage_key) } : f)) } } };
  });
};
const heldRows = async (s) => (await s.me.read("heldcaptures", { query: { project: s.project, limit: "200", state: "held_and_vouched", fields: "picker" } })).held;

test("R3 reads timeline over the project's set (the people and events its document cites), and each event for who took part and its grade", async () => {
  const s = await scene();
  const p = await pageOf(s);
  assert.equal(p.byOp("image")[0].query.id, s.project);
  assert.equal(p.byOp("timeline")[0].query.set, s.org);
  assert.equal(p.byOp("event").length, 0, "R20: participants and grades come with the timeline, one read, not one per event");
  const crumbs = p.root().querySelector(".cs-crumbs").textContent;
  assert.ok(crumbs.includes("Pothole repairs") && crumbs.includes(word("screen.timeline.name")), "the path: the project as read, then the screen");
});

test("R3 two lanes, \"What they did\" and \"What we did\"; each event with its date as precise as its source states it, who decided or took part, and its grade", async () => {
  const s = await scene({ ours: true });
  const read = await timelineOf(s);
  const p = await openAs(s.world, s.me, "/app/timeline/" + s.project, { plane: { timeline: graded(s, (w) => {
    w.items[0].grade = "B";
    for (const x of w.items[0].participants) x.grades.attestation = "B";
  }) } });
  const world = main(p).querySelector('[data-lane="world"]'), ours = main(p).querySelector('[data-lane="ours"]');
  assert.equal(world.querySelector("h2").textContent, word("screen.timeline.lane.world"));
  assert.equal(ours.querySelector("h2").textContent, word("screen.timeline.lane.ours"));
  const evs = world.querySelectorAll("[data-event]");
  assert.equal(evs[0].getAttribute("data-event"), s.e1, "the earliest first");
  assert.equal(evs[0].querySelector(".mk-date").textContent, dayOf(read.world.items[0].when.value));
  assert.equal(evs[1].querySelector(".mk-date").textContent, word("screen.timeline.month", { month: word("date.month.march"), year: "2024" }));
  drew(evs[0], "screen.timeline.role", { role: word("screen.timeline.roles.decider") });
  assert.equal(evs[0].querySelector(".cs-grade").textContent, word("mark.scale.capture.name") + "B");
  const sent = read.ours.sources.flatMap((x) => x.items).find((x) => x.ref.startsWith(s.act));
  assert.ok(sent && ours.textContent.includes(sent.label), "what we did: the request the team sent");
  assert.ok(!world.textContent.includes(sent.label), "never mixed");
});

test("R3 an event whose order is undetermined is drawn so, with the evidence that would order it, never guessed into order; undated events are listed apart", async () => {
  const s = await scene();
  const p = await pageOf(s);
  const ev = main(p).querySelector(`[data-event="${s.e2}"]`);
  assert.ok(ev.querySelector('.cs-gap[data-gap="undetermined"]'));
  drew(ev, "screen.timeline.order.why", { with: s.e3 });
  drew(ev, "screen.timeline.order.evidence");
  assert.deepEqual(actsIn(ev).sort(), ["findin", "recorddatedfact", "relate"]);
  assert.equal(main(p).querySelector(`[data-event="${s.e1}"] .cs-gap[data-gap="undetermined"]`), null, "an ordered event carries no such mark (control)");
  const undated = main(p).querySelectorAll("section").find((x) => x.querySelector("h2") && x.querySelector("h2").textContent === word("screen.timeline.undated.head"));
  drew(undated, "screen.timeline.undated.apart");
  drew(undated, "screen.timeline.kind", { kind: "statement" });
  assert.deepEqual((await timelineOf(s)).world.placed_nowhere.map((i) => i.event_id), [s.e9], "the one event no date places");
  assert.equal(main(p).querySelector('[data-lane="world"]').textContent.includes(s.e9), false);
});

test("R3 createevent from a passage; addparticipant; relate \"Link events\" and \"Cite which came first\"; recorddatedfact (a day or a month); each read again after", async () => {
  const s = await scene();
  const sam = (await s.me.act("entitycreate", { body: { kind: "person", label: "Sam Ortiz", note: "Council member." } })).entity_id;
  const p = await pageOf(s);
  const shas = (await heldRows(s)).map((r) => r.capture.sha256);
  const eventsOf = async () => { const w = (await timelineOf(s)).world; return [...w.items, ...w.placed_nowhere]; };
  const before = (await eventsOf()).map((i) => i.event_id);
  fill(p, { "tl-doc": s.d1.sha, "tl-kind": "vote" });
  const reads = p.byOp("timeline").length;
  await press(p, "createevent", { reason: REASON });
  assert.deepEqual(p.byOp("createevent")[0].body, { kind: "vote", attestations: [{ captureSha: s.d1.sha, extent: DOC }], reason: REASON }, "C54: attested by the passage chosen, tied to no person the page guessed");
  assert.ok(p.byOp("timeline").length > reads, "the timeline is read again");
  assert.equal(p.byOp("timeline").at(-1).query.set, s.org, "by the set the project's document names, and by its captures (events R53), not by a list the page kept");
  assert.equal(p.byOp("timeline").at(-1).query.captures, shas.join(","));
  const made = (await eventsOf()).filter((i) => !before.includes(i.event_id));
  assert.equal(made.length, 1, "the event is held");
  assert.equal(made[0].kind, "vote");
  assert.ok(main(p).querySelector(`[data-event="${made[0].event_id}"]`) || main(p).textContent.includes(made[0].event_id), "and drawn");
  fill(p, { "tl-doc": s.d1.sha, "tl-event": s.e1, "tl-who": sam, "tl-role": "voted", "tl-vote": "yes" });
  await press(p, "addparticipant", { reason: REASON });
  assert.deepEqual(p.byOp("addparticipant")[0].body, { eventId: s.e1, entityId: sam, role: "voted", attestation: { captureSha: s.d1.sha, extent: DOC }, voteValue: "yes", reason: REASON });
  const e1 = (await eventsOf()).find((i) => i.event_id === s.e1);
  assert.ok(e1.participants.some((x) => x.entity_id === sam && x.role === "voted"), "she took part");
  fill(p, { "tl-doc": s.d1.sha, "tl-event": s.e1, "tl-to": s.e2, "tl-rel": "authorises" });
  const link = main(p).querySelectorAll('button[data-act="relate"]').find((b) => b.textContent.startsWith(word("act.relate.label.timeline")));
  await press(p, "relate", { el: link });
  assert.deepEqual(p.byOp("relate")[0].body, { from: s.e1, to: s.e2, kind: "authorises", attestation: { captureSha: s.d1.sha, extent: DOC } });
  const first = main(p).querySelectorAll('button[data-act="relate"]').find((b) => b.getAttribute("data-event") === s.e2 && b.textContent.startsWith(word("screen.timeline.cite.first")));
  fill(p, { "tl-doc": s.d1.sha, "tl-to": s.e3 });
  await press(p, "relate", { el: first });
  assert.deepEqual(p.byOp("relate")[1].body, { from: s.e2, to: s.e3, kind: "precedes", attestation: { captureSha: s.d1.sha, extent: DOC } }, "R20: kind precedes, from the event chosen as first");
  const order = await s.me.read("sequence", { query: { a: s.e2, b: s.e3 } });
  assert.equal(order.answer, "before", "the record now holds which came first");
  assert.equal(order.basis, "cited");
  fill(p, { "tl-doc": s.d1.sha, "tl-date": "2024-04", "tl-datekind": "signed" });
  await press(p, "recorddatedfact");
  assert.deepEqual(p.byOp("recorddatedfact")[0].body, { captureSha: s.d1.sha, extent: DOC, kind: "signed", value: { value: "2024-04", precision: "edtf" }, method: word("screen.timeline.method.member") });
  const facts = (await s.me.read("datedfacts", { query: { sha256: s.d1.sha } })).dated_facts;
  assert.ok(facts.some((f) => f.kind === "signed" && f.value === "2024-04" && f.precision === "edtf"), "the month is held as a month");
});

test("R3 each act names its passage (control: with no document held, none sends nothing)", async () => {
  const s = await scene({ bare: true });
  const p = await pageOf(s);
  assert.equal(p.doc.getElementById("tl-doc"), null, "no document held");
  for (const op of ["createevent", "addparticipant", "recorddatedfact"]) {
    await press(p, op, { el: main(p).querySelectorAll(`button[data-act="${op}"]`).at(-1), reason: "x" });
    assert.equal(p.byOp(op).length, 0, op);
  }
});

test("R3 hypothesishold keeps a suspected cause as a hunch beside one of the project's questions, never evidence; findin opens find-in over the project", async () => {
  const s = await scene();
  const p = await pageOf(s);
  fill(p, { "tl-question": s.inq, "tl-hunch": "The adjustment answered the notice", "tl-event": s.e2, "tl-to": s.e1 });
  await press(p, "hypothesishold");
  assert.deepEqual(p.byOp("hypothesishold")[0].body, { inquiry: s.inq, statement: "The adjustment answered the notice", kind: "cause", about: { from: s.e2, to: s.e1 } });
  const held = await s.me.read("hypotheses", { query: { inquiry: s.inq } });
  assert.equal((held.hypotheses || held.items || []).length, 1, "a hunch is held beside the question");
  drew(main(p), "screen.timeline.hunch.kept");
  await press(p, "findin", { el: main(p).querySelectorAll('button[data-act="findin"]').at(-1) });
  assert.equal(p.location.pathname, "/app/find-in/" + s.project);
});

test("R3 a project whose document cites no one has no set: said so, and timeline is not read (control)", async () => {
  const { world, me } = await inWorld();
  const project = await world.recipes.project(me, "Empty");
  const p = await openAs(world, me, "/app/timeline/" + project);
  assert.equal(p.byOp("timeline").length, 0);
  drew(main(p), "screen.timeline.noset");
});

test("R20 each event of \"What they did\" draws its participants (entity, role, vote) with grades, and the event's grade; an event placed nowhere draws its grade_why; at most 50 with \"and <n> more\"", async () => {
  const s = await scene();
  const read = await timelineOf(s);
  const first = read.world.items.find((i) => i.event_id === s.e1);
  const votes = first.participants.filter((x) => x.role === "voted").map((x) => x.vote_value);
  assert.equal(votes.length, 2);
  const p = await openAs(s.world, s.me, "/app/timeline/" + s.project, { plane: { timeline: graded(s, (w) => {
    w.items.find((i) => i.event_id === s.e1).participants.at(-1).grades.attestation = "C";
  }) } });
  const ev = main(p).querySelector(`[data-event="${s.e1}"]`);
  assert.equal(ev.querySelectorAll("a.cs-ref").filter((a) => /^\/app\/person\//.test(a.getAttribute("href"))).length, 3, "the mover and two voters are all drawn");
  for (const t of [word("screen.timeline.role", { role: word("screen.timeline.roles.decider") }), word("screen.timeline.role", { role: word("screen.timeline.roles.voted") }) + " ", `(${votes[0]})`, `(${votes[1]})`]) assert.ok(ev.textContent.includes(t), t);
  assert.ok(ev.querySelectorAll(".cs-grade").some((g) => g.textContent === word("mark.scale.capture.name") + "C"), "each participant's grade");
  const none = main(p).querySelector('[data-lane="world"]');
  drew(none.querySelector(`[data-event="${s.e2}"]`), "screen.timeline.nobody");
  /* the 54th and later of an event's participants are not drawn: at most 50, then "and <n> more" (53 took part: the office, each of seven people in each of eight roles) */
  const people = [];
  for (let i = 1; i <= 7; i += 1) people.push((await s.me.act("entitycreate", { body: { kind: "person", label: "Member " + String.fromCharCode(64 + i), note: "Took part in the big vote." } })).entity_id);
  const roles = ["decider", "voted", "signatory", "actor", "party", "present", "speaker", "author"];
  const participants = [];
  for (const role of roles) for (const who of people) if (participants.length < 53) participants.push({ entityId: who, role, attestation: 0, ...(role === "voted" ? { voteValue: "yes" } : {}) });
  const big = (await s.me.act("createevent", { body: { kind: "vote", attestations: [{ datedFactId: s.f1 }], concerns: [s.org], participants } })).event_id;
  const q = await openAs(s.world, s.me, "/app/timeline/" + s.project);
  const held = (await timelineOf(s)).world.items.find((i) => i.event_id === big);
  assert.equal(held.participants_total, 53);
  assert.equal(held.participants.length, 50, "at most fifty are answered");
  drew(main(q).querySelector(`[data-event="${big}"]`), "screen.timeline.more.people", { n: String(held.participants_total - held.participants.length) });
  for (let n = 1; n <= 60; n += 1) notDrew(main(p).querySelector(`[data-event="${s.e1}"]`), "screen.timeline.more.people", { n: String(n) }, "control: all shown, nothing more");
});

test("R20 two events ordered by a cited relation are marked \"order cited, not dated\", their relation a reference; control: a pair dates order is never offered \"Cite which came first\"", async () => {
  const s = await scene();
  const q = await pageOf(s);
  notDrew(main(q).querySelector(`[data-event="${s.e2}"]`), "screen.timeline.order.cited.before", { other: s.e3 }, "control: no cited relation, nothing said");
  await s.me.act("relate", { body: { from: s.e2, to: s.e3, kind: "precedes", attestation: { captureSha: s.d1.sha, extent: DOC } } });
  const p = await pageOf(s);
  const ev = main(p).querySelector(`[data-event="${s.e2}"]`);
  drew(ev, "screen.timeline.order.cited.before", { other: s.e3 });
  assert.ok(ev.querySelector(".cs-card, a.cs-ref"), "the relation is a reference");
  const dated = main(p).querySelector(`[data-event="${s.e1}"]`);
  assert.equal(button(p, "relate", dated), null, "an ordered pair is never offered it");
  notDrew(dated, "screen.timeline.cite.first");
});

/* ---- T50: R33, R34 ---- */
const optsOf = (p, id) => p.doc.getElementById(id).querySelectorAll("option").map((o) => [o.getAttribute("value"), o.textContent]);
const secOf = (p, key) => main(p).querySelectorAll("section").find((x) => x.querySelector("h2").textContent === word(key));

test("R33 (1) state a draws, after the two lanes, Progressions it follows: each matter a reference to its steps, with its progression, steps threaded and findings", async () => {
  const s = await scene({ matter: true });
  const p = await pageOf(s);
  assert.equal(p.byOp("instances")[0].query.set, s.org);
  const m = (await s.me.read("instances", { query: { set: s.org } })).items[0];
  const sec = secOf(p, "progression.follows");
  assert.ok(sec, "the section is drawn");
  drew(sec, "progression.followed", { progression: m.label, n: String(m.definition_version) });
  assert.equal(m.definition_version, 2, "declared twice");
  assert.ok(sec.textContent.includes(`${m.placed_count} / ${m.stage_count}`), "steps threaded");
  assert.ok(sec.querySelector(".cs-card, .cs-ref"), "a reference");
  const bare = await scene({ bare: true });
  const none = await pageOf(bare);
  assert.equal(secOf(none, "progression.follows"), undefined, "a project that follows nothing draws no empty section");
});

test("R33 (2) state b: one matter's steps in order with each document, its own date and who threaded it; a step with no document draws the finding's own sentence; never overdue or late; the chain undetermined below two placed steps; findings listed", async () => {
  const s = await scene({ matter: true });
  const p = await openAs(s.world, s.me, "/app/timeline/" + s.project + matterAt(s), { plane: { instance: await saying(s) } });
  assert.deepEqual(p.byOp("instance")[0].query, { op: "instance", key: "pra", id: s.org });
  const matter = await s.me.read("instance", { query: { key: "pra", id: s.org } });
  const m = main(p);
  const steps = secOf(p, "progression.steps");
  drew(steps, "progression.req.always");
  drew(steps, "progression.req.unless");
  const th = matter.threads.at(-1);
  drew(steps, "progression.threadedby", { date: dayOf("2026-09-01"), who: s.me.handle, when: dayOf(th.at.slice(0, 10)) });
  drew(steps, "progression.nodoc");
  const f = matter.findings[0];
  /* the finding's own sentence: `progressions` R45 gives it to the overdue finding, which the world's `instance` does not carry (REPORTED below); the
     sentence drawn is the proposals feed's, the record's own words for this very finding */
  const says = (await overdueOf(s, s.org)).says;
  assert.equal(says.key, "progression.expects", "the day it was due has passed and the predecessor has its own date");
  drew(steps, says.key, says.vars);
  drew(m, "progression.finding.never");
  drew(secOf(p, "progression.chain"), "progression.chain.undetermined");
  assert.ok(secOf(p, "progression.findings").textContent.includes(f.stage_label));
  assert.doesNotMatch(m.textContent.replace(word("progression.finding.never"), ""), /overdue|\blate\b/i, "no drawn text but the design's own never-sentence says overdue or late");
  /* a matter whose first document carries no day of its own: the deadline cannot be told, and the finding says so in its own sentence */
  const parks = (await s.me.act("entitycreate", { body: { kind: "office", label: "Parks Director", note: "A second office." } })).entity_id;
  const d3 = await holdRead(s.world, s.me, "Parks letter", "A letter about the parks.", s.project, [{ kind: "office", key: "parks", label: "Parks Director" }]);
  await s.me.act("resolve", { body: { captureSha: d3.sha } });
  await s.me.act("thread", { body: { progressionKey: "pra", entityId: parks, placements: [{ stage: "sent", captureSha: d3.sha }] } });
  const undetermined = (await overdueOf(s, parks)).says;
  assert.equal(undetermined.key, "progression.expects.undetermined");
  const undet = await openAs(s.world, s.me, "/app/timeline/" + s.project + "/matter/pra/" + parks, { plane: { instance: await saying(s) } });
  drew(secOf(undet, "progression.steps"), undetermined.key, undetermined.vars);
  /* set aside by her own act: the finding stays listed with her reason */
  await s.me.act("proposedispose", { body: { progressionKey: "pra", stageKey: "determination", to: "dismissed", reason: "the clerk called", definitionVersion: f.definition_version } });
  const aside = await pageOf(s, matterAt(s));
  assert.ok(secOf(aside, "progression.findings").textContent.includes("the clerk called"), "a finding set aside stays listed");
});
test.todo("REPORTED (progressions R49, K5186): the world's `instance` read carries no `says` on any finding (only `proposals` and `captureprogressions` carry the overdue finding and its sentence, progressions/index.mjs:1326, 1341; readInstance, 976, assembles none), so state b never draws progression.expects of a real matter (timeline-parts.mjs:36-39 reads `says` from the instance); the test above draws it from the proposals feed's own sentence spliced into the instance answer (R33 (2), progressions R45)");

test("R33 (2) the matter's acts: thread keeps the placements it holds and adds the chosen document at the chosen step; a lawful skip with its reason and citation; set a finding aside with a reason", async () => {
  const s = await scene({ matter: true });
  const p = await pageOf(s, matterAt(s));
  const version = (await s.me.read("instance", { query: { key: "pra", id: s.org } })).findings[0].definition_version;
  fill(p, { "pm-aside-finding": "determination|" + version, "pm-aside-reason": "the clerk called" });
  await press(p, "proposedispose", { reason: "the clerk called" });
  assert.deepEqual(p.byOp("proposedispose")[0].body, { progressionKey: "pra", stageKey: "determination", to: "dismissed", reason: "the clerk called", definitionVersion: version });
  assert.equal((await s.me.read("instance", { query: { key: "pra", id: s.org } })).findings[0].disposition.state, "dismissed", "the record holds the decision");
  fill(p, { "pm-dis-stage": "determination", "pm-dis-doc": s.d2.sha, "pm-dis-reason": "the request was withdrawn", "pm-dis-cite": "Gov. Code 7922.535" });
  await press(p, "discharge", { reason: "the request was withdrawn" });
  assert.deepEqual(p.byOp("discharge")[0].body, { progressionKey: "pra", entityId: s.org, stageKey: "determination", captureSha: s.d2.sha, reason: "the request was withdrawn", citation: "Gov. Code 7922.535" });
  assert.equal((await s.me.read("instance", { query: { key: "pra", id: s.org } })).stages[1].discharged, true, "the skip is held");
  fill(p, { "pm-thread-stage": "determination", "pm-thread-doc": s.d2.sha });
  await press(p, "thread");
  assert.deepEqual(p.byOp("thread")[0].body, { progressionKey: "pra", entityId: s.org, placements: [{ stage: "sent", captureSha: s.d1.sha, datedFact: s.df }, { stage: "determination", captureSha: s.d2.sha }] });
  const held = await s.me.read("instance", { query: { key: "pra", id: s.org } });
  assert.equal(held.placed_count, 2, "both documents are threaded");
  assert.equal(held.thread_version, 2);
});

test("R33 (3) state c: a progression's steps (what comes before, how soon, required, how many), its basis with every version, Revise the steps and Define a progression send progressiondefine", async () => {
  const s = await scene({ matter: true });
  const p = await pageOf(s, "/progression/pra");
  assert.deepEqual(p.byOp("progression")[0].query, { op: "progression", key: "pra" });
  const def = await s.me.read("progression", { query: { key: "pra" } });
  const steps = secOf(p, "progression.steps");
  drew(steps, "screen.timeline.step.within", { days: "10", n: "1" });
  for (const v of def.versions) drew(secOf(p, "progression.basis"), "screen.timeline.progression.sub", { what: def.label, n: String(v.version), name: s.me.handle, date: dayOf(v.at.slice(0, 10)) });
  assert.ok(secOf(p, "progression.basis").textContent.includes(def.basis.statement), "the basis in force");
  assert.ok(secOf(p, "progression.basis").textContent.includes(def.versions[0].basis.statement), "and every version's");
  fill(p, { "pd-rv-basis": "amended basis", "pd-rv-cite": "Gov. Code 7922.535", "pd-rv-steps": "sent | Request sent | | | always | 1\ndetermination | Determination | sent | 10 days | usually | 0..1" });
  await press(p, "progressiondefine", { el: button(p, "progressiondefine"), reason: "amended basis" });
  const b = p.byOp("progressiondefine")[0].body;
  assert.equal(b.progressionKey, "pra");
  assert.equal(b.basis, "amended basis");
  assert.deepEqual(b.stages[1], { key: "determination", label: "Determination", after: "sent", within: "10 days", required: "usually", cardinality: "0..1" });
  assert.equal((await s.me.read("progression", { query: { key: "pra" } })).version, def.version + 1, "a new version is held");
  fill(p, { "pd-name": "A permit", "pd-basis": "the code", "pd-cite": "Code 1", "pd-steps": "filed" });
  await press(p, "progressiondefine", { el: p.root().querySelectorAll('button[data-act="progressiondefine"]').pop(), reason: "the code" });
  const d = p.byOp("progressiondefine")[1].body;
  assert.deepEqual([d.progressionKey, d.label, d.stages[0].key, d.stages[0].required], ["a_permit", "A permit", "filed", "sometimes"]);
  assert.equal((await s.me.read("progression", { query: { key: "a_permit" } })).found, true, "the new progression is held");
});

test("R33 (5) a project whose documents name no entity or event but hold dated facts draws Dated in the documents and no event, and not the no-set sentence; control: a project with no document says so", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const project = await world.recipes.project(me, "Pothole repairs");
  const empty = await openAs(world, me, "/app/timeline/" + project);
  drew(main(empty), "screen.timeline.noset");
  const a = await world.recipes.hold(me, "Lease amendment 1", "The amendment was signed on March 1, 2024.", project);
  const b = await world.recipes.hold(me, "Rent schedule", "The hearing on the rent schedule was in July 2025.", project);
  await me.act("recorddatedfact", { body: { captureSha: a.sha, extent: DOC, kind: "signed", value: "2024-03-01", method: "stated in the document" } });
  await me.act("recorddatedfact", { body: { captureSha: b.sha, extent: DOC, kind: "hearing", value: { value: "2025-07", precision: "edtf" }, method: "stated in the document" } });
  const p = await openAs(world, me, "/app/timeline/" + project);
  assert.deepEqual(p.byOp("timeline")[0].query.set, undefined);
  assert.ok(p.byOp("timeline")[0].query.captures.includes(a.sha));
  notDrew(main(p), "screen.timeline.noset");
  const d = secOf(p, "timeline.dated.title");
  assert.ok(d, "the dated list stands apart from the lanes");
  const rows = d.textContent;
  assert.ok(rows.includes("Lease amendment 1") && rows.includes("Rent schedule"), "each by its document's title");
  assert.ok(rows.includes(word("label.timeprecisions.day")) && rows.includes(word("label.timeprecisions.edtf")), "each date's precision");
  assert.ok(d.querySelectorAll('.cs-gap[data-gap="unrated"]').length >= 2, "a member's upload is ungraded: the unrated mark stands for the grade");
  drew(d, "screen.timeline.datekind.signed");
  drew(d, "screen.timeline.datekind.hearing");
  assert.equal(main(p).querySelectorAll(".mk-ev").length, 0, "no event is made of a dated fact");
  assert.equal(main(p).querySelectorAll(".mk-lanes").length, 0);
});

test("R34 the timeline's event form chooses the project's documents by title and sends the capture's digest; no field names a fingerprint; with no document the choice's empty state is drawn and nothing is sent", async () => {
  const s = await scene();
  const p = await pageOf(s);
  const held = await heldRows(s);
  assert.equal(held.length, 2);
  assert.deepEqual(optsOf(p, "tl-doc").map(([v]) => v), held.map((r) => r.capture.sha256));
  assert.deepEqual(optsOf(p, "tl-doc").map(([, t], i) => t.startsWith(held[i].title)), [true, true], "each by its title");
  assert.ok(held.some((r) => r.title === "Lease amendment 1") && held.some((r) => r.title === "Rent schedule"));
  assert.equal(p.byOp("heldcaptures")[0].query.project, s.project, "the project's documents");
  drew(main(p), "form.choose.passage");
  assert.equal(main(p).querySelectorAll("*").filter((e) => /^tl-(sha|page)$/.test(e.getAttribute("id") || "")).length, 0);
  const bare = await scene({ bare: true });
  const none = await pageOf(bare);
  assert.equal(none.doc.getElementById("tl-doc"), null);
  await press(none, "createevent", { reason: "x" });
  assert.equal(none.byOp("createevent").length, 0);
});

/* R45 (T51-120), K3996 */
test("R45 each finding draws its state by key (a deferred one \"Deferred\", a set-aside one \"Set aside\"), explained by progression.finding.state.help; control: a finding with no decision draws Open", async () => {
  const s = await scene({ matter: true });
  const step = (key, label, within) => ({ key, label, after: "filed", within, required: "always", cardinality: "0..1" });
  await s.me.act("progressiondefine", { body: { progressionKey: "permit", label: "A permit", basis: "the code", citation: "Code 1",
    stages: [{ key: "filed", label: "Filed", after: null, within: null, required: "always", cardinality: "1" }, step("determination", "Determination", "10 days"), step("closing", "Closing", "20 days"), step("other", "Other", "30 days")] } });
  await s.me.act("thread", { body: { progressionKey: "permit", entityId: s.org, placements: [{ stage: "filed", captureSha: s.d1.sha, datedFact: s.df }] } });
  await s.me.act("proposedispose", { body: { progressionKey: "permit", stageKey: "determination", to: "deferred", reason: "wait for the reply", definitionVersion: 1 } });
  await s.me.act("proposedispose", { body: { progressionKey: "permit", stageKey: "closing", to: "dismissed", reason: "the office closed it", definitionVersion: 1 } });
  const p = await openAs(s.world, s.me, "/app/timeline/" + s.project + "/matter/permit/" + s.org);
  const st = secOf(p, "progression.findings").querySelectorAll("[data-finding-state]").map((e) => [e.getAttribute("data-finding-state"), e.textContent]);
  assert.deepEqual(st, [["deferred", word("progression.finding.state.deferred")], ["dismissed", word("progression.finding.state.dismissed")], ["open", word("progression.finding.state.open")]]);
  assert.ok(secOf(p, "progression.findings").querySelector(`[data-tip*="${word("progression.finding.state.help").slice(0, 30)}"]`), "explained by the help");
});

test("R45 the Define and Revise step fields are labelled by the six keys in order, with the steps help under Define and the revise help under Revise", async () => {
  const keys = ["key", "label", "after", "within", "required", "cardinality"].map((c) => "progression.steps.label." + c);
  for (const k of [...keys, "progression.steps.help", "progression.revise.help"]) assert.ok(hasWord(k), k);
  const s = await scene({ matter: true });
  const p = await pageOf(s, "/progression/pra");
  const cols = main(p).querySelectorAll("[data-columns]");
  assert.equal(cols.length, 2, "Define and Revise each");
  for (const c of cols) assert.equal(c.textContent, keys.map((k) => word(k)).join(" | "));
  drew(main(p), "progression.revise.help");
  drew(main(p), "progression.steps.help");
});

test("K3996 an event placed nowhere draws its grade_why, {key, vars}, through its word; control: a bare string draws none of our English", async () => {
  const s = await scene();
  const nowhere = (await timelineOf(s)).world.placed_nowhere.find((i) => i.event_id === s.e9);
  assert.ok(nowhere.grade_why && typeof nowhere.grade_why.key === "string", "the record gives {key, vars}");
  const p = await pageOf(s);
  drew(main(p), nowhere.grade_why.key, nowhere.grade_why.vars);
  /* a record the live copy may hold that this build does not make: the reason as a bare string of someone's English */
  const q = await openAs(s.world, s.me, "/app/timeline/" + s.project, { plane: { timeline: graded(s, (w) => { w.placed_nowhere.find((i) => i.event_id === s.e9).grade_why = "a sentence written elsewhere"; }) } });
  assert.ok(!main(q).textContent.includes("a sentence written elsewhere"));
});

/* R49 (T51; C26) */
test("R49 the project's timeline always offers Define a progression, even where it follows no matter yet; pressing it sends progressiondefine with the declared fields and opens the new flow", async () => {
  const s = await scene({ bare: true });
  const p = await pageOf(s);
  assert.equal(main(p).querySelectorAll("section").some((x) => x.querySelector("h2").textContent === word("progression.follows")), false, "no matter followed: no list");
  const fold = main(p).querySelector("details[data-define]");
  assert.ok(fold, "the form is offered on the project's own timeline");
  drew(fold, "progression.define");
  fill(p, { "pd-name": "A permit", "pd-basis": "the code", "pd-cite": "Code 1", "pd-steps": "filed | Filed" });
  await press(p, "progressiondefine", { reason: "the code" });
  assert.deepEqual(p.byOp("progressiondefine")[0].body, { progressionKey: "a_permit", label: "A permit", basis: "the code", citation: "Code 1",
    stages: [{ key: "filed", label: "Filed", after: null, within: null, required: "sometimes", cardinality: "0..n" }] });
  assert.equal(decodeURIComponent(p.location.pathname), "/app/timeline/" + s.project + "/progression/a_permit");
  assert.equal(p.byOp("progression").at(-1).query.key, "a_permit", "the new flow is opened (state c)");
  assert.equal((await s.me.read("progression", { query: { key: "a_permit" } })).found, true, "and the record holds it");
});

test("R49 a progression address of a key the record does not hold draws the empty state with the define form beside it; control: a known flow is drawn as today, with its steps and the one define form", async () => {
  const s = await scene({ bare: true });
  const p = await pageOf(s, "/progression/pra");
  const m = main(p);
  assert.ok(m.querySelector('[data-state="empty"]'), "the empty state");
  assert.ok(m.querySelector("details[data-define]"), "and the form that defines it");
  assert.ok(p.doc.getElementById("pd-name"));
  const known = await scene({ matter: true });
  const k = await pageOf(known, "/progression/pra");
  assert.equal(main(k).querySelectorAll("details[data-define]").length, 1);
  assert.equal(main(k).querySelector('[data-state="empty"]'), null);
  drew(main(k), "progression.steps");
  /* the refusal is the record's own, caused by the act: a step that comes after one the sequence does not hold */
  const sent = { progressionKey: "x", label: "X", basis: "the code", citation: "", stages: [{ key: "a", label: "a", after: "zzz", within: null, required: "sometimes", cardinality: "0..n" }] };
  const code = await refused(s.world, s.me, "progressiondefine", sent);
  assert.equal(code.ok, false);
  fill(p, { "pd-name": "X", "pd-basis": "the code", "pd-cite": "", "pd-steps": "a | a | zzz" });
  await press(p, "progressiondefine", { reason: "the code" });
  assert.equal(p.byOp("progressiondefine").length, 1, "sent once");
  assert.deepEqual(p.byOp("progressiondefine")[0].body, sent);
  const drawn = main(p).textContent;
  assert.ok(drawn.includes(hasWord("refusal." + code.code) ? word("refusal." + code.code) : code.translation), "the owner's refusal is drawn beside the act");
});

/* B14 entry 2 (K4259; registry at 09fbb247eb): `instance` and `progression` are acts the design draws as the sections they read */
test("R33 B14 the module names instance and progression among the timeline's acts, and draws each as the design does: the section it reads carries the act (data-act), never a button; the three states", async () => {
  const names = (await import("./fixtures.mjs")).SCREENS.find((x) => x.id === "timeline").acts.map((a) => a.op);
  for (const op of ["instance", "progression"]) assert.ok(names.includes(op), op);
  const sectionActs = (p) => main(p).querySelectorAll("section[data-act]").map((x) => x.getAttribute("data-act"));
  const s = await scene({ matter: true });
  const a = await pageOf(s);
  assert.deepEqual(sectionActs(a), ["instance"], "state a: Progressions it follows is the instance read");
  assert.equal(secOf(a, "progression.follows").getAttribute("data-act"), "instance");
  const b = await pageOf(s, matterAt(s));
  assert.equal(secOf(b, "progression.steps").getAttribute("data-act"), "instance", "state b: Its steps");
  assert.deepEqual(sectionActs(b), ["instance"]);
  const c = await pageOf(s, "/progression/pra");
  assert.equal(secOf(c, "progression.steps").getAttribute("data-act"), "progression", "state c: Steps");
  assert.deepEqual(sectionActs(c), ["progression"]);
  for (const p of [a, b, c]) for (const op of ["instance", "progression"]) assert.ok(button(p, op) === null, `${op} is a read the section draws, not a button`);
  /* control: a project that follows no matter draws no instance section (R22) */
  const bare = await scene({ bare: true });
  const none = await pageOf(bare);
  assert.deepEqual(sectionActs(none), []);
});
