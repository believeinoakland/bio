# Declaration pass T51: record of group D (the ops withdrawn for the testcopy reason, and BOB's K4204 reads)

Worker: continuation of the mechanical pass (mechanics 5.10, P7), sonnet. Not committed; nothing staged in the real index. Rule as `RECORD.md` part 1 plus K4203/K4204: copy class, mutating, weight and description from the hand rows; accepts and requires from the arm; a hand sentence is `localize("<module>.declared.<op>", <hand sentence>)`; an op with no op-grades row that op-declarations marks not mutating takes weight `read` and the registry label key as its description. No arm was changed; no product file of `op-grades` was touched.

## Step 1: op-grades' tests (tests only)

The cause: op-grades' tests copy the head of other modules' hand descriptions, so a `localize` declaration of the same sentence made the words check's testcopy arm fail (17 findings once all D declarations were in). Every copied sentence is now read from the word table by id through one new helper, `declaredSentence(module, op)` in `bio-plane/test/m/op-grades/declared.mjs` (it is `word(`${module}.declared.${op}`)`; the id is composed, because the check's missingkey arm judges a typed literal key against the design's `words.json`, which does not yet hold these code-held ids). Every assertion keeps its meaning and its controls (a head-of-sentence check stays a head check, an equality stays an equality).

| file:line | before | after |
|---|---|---|
| `declared.mjs` (end) | none | `declaredSentence(module, op)` and the `word` import |
| `ladder.test.mjs`:165 | `startsWith("candidate-directed: keyed by a candidate, reached where its sides are shown")` for dismiss, clarify, takeup | `startsWith(declaredSentence("contradiction", "contradictiondismiss").split(";")[0])` (the same head) |
| `ladder.test.mjs`:167 | `NON_ACTS.resolutiondefect.startsWith("registry correction, keyed by a resolution")` | `startsWith(declaredSentence("entities", "resolutiondefect").split(":")[0])` |
| `ladder.test.mjs`:169 | `startsWith("conflict-directed: keyed by a candidate and the member's project, reached from the conflict's notice")` for optin, respond | `startsWith(declaredSentence("contradiction", "contradictionoptin").split(";")[0])` |
| `owners.test.mjs`:34 | `NON_ACTS.factconfirm` equals the typed fact-directed sentence | equals `declaredSentence("local-facts", "factconfirm")` |
| `owners.test.mjs`:46 | `NON_ACTS.noticepost` equals the typed project-directed sentence | equals `declaredSentence("network-notices", "noticepost")` |
| `owners.test.mjs`:79 | each docket op (file, decline, post, pressure) equals the typed case-directed sentence | equals `declaredSentence("docket", "docketfile")` |
| `owners.test.mjs`:230 | publishatmove and publishatcancel equal the typed case-directed sentence | equal `declaredSentence("publish-schedule", "publishatcancel")` |
| `owners.test.mjs`:241 | `ND` is the typed note-directed sentence (notewrite, noteturn) | `ND = declaredSentence("hypotheses", "notewrite")` |
| `t36.test.mjs`:30 | `NON_ACTS.spotcheckvisit` equals the typed draw-directed sentence | equals `declaredSentence("calculations", "spotcheckvisit")` |
| `t36.test.mjs`:113 | `NON_ACTS.aikeepaway` equals the typed setting sentence | equals `declaredSentence("ai-accounts", "aikeepaway")` |
| `t37.test.mjs`:20 | `WORD` is the typed translation-directed sentence | `WORD = declaredSentence("translations", "translationadopt")` |
| `t37.test.mjs`:23 | `R27_REASONS.obscuremark` typed | `declaredSentence("case-carriage", "obscuremark")` |
| `t37.test.mjs`:29 | `R27_REASONS.translationgrant` typed | `declaredSentence("translations", "translationgrant")` |
| `t38.test.mjs`:13, :15 | `WITHDRAW` and `MARK` typed | `declaredSentence("case-carriage", "obscuremarkwithdraw")` and `("case-carriage", "obscuremark")` |
| `t42.test.mjs`:13 | `R31_REASON` typed | `declaredSentence("extraction", "pagetranscribe")` |
| `t47.test.mjs`:74 | `NON_ACTS.projectbarset` equals the typed project-directed sentence | equals `declaredSentence("strength", "projectbarset")` |

