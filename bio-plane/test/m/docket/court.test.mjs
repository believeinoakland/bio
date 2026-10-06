/* docket: a court order complied with openly (R25; K1480), never taken back (R11), and the docket's dates offered to
   `events`' "what we did" lane (R26; K1494), at the module's interface. Every refusal is shown with its negative
   control. `publication`'s `stampEdition` (its R62) is the fixture's recorder until T33-63 merges; `events` is real. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, file, prepare, sign, post, fileAndPlace, V, MACHINE, CASE, SUBJECT, OTHER_SUBJECT, NOW, DAY }
  from "./fixture.mjs";
import { DOCKET_CHECKS, ENTRY_FORMAT, ORDER_EFFECTS } from "../../../src/docket/index.mjs";

const A = V("alice");
const rowOk = (r, code) => {
  assert.equal(r.ok, false, JSON.stringify(r).slice(0, 300));
  assert.equal(r.reason, code);
  assert.equal(r.code, code);
  assert.equal(r.check, DOCKET_CHECKS[code].check);
  assert.equal(r.translation, DOCKET_CHECKS[code].translation);
};
function refusedThenAccepted(w, bad, good, code) {
  const before = w.snapshot();
  const r = bad();
  rowOk(r, code);
  assert.deepEqual(w.snapshot(), before, `${code}: nothing written`);
  const ok = good();
  assert.equal(ok.ok, true, `${code}'s control: ${JSON.stringify(ok).slice(0, 300)}`);
  return r;
}
const fields = (p) => JSON.parse(p.entry);
const ORDER = (w, x = {}) => ({ kind: "court-order", order: { effect: "seal", editions: [1], parts: ["Exhibit 3"] }, capture: w.bare.sha,
                                reason: "The court sealed Exhibit 3.", ...x });
const order = (w, o, x = {}) => prepare(w, ORDER(w, { order: o, ...x }));

test("R25 R4 R18 a court order is placed only by the manager: machine, NO_SUCH_CASE, not the manager, each writing nothing", () => {
  const w = seeded();
  const ok = () => prepare(w, ORDER(w));
  for (const who of [MACHINE, "token:operator", "class:admin", null])
    refusedThenAccepted(w, () => prepare(w, ORDER(w, { by: who, viewer: who })), ok, "MACHINE_CANNOT_PLACE_DOCKET");
  assert.equal(prepare(w, ORDER(w), "dave").reason, "NO_SUCH_CASE");
  refusedThenAccepted(w, () => prepare(w, ORDER(w), "bob"), ok, "DOCKET_NOT_THE_MANAGER");
});

test("R25 the order's form: the editions it names, the captured order, the reason, then what it orders and its parts", () => {
  const w = seeded();
  w.publish(w.P, CASE, 2, [{ id: w.F1, role: "load_bearing" }]);
  const good = () => prepare(w, ORDER(w));
  for (const editions of [undefined, null, [], [9], [1, 9], "one", 1, [0]])
    refusedThenAccepted(w, () => order(w, { effect: "seal", editions, parts: ["Exhibit 3"] }), good, "DOCKET_NO_EDITION");
  for (const o of [null, "seal", 7]) refusedThenAccepted(w, () => order(w, o), good, "DOCKET_NO_EDITION");
  const unlocated = w.capture("unlocated", { held: false });
  for (const capture of [null, "f".repeat(64), unlocated.sha, "not-a-sha"])
    refusedThenAccepted(w, () => prepare(w, ORDER(w, { capture })), good, "DOCKET_NO_CAPTURE");
  for (const reason of [null, "", "  ", "r".repeat(2001)])
    refusedThenAccepted(w, () => prepare(w, ORDER(w, { reason })), good, "DOCKET_NO_REASON");
  assert.equal(prepare(w, ORDER(w, { reason: "r".repeat(2000) })).ok, true, "a reason at the bound");
  /* what it orders: one of the four, and the parts of the edition it names, for redact, seal and unseal */
  const bad = [{ effect: "destroy" }, { effect: null }, { effect: "redact" }, { effect: "seal" }, { effect: "unseal" },
               { effect: "seal", parts: [] }, { effect: "seal", parts: "Exhibit 3" }, { effect: "seal", parts: ["Exhibit 3", "Exhibit 3"] },
               { effect: "seal", parts: ["two\nlines"] }, { effect: "seal", parts: ["x".repeat(201)] }, { effect: "seal", parts: [""] },
               { effect: "redact", parts: [3] }, { effect: "remove", parts: [] }];
  for (const o of bad) refusedThenAccepted(w, () => order(w, { editions: [1], ...o }), good, "DOCKET_ORDER_UNREADABLE");
  for (const effect of ORDER_EFFECTS.filter((e) => e !== "unseal"))
    assert.equal(order(w, { effect, editions: [1], parts: ["x".repeat(200)] }).ok, true, `${effect} with parts`);
  assert.deepEqual(ORDER_EFFECTS, ["remove", "redact", "seal", "unseal"]);
  const removal = order(w, { effect: "remove", editions: "all" });
  assert.equal(removal.ok, true, "a removal names no parts");
  assert.deepEqual([fields(removal).edition, fields(removal).order], ["all", { effect: "remove", editions: "all" }]);
  /* the shelf: a court order is listed, never a reaction */
  refusedThenAccepted(w, () => prepare(w, ORDER(w, { shelf: "reactions" })), good, "DOCKET_WRONG_SHELF");
  /* the order of the refusals: a call breaking several is answered by the earliest */
  const all = { order: { effect: "destroy", editions: [9] }, capture: "x", reason: "", shelf: "reactions" };
  const steps = [["DOCKET_NO_EDITION", { order: { effect: "destroy", editions: [1] } }], ["DOCKET_NO_CAPTURE", { capture: w.bare.sha }],
                 ["DOCKET_NO_REASON", { reason: "r" }], ["DOCKET_ORDER_UNREADABLE", { order: { effect: "seal", editions: [1], parts: ["p"] } }],
                 ["DOCKET_WRONG_SHELF", { shelf: "listed" }]];
  let x = ORDER(w, all);
  for (const [code, fix] of steps) { rowOk(prepare(w, x), code); x = { ...x, ...fix }; }
  assert.equal(prepare(w, x).ok, true);
});

