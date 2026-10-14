# screens-inquiry (T47)

**Status** · session_01Pqz6Hjb3TWCpmKMBKFfVce · depth 2 · WAITING ON BOB (J2) · handled B6

## J1 · QUESTION

One reading to confirm, and where the job stands.

**Question (R13 against R6).** R6's T46 text said the dock stops her run (`airunclose`) and revokes its credential "when the run ends, is stopped, or the dock is closed". R13 retires R6's page-held credential clause (K2976, K2999) and says a reloaded dock continues her running run. My best reading: closing the dock or leaving the page now stops nothing; the run keeps running until it ends, she presses "Stop the run" (from this page, or from a reloaded dock that finds it through `op=airuns`), or its bounds end it. I have built that (the module's `closed` hook is gone) and carry on; tell me if closing the dock should still stop the run.

**Where the job stands.** Every entry is applied in code and tests on `job/T47/screens-inquiry` (R8–R16; `projectai` is a new screen reusing `screens-settings`' R9 panel by import, the declared edge). Against local stand-ins for the providers' T47 services the module's tests pass 64/64. On `tranche/T47` as it is, the page cannot be built yet (`interface-shell`: "project's act names drawquestion, which OPS does not hold"), so I need these L11 merges before I can run the real tests: `op-declarations` (R55: `drawquestion`, `projectbarset`, `monitorset`, `projectquestions`), `wizard-scripts` (R35: the registry at PR #33's head, with `drawquestion`/`projectbarset` on `project` and `monitorset` on `document`), `setup-words` (R7: the words at PR #33's head, which I now read for `ai.label.untested`, `ai.refused.keptaway`/`noaccount`/`notdeployed`, `refusal.MEMBER_RUN_MODE_NOT_ADMITTED`, `refusal.AI_RUN_CREDENTIAL_MALFORMED`, the new act labels), `interface-shell` (R27's `cs.choice` over `{value, text}` and `cs.later`; R28's `projectai` path), and `screens-settings` (its panel, used as it stands). I wait for your CHANGE announcing them.

## J2 · REPORT

B3 applied (no change needed: built so). B4: tranche/T47 merged (95dc803a7f). Against it, the words test passes: every WORD_ROWS key my screens name is held at 6f0d88d8d5, and my own rows shadow none but act.pagetranscribe.does (interface-shell R5's named row). The other 63 tests cannot run yet: interfacePage refuses the page because OPS holds no drawquestion (op-declarations R55); interface-shell R27 (cs.choice over {value,text}, cs.later) and its projectai path are also still needed. I wait for those CHANGEs.
