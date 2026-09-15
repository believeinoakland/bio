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
 * step. SEVEN rows, each armed ALONE with every other defence held open, each restored from
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
 * Result 2026-09-14: 7 of 7 as declared.
 *
 * WHAT THIS SUITE CAN AND CANNOT SEE, stated because it is load-bearing:
 *   IT CAN see that the rule assigns the tier this measurement says it should on
 *   every one of the fixture's 15 pages, that the chain names a tier per page,
 *   that a fully-decodable document comes out byte-identical, and that the
 *   refusal fires when there is no page grain to merge on.
 *   IT CANNOT see whether Tier 2's text is BETTER as text — only that it is
 *   longer and that Tier 1 admitted failing. Fidelity per engine is CPDF-13's
 *   calibration, and this rule deliberately claims nothing about it: both tiers
 *   are `layer` derivations under the SAME null cap, which is exactly why a
 *   swap between them overclaims nothing.
 *   IT CANNOT see the wire. The rule is NOT called by `index.mjs` — that is a
 *   DELEGATION (CLAIMS.md 2026-09-14) — so this suite proves the rule, never
 *   that a caller reaches it. Said plainly rather than implied: "it runs" and
 *   "it is wired" are the two halves D-108 exists to keep apart.
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
 * it worse". `legistar-73618` page 1 IS that page in the wild: tier 1 decoded
 * 709 characters and flagged ONE unmapped code; tier 2 decoded 580. §5.2's rule
 * as written gives it to tier 2 and loses 129 characters. Asserted on the real
 * document, with both numbers, so the page cannot quietly stop being the trap. */
{
  const bytes = new Uint8Array(readFileSync(join(FIX, "legistar-73618.pdf")));
  const s = await extractPdfStructure(bytes);
  const t1p = s.text.pages.find((p) => p.page === 1);
  const t2p = recorded["legistar-73618"].pages.find((p) => p.page === 1);
  const u1 = (t1p.undetermined || []).reduce((n, m) => n + (m.count || 0), 0);
  const u2 = (t2p.undetermined || []).reduce((n, m) => n + (m.count || 0), 0);
  eq(u1, 1, "73618 p1: tier 1 flagged exactly one undetermined character");
  eq(u2, 0, "73618 p1: tier 2 flagged none (it has no vocabulary for them)");
  ok(t1p.text.length > t2p.text.length,
     `73618 p1: tier 1 decoded MORE (${t1p.text.length} vs ${t2p.text.length})`);
  ok(u2 < u1, "73618 p1: §5.2's condition alone is SATISFIED for tier 2 — the trap is live");
  eq(perPageTierWinner(t1p, t2p), "tier1",
     "73618 p1: the shipped rule KEEPS tier 1 — §8's control, on a real page");
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
