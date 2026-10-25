/* screens-investigate R6: a court or regulatory proceeding, on interface-shell's served page over a scripted plane. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn } from "../interface-shell/harness.mjs";
import { main, actsIn, fill, press, word, drew, dayOf } from "./fixtures.mjs";
import { inWorld, openAs, settled, readHeld, declareStandard, refused, rewrite } from "./world.mjs";

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

const sec = (p, key) => main(p).querySelectorAll("section").find((s) => s.querySelector("h2").textContent === word(key));
const READ = "2026-10-01T06:00:00Z";
/** The world's `follows` answer with each register read on a day: a register read is made by the network, which the world does not have (`refreshregister` answers NOT_READ), the one part of the answer this build does not make. */
const read = (world, me) => rewrite(world, me, (req, a) => {
  if (!/op=follows(&|$)/.test(String(req.url))) return a;
  const j = JSON.parse(JSON.stringify(a.json));
  for (const f of j.result.items) f.last_read = READ;
  return { ...a, json: j };
});

test("R6 reads the proceeding (entity: its caption, court and neutral label), its parties by role (partiesof), its register as followed (follows, the newest new), and the orders held as obligations (dutiesof), each with its due date", async () => {
  const { world, me } = await inWorld();
  const M = await matter(world, me);
  const order = await world.recipes.hold(me, "Order.txt", "The respondent shall produce the 2024 rent schedules.", M.project);
  const ou = await readHeld(world, me, order.sha);
  const std = await declareStandard(me, { cite: "Tribunal order 24CV123456", kind: "court", issuer: "Alameda Housing Tribunal", sha: order.sha, extent: ou[0].extent });
  const basis = { captureSha: order.sha, extent: ou[0].extent };
  await me.act("recordline", { body: { kind: "party_to", from: M.party, to: M.proc, role: "petitioner", basis } });
  await me.act("recordline", { body: { kind: "party_to", from: M.other, to: M.proc, role: "respondent", basis } });
  const register = "https://court.example/register/RG26";
  await me.act("followregister", { body: { address: register, proceeding: M.proc, gated: { kind: "account" } } });
  const DUE = "2026-10-30", ACTION = "produce the 2024 rent schedules";
  await me.act("declare", { body: { modality: "duty", obligor: M.other, performance: { act: ACTION }, source: { kind: "court", standard: std }, clause: "Order ¶3", arising_in: M.proc,
    trigger: { kind: "date", date: DUE }, time: { basis: "window", date: DUE } } });
  const p = await openAs(world, me, "/app/proceeding/" + M.proc, { plane: { follows: read(world, me) } });
  assert.equal(p.byOp("entity")[0].query.id, M.proc);
  assert.equal(p.byOp("partiesof")[0].query.proceeding, M.proc);
  assert.ok(p.byOp("follows").length === 1);
  assert.deepEqual(p.byOp("dutiesof").map((r) => [r.query.entity, r.query.as]).sort(), [[M.party, "obligor"], [M.other, "obligor"]].sort());
  const held = (await me.read("entity", { query: { id: M.proc } })).entity;
  const m = main(p);
  assert.equal(m.querySelector("h1").textContent, held.label);
  drew(m, "screen.proceeding.caption", { number: held.proceeding.number, label: held.label });
  const parties = sec(p, "screen.proceeding.parties");
  for (const [role, who] of [["petitioner", M.party], ["respondent", M.other]]) { drew(parties, "screen.proceeding.role", { role: word("screen.proceeding.roles." + role) }); assert.ok(parties.textContent.includes(who)); }
  const reg = sec(p, "screen.proceeding.register.head");
  drew(reg, "screen.proceeding.new");
  assert.ok(reg.textContent.includes(register));
  drew(reg, "screen.proceeding.gated");
  const orders = sec(p, "screen.proceeding.orders");
  assert.ok(orders.textContent.includes(ACTION));
  assert.ok(orders.querySelector(".cs-due").textContent.includes(dayOf(DUE)));
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
  fill(p, { "pr-obligor": M.other, "pr-act": "produce the 2024 rent schedules", "pr-clause": "Order ¶3", "pr-due": "2026-10-30" });
  fill(p, { "pr-court": court });
  await press(p, "declare", { reason: REASON });
  await settled(p);
  assert.deepEqual(p.byOp("declare")[0].body, { modality: "duty", obligor: M.other, performance: { act: "produce the 2024 rent schedules" }, source: { kind: "court", standard: court }, clause: "Order ¶3", arising_in: M.proc,
    trigger: { kind: "date", date: "2026-10-30" }, time: { basis: "window", date: "2026-10-30" } });
  assert.equal(main(p).querySelector('[data-gap="refused"]'), null, "the real store holds the order");
  const duties = (await me.read("dutiesof", { query: { entity: M.other, as: "obligor" } })).duties;
  assert.deepEqual(duties.map((d) => [d.performance.act, d.arising_in, d.time.date]), [["produce the 2024 rent schedules", M.proc, "2026-10-30"]]);
});

