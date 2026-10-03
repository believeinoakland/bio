/* SK-1 — THE DOCTRINE PACK, VERSIONED, AND ITS VOCABULARY IS NEVER TYPED.
 *
 * `IS-BUILD-PLAN.md` SK-1; `INVESTIGATIVE-SESSION.md` §2 (the objective), §4
 * (the fence: the AI holds no op that ACCEPTS), §11 (the run is an object and
 * carries the SKILL VERSION it ran under), §14a (the Claude Code mapping, where
 * `CLAUDE.md` loaded every session maps onto "the skill's doctrine layer, and
 * the run records which skill version it ran under"), §14b.1 (progressive
 * disclosure); `ASSISTANT-PILOT.md` §1 (the five layers by drift rate).
 *
 * PURE, for `run-rules`' and `queuestate.mjs`'s stated reason: no storage, no
 * clock, no viewer, so a suite can hold the pack to the plane's own behaviour
 * directly rather than through a Durable Object.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS FILE IS, IN ONE SENTENCE
 * ---------------------------------------------------------------------------
 *
 * It is the thing a run is INSTRUCTED BY, rendered from what the plane already
 * publishes, carrying a version string that the run object records — so that a
 * run under pack vN and a rerun under vN+1 are distinguishable in the record
 * rather than in somebody's memory of what the instructions said that week.
 *
 * ---------------------------------------------------------------------------
 * TWO LAYERS, AND THE SPLIT IS A CONTEXT-ECONOMY DECISION RATHER THAN A TASTE
 * ---------------------------------------------------------------------------
 *
 * §14b.1: *"Progressive disclosure. The skill's doctrine layer is always
 * resident; its recipes, vocabularies and per-format knowledge load when the run
 * reaches work that needs them."* A run cannot hold a project, so it cannot hold
 * a pack that carries every vocabulary the plane publishes either.
 *
 *   ALWAYS RESIDENT — four members, and each is in the resident half because a
 *   run that forgets it produces an answer nobody can trust:
 *     1. THE OBJECTIVE (§2). Positive and therefore testable.
 *     2. THE MACHINE / MEMBER BOUNDARY (§4). What the run may never do.
 *     3. THE FOUR-LEVEL RULE (Content Framework Part II §14.3). What an absence
 *        may never be read as.
 *     4. THE ABSENCE VOCABULARY (D-129). The words the third rule is stated in.
 *
 *   PROGRESSIVELY DISCLOSED — the vocabularies and recipes of §14b.1 (the
 *   recipes are wizard scripts since DEC-120), each with the trigger that
 *   loads it. They are named in the resident layer (so the run
 *   knows what it may ASK FOR) and their bodies are not carried until asked.
 *
 * ---------------------------------------------------------------------------
 * EVERY VOCABULARY IS DRIVEN OR IMPORTED. NONE IS TYPED. THIS IS THE ITEM.
 * ---------------------------------------------------------------------------
 *
 * `ASSISTANT-PILOT.md` §1 layers the pack BY DRIFT RATE: authored doctrine
 * drifts slowest and is reviewed like doctrine; the plane's published vocabulary
 * CANNOT drift, because it is emitted. **A hand-typed copy of an emitted
 * vocabulary is the failure this project has measured most often** — a
 * vocabulary two members short of its catalogue since a ruling months earlier; a
 * sourcing arm that passed a complete hand copy of all 131 op names because it
 * validated a parallel path; a pin comparing a hand-written literal against its
 * own length.
 *
 * So this file holds THREE kinds of thing and says which is which, in
 * `SOURCING` below, mechanically rather than in prose:
 *
 *   `authored` — doctrine. Four sentences, and every one of them is checked
 *                against the design document it is quoted from, so the slowest-
 *                drifting layer still cannot drift SILENTLY.
 *   `imported` — read from the module that ENFORCES the words (`observation-log`,
 *                `run-rules`, `contradiction`). No copy exists here to go
 *                stale.
 *   `driven`   — read from what the plane PUBLISHES on the wire
 *                (`op=affordances`), passed in by the caller as the plane's own
 *                answer and never reshaped.
 *
 * `test/m/skills/` reads this file's own source and FAILS if any member of a
 * driven or imported vocabulary appears in it as a string literal (R23). That
 * is the arm that makes the sentence above a fact rather than an intention.
 *
 * ---------------------------------------------------------------------------
 * THE VERSION IS DERIVED FROM WHAT WAS RENDERED, NOT BUMPED BY HAND
 * ---------------------------------------------------------------------------
 *
 * SK-1's row calls this the Cerebras/Schulte disclosure standard and names it a
 * REQUIREMENT rather than an analogy: what ran must be disclosed, so the output
 * can be read against it.
 *
 * A hand-bumped version discloses what somebody REMEMBERED to bump. This one is
 * `<pack id>@<doctrine edition>+<digest of the rendered pack>`:
 *
 *   - the EDITION is authored and moves with a release — the doctrine half,
 *     reviewed like doctrine;
 *   - the DIGEST is computed over the pack as rendered, resident and disclosed
 *     together. So a published word moving in the plane moves the version of
 *     every pack rendered after it, WITHOUT anyone remembering to. A run under
 *     the old vocabulary and a rerun under the new one are then distinguishable
 *     in their run objects, which is exactly what SK-1 is judged on.
 *
 * IT IS AN IDENTITY DIGEST AND NOT A SECURITY ONE, stated because the
 * difference matters and this repository does not let an instrument imply more
 * than it does: it answers "is this the same pack", it is not `crypto.subtle`,
 * and nothing gates on it. `crypto.subtle.digest` is async and every consumer
 * here is a pure synchronous render.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS PACK CANNOT SEE, STATED RATHER THAN DISCOVERED
 * ---------------------------------------------------------------------------
 *
 *   - **WIZARD SCRIPTS ARE CARRIED ONLY AS THE PLANE PUBLISHES THEM.**
 *     `ASSISTANT-PILOT.md` §1 requires a wizard script (DEC-120; the "recipe"
 *     of the first design) to be DATA whose every step names a screen and an
 *     op, mechanically validated so a script naming a screen that does not exist
 *     FAILS THE BUILD. The library is `wizard-scripts`' and the screen registry is
 *     registered there; the plane publishes both in `op=affordances`' no-target
 *     answer (`screens`, `wizard_scripts`; `affordances` R37). This file authors
 *     no script: it carries the published ones unchanged, and checks every step
 *     against the published screens, its act against the ops of the screen it
 *     names (R10), so a pack rendered at build over a broken script fails the
 *     build. Until the plane publishes them, the layer is declared, empty, and
 *     its emptiness is PUBLISHED in the pack (R9) — an honest absence, never a
 *     silent omission. The doctrine a run DRAFTS a script under is the
 *     `wizard_authoring` layer (`skilldoctrine.mjs`, R32).
 *   - **THE MACHINE FENCE IS WIDER THAN ITS CANNED WORDS.** The boundary layer
 *     renders the fences that carry a DEC-49 canned translation, as the plane
 *     PUBLISHES them (`op=affordances`' `fences`: `machineFences` below, run by
 *     the control plane over every module's check families, K585 (1)). The
 *     plane can mint machine refusals that carry none; this pack names none of
 *     them and paraphrases none of them, and publishes the fact that it is
 *     rendering a SUBSET.
 *   - **NO OP PUBLISHES THIS PACK, DELIBERATELY.** The pack is rendered by
 *     whatever RUNS under it — FL-3's harness, and this module's tests
 *     today — from the plane's existing published answer. An op returning the
 *     pack would be a second, plane-side copy of a thing whose entire point is
 *     that it is rendered from the first, and it would buy a coverage row for a
 *     consumer that does not exist. What the plane holds is the run's RECORD of
 *     which version it ran under, which is the checkable fact SK-1 is judged on.
 * ========================================================================= */

