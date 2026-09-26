# run-productions — requirements

**Status** · DRAFT by a drafting worker for BOB #42, 2026-09-26 (P18, N54, K82), split from ai-runs' draft; for Bob's approval (a product module, P17). Layer 6. Code today (measured on `tranche/T3` @ `35ea098`, unchanged at `1c205209`; `build/extraction/run-productions.md` has the table): `bio-plane/src/store.mjs` 39022–40075 (PL-3/IS-4: `SUGGEST_LEGS_MAX`, `SUGGEST_ORIGIN_MAX`, `suggestVersion`, `#suggestionPersisted`, `#suggestionFrontmatter`), 22311–22685 (SK-8: `#mintsBound`, `#posFields`, `extractPropose`, `extractProposals`), and the dispatch entries `extractpropose`, `extractproposals` (48651–48674) and `suggest` (49217–49227); `bio-plane/checks/bio-checks.mjs` 7732–7736 (`SUGGEST_LEVELS`) and 7777–7975 (`SUGGEST_CHECKS`, C-27.1–C-27.14 and C-27.16–C-27.19); `schema.mjs` 3262–3332 (`proposed_readings`) and 2461–2497 (`suggest_refusals`). `from`: `legacy-store` and `legacy-checks`; `index.mjs` holds only these ops' routing, classes (`RUN_PRODUCTION_ACTIONS`) and principal stamps, which stay with `control-plane` (K3). `SUGGEST_KINDS` and C-27.15 are `basis-versions`' (its R1; K82 (4)). Not yet met: R9 (D-595), R13 (DEC-49), R14 (K31). Old-plan rows carried to `run-productions`: D-595 (R9) and D-572 (K83 (4) placed it with `op=suggest`; map §5.3). Renumbered from ai-runs' committed draft (old → new): R28 → R1, R29 → R3, R30 → R4, R31 → R6, R32 → R7, R33 → R8, R34 → R9, R35 → R10, R36 → R11, R37 → R12, R38 → R13, R47 (for the productions) → R15, R49 (C-27) → R16, R52 (`proposed_readings`) → R17, R53 → R19; new: R2, R5, R14, R18.

**Size (P6).** About 1,780 lines (about 800 without comment-only and blank lines): `store.mjs` 1,464, `bio-checks.mjs` 204, `schema.mjs` 108. Well under 4,000. A job reads it whole with the public parts of `ai-runs`, `basis-versions`, `strength`, `content` and `extraction`.

## Public

### Purpose

What an AI run produces, and the only way it produces it. The investigative session's one write is a suggestion: a version of a question's basis in state `suggested`, carrying its run, checked plane-side before it is written and never accepted, hidden, rejected or made current here (INVESTIGATIVE-SESSION §4, §9, §10). The EXTRACT role's production is a proposed reading of a document the record already holds, labelled machine work, making a passage citable only within the run's `mints` bound and never counted as extraction coverage (Assistant and AI Roles §7.3). Each production names a running run the caller holds; the run, its gates and its bounds are `ai-runs`'.

### Provides

Terms. A **run** and its **bounds** are `ai-runs`'; `ai-runs.runFor` answers a run or null, and its R5 (`runPrincipalGate`) decides whether the caller holds it. A **suggestion** is one basis version `basis-versions` defines. A **proposed reading** is `{run, capture_sha, bundle_id, ref, ref_kind, ref_key, label, fn, fn_version, chain, cap, earned, position, content_id, proposed_by, at}`. `viewer`, `caller`, `author` and `proposedBy` are the control plane's stamps. A refusal names `code` and carries its catalogue `check` and `translation`, except where R13 says.

