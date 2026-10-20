# filings (T51)

**Status** · session_011P9WhQpNaxxpwvt6fZhKcn · depth 2 · COMPLETE · handled B8

## J1 · QUESTION

R64 reads "`minutes` the text of the entry's passage (`content`'s read of the extent)", and `actions` R108 stores `minutes: {meeting, date, passage: {captureSha, extent}}` on the received entry. `content` reads text only by a held content row's id (`passageText(contentId)`, its R46); it has no read by capture and extent, and a read of mine must not mint a row (R64 writes nothing).

My best reading: the actions job validates the extent through content (minting or finding the row) and leaves its `content_id` on `minutes.passage` as `actionRead` answers it, so I read `content.passageText(passage.content_id)` (after `content.sees` on the row's bundle), and throw when the id or the text is missing (case-inputs then answers `undetermined`). I have built it so and carry on with everything else.

If actions R108 does not leave a content id on the passage, I need either that, or a `content` read of an extent by capture. Please say which; no change is needed from you if my reading holds.

## J2 · REPORT

Strings I judged no member reads (wire grammar or identifiers), left as they are, for the design's `unkeyed` list (K3944):
- `#stamped`'s `over` (and its `what`, "the approved communication FIL-…"): the sentence inside the signed in-band block that tells a verifier how to re-hash the text (JSON.stringify of the text, as UTF-8). Hash-definition grammar for a program or counsel's verifier; changing it changes signed bytes (K1333).
- `INBAND_RULE` ("---- in-band ----"): the delimiter line a verifier splits the bytes on.
- `unfilledMarker` ("[UNFILLED: name]") and `UNFILLED_RE`: the marker `STILL_UNFILLED` and the bytes' re-reading compare by; a protocol token, not a sentence.
- `why: "no_list"` and the other string codes (`verdict`, `reason`, `source` ids such as `profile:…/venue`): identifiers.

Converted, with the English unchanged: every refusal `detail` (about 60, `filings.index.*`), the value tokens the entry names ("none declared", "undetermined", "none", ", by {office}", ", {n} not judged", "the project {p}", "the action {a}", "{n} calendar days, …", "a deadline", "a period", "days", "the counterparty"), the packet's section titles and the documenting version's part names. Six details lost a brace that `localize` cannot hold (`{{blank}}`, `[{ord, reason}]`, `{quote, reads_as, why}`, `{statement, findings?}`); they say the same in words.

Found outside my module:
1. plane (`bio-plane/src/plane/store.mjs`, line 386): `filingsOf(ctx, {…})` is handed neither `env` nor `caseInputs`, so in production R64's registration with case-inputs never happens (filings registers when handed `caseInputs`, or `env` as action-replies is, the same rule as action-replies R3). The plane needs `env` (or the host's `caseInputsOf`) passed to `filingsOf`. Tests register it (fixture `world({signing: true})`).
2. action-clocks (`count.mjs`, `whyOf`/`textOf`): its undetermined reason reaches filings as the string "[object Object]" (K3958, K3997); this is the cause of `packet.test.mjs` :241 and :290. filings now says a `{key, vars}` reason in words (`said`, `words.mjs`); both tests turn green when action-clocks' fix merges.
3. Inherited reds in modules that use filings, none caused here: escalation R12 (a civil-time reason object where a string is expected) and R30 ("What we did" capitalised), action-plans R47, action-producers R23 (date.daymonth), affordances (four: ACT_HELP keys, a local-facts rule entry).

Deferred, none. Note for the requirements: R64 says `filed` is "the approved text of the action's latest communication recorded sent"; I take the latest of the action's drafts or communications recorded sent (a filing and a communication are one id space, R23).

## J3 · COMPLETE

T51-154 applied on `job/T51/filings` (tranche/T51 merged in, B2/B3 handled), pushed.

