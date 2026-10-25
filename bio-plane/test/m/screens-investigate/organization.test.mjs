/* screens-investigate R50, R53, R58 (T51; K4194 L10, DEC-374 C68, DEC-384 I-32): an organization's page on interface-shell's served page over `store-request`'s world
   (K5148, K5054): the real store behind the page's door and a real sign-in. The bodies, offices, lines and claims are made by the members' own acts (`entitycreate`,
   `recordline`, `linewithdraw`, `identityclaim`); the values a test asserts are read back from the world's own answers. Scripted: the refusals the real code cannot be
   made to give (the owner no longer refuses an organization `NOT_A_PERSON`; the page never sends a line without a basis). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { inWorld, openAs } from "./world.mjs";
import { refusedIn } from "../interface-shell/harness.mjs";
import { main, actsIn, button, fill, press, word, drew, notDrew, dayOf } from "./fixtures.mjs";

const REASON = "The minutes say so.";
const noPerson = () => refusedIn("NOT_A_PERSON", "The record named is not a person.");
const secOf = (p, key) => main(p).querySelectorAll("section").find((x) => x.querySelector("h2").textContent === word(key));
const entity = async (as, kind, label, note = "A city department") => (await as.act("entitycreate", { body: { kind, label, note } })).entity_id;

test("R53 an institution's page draws no Born, Died or where they live, offers a fact only the kinds Name, Address and Contact, and reads no claim or candidate it cannot have; NOT_A_PERSON is no claims, never a failed read; control: a person draws the person page", async () => {
  const { world, me } = await inWorld();
  const org = await entity(me, "institution", "Public Works Department");
  const chen = await entity(me, "person", "L. Chen", "Director of the department");
  const p = await openAs(world, me, "/app/person/" + org);
  const m = main(p);
  assert.equal(m.querySelector("h1").textContent, "Public Works Department");
  const kinds = p.doc.getElementById("person-fact-kind").querySelectorAll("option").map((o) => o.textContent);
  assert.deepEqual(kinds, ["name", "address", "contact"].map((k) => word("screen.person.kind." + k)), "exactly three kinds");
  for (const k of ["birth", "death", "locality"]) assert.ok(!kinds.includes(word("screen.person.kind." + k)), k);
  drew(m, "screen.person.kind.help.org");
  /* the person read is made and answered as the owner answers it; it is not drawn as failed or as a claim */
  assert.ok(p.byOp("person").length >= 1);
  assert.equal((await me.read("person", { query: { id: org, at: p.byOp("person")[0].query.at } })).claims.length, 0);
  assert.equal(m.querySelector('[data-state="failed"]'), null, "an answer of no claims is drawn as no claims");
  /* the owner once refused an organization NOT_A_PERSON and the page keeps to its word: that refusal is no claims and no failed read (a refusal this build no longer gives) */
  const old = await openAs(world, me, "/app/person/" + org, { plane: { person: noPerson(), samepersoncandidates: noPerson() } });
  assert.equal(main(old).querySelector('[data-state="failed"]'), null, "a NOT_A_PERSON refusal is drawn as no claims");
  assert.ok(!main(old).textContent.includes(word("refusal.NOT_A_PERSON")));
  const q = await openAs(world, me, "/app/person/" + chen);
  const pk = q.doc.getElementById("person-fact-kind").querySelectorAll("option").map((o) => o.textContent);
  assert.equal(pk.length, 6, "control: a person has her six kinds");
  assert.equal(secOf(q, "screen.person.same") !== undefined, true);
});