test("R6 declare names its order: with the other fields filled and no court order chosen, nothing is sent", async () => {
  const { world, me } = await inWorld();
  const M = await matter(world, me);
  const p = await openAs(world, me, "/app/proceeding/" + M.proc);
  fill(p, { "pr-obligor": M.other, "pr-act": "produce the 2024 rent schedules", "pr-clause": "Order ¶3", "pr-due": "2026-10-30" });
  await press(p, "declare", { reason: REASON });
  assert.equal(p.byOp("declare").length, 0);
});

test("R6 each act names what it needs (control: nothing sent), and a refusal is drawn beside the act", async () => {
  const { world, me } = await inWorld();
  const M = await matter(world, me);
  const order = await world.recipes.hold(me, "Order.txt", "The respondent shall produce the 2024 rent schedules.", M.project);
  /* the store's refusal is a fault the test injects on purpose: a proceeding that has ended */
  const p = await openAs(world, me, "/app/proceeding/" + M.proc, { plane: { recordline: refusedIn("PROCEEDING_ENDS", "A party is joined to a proceeding.") } });
  for (const op of ["recordline", "followregister", "declare"]) { await press(p, op); assert.equal(p.byOp(op).length, 0, op); }
  fill(p, { "pr-party": M.party, "pr-role": "intervenor", "pr-doc": order.sha });
  await press(p, "recordline");
  assert.ok(sec(p, "screen.proceeding.parties").textContent.includes(word("refusal.PROCEEDING_ENDS")), "the refusal by its words");
});

test("R16 Follow its register sends proceeding, the screen's own entity id, and the register list shows only the follows follows answers with that proceeding; control: a register followed from another proceeding's screen is not listed here", async () => {
  const { world, me } = await inWorld();
  const M = await matter(world, me);
  const elsewhere = (await me.act("entitycreate", { body: { kind: "proceeding", label: "another case", note: "From the caption.", proceeding: { forum: M.court, kind: "civil", number: "24CV555555" } } })).entity_id;
  await me.act("followregister", { body: { address: "https://court.example/register/RG26", proceeding: M.proc, gated: { kind: "account" } } });
  await me.act("followregister", { body: { address: "https://court.example/register/ELSEWHERE", proceeding: elsewhere } });
  const p = await openAs(world, me, "/app/proceeding/" + M.proc);
  const regs = sec(p, "screen.proceeding.register.head").textContent;
  assert.match(regs, /court\.example\/register\/RG26/);
  assert.doesNotMatch(regs, /register\/ELSEWHERE/, "another proceeding's register is not listed");
  const before = p.byOp("follows").length;
  fill(p, { "pr-register": "https://court.example/register/NEW" });
  await press(p, "followregister", { reason: REASON });
  await settled(p);
  assert.equal(p.byOp("followregister")[0].body.proceeding, M.proc);
  assert.equal(p.byOp("follows").length > before, true, "the list is read again after");
  assert.match(sec(p, "screen.proceeding.register.head").textContent, /register\/NEW/, "the register followed is listed");
  const q = await openAs(world, me, "/app/proceeding/" + elsewhere);
  assert.match(main(q).textContent, /ELSEWHERE/, "control: it is listed on its own proceeding's screen");
  assert.doesNotMatch(main(q).textContent, /RG26|register\/NEW/);
});

const lanes = (p) => Object.fromEntries(main(p).querySelectorAll("section[data-lane]").map((l) => [l.getAttribute("data-lane"), l]));

/** The matter with its dates, made by the member's own acts: two events on the proceeding (a hearing, and a filing the body made), and two records requests the team sent on it, each
 *  with its deadline adopted, one the team owes and one the body owes. */