**Entries applied**
- Words rule: the 16 findings are fixed (`node checks/words.mjs … filings`: inline 0, plain 0, testcopy 0, handlist 0, missingkey 0; 0 failures; the 13-module run names none of mine). Every refusal `detail`, the entry's value tokens and the packet's section titles read through `localize('filings.index.*' | 'filings.outward.*' | 'filings.dates.*', en)`; the handlist (t46) is assembled from the design's reads list for this module; the test copies compare with `word`/`localize`, and the sentence-holding regexes and substring checks of the tests (about 90) now compare with `word`/`localize` too (K3964). Judged unread (wire grammar): see REPORT J2.
- K4036 reds: `said` (`words.mjs`) says a `{key, vars}` reason in words (nested reasons too); `dates.mjs` uses it where it builds the business-day sentence. The two reds (`packet.test.mjs` :241 R9, :290 R30) stay red until action-clocks' fix merges (its `whyOf` hands over "[object Object]"); `t51.test.mjs` proves `said` itself.
- R64: `minutesComparisonsOn` registered once with `case-inputs.registerMinutesComparisons` (when handed `caseInputs` or `env`; the plane must hand one, REPORT J2 item 1). It reads `content.passageText(passage.content_id)` as B2 says, after `content.sees`; throws when id or text is missing. Tested on stand-ins for actions R108 and the passage's content row; re-run when actions merges.
- R65: `templatesForAction` answers `not_offered` (filing-templates `unofferedFor`, its R35, real in tests) and `court_petition`; a kind filed with a court lists nothing.
- The hold notice, counsel packet (R47, R8, R9) unchanged apart from the words.

**Tests and checks** (from the process repo)
- `node --test bio-plane/test/m/filings/`: tests 140, pass 138, fail 2 (the two reds above).
- format: 176 modules, 175 requirements files; 0 failures. architecture filings: 26 product files, 144 relative imports; 0 failures. coverage filings: 64 of 64 live requirement ids named by a test; 0 failures. ownership filings: 23 files changed; 0 failures. words filings: 0 failures. `setup-words/build.mjs --check`: stale-rows note only (new `localize` ids), none naming a refusal of mine.
- Dependents run (escalation, action-plans, plan-work, action-producers, affordances): failures all outside filings (REPORT J2 item 3); plan-work 50/50.

Size (session_01AuFZ1srU2g5cYW4DV5f15N): test runs 14, module lines 3712

## J4 · QUESTION

Five readings I have built on and carry on with; a different answer to any is a CHANGE and I redo that declaration.

