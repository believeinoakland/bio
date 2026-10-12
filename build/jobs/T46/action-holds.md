# action-holds (T46)

**Status** · session_01KoRoRu2gZWmcRcS7HdgM6n · depth 2 · COMPLETE · handled B2

## Record

**How the reading set was read** (mechanics §17; START: 588 KB with my tests, read whole). Read whole by me: `roles/JOB.md`; `build/manifest.md`; `build/requirements/action-holds.md`; the plan's T46 opening rules and entry T46-33; layer 9's contract in `build/layers.md`; my module's code (`index.mjs`, `checks.mjs`, `schema.mjs`) and tests (`fixture.mjs`, `holds`, `places`, `pressure`, `due`, `hidden`, `readers`) whole (P20); the public part (Purpose and Provides) of each module in my Uses: `actions`, `record-core`, `membership`, `provenance`, `civil-time`, `docket`, `publication`, `project-roster`, `doorbell`, `ratification`, `action-grammar`, `record-grammar`; `words.json`'s three `refusal.*` rows this module's rows name; `duties`' T46 words test and `extraction`'s `TRANSCRIBE_WORDS` as the read-by-key precedent.

**Entries applied (T46-33):**
- **R14** (N929; amends R5) `actionHoldRelease` at a place where no statement stands is refused `HOLD_NOT_IN_PLACE`, answered through `holdNotInPlace(place)` (R11's one minter), asked where `HOLD_ALREADY_RELEASED` is, writing nothing; a place whose latest statement is `released` is still `HOLD_ALREADY_RELEASED`. Every place R2 names (entry, whole action, project, case). The minter's one fixed `detail` is re-worded to be true of a release too ("…A hold notice is recorded, and a hold is released, only while one is in place. Nothing was written."); its row (code, check, translation) is unchanged. The preview (R6) is unchanged: a place with none stated previews `hold: null`, nothing to restart.
- **R15** (DEC-194; N913) C-149.10 `MACHINE_CANNOT_SEND` reads `words.json`'s `refusal.MACHINE_CANNOT_SEND` by key from `ACTION_HOLDS_WORDS` (new, frozen, exported from `checks.mjs` and `index.mjs`), never a copy; code, number, `where` and behaviour unmoved. C-149.11 `HOLD_NOT_IN_PLACE` and C-149.8 `HOLD_PLACE_REFUSED` keep their present translations (K2953), pinned; every other row pinned unchanged by digest. Both kept codes are minted here only; `filings` relays them (K231).
- Tests changed for R14's replaced sentence ("An entry with no hold stated may be released"): `holds.test.mjs` R5 (a release now follows a placed hold; the none-stated case answers `HOLD_NOT_IN_PLACE`) and R8 (the release that ended no hold is now refused, still never listed); `due.test.mjs` R3 (the mark leaves the list by a hold placed then released). New `t46.test.mjs`: R14 (every place, the order, the op, the controls) and R15 (the word by key at the act; the two kept rows; no other row moved).

Not-yet-met marks this job meets: **R14, R15**, each named by `t46.test.mjs`.

**Flaws in my own module:** none known beyond the detail sentence above (fixed). Deferred: none.

**Other modules (also in a REPORT):**
- `action-producers` R5/R11 (and `queue`'s and `queuestate`'s kind texts for `litigation-hold`): the to-do's second door is `actionholdrelease`, labelled "Record that no hold is needed, with a reason". Since R14 that act is refused `HOLD_NOT_IN_PLACE` where no hold was ever placed, which is exactly the to-do's case (R3 lists a mark only while no hold is stated at it). So the door is offered and always refused, and a member can no longer record "no hold needed" without first placing one. Not mine to change: a requirement question for BOB (drop the door, or give "no hold needed" its own act/statement).
- `filings` R47: relays `HOLD_NOT_IN_PLACE` from `holdNotInPlace`; its `detail` sentence changed (above), its row did not. `filings`' tests assert the reason only and pass.
- `affordances`: offers `actionholdrelease` only where `holds_in_place` > 0, which already agrees with R14.
- Generated artifacts: the plane bundle includes this module's source, so it is staled (accepted red 4, regenerated at the layer's close).

