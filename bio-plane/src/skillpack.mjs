/* SK-1 — THE DOCTRINE PACK, VERSIONED, AND ITS VOCABULARY IS NEVER TYPED.
 *
 * `IS-BUILD-PLAN.md` SK-1; `INVESTIGATIVE-SESSION.md` §2 (the objective), §4
 * (the fence: the AI holds no op that ACCEPTS), §11 (the run is an object and
 * carries the SKILL VERSION it ran under), §14a (the Claude Code mapping, where
 * `CLAUDE.md` loaded every session maps onto "the skill's doctrine layer, and
 * the run records which skill version it ran under"), §14b.1 (progressive
 * disclosure); `ASSISTANT-PILOT.md` §1 (the five layers by drift rate).
 *
 * PURE, for `airun.mjs`'s and `queuestate.mjs`'s stated reason: no storage, no
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
 *     3. THE FOUR-LEVEL RULE (CLAUDE.md). What an absence may never be read as.
 *     4. THE ABSENCE VOCABULARY (D-129). The words the third rule is stated in.
 *
 *   PROGRESSIVELY DISCLOSED — the vocabularies and recipes of §14b.1, each with
 *   the trigger that loads it. They are named in the resident layer (so the run
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
 *   `imported` — read from the module that ENFORCES the words (`airun.mjs`,
 *                `checks/bio-checks.mjs`). No copy exists here to go stale.
 *   `driven`   — read from what the plane PUBLISHES on the wire
 *                (`op=affordances`), passed in by the caller as the plane's own
 *                answer and never reshaped.
 *
 * `test/skillpack.test.mjs` reads this file's own source and FAILS if any member
 * of a driven or imported vocabulary appears in it as a string literal. That is
 * the arm that makes the sentence above a fact rather than an intention.
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
 *   - **RECIPES ARE NAMED AND EMPTY.** `ASSISTANT-PILOT.md` §1 requires a recipe
 *     to be DATA whose every step names a surface id and an act/op, mechanically
 *     validated so a recipe naming a surface that does not exist FAILS THE
 *     BUILD. The surface registry is `civicos-ui`'s and no plane op publishes
 *     it, so a recipe authored HERE could not be validated here. The layer is
 *     therefore declared, empty, and its emptiness is PUBLISHED in the pack —
 *     an honest absence, never a silent omission.
 *     **STILL EMPTY AFTER SK-2, AND THE REASON IS UNCHANGED RATHER THAN
 *     FORGOTTEN.** SK-1 wrote "SK-2's to fill"; SK-2 landed its five JUDGEMENT
 *     layers (`skilldoctrine.mjs`) and did not fill this one, because the
 *     blocker is not authorship — it is validation. A recipe is worth having
 *     only if a step naming a surface that does not exist FAILS THE BUILD, the
 *     surface registry is `civicos-ui`'s, and no plane op publishes it. Writing
 *     unvalidated recipes here would buy the appearance of a layer and none of
 *     the property that makes one worth carrying. It waits on a published
 *     surface registry, and that is an interface item, not a skill one.
 *   - **THE MACHINE FENCE IS WIDER THAN ITS CANNED WORDS.** The boundary layer
 *     renders the fences that carry a DEC-49 canned translation. The plane can
 *     mint machine refusals that carry none; this pack names none of them and
 *     paraphrases none of them, and publishes the fact that it is rendering a
 *     SUBSET. The suite measures the size of that subset against the plane's own
 *     source and prints it every run, so the gap is visible rather than implied.
 *   - **NO OP PUBLISHES THIS PACK, DELIBERATELY.** The pack is rendered by
 *     whatever RUNS under it — FL-3's harness, and `test/skillpack.test.mjs`
 *     today — from the plane's existing published answer. An op returning the
 *     pack would be a second, plane-side copy of a thing whose entire point is
 *     that it is rendered from the first, and it would buy a coverage row for a
 *     consumer that does not exist. What the plane holds is the run's RECORD of
 *     which version it ran under, which is the checkable fact SK-1 is judged on.
 * ========================================================================= */

import { OBSERVATION_LEVELS, OBSERVATION_STATES, RUN_BOUNDS, RUN_ENDINGS,
         AI_RUN_CHECKS } from "./airun.mjs";
