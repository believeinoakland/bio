# filings (T45)

**Status** · session_0162rfUAY9xvRvZ6LS5J1DNM · depth 2 · WORKING · handled B8

## J1 · QUESTION

Readings I am building on now (P17: yours to confirm or change). Each names what it reads; I carry on with all of them and stop only if an answer changes what I build next.

1. **R34's judgment has no callable provider.** case-account R13 says its check is offered to no other module (code `case-account/index.mjs:535`); `advocacyCheck` runs only in the author's own-scope project and writes a row; the judgment `#advocacyJudged` is private. The reconciliation (R7 row "l9b filings R34") assumed "no case-account change". **Best reading:** a new edge `filings → case-checker` (L8, earlier) and filings calls its pure `checkAccount` (case-checker R24) itself: each sentence cites every finding of R35's three kinds the prepared text rests on (the determination's findings, or with none the inquiry's, or R23's `from`), read at their pinned bytes as `#fact` already reads them (conclusion as `claim`, `claim_state: adopted` for published, held and accepted), plus the group's own dated correspondence entries as `material` cites (text: date, direction, account or medium). Verdicts: no departure → `supported` (naming the cites); `ACCOUNT_CONTRADICTED_BY_RECORD` → `contradicted` (naming its detail); any other departure → `unsupported`; a throw or `MALFORMED` → every sentence `undetermined`, never supported. Alternative: case-account gains a read for other modules (re-opens an L8 job).
2. **The split.** No provider exports one (action-grammar R18 leaves it to filings). Filings owns it: the rule of `wizard-scripts`' `sentencesOf` (`/(?<=[.!?])\s+|\n+/`), copied, no edge.
3. **textcheck (R43, R48).** agent-worker stores nothing and no door routes `textcheck` (control-plane R57 has only writinghelp, groupdescriptiondraft). Best reading: the caller hands its answer in (`textcheck: {sentences: [{quote, reads_as, why}]}`) to `filingPrepare`, `communicationPrepare` and `filingApprove`; filings labels it machine work and matches by verbatim `quote` (K2824). Absent → R48's not-run sentence. The door route is owed to control-plane / plane (I will REPORT it).
4. **"The action's project" (R10, R42).** action-clocks R3 (the first rests_on determination's project) and action-holds R2 (the bundle's record-core project) differ. Best reading: the action bundle's own project (record-core), else the determination's.
5. **R42's audience.** project-roster R24's `secondApprovalNeeded` takes `public: boolean`, not `audience`. Best reading: `public` is true for a text prepared with `audience` `public` or `broad`, or a public comment/testimony `voice: group`; the kind and the governing tier as they are.
6. **R46 press terms.** actions R79 does not say the read answers them; I read `actionRead().press_terms` (`{on_record, embargo_until?, release_at?}`).
7. **R47 `HOLD_NOT_IN_PLACE`.** action-holds R11 mints it but exports no minter or "in place" read. Best reading: filings reads `holdsOf` for the place (latest statement) and passes action-holds' own refusal through by a minter action-holds exports (`holdNotInPlace(place)`), as `noSuchAction`; until then the code with action-holds' row. Its family: C-117 (the requirement) or C-149 (its START)?
8. **R37's time for review and response.** No action-clocks read answers one. Best reading: the action's own `clock[]` entry (date, basis, basis_kind) through `actionRead`; none → stated undetermined, never invented.
9. **R43's `breach: true`.** No `actionRevise`: filings promotes the revised `bundle.md` as `action-clocks.clockAdopt` does (`#reviseClock`), the actions step's refusals passing through.
10. **Member marks at preparation** (R34 `own_doing`, R39 pending measure, R44 `voice`, R9 defence's challenged statements, R37 `audience`): new optional arguments `own_doing: [sentence index]`, `names_pending: true`, `voice: group|self`, `challenged: [{statement, findings: [ids]}]`, `audience`. **The draft's language (R43):** the member's `language`; absent, undetermined (`phrasing.no_list`, never a refusal), never defaulted.
11. **Words owed to UX** (rfc.quoting, packet.privileged(.warning), filings.election.notice, recognition.staff_public, phrasing.no_list, the not-run sentence, "as myself"): I key each and hold a plain working sentence in code under that key; R40's check matches the keyed sentence's text.
12. **New ops** `jointsignatory`, `filingsecondapprove`, `holdnoticeprepare`, `templatesforaction`: op-declarations, op-grades, affordances, plane owe them (REPORT at COMPLETE). New rows C-115.45 onward, in R-order.
13. **Seam.** The module grows from 2,184 lines; I split the counsel packet (R8–R12, R31, R33) into `bio-plane/src/filings/packet.mjs` and the outward-text checks (R34, R38–R40, R43, R48) into `checks-text.mjs`, inside my path.

Status of providers: none of the L9 T45 code is built yet (action-grammar `pointOut`, action-holds, actions R74–R79, conformance's per-finding `basis`). I build against their requirements; my tests on them go green as they merge.

## J2 · COMPLETE

**T45-31 applied on `job/T45/filings`** (merged tranche/T45 through B5: conformance, action-grammar). Built on the readings BOB confirmed in B2 (K2848).

**Read whole by me (P20):** `build/requirements/filings.md`; all of `bio-plane/src/filings/` (index, schema, checks, dates) and all 13 test files and the fixture; T45-31, rule 4, the reconciliation (R1, R7, R8, R17) in the plan; `draft-T45-l9b.md` §3, §6, §7; K2780, K2781, K2787, K2824, K2832; `BIO_Action_v0_2.md`. The used modules' public parts (over the 600 KB limit) were read in full by two helper agents in this session, given my entries, each writing a digest citing sections (mechanics §17 (3)): the L9 providers (actions, action-grammar, action-holds, action-clocks, conformance, filing-templates, consequences, agent-worker's textcheck) and the earlier ones (case-account, docket, project-roster, public-read, local-facts, jurisdictions with the test profile, events, standards). Their findings are J1's questions.

**Entries applied (T45-31)**
- R8: `NO_DETERMINATION` retired (C-115.19, never reused); a packet at any stage; `purpose` claim (default) or defence.
- R9: facts per matter as it stands (no determination: each inquiry an action_basis leg names and the findings it holds, with kind and grade, not determined); claim deadlines exclude `defends: true`; a defence packet adds challenged statements, pressure received (action-holds `pressureFor`; docket `docketPressureMarks` kept to the action's cases/project and the reader's sight) and defence deadlines. Clears rule 4 (7)'s `packet.test.mjs` "R9 the six sections".
- R10: counsel-matter packets carry `packet.privileged` and its warning on head, every section, export (project-roster `projectScope`).
- R22: the stamp carries `public-read.groupFields()` as the quartet's `group` (outside the hash; a "Group:" line in the block); `body_sha` the fingerprint.
- R23: `from` (findings/inquiries chosen, `NO_SUCH_BUNDLE` C-115.55 alike for unseen); a request for comment's claims a sourced machine-labelled list.
- R24, R35: every `actions` R75 disclosure printed first in its order (held, accepted with identity and stake, override with its ground); pre-T45 reads the override alone.
- R34: the record check over one split (filings' own `sentencesOf`) through `case-checker.checkAccount` (edge K2848): supported/unsupported/contradicted, `question` and `own_doing` classed here; `CONTRADICTED_HELD` (C-115.45) unless `release: [{ord, reason}]`; throws read undetermined; re-run on the approved text; the briefing section checked too.
- R36 `jointSignatory` (C-115.48, .49); R37 document_infraction assembled without AI (each part sourced; violating party: quoting sentence + the action's clock date); R38 chance_to_fix assembled, asks pointed, `SELF_BENEFIT_ASK` (C-115.46) on every outward text (rule 21: "any demand"); R39 election notice on `names_pending`, position pointing for `voice: group`; R40 `RFC_QUOTING_MISSING` (C-115.47); R41 `templatesForAction`; R42 `filingSecondApprove`, `SECOND_APPROVAL_NEEDED`, `SAME_APPROVER` (C-115.50, .51); R43 the assertion gate with real action-grammar, textcheck unioned by quote, `ASSERTION_UNRESOLVED`/`_RESOLUTION_REFUSED` (C-115.52, .53), `breach_claim` through a promoted revision, `phrasing.no_list`; R44 `NOT_THE_GROUPS_ACT` (C-115.54); R45 recognition reminder; R46 review copy (face, stamp subject, sent before release recorded as review copy); R47 `holdNoticePrepare`; R48 staff via textcheck or the not-run sentence; R49 legal facts by kind. Marks refused `FILING_MARK_REFUSED` (C-115.56). The view is `local-facts.governingView` unless a caller hands in its profiles.

**Deferred, with why**
- The seam: the module is 3,315 lines (index 2,687); the counsel packet is named as the seam (J1 (13)) but not split: its code is private methods of one class, and moving it is a refactor no entry asks for; under K617's bound.
- Stand-ins still in tests, until their providers merge: `actions` R75/R78/R79 read fields (disclosures, partners, press_terms) via `actionsWith`; `action-holds` (`holdsOf`, `holdNotInPlace`, `pressureFor`) and docket marks via `filingsWith`. filings reaches action-holds only when handed in (`actionHolds`): add `actionHoldsOf` to the getter once action-holds merges.
- R9's kind of an unpublished finding read alone (no determination): published or unpublished only; checked-and-held and accepted are read through conformance's per-finding basis. A direct read needs an edge to `case-check` / `accepted-work` (BOB's).
- One test is red by design until filing-templates (T45-30) merges: t45 "R28 R41 (K2851) ... TEMPLATE_NOT_REVIEWED" (B3); my fixture already reads profile templates reviewed.

**Found in other modules (REPORT)**
- **control-plane / plane:** no door route for agent-worker `textcheck` (control-plane R57 has only writinghelp, groupdescriptiondraft); filings takes its answer handed in (`textcheck`) at prepare and approve.
- **op-declarations, op-grades, affordances, plane:** new ops `jointsignatory`, `filingsecondapprove`, `holdnoticeprepare`, `templatesforaction`; new body fields on `filingprepare`, `communicationprepare` (marks, `from`), `filingapprove` (`release`, `resolutions`, `textcheck`), `counselpacket` (`purpose`, `challenged`).
- **promotion (row census, `gate.mjs`):** C-115.19 retired; C-115.45–.56 new (rule 4 (2) until T46's stamp). answer-envelope's family list unchanged (C-115 exists).
- **project-roster:** `projectRosterOf` does not migrate its tables (a caller must `migrate()`); filings' reads catch it (never throw), so with an unmigrated store no second approval is ever needed: the plane must migrate it.
- **case-account / case-checker:** `checkAccount` judges a sentence with no figure, date, name or quotation `supported` whenever it cites anything; filings cites all the action's findings and correspondence for each sentence, so "supported" there means "states nothing the cited record lacks", not a positive match.

**Tests**
- filings: 90 pass, 1 fail (the K2851 test above, until T45-30).
- My users: escalation 63/0; action-plans 63/0; affordances 223/3, answer-envelope 26/5, control-plane 220/3, plane 194/2 — each failure identical, test for test, on `origin/tranche/T45` without my change (accepted reds, rule 4 (11), (12), (14), (9)).

**Checks** (from civicos-process)
- format: 153 modules, 152 requirements files; 0 failures.
- architecture . filings: 19 product files, 86 relative imports; 0 failures.
- coverage . filings: 48 of 48 live requirement ids named by a test; 0 failures.
- ownership . filings tranche/T45: 11 files changed; 0 failures.

Size (session_0162rfUAY9xvRvZ6LS5J1DNM): test runs 16, module lines 3315

## J3 · COMPLETE

**B3, B6, B7 processed; merged tranche/T45 (filing-templates, action-holds, consequences).** J2 stands, with these changes:

- **action-holds real (B6):** filings reaches it through `actionHoldsOf` on the host and passes its exported `holdNotInPlace` (C-149) through, for a released hold and when no module answers. Its stand-in is gone: R47's test places and releases real holds; R9's defence packet reads a real pressure mark (actions R15) through `pressureFor`.
- **A flaw found and fixed:** my new table `hold_notices` had the same name as action-holds' own; renamed `filing_hold_notices` (never released, no migration needed).
- **filing-templates real (B3, B6):** the fixture reads profile templates attributed and professionally reviewed; t45's "R28 R41 (K2851)" test (an unreviewed template refused `TEMPLATE_NOT_REVIEWED`, not offered after the act) is now green.
- **consequences (B7):** no stand-in was used; nothing to change.
- Stand-ins left: `actions` R75/R78/R79 read fields (until actions merges) and docket's legal marks (its R27 read; a real mark needs a docket record entry the fixture does not build).

**Tests:** filings 91 pass, 0 fail. escalation 63/0, action-plans 63/0 (re-run); affordances, answer-envelope, control-plane, plane as in J2 (identical to the tranche's accepted reds).
**Checks:** format 0 failures; architecture (19 files, 87 imports) 0; coverage 48 of 48; ownership 11 files, 0 failures.

Size (session_0162rfUAY9xvRvZ6LS5J1DNM): test runs 20, module lines 3315

## J4 · COMPLETE

**B8 processed** (B6, B7 were already applied in J3: action-holds through `actionHoldsOf` in the getter, stand-ins dropped). Merged tranche/T45.

- **R9's kind read alone (K2858 (1)):** with no determination, an unpublished finding a held check names reads `checked_held` (`case-check.heldFindingVersions`, its R3: read at the version the check pins, with `held: {case, edition, check, checked_at}`); a leg on another group's finding (`imported:` ref, its `target_edition`) accepted here reads `accepted` (`accepted-work.acceptedFinding`, its R2: group, import, acceptance, the source edition's pair as grade); otherwise published or unpublished as before. These kinds also feed R34's record check (unpublished is never cited).
- Test: t45 "R9 (K2858)": real accepted-work with a registered finding read standing in for case-import; case-check's R3 answer stood in (a held check needs a signed-but-held case the fixture does not build).
- Noted, nothing to do: (2) the plane migrates project-roster; (3) N916, N917; (4) the seam stays unsplit.

**Tests:** filings 92 pass, 0 fail. **Checks:** format 0; architecture (19 files, 89 imports) 0; coverage 48 of 48; ownership 11 files, 0.

Size (session_0162rfUAY9xvRvZ6LS5J1DNM): test runs 24, module lines 3347
