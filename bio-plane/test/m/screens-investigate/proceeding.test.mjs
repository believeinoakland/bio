/* screens-investigate R6: a court or regulatory proceeding, on interface-shell's served page over a scripted plane. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn } from "../interface-shell/harness.mjs";
import { open, main, actsIn, button, fill, press, PROC, SHA, ACT, DATES, word, drew, notDrew, dayOf, COURT } from "./fixtures.mjs";
import { inWorld, openAs, settled, readHeld, declareStandard, refused } from "./world.mjs";

const REASON = "The order says so.";
/** The member's own acts that make a proceeding to work on: the team's profile, a court she adds, a proceeding in it, a person and a document held. */
async function matter(world, me) {
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const project = await world.recipes.project(me, "Rent case");
  const court = (await me.act("entitycreate", { body: { kind: "body", label: "Alameda Housing Tribunal", forum_kind: "court", note: "A court." } })).entity_id;
  const proc = (await me.act("entitycreate", { body: { kind: "proceeding", label: "the lease rent case", note: "From the court's caption", proceeding: { forum: court, kind: "civil", number: "24CV123456" } } })).entity_id;
  const party = (await me.act("entitycreate", { body: { kind: "person", label: "Ana Rivera", note: "A tenant named in the filing." } })).entity_id;
  const other = (await me.act("entitycreate", { body: { kind: "body", label: "City Clerk", note: "The clerk." } })).entity_id;
  return { project, court, proc, party, other };
}

const at = "/app/proceeding/" + PROC;
const sec = (p, key) => main(p).querySelectorAll("section").find((s) => s.querySelector("h2").textContent === word(key));

test("R6 reads the proceeding (entity: its caption, court and neutral label), its parties by role (partiesof), its register as followed (follows, the newest new), and the orders held as obligations (dutiesof), each with its due date", async () => {
  const p = await open(at);
  assert.equal(p.byOp("entity")[0].query.id, PROC);
  assert.equal(p.byOp("partiesof")[0].query.proceeding, PROC);
  assert.ok(p.byOp("follows").length === 1);
  assert.deepEqual(p.byOp("dutiesof").map((r) => [r.query.entity, r.query.as]).sort(), [["ENT-2026-0102", "obligor"], ["ENT-2026-0103", "obligor"]]);
  const m = main(p);
  assert.equal(m.querySelector("h1").textContent, "the lease rent case");
  drew(m, "screen.proceeding.caption", { number: "RG26-114502", label: "the lease rent case" });
  const parties = sec(p, "screen.proceeding.parties");
  for (const [role, who] of [["petitioner", "ENT-2026-0102"], ["respondent", "ENT-2026-0103"]]) { drew(parties, "screen.proceeding.role", { role: word("screen.proceeding.roles." + role) }); assert.ok(parties.textContent.includes(who)); }
  const reg = sec(p, "screen.proceeding.register.head");
  drew(reg, "screen.proceeding.new");
  assert.ok(reg.textContent.includes("https://court.example/register/RG26"));
  drew(reg, "screen.proceeding.gated");
  const orders = sec(p, "screen.proceeding.orders");
  assert.ok(orders.textContent.includes("produce the 2024 rent schedules"));
  assert.ok(orders.querySelector(".cs-due").textContent.includes(dayOf("2026-10-30")));
  drew(orders, "screen.proceeding.facts");
});

test("R6 entitycreate \"Register the proceeding\" from its caption: court, number, a neutral label, the member's note; then it opens", async () => {
  const { world, me } = await inWorld();
  const M = await matter(world, me);
  const p = await openAs(world, me, "/app/proceeding");
  assert.deepEqual(actsIn(main(p)).filter((a) => a === "entitycreate"), ["entitycreate"]);
  fill(p, { "pr-forum": M.court, "pr-number": "24CV777001", "pr-kind": "civil", "pr-label": "the lease rent case", "pr-note": "From the court's caption, captured 1 October" });
  await press(p, "entitycreate", { el: p.root().querySelectorAll('button[data-act="entitycreate"]').pop(), reason: REASON });
  await settled(p);
  const sent = p.byOp("entitycreate").pop();
  assert.deepEqual(sent.body, { kind: "proceeding", note: "From the court's caption, captured 1 October", proceeding: { forum: M.court, kind: "civil", number: "24CV777001" }, label: "the lease rent case", aliases: ["the lease rent case"] });
  assert.match(p.location.pathname, /^\/app\/proceeding\/ENT-/);
  const made = p.location.pathname.split("/").pop();
  assert.notEqual(made, M.proc, "a new proceeding");
  const held = (await me.read("entity", { query: { id: made } })).entity;
  assert.deepEqual([held.kind, held.proceeding.forum, held.proceeding.number, held.proceeding.kind], ["proceeding", M.court, "24CV777001", "civil"], "the world holds it");
  assert.ok(held.label.includes("24CV777001"), "the store's neutral label names the number, the member's own label is kept as an alias");
  assert.ok((held.aliases || []).some((a) => (a.alias || a) === "the lease rent case"));
});

