/* local-facts: its refusal rows (R8), and no place in its behaviour or outward text. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, P, MACHINE, written } from "./fixture.mjs";
import { LOCAL_FACTS_CHECKS, localFactsOps } from "../../../src/local-facts/index.mjs";
import { get } from "../../../../jurisdictions/index.mjs";

const CODES = ["MACHINE_CANNOT_CONFIRM", "NO_SUCH_FACT", "FACT_ACT_REFUSED", "FACT_HOW_REFUSED", "FACT_VALUE_REFUSED"];

test("R8 each refusal carries its row in the module's own table, family C-126, each {check, where, translation}", () => {
  assert.deepEqual(Object.keys(LOCAL_FACTS_CHECKS), CODES);
  assert.ok(Object.isFrozen(LOCAL_FACTS_CHECKS));
  CODES.forEach((code, i) => {
    const r = LOCAL_FACTS_CHECKS[code];
    assert.deepEqual(Object.keys(r).sort(), ["check", "translation", "where"]);
    assert.equal(r.check, `C-126.${i + 1}`);
    assert.match(r.where, /^src\/local-facts\/index\.mjs \S+ > is-[a-z-]+$/);
    assert.match(r.translation, /Nothing was written\.$/);
  });
  /* every code is reached at the interface and answers its row */
  const w = world();
  const got = new Map();
  for (const r of [w.act(P.tz, "confirm", { by: MACHINE }), w.act("nowhere", "confirm"), w.act(P.tz, "x"),
                   w.act(P.tz, "confirm", { how: "" }), w.act(P.tz, "correct", { value: 5, source: "s" })]) got.set(r.code, r);
  assert.deepEqual([...got.keys()], CODES);
  for (const [code, r] of got) assert.deepEqual([r.check, r.translation], [LOCAL_FACTS_CHECKS[code].check, LOCAL_FACTS_CHECKS[code].translation]);
});

test("R8 no place is named in the module's behaviour or outward text: its rows and answers name none of the first profile's places", () => {
  const first = get("oakland-alameda");
  const places = [...(first?.covers || []), "Oakland", "Alameda"].filter(Boolean);
  const w = world();
  w.act(P.tz, "confirm");
  const outward = JSON.stringify([LOCAL_FACTS_CHECKS, w.lf.factStatus({}), w.lf.factsDue({}), w.act("nowhere", "confirm")]);
  for (const p of places) assert.ok(!outward.includes(p), p);
});

test("R1 R2 R4 the ops map: factconfirm, factstatus and factsdue reach the services, the viewer read from the URL", () => {
  const w = world();
  const url = (q) => new URL(`https://plane.example/?${q}`);
  const c = localFactsOps(w.lf, url("viewer=member%3Abob"), { path: P.tz, act: "confirm", how: "page", by: "member:bob", viewer: "admin" });
  assert.equal(c.factconfirm().ok, true);
  assert.equal(localFactsOps(w.lf, url(`path=${encodeURIComponent(P.tz)}&viewer=member%3Abob`), null).factstatus().status, "confirmed");
  assert.equal(localFactsOps(w.lf, url("viewer=nobody"), null).factstatus().count, 0, "the URL's viewer, not the body's");
  const d = localFactsOps(w.lf, url(`path=${encodeURIComponent(P.y2026)}&path=nonsense&viewer=member%3Abob`), null).factsdue();
  assert.deepEqual([d.due.map((x) => x.path), d.unknown], [[P.y2026], ["nonsense"]]);
  assert.equal(localFactsOps(w.lf, url("viewer=member%3Abob"), { paths: [P.tz] }).factsdue().due.length, 0);
});

/* DEC-149 (T34-78): a member-facing string calls the group's Civicsmith "your group's Civicsmith" or needs no name;
   never "this instance", "the instance", "copy", "plane" or "server". */
const NAMES_THE_COPY = /\b(this|the) instance\b|\bcopy\b|\bplane\b|\bserver\b/i;

test("R8 R2 R3 DEC-149: each member-facing string names the group's Civicsmith or needs no name (C-126.2's translation, factStatus's note, the undetermined horizon's why)", () => {
  /* C-126.2 (NO_SUCH_FACT): reworded to need no name */
  assert.equal(LOCAL_FACTS_CHECKS.NO_SUCH_FACT.translation, "No local fact of the active jurisdiction profiles answers to that path. "
    + "A path names one profile's holiday year (of its office calendar or of a named closure list), an office's hours or the "
    + "time zone. Nothing was written.");
  for (const [code, r] of Object.entries(LOCAL_FACTS_CHECKS)) assert.doesNotMatch(r.translation, NAMES_THE_COPY, code);
  const w = world();
  assert.doesNotMatch(w.act("nowhere", "confirm").translation, NAMES_THE_COPY);
  /* factStatus's list note: "your group's Civicsmith transmits nothing" */
  const note = w.lf.factStatus({}).note;
  assert.equal(note, "corrections and disputes come first, for a member to report for a profile fix; your group's Civicsmith transmits nothing");
  /* the undetermined horizon's why: reworded to need no name */
  const nozone = written("test-nozone", { holidays: [{ year: 2026, days: [{ date: "2026-01-01", name: "New Year's Day" }], status: "researched", basis: "TEST" }] });
  const n = world({ profiles: ["test-nozone"], own: [nozone] });
  const h = n.lf.factStatus({ path: "test-nozone/holidays/2026" }).horizon;
  assert.equal(h.why, "the profile test-nozone holds no time zone that can be read, so its local days, and this fact's horizon, are undetermined");
  /* every answer a member reads, whole: no string in it names the copy */
  n.act("test-nozone/holidays/2026", "confirm");
  for (const answer of [n.lf.factStatus({}), n.lf.factsDue({}), w.lf.factStatus({}), w.lf.factsDue({}),
                        w.lf.governingPath({ profile: "test-port-ellery", fact: "hours", office: { role: "Selectboard", body: "x" }, entity: "ENT-1", at: "2026-06-01" })])
    assert.doesNotMatch(JSON.stringify(answer), NAMES_THE_COPY);
});
