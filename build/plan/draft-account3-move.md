# Moving the work to the third account (draft; K4614, K4781; BOB #268)

**Status** · Draft by BOB #268, 2026-10-23. Folded into `build/handoff.md` at the handoff that makes the move. The move happens when re-walk 7 and the whole suite have finished on the secondary account and their records and fix plan are committed (K4781), at a point where no job runs.

## What moves, and what stays

- **Moves:** the BOB lane. State lives in git (`tranche/T51`, the mail branches, civicos-process), so nothing is carried but the handoff. The successor BOB runs on the third account with the same repositories.
- **Stays, unreachable from the third account** (sessions on one account cannot see another's: no `get_session`, no doorbell, no archive): ROOT #8 (secondary), every lane session on the secondary account (PERFORMANCE #1, JOURNEYS #3, AI-DESIGN #1, INVESTIGATION-DESIGN #2) and UX-DESIGN #39 (primary). Their files are in git, so the new BOB still reads every `HANDOFF.md` and the channel; it cannot ring, archive or start sessions there. Each is left as it stands, with no `BOB-final` row for this account's BOBs (K1428): BOB #268's row is written by a successor on this account if one exists, else named as a P14 gap.
- **New on the third account:** ROOT #9 (started by Bob), BOB #269 (started by ROOT #9), and every session after: PERFORMANCE #2 (K4735), the offline final-pass walkers (own sessions, K4782), the live walkers at everyday load (K4783), fix-round jobs. A lane that must continue (JOURNEYS, PERFORMANCE) gets a successor started there by BOB.

## Records to change at the move (BOB, the first BOB on the third account)

- `build/manifest.md` "Starting a session": ROOT #9's id and account; ROOT #8 superseded.
- The plan's Status line and BOB's Writer line (`mail bob`; `xwriter --account third` if it warns).
- `build/channels.md`'s `BOB` row `account` → third: only at T51's close (K1897; §13.1 (1)); until then the Writer line names the account.
- `rulings-active.md`'s account-switch line names three accounts.

## Bob's acts (in plain steps, given to him at the move)

1. Confirm the third account's cloud environment holds what this one does: both repositories (`believeinoakland/bio`, `believeinoakland/civicos-process`) through the GitHub connection with push access; the Cloudflare connection (`api.cloudflare.com`, account `…7f72`); the variables `JOURNEY_ADMIN_HANDLE`, `JOURNEY_ADMIN_PASSWORD`, `JOURNEY_MEMBER_HANDLE`, `JOURNEY_MEMBER_PASSWORD`; network access as now. (BOB names each by reading `read_documentation` pages for the steps.)
2. Start ROOT #9 in that environment on `believeinoakland/bio`, branch `tranche/T51`, pasting the prompt the handoff gives ("You are ROOT #9 … read roles/ROOT.md whole …; then start BOB #269 on tranche/T51 @ <handoff commit>").
3. Later, in one sitting (K4752, Bob: "do it all at once"): the `ADMIN_TOKEN` replaced in the Cloudflare dashboard if the install's one-time password is lost, then the claim of biosmoke8's new room through `/app/setup#boot=…`.
4. After the final pass: approve 0.87.0's signature in the session that is refused (K1715, K4778).

## Order of work on the third account (from the handoff)

1. Takeover (§5.1), the channel and lanes read.
2. The whole suite's reds classified (K4787: alone, then on one core; fragile test or slow-product defect; none accepted as load); the suite from now on in its own session and container. Re-walk 7's results into the fix round they need (planned whole, K4426, reviewed); its jobs; one redeploy; a targeted re-walk.
3. PERFORMANCE #2's quiet re-time (R-QUIET).
4. The room's re-creation (`deploy-test/biosmoke8/wnam-g2/deploy`), Bob's claim, the member made by script.
5. The PDF envelope (K4785): the cause-family review, the envelope written into the requirements, the generated corpus at the platform's shape (round end, every round), its live subset.
6. The final pass in substance (K4781-K4783): the coverage map `walk-coverage-T51.md` completed first (K4784: its sources read whole by helpers, then BOB's review), offline through the door, then live at everyday load (5 until Bob names a figure).
7. G90's 0.87.0 release, then T51's close (§5.7).

## The preflight (K4785): before the jump, on the third account

Bob starts one session on the third account (environment as in step 1 of his acts, repository `believeinoakland/bio`, branch `tranche/T51`), titled `PREFLIGHT`, with this prompt pasted whole:

> You are PREFLIGHT, a one-off check for BIO/Civicsmith before its development moves to this account. Change nothing in either repository except as item 2 says; never print a secret's value. Report each item as PASS or FAIL with the exact error. (1) `get_session` with no id: report `session_context.model`, `last_served_model` and `context_usage.max_tokens`. (2) Attach `believeinoakland/civicos-process` with push access and clone it; in the bio clone run `git push origin HEAD:refs/heads/preflight/account3` (a new branch, never a force) and report whether it was accepted. (3) Report which of these environment variables are set, by name only: JOURNEY_ADMIN_HANDLE, JOURNEY_ADMIN_PASSWORD, JOURNEY_MEMBER_HANDLE, JOURNEY_MEMBER_PASSWORD, CF_ACCT, CF_TOKEN, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, BIO_INSTANCE, BIO_ADMIN_TOKEN, BIO_MEMBER_TOKEN, BIO_RATIFY_SEED, BIO_RELEASE_SEED. (4) Through the environment's proxy as configured (never `--noproxy` or unset proxy variables): `curl -sS -o /dev/null -w '%{http_code}' https://api.cloudflare.com/client/v4/accounts/20b533579290b9b93168345edd3b7f72/workers/scripts/biosmoke8/settings` (expect 200), and `curl -sS https://biosmoke8.believeinoakland.workers.dev/version`. (5) In the bio clone, for each directory with a tracked `package-lock.json`, `npm ci --ignore-scripts --no-audit --no-fund`, and report any that fails; then `node --test bio-plane/test/m/record-grammar/` and report its pass and fail counts. (6) Create a one-time scheduled task into this session two minutes ahead with `create_trigger` (`persistent_session_id` this session, `run_once_at`), then delete it with `delete_trigger`. (7) Create a session with `create_session` titled `PREFLIGHT CHILD` on `believeinoakland/bio` with the prompt "Reply ok and stop.", then archive it with `archive_session`. (8) Load the GitHub tools and list the last 2 runs of workflow `deploy-test.yml` in `believeinoakland/bio`. Then stop, and write the report as your last message.

Bob copies the report into the session of the BOB of the day (or says "preflight passed"). A FAIL is fixed in the third account's settings (BOB names the step) before the jump.

## Work started on the third account before the jump (K4788)

Three sessions Bob starts on the third account (repository `believeinoakland/bio`, branch `tranche/T51`), each writing only its own file on its own branch, merged by the first BOB there. Each prompt is pasted whole.

**SUITE #1**
> You are SUITE #1 for BIO/Civicsmith (rulings K4787, K4113 in `build/rulings.md`: read both whole). Never print a secret; change no product or test file; never force-push. (1) `git checkout -B prep/account3-suite origin/tranche/T51`. (2) For every directory with a tracked `package-lock.json`: `npm ci --ignore-scripts --no-audit --no-fund`. (3) Run `node .github/scripts/module-tests.mjs` from the repository root as a session-tracked background task (up to 2 hours; nothing else runs in this container meanwhile), its output to a log. (4) For every module with a failure: find each failing test file, run it alone (`node --test <file>`) twice, then twice on one core (`taskset -c 0 node --test <file>`); keep each failure's message. (5) Write `build/plan/suite-T51-account3.md`: the commit tested, every module's pass/fail line, and per failing file its four results and its message, classed as RED-ALWAYS, RED-ONE-CORE-ONLY or RED-FULL-RUN-ONLY. (6) Commit that file only and `git push -u origin prep/account3-suite`. Reply with the counts.

**COVERAGE #1**
> You are COVERAGE #1 for BIO/Civicsmith. Read whole, never skim: rulings K4781, K4782, K4784 in `build/rulings.md`, then `build/plan/walk-coverage-T51.md` (a draft whose section 5 names what its author did not read whole). Your task is K4784: complete the map. Start helpers (sonnet, medium) that each read a share of those unread sources WHOLE (shares of at most about 150 KB each; `docs/development/ux-substrate/ux-experience.json` in several shares; `build/plan/fix-round-6-T51.md` in at least three; every canon file `requirements/README.md` lists; `docs/architecture/construct-status.json` and `docs/development/DECISIONS.md` read for the construct ids and journeys they name), each returning the rows to add or correct with citations. Then merge their returns into the map: every row with its status (WALKED-CURRENT, STALE, NEVER) and evidence, and the areas regrouped (one walker's sitting each, founder order). Replace section 5 with the list of sources and which helper read each whole. Never print a secret; contact no live site. `git checkout -B prep/account3-coverage origin/tranche/T51`, commit only that file, `git push -u origin prep/account3-coverage`. Reply with the row counts by status and the areas.

**PDF #1**
> You are PDF #1 for BIO/Civicsmith. Read whole, never skim: ruling K4785 in `build/rulings.md` (Bob's words and BOB's details (1)-(4)), and `build/plan/fix-round-7-T51.md` §0. Your task is K4785 items (1)-(3) as a plan, with no code changed: (1) the cause-family review: every PDF-touching cause of T51 (start from G5, G13, G14, G26, G33, G34, G37, G39, G56, G68, G71, G77, G82, G86 in `build/plan/fix-round-*-T51*.md` and the walk records under `build/plan/walk-T51-*`), with `build/requirements/pdf-reader.md`, `reading-pipeline.md`, `extraction.md`, `pdf-pixels.md` and those modules' code (paths in `build/modules.json`) read whole; use helpers (sonnet, medium) for shares over about 150 KB; name each recurring failure class and the stated requirement or invariant each cause broke, or that none stated it; (2) the envelope: every bound a PDF read depends on, with where it is stated today or "unstated", and the bound you recommend (any that changes what a member may do is marked "Bob's"); (3) the corpus: each generated file (corners and combinations of the envelope, and seeded variations), how it is made, the real entry path it goes through, what passing means, and which module's tests own it. Write `build/plan/pdf-envelope-T51.md`. Never print a secret; contact no live site. `git checkout -B prep/account3-pdf origin/tranche/T51`, commit only that file, `git push -u origin prep/account3-pdf`. Reply with the failure classes found and the unstated bounds.

## ROOT #9's prompt (given to Bob, K4789)

Started by Bob on the third account (repository `believeinoakland/bio`, branch `tranche/T51`, title `ROOT #9`). Because no ring crosses accounts, the prompt carries its own START, and checks the handoff is BOB #268's for BOB #269 before acting; early, it answers "Not yet" and Bob says "check again".

> You are ROOT #9, the session that starts every BOB for BIO/CivicOS, started by Bob on the third account. Attach believeinoakland/civicos-process (read access is enough) and read its `roles/ROOT.md` whole, and PROCESS-MECHANICS.md §2 and §13; read nothing else unless a step needs it. Your first request, given here because the previous BOB is on another account and cannot ring you: **START BOB #269: tranche/T51 @ the handoff commit.** Find that commit yourself: fetch `origin/tranche/T51` and read the Status line of `build/handoff.md` there. Only if it says it was written by BOB #268 for BOB #269 (the move to the third account), take the latest commit on `tranche/T51` that changed `build/handoff.md` as the handoff commit, and start BOB #269 exactly as `roles/ROOT.md` says, with its standard prompt, naming BOB #268 as `session_01WidAiCK6CBPiKP93DpkPQM` and adding one sentence: "BOB #268 is on another account: do not archive it or ring it; its row is a named P14 gap." If the handoff is not yet that one, start nothing, and end your turn with the one line "Not yet: BOB #268's handoff for BOB #269 is not on tranche/T51." (Bob will say "check again" later.) Then follow `roles/ROOT.md` for every later request.

The handoff's Status line must therefore read "Written by BOB #268 … for BOB #269 … (the move to the third account)".
