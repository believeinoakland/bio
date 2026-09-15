#!/usr/bin/env node
/* attribution — DOES THE CITATION RESOLVE TO THE ACTOR THE SENTENCE NAMES?  M0-39, 2026-09-15.
 *
 * WHY THIS EXISTS, and it is a measured pair of violations rather than a style worry.
 *
 * THE CONVENTION THIS CORPUS RUNS ON.  `RULED by Bob` means DOCTRINE: a ruling the
 * architect made, which no session may revisit.  A SESSION's own name means MECHANISM:
 * a decision a later session MAY revisit on evidence.  The distinction is load-bearing
 * in exactly one direction — **a mechanism decision wearing doctrine's attribution
 * becomes UNREVISABLE IN PRACTICE**, because the next reader works around the rule
 * instead of correcting it, and working around a rule leaves no trace the way
 * correcting it does.  The reverse error is cheap; this one compounds.
 *
 * WHAT HAPPENED, 2026-09-15.  FIVE landed plane comments called commit `9954a9c` a
 * ruling of Bob's.  That commit is the BOB #11 SESSION's own correction of its own
 * design document — mechanism under Bob's standing delegation, not doctrine.  It was
 * raised by BOB #11 itself and corrected in the plane at that wave's close.  Nothing
 * in the repository could have found the other instances, and the wave missed several.
 *
 * ------------------------------------------------------------------ what it checks
 *
 * NOT A BANNED PHRASE, AND THE ROW THIS ITEM CAME FROM SAYS SO BEFORE THE CODE DOES:
 * a banned-phrase list would be WORSE THAN NOTHING here, because `RULED by Bob` is
 * CORRECT wherever he actually ruled and this corpus is full of places he did.  An arm
 * that can be satisfied by a corpus-wide rewrite of one phrase has verified NOTHING —
 * it can be satisfied by making every attribution uniformly WRONG, which is the cheap
 * defeat this shape invites.
 *
 * SO THE CHECK IS A PAIRING, AND THE VERDICT COMES FROM RESOLVING THE CITATION.  Every
 * attribution in this corpus binds an ACTOR to a CITATION — the pointer to where the
 * decision was made.  There are two kinds of citation and the repository can resolve
 * BOTH from its own records:
 *
 *   COMMIT    a sha.  `git` resolves it, and the commit's own record says who wrote it.
 *   DECISION  a `DEC-n`.  `DECISIONS.md` carries the entry and its `for:` field is the
 *             register's OWN declaration of whose decision it is.
 *
 * The tell the corpus already uses: **a ruling attributed to Bob names a DATE and a
 * place he ruled it; a mechanism attributed to a session names the SESSION and its
 * COMMIT.**  So the arm reads the actor bound to the citation, resolves the citation,
 * and FAILS WHERE THE TWO DISAGREE — in BOTH directions:
 *
 *   an ARCHITECT attribution bound to a SESSION-authored commit, and
 *   a SESSION attribution bound to a decision the register records as the ARCHITECT's.
 *
 * Firing in only one direction would be enforcing a house style rather than verifying a
 * pairing, and a swap of the two forms would go half-caught.
 *
 * WHY A COMMIT RESOLVES TO A SESSION, AND IT IS A STANDING FACT OF THIS PROJECT RATHER
 * THAN AN ASSUMPTION.  `CLAUDE.md`: Bob "was once fluent in shells and editors and is
 * deliberately no longer, and that is a settled fact about how this project runs" —
 * never hand him a command to run.  He does not operate git.  Every commit here is a
 * SESSION's act, and the git identity on it is the machine's, not evidence of
 * authorship: MEASURED 2026-09-15 over `origin/main`, 1,525 of 1,740 commits carry the
 * author `Bob Krause` while 1,221 carry a `Co-Authored-By: Claude` trailer, so the
 * AUTHOR FIELD DISCRIMINATES NOTHING and the trailer is what speaks.  `9954a9c` and
 * `dc697b5` are both `bob:`-prefixed, Claude-co-authored BOB-session commits, and the
 * corpus has already ruled on the first of those two that it is "the BOB #11 SESSION's
 * commit".  The same reading is applied to the second here rather than to one of them.
 *
 * A commit whose record carries NO session marker is UNDETERMINED, reported as itself
 * and never scored clean — undetermined is first-class (`CLAUDE.md`), and a gate that
 * pressures a reader into inventing an attribution is a bug in the gate.
 *
 * ------------------------------------------------------------------ what it does NOT
 *
 * STATED BECAUSE A MATCHER'S REACH IS THE LOAD-BEARING SENTENCE (`WORKER.md`).
 *
 *   - A sha that is a POINTER rather than an attribution is not an attribution and is
 *     not read as one.  "Complete as a study at `origin/main` `51d128a`" names a tree;
 *     "Bob's 2026-09-14 rule is landed at `8e7e247`" attributes the RULE to Bob with its
 *     own date and the LANDING to whoever committed it, which is correct and common.
 *     The binding grammar below therefore requires ADJACENCY between the actor and the
 *     citation, and every one of those forms passes.  Both cases are driven in
 *     `tools/nc-m039.mjs`'s over-strictness arm.
 *   - A ruling of Bob's cited by DATE AND PLACE with no sha and no `DEC-n` — the
 *     commonest correct architect attribution in this corpus — carries no citation this
 *     arm can resolve, so it is not graded.  That is the safe direction: the arm can say
 *     a pairing is WRONG and cannot certify one is right.
 *   - `docs/archive/` (closed history), `docs/DECIDED.md` (GENERATED — a finding there
 *     belongs against the line it quotes, which is in the corpus already; the
 *     repository's own `generatedReason()` convention) and `bio-plane/dist/` (a built
 *     artifact) are outside the corpus.
 *   - `docs/development/CLAIMS.md` is outside the corpus **and this is a rule, not a
 *     convenience**: that file is APPEND-ONLY by its own stated rules — "States are
 *     added, never edited in place" — so a released block cannot be corrected and an arm
 *     demanding it be corrected would be demanding a rule violation.  Findings there are
 *     REPORTED by `--census` and by this item's release line rather than gated.
 *   - Prose that attributes without citing anything is invisible here.  This grades
 *     PAIRINGS; it does not grade unsourced claims.
 *
 * ------------------------------------------------------------------ usage
 *
 *   node tools/attribution.mjs            the gate's own view: findings, exit 1 on any
 *   node tools/attribution.mjs --census   every binding read, including the clean ones
 *                                         and the excluded files' own findings
 */

