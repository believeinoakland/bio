# affordances (T7)

**Status** · session_01Uzmu9LYFCjcYb7iowFaKQZ · depth 2 · WORKING · handled B4

## J1 · QUESTION

Three questions. I carry on with my best reading of each.

**Q1. Tests for the ids this tranche does not reach.** The coverage check wants all 27 live ids named by a test that checks full compliance. No `test/m/affordances/` exists yet. Some ids stay unmet after my entries, because the code sits in legacy-store or legacy-index, which B3 does not give me: R13–R16 (`affordanceFacts`, store.mjs), R17 (the `op=affordances` composition, index.mjs), R18 (N45: `projectleave` reads `roster.owner_floor_clear`, which the store computes from all owners, leaving ones included) and R27 (the reassignment is yours).
Best reading:
- In my own paths, with no legacy edit, I add the pure services `decorate(act, gate)` (R11) and `unaccounted(opTable)` (R12). index.mjs keeps its own `decorateAct` until the extraction rewires it.
- I meet R25 (reword `idmatch`, no place named) and R6 (re-export providers' objects; see Q3). I leave R26 as not met, because no `actions` module exists yet to read from.
- I test every id at the interface as it stands today: pure exports directly; R13–R17 through the store's `op=affordancefacts` and the plane's `op=affordances`.
- An id that is still not met gets a full-compliance test that is red. I record it in my record as deferred, with the cause. I do not skip it and I do not weaken it.
- For R27, I will send you a proposed reassignment of the 42 `undetermined` ops under its rule, for you to rule on. Say if you want green-only tests instead, for example tests that name an unmet id but pin today's behaviour. I would not do that without your word.

**Q2. Intent's 17 ops (INTENT J4.3), before legacy-index admits them.** Their OPS/NEEDS rows are legacy-index's, and legacy-index runs after me. If I add NON_ACTS and rung rows for them now, the legacy `affordances` and `rung-ladder` suites stay red on "names an op not in NEEDS/OPS" until legacy-index lands. Best reading: I add them now, keyed to intent's own mutating ops (the `intentOps` set), so both tables are total once legacy-index merges. I state the transient red in my record, and legacy-index needs no second pass through me. The alternative is a CHANGE to me after legacy-index merges.

**Q3. `DISPOSITIONS`: whose object?** R6 says progressions'. INQUIRY #1 J2.3 says re-export inquiry's. Both modules export an equal array, and they are different objects. `op=dispose` (the act `deriveActs` publishes and `vocabularies.dispositions` describes) is enforced by inquiry. R4 requires the very object the enforcing module refuses against. Best reading: `DISPOSITIONS` is inquiry's (R4 wins), and R6's text should name inquiry rather than progressions, which is your fold. `STAGE_REQUIREDNESS` stays progressions', `ENTITY_KINDS`/`RELATION_KINDS` entities', `REOPENABLE_FROM` promotion's and `PER_ITEM_MAX` record-core's.

## J2 · QUESTION

Three items, all requirement text, which is yours to fold. I carry on with my best reading of each.

**Q4. R2's `reasoned` list, for the ops my entries graded.** N115 and INTENT J4.3 asked for a rung or a stated absence for each new mutating op. On R27's rule, eight of them refuse without an authored reason, so I graded them `reasoned`:
- `aliaswithdraw` and `relationwithdraw` (`NO_REASON`);
- `themewithdraw` (`THEME_WITHDRAW_NO_REASON`);
- `filemembershipjudge` (`FILE_MEMBERSHIP_NO_REASON`);
- `connectionassert` (`CONNECTION_ASSERT_NO_BASIS`, "why these two documents are connected");
- `goalclose` and `aspirationdepart` (`NO_REASON`);
- `aspirationretire` (`NO_LESSON`, "what pursuing it taught").

I added the four new codes to `JUSTIFICATION_REFUSALS`, so R19 holds. The rest are stated absences:
- `credential`: `adminresign`, `hostingaccessset`, `memberpairingset`;
- `substrate`: `filemembershipstore`;
- `undetermined`, because neither half of R27 holds: `objectivecondition`, `goaldeclare`, `goallink`, `aspirationdeclare`, `aspirationdeadend`, `triage` (a reason only to defer or dismiss) and `workobjective`.

Best reading: R2's `reasoned` list gains those eight. My R2 test states the list with them.

**Q5. R12's table row.** Publication totality is over the ops a capability gates (the ops with a `NEEDS` row). Rung totality is over every mutating op in `OPS`. These are two different sets: `claim`, `enroll`, `knock`, `purge`, `livefire` and others are mutating but not in `NEEDS`, and `NON_ACTS` must not name them, because legacy `affordances` pins "NON_ACTS names only ops in NEEDS". One `{op, mutating}` table cannot express both. Best reading: each row is `{op, mutating, gated}`, where `gated` means the op has a `NEEDS` row, and a row without the key counts as gated. `unpublished` is then over the gated rows, `unranked` over the mutating rows, and `stale` compares `NON_ACTS` with the gated rows and `RUNGS`/`RUNG_ABSENT` with the mutating rows. That is what I built.

**Q6. The R27 proposal: the 42 ops graded `undetermined` before T7.**
- To `reasoned` (four). Each always refuses without the member's authored account. Their codes join `JUSTIFICATION_REFUSALS`:
  - `biasdebtresolve` (`BIAS_DEBT_NO_REASON`);
  - `actionrisktier` (`RISK_TIER_REASON_REFUSED`, which is empty or malformed, 1–500 characters);
  - `narrow` (`NARROW_NO_DESCRIPTION`, "an account of what changed"; the old comment kept it out only because the family was closed);
  - `actionlaws`? No: it takes no reason. See the reversible list below.
- To `reversible` (four). A published act takes the result back:
  - `versionaccept`: `versionconsider` and `versionreject` move an accepted reading away;
  - `versioncurrent`: a further `versioncurrent` stands the project on another reading;
  - `actionlaws`: a further `actionlaws` restates the list;
  - `projectvisibilityset`: the owner sets it again.
- Stay `undetermined` (34). None requires an authored reason, and nothing published takes them back:
  - `inboxresolve`, `taskforward`, `taskresolve`, `actioncorrespond` (an append-only ledger), `actionlawspropose`;
  - `projectfork`, `biasadopt`, `strengthbar`, `entitycreate`, `entityalias` (`aliaswithdraw` is a NON_ACT, not a published act), `resolve`;
  - `attesttext`, `thread`, `airunopen`, `airunclose`, `suggest`, `contentmint`, `extractpropose`, `connectionchoose`;
  - `transcribe`, `transcriptionattest`, `testify`, `lead`, `leadshare`, `attribute`, `casedraft`, `reviewcomment`, `statementack`, `leadlook`;
  - `themedeclare`, `themeplace`, `themepropose` (`themewithdraw` is a NON_ACT);
  - `progressiondefine` (a basis is required on a revision only, not on the first declaration);
  - `resolvetestify`: its "stated basis" is refused as `NO_BASIS`, a code inquiry also uses for "rests on nothing", so adding it to the family would sweep in the wrong refusals;
  - `contradictionpropose`: `CANDIDATE_NO_REASON` is a machine's reason, not a member's authored one.
- Note: `versionaccept`, `versioncurrent` and `actionlaws` are also in `MACHINE_REFUSALS`, which is unaffected.

Rule on Q6 and I apply it: I move the rows, extend the family, and turn the R27 `test.todo` into a test.
