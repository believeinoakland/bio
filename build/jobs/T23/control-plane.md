# control-plane (T23)

**Status** · session_01FGx9TWWD64HqdD22yjYnDN · depth 2 · COMPLETE · handled B4

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

## J2 · REPORT

B2 (K1168) is applied in 71f39643b7.
- **Stamps.** The door now stamps T23's ops by op-declarations' lists:
  - `viewer` on `WHAT_CHANGED_PROPOSAL_ACTIONS`, `WHAT_CHANGED_READS`, `NETWORK_NOTICES_ACTIONS` and `NETWORK_NOTICES_READS`;
  - the proposer's label as `author` (and as `proposedBy`, R10's name) on `WHAT_CHANGED_PROPOSAL_ACTIONS`;
  - the positional `by` on `NETWORK_NOTICES_BY`.
  
  `escalationreasondraft` and `sweeps` already take `viewer` through `ACTION_LAYER_READS`.
- **Public reads.** I removed my by-name arm, per K1166 (2). The three public reads are reached as `op=publicread&name=<name>` through the public hook. Their own names go to the public hook, never to a store route. `r45-routes.test.mjs` tests this.
- **Tests.** Run with op-declarations' branch file in place (temporarily, not committed), `test/m/control-plane/` has 123 tests: 122 pass, 1 fail. The fail is affordances' totality (red 5). Each of the four list wirings, removed, turns a test red.
- **Branch state until op-declarations merges.** My branch imports names that `tranche/T23` does not yet export, so the control-plane suite does not load until I merge `tranche/T23` after op-declarations' merge.
- **Checks.** format 0 failures; architecture 0; coverage 29 of 29; ownership 0.
- **Size.** `src/control-plane/` is 3,517 lines.

## J3 · REPORT

B3 (K1170) is applied in this push.
- **By-name public reads are back.** The door again serves `activitymethod`, `noticespublic` and `groupkeyspublic` by their own names through `publicReadDoorRead`, from `bio`, with no credential. It now keys on op-declarations' `NETWORK_NOTICES_PUBLIC_READS`.
- **Tests.** `r45-routes.test.mjs` covers both paths for each read: by its own name, and as `op=publicread&name=` through the public hook. Both refuse `store=scratch`, both relay not-registered at 404, and both turn a silence into 502. `directorysubmission` is already named in the R45 tests (stamps and the session-only fence).
- **Results**, with op-declarations' branch file in place (temporarily): `test/m/control-plane/` has 123 tests, 122 pass. The 1 fail is affordances' totality (red 5). Disabling the by-name arm turns a test red.
- **Size.** `src/control-plane/` is 3,525 lines.

I am waiting for your CHANGE on op-declarations' merge.

## Completion

**Entries applied** (B1, `build/plan/current.md` T23 L11; B2 K1168, B3 K1170, B4 K1171).
- **R36 met (N499, K1117).** Capture's own merge did not clear red 9, because the door still called `pullKnock`. A reasoned `pulled` resolve now goes through capture's `inboxResolve` with `at` and `within` (`pull.mjs`). The reason is recorded on the knock's row inside the pull, one act with its promotion. Capture's refusals come first and in its order. A direct `op=inboxpull` stays `pullKnock`'s and takes no reason. `inbox-door.test.mjs`:81 is green, with its neighbours.
- **R45 met.**
  - The door stamps T23's ops by op-declarations' lists, after deleting every stamp the caller sent:
    - `viewer` on `WHAT_CHANGED_PROPOSAL_ACTIONS`, `WHAT_CHANGED_READS`, `NETWORK_NOTICES_ACTIONS` and `NETWORK_NOTICES_READS`. `escalationreasondraft` and `sweeps` already take it through `ACTION_LAYER_READS`.
    - The proposer's label on `whatchangedpropose`, as `author` (case-authoring reads it as `proposedBy`) and as `proposedBy`.
    - The positional `by` on `NETWORK_NOTICES_BY`.
  - Each op reaches its owner's store route of its name through the general forward.
  - The notice ops admit only a member's session.
  - network-notices' public reads are reached credential-free as `op=publicread&name=<name>` through the public hook. Their own names go to the public hook, never to a store route (B4, K1166 (2)). B3's by-name arm (8c878c6778) was reverted on B4.
- **R22.** `CHECK_FAMILIES` reads network-notices' `NETWORK_NOTICE_CHECKS` (C-127), in module order. `families.test.mjs`:47 is green.
- **R27 (my improvement).** `notices` names its project, so a caller who sees the project only at existence is answered C-70.1, as REC-196 rules. `whatchangeddrafts` and `directorysubmission` are classified as naming a case.

**Deferred.** None.

**Found in other modules.**
- network-notices' `noticeprepare` answers NO_SUCH_PROJECT at existence. BOB routed it to N509.
- The plane bundle is stale from my change under `src/control-plane/` (red 12). I regenerated nothing.

**Tests** (in `bio-plane/`):
- New `r45-routes.test.mjs`, 6 tests named R45 or R27, each with negative controls. Each stamping list removed turns a test red.
- `families.test.mjs` gains the C-127 test.
- `inbox-door.test.mjs`:81 re-titled, with a negative control.
- `declarations.test.mjs` is unchanged against the tranche.

**Runs and checks**, after merging `tranche/T23` (op-declarations and queue-producers merged):
- `node --test test/m/control-plane/`: 123 tests, 123 pass, 0 fail.
- Whole `test/m`: 5204 tests, 5173 pass, 20 fail, 11 todo. All 20 are queue's and accepted: the `test/m/queue/` stand-ins (red 15) and `catalogue.test.mjs` R1 and R5 (red 13). Plane `worker.test.mjs` is green.
- The users you named are green: `plane/`, `capture/`, `sources/` and `instance-setup/page.test.mjs`, 187 tests, 0 fail.
- Checks: format, 87 modules, 0 failures; architecture, 36 files, 0 failures; coverage, 29 of 29, 0 failures; ownership, 0 failures.

Size (session_01FGx9TWWD64HqdD22yjYnDN): test runs 24, module lines 3517

## J4 · COMPLETE

control-plane is complete, with tranche/T23 merged in. R36 is met: a reasoned pulled resolve goes through capture's inboxResolve, so its reason lands on the knock's row in one act with the pull and its promotion; you can strike its mark. R45 is met: the door stamps by op-declarations' lists, and the public reads are reached only as op=publicread&name= (B4; B3's arm reverted). CHECK_FAMILIES reads C-127, and families.test.mjs:47 is green. test/m/control-plane: 123 of 123 pass. Whole test/m: 20 fail, all queue's (reds 15 and 13); plane is green. format, architecture, coverage (29 of 29) and ownership all show 0 failures. The plane bundle is stale (red 12). Details are in my record under Completion.
