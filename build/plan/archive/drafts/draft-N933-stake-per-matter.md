**Status** · UNREVIEWED worker draft (for BOB #171, 2026-10-14; K3230, N933). Requirements draft per `requirements/README.md` and mechanics §3. Ids are each file's next free id. Every new or amended line is marked `T48` for now; §4 says why it should probably be T49.

# N933: a stake per matter (K3230, "N933: B")

Read whole for this draft: K3230; N933 (`next.md`:21); Action v0.1 rule 9; v0.2 rules 9, 13 (party participation is a Tier 2 action) and 21; `instance-setup` R11, R77; `public-read` R7, R10, R34 and its Uses; `filings` R1, R2, R22, R23, R35, R36 and its governing-tier Term; `project-roster` R21–R24, R18 and its Uses; `action-records` R5; `actions` R25, R75, R102; `case-import` R4's T46 amendment; `conformance` R32; `control-plane` R20; `record-core` R25, R83; `membership` R55, R64, R74, R84. Code read at each site: `setup.mjs` `declaredStakeSet` and `#declaredStake`, `public-read/index.mjs` `groupFields`, `filings/index.mjs` `#groupFields`, `case-import/index.mjs` `groupFieldsOf`, `control-plane/index.mjs`:185–195.

## 0. Who reads the declared stake today

| Module (layer) | Site | What N933 changes |
|---|---|---|
| `instance-setup` (L11) | R77 sets `declared_stake`; R11 reads it with its history | Nothing. The group-wide stake stays as it is (K3230). |
| `record-core` (L2) | R25, R83: the setting | Nothing. The project's stake is not a record-core setting, because settings are never purged (R25) and project settings are cleared with their project (`project-roster` R18). |
| `public-read` (L8) | R34 `groupFields`, `inbandQuartet`'s `group`, `publishedCase`'s `group_fields`; R10 | Answers the matter's stake beside the group's stake. |
| `filings` (L9) | R22, the stamp's `group`; R35, accepted findings' stake | Puts the matter's stake on the stamp and provides the preparation-time read. |
| `control-plane` (L11) | R20, the review copy's quartet | Reads the fields for the draft's project. |
| `case-import` (L8) | R4 records the source's `group_fields`. `groupFieldsOf` refuses any extra key (`not_its_shape`) | **Must** accept `matter_stake`. Otherwise every import from a source that has been upgraded loses the identity and the stake. |
| `conformance` (L9) | R32's `basis` for an accepted finding | Carries the source's matter stake. |
| `actions` (L9) | R75's accepted disclosure item; R25's block | Carries the stake through. Its read answers the action's own stake. |
| `case-inputs` (L8) | none (N933 listed it; neither its requirements nor its code read the stake) | Nothing. |

**Owners (BOB's, P17).** The **project's stake** goes to `project-roster` (L2). It already holds the project settings, scope (R21) and second approval (R24), as append-only histories that each project's participants can read. The **action's own stake** goes to `action-records` (L9). It already holds the members' side records of an action, such as the confidential scope (R5), and `actions` reads them into the action's block. **Which stake shows, the stamp, and the higher-stakes read** go to `filings`, which owns the governing tier and the stamp. The order holds: 35 < 105 < 121 < 122 < 127 < 162.

## 1. project-roster (L2, 35): the project's stake

- **R29** (T49; N933; Action rule 9; v0.2 rule 21; D28 (d); K3230) `projectStakeSet({projectId, stake, by, viewer})` (`op=projectstakeset`) records the project's declared stake. This is the group's own words on what it has at stake in this matter beyond its usual stake (`instance-setup` R77). It is shown beside the group's stake, never in its place, only on what is sent or published for this project. After the sight answer (R19: a project the caller cannot see answers as an id that names nothing), the refusals are, in order, each writing nothing: `MACHINE_CANNOT_SET_STAKE` (a machine credential or an unstamped `by`); `PROJECT_ACT_NOT_A_PARTICIPANT` (`membership.projectAuthority(projectId, by, "joined", …)`, its R55), unless `by` is an administrator (`membership.isAdministrator`, its R64) at `FULL` sight (`membership` R43); `STAKE_MALFORMED`, when `stake` is neither `null` nor trimmed text of 1 to 1,000 characters on one line with no control characters (R77's rule; a new row of C-147, numbered at the job's START). `stake: null` clears it. Each set appends `{stake, by, at}`, so each change is dated and attributed. The latest entry is the project's stake; a project with no entry, or whose latest entry is `null`, has none. A change applies to what is sent or published after it and changes nothing already signed, sent or published. *(not yet met: T49)*
  - Tests: a joined participant's set and an administrator's set are each read back by R30 with `by` and `at`. Control: a member who is invited but not joined is refused `PROJECT_ACT_NOT_A_PARTICIPANT` and nothing is written. A machine credential is refused. A stake of 1,001 characters, or one with a line break, is refused `STAKE_MALFORMED`. `null` clears it and R30 answers `stake: null`.
- **R30** (T49; N933; K3230) `projectStake(projectId)` answers `{stake, set_by, set_at, history}`, with `history` oldest first (R77/R11's form). A project with no record, and an id that names no project, answer `{stake: null, set_by: null, set_at: null, history: []}`. A record that cannot be read answers `stake: "undetermined"`, never `null`. It asks no viewer, because like R23 it states only the setting and its callers gate by sight. It writes nothing and never throws. Every participant reads the history through `projectStakeHistory({projectId, viewer})` (`op=projectstake`), as R8 reads visibility. *(not yet met: T49)*
  - Test: two sets and a clear answer three history rows, and `stake: null`. Control: an unreadable row answers `"undetermined"`.
- R18, amended (T49; N933): the stake records (R29) are keyed by project and cleared with it. *(not yet met: T49)*
- Uses: `membership.projectAuthority` (R55) and `isAdministrator` (R64), both existing uses. No new edge.

## 2. action-records (L9, 121): an action's own stake

- **R17** (T49; N933; Action rule 9; v0.2 rule 21; D28 (d); K3230) `actionStake({target, stake, author, viewer})` (`op=actionstake`): a member who may see the action states its own stake. The default matter is the action's project; an action may state its own stake (K3230, BOB's detail). The refusals are, in order, each writing nothing: `MACHINE_CANNOT_SET_STAKE`; `NO_TARGET`; `STAKE_MALFORMED` (`project-roster` R29's rule); `NO_SUCH_BUNDLE` (absent or invisible, one answer); `NOT_AN_ACTION`. `stake: null` clears it, and the action falls back to its project's stake. Each statement is appended `{stake, by, at}`, so it is dated and attributed. `stakeOf(id)` answers `{stake, set_by, set_at, history}` (history oldest first; `stake: null` when there is none; `"undetermined"` when unreadable). It is declared to purge with the action (R11's keying). *(not yet met: T49)*
  - Tests: a member's statement is read back with `by` and `at`. Clearing it answers `stake: null` and keeps the history. Control: a machine credential is refused and nothing is written. A stake of 1,001 characters is refused `STAKE_MALFORMED`.

## 3. actions (L9, 122): the block carries it

- **R105** (T49; N933; amends R25, R102, R75) `actionRead` answers `own_stake`, which is `action-records.stakeOf` (its R17). Every R75 `accepted` disclosure item also carries `matter_stake`, the source's stake for that matter as `conformance` R32 answers it (`null` when none is recorded). Nothing else in the block changes. *(not yet met: T49)*
  - Test: an action with a stated stake answers it. Control: an action without one answers `own_stake.stake: null`.

## 4. public-read (L8, 105): the matter's stake beside the group's

- **R36** (T49; N933; amends R34, R10; v0.2 rule 21; D28 (d); K3230) `groupFields({project?})` also answers `matter_stake`. With a `project` given, it is `project-roster.projectStake(project)` (its R30) as `{stake, set_by, set_at, source: "project"}`. With no `project`, or a project with no stake set, it is `null`. When it is unreadable, `stake` is `"undetermined"`, never `null`. The group's `stake` is unchanged and sits beside it. `matter_stake` never replaces `stake`, and a group with no group-wide stake still answers `stake: null`. `inbandQuartet`'s `group` is answered as given, `matter_stake` included, and stays outside `hash`. `publishedCase`'s `group_fields` is read with the case's project (the case bundle's `project`, `record-core` R34's `bundleInfo`), labelled current as R34 says. R10's exception adds the one read `projectStake`. It writes nothing and never throws. *(not yet met: T49)*
  - Tests: a project with a stake answers it, and the group's stake is unchanged. Control: the same call with no project answers `matter_stake: null`. Two stamps over the same subject, with and without a matter stake, answer the same `hash`.
- Uses: `project-roster.projectStake` (its R30). A new `modules.json` edge (105 → 35).

## 5. filings (L9, 127): which stake shows, the stamp, the prompt's data

- **R60** (T49; N933; Action rule 9; v0.2 rules 13, 21; D28 (d); K3230) **The matter's stake.** For an action, the stake shown is its own (`actions` R105's `own_stake`) when one is set. Otherwise it is its project's (`public-read.groupFields({project})`'s `matter_stake`). Otherwise there is none. It is answered `{stake, set_by, set_at, source: "action" | "project"}` or `null`. An unreadable source answers `"undetermined"`, never the other source and never `null`. This module is the only site of that rule. *(not yet met: T49)*
  - Test: with both set, the action's stake shows. After the action's stake is cleared, the project's shows. With neither set, it answers `null`. Control: an unreadable action stake answers `"undetermined"`, not the project's.
- **R61** (T49; N933; amends R22, R36) The stamp's `group` is `groupFields({project})` for the action's project, with `matter_stake` set to R60's answer, read at approval (R6). It is carried on approved filings, counsel packets and communications, beside the group's `stake` and never replacing it. A joint text's body fingerprint (R36) is still computed without these fields. *(not yet met: T49)*
  - Test: an approved communication carries both stakes. Control: an action in a project with no stake, and with none of its own, carries `matter_stake: null` and the group's stake unchanged.
- **R62** (T49; N933; K3230; v0.2 rule 13; D28's guards inform and never block) `stakeAtPreparation({action, viewer})` (`op=stakeatpreparation`) answers the data that the preparation screen's question reads (UX-DESIGN, B191): `{higher_stakes, governing_tier, group_stake, matter_stake, project}`. `higher_stakes` is true when the governing tier (Terms) is 2 or 3, or is undetermined, since an undetermined tier is never read as Tier 1. Party participation is a Tier 2 kind (`jurisdictions` R85). `group_stake` is `groupFields().stake`, and `matter_stake` is R60's answer. The refusal is `NO_SUCH_ACTION`, as R1 gives it. It writes nothing. No prepare, approval or sending is refused, delayed or changed by its answer or by the member's response. The member answers the question by R29's or R17's act, or does nothing. *(not yet met: T49)*
  - Tests: a Tier 2 `party_participation` action answers `higher_stakes: true`, and so does an undetermined tier. Control: a Tier 1 action answers `false`, and `filingPrepare` on a Tier 2 action with no matter stake set lands unchanged.
- **R63** (T49; N933; amends R35) An accepted-findings line also prints the source's matter stake when `actions` R75's item carries one. When it carries none, nothing is added. *(not yet met: T49)*
- Uses: none new (`actions`, `public-read` and `project-roster` are existing edges).

## 6. case-import (L8, 111) and conformance (L9, 118): another group's matter stake

- **case-import R25** (T49; N933; amends R4's T46 amendment) `groupFields` given at import may also carry `matter_stake`, in `public-read` R36's shape or `null`. It is recorded and answered with the other fields. An absent `matter_stake` (a source before T48) reads `null` and is not a fault. A malformed one is recorded as `null` with a sentence saying why, and never makes the other fields unrecorded. The import is never refused for it. *(not yet met: T49)*
  - Test: fields with `matter_stake` are recorded and read back. Control: R4's fields without it are still recorded whole.
- **conformance R41** (T49; N933; amends R32) An accepted finding's `basis` also answers `matter_stake`, as `case-import.importedCase` records it (`null` when none, `"undetermined"` where R32 already answers the stake as `"undetermined"`). *(not yet met: T49)*

## 7. control-plane (L11, 162)

- **R95** (T49; N933; amends R20) The review copy's `group` is `groupFields({project})` for the draft's project, so it carries that project's stake beside the group's. *(not yet met: T49)* Control: the same draft with and without a project stake answers the same `hash`.

## 8. Layers and T48 (`current.md`)

| Module | Layer | Layer started in T48? | Entry joins |
|---|---|---|---|
| project-roster | L2 | yes, and closed (K3220) | T49 |
| public-read, case-import | L8 | no (T48-40, T48-42 not started) | T48 or T49 |
| action-records, actions, filings, conformance | L9 | no | T48 or T49 |
| control-plane | L11 | no | T48 or T49 |

Other L11 rows the new ops need: `op-declarations` (`projectstakeset`, `projectstake`, `actionstake`, `stakeatpreparation`), `op-grades` (`reversible`, as `declaredstakeset`), `setup-words`/`affordances` (act help), and `screens-action` (the question, after UX-DESIGN answers B191).

## 9. Open points for BOB (none is Bob's)

1. **Tranche.** The project's stake is in L2, which is closed. Every later part reads it. *Recommend* that all of N933 joins T49 together. The alternative is to ship the action's own stake alone in T48, which would show a partial rule.
2. **An action clearing to "none".** `null` falls back to the project's stake, so an action cannot remove a matter stake its project declared. *Recommend* keeping it that way. A disclosure is never suppressed below what was declared for the matter, and K3230 asks for no "none" for an action.
3. **A published case's matter** is taken from the case bundle's project (`bundleInfo`). *Recommend* confirming at START that a published case has exactly one project. If it does not, answer `matter_stake: null` with a sentence, never a guess.
4. **Who may set the action's stake** is any member who may see the action, matching R5's scope. The project's stake needs a joined participant or an administrator, per K3230's "administrator or the member preparing". *Recommend* as drafted.
5. **The question is never recorded** (asked or answered). *Recommend* not recording it. D28's guards inform, and a member's later R29/R17 act is the record.
6. **The C-147 row for `STAKE_MALFORMED`** and `MACHINE_CANNOT_SET_STAKE`'s row in action-records' family are numbered at START (rule 5).
