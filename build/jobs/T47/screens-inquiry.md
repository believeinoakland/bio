# screens-inquiry (T47)

**Status** · session_01Pqz6Hjb3TWCpmKMBKFfVce · depth 2 · COMPLETE · handled B8

## Completion (T47-61)

**Reading.** Read whole: `build/requirements/screens-inquiry.md`; the public parts of `interface-shell`, `setup-words`, `op-declarations`, `screens-settings`; layer 11's contract (`build/layers.md`); the module's code and tests, all of them (P20); my entry in `build/plan/current.md`; `draft-T47-interface.md`, `draft-T47-L11-fold.md` §B; the registry entries of my five screens and the words they draw at PR #33's head; the owners' requirements of the ops called anew (`basis-versions` R41, R50; `strength` R14, R40; `citation` R4, R14, R15; `monitoring` R74; `ai-runs` R18, R19, R22; `credentials` R54, R57–R63; `control-plane` R77).

**Entries applied.**
- R8 (N986): every choice among record data (the plan's question, a question to draw on, the bar's letters, the question a passage is cited in, an unread page) is `cs.choice` over `{value, text}`; the dock re-reads a run it started every 10 s by `cs.later` while it runs, and draws one that ended by itself ended.
- R9 (N974): the project's questions from `projectquestions`, paged to the end by its cursor (a failed page drawn failed, never as the end), each a reference to `question` with its strength.
- R10 (N976): the project's own bar from `strengthbarof` (letters, an undeclared axis in words, none as absent); "Set this project's bar" sends `projectbarset` (both axes, either, neither) with her reason, to a joined member; `strengthbarset` never drawn.
- R11 (N975): "Open a question" promotes then sends `drawquestion` and opens the question; a refused draw is said beside the act with a link to the open question. B2 (K3145): the file's words sent as `text`.
- R12 (N977): `sever` on each live leg and `reinstate` on each severed one, by the inquiry's own `references[]` status, after selecting the leg's target, the question as citing object, with her reason; a severed leg stays in its section with its reason.
- R13 (N955): the dock mints, holds and sends no credential: `airunopen` and `airundispatch {run}` under her session; a reloaded dock finds her running run by `airuns` and continues it by the same act; `closed` removed (B3, K3147: closing stops nothing).
- R14 (N721): new screen `projectai` (`projectai.mjs`), its eight acts by owners, the panel reused from `screens-settings` R9 by import (`parts`), the link from the project.
- R15: `document` sends `monitorset` (Watch for changes) and `monitor` (Check now), two acts.
- R16: "Draw on a question from elsewhere" (`drawquestion` over the questions she may see, as data, with her note; `alreadyCited` said) and `projectbarset` by its registry label.
- Words: rows now held by `WORD_ROWS` at PR #33's head (`ai.label.untested`, `ai.refused.keptaway`, `ai.refused.noaccount`, `ai.refused.limit.unjudged`, `ai.refused.modenotdeployed` replaced by `ai.refused.notdeployed`) are drawn from it; `act.pagetranscribe.does` kept (interface-shell R5's named row).

**Deferred.** None.

**Found in another module.** `control-plane`'s `t46-app.test.mjs` R75 fails (`img-src: 'self',data:,blob:` expected in the page policy); it fails identically with `tranche/T47`'s own `screens-inquiry`, so not this job's. `checks/run.mjs` coverage fails for other modules still in flight (control-plane, plane, screens-*, journey-check); none for this module.

