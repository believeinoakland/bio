/* calculations: spot-checks: a draw's question (R18), members' visits to drawn items (R38), the spot-check's data
   (R39) and the estimate over visits (R40) (T36-19; N735, U119, DEC-178). */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V, MACHINE, R, saved } from "./fixture.mjs";
import { draw as gDraw, divide, multiply } from "../../../src/calc-grammar/index.mjs";
import { INPUT_CHANGED, VISIT_ASSUMPTION, calculationsOps } from "../../../src/calculations/index.mjs";

const code = (r) => (r && r.ok === false ? r.reason : "ok");
const PERIOD = { from: "2026-01-01", to: "2026-12-31" };
const Q = "Is the bench at this site repaired and usable?";
const FIELDS = [{ name: "site", type: "string" }];
const CSV = `site\n${Array.from({ length: 20 }, (_, i) => `bench-${i}`).join("\n")}\n`;
const CLOSED_CSV = "site\nclosed-a\nclosed-b\nclosed-c\n";

/* A world with a 20-row table drawn 6 with the question; `testify(member)` records that member's own testimony. */
async function spot({ question = Q } = {}) {
  const w = seeded();
  const t = await w.table(CSV, FIELDS);
  const d = w.c.draw({ set: t.sha, n: 6, seed: "spot", ...(question !== null ? { question } : {}), by: V("bob") });
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  let k = 0;
  const testify = (member, observedAt = "2026-10-01") => {
    const r = w.prov.testify({ words: `At the site I looked at the bench myself (${++k}).`, observedAt, title: `visit ${k}`, author: V(member) });
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
    return r;
  };
  const visit = (item, member, finding, extra = {}) => w.c.recordVisit({ draw: d.draw, item, testimony: testify(member).capture_sha, finding, by: V(member), ...extra });
  return { w, t, d, testify, visit };
}

/* The exact hypergeometric interval by hand: every count M of the frame tried in turn, each tail summed exactly. */
function handInterval(N, n, x, conf = [95n, 100n]) {
  const C = (m, k) => { if (k < 0 || k > m) return 0n; let r = 1n; for (let i = 1; i <= k; i++) r = (r * BigInt(m - k + i)) / BigInt(i); return r; };
  const total = C(N, n);
  const pk = (M, k) => C(M, k) * C(N - M, n - k);
  const enough = (num) => 2n * conf[1] * num >= (conf[1] - conf[0]) * total;
  const ms = Array.from({ length: N + 1 }, (_, M) => M);
  const upper = (M) => ms.filter((k) => k >= x && k <= n).reduce((s, k) => s + pk(M, k), 0n);
  const lower = (M) => ms.filter((k) => k <= x).reduce((s, k) => s + pk(M, k), 0n);
  const ok = ms.filter((M) => M >= x && N - M >= n - x);
  return { low: Math.min(...ok.filter((M) => enough(upper(M)))), high: Math.max(...ok.filter((M) => enough(lower(M)))) };
}

test("R18 a draw may carry a question, text of 1 to 2,000 characters, the words each drawn item is judged by; one differing from another only in its question is its own draw and reproduces the same sample; a question that is not such text is refused BAD_QUESTION, writing nothing", async () => {
  const w = seeded();
  const t = await w.table(CSV, FIELDS);
  const before = w.count("calc_draws");
  for (const question of ["", "   ", 7, { q: Q }, ["x"], "x".repeat(2001)])
    assert.equal(code(w.c.draw({ set: t.sha, n: 6, seed: "spot", question, by: V("bob") })), "BAD_QUESTION", JSON.stringify(question).slice(0, 40));
  assert.equal(w.count("calc_draws"), before, "a refused question writes nothing");
  const plain = w.c.draw({ set: t.sha, n: 6, seed: "spot", by: V("bob") });
  const a = w.c.draw({ set: t.sha, n: 6, seed: "spot", question: Q, by: V("bob") });
  const b = w.c.draw({ set: t.sha, n: 6, seed: "spot", question: "Is its paint intact?", by: V("bob") });
  const edge = w.c.draw({ set: t.sha, n: 6, seed: "spot", question: "é".repeat(2000), by: V("bob") });
  assert.equal(edge.ok, true, "2,000 characters is within the bound");
  assert.equal(plain.question, null);
  assert.equal(a.question, Q);
  assert.equal(new Set([plain.draw, a.draw, b.draw, edge.draw]).size, 4, "each question its own draw");
  const expected = gDraw({ frame: Array.from({ length: 20 }, (_, i) => String(i)), n: 6, seed: "spot" }).sample;
  for (const d of [plain, a, b]) {
    assert.deepEqual(d.sample, expected, "the same sample");
    assert.equal(w.c.reproduceDraw({ draw: d.draw, viewer: V("carol") }).reproduced, true);
  }
  assert.equal(w.c.draw({ set: t.sha, n: 6, seed: "spot", question: Q, by: V("carol") }).already, true, "the same question again is the same draw");
});

