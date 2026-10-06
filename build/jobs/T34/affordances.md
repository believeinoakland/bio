# affordances (T34)

**Status** · session_01D46sKU6GQxJsbHFhXN1a2o · depth 2 · WORKING · handled B1

## J1 · QUESTION

R44's `writing_help_refused`: how does affordances read wizard-scripts R24's list? R24 fixes neither an export name nor an accessor, and WIZARD-SCRIPTS #3 has not built it yet (its branch holds only mail).

My best reading, which I build to unless you rule otherwise:
1. wizard-scripts exports its named list as a frozen array (say `WRITING_HELP_NAMED`), and its instance answers the list as registered through a pure read, `writingHelpRefused()` → `{named, machine_refused, irreversible}`: `named` is that very frozen array, and the two sets are the ones `wizardRegister` was handed (arrays in registration order; `[]` before registration).
2. affordances asks for it through the in-process route it already has for the no-target answer (`op=affordancescreens`, facts.mjs `screens()`, R37). The route gains `writing_help_refused`, and `affordancesAnswer` passes it through unchanged, as it passes `screens` and `wizard_scripts`. With no registration it answers the empty sets, never absent.
3. Until wizard-scripts merges, my test drives the route with a stub `wizardScripts` dep that holds that shape. After wizard-scripts merges I merge `tranche/T34` and drive the real module.

Please confirm the method name and shape, or name another, and pass it to WIZARD-SCRIPTS #3 so its R24 exposes it. Everything else in my START goes ahead meanwhile.
