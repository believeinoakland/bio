/* THE DESIGN CORPUS SAYS WHAT IT LACKS — `tools/corpuscheck.mjs`, driven.
 *
 * Bob, 2026-09-14: every design document carries front matter — a completeness
 * self-description, a table of contents, an EXPLICIT list of incomplete sections — and
 * that front matter is always current. The receipt is the Content Framework: approved
 * 2026-07-30, 46 days unreferenced by the orientation set, never saying what it lacked,
 * while the construct it owned went undesigned. The standard is
 * docs/architecture/CORPUS-STANDARD.md; the checker is the mechanism; this suite proves
 * the checker refuses what the standard forbids and accepts what it requires — and that
 * the mechanism is IN THE LOOP (plancheck runs it, both kickoffs name it), because a
 * checker nobody runs is documentation.
 *
 * NEGATIVE CONTROL: (1) in `tools/corpuscheck.mjs` make `renderContents` return `have`
 * instead of rendering from the headings (i.e. compare Contents to itself) -> the
 * "Contents drift is refused" arm FAILS, because a TOC that cannot disagree with the body
 * checks nothing; (2) delete the `POSITIONAL` guard -> the "§whole document resolves" arm
 * FAILS (over-strictness armed from the strict side); (3) drop the `.split(/^### /m)[0]`
 * in `governed()` -> the "not-yet-governed rows are NOT governed" arm FAILS, which is the
 * regression this suite's author hit while wiring it; (4) remove the corpuscheck block from
 * `tools/plancheck.mjs` -> the "mechanism is in the loop" arm FAILS; (5) delete the
 * `asOfAll.length > 1` push from `checkFile` -> the "a Status carrying two `as of` dates is
 * refused" arm FAILS, and only that one, because a Status judged on a date its own editor
 * never sees is judged on nothing. Arm (5) and its over-strictness twins are re-run in ONE
 * STEP with `node test/nc-m028.mjs` from `bio-plane/` (M0-28): six arms including the
 * baseline, each armed ALONE against a REAL governed document with every other defence open,
 * anchors validated before anything is armed, restored by cp-back from uniquely-named
 * pristine copies verified by sha256 AND `cmp` AND a floored byte count.
 *
 * NEGATIVE CONTROL, THE COVERAGE HALF (M0-43, 2026-09-16) — re-runnable in ONE STEP with
 * `node test/corpuscheck.control.mjs` from `bio-plane/`. EIGHT arms, each armed ALONE with
 * every other defence open, anchors validated before anything is armed, restored by cp-back
 * from uniquely-named pristine copies verified by sha256 AND `cmp` AND a floored byte count:
 * (1) a GOVERNED document's §5 row removed while the file still carries front matter ->
 * FAILS naming it UNCLASSIFIED, which is the arm proving DISCOVERY BEAT the hand-kept list
 * rather than merely agreeing with it; (2) an unclassified .md planted ON DISK at top level
 * and in `research/` -> both named (the suite's own plant is INJECTED, so this is the arm
 * that drives the real filesystem walk); (3) an exclusion widened to `docs/development/**.md`
 * -> refused as too broad, which is the liar's pattern this item was written against;
 * (4) an exclusion shadowing a governed document -> refused; (5) an exclusion's reason cell
 * blanked -> refused; (6) an UNDECIDED row pointed at a nonexistent file -> refused;
 * (7) `population()` made NON-RECURSIVE in the tool -> THIS suite's RECURSION arm fails,
 * proving the subdirectory half is load-bearing; (8) over-strictness, nothing armed ->
 * corpuscheck's output BYTE-IDENTICAL to baseline and `plancheck --local` 0 fail, because a
 * discovery rule that reclassifies a file nobody asked it to reclassify has made a decision
 * that belongs to Bob. **All 8 as declared, 0 arms never armed**, 28,688 B and 23,287 B
 * restored byte-identically on every arm.
 * **THE METHOD IS RECORDED BESIDE THE RESULT** because the obvious method gives the
 * confident wrong answer here: the last controls against this toolchain were defeated by
 * the METHOD dirtying the tree — a rename and a `chmod 000` each made `plancheck` fail on
 * UNPUBLISHED and exit 1, a NAMED failure that felt like evidence while the subject was
 * never exercised. Every arm above drives `corpuscheck` DIRECTLY, which has no publication
 * check at all and so cannot fail for a reason the arm did not cause; the one plancheck arm
 * runs `--local`, which skips the publication half.
 *
 * NEGATIVE CONTROL, THE DESIGN-STATUS AUTHORITY HALF (M0-57, 2026-09-17) — re-runnable in ONE
 * STEP with `node bio-plane/test/m057-authority.control.mjs`. SIX arms, each armed ALONE with every
 * other defence open, anchors validated before anything is armed, restored by cp-back from
 * uniquely-named pristine copies verified by sha256 AND a floored byte count — never the checkout
 * form this repository forbids, which in a tree with uncommitted work is "throw mine away" and
 * exits 0 either way. (1) THE RECEIPT REPRODUCED ON DISK: `BIO_Content_Framework_v0_10.md` §18
 * item 6 reverted to the words that misled BOB #12 -> corpuscheck RED, naming construct 8, the
 * document that RESTATES and the document that DESIGNED it; (2) THE ARM REMOVED over that same
 * reverted corpus -> the claim-class pair PASSES corpuscheck again and THIS SUITE goes red, which
 * is the pair of measurements that establishes the arm is what catches it rather than something
 * else in the run; (3) signal 3 removed, so an item that POINTS at its design is no longer exempt
 * -> the healthy CORRECTED corpus is refused, which is over-strictness armed from the strict side;
 * (4) signal 4a removed, so a home document need no longer DECLARE the construct -> the
 * "does not declare this construct" arm fails; (5) signal 4b widened from a HEADING match to a
 * whole-body match -> the "no heading naming the piece" arm fails; (6) over-strictness baseline,
 * nothing armed -> corpuscheck green, byte-identical, `plancheck --local` 0 fail.
 * **All 6 as declared, 0 arms never armed, 15 pass 0 fail**, 39,017 B and 166,876 B restored
 * byte-identically on every arm.
 * **AND THE SUITE'S OWN ARM-THAT-DID-NOT-ARM GUARD EARNED ITS PLACE ON FIRST RUN**: the revert of
 * §18 item 6 was written pipe-anchored, but the pointer and the cell's original prose are ONE table
 * cell, so it matched nothing — and without the guard the receipt arm would have reported a
 * confident PASS over a document that was never modified. That is this estate's *break only the
 * thing* rule with the sign flipped, and it is why the guard asserts the substitution TOOK before
 * anything is concluded from the result.
 * **THE METHOD IS RECORDED BESIDE THE RESULT**, because the obvious method gives the confident
 * wrong answer here: every arm drives `corpuscheck` DIRECTLY, which has no publication check and so
 * cannot fail for a reason the arm did not cause, and the one plancheck arm runs `--local`.
 *
 * NEGATIVE CONTROL: (M0-61, the `UNDESIGNED` predicate's gap, 2026-09-18) re-runnable in ONE STEP
 * with `node bio-plane/test/m061-undesigned-gap.control.mjs` — 4/4 arms as declared, files restored
 * byte-identically by sha256. The gap reverted to `\s+` -> this suite 107 pass 1 fail, "a PARAGRAPH
 * break is never spanned" wanting [false,false,false,false] and getting all true. THE LIAR — the gap
 * narrowed to a literal space, the fix the row warned against -> 105 pass 3 fail, on the Content
 * Framework's and the Functional Architecture's own genuine soft-wrapped claims and on tab/CRLF.
 * The predicate change moved NO live output: `corpuscheck` in all six modes and `statussweep` in
 * all three were byte-identical before and after (measured against HEAD's copies run over the same
 * docs/), because no match in the governed set crossed a paragraph break.
 *
 * NEGATIVE CONTROL, THE OTHER DIRECTION — the checker armed against a REAL retrofitted
 * document rather than a fixture. Run 2026-09-14 by M0-26 in worktree
 * agent-a64d514be75dea71a, re-runnable in one step with
 * `sh` the script recorded in that item's report, each arm ALONE against
 * `docs/development/INBOX-GRAMMAR.md` with every other defence open, restored by cp-back
 * (never `git checkout --`) verified by sha256 AND `cmp` with the byte count printed and a
 * 2,000-byte floor: (1) Status `as of` pushed one day behind the file's last commit day ->
 * FAILS naming that file; (2) `## The file` renamed without `--write` -> FAILS on the
 * Contents divergence at entry 2; (3) an Incomplete bullet naming `§The plot against the
 * record` -> FAILS naming that section; (4) over-strictness, nothing armed -> 0 fail.
 * All four as declared, 12,155 bytes restored byte-identical on every arm.
 *
 * AND THE BASELINE ARM IS THE FINDING, which is why it is written here. It came back
 * RED over an honest tree and the defect was in a document this very item had just
 * written: `PRACTICE-SURVEY.md`'s Status prose said "the vendor claims are as of
 * 2026-08-01" BEFORE its trailing "as of 2026-09-14", and the date check `exec`s the
 * FIRST `as of` in the Status. **The same file had passed `corpuscheck` minutes earlier**,
 * because the date is compared against `git log -1 --format=%as` and the file was still
 * UNCOMMITTED, so it was being judged against its 2026-08-01 commit. **A freshly
 * retrofitted document cannot fail the staleness arm until it is committed** — that is a
 * real bound on this instrument, it is the reason the control was run after the commit
 * rather than before, and a retrofit checked only pre-commit is checked less than it looks.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: the suite's temp fixtures live in a sandbox the battery sweeps */
import { mkdtempSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(DIR, "..", "..");
const { ROOT, governed, checkFile, writeContents, parseFront, bodyHeadings, renderContents,
  population, coverage, matchPattern, statusAuthority, constructMap, numberedSection, keyWords,
  MAP_DOC, UNDESIGNED } =
  await import(join(REPO_ROOT, "tools/corpuscheck.mjs"));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const SECTIONS = 10;  /* M0-43 added the coverage section; M0-57 the design-status authority; M0-61 the predicate's gap */
let reached = 0;
const section = (name) => { reached++; console.log(`\n--- ${name} ---`); };

const SANDBOX = mkdtempSync(join(tmpdir(), "corpuscheck-"));
const doc = (name, text) => { const p = join(SANDBOX, name); writeFileSync(p, text); return p; };
const fails = (p) => checkFile(p, { git: false }).fails;
const firstFail = (p) => (fails(p)[0] || "").replace(/\s+/g, " ");

const GOOD = `# A construct

**Status** · v0.1, a fixture document that describes one construct completely enough to be checked, as of 2026-09-14. Complete at its level.

**Place in the system** · A level-1 fixture serving the corpuscheck suite; nothing depends on it and it depends on nothing.

**Incomplete sections** ·
- §2 — the second section is a stub, stated here so it is explicit.
- §whole document — a fixture, not a design.

**Contents**
- [1. First](#1-first)
  - [Detail](#detail)
- [2. Second](#2-second)

---

## 1. First

Text.

### Detail

More.

## 2. Second

Stub.
`;

/* ========================================================================== */
section("a conforming document passes, and its parts parse as the grammar says");
{
  const p = doc("good.md", GOOD);
  t("a conforming document has zero failures", fails(p), []);
  const fm = parseFront(GOOD.split("\n"));
  t("front matter parses with no error", fm.error, undefined);
  t("default depth is 3", fm.depth, 3);
  const heads = bodyHeadings(GOOD.split("\n"), fm.blockEnd, fm.depth);
  t("the body's headings are found after the front matter and the banner is excluded", heads.map((h) => h.text), ["1. First", "Detail", "2. Second"]);
  t("Contents renders GitHub-style slugs nested by level", renderContents(heads), ["- [1. First](#1-first)", "  - [Detail](#detail)", "- [2. Second](#2-second)"]);
}

/* ========================================================================== */
section("every field is required, in order, and says something");
{
  t("a missing Place in the system is refused by name",
    /lacks place/.test(firstFail(doc("noplace.md", GOOD.replace(/\*\*Place in the system\*\*[^\n]*\n\n/, "")))), true);
  t("a missing Incomplete sections is refused by name",
    /lacks incomplete/.test(firstFail(doc("noinc.md", GOOD.replace(/\*\*Incomplete sections\*\*[\s\S]*?\n\n(\*\*Contents)/, "$1")))), true);
  t("fields out of order are refused",
    /out of order/.test(firstFail(doc("order.md", GOOD.replace("**Status** ·", "**Status-X** ·").replace("**Place in the system** ·", "**Status** · placeholder status long enough to pass the length check, as of 2026-09-14.\n\n**Place in the system** ·").replace("**Status-X** ·", "**Place in the system** ·")))), true);
  t("a Status without `as of YYYY-MM-DD` is refused",
    /as of YYYY-MM-DD/.test(firstFail(doc("nodate.md", GOOD.replace("as of 2026-09-14", "as of yesterday")))), true);
  t("a Status too short to describe completeness is refused",
    /too short/.test(firstFail(doc("short.md", GOOD.replace(/\*\*Status\*\* · [^\n]*/, "**Status** · ok, as of 2026-09-14.")))), true);
  t("a document with no heading at all is refused",
    /no heading/.test(firstFail(doc("nohead.md", "just prose\n"))), true);
}

/* ========================================================================== */
section("Contents drift is refused, and --write repairs it");
{
  const drifted = GOOD.replace("## 2. Second", "## 2. Second, renamed");
  const p = doc("drift.md", drifted);
  const f = firstFail(p);
  t("Contents drift is refused", /Contents does not match/.test(f), true);
  t("the refusal names the first differing entry, both sides", /have .*2\. Second.*want .*2\. Second, renamed/.test(f), true);
  t("the refusal prints the command that fixes it", /corpuscheck\.mjs --write/.test(f), true);
  const n = writeContents(p);
  t("--write regenerates every entry", n, 3);
  t("after --write the document passes", fails(p), []);
  t("--write left the renamed heading in the Contents", /\[2\. Second, renamed\]/.test(readFileSync(p, "utf8")), true);
  const fenced = GOOD.replace("Text.", "Text.\n\n```\n## not a heading\n```");
  t("a heading inside a code fence is not indexed", fails(doc("fence.md", fenced)), []);
  t("--write refuses a document whose other fields are absent (Contents is the only generated field)",
    (() => { try { writeContents(doc("nofm.md", "# T\n\n## A\n")); return "wrote"; } catch (e) { return /Status, Place, and Incomplete/.test(e.message) ? "refused" : e.message; } })(), "refused");
}

/* ========================================================================== */
section("Incomplete sections: explicit, and every bullet names a real section");
{
  t("a bullet naming a section that does not exist is refused, naming it",
    /names §9, which is not a section/.test(firstFail(doc("badref.md", GOOD.replace("- §2 — the second", "- §9 — the ninth")))), true);
  t("a bullet not shaped `- §<section> — <what>` is refused",
    /not `- §<section> — <what is missing>`/.test(firstFail(doc("shape.md", GOOD.replace("- §2 — the second section is a stub, stated here so it is explicit.", "- the second section is a stub")))), true);
  t("§whole document resolves (a positional ref, not a section)", fails(doc("pos.md", GOOD.replace("- §2 — the second section is a stub, stated here so it is explicit.\n", ""))), []);
  t("a ref by heading words resolves case-insensitively", fails(doc("words.md", GOOD.replace("- §2 — the second", "- §detail — the second"))), []);
  t("`None` without how it was established is refused",
    /None without saying how/.test(firstFail(doc("none.md", GOOD.replace(/\*\*Incomplete sections\*\* ·\n- §2[^\n]*\n- §whole[^\n]*\n/, "**Incomplete sections** · None\n")))), true);
  t("`None — <how checked>` passes", fails(doc("none2.md", GOOD.replace(/\*\*Incomplete sections\*\* ·\n- §2[^\n]*\n- §whole[^\n]*\n/, "**Incomplete sections** · None — every section read against the build on 2026-09-14.\n"))), []);
  t("`None` followed by bullets is refused",
    /says None and then lists/.test(firstFail(doc("none3.md", GOOD.replace("**Incomplete sections** ·", "**Incomplete sections** · None — checked.")))), true);
}

/* ========================================================================== */
section("ONE `as of`, the latest, at the END of the Status");
{
  /* M0-28, from SK-6's delegation. `checkFile`'s staleness check `exec`s the FIRST `as of`
     in the Status, so a Status carrying a second, earlier one is judged on a date no editor
     would think to bump while the trailing date they DO bump is read by nothing. Three
     governed documents carried two — benign only because the two were equal. CORPUS-STANDARD
     §3 now says one date, the latest, at the end; these arms are that rule. */
  const two = GOOD.replace("as of 2026-09-14. Complete at its level.",
    "as of 2026-08-01, and the surfaces were re-read since. Complete at its level, as of 2026-09-14.");
  const f = firstFail(doc("twodates.md", two));
  t("a Status carrying two `as of` dates is refused", /carries 2 `as of` dates/.test(f), true);
  t("the refusal names the file", /twodates\.md/.test(f), true);
  t("the refusal names BOTH dates, in the order they appear", /2026-08-01 then 2026-09-14/.test(f), true);
  t("the refusal says which one is actually judged", /only the first \(2026-08-01\) is judged/.test(f), true);
  t("the refusal states the rule and cites the standard", /keep ONE, the latest, at the END of the Status \(CORPUS-STANDARD\.md §3\)/.test(f), true);
  t("three `as of` dates are refused too — the arm counts, it does not look for a pair",
    /carries 3 `as of` dates/.test(firstFail(doc("threedates.md", GOOD.replace("as of 2026-09-14. Complete at its level.",
      "as of 2026-07-30, amended as of 2026-08-01. Complete at its level, as of 2026-09-14.")))), true);

  /* OVER-STRICTNESS, from the strict side: the rule is about the `as of` FORM, not about
     dates. A Status must still be able to say when a measurement was taken. */
  t("exactly one `as of` passes (the conforming fixture is unmoved)", fails(doc("onedate.md", GOOD)), []);
  t("a prose date in any OTHER form passes — a Status may still say when a measurement was taken",
    fails(doc("prosedate.md", GOOD.replace("as of 2026-09-14. Complete at its level.",
      "measured 2026-08-01; the vendor's own figures are dated 2026-07-30. Complete at its level, as of 2026-09-14."))), []);
  t("a date in the PLACE or Incomplete fields is not counted — only the Status is judged",
    fails(doc("otherfield.md", GOOD.replace("nothing depends on it", "nothing depends on it as of 2026-08-01")
      .replace("- §whole document — a fixture, not a design.", "- §whole document — a fixture, not a design, as of 2026-08-01."))), []);

  /* THE CLASS, SWEPT OVER THE REAL CORPUS rather than over fixtures: after this item every
     governed document's Status carries exactly one `as of`. The three that carried two —
     UI-PLAN, UI-KICKOFF, NOTIFICATIONS — were corrected in the same commit. */
  const g = governed();
  const counts = g.map((p) => {
    const fm = parseFront(readFileSync(join(ROOT, p), "utf8").split("\n"));
    return { p, n: fm.error ? -1 : [...fm.status.matchAll(/as of \d{4}-\d{2}-\d{2}/g)].length };
  });
  t(`the corpus swept is non-empty and is the whole governed set (${g.length} documents)`, counts.length === g.length && g.length >= 40, true);
  t("every governed document's Status carries exactly ONE `as of`", counts.filter((c) => c.n !== 1).map((c) => `${c.p}:${c.n}`), []);
}

/* ========================================================================== */
section("the governed set is what the standard says, no more");
{
  const g = governed();
  t("every docs/architecture/*.md is governed", g.includes("docs/architecture/BIO_Content_Framework_v0_10.md") && g.includes("docs/architecture/README.md"), true);
  t("the standard's §5 table rows are governed", g.includes("docs/development/CONTENT-EXTENT-DESIGN-SPACE.md"), true);
  /* Corrected 2026-09-14: this arm first named STORE-AS-CACHE.md as its example of a not-yet-governed
     row, and the same day's retrofit governed it — a hard-coded example rots as owners retrofit. The
     arm now reads the "Not yet governed" table itself and asserts NONE of its rows is governed, so it
     stays true as the table drains and still catches the sub-heading regression it was written for. */
  const std = readFileSync(join(ROOT, "docs/architecture/CORPUS-STANDARD.md"), "utf8");
  const notYet = (std.split(/^### Not yet governed/m)[1] || "").split(/^## /m)[0];
  const notYetPaths = [...notYet.matchAll(/`(docs\/[^`*]+\.md)`/g)].map((m) => m[1]);
  t("not-yet-governed rows are NOT governed (the sub-heading ends the table)", notYetPaths.filter((p) => g.includes(p)), []);
  t("the not-yet table was read (arm has teeth while rows remain)", notYetPaths.length > 0 || /Not yet governed/.test(std), true);
  t("the standard governs itself", g.includes("docs/architecture/CORPUS-STANDARD.md"), true);
  const real = g.map((p) => ({ p, f: checkFile(p, { git: false }).fails }));
  t(`the real corpus is compliant (${g.length} governed documents, git date check aside)`, real.filter((r) => r.f.length).map((r) => r.p), []);
}

/* ========================================================================== */
section("the mechanism is in the loop the readers actually run");
{
  const rd = (p) => readFileSync(join(ROOT, p), "utf8");
  t("plancheck imports and runs corpuscheck", /corpuscheck\.mjs/.test(rd("tools/plancheck.mjs")) && /checkFile/.test(rd("tools/plancheck.mjs")), true);
  t("kickoffs/CONDUCT.md names the checker in its loop", /corpuscheck/.test(rd("docs/development/kickoffs/CONDUCT.md")), true);
  t("kickoffs/BOB.md carries the standard in its closing protocol", /CORPUS-STANDARD\.md/.test(rd("docs/development/kickoffs/BOB.md")), true);
  t("CLAUDE.md points every session at the system design and the standard", /BIO_System_Design\.md/.test(rd("CLAUDE.md")) && /CORPUS-STANDARD\.md/.test(rd("CLAUDE.md")), true);
  t("the level-0 document the standard requires exists", existsSync(join(ROOT, "docs/architecture/BIO_System_Design.md")), true);
}

/* ========================================================================== */
section("coverage — the hand-fed half, and the walk that audits it (M0-43)");
{
  /* §5's table is HAND-KEPT: right about every document it is told about, which is why
     nobody notices the ones it is not. These arms are written from OUTSIDE the tables on
     purpose, because the cheap defeat of this whole item is a check that walks §5 and
     reports every entry healthy — congratulating itself over exactly the set that was
     never the problem. */
  const std = readFileSync(join(ROOT, "docs/architecture/CORPUS-STANDARD.md"), "utf8");

  // 1. the walk is real and RECURSIVE, asserted against the real tree, not a fixture
  const pop = population();
  t("population() walks the real docs/development/", pop.length > 40, true);
  t("population() is RECURSIVE — research/ is a real subdirectory of the design corpus",
    pop.includes("docs/development/research/DATA-MODEL.md"), true);
  t("population() is wider than the governed table (a walk that only re-read §5 would be equal)",
    pop.length > governed().filter((p) => p.startsWith("docs/development/")).length, true);

  // 2. THE PLANT — the arm that proves the walk looks outside the tables. Injected rather
  //    than written to disk: a fixture in docs/development/ during a concurrent battery is
  //    the contamination class this project has paid for, and arm 1 already pins the walk.
  const planted = ["docs/development/PLANTED-BY-THE-SUITE.md", "docs/development/research/PLANTED-SUB.md"];
  const withPlant = coverage({ pop: [...pop, ...planted] });
  t("a new .md under docs/development/ that no table classifies is UNCLASSIFIED",
    withPlant.unclassified, planted);
  t("and it FAILS BY NAME, both of them, top level and subdirectory",
    planted.filter((p) => withPlant.fails.some((f) => f.includes(p) && /UNCLASSIFIED/.test(f))), planted);

  // 3. over-strictness, armed from the strict side: the REAL tree is fully classified
  const cov = coverage();
  t("the real tree has nothing unclassified", cov.unclassified, []);
  t("and the audit produces no failures over it", cov.fails, []);
  t(`every file is in exactly one class (${cov.population.length} = ${cov.governed.length}+${cov.excluded.length}+${cov.undecided.length})`,
    cov.governed.length + cov.excluded.length + cov.undecided.length, cov.population.length);

  // 4. an exclusion cannot be a way to classify the population without classifying anything
  t("no exclusion pattern is a `**` glob or a non-.md pattern",
    cov.exclusions.filter((r) => /\*\*/.test(r.pattern) || !r.pattern.endsWith(".md")).map((r) => r.pattern), []);
  t("every exclusion carries a reason (§6's model: excluded WITH A REASON, not merely absent)",
    cov.exclusions.filter((r) => !r.why || r.why.length < 12).map((r) => r.pattern), []);
  t("no exclusion shadows a governed document", cov.exclusions.filter((r) =>
    governed().some((g) => g.startsWith("docs/development/") && matchPattern(r.pattern, g))).map((r) => r.pattern), []);
  t("matchPattern's dir glob does not reach into a SUBdirectory",
    matchPattern("docs/development/*.md", "docs/development/research/DATA-MODEL.md"), false);
  t("matchPattern's dir glob does reach that directory's own files",
    matchPattern("docs/development/kickoffs/*.md", "docs/development/kickoffs/WORKER.md"), true);
  /* Driven, not assumed: a `**` exclusion is the liar's pattern and must be REFUSED. */
  const broad = coverage({ pop: ["docs/development/QUEUE.md"] });
  t("the exclusions actually classify something (an empty table would pass every arm above)",
    cov.excluded.length >= 11 && broad.excluded.length === 1, true);

  // 5. UNDECIDED is a CLOSED, ENUMERATED hole somebody drains — not an open bucket
  t("every UNDECIDED row names a file that exists", cov.undecidedRows.filter((r) => !existsSync(join(ROOT, r.path))).map((r) => r.path), []);
  t("no UNDECIDED row names a path pattern rather than a literal file",
    cov.undecidedRows.filter((r) => /\*/.test(r.path)).map((r) => r.path), []);
  t("every UNDECIDED row says what is undecided about it",
    cov.undecidedRows.filter((r) => !r.question || r.question.length < 20).map((r) => r.path), []);
  t("the UNDECIDED files are NOT silently governed", cov.undecidedRows.filter((r) => governed().includes(r.path)).map((r) => r.path), []);
  /* CORRECTED 2026-09-22 by M0-110 (BOB #28's ruling 2 names this arm): its second half read the LIVE `DEBT.md`,
     which lives on the branch `coord` after the cutover, where no `main` gate record settles it. The half about the
     STANDARD stays here; the half about the live row is `coord.mjs`' ledger check LC-undecided-route, which every
     coord write runs before its push (so a write that archives D-388 while the standard still routes to it is
     REFUSED) and plancheck runs against the coord view. */
  t("the undecided set is ROUTED to an entry somebody drains, not a sentence in a report — the standard names it, and "
  + "the live row is held by the coord ledger check LC-undecided-route",
    /D-388/.test(std) && /await arm\("LC-undecided-route"/.test(readFileSync(join(ROOT, "tools/coord.mjs"), "utf8")), true);

  // 6. the mechanism is in the loop the readers actually run
  const pc = readFileSync(join(ROOT, "tools/plancheck.mjs"), "utf8");
  t("plancheck imports and runs the coverage audit, not only checkFile", /coverage\(\)/.test(pc) && /coverage/.test(pc), true);
  t("the standard describes the walk in §7 so a reader meets it", /population\(\)/.test(std) && /Undecided —/.test(std), true);
}

/* ========================================================================== */
section("design status has ONE authority — the construct map, and the arm that refuses a second (M0-57)");
{
  /* Bob, 2026-09-17: `BIO_System_Design.md` §3 is the SINGLE AUTHORITY on design status, and
     "other areas [should] confirm that there aren't multiple sources of truth elsewhere in the
     record". THE RECEIPT IS A SESSION'S OWN ERROR: BOB #12 told Bob the claim class was
     UNDESIGNED because the Content Framework's §18 table listed it among the pieces designed
     nowhere — while `BIO_Case_Making_v0_1.md` had designed it on 2026-08-03.

     THE ARM THAT MATTERS MOST HERE IS OVER-STRICTNESS, and it is driven separately below against
     a LIVE true negative rather than a fixture: REC-116's route marker is genuinely undesigned,
     and a document that honestly says so must PASS. An arm that fires on a healthy state is
     worse than no arm — it is switched off inside a week and takes its true positives with it. */

  const real = (p) => readFileSync(join(ROOT, p), "utf8");
  const FRAMEWORK = "docs/architecture/BIO_Content_Framework_v0_10.md";
  const CASEMAKING = "docs/architecture/BIO_Case_Making_v0_1.md";

  // ---------------------------------------------------------------- 1. the REAL tree, healthy
  const live = statusAuthority();
  t("the construct map parses and every construct row is found", live.rows, 15);
  t("the real corpus has ONE authority on design status — no restatement", live.fails, []);
  /* A statement of what was EVALUATED, never `0 fail` alone: an arm that evaluated nothing is
     indistinguishable from an arm that is broken, which is this instrument's own family. */
  t("and it EVALUATED the receipt's pair rather than passing it by silence",
    live.pairs.map((p) => `${p.construct}·${p.citing}·${p.sec}·${p.item}·${p.verdict}`),
    /* CORRECTED 2026-09-18 by REC-124, never exempted: construct 8's `8.claim` row now cites
       `INVESTIGATIVE-SESSION.md` §7.1 item 4 (the half of §7.1 that is NOT built), so the map
       carries a SECOND real pair and the instrument evaluated it — verdict
       `list-claims-no-undesignedness`, a pass, because §7.1 is a design and says what it lacks.
       The arm pins the WHOLE evaluated set, so a pair that stops being evaluated still fails.
       CORRECTED AGAIN 2026-09-21 by BOB #21 at the map cut (M0-86), never exempted: `8.claim`'s
       rewritten text cites §7.1 item 9 too (the second edition over a moved conclusion, NOT built,
       REC-157), a THIRD real pair, evaluated with the same passing verdict. The old list was right
       of the old map and is wrong of this one; the whole set stays pinned. */
    [`8·docs/development/INVESTIGATIVE-SESSION.md·7.1·4·list-claims-no-undesignedness`,
     `8·docs/development/INVESTIGATIVE-SESSION.md·7.1·9·list-claims-no-undesignedness`,
     `8·${FRAMEWORK}·18·6·points-at-its-design`]);
  t("every citation in the map RESOLVED — an unresolved one is SAID, not skipped", live.unresolved, []);

  // -------------------------------------------- 2. THE RECEIPT, RE-ARMED AT THE REAL DOCUMENTS
  /* The arm is driven over the pair that ACTUALLY MISLED BOB, by reverting §18 item 6 to the
     words it carried before this item corrected it. Injected rather than written to disk: a
     fixture inside docs/architecture/ during a concurrent battery is the contamination class
     this project has paid for, and arm 1 pins the real tree directly. */
  const POINTER = "**DESIGNED 2026-08-03 in `BIO_Case_Making_v0_1.md`, §What a CLAIM is, and why it is a field rather than an object**";
  const framework = real(FRAMEWORK);
  t("ARM-THAT-DID-NOT-ARM GUARD: the corrected pointer is present exactly once before reverting",
    framework.split(POINTER).length - 1, 1);
  /* The pointer and the cell's original prose are ONE table cell, so a pipe-anchored revert
     matches nothing — which is how this suite's own guard earned its place on first run. Strip
     the pointer itself and leave the words item 6 carried before 2026-09-17. */
  const before = framework.replace(/\*\*DESIGNED 2026-08-03[\s\S]*?Bob's direction of 2026-09-14/,
    "Bob's direction of 2026-09-14");
  t("and the revert TOOK — the pointer is gone and item 6 is back to restating status",
    before.includes(POINTER) === false && before !== framework, true);

  const armed = statusAuthority({ docs: { [FRAMEWORK]: before } });
  t("THE RECEIPT FAILS — §18 item 6 restating a status the construct map's home has designed",
    armed.fails.length, 1);
  const f = armed.fails[0] || "";
  t("and the failure names the CONSTRUCT", /construct 8\b/.test(f), true);
  t("and it names BOTH documents — the one that restates and the one that designed it",
    f.includes(FRAMEWORK) && f.includes(CASEMAKING), true);
  t("and it names the piece in the words the document itself used", /the claim object/.test(f), true);
  t("and it says where the correction belongs — at the source, never as an exemption",
    /AT ITS SOURCE/.test(f) && /Never exempt it/.test(f), true);
  t("the pair's verdict is RESTATED and its covering document named",
    /* CORRECTED 2026-09-18 by REC-124: the second real pair (§7.1 item 4, see arm 1) is
       evaluated here too and stays a pass; the receipt's pair is still the one RESTATED.
       CORRECTED AGAIN 2026-09-21 by BOB #21 (M0-86): the third real pair (§7.1 item 9, see arm 1)
       is evaluated here as well and also passes; the receipt's pair is still the only one RESTATED. */
    armed.pairs.map((p) => [p.verdict, p.covering]),
    [["list-claims-no-undesignedness", null], ["list-claims-no-undesignedness", null], ["RESTATED", CASEMAKING]]);

  // --------------------- 3. THE LIAR'S ARM, EXCLUDED — a SECOND triple fires with NO TOOL EDIT
  /* The cheapest green for this row is an arm matching on a hand-written pair list holding
     exactly the one known receipt: it fails the receipt, passes everything else, and detects
     nothing that was not already found by hand. THE CRITERION THAT EXCLUDES IT is that a NEW
     instance must be caught with NO EDIT TO THE TOOL — so here is one, sharing not one construct
     number, document name, section number, item number or content word with the receipt. */
  const FX_MAP = `# Fixture system design

## 3. The major constructs

| # | construct | what it is | importance | relates to | home | state |
| --- | --- | --- | --- | --- | --- | --- |
| 4 | **Ballast trimming** | the trim ladder | it floats | none | \`FIXTURE_Ballast.md\` [\`FIXTURE_Trim_Ladder.md\`] | the trim ladder is DOCTRINE still Bob's (Part III §9 item 2) |
`;
  const FX_FRONT = (place) => `**Status** · A fixture document written to drive the corpuscheck authority arm, complete at its level, as of 2026-09-17.

**Place in the system** · ${place}

**Incomplete sections** · None — the fixture has no frontier.

**Contents**
- [x](#x)

---
`;
  const FX_LIST = `# Fixture ballast

${FX_FRONT("The ballast construct's home; nothing depends on it.")}
## 9. The central gap, and the pieces to design

The pieces to be designed, named here and designed nowhere in this document:

| # | piece | what it is | whose |
| --- | --- | --- | --- |
| 1 | **the keel sensor** | a sensor | the architect |
| 2 | **the trim ladder** | the rungs by which trim is earned | the architect |

## 10. After
`;
  const FX_HOME = `# Fixture trim ladder

${FX_FRONT("The reasoning behind construct 4 of `FIXTURE_MAP.md` §3 (ballast trimming).")}
## How the trim ladder is earned — 2026-01-01

It is earned.
`;
  const fxDocs = {
    "docs/architecture/FIXTURE_Ballast.md": FX_LIST,
    "docs/architecture/FIXTURE_Trim_Ladder.md": FX_HOME,
  };
  const synth = statusAuthority({ mapText: FX_MAP, docs: fxDocs });
  t("A SECOND, WHOLLY SYNTHETIC TRIPLE FIRES WITH THE TOOL UNTOUCHED — the pairing is read from "
    + "the corpus, not from a list in the tool", synth.fails.length, 1);
  t("and it names that construct and both of ITS documents, sharing nothing with the receipt",
    /construct 4\b/.test(synth.fails[0]) && synth.fails[0].includes("FIXTURE_Ballast.md")
    && synth.fails[0].includes("FIXTURE_Trim_Ladder.md"), true);

  // ------------ 4. OVER-STRICTNESS, DRIVEN AGAINST A LIVE TRUE NEGATIVE — REC-116's route marker
  /* REC-116 is BLOCKED because its construct genuinely has NO HOME: `BIO_System_Design.md` never
     mentions the route marker, and Part II §17 — the section a queue row named as its authority —
     contains the marker zero times. A document that honestly says THAT must still pass. This is
     the arm that decides whether the instrument survives contact with the corpus. */
  t("the live true negative holds AT THE ARTIFACT: the construct map never mentions the route marker",
    /LOOKED_INDETERMINATE/.test(real(MAP_DOC)) === false
    && /route marker/i.test(real(MAP_DOC)) === false, true);
  const TN_MAP = FX_MAP.replace("| 4 | **Ballast trimming** | the trim ladder | it floats | none | `FIXTURE_Ballast.md` [`FIXTURE_Trim_Ladder.md`] |",
    "| 4 | **Ballast trimming** | the trim ladder | it floats | none | `FIXTURE_Ballast.md` |");
  t("ARM-THAT-DID-NOT-ARM GUARD: the home document really was removed from the row",
    TN_MAP !== FX_MAP && TN_MAP.includes("FIXTURE_Trim_Ladder.md") === false, true);
  const tn = statusAuthority({ mapText: TN_MAP, docs: fxDocs });
  t("REC-116's SHAPE PASSES — a construct the map gives no covering home is honestly undesigned "
    + "and the arm does NOT fire", tn.fails, []);
  t("and the pair is still EVALUATED and its verdict SAID, so the pass is a finding not a silence",
    tn.pairs.map((p) => p.verdict), ["honestly-undesigned — no home document this map names covers it"]);

  // ---------------------------------------------- 5. the other three ways a healthy pair passes
  const pointing = FX_LIST.replace("| 2 | **the trim ladder** | the rungs by which trim is earned |",
    "| 2 | **the trim ladder** | **DESIGNED 2026-01-01 in `FIXTURE_Trim_Ladder.md`** — the rungs |");
  t("an item that POINTS at its design is healthy — which is why §18's items 1-4 are silent here",
    statusAuthority({ mapText: FX_MAP, docs: { ...fxDocs, "docs/architecture/FIXTURE_Ballast.md": pointing } }).fails, []);
  const notAList = FX_LIST.replace("## 9. The central gap, and the pieces to design", "## 9. The parts, as built")
    .replace("The pieces to be designed, named here and designed nowhere in this document:", "The parts, as built:");
  t("a cited section that claims NO undesignedness is not a to-do list and is never judged",
    statusAuthority({ mapText: FX_MAP, docs: { ...fxDocs, "docs/architecture/FIXTURE_Ballast.md": notAList } }).fails, []);
  const noDeclare = FX_HOME.replace("construct 4 of", "construct 11 of");
  t("a home document that does NOT declare this construct in its Place line does not count as cover",
    statusAuthority({ mapText: FX_MAP, docs: { ...fxDocs, "docs/architecture/FIXTURE_Trim_Ladder.md": noDeclare } }).fails, []);
  const noHeading = FX_HOME.replace("## How the trim ladder is earned — 2026-01-01", "## Generalities");
  t("nor does a home document with no HEADING naming the piece — a body mention is not evidence "
    + "this arm will act on", statusAuthority({ mapText: FX_MAP, docs: { ...fxDocs, "docs/architecture/FIXTURE_Trim_Ladder.md": noHeading } }).fails, []);

  // ------------------------------- 6. an absence is SAID, never concluded from silently skipping
  const badSec = FX_MAP.replace("§9 item 2", "§77 item 2");
  const u1 = statusAuthority({ mapText: badSec, docs: fxDocs });
  t("a citation naming a section no document has is UNRESOLVED and named, not quietly dropped",
    [u1.fails.length, u1.unresolved.length, /has a §77/.test(u1.unresolved[0] || "")], [0, 1, true]);
  const badItem = FX_MAP.replace("§9 item 2", "§9 item 9");
  const u2 = statusAuthority({ mapText: badItem, docs: fxDocs });
  t("and a citation naming an item the section has not is UNRESOLVED and named",
    [u2.fails.length, u2.unresolved.length, /no item 9/.test(u2.unresolved[0] || "")], [0, 1, true]);
  const oneWord = FX_LIST.replace("**the trim ladder**", "**the ladder**");
  const u3 = statusAuthority({ mapText: FX_MAP, docs: { ...fxDocs, "docs/architecture/FIXTURE_Ballast.md": oneWord } });
  t("a one-content-word key is SKIPPED and said — one generic noun is not a match this arm makes",
    [u3.fails.length, /fewer than two content words/.test(u3.unresolved[0] || "")], [0, true]);
  t("keyWords drops articles and keeps the content words", keyWords("**the claim object**"), ["claim", "object"]);

  // ----------------------------------------------------- 7. the helpers, and the loop it runs in
  t("numberedSection stops at the next heading of the same level, not the next heading at all",
    /19\. Where this document is the authority/.test(numberedSection(framework, "18").body), false);
  t("numberedSection finds the section it is asked for", /the central gap/i.test(numberedSection(framework, "18").heading), true);
  t("constructMap reads the map's own header row rather than fixed column positions",
    constructMap().filter((r) => r.n === 8).map((r) => /Intent and inquiry/.test(r.construct)), [true]);
  const pc2 = readFileSync(join(ROOT, "tools/plancheck.mjs"), "utf8");
  t("the mechanism is IN THE LOOP — plancheck runs the authority arm, not only the front matter",
    /statusAuthority\(\)/.test(pc2), true);
  t("and the standard's §3 ruling is written where a reader of the map meets it",
    /SINGLE AUTHORITY ON DESIGN STATUS/i.test(real(MAP_DOC)), true);
}

/* ------------------------------------------ the UNDESIGNED predicate's gap (M0-61) */
section("UNDESIGNED spans a SOFT line break on purpose and a PARAGRAPH break never (M0-61)");
{
  /* THE LIAR, NAMED FIRST: the cheapest green was a literal space in place of `\s`, which clears
     M0-58's one receipt and silently loses every genuine claim whose wrap fell mid-phrase. So the
     over-strictness arms come first and quote the corpus's own genuine claims verbatim. */
  t("a genuine SINGLE-LINE claim is still matched (the TRUE match this row must not remove)",
    UNDESIGNED.test("the claim object is not designed anywhere"), true);
  t("a genuine claim SOFT-WRAPPED mid-phrase is matched — Content Framework Part II's own words",
    UNDESIGNED.test("how it can be reached, and what remains to be\ndesigned — in that order"), true);
  t("and Functional Architecture's — the wrap column must not decide a claim's visibility",
    UNDESIGNED.test("it then moves first to the UI, which still needs to be\ndesigned; once"), true);
  t("tabs, runs of spaces, an indented continuation and CRLF are all one gap",
    ["not\tdesigned", "not   yet  designed", "to be\n   designed", "not\r\ndesigned"].map((s) => UNDESIGNED.test(s)),
    [true, true, true, true]);
  /* THE NARROWING — the arm the negative control breaks. */
  t("a PARAGRAPH break is never spanned: words either side belong to different statements",
    ["not\n\ndesigned", "to be\n \t\ndesigned", "## Not\n\nDesigned here", "pieces to\n\n\ndesign"].map((s) => UNDESIGNED.test(s)),
    [false, false, false, false]);
  t("a break into another block is not spanned (the marker is not whitespace)",
    UNDESIGNED.test("not\n| designed |"), false);
  t("the reason is written AT THE SITE, where the next caller meets it",
    /SPANS ONE SOFT LINE BREAK, DELIBERATELY/.test(readFileSync(join(ROOT, "tools/corpuscheck.mjs"), "utf8")), true);
}


t("every section reached an assertion (the FOOT sentinel)", reached, SECTIONS);
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