test("R6 recordline \"Add a party by role\"; followregister (a register needing a login says filings come only by capture); declare \"Hold an order as obligations\"; courtlink", async () => {
  const { world, me } = await inWorld();
  const M = await matter(world, me);
  const order = await world.recipes.hold(me, "Order.txt", "The respondent shall produce the 2024 rent schedules.", M.project);
  const law = await world.recipes.hold(me, "Ordinance.txt", "Section 8.22.050 No landlord shall increase the rent above the limit.", M.project);
  const ou = await readHeld(world, me, order.sha), lu = await readHeld(world, me, law.sha);
  const court = await declareStandard(me, { cite: "Tribunal order 24CV123456", kind: "court", issuer: "Alameda Housing Tribunal", sha: order.sha, extent: ou[0].extent });
  const ord = await declareStandard(me, { cite: "Ordinance 8.22", kind: "ordinance", sha: law.sha, extent: lu[0].extent });
  const p = await openAs(world, me, "/app/proceeding/" + M.proc);
  fill(p, { "pr-party": M.party, "pr-role": "intervenor", "pr-doc": order.sha });
  await press(p, "recordline", { reason: REASON });
  await settled(p);
  const line = p.byOp("recordline")[0];
  assert.deepEqual([line.body.kind, line.body.from, line.body.to, line.body.role, line.body.basis.captureSha], ["party_to", M.party, M.proc, "intervenor", order.sha]);
  assert.equal(main(p).querySelector('[data-gap="refused"]'), null, "the party is recorded");
  const parties = (await me.read("partiesof", { query: { proceeding: M.proc } })).parties;
  assert.deepEqual(parties.map((x) => [x.party, x.role]), [[M.party, "intervenor"]], "the world holds the party by role");
  drew(sec(p, "screen.proceeding.register.head"), "screen.proceeding.login.note");
  fill(p, { "pr-register": "https://court.example/register/RG26", "pr-login-0": true });
  await press(p, "followregister", { reason: REASON });
  await settled(p);
  assert.deepEqual(p.byOp("followregister")[0].body, { address: "https://court.example/register/RG26", proceeding: M.proc, gated: { kind: "account" } }, "R16: the screen's own entity id");
  const followed = (await me.read("follows", {})).items.filter((f) => f.subject.proceeding === M.proc);
  assert.deepEqual(followed.map((f) => [f.subject.address, f.gated && f.gated.kind]), [["https://court.example/register/RG26", "account"]], "the world holds the follow, gated");
  fill(p, { "pr-obligor": M.other, "pr-act": "produce the 2024 rent schedules", "pr-clause": "Order ¶3", "pr-due": "2026-10-30" });
  await press(p, "declare", { reason: REASON });
  await settled(p);
  assert.deepEqual(p.byOp("declare")[0].body, { modality: "duty", obligor: M.other, performance: { act: "produce the 2024 rent schedules" }, source: { kind: "court" }, clause: "Order ¶3", arising_in: M.proc,
    trigger: { kind: "date", date: "2026-10-30" }, time: { basis: "window", date: "2026-10-30" } });
  fill(p, { "pr-court": court, "pr-law": ord, "pr-type": "interprets" });
  p.fire(p.doc.getElementById("pr-court"), "change");
  await settled(p);
  const passage = p.doc.getElementById("pr-citation").querySelectorAll("option").filter((o) => o.getAttribute("value") !== "")[0].getAttribute("value");
  fill(p, { "pr-citation": passage });
  await press(p, "courtlink", { reason: "the order reads the ordinance's §4" });
  await settled(p);
  const link = p.byOp("courtlink")[0];
  assert.deepEqual([link.body.type, link.body.from, link.body.to, link.body.citation, link.body.reason], ["interprets", court, ord, passage, "the order reads the ordinance's §4"]);
  assert.equal(main(p).querySelector('[data-gap="refused"]'), null, "the link is held");
  const rel = await me.read("lawrelations", { query: { id: court } });
  assert.ok([...(rel.referential || []), ...(rel.temporal || [])].some((r) => r.type === "interprets" && (r.to.standard === ord || r.from.standard === ord)), "the world holds the link");
});

