/* case-carriage — withdrawing a mark on a photo (R14; T38, N788, DEC-183 (2), K2220), what R10 and R11 make of it, its
   rows of C-141 reaching the composed catalogue under codes of their own (N790, K2238), and a store's derivations
   from before T38 kept in their order. Driven at the module's interface; the photos are the fixture's PNGs, read back
   by its own decoder. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, makePng, decodePng, sha, V } from "./fixture.mjs";
import { CASE_CARRIAGE_CHECKS, CASE_CARRIAGE_WORDS, WITHDRAW_REASON_MAX, obscuredKey } from "../../../src/case-carriage/index.mjs";
import { readFile } from "node:fs/promises";
import { migrateCaseCarriage } from "../../../src/case-carriage/schema.mjs";
import * as SOURCES from "../../../src/sources/checks.mjs";
import * as RECORD_CORE from "../../../src/record-core/checks.mjs";
import * as MEMBERSHIP from "../../../src/membership/checks.mjs";
import * as PROMOTION from "../../../src/promotion/checks.mjs";
import * as PROVENANCE from "../../../src/provenance/checks.mjs";
import * as EXTRACTION from "../../../src/extraction/checks.mjs";
import * as ACCEPTED_WORK from "../../../src/accepted-work/checks.mjs";
import * as RECORD_GRAMMAR from "../../../src/record-grammar/acts.mjs";

const PHOTO = "INFO-2026-0020-photo";
const OLIVE = V("olive"), BEN = V("ben"), CARA = V("cara"), ADA = V("ada");
/* R14 (T40; DEC-187 (3)): the four withdrawal refusals' keys in words.json, by code */
const WITHDRAW_KEYS = { MACHINE_CANNOT_WITHDRAW_MARK: "photo.withdraw.refused.machine", NO_SUCH_MARK: "photo.withdraw.refused.nomark",
                        MARK_ALREADY_WITHDRAWN: "photo.withdraw.refused.already", WITHDRAW_NO_REASON: "photo.withdraw.refused.noreason" };
const W = 40, H = 30;
const area = (rect, kind = "person") => ({ rect, kind });
const inside = (rects, x, y) => rects.some(([x0, y0, x1, y1]) => x >= x0 && x < x1 && y >= y0 && y < y1);
function assertCovers(copyBytes, original, rects, label = "") {
  const c = decodePng(copyBytes), o = decodePng(original);
  for (let y = 0; y < o.height; y++)
    for (let x = 0; x < o.width; x++)
      assert.deepEqual(c.at(x, y), inside(rects, x, y) ? [0, 0, 0] : o.at(x, y), `${label} pixel ${x},${y}`);
}

async function scene() {
  const w = world();
  for (const m of ["olive", "ben", "cara"]) w.member(m);
  const original = makePng(W, H);
  const p = w.photo(PHOTO, original);
  const a = await w.cc.obscureMark({ captureSha: p, areas: [area([1, 1, 8, 8])], by: OLIVE });
  const b = await w.cc.obscureMark({ captureSha: p, areas: [area([20, 10, 30, 20], "plate")], by: BEN });
  assert.deepEqual([a.ok, b.ok], [true, true]);
  return { w, p, original, a, b, copyOf: (s) => w.bucket.held.get(obscuredKey("bio", s)).bytes };
}

test("R14 obscureMarkWithdraw records {withdrawal, mark, capture, reason, by, at} beside the mark, by any member who may see the photo, re-derives the copy from the marks that stand (R11), and answers as R10 after the act", async () => {
  const { w, p, original, a, b, copyOf } = await scene();
  w.clock.now = "2026-09-28T03:00:00Z";
  const r = await w.cc.obscureMarkWithdraw({ captureSha: p, mark: a.mark, reason: "that is the group's own organiser", by: CARA });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.deepEqual([r.mark, r.withdrawal, r.state], [a.mark, 1, "marked"]);
  assert.deepEqual(w.rows(`SELECT * FROM photo_mark_withdrawals`), [{ withdrawal: 1, mark: a.mark, capture: p,
    reason: "that is the group's own organiser", by: CARA, at: "2026-09-28T03:00:00.000Z" }]);
  /* the answer is R10's after the act */
  const { mark, withdrawal, ...view } = r;
  void mark; void withdrawal;
  assert.deepEqual(view, w.cc.photoMarks({ captureSha: p, viewer: BEN }));
  /* the copy covers only the mark that stands */
  assert.notEqual(r.copy.sha256, b.copy.sha256);
  assertCovers(copyOf(r.copy.sha256), original, [[20, 10, 30, 20]], "after the withdrawal");
  assertCovers(copyOf(b.copy.sha256), original, [[1, 1, 8, 8], [20, 10, 30, 20]], "the earlier copy is unchanged");
  /* the maker withdraws too; then no mark stands: unchecked, no copy */
  const last = await w.cc.obscureMarkWithdraw({ captureSha: p, mark: String(b.mark), reason: "not a plate after all", by: BEN });
  assert.deepEqual([last.ok, last.state, last.copy, last.refused], [true, "unchecked", null, null]);
  /* a new mark after every withdrawal derives again from the marks that stand: only itself */
  const again = await w.cc.obscureMark({ captureSha: p, areas: [], by: OLIVE });
  assert.equal(again.state, "nothing_to_obscure");
  assertCovers(copyOf(again.copy.sha256), original, [], "nothing covered");
});

