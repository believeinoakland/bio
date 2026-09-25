/* NEGATIVE CONTROL: (run 2026-09-25, REC-206; each arm ALONE, restored by sha256 + cmp) BASELINE 42/42; A LABEL (membership presented as the publisher's: asserted_by source, standing publisher) -> 4 fail, every one a "REC-206 LABEL" or the label-check naming arm; B LINKS (derived pairs pushed into links[]) -> 2 fail incl. "REC-206 PUBLISHER GRAPH"; C CONTAIN (page ignored) -> 5 fail incl. M-120's grouping; D ANCHOR (nothing inside) -> 8 fail, no rect assertion; E RECT (rect always null) -> 4 fail, no anchor or membership assertion; BASELINE after 42/42. FINDING: arm A did NOT make the op withhold, because checkMembershipLabel reads MEMBERSHIP_LABEL itself — the literal-valued LABEL assertions are what bind the label. */
/* REC-206 — POSITIONAL TEXT AND DERIVED MEMBERSHIP (BOB #32, 2026-09-23 23:30Z;
 * `BIO_Content_Framework_v0_10.md` §16, "Positional text").
 *
 * Three things, each driven where a caller reaches it:
 *   1. every tier-1 text LINE carries its page and rect, and a page's lines
 *      rejoin to its text character for character (`pdfstructure.mjs` `linesOf`);
 *   2. every LinkRecord carries its ANCHOR TEXT, read off tier 1's placed
 *      glyphs, with a named `why` whenever the reading is not complete
 *      (`anchorOf`);
 *   3. `op=pdfstructure` serves an agenda's item-to-file MEMBERSHIP derived
 *      from containment, LABELLED machine work, graded C / inferred, never
 *      established and never inside `links[]` (`membership.mjs`).
 *
 * The synthetic fixtures are derivable by hand: every glyph is 500/1000 em at
 * 10 pt, so one glyph is 5 pt of advance and one em is 10 pt tall. The real
 * fixture is M-120's own agenda (`legistar-agenda-1425405.pdf`, sha
 * 16cb1adf…), whose grouping M-120 took by an independent instrument; the
 * per-item counts asserted below are M-120's printed figures, not this code's.
 *
 * NEGATIVE CONTROL (REC-206, 2026-09-25; each arm ALONE on a clean tree,
 * restored by `cp` from a per-arm pristine copy and verified by sha256 + cmp):
 *   BASELINE  — unmodified: every assertion passes.
 *   A LABEL   — `membership.mjs` MEMBERSHIP_LABEL `asserted_by: "system"` ->
 *               `"source"` and `standing: "inferred"` -> `"publisher"` (the
 *               membership PRESENTED AS THE PUBLISHER'S LINK). MUST FAIL:
 *               "REC-206 LABEL ..." (op and unit). MUST NOT FAIL: rect, anchor,
 *               grouping assertions.
 *   B LINKS   — the op pushes each derived pair into `links[]` as a deferred
 *               LinkRecord. MUST FAIL: "REC-206 PUBLISHER GRAPH ...".
 *   C CONTAIN — `deriveMembership` orders by rect only, ignoring the page.
 *               MUST FAIL: the M-120 grouping assertion.
 *   D ANCHOR  — `anchorOf`'s `inside` always false. MUST FAIL: the anchor
 *               assertions. MUST NOT FAIL: rect assertions.
 *   E RECT    — `linesOf` emits `rect: null` always. MUST FAIL: the rect
 *               assertions. MUST NOT FAIL: anchor and membership assertions.
 *   OVER-STRICTNESS — correct work in an unanticipated spelling (upper-case
 *               `HTTP://…/Gateway.aspx?M=L&ID=…`) MUST PASS, asserted below.
 * Declared and actual results are recorded in the REC-206 report.
 */