async function dated(world, me) {
  const M = await matter(world, me);
  const event = async (kind, where, day) => (await me.act("createevent", { body: { kind, where, concerns: [M.proc], attestations: [{ testimony: "The court's notice states it.", value: day, project: M.project }] } })).event_id;
  const hearing = await event("hearing", "Hearing on the motion", "2026-11-04");
  const answer = await event("filing", "The body's own answer due", "2026-10-20");
  const request = async (title, description, owedBy) => {
    const id = (await me.act("actioncreate", { body: { document: ["---", "id: PENDING", "object_type: action", "title: " + JSON.stringify(title), "current_state: planned", 'created: "2026-10-01T12:00:00Z"', 'last_updated: "2026-10-01T12:00:00Z"',
      "project: " + M.project, "proceeding: " + M.proc, 'action_kind: "records_request"', "counterparty:", '  state: "named"', '  role: "City Clerk"', '  body: "City Council"', "---", "", title, ""].join("\n") } })).id;
    await me.act("actioncorrespond", { query: { target: id, direction: "sent", at: "2026-10-20", account: "We asked for the rent schedules." } });
    await me.act("clockpropose", { body: { target: id, rule: "records_response" } });
    const proposal = (await me.read("clockproposals", { query: { action: id } })).proposals.find((x) => x.rule === "records_response");
    await me.act("clockadopt", { body: { target: id, proposal: proposal.key, why: "the clerk received it", description, owed_by: owedBy } });
    return id;
  };
  const ours = await request("The rent schedules", "The City Clerk's reply", "group");
  const theirs = await request("The tenancy file", "The body's own reply", "body");
  return { ...M, hearing, answer, ours, theirs };
}

test("R28 Dates reads proceedingdates and draws today's stage and two lanes, the proceeding's own and our deadlines on it, never interleaved, each date by cs.date; nothing is drawn as late", async () => {
  const { world, me } = await inWorld();
  const S = await dated(world, me);
  const p = await openAs(world, me, "/app/proceeding/" + S.proc);
  assert.equal(p.byOp("proceedingdates")[0].query.proceeding, S.proc);
  const held = (await me.read("proceedingdates", { query: { proceeding: S.proc } })).lanes;
  assert.notEqual(held.proceeding.status.stage, "undetermined", "the world reads a stage from the filing");
  const dates = sec(p, "proceeding.dates.title");
  drew(dates, "proceeding.dates.stage", { stage: held.proceeding.status.label });
  const l = lanes(p);
  assert.deepEqual(Object.keys(l).sort(), ["group", "proceeding"]);
  assert.equal(l.proceeding.querySelector("h2").textContent, word("proceeding.dates.lane.proceeding"));
  assert.equal(l.group.querySelector("h2").textContent, word("proceeding.dates.lane.group"));
  const hearing = held.proceeding.items.find((x) => x.event === S.hearing), mine = held.group.items.find((x) => x.action === S.ours);
  assert.ok(hearing && mine, "the world answers the hearing in the proceeding's lane and our deadline in the group's");
  assert.ok(l.proceeding.textContent.includes(dayOf(hearing.when.value)) && l.proceeding.textContent.includes(hearing.label));
  assert.ok(l.group.textContent.includes(dayOf(mine.date)) && l.group.textContent.includes(mine.text));
  assert.ok(!l.proceeding.textContent.includes(mine.text) && !l.group.textContent.includes(hearing.label), "never interleaved");
  assert.ok(l.group.querySelector(`a.cs-ref[href*="${S.ours}"]`) || l.group.querySelector(".cs-card"), "the action a reference");
  assert.equal(dates.querySelectorAll('[data-due="overdue"], [data-state="overdue"]').length, 0, "nothing is drawn as late");
  assert.ok(dates.querySelector("h2").getAttribute("data-tip").includes(word("proceeding.dates.help").split("'")[0]), "explained by its help");
});

test("R28 control: a body's own deadline is never in the group's lane; with no dates, proceeding.dates.none", async () => {
  const { world, me } = await inWorld();
  const S = await dated(world, me);
  const p = await openAs(world, me, "/app/proceeding/" + S.proc);
  const held = (await me.read("proceedingdates", { query: { proceeding: S.proc } })).lanes;
  const answer = held.proceeding.items.find((x) => x.event === S.answer);
  const theirs = (await me.read("action", { query: { id: S.theirs } })).clock[0];
  assert.equal(theirs.owed_by, "body", "the world holds the body's own deadline on its action");
  assert.ok(!held.group.items.some((x) => x.action === S.theirs), "and does not answer it in the group's lane");
  const l = lanes(p);
  assert.ok(l.proceeding.textContent.includes(answer.label), "the body's own filing is in the proceeding's lane");
  assert.ok(!l.group.textContent.includes(theirs.description) && !l.group.textContent.includes(answer.label), "and never in the group's");
  const lone = (await me.act("entitycreate", { body: { kind: "proceeding", label: "another case", note: "From the caption.", proceeding: { forum: S.court, kind: "civil", number: "24CV555555" } } })).entity_id;
  const q = await openAs(world, me, "/app/proceeding/" + lone);
  drew(sec(q, "proceeding.dates.title"), "proceeding.dates.none");
  assert.equal(main(q).querySelectorAll("section[data-lane]").length, 0, "no lane is drawn over nothing");
  /* the store's own refusal (NOT_A_PROCEEDING): the page is asked for the dates of a person */
  const r = await openAs(world, me, "/app/proceeding/" + S.party);
  assert.equal(r.byOp("proceedingdates")[0].query.proceeding, S.party, "asked for a person, the store answers that it is no proceeding");
  assert.ok(sec(r, "proceeding.dates.title").querySelector('[data-state="failed"]'), "a failed read is drawn failed");
});

