import { DurableObject } from "cloudflare:workers";
/* The catalog's own frontmatter parser. References are read from the document
   with the same code that later checks them, so the store's projection and the
   checker's view cannot disagree about what the document says. */
import { parseFrontmatter, MECHANICAL_FIELD_SETS,
         checkBundle, createSha256,
         /* D-50: 7.1's name key is the CATALOG's one function, held below as `Store.projectNameKey`, so the
            write path's NAME_TAKEN and the catalog's C-77 cannot disagree about what a collision is. */
         projectNameKey,
         /* REC-10: the type mapping and the inquiry state machine come from
            the catalog, so the store's view and the checker's view cannot
            disagree (the same reason this file already imports the catalog's
            parser); the title derivation is C-16's ONE rule, stated once. */
         /* REC-13: vocabFor is the catalog's OWN vocabulary lookup — declared
            spelling first, normalized type as the fallback. op=conclude asks a
            VOCABULARY question ("which state machine governs this document"),
            so it goes through the map like every other consulting site rather
            than reaching into STATES by a raw key. REC-20: the MAP RULE applies
            to op=queue's ancestor walk too — a case's type and state read
            through the same machinery, so a legacy spelling groups identically. */
         normalizeType, LEGACY_TYPE_ALIASES, STATES, OBJECT_TYPES,
         /* REC-11: the basis leg grammar is the catalog's ONE function, run
            here at the write (the checkGatheringGrammar precedent) and by the
            checker, so a malformed leg never lands and the two views cannot
            drift. */
         deriveInquiryTitle, inquiryQuestionOf, checkInquiryBasis,
         /* REC-14: the published vocabulary and the ONE definition of what a
            completeness block ASSERTS, imported so this act's pre-flight and
            C-21.1's gate compare exactly the same fields. */
         SUBJECT_POSITIONS,
         /* REC-16: the id grammar the division's CHILDREN are named under, and
            the two supersession rules — run here at the write (the
            checkInquiryBasis precedent) and by the checker, so a malformed
            supersession never lands and cannot audit clean either. Before this
            item `supersedes` had no producer and no requirements at all. */
         BUNDLE_ID_RE, supersedesEdgeFindings,
         /* REC-51 (2026-08-04): the basis GRADE vocabulary, for the same reason
            BASIS_ROLES is imported one line up, and it arrives one level BELOW
            the doctrine sentences REC-43/REC-48/REC-50 composed. Those three
            items closed statements ABOUT the vocabulary; this file held four
            copies OF it — `["A","B","C","D"]` three times and a rank map
            restating the same letters AND their order — while importing this
            very catalog. They agreed with it at zero cost and would have
            disagreed with it silently the day it changed. The RANK is now
            DERIVED from this array's own order rather than restated, so the
            two cannot disagree at all: see `#GRADE_RANK`. */
         BASIS_GRADES,
         divisionDisclosureFindings,
         /* REC-43 / DEC-39: the capture-axis ceiling, which used to be a static
            field on this class and now lives beside `checkEarnedLeg` — the arm
            that REFUSES a leg claiming more than it — so that the published
            co-attestation fence can be composed from the same value without
            closing an import cycle through affordances.mjs. The reasoning is
            at the declaration, where all three readers can see it.

            REC-48 (2026-08-04) adds UNREACHABLE_CAPTURE_GRADE beside it for the
            same reason one layer on: op=earnedbasis's `ceiling` sentence spelled
            the unreachable letter in its own letters — a FOURTH copy of the
            doctrine, which REC-48's scope had not counted — while the `why:`
            line directly above it already interpolated the ceiling. */
         EARNED_CAPTURE_CEILING, UNREACHABLE_CAPTURE_GRADE,
         /* REC-46 (2026-08-04): the ONE machine-identity predicate, and the ONE
            spelling of the stamp `index.mjs` writes. This file used to answer
            "is this a machine" for itself, ELEVEN times, in two hand-typed
            shapes — `!who || who === "member" || /^token:/.test(who)` at nine
            act guards and `/^token:/.test(actor)` at two more — while the
            catalog answered the same question a third way with a word list that
            knew nothing of the prefix. That is D-164's "solve it once" with
            three unsynchronised answers, and REC-45 measured what it cost: the
            gate accepted `asserted_by: token:member`.
            `isMachineStamp` is the NARROW question (did the control plane mint
            this identity) and `isMachineIdentity` the whole one; the two task
            acts take the narrow one deliberately, and the reason is at those
            sites. `MACHINE_AUTHOR_PREFIX` replaces this class's own copy of the
            literal, which a suite used to prove-by-parsing agreed with
            index.mjs — it is now the same string rather than a proven-equal
            one. */
         isMachineIdentity,
         /* PL-9 / DEC-49: the C-number, the wire code and the canned translation
            for the meaning-grain read's two refusals, as ONE row read from the
            catalog rather than restated here. */
         /* PL-10 / DEC-49: the C-number, the wire code and the canned
            translation for the version chain's three refusals, as ONE row read
            from the catalog rather than restated here. */
         VERSION_CHAIN_CHECKS,
         /* PL-1 / IS-1: the BASIS-VERSION grammar, imported rather than
            reimplemented, so the version rules run at BOTH gates through ONE
            function — a version that cannot land cannot audit clean either,
            which is REC-11's precedent for `checkInquiryBasis` itself.
            BASIS_VERSION_CHECKS supplies DEC-49's row for the ONE refusal a
            pure document check cannot reach: the FREEZE, which needs to see
            what the record already holds under that name. */
         basisVersionFindings, BASIS_VERSION_CHECKS,
         /* PL-2 / IS-2: the SIXTH state machine, its refusals and the ONE
            predicate that says which states carry an authored reason — all
            three IMPORTED. A hand-typed vocabulary in this repository was two
            members short of its catalogue for months after a ruling changed it,
            which is why nothing below re-types a state name. */
         VERSION_MACHINE, VERSION_ACT_CHECKS, versionNeedsReason,
         /* PL-3 / IS-4: §9's five kinds, the four levels the empty-level kind may
            report on, the suggest endpoint's DEC-49 rows, and the ONE
            boilerplate predicate. All four IMPORTED for the reason the block
            above gives — nothing here re-types a vocabulary, because a
            hand-typed one agrees with its author at zero cost. */
         SUGGEST_CHECKS, isBoilerplate,
         /* And the catalog's OWN canonical serializer, used for F10's
            idempotence key rather than a second one written here. */
         canonicalJson,
         /* PL-11 / IS-5 / D-199: the ai credential's DEC-49 rows. The MINT's
            three and the REVOKE's two live here; the gate's four live in
            index.mjs, because what a scope may REACH is a question only the OPS
            table can answer and this file must not keep a copy of it. */
         AI_CREDENTIAL_CHECKS,
         /* REC-64 / UI-38's §14a rider: the run-open door's capability sentence,
            plus the 28 single-homed act-shape refusals this file already made and
            could not explain. Imported rather than re-typed for the reason every
            other line in this import block gives — the catalogue is the ONE place
            a code, its C-number and its canned translation live together. */
         ACT_SHAPE_CHECKS,
         /* MERGED AT INTEGRATION 2026-08-08: PL-11 and PL-14 each appended to
            this import and each ended its own list with `MACHINE_AUTHOR_PREFIX`,
            so the two tails collided textually while agreeing perfectly about
            what is imported. PL-11's list is the longer one — it also needs
            `MACHINE_CLASS_PREFIX` for REC-46's one machine-identity predicate —
            and it is kept whole. Nothing is dropped from either side. */
         MACHINE_AUTHOR_PREFIX,
         /* CASE-5b: the case document's format token, CONSUMED from the catalog
            rather than restated here — the same discipline `MEMBER_ROLES` takes
            against `schema.mjs`. A format string written in two files is a
            format string that drifts, and the gate refuses on the catalog's
            copy while this file writes its own. */
         CASE_DOCUMENT_FORMAT,
         lawProposalLabel } from "../checks/bio-checks.mjs";
import { actionsOf, actionsOps } from "./actions/index.mjs";
/* N216 (K250): the layer-9 modules built with no `from`, constructed on this object's host and their ops dispatched here. */
import { standardsOf, standardsOps } from "./standards/index.mjs";
import { conformanceOf, conformanceOps } from "./conformance/index.mjs";
import { consequencesModule, consequencesOps } from "./consequences/index.mjs";
import { filingsOf, filingsOps } from "./filings/index.mjs";
import { escalationOf } from "./escalation/index.mjs";
import { SCHEMA as SCHEMA_TEXT } from "./schema.mjs";
/* K31: the one write path, extracted to `promotion`; this store registers its share of every promotion there. */
import { promotionOf, stepContext, recordAudit } from "./promotion/index.mjs";
import { provenanceOf, routeFinding, observerRef, TESTIMONY_PATH, PROVENANCE_TABLES } from "./provenance/index.mjs";
import { Membership, membershipOf, membershipOps } from "./membership/index.mjs";
import { observationLogOf, observationLogOps, observationLogOwns, OBSERVATION_LOG_MODULE } from "./observation-log/index.mjs";
import { runProductionsOf, runProductionsOps, runProductionsOwns, posFields } from "./run-productions/index.mjs";
import { captureRequestsOf, captureRequestsOps } from "./capture-requests/index.mjs";
import { recordOf, stampInstant, instantOrder } from "./record-core/index.mjs";
export { stampInstant, instantOrder } from "./record-core/index.mjs";
import { governorOf, governorRoutes } from "./host-governor/index.mjs";
import { captureOf, captureOps, captureOwns } from "./capture/index.mjs";
import { monitoringOf, monitoringOps, monitoringOwns } from "./monitoring/index.mjs";
import { connectionsOf, connectionsOps, connectionsOwns, refsReplacedOf } from "./connections/index.mjs";
import { inquiryOf, inquiryOps, inquiryOwns, legCapped, supersededByOf, LEG_BACKFILL_MAX } from "./inquiry/index.mjs";
import { citationOf, citationOps } from "./citation/index.mjs";
import { extractionOf, extractionOps, extractionOwns, labelTerms, normAlias, refTermSources, CAPTURE_TEXT_UNIT_CAP,
         CAPTURE_TEXT_CAPTURE_BOUND, CAPTURE_TEXT_CAPTURE_UNIT_BOUND } from "./extraction/index.mjs";
import { entitiesOf, entitiesOps, ENTITIES_TABLES } from "./entities/index.mjs";
import { basisVersionsOf, basisVersionsOps, versionsIn, VERSION_ACT_TO, BASIS_VERSIONS_LIMIT_DEFAULT, BASIS_VERSIONS_LIMIT_MAX,
         BASIS_VERSION_LEGS_MAX } from "./basis-versions/index.mjs";
/* D-440: the FORMAT registry's own answer to "does this format walk parts",
   which is what makes a capture an office container (`#containerKindOf`). */
import { getFormat } from "./formats.mjs";
import { sha256hex, instanceAiCredential, instanceClaudeToken } from "./tokens.mjs";
/* REC-35: the intent layer's three closed vocabularies — the refusals below are written here, the array is
   written once there, and op=affordances publishes that same array. A kind this file
   admits and the catalogue does not publish (or the reverse) is not reachable
   by editing one place, which is the whole of the guarantee. */
import { affordancesOf } from "./affordances.mjs";
/* The retrieval surface is compiled, never assembled here. This file executes
   statements and maintains the index; it builds no query. That is what makes the
   D-15 viewer gate a SINGLE compilation point rather than a convention: there is
   no second place in the plane where a query could come from. */
import { compile, textOf, FTS_COLUMNS, GATE_MARK, FIELDS, DEFAULT_FACETS, IDS_MAX, viewerPredicate,
         meaningVocabulary, MEANING, cachedNotes, MEANING_AXIS_CAP } from "./query.mjs";
/* IS-6: the investigative run's vocabulary and its refusals. Pure, for the same
   reason queuestate.mjs is: a rule reachable only through a Durable Object is a
   rule that gets exercised less. `finishedBound` is imported rather than
   re-derived here because the ordinary close and the reaper must compute the
   bound through ONE function — two paths that agree is the failure this
   repository has measured five times. */
import { OBSERVATION_LEVELS, OBSERVATION_STATES, RUN_BOUNDS, RUN_ENDINGS, STANDARD_BASIS,
         /* REC-69: the two kinds of thing a run can be in the context of, as a
            TEXT vocabulary read from `airun.mjs` rather than typed at the one
            site that judges it. `op=airuns` names them back to a caller who got
            it wrong, and a hand copy of two words agrees with itself for free —
            which is the failure this repository has now measured six times. */
         RUN_CONTEXTS,
         checkObservation, checkCondition, checkBound, finishedBound,
         /* REC-93 / IC-92: the observation log's three remaining vocabularies.
            Imported for the reason RUN_CONTEXTS two lines up is imported — a hand
            copy of a word list agrees with itself for free, which this repository
            has now measured six times. `OBSERVATION_AUTHORITY_KINDS` in
            particular is where §4.6's provisional is enforced: there is no value
            in it a member's ad hoc search could take. */
         OBSERVATION_ACTOR_CLASSES, OBSERVATION_AUTHORITY_KINDS, OBSERVATION_SUBJECT_KINDS,
         /* REC-94 / IC-95: the content axis. ONE CONSTANT, and importing it is
            the whole of the mechanism CONDUCT ruled on 2026-09-14 -- REC-92 and
            CPDF-19 import this same object, so a fourth spelling of
            a fourth spelling of any member cannot be written without failing the
            build -- the arm is ABSOLUTE and counts comments too, so this sentence
            names no member either.
            `contentAxisFor` and `contentObservationsFor` are pure and hold the
            whole judgement, exactly as `checkObservation` does for the append
            site: this file puts judged rows in and holds no second opinion about
            what a reading means. */
         CONTENT_AXIS_STATES, CONTENT_AXIS_UNDETERMINED,
         /* REC-113 / IC-116: the coverage claim `op=airunlog` now STATES per row.
            The rule is imported rather than re-spelled here for the same reason
            the content axis is -- `aiRunLog` puts judged rows out and holds no
            second opinion about what an absent referent means. */
         OBSERVATION_COVERAGE, OBSERVATION_COVERAGE_UNDETERMINED, observationCoverage,
         /* BOB #11's correction of 2026-09-15 (`9954a9c`, design section 5.1): a subject
            with no row has THREE causes and they are different facts. The
            vocabulary lives beside the states it qualifies. */
         MISSING_ROW_CAUSES,
         contentAxisFor, contentObservationsFor,
         /* REC-94: the set C-22.2 and C-22.3 already turn on. The content-level
            frontier asks "is this capture below what the fleet can now do" and
            the answer is "its latest state is not definitive" — the SAME
            property, so it is imported rather than re-typed as a list of two
            state names that a sixth state would silently escape. */
         DEFINITIVE_STATES,
         /* REC-95: THE MEANING LEVEL. The three acts of design section 4.3, each
            as a PURE function that decides what one act's outcome IS, so this
            file puts judged rows in and holds no second opinion about what a
            reader run, a resolution attempt or a derivation means —
            `contentObservationsFor`'s arrangement one level up, and
            `checkObservation`'s at the append site.
            `MEANING_MISSING_ROW_CAUSES` is section 5.1's three causes AT THIS
            LEVEL and is keyed identically to `MISSING_ROW_CAUSES` above, so a
            fourth spelling of one of the three fails the suite rather than
            passing review. `MEANING_EVIDENCE_IS_ONE_SIDED` is this level's own
            finding: at two of its three subject kinds the pre-log evidence exists
            only where the answer was YES. */
         MEANING_MISSING_ROW_CAUSES, MEANING_EVIDENCE_IS_ONE_SIDED,
         /* REC-107: the CONTENT level's sidedness in the same shape as the meaning
            level's, and the ONE function both frontier arms widen their cause set
            through. It is imported rather than open-coded at either site for the
            reason every other constant in this list is: `OBSERVATION-LOG-DESIGN.md`
            §8's fourth item is being built as this lands, and a second level
            spelling this rule a second way is the drift. */
         CONTENT_EVIDENCE_IS_ONE_SIDED, causesNotRuledOut,
         /* REC-129 / IC-143: the internet level's sidedness and its empty-answer ladder. */
         INTERNET_EVIDENCE_IS_ONE_SIDED, INTERNET_FRONTIER_EMPTY_CAUSES,
         readerRunObservation, resolutionObservation, derivationObservation, derivationStatement,
         /* FL-8 / IC-67: WHAT BECAME OF THE RUN, decided in `airun.mjs` beside the
            three vocabularies it reads rather than as a ternary here. Imported for
            `finishedBound`'s reason exactly, one field over: this rule had two
            copies inside `#aiRunTerminate` and a THIRD by hand in the fleet
            member's plane mock, and the third had been wrong since FL-7 minted a
            third ending. */
         runStatusFor,
         /* PL-18: the project-membership gate, decided ONCE in `airun.mjs` for all
            three run verbs rather than three times here — DEC-63's ruling that the
            gate is participation and not a capability tier. */
         projectGate,
         /* REC-145: which run contexts the gate consults a project for — one answer, shared. */
         runConsultsProjects,
         /* REC-153: the run's context is the kind it says it is — decided in `airun.mjs`, the facts from here. */
         checkRunContextKind } from "./airun.mjs";
/* REC-152: tick and close are the run's PRINCIPAL's acts — the positional half, decided once in `airun.mjs`.
   Its own import line, so REC-153's edit of the list above and this one cannot collide at integration. */
import { runPrincipalGate } from "./airun.mjs";
import { contradictionOf, contradictionOps } from "./contradiction/index.mjs";
/* D-516 / BOB #33: that rule now answers THREE ways, so the two readers below map an ANSWER to a cause
   word instead of reading a boolean. The words and the band's cause key are imported rather than spelled
   at either site, for the reason the line above gives: the point of D-500 was one rule in one place, and a
   literal `"within_band"` typed at two readers is that rule growing two spellings again. Its own import
   line, for the reason REC-152's gives. */
import { WATERMARK_AFTER, WATERMARK_WITHIN_BAND, WATERMARK_BAND_CAUSE } from "./airun.mjs";
/* REC-169: a figure written into a run's bound is a non-negative integer and never a plane-counted bound's — decided
   once in `airun.mjs`, asked by the tick and by the open's seed. Its own line, for the reason REC-152's gives.
   REC-172: the tick hands it its `consume` whole (`map: true` — a MAP of named bounds) and the open its `bounds`
   whole (`list: true` — a LIST of named bounds, each allowance a whole number): still the one rule, in one place. */
import { checkConsume } from "./airun.mjs";
/* CPDF-10: the transcription provenance chain, IMPORTED and never restated.
   This file projects a chain into columns and records attestations against it;
   it holds no copy of what a chain may claim, which engine weakens what, or who
   may attest — the eleven-copies-of-one-predicate failure REC-46 measured is
   the reason nothing below re-derives any of it. */
import { checkChain, checkAttestation, extentCovers, derivationCap, isTranscribed,
         calibrationsOf,
         /* REC-94: WHICH TIERS A CHAIN EVIDENCES, read off the step kinds' own
            declared tier. It lives in `textchain.mjs` because it is a question
            about a chain and a chain has ONE home -- the same boundary the
            header above draws for `cap` and for `calibrationsOf`. */
         tiersEvidenced,
         /* REC-88 / D-349: DEC-4's own rule, and this is its FIRST CALLER. It
            stood exported and uncalled from CPDF-10 until now, which is what
            made IC-83's *"the leg's capture grade <= captureBound as today"* a
            sentence about a bound nothing computed. Imported rather than
            reimplemented for the reason every other name on this list is: the
            weakest-link arithmetic, the never-raises direction and the
            undetermined-is-null direction have ONE home, and a second copy in
            this file is exactly the drift `textchain.mjs`'s header forbids. */
         captureBound,
         /* FW-17 / IC-86 + D-161: reading POSITION and whether a position falls
            inside a content row's extent. Imported for the reason everything
            above it is — the extent vocabulary is ONE construct and a second
            copy here is the drift D-164 names. */
         readingSourceFromColumns, readingOccurrenceKey,
         readingPositionInExtent,
         /* D-531: whether a unit carries text is a GLYPH question (D-514's
            rule), asked here where the index decides what to write. */
         glyphCount } from "./textchain.mjs";
/* CPDF-13 / D-183 / D-253: THE CALIBRATION CONSTRUCT, imported for exactly the
   reason `textchain.mjs` is imported above — the rules about what a measurement
   must carry, how two measurements compare and what each direction may cause
   have ONE implementation, and this file holds no copy of any of them. The
   asymmetry in particular (a WORSE calibration raises an obligation and
   re-grades nothing; a BETTER one raises nothing) is `drifted`'s and is asked
   rather than restated, because a rule restated at its call site is a rule that
   can come to disagree with itself. */
import { calibrationOf, calibrationOps } from "./calibration/index.mjs";
import { schedulerOf } from "./scheduler/index.mjs";
import { queueOf, queueOps, queueOwns } from "./queue/index.mjs";
import { progressionsOf, progressionOps, PROGRESSIONS_TABLES } from "./progressions/index.mjs";
import { intentOf, intentOps } from "./intent/index.mjs";
import { strengthOf as strengthModule, strengthOps, STRENGTH_AXES, barAxisWords } from "./strength/index.mjs";
import { reevaluationOf, reevaluationOps } from "./reevaluation/index.mjs";
import { reviewOf, reviewOps } from "./review/index.mjs";
import { caseAuthoringOf, caseAuthoringOps, caseAuthoringOwns, withheldWriterStated } from "./case-authoring/index.mjs";
import { ratificationOf, ratificationOps, caseConclusionRowLines, completenessFields } from "./ratification/index.mjs";
import { publicationOf, publicationOps, publicationOwns } from "./publication/index.mjs";
/* SK-1: the doctrine pack's own refusal, imported for the reason every check in
   this file is — the rule has ONE implementation and this file holds no copy of
   it. `skillpack.mjs` is pure; nothing but the check crosses into the store. */
import { checkSkillVersion } from "./skillpack.mjs";
import { biasOf, biasOps } from "./bias/index.mjs";
import { aiRunsOf, aiRunsOps, hiddenRuns } from "./ai-runs/index.mjs";
/* REC-63 / DEC-56: the route marker's four door refusals, imported for the same
   reason every other DEC-49 family is — the C-number, the wire code and the
   canned translation are ONE ROW there and this file holds no second copy. */
import { ROUTE_MARK_CHECKS } from "../checks/bio-checks.mjs";
/* SK-7 / framework Part II 14.4 (Bob's 5.7): WHO MINTED A CONTENT ROW, read in
   one place. The classifier and the sentences live in the catalogue beside
   `SUFFICIENCY_CLAIM_STATES`, whose shape they take, for the reason every
   vocabulary above is imported rather than copied — the label a member reads
   and the predicate a consumer asks must be one row. `CONTENT_MINTED_BY_PLANE`
   is the literal `mintContent` defaults to, taken from there so the stamp and
   the reading of it cannot disagree. */
import { CONTENT_MINT_STATES, CONTENT_MINTED_BY_PLANE,
         contentMintState } from "../checks/bio-checks.mjs";

/* REC-82 / IC-83 / DEC-23 / D-164: THE CONTENT-EXTENT CONSTRUCT, imported for
   the reason `textchain.mjs` above is imported — the extent grammar, the
   canonical form the content address is taken over and the four refusals have
   ONE implementation, in the layer both the CHECKER and this file already
   import, and this file holds no copy of any of them. A second reading of
   "what part of a document does this leg mean" is D-164's own lesson arriving
   inside the construct that exists to close it. */
import { CONTENT_EXTENT_CHECKS, checkContentExtent, legExtent, canonicalExtent,
         describeExtent, contentIdFor, legContentId, contentCitedAs, mintUndetermined,
         contentOf, mintLabel, VERSION_NOTICE_STATES, VERSION_NOTICE_GRADES, CONTENT_TABLES } from "./content/index.mjs";
/* retrieval (K61): the projection, the text index, search, selections, the content axis and the frontier are its; the
 * store delegates to it, registers the later modules' parts with it, and passes it observation-log's services until that
 * module is extracted. */
import { retrievalOf, retrievalRoutes, SELECTION_ID_CHUNK, RETRIEVAL_TABLES } from "./retrieval/index.mjs";
/* REC-97 / IC-90: THE LEG GRAMMAR ITSELF, imported so `op=cite` can route the
   leg it is about to write through the SAME function `checkInquiryBasis` runs
   at C-2.8 and `basisVersionFindings` runs at C-25.10 — REC-84's ONE checker.
   The act composes a leg and asks the catalogue whether it is one; it holds no
   grammar of its own, because a second answer to "is this a legal extent" is
   D-164's own lesson arriving inside the construct built to close it. */
import { checkLegExtentGrammar } from "../checks/bio-checks.mjs";
/* REC-86 / IC-123: NARROW's refusals, its one predicate over two extents, and
   the version-name grammar its new reading must meet (C-25.2's own regex, so a
   name this act accepts is one op=promote accepts). */
import { NARROW_CHECKS, extentRelation, VERSION_NAME_RE } from "../checks/bio-checks.mjs";
/* REC-87 / IC-128: TRANSCRIBE's refusals, and the digest the `typed` step
   carries — the catalogue's own sync sha256, so the text digest and the content
   address are computed by one implementation. */
import { TRANSCRIBE_CHECKS, LEAD_CHECKS } from "../checks/bio-checks.mjs";
/* D-536: a re-read of a capture is COMPARED with the reading before it, and the difference ATTRIBUTED
   to a tier and a member (`readingprov.mjs`, Part II §16 "Reading provenance"). */
