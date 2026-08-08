/* NEGATIVE CONTROL: (run 2026-08-08, m0-12-agent, M0-12) SIX arms, each RUN ALONE
   with the others held open, every edited file restored and verified by sha256 AND
   by `cmp` content compare, with every snapshot named uniquely by ARM as well as by
   path. Driven by `node test/op-claims.control.mjs`.
   Baseline 33 pass / 0 fail. Every arm came back AS DECLARED; the counts below are
   the ones MEASURED, not predicted.
   (a) plant a comment naming an op that does not exist, in `bio-plane/src/store.mjs`
       -> FAILS naming the file, the line and the op -> 32 pass / 1 FAIL.
   (b) plant IC-22's actual false sentence — the DO path written as an op — into a
       planning document -> FAILS as WRONG-LEVEL, naming `docs/development/
       VERIFICATION.md:<line>` and the op that really routes there (`op=publish`)
       -> 32 pass / 1 FAIL.
   (c) NEUTER THE WALK: `corpus()` returns nothing -> 27 pass / 6 FAIL, the corpus
       PRINTS `0 files`, and the reach fails as a DELTA. **AND THE FINDING THIS ARM
       EXISTS FOR REPRODUCED: the headline "no false claim anywhere" assertion
       STILL PASSED over the empty corpus** — vacuously true of nothing. It is
       caught only by the paired non-triviality assertions in section 2, which is
       why they are there and why they are asserted rather than printed.
   (d) NEUTER THE MATCHER: `mentionsIn()` returns `[]` -> 25 pass / 8 FAIL, the
       reach fixtures and the ledger both.
   (e) OVER-STRICTNESS: legitimate prose in spellings this suite did not author —
       `const op = q.get("op")`, a template-built name, `stop=`/`noop=`/`crop=`, a
       heading, a URL and a bare mention — planted into a REAL document
       -> 33 pass / 0 FAIL. **THE ARM PASSES ONLY BY NOT FIRING**, and it is the arm
       that decides whether this check survives contact with the estate.
   (f) break the dispatch reader's ALIAS half (`DO_PATH` emptied, routes kept)
       -> 29 pass / 4 FAIL. Existence alone was never the check; this is the half
       that catches IC-22 and it is the half that fails when it is removed. */

/* M0-12 — A COMMENT NAMING AN OP IS A CLAIM ABOUT THE DISPATCH TABLE.
 *
 * REC-58 was a whole queue item spent on one sentence in IC-22's SETTLED text.
 * The sentence was false, it had already been COPIED into the item's own scope,
 * and nothing in this repository could have told anybody. This suite is the thing
 * that tells somebody.
 *
 * WHAT IT ESTABLISHES, and read this before quoting it as a defence:
 *
 *   IT DOES     say that every `op=<name>` written anywhere in the corpus names a
 *               key of the OPS whitelist, or is registered with a human's reason.
 *   IT DOES     separate the two LEVELS — an op and a Durable Object path are not
 *               the same table, and the alias means the names do not correspond.
 *               This is the half that catches IC-22's sentence.
 *   IT DOES     check a stated ROUTING: prose saying an op dispatches to a named
 *               method must agree with the table.
 *   IT DOES NOT check what an op RETURNS. Nothing here reads a response shape.
 *               IC-22's sentence was wrong twice — wrong op AND wrong field — and
 *               only the op half is mechanical. **A field arriving through a
 *               SPREAD declares no key**, so no source-level instrument can see
 *               it; REC-58 measured that precisely and it is why this suite says
 *               so rather than reading as complete.
 *   IT DOES NOT verify that a stated NON-existence is true. See the long note in
 *               `scripts/op-claims.mjs`: that inversion was built, measured at a
 *               100% false-positive rate on this corpus, and removed.
 *
 * WOULD IT HAVE CAUGHT IC-22? YES, AND FOR A REASON WORTH BEING PRECISE ABOUT.
 * Not because it verifies the return shape — it does not — but because the
 * sentence named `publishcase` as an op and there is no such op. `DO_PATH` aliases
 * `op=publish` onto that DO path. The item that would have been saved was saved by
 * the level check, not by the behaviour check, and a report that claimed otherwise
 * would be exactly the overclaim this project treats as worse than a gap.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import {
  sweep, readDispatch, corpus, mentionsIn, routeOf, opReaching,
  generatedReason, LEDGER, PLANNED_OPS, REPO,
} from "../scripts/op-claims.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`
    + (ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`));
  ok ? pass++ : fail++;
};

/* ---------------------------------------------------- 1. the authority is real */
/* A dispatch reader that read NOTHING would make every claim below vacuously true,
   so the table is asserted to be non-trivial BEFORE anything is checked against it.
   This is the empty-corpus failure one level up: an authority of size zero agrees
   with every sentence ever written. */
