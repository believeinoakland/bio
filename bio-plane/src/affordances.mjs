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
 * `rung` IS THE INTERACTION-CONSTRUCTS WEIGHT LADDER, AND FW-14 HAS ASSIGNED IT.
 * The ladder is `RUNG_LADDER` below — reversible / reasoned / terminal /
 * attested / IRREVERSIBLE, top rung per DEC-19 as amended, with the correction
 * path published beside it. Every op the DISPATCH TABLE declares mutating either
 * carries a rung in `RUNGS` or is named in `RUNG_ABSENT` with the ground on which
 * it has none, and `test/rung-ladder.test.mjs` asserts that TOTAL IN BOTH
 * DIRECTIONS over an op set derived from `OPS` in index.mjs.
 *
 * CORRECTED 2026-08-08 BY FW-14, and stated rather than quietly reworded. This
 * paragraph used to read *"CAPABILITIES.md measures 7 of 57 mutating ops with a
 * rung assigned by any document … inventing the other 50 here would be the
 * forbidden surface-side map moved one layer down"*. It was RIGHT FOR REC-19 —
 * REC-19 had no licence to assign rungs and refusing to guess was the correct
 * refusal, and it is what routed the question here. Two things about it are now
 * wrong. The FIGURE was never re-measured (the dispatch table declares 84
 * mutating ops, not 57, which is why no count appears in this comment any more —
 * the suite prints it). And the PRINCIPLE has moved on: FW-14's instruction is
 * to derive rungs from what the code already enforces, so a rung read off a
 * refusal the store RAISES is not an invention, it is the enforcement stated.
 * What has NOT changed is the thing that paragraph was protecting: a rung with
 * no backing is still forbidden, and every rung below is asserted against the
 * enforcement or the document that gives it.
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
         /* PL-17 / DEC-65. The third `asserted_by` state and its texts, imported
            from the one module that mints the value — a surface holding its own
            copy of what "nobody claimed this" is called is the same drift every
            import in this list exists to close. */
         SUFFICIENCY_CLAIM_STATES,
         /* SK-7: the four states of a content row's `minted_by`, imported from
            the module that CLASSIFIES the value for the identical reason the
            line above is — a surface holding its own copy of what "a machine
            marked this citable" is called is the drift every import here
            closes, and this one lands on a field 14.4 requires be labelled. */
         CONTENT_MINT_STATES,
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
 * drift this file exists to prevent.
 *
 * ===== CASE-4 / DEC-72, 2026-09-10: `published` LEAVES THIS ARRAY AND THE RULE
 * IT STOOD FOR DOES NOT. Every word of the reasoning above is still true; what
 * is no longer true is that a case-member finding WEARS A STATE. DEC-72 ends the
 * `published` lifecycle state and makes publication THE CASE RELATION, so a
 * published finding now sits at `concluded` — the exact state this array refuses
 * BY NAME. Left alone, that is not a conservative outcome: it would refuse
 * reopening to every published case in the record and leave `op=publish`'s
 * second edition, which DEC-12 requires, with no route to it.
 *
 * So the test in `reopen()` is now a DISJUNCTION and this array is only half of
 * it: reopenable FROM A DISPOSITION (this array, unchanged in meaning), OR
 * BECAUSE THE DOCUMENT IS A CASE MEMBER (the store's own case-relation
 * predicate, which cannot live in this file because it is a query). The
 * `concluded` exclusion is thereby PRESERVED EXACTLY WHERE IT WAS AIMED: a
 * concluded finding that was never published is still refused BY NAME with
 * REC-31's own reason, and only the case relation lifts it. Making the whole of
 * `concluded` reopenable would have been the softening this comment warns
 * against, and it is the over-strictness arm CASE-4's control runs.
 *
 * The array stays exported and stays the refusal's `reopenable:` payload,
 * because it is still the answer to "which states does reopening pick a question
 * up from" — the case relation is not a state and does not belong in it. */
export const REOPENABLE_FROM = [...DISPOSITIONS];

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

/* 2026-09-14, REC-81: every citation into the content framework in this file
 * names a SECTION rather than a line. The line numbers they carried went stale
 * the moment the framework gained front matter — 89 lines, measured — and
 * CORPUS-STANDARD.md §4.6 rules that a citation into a design document names
 * the SECTION. */

/* The union kind vocabulary, reconciled across the two doctrines this one axis
 * serves (D-83): safeguard 4's four SUBJECT kinds, plus the framework's entity
 * kinds (framework §3). Closed and validated at createEntity(), so introducing
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

/* ===========================================================================
 * FW-14 — THE WEIGHT LADDER, ASSIGNED TO EVERY MUTATING OP OR STATED ABSENT.
 *
 * WHAT THIS BLOCK IS FOR, and it is not the ladder. The value here is that
 * EVERY mutating op is ACCOUNTED FOR and a NEW one cannot arrive unclassified.
 * `test/rung-ladder.test.mjs` derives the op set from the DISPATCH TABLE — the
 * `mutating: true` rows of `OPS` in index.mjs, read through the same
 * `readDispatch()` M0-12 reads — and asserts the classification TOTAL IN BOTH
 * DIRECTIONS: no mutating op missing from RUNGS ∪ RUNG_ABSENT, and no key of
 * either naming something the dispatch table does not carry as mutating.
 *
 * THE ABSENCE HALF IS HALF THE DELIVERABLE, not a get-out. An op with no rung
 * and no statement is indistinguishable from an op nobody classified; CLAUDE.md
 * requires that undetermined be STATED. So `RUNG_ABSENT` is a required, checked
 * table, not a fallback — an op reaches `rung: null` only by being named there
 * with a ground.
 *
 * WHAT REPLACED WHAT, stated rather than quietly reworded. The header of this
 * file used to say *"CAPABILITIES.md measures 7 of 57 mutating ops with a rung
 * assigned by any document"* and this block used to say *"do not add a rung
 * without a document that assigns it"*. Both were RIGHT FOR REC-19 and both are
 * now superseded, on FW-14's own instruction to "derive rungs from what the code
 * already enforces": a rung read off a refusal the store RAISES is not a guess,
 * it is the enforcement stated. The figure 57 was also never re-measured — the
 * dispatch table declares 84 mutating ops as of this item, and it is now
 * COUNTED by the suite rather than carried in prose, which is why no number
 * appears in this comment.
 * =========================================================================== */

/* THE LADDER, low to high, and it is PUBLISHED (vocabularies.rung_ladder) so a
 * surface reads the order rather than holding its own copy — DISPOSITIONS'
 * reasoning exactly.
 *
 * DEC-19 AS AMENDED 2026-08-03 IS THE AUTHORITY FOR THE TOP RUNG. Bob:
 * *"Publishing IS an irreversible act! It's (one of?) the only irreversible
 * acts."* Correction is always possible and always moves FORWARD — a new
 * edition (a separate document; all published editions stand), a withdrawal by
 * another attested act (both stand), a finding rescinded to an inquiry by
 * removing its claim. That path is stated BESIDE the rung, never instead of it.
 *
 * `terminal` IS RETAINED, AND THAT IS A JUDGEMENT MADE ON MEASUREMENT — read
 * this before removing it. DEC-19's 2026-08-02 half wrote that `terminal`
 * ("cannot be walked back") "no longer describes anything in the system",
 * reasoning from DEC-12: a published case may be revised as a new edition and a
 * closed finding may be reopened. That reasoning is about the rungs that were
 * then the ladder's TOP TWO. It was never checked against the state machine, and
 * the state machine disagrees: `STATES.information.edges.retired` is `[]`, so
 * `op=retire` moves a bundle to a state with NO outgoing edge and there is no
 * act in this catalogue that walks it back. With `irreversible` restored above
 * it, `terminal` is no longer claiming to be the top of anything — it is the
 * mid-ladder name for exactly what Constructs:161 called it, "internal, cannot
 * be walked back", which is what the code enforces. The rung is asserted against
 * that imported table in `rung-ladder.test.mjs`, so if an edge out of `retired`
 * is ever added this rung fails rather than lying.
 *
 * WHAT SEPARATES THE TOP TWO IS NOT ABSENCE OF CORRECTION but its weight and
 * visibility: an `attested` act cannot be undone SILENTLY (every correction is
 * itself an act with a name and a date on it), and an `irreversible` act's
 * output never stops answering at all. */
export const RUNG_LADDER = ["reversible", "reasoned", "terminal", "attested", "irreversible"];