import { compareProvenance, PROVENANCE_SCHEME } from "./readingprov.mjs";
/* REC-132 / C-55: the reserved member id's refusal row, and the audit's report of it. */
import { MEMBER_ID_CHECKS, SIGNER_ENROLMENT_CHECKS, CUSTODIAL_CHECKS } from "../checks/bio-checks.mjs";
/* REC-134 / C-56: an act on a project asks the actor's own position in it (SIGHT IS NOT AUTHORITY). */
import { PROJECT_AUTHORITY_CHECKS } from "../checks/bio-checks.mjs";
/* REC-149 / C-70: a DISCOVERABLE project's existence is seen; its doors are not (Membership v2 §7.14). */
import { PROJECT_VISIBILITY_CHECKS, PROJECT_JOIN_REQUEST_CHECKS, PROJECT_CREATION_VISIBILITY_CHECKS } from "../checks/bio-checks.mjs";
/* REC-137 / C-57: a case ratification is signed by an OWNER of the publishing project (DEC-72 cl. 5). */
import { CASE_AUTHORITY_CHECKS } from "../checks/bio-checks.mjs";
/* D-85 / C-66: an assistant opens a question only inside a run it holds (INVESTIGATIVE-SESSION.md §11 item 5, rule 2). */
import { SURFACE_CHECKS } from "../checks/bio-checks.mjs";
/* REC-141 / C-59: the plane mints project ids; a caller-supplied one is refused with one answer. */
import { PROJECT_ID_CHECKS } from "../checks/bio-checks.mjs";
/* D-510: the one refusal of `promote`'s envelope-versus-document check, held in the catalogue with every
   other DEC-49 row so the code, its check number and its canned translation live in one place. */
import { PROMOTED_TYPE_CHECKS } from "../checks/bio-checks.mjs";
/* D-436 / C-64: the instance's producing group, recorded once and never a literal — and the ONE definition of how it
   is written into a document's bytes, which the suites judging a composer's bytes call too. */
/* MK-1 / D-184 / IC-133: the authored bundle's refusals (C-53). */
import { TESTIMONY_CHECKS } from "../checks/bio-checks.mjs";
/* MK-2 / IC-142: the one letter a testimony is worth, composed from the
   catalogue so this file holds no grade-letter literal for it. */
import { TESTIMONY_GRADE } from "../checks/bio-checks.mjs";
/* MK-1 / D-184 / IC-134: THE TESTIMONY PATH'S KEY is provenance's `TESTIMONY_PATH` (a Symbol; imported above). */
/* D-484 / DEC-49 (`BIO_Assistant_and_AI_Roles_v0_1.md` rule 10) — THE TWO
   MULTI-SITE ACT-SHAPE CODES, CONSOLIDATED SO THERE IS ONE SITE.
 *
 * WHY A HELPER RATHER THAN A TRANSLATION AT EACH SITE, and ACT_SHAPE_CHECKS's
 * own header is the argument. A row holds ONE `where`, a `where` names THE
 * SMALLEST SPAN IN WHICH THE ROW'S REFUSAL IS ENFORCED, and one code may not
 * hold two rows — so a code minted at four sites could not be given a row at
 * all, and that header named the honest fix as *"the refusals consolidated
 * behind one helper so there IS one site"* and routed it rather than attempting
 * it. This is that fix for the two codes D-484 names: `NO_BASIS` was minted at
 * four sites and `NO_CITATION` at three, and each now has exactly one. `NO_BASIS`'s is inquiry's `actNoBasis` (N186).
 *
 * THE CODE IS A STRING LITERAL HERE, which is DEC-49's rule and the reason the
 * consolidation works at all: the guard's arm C COMPARES a literal and reads
 * past a variable, and a code held in a variable once shipped
 * `translation: undefined` to a member. Each helper THROWS on a missing row for
 * `admissionRow`'s reason — a throw is a 500 in a test, which is loud, where a
 * missing sentence is silent and reaches a person.
 *
 * ADDITIVE ON THE WIRE (I3). `reason` and every per-site key the callers passed
 * before — `target`, `progression_key`, `version` — are unchanged and still
 * first; `detail` is still the site's own sentence, because the canned
 * translation is the MEMBER's answer and the detail is the caller's. What is new
 * is `code`, `check` and `translation` beside them. No existing reader loses a
 * key it read. */

function actNoCitation(detail, extra = {}) {
  /* DEC-49 REGION is-act-no-citation — D-484 / C-33.41. The ONE site at which the
     plane says a written thing names no source anybody else could go and read: a
     declared entity relation, a revision of a declared flow, an exception
     document discharging a skipped stage. */
  const row = ACT_SHAPE_CHECKS.NO_CITATION;
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error("actNoCitation: NO_CITATION has no ACT_SHAPE_CHECKS row with a canned translation "
                  + "(DEC-49). A code with no sentence behind it must not reach a member.");
  return { ok: false, reason: "NO_CITATION", code: "NO_CITATION", check: row.check,
           translation: row.translation, detail, ...extra };
  /* END DEC-49 REGION is-act-no-citation */
}


/* BIO store, plane layer, step 1.
 *
 * Replaces storeReadAdapter_, storeWriteAdapter_, indexWriteAdapter_ and the
 * Drive traversal helpers from promotion-service.gs (about 890 lines) with SQL
 * against the Durable Object's embedded SQLite.
 *
 * What is deliberately absent, because the plane makes it unnecessary:
 *   - findBundleFolder_ / allBundleFolders_ / typeRootFor_ traversal: a primary
 *     key replaces four type roots and getFoldersByName.
 *   - duplicateBundleIds_ / duplicatePaths_ / duplicatePathError_: the refusal
 *     machinery for Drive's same-name defect. A primary key cannot collide.
 *   - completeInterruptedCreation_ and the .pending manifest-last marker: one
 *     transaction cannot be half applied.
 *   - the deadline, checkpoint, cursor and budget parameters: no execution
 *     ceiling.
 *
 * What is preserved exactly: promotion is the sole writer of live state, the
 * CAS is the lost-update floor, history is append-only, the register is the
 * root of trust, and the gate runs over a byte-complete image.
 */

const INLINE_MAX = 1024 * 1024; // spill to R2 above 1MB; measured hard limit ~2MiB


/* CPDF-10: a column this store WROTE as JSON, read back. Returns null rather
   than throwing on a malformed value, for the reason every read in this file
   tolerates one: a parse that throws inside a projection ends the read with no
   answer at all, and a null that a caller can see is a better finding than a
   500 nobody can attribute. */
const safeJson = (s) => { try { return s == null ? null : JSON.parse(s); } catch { return null; } };