console.log("\n--- 1. the dispatch table was actually READ, at both levels ---");
const table = readDispatch();
t("OPS is a non-trivial whitelist read out of src/index.mjs", table.ops.size >= 120, true);
t("the store's dispatch map is a non-trivial route table read out of src/store.mjs",
  table.routes.size >= 120, true);
t("DO_PATH — the alias map — was read and is non-empty", table.doPath.size >= 1, true);

/* THE ALIAS IS THE WHOLE REASON EXISTENCE ALONE IS NOT THE CHECK. Pinned by value:
   if this stops being true the level check below stops meaning what it says. */
t("`op=publish` is an ALIAS onto the DO path `publishcase` — the op whose NAME matches "
+ "the method is routed AWAY from it, which is why a name-existence check would have "
+ "passed IC-22's sentence",
  table.doPath.get("publish"), "publishcase");
t("and the DO path `publishcase` is NOT itself an op — sending it as `op=` is `unknown op`",
  table.ops.has("publishcase"), false);
t("the routing chain resolves end to end: op=publish -> publishcase -> publishCase()",
  routeOf("publish", table), { doPath: "publishcase", method: "publishCase" });
t("and the wrong-level answer names the op that DOES reach that path",
  opReaching("publishcase", table), "publish");

/* ------------------------------------------------------ 2. the corpus was READ */
/* PRINTED EVERY RUN, so a corpus that SHRANK is visible rather than silent. Three
   separate walks in this repository this week reported a beautiful clean verdict
   over an empty corpus, twice inside the instrument built to prevent it. */
console.log("\n--- 2. the corpus, PRINTED, and asserted non-trivial ---");
const result = sweep();
console.log(`  M0-12 CORPUS: ${result.files} files, ${result.chars} chars scanned; `
  + `${result.mentions} op= mentions over ${result.names.length} distinct names; `
  + `${result.dynamic} dynamic (template-built) skipped; `
  + `${result.excluded.length} generated artifact(s) excluded `
  + `(${result.excluded.map((x) => `${x.rel} ${x.chars} — ${x.why}`).join("; ")})`);
console.log(`  M0-12 LEDGER: ${LEDGER.length} (file,name) registrations · `
  + `${LEDGER.reduce((a, e) => a + e.n, 0)} sites · ${PLANNED_OPS.length} PLANNED op name(s)`);

t("the corpus is non-trivial — a walk over nothing reports its verdict triumphantly",
  [result.files >= 300, result.chars >= 10_000_000], [true, true]);
t("and it found a non-trivial population of op= mentions to check",
  [result.mentions >= 5000, result.names.length >= 150], [true, true]);
t("BOTH generated embeds of the plane are excluded, each recognised STRUCTURALLY at "
+ "byte 0 and NEITHER by filename — a walk excluding only the warned-about one reads "
+ "the plane's own comments as a third party's claims about it",
  [result.excluded.length,
   result.excluded.some((x) => /newgroup\/src\/release\.mjs/.test(x.rel)),
   result.excluded.some((x) => /release\/bio-plane\.bundled\.mjs/.test(x.rel))],
  [2, true, true]);
t("AND THE GENERATOR IS KEPT IN — `newgroup/scripts/embed-release.mjs` carries the "
+ "banner because it WRITES it; excluding it would hide a real claim while still reading green",
  generatedReason(readFileSync(join(REPO, "newgroup/scripts/embed-release.mjs"), "utf8")), null);