Not changed, because their owner declares nothing (so the check does not flag them and the hand sentence stays the only copy): `owners.test.mjs`:118 and the other wizard-scripts sentence, `t37.test.mjs`:30 (`translationdraft`), the template, whatchangedpropose and publishat sentences.

op-grades' tests, before and after: 138 tests, 136 pass, 2 fail in both runs; the two reds (`R42` MARKS total over the rungless acts, `R46` expertisewithdraw has no mark) are identical in both outputs (diff of the failure blocks is empty) and are not caused by this pass. 0 new reds.

## Step 2: declared (33 ops, 17 modules; every one a copy of the hand rows, `localize` where the description is a hand sentence)

| module | requirement | ops |
|---|---|---|
| entities | R62 (extended) | resolutiondefect |
| hypotheses | R24 (extended) | notewrite, noterevise, noteturn, notedelete |
| local-facts | R20 (extended) | factconfirm |
| network-notices | R31 (extended) | noticepost |
| calculations | R42 (extended) | spotcheckvisit |
| contradiction | R60 (extended) | contradictiondismiss, contradictionclarify, contradictiontakeup, contradictionoptin, contradictionrespond |
| ai-accounts | R36 (extended) | aikeepaway |
| strength | R41 (extended) | projectbarset |
| translations | R18 (new) | translationgrant, translationadopt, translationconfirm, translationrevert |
| docket | R31 (new) | docketfile, docketpost |
| case-carriage | R23 (new) | obscuremark, obscuremarkwithdraw |
| extraction | R79 (new) | pagetranscribe, pdfstructure (K4204) |
| publish-schedule | R12 (new) | publishatcancel |
| retrieval | R91 (extended) | frontier, search (K4204) |
| reevaluation | R40 (extended) | reevaluations (K4204) |
| progressions | R47 (extended) | progression, instance, captureprogressions (K4204) |
| public-read | R40 (new) | verify (K4204) |

(The extended R lines are the ones the earlier parts wrote, each `*(not yet met: T51)*`; the new lines are marked the same and named in the new `declared-ops.test.mjs` of the module. K4204 reads: weight `read`, description the registry label key, `requires` as the arm refuses; the K4204 ops from RECORD-C (`captureprogressions`, `instance`, `progression`) were not declared there, so they are here.) Each op has one `declaredOpHolds` test in the module's `declared-ops.test.mjs` (only the requires raise no refusal naming a field; each missing one is refused naming it; a field outside accepts is dropped or refused); `registerDeclaredOps` of `op-grades` accepts every row of the tree (11 registered, 206 agreed) and of `op-declarations` raises nothing; `declaredOpsOf` finds no duplicate (217 ops). Census (`interface-shell` `declared.test.mjs`): 7 pass, `declared 162 of 299 ops`.

## Judgments (declared nothing)

| module | op | sentence that stopped it |
|---|---|---|
| translations | translationdraft | the door routes it itself (store-door/dispatch.mjs:466, RECORD-A), so the arm in `translationsOps` is not the one the door runs; a declaration here would be held against an arm no request reaches |
| public-read | publishedcase | a call naming none of `id`, `sha256`, `caseId` is answered `NOT_PUBLISHED`, one frozen answer for every miss by design (the same for a case never published, an edition that does not exist and a name that never existed), which names no field, so what it requires cannot be stated as a refusal names it (as `knockerconsent`) |
| wizard-scripts | all its ops | not taken, as ordered |

## UNCERTAIN

