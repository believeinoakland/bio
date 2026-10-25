/* screens-investigate, T51 fix round 2 (wave 2): C14 (the screens' reads of the documents), C95 (the document picker: this project first, a
 * search, title and date), C94 (a member is named by handle) and C54 (the timeline's events found by the captures they cite), each proved at
 * the module's interface over a scripted plane, with the control that shows the fix is the cause. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn } from "../interface-shell/harness.mjs";
import { createHash } from "node:crypto";
import { SESSION_OPS } from "../../../src/op-declarations/index.mjs";
import { inWorld, openAs, settled, readHeld, declareStandard, rewrite } from "./world.mjs";
import { open, main, fill, press, plane, PATHS, MORE_PATHS, TRAIL, TIMELINE, FACTS, moneyAnswer, MATTER, DEF, PERSON, PERSON_ENTITY, STANDARD, STD_PROPOSALS, WALK, SPOT, CALCULATION,
  PROJECT_MD, ACTION, PROPOSALS, M1, P, ENT, ORG, SHA, SHA2, SHA3, STD, MSR, word, drew, dayOf } from "./fixtures.mjs";

const optsOf = (p, id) => p.doc.getElementById(id).querySelectorAll("option").map((o) => [o.getAttribute("value"), o.textContent]);
const P2 = "PROJ-2026-0009";
const REASON = "The minutes say so.";
/** The page chooses a document; its passages are read when the choice changes. */
const choose = async (p, id, sha) => {
  fill(p, { [id]: sha }); p.fire(p.doc.getElementById(id), "change");
  for (let i = 0; i < 3; i++) { await p.settle(20); await new Promise((r) => setTimeout(r, 30)); } /* a first read of a document answers before `settled` looks (it stalls otherwise) */
  await settled(p);
};
/** An op's answer as the world gives it with its result changed by `fn(result)`: a part of the world's own answer this build does not make (K5044 (1)). */
const changing = (world, me, op, fn) => rewrite(world, me, (req, a) => (a && a.json && a.json.result && req.url.includes("op=" + op)
  ? { ...a, json: { ...a.json, result: fn(a.json.result) } } : a));

/* ---------------------------------------------------------------- C14 */

const TITLES = ["Lease amendment 1", "Rent schedule", "Vouched minutes"];
const ORDINANCE = "Section 8.22.050 No landlord shall increase the rent above the limit the board sets.";
const POLICY = "The Director shall repair each reported pothole within seven calendar days.";

/** One project holding three documents, and a page of each screen on them: a person, a trail, two standards, a proceeding (a court, a docket) and a calculation. */
async function screensOf(world, me) {
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const project = await world.recipes.project(me, "Rent case");
  const docs = [];
  for (const t of TITLES) docs.push(await world.recipes.hold(me, t + ".txt", t === "Rent schedule" ? ORDINANCE : t === "Vouched minutes" ? POLICY : "The lease is amended: " + t + ".", project));
  const person = (await me.act("entitycreate", { body: { kind: "person", label: "Lin Chen", note: "Director of Public Works." } })).entity_id;
  const trail = await world.recipes.trail(me, project, "Records office budget, FY2026");
  const ou = await readHeld(world, me, docs[1].sha), pu = await readHeld(world, me, docs[2].sha);
  const ord = await declareStandard(me, { cite: "Ordinance 8.22", kind: "ordinance", sha: docs[1].sha, extent: ou[0].extent });
  const pol = await declareStandard(me, { cite: "Instruction 9.1", kind: "policy", issuer: "Public Works Department", sha: docs[2].sha, extent: pu[0].extent });
  const court = (await me.act("entitycreate", { body: { kind: "body", label: "Alameda Housing Tribunal", forum_kind: "court", note: "A court." } })).entity_id;
  const proc = (await me.act("entitycreate", { body: { kind: "proceeding", label: "Lease rent case", note: "From the caption.", proceeding: { forum: court, kind: "civil", number: "24CV123456" } } })).entity_id;
  const csv = await world.recipes.hold(me, "Payments.csv", "payer,payee,amount\nCity,Acme,5\nCity,Beta,7\n", project);
  const table = (await me.act("tabledeclare", { body: { source: { capture_sha: csv.sha, extent: { kind: "document" } }, header: ["payer", "payee", "amount"],
    schema: { fields: [{ name: "payer", type: "string" }, { name: "payee", type: "string" }, { name: "amount", type: "number" }] } } })).sha;
  const calc = (await me.act("calculationcreate", { body: { question: "How many payments?", period: { from: "2025-07-01", to: "2026-06-30" }, kind: "count", project, inputs: [{ name: "input", table }] } })).calc_id;
  return { project, docs, person, trail, ord, pol, proc, calc };
}