test("R38 recordVisit's refusals in order, each writing nothing, each with a negative control: MEMBER_ACT_ONLY, NO_SUCH_DRAW (absent, or not one the visitor may see, alike), NO_QUESTION, NOT_DRAWN, NOT_TESTIMONY, NOT_YOUR_TESTIMONY, BAD_FINDING, NO_SUCH_EXHIBIT naming it", async () => {
  const { w, d, testify } = await spot();
  const mine = testify("bob");
  const item = d.sample[0];
  const good = { draw: d.draw, item, testimony: mine.capture_sha, finding: "yes", by: V("bob") };
  assert.equal(code(w.c.recordVisit({ ...good, by: null })), "MEMBER_ACT_ONLY");
  assert.equal(code(w.c.recordVisit({ ...good, by: MACHINE })), "MEMBER_ACT_ONLY");
  assert.equal(code(w.c.recordVisit({ ...good, by: MACHINE, draw: "nope" })), "MEMBER_ACT_ONLY", "MEMBER_ACT_ONLY first");
  const absent = w.c.recordVisit({ ...good, draw: "0".repeat(64) });
  assert.equal(code(absent), "NO_SUCH_DRAW");
  /* a draw over a table the visitor may not see answers as an absent one */
  const P = w.project("Closed", "alice");
  const hiddenT = await w.table(CLOSED_CSV, FIELDS, { by: V("alice") }, { project: P });
  const hidden = w.c.draw({ set: hiddenT.sha, n: 2, seed: "h", question: Q, by: V("alice") });
  const refusedHidden = w.c.recordVisit({ ...good, draw: hidden.draw, item: hidden.sample[0] });
  assert.deepEqual({ ...refusedHidden }, { ...absent }, "not one you may see: answered exactly as absent");
  assert.equal(code(w.c.recordVisit({ ...good, draw: d.draw, item: "x", finding: "maybe" })), "NOT_DRAWN", "NO_SUCH_DRAW passed, NOT_DRAWN before BAD_FINDING");
  const bare = w.c.draw({ set: (await w.table("site\nbare-a\nbare-b\n", FIELDS)).sha, n: 2, seed: "bare", by: V("bob") });
  assert.equal(code(w.c.recordVisit({ ...good, draw: bare.draw, item: bare.sample[0] })), "NO_QUESTION");
  const notDrawn = String([...Array(20).keys()].find((i) => !d.sample.includes(String(i))));
  const nd = w.c.recordVisit({ ...good, item: notDrawn });
  assert.equal(code(nd), "NOT_DRAWN");
  assert.equal(nd.item, notDrawn);
  /* not testimony: an unauthored capture, an unknown sha, one the visitor may not see */
  const doc = w.document("a captured page");
  for (const testimony of [doc.capSha, "f".repeat(64), null, 5]) assert.equal(code(w.c.recordVisit({ ...good, testimony })), "NOT_TESTIMONY", String(testimony));
  const carols = testify("carol");
  assert.equal(code(w.c.recordVisit({ ...good, testimony: carols.capture_sha })), "NOT_YOUR_TESTIMONY");
  assert.equal(code(w.c.recordVisit({ ...good, testimony: carols.capture_sha, finding: "maybe" })), "NOT_YOUR_TESTIMONY", "before BAD_FINDING");
  for (const finding of [null, "Yes", "partly", "could not tell"]) assert.equal(code(w.c.recordVisit({ ...good, finding })), "BAD_FINDING", String(finding));
  const closedDoc = w.document("a photograph in a closed project", { project: P });
  const ex = w.c.recordVisit({ ...good, exhibits: [doc.capSha, closedDoc.capSha] });
  assert.equal(code(ex), "NO_SUCH_EXHIBIT");
  assert.equal(ex.exhibit, closedDoc.capSha, "names it");
  assert.equal(code(w.c.recordVisit({ ...good, exhibits: ["0".repeat(64)] })), "NO_SUCH_EXHIBIT");
  assert.equal(code(w.c.recordVisit({ ...good, exhibits: "a photo" })), "NO_SUCH_EXHIBIT");
  /* every refusal above wrote nothing (the hidden table, draws and documents aside, made before) */
  assert.equal(w.count("calc_visits"), 0, "no refusal wrote a visit");
  assert.deepEqual(w.rows(`SELECT recompute_status FROM calculations`), [], "nor anything else of calculations'");
  /* the negative control: a visit with an exhibit the visitor may see, and one with none (DEC-178: the photo is optional) */
  const v = w.c.recordVisit({ ...good, exhibits: [doc.capSha] });
  assert.equal(v.ok, true, JSON.stringify(v).slice(0, 300));
  assert.deepEqual(v.exhibits, [doc.capSha]);
  const noPhoto = w.c.recordVisit({ ...good, testimony: testify("bob").capture_sha, finding: "could_not_tell" });
  assert.equal(noPhoto.ok, true);
  assert.deepEqual(noPhoto.exhibits, [], "the testimony counts without a photo");
});

