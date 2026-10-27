/* Settings › Places and offices at the module's interface (R19). Over the world (store-request): the profiles, the place wanted, the offices,
   the courts and the confirmations are made by the real acts of their owners, and what the tests expect is read back from the owners' answers. */
import test from "node:test";
import assert from "node:assert/strict";
import { acts, all, day, has, lacks, open, said, textOf } from "./kit.mjs";
import { hasWord } from "../../../src/setup-words/index.mjs";
import { team, PROFILE, manyOffices, officesOf, machineAct, rawAnswer, laterPageFails, courtsFail, pointerUnread, testProfileActive, noChoices } from "./seed-places.mjs";

const ops = (o) => [...new Set(acts(o.tree).map((b) => b.attrs["data-act"]))].sort();
// the next page is read on the page's clock (cs.later): the harness's fake clock is moved on
const settle = async (o) => { for (let i = 0; i < 3; i++) { await o.b.clock.tick(10); await o.b.settle(40); } o.redraw(); };
const choiceBox = (id) => "pl-p-" + id;
const courtsOf = async (as) => (await as.read("entitieskind", { query: { kind: "body", forum_kind: "court", limit: "500" } })).entities;
const handleOf = async (as, id) => (await as.read("memberlist")).members.find((m) => m.member_id === id).handle;

test("R19 places: the places whose rules apply, chosen with profilesset, its warning said first; choosing none is allowed", async () => {
  const { w, founder } = await team();
  const held = await founder.read("profiles");
  const a = await open("places", { world: w, as: founder });
  assert.ok(a.text.includes(held.profiles[0].name));
  const t = a.text;
  assert.ok(t.indexOf(said("screen.places.profiles.warning")) >= 0 && t.indexOf(said("screen.places.profiles.warning")) < t.indexOf(said("act.profilesset.label.places")), "the warning before the act");
  const id = held.choices[0].id;
  assert.deepEqual((await a.press("profilesset", { values: { [choiceBox(id)]: true } })).sent[0].body, { profiles: [id] });
  assert.deepEqual((await founder.read("profiles")).profiles.map((p) => p.id), [id]);
  assert.deepEqual((await a.press("profilesset", { values: { [choiceBox(id)]: false } })).sent[0].body, { profiles: [] }, "none allowed");
  assert.deepEqual((await founder.read("profiles")).profiles, [], "the world holds none");
  // no place chosen and none named: the places' own sentence (R60 is for a place named)
  const bare = await team({ profile: false });
  assert.equal((await bare.founder.read("placewantedstate")).name, null);
  const none = await open("places", { world: bare.w, as: bare.founder });
  has(none, "screen.places.profiles.none");
});

test("R19 places: the place wanted (placewantedstate, placewanted; empty clears)", async () => {
  const { w, founder } = await team();
  await founder.act("placewanted", { body: { name: "Alameda County" } });
  const state = await founder.read("placewantedstate");
  const a = await open("places", { world: w, as: founder });
  has(a, "screen.places.wanted.now", { name: state.name, date: day(state.set_at) });
  assert.deepEqual((await a.press("placewanted", { values: { "pl-want": " Berkeley " } })).sent[0].body, { name: "Berkeley" });
  assert.equal((await founder.read("placewantedstate")).name, "Berkeley");
  assert.deepEqual((await a.press("placewanted", { values: { "pl-want": "" } })).sent[0].body, { name: null });
  assert.equal((await founder.read("placewantedstate")).name, null);
});

test("R19 places: the offices read page by page to the end, each marked by origin; a later page that fails is said, never drawn as none", async () => {
  const { w, founder } = await team();
  await manyOffices(w, founder, 501);   // 500 to a page: the last, made by a machine, is the second page
  const first = await founder.read("entitieskind", { query: { kind: "office", limit: "500" } });
  assert.ok(first.next, "the owner pages the offices");
  const held = await officesOf(founder);
  const a = await open("places", { world: w, as: founder });
  await settle(a);
  const reads = a.p.requests.filter((r) => r.op === "entitieskind" && r.query.kind === "office");
  assert.deepEqual(reads.map((r) => [r.query.kind, r.query.after || null]), [["office", null], ["office", first.next]]);
  for (const n of [held[0].label, held[held.length - 1].label]) assert.ok(a.text.includes(n), n);
  const items = all(all(a.tree, (e) => e.attrs["data-list"] === "offices")[0], (e) => e.tag === "li").map((e) => e.children.map((c) => c.text || "").join(""));
  assert.equal(items.length, held.length);
  has(a, "screen.places.offices.bygroup");
  has(a, "screen.places.offices.seeded");
  const failing = await open("places", { world: w, as: founder, table: laterPageFails(founder) });
  await settle(failing);
  has(failing, "screen.places.offices.rest");
  lacks(failing, "screen.places.offices.none");
  const failed = await open("places", { world: w, as: founder, table: { entitieskind: "none" } });
  lacks(failed, "screen.places.offices.none");
});

