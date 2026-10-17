# membership (T50)

**Status** · session_012b5v7Ekpv3CAbBibj4BTrH · depth 2 · WORKING · handled B1

## Completion record

**Entries applied (T50-2).**
- R146: `MODULE_ORDER` is `moduleOrderFrom({modules})` over `order.mjs`, a file generated from `build/modules.json` by `order-build.mjs` (`--check` finds it stale; the test holds it byte-equal to the generator's output). No hand-typed module id remains in the module; `setup-words` first, `translations` before `instance-setup` follow from the file. R79's listeners already ordered by it. The R83/R140/R145 pin tests that hand-listed modules and a tolerated-names list are replaced by file-driven tests (R146 voids those sentences).
- R147: `memberList` lists the founder first once claimed (`founder: true`, handle `founderHandle()` or null, keys as stated, `projects` for an administrator's roster, no cover/door/invitation). Existing roster tests updated for the extra row (roster, t34-joining R105, t46, t49, `test/members.test.mjs`).
- R148: `lookedAt({by})` and `op=lookedat` (the op map entry only; its declaration and grade are T50-24/T50-18's); `lookedSince` and `lookedAt` share `#markHolder`.
- R149/R150: `projectViewer(viewer, project)` spells `<viewer>@<project>` (member:<id> or bare `admin`); `viewerPredicate(viewer, reach)` ANDs the member's own R43 gate with `own bundle OR project = P OR id IN json_each(reach)` (one bound parameter, the host's 100-parameter limit); `registerProjectReach`, `projectReach`, and instance `viewerGate`/`hiddenBundlesFor`; `sight`, `inSight`, `positionalMember`, `hiddenBundles` follow.
- R151: `words.mjs` (keys only), every row's `translation` is `rowWord(code)` = `word(key)` with placeholders left; `COURT_STATEMENT`, `DOOR_WARNING`, remedies, `alsoDo`, owner `why`, the audit finding's `says`, `HANDLE_CHECK_STATED` and R123's `words` read their keys; `HANDLE_WORDS`/`REFUSAL_WORDS` removed (only this module's tests imported them). `WORD_KEYS` = the 61 keys read; `words-reads.json`'s membership list minus `handle.changeable`, `handle.formerly`, `handle.fixed` (the screens' own). The `detail` strings stay in source (DEC-258 (3)); I changed their "your group's Civicsmith" to "your team's".

**For BOB / other modules (interface notes).**
1. `modules.json`: `membership.uses` must add `setup-words` (R151's Use); architecture check fails 6 files until it does. This is the only failure of the checks for my files.
2. Reach readers are consulted by the INSTANCE (`m.viewerGate`, `m.hiddenBundlesFor`, `m.inSight`, `m.sight`); the module-level `viewerPredicate(viewer, reach=null)` / `hiddenBundles(viewer, reach=null)` take the reach as an optional second argument, since readers live on the instance. A module compiling SQL with the module-level function alone gets the project's own bundles (narrower, never wider) until it passes `m.projectReach(project)`. credentials (R79) and agent-worker (T50-65) should call `viewerGate`/`hiddenBundlesFor`.
3. Generated artifact: `bio-plane/src/membership/order.mjs` is new (regenerate: `node bio-plane/src/membership/order-build.mjs`, check `--check`); BOB to list it in `build/manifest.md`. The plane bundle is stale (membership changed) for the layer close.
4. `memberList` now returns a row with no members-table row; readers that join its `member_id` to `members` (project-roster R29 names her) should tolerate it.
5. Words: rows now say "team" (the key's words). Tests of other modules holding membership's old English were not found; project-roster `R25` and affordances `R48/R53/R57/R61/R62` fail identically at the base (inherited).

**Deferred.** None.

**Size (P6).** `index.mjs` 3,225 lines; module total 4,193 incl. generated `order.mjs` (176) and `order-build.mjs` (68); own hand-written code about 3,950. Past ~4,000 with the generator counted: its split is T51's first entry.

**Tests run.** `node --test bio-plane/test/m/membership/ bio-plane/test/members.test.mjs`: tests 264, pass 264, fail 0 (membership; `members.test.mjs` 1 file pass). Dependents run: credentials 155/0, promotion 137/0, control-plane 292/0, project-roster 64 pass 2 fail (base 2), affordances 258 pass 4 fail (base 4). Checks: format 2 failures (`build/rulings.md` K3441, K3597, not mine); architecture 6 failures (item 1); coverage 111 of 111; ownership 0 failures.

Size (session_012b5v7Ekpv3CAbBibj4BTrH): test runs 16, module lines 4193
