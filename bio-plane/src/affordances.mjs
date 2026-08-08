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
         CORRESPONDENCE_DIRECTIONS, RESOLUTIONS,
         /* REC-43 / DEC-39. The two letters the co-attestation fence states are
            the RULE's own, imported from where the refusal that enforces it is
            computed, so the sentence a member reads and the grade the gate will
            accept cannot drift. See ATTEST_FENCE below. */
         EARNED_CAPTURE_CEILING, UNREACHABLE_CAPTURE_GRADE,
         /* PL-2 / IS-2. THE SIXTH STATE MACHINE, imported from where it is
            defined — the `op=dispose` hazard, not repeated. §6 rule 4 requires
            it: *"the machine publishes the new machine through op=affordances,
            or every surface showing version states holds a second copy of the
            rule — the drift class DEC-8 closed."* */
         VERSION_MACHINE, VERSION_REASON_REQUIRED,
         normalizeType, vocabFor } from "../checks/bio-checks.mjs";

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

/* REC-45 / DEC-29(b), on REC-16's mechanism exactly: THE GROUPING PROMPT.
 *
 * WHY THIS ACT WARRANTS ONE AT ALL, and the argument is DIVIDE_PROMPT's with
 * the hazard one notch sharper. Division's prompt exists because division's
 * visible effect is a HIGHER publishable strength, so a surface offering it is
 * proposing an act that makes the member's case look stronger. Grouping is the
 * SAME shape and more direct: OR takes the MAXIMUM, so this is the one act in
 * the record that raises a finding's grade without adding a single new piece of
 * evidence. DEC-32 names the hazard in those words — *"a member has a standing
 * incentive to bundle a weak ground beside a strong one and publish at the
 * strong one's grade"* — and names the three things that contain it: the
 * assertion is AUTHORED and carries a name, the compound falsifier is the
 * check, and each group's legs stay VISIBLE so a reader tests sufficiency
 * rather than taking it. Two of those three are mechanism this plane enforces,
 * and they are what this wording states.
 *
 * IT LIVES HERE for DEC-8's reason, unchanged from DIVIDE_PROMPT: a surface
 * renders what it RECEIVED and never composes a prompt of its own, so a
 * sentence that appeared in one client and not another would be the forbidden
 * surface-side map one layer up from the act list.
 *
 * EVERY CLAUSE IS MECHANISM, and that is a deliberate boundary rather than a
 * stylistic one. Each sentence below is a fact about what this plane DOES,
 * checkable against code and asserted clause by clause in the suite: (1) what
 * the field means, in the words checkGrounds' own refusal already uses; (2) the
 * MAX composition in `#axisResult`; (3) the server stamp and its carry-forward
 * rule in `groundInquiry`; (4) the branches surviving redaction and being
 * frozen into the ratified bytes (`published_strength_grounds`, required by
 * C-2.8); (5) the AND default. NOTHING here states a doctrine the record does
 * not already enforce — REC-45 was scoped to report such a sentence as a DEC
 * candidate rather than write one, and one was reported rather than written
 * (DEC-32's operational test, *"would refuting this alone change the
 * conclusion?"*, which belongs to UI-27's elicitation and not to this act).
 *
 * AND IT CARRIES NO ANALYST VOCABULARY, which is DEC-32 clause 1 and is binding
 * on any member-facing string: no AND, no OR, no disjunction, no branch, and
 * not the word `ground` itself — including in this act's own label. The wire
 * name is `inquiryground` because a wire name is not a surface; the sentence a
 * member reads says GROUP. */
export const GROUND_PROMPT =
  "Grouping says these reasons are enough on their own to carry your answer. Your answer's strength is "
  + "then taken from the strongest group rather than from its weakest single reason, so your name and the "
  + "time go on each group you make and stay there until that group's reasons change. Nothing is hidden: "
  + "every reason stays visible under the group you put it in, and a published case carries each group and "
  + "what it reached inside the signed bytes, so a reader can check whether they really were enough on "
  + "their own. Leaving the reasons ungrouped is always available, and is read as no stronger than the "
  + "weakest one.";

