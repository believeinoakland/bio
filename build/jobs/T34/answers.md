# answers (T34)

**Status** · session_01Ya6c1GwmcFiEnh99zBxMdo · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied.** T34-36, every `*(not yet met: T34)*` line of `build/requirements/answers.md`:
- **R1** (N580; K1603, K1609; BOB's finding K1764): `ASK_SCOPE` names each op as the plane routes it: `calculation`, `career`, `dutiesof`, `dutyoccurrences`, `linesof`, `structureat` (new, lines, K1609) and `money` where it held `calculations`, `careerof`, `duties`, `occurrences`, `lines` and `moneyfacts`. It equals credentials' `AI_GRANT_OPS` both ways, `rule` included; the copy test asserts plain equality again (red since K1764, now green).
- **R15** (N584; RETRIEVAL #12, K1788): the saved-form check reads retrieval's `relations()` (its R72) and every local day this module reads (today, the end date, the due day, the wake, the tallies' day) reads retrieval's `zone()` (its R69: local-facts' governing value first). Both fall back to `deps.relations`/`deps.zone`, then the profiles' `time_zone`, only where retrieval gives none. A member's own search form (an object `{q}` or a string) is taken as the assistant's (DEC-139 (7)).
- **R19** (K1609, K1755): the AI half asks, in order: the copy's switch; that an answerer is deployed; `credentials.accountFor({member, act: {kind: "standing", member}})` (own reference, else the group's key held and on; the key is dropped at once, never used here); the ceiling; then `credentials.aiGrantMintStanding({member, question})`. The answerer reads under that real grant token, which keys the run's read log (so the plane's `logRead` records its reads), never `aiGrantMint`. Held-back conditions: `switch_off` (`copy`, `member` or `group`, the switch of the account that would serve), `not_deployed`, `no_account` (bare for `NO_ACCOUNT`; with `code`/`translation` for `GROUP_KEY_NOTICE_DUE` or `ACCOUNT_MEMBER_NOT_ACTIVE`), `ceiling`, `grant_refused` (any other mint refusal). No grant is minted while any earlier condition holds.
- **R26** (DEC-139 (7), K1755): a member no account serves sets, runs, sees and ends a standing question as any member; a new find is held back `{condition: "no_account"}`, no model or ceiling asked, and reaches them once as R20's entry with `finds` and `answer` null.
- **R27** (N605, K1666): `onStandingSet(module, fn)`, one per module through `membership.listenerRefusal`; `fn({question, due})` called once after a set (`due` today's local day: a new question is due at once) or an end by its author (`due` null); a throwing listener never undoes the act; the notice writes nothing.

**Rulings made here (for `build/rulings.md`, BOB's to record).** (1) R19's order puts the answerer's deployment before the account, and the ceiling before the grant mint, so a grant is minted only when it will be used; a member whose standing switch is off and who is at the ceiling is told `ceiling`. (2) `GROUP_KEY_NOTICE_DUE` from `accountFor` holds the AI half back as `no_account` with that code: the group's key does not yet serve that member.

**Deferred.** None.

**Found in other modules (for BOB).**
- `plane` (`bio-plane/src/plane/store.mjs` ~207): the composition root still hands answers `relations: () => ({ projection: PROJECTION_RELATION })`. It is now unused (answers reads retrieval's `relations()` and `zone()`, the `retrieval` it is already handed); the plane may drop it. Nothing is stale in behaviour.
- `scheduler` (R17's wake, N605): answers now offers `onStandingSet`; scheduler should register with it to re-arm the `standing-questions` wake at once (its own change; not made here).
- `retrieval` R69: `zone()`'s first read creates local-facts' instance and so its (empty) `local_fact_acts` table. In the plane every module is made at boot, so it writes nothing there; in a test world it is a lazy write on a read. answers' fixture reads `zone()` once at build. Worth a line in retrieval or local-facts if "a read writes nothing" is meant at first touch too.
- Generated artifacts: none staled (answers is no bundle input).

**Tests and checks.**
- `node --test bio-plane/test/m/answers/`: pass 34, fail 0 (was 30 pass, 1 fail: the R1 copy test). New tests named R26, R27, R15 (N584); R1 and R19 rewritten to the new contract; R21 admits retrieval's `relations`/`zone` reads (they read no record).
- Users of answers, before and after identical (the reds are the inherited ones B1 lists): scheduler 81/1 (R12), affordances 191/1, notice-producers 34/5 (K1795 detectors), op-declarations 68/1 (K1764 t33 R19/R6), control-plane 167/1 (R43), plane 110/0; agent-worker 7/2 files (K1708 REC100, K1764 R55).
- Layer tests: none named in `build/manifest.md`.
- `format`: 126 modules, 125 requirements files; 0 failures. `architecture`: 15 product files, 50 relative imports; 0 failures. `coverage`: 27 of 27 live requirement ids named by a test; 0 failures. `ownership`: 8 files changed by answers between tranche/T34 and HEAD; 0 failures.

Size (session_01Ya6c1GwmcFiEnh99zBxMdo): test runs 12, module lines 1380
