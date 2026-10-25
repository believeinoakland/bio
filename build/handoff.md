# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #294 (`session_01XtZDGYwxYSYJSAoejQAGGw`, depth 1, parent ROOT #9 `session_01GndWUi5ubGmXCVVnFqtJAi`, third account) for BOB #295, 2026-10-25, past 40 % context. **T51 is OPEN** on `tranche/T51`; **fix round 10 is running** (opened K5065). Read rulings K5127 to the last line of `build/rulings.md` whole, `build/plan/fix-round-10-T51.md` whole (§3, follow-ups 7-68, is the owed list), `build/plan/fix-round-10-waves.md` whole, `build/plan/walk-T51-final/BRIEF.md` with `PHASE1-NOW.md`, and the final pass's diagnoses `build/plan/walk-T51-final/diagnosis/diag2-*.md` (committed with this handoff).

## Bob's rulings this session (in `rulings-active.md`)

- **K5136:** weekly usage is Bob's to watch; BOB never raises it; accounts move only when Bob says development is moving.
- **K5137:** Bob's standing approval covers merging development pull requests, the process repository's included; never bring him such a merge. (civicos-process PR #7, the scoped size gate and JOB.md's K5120 line, is merged; `main` at `e54912f5b9`.)
- **K5141:** UX design #40 runs on Bob's primary account (`session_01DtBKhrSmV3NbfCcEaygkz9`); BOB on the third account cannot start or ring it; its successor is Bob's to start, BOB tells him in plain steps when a NOTICE asks (U472's way).

## Open with Bob

Nothing.

## Running

- **STORE-ASSEMBLY #1** `session_01PFCJP5a6GVyjzzsxKD2a53` (critical path). At its merge (K5125, K5139): add its `paths` `["bio-plane/src/store-assembly/"]`, `tests` `["bio-plane/test/m/store-assembly/"]` and four test-only `uses` (`case-grammar`, `answer-envelope`, `connection-grammar`, `signatures`) to `modules.json` in the merge commit, then `order-build.mjs --check` and format; accept by name its 11 ledger-test lines (68), its 15 unkeyed strings (round-end words), `release.test.mjs` R23 (UX); R98 and R1's class clause stay `test.todo`. Then start `store-request` (START `store-request.txt`, gained the world's case-file sweep), then interface-shell, batch 7 (screens-publish and screens-investigate STARTs gained follow-ups 54 and 59) and the screens' op-table CHANGEs.
- **EXTRACTION #47** `session_01Jvm3Svfx7hGZ595k1aGkp6`: ANSWER B62 (re-mark `transcribe-not-sent` to `plane`) and CHANGE B63 (publish four `readHeld` answers, 68). At its merge: make agent-worker `fixtures-contracts.test.mjs:84`, `:101` plain comments (K4297 (2)); then a CHANGE to STORE-ASSEMBLY to re-point its 11 lines.
- **CONTROL-PLANE #60** `session_01CCU5PERV9DBgQStnjK7jSm`: cause D2 (60) and CHANGE B88 (adopt the two door tests, 66). Its Wave B (8, 42) is a later session after `store-request`.
- **SCREENS-DAILY #21** `session_01GykapzvyLDepprUbDPaXny`: CHANGE B40 (the `answers` edge); at its merge strike R6's mark. Its op tables stay batch-7 work.
- **Walkers WALK-FINAL-02, -03, -06, -10B, -11** (sessions in K5122): at every backstop fetch each `prep/final-<area>`, place every new BROKEN row; at DONE commit the record (over 51,200 bytes: whole under `build/plan/archive/walk-T51-final/`), scripts and shots, archive the walker with a `study-walk` row. 01, 04A, 04B, 05, 07, 08, 09, 10A are DONE, committed and archived (K5127, K5141).

## Then, in order

1. **Place the final pass's diagnoses** (`diagnosis/diag2-*.md`, about 100 rows over 02, 03, 04A, 04B, 05, 07, 08, 09, 10A, 10B): read every cited line before placing (K4849); one owning job per cause, START built by the `mkstart` pattern below; requirement wording BOB's where it states behaviour already ruled (K3259), marked `*(not yet met: T51)*`; words to UX-DESIGN in one HANDOFF; specified and walker-error rows recorded in the plan without a job. Rows K5129-K5131 placed are in plan items 48-63.
2. Merge each COMPLETE as it comes (premerge below); keep slots full, providers first (K4215); archive each merged session with its row (K4219).
3. Owed follow-ups still open: 8 and 42 (control-plane Wave B), 12 + 23 (plane, after the world; adds `fixtures-run` for `transcribe-not-sent`), 13 (extraction's `t48`), 15, 33 and the waves' §4 modules in the §5.10 pass (doorbell's lines moved out to 65), 32 (promotion's stamp, last), 35 (screens-inquiry, with inquiry's `questionWaitsSetAside` re-point, 55), signin-door done, 52 done, 65 (provenance `homeOf` fixture, then doorbell's 13 lines), 68.
4. After the round: the generated artifacts (manifest order; stale: plane, agent-worker, pdf-worker, ocr-worker bundles, `program.mjs`, setup-words `rows.mjs`), the round's words HANDOFF to UX-DESIGN (`fix-round-10-words.md` plus the new member sentences: `store-door.title.material_handed_doorbell_on`, `action-plans.why.suspected_matter_concluded`, calculations' refusals, `screen.objective.purpose`, 01's "administrator token"), then K5063's step 4 (redeploy biosmoke8 with the owed live checks, including doorbell's 11.19 MB body limit; the targeted re-walk; the final pass live (Phase 2); the 0.87.0 cut, installer and site deploys, the rehearsal), then T51's close (§5.7).

## Tools

- The mail tool and checks: civicos-process `main` (now carries `jobbranch` and the scoped gate): `git worktree add --detach <dir> origin/main`; run with `--product /home/user/bio --tranche T51`. `mail check` prints `NEAR` above 95 %.
- Premerge, per module, each a plain command (a chained compound was refused once, K5132): `git fetch origin job/T51/<m> tranche/T51`; ownership against `git merge-base`; a detached worktree of the job branch; `checks/fixtures.mjs <ABSOLUTE worktree> <m>` and `checks/architecture.mjs <worktree> <m>`; read every added `fixtures-(own|generic|contract|run)` marker. A through-the-door test importing control-plane's `r8-kit.mjs` belongs to control-plane (K5138). After merging `--no-ff`: architecture over the tree, `words.mjs <m>` at 0 (BOB fixes a copied test sentence, K4297 (2)), strike the marks; check `git ls-remote origin tranche/T51` equals HEAD.
- STARTs: the shared header of `starts-T51-F10/extraction-2.txt` (sonnet) or `signin-door-2.txt` (haiku) with the module, number, follow-up and ruling replaced, then the cause with K4426's four fields and `**Done:**`. Never reuse a START file name.
- `rulings-active.md` is at 24,312 bytes and 78 lines: a new rule replaces or merges a line.

## Acts on main or sessions (reviewed acts, §5.8)

- bio `main` moves only by T51's close PR (§5.7 (3), CLAUDE.md's standing direction), the design MERGE first (K1177); no refusal recorded.
- civicos-process `main`: by PR with the GitHub merge tool (K5036, K5137); K5134 records a safety-check refusal of PR #7's merge, approved by Bob (K5137): take such a merge as one plain call citing K5137.
- biosmoke deployments: K4841, K5120. Account `…7f72` only, plus the rehearsal account (K4942). Job branches only by `mail jobbranch`; never a force-push.

## Timers and lanes

- My timers: backstop `trig_01Ftwm6Lw7h9oQzDwrxVoFm7` (15:43Z, re-armed each check; the latest id is in the last ruling if it changed), WATCH #294 `trig_01FbeDWD22N1yoP1vKPSV2MV` (16:25Z): delete both at takeover.
- Lanes nothing past H43, A41, W4, P26; channel: UX-DESIGN read through U472; B517 and B518 unread by UX design #40.
