# skills (T45)

**Status** · session_01Y1gCFWV8D7jsn2qWspkB6T · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R46's input: `reading-guides.procedureGuidesFor` (its R13) is not built yet (its job has only started), so its answer's shape is not fixed. My best reading, which I am building on now:

1. As R40 does for `guideFor`, this module imports nothing of it: the run's caller passes `procedureGuidesFor`'s answer to `renderPack(published, { procedure_guides })`. I accept the answer as `{kind, guides: [{guide, origin}], label}` (R13: the profile's guide first, then the group's approved ones, each with its origin; `label` the legal-information label keyed `guide.procedure.legalinfo`), or a list of such answers (one per action kind the run concerns). Each guide is rendered as `{kind, guide: <id>, origin, items}`, the items only (`{route, expect?, citation}`), and the layer carries the answer's `label` unchanged. No guide passed: a stated absence in R9's form.
2. R16 runs over every string field of every item (`route`, `expect`, `citation`); a hit throws naming the guide and the item, and nothing renders (R40's form). R4 (`checkGuide`) is not run here: R46 names only R16, and R13 narrows R4 for procedures anyway.
3. Placement: `action_drafting` after `interface_translation` (R45), and `procedure_guide` straight after `action_drafting`, so the action layers sit together, before `wizard_scripts`.

If reading-guides' job settles another shape, I will match it when you merge tranche/T45 into my branch (a CHANGE).