/* The levels and states are observation-log's (K78 (3), K81), read from its
   public entry; the bounds, endings and run refusals are run-rules' (K617, K649 (1)). */
import { OBSERVATION_LEVELS, OBSERVATION_STATES } from "./observation-log/index.mjs";
import { RUN_BOUNDS, RUN_ENDINGS, AI_RUN_CHECKS } from "./run-rules/index.mjs";
/* SK-2, LANDED 2026-08-10. The investigative skill's JUDGEMENT layers, authored
   in their own module and merged into the disclosed half below. They are a
   sibling rather than a section of this file for one reason worth stating: this
   file's deliverable is SOURCING — every vocabulary driven or imported — and
   SK-2's deliverable is DOCTRINE, which is authored prose held to a different
   defence (each sentence pinned to the document it is quoted from, and a
   source-scan proving it holds no control-flow authority). Two deliverables with
   two suites, and the pack composes them. */
import { judgementLayers, actionPlanningLayer, filingDraftingLayer, editionStatementLayer, wizardAuthoringLayer,
         SKILL_CHECKS, SKILL_CHECK_KEYS } from "./skilldoctrine.mjs";
export { SKILL_CHECKS, SKILL_CHECK_KEYS };
/* N345. The recommender's prompt is contradiction's (its R41): measured on the blind fixture of dissolved pairs
   under its digest, and carried here unchanged as the words a run recommends under (R27). The digest is checked
   at the render with record-grammar's one synchronous sha256, so a pack built over an unmeasured prompt fails the
   build (R1); nothing here holds a copy of either. */
