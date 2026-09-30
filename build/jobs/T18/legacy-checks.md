# legacy-checks (T18)

**Status** · session_01PCFYYPfs1fNHKtD4GxpnRR · depth 2 · WAITING ON BOB (J1) · handled B1

## J1 · QUESTION

**Q1 · Where do this job's tests go?** `modules.json` gives legacy-checks `"tests": []`, but my entry says the seam is "tested with a stub arm", and `action-fold/deltas/legacy-checks.md` item 3 asks for "tests at the catalogue" (a `PLN-` id parses and types as `action_plan`; `open → closed` is the only edge; each new `proposalLabel` subject answers its three sentences, and an unknown subject still throws). I may write only my `paths` and `tests`, and every earlier legacy-checks job wrote no tests.

**My best reading:** you add `"tests": ["bio-plane/test/m/legacy-checks/"]` to legacy-checks in `modules.json` on `tranche/T18`. I write one suite there, `catalogue.test.mjs`, with tests named by their entry (N-A1, §1b), since there is no requirements file (coverage stays 0 of 0). I merge the tranche branch once you have added the path. Until you answer, I carry on with this reading and keep the suite uncommitted.

**For your plan (deletions, checked now on `job/T18/legacy-checks` @ the opening; I re-check after record-grammar merges):**
- `LAW_LEVELS` (catalogue :613): nothing imports it from the catalogue. `jurisdictions/index.mjs` holds the one in use, and actions and affordances read that one. It will be deleted.
- `CASE_MEMBER_ROLES` (catalogue :2426): nothing imports it from the catalogue. Ratification's copy (`ratification/checks.mjs`:144) is the one in use. It will be deleted.
- `contentIdFor` (catalogue :10652): **five legacy-tests files still import it from the catalogue.** They are `test/reading-position.test.mjs`:68, `rec85-arm-digest.mjs`:26, `content-reads.test.mjs`:50 and `fw19-extent-arms.test.mjs`:34, plus `fw19-rec85-digest.mjs`, which loads the whole catalogue dynamically. A missing named export fails a suite at load, so under the entry's own condition `contentIdFor` goes in T19, when legacy-tests re-points those files to `content/index.mjs` or retires them.
