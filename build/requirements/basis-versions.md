# basis-versions — requirements

**Status** · DRAFT by a drafting worker for BOB #42, 2026-09-26 (P18), from a reading of the code; for Bob's approval (a product module, P17). Layer 6. Code today (measured on `tranche/T3` @ `35ea098`, after promotion's merge; `build/extraction/basis-versions.md` has the table): `bio-plane/src/store.mjs` 5630–6358 and 6589–6675 (`conclude`, `#withdrawConclusion`, the conclusion record and reads; map §5.3), 14301–14594 (`#narrowSource`, `narrowCandidates`), 15305–15565 (`narrow`), 15637–15752 (version splice helpers), 17176–17349 (`basisVersionsOf`, `#compositionDiff`), inside `#promoteChecks` 17900–18036 and `#promoteProjections` 18352–18477 and 18797–18818, 37255–37463 (`#versionCollections`, `#versionLegsEarned`), 37533–37731 (`basisVersions`, `#currentVersionOf`), 38458–39020 (the six version acts, `#moveVersionState`, `#setProjectCurrentVersion`), and the dispatch entries `basisversions`, `versionaccept` … `versionhide`, `narrow`, `narrowcandidates`, `conclude`, `withdrawconclusion`. `bio-plane/checks/bio-checks.mjs` 6801–7717 (C-25, `VERSION_MACHINE`, `basisVersionFindings`), 12778–12878 (C-50), and rows C-27.15 with `SUGGEST_KINDS`, C-33.1, C-33.2, C-33.33–C-33.37, C-32.2. `schema.mjs`: `inquiry_basis_versions`, `inquiry_basis_version_legs`. `from`: `legacy-store` and `legacy-checks`; `index.mjs` keeps only routing, gates and stamps (K3). Not yet met: none. No old-plan row is carried to `basis-versions`.

**Size (P6).** About 4,280 lines move (about 2,160 without comment-only and blank lines): `store.mjs` 3,004, `bio-checks.mjs` 1,018, `schema.mjs` 257. Just past the 4,000 mark; one session reads it with its uses' public parts (K74's test). The conclusion acts are 816 of them; left with `inquiry` they would need a registration from this module (map §5.3). `op=suggest` (912 lines and C-27) is placed with `ai-runs`, not here (map §5.2).

## Public

### Purpose

An inquiry's basis holds several **versions**, each a complete, named, described alternative account of the support for its claim, frozen once written (INVESTIGATIVE-SESSION §6). This module holds the versions and their legs, their six-act state machine, the version a project stands on (CURRENT, §7), a project's conclusion as the adoption of that version's claim (§7.1), and narrowing a leg to a part of its document (Content Framework §14.4). Every act is a member's; a machine proposes a version and holds no act that moves one.

### Provides

Terms. A **version** is a `basis_versions[]` row `{name, description, claim?, relationship, state, derived_from, hidden, kind?, run?, author, at, state_by?, state_at?, state_reason?, affirmed_parts?, regroup_by?, regroup_at?, regroup_note?}` with its `basis_version_legs[]` (legs as `inquiry` defines them) and `basis_version_grounds[]`. Its **composition** is the canonical text of every field that defines it. States: `suggested`, `considering`, `accepted`, `rejected`. A project's **CURRENT** is its `current_versions[]` row for the inquiry; its **conclusion record** is its `conclusions[]` rows for the inquiry, the latest being its **stance**.

**The grammar: basisVersionFindings(fm, findings), basisVersionsOf(fm), VERSION_MACHINE, versionNeedsReason(to), VERSION_NAME_RE** Pure; never throw.
- **R1** A version carries a description (C-25.1) and a name of 1–64 permitted characters unique within its inquiry (C-25.2), a known state (C-25.12), a boolean `hidden` (C-25.13), a `kind` in `SUGGEST_KINDS` when present (C-27.15), and, once moved, `state_by` a named member and `state_at` an ISO instant (C-25.19).
- **R2** `derived_from` names a version of the same inquiry (C-25.7) and the derivations form a tree (C-25.8). Every leg and ground row names a version that exists (C-25.15).
- **R3** Each version's legs obey `inquiry`'s leg grammar (its R4, R5): a lead or theme refused by name first; a canonical information or inquiry target that is not this inquiry (C-25.14); vocabularies (C-25.10). Its grounds obey DEC-32 per version: labelled all or none (C-25.5), each declared once with a named asserter and date (C-25.6), no empty ground (C-25.15); `relationship` states AND or OR (C-25.3) and agrees with the partition (C-25.4); a regrouped partition inherited from `derived_from` carries an attributed regroup (C-25.9).
- **R4** The machine: `suggested` → `considering`, `accepted`, `rejected`; `considering` → `suggested`, `accepted`, `rejected`; `accepted` → `considering`, `rejected`; `rejected` → `suggested`, `considering`, `accepted`. `considering` and `rejected` need a reason.
- **R5** `basisVersionsOf` answers each version with its legs, grounds and composition: every field that defines it, in a fixed order and escaping, which is the text R6's freeze compares byte for byte.