import { RECOMMEND_PROMPT, RECOMMEND_PROMPT_SHA256 } from "./contradiction.mjs";
import { sha256HexSync } from "./record-grammar/index.mjs";

/* WHAT THE PACK IS AND WHICH EDITION OF ITS DOCTRINE THIS IS.
   The edition is the AUTHORED half of the version and moves with a release; the
   digest below moves on its own whenever a rendered word moves. */
export const SKILL_PACK_ID = "investigative-session";
export const DOCTRINE_EDITION = "1";

/* ------------------------------------------------------- the authored layer

   FOUR SENTENCES, and every one is quoted from a canon document
   (`requirements/README.md`) so that the slowest-drifting layer cannot drift
   silently. `test/m/skills/` opens the named document and fails if the
   sentence is not in it (R21) — which is the
   drift defence `ASSISTANT-PILOT.md` §1 assigns to this layer ("reviewed like
   doctrine") made mechanical for the part a machine can check. */

/** §2. Positive and therefore testable: a run whose claims only ever point one
 *  way is failing its own objective, visibly, without anyone knowing what the
 *  member wanted. */
export const OBJECTIVE =
  "Formulate claims and legs SUPPORTED BY EVIDENCE. The goal is not to support or disprove a position.";

/** §4, the corrected form, which survives the scope growing. */
export const BOUNDARY =
  "The AI holds no op that ACCEPTS anything. Nothing it can call concludes, accepts, publishes, or makes a version current.";

/** The Content Framework's own statement of Bob's correction of 2026-08-04
 *  (Part II §14.3), quoted, and it binds this pack hardest of anything: the
 *  assistant is the component most likely to say "there is nothing". The rule
 *  is the one the project has always held; only its citation moved, from the
 *  session instructions to the canon (K102). */
export const FOUR_LEVEL_RULE =
  "absence at one level is not evidence of absence at the next";

/** §14.3 again, the same sentence, and it is the reason the four levels are a
 *  vocabulary rather than a list: the search may need all four, in any order. */
export const SEARCH_COMPLETENESS =
  "all four levels — meaning, content, documents, and the open internet — may need to be "
  + "searched, in any order";

/* Where each authored sentence is quoted FROM, so the arm that checks it has an
   address rather than a search. Paths are repo-relative; every one is canon. */
export const CONTENT_FRAMEWORK = "docs/architecture/BIO_Content_Framework_v0_10.md";
export const AUTHORED_SOURCES = {
  OBJECTIVE:           "docs/development/INVESTIGATIVE-SESSION.md",
  BOUNDARY:            "docs/development/INVESTIGATIVE-SESSION.md",
  FOUR_LEVEL_RULE:     CONTENT_FRAMEWORK,
  SEARCH_COMPLETENESS: CONTENT_FRAMEWORK,
};
/** The section of the Content Framework the four-level sentences cite. */
export const FOUR_LEVEL_SECTION = "Part II §14.3";

/* WHAT AN ANSWER REPORTING ABSENCE OWES, and it is the rule rather than the
   words: the words are `OBSERVATION_LEVELS` and `OBSERVATION_STATES`, imported.
   Written as a shape a run must fill rather than as a sentence it must remember,
   because a sentence is advice and a shape is a contract: `level` and `state`
   are the two fields §11's log already refuses an entry without. */
