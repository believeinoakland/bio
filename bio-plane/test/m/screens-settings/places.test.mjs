/* Settings › Places and offices at the module's interface (R19). */
import test from "node:test";
import assert from "node:assert/strict";
import { acts, all, day, has, lacks, open, said, textOf } from "./kit.mjs";
import { hasWord } from "../../../src/setup-words/index.mjs";
import { ADMIN, MEMBER, COURTS, env, refuse, placesTable } from "./fixtures.mjs";

const ops = (o) => [...new Set(acts(o.tree).map((b) => b.attrs["data-act"]))].sort();
// the next page is read on the page's clock (cs.later): the harness's fake clock is moved on
const settle = async (o) => { for (let i = 0; i < 3; i++) { await o.b.clock.tick(10); await o.b.settle(40); } o.redraw(); };

test("R19 places: the places whose rules apply, chosen with profilesset, its warning said first; choosing none is allowed", async () => {
  const a = await open("places", { me: ADMIN, table: placesTable() });
  assert.ok(a.text.includes("Oakland, California"));
  const t = a.text;
  assert.ok(t.indexOf(said("screen.places.profiles.warning")) >= 0 && t.indexOf(said("screen.places.profiles.warning")) < t.indexOf(said("act.profilesset.label.places")), "the warning before the act");
  assert.deepEqual((await a.press("profilesset", { values: { "pl-p-us-ca-oakland": true, "pl-p-us-ca": true } })).sent[0].body, { profiles: ["us-ca-oakland", "us-ca"] });
  assert.deepEqual((await a.press("profilesset", { values: { "pl-p-us-ca-oakland": false, "pl-p-us-ca": false } })).sent[0].body, { profiles: [] }, "none allowed");
  // no place chosen and none named: the places' own sentence (R60 is for a place named)
  const none = await open("places", { me: ADMIN, table: placesTable({ profiles: env({ ok: true, profiles: [], conflicts: [], choices: [] }), placewantedstate: env({ ok: true, name: null, set_by: null, set_at: null, matches: [] }) }) });
  has(none, "screen.places.profiles.none");
});

test("R19 places: the place wanted (placewantedstate, placewanted; empty clears)", async () => {
  const a = await open("places", { me: ADMIN, table: placesTable() });
  has(a, "screen.places.wanted.now", { name: "Alameda County", date: day("2026-10-04") });
  assert.deepEqual((await a.press("placewanted", { values: { "pl-want": " Berkeley " } })).sent[0].body, { name: "Berkeley" });
  assert.deepEqual((await a.press("placewanted", { values: { "pl-want": "" } })).sent[0].body, { name: null });
});

test("R19 places: the offices read page by page to the end, each marked by origin; a later page that fails is said, never drawn as none", async () => {
  const a = await open("places", { me: ADMIN, table: placesTable() });
  await settle(a);
  const reads = a.p.requests.filter((r) => r.op === "entitieskind" && r.query.kind === "office");
  assert.deepEqual(reads.map((r) => [r.query.kind, r.query.after || null]), [["office", null], ["office", "ENT-0002"]]);
  for (const n of ["Office of the City Clerk", "Department of Public Works", "Office of the City Auditor"]) assert.ok(a.text.includes(n), n);
  const items = all(all(a.tree, (e) => e.attrs["data-list"] === "offices")[0], (e) => e.tag === "li").map((e) => e.children.map((c) => c.text || "").join(""));
  assert.equal(items.length, 3);
  has(a, "screen.places.offices.bygroup");
  has(a, "screen.places.offices.seeded");
  const failing = await open("places", { me: ADMIN, table: placesTable({ entitieskind: (q) => q.after ? env({ ok: false, reason: "UNREADABLE", code: "UNREADABLE" }) : env({ ok: true, kind: "office", entities: [], count: 0, truncated: true, next: "ENT-0002" }) }) });
  await settle(failing);
  has(failing, "screen.places.offices.rest");
  lacks(failing, "screen.places.offices.none");
  const failed = await open("places", { me: ADMIN, table: placesTable({ entitieskind: "none" }) });
  lacks(failed, "screen.places.offices.none");
});

