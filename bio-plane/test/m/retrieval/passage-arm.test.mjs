/* retrieval: the `passage:` arm read through retrieval (R11, R13–R15, R28, R29, R54), at the module's interface.
 *
 * Converted from the old battery's `test/passage-arm.test.mjs` (REC-92, REC-115). Its retrieval share is what the
 * module answers when it runs the arm: `passage:` and `text:` as two questions over two sets at bundle grain (§3, §9),
 * the matched units at passage grain with their row columns and `content_id` as an address (§4, §5), the answer with no
 * `passage:` term (§9), the gate over passages (§7, staged here against a project the fixture can hold), and the
 * four-level statement whose scope is the query's other arms, with its content-level sentence and the empties told
 * apart (§8, §10). The compiler's own shape (§1, §2, the plan-text checks of §7, §9 and §10) is query-language's, the
 * schema-text checks are extraction's, and the tally's buckets are already proven in `meaning.test.mjs`. The units are
 * written as extraction's index writes them. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, T0 } from "./fixture.mjs";

/* One observation of a capture at the content level: `extract` for its extraction, `derive` for its index. */
const ex = (w, c, bundle, state = "PRESENT") => w.observe({ level: "content", subject_kind: "capture", subject: c.sha,
  authority_kind: "extract", authority: bundle, state });
const ix = (w, c, bundle, state = "PRESENT") => w.observe({ level: "content", subject_kind: "capture", subject: c.sha,
  authority_kind: "derive", authority: bundle, state });
/* A unit whose per-unit flag and chain step are the test's to say (the fixture's `unit` writes 0 and 'layer'). */
const unitAs = (w, capSha, bundleId, seq, text, { truncated = 0, chain = "layer" } = {}) => {
  const extent = { kind: "pdf-page", page: seq };
  w.st.sql.exec(`INSERT INTO capture_text (capture_sha, bundle_id, extent_kind, extent, ref, seq, text, truncated, chain_kind)
                 VALUES (?,?,?,?,?,?,?,?,?)`, capSha, bundleId, extent.kind, JSON.stringify(extent), `page ${seq + 1}`, seq,
    text, truncated, chain);
};
/* One content row over an extent, as content mints it. */
const mint = (w, capSha, bundleId, page, id, { stale = 0 } = {}) => w.st.sql.exec(
  `INSERT INTO content (content_id, capture_sha, bundle_id, extent_kind, extent, ref, chain, derivation_cap, page_count,
   minted_by, at, stale) VALUES (?,?,?, 'pdf-page', ?, ?, NULL, NULL, NULL, 'member:ann', ?, ?)`,
  id, capSha, bundleId, JSON.stringify({ kind: "pdf-page", page }), `page ${page + 1}`, T0, stale);

const ids = (w, q, viewer = V("vera")) => w.retrieval.search({ q, viewer, mode: "ids" }).ids;
const rowsOf = (w, q, viewer = V("vera")) => w.retrieval.meaningRows({ q, rows: "passage", viewer });

test("R15: at bundle grain passage: finds a term that is only in a captured page and text: does not, while text: finds a frontmatter term; passage:* is the documents holding indexed text; a word in no unit narrows to nothing; passage: and text: compose as one conjunction; searching mints no content row", () => {
  const w = world();
  const pkt = w.cap("packet.pdf", "packet bytes");
  w.doc("INFO-PKT", {}, { captures: [pkt] });
  w.unit(pkt.sha, "INFO-PKT", 0, "quorum absent and hydrostatic pressure rising");
  w.unit(pkt.sha, "INFO-PKT", 1, "appropriation of the reserve fund");
  w.doc("INFO-PLAIN", {}, { files: [{ path: "n.md", text: "a note about the reserve" }] });
  const before = w.count("content");
  assert.deepEqual(ids(w, "passage:hydrostatic"), ["INFO-PKT"]);
  assert.deepEqual(ids(w, "text:hydrostatic"), [], "the group's own text does not hold it");
  assert.deepEqual(ids(w, "text:Document").sort(), ["INFO-PKT", "INFO-PLAIN"], "text: is not blind: the titles hold it");
  assert.deepEqual(ids(w, "text:note"), ["INFO-PLAIN"], "and text: never reads a page");
  assert.deepEqual(ids(w, "passage:*"), ["INFO-PKT"], "presence: only the document with indexed text");
  assert.deepEqual(ids(w, "passage:zzqx"), []);
  assert.deepEqual(ids(w, "passage:hydrostatic text:Document"), ["INFO-PKT"]);
  assert.deepEqual(ids(w, "passage:hydrostatic text:note"), [], "two arms, two tables, one conjunction");
  assert.equal(w.retrieval.search({ q: "passage:reserve", viewer: V("vera"), mode: "count" }).total, 1);
  assert.equal(w.count("content"), before, "searching mints nothing");
});

