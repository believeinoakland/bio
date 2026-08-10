/* NEGATIVE CONTROL: every arm below was RUN on 2026-08-08 by the SK-1 worker (worktree agent-a1f06561dfc61e51c) from `test/skillpack.control.mjs`, which is committed beside this file so the next session re-runs them in one step instead of re-deriving how to break the subject. Every restore was verified BY CONTENT as well as by sha256 — an NC harness in this repository once reported a byte-identical restore over a file that had not been restored. Clean tree: 46 pass, 0 fail. Nine arms run, 0 wrong.
   (1) THE ROW'S OWN, DIRECTION ONE — STRIP THE VERSION FROM A RUN'S CONDITIONS AT THE DOOR. Remove the `checkSkillVersion` guard block from `src/store.mjs aiRunOpen` -> 41 pass, 5 FAIL, and every one NAMES the missing condition: E1 (a run naming NO skill version OPENS), E3 (a bare edition opens), E4 (whitespace opens), E6 (the refused open left a run row behind after all), E2 behind them. The run object then answers `skill: null` for a run nobody can interpret, which is the state the requirement exists to make impossible.
   (2) THE ROW'S OWN, DIRECTION TWO — STRIP THE RECORDING RATHER THAN THE GUARD. In `aiRunOpen`'s INSERT write `null` where the trimmed version goes: the run still SAYS what it ran under and is still refused if it cannot, and the record simply does not keep the answer -> 40 pass, 6 FAIL: D2, D3, D5, E5 and E7 name the condition by field, and D4 — THE DISTINGUISHABILITY ARM — fails with BOTH run objects reading `null`, vN and vN+1 collapsed onto each other, which is the exact failure SK-1 is judged against. **Both directions are run because they fail differently and only the first is visible from the door**: a guard with no recording refuses nothing and a recording with no guard remembers nothing.
   (3) THE SOURCING CONTROL — A HAND COPY OF A DRIVEN VOCABULARY, the failure `ASSISTANT-PILOT.md` §1 is built against. Replace `body: vocabularies` with a hand-typed literal carrying three real published terms -> 42 pass, 4 FAIL: A6 (the layer is no longer what the plane published) and B2a (a literal in this file IS a published term). **AND TWO MORE THAN THIS ARM EXPECTED, which is the finding worth keeping: C2 and D4 fail too.** A typed vocabulary does not merely go stale — it stops the pack's version depending on the plane's words at all, so moving a published word no longer moves the version and two runs under two vocabularies become indistinguishable. The hand copy defeats the disclosure standard, not just the wording.
   (4) THE EMPTY CASE, AND WHAT STAYS GREEN IS THE POINT. Remove the four `throw`s from `renderPack` -> 42 pass, 4 FAIL (C4a-C4d). **Then MEASURED rather than asserted, as arm (4b): with the guards gone, a pack rendered over an EMPTY published answer still satisfies A6's equality — 0 terms, 0 acts, and a version still rendered — because `{}` equals `{}`. The non-empty guard (A1) and the render's own throw are the evidence; the equality never was.** D-216's arm 3, reproduced in a different family.
   (5) THE VERSION DERIVATION. Make `packVersion` return `<id>@<edition>` with no digest -> 42 pass, 4 FAIL: C2 (two packs rendered from DIFFERENT published vocabularies carry the SAME version), C3, A2 (the shape) and D4 behind them. A hand-bumped version discloses what somebody remembered to bump; this is what that looks like from the outside.
   (6) THE PIN ON THE ONE PUBLISHED TOKEN THIS PACK NAMES. Rename the machine mode where the plane mints it, in `src/index.mjs decorateAct` -> 45 pass, 1 FAIL: A10. Nothing else in the battery yields that value (A9 measures ZERO machine-reachable acts), so without this pin the boundary's meaning could be renamed with nothing to notice.
   (7) THE AUTHORED LAYER. Change one word of `OBJECTIVE` -> 45 pass, 1 FAIL: F1 names the sentence that is no longer in the document it is quoted from. The slowest-drifting layer still cannot drift silently.
   (8) THE INSTRUMENT ITSELF. Neuter this suite's comment stripper so `literalsOf` reads no literals -> 44 pass, 2 FAIL: B0 (the stripper's own fixture) and B3 (the scanner over a hand copy that must trip it), while B2a/B2b pass VACUOUSLY over an empty corpus — which is the shape of every walk that has gone blind while reporting green.
   (9) OVER-STRICTNESS, IN-SUITE: ARM E5 offers two correct skill versions phrased unlike anything this item wrote — `civic-check-doctrine@2026-08-01+deadbeefdeadbeef` and `some-other-pack@7.2.1` — and both are ACCEPTED and recorded verbatim. ARM F5 is the second in-suite instrument control: the same normaliser and search over a sentence that is NOT in the document must MISS. */
