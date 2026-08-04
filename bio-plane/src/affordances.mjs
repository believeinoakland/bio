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
 * of objects and later items fold them in (REC-15 the publication pre-flight).
 *
 * CORRECTED 2026-08-05 BY REC-24, and stated rather than quietly reworded: this
 * header used to say that an `action` bundle honestly publishes NO acts,
 * because nothing operated one and an empty list was the true answer. It no
 * longer is. `op=actionmove` and `op=actioncorrespond` are object-directed acts
 * on an action, derived below from the SAME imported state table every other act
 * reads, and an action now publishes both.
 */

import { STATES, ACTION_KINDS, SUBJECT_POSITIONS, BASIS_ROLES, ACTION_BASIS_KINDS,
         CORRESPONDENCE_DIRECTIONS, normalizeType, vocabFor } from "../checks/bio-checks.mjs";

/* The disposition set: the target states op=dispose may write. Every other
 * inquiry state is entered by its own act with its own entry requirements
 * (REC-13/14/16 bring them), never by a bulk flip; the legacy machine's
 * `elevated` is not a state in the inquiry machine at all and the store
 * refuses it BAD_TARGET_STATE. UNIFIED by REC-11's folded chore: the write
 * path (dispose(), and the proposal-disposition arm) IMPORTS this array — it
 * held its own literal copy from the REC-19 wave's separate claims, pinned
 * identical by the affordances suite until the direction could be flipped.
 * This is now the ONE array. */
export const DISPOSITIONS = ["deferred", "dismissed"];

/* REC-31 x REC-14, decided at their merge: the states op=reopen picks a
 * question back up FROM. It is the disposition set PLUS `published`, and it is
 * ONE array for the same reason DISPOSITIONS is — the store's refusal and the
 * published act must not be able to disagree about what "reopenable" means.
 *
 * WHY `published` BELONGS HERE AND `concluded` DOES NOT, which is the whole of
 * the distinction and is not a softening of REC-31's rule. That rule refuses
 * reverting a finding WITH NO EDITION RECORDED: a concluded inquiry quietly
 * returning to open still wearing its conclusion leaves nothing behind saying
 * the group changed its mind, which is why `concluded` is refused BY NAME and
 * the edition machinery is where that move belongs. A PUBLISHED case has the
 * opposite property. Its editions are ratified, signed and immutable, and
 * DEC-12 is explicit that reopening does not unpublish: every edition keeps
 * answering with its own signature, attestor, time and gate version. So the
 * hazard the exclusion guards against cannot arise on this edge — there is
 * nothing to erase — while the need is real, because published -> open is the
 * ONLY route to a second edition and an act the catalog permits that no caller
 * can perform is the state machine lying.
 *
 * ONE reopen act, not two: "pick this question back up" is one verb, and a
 * second control meaning the same thing on a different state is exactly the
 * drift this file exists to prevent. */
export const REOPENABLE_FROM = [...DISPOSITIONS, "published"];

/* REC-35, UI-13's delegation: THE INTENT LAYER'S THREE CLOSED VOCABULARIES, and
 * they live HERE for the reason DISPOSITIONS does — one array, imported by the
 * store that enforces it and published by the op a surface reads, so a set
 * cannot be changed in one place and stay stale in the other.
 *
 * WHY THIS DIRECTION AND NOT THE OTHER. The obvious move is to export them from
 * `store.mjs`, where the refusals are written. That is impossible and not merely
 * unpleasant: `store.mjs` ALREADY imports this module (DISPOSITIONS,
 * REOPENABLE_FROM, deriveActs), so publishing from there would close an import
 * cycle — and this file's `VOCABULARIES` is a top-level object literal, so any
 * module that reached `store.mjs` first would evaluate it while the store's
 * bindings were still in the temporal dead zone and crash at load. The
 * enforcement site keeps the refusal; the vocabulary keeps one home. That is
 * exactly the arrangement REC-11 landed for DISPOSITIONS after the same
 * question, and `bio-checks.mjs` is the same shape read from the other side
 * (ACTION_KINDS, SUBJECT_POSITIONS, BASIS_ROLES live where their check runs and
 * are imported into the publication above).
 *
 * WHAT THEY GATE, and why publishing them is not a convenience. Until this
 * item, a surface offering a subject kind, a relation predicate or a stage's
 * requiredness had no published set to read, so UI-13 harvested them out of the
 * store's own refusal sentence ("… one of a, b, c") — a legitimate DEC-8
 * reading, and a parser standing on the store's WORDING rather than on its
 * DATA. Published, the wording is free to change again. */

