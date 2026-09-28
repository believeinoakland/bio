# filings (T8)

**Status** · session_01N4paMRwP5wLaRFraqLcEB1 · depth 2 · WORKING · handled B3

## J1 · QUESTION

Four of filings' providers (standards, conformance, consequences, actions) are being built beside it in layer 9, so I build against their Provides through injected dependencies (no import of a file that does not exist yet) and test with stand-ins that answer exactly what their Provides state. Where a Provides leaves a field's name open, this is my reading; I carry on with it. Please confirm, or name what the providers' jobs answer instead.

1. **actions.actionRead({id, viewer})** (R29 = R25's block). Beside R25's keys I read: `id`; `current_state` (R1's `ACTION_CLOSED` on `resolved`/`abandoned`); `counterparty` as the document holds it (actions R9: `{state: named, role, body, level?}` or `{state: undetermined, basis}`); `clock` (the document's entries); `legs` (`[{target, kind, ...}]`); `governing_laws` (`governingLawsOf`: `{state: stated, laws: [{level, citation}], by, at}` or `{state: undetermined, ...}`); `law`; `risk_tier` (1, 2, 3 or `undetermined`). Its `NO_SUCH_BUNDLE` and `NOT_AN_ACTION` both answer filings' one `NO_SUCH_ACTION`.
2. **The action's determination** (R3, R8's `NO_DETERMINATION`, R6's staleness): its `rests_on` legs whose target `conformance.determinationRead` answers (a `CONF-` id, N129) and that is live; with several, the first live one in leg order.
3. **conformance.determinationRead({id, viewer})** answers `{ok, id, project, act: {id, description, actor: {role, body}, at | period, evidence}, findings: [{id, case, edition, version_sha}], standards: [{id, outcome, in_force}], rows, live, superseded_by, basis_changed: {causes} | null, author, at}`; **determinationsFor({finding, live: true, viewer})** as its R11.
4. **standards.standardRead({id, viewer})** answers `{ok, id, cite, kind, issuer, text: [content ids], period, superseded_by}`; **standards.inForce(id, date)** answers `{state, why}` (a bare state string also read).
5. **consequences.consequencesOf({determination, viewer})** answers its R7 `{parts, totals, undetermined, unproven}`; filings includes it whole, states kept apart (R9).
6. **R15/R21's block.** The profile has no link from a kind to an office, so "the kinds available against its counterparty's offices" is read as: for each office the determination's act names (`act.actor`), every kind of the view's `action_kinds`, each with its tier (or undetermined) and label, the office stated as matched in the view's `counterparties` or not. For Tier 3 kinds the standards the theories rest on are the determination's standards whose per-standard outcome is `noncompliant`. For the published case, the block covers the live determinations resting on any finding of that edition whose project owns the case, read by the plane (a machine viewer), since the package is public and conformance R2 already binds such a determination to that project's published findings.
7. **Ops.** filings has no `from`, so it writes no legacy file: it exports `filingsOps(f, url, body)` (the reevaluation pattern) for legacy-index to route in layer 11 (map §4's ~25 lines are that job's), and REPORTs it.

## Completion

**Entries applied** (plan layer 9: build per requirements; map: nothing moves; K171 (13), (14); K248).
- New module `bio-plane/src/filings/`: `index.mjs` (the services, `filingsOf(host, deps)`, `filingsOps`), `schema.mjs` (`filing_drafts`, `filing_approvals`, `filing_sendings`, `counsel_packets`, `counsel_packet_exports`, `theory_proposals`, each keyed by `action_id` and declared to purge, R19), `dates.mjs` (R9's deadline date), `checks.mjs` (the C-115 refusal family, K248: 26 rows, each with `where` naming a DEC-49 region marked in `index.mjs`).
- R1–R5 `filingPrepare`: refusals in R1's order; the governing tier (Terms, R2) as the stricter of the view's kind tier and the action's, undetermined never read as 1, the action's alone when the view gives none (stated, and a conflict is stated as one); the closed blank set `FILING_BLANKS` (`{{name}}`, 13 names), every filled blank `{name, value, source}`, every other left as `[UNFILLED: name]` with why (no value, undetermined, not visible, or not a blank this module fills); Tier 2's `advisory` first in the text, or an unfilled `advisory` blank when the view has none; drafts labelled by `proposalLabel(preparer, "filing_draft")`, `evidence: false`, never edited.
- R6 `filingApprove`, R7 `filingRecordSent` (one `sent` entry through `actions.actionCorrespond`, in one transaction with the sending row; `proposed` = next state and `actions.clockPropose`'s offers for the kind's deadlines starting at filing or receipt).
- R8–R12 `counselPacket`, `counselPacketRead`, `counselPacketExport`: six sections plus consequences, every item naming its source; exhibits' attestations by `provenance.attestationsOf`; the marking on the head, every section and every line under an export's headings; one packet id per action, a version per assembly; `basis_changed` read at each read (determination superseded or flagged, a later edition of a pinned finding's case, a standard superseded).
- R13 `filingsFor`; R14 `theoryPropose`; R15 the `available_actions` block registered with `publication.registerEvidenceBlock` at construction; R21 `availableActions` from the same composer.
- Readings recorded in J1 (items 1–7); B2 (K248) keeps 6 and 7 and leaves 1–5 to the providers' early-merge REPORTs. Two further readings of mine: `ALREADY_APPROVED` is asked right after `NO_SUCH_FILING` (R6 lists it outside its ordered list; staleness of an approved draft is moot), and a deadline's count starts on the day after its start event (`COUNTED_FROM`, stated beside every date).

**Deferred.** Nothing of this module. Items 1–5 of J1 are built on my reading until each provider's early merge confirms or corrects it; a CHANGE re-opens the job for the stand-ins and adapters (`#action`, `#det`, `#standard`, `#inForce` in `index.mjs`).

**Found in other modules** (REPORT J2).
- legacy-index (layer 11): route `filingsOps`' nine ops (`filingprepare`, `filingapprove`, `filingsent`, `counselpacket`, `counselpacketread`, `counselpacketexport`, `filingsfor`, `theorypropose`, `availableactions`) and construct `filingsOf(ctx, deps)` with `actions`, `conformance`, `standards`, `consequences` (once merged) and `producingGroup` (legacy-store's `#producingGroup`). filings has no `from`, so it wrote no legacy file.
- actions: filings reads `state_history` from `actionRead` for R9's chronology; actions R25 does not list it. With none answered, the packet states the history as not answered, with why.
- actions R32 / filings R9: both count business days on the view's holiday calendar; filings counts from the day after the start event. `clockPropose` should use the same convention, or filings should read actions' computation once it is built.
- legacy-tests: the DEC-49 guard may harvest `FILINGS_CHECKS` (C-115.1–.26) from `src/filings/checks.mjs`.
- No generated artifact is stale: nothing bundled imports `src/filings/`.

**Tests and checks.**
- `node --test bio-plane/test/m/filings/`: tests 30, pass 30, fail 0, skipped 0, todo 0 (`prepare` 8, `approve-send` 6, `packet` 8, `reads` 6, `refusals` 2). Negative controls: the stricter tier made the laxer → 18 fail; the unfilled-marker refusal removed → 2 fail; restored green (byte-identical).
- Layer tests: none named in `build/manifest.md`.
- format: 69 modules, 64 requirements files; 0 failures. architecture: 10 product files, 29 relative imports; 0 failures. coverage: 21 of 21 live requirement ids named by a test; 0 failures. ownership: 11 files changed by filings between tranche/T8 and HEAD; 0 failures.

Size (session_01N4paMRwP5wLaRFraqLcEB1): test runs 12, module lines 1303

## J2 · REPORT

1. legacy-index (layer 11): route `filingsOps`' nine ops (`filingprepare`, `filingapprove`, `filingsent`, `counselpacket`, `counselpacketread`, `counselpacketexport`, `filingsfor`, `theorypropose`, `availableactions`) and construct `filingsOf(ctx, deps)` with `actions`, `conformance`, `standards`, `consequences` (once merged) and `producingGroup` (legacy-store's `#producingGroup`). filings has no `from` and wrote no legacy file; the R15 block registers itself with publication at construction.
2. actions: filings reads `state_history` from `actionRead` for R9's chronology; actions R25 does not list it. With none answered, the packet states the history as not answered, with why. Please have actions answer it, or rule that R9 reads it elsewhere.
3. actions R32 and filings R9 both count business days on the view's holiday calendar. filings counts from the day after the start event (`COUNTED_FROM`, stated beside each date); `clockPropose` should use the same convention.
4. legacy-tests: the DEC-49 guard may harvest `FILINGS_CHECKS` (C-115.1–.26, `src/filings/checks.mjs`), each `where` a region marked in `src/filings/index.mjs`.
5. My readings beyond J1: `ALREADY_APPROVED` is asked right after `NO_SUCH_FILING` (R6 names it outside its ordered list); a draft id is `FIL-`, a packet `CPK-` (one per action, versioned), a theory proposal `THY-` (none of them bundles).
6. No generated artifact is stale: nothing bundled imports `src/filings/`.

## J3 · COMPLETE

filings built per requirements (R1–R21): 30/30 tests, 21/21 ids covered; format, architecture, coverage and ownership clean; no legacy file touched. Providers' shapes (J1 items 1–5) are my reading until their early merges; a CHANGE re-opens the adapters. Record: build/jobs/T8/filings.md, §Completion; REPORT J2.

## Completion · B3 (K250)

**Change applied.** `tranche/T8` merged (consequences merged early). consequences' J2 confirms J1 item 5: `consequencesOf({determination, viewer})` → `{ok, determination, standard, parts, totals, undetermined, unproven, says}`, which filings includes whole in R9's section. No source change beyond the header naming the factory `consequencesModule(host, deps)`. The test fixture now builds the real `consequencesModule` (reading the conformance stand-in, which also answers `outcomes: [{standard, outcome}]` as consequences reads it) instead of a stand-in, and the R9 test records an assessed and an undetermined part through `consequenceRecord` and checks the section is `consequencesOf`'s answer whole, totals within one state.

**Tests and checks.** `node --test bio-plane/test/m/filings/`: tests 30, pass 30, fail 0. format: 69 modules, 64 requirements files; 0 failures. architecture: 10 product files, 30 relative imports; 0 failures. coverage: 21 of 21 live requirement ids named by a test; 0 failures. ownership: see below.

Size (session_01N4paMRwP5wLaRFraqLcEB1): test runs 14, module lines 1303

## J4 · COMPLETE

B3 (K250) applied: tranche/T8 merged; consequences' shapes confirm J1 item 5, no source change beyond naming consequencesModule; the fixture uses the real consequencesModule. 30/30 tests, 21/21 ids; format, architecture, coverage, ownership clean. Record §Completion · B3.
