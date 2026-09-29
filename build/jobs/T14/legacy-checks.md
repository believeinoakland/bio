# legacy-checks (T14)

**Status** · session_01NWS1PUu3dajfGZfz3TptN7 · depth 2 · WORKING · handled B0

## J1 · REPORT

Found in other modules by this job's removals (B1). None edited; each is the owner's, most already planned.

1. **membership** (layer 2, K408 (4)'s follow-through): `test/m/membership/not-an-admin-visibility.test.mjs`:66–72 (R84) reads `CUSTODIAL_CHECKS.NOT_AN_ADMIN`, now gone, and throws (`TypeError … reading 'check'`, line 70). It is the only red in `test/m/` (branch 2731 pass 1 fail; base 2732/0). The plan has membership merge this early. It lands in layer 2, after this layer-1 removal, so the red stands until it does. Membership's code is unaffected: `#custodialBar` answers through `notAnAdmin` (`MEMBERSHIP_CHECKS`), `#custodialRefusal` is never called with `NOT_AN_ADMIN`, and the control plane's `dec49Decorate` still finds C-96.1 through `M_MEMBERSHIP`.
2. **legacy-ui** (grep of `civicos-ui/`): `civicos-ui/test/custodial-acts.test.mjs`:381 and :400 read `CUSTODIAL_CHECKS.NOT_AN_ADMIN`; the suite throws before its foot (base 1/0, branch 0/1). It should read membership's `MEMBERSHIP_CHECKS.NOT_AN_ADMIN`. `civicos-ui/check-refusal-codes.mjs`:196–205, the HELD TWICE acceptance for C-96.1, is now stale and fails by name, as it was written to.
3. **legacy-tests** (the re-pins its bullet names):
   - The DEC-49 guard goes from 4 failures to 8. The four new ones:
     - families 110 → 109 (`ATTRIBUTION_CHECKS` gone; the name `CASE_DERIVATION_CHECKS` is still counted once, from case-authoring's own table);
     - rows 790 → 789 (C-96.1's copy);
     - governed sites 499 → 498;
     - the stale HELD TWICE acceptance.
   - `d470-catalog-census` goes 11/0 → 11/3: A1 (count floor 359, measured 358), A3 (census pin 1.43.0: 359/b28a8a91… vs 358/0586303a…) and A9 (source pin: `checkBundle` changed). These are promotion's new stamp and then legacy-tests' re-pin.
   - `d134-custodial-refusals` goes 11/0 → 11/5: three C-96.1 arms read the catalogue row, and the family count moves 12 → 11.
4. **Generated artifact (§14):** `agent-worker/dist/agent-worker.bundled.mjs` is STALE against `bio-checks.mjs` (`fleetbundles` 1/0 → 0/1; source now sha256 8b668ff3cbbe…, bundle built from 46d83734b732…). Not rebuilt.
5. **control-plane** (efficiency of its record, not behaviour): N334 took the gate's account out of the `AI_CREDENTIAL_CHECKS` header. That account covered the fence as a member-reach property of the OPS table, not a class list (PL-4's two proofs), and why the gate answers with one code where the mint answers with two. `src/control-plane/checks.mjs`' `AI_SCOPE_CHECKS` header (329–332) keeps only its first sentence. The rest is in git history, before `0ae4706953`, if control-plane wants it beside its rows.
6. **queue** (N325, layer 11): until queue registers C-19.1, no bundle check runs the inbox grammar. `checkInboxGrammar` is still exported, and queue's own write path (`src/queue/index.mjs`:3715) still calls it.