test("R11, R15, R54: rows=passage answers only the units that matched — one of a document's three — with count and total agreeing; each row carries its extent, ref, seq, chain_kind and per-unit truncated flag as written and a snippet centred on the term; content_id is the live content row's id for the extent, null where none (a stale one included); nothing is minted", () => {
  const w = world();
  const pkt = w.cap("packet.pdf", "packet bytes"), big = w.cap("big.pdf", "big bytes");
  w.doc("INFO-PKT", {}, { captures: [pkt] });
  w.doc("INFO-BIG", {}, { captures: [big] });
  unitAs(w, pkt.sha, "INFO-PKT", 0, "the layer read this page as quorum absent and hydrostatic pressure rising");
  unitAs(w, pkt.sha, "INFO-PKT", 1, "and this page as appropriation of the reserve fund", { chain: "ocr" });
  unitAs(w, pkt.sha, "INFO-PKT", 2, "a third page that mentions neither term at all");
  unitAs(w, big.sha, "INFO-BIG", 0, "hydrostatic " + "x ".repeat(200), { truncated: 1 });
  unitAs(w, big.sha, "INFO-BIG", 1, "hydrostatic a short page");
  mint(w, pkt.sha, "INFO-PKT", 0, "C-live");
  mint(w, big.sha, "INFO-BIG", 0, "C-stale", { stale: 1 });
  const before = w.count("content");
  const one = rowsOf(w, "passage:reserve");
  assert.deepEqual([one.ok, one.arm, one.table, one.level, one.count, one.total], [true, "passage", "capture_text", "content", 1, 1]);
  assert.deepEqual([one.rows[0].bundle_id, JSON.parse(one.rows[0].extent), one.rows[0].extent_kind, one.rows[0].ref,
                    one.rows[0].seq, one.rows[0].chain_kind, one.rows[0].truncated, one.rows[0].content_id],
    ["INFO-PKT", { kind: "pdf-page", page: 1 }, "pdf-page", "page 2", 1, "ocr", 0, null]);
  assert.match(one.rows[0].snippet, /\[reserve\]/);
  assert.equal(one.levels.content.matched, true, "the rows matched a term");
  const h = rowsOf(w, "passage:hydrostatic");
  assert.deepEqual([h.count, h.total], [3, 3]);
  const by = Object.fromEntries(h.rows.map((r) => [`${r.bundle_id}/${JSON.parse(r.extent).page}`, r]));
  assert.deepEqual(Object.keys(by).sort(), ["INFO-BIG/0", "INFO-BIG/1", "INFO-PKT/0"]);
  assert.deepEqual([by["INFO-BIG/0"].truncated, by["INFO-BIG/1"].truncated], [1, 0], "the flag is per unit");
  assert.deepEqual([by["INFO-PKT/0"].content_id, by["INFO-BIG/0"].content_id, by["INFO-BIG/1"].content_id], ["C-live", null, null]);
  assert.ok(h.rows.every((r) => /\[hydrostatic\]/.test(r.snippet)), "every snippet centres on the term");
  /* Paging stays at the unit grain. */
  const p1 = w.retrieval.meaningRows({ q: "passage:hydrostatic", rows: "passage", viewer: V("vera"), limit: 2 });
  const p2 = w.retrieval.meaningRows({ q: "passage:hydrostatic", rows: "passage", viewer: V("vera"), limit: 2, offset: 2 });
  assert.deepEqual([p1.count, p1.total, p2.count], [2, 3, 1]);
  assert.deepEqual([...p1.rows, ...p2.rows].map((r) => `${r.bundle_id}/${r.extent}`), h.rows.map((r) => `${r.bundle_id}/${r.extent}`));
  assert.equal(w.count("content"), before, "searching mints nothing");
});

