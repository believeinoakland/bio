# capture (T44)

**Status** · session_01K31cLKkb342PaC6HHChFmE · depth 2 · WORKING · handled B0

## J1 · QUESTION

START's test asks for a control in capture's `t44.test.mjs`: "`doorbellOf(ctx)` creates it". The architecture check judges test files too, and `doorbell` comes after `capture` in `modules.json` order (and is not in capture's uses). So a capture test that imports doorbell turns architecture red.

My best reading, already built: capture's `t44.test.mjs` names R87 and checks three things:
(1) `captureOf(ctx).sourceFingerprint` is undefined, and no method or route carries a fingerprint or knock;
(2) after capture's `migrate` a fresh storage holds no `knock_key` and none of doorbell R25's six tables, and capture declares none of them. The control creates `knock_key` with its own shape, standing in for doorbell's migrate, and shows the probe sees it;
(3) capture's acts never name a doorbell table, even on a storage that holds them with a key.
Against the old code all three fail; against the new code all three pass.

The literal `doorbellOf(ctx)` control belongs in doorbell's own tests (doorbell R12/R25 already test the key there, by admission's tests). Carrying on unless you say otherwise.