test("R19 places: officesseed and entitycreate (an office with the member's note); a member is drawn no act", async () => {
  const { w, founder, dev } = await team();
  assert.equal((await founder.read("entitieskind", { query: { kind: "body", limit: "500" } })).count, 0, "nothing is held before the seeding");
  const a = await open("places", { world: w, as: founder });
  assert.deepEqual((await a.press("officesseed")).sent[0].body, {});
  const again = await founder.act("officesseed", { body: {} });   // what the page's seeding made is what a repeat finds already held
  assert.ok(again.already.length > 0 && again.seeded.length === 0);
  has(a, "screen.places.seeded", { seeded: again.already.length, already: 0, unseeded: again.unseeded.length });
  assert.deepEqual((await a.press("entitycreate", { data: { court: null }, values: { "pl-label": "Public Works", "pl-note": "Fixes the streets." } })).sent[0].body, { kind: "office", label: "Public Works", note: "Fixes the streets." });
  const made = (await officesOf(founder)).find((o) => o.label === "Public Works");
  assert.equal(made.note, "Fixes the streets.");
  assert.deepEqual((await a.press("entitycreate", { data: { court: null }, values: { "pl-label": "Public Works", "pl-note": "" } })).sent, []);
  const m = await open("places", { world: w, as: dev });
  assert.deepEqual(ops(m), []);
  assert.ok(!m.p.requests.some((r) => r.op === "placewantedstate"), "the place wanted is an administrator's read");
});

/* R25: where else to go */
const link = (o) => all(o.tree, (e) => e.tag === "a" && e.attrs["data-screen"] === "elsewhere");
const pointersOf = async (as) => (await as.read("startfrom")).routes.find((r) => r.route === "elsewhere").pointer.pointers;

test("R25 places draws Where else to go: how many places are listed (from the pointers) and the reference opening elsewhere; no act", async () => {
  const { w, founder } = await team();
  const n = (await pointersOf(founder)).length;
  assert.ok(n >= 1, "the profile lists where else to go");
  const a = await open("places", { world: w, as: founder });
  assert.ok(a.p.requests.some((r) => r.op === "startfrom"), "reads startfrom");
  has(a, "places.elsewhere.head");
  has(a, "places.elsewhere.says", { n });
  const l = link(a);
  assert.equal(l.length, 1);
  assert.equal(l[0].attrs.href, "/app/elsewhere");
  assert.equal(textOf(l[0]), said("places.elsewhere.open"));
  assert.ok(!ops(a).some((o) => /elsewhere|pointer/.test(o)), "the group neither chooses nor edits the list: no act for it");
});

test("R25 control: none listed draws the reference alone; a pointer of null is drawn failed, never as none", async () => {
  const bare = await team({ profile: false });
  assert.deepEqual(await pointersOf(bare.founder), [], "no profile, none listed");
  const none = await open("places", { world: bare.w, as: bare.founder });
  has(none, "places.elsewhere.head");
  assert.equal(link(none).length, 1);
  assert.ok(!none.text.includes(said("places.elsewhere.says", { n: 0 }).split(" 0 ")[0] + " 0 "), "no words for zero");
  assert.equal(all(none.tree, (e) => e.attrs["data-state"] === "elsewhere").length, 0);
  const { w, founder, dev } = await team();
  const failed = await open("places", { world: w, as: founder, table: pointerUnread(founder) });
  assert.equal(link(failed).length, 0, "no reference to a list that could not be read");
  const sec = all(failed.tree, (e) => e.tag === "section" && all(e, (h) => h.tag === "h2").some((h) => textOf(h) === said("places.elsewhere.head")))[0];
  assert.ok(sec && all(sec, (e) => e.attrs["data-state"] === "failed").length === 1, "drawn failed");
  assert.ok(!failed.text.includes(said("places.elsewhere.says", { n: 0 }).slice(0, 12)));
  // a member who does not administer is not drawn the administrators' note
  const m = await open("places", { world: w, as: dev });
  assert.ok(!m.p.requests.some((r) => r.op === "startfrom"));
  assert.equal(link(m).length, 0);
});

