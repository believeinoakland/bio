/* REC-19: the act catalogue behind op=affordances — what may be DONE to an
 * object, published by the plane (D-139, standing doctrine DEC-8).
 *
 * DEC-8, restated because every act surface builds on this file: the act
 * pre-flight is PLANE-SOURCED always. A surface may render a refusal it
 * received and may never compute one. Publication (op=affordances) is the
 * default; a dry-run op (op=publishpreflight) is DEFERRED with REC-15 for the
 * one act — publication — whose refusal turns on state a surface cannot see.
 * No act surface exists before this op, so what this file publishes is the
 * whole of what a surface may know about "what can I do here".
 *
 * WHAT IS DERIVED AND FROM WHERE. An act appears for a target if and only if
 * the plane's own data says the act's op would accept that object as it stands:
 *
 *   - the STATE MACHINE comes from the catalogue's exported STATES table,
 *     imported and never copied (the op=dispose hazard, not repeated);
 *   - the LIVE-CITES facts come from the store's own #citesInto predicate —
 *     the SAME one retire's CITED guard runs, extracted so the publication and
 *     the refusal cannot disagree (an equality that costs nothing is not
 *     evidence; a shared predicate costs the truth);
 *   - `needs` and `mode` are composed at the control plane from NEEDS and
 *     SESSION_OPS, the tables that actually gate the call;
 *   - `weight` is the set-application weight each store action hard-codes
 *     (store.mjs selectionResolve doctrine): declared here and CROSS-CHECKED by
 *     the suite against the weight the acting op itself reports.
 *
 * WHAT IS DECLARED, NOT DERIVED. `rung` is the interaction-constructs weight
 * ladder (reversible / reasoned / terminal / attested). CAPABILITIES.md
 * measures 7 of 57 mutating ops with a rung assigned by any document; RUNGS
 * below carries exactly those seven with their sources, and EVERY other op
 * publishes rung: null — stated honestly rather than guessed, because
 * inventing the other 50 here would be the forbidden surface-side map moved
 * one layer down. FW-14 assigns them.
 *
 * TOTALITY, AND THE DRIFT GUARD. Every op in index.mjs's NEEDS table is either
 * an ACT here or named in NON_ACTS with the reason it is not object-directed.
 * The affordances suite parses NEEDS out of the source and fails NAMING the op
 * if one is in neither set, so an op added to NEEDS cannot ship unpublished and
 * unexplained — that is the item's negative control, and it is structural.
 *
 * SCOPE. The acts published are the OBJECT-DIRECTED ones: the ops whose subject
 * is a bundle in a given state — the selection-backed set the S-10/S-11 ladder
 * built. Ops that act on captures, entities, tasks, members, selections or the
 * roster are NON_ACTS with their reasons; several are real acts on OTHER kinds
 * of objects and later items fold them in (REC-24 the action ops, REC-15 the
 * publication pre-flight). An `action` bundle honestly publishes NO acts today:
 * nothing operates it until REC-24, and an empty list is the true answer.
 */

import { STATES, ACTION_KINDS, normalizeType, vocabFor } from "../checks/bio-checks.mjs";

/* The disposition set: the target states op=dispose may write. Every other
 * inquiry state is entered by its own act with its own entry requirements
 * (REC-13/14/16 bring them), never by a bulk flip; the legacy machine's
 * `elevated` is not a state in the inquiry machine at all and the store
 * refuses it BAD_TARGET_STATE. The write path holds its own copy inside
 * dispose() (landed in the same wave as this file, from separate claims);
 * the affordances suite asserts the two arrays are identical, so they
 * cannot drift apart silently until they are unified. */
export const DISPOSITIONS = ["deferred", "dismissed"];

/* The object vocabularies, published the way op=searchfields publishes the
 * query language, so a surface never keeps a copy. action_kind is the check
 * catalogue's own C-2.10 suite, imported from the module that enforces it. */
export const VOCABULARIES = {
  action_kind: ACTION_KINDS,
  dispositions: DISPOSITIONS,
};