test("R38 a visit is append-only testimony tied to its item: kept with its visitor as provenance records the author, the testimony's observed_at and the instant recorded; a member who visits again records a new visit; its grade is the testimony's (D), never stronger", async () => {
  const { w, d, testify } = await spot();
  const item = d.sample[1];
  const t1 = testify("bob", "2026-09-30");
  const v1 = w.c.recordVisit({ draw: d.draw, item, testimony: t1.capture_sha, finding: "no", by: V("bob") });
  w.clock.now = "2026-10-07T09:00:00.000Z";
  const v2 = w.c.recordVisit({ draw: d.draw, item, testimony: testify("bob", "2026-10-06").capture_sha, finding: "yes", by: V("bob") });
  assert.equal(v1.ok && v2.ok, true);
  assert.deepEqual({ visitor: v1.visitor, observed_at: v1.observed_at, recorded_at: v1.recorded_at, grade: v1.grade, testimony: v1.testimony, item: v1.item, finding: v1.finding },
    { visitor: V("bob"), observed_at: "2026-09-30", recorded_at: "2026-10-06T01:00:00.000Z", grade: "D", testimony: t1.capture_sha, item, finding: "no" });
  assert.equal(w.rows(`SELECT author FROM register WHERE capture_sha=?`, t1.capture_sha)[0].author, v1.visitor, "the visitor as provenance records the testimony's author");
  assert.equal(v2.recorded_at, "2026-10-07T09:00:00.000Z");
  assert.notEqual(v2.visit, v1.visit, "a new visit, the first kept");
  assert.equal(v2.standing, "disagree", "both visits kept and in tension");
  const held = w.rows(`SELECT seq, finding FROM calc_visits WHERE draw_key=? ORDER BY seq`, d.draw);
  assert.deepEqual(held.map((r) => r.finding), ["no", "yes"], "the first visit is never changed or removed");
  assert.equal(typeof w.c.updateVisit, "undefined", "no service changes a visit");
  assert.equal(typeof w.c.removeVisit, "undefined", "nor removes one");
  /* stamps come from the control plane through the ops map */
  const url = new URL(`https://x/?viewer=${encodeURIComponent(V("carol"))}`);
  const viaOps = calculationsOps(w.c, url, { draw: d.draw, item, testimony: testify("carol").capture_sha, finding: "yes", by: V("bob") });
  const r = viaOps.spotcheckvisit();
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 200));
  assert.equal(r.visitor, V("carol"), "the url's stamp, never the body's");
});