test("R14 each refusal, in order, writes nothing and carries its C-141 row: MACHINE_CANNOT_WITHDRAW_MARK, NO_SUCH_PHOTO, NO_SUCH_MARK, MARK_ALREADY_WITHDRAWN (naming when and by whom), WITHDRAW_NO_REASON; a negative control for each records the withdrawal; (D54) the founder and an administrator neither invited nor joined to a hidden project are answered NO_SUCH_PHOTO, a discoverable project's mark withdrawn by both", async () => {
  const { w, p, a, b } = await scene();
  w.member("ada", { role: "admin" });
  const other = w.photo("INFO-2026-0021-other", makePng(8, 8, () => [200, 10, 10]));
  const o = await w.cc.obscureMark({ captureSha: other, areas: [area([0, 0, 2, 2])], by: OLIVE });
  const hidden = w.photo("INFO-2026-0022-hidden", makePng(8, 8, () => [10, 10, 200]));
  const h = await w.cc.obscureMark({ captureSha: hidden, areas: [area([0, 0, 2, 2])], by: OLIVE });
  w.fence("INFO-2026-0022-hidden", "PROJ-2026-0099");
  const open = w.photo("INFO-2026-0023-open", makePng(8, 8, () => [90, 160, 30]));
  const op = await w.cc.obscureMark({ captureSha: open, areas: [area([0, 0, 2, 2])], by: OLIVE });
  const op2 = await w.cc.obscureMark({ captureSha: open, areas: [area([4, 4, 6, 6])], by: OLIVE });
  w.fence("INFO-2026-0023-open", w.project("PROJ-2026-0098", { owner: "olive", visibility: "discoverable" }));
  w.clock.now = "2026-09-28T04:00:00Z";
  assert.equal((await w.cc.obscureMarkWithdraw({ captureSha: p, mark: b.mark, reason: "drawn twice", by: BEN })).ok, true);
  const ok = { captureSha: p, mark: a.mark, reason: "a reason", by: OLIVE };
  const cases = [
    ["MACHINE_CANNOT_WITHDRAW_MARK", { ...ok, by: undefined }],
    ["MACHINE_CANNOT_WITHDRAW_MARK", { ...ok, by: "  " }],
    ["MACHINE_CANNOT_WITHDRAW_MARK", { ...ok, by: "daemon" }],
    ["MACHINE_CANNOT_WITHDRAW_MARK", { captureSha: "nonsense", mark: "x", reason: "", by: "claude" }],
    ["NO_SUCH_PHOTO", { ...ok, captureSha: sha("never captured") }],
    ["NO_SUCH_PHOTO", { ...ok, captureSha: "not-a-digest", mark: "x", reason: "" }],
    ["NO_SUCH_PHOTO", { ...ok, captureSha: hidden, mark: h.mark }],
    /* D54 (K2408, K2442): neither invited nor joined, the founder (both spellings) and an administrator see the
       hidden project only at EXISTENCE */
    ["NO_SUCH_PHOTO", { captureSha: hidden, mark: h.mark, reason: "r", by: "admin" }],
    ["NO_SUCH_PHOTO", { captureSha: hidden, mark: h.mark, reason: "r", by: V("admin") }],
    ["NO_SUCH_PHOTO", { captureSha: hidden, mark: h.mark, reason: "r", by: ADA }],
    ["NO_SUCH_MARK", { ...ok, mark: 999, reason: "" }],
    ["NO_SUCH_MARK", { ...ok, mark: o.mark }],
    ["NO_SUCH_MARK", { ...ok, mark: "first" }],
    ["NO_SUCH_MARK", { ...ok, mark: null }],
    ["NO_SUCH_MARK", { ...ok, mark: 1.5 }],
    ["MARK_ALREADY_WITHDRAWN", { ...ok, mark: b.mark, reason: "" }],
    ["WITHDRAW_NO_REASON", { ...ok, reason: undefined }],
    ["WITHDRAW_NO_REASON", { ...ok, reason: 7 }],
    ["WITHDRAW_NO_REASON", { ...ok, reason: "   " }],
    ["WITHDRAW_NO_REASON", { ...ok, reason: "x".repeat(WITHDRAW_REASON_MAX + 1) }],
  ];
  const before = w.snapshot(), puts = w.bucket.calls.length;
  for (const [code, args] of cases) {
    const r = await w.cc.obscureMarkWithdraw(args);
    assert.deepEqual([r.ok, r.code, r.reason], [false, code, code], `${JSON.stringify(args).slice(0, 120)} → ${JSON.stringify(r)}`);
    assert.equal(r.check, CASE_CARRIAGE_CHECKS[code].check);
    assert.equal(r.translation, CASE_CARRIAGE_CHECKS[code].translation);
    assert.ok(typeof r.detail === "string" && r.detail.length > 5, code);
    if (code === "MARK_ALREADY_WITHDRAWN") {
      assert.deepEqual(r.withdrawn, { by: BEN, at: "2026-09-28T04:00:00.000Z" });
      assert.match(r.detail, /2026-09-28T04:00:00\.000Z/);
      assert.ok(r.detail.includes(BEN));
    }
  }
  assert.deepEqual(w.snapshot(), before, "no refusal wrote anything");
  assert.equal(w.bucket.calls.filter((c) => c[0] === "put").length, puts, "nor held a copy");
  /* negative controls: the same acts, made right, are recorded */
  for (const [label, args] of [["a reason at the bound", { ...ok, reason: "x".repeat(WITHDRAW_REASON_MAX) }],
                               ["(D54) the founder withdraws on a discoverable project's photo", { captureSha: open, mark: op.mark, reason: "r", by: "admin" }],
                               ["(D54) an administrator withdraws on a discoverable project's photo", { captureSha: open, mark: op2.mark, reason: "r", by: ADA }],
                               ["the other photo's own mark", { captureSha: other, mark: o.mark, reason: "r", by: BEN }]]) {
    const r = await w.cc.obscureMarkWithdraw(args);
    assert.equal(r.ok, true, `${label}: ${JSON.stringify(r).slice(0, 200)}`);
  }
  /* (D54) negative control for the hidden photo: out of the project, the founder withdraws its mark */
  w.fence("INFO-2026-0022-hidden", null);
  assert.equal((await w.cc.obscureMarkWithdraw({ captureSha: hidden, mark: h.mark, reason: "r", by: "admin" })).ok, true);
  assert.equal(w.count("photo_mark_withdrawals"), 6);
});