/* The seven sourced rungs — BIO_Interaction_Constructs_v0_1.md via
 * CAPABILITIES.md's op inventory (Constructs:241-244, 275). Everything absent
 * here publishes rung: null. Do not add a rung without a document that assigns
 * it: a rung is a promise to a member about reversibility, and FW-14 owns the
 * assignment (deriving it from what the store already enforces). */
export const RUNGS = {
  dispose:   "reasoned",   // Constructs:242
  retire:    "terminal",   // Constructs:244 — terminal in STATES, refuses CITED
  release:   "reasoned",   // Constructs:241
  sever:     "reasoned",   // Constructs:243
  reinstate: "reasoned",   // Constructs:243
  attest:    "attested",   // Constructs:275 (a NON_ACT below until a later item)
  ratify:    "attested",   // Constructs:275 (publication pre-flight is REC-15's)
};

/* One legal-edge lookup, over the IMPORTED table, THROUGH the catalog's own
 * vocabulary machinery (REC-10's normalisation, fifth consulting site): the
 * type reaches here already normalized, and vocabFor resolves it — declared
 * spelling first, normalized fallback — so a legacy-spelled fact and a
 * canonical one answer identically, and the state-alias handling (`surfaced`
 * a legal alias of `open`) is the TABLE'S OWN, never a copy here. */
const edgesFrom = (type, state) => (vocabFor(STATES, type)?.edges?.[state]) || [];

/* The facts shape is store.mjs affordanceFacts(): object_type, current_state,
 * cites_in {confirmed[], severed[]} (edges INTO an information target, read the
 * way retire reads them — severed is not live), cites_out {confirmed, severed}
 * (a project's own citation edges by status). */
export const ACTS = [
  /* S-11 step 5. collected -> verified is the one legal edge; the named-member
     and entry-requirement guards are act-time refusals the store words itself. */
  { id: "release", label: "Release (verify)", weight: "refuse", types: ["information"],
    applies: (f, ty) => ty === "information" && edgesFrom(ty, f.current_state).includes("verified") },
  /* S-11 step 4. verified -> retired, AND nothing with a live cites edge: the
     same predicate the store's CITED refusal runs (#citesInto). A severed edge
     is a recorded decision to stop relying, so it does not block. */
  { id: "retire", label: "Retire", weight: "refuse", types: ["information"],
    applies: (f, ty) => ty === "information" && edgesFrom(ty, f.current_state).includes("retired")
                     && f.cites_in.confirmed.length === 0 },
  /* S-11 step 3. An inquiry (né focus/problem — the type reaches here through
     normalizeType, so all three spellings land on this arm) may be
     dispositioned while the state machine offers a disposition edge; the
     disposition SET itself is in VOCABULARIES. */
  { id: "dispose", label: "Dispose (defer or dismiss)", weight: "refuse", types: ["inquiry"],
    applies: (f, ty) => ty === "inquiry"
                     && DISPOSITIONS.some((d) => edgesFrom(ty, f.current_state).includes(d)) },
  /* S-10/S-11 step 1: citing Information IN a Project. Published for BOTH ends,
     because the store's own guards are type-only on both: any information
     bundle may be cited (cite checks NOT_INFORMATION and nothing about state —
     citing retired material is permitted and therefore published), and any
     project may cite. Deriving a narrower answer here than the op gives would
     be this file inventing a rule the plane does not enforce. */
  { id: "cite", label: "Cite information in a project", weight: "report",
    types: ["information", "project"],
    applies: (f, ty) => ty === "information" || ty === "project" },
  /* S-11 step 2: withdrawing a citation without deleting it. From the
     information side: some project holds a live cites edge to it. From the
     project side: its own references carry a confirmed cites edge. */
  { id: "sever", label: "Sever a citation", weight: "refuse",
    types: ["information", "project"],
    applies: (f, ty) => (ty === "information" && f.cites_in.confirmed.length > 0)
                     || (ty === "project" && f.cites_out.confirmed > 0) },
  { id: "reinstate", label: "Reinstate a severed citation", weight: "refuse",
    types: ["information", "project"],
    applies: (f, ty) => (ty === "information" && f.cites_in.severed.length > 0)
                     || (ty === "project" && f.cites_out.severed > 0) },
];

