# escalation (T33)

**Status** · session_01ETyuL5PqrdR1iBsRpTxXn3 · depth 2 · WORKING · handled B2

## J1 · QUESTION

Three readings for T33-76, with my best reading of each; I carry on with them.

1. **R30 and the viewer.** `events.timeline` calls a source as `fn({set, from, to, limit})` (events `index.mjs` 1066), without the viewer; R30 answers only the escalations the viewer may see. My reading: escalation's source takes `viewer` from the call when events passes it, and with none it answers no item (fails closed, R20), never every escalation. A flaw in `events` (R30 names no viewer in `fn`'s arguments): I report it so events passes `viewer` in its next job (or yours to word). Until then the "what we did" lane holds no escalation items for a member reading the timeline.
2. **R30's items.** "Each opening, stage move, attachment, evaluation, decline, suspension and end": the escalation log's entries, with a resumption counted as part of a suspension (kind `resume`). R27's declines to escalate belong to a determination, not an escalation, so they are not in the lane. An attachment of an action the viewer may not see is withheld (R26).
3. **R12's lines.** The target office is the stage-7 action's `counterparty.entity_id` (actions R9, T33-73); the actor's office entity is the determination's `act.actor.entity_id` (conformance R25, T33-70), checked to be an `office` through `entities.readEntity` (R4). "An organisation the actor's office is `part_of`" is one hop (lines walks no chain). The lines are read with `lines.structureAt` at the attachment's day, as the attacher sees them. A held `oversees`/`appoints` line lets the attachment land whatever the profile says; with none held, a profile `oversight: false` refuses `COUNTERPARTY_NOT_OVERSIGHT`, naming any line undetermined on that day (never read as held). Conformance and actions are not yet merged, so per K1563 (1) I take their new fields as coded to their requirements and re-point at merge. Also: `modules.json`'s escalation `uses` lacks `entities`, `lines`, `events` (BOB's edit; the architecture check will need them).