- `publishatcancel`: a missing `case` or `edition` is answered `NOT_WAITING`, the one answer (without standing, hidden project) the arm keeps; counted as naming each, as `projectjoin` (RECORD-C). `requires: ["case", "edition"]`.
- `docketfile`: `requires` is `case`, `reason` and, each with the alternative `takesBack` (taking an earlier entry back), `edition`, `from`, `capture`, `kind`, `proposed`; `proposed` and `reason` share `DOCKET_NO_REASON`, `case` is `NO_SUCH_CASE`. `contests`, `answers`, `outcome` (kind outcome) and `summary` are accepts only.
- `docketpost`: `digest` is told by `DOCKET_STALE`, `signature` by `DOCKET_SIGNATURE_REFUSED`, `acknowledged` by `DOCKET_WARNING_NOT_ACKNOWLEDGED`; the test prepares and signs a real entry.
- `aikeepaway`: `requires: []` (`on` defaults to off; a reason is needed only with `on: true`, a conditional left out); accepts `on`, `uses`, `reason`.
- `contradictionclarify`: `requires` `candidate`, `choice`; the per-choice fields (`coordinates`, `explanation` for `differs`; `wrongSide`, `reason` for `one_wrong`) are conditional and accepts only; the test supplies `coordinates` and `explanation` for the base call.
- `noteturn`: `requires` `note`, `into` and one of `made` or `hunch` (alternatives; `NOTE_TURN_NOT_MADE` stands for both).
- `pagetranscribe` and `pdfstructure`: `requires: ["sha256"]`, told by `REEXTRACT_NOT_READ` (and `EVIDENCE_NOT_HELD` for the read); `ocr` (pdfstructure) accepts only. The arm answers `{status, body}`, so the test reads the body's `reason`. The section 4 check that `pdfstructure` with `ocr=1` answers the four states (Full, Partial, None, Unread) was NOT made: the answer carries the text with its pages, per-page `undetermined` reasons, `tier` and `reextraction`, from which the screen derives them, but no field is called a state. If BOB wants that confirmed it is a read of the screen against the answer, not of the declaration.
- `verify`: `requires: []` (a missing hash is answered `published: false`, not refused); `frontier`, `search`, `reevaluations`: `requires: []` (every field has a default).
- `translationgrant`: `member` is told by `NO_SUCH_MEMBER`, `language` by `LANGUAGE_MALFORMED`; `translationadopt`: `draft` accepts only.
- `projectbarset`: `requires` `project`, `reason`; `capture` and `connection` accepts only (neither withdraws the bar).
- The K4204 label keys are `act.pdfstructure.label.document`, `act.frontier.label.finder`, `act.search.label.finder` (search has five labels; the first screen's), `act.reevaluations.label.question`, `act.progression.label.timeline`, `act.instance.label.timeline`, `act.captureprogressions.label.document`, `act.verify.label.published`.
- `declaredSentence` composes its id on purpose (see Step 1); if the design later takes the `*.declared.*` ids into `words.json`, a literal key works too.

## Uses needed (do not edit modules.json): `test-support` in `uses` of
docket, extraction, public-read, publish-schedule, translations (architecture check: these five findings, nothing else). hypotheses, entities, local-facts, network-notices, calculations, case-carriage, contradiction, strength, ai-accounts, retrieval, reevaluation, progressions already have it.

## Words

`node bio-plane/src/setup-words/build.mjs` was run (rewrites `rows.mjs` and `words-unreviewed.json`): the new `localize` ids are the declared hand-sentence ops above (`<module>.declared.<op>`); `contradictionresolve`-style label-key rows add none.

## Tests (`node --test --test-force-exit` over each module's test directory, after)

| module | pass / fail |
|---|---|
| op-grades | 136 / 2 (the same two as before; 138 tests before and after) |
| hypotheses | 58 / 0 |
| entities | 138 / 0 |
| local-facts | 75 / 0 |
| network-notices | 75 / 0 |
| calculations | 62 / 0 |
| case-carriage | 90 / 0 |
| publish-schedule | 27 / 0 |
| extraction | 193 / 0 |
| docket | 82 / 0 |
| strength | 161 / 2 (R28 "no analyst's word"; R6, R22 "withheld whole": the two reds of RECORD-A, not touched by this pass) |
| ai-accounts | 128 / 0 |
| translations | 36 / 0 |
| contradiction | 126 / 0 |
| retrieval | 172 / 0 |
| public-read | 228 / 0 |
| reevaluation | 150 / 0 |
| progressions | 85 / 0 |

## Checks (temporary index `/tmp/claude-0/idx-w` with `git add -A bio-plane build`; output `/tmp/claude-0/s/checks-D3.txt`)

format 0 failures; architecture 5 failures, all the `test-support` edges above; coverage 7 failures, the 7 baseline modules (agent-harness R17, agent-runner R36-38 R40, citation R16-18, installer-steps R26 R31, journey-check R19, link-sweep R13-15, monitoring R75-77); channels 0; words 0 (inline 0, plain 0, testcopy 0, missingkey 0, handlist 0, marker 0).