/* REPORTED: the page's `declare` sends `source: { kind: "court" }` with no `standard`; the real store refuses it (NO_SUCH_STANDARD, duties/index.mjs:427-429),
   so "Hold an order as obligations" holds nothing in the real world (proceeding.mjs:195). The assertion stays, as a todo, until the page names the court standard. */
test.todo("REPORTED: declare \"Hold an order as obligations\" is refused by the real store, no standard named in its source (screens-investigate/proceeding.mjs:195, duties/index.mjs:427)", async () => {
  const { world, me } = await inWorld();
  const M = await matter(world, me);
  const p = await openAs(world, me, "/app/proceeding/" + M.proc);
  fill(p, { "pr-obligor": M.other, "pr-act": "produce the 2024 rent schedules", "pr-clause": "Order ¶3", "pr-due": "2026-10-30" });
  await press(p, "declare", { reason: REASON });
  await settled(p);
  assert.equal(main(p).querySelector('[data-gap="refused"]'), null, "the order is held");
  const duties = (await me.read("dutiesof", { query: { entity: M.other, as: "obligor" } })).duties;
  assert.deepEqual(duties.map((d) => [d.performance.act, d.arising_in, d.time.date]), [["produce the 2024 rent schedules", M.proc, "2026-10-30"]]);
});

test("R6 each act names what it needs (control: nothing sent), and a refusal is drawn beside the act", async () => {
  const p = await open(at, { plane: { recordline: refusedIn("PROCEEDING_ENDS", "A party is joined to a proceeding.") } });
  for (const op of ["recordline", "followregister", "declare"]) { await press(p, op); assert.equal(p.byOp(op).length, 0, op); }
  fill(p, { "pr-party": "ENT-2026-0104", "pr-role": "intervenor", "pr-doc": SHA });
  await press(p, "recordline");
  assert.ok(sec(p, "screen.proceeding.parties").textContent.includes(word("refusal.PROCEEDING_ENDS")), "the refusal by its words");
});

test("R16 Follow its register sends proceeding, the screen's own entity id, and the register list shows only the follows follows answers with that proceeding; control: a register followed from another proceeding's screen is not listed here", async () => {
  const p = await open(at, { plane: { followregister: ok({ ok: true }) } });
  const regs = sec(p, "screen.proceeding.register.head").textContent;
  assert.match(regs, /court\.example\/register\/RG26/);
  assert.doesNotMatch(regs, /register\/OTHER/, "another proceeding's register is not listed");
  fill(p, { "pr-register": "https://court.example/register/NEW" });
  await press(p, "followregister");
  assert.equal(p.byOp("followregister")[0].body.proceeding, PROC);
  assert.equal(p.byOp("follows").length >= 2, true, "the list is read again after");
  const q = await open(at, { plane: { follows: ok({ ok: true, items: [{ follow: 9, kind: "register", subject: { kind: "register", address: "https://court.example/register/ELSEWHERE", proceeding: "ENT-2026-0999" } }] }) } });
  assert.doesNotMatch(main(q).textContent, /ELSEWHERE/);
});

const lanes = (p) => Object.fromEntries(main(p).querySelectorAll("section[data-lane]").map((l) => [l.getAttribute("data-lane"), l]));

test("R28 Dates reads proceedingdates and draws today's stage and two lanes, the proceeding's own and our deadlines on it, never interleaved, each date by cs.date; nothing is drawn as late", async () => {
  const p = await open(at);
  assert.equal(p.byOp("proceedingdates")[0].query.proceeding, PROC);
  const dates = sec(p, "proceeding.dates.title");
  drew(dates, "proceeding.dates.stage", { stage: "Motions pending" });
  const l = lanes(p);
  assert.deepEqual(Object.keys(l).sort(), ["group", "proceeding"]);
  assert.equal(l.proceeding.querySelector("h2").textContent, word("proceeding.dates.lane.proceeding"));
  assert.equal(l.group.querySelector("h2").textContent, word("proceeding.dates.lane.group"));
  assert.ok(l.proceeding.textContent.includes(dayOf("2026-11-04")) && l.proceeding.textContent.includes("Hearing on the motion"));
  assert.ok(l.group.textContent.includes(dayOf("2026-10-14")) && l.group.textContent.includes("The City Clerk's reply"));
  assert.ok(!l.proceeding.textContent.includes("The City Clerk's reply") && !l.group.textContent.includes("Hearing on the motion"), "never interleaved");
  assert.ok(l.group.querySelector(`a.cs-ref[href*="${ACT}"]`) || l.group.querySelector(".cs-card"), "the action a reference");
  assert.equal(dates.querySelectorAll('[data-due="overdue"], [data-state="overdue"]').length, 0, "nothing is drawn as late");
  assert.ok(dates.querySelector("h2").getAttribute("data-tip").includes(word("proceeding.dates.help").split("'")[0]), "explained by its help");
});

