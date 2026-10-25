/* screens-investigate, T51 fix round 2 (wave 2): C14 (the screens' reads of the documents), C95 (the document picker: this project first, a
 * search, title and date), C94 (a member is named by handle) and C54 (the timeline's events found by the captures they cite), each proved at
 * the module's interface over `store-request`'s world (the real store, a real sign-in; each state made by the members' own acts), with the control that shows
 * the fix is the cause. Scripted: an externally driven answer (the fetch of a site) and a record the live copy holds that a member's session of this build does not make. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok } from "../interface-shell/harness.mjs";
import { createHash } from "node:crypto";
import { SESSION_OPS } from "../../../src/op-declarations/index.mjs";
import { WORLD_FOUNDER_HANDLE, inWorld, openAs, settled, readHeld, declareStandard, rewrite } from "./world.mjs";
import { main, fill, press, word, drew, dayOf } from "./fixtures.mjs";

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
  const fact = (await me.act("recordfact", { body: { amount: "1250000.00", as_read: "$1,250,000", currency: "USD", sign: "+", precision: "exact", kind: "expenditure", phase: "adopted", basis: "budgetary",
    period: { from: "2025-07-01", to: "2026-06-30" }, source: { capture_sha: docs[0].sha, extent: { kind: "document" } } } })).fact_id;
  await me.act("include", { body: { setId: trail, factId: fact, reason: REASON } });
  const ou = await readHeld(world, me, docs[1].sha), pu = await readHeld(world, me, docs[2].sha);
  const ord = await declareStandard(me, { cite: "Ordinance 8.22", kind: "ordinance", sha: docs[1].sha, extent: ou[0].extent });
  const pol = await declareStandard(me, { cite: "Instruction 9.1", kind: "policy", issuer: "Public Works Department", sha: docs[2].sha, extent: pu[0].extent });
  const court = (await me.act("entitycreate", { body: { kind: "body", label: "Alameda Housing Tribunal", forum_kind: "court", note: "A court." } })).entity_id;
  const proc = (await me.act("entitycreate", { body: { kind: "proceeding", label: "Lease rent case", note: "From the caption.", proceeding: { forum: court, kind: "civil", number: "24CV123456" } } })).entity_id;
  const csv = await world.recipes.hold(me, "Payments.csv", "payer,payee,amount\nCity,Acme,5\nCity,Beta,7\n", project);
  const table = (await me.act("tabledeclare", { body: { source: { capture_sha: csv.sha, extent: { kind: "document" } }, header: ["payer", "payee", "amount"],
    schema: { fields: [{ name: "payer", type: "string" }, { name: "payee", type: "string" }, { name: "amount", type: "number" }] } } })).sha;
  const calc = (await me.act("calculationcreate", { body: { question: "How many payments?", period: { from: "2025-07-01", to: "2026-06-30" }, kind: "count", project, inputs: [{ name: "input", table }] } })).calc_id;
  return { project, docs, person, trail, fact, ord, pol, proc, calc };
}

/* one act per screen, one that re-reads by default (no `rereads`) and sends something; each with the read it must still re-read */
const SCREENS = [
  ["person", (W) => "/app/person/" + W.person, "person-fact-doc", async (p) => { fill(p, { "person-alias": "Lin C." }); await press(p, "entityalias"); }, "entityalias", "entity"],
  ["timeline", (W) => "/app/timeline/" + W.project, "tl-doc", async (p, W) => { fill(p, { "tl-doc": W.docs[0].sha, "tl-date": "2024-05-01" }); await press(p, "recorddatedfact"); }, "recorddatedfact", "image"],
  ["money", (W) => "/app/money/" + W.trail, "mf-doc", async (p, W) => {
    const rowOf = () => main(p).querySelectorAll("tr.cs-r").find((r) => r.querySelector(`[data-id="${W.fact}"]`));
    await p.click(rowOf().querySelector('[data-shell="row"]'));
    fill(p, { "mf-expertise": "budgets" }); await press(p, "checkrequest", { within: rowOf().nextElementSibling, reason: "the budget figures" });
  }, "checkrequest", "moneyset"],
  ["standard", (W) => "/app/standard/" + W.pol, "st-doc", async (p, W) => { fill(p, { "st-type": "implements", "st-to": W.ord, "st-citation": W.cite }); await press(p, "lawrelate", { reason: "it implements the ordinance" }); }, "lawrelate", "standard"],
  ["proceeding", (W) => "/app/proceeding/" + W.proc, "pr-doc", async (p) => { fill(p, { "pr-register": "https://court.example/register/RG26" }); await press(p, "followregister"); }, "followregister", "entity"],
  ["calculation", (W) => "/app/calculation/" + W.calc, "calc-wb", async (p) => { await press(p, "calculationaccept", { reason: "checked twice" }); }, "calculationaccept", "calculation"],
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

/** Two projects: "Council minutes" held in the other one (first), then in this one 2 days later, and a "Budget memo" held in this one. A trail of this project.
 *  `pickerRows` are the picker's rows as the store answers them, `here` the documents of this project in the owner's order, `others` the rest. */
async function alike(world, sitting) {
  let me = sitting;
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const other = await world.recipes.project(me, "Lease renewals");
  const project = await world.recipes.project(me, "Records office budget");
  const away = await world.recipes.hold(me, "Council minutes.txt", "The council met in August.", other);
  await world.tick(2 * DAY);
  me = await world.signIn(WORLD_FOUNDER_HANDLE, { admin: true }); /* the first sitting has ended */
  const minutes = await world.recipes.hold(me, "Council minutes.txt", "The council met on October 6, 2026 and adopted the budget for the records office.", project);
  const memo = await world.recipes.hold(me, "Budget memo.txt", ORDINANCE, project);
  const trail = await world.recipes.trail(me, project, "Records office budget, FY2026");
  const rows = (await me.read("heldcaptures", { query: { limit: "200", state: "held_and_vouched", fields: "picker" } })).held;
  const shaOf = (r) => r.capture.sha256;
  const here = rows.filter((r) => r.project === project).map(shaOf), rest = rows.filter((r) => r.project !== project).map(shaOf);
  return { other, project, away, minutes, memo, trail, rows, me, here, others: rest, ordered: [...here, ...rest] };
}

test("R34 C95 the document picker lists this project's documents first, each by title and date, so documents titled alike can be told apart; control: with no project to put first, the owner's order stands", async () => {
  const { world, me: sitting } = await inWorld();
  const A = await alike(world, sitting), me = A.me;
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
  const units = await readHeld(world, me, A.memo.sha);
  assert.ok(units.length, "the memo is read");
  const std = await declareStandard(me, { cite: "Ordinance 8.22", kind: "ordinance", sha: A.memo.sha, extent: units[0].extent });
  const here = await openAs(world, me, "/app/standard/" + std + "/" + A.project);
  assert.deepEqual(optsOf(here, "st-doc").map(([v]) => v), A.ordered, "the standard opened from its project puts that project's first");
});

test("R34 C95 a search box narrows the picker by title, without reading the documents again; control: emptying it offers them all, and a search that finds none says so and offers none", async () => {
  const { world, me: sitting } = await inWorld();
  const A = await alike(world, sitting), me = A.me;
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
  const { world, me: sitting } = await inWorld();
  const A = await alike(world, sitting), me = A.me;
  const csv = await world.recipes.hold(me, "Payments.csv", "payer,payee,amount\nCity,Acme,5\nCity,Beta,7\n", A.project);
  const table = (await me.act("tabledeclare", { body: { source: { capture_sha: csv.sha, extent: { kind: "document" } }, header: ["payer", "payee", "amount"],
    schema: { fields: [{ name: "payer", type: "string" }, { name: "payee", type: "string" }, { name: "amount", type: "number" }] } } })).sha;
  const calc = (await me.act("calculationcreate", { body: { question: "How many payments?", period: { from: "2025-07-01", to: "2026-06-30" }, kind: "count", project: A.project, inputs: [{ name: "input", table }] } })).calc_id;
  const p = await openAs(world, me, "/app/calculation/" + calc);
  const tables = optsOf(p, "calc-set").map(([v]) => v);
  assert.ok(tables.length > 1, "the screen's other choice (the tables it draws from) is drawn");
  await type(p, "calc-wb-q", "memo");
  assert.deepEqual(optsOf(p, "calc-wb").map(([v]) => v), [A.memo.sha]);
  assert.deepEqual(optsOf(p, "calc-set").map(([v]) => v), tables, "another choice of the screen is not narrowed by it");
  const solo = await inWorld();
  const project = await solo.world.recipes.project(solo.me, "Records office budget");
  const only = await solo.world.recipes.hold(solo.me, "Budget memo.txt", ORDINANCE, project);
  const trail = await solo.world.recipes.trail(solo.me, project, "Records office budget, FY2026");
  const one = await openAs(solo.world, solo.me, "/app/money/" + trail);
  assert.equal(one.doc.getElementById("mf-doc-q"), null);
  assert.deepEqual(optsOf(one, "mf-doc").map(([v]) => v), [only.sha]);
});

/* ---------------------------------------------------------------- C94 */

const NOBODY = () => word("shell.card.member");
const noIds = (el, ids = ["admin", "u-2", "u-3"]) => { for (const id of ids) assert.ok(!new RegExp("(^|[^\\w-])" + id + "([^\\w-]|$)").test(el.textContent), "an id is drawn: " + id); };

test("R1 R32 C94 person: the names of who added a name, declared a tie, made a claim and withdrew a fact are handles, the founder's included; a member with no handle is the kit's word, never the id", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const mai = await world.signIn("mai", { admin: false }), dev = await world.signIn("dev", { admin: false });
  const org = (await me.act("entitycreate", { body: { kind: "body", label: "Public Works Department", note: "A city department" } })).entity_id;
  const chen = (await me.act("entitycreate", { body: { kind: "person", label: "L. Chen", note: "Director of the department" } })).entity_id;
  const twin = (await me.act("entitycreate", { body: { kind: "person", label: "Lin Chen", note: "A second record" } })).entity_id;
  const project = await world.recipes.project(me, "Pothole repairs");
  const lease = await world.recipes.hold(me, "Lease amendment 1.txt", "Lin Chen, Director of Public Works. Appointed in March 2022.", project);
  await me.act("entityalias", { body: { entityId: chen, alias: "Lin Chen" } });
  await mai.act("entityalias", { body: { entityId: chen, alias: "Lin C." } });
  await dev.act("relationdeclare", { body: { fromEntity: chen, toEntity: org, relation: "member_of", justification: "sits on its board", citation: "minutes, page 2" } });
  const claimed = await me.act("identityclaim", { body: { a: chen, b: twin, kind: "same_as", basis: "testimony", note: "I met both at the same meeting" } });
  const cite = { captureSha: lease.sha, extent: { kind: "document" } };
  const kept = await me.act("recordpersonfact", { body: { person: chen, kind: "locality", value: "Oakview district", valid: { from: "2022-03-01", to: "2030-12-31" }, citation: cite } });
  const gone = await me.act("recordpersonfact", { body: { person: chen, kind: "contact", value: "old@example.org", valid: { from: "2020-01-01", to: "2030-12-31" }, citation: cite } });
  const w = (await me.act("personfactwithdraw", { body: { factId: gone.fact_id, reason: "a typo" } })).withdrawn;
  const path = "/app/person/" + chen;
  /* person answers no withdrawn fact (REPORTED in person.test.mjs, R32 (2)): the record the live copy holds is the withdrawn fact beside the store's own answer */
  const withWithdrawn = (extra = {}) => rewrite(world, me, (req, a) => {
    if (!(a && a.json && a.json.result && req.url.includes("op=person") && Array.isArray(a.json.result.facts) && a.json.result.facts.length)) return a;
    const f = a.json.result.facts.find((x) => x.fact_id === kept.fact_id) || a.json.result.facts[0];
    return { ...a, json: { ...a.json, result: { ...a.json.result, facts: a.json.result.facts.concat([{ ...f, fact_id: gone.fact_id, withdrawn: { ...w, ...extra } }]) } } };
  });
  const p = await openAs(world, me, path, { plane: { person: withWithdrawn() } });
  const m = main(p);
  const ent = (await me.read("entity", { query: { id: chen } })).entity;
  const at = (who) => dayOf(ent.aliases.find((x) => x.alias === who).at.slice(0, 10));
  drew(m, "entity.alias.by", { who: mai.handle, date: at("Lin C.") });
  drew(m, "entity.alias.by", { who: me.handle, date: at("Lin Chen") });
  drew(m, "entity.relation.declared", { who: dev.handle, date: dayOf(ent.relations[0].at.slice(0, 10)), where: "minutes, page 2" });
  const read = await me.read("person", { query: { id: chen, at: p.byOp("person")[0].query.at } });
  const mine = read.claims.find((c) => c.claim_id === claimed.claim_id);
  drew(m, "screen.person.claim.by", { by: me.handle, date: dayOf(mine.at.slice(0, 10)) });
  drew(m, "screen.person.facts.withdrawn.by", { name: me.handle, date: dayOf(w.at.slice(0, 10)), reason: "a typo" });
  noIds(m, [me.member]); /* a member who signed in by her handle has no other id; the founder has */
  /* a member the roster does not know: an alias, a tie, a claim and a fact declared by an id with no handle */
  const unknown = rewrite(world, me, (req, a) => {
    if (!(a && a.json && a.json.result)) return a;
    const r = JSON.parse(JSON.stringify(a.json.result));
    if (req.url.includes("op=entity") && r.entity) { r.entity.aliases.forEach((x) => { if (x.alias === "Lin C.") x.declared_by = "member:u-3"; }); r.entity.relations.forEach((x) => { x.declared_by = "member:u-2"; }); }
    else return a;
    return { ...a, json: { ...a.json, result: r } };
  });
  const bare = await openAs(world, me, path, { plane: { entity: unknown } });
  drew(main(bare), "entity.alias.by", { who: NOBODY(), date: at("Lin C.") });
  drew(main(bare), "entity.relation.declared", { who: NOBODY(), date: dayOf(ent.relations[0].at.slice(0, 10)), where: "minutes, page 2" });
  noIds(main(bare), ["u-2", "u-3"]);
  /* control: a handle the owner answers is drawn as itself */
  const given = await openAs(world, me, path, { plane: { person: withWithdrawn({ handle: mai.handle }) } });
  drew(main(given), "screen.person.facts.withdrawn.by", { name: mai.handle, date: dayOf(w.at.slice(0, 10)), reason: "a typo" });
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

const iso = (world) => new Date(world.now()).toISOString().replace(/\.\d{3}Z$/, "Z");
const OFFICE_REF = [{ kind: "office", key: "public-works", label: "Public Works Director" }];

/** A file the member holds, as `recipes.hold` holds it, with the reading the document carries: the references (`entities`) its reading names, so the record can
 *  resolve it to an entity (`resolve`), as a recognised document is. Answers `{sha, bundle}`. */
async function holdRead(world, me, name, text, project, entities = []) {
  const up = await world.door({ url: `/api/?${new URLSearchParams({ op: "captureupload", statement: name, name })}`,
    init: { method: "POST", headers: { "content-type": "text/plain" }, body: new TextEncoder().encode(text) } }, me);
  const doc = up.json.result.document;
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
  const len = (x) => new TextEncoder().encode(x).length;
  const files = [{ path: "bundle.md", text: front, bytes: len(front), sha256: hex(front) }, { path: "data/provenance.json", text: prov, bytes: len(prov), sha256: hex(prov) },
    { path: "data/dataset.json", text: dataset, bytes: len(dataset), sha256: hex(dataset) }, { path: doc.file, blobSha: sha, sha256: sha, bytes: doc.capture.bytes }];
  const register = [{ sha256: sha, path: doc.file, encoding: doc.capture.encoding, bytes: doc.capture.bytes }];
  const made = await me.act("promote", { body: { bundleId: id, base: null, snapKey: now.replace(/[-:]/g, "") + "_" + hex(id).slice(0, 8),
    meta: { object_type: "information", title: name, current_state: "collected", created: now, last_updated: now }, files, register } });
  return { sha, bundle: made.bundleId || id };
}

const STAGES = (loose) => [{ key: "sent", label: "Request sent", after: null, within: null, required: "always", cardinality: "1" },
  { key: "determination", label: "Determination", after: "sent", within: "10 days", required: "unless_exception", cardinality: loose ? "0..n" : "0..1" }];

test("R3 R33 C94 timeline: who threaded a document to a step and who declared a flow are handles; control: a member with no handle is the kit's word", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const dev = await world.signIn("dev", { admin: false });
  const org = (await me.act("entitycreate", { body: { kind: "office", label: "Public Works Director", note: "The city's office for repairs." } })).entity_id;
  const project = await world.recipes.project(me, "Pothole repairs");
  const held = await holdRead(world, me, "Lease amendment 1", "The amendment was adopted by the council.", project, OFFICE_REF);
  const df = (await me.act("recorddatedfact", { body: { captureSha: held.sha, extent: { kind: "document" }, kind: "received", value: "2026-09-01", method: "stated in the document" } })).dated_fact.dated_fact_id;
  await me.act("resolve", { body: { captureSha: held.sha } });
  await dev.act("progressiondefine", { body: { progressionKey: "pra", label: "A public records request", basis: "first", citation: "Gov. Code 7922.535", stages: STAGES(true) } });
  await me.act("progressiondefine", { body: { progressionKey: "pra", label: "A public records request", basis: "the agency determines within 10 days", citation: "Gov. Code 7922.535", stages: STAGES(false) } });
  await dev.act("thread", { body: { progressionKey: "pra", entityId: org, placements: [{ stage: "sent", captureSha: held.sha, datedFact: df }] } });
  const matterAt = "/app/timeline/" + project + "/matter/pra/" + org;
  const matter = await me.read("instance", { query: { key: "pra", id: org } });
  const th = matter.threads.at(-1);
  const p = await openAs(world, me, matterAt);
  drew(main(p), "progression.threadedby", { date: dayOf("2026-09-01"), who: dev.handle, when: dayOf(th.at.slice(0, 10)) });
  noIds(main(p), [me.member]);
  const def = await me.read("progression", { query: { key: "pra" } });
  const d = await openAs(world, me, "/app/timeline/" + project + "/progression/pra");
  const ver = (n) => def.versions.find((v) => v.version === n);
  drew(main(d), "screen.timeline.progression.sub", { what: def.label, n: "2", name: me.handle, date: dayOf(def.at.slice(0, 10)) });
  drew(main(d), "screen.timeline.progression.sub", { what: def.label, n: "1", name: dev.handle, date: dayOf(ver(1).at.slice(0, 10)) });
  noIds(main(d), [me.member]);
  /* control: a member the roster does not know (a thread the live copy holds that no member's session of this build makes) */
  const unknown = rewrite(world, me, (req, a) => {
    if (!(a && a.json && a.json.result && Array.isArray(a.json.result.threads) && req.url.includes("op=instance"))) return a;
    return { ...a, json: { ...a.json, result: { ...a.json.result, threads: a.json.result.threads.map((t) => ({ ...t, threaded_by: "member:u-3" })) } } };
  });
  const bare = await openAs(world, me, matterAt, { plane: { instance: unknown } });
  drew(main(bare), "progression.threadedby", { date: dayOf("2026-09-01"), who: NOBODY(), when: dayOf(th.at.slice(0, 10)) });
  noIds(main(bare), ["u-3"]);
});

test("R4 R23 C94 money: who started the trail and who read a figure are handles", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const project = await world.recipes.project(me, "Records office budget");
  const held = await world.recipes.hold(me, "Adopted budget.txt", "The adopted budget for the records office in fiscal year 2026 is 4,200,000.00 dollars.", project);
  const trail = await world.recipes.trail(me, project, "Records office budget, FY2026");
  const fact = (await me.act("recordfact", { body: { amount: "4200000.00", as_read: "4,200,000", currency: "USD", sign: "+", precision: "exact", kind: "expenditure", phase: "adopted", basis: "budgetary",
    period: { from: "2025-07-01", to: "2026-06-30" }, source: { capture_sha: held.sha, extent: { kind: "document" } } } })).fact_id;
  await me.act("include", { body: { setId: trail, factId: fact, reason: REASON } });
  const p = await openAs(world, me, "/app/money/" + trail);
  const card = (key, vars) => main(p).querySelectorAll("[data-tip]").some((e) => e.getAttribute("data-tip").includes(word(key, vars)));
  assert.ok(card("screen.money.startedby", { by: me.handle }), "the trail's card says who started it, by handle");
  const row = main(p).querySelectorAll("tr.cs-r").find((r) => r.querySelector(`[data-id="${fact}"]`));
  await p.click(row.querySelector('[data-shell="row"]'));
  drew(row.nextElementSibling, "screen.money.asread", { as_read: "4,200,000", by: me.handle });
  noIds(main(p), [me.member]);
  assert.ok(!main(p).querySelectorAll("[data-tip]").some((e) => e.getAttribute("data-tip").includes(me.member)), "and no card names an id");
});

