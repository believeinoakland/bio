# promotion (T34)

**Status** · session_011TTwXKMsCDA3RVYLNZrRLP · depth 2 · WORKING · handled B0

## J1 · REPORT

N631 is done and green on `job/T34/promotion` @ `99d13d07ac` (pushed), ready for the 0.80.1 cut (K1718).

**What changed.** C-20.1 (`src/promotion/history.mjs`, `checkMechanicalConformance`) now counts a file named in a mechanical promotion's manifest entry as written only when it is new (absent from that promotion's own pre-image snapshot) or its copy there differs from the digest the promotion's record states. A file carried unchanged is not written, and is never an envelope error. The comparison reads only that pre-image copy, at `_history/<dir>/<name>_<key>.<ext>` as record-core R15 names it, never the previous promotion's entry. A copy held as a blob is compared by the digest its reference states, never fetched. For that, `recordChecks` takes the image as given (`raw`), and the gate and the audit registration pass it. That is a three-line change in `gate.mjs` and `index.mjs`.

**R37, the case where the copy cannot be compared (my reading).** The snapshot lists the file (the entry's `snapshotted`) but the image holds no copy, or the copy or the promotion's record states no digest. Then whether the promotion wrote the file is undetermined. C-20.1 says so as a **warning**, naming the file and why: "…named '<f>', outside the mechanical envelope, and whether it wrote it is undetermined: <why>". It is neither an error (that would round undetermined to a refusal and block ratification) nor a silent pass. A name that the entry's `snapshotted` does not list and the image holds no copy of is new, so it is written, which is today's error. When the entry has no `snapshotted` list (an older export), an absent copy is read as absent from the snapshot, because R3 copies every live file.

**Tests.** `converts.test.mjs:150` (the R30 envelope test) is amended: carried unchanged → no error; changed from the copy → the envelope error. The new `test/m/promotion/tick.test.mjs` composes a real tick: `promote` into record-core itself (`recordOf` over a node:sqlite storage with `RECORD_SCHEMA`), then `runGate` over `record.readImage`. It has 4 tests: unchanged carry, no C-20.1 finding; changed carry, the error; blob-held carry, compared by its digest; copy absent, a warning only. Without the fix, 3 of the 4 fail, which reproduces K1718's defect. promotion's suite: 106/106 pass. d526: pass. case-checker: 34/34 (its `program.mjs` is unaffected; it bundles only `MECHANICAL_FIELD_SETS`, unchanged). monitoring: 114/115, and the one red is R18, inherited (K1737); it fails identically without this change. record-core: 124/126, with R76 and R62 inherited (K1732). format, architecture, coverage (56/56) and ownership: 0 failures.

**For the cut.**
- (1) `bio-plane/dist/bio-plane.bundled.mjs` is stale from this change (it bundles `gate.mjs` and `promotion/`); it is yours to regenerate.
- (2) R34: N631 changes what C-20.1 judges, so it moves `CATALOG_VERSION`. I have **not** moved it in this commit. Moving it renames the census fixture named in `modules.json` (`row-census-1.60.0.jsonl`) and stales case-checker's `program.mjs`, which embeds `CATALOG_VERSION`; neither is mine to write. The change is recorded and versioned in this job's stamp (1.61.0, "changed in what the gates run"). If 0.80.1 is cut from 0.80.0 plus this commit alone, its ratifications carry 1.60.0 with C-20.1 changed. Whether the cut takes a version move is yours.

Next: the stamp (N553, N601) over what is on `tranche/T34` now.