**suggest({target, kind, run, name, description, claim, relationship, derived_from, level, observed_at, grounds, legs, author, viewer, caller})** (`op=suggest`) The investigative session's one write.
- **R1** Shape refusals in order, nothing written on any: `SUGGEST_NO_TARGET` (C-27.1); a target whose id is not an inquiry's, `SUGGEST_NOT_AN_INQUIRY` (C-27.2); a kind outside `SUGGEST_KINDS`, `SUGGEST_UNKNOWN_KIND` (C-27.3); a target absent or invisible, `SUGGEST_NOT_AN_INQUIRY`; a run absent, invisible or unnamed, `SUGGEST_NO_RUN` (C-27.4), the invisible and never-held cases alike but for the id; `ai-runs`' R5 relayed whole; a run not `running`, `SUGGEST_RUN_NOT_RUNNING` (C-27.18); a target that is neither the run's context nor, for a project run, a question the project confirmed-cites, `SUGGEST_OUTSIDE_RUN_CONTEXT` (C-27.19); no readable document, `SUGGEST_NO_DOCUMENT` (C-27.17); a name already held in the question, compared as it would be written, `SUGGEST_NAME_TAKEN` (C-27.5); more than 120 legs, `SUGGEST_TOO_MANY_LEGS` (C-27.7); a `level-empty` suggestion without its level (one of `SUGGEST_LEVELS`) and observation address, `SUGGEST_EMPTY_LEVEL_UNSTATED` (C-27.6).
- **R2** A submission identical, byte for byte in its canonical form, to one already refused on the same question at the same revision of its document answers the stored refusal unchanged with `repeated: true`, `evaluated: false`, `wrote: false`, `repeats` and `first_refused_at`; no check runs again and nothing in the record moves. Once the question's document moves, the same submission is judged afresh.
- **R3** The pre-write checks, each a named verdict, in order: `SUGGEST_UNWRITABLE_STATE` (C-27.13: a field only a member's act writes: `state`, `hidden`, `state_by`, `state_at`, `state_reason`, `at`, `affirmed_parts`, `affirmed`; or grounds or a partition composed by an unnamed credential, or by a machine unless it declares exactly one part, DEC-65), `SUGGEST_BOILERPLATE` (C-27.12: the description, claim, a ground's statement or a leg's note empty or a placeholder), `SUGGEST_LEG_UNREACHABLE` (C-27.8: a leg on a retired, uncitable or invisible target), `SUGGEST_PAIR_DOES_NOT_COMPUTE` (C-27.9: the strength pair over the candidate's legs fails on an axis, or its partition disagrees with the one declared), `SUGGEST_COMPARISON_INCOMPLETE` (C-27.16: an independence trace past 200 origins, or a question holding more than 1,000 versions, is undetermined, never independent or different), `SUGGEST_BRANCHES_NOT_INDEPENDENT` (C-27.11), `SUGGEST_NOT_DIFFERENT` (C-27.10: the same in substance as a version held, name and parentage excluded, compared as the document would store it), then `SUGGEST_UNWRITABLE_DOCUMENT` (C-27.14). A refusal of the write by `basis-versions` or `promotion` is returned unchanged. Every refusal of this requirement is kept for R2.
- **R4** Success writes exactly one basis version of the target, in state `suggested`, carrying its run, kind, author and description, through `basis-versions`' `appendVersion` (its R28), with a Session Log entry naming the run; every leg is a `document` leg; a machine author's grounds are asserted by no one (`SUFFICIENCY_UNCLAIMED`), the version's `author` still naming the machine. Nothing is accepted, hidden, rejected or made current; nothing is captured or requested; no notification is sent.
- **R5** The answer is labelled by source in `fields_of`: `record` (the version, kind, run, state, author, instant, legs, grounds, their counts and composition, read back from the record as `op=basisversions` reads them; `composition_of: "record"`, or `"unread"` with nulls when the read-back is empty), `derived` (the strength pair per axis and the independence trace, computed over this submission and not stored), and `call` (`weight: "single"`, `limit` 120, `origin_limit` 200, `truncated`, `evaluated`, `repeated: false`, `wrote: true`, `read_back`).
- **R6** `SUGGEST_KINDS` is `basis-version`, `sharpen-question`, `new-inquiry`, `level-empty`, `new-edition` (held by `basis-versions`, re-exported here); `SUGGEST_LEVELS` is `meaning`, `content`, `documents`, `internet`.
- **R7** R1's refusals and R3's verdicts are all asked before anything is written; a refused suggestion writes nothing to the record, only R2's memo of the refusal.
- **R8** The target and run are the body's; `author`, `viewer` and `caller` are stamps and a body's are overwritten.
- **R9** Each suggested leg names the capture the run read (`extent_capture`), so a suggestion says which version of a document it rests on. *(not yet met: D-595)*