test("R19 places: officesseed and entitycreate (an office with the member's note); a member is drawn no act", async () => {
  const a = await open("places", { me: ADMIN, table: placesTable() });
  assert.deepEqual((await a.press("officesseed")).sent[0].body, {});
  has(a, "screen.places.seeded", { seeded: 1, already: 2, unseeded: 0 });
  assert.deepEqual((await a.press("entitycreate", { data: { court: null }, values: { "pl-label": "Public Works", "pl-note": "Fixes the streets." } })).sent[0].body, { kind: "office", label: "Public Works", note: "Fixes the streets." });
  assert.deepEqual((await a.press("entitycreate", { data: { court: null }, values: { "pl-label": "Public Works", "pl-note": "" } })).sent, []);
  const m = await open("places", { me: MEMBER, table: placesTable() });
  assert.deepEqual(ops(m), []);
  assert.ok(!m.p.requests.some((r) => r.op === "placewantedstate"), "the place wanted is an administrator's read");
});

/* R25: where else to go */
const elsewhere = (pointer) => placesTable({ startfrom: env({ ok: true, scripts: [], doors: [], routes: [{ route: "blank" }, { route: "elsewhere", pointer }], blank: true, matches: [] }) });
const link = (o) => all(o.tree, (e) => e.tag === "a" && e.attrs["data-screen"] === "elsewhere");

test("R25 places draws Where else to go: how many places are listed (from three pointers) and the reference opening elsewhere; no act", async () => {
  const a = await open("places", { me: ADMIN, table: placesTable() });
  assert.ok(a.p.requests.some((r) => r.op === "startfrom"), "reads startfrom");
  has(a, "places.elsewhere.head");
  has(a, "places.elsewhere.says", { n: 3 });
  const l = link(a);
  assert.equal(l.length, 1);
  assert.equal(l[0].attrs.href, "/app/elsewhere");
  assert.equal(textOf(l[0]), said("places.elsewhere.open"));
  assert.ok(!ops(a).some((o) => /elsewhere|pointer/.test(o)), "the group neither chooses nor edits the list: no act for it");
});

test("R25 control: none listed draws the reference alone; a pointer of null is drawn failed, never as none", async () => {
  const none = await open("places", { me: ADMIN, table: elsewhere({ places: [], pointers: [] }) });
  has(none, "places.elsewhere.head");
  assert.equal(link(none).length, 1);
  assert.ok(!none.text.includes(said("places.elsewhere.says", { n: 0 }).split(" 0 ")[0] + " 0 "), "no words for zero");
  assert.equal(all(none.tree, (e) => e.attrs["data-state"] === "elsewhere").length, 0);
  const failed = await open("places", { me: ADMIN, table: elsewhere(null) });
  assert.equal(link(failed).length, 0, "no reference to a list that could not be read");
  const sec = all(failed.tree, (e) => e.tag === "section" && all(e, (h) => h.tag === "h2").some((h) => textOf(h) === said("places.elsewhere.head")))[0];
  assert.ok(sec && all(sec, (e) => e.attrs["data-state"] === "failed").length === 1, "drawn failed");
  assert.ok(!failed.text.includes(said("places.elsewhere.says", { n: 0 }).slice(0, 12)));
  // a member who does not administer is not drawn the administrators' note
  const m = await open("places", { me: MEMBER, table: placesTable() });
  assert.ok(!m.p.requests.some((r) => r.op === "startfrom"));
  assert.equal(link(m).length, 0);
});

/* R46 (T50; N1190): the courts held, and "Add a court" */
const courtsSection = (o) => all(o.tree, (e) => e.tag === "section" && all(e, (h) => h.tag === "h2").some((h) => textOf(h) === said("screen.places.courts")))[0];

test("R46 the Courts section lists the forums of kind court by name, a seeded one and an added one each with its own line", async () => {
  const a = await open("places", { me: ADMIN, table: placesTable() });
  const read = a.p.requests.find((r) => r.op === "entitieskind" && r.query.kind === "body");
  assert.deepEqual(read.query, { kind: "body", forum_kind: "court", limit: "500" }, "the courts, read by kind and forum kind");
  const sec = courtsSection(a);
  assert.ok(sec, "the section is drawn to an administrator");
  const items = all(all(sec, (e) => e.attrs["data-list"] === "courts")[0], (e) => e.tag === "li").map((e) => textOf(e));
  assert.equal(items.length, COURTS.length);
  assert.ok(items[0].includes("Alameda County Superior Court") && items[0].includes(said("screen.places.court.seeded")), "a seeded court: where it came from");
  assert.ok(items[1].includes("Oakland Small Claims") && items[1].includes(said("screen.places.court.added", { name: "lu", date: day("2026-10-09T00:00:00Z") })), "an added court: by the member's handle and the day");
  // control: a failed read is drawn failed, never as none
  const failed = await open("places", { me: ADMIN, table: placesTable({ entitieskind: (q) => q.kind === "body" ? "none" : env({ ok: true, kind: "office", entities: [], count: 0, truncated: false, next: null }) }) });
  assert.ok(all(courtsSection(failed), (e) => e.attrs["data-state"] === "failed").length >= 1, "drawn failed");
  assert.equal(all(courtsSection(failed), (e) => e.attrs["data-list"] === "courts").length, 0);
});