**Tests and checks** (on `job/T47/screens-inquiry` after merging `tranche/T47` at B8, no overlay):
- `node --test bio-plane/test/m/screens-inquiry/`: tests 64, pass 64, fail 0.
- Users (P11): `interface-shell` tests pass 119, fail 0; `control-plane/t46-app.test.mjs` pass 3, fail 1 (above, not this module's).
- `checks/format.mjs`: 0 failures; `architecture.mjs` (screens-inquiry): 0 failures; `coverage.mjs` (screens-inquiry): 16 of 16 live ids named, 0 failures; `ownership.mjs`: 0 failures; `checks/run.mjs`: architecture 0 failures, format 0, channels 0, coverage failing only for other modules.

Size (session_01Pqz6Hjb3TWCpmKMBKFfVce): test runs 14, module lines 1682

## J1 · QUESTION

One reading to confirm, and where the job stands.

**Question (R13 against R6).** R6's T46 text said the dock stops her run (`airunclose`) and revokes its credential "when the run ends, is stopped, or the dock is closed". R13 retires R6's page-held credential clause (K2976, K2999) and says a reloaded dock continues her running run. My best reading: closing the dock or leaving the page now stops nothing; the run keeps running until it ends, she presses "Stop the run" (from this page, or from a reloaded dock that finds it through `op=airuns`), or its bounds end it. I have built that (the module's `closed` hook is gone) and carry on; tell me if closing the dock should still stop the run.

**Where the job stands.** Every entry is applied in code and tests on `job/T47/screens-inquiry` (R8–R16; `projectai` is a new screen reusing `screens-settings`' R9 panel by import, the declared edge). Against local stand-ins for the providers' T47 services the module's tests pass 64/64. On `tranche/T47` as it is, the page cannot be built yet (`interface-shell`: "project's act names drawquestion, which OPS does not hold"), so I need these L11 merges before I can run the real tests: `op-declarations` (R55: `drawquestion`, `projectbarset`, `monitorset`, `projectquestions`), `wizard-scripts` (R35: the registry at PR #33's head, with `drawquestion`/`projectbarset` on `project` and `monitorset` on `document`), `setup-words` (R7: the words at PR #33's head, which I now read for `ai.label.untested`, `ai.refused.keptaway`/`noaccount`/`notdeployed`, `refusal.MEMBER_RUN_MODE_NOT_ADMITTED`, `refusal.AI_RUN_CREDENTIAL_MALFORMED`, the new act labels), `interface-shell` (R27's `cs.choice` over `{value, text}` and `cs.later`; R28's `projectai` path), and `screens-settings` (its panel, used as it stands). I wait for your CHANGE announcing them.

## J2 · REPORT

B3 applied (no change needed: built so). B4: tranche/T47 merged (95dc803a7f). Against it, the words test passes: every WORD_ROWS key my screens name is held at 6f0d88d8d5, and my own rows shadow none but act.pagetranscribe.does (interface-shell R5's named row). The other 63 tests cannot run yet: interfacePage refuses the page because OPS holds no drawquestion (op-declarations R55); interface-shell R27 (cs.choice over {value,text}, cs.later) and its projectai path are also still needed. I wait for those CHANGEs.

## J3 · REPORT

B5, B6 applied: tranche/T47 merged (0891b8c3a0); my one test comparing every request's header now leaves out the page's public bootstrap read (K3153). On my branch as it is: 38 pass, 26 fail, all for interface-shell's T47 kit not yet on tranche/T47 (cs.choice over {value,text}, cs.later). Merged in a scratch copy with origin/job/T47/interface-shell: 64 pass, 0 fail, the merge clean. Checks on my branch: format, architecture, coverage (16 of 16 ids), ownership, each 0 failures. I wait for your CHANGE announcing interface-shell's merge, then re-run and post COMPLETE.

## J4 · REPORT

B7 applied: tranche/T47 merged (90e2197e51). Unchanged from J3: on my branch 38 pass, 26 fail, all for interface-shell's T47 kit not yet on tranche/T47; with origin/job/T47/interface-shell merged in a scratch copy, 64 pass, 0 fail. I wait for interface-shell's merge, then COMPLETE.

## J5 · COMPLETE

T47-61 complete on job/T47/screens-inquiry after merging tranche/T47 at B8 (interface-shell merged), no overlay: module tests 64/64; interface-shell's tests 119/0; format, architecture, coverage (16/16), ownership 0 failures; run.mjs architecture 0. One red found elsewhere: control-plane t46-app R75 (img-src policy), failing identically without my changes. Record's Completion section has the entries, readings and size.