const optsOf = (p, id) => p.doc.getElementById(id).querySelectorAll("option").map((o) => [o.getAttribute("value"), o.textContent]).filter(([v]) => v !== "");

test("R36 the court is chosen among the registered forums (entitieskind with forum_kind, as record data), never among the people; the kind among the forum's, worded by proceeding.kind.<kind>", async () => {
  const { world, me } = await inWorld();
  const M = await matter(world, me);
  const p = await openAs(world, me, "/app/proceeding");
  assert.deepEqual(optsOf(p, "pr-forum"), [[M.court, "Alameda Housing Tribunal"]]);
  assert.ok(p.byOp("entitieskind").some((r) => r.query.kind === "body" && /court/.test(r.query.forum_kind)), "forum kinds asked");
  assert.equal(p.doc.getElementById("pr-forum").querySelectorAll("option").some((o) => o.textContent === "Ana Rivera"), false, "no person is offered as a court");
  const courts = (await me.read("affordances", {})).vocabularies.proceeding_kinds.filter((k) => k.forum_kind === "court").map((k) => k.kind);
  assert.ok(courts.length > 0);
  assert.deepEqual(optsOf(p, "pr-kind").map((o) => o[0]), courts);
  assert.deepEqual(optsOf(p, "pr-kind").map((o) => o[1]), courts.map((k) => word("proceeding.kind." + k)));
  drew(main(p), "proceeding.kind.help");
  drew(main(p), "screen.proceeding.court.help");
  /* the profile's answer is altered: kinds of two forums, a fault the real profile cannot make */
  const prof = await openAs(world, me, "/app/proceeding", { plane: { affordances: ok({ vocabularies: { proceeding_kinds: [{ kind: "civil", label: "Civil", forum_kind: "court" }, { kind: "tribunal_hearing", label: "A tribunal hearing", forum_kind: "commission" }] } }) } });
  assert.deepEqual(optsOf(prof, "pr-kind"), [["civil", word("proceeding.kind.civil")]], "only the forum's kinds");
});

test("R36 with no forum held the screen draws court.none in its fold and the Add a court form; adding one lists it and chooses it; control: a refusal of the store is drawn by its words", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const p = await openAs(world, me, "/app/proceeding");
  const fold = main(p).querySelector("details");
  drew(fold, "screen.proceeding.court.none.summary");
  drew(fold, "court.none");
  assert.equal(p.doc.getElementById("pr-forum"), null);
  fill(p, { "pr-court-name": "Court of Appeal" });
  await press(p, "entitycreate", { el: p.root().querySelector('button[data-act="entitycreate"]'), reason: REASON });
  await settled(p);
  assert.deepEqual(p.byOp("entitycreate")[0].body, { kind: "body", label: "Court of Appeal", forum_kind: "court", note: "Court of Appeal" });
  const held = (await me.read("entitieskind", { query: { kind: "body" } })).entities.filter((e) => e.forum_kind === "court");
  assert.deepEqual(held.map((e) => e.label), ["Court of Appeal"], "the world holds the court");
  assert.deepEqual(optsOf(p, "pr-forum"), [[held[0].entity_id, "Court of Appeal"]], "the new court is listed and chosen");
  drew(main(p), "court.add.done", { name: "Court of Appeal" });
  /* a refusal of the real store: a number not in the court's form */
  fill(p, { "pr-forum": held[0].entity_id, "pr-number": "RG1", "pr-kind": "civil", "pr-note": "n" });
  await press(p, "entitycreate", { el: p.root().querySelectorAll('button[data-act="entitycreate"]').pop(), reason: REASON });
  await settled(p);
  const bad = await refused(world, me, "entitycreate", { kind: "proceeding", note: "n", proceeding: { forum: held[0].entity_id, kind: "civil", number: "RG1" } });
  assert.equal(bad.ok, false, "the store refuses it");
  assert.ok(main(p).textContent.includes(word("refusal." + bad.reason)), "the refusal by its words");
});

