# project-roster (T50)

**Status** · session_01CRP1uirZ6T4GoDiyhrh3i8 · depth 2 · COMPLETE · handled B5

## J1 · QUESTION

R33's `since` (the instant the last owner stopped being active) has no source in membership's stated contract.

What I found: membership R120 lists `members (member_id, handle, status)` only; R58 records the actor of a status write, not its instant. The one instant a status write leaves is `members.updated`, which every status write stamps (index.mjs 1966, 2477, 2480) but so do capability and pairing writes, so it can move after the owner stopped being active. membership R127 gives `since` for joins only.

My best reading, which I build now unless told otherwise: R33's `since` = the latest `members.updated` among the owners, read through one private method in project-roster, flagged in my record as an interim read outside R120 (P5), because it passes R33's test (two owners revoked at two instants answers the later) and is exact unless a later non-status write touches a revoked owner.

My recommendation: membership adds a recorded status instant (a `status_at` column in R120, or a `memberStatusSince(memberId)` service), and I swap my one method to it. That is a membership change for BOB to fold; tell me if it lands in T50 and I will merge it.

Not blocking: I carry on with R1, R8, R9, R18, R30–R32 meanwhile.

## J2 · REPORT

Found outside project-roster:

1. N1118, the confirm: `projectlist` does NOT answer a row `participation` (`joined`/`invited`). R26–R28 give each row `{id, name, stage, owner, members, activity, lastChange}`; `members` carries `{member, handle}` with no state. screens-daily R29 ("invited, as projectlist's participation state answers") therefore has nothing to read. Fix is a requirement line in project-roster (a `participation` on each row, the viewer's own: `joined`, `leaving`, `invited`, or `null` for an administrator who is no participant). Fold it and send a CHANGE; I will build it.
2. Words: `words.json` holds no `refusal.MACHINE_CANNOT_SET_STAKE` (R31 names it). Its row (C-147.9) reads `translation: null` until the design lane gives it a word; no English is inline. `refusal.STAKE_MALFORMED` exists but is worded for the administrator's group stake (instance-setup R77), not a project's: the design lane may want a project-specific sentence.
3. New reds that are consequences of the three new ops (declared and graded in L11): plane `test/m/plane/roster.test.mjs` "R5, R9, R45 ... project-roster's whole ops map" (hand-lists the ops; should read the owner's declaration, plan rule 6) and op-declarations `t45.test.mjs` "R49, R6 ... every op ... has a spec" (projectstakeset has no spec). Both clear when T50-24/T50-18 declare `projectstakeset`, `projectstake`, `projectownersgone`. op-grades R42's MARKS test is red in base already.
4. The plane bundle and `program.mjs` are stale from these changes (project-roster is bundled into the plane): regenerate at layer close.

## J3 · COMPLETE

Entries applied (T50-3), all in project-roster: R1 (`joined_at` from membership R127's `since`; `owner_since` from the latest add/rescue decision, else `joined_at` for a founding owner; both always present, null where not recorded or a non-owner); R8 (`set_by` by handle, founder by `founderHandle()`); R9 (the founder's viewer, bare `admin` or `member:admin`, is answered with the empty list); R18 (`project_stakes` declared keyed by project); R30 (votes ordered by `MIN(created), MIN(rowid)`, and votes/decisions/stake instants now come from the host clock, so a fixed clock gives a stable order); R31 `projectStakeSet` (`op=projectstakeset`), R32 `projectStake` and `projectStakeHistory` (`op=projectstake`), rows C-147.9 MACHINE_CANNOT_SET_STAKE and C-147.10 STAKE_MALFORMED; R33 `projectOwnersGone` (`op=projectownersgone`), `since` = latest `membership.memberStatusSince` over the owners (R152, K3624), null when absent, so it answers `since: null` until membership merges. Rule 6: every refusal row's translation and R8's note read `word(key)` by key; `PROJECT_SCOPE_WORDS` and the tests comparing English are gone.

Deferred: none. Waiting on BOB's CHANGE when membership R152 merges: my R33 test uses a stand-in `memberStatusSince` (over `members.updated`) only while membership lacks the real one; with it merged, run the module's tests again.

Found in other modules: see my REPORT (J2): projectlist has no `participation` (N1118); `refusal.MACHINE_CANNOT_SET_STAKE` not in words.json; the plane roster test and op-declarations t45 go red until L11 declares the three ops; the plane bundle is stale.

Tests and checks (from /home/user/bio; checks from civicos-process):
- `node --test bio-plane/test/m/project-roster/`: 76 pass, 0 fail (new: stake-gone.test.mjs; R1, R8, R9, R30, R18, R25 extended).
- Users' tests (membership, promotion, plane, answer-envelope, record-core, action-holds, screens-daily, screens-inquiry, op-declarations, op-grades, admission, control-plane): no failure that tranche/T50 does not already show, except the two named in my REPORT.
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; coverage: 0 failures for project-roster (the 8 other modules' failures are theirs).
- `node checks/ownership.mjs /home/user/bio project-roster tranche/T50`: 0 failures.

Size (session_01CRP1uirZ6T4GoDiyhrh3i8): test runs 8, module lines 1505

## J4 · COMPLETE

Re B3: R34 built. `projectList` rows carry `participation` (`joined`/`leaving`/`invited`, the viewer's own; `null` for an administrator or founder who is no participant and for a machine credential). Test names R34 with its control; the R26 key-set test now lists `participation`. Merged tranche/T50 @ 4bc2207af1.

Tests: project-roster 77 pass, 0 fail. screens-daily and op-declarations: only the accepted reds (the T45 owner-map spec test for the three new ops, and the registry/screen-act reds already in base). checks: format 0, architecture 0, ownership 0, coverage 0 for project-roster. C-147.9 translation stays null (HANDOFF B267). R33 still `since: null` until membership R152 merges; waiting for your CHANGE.

Size (session_01CRP1uirZ6T4GoDiyhrh3i8): test runs 11, module lines 1514