1. **`resolutions` and `release` are not `[{index, …}]` (entry 1, for screens-action's START).** The arm (via action-grammar R19) takes `resolutions: [{sentence, resolution, words?}]`: `sentence` the exact text of the pointed-out sentence (an `index` is refused `ASSERTION_RESOLUTION_REFUSED`, as is any other key), `resolution` `only_asks` (with `words`, 1 to 500 characters on one line) or `breach_claim` (no `words`). `release` is `[{ord, reason}]`, `ord` the sentence's number in the record check. A phrase is flagged only when the draft states its `language` at preparation (without it the check reads "no list" and nothing is flagged). `filingapprove` declares `accepts: filing, text, release, resolutions, textcheck`, `requires: filing`. The screen that sends `index` is wrong, not the declaration.
2. **Fields an arm refuses only in some cases are accepted, not required** (a declaration cannot state a condition): `communicationprepare` `text` (required unless the purpose is `document_infraction` or `chance_to_fix`, which the record assembles) and `audience` (required for `document_infraction`); `counselpacket` `counsel` (required at governing tier 3 or undetermined); `templatesave` `project` (required when the draft rested on no determination); `filingprepare` `template` or `text` (required when the profile gives the kind no default template). Declared requires: `filingprepare` action; `communicationprepare` action, purpose; `counselpacket` action, reason; `templatesave` filing and (name or template). If you want a field required whatever the case, the screens that assemble would fail the guard falsely.
3. **`filingrecordsent` is the screens' name; the arm is `filingsent`** (`OP_ALIASES`). I declare the screens' name only, with `artifact_sha` and its camelCase twin `artifactSha`, which the arm also reads (requires filing, at, and one of account / artifact_sha / artifactSha).
4. **C75's refusal** was not made anywhere: `filing-templates` refuses a `use: file` template only for a kind whose profile tier is 3, not for an action whose own tier was raised to 3 after the draft was approved. `templateSave` now refuses it, answering `TEMPLATE_TIER3_FILE` with `filing-templates`' own row (C-115.36), for a new template with `use` file or absent and for a new version of a `file` template; `use: brief` is accepted. No new code, row or word row beyond the one `localize` detail.
5. **Descriptions are the hand rows' sentences** for the four ops whose hand row is a sentence (`communicationprepare`, `holdnoticeprepare`, `templatesave`, `filingsecondapprove`), as op-grades requires; `holdnoticeprepare`'s says "by her own hand" (op-grades' row, not mine to edit; filings R47 says the same).

## J5 · COMPLETE

FR-20 applied on `job/T51/filings` (tranche/T51 merged in; B5–B8 handled; B8 confirmed all five J4 readings). Requirement lines R66, R67, R68 written by me in `build/requirements/filings.md` (not in this record); their tests name them, so they carry no *(not yet met)* mark.

**Entries applied**
1. C71 · R66: `filingapprove` with `resolutions: [{sentence, resolution, words?}]` and `release: [{ord, reason}]` is accepted for flagged and contradicted text; controls `ASSERTION_UNRESOLVED`, `CONTRADICTED_HELD`. The screen's `index` is screens-action's defect (sent by BOB as CHANGE).
2. C75/DEC-377 · R67: not refused anywhere before; `templateSave` now answers `TEMPLATE_TIER3_FILE` (filing-templates' own row) for `use: file` of a filing whose action is governed at tier 3; `use: brief` accepted; Tier 1/2 control.
3, 4. K4168/K4202 · R68: `DECLARED_OPS` beside the ops map for `filingprepare`, `communicationprepare`, `filingapprove`, `filingrecordsent` (screens' name; arm `filingsent`), `filingsecondapprove`, `counselpacket`, `holdnoticeprepare`, `templatesave`; each held by `declaredOpHolds` in `declared-ops.test.mjs`.

**Hand rows that can now go** (op-declarations / op-grades, not mine to edit): the rows for those eight ops, wherever they hold class, weight, description or fields.

**Found in other modules**: none new. Standing from J2: plane store.mjs `filingsOf` not handed `env`/`caseInputs`; action-clocks `whyOf` "[object Object]" (the two packet reds are now green in this run).

**Tests and checks**: `node --test bio-plane/test/m/filings/`: tests 154, pass 154, fail 0. format 0 failures; architecture filings 0; coverage filings 67 of 67; ownership 4 files, 0; `checks/run.mjs`: no finding names filings (remaining failures are other modules').

Size (session_016qbXZJnFcwk8TErZNueoKY): test runs 4, module lines 3758

## J6 · COMPLETE

FR-20 complete: R66, R67, R68 written in build/requirements/filings.md; 154/154 tests; checks clean for filings. See record J5.

## J7 · COMPLETE · re B9

CHANGE B9 (K4236) applied. `filingRead` (R59) now answers the draft's stored `exhibits` and `venue_standard` (R25), as stored: the parsed columns, `exhibits: []` and `venue_standard: null` for a row stored before they existed and for a communication (which has no such columns). Code: bio-plane/src/filings/index.mjs (filingRead and its comment). Test: t51.test.mjs, "R59 R25 filingRead answers the exhibits and the venue standard...": prepare then filingread (module and op) answer the same exhibits and standard; control: a row with both columns NULL, and a communication.
Requirement line for BOB: R59's answer list gains `exhibits` and `venue_standard` (R25), as stored (K4236). The requirements file is BOB's to edit; I did not.
Deferred: none. Found in other modules: none new.
Tests and checks: `node --test bio-plane/test/m/filings/`: tests 155, pass 155, fail 0. format 0 failures; architecture filings 0; coverage filings 67 of 67; ownership 3 files, 0 failures. node_modules installed for the five lockfile directories that lacked them (K4113).
Size (session_011P9WhQpNaxxpwvt6fZhKcn): test runs 2, module lines 3759