**Its share of a promotion** (a check and a projection registered with `promotion`, its R39)
- **R6** Check, for an inquiry that is not a replay: R1–R3 (`BASIS_VERSION_REFUSED`, each finding with its code and translation); a leg whose target no bundle holds (`VERSION_LEG_UNRESOLVED`, C-25.16); `content.citationRefusals` over the version legs; a held version whose composition this promotion changes (`VERSION_FROZEN`, C-25.11, naming what changed and the repair: a new version `derived_from` it).
- **R7** Projection: `inquiry_basis_versions` and `inquiry_basis_version_legs` re-derived whole from the document, each document leg's content row the one it names or `content.resolveCitation`'s (no carry-forward: a version is frozen); the answer lists `version_content`.

**basisVersions({id, limit, offset, viewer, project})** (`op=basisversions`)
- **R8** `BASIS_VERSIONS_NO_INQUIRY` (C-25.17); `BASIS_VERSIONS_NOT_AN_INQUIRY` (C-25.18). An inquiry the viewer may not see answers exactly as one with no versions; `inquiry_present` appears only when it is visible.
- **R9** At most 200 versions by default and 1,000 at most, whole or absent, each with at most 500 legs, `leg_count` and `legs_complete`; `total`, `truncated`. Hidden versions are returned, flagged (DEC-29(b)). Each carries its composition, who moved it and why, its affirmed parts and regroup.
- **R10** Each leg's capture grade is reported as `inquiry.legCapped` bounds it, with `grade_authored` and `grade_why`; the grades are marked `authored`, the composition's.
- **R11** With `project`, the answer adds that project's CURRENT, its concluded stance, its conclusion history and stance state; always, the no-project conclusion (R23).

**The six acts: versionAccept, versionReject, versionConsider, versionRevert, versionCurrent, versionHide({target, version, reason, project, hidden, preview, affirmed, author, viewer, identity})** (`op=versionaccept` … `op=versionhide`)
- **R12** Refusals in order: `VERSION_ACT_NO_INQUIRY` (C-25.20), `VERSION_ACT_NOT_AN_INQUIRY` (C-25.21), `VERSION_ACT_NO_VERSION` (C-25.22), `MACHINE_CANNOT_MOVE_VERSION` (C-25.24, an empty or machine author), `VERSION_ACT_NO_SUCH_VERSION` (C-25.23; an invisible inquiry answers the same), `VERSION_ACT_UNWRITABLE` (C-25.31), `PUBLISHED_CANNOT_MOVE_VERSION` (C-25.34) for a state move on a case member, `VERSION_NO_REASON` (C-25.26), `VERSION_REASON_MALFORMED` (C-25.32; 500 characters, no quote, backslash or newline), `VERSION_ILLEGAL_TRANSITION` (C-25.25), accepting a version that would close a basis cycle `VERSION_BASIS_CYCLE` (C-25.27, naming the path), accepting a version of several separately sufficient parts without affirming every one of them `VERSION_AFFIRMATION_INCOMPLETE` (C-25.33).
- **R13** `current` requires the version accepted (`VERSION_NOT_ACCEPTED`, C-25.28), a project (`VERSION_CURRENT_NO_PROJECT`, C-25.29), one the viewer sees that cites the inquiry by a live edge (`VERSION_CURRENT_UNRELATED`, C-25.30), and the actor joined to it.
- **R14** `preview` runs every refusal and answers the receipt with `wrote: false`. Otherwise accept, reject, consider and revert write the version's state, `state_by`, `state_at`, `state_reason` and the affirmed parts into the inquiry, with a Session Log entry; hide sets or clears `hidden` and never deletes.
- **R15** `current` writes only the project: its `current_versions` row, `last_updated` and a Session Log entry with the reason; the inquiry's bytes do not change (REC-166).