/* The correction path DEC-19 requires to be stated beside the top rung rather
 * than instead of it. Published with the ladder so a surface that renders
 * "irreversible" cannot render it without the sentence that makes it honest. */
export const IRREVERSIBLE_CORRECTION_PATH =
  "Publishing cannot be undone: what it published never stops answering. Correction always moves "
  + "FORWARD — a further edition (a separate document; every published edition stands), or a "
  + "withdrawal recorded as another attested act, with both standing in the record. Nothing is "
  + "erased, and nothing is un-said.";

/* THE REFUSAL FAMILY THAT BACKS THE `reasoned` RUNG. Constructs:161 defines the
 * rung as "a justification is required and never prefilled", and these are the
 * codes by which the store REQUIRES one. Read as a CLASS and not as one
 * spelling — REC-76's finding, and this table is where it bites: grading
 * `reasoned` by `NO_REASON` alone would have missed `op=release` (which demands
 * an acknowledgment AND a mitigation) and `op=conclude` (a conclusion AND a
 * falsifier), both of which are the same requirement wearing the word the act
 * uses for it.
 *
 * DELIBERATELY NOT IN THIS FAMILY: `NO_TARGET`, `NO_SUCH_*`, `NO_ID`, `NO_KIND`,
 * `NO_LABEL`, `NO_CITATION`, `NO_BODY`, `NO_TITLE`, `NO_BUNDLE_MD`,
 * `NO_SIBLING_DISCLOSURE`. Those demand an OBJECT, an IDENTIFIER, EVIDENCE or a
 * well-formed document — none of them is the member saying why. A family that
 * swept them in would have graded nearly every op `reasoned` and the rung would
 * have meant nothing. */
export const JUSTIFICATION_REFUSALS = [
  "NO_REASON", "VERSION_NO_REASON", "NO_ACKNOWLEDGMENT", "NO_MITIGATION",
  "NO_CONCLUSION", "NO_FALSIFIER", "NO_JUSTIFICATION",
];

/* THE GROUNDS ON WHICH A MUTATING OP HAS NO RUNG. Written ONCE here and pointed
 * at by every op in RUNG_ABSENT, because sixty hand-written near-duplicate
 * sentences are sixty sentences that will drift apart.
 *
 * FOUR OF THESE FIVE ARE ABSENCES OF APPLICABILITY and one is a real
 * undetermined — and the distinction is the most useful thing this item
 * measured. The rung ladder is a property of AN ACT ON THE RECORD: it tells a
 * member what performing it costs to undo. Most mutating ops are not acts on the
 * record at all — they are the machinery, the credential layer, the caller's own
 * scratch state, or an observation — and for those the honest answer is not "no
 * rung yet" but "the ladder does not reach here". `undetermined` is the bucket
 * that DOES mean "no rung yet", and keeping it apart from the other four is what
 * stops a real gap from hiding inside a category error. */
export const RUNG_ABSENCE_GROUNDS = {
  substrate:
    "the machinery a decided act rides on, not a decision. A member never chooses op=promote; they "
    + "choose to conclude, or to retire, and the write path is how that lands. A rung is a promise "
    + "about undoing something a member CHOSE, so there is nothing here to promise.",
  credential:
    "the subject is WHO MAY ACT, not what the record says. Adding a member, minting a machine "
    + "credential or moving a project's roster changes who can write; it writes nothing the record "
    + "asserts. The ladder grades acts on the record, and these are one layer beneath it.",
  "caller-owned":
    "the subject is the caller's own server-side or personal state — a selection is a lease the "
    + "credential that made it owns, a mute is one member's preference about their own feed. None of "
    + "it is in the record, so undoing it costs the record nothing and claims nothing to anybody.",
  observational:
    "the act records WHAT WAS OBSERVED, not what anybody decided. There is nothing to reverse: an "
    + "observation is corrected by observing again, and the earlier observation stays true of the "
    + "moment it was made.",
  undetermined:
    "THIS IS A REAL ACT ON THE RECORD AND IT HAS NO RUNG. No document assigns one and no refusal in "
    + "the plane establishes one, so the honest answer is that it is UNDETERMINED — stated, never "
    + "guessed (CLAUDE.md: undetermined is first-class and must be STATED). Do not read this as "
    + "'light'. Several of these are weighty, and the reason they are undetermined is that the "
    + "ladder as it stands has no rung for an act that is CORRECTED FORWARD but is not signed.",
};

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
  /* FW-14 — THE RUNG LADDER ITSELF, low to high, and the correction path that
     DEC-19 requires to travel with its top rung. Published for the reason every
     vocabulary above is: a surface that renders `rung: "irreversible"` needs to
     know where that sits, and the alternative is every surface holding its own
     copy of the order — the DEC-8 drift class this file exists to close. The
     correction path rides with it because "irreversible" alone is the half of
     DEC-19 that overclaims: a member told an act cannot be undone, and not told
     that correction moves forward, has been misled by the surface.
     Defined once in `RUNG_LADDER` / `IRREVERSIBLE_CORRECTION_PATH` below, which
     `decorateAct` also reads — one array, two readers. */
  rung_ladder: RUNG_LADDER,
  rung_correction_path: IRREVERSIBLE_CORRECTION_PATH,
  rung_absence_grounds: RUNG_ABSENCE_GROUNDS,
  /* PL-17 / DEC-65 — THE THIRD `asserted_by` STATE, PUBLISHED WITH ITS WORDS.
     Published for a reason this file can MEASURE rather than assert: today
     `civicos-ui/app.html`'s grounding receipt renders `Asserted by
     ${g.asserted_by}` VERBATIM, so the moment a field can hold anything but a
     person's name, a surface with no vocabulary prints a machine word at a
     member. That is the defect this whole file closes, arriving in a field
     whose entire subject is not overclaiming.
     A code->text map rather than a list, unlike every vocabulary above it,
     because the states are not interchangeable words a surface picks between —
     each one is a different thing the record is saying about who claimed what,
     and the sentence IS the state's meaning. `sufficiencyClaimState()` in the
     catalogue is what turns a stored value into one of these keys; a surface
     that reads the field itself and matches on the literal has rebuilt the
     predicate. Imported, never restated. */
  sufficiency_claim_states: SUFFICIENCY_CLAIM_STATES,
  /* SK-7 / framework Part II 14.4 (Bob's 5.7) — WHO MARKED A PASSAGE AS
     CITABLE, in words. Published for `sufficiency_claim_states`' reason exactly,
     and the reason is measurable rather than stylistic: `content.minted_by`
     holds an IDENTITY, and from this item that identity can be a machine
     credential's `class:ai/<tokenId>` stamp. A surface with no vocabulary
     renders the stored string, which is how `app.html`'s grounding receipt came
     to print `Asserted by ${g.asserted_by}` verbatim one field over. So the
     plane answers WHICH STATE the row is in and publishes the SENTENCE for it,
     and no surface invents wording for a distinction 5.7 requires be shown.
     A code->text map, not a list, for the same reason its neighbour is one: the
     four states are not interchangeable words a surface picks between — each is
     a different thing the record is saying about who marked this passage, and
     the sentence IS the state's meaning. `contentMintState()` in the catalogue
     turns a stored value into one of these keys, and a surface that matches on
     the literal `minted_by` has rebuilt the predicate; every content-row
     projection already carries the plane's own answer in its `mint` block. */
  content_mint_states: CONTENT_MINT_STATES,
};


/* THE ASSIGNMENT. Every entry carries the source or the enforcement that BACKS
 * it, and every backing is asserted in `rung-ladder.test.mjs` — a rung with no
 * backing is a promise to a member that nothing keeps. */