test("R39 spotCheck answers the draw (its set and size, n, seed and method, reproduced), the question, each drawn item with its visits in recorded order and its standing (yes, no, disagree kept with both visits, could_not_tell, not_visited), counts summing to n, and the estimates held over the draw with their recompute status; it computes no estimate, writes nothing and never throws", async () => {
  const { w, t, d, visit } = await spot();
  const [i0, i1, i2, i3, i4, i5] = d.sample;
  for (const [item, member, finding] of [[i0, "bob", "yes"], [i1, "bob", "no"], [i1, "carol", "could_not_tell"], [i2, "bob", "yes"], [i2, "carol", "no"],
    [i3, "carol", "could_not_tell"], [i4, "bob", "yes"], [i4, "carol", "yes"]])
    assert.equal(visit(item, member, finding).ok, true);
  const before = w.snapshot();
  const s = w.c.spotCheck({ draw: d.draw, viewer: V("carol") });
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  assert.equal(s.found, true);
  assert.deepEqual({ ...s.draw, drawn_at: null, frame_hash: null }, { draw: d.draw, set: t.sha, set_kind: "table", set_size: 20, n: 6, seed: "spot", method: d.method,
    frame_hash: null, reproduced: true, drawn_by: V("bob"), drawn_at: null });
  assert.equal(s.question, Q);
  assert.deepEqual(s.items.map((i) => i.item), d.sample, "every drawn item, in drawn order");
  assert.deepEqual(s.items.map((i) => i.standing), ["yes", "no", "disagree", "could_not_tell", "yes", "not_visited"],
    "a could_not_tell beside a no does not count against it; yes and no together are a disagreement");
  const dis = s.items[2];
  assert.deepEqual(dis.visits.map((v) => [v.visitor, v.finding]), [[V("bob"), "yes"], [V("carol"), "no"]], "both visits kept, in recorded order, never picked between");
  assert.deepEqual(s.items[5].visits, []);
  assert.deepEqual(s.counts, { yes: 2, no: 1, judged: 3, could_not_tell: 1, disagree: 1, not_visited: 1 });
  assert.equal(s.counts.yes + s.counts.no + s.counts.could_not_tell + s.counts.disagree + s.counts.not_visited, d.n, "the counts sum to n");
  assert.deepEqual(s.estimates, [], "no estimate held yet, and none computed here");
  assert.equal(w.count("calculations"), 0);
  /* the estimates held over the draw, with their recompute status (stale included) */
  const e = await w.c.create({ question: Q, period: PERIOD, kind: "estimate", inputs: [{ name: "v", draw: d.draw }], by: V("bob") });
  assert.equal(e.ok, true, JSON.stringify(e).slice(0, 300));
  assert.deepEqual(w.c.spotCheck({ draw: d.draw, viewer: V("carol") }).estimates.map((x) => [x.calc_id, x.recompute_status]), [[e.calc_id, "unchecked"]]);
  visit(i5, "bob", "no");
  assert.deepEqual(w.c.spotCheck({ draw: d.draw, viewer: V("carol") }).estimates.map((x) => [x.calc_id, x.recompute_status]), [[e.calc_id, "stale"]]);
  /* through the ops map */
  const viaOps = calculationsOps(w.c, new URL(`https://x/?viewer=${encodeURIComponent(V("carol"))}&draw=${d.draw}`), {}).spotcheck();
  assert.deepEqual(viaOps, w.c.spotCheck({ draw: d.draw, viewer: V("carol") }));
  /* never throws */
  for (const bad of [undefined, null, 5, "x", { draw: {} }, { draw: d.draw, viewer: {} }, { draw: d.draw }]) assert.deepEqual(w.c.spotCheck(bad), { ok: true, found: false }, JSON.stringify(bad));
});