**Conclusion: conclude({target, conclusion, falsifier, noFalsifier, version, project, commentary, viewer, author, identity}), withdrawConclusion({target, project, reason, …})** (`op=conclude`, `op=withdrawconclusion`); **reads: currentOf(project, inquiry, viewer), conclusionRecordOf(project, inquiry, viewer), noProjectConclusionOf(inquiry)**
- **R16** Refusals in order: `MACHINE_CANNOT_CONCLUDE` (C-32.2) for either act; then for a conclusion `NO_CONCLUSION` (C-33.1) without a project; `CONCLUSION_IS_THE_CLAIM` (C-33.35) for free text beside a project; `NO_FALSIFIER` (C-33.2) unless a falsifier is stated or `no_falsifier` asked; `FALSIFIER_AND_NONE_STATED` (C-33.33); `BAD_CONCLUSION`, `BAD_FALSIFIER`, `BAD_COMMENTARY` (500); `NO_TARGET`; `NO_SUCH_BUNDLE`; `NOT_AN_INQUIRY`; `NO_DOCUMENT`; `ILLEGAL_TRANSITION` by `inquiry`'s machine, except that a project may conclude a question already `concluded`; for a project `NOT_A_PROJECT` and the actor joined.
- **R17** `NO_CLAIM` (C-33.34) when nothing can be adopted: commentary without a project; no version named without a project; a project that does not draw on the question, stands on no reading, or names a reading other than its CURRENT; a version not carried, not accepted, or stating no claim. `NO_BASIS` (C-33.40) when the adopted version has no legs, or (no project) the question has none.
- **R18** With a project, one dated, authored `concluded` row is appended to the project's `conclusions[]` (the version, its claim verbatim, the falsifier or the override by and at, the commentary marked not evidence); the question's bytes do not change; the answer names the prior stance and the history length.
- **R19** Without a project, the question moves to `concluded` with the conclusion, `conclusion_version`, `conclusion_claim`, the falsifier or the override pair, a state-history entry and a Session Log entry.
- **R20** `withdrawConclusion`: `NO_REASON`, `BAD_REASON` (160), `NO_TARGET`, `NO_SUCH_BUNDLE`, `NOT_AN_INQUIRY`, `NOT_A_PROJECT` (a project is required), the actor joined, `NOTHING_TO_WITHDRAW` (C-33.37) unless the stance is `concluded`; appends a `withdrawn` row naming what it withdraws; never edits an earlier row.
- **R21** `UNSPLICEABLE_CONCLUSIONS` (C-33.36) when the project's block cannot be extended; nothing is written.
- **R22** `conclusionRecordOf` answers the rows for the question in order and the stance; a row naming an act this module does not know reads `undetermined`, never skipped; an invisible project answers no record.
- **R23** `noProjectConclusionOf` answers the question's own conclusion, its claim `adopted` only when the named version still states that claim, else `undetermined` with why; a conclusion written before versions reads `undetermined` and is never back-filled.

