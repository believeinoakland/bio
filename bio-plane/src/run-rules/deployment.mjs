import { isMachineIdentity } from "../record-grammar/actors.mjs";
import { AI_RUN_OWN_CHECKS } from "./checks.mjs";

/* R9 (was ai-runs R44; K102, K182 (3), N156) and R14 (K660 (5)): THE ONE DEPLOYMENT ORDER, held here because `skills`
 * (whose `skilldoctrine.mjs` wrote it first, SK-4) and `agent-worker` (whose `MODES` is pinned to it) both come after
 * this module, and `ai-runs`' open refuses a mode not deployed by reading it (its R40). Copied from
 * `ai-runs/deployment.mjs` at the ai-runs split (K617, K624 (1)); `skills` and `agent-worker` re-export it from here
 * and hold no copy. */

/** WHERE THE GATE ACTUALLY LIVES. An address, dereferenced by
 *  `test/m/run-rules/deployment.test.mjs` R9 (the file exists) — never an import,
 *  never a copy, and never a flag this file holds. T34-32 (N586; K1603, K1615): the control-flow tables and their pure
 *  rules moved from `agent-worker/src/harness.mjs` to `agent-harness` (T33-54, its R1–R8), which `agent-worker` runs;
 *  the address names the file that holds them, not `agent-worker`'s re-export, which goes once no importer names it. */
export const GATE_ADDRESS = {
  file: "agent-harness/src/harness.mjs",
  owned_by: "FL-3 (IS-9, the run harness) — held by agent-harness and run by agent-worker, both outside this area's paths",
  modes_export: "MODES",
  table_export: "CONTROL_FLOW",
  row: "gate-mode",
  first_step_export: "FIRST_STEP",
  decision_function: "nextStep",
  why_it_is_first:
    "a run in a mode that is not deployed terminates before it has spent anything, so the gate "
    + "cannot be reached around by exhausting something else first",
};

/** Where §2's ruling was written, and where the sweep restates it. Both were
 *  looked up when this record was written (SK-4); neither is quoted from memory. */
export const SEQUENCING_SOURCE = "docs/development/INVESTIGATIVE-SESSION.md";
export const SEQUENCING_ALSO_NAMED_IN = "docs/archive/IS-SWEEP-2026-08-07.md";

/** SK-4's ONE DOCTRINE ITEM. It records an ORDER and cites a gate; it decides
 *  nothing and refuses nothing.
 *
 *  `order` IS THE DELIVERABLE. Everything else on this object is either a span
 *  of a document (checked by lookup) or an address (checked by dereference), so
 *  the only thing here a reader has to take on trust is the order itself — and
 *  `agent-worker/test/requirements.test.mjs` (its R44, R53) pins that to the
 *  landed table, `MODES`' keys equal to `order` and its deployed modes equal to
 *  `DEPLOYED_MODES`, so a mode added, dropped or enabled moves it. */