/* R46 (T50; N1190): the courts held, and "Add a court" */
const courtsSection = (o) => all(o.tree, (e) => e.tag === "section" && all(e, (h) => h.tag === "h2").some((h) => textOf(h) === said("screen.places.courts")))[0];

test("R46 the Courts section lists the forums of kind court by name, a seeded one and an added one each with its own line", async () => {
  const { w, founder, dev } = await team();
  await machineAct(w, "entitycreate", { kind: "body", forum_kind: "court", label: "Superior Court of the County", note: "n" });   // a machine's: read as seeded
  await dev.act("entitycreate", { body: { kind: "body", forum_kind: "court", label: "Small Claims", note: "Small Claims" } });
  const held = await courtsOf(founder);
  assert.equal(held.length, 2);
  const a = await open("places", { world: w, as: founder });
  const read = a.p.requests.find((r) => r.op === "entitieskind" && r.query.kind === "body");
  assert.deepEqual(read.query, { kind: "body", forum_kind: "court", limit: "500" }, "the courts, read by kind and forum kind");
  const sec = courtsSection(a);
  assert.ok(sec, "the section is drawn to an administrator");
  const items = all(all(sec, (e) => e.attrs["data-list"] === "courts")[0], (e) => e.tag === "li").map((e) => textOf(e));
  assert.equal(items.length, held.length);
  assert.ok(items[0].includes(held[0].label) && items[0].includes(said("screen.places.court.seeded")), "a seeded court: where it came from");
  assert.ok(items[1].includes(held[1].label) && items[1].includes(said("screen.places.court.added", { name: await handleOf(founder, held[1].declared_by), date: day(held[1].at) })), "an added court: by the member's handle and the day");
  // control: a failed read is drawn failed, never as none
  const failed = await open("places", { world: w, as: founder, table: courtsFail(founder) });
  assert.ok(all(courtsSection(failed), (e) => e.attrs["data-state"] === "failed").length >= 1, "drawn failed");
  assert.equal(all(courtsSection(failed), (e) => e.attrs["data-list"] === "courts").length, 0);
});

test("R46 Add a court sends entitycreate of kind body with forum_kind court and the name, says the court added, and reads the list again; an empty name sends nothing", async () => {
  const { w, founder } = await team();
  const a = await open("places", { world: w, as: founder });
  has(a, "court.add.name");
  assert.deepEqual((await a.press("entitycreate", { data: { court: "1" }, values: { "pl-court": " Berkeley Housing Court " } })).sent[0].body, { kind: "body", forum_kind: "court", label: "Berkeley Housing Court", note: "Berkeley Housing Court" });
  assert.deepEqual((await courtsOf(founder)).map((c) => c.label), ["Berkeley Housing Court"], "the world holds the court");
  assert.ok(a.p.requests.filter((r) => r.op === "entitieskind" && r.query.kind === "body").length >= 2, "the list read again");
  // the court's name is said after the answer
  has(a, "screen.places.court.done", { name: "Berkeley Housing Court" });
  const empty = await a.press("entitycreate", { data: { court: "1" }, values: { "pl-court": "  " } });
  assert.deepEqual(empty.sent, []);
  assert.ok(empty.refused, "refused by a word");
  assert.equal((await courtsOf(founder)).length, 1);
});

test("R46 control: a member who does not administer is drawn no Courts section and no act, and the courts are not read", async () => {
  const { w, dev } = await team();
  const m = await open("places", { world: w, as: dev });
  assert.equal(courtsSection(m), undefined);
  assert.deepEqual(ops(m), []);
  assert.ok(!m.p.requests.some((r) => r.op === "entitieskind" && r.query.kind === "body"));
});

