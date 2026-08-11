/* IS-6 — THE INVESTIGATIVE RUN'S VOCABULARY AND ITS REFUSALS, kept PURE.
 *
 * `INVESTIGATIVE-SESSION.md` §11 (the run is an object), §14b.6 (a run is
 * bounded and the bound is RECORDED), §14b.7 (partial results survive). The
 * mechanism lives in `store.mjs`; this file holds the words and the decisions
 * that can be made without a database, for `queuestate.mjs`'s stated reason:
 *
 *   "It is PURE — no storage, no clock, no viewer — so a suite can hold the
 *    decision to the store's own behaviour directly … store.mjs cannot be
 *    imported outside workerd, and a rule that can only be exercised through a
 *    Durable Object is a rule that gets exercised less."
 *
 * ---------------------------------------------------------------------------
 * WHAT THE RUN OBJECT IS, AND WHAT IT IS NOT
 * ---------------------------------------------------------------------------
 *
 * §11 says the proven model is `capture_sessions` — *"SCRATCH, not record… a
 * work list with an expiry"*: ticks, an expiry, opaque state, resumable across
 * invocations. The run EXTENDS that shape rather than inventing one, and the
 * three additions are the ones §11 and §14b.6 name: the conditions the run was
 * formed under, the BOUNDS it carries with their live consumption, and the
 * OBSERVATION LOG.
 *
 * THREE OBJECTS ARE DELIBERATELY KEPT APART AND THE LINES ARE STATED HERE
 * BECAUSE THEY HAVE BEEN CONFLATED IN CONVERSATION:
 *
 *   1. THE RECORD — bundles, `bundle.md`, the published projection. Written on
 *      SUCCESS. A version the run proposes lands here through IS-1's write
 *      site, and nothing in this file writes it.
 *   2. THE OBSERVATION LOG — where the run searched across the four levels,
 *      what it found, where it STOPPED and why. It lives in `ai_run_log` in the
 *      instance's own Durable Object, it is APPEND-ONLY, and §11 is explicit
 *      that it "cannot live in bundle.md, which is written only on success —
 *      the log's whole value is the failure path". C-22.6 is the fence.
 *   3. THE TRANSCRIPT — the model's reasoning. DEC-61 (Bob, 2026-08-06):
 *      DEVICE-LOCAL, TTL'd, deleted as part of publication, NEVER in the record
 *      store. Nothing in this file, in `store.mjs`, or in any table this item
 *      adds holds one. The observation log is NOT a transcript and is not
 *      governed by DEC-61: it is a structured account of where the search went,
 *      it carries no reasoning, and it is the thing that lets someone else
 *      CHECK the run — which is exactly why it is instance-side and durable
 *      while the reasoning is neither.
 *
 * ---------------------------------------------------------------------------
 * THE ACCEPTANCE, AND HOW IT IS A MECHANISM RATHER THAN AN INTENTION
 * ---------------------------------------------------------------------------
 *
 * §14b.6: *the log is written WHETHER OR NOT THE RUN SUCCEEDS, and it NAMES THE
 * BOUND THAT STOPPED IT.* A log that exists only when the run finished is a log
 * about the runs that did not need one.
 *
 * "The run writes its log on the way out" is an INTENTION, and it fails in the
 * one case that matters: a run that is killed does not run its own exit path.
 * So the terminal entry is NOT the run's to write. Two properties carry it:
 *
 *   (a) ONE TERMINATION FUNCTION. `store.mjs #aiRunTerminate` is the only thing
 *       that can move a run out of `running`, and it appends the terminal log
 *       entry in the SAME transaction as the status change. There is no state
 *       in which a run is finished and its log is silent, because the two are
 *       one write. `finishedBound` below is the pure half of that decision, so
 *       the ordinary path and the reaped path compute the bound through ONE
 *       function rather than two that agree.
 *
 *   (b) A THIRD PARTY ON THE CLOCK. A killed run never calls anything. Its
 *       LEASE lapses, and the scheduler consumer `ai-run-reap` — ONE appended
 *       entry in `#schedConsumers`, per SCHEDULER.md, no second alarm and no
 *       cron — terminates it through the same (a). The run's death is therefore
 *       observed by something that is not the run. That is the whole guarantee:
 *       the log is not written because the run remembered, it is written
 *       because the only exit from `running` writes it, and something outside
 *       the run takes that exit when the run cannot.
 *
 * ---------------------------------------------------------------------------
 * D-129, AND WHY `partial` IS A FIFTH MEMBER RATHER THAN A FLAG
 * ---------------------------------------------------------------------------
 *
 * D-129 began as a two-value split (we do not know / there is positively none)
 * and was widened twice by the surveys in `STORE-AS-CACHE.md`: Software
 * Heritage stores crawl outcomes as DATA rather than inferring them from
 * missing rows, and RFC 2308 separates "does not exist" from "exists but not
 * this record" from "we asked and could not tell". The settled set is
 * `NEVER_LOOKED / LOOKED_ABSENT / LOOKED_INDETERMINATE / PRESENT`, plus SWH's
 * `partial`.
 *
 * `partial` is a member of the same enumeration and not a boolean beside it,
 * because the question every consumer asks is "what did this observation
 * establish", and that question has one answer. A flag would let an entry be
 * both PRESENT and partial, and CPDF-5's measured Tier-1-at-88% case is exactly
 * the reading that must NOT report as PRESENT.
 * ========================================================================= */

