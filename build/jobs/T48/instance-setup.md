# instance-setup (T48)

**Status** · session_015ApP9xtN4HPUemxYssrhFs · depth 2 · COMPLETE · handled B2

## Completion record (T48-62)

**Read, whole:** `build/requirements/instance-setup.md`; `build/plan/current.md` T48-62 and `build/plan/draft-updates.md`; `build/layers.md` (layer 11 row, the control-plane split, plane); `bio-plane/src/setup.mjs` (3,517 lines at START), `setup-fleet.mjs`, `livefire.mjs`; of the modules I use, only what my entries touch: `ai-accounts` (`aiKeepAwayState`, `aiKeptAway`, `registerDisclosureRead`, `accountReferenceSet`), `signatures` R45–R48 (`verifyReleaseNotice`, `RELEASE_KEYS`, `NS_RELEASE_NOTICE`), `scheduler` R8 (`register`), `membership` (`hostingAccess`, `hostingAccessSet`), `civil-time` (`localDay`, `bounds`); the contracts of `machinery-producers` R11, R12 (merged; its reading of `updateNoticeState()`), `op-grades` R40, `bundler` R32, `installer` R55, `screens-entry` R4 and R6 (to place K3240); the tests that name R47, R53, R54, R55, R63, R65 and R66 (assistant, draft, t41, t47, words, page, recovery, translations). The rest of the suite was run, not read.

**Entries applied**
- **N996 §5:** `assistantState` and `assistantGate` ask `ai-accounts` (`aiKeepAwayState`, `aiKeptAway`) through `deps.aiAccounts`, else `aiAccountsOf(ctx)`; `credentials` stays for `recoveryCodesState` (R66). The disclosure read (`disclosureOf`, `disclosureReadOf`, `DISCLOSURE_READER`) is unchanged in behaviour; its comments now name `ai-accounts` R23 and the plane's T48-78 registration. Test: a `credentials` that throws on any call changes nothing (R53, R55); t47's R54 test now runs over the real `ai-accounts`.
- **R87** `readingLanguage({member, language?})` answers `{ok: true, language, source: "named"|"member"}`; `LANGUAGE_MALFORMED`; `LANGUAGE_NOT_SET` (C-64.31, BOB's words).
- **R88** the `update-check` consumer (key `updatecheck`), the group's random minute of the day (drawn at first start, kept in `update_check_slot`, never from the slug), the governed GET of `RELEASE_NOTICE_ADDRESS` (accept and a fixed user agent only, `redirect: "manual"`, 64 KiB read), `verifyReleaseNotice` against `RELEASE_KEYS`, storage of a newer notice, one `update_checks` row per run, `running_releases` at each start.
- **R89** `updateNotice({viewer})` (`op=updatenotice`) and `updateNoticeState()`; **R90** `updateStart`, `updateLater`, `updateSkip` (`op=updatestart`, `updatelater`, `updateskip`), `UPDATE_NOT_READY` (C-64.32) and `UPDATE_SKIP_NO_REASON` (C-64.33); **R91** the five tables, declared exempt from purge, append-only.
- **K3240 (R47):** `setup-fleet.mjs`: the block's last sentence is a founder's words ("whoever holds it can open the way for your group's Civicsmith to be claimed again"); the deployer's steps are kept apart as `HOSTING_RECOVERY_DEPLOYER`, joined to the block only by `hostingControlBlock(cls, {deployer: true})`; `FORGOT_HELP` is the member-facing `forgot` text (who can help: the group's administrators). The wording of `FORGOT_HELP` is mine, a draft owed to UX-DESIGN.

