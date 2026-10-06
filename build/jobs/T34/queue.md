# queue (T34)

**Status** · session_013fDw2ZovyNJ89sQezjLxrp · depth 2 · WAITING ON BOB (J1) · handled B1

## J1 · QUESTION

T34-56 part 2 (N630, K1717): the measure, and one trim that needs R17 changed.

**Measure** (biosmoke7, 0.80.0, `op=queue&limit=500`, the member bearer, read-only GET, 2026-10-06 ~22:10Z): 57,558 bytes, 17 items (12 authority-undetermined to-dos, 5 source-modified). By part: `vocabularies` 24,171 (42%); `items` 28,426 (of which `disposition.detail` 6,086, `basis.detail` 2,345, `options` 3,971); `disposed` 1,333, `unattributed_readings` 1,051, `resolved` 713, `mute` 617, `notice_producers` 577, the rest < 100 each. Within `vocabularies`, `connection_kinds` alone is 9,725.

**What the app reads** (`civicos-ui/app.html`, every read of the answer, from `queueLoadFeed`:15057): it never reads `vocabularies` (it takes them from `op=affordances`, `ACT_SOURCE.vocab`:7686, loaded once per session), `disposition.detail`, `disposition.keyed_on/key/reason/instead/requires/acts`, `resolved`, `notice_producers`, `unattributed_readings`, `disposed.detail`, `mute.case_kinds/snoozed_until`, `case.disposed_by`, `catalogue_id`, `snoozed`, `due`, `options[].weight/needs/mode`. No civicos-ui test pins any of these from `op=queue`.

**Done in this job, inside my requirements:** the per-item disposition sentences (R12's project-scoped `detail` naming its boundary, K725; the instance-scoped and no-scope ones; `case.disposed_by[].detail`) shortened to their substance. On a world shaped like biosmoke7's (12 to-dos, 5 project-homed findings) the answer goes 50,467 → 47,977 bytes; `disposition.detail` 7,316 → 4,821.

**QUESTION (replaces none).** The rest of what the app does not read is published under requirements: `vocabularies` by R17, `resolved` by R39, `notice_producers` by R51, the details by R12/R14/R15. Only `vocabularies` is large. My best reading of K1717 ("trim … what is not needed"): amend **R17** so `op=queue` no longer attaches `vocabularies` (options are still decorated through `affordances.decorate`, so an option still equals `op=affordances`' act; the vocabularies stay published once, by `op=affordances`, affordances R26). That removes ~24 KB (42%) from every queue read, and the door's second store call (`http://do/actionkinds`, made only for `vocabularies`), which is part of the +63 ms. It changes no member-visible behaviour (the app never reads them). The other blocks are small (< 1.4 KB each) and stay. If you agree, please re-word R17 (and its *(not yet met: T34)* mark) and send a CHANGE; I will then drop `vocabularies` from `queueAnswer`, the `actionkinds` call from `door.mjs`'s `queueFeedOp`, and re-point the R17 tests. Everything else in T34-56 is done, tested and checked; this is the only open item.

Also for your record: `bio-plane/dist/bio-plane.bundled.mjs` (generated, not_product) still holds "Signal" and is stale from this change; it is regenerated at the layer's close (§14).
