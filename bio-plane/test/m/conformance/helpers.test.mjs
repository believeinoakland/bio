/* conformance: the one answer to each of two conditions (R19 `noSuchDetermination`, R20 `determinationSuperseded`;
   N309, N312, K275), module-level functions every later module calls. Driven at the interface: the functions as exported,
   and the acts and reads of this module that answer through them (./fixture.mjs). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { scene, V } from "./fixture.mjs";
import { CONFORMANCE_CHECKS, noSuchDetermination, determinationSuperseded } from "../../../src/conformance/index.mjs";

const R19_KEYS = ["check", "code", "detail", "determination", "ok", "reason", "translation"];
const R20_KEYS = [...R19_KEYS, "superseded_by"].sort();
/* Inputs a caller may pass by mistake: each is answered, never thrown on. */
const hostile = () => [undefined, null, "", "   ", 42, {}, [], Symbol.for("x"), () => 1,
  { toString() { throw new Error("boom"); } }];
const throwingExtra = () => new Proxy({}, { ownKeys() { throw new Error("boom"); } });
const getterExtra = () => Object.defineProperty({}, "own", { enumerable: true, get() { throw new Error("boom"); } });

test("R19: noSuchDetermination answers {ok:false, reason, code, check, translation, determination, detail}: the id as asked (null when none), one fixed sentence, its one catalogue row naming this function", () => {
  const r = noSuchDetermination("CONF-2026-0001-determination");
  assert.deepEqual(Object.keys(r).sort(), R19_KEYS);
  const row = CONFORMANCE_CHECKS.NO_SUCH_DETERMINATION;
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.determination],
    [false, "NO_SUCH_DETERMINATION", "NO_SUCH_DETERMINATION", row.check, row.translation, "CONF-2026-0001-determination"]);
  assert.equal(row.check, "C-113.15");
  assert.match(row.where, /^src\/conformance\/index\.mjs noSuchDetermination > /);
  assert.equal(typeof r.detail, "string");
  assert.ok(r.detail.length > 20);
  /* the same sentence for every caller and every id */
  for (const id of ["CONF-2026-0099-determination", "anything", null, undefined, ""])
    assert.deepEqual({ ...noSuchDetermination(id), determination: null }, { ...r, determination: null });
  for (const id of [null, undefined, "", "   "]) assert.equal(noSuchDetermination(id).determination, null);
  /* one row names this code: no other row of this module carries it */
  assert.equal(Object.keys(CONFORMANCE_CHECKS).filter((k) => k === "NO_SUCH_DETERMINATION").length, 1);
});

test("R19: extra adds a caller's own fields and never replaces the fixed ones; it writes nothing and never throws", () => {
  const plain = noSuchDetermination("CONF-2026-0001-determination");
  const r = noSuchDetermination("CONF-2026-0001-determination", { consequence: "CSQ-1", ok: true, reason: "X",
    code: "X", check: "C-0.0", translation: "t", determination: "other", detail: "mine" });
  assert.deepEqual(r, { ...plain, consequence: "CSQ-1" });
  for (const extra of [null, undefined, 3, "s", [], ["a"], throwingExtra(), getterExtra()])
    assert.deepEqual(noSuchDetermination("CONF-2026-0001-determination", extra), plain);
  for (const id of hostile()) {
    let out;
    assert.doesNotThrow(() => { out = noSuchDetermination(id, throwingExtra()); });
    assert.equal(out.code, "NO_SUCH_DETERMINATION");
  }
  /* it writes nothing: a scene's tables are byte-identical across calls */
  const { w } = scene();
  const before = w.snapshot();
  noSuchDetermination("CONF-2026-0001-determination", { x: 1 });
  assert.deepEqual(w.snapshot(), before);
});

test("R19 R9 R15: determinationRead and R7's supersession answer an absent or unseen determination through noSuchDetermination, absent and unseen alike", () => {
  const { w, input } = scene();
  const d = w.c.determine(input());
  for (const [id, viewer] of [["CONF-2026-0099-determination", V("pat")], [d.id, V("quinn")], [d.id, "nobody"]])
    assert.deepEqual(w.c.determinationRead({ id, viewer }), noSuchDetermination(id));
  assert.deepEqual(w.c.determinationRead({ id: null, viewer: V("pat") }), noSuchDetermination(null));
  const absent = w.c.determine(input({ supersedes: "CONF-2026-0099-determination", reason: "r" }));
  assert.deepEqual(absent, noSuchDetermination("CONF-2026-0099-determination",
                                               { supersedes: "CONF-2026-0099-determination" }));
});