/* Every op in NEEDS that is NOT an object-directed act, with the reason — so
 * the totality check can tell "deliberately not an affordance" from "someone
 * added an op and forgot the publication", which is the drift this op exists
 * to close. Grouped by the reason, keyed by op. */
export const NON_ACTS = {
  /* The write substrate. These are how any act lands, not acts on an object:
     a surface never renders a "promote" button beside a bundle. */
  promote: "substrate: the one write path every act rides",
  lease: "substrate: the courtesy lock around promote",
  allocid: "substrate: id allocation",
  capture: "substrate: byte movement, content-addressed",
  acquire: "substrate: the fetch layer (M2')",
  linkproject: "substrate: admits an observed link as an edge, keyed by capture",
  /* Capture-directed: their subject is a capture sha, not a bundle's state. */
  attest: "capture-directed: co-attestation of a capture's existence in time",
  monitor: "capture-directed: the monitor tick on a captured source",
  /* Keyed by entity / capture / progression — the framework surface, not a
     bundle-state act. */
  entitycreate: "registry write, keyed by entity",
  entityalias: "registry write, keyed by entity",
  relationdeclare: "registry write, keyed by entity pair",
  resolve: "recogniser write, keyed by capture sha",
  resolvetestify: "recogniser testimony, keyed by capture sha",
  connect: "connection derivation, keyed by entity",
  progressiondefine: "progression definition, keyed by progression key",
  thread: "progression instance write, keyed by (progression, entity)",
  discharge: "exception document, keyed by (progression, entity, stage)",
  proposedispose: "ages a DERIVED proposal, keyed by (progression, stage) — not a bundle",
  /* Inbox and publication. */
  inboxresolve: "inbox disposition, keyed by knock id",
  ratify: "publication: its pre-flight is the deferred op=publishpreflight (REC-15), because the refusal turns on gate state a surface cannot see",
  /* Selection lifecycle: a selection is the caller's own server-side snapshot. */
  select: "selection lifecycle, owned by the credential that made it",
  selectionrelease: "selection lifecycle, owned by the credential that made it",
  /* Participation: acts on a project's ROSTER, enforced by the store on who the
     caller IS (owner/participant), published today via op=projectparticipants
     and op=projectownerarith; folding them into affordances is a later item. */
  projectinvite: "participation: roster act, position-enforced by the store",
  projectjoin: "participation: roster act, position-enforced by the store",
  projectleave: "participation: roster act, position-enforced by the store",
  projectremove: "participation: roster act, position-enforced by the store",
  projectowneradd: "participation: roster act, position-enforced by the store",
  projectownerremove: "participation: roster act, position-enforced by the store",
  projectownerrescue: "participation: roster act, position-enforced by the store",
  projectfork: "creates a NEW project; gated on the create_projects shape, not on the source object's state",
  /* Identity, roster and operator surface. */
  expertisedeclare: "a member's own declaration, not a corpus act",
  expertiseconfirm: "administrator act on a declaration, class-gated",
  memberadd: "roster governance, bounded by SESSION_OPS.admin",
  memberset: "roster governance, bounded by SESSION_OPS.admin",
  signeradd: "signer governance, bounded by SESSION_OPS.admin",
  signerset: "signer governance, bounded by SESSION_OPS.admin",
  governorconfig: "operator tuning of the per-host governor",
  /* Task acts: their subject is a TASK row, assignee-fenced by the store
     (NOT_YOURS), published with the task itself via op=tasks. */
  taskforward: "task act, assignee-fenced; travels with the task via op=tasks",
  taskresolve: "task act, assignee-fenced; travels with the task via op=tasks",
};

export const ACT_IDS = new Set(ACTS.map((a) => a.id));

/* The derivation: which acts exist for THIS object as it stands. Pure over the
 * facts the store read, so a suite can hold it to the store's own refusals. */
export function deriveActs(facts) {
  const ty = normalizeType(facts.object_type);
  return ACTS.filter((a) => a.applies(facts, ty));
}