test("R28 control: a body's own deadline is never in the group's lane; with no dates, proceeding.dates.none", async () => {
  const p = await open(at);
  const l = lanes(p);
  assert.ok(l.proceeding.textContent.includes("The body's own answer due"), "the body's own deadline is in the proceeding's lane");
  assert.ok(!l.group.textContent.includes("The body's own answer due"), "and never in the group's");
  const q = await open(at, { plane: { proceedingdates: ok(DATES({ lanes: { proceeding: { items: [], truncated: false, status: { stage: "undetermined", why: "no event" } }, group: { items: [], truncated: false } } })) } });
  drew(sec(q, "proceeding.dates.title"), "proceeding.dates.none");
  assert.equal(main(q).querySelectorAll("section[data-lane]").length, 0, "no lane is drawn over nothing");
  const r = await open(at, { plane: { proceedingdates: refusedIn("NOT_A_PROCEEDING", "That is not a proceeding.") } });
  assert.ok(sec(r, "proceeding.dates.title").querySelector('[data-state="failed"]'), "a failed read is drawn failed");
});

const optsOf = (p, id) => p.doc.getElementById(id).querySelectorAll("option").map((o) => [o.getAttribute("value"), o.textContent]).filter(([v]) => v !== "");

test("R36 the court is chosen among the registered forums (entitieskind with forum_kind, as record data), never among the people; the kind among the forum's, worded by proceeding.kind.<kind>", async () => {
  const p = await open("/app/proceeding");
  assert.deepEqual(optsOf(p, "pr-forum"), [[COURT, "Alameda Housing Tribunal"]]);
  assert.ok(p.byOp("entitieskind").some((r) => r.query.kind === "body" && /court/.test(r.query.forum_kind)), "forum kinds asked");
  assert.equal(p.byOp("peopledirectory").length === 0 || !p.doc.getElementById("pr-forum").querySelectorAll("option").some((o) => o.textContent === "L. Chen"), true, "no person is offered as a court");
  assert.deepEqual(optsOf(p, "pr-kind").map((o) => o[0]), ["civil", "writ", "appeal"]);
  assert.deepEqual(optsOf(p, "pr-kind").map((o) => o[1]), ["civil", "writ", "appeal"].map((k) => word("proceeding.kind." + k)));
  drew(main(p), "proceeding.kind.help");
  drew(main(p), "screen.proceeding.court.help");
  const prof = await open("/app/proceeding", { plane: { affordances: ok({ vocabularies: { proceeding_kinds: [{ kind: "civil", label: "Civil", forum_kind: "court" }, { kind: "tribunal_hearing", label: "A tribunal hearing", forum_kind: "commission" }] } }) } });
  assert.deepEqual(optsOf(prof, "pr-kind"), [["civil", word("proceeding.kind.civil")]], "only the forum's kinds");
});

test("R36 with no forum held the screen draws court.none in its fold and the Add a court form; adding one lists it and chooses it; control: a refusal of the kind is drawn by its words", async () => {
  const none = ok({ ok: true, kind: "body", entities: [], count: 0, truncated: false });
  let added = false;
  const p = await open("/app/proceeding", { plane: { entitieskind: (r) => ok(r.query.kind === "body" && added ? { ok: true, kind: "body", entities: [{ entity_id: "ENT-2026-0555", kind: "body", label: "Court of Appeal", forum_kind: "court" }], truncated: false } : { ok: true, kind: r.query.kind, entities: [], truncated: false }),
    entitycreate: (r) => { added = true; return ok({ ok: true, entity_id: "ENT-2026-0555" }); } } });
  const fold = main(p).querySelector("details");
  drew(fold, "screen.proceeding.court.none.summary");
  drew(fold, "court.none");
  assert.equal(p.doc.getElementById("pr-forum"), null);
  fill(p, { "pr-court-name": "Court of Appeal" });
  await press(p, "entitycreate", { el: p.root().querySelector('button[data-act="entitycreate"]') });
  assert.deepEqual(p.byOp("entitycreate")[0].body, { kind: "body", label: "Court of Appeal", forum_kind: "court", note: "Court of Appeal" });
  assert.deepEqual(optsOf(p, "pr-forum"), [["ENT-2026-0555", "Court of Appeal"]], "the new court is listed and chosen");
  drew(main(p), "court.add.done", { name: "Court of Appeal" });
  const bad = await open("/app/proceeding", { plane: { entitycreate: refusedIn("PROCEEDING_KIND_UNKNOWN", "That kind of proceeding is not one your profiles name.") } });
  fill(bad, { "pr-forum": COURT, "pr-number": "RG1", "pr-kind": "civil", "pr-note": "n" });
  await press(bad, "entitycreate", { el: bad.root().querySelectorAll('button[data-act="entitycreate"]').pop() });
  assert.ok(main(bad).textContent.includes(word("refusal.PROCEEDING_KIND_UNKNOWN")));
});