test("R46 Add a court sends entitycreate of kind body with forum_kind court and the name, says the court added, and reads the list again; an empty name sends nothing", async () => {
  const a = await open("places", { me: ADMIN, table: placesTable() });
  has(a, "court.add.name");
  assert.deepEqual((await a.press("entitycreate", { data: { court: "1" }, values: { "pl-court": " Berkeley Housing Court " } })).sent[0].body, { kind: "body", forum_kind: "court", label: "Berkeley Housing Court", note: "Berkeley Housing Court" });
  assert.ok(a.p.requests.filter((r) => r.op === "entitieskind" && r.query.kind === "body").length >= 2, "the list read again");
  const empty = await a.press("entitycreate", { data: { court: "1" }, values: { "pl-court": "  " } });
  assert.deepEqual(empty.sent, []);
  assert.ok(empty.refused, "refused by a word");
  // the court's name is said after the answer
  const b = await open("places", { me: ADMIN, table: placesTable({ entitycreate: (q, body) => env({ ok: true, entity_id: "ENT-0103", kind: "body", label: body.label, forum_kind: "court", alias_count: 0, at: "2026-10-12T00:00:00Z" }) }) });
  await b.press("entitycreate", { data: { court: "1" }, values: { "pl-court": "Berkeley Housing Court" } });
  has(b, "screen.places.court.done", { name: "Berkeley Housing Court" });
});

test("R46 control: a member who does not administer is drawn no Courts section and no act, and the courts are not read", async () => {
  const m = await open("places", { me: MEMBER, table: placesTable() });
  assert.equal(courtsSection(m), undefined);
  assert.deepEqual(ops(m), []);
  assert.ok(!m.p.requests.some((r) => r.op === "entitieskind" && r.query.kind === "body"));
});

/* R60 (T51; N858 D8; DEC-340, U366): a place named and no profile held for it; R61's reference to the team's own rules */
const NOPROFILE = (over = {}) => placesTable({ profiles: env({ ok: true, profiles: [], conflicts: [], choices: [], view: "main" }), placewantedstate: env({ ok: true, name: "Nevada", set_by: "rosa", set_at: "2026-10-04T00:00:00Z", matches: [] }), ...over });
const rulesRef = (o) => all(o.tree, (e) => e.tag === "a" && e.attrs["data-screen"] === "grouprules");

test("R60 a place named and no active profile: the six sentences and the field, the reference to the team's own rules, and none of R19's sections", async () => {
  const a = await open("places", { me: ADMIN, table: NOPROFILE() });
  has(a, "screen.places.noprofile.heading", { state: "Nevada" });
  has(a, "screen.places.noprofile.says", { state: "Nevada" });
  for (const k of ["screen.places.noprofile.offers", "screen.places.noprofile.still", "screen.places.noprofile.asks", "screen.places.noprofile.want", "screen.places.noprofile.want.help"]) has(a, k);
  assert.equal(a.b.doc.getElementById("pl-want").value, "Nevada", "the place named, to name again");
  assert.deepEqual((await a.press("placewanted", { values: { "pl-want": " Reno, Nevada " } })).sent[0].body, { name: "Reno, Nevada" });
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
  const a = await open("places", { me: ADMIN, table: placesTable() });
  for (const k of ["screen.places.noprofile.offers", "screen.places.noprofile.still", "screen.places.noprofile.asks", "screen.places.noprofile.want"]) lacks(a, k);
  has(a, "screen.places.profiles.heading");
  assert.equal(rulesRef(a).length, 1);
  assert.ok(a.html.lastIndexOf('data-screen="grouprules"') > a.html.indexOf(said("screen.places.add.heading").slice(0, 12)), "beneath the rest");
  // a profile that could be chosen is offered even when none is active yet
  const choose = await open("places", { me: ADMIN, table: NOPROFILE({ profiles: env({ ok: true, profiles: [], conflicts: [], choices: [{ id: "us-nv", name: "Nevada", covers: ["Nevada"] }], view: "main" }) }) });
  assert.deepEqual((await choose.press("profilesset", { values: { "pl-p-us-nv": true } })).sent[0].body, { profiles: ["us-nv"] });
  // a test profile is no profile
  const test = await open("places", { me: ADMIN, table: NOPROFILE({ profiles: env({ ok: true, profiles: [{ id: "t", name: "Test", covers: [], test: true }], conflicts: [], choices: [], view: "main" }) }) });
  has(test, "screen.places.noprofile.says", { state: "Nevada" });
  // a member who does not administer reads no place named and is not drawn the notice; they are given the way to the rules
  const m = await open("places", { me: MEMBER, table: NOPROFILE() });
  lacks(m, "screen.places.noprofile.says", { state: "Nevada" });
  assert.equal(rulesRef(m).length, 1);
});