import { AI_RUN_CHECKS } from "../checks/bio-checks.mjs";

/* THE FOUR LEVELS a run searches, from CLAUDE.md's own standing section: when
   anything goes looking it "may need to search meaning, content, documents, AND
   the open internet, in any order". A log entry names which level it is about,
   because "sparse is the normal condition at every level" and an absence at one
   level is not evidence of absence at the next. */
export const OBSERVATION_LEVELS = {
  meaning:  "the framework layer: findings, legs, connections",
  content:  "extracted content within documents (DEC-23: content is the unit)",
  document: "documents the store holds",
  internet: "the open internet, through the capture path",
};

/* D-129's vocabulary. The value is what the state MEANS, in the words a refusal
   and a reader can both use; nothing derives behaviour from the key's spelling
   anywhere, so this object is the vocabulary and not a switch. */
export const OBSERVATION_STATES = {
  NEVER_LOOKED:         "nobody looked at this level for this subject",
  LOOKED_ABSENT:        "we looked and it is positively not there",
  LOOKED_INDETERMINATE: "we looked and could not tell",
  PRESENT:              "we looked and it is there",
  partial:              "we looked and got part of it (SWH's crawl status; CPDF-5's measured 88% case)",
};

/* THE STATES THAT ARE DEFINITIVE ABOUT THE WORLD. C-22.2 and C-22.3 both turn
   on this set rather than on a list of literals repeated at each site: a
   governed refusal and a client-rendered shell are both facts about OUR run,
   and neither licenses a definitive claim either way. Naming the set once means
   a sixth state added later inherits both refusals or fails loudly, instead of
   quietly escaping two checks that each hard-coded four names. */
export const DEFINITIVE_STATES = new Set(["LOOKED_ABSENT", "PRESENT"]);

/* §14b.6's bounds, in its own enumeration: "a budget — fetches requested,
   sub-sessions spawned, wall time across resumptions". `lease` is the fifth and
   it is OURS rather than the design's: it is the heartbeat whose lapse is how a
   killed run is noticed at all, and it is named as a bound because when it is
   what stopped a run, that is the true and only honest answer to "which bound".

   `runtime` is here and is NOT this item's producer. §14b.6 says the record
   already has the word and lacks the writer — `runtime-ceiling-reached` in
   `queuestate.mjs` with no producer — and names IS-9(d) as the item that builds
   it. IS-6 publishes the RECORD that names the bound; the queue-feed
   notification stays IS-9's, and nothing in this file or in store.mjs emits a
   queue item. */
