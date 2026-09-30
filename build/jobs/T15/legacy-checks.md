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

## J2 · COMPLETE

**Entries applied** (layer 1's legacy-checks bullet; B1), in `bio-plane/checks/bio-checks.mjs`, commit 56a2f0077a (+22 −152):
1. **N325's remainder.** The `checkInboxGrammar` export is gone, with the six private task vocabularies only it read (`TASK_ID_RE`, `TASK_KIND_ENUM`, `TASK_ROLE_ENUM`, `TASK_STATUS_ENUM`, `TASK_EVENT_ENUM`, `MEMBER_ID_RE`). A short note stands where it was, and `checkBundle`'s call-site note says the export went in T15. `isPublicHttpsLocator`, `ISO_TS_RE` and `BUNDLE_ID_RE` stay: queue imports them. The tombstones spell no retired C-number, so the file's C-number harvest no longer counts C-19.1 here.
2. **N327's remainder.** C-29.12 `AI_CREDENTIAL_ORG_NOT_ADMIN` is gone. The C-29 family header (:6734–6752) now counts C-29.11 alone beside C-29.1–.5 and says why the twelfth went (R62's refusal is membership's NOT_AN_ADMIN, K275, K408; nothing has minted it since MEMBERSHIP #7).
3. **PROMOTION #15's report.** The C-2.8 repair comment (:2168) now says `REOPENABLE_FROM` is promotion R51's frozen `["deferred", "dismissed"]`. It also names promotion's `#reopen` in place of `store.reopen()`, and says "a concluded inquiry in no case" (R24).
4. **N128's header share (optional, done).** `REGISTRATION_CHECKS`' header now says membership holds C-102.11 and C-102.12 (`MEMBERSHIP_CHECKS`, region `is-listener-registration`, through `listenerRefusal`).

**Rows and compositions for promotion to stamp (N318):**
- C-29.12 `AI_CREDENTIAL_ORG_NOT_ADMIN` removed (`AI_CREDENTIAL_CHECKS`).
- C-19.1: the catalogue's copy of `checkInboxGrammar` removed. Queue's row and check stand. `checkBundle`'s composition is unchanged (it stopped calling it in T14).
- Census 358 → 356. No row was added or moved.

**Removal only (§12.2):** nothing imported. The only additions are comment text.

**Deferred:** none. Live ids: none (legacy); no `not yet met` marks to strike.

**Found in other modules:** REPORT J1. In short: legacy-tests' re-pins (guard floors −1 each, d470 A1/A3/A9, two stale acceptances); `inbox.test.mjs` is not red; the agent-worker bundle is stale; a history line in `gate.mjs`.

**Tests and checks run** (base `tranche/T15` @ be5349250b):
- No `tests` path and no requirements file. `build/manifest.md` names no layer tests.
- **Every module suite** (`node --test test/m/*/*.test.mjs`, from `bio-plane/`): base 2830 tests, 2816 pass, 0 fail, 14 todo. Branch the same.
- **The old battery:** all 200 suites that import the catalogue (`bio-plane/test/*.test.mjs`, `civicos-ui/test/*.test.mjs`), on base and branch, eight at a time. Three differ: `d470-catalog-census` and `fleetbundles` as REPORT J1 says, and `leadslug`, which read 0/1 under load and passed alone twice, as in T14. `machinefences-dec49`, `add-surface` and `bias-vocabulary` fail on base and branch alike.
- **DEC-49 guard:** base 3 failures, branch 6 (the three floors, REPORT 1).
- `node checks/format.mjs`: 0 failures. `architecture.mjs legacy-checks`: 0 failures. `coverage.mjs legacy-checks`: 0 of 0 ids, 0 failures. `ownership.mjs legacy-checks tranche/T15`: 2 files, 0 failures.

Size (session_01BG5RDjmnEGneGN6yySvn8f): test runs 10, module lines 11485