test("R14 (T40; DEC-187 (3)) the four refusals' translations are words.json's photo.withdraw.refused.machine, .nomark, .already, .noreason (C-141.7–.10), read by key, replacing BOB's drafts; each answer carries its placeholders' fills: {photo} the photo named, {member} and {date} who withdrew it and when", async () => {
  const words = JSON.parse(await readFile(new URL("../../../../docs/development/ux-substrate/screens/words.json", import.meta.url), "utf8")).words;
  const en = (k) => { const x = words.find((w) => w.key === k); assert.ok(x, `words.json holds ${k}`); return x; };
  for (const [code, key] of Object.entries(WITHDRAW_KEYS)) {
    assert.equal(CASE_CARRIAGE_CHECKS[code].translation, en(key).en, `${code} reads ${key}`);
    assert.equal(CASE_CARRIAGE_WORDS[key], en(key).en, key);
    assert.ok(en(key).protected, `${key} is protected`);
  }
  assert.deepEqual(Object.entries(WITHDRAW_KEYS).map(([c]) => CASE_CARRIAGE_CHECKS[c].check), ["C-141.7", "C-141.8", "C-141.9", "C-141.10"]);
  /* negative control: BOB's drafts are gone */
  for (const draft of ["Only a member can withdraw a mark on a photo. Nothing was recorded.", "That mark is not one of this photo's marks. Nothing was recorded.",
                       "That mark was already withdrawn. It is named with when and by whom. Nothing was recorded.",
                       "A mark is withdrawn only with a reason. Give the reason. Nothing was recorded."])
    assert.equal(Object.values(CASE_CARRIAGE_CHECKS).some((r) => r.translation === draft), false, draft);
  /* through the act: each refusal answers its key's words and the fills its placeholders name */
  const { w, p, a, b } = await scene();
  w.clock.now = "2026-09-28T06:00:00Z";
  assert.equal((await w.cc.obscureMarkWithdraw({ captureSha: p, mark: b.mark, reason: "r", by: CARA })).ok, true);
  const machine = await w.cc.obscureMarkWithdraw({ captureSha: p, mark: a.mark, reason: "r", by: "daemon" });
  assert.equal(machine.translation, en("photo.withdraw.refused.machine").en);
  const nomark = await w.cc.obscureMarkWithdraw({ captureSha: p, mark: 999, reason: "r", by: OLIVE });
  assert.deepEqual([nomark.translation, nomark.photo], [en("photo.withdraw.refused.nomark").en, p]);
  assert.match(nomark.translation, /\{photo\}/);
  const already = await w.cc.obscureMarkWithdraw({ captureSha: p, mark: b.mark, reason: "r", by: OLIVE });
  assert.deepEqual([already.translation, already.member, already.date], [en("photo.withdraw.refused.already").en, CARA, "2026-09-28T06:00:00.000Z"]);
  assert.match(already.translation, /\{member\}.*\{date\}/);
  const noreason = await w.cc.obscureMarkWithdraw({ captureSha: p, mark: a.mark, reason: " ", by: OLIVE });
  assert.equal(noreason.translation, en("photo.withdraw.refused.noreason").en);
  /* negative control: the act made right is recorded */
  assert.equal((await w.cc.obscureMarkWithdraw({ captureSha: p, mark: a.mark, reason: "a reason", by: OLIVE })).ok, true);
});