/* one act per screen, one that re-reads by default (no `rereads`) and sends something; each with the read it must still re-read */
const SCREENS = [
  ["person", (W) => "/app/person/" + W.person, "person-fact-doc", async (p) => { fill(p, { "person-alias": "Lin C." }); await press(p, "entityalias"); }, "entityalias", "entity"],
  ["timeline", (W) => "/app/timeline/" + W.project, "tl-doc", async (p, W) => { fill(p, { "tl-doc": W.docs[0].sha, "tl-date": "2024-05-01" }); await press(p, "recorddatedfact"); }, "recorddatedfact", "image"],
  ["money", (W) => "/app/money/" + W.trail, "mf-doc", async (p) => { fill(p, { "mf-expertise": "budgets" }); await press(p, "checkrequest", { reason: "the budget figures" }); }, "checkrequest", "moneyset"],
  ["standard", (W) => "/app/standard/" + W.pol, "st-doc", async (p, W) => { fill(p, { "st-type": "implements", "st-to": W.ord, "st-citation": W.cite }); await press(p, "lawrelate", { reason: "it implements the ordinance" }); }, "lawrelate", "standard"],
  ["proceeding", (W) => "/app/proceeding/" + W.proc, "pr-doc", async (p) => { fill(p, { "pr-register": "https://court.example/register/RG26" }); await press(p, "followregister"); }, "followregister", "entity"],
  ["calculation", (W) => "/app/calculation/" + W.calc, "calc-set", async (p) => { await press(p, "calculationaccept", { reason: "checked twice" }); }, "calculationaccept", "calculation"],
];

for (const [name, pathOf, field, act, op, reread] of SCREENS) {
  test(`R34 R52 C14 ${name}: the documents are read once when the screen opens, as the cheap picker read (held and vouched), and an act that changes no document does not read them again; control: the screen's own read is read again`, async () => {
    const { world, me } = await inWorld();
    const W = await screensOf(world, me);
    W.cite = (await me.read("standard", { query: { id: W.pol } })).texts[0].content_id;
    const p = await openAs(world, me, pathOf(W));
    const q = p.byOp("heldcaptures");
    assert.equal(q.length, 1, "one list of documents for the screen");
    assert.equal(q[0].query.fields, "picker", "the cheap read, a list to choose among");
    assert.equal(q[0].query.state, "held_and_vouched");
    const rows = (await me.read("heldcaptures", { query: { limit: "200", state: "held_and_vouched", fields: "picker" } })).held;
    assert.deepEqual(optsOf(p, field).map(([v]) => v).sort(), rows.map((r) => r.capture.sha256).sort(), "filled from the picker's rows");
    assert.ok(TITLES.every((t) => optsOf(p, field).some(([, x]) => x.split(" · ")[0].includes(t))), "each by its title");
    const before = p.byOp(reread).length;
    await act(p, W);
    await settled(p);
    assert.ok(p.byOp(op).length >= 1, "the act was sent");
    assert.ok(p.byOp(reread).length > before, "what the act changed is read again");
    assert.equal(p.byOp("heldcaptures").length, 1, "and the documents are not");
  });
}

