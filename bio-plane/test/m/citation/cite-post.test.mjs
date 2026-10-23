/* citation: the `cite` arm is a write, so it reads its fields from a POST body and never from the address (C31; R1, R7,
   R19). At the module's interface: `citationOps` as the plane builds it, `(c, url, body)`, where the door hands a GET a
   null body and a POST its parsed one (store-door R1). The door's stamps stay in the address. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { citationOps, DECLARED_OPS } from "../../../src/citation/index.mjs";

const STAMPS = { viewer: V("ann"), owner: "o", author: "member:ann", identity: V("ann") };
const url = (params = {}) => new URL(`http://x/?${new URLSearchParams({ ...STAMPS, ...params })}`);

async function held() {
  const w = world();
  w.info("INFO-2026-0001");
  const p = w.project();
  const handle = await w.select(["INFO-2026-0001"]);
  return { w, p, handle };
}

test("R20, R1, R19: cite with its fields in the POST body cites, and the stamps are still the address's", async () => {
  const { w, p, handle } = await held();
  const r = citationOps(w.cit, url(), { project: p, handle, note: "from the body" }).cite();
  assert.deepEqual([r.ok, r.cited], [true, ["INFO-2026-0001"]]);
  assert.match(w.md(p), /from the body/);
});

test("R20: a call with the fields only in the address still cites (a caller not yet moved), and the body wins where both are sent", async () => {
  const { w, p, handle } = await held();
  const g = citationOps(w.cit, url({ project: p, handle, note: "in the address" }), null).cite();
  assert.equal(g.ok, true, "the address's fields are still read");
  const w2 = await held();
  const both = citationOps(w2.w.cit, url({ project: "NOPE", handle: "sel-none", note: "address" }), { project: w2.p, handle: w2.handle, note: "body" }).cite();
  assert.equal(both.ok, true, "the body's project and handle won");
  assert.match(w2.w.md(w2.p), /body/);
  assert.doesNotMatch(w2.w.md(w2.p), /address/);
});

test("R20, R1: a GET naming no source is refused CITE_ONE_SOURCE and writes nothing; control: the same call with a handle cites", async () => {
  const { w, p, handle } = await held();
  const before = w.md(p);
  for (const body of [null, {}]) {
    const r = citationOps(w.cit, url({ project: p }), body).cite();
    assert.deepEqual([r.ok, r.reason], [false, "CITE_ONE_SOURCE"]);
  }
  assert.equal(w.md(p), before, "nothing was written");
  assert.equal(citationOps(w.cit, url({ project: p }), { handle }).cite().ok, true, "control");
});

test("R20, R1, R19: the part and the role travel in the body (flat `extent_*` and `content_id`), and a found match as an object or as one JSON string", async () => {
  const w = world();
  w.info("INFO-2026-0001");
  const q = w.inquiry("INQ-2026-0001");
  const handle = await w.select(["INFO-2026-0001"]);
  const r = citationOps(w.cit, url(), { project: q, handle, role: "supports", extent_kind: "pdf-page", extent_page: "2" }).cite();
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(r.role, "supports");
  assert.deepEqual([r.legs[0].extent.kind, r.legs[0].extent.page], ["pdf-page", 2]);
  /* a found match: refused FOUND_MALFORMED by name whether sent whole or as a string, so both shapes reach the act */
  for (const found of [{ nope: 1 }, JSON.stringify({ nope: 1 })]) {
    const f = citationOps(w.cit, url(), { project: q, found, role: "supports" }).cite();
    assert.equal(f.reason, "FOUND_MALFORMED");
  }
  const bad = citationOps(w.cit, url(), { project: q, found: "{not-json", role: "supports" }).cite();
  assert.equal(bad.reason, "FOUND_MALFORMED", "a string that does not parse is passed on as sent");
});

test("R7, R20: no weight is read from the body either, and the declaration still accepts the same fields", async () => {
  const { w, p, handle } = await held();
  const r = citationOps(w.cit, url(), { project: p, handle, weight: "refuse" }).cite();
  assert.deepEqual([r.ok, r.weight], [true, "report"]);
  assert.deepEqual(DECLARED_OPS.cite.fields.requires, ["project", ["handle", "found"]]);
});