export const RUN_BOUNDS = {
  fetches:     "fetches requested of the capture path",
  subsessions: "evidence sub-sessions spawned",
  wallclock:   "wall time across resumptions, in milliseconds",
  runtime:     "CPU or subrequest ceiling (D-54, D-56) — IS-9(d) builds its producer",
  lease:       "the run stopped heartbeating and its lease lapsed: it died rather than finished",
};

/* The conditions a run may end on that are NOT a bound being reached. Kept
   apart from RUN_BOUNDS because "the member asked for it to stop" and "the
   budget ran out" are different facts, and collapsing them would put this item
   on the wrong side of its own doctrine two lines after stating it.

   FL-7 (2026-08-10, IC-62) ADDED THE THIRD, AND THE SENTENCE DIRECTLY ABOVE IS
   WHAT DECIDED IT. `mode-not-deployed` is a THIRD such fact, and it arrived as a
   MEASURED misattribution rather than as a gap somebody noticed: FL-3's
   deployment gate (`agent-worker/src/harness.mjs`, `gate-mode`) closed a refused
   launch on `cancelled` — which this vocabulary defines two lines up as *"a
   member stopped it"*. **A member did not.** The gate refused a mode that is not
   deployed, before anything was spent and with nobody asking. So a run's own
   ending was attributing a MACHINE REFUSAL TO A MEMBER ACT, in the one field
   that says why the run stopped, which is CLAUDE.md's worst defect class — a
   record claiming more than it can support — arriving at the smallest possible
   scale and therefore the easiest to leave alone.

   WHY THE WORD WAS MINTED RATHER THAN REUSED, since this project's standing
   instruction points the other way and that deserves an answer at the site.
   §14b.6's rule, quoted in `harness.mjs`'s own header, is *"the record already
   has the word and lacks the writer — IS-9(d) builds that producer rather than
   minting a new kind"*. **That ruling is conditional on the word EXISTING, and
   it was measured here and did not:** at FL-7 `mode-not-deployed` appeared
   EXACTLY ONCE in the whole repository — inside the `harness.mjs` comment that
   promised a refused run terminates on it — and was in neither this object nor
   `RUN_BOUNDS`. Both existing endings are FALSE of a gate refusal. The spelling
   is kept as the one that comment already used, so that header became TRUE
   rather than both sides moving to a third name nobody had written yet.

   AND IT IS AN ENDING RATHER THAN A BOUND for the reason this object exists: no
   bound was reached. The gate fires BEFORE any bound is consulted — a run that
   was never allowed to start must not be able to report that it ran out of
   something — which `harness.test.mjs` A6 and `skillsequencing.test.mjs` ARM D4
   both measure.

   THE HEADER AND THIS CATALOGUE ARE HELD IN AGREEMENT IN BOTH DIRECTIONS by
   `agent-worker/test/harness.test.mjs` A6b, which reads THIS FILE and the
   harness source as text: every ending the header names must exist here, and the
   ending the gate actually closes on must be the one the header names. Either
   half drifting fails that arm, which is the thing that stops this recurring —
   the previous state was exactly one of those two halves being unasserted. */
export const RUN_ENDINGS = {
  completed:  "the run finished its work",
  cancelled:  "a member stopped it",
  "mode-not-deployed":
    "the deployment gate refused this launch before it spent anything: the mode it asked for "
  + "is not deployed yet, so no member stopped this run and no budget ran out",
};

export const RUN_STATUS = { running: 1, finished: 1, stopped: 1 };