test("R25 an unsealing order names only parts a sealing order of the case names: DOCKET_NOTHING_SEALED otherwise", async () => {
  const w = seeded();
  const unseal = (parts) => order(w, { effect: "unseal", editions: [1], parts });
  refusedThenAccepted(w, () => unseal(["Exhibit 3"]), () => order(w, { effect: "seal", editions: [1], parts: ["Exhibit 3"] }), "DOCKET_NOTHING_SEALED");
  /* a redaction or removal naming the part seals nothing */
  await post(w, ORDER(w, { order: { effect: "redact", editions: [1], parts: ["Exhibit 3"] }, reason: "Redact it." }));
  rowOk(unseal(["Exhibit 3"]), "DOCKET_NOTHING_SEALED");
  await post(w, ORDER(w));
  assert.equal(unseal(["Exhibit 3"]).ok, true, "sealed by an earlier order: it may be unsealed");
  const r = unseal(["Exhibit 3", "Exhibit 4"]);
  rowOk(r, "DOCKET_NOTHING_SEALED");
  assert.deepEqual(r.parts, ["Exhibit 4"], "names what no sealing order names");
  /* placed in turn, the unsealing order is read before the material is used in a later act */
  const u = await post(w, ORDER(w, { order: { effect: "unseal", editions: [1], parts: ["Exhibit 3"] }, reason: "The court unsealed it." }));
  const orders = w.docket.courtOrdersOf({ case: CASE });
  assert.deepEqual(orders.map((o) => [o.seq, o.effect, o.parts]), [[1, "redact", ["Exhibit 3"]], [2, "seal", ["Exhibit 3"]], [3, "unseal", ["Exhibit 3"]]]);
  assert.equal(orders[2].entry, `${CASE}#${u.seq}`);
  assert.equal(orders[2].digest, u.prepared.digest);
});

