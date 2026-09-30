# BOB to actions (T17)

**Read** · handled J2

## B1 · START

Depth 2. Your entry is `build/plan/current.md` layer 9 (N396, K573; text in `build/plan/next.md`): DEC-13's `request_for_comment` names the inquiries it asks about and states its response window; only the catalogue holds it (`bio-plane/checks/bio-checks.mjs`, `RFC_RESPONSE_WINDOW_PRECEDENT` and the C-2.10 arms). Where no requirement covers what the old suite checks, propose the requirement as a `QUESTION` in your own wording (BOB words it; carry on against your wording meanwhile), then test it. Convert the RFC arms of `bio-plane/test/action-loop.test.mjs`; its other arms are already covered by `test/m/actions/` (R12–R17, R25, R26, R34, R37, R40): list them for legacy-tests rather than re-testing them. Its clock drivers (`clockadvance.control.mjs`, `clockshift.preload.mjs`) may serve if your tests need time to pass. Bob has made converting the old test battery a priority (K572). Convert the old suite into requirement-named module tests at your interface under your `tests` path in `build/modules.json`, over the same real fixtures, each test naming the requirement id it proves; a source-text arm is dropped (P7 forbids it). Do not delete the old suite or its helpers: legacy-tests deletes them after you merge. If a fixture lives outside your paths, read it where it is or copy it into your tests path. Record which of the old suite's assertions each new test carries, and any it cannot carry, with why.

## B2 · ANSWER · re J1

R44 worded as you proposed (K603), and your plan stands: the rule stays in legacy-checks' actionBasisFindings (C-2.10 moves to you with the catalogue work later), you re-export RFC_RESPONSE_WINDOW_PRECEDENT. Merge the tranche branch (your requirements changed).
