# retrieval (T17)

**Status** · session_01KW1cix2vTmvtiwxv9N28w8 · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

N392's move cannot land in retrieval as worded. legacy-store's decoration (`store.mjs`:548–556) computes two things: `no_project_conclusion` through `basisVersionsOf(ctx).noProjectConclusionOf` (basis-versions R11, layer 6) and the migrated `surfaced_in` arm from `inquiry_migration_replays` (`#surfacedIn`, `store.mjs`:817, inquiry's table, layer 6). Neither is in retrieval's `uses` and both are later in the order, so moving the code into `bio-plane/src/retrieval/` fails `checks/architecture.mjs` (P4) and would make retrieval hold another module's rule. What R56 says retrieval owns, the registration and its application, is already here (`registerProjectionDecoration`, `projection()`'s single-bundle arm).

**My best reading, which I am carrying out:** the decoration's owners register it themselves under R56 (basis-versions its `no_project_conclusion`, as its N392 share; inquiry the migrated `surfaced_in` arm, map §5.8), each removing legacy-store's registration in its own job; retrieval's share is the old suite's assertions about R5/R56 at my interface: a decoration answering a key with null keeps that key on the single-bundle answer, the registered answer passes through byte for byte, and no decoration reaches the list form, paged or filtered. I leave `store.mjs` untouched. If you want instead a different split (e.g. basis-versions to take the whole decoration, `surfaced_in` included), say so; nothing I build depends on which.

## J2 · COMPLETE

Completion on J1's best reading (J1 still open; a `CHANGE` re-opens me). Commit `2921b2b7a1`.

**Entries applied.** N392 (K573), retrieval's share: `bio-plane/test/projection-noproject.test.mjs` converted into `bio-plane/test/m/retrieval/decoration.test.mjs` (4 tests, R5 and R56 named in each title), over real promoted bundles of the old suite's kinds (a concluded inquiry, one concluded the legacy way, an open one, an information bundle, a project), with a decoration the test registers under a module name as inquiry and basis-versions register theirs.

**Which old assertions each new test carries.**
- "a registered decoration's answer is carried … byte for byte, per viewer": §1's `op=projection` field present, non-null, claim state, byte-identical and over 200 bytes, per viewer (two members and the machine credential); plus the call's `{viewer, nowMs}`.
- "a decoration answering a key with null leaves the key present": §2 (open inquiry; the two non-inquiries).
- "no decoration reaches the list form, paged or filtered": §3's three arms (the list holds the concluded inquiries; no row carries the field; the filtered form likewise), plus every page by cursor and that the list never calls a decoration.
- "a hidden or absent bundle answers null before any decoration runs; a decoration that rejects adds nothing": the old header's gate note (hidden answers as absent), and the promise path.

**Not carried, with why.** §1's equality with `op=basisversions` and §1's adopted-answer content (`relationship`, `claim.text`, `conclusion`): basis-versions R11's, its N392 share (layer 6). §4 whole (one reader, definition and call-site counts, token counts, never-on-the-list source arm): source-text reads, P7 forbids; its behavioural half is the list-form test. The `.control.mjs` driver edits `store.mjs` text: dropped as instructed. The old suite and its helpers are left for legacy-tests.

**Deferred.** The move itself (J1): the decoration answers basis-versions R11 and reads inquiry's `inquiry_migration_replays`, both layer 6, outside retrieval's uses; `store.mjs` untouched. Nothing else.

**Found in other modules.** basis-versions and inquiry: legacy-store (`store.mjs`:548–556, :817) still registers their R56 decoration (`no_project_conclusion`; the migrated `surfaced_in` arm); each owner should register its own and legacy-store's registration and `#surfacedIn` go.

**Tests and checks.** `node --test test/m/retrieval/`: tests 70, pass 70, fail 0. No layer tests named in the manifest. `format`: 72 modules, 67 requirements files; 0 failures. `architecture retrieval`: 13 product files, 47 relative imports; 0 failures. `coverage retrieval`: 61 of 61 live requirement ids named by a test; 0 failures. `ownership retrieval tranche/T17`: 1 file changed; legacy-store 0 added, 0 removed; legacy-checks 0/0; 0 failures.

Size (session_01KW1cix2vTmvtiwxv9N28w8): test runs 2, module lines 111