export const RUNGS = {
  /* ---- irreversible. ONE op, and DEC-19 as amended names it. --------------
     Derived, not spelled: the suite finds it as the op whose DO route is the
     publishing path, so renaming either half fails rather than drifts. */
  publish:            "irreversible",

  /* ---- attested: signed or countersigned, and correctable only by a further
     act that is itself signed. Constructs:275. Both require an authority the
     group does not hold alone — a registered signer's key, a timestamp
     authority's token — which is what `attested` means and what makes these two
     unlike everything below. */
  attest:             "attested",   // Constructs:275 (a CAPTURE act — CAPTURE_ACTS below)
  ratify:             "attested",   // Constructs:275 (publication pre-flight is REC-15's)
  /* CASE-5b / DEC-72: signing the CASE DOCUMENT is `attested` for `ratify`'s own
     reason and not a new one — its authority is a registered signer's key over
     the document's hash, which is a thing the group does not hold by having
     decided something. Same rung, same ladder, a different subject. */
  caseratify:         "attested",

  /* ---- terminal: the target state has no outgoing edge. See the ladder note.
     `op=retire` ALSO raises NO_REASON, so it is `reasoned` at minimum; it is
     declared at the higher rung because the state it writes cannot be left. */
  retire:             "terminal",   // Constructs:244 · STATES.information.edges.retired === []

  /* ---- reasoned: the store refuses the act for want of an authored account.
     The four with a Constructs line keep it; the rest are DERIVED FROM THE
     REFUSAL, which is FW-14's instruction ("derive rungs from what the code
     already enforces") and not an invention — the refusal IS the requirement
     Constructs:161 names. */
  dispose:            "reasoned",   // Constructs:242 · NO_REASON
  release:            "reasoned",   // Constructs:241 · NO_ACKNOWLEDGMENT + NO_MITIGATION
  sever:              "reasoned",   // Constructs:243 · NO_REASON (#edgeTransition)
  reinstate:          "reasoned",   // Constructs:243 · NO_REASON (#edgeTransition)
  conclude:           "reasoned",   // NO_CONCLUSION + NO_FALSIFIER
  reopen:             "reasoned",   // NO_REASON
  inquirydivide:      "reasoned",   // NO_REASON (one authored reason per division, DEC-29)
  inquiryground:      "reasoned",   // NO_REASON
  actionmove:         "reasoned",   // NO_REASON
  discharge:          "reasoned",   // NO_REASON (a lawful skip says why it was lawful)
  proposedispose:     "reasoned",   // NO_REASON (D-79: a finding AGES with a recorded reason)
  relationdeclare:    "reasoned",   // NO_JUSTIFICATION (D-83: relations carry one, NOT NULL)
  projectownerremove: "reasoned",   // NO_REASON
  projectownerrescue: "reasoned",   // NO_REASON
  adminremove:        "reasoned",   // NO_REASON
  /* The version pair whose target state is in VERSION_REASON_REQUIRED. The
     OTHER FOUR version acts route through the SAME `#moveVersionState` and the
     SAME `VERSION_NO_REASON` refusal, and the branch DOES NOT FIRE for them —
     `versionNeedsReason(to)` gates it, and `Store.VERSION_ACT_TO` maps accept →
     accepted, revert → suggested, current → null, hide → null, none of which is
     in the array. A classifier that graded these six by finding the code in the
     shared helper would have promoted four ops to a rung the store does not
     enforce; the suite therefore reads the exported predicate, not the text. */
  versionreject:      "reasoned",   // VERSION_REASON_REQUIRED includes 'rejected'
  versionconsider:    "reasoned",   // VERSION_REASON_REQUIRED includes 'considering'

  /* ---- reversible: the plane PUBLISHES AN ACT THAT TAKES THE RESULT BACK.
     This is the only evidence accepted for this rung, and the reason is
     CLAUDE.md's: an outcome that costs nothing to produce is not evidence, and
     "I found no obstacle" is exactly that. `reversible` is a promise to a
     member, so it is assigned only where another act discharges it.

     `cite` IS C-7's ANSWER AND THE ROW'S CLAIM ABOUT IT HOLDS. The FW-14 row
     says this derivation method already yields C-7's answer; it was CHECKED
     rather than assumed. `cite` writes `{ rel: "cites", status: "confirmed" }`
     and `sever`'s `from` set is `["confirmed", "proposed"]` — so the act that
     takes a citation back accepts exactly what citing wrote. UI-20 recorded
     "C-7 derives reversible" and rendered the rung as ABSENT because FW-14 had
     not assigned it; it is assigned here, and the derivation agrees.
     Note what `reversible` does NOT claim: severing is not erasure — the edge
     stays in the record carrying `status: "severed"` and the member's reason.
     The act is undone; the fact that it happened is not. */
  cite:               "reversible",  // sever accepts the status cite writes
  versionrevert:      "reversible",  // VERSION_MACHINE.edges.suggested reaches every state revert runs from
  versionhide:        "reversible",  // its own inverse: `hidden=false` un-hides (D-214: prune HIDES, never deletes)
};


/* EVERY MUTATING OP THAT CARRIES NO RUNG, WITH THE GROUND. Checked against the
 * dispatch table in both directions by `rung-ladder.test.mjs`: an op that is
 * neither here nor in RUNGS fails the suite BY NAME, and a name here that the
 * dispatch table does not carry as mutating fails it too. Adding an op to
 * index.mjs's OPS with `mutating: true` and neither classifying nor stating it
 * is what this table exists to make impossible.
 *
 * The one-liners say what this op is; the WHY is on the ground above. */
