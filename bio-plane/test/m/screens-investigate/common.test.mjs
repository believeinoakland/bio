/* screens-investigate R10 (with interface-shell R8–R13 and R16 on this module's screens), on the shell's served page:
 * each screen with each read it draws answered pending, refused and not at all draws that read in its own state, beside
 * the rest; every grade is one mark (the scale's name and the letter) explaining itself; every record item named is a
 * reference with its card; each screen draws exactly its registry acts and the shell serves the module's screens (its
 * R21 check); the module's own words are well formed; after an act the screen reads again what it changed. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { interfacePage, RE_POINTS } from "../../../src/interface-shell/index.mjs";
import { WORD_ROWS, word, hasWord } from "../../../src/setup-words/index.mjs";
import { OPS } from "../../../src/op-declarations/index.mjs";
import { createHash } from "node:crypto";
import { refusedIn, silent, pending, ok } from "../interface-shell/harness.mjs";
import { inWorld, openAs, refused, settled, rewrite, readHeld, declareStandard } from "./world.mjs";
import { main, rawKeys, press, fill, SCREENS } from "./fixtures.mjs";

const REGISTRY = JSON.parse(readFileSync(new URL("./fixtures/registry-43379a1a44.json", import.meta.url), "utf8"));
/* N1073: no hand list of other modules' ops. The reads a screen makes are those it is seen to send over the scripted plane; each
 * answered pending, refused and not at all must leave the screen standing, and draw its own state where the screen draws one (the
 * reads that only feed a title or a choice draw none). The screen's subject read and the screen's other state-drawn reads are
 * found by the page itself: at least one read per screen draws its state. */
/* The design's own label keys for acts whose words the requirements name (R31, R32, R33, R36, R37). */
const LABELS = { "person:entityalias": "entity.alias.add", "person:aliaswithdraw": "act.owed_aliaswithdraw.label.person", "person:relationdeclare": "entity.relation.declare",
  "person:resolve": "entity.naming.match", "person:resolvetestify": "entity.naming.testify", "person:connect": "entity.connect", "timeline:thread": "progression.thread",
  "timeline:discharge": "progression.discharge", "timeline:proposedispose": "progression.setaside", "timeline:progressiondefine": "progression.define.go",
  "theme:themedeclare": "theme.declare.go", "theme:themeplace": "theme.confirm", "people:entitycreate": "screen.people.add.submit" };
const VARIANTS = { refused: refusedIn("SOME_REFUSAL", "The plane refused this read."), silent, pending };