export const ABSENCE_ANSWER_SHAPE = ["level", "state", "searched", "not_searched"];

/* ------------------------------------------------------- SOURCING, DECLARED

   The three kinds, per pack member, MECHANICALLY. The suite reads this and
   holds each member to its declaration — a member declared `driven` whose value
   does not come from the caller's published answer, or one declared `imported`
   whose words appear in this file as literals, FAILS. A declaration nothing
   checks is a comment. */
export const SOURCING = {
  objective:      "authored",
  boundary_rule:  "authored",
  four_level:     "authored",
  levels:         "imported",   /* observation-log OBSERVATION_LEVELS */
  absence:        "imported",   /* observation-log OBSERVATION_STATES */
  fences:         "driven",     /* op=affordances .fences: machineFences over every module's families (K585 (1)) */
  bounds:         "imported",   /* run-rules RUN_BOUNDS + RUN_ENDINGS */
  refusals:       "imported",   /* run-rules AI_RUN_CHECKS */
  vocabularies:   "driven",     /* op=affordances .vocabularies */
  acts:           "driven",     /* op=affordances .catalog */
  member_only:    "driven",     /* op=affordances .catalog, the mode field */
  contradiction:  "imported",   /* contradiction RECOMMEND_PROMPT + its measured digest (N345) */
  contradiction_unmeasured: "absent", /* while contradiction's RECOMMEND_PROMPT_SHA256 is null (R27) */
  action_planning: "authored",  /* skilldoctrine.mjs, BIO_Action_v0_1.md §4 (R28) */
  action_planning_unpublished: "absent", /* while op=affordances publishes no planning act (R29) */
  filing_drafting: "authored",  /* skilldoctrine.mjs, BIO_Action_v0_1.md §4 rules 1, 7, 11, 13 (R30) */
  filing_drafting_unpublished: "absent", /* while op=affordances publishes no template proposal act (R30) */
  edition_statement: "authored", /* skilldoctrine.mjs, BIO_Publication_v0_1.md §5A (R31) */
  edition_statement_unpublished: "absent", /* while op=affordances publishes no edition statement proposal act (R31) */
  wizard_authoring: "authored", /* skilldoctrine.mjs, Interaction Constructs §P, ASSISTANT-PILOT §3 (R32) */
  wizard_authoring_unpublished: "absent", /* while op=affordances publishes no wizard script proposal act (R32) */
  wizard_scripts: "absent",     /* absent until the plane publishes wizard scripts — see the header (R9) */
  wizard_scripts_published: "driven", /* op=affordances .wizard_scripts, validated against .screens (R10) */
  /* SK-2's five layers. `authored` throughout, and the label is the honest one:
     they are doctrine somebody wrote. Their vocabularies are imported and their
     quoted sentences are pinned to the documents they come from, which is the
     drift defence — the sourcing label is not. */
  judgement:      "authored",   /* skilldoctrine.mjs — SK-2 */
};

/* ------------------------------------------------------------ the harvests */

/** THE MACHINE / MEMBER BOUNDARY IN THE PLANE'S OWN PUBLISHED WORDS.
 *
 *  The control plane publishes its answer as `op=affordances`' `fences`, run over
 *  every module's check families (K585 (1)), and the pack renders that answer
 *  (R3); this module holds the harvest so the rule has one site.
 *
 *  Harvested from a catalogue namespace by export name matching `_CHECKS$` (R7,
 *  held by the R7 test in `test/m/skills/`): a family added later is picked up,
 *  and a family REMOVED takes its codes with it visibly rather than leaving a
 *  hand list behind that still names them.
 *
 *  The row's canned translation is the sentence a member reads when the fence
 *  fires. `ASSISTANT-PILOT.md` §1: when a member hits a refusal, the assistant's
 *  job is to SURFACE that text and route, never to paraphrase it. So the pack
 *  carries the text VERBATIM and holds no wording of its own for any fence.
 *
 *  `catalogue` is passed in rather than imported as a namespace: the control
 *  plane passes its composed families and the suite a catalogue made for the
 *  case, through THE SAME function. There is no second copy. */