/* ---- T51 fix round 2: C87, C94 ---- */

test("R46 C87: Add a court with its name empty sends nothing and names the box; filled, it sends (control)", async () => {
  const a = await open("places", { me: ADMIN, table: placesTable() });
  const r = await a.press("entitycreate", { data: { court: "1" }, values: { "pl-court": "   " } });
  assert.deepEqual(r.sent, []);
  assert.equal(a.refused.text, said("shell.field.needed", { field: said("court.add.name") }), "the box is named: " + (a.refused && a.refused.text));
  assert.equal((await a.press("entitycreate", { data: { court: "1" }, values: { "pl-court": "Berkeley Housing Court" } })).sent.filter((x) => x.op === "entitycreate").length, 1);
});

test("R46 C94: a court a member added names that member by memberName: the handle where it differs from the id, the fallback word where the member has none, never an id", async () => {
  const roster = [{ member_id: "m-7", handle: "luisa", role: "member", status: "active", capabilities: [], expertise: [] }, { member_id: "m-9", handle: null, role: "member", status: "invited", capabilities: [], expertise: [] }];
  const courts = [{ entity_id: "ENT-0201", kind: "body", forum_kind: "court", label: "Court One", note: "n", declared_by: "member:m-7", at: "2026-10-09T00:00:00Z" }, { entity_id: "ENT-0202", kind: "body", forum_kind: "court", label: "Court Two", note: "n", declared_by: "member:m-9", at: "2026-10-09T00:00:00Z" }];
  const table = placesTable({ memberlist: env({ members: roster }), entitieskind: (q) => q.kind === "body" ? env({ ok: true, kind: "body", entities: courts, count: 2, limit: 500, truncated: false, next: null }) : env({ ok: true, kind: "office", entities: [], count: 0, limit: 500, truncated: false, next: null }) });
  const a = await open("places", { me: ADMIN, table });
  const items = all(all(a.tree, (e) => e.attrs["data-list"] === "courts")[0], (e) => e.tag === "li").map((e) => textOf(e));
  assert.ok(items[0].includes(said("screen.places.court.added", { name: "luisa", date: day("2026-10-09T00:00:00Z") })), items[0]);
  assert.ok(items[1].includes(said("screen.places.court.added", { name: said("shell.card.member"), date: day("2026-10-09T00:00:00Z") })), items[1]);
  assert.ok(!a.text.includes("m-7") && !a.text.includes("m-9"));
});

/* ---- T51 fix round 3: C64 (entities R63, R64; DEC-401, DEC-402) ---- */

const NAMED = { entity_id: "ENT-0201", kind: "office", label: "Records Office of the Agency", note: "n", declared_by: "member:lu", at: "2026-10-12T00:00:00Z", named_by_member: true, contact: { kind: "portal", value: "https://records.agency.example/portal" }, law: "FOIA, 5 U.S.C. 552" };
const OWN = { entity_id: "ENT-0202", kind: "office", label: "Office of the City Clerk", note: "n", declared_by: "rosa", at: "2026-10-01T00:00:00Z", named_by_member: false, contact: null, law: null };
const officeLine = (o, id) => all(all(o.tree, (e) => e.attrs["data-list"] === "offices")[0], (e) => e.tag === "li").find((e) => e.attrs["data-office"] === id);
const withOffices = (list, over = {}) => placesTable({ entitieskind: (q) => q.kind === "body" ? env({ ok: true, kind: "body", entities: [], count: 0, limit: 500, truncated: false, next: null }) : env({ ok: true, kind: "office", entities: list(), count: list().length, limit: 500, truncated: false, next: null }), ...over });