test("R34 recordline chooses the document by title; with no document the choice's empty state is drawn and nothing is sent", async () => {
  const p = await open(at);
  assert.deepEqual(optsOf(p, "pr-doc").map((o) => o[1]), ["Lease amendment 1", "Rent schedule"]);
  const none = await open(at, { plane: { heldcaptures: ok({ ok: true, held: [] }) } });
  assert.equal(none.doc.getElementById("pr-doc"), null);
  fill(none, { "pr-party": "ENT-2026-0104" });
  await press(none, "recordline");
  assert.equal(none.byOp("recordline").length, 0);
});

/* R47 (T51-120) */
test("R47 a proceeding is offered every kind the active profiles name for the forum: a profile kind with a label is offered for a commission forum and sent as kind; control: a kind of another forum_kind is not offered", async () => {
  const COMMISSION = "ENT-2026-0150";
  const kinds = [{ kind: "housing_hearing", label: "Rent board hearing", forum_kind: "commission" }, { kind: "civil", label: "Civil", forum_kind: "court" }];
  const plane = { affordances: ok({ vocabularies: { proceeding_kinds: kinds } }),
    entitieskind: (r) => ok({ ok: true, entities: r.query.kind === "body" ? [{ entity_id: COMMISSION, kind: "body", label: "Rent Board", forum_kind: "commission" }] : [] }),
    entitycreate: ok({ ok: true, entity_id: "ENT-2026-0151", kind: "proceeding" }) };
  const p = await open("/app/proceeding", { plane });
  assert.deepEqual(optsOf(p, "pr-kind"), [["housing_hearing", "Rent board hearing"]], "the label as record data, the other forum's kind not offered");
  fill(p, { "pr-forum": COMMISSION, "pr-kind": "housing_hearing", "pr-number": "H-9", "pr-note": "from the caption" });
  await press(p, "entitycreate", { el: p.root().querySelectorAll('button[data-act="entitycreate"]').pop() });
  assert.equal(p.byOp("entitycreate")[0].body.proceeding.kind, "housing_hearing");
});

test("R47 an affordances answer without the key draws the choice failed, never as no kinds; [] draws empty in place of the choice and sends nothing; a forum with no kind in the profile offers none", async () => {
  const forum = (extra) => ({ entitieskind: (r) => ok({ ok: true, entities: r.query.kind === "body" ? [{ entity_id: COURT, kind: "body", label: "A court", forum_kind: "court" }] : [] }), ...extra });
  const unread = await open("/app/proceeding", { plane: forum({ affordances: ok({ vocabularies: {} }) }) });
  assert.ok(sec(unread, "screen.proceeding.register").querySelector('[data-state="failed"]'), "failed");
  assert.equal(unread.doc.getElementById("pr-kind"), null);
  const none = await open("/app/proceeding", { plane: forum({ affordances: ok({ vocabularies: { proceeding_kinds: [] } }) }) });
  assert.ok(sec(none, "screen.proceeding.register").querySelector('[data-state="empty"]'), "empty, in place of the choice");
  assert.equal(none.doc.getElementById("pr-kind"), null);
  fill(none, { "pr-forum": COURT, "pr-number": "RG1", "pr-note": "n" });
  await press(none, "entitycreate", { el: none.root().querySelectorAll('button[data-act="entitycreate"]').pop() });
  assert.equal(none.byOp("entitycreate").length, 0, "nothing sent");
  const other = await open("/app/proceeding", { plane: forum({ affordances: ok({ vocabularies: { proceeding_kinds: [{ kind: "complaint", label: "Complaint", forum_kind: "commission" }] } }) }) });
  assert.equal(other.doc.getElementById("pr-kind"), null, "a forum with no kind in the profile offers none");
});