/* SK-2, LANDED 2026-08-10. The investigative skill's JUDGEMENT layers, authored
   in their own module and merged into the disclosed half below. They are a
   sibling rather than a section of this file for one reason worth stating: this
   file's deliverable is SOURCING — every vocabulary driven or imported — and
   SK-2's deliverable is DOCTRINE, which is authored prose held to a different
   defence (each sentence pinned to the document it is quoted from, and a
   source-scan proving it holds no control-flow authority). Two deliverables with
   two suites, and the pack composes them. */
import { judgementLayers } from "./skilldoctrine.mjs";

/* WHAT THE PACK IS AND WHICH EDITION OF ITS DOCTRINE THIS IS.
   The edition is the AUTHORED half of the version and moves with a release; the
   digest below moves on its own whenever a rendered word moves. */
export const SKILL_PACK_ID = "investigative-session";
export const DOCTRINE_EDITION = "1";

/* ------------------------------------------------------- the authored layer

   FOUR SENTENCES, and every one is quoted from a document in this repository so
   that the slowest-drifting layer cannot drift silently. `test/skillpack.test.mjs`
   opens the named document and fails if the sentence is not in it — which is the
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

/** CLAUDE.md's standing section, and it binds this pack hardest of anything:
 *  the assistant is the component most likely to say "there is nothing". */
export const FOUR_LEVEL_RULE =
  "Absence at one level is not evidence of absence at the next";

/** CLAUDE.md again, one line up, and it is the reason the four levels are a
 *  vocabulary rather than a list: the search may need all four, in any order. */
export const SEARCH_COMPLETENESS =
  "NEVER ASSUME THE LOWER LEVELS ARE COMPLETE.";

/* Where each authored sentence is quoted FROM, so the arm that checks it has an
   address rather than a search. Paths are repo-relative. */
export const AUTHORED_SOURCES = {
  OBJECTIVE:           "docs/development/INVESTIGATIVE-SESSION.md",
  BOUNDARY:            "docs/development/INVESTIGATIVE-SESSION.md",
  FOUR_LEVEL_RULE:     "CLAUDE.md",
  SEARCH_COMPLETENESS: "CLAUDE.md",
};

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
  levels:         "imported",   /* airun.mjs OBSERVATION_LEVELS */
  absence:        "imported",   /* airun.mjs OBSERVATION_STATES */
  fences:         "imported",   /* checks/bio-checks.mjs, the MACHINE_CANNOT_ rows */
  bounds:         "imported",   /* airun.mjs RUN_BOUNDS + RUN_ENDINGS */
  refusals:       "imported",   /* checks/bio-checks.mjs AI_RUN_CHECKS */
  vocabularies:   "driven",     /* op=affordances .vocabularies */
  acts:           "driven",     /* op=affordances .catalog */
  member_only:    "driven",     /* op=affordances .catalog, the mode field */
  recipes:        "absent",     /* STILL absent, and the reason is unchanged — see the header */
  /* SK-2's five layers. `authored` throughout, and the label is the honest one:
     they are doctrine somebody wrote. Their vocabularies are imported and their
     quoted sentences are pinned to the documents they come from, which is the
     drift defence — the sourcing label is not. */
  judgement:      "authored",   /* skilldoctrine.mjs — SK-2 */
};

/* ------------------------------------------------------------ the harvests */

/** THE MACHINE / MEMBER BOUNDARY IN THE PLANE'S OWN PUBLISHED WORDS.
 *
 *  Harvested from the check catalogue by export name matching `_CHECKS$` — the
 *  rule `civicos-ui/check-refusal-codes.mjs` already harvests families by, and
 *  stated the same way it states it: a family added later is picked up, and a
 *  family REMOVED takes its codes with it visibly rather than leaving a hand
 *  list behind that still names them.
 *
 *  The row's canned translation is the sentence a member reads when the fence
 *  fires. `ASSISTANT-PILOT.md` §1: when a member hits a refusal, the assistant's
 *  job is to SURFACE that text and route, never to paraphrase it. So the pack
 *  carries the text VERBATIM and holds no wording of its own for any fence.
 *
 *  `catalogue` is passed in rather than imported as a namespace so the suite can
 *  drive this function over a mutated catalogue through THE SAME function the
 *  real render uses. There is no second copy to mutate separately. */
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
   below throws when the harvest is empty, so a prefix that stopped matching
   fails loudly instead of rendering a boundary with no fences in it. */
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