/* SK-1 — THE DOCTRINE PACK, VERSIONED.
 *
 * `IS-BUILD-PLAN.md` SK-1; `INVESTIGATIVE-SESSION.md` §2, §4, §11, §14a, §14b.1;
 * `ASSISTANT-PILOT.md` §1. The subject is `src/skillpack.mjs`; the recording is
 * PL-5's run object (`ai_runs.skill_version`, published by `op=airun`).
 *
 * WHAT THIS SUITE IS FOR, in one sentence: **the pack's SOURCING is the
 * deliverable.** A doctrine pack is easy to write and worthless if its
 * vocabulary is a hand copy — "a hand copy agrees at zero cost" is this
 * repository's most-measured finding, and `ASSISTANT-PILOT.md` §1 is built
 * around it. So the arms are ordered by what would be hardest to notice: the
 * sourcing first, then the version's derivation, then the recording, then the
 * refusal.
 *
 * THREE RULES KEPT THROUGHOUT, each of which has cost this project real time:
 *
 *   - SETS ARE DRIVEN, NEVER TYPED. The published vocabulary comes off the wire
 *     from `op=affordances`; the absence vocabulary, the levels, the bounds and
 *     the refusals are imported from the modules that ENFORCE them. This suite
 *     types no vocabulary member either.
 *   - THE REAL PATH AND THE MUTATED PATH GO THROUGH ONE FUNCTION. `literalsOf`
 *     and `quotedIn` below are called on this file's real subject AND on the
 *     hand-copy fixture that must trip them; `renderPack` is called on the real
 *     published answer AND on the mutated one. There is no second copy to
 *     disagree with.
 *   - EVERY WALK PRINTS ITS CORPUS SIZE, and states what it cannot see.
 *
 * DRIVEN THROUGH THE CONTROL PLANE (D-43): `op=invitelook` shipped with a
 * ReferenceError while 1276 assertions passed because the suite drove the store.
 * `op=affordances`, `op=airunopen`, `op=airun` and `op=promote` are all reached
 * with their literals written out so `scripts/coverage.mjs` credits them.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import * as CATALOGUE from "../checks/bio-checks.mjs";
import { AI_RUN_CHECKS } from "../checks/bio-checks.mjs";
import { OBSERVATION_LEVELS, OBSERVATION_STATES, RUN_BOUNDS, RUN_ENDINGS } from "../src/airun.mjs";
import { SKILL_PACK_ID, DOCTRINE_EDITION, OBJECTIVE, BOUNDARY, FOUR_LEVEL_RULE,
         SEARCH_COMPLETENESS, AUTHORED_SOURCES, SOURCING, ABSENCE_ANSWER_SHAPE,
         machineFences, memberOnlyActs, renderPack, packVersion,
         checkSkillVersion, parseSkillVersion } from "../src/skillpack.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const PACK_SRC = readFileSync(fileURLToPath(new URL("../src/skillpack.mjs", import.meta.url)), "utf8");
const INDEX_SRC = readFileSync(IDX, "utf8");
const STORE_SRC = readFileSync(fileURLToPath(new URL("../src/store.mjs", import.meta.url)), "utf8");
const DOC = (rel) => readFileSync(fileURLToPath(new URL("../../" + rel, import.meta.url)), "utf8");

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-sk1", MEMBER_TOKEN: "mem-sk1", PROBE_TOKEN: "prb-sk1",
              VERSION: "test", TASK_DRAIN_DELAY_MS: "600000" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
/* NULL-TOLERANT READS, for airun.test.mjs's measured reason: a control that dies
   on `.detail` of undefined hides every arm behind it and reports one defect as
   none. */
const note = (r) => (r && typeof r.note === "string") ? r.note : "";

const TOK = "mem-sk1";
const BUNDLE = "INQ-2026-0808-sk1-doctrine-pack";
const SHA_A = "b".repeat(64);
const T0 = "2026-08-08T09:00:00Z";

/* ---------------------------------------------------------------------------
 *  TWO SOURCE SCANNERS, AND EACH IS RUN ON ITS REAL SUBJECT AND ON A FIXTURE
 *  THAT MUST TRIP IT (arms B3 and F5). One function, two corpora — never a
 *  parallel implementation that agrees with the real one at zero cost.
 * ------------------------------------------------------------------------- */

/** Every STRING LITERAL in a JavaScript source, with comments removed first.
 *  Comments are removed because doctrine is DISCUSSED in this pack's header at
 *  length and a scanner that read prose would report the discussion as a copy.
 *  The stripper is itself checked (arm B0) against a fixture that must trip it,
 *  because a stripper that silently removed everything would make every arm
 *  built on it pass over nothing. */
function stripComments(src) {
  let out = "", i = 0;
  while (i < src.length) {
    const c = src[i], d = src[i + 1];
    if (c === "/" && d === "*") { const e = src.indexOf("*/", i + 2); i = e < 0 ? src.length : e + 2; continue; }
    if (c === "/" && d === "/") { const e = src.indexOf("\n", i); i = e < 0 ? src.length : e; continue; }
    if (c === '"' || c === "'" || c === "`") {
      const q = c; out += c; i++;
      while (i < src.length) {
        if (src[i] === "\\") { out += src.slice(i, i + 2); i += 2; continue; }
        out += src[i];
        if (src[i] === q) { i++; break; }
        i++;
      }
      continue;
    }
    out += c; i++;
  }
  return out;
}

function literalsOf(src) {
  const bare = stripComments(src);
  const out = [];
  for (const m of bare.matchAll(/"((?:[^"\\\n]|\\.)*)"/g)) out.push(m[1]);
  for (const m of bare.matchAll(/'((?:[^'\\\n]|\\.)*)'/g)) out.push(m[1]);
  return out;
}

/** Which corpus TERMS this source states as a literal. Two questions, because a
 *  hand copy arrives in two shapes and only the first is obvious:
 *    exact  — a literal that IS a term. That is what a copied set looks like.
 *    inside — a SCREAMING_SNAKE term named inside a longer literal. Those never
 *             appear in prose by accident, so a containment test is safe for
 *             them and would be false-positive noise for ordinary words. */