test("R53 an organization of each kind (institution, body, movement) is drawn as one; its connect act answers in words", async () => {
  const { world, me } = await inWorld();
  const orgs = {};
  for (const kind of ["institution", "body", "movement"]) orgs[kind] = await entity(me, kind, `The ${kind} of the city`);
  for (const kind of Object.keys(orgs)) {
    const p = await openAs(world, me, "/app/person/" + orgs[kind]);
    assert.equal(p.doc.getElementById("person-fact-kind").querySelectorAll("option").length, 3, kind);
  }
  /* what Connect finds is said in words, never a bare code */
  const p = await openAs(world, me, "/app/person/" + orgs.body);
  await press(p, "connect", { reason: REASON });
  const connected = await me.act("connect", { body: { entityId: orgs.body } });
  assert.equal(connected.documents, 0);
  assert.ok(main(p).querySelector('[data-connected="0"]'), "what Connect found is said");
  /* an answer the owner gives for a subject that is no organization or person: a refusal, in the refusal's words */
  const q = await openAs(world, me, "/app/person/" + orgs.body, { plane: { connect: refusedIn("NOT_A_PERSON", "x") } });
  await press(q, "connect", { reason: REASON });
  assert.ok(main(q).textContent.includes(word("refusal.NOT_A_PERSON")), "the refusal by its words, never the bare code");
  assert.ok(!main(q).textContent.includes("NOT_A_PERSON"));
});

/* a world with a department, a second record under the same name (a candidate), and a claim of each kind to another body */
async function claimed() {
  const { world, me } = await inWorld();
  const dev = await world.signIn("dev", { admin: false });
  const org = await entity(me, "body", "Public Works Department");
  const twin = await entity(me, "body", "Public Works Department", "A second record under the same name");
  const apart = await entity(me, "body", "Parks Department");
  const unsure = await entity(me, "body", "Water Board");
  await dev.act("identityclaim", { body: { a: org, b: twin, kind: "same_as", basis: "testimony", note: "both give the same street address" } });
  await dev.act("identityclaim", { body: { a: org, b: apart, kind: "not_same_as", basis: "testimony", note: "different registration numbers" } });
  await me.act("identityclaim", { body: { a: org, b: unsure, kind: "unsure", basis: "testimony", note: "a similar name" } });
  return { world, me, org, twin, apart, unsure };
}

test("R58 an organization's page draws the .org keys: Same organization?, its help, the claim's words and the candidates; control: a person's page draws its own keys", async () => {
  const { world, me, org } = await claimed();
  const chen = await entity(me, "person", "L. Chen", "Director of the department");
  const p = await openAs(world, me, "/app/person/" + org);
  const read = await me.read("person", { query: { id: org, at: p.byOp("person")[0].query.at } });
  assert.deepEqual(read.claims.map((c) => c.kind).sort(), ["not_same_as", "same_as", "unsure"]);
  assert.equal(read.cluster.members.length, 2, "the same_as claim links the other record");
  assert.ok((await me.read("samepersoncandidates", { query: { id: org } })).count >= 1);
  const s = secOf(p, "screen.person.same.org");
  assert.ok(s, "headed by the organization's key");
  assert.equal(secOf(p, "screen.person.same"), undefined, "not the person's");
  assert.ok(s.querySelector("[data-tip]").getAttribute("data-tip").includes(word("screen.person.same.holds.org")), "its help");
  drew(s, "screen.person.same.claimed.org");
  drew(s, "screen.person.candidates.org");
  for (const k of ["same_as", "not_same_as", "unsure"]) drew(s, "screen.person.claim.kind." + k + ".org");
  const form = p.doc.getElementById("person-claim-kind").querySelectorAll("option").map((o) => o.textContent);
  assert.deepEqual(form, [word("screen.person.claim.same_as.org"), word("screen.person.claim.not_same_as.org"), word("screen.person.claim.kind.unsure.org")]);
  /* control: the person's own page is drawn with the person's words and none of the organization's */
  const q = await openAs(world, me, "/app/person/" + chen);
  const t = secOf(q, "screen.person.same");
  assert.ok(t);
  for (const k of ["same.claimed", "candidates", "claim.same_as", "claim.not_same_as", "claim.kind.unsure"]) notDrew(t, "screen.person." + k + ".org");
  assert.ok(!t.textContent.includes(word("screen.person.kind.help.org")));
});