test("R25 the post: stored and signed like any public entry; each named edition stamped in the same transaction, linked to the entry", async () => {
  const w = seeded();
  w.clock.now = NOW - DAY;
  w.publish(w.P, CASE, 2, [{ id: w.F1, role: "load_bearing" }], { at: NOW - DAY });
  w.clock.now = NOW;
  const p = prepare(w, ORDER(w, { order: { effect: "seal", editions: "all", parts: ["Exhibit 3", "Appendix B"] } }));
  assert.equal(p.ok, true);
  assert.deepEqual(fields(p), { format: ENTRY_FORMAT, group: "test-group", case: CASE, seq: 1, previous: null, shelf: "listed",
                                kind: "court-order", edition: "all", date: "2026-10-01", reason: "The court sealed Exhibit 3.",
                                capture: { sha256: w.bare.sha, origin: w.bare.origin, archived: null },
                                order: { effect: "seal", editions: "all", parts: ["Exhibit 3", "Appendix B"] } });
  /* a third edition ratified between prepare and post is in `all` at the post (R12's reading) */
  w.publish(w.P, CASE, 3, [{ id: w.F1, role: "load_bearing" }]);
  const r = await w.docket.docketPost({ digest: p.digest, signature: sign(p), acknowledged: true, by: A, viewer: A });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.deepEqual(w.stamps.list, [1, 2, 3].map((edition) => ({ case: CASE, edition, effect: "seal", parts: ["Exhibit 3", "Appendix B"],
                                                                entry: 1, stamped_at: "2026-10-01T12:00:00Z" })));
  assert.deepEqual(w.publication.stampsOf({ case: CASE, edition: 2 }).stamps.map((s) => [s.entry, s.effect]), [[1, "seal"]],
                   "publication answers the stamp beside the edition, linked to the entry");
  /* an edition ratified after the post is not named by it */
  w.publish(w.P, CASE, 4, [{ id: w.F1, role: "load_bearing" }]);
  assert.deepEqual(w.docket.courtOrdersOf({ case: CASE }).map((o) => o.editions), [[1, 2, 3]]);
  assert.deepEqual(w.docket.courtOrdersOf({ case: CASE, edition: 4 }), []);
  assert.equal(w.docket.courtOrdersOf({ case: CASE, edition: 2 }).length, 1);
  assert.deepEqual(w.docket.courtOrdersOf({ case: null }), []);
  /* one edition named: only it is stamped, and remove carries no parts */
  await post(w, ORDER(w, { order: { effect: "remove", editions: [2] }, reason: "The court ordered edition 2 removed." }));
  assert.deepEqual(w.stamps.list.slice(3).map((s) => [s.edition, s.effect, s.parts, s.entry]), [[2, "remove", null, 2]]);
  assert.equal(w.reeval.acted.length, 0, "a court order is not a withdrawal: reevaluation is not told");
});

test("R25 a stamp refused or failed undoes the post, writing nothing: never a silent compliance", async () => {
  const w = seeded();
  const p = prepare(w, ORDER(w));
  const go = () => w.docket.docketPost({ digest: p.digest, signature: sign(p), acknowledged: true, by: A, viewer: A });
  const before = w.snapshot();
  w.stamps.refuse = "NO_SUCH_CASE_EDITION";
  const r = await go();
  assert.deepEqual([r.ok, r.reason], [false, "NO_SUCH_CASE_EDITION"], "answered as publication gave it");
  assert.deepEqual(w.snapshot(), before, "the entry's row is rolled back");
  w.stamps.refuse = null;
  w.stamps.throws = true;
  await assert.rejects(go(), /stamp store down/);
  assert.deepEqual(w.snapshot(), before, "a throw undoes it too");
  w.stamps.throws = false;
  const ok = await go();
  assert.equal(ok.ok, true, "negative control: the same prepared entry posts once the stamp is recorded");
  assert.equal(w.stamps.list.length, 1);
  assert.equal(w.stamps.calls.length, 3, "the stamp was asked each time, inside the post");
});