/* The union kind vocabulary, reconciled across the two doctrines this one axis
 * serves (D-83): safeguard 4's four SUBJECT kinds, plus the framework's entity
 * kinds (framework:248). Closed and validated at createEntity(), so introducing
 * a kind outside it is a loud refusal rather than a silent new vocabulary —
 * the spirit of safeguard 4, where introducing a new SUBJECT is a reviewed
 * act. Ordered as the two doctrines contribute them, and the order is what a
 * surface renders: it is a grouping a member can read, not an alphabetisation. */
export const ENTITY_KINDS = [
  /* safeguard 4's SUBJECT kinds */ "source", "institution", "office", "movement",
  /* the framework's entity kinds */ "person", "body", "ordinance", "parcel", "contract", "fund",
];

/* The three DECLARED-relation predicates safeguard 4 names, and only these. A
 * connection GRADE is not a relation kind and never appears here: a declared
 * relation is constitutive, not evidentiary, and carries no grade (D-83). */
export const RELATION_KINDS = ["proxy_for", "member_of", "overlaps"];

/* The closed vocabulary of stage requiredness (framework 8.2). `unless_exception`
 * is the crucial one — a lawful skip needs an exception document (FW-10), and
 * WHICH of these fire a missing-predecessor finding is a separate policy set
 * (`Store.#REQUIRED_FIRES`, DEC-9's) that deliberately does NOT live here: this
 * is what a member may DECLARE, not what the record then does about it. */
export const STAGE_REQUIREDNESS = ["always", "usually", "sometimes", "never", "unless_exception"];

/* REC-16 / DEC-29(b): THE DIVIDE PROMPT'S WORDING, and it is an ACCEPTANCE
 * CLAUSE rather than copy.
 *
 * Bob's ruling keeps the contextual prompt — the moment the weakest leg is
 * named is the moment a member can actually act on the structure — and attaches
 * ONE requirement instead of a timing rule: *"the prompt's wording must state
 * the disclosure — that the other question stays on the record and the
 * published child will name it — so what is offered is visibly honesty, not
 * concealment."* The hazard it answers is real and specific: division's visible
 * effect is a HIGHER publishable strength, so a surface offering it beside a
 * weak leg is a surface proposing an act that makes the member's case look
 * stronger, and that is only legitimate because nothing leaves the record.
 *
 * IT LIVES HERE, not in a surface, for DEC-8's reason exactly: a surface
 * renders what it RECEIVED. A prompt that stated the disclosure in one client
 * and not in another would be the forbidden surface-side map, one layer up from
 * the act list this file already publishes. Published on the act, so every
 * surface that can offer the act has the wording that must accompany it, and
 * the suite asserts the string.
 *
 * WHAT IT MUST SAY, and each clause is load-bearing: that NOTHING IS DROPPED
 * (every leg gets a home, including one that cuts against you — the apportionment
 * refuses to lose a leg, which is why division cannot do severance's work at a
 * discount); that THE OTHER QUESTION STAYS ON THE RECORD; and that A PUBLISHED
 * CHILD NAMES ITS PARENT AND ITS SIBLINGS to its readers. */
export const DIVIDE_PROMPT =
  "Dividing does not remove anything. Every leg this question rests on gets a home on one of the "
  + "children — including any leg that cuts against you — and this question stays on the record as the "
  + "divided parent, recording where each leg went. Each child names this parent and every sibling, and "
  + "when a child is published it names them to its readers. If you mean to drop material rather than "
  + "re-home it, sever it with a reason instead.";

/* The object vocabularies, published the way op=searchfields publishes the
 * query language, so a surface never keeps a copy. action_kind is the check
 * catalogue's own C-2.10 suite, imported from the module that enforces it. */