test.todo("REPORTED: R58 a claim row of an organization is drawn by screen.person.same.because.org (the grade and the basis in the row's words); person gives no `basis` on its claims (people/index.mjs:1071), so the row is the claim's sentence (person.mjs:277)", async () => {
  const { world, me, org } = await claimed();
  const p = await openAs(world, me, "/app/person/" + org);
  const read = await me.read("person", { query: { id: org, at: p.byOp("person")[0].query.at } });
  const s = secOf(p, "screen.person.same.org");
  assert.ok(read.claims.every((c) => c.basis), "person gives each claim its basis");
  for (const c of read.claims) drew(s, "screen.person.same.because.org", { grade: c.grade, basis: word("screen.person.basis.row." + c.basis) });
});

/* R50 */
async function keepers({ docs = true, office = true } = {}) {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const org = await entity(me, "body", "Public Works Department");
  const chen = await entity(me, "person", "L. Chen", "Director of the department");
  const keeper = await entity(me, "office", "Director of Public Works", "The head of the department");
  const stranger = await entity(me, "office", "Another city's clerk", "Not this department's");
  const subject = await entity(me, "ordinance", "Street repair and potholes", "The city's rule on street repair");
  const held = docs ? await world.recipes.hold(me, "Council minutes.txt", "The Director of Public Works keeps the records on street repair.") : null;
  const basis = held ? { captureSha: held.sha, extent: { kind: "document" } } : null;
  if (office) await me.act("recordline", { body: { kind: "post_in", from: keeper, to: org, basis, valid: { from: "2020-01-01", to: null, precision: "day", zone: "UTC" } } });
  const keeps = (kind, o = {}) => me.act("recordline", { body: { kind, from: keeper, to: subject, basis, valid: { from: "2022-03-01", to: null, precision: "day", zone: "UTC" }, ...o } });
  return { world, me, org, chen, keeper, stranger, subject, held, basis, keeps };
}

test("R50 Records its offices keep lists the lines standing for this organization's offices; the act records a new one with the declared fields (kind, office, subject, the chosen document, dates); control: an office of another organization is not offered", async () => {
  const { world, me, org, keeper, subject, held, keeps } = await keepers();
  await keeps("custodian_of");
  const p = await openAs(world, me, "/app/person/" + org);
  const sec = secOf(p, "screen.person.keeper.heading");
  assert.ok(sec, "the section is drawn for an organization with an office");
  const read = await me.read("linesof", { query: { entity: keeper, kinds: "custodian_of,responsible_for", direction: "from", limit: "200" } });
  const subjectName = (await me.read("entity", { query: { id: subject } })).entity.label;
  const officeName = (await me.read("entity", { query: { id: keeper } })).entity.label;
  assert.equal(read.lines.length, 1);
  drew(sec, "screen.person.keeper.intro.a");
  drew(sec, "screen.person.keeper.line", { subject: subjectName });
  assert.ok(sec.textContent.includes(officeName));
  assert.ok(sec.textContent.includes(word("screen.person.since", { from: dayOf(read.lines[0].valid.from) })), "the dates it states");
  assert.equal(sec.querySelectorAll(".cs-grade").length >= 1, true, "its source's grade");
  assert.deepEqual(p.doc.getElementById("kp-office").querySelectorAll("option").map((o) => o.textContent), [officeName], "an office of another organization is not offered");
  fill(p, { "kp-office": keeper, "kp-kind": "responsible_for", "kp-subject": subject, "kp-doc": held.sha, "kp-from": "2022-03-01" });
  await press(p, "recordline", { reason: REASON });
  assert.deepEqual(p.byOp("recordline")[0].body, { kind: "responsible_for", from: keeper, to: subject, basis: { captureSha: held.sha, extent: { kind: "document" } },
    valid: { from: "2022-03-01", to: null, precision: "day", zone: "UTC" } });
  assert.ok(p.byOp("linesof").length >= 3, "the lines are read again after the act");
  const after = await me.read("linesof", { query: { entity: keeper, kinds: "custodian_of,responsible_for", direction: "from", limit: "200" } });
  assert.deepEqual(after.lines.map((l) => l.kind).sort(), ["custodian_of", "responsible_for"], "the store holds both statements");
  /* a member's own word is a basis too, with the statement she gives */
  const w = await keepers();
  const q = await openAs(w.world, w.me, "/app/person/" + w.org);
  fill(q, { "kp-src": "own" });
  q.fire(q.doc.getElementById("kp-src"), "change");
  await q.settle();
  assert.equal(q.doc.getElementById("kp-doc"), null, "no document chosen for her own word");
  fill(q, { "kp-office": w.keeper, "kp-subject": w.subject, "kp-statement": "I worked in that office" });
  await press(q, "recordline", { reason: REASON });
  assert.deepEqual(q.byOp("recordline")[0].body, { kind: "custodian_of", from: w.keeper, to: w.subject, basis: { statement: "I worked in that office" } }, "no dates: no validity sent");
  const own = await w.me.read("linesof", { query: { entity: w.keeper, kinds: "custodian_of,responsible_for", direction: "from", limit: "200" } });
  assert.equal(own.lines.length, 1);
  assert.equal(own.lines[0].basis.statement, "I worked in that office");
});

