/* citation R25 (T52-21; W11, C-K5; amends R4, R15, R19, R23): on a question `sever` and `reinstate` act on ONE passage,
   named by its part as `cite` names it; the other passages of the same document keep their status and role, and the
   document's references entry is severed exactly when none of its passages is live. At the module's interface, over the
   real `inquiry`'s `restsOnLive`. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { CITE_CHECKS, DECLARED_OPS } from "../../../src/citation/index.mjs";

const ANN = { viewer: V("ann"), owner: "o", author: "member:ann", identity: V("ann") };
const DOC = "INFO-2026-0001-doc", Q = "INQ-2026-0001-q";
const P2 = { extent_kind: "pdf-page", extent_page: "0" }, P3 = { extent_kind: "pdf-page", extent_page: "1" };

async function setup(roles = ["supports", "cuts_against"]) {
  const w = world({ inquiry: true });
  w.info(DOC);
  w.inquiry(Q);
  const h = await w.select([DOC]);
  [P2, P3].forEach((extent, i) => {
    const c = w.cit.cite({ project: Q, handle: h, ...ANN, role: roles[i], extent });
    assert.equal(c.ok, true, JSON.stringify(c).slice(0, 300));
  });
  return { w, h };
}
const legs = (w) => w.fm(Q).basis.map((l) => [l.extent_page, l.role, l.status ?? null]);
const entry = (w) => w.fm(Q).references.find((e) => e.target === DOC);
const rests = (w) => [...new Set(w.inquiryModule.restsOnLive(DOC).confirmed.map((l) => l.bundle_id))];

test("R25: severing one passage by its part leaves the other leg live and the document still resting; reinstating it with a role changes only that leg", async () => {
  const { w, h } = await setup();
  const s = w.cit.sever({ project: Q, handle: h, ...ANN, reason: "it does not say that", extent: P3 });
  assert.equal(s.ok, true, JSON.stringify(s).slice(0, 300));
  assert.deepEqual(legs(w), [[0, "supports", null], [1, "cuts_against", "severed"]]);
  assert.equal(entry(w).status, "confirmed", "paragraph 2 still rests");
  assert.deepEqual(rests(w), [Q]);
  const r = w.cit.reinstate({ project: Q, handle: h, ...ANN, reason: "wrong side", extent: P3, role: "supports" });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual(legs(w), [[0, "supports", null], [1, "supports", "confirmed"]]);
  assert.equal(entry(w).status, "confirmed");
  /* the leg itself is never deleted: both stay, with their parts */
  assert.equal(w.fm(Q).basis.length, 2);
});

test("R25, control: severing both passages severs the document's entry, reinstating one makes it confirmed again", async () => {
  const { w, h } = await setup();
  for (const extent of [P2, P3]) assert.equal(w.cit.sever({ project: Q, handle: h, ...ANN, reason: "cut", extent }).ok, true);
  assert.equal(entry(w).status, "severed");
  assert.deepEqual(rests(w), []);
  assert.equal(w.cit.cite({ project: Q, handle: h, ...ANN, role: "supports", extent: { extent_kind: "pdf-page", extent_page: "5" } }).reason, "SEVERED_EDGE");
  assert.equal(w.cit.reinstate({ project: Q, handle: h, ...ANN, reason: "back", extent: P2 }).ok, true);
  assert.equal(entry(w).status, "confirmed");
  assert.deepEqual(legs(w), [[0, "supports", "confirmed"], [1, "cuts_against", "severed"]]);
});

test("R25: two legs and no part named answers WHICH_PASSAGE naming each part, writing nothing; a part no leg holds, or a leg not in the source state, is NOT_CITED / NOT_SEVERED", async () => {
  const { w, h } = await setup();
  const before = w.md(Q);
  for (const act of ["sever", "reinstate"]) {
    const r = w.cit[act]({ project: Q, handle: h, ...ANN, reason: "x" });
    assert.deepEqual([r.ok, r.reason, r.check, r.offenders], [false, "WHICH_PASSAGE", CITE_CHECKS.WHICH_PASSAGE.check, [DOC]]);
    assert.deepEqual(r.passages[DOC].map((p) => p.extent_page), [0, 1]);
  }
  assert.equal(w.cit.sever({ project: Q, handle: h, ...ANN, reason: "x", extent: { extent_kind: "pdf-page", extent_page: "6" } }).reason, "NOT_CITED");
  assert.equal(w.cit.reinstate({ project: Q, handle: h, ...ANN, reason: "x", extent: P3 }).reason, "NOT_SEVERED");
  assert.equal(w.md(Q), before, "nothing written");
  assert.equal(w.cit.sever({ project: Q, handle: h, ...ANN, reason: "x", extent: P3 }).ok, true);
  assert.equal(w.cit.sever({ project: Q, handle: h, ...ANN, reason: "again", extent: P3 }).reason, "NOT_CITED");
});

test("R25, control: a one-leg document with no part named behaves as R15 states, its leg's bytes untouched", async () => {
  const w = world({ inquiry: true });
  w.info(DOC);
  w.inquiry(Q);
  const h = await w.select([DOC]);
  assert.equal(w.cit.cite({ project: Q, handle: h, ...ANN, role: "supports" }).ok, true);
  const basis = JSON.stringify(w.fm(Q).basis);
  assert.equal(w.cit.sever({ project: Q, handle: h, ...ANN, reason: "cut" }).ok, true);
  assert.equal(entry(w).status, "severed");
  assert.equal(JSON.stringify(w.fm(Q).basis), basis);
  assert.deepEqual(rests(w), []);
});

test("R25: a part on a call naming several documents is EXTENT_ON_MANY; an unknown part field is refused by name; the declaration accepts the part's fields", async () => {
  const { w } = await setup();
  w.info("INFO-2026-0002-doc");
  const both = await w.select([DOC, "INFO-2026-0002-doc"]);
  assert.equal(w.cit.sever({ project: Q, handle: both, ...ANN, reason: "x", extent: P2 }).reason, "EXTENT_ON_MANY");
  const one = await w.select([DOC]);
  assert.equal(w.cit.sever({ project: Q, handle: one, ...ANN, reason: "x", extent: { extent_nope: "1" } }).reason, "UNKNOWN_EXTENT_FIELD");
  for (const op of ["sever", "reinstate"]) for (const f of ["content_id", "extent_page"]) assert.ok(DECLARED_OPS[op].fields.accepts.includes(f), `${op} accepts ${f}`);
});

test("R25, control: the project arm is unchanged — its edge is the document", async () => {
  const w = world({ inquiry: true });
  w.info(DOC);
  const p = w.project();
  const h = await w.select([DOC]);
  w.cit.cite({ project: p, handle: h, ...ANN });
  const s = w.cit.sever({ project: p, handle: h, ...ANN, reason: "x" });
  assert.deepEqual([s.ok, s.severed], [true, [DOC]]);
  assert.equal(w.fm(p).references.find((e) => e.target === DOC).status, "severed");
});
