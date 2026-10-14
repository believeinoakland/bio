/* Settings › Places and offices at the module's interface (R19). */
import test from "node:test";
import assert from "node:assert/strict";
import { acts, all, day, has, lacks, open, said } from "./kit.mjs";
import { ADMIN, MEMBER, env, placesTable } from "./fixtures.mjs";

const ops = (o) => [...new Set(acts(o.tree).map((b) => b.attrs["data-act"]))].sort();
const settle = async (o) => { await o.b.settle(200); o.redraw(); };

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
  for (const n of [1, 2, 3]) assert.ok(a.text.includes("Office " + n), "office " + n);
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