/* REC-74 — HOW THE RUN'S BAR IS KNOWN, AND THE ABSENT CASE IS A MEMBER OF THIS
   VOCABULARY RATHER THAN A NULL.
 *
 * §11 names three conditions a run is formed under: the bias manifest in force,
 * the launching project's declared STANDARD PAIR, and the skill version.
 * `ai_runs.standard_pair` was WRITTEN by `aiRunOpen` and published by
 * `aiRunSpawnPayload` — and `aiRunRead` published it nowhere, so a member
 * reading the run object saw the skill version and the bias block and could not
 * see the bar the run was working to. PL-12 found the identical shape one field
 * over. A condition recorded and never published is not recorded for anybody
 * who was not there.
 *
 * WHY THE ANSWER IS A VOCABULARY AND NOT A BOOLEAN. Under DEC-17 the bar is a
 * property of a PROJECT, and *"an inquiry outside any project has no bar"* —
 * so the absent case is a first-class answer about the pair's semantics, not a
 * null, and `undetermined is first-class and must be STATED` (CLAUDE.md)
 * applies to this field exactly as it does to a grade. There is more than one
 * way for a run to have no bar and they are DIFFERENT FACTS:
 *
 *   - `context-has-no-project` — the run works on a question outside any
 *     project. DEC-17: nothing could have declared a bar, so no bar is not a
 *     shortfall and inheriting one from anywhere would INVENT it.
 *   - `none-recorded` — the run does run in a project and the launch recorded
 *     no bar. THE PLANE DOES NOT GO AND LOOK ONE UP: `aiRunOpen` stores what it
 *     was handed and derives nothing, so the honest sentence is about the
 *     RECORD OF THE FORMATION and never about the project's current state.
 *   - `names-no-axis` — something was recorded and it names neither axis. PL-4
 *     measured this class one field over: a value that survives a falsiness
 *     guard while naming nothing reads as PRESENT and travels. It is not a bar.
 *   - `unreadable` — a bar was recorded and cannot be parsed back. Stated,
 *     because "we stored something we can no longer read" and "there was
 *     nothing" are different facts and only one of them is a defect.
 *
 * Each value is the sentence a surface renders INSTEAD of the machine word, so
 * this vocabulary is DEC-49's shape and is guarded as one by arm E of
 * `civicos-ui/check-refusal-codes.mjs` — the same guard RUN_BOUNDS and
 * RUN_ENDINGS above already answer to. */
export const STANDARD_BASIS = {
  recorded:
    "this run was formed under a bar the launching project declared",
  "none-recorded":
    "no bar was recorded when this run was formed, and the plane does not fill one in afterwards",
  "context-has-no-project":
    "this run works on a question outside any project, and only a project declares a bar",
  "names-no-axis":
    "something was recorded as the bar for this run and it names neither axis, so there is no bar here",
  unreadable:
    "a bar was recorded for this run and cannot be read back",
};

/* REC-69 — WHAT A RUN CAN BE IN THE CONTEXT OF, and it is a vocabulary rather
   than a pair of strings at a call site.
 *
 * §14a: *"A background session runs in a CONTEXT and is associated with an
 * inquiry or a project. Any window focused on any of those objects shows an
 * animated indicator that a job is running."* Two kinds, named by the design,
 * and until REC-69 the plane held the word nowhere — `aiRunOpen` stores
 * `String(contextType)` verbatim and `ai_runs.context_type` is a bare TEXT
 * column, so the two names existed only in prose and in whatever a caller
 * happened to type.
 *
 * IT IS A TEXT VOCABULARY, in RUN_BOUNDS' shape, for DEC-49's reason and not
 * for symmetry: `op=airuns` REFUSES a context kind outside it (C-36.2), and a
 * refusal that names the kinds it does hold must name them in words a member
 * reads rather than in the machine word they typed wrongly. The values are
 * therefore the sentence, and `civicos-ui/check-refusal-codes.mjs` arm E holds
 * every one of them to that (it harvests this module BY SHAPE, so this landed
 * inside that guard the moment it was written).
 *
 * WHAT THIS DELIBERATELY DOES NOT DO, stated here rather than discovered:
 * **`aiRunOpen` is NOT fenced by it.** The write still accepts any string, so a
 * run CAN be opened on a context kind this read will refuse to ask about. That
 * asymmetry is REAL and is REC-69's own finding rather than an oversight — the
 * open is PL-5's site and its refusals are C-22's family, and widening a write's
 * refusal set from inside a read's item is how one item's blast radius becomes
 * another item's red suite. It is DELEGATED with the measurement. */