/* R60 (T51; N858 D8; DEC-340, U366): a place named and no profile held for it; R61's reference to the team's own rules */
const nevada = async () => { const t = await team({ profile: false }); await t.founder.act("placewanted", { body: { name: "Nevada" } }); return t; };
const rulesRef = (o) => all(o.tree, (e) => e.tag === "a" && e.attrs["data-screen"] === "grouprules");

test("R60 a place named and no active profile: the six sentences and the field, the reference to the team's own rules, and none of R19's sections", async () => {
  const { w, founder } = await nevada();
  // the world's jurisdictions always offer a profile to choose; with none offered, nothing a profile fills is drawn (a profile offered is R60's control)
  const a = await open("places", { world: w, as: founder, table: noChoices(founder) });
  has(a, "screen.places.noprofile.heading", { state: "Nevada" });
  has(a, "screen.places.noprofile.says", { state: "Nevada" });
  for (const k of ["screen.places.noprofile.offers", "screen.places.noprofile.still", "screen.places.noprofile.asks", "screen.places.noprofile.want", "screen.places.noprofile.want.help"]) has(a, k);
  assert.equal(a.b.doc.getElementById("pl-want").value, "Nevada", "the place named, to name again");
  assert.deepEqual((await a.press("placewanted", { values: { "pl-want": " Reno, Nevada " } })).sent[0].body, { name: "Reno, Nevada" });
  assert.equal((await founder.read("placewantedstate")).name, "Reno, Nevada");
  assert.equal(rulesRef(a).length, 1, "the reference");
  assert.equal(textOf(rulesRef(a)[0]), said("screen.grouprules.name"));
  assert.equal(rulesRef(a)[0].attrs.href, "/app/grouprules");
  has(a, "screen.places.rules.note");
  // none of R19's sections, and nothing filled from another profile
  for (const k of ["screen.places.profiles.heading", "screen.places.offices.heading", "screen.places.courts", "screen.places.add.heading", "places.elsewhere.head", "screen.places.wanted.heading"]) lacks(a, k);
  assert.ok(!all(a.tree, (e) => e.tag === "ul" && ["offices", "courts", "profiles"].includes(e.attrs["data-list"])).length);
  assert.deepEqual(ops(a), ["placewanted"], "only the place can be named again");
});

test("R60 control: with a profile active none of the six sentences is drawn, R19 as before, and the same reference beneath it; a profile offered to choose is still offered", async () => {
  const { w, founder } = await team();
  await founder.act("placewanted", { body: { name: "Alameda County" } });
  const a = await open("places", { world: w, as: founder });
  for (const k of ["screen.places.noprofile.offers", "screen.places.noprofile.still", "screen.places.noprofile.asks", "screen.places.noprofile.want"]) lacks(a, k);
  has(a, "screen.places.profiles.heading");
  assert.equal(rulesRef(a).length, 1);
  assert.ok(a.html.lastIndexOf('data-screen="grouprules"') > a.html.indexOf(said("screen.places.add.heading").slice(0, 12)), "beneath the rest");
  // a profile that could be chosen is offered even when none is active yet
  const n = await nevada();
  const offered = (await n.founder.read("profiles")).choices[0].id;
  const choose = await open("places", { world: n.w, as: n.founder });
  assert.deepEqual((await choose.press("profilesset", { values: { [choiceBox(offered)]: true } })).sent[0].body, { profiles: [offered] });
  assert.deepEqual((await n.founder.read("profiles")).profiles.map((p) => p.id), [offered]);
  // a test profile is no profile
  const t = await nevada();
  const test = await open("places", { world: t.w, as: t.founder, table: testProfileActive(t.founder) });
  has(test, "screen.places.noprofile.says", { state: "Nevada" });
  // a member who does not administer reads no place named and is not drawn the notice; they are given the way to the rules
  const m = await open("places", { world: n.w, as: n.dev });
  lacks(m, "screen.places.noprofile.says", { state: "Nevada" });
  assert.equal(rulesRef(m).length, 1);
});

/* ---- T51 fix round 2: C87, C94 ---- */