**Readings I chose (lower-level details; for BOB's `rulings.md`)**
1. `RELEASE_NOTICE_ADDRESS`, `INSTALLER_UPDATE_ADDRESS`: as BOB confirmed in B2 (K3293).
2. A notice that verifies but names the release that runs records `none` (the steady state); one older than the running release records `NOT_NEWER`. A verified notice equal to the one held records `none`; older than the one held, `NOT_NEWER`. Neither is stored.
3. `ready` is the newest notice held when it is newer than the running release and not skipped; an older, unskipped notice does not come back when the newest is skipped (a newer release replaces an unanswered older one, a skip is final). Superseded unanswered releases are listed in `earlier` with `replaced_by`.
4. `viewer_holds` reads `membership.hostingAccess`'s free text: true when it names the viewer by member id or handle as a whole word, false when it does not or none is recorded, `null` when membership cannot answer.
5. A security release set aside by `updatelater` returns at the start of the next local day in the first active profile's zone, UTC when none states one (`zone` is answered).
6. `updateNoticeState().ready` carries `decision` and `decisions` each carry `version`, as `machinery-producers` reads them (B2).
7. The check minute is UTC minute-of-day; the first run is the first occurrence after the draw. The fetch sends no `credentials` or `cache` option (workerd refuses the first), only `method`, `redirect` and `headers`.
8. Test seams in `deps`: `releaseKeys` (default `RELEASE_KEYS`), `drawMinute`, `aiAccounts`.

**Deferred:** none.

**For BOB: changes to the requirements text this job needs** (I may not edit them): R47 (the last sentence, `HOSTING_RECOVERY_DEPLOYER`, `FORGOT_HELP`, the `deployer` option); R87's answer shape; R88's `none` versus `NOT_NEWER` split and the fixed user agent; R89's `earlier_limit`, `earlier_truncated`, `replaced_by`, `ready.decision` in the state read, and the `viewer_holds` reading; R90's zone fallback; the row numbers C-64.31–C-64.33; `Uses` (`ai-accounts`, `signatures`, `civil-time` are already edges in `modules.json`).

**Found in other modules / stale artifacts (REPORT)**
- `screens-entry` (`forgot.mjs`, `words.mjs`): `forgot` still draws `HOSTING_CONTROL` (heading and all sentences) for every visitor; it should draw `FORGOT_HELP` and keep `HOSTING_CONTROL` to the founder's `setup` path. Its R4 text names `HOSTING_CONTROL` for `forgot`.
- `installer` (`newgroup/src/ui.mjs`, `index.mjs`): to keep the deployer's steps on its last screen it must add `HOSTING_RECOVERY_DEPLOYER` after the sentences (or call `hostingControlBlock("notice", {deployer: true})`).
- `plane` (R50, R52, T48-78): register `disclosureReadOf(m)` with `ai-accounts.registerDisclosureRead`; hand `updateNoticeState` to `machinery-producers` as `deps.updateNotice`; call `readingLanguage` from the draft door; join the four new ops to the route map.
- `op-declarations` (R66) and `op-grades` (R40): `updatenotice`, `updatestart`, `updatelater`, `updateskip`; `scheduler` R5: `update-check` registers appended (key `updatecheck`).
- Stale generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` (the plane bundle holds `setup.mjs`); `bio-plane/src/gate.mjs` line 1088 (a comment) names C-64.30 as this module's last row.
- **P6 watch (M-T48-1):** the module is now 4,320 lines across its three files (`setup.mjs` about 4,000, `setup-fleet.mjs` 71, `livefire.mjs` 249): past the line the requirements name for splitting the translation workspace (R67–R75, R87) into its own module.

**Tests and checks** (from `bio-plane`, `node --test test/m/instance-setup/`): `ℹ pass 194, fail 0` (164 before; `t48.test.mjs` adds 30). Also run: `test/m/machinery-producers/` pass 29, fail 0; `test/m/screens-entry/` pass 52, fail 0; `newgroup/test/` pass 60, fail 0. Changed existing tests: the fixture and assistant, t41, t47, recovery and translations tests (keep-away now through `ai-accounts`); exports, group (R30 rows 31–33, whose three drafted translations are 10 words or more where older rows need 20), identity (R9 registers two consumers), page and words (the K3240 sentence). From the process repository: `format: 168 modules, 167 requirements files; 0 failures`; `architecture: 26 product files, 109 relative imports (0 naming no tracked file, not judged); 0 failures`; `coverage: 1 modules, 73 of 73 live requirement ids named by a test; 0 failures`; `ownership: 15 files changed by instance-setup between tranche/T48 and HEAD; 0 failures`. `node checks/run.mjs`: format 0, architecture 0 failures, coverage 21 failures in other modules' ids (none instance-setup's), channels 0.

**B3 (CHANGE, K3297):** already done before it arrived: `assistantGate` and `assistantState` read `ai-accounts` (`#aiAccounts().aiKeptAway()`, `aiKeepAwayState()`); `credentials` is asked for `recoveryCodesState` only. I merged `origin/tranche/T48` (wizard-scripts, op-grades, interface-assets) and re-ran: instance-setup `pass 194, fail 0`; architecture 0 failures; coverage 73 of 73; ownership 0 failures; format 0 failures.

Size (session_015ApP9xtN4HPUemxYssrhFs): test runs 13, module lines 4320

## J1 · QUESTION

R88/R90 name two address constants as BOB's at START, and the START gives neither. My best reading, which I build on unless you answer otherwise: RELEASE_NOTICE_ADDRESS = https://raw.githubusercontent.com/believeinoakland/bio/main/release/NOTICE.json (the same release directory the installer's RELEASE_LATEST already reads, where bundler R32 writes NOTICE.json); INSTALLER_UPDATE_ADDRESS = https://newgroup.believeinoakland.workers.dev/update (the installer's own host; updatestart answers it with ?version=<version>). Both are plain constants of this module, easy to change. Also: this job merged origin/tranche/T48 (signatures is in, verifyReleaseNotice present).

## J2 · COMPLETE

T48-62 applied: N996's re-points to ai-accounts, R87, R88, R89, R90, R91 and K3240's forgot words. instance-setup tests 194 pass, 0 fail (30 new in t48.test.mjs); machinery-producers 29, screens-entry 52, newgroup 60 pass. format, architecture, coverage and ownership: 0 failures for this module. updateNoticeState carries ready.decision and decisions with version, as machinery-producers reads them (B2). The record lists what other modules must do: screens-entry's forgot should draw FORGOT_HELP; installer should add HOSTING_RECOVERY_DEPLOYER; plane registrations; the stale plane bundle. P6 watch: the module is now 4,320 lines. The requirement text changes I need from you are in the record.
