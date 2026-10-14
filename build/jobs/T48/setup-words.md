# setup-words (T48)

**Status** · session_01WvshQ6CPE3B9m9XqQMCTYo · depth 2 · COMPLETE · handled B1

**Read, whole:** `build/requirements/setup-words.md`; my entries T48-61 (three) in `build/plan/current.md` and B1; the layer-11 row of `build/layers.md`; the T47 record and its generator; my test; my module's header (its data rows are generated and were replaced whole; checked word by word by the test). Uses: none. No flaw found in the module or its test.
**Entry applied:** T48-61 first line (N847, N1047; DEC-221, DEC-226, DEC-227; R8). `bio-plane/src/setup-words/index.mjs` regenerated with the T47 generator (header now naming R1–R3, R5–R8 and this record; the generator is unchanged otherwise, recorded in `build/jobs/T47/setup-words.md`) over `git show 4664e8efd4:docs/development/ux-substrate/screens/words.json` (PR #34's merge): `WORDS_COMMIT` `"4664e8efd4"`, **1,895 rows, 652 protected**; no row's `en` holds "labelled".
**Entries 2 and 3, my reading (not applied; see J1):** the second asks to drop `rfc.quoting` and `refusal.RFC_QUOTING_MISSING` and to check `NOT_A_PARTNER`. At 4664e8efd4 the file still holds both (`rfc.quoting`, `refusal.RFC_QUOTING_MISSING`, protected, DEC-194), and R8/R1 bind `WORD_ROWS` to the file word by word, so dropping them would break R8. `refusal.NOT_A_PARTNER` is in the file and in the list in DEC-221's spelling ("organization"), checked. The "copies" in K3280 I read as another module's. The third declares `op=planask` as "this module declares every op", which is op-declarations' act, not this pure-data module's (R4: it decides nothing). Neither is in my requirements.
**Tests** (`bio-plane/test/m/setup-words/word-list.test.mjs`): `R1 R5 R6 R7 R8` the file at 4664e8efd4 word by word; negative control (now also refuses the R7 list 6f0d88d8d5); `R2 … R8` the commit; `R6`; `R7 R8` (R7's list moved, not kept; its provenance, with control); new `R8` (commit, counts, the DEC-226/-227 families present, no "labelled", controls); `R3`; `R4`. **8 pass, 0 fail.**
**Users' tests:** instance-setup 164/0, interface-shell 120/0, screens-entry 52/0, screens-wizards 32/0, screens-settings 83/0, screens-intake 58/0, screens-daily 64/0, screens-inquiry 64/0.
**Checks** (process repo): format 0 failures; architecture 0 failures; coverage 8 of 8, 0 failures; ownership 0 failures.
**Found elsewhere:** none. Generated artifact made stale: the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`, `.bundle.json`) takes this module as an input.
**Deferred:** none. **Final `uses`:** none.

Size (session_01WvshQ6CPE3B9m9XqQMCTYo): test runs 5, module lines 1904
