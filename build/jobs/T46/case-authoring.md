# case-authoring (T46)

**Status** · session_015ySFNDd18mdxT5E8Xsc9u6 · depth 2 · WORKING · handled B2

## J1 · QUESTION

The P8 flaw in B1 (`.noreply` read when a reply exists but no claims are laid out) cannot be fixed inside this module alone: R70 lets the source answer `answers: null` both for "no reply recorded" and for "a reply recorded, no claims laid out", and action-replies R3 (`#openRow`, index.mjs 392-401) answers null for both. Nothing in the row tells them apart.

My best reading, which I am building now (wording only, no capability):
1. R70's row gains an optional `replied` (boolean): `true` when a reply is recorded, `false` when none is. Absent is legal (today's source), and a malformed `replied` makes the row malformed (read `undetermined`, as now).
2. R73's sentence choice: `signing.openrequest.line` when `answers` is non-null; `signing.openrequest.noreply` only when `answers` is null AND `replied === false`; when `answers` is null and `replied` is `true` or absent, a plain sentence true in both cases ("…; a reply is recorded, and its claims are not yet laid out." for `true`; "…; no reply laid out claim by claim is recorded." for absent), keyed null, until the design stream gives a word. So "no reply is recorded" is never shown for a recorded reply.
3. Owed elsewhere (not mine): action-replies R3 states `replied` (true when any `received` entry exists); I suggest folding it into T46-35 (L9). Until then every null-`answers` row reads the neutral plain sentence, never `.noreply`.

Requirement changes this needs (BOB's): R70's row shape (`replied?`), R73's second bullet (the condition for `.noreply`), action-replies R3. Answer with a different rule if you prefer (e.g. `answers: {answered: 0, claims: 0}` for a recorded reply); I carry on with the rest of T46-27 meanwhile.