/* REC-43 / DEC-39, on REC-16's mechanism exactly: THE CO-ATTESTATION HONESTY
 * FENCE. Third prompt, and the first whose WORDS ARE NOT THIS FILE'S.
 *
 * THE SENTENCE IS BOB'S AND IS TAKEN VERBATIM from the DEC-39 entry. It is not
 * paraphrased, not tightened, and not improved, and that is a rule about this
 * string rather than a courtesy: DEC-39 rules that the fence states GRADE
 * DOCTRINE — what an attestation is worth — so a session rewording it would be
 * a session amending doctrine at a keyboard. If it is wrong, it is amended in
 * DECISIONS.md and this string follows; the drift guards below are built so
 * that a change made HERE and nowhere else is visible rather than silent.
 *
 * THE ONE STRUCTURAL ACCOMMODATION, stated rather than smoothed away. DEC-39
 * renders the wording as a markdown blockquote: three parts, each opened by a
 * bold label, with the question in the first part italicised. `prompt` is a
 * plain string in the published act shape (DIVIDE_PROMPT and GROUND_PROMPT are
 * both single prose strings), so the `**`/`*` markers and the blockquote's line
 * breaks — which are the DECISIONS.md file's RENDERING and not part of the
 * sentence — are not carried. Every WORD, its order, its punctuation and its
 * capitalisation (`TRUE`) are unchanged, and the deliberate three-part shape
 * survives in the three labels the ruling itself wrote. Nothing was added.
 *
 * WHAT THE RULING CORRECTS, because it is the reason the sentence exists and a
 * later reader must not trim it back to the old one. The surface's wording said
 * what co-attestation DOES ("raises Grade B toward evidentiary weight") and what
 * it CANNOT do ("never reaches Grade A") and never said WHAT QUESTION IT
 * ANSWERS — so a reader reaches for it to solve a DIRECTNESS problem it has
 * nothing to do with. Bob's own trial example was a coroner's courtroom
 * testimony held only as a newspaper account: it READ like the co-attestation
 * case and is not one. The first part is what the old sentence omitted, the
 * second is that misreading, the third is the existing fence unchanged.
 *
 * IT LIVES HERE for DEC-8's reason, unchanged from the two prompts above: a
 * surface renders what it RECEIVED and never composes a prompt of its own. The
 * surface authored this sentence until this item (`ATTEST_YIELDS_GRADE` in
 * civicos-ui/app.html), which DEC-39 calls the last member-facing claim about
 * the record's semantics that the record did not own; UI-28 renders the
 * publication and stops writing one.
 *
 * AND THE TWO GRADE LETTERS ARE COMPOSED FROM THE RULE, WHICH IS THE WHOLE
 * POINT OF THE ITEM. `Grade B` and `Grade A` are not typed here: the ceiling is
 * `EARNED_CAPTURE_CEILING`, imported from `checks/bio-checks.mjs` where
 * `checkEarnedLeg` refuses a leg claiming more than it, and the unreachable
 * letter is read out of `BASIS_GRADES` as the rank immediately above it. So the
 * published sentence is a FUNCTION of the enforced rule rather than a copy that
 * happens to agree with it today — REC-35's finding restated on a sentence
 * instead of an array, and an identical copy would agree at zero cost, which is
 * why the affordances suite's drift guard is STRUCTURAL as well as behavioural.
 *
 * IT REFUSES TO COMPOSE A SENTENCE IT CANNOT MAKE TRUE. If the ceiling were
 * ever raised to the strongest grade there would be no unreachable letter, and
 * "it never reaches Grade null" is worse than no fence at all. That is a load
 * failure, not a fallback: the module fails to evaluate and the whole plane
 * fails to start, which is the only honest outcome for a doctrine string whose
 * doctrine has moved out from under it. */
export const attestFence = (ceiling, unreachable) => {
  if (!ceiling || !unreachable)
    throw new Error("the co-attestation fence states a ceiling AND the grade above it (DEC-39); "
                  + "with no grade above the ceiling the sentence cannot be composed truthfully");
  return "What co-attestation answers: when did these bytes exist? It asks an independent timestamp "
       + "authority to record that this capture's exact bytes existed no later than a fixed instant. "
       + "What it does not answer: whether the document is TRUE, whether its source is authoritative, "
       + "or how close it stands to the fact you are citing it for. A secondhand report that is "
       + "co-attested is still a secondhand report. "
       + `What it is worth: it strengthens a Grade ${ceiling} capture toward evidentiary weight. It `
       + `never reaches Grade ${unreachable} — that needs a chain-of-custody web archive this surface `
       + "cannot produce.";
};