test("R2 R18 R35 C94 explore: who attached a source to a step is a handle, on the page and in the graph", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const a = (await me.act("entitycreate", { body: { kind: "person", label: "Ana Rivera", note: "Deputy clerk, named in the minutes." } })).entity_id;
  const b = (await me.act("entitycreate", { body: { kind: "person", label: "Ben Okafor", note: "Contractor, named in the minutes." } })).entity_id;
  await me.act("relationdeclare", { body: { fromEntity: a, toEntity: b, relation: "proxy_for", justification: "He signs for her on the minutes.", citation: "minutes, page 2" } });
  const memo = await world.recipes.hold(me, "Memo.txt", "Ben Okafor signs for Ana Rivera when she is away.");
  const first = await openAs(world, me, "/app/person/" + a);
  const walk = async (p) => (await world.door({ url: "/api/?op=exploregraph", init: { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(p.byOp("exploregraph")[0].body) } }, me)).json.result;
  const relation = (await walk(first)).steps.find((x) => x.kind === "proxy_for").id;
  await me.act("stepsource", { body: { relation, captureSha: memo.sha, extent: { kind: "document" }, basis: "The memo says he signs for her." } });
  const step = (await walk(first)).steps.find((x) => x.kind === "step_source");
  assert.ok(step, "the world holds the attached source as a step");
  const p = await openAs(world, me, "/app/person/" + a);
  drew(main(p).querySelector("[data-attached]"), "screen.explore.attached", { by: me.handle, date: dayOf(step.at.slice(0, 10)) });
  noIds(main(p), [me.member]);
});

