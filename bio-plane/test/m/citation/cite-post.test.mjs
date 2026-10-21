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

test("R1, R19: cite with its fields in the POST body cites, and the stamps are still the address's", async () => {
  const { w, p, handle } = await held();
  const r = citationOps(w.cit, url(), { project: p, handle, note: "from the body" }).cite();
  assert.deepEqual([r.ok, r.cited], [true, ["INFO-2026-0001"]]);
  assert.match(w.md(p), /from the body/);
});

test("R1, R19: cite as a GET (no body) refuses and writes nothing, even with every field in the address; control: the same fields as a body cite", async () => {
  const { w, p, handle } = await held();
  const before = w.md(p);
  const g = citationOps(w.cit, url({ project: p, handle, note: "in the address" }), null).cite();
  assert.equal(g.ok, false, "a GET cannot cite");
  assert.equal(w.md(p), before, "nothing was written");
  assert.deepEqual(w.fm(p).references ?? [], [], "no edge was written");
  const post = citationOps(w.cit, url(), { project: p, handle, note: "in the address" }).cite();
  assert.equal(post.ok, true, "control: the same fields, as a body, cite");
  assert.notEqual(w.md(p), before);
});

test("R1, R19: a body field wins nowhere over the address: a field only in the address is not read (the project, the handle, the note and the found match)", async () => {
  const { w, p, handle } = await held();
  const before = w.md(p);
  for (const q of [{ project: p }, { handle }, { project: p, handle }, { project: p, handle, note: "n" },
                   { project: p, found: JSON.stringify({ capture_sha: "a".repeat(64), extent: { kind: "pdf-page", page: 0 } }) }]) {
    const r = citationOps(w.cit, url(q), {}).cite();
    assert.equal(r.ok, false, JSON.stringify(Object.keys(q)));
  }
  assert.equal(w.md(p), before, "nothing was written");
});

test("R1, R19: the part and the role travel in the body (flat `extent_*` and `content_id`), and a found match as an object or as one JSON string", async () => {
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

test("R7, R19: no weight is read from the body either, and the declaration still accepts the same fields", async () => {
  const { w, p, handle } = await held();
  const r = citationOps(w.cit, url(), { project: p, handle, weight: "refuse" }).cite();
  assert.deepEqual([r.ok, r.weight], [true, "report"]);
  assert.deepEqual(DECLARED_OPS.cite.fields.requires, ["project", ["handle", "found"]]);
});
