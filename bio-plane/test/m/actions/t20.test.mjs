/* actions' T20 entries at its interface: R52 `actionHold` (a litigation hold on a `legal` pressure mark, K899 (7),
   DEC-61; N-A19) and its read (R25), R54 `holdsDue`, and K899 (1)'s "record" in text members read (R13's move). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, actionMd, CP } from "./fixture.mjs";
import * as actions from "../../../src/actions/index.mjs";
import * as grammar from "../../../src/action-grammar/index.mjs";

const A = "ACTN-2026-0001-a", B = "ACTN-2026-0002-b";
const M = V("alice");
const LEGAL = { kind: "legal", note: "a letter threatening a suit" };
const received = (n) => ["correspondence:", ...Array.from({ length: n }, (_, i) =>
  ["  - direction: received", "    at: 2026-09-03", `    account: "reply ${i}"`, "    author: member:alice"]).flat()];

/* An action holding `n` received entries (testimony), each marked with `kinds[i]` when given. */
function marked(w, id, kinds, extra = []) {
  w.action(id, [...received(kinds.length), ...extra]);
  kinds.forEach((kind, ord) => {
    if (!kind) return;
    const r = w.a.actionPressure({ target: id, ord, pressure: { kind, note: `${kind} ${ord}` }, viewer: M, author: M });
    assert.equal(r.ok, true, JSON.stringify(r));
  });
}
const holdRows = (w, id) => w.rows(`SELECT COUNT(*) AS n FROM action_holds WHERE bundle_id=?`, id)[0].n;

test("R52 actionHold: refusals in R52's order, each with its row (C-117.20-.22) and a negative control; nothing written", () => {
  const w = world();
  w.doc("INFO-2026-0001-d");
  marked(w, A, ["legal", "retaliation", null]);
  const H = (x) => w.a.actionHold({ target: A, ord: 0, hold: "in_place", reason: "keeping the emails", viewer: M, author: M, ...x });
  /* each refusal, given everything after it wrong as well, so the order is the one R52 states */
  const worse = { target: "", hold: "kept", reason: "" };
  assert.deepEqual([H({ author: MACHINE, ...worse }), H({ author: "", ...worse }), H({ ...worse }),
    H({ hold: "kept", target: "ACTN-2026-0404-x" }), H({ target: "ACTN-2026-0404-x", ord: 1 }),
    H({ target: "INFO-2026-0001-d", ord: 1 }), H({ ord: 1 })].map((r) => r.reason),
    ["MACHINE_CANNOT_SET_HOLD", "MACHINE_CANNOT_SET_HOLD", "NO_TARGET", "HOLD_REFUSED", "NO_SUCH_BUNDLE", "NOT_AN_ACTION",
     "HOLD_NO_LEGAL_MARK"]);
  /* each catalogue-backed refusal carries action-grammar's row, minted at the regions its `where` names */
  const rows = grammar.ACTION_CATALOGUE_CHECKS;
  for (const [r, code, check, region] of [[H({ author: MACHINE }), "MACHINE_CANNOT_SET_HOLD", "C-117.20", "is-hold"],
                                          [H({ hold: "kept" }), "HOLD_REFUSED", "C-117.21", "is-hold"],
                                          [H({ ord: 1 }), "HOLD_NO_LEGAL_MARK", "C-117.22", "is-hold-legal-mark"]]) {
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, code, code, check, rows[code].translation], code);
    assert.equal(rows[code].where, `src/actions/index.mjs actionHold > ${region}`, code);
  }
  /* HOLD_REFUSED: every arm of the hold and of the reason (R22's text rule, 1 to 500 characters) */
  for (const x of [{ hold: "kept" }, { hold: "" }, { hold: null }, { hold: "IN_PLACE" }, { reason: "" }, { reason: "   " },
                   { reason: null }, { reason: "x".repeat(501) }, { reason: 'a"b' }, { reason: "a\\b" }, { reason: "a\nb" },
                   { reason: "a\rb" }])
    assert.equal(H(x).reason, "HOLD_REFUSED", JSON.stringify(x));
  /* HOLD_NO_LEGAL_MARK: an unmarked entry, a mark of another kind, no entry at all, a position that is no number */
  for (const ord of [2, 1, 9, "one", null, -1, 0.5])
    assert.equal(H({ ord }).reason, "HOLD_NO_LEGAL_MARK", String(ord));
  /* absent and invisible alike */
  const hidden = H({ viewer: "nobody" }), absent = H({ target: "ACTN-2026-0404-x" });
  assert.deepEqual([hidden.reason, Object.keys(hidden)], [absent.reason, Object.keys(absent)]);
  assert.equal(hidden.reason, "NO_SUCH_BUNDLE");
  assert.equal(holdRows(w, A), 0, "no refusal writes a statement");
  /* negative control: a member's statement on the legal mark lands, at 500 characters too */
  assert.equal(H({ reason: "x".repeat(500), ord: "0" }).ok, true);
  assert.equal(H({ hold: "released", reason: "settled" }).reason, "HOLD_RELEASE_IS_ITS_OWN_ACT", "R56 is that act");
  assert.equal(w.a.actionHoldRelease({ target: A, ord: 0, reason: "settled", viewer: M, author: M }).ok, true);
  assert.equal(holdRows(w, A), 2);
});