/* ---- one world holding something for every screen: each subject is made by the member's own real acts; the screens are opened at the ids the world gave ---- */
const hex = (v) => createHash("sha256").update(v).digest("hex");
const DOC = { kind: "document" };
const iso = (world) => new Date(world.now()).toISOString().replace(/\.\d{3}Z$/, "Z");
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
async function universe() {
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
const theWorld = () => (shared ||= universe());
const TIES = "/app/ties";
const changing = (world, me, op, fn) => rewrite(world, me, (req, a) => (a && a.json && a.json.result && req.url.includes("op=" + op) ? { ...a, json: { ...a.json, result: fn(a.json.result, req) } } : a));
/** The reads a screen makes beyond the shell's own: every op the page asked, less those the help page (which reads nothing) asks of the frame. */
const readsOf = async (U, id) => {
  const frame = new Set((await openAs(U.world, U.me, "/app/help")).requests.map((r) => r.op));
  const p = await openAs(U.world, U.me, U.PATHS[id]);
  return [...new Set(p.requests.map((r) => r.op))].filter((op) => !frame.has(op));
};

for (const id of ["people", "person", "theme", "explore", "timeline", "money", "calculation", "proceeding", "due-date", "standard", "ties"]) {
  test(`R10 ${id}: each read pending, refused and unanswered is drawn in its own state, beside the rest, with no key drawn bare (interface-shell R10, R5)`, async () => {
    const U = await theWorld();
    const drawn = new Set();
    for (const op of await readsOf(U, id)) for (const [name, answer] of Object.entries(VARIANTS)) {
      const p = await openAs(U.world, U.me, U.PATHS[id], { plane: { [op]: answer } });
      const m = main(p);
      assert.ok(m.querySelector("h1"), `${id} with ${op} ${name}: the screen stays`);
      const want = name === "pending" ? "loading" : "failed";
      if (m.querySelector(`[data-state="${want}"]`)) {
        drawn.add(op);
        if (name === "refused") assert.ok(/The plane refused this read|SOME_REFUSAL/.test(m.querySelector('[data-state="failed"]').textContent), "the refusal's own words");
      }
      assert.deepEqual(rawKeys(p.root()), [], `${id} with ${op} ${name}`);
    }
    assert.ok(drawn.size > 0, `${id}: some read is drawn in its own state`);
    const subject = SCREENS.find((s) => s.id === id).reads({ subject: U.PATHS[id].split("/")[3], ui: {}, data: {} });
    for (const r of Object.values(subject)) if (r.subject === true) assert.ok(drawn.has(r.op), `${id}: its subject read ${r.op} is drawn in its own state`);
  });
}

test("R10 a read that answers nothing is drawn empty, never failed (control: a refusal is failed, never empty); R22: ties with none draws its designed empty state, not \"You have listed no tie\"", async () => {
  const { world, me } = await inWorld();
  const p = await openAs(world, me, TIES);
  assert.deepEqual((await me.read("memberties")).ties, [], "the member has declared no tie: the world's own answer");
  assert.ok(main(p).textContent.includes(word("screen.ties.first")), "the designed empty state, naming the first step");
  assert.equal(main(p).querySelector('[data-state="failed"]'), null);
  /* a refused read is a fault the real code cannot be made to cause: scripted */
  const q = await openAs(world, me, TIES, { plane: { memberties: refusedIn("SOME_REFUSAL") } });
  assert.equal(main(q).querySelector('[data-state="empty"]'), null);
});

test("R10 every grade is drawn as one mark (the scale's name and the letter) explaining itself, on every screen that draws grades", async () => {
  const U = await theWorld();
  /* the store grades no upload: a figure's and an event's capture grade are the one scripted line (a measured capture, K5044 (1)); a post's grade and a visit's are the store's */
  const grade = { timeline: { timeline: changing(U.world, U.me, "timeline", (r) => {
    if (!r.world) return r;
    const w = JSON.parse(JSON.stringify(r.world));
    for (const x of w.items) x.grade = "B";
    return { ...r, world: w };
  }) }, money: { money: changing(U.world, U.me, "money", (r) => (r.fact ? { ...r, fact: { ...r.fact, grade: { ...r.fact.grade, reading: "B" } } } : r)) } };
  for (const id of ["person", "timeline", "money", "calculation"]) {
    const p = await openAs(U.world, U.me, U.PATHS[id], { plane: grade[id] || {} });
    const grades = main(p).querySelectorAll(".cs-grade");
    assert.ok(grades.length > 0, id);
    for (const g of grades) {
      assert.ok(["capture", "connection", "testimony", "subject"].includes(g.getAttribute("data-scale")), id);
      const scale = g.getAttribute("data-scale");
      assert.equal(g.textContent, word("mark.scale." + scale + ".name") + g.textContent.slice(-1), id);
      assert.match(g.textContent, /[A-D]$/, id);
      assert.ok((g.getAttribute("data-tip") || "").includes(word("mark.grade.reading").split(";")[0]), `${id}: the grade explains itself`);
    }
  }
});

test("R10 every record item a screen names is a reference with its card (DEC-160): people and organisations open person, documents their capture", async () => {
  const U = await theWorld();
  for (const id of ["people", "person", "timeline", "money", "calculation", "proceeding", "ties"]) {
    const p = await openAs(U.world, U.me, U.PATHS[id]);
    const refs = main(p).querySelectorAll("a.cs-ref, .cs-card");
    assert.ok(refs.length > 0, id);
    /* the trail's own node in the graph is drawn a card with none (see the REPORTED todo below) */
    for (const r of refs) if (!r.closest(".mk-graph")) assert.ok(r.getAttribute("data-tip"), `${id}: ${r.textContent} carries its card`);
    for (const a of main(p).querySelectorAll('a.cs-ref[href^="/app/person/"]')) assert.match(a.getAttribute("href"), /^\/app\/person\/ENT-/);
  }
  const p = await openAs(U.world, U.me, U.PATHS.people);
  assert.ok(main(p).querySelector(`a.cs-ref[href="/app/person/${U.chen}"]`), "a person's name opens person (interface-shell R47)");
});

test("R10 DEC-160 a trail's own node in the money graph carries its card: every record item a screen names does", async () => {
  const U = await theWorld();
  const p = await openAs(U.world, U.me, U.PATHS.money);
  const node = main(p).querySelectorAll(".mk-graph .cs-card, .mk-graph a.cs-ref");
  assert.ok(node.length > 0, "the graph names the trail");
  for (const r of node) assert.ok(r.getAttribute("data-tip"), `money: ${r.textContent} carries its card`);
});

test("R10 after an act the screen reads again what it changed and draws it (control: a refused act reads nothing again)", async () => {
  const { world, me } = await inWorld();
  const transit = (await me.act("entitycreate", { body: { kind: "institution", label: "East Bay Transit", note: "The transit agency." } })).entity_id;
  const p = await openAs(world, me, TIES);
  assert.equal(p.byOp("memberties").length, 1);
  fill(p, { "tie-who": transit, "tie-note": "East Bay Transit" });
  await press(p, "declaretie");
  await settled(p);
  assert.equal(p.byOp("memberties").length, 2, "read again after the act");
  const held = (await me.read("memberties")).ties;
  assert.equal(held.length, 1, "the tie is held");
  assert.deepEqual([held[0].entity, held[0].note], [transit, "East Bay Transit"]);
  assert.ok(main(p).textContent.includes(held[0].note), "the tie she added, read again");
  /* the real store refuses a tie to a record it does not hold */
  const q = await openAs(world, me, TIES);
  const before = q.byOp("memberties").length;
  const gone = "ENT-2026-9999";
  const why = await refused(world, me, "declaretie", { entity: gone, note: "x" });
  assert.equal(why.ok, false, "the store refuses a tie to an entity it does not hold");
  fill(q, { "tie-who": gone, "tie-note": "x" });
  await press(q, "declaretie");
  await settled(q);
  assert.equal(q.byOp("memberties").length, before);
  assert.ok(main(q).textContent.includes(why.translation || why.why || why.code), "the refusal by its words");
  assert.equal(q.doc.getElementById("tie-note").value, "x", "the form keeps what was typed (interface-shell R13)");
});

test("R10 each screen draws exactly its registry acts, labelled by its words, each an op OPS holds; the shell serves the twelve screens", () => {
  assert.equal(typeof interfacePage(SCREENS), "string", "interface-shell R21's check passes");
  assert.deepEqual(SCREENS.map((s) => s.id), ["people", "person", "explore", "timeline", "money", "calculation", "help", "proceeding", "due-date", "standard", "ties", "theme"]);
  for (const s of SCREENS) {
    const reg = REGISTRY.screens.find((x) => x.id === s.id);
    assert.ok(reg, `${s.id} is a registry screen`);
    /* B14 (K4259): each screen names exactly the acts the registry lists for it (and its owed acts under their op names) */
    const want = reg.acts.map((a) => a.op.replace(/^owed:(\S+).*$/, "$1")).concat((RE_POINTS[s.id] || []).filter((op) => s.acts.some((a) => a.op === op)));
    assert.deepEqual([...new Set(s.acts.map((a) => a.op))].sort(), [...new Set(want)].sort(), s.id);
    for (const a of s.acts) {
      assert.ok(Object.hasOwn(OPS, a.op), `${a.op} in OPS`);
      assert.equal(a.label, LABELS[s.id + ":" + a.op] ? LABELS[s.id + ":" + a.op] : a.op === "stepsource" ? "act.stepsource.label.explore" : `act.${a.op}.label.${s.id}`);
      assert.ok(ADOPTED.includes(a.label) || s.words.some((w) => (typeof w === "string" ? w : w[0]) === a.label), `${a.label} listed`);
    }
  }
});

/* K5173 (HANDOFF B520): the rows UX-DESIGN adopts for this round's causes; the source draws each by key, and each is a `test.todo` until the word table holds it */
const ADOPTED = ["screen.person.expunge.marker", "screen.person.holds.heading", "screen.person.holds.holder", "screen.person.holds.capacity", "screen.person.holds.empty",
  "act.recordline.label.office", "screen.person.holds.through", "act.linecurrentthrough.label.person", "act.linecurrentthrough.does", "screen.calculation.column", "screen.calculation.column.help", "screen.calculation.part", "screen.calculation.part.help",
  ...["implements", "refers_to", "amends", "repeals", "renumbers", "recodifies", "defines", "excepts", "incorporates"].map((k) => "screen.standard.rel.in." + k)];
for (const key of ADOPTED) if (!hasWord(key)) test.todo(`K5173: ${key} is a word the table holds (hasWord)`);

test("R30 the module holds no member-facing English: no SCREEN_WORDS, every screen lists keys only, each key a word setup-words holds (hasWord); what is drawn equals word(key, vars)", async () => {
  const mod = await import("../../../src/screens-investigate/index.mjs");
  assert.equal(mod.SCREEN_WORDS, undefined, "the module exports no rows of English");
  for (const s of SCREENS) {
    assert.equal(new Set(s.words).size, s.words.length, `${s.id}: keys listed once`);
    for (const w of s.words) {
      assert.equal(typeof w, "string", `${s.id}: ${JSON.stringify(w)} is a key, not a row`);
      assert.ok(hasWord(w), `${s.id}: ${w} is a word`);
    }
  }
  /* each key the source names, found by its shape, is a word (the keys a screen reads without listing them too) */
  const dir = new URL("../../../src/screens-investigate/", import.meta.url);
  const SHAPE = /["`]((?:screen|act|connection|mark|state|file|proceeding|column|shell)\.[a-z0-9_.-]*[a-z0-9_])["`]/g;
  for (const f of readdirSync(dir)) {
    const text = readFileSync(new URL(f, dir), "utf8");
    for (const m of text.matchAll(SHAPE)) assert.ok(hasWord(m[1]) || ADOPTED.includes(m[1]), `${f}: ${m[1]} is no word`);
  }
  const U = await theWorld();
  const p = await openAs(U.world, U.me, TIES);
  for (const k of ["screen.ties.why.1", "screen.ties.who.1", "screen.ties.either", "screen.ties.add"]) assert.ok(main(p).textContent.includes(word(k)), k);
  assert.ok(WORD_ROWS.length > 0);
});

test("D29 an answer that says ok and carries a refusal is drawn as the refusal, never as success: a graph, a search and a spot-check read", async () => {
  const refusal = ok({ ok: true, refused: "NO_NODE", why: "No such record." });
  const U = await theWorld();
  const g = await openAs(U.world, U.me, U.PATHS.explore, { plane: { exploregraph: refusal } });
  assert.ok(main(g).querySelector('[data-state="failed"]'), "the graph read");
  assert.equal(main(g).querySelector(".mk-graph"), null);
  const s = await openAs(U.world, U.me, U.PATHS.calculation, { plane: { spotcheck: refusal } });
  assert.ok(main(s).querySelector('[data-state="failed"]'), "the spot-check read");
  const p = await openAs(U.world, U.me, U.PATHS.people, { plane: { peopledirectory: rewrite(U.world, U.me, (req, a) => (req.query && req.query.q ? refusal : a)) } });
  fill(p, { "people-q": "chen" });
  await press(p, "search");
  await settled(p);
  assert.ok(main(p).querySelector('[data-state="failed"]'), "the search");
  assert.equal(main(p).querySelector('[data-state="empty"]'), null);
});
