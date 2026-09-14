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
 * `tools/plancheck.mjs` -> the "mechanism is in the loop" arm FAILS.
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
const { ROOT, governed, checkFile, writeContents, parseFront, bodyHeadings, renderContents } =
  await import(join(REPO_ROOT, "tools/corpuscheck.mjs"));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const SECTIONS = 6;
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
section("the governed set is what the standard says, no more");
{
  const g = governed();
  t("every docs/architecture/*.md is governed", g.includes("docs/architecture/BIO_Content_Framework_v0_10.md") && g.includes("docs/architecture/README.md"), true);
  t("the standard's §5 table rows are governed", g.includes("docs/development/CONTENT-EXTENT-DESIGN-SPACE.md"), true);
  t("not-yet-governed rows are NOT governed (the sub-heading ends the table)", g.includes("docs/development/STORE-AS-CACHE.md"), false);
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

t("every section reached an assertion (the FOOT sentinel)", reached, SECTIONS);
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
