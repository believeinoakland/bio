# affordances (T34)

**Status** · session_01D46sKU6GQxJsbHFhXN1a2o · depth 2 · WAITING ON BOB (J2) · handled B1

## J1 · QUESTION

R44's `writing_help_refused`: how does affordances read wizard-scripts R24's list? R24 fixes neither an export name nor an accessor, and WIZARD-SCRIPTS #3 has not built it yet (its branch holds only mail).

My best reading, which I build to unless you rule otherwise:
1. wizard-scripts exports its named list as a frozen array (say `WRITING_HELP_NAMED`), and its instance answers the list as registered through a pure read, `writingHelpRefused()` → `{named, machine_refused, irreversible}`: `named` is that very frozen array, and the two sets are the ones `wizardRegister` was handed (arrays in registration order; `[]` before registration).
2. affordances asks for it through the in-process route it already has for the no-target answer (`op=affordancescreens`, facts.mjs `screens()`, R37). The route gains `writing_help_refused`, and `affordancesAnswer` passes it through unchanged, as it passes `screens` and `wizard_scripts`. With no registration it answers the empty sets, never absent.
3. Until wizard-scripts merges, my test drives the route with a stub `wizardScripts` dep that holds that shape. After wizard-scripts merges I merge `tranche/T34` and drive the real module.

Please confirm the method name and shape, or name another, and pass it to WIZARD-SCRIPTS #3 so its R24 exposes it. Everything else in my START goes ahead meanwhile.

## J2 · REPORT

Progress, and three findings outside my module. Pushed at the job branch's head: R42, R43, R37's `baseupdates`, R44's grades and the door's pass-through of `writing_help_refused`, DEC-149's one row (`RUNG_ABSENCE_GROUNDS.undetermined` now reads "no refusal establishes one"), and N630's share. All 200 affordances tests pass. That clears K1805's red (`t33-backing.test.mjs`:122) and K1807's two (:212, `t33.test.mjs`:135): `DUTY_NO_REASON` and `HYPOTHESIS_NO_REASON` join `JUSTIFICATION_REFUSALS`. The four checks are clean (coverage 44/44). Size: 3,926 lines (P6 fine).

Still open: one line in `facts.mjs` `screens()`, which reads `wizardScripts().writingHelpRefused()`, and its test against the real module. That waits on your CHANGE after wizard-scripts merges, per B2. Calling the method before it exists would break the plane's untargeted answer.

**N630 (K1717), measured at this branch in Miniflare.** `op=affordances` with no target answers 257,776 bytes as served. Compact, it is 195,121 bytes, so 63 KB of the 258 KB is the control plane's `json()` indentation (`JSON.stringify(…, null, 1)`, `control-plane/index.mjs`:218). Of the 195 KB compact:
- `pack` is 124,125 bytes and `fences` 22,828. Together that is 75%, and both are control-plane R41's decoration (`publishAffordances`) for the member's agent.
- This module composes about 48 KB: `vocabularies` 31,411 (of which `connection_kinds` is 13,625: R39 carries `owners()` whole as `values` and again as `words`), `catalog` 8,180, `answer_checks` 2,836, `screens` 2,612, and `capture_acts`, `set_acts` and `detail` about 3,000 together.
- What `civicos-ui/app.html` reads once per session (`loadActSource`, about :7684) is `catalog`, `vocabularies`, `capture_acts` and `set_acts`: about 42 KB.

Composing this module's part takes about 0.2 ms. `renderPack` takes about 2.7 ms and `machineFences` 0.5 ms (node, local). So the size the app does not need is the control plane's to trim or split, not this module's. Options are a pack the agent asks for apart (for example `op=affordances&part=pack`, or its own read), and compact JSON. Either is a control-plane (R41) and agent-worker R48 requirement change, so it is yours to place. In this module I made the door ask its two store questions (the kinds, and the screens or the facts) together instead of one after the other, which saves one store round trip per call. Trimming `connection_kinds`' duplication would change R39's shape, so I left it.

**DEC-149, outside my 30 rows.** `answers`' C-135.6 and C-135.8 translations say "this copy" ("No rule service of that name is held in this copy", "… switched off in this copy …"). `op=affordances` carries them in `answer_checks` (K1601) for the pack. They are answers' rows (layer 6), not mine, so I left them. They are agent-facing in the pack, but a member also reads them where `answers` refuses.

**Ordering.** `op-declarations` R25 and R29 and control-plane merge before affordances. Until affordances merges, control-plane's `totality.test.mjs` will see `publishat`, `publishatmove`, `publishatcancel`, `publishschedule`, `notewrite`, `noteturn`, `notes`, `baseupdates`, `groupdescriptiondraft` and `writinghelp` as unpublished or unranked. affordances' merge clears it.