export const ATTEST_FENCE = attestFence(EARNED_CAPTURE_CEILING, UNREACHABLE_CAPTURE_GRADE);

/* op=acquire's `note` — the THIRD hand-written statement of the same doctrine,
 * closed by REC-48 (2026-08-04) on exactly REC-43's mechanism and deliberately
 * NOT on REC-43's sentence.
 *
 * IT IS NOT THE ATTEST FENCE AND MUST NOT BE REPLACED BY IT. Different act,
 * different reader, different moment. `ATTEST_FENCE` is the prompt on the
 * `attest` ACT: it is read by a member who is DECIDING whether to co-attest,
 * which is why DEC-39 made it answer "what question does this answer?" before
 * anything else. This string is the RECEIPT op=acquire hands back to a caller
 * who has just received bytes and is not deciding anything — it states what the
 * capture it just made is worth, in one line, beside the capture's own
 * `grade` field. Widening it into a second fence would put two accounts of
 * co-attestation in front of one member; narrowing the fence to this would lose
 * the part the ruling exists to add. They say different things ON PURPOSE.
 *
 * THE WORDING IS UNCHANGED BY THIS ITEM, and that is a judgement rather than a
 * default. Its third clause ("co-attestation raises <ceiling> toward evidentiary
 * weight") is the same claim as the fence's own third part ("it strengthens a
 * Grade <ceiling> capture toward evidentiary weight"), so the note states a
 * SUBSET of ruled wording and cannot overclaim relative to it. What DEC-39
 * corrected was a surface presenting that clause AS the co-attestation decision
 * prompt with nothing else beside it; this is not that surface, and the full
 * fence is one op=affordances call away on the act that does decide. If a later
 * reading finds the receipt is where members actually form the belief, that is
 * a ruling about which surface owns the fence, not an edit to make here quietly.
 *
 * THE TWO LETTERS ARE COMPOSED, WHICH IS THE ITEM. `Grade B` and `Grade A` were
 * typed here in their own letters until 2026-08-04, a third copy that agreed
 * with the rule at zero cost; both now come from the enforcement point, and the
 * composed string is character-identical to the literal it replaced while the
 * ceiling stands at B — which is the point, since a change of doctrine is
 * exactly when a copy stops agreeing and this stops being a copy.
 *
 * IT REFUSES TO COMPOSE A SENTENCE IT CANNOT MAKE TRUE, for `attestFence`'s
 * reason and with its consequence: a load failure that stops the plane, never a
 * fallback that ships "Grade null needs a chain-of-custody web archive". */
export const acquireGradeNote = (ceiling, unreachable) => {
  if (!ceiling || !unreachable)
    throw new Error("op=acquire's note states what this surface earns AND the grade above it; "
                  + "with no grade above the ceiling the sentence cannot be composed truthfully");
  return `Grade ${ceiling}: bytes as fetched, hashed at receipt. Grade ${unreachable} needs a `
       + "chain-of-custody web archive, which this surface cannot produce. Co-attestation raises "
       + `${ceiling} toward evidentiary weight.`;
};