import { readFileSync, statSync, readdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/* THE CORPUS.  Roots rather than a hand list, for the reason this repository has
   measured more than any other: a hand-kept list falls behind silently.  A root added
   to the tree is covered the day it appears. */
const ROOTS = ["docs", "bio-plane/src", "bio-plane/checks", "bio-plane/test", "bio-plane/scripts",
               "civicos-ui", "tools", "pdf-worker", "ocr-worker", "agent-worker", "newgroup", "docprofile"];

/* EXCLUDED, each with the reason it is excluded — see "what it does NOT" above. */
export const EXCLUDED = [
  { path: "docs/archive/", why: "closed history; the archive is where finished work goes and is not corrected in place" },
  { path: "docs/DECIDED.md", why: "GENERATED from the corpus — a finding here belongs against the line it quotes, which this arm already reads" },
  { path: "docs/development/CLAIMS.md", why: "APPEND-ONLY by its own rules: a released block is history and may not be edited in place, so a finding here has no fix the rules permit. Reported by --census, never gated" },
  { path: "bio-plane/dist/", why: "a built artifact; its source is in the corpus" },
  { path: "newgroup/src/release.mjs", why: "a BUILT BUNDLE checked in as one string literal — every binding in it is a copy of a comment this arm already reads at its source, so grading it counts one fact twice" },
  { path: "node_modules", why: "vendor" },
];

const excluded = (rel) => EXCLUDED.some((e) => e.path.endsWith("/") ? rel.startsWith(e.path) : rel === e.path)
                       || rel.includes("node_modules/");

export function corpusFiles({ repo = REPO_ROOT } = {}) {
  const out = [];
  const walk = (p) => {
    let st; try { st = statSync(p); } catch { return; }
    if (st.isDirectory()) {
      for (const n of readdirSync(p).sort()) walk(join(p, n));
      return;
    }
    if (!/\.(mjs|js|md|html)$/.test(p)) return;
    const rel = relative(repo, p).split(sep).join("/");
    if (excluded(rel)) return;
    out.push(rel);
  };
  for (const r of ROOTS) { const p = join(repo, r); if (existsSync(p)) walk(p); }
  return out;
}

/* ------------------------------------------------------------------ the two actors
 *
 * AN ACTOR IS RECOGNISED, A VERDICT IS NOT.  These patterns say only WHO the sentence
 * names; nothing here decides whether the sentence is right.  That is the whole point of
 * the split — the phrase identifies the actor, the CITATION decides the verdict. */

const ARCHITECT = String.raw`Bob`;
/* A SESSION names itself one of four ways in this corpus, measured over the record:
   a lettered session with a number (`BOB #11`, `CONDUCT #9`), an area session
   (`session RECORD`, `the DIST session`), a queue-item worker (`REC-94`, `M0-39`), or
   the bare orchestrator (`CONDUCT`). */
const SESSION = String.raw`(?:(?:BOB|CONDUCT|DIST|RECORD|CAPTURE|FRAMEWORK|FLEET|UI)\s*#\s*\d+` +
                String.raw`|(?:session|the)\s+(?:BOB|CONDUCT|DIST|RECORD|CAPTURE|FRAMEWORK|FLEET|UI)\b` +
                String.raw`|(?:REC|UI|CPDF|COFF|CAP|FW|FL|PL|SK|IS|VF|M0|DIST|DS|CASE)-\d+` +
                String.raw`|CONDUCT)`;

/* The verbs that put an actor in the AGENTIVE position of a decision.  Shared with
   `tools/decided.mjs`'s MARKER set on purpose: one vocabulary for "a decision happened
   here", used by the index that finds them and by the arm that grades their attribution. */
const RULED = String.raw`(?:RULED|DECIDED|AMENDED|CORRECTED|OVERTURNED|SETTLED|SUPERSEDED` +
              String.raw`|ruled|rules|decided|amended|corrected|overturned|settled|superseded)`;

/* The nouns an attribution may put between a possessive and its citation.  Deliberately
   SHORT and deliberately about the ARTIFACT — `Bob's own correction (<cit>)` binds, and
   `Bob's 2026-09-14 rule is landed at <cit>` does NOT, which is the whole difference
   between an attribution and a landing note. */
const ARTIFACT = String.raw`(?:own\s+|OWN\s+)?(?:commit|correction|ruling|change|landing|fix|call|sha)?\s*`;

/* A CITATION, in the two kinds this arm can RESOLVE.  A sha is required to be
   backticked — this corpus backticks every one, and an unquoted 7-hex run in prose is
   noise (`fb1f904` yes, `deadbeef` in a fixture no). */
const SHA_CIT = String.raw`\x60([0-9a-f]{7,40})\x60`;
/* A REGISTER ID, AND IT MAY NOT BE FOLLOWED BY A POSSESSIVE.  `FL-3 corrected DEC-65's
   ENTRY` is a session correcting the register ROW, not a session claiming the decision —
   the possessive after the id moves the object from the decision to a thing belonging to
   it.  FOUND BY THIS ARM'S OWN `--census` OVER THE PATHS IT EXCLUDES, which is the reason
   the excluded paths are read at all: an exclusion whose consequences nobody sees hides
   the arm's own defects as well as the corpus's.  The clause runs in BOTH directions —
   `Bob ruled DEC-72's scope` is equally about the scope — so it is on the citation rather
   than on one shape. */
const DEC_CIT = String.raw`\b(DEC-\d+)\b(?!['’]s)`;

/** The grammatical shapes that BIND an actor to a citation. Adjacency is required in all
 *  of them: that is what separates an attribution from a sentence that merely mentions a
 *  person and a sha.
 *
 *  THE POSSESSIVE IS USED OVER A COMMIT AND **NOT** OVER A DECISION, AND THAT IS A
 *  MEASUREMENT RATHER THAN A HEDGE.  Over the live corpus, every `<session>'s DEC-n`
 *  reads *"the DEC-n work that session did"* and not *"the decision that session made"* —
 *  `VF-2's DEC-49 guard`, and six more of the same shape.  A possessive over a SHA has no
 *  such reading: a session does not BUILD a commit the way it builds a guard, so
 *  `<actor>'s <sha>` says the commit is that actor's act and nothing else.  Grading the
 *  ambiguous one would have failed seven correct sentences, which is the over-strictness
 *  direction and the one that gets a check switched off. */
function bindings(actorRe, citRe, { possessive = true, apposition = true } = {}) {
  const out = [];
  if (possessive) /* `<actor>'s <artifact?> <cit>` */
    out.push(new RegExp(String.raw`(${actorRe})(?:'s|’s|s')\s+${ARTIFACT}[(\[]?\s*${citRe}`, "g"));
  /* agentive: `<actor> ruled <cit>` */
  out.push(new RegExp(String.raw`(${actorRe})\s+${RULED}\s+(?:in\s+|at\s+|on\s+)?[(\[]?\s*${citRe}`, "g"));
  if (apposition) /* `<cit>, <actor>,` */
    out.push(new RegExp(String.raw`${citRe}\s*,\s*(${actorRe})\s*,`, "g"));
  return out;
}

/* ------------------------------------------------------- resolving a COMMIT citation */

/** Does this commit's OWN RECORD show a session wrote it?
 *
 *  THE AUTHOR FIELD IS NOT EVIDENCE and is not read as such — measured above, 1,525 of
 *  1,740 commits carry one human name and almost all of them are sessions. What speaks
 *  is a session MARKER the committing session put there itself: a `Co-Authored-By`
 *  trailer naming the model, a session-shaped author, or the persona subject prefix this
 *  project's sessions commit under (`bob:`, `conduct:`, `rec:` …).
 *
 *  Anything else is UNDETERMINED and says so. */
export function classifyCommit(sha, { repo = REPO_ROOT, run = null } = {}) {
  const exec = run || ((args) => execFileSync("git", args, { cwd: repo, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));
  let rec;
  try { rec = exec(["log", "-1", "--format=%an%n%ae%n%s%n%b", sha]); }
  catch { return { ok: false, actor: "undetermined", why: "no commit with this id is reachable from this checkout" }; }
  const [an = "", ae = "", subject = "", ...body] = rec.split("\n");
  const all = [an, ae, subject, ...body].join("\n");
  if (/^Co-Authored-By:\s*Claude/im.test(all))
    return { ok: true, actor: "session", why: `carries a Co-Authored-By trailer naming the model`, subject };
  if (/claude|agent|noreply@anthropic|bio session|believeinoakland/i.test(`${an} ${ae}`))
    return { ok: true, actor: "session", why: `committed under a session identity (${an})`, subject };
  if (/^(bob|conduct|dist|rec|ui|cpdf|coff|cap|fw|fl|pl|sk|is|vf|m0|corpus|plane|docs)\b\s*[:#]/i.test(subject))
    return { ok: true, actor: "session", why: `committed under this project's session persona prefix (${subject.split(/[:#]/)[0]}:)`, subject };
  return { ok: true, actor: "undetermined", why: "this commit's record carries no session marker, so who acted cannot be read from it", subject };
}

/* ----------------------------------------------------- resolving a DECISION citation */

/** Whose decision is `DEC-n`?  READ OFF THE REGISTER'S OWN `for:` FIELD, which exists
 *  precisely to declare this — `DECISIONS.md` defines it as `<bob | bob-session>` and
 *  its "Who an entry is FOR" section is the authority.  An entry with no `for:` line, or
 *  an id with no entry, is UNDETERMINED. */
export const DECISION_REGISTERS = [
  "docs/development/DECISIONS.md",
  /* THE ARCHIVED HALF IS NOT OPTIONAL.  The live register holds 19 entries; the rolled
     one holds 55, and **all six `for: bob-session` entries in the whole record are in
     it** — so reading only the live file makes the register look uniformly the
     architect's and makes the SESSION half of this arm unfalsifiable.  Reading it also
     turns 14 UNDETERMINED bindings into resolved ones.  Same reasoning as
     `mintid.mjs`'s corpus and `decided.mjs`'s scan: archiving is how finished work is
     KEPT here, so an instrument that stops at the live file mistakes an archive for a
     deletion. */
  "docs/archive/ledgers/DECISIONS-2026-08.md",
];

export function decisionActors({ repo = REPO_ROOT, read = null } = {}) {
  const reader = read || ((p) => readFileSync(join(repo, p), "utf8"));
  let src = "";
  for (const p of DECISION_REGISTERS) { try { src += "\n" + reader(p); } catch { /* absent: nothing to add */ } }
  const out = new Map();
  const chunks = src.split(/^###\s+(?=DEC-)/m).slice(1);
  for (const chunk of chunks) {
    const id = (chunk.match(/^(DEC-\d+)/) || [])[1];
    if (!id) continue;
    const f = (chunk.match(/^for:[^\S\n]*(\S+)/m) || [])[1];
    if (!f) { out.set(id, { actor: "undetermined", why: "the entry carries no `for:` line" }); continue; }
    if (/^bob-session/i.test(f)) out.set(id, { actor: "session", why: "the register's `for:` line says bob-session" });
    else if (/^bob/i.test(f)) out.set(id, { actor: "architect", why: "the register's `for:` line says bob" });
    else out.set(id, { actor: "undetermined", why: `the register's \`for:\` line reads ${JSON.stringify(f)}` });
  }
  return out;
}

/* --------------------------------------------------------------------- the audit */

/** Every actor-to-citation binding in the corpus, with the citation RESOLVED and the
 *  pairing graded.  `findings` are disagreements; `undetermined` is returned rather than
 *  swallowed, because a citation nobody can resolve is a question and not a pass. */
export function attributionAudit({ repo = REPO_ROOT, files = null, read = null, run = null,
                                   decisions = null } = {}) {
  const list = files || corpusFiles({ repo });
  const reader = read || ((p) => readFileSync(join(repo, p), "utf8"));
  const decs = decisions || decisionActors({ repo, read });
  const commitCache = new Map();
  const resolveSha = (sha) => {
    if (!commitCache.has(sha)) commitCache.set(sha, classifyCommit(sha, { repo, run }));
    return commitCache.get(sha);
  };

  const graded = [], findings = [], undetermined = [];
  const shapes = [
    { kind: "commit", actor: "architect", res: (c) => resolveSha(c), re: bindings(ARCHITECT, SHA_CIT) },
    { kind: "commit", actor: "session", res: (c) => resolveSha(c), re: bindings(SESSION, SHA_CIT) },
    { kind: "decision", actor: "architect", res: (c) => decs.get(c) || { actor: "undetermined", why: "no entry with this id is in either decision register" }, re: bindings(ARCHITECT, DEC_CIT, { possessive: false }) },
    /* A SESSION IN APPOSITION TO A `DEC-n` IS NOT AN ATTRIBUTION IN THIS CORPUS, AND THE
       ARM WAS CORRECTED RATHER THAN THE SENTENCES.  `Relation: DEC-49, REC-64, D-262.`
       and `all four items ruled (DEC-15, DEC-28, FW-13, REC-10)` are COMMA LISTS OF IDS,
       and an id-shaped actor beside an id-shaped citation is indistinguishable from the
       next item in a list — measured, 2 of 2 such matches were lists, and one of them had
       scored `ok` BY LUCK because the list happened to run the agreeing way.  `Bob` can
       never be a list member, so the ARCHITECT keeps its apposition (`DEC-20, Bob,
       2026-08-02` is the corpus's own correct form) and the SESSION loses it.  The
       session half is still two-sided: it binds AGENTIVELY, which is the shape a swap
       produces. */
    { kind: "decision", actor: "session", res: (c) => decs.get(c) || { actor: "undetermined", why: "no entry with this id is in either decision register" }, re: bindings(SESSION, DEC_CIT, { possessive: false, apposition: false }) },
  ];

  for (const rel of list) {
    let src; try { src = reader(rel); } catch { continue; }
    const lines = src.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const shape of shapes) {
        for (const re of shape.re) {
          re.lastIndex = 0;
          let m;
          while ((m = re.exec(line))) {
            /* Whichever group is the citation: the two shapes put it at a different
               index (possessive/agentive put the ACTOR first, apposition the CITATION),
               so the citation is the group that looks like one rather than the one at a
               remembered position. A remembered index is how this project's last
               multi-shape matcher scored five families zero. */
            const cit = m.slice(1).find((g) => g !== undefined && (/^[0-9a-f]{7,40}$/.test(g) || /^DEC-\d+$/.test(g)));
            if (!cit) continue;
            const r = shape.res(cit);
            const row = { file: rel, line: i + 1, cited: cit, kind: shape.kind,
                          claimed: shape.actor, resolved: r.actor, why: r.why,
                          text: m[0].replace(/\s+/g, " ").trim() };
            graded.push(row);
            if (r.actor === "undetermined") undetermined.push(row);
            else if (r.actor !== shape.actor) findings.push(row);
          }
        }
      }
    }
  }
  return { corpus: list.length, graded, findings, undetermined, excluded: EXCLUDED };
}

/** The message `plancheck` prints. Kept here so the gate and the control driver say the
 *  same words, and so a reader who greps the failure text lands on the predicate. */
export function attributionMessage(findings) {
  const one = (f) => {
    const dir = f.claimed === "architect"
      ? `attributed to the ARCHITECT (doctrine no session may revisit) but the ${f.kind} resolves to a SESSION`
      : `attributed to a SESSION (mechanism a later session may revisit) but the ${f.kind} resolves to the ARCHITECT`;
    return `          ${f.file}:${f.line}  ${JSON.stringify(f.text)}\n`
         + `            cites ${f.cited} — ${dir}\n`
         + `            resolved because: ${f.why}`;
  };
  return `ATTRIBUTION DOES NOT RESOLVE — ${findings.length} attribution(s) name an actor the\n`
       + `        citation beside them does not resolve to. A mechanism decision wearing doctrine's\n`
       + `        attribution becomes UNREVISABLE IN PRACTICE: the next reader works around the rule\n`
       + `        instead of correcting it, and working around leaves no trace that correcting does.\n`
       + findings.map(one).join("\n")
       + `\n        Fix the CITATION or the ACTOR so they agree — name the session and its commit for a\n`
       + `        mechanism decision, or the DATE AND PLACE for a ruling of Bob's. Do not rewrite the\n`
       + `        phrase alone: this arm resolves the citation, so a uniform rewrite fails the other way.`;
}

/* --------------------------------------------------------------------------- the CLI */

function main(argv) {
  const census = argv.includes("--census");
  const a = attributionAudit();
  console.log(`ATTRIBUTION over ${a.corpus} file(s)`);
  for (const e of a.excluded) console.log(`  OUTSIDE THE CORPUS  ${e.path} — ${e.why}`);
  console.log(`  ${a.graded.length} actor-to-citation binding(s) read and resolved`);
  if (census) {
    for (const g of a.graded)
      console.log(`    ${g.claimed === g.resolved ? "ok  " : g.resolved === "undetermined" ? "?   " : "FAIL"} `
        + `${g.file}:${g.line} claims ${g.claimed}, ${g.cited} resolves ${g.resolved}  ${JSON.stringify(g.text)}`);
  }
  if (census) {
    /* THE EXCLUDED FILES ARE READ AND REPORTED, NEVER SIMPLY SKIPPED. An exclusion whose
       consequences nobody ever sees is indistinguishable from an exemption, and the
       difference is the whole of this project's "correct, never exempt" rule: these
       findings are REAL and have no fix the rules permit, which a reader can only weigh
       if the numbers are in front of them. */
    const list = [];
    const walk = (p, rel) => {
      let st; try { st = statSync(p); } catch { return; }
      if (st.isDirectory()) { for (const n of readdirSync(p).sort()) walk(join(p, n), rel ? `${rel}/${n}` : n); return; }
      if (/\.(mjs|js|md|html)$/.test(p) && !rel.includes("node_modules/")) list.push(rel);
    };
    for (const e of EXCLUDED) {
      if (e.path === "node_modules") continue;
      walk(join(REPO_ROOT, e.path.replace(/\/$/, "")), e.path.replace(/\/$/, ""));
    }
    const ex = attributionAudit({ files: list });
    console.log(`  OUTSIDE-THE-CORPUS TOTALS — ${ex.corpus} file(s), ${ex.graded.length} binding(s), `
      + `${ex.findings.length} would-be finding(s), ${ex.undetermined.length} undetermined:`);
    for (const f of ex.findings)
      console.log(`    (not gated) ${f.file}:${f.line} claims ${f.claimed}, ${f.cited} resolves ${f.resolved}  ${JSON.stringify(f.text)}`);
  }
  if (a.undetermined.length) {
    console.log(`  ${a.undetermined.length} UNDETERMINED — the citation could not be resolved, which is a question and not a pass:`);
    for (const u of a.undetermined) console.log(`    ${u.file}:${u.line}  ${u.cited} — ${u.why}`);
  }
  if (a.findings.length) { console.log(attributionMessage(a.findings)); return 1; }
  console.log(`  0 disagreement(s).`);
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url)))
  process.exit(main(process.argv.slice(2)));
