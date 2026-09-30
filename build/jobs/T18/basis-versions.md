# basis-versions (T18)

**Status** · session_01XmH3VGCrsiUyCTE8fqQAsk · depth 2 · RUNNING until 2026-09-30T22:49:05Z (eight convert conversions (subagents)) · handled B0

## J1 · QUESTION

`op=basisversions&project=<P>` when the viewer's sight of P is EXISTENCE (P discoverable, viewer not a participant). The old `project-discoverable` suite (§3l) expected C-70.1 for this read, and membership R44 says "a read naming the project's own id is refused PROJECT_SEEN_NOT_A_PARTICIPANT". basis-versions R8/R11/R33 say an invisible project answers as an absent one. Today the read answers ok with `current: null`, `conclusion: null`, `conclusion_stance: "none"`, `conclusion_history: []`, the same as for an unseen project. It does not refuse the whole read.

My best reading, which I am carrying out: leave it as it is. The read names the inquiry's id. The project is only a qualifier that adds fields, so R44's "a read naming the project's own id" does not reach it, and refusing would deny the inquiry's versions to a viewer who may see them. If you rule the other way, R11 needs a clause, e.g. "a named project at EXISTENCE answers membership's existenceAct in place of the read". I would then make the change and test it.

Done in the same area without asking: `withdrawConclusion` now asks `existenceAct` before NOT_A_PROJECT, as `conclude` and make-current already do (membership R44 for an act), tested under R20 and R33 (c8fb79e65e).