test("R4 C14 money's act that files a document (acquire) reads the documents again; control: no other act of the screen does", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const project = await world.recipes.project(me, "Records office budget");
  const held = await world.recipes.hold(me, "Adopted budget.txt", "The adopted budget for the records office in fiscal year 2026 is 1,250,000.00 dollars.", project);
  const trail = await world.recipes.trail(me, project, "Records office budget, FY2026");
  const fact = (await me.act("recordfact", { body: { amount: "1250000.00", as_read: "$1,250,000", currency: "USD", sign: "+", precision: "exact", kind: "expenditure", phase: "adopted", basis: "budgetary",
    period: { from: "2025-07-01", to: "2026-06-30" }, source: { capture_sha: held.sha, extent: { kind: "document" } } } })).fact_id;
  await me.act("include", { body: { setId: trail, factId: fact, reason: REASON } });
  const filed = await world.recipes.hold(me, "City budget.txt", "The city budget as published.", project);
  /* the fetch of a site is externally driven (K5044 (1)): the copy it files is a real held document */
  const p = await openAs(world, me, "/app/money/" + trail, { plane: { acquire: ok({ ok: true, sha256: filed.sha }) } });
  const rowOf = () => main(p).querySelectorAll("tr.cs-r").find((r) => r.querySelector(`[data-id="${fact}"]`));
  await p.click(rowOf().querySelector('[data-shell="row"]'));
  assert.equal(p.byOp("heldcaptures").length, 1, "one list of documents for the screen");
  fill(p, { "mf-address": "https://city.example/budget.pdf" });
  await press(p, "acquire", { within: rowOf().nextElementSibling, reason: REASON });
  await settled(p);
  assert.equal(p.byOp("acquire").length, 1);
  assert.equal(p.byOp("heldcaptures").length, 2, "the new copy can be chosen");
});

/* ---------------------------------------------------------------- C95 */

const type = async (p, id, text) => { const el = p.doc.getElementById(id); el.value = text; p.fire(el, "input"); await p.clock.tick(1000); await p.settle(); };
const DAY = 86400000;

/** Two projects: "Council minutes" held in the other one (first), then in this one 40 days later, and a "Budget memo" held in this one. A trail of this project.
 *  `pickerRows` are the picker's rows as the store answers them, `here` the documents of this project in the owner's order, `others` the rest. */
async function alike(world, me) {
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const other = await world.recipes.project(me, "Lease renewals");
  const project = await world.recipes.project(me, "Records office budget");
  const away = await world.recipes.hold(me, "Council minutes", "The council met in August.", other);
  await world.tick(40 * DAY);
  const minutes = await world.recipes.hold(me, "Council minutes", "The council met in October.", project);
  const memo = await world.recipes.hold(me, "Budget memo", "The budget memo for the records office.", project);
  const trail = await world.recipes.trail(me, project, "Records office budget, FY2026");
  const rows = (await me.read("heldcaptures", { query: { limit: "200", state: "held_and_vouched", fields: "picker" } })).held;
  const shaOf = (r) => r.capture.sha256;
  const first = rows.filter((r) => r.project === project).map(shaOf), rest = rows.filter((r) => r.project !== project).map(shaOf);
  return { other, project, away, minutes, memo, trail, rows, here: first, others: rest, ordered: [...first, ...rest] };
}

test("R34 C95 the document picker lists this project's documents first, each by title and date, so documents titled alike can be told apart; control: with no project to put first, the owner's order stands", async () => {
  const { world, me } = await inWorld();
  const A = await alike(world, me);
  assert.deepEqual([...A.here].sort(), [A.minutes.sha, A.memo.sha].sort(), "the store tells which documents are this project's");
  const p = await openAs(world, me, "/app/money/" + A.trail);
  const opts = optsOf(p, "mf-doc");
  assert.deepEqual(opts.map(([v]) => v), A.ordered, "this project's first, the owner's order within each");
  const row = (sha) => A.rows.find((r) => r.capture.sha256 === sha);
  const text = (sha) => opts.find(([v]) => v === sha)[1];
  assert.ok(text(A.minutes.sha).includes("Council minutes") && text(A.minutes.sha).includes(dayOf(row(A.minutes.sha).collected_since.slice(0, 10))), "title and date: " + text(A.minutes.sha));
  assert.ok(text(A.away.sha).includes("Council minutes") && text(A.away.sha).includes(dayOf(row(A.away.sha).collected_since.slice(0, 10))), "the alike title is told apart by its date: " + text(A.away.sha));
  assert.notEqual(text(A.minutes.sha), text(A.away.sha), "the two alike titles are drawn differently");
  const bare = await openAs(world, me, "/app/person/" + (await me.act("entitycreate", { body: { kind: "person", label: "Lin Chen", note: "A person." } })).entity_id);
  assert.deepEqual(optsOf(bare, "person-fact-doc").map(([v]) => v), A.rows.map((r) => r.capture.sha256), "a screen with no project keeps the owner's order");
  const std = await declareStandard(me, { cite: "Ordinance 8.22", kind: "ordinance", sha: A.minutes.sha, extent: (await readHeld(world, me, A.minutes.sha))[0].extent });
  const here = await openAs(world, me, "/app/standard/" + std + "/" + A.project);
  assert.deepEqual(optsOf(here, "st-doc").map(([v]) => v), A.ordered, "the standard opened from its project puts that project's first");
});