test("R50 a statement with no source sends nothing; the owner's refusals are drawn in the design's words (no source, same office and subject, dates reversed); an organization with no office draws no section (R22)", async () => {
  const bare = await keepers({ docs: false, office: false });
  const barePage = await openAs(bare.world, bare.me, "/app/person/" + bare.org);
  assert.equal(secOf(barePage, "screen.person.keeper.heading"), undefined, "no office, no section");
  assert.ok(!actsIn(main(barePage)).includes("recordline"));
  /* an office of the organization, held on no document: the post is the member's own word, and no document is held to cite */
  const w = await keepers({ docs: false, office: false });
  await w.me.act("recordline", { body: { kind: "post_in", from: w.keeper, to: w.org, basis: { statement: "the department's chart shows it" }, valid: { from: "2020-01-01", to: null, precision: "day", zone: "UTC" } } });
  const nodoc = await openAs(w.world, w.me, "/app/person/" + w.org);
  fill(nodoc, { "kp-office": w.keeper, "kp-subject": w.subject });
  await press(nodoc, "recordline", { reason: REASON });
  assert.equal(nodoc.byOp("recordline").length, 0, "no source, nothing sent");
  drew(main(nodoc), "screen.person.keeper.refused.nobasis.b");
  /* the store's own refusals, caused by the act: the same office and subject, and dates reversed */
  const k = await keepers();
  const subjectIsOffice = await openAs(k.world, k.me, "/app/person/" + k.org);
  fill(subjectIsOffice, { "kp-office": k.keeper, "kp-subject": k.keeper, "kp-doc": k.held.sha });
  await press(subjectIsOffice, "recordline", { reason: REASON });
  assert.equal(subjectIsOffice.byOp("recordline").length, 1, "SELF_LINE");
  drew(main(subjectIsOffice), "screen.person.keeper.refused.self.a");
  const reversed = await openAs(k.world, k.me, "/app/person/" + k.org);
  fill(reversed, { "kp-office": k.keeper, "kp-subject": k.subject, "kp-doc": k.held.sha, "kp-from": "2023-01-01", "kp-to": "2022-01-01" });
  await press(reversed, "recordline", { reason: REASON });
  assert.equal(reversed.byOp("recordline").length, 1, "BOUNDS_REVERSED");
  drew(main(reversed), "screen.person.keeper.refused.dates.a");
  /* the refusal of a line with no basis, which the page never sends (it asks for one first): scripted, drawn in the design's words */
  const nobasis = await openAs(k.world, k.me, "/app/person/" + k.org, { plane: { recordline: refusedIn("NO_BASIS", "x") } });
  fill(nobasis, { "kp-office": k.keeper, "kp-subject": k.subject, "kp-doc": k.held.sha });
  await press(nobasis, "recordline", { reason: REASON });
  assert.equal(nobasis.byOp("recordline").length, 1, "NO_BASIS");
  drew(main(nobasis), "screen.person.keeper.refused.nobasis.a");
  const person = await openAs(k.world, k.me, "/app/person/" + k.chen);
  assert.equal(secOf(person, "screen.person.keeper.heading"), undefined, "control: a person's page has none");
  assert.ok(!actsIn(main(person)).includes("recordline"));
});