export const RUNG_ABSENT = {
  /* ---- substrate: how a chosen act lands, or how the store maintains itself. */
  promote:              { ground: "substrate", is: "the one write path every act rides" },
  allocid:              { ground: "substrate", is: "id allocation" },
  lease:                { ground: "substrate", is: "the courtesy lock around promote" },
  capture:              { ground: "substrate", is: "byte movement, content-addressed" },
  acquire:              { ground: "substrate", is: "the fetch layer (M2')" },
  linkproject:          { ground: "substrate", is: "admits an observed link as an edge, keyed by capture" },
  cpuprobe:             { ground: "substrate", is: "the CPU probe — a Worker cannot time itself" },
  export:               { ground: "substrate", is: "writes an export manifest of what is already there" },
  taskdrain:            { ground: "substrate", is: "the task scheduler's own tick" },
  capturerequest:       { ground: "substrate", is: "queues a capture; the capture is the act, this is the request" },
  capturerequestdrain:  { ground: "substrate", is: "the capture-request queue's own tick" },
  reproject:            { ground: "substrate", is: "rebuilds the projection from bundles already written" },
  livefire:             { ground: "substrate", is: "the self-test write, scratch-confined" },
  purge:                { ground: "substrate", is: "operator maintenance of the store, not an act on the record" },
  connect:              { ground: "substrate", is: "DERIVES connections from documents already held; re-running re-derives" },
  provenancechain:      { ground: "substrate", is: "rebuilds the provenance register from what is already recorded" },
  provenanceroute:      { ground: "substrate", is: "assesses a route already captured" },
  airuntick:            { ground: "substrate", is: "an AI run's own progress tick" },
  /* CPDF-13 / D-183. THE THREE CALIBRATION WRITES, and they are `substrate`
     rather than absent-for-want-of-thought: a RUNG is a step on the ladder of
     acts that move the RECORD's claims about the civic world, and none of these
     touches a claim. `calibrate` records what a probe measured of a DERIVATION
     ENGINE; `calibrationsubject` says which engine this instance can probe; and
     `calibrationsignal` records that somebody else announced something about
     their own product. What they establish is how far the record may be
     TRUSTED, which is a fact about the instrument and not about the subject.
     AND THE ABSENCE IS LOAD-BEARING RATHER THAN CLERICAL. If `calibrate` carried
     a rung it would be an act that moves the record — and the whole thesis of
     this item is that a measurement NEVER moves a grade, in either direction
     (DEC-4; refused by name at the door as CAL_CANNOT_REGRADE). A rung here
     would say the opposite of what the construct enforces. */
  calibrate:            { ground: "substrate", is: "records what a probe measured of a derivation ENGINE; it moves no claim and no grade (DEC-4)" },
  calibrationsubject:   { ground: "substrate", is: "declares which engine this instance can probe; registering is not measuring" },
  calibrationsignal:    { ground: "substrate", is: "records a vendor announcement; it may only SHORTEN the interval to the next probe and changes no grade" },

  /* ---- credential: who may act, not what the record says. */
  memberadd:            { ground: "credential", is: "roster governance" },
  memberset:            { ground: "credential", is: "roster governance" },
  membercaps:           { ground: "credential", is: "which capabilities a member holds" },
  adminendorse:         { ground: "credential", is: "administrator endorsement of a member" },
  signeradd:            { ground: "credential", is: "signer governance — the KEY, not what is signed with it" },
  signerset:            { ground: "credential", is: "signer governance" },
  governorconfig:       { ground: "credential", is: "operator tuning of the per-host governor" },
  expertisedeclare:     { ground: "credential", is: "a member's own declaration about themselves" },
  expertiseconfirm:     { ground: "credential", is: "administrator act on a declaration" },
  enroll:               { ground: "credential", is: "an invitee becoming a member" },
  knock:                { ground: "credential", is: "an unauthenticated request to be let in" },
  claim:                { ground: "credential", is: "claims an instance at bootstrap" },
  aicredentialmint:     { ground: "credential", is: "mints a machine credential" },
  aicredentialrevoke:   { ground: "credential", is: "revokes a machine credential" },
  projectinvite:        { ground: "credential", is: "roster act on a project, position-enforced by the store" },
  projectjoin:          { ground: "credential", is: "roster act on a project" },
  projectleave:         { ground: "credential", is: "roster act on a project" },
  projectremove:        { ground: "credential", is: "roster act on a project" },
  projectowneradd:      { ground: "credential", is: "roster act on a project" },

  /* ---- caller-owned: the caller's own state, never the record's. */
  select:               { ground: "caller-owned", is: "a server-side selection snapshot, owned by the credential that made it" },
  selectionrelease:     { ground: "caller-owned", is: "releases that selection" },
  queuemute:            { ground: "caller-owned", is: "one member's preference about their own feed (REC-21, D-125)" },
  queuesnooze:          { ground: "caller-owned", is: "one member's preference about their own feed" },

  /* ---- observational. */
  monitor:              { ground: "observational", is: "one tick: what the source serves NOW against what was captured" },

  /* ---- undetermined: REAL RECORD ACTS WITH NO RUNG. This is the list FW-14
     exists to surface, and it is the list a later item should work from.
     THE SHAPE THEY SHARE, and it is worth stating because it is a gap in the
     LADDER rather than in this table: most of them are acts a member performs
     ONCE, which the record keeps attributed and dated, and which are corrected
     by a further act moving FORWARD rather than by anything moving back — and
     they are not signed, so `attested` does not describe them either. DEC-19
     named that property ("cannot be undone SILENTLY") and attached it to the
     rung that requires a key. These acts have the property without the key.
     Assigning them `attested` would claim a signature that does not exist;
     assigning them `reversible` would promise a way back that does not exist;
     so they are stated undetermined and the ladder's gap is named rather than
     papered over. Raised as a provisional at the close of this item. */
  versionaccept:        { ground: "undetermined", is: "adopts a reading of the evidence; the store's own words are that acceptance is a historical fact, corrected by turning it down or reconsidering, never by returning it to something nobody acted on" },
  versioncurrent:       { ground: "undetermined", is: "what THIS PROJECT stands on — the project's own dated declaration (§7); it can be declared again, and each declaration stands" },
  inboxresolve:         { ground: "undetermined", is: "a disposition of a knock, keyed by knock id" },
  taskforward:          { ground: "undetermined", is: "moves a task to another member; assignee-fenced by the store" },
  taskresolve:          { ground: "undetermined", is: "records how a task ended" },
  actioncorrespond:     { ground: "undetermined", is: "records what came back from outside the system — REC-23's counterparty, named or honestly undetermined" },
  projectfork:          { ground: "undetermined", is: "creates a NEW project; the source object is unchanged, and nothing folds a fork back" },
  biasadopt:            { ground: "undetermined", is: "the authored, attributed adoption putting a declared-bias set in force for a scope (DEC-54 c/d)" },
  strengthbar:          { ground: "undetermined", is: "the GROUP's declared default required strength (DEC-17)" },
  entitycreate:         { ground: "undetermined", is: "a registry write introducing a SUBJECT (safeguard 4)" },
  entityalias:          { ground: "undetermined", is: "a registry write adding an alias to an entity" },
  resolve:              { ground: "undetermined", is: "a recogniser write: this reference means this entity, at this grade" },
  resolvetestify:       { ground: "undetermined", is: "recogniser TESTIMONY about a resolution" },
  /* CPDF-10, AND IT IS A CORRECTION OF THIS ITEM'S OWN FIRST ANSWER, recorded
     rather than quietly fixed because the mistake is instructive.
     `attesttext` was first declared `attested`, reasoning from DEC-4's doctrine
     that member attestation is the only route to the top of the transcription
     axis. THE SUITE REFUSED IT — "`attested` is carried by exactly the two acts
     Constructs:275 sources" — and the suite was right: this ladder's `attested`
     is not "the word attest appears in the op name", it is the property stated
     at the rung itself, that the act requires AN AUTHORITY THE GROUP DOES NOT
     HOLD ALONE (a registered signer's key, a timestamp authority's token).
     op=attesttext requires neither. It is a signed-in member saying they looked
     at the image. Declaring it `attested` would have claimed a signature that
     does not exist — and a rung tighter than its rule is not a safer rung, it
     is an undeclared change to what the rung MEANS, wearing the costume of
     caution.
     So it lands in exactly the bucket this block describes: performed once,
     kept attributed and dated, corrected by a further act moving FORWARD, and
     NOT signed. `resolvetestify` directly above is the same shape one axis over
     — recogniser testimony about a resolution — which is why the gap this
     records is the LADDER's and not this table's. */
  attesttext:           { ground: "undetermined", is: "a member's TESTIMONY that a capture's transcribed text matches the page image, over a stated extent; superseded by further testimony, never withdrawn, and never signed" },
  progressiondefine:    { ground: "undetermined", is: "a member's claim about how an institution ought to behave (framework §8.1)" },
  thread:               { ground: "undetermined", is: "threads real documents into a progression instance" },
  airunopen:            { ground: "undetermined", is: "opens an AI run against the record" },
  airunclose:           { ground: "undetermined", is: "closes an AI run" },
  suggest:              { ground: "undetermined", is: "a machine PROPOSES a reading; §6 rule 4 makes it a proposal and never a settlement" },
  /* SK-7, and it lands beside `suggest` directly above for the reason that one
     does rather than beside `attesttext`: marking a passage citable PROPOSES an
     address and settles nothing. The row is an offer — *this part of this
     document is worth pointing at* — and it enters no case until a member's own
     leg names it (framework Part II §14.4, Bob's 5.7). It is corrected FORWARD
     by marking a different extent, never withdrawn: the row is first-class and
     an edge may already depend on it, so `stale` marks and nothing deletes.
     NOT `substrate`: a member (or an assistant on a member's objective) CHOOSES
     to mark a passage, which is precisely what `substrate`'s ground says these
     acts are not. NOT `observational`: nothing here records what was observed;
     it records what somebody thought worth citing. So the honest ground is the
     ladder's own gap — an act on the record, corrected forward, never signed. */
  contentmint:          { ground: "undetermined", is: "marks a PART of a document as citable — an address the record can hold, proposed by a member or by a machine credential and part of a finding only when a member cites it (§14.4)" },
  /* SK-8 — `op=extractpropose`, and the ground is `contentmint`'s directly
     above for its reason, which is the honest one rather than the convenient
     one: no document assigns this act a rung, and the two that might are wrong
     about it in opposite directions. NOT `substrate` — the whole of §7.3 (4) is
     that a run works on a SUBJECT and an OBJECTIVE a member authored and then
     CHOOSES what to propose, which is precisely what `substrate` says these
     acts do not do. NOT `observational` — nothing here records what was
     observed; the observation of where a run LOOKED is the run's log, and this
     act records what the machine thought worth citing, which is a different
     claim about the record. So the ground is the ladder's own gap, stated: an
     act on the record, corrected forward (a proposal is never deleted — IC-83),
     never signed by the thing that made it (C-35.10). */
  extractpropose:       { ground: "undetermined", is: "an EXTRACT run PROPOSES a reading — what the text this record already holds NAMES, carrying an ai(function, version) step, bounded by the run's `mints` allowance and part of a finding only when a member cites it (§7.3)" },
  /* REC-86 / IC-123 — NARROW, and the ground is the ladder's own gap rather than
     `reasoned`, on MEASUREMENT: the act refuses a new reading with no account of
     what changed (C-50.11, `NARROW_NO_DESCRIPTION`), but that code is not in
     `JUSTIFICATION_REFUSALS` and `rung-ladder.test.mjs` grades `reasoned` by that
     class ONLY — widening the class to admit it would be this item re-grading the
     ladder to suit itself. NOT `reversible`: nothing TAKES the reading back; it is
     hidden or rejected by the existing version acts, which records a second act
     rather than undoing the first. The act writes a NEW reading, born `suggested`,
     and moves nothing existing — so it is corrected forward and never signed. */
  narrow:               { ground: "undetermined", is: "a member writes a NEW reading of a question's evidence with one citation pointing at LESS of its document; the old reading and its citation are untouched, and the new one is born suggested (Bob's 5.3)" },
  /* REC-87 / IC-128 — TRANSCRIBE and the attestation of a typing. Ground
     `undetermined` on `attesttext`'s and `narrow`'s measurement: neither act's
     refusals are in `JUSTIFICATION_REFUSALS` (an empty typing, C-52.6, is not a
     missing justification), and widening that class to admit them would be this
     item re-grading the ladder to suit itself. NOT `reversible`: nothing takes a
     typing back — a member types again, which is a DIFFERENT content row, and an
     attestation is superseded by the same attestor's later one, never withdrawn. */
  transcribe:           { ground: "undetermined", is: "a member types what a selected portion of a document says, in their own name; the typing is a content row whose chain is typed(member), its fidelity undetermined and stated until a DIFFERENT member attests it (Bob's 5.2)" },
  transcriptionattest:  { ground: "undetermined", is: "a member's TESTIMONY that ANOTHER member's typing of a portion matches the page; raises what a leg citing that typing may claim, and is refused to the typist themself (C-52.9)" },
  /* MK-1 / IC-133 — TESTIFY. Ground `undetermined` on `transcribe`'s measurement:
     none of its refusals is a missing justification (an empty observation, C-53.3,
     is not one). NOT `reversible`: nothing takes an observation back — a member
     records a new one, never a rewrite (MEMBER-KNOWLEDGE-DESIGN.md section 2). */
  testify:              { ground: "undetermined", is: "a member records a firsthand observation in their own words; it becomes an authored document standing on that member's trust, the author stamped from the session and the words kept exactly as written (D-184)" },
  /* MK-4 / IC-136 — THE LEAD. Ground `undetermined` on `transcribe`'s measurement:
     neither act's refusals are in `JUSTIFICATION_REFUSALS`. NOT `reversible`:
     nothing takes a lead or a look back — a member writes another lead, and a
     later look is a new row, never a rewrite of the earlier one. */
  lead:                 { ground: "undetermined", is: "a member writes a LEAD in their own words — what they were told or suspect, and where it might be found; an authored row that is NEVER evidence and can never be a basis leg (C-54.1)" },
  leadshare:            { ground: "undetermined", is: "a lead's AUTHOR shares it to one project they have joined, an authored dated act; the project's joined participants can then read it and record looks against it (BOB #14, 2026-09-18)" },
  /* REC-126 / DEC-31 — THE REVIEW COPY. The GRANT and its withdrawal are
     `credential`: their whole subject is WHO MAY READ one draft, and they write
     nothing the record asserts. The DRAFT and the COMMENT are `undetermined` on
     `transcribe`'s measurement: none of their refusals is a missing justification,
     and they are NOT `reversible` — a draft is edited in place and a comment is
     answered by another, but no act takes either back. Neither is ever published:
     publication stays the one irreversible act (§6A.1). */
  casedraft:            { ground: "undetermined", is: "the project's owner holds the arguments of a case publication under a draft id BEFORE any gate runs; mutable, never published, the review copy's production (BIO_Publication §6A.4)" },
  reviewgrant:          { ground: "credential", is: "the owner grants one named recipient READ-AND-COMMENT on one draft at one case edition, by a per-grant read secret" },
  reviewrevoke:         { ground: "credential", is: "the owner withdraws a review grant; the secret then answers as one never issued" },
  reviewcomment:        { ground: "undetermined", is: "a recipient (through a live grant) or a member with standing comments on a draft; attributed, and a recipient's comment is recorded as a recipient's" },
  leadlook:             { ground: "undetermined", is: "a member records that they followed a lead and what the look found, as an observation under the lead's authority; a look that finds nothing is recorded as LOOKED_ABSENT, a finding with the lead behind it" },
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
     NO RUNG, AND THE ABSENCE IS NOW STATED RATHER THAN LEFT BLANK (FW-14):
     `RUNG_ABSENT.monitor` carries the ground `observational` — the act records
     what was OBSERVED and not what anybody decided, so there is nothing to
     reverse; an observation is corrected by observing again. The sentence this
     replaces said "no document assigns one, and RUNGS carries only the sourced
     seven", which was true and is no longer the reason. */
  { id: "monitor", label: "Check this source against what was captured" },
  /* op=attesttext (CPDF-10). Capture-directed for `attest`'s reason exactly —
     the subject is a CAPTURE SHA and an extent within it, not a bundle in a
     state — so it lands here rather than splitting the class, which is the
     third reason PROMOTING `attest` INTO `ACTS` was rejected above.
     THE LABEL NAMES THE COMPARISON AND THE SCOPE, because both are the act.
     "Confirm" would be wrong: nothing is being approved. A member is saying
     they looked at the image and the text agrees with it, over the part they
     actually looked at — and a leg citing outside that part does not inherit
     it. A label that hid the scope would invite exactly the over-reading the
     extent exists to prevent.
     RUNG: NONE, on the ground `undetermined` (RUNG_ABSENT below), and the
     reasoning — including why `attested` was tried first and REFUSED — is at
     that entry rather than restated here. Not guessed at this site; no rung is
     guessed anywhere in this file. */
  { id: "attesttext", label: "Attest that this text matches the page image" },
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
  /* CASE-4 / DEC-72, 2026-09-10: `!f.case_member`, and it restores a rule rather
     than adding one. The STATES table's own comment has said since REC-14 that
     `published -> deferred|dismissed` is DELIBERATELY not an edge — *"Ageing is
     what happens to a finding NOBODY published (D-79); a published case cannot
     quietly stop being worked on, because it is already out in the world."* The
     edge table was the enforcement; DEC-72 moves a case member to `concluded`,
     which DOES carry the disposition edges, so the rule had to become a
     condition. The store refuses PUBLISHED_CANNOT_BE_SET_DOWN by name, and this
     clause is what keeps the pre-flight from offering what that refuses. */
  { id: "dispose", label: "Dispose (defer or dismiss)", weight: "refuse", types: ["inquiry"],
    applies: (f, ty) => ty === "inquiry" && !f.case_member
                     && DISPOSITIONS.some((d) => edgesFrom(f).includes(d)) },
  /* REC-13. An inquiry whose machine offers the `concluded` edge — `open`, and
     its `surfaced` alias, and nothing else. Weight `single`, the first act
     published that is NOT selection-backed: one conclusion answers one
     question, so there is no set to apply and no set-application weight to
     report (store.mjs conclude() carries the reasoning; the suite cross-checks
     the word against what the op itself returns). RUNG `reasoned` (FW-14) —
     AND THE SENTENCE THIS REPLACES WAS RIGHT WHEN IT WAS WRITTEN, so it is
     corrected rather than deleted. It read: "NO RUNG: no document assigns one …
     inventing 'reasoned' here because it feels reasoned is exactly the guessing
     this file refuses." That refusal was correct — REC-19 had no licence to
     assign — and the rung is NOT assigned now because it feels reasoned. It is
     assigned because the store REFUSES the act NO_CONCLUSION and NO_FALSIFIER
     without an authored account, which is Constructs:161's definition of the
     rung enforced in code. The suite asserts that backing. The entry requirements (a conclusion, a falsifier, at least
     one basis leg) and the named-member rule are ACT-TIME refusals the store
     words itself, the release precedent: publishing the act says the state
     machine permits the move, not that this caller's parameters will pass.
     CORRECTED 2026-09-17 (REC-117), AND THE RUNG SURVIVES THE CHANGE THAT
     BROKE THE SENTENCE. Bob ruled NO_FALSIFIER overridable, so `store.conclude`
     no longer refuses it unconditionally: a member may conclude with no
     falsifier by DECLARING the absence, which the record then carries in their
     name and with a date. The sentence above is left standing because it is
     still true of NO_CONCLUSION — which is refused unconditionally and has no
     override — and REC-76's finding is what makes that enough: the rung is
     graded by the FAMILY (JUSTIFICATION_REFUSALS, this file, ~line 492) and
     never by one spelling, so an act that still demands an authored account for
     WHAT was concluded is still `reasoned`. What the override changes is the
     ACCOUNT the member must give, never whether one is required: stating that
     no falsifier can honestly be given IS the authored account, and it is
     attributed. The one thing that would drop this rung is an override the
     plane could take SILENTLY, and that is the case C-2.8 and the store both
     refuse by name. */
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
     name (NOT_SET_DOWN) and this list does not offer it. Weight `single`: one
     question is picked back up at a time. RUNG `reasoned` (FW-14) — the line
     this replaces said "rung null for conclude's reasons … no document assigns
     this act a rung", which was true of REC-19 and is superseded by the same
     derivation conclude's is: the store refuses NO_REASON, so an authored
     account is REQUIRED and the rung is that requirement stated.
     EXTENDED AT THE REC-14 MERGE, and the exclusion above is UNCHANGED: the
     FROM set is REOPENABLE_FROM, which adds `published` and still refuses
     `concluded`. A published case's editions are signed and immutable and
     reopening does not unpublish them (DEC-12), so the "reverts a finding with
     no edition recorded" hazard this act was scoped around cannot arise there
     -- and published -> open is the only route to a second edition. The
     reasoning is on REOPENABLE_FROM itself, where both consumers read it. */
  /* CASE-4 / DEC-72, 2026-09-10: THE DISJUNCTION, AND IT MIRRORS `reopen()`'s
     GATE EXACTLY — that is the requirement rather than a coincidence, since a
     pre-flight that could disagree with the refusal it fronts is DEC-8's
     failure. The store now permits reopening from a disposition OR because the
     document is a member of a published case; `REOPENABLE_FROM` lost
     `published` with the state, and `edgesFrom` alone would offer this act on
     EVERY concluded finding, which the store refuses NOT_SET_DOWN with REC-31's
     own reason. */
  { id: "reopen", label: "Reopen", weight: "single", types: ["inquiry"],
    applies: (f, ty) => ty === "inquiry"
                     && (REOPENABLE_FROM.includes(f.current_state) || !!f.case_member)
                     && edgesFrom(f).includes("open") },
  /* REC-14. An inquiry whose machine offers the `published` edge — which is
     `concluded` and nothing else, because a material set cannot be asserted
     over a question with no conclusion. Weight `single`, conclude's precedent:
     one case is published at a time and there is no set to apply.

     RUNG `irreversible` — THE LADDER'S TOP RUNG, AND THIS IS THE ONE OP THAT
     CARRIES IT (DEC-19 as amended, Bob 2026-08-03: *"Publishing IS an
     irreversible act! It's (one of?) the only irreversible acts."*). The
     correction path travels with it and is published as
     `vocabularies.rung_correction_path`, never instead of the rung: a further
     edition is a separate document and every published edition stands, a
     withdrawal is another attested act and both stand, and a finding can be
     rescinded to an inquiry by removing its claim. Nothing is erased.

     THE PARAGRAPH THIS REPLACES WAS RIGHT WHEN IT WAS WRITTEN AND IS KEPT IN
     SUBSTANCE, because its distinction is the one that makes this rung correct
     rather than lucky. It read: "publishing feels like the most `attested` act
     in the system, and `ratify` IS assigned that rung by Constructs:275. But
     this act is not the attestation — it AUTHORS the bytes that are then
     attested … Inventing 'attested' here because it sits next to ratify is
     exactly the guessing this file refuses." That is still true, and it is why
     `publish` is NOT `attested`: it is a rung ABOVE, on a ruling that names it,
     not a rung borrowed from its neighbour.

     The entry requirements (the completeness statement, the exclusion FIELD,
     the declared and justified subject position) and C-21.1's freshness check
     are ACT-TIME refusals the store words itself — the release precedent:
     publishing the act says the state machine permits the move, not that this
     caller's parameters will pass.

     `!f.case_member` IS THE OTHER HALF AND IT IS NOT NEW BEHAVIOUR. Before
     CASE-4 a member of a published case wore `current_state: published`, whose
     edge list carried no `published` destination, so the act was already not
     offered there — and `op=publish` would already have refused it, since
     publishing an unchanged member would mint a second edition of bytes nobody
     revised. The condition is now said instead of falling out of the table. A
     member that HAS been revised (reopened, worked, concluded again) is no
     longer pinned, so `case_member` is false and the act reappears — which is
     exactly DEC-12's second-edition route.

     CASE-4 / DEC-72, 2026-09-10: `edgesFrom(f).includes("published")` WAS THE
     PRECONDITION WEARING A STATE MACHINE'S CLOTHES, and it is now the
     precondition itself. There is no `published` destination in the inquiry
     machine any more, so that expression is FALSE FOR EVERY DOCUMENT — the act
     would have vanished from every affordance answer with the suite green,
     which is the failure mode a state removal produces if nobody looks. The
     condition was only ever true from `concluded` (it was `concluded`'s edge and
     no other state's), so `concluded` IS the expression, said plainly. This is
     the affordance-layer half of the same sentence `publishCase()`'s
     NOT_CONCLUDED refusal carries, and the two must agree: an act this file
     offers that the store then refuses is the pre-flight lying, which is the one
     thing affordances.mjs exists to prevent.

     D-310, 2026-09-10: `f.project_owner !== false` IS THE FOURTH CONDITION, AND
     IT IS THE ONE THIS ACT WAS MISSING RATHER THAN A NEW RULE. DEC-72 clause 5
     — *"Only a project OWNER publishes"* — has been enforced in `publishCase()`
     since CASE-2, which refuses a non-owner BY NAME (`NOT_THE_PROJECT_OWNER`).
     This predicate had no condition on who is asking, so a member who owns no
     project was offered publication on every concluded finding and would be
     refused at the act: the DEC-8 disagreement this file's header calls the one
     thing it exists to prevent, on the heaviest act in the system. CASE-6 found
     it while reading the op path the publication surface calls, and deliberately
     did not half-fix it inside a surfaces item.
     `!== false` AND NOT `=== true`, WHICH IS THE WHOLE OF THE SHAPE. The fact is
     three-valued and the third value is STATED: a machine-class credential holds
     no roster position, so the store answers `null` rather than `false`, and a
     null does not narrow. A machine credential's published act set is therefore
     unchanged by this clause — it is refused publication by a different rule at a
     different level (`MACHINE_CANNOT_PUBLISH`, DEC-49's fence, first in
     `publishCase()`), and a gate that quietly absorbed that second rule would be
     a fence tighter than its rule. Undetermined is first-class here as everywhere.
     AND IT IS "OWNER OF SOME PROJECT", deliberately. The project is a PARAMETER
     of `op=publish`; this file is asked about an INQUIRY and cannot know which
     project a caller will name, so the act says what every act here says — the
     record permits the move, not that this caller's parameters will pass — while
     no longer saying it to somebody for whom NO parameter could succeed. The
     per-pair question (may this viewer publish for THIS project) is a different
     fact and a different item, D-311, argued at NON_ACTS' roster rows below. */
  { id: "publish", label: "Publish (author the case)", weight: "single", types: ["inquiry"],
    applies: (f, ty) => ty === "inquiry" && f.current_state === "concluded" && !f.case_member
                     && f.project_owner !== false },
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
     RUNG `reasoned` (FW-14): the store refuses NO_REASON, one authored reason
     per division (DEC-29), so the requirement Constructs:161 names is enforced
     here and the rung states it. THE OBSERVATION THIS REPLACES IS KEPT BECAUSE
     IT IS STILL THE RIGHT ANALYSIS AND IT DECIDED THE RUNG: "it is tempting to
     write `terminal` here because the parent never moves again — but the parent
     is corrected FORWARD into its children rather than ended, which is not what
     the ladder's `terminal` says." `terminal` is reserved for a state with no
     outgoing edge (op=retire alone); forward correction is not terminality, and
     that distinction is exactly why this act sits at `reasoned` and not above
     it.
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
  /* FOURTH CONDITION, ADDED BY CASE-4 / DEC-72, 2026-09-10, AND IT IS NOT A NEW
     RULE — IT IS AN OLD RULE THAT LOST ITS CARRIER. `op=inquirydivide` has
     refused PUBLISHED_CANNOT_DIVIDE since REC-16, and this predicate did not
     need to say so, because a published case wore `current_state: published`
     whose edge list has no `divided` in it — `edgesFrom` did the work. DEC-72
     ends that state: a case member sits at `concluded`, and `concluded` DOES
     carry the `divided` edge. So without this clause the act is offered on every
     published case and the store then refuses it, which is DEC-8's headline
     failure and was caught by `divide.test.mjs`'s own DEC-8 arm rather than
     reasoned about in advance. */
  { id: "inquirydivide", label: "Divide (split this question)", weight: "single", types: ["inquiry"],
    prompt: DIVIDE_PROMPT,
    applies: (f, ty) => ty === "inquiry" && edgesFrom(f).includes("divided")
                     && !f.case_member
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

     RUNG `reasoned` (FW-14). The line this replaces said "it is tempting to
     write `reasoned` here; that is the guessing this file refuses" — and the
     temptation is no longer what decides it: `groundInquiry` refuses NO_REASON,
     so an authored account is REQUIRED by the store and the rung is that
     enforcement stated rather than a feeling about the act's weight.

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
    /* CASE-4 / DEC-72: `f.current_state !== "published"` became
       `!f.case_member`. The exclusion is unchanged in meaning — a member of a
       signed edition cannot be restructured, and `op=inquiryground` refuses it
       PUBLISHED_CANNOT_RESTRUCTURE — but the state word is gone, so a predicate
       still naming it would offer this act on every published case and the op
       would then refuse it. That is a pre-flight disagreeing with the refusal it
       fronts, which is DEC-8's headline failure and the one thing this file
       exists to prevent. `divided` is untouched: it is still a state. */
    applies: (f, ty) => ty === "inquiry" && (f.basis_legs ?? 0) >= 1
                     && !f.case_member && f.current_state !== "divided" },
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
     fronts — the disagreement this file exists to prevent.

     REC-72 CHANGES NOTHING IN THIS ENTRY AND THAT IS THE POINT, stated so the
     next reader does not go looking for the edit. Widening `op=cite`'s CASE arm
     to admit a question as a MEMBER is a change to which sets the op accepts,
     not to which objects publish the act: an inquiry already published `cite`
     (as a citing object since REC-37, and as a member of somebody else's
     selection all along), and this row was already as wide as the op. What
     REC-72 did move is `sever`/`reinstate` below, because those two were
     NARROWER than the op they front. */
  /* REC-24 (c). An action whose own machine offers ANY onward state — which is
     everything except `resolved` and `abandoned`, and the table says so rather
     than this file listing them. ONE condition and no second: the entry
     requirements (an authored reason; a resolution when the target state is
     `resolved`) are ACT-TIME refusals the store words itself, the release
     precedent carried through conclude and reopen — publishing the act says the
     state machine permits a move, not that this caller's parameters will pass.
     Weight `single`: one action moves at a time and there is no set to apply.
     RUNG `reasoned` (FW-14), AND THE SUPERSEDED LINE IS THE CLEAREST EXAMPLE IN
     THIS FILE OF WHAT CHANGED. It read: "It is tempting to write `reasoned`
     because a reason is required, and that is exactly the guess RUNGS refuses."
     Under REC-19's rule — a rung comes from a DOCUMENT — that was correct.
     FW-14's rule is that a rung comes from what the code ENFORCES, and under it
     "a reason is required" is not a temptation, it is the evidence: the store
     refuses NO_REASON, and Constructs:161 defines `reasoned` as exactly that
     requirement. The same sentence, read against the two rules, gives opposite
     answers — which is why the rule change is written down rather than the
     conclusion alone. */
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
   * RUNGS ON THESE SIX ARE NOT ALL THE SAME, AND THAT IS THE POINT (FW-14). The
   * line this replaces said "NO RUNG on any of them. It is tempting to write
   * `reasoned` on reject and consider because both REQUIRE a reason, and that is
   * exactly the guess RUNGS refuses." The observation was exactly right and is
   * now the derivation: `versionreject` and `versionconsider` ARE `reasoned`,
   * because `VERSION_REASON_REQUIRED` is `['considering', 'rejected']` and the
   * store enforces it through the ONE predicate `versionNeedsReason`.
   * THE OTHER FOUR ARE NOT, AND A TEXTUAL CLASSIFIER WOULD HAVE GOT THIS WRONG:
   * all six route through the same `#moveVersionState` and the same
   * `VERSION_NO_REASON` refusal, so anything grading these ops by finding that
   * code in the shared helper would have promoted four of them to a rung the
   * store does not enforce. `rung-ladder.test.mjs` therefore reads the exported
   * predicate and `Store.VERSION_ACT_TO`, never the helper's text.
   * `versionrevert` and `versionhide` are `reversible` (revert's target state
   * reaches every state it runs from; hide is its own inverse — `hidden=false`).
   * `versionaccept` and `versioncurrent` carry a STATED ABSENCE, ground
   * `undetermined`: acceptance is a historical fact corrected FORWARD and it is
   * not signed, so neither `reversible` nor `attested` describes it, and the
   * ladder has no rung that does. Named rather than guessed.
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
  /* S-11 step 2: withdrawing a citation without deleting it. From the CITED
     side: some CASE holds a live cites edge to it. From the case's own side:
     its references carry a confirmed cites edge.

     REC-72 CHANGED BOTH HALVES OF THE CITED SIDE, and each change is a rule.

     (i) A QUESTION IS NOW A CITED SIDE. `op=cite`'s case arm admits an inquiry
         (REC-72), so a case can draw on a question — and a case that could join
         a question and never leave it is a worse shape than one that can do
         neither, because there would then be no recorded way to stop drawing on
         it. The withdrawal is the same act on the same block of the same
         document, so it is offered wherever the edge can exist.

     (ii) THE FACT IS `cited_by_case` AND NOT `cites_in`, WHICH FIXES A LATENT
          DEC-8 DISAGREEMENT REC-37 LEFT. `#edgeTransition` — the one helper
          behind both these acts — refuses a citing object that is not a project
          (`NOT_A_PROJECT`). `cites_in` counts EVERY citer, and since REC-37 a
          QUESTION also writes `rel: cites` into its own references when it
          takes a basis leg. So an Information cited only by a question published
          `sever` on a target where the op would have refused. Nothing was
          looking for it: every suite's citer was a project. Withdrawing a basis
          LEG is a real gap and it is a different act — it belongs to the basis
          family (`inquiryground`, the version machine), not to this pair, and it
          is reported as a class finding rather than smuggled in here. */
  /* THE FACT IS READ DEFENSIVELY (`?? 0`), the posture every fact added since
     REC-16 takes — `basis_legs`, `rested_on`, `basis_version_states` — and
     REC-72 learned why the hard way rather than by copying a style. `deriveActs`
     is EXPORTED and two suites call it with hand-built facts objects; a fact
     read through a bare `.` threw a TypeError there, `repair-reachability`'s own
     `actsAt` helper SWALLOWED it in a `try/catch` and returned "no acts at any
     state", and its A3 judgement then reported six offenders that do not exist.
     An instrument reporting a wrong number is harder to notice than one
     reporting zero. In the plane the same crash would have taken the whole
     `op=affordances` answer down for every object. Absent reads as ZERO, which
     is the SAFE direction: an act is not published where the fact behind it is
     not known, and DEC-8's rule is about never publishing one the op refuses. */
  { id: "sever", label: "Sever a citation", weight: "refuse",
    types: ["information", "inquiry", "project"],
    applies: (f, ty) => ((ty === "information" || ty === "inquiry") && (f.cited_by_case?.confirmed ?? 0) > 0)
                     || (ty === "project" && f.cites_out.confirmed > 0) },
  { id: "reinstate", label: "Reinstate a severed citation", weight: "refuse",
    types: ["information", "inquiry", "project"],
    applies: (f, ty) => ((ty === "information" || ty === "inquiry") && (f.cited_by_case?.severed ?? 0) > 0)
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
  /* CPDF-10. NOT an object-directed act for `attest`'s three reasons above: the
     subject is a capture sha plus an extent, `affordanceFacts` carries no
     capture, and an applies() writable over those facts would publish the act
     for an information bundle holding no reading — a pre-flight disagreeing
     with the refusal it fronts, which is DEC-8's headline failure. */
  attesttext: "capture-directed: a member attesting that a capture's transcribed text matches the page image, over a stated extent (metadata published in capture_acts)",
  /* SK-7 / framework Part II 14.4 (Bob's 5.7). NOT an object-directed act, and
     NOT capture-directed either — the reason deliberately does not begin
     "capture-directed:", because that prefix is what enrols an op in the
     CAPTURE_ACTS block and this act's subject is a DOCUMENT AND AN EXTENT
     rather than a capture sha. It mints an ADDRESS and writes no edge: nothing
     points at the row until a member's own basis leg names the same passage, so
     there is no bundle state for a surface to offer it against and an applies()
     over `affordanceFacts` would have nothing to read. */
  contentmint: "content-directed: marks a part of a document as citable, keyed by (document, extent); mints an address and no edge",
  /* REC-86 / IC-123. NOT an object-directed act, for `contentmint`'s reason one
     row up: its subject is ONE LEG of ONE READING — (inquiry, version, ordinal) —
     and `affordanceFacts` carries neither readings nor legs, so an applies() over
     those facts would offer it on every inquiry whether or not it holds a reading
     with a leg that has a part to narrow into. The surface that offers it is the
     leg display (UI's, DELEGATED), which is where the leg is in hand. */
  narrow: "leg-directed: makes ONE leg of ONE reading point at less of its document, keyed by (inquiry, reading, ordinal); writes a new reading and moves nothing existing",
  /* REC-86: the candidate list is a READ, on `extractproposals`' reasoning below. */
  narrowcandidates: "read: the machine's proposals for making one leg more specific, keyed by (inquiry, reading, ordinal); labelled machine work and writes nothing",
  /* REC-87 / IC-128. TRANSCRIBE is NOT an object-directed act, on `contentmint`'s
     reason: its subject is a PORTION of a document — (document, extent) — and
     `affordanceFacts` carries no page and no region, so an applies() over those
     facts would offer it on every document whether or not a page was selected.
     The surface that offers it is the page viewer with a region selected (UI's,
     DELEGATED), which is where the portion is in hand. The attestation's subject
     is ONE TYPING, keyed by content id, which is further still from an object. */
  transcribe: "content-directed: a member types what a selected portion of a document says, keyed by (document, extent); mints a content row carrying the typing and writes no edge",
  transcriptionattest: "content-directed: a second member attests another member's typing, keyed by content id; the typist's own attestation is refused",
  transcription: "read: one member's typing by content id — the text, who typed it, who attested it, and what a leg citing it may claim",
  /* MK-1 / IC-133. TESTIFY is NOT an object-directed act: it acts on no existing
     bundle — it CREATES one, from the member's own words — so there is no object
     in a state for `applies()` to offer it against. The surface that offers it is
     Program B's (MEMBER-KNOWLEDGE-DESIGN.md section 8: surfaces are not rowed). */
  testify: "creation: a member records a firsthand observation, which becomes a NEW authored document; acts on no existing bundle",
  /* MK-4 / IC-136. The LEAD is NOT an object-directed act: its subject is a
     member's words about something the record may not hold at all, which is the
     whole point of a lead, so no object's facts could say when to offer it. */
  lead: "member-directed: a member writes a lead in their own words, keyed by nothing the record holds; writes a `leads` row and no edge, and is never evidence",
  leadlook: "lead-directed: a member records following a lead, keyed by lead id; writes one observation_log row under authority_kind lead",
  leadshare: "lead-directed: the lead's author shares it to one project they have joined, keyed by (lead id, project); writes a `lead_shares` row and no edge",
  leadread: "read: one lead by id — its words, its author, and every look recorded against it; readable by its author, by the joined participants of a project it was shared to, and by a machine credential only within a member's minted scope",
  /* SK-8 — THE EXTRACT RUN'S TWO OPS, and the reason they are NON_ACTS is a
     stronger version of `contentmint`'s directly above rather than a weaker one.
     `extractpropose` is keyed by (RUN, document): its subject is a run's
     production, so the thing a surface would have to offer it against is not a
     bundle in a state at all — and `applies()` is handed `affordanceFacts`,
     which holds no run. It is also not something a member performs: a run
     begins on a member's act (`op=airunopen`, itself a NON_ACT below for this
     reason) and the PRODUCTION is the machine's inside it, which is exactly
     what an affordance published against a document would misrepresent.
     `extractproposals` is a READ and nothing in this registry publishes reads. */
  extractpropose: "run-directed: an EXTRACT run's production, keyed by (run, document); the run is the subject and no bundle state offers it",
  extractproposals: "read: what an EXTRACT run proposed, keyed by a run or a document",
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
  /* CASE-5b / DEC-72. A NON_ACT for `ratify`'s reason and ALSO for a reason of
     its own, which is why it gets its own sentence rather than riding the row
     above. Its subject is a CASE EDITION, keyed (case_id, edition) — not a
     bundle in a state — so there is no object for it to appear beside, which is
     the same shape `inboxresolve` and `discharge` carry here. And like `ratify`
     its refusals turn on gate state and on whether a signature verifies, neither
     of which a surface can see in advance. The act the SURFACE offers is
     `op=publish`; this is the signature that act asks for next, and op=publish's
     own answer names it in `next:`. */
  caseratify: "case publication: its subject is a case edition keyed (case_id, edition) rather than a bundle in a state, and its refusals turn on gate state and signature verification a surface cannot see — op=publish's answer names it in `next:`",
  /* REC-126 / DEC-31: THE REVIEW COPY's three authoring acts. Their subject is a
     DRAFT CASE (keyed draft_id) or a GRANT (keyed grant_id) — neither is a bundle
     in a state, so no object's affordance block can publish them, and their
     refusals turn on project ownership the surface reads from the draft itself.
     The UI surface is DELEGATED (CLAIMS.md, REC-126 -> UI) and reads each act's
     answer, which names the next one. */
  casedraft: "review copy: its subject is a DRAFT CASE keyed draft_id, beside publish and never a bundle in a state — the answer names op=reviewcopy",
  reviewgrant: "review copy: its subject is a DRAFT CASE keyed draft_id and its product is a grant keyed grant_id, not a move of any bundle",
  reviewrevoke: "review copy: its subject is a GRANT keyed grant_id, not a bundle in a state",
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
     and op=projectownerarith.

     ── D-310, 2026-09-10 · THE SEVEN STAY, AND IT IS DECIDED HERE RATHER THAN
        DEFERRED AGAIN. The sentence this replaces read "folding them into
        affordances is a later item", which is a NOTE and not an item; it had
        stood since REC-19 with nothing to pick it up. D-310 put the FIRST
        position-gate in this file — the `publish` act now consults
        `f.project_owner` — and gating one act while seven sit here saying
        "position-enforced by the store" is a consequence across the act
        catalogue rather than a line, so it is argued, not skipped. THE DECISION
        IS THAT THEY STAY NON_ACTS; the item that folds them in is **D-311**,
        which exists so the "later item" is a row somebody can pick up.

     (1) THE TWO CASES ARE NOT THE SAME DEFECT, AND THE DIFFERENCE IS THE
         RECORD'S OWN RANKING. `publish` was ALREADY in ACTS with an INCOMPLETE
         derivation: it was offered to callers the store refuses, which is a
         pre-flight claiming more than the plane will honour — the OVERCLAIM
         class this whole record ranks above a missing feature. These seven are
         offered by nothing at all, so no pre-flight is lying about them. A gap
         is not a disagreement, and DEC-8 is about disagreement.
     (2) THEY NEED A DIFFERENT FACT, AND DERIVING THEM FROM D-310's WOULD SHIP A
         CONFUSION THE STORE ALREADY REFUSES. `project_owner` answers "does this
         viewer own SOME project", which is right for `publish` because the
         project is a PARAMETER of that act. Here the project IS the target, so
         the honest fact is the PAIR — `#isProjectOwner(target, viewer)` — and
         `caseproduction.test.mjs` §3 measures the store refusing exactly the
         mistake the loose fact would make: a member who owns one project,
         acting on another she merely joined, is refused. Reusing D-310's fact
         would offer `projectinvite` on EVERY project to anyone who owns any.
     (3) THEY ARE SEVEN POSITIONS, NOT ONE. `projectjoin` is the INVITEE's act
         and an invitee is by definition not an owner; `projectleave` is a joined
         participant's; `projectremove` is an ADMINISTRATOR's (Membership
         Architecture v2 7.7, which gives removal to administrators alone, and
         7.7 is also why owners invite but do not remove); `projectownerrescue`
         has a condition of its own. "Position-enforced by the store" is a
         summary of seven different rules, and each would have to be derived
         from the refusal its own op raises — the way every act above was.
     (4) AND IT IS AN ADDITION WHERE D-310 WAS A NARROWING. The SET of acts this
         file publishes is something consumers build against: putting seven new
         acts into it is an I3 change with its own consumers to measure, and
         pairing it with a narrowing behind one IC row would make neither
         reviewable. IC-75 carries the narrowing alone, which is what lets a
         consumer answer it. */
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
  /* REC-83 / IC-84. A READ keyed by CONTENT ID, and the reason it is not an act
     is the same one op=reading's is, one grain finer: it RESOLVES a referent —
     what this citation points at, what the text under it rests on, who has
     checked it — and resolving is what a surface does before rendering, not
     something a member does TO an object. The acts on a content row are
     elsewhere and each has its own door: minting is op=promote's projection,
     attesting is op=attesttext, and NARROWING a citation (REC-86) is an
     authored act on the INQUIRY. No surface renders a "content" button beside a
     bundle; UI-61 reads it to show a leg's `ref` and jump the viewer to the
     page. */
  content: "read: one content row by content_id — the extent a citation points at, its chain and cap, whether the transcription has moved, and the attestations covering it; the referent a leg resolves through, never an act on an object",
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
