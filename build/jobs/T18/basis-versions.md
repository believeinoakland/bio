# basis-versions (T18)

**Status** · session_01XmH3VGCrsiUyCTE8fqQAsk · depth 2 · RUNNING until 2026-09-30T22:49:05Z (eight convert conversions (subagents)) · handled B0

## J1 · QUESTION

`op=basisversions&project=<P>` when the viewer's sight of P is EXISTENCE (P discoverable, viewer not a participant). The old `project-discoverable` suite (§3l) expected C-70.1 for this read, and membership R44 says "a read naming the project's own id is refused PROJECT_SEEN_NOT_A_PARTICIPANT". basis-versions R8/R11/R33 say an invisible project answers as an absent one. Today the read answers ok with `current: null`, `conclusion: null`, `conclusion_stance: "none"`, `conclusion_history: []`, the same as for an unseen project. It does not refuse the whole read.

My best reading, which I am carrying out: leave it as it is. The read names the inquiry's id. The project is only a qualifier that adds fields, so R44's "a read naming the project's own id" does not reach it, and refusing would deny the inquiry's versions to a viewer who may see them. If you rule the other way, R11 needs a clause, e.g. "a named project at EXISTENCE answers membership's existenceAct in place of the read". I would then make the change and test it.

Done in the same area without asking: `withdrawConclusion` now asks `existenceAct` before NOT_A_PROJECT, as `conclude` and make-current already do (membership R44 for an act), tested under R20 and R33 (c8fb79e65e).

## J2 · QUESTION

Two readings of R12 and R14, found while converting `versionstate`. Both are applied in 13b2cb2f86 and tested.

(1) R12 lists VERSION_ACT_UNWRITABLE (C-25.31) straight after VERSION_ACT_NO_SUCH_VERSION. The code only detected a version row it could not rewrite at write time, after the receipt. That broke two things. The order: a missing reason, an illegal edge or a case member was answered first. And R14: preview said ok for an act that would then refuse. Now the row's writability, and for `current` the project's `current_versions`, is checked right after the version is located, in R12's place. Preview therefore answers it.

(2) The catalogue's C-25.19 stores a `state_reason` only at 8 characters or more. The act had no floor, so reject or consider with a 1–7 character reason passed the act and its preview, then the promotion refused it as BASIS_VERSION_REFUSED / VERSION_DISPOSITION_UNATTRIBUTED. That is not an R12 refusal. My reading: such a reason "arrived and cannot be stored", which is C-25.32 VERSION_REASON_MALFORMED. So the act refuses it there, preview agreeing, only where the state needs a reason (VERSION_REASON_MIN = 8, exported).

If you agree, R12's C-25.32 parenthesis could read "(500 characters, no quote, backslash or newline; at least 8 where the state needs a reason)". If you would rather make it a new row, or drop the floor from C-25.19, say so and I will follow.
