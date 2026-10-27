/* T13 (N324, N332): R84 `notAnAdmin`, the one site of NOT_AN_ADMIN, and every act of this module that refuses that
   condition answering through it; R85 `visibilityOf`, the id's current visibility setting. At the interface only. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { notAnAdmin, MEMBERSHIP_CHECKS } from "../../../src/membership/index.mjs";
import { MACHINE_CLASS_PREFIX } from "../../../src/record-grammar/index.mjs";

const FIELDS = ["by", "check", "code", "detail", "ok", "reason", "translation"];
const ROW = MEMBERSHIP_CHECKS.NOT_AN_ADMIN;
/* The fixed sentence around an act's phrase, read from the helper itself (a marker phrase splits it). */
const MARK = "\u0001act\u0001";
const [HEAD, TAIL] = notAnAdmin(null, MARK).detail.split(MARK);

/* A refusal answered through R84: its exact fields, its row, and the helper's own sentence around the act's phrase. */
function throughNotAnAdmin(r, by, label) {
  assert.deepEqual(Object.keys(r).sort(), FIELDS, `${label}: exactly R84's fields`);
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.by],
    [false, "NOT_AN_ADMIN", "NOT_AN_ADMIN", ROW.check, ROW.translation, by ?? null], label);
  assert.equal(HEAD, "", "the act's phrase opens the sentence");
  assert.ok(r.detail.endsWith(TAIL) && r.detail.length > TAIL.length, `${label}: the fixed sentence, naming its act`);
  const act = r.detail.slice(0, r.detail.length - TAIL.length);
  assert.deepEqual(r, notAnAdmin(by, act), `${label}: byte for byte notAnAdmin(by, act)`);
  return act;
}

/* Every table an administrator's act could write, read whole. */
const TABLES = ["members", "admin_votes", "hosting_access"];
const snapshot = (w) => Object.fromEntries(TABLES.map((t) => [t, w.rows(`SELECT * FROM ${t}`)]));

test("R85 visibilityOf: the current setting, discoverable or hidden, hidden when none is recorded; asks no viewer, writes nothing, never refuses or throws", async () => {
  const w = await world().group("ann", "bob");
  w.project("P-NONE");
  w.project("P-SET");
  w.bundle("INFO-1");
  assert.equal(w.m.projectClaimOwner({ projectId: "P-SET", memberId: "ann" }).ok, true);
  assert.equal(w.m.visibilityOf("P-NONE"), "hidden", "none recorded reads hidden");
  assert.equal(w.m.visibilityOf("P-SET"), "hidden", "an owned project with no record reads hidden");
  const set = (setting) => w.m.projectVisibilitySet({ projectId: "P-SET", setting, by: "ann", viewer: V("ann") });
  assert.equal(set("discoverable").ok, true);
  assert.equal(w.m.visibilityOf("P-SET"), "discoverable", "the latest record");
  assert.equal(w.m.sight("P-SET", V("bob")), "existence", "the setting R44 answers EXISTENCE by");
  assert.equal(set("hidden").ok, true);
  assert.equal(w.m.visibilityOf("P-SET"), "hidden", "the latest record, not the first");
  assert.equal(set("discoverable").ok, true);
  assert.equal(w.m.visibilityOf("P-SET"), "discoverable");
  /* A creation's recorded setting (R71) is the first record. */
  w.bundle("P-NEW", "project");
  assert.equal(w.m.projectCreated({ projectId: "P-NEW", ownerId: "bob", visibility: "discoverable", by: "bob" }).ok, true);
  assert.equal(w.m.visibilityOf("P-NEW"), "discoverable");
  const before = { sight: w.rows(`SELECT * FROM project_sight`), log: w.rows(`SELECT * FROM project_visibility`) };
  for (const id of ["P-SET", "P-NONE", "INFO-1", "NO-SUCH", "", null, undefined, 42, {}, ["P-SET"]]) {
    let got;
    assert.doesNotThrow(() => { got = w.m.visibilityOf(id); }, `never throws for ${String(id)}`);
    assert.ok(got === "discoverable" || got === "hidden", `a setting, never a refusal, for ${String(id)}`);
    if (id !== "P-SET") assert.equal(got, "hidden", `${String(id)}: none recorded reads hidden`);
  }
  assert.deepEqual({ sight: w.rows(`SELECT * FROM project_sight`), log: w.rows(`SELECT * FROM project_visibility`) },
    before, "writes nothing");
  /* It asks no viewer: the answer is the same whoever would ask, including a viewer who cannot see the project. */
  assert.equal(w.m.sight("P-NEW", "stranger"), "none");
  assert.equal(w.m.visibilityOf("P-NEW"), "discoverable");
});
