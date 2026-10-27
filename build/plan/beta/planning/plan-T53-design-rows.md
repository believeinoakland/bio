# T53's entries from the design rows DEC-479 to DEC-483 (PLANNING L42)

**Status** · READY (L56) · Placed; its three points decided by BOB #324 (L42: the swap, reading-pipeline, case-disclosures; K5564) · PLANNING #4, 2026-10-27. The owed work of DEC-479 to DEC-483 (UX-DESIGN U512-U516, on `claude/gallant-brown-zg0wc1` at d5d75136, not yet on `tranche/T53`), one entry per owning module, beside `plan-T53-draft.md` (which is near its cap). Each module's START carries its rows here verbatim with the DEC row (L37 R1, R3). Every point marked BOB's is lower-level (P17): owner, order, op names.

## Before R1

- **The merge.** U512-U518 merge together (U517 DEC-484, a53db53de0, and U518 DEC-485, 70e72c0d50: Members for K5562, K5563, K5568; their owed is `lines-K5562-K5563-founder.md`'s) (DEC-481 and DEC-483 sit on U512-U515's commits) before R1 or with the first job of layer 3: DEC-479 turns screens-publish's R10 test red until the Inbox draws "Show it safely", so the merge comes with `doorbell`'s `inboxview` and screens-publish's Inbox in the same R1 (BOB's). Plan Before R1 (10).
- **Order within layer 3 (BOB's, P4).** DEC-479 puts `file-safety` in `doorbell`'s uses, but `doorbell` (49) is before `file-safety` (50) in `modules.json`. `file-safety` does not use `doorbell`, and every user of `doorbell` (`sources` 51 and later) stays after both, so the two are swapped (file-safety 49, doorbell 50), member-roster R27's `MODULE_ORDER` re-pinned in the same act (decided, BOB #324).
- **DEC-482** is docs only: BOB regenerates the case-checker bundle with the words.

## Layer 3

**doorbell** (after file-safety, as above)
- T53 · DEC-479 (45) · `inboxview`, a member-only read of a knock before it is moved into the record: the knock's bytes hashed against its digest, through file-safety's scan, answering only what the scan allows (the same safe view a document has: pages as pictures or a sheet's figures, the first 500 pages, "a view, not a reading"); moves nothing into the record; Reversible, no reason asked; refusals for a password-locked file, a kind with no safe view yet, and stored bytes that no longer match the knock's fingerprint · DEC-479; DOORBELL #5's record (`build/jobs/` as BOB names) `[owed: the requirement line, BOB writes]`

## Layer 4

**reading-pipeline** (decided, BOB #324: the per-character measure lives in text-chain, layer 1; reading-pipeline produces the reading)
- T53 · DEC-479 (51) · a count of the words below the reader's own measured clarity on a reading, with their positions; only where the reader measured it (never a model's opinion of itself, `TEXT_CONFIDENCE_PSEUDO`) · DEC-479

**extraction** (op declarations)
- T53 · DEC-479 (61) · `readheld` ("Read it now") weighs Reversible and asks no reason (`act.readheld.does`) · DEC-479

## Layer 6

**inquiry**
- T53 · DEC-481 · each subject change answered with its date, member, old and new subject, part and reason (A1's `subjectHistory`, `planning/lines-A1-A7-subject-pickers.md` A1-R2) · DEC-481

## Layer 8

**case-disclosures** (decided, BOB #324)
- T53 · DEC-480 (K5534) · the per-name mark on a forwarded email's names (From, To, Cc), `mailnameshow` (Reasoned: "Why this name is material") and `mailnamewithhold` (Reversible), held on the case with reason and member; the published copy built from it, each unmarked name withheld (`screen.ceremony.emails.withheld`), no address and no technical header; a change after preparing asks the case to be prepared again; an unchecked email never stops signing · DEC-480; `capabilities/N824-email-capture.md` (K5534)

**public-read**
- T53 · DEC-481 · `screen.published.subjectchanged.*`, the form chosen by whether the new subject may be named (A1-R7) · DEC-481; `planning/lines-A1-A7-subject-pickers.md` A1-R7

## Layer 11

**screens-publish**
- T53 · DEC-479 (25), (45) · the Inbox's "Show it safely" before "Move into the record" and its refusals (`file-safety.index.the_file_is_encrypted_so_no_safe_view`, `screen.inbox.view.nokind`, `.changed`) under "When it cannot be shown safely"; the doorbell's receipt reordered under `screen.doorbell.after.head`, the sample receipt folded, the court line alone · DEC-479 · `after doorbell's inboxview` (its R10 test red until drawn)
- T53 · DEC-480 · the ceremony's "Emails in this case" section, a row per name, and "As it will be published" · DEC-480

**screens-document**
- T53 · DEC-479 (51) · `screen.document.text.unsure` and the dotted marks with their card · DEC-479

**screens-inquiry**
- T53 · DEC-481 · "Who it is about" and the team's notes of each change · DEC-481

**screens-settings**
- T53 · DEC-483 · the stale-link entry in `plan-T53-draft.md` draws `screen.members.invite.nolink` with `awaiting`'s names · DEC-483
