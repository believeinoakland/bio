# legacy-checks (T15)

**Status** · session_01BG5RDjmnEGneGN6yySvn8f · depth 2 · COMPLETE · handled B1

## J1 · REPORT

Found in other modules by this job's removals (B1). None edited.

1. **legacy-tests** (the re-pins; every one is the retirement landing, not a regression):
   - DEC-49 guard (`civicos-ui/check-refusal-codes.mjs`) goes from 3 failures to 6. The three new ones are the floors: rows 796 → 795, census 1084 → 1083, reach 831 → 830 (C-29.12's row). Its accepted-unminted list (:4092–4098) still names `AI_CREDENTIAL_ORG_NOT_ADMIN`; it is stale now and should go.
   - `d470-catalog-census` goes 11/0 → 11/3: A1 (floor 358, measured 356), A3 (census pin 1.44.0: 358/0586303a… vs 356/968acdfb…) and A9 (source pin moved: `checkInboxGrammar` gone). These are promotion's stamp (current.md's promotion bullet), then legacy-tests' re-pin.
   - `test/aicredential.test.mjs`:824–832 accepts C-29.12 as unminted by name. It still passes (its filter drops a row the registry no longer holds), and the acceptance can go.
   - `test/inbox.test.mjs`:27 is NOT red: LEGACY-TESTS #12 already re-anchored it on queue's `checkInboxGrammar` (`src/queue/checks.mjs`). B1's accepted-by-name red is not needed.
2. **Generated artifact (§14):** `agent-worker/dist/agent-worker.bundled.mjs` is STALE against `bio-checks.mjs` (`fleetbundles` 1/0 → 0/1; source now sha256 5a00c9626df0…, bundle built from 8b668ff3cbbe…). Not rebuilt.
3. **promotion** (comment only): `src/gate.mjs`:191 lists C-29.12 among T4's additions. That is history and true; if the gate keeps a live row list, C-29.12 is no longer in it.
4. **civicos-ui / affordances:** no hit for `checkInboxGrammar` or the removed task vocabularies; the one `AI_CREDENTIAL_ORG_NOT_ADMIN` hit is the guard's list in item 1.
