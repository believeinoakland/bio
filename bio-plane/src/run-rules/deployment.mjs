/* R9 (was ai-runs R44; K102, K182 (3), N156) and R14 (K660 (5)): THE ONE DEPLOYMENT ORDER, held here because `skills`
 * (whose `skilldoctrine.mjs` wrote it first, SK-4) and `agent-worker` (whose `MODES` is pinned to it) both come after
 * this module, and `ai-runs`' open refuses a mode not deployed by reading it (its R40). Copied from
 * `ai-runs/deployment.mjs` at the ai-runs split (K617, K624 (1)); `skills` and `agent-worker` re-export it from here
 * and hold no copy. */

/** WHERE THE GATE ACTUALLY LIVES. An address, dereferenced by the suite — never
 *  an import, never a copy, and never a flag this file holds. */
export const GATE_ADDRESS = {
  file: "agent-worker/src/harness.mjs",
  owned_by: "FL-3 (IS-9, the run harness) — landed, and outside this area's paths",
  modes_export: "MODES",
  table_export: "CONTROL_FLOW",
  row: "gate-mode",
  first_step_export: "FIRST_STEP",
  decision_function: "nextStep",
  why_it_is_first:
    "a run in a mode that is not deployed terminates before it has spent anything, so the gate "
    + "cannot be reached around by exhausting something else first",
};

/** Where §2's ruling was written, and where the sweep restates it. Both are
 *  looked up by the suite; neither is quoted from memory. */
export const SEQUENCING_SOURCE = "docs/development/INVESTIGATIVE-SESSION.md";
export const SEQUENCING_ALSO_NAMED_IN = "docs/archive/IS-SWEEP-2026-08-07.md";

/** SK-4's ONE DOCTRINE ITEM. It records an ORDER and cites a gate; it decides
 *  nothing and refuses nothing.
 *
 *  `order` IS THE DELIVERABLE. Everything else on this object is either a span
 *  of a document (checked by lookup) or an address (checked by dereference), so
 *  the only thing here a reader has to take on trust is the order itself — and
 *  the suite pins that to the landed table in BOTH directions, so a mode added,
 *  dropped or enabled moves it. */
