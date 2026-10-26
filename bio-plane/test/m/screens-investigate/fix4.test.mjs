/* screens-investigate, T51 fix round 4 (K4429): C14 (each screen's read set, R4, R34, R52) and the words check of C59 / N3 (a refusal or a silence drawn whole, never
   escaped twice, R10). The whole-path tests of C59 and C8, over the real plane, are `fix4-seam.test.mjs`; these run over `store-request`'s world (K5148, K5054): one
   world that holds a state for every screen of the module, made by the members' own acts, and the page's door over it. Scripted: a read that answers nothing or a
   refusal (the fault each test injects), a graph node with no name (`rewrite`: a name the live copy lacks that this build never leaves out) and, for money's control,
   the real graph of a person served to the trail (a trail has no connection in the store: no act makes a step on it). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { silent } from "../interface-shell/harness.mjs";
import { inWorld, openAs, readHeld, declareStandard, rewrite, refused } from "./world.mjs";
import { main } from "./fixtures.mjs";

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

/** A project (as `recipes.project` starts one) whose document cites `targets`, as a project's document cites the people and questions it follows. */
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

/** One world with a state for every screen of the module: the people (a person with a post, a declared proxy and a tie), a project that follows the office and asks a
 *  question, three held documents (two read as naming the office), a standard and a court order held as standards, a money trail of three figures, a spot-check draw
 *  with an estimate over it, a proceeding with two parties, an order held as obligations and a followed register, a records request with a clock proposal, a theme
 *  with three placements, two meetings whose order no date settles, and a progression threaded for the office. Built once; the sweeps only read. */