import "./stdio.mjs";                 /* D-282 */
import "./sandbox.mjs";               /* D-186 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { extractPdfStructure } from "../src/pdfstructure.mjs";
import { deriveMembership, checkMembershipLabel, MEMBERSHIP_LABEL } from "../src/membership.mjs";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const hex = (b) => createHash("sha256").update(b).digest("hex");

/* ---- a hand-built PDF: one page, one font, one content stream, links ---- */
function pdf(objs) {
  const chunks = [Buffer.from("%PDF-1.7\n", "latin1")];
  for (const o of objs) {
    chunks.push(Buffer.from(`${o.num} 0 obj\n`, "latin1"));
    if (o.stream) {
      chunks.push(Buffer.from(o.head + "\nstream\n", "latin1"), o.stream, Buffer.from("\nendstream\n", "latin1"));
    } else chunks.push(Buffer.from(o.body + "\n", "latin1"));
    chunks.push(Buffer.from("endobj\n", "latin1"));
  }
  chunks.push(Buffer.from("%%EOF\n", "latin1"));
  return new Uint8Array(Buffer.concat(chunks));
}
const CMAP = `/CIDInit /ProcSet findresource begin 12 dict begin begincmap
/CMapName /Adobe-Identity-UCS def
1 begincodespacerange
<00> <FF>
endcodespacerange
8 beginbfchar
<01> <0048>
<02> <0065>
<03> <006C>
<04> <006F>
<05> <0020>
<06> <0077>
<07> <0072>
<08> <0064>
endbfchar
endcmap CMapName currentdict /CMap defineresource pop end end`;
const WIDTH_FONT = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /FirstChar 1 /LastChar 8 " +
                   "/Widths [500 500 500 500 500 500 500 500] /ToUnicode 6 0 R >>";