function quotedIn(src, terms) {
  const lits = literalsOf(src);
  const exact = [], inside = [];
  const screaming = terms.filter((x) => /^[A-Z][A-Z0-9_]{2,}$/.test(x));
  for (const lit of lits) {
    const trimmed = lit.trim();
    if (terms.includes(trimmed)) exact.push(trimmed);
    for (const s of screaming) if (lit.includes(s)) inside.push(s);
  }
  return { exact: [...new Set(exact)], inside: [...new Set(inside)], literals: lits.length };
}

/** Markdown normalised to one line so a quoted doctrine sentence can be looked
 *  for in the document it was quoted from: blockquote markers and list bullets
 *  stripped per line, emphasis and code markers removed, whitespace collapsed. */
function flatten(md) {
  return md.split("\n").map((l) => l.replace(/^[\s>]*[-*]?\s*/, "")).join(" ")
           .replace(/[*_`]/g, "").replace(/\s+/g, " ");
}

/* A real inquiry for the runs to be ABOUT. Deliberately minimal: this suite is
   not about promotion, and a fixture that fails for its own reasons hides the
   subject. */
const promoteFixture = () => POST(`op=promote&token=${TOK}`, {
  bundleId: BUNDLE, base: null, snapKey: "20260808T090000Z_inbox", author: "ruth",
  meta: { object_type: "inquiry", group: "believe-in-oakland",
          title: "Which pack was this run working under?",
          current_state: "open", created: T0, last_updated: T0 },
  files: [{ path: "bundle.md", text: `---\nid: ${BUNDLE}\n---\n\n## Question\n\nWhich pack was this run working under?\n`,
            bytes: 92, sha256: SHA_A }],
  register: [],
});