test("R5 R7 C94 calculation and due date: who accepted a calculation, who visited a drawn item and who proposed a due date are handles", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const project = await world.recipes.project(me, "Repairs");
  const csv = await world.recipes.hold(me, "Reports.csv", "id,closed\n1,y\n2,y\n3,n\n", project);
  const table = (await me.act("tabledeclare", { body: { source: { capture_sha: csv.sha, extent: { kind: "document" } }, header: ["id", "closed"],
    schema: { fields: [{ name: "id", type: "string" }, { name: "closed", type: "string" }] } } })).sha;
  const period = { from: "2025-07-01", to: "2026-06-30" };
  const draw = (await me.act("calculationdraw", { body: { set: table, n: 3, seed: "2026-10-05-7f31", question: "Was the pothole repaired?", project, reason: "a sample to visit" } })).draw;
  const item = (await me.read("spotcheck", { query: { draw } })).items[0].item;
  const t = await me.act("testify", { body: { words: "What I saw at report " + item + ".", observedAt: "2026-10-06" } });
  await me.act("spotcheckvisit", { body: { draw, item, finding: "yes", testimony: t.capture_sha, reason: "I visited it" } });
  const estimate = (await me.act("calculationcreate", { body: { question: "Share of drawn reports repaired", period, kind: "estimate", project, inputs: [{ name: "sample", draw }] } })).calc_id;
  const calc = (await me.act("calculationcreate", { body: { question: "Reports closed within seven days", period, kind: "count", project, inputs: [{ name: "orders", table }] } })).calc_id;
  const spot = await openAs(world, me, "/app/calculation/" + estimate);
  const visit = (await me.read("spotcheck", { query: { draw } })).items.find((x) => x.item === item).visits[0];
  drew(main(spot), "screen.calculation.visit", { finding: word("screen.calculation.finding.yes"), by: me.handle, date: dayOf(visit.observed_at.slice(0, 10)) });
  noIds(main(spot), [me.member]);
  const p = await openAs(world, me, "/app/calculation/" + calc);
  await press(p, "calculationaccept", { reason: "checked twice" });
  await settled(p);
  const accepted = await me.read("calculation", { query: { id: calc } });
  assert.equal(accepted.accepted_by, me.member, "accepted by the member who pressed it");
  const q = await openAs(world, me, "/app/calculation/" + calc);
  drew(main(q), "screen.calculation.accepted", { by: me.handle, date: dayOf(accepted.accepted_at.slice(0, 10)) });
  noIds(main(q), [me.member]);
  /* the due date: a rule's date proposed from the day the team sent the request */
  const action = (await me.act("actioncreate", { body: { document: ["---", "id: PENDING", "object_type: action", 'title: "The rent schedules"', "current_state: planned",
    'created: "2026-10-01T12:00:00Z"', 'last_updated: "2026-10-01T12:00:00Z"', "project: " + project, 'action_kind: "records_request"', "counterparty:", '  state: "named"', '  role: "City Clerk"', '  body: "City Council"',
    "---", "", "The rent schedules.", ""].join("\n") } })).id;
  await me.act("actioncorrespond", { query: { target: action, direction: "sent", at: "2026-11-23", account: "We asked for the rent schedules." } });
  await me.act("clockpropose", { body: { target: action, rule: "records_response" } });
  const d = await openAs(world, me, "/app/due-date/" + action);
  drew(main(d), "screen.due-date.proposal", { by: me.handle });
  noIds(main(d), [me.member]);
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
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const project = await world.recipes.project(me, "Records office budget");
  const held = await world.recipes.hold(me, "Adopted budget.txt", "The adopted budget for the records office in fiscal year 2026 is 4,200,000.00 dollars.", project);
  const trail = await world.recipes.trail(me, project, "Records office budget, FY2026");
  const fact = (await me.act("recordfact", { body: { amount: "4200000.00", as_read: "4,200,000", currency: "USD", sign: "+", precision: "exact", kind: "expenditure", phase: "adopted", basis: "budgetary",
    period: { from: "2025-07-01", to: "2026-06-30" }, source: { capture_sha: held.sha, extent: { kind: "document" } } } })).fact_id;
  await me.act("moneysetpropose", { body: { setId: trail, factId: fact, method: "member:recordfact" } });
  const row = (p) => main(p).querySelectorAll("tr.cs-r").find((r) => r.querySelector(`[data-id="${fact}"]`));
  const mem = await openAs(world, me, "/app/money/" + trail);
  drew(row(mem), "screen.money.proposed.member");
  /* a proposal by a machine (a class, not a member): the live copy holds one that a member's session does not make */
  const byMachine = rewrite(world, me, (req, a) => (a && a.json && a.json.result && Array.isArray(a.json.result.proposals) && req.url.includes("op=moneyset")
    ? { ...a, json: { ...a.json, result: { ...a.json.result, proposals: a.json.result.proposals.map((x) => ({ ...x, by: "class:daemon" })) } } } : a));
  const bot = await openAs(world, me, "/app/money/" + trail, { plane: { moneyset: byMachine } });
  drew(row(bot), "screen.money.proposed");
  assert.ok(!row(bot).textContent.includes(word("screen.money.proposed.member")));
});
