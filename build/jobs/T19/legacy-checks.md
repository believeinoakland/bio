# legacy-checks (T19)

**Status** · session_01BjfEuoaa6XVXhVaMbV2YC9 · depth 2 · WORKING · handled B3

## J1 · QUESTION

Three points from the importer check, each with the reading I am working on now.

**Q1 · Two listed deletions still have a module-test importer in a later layer.** Measured on `job/T19/legacy-checks` @ 35d05bab1a, over every file importing the catalogue (named, namespace and dynamic imports):
- `MECHANICAL_FIELD_SETS`: `bio-plane/test/m/promotion/moved.test.mjs`:146 compares promotion's registry with `C.MECHANICAL_FIELD_SETS` (namespace import, :7). Promotion is layer 2.
- `VERSION_NOTICE_CHECKS` (C-80): `bio-plane/test/m/content/transcribe.test.mjs`:119–123 compares content's copy with `catalogue.VERSION_NOTICE_CHECKS` (dynamic import). Content is layer 4.

Deleting either fails a module test that is not mine to change. **My reading:** both are held under rule 1, like C-22 and the rest: promotion's L2 job and content's L4 job each drop their comparison and delete the catalogue's copy (both modules have `legacy-checks` in their `from`). I leave both in place and say so in my record. Every other name on my list has no importer outside the old suites and the generated bundles.

**Q2 · `isMachineMinted` overlaps record-grammar's move.** My entry deletes it (K653 BOB-1: no reader). record-grammar's entry moves "the machine-work labels (`CONTENT_MINTED_BY_PLANE` … `isMachineMinted`, …)", which names it as the end of the moved range. Once it is in record-grammar's paths I cannot delete it. **My reading:** record-grammar moves the range without `isMachineMinted`, and I delete it from the catalogue after record-grammar merges. Please confirm, or tell record-grammar. (`isSufficiencyClaimed` sits just before that range and is deleted now.)

**Q3 · Order of C-2.7 and the wrapper.** record-grammar removes `checkBundle` and its structural arms from the catalogue, and C-2.7's code sits between them. To avoid a conflicting merge, I delete C-2.7 and build the wrapper after record-grammar merges, as your START says for the wrapper. One correction to the list: the catalogue's `CONTENT_HASH_RE` is not C-2.7's alone. `correspondenceFindings` (C-2.10) also uses it, so it stays until action-grammar or actions takes C-2.10 (layer 9). It is not exported, so no importer is affected.

Done meanwhile, not yet committed: `SUGGEST_LEVELS`, `CIVICOS_CONTACT_URL` and `civicosUserAgent`, C-83 `RENDER_CAPTURE_CHECKS`, `DRIVE_CAPTURE_CHECKS` and `isSufficiencyClaimed` deleted, each leaving a one-line note. N437's three comments re-worded. Five stale `where`s fixed: C-28.13 now names `src/acquisition/index.mjs` (`awaiting stamp`), and C-32.1 and C-33.10–.12 now name `src/ratification/release.mjs`. N70's and N44's promotion rows already resolve: every promotion `where` names a live function and region.

## J2 · QUESTION

**Q4 (on B4) · Deleting C-2.7 turns four module tests in other modules red.** The wrapper is written. Parity, measured by running the whole `test/m` battery with every catalogue `checkBundle` call also run through the pre-change catalogue (scratch instrument, not committed): 420 calls. Every finding other than C-2.7 is identical in content, ids, severities, messages, codes and order in all 420. 163 calls differ, and only in C-2.7:
- 162 are calls that register no C-2.7 grammar, so the catalogue's built-in arm no longer fires for them;
- one is an error message naming a list position. Fixed: the caller's grammars now come first.

Four module tests assert the built-in arm and fail once C-2.7's code is deleted:
- `test/m/capture/grammar.test.mjs`, both R37 tests (layer 3): they compare capture's grammar with "the catalogue's own arm";
- `test/m/promotion/gate.test.mjs` R27 (layer 2): "the built-in information arm judges this document";
- `test/m/instance-setup/intake.test.mjs` R45 (layer 11): it calls the catalogue's `checkBundle` with no grammars and expects C-2.7 for a missing hash.

**Product callers (your check):** every catalogue `checkBundle` caller in the product registers capture's grammar or judges no information bundle:
- the audit (`record-core` `auditPass`) passes `grammars()`;
- the gate goes through `promotion.runGate`, which passes `record.grammars()`; ratification and action-plans reach it there;
- capture registers its grammar in `captureOf`, which `Store`'s constructor calls (`src/store.mjs`:159);
- `inquiry/grammar.mjs` `checkInquiryEntry` judges inquiries only, and C-2.7 fires only on `information`.

So the product loses nothing. Only the four tests do.

**My reading, built now:** C-2.7's code stays in the catalogue as one more `LEGACY_GRAMMARS` entry, held under rule 1. It fills the C-2.7 slot only when the caller's grammars claim none, so a caller registering capture's grammar gets capture's, and the battery stays green with exact parity. The held copy is deleted by the last of the three jobs to re-point its test to capture's grammar: promotion (L2), capture (L3) and instance-setup (L11). All three have `legacy-checks` in `from`. **The alternative:** delete it now and route the four tests to those jobs, with layer 1 closing red on them by name. Say which; switching is a small change on my side.

`isMachineMinted` and every structural-arm copy record-grammar now holds are deleted, and `EXTENSION_ARMS` is re-exported.