test("R34 C95 a search box narrows the picker by title, without reading the documents again; control: emptying it offers them all, and a search that finds none says so and offers none", async () => {
  const { world, me } = await inWorld();
  const A = await alike(world, me);
  const p = await openAs(world, me, "/app/money/" + A.trail);
  assert.ok(p.doc.getElementById("mf-doc-q"), "the search box is drawn beside the picker");
  await type(p, "mf-doc-q", "budget");
  assert.deepEqual(optsOf(p, "mf-doc").map(([v]) => v), [A.memo.sha], "only the titles holding the words");
  await type(p, "mf-doc-q", "COUNCIL");
  assert.deepEqual(optsOf(p, "mf-doc").map(([v]) => v), A.ordered.filter((s) => s !== A.memo.sha), "case does not matter; this project's first");
  await type(p, "mf-doc-q", "");
  assert.deepEqual(optsOf(p, "mf-doc").map(([v]) => v), A.ordered, "emptied: all of them");
  await type(p, "mf-doc-q", "zzz");
  assert.equal(p.doc.getElementById("mf-doc"), null, "nothing to choose");
  drew(main(p), "form.choose.search.none");
  assert.ok(p.doc.getElementById("mf-doc-q"), "and the search stays so it can be changed");
  assert.equal(p.byOp("heldcaptures").length, 1, "narrowed on the page");
});

test("R34 C95 the search belongs to its own picker; control: a single document needs no search", async () => {
  const { world, me } = await inWorld();
  const A = await alike(world, me);
  const csv = await world.recipes.hold(me, "Payments.csv", "payer,payee,amount\nCity,Acme,5\nCity,Beta,7\n", A.project);
  const table = (await me.act("tabledeclare", { body: { source: { capture_sha: csv.sha, extent: { kind: "document" } }, header: ["payer", "payee", "amount"],
    schema: { fields: [{ name: "payer", type: "string" }, { name: "payee", type: "string" }, { name: "amount", type: "number" }] } } })).sha;
  const calc = (await me.act("calculationcreate", { body: { question: "How many payments?", period: { from: "2025-07-01", to: "2026-06-30" }, kind: "count", project: A.project, inputs: [{ name: "input", table }] } })).calc_id;
  const p = await openAs(world, me, "/app/calculation/" + calc);
  const all = optsOf(p, "calc-set").length;
  await type(p, "calc-set-q", "memo");
  assert.deepEqual(optsOf(p, "calc-set").map(([v]) => v), [A.memo.sha]);
  assert.equal(optsOf(p, "calc-wb").length, all, "another picker of the screen is not narrowed by it");
  const solo = await inWorld();
  const project = await solo.world.recipes.project(solo.me, "Records office budget");
  const only = await solo.world.recipes.hold(solo.me, "Budget memo", "The budget memo for the records office.", project);
  const trail = await solo.world.recipes.trail(solo.me, project, "Records office budget, FY2026");
  const one = await openAs(solo.world, solo.me, "/app/money/" + trail);
  assert.equal(one.doc.getElementById("mf-doc-q"), null);
  assert.deepEqual(optsOf(one, "mf-doc").map(([v]) => v), [only.sha]);
});

/* ---------------------------------------------------------------- C94 */

const NOBODY = () => word("shell.card.member");
const noIds = (el, ids = ["admin", "u-2", "u-3"]) => { for (const id of ids) assert.ok(!new RegExp("(^|[^\\w-])" + id + "([^\\w-]|$)").test(el.textContent), "an id is drawn: " + id); };