/* --------------------------------------- 3. THE HEADLINE: no unaccounted claim */
console.log("\n--- 3. every op= mention names a real op, or is registered with a reason ---");
const nameFinding = (f) => `${f.site} · ${f.class} · ${f.detail}`;
t(`no comment and no planning document names an op that is not in the dispatch table `
+ `(${result.mentions} mentions checked)`,
  result.findings.filter((f) => f.class !== "WRONG-METHOD").map(nameFinding), []);
t("and no prose attributes an op to a method the dispatch table does not route it to",
  result.findings.filter((f) => f.class === "WRONG-METHOD").map(nameFinding), []);
t("the attribution half found real routing claims to check — a grammar matching "
+ "nothing would pass this vacuously",
  result.attributions.length >= 4, true);

console.log("\n--- 4. the ledger is held EXACTLY, and every entry can expire ---");
t("no ledger entry has drifted: each registered (file,name) appears exactly as many "
+ "times as it says, and each kind's own assertion still holds",
  result.ledgerDrift, []);
t("no PLANNED op has been BUILT — a registration that outlived its deferral is a "
+ "document that became true while nobody re-read it",
  result.plannedBuilt, []);
t("the ledger is non-empty and every entry carries a reason",
  [LEDGER.length >= 20, LEDGER.every((e) => typeof e.why === "string" && e.why.length >= 8)],
  [true, true]);

/* ------------------------------------------------------- 5. REACH, AS A DELTA */
/* Every arm below is a DELTA between text that must fire and text that must not,
   never an absolute count. A detector that finds nothing passes every absolute. */
console.log("\n--- 5. REACH: the matcher fires on what it must, as a delta ---");

const flagged = (text) => {
  const out = [];
  for (const mt of mentionsIn(text)) {
    if (mt.kind === "DYNAMIC") continue;
    if (table.ops.has(mt.name)) continue;
    out.push(mt.name);
  }
  return out;
};

/* THE FIXTURES ARE BUILT, NEVER SPELLED, AND THAT IS NOT A STYLE CHOICE.
   This suite sits INSIDE the corpus it sweeps. A fixture written literally is a
   claim about the dispatch table sitting in a file the walk reads, and the first
   draft of this suite FAILED ITSELF in four places — exactly the "sweep arm that
   failed by citing itself" shape this project has already paid for. Composing the
   token at runtime leaves no claim in the source while the test carries the whole
   one. `scripts/op-claims.mjs` obeys the same rule in its own header, for the same
   reason: an instrument that cannot live under its own rule is telling you the
   rule is wrong. */
const OP = (n) => "op=" + n;

const CLEAN = `the caller sends ${OP("publish")} and the plane answers; see ${OP("ratify")} and ${OP("audit")}.`;
const PLANTED_UNKNOWN = `the caller sends ${OP("notarealopatall")} and the plane answers.`;
const PLANTED_WRONGLEVEL = `${OP("publishcase")} returns \`opened\` to the member who just published.`;

t("REACH (a) AS A DELTA — a planted comment naming an op that DOES NOT EXIST is "
+ "flagged, and the same sentence with a real op is not",
  [flagged(CLEAN), flagged(PLANTED_UNKNOWN)], [[], ["notarealopatall"]]);
t("REACH (b) AS A DELTA — IC-22's ACTUAL SENTENCE, the DO path written as an op, is "
+ "flagged; this is the arm the whole item exists for",
  [flagged(CLEAN), flagged(PLANTED_WRONGLEVEL)], [[], ["publishcase"]]);

/* The two classes must be DISTINGUISHED, not merged: "no such name anywhere" and
   "a real name at the wrong level" need different corrections, and only the second
   can name the op that actually routes there. */
const classOf = (text) => {
  const r = sweepText(text);
  return r.map((f) => f.class);
};
function sweepText(text) {
  const out = [];
  for (const mt of mentionsIn(text)) {
    if (mt.kind === "DYNAMIC" || table.ops.has(mt.name)) continue;
    out.push({ class: table.routes.has(mt.name) ? "WRONG-LEVEL" : "NO-SUCH-OP", name: mt.name });
  }
  return out;
}
t("REACH (c) — the two classes are told apart, because they need different corrections",
  [classOf(PLANTED_UNKNOWN), classOf(PLANTED_WRONGLEVEL)], [["NO-SUCH-OP"], ["WRONG-LEVEL"]]);