export function machineFences(catalogue) {
  const out = [];
  for (const [family, rows] of Object.entries(catalogue || {})) {
    if (!/_CHECKS$/.test(family) || !rows || typeof rows !== "object") continue;
    for (const [code, row] of Object.entries(rows)) {
      if (!code.startsWith(MACHINE_FENCE_PREFIX)) continue;
      if (!row || typeof row.translation !== "string" || !row.translation) continue;
      out.push({ code, family, check: row.check ?? null, says: row.translation });
    }
  }
  return out.sort((a, b) => (a.code < b.code ? -1 : a.code > b.code ? 1 : 0));
}

/* A PREFIX IS NOT A VOCABULARY MEMBER, and this one is written plainly rather
   than assembled to dodge the sourcing arm — an instrument its own subject has
   to be hidden from is an instrument with a hole. It is a SELECTOR over the
   catalogue, and what makes it honest is that it selects something: the render
   below throws when the published harvest is empty, so a prefix that stopped
   matching fails loudly instead of rendering a boundary with no fences in it. */
const MACHINE_FENCE_PREFIX = "MACHINE_CANNOT_";

/** THE ACTS A MACHINE CREDENTIAL CANNOT REACH, from the published catalogue.
 *
 *  `op=affordances` publishes `mode` per act — `session`, `admin-session` or
 *  `machine` — computed at the control plane from `SESSION_OPS`, the table that
 *  actually gates the call. An act that needs a session is an act no `ai`-class
 *  credential can perform, because a token class has no member behind it. So the
 *  boundary is EMITTED and this function only reads it; nothing here decides
 *  which acts are a member's, which is precisely the decision a hand-written
 *  pack would have been making. */
