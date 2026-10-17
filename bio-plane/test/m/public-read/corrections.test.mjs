/* public-read — R37 (T50; DEC-310 (6); K3683, K3725; `docket` R6, R12, R14, R25; `publication` R70): the data of "Corrections
   and orders". The `publishedcase` op's answer carries `corrections`, read from `docket`'s public answer (captures
   omitted); the synchronous `publishedCase` method does not. Each claim has its negative control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { publishedSix, docketOn } from "./fixture.mjs";

const CASE = "CASE-2026-0001";
/* the edition is published 2026-09-28 (the fixture's instant) */
const entry = (seq, kind, date, extra = {}) => ({ seq, kind, date, shelf: "listed", edition: 1, ...extra });
const worldWith = (entries, opts = {}) => {
  const docket = opts.docket || entries.reduce((d, e) => d.place(CASE, e), docketOn({ cases: [CASE] }));
  return publishedSix({ docket });
};

test("R37 an edition with a later edition, a withdrawal and a court order after its publication answers count 3 and the newest as last, at the publishedcase op", async () => {
  const { w } = worldWith([
    entry(1, "edition", "2026-09-28"), entry(2, "response", "2026-10-01"), entry(3, "edition", "2026-10-02", { edition: 2 }),
    entry(4, "withdrawal", "2026-10-05"), entry(5, "reaction", "2026-10-06"),
    entry(6, "court-order", "2026-10-09", { order: { effect: "seal", editions: [1] } })]);
  const op = await w.readOp("publishedcase", { id: CASE });
  assert.equal(op.ok, true);
  assert.deepEqual(op.corrections, { count: 3, last: { seq: 6, kind: "court-order", date: "2026-10-09" } });
  /* what the docket was asked: this case, captures omitted */
  assert.deepEqual(w.docket.publicAsked.at(-1), { case: CASE, captures: "omit" });
  /* the same answer in every other key: corrections is beside the method's answer, which does not carry it */
  const { corrections: _c, ...rest } = op;
  assert.deepEqual(rest, w.read("publishedcase", { id: CASE }));
  assert.equal(Object.hasOwn(w.read("publishedcase", { id: CASE }), "corrections"), false, "the synchronous method keeps its callers unchanged");
  /* newest by (date, seq): two entries on one day, the higher seq is last */
  const { w: w2 } = worldWith([entry(2, "withdrawal", "2026-10-05"), entry(3, "court-order", "2026-10-05"), entry(1, "edition", "2026-10-04", { edition: 2 })]);
  assert.deepEqual((await w2.readOp("publishedcase", { id: CASE })).corrections, { count: 3, last: { seq: 3, kind: "court-order", date: "2026-10-05" } });
});

test("R37 the same edition counts only the entries after its own publication; an edition with none answers count 0 and last null", async () => {
  const { w } = worldWith([entry(1, "edition", "2026-09-28"), entry(2, "withdrawal", "2026-10-05"), entry(3, "court-order", "2026-10-09")]);
  assert.equal((await w.readOp("publishedcase", { id: CASE })).corrections.count, 2);
  /* viewed as a later edition: published after the withdrawal, so only the order follows */
  w.st.sql.exec(`UPDATE published_cases SET published_at=? WHERE case_id=?`, "2026-10-06T00:00:00Z", CASE);
  assert.deepEqual((await w.readOp("publishedcase", { id: CASE })).corrections, { count: 1, last: { seq: 3, kind: "court-order", date: "2026-10-09" } });
  w.st.sql.exec(`UPDATE published_cases SET published_at=? WHERE case_id=?`, "2026-10-09T10:00:00Z", CASE);
  assert.deepEqual((await w.readOp("publishedcase", { id: CASE })).corrections, { count: 0, last: null }, "nothing after it");
  /* control: a case with only its own edition entry answers 0, and other kinds after publication count for nothing */
  const { w: w2 } = worldWith([entry(1, "edition", "2026-09-28"), entry(2, "response", "2026-10-02"), entry(3, "statement", "2026-10-03"),
                               entry(4, "disclosure", "2026-10-04"), entry(5, "outcome", "2026-10-05")]);
  assert.deepEqual((await w2.readOp("publishedcase", { id: CASE })).corrections, { count: 0, last: null });
  /* control: entries before the publication do not count */
  const { w: w3 } = worldWith([entry(1, "withdrawal", "2026-09-20"), entry(2, "court-order", "2026-09-27")]);
  assert.deepEqual((await w3.readOp("publishedcase", { id: CASE })).corrections, { count: 0, last: null });
});

test("R37 a docket that cannot be read answers undetermined: true and never count 0, without throwing", async () => {
  const unread = { count: null, last: null, undetermined: true };
  const broken = (docketPublic) => ({ ...docketOn({ cases: [CASE] }), docketPublic });
  for (const [label, fn] of [["rejects", async () => { throw new Error("storage unreadable"); }],
                             ["throws", () => { throw new Error("sync"); }],
                             ["null", async () => null], ["not ok", async () => ({ ok: false })],
                             ["no entries", async () => ({ ok: true, entries: "x" })]]) {
    const { w } = worldWith([], { docket: broken(fn) });
    const op = await w.readOp("publishedcase", { id: CASE });
    assert.equal(op.ok, true, label);
    assert.deepEqual(op.corrections, unread, label);
  }
  /* control: a readable empty docket answers 0, a different thing from undetermined */
  const { w } = worldWith([]);
  assert.deepEqual((await w.readOp("publishedcase", { id: CASE })).corrections, { count: 0, last: null });
});

test("R37 corrections is the same bytes for every caller, is read for a case only, and leaves a refusal as publishedCase answers it", async () => {
  const { w } = worldWith([entry(1, "edition", "2026-09-28"), entry(2, "withdrawal", "2026-10-05")]);
  const a = JSON.stringify((await w.readOp("publishedcase", { id: CASE })).corrections);
  const b = JSON.stringify((await w.readOp("publishedcase", { caseId: CASE, viewer: "olive", by: "anyone" })).corrections);
  assert.equal(a, b);
  assert.equal(a, JSON.stringify({ count: 1, last: { seq: 2, kind: "withdrawal", date: "2026-10-05" } }));
  /* control: a case never published is publishedCase's own refusal, with no corrections */
  const nope = await w.readOp("publishedcase", { id: "CASE-2099-0001" });
  assert.deepEqual(nope, w.read("publishedcase", { id: "CASE-2099-0001" }));
  assert.equal(Object.hasOwn(nope, "corrections"), false);
  /* it wrote nothing: only reads of the docket */
  assert.ok(w.docket.calls.every(([name]) => ["withdrawalOf", "lastEntryOf", "docketPublic"].includes(name)));
});
