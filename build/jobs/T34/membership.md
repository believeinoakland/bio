# membership (T34)

**Status** · session_013oog9T5wYYdqJUkL3yXGbJ · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Readings I am building on (T34-10); none blocks me. Correct any and I bring the work in line.

1. **Rows.** New codes take the next free numbers of C-96 (this module's family for acts on a member's row and the custodial acts): C-96.22 `LAST_ADMIN`, .23 `BAD_EXPIRY`, .24 `NO_UNUSED_INVITATION`, .25 `WEBSITE_KEY_EXISTS`, .26 `BAD_DAILY_CAP`, .27 `NO_WEBSITE_KEY`, .28 `WEBSITE_KEY_UNKNOWN`, .29 `WEBSITE_DAILY_CAP`, .30 `JOIN_LINK_ON`, .31 `JOIN_LINK_OFF`, .32 `NO_SUCH_JOIN_LINK`, .33 `JOIN_LINK_DAILY_CAP`, .34 `COURT_NOTICE_UNKNOWN_CHOICE`, .35 `GROUP_KIND_UNKNOWN`, .36 `GROUP_KIND_OTHER_EMPTY`, .37 `GROUP_DESCRIPTION_TOO_LONG`, .38 `GROUP_VISIBILITY_UNKNOWN`. C-96.19–.21 are credentials'; **credentials' T34 job should take C-96.39 onward** if it adds C-96 rows (it merges after me). C-96.5 `ADMINS_FIRST` and C-96.10 `RESIGN_AT_TWO` leave `CUSTODIAL_CHECKS` (retired, never reused). `BAD_CAPABILITY` keeps no row (R9's precedent, the C-96 header's list); R99/R102 answer it through R9's one judgment.
2. **Daily cap (R101, R104).** Counted per door id: a key's own invitations (`invited_by = website:<keyId>`) and a link's own (`join-link:<linkId>`), each in the 24 hours before the call. `joinLinkReplace` mints a new `linkId` (a new link), so its count starts at zero; a replacement is an administrator's act.
3. **R6's expiry.** A proposed administrator's `expiresInDays`, judged at `memberAdd` (R12's `BAD_EXPIRY`), is kept on the proposal and applied when the last endorsement makes the invitation; 7 when none was given.
4. **R98, R99–R104, R107, R109 admit** exactly R64's administrators (the founder once claimed, an active `admin`); a machine credential is refused `NOT_AN_ADMIN` there (R12's machine-credential admission is R12's own, R84's last sentence).
5. **Invitation state (R105)** for an administrator's roster: `withdrawn` (R98, or a member revoked by R20 before enrolling), `spent` (enrolled), `expired`/`live` (an unspent invitation by its `expires`); a proposed administrator has none (`null`, `expires` null). Fields: `door`, `approvedBy`, `expires`, `invitation`.
6. **R109 `kinds`** must be an array (an absent `kinds` is `GROUP_KIND_UNKNOWN`, as worded); duplicates are kept once, in the order given.
7. **R110's founder** is the viewer `admin` or `member:admin` once the instance is claimed (R94); a machine credential is any viewer R43 reads as a machine class.
8. **Ops.** The new services join `membershipOps` (stamps from the query, secrets and texts from the body): `invitewithdraw`, `websitekeycreate`, `websitekeyset`, `websitekeyrevoke`, `websiteinvite`, `joinlinkenable`, `joinlinkset`, `joinlinkreplace`, `joinlinkoff`, `joinlinkinvite`, `checkaddressees`, `courtnoticeset`, `courtnotice`, `groupdescriptionset`, `groupdescription`. Declaring and routing them is `op-declarations`', `admission`'s and `control-plane`'s (I will REPORT it).

## J2 · REPORT

What other modules must change because of T34-10 (none of it done by me, P7):