test("R14 R11 two members withdrawing one mark at once: one withdrawal is recorded, the other answered MARK_ALREADY_WITHDRAWN; each act's copy covers exactly the marks standing after it", async () => {
  const { w, p, original, a, copyOf } = await scene();
  const [x, y, z] = await Promise.all([
    w.cc.obscureMarkWithdraw({ captureSha: p, mark: a.mark, reason: "one", by: OLIVE }),
    w.cc.obscureMarkWithdraw({ captureSha: p, mark: a.mark, reason: "two", by: BEN }),
    w.cc.obscureMark({ captureSha: p, areas: [area([32, 2, 38, 6])], by: CARA })]);
  assert.deepEqual([x.ok, y.code, z.ok], [true, "MARK_ALREADY_WITHDRAWN", true]);
  assert.equal(w.count("photo_mark_withdrawals"), 1);
  assertCovers(copyOf(x.copy.sha256), original, [[20, 10, 30, 20]], "after the withdrawal");
  assertCovers(copyOf(z.copy.sha256), original, [[20, 10, 30, 20], [32, 2, 38, 6]], "the withdrawn area stays uncovered");
});

test("R10 photoMarks reads state over the marks that stand and shows each withdrawal ({by, at, reason}) on its mark, withdrawn ones included, oldest first", async () => {
  const { w, p, a, b } = await scene();
  w.clock.now = "2026-09-28T05:00:00Z";
  await w.cc.obscureMarkWithdraw({ captureSha: p, mark: b.mark, reason: "the plate is the group's van", by: OLIVE });
  const v = w.cc.photoMarks({ captureSha: p, viewer: CARA });
  assert.equal(v.state, "marked");
  assert.deepEqual(v.marks.map((m) => [m.mark, m.withdrawn]), [[a.mark, null],
    [b.mark, { by: OLIVE, at: "2026-09-28T05:00:00.000Z", reason: "the plate is the group's van" }]]);
  /* only a "nothing to obscure" mark standing: nothing_to_obscure */
  await w.cc.obscureMark({ captureSha: p, areas: [], by: BEN });
  await w.cc.obscureMarkWithdraw({ captureSha: p, mark: a.mark, reason: "not a person after all", by: CARA });
  assert.equal(w.cc.photoMarks({ captureSha: p, viewer: CARA }).state, "nothing_to_obscure");
});

