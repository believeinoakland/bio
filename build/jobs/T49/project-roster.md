# project-roster (T49)

**Status** · session_018CGBk9NjLEcazf7iqf4TiN · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

QUESTION (best reading applied; answer only if you read it otherwise). R29 says every `{member, handle}` naming the founder carries `founder: true`, and R30 says members are "named by handle". Several fields are bare handle strings, not `{member, handle}` objects: R6's `deciders` and `handle`, R2's `handle` and `removedBy`, R21/R24's `by`, R30's `target`/`proposed_by`/`agreed`/`awaiting`. My reading: in those string positions the founder is her held handle, or `null` while none is held (never `admin`); `founder: true` rides only on objects that already are `{member, handle}` (R1's participants, R27's owner, R28's members). Not covered by R29's text, left as they were, and they can still hold the id `admin` when the founder is a project owner or carries a rescue: R3/R4's answers (`have`, `awaiting`, `deciders`, `owners`) and R5's answer `by`, plus R23's `projectScope().by`. Say if R29 should reach them.

## J2 · COMPLETE

COMPLETE · T49-2 project-roster, commit dac4d42f61 on job/T49/project-roster.

Entries applied
- R29: the founder named by `membership.founderHandle()` (read defensively: null when membership offers none, or throws), `founder: true` on every `{member, handle}` naming her, `handle: null` while none held. R1's participants (one shared roster read, also R28's `members`; order owners, then handle, the founder after the handles while handleless), R6's deciders, R2's removals, R21/R24's `by` (strings, see J1), R27's `owner`, R28's `members`.
- R30: `projectOwnerVotes({projectId, viewer})` and `op=projectownervotes`, a read: pending add/remove changes with counted votes, `agreed`/`awaiting` as R3/R4 count them (R4's target does not vote at 3+; both vote at 2), rescue rows and stale votes excluded; non-FULL viewers (existence included) get the absent answer; writes nothing, never throws.
- N1098: `figures-purge.test.mjs` R18 reads `MEMBERSHIP_DECLARED_TABLES` (fixes inherited red (C)).
- Plan rule 6: N1075 (the eight C-147 rows already read by key; no other of this module's sentences is keyed in words.json); N1068 ("labelled": none); `admin` grep (code comments only, one stale comment fixed; the reader-facing cases are R29's, plus the ones named in J1); N1073 (the one hand-list, R18's, replaced); D29 (no screen drawn here).

Deferred / found elsewhere
- Not met against REAL membership yet: `founderHandle()` is not in membership until T49-1 merges. The fixture puts a stand-in `founderHandle()` on the membership instance only when membership lacks one, and uses membership's real `founderHandleSet` once it has it. After membership merges, a CHANGE from you re-runs this module's tests unchanged against the real one.
- J1 asks whether R29 reaches R3/R4/R5 answers and R23's `by`.
- For screens (not mine): `screens-daily/project-rows.mjs`:65,68 fall back `handle || member`, so a handleless founder will draw `admin` there; `screens-inquiry/project.mjs`:233-238 draws participants by `x.handle` (null for her). Both are owed the founder-words from the UX stream (D26).
- Inherited red, not mine: screens-inquiry "R5 R14 R15 R16 each screen draws exactly its registry acts" fails identically with my changes stashed.
- Registries to add `projectownervotes` (op-declarations, op-grades, control-plane R98's routing): other modules' jobs.

Reading set: read whole requirements, plan entry, `index.mjs`, `fixture.mjs`, and the tests naming R1/R2/R6/R26/R27/R28 (roster, project-list, project-owner, project-activity, ops, figures-purge, ownership's R6 part); the other tests (requests, scope-approval, sight, t46-words, visibility-directory, ownership beyond R6) were run, not read.

Tests and checks
- `node --test bio-plane/test/m/project-roster/`: tests 64, pass 64, fail 0 (new: founder-handle.test.mjs R29 x5, owner-votes.test.mjs R30 x5). Layer tests: none named. screens-daily 87 pass; screens-inquiry 76 pass, 1 inherited fail (above).
- format: 0 failures. architecture (full run): 0 failures. coverage project-roster: 30 of 30 ids named, 0 failures; `checks/run.mjs` coverage fails only credentials R74-R77 and membership R144-R145 (their jobs). ownership: 10 files, 0 failures.

Size (session_018CGBk9NjLEcazf7iqf4TiN): test runs 14, module lines 1396

## J3 · COMPLETE

COMPLETE (again) · B2 applied (K3332), tranche/T49 merged, commit pushed on job/T49/project-roster.
- R29 now also reaches R3's, R4's and R5's answers: `have`, `awaiting`, `deciders`, `owners`, `by`, `leaving`, the owners a membership refusal names (`active`, `owners`), and the not-the-owner sentence: the founder by her held handle or null, never admin. R23's `by` keeps `admin`.
- Tests: new founder-handle tests (R3/R4/R5 answers, held and none); ownership R5 test now expects `by: null` for the handleless founder. Project-roster: tests 66, pass 66, fail 0. format, architecture, coverage (30 of 30), ownership: 0 failures.
- Still against membership's stand-in `founderHandle()` until membership merges; awaiting your CHANGE.
Size (session_018CGBk9NjLEcazf7iqf4TiN): test runs 18, module lines 1411