export const VOCABULARIES = {
  action_kind: ACTION_KINDS,
  dispositions: DISPOSITIONS,
  /* REC-14 / DEC-13. Published so a ceremony surface never keeps its own copy
     of the three positions. WHICH position a group takes gates NOTHING —
     nothing in the plane reads it, and a group that deliberately gave no notice
     publishes exactly as one that sought comment and printed the reply. What is
     gated is that the position is declared and justified. */
  subject_positions: SUBJECT_POSITIONS,
  /* REC-37. The roles a leg of a question's basis may carry, published beside
     the widened `cite` act because that act now REQUIRES one and refuses by
     name without it (NO_ROLE / BAD_ROLE). A surface that had to keep its own
     copy of these two words would be the surface deciding what `cuts_against`
     is called, and invariant 7's storage is not a rendering detail. Imported
     from the catalog function that enforces the set — there is one place these
     words live and it is not this file. */
  basis_roles: BASIS_ROLES,
  /* REC-35, UI-13's delegation. The three closed vocabularies of the INTENT
     layer — the entity registry's kinds, safeguard 4's declared-relation
     predicates, and a progression stage's requiredness. They are published for
     the same reason every set above is: a surface that had to keep its own copy
     would be the surface deciding what a `movement` or an `unless_exception` is
     called, and the write path would refuse a token the surface had just
     offered. Each is the array store.mjs's own refusal validates against —
     imported, never transcribed, so a kind added to the registry appears on
     every surface on its next load and cannot be added to one without the
     other. */
  entity_kinds: ENTITY_KINDS,
  relation_kinds: RELATION_KINDS,
  stage_requiredness: STAGE_REQUIREDNESS,
  /* REC-38, UI-19's measured gap. The action loop's two closed vocabularies —
     what a leg of an action's basis DOES (`rests_on` / `advances`, DEC-14), and
     which way a correspondence entry went (`sent` / `received` / `no_response`,
     DEC-13's non-response recorded as a fact rather than a silence). REC-24
     built both ops and exported both arrays from the check catalogue; neither
     reached here, and the cost was measured rather than argued: UI-19 could not
     offer a basis leg at all, so `request_for_comment` — the ONE kind DEC-13
     requires legs for — had to be filtered out of its own intake, and an action
     could be authored with a counterparty and a kind and nothing it rests on.
     Present-and-refused is what a published vocabulary prevents; absent-and-
     stated is what a surface must do until there is one.
     Imported from `bio-checks.mjs`, where C-2.10's own findings validate
     against them (`actionBasisFindings`, `correspondenceFindings`) and where
     store.mjs's BAD_DIRECTION refusal reads its `legal` list — the same
     direction `action_kind` and `basis_roles` above already take. One array. */
  action_basis_kinds: ACTION_BASIS_KINDS,
  correspondence_directions: CORRESPONDENCE_DIRECTIONS,
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
  attest:    "attested",   // Constructs:275 (a CAPTURE act — CAPTURE_ACTS below)
  ratify:    "attested",   // Constructs:275 (publication pre-flight is REC-15's)
};

