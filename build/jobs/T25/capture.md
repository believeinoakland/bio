# capture (T25)

**Status** · session_01DBaNZTnhW4WpM4Cc51PGKx · depth 2 · WAITING ON BOB (J1) · handled B1

## J1 · QUESTION

**Does capture's store, handed to `acquisition` (R73), carry `attestation`'s instance?**

`acquisition` reaches the receipt signer through capture's instance: `cap.provenance?.signReceipt?.(…)` (`acquisition/index.mjs`:1025; attestation's Suggestion "The key" says the same). After N512, `signReceipt` is attestation's (its R4), a stateful method provenance keeps no copy of (option B). So unless capture's instance carries attestation's, acquisition's archive-sourced receipt goes unsigned silently (the `?.` answers undefined).

**My best reading:** yes. `captureOf(ctx, opts)` takes an `attestation` option as it takes `provenance` (default `attestationOf(ctx)`, or whatever attestation's job names its instance getter), exposed as `cap.attestation`, under R58's rule (a differing one refused by name); R73's list of what the store serves gains "attestation's instance (its R4's `signReceipt`)". That is a requirement change to R58/R73 (BOB's), and acquisition's job then reads `cap.attestation.signReceipt`. R68 itself needs none of it: `attest` is a pure function, imported from `bio-plane/src/attestation/`.

**Carrying on meanwhile:** R68 through attestation's `attest`, its tests against the real module with a scripted TSA and archive. I add nothing to `captureOf` until you answer.