export const DEPLOYMENT_SEQUENCE = {
  id: "check-deploys-first",

  /* THE SEQUENCING, AND THE POSITION IN THIS ARRAY IS THE CLAIM: index 0 is the
     mode that deploys first, and every later index is a mode that enables only
     after the one before it has been verified live. */
  /* `extract` APPENDED 2026-09-14 by FLEET on SK-8's delegation, IN THE SAME
     COMMIT as the row entered `agent-worker/src/harness.mjs`'s `MODES` — which
     was ARM B3's whole demand (the two rosters are ONE set, held in both
     directions) and ARM B4's (index 0 stays the only deployed mode; every later
     index, `extract` included, is not), arms of `skillsequencing.test.mjs`,
     deleted in T20; `agent-worker`'s R44, R53 test holds both today. The pack's
     digest moves with this line by construction and nothing needs bumping by hand. */
  /* `plan` APPENDED (K660 (5), BIO_Action_v0_1.md §4 rule 1): the planning run, which proposes options for an
     action plan from what the record already holds. It is last in the order and it does NOT wait on the chain above
     it: `investigate` or `extract` being deployed or not changes nothing for it. AMENDED for T33 (R14; Q0-5, §7 item
     10): it is deployed ONLY by its own flag, `deploys_apart.plan.deployed`, set by an explicit reviewed change of its
     own that sets `agent-worker`'s `MODES.plan` with it (its R42, R53) — never as a side effect of model turns running. */
  order: ["check", "investigate", "extract", "plan"],
  first_deployed_mode: "check",

  /* §2, VERBATIM. Looked up in the design document through SK-1's normaliser
     when written (SK-4), because a session cannot verify its own copying by
     re-reading it. */
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
     the one both surfaces carry. (`skillsequencing.test.mjs`, deleted in T20,
     looked both up; no module test reads the documents today.) */
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
     SENTENCE IN A COMMENT — so a test can assert it and so a later session
     cannot leave it stale by editing prose around it. `null` is not "unknown":
     it is "no live run has been verified"; `test/m/run-rules/deployment.test.mjs`
     R9 asserts it, and `agent-worker`'s R44, R53 test holds the landed flags to
     `DEPLOYED_MODES`, which it decides. */
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
      when: "only by an explicit reviewed change of its own, which sets this flag and agent-worker's MODES.plan "
        + "together; never as a side effect of model turns running, and whether or not investigate or extract is deployed",
    },
  },

  /* R40 (K102, K182): THE RECORD'S EDGE NOW REFUSES TOO. Until ai-runs' extraction nothing in the check catalogue
     refused a mode, and this said so; `op=airunopen` now refuses a mode not in `DEPLOYED_MODES` below with C-109.1, so
     no run, and no production under a run, exists in a mode not deployed. `enforced_by_row` stays: the fleet member's
     first row still refuses first inside the harness (agent-worker R14), and the two are tallied apart. */
  enforced_by: ["C-109.1"],
  enforced_by_row: `${GATE_ADDRESS.file}:${GATE_ADDRESS.table_export}["${GATE_ADDRESS.row}"]`,

  /* REQUIRED, AND MEASURED: each clause was measured against the landed sources
     when written, rather than believed. */
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

/** R16 (Q1-2; K1450; T33-49): THE MODE `ask` — one member's question answered inside that member's own act. It is NO
 *  RUN: it writes no run row (K1450), so it is not in `DEPLOYMENT_SEQUENCE.order`, takes no part in the chain's
 *  verification, and is deployed only by its own flag here, `deployed`, set by a reviewed change of its own whatever
 *  the run modes' state. Its reach is `answers`' `ASK_SCOPE` (that module's R1) and nothing else: no write op of any
 *  module. The flag lives on this object and not inside `DEPLOYMENT_SEQUENCE`, whose only flags are its own order's
 *  modes' (`deploys_apart`). Frozen. */
export const ASK_MODE = Object.freeze({
  mode: "ask",
  read_only: true,
  reach: "answers' ASK_SCOPE (its R1), the whole of an ask's reach; no write op of any module",
  interactive: true,
  writes_run_row: false,
  why: "it answers one member's question inside that member's act and is no run: it writes no run row and no "
    + "observation, and keeps nothing but the member's own device-local transcript (K1450)",
  deploys_apart: true,
  deployed: false,
  when: "only by a reviewed change of its own that sets this flag, whatever the run modes' state",
  bounds: "ASK_BOUNDS (R17), declared when the ask starts",
});

/** The modes a RUN may be in: the order's, and nothing else. `ask` is deployed through DEPLOYED_MODES (R16) but is no
 *  run, so an open that must refuse a run in a mode that is not a run's reads this list beside DEPLOYED_MODES. */
export const RUN_MODES = Object.freeze([...DEPLOYMENT_SEQUENCE.order]);

/** R9, R14, R16 (ai-runs R40 reads it): THE MODES DEPLOYED NOW. The chain's first member deploys first; each later member of
 *  the chain enables only once the one before it has been verified live, recorded in `verification_recorded`. With
 *  nothing recorded, only the first. A mode that deploys apart (`deploys_apart`) is not in the chain and is deployed
 *  exactly when its own flag is true; so is `ask` (R16), which is no run and in no order. */
const CHAIN = DEPLOYMENT_SEQUENCE.order.filter((m) => !Object.prototype.hasOwnProperty.call(DEPLOYMENT_SEQUENCE.deploys_apart, m));
export const DEPLOYED_MODES = Object.freeze([
  ...CHAIN.slice(0, DEPLOYMENT_SEQUENCE.verification_recorded == null ? 1 : 2),
  ...DEPLOYMENT_SEQUENCE.order.filter((m) => DEPLOYMENT_SEQUENCE.deploys_apart[m]?.deployed === true),
  ...(ASK_MODE.deployed === true ? [ASK_MODE.mode] : []),
]);