export function memberOnlyActs(catalog) {
  const rows = Array.isArray(catalog) ? catalog : [];
  return rows.filter((a) => a && typeof a.mode === "string" && a.mode !== MACHINE_MODE)
             .map((a) => ({ id: a.id, label: a.label ?? null, mode: a.mode,
                            prompt: a.prompt ?? null }))
             .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

/* THE ONE PUBLISHED TOKEN THIS FILE NAMES (R23). `mode` discriminates a field;
   it is not a vocabulary the pack renders to anyone, so it is not in the
   sourcing arm's corpus. That the plane still computes `machine` with this
   spelling (`decorateAct`) is pinned by the op table's owner, later in the order
   (N53), which reads this module; this module's own tests drive the function
   over a catalogue carrying the mode. */
const MACHINE_MODE = "machine";

/* ------------------------------------------------------------- the render */

/** THE PACK, RENDERED. `published` is the plane's OWN answer to `op=affordances`
 *  with no target — `{ catalog, vocabularies, capture_acts, fences }` — passed
 *  straight in and never reshaped. It is the one input (§1a, K585 (1)): the
 *  fences arrive published, so a caller renders the pack without the catalogue.
 *
 *  IT THROWS ON AN EMPTY SOURCE, and that is the item's empty-case guard rather
 *  than a defensive habit. A pack rendered over an empty published vocabulary
 *  would be a pack whose vocabulary layer is EMPTY AND LOOKS RENDERED — the
 *  false-coverage shape, arriving in the one place where the whole point is that
 *  the words came from the plane. `acquireGradeNote` in `affordances.mjs` is the
 *  precedent: it throws rather than compose a sentence it cannot compose
 *  truthfully. A control that passes while asserting nothing is the failure
 *  D-216's arm 3 measured, and an empty render is how it would arrive here. */
export function renderPack(published) {
  const p = published && typeof published === "object" ? published : {};
  const vocabularies = p.vocabularies && typeof p.vocabularies === "object" ? p.vocabularies : null;
  const catalog = Array.isArray(p.catalog) ? p.catalog : null;

  if (!vocabularies || Object.keys(vocabularies).length === 0)
    throw new Error("the pack renders the plane's PUBLISHED vocabulary and invents none, so it "
      + "cannot be rendered against an empty one: op=affordances published no vocabularies");
  if (!catalog || catalog.length === 0)
    throw new Error("the pack renders the plane's PUBLISHED act catalogue and invents none, so it "
      + "cannot be rendered against an empty one: op=affordances published no acts");

  const fences = Array.isArray(p.fences) ? p.fences : null;
  if (!fences || fences.length === 0)
    throw new Error("the machine/member boundary is rendered from the plane's PUBLISHED fences, in the "
      + "check rows' own canned translations, and this pack writes none of its own: op=affordances "
      + "published no fences");

  const memberOnly = memberOnlyActs(catalog);
  if (memberOnly.length === 0)
    throw new Error("the machine/member boundary names the acts a machine credential cannot reach, "
      + "read from the published `mode`: the catalogue published none");

  /* R1, N345: the recommender's words are contradiction's, measured under their digest. A prompt that is
     not the measured one is a detector that never passed its fixture, so no pack renders over it. A digest
     that is null says no measurement was made: then the layer states its absence (R27) and carries no
     prompt, as the wizard scripts layer does (R9), and the rest of the pack renders. */
  if (typeof RECOMMEND_PROMPT !== "string" || RECOMMEND_PROMPT.trim() === "")
    throw new Error("the pack carries contradiction's recommender prompt and writes none of its own: "
      + "contradiction exported no RECOMMEND_PROMPT");
  if (RECOMMEND_PROMPT_SHA256 !== null && sha256HexSync(RECOMMEND_PROMPT) !== RECOMMEND_PROMPT_SHA256)
    throw new Error("the pack carries contradiction's recommender prompt only as it was measured: "
      + "sha256(RECOMMEND_PROMPT) is not contradiction's RECOMMEND_PROMPT_SHA256");

  const levels = Object.keys(OBSERVATION_LEVELS);
  const states = Object.keys(OBSERVATION_STATES);
  if (levels.length === 0 || states.length === 0)
    throw new Error("the four-level rule and the absence vocabulary are imported from observation-log and "
      + "one of them is empty; a rule stated in words nobody holds is not a rule");

  /* THE RESIDENT LAYER. Everything a run must hold from its first token, and
     nothing else — the four members named in the header, each with the sourcing
     it was rendered under so a reader of the PACK can tell an authored sentence
     from an emitted one without reading this file. */
  const resident = {
    objective: { text: OBJECTIVE, source: AUTHORED_SOURCES.OBJECTIVE, sourcing: SOURCING.objective },
    boundary: {
      rule: BOUNDARY, source: AUTHORED_SOURCES.BOUNDARY, sourcing: SOURCING.boundary_rule,
      /* The fences in the plane's own words, verbatim, never paraphrased. */
      fences, fences_sourcing: SOURCING.fences,
      member_only_acts: memberOnly, member_only_sourcing: SOURCING.member_only,
      /* STATED, because the subset is the honest description of what was
         rendered and an unstated limit reads as completeness. */
      fences_note: "the fences rendered here are those carrying a canned translation; the plane can "
        + "refuse a machine in words this pack does not hold, and this pack paraphrases none of them",
    },
    four_level: {
      rule: FOUR_LEVEL_RULE, completeness: SEARCH_COMPLETENESS,
      source: AUTHORED_SOURCES.FOUR_LEVEL_RULE, section: FOUR_LEVEL_SECTION,
      sourcing: SOURCING.four_level,
      levels: OBSERVATION_LEVELS, levels_sourcing: SOURCING.levels,
      answer_shape: ABSENCE_ANSWER_SHAPE,
    },
    absence: { states: OBSERVATION_STATES, sourcing: SOURCING.absence },
    /* WHAT MAY BE ASKED FOR. The disclosed layer's NAMES are resident — a run
       that does not know a layer exists cannot ask for it — and its bodies are
       not. That is the whole of progressive disclosure as a mechanism rather
       than an intention (§14b.1). */
    disclosable: null,   /* filled below, from the disclosed layer's own keys */
  };

  /* R10: wizard scripts the plane publishes are validated here, and a step
     naming a screen the plane does not publish, or an act that is not an op of
     the screen it names, throws, so a pack rendered at build fails the build.
     Absent, the layer states its absence (R9). */
  const wizardScripts = Array.isArray(p.wizard_scripts) ? p.wizard_scripts : null;
  if (wizardScripts) validateWizardScripts(wizardScripts, p.screens);

  const disclosed = disclosedLayers({ vocabularies, catalog, captureActs: p.capture_acts, wizardScripts });
  resident.disclosable = Object.keys(disclosed).map((k) => ({ layer: k, load_when: disclosed[k].load_when }));

  const pack = { id: SKILL_PACK_ID, edition: DOCTRINE_EDITION, resident, disclosed,
                 sourcing: SOURCING };
  return { ...pack, version: packVersion(pack) };
}

/** THE PROGRESSIVELY-DISCLOSED LAYERS (§14b.1). Each names the work that loads
 *  it, so "loads when the run reaches work that needs them" is a field a
 *  scheduler can read rather than a sentence a model must interpret. */
export function disclosedLayers({ vocabularies, catalog, captureActs, wizardScripts = null } = {}) {
  return {
    /* SK-2's judgement layers first, so `disclosable` lists what the run is
       INSTRUCTED BY before what it is given to work with. Spread from one
       function rather than restated here: `skilldoctrine.mjs` decides what its
       layers are and this file never holds a second list of them, so a layer
       added there arrives in the pack — and in the pack's version — without an
       edit here. */
    ...judgementLayers(),
    vocabularies: {
      load_when: "the run composes a version, or renders any closed set to a member",
      sourcing: SOURCING.vocabularies,
      body: vocabularies,
    },
    acts: {
      load_when: "the run needs to know what a member could do next with what it proposes",
      sourcing: SOURCING.acts,
      body: { catalog, capture_acts: Array.isArray(captureActs) ? captureActs : [] },
    },
    bounds: {
      load_when: "the run opens, resumes, or must say which bound stopped it",
      sourcing: SOURCING.bounds,
      body: { bounds: RUN_BOUNDS, endings: RUN_ENDINGS },
    },
    refusals: {
      load_when: "the run is refused, and must surface the record's own words rather than its own",
      sourcing: SOURCING.refusals,
      body: Object.fromEntries(Object.entries(AI_RUN_CHECKS)
        .map(([code, row]) => [code, { check: row.check, says: row.translation }])),
    },
    /* N345, R27. The words a run recommends under on a contradiction candidate, contradiction's own and
       unchanged, with the digest they were measured under; carried, never reworded, so the pack's version
       moves when they do. */
    contradiction: RECOMMEND_PROMPT_SHA256 !== null ? {
      load_when: "the run judges or recommends on a contradiction candidate's two sides",
      sourcing: SOURCING.contradiction,
      body: { recommend_prompt: RECOMMEND_PROMPT, recommend_prompt_sha256: RECOMMEND_PROMPT_SHA256 },
    } : {
      load_when: "never, in this edition",
      sourcing: SOURCING.contradiction_unmeasured,
      body: {},
      /* THE ABSENCE, STATED IN THE PACK ITSELF, as the wizard scripts layer states its own. */
      absent_because: "contradiction's recommender prompt has passed no measurement: its digest is null "
        + "until the blind fixture of dissolved pairs is run under it and recorded, and a prompt no "
        + "measurement vouches for is not given to a run as the words it recommends under.",
    },
    /* R28, R29 (K608, K660). The Action layer's rules a run proposing plan options works under, and the acts
       it may use and must leave to a member, read from the published catalogue; a stated absence while the
       plane publishes no planning act. Authored in `skilldoctrine.mjs`, as the judgement layers are. */
    action_planning: actionPlanningLayer(catalog),
    /* R30 (K921). The rules a run proposing a filing template's wording works under, and the template acts it
       may use and must leave to a member, read from the published catalogue; a stated absence while the plane
       publishes no template proposal act. */
    filing_drafting: filingDraftingLayer(catalog),
    /* R31 (DEC-101 (1), K1019). The doctrine a run drafting a new edition's statement of what changed works
       under, and the acts it may use and must leave to a member, read from the published catalogue; a stated
       absence while the plane publishes no edition statement proposal act. */
    edition_statement: editionStatementLayer(catalog),
    /* R32 (DEC-121 (3), (4), K1364 B3). The doctrine a run drafting or critiquing a wizard script works under,
       and the acts it may use and must leave to a member, read from the published catalogue; a stated absence
       while the plane publishes no wizard script proposal act. */
    wizard_authoring: wizardAuthoringLayer(catalog),
    wizard_scripts: Array.isArray(wizardScripts) ? {
      load_when: "the run guides a member through a path to a result, or must say which steps reach it",
      sourcing: SOURCING.wizard_scripts_published,
      body: wizardScripts,
    } : {
      load_when: "never, in this edition",
      sourcing: SOURCING.wizard_scripts,
      body: [],
      /* THE ABSENCE, STATED IN THE PACK ITSELF. A run reading this layer learns
         that the pack holds no wizard scripts, which is a different fact from a
         pack that forgot to carry them. */
      absent_because: "a wizard script is DATA whose every step names a screen and an op of that screen, and it "
        + "is worth carrying only if a step naming a screen or an op that does not exist FAILS THE BUILD. The "
        + "plane has not published its screen registry and its wizard scripts to this render, so no script "
        + "could be validated here, and none is carried: the layer waits on the plane publishing both.",
    },
  };
}

/** R10. Every wizard script is a list of steps, each naming a screen the plane
 *  published and, unless its act is null (a step that only reads), an op that
 *  screen lists; anything else throws, naming the script, the step and the
 *  unknown name, and nothing renders. The names are read from what was
 *  published (`published.screens[].acts`), so this file holds none of them. */
function validateWizardScripts(scripts, screens) {
  const opsByScreen = new Map();
  for (const sc of Array.isArray(screens) ? screens : []) {
    if (!sc || typeof sc !== "object" || typeof sc.id !== "string") continue;
    opsByScreen.set(sc.id, new Set((Array.isArray(sc.acts) ? sc.acts : [])
      .map((a) => (a && typeof a === "object" ? a.id : a)).filter((a) => typeof a === "string")));
  }
  scripts.forEach((w, i) => {
    const name = w && typeof w.id === "string" ? w.id : `#${i}`;
    const steps = w && Array.isArray(w.steps) ? w.steps : [];
    if (steps.length === 0)
      throw new Error(`wizard script ${name} has no steps: a wizard script is a path of steps, each naming a `
        + "screen the plane publishes and an op of that screen");
    steps.forEach((st, j) => {
      const screen = st && st.screen, act = st ? st.act : undefined;
      if (typeof screen !== "string" || !opsByScreen.has(screen))
        throw new Error(`wizard script ${name} step ${j + 1} names the screen ${JSON.stringify(screen)}, `
          + "which the plane does not publish");
      if (act !== null && !opsByScreen.get(screen).has(act))
        throw new Error(`wizard script ${name} step ${j + 1} names the act ${JSON.stringify(act)}, `
          + `which is not an op of the screen ${JSON.stringify(screen)}`);
    });
  });
}

/* --------------------------------------------------------------- the version */

/** Deterministic key order, all the way down. Two renders of the same pack must
 *  produce the same bytes or the version is noise. */
function canonical(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return "[" + value.map(canonical).join(",") + "]";
  return "{" + Object.keys(value).sort()
    .map((k) => JSON.stringify(k) + ":" + canonical(value[k])).join(",") + "}";
}

/** FNV-1a in two lanes with different offset bases, 16 hex. An IDENTITY digest:
 *  it answers "is this the same pack" and nothing gates on it. See the header. */
function digest(text) {
  let a = 0x811c9dc5, b = 0x01000193;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    a = Math.imul(a ^ c, 0x01000193) >>> 0;
    b = Math.imul(b ^ (c + i), 0x85ebca6b) >>> 0;
  }
  return a.toString(16).padStart(8, "0") + b.toString(16).padStart(8, "0");
}

/** THE VERSION STRING THE RUN RECORDS. `<id>@<edition>+<digest>`.
 *  Computed over the pack WITHOUT its version field, which is the only way a
 *  digest over a self-describing object terminates. */
export function packVersion(pack) {
  const { version, ...rest } = pack || {};
  return `${SKILL_PACK_ID}@${DOCTRINE_EDITION}+${digest(canonical(rest))}`;
}

/* ------------------------------------------------------------------ refusal

   ONE code, C-22.7, and its predicate is `run-rules`' (its R8; K82 (4), K194,
   K617): `checkSkillVersion` is held there, which the run's open calls, and
   re-exported here with `parseSkillVersion` (R12, R13; N156), so no copy of
   either is held in this module. The row is named here by key
   (`SKILL_CHECKS`, from `skilldoctrine.mjs`) and never copied (R25). What the
   predicate refuses and why is stated at its site: a blank version, or one
   that is not `<pack>@<edition>`, and never a well-formed version this module
   did not render, so a rerun under a newer pack can record it. */
export { checkSkillVersion, parseSkillVersion } from "./run-rules/index.mjs";
