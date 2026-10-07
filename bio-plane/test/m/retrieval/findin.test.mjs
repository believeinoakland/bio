/* retrieval: "Find in this" (R73–R75; T35-37, N698, DEC-164, K1468, DEC-99, DEC-98), at the module's interface.
 *
 * The readings, references, name terms and text units a find reads are written as `extraction` writes them (its R19,
 * R22, R58, R59), and the people and offices through the real `entities` module (its R1, R17). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE } from "./fixture.mjs";
import { retrievalRoutes, FIND_KINDS, FIND_MATCHERS, FIND_CAPTURES_PER_CALL, FIND_IDS_MAX, FIND_ITEMS_DEFAULT,
         FIND_ITEMS_MAX, FIND_WORDS_MAX, FIND_TERM_MAX, matchMoney, matchDates, matchRequirements }
  from "../../../src/retrieval/index.mjs";
import { entitiesOf } from "../../../src/entities/index.mjs";
import { labelTerms } from "../../../src/extraction/index.mjs";
import { parseFigure } from "../../../src/calc-grammar/index.mjs";

const EN = FIND_MATCHERS.en;

/* A world whose profile states English (`test-port-ellery`'s locale is en-GB), with the real entities module. */
function find(opts = {}) {
  let ents = null;
  const w = world({ before: (x) => { ents = entitiesOf(x.host, { record: x.record, membership: x.membership }); },
                    deps: { get entities() { return ents; } }, ...opts });
  w.entities = ents;
  if (opts.profile !== false) w.record.setSetting("jurisdiction_profiles", ["test-port-ellery"], "member:ann");
  /** A reading of a capture, as extraction's writer keeps it: the readings row and each reference with its terms. */
  w.read = (cap, bundleId, { contentType = "generic", entities = [], extra = {} } = {}) => {
    w.st.sql.exec(`INSERT OR REPLACE INTO readings (capture_sha, bundle_id, content_type, reader_version, found, entity_count, reading, at)
                   VALUES (?,?,?,1,?,?,?,?)`, cap.sha, bundleId, contentType, entities.length ? 1 : 0, entities.length,
      JSON.stringify({ content_type: contentType, entities, ...extra }), "2026-09-27T00:00:00Z");
    for (const e of entities) {
      const ref = `${e.kind}:${e.key}`;
      const { kind: pk, ref: pr, ...pos } = e.source || {};
      w.st.sql.exec(`INSERT INTO reading_refs (capture_sha, bundle_id, ref, ref_kind, ref_key, label, pos_kind, pos, pos_ref, occurrence, seq)
                     VALUES (?,?,?,?,?,?,?,?,?,?,0)`, cap.sha, bundleId, ref, e.kind, e.key, e.label ?? null,
        e.source ? pk : null, e.source ? JSON.stringify(pos) : null, e.source ? pr : null, e.source ? `${pk}:${JSON.stringify(pos)}` : "");
      for (const [src, str] of [["ref", ref], ["label", e.label]])
        for (const term of labelTerms(str || "")) w.st.sql.exec(`INSERT OR IGNORE INTO reading_ref_terms VALUES (?,?,?,?,?)`, cap.sha, bundleId, ref, src, term);
    }
  };
  return w;
}

