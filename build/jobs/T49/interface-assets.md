# interface-assets (T49)

**Status** · session_01Ves3w5WxdoMvxyx1BbZ6fQ · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

**COMPLETE** · T49-19 interface-assets · commit `7f584f6982` on `job/T49/interface-assets`

**Entries applied.** R8 (N1090, N1094; DEC-236 B204 (1), (3); DEC-240 N1049; DEC-241). `ASSETS_COMMIT` is `f498560a37` (PR #37's merge; no later `main` commit changes the visual language or `page.src.html`, checked by `git log f498560a37..main` on both paths). `ASSET_FILES` is regenerated there: 21 names, as before. Tests: R1, R5 and R7 now pin `f498560a37`; a new test names R8 and a control refuses a missing named class, a missing band and a `mk-device`/`mk-scaler` rule.

**Measured first (START item 1).** At `f498560a37`, in `page.src.html`: every named `shell.css` class is present (`.mk-menuwrap`, `.mk-menu`, `.mk-actwrap`, `.mk-slot`, `.mk-rowname`, `.mk-scrim`, `.mk-image`, `.mk-imgareas`, `.mk-imgarea`, `button.mk-avatar`, `.mk-grp`, `.e-step_source`, `.mk-morerows`, `.mk-morerow`); `civicsmith.css` holds `.cs-band[data-band="test"]`. Size: `index.mjs` 1,145,831 → 1,149,693 bytes (+3,862 B, about 0.01% of bundler R31's 32 MiB warning). The 15 faces are unchanged.

**Two test decisions, both in this module.** (1) The R8 test matches a class as a selector token, so `.mk-slot:empty` names `.mk-slot`. (2) R7's phone-weight check now exempts the page's own `@media (max-width: 760px)` rules (`.mk-compare` at the new commit). R7 requires the weight only on phone rules; the requirement text is unchanged, the test was stricter than R7.

**Reading (§6 step 2).** Read whole: R1–R8 with the private parts; plan entry T49-19 and rules 1–6 and the measure-first section; the layer 11 row; `modules.json` for this module; `generate.mjs`; `assets.test.mjs` (names R5 and R7, changed here). `index.mjs` is generated data outside the reading set (K2053, K2083), so not read whole. Other tests run, not read. `Uses` is none.

**Inherited reds.** Coverage on R8: met (8 of 8 live ids named). The plane bundle (rule 5 (5)): not regenerated; it regenerates at the layer close (§5.6). Rule 5 (7) reds are not this module's.

**Rule 6 items.** No member-facing English in this module. No `labelled`. No `admin` reaches a reader. No hand-list of this module in `draft-T49-N1073-hand-lists.md`. No `ok: true` answer. Nothing to change.

**Deferred.** None.

**Other modules.** Nothing found by this job. `checks/run.mjs` reports 17 coverage failures in 16 other modules, all with T49 jobs still open (`admission`, `affordances`, `control-plane`, `interface-shell`, `journey-check`, `op-capabilities`, `op-grades`, `screens-*`, `setup-words`, `site`). None is in `interface-assets`.

**Checks.** `node checks/format.mjs /home/user/bio`: 0 failures. `architecture.mjs … interface-assets`: 0 failures. `coverage.mjs … interface-assets`: 8 of 8 named, 0 failures. `ownership.mjs … interface-assets tranche/T49`: 4 files (3 module files and this record), 0 failures. `run.mjs /home/user/bio`: format 0, architecture 0 (3,351 files), channels 0; coverage 17 failures, all in the modules above.

**Tests.** `node --test bio-plane/test/m/interface-assets/`: 16 pass, 0 fail (3 runs; the last after the test changes above).

**Commit note.** The commit has the session trailer only. I left out the model-name co-author line the session attribution asked for, because the rule against model identifiers in commits applies.

Size (session_01Ves3w5WxdoMvxyx1BbZ6fQ): test runs 3, module lines 160