**Tests and checks run** (on the commit below):
- `node --test bio-plane/test/m/action-holds/`: tests 38, pass 38, fail 0.
- Users of this module (`membership` t42-hold-reach, `queue` action and catalogue, `action-producers`, `filings`, `affordances`, `op-declarations`, `op-grades`, `store-door` dispatch, `control-plane` r48-routes, `answer-envelope`, `action-grammar`, `ratification`, `doorbell`, `plane`): tests 1209, pass 1198, fail 11; all 11 red on the tree before my change as well (the op-declarations/affordances registry and op-map reds of rule 5 (7), (8) and the T46 named ops, and `plane` `compose.test.mjs` R11/R5), none naming this module.
- `checks/format.mjs`: 159 modules, 0 failures. `checks/architecture.mjs action-holds`: 10 product files, 0 failures. `checks/coverage.mjs action-holds`: 15 of 15 live ids named, 0 failures. `checks/ownership.mjs action-holds tranche/T46`: 0 failures. `checks/run.mjs`: architecture 0 failures (2957 product files); coverage 29 failures, none `action-holds` (other modules' not-yet-met ids, rule 5 (1)); channels 0.

Size (session_01KoRoRu2gZWmcRcS7HdgM6n): test runs 7, module lines 1223


**After B2** (CHANGE, K2981: R14 retired; `tranche/T46` merged into this branch). R14's behaviour undone: a release at a place where no hold was ever placed is accepted again, as R5 states (the statement that none was needed), with its restarts; a place whose latest statement is `released` is still `HOLD_ALREADY_RELEASED`. `index.mjs`, `holds.test.mjs` and `due.test.mjs` are back to their T45 state (R5's control "an entry with no hold stated may be released" restored), but for `index.mjs` exporting `ACTION_HOLDS_WORDS`. `holdNotInPlace` stays `HOLD_NOT_IN_PLACE`'s one minter; its fixed `detail` is back to the notice sentence, the only arm that answers it (`holdNoticeSent`, `filings` R47), so my re-wording is dropped. R14's test is removed; `t46.test.mjs` names R15 alone. R15 unchanged. Net change of this job against T45: `checks.mjs` (R15's word by key), the one export line, `t46.test.mjs`.
- `node --test bio-plane/test/m/action-holds/`: tests 37, pass 37, fail 0. `action-producers`, `filings`, `queue` action, `membership` t42-hold-reach: tests 138, pass 138, fail 0.
- `checks/format.mjs` 0 failures; `architecture.mjs action-holds` 11 product files, 0 failures; `coverage.mjs action-holds` 15 of 15 live ids named, 0 failures; `ownership.mjs action-holds tranche/T46` 0 failures.
- The J1 REPORT is settled by the CHANGE: nothing owed in `action-producers`. (My J2 COMPLETE called that report J2; it is J1.)

Size (session_01KoRoRu2gZWmcRcS7HdgM6n): test runs 10, module lines 1217

## J1 · REPORT

A flaw R14 opens in another module (`action-producers`; also the `litigation-hold` kind texts in `queue` and `queuestate`), against its R5/R11:

The litigation-hold to-do (fed by my `holdsDue`, R3, which lists a legal mark only while no hold is stated at it) has two doors: `actionhold` and `actionholdrelease`, the latter labelled "Record that no hold is needed, with a reason". Since R14, `actionHoldRelease` at a place where no hold was ever placed is refused `HOLD_NOT_IN_PLACE`. That is exactly the to-do's case, so the second door is offered and always refused, and a member can no longer record "no hold is needed" without first placing a hold. The texts in `queue` and `queuestate` ("it leaves when a member records the hold in place or released") say the same.

Not mine to change. Options as I see them: (a) drop the release door from the to-do and its texts (a hold is placed, then released); (b) give "no hold needed" its own statement in this module (a new requirement), which R3 would read as resolving the mark. My reading of N929's intent favours (a), but it is a requirement call.

Also: `holdNotInPlace`'s one fixed `detail` is re-worded to be true of a release too; its row is unchanged, and `filings` (which relays it) asserts the reason only and passes.

## J2 · COMPLETE

T46-33 complete on `job/T46/action-holds` (pushed). R14 and R15 met, each named by `t46.test.mjs`.
- R14: a release where no statement stands is refused `HOLD_NOT_IN_PLACE` through `holdNotInPlace`, asked where `HOLD_ALREADY_RELEASED` is, writing nothing, at every place; a released place still answers `HOLD_ALREADY_RELEASED`.
- R15: C-149.10 reads `refusal.MACHINE_CANNOT_SEND` by key from the new `ACTION_HOLDS_WORDS`; C-149.11 and C-149.8 keep their translations; every other row pinned unchanged.
- Read my code and tests whole (P20); no other flaw found in my module.
- action-holds 38/38. Users' suites: 11 reds, all present on the tree before my change, none naming this module. format, architecture, coverage (15/15) and ownership: 0 failures for action-holds; `checks/run.mjs` architecture 0 failures.
- One REPORT (J2): `action-producers`' litigation-hold to-do still offers `actionholdrelease`, now always refused for its case.
- The plane bundle is staled (accepted red 4). No file outside my paths.
Details in my record.

## J3 · COMPLETE · re B2

B2 applied (pushed). R14 undone: a release where no hold was placed is accepted again (R5, with its restarts); a released place is still HOLD_ALREADY_RELEASED. holdNotInPlace stays the one minter; its detail is back to the notice sentence (the only arm that answers it). R14's test removed; R5's control restored. R15 unchanged. action-holds 37/37; action-producers, filings, queue action, membership t42-hold-reach 138/138; format, architecture, coverage (15/15), ownership 0 failures. Correction: my earlier COMPLETE called the report J2; it is J1.