/* THE ONE PUBLISHED TOKEN THIS FILE NAMES, AND IT IS PINNED RATHER THAN TRUSTED.
   `mode` discriminates a field; it is not a vocabulary the pack renders to
   anyone, so it is not in the sourcing arm's corpus. It is held instead by TWO
   assertions in `test/skillpack.test.mjs`, both against the plane and neither
   against this line: the published catalogue must actually carry acts at this
   mode, and `index.mjs`'s `decorateAct` — the one place the value is computed —
   must still spell it this way. Rename it there and the suite fails naming the
   site, which is the treatment UI-49 gave the run-status word for the same
   reason: a word a surface must know is pinned to where the plane mints it. */
const MACHINE_MODE = "machine";

/* ------------------------------------------------------------- the render */

/** THE PACK, RENDERED. `published` is the plane's OWN answer to `op=affordances`
 *  with no target — `{ catalog, vocabularies, capture_acts }` — passed straight
 *  in and never reshaped. `catalogue` is the check catalogue module namespace.
 *
 *  IT THROWS ON AN EMPTY SOURCE, and that is the item's empty-case guard rather
 *  than a defensive habit. A pack rendered over an empty published vocabulary
 *  would be a pack whose vocabulary layer is EMPTY AND LOOKS RENDERED — the
 *  false-coverage shape, arriving in the one place where the whole point is that
 *  the words came from the plane. `acquireGradeNote` in `affordances.mjs` is the
 *  precedent: it throws rather than compose a sentence it cannot compose
 *  truthfully. A control that passes while asserting nothing is the failure
 *  D-216's arm 3 measured, and an empty render is how it would arrive here. */
