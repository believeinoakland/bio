# public-read (T45)

**Status** · session_01WS4XsL2gbzA2YsxsAb1DTg · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Readings of R34 I am building on (carrying on meanwhile; none blocks me):
1. `name`: instance-setup R10's `groupIdentityPublic` answers `display_name`, not `name`. I read R34's "`name` … exactly what the source answers" as `name` = the source's `display_name` (a source answering `name` instead is read as `name`).
2. `detail` when a source answers but records no slug: the source's own stated absence (instance-setup R10's `detail`) is carried in `detail`; the four fields are the source's nulls. "Undetermined" is said only for no source / a throw / no object.
3. My own Worker call sites of `inbandQuartet` (the case container and case file manifests in `assembleCaseContainer`, whose quartet goes only into op=ratify's answer) pass no `group`, so answer `group: null`: the fields live in the store and R34 names `filings` R22 as the caller that passes them; the published case carries them as `group_fields` at the read. Say if you want the assembly to read them through a store hop.
4. No `groupFields` op: R34 names none; `filings` (and `case-import`, reconciliation R7) reach it in-process through `publicReadOf`.
5. The plan's reconciliation R8 lists "-19" among the counsel-matter folds (T45-4, -18, -19, -21); my requirements carry no such line and my entry names none, so I build none (I read "-19" as meant for -17 publication or -20 case-account).

## J2 · COMPLETE

**T45-19 applied on `job/T45/public-read`.** R34 and R10's amendment built; readings (1)–(4) of J1 as BOB confirmed them (B2, K2829).

**How the reading set was read (mechanics §17; START B1):** read whole by me: `build/requirements/public-read.md`; all module code (`src/public-read/*.mjs`, `src/publication/worker.mjs`, `src/container.mjs`, `src/inband.mjs`); the plan's T45-19 entry, rules at the opening, reconciliation R7–R12; record-core R25; instance-setup R10, R11, R77; `BIO_Action_v0_2.md` rules 14, 21; the layer-8 contract. Two helpers in this session read the rest in full and wrote digests citing sections: (a) the public parts of all eight used modules, plus filings, case-import, conformance, instance-setup and the reconciliation; (b) every test file under `test/m/public-read/` (38 files), against the requirements. My tests: I read `fixture.mjs`, `credit.test.mjs` and `worker.test.mjs`'s R7 arm myself; helper (b) read the rest.

**Entries applied (T45-19)**
- `registerGroupIdentity({identity})`: one source, taken once. A second registration is `PROVIDER_DECLARED`, one without the door is `PROVIDER_MALFORMED`, and neither registers anything.
- `groupFields()`, synchronous, no credential, no viewer: `{group, name, domain, domain_verified_at, stake, detail}`.
  - `name` is the source's `display_name`.
  - No source, a throw, or no object (a promise counts as none): all four identity fields null, with `GROUP_IDENTITY_UNDETERMINED_SENTENCE`.
  - A source that records no slug: its own stated absence is carried.
  - `stake` comes from `getSetting("declared_stake")`: null with `STAKE_NONE_SENTENCE` when unset; `"undetermined"` with `STAKE_UNDETERMINED_SENTENCE` when it throws or no record-core is reached. record-core is reached lazily (`deps.record`, default `recordOf(host)`).
  - It reads nothing else, writes nothing, and never throws, even on an answer whose fields throw when read (found by helper (b), fixed in eb01fa1's follow-up).
- `inbandQuartet({..., group})` answers `group` unchanged, null when none is given. It sits beside `hash`, never inside it, and the format stays `bio-inband/1`.
- `publishedCase` answers `group_fields: {...groupFields(), current: true}` and `group_fields_detail` (`GROUP_FIELDS_CURRENT_SENTENCE`), on both the case and the loose branches. These are never in the signed document or the case file.
- Tests: `group-fields.test.mjs`, 7 tests naming R34, R10, R7, R3, R13 and R23, each with a negative control.

**Deferred, with why**
- R5's "64 lowercase hex, else the required-argument refusal": the Worker and the store lowercase upper-case hex instead of refusing it, and existing tests pin that (convert-publishedcase:354, convert-caseflip:117/136, door:58). Changing the behaviour changes what every caller is answered, so I leave it to BOB: reword R5, or change it in a later job.
- Test-depth gaps helper (b) found in older arms. They are samples, not full compliance:
  - R15 and R30 check store-side answers only.
  - R29 checks `casefilefacts`, not the built case file.
  - R27 and R22's "never live" have no spy or live-change control.
  - R13's third case (a citation version before `/4`) is untested.
  - R19 tests only `/4` among the non-`/5` formats.
  - convert-publishedcase:135's message says `/4` over a `/5` fixture.
  None is a failing behaviour, and all are outside T45-19's entry. Worth a later public-read job.

**Found in other modules (REPORT to BOB)**
1. **case-import / conformance (T45-23) vs R34.** Conformance R32 and the reconciliation's R7 row read the source group's identity and stake "over the imported edition's stamp", with `stake: undetermined` only for editions before T45. But R34 keeps the fields out of the case file's bytes (R23), and the case file and container manifest quartets carry `group: null` (J1 (3), confirmed). So a post-T45 imported edition carries no source stake either. Either case-import reads it some other way (for example the source's `publishedCase` `group_fields` at import, current, not signed), or the reconciliation's wording changes. BOB's to decide before T45-23.
2. **No one registers the identity source.** R34 says `instance-setup` fills it. But instance-setup's requirements have no line making the call and no `public-read` Uses edge, and plane T45-47's registration list omits it. Until one is added, the production identity reads undetermined.
3. **record-core R25:** `getSetting` answers null for a stored value that is not valid JSON, so `groupFields` can only read such a corrupt stake as "none declared", not "undetermined" (R34). The fix is record-core's: distinguish unreadable from unset, for example by throwing. It is low-likelihood, since `setSetting` writes JSON.
4. **filings R46** puts `embargo_until` and `release_at` "in its stamp (R22)", but R7 and R34 define no such fields. filings' job will need them as `subject` content or a requirement change.
5. **control-plane R20's review copy** calls `inbandQuartet` without `group`, so it answers `group: null`. Rule 21 ("everything the group sends") may want it passed; that is control-plane's (L11).

**Tests and checks**
- public-read: 165 pass, 0 fail.
- Users:
  - network-notices: 73/0.
  - ratification: 233/0.
  - case-checker: 77/0.
  - filings: 69/1, rule 4 (7), "R9 the six sections".
  - op-declarations: 132/1, rule 4 (12), t33 "R19, R6".
  - answer-envelope: 31/0.
  - control-plane: 220/3, R2 ×2 and R53. All three are identical on `origin/tranche/T45` without my change, so they are not mine.
  - plane (with migrate-released): 194/2, rule 4 (11) compose "R11, R5" and rule 4 (9) roster "R5, R9".
- format: 153 modules, 152 requirements files; 0 failures.
- architecture public-read: 48 product files, 168 relative imports; 0 failures.
- coverage public-read: 34 of 34 live requirement ids named by a test; 0 failures.
- ownership public-read tranche/T45: 4 files changed; 0 failures.

Size (session_01WS4XsL2gbzA2YsxsAb1DTg): test runs 15, module lines 3648

## J3 · REPORT

Correction to J2's test line: plane is 194 pass / 2 fail (rule 4 (11), (9)) on its own; `test/system/migrate-released.test.mjs` was run separately after the batch run hit its time limit: 1 pass, 0 fail. Nothing else changes.