test("R52 R25 in_place then released: both statements kept, the latest stands; the read shows a legal mark's holds oldest first", () => {
  const w = world();
  marked(w, A, ["legal", "discrediting"]);
  const before = w.a.actionRead({ id: A, viewer: M });
  assert.deepEqual([before.pressure[0].holds, before.pressure[0].hold], [[], null], "null while none is stated");
  assert.ok(!("hold" in before.pressure[1]) && !("holds" in before.pressure[1]), "a mark of another kind carries no hold");
  const text = w.text(A);
  const one = w.a.actionHold({ target: A, ord: 0, hold: "in_place", reason: "preserving the emails", viewer: M, author: M });
  assert.deepEqual(one, { ok: true, target: A, ord: 0, hold: "in_place", reason: "preserving the emails", by: M,
                          at: "2026-09-28T12:00:00Z", projects: [] });
  w.clock.ms += 60000;
  const two = w.a.actionHoldRelease({ target: A, ord: 0, reason: "the claim was withdrawn", viewer: M, author: V("bob") });
  assert.deepEqual([two.ok, two.hold, two.by, two.at], [true, "released", V("bob"), "2026-09-28T12:01:00Z"]);
  assert.equal(w.text(A), text, "the action's document is never rewritten");
  const p = w.a.actionRead({ id: A, viewer: M }).pressure[0];
  assert.deepEqual(p.holds, [
    { seq: 1, hold: "in_place", reason: "preserving the emails", by: M, at: "2026-09-28T12:00:00Z", projects: [] },
    { seq: 2, hold: "released", reason: "the claim was withdrawn", by: V("bob"), at: "2026-09-28T12:01:00Z", restarted: [] }]);
  assert.equal(p.hold, "released", "the latest statement is the hold");
  /* stated again: appended, the earlier ones untouched */
  w.a.actionHold({ target: A, ord: 0, hold: "in_place", reason: "a new demand arrived", viewer: M, author: M });
  const again = w.decorate(A, undefined, M).action.pressure[0];
  assert.deepEqual([again.holds.length, again.hold, again.holds[0], again.holds[1]], [3, "in_place", p.holds[0], p.holds[1]]);
  /* the op, with the stamps the control plane makes; and the statements purge with the action */
  const url = new URL(`https://x/?target=${A}&ord=0&reason=done&viewer=${M}&author=${M}`);
  assert.deepEqual([actions.actionsOps(w.a, url, null).actionholdrelease().ok, holdRows(w, A)], [true, 4]);
  const viaBody = actions.actionsOps(w.a, new URL(`https://x/?viewer=${M}&author=${MACHINE}`),
    { target: A, ord: 0, hold: "in_place", reason: "x" }).actionhold();
  assert.equal(viaBody.reason, "MACHINE_CANNOT_SET_HOLD", "the author is the stamp, never the body's");
  w.record.purge({ bundleId: A });
  assert.equal(holdRows(w, A), 0);
});