test("R11 R12 a store whose photo_copies predates the derivation sequence (T37) keeps every row, in the order made, and the current copy stands", async () => {
  const { w, p, b } = await scene();
  const rows = w.rows(`SELECT capture, through, sha256, bytes, covered, width, height, refused_code, refused_detail, at FROM photo_copies ORDER BY seq`);
  w.st.sql.exec(`DROP TABLE photo_copies`);
  w.st.sql.exec(`CREATE TABLE photo_copies (capture TEXT NOT NULL, through INTEGER NOT NULL, sha256 TEXT, bytes INTEGER, covered INTEGER,
                 width INTEGER, height INTEGER, refused_code TEXT, refused_detail TEXT, at TEXT NOT NULL, PRIMARY KEY (capture, through))`);
  w.st.sql.exec(`CREATE INDEX photo_copies_sha ON photo_copies (sha256)`);
  for (const r of [...rows].reverse()) w.st.sql.exec(`INSERT INTO photo_copies VALUES (?,?,?,?,?,?,?,?,?,?)`, ...Object.values(r));
  migrateCaseCarriage(w.st.sql, w.st);
  assert.deepEqual(w.rows(`SELECT capture, through, sha256, bytes, covered, width, height, refused_code, refused_detail, at FROM photo_copies ORDER BY seq`), rows);
  assert.equal(w.cc.photoMarks({ captureSha: p, viewer: OLIVE }).copy.sha256, b.copy.sha256);
  migrateCaseCarriage(w.st.sql, w.st);
  assert.equal(w.count("photo_copies"), rows.length, "idempotent");
  assert.equal((await w.cc.obscureMarkWithdraw({ captureSha: p, mark: b.mark, reason: "r", by: OLIVE })).ok, true, "and acts after it");
});

test("N790 R9 R14 each of this module's codes is its own: held once in C-141 and by no family of the modules it uses, so the composed catalogue answers each with C-141's row (MACHINE_CANNOT_MARK_PHOTO, not sources' MACHINE_CANNOT_MARK)", () => {
  const families = [SOURCES, RECORD_CORE, MEMBERSHIP, PROMOTION, PROVENANCE, EXTRACTION, ACCEPTED_WORK, RECORD_GRAMMAR]
    .flatMap((ns) => Object.entries(ns).filter(([k, v]) => /_CHECKS$/.test(k) && v && typeof v === "object" && !Array.isArray(v)));
  assert.ok(families.some(([k]) => k === "SOURCES_CHECKS"), "sources' family is among them");
  const codes = Object.keys(CASE_CARRIAGE_CHECKS);
  assert.ok(codes.includes("MACHINE_CANNOT_MARK_PHOTO") && !codes.includes("MACHINE_CANNOT_MARK"));
  for (const k of ["MACHINE_CANNOT_WITHDRAW_MARK", "NO_SUCH_MARK", "MARK_ALREADY_WITHDRAWN", "WITHDRAW_NO_REASON"]) assert.ok(codes.includes(k), k);
  for (const code of codes) {
    const holders = families.filter(([, rows]) => Object.hasOwn(rows, code)).map(([k]) => k);
    assert.deepEqual(holders, [], `${code} is held by ${holders.join(", ")}`);
  }
  const checks = Object.values(CASE_CARRIAGE_CHECKS).map((r) => r.check);
  assert.equal(new Set(checks).size, checks.length, "each row numbered once");
  assert.ok(checks.every((c) => /^C-141\.\d+$/.test(c)));
  for (const [code, r] of Object.entries(CASE_CARRIAGE_CHECKS)) {
    /* this module's own sentences say nothing was recorded; (T40) the withdrawal's four are words.json's, by key */
    if (Object.hasOwn(WITHDRAW_KEYS, code)) assert.equal(r.translation, CASE_CARRIAGE_WORDS[WITHDRAW_KEYS[code]], r.check);
    else assert.ok(typeof r.translation === "string" && /Nothing was (recorded|made)\.$/.test(r.translation), r.check);
    assert.match(r.where, /^src\/case-carriage\/index\.mjs \S+ > is-[a-z-]+$/);
  }
  /* negative control: sources holds the bare code this module no longer answers */
  assert.ok(families.some(([, rows]) => Object.hasOwn(rows, "MACHINE_CANNOT_MARK")));
});