**Narrow: narrowCandidates({target, version, ord, viewer}), narrow({target, version, ord, name, description, extent, author, viewer})** (`op=narrowcandidates`, `op=narrow`)
- **R24** Both locate the citation: `NARROW_NO_INQUIRY` (C-50.1; absent or invisible), `NARROW_NO_SUCH_VERSION` (C-50.2), `NARROW_NO_SUCH_LEG` (C-50.3), `NARROW_NO_PART` (C-50.4) when the leg rests on an inquiry or has no content row.
- **R25** `narrowCandidates` writes nothing and answers at most 50 per source of parts strictly narrower than the leg's, each labelled machine work and a proposal: the places the record's reading found a reference (whether it names the subject), passages an extract run proposed (registered by `ai-runs`), and rows a machine marked citable; `truncated`; with none, the absence by level (never read, or read and nothing inside).
- **R26** `narrow` refuses `NARROW_NOT_A_MEMBER` (C-50.5), `NARROW_BAD_EXTENT` (C-50.7: an unknown field, an unwritable value, a content id and a part together, an unknown content id), `NARROW_NO_EXTENT` (C-50.6), `NARROW_OTHER_CAPTURE` (C-50.8, a part of another document or copy), `BASIS_REFUSED` (`inquiry`'s R5), `NARROW_NOT_NARROWER` (C-50.9), `NARROW_NAME` (C-50.10: missing, malformed or taken), `NARROW_NO_DESCRIPTION` (C-50.11, empty or boilerplate).
- **R27** `narrow` writes a new version `suggested`, `derived_from` the old, identical but for the one leg, which now names the part (pinned to the old leg's capture) and carries no grade (the old grade is reported as not carried); the old version is untouched; the answer says whether the part was a machine proposal.

**appendVersion({target, version, grounds, legs, author, run?, kind?})** For `ai-runs`' `op=suggest` and R27.
- **R28** Appends one version, its grounds and legs to the question's document in `suggested` state and promotes it, so R6 judges it; it never sets another state. Whether the composition differs in substance from every held version is the caller's check (`ai-runs`' C-27.10).

## Private

### Uses

- `legacy-checks`: the C-25, C-50, C-27.15 and C-33 rows until they move (R35), `SUGGEST_KINDS`, `isBoilerplate`, `normalizeType`, `parseFrontmatter`, `isMachineIdentity`.
- `record-core`: `recordOf(ctx)`, `declarePurge`, the `bundles` read contract.
- `membership`: `viewerPredicate`, `bundleGate`, `existenceAct`, `projectAuthority`.
- `promotion`: `promote`, `registerStep`; the fact `caseMember`. *(not declared)*
- `content`: `citationRefusals`, `resolveCitation`, `contentRow`, `canonicalExtent`, `describeExtent`, `extentRelation`, `citationExtent`.
- `connections`: `themeLegFindings` (K79), `citesInto`.
- `inquiry`: the leg grammar (R4, R5), `legCapped` (R14), `cyclePath`, `INQUIRY_MACHINE`, `DISPOSITIONS`.
- `extraction`: the `readings` and `reading_refs` read contract (R25). *(not declared)*
- `entities`: the `resolutions` read contract (R25). *(not declared)*

### Invariants

- **R29** A version is frozen once written: nothing rewrites its composition; editing makes a new version derived from it (§6 rule 3).
- **R30** A machine credential holds no act that moves, hides or makes current a version, concludes or narrows; it may only append a `suggested` version through `ai-runs` (§4).
- **R31** One team's act never moves another's stance: CURRENT and a conclusion are written on the project, never on the shared question (§7, §7.1).
- **R32** A project's conclusion record is append-only; the latest row is its stance (DEC-19).
- **R33** Every act and read naming a question, version or project the viewer may not see answers as an absent one.
- **R34** `inquiry_basis_versions` and `inquiry_basis_version_legs` carry `bundle_id` and are declared to record-core's purge (K23).
- **R35** Each check moves here as an invariant with its test (K6): C-25.1–C-25.34, C-27.15, C-50.1–C-50.11, C-33.1, C-33.2, C-33.33–C-33.37, C-32.2.
- **R36** No place is named in this module's behaviour or outward text.

### Satisfies

- `docs/development/INVESTIGATIVE-SESSION.md` §4 (the fence), §6 (versions, rules 1–8), §7 (CURRENT), §7.1 (the conclusion), §9 (kinds), §12 (the affirmation at accept).
- `docs/architecture/BIO_State_Rules_Consistency_v1_5.md`, the amendment "`concluded` is a state of a PROJECT'S relationship with an inquiry".
- `docs/architecture/BIO_Case_Making_v0_1.md`, what a CLAIM is (the falsifier accounted for, REC-117).
- `docs/architecture/BIO_Content_Framework_v0_10.md` Part II §14.4 (narrowing; a machine's relevance is labelled).
- `docs/architecture/BIO_Interaction_Constructs_v0_1.md` (a proposal is adopted, deferred or dismissed with a reason).
- DEC-12, DEC-19, DEC-24, DEC-29(b), DEC-32 (rule 4), DEC-72 clause 3.

### Suggestions

- **Factory.** `basisVersionsOf(ctx)` (distinct from the pure `basisVersionsOf(fm)`, which may keep its name as `versionsIn(fm)`) answers the one instance per Durable Object storage, reaching `inquiry`, `content` and `promotion` through theirs (K61).
- **Registrations it offers.** `onCandidates` for `ai-runs`' extract proposals (R25); `legacy-store` registers until `ai-runs` is extracted.
- **One implementation.** `test/versionstate.test.mjs` pins one `#moveVersionState`; keep the six acts on one implementation.
- Tests: every refusal gets a negative control; R15 and R18 get arms proving the question's bytes and `bundle_sha` do not move.

## Open for Bob

1. **May a member rename a version?** §6 rule 2 says "the AI names the versions it adds; a member may rename". No act renames one: the name is part of the frozen composition, a project's CURRENT and a conclusion point at it by name, and a changed name is refused as `VERSION_FROZEN`. *Recommendation:* no rename; a member who wants another name makes a new version derived from it (as narrowing does), so every pointer keeps meaning what it meant, and §6 rule 2 is amended to say so.