export const RUN_CONTEXTS = {
  inquiry: "a question the group is working on, which any project may draw on",
  project: "a body of work with its own members, its own bar and its own lens",
};

/* ------------------------------------------------------------------ refusals

   Each returns null when the subject is acceptable, or a REFUSAL object built
   from AI_RUN_CHECKS — the ONE place a C-number, a wire code and its canned
   translation live (DEC-49; the code-to-translation map read from one place
   rather than copied). `detail` is composed here because the useful sentence
   names the offending value, and a build-time table cannot.

   NULL-TOLERANT ON PURPOSE. Every read below tolerates an absent or wrongly
   typed field rather than throwing on `.length` of undefined: a control that
   dies early hides the arms behind it, and a refusal function that throws
   cannot NAME what it broke.

   ONE EXCEPTION TO THE NULL-OR-REFUSAL SHAPE, and it is named here rather than
   discovered: PL-18's `projectGate` returns a VERDICT OBJECT carrying its
   `refusal` (null or built) alongside the GROUND it decided on. It has to,
   because two of its four grounds PERMIT and both of those must still be
   stated on the answer — DEC-17's projectless case is a permission the record
   has to be able to explain, not an absence of refusal. Splitting it into a
   check and a separate statement-builder would put the sentence and the verdict
   in two places that can disagree. */

function refusal(key, detail) {
  const row = AI_RUN_CHECKS[key];
  return { ok: false, code: key, check: row.check, translation: row.translation, detail };
}

/** C-22.1 / C-22.2 / C-22.3 / C-22.6 — one observation log entry.
 *
 *  `conditionKinds` is passed IN rather than imported here, so the caller
 *  supplies the live vocabulary and this function cannot hold a stale copy of
 *  it. The store passes `queuestate.mjs`'s own object. */
export function checkObservation(entry, conditionKinds) {
  const e = entry && typeof entry === "object" ? entry : {};

  /* C-22.6 first, because it is about WHERE the entry is going and the others
     are about what it says. An entry that names a bundle is refused before its
     contents are judged at all. */
  if (e.bundle != null && String(e.bundle) !== "")
    return refusal("AI_LOG_NOT_A_BUNDLE",
      `this entry names bundle '${String(e.bundle)}'; the observation log is its own object `
      + `(INVESTIGATIVE-SESSION.md §11) and bundle.md is written only on success`);

  const state = typeof e.state === "string" ? e.state : "";
  if (!Object.prototype.hasOwnProperty.call(OBSERVATION_STATES, state))
    return refusal("AI_LOG_STATE_UNKNOWN",
      `'${state || "(absent)"}' is not one of ${Object.keys(OBSERVATION_STATES).join(", ")} (D-129)`);

  /* C-22.2 — D-104's split. `governed` is the fact that OUR pacing held us. */
  if (e.governed === true && DEFINITIVE_STATES.has(state))
    return refusal("AI_LOG_GOVERNED_ABSENCE",
      `a governed refusal cannot support '${state}': our governor holding a host is a fact about us, `
      + `not about the source (D-104). LOOKED_INDETERMINATE is the only state a governed observation carries`);

  const condition = typeof e.condition === "string" && e.condition ? e.condition : null;

  /* C-22.3 — the shell. Stated against the CONDITION rather than against a
     boolean of our own, so the fact travels in the record's existing vocabulary
     and a surface reading the entry needs no second word for it. */
  if (condition === "client-rendered-shell" && state === "PRESENT")
    return refusal("AI_LOG_SHELL_PRESENT",
      "a client-rendered shell capture is LOOKED_INDETERMINATE and never PRESENT (§11, D-64): "
      + "an evidentially empty capture that reads as coverage is the false-coverage hazard");

  /* C-22.4 on the entry's own condition, and it DELEGATES rather than restating
     the check — an untranslatable word on a log line is as unreadable as one on
     the run, so it is the same rule and must be the same code.
     CORRECTED 2026-08-07 BY THIS ITEM'S OWN NEGATIVE CONTROL, and the finding is
     worth carrying: this was a SECOND COPY of the vocabulary test, and removing
     `checkCondition` entirely left the suite GREEN at 98/98 because this copy
     absorbed the control. A rule with two implementations is a rule whose
     control proves nothing about either — C-5's "a second copy of a rule is a
     second place for it to drift", measured here rather than argued. One
     function now, reached through two doors. */
  const badCondition = checkCondition(condition, conditionKinds);
  if (badCondition) return badCondition;

  return null;
}

