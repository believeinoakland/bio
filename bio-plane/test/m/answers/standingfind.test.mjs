/* A standing find (R28; N698, DEC-164 (6), K1865, K1941) and the draft's reach (R1, T35; N686, K1837), at the
   interface. A standing find runs the real `retrieval.findIn` (its R73–R75), so these tests stand on retrieval's own
   test world, which holds the extraction tables a find reads (`readings`, `capture_text`); answers is built over it as
   the composition root builds it. No model provider is registered but a counting one, to show none is called. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "../retrieval/fixture.mjs";
import { answersOf, ANSWERS_CHECKS, ASK_SCOPE, askAdmits, draftAdmits, STANDING_FIND_MAX, STANDING_FIND_LABEL,
         STANDING_LABEL, FIND_ORIGIN } from "../../../src/answers/index.mjs";
import { answersOps } from "../../../src/answers/ops.mjs";

const ANN = V("ann"), VERA = V("vera");
const code = (r) => r.code ?? r.reason;
const tables = (w) => w.rows(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '%fts%' ORDER BY name`)
  .map((t) => [t.name, w.count(t.name)]);

/* ann's project holding one capture, and a document outside it; the profile states English (R75). */
function findWorld() {
  const w = world();
  w.record.setSetting("jurisdiction_profiles", ["test-port-ellery"], "member:ann");
  const iso = () => new Date(w.clock.now).toISOString();
  w.calls = [];
  w.a = answersOf(w.host, { record: w.record, membership: w.membership, retrieval: w.retrieval, now: iso });
  w.record.setSetting("answers_standing_ai", true, "admin");   /* every switch on: a find still calls no model */
  w.a.registerStandingAnswerer("agent-worker", async (x) => { w.calls.push(x); return null; });
  w.at = (d) => { w.clock.now = Date.parse(`${d}T15:00:00Z`); };
  const a = w.cap("a.pdf", "a bytes"), out = w.cap("o.pdf", "o bytes");
  w.proj = w.project("Ann's budget work", "ann", { captures: [a] });
  w.doc("INFO-OUT", {}, { captures: [out] });
  w.unit(a.sha, w.proj, 0, "The Clerk shall publish the agenda. The budget is $4.2 million.");
  w.unit(out.sha, "INFO-OUT", 0, "The council must not meet in secret. It spent $9 million.");
  w.n = 0;
  /** A capture arriving in ann's project, its page stating `text`. */
  w.arrive = (text) => {
    const c = w.cap(`c${++w.n}.pdf`, `c bytes ${w.n}`);
    w.doc(`INFO-C${w.n}`, { project: w.proj }, { captures: [c] });
    w.unit(c.sha, `INFO-C${w.n}`, 0, text);
    return c;
  };
  w.retrieval.zone();   /* the plane makes every module's tables at boot (retrieval R69) */
  return w;
}
const setFind = (w, over = {}) => w.a.standingQuestionSet({ author: ANN, find: { scope: { project: w.proj }, kinds: ["requirements", "money"] },
                                                         cadence: "daily", ends: "2026-12-31", ...over });

test("R28 a standing find is set by the member's own act over a findIn scope, the question optional; both a query and a find, or neither, STANDING_NEEDS_SEARCH; a find findIn refuses is refused with that refusal; each refusal writes nothing", () => {
  const w = findWorld();
  const before = tables(w);
  for (const over of [{ query: "title:budget" }, { find: undefined }, { find: null }]) {
    const r = setFind(w, over);
    assert.equal(code(r), "STANDING_NEEDS_SEARCH", JSON.stringify(over));
    assert.equal(r.check, ANSWERS_CHECKS.STANDING_NEEDS_SEARCH.check);
    assert.equal(r.translation, ANSWERS_CHECKS.STANDING_NEEDS_SEARCH.translation);
  }
  assert.equal(code(setFind(w, { find: { scope: { project: "PROJ-none" }, kinds: ["money"] } })), "NO_SUCH_PROJECT");
  assert.equal(code(setFind(w, { author: VERA })), "NO_SUCH_PROJECT", "under the author's sight: ann's project is not vera's");
  assert.equal(code(setFind(w, { find: { scope: { project: w.proj }, kinds: [] } })), "NO_KINDS");
  assert.equal(code(setFind(w, { find: { scope: { project: w.proj }, kinds: ["vibes"] } })), "KIND_UNKNOWN");
  assert.equal(code(setFind(w, { find: { scope: { project: w.proj }, kinds: ["term"] } })), "NO_TERM");
  assert.equal(code(setFind(w, { find: { scope: { bundle: "x" }, kinds: ["money"] } })), "SCOPE_UNKNOWN");
  assert.equal(code(setFind(w, { author: "class:ai" })), "MACHINE_CANNOT_AUTHOR");
  assert.equal(code(setFind(w, { cadence: "hourly" })), "BAD_CADENCE");
  assert.equal(code(setFind(w, { ends: "2026-01-01" })), "STANDING_NEEDS_END");
  assert.deepEqual(tables(w), before, "a refusal writes nothing");
  const r = setFind(w);
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(r.question, null, "no 'For which question'");
  assert.deepEqual(r.find, { scope: { project: w.proj }, kinds: ["requirements", "money"], term: null });
  const named = setFind(w, { question: "Is the budget published?", find: { scope: { project: w.proj }, kinds: "term", term: "agenda" } });
  assert.equal(named.ok, true);
  const got = w.a.standingQuestionRead({ id: named.id, viewer: ANN }).question;
  assert.equal(got.question, "Is the budget published?"); assert.equal(got.query, null);
  assert.deepEqual(got.find, { scope: { project: w.proj }, kinds: ["term"], term: "agenda" });
  assert.equal(code(w.a.standingQuestionRead({ id: r.id, viewer: VERA })), "NO_SUCH_STANDING_QUESTION", "its author's alone (R16)");
  /* the ops map passes the body's find, the author the control plane's stamp */
  const url = new URL(`https://x/?viewer=${encodeURIComponent(ANN)}`);
  const viaOp = answersOps(w.a, url, { find: { scope: { project: w.proj }, kinds: ["money"] }, cadence: "weekly", ends: "2026-12-31" }).standingset();
  assert.equal(viaOp.ok, true, JSON.stringify(viaOp));
});