const run = (w, args) => w.retrieval.findIn({ viewer: V("vera"), ...args });
const kindOf = (ans, k) => ans.kinds.find((x) => x.kind === k);
const tableCounts = (w) => w.rows(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '%fts%' ORDER BY name`)
  .map((t) => [t.name, w.count(t.name)]);

/* Two documents with a page each, and a project only ann sees holding a third. */
function corpus(opts) {
  const w = find(opts);
  const a = w.cap("a.pdf", "a bytes"), b = w.cap("b.pdf", "b bytes"), h = w.cap("h.pdf", "h bytes");
  w.doc("INFO-A", {}, { captures: [a] });
  w.doc("INFO-B", {}, { captures: [b] });
  const proj = w.project("Hidden", "ann", { captures: [h] });
  w.read(a, "INFO-A"); w.read(b, "INFO-B"); w.read(h, proj);
  w.unit(a.sha, "INFO-A", 0, "The Clerk shall publish the agenda within seven calendar days of the meeting. The budget is $4.2 million.");
  w.unit(a.sha, "INFO-A", 1, "Adopted on March 5, 2026 by the council.");
  w.unit(b.sha, "INFO-B", 0, "A plain page about parks and nothing else.");
  w.unit(h.sha, proj, 0, "The secret memo says $9 million is required to be spent by 2026-04-01.");
  return { w, a, b, h, proj };
}

test("R73: the refusals, in order, each writing nothing: VIEWER_MISSING, NO_SCOPE, SCOPE_UNKNOWN, CAPTURE_NOT_HELD, NO_SUCH_SELECTION, NO_SUCH_PROJECT, SCOPE_TOO_LARGE, NO_KINDS, KIND_UNKNOWN, NO_TERM, TERM_TOO_LONG", async () => {
  const { w, a, h, proj } = corpus();
  /* R69: the compile's zone read makes local-facts' instance on its first touch in a store where the plane's boot has
     not made it; a first find is run before the snapshot, as the plane has every module made before any request. */
  w.retrieval.findIn({ viewer: V("vera"), scope: { capture: a.sha }, kinds: ["term"], term: "x" });
  const before = tableCounts(w);
  const why = (args, viewer = V("vera")) => w.retrieval.findIn({ viewer, ...args }).reason;
  assert.equal(why({ scope: { capture: a.sha }, kinds: ["money"] }, null), "VIEWER_MISSING");
  assert.equal(why({ scope: { capture: a.sha }, kinds: ["money"] }, ""), "VIEWER_MISSING");
  assert.equal(why({ kinds: ["money"] }), "NO_SCOPE");
  assert.equal(why({ scope: {}, kinds: ["money"] }), "NO_SCOPE");
  for (const scope of [{ capture: a.sha, project: proj }, { bundle: "INFO-A" }, "INFO-A", [a.sha]])
    assert.equal(why({ scope, kinds: ["money"] }), "SCOPE_UNKNOWN", JSON.stringify(scope));
  assert.equal(why({ scope: { capture: "f".repeat(64) }, kinds: ["money"] }), "CAPTURE_NOT_HELD");
  /* A capture the viewer may not see answers exactly as one the record does not hold. */
  assert.deepEqual(w.retrieval.findIn({ viewer: V("vera"), scope: { capture: h.sha }, kinds: ["money"] }),
                   w.retrieval.findIn({ viewer: V("vera"), scope: { capture: "f".repeat(64) }, kinds: ["money"] }));
  assert.equal(why({ scope: { selection: "sel-nope" }, kinds: ["money"] }), "NO_SUCH_SELECTION");
  assert.equal(why({ scope: { project: "PROJ-none" }, kinds: ["money"] }), "NO_SUCH_PROJECT");
  assert.equal(why({ scope: { project: "INFO-A" }, kinds: ["money"] }), "NO_SUCH_PROJECT", "a bundle that is not a project");
  assert.deepEqual(w.retrieval.findIn({ viewer: V("vera"), scope: { project: proj }, kinds: ["money"] }),
                   w.retrieval.findIn({ viewer: V("vera"), scope: { project: "PROJ-none" }, kinds: ["money"] }), "hidden answers as absent");
  const big = w.retrieval.findIn({ viewer: V("vera"), scope: { ids: Array.from({ length: FIND_IDS_MAX + 1 }, (_, i) => `X-${i}`) }, kinds: ["money"] });
  assert.deepEqual([big.reason, big.limit, big.got], ["SCOPE_TOO_LARGE", FIND_IDS_MAX, FIND_IDS_MAX + 1]);
  assert.equal(why({ scope: { ids: Array.from({ length: FIND_IDS_MAX }, (_, i) => `X-${i}`) }, kinds: ["money"] }), undefined, "200 is accepted");
  assert.equal(why({ scope: { capture: a.sha } }), "NO_KINDS");
  assert.equal(why({ scope: { capture: a.sha }, kinds: [] }), "NO_KINDS");
  const unknown = w.retrieval.findIn({ viewer: V("vera"), scope: { capture: a.sha }, kinds: ["money", "vibes"] });
  assert.deepEqual([unknown.reason, unknown.kinds], ["KIND_UNKNOWN", FIND_KINDS]);
  assert.equal(why({ scope: { capture: a.sha }, kinds: ["term"] }), "NO_TERM");
  assert.equal(why({ scope: { capture: a.sha }, kinds: ["term"], term: "  " }), "NO_TERM");
  assert.equal(why({ scope: { capture: a.sha }, kinds: ["term"], term: "x".repeat(FIND_TERM_MAX + 1) }), "TERM_TOO_LONG");
  assert.equal(why({ scope: { capture: a.sha }, kinds: ["term"], term: "x".repeat(FIND_TERM_MAX) }), undefined);
  /* The order: the scope is judged before the kinds, the kinds before the term. */
  assert.equal(why({ scope: { capture: "f".repeat(64) }, kinds: ["vibes"] }), "CAPTURE_NOT_HELD");
  assert.equal(why({ scope: { capture: a.sha }, kinds: ["vibes", "term"] }), "KIND_UNKNOWN");
  assert.deepEqual(tableCounts(w), before, "a refusal writes nothing");
});

test("R73: a scope of each form — a capture, a selection (read under its owner, never extended), an enumerated set of bundle ids and capture shas, a project's holdings — answers its captures in capture-sha order", async () => {
  const { w, a, b, h, proj } = corpus();
  const shas = (ans) => [...new Set(ans.kinds.flatMap((k) => k.items.map((i) => i.capture_sha)))].sort();
  const one = run(w, { scope: { capture: a.sha }, kinds: ["term"], term: "the" });
  assert.deepEqual([one.ok, one.scope, one.captures_read, one.next], [true, { form: "capture", capture: a.sha, captures: 1 }, 1, null]);
  const ids = run(w, { scope: { ids: ["INFO-A", b.sha, "INFO-NONE", h.sha] }, kinds: ["term"], term: "page" });
  assert.equal(ids.scope.captures, 2, "INFO-A's capture and b; the hidden capture and the absent id leave");
  assert.deepEqual(shas(ids), [b.sha]);
  const sel = await w.retrieval.selectionCreate({ owner: V("vera"), viewer: V("vera"), ids: ["INFO-A", "INFO-B"] });
  const expires = w.row(`SELECT expires FROM selections WHERE handle=?`, sel.handle).expires;
  w.clock.sel += 1000;
  const bySel = run(w, { scope: { selection: sel.handle }, kinds: ["term"], term: "page" });
  assert.deepEqual([bySel.ok, bySel.scope.captures], [true, 2]);
  assert.equal(w.row(`SELECT expires FROM selections WHERE handle=?`, sel.handle).expires, expires, "the selection's life is not extended");
  assert.equal(run(w, { scope: { selection: sel.handle }, kinds: ["term"], term: "page", owner: V("ann") }).reason, "NOT_YOURS");
  w.clock.sel += 400000;
  assert.equal(run(w, { scope: { selection: sel.handle }, kinds: ["term"], term: "page" }).reason, "NO_SUCH_SELECTION", "expired");
  const byProj = w.retrieval.findIn({ viewer: V("ann"), scope: { project: proj }, kinds: ["money"] });
  assert.deepEqual([byProj.ok, byProj.scope.captures], [true, 1]);
  assert.deepEqual(kindOf(byProj, "money").items.map((i) => i.capture_sha), [h.sha]);
  /* A bundle filed in the project is part of its holdings. */
  const inProj = w.cap("p2.pdf", "p2");
  w.doc("INFO-P", { project: proj }, { captures: [inProj], author: V("ann") });
  assert.ok(w.row(`SELECT bundle_id FROM bundles WHERE project = ?`, proj), "the bundle is filed in the project");
  assert.equal(w.retrieval.findIn({ viewer: V("ann"), scope: { project: proj }, kinds: ["money"] }).scope.captures, 2);
  assert.equal(w.retrieval.findIn({ viewer: V("vera"), scope: { ids: [inProj.sha] }, kinds: ["money"] }).scope.captures, 0,
    "a capture filed in the project is hidden as the project is");
  assert.ok([a, b].every((c) => c.sha));
});

test("R73, R29: a capture the viewer may not see, in an enumerated set or a selection, is left out and counted nowhere — every answer is byte-identical to one where it is absent; the participant sees it", async () => {
  const w = find();
  const a = w.cap("a.pdf", "a");
  w.doc("INFO-A", {}, { captures: [a] });
  w.read(a, "INFO-A");
  w.unit(a.sha, "INFO-A", 0, "The fee is $10 and the clerk shall collect it on 2026-01-02.");
  const h = w.cap("h.pdf", "h");
  const args = (extra) => ({ scope: { ids: ["INFO-A", h.sha, ...extra] }, kinds: [...FIND_KINDS], term: "fee" });
  const before = JSON.stringify(run(w, args([])));
  const proj = w.project("Hidden fee", "ann", { captures: [h] });
  w.read(h, proj);
  w.unit(h.sha, proj, 0, "The hidden fee is $99 and staff shall pay it on 2026-03-04.");
  assert.equal(JSON.stringify(run(w, args([]))), before, "byte-identical for the viewer outside the project");
  const sel = await w.retrieval.selectionCreate({ owner: V("vera"), viewer: V("vera"), ids: ["INFO-A", proj] });
  const viaSel = run(w, { scope: { selection: sel.handle }, kinds: ["money"] });
  assert.deepEqual([viaSel.scope.captures, kindOf(viaSel, "money").items.map((i) => i.capture_sha)],
    [1, [kindOf(JSON.parse(before), "money").items[0].capture_sha]], "a selection never carries the hidden capture in");
  const ann = w.retrieval.findIn({ viewer: V("ann"), ...args([proj]) });
  assert.equal(ann.scope.captures, 2);
  assert.ok(kindOf(ann, "money").items.some((i) => i.capture_sha === h.sha));
  /* An unrecognised viewer sees no capture at all. */
  assert.equal(w.retrieval.findIn({ viewer: "garbage", scope: { capture: a.sha }, kinds: ["money"] }).reason, "CAPTURE_NOT_HELD");
});

test("R73, R74 (DEC-98): a kind with nothing says Nothing here only when every capture was read for it; beside it a kind with an unread capture lists it in not_read with why and never says Nothing here", () => {
  const w = find();
  const read = w.cap("r.pdf", "r"), unread = w.cap("u.pdf", "u");
  w.doc("INFO-R", {}, { captures: [read] });
  w.doc("INFO-U", {}, { captures: [unread] });
  w.read(read, "INFO-R");
  w.unit(read.sha, "INFO-R", 0, "Nothing of interest is said on this page.");
  const ans = run(w, { scope: { ids: ["INFO-R", "INFO-U"] }, kinds: ["money", "events"] });
  const money = kindOf(ans, "money"), events = kindOf(ans, "events");
  assert.deepEqual([money.count, money.nothing, money.says], [0, false, undefined]);
  assert.deepEqual(money.not_read, [{ capture_sha: unread.sha, why: "not extracted: no reading of this capture is held" }]);
  assert.deepEqual(events.not_read.map((n) => [n.capture_sha, n.why]).sort(),
    [[read.sha, "not minutes or an agenda"], [unread.sha, "not extracted: no reading of this capture is held"]].sort());
  const alone = run(w, { scope: { capture: read.sha }, kinds: ["money", "requirements"] });
  for (const k of ["money", "requirements"]) {
    const x = kindOf(alone, k);
    assert.deepEqual([x.count, x.nothing, x.says, x.not_read, x.truncated], [0, true, "Nothing here", [], false], k);
  }
  /* A read capture with no text is not "Nothing here" either. */
  const blank = w.cap("blank.pdf", "b");
  w.doc("INFO-BLANK", {}, { captures: [blank] });
  w.read(blank, "INFO-BLANK");
  const x = kindOf(run(w, { scope: { capture: blank.sha }, kinds: ["dates"] }), "dates");
  assert.deepEqual([x.nothing, x.not_read[0].why], [false, "no text: this capture's reading holds no text to search"]);
});

test("R74 people, R74 term (DEC-164 (7)): a followed person or office is found by its held name, with the entity and how it corresponded, nothing resolved; a name no registered entity holds is found only as a word, under term", () => {
  const w = find();
  const c = w.cap("m.pdf", "m");
  w.doc("INFO-M", {}, { captures: [c] });
  w.read(c, "INFO-M", { entities: [
    { kind: "person", key: "p1", label: "Jane Roe", source: { kind: "pdf-page", ref: "page 1", page: 0, rect: null } },
    { kind: "person", key: "p2", label: "Ignatius Unfollowed" },
  ] });
  w.unit(c.sha, "INFO-M", 0, "Present: Jane Roe and Ignatius Unfollowed. The City Clerk read the minutes.");
  const jane = w.entities.createEntity({ kind: "person", label: "Jane Roe", note: "a council member", declaredBy: "member:ann" });
  const inst = w.entities.createEntity({ kind: "institution", label: "Ignatius Unfollowed", note: "not a person", declaredBy: "member:ann" });
  assert.equal(jane.ok && inst.ok, true);
  const resolutions = w.count("resolutions");
  const ans = run(w, { scope: { capture: c.sha }, kinds: ["people", "term"], term: "Ignatius Unfollowed" });
  const people = kindOf(ans, "people");
  assert.equal(people.count, 1);
  const [p] = people.items;
  assert.deepEqual([p.kind, p.words, p.capture_sha, p.extent, p.origin, p.entity.entity_id, p.correspondence],
    ["people", "Jane Roe", c.sha, { page: 0, rect: null, kind: "pdf-page" }, "search", jane.entity_id, "name"]);
  const term = kindOf(ans, "term");
  assert.equal(term.count, 1);
  assert.deepEqual([term.items[0].extent, term.items[0].origin], [{ kind: "pdf-page", page: 0 }, "search"]);
  assert.match(term.items[0].words, /Ignatius Unfollowed/);
  assert.equal(w.count("resolutions"), resolutions, "nothing is resolved");
  /* An unplaced reference carries no extent, with why, never the whole document. */
  w.entities.createEntity({ kind: "office", label: "Ignatius Unfollowed", note: "now followed", declaredBy: "member:ann" });
  const later = kindOf(run(w, { scope: { capture: c.sha }, kinds: ["people"] }), "people");
  const ig = later.items.find((i) => i.words === "Ignatius Unfollowed");
  assert.deepEqual([ig.extent, typeof ig.extent_why, ig.entity.kind], [null, "string", "office"]);
});

test("R74 people (K1972; entities R52): the followed people and offices are looked for by one namingIn read per page of captures, never per entity and never capped by count; truncated is namingIn's page, and a truncated kind never says Nothing here", () => {
  const w = find();
  const c = w.cap("m.pdf", "m"), d = w.cap("n.pdf", "n");
  w.doc("INFO-M", {}, { captures: [c, d] });
  w.read(c, "INFO-M", { entities: [{ kind: "person", key: "z", label: "Zed Last", source: { kind: "pdf-page", ref: "page 1", page: 0, rect: null } }] });
  w.read(d, "INFO-M", { entities: [{ kind: "person", key: "y", label: "Yan First", source: { kind: "pdf-page", ref: "page 1", page: 0, rect: null } }] });
  for (let i = 0; i < 201; i++) w.entities.createEntity({ kind: "office", label: `Office ${i}`, note: "n", declaredBy: "member:ann" });
  w.entities.createEntity({ kind: "person", label: "Zed Last", note: "n", declaredBy: "member:ann" });
  w.entities.createEntity({ kind: "person", label: "Yan First", note: "n", declaredBy: "member:ann" });
  const calls = { namingIn: [], namingDocuments: 0 };
  const realIn = w.entities.namingIn.bind(w.entities), realDocs = w.entities.namingDocuments.bind(w.entities);
  w.entities.namingIn = (a) => { calls.namingIn.push(a); return realIn(a); };
  w.entities.namingDocuments = (a) => { calls.namingDocuments++; return realDocs(a); };
  const all = kindOf(run(w, { scope: { ids: ["INFO-M"] }, kinds: ["people"] }), "people");
  assert.deepEqual(all.items.map((i) => i.words).sort(), ["Yan First", "Zed Last"], "the 202nd and 203rd followed entities are found");
  assert.deepEqual([all.truncated, "truncated_why" in all], [false, false]);
  assert.equal(calls.namingIn.length, 1, "one read for the page");
  assert.deepEqual([calls.namingIn[0].captureShas.slice().sort(), calls.namingIn[0].kinds, calls.namingIn[0].viewer],
                   [[c.sha, d.sha].sort(), ["person", "office"], V("vera")]);
  assert.equal(calls.namingDocuments, 0, "never one lookup per entity");
  const cut = kindOf(run(w, { scope: { ids: ["INFO-M"] }, kinds: ["people"], limit: 1 }), "people");
  assert.deepEqual([cut.count, cut.truncated, cut.nothing], [1, true, false]);
  assert.equal(calls.namingIn[1].limit, 1, "the kind's own limit is namingIn's page");
});

test("R74 money, dates, requirements over fixed English fixtures: each match with its words, extent and origin; the same matches twice; never a force; a deadline's period only where stated plainly, never a due date", () => {
  const { w, a } = corpus();
  const once = run(w, { scope: { capture: a.sha }, kinds: ["money", "dates", "requirements"] });
  assert.deepEqual(run(w, { scope: { capture: a.sha }, kinds: ["money", "dates", "requirements"] }), once, "the same input gives the same matches");
  const money = kindOf(once, "money").items;
  assert.equal(money.length, 1);
  assert.deepEqual([money[0].as_read, money[0].figure, money[0].extent, money[0].origin, money[0].words],
    ["$4.2 million", parseFigure("$4.2 million"), { kind: "pdf-page", page: 0 }, "search", "The budget is $4.2 million."]);
  const dates = kindOf(once, "dates").items;
  assert.deepEqual(dates.map((d) => [d.as_read, d.date, d.deadline ?? false, d.period ?? null]),
    [["within seven calendar days", null, true, { amount: 7, units: "calendar days" }], ["March 5, 2026", "2026-03-05", false, null]]);
  const reqs = kindOf(once, "requirements").items;
  assert.deepEqual(reqs.map((r) => [r.words, r.requirement_word]),
    [["The Clerk shall publish the agenda within seven calendar days of the meeting.", "shall"]]);
  assert.ok(reqs.every((r) => !("force" in r)), "never labelled a force");
  /* The matchers themselves, pure. */
  const m = matchMoney("Costs: USD 12, €30, 5 million dollars, $5k, 1.5 bn and 40 apples.", EN);
  assert.deepEqual(m.map((x) => [x.as_read, x.figure && x.figure.value]),
    [["USD 12", "12"], ["€30", "30"], ["5 million dollars", "5000000"], ["$5k", "5000"]]);
  const d = matchDates("On 5 March 2026, 2026-02-31, 3/4/2026 and in June 2026, within thirty (30) days after notice; no later than 10 business days.", EN);
  assert.deepEqual(d.map((x) => [x.as_read, x.date, x.period ?? null, typeof x.date_why]),
    [["5 March 2026", "2026-03-05", null, "undefined"], ["2026-02-31", null, null, "string"], ["3/4/2026", null, null, "string"],
     ["June 2026", null, null, "string"], ["within thirty (30) days", null, { amount: 30, units: "days" }, "undefined"],
     ["no later than 10 business days", null, { amount: 10, units: "business days" }, "undefined"]]);
  const r = matchRequirements("Staff may not enter. The board may meet. Applicants are required to file; the fee must be paid!", EN);
  assert.deepEqual(r.map((x) => x.requirement_word), ["may not", "are required to", "must"]);
});

test("R75 (DEC-99): the matchers' words are held per language in FIND_MATCHERS, frozen, English held; a capture whose language has no set is in not_read for money, dates and requirements with 'no matcher for <language> yet', never matched with English; with no language stated none is assumed", () => {
  assert.ok(Object.isFrozen(FIND_MATCHERS) && Object.isFrozen(EN) && Object.isFrozen(EN.money.signs) && Object.isFrozen(EN.dates.months[0]));
  assert.deepEqual(Object.keys(FIND_MATCHERS), ["en"]);
  assert.throws(() => { "use strict"; EN.requirements.push("ought"); });
  for (const s of JSON.stringify(FIND_MATCHERS).match(/[A-Z][a-z]+/g) || []) assert.ok(!/Oakland|Alameda|California/.test(s), "R34: no place");
  const w = find();
  const fr = w.cap("fr.pdf", "fr");
  w.doc("INFO-FR", {}, { captures: [fr] });
  w.read(fr, "INFO-FR", { extra: { language: "fr-FR" } });
  w.unit(fr.sha, "INFO-FR", 0, "Le conseil shall payer $5 le March 5, 2026.");
  const ans = run(w, { scope: { capture: fr.sha }, kinds: ["money", "dates", "requirements", "term"], term: "conseil" });
  for (const k of ["money", "dates", "requirements"])
    assert.deepEqual([kindOf(ans, k).count, kindOf(ans, k).not_read], [0, [{ capture_sha: fr.sha, why: "no matcher for fr yet" }]], k);
  assert.equal(kindOf(ans, "term").count, 1, "a term is matched as written in any language");
  const bare = find({ profile: false });
  const c = bare.cap("c.pdf", "c");
  bare.doc("INFO-C", {}, { captures: [c] });
  bare.read(c, "INFO-C");
  bare.unit(c.sha, "INFO-C", 0, "It costs $5.");
  const none = kindOf(run(bare, { scope: { capture: c.sha }, kinds: ["money"] }), "money");
  assert.deepEqual([none.count, none.nothing], [0, false]);
  assert.match(none.not_read[0].why, /no matcher .* language/);
});

test("R74 (K1468): a sheet's amount column and date column are each one result naming the table — its capture, extent, column and row count, its words the header — never one item per row; other cells are matched on their own words", () => {
  const w = find();
  const x = w.cap("book.xlsx", "x");
  w.doc("INFO-X", {}, { captures: [x] });
  const cell = (c, value, type) => ({ source: { kind: "sheet-cell", ref: `Budget!${c}`, sheet: "Budget", cell: c }, value, type,
                                      declared: null, cached: null, formula: null });
  w.read(x, "INFO-X", { extra: { cells: { Budget: [
    cell("A1", "Item", "text"), cell("B1", "Amount (USD)", "text"), cell("C1", "Paid on", "text"), cell("D1", "Note", "text"),
    cell("A2", "Paving", "text"), cell("B2", "1200.50", "number"), cell("C2", "2026-01-05", "date"), cell("D2", "about $30 extra", "text"),
    cell("A3", "Lights", "text"), cell("B3", "800", "number"), cell("C3", "2026-02-06", "date"),
    cell("A4", "Signs", "text"), cell("B4", "95", "number"), cell("C4", "2026-03-07", "date"),
  ] } } });
  w.unit(x.sha, "INFO-X", 0, "Item Amount (USD) Paid on Paving 1200.50 2026-01-05 about $30 extra", { kind: "sheet-range", sheet: "Budget", range: "A1:D4" });
  const ans = run(w, { scope: { capture: x.sha }, kinds: ["money", "dates"] });
  const money = kindOf(ans, "money").items, dates = kindOf(ans, "dates").items;
  assert.deepEqual(money.map((i) => i.table ? ["table", i.words, i.table.column, i.table.rows, i.extent.range] : ["cell", i.as_read, i.extent.cell]),
    [["table", "Amount (USD)", "B", 3, "B2:B4"], ["cell", "$30", "D2"]]);
  assert.deepEqual(money[0].table.capture_sha, x.sha);
  assert.deepEqual(dates.map((i) => i.table ? ["table", i.words, i.table.column, i.table.rows] : ["cell", i.as_read]),
    [["table", "Paid on", "C", 3]]);
  assert.ok([...money, ...dates].every((i) => i.origin === "search" && i.capture_sha === x.sha && i.extent));
  /* A table in a document, whose cells its reading does not hold, is one result naming the table, column unstated. */
  const d = w.cap("t.docx", "t");
  w.doc("INFO-T", {}, { captures: [d] });
  w.read(d, "INFO-T");
  w.unit(d.sha, "INFO-T", 0, "Year Total\n2025 $10\n2026 $12", { kind: "doc-table", table: 0 });
  const t = kindOf(run(w, { scope: { capture: d.sha }, kinds: ["money"] }), "money").items;
  assert.deepEqual(t.map((i) => [i.table.column, i.table.rows, typeof i.table.column_why, i.words]), [[null, null, "string", "Year Total"]]);
});

test("R74 events: the items, motions and votes the minutes and agenda readers read, as extraction holds the reading, each with the reader's item fields as given; a capture of another type is in not_read with 'not minutes or an agenda'", () => {
  const w = find();
  const m = w.cap("min.pdf", "m"), g = w.cap("g.pdf", "g");
  w.doc("INFO-MIN", {}, { captures: [m] });
  w.doc("INFO-G", {}, { captures: [g] });
  const facts = { outcome: "adopted", moved_by: "Roe", seconded_by: "Doe", result: "carried", vote: { aye: 4, no: 1 } };
  w.read(m, "INFO-MIN", { contentType: "meeting_minutes", entities: [
    { kind: "legislation", key: "26-0844", label: "Resolution on paving", facts, source: { kind: "pdf-page", ref: "page 3", page: 2, rect: null } },
    { kind: "legislation", key: "26-0845", label: "Item two", facts: {} },
  ] });
  w.read(g, "INFO-G", { contentType: "generic" });
  const ans = kindOf(run(w, { scope: { ids: ["INFO-MIN", "INFO-G"] }, kinds: ["events"] }), "events");
  assert.deepEqual(ans.items.map((i) => [i.words, i.item.key, i.item.facts, i.extent, i.capture_sha, i.origin]),
    [["Resolution on paving", "26-0844", facts, { kind: "pdf-page", page: 2, rect: null }, m.sha, "search"],
     ["Item two", "26-0845", {}, null, m.sha, "search"]]);
  assert.equal(typeof ans.items[1].extent_why, "string");
  assert.deepEqual(ans.not_read, [{ capture_sha: g.sha, why: "not minutes or an agenda" }]);
  assert.equal(ans.nothing, false);
});

test("R73: words are at most 500 characters, cut at a word with …, the whole extent kept; limit bounds each kind's items (1–500, default 50) with truncated by reading one past", () => {
  const w = find();
  const c = w.cap("long.pdf", "l");
  w.doc("INFO-L", {}, { captures: [c] });
  w.read(c, "INFO-L");
  const long = `${"word ".repeat(150)}shall end here.`;
  w.unit(c.sha, "INFO-L", 0, long);
  const items = Array.from({ length: 60 }, (_, i) => `$${i + 1}`).join(", ");
  w.unit(c.sha, "INFO-L", 1, `Amounts ${items}.`);
  const req = kindOf(run(w, { scope: { capture: c.sha }, kinds: ["requirements"] }), "requirements").items[0];
  assert.ok(req.words.length <= FIND_WORDS_MAX && req.words.endsWith("…") && !req.words.endsWith(" …"));
  assert.ok(long.startsWith(req.words.slice(0, -1)), "cut at a word");
  assert.deepEqual(req.extent, { kind: "pdf-page", page: 0 }, "the whole extent kept");
  const def = run(w, { scope: { capture: c.sha }, kinds: ["money"] });
  assert.deepEqual([def.limit, kindOf(def, "money").count, kindOf(def, "money").truncated], [FIND_ITEMS_DEFAULT, 50, true]);
  const all = kindOf(run(w, { scope: { capture: c.sha }, kinds: ["money"], limit: 60 }), "money");
  assert.deepEqual([all.count, all.truncated, all.nothing], [60, false, false]);
  const cut = kindOf(run(w, { scope: { capture: c.sha }, kinds: ["money"], limit: 59 }), "money");
  assert.deepEqual([cut.count, cut.truncated], [59, true]);
  assert.equal(run(w, { scope: { capture: c.sha }, kinds: ["money"], limit: 10 ** 6 }).limit, FIND_ITEMS_MAX);
  assert.equal(run(w, { scope: { capture: c.sha }, kinds: ["money"], limit: 0 }).limit, 1);
});

test("R73: at most 200 captures are read per call, in capture-sha order, next naming where to continue and null when the scope is done; a paged scope never says Nothing here", () => {
  const w = find();
  const caps = Array.from({ length: FIND_CAPTURES_PER_CALL + 5 }, (_, i) => w.cap(`c${i}.pdf`, `bytes ${i}`));
  w.doc("INFO-MANY", {}, { captures: caps });
  for (const c of caps) w.read(c, "INFO-MANY");
  const order = caps.map((c) => c.sha).sort();
  const p1 = run(w, { scope: { ids: ["INFO-MANY"] }, kinds: ["money"] });
  assert.deepEqual([p1.scope.captures, p1.captures_read, p1.next], [caps.length, FIND_CAPTURES_PER_CALL, order[FIND_CAPTURES_PER_CALL - 1]]);
  assert.equal(kindOf(p1, "money").not_read.length, FIND_CAPTURES_PER_CALL, "no text held: each is unread");
  assert.deepEqual(kindOf(p1, "money").not_read.map((n) => n.capture_sha), order.slice(0, FIND_CAPTURES_PER_CALL));
  const p2 = run(w, { scope: { ids: ["INFO-MANY"] }, kinds: ["money"], cursor: p1.next });
  assert.deepEqual([p2.captures_read, p2.next], [5, null]);
  assert.deepEqual(kindOf(p2, "money").not_read.map((n) => n.capture_sha), order.slice(FIND_CAPTURES_PER_CALL));
  for (const c of caps) w.unit(c.sha, "INFO-MANY", 0, "nothing to see");
  const again = run(w, { scope: { ids: ["INFO-MANY"] }, kinds: ["money"], cursor: p1.next });
  assert.equal(kindOf(again, "money").nothing, false, "a later page does not know the earlier pages had no match");
});

test("R73, R32: a find writes nothing — no selection, no observation row, no fact, no reading, no content row (row counts and rows unchanged) — and calls no model", async () => {
  const { w, a } = corpus();
  const sel = await w.retrieval.selectionCreate({ owner: V("vera"), viewer: V("vera"), q: "" });
  w.entities.createEntity({ kind: "person", label: "Clerk", note: "n", declaredBy: "member:ann" });
  const snap = () => JSON.stringify(w.rows(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '%fts%' ORDER BY name`)
    .map((t) => [t.name, w.rows(`SELECT * FROM "${t.name}"`)]));
  run(w, { scope: { capture: a.sha }, kinds: ["term"], term: "x" });   /* R69's first touch, as above */
  const before = snap();
  for (const scope of [{ capture: a.sha }, { selection: sel.handle }, { ids: ["INFO-A", "INFO-B"] }])
    assert.equal(run(w, { scope, kinds: [...FIND_KINDS], term: "agenda" }).ok, true);
  assert.equal(snap(), before);
});

test("R73: op=findin through retrievalRoutes answers exactly what findIn answers, the scope and kinds from the body or the query, the viewer and owner the control plane's stamps", () => {
  const { w, a } = corpus();
  const route = (qs, body) => retrievalRoutes(w.retrieval, new URL(`http://x/?${qs}`), body).findin();
  const want = w.retrieval.findIn({ viewer: V("vera"), scope: { capture: a.sha }, kinds: ["money", "term"], term: "budget", limit: 5 });
  assert.deepEqual(route(`viewer=${encodeURIComponent(V("vera"))}`, { scope: { capture: a.sha }, kinds: ["money", "term"], term: "budget", limit: 5 }), want);
  assert.deepEqual(route(`viewer=${encodeURIComponent(V("vera"))}&scope=${encodeURIComponent(JSON.stringify({ capture: a.sha }))}&kinds=money,term&term=budget&limit=5`, null), want);
  assert.equal(route(`scope=${encodeURIComponent(JSON.stringify({ capture: a.sha }))}&kinds=money`, null).reason, "VIEWER_MISSING");
  assert.equal(route(`viewer=${MACHINE}&kinds=money`, { scope: null }).reason, "NO_SCOPE");
});
