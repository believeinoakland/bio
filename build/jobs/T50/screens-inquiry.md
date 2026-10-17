# screens-inquiry (T50)

**Status** · session_011bBsB7gZ1dXUffg8ESSjeu · depth 2 · COMPLETE · handled B2

## J1 · COMPLETE

screens-inquiry T50-32 done on `job/T50/screens-inquiry`: R50–R64 met. Module 2,687 lines (START 2,305; under ~4,000, no split).

**Entries applied.** R50 own reading (`reading` in place of `version`, empty refused in place; form offered once a passage is cited; `question.empty.conclude.own` beneath the three ways before). R51 three steps, new-question buttons (capture primary), Conclude open when a reading stands, `question.more` and `question.around` folds. R52 work list of every kind with its card (a kind with none still listed), settings fold (bar setting + who can find it), bar read in its four cases, `act.promote.here.project`. R53 stake (team statement read-only, project stake with who/when/history, unreadable in its fold, field + `projectstakeset`). R54 owner/member dates (`owner_since`/`joined_at`, null draws none), rescue date from `projectownersgone` (`.nodate` title when none), grade from `capturegrade`, partition from `inquirypartition`. R55 held copy + vouch + vouched line, attest/retire at the foot (retire folded), unread picture fold, flattened table, untitled web page. R56 themes (document and question) and threaded steps. R57 ending words (`ai.run.ending.*`, `completed`/`completed.none`), cost line to owners only. R58 progress from `airunlog` fields, proposal held back while the run works, `check.failed` in place of a proposal, `project` sent at `airunopen` (question and dock). R59 affirmation ("Before you accept", one tick per part, `affirmed` = ticked), dock keys. R60 hidden project = shell's unavailable state b with no form (project, projectai); findable = "Ask to join"/"Withdraw your request". R61 cite preselect + `screen.find-in.questionfirst` in its fold. R62 `casedraft` in state g (casedraft, plan, withdraw), body `{project, targets:[question]}`, opens `case-editor`. R63 published cases and docket from `publishedlist` + `publishedcase` (project match), latest edition once. R64 stopped-run line + Decline fold with required reason.

**Tests/checks.** `node --test bio-plane/test/m/screens-inquiry/`: 145 tests, 145 pass, run WITH a local overlay of other modules' files (below). Without it, every screens-inquiry test is red at boot (see Depends). Process checks: format 0 failures; architecture 0 failures (22 files); coverage 64 of 64 ids named; ownership 0 failures.

**Depends on providers that merge first (REPORT to BOB; accepted red until they land).** Overlay used locally, not committed: `/tmp/claude-0/-home-user-bio/7c842e4a-c216-507d-bd47-f4a8adee5e2a/scratchpad/dev-overlay.patch` (session scratch, gone when the container is reclaimed; its content is these four lines):
1. op-declarations: OPS must hold `projectstakeset` (a member act, in `PROJECT_ACTIONS` so a member session may press it), `projectstake`, `projectownersgone`, `inquirypartition`, `capturegrade` (reads). `checkScreens` refuses the whole page otherwise.
2. interface-shell: `RE_POINTS.project` must add `projectstakeset`, `projectrequest`, `projectrequestwithdraw` (the shell's registry copy lacks the last two; the design registry has them) and `RE_POINTS.question` must add `casedraft`. `REF_SCREENS` lacks `request`, `matter`, `action`, `published` (R52, R63 rows draw as cards, not links, until it has them); `docket` and the case screens are there.
3. The registry still carries `owed:projectstakeset K3230` and lists `ask` on `assistant`; no requirement here names `ask` (common.test.mjs excepts both by name).

**Seams / assumptions to confirm (REPORT, my best reading of text that fixes no shape).** (a) `airunlog` entries: `read: {record,n,total,outcome}` per agent-worker R114; the compose `found` (number), the check's ticks `check: {passage, found}` and the end `checked: {ok,total}` are guessed field names. (b) `session.cost` is read as `ai-use` `actualOf`'s answer (`calls`, `tokens`, `cost.usd`, `unit`, `owner`). (c) `casedraft` body `{project, targets}`. (d) a published case's project is `publishedcase`'s top-level `project`. (e) "flattened table" is read from `reading.tables_flattened`. (f) a held copy is one in the viewer's own `heldcaptures` (`member` = her); vouched on reload is not drawn (no field says it). (g) a conclusion's reading is `conclusion.version`.

**Words missing (no inline English written).** No key says a strength is "not recorded" (R54): drawn as the `undetermined` mark. No key labels the theme chooser on the question/document pages (`theme.section` stands in).

**Deferred.** `writinghelp` under the stake field (R53; the shell's act, not named by this module). R60 for `question` and `document` of a hidden project: their subject reads already draw the shell's unavailable state; no extra form is drawn there. `ai.log.withheld.<CODE>` is drawn by trying the key (no list of codes to read).

**Another module (for its owner).** interface-shell: the registry copy (`SCREEN_REGISTRY`) is older than `registry.json`: `projectrequest`, `projectrequestwithdraw`, `casedraft` on question are missing. Generated artifacts: none staled by this module.

Size (session_011bBsB7gZ1dXUffg8ESSjeu): test runs 28, module lines 2687

## J2 · REPORT · re B2

B2 handled: merged tranche/T50 (no conflicts). Re-run: 145 tests, 6 pass, 139 fail, all at boot with 'screen project's act names projectstakeset, which OPS does not hold' (the J1 dependency: op-declarations OPS needs projectstakeset, projectstake, projectownersgone, inquirypartition, capturegrade; interface-shell RE_POINTS needs projectstakeset, projectrequest, projectrequestwithdraw, casedraft). The regenerated registry does not change that. With that overlay 145/145 pass. Nothing further to build here; I wait for those providers to merge.

## J3 · COMPLETE · re B4

B3/B4 handled: merged tranche/T50 (op-declarations, interface-shell, instance-setup in). Against the real providers, no stand-in and no overlay: 145 tests, 145 pass. format 0 failures; architecture 0 failures; coverage 64 of 64 ids; ownership 0 failures. The J1 dependency is resolved; J1's other notes (guessed field shapes, missing words, deferrals) stand. Size (session_011bBsB7gZ1dXUffg8ESSjeu): test runs 30, module lines 2687
