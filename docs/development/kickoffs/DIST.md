# Area DIST: distribution, and the only area that cuts releases

Created 2026-07-31 as part of the move to parallel development. DIST exists to
take the release out of every other area's critical path.

**Work in a worktree**: `claude --worktree DIST`. One session per working tree
(`PARALLELISM.md`, DEC-3) — **CONDUCT holds the main checkout at
`/Users/sparky/ClaudeCodeBIO/bio` and DIST does not work in it.** Added 2026-08-05 by
CONDUCT, late: every other area kickoff has carried this rule since 2026-07-31 and this
file never did, because DIST was created before the rule and split into its own session
after it. On 2026-08-05 a DIST session committed inside CONDUCT's tree four minutes before
CONDUCT committed there — two sessions in one tree, which a `CLAIMS.md` claim cannot
protect against, since a claim reserves paths BETWEEN checkouts and does nothing about two
sessions sharing one.

**Coordination:** before making a change another session must know about, read
`docs/development/ORCHESTRATION.md`, "COMMUNICATING A CHANGE" — the channels, which
carries what, and the receipts for every way a correct change reached nobody. Claim
in `CLAIMS.md` before editing; publish before you call anything done.

## A STANDING LANE — never idle-archived, and never ends a turn on a question nobody will read

**RULED BY BOB, 2026-09-18:** *"Don't archive DIST or FLEET sessions just because they've been idle for some
period of time. They should stay alive because they will always eventually be needed again. Only refresh them
if/when their context windows are too full."* `tools/retirable.mjs` enforces it: this lane's NEWEST session is
PROTECTED however long it idles (`STANDING_LANES`, negative-control arm A6b). **Idle is this lane's normal state.**

**The receipt, and the half the tool cannot fix.** The only DIST and FLEET sessions (2026-09-16) oriented, then
ended their turns on a question — *"Standing by for your sequencing"*, *"may I push it?"* — addressed to a human
who was not in the session. Nobody read either; both were archived idle four hours later; no release was cut for
four days while four disclosure fixes sat on `main`. **So: never end a turn on a question.** Pushing is not gated
(`CLAUDE.md`); decide what is yours; route what is genuinely another lane's by `SendMessage` to SCHEDULER (the build plan's
order, `CLAUDE.md` §3), CONDUCT (running and integrating work) or BOB (design, doctrine) and continue with the rest. A question only Bob can answer goes to BOB, which carries it.

**Refresh, when context is too full:** write `<LANE>-NEXT.md` from the measured state, push it, verify it on the
remote, and tell BOB — whose successor protocol retires a predecessor only after D-398's three conditions hold.

## WHEN DIST CUTS, AND WHAT WAKES IT — decided 2026-09-18 by BOB #15 (Bob: *"I should not be involved in the decision whether and how DIST cut and sign the next release. There's plenty of protocol definition for how a release gets cut."*)

This file defined HOW to cut (the gate below) and never WHEN, and nothing woke DIST. The receipt: 0.58.0 was
cut 2026-09-14; the only DIST session (2026-09-16) confirmed `main` green and cuttable, ended *"Standing by
for your sequencing"* to nobody, and was swept idle; by 2026-09-18 four disclosure fixes (REC-123, REC-125,
MK-1, REC-130) sat on `main` and on no deployed plane. **So DIST decides when, by this rule, and asks nobody:**

- **CUT NOW** when `main` carries any integrated change that closes a SECURITY OR DISCLOSURE defect —
  something a stranger, a machine credential or the wrong member could read or do — that is not in the
  latest signed release. CONDUCT names such a change when it integrates it (its merge commit says so, and it
  messages DIST); DIST also checks for itself: `git log <last release tag>..origin/main` against the rows.