test("R13, R14: rows=passage with no passage: term is answered, not refused — every indexed unit in scope, snippet null on every row, matched false, and the content level says the query carried no passage: selector; passage:* reads the same", () => {
  const w = world();
  const a = w.cap("a.pdf", "a"), b = w.cap("b.pdf", "b");
  w.doc("INFO-1", {}, { captures: [a], files: [{ path: "n.md", text: "scopeprobe" }] });
  w.doc("INFO-2", {}, { captures: [b] });
  w.unit(a.sha, "INFO-1", 0, "first page"); w.unit(a.sha, "INFO-1", 1, "second page");
  w.unit(b.sha, "INFO-2", 0, "other document");
  for (const q of ["text:scopeprobe", "passage:* text:scopeprobe"]) {
    const r = rowsOf(w, q);
    assert.deepEqual([r.ok, r.count, r.total], [true, 2, 2], q);
    assert.deepEqual(r.rows.map((x) => [x.bundle_id, x.seq, x.snippet]), [["INFO-1", 0, null], ["INFO-1", 1, null]], q);
    assert.equal(r.levels.content.matched, false, q);
    assert.match(r.levels.content.why, /no `passage:` selector/, q);
    assert.match(r.levels.content.why, /Coverage: /, q);
  }
  assert.equal(rowsOf(w, "").total, 3, "no arm at all: every unit the viewer may see");
});

/* A scope staged for the four-level statement: a fully indexed document and a never-read one sharing `scopeprobe`, a
   second fully indexed one alone under `fullprobe`. The level's first row predates every registration, so a capture
   with no row is never_looked. */
function scoped() {
  const w = world();
  w.observe({ level: "content", subject_kind: "capture", subject: "0".repeat(64), authority_kind: "extract", state: "PRESENT",
              at: "2026-09-26T00:00:00Z" });
  const read = w.cap("read.pdf", "r"), unread = w.cap("unread.pdf", "u"), full = w.cap("full.pdf", "f");
  w.doc("INFO-READ", {}, { captures: [read], files: [{ path: "n.md", text: "scopeprobe" }] });
  w.doc("INFO-UNREAD", {}, { captures: [unread], files: [{ path: "n.md", text: "scopeprobe unreadprobe" }] });
  w.doc("INFO-FULL", {}, { captures: [full], files: [{ path: "n.md", text: "fullprobe" }] });
  ex(w, read, "INFO-READ"); ix(w, read, "INFO-READ");
  ex(w, full, "INFO-FULL"); ix(w, full, "INFO-FULL");
  w.unit(read.sha, "INFO-READ", 0, "a page about culverts");
  w.unit(full.sha, "INFO-FULL", 0, "a page about drainage easements");
  return w;
}

test("R13, R14: the scope of a passage answer is the query's other arms — a miss counts the documents they select (agreeing with the bundle-grain count and with captures_counted) rather than the arm's own empty result; documents_with_rows counts the documents in that scope holding any indexed text, on a miss and a hit alike, and the three document counts agree", () => {
  const w = scoped();
  const miss = rowsOf(w, "passage:zzqx text:scopeprobe");
  const scope = ids(w, "text:scopeprobe");
  assert.equal(scope.length, 2);
  assert.deepEqual([miss.total, miss.scope.documents, miss.scope.documents_with_rows, miss.scope.captures_counted],
    [0, scope.length, 1, 2], "INFO-READ holds text; INFO-UNREAD holds none");
  assert.deepEqual([miss.scope.indexed_full, miss.scope.not_extracted, miss.scope.not_read], [1, 1, { never_looked: 1, undetermined: 0 }]);
  const hit = rowsOf(w, "passage:culverts");
  assert.deepEqual([hit.total, hit.scope.documents, hit.scope.documents_with_rows, hit.scope.documents_without_rows],
    [1, 3, 2, 1], "the scope is every document, not those that matched");
  assert.equal(hit.scope.documents_without_rows, hit.scope.documents - hit.scope.documents_with_rows);
  assert.equal(hit.scope.captures_counted, 3, "the tally ranges over the same scope");
  const none = rowsOf(w, "passage:zzqx text:nosuchprobe");
  assert.deepEqual([none.total, none.scope.documents, none.scope.captures_counted], [0, 0, 0], "the true zero survives");
});