const run = async () => {
  const fx = await promoteFixture();
  if (fx?.ok !== true && fx?.promoted !== true && !fx?.bundleId)
    console.log(`  note: fixture promote answered ${JSON.stringify(fx).slice(0, 200)}`);

  /* ==========================================================================
     BLOCK A — THE PACK IS RENDERED FROM WHAT THE PLANE PUBLISHES.
     ======================================================================== */
  console.log("\nBLOCK A — the pack renders from the plane's published words, DRIVEN");

  const published = await GET(`op=affordances&token=${TOK}`);
  const pubVocabKeys = Object.keys(published?.vocabularies || {});
  const pubActs = Array.isArray(published?.catalog) ? published.catalog : [];
  console.log(`  corpus: op=affordances published ${pubVocabKeys.length} vocabularies and `
            + `${pubActs.length} acts; ${(published?.capture_acts || []).length} capture acts`);

  /* THE NON-EMPTY GUARD FIRST, AND IT IS THE EVIDENCE FOR EVERY EQUALITY BELOW.
     "The pack renders what the plane published" is trivially true when the plane
     published nothing — D-216's arm 3, which passed over an empty set. */
  t("ARM A1: the plane actually published a vocabulary and a catalogue to render FROM "
    + "(the non-empty guard every equality below rests on)",
    [pubVocabKeys.length > 0, pubActs.length > 0], [true, true]);

  const pack = renderPack(published, CATALOGUE);
  t("ARM A2: the pack carries a VERSION STRING, and its shape is <pack>@<edition>+<digest>",
    [typeof pack.version, new RegExp(`^${SKILL_PACK_ID}@${DOCTRINE_EDITION}\\+[0-9a-f]{16}$`).test(pack.version)],
    ["string", true]);
  console.log(`  the version rendered here: ${pack.version}`);

  t("ARM A3: the ALWAYS-RESIDENT layer is the four members §14b.1 names, and nothing else "
    + "beyond the list of what may be asked for",
    Object.keys(pack.resident).sort(),
    ["absence", "boundary", "disclosable", "four_level", "objective"]);

  t("ARM A4: the ABSENCE VOCABULARY in the pack IS airun.mjs's, member for member — imported, "
    + "not transcribed — and it is NOT EMPTY",
    [JSON.stringify(pack.resident.absence.states) === JSON.stringify(OBSERVATION_STATES),
     Object.keys(OBSERVATION_STATES).length > 0],
    [true, true]);

  t("ARM A5: the FOUR LEVELS are airun.mjs's, and there are four of them",
    [JSON.stringify(pack.resident.four_level.levels) === JSON.stringify(OBSERVATION_LEVELS),
     Object.keys(OBSERVATION_LEVELS).length],
    [true, 4]);

  t("ARM A6: the disclosed VOCABULARY layer is byte-identical to what op=affordances published",
    JSON.stringify(pack.disclosed.vocabularies.body) === JSON.stringify(published.vocabularies), true);

  t("ARM A7: the disclosed ACT layer carries the published catalogue's acts, id for id",
    [JSON.stringify(pack.disclosed.acts.body.catalog.map((a) => a.id))
       === JSON.stringify(pubActs.map((a) => a.id)),
     pack.disclosed.acts.body.catalog.length > 0],
    [true, true]);

  const fences = machineFences(CATALOGUE);
  console.log(`  corpus: ${fences.length} machine fence(s) harvested from the check catalogue, `
            + `across ${new Set(fences.map((f) => f.family)).size} family(ies)`);
  t("ARM A8: every machine fence the pack renders carries the catalogue's OWN canned translation, "
    + "verbatim — the pack paraphrases no refusal (ASSISTANT-PILOT §1) — and the set is not empty",
    [fences.length > 0,
     fences.every((f) => {
       for (const [fam, rows] of Object.entries(CATALOGUE))
         if (/_CHECKS$/.test(fam) && rows && rows[f.code]) return rows[f.code].translation === f.says;
       return false;
     })],
    [true, true]);

  const memberOnly = memberOnlyActs(pubActs);
  const machineReachable = pubActs.filter((a) => !memberOnly.some((m) => m.id === a.id));
  const modes = [...new Set(pubActs.map((a) => a.mode))].sort();
  const modeless = pubActs.filter((a) => typeof a.mode !== "string" || !a.mode);
  console.log(`  corpus: ${pubActs.length} published acts across mode(s) ${JSON.stringify(modes)}; `
            + `${memberOnly.length} a machine credential cannot reach, ${machineReachable.length} it can; `
            + `${modeless.length} published no mode at all`);
  /* THE NON-EMPTY EVIDENCE IS THE FIELD, NOT THE SPLIT — CORRECTED HERE AFTER
     THE ARM FAILED ON ITS FIRST RUN AND THE INSTRUMENT WAS THE THING THAT WAS
     WRONG. This arm was first written as "both sides are non-empty", on the
     assumption that some published act is machine-reachable. **It measured
     ZERO**, and zero is correct: every act in the object-directed catalogue is
     in `SESSION_OPS.member`, so the published catalogue contains NO act an
     `ai`-class credential can reach. That is §4's fence — *the AI holds no op
     that ACCEPTS* — arriving as a measurement rather than a sentence, and the
     assertion is corrected to the fact rather than the fact to the assertion.
     The vacuity the original guard was reaching for is covered where it
     actually bites: an act publishing NO mode makes `memberOnlyActs` return
     nothing and `renderPack` THROW (arm C4 family), so a catalogue that lost
     the field fails loudly instead of rendering an empty boundary. */
  t("ARM A9: the machine/member boundary is READ off the published `mode`, every act carries one, "
    + "and NOT ONE published act is machine-reachable — §4's fence, measured at the catalogue. If "
    + "this ever counts more than zero the fence has moved and somebody must have moved it",
    [modeless.length, machineReachable.length, memberOnly.length === pubActs.length,
     memberOnly.every((a) => a.mode !== "machine")],
    [0, 0, true, true]);

  /* THE PIN. `MACHINE_MODE` is the one published token the pack names, and this
     holds it to where the plane MINTS it rather than to this suite's memory.
     It matters MORE given A9's measurement, not less: the value is computed and
     currently yielded by no act, so nothing else in the battery would notice it
     being renamed — and the day an act becomes machine-reachable, a pack built
     on a stale spelling would call it a member's act. */
  const decorate = INDEX_SRC.slice(INDEX_SRC.indexOf("const decorateAct"),
                                  INDEX_SRC.indexOf("const decorateAct") + 500);
  t("ARM A10: and the token is PINNED to where the plane computes it — index.mjs's decorateAct "
    + "still spells the machine mode this way, so a rename there fails HERE rather than silently "
    + "emptying the boundary",
    [decorate.length > 0, /:\s*"machine"/.test(decorate)], [true, true]);

  /* ==========================================================================
     BLOCK B — THE SOURCING ARM. NOTHING IS TYPED. THIS IS THE ITEM.
     ======================================================================== */
  console.log("\nBLOCK B — every vocabulary is DRIVEN or IMPORTED, and this is the arm that proves it");

  /* THE STRIPPER'S OWN CONTROL, FIRST. Everything below is built on it, and a
     stripper that removed the whole file would make every arm pass over nothing. */
  const stripFixture = `/* "TYPED_IN_A_COMMENT" */ const a = "TYPED_IN_CODE"; // "TYPED_IN_LINE_COMMENT"`;
  t("ARM B0: the comment stripper keeps code literals and drops comment ones — checked against a "
    + "fixture that must trip it, because every arm below is built on it",
    literalsOf(stripFixture), ["TYPED_IN_CODE"]);

  /* THE CORPUS. Every word the pack renders that came from somewhere else. */
  const terms = new Set();
  const walkStrings = (v) => {
    if (typeof v === "string") { terms.add(v); return; }
    if (Array.isArray(v)) { v.forEach(walkStrings); return; }
    if (v && typeof v === "object") for (const [k, val] of Object.entries(v)) { terms.add(k); walkStrings(val); }
  };
  walkStrings(published.vocabularies);
  for (const a of pubActs) { terms.add(a.id); if (a.label) terms.add(a.label); }
  for (const k of Object.keys(OBSERVATION_STATES)) terms.add(k);
  for (const k of Object.keys(OBSERVATION_LEVELS)) terms.add(k);
  for (const k of Object.keys(RUN_BOUNDS)) terms.add(k);
  for (const k of Object.keys(RUN_ENDINGS)) terms.add(k);
  for (const f of fences) terms.add(f.code);
  const CORPUS = [...terms];
  const found = quotedIn(PACK_SRC, CORPUS);
  console.log(`  corpus: ${CORPUS.length} sourced terms, scanned against ${found.literals} string `
            + `literals in src/skillpack.mjs (comments removed)`);
  console.log(`  what this instrument CANNOT see: a term reproduced in a comment (deliberately — the `
            + `pack's header discusses doctrine at length), and a term SPELLED DIFFERENTLY. It sees a `
            + `copy, which is the failure ASSISTANT-PILOT §1 is built against.`);

  t("ARM B2a: no string literal in src/skillpack.mjs IS a sourced term — a copied set is exactly "
    + "what that looks like", found.exact, []);
  t("ARM B2b: and no literal NAMES a sourced SCREAMING_SNAKE term inside a longer sentence",
    found.inside, []);

  /* THE CONTROL, IN-SUITE AND THROUGH THE SAME FUNCTION. A scanner that has gone
     blind reports the same empty answer as a clean subject. */
  const handCopy = `const states = ["${CORPUS.find((x) => /^[A-Z][A-Z0-9_]{2,}$/.test(x))}"];`
    + ` const note = "the run reports ${CORPUS.find((x) => /^[A-Z][A-Z0-9_]{2,}$/.test(x))} at this level";`;
  const tripped = quotedIn(handCopy, CORPUS);
  t("ARM B3: THE SOURCING SCANNER CAN FAIL — the SAME function over a hand copy finds it, both ways. "
    + "Without this arm, B2a/B2b would pass over a scanner that stopped reading",
    [tripped.exact.length > 0, tripped.inside.length > 0], [true, true]);

  t("ARM B4: and every pack member DECLARES how it was sourced, so a reader of the pack can tell "
    + "an authored sentence from an emitted one",
    [Object.values(SOURCING).every((s) => ["authored", "imported", "driven", "absent"].includes(s)),
     Object.keys(SOURCING).length > 0],
    [true, true]);

  /* ==========================================================================
     BLOCK C — THE VERSION IS DERIVED FROM WHAT WAS RENDERED.
     ======================================================================== */
  console.log("\nBLOCK C — the version moves when a rendered word moves, and the empty case throws");

  t("ARM C1: two renders of the same published answer carry the SAME version — a digest that moved "
    + "on its own would make every run object incomparable",
    renderPack(published, CATALOGUE).version === pack.version, true);

  /* THE MUTATED PUBLISHED ANSWER, THROUGH THE SAME renderPack. One published
     label moves; nothing else does. */
  const moved = JSON.parse(JSON.stringify(published));
  const firstVocab = Object.keys(moved.vocabularies)[0];
  const bumped = renderPackWithMovedWord(moved, firstVocab);
  t("ARM C2: move ONE published word and the version of every pack rendered after it MOVES — this is "
    + "what makes a run under vN and a rerun under vN+1 distinguishable without anyone remembering "
    + "to bump anything",
    [bumped.version !== pack.version, /^investigative-session@1\+[0-9a-f]{16}$/.test(bumped.version)],
    [true, true]);
  console.log(`  vN   ${pack.version}\n  vN+1 ${bumped.version}   (one published word moved: ${firstVocab})`);

  t("ARM C3: and the digest is over the pack as RENDERED, resident and disclosed together — so a "
    + "version computed over a pack carrying a different resident sentence differs too",
    packVersion({ ...pack, resident: { ...pack.resident, objective: { text: "something else" } } })
      !== pack.version, true);

  const threw = (fn) => { try { fn(); return null; } catch (e) { return e.message; } };
  const emptyVocab = threw(() => renderPack({ vocabularies: {}, catalog: pubActs }, CATALOGUE));
  const emptyCatalog = threw(() => renderPack({ vocabularies: published.vocabularies, catalog: [] }, CATALOGUE));
  const noFences = threw(() => renderPack(published, {}));
  const noPublished = threw(() => renderPack(null, CATALOGUE));
  t("ARM C4a: a pack CANNOT be rendered over an empty published vocabulary — it throws naming the "
    + "empty source, because a vocabulary layer that is empty and looks rendered is the false-coverage "
    + "shape arriving where the whole point is that the words came from the plane",
    typeof emptyVocab === "string" && emptyVocab.includes("no vocabularies"), true);
  t("ARM C4b: nor over an empty act catalogue",
    typeof emptyCatalog === "string" && emptyCatalog.includes("no acts"), true);
  t("ARM C4c: nor over a check catalogue with no machine fence in it — the boundary is rendered from "
    + "the plane's canned words and the pack writes none of its own",
    typeof noFences === "string" && noFences.includes("no fence row"), true);
  t("ARM C4d: nor over nothing at all", typeof noPublished === "string", true);

  /* ==========================================================================
     BLOCK D — THE RUN RECORDS IT. DRIVEN THROUGH THE OPS.
     ======================================================================== */
  console.log("\nBLOCK D — PL-5's run object records the version, and two runs under two packs differ");

  const V1 = pack.version, V2 = bumped.version;
  const RUN_A = "AIRUN-2026-0808-sk1-a", RUN_B = "AIRUN-2026-0808-sk1-b";
  const openA = await POST(`op=airunopen&token=${TOK}`, {
    run: RUN_A, contextType: "inquiry", contextId: BUNDLE, mode: "check",
    principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: V1, bounds: [{ bound: "fetches", allowed: 10, unit: "requests" }],
    state: {}, at: T0 });
  t("ARM D1: a run opens under the version the pack it was rendered from carries",
    [openA?.started, openA?.status], [true, "running"]);

  const readA = await GET(`op=airun&token=${TOK}&run=${RUN_A}`);
  t("ARM D2: and op=airun PUBLISHES it — the run object records the skill version it ran under (§11)",
    readA?.session?.principal?.skill, V1);

  const openB = await POST(`op=airunopen&token=${TOK}`, {
    run: RUN_B, contextType: "inquiry", contextId: BUNDLE, mode: "check",
    principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: V2, bounds: [{ bound: "fetches", allowed: 10, unit: "requests" }],
    state: {}, at: T0 });
  const readB = await GET(`op=airun&token=${TOK}&run=${RUN_B}`);
  t("ARM D3: a RERUN under the next pack version records THAT one",
    [openB?.started, readB?.session?.principal?.skill], [true, V2]);

  t("ARM D4: THE CHECKABLE FACT SK-1 IS JUDGED ON — the two run objects are DISTINGUISHABLE by the "
    + "pack they ran under, and neither is empty",
    [readA?.session?.principal?.skill !== readB?.session?.principal?.skill,
     (readA?.session?.principal?.skill || "").length > 0,
     (readB?.session?.principal?.skill || "").length > 0,
     V1 !== V2],
    [true, true, true, true]);

  const RUN_PAD = "AIRUN-2026-0808-sk1-padded";
  await POST(`op=airunopen&token=${TOK}`, {
    run: RUN_PAD, contextType: "inquiry", contextId: BUNDLE,
    principalClaude: "instance", skillVersion: `   ${V1}   `, bounds: [], state: {}, at: T0 });
  const readPad = await GET(`op=airun&token=${TOK}&run=${RUN_PAD}`);
  t("ARM D5: what is RECORDED is what was JUDGED — a padded version is stored trimmed, so the value "
    + "the guard saw is the value a later reader compares (PL-4's blank-principal finding, one field over)",
    readPad?.session?.principal?.skill, V1);

  /* ==========================================================================
     BLOCK E — THE REFUSAL. C-22.7.
     ======================================================================== */
  console.log("\nBLOCK E — a run that cannot say what it ran under is refused at the door");

  const RUN_NONE = "AIRUN-2026-0808-sk1-nameless";
  const none = await POST(`op=airunopen&token=${TOK}`, {
    run: RUN_NONE, contextType: "inquiry", contextId: BUNDLE,
    principalClaude: "instance", bounds: [], state: {}, at: T0 });
  t("ARM E1 (C-22.7): a run naming NO skill version is refused — 'every run records the skill version "
    + "it ran under' is a requirement, and a condition that may be omitted is not recorded",
    [none?.started, none?.code, none?.check],
    [false, "AI_RUN_SKILL_VERSION_UNNAMED", "C-22.7"]);

  t("ARM E2: and the refusal carries the DEC-49 canned translation read from the ONE row, not a "
    + "sentence composed at the site",
    none?.translation, AI_RUN_CHECKS.AI_RUN_SKILL_VERSION_UNNAMED.translation);

  const bare = await POST(`op=airunopen&token=${TOK}`, {
    run: "AIRUN-2026-0808-sk1-bare", contextType: "inquiry", contextId: BUNDLE,
    principalClaude: "instance", skillVersion: "3", bounds: [], state: {}, at: T0 });
  t("ARM E3: a version naming no PACK is refused too, and the refusal names the offending value — "
    + "'3' reads as an answer and identifies nothing the moment a second pack exists",
    [bare?.started, bare?.code, note(bare).includes("'3'")],
    [false, "AI_RUN_SKILL_VERSION_UNNAMED", true]);

  const blank = await POST(`op=airunopen&token=${TOK}`, {
    run: "AIRUN-2026-0808-sk1-blank", contextType: "inquiry", contextId: BUNDLE,
    principalClaude: "instance", skillVersion: "   ", bounds: [], state: {}, at: T0 });
  t("ARM E4: whitespace is not a version — a value that survives a falsiness guard while naming "
    + "nothing is the worse direction, because it reads as present",
    [blank?.started, blank?.code], [false, "AI_RUN_SKILL_VERSION_UNNAMED"]);

  /* OVER-STRICTNESS. A correct version phrased unlike anything this item wrote
     must PASS — and it must be RECORDED verbatim, because pinning the open to
     the pack this repository currently renders would make a rerun under a
     different pack impossible, which is the property SK-1 is judged on removed
     by its own guard. */
  const OTHER_A = "civic-check-doctrine@2026-08-01+deadbeefdeadbeef";
  const OTHER_B = "some-other-pack@7.2.1";
  const otherA = await POST(`op=airunopen&token=${TOK}`, {
    run: "AIRUN-2026-0808-sk1-other-a", contextType: "inquiry", contextId: BUNDLE,
    principalClaude: "instance", skillVersion: OTHER_A, bounds: [], state: {}, at: T0 });
  const otherB = await POST(`op=airunopen&token=${TOK}`, {
    run: "AIRUN-2026-0808-sk1-other-b", contextType: "inquiry", contextId: BUNDLE,
    principalClaude: "instance", skillVersion: OTHER_B, bounds: [], state: {}, at: T0 });
  const readOtherA = await GET(`op=airun&token=${TOK}&run=AIRUN-2026-0808-sk1-other-a`);
  t("ARM E5 (OVER-STRICTNESS): two correct versions from packs this repository never wrote are "
    + "ACCEPTED and recorded verbatim — the guard asks whether the run can SAY what it ran under, "
    + "never whether this instance agrees with it",
    [otherA?.started, otherB?.started, readOtherA?.session?.principal?.skill],
    [true, true, OTHER_A]);

  const ghost = await GET(`op=airun&token=${TOK}&run=${RUN_NONE}`);
  t("ARM E6: a refused open leaves NO run behind — the refusal is not a half-open run whose "
    + "conditions nobody can read", [ghost?.found, ghost?.session], [false, null]);

  t("ARM E7: a version the record HANDS BACK can be resolved to its pack and edition, so a reader "
    + "parses what it received rather than recomputing it (DEC-8's direction)",
    [parseSkillVersion(readA?.session?.principal?.skill)?.pack,
     parseSkillVersion(readA?.session?.principal?.skill)?.edition,
     parseSkillVersion("3"), checkSkillVersion(OTHER_B)],
    [SKILL_PACK_ID, DOCTRINE_EDITION, null, null]);

  /* THE MAP IS READ FROM ONE PLACE, and this file is the new home of a C-22 row's
     enforcement — airun.test.mjs's ARM D4 asks this of `airun.mjs` and nothing
     asked it of `skillpack.mjs`. A hand copy agrees at zero cost, measured five
     times in this repository. */
  t("ARM E8: src/skillpack.mjs holds NO second copy of any C-22 translation — the code, the "
    + "C-number and the sentence are ONE row in the catalogue",
    Object.keys(AI_RUN_CHECKS)
      .filter((c) => PACK_SRC.includes(AI_RUN_CHECKS[c].translation.slice(0, 40))), []);

  /* ==========================================================================
     BLOCK F — THE AUTHORED LAYER CANNOT DRIFT SILENTLY EITHER.
     ======================================================================== */
  console.log("\nBLOCK F — the authored sentences are held to the documents they are quoted from");

  const docs = {};
  for (const rel of new Set(Object.values(AUTHORED_SOURCES))) docs[rel] = flatten(DOC(rel));
  console.log(`  corpus: ${Object.keys(docs).length} document(s), `
            + `${Object.values(docs).reduce((n, d) => n + d.length, 0)} normalised characters`);

  const inDoc = (key, sentence) => docs[AUTHORED_SOURCES[key]].includes(flatten(sentence));
  t("ARM F1: the OBJECTIVE the pack carries is §2's own sentence, in the design document",
    inDoc("OBJECTIVE", OBJECTIVE), true);
  t("ARM F2: the MACHINE/MEMBER BOUNDARY is §4's corrected form, in the design document",
    inDoc("BOUNDARY", BOUNDARY), true);
  t("ARM F3: the FOUR-LEVEL RULE is CLAUDE.md's own sentence — the one every session loads",
    inDoc("FOUR_LEVEL_RULE", FOUR_LEVEL_RULE), true);
  t("ARM F4: and so is the search-completeness rule it depends on",
    inDoc("SEARCH_COMPLETENESS", SEARCH_COMPLETENESS), true);
  t("ARM F5: THE DOCUMENT SCANNER CAN MISS — the same normaliser and the same search over a "
    + "sentence that is NOT in the document reports absence, so F1-F4 are measurements rather "
    + "than a search that matches everything",
    docs[AUTHORED_SOURCES.OBJECTIVE].includes(flatten("The goal is to support the position the member hoped for.")),
    false);

  /* ==========================================================================
     BLOCK G — PROGRESSIVE DISCLOSURE, AS A MEASURED PROPERTY.
     ======================================================================== */
  console.log("\nBLOCK G — two layers, and the split buys something measurable");

  const residentBytes = JSON.stringify(pack.resident).length;
  const disclosedBytes = JSON.stringify(pack.disclosed).length;
  console.log(`  measured: resident ${residentBytes} bytes, disclosed ${disclosedBytes} bytes `
            + `(${(disclosedBytes / residentBytes).toFixed(1)}x)`);
  /* CORRECTED 2026-08-08 BY REC-64, AND THE CORRECTION IS THE FINDING RATHER
     THAN A REPAIR. This arm read `residentBytes < disclosedBytes`, and REC-64
     INVERTED IT by doing exactly what it was queued to do: SK-1 measured that
     the pack could render ONE machine fence of twelve, REC-64 gave the other
     eleven their canned translations, and the boundary block — which is
     ALWAYS-RESIDENT by design, because a fence a run learns only on request is
     a fence it can cross first — grew by eleven member-facing sentences.
     Measured at REC-64: resident 9,294 bytes, disclosed 9,064.

     **THE STRICT INEQUALITY WAS A PROXY AND IT HAS EXPIRED, for a reason ARM G3
     states four lines below: the RECIPE LAYER IS DECLARED EMPTY AND IS SK-2's TO
     FILL.** So the comparison today is a COMPLETE resident layer against a
     deliberately unfinished disclosed one, and a ratio measured against a
     half-built artifact is not a measurement of context economy. Restoring the
     old assertion would have meant either deferring the fences — putting the
     machine/member boundary behind a request, which is the one thing §4 says it
     must not be — or leaving eleven fences unexplained, which is the defect
     REC-64 exists to close.

     WHAT IS ASSERTED INSTEAD is the property the byte comparison was standing in
     for: **the split buys something, and the resident layer does not carry what
     the disclosed layers hold.** A pack that had collapsed into one layer fails
     this; a pack whose disclosed side is merely smaller today does not.
     RE-ASSERT THE STRICT INEQUALITY WHEN SK-2 LANDS THE RECIPES — routed in
     CLAIMS.md as REC-64's delegation, with these two numbers.

     **RE-ASSERTED 2026-08-10 BY SK-2, AND ON A DIFFERENT GROUND THAN THE NOTE
     ABOVE ANTICIPATED, which is stated rather than quietly satisfied.** SK-2 did
     NOT fill the recipe layer — that blocker is unchanged and is now written out
     in `skillpack.mjs`'s header: a recipe is only worth carrying if a step
     naming a surface that does not exist FAILS THE BUILD, and no plane op
     publishes the surface registry. What SK-2 landed instead is FIVE judgement
     layers (`skilldoctrine.mjs`), all of them disclosed, and they restore the
     property the byte comparison was standing in for: the run holds the doctrine
     it is instructed by on request rather than from its first token. Measured at
     SK-2: resident 9,814 bytes (up 520, all of it `disclosable`'s five new
     names), disclosed 27,361 bytes — 2.8x. The inequality is asserted again
     because it means something again, and REC-64's delegation is DISCHARGED. */
  const disclosedBodies = JSON.stringify(Object.values(pack.disclosed).map((l) => l.body));
  t("ARM G1: the split BUYS something, and the DISCLOSED half is the larger one — a run holds the "
    + "doctrine it is instructed by on request rather than from its first token. (This arm's strict "
    + "inequality inverted at REC-64 when the boundary gained eleven fence sentences, and is "
    + "re-asserted at SK-2, which added five judgement layers. The recipe layer is still EMPTY and "
    + "the reason is in skillpack.mjs's header.)",
    [disclosedBytes > residentBytes,
     Object.keys(pack.disclosed).length > 0,
     JSON.stringify(pack.resident).includes(disclosedBodies.slice(2, 60)) === false],
    [true, true, true]);

  t("ARM G2: every disclosed layer names the work that LOADS it, and the resident layer lists them "
    + "all — a run that does not know a layer exists cannot ask for it",
    [Object.values(pack.disclosed).every((l) => typeof l.load_when === "string" && l.load_when),
     JSON.stringify(pack.resident.disclosable.map((d) => d.layer).sort())
       === JSON.stringify(Object.keys(pack.disclosed).sort()),
     pack.resident.disclosable.length > 0],
    [true, true, true]);

  t("ARM G3: the RECIPE layer is declared, EMPTY, and says why — an honest absence rather than a "
    + "silent omission, and SK-2's to fill",
    [pack.disclosed.recipes.body.length, typeof pack.disclosed.recipes.absent_because,
     pack.sourcing.recipes],
    [0, "string", "absent"]);

  t("ARM G4: an answer reporting absence has a SHAPE to fill, and it names its level and its state — "
    + "the two fields §11's log already refuses an entry without",
    [ABSENCE_ANSWER_SHAPE.includes("level"), ABSENCE_ANSWER_SHAPE.includes("state")], [true, true]);

  /* ==========================================================================
     BLOCK H — WHAT THIS PACK CANNOT SEE, MEASURED AND PRINTED.
     ======================================================================== */
  console.log("\nBLOCK H — the boundary the pack renders is a SUBSET, and the gap is measured");

  const prefix = "MACHINE" + "_CANNOT_";
  const mintedInSource = new Set();
  for (const src of [STORE_SRC, INDEX_SRC])
    for (const m of src.matchAll(/["'`](MACHINE_CANNOT_[A-Z0-9_]+)["'`]/g)) mintedInSource.add(m[1]);
  const rendered = new Set(fences.map((f) => f.code));
  const uncanned = [...mintedInSource].filter((c) => !rendered.has(c));
  console.log(`  corpus: ${mintedInSource.size} ${prefix}* code(s) minted in the plane's source; `
            + `${rendered.size} carry a canned translation and are rendered into the pack; `
            + `${uncanned.length} do not and are NOT paraphrased: ${uncanned.slice(0, 6).join(", ") || "(none)"}`);
  /* THE TITLE CORRECTED 2026-08-08 BY REC-64, because the fact under it changed
     and a title that no longer describes what passes is a stale comment wearing
     an assertion's clothes. It read "and the plane mints more than that". When
     SK-1 wrote it the gap was ELEVEN; REC-64 closed it and the gap is now ZERO —
     printed on the corpus line above, so the number is read rather than assumed.
     The assertion itself is unchanged and is still `>=`, deliberately: the pack
     may never render a fence the plane does not mint, and the day the plane adds
     a thirteenth the gap reopens. What must NOT happen is this becoming a strict
     `>`, which would make closing the gap a failure. */
  t("ARM H1: the pack renders only fences whose words the record already published, and never more "
    + "than the plane mints — the gap is PRINTED above rather than assumed, because an unstated "
    + "limit reads as completeness and a closed one reads as a rule that was never there",
    [rendered.size > 0, mintedInSource.size >= rendered.size,
     [...rendered].every((c) => typeof c === "string")],
    [true, true, true]);
  t("ARM H2: and the pack SAYS SO in its own body, so a run reading the boundary learns it is "
    + "reading a subset", typeof pack.resident.boundary.fences_note, "string");

  /* THE TAIL LINE IS THE BATTERY'S CONTRACT, not decoration: `scripts/battery.mjs`
     reads `N pass, M fail` off it, and a suite whose count cannot be read is
     reported as UNKNOWN rather than as zero (D-93's `sshsig` 16-vs-18 case). */
  await mf.dispose();
};

/** ONE FUNCTION, TWO CORPORA. The real render and the mutated render go through
 *  `renderPack`; this only moves a published word first, so there is no second
 *  render path that could agree with the first at zero cost. */
function renderPackWithMovedWord(publishedCopy, vocabKey) {
  const v = publishedCopy.vocabularies[vocabKey];
  if (Array.isArray(v) && v.length) v[0] = String(v[0]) + "-moved";
  else if (v && typeof v === "object") {
    const k = Object.keys(v)[0];
    v[k] = typeof v[k] === "string" ? v[k] + "-moved" : v[k];
  } else publishedCopy.vocabularies[vocabKey] = String(v) + "-moved";
  return renderPack(publishedCopy, CATALOGUE);
}

await run();

/* THE TAIL LINE IS THE BATTERY'S CONTRACT, not decoration: `scripts/battery.mjs`
   reads `N pass, M fail` off it, and a suite whose count cannot be read reports
   as UNKNOWN rather than as zero (D-93's `sshsig` 16-vs-18 case). The explicit
   exit is `hygiene.test.mjs`'s rule — a suite ends on its own result rather than
   on whatever the runtime decides to do with a pending handle — and it is read
   from the LAST 400 characters of this file, so both lines live here. */
console.log(`\nskillpack: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
