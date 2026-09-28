# affordances (T7)

**Status** · session_01Uzmu9LYFCjcYb7iowFaKQZ · depth 2 · WAITING ON BOB (J3) · handled B5

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

## J3 · QUESTION

Two more questions. After these, the architecture check and one `test.todo` are all that stand between me and COMPLETE.

**Q7. `jurisdictions` in affordances' Uses.** My R25 test reads the place names from the jurisdiction profiles themselves (`list()`/`get()`: each profile's `covers`, and the names of its spaces and systems), so it checks "no place named" against data rather than against a list typed into the test. The architecture check fails on that import: `jurisdictions` is not in my `uses`. R26 already makes affordances read `jurisdictions.combine` (for `action_kind`), so the use is real, and layer 1 comes before layer 11. Best reading: add `jurisdictions` to affordances' `uses` in `modules.json` (and to its Uses list). The alternative is a typed list of place names in the test, which the next profile would outgrow.

**Q8. `inquiryground` is `reasoned` in R2, but it does not refuse a first grouping.** Inquiry's `#ground` accepts a FIRST grouping of a question with no standing structure without a reason ("A FIRST grouping needs no reason: there is no earlier structure for it to be a revision of"). Only a restructure refuses `NO_REASON`. I drove both cases in the plane: the first grouping without a reason answers `ok`, and a restructure without one answers `NO_REASON`. So R19 ("every `reasoned` op, called without its authored reason, is refused") does not hold for this op, and R2 grades it `reasoned`. By R27's rule, an op that asks a reason only sometimes is not `reasoned` (compare `triage`, K211). Options:
- (a) regrade `inquiryground` to `undetermined` (R2 changes);
- (b) keep `reasoned` and have R19 say "a reason where the act revises what stands";
- (c) inquiry requires a reason on a first grouping too (inquiry's R-change, not mine).

My test marks it `test.todo` until you rule. I lean to (b): the ladder grades what undoing costs, and a first grouping replaces nothing.

## J4 · REPORT

Found in other modules and in generated artifacts. None of it was changed by me. Each item is measured on `job/T7/affordances` after merging `tranche/T7` @ B5.

1. **legacy-store · R16 (and the `cites_in` half of R14).** `affordanceFacts` returns `cites_in: this.#citesInto(target)`, which is the ids of the bundles citing the target, so the facts answer names other bundles. It should pass counts, `{confirmed: n, severed: n}`, as `cited_by_case` beside it already does. `deriveActs` now reads either a count or an array (R10: an unstated count never narrows `retire`), so the change is safe on my side. It is a `test.todo` in my plane test.
2. **legacy-store · R18 (N45).** `roster.owner_floor_clear` is `ownerMath(this.#owners(id).length).possible`, counted over every owner, leaving ones included. Membership R35 accepts an owner's leave only while another owner is *committed*. The fact should count committed owners (or membership should state that predicate), so that `projectleave` is not offered to an owner whose co-owners are all leaving. It is a `test.todo`.
3. **legacy-index · intent's ops (INTENT J4.2), paired with my J4.3 rows.** `NON_ACTS` now names all 17 of intent's ops, and 10 of them carry a rung or a stated absence (`objectivecondition`, `goaldeclare`, `goallink`, `goalclose`, `aspirationdeclare`, `aspirationdepart`, `aspirationdeadend`, `aspirationretire`, `triage`, `workobjective`). So the NEEDS table must carry all 17, reads included, and OPS must mark exactly those 10 as mutating. Until it does, two legacy suites stay red. `affordances` 98/1 fails "NON_ACTS names only ops that exist in NEEDS", on the 17. `rung-ladder` fails BACKWARD and EXACTLY on the 10 (it computes 130 mutating against 140 classified). This is the transient red, K211 Q2.
4. **legacy-tests · `rung-ladder.test.mjs`.** It stops at "`Store.VERSION_ACT_TO` was read out of the store" (red on the base too: the table moved to basis-versions), so its FW-14 backing scan and the pins after it never run. Once it is re-anchored, three things change:
   - the "`reversible` exactly" pin changes with K211: it gains `actionlaws`, `projectvisibilityset`, `versionaccept` and `versioncurrent`;
   - its textual scan will not see intent's ops (`intentOps` is not in its `T5_OP_MAPS`);
   - `JUSTIFICATION_REFUSALS` gained `THEME_WITHDRAW_NO_REASON`, `FILE_MEMBERSHIP_NO_REASON`, `CONNECTION_ASSERT_NO_BASIS`, `NO_LESSON`, `BIAS_DEBT_NO_REASON`, `RISK_TIER_REASON_REFUSED` and `NARROW_NO_DESCRIPTION`.

   My R19 drive covers every `reasoned` op behaviourally (29 ops; `inquiryground`'s first grouping is Q8). `affordances.test.mjs` is otherwise green (was 98/1 on the base; now its only red is item 3). `d311-roster-affordances` stops at `NO_OBJECTIVE` (INTENT J4.1's list), and my plane test carries its agreement and machine arms with the objective line.
5. **legacy-tests · `affordances.test.mjs` and `rung-ladder.test.mjs` read `index.mjs`'s source for NEEDS/OPS.** R12's service (`unaccounted(table)`, rows `{op, mutating, gated}`) now replaces both totality scans, once the control plane's test passes its own table (Suggestions, convention 2). That is for control-plane or legacy-index when they next take it.
6. **legacy-index · `decorateAct`** (index.mjs 2691) duplicates my `decorate(act, gate)` (R11). When the extraction rewires it, the control plane passes `{needs: (op) => NEEDS[op] ?? null, mode: (op) => …SESSION_OPS…}`. The answer is then byte-identical: my plane test holds `op=affordances`' label, weight, rung, rung_absence and prompt equal to `decorate`'s.
7. **Generated artifact · `bio-plane/dist/bio-plane.bundled.mjs`** (and `.bundle.json`) is stale: it embeds `src/affordances.mjs`. It is yours to regenerate at the layer's close.
8. **Requirements text · R3** says "`RUNG_ABSENT` names every other op that writes". That is only checkable against the control plane's table, which no op publishes. My R3 test checks the tables' mutual consistency. The totality half is R12's service applied by the control plane (item 5).