1. **op-declarations, admission, control-plane (L11).** Fifteen new ops in `membershipOps`: `invitewithdraw`, `websitekeycreate`, `websitekeyset`, `websitekeyrevoke`, `joinlinkenable`, `joinlinkset`, `joinlinkreplace`, `joinlinkoff`, `courtnoticeset`, `groupdescriptionset` (administrators; `by` stamped), `websiteinvite` and `joinlinkinvite` (the doors: no session; the secret and cover in the body; admission routes them, R101, R104), `checkaddressees` (`target`, `label`; tasks' read), `courtnotice` (read), `groupdescription` (`viewer` stamped; answers the public too, R110). None is declared yet, so none is reachable through the plane.
2. **control-plane R43 (already a named red, K1708).** `test/m/control-plane/rows-before-r43.json` still holds `ADMINS_FIRST` (C-96.5) and `RESIGN_AT_TWO` (C-96.10), retired by DEC-134 (R10, R12): `catalogue-end.test.mjs` now first fails `ADMINS_FIRST lost its row`. The snapshot drops both codes.
3. **promotion (T34-12) stamps**: arrived C-96.22–C-96.38 (seventeen rows, listed in my COMPLETE); departed C-96.5 `ADMINS_FIRST`, C-96.10 `RESIGN_AT_TWO`.
4. **instance-setup (T34-57)**: `memberAdd` no longer answers `hostingAccess` (R11): setup asks R11's record and R107's choice itself.
5. **Comments in other modules' tests** still say a group's second member must be an administrator (`mk6-bundle-names-no-author`, `stats-disclosure`, `d526-refusal-order`, `civicos-ui/test/review-copy`); `scheduler/plane.test.mjs:218` handles `ADMINS_FIRST` conditionally. All still pass; the wording is stale (DEC-134).
6. **Generated artifact**: `bio-plane/dist/bio-plane.bundled.mjs` is stale by my change (it was already stale on `tranche/T34`; `fleetbundles` red on both). BOB regenerates at the layer close (mechanics §14).
7. **A read the admin screens will want, not built (no requirement):** the live website key's and join link's settings and their history without the secrets. Today only the acts' answers carry them. A requirement for it would serve the UX stream's key/link screens and admission.

## J3 · COMPLETE

T34-10 applied whole, on J1's readings (accepted, B2/K1749).

**Entries applied.** (N556, DEC-134) `ADMINS_FIRST` retired (R12), an ordinary member invited with one administrator (R13); resignation refused only for the last administrator, `LAST_ADMIN` (R10); `memberAdd` asks nothing about hosting access (R11). (N552, DEC-133) invitation expiry, 7 days default, 1–30 chosen, an expired one answering as a spent one (R97, R6, R13); `inviteWithdraw` (R98); the website key `websiteKeyCreate`/`Set`/`Revoke` and `websiteInvite` (R99–R101); the join link `joinLinkEnable`/`Set`/`Replace`/`Off` and `joinLinkInvite` (R102–R104); doors make ordinary members only, roster fields `door`, `approvedBy`, `expires`, `invitation` for administrators only (R105). (N557, DEC-135) `checkAddressees` (R106). (N558, DEC-136) `courtNoticeSet`/`courtNotice`, nothing preselected (R107); `courtStatement` at enrolment while `tell` (R108). (N551, DEC-132) `groupDescriptionSet`/`groupDescription`, members by default, the public's four texts only while public (R109, R110). R84's callers extended; R111: three new tables declared exempt, secrets held only as hashes. Fifteen ops added to `membershipOps` (J2).

**New check rows, awaiting stamp (promotion, T34-12):** C-96.22 LAST_ADMIN, C-96.23 BAD_EXPIRY, C-96.24 NO_UNUSED_INVITATION, C-96.25 WEBSITE_KEY_EXISTS, C-96.26 BAD_DAILY_CAP, C-96.27 NO_WEBSITE_KEY, C-96.28 WEBSITE_KEY_UNKNOWN, C-96.29 WEBSITE_DAILY_CAP, C-96.30 JOIN_LINK_ON, C-96.31 JOIN_LINK_OFF, C-96.32 NO_SUCH_JOIN_LINK, C-96.33 JOIN_LINK_DAILY_CAP, C-96.34 COURT_NOTICE_UNKNOWN_CHOICE, C-96.35 GROUP_KIND_UNKNOWN, C-96.36 GROUP_KIND_OTHER_EMPTY, C-96.37 GROUP_DESCRIPTION_TOO_LONG, C-96.38 GROUP_VISIBILITY_UNKNOWN. Departed, awaiting stamp: C-96.5 ADMINS_FIRST, C-96.10 RESIGN_AT_TWO (retired, never reused).

**Size (P6).** The module is 3,966 lines (`index.mjs` 3,198, `checks.mjs` 484, `schema.mjs` 284): under ~4,000, kept whole. It is close: the natural seam before its next job is the group's settings (R107, R109, R110: `courtNotice*`, `groupDescription*`, tables `court_notice`, `group_description`, about 180 lines with their rows), and next the two doors (R99–R105, about 330).

**Deferred.** Nothing of T34-10. Not built because no requirement asks it: a read of the doors' live settings and history (J2 item 7).

**Found in other modules** (J2): L11's op declarations and routing for the 15 ops; control-plane's `rows-before-r43.json` still holds the two retired codes (its R43, already a named red); promotion's stamp; instance-setup asks R11 and R107 itself; stale DEC-134 comments in four other suites; the plane bundle stale (already stale on the tranche).

**Tests.** `node --test test/m/membership/*.test.mjs`: 162 pass, 0 fail (141 before; two new files `t34-joining.test.mjs`, `t34-settings.test.mjs`; R10, R11, R12, R59 tests amended). `node test/members.test.mjs`: 96 pass, 0 fail (its `ADMINS_FIRST` pin re-pointed to R97's `BAD_EXPIRY`, corrected not exempted). Every module that uses membership: `node --test "test/m/**/*.test.mjs"`: 7,153 pass, 43 fail; the same 43 tests, by name, fail on `tranche/T34` without my change (inherited reds: reading-pipeline, extraction, capture-requests, record-core t33, calculations, workbooks, events, entities, following, monitoring, scheduler, run-productions, control-plane R43, acquisition). `test/system/row-census.test.mjs` and `fleetbundles.test.mjs`: red on the tranche before me; my rows are the ones named above. No layer tests (manifest).

**Checks.** format: 126 modules, 125 requirements files; 0 failures. architecture: 25 product files, 66 relative imports; 0 failures. coverage: 94 of 94 live requirement ids named by a test; 0 failures. ownership: 10 files changed between tranche/T34 and HEAD; 0 failures.

Size (session_013oog9T5wYYdqJUkL3yXGbJ): test runs 14, module lines 3966