export function renderPack(published, catalogue) {
  const p = published && typeof published === "object" ? published : {};
  const vocabularies = p.vocabularies && typeof p.vocabularies === "object" ? p.vocabularies : null;
  const catalog = Array.isArray(p.catalog) ? p.catalog : null;

  if (!vocabularies || Object.keys(vocabularies).length === 0)
    throw new Error("the pack renders the plane's PUBLISHED vocabulary and invents none, so it "
      + "cannot be rendered against an empty one: op=affordances published no vocabularies");
  if (!catalog || catalog.length === 0)
    throw new Error("the pack renders the plane's PUBLISHED act catalogue and invents none, so it "
      + "cannot be rendered against an empty one: op=affordances published no acts");

  const fences = machineFences(catalogue);
  if (fences.length === 0)
    throw new Error("the machine/member boundary is rendered from the check catalogue's own canned "
      + "translations and this pack writes none of its own: no fence row was harvested");

  const memberOnly = memberOnlyActs(catalog);
  if (memberOnly.length === 0)
    throw new Error("the machine/member boundary names the acts a machine credential cannot reach, "
      + "read from the published `mode`: the catalogue published none");

  const levels = Object.keys(OBSERVATION_LEVELS);
  const states = Object.keys(OBSERVATION_STATES);
  if (levels.length === 0 || states.length === 0)
    throw new Error("the four-level rule and the absence vocabulary are imported from airun.mjs and "
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
      source: AUTHORED_SOURCES.FOUR_LEVEL_RULE, sourcing: SOURCING.four_level,
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

  const disclosed = disclosedLayers({ vocabularies, catalog, captureActs: p.capture_acts },
                                    catalogue);
  resident.disclosable = Object.keys(disclosed).map((k) => ({ layer: k, load_when: disclosed[k].load_when }));

  const pack = { id: SKILL_PACK_ID, edition: DOCTRINE_EDITION, resident, disclosed,
                 sourcing: SOURCING };
  return { ...pack, version: packVersion(pack) };
}

/** THE PROGRESSIVELY-DISCLOSED LAYERS (§14b.1). Each names the work that loads
 *  it, so "loads when the run reaches work that needs them" is a field a
 *  scheduler can read rather than a sentence a model must interpret. */
export function disclosedLayers({ vocabularies, catalog, captureActs } = {}, catalogue) {
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
    recipes: {
      load_when: "never, in this edition",
      sourcing: SOURCING.recipes,
      body: [],
      /* THE ABSENCE, STATED IN THE PACK ITSELF. A run reading this layer learns
         that the pack holds no recipes, which is a different fact from a pack
         that forgot to carry them. */
      absent_because: "a recipe is DATA whose every step names a surface id and an act, and it is "
        + "worth having only if a step naming a surface that does not exist FAILS THE BUILD. The "
        + "surface registry is the interface's and no plane op publishes it, so a recipe authored "
        + "here could not be validated here. SK-2 landed the judgement layers and left this one "
        + "empty for that reason rather than for want of an author: it waits on a published "
        + "surface registry.",
    },
  };
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

   ONE code, built from `AI_RUN_CHECKS` — the same one place `airun.mjs` reads,
   so the C-number, the wire code and the canned translation stay one row
   (DEC-49). The helper is named `refusal` and the code is a STRING LITERAL at
   its site: a code in a variable is invisible to the DEC-49 guard, and one
   shipped `translation: undefined` to a member exactly that way. */

function refusal(key, detail) {
  const row = AI_RUN_CHECKS[key];
  return { ok: false, code: key, check: row.check, translation: row.translation, detail };
}

/** C-22.7 — A RUN MAY NOT OPEN WITHOUT NAMING THE SKILL VERSION IT RUNS UNDER.
 *
 *  §11 lists the skill version among THE CONDITIONS THE RUN WAS FORMED UNDER,
 *  beside the bias manifest and the standard pair, for Bob's stated reason:
 *  *"everything can change at the drop of a hat"*, so a version is only
 *  interpretable against them. SK-1's row makes the recording a REQUIREMENT
 *  rather than an analogy — and a condition that may be omitted is not recorded,
 *  it is recorded by the runs that felt like it.
 *
 *  SO IT IS REFUSED AT THE OPEN, where the principals already are: `aiRunOpen`
 *  refuses a run that cannot say which plane credential acts and which level of
 *  the Claude cascade pays, and this is the third condition of the same kind.
 *  Refusing later would mean a run had already searched under instructions
 *  nobody can name.
 *
 *  TWO WAYS TO FAIL AND ONE CODE, because they are one fact — the run object
 *  cannot say what it ran under. Absent is the ordinary case. **Present but
 *  naming no pack is the worse one**: `3` reads as an answer, and the moment a
 *  second pack exists nobody can tell which `3` it was. That is the blank-
 *  principal shape PL-4 measured one field over (a run that names nobody while
 *  looking like it names somebody), applied to a condition rather than an
 *  identity.
 *
 *  DELIBERATELY NOT CHECKED HERE: whether the version is one this instance
 *  CURRENTLY renders. A rerun under vN+1 must be able to record vN+1 while the
 *  record still holds runs under vN, and pinning the open to the current pack
 *  would make the two indistinguishable by making the older one impossible —
 *  which is the property SK-1 is judged on, removed by its own guard. Any pack's
 *  well-formed version is accepted, including a pack this repository never
 *  wrote. */
export function checkSkillVersion(version) {
  const v = typeof version === "string" ? version.trim() : "";
  if (!v)
    return refusal("AI_RUN_SKILL_VERSION_UNNAMED",
      "this run named no skill version. §11 records the conditions a run was formed under — the "
      + "manifest in force, the standard pair, and the skill version it ran under — because a "
      + "version is only interpretable against them");
  if (!/^[^\s@]+@[^\s@]+$/.test(v))
    return refusal("AI_RUN_SKILL_VERSION_UNNAMED",
      `'${v.slice(0, 60)}' names no pack. A skill version is <pack>@<edition>, and a bare edition `
      + "cannot be read once a second pack exists — it looks like an answer and identifies nothing");
  return null;
}

/** The pack id and edition a recorded version names, or null if it names none.
 *  Exported so a reader RESOLVES a version it received rather than parsing one
 *  it computed — DEC-8's direction, one field over. */
export function parseSkillVersion(version) {
  const v = typeof version === "string" ? version.trim() : "";
  if (checkSkillVersion(v)) return null;
  const at = v.indexOf("@");
  const rest = v.slice(at + 1);
  const plus = rest.indexOf("+");
  return { pack: v.slice(0, at),
           edition: plus < 0 ? rest : rest.slice(0, plus),
           digest: plus < 0 ? null : rest.slice(plus + 1) };
}
