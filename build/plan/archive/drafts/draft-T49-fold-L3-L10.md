# T49's fold, L3 to L10: the requirement lines (draft)

**Status** · A worker's draft for BOB #177 (2026-10-14), on `tranche/T49`. Not folded: BOB reviews it and writes the lines into the requirement files at the fold (P5). Sources: `current.md` T49-5, T49-6, T49-8, T49-9, T49-10, T49-12 and its rules; `draft-T49-walk.md` D4, D5, D6, D17; each module's requirements read whole; the code at the lines each entry cites, read on `tranche/T49`. Ids were checked against each file's highest id, retired ids included (README 5, 6).

| module | highest id in the file | ids taken here |
|---|---|---|
| capture | R90 (retired ids are lower) | R91 |
| reading-pipeline | R31 (R83, R90, R104 named there are other modules' ids) | R32 |
| ai-runs | R79 (R80, R81, R83 named there are `agent-worker`'s and `membership`'s) | R80, R81 |
| agent-worker | R87 | R88, R89 |
| case-inputs | R18 | none (R18 amended) |
| scheduler | none taken | none (R12 is re-scoped only through BOB, P9) |

---

## 1. capture (T49-5)

**New line.** Place it after R88, in `heldCaptures`' group.

- **R91** (T49; N1080; K3295; K3324 (1); amends R77, R78, R88) **A page of held captures in bounded time.** For one page, `heldCaptures` (R77, R88) asks R78's registered examination at most once for each document the page shows. A document is shown as a row or as a file beside its archive. It also asks for the archive grouping (DEC-167 (8)) at most once for each document that is a row. Both are asked for the whole page under one wait of `HELD_PAGE_WAIT_MS`, a constant this module exports. Its value is set from M-T49-3 at this job's START and recorded by BOB. Nothing is asked again for each row in turn, and nothing waits without a bound. An answer that is not given within the wait is undetermined:
  - a row's or a file's eligibility reads `eligible: null` with `eligibility_basis`, a sentence saying the examination did not answer in time (R78);
  - a row whose archive grouping did not answer in time carries `archive: {sha256, grouping: null}` and `files: null`, with `files_basis`, a sentence saying that the files beside the archive are undetermined. Its files are neither dropped from the list without being named, nor counted as listed.

  Everything else in the answer is unchanged: the rows, their order, `limit`, `truncated`, `next` and every other field of R77 and R88. *(not yet met: T49)*
  - Tests: at the plane's shape (M-T49-3), the walk's unfiltered `heldcaptures` answers within the bound the test states, with the time per row stated in the test. An examination that never settles leaves each row `eligible: null` with its basis, and the answer still comes within `HELD_PAGE_WAIT_MS`. An archive listing that never settles leaves that row `files: null` with `files_basis`. Controls: an examination that answers in time gives R78's `true` or `false` as today. The examination is called once for each shown document per page, counted at the registered reader.

**R78: its text changes.** As written, R78 names only three outcomes, so R91's fourth outcome needs a sentence. Replacement text:

- **R78** A later module may register, once at start, the batch-release examination of one document (`ratification` R34). R77 answers each row `eligible: true`, or `eligible: false` with the class it fails first and that class's reason (crucial, or contested: any open contradiction touching the document). With none registered, each row reads `eligible: null`, stated undetermined. A registered examination that throws, answers neither, or does not answer within R91's wait reads the same way, with a basis saying which. (DEC-97 (3); K1019; T49, R91) *(not yet met: T49)*

**R77 and R88: their text does not change.** Both still hold. R91 says what happens to the grouping on a timeout. The Suggestion "T35 (T35-22) … R77 asks `acquisition.memberOf` once per page" stays true.

**Tests only, with no line (the entry's other parts):**
- (N1062, K3227) `evidence-absent.test.mjs`:77, the source scan for `NOT_FOUND`, is replaced by an interface test. Every path that answers an absent piece of evidence answers R63's one refusal, with its row: R21's get, `op=capture`, R68 `reattest`, and `extraction` R31 through `evidenceAbsent`. The scan is then deleted. R63's text stands.
- (N1073) `knocker.test.mjs`:240 reads `doorbell`'s rows and drops its hand-list.

**START must say, beyond the entry:**
1. Measure M-T49-3 first: `heldcaptures`' time per row at the plane's shape, unfiltered, split between `#eligibility` and `#archiveRow`. `#archiveRow` calls `archiveList` once for every capture that every row registers, and an unopened capture is read from evidence to be profiled (`acquisition/unpack.mjs`:757–764). Then propose `HELD_PAGE_WAIT_MS` to BOB.
2. Inherited reds: coverage on R91 and R78 (rule 5 (1)); the plane bundle staled by the merge (5 (5)); legacy-ui (5 (4)). None of rule 5 (7)'s reds is capture's. Do the rule 6 items and the `admin` grep at START.

---

## 2. reading-pipeline (T49-6)

**New line.** Place it after R2, under `read`.

- **R32** (T49; D6 **B**; K3324 (1); amends R1, R15) **Text units for a capture read as text.** A capture read as text (R1: a textual type, a single part, within the profile's text bound) that no format entry reads (R2: no entry with `text` or `structure`, as with an HTML page or plain text) still has text units, as R15 states them.
  - The units come from the decoded text.
  - Each paragraph that holds a glyph is one unit `{extent: {kind: "doc-para", para, run: null}, seq, text}`. A paragraph is a run of text between blank lines. `para` counts from 0 in the order of the text, and `seq` is the unit's position.
  - For an HTML page, the text is the page's visible text: markup is removed, `script` and `style` contents are dropped, and character references are decoded.
  - R15's wire bound, unit cap, `truncated` and named gaps apply unchanged.

  R1's reading is otherwise unchanged (its `content_type`, `entities`, `facts` and `position_why`). Its text counts (R17) and provenance (R14) stay over exactly the text its reader was handed. No format-registry entry is added, and this module is the one site where this happens. A capture whose text yields no glyph has no unit list, and a capture not read as text has none, as before. *(not yet met: T49)*
  - Tests: an HTML capture and a plain-text capture each answer `text_units`, one `doc-para` unit per paragraph. The HTML capture's units hold no tag, attribute, script or style text. Through `extraction` (`extraction/index.mjs`:727, unchanged) the capture's `capture_text` holds its words, and Find reaches them. Controls: a capture read as text with no glyph answers no `text_units`. A capture not read as text (multipart, or over the bound) answers none. A PDF and an office capture answer byte for byte as before (R2). PDF text through `pdf-worker` is checked live (M-T49-6).

**R1: its text does not change.** R1 states what the reading holds, and the units travel beside the reading in `read`'s answer. R32 adds to R1 without contradicting it.

**R2: its text does not change.** R2 governs an entry that reads the format, and R32 governs a format that no entry reads. The plan's "amending R2" is only a cross-reference.

**R15: its text does not change.** Its "one per … paragraph" already covers `doc-para`. R32 cites R15 rather than amend it.

**Test only, with no line:** (N1065, K3239) R22's "no place named" is proven over the module's whole outward text. Every string `read` and R23's pieces can emit is checked against `jurisdictions`' full place list, replacing `read.test.mjs`'s two-name sample. R22's text stands.

**START must say, beyond the entry:**
1. Measure first which captures reach R1's branch today: `profiled_from_text: true`, a single part, and a format entry with neither `text` nor `structure` (`formats.mjs`:152–174: `html` has both null). Measure also how many of the walk's HTML and plain-text captures exceed the profile's text bound. Those take R1's "not read as text" branch and get no units.
2. Inherited reds: coverage on R32 (rule 5 (1)); the plane bundle (5 (5)). The PDF check M-T49-6 is BOB's live check at biosmoke8, not this job's. Do the rule 6 items at START.

---

## 3. ai-runs (T49-8)

**New lines.** Place them after R79.

- **R80** (T49; D4 **B**; K3324 (3): BOB's reading of K2892, that a member's own account covers her own API key, K1755; amends R18) **A member's own run on her own API key.** `dispatchMemberRun({run, by, at})` (R18) dispatches a run she opened, at her own act, when `ai-accounts.accountFor` answers her act with her own reference (`kind: "apikey"`, `level: "member"`), exactly as it dispatches her own sign-in (`kind: "signin"`, `level: "member"`).
  - The segment carries that account on `agent-worker` R6's wire (`{kind: "apikey", level: "member", secret, member: "member:<her id>", suggestions}`) with the credential minted for the segment, as R18's T47 clause states.
  - Her `principal_claude` (the paying owner, R52) must still be `member:<her id>`.
  - Every other account is still withheld `MEMBER_PRINCIPAL_RUN`, nothing sent: the group's key, a project's account (`apikey` or `signin`), or one whose owner is not the run's `principal_claude`.
  - Every other refusal of R18 stands: `AI_RUN_NOT_PRINCIPAL` for another member's `by`, the status, `MEMBER_RUN_MODE_NOT_ADMITTED`, `AGENT_WORKER_UNBOUND`, `NAMESPACE_UNDETERMINED`, the mint's refusals and `CREDENTIAL_RECORD_SILENT`.
  - So do the 30 s wait, the wake's withholding of every member's run (R16), and `ai-use`'s check (R52).

  *(not yet met: T49)*
  - Tests: a `check` run and a `plan` run, each opened by a member whose own reference serves her, are dispatched at her act once to the stub `AGENT_WORKER` with `account.kind` `apikey`, `level` `member`, her `member` and her key as `secret`. The key appears in no answer, log or record. Controls: the same member served by the group's key is withheld `MEMBER_PRINCIPAL_RUN`, with no call counted. Another member's `by` is refused `AI_RUN_NOT_PRINCIPAL`, with no call counted. The wake leaves her API-key run withheld.

**R18: its text changes.** Its T46 clause says that only her own sign-in is dispatched. Replace these two sentences:

> "an account other than her own sign-in (the group's key or a project's account included) is still withheld `MEMBER_PRINCIPAL_RUN`. Only a run whose mode is `check` or `plan` is so dispatched (Bob's, K2892); a run of any other mode on her own sign-in is withheld `MEMBER_RUN_MODE_NOT_ADMITTED`, …"

with these:

> "an account other than her own (her own sign-in, or since T49 her own reference, R80) is still withheld `MEMBER_PRINCIPAL_RUN`: the group's key and a project's account included. Only a run whose mode is `check` or `plan` is so dispatched (Bob's, K2892); a run of any other mode on her own account is withheld `MEMBER_RUN_MODE_NOT_ADMITTED`, …"

In the same clause, the phrase "whose act `ai-accounts.accountFor` answers with her own sign-in (`{kind: "signin", level: "member", member}` …)" gains "or, since T49, her own reference (R80)". Mark the amended clause *(not yet met: T49)*. The member-facing detail of `MEMBER_RUN_MODE_NOT_ADMITTED` ("on a member's own sign-in …", `index.mjs`:2199) becomes "on a member's own account …", a wording change made inside this job (R54's discipline).

- **R81** (T49; D5 **B**; amends R9, R11 and R13's relay of `run-rules` R6) **The project gate reads the actor as participation is keyed.** On `open`, `tick` and `close`, the facts handed to `run-rules` R6 (`projectsJoined`) are asked of `membership.participation` with the actor's member id. The actor can be given in any of three forms: `member:<id>`, `member:<id>/<tokenId>` or `<id>`. All three are asked as `<id>` and answer alike.
  - An actor that names no member (a machine identity, a `class:` or `token:` stamp) is judged exactly as today. It is never read as an absent actor, so it never passes as `NO_MEMBER_BEHIND_CALLER`.
  - An empty actor still passes unapplied, as R6 states.

  So a project's joined participant who opens a planning run through `action-plans`' `planAsk` opens it. (`planAsk` passes the stamped author, `member:<id>`. The door stamps the bare id for these three verbs, `control-plane/index.mjs`:2450–2453.) *(not yet met: T49)*
  - Tests: a project's owner and a joined member each open a `plan` run through `planAsk`, with actor `member:<id>`, and each opens. The same actor as `<id>` and as `member:<id>/<tokenId>` opens too, and a `tick` with the `member:<id>` form passes the gate. Controls: a member who has not joined (invited only, or uninvited) is refused `AI_RUN_NOT_PROJECT_MEMBER` in every form. A `class:ai/<tokenId>` actor over a project context is refused as today, not passed unapplied.

**R9, R11 and R13: their text does not change.** Each still names "`run-rules` R6 over the run's context". R81 says how the facts it needs are read.

**R47: no amendment.** The plan's "amending R47's gate" names the wrong gate. R47 is the open check registered for mode `plan` (`action-plans` R30's `planRunCheck`). It already folds the actor through `membership.projectAuthority` → `positionalMember`, so it passes. The refusal in D5 comes from the DEC-63 project gate (`#aiRunProjectGate`, `index.mjs`:806–820, relaying `run-rules` R6).

**Test only, with no line:** (N1073) `rows.test.mjs`:12 reads `run-rules`' rows.

**START must say, beyond the entry:**
1. Measure M-T49-8 first: log the actor `#aiRunProjectGate` receives from `planask`, and the `member_id` held in `project_participants` for its owner and a joined member. Measure also whether a member's own reference reaches `#dispatchAccount` with `principal_claude` `member:<id>`, i.e. whether the run was opened while her reference served her.
2. Inherited reds: coverage on R80, R81 and amended R18 (rule 5 (1)); the plane bundle (5 (5)). agent-worker's REC100 reds (5 (7) (A)) are not this module's, and T49-9 depends on this job, so it merges first in L6. Do the rule 6 items and the `admin` grep at START.

---

## 4. agent-worker (T49-9)

**New lines.**

- **R88** (T49; D4 **B**, its half; K3324 (3); `ai-runs` R80; amends R5, R10; **only if M-T49-7, measured at this job's START, finds it refused today**) `POST /run` takes a run that a member opened and that `ai-runs` R80 dispatches on her own API key:
  - R5 admits the credential that dispatch carries for her principal;
  - the arrived account is her own reference (`kind` `apikey`, `level` `member`, R6), with `member` her id;
  - R10's recorded payer (`session.principal.ref`) is that member.

  Every other refusal of R1–R11 stands. If M-T49-7 finds that `/run` already takes it, nothing here changes, and this requirement is met by the tests that show it (as R80 was under M-T46-4). Place it after R80. *(not yet met: T49)*
  - Tests: a member's own API-key run, dispatched as `ai-runs` R80 sends it, runs a segment through `agent-model` with `{kind: "apikey", key}` and calls the plane back under the minted credential. Control: the same run carrying another member's account is refused `RUN_NAMES_A_DIFFERENT_PAYER`.
  - **The M-T49-7 condition.** On the code as read, R6 already accepts `apikey` at `level` `member`, R10 compares `principal.ref` with the wire's `member`, R57 names her own reference, and R80's sign-in path uses the same minted credential shape. So the measure is expected to find R88 met. In that case R88 is written as met at the fold that closes T49-9 and needs no code. If the measure finds a refusal, the job fixes only that refusal, and R5's and R10's own text stays.

- **R89** (T49; D17 **M**; K3268; amends R54, its "composes an answer in `answers`' contract") **The answer tool asks for the whole contract.** In the composing conversation of `/ask`, the `answer` tool's `input_schema` names exactly `answers.ANSWER_FIELDS` (`answers` Provides, its R3) as its `properties`, in that order, and all of them as `required`. They are read from that export, never listed by hand. `label`'s schema reads `answers.ANSWER_LABEL` in the same way. So a model's answer is not refused `ANSWER_MALFORMED` for a field it was never asked for. Whatever passes still passes through `checkAnswer` (R54) unchanged. Place it after R55. *(not yet met: T49)*
  - Tests: the tool's `required` deep-equals `ANSWER_FIELDS`, and its `properties` keys equal it in order. A field added to `ANSWER_FIELDS` in a test double appears in both. Control: a model answer missing one field is refused by the plane's check (`ANSWER_MALFORMED` naming the field), and nothing of it reaches the member.

**R5, R10 and R55: their text does not change.** R55 is the ask's op reach (`ASK_OPS`). It says nothing about the tool set, and no line of this file describes the answer tool's schema. The plan's "amending R55's tool set" therefore points at a line that holds no such text. R89 amends R54 instead, which is where "an answer in `answers`' contract" is stated.

**Tests only, with no line:** (N1073) the four hand-lists, `harness:128`, `plan:293`, `requirements:1369` and `t36:94`, read `ai-runs`', `capture`'s and `action-plans`' declarations. The REC100-1b/2/2b reds stay accepted until T49-29.

**START must say, beyond the entry:**
1. Measure M-T49-7 first: whether `/run` admits a member's own API-key run today, driven as `ai-runs` R80 dispatches it. Then check doubt 11: whether the model address is configurable for journey-check's own fake model. If it is not, a one-line requirement joins this job at START, through BOB. Confirm that importing `ANSWER_FIELDS` from `answers`' public entry does not pull the plane's store code into the Worker bundle. If it would, read `answers/check.mjs`'s export, which is named in `answers`' Provides by rule 7.
2. Inherited reds: `harness.test.mjs` REC100-1b/2/2b (rule 5 (7) (A)), untouched until T49-29; coverage on R88 and R89 (5 (1)). Do the rule 6 items and the `admin` grep at START.

---

## 5. case-inputs (T49-10)

**R18: its text changes (BOB's "by key" edit).** Replace its third bullet:

> "For a row answering `quotable: false`, `openRequestLine` (R10, R17) also answers `quoting: {key: "signing.openrequest.noquote", says}`, filled with `{whom}`. The words are read by key from `words.json` once the design stream gives the key (an ASK to UX-DESIGN). Until then `key` is null and `says` is BOB's plain sentence, "{whom}'s reply asks not to be quoted.", as `case-authoring` R34 kept its sentences until given."

with:

> "For a row answering `quotable: false`, `openRequestLine` (R10, R17) also answers `quoting: {key: "signing.openrequest.noquote", says}`, `says` read by key from `words.json` through `CASE_INPUTS_WORDS` (R10) and filled with `{whom}`, never a copy (T49; N1076; K3321 (B); the key given by DEC-232). *(not yet met: T49)*"

The Status line gains: "T49 (T49-10: R18 amended, the no-quotation line read by key; N1076)." The constant `OPEN_REQUEST_NOQUOTE_PLAIN` (`case-inputs/index.mjs`:131) is deleted. It is named in no requirement, so no other line changes.
- Tests: a row answering `quotable: false` answers `quoting.key` `signing.openrequest.noquote`, and `says` equal to `words.json`'s `en` filled with `{whom}`. Control: a row answering `true`, or not answering it, carries no `quoting`.

**START must say, beyond the entry:**
1. Check first that the key is present at the design commit (`docs/development/ux-substrate/screens/words.json`:5708, DEC-232, `protected: true`). Its words differ from BOB's plain sentence ("…, so the case says what it says without quoting its words."), so any test asserting the old sentence changes.
2. Inherited red: case-inputs R18 (rule 5 (7) (B)), cleared by this job. Coverage on the amended R18 (5 (1)). Do the rule 6 items at START. This is a Haiku job, but rule 6 limits only T49-7 and T49-11.

---

## 6. scheduler (T49-12)

**No requirement line is drafted.** The entry is a diagnosis. R12 is re-scoped only if the job finds that it must be, and then through BOB (P9), with the text BOB's at CHANGE.

**START must say, beyond the entry:**
1. Measure first: run `plane` R12's test in a scratch copy that has N1095's one-line fix at `control-plane/index.mjs`:2477. The fix strips `member` only for `stepsource` and `stepsourcewithdraw`. Name the step at which `pr.ok` fails and the time to failure (about 108 s). Do not commit the scratch fix.
2. Inherited red: `plane` R12, from rule 5 (7) (A), until both T49-12 and T49-29 merge. Coverage only if R12 is re-scoped. Do the rule 6 items at START.

---

## 7. D5: is the walk's claim about the actor's shape right?

**Mostly yes. The cause is confirmed in the code; one detail is wrong.**

- `action-plans`' `planAsk` (`action-plans/index.mjs`:2044–2066) calls `ai-runs.open` with `actor: who`, where `who` is the stamped `author`. For a session, that stamp is the identity `member:<id>`: `control-plane/index.mjs`:1022 and `admission` `resolveSession`, which gives the founder `member:admin`.
- `#aiRunProjectGate` (`ai-runs/index.mjs`:806–820) passes that string unchanged to `membership.participation(p, who)`.
- `participation` (`membership/index.mjs`:1389) looks up `project_participants.member_id` by exact match. Those rows hold the **bare member id**. The creator's row is written from `ownerMemberId` = `sessMember`, the folded id (`control-plane`:2664), and an invitee's from `members.member_id` (`membership`:1416–1433).
- So the lookup returns null, and `run-rules` R6 refuses `AI_RUN_NOT_PROJECT_MEMBER`.

The walk says participants are "keyed by handle". That detail is wrong: they are keyed by member id, which is not the handle.

The door does not hit this. For `airunopen`, `airuntick` and `airunclose` it stamps the bare `sessMember` as `actor` (`control-plane`:2450–2453), so only an in-process caller passing `member:<id>` fails: `planAsk`, and `plan-work`'s re-examination run if it passes the same stamp. R47's own check (`planRunCheck`) folds the actor through `projectAuthority` and passes.

R81's fold must not use `memberIdOf`'s null for a machine identity as "no actor". That would let a machine actor pass the gate unapplied, which is why R81 says so explicitly.
