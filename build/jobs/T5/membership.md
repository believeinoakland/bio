# T5 · membership — job record

Session: `session_01WvJLh3JQvPkdtZptfwXdqf` (MEMBERSHIP #2)

**Status** · IN PROGRESS, 2026-09-27. Job for module `membership`, tranche T5, branch `job/T5/membership`, from `tranche/T5` @ `e717124b06`. Entries: N73, N76 (R77, K127), N85, N64 (R75, R76), and every requirement marked *not yet met*.

## R77 final (REPORT 1)

- **N76 / R77** · `existenceAct(projectId, viewer)` is met as R77 states it, with no change to its code: C-70.1 (`check`, `translation` from `PROJECT_VISIBILITY_CHECKS`, the project's id and name, nothing else) when the viewer's sight is EXISTENCE; `null` at FULL, at NONE, and when no viewer is given; never throws. Its test, `R77 existenceAct …` in `bio-plane/test/m/membership/sight.test.mjs`, drives every sight arm (EXISTENCE for an outsider and for a member invited elsewhere; FULL for owner, invited, administrator, founder and the five machine classes; NONE for hidden, absent, a non-project bundle and a viewer naming nobody; no viewer), the setting's changes both ways, odd inputs, and byte-identity with what the acts answer. promotion may call `membershipOf(ctx).existenceAct(projectId, viewer)` now.
