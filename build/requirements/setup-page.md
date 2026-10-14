# setup-page — requirements

**Status** · In force: split from `instance-setup` by copy for size (K617, K1851; N622), meaning unchanged: R1–R24 marked "was" and retired there, or, for a page share, re-worded there; R25 a copy of `instance-setup` R31, which stays. Last changed T35 (T35-68: R14, R16, R20 amended; R26–R29 new; K1874, K1881, K1888, K1943); every requirement met (SETUP-PAGE #2, K2054). Last changed T37 (T37-43: R18 and R30 amended; N776, N777; DEC-182 (3), (6); K2159, K2161, K2171); marked not yet met (T37). Last changed T46 (T46-48: R30 amended, the scanner's sentences only while `bootstrap`'s `parts` says a scanner is present, the parts on the healthy panel; R31 new, the session record `SESSION_STORE_KEY`; R32 new, a member lands on `/app` after sign-in, the panel offering "Open your group's Civicsmith" (Bob, K2893: Home); R33 new, the test-instance notice; N897 (1), (2), (4); K2816, K2893, K2960); marked not yet met (T46). Last changed T47 (T47-74: R34 new, amending R30, the parts read from `bootstrap`'s flat `part_signin`, `part_scanner`, `part_safe_view`; N989, K3027); marked not yet met (T47). Retired as a page at T47's L11 fold (T47-74; N1002, K3052; K3100): R1–R34 retired, each naming its new home, its code (`bio-plane/src/setup-page/`) and tests (`bio-plane/test/m/setup-page/`) deleted by T47-74, its id kept in `modules.json` with empty paths until T48 (K3070).

**Size (P6).** About 1,620 lines (`setup.mjs` 1–1636, less the imports the page does not use), leaving `instance-setup` about 2,110; about 2,100–2,450 here after T34's page work.

## Public

### Purpose

The page a group first meets at the root of its Civicsmith: claim, sign-in, enrolment, the healthy panel, the group's settings sections (Places, offices, members and keys, the assistant) and the record browser kept working (K102). Pure: it reads no table, writes nothing and registers nothing; the page drives the plane's public and member ops from the browser, and `instance-setup` composes it (R47's block in R14's slot) and serves it through `control-plane`'s `/` route.

### Provides

**The page and its group line: `pageOf(read)`, `groupLine(read)`, `PAGE_HTML`, `HOSTING_SLOT`, `GROUP_LINE_UNREAD`**
- **R1** *(retired: moved to `screens-entry` R1, T47-74, K3100)*
- **R2** *(retired: moved to `interface-shell` R36, `screens-entry` R6, R7, T47-74, K3100)*
- **R3** *(retired: moved to `screens-entry` R2, R6, R7, T47-74, K3100)*
- **R4** *(retired: moved to `interface-shell` R12, T47-74, K3100)*
- **R5** *(retired, no home: the intake form and bundle history; `capture`, `document` serve intake; doubt 11, T47-74, K3100)*
- **R6** *(retired, no home: the intake form and bundle history; `capture`, `document` serve intake; doubt 11, T47-74, K3100)*
- **R7** *(retired, no home: the intake form and bundle history; `capture`, `document` serve intake; doubt 11, T47-74, K3100)*
- **R8** *(retired: no registry screen; doubt 11, T47-74, K3100)*
- **R9** *(retired, no home: the intake form and bundle history; `capture`, `document` serve intake; doubt 11, T47-74, K3100)*
- **R10** *(retired, no home: the intake form and bundle history; `capture`, `document` serve intake; doubt 11, T47-74, K3100)*
- **R11** *(retired: moved to `screens-intake` R7, T47-74, K3100)*
- **R12** *(retired: moved to `interface-shell` R2, R3, T47-74, K3100)*
- **R13** *(retired: moved to `screens-settings` R19, T47-74, K3100)*

**The claim section** (DEC-109, DEC-134, DEC-136 (1); K1755)
- **R14** *(retired: moved to `screens-entry` R4, R6, T47-74, K3100)*
- **R15** *(retired: moved to `screens-entry` R6, `screens-settings` R18, T47-74, K3100)*
- **R16** *(retired: moved to `screens-entry` R6, `screens-settings` R20, T47-74, K3100)*
- **R17** *(retired: moved to `screens-entry` R6, `screens-settings` R18, T47-74, K3100)*
- **R18** *(retired: moved to `screens-entry` R6, `screens-settings` R1, R2, R4, T47-74, K3100)*

**Places and offices** (DEC-150; N665)
- **R19** *(retired: moved to `screens-entry` R6, `screens-settings` R19, T47-74, K3100)*
- **R20** *(retired: moved to `screens-entry` R6, `screens-settings` R19, T47-74, K3100)*

**The words members see** (DEC-149; N664)
- **R21** *(retired: moved to the screens' words, T47-74, K3100)*

**A member's language** (DEC-127 (1); N668)
- **R22** *(retired: moved to `screens-entry` R7, T47-74, K3100)*

**The assistant on the page** (DEC-152; N667; K1755)
- **R23** *(retired: moved to `screens-settings` R14, T47-74, K3100)*
- **R24** *(retired: moved to `screens-entry` R6, `screens-settings` R1, R2, R4, T47-74, K3100)*

**The session, the operator token, the page policy and recovery codes** (T35; F1, F10, F17, K1874, K1881; K1888)
- **R26** *(retired: moved to `interface-shell` R2, R3, T47-74, K3100)*
- **R27** *(retired: moved to `screens-entry` R4, R6, T47-74, K3100)*
- **R28** *(retired: moved to `interface-shell` R2, R3, T47-74, K3100)*
- **R29** *(retired: moved to `screens-entry` R6, `screens-settings` R20, T47-74, K3100)*

**The security tools step** (N714, its share; DEC-169 (6), (7); K1929 (1), K1939, K1949; K2063 (8))
- **R30** *(retired: moved to `screens-entry` R6, `screens-settings` R15, T47-74, K3100)*

- **R34** *(retired: moved to `screens-entry` R6, `screens-settings` R15, T47-74, K3100)*

**The session record, where a member lands, and a test instance** (T46; N897 (1), (2); `build/plan/draft-T46-interface.md` §5 I4, §7 Q1; `build/plan/draft-T46-trial.md` §1.2)
- **R31** *(retired: moved to `interface-shell` R32, T47-74, K3100)*
- **R32** *(retired, T47-74, K3100)*
- **R33** *(retired: moved to `interface-shell` R36, T47-74, K3100)*

## Private

### Uses

- `record-grammar`: `STATES`, `HEADINGS` and `deriveInquiryTitle` (embedded by its `toString()`; R5).
- `action-grammar`: `RISK_TIERS`, `riskTierState` (its R1; R5, R7).
- `jurisdictions`: `COUNTERPARTY_LEVELS` (R5).
- For its tests only: `capture` (`INFORMATION_GRAMMAR`; R9), `membership` and `credentials` (R8), `record-core` (the storage shim).
- (T36; K2130, K2152, K2155) `file-safety`: `onOwnServers` and `DEEPER_CHECKS_PER_MONTH` (R30's rule for `routine` and the monthly limit's default), injected into the page as `riskTierState` is, never copied; and for its tests, R30's ops in their documented shapes. `credentials`: `aikeepaway`, `aikeepawaystate` (R18, R24).

### Invariants

- **R25** *(retired: moved to `screens-entry` R10, T47-74, K3100)*

### Satisfies

- `docs/architecture/BIO_Membership_Architecture_v2.md` §4.1 (a group of one: the founder claims), as `instance-setup` satisfies it for the page.
- `docs/architecture/BIO_Publication_v0_1.md` §7 points 1–3, the page's share (R1).
- DEC-109 (R14), DEC-122 (3) (R12), DEC-133 (6) (R2), DEC-134 (R15, R16), DEC-136 (1) (R17), DEC-149 (R21), DEC-150 (R19, R20), DEC-127 (1) (R22), DEC-152 (R23); U77 (R3); K1755 (R18).
- (T35) `plan/draft-T35-security-review.md` F1 (K1874: no credential in an address, the setup page's download link included): R26; F10 with Q6 (K1874: DEC-2 not reopened; a plain-steps rotation guide): R14, R27; F17 (K1881): R28. K1888 (two administrators with recovery codes): R16, R29. N699 (K1867): R20. `BIO_Membership_Architecture_v2.md` §4.6 (rotation as half of recovery): R27.

### Suggestions

- **The copy (K624 (1), K1851).** This module's job copies `setup.mjs` 1–1636 (the page's header, the three imports it uses, the injected constants, `groupLine`, `setupPage` as `pageOf`, and the template as `PAGE_HTML`) into `bio-plane/src/setup-page/index.mjs`, replacing `${hostingControlBlock("notice")}` with the slot `HOSTING_SLOT` (`<!--hosting-control-->`), and the page's tests the seam read §5 lists into `test/m/setup-page/`, re-labelled with these ids, none importing `setup.mjs` or `instance-setup`'s fixture (check 1). It merges right after `queue` and before `instance-setup`. In production nothing imports it until `instance-setup`'s job (T34-57) deletes its copy, composes `SETUP_HTML = PAGE_HTML.replace(HOSTING_SLOT, () => hostingControlBlock("notice"))` and re-exports.
- **T35 (T35-68).** The download (R26) may instead use a single-use, short-lived download id minted by a POST under the header; that needs an op of `op-declarations`' and a route of `control-plane`'s, so the Blob is the draft's pick. R28's slot may be any marker the door replaces; the door's half is `answer-envelope` R6 (as amended). R29's file is made in the browser (no request); its name carries no code. The page's tests drive `op=recoverycodesissue`, `op=recoverycodesstate`, `op=adminrecoverystep`, `op=entitieskind` and `op=memberadd` over the fake plane in their documented shapes.
- **Tests.** The page's new arms (R2's `#join=`, R15–R20, R22, R23) run over the page shim with a fake plane answering the ops' documented shapes; end-to-end arms over the real ops may follow in `instance-setup`'s job.

## Decided by BOB (for rulings)

1. The page is this module's; R47's block stays `instance-setup`'s (the leaf the installer imports) and is placed in R14's slot when `instance-setup` composes the page (K1851).
2. The `/` route stays `control-plane`'s, calling `instance-setup`'s `setupPage`, which re-exports this module's page.

## Open for Bob

None.
