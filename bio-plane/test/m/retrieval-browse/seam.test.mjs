/* retrieval-browse: the seam and the invariants (R14–R18; T51-29; K61, K624, N1212; P4), at the module's interface: the module
 * built with stand-in host reads and nothing of `retrieval` loaded, a host read it was not handed refused by name, and what it
 * never does — show what is hidden, write, name a place, run a search statement of its own. */
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { world, V, MACHINE } from "./fixture.mjs";
import { retrievalBrowseOf, RetrievalBrowse, FIND_KINDS, FIND_MATCHERS, BROWSE_SCOPES } from "../../../src/retrieval-browse/index.mjs";

const INDEX = new URL("../../../src/retrieval-browse/index.mjs", import.meta.url).href;
const para = (n) => ({ kind: "doc-para", para: n });
const kindOf = (ans, k) => ans.kinds.find((x) => x.kind === k);
/* Every table but the fixture's own stand-in projection (the stand-in `planOf` fills it when asked). */
const tables = (w) => JSON.stringify(w.rows(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '%fts%' AND name <> 'standin_projection' ORDER BY name`)
  .map((t) => [t.name, w.rows(`SELECT * FROM "${t.name}"`)]));

/* One document with an amount, a requirement and the word "fee", and a hidden project holding another. */
function corpus(deps = {}) {
  const w = world({ deps });
  const a = w.cap("a.pdf", "a bytes"), h = w.cap("h.pdf", "h bytes");
  w.doc("INFO-A", { title: "The fee schedule" }, { captures: [a] });
  const proj = w.project("Hidden fee", "ann", { captures: [h] });
  w.doc("INFO-HIDE", { project: proj, title: "Filed in the hidden project" }, { author: V("ann") });
  for (const [c, b] of [[a, "INFO-A"], [h, proj]])
    w.st.sql.exec(`INSERT INTO readings (capture_sha, bundle_id, content_type, reader_version, found, entity_count, reading, at)
                   VALUES (?,?,'generic',1,0,0,?,'t')`, c.sha, b, JSON.stringify({ content_type: "generic", entities: [] }));
  w.unit(a.sha, "INFO-A", 0, "The fee is $40 and the Clerk shall publish it.", para(0));
  w.unit(h.sha, proj, 0, "The hidden fee is $99.", para(0));
  return { w, a, h, proj };
}

test("R14 (K61, P4): retrievalBrowseOf answers the one instance per Durable Object storage, built from stand-in deps with nothing of retrieval loaded — it answers findIn (R1) and browse (R10), and its module graph holds no file of retrieval", () => {
  const { w, a } = corpus();
  assert.ok(w.rb instanceof RetrievalBrowse);
  assert.equal(retrievalBrowseOf({ sql: w.st.sql, ...w.host_reads }), w.rb, "one instance per storage");
  for (const m of ["findIn", "browse", "scopeMembers", "registerRecordedBy", "registerBrowseMarks"]) assert.equal(typeof w.rb[m], "function", m);
  const found = w.rb.findIn({ viewer: V("vera"), scope: { capture: a.sha }, kinds: ["money", "term"], term: "fee" });
  assert.deepEqual([found.ok, kindOf(found, "money").items.map((m) => m.as_read), kindOf(found, "term").items.length], [true, ["$40"], 1]);
  assert.deepEqual(w.rb.browse({ viewer: V("vera") }).items.map((i) => i.id), ["INFO-A"]);
  /* The module graph, loaded in a process of its own, names no file of retrieval (a later module, P4). */
  const loaded = JSON.parse(execFileSync(process.execPath, ["--input-type=module", "-e", `
    import { registerHooks } from "node:module";
    const seen = [];
    registerHooks({ resolve(specifier, context, next) { const r = next(specifier, context); seen.push(r.url); return r; } });
    const m = await import(${JSON.stringify(INDEX)});
    console.log(JSON.stringify({ built: typeof m.retrievalBrowseOf, retrieval: seen.filter((u) => /\\/src\\/retrieval\\//.test(u)), n: seen.length }));
  `], { encoding: "utf8" }));
  assert.deepEqual([loaded.built, loaded.retrieval], ["function", []]);
  assert.ok(loaded.n > 5, "the graph was observed");
  /* The seam: a store without a Durable Object's sql is no module. */
  assert.throws(() => retrievalBrowseOf({}), /deps\.sql/);
});

test("R14: a host read the module was not handed is a refusal named in the answer, never a throw — a find needs sight and localeOf (selectionRead for a selection scope; planOf and runQuery for the term kind); a browse needs none of them", () => {
  const { w, a } = corpus();
  const bare = (drop) => {
    const reads = { ...w.host_reads };
    for (const d of drop) delete reads[d];
    return new RetrievalBrowse({ sql: w.st.sql, membership: w.membership, host: w.host, recorders: {}, ...reads });
  };
  const ask = (rb, scope, kinds, term) => rb.findIn({ viewer: V("vera"), scope, kinds, term });
  for (const [drop, scope, kinds] of [[["sight"], { capture: a.sha }, ["money"]], [["localeOf"], { capture: a.sha }, ["money"]],
                                      [["selectionRead"], { selection: "s" }, ["money"]], [["planOf"], { capture: a.sha }, ["term"]],
                                      [["runQuery"], { capture: a.sha }, ["term"]]]) {
    const ans = ask(bare(drop), scope, kinds, "fee");
    assert.deepEqual([ans.ok, ans.reason, ans.missing.includes(drop[0])], [false, "HOST_READ_MISSING", true], drop[0]);
    assert.match(ans.detail, new RegExp(drop[0]));
  }
  /* Control: a host read only another kind or scope needs does not refuse this one. */
  assert.equal(ask(bare(["planOf", "runQuery", "selectionRead"]), { capture: a.sha }, ["money"]).ok, true);
  const none = bare(["sight", "planOf", "runQuery", "localeOf", "selectionRead"]);
  assert.deepEqual(none.missing(["sight", "planOf", "runQuery", "localeOf", "selectionRead"]).length, 5);
  assert.deepEqual(none.browse({ viewer: V("vera") }).items.map((i) => i.id), ["INFO-A"], "a browse reads the store alone");
  assert.equal(none.scopeMembers({ scope: "everything", viewer: V("vera") }).ok, true);
});

test("R15: hidden answers as absent everywhere — a find, a browse and a scope read count and list nothing the viewer may not see, and none states how much was withheld: the answers are byte-identical to ones from a store where the hidden project was never made", () => {
  const withHidden = corpus(), without = (() => {
    const w = world();
    const a = w.cap("a.pdf", "a bytes");
    w.doc("INFO-A", { title: "The fee schedule" }, { captures: [a] });
    w.st.sql.exec(`INSERT INTO readings (capture_sha, bundle_id, content_type, reader_version, found, entity_count, reading, at)
                   VALUES (?,?,'generic',1,0,0,?,'t')`, a.sha, "INFO-A", JSON.stringify({ content_type: "generic", entities: [] }));
    w.unit(a.sha, "INFO-A", 0, "The fee is $40 and the Clerk shall publish it.", para(0));
    return { w, a };
  })();
  const same = (f) => assert.equal(JSON.stringify(f(withHidden.w, withHidden.a)), JSON.stringify(f(without.w, without.a)));
  same((w, a) => w.rb.findIn({ viewer: V("vera"), scope: { ids: ["INFO-A", withHidden.h.sha] }, kinds: [...FIND_KINDS].filter((k) => k !== "people"), term: "fee" }));
  same((w) => w.rb.browse({ viewer: V("vera") }));
  same((w) => w.rb.browse({ viewer: V("vera"), only: "awaiting_review" }));
  for (const s of BROWSE_SCOPES) same((w) => w.rb.scopeMembers({ scope: s.key, viewer: V("vera") }));
  assert.deepEqual(withHidden.w.rb.browse({ viewer: V("ann") }).items.map((i) => i.id).sort(), ["INFO-A", "INFO-HIDE"], "the participant lists it");
  assert.equal(withHidden.w.rb.browse({ viewer: V("ann") }).total, 2, "and counts it");
  assert.equal(withHidden.w.rb.browse({ viewer: MACHINE }).ok, true);
});

test("R16 (DEC-24): nothing here mints, cites, promotes or calls a model — a find, a browse, a scope read and every registration write no row of any table, and a browse moves no looked-at mark", () => {
  const { w, a } = corpus();
  /* The recording modules make their tables on the first find in a store the plane's boot has not made them in (R14). */
  w.rb.findIn({ viewer: V("vera"), scope: { capture: a.sha }, kinds: ["term"], term: "x" });
  const before = tables(w);
  w.rb.registerRecordedBy("citation", () => ({ ok: true, items: [], truncated: false }));
  w.rb.registerBrowseMarks("following", () => ({ items: [], truncated: false, watched: [], flagged: [] }));
  for (let i = 0; i < 2; i++) {
    w.rb.browse({ viewer: V("vera") });
    w.rb.browse({ viewer: V("vera"), only: "awaiting_review" });
    for (const s of BROWSE_SCOPES) w.rb.scopeMembers({ scope: s.key, viewer: V("vera") });
    assert.equal(w.rb.findIn({ viewer: V("vera"), scope: { capture: a.sha }, kinds: [...FIND_KINDS], term: "fee" }).ok, true);
  }
  assert.equal(tables(w), before);
  assert.deepEqual(w.rows(`SELECT * FROM content`), [], "no content row is minted by a find");
});

test("R17: no place is named in this module's behaviour or outward text — the matcher sets, every refusal's code and detail and the words a scope or a browse answers name no city, county or state", () => {
  const { w, a } = corpus();
  const texts = [JSON.stringify(FIND_MATCHERS), JSON.stringify(BROWSE_SCOPES)];
  const refusals = [w.rb.findIn({}), w.rb.findIn({ viewer: V("vera") }), w.rb.findIn({ viewer: V("vera"), scope: { capture: "f".repeat(64) }, kinds: ["money"] }),
    w.rb.findIn({ viewer: V("vera"), scope: { capture: a.sha }, kinds: ["vibes"] }), w.rb.browse({}), w.rb.browse({ viewer: V("vera"), only: "x" }),
    w.rb.scopeMembers({ viewer: V("vera"), scope: "cases" }), w.rb.browse({ viewer: V("vera"), only: "watched" })];
  texts.push(JSON.stringify(refusals));
  for (const t of texts) assert.doesNotMatch(t, /Oakland|Alameda|California|Berkeley|San Francisco/);
  assert.ok(refusals.slice(0, 7).every((r) => r.ok === false));
});

test("R18 (retrieval R28): no search statement runs here without the gate's mark — the term kind runs only a statement the host's planOf compiled and its runQuery executed, and the module builds no SQL of its own for a search; a statement without the mark is refused by the executor", () => {
  const compiled = new Set(), ran = [], seenSql = [];
  const { w, a } = corpus();
  const spy = {
    ...w.host_reads,
    planOf: (input) => { const p = w.host_reads.planOf(input); const meaning = p.statements.meaning; compiled.add(meaning); return { ...p, statements: { ...p.statements, meaning: (...x) => { const s = meaning(...x); compiled.add(s); return s; } } }; },
    runQuery: (stmt, tally) => { ran.push(stmt); return w.host_reads.runQuery(stmt, tally); },
  };
  const sql = { exec: (q, ...args) => { seenSql.push(q); return w.st.sql.exec(q, ...args); } };
  const rb = new RetrievalBrowse({ sql, membership: w.membership, host: w.host, recorders: {}, ...spy });
  const ans = rb.findIn({ viewer: V("vera"), scope: { capture: a.sha }, kinds: ["term"], term: "fee" });
  assert.equal(kindOf(ans, "term").items.length, 1);
  assert.ok(ran.length >= 1 && ran.every((s) => compiled.has(s)), "every executed statement is one planOf compiled");
  assert.ok(!seenSql.some((q) => /\bMATCH\b|capture_text_fts/i.test(q)), "the module's own SQL never searches the text index");
  /* A statement without the gate's mark never runs: the host's executor refuses it, and the find does not swallow that. */
  const ungated = new RetrievalBrowse({ sql: w.st.sql, membership: w.membership, host: w.host, recorders: {}, ...w.host_reads,
    planOf: (input) => ({ statements: { meaning: () => ({ sql: "SELECT 1 AS capture_sha", args: [] }) } }) });
  assert.throws(() => ungated.findIn({ viewer: V("vera"), scope: { capture: a.sha }, kinds: ["term"], term: "fee" }), /visibility gate/);
});
