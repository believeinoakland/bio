# promotion (T19)

**Status** · session_01HJeD3rGAqsS7o4aqav9wm3 · depth 2 · WORKING · handled B9

## J1 · QUESTION

The entry says "as drafted" (draft-T19.md:41) plus your START's list. Measured at HEAD, my best reading of the drafted share, which I am building now:

1. **Re-points.** Every catalogue name promotion's code imports goes to record-grammar (parseFrontmatter, normalizeType, vocabFor, STATES, deriveInquiryTitle, inquiryQuestionOf, isMachineIdentity, canonicalJson). `checkBundle` too, once record-core's L2 job registers `LEGACY_GRAMMARS` at construction: until then gate.mjs keeps the catalogue's wrapper. CUSTODIAL_CHECKS and PROJECT_VISIBILITY_CHECKS go to membership after it merges.
2. **Rows into promotion's table**, each a ✱ move, so the census counts each line once: C-33.21 CAS_STALE, C-33.24 FILES_DROPPED, C-33.38 FILE_DIGEST_MISMATCH, C-33.49 ABSENT, C-67.1 SNAP_KEY_TAKEN (from ACT_SHAPE_CHECKS), C-32.5 MACHINE_CANNOT_REOPEN (MACHINE_FENCE_CHECKS), C-26.12 BIAS_ILLEGAL_TRANSITION (BIAS_CHECKS), C-59.1–.4 (PROJECT_ID_CHECKS), C-102.4–.9 (REGISTRATION_CHECKS), C-64.1 GROUP_UNDETERMINED (INSTANCE_GROUP_CHECKS). Lines unchanged except C-64.1's `where`, which goes to a new promote region `is-group-undetermined` (N44's missing marker). Each row leaves the catalogue table only when no other module's code or module test reads that code there. A table some later module still imports keeps its other rows. A whole table is deleted only when I am its last importer (rule 1). For PROJECT_ID_CHECKS and REGISTRATION_CHECKS that is after record-core merges. INSTANCE_GROUP_CHECKS stays for inquiry and strength (L6) and instance-setup's `setup.mjs` (L11), so C-64.1 is held twice until then.
3. **C-18.6/.7** (`checkInfo2Contract` with `CAPTURE_ENCODINGS`, `RAW_SHA_RE`, `storedToHashable`) moves to promotion. It becomes a grammar registered with record-core from `promotionOf` (claiming C-18.6, C-18.7), and its entry leaves `LEGACY_GRAMMARS`. Findings are identical at the gate and the audit. No R states it. I propose **R55**: "Promotion registers with record-core, once per record (its R67), the information@2 register grammar C-18.6 (a registered capture's stored bytes hash to its recorded digest; error) and C-18.7 (a release with no signed release record; warning), claiming those two ids, so the gate (R27) and the audit judge them identically." Please word it, or rule it out of T19.
4. **CHECK_RETIREMENTS** stays in the catalogue. It has no row with a C-number, so R50 does not count it. Its only readers are legacy-tests' `check-firing`, so no module needs it. I read the drafted ✱ as moot and propose deleting it with the catalogue file (control-plane, L11).
5. **CAPTURE_REQUEST_CHECKS**: the gate imports none now, so nothing is mine. **N70**'s nested `fact` refusal is already met (`#fact`). **N221**: confirmed, `runCaseGate` holds no per-member fallback.
6. **Store share** ("sight reindex and visibility answer"): `store.mjs` now only delegates to `promotionOf(...)`. I find nothing left to move except R54's three arms, which legacy-store spreads (K671).

The answer decides only items 3 and 4. I carry on with the rest.

## J2 · REPORT

Progress @ f5301d174b. Built: R52, R53 (also end to end through the Store: a plan and an escalation under a project are hidden from a member outside it on `op=list`), R54, R55 (K773). Rows C-33.21/.24/.38/.49, C-67.1, C-32.5, C-59.1–.4 and C-102.4–.9 moved into promotion's tables. C-26.12 and C-64.1 are copied (held twice). The C-64.1 region is added (N44). Every catalogue name is re-pointed to record-grammar. `MECHANICAL_FIELD_SETS`' catalogue copy is deleted (K750). gate.test's R27 is off the held C-2.7 (K767). N221 is confirmed. Catalogue diff: 0 lines added. Promotion's tests: 107 pass, 1 red, the rule-8 one below. Still to do: the stamp, after record-core, credentials and membership's deletion merge. Also CUSTODIAL_CHECKS → membership's copy once its deletion lands.

**For you:**

1. **Needs a `uses` edge: promotion → record-grammar.** Architecture fails without it: promotion's code and tests now import record-grammar (the re-points). `modules.json` is yours.
2. **legacy-checks' own test goes red from R55, as K773 implies.** `test/m/legacy-checks/catalogue.test.mjs`:271–286 pins six `LEGACY_GRAMMARS` slots, and there are now five. Re-open legacy-checks to drop C-18.6/.7 from `LEGACY_SLOTS`, or accept it red by name.
3. **provenance (L3): `register-checks.test.mjs`:105 goes red** ("R45: C-18.6 … at the gate"). It calls the catalogue's `checkBundle` with no grammars and expects C-18.6. The arm is now promotion's registered grammar (R55). Provenance's job should re-point the test to promotion's `checkInfo2Contract` / `INFO2_GRAMMAR`, which needs a `uses` edge on promotion. Provenance's R45 names C-18.6 at the gate, so check its wording against promotion R55.
4. **ratification (L8): `release.test.mjs`:195 goes red, by design of R52.** Its setup asserts a bundle whose document says `criticality: crucial` is recorded `supporting` (line 200). Promote no longer records that (N425). The verdict it tests, CRUCIAL_IN_BATCH, still holds, so only that setup line needs re-wording.
5. **Rule 8: `MODULE_ORDER` lacks `plane`** (added to `modules.json` at K771). The three `MODULE_ORDER` tests are red: membership's `module-order`/R79 and promotion's R39/R45/R46. That is membership's (K657).
6. Already red on the tranche, not mine: query-language's five (K776).
7. **legacy-ui guard** (not run per tranche): `ABSENT` is also minted at `store.mjs` gateFacts and `src/index.mjs` op=monitor, and its row now lives in promotion's table, not a catalogue `_CHECKS` family. Same for C-32.5, C-33.21 and the others. `civicos-ui/check-refusal-codes.mjs` harvests only catalogue families, so it will report those codes rowless at the release.

## J3 · REPORT

B6 done @ HEAD. I merged tranche/T19 and removed rows from the catalogue (pure removals; promotion holds C-102.4–.9 since J2):
- C-102.1–.3 from `REGISTRATION_CHECKS`; record-core holds its own.
- C-102.10 from `REGISTRATION_CHECKS`; ratification's `RATIFY_REGISTRATION_CHECKS` holds it.
- `PROJECT_ID_CHECKS` whole; C-59.5 is record-core's, C-59.1–.4 promotion's.

`REGISTRATION_CHECKS` is now an empty export. I cannot delete it yet, because connections' `test/m/connections/derive.test.mjs`:6 still imports it. The rows it reads there, `LISTENER_*`, are membership's and were never in that table. Rule 1: connections' L5 job re-points the import and deletes the export. The old suite `test/mint-ledger.test.mjs` imported `PROJECT_ID_CHECKS`; it is not run per tranche (K619).

One more red from R55, which you may want to accept by name with legacy-checks': record-core's `record-core.test.mjs`:2058 hard-codes the five legacy grammars `registerLegacyGrammars` registers, and there are now four. This is K781 (2)'s pin, one module over. The rest of that test holds: its own findings equal the catalogue wrapper's.

`gate.mjs` keeps the catalogue's `checkBundle` wrapper. Its module-level `runGate`, with no grammars passed, must still judge with the legacy slots (R27). Record-core keeps its own oracle import "with the catalogue (rule 1)" in the same way. Promotion's instance gate passes `record.grammars()`, which now include the legacy registration.

Waiting for membership's deletion, then CUSTODIAL/PROJECT_VISIBILITY re-points and the stamp.

## J4 · REPORT

K785/B8 applied @ 0fab60b7a5.
- `gate.mjs` takes record-grammar's `checkBundle`.
- Every test oracle on the catalogue is gone:
  - gate, release and history now use record-grammar's `checkBundle`;
  - moved and grammar assert at the interface only;
  - write-path R18 reads promotion's own tables, plus the five rows later modules enforce at this write, stated by code (SELF_BASIS, BASIS_CYCLE, VERSION_FROZEN, VERSION_LEG_UNRESOLVED, SURFACED_BY_REWRITTEN; P4 forbids importing their tables);
  - promote.test's row walk reads membership's exports.
- Two catalogue imports are left, for membership's deletion: `CUSTODIAL_CHECKS` (`index.mjs`; EXISTS, C-96.4) and `PROJECT_VISIBILITY_CHECKS` (`fixtures.mjs`). No caller outside promotion uses the module-level `runGate`; ratification goes through `promotion.runGate`, which passes `record.grammars()`.

**Turned red by the switch, ratification's (L8):**
- `converted-c.test.mjs`:226 (casesign §4)
- `converted-d.test.mjs`:479 (multifinding)

Both expect C-2.8's case-key arm at op=ratify. Their test world builds a record that never calls record-core's `registerLegacyGrammars(record)`, so no legacy slot is filled. In product the Store's constructor calls it (`store.mjs`:167), so `op=ratify` still runs C-2.8. Fix: the world calls `registerLegacyGrammars`, as `store.mjs` does. That belongs in ratification's L8 START, with release.test's line.

**Red on the tranche base already, not mine:**
- capture `grammar.test.mjs`:77 and :115 (record-core's R67 rework: no GRAMMAR_DECLARED on a shared slot, and the audit has no C-2.7 without a registration)
- control-plane `families.test.mjs`:47
- record-core :2048 (re-opened)
- query-language ×5
- membership's module-order (`plane`)