/** C-22.4 — a condition, checked against the LIVE vocabulary. THE ONLY
 *  implementation of that rule in this file; `checkObservation` calls it. */
export function checkCondition(condition, conditionKinds) {
  if (condition == null || condition === "") return null;   // no condition is a supported state
  if (!Object.prototype.hasOwnProperty.call(conditionKinds || {}, String(condition)))
    return refusal("AI_RUN_CONDITION_UNKNOWN",
      `'${String(condition)}' is not in the record's condition vocabulary (queuestate.mjs)`);
  return null;
}

/** C-22.5 — THE ITEM'S OWN REFUSAL. A run may not leave `running` without
 *  naming what stopped it. Both vocabularies are legal: a bound that was
 *  reached, or one of the two endings that are not bounds. Anything else, and
 *  anything absent, is refused. */
export function checkBound(bound) {
  const b = bound == null ? "" : String(bound);
  if (Object.prototype.hasOwnProperty.call(RUN_BOUNDS, b)) return null;
  if (Object.prototype.hasOwnProperty.call(RUN_ENDINGS, b)) return null;
  return refusal("AI_RUN_BOUND_UNNAMED",
    `'${b || "(absent)"}' names no bound and no ending. Bounds: ${Object.keys(RUN_BOUNDS).join(", ")}; `
    + `endings: ${Object.keys(RUN_ENDINGS).join(", ")} (§14b.6)`);
}

/* ------------------------------------------------- DEC-63's gate (PL-18)

   THE THREE GROUNDS ON WHICH THE PROJECT GATE CAN PERMIT, as a CLOSED
   VOCABULARY rather than three booleans a reader has to combine. **All three
   PERMIT, and every one of them is STATED on the answer** — which is the half
   that is easy to skip and is the reason this vocabulary exists at all. DEC-17
   makes the projectless case real rather than an edge case, and a permission
   granted silently is indistinguishable from a gate that never ran. That is the
   overclaim shape this project refuses everywhere else: the record must be able
   to say WHY a run was allowed to start, not merely that it started.
   THE REFUSING OUTCOME IS NOT HERE. It is named by its code, C-22.8, and giving
   it a ground as well would be two names for one fact — see the note under this
   object. */
export const PROJECT_GATE_GROUNDS = {
  /* No member is behind this caller at all — a machine credential. The gate is
     NOT APPLIED, and the reason is that it CANNOT be: participation is a
     relationship between a PERSON and a project, and a token class is not a
     person. This keeps the gate's population identical to the capability
     FLOOR's, which `index.mjs` already applies only `if (viaSession)` — a fence
     wider than the floor beneath it would be an undeclared interface change
     wearing the costume of caution, and it would refuse the daemon outright.
     DEC-63 names the lever for this half explicitly and it is a different one:
     *"any narrowing happens at the credential layer"* — IS-5's `ai` credential
     scope, which can only narrow what a machine may reach. */
  NO_MEMBER_BEHIND_CALLER: "the caller is a machine credential, so there is no participation to check",
  /* DEC-17, VERBATIM: *"An inquiry outside any project has no bar and inherits
     none."* So an inquiry in no project is PERMITTED and the permission is
     STATED. Deciding it the other way would invent a constraint the model does
     not carry — and answering it with a silent allow would be the same defect
     one layer down, because nobody reading the answer could tell a projectless
     inquiry from a gate that failed to run. */
  PROJECTLESS: "this question is in no project, and DEC-17 puts no bar on one that is not",
  PARTICIPANT: "the account participates in at least one project this question belongs to",
};
/* THERE IS NO `NOT_PARTICIPANT` GROUND, AND ITS ABSENCE IS A CORRECTION THIS
   ITEM'S OWN GUARD RUN FORCED RATHER THAN AN OMISSION. The first draft had one,
   and it was a SECOND NAME for a fact that already has a canonical one: the
   refusal's C-22.8 code. `civicos-ui/check-refusal-codes.mjs` failed the
   harness on the shape that produced it — a refusing return whose code arrived
   through a spread rather than as a literal at the site — and the fix that
   satisfies the guard is the same fix that removes the duplicate name: the
   refusing path returns THE REFUSAL ITSELF, built by `refusal()` with the code
   spelled out, exactly as `checkObservation`, `checkCondition` and `checkBound`
   do three functions up. **A refusal is named by its code; a permission is
   named by its ground.** Two vocabularies for two different things, and neither
   one restating the other. */

