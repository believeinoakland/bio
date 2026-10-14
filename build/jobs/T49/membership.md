# membership (T49)

**Status** · session_01195GX87EMHUXKVysBHVQkZ · depth 2 · WORKING · handled B1

## Completion (T49-1)

**Read, whole:** `build/requirements/membership.md` (public and private), the plan's T49-1 entry, rules 2–6 and the opening act, `build/layers.md`' layer 2 contract, BOB's `B1`, the N1072 draft's membership section; the module's code (`index.mjs` 3,070 lines, `schema.mjs`, `checks.mjs`); `module-order.test.mjs`, `t47-admin-handle.test.mjs`, `t46-handles-doors.test.mjs`, `t47-r142.test.mjs`, `fixture.mjs` and the `t35-words`/`requests-fence-facts` assertions I changed. The other membership tests were run, not read (plan rule 2, K3271). Module size at START: 3,823 lines, under the ~4,000 bound (P6); now 3,903.

**Entries applied**
- **R144** `founderHandleSet({handle, by})` (in-plane and `op=founderhandleset`; `by` the stamp from the query, never the body), `founderHandle()`, the founder's handle taken for R16 and R123 (also kept out of R123's suggestions), `sessionRights("admin").handle`. New table `founder_handle` (one row, exempt from purge). Refusals in R144's order: `FOUNDER_HANDLE_NOT_FOUNDER` (new row **C-96.54**, BOB's draft words), `HANDLE_FIXED` (C-96.52), then R16's `NO_HANDLE`, `BAD_HANDLE`, `HANDLE_TAKEN`, through one shared judgment (`#handleRefusal`) that `enroll` now uses too (its answers byte-identical). `HANDLE_FIXED` is minted at one site (`#handleFixed`, its row's `where` re-pointed).
- **R141** re-worded: `admin` is an id only; `enroll`, `handleCheck` and `founderHandleSet` refuse it before and after her handle is held. `ROOT_ADMIN` is named in a test (N1067).
- **R145** `MODULE_ORDER` gains `op-capabilities` (before `op-declarations`) and `site` (after `installer`), tolerated by name until built. `module-order.test.mjs` now reads every module's place from `modules.json` (N1073); the only names it holds are its tolerated ones (`ai-accounts`, `op-capabilities`, `site`).
- **R77** (reading R144 into it): a hidden project's existence answer names the founder-owner by her handle once she holds one, never `admin` (null while none). Not a new requirement id; BOB may confirm.
- **Plan rule 6:** (N1075) `HANDLE_FIXED`, `NO_SUCH_JOIN_LINK` and `JOIN_LINK_DAILY_CAP` now read `words.json` by key (`REFUSAL_WORDS`), their inline copies dropped; **`NO_COVER` kept inline on purpose**: `words.json`'s sentence addresses the joiner ("the name the group will know you by") and C-96.3 is also minted at `memberAdd`, where an administrator names someone else, so it would be false there. (N1068) no member-facing "labelled" in the module (only the region name `is-expertise-labelled`, not a word a member reads). (N1073) done as above. (D29) no answer of `ok: true` carries a refusal. (N1072 doubt 7) the `admin` grep, below.

**Deferred, with why**
- R144's last test clause, "the R132 census holds with the founder's handle in the store" (`test/members.test.mjs`): the plane answers `UNKNOWN_OP` for `founderhandleset` until control-plane routes it (T49-29/30), so the fixture cannot put a handle in the store yet. I tried it. After T49-29/30 the fixture needs one step: after the claim, `POST op=founderhandleset` under the founder's session. Nothing in the membership code changes.

**The `admin` grep (N1072 doubt 7): where the founder's id reaches a reader.** None fixed; R144 says no stamp, viewer, author or participation row changes. Readers that print the stamped id `admin`: `memberList` rows' `status_by` and `invited_by`; `memberAdd`'s `invited_by`; `hostingAccess` `recorded_by`; `joinDoors` history `by`; `courtNotice` and `groupDescription` histories `by`; `expertiseList` `by` and history `actor`; `inviteWithdraw` and `memberSet` `by`; `adminEndorse` and `adminRemove` `have`, `awaiting`, `endorsedBy`, `deciders`; `activeAdmins()` and `projectOwners()` (ids, R86, R65); the `MEMBER_ID_RESERVED` text and the audit finding name the id `admin` on purpose (R141). If BOB wants any of these to name her by handle, it needs requirement text; the screens and project-roster (R29) name her by `founderHandle()`.

**Inherited reds seen, not mine:** project-roster R18 (`figures-purge`, T49-2), credentials R74–R77 and project-roster R29, R30 uncovered by tests (their jobs), the plane's op censuses for `founderhandleset` (plan rule 5 (3)).

**Tests and checks**
- `node --test bio-plane/test/m/membership/ bio-plane/test/members.test.mjs`: tests 242, pass 242, fail 0 (new: `t49-founder-handle.test.mjs`, 11 tests naming R144, R141, R77, R115, R16, R129; `module-order.test.mjs` rewritten, R83, R140, R145).
- Users of my services, run: credentials 136/0, ai-accounts 109/0, promotion 137/0, instance-setup 194/0, admission 49/0, store-door 48/0, answer-envelope 40/0 fail; project-roster 54 tests, 1 fail (R18, red before my change too, checked with my work stashed).
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs membership`: 0 failures. `checks/coverage.mjs membership`: 105 of 105 live ids named by a test; 0 failures. `checks/ownership.mjs membership tranche/T49`: 0 failures. `checks/run.mjs`: format 0, architecture 0 (3,342 product files), channels 0; coverage fails only for credentials (R74–R77) and project-roster (R29, R30), not mine.
- Generated artifacts: none of mine staled (the plane bundle and `program.mjs` rebuild at the layer close).

Size (session_01195GX87EMHUXKVysBHVQkZ): test runs 9, module lines 3903