const NO_WIDTH_FONT = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /ToUnicode 6 0 R >>";
function textPdf({ content, fontBody = WIDTH_FONT, rects = [] }) {
  const annots = rects.map((_, i) => `${10 + i} 0 R`).join(" ");
  const objs = [
    { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
    { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
    { num: 3, body: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R /Annots [${annots}] >>` },
  ];
  const c = Buffer.from(content, "latin1");
  objs.push({ num: 4, head: `<< /Length ${c.length} >>`, stream: c });
  objs.push({ num: 5, body: fontBody });
  const m = Buffer.from(CMAP, "latin1");
  objs.push({ num: 6, head: `<< /Length ${m.length} >>`, stream: m });
  rects.forEach((r, i) => objs.push({ num: 10 + i,
    body: `<< /Type /Annot /Subtype /Link /Rect [${r.join(" ")}] /A << /S /URI /URI (https://example.gov/${i}) >> >>` }));
  return pdf(objs);
}
const HELLO = "<0102030304>";   // H e l l o — 5 glyphs, 25 pt at 10 pt
const WORLD = "<0604070308>";   // w o r l d

console.log("\n--- 1. a tier-1 LINE carries its page and rect, derivable by hand ---");
{
  /* "Hello" from x=72 to 97 on baseline 700, then a 175 pt jump (D-502 splits
     it) to "world" at 272..297. The line is ONE unit; its rect is the union of
     the non-whitespace glyphs' em boxes: [72,700] to [297,710]. A second line
     at baseline 680 is its own unit. */
  const out = await extractPdfStructure(textPdf({
    content: "BT /F1 10 Tf 72 700 Td " + HELLO + " Tj 200 0 Td " + WORLD + " Tj 0 -20 Td " + WORLD + " Tj ET",
  }));
  const p = out.text.pages[0];
  t("the page text is D-502's, unchanged", p.text, "Hello world\nworld");
  t("two lines, each with its page", p.lines.map((l) => [l.page, l.text]), [[0, "Hello world"], [0, "world"]]);
  t("line 1's rect is the em-box union, by hand", p.lines[0].rect, [72, 700, 297, 710]);
  t("line 2's rect: 'world' after the pen advanced 25 pt past 272, down 20", p.lines[1].rect, [272, 680, 297, 690]);
  t("the lines rejoin to the page text, character for character",
    p.lines.map((l) => l.text).join("\n"), p.text);
  t("no linesWhy when lines are served", "linesWhy" in p, false);

  /* The pen is UNKNOWN for a font that declares no widths (D-502): the rect is
     NULL rather than a box drawn round the one glyph that could be placed. */
  const nw = await extractPdfStructure(textPdf({ content: "BT /F1 10 Tf 72 700 Td " + HELLO + " Tj ET", fontBody: NO_WIDTH_FONT }));
  t("a font with no widths: the line is served, its rect is NULL", nw.text.pages[0].lines, [{ page: 0, text: "Hello", rect: null }]);
}

console.log("\n--- 2. a LinkRecord carries its ANCHOR TEXT, and says when it is not complete ---");
{
  const out = await extractPdfStructure(textPdf({
    content: "BT /F1 10 Tf 72 700 Td " + HELLO + " Tj 200 0 Td " + WORLD + " Tj ET",
    rects: [[70, 695, 100, 715], [270, 695, 300, 715], [70, 695, 300, 715], [300, 300, 400, 320]],
  }));
  const a = out.links.map((l) => l.anchor);
  t("a link over 'Hello' reads 'Hello'", a[0], { text: "Hello", why: null, tier: 1 });
  t("a link over 'world' reads 'world'", a[1], { text: "world", why: null, tier: 1 });
  t("a link over both reads both, one space between", a[2], { text: "Hello world", why: null, tier: 1 });
  t("a link over nothing reads NULL and names why", a[3], { text: null, why: "no_text_in_rect", tier: 1 });
  t("the anchor rides beside the wrapper and target, which are unchanged",
    [out.links[0].partition, out.links[0].target.url, out.counts.deferred], ["deferred", "https://example.gov/0", 4]);

  const nw = await extractPdfStructure(textPdf({ content: "BT /F1 10 Tf 72 700 Td " + HELLO + " Tj ET",
    fontBody: NO_WIDTH_FONT, rects: [[300, 300, 400, 320]] }));
  /* The glyph after the first cannot be placed, so ABSENCE under this rect is
     not established: `positions_unknown`, never `no_text_in_rect`. */
  t("with glyphs it could not place, an empty rect is positions_unknown", nw.links[0].anchor,
    { text: null, why: "positions_unknown", tier: 1 });
}

console.log("\n--- 3. membership, unit: containment across a page break, and the unplaced ---");
const L = (url, page, rect, text = null) => ({ partition: "deferred", wrapper: null, target: { url },
  source: { page, rect }, anchor: { text, why: null, tier: 1 } });
const ITEM = (k) => `https://oakland.legistar.com/gateway.aspx?m=l&id=/matter.aspx?key=${k}`;
const FILE = (g) => `https://oakland.legistar.com/gateway.aspx?M=F&ID=${g}.pdf`;
{
  const s = { links: [
    L(FILE("early"), 0, [50, 750, 90, 760]),          // above the first item: unplaced
    L(ITEM(1), 0, [50, 700, 90, 710], "26-0001"),
    L(FILE("a"), 0, [60, 650, 90, 660]),
    L(ITEM(2), 0, [50, 100, 90, 110], "26-0002"),
    L(FILE("b"), 1, [60, 740, 90, 750]),              // next page's top: still item 2's region
    L("https://example.gov/other", 0, [60, 600, 90, 610]),
  ] };
  const m = deriveMembership(s).membership;
  t("two items, in page-then-top order", m.items.map((g) => g.item.anchor.text), ["26-0001", "26-0002"]);
  t("item 1 contains the file below it", m.items[0].files.map((f) => f.url), [FILE("a")]);
  t("item 2's region crosses the page break", m.items[1].files.map((f) => f.url), [FILE("b")]);
  t("a file above the first item is UNPLACED, never assigned",
    m.unplaced.map((u) => [u.url, u.why]), [[FILE("early"), "above_the_first_item"]]);
  t("a link of no known shape is neither item nor file", JSON.stringify(m).includes("example.gov/other"), false);
  t("the region is stated", m.items[0].region, { from: { page: 0, top: 710 }, to: { page: 0, top: 110 } });
  t("no known item shape: membership NULL with its reason",
    deriveMembership({ links: [L("https://example.gov/x", 0, [0, 0, 1, 1])] }), { membership: null, why: "no_item_links_of_a_known_shape" });

  /* OVER-STRICTNESS: the same publisher address in another spelling. */
  const up = deriveMembership({ links: [
    L("HTTP://oakland.legistar.com/Gateway.aspx?M=L&ID=/matter.aspx?key=9", 0, [50, 700, 90, 710]),
    L("http://oakland.legistar.com/gateway.aspx?m=f&id=zz.pdf", 0, [50, 600, 90, 610]),
  ] }).membership;
  t("OVER-STRICTNESS: an upper-case, http spelling is still recognised and grouped",
    up && up.items.map((g) => g.files.length), [1]);

  /* THE LABEL CHECK, which the op consults before it serves anything. */
  t("checkMembershipLabel passes a derived membership", checkMembershipLabel(m), null);
  t("checkMembershipLabel NAMES a membership presented as the publisher's",
    checkMembershipLabel({ ...m, asserted_by: "source" }), "membership.asserted_by");
  t("checkMembershipLabel names a PAIR presented as established",
    checkMembershipLabel({ ...m, items: [{ ...m.items[0], established: true }] }), "membership.items[0].established");
  t("REC-206 LABEL (unit): the label is machine work, system-asserted, grade C, inferred, not established",
    [MEMBERSHIP_LABEL.derived, MEMBERSHIP_LABEL.work, MEMBERSHIP_LABEL.asserted_by, MEMBERSHIP_LABEL.grade,
     MEMBERSHIP_LABEL.standing, MEMBERSHIP_LABEL.established],
    ["containment", "machine", "system", "C", "inferred", false]);
}

console.log("\n--- 4. THROUGH THE OP: M-120's agenda, its anchors, and its derived membership ---");
const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { VERSION: "test", ADMIN_TOKEN: "adm-rec206", MEMBER_TOKEN: "mem-rec206", PROBE_TOKEN: "prb-rec206" },
});
try {
  const j = async (p, init) => (await mf.dispatchFetch("http://x" + p, init)).json();
  const agenda = new Uint8Array(readFileSync(new URL("./fixtures/legistar-agenda-1425405.pdf", import.meta.url)));
  const sha = hex(agenda);
  t("the fixture is M-120's agenda, by sha", sha, "16cb1adf6d35116dbc475ae39ac1757f28cd549e7ff5b7f6d5bb7c660503570c");
  await j(`/api/capture?token=mem-rec206&sha256=${sha}`, { method: "PUT", body: agenda });
  const s = await j(`/api/pdfstructure?token=mem-rec206&sha256=${sha}`);
  t("op=pdfstructure answers ok, tier 1", [s.ok, s.tier], [true, 1]);

  const lines = s.text.pages.flatMap((p) => p.lines || []);
  console.log(`  (fixture: ${s.pages} pages, ${lines.length} lines, ${s.links.length} links)`);
  t("FLOOR: the agenda yields more than 1,000 positioned lines", lines.filter((l) => l.rect).length > 1000, true);
  t("every page's lines rejoin to its text", s.text.pages.every((p) => Array.isArray(p.lines)
    && p.lines.map((l) => l.text).join("\n") === p.text), true);
  t("every rect is ordered and inside the page's 612x792 box", lines.filter((l) => l.rect).every((l) => l.rect[0] <= l.rect[2] && l.rect[1] <= l.rect[3]
      && l.rect[0] >= 0 && l.rect[2] <= 612 && l.rect[1] >= 0 && l.rect[3] <= 792), true);
  t("a line with a NULL rect is whitespace only", lines.filter((l) => !l.rect).every((l) => /^\s*$/.test(l.text)), true);

  const items = s.links.filter((l) => /matter\.aspx/.test(l.target.url || ""));
  t("the 41 item links each read their own file number as anchor text",
    [items.length, items.every((l) => /^\d{2}-\d{4}$/.test(l.anchor.text) && l.anchor.why === null)], [41, true]);
  t("the first item link reads 26-0844", items[0].anchor.text, "26-0844");
  t("every one of 159 anchors is a complete reading", s.links.every((l) => l.anchor && l.anchor.why === null), true);

  const m = s.membership;
  t("REC-206 LABEL (op): the membership reads derived, machine work, system-asserted, grade C, inferred, NOT established",
    m && [m.derived, m.work, m.asserted_by, m.grade, m.standing, m.established],
    ["containment", "machine", "system", "C", "inferred", false]);
  t("REC-206 LABEL (op): EVERY pair carries the same label, so one lifted out still says what it is",
    m && m.items.every((g) => g.derived === "containment" && g.work === "machine" && g.asserted_by === "system"
      && g.grade === "C" && g.standing === "inferred" && g.established === false), true);
  t("REC-206 LABEL (op): the basis says the publisher linked neither end",
    m && /never the publisher's own link/.test(m.basis), true);
  t("REC-206 PUBLISHER GRAPH: links[] is exactly the publisher's 159, all deferred, none derived",
    [s.links.length, s.counts.deferred, s.links.every((l) => !("files" in l) && !("region" in l) && !("derived" in l))],
    [159, 159, true]);
  t("M-120's grouping, item by item (M-120's independent instrument's figures)",
    m && m.items.map((g) => g.files.length).join(","),
    "1,0,0,0,0,0,0,0,2,1,2,3,3,2,4,4,4,3,3,2,6,4,2,2,3,4,1,2,2,2,2,4,4,3,7,3,4,2,8,3,16");
  t("41 items, 118 files placed, none unplaced", m && m.counts, { items: 41, placed: 118, unplaced: 0 });
  t("the first item's file is 'View Report', by its anchor", m && m.items[0].files.map((f) => f.anchor.text), ["View Report"]);

  /* A PDF with no item links: no membership, and the reason served. */
  const plain = textPdf({ content: "BT /F1 10 Tf 72 700 Td " + HELLO + " Tj ET", rects: [[70, 695, 100, 715]] });
  await j(`/api/capture?token=mem-rec206&sha256=${hex(plain)}`, { method: "PUT", body: plain });
  const ps = await j(`/api/pdfstructure?token=mem-rec206&sha256=${hex(plain)}`);
  t("a PDF with no item links: membership NULL, the reason served",
    [ps.membership, ps.membershipWhy, ps.links[0].anchor.text], [null, "no_item_links_of_a_known_shape", "Hello"]);
} finally {
  await mf.dispose();
}

console.log(`\nrec206-positional-membership: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