/* REC-38, UI-22's delegation: THE CAPTURE-DIRECTED ACTS' METADATA, and the
 * SHAPE IS THE WHOLE OF THIS ITEM'S DECISION — stated here rather than in a
 * commit message, because the next session will meet the same fork.
 *
 * THE FORK. `attest` was the last act in this plane whose member-facing label
 * was written by a surface: op=affordances published nothing for it, so
 * civicos-ui spelled "Co-attest this capture" itself (UI-22 raised it rather
 * than papering over it). Two ways to fix that. Promote `attest` into ACTS with
 * an applies(), or publish a SEPARATE block for the capture-directed class.
 *
 * PROMOTING IT INTO `ACTS` WAS REJECTED, and not on taste — it would have been
 * DISHONEST in the precise way this file exists to prevent:
 *
 *   (1) THE SUBJECT IS WRONG. Every entry in ACTS is an act on A BUNDLE IN A
 *       GIVEN STATE; that is what the header says and what `deriveActs` is. The
 *       subject of op=attest is a CAPTURE SHA. A capture is not in a state, has
 *       no edges, and can be held by several bundles or by none.
 *   (2) THE DERIVATION HAS NOTHING TO DERIVE FROM. `applies()` is handed
 *       store.mjs's affordanceFacts — object_type, current_state, cites edges,
 *       basis legs. No capture sha is in that shape and no bucket is reachable
 *       from it. The only applies() writable over those facts is
 *       `ty === "information"`, which is NOT what op=attest gates on: it gates
 *       on evidence storage being configured (503), the sha being 64 hex
 *       (BAD_SHA) and THE BYTES ACTUALLY BEING IN THE STORE (NO_SUCH_CAPTURE).
 *       So an information bundle holding no capture would publish the act and
 *       the op would refuse it — a pre-flight disagreeing with the refusal it
 *       fronts, DEC-8's headline failure, arrived at by way of fixing a label.
 *   (3) IT WOULD SPLIT A CLASS. `monitor` is capture-directed for the same
 *       reason and would have stayed behind in NON_ACTS, so the two halves of
 *       one doctrine would sit in two registries with no rule relating them.
 *
 * WHAT IS PUBLISHED INSTEAD, and why it costs nothing to be honest: a block
 * beside `vocabularies` carrying id and LABEL for each capture-directed op —
 * and NOTHING ELSE, because everything else already has a home. `needs`, `mode`
 * and `rung` are composed at the control plane by `decorateAct`, the SAME
 * function every act in ACTS goes through, reading NEEDS, SESSION_OPS and RUNGS
 * — the tables that actually gate the call. That is what makes `RUNGS.attest`
 * reachable: it has been correct and unpublished since REC-19 only because
 * decorateAct ran over ACTS alone.
 *
 * SO THE LABEL IS THE ONLY NEW FACT, and it lives here for DISPOSITIONS' reason
 * exactly — one array, no copy. A surface renders it; a surface does not write
 * it.
 *
 * THESE STAY IN `NON_ACTS`. They are not object-directed acts and publishing
 * their metadata does not make them ones; the totality guard over NEEDS is
 * unchanged. What the suite adds is the OTHER totality — every NON_ACT whose
 * reason begins `capture-directed:` appears here, and nothing else does — so a
 * third capture-directed op cannot ship with no label either.
 *
 * NO PROMPT, deliberately. The co-attestation honesty fence ("this raises a
 * Grade B capture TOWARD evidentiary weight and never reaches Grade A") is a
 * real candidate for DEC-29(b)'s `prompt` treatment, and it is NOT invented
 * here: no ruling attaches it to the act, the surface's own sentence is not a
 * source, and guessing at one is what RUNGS refuses two blocks up. */
export const CAPTURE_ACTS = [
  /* op=attest. The verb is "co-attest" because the group is not the only
     attestor: the plane asks an independent timestamp authority and stores what
     it returns. The object is THE CAPTURE and the label says so — attesting the
     bundle would be the claim we cannot make. */
  { id: "attest", label: "Co-attest this capture" },
  /* op=monitor. One tick: re-fetch the source's locator and compare what it
     serves NOW against the bytes the provenance register says were captured
     from it. The label names the comparison rather than promising a watch — a
     tick is a check, and `unchanged` / `modified` / `removed` are its answers.
     No rung: no document assigns one, and RUNGS carries only the sourced seven
     (FW-14's job, not a guess made here). */
  { id: "monitor", label: "Check this source against what was captured" },
];

/* One legal-edge lookup, over the IMPORTED table, THROUGH the catalog's own
 * vocabulary machinery (REC-10's normalisation, fifth consulting site): the
 * state-alias handling (`surfaced` a legal alias of `open`) is the TABLE'S OWN,
 * never a copy here.
 *
 * CORRECTED BY REC-13, and the correction is the MAP RULE itself. This took the
 * already-NORMALIZED type, which defeated the whole point of vocabFor: that
 * function resolves the DECLARED spelling first precisely because the inquiry
 * collapse CHANGED the vocabulary, and a legacy focus/problem document is
 * judged by the contract it was authored under. Handing it `inquiry` for a
 * `focus` document asked the wrong machine. It was invisible while the two
 * machines agreed on every state an act cared about; `concluded` is the first
 * state they DISAGREE about, and the defect it would have produced is the one
 * DEC-8 exists to forbid — op=affordances publishing `conclude` for a document
 * the store then refuses ILLEGAL_TRANSITION, a pre-flight disagreeing with the
 * refusal it fronts. So the DECLARED type is what reaches the map, and
 * `object_type` (normalized) still answers the membership questions below. */
