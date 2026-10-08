# bias (T38)

**Status** · session_01H5SGMsATdVSiwtbHK79v41 · depth 2 · COMPLETE · handled B1

### Work (BIAS #12)

**Reading set (mechanics §17).** BOB's measure was 356 KB, counting each used module's whole public part. On §3's reading it is about 295 KB, at most 300 KB, so I read it whole myself: `build/requirements/bias.md` (24 KB); layer 5's row of `build/layers.md`; the Purpose of record-grammar, record-core, membership, promotion, entities and credentials (about 3 KB); the services my Uses names (record-grammar R46, R47; record-core R21, R41, R60, R63; membership R81, R83, R84, R110, and R118 for this entry; promotion's `registerStep`; entities R7; project-roster R3; about 17 KB); all of `bio-plane/src/bias/` (121 KB); and all ten files under `bio-plane/test/m/bias/` (about 130 KB). No worker was used.

**Entries applied.** T38-27 (N783, K2281): `debt.test.mjs`:103, in R34's test, made cora an owner through `membership.projectOwnerAdd`, which moved to project-roster (its R3) in L2. The setup now writes the owner flag through membership R118, `participationWrite("ownerOn", {projectId, memberId: "cora", by: "ruth"})`, and asserts it wrote. That is all the test needs: cora has already joined, so she is an existing participant, and R34 reads owners through `membership.projectOwners`. The test still checks R34 in full (cora owns the project but cannot read RUN-1, so she is not a recipient). No `src/` change. **No import of project-roster:** no `uses` edge is needed. This clears bias's share of plan rule 6 item 11.

**Deferred.** None. R26 stays deferred by K102 (its `test.todo`), as before.

**Found in other modules.** None.

**Tests and checks.**
- Before the change, on this branch: `node --test test/m/bias/debt.test.mjs` gave pass 15, fail 1 (`TypeError: w.membership.projectOwnerAdd is not a function`), which reproduces the red.
- After: `node --test test/m/bias/` gave tests 68, pass 67, fail 0, todo 1 (R26). No layer tests are named in `build/manifest.md`. I changed no provided service.
- `format`: 137 modules, 136 requirements files; 0 failures.
- `architecture bias`: 13 product files, 45 relative imports; 0 failures.
- `coverage bias`: 48 of 48 live requirement ids named by a test; 0 failures.
- `ownership bias tranche/T38`: 1 file changed by bias; 0 failures.

Size (session_01H5SGMsATdVSiwtbHK79v41): test runs 3, module lines 2
