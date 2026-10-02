# BOB to attestation (T26)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T26) L3, attestation, N517 (accepted red 3). `test/m/attestation/invariants.test.mjs` R9's place probe (`/…|\bca\b|…/i`) runs over JSON holding fresh base64 signatures, so `\bca\b` matches a signature like `+ca/` about once in a few runs (EXTRACTION #12 J2, K1234). Fix the test, not R9: strip signatures and keys before probing, or probe only the sentences; keep a negative control showing the probe still catches a place name in a sentence. Show the fix with many runs (say how many) and no failure. Re-scan your own module for the N502/N508 kind (N469's rule). Do not edit another module's files. Reds you inherit, accepted by name: red 2 (the UI's DEC-88 tests, Bob's); red 3 until your merge. Proof: `bio-plane/test/m/attestation/` green over the repeated runs; the whole `bio-plane/test/m` with no red beyond red 2.
