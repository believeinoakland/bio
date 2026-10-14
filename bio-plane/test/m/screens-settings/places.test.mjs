/* Settings › Places and offices at the module's interface (R19). */
import test from "node:test";
import assert from "node:assert/strict";
import { acts, all, day, has, lacks, open, said, textOf } from "./kit.mjs";
import { ADMIN, MEMBER, env, placesTable } from "./fixtures.mjs";

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
  const none = await open("places", { me: ADMIN, table: placesTable({ profiles: env({ ok: true, profiles: [], conflicts: [], choices: [] }) }) });
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
  const reads = a.p.requests.filter((r) => r.op === "entitieskind");
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
  assert.deepEqual((await a.press("entitycreate", { values: { "pl-label": "Public Works", "pl-note": "Fixes the streets." } })).sent[0].body, { kind: "office", label: "Public Works", note: "Fixes the streets." });
  assert.deepEqual((await a.press("entitycreate", { values: { "pl-label": "Public Works", "pl-note": "" } })).sent, []);
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
