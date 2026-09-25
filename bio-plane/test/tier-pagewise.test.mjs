/* CPDF-20 / D-283 — the per-page tier-1/tier-2 rule, driven over the real fixture.
 *
 * HERMETIC. Tier 1 runs FOR REAL over the four committed PDFs (it is pure JS and
 * in-plane). Tier 2's side is read from `fixtures/cpdf20/tier2-recorded.json`,
 * which `tier-pagewise.probe.mjs --record` wrote from a live `unpdf` decode —
 * because `unpdf` is the FLEET MEMBER's dependency and the plane may not grow it
 * (CPDF-6: putting it in the plane's module graph broke 21 miniflare suites).
 * The recording is checkable rather than assumed: `--verify` re-derives it live.
 *
 * NEGATIVE CONTROL: `node bio-plane/test/nc-cpdf20.mjs` — COMMITTED, so it re-runs in one
 * step. EIGHT rows, each armed ALONE with every other defence held open, each restored from
 * a uniquely named per-arm pristine copy verified by sha256 AND by `cmp` with the byte count
 * printed and floored, and each DECLARING before it ran what must fail and what must not:
 *   (0) BASELINE, nothing armed -> exit 0 with a real assertion tally, never a bare 0.
 *   (1) A1 the rule INVERTED -> exit 1, the chain records the loser, named.
 *   (2) A2 §5.2 SHIPPED AS WRITTEN, second condition dropped -> exit 1, and it must fail on
 *       `legistar-73618` page 1 BY NAME. This arm is the design's own rule, armed.
 *   (3) A3 the merge correct but the per-page tier NOT STAMPED -> exit 1.
 *   (4) A4 every page replaced WHOLESALE, the D-283 defect restored -> exit 1.
 *   (5) A5 the FIXTURE TRUNCATED to one PDF -> exit 1 at the floor, not downstream.
 *   (6) A6 OVER-STRICTNESS, the same rule in a different spelling -> exit 0.
 *   (7) A7 RAW `text.length` RESTORED in `decodedChars`, the D-501 defect -> exit 1, and it
 *       must fail on the NEWLINE ARM by name. Added 2026-09-24 (D-501).
 * Result 2026-09-14: 7 of 7 as declared. Re-run 2026-09-24 with A7: 8 of 8 as declared.
 *
 * WHAT THIS SUITE CAN AND CANNOT SEE, stated because it is load-bearing:
 *   IT CAN see that the rule assigns the tier this measurement says it should on
 *   every one of the fixture's 15 pages, that the chain names a tier per page,
 *   that a fully-decodable document comes out byte-identical, that the refusal
 *   fires when there is no page grain to merge on, and — since D-501 — that no
 *   whitespace policy applied to either tier's text can move a single one of
 *   those 15 awards.
 *   IT CANNOT see whether Tier 2's text is BETTER as text — only that it carries
 *   more GLYPHS (D-501: non-whitespace code points; it used to be "is longer",
 *   which a newline policy could manufacture) and that Tier 1 admitted failing.
 *   Fidelity per engine is CPDF-13's calibration, and this rule deliberately
 *   claims nothing about it: both tiers are `layer` derivations under the SAME
 *   null cap, which is exactly why a swap between them overclaims nothing.
 *   IT CANNOT see a GENUINE tier-2 degradation, and that is a fact about the
 *   corpus rather than about the suite (D-501, M-140): on every one of the 15
 *   pages Tier 1 read at all, the two tiers decode the IDENTICAL number of
 *   glyphs. Nowhere in this fixture does Tier 2 recover strictly fewer. The
 *   second condition is still load-bearing — it is what stops a whitespace
 *   "gain" from moving a page — but a page where Tier 2 genuinely loses text is
 *   NOT among these four PDFs, and the synthetic arms at the foot are the only
 *   place that case is driven. D-515 (M-166, 2026-09-25) widened the search to
 *   every PDF the record holds: all 8 committed and all 11 captured in
 *   `biosmoke7`'s `bio` store, 19 documents and 2,107 pages. Tier 2 decodes
 *   fewer glyphs on NONE of them, so no real page exists to commit, and the
 *   synthetic arms remain the only drive of this case until a capture supplies one.
 *   IT CANNOT see the wire. CORRECTED 2026-09-24 (D-501): this paragraph read
 *   "the rule is NOT called by `index.mjs` — that is a DELEGATION", and that has
 *   been false since the delegation was discharged. `index.mjs` imports
 *   `mergeTier2Text` and calls it at `op=acquire` and on the read path. What
 *   stays true is what this suite sees: it drives the rule DIRECTLY, so it still
 *   proves the rule and never that a caller reaches it — `tier2-wire.test.mjs`
 *   is the suite that sees the wire. "It runs" and "it is wired" are the two
 *   halves D-108 exists to keep apart, and so are "it is wired" and "a suite
 *   still says it is not".
 */