test("R54 holdsDue lists a legal mark until a hold is stated; never another kind, never an invisible action; the state is not asked", () => {
  const D = "CONF-2026-0001-determination";
  const conf = { determinationRead: ({ id }) => (id === D ? { ok: true, id: D, live: true, superseded_by: null, project: "PROJ-2026-0001-p" }
                                                           : { ok: false }) };
  const w = world({ conformance: conf });
  assert.equal(w.promote(D, ["---", `id: ${D}`, "object_type: determination", `title: ${D}`, "current_state: recorded",
    'created: "2026-09-01T00:00:00Z"', 'last_updated: "2026-09-01T00:00:00Z"', "---", "", "d", ""].join("\n"),
    { extra: { replay: true } }).ok, true);
  marked(w, A, ["legal", "other", "legal"], ["action_basis:", `  - target: ${D}`, "    kind: rests_on"]);
  marked(w, B, ["retaliation", "legal"]);
  const due = () => w.a.holdsDue({ viewer: M });
  const r = due();
  assert.deepEqual(r.items, [
    { action: A, ord: 0, note: "legal 0", marked_by: M, marked_at: "2026-09-28T12:00:00Z", project: "PROJ-2026-0001-p" },
    { action: A, ord: 2, note: "legal 2", marked_by: M, marked_at: "2026-09-28T12:00:00Z", project: "PROJ-2026-0001-p" },
    { action: B, ord: 1, note: "legal 1", marked_by: M, marked_at: "2026-09-28T12:00:00Z", project: null }]);
  assert.deepEqual([r.ok, r.truncated, r.cursor, r.limit], [true, false, null, 500]);
  /* a stated hold, in place or released, takes the mark off the list */
  w.a.actionHoldRelease({ target: A, ord: 2, reason: "never needed", viewer: M, author: M });
  assert.deepEqual(due().items.map((x) => [x.action, x.ord]), [[A, 0], [B, 1]]);
  /* the action's state is not asked: an abandoned action's legal mark is still due */
  assert.equal(w.a.actionMove({ target: B, to: "abandoned", reason: "dropped", viewer: M, author: M }).ok, true);
  assert.deepEqual(due().items.map((x) => [x.action, x.ord]), [[A, 0], [B, 1]]);
  /* an invisible action is never listed; `after` an action id reads past all its marks */
  assert.deepEqual(w.a.holdsDue({ viewer: "nobody" }).items, []);
  assert.deepEqual(w.a.holdsDue({ viewer: M, after: A }).items.map((x) => x.action), [B]);
  /* writes nothing */
  const counts = () => ["action_holds", "action_pressure", "manifest"].map((t) => w.rows(`SELECT COUNT(*) AS n FROM ${t}`)[0].n);
  const was = counts(); due(); assert.deepEqual(counts(), was);
});

test("R54 holdsDue pages at 500 in (action id, position) order, with cursor and truncated; paging through each cursor reaches every mark", () => {
  const w = world();
  marked(w, A, Array(300).fill("legal"));
  marked(w, B, Array(300).fill("legal"));
  const p1 = w.a.holdsDue({ viewer: M });
  assert.deepEqual([p1.items.length, p1.truncated, p1.cursor], [500, true, `${B}#199`]);
  assert.deepEqual([p1.items[0].action, p1.items[0].ord, p1.items[299].ord, p1.items[300].action], [A, 0, 299, B]);
  const p2 = w.a.holdsDue({ viewer: M, after: p1.cursor });
  assert.deepEqual([p2.items.length, p2.truncated, p2.cursor, p2.items[0].ord], [100, false, null, 200]);
  assert.equal(new Set([...p1.items, ...p2.items].map((x) => `${x.action}#${x.ord}`)).size, 600, "every mark, once");
  assert.deepEqual([w.a.holdsDue({ viewer: M, limit: 10 }).items.length, w.a.holdsDue({ viewer: M, limit: 9999 }).limit], [10, 500]);
});

test("R13 (K899 (1)) the move's refusal says \"record\" in text members read, never \"bundle\"", () => {
  const w = world();
  w.action(A);
  w.a.actionMove({ target: A, to: "active", reason: "sent", viewer: M, author: M });
  const r = w.a.actionMove({ target: A, to: "resolved", reason: "done", viewer: M, author: M });
  assert.equal(r.reason, "NO_RESOLUTION");
  assert.match(r.detail, /would produce a record the catalog rejects/);
  assert.doesNotMatch(r.detail, /bundle/);
});