test("R34 recordline chooses the document by title; with no document the choice's empty state is drawn and nothing is sent", async () => {
  const { world, me } = await inWorld();
  const M = await matter(world, me);
  const none = await openAs(world, me, "/app/proceeding/" + M.proc);
  assert.equal(none.doc.getElementById("pr-doc"), null);
  fill(none, { "pr-party": M.party });
  await press(none, "recordline", { reason: REASON });
  assert.equal(none.byOp("recordline").length, 0);
  await world.recipes.hold(me, "Lease amendment 1", "The lease is amended.", M.project);
  await world.recipes.hold(me, "Rent schedule", "The rent is 1200.", M.project);
  const p = await openAs(world, me, "/app/proceeding/" + M.proc);
  assert.deepEqual(optsOf(p, "pr-doc").map((o) => o[1].split(" · ")[0]).sort(), ["Lease amendment 1", "Rent schedule"], "by title");
});

/* R47 (T51-120) */
test("R47 a proceeding is offered every kind the active profiles name for the forum: a profile kind with a label is offered for a commission forum and sent as kind; control: a kind of another forum_kind is not offered", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const commission = (await me.act("entitycreate", { body: { kind: "body", label: "Rent Board", forum_kind: "commission", note: "The board." } })).entity_id;
  const profile = (await me.read("affordances", {})).vocabularies.proceeding_kinds;
  const forCommission = profile.filter((k) => k.forum_kind === "commission").map((k) => [k.kind, k.label]);
  assert.ok(forCommission.length > 0 && profile.some((k) => k.forum_kind === "court"), "the profile names kinds for both");
  const p = await openAs(world, me, "/app/proceeding");
  fill(p, { "pr-forum": commission });
  p.fire(p.doc.getElementById("pr-forum"), "change");
  await settled(p);
  assert.deepEqual(optsOf(p, "pr-kind"), forCommission, "the label as record data, the other forum's kind not offered");
  fill(p, { "pr-forum": commission, "pr-kind": forCommission[0][0], "pr-number": "A.24-01-001", "pr-note": "from the caption" });
  await press(p, "entitycreate", { el: p.root().querySelectorAll('button[data-act="entitycreate"]').pop(), reason: REASON });
  await settled(p);
  assert.equal(p.byOp("entitycreate")[0].body.proceeding.kind, forCommission[0][0]);
  assert.equal(main(p).querySelector('[data-gap="refused"]'), null, "the store takes it");
  const made = (await me.read("entitieskind", { query: { kind: "proceeding" } })).entities;
  assert.equal(made.length, 1);
  assert.equal((await me.read("entity", { query: { id: made[0].entity_id } })).entity.proceeding.kind, forCommission[0][0], "the world holds the kind");
});

test("R47 an affordances answer without the key draws the choice failed, never as no kinds; [] draws empty in place of the choice and sends nothing; a forum with no kind in the profile offers none", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const court = (await me.act("entitycreate", { body: { kind: "body", label: "A court", forum_kind: "court", note: "A court." } })).entity_id;
  /* the profile's answer is altered: a fault the real profile cannot make (no key, an empty list, a forum with none) */
  const unread = await openAs(world, me, "/app/proceeding", { plane: { affordances: ok({ vocabularies: {} }) } });
  assert.ok(sec(unread, "screen.proceeding.register").querySelector('[data-state="failed"]'), "failed");
  assert.equal(unread.doc.getElementById("pr-kind"), null);
  const none = await openAs(world, me, "/app/proceeding", { plane: { affordances: ok({ vocabularies: { proceeding_kinds: [] } }) } });
  assert.ok(sec(none, "screen.proceeding.register").querySelector('[data-state="empty"]'), "empty, in place of the choice");
  assert.equal(none.doc.getElementById("pr-kind"), null);
  fill(none, { "pr-forum": court, "pr-number": "24CV111111", "pr-note": "n" });
  await press(none, "entitycreate", { el: none.root().querySelectorAll('button[data-act="entitycreate"]').pop(), reason: REASON });
  assert.equal(none.byOp("entitycreate").length, 0, "nothing sent");
  const other = await openAs(world, me, "/app/proceeding", { plane: { affordances: ok({ vocabularies: { proceeding_kinds: [{ kind: "complaint", label: "Complaint", forum_kind: "commission" }] } }) } });
  assert.equal(other.doc.getElementById("pr-kind"), null, "a forum with no kind in the profile offers none");
});