/* B423 (T51; DEC-384 design rows, words.json): an office's responsible-for statement is drawn by its own key */
test("R50 B423 a statement that an office is responsible for is drawn by its own key, never the bare relation word", async () => {
  const { world, me, org, subject, keeps } = await keepers();
  await keeps("responsible_for", { valid: null });
  const r = await openAs(world, me, "/app/person/" + org);
  const subjectName = (await me.read("entity", { query: { id: subject } })).entity.label;
  drew(secOf(r, "screen.person.keeper.heading"), "screen.person.keeper.line.responsible", { subject: subjectName });
});

/* B14 entry 1 (K4259; registry at 09fbb247eb): each kept line carries the design's "Withdraw this statement, with a reason" */
test("R50 B14 each statement standing in Records its offices keep is drawn with linewithdraw (the registry's label); pressing it asks the reason, sends the line's id with it, and the lines are read again; control: a withdrawn line draws no act, a person's page none", async () => {
  const { world, me, org, chen, keeper, keeps } = await keepers();
  await keeps("responsible_for", { valid: null });
  await keeps("custodian_of");
  const mistaken = await keeps("custodian_of", { valid: { from: "2019-01-01", to: null, precision: "day", zone: "UTC" } });
  await me.act("linewithdraw", { body: { lineId: mistaken.line_id, reason: "x" } });
  const p = await openAs(world, me, "/app/person/" + org);
  const sec = secOf(p, "screen.person.keeper.heading");
  const buttons = sec.querySelectorAll('button[data-act="linewithdraw"]');
  assert.equal(buttons.length, 2, "one for each standing statement, none for the withdrawn one");
  const standing = (await me.read("linesof", { query: { entity: keeper, kinds: "custodian_of,responsible_for", direction: "from", limit: "200" } })).lines.filter((l) => !l.withdrawn);
  assert.deepEqual(buttons.map((b) => b.getAttribute("data-line")).sort(), standing.map((l) => l.line_id).sort());
  for (const b of buttons) assert.equal(b.textContent.startsWith(word("act.linewithdraw.label.person")), true, "the registry's own label");
  assert.equal(buttons[0].closest(".cs-row").querySelectorAll(".cs-grade").length, 1, "the row keeps its source's grade");
  const target = buttons[1].getAttribute("data-line");
  await press(p, "linewithdraw", { el: buttons[1], reason: "recorded by mistake" });
  assert.deepEqual(p.byOp("linewithdraw")[0].body, { lineId: target, reason: "recorded by mistake" });
  assert.equal(secOf(p, "screen.person.keeper.heading").querySelectorAll('button[data-act="linewithdraw"]').length, 1, "read again: the withdrawn statement is no longer standing");
  const after = (await me.read("linesof", { query: { entity: keeper, kinds: "custodian_of,responsible_for", direction: "from", limit: "200" } })).lines;
  assert.ok(after.find((l) => l.line_id === target).withdrawn, "the store keeps the statement, shown withdrawn");
  const q = await openAs(world, me, "/app/person/" + org);
  await press(q, "linewithdraw", { el: button(q, "linewithdraw") });
  assert.equal(q.byOp("linewithdraw").length, 0, "no reason, nothing sent");
  const person = await openAs(world, me, "/app/person/" + chen);
  assert.ok(button(person, "linewithdraw") === null, "control: a person's page draws none");
});