import "./stdio.mjs";   /* D-282: side effect only — process.exit must not discard the tally */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { extractPdfStructure } from "../src/pdfstructure.mjs";
import { perPageTierWinner, mergeTier2Text, tier2Note, TIER_RULE } from "../src/textchain.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const FIX = join(HERE, "fixtures", "cpdf20");

let pass = 0, fail = 0;
const ok = (cond, what) => { if (cond) pass++; else { fail++; console.error(`  FAIL ${what}`); } };
const eq = (a, b, what) => ok(a === b, `${what} — expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
/* D-501 — WHAT THE AWARD COUNTS, spelled HERE and INDEPENDENTLY of the subject.
   Importing `decodedChars` from `textchain.mjs` would make the suite agree with
   it for free — two spellings of one rule asserted against each other is the
   point, and a shared helper is the way a suite stops being able to disagree
   with what it tests. It is deliberately not exported for that reason. */
const glyphs = (t) => { let n = 0; for (const ch of t) if (!/\s/u.test(ch)) n++; return n; };

/* ── the corpus, printed and FLOORED ───────────────────────────────────────
 * A totality assertion over an empty corpus passes for free, three times in
 * this repository. So: print it, floor it, and fail on a truncated fixture
 * rather than reporting clean over one. */
/* NAMED, NOT WALKED. A `readdirSync` here would make the corpus "whatever is in
   the directory", so a fixture that vanished would shrink the run silently and
   every totality assertion below would pass over less. The manifest IS the floor:
   a missing file fails by name, and adding a fifth fixture is a decision someone
   makes here rather than a side effect of copying a file in. (It also keeps this
   suite out of the estate's walk census, which exists for walks over ground the
   walker does not control — this is four files it names.) */
const PDFS = ["legistar-73450.pdf", "legistar-73545.pdf", "legistar-73550.pdf", "legistar-73618.pdf"];
const FIXTURE_FLOOR = 4, PAGE_FLOOR = 15;
for (const f of PDFS) ok(existsSync(join(FIX, f)), `fixture present: ${f}`);
console.log(`  corpus: ${PDFS.length} committed PDF(s) in test/fixtures/cpdf20 — ${PDFS.join(", ")}`);
ok(PDFS.length >= FIXTURE_FLOOR, `fixture floor: ${PDFS.length} PDF(s) >= ${FIXTURE_FLOOR}`);

const RECORDED = join(FIX, "tier2-recorded.json");
ok(existsSync(RECORDED), "the recorded tier-2 decode is committed");
const recorded = existsSync(RECORDED) ? JSON.parse(readFileSync(RECORDED, "utf8")) : {};
eq(Object.keys(recorded).length, PDFS.length, "the recording covers every committed PDF");

/* THE EXPECTATION, from the measurement in MEASUREMENTS.md 2026-09-14 (CPDF-20).
 * Written as the TIER PER PAGE rather than as a count, because a count agrees
 * with a wrong assignment for free. */
const EXPECTED = {
  "legistar-73450": [1, 1, 1],                 // fully decodable — untouched
  "legistar-73545": [2, 2, 2, 2, 2, 2, 1],     // MIXED: page 6 stays with tier 1
  "legistar-73550": [2, 2, 2],                 // clean recovery
  "legistar-73618": [1, 1],                    // tier 1 better on both; page 1 is the trap
};

let pagesChecked = 0, movedToTier2 = 0, keptAtTier1 = 0;
let t2EverReportedUndeterminedChars = 0;

for (const f of PDFS) {
  const id = f.replace(/\.pdf$/, "");
  const bytes = new Uint8Array(readFileSync(join(FIX, f)));
  const s = await extractPdfStructure(bytes);
  ok(s.ok, `${id}: tier 1 parsed it`);
  if (!s.ok) continue;
  const t2 = recorded[id];
  ok(!!t2, `${id}: present in the recording`);
  if (!t2) continue;

  const m = mergeTier2Text(s.text, t2);
  ok(m.ok, `${id}: the merge succeeded`);
  if (!m.ok) continue;

  const want = EXPECTED[id];
  ok(Array.isArray(want), `${id}: the measurement pinned an expectation for it`);
  if (!want) continue;

  eq(m.text.pages.length, want.length, `${id}: page count`);

  /* EVERY PAGE CARRIES A TIER, and it is the tier the measurement recorded. */
  for (let i = 0; i < want.length; i++) {
    const page = m.text.pages[i];
    ok(page && Number.isInteger(page.page), `${id} p${i}: the page survived the merge`);
    eq(page.tier, want[i], `${id} p${i}: the chain names the tier that produced it`);
    pagesChecked++;
    if (page.tier === 2) movedToTier2++; else keptAtTier1++;
  }

  /* The per-page statement agrees with the pages themselves — two spellings of
     one fact, asserted against each other rather than each against a constant. */
  const fromPages = { tier1: [], tier2: [] };
  for (const p of m.text.pages) fromPages[p.tier === 2 ? "tier2" : "tier1"].push(p.page);
  eq(JSON.stringify(m.perPageTier), JSON.stringify(fromPages),
     `${id}: perPageTier agrees with the tiers written onto the pages`);

  /* THE COMMENSURABILITY FINDING, asserted rather than only reported: tier 2
     reports no undetermined CHARACTERS at all, which is why §5.2's comparison
     alone does no work and the second condition is load-bearing. */
  for (const p of (t2.pages || []))
    for (const u of (p.undetermined || []))
      if (u && u.count > 0) t2EverReportedUndeterminedChars++;
}

eq(pagesChecked, PAGE_FLOOR, `every fixture page was checked (floor ${PAGE_FLOOR})`);
eq(t2EverReportedUndeterminedChars, 0,
   "tier 2 reports ZERO undetermined characters across the whole fixture — the measured "
 + "incommensurability that makes §5.2's rule as written insufficient on its own");
console.log(`  rule: ${TIER_RULE}`);
console.log(`  ${movedToTier2} page(s) to tier 2 · ${keptAtTier1} kept at tier 1 · ${pagesChecked} checked`);

/* ── THE DEGRADATION CONTROL, IN THE SUITE RATHER THAN ONLY IN THE DRIVER ──
 * §8: "the per-page rule keeps a page tier 1 decoded well when tier 2 decoded
 * it worse". `legistar-73618` page 1 is the fixture's trap, and D-501 CORRECTED
 * WHAT IT IS A TRAP ABOUT rather than exempting it.
 *
 * THIS BLOCK USED TO ASSERT `t1p.text.length > t2p.text.length` and read that
 * difference as text tier 1 had decoded and tier 2 had not — "709 characters
 * traded for one unmapped glyph", 657 against 580 after D-481. THAT ASSERTION
 * WAS WRONG ABOUT THE DOCUMENT, and it is corrected here with the reason rather
 * than deleted or exempted. The two tiers decode the IDENTICAL 486 non-whitespace
 * code points on this page. Not one glyph separates them; the whole margin the
 * old rule weighed was whitespace, and D-481's change to tier 1's line-breaking
 * moved it from 129 to 77 without touching a single decoded character. A rule a
 * whitespace policy can move is not measuring what it claims to (D-501, M-140).
 *
 * So the trap is LIVE and its shape is now stated truly: tier 2 satisfies §5.2's
 * own condition (fewer undetermined) and offers NO GLYPH tier 1 lacks, and the
 * shipped rule keeps tier 1 for that reason instead of for a whitespace count. */
{
  const bytes = new Uint8Array(readFileSync(join(FIX, "legistar-73618.pdf")));
  const s = await extractPdfStructure(bytes);
  const t1p = s.text.pages.find((p) => p.page === 1);
  const t2p = recorded["legistar-73618"].pages.find((p) => p.page === 1);
  const u1 = (t1p.undetermined || []).reduce((n, m) => n + (m.count || 0), 0);
  const u2 = (t2p.undetermined || []).reduce((n, m) => n + (m.count || 0), 0);
  eq(u1, 1, "73618 p1: tier 1 flagged exactly one undetermined character");
  eq(u2, 0, "73618 p1: tier 2 flagged none (it has no vocabulary for them)");
  eq(glyphs(t1p.text), glyphs(t2p.text),
     `73618 p1: both tiers decoded the SAME glyph count (${glyphs(t1p.text)} vs ${glyphs(t2p.text)}) — `
   + `the ${t1p.text.length - t2p.text.length} raw character(s) between them are whitespace, every one`);
  eq(glyphs(t1p.text), 486, "73618 p1: and that glyph count is the measured 486 (M-140)");
  ok(t1p.text.length !== t2p.text.length,
     `73618 p1: the RAW lengths still differ (${t1p.text.length} vs ${t2p.text.length}) — that is what `
   + `the old instrument read, and why a newline policy could move this page`);
  ok(u2 < u1, "73618 p1: §5.2's condition alone is SATISFIED for tier 2 — the trap is live");
  eq(perPageTierWinner(t1p, t2p), "tier1",
     "73618 p1: the shipped rule KEEPS tier 1 — §8's control, on a real page");
}

/* ── D-501 · THE NEWLINE ARM: AN AWARD A WHITESPACE POLICY CAN MOVE ────────
 * The row's accepts-when, driven on the real fixture: THE SAME PAGE'S AWARD IS
 * UNCHANGED UNDER TWO NEWLINE POLICIES. The two tiers are two engines with two
 * INDEPENDENT whitespace policies over the same bytes, and D-481 moved one of
 * them, so each policy is applied to TIER 1 ALONE — the shape the defect took in
 * the wild, rather than a symmetric one that would cancel and prove nothing.
 *
 * Every transform changes WHITESPACE ONLY and can neither add nor remove a
 * glyph; `glyphs()` is asserted invariant under each BEFORE the award is, so a
 * transform that silently ate a character is caught as a defect in the ARM
 * rather than scored as a finding about the rule.
 *
 * WHICH ARM DISCRIMINATES, said plainly because it is the whole control: under
 * the OLD raw-length instrument `strip` flips 73618 p1 to tier 2 (tier 1 falls
 * to 486 against tier 2's 580, and §5.2's condition already held), and
 * `glyphPerLine` flips it back the other way. `asDecoded` alone passes under
 * BOTH instruments and proves nothing — an arm that cannot fail is not a control. */
{
  const POLICIES = [
    ["asDecoded",    (t) => t],
    ["strip",        (t) => t.replace(/\s+/gu, "")],
    ["collapse",     (t) => t.replace(/\s+/gu, " ")],
    ["explode",      (t) => t.replace(/\s/gu, "\n\n")],
    ["glyphPerLine", (t) => [...t.replace(/\s+/gu, "")].join("\n")],
  ];
  const CASES = [
    ["legistar-73618", 1, "tier1", "the trap: tier 2 brings no glyph tier 1 lacks"],
    ["legistar-73545", 0, "tier2", "a page tier 1 genuinely failed: tier 2 must still take it"],
    ["legistar-73450", 0, "tier1", "a page tier 1 read fully: nothing may move it"],
  ];
  let armed = 0;
  for (const [id, pageNo, want, why] of CASES) {
    const s = await extractPdfStructure(new Uint8Array(readFileSync(join(FIX, `${id}.pdf`))));
    const t1p = s.text.pages.find((p) => p.page === pageNo);
    const t2p = recorded[id].pages.find((p) => p.page === pageNo);
    ok(!!t1p && !!t2p, `${id} p${pageNo}: both tiers offer the page (the arm can arm)`);
    if (!t1p || !t2p) continue;
    const g0 = glyphs(t1p.text);
    for (const [name, f] of POLICIES) {
      const moved = { ...t1p, text: f(t1p.text) };
      eq(glyphs(moved.text), g0,
         `${id} p${pageNo} [${name}]: the policy changed WHITESPACE ONLY (${g0} glyph(s) either side)`);
      eq(perPageTierWinner(moved, t2p), want,
         `${id} p${pageNo} [${name}]: the award is ${want} under this newline policy — ${why}`);
      armed++;
    }
  }
  eq(armed, POLICIES.length * CASES.length,
     `the newline arm ran every policy on every case (floor ${POLICIES.length * CASES.length})`);
  console.log(`  newline arm: ${POLICIES.length} policies × ${CASES.length} real pages `
            + `= ${armed} award(s), every one invariant`);
}

/* ── D-501 · THE CODE-POINT HALF, WHICH THE REAL CORPUS CANNOT EXERCISE ────
 * Stated rather than implied: all 15 fixture pages are BMP-only — their
 * code-point count equals their `.length` — so nothing in the wild tells these
 * two counters apart. It is ASSERTED, so the day a fixture carries an astral
 * glyph this claim fails instead of quietly going stale, and then driven
 * synthetically. An astral glyph is ONE glyph in TWO UTF-16 units, so a
 * `.length` comparison scores it two-for-one and can award a page to an engine
 * that recovered FEWER characters. */
{
  let astralPages = 0, censused = 0;
  for (const f of PDFS) {
    const s = await extractPdfStructure(new Uint8Array(readFileSync(join(FIX, f))));
    for (const p of s.text.pages) { censused++; if ([...p.text].length !== p.text.length) astralPages++; }
  }
  eq(censused, PAGE_FLOOR, `the astral census covered every fixture page (floor ${PAGE_FLOOR})`);
  eq(astralPages, 0, "no committed fixture page carries an astral glyph — so the synthetic arm below "
                   + "is the ONLY thing here that tells code points from UTF-16 units");

  const P = (text, undet) => ({ page: 0, text, undetermined: undet ? [{ count: undet }] : [] });
  eq(perPageTierWinner(P("abcdef", 5), P("\u{1D400}\u{1D401}\u{1D402}", 0)), "tier1",
     "astral: tier 2's 3 glyphs in 6 UTF-16 units do not beat tier 1's 6 glyphs");
  eq(perPageTierWinner(P("abc", 5), P("\u{1D400}\u{1D401}\u{1D402}\u{1D403}", 0)), "tier2",
     "astral: tier 2's 4 glyphs DO beat tier 1's 3 — the award is on glyphs in both directions");
  eq(perPageTierWinner(P("abc", 5), P("\u{1D400}\u{1D401}\u{1D402}", 0)), "tier1",
     "astral: an equal glyph count is not STRICTLY more, however many units it occupies");
}

/* ── THE OVER-STRICTNESS ARM: a fully-decodable PDF is untouched ───────────
 * Not "the same tier" — BYTE-IDENTICAL. Correct work in a spelling the rule did
 * not anticipate must pass, and the way this rule would fail is by touching a
 * document it has no business touching. Digest-pinned against the pristine
 * tier-1 reading, which is what "byte-identical chain" has to mean here. */
{
  const bytes = new Uint8Array(readFileSync(join(FIX, "legistar-73450.pdf")));
  const s = await extractPdfStructure(bytes);
  const pristine = JSON.stringify(s.text.pages.map((p) => ({ page: p.page, text: p.text, undetermined: p.undetermined })));
  const m = mergeTier2Text(s.text, recorded["legistar-73450"]);
  const after = JSON.stringify(m.text.pages.map((p) => ({ page: p.page, text: p.text, undetermined: p.undetermined })));
  ok(pristine.length > 100, `the pristine reading is non-empty (${pristine.length} B) — not an empty-manifest pass`);
  eq(after, pristine, "a fully-decodable PDF's pages come out BYTE-IDENTICAL to the pristine tier-1 reading");
  eq(m.text.document, s.text.document, "and so does its document text");
  eq(m.replaced.length, 0, "no page was replaced");
  eq(tier2Note(m), null, "and the note says nothing, because nothing happened");
}

/* ── THE REFUSAL: no page grain, and text that would be lost ───────────────── */
{
  const base = { document: "x".repeat(400), pages: [], undetermined: [], counts: { chars: 400, undetermined: 0 } };
  const m = mergeTier2Text(base, { pages: [{ page: 0, text: "y", undetermined: [] }] });
  eq(m.ok, false, "a base with no page grain and real text REFUSES the merge");
  ok(typeof m.why === "string" && m.why.includes("400"), "and the refusal names how much text it protected");
}
{
  const base = { document: "", pages: [], undetermined: [], counts: { chars: 0, undetermined: 0 } };
  const t2 = { document: "y", pages: [{ page: 0, text: "y", undetermined: [] }], undetermined: [], counts: { chars: 1, undetermined: 0 } };
  const m = mergeTier2Text(base, t2);
  eq(m.ok, true, "a wholly-unread base takes tier 2 whole — nothing can be lost");
  eq(m.wholesale, true, "and says it was wholesale rather than inventing a per-page statement");
  eq(m.perPageTier, null, "perPageTier is null when there were no pages to speak of");
}

/* ── THE RULE ITSELF, driven directly at its boundaries ───────────────────── */
{
  const P = (text, undet) => ({ page: 0, text, undetermined: undet ? [{ count: undet }] : [] });
  eq(perPageTierWinner(P("aaa", 5), P("aaaa", 0)), "tier2", "both conditions hold: tier 2 takes it");
  eq(perPageTierWinner(P("aaa", 5), P("aa", 0)), "tier1", "fewer undetermined but LESS text: tier 1 keeps it");
  eq(perPageTierWinner(P("aaa", 0), P("aaaa", 0)), "tier1", "more text but tier 1 never failed: tier 1 keeps it");
  eq(perPageTierWinner(P("aaa", 5), P("aaa", 0)), "tier1", "equal text: tier 1 keeps it (strictly more, or nothing)");
  eq(perPageTierWinner(P("aaa", 5), P("aaaa", 5)), "tier1", "§5.2's tie: tier 1 keeps it");
  eq(perPageTierWinner(P("aaa", 5), null), "tier1", "nothing offered: tier 1 keeps it");
  eq(perPageTierWinner(P("aaa", 5), P("aaa", 5)), "tier1", "identical decodes: tier 1 keeps it");
  /* A marker with no `count` is an ABSENT count, never a zero that argues. */
  eq(perPageTierWinner({ page: 0, text: "aaa", undetermined: [{ reason: "no_text_layer" }] },
                       P("aaaa", 0)), "tier1",
     "a structural marker carries no character count, so it never makes tier 1 look worse");
}

/* ── THE FOOT. A TypeError inside an assertion ends the module with the tally
 * reading clean, so the run is only believable if it reached HERE. */
console.log(`tier-pagewise: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
