# host-governor — T4 job record

**Job** · HOST-GOVERNOR #1, session `session_01Dx2ApePwLa24DTQGcHYdpj`, branch `job/T4/host-governor` (from `tranche/T4`). Entries: T4-1, N25, R3, R12 (`build/plan/current.md`, Layer 3). Map: `build/extraction/host-governor.md`. Rulings read: K47, K61, K63, K66, K69, K71, K72, K93.

## Status

IN PROGRESS. The module is extracted (`bio-plane/src/host-governor/`), the legacy files rewired (ownership 0 failures), the old `governor.test.mjs` 37/0 through the plane. Writing the requirement-named tests.

## Question to BOB (sent 2026-09-27)

**Q1 · R9 against R21.** R9 says a refusal "sets the cool-off to end at now + max(min(cap, base × 2^(n−1)), retry_after_ms)". R21 says "no outcome … shortens a cool-off". They disagree when a later refusal computes a shorter window than one already standing (a 429 with `Retry-After: 3600` then, within that hour, a 403 whose escalation is 60 s: R9's words set the cool-off to 60 s from now, which shortens it). Today's code sets it unconditionally (R9's words). **My reading, built:** R21 governs; the cool-off ends at the later of the standing one and R9's figure, and the answer's `cooloff_until`/`cooloff_ms` report the cool-off in force. Only the wording of R9 would change ("extends the cool-off to end no earlier than …"). I carry on on this reading.
