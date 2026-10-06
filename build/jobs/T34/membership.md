# membership (T34)

**Status** · session_013oog9T5wYYdqJUkL3yXGbJ · depth 2 · WORKING · handled B2

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