test("R1 R32 C94 person: the names of who added a name, declared a tie, made a claim and withdrew a fact are handles, the founder's included; a member with no handle is the kit's word, never the id", async () => {
  const entity = { ...PERSON_ENTITY, entity: { ...PERSON_ENTITY.entity, aliases: [
    { alias: "L. Chen", canonical: true, declared_by: "machine:roster", at: "2026-09-01T09:00:00Z", withdrawn: null },
    { alias: "Lin Chen", canonical: false, declared_by: "member:admin", at: "2026-10-01T09:00:00Z", withdrawn: null },
    { alias: "Lin C.", canonical: false, declared_by: "member:u-3", at: "2026-10-01T09:00:00Z", withdrawn: null }],
  relations: [{ ...PERSON_ENTITY.entity.relations[0], declared_by: "member:u-2" }] } };
  const person = PERSON({ claims: [{ claim_id: "IDC-2026-0001", a: ENT, b: "ENT-2026-0019", kind: "same_as", basis: "name", grade: "B", why: "both hold the post", by: "member:admin", at: "2026-10-03T09:00:00Z" }],
    facts: [{ ...PERSON().facts[0], fact_id: "PFA-2026-0008", withdrawn: { by: "member:admin", at: "2026-10-05T09:00:00Z", reason: "a typo" } }] });
  const p = await open(PATHS.person, { plane: { entity: ok(entity), person: ok(person) } });
  const m = main(p);
  drew(m, "entity.alias.by", { who: "sparky", date: dayOf("2026-10-01") });
  drew(m, "entity.alias.by", { who: NOBODY(), date: dayOf("2026-10-01") });
  drew(m, "entity.relation.declared", { who: "rosa", date: dayOf("2026-10-02"), where: "minutes, page 2" });
  drew(m, "screen.person.claim.by", { by: "sparky", date: dayOf("2026-10-03") });
  drew(m, "screen.person.facts.withdrawn.by", { name: "sparky", date: dayOf("2026-10-05"), reason: "a typo" });
  noIds(m);
  /* control: a handle the owner answers is drawn as itself */
  const given = await open(PATHS.person, { plane: { person: ok(PERSON({ facts: [{ ...PERSON().facts[0], withdrawn: { handle: "mai", by: "member:admin", at: "2026-10-05T09:00:00Z", reason: "a typo" } }] })) } });
  drew(main(given), "screen.person.facts.withdrawn.by", { name: "mai", date: dayOf("2026-10-05"), reason: "a typo" });
});

test("R8 C94 standard: who proposed a standard and who adopted it are handles; an assistant's class is not a member and keeps its name", async () => {
  const { world, me } = await inWorld();
  const rosa = await world.signIn("rosa", { admin: true });
  const project = await world.recipes.project(me, "Pothole repairs");
  const doc = await world.recipes.hold(me, "Ordinance.txt", "Section 8.22.050 No landlord shall increase the rent above the limit the board sets.", project);
  const du = await readHeld(world, me, doc.sha);
  const std = await declareStandard(me, { cite: "Ordinance 8.22", kind: "ordinance", sha: doc.sha, extent: du[0].extent });
  const content = (await me.read("standard", { query: { id: std } })).texts[0].content_id;
  const body = { project, cite: "Ordinance 9", kind: "ordinance", issuer: "City Council", why: "It governs the rent.", text: [content] };
  await me.act("standardpropose", { body });
  await me.act("standardpropose", { body: { ...body, cite: "Ordinance 10" } });
  const open = (await me.read("standardproposals", { query: { project, state: "all" } })).items;
  await rosa.act("standardadopt", { body: { proposal: open[0].id, reason: "Adopted at council." } });
  const items = (await me.read("standardproposals", { query: { project, state: "all" } })).items;
  const adopted = items.find((x) => x.adoption), unadopted = items.find((x) => !x.adoption);
  const path = "/app/standard/" + project + "/all";
  const p = await openAs(world, me, path);
  const m = main(p);
  drew(m, "screen.standard.proposedby", { by: me.handle, date: dayOf(unadopted.proposed_at.slice(0, 10)) });
  drew(m, "screen.standard.adopted", { by: "rosa", date: dayOf(adopted.adoption.at.slice(0, 10)) });
  noIds(m, [me.member]);
  /* an assistant's class (a proposal the live copy holds that a member's session does not make) and a member the roster does not know */
  const bot = await openAs(world, me, path, { plane: { standardproposals: changing(world, me, "standardproposals", (r) => ({ ...r, items: r.items.map((x) => ({ ...x, proposed_by: "class:legal_lookup", label: { ...x.label, by: "class:legal_lookup" } })) })) } });
  drew(main(bot), "screen.standard.proposedby", { by: "legal_lookup", date: dayOf(unadopted.proposed_at.slice(0, 10)) });
  const bare = await openAs(world, me, path, { plane: { standardproposals: changing(world, me, "standardproposals", (r) => ({ ...r, items: r.items.map((x) => ({ ...x, proposed_by: "member:u-3" })) })) } });
  drew(main(bare), "screen.standard.proposedby", { by: NOBODY(), date: dayOf(unadopted.proposed_at.slice(0, 10)) });
  noIds(main(bare), ["u-3"]);
});