/** The mode a run that names none opens in (K182 (4c)): the first deployed, recorded on the run. */
export const DEFAULT_MODE = DEPLOYED_MODES[0];

/* R19 (Q0-5; VF-4; T33-49) — THE ACT THAT RECORDS A MODE'S FIRST LIVE RUN VERIFIED, and the one judgement of whether a
   mode may be deployed. This module holds nothing: `ai-runs` writes the act where runs are (K1521 (2)) and hands the
   acts it holds to `deployable`, so the chain that enables `investigate` is the RECORD's, never a parameter a caller
   sets. `enabling_condition` above says what the verification is; this is its shape. */
export const VERIFICATION_RECORDED = Object.freeze({
  act: "verification_recorded",
  fields: Object.freeze(["mode", "run", "verified_by", "at", "evidence"]),
  means: Object.freeze({
    mode: "the mode of the deployment order whose first live run was verified",
    run: "the run that was verified",
    verified_by: "the member who verified it; never a machine",
    at: "when it was verified",
    evidence: "what the member saw, in their words or as references to it",
  }),
});

const blank = (v) => v == null || (typeof v === "string" && v.trim() === "")
  || (Array.isArray(v) && !v.some((x) => !blank(x)));

function unfit(field, detail) {
  const row = AI_RUN_OWN_CHECKS.AI_RUN_VERIFICATION_UNFIT;
  return { ok: false, code: "AI_RUN_VERIFICATION_UNFIT", check: row.check, translation: row.translation,
           detail: `${detail}. Nothing was recorded`, field };
}

/** R19 — IS THIS A WELL-FORMED `verification_recorded`? Null when it is; else `AI_RUN_VERIFICATION_UNFIT` (C-22.20)
 *  naming the first unfit field: a value that is not an object; a mode outside `DEPLOYMENT_SEQUENCE.order`; no run; no
 *  `verified_by`, or a machine identity (record-grammar's `isMachineIdentity`: a machine cannot verify its own kind of
 *  work); no evidence (absent, blank, or a list of nothing but blanks). Pure; never throws. */
export function checkVerification(v) {
  if (!v || typeof v !== "object" || Array.isArray(v))
    return unfit(null, "a verification is a record of { mode, run, verified_by, at, evidence }");
  const mode = typeof v.mode === "string" ? v.mode : "";
  if (!DEPLOYMENT_SEQUENCE.order.includes(mode))
    return unfit("mode", `${JSON.stringify(String(v.mode ?? "").slice(0, 40))} is not a mode of the deployment order `
      + `(${DEPLOYMENT_SEQUENCE.order.join(", ")})`);
  if (blank(v.run) || typeof v.run !== "string") return unfit("run", "it names no run that was verified");
  if (blank(v.verified_by) || typeof v.verified_by !== "string")
    return unfit("verified_by", "it names nobody who verified the run");
  if (isMachineIdentity(v.verified_by))
    return unfit("verified_by", "it names a machine as the verifier, and only a member verifies a mode's first live run");
  if (blank(v.evidence) || (typeof v.evidence !== "string" && !Array.isArray(v.evidence)))
    return unfit("evidence", "it carries no evidence of what the verifier saw");
  return null;
}

/** R19 — MAY `mode` BE DEPLOYED, ON THE VERIFICATIONS THE RECORD HOLDS? The order's chain (its modes less those that
 *  deploy apart): its first member always; each later one only when a well-formed `verification_recorded`
 *  (`checkVerification`) is held for EVERY chain mode before it — `investigate` only after `check`'s, `extract` only
 *  after both. A mode that deploys apart (`plan`, R14; `ask`, R16) is never decided by the chain: its own reviewed flag
 *  alone deploys it, so this answers true for it. Any other word is false. Pure; never throws. */
export function deployable(mode, verifications) {
  const m = typeof mode === "string" ? mode : "";
  if (m === ASK_MODE.mode || Object.prototype.hasOwnProperty.call(DEPLOYMENT_SEQUENCE.deploys_apart, m)) return true;
  const at = CHAIN.indexOf(m);
  if (at < 0) return false;
  const held = new Set((Array.isArray(verifications) ? verifications : [])
    .filter((v) => checkVerification(v) === null).map((v) => v.mode));
  return CHAIN.slice(0, at).every((before) => held.has(before));
}
