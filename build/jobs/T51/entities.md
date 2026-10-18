# entities (T51)

**Status** · session_01BRhBQme4TGHsPej7wEteGu · depth 2 · COMPLETE · handled B1

## Completion (T51-30)

**Entries applied.** R58 `matched_by` on every resolution (written with it, taken by a raise, kept by an equal or weaker grade; `identifier` when the identifier tier matched the entity, else `reference`, `reference_key`, `label`; `testimony`), a store written before gets the column once, filled from the tier the method sentence names, `null` where no known sentence; `resolutionsFor` answers `names` and `names_truncated`. R57 `onlyByIdentifier` (`op=entityidonly`, `ids` comma list), R59 `subjectsNamed` (`op=subjectsnamed`), R60 `similarSubjects` (`op=entitysimilar`), all three arms in `entitiesOps`. R61 `page` on `namingDocuments` and `namingIn` candidates. `NO_ALIAS` now minted at one site (`noAlias`, its row's `where` updated; registry test updated for the string).

**Readings of the requirements (BOB may correct).**
1. An entity matched by both an identifier and an alias fold of the same reference is `identifier` (as its method sentence says).
2. `names` ties at one grade take `MATCHED_BY`'s order (identifier first).
3. `page` is given for `pdf-page` positions only (index + 1); sheet, slide and paragraph positions answer `null`.
4. R59 and R60 scan the registry in code (no index serves a term test over names); bounded by the group's registry size.
5. R59 pages by cursor `<label fold>|<entity_id>` in `next`/`after`.

**Deferred.** None.

**Found in other modules.** `retrieval/words.test.mjs` is red at base: its key list lacks `monitoring.reason_given`, `retrieval.column_why`, `retrieval.extent_why`. 29 further consumer-test reds (notice-producers, op-declarations, escalation, scheduler, queue-producers, duties date/word tests) are red identically on `tranche/T51` (31 there). Stale generated artifacts (manifest §14): `bio-plane/dist/bio-plane.bundled.mjs` and `release/bio-plane.bundled.mjs` embed entities' source.

**Tests and checks.** Entities: `node --test bio-plane/test/m/entities/*.test.mjs` 131 pass, 0 fail (new `t51.test.mjs` 13; ops, reads and registry tests updated). Consumers of entities (all 40 test dirs in `modules.json` uses): 3584 pass, 31 fail, same reds as base. Checks: format 0 failures; architecture 0 failures; coverage 61 of 61; ownership 0 failures.

Size (session_01BRhBQme4TGHsPej7wEteGu): test runs 9, module lines 2,432

## J1 · COMPLETE

T51-30 applied: R57-R61 met (matched_by/names, onlyByIdentifier, subjectsNamed, similarSubjects, page). entities tests 131/0; format, architecture, coverage 61/61, ownership 0 failures. Consumers: same reds as base (retrieval words keys; date/word tests), none new. Stale generated: bio-plane/dist bundle and release copy. Readings and details in my record.
