# action-grammar (T45)

**Status** · session_01A5ieNwm4E8kvPnNLANz7kS · depth 2 · WORKING · handled B1

## J1 · COMPLETE

**T45-25 applied on `job/T45/action-grammar`.** Every id marked *(not yet met: T45)* is met: Purpose; R2, R5, R7, R8, R9, R11 amended; R15–R25 new.

**Read whole by me (P20; plan rule 2):** `build/requirements/action-grammar.md`; the public parts (Purpose, Provides) of my five Uses (`record-grammar`, `jurisdictions`, `civil-time`, `connections`, `inquiry-grammar`), and `jurisdictions` R37, R58, R76, R77, R84, R86, R87; `build/layers.md` (its head, "No jurisdiction in the product" and both layer-9 sections); `BIO_Action_v0_2.md`; `draft-T45-grammar.md`; the plan's T45-25 entry, rules 1–5, and the reconciliation R1–R21 (R1, R6, R7, R21 name me); K2780, K2781, K2787; `draft-T45-l9a.md`'s gate, addressing, receipts, scopes, holds and rows sections (for the new rows' raising sites). All my code (`index.mjs`, `grammar.mjs`, `checks.mjs`) and tests (`grammar.test.mjs`, `seeks.test.mjs`, `corpus.mjs`, `fixture.mjs`; `golden.json` is a recorded fixture, K2053).

**Entries applied**
- **R2:** `OVERRIDE_GROUNDS`, `ASSERTION_RESOLUTIONS`, `PRESS_RECORD_TERMS`, `FOUND_ELSEWHERE_KINDS`, `BEARINGS`, `PROMISE_KINDS`, `CLOCK_OWED_BY` exported frozen; `PHRASING_KINDS` re-exported as `jurisdictions`' own binding (its R86 exports it frozen; `===`, as `LAW_LEVELS`), never a copy. Every earlier export byte-identical (golden test).
- **R5:** met as built; the owed test added (acknowledgement on a request for comment accepted at the arm, ledger arm and audit; on a `sent` entry `STAGE_NOT_OF_DIRECTION`).
- **R7:** the audit appends, after its earlier arms, R15 (only for an override stating a ground), R20, R21, R22 (no facts: `OFFICE_STATUS_UNKNOWN` dropped in the audit), R23 (with `ctx.bundleId`); R8's holder through `counterpartyFindings`; C-11.1's `owed_by` arm in the clock loop. The pre-T45 corpus answers byte-identically (the golden tests are unchanged and green).
- **R8:** `holder: {name}` on the press arm; malformed or on any other arm one C-2.10 finding `(R9, arm: holder)`. `HOLDER_NAME_MAX` (200) exported.
- **R15–R25** as worded, in `checks.mjs` (field grammars, written as the earlier arms, each finding C-2.10 with its code) and two new files inside my paths: `phrasings.mjs` (the English lists, data, R16) and `finder.mjs` (`phrasingsFor`, `pointOut`, `readAs`, the resolution grammar), both re-exported by `checks.mjs`. R16's lists hold every pinned phrasing plus four inflections (`violates`, `breaks the law`, `breaking the law`, `fails to comply with`) and `we endorse`; own-benefit kept to the pinned six (K2781 (5)).
- **R9:** C-117.22 retired (number never reused); C-117.30–.66 added in R9's order (actions' 23, the five shape codes, action-holds' 3, action-replies' 6), translations my drafts for you, the UX stream's to revise.
- **R11:** the test profile's three `en-GB` phrasings tested with and without the profile; the second language through a second test profile object combined beside it (see "Found", 1).
- **The START's red** ("R1, R11: actionKinds(view)", rule 4 (7)): green; the test now reads the test profile's kinds from the view rather than pinning the T44 list.