test("R39 a draw the viewer may not see, or one any of whose visits' testimony or exhibits the viewer may not see, answers {found: false} exactly as an absent draw; so does every calculation over it (R10)", async () => {
  const { w, d, visit, testify } = await spot();
  assert.equal(visit(d.sample[0], "bob", "yes").ok, true);
  const absent = w.c.spotCheck({ draw: "0".repeat(64), viewer: V("carol") });
  assert.deepEqual(absent, { ok: true, found: false });
  assert.equal(w.c.spotCheck({ draw: d.draw, viewer: V("carol") }).found, true, "the negative control");
  const e = await w.c.create({ question: Q, period: PERIOD, kind: "estimate", inputs: [{ name: "v", draw: d.draw }], by: V("bob") });
  assert.equal((await w.c.read({ calcId: e.calc_id, viewer: V("carol") })).found, true);
  /* one hidden testimony withholds the whole answer */
  const P = w.project("Closed", "alice");
  const hiddenWords = testify("alice");
  assert.equal(w.c.recordVisit({ draw: d.draw, item: d.sample[1], testimony: hiddenWords.capture_sha, finding: "no", by: V("alice") }).ok, true);
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, P, hiddenWords.bundle_id);
  assert.deepEqual(w.c.spotCheck({ draw: d.draw, viewer: V("carol") }), absent, "a visit's testimony carol may not see");
  assert.equal(w.c.spotCheck({ draw: d.draw, viewer: V("alice") }).found, true, "alice sees it whole");
  assert.equal((await w.c.read({ calcId: e.calc_id, viewer: V("carol") })).found, false, "the estimate over it is withheld whole");
  assert.equal(code(w.c.recordVisit({ draw: d.draw, item: d.sample[2], testimony: testify("carol").capture_sha, finding: "yes", by: V("carol") })), "NO_SUCH_DRAW");
  /* a hidden exhibit too */
  const { w: w2, d: d2, testify: t2 } = await spot();
  const P2 = w2.project("Closed", "alice");
  const photo = w2.document("a photograph", { project: P2 });
  assert.equal(w2.c.recordVisit({ draw: d2.draw, item: d2.sample[0], testimony: t2("alice").capture_sha, finding: "yes", exhibits: [photo.capSha], by: V("alice") }).ok, true);
  assert.deepEqual(w2.c.spotCheck({ draw: d2.draw, viewer: V("carol") }), absent, "an exhibit carol may not see");
  assert.equal(w2.c.spotCheck({ draw: d2.draw, viewer: V("alice") }).found, true);
  /* and a draw whose set the viewer may not see */
  const hiddenT = await w2.table(CLOSED_CSV, FIELDS, { by: V("alice") }, { project: P2 });
  const hd = w2.c.draw({ set: hiddenT.sha, n: 2, seed: "h", question: Q, by: V("alice") });
  assert.deepEqual(w2.c.spotCheck({ draw: hd.draw, viewer: V("carol") }), absent);
  assert.deepEqual(w2.c.spotCheck({ draw: hd.draw, viewer: null }), absent, "no viewer sees nothing");
  /* a draw over a frozen record set gives its ids as items */
  ["one", "two", "three"].forEach((n) => w2.document(n, { title: `Quoll ${n}` }));
  const set = await w2.c.freezeSet({ query: saved("quoll"), by: V("bob") });
  const sd = w2.c.draw({ set: set.set, n: 2, seed: "s", question: Q, by: V("bob") });
  const ss = w2.c.spotCheck({ draw: sd.draw, viewer: V("carol") });
  assert.deepEqual(ss.items.map((i) => i.item), sd.sample);
  assert.equal(ss.draw.set_size, 3);
});