**extractPropose({run, bundleId, fn, version, cap, refs, at, proposedBy, viewer, caller})** (`op=extractpropose`) The EXTRACT role's productions.
- **R10** Refusals in order, nothing written on any: `NO_PROPOSER`; `NO_RUN`; `NO_SUCH_RUN` (absent or invisible alike); `ai-runs`' R5 relayed; `RUN_NOT_RUNNING`; `NOT_AN_EXTRACT_RUN` (mode not `extract`); `NO_MINTS_BOUND` (none, or allowed 0); `MINTS_BOUND_REACHED`; `NO_PROPOSALS`; `NO_TARGET`; `NO_SUCH_BUNDLE` (absent or invisible alike); `NOT_A_DOCUMENT`; `NO_BYTES_HELD`; the chain step's own refusal from `text-chain` (for example `TEXT_CHAIN_STRENGTHENS`), unchanged; each reference's own check (`extraction`'s), with `at_index`, the batch refused whole; `MINTS_BOUND_WOULD_EXCEED` (the batch refused whole, never trimmed, with `allowed`, `consumed`, `would_mint`).
- **R11** Success writes, in one transaction, one proposed reading per reference carrying the run, the proposer stamp, the chain with the step `ai(fn, version)` and its cap (null, stated, when undetermined), and `earned` B or C computed from what the reference names, never offered; a reference already proposed under the run for that capture is left as it was. A reference with a position is minted as a content row by `content` (on the capture's own chain, labelled machine work); a mint `content` refuses is recorded as `mint_refused` with its code, check and detail, never dropped; `mints` is consumed through `ai-runs` by the rows newly minted and by nothing else. The answer carries each proposal, `minted`, the bound after, the mint label and the sentence that these are proposals, not extraction coverage.
- **R12** `extractProposals({run, bundleId, viewer, limit})` (`op=extractproposals`): neither run nor bundle is `NO_SCOPE`. Otherwise the proposals in scope on documents the viewer may see, newest first, `limit` clamped to [1, 500] (100 by default) with `truncated`, each labelled a machine's proposal; and the minted-to-cited ratio over the machine-minted content rows of at most 64 of the scope's documents the viewer may see (`documents`, `documents_capped`), a row counting as cited when a member's leg or version leg names it. A document the viewer may not see moves neither the list nor the ratio.
- **R13** Every refusal of R10 and R12 carries a catalogue check and translation. *(not yet met: DEC-49 — these codes have no rows; a `legacy-checks` entry)*

**The narrow candidate source, registered with `basis-versions`** (its R25, K31)
- **R14** For a capture, the proposals with a position, newest first, at most the count asked plus one, each as `{run, ref, label, position, content_id, mint label}`, so `narrowCandidates` lists passages an extract run proposed. *(not yet met: K31 — `narrowCandidates` reads `proposed_readings` directly)*

## Private

### Uses

- `legacy-checks`: the C-27 rows until they move (R16), `SUGGEST_KINDS` until `basis-versions` holds it, `isBoilerplate`, `isMachineIdentity`, `SUFFICIENCY_UNCLAIMED`, `canonicalJson`, `parseFrontmatter`, `normalizeType`, `OBJECT_TYPES`, `MACHINE_CLASS_PREFIX`.
- `text-chain`: `readingSource`, `readingSourceJson`, `readingSourceFromColumns`, `describeChain`.
- `record-core`: `recordOf(ctx)`, `transact`, `declarePurge`, `bundles` and `files` by its read contract.
- `membership`: `viewerPredicate`, `inSight`.
- `extraction`: `EXTRACT_RUN_MODE`, `proposalChain`, `checkProposedRef`, `proposedReadingGrade`, `mintRatio` (its R41–R43).
- `content`: `captureFor`, `contentContextFor`, `mint`, the mint label (its R16), and the machine-minted rows of a set of documents (R12).
- `connections`: `citesInto` (R1's context rule).
- `inquiry`: the retired-target predicate (R3; `citation`'s once N55 splits it) and the content legs a member cited (R12).
- `basis-versions`: `appendVersion` (R4), the read-back of a version (R5), the held compositions (C-27.10), `SUGGEST_KINDS` (R6), the version legs that cite a row (R12), the candidate source (R14).
- `strength`: the pair over a candidate's legs to its depth bound, and the independence trace with its origin limit (R3, R5).
- `ai-runs`: `runFor`, `runPrincipalGate`, `boundOf`, `consumeBound` (R1, R10–R11).

### Invariants

- **R15** Every production names a running run whose principal is the caller (`ai-runs` R5); a production is never attributed to anyone but the stamped caller or proposer.
- **R16** Each check moves here as an invariant with its test (K6): C-27.1–C-27.14, C-27.16–C-27.19.
- **R17** `proposed_readings` (by bundle) and `suggest_refusals` (by target) are declared to record-core's purge (K23).
- **R18** This module writes no run and no bound row: it reads a run through `ai-runs.runFor` and spends a bound only through `ai-runs.consumeBound`.
- **R19** No place is named in this module's behaviour or outward text.

### Satisfies

- `docs/development/INVESTIGATIVE-SESSION.md` §4 (the fence), §6 rule 2 (a version's name is unique within its inquiry), §9 (what a suggestion is), §10 (one write path), §11 item 5 rule 1 (formed under a live run), §14b item 5 (the checks are the plane's), §15 (the empty-run instrument's object).
- `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` §3, §7.3 (EXTRACT's productions, runtime and bound).
- `docs/development/EXTRACTION-BREADTH-DESIGN.md` §4 (the EXTRACT role's extraction half).
- Bob's DEC-24 (rule 3: an earned grade is never offered), DEC-62, DEC-65.
- `build/layers.md`, layer 6's contract.

### Suggestions

- **Factory.** `runProductionsOf(ctx, env)` answers the one instance per Durable Object storage and reaches its uses through their factories (K61). The three op handlers move here (K3).
- **Registrations filled:** `basis-versions`' narrow candidate source (R14). None offered.
- **What stays out.** `SUGGEST_KINDS` and C-27.15 are `basis-versions`'; the frontmatter composition of a version and its promotion are `basis-versions`' `appendVersion`; the strength walk, the independence trace and their bounds are `strength`'s (this module re-exports the origin limit it publishes); the EXTRACT vocabulary is `extraction`'s; the counts `op=stats` gives of `proposed_readings` and `suggest_refusals` are read through a count this module provides.
- **For callers.** The control plane stamps `principal` (as `caller`), `author`, `viewer` and `proposedBy`, deleting a body's, and admits these ops only to the run-production classes.
- **Tests.** Each refusal and verdict gets a negative control that removes it alone; R2 the arm proving a verbatim resubmit leaves the document, its versions and its `bundle_sha` untouched and a moved document is judged again; R11 the arm proving a refused mint is recorded and spends nothing; R12 the arm proving a document the viewer cannot see moves neither the list nor the ratio.

## Open for Bob

None. Whether a production may be made under a mode not deployed is ai-runs' Open for Bob 1.
