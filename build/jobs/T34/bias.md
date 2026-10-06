# bias (T34)

**Status** · session_01NjDa7GbJXLCjDHkrNB4LFJ · depth 2 · COMPLETE · handled B2

## Record (BIAS #10)

**Entries applied.** T34-25 (N551; DEC-132 (5), Bob's; K1541, K1746): R48 `descriptionDraft({viewer})` in `bio-plane/src/bias/index.mjs`. To an active member it answers membership R110's latest self-description (`kinds`, `otherKind`, `focus`, `purpose`, `by`, `at`; never the history), labelled as what the group wrote about itself and offered as a new bias set's opening text, `proposed: true, authored: false`, `statements: []`. With none held, or to any other viewer, it answers `description: null` with one identical answer that says there is nothing to start from. It writes nothing (`installed: false, adopted: false, writes: 0`), sends no lens notice, never moves a lens and never throws. It is built on J1's two readings: the founder counts while claimed, and no op is added.

**Deferred.** None of T34's. R26 stays deferred (K102), as before.

**Found in other modules.** (1) The plane's bundle, `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`, manifest §14), is stale from this change to the plane's source. BOB regenerates it at the layer close; I did not write it. (2) A surface that wants R48 over HTTP needs an op: an arm in `biasOps` (mine to add if BOB asks, J1 (2)), `op-declarations`' credential row and `control-plane`'s routing.

**Tests and checks.**
- `node --test bio-plane/test/m/bias/`: tests 63, pass 62, fail 0, todo 1 (R26, deferred K102).
- The new file is `description-draft.test.mjs`, five tests naming R48.
- `checks/format.mjs`: 126 modules, 125 requirements files; 0 failures.
- `checks/architecture.mjs bias`: 12 product files, 42 relative imports; 0 failures.
- `checks/coverage.mjs bias`: 48 of 48 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs bias tranche/T34`: 3 files changed by bias; 0 failures.
- No layer tests are named in `build/manifest.md`. No service I already provide was changed: R48 is a new one with no callers yet.

Size (session_01NjDa7GbJXLCjDHkrNB4LFJ): test runs 4, module lines 1915

## J1 · QUESTION

R48 (`descriptionDraft`), two readings; I am building on both unless you answer otherwise.

(1) "A viewer naming an active member": I read it as `member:<id>` whose member is `active` (membership R68 `memberFacts`), and also the founder, in either spelling R43 gives (`admin`, `member:admin`), exactly while the instance is claimed (membership R64 `isAdministrator("admin")`). The founder is an administrator who authors and adopts instance bias (R11), and membership R110 admits the founder too. A machine credential (`class:*`), an invited, proposed or revoked member, an unclaimed founder, an unknown viewer and no viewer are all answered "as if none were held".

(2) R48 names no op. I add none: an op needs `op-declarations`' credential row and `control-plane`'s routing, which are other modules'. The service is a method on the bias instance (`biasOf(ctx).descriptionDraft({viewer})`) for its caller (the screens' wizard, later). If you want an op now, say so and I will add `biasdescriptiondraft` to `biasOps` (R48's read from the query's stamped `viewer`), and the declaration stays op-declarations' to add.

## J2 · COMPLETE

T34-25 applied: R48 `descriptionDraft({viewer})` (commit 8543357222), built on J1's two readings (the founder counts while claimed; no op added). It is still open: an ANSWER that differs from either reading re-opens the job. The bias tests: 62 pass, 0 fail, 1 todo (R26, deferred K102). format, architecture, coverage (48/48) and ownership: 0 failures. Found: the plane bundle `bio-plane/dist/bio-plane.bundled.mjs` is stale from this change; it is yours to regenerate at the layer close. An HTTP surface for R48 would need a `biasOps` arm (mine on request), plus op-declarations' row and control-plane's routing. Details are in my record.
