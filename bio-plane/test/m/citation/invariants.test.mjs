/* citation: the retired-target predicate (R5), the invariants (R6, R9, R10, R11) and the op routes the control plane
   reaches (K3, R7), at the module's interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, biasMd, docMd } from "./fixture.mjs";
import { citationOps, inquiryServices, CITE_CHECKS, CITE_EXTENT_CHECKS } from "../../../src/citation/index.mjs";
import { inquiryOf, BASIS_ROLES, checkLegExtentGrammar } from "../../../src/inquiry/index.mjs";
import { ACT_SHAPE_CHECKS, CONTENT_EXTENT_CHECKS, STATES, OBJECT_TYPES } from "../../../checks/bio-checks.mjs";

const ANN = { viewer: V("ann"), owner: "o", author: "member:ann", identity: V("ann") };

test("R5: true exactly when the current state is retired, for every type whose machine carries a retired state (each of its states in turn); false for every other type, an absent id and any non-id", () => {
  const w = world();
  /* Every retiring type the catalogue declares, read from its state tables rather than pinned (N203): a type that
     gains a `retired` state is covered the day it gains it. Each is promoted once per legal state. */
  const retiring = Object.entries(STATES).filter(([t, s]) => s.legal.includes("retired") && STATES[t] !== STATES.focus)
    .map(([t]) => t).sort();
  const prefixOf = Object.fromEntries(Object.entries(OBJECT_TYPES).map(([p, t]) => [t, p]));
  assert.ok(retiring.length >= 3 && retiring.includes("aspiration"), `the retiring types: ${retiring}`);
  let n = 0;
  for (const type of retiring) {
    assert.ok(prefixOf[type], `a prefix for ${type}`);
    for (const state of STATES[type].legal) {
      const id = `${prefixOf[type]}-2026-${String(++n).padStart(4, "0")}`;
      w.put(id, type === "bias" ? biasMd(id, state) : docMd(id, type, state));
      assert.equal(w.record.head(id).currentState, state, id);
      assert.equal(w.cit.retiredNotCitable(id), state === "retired", `${type} in ${state}`);
    }
  }
  w.inquiry("INQ-2026-0001");
  const p = w.project();
  for (const id of ["INQ-2026-0001", p, "INFO-2026-0404"])
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

test("R6: a citation exists only in the citing document's bytes — the acts write no refs row and no inquiry_basis row; every row they write is the promotion of the citing document's new bytes (or the selection's last use)", async () => {
  const w = world();
  w.info("INFO-2026-0001");
  const q = w.inquiry("INQ-2026-0001");
  const p = w.project();
  const h = await w.select(["INFO-2026-0001"]);
  /* Every write statement the storage runs, with the promotion or selection read it ran inside. Which derived tables a
     promotion moves (record-core's, retrieval's projection, whatever later modules register) is the promotion's, not
     pinned here (K354): what R6 says is that nothing reaches a table except through the document. */
  const writes = [], promoted = [];
  let inside = null;
  const exec = w.st.sql.exec;
  w.st.sql.exec = (sql, ...args) => {
    const m = /^\s*(?:INSERT(?:\s+OR\s+\w+)?\s+INTO|REPLACE\s+INTO|UPDATE(?:\s+OR\s+\w+)?|DELETE\s+FROM)\s+"?(\w+)/i.exec(sql);
    if (m) writes.push({ table: m[1], inside });
    return exec.call(w.st.sql, sql, ...args);
  };
  const around = (obj, name, tag) => {
    const f = obj[name];
    obj[name] = (a) => { const was = inside; inside = tag(a); try { return f.call(obj, a); } finally { inside = was; } };
  };
  around(w.promotion, "promote", (pkg) => { promoted.push(pkg.bundleId); return `promote ${pkg.bundleId}`; });
  around(w.retrieval, "selectionResolve", () => "selection");
  const before = w.snapshot();
  assert.equal(w.cit.cite({ project: p, handle: h, ...ANN }).ok, true);
  assert.equal(w.cit.cite({ project: q, handle: h, ...ANN, role: "supports" }).ok, true);
  assert.equal(w.cit.sever({ project: p, handle: h, ...ANN, reason: "x" }).ok, true);
  const after = w.snapshot();
  /* The spy sees the promotions' own writes (a control: an empty log would prove nothing). */
  assert.ok(writes.some((x) => x.inside === `promote ${p}`) && writes.some((x) => x.inside === `promote ${q}`));
  /* One promotion per act, each of the citing object, and no row written outside a promotion or the selection's read. */
  assert.deepEqual(promoted, [p, q, p]);
  assert.deepEqual(writes.filter((x) => x.inside === null), []);
  /* No write names either projection, and neither holds a row. */
  assert.deepEqual(writes.filter((x) => /^(refs|inquiry_basis)$/i.test(x.table)), []);
  for (const t of ["refs", "inquiry_basis"]) assert.equal(after[t], before[t], t);
  assert.equal(w.count("inquiry_basis"), 0);
  assert.equal("refs" in after ? JSON.parse(after.refs).length : 0, 0);
  /* The citations themselves are in the citing documents' bytes. */
  assert.deepEqual(w.fm(p).references.map((e) => [e.rel, e.target, e.status]), [["cites", "INFO-2026-0001", "severed"]]);
  assert.deepEqual(w.fm(q).basis.map((l) => [l.target, l.role]), [["INFO-2026-0001", "supports"]]);
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

test("R2, R8: the factory's default inquiry services are inquiry's own — its earned registry (R13), leg grammar (R5) and roles (R4)", async () => {
  const w = world();
  w.info("INFO-2026-0001");
  const k = inquiryOf(w.host, { record: w.record, membership: w.membership, promotion: w.promotion, content: w.content });
  const s = inquiryServices(k);
  assert.equal(s.checkLegExtentGrammar, checkLegExtentGrammar);
  assert.deepEqual(s.BASIS_ROLES, ["supports", "cuts_against"]);
  assert.equal(s.BASIS_ROLES, BASIS_ROLES);
  assert.deepEqual(s.earned(null, ["INFO-2026-0001"]), k.earned(null, ["INFO-2026-0001"]));
  /* Nothing resolved to a subject: nothing is earned on the connection axis, so a leg would be written ungraded (R8). */
  const reg = s.earned(null, ["INFO-2026-0001"]);
  assert.equal(reg?.earned?.connection?.["INFO-2026-0001"]?.grade ?? null, null);
});
