/* action-records' correspondence entry's one site at its interface (R16; T48-47; N1024; K231, K3125): the machine fence
   (C-32.4) and the entry's shape and capture (C-33.6–C-33.9), each answered with its row, pure but for the register read,
   and applied by R4's `actionReceipt` with its answers unchanged. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, M, MACHINE, A, INFO, ledger } from "./fixture.mjs";
import * as records from "../../../src/action-records/index.mjs";
import * as grammar from "../../../src/action-grammar/index.mjs";

const row = (code) => grammar.ACTION_ACT_CHECKS[code] || grammar.ACTION_FENCE_CHECKS[code];
const tables = ["action_law_proposals", "action_risk_proposals", "action_seeks_proposals", "action_receipts", "action_scopes", "action_promises"];
const census = (w) => JSON.stringify([...tables.map((t) => w.row(`SELECT COUNT(*) AS n FROM ${t}`).n), w.row(`SELECT COUNT(*) AS n FROM bundles`).n]);
const H = "e".repeat(64);

test("R16 correspondFence answers C-32.4 MACHINE_CANNOT_CORRESPOND with its row for an empty or machine stamp and null for a member's; extra adds fields and its detail, and never replaces reason, code, check or translation", () => {
  for (const who of [undefined, null, "", "   ", MACHINE, "class:anything"]) {
    const r = records.correspondFence(who, { target: "T-1" });
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.target],
      [false, "MACHINE_CANNOT_CORRESPOND", "MACHINE_CANNOT_CORRESPOND", row("MACHINE_CANNOT_CORRESPOND").check,
       row("MACHINE_CANNOT_CORRESPOND").translation, "T-1"], String(who));
    assert.match(r.detail, /named member/);
  }
  /* control: a member's stamp passes */
  assert.equal(records.correspondFence(M), null);
  assert.equal(records.correspondFence(M, { target: "T-1" }), null);
  /* extra: the caller's own sentence; the reserved fields are never replaced */
  const own = records.correspondFence(MACHINE, { detail: "my sentence", reason: "X", code: "Y", check: "Z", translation: "W", ok: true, extra: 1 });
  assert.deepEqual([own.ok, own.reason, own.code, own.check, own.translation, own.detail, own.extra],
    [false, "MACHINE_CANNOT_CORRESPOND", "MACHINE_CANNOT_CORRESPOND", row("MACHINE_CANNOT_CORRESPOND").check,
     row("MACHINE_CANNOT_CORRESPOND").translation, "my sentence", 1]);
  /* the instance reaches the same site */
  assert.deepEqual(world().r.correspondFence(MACHINE), records.correspondFence(MACHINE));
});

test("R16 correspondEntryRefusal answers, first found, C-33.6 BAD_DATE, C-33.7 CAPTURE_AND_TESTIMONY, C-33.8 NEITHER_CAPTURE_NOR_TESTIMONY, else null; dateTime admits YYYY-MM-DDTHH:MM on a real date, and only then", () => {
  const E = (x, extra) => records.correspondEntryRefusal({ at: "2026-09-03", account: "I saw it", ...x }, extra);
  /* a well-formed entry answers null on either arm */
  assert.equal(E({}), null);
  assert.equal(E({ account: "", artifactSha: H }), null);
  assert.equal(E({ at: " 2026-09-03 " }), null, "the date is read trimmed");
  /* BAD_DATE: not a real calendar date; the impossible day, month, and form */
  for (const at of ["2026-02-30", "2026-13-01", "03/09/2026", "", undefined, "2026-9-3"]) {
    const r = E({ at });
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation],
      [false, "BAD_DATE", "BAD_DATE", row("BAD_DATE").check, row("BAD_DATE").translation], String(at));
    assert.equal(r.at, String(at ?? "").trim());
  }
  /* the date-time form: only with dateTime, and only on a real date and a real time */
  assert.equal(E({ at: "2026-02-28T09:30" }).reason, "BAD_DATE", "without dateTime");
  assert.equal(E({ at: "2026-02-28T09:30", dateTime: true }), null, "with dateTime");
  for (const at of ["2026-02-30T09:30", "2026-02-28T24:00", "2026-02-28T09:60", "2026-02-28T09:30:00", "2026-02-28 09:30"])
    assert.equal(E({ at, dateTime: true }).reason, "BAD_DATE", at);
  assert.equal(E({ at: "2026-02-30", dateTime: true }).reason, "BAD_DATE");
  assert.equal(E({ at: "2026-02-28", dateTime: true }), null, "a plain date is still admitted");
  /* CAPTURE_AND_TESTIMONY: both; a sha256: prefix is read as the hash */
  for (const artifactSha of [H, `sha256:${H.toUpperCase()}`]) {
    const r = E({ artifactSha });
    assert.deepEqual([r.reason, r.code, r.check, r.translation],
      ["CAPTURE_AND_TESTIMONY", "CAPTURE_AND_TESTIMONY", row("CAPTURE_AND_TESTIMONY").check, row("CAPTURE_AND_TESTIMONY").translation]);
  }
  /* NEITHER_CAPTURE_NOR_TESTIMONY: neither (blank counts as none) */
  for (const x of [{ account: "" }, { account: "   ", artifactSha: "" }, { account: undefined }]) {
    const r = E(x);
    assert.deepEqual([r.reason, r.check, r.translation], ["NEITHER_CAPTURE_NOR_TESTIMONY", row("NEITHER_CAPTURE_NOR_TESTIMONY").check,
      row("NEITHER_CAPTURE_NOR_TESTIMONY").translation]);
  }
  /* first found: a bad date before a bad capture choice */
  assert.equal(E({ at: "x", artifactSha: H }).reason, "BAD_DATE");
  assert.equal(E({ at: "x", account: "" }).reason, "BAD_DATE");
  /* extra: fields and sentence added, a sentence per code, the reserved fields kept */
  const r = E({ account: "" }, { target: "T-1", detail: { NEITHER_CAPTURE_NOR_TESTIMONY: "mine" }, code: "no" });
  assert.deepEqual([r.target, r.detail, r.code], ["T-1", "mine", "NEITHER_CAPTURE_NOR_TESTIMONY"]);
  assert.equal(E({ at: "x" }, { detail: { NEITHER_CAPTURE_NOR_TESTIMONY: "mine" } }).detail.includes("mine"), false, "another code's sentence is not borrowed");
  /* the instance reaches the same site; pure */
  const w = world();
  assert.deepEqual(w.r.correspondEntryRefusal({ at: "x" }), records.correspondEntryRefusal({ at: "x" }));
});

