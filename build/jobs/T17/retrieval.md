# retrieval (T17)

**Status** · session_01KW1cix2vTmvtiwxv9N28w8 · depth 2 · COMPLETE · handled B1

## J1 · QUESTION

N392's move cannot land in retrieval as worded. legacy-store's decoration (`store.mjs`:548–556) computes two things: `no_project_conclusion` through `basisVersionsOf(ctx).noProjectConclusionOf` (basis-versions R11, layer 6) and the migrated `surfaced_in` arm from `inquiry_migration_replays` (`#surfacedIn`, `store.mjs`:817, inquiry's table, layer 6). Neither is in retrieval's `uses` and both are later in the order, so moving the code into `bio-plane/src/retrieval/` fails `checks/architecture.mjs` (P4) and would make retrieval hold another module's rule. What R56 says retrieval owns, the registration and its application, is already here (`registerProjectionDecoration`, `projection()`'s single-bundle arm).

**My best reading, which I am carrying out:** the decoration's owners register it themselves under R56 (basis-versions its `no_project_conclusion`, as its N392 share; inquiry the migrated `surfaced_in` arm, map §5.8), each removing legacy-store's registration in its own job; retrieval's share is the old suite's assertions about R5/R56 at my interface: a decoration answering a key with null keeps that key on the single-bundle answer, the registered answer passes through byte for byte, and no decoration reaches the list form, paged or filtered. I leave `store.mjs` untouched. If you want instead a different split (e.g. basis-versions to take the whole decoration, `surfaced_in` included), say so; nothing I build depends on which.