export const ACQUIRE_GRADE_NOTE = acquireGradeNote(EARNED_CAPTURE_CEILING, UNREACHABLE_CAPTURE_GRADE);

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
  /* REC-39, UI-24's second measured gap and the LAST of the action loop's closed
     sets to reach here. How an action ENDED: C-2.10 requires one of these four
     the moment an action's state is `resolved`, and `op=actionmove` refuses
     NO_RESOLUTION without one.
     WHY PUBLISHING IT IS NOT A CONVENIENCE, and the shape of the gap is worth
     keeping: the words were reachable before this — out of the `legal` list on
     op=actionmove's own NO_RESOLUTION refusal, which is what UI-19's chooser
     reads — so the option set was a property of a REFUSAL rather than of the
     record. A surface could not offer a resolution until the plane had already
     told the member no, and a set that only exists inside a refusal cannot be
     rendered anywhere a refusal has not happened. Published, it is a fact about
     what an action may be, available to a surface that is merely describing the
     act.
     Imported from `bio-checks.mjs` where C-2.10's own finding validates against
     it and where store.mjs's NO_RESOLUTION refusal reads its `legal` list — the
     same direction `action_kind`, `basis_roles`, `action_basis_kinds` and
     `correspondence_directions` above already take. One array, three readers. */
  resolutions: RESOLUTIONS,
  /* PL-2 / IS-2 — THE SIXTH STATE MACHINE, PUBLISHED. §6 rule 4's third
     consequence is not a nicety: without this, every surface that shows a
     version's state holds its own copy of which states exist and which moves
     are legal, and a copy is the DEC-8 drift class this whole file exists to
     close. Published as the machine ITSELF — the state list AND the edge table —
     because a surface that knows only the states must still guess which control
     to offer, and guessing is what produces a control the plane then refuses.
     `version_reason_required` travels with it for the same reason: a surface
     that must ask for a reason before it sends the act cannot know WHEN to ask
     unless the plane says so, and the alternative is a member typing a reason
     into a form that discards it, or worse, an act refused after the fact.
     IMPORTED, never restated: one table, three readers (the catalog defines it,
     the store enforces it, this publishes it). */
  version_states: VERSION_MACHINE.legal,
  version_edges: VERSION_MACHINE.edges,
  version_reason_required: VERSION_REASON_REQUIRED,
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
 * A PROMPT NOW, AND THE PARAGRAPH THIS REPLACES WAS RIGHT WHEN IT WAS WRITTEN.
 * CORRECTED 2026-08-04 by REC-43 / DEC-39, stated rather than quietly reworded
 * because the reasoning it recorded is the reasoning that produced the ruling.
 * REC-38 wrote here that `attest` carries NO PROMPT deliberately — that the
 * co-attestation honesty fence was "a real candidate for DEC-29(b)'s `prompt`
 * treatment" but was NOT invented here, because no ruling attached it to the
 * act, the surface's own sentence is not a source, and guessing at one is what
 * RUNGS refuses two blocks up. That refusal was correct and it is what routed
 * the question to Bob. DEC-39 answered it — PUBLISH IT, AND IT MUST STATE THE
 * QUESTION CO-ATTESTATION ANSWERS — so the act now carries `ATTEST_FENCE`, whose
 * words are Bob's and whose two grade letters are the enforced rule's. Nothing
 * about the RUNGS reasoning changes: `rung` here is still the sourced
 * `attested` and no rung is guessed anywhere in this file. */