test("R3 R33 C94 timeline: who threaded a document to a step and who declared a flow are handles; control: a member with no handle is the kit's word", async () => {
  const matter = MATTER({ threads: [{ ...MATTER().threads[0], threaded_by: "member:admin" }] });
  const p = await open(MORE_PATHS.matter, { plane: { instance: ok(matter) } });
  drew(main(p), "progression.threadedby", { date: dayOf("2026-09-22"), who: "sparky", when: dayOf("2026-09-22") });
  noIds(main(p));
  const def = await open(MORE_PATHS.progression, { plane: { progression: ok(DEF({ declared_by: "member:admin", versions: [{ version: 1, declared_by: "member:u-2", at: "2026-09-24T09:00:00Z", basis: { statement: "first", citation: null } }] })) } });
  drew(main(def), "screen.timeline.progression.sub", { what: "A public records request", n: "2", name: "sparky", date: dayOf("2026-09-30") });
  drew(main(def), "screen.timeline.progression.sub", { what: "A public records request", n: "1", name: "rosa", date: dayOf("2026-09-24") });
  noIds(main(def));
  const bare = await open(MORE_PATHS.matter, { plane: { instance: ok(MATTER({ threads: [{ ...MATTER().threads[0], threaded_by: "member:u-3" }] })) } });
  drew(main(bare), "progression.threadedby", { date: dayOf("2026-09-22"), who: NOBODY(), when: dayOf("2026-09-22") });
  noIds(main(bare));
});

test("R4 R23 C94 money: who started the trail and who read a figure are handles", async () => {
  const trail = TRAIL({ set: { ...TRAIL().set, by: "member:admin" } });
  const p = await open(PATHS.money, { plane: { moneyset: ok(trail), money: (r) => ok(moneyAnswer(r.query.id === M1 ? { ...FACTS[M1], by: "member:admin" } : FACTS[r.query.id])) } });
  const card = (key, vars) => main(p).querySelectorAll("[data-tip]").some((e) => e.getAttribute("data-tip").includes(word(key, vars)));
  assert.ok(card("screen.money.startedby", { by: "sparky" }), "the trail's card says who started it, by handle");
  const row = main(p).querySelectorAll("tr.cs-r").find((r) => r.querySelector(`[data-id="${M1}"]`));
  await p.click(row.querySelector('[data-shell="row"]'));
  drew(row.nextElementSibling, "screen.money.asread", { as_read: "4,200,000", by: "sparky" });
  noIds(main(p));
  assert.ok(!main(p).querySelectorAll("[data-tip]").some((e) => /(^|[^\w-])admin([^\w-]|$)/.test(e.getAttribute("data-tip"))), "and no card names an id");
});

test("R2 R18 R35 C94 explore: who attached a source to a step is a handle, on the page and in the graph", async () => {
  const gr = { ...(await import("./fixtures.mjs")).GRAPH() };
  gr.steps = gr.steps.concat([{ id: "REL-9", from: ENT, to: "ENT-2026-0200", kind: "step_source", word: "step sourced", class: "evidentiary", attached_by: "member:admin", at: "2026-10-05T09:00:00Z", grade: { assertion: "B", ends: ["B", "B"] }, evidence: [{ capture_sha: SHA }], valid: {} }]);
  const p = await open(PATHS.person, { plane: { exploregraph: ok(gr) } });
  drew(main(p).querySelector("[data-attached]"), "screen.explore.attached", { by: "sparky", date: dayOf("2026-10-05") });
  noIds(main(p));
});