test("R20: determinationSuperseded answers {ok:false, reason, code, check, translation, determination, superseded_by, detail}: its own row naming this function, the successor as the caller passes it (null when it cannot read it), one fixed sentence", () => {
  const r = determinationSuperseded("CONF-2026-0001-determination", "CONF-2026-0002-determination");
  assert.deepEqual(Object.keys(r).sort(), R20_KEYS);
  const row = CONFORMANCE_CHECKS.DETERMINATION_SUPERSEDED;
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.determination, r.superseded_by],
    [false, "DETERMINATION_SUPERSEDED", "DETERMINATION_SUPERSEDED", row.check, row.translation,
     "CONF-2026-0001-determination", "CONF-2026-0002-determination"]);
  assert.match(row.where, /^src\/conformance\/index\.mjs determinationSuperseded > /);
  /* its number is new: C-113.18 (ALREADY_SUPERSEDED) is retired and not reused */
  assert.equal(row.check, "C-113.23");
  assert.equal("ALREADY_SUPERSEDED" in CONFORMANCE_CHECKS, false);
  for (const retired of ["C-113.2", "C-113.9", "C-113.18"])
    assert.equal(Object.values(CONFORMANCE_CHECKS).some((x) => x.check === retired), false, retired);
  const checks = Object.values(CONFORMANCE_CHECKS).map((x) => x.check);
  assert.equal(new Set(checks).size, checks.length, "each row its own number");
  assert.equal(determinationSuperseded("CONF-2026-0001-determination").superseded_by, null);
  assert.equal(determinationSuperseded("CONF-2026-0001-determination", null).superseded_by, null);
  assert.equal(determinationSuperseded(null, null).determination, null);
  for (const [a, b] of [["x", "y"], ["CONF-2026-0009-determination", null], [null, null]])
    assert.equal(determinationSuperseded(a, b).detail, r.detail, "one sentence for every caller");
});

test("R20: extra adds a caller's own fields and never replaces the fixed ones; it writes nothing and never throws", () => {
  const plain = determinationSuperseded("CONF-2026-0001-determination", "CONF-2026-0002-determination");
  const r = determinationSuperseded("CONF-2026-0001-determination", "CONF-2026-0002-determination",
    { action: "ACT-1", superseded_by: "forged", determination: "other", detail: "mine", ok: true, check: "C-0.0" });
  assert.deepEqual(r, { ...plain, action: "ACT-1" });
  for (const extra of [null, undefined, 7, "s", [], throwingExtra(), getterExtra()])
    assert.deepEqual(determinationSuperseded("CONF-2026-0001-determination", "CONF-2026-0002-determination", extra), plain);
  for (const a of hostile()) for (const b of hostile().slice(0, 4)) {
    let out;
    assert.doesNotThrow(() => { out = determinationSuperseded(a, b, throwingExtra()); });
    assert.equal(out.code, "DETERMINATION_SUPERSEDED");
  }
  const { w } = scene();
  const before = w.snapshot();
  determinationSuperseded("CONF-2026-0001-determination", "CONF-2026-0002-determination", { x: 1 });
  assert.deepEqual(w.snapshot(), before);
});

test("R20 R7: a second supersession of a determination answers through determinationSuperseded, naming the first and its successor, and writes nothing", () => {
  const { w, input } = scene();
  const first = w.c.determine(input());
  const next = w.c.determine(input({ supersedes: first.id, reason: "restated" }));
  assert.equal(next.ok, true);
  const before = w.snapshot();
  const again = w.c.determine(input({ supersedes: first.id, reason: "again" }));
  assert.deepEqual(w.snapshot(), before, "nothing written");
  assert.deepEqual(again, determinationSuperseded(first.id, next.id, { supersedes: first.id }));
  /* the successor stays supersedable once: the control */
  assert.equal(w.c.determine(input({ supersedes: next.id, reason: "restated again" })).ok, true);
});