export class Store extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx = ctx;
    this.env = env;
    this.sql = ctx.storage.sql;
    // record-core (R21, R46): the tables legacy-store still owns, declared to purge in the order its purge cleared
    // them. A name is keyed to a bundle by bundle_id; `keys` names the others' (none: only the whole-store purge
    // clears it); `whole` limits what the whole-store purge clears. Each owner declares its own when extracted (K23).
    recordOf(ctx, { evidence: env.CAPTURES ?? null, evidencePrefix: () => `${this.#ownNamespace() || "bio"}/captures/` })
      .declarePurge("legacy-store", [
      "refs", "register", "readings", "reading_refs", "reading_ref_terms", "reading_text_source",
      "text_attestations", "resolutions", "progression_instances", "reading_history", "progression_exceptions", "inquiry_basis",
      "inquiry_exclusions",
      "provenance_route_marks", "case_revision_flags", "content", "transcriptions",
      "transcription_attestations", "lead_shares", "observation_attributions", "theme_placements", "proposed_readings",
      "inquiry_migration_replays", "capture_text",
      { name: "bundles_fts", keys: [] },
      { name: "connections", keys: ["a_bundle_id", "b_bundle_id"] },
      { name: "connection_pair_choices", keys: ["a_bundle_id", "b_bundle_id"] },
      { name: "queue_state", keys: ["case_id"] },
      { name: "published_edges", keys: ["from_bundle", "to_bundle"] },
      { name: "suggest_refusals", keys: ["target"] },
      { name: "case_documents", keys: [], whole: "ratified_at IS NULL" },
      { name: "case_exclusions", keys: [], whole: "NOT EXISTS (SELECT 1 FROM case_documents d WHERE d.case_id = case_exclusions.case_id AND d.edition = case_exclusions.edition)" },
      { name: "capture_text_fts", keys: [] }, { name: "selection_items", keys: [] }, { name: "selections", keys: [] }, { name: "statement_acknowledgements", keys: [] },
      { name: "tasks", keys: [] }, { name: "task_queue", keys: [] }, { name: "source_reachability", keys: [] }, { name: "monitor_tick_epoch", keys: [] }, { name: "monitor_address_type", keys: [] },
      { name: "link_verdicts", keys: [] }, { name: "links", keys: [] }, { name: "captured_locators", keys: [] }, { name: "site_asset_refs", keys: [] }, { name: "site_assets", keys: [] }, { name: "reuse_verdicts", keys: [] },
      { name: "capture_sessions", keys: [] }, { name: "entity_relations", keys: [] }, { name: "entity_aliases", keys: [] }, { name: "entities", keys: [] }, { name: "progression_stages", keys: [] }, { name: "progression_defs", keys: [] },
      { name: "progression_stage_versions", keys: [] }, { name: "progression_def_versions", keys: [] }, { name: "connection_dirty", keys: [] }, { name: "proposal_dispositions", keys: [] }, { name: "finding_dispositions", keys: [] }, { name: "queue_item_mutes", keys: [] },
      { name: "observation_log", keys: [] }, { name: "leads", keys: [] }, { name: "themes", keys: [] },
    ].filter((t) => !captureOwns(t) && !extractionOwns(t) && !PROVENANCE_TABLES.includes(typeof t === "string" ? t : t.name))
      .filter((t) => !PROGRESSIONS_TABLES.some((x) => (x.name || x) === (typeof t === "string" ? t : t.name)))
      .filter((t) => !CONTENT_TABLES.includes(typeof t === "string" ? t : t.name))
      .filter((t) => !ENTITIES_TABLES.includes(typeof t === "string" ? t : t.name))
      .filter((t) => !RETRIEVAL_TABLES.includes(typeof t === "string" ? t : t.name))
      .filter((t) => !observationLogOwns(t))
      .filter((t) => !monitoringOwns(t))
      .filter((t) => !runProductionsOwns(t))
      .filter((t) => !connectionsOwns(t))
      .filter((t) => !caseAuthoringOwns(t))
      .filter((t) => !publicationOwns(t))
      .filter((t) => !queueOwns(t))
      .filter((t) => !inquiryOwns(t)));   /* each extracted owner declares its own (K23) */
    /* K31: promotion, which reaches record-core and membership through their factories on this ctx; legacy-store
       registers its share of every promotion (later modules' checks, projections and facts) until each is extracted. */
    /* provenance (K61): declares its tables and joins every promotion before legacy-store does, so its register write
       runs before the store's projections that read it. observation-log registers its look on each receipt (its R5,
       provenance R47), and listens to extraction's reading notice once extraction exists (below). */
    const observations = observationLogOf(ctx, { extraction: null,
      provenance: provenanceOf(ctx, { signingKey: env.RECEIPT_SIGNING_KEY ?? null, instanceName: env.INSTANCE_NAME || "unnamed" }) });
    /* N39 (K71): the two authorities observation-log's fence delegates (its R13), answered by legacy-store until
       capture-requests (a request's target and lead inquiry) and ai-runs (whether the viewer may read the run) are
       extracted and register their own. */
    const promotion = promotionOf(ctx);
    /* extraction (K31, K61): its projection joins every promotion before legacy-store's (R20). */
    /* content (K61): created on extraction's instance here, so its stale mark (REC-82, its R22) is registered before
     * observation-log's rows (its R6–R8), in the modules' total order (extraction R24). */
    observationLogOf(ctx).listenTo(contentOf(ctx, { extraction: extractionOf(ctx, { env, promotion, calibration: calibrationOf(ctx) }) }).extraction);
    /* entities (K61, R13): observation-log records each resolution attempt on entities' notice (its R8). */
    observationLogOf(ctx).attachMeaning({ entities: entitiesOf(ctx) });
    /* retrieval (K31, K61): its projection and text index join every promotion before legacy-store's step. legacy-store
       registers with it what later modules own until each is extracted (K75 (2), K80, K96): the action facts (actions
       R12, over the clock rule `#actionDerived` reads), the leg grades (strength's earned registry and `#capturedAt`),
       the single-bundle projection's decorations (actions, inquiry, ai-runs), the frontier's hidden-run tail (ai-runs,
       D-486) and the selection sweep's arming (scheduler). */
    const retrieval = retrievalOf(ctx, { now: () => this.#nowMs(null) });
    aiRunsOf(ctx, env);   /* ai-runs (K61) registers with retrieval before legacy-store does, in the modules' order */
    /* reevaluation before actions: actions reaches conformance, which reaches reevaluation, and a factory reads its
       `deps` on the first call only, so created there it would never see `env` (its R25). */
    reevaluationOf(ctx, { env });
    /* publication (K365): built here, after reevaluation, so its case reads are registered with reevaluation (its R41,
       R43; reevaluation R26) before anything runs. Built lazily, a sweep an alarm reached before any op found none. */
    publicationOf(ctx);
    actionsOf(ctx, { env });
    retrieval.registerLegGrades("legacy-store", (legs) => {
      const cap = this.earnedBasisRegistry(null, [...new Set(legs.map((l) => l.target_id))])?.earned?.capture || {};
      return legs.map((l) => Store.#capturedAt(l.grade, cap[l.target_id], l.target_id));
    });
    retrieval.registerProjectionDecoration("legacy-store", (row, { viewer, nowMs }) => {
      /* REC-24 (f)/(g): the ACTION's derived block, computed ON READ against the injectable clock; REC-144: the
         inquiry's no-project conclusion by the one reader op=basisversions uses; D-85: the run it was opened inside
         (a promise: the lens is hashed). Null on every other type. */
      const type = normalizeType(row.object_type);
      const one = {
                    no_project_conclusion: type === "inquiry" ? this.#noProjectConclusionOf(row.bundle_id) : null };
      const migrated = type === "inquiry" ? this.#surfacedIn(row.bundle_id) : null;
      return migrated ? { ...one, surfaced_in: migrated } : one;
    });
    /* connections (K61): its projection of references[] and the fact citedBy join every promotion before legacy-store's
       (R19, R23), and it marks its own dirt on entities' notice (R17). legacy-store registers observation-log's row per
       derivation (its R8) and its derivation statement with connections (R3, R5) until observation-log does. */
    connectionsOf(ctx, { env }).onDerived("legacy-store", (e) => observationLogOf(ctx).observeConnectionDerivation(e));
    connectionsOf(ctx).registerDerivationProvider("legacy-store", (id, o) => observationLogOf(ctx).derivationStatementFor(id, o));
    /* inquiry (K31, K61): its check and projection join promotion before legacy-store's step; strength R28 here. */
    ratificationOf(ctx);   /* ratification (K61): its case catalogue and C-2.8's case-member arm, registered at start (R8, R9) */
    strengthModule(ctx);   /* strength (K61): reaches inquiry and basis-versions itself, and registers its pair (R17) */
    /* bias (K61): joins every promotion before legacy-store (R8–R10). */
    biasOf(ctx, { env });
    /* run-productions (K61, K120): created here, after content, connections, strength and citation, so it declares its
       tables to purge (R17) and registers its candidates with basis-versions (R14). ai-runs is handed over
       as its own module (its R28–R29). */
    runProductionsOf(ctx, { aiRuns: aiRunsOf(ctx, env) });
    reviewOf(ctx);
    intentOf(ctx);   /* intent (K61, K198): its check (R1, R2, R26) joins every promotion before legacy-store's; its audit check keeps C-2.9 (R22) */
    caseAuthoringOf(ctx);
    /* N216 (K250): layer 9, in the modules' order, each registering at start what its factory registers (checks,
       projections, purge, filings' evidence block). standards creates its own tables at construction (N267). */
    const conformance = conformanceOf(ctx);
    const consequences = consequencesModule(ctx, { conformance });
    filingsOf(ctx, { actions: actionsOf(ctx), conformance, standards: standardsOf(ctx), consequences,
                     producingGroup: () => { const f = promotion.fact("producingGroup"); return f.ok ? f.value : null; } });
    escalationOf(ctx);   /* on this host, it reaches conformance, consequences, actions and filings through their factories */
    monitoringOf(ctx, { env });
    promotion.registerStep("legacy-store", { check: (c) => this.#promoteChecks(c), project: (c) => this.#promoteProjections(c) });
    /* capture R44, R55 (K72 (9), K99): legacy-store registers with capture the arming of its own task drain (a scheduler
       consumer, below), and the observation log's rows and the runtime measurement until observation-log and
       instance-setup are extracted. */
    const capture = captureOf(ctx, { env });
    /* capture-requests (K58, K61): its table, its `sweep` resolver and its drain; the run sight it reads is ai-runs'
       (its R28), and it registers its wait source with ai-runs (ai-runs R41). */
    captureRequestsOf(ctx, { env, storeName: () => this.#ownNamespace() || "bio", now: () => this.#nowMs(null),
      runs: aiRunsOf(ctx, env), aiRuns: aiRunsOf(ctx, env) });
    capture.on("observation", "legacy-store", ({ row, at }) => this.#observe(row, at));
    const scheduler = schedulerOf(ctx, env);
    queueOf(ctx, { env });   /* queue (K61): its tables' purge, its two consumers and capture's task notice (R22, R23, R36) */
    ctx.blockConcurrencyWhile(async () => this.#migrate());
    ctx.blockConcurrencyWhile(async () => schedulerOf(ctx, env).start());
  }

  #migrate() {
    const bare = (this.env.SCHEMA || SCHEMA_TEXT || "").split("\n").filter(l => !l.trim().startsWith("--")).join("\n");
    /* Some tables are DERIVED: regenerable by scan, never authoritative, holding
       nothing a member wrote. When one of those changes shape, recreating it is
       correct and an additive ALTER would be the wrong answer, because the new
       column's meaning is part of the KEY and old rows keyed the old way are not
       merely missing a field, they are wrong.
       *
       * links gained citation_norm and fragment when element references became
       * part of a citation rather than a comment on one. A link to #findings and
       * a link to #methodology in one report are two citations, and rows keyed
       * without the fragment had already collapsed them. Those rows cannot be
       * repaired by adding a column; they can only be re-derived from the
       * captures, which is exactly what a derived table is for.
       *
       * This list must never grow to include a table holding first-party
       * material. The test suite asserts the distinction. */
    // captured_locators' own reshape (D-96's `via`) is provenance's, in its migration (PROVENANCE_TABLES).
    /* reading_ref_terms gained `src` (REC-40) when the term's SOURCE became part
     * of the key: a name satisfied by one word of a document's title and one
     * word of its reference string is a correspondence NEITHER string made, so
     * rows keyed without src had already merged two groups that must never be
     * one. Like the two above it is derived -- re-derivable from reading_refs,
     * which persists every string it projects, and holding nothing a member
     * wrote. The backfill below repopulates it with no document re-read. */
    for (const [table, needed] of [["links", "citation_norm"], ["captured_locators", "via"],
                                   ["reading_ref_terms", "src"]].filter(([t]) => !PROVENANCE_TABLES.includes(t))) {
      const cols = [...this.sql.exec(`PRAGMA table_info(${table})`)].map((r) => r.name);
      /* Dropped BEFORE the schema runs, so the CREATE TABLE and CREATE INDEX
         statements below rebuild it in one pass. Dropping afterwards meant the
         schema's CREATE INDEX on the new column hit the OLD table and threw
         inside blockConcurrencyWhile, which does not fail a test, it bricks the
         Durable Object. */
      if (cols.length && !cols.includes(needed)) this.sql.exec(`DROP TABLE ${table}`);
    }

    /* CREATE TABLE IF NOT EXISTS does nothing to a table that already exists, so
       columns added after a store was first written need adding by hand. Done
       here rather than in a versioned migration ladder because these are
       additive and nullable: an older row simply has no writer, which is exactly
       what a hand-authored promotion means. */
    /* REC-143 — THE ADDITIVE COLUMNS ARE ADDED BEFORE THE SCHEMA RUNS, AND AGAIN AFTER IT.
       Every release from 0.59.0 to 0.63.0 BRICKED an existing store: the schema carries
       `CREATE INDEX IF NOT EXISTS inquiry_basis_content ON inquiry_basis(content_id)` (REC-90),
       this list is what adds `content_id` to an `inquiry_basis` written before REC-82, and this
       list used to run AFTER the schema — so on every pre-REC-82 store the index hit the OLD
       table, threw `no such column: content_id` inside blockConcurrencyWhile, and the Durable
       Object answered nothing. It is the failure the DROP loop's note above and the `chain_kind` block
       below both record, arriving through the one list neither of them covered.
       *
       * ONE MECHANISM, NOT A SPECIAL CASE PER COLUMN. The sweep (MEASUREMENTS.md, REC-143) found
       * three schema indexes on a column only this list adds — `inquiry_basis(content_id)`,
       * `inquiry_basis_version_legs(content_id)`, `reading_text_source(calibrations)` — and the
       * next one will be written by somebody who does not know this paragraph exists. So the
       * WHOLE list runs first, for every table that already exists, and nothing a later landing
       * appends to it can reintroduce the defect.
       *
       * THE SECOND PASS, AFTER THE SCHEMA, IS NOT REDUNDANT. A table the schema creates on this
       * boot does not exist during the first pass, and many columns below live ONLY here and not
       * in their table's CREATE (every `bundles` projection column, `members.handle`) — so a
       * fresh store, or an old store gaining a table, gets them from the second pass. Both passes
       * are guarded on PRAGMA and are therefore idempotent on every boot.
       *
       * ORDER WITHIN THIS FUNCTION: after the DROP loop and the published_bundles rename, so a
       * table about to be rebuilt or renamed out of the way is never altered first — a renamed
       * `published_bundles` reads as absent here and gets `delivered_by` from its new CREATE. */
    const ADDITIVE_COLUMNS = [
      ["manifest", "writer", "TEXT"],
      ["manifest", "operation", "TEXT"],
      /* REC-12: the derived strength PAIR, cached per axis. TWO grade columns
         and never one, because a single cached letter is exactly the composed
         scalar DEC-21 forbids and a column is where one would grow. The STATE
         column beside each grade is what tells `unrated` (DEC-18's boundary
         case — nothing on this axis is graded) from `undetermined` (R3 — the
         walk hit its depth bound) from "never projected", which one nullable
         grade column cannot do. Additive and nullable: a bundle that is not an
         inquiry simply has none, and an inquiry promoted before these existed
         has none until its next promotion re-derives them. THE COLUMN IS A
         CACHE AND strengthOf() IS THE AUTHORITY — a stored strength goes stale
         the moment a leg beneath it is raised. */
      ["bundles", "inquiry_capture_strength", "TEXT"],
      ["bundles", "inquiry_capture_state", "TEXT"],
      ["bundles", "inquiry_connection_strength", "TEXT"],
      ["bundles", "inquiry_connection_state", "TEXT"],
      ["bundles", "inquiry_basis_count", "INTEGER"],
      /* REC-18 / DATA-MODEL D1(b): the registry ENTITY this question is about,
         and it is the whole of the subject-entity linkage — one nullable
         projection column, no new table, no join row, no ordinal.
         WHY A COLUMN AND NOT A TABLE. D4's reasoning for giving inquiry_basis
         its own table was that a basis needs an ORDINAL (one document, two
         legs) and a place to put a GRADE. A subject has neither: it is one
         optional scalar fact about one bundle, exactly the shape S-10's
         projection columns exist for, and a table would be a second place to
         state it with nothing extra to hold.
         WHY NOT `refs`. refs targets are BUNDLE ids and an ENT- key is not one;
         widening the universal edge projection to carry registry keys is the
         blast-radius argument D4 already made about grades on edges.
         DERIVED from bundle.md's `subject_entity`, written in the same
         transaction as inquiry_basis by the same discipline (D-21). Nullable
         and additive: a question with no subject entity has none, and DEC-15
         states exactly what that costs — no A/B/C on its connection axis.
         NOT INDEXED, on REC-17's stated reasoning: it is read BY bundle_id
         (the primary key) while building a write's earned registry, and no
         seek anybody makes is on its value. */
      ["bundles", "inquiry_subject_entity", "TEXT"],
      /* REC-17 / P-64: the REVERSE of a `supersedes` edge, so R7's obligation
         is a LOOKUP and not a graph walk. `refs` answers "what does this
         document supersede" because the edge lives on the SUPERSEDING
         document; the question the obligation asks is the other one — "has
         anything superseded THIS?" — and asking it of `refs` means scanning
         for a target rather than reading a row. The column holds the
         superseding ids, comma-joined and sorted, NULL when nothing supersedes
         this bundle. Additive and nullable like every column above: a bundle
         promoted before this existed has none until the boot pass below or its
         next promotion fills it.
         DELIBERATELY NOT INDEXED, and that is not an oversight: this column is
         read BY bundle_id, which is the primary key, so an index on its value
         would serve no seek anybody makes. REC-12's state columns are
         unindexed for the same reason and its comment says so. */
      ["bundles", "inquiry_superseded_by", "TEXT"],
      /* REC-42: `inquiry_basis.ground` is inquiry's migration now (its R36). */
      /* REC-82: `inquiry_basis.content_id` is inquiry's migration now (its R36). */
      /* REC-207: WHICH OF THE THREE ACTS SETTLED THIS DEBT, beside the `cleared_at` D-86 already wrote. The
         full record is `bias_debt_settlements`, append-only, one row per act; this column is what the SWEEP
         reads on its hot path to tell an AUTHORED settlement (a re-run, a member's resolve) from the lens
         having moved back, because the two behave differently when the sweep next sees the same lens delta.
         NULLABLE AND NEVER BACK-FILLED: a debt cleared before this column existed was cleared by the lens
         moving back — that was the only act there was — but writing that in would be back-filling an
         attribution, so it reads UNDETERMINED and `#biasDebtSettlement` says so. */
      ["bias_debts", "settled_kind", "TEXT"],
    ];
    const addColumns = () => {
      for (const [table, column, decl] of ADDITIVE_COLUMNS) {
        const have = [...this.sql.exec(`PRAGMA table_info(${table})`)].map((r) => r.name);
        /* An absent table reads as no columns: it is skipped here and the schema creates it. */
        if (have.length && !have.includes(column)) this.sql.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${decl}`);
      }
    };
    addColumns();


    for (const s of bare.split(";")) { const t = s.trim(); if (t) this.sql.exec(t); }
    membershipOf(this.ctx).migrate();   /* membership's tables (R57–R59), after the schema pass: nothing in the schema text names them */
    provenanceOf(this.ctx).migrate();   /* provenance's tables (R41), likewise: its schema is its own */
    contentOf(this.ctx).migrate();      /* content's tables (R39), likewise, with the chain_kind and cited_as migrations */
    connectionsOf(this.ctx).migrate();  /* connections' tables (R36), likewise, with the pair columns' migrations */
    basisVersionsOf(this.ctx).migrate();   /* basis-versions' tables (R34) and their additive columns */
    inquiryOf(this.ctx).migrate();      /* inquiry's tables (R36), their columns' migrations and the superseded-by backfill */
    governorOf(this.ctx, { env: this.env }).migrate();   /* host-governor's table and its purge exemption (R24) */
    captureOf(this.ctx).migrate();      /* capture's tables, likewise */
    extractionOf(this.ctx).migrate();   /* extraction's tables, their migrations and the name-term backfill (R37) */
    observationLogOf(this.ctx).migrate();   /* observation-log's tables (R22, R23), before the run log folds into them below */
    runProductionsOf(this.ctx).migrate();   /* run-productions' tables (R17) */
    captureRequestsOf(this.ctx).migrate();   /* capture-requests' table, its additive columns and indexes (R35) */
    aiRunsOf(this.ctx, this.env).migrate();   /* ai-runs' two late columns and the ai_run_log fold (its R38) */
    entitiesOf(this.ctx).migrate();     /* entities' tables, R8's withdrawal columns and their purge declaration (R30) */
    contradictionOf(this.ctx).migrate();   /* contradiction's table and its purge declaration (R22) */
    progressionsOf(this.ctx).migrate();   /* progressions' tables and REC-184's column (R29) */
    intentOf(this.ctx).migrate();   /* intent's tables (R24) */

    /* REC-143: the second pass — see ADDITIVE_COLUMNS above the schema for why there are two. */
    addColumns();
    /* classification was REMOVED from the Information catalog on 2026-07-27
       (Bob's decision, recorded in the state doc v30 entry). fact/analysis/
       judgment is a stance a citing project takes toward a passage, not a
       property a document has, so the vocabulary moves to the citation model
       when anchored citations land. Dropped rather than orphaned so a store
       migrated forward and a fresh install present the same table; guarded on
       PRAGMA because this must be idempotent across every boot, and DROP
       COLUMN on a column already gone is an error. Bundle frontmatter still
       carrying the field is inert and drains on each bundle's next promotion;
       history is append-only and keeps it forever, which is correct. */
    const bundleCols = [...this.sql.exec(`PRAGMA table_info(bundles)`)].map((r) => r.name);
    if (bundleCols.includes("classification"))
      this.sql.exec(`ALTER TABLE bundles DROP COLUMN classification`);
    /* The type renames (problem→focus 2026-07-27, focus→inquiry REC-10).
       Normalisation site 2 of 4. The projection is DERIVED, so it is the
       layer the design normalizes: frontmatter in append-only history keeps
       whatever spelling it was written with, and every projection row says
       the canonical type. GENERATED from the catalog's own alias map rather
       than restated, so a fourth name is one catalog entry and zero edits
       here. Idempotent by construction. */
    for (const [legacy, canonical] of Object.entries(LEGACY_TYPE_ALIASES))
      this.sql.exec(`UPDATE bundles SET object_type=? WHERE object_type=?`, canonical, legacy);
    /* REC-12's two axis columns are indexed for the same reason the rest are:
       "every inquiry at B or better on the capture axis" must be a seek. The
       STATE columns are not indexed — they are read WITH a row, never filtered
       across the corpus, and an index nobody seeks on is cost with no reader. */
    retrievalOf(this.ctx).migrate();   /* retrieval's projection columns, text index and selections, and its backfill (K4, R3) */
    for (const c of ["inquiry_capture_strength", "inquiry_connection_strength"])
      this.sql.exec(`CREATE INDEX IF NOT EXISTS bundles_${c} ON bundles(${c})`);

    /* D-432: the opaque minter's ledger learns every gated id that already stands in a live row, and every one the
       counter issued for an untailed gated prefix — LAST, because it reads tables the schema pass above creates.
       Every boot, idempotently; `#seedMintLedger` says what it reads and what it cannot see. */
    recordOf(this.ctx).migrate();
    recordOf(this.ctx).seedMintLedger(Store.#MINT_LEDGER_LIVE);

    /* D-497: the SIGHT INDEX is recomputed from the owners' acts, every boot, AFTER the schema pass creates
       both tables it reads. It is a derivation and never a record, so a full recompute is the honest shape:
       an index that disagreed with `project_visibility` — because a landing changed the rule, or because a
       row was written by a path that did not maintain it — cannot survive a restart. `#reindexProjectSight`
       says what the statement costs. */
    this.#reindexProjectSight();
  }

  /* R16: the superseded-by column read back: inquiry's one parser. */
  static supersededByOf(row) { return supersededByOf(row); }

  /* retrieval (K3, K61): its services, reached by the store's own callers and the old battery through these. */
  reproject(a) { return retrievalOf(this.ctx).reproject(a); }
  projection(a) { return retrievalOf(this.ctx).projection(a); }
  projectionPlan() { return retrievalOf(this.ctx).projectionPlan(); }
  projectionClear(a) { return retrievalOf(this.ctx).projectionClear(a); }
  search(a) { return retrievalOf(this.ctx).search(a); }
  meaningRows(a) { return retrievalOf(this.ctx).meaningRows(a); }
  searchFields() { return retrievalOf(this.ctx).searchFields(); }
  searchIndexCheck(a) { return retrievalOf(this.ctx).searchIndexCheck(a); }
  selectionCreate(a) { return retrievalOf(this.ctx).selectionCreate(a); }
  selectionResolve(a) { return retrievalOf(this.ctx).selectionResolve(a); }
  selectionList(a) { return retrievalOf(this.ctx).selectionList(a); }
  selectionRelease(a) { return retrievalOf(this.ctx).selectionRelease(a); }
  contentAxis(a) { return retrievalOf(this.ctx).contentAxis(a); }
  frontier(a) { return retrievalOf(this.ctx).frontier(a); }

  /** REC-173 (§11 item 5, BOB #30, clause (c)): the `surfaced_in` of a question whose creation was a server-verified
   *  MIGRATION REPLAY — surfaced in the Drive era, not inside a run on this plane — or null. The rest of `surfaced_in`
   *  is ai-runs' decoration (its R27); this arm is inquiry's (map §5.8) and answers here until inquiry is extracted. */
  #surfacedIn(bundleId) {
    const mig = this.#one(
      `SELECT capture_sha, promotion_key, at FROM inquiry_migration_replays WHERE bundle_id=?`, bundleId);
    return mig ? { recorded: false, stated: "not recorded (migrated from the Drive era)", run: null, lens: null,
                   migrated: { capture: mig.capture_sha, promotion: mig.promotion_key ?? null, at: mig.at } } : null;
  }


  /* The producer-side arm for the connection-derive consumer: a resolve that
     dirtied an entity reconciles the alarm to include the sweep's wake. Mirrors
     #armSweep / #armDrain — it only SCHEDULES, it never derives, so the
     producer/consumer split holds (the sweep is the sole writer of connections on
     this path). */
  async #armConnectionDerive() { return await this.#armScheduler(); }
  static SELECTION_ID_CHUNK = SELECTION_ID_CHUNK;   /* retrieval's bound on an id list one statement binds */

  async alarm() { await schedulerOf(this.ctx, this.env).alarm(); }
  async onAlarm(now) { return await schedulerOf(this.ctx, this.env).onAlarm(now); }
  async #armScheduler(now) { return await schedulerOf(this.ctx, this.env).arm(now); }
  async schedProbeArm(now) { return await schedulerOf(this.ctx, this.env).probeArm(now); }
  async schedProbeLog() { return await schedulerOf(this.ctx, this.env).probeLog(); }
  async schedAlarmAt() { return await schedulerOf(this.ctx, this.env).alarmAt(); }

  static EDGE_REASON_MAX = 160;
  /* Longer than a reason, because a release acknowledgment is a statement of
     what was weighed and what was checked, not a label. Same forbidden
     characters, because it is spliced into the Session Log and must stay one
     line per field. */
  static RELEASE_ACK_MAX = 500;
  /* R20–R22, R39: disposing a selection of inquiries: inquiry's. */
  dispose(...a) { return inquiryOf(this.ctx).dispose(...a); }
  #refEdgeSevered(...a) { return connectionsOf(this.ctx).edgeSevered(...a); }


  #citesInto(id) { return connectionsOf(this.ctx).citesInto(id); }


  /* publication (T8, K3): the published registries and the attribution reads are publication's; the store's callers not
     yet extracted, and the old battery, reach them here. */
  publishedRegistryFor(...a) { return publicationOf(this.ctx).publishedRegistryFor(...a); }
  publishedCaseRegistryFor(...a) { return publicationOf(this.ctx).publishedCaseRegistryFor(...a); }
  observationsNamingAuthor(...a) { return publicationOf(this.ctx).observationsNamingAuthor(...a); }
  attributionStatedFor(...a) { return publicationOf(this.ctx).attributionStatedFor(...a); }

  /* REC-181: RETIREMENT'S ONE CITATION PREDICATE, shared by `retire` and by
   * `promote`'s transition into `retired`. §4.1 of State Rules v1.5 (BOB #30):
   * a retired item is not citable, and the terminal transition refuses while a
   * live edge cites it (`CITED`). `retire` asked it; `promote` — the ONE write
   * path, which `retire` itself calls — did not, so a caller holding
   * `contribute` could walk verified -> retired by `op=promote` with live legs
   * still resting on the item, the state retire exists to refuse. Both doors
   * now ask THIS, so they cannot answer differently. */
  static RETIRE_CITED_DETAIL = "these are still cited by live edges. Retiring them would leave those Projects "
    + "pointing at retired material, which C-6.2 treats as an error whose remedy is to "
    + "sever the edge with a reason. Sever first, then retire.";
  #retirementCitedBy(id) {
    return this.#citesInto(id).confirmed;
  }

  /* S-11 step 4: bulk RETIREMENT of Information, weight `refuse`.
   *
   * Heavier than step 3's disposition for one structural reason: `retired` is
   * TERMINAL in the catalog's table (collected -> verified -> retired, and
   * retired -> nothing), where every Problem disposition is reversible. A wrong
   * disposition is corrected by disposing again. A wrong retirement cannot be
   * undone through the state machine at all, so every refusal here is worth more
   * than the equivalent refusal there.
   *
   * TWO GUARDS, and the second is the doctrinal one.
   *
   * First, only `verified` -> `retired`, because that is the only legal edge.
   * Retiring something merely `collected` would skip the step where a human
   * looked at it, which is precisely what the intake doctrine exists to
   * protect.
   *
   * Second, INFORMATION A PROJECT STILL CITES IS REFUSED. Nothing in the catalog
   * stops this, and that is why it matters: C-6.2 treats an unresolvable
   * reference target as an ERROR whose remediations are "restore target from
   * history", "re-point to the successor", or "sever the edge with a reason
   * note". A bulk retirement that silently stranded live citations would
   * manufacture exactly that error condition at whatever scale the operator
   * happened to select. The citing Projects are NAMED, because an operator told
   * only "refused" cannot act, and severing is C-6.2's own remedy.
   *
   * A SEVERED edge does not count as a citation. Severing is the recorded
   * decision to stop relying on something, so treating a severed edge as a live
   * dependency would make the refusal unclearable by the very act doctrine
   * prescribes for clearing it. */
  retire({ handle, reason = "", viewer = null, owner = null, author = null } = {}) {
    const why = String(reason ?? "").trim();
    if (!why)
      return { ok: false, reason: "NO_REASON",
               detail: "retirement is terminal in the state machine, so it records WHY. There is no move "
                     + "back out of retired, and an unexplained one-way change is not a record." };
    if (why.length > Store.EDGE_REASON_MAX || /["\\\r\n]/.test(why))
      return { ok: false, reason: "BAD_REASON",
               detail: `a reason is at most ${Store.EDGE_REASON_MAX} characters and cannot contain a quote, `
                     + `a backslash, or a newline` };

    const sel = this.selectionResolve({ handle, viewer, owner, weight: "refuse" });
    if (!sel.ok) return sel;
    if (!sel.members.length)
      return { ok: false, reason: "EMPTY_SELECTION", handle, drift: sel.drift,
               detail: "this selection resolves to no members, so there is nothing to retire" };

    const notInfo = [], illegal = [], cited = [];
    for (const id of sel.members) {
      const b = this.#one(`SELECT object_type, current_state FROM bundles WHERE bundle_id=?`, id);
      if (!b || b.object_type !== "information") { notInfo.push(id); continue; }
      if (b.current_state !== "verified") { illegal.push({ id, from: b.current_state }); continue; }
      /* Live citations only, through the ONE #citesInto predicate (shared with
         op=affordances, which publishes retire's availability from it): a
         severed edge is a recorded decision to stop relying and does not block. */
      const citedBy = this.#retirementCitedBy(id);
      if (citedBy.length) cited.push({ id, citedBy });
    }
    if (notInfo.length)
      return { ok: false, reason: "NOT_INFORMATION", offenders: notInfo.sort(),
               detail: "retirement moves an Information state, and this selection carries something else. "
                     + "The set is refused whole rather than narrowed." };
    if (illegal.length)
      return { ok: false, reason: "ILLEGAL_TRANSITION", to: "retired",
               offenders: illegal.sort((a, b) => a.id < b.id ? -1 : 1),
               detail: "only verified Information may be retired. Something still collected has not been "
                     + "verified by anyone, and retiring it would skip that step; something already "
                     + "retired has nowhere further to go, because retired is terminal." };
    if (cited.length)
      return { ok: false, reason: "CITED", offenders: cited.sort((a, b) => a.id < b.id ? -1 : 1),
               detail: Store.RETIRE_CITED_DETAIL };

    const when = stampInstant("second");
    const retired = [];
    for (const id of sel.members) {
      const liveMd = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, id);
      const cur = this.#one(`SELECT bundle_sha, current_state FROM bundles WHERE bundle_id=?`, id);
      if (!liveMd || liveMd.content === null)
        return { ok: false, reason: "NO_DOCUMENT", bundleId: id, retiredSoFar: retired };
      let text = liveMd.content;
      const withHistory = Store.#appendStateHistory(text, {
        timestamp: when, from_state: cur.current_state, to_state: "retired",
        blurb: why, author: author || "member" });
      if (!withHistory)
        return { ok: false, reason: "UNSPLICEABLE_STATE_HISTORY", bundleId: id, retiredSoFar: retired,
                 detail: "this document's state_history block cannot be extended in place, and a "
                       + "retirement recording no transition would leave prior_state pointing at a "
                       + "history the document does not carry (C-4.2)" };
      text = withHistory;
      text = Store.#setScalar(text, "prior_state", cur.current_state);
      text = Store.#setScalar(text, "current_state", "retired");
      text = Store.#setScalar(text, "last_updated", `"${when}"`);
      const entry = `### Session ${when} | Retired | ${author || "member"}\n`
                  + `Trigger: selection ${handle}\n`
                  + `Changes: state ${cur.current_state} to retired. Reason: ${why}.\n`;
      const at = text.indexOf("## Session Log");
      if (at < 0) text += "\n## Session Log\n\n" + entry;
      else {
        const nxt = text.indexOf("\n## ", at + 1);
        const cutAt = nxt === -1 ? text.length : nxt + 1;
        text = text.slice(0, cutAt) + entry + "\n" + text.slice(cutAt);
      }

      const carried = [];
      for (const r of this.sql.exec(
        `SELECT path, content, blob_sha, sha256, bytes FROM files WHERE bundle_id=? AND path<>'bundle.md'`, id))
        carried.push(r.content !== null
          ? { path: r.path, text: r.content, bytes: r.bytes, sha256: r.sha256 }
          : { path: r.path, blobSha: r.blob_sha, sha256: r.sha256, bytes: r.bytes });

      const bytes = new TextEncoder().encode(text);
      const fm = parseFrontmatter(text).data || {};
      const promoted = this.promote({
        bundleId: id, base: cur.bundle_sha, snapKey: `${when.replace(/[-:]/g, "")}_${Store.#rand(4)}`,
        author: author || "member",
        files: [{ path: "bundle.md", text, bytes: bytes.length,
                  sha256: createSha256().update(bytes).hex() }, ...carried],
        meta: { object_type: "information", title: fm.title,
                current_state: "retired", prior_state: cur.current_state,
                created: fm.created, last_updated: when,
                criticality: fm.criticality ?? null },
      });
      if (!promoted.ok) return { ...promoted, bundleId: id, retiredSoFar: retired };
      retired.push(id);
    }
    return { ok: true, reason: why, handle, retired: retired.sort(), weight: "refuse", drift: sel.drift };
  }

  /* S-11 step 5, the last rung of the ladder: bulk RELEASE of Information,
     collected -> verified over a selection, weight `refuse`, whole set or
     nothing. Decided by Bob 2026-07-27 and specified in Intake Doctrine v1.2:
     what legitimizes a bulk release is volume plus little-to-no variance in the
     trustworthiness of the collection, whatever origin brought it in, because
     verification asserts only that a document APPEARS to be what it claims to
     be, never accuracy.

     Four properties carry the doctrine:
     1. A NAMED MEMBER authors it. The author stamp arrives from the session;
        a machine credential's stamp is `token:<class>` and is refused by
        shape, because the collected-to-verified transition is a member's
        decision (section 4, C-18.1), whatever else machines may prepare.
     2. The ACKNOWLEDGMENT IS A RECORD, not a dialog. The member's explicit
        acknowledgment of the batch's homogeneity and the mitigation steps
        they actually took are required parameters, refused when absent, and
        written into every released document's Session Log, so a batch release
        is permanently distinguishable from a per-document one.
     3. CRUCIAL NEVER RIDES A BATCH. Ratifying crucial-criticality material
        requires verifying its co-attestations (doctrine section 3, F4), which
        is per-document work, and a batch containing crucial material is by
        definition not a low-variance collection.
     4. NOTHING VERIFIED HERE AUDITS DIRTY. The verified-state entry
        requirements — C-2.7's (well-formed content_hash, data/dataset.json, a
        file in snapshots/) and, as of REC-54/D-200, C-18.9's provenance chain —
        are checked per member BEFORE any state moves, offenders named, set
        refused whole. */
  release({ handle, acknowledgment = "", mitigation = "", viewer = null, owner = null, author = null } = {}) {
    const who = String(author ?? "").trim();
    /* DEC-49 REGION is-machine-release — REC-64/C-32.1. The FENCE and only the
       fence: everything below in this method is a payload complaint and not this
       family's business. D-229 measured that the two are confusable from the
       outside, which is exactly why the governed span stops here. */
    if (!who || isMachineIdentity(who))                 /* REC-46: one predicate */
      return { ok: false, reason: "MACHINE_CANNOT_RELEASE",
               detail: "the collected-to-verified transition is a named member's decision (Intake Doctrine "
                     + "section 4, C-18.1). A machine credential may read and may prepare the review packet, "
                     + "and may not release. Sign in as a member." };
    /* END DEC-49 REGION is-machine-release */
    const ack = String(acknowledgment ?? "").trim();
    const mit = String(mitigation ?? "").trim();
    /* DEC-49 REGION is-release-account — REC-64/C-33.10-11. What the member has
       to SAY to release a batch. The loop below refuses through a
       template-literal code and is outside the span for that reason. */
    if (!ack)
      return { ok: false, reason: "NO_ACKNOWLEDGMENT",
               detail: "a bulk release records the member's explicit acknowledgment that the batch is "
                     + "homogeneous and that the risks of releasing in bulk were weighed. Without it the "
                     + "record shows only that a button was pressed." };
    if (!mit)
      return { ok: false, reason: "NO_MITIGATION",
               detail: "a bulk release records what the member actually did: what was sampled, what was "
                     + "checked. 'Sender domains verified on a sample of twelve' can be audited later; "
                     + "silence cannot." };
    /* END DEC-49 REGION is-release-account */
    for (const [name, v] of [["acknowledgment", ack], ["mitigation", mit]])
      if (v.length > Store.RELEASE_ACK_MAX || /["\\\r\n]/.test(v))
        return { ok: false, reason: `BAD_${name.toUpperCase()}`,
                 detail: `${name} is at most ${Store.RELEASE_ACK_MAX} characters and cannot contain a `
                       + `quote, a backslash, or a newline` };

    const sel = this.selectionResolve({ handle, viewer, owner, weight: "refuse" });
    if (!sel.ok) return sel;
    if (!sel.members.length)
      return { ok: false, reason: "EMPTY_SELECTION", handle, drift: sel.drift,
               detail: "this selection resolves to no members, so there is nothing to release" };

    const notInfo = [], illegal = [], crucial = [], entry = [];
    for (const id of sel.members) {
      const b = this.#one(`SELECT object_type, current_state, criticality FROM bundles WHERE bundle_id=?`, id);
      if (!b || b.object_type !== "information") { notInfo.push(id); continue; }
      if (b.current_state !== "collected") { illegal.push({ id, from: b.current_state }); continue; }
      if (b.criticality === "crucial") { crucial.push(id); continue; }
      const md = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, id);
      const fm = md && md.content !== null ? (parseFrontmatter(md.content).data || {}) : {};
      const missing = [];
      const ch = fm.content_hash;
      if (!(typeof ch === "string" && /^sha256:[0-9a-f]{64}$/.test(ch))) missing.push("well-formed content_hash");
      if (!this.#one(`SELECT 1 AS x FROM files WHERE bundle_id=? AND path='data/dataset.json'`, id))
        missing.push("data/dataset.json");
      if (!this.#one(`SELECT 1 AS x FROM files WHERE bundle_id=? AND path LIKE 'snapshots/%' LIMIT 1`, id))
        missing.push("a file in snapshots/");
      /* REC-54 / D-200: THE CHAIN IS AN ENTRY REQUIREMENT OF `verified`, and its
         absence here is the write path the ten live bundles are a symptom of.
         The catalog runs at op=ratify and NOWHERE ELSE — `runGate` has exactly
         one call site — so this batch path, which is the OTHER way an
         Information document reaches `verified`, checked three of C-2.7's entry
         requirements and never asked C-18.9's question at all. A member could
         release a hundred documents to verified, every one publishing a hash
         that claims a route none of them names, and nothing in the plane would
         object until an audit swept them afterwards. Checked HERE rather than
         by running the whole catalog because this block is already the
         entry-requirement gate and the refusal shape (`ENTRY_REQUIREMENTS`, the
         offenders named, the set refused whole) is the one a caller of this op
         already gets — a chain missing at release is the same KIND of fact as a
         missing content_hash, and telling a member about it in a different
         shape at a different moment would be the same defect wearing a
         different hat. VERIFICATION.md 3a is the rule this satisfies: a rule
         enforced in N places carries an assertion at EACH place, so the suite
         asserts the audit arm AND this arm separately rather than letting one
         absorb the other. */
      const provRow = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='data/provenance.json'`, id);
      if (provRow && provRow.content !== null) {
        let preg = null;
        try { preg = JSON.parse(provRow.content); } catch { preg = null; }
        const pdocs = preg && Array.isArray(preg.documents) ? preg.documents : [];
        const noChain = [];
        pdocs.forEach((d, di) => {
          const ch = d && typeof d === "object" ? d.provenance_chain : undefined;
          if (!Array.isArray(ch) || ch.length === 0) noChain.push(di);
        });
        if (noChain.length)
          missing.push(`a provenance_chain for documents[${noChain.join("], documents[")}] (C-18.9)`);
      }
      if (missing.length) entry.push({ id, missing });
    }
    if (notInfo.length)
      return { ok: false, reason: "NOT_INFORMATION", offenders: notInfo.sort(),
               detail: "release moves an Information state, and this selection carries something else. "
                     + "The set is refused whole rather than narrowed." };
    if (illegal.length)
      return { ok: false, reason: "ILLEGAL_TRANSITION", to: "verified",
               offenders: illegal.sort((a, b) => a.id < b.id ? -1 : 1),
               detail: "only collected Information may be released. Something already verified has been "
                     + "released once and release is not repeatable; something retired is terminal." };
    if (crucial.length)
      return { ok: false, reason: "CRUCIAL_IN_BATCH", offenders: crucial.sort(),
               detail: "crucial-criticality material is never batch-released (Intake Doctrine v1.2): "
                     + "ratifying it requires verifying its co-attestations, which is per-document work, "
                     + "and a batch containing crucial material is not a low-variance collection. Release "
                     + "these individually, or re-select without them." };
    /* DEC-49 REGION is-release-entry — REC-64/C-33.12. */
    if (entry.length)
      return { ok: false, reason: "ENTRY_REQUIREMENTS",
               offenders: entry.sort((a, b) => a.id < b.id ? -1 : 1),
               detail: "verified state has entry requirements: a well-formed content_hash, data/dataset.json, "
                     + "and at least one file in snapshots/ (C-2.7), and a provenance_chain naming the route "
                     + "for every document in the register (C-18.9). Releasing these as they stand would mint "
                     + "bundles the catalog immediately rejects." };
    /* END DEC-49 REGION is-release-entry */

    const when = stampInstant("second");
    const released = [];
    for (const id of sel.members) {
      const liveMd = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, id);
      const cur = this.#one(`SELECT bundle_sha, current_state FROM bundles WHERE bundle_id=?`, id);
      if (!liveMd || liveMd.content === null)
        return { ok: false, reason: "NO_DOCUMENT", bundleId: id, releasedSoFar: released };
      let text = liveMd.content;
      const withHistory = Store.#appendStateHistory(text, {
        timestamp: when, from_state: cur.current_state, to_state: "verified",
        blurb: `batch release via selection ${handle}; acknowledgment and mitigation in Session Log`,
        author: who });
      if (!withHistory)
        return { ok: false, reason: "UNSPLICEABLE_STATE_HISTORY", bundleId: id, releasedSoFar: released,
                 detail: "this document's state_history block cannot be extended in place, and a release "
                       + "recording no transition would leave prior_state pointing at a history the "
                       + "document does not carry (C-4.2)" };
      text = withHistory;
      text = Store.#setScalar(text, "prior_state", cur.current_state);
      text = Store.#setScalar(text, "current_state", "verified");
      text = Store.#setScalar(text, "last_updated", `"${when}"`);
      const entryLog = `### Session ${when} | Released (batch) | ${who}\n`
                     + `Trigger: selection ${handle}\n`
                     + `Changes: state ${cur.current_state} to verified.\n`
                     + `Acknowledgment: ${ack}\n`
                     + `Mitigation: ${mit}\n`;
      const at = text.indexOf("## Session Log");
      if (at < 0) text += "\n## Session Log\n\n" + entryLog;
      else {
        const nxt = text.indexOf("\n## ", at + 1);
        const cutAt = nxt === -1 ? text.length : nxt + 1;
        text = text.slice(0, cutAt) + entryLog + "\n" + text.slice(cutAt);
      }

      const carried = [];
      for (const r of this.sql.exec(
        `SELECT path, content, blob_sha, sha256, bytes FROM files WHERE bundle_id=? AND path<>'bundle.md'`, id))
        carried.push(r.content !== null
          ? { path: r.path, text: r.content, bytes: r.bytes, sha256: r.sha256 }
          : { path: r.path, blobSha: r.blob_sha, sha256: r.sha256, bytes: r.bytes });

      const bytes = new TextEncoder().encode(text);
      const fm = parseFrontmatter(text).data || {};
      const promoted = this.promote({
        bundleId: id, base: cur.bundle_sha, snapKey: `${when.replace(/[-:]/g, "")}_${Store.#rand(4)}`,
        author: who,
        files: [{ path: "bundle.md", text, bytes: bytes.length,
                  sha256: createSha256().update(bytes).hex() }, ...carried],
        meta: { object_type: "information", title: fm.title,
                current_state: "verified", prior_state: cur.current_state,
                created: fm.created, last_updated: when,
                criticality: fm.criticality ?? null },
      });
      if (!promoted.ok) return { ...promoted, bundleId: id, releasedSoFar: released };
      released.push(id);
    }
    return { ok: true, handle, released: released.sort(), acknowledgment: ack, mitigation: mit,
             weight: "refuse", drift: sel.drift };
  }

  /* REC-13 / REC-124 / REC-136: the conclusion and a project's conclusion record are basis-versions' (R16–R23). */
  conclude(a) { return basisVersionsOf(this.ctx).conclude(a); }
  #noProjectConclusionOf(...a) { return basisVersionsOf(this.ctx).noProjectConclusionOf(...a); }

  actionMove(a) { return actionsOf(this.ctx).actionMove(a); }
  actionCorrespond(a) { return actionsOf(this.ctx).actionCorrespond(a); }
  actionLaws(a) { return actionsOf(this.ctx).actionLaws(a); }
  actionRiskTier(a) { return actionsOf(this.ctx).actionRiskTier(a); }
  actionLawsPropose(a) { return actionsOf(this.ctx).actionLawsPropose(a); }
  actionQuotes(a) { return actionsOf(this.ctx).actionQuotes(a); }


  reopen({ target, reason = "", viewer = null, author = null } = {}) {
    return promotionOf(this.ctx).reopen({ target, reason, viewer, author });
  }


  publishCase(...a) { return caseAuthoringOf(this.ctx).publishCase(...a); }




  /* R23–R28: dividing a question and grouping its legs: inquiry's. */
  divide(...a) { return inquiryOf(this.ctx).divide(...a); }
  groundInquiry(...a) { return inquiryOf(this.ctx).ground(...a); }

  /* REC-86 / IC-123: narrowing is basis-versions' (R24–R27). */
  narrowCandidates(a) { return basisVersionsOf(this.ctx).narrowCandidates(a); }


  narrow(a) { return basisVersionsOf(this.ctx).narrow(a); }

  /* Rewrite ONE column-0 scalar inside the frontmatter, leaving every other
     byte alone. Line-oriented on purpose: the same approach the monitor takes,
     and the reason is that this repo has no frontmatter SERIALIZER, only a
     parser. Re-emitting a parsed document would reorder keys, drop comments and
     renormalise quoting across the whole file to change one field. */
  /* Append one entry to the `state_history` block, handling the inline-empty and
     populated shapes the corpus actually contains, exactly as #spliceReferences
     does for references. Returns null if the block is in a shape this restricted
     grammar cannot extend, so the caller refuses rather than guesses. */
  static #appendStateHistory(text, e) {
    const lines = text.split("\n");
    if (lines[0] !== "---") return null;
    const end = lines.indexOf("---", 1);
    if (end === -1) return null;
    const block = [`  - timestamp: "${e.timestamp}"`,
                   `    from_state: ${e.from_state}`,
                   `    to_state: ${e.to_state}`,
                   `    blurb: "${e.blurb}"`,
                   `    author: ${e.author}`];
    let at = -1;
    for (let i = 1; i < end; i++) if (/^state_history:/.test(lines[i])) { at = i; break; }
    if (at === -1) return [...lines.slice(0, end), "state_history:", ...block, ...lines.slice(end)].join("\n");
    const rest = lines[at].slice("state_history:".length).trim();
    if (rest === "[]") return [...lines.slice(0, at), "state_history:", ...block, ...lines.slice(at + 1)].join("\n");
    if (rest !== "") return null;
    /* Populated block: find its end and append, so entries stay chronological. */
    let last = at;
    for (let i = at + 1; i < end; i++) {
      if (/^\s/.test(lines[i]) && lines[i].trim() !== "") last = i;
      else break;
    }
    return [...lines.slice(0, last + 1), ...block, ...lines.slice(last + 1)].join("\n");
  }

  static #setScalar(text, key, value) {
    const lines = text.split("\n");
    const end = lines.indexOf("---", 1);
    for (let i = 1; i < (end === -1 ? lines.length : end); i++) {
      if (lines[i].startsWith(key + ":")) { lines[i] = `${key}: ${value}`; return lines.join("\n"); }
    }
    return text;
  }


  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }


  /* A whole-store conformance pass, run WHERE THE DATA IS.
   *
   * The benchmark that produced this: gating 20,000 bundles from outside costs
   * about 2,060 seconds on the deployed plane and 63 locally, and roughly 97% of
   * the difference is one network round trip per image. The store and the checks
   * are not the constraint; fetching bundles one at a time is. The catalog is a
   * pure function over an injected filesystem and the images are already here, so
   * the pass belongs here too.
   *
   * Paginated rather than exhaustive, because a Durable Object has a CPU budget
   * and 20,000 bundles is about 63 seconds of work. A page of a few hundred is
   * well inside it, and a hundred calls instead of twenty thousand captures
   * essentially all of the benefit. The cursor is the last bundle id seen, so a
   * pass is resumable and does not depend on a snapshot of the store.
   *
   * Blob-backed files are declared elided, exactly as the gate does: existence
   * assertions see them, byte checks skip them, and capture integrity was proven
   * at write time by the capture op rather than re-proven here.
   */
  async auditPass({ after = "", limit = 200, viewer = null } = {}) {
    // record-core R18-R20 runs the catalogue over the page; the viewer's gate, and the route, total and
    // membership findings the sweep publishes beside the page, stay here.
    const gate = viewerPredicate(viewer);
    const sighted = new Map();   /* N127: asked per id the page names, never a SELECT of every visible bundle */
    const visible = (id) => (sighted.has(id) ? sighted.get(id)
      : sighted.set(id, !!this.#one(`SELECT 1 AS x FROM bundles b WHERE b.bundle_id=? AND (${gate.sql})`, id, ...gate.args)).get(id));
    const { clean, withErrors, tally, tallyDetail = {}, offenders, limit: cap, page: ids } = await recordAudit(this.ctx, {
      after, limit, visible,
      context: (id) => {
        const targets = this.#rows(`SELECT target_id FROM inquiry_basis WHERE bundle_id=?`, id).map((r) => r.target_id);
        return { earnedRegistry: targets.length ? this.earnedBasisRegistry(this.#subjectEntityOf(id), targets) : null,
                 publishedRegistry: this.publishedRegistryFor(id, targets) };
      } });
    const page = ids.map((id) => this.#one(`SELECT bundle_id, object_type, current_state FROM bundles WHERE bundle_id=?`, id));
    const last = page.length ? page[page.length - 1].bundle_id : after;

    /* ============ REC-63 / DEC-56 — THE MARKER, ON THE SWEEP =============== *
     * DEC-56's acceptance is that a document sits at `verified` while the audit
     * REPORTS it, and that the disagreement is LEGIBLE rather than reading as a
     * bug. Three decisions make that true and each is here rather than in a doc:
     *
     *  1. `ok`, `clean`, `withErrors` and `tally` DO NOT MOVE. A marker is a
     *     STATED DOUBT, not a conformance error. If it were an error, a store
     *     that honestly recorded one could never be "audit clean" again — and
     *     `CLAUDE.md`'s own ladder ends with `op=audit` clean before anything is
     *     called done, so the honest act would have broken the gate that rewards
     *     honesty. (A missing chain at `verified` is STILL a C-18.9 error and
     *     still tallies; the marker explains that finding, it does not cancel it.)
     *  2. THE TALLY IS OVER THE WHOLE PAGE AND IS ALWAYS PRESENT, including its
     *     `NEVER_LOOKED` count. That count is the answer to "nobody looked", and
     *     an operator who cannot see it cannot tell a clean corpus from an
     *     unexamined one — which is this item's whole subject, in aggregate.
     *  3. THE NAMED LIST IS BOUNDED at 20, like `offenders` beside it, and
     *     `markedTotal` publishes how many there were. A bound applied and not
     *     published is REC-57's defect and it is not being re-created here.
     *
     * The marks are read over the PAGE'S OWN ID RANGE and then filtered to the
     * gated page, so an invisible bundle's marker cannot ride out on this answer
     * and the read cannot become an unbounded scan of the marks table. */
    const pageIds = new Set(page.map((r) => r.bundle_id));
    const marks = new Map();
    if (page.length)
      for (const m of this.#rows(
        `SELECT m.* FROM provenance_route_marks m
          WHERE m.bundle_id > ? AND m.bundle_id <= ?
            AND m.seq = (SELECT MAX(x.seq) FROM provenance_route_marks x WHERE x.bundle_id = m.bundle_id)`,
        after, last))
        if (pageIds.has(m.bundle_id)) marks.set(m.bundle_id, m);
    const routeTally = { LOOKED_INDETERMINATE: 0, PRESENT: 0, NEVER_LOOKED: 0, notApplicable: 0 };
    const routeMarked = [];
    let markedTotal = 0;
    for (const row of page) {
      const found = routeFinding(row.object_type, marks.get(row.bundle_id) || null);
      if (!found.applies) { routeTally.notApplicable++; continue; }
      routeTally[found.finding] = (routeTally[found.finding] || 0) + 1;
      if (!found.marked) continue;
      markedTotal++;
      if (routeMarked.length < 20)
        routeMarked.push({ bundleId: row.bundle_id, state: row.current_state, ...found });
    }

    return {
      ok: true, checked: page.length, clean, withErrors, tally,
      /* ALWAYS PRESENT, unlike `tallyDetail` beside it, and the difference is the
         item: an absent tally would say nothing, and "nothing to report" and
         "this build does not report it" would read alike — which is the exact
         conflation the marker exists to end, arriving one level up. */
      route: {
        tally: routeTally, marked: routeMarked, markedTotal, markedShown: routeMarked.length,
        means: OBSERVATION_STATES,
        note: "these are STATED DOUBTS, not conformance errors, and they are deliberately not counted in "
            + "`tally` or `withErrors`: each names a document whose route cannot be shown, standing where "
            + "the group put it (DEC-56/DEC-19). `NEVER_LOOKED` is a different fact again — it means no "
            + "assessment has run, not that anything is wrong.",
      },
      ...(Object.keys(tallyDetail).length ? { tallyDetail } : {}),
      offenders,
      /* REC-57: `cursor` and `total` were already here and are UNTOUCHED — between
         them a caller can tell a full page from the whole corpus, so no second
         spelling of that fact is minted. What was missing is the bound that
         produced the page, and on THIS op it matters most: `checked` is the size
         of one page and `ok` is a verdict over it, so "the audit is clean" and
         "the first 200 are clean" published the same shape. */
      limit: cap,
      cursor: page.length === cap ? last : null,
      total: this.#one(`SELECT COUNT(*) AS n FROM bundles b WHERE (${gate.sql})`, ...gate.args).n,
      /* REC-132 / D-422 / C-55: A MEMBER HOLDING THE RESERVED ID IS REPORTED, NEVER
         RENAMED. `memberAdd` now refuses the id `admin`, but an instance that enrolled
         one before the reservation still holds it, and every name-keyed check reads it
         as the founder. Renaming it here would rewrite who the record says acted, so the
         audit SAYS it and an administrator decides. ALWAYS PRESENT, so "none held" and
         "this build does not look" never read alike. A stated finding like `route`
         above, not a conformance error: `ok`, `tally` and `withErrors` are about
         bundles and do not move for it. It names only the reserved id, which is public,
         and that row's role and status. */
      membership: (() => {
        const m = this.#one(`SELECT role, status FROM members WHERE member_id = ?`, Store.ROOT_ADMIN);
        return {
          reservedId: Store.ROOT_ADMIN, held: !!m, role: m ? m.role : null, status: m ? m.status : null,
          check: MEMBER_ID_CHECKS.MEMBER_ID_RESERVED.check,
          says: m
            ? `a member is enrolled under the reserved id '${Store.ROOT_ADMIN}' (role ${m.role}, status ${m.status}). `
              + `Every check that asks whether someone administers by name reads it as the founding `
              + `administrator. It was enrolled before the id was reserved and has NOT been renamed: an `
              + `administrator should decide what it is and re-enrol the person under another id`
            : `no member holds the reserved id '${Store.ROOT_ADMIN}'`,
        };
      })(),
    };
  }

  /* REC-54 / D-200: the provenance chain, derived from what the capture record holds, and its rebuild through the
     plane's own write path: provenance's (R19–R21). */
  provenanceChainRebuild(...a) { return provenanceOf(this.ctx).provenanceChainRebuild(...a); }

  /* REC-63 / DEC-56 / D-204, REC-116: the standing route marker and its reads: provenance's (R22, R23). */
  provenanceRouteAssess(...a) { return provenanceOf(this.ctx).provenanceRouteAssess(...a); }
  provenanceRoutesMarked(...a) { return provenanceOf(this.ctx).provenanceRoutesMarked(...a); }


  /* Every bundle, or a page of them.
   *
   * Measured: 81ms at 5,000 bundles and 434ms at 20,000, which is honestly linear
   * and about two seconds at 100,000. It returned everything because nothing had
   * ever needed less, and a caller that wants everything can still have it, since
   * breaking that would break the browser, the audit, and the migration verifier
   * at once.
   *
   * So paging is OPT-IN and shaped like the audit's: a cursor that is the last
   * identifier seen, which makes it resumable and independent of any snapshot of
   * the store. A caller that passes no limit gets what it always got. */
  /** REC-63: the joined `route_*` columns folded into ONE published field and
   *  removed from the row, so a consumer meets the composed finding rather than
   *  five loose columns it would have to interpret — and interpreting them is
   *  exactly where the two absences get conflated again. */
  static #withRoute(r) {
    const mark = r.route_finding === null || r.route_finding === undefined ? null : {
      seq: r.route_seq, at: r.route_at, by: r.route_by, finding: r.route_finding,
      state_at: r.route_state_at, register_state: r.route_register,
      undetermined: r.route_undetermined, documents_n: r.route_documents_n,
    };
    const out = { ...r, route: routeFinding(r.object_type, mark) };
    for (const k of ["route_seq", "route_at", "route_by", "route_finding", "route_state_at",
                     "route_register", "route_undetermined", "route_documents_n"]) delete out[k];
    return out;
  }

  listBundles(filter = {}) {
    /* REC-25 / F-8: the D-15 viewer gate, from query.mjs's ONE compilation
       point. Fail closed — an absent viewer compiles to the deny predicate, so
       the failure mode of a missing control-plane stamp is an empty list rather
       than an unfiltered one, exactly as the search path already behaves. */
    const gate = viewerPredicate(filter.viewer);
    /* REC-63 / DEC-56: THE MARKER IS PUBLISHED HERE, ON THE ROSTER READ A MEMBER
       ACTUALLY USES — `op=list` is the most-called bundle read in `app.html`. A
       marker only the store can see is REC-74's defect one field over, so it
       travels on the read rather than waiting to be asked for.
       ONE LEFT JOIN against the highest `seq`, not a per-row lookup: this arm can
       be unbounded by contract (the licence is pinned in the block below), and a
       correlated read per row would turn a complete answer into a scan per row. */
    let q = `SELECT b.bundle_id, b.object_type, b.current_state, b.title, b.last_updated, b.bundle_sha,
                    m.seq AS route_seq, m.at AS route_at, m.by AS route_by, m.finding AS route_finding,
                    m.state_at AS route_state_at, m.register_state AS route_register,
                    m.undetermined AS route_undetermined, m.documents_n AS route_documents_n
               FROM bundles b
               LEFT JOIN provenance_route_marks m
                 ON m.bundle_id = b.bundle_id
                AND m.seq = (SELECT MAX(x.seq) FROM provenance_route_marks x WHERE x.bundle_id = b.bundle_id)`;
    const w = [`(${gate.sql})`], a = [...gate.args];
    /* The projection stores canonical types only (boot normaliser + promote),
       so a legacy `focus`/`problem` filter value is honoured through the
       catalog's own map rather than answered with an empty page — the same
       courtesy query.mjs extends to `type:` filters (REC-10). */
    if (filter.type) { w.push(`b.object_type=?`); a.push(normalizeType(filter.type)); }
    if (filter.state) { w.push(`b.current_state=?`); a.push(filter.state); }
    if (filter.after) { w.push(`b.bundle_id > ?`); a.push(filter.after); }
    q += ` WHERE ` + w.join(" AND ");
    q += ` ORDER BY b.bundle_id`;
    /* ============ REC-60 / D-225 · THE RIDER, DECIDED HERE RATHER THAN ELSEWHERE ===     *
     * REC-59 left this and routed it to REC-60 to DECIDE: `op=list` keeps an UNBOUNDED
     * BARE-ARRAY arm while `op=projection` just lost its capped one, so two answers over the
     * same rows of the same table now differ in shape. The decision is **KEEP**, and the
     * reasoning is here because a decision recorded only in a queue item is a decision the
     * next reader will re-open.
     *
     * THE DISCRIMINATOR IS NOT "HAS AN ENVELOPE". It is whether a BOUND WAS APPLIED AND NOT
     * PUBLISHED. Those are two different defects and this sweep separated them:
     *
     *   HONESTY   — a bound applied must be published. That is REC-57's discipline, and it is
     *               what `op=projection` violated: its corpus arms had been capped at 200
     *               since they were written, the cap was invisible on the wire, and the caller
     *               could neither see it nor ask past it. It was answering LESS than
     *               everything while looking like everything.
     *   BOUNDEDNESS — a response must not grow without limit. That is D-225's concern, and it
     *               is what the three meaning-layer reads violated.
     *
     * THIS ARM VIOLATES NEITHER IN THE WAY `op=projection` DID. It applies NO cap, so it has
     * no bound to publish, and a bare array that is genuinely COMPLETE tells no lie — the
     * array IS the answer. Capping it silently would create exactly the defect REC-57 spent
     * an item removing; enveloping it while leaving it uncapped would add two keys that say
     * "no bound, nothing withheld", which is what an unbounded bare array already says.
     *
     * IT IS ALSO CALLER-SELECTED AND DOCUMENTED. The shape here is chosen by the caller: send
     * a `limit` and you get the paged envelope, send none and you get everything. That is a
     * contract, not a trap — unlike `op=projection`, where no parameter existed to ask with.
     * REC-59's own words on why the unbounded arm is deliberate: *a caller that wants
     * everything can still have it… breaking that would break the browser, the audit, and the
     * migration verifier at once.*
     *
     * WHAT IS NOT CLAIMED, and it is the honest half. This arm DOES grow without limit, so
     * D-225's concern applies to it too — it is simply outweighed here by three named
     * consumers that require completeness, which none of the three meaning-layer reads had.
     * That is the test this item used and it is the test to re-run if it is ever re-opened:
     * IS THERE A NAMED CONSUMER THAT REQUIRES COMPLETENESS? Yes here; no there.
     *
     * AND THE LICENCE IS PINNED, NOT ASSERTED. `test/meaning-bounds.test.mjs` requires this
     * arm to be COMPLETE — it returns every row a bounded call totals — because a bare array
     * is honest only while it is whole. The day this arm quietly caps, that pin fails and the
     * exception it rests on is gone with it. */
    const limit = Number(filter.limit);
    if (!Number.isFinite(limit) || limit <= 0) return this.#rows(q, ...a).map(Store.#withRoute);
    const cap = Math.min(5000, Math.floor(limit));
    const rows = this.#rows(q + ` LIMIT ?`, ...a, cap).map(Store.#withRoute);
    /* The shape changes only when paging was asked for, so no existing caller
       has to learn a new answer. The total counts what the VIEWER may see:
       a count that included invisible rows would say "something is hidden",
       which is half the leak. */
    /* REC-57: `cursor` and `total` were already here and are UNTOUCHED. `limit`
       is the bound AFTER the 5000 ceiling, which is the half a caller could not
       see: ask for 100000 and this op silently answers 5000, and until now the
       only evidence of that was a `cursor` the caller had no figure to read
       against. The unbounded arm above returns a bare array and applies NO cap,
       so it has no bound to publish — a different answer, not a quieter one. */
    return { bundles: rows, limit: cap,
             cursor: rows.length === cap ? rows[rows.length - 1].bundle_id : null,
             total: this.#one(`SELECT COUNT(*) AS n FROM bundles b WHERE (${gate.sql})`, ...gate.args).n };
  }

  /** The index projection. One stored artifact on Drive, one query here.
   *  Note the absence of `locator`: there is no substrate path to leak.
   *  REC-25 / F-8: §7.9 names the index as the one place the graph could
   *  escape, so the D-15 gate applies here as everywhere — fail closed. */
  buildIndex({ viewer = null } = {}) {
    const gate = viewerPredicate(viewer);
    return {
      generated: new Date().toISOString(),
      version: 2,
      bundles: this.#rows(
        `SELECT b.bundle_id AS id, b.object_type, b.current_state, b.title, b.last_updated, b.bundle_sha AS sha256
         FROM bundles b WHERE (${gate.sql}) ORDER BY b.bundle_id`, ...gate.args),
    };
  }


  #viewerSees(...a) { return membershipOf(this.ctx).inSight(...a); }

  /* ======================= REC-30 · the posture sweep ===============   *
   * REC-25 stamped the D-15 gate onto every read that is ADDRESSED to a bundle.
   * What was left were the reads addressed to something ELSE — a capture, an
   * entity, a task, a reference, a dangling edge — that name a bundle on the way
   * past. `op=dangling` was the measured one (a project citing a nonexistent
   * target put the PROJECT's id in an uninvited member's hands), and the same
   * shape runs through the task inbox, the queue's subjects, the recogniser and
   * progression reads, and the two paging integrity sweeps.
   *
   * ONE COMPILATION POINT, still. Both helpers below take their predicate from
   * query.mjs's `viewerPredicate` and neither restates it — including its two
   * arms that are easy to get wrong by hand: the MACHINE CARVE-OUT (a machine
   * credential has no person behind it and is deliberately not filtered) and the
   * FAIL-CLOSED deny (an absent or unrecognised viewer sees nothing, so a
   * missing control-plane stamp is an outage and never a leak).
   *
   * TWO SHAPES, because the reads are two shapes:
   *
   *   the row IS ABOUT the bundle  ->  the ROW is withheld (`#bundleGate`, in
   *     SQL). A dangling edge, a task, a queue obligation: withhold the row and
   *     report no count of what was withheld, because that count is the leak.
   *     This is op=backlinks' own posture, landed by REC-25.
   *
   *   the row is about a CAPTURE or an ENTITY and merely POINTS BACK at the
   *     bundle the document lives in  ->  the REFERENCE alone is withheld
   *     (`#bundleRedactor`, in JS). The row stands, and so do its capture sha,
   *     its grade and every derivation over it: those are the RECORD's facts and
   *     they must not change with the reader. A grade that got stronger because
   *     someone was not invited to a project would be the record claiming more
   *     than it can support, which is worse than the leak we are closing.
   *
   * WHAT IS DELIBERATELY UNGATED is listed, with its reason, in
   * `test/gate-reads.test.mjs`. It is a shorter list than it looks: the
   * published projection is credential-free BY DESIGN, an op fenced to the admin
   * and probe classes has no member session to filter, and a COUNT THAT NAMES
   * NOTHING is not identity. */

  /** The D-15 predicate over a column that HOLDS a bundle id, as a WHERE term.
   *
   *  `FROM bundles b` and not `FROM bundles`: viewerPredicate compiles over the
   *  alias `b`, which is REC-25's landed lesson and the reason this subquery
   *  binds the alias rather than the table name.
   *
   *  A NULL column names no bundle and so discloses nothing: it passes. A column
   *  naming a bundle that is GONE does not, and that is the fail-closed arm — a
   *  row pointing at something the store cannot show is withheld rather than
   *  answered for.
   *
   *  THE COLUMN MUST BE QUALIFIED, and this refuses an unqualified one rather
   *  than trusting a caller to remember. Found by the suite: inside the EXISTS
   *  subquery a bare `bundle_id` resolves against `bundles` — the INNER table —
   *  so `b.bundle_id = bundle_id` is `b.bundle_id = b.bundle_id`, a gate that
   *  passes every row while looking exactly like a gate. The failure is silent
   *  and it is the whole class this sweep exists to close, so it is a throw. */
  #bundleGate(col, viewer) {
    if (typeof col !== "string" || !/^[A-Za-z_][A-Za-z0-9_]*\.[A-Za-z_][A-Za-z0-9_]*$/.test(col))
      throw new Error(`REFUSED: the D-15 bundle gate needs a QUALIFIED column (got ${col}). `
        + "An unqualified name binds to `bundles` inside the gate's own subquery and passes everything.");
    const gate = viewerPredicate(viewer);
    if (gate.scope === "member") return { sql: `${GATE_MARK} 1=1`, args: [] };
    if (gate.scope === "DENY") return { sql: gate.sql, args: [] };
    return {
      sql: `${GATE_MARK} (${col} IS NULL OR EXISTS (SELECT 1 FROM bundles b
              WHERE b.bundle_id = ${col} AND (${gate.sql})))`,
      args: gate.args,
    };
  }

  /** The same question asked of ONE id, for the answers this store assembles in
   *  JavaScript rather than in SQL. Returns a function that passes a visible id
   *  through and answers `null` for one the viewer may not see; a row that names
   *  NO bundle is left alone, because it discloses nothing to begin with.
   *  Memoised per call site: a progression instance asks about the same handful
   *  of bundles many times over. */
  #bundleRedactor(viewer) {
    const gate = viewerPredicate(viewer);
    if (gate.scope === "member") return (id) => id ?? null;        // machine: not filtered
    if (gate.scope === "DENY") return (id) => (id ? null : id ?? null);   // fail closed
    const memo = new Map();
    return (id) => {
      if (!id) return id ?? null;
      if (!memo.has(id))
        memo.set(id, !!this.#one(`SELECT 1 AS x FROM bundles b WHERE b.bundle_id=? AND (${gate.sql})`,
                                 id, ...gate.args));
      return memo.get(id) ? id : null;
    };
  }

  /** Streaming whole-store pass. Peak memory is one image, measured at 37KB,
   *  against 558MB if every image is materialised at once. */
  *eachImage() {
    for (const r of this.#rows(`SELECT bundle_id FROM bundles ORDER BY bundle_id`))
      yield [r.bundle_id, recordOf(this.ctx).readImage(r.bundle_id)];
  }

  /* PL-1 / IS-1: the one assembler of a version's composition is basis-versions' (R5). */
  static basisVersionsOf(fm) { return versionsIn(fm); }

  /* ---- writes: promotion is the sole writer of live state ---- */

  /**
   * One transaction. Either the whole bundle advances or nothing does.
   *
   * base is the CAS. It must equal the current bundle_sha, or null when
   * creating. A stale base is refused, which is the lost-update floor that
   * manifest base-sha CAS provided on Drive.
   */
  promote(pkg) {
    return promotionOf(this.ctx).promote(pkg);
  }

  /* K31 (promotion R39): legacy-store's share of every promotion's checks, until each module that owns one is
     extracted. Registered with `promotion` in the constructor; a refusal here refuses the whole promotion. */
  #promoteChecks(c) {
    const { pkg, bundleId, base, meta, author, register, files, promotedType } = stepContext(c);
    const cur = this.#one(`SELECT bundle_sha, row_version, object_type, current_state, group_id FROM bundles WHERE bundle_id=?`, bundleId);
      /* REC-179 / C-66.5 (INVESTIGATIVE-SESSION.md §11 item 5, rule 2's reach): A REVISION CARRIES `surfaced_by`
         FORWARD. The field records the SURFACING ACT, decided once at the trust boundary on the creation (D-78's
         restamp; REC-173's verified replay keeps the Drive era's), and the restamp runs only there — so without this
         a revision relabelled the question and REC-171's surfacing row then contradicted the bytes it describes.
         Asked of every revision of a bundle whose CURRENT version is an inquiry, after the compare-and-swap (so
         `cur` is the version this revision is based on) and before any write. Both sides are read by the catalog's
         own parser, never a line scan a caller can step around, so a respelling of the same value lands and a
         different value is refused in EITHER direction. An absent field and an unreadable document are values
         too: a revision may not supply an origin its creation did not record, nor drop one it did. `replay` is not
         an exemption — it is a caller's assertion (`index.mjs` verifies only a CREATION as a replay, REC-173). */
      if (cur && base !== null && normalizeType(cur.object_type) === "inquiry") {
        const surfacedOf = (text) => {
          if (typeof text !== "string") return "unreadable";
          /* No catch: the catalog's parser does not throw on a string — a document it cannot read comes back
             `data: null` with its C-2.1 finding, and that is stated here as `unreadable` (provenance-marker's
             swallowed-read ratchet counts a catch, and this one would catch nothing). */
          const fm = parseFrontmatter(text).data;
          if (!fm || typeof fm !== "object") return "unreadable";
          return Object.prototype.hasOwnProperty.call(fm, "surfaced_by") ? JSON.stringify(fm.surfaced_by) : "absent";
        };
        const heldMd = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, bundleId);
        const nextMd = files.find((f) => f && f.path === "bundle.md");
        const was = surfacedOf(heldMd ? heldMd.content : null);
        const now = surfacedOf(nextMd ? nextMd.text : null);
        /* The C-66 family's own helper shape (`#surfacingGate`'s), shadowing the project-id one in this block only. */
        const refusal = (code, detail, extra) => {
          const row = SURFACE_CHECKS[code];
          return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...(extra || {}) };
        };
        /* DEC-49 REGION is-promote-surfaced-by */
        if (was !== now)
          return refusal("SURFACED_BY_REWRITTEN",
            `the current version of ${bundleId} records surfaced_by ${was}, and this revision records ${now}. Who `
            + `surfaced a question is recorded once, at its creation; a revision carries it forward unchanged. `
            + `Nothing was written.`, { bundleId, current: was, revision: now });
        /* END DEC-49 REGION is-promote-surfaced-by */
      }

      // MK-1 / D-184: the authored flag's fence and one capture, one home are provenance's registered check (R2,
      // R3), run before this one. What stays here is the content row's own refusal for the testimony path's words,
      // asked before anything is written (C-45's checker under the context the mint will see), so the mint in the
      // projection below cannot refuse.
      const extentBad = pkg[TESTIMONY_PATH]
        ? checkContentExtent({ kind: "document" }, this.contentContextFor(pkg[TESTIMONY_PATH].captureSha)) : null;
      if (extentBad) return extentBad;

      const basisMd = files.find((f) => f.path === "bundle.md");
      /* Parsed ONCE for both arms below. REC-16's supersession check is NOT
         inquiry-scoped — `supersedes` is in the vocabulary for every type and
         an ungoverned edge is ungoverned wherever it sits — while the basis
         grammar is, so the inquiry-only view is derived from this rather than
         re-parsed. */
      const docFmW = basisMd && typeof basisMd.text === "string"
        ? parseFrontmatter(basisMd.text).data : null;
      /* `promotedType` (D-526, derived at the top of `promote`) is the one value every projection below reads. The
         envelope is the FALLBACK and not the authority: a bundle.md held as a blob, or one stating no type, leaves
         the record nothing else to go on, and that case is byte-identical to what this line did before D-510. */
      const isInquiry = promotedType === "inquiry";
      /* REC-11, REC-18, REC-42: the basis grammar and the subject entity are inquiry's check (its R11). */
      /* REC-16: the supersession edge and the division disclosure are inquiry's check (its R11). */
      /* R3: the basis DAG (C-33.22, C-33.23) is inquiry's check (its R11). */
  }

  /* K31 (promotion R39): legacy-store's share of every promotion's projections, run after `record-core.commit`
     inside the same transaction. The answer's keys promotion does not already carry are added to its answer. */
  #promoteProjections(c) {
    const { pkg, bundleId, base, meta, author, register, files, promotedType, promotedState, owner } = stepContext(c);
    const cur = c.head, newSha = c.bundleSha, docFmW = c.docFm, isInquiry = promotedType === "inquiry";
    const testimony = pkg[TESTIMONY_PATH] || null;
    const surfacing = !cur && promotedType === "inquiry" && typeof pkg.assistantPrincipal === "string" && pkg.assistantPrincipal.trim()
      ? { run: String(pkg.run).trim(), principal: pkg.assistantPrincipal.trim() } : null;
      /* D-497: the SIGHT INDEX follows the bundle row that decides whether this is a project at all. ONE call
         covers all three arrivals — a project created here gains a row carrying the derivation's default, a
         bundle promoted INTO a project gains one, and a bundle promoted OUT of `project` loses its row rather
         than leaving a sight row standing over something that is no longer a project. It is a derivation, so
         it is idempotent: a revision that changes neither recomputes the same row. */
      this.#reindexProjectSight(bundleId);

      /* REC-11, REC-17, REC-82: the superseded-by index and inquiry_basis with its content rows are inquiry's (its R12). */
      /* REC-14 / C-9: inquiry_exclusions is inquiry's projection (its R12). */
      /* REC-12: re-derive this inquiry's per-axis strength CACHE from the legs
         just projected, in the SAME transaction, so the cache can never be a
         revision behind the basis it summarises. It is still only a cache: a
         leg raised in an inquiry BENEATH this one does not re-promote this
         document, so the columns go stale by design and strengthOf() is what
         anything needing the truth calls. */
      this.#writeStrengthProjection(bundleId, isInquiry);

      /* MK-1 / IC-134: the register row is provenance's projection (R1), written before this one. */

      /* MK-1 / D-184: the testimony path's own writes — the words' passage index
         and the content row over them — IN THIS TRANSACTION, so an authored
         bundle never exists without the content its readers expect. It throws
         to roll the whole promotion back rather than return a half. */
      const testimonyWrote = pkg[TESTIMONY_PATH] ? this.#testimonyWithin(bundleId, pkg) : null;

      /* REC-173: the migration replay's row is inquiry's projection (its R12). */

      const after = this.#one(`SELECT bundle_sha, row_version FROM bundles WHERE bundle_id=?`, bundleId);
      return { ok: true, bundleId, bundleSha: after.bundle_sha, rowVersion: after.row_version, owner,
        /* REC-197: present ONLY on a project's creation — the setting it was created with, READ BACK through
           `#visibilityOf` (the one reader) rather than echoed from the request, so an absent field answers
           `hidden` because the record says so. */
        ...(!cur && meta.object_type === "project" ? { visibility: this.#visibilityOf(bundleId) } : {}),
        /* MK-1: present ONLY on the testimony path, which is a method of this
           class, so no existing caller's answer gains a key. */
        ...(testimonyWrote ? { testimony: testimonyWrote } : {}),
      };
  }



  /* CPDF-10 / K73 (1): a member's attestation of a capture's text, and the attestations over a capture: content's. */
  attestText(...a) { return contentOf(this.ctx).attestText(...a); }
  attestationsFor(...a) { return contentOf(this.ctx).attestationsFor(...a); }

  /** Everything the extent checker needs about a capture (K73 (1)): content's. */
  contentContextFor(...a) { return contentOf(this.ctx).contentContextFor(...a); }

  /** REC-82 / SK-7: mint or find a content row, and a credential marking a passage citable: content's (R12–R16). */
  mintContent(...a) { return contentOf(this.ctx).mint(...a); }
  contentMint(...a) { return contentOf(this.ctx).contentMint(...a); }

  /* MK-1 / D-184 / IC-133 / IC-134: the authored bundle, its bytes and its observer reference: provenance's (R28). */
  static observerRef(...a) { return observerRef(...a); }

  testimonyReach(ids) { return basisVersionsOf(this.ctx).testimonyReach(ids); }

  /** op=testify — A MEMBER RECORDS A FIRSTHAND OBSERVATION: provenance's (R28), with the authored flag's fence. */
  testify(...a) { return provenanceOf(this.ctx).testify(...a); }

  // MK-1 / D-184: the testimony path's later work, inside the promotion's transaction, read from the payload under
  // provenance's TESTIMONY_PATH until `extraction`, `content` and `observation-log` register it as their projections
  // (K31). ONE unit over the whole words, at the `document` extent: the content row is minted at that same extent
  // under that same (null) chain, so a `passage:` hit and a citation address one passage under one id. The index
  // observation reads PRESENT because it is: the words are the whole document.
  // N265: NO READING IS WRITTEN, SO THIS PATH DOES NOT GO THROUGH EXTRACTION'S WRITER (`writeReading`, its R19). No
  // reader ran over the words, so there is no reading to write, and inventing one would make the record claim acts
  // nobody performed: the writer's listeners would record a reader run that found no references (observation-log R8)
  // and tier outcomes judged from a chain that does not exist (its R6). N294: the words are indexed through
  // extraction's `indexTestimony` (its R61), whose index notice (R62) observation-log turns into the index row (its
  // R7), so this path writes no index row of its own. The extraction look below is not a formality: without it
  // `op=contentaxis` finds no `extract` row for this capture and calls it NOBODY LOOKED, which is false, since the
  // words ARE the text. It throws to roll the whole promotion back rather than return a half.
  #testimonyWithin(bid, pkg) {
    const indexed = extractionOf(this.ctx).indexTestimony({ bundleId: bid, captureSha: pkg[TESTIMONY_PATH].captureSha,
      words: pkg[TESTIMONY_PATH].words, author: pkg[TESTIMONY_PATH].author });
    const m = this.mintContent({ bundleId: bid, captureSha: pkg[TESTIMONY_PATH].captureSha, extent: { kind: "document" },
                                 mintedBy: pkg[TESTIMONY_PATH].author, at: pkg[TESTIMONY_PATH].recordedAt });
    if (!m.ok) throw new Error(`MK-1: the observation's content row was refused after the extent was checked: ${m.code || m.reason}`);
    const bad = this.#observe({ actorClass: "member", actor: pkg[TESTIMONY_PATH].author, authorityKind: "extract", authority: bid,
      level: "content", subjectKind: "capture", subject: pkg[TESTIMONY_PATH].captureSha, state: "PRESENT", condition: null,
      resultKind: "content", resultRef: m.content_id, detail: "first extraction; a member's authored observation: "
        + "its bytes ARE its text, as written, so the whole document is text and no extraction step stands between them" });
    if (bad) throw new Error(`MK-1: the observation's extraction row was refused: ${JSON.stringify(bad).slice(0, 200)}`);
    return { content_id: m.content_id, indexed: indexed.written };
  }

  /** REC-87: op=transcribe, op=transcriptionattest, op=transcription: content's (R23–R26). */
  transcribe(...a) { return contentOf(this.ctx).transcribe(...a); }
  transcriptionAttest(...a) { return contentOf(this.ctx).transcriptionAttest(...a); }
  transcriptionRead(...a) { return contentOf(this.ctx).transcriptionRead(...a); }

  /* MK-4 / IC-135 / IC-136 / D-681 — THE LEAD (D-194, `MEMBER-KNOWLEDGE-DESIGN.md` §5): observation-log's (R14–R21).
     These delegate, so the object's RPC callers and the frontier's internet arm reach the one instance on this ctx. */
  lead(...a) { return observationLogOf(this.ctx).lead(...a); }
  leadShare(...a) { return observationLogOf(this.ctx).leadShare(...a); }
  leadLook(...a) { return observationLogOf(this.ctx).leadLook(...a); }
  leadRead(...a) { return observationLogOf(this.ctx).leadRead(...a); }
  leadList(...a) { return observationLogOf(this.ctx).leadList(...a); }
  #leadReach(...a) { return observationLogOf(this.ctx).leadReach(...a); }
  #leadReferentVisible(...a) { return observationLogOf(this.ctx).referentVisible(...a); }

  #positionalMember(...a) { return membershipOf(this.ctx).positionalMember(...a); }

  /** R15: a leg's content row, backfilled on first read: inquiry's. */
  ensureLegContent(...a) { return inquiryOf(this.ctx).ensureLegContent(...a); }

  /** The content row behind an id, labelled (R16): content's. */
  contentRow(...a) { return contentOf(this.ctx).contentRow(...a); }

  /** op=content, the fixed-key read (R17–R19), and the crop of a cited PDF image (R32, D-419): content's. */
  contentRead(...a) { return contentOf(this.ctx).contentRead(...a); }
  cropOf(...a) { return contentOf(this.ctx).cropOf(...a); }

  /* REC-36: the bounded backfill for the name index on a store that already
     holds readings. The terms derive from columns `reading_refs` already
     persists, so no document has to be re-read -- unlike the projection
     backfill, which needs the bundle's files. Bounded per pass for the same
     reason #backfillProjection is: a Durable Object has a CPU budget and a large
     store finishes over successive constructions.

     REC-40 CHANGED THE STALENESS TEST, and the old one would now be WRONG rather
     than merely narrow. It read `rr.label IS NOT NULL AND rr.label <> ''`,
     because the label was the only source and a reference with no label could
     never produce a row. The index now also carries the REFERENCE and its KEY,
     which every row has by construction, so a reference with no label at all is
     exactly the row the A and B tiers are about and skipping it would leave the
     identifier tier unreachable on every store migrated forward -- the same
     silently-wrong empty answer this backfill exists to prevent. The test is now
     "no term row of any source", and a reference whose every string normalises
     to nothing (all punctuation) is re-examined on each pass rather than
     excluded: that is a bounded cost the `examined` count reports, and it is the
     conservative direction now that being skipped means being invisible. */
  readingTermsClear(...a) { return extractionOf(this.ctx).readingTermsClear(...a); }
  readingHistoryClear(...a) { return extractionOf(this.ctx).readingHistoryClear(...a); }
  reindexNames(...a) { return extractionOf(this.ctx).reindexNames(...a); }
  readingFor(...a) { return extractionOf(this.ctx).readingFor(...a); }
  transcribedDocuments(...a) { return extractionOf(this.ctx).transcribedDocuments(...a); }

  /* The reverse index Step 4 builds on: every captured document whose reading
     carries this entity reference. The reference is matched AS IT APPEARS — the
     raw kind:key — and is NOT resolved to a canonical entity, so two documents
     that name the same source id land together without any identity model. */
  documentsByReference(...a) { return extractionOf(this.ctx).documentsByReference(...a); }

  /* REC-36 onward: the name lookup (entities R17–R19), the subject registry (FW-6, R1–R8) and the recogniser
     (FW-7, R9–R16) are entities' (`entitiesOf`), their ops in `entitiesOps`. The grade rank, the meaning-layer
     bound and the occurrence bound below stay until connections and progressions take them. */

  /* REC-51: DERIVED from the catalog's own order, never restated. This was
     `{ A: 4, B: 3, C: 2, D: 1 }` — the vocabulary AND its ordering typed out a
     second time, in a file that already imports the array both come from. It
     agreed with `BASIS_GRADES` at zero cost and would have disagreed with it
     silently the day the catalog gained or lost a letter, which is the MAP RULE
     and D-164's "solve it once" one level below the doctrine SENTENCES REC-43,
     REC-48 and REC-50 composed.
     `BASIS_GRADES` is strongest-first, so a HIGHER number is a STRONGER grade
     and every `>`/`<` comparison below keeps the sense it has always had. While
     the catalog reads A,B,C,D this evaluates to exactly the map it replaces —
     nothing moves today, and it is a function of the catalog from now on. */
  static #GRADE_RANK = Object.fromEntries(
    BASIS_GRADES.map((g, i) => [g, BASIS_GRADES.length - i]));
  /* established is a PROPERTY OF THE GRADE, computed here and stored, so a Grade C can
     never be read back as established (an equality that costs nothing is not evidence,
     CLAUDE.md): A and B rest on a captured identifier at both ends; C is correspondence
     awaiting a member's confirmation; D is bare testimony. */
  static #isEstablished(grade) { return grade === "A" || grade === "B"; }

  /* ===================== REC-60 / D-225 · THE MEANING-LAYER BOUND ===================   *
   * THE THREE READS BELOW WERE UNBOUNDED, and the reason nothing caught it is worth more
   * than the fix. REC-57 swept the CAPPED ops and made every one of them publish the bound
   * it applied — but its roster was built by finding methods that CARRY A CAP, so a method
   * with no cap at all was invisible to the instrument that would have flagged it. A walk
   * that enumerates the ops with envelopes cannot see the op with no envelope. That is why
   * `test/meaning-bounds.test.mjs` starts from RETURN SHAPES instead: it asks what a method
   * PUBLISHES, not what it clamps, and an unbounded collection is exactly what it looks for.
   *
   * THE GROWTH HAS TEETH, and it is not linear on the worst one. `connections` for one
   * entity is one row per PAIR of captures concerning it — D-224's k(k-1)/2 — so a hundred
   * documents about one subject is 4,950 rows in a single answer, and THE MOST IMPORTANT
   * ENTITY PRODUCES THE LARGEST RESPONSE. `concerns` and `resolutions` grow linearly, but
   * they grow with the record and nothing stopped them.
   *
   * NEITHER NUMBER IS NEW, deliberately. 500 is `op=readingname`'s ceiling and `query.mjs`'s
   * `LIMIT_MAX`; 5000 is `op=list`'s ceiling, which `op=projection` reused at REC-59 rather
   * than inventing a second one. A twelfth figure would be a twelfth thing to remember.
   *
   * AND NO CURSOR IS MINTED. REC-55's declined-second-copy rule: `op=readingname` — the
   * closest sibling, a keyed read over the same meaning layer — answers with `limit` and
   * `truncated` and no cursor, and a caller that is cut raises `limit` toward the published
   * ceiling. WHAT THAT DOES NOT GIVE, said plainly rather than left to be discovered: a
   * caller cut at the CEILING has no way past it. On the quadratic read that is reachable
   * with about a hundred documents on one subject. It is the honest bound rather than the
   * complete answer, and the complete answer needs the query surface D-222/REC-62 is for. */
  static #MEANING_LIMIT_DEFAULT = 500;
  static #MEANING_LIMIT_MAX = 5000;

  /* op=resolve and op=resolvetestify (entities R11, R12): entities' services; the store arms the connection-derive
     sweep when an inserted or raised resolution dirtied an entity (REC-5 / D-122; R13's listener stamps it). */
  async resolveReferences(body = {}) {
    const r = entitiesOf(this.ctx).resolve(body);
    const moved = (x) => !!x && x.ok && (x.resolved || []).some((m) => !m.kept);
    if (moved(r) || (r.items || []).some((o) => o.outcome === "applied" && (o.resolved || []).some((m) => !m.kept)))
      await this.#armConnectionDerive();
    return r;
  }
  async testifyResolution(body = {}) {
    const r = entitiesOf(this.ctx).testify(body);
    if (r.ok && !r.kept) await this.#armConnectionDerive();
    return r;
  }

  defineProgression(...a) { return progressionsOf(this.ctx).defineProgression(...a); }
  readProgression(...a) { return progressionsOf(this.ctx).readProgression(...a); }
  threadInstance(...a) { return progressionsOf(this.ctx).threadInstance(...a); }
  readInstance(...a) { return progressionsOf(this.ctx).readInstance(...a); }
  dischargeStage(...a) { return progressionsOf(this.ctx).dischargeStage(...a); }
  readExceptions(...a) { return progressionsOf(this.ctx).readExceptions(...a); }
  proposalsFeed(...a) { return progressionsOf(this.ctx).proposalsFeed(...a); }
  captureProgressions(...a) { return progressionsOf(this.ctx).captureProgressions(...a); }

  /* The strongest 8.1 grade each captured document resolved to this entity at, with its
     bundle -- the SAME collapse op=concerns and op=connect make, so a placement's end-grade
     is exactly the grade that document appears at in the reverse index. Reuses the resolution
     grade rank so the instance axis cannot drift from the connection axis. */
  #strongestResolutionsFor(entityId) {
    return entitiesOf(this.ctx).strongestByCapture(entityId);
  }

  /* R13: the earned registry and the declared subject: inquiry's. */
  #subjectEntityOf(...a) { return inquiryOf(this.ctx).subjectEntityOf(...a); }
  earnedBasisRegistry(...a) { return inquiryOf(this.ctx).earned(...a); }
  earnedRegistryForDoc(...a) { return inquiryOf(this.ctx).earnedForDoc(...a); }

  /* The injectable clock. Env-overridable exactly as REC-5 made its cadence/batch env-overridable
     (BIO_NOW_MS), so a suite pins "now" and the overdue computation is deterministic; a caller may
     also pass an explicit instant (op=proposals&now=<ms>, an as-of read, the same seam op=sourcereach
     opened for its time-armed verdict). Falls through to the wall clock in production. Milliseconds. */
  #nowMs(explicit) {
    /* an ABSENT param is null (or "") -- fall through to env, NOT to Number(null)===0 (epoch). */
    if (explicit !== undefined && explicit !== null && explicit !== "") {
      const e = Number(explicit);
      if (Number.isFinite(e) && e >= 0) return e;
    }
    const v = Number(this.env && this.env.BIO_NOW_MS);
    if (Number.isFinite(v) && v >= 0) return v;
    return Date.now();
  }




  /* D-432: THE LIVE ROWS EACH MINT SITE'S `taken` READS, per prefix, as `[prefix, table, column]` — the seed's half of
     two readers of one fact. `mint-ledger.test.mjs` reads every `this.#mintOpaqueId(` call and holds this list against
     the tables and columns its `taken` asks, so a site that learns a table and a seed that does not fail there rather
     than going quietly blind. */
  static #MINT_LEDGER_LIVE = Object.freeze([
    ["PROJ", "bundles", "bundle_id"],
    ["CASE", "cases", "case_id"], ["CASE", "published_cases", "case_id"],
    ["CASE", "case_documents", "case_id"], ["CASE", "published_case_members", "case_id"],
    ["TASK", "tasks", "id"],
  ]);


  /** REC-131 / IC-148 — THE WIRE'S COUNTS. `op=stats`, `op=selftest` and `op=livefire` all read
   *  this. Every COUNT is the same for every class (BOB #15's corrected ruling,
   *  `MEMBER-KNOWLEDGE-DESIGN.md` §5): `leads` is on it for no class, and the log is published as
   *  `observationsNonLead`. It REPLACES REC-129's `operator` stamp (IC-144), which selected an
   *  admin-only answer over COUNTS.
   *
   *  `capacity` IS THE ONE CLASS DISCRIMINATION LEFT, AND IT GOVERNS `dbBytes` AND NOTHING ELSE
   *  (BOB #15, resuming REC-131). The database's size moves in whole pages on EVERY write, a
   *  lead's included, so a member diffing it across a colleague's authoring can detect a large
   *  lead; capacity is an operator need, so the admin class keeps it and member and probe do not.
   *  It is the SERVER'S word: `index.mjs` sets it from the authenticated class AFTER copying the
   *  caller's parameters (op=stats, op=selftest's relay, op=livefire's call), so a caller's
   *  `capacity=` is overwritten, never honoured. An absent stamp is `false` — a door that forgets
   *  to stamp loses `dbBytes` rather than leaking it. It is a stamp and not a second method
   *  because it must ride the one DO route every door already fetches. */
  stats({ capacity = false, viewer } = {}) { return this.#counts({ proof: false, capacity: capacity === true, viewer }); }

  /** D-464 — THE BUNDLES THIS CALLER CANNOT SEE, as a set subtraction: every bundle the caller's own
   *  `viewerPredicate` does not pass, the complement of the one compiled gate (a use, not a second rule). The
   *  shared-inquiry candidates and `#counts` subtract it. `null` when there is nothing to subtract: a credential the
   *  gate does not filter (scope `member`) and a viewer NEVER SENT (`undefined`: a direct internal call, which stays
   *  WHOLE, purge's proof among them). A viewer sent but unrecognised is DENY, so every bundle is hidden: fails closed.
   *
   *  D-486's RUN subtraction (BOB #32: a hidden project's run is its thinking; the bytes stay shared, only the run's
   *  attribution is withheld) is NOT spelled here any more. It is ai-runs' one predicate, `hiddenRuns` (its R42,
   *  N191), which `#counts` asks through `#hiddenRunTail` below. */
  #hiddenBundles(viewer) {
    const gate = viewer === undefined ? null : viewerPredicate(viewer);
    return gate && gate.scope !== "member"
      ? { sql: `(SELECT bundle_id FROM bundles EXCEPT SELECT b.bundle_id FROM bundles b WHERE (${gate.sql}))`, args: gate.args }
      : null;
  }

  /** N191 (K333, K335): ai-runs' R42 tail for the caller's sight — over `observation_log` without `column`, over a
   *  column naming a run id with one. R42 fails CLOSED on an absent viewer, so it is not asked for a viewer never
   *  sent: this store's own convention keeps a direct internal call WHOLE (the empty tail), as `#hiddenBundles` does. */
  #hiddenRunTail(viewer, column = undefined) {
    return viewer === undefined ? { sql: "", args: [] } : hiddenRuns(viewer, column);
  }


  /** The one body behind both answers, so the wire's counts and purge's proof cannot drift apart
   *  on any key but the ones the ruling names. `proof` is PRIVATE: only `purge` passes it, because
   *  its before/after ARE D-113's proof that it took what it says it took, and that proof stays
   *  WHOLE (§5: *the purge proof's own count stays whole*) — `observations` over the whole log,
   *  `leads`, and `dbBytes`, exactly as `op=purge` has always answered. No route reaches it. */
  #counts({ proof, capacity = false, viewer }) {
    /* D-464 — A COUNT IS TAKEN THROUGH THE CALLER'S OWN SIGHT (Membership v2 §7.9, *"Not its existence"*).
     *
     * WHAT WAS WRONG, measured at the op (`project-sight.test.mjs` §8; MEASUREMENTS M-122 first saw it): every
     * counter here was `count(*)` over the whole table, so a member diffing their own `op=stats` across a colleague's
     * work learned that a project they were never invited to had been CREATED (`bundles`, `files`, `refs`, `indexed`,
     * `projectParticipants`) and REVISED (`history`, `files`, `refs`). BOB #15's rule (MEMBER-KNOWLEDGE-DESIGN §5, *A
     * COUNT IS A DISCLOSURE OF EXISTENCE*) is the same sentence: a count over rows the caller could not all read.
     *
     * THE FIX IS SUBTRACTION, NEVER A SECOND RULE. `hid` is every bundle the caller's `viewerPredicate` does NOT pass
     * — the complement of the one compiled gate, interpolated (a use, not a mint) — and every counter whose rows NAME
     * a bundle drops the rows naming one in `hid`. Today the gate hides PROJECTS only, so `hid` is the projects the
     * caller cannot see; were the gate ever to hide more, these counts follow it without an edit. A key is named per
     * counter below (which column names a bundle); a counter with no such column counts rows that name no bundle —
     * an instance fact (REC-110) — and is untouched.
     *
     * WHO IS FILTERED IS THE GATE'S WORD, NOT THIS FUNCTION'S. A credential the gate does not filter (scope `member`:
     * the four token classes and an organisation `ai` key) gets `hid` = nothing, i.e. exactly the count it always got,
     * and an enrolled ADMINISTRATOR's session passes every project (§7.9). A viewer SENT but not
     * recognised (an empty stamp included) is DENY, so `hid` is every bundle — fails closed. A viewer NEVER SENT
     * (`undefined`: the DO route passes one only when the parameter is present) is a direct INTERNAL call and stays
     * WHOLE — purge's proof, and the suites that read the store's own counters — `Store#rosterInSight`'s never-sent
     * precedent. So the stamp is LOAD-BEARING at the control plane: every door (`op=stats`, `op=selftest`,
     * `op=livefire`) sets it, and the `stats-stamp-dropped` control arm measures what dropping it discloses.
     * CORRECTED before landing: the first draft read an absent parameter as DENY, which zeroed the counters four
     * store-level suites read straight off the DO route (projects, search, selection, status) — a direct internal
     * call is not a caller. */
    /* D-464's bundle subtraction is `#hiddenBundles`; D-486's run subtraction is ai-runs' R42 through
       `#hiddenRunTail` (N191), for `aiRunBounds`, `aiRunLog` and `observationsNonLead`. Both keep D-464's reading of
       the never-sent stamp: `undefined` is a direct internal call and stays WHOLE. */
    const hid = this.#hiddenBundles(viewer);
    const runTail = this.#hiddenRunTail(viewer), boundsTail = this.#hiddenRunTail(viewer, "run");
    /* `COALESCE(k, '')`: a NULL key names no bundle, and `NULL NOT IN (…)` is NULL — the row would be dropped. */
    const nx = (t, where, keys = []) => {
      const conds = where ? [where] : [], args = [];
      if (hid) for (const k of keys) { conds.push(`COALESCE(${k}, '') NOT IN ${hid.sql}`); args.push(...hid.args); }
      return this.#one(`SELECT count(*) c FROM ${t}${conds.length ? ` WHERE ${conds.join(" AND ")}` : ""}`, ...args).c;
    };
    const n = (t, ...keys) => nx(t, null, keys);
    const mon = monitoringOf(this.ctx).counts();
    /* Each provider's counts asked once per answer, not once per key. */
    const ret = retrievalOf(this.ctx).counts(hid), prod = runProductionsOf(this.ctx).counts(hid);
    return {
      bundles: n("bundles", "bundle_id"), files: n("files", "bundle_id"), history: n("history", "bundle_id"),
      refs: n("refs", "bundle_id", "target_id"), register: n("register", "bundle_id"), indexed: ret.indexed,
      /* REC-91 / D-113: the CONTENT-GRAIN TEXT INDEX, reported for exactly the
         reason every other row on this list is -- so a purge can PROVE it took
         the rows rather than assert it.
         *
         * AND THE SECOND FIGURE IS NOT A COUNT, WHICH IS A CORRECTION THIS
         * ITEM'S OWN NEGATIVE CONTROL FORCED. The first draft reported
         * `textIndexed: n("capture_text_fts")` beside the base count, on the
         * reasoning that the two must agree and that a suite asserting it would
         * be asserting the trigger discipline. **They agree for free.** An
         * FTS5 EXTERNAL-CONTENT table answers `count(*)` OUT OF ITS CONTENT
         * TABLE, so the figure was the base count read a second time — measured
         * on workerd: with a deliberately ORPHANED index entry present, base and
         * "index" both read 1 while the orphaned term still MATCHED. That is
         * CLAUDE.md's costs-nothing rule exactly, in an instrument written to
         * detect the one thing it could not see, and the `replace` control arm
         * is what caught it: the arm planted a real orphan and the parity
         * assertion stayed green.
         *
         * WHAT IS REPORTED INSTEAD IS A REAL QUESTION WITH A REAL ANSWER. FTS5's
         * `integrity-check` AT RANK 1 verifies the index AGAINST THE CONTENT
         * TABLE and throws `SQLITE_CORRUPT_VTAB` when they disagree — measured,
         * and measured to catch the same orphan plain `integrity-check` (rank 0)
         * passes over. It costs a walk of the index, which is why it belongs on
         * an admin read taken deliberately and not on a member path. */
      textUnits: n("capture_text", "bundle_id"),
      textIndexOk: (() => {
        try { this.sql.exec(`INSERT INTO capture_text_fts(capture_text_fts, rank) VALUES('integrity-check', 1)`); return true; }
        catch { return false; }
      })(),
      selections: ret.selections,
      selectionItems: ret.selectionItems,
      /* Reported so a purge can prove it took them, and so an operator can see
         inbox and reachability depth without a second call. */
      tasks: n("tasks", "refers_to"), taskQueue: n("task_queue"), sourceReachability: n("source_reachability"),
      /* REC-26: the monitoring consumers' idempotence state, reported so a purge
         can PROVE it took them (D-113) and so an operator can see a tick that is
         still open — a non-zero monitorTickEpoch means the last tick failed on
         something and the next one will be its retry. */
      /* REC-191: and the address types. The three are monitoring's tables, counted whole-store by its R46 (N266). */
      monitorFired: mon.monitorFired, monitorTickEpoch: mon.monitorTickEpoch, monitorAddressType: mon.monitorAddressType,
      /* FW-6: the subject registry's depth, reported so a whole-store purge can
         PROVE it cleared the registry rather than assert it (D-113). */
      entities: n("entities"), entityAliases: n("entity_aliases"), entityRelations: n("entity_relations"),
      /* FW-7: the recogniser's resolutions, reported so a purge can PROVE it took them. */
      resolutions: n("resolutions", "bundle_id"),
      /* FW-8: the derived connections and the member-declared progression definitions,
         reported so a whole-store purge can PROVE it cleared them (D-113). */
      connections: n("connections", "a_bundle_id", "b_bundle_id"), progressionDefs: n("progression_defs"),
      /* REC-122: the member on-point choices, so a purge can PROVE it took them (D-113). Keyed by both ends'
         bundles, as `connections` is (D-464's subtraction, keyed at c19-batch10's merge of D-464). */
      connectionPairChoices: n("connection_pair_choices", "a_bundle_id", "b_bundle_id"),
      progressionStages: n("progression_stages"),
      /* REC-184: D-128's version history, counted APART from the current-version tables above —
         a revision adds a version row and replaces the current one, so the current count alone
         cannot tell one definition revised five times from one never revised — and so a whole-store
         purge can PROVE it took the history (D-113). */
      progressionDefVersions: n("progression_def_versions"),
      progressionStageVersions: n("progression_stage_versions"),
      /* FW-9: the threaded progression instances, reported so a purge can PROVE it cleared
         them (D-113). */
      progressionInstances: n("progression_instances", "bundle_id"),
      /* FW-10: the exception documents that discharge a lawful skip, reported so a purge can
         PROVE it cleared them (D-113). */
      progressionExceptions: n("progression_exceptions", "bundle_id"),
      /* REC-5 / D-122: the connection-derive dirty-set's depth, reported so a whole-store
         purge can PROVE it cleared the pending work-queue (D-113) and so an operator can
         see how many entities are awaiting a sweep. */
      connectionDirty: n("connection_dirty"),
      /* REC-7 / D-79: the recorded proposal dispositions, reported so a whole-store purge can
         PROVE it cleared the aged decisions (D-113) and an operator can see how many of the
         record's own questions a member has deferred or dismissed. */
      proposalDispositions: n("proposal_dispositions"),
      /* D-266 / IC-60: the JUDGMENT-LAYER dispositions, counted APART from the instance-wide ones
         above and never folded into them. One number for both would report a member's decisions as
         a single quantity while the two govern different sets of feeds — and it is precisely the
         distinction this item exists to draw, so the count that proves the purge took them must
         not be the one place it is lost. */
      findingDispositions: n("finding_dispositions", "project_id"),
      /* REC-27 / D-137: the participation graph and the pending owner-governance
         votes, reported so a purge can PROVE it took them (both are keyed on
         project_id, a bundle id, and were the silent-leftover the D-113 check
         could not see). */
      projectParticipants: n("project_participants", "project_id"),
      projectOwnerVotes: n("project_owner_votes", "project_id"),
      /* REC-21: members' personal queue state, reported so a purge can PROVE it
         cleared the mutes and snoozes it took (D-113). A COUNT OF ROWS AND
         NOTHING ELSE — stats is an operator surface and whose attention is muted
         on what is not an operator's business. */
      queueState: n("queue_state", "case_id"),
      /* D-125: the item mutes, a COUNT for queueState's reason. */
      queueItemMutes: n("queue_item_mutes"),
      /* REC-82 / IC-83: the content rows — the parts of documents this record's
         edges point at — reported so a purge can PROVE it took them (D-113)
         rather than assert it, and so an operator can see the content axis's
         depth beside the document count it has always been able to see. */
      content: n("content", "bundle_id"),
      /* REC-82: and how many of them were minted against a transcription that
         has since MOVED. Counted apart from the total and never folded into it:
         a re-extraction marks rows stale and DELETES NONE, so the total alone
         cannot distinguish "nothing was re-read" from "everything was" — which
         is the one fact an operator needs before believing a content-grain
         answer, and the one this count exists to make visible. */
      contentStale: nx("content", "stale=1", ["bundle_id"]),
      /* SK-8: the EXTRACT role's proposed readings, reported so a purge can
         PROVE it took them (D-113) and — the part that is not housekeeping — so
         an operator can see the assistant's production volume beside the content
         axis it feeds, without opening one. A COUNT AND NOTHING ELSE: what a
         machine proposed is not an operator surface, the same line `queueState`
         and `aiRuns` draw. The minted-to-cited ratio §7.3 (6) asks for is NOT
         here and is deliberately not: it is scoped to a run or a document
         (`op=extractproposals`), and an instance-wide fraction would average
         across projects that have nothing to do with each other. */
      proposedReadings: prod.proposedReadings,
      /* IS-6: the investigative runs, their budgets and their observation logs,
         reported so a whole-store purge can PROVE it took them (D-113) and so an
         operator can see how many runs are in flight without opening one. A
         COUNT AND NOTHING ELSE — what a run is looking into is not an operator
         surface, the same line queueState draws one row up. */
      aiRuns: n("ai_runs", "context_id"),
      aiRunBounds: this.#one(`SELECT count(*) c FROM ai_run_bounds WHERE 1=1${boundsTail.sql}`, ...boundsTail.args).c,
      /* D-85: the links from an assistant's questions to their runs, counted for IS-6's reason one line up — so a
         purge can PROVE it took them (D-113). A COUNT AND NOTHING ELSE: which run opened which question is read
         per question, under that question's gate (`op=projection`'s `surfaced_in`). */
      inquiryRunSurfacings: n("inquiry_run_surfacings", "bundle_id"),
      /* REC-173: the questions whose creation was a verified migration replay, counted for D-85's reason one line up. */
      inquiryMigrationReplays: n("inquiry_migration_replays", "bundle_id"),
      /* REC-93 / IC-92: `aiRunLog` was a count of `ai_run_log`, which no longer
         exists — `OBSERVATION-LOG-DESIGN.md` §4.4 folded it into `observations`
         and `#migrate` drops it. The key is KEPT AND RE-AIMED at the folded rows
         rather than removed, because `op=purge` publishes these counters as its
         proof that it took what it says it took (D-113) and a key that vanishes
         from that proof reads as a table nobody is checking. `observations` is
         counted WHOLE beside it: the log is the coverage record and its size is
         an operator fact, while what any single row was looking for is not. */
      /* D-486 / BOB #32 (2026-09-24): AND IT IS TAKEN THROUGH THE CALLER'S OWN SIGHT. This key is the
         `authority_kind = 'run'` SLICE of the log, so every row it counts is a run saying it looked —
         which for a project the caller cannot see is that project's THINKING, withheld by the ruling.
         `runTail` is ai-runs' R42 (`hiddenRuns`, N191), the one predicate this key, `observationsNonLead` below and
         retrieval's frontier tallies read. Unfiltered callers get the empty tail and the count they always got;
         purge's `observations` below stays WHOLE. */
      aiRunLog: this.#one(`SELECT count(*) c FROM observation_log WHERE authority_kind = 'run'${runTail.sql}`, ...runTail.args).c,
      /* REC-131 / IC-148 — `leads` IS NOT ON THE WIRE FOR ANY CLASS, AND THE WIRE'S LOG COUNT IS A
         DIFFERENT KEY FROM PURGE'S. BOB #15's CORRECTED ruling (`MEMBER-KNOWLEDGE-DESIGN.md` §5, *A
         COUNT IS A DISCLOSURE OF EXISTENCE*): a counter over rows a caller could not all read goes
         only to a caller who could read them all, and for leads THAT CALLER DOES NOT EXIST —
         `#leadVisibleTo` reaches no `class:*` credential and skips the administrator arm on purpose,
         so the admin token reads no lead either. REC-129 (IC-144) handed both keys to the admin
         class; that was the overclaim, and this supersedes it.
         *
         * ONE KEY NEVER CARRIES TWO MEANINGS (BOB.md rule 7, BOB #15 resuming REC-131). The wire's
         * count EXCLUDES lead looks, so it is published as `observationsNonLead` — a name that
         * states its predicate (`authority_kind <> 'lead'`), so that a later construct ruled
         * existence-private cannot join the exclusion without a rename, i.e. without an IC. Purge's
         * `observations` keeps the WHOLE-log meaning it has always had. The wire carries no
         * `observations` key at all, so no reader can compare the two under one name. It stays on
         * the wire because OBSERVATION-LOG-DESIGN §6's REC-110 ruling rests on it (premise 1): the
         * three built frontier levels' tallies count no lead row either. `aiRunLog` above is
         * untouched: no lead act writes a 'run' row. */
      ...(proof
        ? { observations: n("observation_log") }   /* PURGE'S PROOF: the WHOLE log. The TABLE it counts is `observation_log` — renamed by CONDUCT #11 at integration on BOB #11's correction, because one word over three unrelated things is the defect, not the noun */
        : { observationsNonLead: this.#one(
              /* D-486 / BOB #32: the wire's log count subtracts a hidden project's RUN rows for the same reason
                 `aiRunLog` does — and ONLY those. The lead exclusion and this one are two predicates over one
                 table and are deliberately not folded: `authority_kind <> 'lead'` states the key's NAME (REC-131:
                 a key never carries two meanings), while the run subtraction is the CALLER's sight and moves with
                 the viewer. A rename would be an IC; this is a subtraction inside the name the key already has. */
              `SELECT count(*) c FROM observation_log WHERE authority_kind <> 'lead'${runTail.sql}`, ...runTail.args).c }),
      /* MK-4 / IC-136: a COUNT of members' leads and nothing else, so a purge can
         PROVE it took them (D-113). What any lead says is not an operator fact —
         and since REC-131, neither is how many there are: purge's proof only. */
      ...(proof ? { leads: n("leads") } : {}),
      /* D-162: the themes and their placements, a purge's PROOF only (D-113). Not on op=stats:
         a count of members' lenses is not an operator fact this item was asked to publish. */
      ...(proof ? { themes: n("themes"), themePlacements: n("theme_placements") } : {}),
      /* PL-1 / IS-1: the inquiry's alternative accounts of its evidence and
         their legs, reported so a purge can PROVE it took them (D-113). A COUNT
         AND NOTHING ELSE, the same line queueState and aiRuns draw: how many
         readings of the evidence exist is an operator fact, and what they say is
         not an operator surface. */
      basisVersions: n("inquiry_basis_versions", "bundle_id"),
      basisVersionLegs: n("inquiry_basis_version_legs", "bundle_id", "target_id"),
      /* PL-3 / IS-4: F10's stored refusals, reported so a purge can PROVE it
         took them (D-113) and so an operator can see that a run is looping
         against a refusal without opening one. A COUNT AND NOTHING ELSE — the
         same line queueState, aiRuns and basisVersions draw. */
      suggestRefusals: prod.suggestRefusals,
      /* PL-4 / IS-4: the outbound work list, reported for the same reason and
         with one more of its own — this is the only counter in the store that
         says how much traffic this instance is about to send to somebody else's
         server, and a purge that reported scope ALL while it stood would leave a
         leftover visible from OUTSIDE the instance. */
      captureRequests: n("capture_requests", "lead_inquiry"),

      /* PL-12 / D-84: the declared-bias statements and the adoptions that put
         them in force, reported so a whole-store purge can PROVE it took them
         (D-113) and so an operator can see that a lens IS in force without
         opening one. A COUNT AND NOTHING ELSE — what a group's declared bias
         SAYS is the group's business and travels with their published work,
         not an operator surface, the same line queueState and aiRuns draw. */
      /* N328: bias's own `counts(hid)` (its R42), the same subtraction by its statement's bundle and its adoption's
         bundle or project. */
      ...biasOf(this.ctx).counts(hid),
      /* REC-63 / DEC-56: the standing route markers, reported so a whole-store
         purge can PROVE it took them (D-113) and so an operator can see that the
         record is carrying doubts at all without having to sweep for them. */
      routeMarks: n("provenance_route_marks", "bundle_id"),
      /* REC-131 / IC-148: the ADMIN class's and purge's only — see `stats()`. THE RESIDUE, STATED
         RATHER THAN HIDDEN (BOB #15): the admin class still receives a figure that moves in whole
         pages on every write, a large lead's included, so the operator can detect that SOMETHING
         large was written; it cannot tell a lead from any other write, and no lead is readable to it. */
      ...((proof || capacity) ? { dbBytes: this.ctx.storage.sql.databaseSize } : {}),
    };
  }

  /* R11, R16: the basis cycle guard and the basis reads: inquiry's. */
  #basisCyclePath(...a) { return inquiryOf(this.ctx).cyclePath(...a); }
  basisFor(...a) { return inquiryOf(this.ctx).basisFor(...a); }
  restingOn(...a) { return inquiryOf(this.ctx).restingOn(...a); }

  /* REC-12: the strength pair is `strength`'s (its R1–R5); this delegate serves the callers still here. The axes
     are its `STRENGTH_AXES`, re-exported where this file's callers name them. */
  static STRENGTH_AXES = STRENGTH_AXES;
  strengthOf(bundleId) { return strengthModule(this.ctx).strengthOf(bundleId); }

  /* R14: one leg's capture letter against what its target earns: inquiry's `legCapped`. */
  static #capturedAt(...a) { return legCapped(...a); }


  /* REC-12: the projection CACHE, per axis, written inside promote's
     transaction right after the inquiry_basis projection it derives from.

     A CACHE AND NEVER THE AUTHORITY, and the distinction is not decoration: a
     stored strength goes stale the moment a leg anywhere beneath it is raised
     (`resolutions` grades are explicitly IMPROVABLE, and an inquiry this one
     rests on can be re-promoted without touching this row). It exists so that
     "every inquiry at B or better on an axis" is an indexed query rather than
     a scan of every basis in the store; anything that must be RIGHT calls
     strengthOf().

     REC-108 / D-379 RULED ON THIS COLUMN AND LEFT IT EXACTLY AS IT IS, which is
     worth stating HERE because this is where the next reader will come looking.
     REC-105 opened a SECOND path to staleness — a DOCUMENT being re-read moves
     the registry ceiling `strengthOf()` now caps by, so this row can hold a
     letter STRONGER than the record earns, without any member acting on the
     question. D-379 rowed two answers: re-walk the dependents at the re-read, or
     make every route into this column STATE what it is a value of. The second
     was taken. The first would have made this column fresh along the NEW path
     and left it stale along REC-12's ORIGINAL one (a leg raised beneath this
     inquiry still does not re-promote it, and nothing re-projects an ancestor) —
     a cache fresh one way and stale another, about which the one honest sentence
     below can no longer be said — and it would have put an unbounded fan-out
     (every `inquiry_basis.target_id` dependent, each needing a full walk) inside
     op=promote's transaction. `query.mjs`'s `CACHED_FIELDS` carries the ruling
     and the evidence; the answer a member reads now names this column, names
     `op=inquirystrength` as the authority, and says which of the three routes it
     was reached by. NOTHING HERE MOVED, and that is the disposition, not an
     omission.

     PER AXIS, in two columns and never one: a single cached letter is exactly
     the composed scalar DEC-21 forbids, and a column is where one would grow.
     The STATE column beside each grade is what keeps `unrated` distinguishable
     from `undetermined` and both distinguishable from "never projected", which
     one nullable grade column cannot do.

     REC-18 adds `inquiry_subject_entity` to this write, and it is NOT a cache in
     the same sense as the four columns above: it is a straight projection of one
     authored scalar, like every S-10 column, and it goes stale only when the
     document changes — which re-promotes and re-writes it. It is written HERE
     rather than in #writeProjection because it is inquiry-only and this is the
     inquiry projection writer; #writeProjection runs for every object type and
     would have to learn a type test to hold it. */
  #writeStrengthProjection(bundleId, isInquiry) {
    if (!isInquiry) return null;
    const s = this.strengthOf(bundleId);
    this.sql.exec(
      `UPDATE bundles SET inquiry_capture_strength=?, inquiry_capture_state=?,
              inquiry_connection_strength=?, inquiry_connection_state=?
         WHERE bundle_id=?`,
      s.capture.grade, s.capture.state, s.connection.grade, s.connection.state, bundleId);
    return s;
  }

  /* Eviction. The store is append-only by doctrine, so removal is deliberate,
     never implicit, and admin-only at the control plane. Two modes: one bundle
     with its whole lineage, or everything.

     seq is deliberately NOT reset. allocid must never reissue an identifier
     that has already existed, so a purged store keeps counting from where it
     stopped. A purge that reset the counter would make identifiers ambiguous
     across the purge boundary, which is worse than a gap.

     D-432: minted_ids is NOT cleared either, in EITHER arm, and for exactly
     seq's reason — it is the opaque minter's memory, as seq is the counter's.
     The gated prefixes (PROJ, CASE, DRAFT, RVG, TASK) have no counter: their ids
     are drawn at random and asked against that ledger AND the live rows of their
     kind, and this method deletes the live rows. Clearing the ledger with them
     would let a new object be minted at a purged object's id, and a citation of
     the old one would then resolve to the new one without a word. CLAUDE.md's
     rule that a DERIVED table must be named here does not reach it: nothing in
     it is derived from the corpus, and clearing it is the defect it closes.
     hygiene.test.mjs names it among the purge exemptions, beside seq, and
     mint-ledger.test.mjs pins that no statement anywhere deletes from it.

     R2 is untouched. Registered captures are immutable and content-addressed,
     so orphaning them costs storage but cannot corrupt anything. Reclaiming
     them is a separate sweep against the register, not part of this. */
  purge({ bundleId = null } = {}) {
    const before = this.#counts({ proof: true });
    // record-core R22: every declared table (legacy-store's are declared in the constructor), in one transaction.
    recordOf(this.ctx).transact(() => {
      recordOf(this.ctx).purge({ bundleId });
      if (bundleId) captureRequestsOf(this.ctx).clearLead(bundleId);
    });
    const after = this.#counts({ proof: true });
    const d = (k) => before[k] - after[k];
    return {
      ok: true, scope: bundleId || "ALL", before, after,
      removed: { bundles: d("bundles"), files: d("files"), history: d("history"),
                 refs: d("refs"), register: d("register"),
                 tasks: d("tasks"), taskQueue: d("taskQueue"),
                 sourceReachability: d("sourceReachability"),
                 /* FW-6: the registry rows a whole-store purge took (D-113). */
                 entities: d("entities"), entityAliases: d("entityAliases"),
                 entityRelations: d("entityRelations"),
                 /* FW-7: the recogniser's resolutions a purge took (D-113). */
                 resolutions: d("resolutions"),
                 /* FW-8: the derived connections and member-declared progression
                    definitions a whole-store purge took (D-113). */
                 connections: d("connections"), progressionDefs: d("progressionDefs"),
                 /* REC-122: the on-point choices a purge took (D-113). */
                 connectionPairChoices: d("connectionPairChoices"),
                 progressionStages: d("progressionStages"),
                 /* REC-184: D-128's version history a whole-store purge took (D-113). */
                 progressionDefVersions: d("progressionDefVersions"),
                 progressionStageVersions: d("progressionStageVersions"),
                 /* FW-9: the threaded progression instances a purge took (D-113). */
                 progressionInstances: d("progressionInstances"),
                 /* FW-10: the exception documents a purge took (D-113). */
                 progressionExceptions: d("progressionExceptions"),
                 /* REC-5 / D-122: the pending connection-derive dirt a whole-store purge took (D-113). */
                 connectionDirty: d("connectionDirty"),
                 /* REC-7 / D-79: the aged proposal dispositions a whole-store purge took (D-113). */
                 proposalDispositions: d("proposalDispositions"),
                 /* REC-21: the mutes and snoozes a purge took (D-113) — per-bundle
                    for a case bundle, everything for scope ALL. */
                 queueState: d("queueState"),
                 /* REC-27 / D-137: the participation graph and pending owner votes a purge
                    took — per-bundle for a project bundle, everything for scope ALL. */
                 projectParticipants: d("projectParticipants"),
                 projectOwnerVotes: d("projectOwnerVotes"),
                 /* IS-6 / D-113: the runs, their budgets and their observation
                    logs a whole-store purge took. */
                 aiRuns: d("aiRuns"), aiRunBounds: d("aiRunBounds"), aiRunLog: d("aiRunLog"),
                 /* MK-4 / D-113: the leads a whole-store purge took. */
                 leads: d("leads"),
                 /* D-162 / D-113: the themes and placements a purge took. */
                 themes: d("themes"), themePlacements: d("themePlacements"),
                 /* PL-3 / IS-4 / D-113: the stored refusals a purge took, proved
                    by consequence rather than asserted. */
                 suggestRefusals: d("suggestRefusals"),
                 /* PL-4 / IS-4 / D-113: the outbound request queue a purge took,
                    proved by consequence rather than asserted. */
                 captureRequests: d("captureRequests") },
    };
  }

  /* ---- credentials ----

     A Worker cannot rewrite its own secret, so ADMIN_TOKEN is a bootstrap
     credential rather than the credential. It is spent once, exchanging itself
     for an operator-chosen password whose hash lives here. Recovery is to
     overwrite ADMIN_TOKEN in the dashboard, which clears the consumed marker
     and returns the instance to unclaimed. That makes the group's Cloudflare
     login the root of trust, which is the only thing they reliably still have
     when a password is lost. */

  static #enc = new TextEncoder();


  static #rand(n = 32) {
    return [...crypto.getRandomValues(new Uint8Array(n))]
      .map((b) => b.toString(16).padStart(2, "0")).join("");
  }



  bootstrapState(...a) { return membershipOf(this.ctx).bootstrapState(...a); }

  claim(...a) { return membershipOf(this.ctx).claim(...a); }

  setPassword(...a) { return membershipOf(this.ctx).setPassword(...a); }




  static LOGIN_REFUSAL_DETAIL = Membership.LOGIN_REFUSAL_DETAIL;

  login(...a) { return membershipOf(this.ctx).login(...a); }

  session(...a) { return membershipOf(this.ctx).session(...a); }


  /* ---- members: each person their own credential, admin-invited ----

     The invite is spent exactly like the bootstrap credential is spent: its
     hash is cleared on enrollment, so possession of an old invite buys
     nothing against an enrolled member. Passwords live only as PBKDF2
     hashes under credentials role 'member:<id>'. */

  /* D-9, D-533: the register's rows classified, and the parts a holding bundle's record names: provenance's (R6, R8). */
  registerAudit() { return provenanceOf(this.ctx).registerRows(); }

  #projectAuthority(...a) { return membershipOf(this.ctx).projectAuthority(...a); }

  #caseAuthority(...a) { return membershipOf(this.ctx).caseAuthority(...a); }

  static SIGHT_NONE = Membership.SIGHT_NONE;
  static SIGHT_EXISTENCE = Membership.SIGHT_EXISTENCE;
  static SIGHT_FULL = Membership.SIGHT_FULL;
  #visibilityOf(...a) { return membershipOf(this.ctx).visibilityOf(...a); }
  #reindexProjectSight(...a) { return membershipOf(this.ctx).reindexProjectSight(...a); }
  #existenceAct(...a) { return membershipOf(this.ctx).existenceAct(...a); }
  /* ===== REC-196 — A READ NAMING A DISCOVERABLE PROJECT'S OWN ID IS ANSWERED POSITIONALLY (Membership v2 §7, item
   * 7.14, RULED 2026-09-23 by BOB #32, (a)).
   *
   * THE DEFECT. REC-149 refused every ACT at EXISTENCE positionally, and left every READ that names a project by id
   * answering as for a project that does not exist ("Record reads do not widen"). So a member the directory had just
   * shown a project to was told by `op=projectparticipants`, `op=image`, `op=projectvisibility` … that it does not
   * exist — the record calling a project the record itself had just shown nonexistent. The ruling: a read naming the
   * PROJECT'S OWN id answers exactly as an act does, C-70.1 through `#existenceAct` (the id and the name, nothing
   * else); a read naming anything INSIDE the project answers exactly as today; `viewerPredicate` is unchanged.
   *
   * ONE DOOR, ONE TABLE. The check sits in `fetch`, before the route runs, rather than in thirty read methods: every
   * read below is reached by exactly that door, so no read can answer a second thing. The table names, per read, the
   * parameters that carry a BUNDLE id — the only parameters that can name a project. `#existenceAct` answers only
   * when that id is a PROJECT the caller sees at EXISTENCE, so an id of anything inside a project (a bundle, a run, a
   * draft), an absent id, a hidden project and every caller with full sight all fall through to the read unchanged.
   * `PROJECT_NAMING_READS_NOT` names each read whose parameters name something that is never a bundle, with the
   * reason, and `project-sight.test.mjs` §11 sweeps every id-carrying read op into exactly one of the two tables, so a
   * new read cannot join the plane unclassified.
   *
   * COST, STATED: one indexed lookup on `project_sight` per named parameter of a stamped read, and `#sight` only for
   * an id that row calls discoverable. A viewer never sent (an internal call) is not asked. */
  static PROJECT_NAMING_READS = Object.freeze({
    image: ["id"], file: ["id"], projection: ["id"], excludedby: ["id"], backlinks: ["target"],
    reevaluations: ["target"], inquirystrength: ["id"], earnedbasis: ["id"], partitionindependence: ["id"],
    narrowcandidates: ["target"], versionnotice: ["target"], basisversions: ["id", "project"],
    versionstrength: ["id", "project"], strengthbarof: ["project", "target"], extractproposals: ["bundle"],
    capturerequests: ["target"], tasks: ["refers"], biasmanifest: ["scopeId"], airuns: ["contextId"],
    casedrafts: ["project"], gatefacts: ["id"], affordancefacts: ["target"],
    projectownerarith: ["projectId"], projectvisibility: ["projectId"], projectparticipants: ["projectId"],
    /* c22-batch29 (REC-196 x REC-150): REC-150's requests read names the project by its own id, so the door answers
       C-70.1 at EXISTENCE before the route, as for every read above; without `projectId` it lists the caller's own. */
    projectrequests: ["projectId"],
    /* N193: a document's bundle id. N216's layer-9 reads naming a record object's bundle, or (`determinations`) a project. */
    connectionsasserted: ["bundle"],
    standard: ["id"], standardinforce: ["id"], determination: ["id"], determinations: ["project"], consequence: ["id"],
    escalation: ["id"],
  });
  static PROJECT_NAMING_READS_NOT = Object.freeze({
    content: "`id` is a content row's fixed key, hash(capture, extent, chain) — never a bundle id",
    concerns: "`id` is an ENTITY id", connections: "`id` is an ENTITY id", instance: "`id` is an ENTITY id",
    exceptions: "`id` is an ENTITY id", transcription: "`id` is a transcription's content id",
    themeread: "`id` is a THEME id", leadread: "`id` is a LEAD id",
    versionchain: "`address` is a normalised source address, never a bundle id",
    airun: "`run` is a RUN id — a thing inside a project, whose existence is contents",
    airunlog: "`run` is a RUN id — a thing inside a project, whose existence is contents",
    airunspawn: "`run` is a RUN id — a thing inside a project, whose existence is contents",
    /* c22-batch29: `biasdebt` (REC-207, on main) reached REC-196's sweep only at this union. */
    biasdebt: "`run` is a RUN id — a thing inside a project, whose existence is contents",
    reviewcopy: "`draft` is a DRAFT id — a thing inside a project, whose existence is contents",
    casedocument: "`case` is a CASE id, answered by the case door's own fence",
    reading: "`sha256` is a CAPTURE's digest", resolutions: "`sha256` is a CAPTURE's digest",
    textattest: "`sha256` is a CAPTURE's digest", readingname: "`entity` is an ENTITY id",
    entity: "`id` is an ENTITY id", relation: "`id` is a RELATION id", inboxget: "`id` is an INBOX item's id",
    sourcereach: "`address` is a source address", captureprogressions: "`sha256` is a CAPTURE's digest",
    verify: "`sha256` is a published artifact's digest",
    publishedcase: "`id` is a PUBLISHED case — the published record, served to anybody",
    publishededitions: "`id` is a PUBLISHED case — the published record, served to anybody",
    caseflags: "`case` and `target` name a case and its member finding, every field already published",
    /* N89, N193 (N112, K210): `pdfstructure` beside `reading`. */
    archivelookup: "`address` is a source address", pdfstructure: "`sha256` is a CAPTURE's digest",
    contentcrop: "`id` is a content row's fixed key, hash(capture, extent, chain) — never a bundle id",
    filemembership: "`sha256` is a CAPTURE's digest",
    /* N216's layer-9 reads whose id names a row inside a project, never a bundle. */
    comparison: "`id` is a comparison PROPOSAL id — a thing inside a project, whose existence is contents",
    counselpacketread: "`id` is a COUNSEL PACKET id — a thing inside a project, whose existence is contents",
  });
  #existenceRead(op, url, body) {
    const params = Object.prototype.hasOwnProperty.call(Store.PROJECT_NAMING_READS, op)
      ? Store.PROJECT_NAMING_READS[op] : null;
    const viewer = url.searchParams.get("viewer");
    if (!params || viewer === null) return null;
    for (const p of params) {
      const fromBody = body && typeof body === "object" && typeof body[p] === "string" ? body[p] : null;
      for (const id of [url.searchParams.get(p), fromBody]) {
        if (typeof id !== "string" || id === "") continue;
        if (!this.#one(`SELECT 1 AS x FROM project_sight WHERE project_id=? AND setting='discoverable'`, id)) continue;
        const existence = this.#existenceAct(id, viewer);
        if (existence) return existence;
      }
    }
    return null;
  }

  projectVisibilitySet(...a) { return membershipOf(this.ctx).projectVisibilitySet(...a); }

  #visibilitySettingRefusal(...a) { return membershipOf(this.ctx).visibilitySettingRefusal(...a); }

  projectVisibility(...a) { return membershipOf(this.ctx).projectVisibility(...a); }

  projectDirectory(...a) { return membershipOf(this.ctx).projectDirectory(...a); }
  static PROJECT_DIRECTORY_LIMIT = Membership.PROJECT_DIRECTORY_LIMIT;

  static JOIN_REQUEST_ANSWERS = Membership.JOIN_REQUEST_ANSWERS;

  projectRequest(...a) { return membershipOf(this.ctx).projectRequest(...a); }

  projectRequestWithdraw(...a) { return membershipOf(this.ctx).projectRequestWithdraw(...a); }

  projectRequestAnswer(...a) { return membershipOf(this.ctx).projectRequestAnswer(...a); }

  projectRequests(...a) { return membershipOf(this.ctx).projectRequests(...a); }
  static PROJECT_REQUESTS_LIMIT = Membership.PROJECT_REQUESTS_LIMIT;
  #rosterInSight(...a) { return membershipOf(this.ctx).rosterInSight(...a); }
  /* `promote`'s not-found is the BUNDLE-level one (it revises any bundle, not only projects), so a
     hidden project's revision answers with it rather than with membership's `noSuchProject` — the rule is
     "the same answer the absent id gets", and for this act that answer is ABSENT. */
  /* REC-190, D-476, D-530, D-556: the census of displaced homes and whether the register holds a capture:
     provenance's (R5, R10). */
  homeCensus(...a) { return provenanceOf(this.ctx).homeCensus(...a); }
  registerHolds(...a) { return provenanceOf(this.ctx).registerHolds(...a); }
  #isProjectEditor(...a) { return membershipOf(this.ctx).isProjectEditor(...a); }

  #isAdminMember(...a) { return membershipOf(this.ctx).isAdministrator(...a); }

  projectClaimOwner(...a) { return membershipOf(this.ctx).projectClaimOwner(...a); }

  projectInvite(...a) { return membershipOf(this.ctx).projectInvite(...a); }

  projectJoin(...a) { return membershipOf(this.ctx).projectJoin(...a); }

  projectLeave(...a) { return membershipOf(this.ctx).projectLeave(...a); }

  projectRemove(...a) { return membershipOf(this.ctx).projectRemove(...a); }

  projectOwnerAdd(...a) { return membershipOf(this.ctx).projectOwnerAdd(...a); }

  projectOwnerRescue(...a) { return membershipOf(this.ctx).projectOwnerRescue(...a); }

  projectOwnerRemove(...a) { return membershipOf(this.ctx).projectOwnerRemove(...a); }

  /** 7.12: any JOINED participant may fork a project, creating a clone.
   *
   *  JOINED and not merely invited. An invited participant sees the SKELETON
   *  only (7.9): the Problems, the Information and the Actions, and none of the
   *  project's content, analysis record, work product or evaluations. A fork by
   *  such a member would either copy material they cannot read, which leaks it,
   *  or copy only what they can see, which is a different and lesser operation
   *  wearing the same name. Restricting it makes the leak impossible rather than
   *  managed.
   *
   *  THE FORKER MUST HOLD create_projects. A fork creates a project, and without
   *  this any participant creates projects they were not trusted to create,
   *  which is the capability defeated by a button. The capability is checked at
   *  the control plane, where the session is, and passed in here as a settled
   *  fact rather than re-derived.
   *
   *  THE CLONE CARRIES NO OTHER PARTICIPANTS. Copying the roster would let a
   *  forker manufacture visibility for people the original's owners chose, which
   *  is 7.3 defeated the same way.
   *
   *  Origin is recorded as `derived_from`, already in the closed relationship
   *  vocabulary of State Rules 5.1, so nothing is added to it. */
  forkProject({ projectId, newId, title, by, viewer = null, visibility = null } = {}) {
    return promotionOf(this.ctx).forkProject({ projectId, newId, title, by, viewer, visibility });
  }

  /** The comparison key for 7.1 project name uniqueness. D-50: this IS the catalog's `projectNameKey` (the same
   *  function object, imported, never a copy), so `promote`'s and the fork's NAME_TAKEN and the catalog's C-77
   *  corpus check cannot disagree about what a collision is. `test/d50-project-names.test.mjs` asserts identity. */
  static projectNameKey = projectNameKey;



  expertiseDeclare(...a) { return membershipOf(this.ctx).expertiseDeclare(...a); }

  expertiseConfirm(...a) { return membershipOf(this.ctx).expertiseConfirm(...a); }

  expertiseList(...a) { return membershipOf(this.ctx).expertiseList(...a); }

  projectParticipants(...a) { return membershipOf(this.ctx).projectParticipants(...a); }

  static CAPABILITIES = Membership.CAPABILITIES;

  static adminMath = Membership.adminMath;

  projectOwnerArithmetic(...a) { return membershipOf(this.ctx).projectOwnerArithmetic(...a); }

  adminArithmetic(...a) { return membershipOf(this.ctx).adminArithmetic(...a); }

  static ROOT_ADMIN = Membership.ROOT_ADMIN;

  #activeAdmins(...a) { return membershipOf(this.ctx).activeAdmins(...a); }





  memberCaps(...a) { return membershipOf(this.ctx).memberCaps(...a); }

  adminEndorse(...a) { return membershipOf(this.ctx).adminEndorse(...a); }

  adminRemove(...a) { return membershipOf(this.ctx).adminRemove(...a); }

  memberAdd(...a) { return membershipOf(this.ctx).memberAdd(...a); }



  inviteLook(...a) { return membershipOf(this.ctx).inviteLook(...a); }

  enroll(...a) { return membershipOf(this.ctx).enroll(...a); }

  memberList(...a) { return membershipOf(this.ctx).memberList(...a); }

  memberSet(...a) { return membershipOf(this.ctx).memberSet(...a); }

  static SIGNER_ATTESTS = Membership.SIGNER_ATTESTS;


  signerAdd(...a) { return membershipOf(this.ctx).signerAdd(...a); }

  signerList(...a) { return membershipOf(this.ctx).signerList(...a); }

  signerSet(...a) { return membershipOf(this.ctx).signerSet(...a); }

  /** REC-18: op=earnedbasis — WHAT THE RECORD EARNS for each candidate leg,
   *  BEFORE the leg is written.
   *
   *  THIS OP IS PART OF THE RULE, not a convenience beside it. The write path
   *  refuses a leg whose earned grade is not the one the record holds; a member
   *  with no way to LEARN that value is a member the refusal pressures into
   *  guessing, and "a gate that pressures someone into inventing one is a bug in
   *  the gate" is CLAUDE.md's own sentence about exactly this shape. So the
   *  enforcement and the answer come from ONE function (`earnedBasisRegistry`)
   *  and cannot disagree: what this read reports is what the write will accept.
   *
   *  Answers for the inquiry's OWN subject entity, over the targets asked about
   *  — the caller's list, or the basis the inquiry already carries. It states
   *  what is NOT earned as plainly as what is: a target absent from
   *  `earned.connection` earns no A/B/C, and the honest leg for it is testimony
   *  (grade D, with an author and a date) or no grade at all.
   *
   *  D-15: viewer-gated like every other read that can name a bundle, and it
   *  fails closed on an absent viewer. TWO POSTURES, REC-30's: the OWNING
   *  inquiry invisible -> the whole answer withheld as an absent one; a TARGET
   *  the viewer may not see -> dropped from the registry, with the fact that
   *  something was dropped stated and NO id and NO count leaked. */
  /** R15: what each leg earns, with its content row and the capture it rests on: inquiry's. */
  earnedBasis(...a) { return inquiryOf(this.ctx).earnedBasis(...a); }

  /* capture (T4-4): the doorbell, the render allowance, links and the host's chrome, capture sessions, site assets,
     reuse verdicts, the platform's ceiling, the event queue and source reachability are capture's (src/capture/).
     The public methods stay as one-line delegations so every caller answers as before. */
  knock(...a) { return captureOf(this.ctx).knock(...a); }
  inboxList(...a) { return captureOf(this.ctx).inboxList(...a); }
  inboxGet(...a) { return captureOf(this.ctx).inboxGet(...a); }
  inboxResolve(...a) { return captureOf(this.ctx).inboxResolve(...a); }
  renderAdmit(...a) { return captureOf(this.ctx).renderAdmit(...a); }
  renderSpend(...a) { return captureOf(this.ctx).renderSpend(...a); }
  recordLinks(...a) { return captureOf(this.ctx).recordLinks(...a); }
  linksTo(...a) { return captureOf(this.ctx).linksTo(...a); }
  resolveLinks(...a) { return captureOf(this.ctx).resolveLinks(...a); }
  recordLinkVerdict(...a) { return captureOf(this.ctx).recordLinkVerdict(...a); }
  saveCaptureSession(...a) { return captureOf(this.ctx).saveCaptureSession(...a); }
  loadCaptureSession(...a) { return captureOf(this.ctx).loadCaptureSession(...a); }
  dropCaptureSession(...a) { return captureOf(this.ctx).dropCaptureSession(...a); }
  siteAssets(...a) { return captureOf(this.ctx).siteAssets(...a); }
  recordSiteAssets(...a) { return captureOf(this.ctx).recordSiteAssets(...a); }
  reusedParts(...a) { return captureOf(this.ctx).reusedParts(...a); }
  recordReuseVerdicts(...a) { return captureOf(this.ctx).recordReuseVerdicts(...a); }
  reuseVerdicts(...a) { return captureOf(this.ctx).reuseVerdicts(...a); }
  siteChrome(...a) { return captureOf(this.ctx).siteChrome(...a); }
  captureLimit(...a) { return captureOf(this.ctx).captureLimit(...a); }
  recordCaptureLimit(...a) { return captureOf(this.ctx).recordCaptureLimit(...a); }
  taskEnqueue(...a) { return captureOf(this.ctx).taskEnqueue(...a); }
  recordSourceOutcome(...a) { return captureOf(this.ctx).recordSourceOutcome(...a); }
  sourceReachability(...a) { return captureOf(this.ctx).sourceReachability(...a); }

  /* D-95, the per-host request governor: `host-governor`'s (T4-1). These delegate, so the object's RPC callers and
     this file's own callers reach the one instance on this ctx (K61, K63). */
  governorAdmit(...a) { return governorOf(this.ctx).governorAdmit(...a); }
  governorReport(...a) { return governorOf(this.ctx).governorReport(...a); }
  governorConfig(...a) { return governorOf(this.ctx).governorConfig(...a); }
  governorState(...a) { return governorOf(this.ctx).governorState(...a); }

  /* ------------------------------------------------------------------ *
   * Links: what a document pointed at, and whether we hold that version.
   * The plane's own acquisition receipts and the version chain are provenance's (R13–R18, R47); the receipt's
   * document-level observation (REC-93, OBSERVATION-LOG-DESIGN.md §4.1) is observation-log's (R5), its receipt
   * listener.
   * ------------------------------------------------------------------ */
  recordCapturedLocator({ authorityKind = null, authority = null, actorClass = "plane", actor = null, observe = true,
                          ...receipt } = {}) {
    const r = provenanceOf(this.ctx).recordReceipt({ ...receipt,
      context: { authorityKind, authority, actorClass, actor, observe } });
    if (!r.recorded) return r;
    const look = (r.listeners || []).find((l) => l.module === OBSERVATION_LOG_MODULE);
    return { recorded: true, address_norm: r.address_norm, via: r.via, observation: r.observation,
             observation_written: !!(look && look.answer && look.answer.written === true),
             observation_refused: look && look.outcome === "refused" ? look.answer : null };
  }
  capturedLocators(...a) { return provenanceOf(this.ctx).receipts(...a); }
  versionChain(...a) { return provenanceOf(this.ctx).versionChain(...a); }

  static BASIS_VERSIONS_LIMIT_DEFAULT = BASIS_VERSIONS_LIMIT_DEFAULT;
  static BASIS_VERSIONS_LIMIT_MAX = BASIS_VERSIONS_LIMIT_MAX;
  static BASIS_VERSION_LEGS_MAX = BASIS_VERSION_LEGS_MAX;
  #versionCollections(...a) { return basisVersionsOf(this.ctx).versionCollections(...a); }

  basisVersions(a) { return basisVersionsOf(this.ctx).basisVersions(a); }
  #currentVersionOf(...a) { return basisVersionsOf(this.ctx).currentOf(...a); }

  /* PL-2 / IS-2: the six version acts are basis-versions' (R12–R15). */
  static VERSION_ACT_TO = VERSION_ACT_TO;
  versionAccept(a)   { return basisVersionsOf(this.ctx).versionAccept(a); }
  versionReject(a)   { return basisVersionsOf(this.ctx).versionReject(a); }
  versionConsider(a) { return basisVersionsOf(this.ctx).versionConsider(a); }
  versionRevert(a)   { return basisVersionsOf(this.ctx).versionRevert(a); }
  versionCurrent(a)  { return basisVersionsOf(this.ctx).versionCurrent(a); }
  versionHide(a)     { return basisVersionsOf(this.ctx).versionHide(a); }

  /* The capture requests (the door, the drain, the reads): `capture-requests`' (K58; its R1–R42). The drain stays
     reachable as a Durable Object method for the scheduler's consumer and the suites that drive it. */
  captureRequestDrain(o) { return captureRequestsOf(this.ctx).drain(o); }

  aiCredentialMint(...a) { return membershipOf(this.ctx).aiCredentialMint(...a); }

  aiCredentialRevoke(...a) { return membershipOf(this.ctx).aiCredentialRevoke(...a); }

  aiCredentialLook(...a) { return membershipOf(this.ctx).aiCredentialLook(...a); }

  aiCredentials(...a) { return membershipOf(this.ctx).aiCredentials(...a); }



  /* IS-6 — THE AI RUN is `ai-runs`' (`src/ai-runs/`, its R9–R29; T7). The store keeps the private
   * names its remaining readers call, each delegating to the module, until those readers are extracted. */
  #aiRuns() { return aiRunsOf(this.ctx, this.env); }

  /* CPDF-10: the transcription reads' page bound. ONE pair for BOTH reads
     deliberately -- they are one surface asked at two grains, and two constants
     would be two places a bound could drift. Sized against `AI_RUN_LOG`'s pair
     rather than picked: a document's attestations and a store's transcribed
     documents are both "enough to work with on a screen, far short of a dump". */
  static TEXT_SOURCE_LIMIT_DEFAULT = 200;
  static TEXT_SOURCE_LIMIT_MAX = 5000;

  /* REC-83 / IC-84 — THE CONTENT-GRAIN READS' THREE BOUNDS.
   *
   * `CONTENT_READ_PARAMS` is not a bound at all but the op's whole grammar, and
   * it is here beside the bounds because it is the same kind of statement: what
   * this surface will and will not accept, in ONE place a reader can check.
   * `op=content` is FIXED-KEY (D-222 stage C is where the query arm lives), so
   * it understands exactly its key and the viewer the control plane stamps —
   * and refuses every other parameter BY NAME. Declared as the ACCEPTED set
   * rather than as a list of predicate spellings on WORKER.md's rule: a
   * denylist of `q`/`where`/`limit`/`cursor` is complete only until a fifth
   * spelling is invented, and would read as a complete sweep while it went
   * stale. Adding a parameter to this op means adding it HERE, which is
   * exactly the review the fixed-key rule wants.
   *
   * `CONTENT_EARNED_MAX` bounds how many content rows one `op=earnedbasis`
   * answer resolves standings for. 200 is `op=earnedbasis`'s OWN target slice,
   * reused rather than minted: a basis with more than 200 legs is not a shape
   * this record has, and the two numbers being one number is what keeps the
   * targets asked about and the rows answered for from drifting apart.
   *
   * `LEG_BACKFILL_MAX` bounds how many legacy legs one read backfills. It is
   * SMALLER than the other two on purpose: the backfill WRITES, a write behind
   * a member-callable read is the amplification REC-66 / D-227 bounds, and the
   * work is safely resumable because `ensureLegContent` is a pure function of
   * the leg — a read that stops at the cap says so and the next read continues
   * from where it stopped, with no cursor to mint and no state to keep. */
  static LEG_BACKFILL_MAX = LEG_BACKFILL_MAX;   /* inquiry R15's bound, read by the old battery */

  static #aiIso(ms) { return stampInstant("second", ms); }

  /* REC-93 / IC-92 — THE OBSERVATION LOG: ONE APPEND SITE, ONE TABLE. observation-log's (R2–R4): every look this
   * file records is appended through its `observe`, which judges and writes it; `#observe` delegates. */

  #observe(...a) { return observationLogOf(this.ctx).observe(...a); }

  /** The namespace this Durable Object IS, asked of the runtime rather than remembered: `index.mjs`'s
   *  `scopeFor` routes every call to `idFromName("bio")` or `idFromName("scratch")`, and a DO's id equals the one
   *  it was named by. Null for any other object (a suite's private instance) — the dispatch then says it could
   *  not name the namespace, rather than guessing one: a default here would let a resumed run touch the real
   *  record while the run lived in scratch. */
  #ownNamespace() {
    const ns = this.env && this.env.STORE;
    if (!ns || typeof ns.idFromName !== "function" || !this.ctx.id || typeof this.ctx.id.equals !== "function")
      return null;
    for (const name of ["bio", "scratch"]) if (this.ctx.id.equals(ns.idFromName(name))) return name;
    return null;
  }




  /* bias (K61): the three acts and the two debt reads are `bias`'s; these delegate to it for this store's callers. */
  biasAdopt(a) { return biasOf(this.ctx).biasAdopt(a); }
  biasManifest(a) { return biasOf(this.ctx).biasManifest(a); }
  biasInhale(a) { return biasOf(this.ctx).biasInhale(a); }
  biasDebtResolve(a) { return biasOf(this.ctx).biasDebtResolve(a); }
  biasDebtRead(a) { return biasOf(this.ctx).biasDebt(a); }

  static #numberParam(url, k) { const v = url.searchParams.get(k); return v === null || v === "" ? undefined : Number(v); }

  async fetch(req) {
    const url = new URL(req.url);
    const op = url.pathname.slice(1);
    /* D-39. An empty POST body used to throw here, BEFORE any op was dispatched,
       so the caller saw a Cloudflare worker exception (error 1101) rather than a
       BIO refusal. It was general to every op and it turned a client bug into an
       opaque platform error. An absent body is now simply null, which is what a
       GET already passes and what every op that takes no body already expects;
       a body that is present but not JSON is refused by name. */
    let body = null;
    if (req.method === "POST") {
      const raw = await req.text();
      if (raw.trim() !== "") {
        try { body = JSON.parse(raw); }
        catch {
          return Response.json({ ok: false, reason: "BAD_JSON",
            detail: "the request body is not valid JSON" }, { status: 400 });
        }
      }
    }
    /* REC-30: the envelope carried an `ms` wall-clock field and NOTHING read it.
       It was spread into every control-plane response, where it was two things
       and neither of them good: a timing signal about work the caller did not
       ask about, and a standing hazard for the byte-comparison assertions the
       D-15 posture rests on — REC-25's suite had to strip it client-side because
       a 0ms-vs-1ms pair made "hidden and absent answer identically" flake about
       one run in twenty. Removed at the SOURCE, which retires the hazard instead
       of documenting it. If a caller ever genuinely needs the timing, it must be
       NAMED and asked for; an unnamed one is how this got here. */
    try {
      const map = {
        ...membershipOps(membershipOf(this.ctx), url, body, this.env),
        ...captureOps(captureOf(this.ctx), url, body, this.env),
        ...calibrationOps(calibrationOf(this.ctx), url, body),
        ...biasOps(biasOf(this.ctx), url, body),
        ...extractionOps(extractionOf(this.ctx), url, body, this.env),
        ...connectionsOps(connectionsOf(this.ctx), url, body, this.env),
        ...inquiryOps(inquiryOf(this.ctx), url, body),
        ...citationOps(citationOf(this.ctx), url),
        /* MK-4 / D-681: the lead's ops, observation-log's (K3); the stamps are the control plane's, read from the query. */
        ...observationLogOps(observationLogOf(this.ctx), url, body),
        /* run-productions' ops (K3): op=suggest and the extract productions; the stamps are the control plane's. */
        ...runProductionsOps(runProductionsOf(this.ctx), url, body),
        ...entitiesOps(entitiesOf(this.ctx), url, body),
        ...contradictionOps(contradictionOf(this.ctx), url, body),
        ...progressionOps(progressionsOf(this.ctx), url, body),
        ...intentOps(intentOf(this.ctx), url, body),
        ...basisVersionsOps(basisVersionsOf(this.ctx), url, body),
        ...strengthOps(strengthModule(this.ctx), url, body),
        ...reevaluationOps(reevaluationOf(this.ctx), url, body),
        ...caseAuthoringOps(caseAuthoringOf(this.ctx), url, body),
        ...ratificationOps(ratificationOf(this.ctx), url, body),
        ...publicationOps(publicationOf(this.ctx), url, body),
        promote: () => promotionOf(this.ctx).promote(body),
        allocid: () => recordOf(this.ctx).allocIdOp(url.searchParams.get("prefix"), url.searchParams.get("year")),
        lease: () => recordOf(this.ctx).acquireLease(url.searchParams.get("id"), url.searchParams.get("actor"), 300000),
        /* REC-176: the census of manifest rows a repeated snap key overwrote, read-only (see `snapKeyCensus`). */
        snapkeycensus: () => recordOf(this.ctx).snapKeyCensus({ limit: url.searchParams.get("limit") }),
        /* REC-190: the census of displaced homes, read-only (see `homeCensus`). */
        homecensus: () => this.homeCensus({ limit: url.searchParams.get("limit") }),
        /* D-476: does the register hold these whole-document bytes, read-only and naming no
           bundle (see `registerHolds`). op=acquire asks it of a MULTI-PART capture, whose whole
           is never stored under its own hash for R2 to be asked about. */
        registerholds: () => this.registerHolds({ sha: url.searchParams.get("sha256"),
                                                  bundle: url.searchParams.get("bundle") }),
        /* REC-25 / F-8: the D-15 gate on the whole-image and single-file
           reads. `viewer` is stamped by the control plane, never taken from a
           caller's own parameters there; an invisible bundle answers null,
           exactly as an absent one does, and an absent viewer sees nothing
           (fail closed, the search path's own posture). The METHODS stay
           ungated because the store itself is a legitimate whole-corpus
           reader (audit, eachImage, ratify's assembly); this dispatch map is
           the store's one external door. */
        image: () => this.#viewerSees(url.searchParams.get("id"), url.searchParams.get("viewer"))
          ? recordOf(this.ctx).readImage(url.searchParams.get("id")) : null,
        file: () => this.#viewerSees(url.searchParams.get("id"), url.searchParams.get("viewer"))
          ? recordOf(this.ctx).readFile(url.searchParams.get("id"), url.searchParams.get("path")) : null,
        list: () => this.listBundles({ type: url.searchParams.get("type"), state: url.searchParams.get("state"),
                                       after: url.searchParams.get("after") || null,
                                       limit: url.searchParams.get("limit"),
                                       viewer: url.searchParams.get("viewer") }),
        index: () => this.buildIndex({ viewer: url.searchParams.get("viewer") }),
        /* CAP-4: reuse verification. `reusedparts` enumerates a bundle's reused
           parts so ratification can re-fetch them; `recordreuseverdicts` commits
           the outcomes the control plane produced; `reuseverdicts` reads them
           (also surfacing the free posthoc verdicts by source_capture). */
        /* REC-83 / IC-84 (4): THE FIXED-KEY CONTENT READ. One key, one row —
           `extras` hands the store EVERY parameter name that arrived so the op
           can refuse a predicate or a page by name rather than ignoring it. The
           control plane strips `op` and `token` and forwards the rest, so what
           this list holds is exactly what the caller sent plus the viewer the
           control plane stamped; `Store.CONTENT_READ_PARAMS` is the accepted
           set and everything else is refused. GATED like every read that names
           a bundle: the store fails closed on an absent `viewer` and answers an
           invisible row exactly as an absent one. */
        contentcrop: () => contentOf(this.ctx).cropOf({ contentId: url.searchParams.get("id"), viewer: url.searchParams.get("viewer") }),
        content: () => this.contentRead({ id: url.searchParams.get("id"),
                                          viewer: url.searchParams.get("viewer"),
                                          extras: [...url.searchParams.keys()] }),
        /* SK-7 / framework Part II 14.4 (Bob's 5.7): MARKING A PASSAGE CITABLE.
           `mintedBy` is taken from the QUERY STRING and never from the body,
           and that is the whole fence at this door: the control plane stamps it
           there from the credential that authenticated and a caller-supplied
           one in the body is not read at all, so a machine credential cannot
           post a member's name into the field that says who did this. GATED on
           `viewer` like every write that names a bundle. */
        contentmint: () => this.contentMint({ bundleId: (body || {}).bundleId,
                                              extent: (body || {}).extent,
                                              at: (body || {}).at || null,
                                              mintedBy: url.searchParams.get("mintedBy"),
                                              viewer: url.searchParams.get("viewer") }),
        /* CONSTRUCTS Step 3 (FW-5): read a captured document's reading by capture
           sha, and the reverse index by raw entity reference. */
        /* REC-30: `viewer` is stamped by the control plane, never read from a
           caller's own parameters there, and an absent one fails closed — the
           bundle back-reference is withheld rather than the answer refused. */
        /* CPDF-10. Three arms, and the split is the item's own doctrine.
           `textprovenance` READS which documents' text a machine produced — the
           index half of "distinguishable in the projection, the index and an
           export". `textattest` READS the attestations over one capture and
           what a leg citing a given region may claim. `attesttext` is the WRITE,
           and it is the only one of the three a machine credential cannot
           reach — the control plane refuses it before it gets here (MEMBER_ONLY
           in the OPS table), and `checkAttestation` refuses it again at the
           store, because an act refusable at one door only is an act with one
           door left open. */
        textattest: () => this.attestationsFor(url.searchParams.get("sha256"),
          url.searchParams.get("page") == null ? null
            : { page: Number(url.searchParams.get("page")),
                rect: safeJson(url.searchParams.get("rect")) },
          url.searchParams.get("viewer"), url.searchParams.get("limit")),
        /* SK-7: THE ATTESTOR COMES FROM THE QUERY STRING, WHERE THE CONTROL
           PLANE STAMPED IT, AND THE BODY'S `member` IS NOT READ AT ALL. Before
           this the attestor was taken from the body, so C-35.10 refused only a
           caller that volunteered a machine-shaped name — measured through a
           real minted `ai` credential, which attested in a member's name and had
           the act LAND. `contentmint` beside it takes its minter the same way
           and for the same reason. An absent stamp reaches `checkAttestation`
           as an absent member and is refused there (*unattributed is not
           attested*), so a route that skipped the stamp fails closed. */
        attesttext: () => contentOf(this.ctx).attestText({ ...(body || {}), member: url.searchParams.get("attestor"),
                                                           viewer: url.searchParams.get("viewer") }),
        /* CONSTRUCTS Step 4, SLICE B (FW-7): the RECOGNISERS. resolve runs the
           recogniser over a captured document's references and stores each resolution
           with its §8.1 grade (A/B/C, never D — the machine never testifies);
           resolvetestify is the member's grade-D testimony path; resolutions reads a
           document's resolutions; concerns is the REVERSE INDEX, every document that
           concerns an entity, by joining on entity_id (never through a relation). */
        resolve: () => this.resolveReferences(body || {}),
        resolvetestify: () => this.testifyResolution(body || {}),
        /* CONSTRUCTS Step 5, SLICE A (FW-8): CONNECTIONS AS DATA carrying a GRADE (the
           two-node base case of a progression), and the PROGRESSION DEFINITION as data.
           connect DERIVES the connections among the documents that concern one entity,
           each graded the WEAKER of its two ends (D-67 storage + D-72 grade); connections
           reads them by entity or by capture; progressiondefine authors an ordered stage
           set (both example progressions expressible as rows); progression reads one. */
        ...queueOps(queueOf(this.ctx), url, body),
        /* D-64: the daily render allowance. `renderadmit` takes a render or records
           a DEFERRAL; `renderspend` adds the browser time a render reported. */
        recordcapturedlocator: () => this.recordCapturedLocator(body || {}),
        /* PL-10 / D-220: the version chain. `address` arrives ALREADY NORMALISED
           — the control plane runs it through `normalizeAddress`, the same
           function the capture wrote the row with, because `normalizeAddress`
           lives in subresources.mjs and this file does not import it. That is
           the seam op=links already uses for the same reason. `viewer` is
           stamped by the control plane and an absent one compiles to the deny
           predicate, so this fails closed like every other gated read. */
        versionchain: () => this.versionChain({
          addressNorm: url.searchParams.get("address"),
          at: url.searchParams.get("at"),
          limit: url.searchParams.get("limit"),
          offset: url.searchParams.get("offset"),
          viewer: url.searchParams.get("viewer"),
        }),
        /* REC-87 / IC-128: TRANSCRIBE. The TYPIST and the ATTESTOR come from the
           QUERY STRING, where the control plane stamped them, and never from the
           body — `attesttext`'s correction, taken from the start rather than
           re-learned: a body field a caller can fill is a name a machine can post. */
        /* MK-1 / IC-133: TESTIFY. The AUTHOR comes from the QUERY STRING, where the
           control plane stamped it over anything the caller put there. The body's
           own author field is read ONLY to be REFUSED (C-53.2): every spelling a
           caller could use to name the person is collected, so naming it under a
           synonym is not a way round the refusal. */
        testify: () => this.testify({
          words: body ? body.words : null,
          observedAt: body ? body.observedAt : null,
          title: body ? body.title : null,
          author: url.searchParams.get("author"),
          claimedAuthor: body
            ? (["author", "observer", "authoredBy", "authored_by", "by", "member", "memberId"]
                 .map((k) => body[k]).find((v) => v !== undefined && v !== null) ?? null)
            : null,
        }),
        transcribe: () => this.transcribe({
          bundleId: (body && body.bundleId) || null,
          extent: body && body.extent !== undefined ? body.extent : null,
          text: body ? body.text : null,
          at: (body && body.at) || null,
          transcriber: url.searchParams.get("transcriber"),
          viewer: url.searchParams.get("viewer"),
        }),
        transcriptionattest: () => this.transcriptionAttest({
          contentId: (body && body.contentId) || url.searchParams.get("contentId"),
          at: (body && body.at) || null,
          note: body ? body.note : null,
          attestor: url.searchParams.get("attestor"),
          viewer: url.searchParams.get("viewer"),
        }),
        transcription: () => this.transcriptionRead({ id: url.searchParams.get("id"),
                                                      viewer: url.searchParams.get("viewer") }),
        ...captureRequestsOps(captureRequestsOf(this.ctx), url, body),
        ...governorRoutes(governorOf(this.ctx), url, body),
        ...aiRunsOps(aiRunsOf(this.ctx, this.env), url, body),
        /* retrieval's ops (K3): frontier, contentaxis, projection, search, meaningrows, searchfields, select, selection,
           selectionlist, selectionrelease, searchindexcheck, projectionplan, projectionclear, reproject. */
        ...retrievalRoutes(retrievalOf(this.ctx), url, body),
        ...actionsOps(actionsOf(this.ctx), url, body),
        /* N216 (K250, K263): layer 9's ops. escalation publishes no op map, so its ten are named here (LEGACY-INDEX #5's
           table, K262); `author` and `viewer` are the control plane's stamps, read from the query after the body, and
           `now` and `limit` are numbers or absent. */
        ...standardsOps(standardsOf(this.ctx), url, body),
        ...conformanceOps(conformanceOf(this.ctx), url, body),
        ...consequencesOps(consequencesModule(this.ctx), url, body),
        ...filingsOps(filingsOf(this.ctx), url, body),
        escalationopen: () => escalationOf(this.ctx).escalationOpen({ ...(body || {}), author: url.searchParams.get("author"),
                                                                       viewer: url.searchParams.get("viewer") }),
        escalation: () => escalationOf(this.ctx).escalationRead({ id: url.searchParams.get("id"),
                                                                  nowMs: Store.#numberParam(url, "now"),
                                                                  viewer: url.searchParams.get("viewer") }),
        escalationattach: () => escalationOf(this.ctx).escalationAttach({ ...(body || {}), author: url.searchParams.get("author"),
                                                                           viewer: url.searchParams.get("viewer") }),
        escalationevaluate: () => escalationOf(this.ctx).escalationEvaluate({ ...(body || {}),
                                                                               author: url.searchParams.get("author"),
                                                                               viewer: url.searchParams.get("viewer") }),
        escalationadvance: () => escalationOf(this.ctx).escalationAdvance({ ...(body || {}), author: url.searchParams.get("author"),
                                                                             viewer: url.searchParams.get("viewer") }),
        escalationdecline: () => escalationOf(this.ctx).escalationDecline({ ...(body || {}), author: url.searchParams.get("author"),
                                                                             viewer: url.searchParams.get("viewer") }),
        escalationend: () => escalationOf(this.ctx).escalationEnd({ ...(body || {}), author: url.searchParams.get("author"),
                                                                     viewer: url.searchParams.get("viewer") }),
        escalationsuspend: () => escalationOf(this.ctx).escalationSuspend({ ...(body || {}), author: url.searchParams.get("author"),
                                                                             viewer: url.searchParams.get("viewer") }),
        escalationresume: () => escalationOf(this.ctx).escalationResume({ ...(body || {}), author: url.searchParams.get("author"),
                                                                           viewer: url.searchParams.get("viewer") }),
        escalationsdue: () => escalationOf(this.ctx).escalationsDue({ nowMs: Store.#numberParam(url, "now"),
                                                                      limit: Store.#numberParam(url, "limit"),
                                                                      viewer: url.searchParams.get("viewer") }),
        ...monitoringOps(monitoringOf(this.ctx), url, body),
        /* REC-19: the facts behind op=affordances. The control plane derives
           the act list from these; this endpoint only reports what the store
           holds about the object. */
        affordancefacts: () => affordancesOf(this.ctx).affordanceFacts({ target: url.searchParams.get("target"),
                                                      viewer: url.searchParams.get("viewer"),
                                                      identity: url.searchParams.get("identity"),
                                                      /* D-311: the two act stamps, as the acts receive them */
                                                      author: url.searchParams.get("author"),
                                                      by: url.searchParams.get("by") }),
        stats: () => this.stats({ capacity: url.searchParams.get("capacity") === "1",
                                   viewer: url.searchParams.has("viewer") ? url.searchParams.get("viewer") : undefined }),
        retire: () => this.retire({ handle: url.searchParams.get("handle"),
          reason: url.searchParams.get("reason"),
          viewer: url.searchParams.get("viewer"), owner: url.searchParams.get("owner"),
          author: url.searchParams.get("author") }),
        release: () => this.release({ handle: url.searchParams.get("handle"),
          acknowledgment: url.searchParams.get("acknowledgment"),
          mitigation: url.searchParams.get("mitigation"),
          viewer: url.searchParams.get("viewer"), owner: url.searchParams.get("owner"),
          author: url.searchParams.get("author") }),
        /* REC-54 / D-200. ONE bundle, no handle and no owner: this is a
           correction to a named document's register, not a set application, so
           it takes the target and the viewer/author stamps the control plane
           sets. `apply` is opt-in — the default is a REPORT, because every use
           of this is a decision about the real record. */
        provenancechain: () => this.provenanceChainRebuild({
          bundleId: url.searchParams.get("bundleId"),
          apply: url.searchParams.get("apply") === "1",
          viewer: url.searchParams.get("viewer"),
          author: url.searchParams.get("author") }),
        /* REC-63 / DEC-56 / D-204. The other half of the op above: where that
           one REFUSES to invent a chain, this one RECORDS that the route cannot
           be shown. One bundle, the viewer/author stamps the control plane sets,
           and NO `apply` flag — there is nothing to opt into, because the act
           moves no state and touches no byte of the document. */
        provenanceroute: () => this.provenanceRouteAssess({
          bundleId: url.searchParams.get("bundleId"),
          viewer: url.searchParams.get("viewer"),
          author: url.searchParams.get("author") }),
        /* REC-116 / IC-120. The READ beside the two writes above — the `airun`
           / `airuns` shape one construct over: the singular acts on one bundle,
           the plural answers about the instance. No `author`, because reading
           who was doubted is not itself a named act; `viewer` is the control
           plane's server-side stamp exactly as it is for its two siblings. */
        provenanceroutes: () => this.provenanceRoutesMarked({
          after: url.searchParams.get("after"),
          limit: url.searchParams.get("limit"),
          viewer: url.searchParams.get("viewer") }),
        /* REC-31, conclude's shape exactly: ONE target, no handle and no
           owner, with the viewer and author stamps the control plane sets. */
        reopen: () => this.reopen({ target: url.searchParams.get("target"),
          reason: url.searchParams.get("reason"),
          viewer: url.searchParams.get("viewer"),
          author: url.searchParams.get("author") }),
        projectfork: () => this.forkProject({ projectId: url.searchParams.get("projectId"),
          newId: url.searchParams.get("newId"), title: url.searchParams.get("title"),
          visibility: url.searchParams.get("visibility"),   /* REC-197: absent is null, which is HIDDEN */
          by: url.searchParams.get("by"), viewer: url.searchParams.get("viewer") }),   /* REC-138 */
        registeraudit: () => this.registerAudit(),
        /* REC-175: the digest census, read-only (see `digestCensus`). */
        digestcensus: () => recordOf(this.ctx).digestCensus({ limit: url.searchParams.get("limit") }),
        /* CASE-5b: the case ceremony's three hops, beside `gatefacts` and
           `publish` because they are the same three acts one altitude up —
           hand out the facts, read the document, commit from the signed bytes. */
        ...reviewOps(reviewOf(this.ctx), url, body),
        audit: () => this.auditPass({ after: url.searchParams.get("after") || "",
                                      limit: url.searchParams.get("limit"),
                                      viewer: url.searchParams.get("viewer") }),
        purge: () => this.purge({ bundleId: url.searchParams.get("bundleId") }),
      };
      if (!map[op]) return Response.json({ ok: false, error: "unknown op: " + op }, { status: 400 });
      /* REC-196: a read naming a discoverable project's own id, asked by a caller at EXISTENCE, answers C-70.1. */
      const existence = this.#existenceRead(op, url, body);
      return Response.json({ ok: true, result: existence ?? await map[op]() });
    } catch (e) {
      return Response.json({ ok: false, error: String(e && e.stack || e) }, { status: 500 });
    }
  }
}

export default {
  fetch(req, env) {
    return env.STORE.get(env.STORE.idFromName("bio")).fetch(req);
  },
};