test("R25 R19 R20 the order is public whole: its captured bytes are listed, its entry names no member and never carries a sealed part's content", async () => {
  const w = seeded();
  const sealed = w.capture("sealed-exhibit");
  await post(w, ORDER(w, { order: { effect: "seal", editions: [1], parts: ["Exhibit 3"] } }));
  const pub = await w.docket.docketPublic({ case: CASE });
  assert.equal(pub.entries.length, 1);
  assert.deepEqual(Buffer.from(pub.captures[w.bare.sha], "base64"), w.bare.bytes, "the order itself, listed whole (R7, R14)");
  const text = JSON.stringify(pub);
  for (const m of ["alice", "bob", "member:", "h_alice", "Cover "]) assert.ok(!text.includes(m), `names no ${m}`);
  assert.ok(!text.includes(sealed.sha) && !text.includes(sealed.bytes.toString("utf8")), "the sealed material is never carried");
  const feed = await w.docket.docketFeed({ case: CASE });
  assert.match(feed, /#1 court-order, edition 1/);
});

test("R11 a court order is never taken back: DOCKET_WITHDRAWAL_FINAL; a later order is a new entry", async () => {
  const w = seeded();
  const o = await post(w, ORDER(w));
  const { posted } = await fileAndPlace(w);
  refusedThenAccepted(w, () => prepare(w, { kind: "take-back", edition: 1, takesBack: o.seq, reason: "Placed in error." }),
                      () => prepare(w, { kind: "take-back", edition: 1, takesBack: posted.seq, reason: "Placed twice." }), "DOCKET_WITHDRAWAL_FINAL");
  const later = await post(w, ORDER(w, { order: { effect: "unseal", editions: [1], parts: ["Exhibit 3"] }, reason: "Unsealed on appeal." }));
  assert.equal(later.seq, 3);
  assert.deepEqual((await w.docket.docketPublic({ case: CASE })).entries.map((e) => e.taken_back), [null, null, null]);
});

test("R26 at start the docket registers its event source with events once; events' timeline answers it in the 'what we did' lane", () => {
  const w = seeded();
  assert.deepEqual(w.docket.eventSourceRegistration, { ok: true });
  w.docket.start();
  const again = w.events.registerEventSource("docket", () => []);
  assert.equal(again.reason, "LISTENER_DECLARED", "registered once: a second registration by docket is refused");
  const t = w.events.timeline({ set: [SUBJECT], lanes: ["ours"], viewer: A });
  assert.deepEqual(t.ours.sources.map((s) => s.source), ["docket"]);
  assert.equal(t.ours.sources[0].error, undefined);
  assert.equal(t.world, undefined, "never in the world's lane");
});

test("R26 docketEvents: each public entry of a case whose named subjects are in the set, by date (and received), bounded; only for a viewer who sees the project; never record entries; writes nothing", async () => {
  const w = seeded();
  const { filed } = await fileAndPlace(w);                              /* #1 response, filed and placed on 2026-10-01 */
  w.clock.now = NOW + DAY;
  const late = file(w).entry;                                         /* filed 2026-10-02 */
  w.clock.now = NOW + 3 * DAY;
  await post(w, { kind: "response", entry: late });                   /* #2 placed 2026-10-04, received 2026-10-02 */
  w.clock.now = NOW + 4 * DAY;
  await post(w, ORDER(w));                                            /* #3 court-order 2026-10-05 */
  const pending = file(w, { proposed: "record", reason: "for us only" }).entry;
  const q = (x = {}) => w.docket.docketEvents({ set: [SUBJECT], viewer: A, ...x });
  const before = w.snapshot();
  const all = q();
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  assert.deepEqual(all.items.map((i) => [i.at, i.ref, i.kind]), [
    ["2026-10-01", `${CASE}#1`, "response"], ["2026-10-01", `${CASE}#1`, "response"],
    ["2026-10-02", `${CASE}#2`, "response"], ["2026-10-04", `${CASE}#2`, "response"],
    ["2026-10-05", `${CASE}#3`, "court-order"]]);
  for (const i of all.items) {
    assert.deepEqual(Object.keys(i).sort(), ["at", "kind", "label", "ref"]);
    assert.equal(typeof i.label, "string");
  }
  assert.equal(all.truncated, false);
  assert.ok(!JSON.stringify(all).includes(pending) && !JSON.stringify(all).includes(filed.entry), "no record entry");
  /* a joined member who sees the project in full sees the same; one who does not, and a call naming no viewer, nothing */
  assert.deepEqual(q({ viewer: V("bob") }), all);
  assert.deepEqual(q({ viewer: V("dave") }), { items: [], truncated: false });
  assert.deepEqual(q({ viewer: null }), { items: [], truncated: false });
  /* the set: only a named subject matches; another entity, an event id or an empty set, nothing */
  assert.deepEqual(q({ set: [OTHER_SUBJECT] }).items, []);
  assert.deepEqual(q({ set: ["EVT-2026-0001"] }).items, []);
  assert.deepEqual(q({ set: [] }).items, []);
  assert.deepEqual(q({ set: `${OTHER_SUBJECT},${SUBJECT}` }), all, "a comma list as events passes it");
  /* a subject named only by a later edition's member finding matches too */
  w.subjects.set("INQ-2026-0009-late", OTHER_SUBJECT);
  w.publish(w.P, CASE, 2, [{ id: "INQ-2026-0009-late", role: "load_bearing" }]);
  assert.deepEqual(q({ set: [OTHER_SUBJECT] }), all);
  /* the bounds, by day, inclusive; a limit with truncated */
  assert.deepEqual(q({ from: "2026-10-02", to: "2026-10-04" }).items.map((i) => i.at), ["2026-10-02", "2026-10-04"]);
  assert.deepEqual(q({ from: "2026-10-02T23:00:00Z" }).items.map((i) => i.at), ["2026-10-02", "2026-10-04", "2026-10-05"]);
  const two = q({ limit: 2 });
  assert.deepEqual([two.items.length, two.truncated], [2, true]);
  assert.deepEqual(two.items, all.items.slice(0, 2));
  assert.equal(q({ limit: 0 }).items.length, 1, "limit clamped to at least 1");
  /* through events' timeline, as R30 calls it: the docket's own lane, apart from the world's */
  const t = w.events.timeline({ set: [SUBJECT], lanes: ["ours"], viewer: A });
  assert.equal(t.ours.sources[0].source, "docket");
});

test("R25 (K1632) at start the docket registers its order source with publication once; courtOrderOf answers a posted court-order entry, null otherwise", async () => {
  const w = seeded();
  assert.deepEqual(w.docket.orderSourceRegistration, { ok: true, module: "docket" });
  w.docket.start();
  assert.deepEqual(w.publication.orderSource(), { registered: true, module: "docket" });
  assert.equal(w.publication.registerOrderSource("docket", { courtOrderOf: () => null }).reason, "PROVIDER_DECLARED", "once");
  const src = w.docket;
  assert.equal(src.courtOrderOf(CASE, `${CASE}#1`), null, "nothing posted yet");
  const { posted } = await fileAndPlace(w);
  w.publish(w.P, CASE, 2, [{ id: w.F1, role: "load_bearing" }]);
  const o = await post(w, ORDER(w, { order: { effect: "seal", editions: "all", parts: ["Exhibit 3"] } }));
  const r = await post(w, ORDER(w, { order: { effect: "remove", editions: [1] }, reason: "Remove edition 1." }));
  const before = w.snapshot();
  assert.deepEqual(src.courtOrderOf(CASE, `${CASE}#${o.seq}`), { seq: o.seq, effect: "seal", editions: [1, 2], parts: ["Exhibit 3"] });
  assert.deepEqual(w.docket.courtOrderOf(CASE, `${CASE}#${r.seq}`), { seq: r.seq, effect: "remove", editions: [1], parts: null });
  for (const [c, e] of [[CASE, `${CASE}#${posted.seq}`], [CASE, `${CASE}#9`], ["CASE-2026-9999", `${CASE}#${o.seq}`], [CASE, "x"], [null, null], [CASE, `${CASE}#`]])
    assert.equal(w.docket.courtOrderOf(c, e), null, `${c} ${e}: not a posted court order of that case`);
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  /* the stamp reads through it: each post above was stamped, linked to its entry */
  assert.deepEqual(w.stamps.list.map((s) => [s.edition, s.entry]), [[1, o.seq], [2, o.seq], [1, r.seq]]);
});
