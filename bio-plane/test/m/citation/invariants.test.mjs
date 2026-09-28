/* citation: the retired-target predicate (R5), the invariants (R6, R9, R10, R11) and the op routes the control plane
   reaches (K3, R7), at the module's interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, biasMd, docMd } from "./fixture.mjs";
import { citationOps, CITE_CHECKS, CITE_EXTENT_CHECKS } from "../../../src/citation/index.mjs";
import { ACT_SHAPE_CHECKS, CONTENT_EXTENT_CHECKS, STATES } from "../../../checks/bio-checks.mjs";

const ANN = { viewer: V("ann"), owner: "o", author: "member:ann", identity: V("ann") };

test("R5: true exactly when the current state is retired, for every type whose machine carries a retired state; false for every other state, an absent id and any non-id", () => {
  const w = world();
  const retiring = Object.entries(STATES).filter(([, s]) => s.legal.includes("retired")).map(([t]) => t).sort();
  assert.deepEqual(retiring, ["bias", "information"], "the types whose machine names `retired`, as the catalogue declares them");
  w.put("INFO-2026-0001", docMd("INFO-2026-0001", "information", "retired"));
  w.put("INFO-2026-0002", docMd("INFO-2026-0002", "information", "verified"));
  w.put("INFO-2026-0003", docMd("INFO-2026-0003", "information", "collected"));
  w.put("BIAS-2026-0001", biasMd("BIAS-2026-0001", "retired"));
  w.put("BIAS-2026-0002", biasMd("BIAS-2026-0002", "adopted"));
  w.inquiry("INQ-2026-0001");
  const p = w.project();
  assert.equal(w.cit.retiredNotCitable("INFO-2026-0001"), true);
  assert.equal(w.cit.retiredNotCitable("BIAS-2026-0001"), true);
  for (const id of ["INFO-2026-0002", "INFO-2026-0003", "BIAS-2026-0002", "INQ-2026-0001", p, "INFO-2026-0404"])
    assert.equal(w.cit.retiredNotCitable(id), false, id);
  for (const v of [null, undefined, "", 7, {}, []]) assert.equal(w.cit.retiredNotCitable(v), false);
});

test("R5: never viewer-gated — a retired item inside a project nobody else may see answers the same to every caller; never throws", () => {
  const w = world();
  w.put("INFO-2026-0001", docMd("INFO-2026-0001", "information", "retired"));
  assert.equal(w.cit.retiredNotCitable.length, 1, "it takes an id and nothing else");
  assert.equal(w.cit.retiredNotCitable("INFO-2026-0001"), true);
  const broken = world();
  broken.put("INFO-2026-0001", docMd("INFO-2026-0001", "information", "retired"));
  broken.st.db.exec("DROP TABLE bundles");
  assert.equal(broken.cit.retiredNotCitable("INFO-2026-0001"), false);
});

test("R6: a citation exists only in the citing document's bytes — no refs row and no inquiry_basis row is written; only record-core's tables (and the selection's last use) move", async () => {
  const w = world();
  w.info("INFO-2026-0001");
  const q = w.inquiry("INQ-2026-0001");
  const p = w.project();
  const h = await w.select(["INFO-2026-0001"]);
  const before = w.snapshot();
  assert.equal(w.cit.cite({ project: p, handle: h, ...ANN }).ok, true);
  assert.equal(w.cit.cite({ project: q, handle: h, ...ANN, role: "supports" }).ok, true);
  assert.equal(w.cit.sever({ project: p, handle: h, ...ANN, reason: "x" }).ok, true);
  const after = w.snapshot();
  const moved = Object.keys(after).filter((t) => after[t] !== before[t]).sort();
  assert.deepEqual(moved.filter((t) => t !== "selections"), ["bundles", "files", "history", "manifest"]);
  assert.equal(w.count("inquiry_basis"), 0);
  assert.equal("refs" in after ? JSON.parse(after.refs).length : 0, 0);
});

test("R9: every act naming a project the viewer may not see answers exactly as an absent one", async () => {
  const w = world();
  w.info("INFO-2026-0001");
  const p = w.project();
  const h = await w.select(["INFO-2026-0001"], { viewer: V("vera"), owner: "v" });
  const as = { viewer: V("vera"), owner: "v", identity: V("vera"), author: "member:vera", reason: "x", note: "n" };
  for (const act of ["cite", "sever", "reinstate"]) {
    const hidden = w.cit[act]({ project: p, handle: h, ...as });
    const absent = w.cit[act]({ project: "PROJ-2026-0001-absent", handle: h, ...as });
    assert.equal(hidden.reason, "NO_SUCH_PROJECT", act);
    assert.deepEqual(Object.keys(hidden).sort(), Object.keys(absent).sort());
    assert.equal(hidden.detail, absent.detail);
  }
});

test("R10: no place is named in this module's outward text — its rows, and the refusals and answers its acts give", async () => {
  const PLACES = /oakland|alameda|california|berkeley|san francisco|county|city of/i;
  for (const row of [...Object.values(CITE_CHECKS), ...Object.values(CITE_EXTENT_CHECKS)]) assert.doesNotMatch(row.translation, PLACES);
  const w = world();
  w.info("INFO-2026-0001");
  const q = w.inquiry("INQ-2026-0001");
  const p = w.project();
  const h = await w.select(["INFO-2026-0001"]);
  const answers = [
    w.cit.cite({ project: p, handle: h, ...ANN, note: '"' }), w.cit.cite({ project: q, handle: h, ...ANN }),
    w.cit.cite({ project: q, handle: h, ...ANN, role: "x" }), w.cit.cite({ project: p, handle: h, ...ANN, role: "supports" }),
    w.cit.cite({ project: q, handle: h, ...ANN, role: "supports", extent: { nope: "1" } }),
    w.cit.cite({ project: p, handle: h, ...ANN }), w.cit.cite({ project: p, handle: h, ...ANN }),
    w.cit.sever({ project: p, handle: h, ...ANN }), w.cit.sever({ project: p, handle: h, ...ANN, reason: "x" }),
    w.cit.cite({ project: p, handle: h, ...ANN }), w.cit.reinstate({ project: p, handle: h, ...ANN, reason: "y" }),
    w.cit.cite({ project: "INFO-2026-0001", handle: h, ...ANN }),
  ];
  for (const a of answers) assert.doesNotMatch(JSON.stringify(a), PLACES);
  assert.doesNotMatch(w.md(p), PLACES);
});

test("R11: each check moved here with its number, code and translation unchanged, its `where` re-pointed to this module, and none is left in the catalogue", () => {
  assert.deepEqual(Object.entries(CITE_CHECKS).map(([k, r]) => [k, r.check, r.where]), [
    ["BAD_NOTE", "C-33.15", "src/citation/index.mjs cite > is-cite-note"],
    ["NO_ROLE", "C-33.16", "src/citation/index.mjs cite > is-cite-role"],
    ["BAD_ROLE", "C-33.17", "src/citation/index.mjs cite > is-cite-role"],
    ["ROLE_NOT_APPLICABLE", "C-33.18", "src/citation/index.mjs cite > is-cite-role"],
    ["SEVERED_EDGE", "C-33.19", "src/citation/index.mjs cite > is-cite-severed"],
    ["RETIRED_NOT_CITABLE", "C-33.39", "src/citation/index.mjs cite > is-cite-retired"],
  ]);
  assert.deepEqual(Object.entries(CITE_EXTENT_CHECKS).map(([k, r]) => [k, r.check, r.where]), [
    ["UNKNOWN_EXTENT_FIELD", "C-45.7", "src/citation/index.mjs cite > is-cite-extent"],
    ["EXTENT_NOT_APPLICABLE", "C-45.8", "src/citation/index.mjs cite > is-cite-extent"],
    ["EXTENT_ON_MANY", "C-45.9", "src/citation/index.mjs cite > is-cite-extent"],
    ["BAD_EXTENT_VALUE", "C-45.10", "src/citation/index.mjs cite > is-cite-extent"],
  ]);
  for (const r of [...Object.values(CITE_CHECKS), ...Object.values(CITE_EXTENT_CHECKS)]) assert.ok(r.translation.length > 80);
  for (const k of Object.keys(CITE_CHECKS)) assert.equal(k in ACT_SHAPE_CHECKS, false, `${k} is no longer the catalogue's`);
  for (const k of Object.keys(CITE_EXTENT_CHECKS)) assert.equal(k in CONTENT_EXTENT_CHECKS, false, `${k} is no longer the catalogue's`);
  const numbers = [...Object.values(ACT_SHAPE_CHECKS), ...Object.values(CONTENT_EXTENT_CHECKS)].map((r) => r.check);
  for (const r of [...Object.values(CITE_CHECKS), ...Object.values(CITE_EXTENT_CHECKS)]) assert.equal(numbers.includes(r.check), false);
});

test("K3, R7: the op routes — the control plane's stamps are read from the query, the part arrives whole as a bag, and no weight is read from the caller", async () => {
  const calls = [];
  const fake = new Proxy({}, { get: (_, act) => (a) => { calls.push([act, a]); return { ok: true, act }; } });
  const url = new URL("http://x/?project=P&handle=H&viewer=member:ann&owner=o&note=n&author=member:ann&identity=member:ann"
    + "&role=supports&weight=refuse&extent_kind=pdf-page&extent_page=2&content_id=&other=1&reason=why");
  const ops = citationOps(fake, url);
  assert.deepEqual(Object.keys(ops).sort(), ["cite", "reinstate", "sever"]);
  ops.cite(); ops.sever(); ops.reinstate();
  assert.deepEqual(calls[0], ["cite", { project: "P", handle: "H", viewer: "member:ann", owner: "o", note: "n", author: "member:ann",
    identity: "member:ann", role: "supports", extent: { extent_kind: "pdf-page", extent_page: "2", content_id: "" } }]);
  const edgeArgs = { project: "P", handle: "H", viewer: "member:ann", owner: "o", reason: "why", author: "member:ann", identity: "member:ann" };
  assert.deepEqual(calls[1], ["sever", edgeArgs]);
  assert.deepEqual(calls[2], ["reinstate", edgeArgs]);
  const bare = citationOps(fake, new URL("http://x/?project=P"));
  bare.cite(); bare.sever();
  assert.deepEqual([calls[3][1].note, calls[3][1].extent, calls[3][1].role, calls[4][1].reason], ["", {}, null, ""]);
  /* Through the real module: a cite over the route lands, weight report. */
  const w = world();
  w.info("INFO-2026-0001");
  const p = w.project();
  const h = await w.select(["INFO-2026-0001"]);
  const r = citationOps(w.cit, new URL(`http://x/?project=${p}&handle=${h}&viewer=member:ann&owner=o&identity=member:ann&weight=refuse`)).cite();
  assert.deepEqual([r.ok, r.weight, r.cited], [true, "report", ["INFO-2026-0001"]]);
});