test("R40 an estimate over a draw carrying a question takes its visits as they stand, carried in the draw input's canonical bytes (one row per drawn item with its standing): share_judged (yes over judged, with its denominator), the exact interval (frame the set's size, sample judged, successes yes, 0.95) as counts and as shares of the set, estimate_count exact, counted_apart, the stated assumption; its capture axis is testimony's", async () => {
  const { w, t, d, visit } = await spot();
  const [i0, i1, i2, i3, i4] = d.sample;
  for (const [item, member, finding] of [[i0, "bob", "yes"], [i1, "bob", "no"], [i2, "bob", "yes"], [i2, "carol", "no"], [i3, "carol", "could_not_tell"], [i4, "carol", "yes"]])
    assert.equal(visit(item, member, finding).ok, true);
  const e = await w.c.create({ question: Q, period: PERIOD, kind: "estimate", inputs: [{ name: "v", draw: d.draw }], by: V("bob") });
  assert.equal(e.ok, true, JSON.stringify(e).slice(0, 400));
  const r = e.results;
  assert.deepEqual([r.share_judged.numerator.value, r.share_judged.denominator.value], ["2", "3"], "yes over judged, with its denominator");
  assert.equal(r.share_judged.value.value, "0.666666666667");
  assert.deepEqual(r.output, r.share_judged);
  const hand = handInterval(20, 3, 2);
  assert.deepEqual({ low: r.interval.low, high: r.interval.high }, hand, "the hand-computed hypergeometric interval");
  assert.deepEqual({ frame_size: r.interval.frame_size, sample_size: r.interval.sample_size, successes: r.interval.successes, confidence: r.interval.confidence }, { frame_size: 20, sample_size: 3, successes: 2, confidence: "0.95" });
  const fig = (k) => ({ value: String(k), sign: "+", precision: "exact" });
  assert.deepEqual(r.interval.low_share, divide(fig(hand.low), fig(20), { places: 12, mode: "half_even" }), "low as a share of the set");
  assert.deepEqual(r.interval.high_share, divide(fig(hand.high), fig(20), { places: 12, mode: "half_even" }), "high as a share of the set");
  assert.deepEqual(r.estimate_count, multiply(r.share_judged.value, fig(20)), "share_judged times the set's size");
  assert.equal(r.estimate_count.value, "13.333333333340", "an exact decimal, never rounded further");
  assert.deepEqual([r.counted_apart.could_not_tell.value, r.counted_apart.disagree.value, r.counted_apart.not_visited.value], ["1", "1", "1"]);
  assert.equal(r.assumption, VISIT_ASSUMPTION);
  assert.match(r.assumption, /simple random draw/);
  /* carried in the draw input's canonical bytes: one row per drawn item with its standing */
  const read = await w.c.read({ calcId: e.calc_id, viewer: V("carol") });
  const input = read.calculation.inputs[0];
  assert.equal(input.kind, "draw");
  const bytes = new TextDecoder().decode(w.ev.m.get(input.sha));
  const standings = ["yes", "no", "disagree", "could_not_tell", "yes", "not_visited"];
  const counts = [1, 1, 2, 1, 1, 0];
  assert.equal(bytes, `item,standing,visits\r\n${d.sample.map((s, k) => `${s},${standings[k]},${counts[k]}\r\n`).join("")}`);
  /* the capture axis is testimony's */
  assert.deepEqual([read.grade.capture.grade, read.grade.inputs[0].grade], ["D", "D"]);
  /* another confidence, stated in the terms */
  const e90 = await w.c.create({ question: Q, period: PERIOD, kind: "estimate", terms: { confidence: "0.9" }, inputs: [{ name: "v", draw: d.draw }], by: V("bob") });
  assert.deepEqual({ low: e90.results.interval.low, high: e90.results.interval.high }, handInterval(20, 3, 2, [9n, 10n]));
  /* a recipe other than the composed one, another input beside the draw: refused, writing nothing */
  const n0 = w.count("calculations");
  assert.equal(code(await w.c.create({ question: Q, period: PERIOD, kind: "estimate", inputs: [{ name: "v", draw: d.draw }], recipe: R([{ op: "count", from: "v", as: "n" }], "n", [{ name: "v", kind: "table" }]), by: V("bob") })), "RECIPE_NOT_TEMPLATE");
  assert.equal(code(await w.c.create({ question: Q, period: PERIOD, kind: "estimate", inputs: [{ name: "v", draw: d.draw }, { name: "t", table: t.sha }], by: V("bob") })), "ESTIMATE_INPUTS");
  assert.equal(w.count("calculations"), n0);
  /* accept recomputes and agrees while the visits stand */
  assert.equal((await w.c.accept({ calcId: e.calc_id, by: V("carol") })).ok, true);
});