const edgesFrom = (f) =>
  (vocabFor(STATES, f.declared_type ?? f.object_type)?.edges?.[f.current_state]) || [];

/* The facts shape is store.mjs affordanceFacts(): object_type (NORMALIZED, for
 * membership), declared_type (the document's own spelling, for vocabulary —
 * REC-13), current_state, cites_in {confirmed[], severed[]} (edges INTO an
 * information target, read the way retire reads them — severed is not live),
 * cites_out {confirmed, severed} (a project's own citation edges by status),
 * basis_legs (REC-16: how many legs this question rests on), and rested_on
 * {working, frozen, severed} (REC-17: how many live basis legs rest ON it, by
 * whether the dependent can still withdraw one — COUNTS and never ids, because
 * this answer is about the target and naming its dependents would be §7.9's
 * reverse walk by a new door). */
export const ACTS = [
  /* S-11 step 5. collected -> verified is the one legal edge; the named-member
     and entry-requirement guards are act-time refusals the store words itself. */
  { id: "release", label: "Release (verify)", weight: "refuse", types: ["information"],
    applies: (f, ty) => ty === "information" && edgesFrom(f).includes("verified") },
  /* S-11 step 4. verified -> retired, AND nothing with a live cites edge: the
     same predicate the store's CITED refusal runs (#citesInto). A severed edge
     is a recorded decision to stop relying, so it does not block. */
  { id: "retire", label: "Retire", weight: "refuse", types: ["information"],
    applies: (f, ty) => ty === "information" && edgesFrom(f).includes("retired")
                     && f.cites_in.confirmed.length === 0 },
  /* S-11 step 3. An inquiry (né focus/problem — the type reaches here through
     normalizeType, so all three spellings land on this arm) may be
     dispositioned while the state machine offers a disposition edge; the
     disposition SET itself is in VOCABULARIES. */
  /* REC-17 / D-5 DELIBERATELY DOES NOT NARROW THIS ACT, and the reason is the
     release precedent rather than an oversight. Dismissal of a cited inquiry is
     now refused CITED — but `dismissed` is a PARAMETER of this act, not the
     act: `deferred` is the other target state, it is reversible, and it stays
     legal over a cited question (it raises the re-evaluation obligation instead
     of refusing). Publishing the act says the state machine permits the move,
     not that this caller's parameters will pass, which is exactly what release
     and conclude already say here. Narrowing it would unpublish DEFER on the
     one question a member most wants to defer. */
  { id: "dispose", label: "Dispose (defer or dismiss)", weight: "refuse", types: ["inquiry"],
    applies: (f, ty) => ty === "inquiry"
                     && DISPOSITIONS.some((d) => edgesFrom(f).includes(d)) },
  /* REC-13. An inquiry whose machine offers the `concluded` edge — `open`, and
     its `surfaced` alias, and nothing else. Weight `single`, the first act
     published that is NOT selection-backed: one conclusion answers one
     question, so there is no set to apply and no set-application weight to
     report (store.mjs conclude() carries the reasoning; the suite cross-checks
     the word against what the op itself returns). NO RUNG: no document assigns
     one, and RUNGS carries only the seven that are sourced — inventing
     "reasoned" here because it feels reasoned is exactly the guessing this
     file refuses. The entry requirements (a conclusion, a falsifier, at least
     one basis leg) and the named-member rule are ACT-TIME refusals the store
     words itself, the release precedent: publishing the act says the state
     machine permits the move, not that this caller's parameters will pass. */
  { id: "conclude", label: "Conclude", weight: "single", types: ["inquiry"],
    applies: (f, ty) => ty === "inquiry" && edgesFrom(f).includes("concluded") },
  /* REC-31. An inquiry the group SET DOWN, whose own machine offers the way
     back to `open`. TWO conditions and no third: the FROM state is in the
     published DISPOSITIONS array — the one array that says what "set down"
     means, the same one op=dispose writes INTO — and the catalog's edge table
     offers `open` from there. There is NO SECOND EDGE SOURCE and no state
     list local to this file; a legacy focus/problem document is excluded by
     the table itself, because its own vocabulary spells its open state
     `surfaced` and has no `open` edge at all.
     WHY THE DISPOSITION SET AND NOT THE WHOLE EDGE TABLE: `concluded -> open`
     is ALSO legal (REC-13 added it — a conclusion is revisable), and it is
     NOT this act. DEC-12 makes reopening a conclusion an EDITION, and REC-14
     builds that machinery; publishing `reopen` on a concluded inquiry would
     put a control on the strip that reverts a published finding with no
     edition recorded, which is the DEC-8 disagreement in the worse direction
     — a publication the store then has to refuse. The store refuses it by
     name (NOT_SET_DOWN) and this list does not offer it. Weight `single` and
     rung null for conclude's reasons: one question is picked back up at a
     time, and no document assigns this act a rung (FW-14's job, not a guess
     made here).
     EXTENDED AT THE REC-14 MERGE, and the exclusion above is UNCHANGED: the
     FROM set is REOPENABLE_FROM, which adds `published` and still refuses
     `concluded`. A published case's editions are signed and immutable and
     reopening does not unpublish them (DEC-12), so the "reverts a finding with
     no edition recorded" hazard this act was scoped around cannot arise there
     -- and published -> open is the only route to a second edition. The
     reasoning is on REOPENABLE_FROM itself, where both consumers read it. */
  { id: "reopen", label: "Reopen", weight: "single", types: ["inquiry"],
    applies: (f, ty) => ty === "inquiry" && REOPENABLE_FROM.includes(f.current_state)
                     && edgesFrom(f).includes("open") },
  /* REC-14. An inquiry whose machine offers the `published` edge — which is
     `concluded` and nothing else, because a material set cannot be asserted
     over a question with no conclusion. Weight `single`, conclude's precedent:
     one case is published at a time and there is no set to apply.

     NO RUNG, and this one is worth stating rather than passing over: publishing
     feels like the most `attested` act in the system, and `ratify` IS assigned
     that rung by Constructs:275. But this act is not the attestation — it
     AUTHORS the bytes that are then attested, and no document assigns it a
     rung. Inventing "attested" here because it sits next to ratify is exactly
     the guessing this file refuses; FW-14 owns the assignment.

     The entry requirements (the completeness statement, the exclusion FIELD,
     the declared and justified subject position) and C-21.1's freshness check
     are ACT-TIME refusals the store words itself — the release precedent:
     publishing the act says the state machine permits the move, not that this
     caller's parameters will pass. */
  { id: "publish", label: "Publish (author the case)", weight: "single", types: ["inquiry"],
    applies: (f, ty) => ty === "inquiry" && edgesFrom(f).includes("published") },
  /* REC-16. An inquiry whose machine offers the `divided` edge — `open`, its
     `surfaced` alias, and `concluded` — AND WHICH RESTS ON SOMETHING. Weight
     `single`, conclude's precedent: one question is divided at a time.
     WHY THE BASIS COUNT IS PART OF THE DERIVATION AND NOT A DETAIL. The
     apportionment refuses to lose a leg and refuses to leave a child with
     nothing, so a question resting on ZERO legs cannot be divided at all —
     there is nothing to apportion, both children would inherit nothing, and the
     store refuses it NO_APPORTIONMENT. Publishing the act there would be
     precisely the DEC-8 disagreement: a pre-flight offering a control the
     refusal it fronts would then decline. ONE leg IS enough, and deliberately:
     two different questions may rest on the same document, and R4 permits a leg
     to land on one child or on BOTH.
     NO RUNG: no document assigns division one, and RUNGS carries only the seven
     that are sourced. It is tempting to write `terminal` here because the
     parent never moves again — but the parent is corrected FORWARD into its
     children rather than ended, which is not what the ladder's `terminal` says,
     and guessing at the difference is exactly what this file refuses. FW-14
     owns the assignment.
     THE PROMPT rides the act (DEC-29(b)): every surface that can offer division
     receives the wording that must accompany it, because a surface renders what
     it received and never composes a prompt of its own. */
  /* THIRD CONDITION, ADDED BY REC-17 / D-5, and it is retire's condition
     one altitude up: division is TERMINAL for the parent, so it refuses CITED
     while a WORKING inquiry's live basis leg still rests on the question — and
     a pre-flight offering a control the refusal it fronts would decline is the
     DEC-8 disagreement this file exists to prevent. `rested_on.working` and not
     `.frozen`: a PUBLISHED dependent's basis is inside a signed edition and
     cannot withdraw a leg, so the store deliberately does not refuse on it (the
     reasoning is at divide()'s guard, where both consumers of the distinction
     can read it), and unpublishing the act here would disagree in the other
     direction. ONE predicate behind both, as with retire and #citesInto. */
  { id: "inquirydivide", label: "Divide (split this question)", weight: "single", types: ["inquiry"],
    prompt: DIVIDE_PROMPT,
    applies: (f, ty) => ty === "inquiry" && edgesFrom(f).includes("divided")
                     && (f.basis_legs ?? 0) >= 1
                     && (f.rested_on?.working ?? 0) === 0 },
  /* S-10/S-11 step 1: citing. Published for BOTH ends, because the store's own
     guards are type-only on both: any information bundle may be cited (cite
     checks the member's TYPE and nothing about state — citing retired material
     is permitted and therefore published), and any citing object may cite.
     Deriving a narrower answer here than the op gives would be this file
     inventing a rule the plane does not enforce.

     REC-37 ADDS THE THIRD TYPE, and it is the one that makes a record become a
     case: a QUESTION may cite, and what lands on it is a leg of the basis its
     answer rests on rather than a citation edge. An inquiry also appears here
     as a MEMBER — a leg may point at another question (basis recursion, DEC-23)
     — which is the same widening read from the other end. The store refuses a
     citing object that is neither NOT_A_PROJECT and a member that is neither
     NOT_CITABLE, and this entry publishes exactly that and no narrower rule.

     THE LABEL IS TYPE-NEUTRAL NOW, because one act publishing itself as "in a
     project" on a question would be the publication disagreeing with the op it
     fronts — the disagreement this file exists to prevent. */
  /* REC-24 (c). An action whose own machine offers ANY onward state — which is
     everything except `resolved` and `abandoned`, and the table says so rather
     than this file listing them. ONE condition and no second: the entry
     requirements (an authored reason; a resolution when the target state is
     `resolved`) are ACT-TIME refusals the store words itself, the release
     precedent carried through conclude and reopen — publishing the act says the
     state machine permits a move, not that this caller's parameters will pass.
     Weight `single`: one action moves at a time and there is no set to apply.
     NO RUNG. It is tempting to write `reasoned` because a reason is required,
     and that is exactly the guess RUNGS refuses: no document assigns this act a
     rung, and FW-14 owns the assignment. */
  { id: "actionmove", label: "Move this action", weight: "single", types: ["action"],
    applies: (f, ty) => ty === "action" && edgesFrom(f).length > 0 },
  /* REC-24 (d). Recording what was sent, what came back, or that nothing did.
     Published for an action in ANY state, and the breadth is deliberate: the
     store's own guard is the object's TYPE and nothing else, so narrowing here
     would be this file inventing a rule the plane does not enforce (the cite
     precedent). A resolved action can still have a late reply recorded against
     it — the exchange happened, and the ledger is the record of it — and a
     planned one can record a first approach.
     Weight `single`: the ledger is append-only, one entry at a time. NO RUNG,
     for actionmove's reason. */
  { id: "actioncorrespond", label: "Record correspondence", weight: "single", types: ["action"],
    applies: (f, ty) => ty === "action" },
  { id: "cite", label: "Cite material into a case or a question", weight: "report",
    types: ["information", "project", "inquiry"],
    applies: (f, ty) => ty === "information" || ty === "project" || ty === "inquiry" },
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
  /* Capture-directed: their subject is a capture sha, not a bundle's state.
     REC-38: NOT acts here, and their member-facing METADATA is published all
     the same — CAPTURE_ACTS above carries the label, decorateAct adds the
     needs/mode/rung from the same tables every act reads, and op=affordances
     answers them in a `capture_acts` block beside the vocabularies. A reason
     beginning "capture-directed:" is what makes an op a member of that block,
     and the suite holds the two lists equal in both directions. */
  attest: "capture-directed: co-attestation of a capture's existence in time (metadata published in capture_acts)",
  monitor: "capture-directed: the monitor tick on a captured source (metadata published in capture_acts)",
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
  /* REC-14 / DEC-17. Its subject is the GROUP's own declaration about the
     standard its work is held to — authored before the work, about their own
     intentions — so there is no object in any state for it to appear beside. A
     project's override is not an op at all: it is authored frontmatter on the
     project's bundle.md, which is what makes lowering a bar an on-the-record
     act rather than a settings change with nothing to read afterwards. */
  strengthbar: "governance: the GROUP's declared default required strength, keyed by group and not by any bundle — a declaration about the group's own work, never a property of an object or of a reader",
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
  /* REC-20. A READ, and one whose subject is a MEMBER rather than an object:
     op=queue answers "what has this record put in front of me", keyed by the
     member the control plane stamps. It is not an act on a bundle and no
     surface renders a "queue" button beside one — it is the surface those
     buttons live ON, and the acts it offers per item are THIS file's own
     derivation, carried into the feed rather than restated there. */
  queue: "read: the member's own feed, keyed by member — not an act on an object; the acts it offers per item ARE this derivation",
  /* REC-21, and this classification is DOCTRINE rather than bookkeeping. These
     two are NON_ACTS not merely because their subject is a (member, case) row
     instead of a bundle, but because publishing them here is precisely the
     failure D-125 names: this list is what a surface renders as the controls
     beside an object, so an entry here would put "mute" on the same strip as
     dispose, retire and sever — one control for a personal preference and a
     record act, which is the thing that must never happen. The mute control
     belongs to the QUEUE ENTRY (UI-14 renders it there), not to the object, and
     the vocabulary of what may be muted is published by the refusal and by
     op=queue's own `mute` block, never by a surface-side map. */
  /* REC-34. A READ, and one whose subject is a QUESTION rather than an act on
     it: op=inquirystrength answers what an inquiry's basis derives to, and no
     surface renders an "inquirystrength" button beside a bundle — it is the
     PANEL those buttons sit under (UI-11's strength panel, UI-12's live
     preview). op=queue's classification exactly, one altitude down. */
  inquirystrength: "read: the derived pair for one question — the panel the acts are rendered under, never an act on an object",
  /* REC-18. A READ, and its subject is a PROSPECTIVE leg rather than an object:
     op=earnedbasis says what the record would earn for a target if it were
     cited, which is a fact consulted while COMPOSING the act (op=promote) and
     is never itself an act. No surface renders an "earnedbasis" button beside a
     bundle; UI-20's cite flow reads it to fill a leg in. */
  earnedbasis: "read: what the record earns for a candidate basis leg — consulted while composing a citation, never an act on an object",
  /* REC-36. Keyed by ENTITY, like the registry writes above it: the question is
     "which captured documents name this subject", not "what may be done to this
     bundle". It offers candidates a member picks a resolve out of; the ACT is
     op=resolve, which is already a named non-act keyed by capture sha. */
  readingname: "read: which captured documents' readings name a registered subject (framework §8.1's grade-C tier), keyed by entity — the candidate list op=resolve is chosen from, never an act on an object",
  queuemute: "personal state, keyed (member, case): a preference about one member's attention, not an act on an object — and never on the same control strip as a record act (D-125)",
  queuesnooze: "personal state, keyed (member, case): defers re-notification for one member, changes nothing about the object or the record (D-125, P-87)",
};

export const ACT_IDS = new Set(ACTS.map((a) => a.id));

/* The derivation: which acts exist for THIS object as it stands. Pure over the
 * facts the store read, so a suite can hold it to the store's own refusals. */
export function deriveActs(facts) {
  const ty = normalizeType(facts.object_type);
  return ACTS.filter((a) => a.applies(facts, ty));
}