test("R13, R14: says tells the empties and the hits apart — no document in scope; nothing searchable (read them next); searched but a remainder unread (the absence covers only the part read); every capture searchable (the absence is about the documents); a hit with and without an unread remainder — each leading with coverage", () => {
  const w = scoped();
  const noDoc = rowsOf(w, "passage:zzqx text:nosuchprobe").says;
  const blind = rowsOf(w, "passage:zzqx text:unreadprobe");
  const partial = rowsOf(w, "passage:zzqx text:scopeprobe").says;
  const clean = rowsOf(w, "passage:zzqx text:fullprobe").says;
  const hitGap = rowsOf(w, "passage:culverts text:scopeprobe").says;
  const hitClean = rowsOf(w, "passage:easements text:fullprobe").says;
  assert.match(noDoc, /no document was in scope .* empty DOCUMENT level, not an empty record/);
  assert.equal(blind.scope.documents, 1);
  assert.match(blind.says, /^Coverage: .*NOTHING IN SCOPE WAS SEARCHABLE.*The next move is to read them/);
  assert.match(partial, /^Coverage: .*Nothing matched over 1 searchable capture\(s\) in scope, but 1 further capture\(s\) in scope have not been read at passage grain.*covers only the part of the record that has been read/);
  assert.doesNotMatch(partial, /no document was in scope|NOTHING IN SCOPE WAS SEARCHABLE/);
  assert.match(clean, /^Coverage: .*Nothing matched over 1 searchable capture\(s\) in scope, and every capture in scope can be searched at passage grain — this absence is about the documents/);
  assert.match(hitGap, /^Coverage: .*1 passage\(s\) matched over 2 document\(s\) in scope, and 1 capture\(s\) in that scope have not been read at passage grain/);
  assert.match(hitClean, /^Coverage: .*1 passage\(s\) matched over 1 document\(s\) in scope, over a scope every capture of which can be searched/);
  assert.equal(new Set([noDoc, blind.says, partial, clean, hitGap, hitClean]).size, 6, "every sentence is its own");
});

test("R13, R14: a passage miss's content level is the coverage of the text index, never the citation sentence a content: answer gives over the same scope; the internet level is named undetermined", () => {
  const w = scoped();
  const miss = rowsOf(w, "passage:zzqx text:scopeprobe");
  const cited = w.retrieval.meaningRows({ q: "text:scopeprobe", rows: "content", viewer: V("vera") });
  assert.deepEqual([miss.level, miss.levels.content.state, miss.levels.content.matched], ["content", "COUNTED", true]);
  assert.match(miss.levels.content.why, /THE ABSENCE OF A HIT IS NOT EVIDENCE OF ABSENCE UNTIL THE COVERAGE IS READ/);
  assert.match(miss.levels.content.why, /1 never extracted — nobody has read them/);
  assert.doesNotMatch(miss.levels.content.why, /cited/);
  assert.match(cited.levels.content.why, /cited or marked citable/);
  assert.notEqual(miss.levels.content.why, cited.levels.content.why);
  assert.equal(miss.levels.internet.state, "UNDETERMINED");
  assert.equal(miss.levels.meaning.state, "UNDETERMINED");
});

test("R29, R28: a passage in a project the viewer is not in is withheld whole — no row, total, bundle id, snippet or tally capture — and every answer is byte-identical to one where it is absent; the participant sees it; an absent or unrecognised viewer gets no row and a zero tally", () => {
  const w = scoped();
  const answers = (viewer) => JSON.stringify([
    rowsOf(w, "passage:culverts", viewer), rowsOf(w, "passage:zzqx", viewer), rowsOf(w, "", viewer), rowsOf(w, "passage:*", viewer),
    w.retrieval.search({ q: "passage:culverts", viewer, mode: "ids" }), w.retrieval.search({ q: "passage:*", viewer }),
    w.retrieval.search({ q: "passage:culverts", viewer, mode: "count" })]);
  const before = answers(V("vera"));
  const hid = w.cap("secret.pdf", "s");
  const proj = w.project("Culvert Secret", "ann", { captures: [hid] });
  ex(w, hid, proj); ix(w, hid, proj);
  w.unit(hid.sha, proj, 0, "a secret page about culverts");
  assert.equal(answers(V("vera")), before, "byte-identical for the viewer outside the project");
  const ann = rowsOf(w, "passage:culverts", V("ann"));
  assert.deepEqual([ann.total, ann.rows.map((r) => r.bundle_id).sort()], [2, ["INFO-READ", proj].sort()]);
  assert.equal(rowsOf(w, "passage:zzqx", V("ann")).scope.captures_counted, 4);
  assert.deepEqual(ids(w, "passage:culverts", V("ann")).sort(), ["INFO-READ", proj].sort());
  for (const viewer of [null, "", "somebody"]) {
    const r = rowsOf(w, "passage:culverts", viewer);
    assert.deepEqual([r.ok, r.count, r.total, r.scope.documents, r.scope.captures_counted, r.gate.scope],
      [true, 0, 0, 0, 0, "DENY"], String(viewer));
    assert.deepEqual(ids(w, "passage:*", viewer), [], String(viewer));
  }
});
