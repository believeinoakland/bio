/* local-facts: its refusal rows (R8), and no place in its behaviour or outward text. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, P, MACHINE } from "./fixture.mjs";
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