test("R46 C87: Add a court with its name empty sends nothing and names the box; filled, it sends (control)", async () => {
  const { w, founder } = await team();
  const a = await open("places", { world: w, as: founder });
  const r = await a.press("entitycreate", { data: { court: "1" }, values: { "pl-court": "   " } });
  assert.deepEqual(r.sent, []);
  assert.equal(a.refused.text, said("shell.field.needed", { field: said("court.add.name") }), "the box is named: " + (a.refused && a.refused.text));
  assert.equal((await a.press("entitycreate", { data: { court: "1" }, values: { "pl-court": "Berkeley Housing Court" } })).sent.filter((x) => x.op === "entitycreate").length, 1);
});

test("R46 C94: a court a member added names that member by memberName: the handle where it differs from the id, the fallback word where the member has none, never an id", async () => {
  const { w, founder, dev } = await team();
  await founder.act("entitycreate", { body: { kind: "body", forum_kind: "court", label: "Court One", note: "n" } });
  await dev.act("entitycreate", { body: { kind: "body", forum_kind: "court", label: "Court Two", note: "n" } });
  // seeded: no act makes a court whose author the team's roster does not hold (every member who acts has a handle)
  w.sql.exec("UPDATE entities SET declared_by = 'm-9' WHERE label = 'Court Two'");
  const held = await courtsOf(founder);
  const handle = await handleOf(founder, held[0].declared_by);
  assert.notEqual(handle, held[0].declared_by, "the founder's handle is not her id");
  const a = await open("places", { world: w, as: founder });
  const items = all(all(a.tree, (e) => e.attrs["data-list"] === "courts")[0], (e) => e.tag === "li").map((e) => textOf(e));
  assert.ok(items[0].includes(said("screen.places.court.added", { name: handle, date: day(held[0].at) })), items[0]);
  assert.ok(items[1].includes(said("screen.places.court.added", { name: said("shell.card.member"), date: day(held[1].at) })), items[1]);
  assert.ok(!a.text.includes(held[0].declared_by + " ") && !a.text.includes("m-9"));
});

/* ---- T51 fix round 3: C64 (entities R63, R64; DEC-401, DEC-402) ---- */

/** A team holding an office a member named (dev, stating where requests go and the law they go under) and one the administrator made. */
async function withOffices() {
  const t = await team();
  const law = (await t.founder.read("profiles")).view.records_laws.find((l) => l.level === "federal").citation;
  const named = await t.dev.act("entitycreate", { body: { kind: "office", label: "Records Office of the Agency", note: "n", contact: { kind: "portal", value: "https://records.agency.example/portal" }, law } });
  const own = await t.founder.act("entitycreate", { body: { kind: "office", label: "Office of the City Clerk", note: "n" } });
  const held = await officesOf(t.founder);
  return { ...t, NAMED: held.find((o) => o.entity_id === named.entity_id), OWN: held.find((o) => o.entity_id === own.entity_id) };
}
const officeLine = (o, id) => all(all(o.tree, (e) => e.attrs["data-list"] === "offices")[0], (e) => e.tag === "li").find((e) => e.attrs["data-office"] === id);

test("R19 C64: an office a member named is listed with the mark and the administrator's confirm, with the contact and law it states; an office not named by a member draws no mark, no confirm and no line it does not state (control)", async () => {
  const { w, founder, dev, NAMED, OWN } = await withOffices();
  assert.equal(NAMED.named_by_member, true);
  assert.equal(OWN.named_by_member, false);
  const a = await open("places", { world: w, as: founder });
  const named = officeLine(a, NAMED.entity_id), own = officeLine(a, OWN.entity_id);
  assert.ok(named && own);
  assert.ok(textOf(named).includes(said("screen.request.nameoffice.mark")), "the mark");
  assert.equal(acts(named).filter((b) => b.attrs["data-act"] === "officeconfirm").length, 1, "the confirm");
  assert.ok(textOf(named).includes(said("screen.request.nameoffice.where") + ": " + NAMED.contact.value) && textOf(named).includes(said("screen.request.nameoffice.law") + ": " + NAMED.law), "where requests go and the law they go under");
  assert.ok(!textOf(named).includes(said("screen.places.offices.bygroup")), "the mark says who named it; the origin line is not said twice");
  assert.ok(!textOf(own).includes(said("screen.request.nameoffice.mark")) && acts(own).length === 0, "control: no mark, no confirm");
  assert.ok(!textOf(own).includes(said("screen.request.nameoffice.where")) && !textOf(own).includes(said("screen.request.nameoffice.law")), "control: nothing it does not state");
  assert.ok(textOf(own).includes(said("screen.places.offices.bygroup")), "control: marked by its origin as before");
  // a member who does not administer is shown the mark and is offered no confirm
  const m = await open("places", { world: w, as: dev });
  assert.ok(textOf(officeLine(m, NAMED.entity_id)).includes(said("screen.request.nameoffice.mark")));
  assert.deepEqual(ops(m), []);
});

