# installer (T22)

**Status** · session_01S7x1dcbj37rZYwSbM8WjVn · depth 2 · WORKING · handled B3

## J1 · QUESTION

Q (R33's reach, as your START asks). My best reading: R33's "the uploaded script" is the plane's script only: Distribution §5 puts "byte-verified on read-back" on the `install` step (the plane) and gives `fleet` its own check (each member's bundle and parts fetched and hashed against the signed statement before upload, R11). So I read back the plane after every plane upload (the install PUT or its no-SELF retry, the step-3 re-PUT, the update PUT), compare its SHA-256 with the release's bytes, and name a mismatch, or a read-back that cannot be read, as a lag in R15's list (no success claimed, credentials still handed over). `uploadMember` is not read back. I am building on this reading now; say if R33 should reach the members.

Two consequences I record, no answer needed unless you disagree: (a) under R32 an install never meets a bucket or a member already present, so R7's "already exists counts" and R10/R12's "the members the account already holds" are reachable on the install path only by a race between the check and the act (and on the update); I keep the code and test R7's arm as that race in the fake account, and move R10/R12's "already present" arms to the update path. (b) R32's lookups that fail for any reason other than "not found" refuse the install (as R5 refuses a failed lookup): an absence not established is not established. The members checked are instance-setup's FLEET_BINDINGS, then any further member the chosen release's fleet names, both before the plan probe creates anything.

## J2 · REPORT

REPORT, progress and a generated artifact staled.

(1) Stale artifact (F2): my source change (21f50dd0fc, pushed) stales `newgroup/dist/newgroup.bundled.mjs`, mine; `bio-plane/test/system/newgroup-bundle-fresh.test.mjs` is red from it until you regenerate at L11's close. I regenerate nothing.

(2) Done and pushed on `job/T22/installer` @ 21f50dd0fc: R32 (A24) and R33 (A25), on the reading in J1; the todos :853 and :854 are now `R32 …` and `R33 …` tests against the stateful fake account, each with its negative control; N469/N471/N480 scan: `newgroup/src/index.mjs` named the deleted `bio-plane/src/index.mjs` as the OPS row's home (now op-declarations'), and `wizard.test.mjs` named the retired `bio-plane/test/d116-serving-builds.test.mjs` twice (now instance-setup's `reports.test.mjs`); nothing else in my paths. Runs: `node --test newgroup/test/` 33 pass, 0 fail, 2 todo (R13, R24; baseline 31/0/4); wizard 207/0 (baseline 207/0); `bio-plane/test/m/instance-setup/` 86/86; `bio-plane/test/m` 4954 tests, 4933 pass, 9 fail, 12 todo, the 9 exactly those START accepts by name (queue-producers proposals.test.mjs ×4, control-plane doorbell.test.mjs and catalogue-end.test.mjs, accepted red 4's module-order, t9-notice-sight-bounds and promotion registry). Mutation checks: R32's look answering "none" fails R32 (and R6, R10); a read-back always "matching" fails R33. Checks: format 0, architecture 0, ownership 0; coverage fails on R34 alone (accepted).

(3) R34 (H17) is written and waits only on instance-setup's merge: `successPanel` shows `hostingControlBlock("notice")` from `bio-plane/src/setup-fleet.mjs` in place of the old paragraph, before the hand-over; its test pins the five points, the order, the old paragraph gone, no input and no gating, and that `setupPage` shows the same block. Run against INSTANCE-SETUP's `setup-fleet.mjs` and `setup.mjs` (job branch, uncommitted here): `newgroup/test/` 34/0/2, wizard 207/0. I commit it after your CHANGE announcing that merge, then run the suites again and post COMPLETE.