test("R19 C64: an office a member named is listed with the mark and the administrator's confirm, with the contact and law it states; an office not named by a member draws no mark, no confirm and no line it does not state (control)", async () => {
  const a = await open("places", { me: ADMIN, table: withOffices(() => [NAMED, OWN]) });
  const named = officeLine(a, "ENT-0201"), own = officeLine(a, "ENT-0202");
  assert.ok(named && own);
  assert.ok(textOf(named).includes(said("screen.request.nameoffice.mark")), "the mark");
  assert.equal(acts(named).filter((b) => b.attrs["data-act"] === "officeconfirm").length, 1, "the confirm");
  assert.ok(textOf(named).includes(said("screen.request.nameoffice.where") + ": " + NAMED.contact.value) && textOf(named).includes(said("screen.request.nameoffice.law") + ": " + NAMED.law), "where requests go and the law they go under");
  assert.ok(!textOf(named).includes(said("screen.places.offices.bygroup")), "the mark says who named it; the origin line is not said twice");
  assert.ok(!textOf(own).includes(said("screen.request.nameoffice.mark")) && acts(own).length === 0, "control: no mark, no confirm");
  assert.ok(!textOf(own).includes(said("screen.request.nameoffice.where")) && !textOf(own).includes(said("screen.request.nameoffice.law")), "control: nothing it does not state");
  assert.ok(textOf(own).includes(said("screen.places.offices.bygroup")), "control: marked by its origin as before");
  // a member who does not administer is shown the mark and is offered no confirm
  const m = await open("places", { me: MEMBER, table: withOffices(() => [NAMED, OWN]) });
  assert.ok(textOf(officeLine(m, "ENT-0201")).includes(said("screen.request.nameoffice.mark")));
  assert.deepEqual(ops(m), []);
});

test("R19 C64: the administrator's confirm sends officeconfirm with the office's entityId and reads the offices again, and the mark is gone; a repeat answers already and reads the same", async () => {
  let confirmed = false;
  const table = withOffices(() => [{ ...NAMED, named_by_member: !confirmed }, OWN], { officeconfirm: (q, b) => { const already = confirmed; confirmed = true; return env({ ok: true, entity_id: b.entityId, named_by_member: false, confirmed_by: "rosa", at: "2026-10-21T00:00:00Z", ...(already ? { already: true } : {}) }); } });
  const a = await open("places", { me: ADMIN, table });
  const before = a.p.requests.filter((r) => r.op === "entitieskind" && r.query.kind === "office").length;
  const r = await a.press("officeconfirm", { data: { office: "ENT-0201" } });
  assert.deepEqual(r.sent.filter((x) => x.op === "officeconfirm").map((x) => x.body), [{ entityId: "ENT-0201" }], "entityId, camel case, and nothing else");
  assert.ok(a.p.requests.filter((x) => x.op === "entitieskind" && x.query.kind === "office").length > before, "the offices are read again");
  assert.ok(!textOf(officeLine(a, "ENT-0201")).includes(said("screen.request.nameoffice.mark")), "the mark is gone");
  assert.equal(acts(officeLine(a, "ENT-0201")).length, 0, "and no confirm");
  assert.equal(a.refused, null, "done, nothing refused");
  // a repeat (a second administrator pressed it on a page opened earlier) answers already: drawn as done, not refused
  const b = await open("places", { me: ADMIN, table: withOffices(() => [NAMED], { officeconfirm: (q, body) => env({ ok: true, entity_id: body.entityId, named_by_member: false, confirmed_by: "lu", at: "2026-10-21T00:00:00Z", already: true }) }) });
  await b.press("officeconfirm", { data: { office: "ENT-0201" } });
  assert.equal(b.refused, null, "already is as done as the first");
});

test("R19 C64: each refusal of the confirm is drawn beside it by its own words (refusal.<code>, else the owner's translation until the design writes it)", async () => {
  const drawn = async (code) => {
    const a = await open("places", { me: ADMIN, table: withOffices(() => [NAMED], { officeconfirm: () => refuse(code, { translation: "owner words for " + code }) }) });
    await a.press("officeconfirm", { data: { office: "ENT-0201" } });
    assert.ok(a.refused, code + " is drawn beside the act");
    assert.equal(a.refused.text, hasWord("refusal." + code) ? said("refusal." + code) : "owner words for " + code, code);
    assert.ok(officeLine(a, "ENT-0201") && textOf(officeLine(a, "ENT-0201")).includes(said("screen.request.nameoffice.mark")), code + ": the mark stays");
  };
  for (const code of ["NO_ENTITY", "NO_SUCH_ENTITY", "NOT_AN_ADMIN"]) await drawn(code);
  for (const code of ["CONFIRM_NOT_AN_OFFICE", "NOT_NAMED_BY_A_MEMBER"]) await drawn(code);
});
