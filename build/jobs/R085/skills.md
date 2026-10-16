# skills (R085)

**Status** · session_01G9udrj9rd72VGwvKq7aJUu · depth 2 · COMPLETE · handled B2

## Completion

- **Entries applied:** R085-37 · R50. `skillpack.mjs` `offerableScript` strips `finished`, `approver`, `approved` and other use counts from each wizard script in the layer body; R10's validation still reads the full script; the script's own `version` stays. New test `R50 …` in `pack.test.mjs`; two R10 assertions changed from identity to deep equality (the body is now a copy).
- **Deferred:** none.
- **Stale artifact (REPORT):** `bio-plane/dist/bio-plane.bundled.mjs` bundles `skillpack.mjs`; owned by `not_product`, not rebuilt here. `agent-worker`'s bundle has no skills input.
- **Found in another module:** `bio-plane/test/m/answer-envelope/catalogue-end.test.mjs` has 2 failing tests (R7/R2/R10/R13 pins; R13 C-124.30), identical on `origin/tranche/R085` without my change.
- **Ran:** skills tests 126 pass, 0 fail (before the new test; new test passes in the file run); affordances/plane, run-rules/rules, ai-runs/converts 0 fail; answer-envelope/catalogue-end 2 fail (pre-existing); agent-worker t36 + requirements 2 pass. Checks: format 0 failures; architecture 0; coverage 50 of 50; ownership 0.
- Size (session_01G9udrj9rd72VGwvKq7aJUu): test runs 9, module lines 12

## J1 · COMPLETE

R50 applied (skillpack.mjs offerableScript; test R50 in pack.test.mjs). Checks green (format, architecture, coverage 50/50, ownership). Skills tests 126 pass; dependents pass except 2 pre-existing failures in answer-envelope catalogue-end (same on tranche/R085 without my change). STALE: bio-plane/dist/bio-plane.bundled.mjs bundles skillpack.mjs, needs regeneration by BOB. agent-worker bundle unaffected.