export const CAPTURE_ACTS = [
  /* op=attest. The verb is "co-attest" because the group is not the only
     attestor: the plane asks an independent timestamp authority and stores what
     it returns. The object is THE CAPTURE and the label says so — attesting the
     bundle would be the claim we cannot make. */
  /* THE FENCE RIDES THE ACT (DEC-39, on DEC-29(b)/REC-16's mechanism): every
     surface that can offer co-attestation receives the wording that must
     accompany it, so the sentence cannot appear in one client and not another.
     The words are Bob's and the grade letters are the enforced rule's — the
     reasoning is on ATTEST_FENCE itself, where both consumers read it. */
  { id: "attest", label: "Co-attest this capture", prompt: ATTEST_FENCE },
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

/* PL-2 / IS-2. `edgesFrom` one construct down: does ANY reading this question
 * holds have a legal move to `to`, according to the SIXTH state machine's own
 * edge table? The table is `VERSION_MACHINE`'s and there is no copy here.
 *
 * WHY *ANY* AND NOT *ALL*, which is the honest reading and not a weakening: a
 * question holds several readings at once and they are in different states, so
 * the answer to "may this act be taken here" is "yes, on at least one of them" —
 * exactly as op=dispose is published when the machine offers a disposition edge
 * without promising that this caller's parameters will pass. WHICH reading is
 * the act's own parameter, and the store refuses one that cannot make the move
 * by name (C-25.25), naming the legal set it could have made. */
const anyVersionEdgeTo = (f, to) =>
  (f.basis_version_states ?? []).some((s) => (VERSION_MACHINE.edges[s] || []).includes(to));

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
  /* REC-45 / DEC-32: AUTHORING THE STRUCTURE. An inquiry that RESTS ON
     something, and whose record is still working.

     WHY THE LEG COUNT IS PART OF THE DERIVATION and not a detail, exactly as it
     is for division above: a partition is a partition OF THE LEGS, so a
     question resting on nothing has nothing to group and the store refuses it
     NO_BASIS. Publishing the act there would be a pre-flight offering a control
     the refusal it fronts would decline, which is the DEC-8 disagreement this
     file exists to prevent. ONE leg IS enough and deliberately so: a member may
     legitimately say that the single thing they have is enough on its own, and
     the act is also the only route BACK to an ungrouped basis.

     THE TWO STATES IT IS NOT OFFERED IN, and the store refuses each BY NAME so
     a caller that arrives anyway is told which rule it met.  `published`: the
     composed pair and the per-group breakdown are inside signed, ratified bytes
     (REC-14/REC-42), and re-partitioning underneath them would change what the
     document's own basis composes to while an edition on the record says
     otherwise — DEC-12's route is reopen, restructure, republish, which is the
     same shape PUBLISHED_CANNOT_DIVIDE takes one act over.  `divided`: the
     parent has been declared MALFORMED and carried forward into children that
     supersede it (REC-16), and re-deriving a terminal parent's strength after
     the fact would move a number its children's disclosure already pointed at.

     NO RUNG. No document assigns grouping one, and RUNGS carries only the seven
     that are sourced. It is tempting to write `reasoned` here; that is the
     guessing this file refuses, and FW-14 owns the assignment.

     WEIGHT `single`, conclude's precedent: one question's structure is authored
     at a time, and a bulk version would be the checkbox these constructs exist
     to refuse — the more so here, because this is the act that RAISES a grade.

     THE PROMPT RIDES THE ACT (DEC-29(b), REC-16's mechanism): every surface
     that can offer grouping receives the wording that must accompany it. The
     reasoning for why this act warrants one, and for the vocabulary bound every
     clause of it respects, is on GROUND_PROMPT itself.

     THE ENTRY REQUIREMENTS ARE ACT-TIME REFUSALS the store words itself — a
     reason on a RESTRUCTURE, a partition that is total, a label with an
     attributed row — the release precedent: publishing the act says the record
     permits the move, not that this caller's parameters will pass. */
  { id: "inquiryground", label: "Group what this rests on", weight: "single", types: ["inquiry"],
    prompt: GROUND_PROMPT,
    applies: (f, ty) => ty === "inquiry" && (f.basis_legs ?? 0) >= 1
                     && f.current_state !== "published" && f.current_state !== "divided" },
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
  /* PL-2 / IS-2 — THE SIX MEMBER OPS OF THE SIXTH STATE MACHINE.
   *
   * WHY THEY ARE `ACTS` AND NOT `NON_ACTS`, decided rather than assumed, and the
   * paragraph the IS-6 lander wrote above about `airunopen` predicted exactly
   * this: *"what a run eventually proposes IS an act on an object, and it is
   * IS-1's and IS-2's; that act will be an ACTS row, and this one is not it."*
   * The subject of these six is an inquiry's own basis — the question moves in
   * the member's hands when one is taken — which is what an object-directed act
   * is. The three run verbs are not acts because a run *changes NOTHING about*
   * the object it names; these change what the record stands on.
   *
   * THE DERIVATION IS OVER REAL FACTS AND NOT OVER THE TYPE. A question holding
   * no readings publishes none of the six, because the op would refuse
   * NO_SUCH_VERSION and a pre-flight offering a control the refusal it fronts
   * would decline is DEC-8's headline failure — the same reason `inquirydivide`
   * counts basis legs and `retire` counts live cites. The fact is
   * `basis_version_states`, which store.mjs reads from the document; the RULE
   * over it is here, where every other act's rule lives, and `edgesFor` below is
   * the machine's OWN table so this file holds no state list of its own. Grep
   * it: no version-state word appears in any of the six entries.
   *
   * WEIGHT `single` on all six, conclude's precedent: one reading is settled at
   * a time and there is no set to apply. A bulk version would be the checkbox
   * these constructs exist to refuse, and the more so here, because this is the
   * family of acts that decides what a case rests on.
   *
   * NO RUNG on any of them. It is tempting to write `reasoned` on reject and
   * consider because both REQUIRE a reason, and that is exactly the guess RUNGS
   * refuses two blocks up — a rung is a promise to a member about reversibility
   * and no document assigns these six one. FW-14 owns the assignment.
   *
   * THE ENTRY REQUIREMENTS ARE ACT-TIME REFUSALS the store words itself: which
   * version, the authored reason, the legal edge, the transitive cycle at accept,
   * acceptance before make-current, a project that draws on the question. The
   * release precedent — publishing the act says the machine permits the move,
   * not that this caller's parameters will pass. */
  { id: "versionaccept", label: "Accept a reading of the evidence", weight: "single", types: ["inquiry"],
    applies: (f, ty) => ty === "inquiry" && anyVersionEdgeTo(f, "accepted") },
  { id: "versionreject", label: "Turn down a reading (with a reason)", weight: "single", types: ["inquiry"],
    applies: (f, ty) => ty === "inquiry" && anyVersionEdgeTo(f, "rejected") },
  { id: "versionconsider", label: "Set a reading aside for now (with a reason)", weight: "single", types: ["inquiry"],
    applies: (f, ty) => ty === "inquiry" && anyVersionEdgeTo(f, "considering") },
  { id: "versionrevert", label: "Put a reading back to where nobody had acted on it", weight: "single",
    types: ["inquiry"],
    applies: (f, ty) => ty === "inquiry" && anyVersionEdgeTo(f, "suggested") },
  /* MAKE-CURRENT is offered when the question holds a reading a member has
     ACCEPTED, which is the store's own entry requirement (current implies
     accepted, §6 rule 5). Which PROJECT stands on it is the act's parameter and
     the store refuses an unnamed one — the dispose precedent, where the target
     state is a parameter rather than a second act. */
  { id: "versioncurrent", label: "Stand this project on a reading", weight: "single", types: ["inquiry"],
    applies: (f, ty) => ty === "inquiry" && (f.basis_version_states ?? []).includes("accepted") },
  /* HIDE is offered wherever a reading exists AT ALL, in any state, and that
     breadth is deliberate rather than an omission: the prune offer's whole point
     (D-217a) is that accepting one reading offers to hide its ancestors, and a
     rejected reading is exactly the kind a member may want to keep visible or
     may want out of the way. The store gates on nothing but the version
     existing, so narrowing here would be this file inventing a rule the plane
     does not enforce — the cite precedent. */
  { id: "versionhide", label: "Hide a reading from the display (it stays in the record)", weight: "single",
    types: ["inquiry"],
    applies: (f, ty) => ty === "inquiry" && (f.basis_versions ?? 0) >= 1 },
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
  /* PL-12 / D-84, and it belongs BESIDE `strengthbar` because the two are the
     gate/disclose pair DEC-54 (a) exists to keep apart: the bar the group
     declares, and the lens it declares. Both are keyed by a SCOPE — an instance
     or a project — rather than by the object they are later applied to.
     WHY IT IS NOT AN ACT even though it names a bias bundle. This registry is
     what a surface renders as the CONTROLS BESIDE AN OBJECT, and the object
     `op=biasadopt` names is a bias set whose own lifecycle moves through
     `op=promote` like every other bundle's — draft, proposed, adopted are
     ordinary member-authored transitions and appear as such. What `biasadopt`
     writes is the ADOPTION: the authored, attributed, PINNED fact that a scope
     works under that set (DEC-54 c and d). Its subject is the (scope, set) pair,
     which is not a state of either. Publishing it here would put "adopt this
     lens over your project" on the same control strip as dispose and retire —
     the mistake REC-21 records for `queuemute`, one control for a governance
     declaration and a record act. */
  biasadopt: "governance: the authored, attributed adoption that puts a declared-bias set in force for a scope (DEC-54 c/d), keyed by (scope, bias bundle) and not by any object's state — the disclose half of the pair `strengthbar` is the gate half of",
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
  /* IS-6. The three run verbs are NOT acts on a bundle and must not appear on
     one, which is why they are named here rather than added to ACTS. A run is
     keyed by RUN ID; its `context` names an inquiry or a project, but the run
     changes NOTHING about that object — INVESTIGATIVE-SESSION.md §14a is
     explicit that "the state of those objects does not change while the session
     runs, so there is no partial state to reconcile". An act offered beside an
     inquiry implies the inquiry moves when it is taken, and this one does not.
     What a run eventually proposes IS an act on an object, and it is IS-1's and
     IS-2's; that act will be an ACTS row, and this one is not it.
     REC-19's totality guard caught this within a minute of the NEEDS entries
     landing, which is the guard doing exactly what `attest`'s six-item history
     bought it. */
  airunopen: "investigative run lifecycle, keyed by run id: starts a background session in the context of an inquiry or a project and changes NOTHING about that object (§14a)",
  airuntick: "investigative run lifecycle, keyed by run id: the run's own heartbeat, budget spend and observation log — no bundle, no state, no record act",
  airunclose: "investigative run lifecycle, keyed by run id: ends a run and names the bound that stopped it (§14b.6); what the run PROPOSED is a separate act with its own author",
  /* PL-3 / IS-4 — AND THE PREDICTION ABOVE IS ANSWERED HERE RATHER THAN LEFT
     HANGING, because it was half right. The IS-6 lander wrote that *"what a run
     eventually proposes IS an act on an object, and it is IS-1's and IS-2's;
     that act will be an ACTS row"*. It IS an ACTS row — six of them, PL-2's
     accept/reject/consider/revert/current/hide, all published and all
     object-directed. `op=suggest` is not one of them and is not a seventh.
     WHY THIS ONE IS NOT AN ACT. An ACTS row is a thing this record OFFERS A
     MEMBER beside an object: it appears in `op=affordances`, a surface hosts it,
     and `civicos-ui/test/surface-registry.test.mjs` then owes that surface. No
     member presses this. In the background mode a run calls it unattended; in
     the interactive mode (§10) the member's act is "export", performed inside
     the session, and the plane call the session then makes is this one. Offering
     it beside an inquiry would tell a member they may compose a machine
     suggestion by hand, which is not a thing this record does — and would put an
     act on UI-52's register that no item owes a surface for.
     WHAT A MEMBER DOES SEE is the suggestion itself, through `op=basisversions`,
     and the six acts on it. That is where the four beats live. */
  suggest: "the investigative session's ONE write (§4 group 2), keyed by inquiry and run: proposes a reading of the evidence in state suggested. Not object-directed — no member takes it; the six acts ON the proposal are the member-facing ones and they are ACTS rows",
  /* PL-4 / IS-4 — §4 GROUP 1, AND IT IS A NON-ACT FOR EXACTLY op=suggest's
     REASON one line up. The AI REQUESTS acquisition and does not perform it; a
     request is keyed by run and address and changes nothing about any object a
     member is looking at. Offering it beside an inquiry would tell a member they
     may queue an unattended fetch by hand, and would put an act on UI-52's
     ACT REGISTER that no item owes a surface for.
     WHAT A MEMBER DOES SEE is the COMPLETION, and it is not an act either: it is
     a queue CONDITION on D-61's catalogued kind, which a member acknowledges or
     mutes through the queue's own surface. So nothing here is owed a new
     surface, and the register does not grow. */
  capturerequest: "the investigative session's request for a capture (§4 group 1), keyed by run and address: writes a row and fetches nothing — the daemon captures, and DEC-47's conduct is applied at that drain. Not object-directed; the completion reaches a member as a queue CONDITION, not as an act",
  /* PL-11 / IS-5 / D-199 — GOVERNANCE, NOT AN ACT ON AN OBJECT, and the line is
     the same one `memberadd` and `signeradd` already sit on. Minting an agent
     credential decides what an automated worker may reach across the whole
     instance; it is keyed by nothing in the corpus and changes nothing about
     any bundle a member is looking at. Offering it beside an inquiry would be
     an affordance on the wrong noun entirely.
     IT IS STILL A MEMBER ACT AND STILL AUTHORED (D-199 (3)) — a non-act row is
     a statement about what a SURFACE offers next to an object, never about
     whether the record holds a name and a date for what happened. It holds
     both, in `ai_credentials`. */
  aicredentialmint: "creating an agent credential with a declared task scope (D-199): instance-level governance, authored and dated by a member, keyed by nothing in the corpus. Not object-directed — it is the roster ops' territory, not a bundle's",
  aicredentialrevoke: "withdrawing an agent credential (D-199): the narrowing half of the same governance act, recorded against the member who withdrew it. Not object-directed, for the reason its counterpart is not",
};

export const ACT_IDS = new Set(ACTS.map((a) => a.id));

/* The derivation: which acts exist for THIS object as it stands. Pure over the
 * facts the store read, so a suite can hold it to the store's own refusals. */
export function deriveActs(facts) {
  const ty = normalizeType(facts.object_type);
  return ACTS.filter((a) => a.applies(facts, ty));
}
