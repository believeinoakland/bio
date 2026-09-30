# legacy-checks (T18)

**Status** · session_01PCFYYPfs1fNHKtD4GxpnRR · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

**Q1 · Where do this job's tests go?** `modules.json` gives legacy-checks `"tests": []`, but my entry says the seam is "tested with a stub arm", and `action-fold/deltas/legacy-checks.md` item 3 asks for "tests at the catalogue" (a `PLN-` id parses and types as `action_plan`; `open → closed` is the only edge; each new `proposalLabel` subject answers its three sentences, and an unknown subject still throws). I may write only my `paths` and `tests`, and every earlier legacy-checks job wrote no tests.

**My best reading:** you add `"tests": ["bio-plane/test/m/legacy-checks/"]` to legacy-checks in `modules.json` on `tranche/T18`. I write one suite there, `catalogue.test.mjs`, with tests named by their entry (N-A1, §1b), since there is no requirements file (coverage stays 0 of 0). I merge the tranche branch once you have added the path. Until you answer, I carry on with this reading and keep the suite uncommitted.

**For your plan (deletions, checked now on `job/T18/legacy-checks` @ the opening; I re-check after record-grammar merges):**
- `LAW_LEVELS` (catalogue :613): nothing imports it from the catalogue. `jurisdictions/index.mjs` holds the one in use, and actions and affordances read that one. It will be deleted.
- `CASE_MEMBER_ROLES` (catalogue :2426): nothing imports it from the catalogue. Ratification's copy (`ratification/checks.mjs`:144) is the one in use. It will be deleted.
- `contentIdFor` (catalogue :10652): **five legacy-tests files still import it from the catalogue.** They are `test/reading-position.test.mjs`:68, `rec85-arm-digest.mjs`:26, `content-reads.test.mjs`:50 and `fw19-extent-arms.test.mjs`:34, plus `fw19-rec85-digest.mjs`, which loads the whole catalogue dynamically. A missing named export fails a suite at load, so under the entry's own condition `contentIdFor` goes in T19, when legacy-tests re-points those files to `content/index.mjs` or retires them.

## J2 · REPORT

What this job's change means for other modules:

1. **Stale generated artifacts (§14).** The agent-worker bundle takes `bio-checks.mjs` as an input (K189), so `agent-worker/dist/agent-worker.bundled.mjs` is stale. The plane bundle's catalogue copy is too (`bio-plane/dist/bio-plane.bundled.mjs`). I rebuilt neither; they are yours at the layer close.
2. **Red on `tranche/T18` before my change, and unchanged by it (membership, promotion).** Three module tests fail identically on this branch and on `origin/tranche/T18`:
   - membership `module-order.test.mjs` R83;
   - membership `t9-notice-sight-bounds.test.mjs` R79;
   - promotion `registry.test.mjs` R39/R45/R46.

   All three compare the plane's `MODULE_ORDER` with `build/modules.json`, which gained `record-grammar`, `op-declarations` and `admission` at the opening. Membership's `MODULE_ORDER` has not caught up.
3. **The seam's registrants (record-core, promotion; layer 2).** `checkBundle(input, {grammars})` takes `[{module, ids, arm(ctx, findings)}]`. Registrations are judged whole before any arm runs:
   - a malformed entry is a `TypeError`;
   - a partial claim, a claim spanning two arms, or an id claimed twice is a `RangeError`.

   The claimable built-in arms are exported as `EXTENSION_ARMS`:
   - `checkInformationExtension` C-2.7;
   - `checkInfo2Contract` C-18.6, C-18.7;
   - `checkInquiryExtension` C-2.8;
   - `checkProjectExtension` C-2.9, C-9.1.

   Each arm is claimed by its whole id list and replaced in its own slot, so the findings keep their order. A grammar that claims no built-in arm runs after the type arms, in list order. record-core's `registerGrammar` can mirror these refusals as its R59-style codes.
4. **The census, `awaiting stamp` (promotion's stamp, layer 2).** No C-id is added, moved or removed. C-2.5 now also admits a schema stamp whose type holds `_`: its form is `^[a-z][a-z_]*@\d+$`, where it was `^[a-z]+@\d+$`. Without that, `action_plan@1` could never pass. The removed exports are `LAW_LEVELS` and `CASE_MEMBER_ROLES`; the added ones are `EXTENSION_ARMS` and two `PROPOSAL_STATES` subjects.
5. **action-plans and filings (layer 9).** `PLN-` now passes end to end: `STATES.action_plan`, `action_plan@1`, and record-grammar's prefix. `proposalLabel(x, "plan_option")` and `proposalLabel(x, "communication")` are live.
