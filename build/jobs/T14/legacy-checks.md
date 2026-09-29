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

## J2 · COMPLETE

**Entries applied** (layer 1's legacy-checks bullet; B1), in `bio-plane/checks/bio-checks.mjs`, commit 0ae4706953 (+38 −154):
1. **N325's share.** `checkBundle` no longer calls `checkInboxGrammar`. The call site and the function's header say why. The export stays for one tranche, and queue copies it at layer 11.
2. **N212's remainder.** The empty `CASE_DERIVATION_CHECKS` export is gone, with its C-44 header.
3. **N214's remainder.** `ATTRIBUTION_CHECKS` is gone, with its C-92 header. The `INSTALLATION_CHECKS` header is rewritten. It now describes the one row it holds, C-68.1 (`storageAbsent`), and says where the rest of C-68 is: C-68.2–.4 in control-plane's `BOOTSTRAP_CHECKS`, C-68.5 in publication's `PUBLISHED_STORE_CHECKS`.
4. **N334's header share.** `INSTALLATION_CHECKS` no longer describes the bootstrap complaints (item 3). `AI_CREDENTIAL_CHECKS`' header no longer describes the gate. It states what the family holds: C-29.1–.5 and C-29.11–.12, all minted in membership. It names control-plane's `AI_SCOPE_CHECKS` for C-29.6–.10.
5. **N251's share.** Both empty exports are gone (items 2, 3). No `test/m/` suite reads either one.
6. **K408 (4).** C-96.1's catalogue copy, `CUSTODIAL_CHECKS.NOT_AN_ADMIN`, is gone. The `CUSTODIAL_CHECKS` header now names membership's `MEMBERSHIP_CHECKS` as C-96.1's one row, and TARGET_NOT_AN_ADMIN's gloss replaces NOT_AN_ADMIN's.
7. **C-29.12 kept** (N327 is T15's).

**Rows and compositions for promotion to stamp (N318):**
- C-96.1 removed from the catalogue (membership's row stands).
- Families `CASE_DERIVATION_CHECKS` (catalogue's, empty) and `ATTRIBUTION_CHECKS` (empty) retired; neither held a row.
- `checkBundle`'s composition: C-19.1 no longer runs in it.

Census: 359 → 358 checks. No row was added or moved.

**Removal only (§12.2):** nothing imported. The only additions are comment text in the headers and at the call site.

**Deferred:** none. The `checkInboxGrammar` export goes in T15, as the plan says. Live ids: none (legacy); no `not yet met` marks to strike.

**Found in other modules:** REPORT J1. In short:
- membership's R84 test (`not-an-admin-visibility`:70) is red until its layer-2 job lands.
- `civicos-ui/test/custodial-acts.test.mjs` and the guard's HELD TWICE acceptance read the removed copy.
- legacy-tests' re-pins: the guard, d470 and d134.
- The agent-worker bundle is stale.
- control-plane has lost the gate's account.
- queue's C-19.1 is to come.

**Tests and checks run** (all against `tranche/T14` @ 9b786ffe2f as base):
- The module has no `tests` path and no requirements file. `build/manifest.md` names no layer tests.
- **Every module suite** (`node --test test/m/*/*.test.mjs`, from `bio-plane/`):
  - base: 2749 tests, 2732 pass, 0 fail.
  - branch: 2749 tests, 2731 pass, 1 fail. The one failure is membership R84 (REPORT 1).
- **The old battery:** all 201 suites that import the catalogue (`bio-plane/test/*.test.mjs`, `civicos-ui/test/*.test.mjs`) ran on base and branch, eight at a time. Five differ:
  - `d134-custodial-refusals`, `d470-catalog-census`, `fleetbundles` and `custodial-acts` differ as REPORT 1–4 says.
  - `leadslug` read 0/1 under load and passed alone three times (77 pass, 0 fail), as on the base.
  - Three suites are red on both sides, unchanged: `machinefences-dec49`, `add-surface` and `bias-vocabulary`.
- **The DEC-49 guard** (`civicos-ui/check-refusal-codes.mjs`): 4 failures on base, 8 on branch. The four new ones are in REPORT 3. The four old ones are the same on both sides.
- **Checks** (civicos-process @ 5c397bd):
  - `format: 69 modules, 64 requirements files; 0 failures`
  - `architecture: 1 product files, 0 relative imports (0 naming no tracked file, not judged); 0 failures`
  - `coverage: 0 modules, 0 of 0 live requirement ids named by a test; 0 failures`
  - `ownership: 2 files changed by legacy-checks between tranche/T14 and HEAD; 0 failures` (re-run after the record)
- **Reading:** the catalogue is 11,615 lines (772 KB). I read in full every family, header and function this job touched, the call site's surroundings in `checkBundle`, and every reader of the removed names. I did not read the whole file, as in T9 and T12: it would take about a fifth of this window, for no entry.

Size (session_01NWS1PUu3dajfGZfz3TptN7): test runs 583, module lines 11615