test("R19 C64: the administrator's confirm sends officeconfirm with the office's entityId and reads the offices again, and the mark is gone; a repeat answers already and reads the same", async () => {
  const { w, founder, NAMED } = await withOffices();
  const a = await open("places", { world: w, as: founder });
  const b = await open("places", { world: w, as: founder });   // a second page, opened before the first confirms
  const before = a.p.requests.filter((r) => r.op === "entitieskind" && r.query.kind === "office").length;
  const r = await a.press("officeconfirm", { data: { office: NAMED.entity_id } });
  assert.deepEqual(r.sent.filter((x) => x.op === "officeconfirm").map((x) => x.body), [{ entityId: NAMED.entity_id }], "entityId, camel case, and nothing else");
  assert.ok(a.p.requests.filter((x) => x.op === "entitieskind" && x.query.kind === "office").length > before, "the offices are read again");
  assert.ok(!textOf(officeLine(a, NAMED.entity_id)).includes(said("screen.request.nameoffice.mark")), "the mark is gone");
  assert.equal(acts(officeLine(a, NAMED.entity_id)).length, 0, "and no confirm");
  assert.equal(a.refused, null, "done, nothing refused");
  assert.equal((await officesOf(founder)).find((o) => o.entity_id === NAMED.entity_id).named_by_member, false, "the world holds it confirmed");
  // a repeat (the page opened earlier pressed after it) answers already: drawn as done, not refused
  await b.press("officeconfirm", { data: { office: NAMED.entity_id } });
  assert.equal(b.refused, null, "already is as done as the first");
});

test("R19 C64: each refusal of the confirm is drawn beside it by its own words (refusal.<code>, else the owner's translation until the design writes it)", async () => {
  const { w, founder, dev, NAMED, OWN } = await withOffices();
  const court = (await founder.act("entitycreate", { body: { kind: "body", forum_kind: "court", label: "A court", note: "n" } })).entity_id;
  const checks = (a, code, owner) => {
    assert.ok(a.refused, code + " is drawn beside the act");
    assert.equal(owner.code, code, "the owner's refusal is " + code);
    assert.equal(a.refused.text, hasWord("refusal." + code) ? said("refusal." + code) : owner.translation, code);
    assert.ok(officeLine(a, NAMED.entity_id) && textOf(officeLine(a, NAMED.entity_id)).includes(said("screen.request.nameoffice.mark")), code + ": the mark stays");
  };
  // a stale page's id, or the id of a subject of another kind, or of an office no member named: the page sends it and the owner refuses it
  const stale = async (code, id) => {
    const a = await open("places", { world: w, as: founder });
    a.b.doc.querySelectorAll('button[data-act="officeconfirm"]')[0].setAttribute("data-office", id);
    await a.press("officeconfirm", { data: {} });
    checks(a, code, (await rawAnswer(w, founder, "officeconfirm", { entityId: id })).result);
  };
  await stale("NO_SUCH_ENTITY", "ENT-9999-9999");
  await stale("CONFIRM_NOT_AN_OFFICE", court);
  await stale("NOT_NAMED_BY_A_MEMBER", OWN.entity_id);
  // a refusal the page cannot be made to ask for (it sends no office with no id, and is not drawn the act by a member): the owner's own answer, handed back
  for (const [code, as, body] of [["NO_ENTITY", founder, {}], ["NOT_AN_ADMIN", dev, { entityId: NAMED.entity_id }]]) {
    const answer = await rawAnswer(w, as, "officeconfirm", body);
    const a = await open("places", { world: w, as: founder, table: { officeconfirm: () => answer } });
    await a.press("officeconfirm", { data: { office: NAMED.entity_id } });
    checks(a, code, answer.result);
  }
});