/** DEC-63 / PL-18 — MAY THIS ACCOUNT ASK THE SYSTEM TO LOOK AT THIS CONTEXT?
 *
 *  PURE, like everything else in this file: the STORE supplies the facts (which
 *  projects hold the context, and which of those the account has JOINED) and
 *  this function makes the decision and builds the refusal. One decision for
 *  all three run verbs, so `airunopen`, `airuntick` and `airunclose` cannot
 *  drift apart — which is the failure mode IS-6's own header warned about when
 *  it gave the three verbs one capability rather than gating only the open.
 *
 *  IT RETURNS BOTH THE VERDICT AND THE SENTENCE FROM ONE COMPUTATION. There is
 *  deliberately no second function computing the stated ground, because a
 *  statement derived separately from the decision it describes is a statement
 *  that can disagree with it — this repository has measured that class five
 *  times as "a hand copy agrees at zero cost".
 *
 *  `permitted` IS THE VERDICT AND IT LEADS EVERY RETURN, and that is a
 *  CORRECTION THIS ITEM'S OWN GUARD RUN FORCED rather than a shape chosen up
 *  front. The first draft led with `applied`, which is not a verdict at all —
 *  it says whether the gate had anything to check — so the two PERMITTING
 *  grounds returned `applied: false` and `civicos-ui/check-refusal-codes.mjs`
 *  read both of them as CODELESS REFUSALS and failed the harness. It was right
 *  to: a reader who cannot tell *this gate did not apply* from *this gate
 *  refused* by looking at the verdict is the member-facing version of the same
 *  confusion. `permitted` is a literal `true` on all three permitting paths and
 *  a literal `false` on the one refusal, so the guard grades this function
 *  correctly and so does a person. `applied` survives beside it as the FACT it
 *  always was, which is what DEC-17's projectless case needs stated.
 *
 *  JOINED, NOT MERELY INVITED. `projectsJoined` is the store's `joined` set and
 *  the choice is `forkProject`'s, one door over: an invited member sees the
 *  project's SKELETON only, so there is nothing there for them to investigate.
 *  A `leaving` participant is likewise not counted — 7.6 makes that a REQUEST
 *  rather than a removal, but it is the member's own statement that they are
 *  done with this work, and starting new work on the strength of it would be
 *  the record acting against what the member said.
 *
 *  NO ADMINISTRATOR BYPASS, and it is deliberate rather than an oversight.
 *  Membership Architecture v2 4.9 is that an administrator SEES every project
 *  and DIRECTS none of them; the admin bypasses that exist (7.2, 7.7) are over
 *  PARTICIPATION ITSELF, which is custodial. Starting an investigation is WORK,
 *  and DEC-63's words are *"any member of a project"* — an administrator who is
 *  not in the project is not one. They have a remedy the refusal names: join.
 *
 *  `contextLabel` is what the CALLER named, and it is the only identifier the
 *  detail sentence carries. The projects are NOT named to a non-participant:
 *  7.12's skeleton rule means the existence of a project can itself be
 *  something an outsider is not entitled to, and a refusal that leaks the
 *  roster of projects touching a question would be this gate defeating the
 *  visibility rule it sits beside. */
