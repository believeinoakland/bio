# T49 reds at the close (K2704)

Run: `node .github/scripts/module-tests.mjs` over `origin/tranche/T49` @ `75fbf0509f` (K3417), in a separate worktree with node_modules symlinked from /home/user/bio (bio-plane, bio-plane/src/journey-check, agent-runner, sheet-worker, site, pdf-worker, ocr-worker, newgroup), 2026-10-15. Log: `module-tests-T49-close.log`; the journey walk's full output: `journey-check-full.log` (both in this scratchpad). The tree was left clean (only the symlinks untracked).

**Totals:** 170 modules, 144 green, 26 red; 13766 passing, 47 failing tests (a `system/` file and a legacy-ui file count as one each). 43 failing tests are accepted by name; 4 are not (2 causes). One acceptance's clearing event has happened and been undone (the plane bundle, below).

Green since K3393: project-roster (owner-votes R30 passed this run; intermittent), notice-producers (K3400), op-declarations (K3394), installer/newgroup bundle (regenerated at 2ca83ab034), agent-worker (R45 and its fleetbundles staleness, K3411), screens-settings (K3410).

## Reds accepted by name

| module | test | ruling |
|---|---|---|
| test-support | R2 read-only tree removed (run as root) | rule 5 (6) / T50 5 (13), K3192 E |
| bundler | `system/fleetbundles`: agent-worker's 28 inputs pin | K3353 (N1107), T50 5 (4) |
| bundler | `system/fleetbundles`: bio-plane STALE BUNDLE (D-298 arm, byte-identity, manifest sha, comment-only arm) | rule 5 (5) / T50 5 (11), K1540 — **see note** |
| membership | R83 ×3, R140, R145 `MODULE_ORDER` | rule 5 (10) K3368 / T50 5 (5), N1115 |
| membership | t9 R79 listeners order | K3393 (N1115) |
| promotion | `m/promotion/registry` R39/R45/R46 total order | K3393 (N1115) |
| promotion | `system/row-census` R50 (22 admission rows C-29/32/38/64/78 awaiting stamp) | rule 5 (2), T50 5 (2) |
| ai-accounts, local-facts, standards, reading-guides, case-account, action-grammar, action-replies, filings, action-plans | one DEC-260 words-pin test each (t41 GROUP_KEY_NOTICE_DUE control; R16; R55; R14; R16; R26; R7; R52; R47) | K3393 (N1132), T50 5 (12) |
| filing-templates | r33 R33 RFC_QUOTING | K3381 (N1130), T50 5 (12) |
| scheduler | plane R12 expiry wake | K3363/K3364 (N1113), T50 5 (7) |
| affordances | t36 R62 design reads (`act.*.name`) | K3393/K3395 until N1125 |
| instance-setup | recovery R66 `recover({role})` | K3337/K3338 (N1103), T50 5 (8) |
| answer-envelope | families R15; catalogue-end R7/R2/R10/R13 and R13 (T46) | K3379, K3382 (N1128), T50 5 (6) |
| store-door | routes R15 `reauthdue` | K3393 (N1134), T50 5 (12) |
| store-door | promotion-step R5 rank | K3393 (N1115) |
| screens-wizards | library R1, R8 | K3383 (N1131), T50 5 (12) |
| screens-daily | contract R1–R13 `themeread` | K3403 / K3380 (N1101), T50 5 (9) |
| plane | store.test R2/R10 step rank | K3380 (N1115), T50 5 (5) |
| legacy-ui | civicos-ui ×8: group-identity-surface, group-surface, meaning-arms, progression-revision, queue-recipients, review-copy, several-cases-choice, statement-ack | rule 5 (4) (N794, N865, N1057) |
| journey-check | R1 (a), R9 (step 12: `question.concluded.by` not drawn on the question page), R10 (its consequent); 108 steps, 2 failures | K3411 (JOURNEY-CHECK #5 running) |

**Note (bundle):** L11's close regenerated the bundles at `2ca83ab034`; U282's merge then regenerated setup-words' `rows.mjs` (`5a15923842`), so `dist/bio-plane.bundled.mjs` is stale again. Still accepted under rule 5 (5) ("staled by any merge"), but its clearing event has already passed: the T49 close owes one more `node bio-plane/scripts/bundles.mjs` (and `program.mjs`) after the last merge.

## Reds not accepted

| test | since | cause | owner | smallest fix |
|---|---|---|---|---|
| admission `words.test.mjs` R28 (keys read are exactly `refusal.<CODE>` of its rows + the session key) | `338eede8d1` (U274/DEC-272 merge, K3406) | The regenerated `words-reads.json` (`words-reads.src.mjs`, now from literal keys only) lists admission as reading 1 key (`refusal.DOOR_RATE_LIMITED.session`); admission reads its 22 row keys as `` `refusal.${code}` ``, which the generator no longer sees (it listed 23 at `939ae99565`). The module is right; the list is short. | UX-DESIGN (generator) | Design lane: have `words-reads.src.mjs` expand admission's template keys (its rows' codes) as it did before DEC-272. Or admission's test only (as screens-settings did in K3410): require the rows' keys ⊇ READS and every row's key `hasWord`. |
| screens-entry `common.test.mjs` R21 (keys read = words-reads.json's list, no other) | `338eede8d1` (same) | Same generator change: screens-entry's list fell from 231 to 107 keys, missing every key built as `"screen.front." + k`, `screen.forgot.*`, `screen.join.*`… in `src/screens-entry/words.mjs` ("read beyond the list"). Its `READS.retired` is also absent now (line 177 would throw next, as screens-settings' R39 did in K3409). | UX-DESIGN (generator); else screens-entry (test) | Same as above. Test-only alternative: guard the absent `retired` and stop pinning equality with a list the generator cannot compute. |
| affordances `t36.test.mjs` R48 R53 R54 R56 R57 R61 (`meetsR48`) | `b97f699d59` (U277/DEC-273 merge, K3409) | DEC-273 rewrote `act.readtranslate.does` ("readtranslate's one explanation"); the test still pins the f498560a37 text, so `meetsR48` fails. | affordances (test only) | Re-pin `readtranslate` (or read it by key, as K3395 did for R48's other key). |
| affordances `t36.test.mjs` R61 (measured at f498560a37) | `b97f699d59` (same) | Same: asserts the old readtranslate sentence verbatim. | affordances (test only) | Same re-pin. |

K3417 said admission, screens-entry, affordances and store-door "fail identically on `c9348666d7`" without classifying them. Store-door's two reds are accepted (R15 N1134, R5 N1115). The other three are the 4 rows above. Checked at `338eede8d1^` (all green except affordances R62), `e41303e637`, `b97f699d59^` and `b9e610b5e8`.
