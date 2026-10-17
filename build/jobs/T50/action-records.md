# action-records (T50)

**Status** · session_01CuHJhi4h2Wp6LdpRTJE963 · depth 2 · WORKING · handled B1

## Record

**Entry applied** · T50-75 (R17, R18, R19), BOB's START B1. Code in `bio-plane/src/action-records/` (`index.mjs`, `schema.mjs`); tests in `bio-plane/test/m/action-records/` (`t50.test.mjs` new; `fixture.mjs`, `acts`, `records`, `instance` re-taken).

- **R17** `actionStake` / `stakeOf` (`op=actionstake`): the machine and malformed codes come from `project-roster.stakeFault({by, stake, of: "action"})`, never copied; its `project: null` field is dropped from the action's answer and `target` added. The author's `member:` prefix is stripped before `stakeFault` (it takes a member id), and an empty or machine stamp (`isMachineIdentity`, as R5 and R6 hold) is passed as no id, so `token:` stamps are refused too (`stakeFault` alone refuses only `class:`). Order: machine, `NO_TARGET`, malformed, `NO_SUCH_ACTION`. Table `action_stakes` (seq, stake, by, at), appended; `ACTION_RECORDS_TABLES` names seven, declared to purge; `set_by` is the handle read now (the founder as `membership.founderHandle()`, null while she holds none, a member with no handle row by her id).
- **R18** `noSuchAction(actionId, extra?)` is minted here, R43's body byte for byte, region `is-no-such-action`; R1 to R6 and R17 answer it in the place `NO_SUCH_BUNDLE` and `NOT_AN_ACTION` held (those two codes are no longer minted by this module). `actions` still holds its own copy until its job re-exports this one.
- **R19** `actionInquiry` (`op=actioninquiry`; the op takes `action`, `question` from the body or query, the stamps from the query): a question made through `promotion.promote` after the shape of `conformance`'s `#openInquiry` (state `open`, titled by `deriveInquiryTitle`, `project:` the action's project, one `derived_from` reference to the action noting who opened it, no `basis`), inside `record.transact` so a refused promotion spends no id. The new refusal codes are worded by key (`refusal.<CODE>`, setup-words), not by a row.
- **R15** the ops map gains `actionstake` and `actioninquiry` (eight arms); **R12** the stake joins what a machine never does.

**Deviation from the text, for BOB to rule on** · R19 says a caller not joined to the project is refused by `promotion`. Measured: `promotion.promote` creating a document that names a project accepts an invited member who has not joined (it fences by sight, and an invited participant sees the project). I added `membership.projectAuthority(project, author, "joined", "actioninquiry")` before the promotion, as `conformance` asks it, so that caller gets membership's `PROJECT_ACT_NOT_A_PARTICIPANT` (C-56.1) and nothing is written; a caller who cannot see the project is `NO_SUCH_ACTION`. Test: `t50.test.mjs`, R19 refusals.

**Deferred** · none in this module.

**Found in other modules** (also in the REPORT):
1. `action-grammar`: the C-117.2 `NO_SUCH_ACTION` row's `where` still reads `src/actions/index.mjs noSuchAction > is-no-such-action`; its one site is now `src/action-records/index.mjs noSuchAction > is-no-such-action` (R18). The census and `t45-rows.mjs` follow.
2. `action-grammar`: no row holds `MACHINE_CANNOT_OPEN_FROM_ACTION`, `ACTION_INQUIRY_NO_QUESTION` or `ACTION_NO_PROJECT`, so they carry `code` and `translation` (the words `refusal.<CODE>`, setup-words) and no `check`; if rows are wanted, they name `src/action-records/index.mjs actionInquiry > is-action-inquiry`. `MACHINE_CANNOT_SET_STAKE` and `STAKE_MALFORMED` are `project-roster`'s C-147.9 and C-147.10.
3. `actions` (T50-74): its `test/m/actions/` R36 asserts the six moved tables; `ACTION_RECORDS_TABLES` now names seven (`action_stakes`), so that test is red until its job updates it. It also holds its own `noSuchAction` copy to re-export from here.
4. `plane` (L11): `test/m/plane/t47.test.mjs` R45 counts six `action-records` arms; there are eight. Accepted red until L11. `op-declarations`, `ops-map` and the op-spec tests for `actionstake` and `actioninquiry` are L11's (T50-24, T50-18).

**Tests and checks**
- `node --test bio-plane/test/m/action-records/`: tests 30, pass 30, fail 0 (23 before; seven new in `t50.test.mjs`).
- Users' tests, compared before and after my change: `actions`, `affordances`, `plane`, `op-declarations`, `answer-envelope`, `action-holds`, `screens-action`: the only new failures are `actions` R36 and `plane` R45 above; every other failure is inherited, the same before.
- `node checks/format.mjs`: 171 modules, 170 requirements files; 0 failures. `architecture`: 3480 product files, 10804 relative imports; 0 failures. `coverage action-records`: 19 of 19 live ids named by a test; 0 failures. `ownership action-records tranche/T50`: 8 files changed; 0 failures. `node checks/run.mjs`: format and architecture 0 failures; coverage shows 29 failures in other modules (none mine); channels 0 failures.

Size (session_01CuHJhi4h2Wp6LdpRTJE963): test runs 12, module lines 1065

## J1 · REPORT

T50-75 is done on `job/T50/action-records` (record: `build/jobs/T50/action-records.md`). Items for other modules and one ruling for you:

1. Ruling for BOB (deviation, R19): `promotion.promote` does not itself refuse an invited member who has not joined the project (it fences by sight). So `actionInquiry` asks `membership.projectAuthority(project, author, "joined", "actioninquiry")` before promoting, as `conformance` does; that caller gets `PROJECT_ACT_NOT_A_PARTICIPANT` (C-56.1), nothing written. A caller who cannot see the project gets `NO_SUCH_ACTION`.
2. action-grammar: C-117.2's `where` should name `src/action-records/index.mjs noSuchAction > is-no-such-action` (R18 moved the site); census fixtures follow. No rows exist for `MACHINE_CANNOT_OPEN_FROM_ACTION`, `ACTION_INQUIRY_NO_QUESTION`, `ACTION_NO_PROJECT`: they carry `code` and `translation` (`refusal.<CODE>` by key), no `check`.
3. actions (T50-74): `test/m/actions` R36 asserts six moved tables; `ACTION_RECORDS_TABLES` now names seven (`action_stakes`), so it is red until that job updates it; `actions` keeps its own `noSuchAction` to re-export from `action-records`.
4. plane L11: `test/m/plane/t47.test.mjs` R45 counts six action-records route arms, there are eight (`actionstake`, `actioninquiry`); op-declarations, ops-map and op-spec tests for those two ops are L11's. Accepted red until L11.