export function projectGate({ actor = null, contextType = null, contextId = null,
                              projects = [], projectsJoined = [] } = {}) {
  const who = actor == null ? "" : String(actor).trim();
  const all = Array.isArray(projects) ? projects.map(String) : [];
  const mine = Array.isArray(projectsJoined) ? projectsJoined.map(String) : [];
  const label = `${contextType == null ? "" : String(contextType)} ${contextId == null ? "" : String(contextId)}`.trim()
                || "the named context";

  if (!who)
    return { permitted: true, applied: false, ground: "NO_MEMBER_BEHIND_CALLER",
             why: PROJECT_GATE_GROUNDS.NO_MEMBER_BEHIND_CALLER, projects: all.length };
  if (all.length === 0)
    return { permitted: true, applied: false, ground: "PROJECTLESS",
             why: PROJECT_GATE_GROUNDS.PROJECTLESS, projects: 0 };
  if (mine.length > 0)
    return { permitted: true, applied: true, ground: "PARTICIPANT",
             why: PROJECT_GATE_GROUNDS.PARTICIPANT, projects: all.length };

  /* THE REFUSAL ITSELF IS THE RETURN — not an object carrying one — and that is
     what puts the code where DEC-49 requires it. `refusal()` is the family's
     one builder and the code is a STRING LITERAL at this site, so the guard in
     `civicos-ui/check-refusal-codes.mjs` can see it; a code held in a variable
     or arriving through a spread is invisible to it, and one shipped
     `translation: undefined` to a member exactly that way. THIS IS THE ONE
     PLACE THE CODE IS WRITTEN: the three store call sites RELAY what comes
     back, precisely as `aiRunOpen` already relays C-22.7 from `skillpack.mjs`.
     The answer carries `ok: false` and no `permitted`, so a caller's
     `if (!gate.permitted)` reads it correctly — and there is no second field
     that could disagree with the code about whether this was a refusal. */
  return refusal("AI_RUN_NOT_PROJECT_MEMBER",
    `starting or continuing a run over ${label} is work inside the project it belongs to, `
    + `and this account has joined none of them (DEC-63). This is not a capability: holding `
    + `contribute would not change it, and an owner of that project inviting you would`);
}

/** WHICH BOUND STOPPED THIS RUN — the pure decision, so the ordinary close and
 *  the reaper compute it through ONE function instead of two that agree.
 *
 *  A hand-written second copy in the reaper is the failure this repository has
 *  measured repeatedly: a parallel path that never touches the set the real
 *  path uses, agreeing at zero cost. The reaper therefore does not decide
 *  anything; it supplies rows and a clock and takes this answer.
 *
 *  `bounds` is the run's live budget rows: { bound, allowed, consumed }.
 *  An EXHAUSTED bound wins over the lease, because a run whose fetch budget ran
 *  out and then stopped heartbeating was stopped by the budget — reporting the
 *  lease there would name the symptom and hide the cause. Ties are broken by
 *  RUN_BOUNDS' declaration order so the answer is deterministic and a suite can
 *  pin it. */
export function finishedBound(bounds, { expired = false, offered = null } = {}) {
  if (offered != null && offered !== "") return String(offered);
  const rows = Array.isArray(bounds) ? bounds : [];
  const order = Object.keys(RUN_BOUNDS);
  const hit = rows
    .filter((r) => r && Number(r.allowed) > 0 && Number(r.consumed) >= Number(r.allowed))
    .sort((a, b) => order.indexOf(String(a.bound)) - order.indexOf(String(b.bound)))[0];
  if (hit) return String(hit.bound);
  if (expired) return "lease";
  return "completed";
}

/** The DEC-49 translation for a code, read from the one map. Exported so a
 *  surface (and the suite that stands in for one) resolves a code it RECEIVED
 *  rather than computing a refusal — DEC-8 as amended, whose protection is that
 *  the code must be received and never inferred. */
export function translationOf(code) {
  const row = AI_RUN_CHECKS[String(code)];
  return row ? row.translation : null;
}

export { AI_RUN_CHECKS };
