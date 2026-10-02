# control-plane (T23)

**Status** · session_01FGx9TWWD64HqdD22yjYnDN · depth 2 · WAITING ON BOB (J1) · handled B2

## J1 · REPORT

Built and pushed (e1a95e2860). I am waiting for your CHANGEs announcing the affordances and op-declarations merges, as B1 says; then I merge `tranche/T23`, re-run, and post COMPLETE.

**(2) R36 is met.** Capture's N499 did not clear red 9 by itself. The door still called `pullKnock`. A reasoned `pulled` resolve now goes through capture's `inboxResolve` with `at` and `within` (`pull.mjs`). So the reason lands on the knock's row inside the pull, in one act with its promotion. Capture's own refusals come first, in its order. A direct `op=inboxpull` still uses `pullKnock` and takes no reason. `inbox-door.test.mjs` :81 is green, and so are its neighbours (:34, :58, :89, :105). You can strike R36's mark.

**(1) R45 is built.** It is green against a scratch copy of op-declarations' R10 specs. I reverted the copy and never committed it. Without the real specs, the five R45 tests in the new `r45-routes.test.mjs` are red with `unknown op`. They should turn green when op-declarations merges. My readings, for op-declarations to match:
- **Stamps.** The door sets these by op name, whatever act lists op-declarations uses:
  - `viewer` on `escalationreasondraft`, `whatchangedpropose`, `whatchangeddrafts`, `sweeps`, and every op in network-notices' own ops map.
  - On `whatchangedpropose`, the proposer's label, set as both `proposedBy` and `author`, because case-authoring's map reads `proposedBy` from `author`. The label is the session's member, `class:<cls>`, or `class:ai/<tokenId>`.
  - On `noticeprepare` and `noticepost`, `by` is the positional identity (`member:<id>`, the founder's `member:admin`), because network-notices asks membership of that form.
- **The public reads.** The door serves `activitymethod`, `noticespublic` and `groupkeyspublic` by their own names, through public-read's `publicReadDoorRead`, from `bio`, before plane's public hook. No credential is read. `store=scratch` is refused `NAMESPACE_PINNED`. So plane does not need to pass `helpers.publicReads`, and op-declarations needs each name with `classes: null`. `op=publicread&name=` stays plane's arm through `publicReadDoorOp`.
- **Who may call.** I assume the notice ops have `machineClasses: []`, and `whatchangedpropose` and `noticepost` have `NEEDS` `contribute`, per R10. The tests assert the `machineClasses` and the refusals.
- **Also in this job:**
  - R22: `CHECK_FAMILIES` reads `NETWORK_NOTICE_CHECKS` (C-127). `families.test.mjs`:47 is green.
  - R27: `notices` is in `PROJECT_NAMING_READS`, so a project seen only at existence answers C-70.1, as REC-196 rules. `whatchangeddrafts` and `directorysubmission` are classified as naming a case.
  - The R2 sweep in `declarations.test.mjs` now counts a public read answered at the store's `publicread`.

**For you or other modules.**
- `directorysubmission` (network-notices R23) is in network-notices' ops map, but R45 and op-declarations R10 do not name it. If op-declarations declares it, the door already stamps its `viewer`. (?: whether it is declared, and whether R45 should name it.)
- network-notices' `noticeprepare` answers NO_SUCH_PROJECT, not C-70.1, to a caller who sees the project only at existence (its `#callerRefusal`). REC-149's rule for acts would answer C-70.1. That is network-notices' to change, not this door's.
- The plane's store map does not yet spread `networkNoticesOps`; that is plane's L11 entry. Until it does, the notice ops get the store's own `unknown op` refusal.
- Generated artifact: my change under `src/control-plane/` stales the plane bundle (red 12). I regenerated nothing.

**Runs.**
- `test/m/control-plane/`: 123 tests. 118 pass. 5 fail, all R45, waiting on op-declarations' specs. With the scratch specs, 122 pass; the one fail is red 5, affordances' totality.
- Whole `test/m`: 5189 tests, 5170 pass, 8 fail, 11 todo. The fails are the 5 R45 tests above; queue `catalogue.test.mjs` R1 and R5 (red 13); and plane `worker.test.mjs`:58 R6, red with my changes stashed too (red 6, plane's share).
- The users you named are green: `test/m/plane/` apart from that R6, `capture/`, `sources/` and `instance-setup/page.test.mjs`.
- Checks: format 0 failures; architecture 35 files, 0 failures; coverage 29 of 29; ownership 9 files, 0 failures.
- Size: `src/control-plane/` is 3,529 lines (was 3,504).