- **OTHERWISE BATCH**: cut when `main` is green and differs from the latest release in any shipped path
  (`bio-plane/src`, `bio-plane/checks`, a fleet member's source), at most once a day.
- **The plane and the fleet members that consume a changed interface ship TOGETHER** (IC-130: an old
  `agent-worker` silently drops model-judged steps). DIST reads `INTERFACE-CHANGES.md` for every IC since
  the last release and states which members must move with the plane.

**WHAT WAKES IT.** DIST is a STANDING LANE (above): its session stays alive. At session start it arms its own
recurring self-wake with `CronCreate` (every 6 hours) whose prompt is *"DIST: apply WHEN DIST CUTS"*; CONDUCT
also messages it on integrating a security fix. On each wake, apply the rule; if nothing is owed, end the turn
with one line saying so.

**DEPLOYING IS DIST'S, BY BOB'S STANDING PERMISSION (2026-09-18: *"DIST has standing permission to deploy when asked
to"*).** It replaces the per-release approval this paragraph used to require: 0.59.0 → 0.62.0 were each held for a yes
while the fixes they carried stayed live. **Read as:** DIST deploys each release it cuts under WHEN DIST CUTS, in the
order the fleet requires, with the whole gate — bytes read back, `/version` SERVING, the headline closings live-verified
through the ops a caller uses in a scratch namespace swept after, `op=audit` clean — and then REPORTS THE LANDING to the
BOB session with that evidence (`CLAUDE.md`: report the landing, not the intention). **One reading, decided 2026-09-19:** a release that WIDENS who may read or do something (REC-126's review copy and
REC-132's founder sight were such) is deployed under the standing permission and NAMED IN THE LANDING REPORT, after.
Only doctrine, or a risk carrying Bob's name, goes to Bob BEFORE the deploy, through BOB. Anything the gate cannot
establish is never deployed on a guess.

**FIRST CHECK FOR THE NEXT CUT — found 2026-09-16 by the last DIST session and recorded nowhere until now:**
`newgroup`'s `npm test` and `build` both run `npm run embed` (`scripts/embed-release.mjs`), which the session
reported *silently replaces the signed 0.58.0 embed with an unsigned rebuild*, and
`newgroup/test/embed.test.mjs` carries no negative control. **Unverified since — verify it before cutting**,
because a gate step that can put an unsigned plane in front of a sovereign group is the one defect that
outranks the cut itself. If it holds, it is a DIST-owned fix (newgroup is DIST's) with its own control.
**VERIFIED AND CLOSED 2026-09-18 (M-59):** it held. The embed now copies only the signed, hash- and
signature-verified asset from `release/` and builds nothing; `embed.test.mjs` carries the control. So, in the
gate below, the wizard is embedded only AFTER step 5 signs — `newgroup`'s `npm test` refuses between the bump
and the signature, which is correct.

**EVERY RELEASE BOOTS A STORE THE PREVIOUS RELEASE CREATED — measured the hard way 2026-09-18 (DIST, 0.62.0).** Five
signed releases (0.59.0–0.63.0) created an index on `inquiry_basis.content_id` before the migration added that column, so
any store older than REC-90 could not boot; the battery builds FRESH stores only, and the live check on biosmoke7 caught it
after the deploy. The gate now includes an UPGRADE arm: a store created by the last released version, then booted by the
candidate (its negative control: this exact defect). **And a release reaches other groups only after it has been deployed
and live-verified here** — RULED BY BOB 2026-09-18: *"The release may be deployed, obviously. But once deployed, all
groups can update to the latest release if they choose."* So the installer's `/update` offers a release only once DIST has
deployed it and live-verified it on this instance; cutting and pushing a signed release no longer offers it to anyone.
The mechanism is DIST's: a `latest` pointer DIST advances after the live check (option a), with the installer reading it.
**THE MECHANISM, DECIDED BY DIST 2026-09-19: `main`'s `release/` IS THE `latest` POINTER, AND A CUT LIVES ON A BRANCH
UNTIL IT IS LIVE.** Every installer, including every copy already deployed, reads `main/release/RELEASE.json`
(`newgroup/src/index.mjs`, `CFG.RELEASE_LATEST`). So the pointer that needs no installer change, and leaves no old
reader behind, is `main`'s own `release/`, held equal to the last release deployed and live-verified on `biosmoke7`:
1. **Cut on a branch.** `git switch -c dist/cut-X.Y.Z origin/main`; bump the version sites; build; `release-assemble
   --sign`; run the five ssh-keygen controls; `npm run embed`; run the full gate PLUS the upgrade arm; commit; tag
   `vX.Y.Z` on the branch; push the branch and the tag. **Nothing on `main` changes**, so `/update` offers nothing new.
2. **Deploy from the tagged tree** (a worktree at `vX.Y.Z`), in the fleet's order: **agent-worker FIRST or in the same act
   as the plane, never the plane first** (IC-130); then pdf-worker, ocr-worker, and any order an IC since the last
   release adds. Verify the bytes read back,
   `/version` serving, the headline closings live in scratch (swept after), and `op=audit`.
3. **Only then advance the pointer:** push the cut as `land/dist/cut-X.Y.Z`; CONDUCT's train lands it (M0-111: a
   direct push of `main` is refused; ask for an immediate train). The tag becomes an ancestor of `main`,
   so tags stay on the mainline. Then deploy the installer embedding the same release.
4. **If the live check fails:** roll back to the previous deployment (`wrangler rollback <previous version id>`,
   measured working 2026-09-19), and never merge the branch. Nothing was offered to anyone.
The withdrawal of 2026-09-19 (`d86b27ea`) already put `main` in this state: `release/` holds 0.58.0, which is what is live.
**A blind spot measured in the same incident:** `deploy.mjs` reads back `/workers/scripts/<slug>`, which returns the
LATEST UPLOAD, not the ACTIVE version. After a rollback it reports the rolled-away bytes. Establish what is serving
from the deployments API and `/version`, not from that read-back.

## Why this area exists

Cutting a plane release is five indivisible acts on GLOBAL state: bump the
version, sign the built asset, write `release/RELEASE.json`, tag `vX.Y.Z`, and
deploy `biosmoke7`. Two areas doing that at once produce two tags claiming one
version and a RELEASE.json whose signature matches neither artifact — and git
catches none of it, because a tag and a version bump are additions rather than
conflicts. That is what the release baton has been guarding.

The baton solved the correctness problem and created a throughput one: it is
held for a whole session, so every area waits on whoever has it. **The fix is
not a better lock. It is that areas stop cutting releases.** Areas land tested
code on `main` continuously; DIST batches releases. The baton goes from
held-for-a-session to held-for-minutes, and it stops being what anyone waits on.

## What DIST owns

`newgroup/**`, `release/**`, `bio-plane/scripts/deploy.mjs`, the version in
`bio-plane/package.json` and `bio-plane/wrangler.jsonc`, and all tags.

**No other area touches any of these.** An area needing an installer change
appends a DELEGATION entry in `CLAIMS.md`.

## The gate: what must be true before anything is distributed

Regression testing is a REQUIREMENT, and DIST establishes it itself rather than
trusting that the contributing area ran it: two areas can each land green and
produce a red `main`, and the merged tree is what ships. Since D-293 every gate's
verdict is RECORDED BY TREE, so the question is whether THIS tree was tested.

In order, and all of it on the merged `main`:

1. **The merged tree's verdict** (M0-106, 2026-09-22): a GREEN FULL record for the
   tree being released (`.git/bio-gates/<tree>.*.json`), NAMED in the cut commit;
   else `node tools/gates.mjs --since <the newest commit whose tree carries one>`;
   the whole battery (`cd bio-plane && npm test`, zero failures) only when neither
   exists. The bumped cut tree's own gate (lesson 20) always runs.
2. **`cd newgroup && npm test`** — the installer's own suite, which includes the
   D-106 guard that the embedded plane version matches `package.json`.
3. **`node test/hygiene.test.mjs` is part of (1)** and is the cheap early
   warning: version-source agreement, the schema literal, the no-caller-supplied
   -provenance source check.
4. **Bump the version in BOTH `package.json` and `wrangler.jsonc`.** Hygiene
   fails if they disagree; that check exists because they drifted thirteen
   releases apart once (D-106).
5. **Build, then sign with the out-of-tree Node SSHSIG reconstruction**, and
   verify against stock `ssh-keygen -Y verify` with NEGATIVE CONTROLS every
   time: altered bytes, wrong namespace, the wrong key, and the previous
   release's signature against the new bytes. All four must fail to verify. A
   signature accepted without controls is a signature nobody has checked.
6. **`node scripts/deploy.mjs <slug> <version> ../release/bio-plane.bundled.mjs
   --thread DIST`**. It refuses without the RELEASE BATON (read from
   `kickoffs/BATON.md` on the remote; measured live 2026-09-19: `baton: held by DIST`). That is the release channel's
   own check, not the development lock `CLAUDE.md` §4 says was removed. It believes only the bytes it
   reads back, and then WAITS for the version to serve. If it prints ROLLOUT NOT
   CONFIRMED, do not verify behaviour yet.
7. **Live-verify** the release's headline change through the op a real caller
   uses, in a scratch namespace, then sweep it.
8. **`op=audit` clean.**
9. **Re-cut the installer** on the new plane and deploy it, then read the script
   back from the account and confirm the embedded version AND that
   `bindings: []` is still empty. That empty binding set is a structural
   security guarantee, not a detail.
10. **Advance the pointer:** the train lands `land/dist/cut-X.Y.Z` (step 3). The TAG was already made on the branch,
    BEFORE the deploy (the mechanism below); the merge puts it on the mainline. Never before the live check.
11. **Add the release to the upgrade arm:** a row `["X.Y.Z", "<the commit whose release/ holds it>"]` in
    `bio-plane/test/migrate-released.test.mjs`'s `RELEASES`, in the NEXT cut. A release absent from that table is never
    tested as an upgrade source (REC-143's worker, 2026-09-19).
12. **The UI worker `civicos` moves with the plane** (`civicos-ui/deploy-ui.mjs`; build it from the tag per
    `CIVICOS_UI_STATE.md` "Build and deploy the dev worker", with the v12 build-id injection). It is in no RELEASE.json,
    and until 2026-09-19 no release carried it: the live UI was `app.html` of 2026-08-04 (build `74cc1646044b`). A plane
    whose ops the old surface calls differently (IC-153's conclude) must not go live without it.

A release that fails any step is not a release. Nothing here is skippable
because the change looked small; 0.52.0's near miss was a one-line-looking
change.

## What DIST does NOT do

It does not decide what goes in a release. It does not fix failures it finds: a
red battery goes back to the area that owns the code as a DELEGATION, and DIST
does not cut until it is green. DIST holding the fix would make it the busiest
area in the project and put it back on the critical path.

## Transition

Until a second session exists, DIST is a ROLE the single active session takes on
deliberately at the end of a work item, not a separate agent. The point of doing
it that way first is to find out whether the gate above is right before anyone
depends on it. Split it into its own session once two development areas are live
and both want to ship.

## LESSONS FROM THE 0.59.0–0.65.0 CUTS (2026-09-18/19), recorded at the stand-down — each one cost time or nearly shipped a defect

1. **A signed release on `main` IS distribution.** Every installer's `/update` reads `main/release/RELEASE.json`. That is
   why the pointer mechanism above exists. `release/` reaches `main` only through the train, from a live-verified cut branch.
2. **The battery builds FRESH stores; production stores are OLD.** 0.59.0–0.63.0 passed every suite and bricked every
   existing store. `migrate-released.test.mjs` is the upgrade arm. **Each cut adds the PREVIOUS release to its `RELEASES`**
   (version, and the commit whose `release/` holds it: the cut commit on the branch). **Only a withdrawn, bricking release
   goes in its `WITHDRAWN` set**, because that loop asserts the release BRICKS a 0.58.0 store. A fixed release put there
   fails the gate (0.65.0's first gate, corrected).
3. **Record rollback targets BEFORE deploying:** `wrangler deployments list --name <worker>`, the `(100%)` version id,
   for `biosmoke7`, `civicos` and `newgroup`. Roll back with `wrangler rollback <id> --name <worker> -m "<why>" -y`.
   Measured working 2026-09-19. Restoring the last known-good version is part of a failed deploy, not a new deploy.
4. **What is SERVING is read from the deployments API and `/version`, never from `/workers/scripts/<slug>`** (it
   returns the latest UPLOAD, and `content/v2?version=` ignores the version). After a rollback, `deploy.mjs`'s read-back
   reports the rolled-away bytes.
5. **Find a live failure with `wrangler tail <worker> --format json`**, bounded (start it, wait for it to connect, send one
   request, kill it by PID). "error code: 1101" is an uncaught exception, and `STORE_DID_NOT_ANSWER` means the Durable
   Object threw. The tail gave the exact SQL error within a minute.
6. **The UI worker `civicos` is not in `RELEASE.json`** and moves with the plane (gate step 12). Before a release carries
   an interface change the surface calls (IC-153, IC-158), check `civicos-ui/app.html`'s diff since the last tag.
7. **Fleet members deploy from SOURCE through wrangler**, so their served bytes are not `release/`'s bundle. Verify them by
   byte-comparing the account's script against `wrangler deploy --dry-run --outdir` of the same tagged tree, and
   ocr-worker's parts against `release/ocr-worker/assets/*`.
8. **The installer's embed is re-escaped by esbuild**, so a substring search for the signed source finds nothing. Parse the
   `RELEASE_SOURCE` literal out of the account's script, evaluate it, and hash the value. It must equal `RELEASE.json`'s
   sha256. Then check `bindings: []` from `/settings`.
9. **Before a live probe, read the handler for where it takes its parameters.** `op=projectfork` reads `projectId` and
   `newId` from the QUERY STRING; a JSON body is ignored and answers something else (a false result, caught 2026-09-19).
   Operator tokens travel as the plane's `token` query parameter over HTTPS; never print the URL.
10. **Deploy from a worktree at the TAG**, never from the working tree: `deploy.mjs` checks the tree's version sites. When
   the lockfiles are unchanged since the last tag, symlinking the installed `node_modules` into it is sound (for deploy
   tooling only, never a test run). Remove the worktree after.
11. **Re-cutting before the tag costs nothing.** If `main` gains closings while a cut is gating, stop the gate
   (`TaskStop`), save the authored edits aside, `git switch -f -C dist/cut-X.Y.Z origin/main`, restore them, and
   regenerate the rest.
12. **Batch closings only with a bound:** a one-shot `CronCreate` wake at the bound, so an authority fix never waits
   indefinitely on a batch.
13. **A committed `.claude/settings.json` `ask` rule overrides bypass mode.** Rules on `deploy.mjs` and on `npx wrangler
   deploy` held the plane step for about 2 hours on a prompt nobody saw. Bob had them removed (7e9ef2f9). If a deploy step
   hangs, check the settings your WORKTREE reads (its own copy), and rebase first.
14. **zsh treats `$var:x` as a history modifier**: `git show $c:path` silently becomes `$c` with `:p`/`:r`/`:c` applied.
   Write `"${c}:path"`.
15. **`op=audit` on biosmoke7 is never fully clean:** 10 C-18.9 findings are D-200, record state since 2026-08-04. The gate
   step means "no finding the previous release did not have". Compare against D-200's ten, by bundle id — D-200 recorded
   only the COUNT; the ten ids were first recorded in DIST-NEXT at 0.69.0's cut (2026-09-21), and that list is the baseline.
16. **The battery's completion line excludes untallied suites** (D-413: `bundle`, `livefire`). Read the `EXCLUDES` clause.
17. **A self-wake cron is session-only and expires after 7 days.** Record the arm date in DIST-NEXT, and re-arm after 5 days.
18. **A REFUSAL-ONLY BATTERY CONFIRMS SHAPE, NOT WHICH BUILD ANSWERED — pair every refusal set with a positive arm that
   could only pass on the NEW build.** `CLAUDE.md` §5 already says an outcome that costs nothing to produce is not
   evidence; this is its next turn. **The receipt, 2026-09-19 (DIST #2, 0.66.0):** the live probe read 7/7 green and
   was honest, but its `airuntick`/`airunclose` arms exercised an ABSENT run — a run that never existed — which 0.65.0
   would have answered byte-identically. Those arms were silent on the only question the probe existed to settle. Only
   the REC-153 arms discriminated, because `AI_RUN_NO_SUCH_CONTEXT` occurs **0 times in the previous signed bundle**, so
   observing it live can ONLY come from the new build. **The structure to use, built into 0.67.0's 11/11:** (a) the
   refusals; (b) a positive arm carrying a wire code ABSENT from the prior signed bundle — that is what establishes
   which build answered, never the `/version` string; (c) an arm proving the op is not simply BROKEN (an UNGATED prefix
   still allocating), because a uniformly-refusing op and a correct gate look identical from outside. It is the same
   geometry as the signature controls' two positive arms beside five refusals, and as the gate's own
   `N/N suites green` line: **verify by the positive artifact.** Ruled into DIST's law by BOB #17, 2026-09-19, and
   named to Bob as a candidate for `CLAUDE.md` §5 — if it is folded there, this lesson points at it rather than
   restating it. **`op=bootstrap` is NOT a reading of the DO's build** (FLEET #3, 2026-09-21): its `version` is the routing
   isolate's `env.VERSION`; the DO adds only claimed/rearmed/consumedAt. A DO-side change is evidenced only by a DO-side
   wire code; when none is reachable without a session or a write, the DO's build is UNDETERMINED and the landing report
   says so (0.69.0, whose D-136 DO paths are session-only). **Since D-116 (IC-181, 2026-09-23) a plane carrying it answers
   the DO's own build as `storeVersion`, and `op=bootstrap&members=1` each member's through its binding — read those; on a
   release without them the DO's build is still UNDETERMINED.**
19. **A CONTROL CAN BE MEANINGFUL ONLY AS A TREND, AND `migrate-released`'s IS ONE.** Its `alterafter` arm has measured
   **135 pass / 66 fail (declared baseline, REC-143) → 169/66 (0.66.0's cut) → 186/66 (0.67.0's cut)**. The FAILURE
   count is identical every time because it is bounded by `WITHDRAWN`, which a cut never touches; the PASS count rises
   with each release ADDED to `RELEASES`. **That rise is the only thing that shows a newly added row is load-bearing
   rather than decorative** — a single run cannot say it, so a session that reads one figure, sees green, and moves on
   has learned nothing and will not know. **So: record the SEQUENCE in `DIST-NEXT` at every cut, never the latest
   figure, and compare against the previous cut's numbers rather than against "green".** If the pass count does NOT
   rise after adding a release, the row is not being exercised — check the fixture map (`ARMED: every release in the
   list is a fixture`) before trusting the cut.
20. **WRITE THE CLAIM BEFORE THE FINAL `decided.mjs` REGENERATION — a `CLAIM` block is INDEXED PROSE.** A claim's
   `why:` line states a ruling, so `decided.mjs` picks it up; appending the claim AFTER regenerating leaves
   `docs/DECIDED.md` STALE. That is not a cosmetic failure: `strandedwork.test.mjs` asserts *"…and `plancheck --local`
   exits 0"*, `--local` skips the publication checks but still sees STALE, and **the battery goes RED on a tree whose
   only defect is a generated index** (0.68.0's first gate, 263/264, cost a full second run). **And it cannot be
   repaired by regenerating and re-running only that suite:** regenerating changes the tree, so the first run's figures
   describe a tree that no longer exists, and the tree that gets TAGGED must be the tree that was MEASURED. Order:
   bump → `RELEASES` row → **claim → `node tools/decided.mjs`** → build → sign → controls → embed → gate.