/* The attribution half, both directions, on fixtures. */
const attributedIn = (text) => mentionsIn(text)
  .filter((m) => m.kind !== "DYNAMIC" && m.attributed)
  .map((m) => `${m.name}->${m.attributed}`);
t("REACH (d) AS A DELTA — a stated routing is READ, and the right one and the wrong "
+ "one are read identically; it is the comparison that separates them",
  [attributedIn(`${OP("publish")} dispatches to \`Store.publishCase()\`, which is correct.`),
   attributedIn(`${OP("publish")} dispatches to \`Store.publishSomethingElse()\`, which is not.`),
   attributedIn(`${OP("publish")} is the state act.`)],
  [["publish->publishCase"], ["publish->publishSomethingElse"], []]);

/* ------------------------------------------- 6. OVER-STRICTNESS, THE ARM THAT
   DECIDES WHETHER THIS SURVIVES CONTACT WITH THE ESTATE. A hygiene check that
   cries wolf gets switched off, which is VERIFICATION.md's own stated reason for
   not making --strict the gate yet. Each fixture below is a REAL shape from this
   tree, in a spelling this suite's author did not invent. */
console.log("\n--- 6. OVER-STRICTNESS: legitimate prose in unanticipated spellings must NOT fire ---");
const MUSTNOT = [
  ["a JS assignment, live in three civicos-ui suites",
   `fetch: async u => { const q = new URL(u,"https://x.test").searchParams, ${OP("q")}.get("op"); }`],
  ["another assignment spelling, same class",
   `const p = new URL(u).searchParams; const ${OP("p")}.get("op");`],
  ["a name BUILT at runtime, which no source reader can resolve",
   "return `" + OP("version") + "${act} moves what the record stands on`;"],
  ["a longer word ENDING in op=, which is not an op mention at all",
   "the request carried stop=1 and noop=true and crop=full"],
  ["a real op named in ordinary prose, no backticks, mid-sentence",
   `the operator then runs ${OP("audit")} and reads the findings`],
  ["a real op inside a URL with parameters after it",
   `await GET("${OP("image")}&token=mem-rec17&id=" + encodeURIComponent(id))`],
  ["a real op named at the very start of a line",
   `${OP("promote")} is the write path\nand nothing else is`],
  ["an ANGLE-BRACKETED placeholder in a rule's own template text",
   "every `" + OP("<name>") + "` appearing in a comment must name a real op"],
  ["an op named in a heading with punctuation immediately after",
   `### ${OP("ratify")}, and what it refuses`],
  ["a real op followed immediately by a closing backtick and a comma",
   `see \`${OP("promote")}\`, \`${OP("acquire")}\` and \`${OP("attest")}\``],
];
for (const [why, text] of MUSTNOT)
  t(`MUST NOT FIRE — ${why}`, flagged(text), []);

/* And the arm's own control: the fixtures are not passing because the matcher is
   dead. One planted violation in the SAME shapes must still fire. */
t("...and the must-not-fire fixtures are not passing because the matcher is dead — "
+ "one planted violation in the same shapes still fires",
  flagged(`the operator then runs ${OP("notarealopatall")} and reads the findings`),
  ["notarealopatall"]);

/* --------------------------------------------------- 7. the walk reads FILES */
/* corpus() is the half a neutering hits hardest, so it is asserted directly rather
   than only through the headline. */
console.log("\n--- 7. the walk reads real files from both halves of the named corpus ---");
const rels = new Set(corpus().files.map((f) => f.rel));
t("the walk reaches bio-plane source, bio-plane tests, docs/development, the "
+ "kickoffs, the installer and the UI — the sentence that cost REC-58 an item was "
+ "in a planning document, not in code",
  [rels.has("bio-plane/src/store.mjs"), rels.has("bio-plane/src/index.mjs"),
   rels.has("bio-plane/test/case-opened.test.mjs"),
   rels.has("docs/development/INTERFACE-CHANGES.md"),
   rels.has("docs/development/QUEUE.md"),
   [...rels].some((r) => r.startsWith("docs/development/kickoffs/")),
   [...rels].some((r) => r.startsWith("newgroup/")),
   rels.has("civicos-ui/app.html")],
  [true, true, true, true, true, true, true, true]);

console.log(`\nop-claims: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