test("R40 with no item judged the estimate is refused NOTHING_JUDGED, writing nothing; a visit recorded after evaluation makes it stale (R11: input the draw, cause calculation_input_changed) and never changes its stored results; an estimate over a draw with no question is answered as R18 states", async () => {
  const { w, t, d, visit } = await spot();
  const told = [];
  w.c.onInputChanged("reevaluation", (x) => told.push(x));
  const n0 = w.count("calculations");
  assert.equal(code(await w.c.create({ question: Q, period: PERIOD, kind: "estimate", inputs: [{ name: "v", draw: d.draw }], by: V("bob") })), "NOTHING_JUDGED", "no visit at all");
  visit(d.sample[0], "bob", "could_not_tell");
  visit(d.sample[1], "bob", "yes"); visit(d.sample[1], "carol", "no");
  const none = await w.c.create({ question: Q, period: PERIOD, kind: "estimate", inputs: [{ name: "v", draw: d.draw }], by: V("bob") });
  assert.equal(code(none), "NOTHING_JUDGED", "only could_not_tell and a disagreement");
  assert.match(none.detail, /Nothing was written/);
  assert.equal(w.count("calculations"), n0);
  assert.equal(code(await w.c.evaluate({ kind: "estimate", inputs: [{ name: "v", draw: d.draw }], viewer: V("bob") })), "NOTHING_JUDGED");
  visit(d.sample[2], "carol", "yes");
  const e = await w.c.create({ question: Q, period: PERIOD, kind: "estimate", inputs: [{ name: "v", draw: d.draw }], by: V("bob") });
  assert.equal(e.ok, true);
  const stored = w.rows(`SELECT results_json, result_key FROM calculations WHERE calc_id=?`, e.calc_id)[0];
  told.length = 0;
  visit(d.sample[3], "bob", "no");
  assert.equal(w.rows(`SELECT recompute_status FROM calculations WHERE calc_id=?`, e.calc_id)[0].recompute_status, "stale");
  assert.deepEqual(told, [{ calcId: e.calc_id, input: d.draw, cause: INPUT_CHANGED }], "told once");
  assert.deepEqual(w.rows(`SELECT results_json, result_key FROM calculations WHERE calc_id=?`, e.calc_id)[0], stored, "its stored results never change");
  const rc = await w.c.recompute({ calcId: e.calc_id });
  assert.equal(rc.agrees, false, "the visits now stand otherwise");
  assert.equal(rc.results.share_judged.denominator.value, "2");
  assert.equal(code(await w.c.accept({ calcId: e.calc_id, by: V("carol") })), "CALC_RECOMPUTE_DIFFERS");
  /* a draw with no question: the estimate is R18's, the member's recipe over the drawn rows */
  const plain = w.c.draw({ set: t.sha, n: 6, seed: "spot", by: V("bob") });
  const p = await w.c.create({ question: "How many drawn?", period: PERIOD, kind: "estimate", inputs: [{ name: "s", draw: plain.draw }],
    recipe: R([{ op: "count", from: "s", as: "n" }], "n", [{ name: "s", kind: "table" }]), by: V("bob") });
  assert.equal(p.ok, true);
  assert.equal(p.results.share_judged, undefined);
  assert.deepEqual({ low: p.results.interval.low, high: p.results.interval.high }, handInterval(20, 6, 6));
  assert.equal((await w.c.read({ calcId: p.calc_id, viewer: V("bob") })).grade.inputs[0].not_graded, true, "a draw with no question is graded as before");
});

test("R40 no result, label or sentence of a spot-check, a visit or an estimate over visits says breach, violation, nonconforming or not met (R27, R37)", async () => {
  const { w, d, visit } = await spot();
  const out = [d];
  for (const [k, f] of [[0, "yes"], [1, "no"], [2, "could_not_tell"]]) out.push(visit(d.sample[k], "bob", f));
  out.push(w.c.spotCheck({ draw: d.draw, viewer: V("carol") }));
  const e = await w.c.create({ question: Q, period: PERIOD, kind: "estimate", inputs: [{ name: "v", draw: d.draw }], by: V("bob") });
  out.push(e, await w.c.read({ calcId: e.calc_id, viewer: V("bob") }), await w.c.create({ question: Q, period: PERIOD, kind: "estimate", inputs: [{ name: "v", draw: "0".repeat(64) }], by: V("bob") }));
  for (const r of [w.c.recordVisit({ draw: d.draw, item: "x", testimony: null, finding: "yes", by: V("bob") }), w.c.recordVisit({ draw: d.draw, item: d.sample[0], testimony: "f".repeat(64), finding: "yes", by: V("bob") })]) out.push(r);
  const text = JSON.stringify(out, (k, v) => (k === "reason" || k === "code" ? undefined : v));
  assert.doesNotMatch(text, /\bbreach|\bviolat|\bnon-?conforming|not met|\bdiverted\b|\bmisused\b|\bscore\b|\bsuspicious\b|Noticed/i);
});