export const DEPLOYMENT_SEQUENCE = {
  id: "check-deploys-first",

  /* THE SEQUENCING, AND THE POSITION IN THIS ARRAY IS THE CLAIM: index 0 is the
     mode that deploys first, and every later index is a mode that enables only
     after the one before it has been verified live. */
  /* `extract` APPENDED 2026-09-14 by FLEET on SK-8's delegation, IN THE SAME
     COMMIT as the row entered `agent-worker/src/harness.mjs`'s `MODES` — which
     is ARM B3's whole demand (the two rosters are ONE set, held in both
     directions) and ARM B4's (index 0 stays the only deployed mode; every later
     index, `extract` included, is not). The pack's digest moves with this line
     by construction and nothing needs bumping by hand. */
  /* `plan` APPENDED (K660 (5), BIO_Action_v0_1.md §4 rule 1): the planning run, which proposes options for an
     action plan from what the record already holds. It is last in the order and it does NOT wait on the chain above
     it: it deploys as soon as `agent-worker` runs model turns (its R40 and R48 met), whether or not `investigate` or
     `extract` is deployed, by the reviewed change that meets those Rs setting `deploys_apart.plan.deployed` here and
     `agent-worker`'s `MODES.plan` together (its R42, R53). No separate act. */
  order: ["check", "investigate", "extract", "plan"],
  first_deployed_mode: "check",

  /* §2, VERBATIM. Looked up in the design document through SK-1's normaliser,
     because a session cannot verify its own copying by re-reading it. */
  text: "CHECK IS THE FIRST DEPLOYED MODE",
  role:
    "this session, run with this objective against an EXISTING conclusion, IS DEC-24's CHECK role "
    + "— the record read adversarially, by the machine aimed at self-directed overclaiming, the "
    + "threat model the doctrine names",
  because:
    "also the safest first deployment, because a run over a concluded inquiry has the smallest "
    + "authorisation surface and the clearest ground truth to be measured against",
  satisfies:
    "Deploying that mode first satisfies the enacted instruction without a second architecture",
  source: SEQUENCING_SOURCE,

  /* AND PINNED A SECOND TIME, TO A DOCUMENT THAT PHRASES IT DIFFERENTLY. SK-3's
     standard: one pin proves the sentence was copied; two prove the RULING is
     the one both surfaces carry, so a sequencing quietly reversed on either
     fails here rather than in a review nobody re-runs. */
  also_named_in:
    "DEC-55's enacted CHECK-first instruction and DEC-60 are satisfied by one build: the session "
    + "run with §2's objective against an existing conclusion IS the CHECK role; deploy that mode "
    + "first. No second architecture.",
  also_named_in_source: SEQUENCING_ALSO_NAMED_IN,

  /* WHAT MUST HAPPEN BEFORE THE SECOND MODE ENABLES, AND WHO OWNS IT. Neither
     half is this area's, and saying so is the point rather than a disclaimer. */
  enabling_condition:
    "CHECK's FIRST LIVE RUN, verified in the instance's own scratch namespace against a CONCLUDED "
    + "inquiry, swept after, with `op=audit` clean.",
  enabling_condition_owned_by: "VF-4, which waits on DS-4 (DIST's gated deploy)",

  /* THE HONEST STATE OF THAT CONDITION AT THIS COMMIT, AS DATA RATHER THAN AS A
     SENTENCE IN A COMMENT — so the suite can assert it and so a later session
     cannot leave it stale by editing prose around it. `null` is not "unknown":
     it is "no live run has been verified", and the suite holds it against the
     landed flag, which is still `false`. */
  verification_recorded: null,

  /* HOW THE SECOND MODE ACTUALLY ENABLES, and it is deliberately not a switch. */
  enables_how:
    "by an EDIT to the landed table under review — `MODES.investigate.deployed`. A mode that could "
    + "be enabled by a request parameter would be a gate the caller holds, which is no gate at all.",

  gate: GATE_ADDRESS,

  /* R14: THE MODES THAT DEPLOY APART FROM THE CHAIN, each with its own flag and the condition that sets it. A mode here
     takes no part in the chain's verification: `DEPLOYED_MODES` below reads the chain from `order` without it, and
     adds it only when its flag is true. `false` until the change that meets its condition flips it under review. */
  deploys_apart: {
    plan: {
      deployed: false,
      when: "as soon as agent-worker runs model turns (its R40 and R48), whether or not investigate or extract is "
        + "deployed; the reviewed change that meets those sets this flag and agent-worker's MODES.plan together",
    },
  },

  /* R40 (K102, K182): THE RECORD'S EDGE NOW REFUSES TOO. Until ai-runs' extraction nothing in the check catalogue
     refused a mode, and this said so; `op=airunopen` now refuses a mode not in `DEPLOYED_MODES` below with C-109.1, so
     no run, and no production under a run, exists in a mode not deployed. `enforced_by_row` stays: the fleet member's
     first row still refuses first inside the harness (agent-worker R14), and the two are tallied apart. */
  enforced_by: ["C-109.1"],
  enforced_by_row: `${GATE_ADDRESS.file}:${GATE_ADDRESS.table_export}["${GATE_ADDRESS.row}"]`,

  /* REQUIRED, AND MEASURED. Every clause is re-measured by the suite against the
     landed sources rather than believed. */
  does_not_reach:
    "a DEPLOYMENT. The gate refuses a RUN whose mode is not deployed; nothing refuses shipping a "
    + "build with the flag already flipped, and no instrument reads a release note. The plane's "
    + "open refuses a mode not deployed (C-109.1, ai-runs R40), so the RECORD holds no run in one; "
    + "what neither gate reaches is a run's own work outside the plane's ops. And it cannot verify its own enabling condition: `deployed: "
    + "true` is an edit, and the REVIEW of that edit — not this text and not that flag — is what "
    + "holds CHECK's live verification in front of it.",

  /* THE ONE SENTENCE THIS RECORD EXISTS TO MAKE UNAMBIGUOUS. */
  holds_no_gate:
    "This record is INSTRUCTION about an order. It refuses nothing. A model ignoring every word of "
    + "it gets past nothing, because the row at `gate-mode` runs before anything it could ignore.",
};

/** R9, R14 (ai-runs R40 reads it): THE MODES DEPLOYED NOW. The chain's first member deploys first; each later member of
 *  the chain enables only once the one before it has been verified live, recorded in `verification_recorded`. With
 *  nothing recorded, only the first. A mode that deploys apart (`deploys_apart`) is not in the chain and is deployed
 *  exactly when its own flag is true. */
const CHAIN = DEPLOYMENT_SEQUENCE.order.filter((m) => !Object.prototype.hasOwnProperty.call(DEPLOYMENT_SEQUENCE.deploys_apart, m));
export const DEPLOYED_MODES = Object.freeze([
  ...CHAIN.slice(0, DEPLOYMENT_SEQUENCE.verification_recorded == null ? 1 : 2),
  ...DEPLOYMENT_SEQUENCE.order.filter((m) => DEPLOYMENT_SEQUENCE.deploys_apart[m]?.deployed === true),
]);

/** The mode a run that names none opens in (K182 (4c)): the first deployed, recorded on the run. */
export const DEFAULT_MODE = DEPLOYED_MODES[0];