test("R28 each run calls findIn under its author's sight; a first run finds nothing new; a match is new when its extent was not in the previous run's; the new matches reach the author once, as one entry, Found by search, answer null; no model is called and nothing else is recorded", async () => {
  const w = findWorld();
  const q = setFind(w);
  const first = await w.a.standingTick(new Date(w.clock.now).toISOString());
  assert.deepEqual(first.ran.map((x) => [x.id, x.new_found]), [[q.id, false]], "a first run finds nothing new");
  w.at("2026-09-28");
  assert.equal((await w.a.standingTick(new Date(w.clock.now).toISOString())).ran[0].new_found, false, "nothing arrived");
  const c = w.arrive("The Treasurer must report within seven days. A grant of $50,000 was received.");
  const outside = w.cap("z.pdf", "z bytes");
  w.doc("INFO-Z", {}, { captures: [outside] });
  w.unit(outside.sha, "INFO-Z", 0, "Outside the scope, the board shall meet.");
  w.at("2026-09-29");
  const before = tables(w);
  const t = await w.a.standingTick(new Date(w.clock.now).toISOString());
  assert.equal(t.ran[0].new_found, true);
  assert.equal(t.ran[0].held_back, null, "no AI half for a find");
  const after = tables(w);
  assert.deepEqual(after.filter(([n], i) => JSON.stringify(after[i]) !== JSON.stringify(before[i])).map(([n]) => n),
                   ["standing_runs"], "the run records its own row and nothing else (no fact, no content, no reading)");
  assert.equal(w.calls.length, 0, "no model is called, though every switch is on and an answerer is registered");
  const got = w.a.standingAnswersFor({ member: ANN });
  assert.equal(got.entries.length, 1);
  const e = got.entries[0];
  assert.equal(e.answer, null); assert.equal(e.held_back, null);
  assert.equal(e.label, STANDING_FIND_LABEL); assert.notEqual(e.label, STANDING_LABEL); assert.doesNotMatch(e.label, /machine/);
  assert.equal(e.origin, FIND_ORIGIN); assert.equal(e.finds.origin, "search");
  assert.equal(e.question.question, null);
  assert.equal(e.finds.truncated, false); assert.equal(e.finds.more, 0);
  assert.deepEqual(e.finds.matches.map((m) => [m.kind, m.capture_sha]).sort(), [["money", c.sha], ["requirements", c.sha]],
                   "only the new capture's matches; the scope's old ones and the capture outside it are not told");
  for (const m of e.finds.matches) {
    assert.equal(m.origin, "search");
    assert.ok(m.words && m.extent, JSON.stringify(m));
  }
  assert.match(e.finds.matches.find((m) => m.kind === "money").words, /\$50,000/);
  /* told once: the next run finds nothing new, and nothing after the cursor */
  w.at("2026-09-30");
  assert.equal((await w.a.standingTick(new Date(w.clock.now).toISOString())).ran[0].new_found, false);
  assert.deepEqual(w.a.standingAnswersFor({ member: ANN, after: e.run }).entries, []);
  for (const m of [VERA, "admin", null]) assert.deepEqual(w.a.standingAnswersFor({ member: m }).entries, [], String(m));
  /* R26's rule holds: no account was asked for at any step (none is configured in this world) */
  assert.equal(w.calls.length, 0);
});