let tourOnce = null;
const tour = () => (tourOnce ||= (async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const ent = async (kind, label, extra = {}) => (await me.act("entitycreate", { body: { kind, label, note: "Named in the minutes.", ...extra } })).entity_id;
  const org = await ent("office", "Public Works Director");
  const chen = await ent("person", "L. Chen");
  const alvarez = await ent("person", "R. Alvarez");
  const court = await ent("body", "Alameda Housing Tribunal", { forum_kind: "court" });
  const proc = await ent("proceeding", "Lease rent case", { proceeding: { forum: court, kind: "civil", number: "24CV123456" } });
  const clerk = await ent("body", "City Clerk");
  const inq = await question(world, me, "Is the city repairing reported potholes within seven days?");
  const project = await projectCiting(world, me, "Pothole repairs", [org, inq]);
  const lease = await holdRead(world, me, "Lease amendment 1", "Lin Chen, Director of Public Works.\n\nThe rent is due on the first of each month.", project, OFFICE_REF);
  const rent = await holdRead(world, me, "Rent schedule", "The rent schedule for the year.", project, OFFICE_REF);
  const roof = await world.recipes.hold(me, "Roof report.txt", "The roof repair was put off.", project);
  const law = await world.recipes.hold(me, "Ordinance.txt", "Section 8.22.050 No landlord shall increase the rent above the limit.", project);
  const lu = await readHeld(world, me, law.sha);
  await me.act("relationdeclare", { body: { fromEntity: chen, toEntity: alvarez, relation: "proxy_for", justification: "She signs for him on the minutes.", citation: "minutes, page 2" } });
  await me.act("recordline", { body: { kind: "holds", from: chen, to: org, capacity: "employee", valid: { from: "2025-03-01", to: null }, basis: { captureSha: lease.sha, extent: DOC }, reason: "The roster says so." } });
  const std = await declareStandard(me, { cite: "Ordinance 8.22", kind: "ordinance", sha: law.sha, extent: lu[0].extent });
  /* the money trail: three figures read from the lease */
  const trail = await world.recipes.trail(me, project, "Pothole repairs, FY2026");
  for (const [amount, kind] of [["4200000.00", "transfer"], ["4750000.00", "transfer"], ["310000.00", "allocation"]]) {
    const f = (await me.act("recordfact", { body: { currency: "USD", sign: "+", precision: "exact", period: { from: "2021-07-01", to: "2022-06-30" }, source: { capture_sha: lease.sha, extent: DOC },
      amount, as_read: amount, kind, phase: "adopted", basis: "budgetary", from: { as_written: "Sewer Fund 3100" } } })).fact_id;
    await me.act("moneysetpropose", { body: { setId: trail, factId: f, method: "member:recordfact" } });
  }
  /* a calculation resting on a draw, with a visit */
  const csv = await world.recipes.hold(me, "Payments.csv", "payer,payee,amount\nCity,Acme,5\nCity,Beta,7\n", project);
  const table = (await me.act("tabledeclare", { body: { source: { capture_sha: csv.sha, extent: DOC }, header: ["payer", "payee", "amount"],
    schema: { fields: [{ name: "payer", type: "string" }, { name: "payee", type: "string" }, { name: "amount", type: "number" }] } } })).sha;
  const period = { from: "2025-07-01", to: "2026-06-30" };
  const draw = (await me.act("calculationdraw", { body: { set: table, n: 2, seed: "2026-10-05-7f31", question: "Was it repaired?", project, reason: "a sample" } })).draw;
  const items = (await me.read("spotcheck", { query: { draw } })).items.map((x) => x.item);
  const seen = await me.act("testify", { body: { words: "What I saw.", observedAt: "2026-10-06" } });
  await me.act("spotcheckvisit", { body: { draw, item: items[0], finding: "yes", testimony: seen.capture_sha, reason: "I visited it" } });
  const calc = (await me.act("calculationcreate", { body: { question: "Share repaired", period, kind: "estimate", project, inputs: [{ name: "sample", draw }] } })).calc_id;
  /* a records request with a rule's date proposed from the day it was sent */
  const action = (await me.act("actioncreate", { body: { document: ["---", "id: PENDING", "object_type: action", 'title: "The rent schedules"', "current_state: planned", 'created: "2026-10-01T12:00:00Z"',
    'last_updated: "2026-10-01T12:00:00Z"', "project: " + project, 'action_kind: "records_request"', "counterparty:", `  state: "named"`, `  role: "City Clerk"`, `  body: "City Council"`, "---", "", "The rent schedules.", ""].join("\n") } })).id;
  await me.act("actioncorrespond", { query: { target: action, direction: "sent", at: "2026-11-23", account: "We asked for the rent schedules." } });
  await me.act("clockpropose", { body: { target: action, rule: "records_response" } });
  await me.act("declaretie", { body: { entity: org, kind: "employer", note: "East Bay Transit", attribution: "group" } });
  /* a theme with three placements */
  const theme = (await me.act("themedeclare", { body: { name: "Deferred maintenance", test: "repairs put off" } })).theme_id;
  for (const d of [lease, rent, roof]) await me.act("themeplace", { body: { theme, target: d.bundle, note: "the repair put off" } });
  /* a proceeding: two parties, an order held as obligations, a followed register */
  const order = await world.recipes.hold(me, "Order.txt", "The respondent shall produce the rent schedules.", project);
  const ou = await readHeld(world, me, order.sha);
  const orderStd = await declareStandard(me, { cite: "Tribunal order 24CV123456", kind: "court", issuer: "Alameda Housing Tribunal", sha: order.sha, extent: ou[0].extent });
  const basis = { captureSha: order.sha, extent: ou[0].extent };
  await me.act("recordline", { body: { kind: "party_to", from: chen, to: proc, role: "petitioner", basis } });
  await me.act("recordline", { body: { kind: "party_to", from: clerk, to: proc, role: "respondent", basis } });
  await me.act("declare", { body: { modality: "duty", obligor: clerk, performance: { act: "produce the rent schedules" }, source: { kind: "court", standard: orderStd }, clause: "Order 3", arising_in: proc,
    trigger: { kind: "date", date: "2026-10-30" }, time: { basis: "window", date: "2026-10-30" } } });
  await me.act("followregister", { body: { address: "https://court.example/register/RG26", proceeding: proc, gated: { kind: "account" } } });
  /* the timeline: two meetings no date orders, and a progression threaded for the office */
  for (const d of [lease, rent]) await me.act("resolve", { body: { captureSha: d.sha } });
  const dated = async (d, kind, value) => (await me.act("recorddatedfact", { body: { captureSha: d.sha, extent: DOC, kind, value, method: "stated in the document" } })).dated_fact.dated_fact_id;
  const f1 = await dated(lease, "adopted", { value: "2024-03", precision: "edtf" }), f2 = await dated(rent, "adopted", "2024-03-15"), received = await dated(lease, "received", "2026-09-01");
  for (const f of [f1, f2]) await me.act("createevent", { body: { kind: "meeting", attestations: [{ datedFactId: f }], concerns: [org] } });
  const stages = [{ key: "sent", label: "Request sent", after: null, within: null, required: "always", cardinality: "1" },
    { key: "determination", label: "Determination", after: "sent", within: "10 days", required: "unless_exception", cardinality: "0..1" }];
  await me.act("progressiondefine", { body: { progressionKey: "pra", label: "A public records request", basis: "the agency determines within 10 days", citation: "Gov. Code 7922.535", stages } });
  await me.act("thread", { body: { progressionKey: "pra", entityId: org, placements: [{ stage: "sent", captureSha: lease.sha, datedFact: received }] } });
  const PATHS = { people: "/app/people", person: "/app/person/" + chen, theme: "/app/theme", explore: "/app/explore/" + chen, timeline: "/app/timeline/" + project, money: "/app/money/" + trail,
    calculation: "/app/calculation/" + calc, help: "/app/help", proceeding: "/app/proceeding/" + proc, "due-date": "/app/due-date/" + action, standard: "/app/standard/" + std, ties: "/app/ties",
    themeOne: "/app/theme/" + theme, matter: "/app/timeline/" + project + "/matter/pra/" + org, progression: "/app/timeline/" + project + "/progression/pra" };
  return { world, me, chen, org, PATHS };
})());