test("R5 R7 C94 calculation and due date: who accepted a calculation, who visited a drawn item and who proposed a due date are handles", async () => {
  const calc = CALCULATION({ accepted_by: "member:admin", accepted_at: "2026-10-07T09:00:00Z" });
  const spot = SPOT({ items: SPOT().items.map((it, i) => (i === 0 ? { ...it, visits: it.visits.map((v) => ({ ...v, visitor: "member:admin" })) } : it)) });
  const p = await open(PATHS.calculation, { plane: { calculation: ok(calc), spotcheck: ok(spot) } });
  drew(main(p), "screen.calculation.accepted", { by: "sparky", date: dayOf("2026-10-07") });
  drew(main(p), "screen.calculation.visit", { finding: word("screen.calculation.finding.yes"), by: "sparky", date: dayOf("2026-10-06") });
  noIds(main(p));
  const prop = { ...PROPOSALS, proposals: PROPOSALS.proposals.map((x) => ({ ...x, proposed_by: "member:admin", label: { ...x.label, by: "member:admin" } })) };
  const d = await open(PATHS["due-date"], { plane: { clockproposals: ok(prop) } });
  drew(main(d), "screen.due-date.proposal", { by: "sparky" });
  noIds(main(d));
});

/* ---------------------------------------------------------------- C54 */

const MINUTES = "The council met on March 3, 2026 and adopted the budget.";
const hex = (x) => createHash("sha256").update(x).digest("hex");

/** A project started as Home's "Start a project" starts it, its document naming `entity` among its references (`promote` of the project's document). Answers its bundle id. */
async function projectNaming(world, me, title, entity) {
  const now = new Date(world.now()).toISOString().replace(/\.\d{3}Z$/, "Z");
  const text = "---\nobject_type: project\ntitle: " + JSON.stringify(title) + "\nobjective: " + JSON.stringify(title) + "\ncurrent_state: forming\ncreated: \"" + now
    + "\"\nlast_updated: \"" + now + "\"\nreferences:\n  - target: " + entity + "\n    rel: cites\n    status: active\n---\n\n## Session Log\n\n### Session " + now + " | Formation | interactive\nTrigger: test\nChanges: created.\n";
  const made = await me.act("promote", { body: { base: null, snapKey: now.replace(/[-:]/g, "") + "_" + hex(title).slice(0, 8),
    meta: { object_type: "project", title, current_state: "forming", created: now, last_updated: now }, files: [{ path: "bundle.md", text }], register: [], visibility: "discoverable" } });
  return made.bundleId;
}

/** The event the world holds for the capture, found as the timeline finds it (`events` R53: by the captures an attestation cites). */
const eventsOf = async (me, sha) => { const r = await me.read("timeline", { query: { captures: sha } }); return [...r.world.items, ...r.world.placed_nowhere]; };

test("R3 R33 C54 an event recorded on a project whose document names no person, organization or event survives a reload: the timeline reads the project's own captures, the screen sends no concerns and keeps no list in page memory; control: a project whose documents are others does not show it", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const project = await world.recipes.project(me, "Pothole repairs");
  const held = await world.recipes.hold(me, "Council minutes.txt", MINUTES, project);
  const other = await world.recipes.project(me, "Lease renewals");
  await world.recipes.hold(me, "Council minutes.txt", MINUTES + " The lease was renewed.", other);
  const p = await openAs(world, me, "/app/timeline/" + project);
  assert.equal(p.byOp("timeline")[0].query.captures, held.sha, "read by the project's captures");
  await choose(p, "tl-doc", held.sha);
  fill(p, { "tl-kind": "meeting", "tl-date": "2026-03-03" });
  await press(p, "createevent", { reason: REASON });
  await settled(p);
  const sent = p.byOp("createevent");
  assert.equal(sent.length, 1);
  assert.equal(sent[0].body.concerns, undefined, "tied to the document it comes from, not to a person the page guessed");
  const found = await eventsOf(me, held.sha);
  assert.equal(found.length, 1, "the store holds the event, found by the project's capture");
  const id = found[0].event_id;
  assert.ok(main(p).querySelector(`[data-event="${id}"]`), "drawn from the record at once");
  const again = await openAs(world, me, "/app/timeline/" + project);
  assert.ok(main(again).querySelector(`[data-event="${id}"]`), "and after a reload, with nothing kept in the page");
  assert.ok(optsOf(again, "tl-event").map(([v]) => v).includes(id), "it can be chosen for who took part, a dated fact, a link");
  const elsewhere = await openAs(world, me, "/app/timeline/" + other);
  assert.equal(main(elsewhere).querySelector(`[data-event="${id}"]`), null, "another project's documents do not find it");
});