test("R16 unregisteredArtifact answers null when the register holds the hash and C-33.9 UNREGISTERED_ARTIFACT naming artifact_sha otherwise; writes nothing", () => {
  const w = world();
  const held = w.doc(INFO);
  const before = census(w);
  assert.equal(w.r.unregisteredArtifact(held), null);
  assert.equal(w.r.unregisteredArtifact(`sha256:${held.toUpperCase()}`), null, "read as the hash");
  const r = w.r.unregisteredArtifact(H, { target: A });
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.artifact_sha, r.target],
    [false, "UNREGISTERED_ARTIFACT", "UNREGISTERED_ARTIFACT", row("UNREGISTERED_ARTIFACT").check, row("UNREGISTERED_ARTIFACT").translation, H, A]);
  assert.equal(w.r.unregisteredArtifact(`sha256:${H.toUpperCase()}`).artifact_sha, H);
  assert.equal(w.r.unregisteredArtifact(H, { detail: "mine" }).detail, "mine");
  assert.equal(census(w), before, "writes nothing");
});

test("R16 actionReceipt answers the five conditions through the site, in R4's order and unchanged field for field", () => {
  const w = world();
  const held = w.doc(INFO);
  w.action(A, ledger("sent"));
  const R = (x) => w.r.actionReceipt({ target: A, ord: 0, at: "2026-09-03", how: "stamped", account: "I saw the stamp", viewer: M, author: M, ...x });
  const m = R({ author: MACHINE });
  assert.deepEqual([m.reason, m.target, m.check, m.detail],
    ["MACHINE_CANNOT_CORRESPOND", A, row("MACHINE_CANNOT_CORRESPOND").check,
     "a receipt is a named member's record that the group's sending reached its addressee. A machine credential may not record one. Sign in as a member."]);
  assert.equal(R({ author: "", target: "" }).reason, "MACHINE_CANNOT_CORRESPOND", "the fence is first");
  const bd = R({ at: "2026-02-30" });
  assert.deepEqual([bd.reason, bd.at, bd.target],  ["BAD_DATE", "2026-02-30", A]);
  assert.match(bd.detail, /YYYY-MM-DDTHH:MM/);
  assert.equal(R({ at: "2026-02-28T09:30" }).ok, true, "R4 admits the local date-time");
  const both = R({ artifactSha: held });
  assert.deepEqual([both.reason, both.target], ["CAPTURE_AND_TESTIMONY", A]);
  assert.match(both.detail, /OR a named member's account, never both/);
  const none = R({ account: "" });
  assert.deepEqual([none.reason, none.target], ["NEITHER_CAPTURE_NOR_TESTIMONY", A]);
  const un = R({ account: "", artifactSha: H });
  assert.deepEqual([un.reason, un.target, un.artifact_sha, un.detail],
    ["UNREGISTERED_ARTIFACT", A, H, "this hash names no capture in this store. Capture it first, or record a named account instead."]);
  assert.equal(R({ account: "", artifactSha: held }).ok, true, "control: a registered hash is held");
});