/* the graph a screen draws, answered with a node that has no name (a record the reading names only by its identifier): the screen asks `entityidonly` once for those */
const unnamed = (world, me) => rewrite(world, me, (req, a) => {
  const r = resultOf(a);
  if (!r || !Array.isArray(r.nodes)) return a;
  return { ...a, json: { ...a.json, result: { ...r, nodes: r.nodes.map((n) => (n.ring > 0 ? { ...n, label: null } : n)) } } };
});
const openTour = async (t, name, plane = {}) => openAs(t.world, t.me, t.PATHS[name], { plane: ["person", "explore"].includes(name) ? { exploregraph: unnamed(t.world, t.me), ...plane } : plane });

/* what the page's frame reads for itself (cause-shell-4, control-plane, queue) is what `help`, a screen that reads nothing, makes the page ask */
let frame = null;
const framed = async (t) => (frame ||= new Set((await openAs(t.world, t.me, t.PATHS.help)).requests.map((r) => r.op)));
/* and the roster the kit names members from (interface-shell R111), asked when a screen names a member */
const readsOf = (p) => p.requests.filter((r) => !frame.has(r.op) && r.op !== "memberlist");
const count = (rs) => rs.reduce((m, r) => { m[r.op] = (m[r.op] || 0) + 1; return m; }, {});
/* the reads of each screen of the module, as it opens over the world above (a per-item read is one for each item shown: money's `money` per figure, a theme's `image` per
   document placed in it; `entityidonly` is the one read for the unnamed nodes of a graph; `sequence` is asked for each order of the two meetings no date settles; `timeline` is asked for the set, then again with the project's documents for the events they attest) */
const OWN = {
  people: { peopledirectory: 1 },
  person: { exploregraph: 1, affordances: 1, peopledirectory: 1, entity: 1, readingname: 1, heldcaptures: 1, reading: 1, entityidonly: 1, person: 1, samepersoncandidates: 1 },
  theme: { themeread: 1 },
  explore: { exploregraph: 1, affordances: 1, peopledirectory: 1, explorepreset: 1, entityidonly: 1, heldcaptures: 1 },
  timeline: { image: 1, peopledirectory: 1, list: 1, heldcaptures: 1, affordances: 1, reading: 1, timeline: 2, instances: 1, sequence: 2 },
  money: { exploregraph: 1, heldcaptures: 1, list: 1, peopledirectory: 1, moneyset: 1, reading: 1, image: 1, money: 3 },
  calculation: { calculation: 1, heldcaptures: 1, spotcheck: 1 },
  help: {},
  proceeding: { entitieskind: 2, affordances: 1, entity: 1, partiesof: 1, proceedingdates: 1, follows: 1, heldcaptures: 1, peopledirectory: 1, standards: 1, dutiesof: 2, reading: 1 },
  "due-date": { action: 1, clockproposals: 1, clocksics: 1 },
  standard: { heldcaptures: 1, standard: 1, lawrelations: 1, standards: 1, content: 1, entitieskind: 2, reading: 2 },
  ties: { memberties: 1, peopledirectory: 1 },
  themeOne: { themeread: 1, image: 3 },
  matter: { image: 1, peopledirectory: 1, list: 1, heldcaptures: 1, affordances: 1, instance: 1 },
  progression: { image: 1, peopledirectory: 1, list: 1, heldcaptures: 1, affordances: 1, progression: 1 },
};