**My readings (details, mine; say if you want otherwise)**
1. Where R17 matches a profile item's `locale`: the whole tag, case-insensitive, or the same primary subtag, in both directions (`en-GB` items apply to `en` and to `en-US`), so the test profile's `en-GB` phrasings reach an `en` draft.
2. R19's findings carry `check: "C-2.10"` and code `ASSERTION_RESOLUTION_REFUSED` (filings' C-115 row maps the code); with `pointed` undetermined, nothing is judged against it (no refusal: reconciliation R1). `assertionsUnresolved` also answers `state: "read"`.
3. Every T45 arm's finding is C-2.10 with its code (R25's `LAW_STAGE_UNKNOWN` too). `entryFieldFindings` answers full findings (check, severity, message, code), as `actions` reads `code` and `message`.
4. **The new rows' `where`s** for codes other modules mint name sites their jobs will build; each job either builds that region or reports the one it built, for the row census to re-point: `src/actions/index.mjs` `#breachRefusal > is-breach-noncompliant`; `#fieldFences > is-machine-set-partners | -press-terms | -reply-owed`; `actionReceipt > is-receipt-on-sent`; `actionCorrespond > is-reply-owed`, `> is-stage-in-law`; `#heldLinks > is-follows-action`; `actionScope > is-scope`; `actionPromise > is-promise`; `src/action-holds/index.mjs` `#holdPlace > is-hold-place`, `holdNoticeSent > is-hold-notice`; `src/action-replies/index.mjs` `actionReplyBearing > is-reply-bearing`, `aroseFromLink > is-arose-from`. Codes my arms push name my functions (`… checks.mjs overrideGroundFindings > is-override-ground`, etc.), each region in the source.

**Also fixed (my module, P8):** `seeks.test.mjs` read `checks.mjs`' source text (a region marker, a function's spelling); it now asserts at the interface only (JOB rule: tests never read source text).

**Deferred:** nothing.

**Found in other modules**
1. **jurisdictions (its R84/R86; R11 here):** the test profile holds phrasings in English only (`en-GB`, one per kind). R11 says the test profile extends the lists "in English and in a second language". My tests meet it with a second test profile object (`test-second-language`, Spanish, one per kind) combined beside `test-port-ellery`; if you want the second language in `test-port-ellery` itself, that is a jurisdictions line, and my test can then read it there.
2. **actions (T45-27), red from this merge:** retiring C-117.22 (R9) leaves `actions`' `HOLD_NO_LEGAL_MARK` refusal without its row, so two `actions` tests go red: `t20.test.mjs` "R52 actionHold: refusals in R52's order, each with its row (C-117.20-.22)…" and `t27.test.mjs` "R57 holdReleasePreview: refusals in R57's order…" (they read `C-117.22`). Cleared when `actions`' job retires the refusal (its R52, R56, R57 amended); `action-holds`' copy (T45-26) should not copy it. Please accept them by name until T45-27.
3. **answer-envelope (rule 4 (14)):** my 37 new rows join the family totality reds already accepted until T45-49; no code collides with another family's (checked across `src/`).
4. **The plane bundle** is staled by this merge (rule 4 (5)).
5. **instance-setup (T45-44):** `lawStagesFindings(stages)` takes one law's `stages` list and answers findings naming `stages[i]`; it prefixes the law. `stageInLaw` for `actions` R85.

**Tests**
- action-grammar: 60 pass, 0 fail (`grammar.test.mjs`, `seeks.test.mjs`, new `t45.test.mjs` and its pinned rows `t45-rows.mjs`).
- My users (I changed services they use): action-clocks 55/0; escalation 63/0; setup-page 83/0; instance-setup 135/0; actions 109/2 (Found 2); filing-templates 55/1 and filings 69/1 (rule 4 (7)'s, until T45-30, -31); affordances 224/2 (rule 4 (11), (12)); answer-envelope 27/4 (rule 4 (14)). action-holds and action-replies have no tests yet. No layer tests (manifest).

**Checks** (from civicos-process)
- format: 153 modules, 152 requirements files; 0 failures.
- architecture . action-grammar: 12 product files, 27 relative imports; 0 failures.
- coverage . action-grammar: 25 of 25 live requirement ids named by a test; 0 failures.
- ownership . action-grammar tranche/T45: 8 files changed; 0 failures.

No file outside my `paths` and `tests` (rule 3).

Size (session_01A5ieNwm4E8kvPnNLANz7kS): test runs 16, module lines 2792