test("R28 at most 500 new matches per entry, truncated with the count of the rest", async () => {
  const w = findWorld();
  const q = setFind(w, { find: { scope: { project: w.proj }, kinds: ["money"] } });
  await w.a.standingTick(new Date(w.clock.now).toISOString());
  /* 260 captures arriving, two amounts each: 520 new matches over two of findIn's pages (200 captures each) */
  const caps = [];
  for (let i = 0; i < 260; i++) caps.push(w.cap(`m${i}.pdf`, `many bytes ${i}`));
  w.doc("INFO-MANY", { project: w.proj }, { captures: caps });
  caps.forEach((c, i) => w.unit(c.sha, "INFO-MANY", 0, `Item ${i} cost $${i + 1}. Its upkeep is $${i + 1000}.`));
  w.at("2026-09-28");
  await w.a.standingTick(new Date(w.clock.now).toISOString());
  const e = w.a.standingAnswersFor({ member: ANN }).entries.find((x) => x.question.id === q.id);
  assert.equal(e.finds.matches.length, STANDING_FIND_MAX);
  assert.equal(e.finds.truncated, true);
  assert.equal(e.finds.more, 20, "the count of the rest");
  assert.equal(e.finds.partial, undefined, "every capture of the scope was read");
  assert.equal(new Set(e.finds.matches.map((m) => `${m.capture_sha}/${m.as_read}`)).size, STANDING_FIND_MAX);
  /* the 20 not told are kept as seen with the rest: the next run tells none of them again */
  w.at("2026-09-29");
  assert.equal((await w.a.standingTick(new Date(w.clock.now).toISOString())).ran[0].new_found, false);
});

test("R28 a run whose scope findIn now refuses ran, found nothing, and says why", async () => {
  const w = findWorld();
  const c = w.arrive("The clerk shall file.");
  const q = setFind(w, { find: { scope: { capture: c.sha }, kinds: ["requirements"] } });
  assert.equal(q.ok, true, JSON.stringify(q));
  w.retrieval.findIn = () => ({ ok: false, reason: "CAPTURE_NOT_HELD", detail: "gone" });
  const t = await w.a.standingTick(new Date(w.clock.now).toISOString());
  assert.equal(t.ran[0].new_found, false);
  const run = w.rows(`SELECT held_back_json FROM standing_runs WHERE stq_id=?`, q.id)[0];
  assert.deepEqual(JSON.parse(run.held_back_json), { condition: "query_refused", reason: "CAPTURE_NOT_HELD" });
});

test("R21 a standing find reads one record read, retrieval's findIn, under its author's sight: no capture request, no fetch, no outside read, no AI run", async () => {
  const w = findWorld();
  const touched = [];
  const real = w.retrieval;
  w.a.deps.retrieval = new Proxy(real, { get: (t, k) => { const v = t[k]; return typeof v === "function" ? (...a) => { touched.push(String(k)); return v.apply(t, a); } : v; } });
  w.a.resolved.clear();
  setFind(w);
  await w.a.standingTick(new Date(w.clock.now).toISOString());
  w.arrive("A fee of $10 must be paid.");
  w.at("2026-09-28");
  await w.a.standingTick(new Date(w.clock.now).toISOString());
  assert.deepEqual([...new Set(touched)].sort(), ["findIn", "zone"], "findIn, and the zone its days are counted on");
  assert.equal(w.calls.length, 0);
});

test("R1 the draft's reach is the asking scope: draftAdmits admits exactly what askAdmits admits; a draft's reads go through logRead under its grant with R2's removals, and write no R13 count", () => {
  const w = findWorld();
  assert.equal(draftAdmits, askAdmits, "one function, so the two cannot drift");
  for (const e of ASK_SCOPE) assert.equal(draftAdmits(e.op), true, e.op);
  for (const op of ["standingset", "findin", "sources", "export", "purge", "entitycreate", "", null]) assert.equal(draftAdmits(op), false, String(op));
  const before = tables(w);
  const read = w.a.logRead({ grant: "g-draft", viewer: VERA, op: "search", args: { q: "budget" },
                             answer: { ok: true, count: 3, hits: [{ bundle_id: "INFO-OUT" }, { bundle_id: w.proj }, { tie_id: "MTI-2026-0001-x" }] } });
  assert.deepEqual(read.hits, [{ bundle_id: "INFO-OUT" }], "ann's hidden project and the tie removed (R2)");
  assert.equal(read.count, 1);
  assert.equal(w.a.logRead({ grant: "g-draft", viewer: VERA, op: "standingset", answer: {} }).reason, "GRANT_OP_REFUSED");
  assert.equal(w.a.readLog("g-draft").answered("INFO-OUT"), true);
  assert.deepEqual(tables(w), before, "a draft's reads write nothing: no tally, no row");
});