test("R4 R34 R52 C14 each screen of the module reads only what it draws, once: its own reads are exactly the set below, no read is asked twice with the same question, and the frame's `queue` and `bootstrap` are asked once", async () => {
  const t = await tour();
  await framed(t);
  assert.deepEqual(Object.keys(t.PATHS).sort(), Object.keys(OWN).sort(), "every screen of the module is opened");
  for (const name of Object.keys(t.PATHS)) {
    const p = await openTour(t, name);
    const own = readsOf(p);
    assert.deepEqual(count(own), OWN[name], `${name}: its reads`);
    const asked = own.map((r) => r.op + JSON.stringify(r.query) + JSON.stringify(r.body || null));
    assert.equal(new Set(asked).size, asked.length, `${name}: no read repeats`);
    for (const op of ["queue", "bootstrap"]) assert.ok(p.byOp(op).length <= 1, `${name}: ${op} once`);
  }
});

test("R18 C14 a graph with no step to colour does not read the connection vocabulary (`affordances`, 43 KB on the live copy), on money and on person; control: one step, one read", async () => {
  /* bare: a person and a project that nothing connects, in a world of their own */
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const lone = (await me.act("entitycreate", { body: { kind: "person", label: "L. Chen", note: "Named in the minutes." } })).entity_id;
  const project = await world.recipes.project(me, "Pothole repairs");
  const trail = await world.recipes.trail(me, project, "Pothole repairs, FY2026");
  /* stepped: the tour's person has a proxy and a post; a trail has no connection in the store, so money is served that person's real graph */
  const t = await tour();
  const today = new Date(t.world.now()).toISOString().slice(0, 10);
  const graph = await refused(t.world, t.me, "exploregraph", { centre: t.chen, at: { value: today, precision: "day", zone: "UTC" }, rings: 2 });
  assert.ok(graph.steps.length > 0, "the world's graph of a person has steps");
  /* the trail's own answer, with the person's real nodes and steps grafted on (every other part of the answer is the world's) */
  const served = { exploregraph: rewrite(t.world, t.me, (req, a) => (a && a.json && a.json.result ? { ...a, json: { ...a.json, result: { ...a.json.result, nodes: graph.nodes, steps: graph.steps } } } : a)) };
  const bareAt = { money: "/app/money/" + trail, person: "/app/person/" + lone };
  for (const name of ["money", "person"]) {
    const bare = await openAs(world, me, bareAt[name]);
    assert.equal(bare.byOp("exploregraph").length, 1, `${name}: the graph is read`);
    assert.equal(bare.byOp("affordances").length, 0, `${name}: no step, no vocabulary`);
    assert.ok(main(bare).querySelector(".mk-graph, [data-state=empty]") || main(bare).textContent.length > 0, `${name}: drawn`);
    const stepped = await openAs(t.world, t.me, t.PATHS[name], name === "money" ? { plane: served } : {});
    assert.equal(stepped.byOp("affordances").length, 1, `${name}: control, a step is coloured by its group, one read`);
  }
});

/* each read of each screen in turn answered with nothing, and with a refusal that carries neither code nor words: whatever is drawn is drawn whole in the member's words,
   with no entity of its own showing (`&#39;` is the apostrophe of "your team's Civicsmith did not answer" escaped twice) */
const ENTITY = /&(#\d+|amp|lt|gt|quot);/;
test("R10 C59 N3 a read of any screen of the module that did not answer, or was refused with neither code nor words, is drawn whole: the apostrophe plain, never escaped twice", async () => {
  const hows = { silent: () => silent, "refused with no code": () => ({ status: 200, json: { ok: true, result: { ok: false } } }) };
  const t = await tour();
  await framed(t);
  let drawn = 0;
  for (const name of Object.keys(t.PATHS)) {
    const reads = [...new Set(readsOf(await openTour(t, name)).map((r) => r.op))];
    for (const op of reads) for (const [how, answer] of Object.entries(hows)) {
      const p = await openTour(t, name, { [op]: answer });
      const text = main(p).textContent;
      const at = ENTITY.exec(text);
      assert.equal(at, null, `${name}, ${op} ${how}: ${at && text.slice(Math.max(0, at.index - 70), at.index + 40)}`);
      if (text.includes("did not answer")) drawn++;
    }
  }
  assert.ok(drawn > 0, "the failed sentence was drawn somewhere in the sweep");
});