test("R3 C54 a project that names an entity records its event the same way: no entity is guessed from the document", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const entity = (await me.act("entitycreate", { body: { kind: "person", label: "Lin Chen", note: "Director of Public Works." } })).entity_id;
  const project = await projectNaming(world, me, "Pothole repairs", entity);
  const held = await world.recipes.hold(me, "Council minutes.txt", MINUTES, project);
  const p = await openAs(world, me, "/app/timeline/" + project);
  await choose(p, "tl-doc", held.sha);
  fill(p, { "tl-kind": "meeting", "tl-date": "2026-03-03" });
  await press(p, "createevent", { reason: REASON });
  await settled(p);
  assert.equal(p.byOp("createevent")[0].body.concerns, undefined);
  const found = await eventsOf(me, held.sha);
  assert.equal(found.length, 1, "the store holds it, found by the document it comes from");
  assert.deepEqual((await me.read("event", { query: { id: found[0].event_id } })).event.concerns || [], [], "and it concerns no entity the page guessed");
});

/* ---------------------------------------------------------------- C8 (the send) */

test("R4 C8 the figure's proposal to a trail (moneysetpropose) is an op a member's session may send; control: an op that is no session's is not in the set", () => {
  assert.ok(SESSION_OPS.member.has("moneysetpropose"), "reached by a member's session");
  assert.ok(SESSION_OPS.member.has("moneysetinclude"), "as the act it leads to is");
  assert.ok(!SESSION_OPS.member.has("no-such-op"));
});

/* ---------------------------------------------------------------- DEC-396 keys (B21) */

test("R8 C61 the project's list of held standards is headed by its own key and says when it is cut; control: a whole list says nothing of a cut", async () => {
  const { world, me } = await inWorld();
  const project = await world.recipes.project(me, "Pothole repairs");
  const doc = await world.recipes.hold(me, "Ordinance.txt", "Section 8.22.050 No landlord shall increase the rent above the limit the board sets.", project);
  const du = await readHeld(world, me, doc.sha);
  const declare = (i) => declareStandard(me, { cite: "Ordinance 8." + i, kind: "ordinance", sha: doc.sha, extent: du[0].extent });
  await declare(0);
  const whole = await openAs(world, me, "/app/standard/" + project);
  assert.equal((await me.read("standards", { query: { limit: "200" } })).truncated, false);
  assert.equal(main(whole).querySelector("[data-held-more]"), null);
  /* more standards than one read holds (the page asks for 200) */
  for (let i = 1; i <= 200; i++) await declare(i);
  const read = await me.read("standards", { query: { limit: "200" } });
  assert.equal(read.truncated, true, "the store cuts the list");
  const cut = await openAs(world, me, "/app/standard/" + project);
  const sec = main(cut).querySelector("[data-held-standards]");
  assert.equal(sec.querySelector("h2").textContent, word("screen.standard.held"));
  drew(sec, "screen.standard.held.more");
});

test("R4 C8 a figure a member proposed to the trail is drawn by the member-proposal key; control: a machine's proposal keeps the other", async () => {
  const prop = (by) => TRAIL({ proposals: [{ proposal_id: 1, fact_id: M1, method: "m", by, at: "2026-10-21T09:00:00Z", label: "proposed", trail: { from: { stated: true }, to: { stated: true }, moved: { state: "undetermined" }, gaps: [] } }], inclusions: [], exclusions: [] });
  const row = (p) => main(p).querySelectorAll("tr.cs-r").find((r) => r.querySelector(`[data-id="${M1}"]`));
  const mem = await open(PATHS.money, { plane: { moneyset: ok(prop("member:mai")) } });
  drew(row(mem), "screen.money.proposed.member");
  const bot = await open(PATHS.money, { plane: { moneyset: ok(prop("class:daemon")) } });
  drew(row(bot), "screen.money.proposed");
  assert.ok(!row(bot).textContent.includes(word("screen.money.proposed.member")));
});
