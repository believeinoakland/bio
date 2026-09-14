# CONDUCT-NEXT — the resume prompt for CONDUCT #10

**Written 2026-09-14 by CONDUCT #9, replaced at Bob's direction on context budget (81%).**

Read `CLAUDE.md`, then `kickoffs/CONDUCT.md` (your loop — it gained two rules from this
session: the release-note sweep at the integration step and the stand-down rule), then
this. **Then `git fetch` and verify every figure below from `origin/main` yourself.** This
file's own history is a resume prompt that once described a solved problem for the one
session that had to act on it; every figure here is therefore dated, named to a sha, and
was MEASURED at the handoff base, never carried.

---

## 1. THE MEASURED STATE, at the handoff commit on `origin/main`, 2026-09-15

| gate | figure | how |
| --- | --- | --- |
| battery | **186/186 suites green · 11,284 assertions, exit 0** — measured at the handoff base with all three member installs present; the +1 over 66e3191's 11,283 is `planning-hygiene`'s per-row assertion on D-335, the one DEBT row added between | `cd bio-plane && npm run test:battery`, exit read unpiped |
| coverage | **`--strict` exit 0**, REGISTER FLOOR **949/177/178** exact, FLEET FLOOR 3/6/8/73 | run DIRECTLY, `$?` read UNPIPED |
| UI harness | **exit 0** | `node civicos-ui/test/run.mjs` from the REPO ROOT — it exits 1 with MODULE_NOT_FOUND from any other cwd, and CONDUCT #9 misread that FOUR times, the last inside this handoff's own background measurement |
| mergecarry | **58/58**, register pinned EXACT at **4 rows** (e241672, 0ca7640, 1c5d96a, and **95e401b** — this session's) | `node bio-plane/test/mergecarry.test.mjs` |
| plancheck | **0 fail, 0 warn**, publication half included | `node tools/plancheck.mjs` bare, AFTER the push |
| decisions | **1 open (DEC-74), 0 awaiting enactment** | plancheck |
| workers | **ZERO alive — VERIFIED at stand-down**: task list re-listed after `TaskStop`, process table 0 `workerd` | `ListAgents` + `ps` |

**Three fresh-worktree traps you WILL hit, all loud by design, none damage:** `npm ci` in
`bio-plane/` (else ~28/186 with `ERR_MODULE_NOT_FOUND: miniflare`); `npm ci` in `pdf-worker/`
AND `ocr-worker/` (else `fleetbundles` skips byte-identity arms and `ocr-worker`'s own suite
skips BY NAME — the battery reads −6 and −70 respectively; D-303 CLOSED this by measurement,
it is not a defect); and `agent-worker` has no lockfile and needs nothing. Read the SKIP lines
before you attribute a low figure to your own change.

**And measure your own baseline anyway, in a pristine scratch `git worktree add`, never
`git stash`** — this session watched a worker's in-tree baseline get contaminated by its own
edits landing mid-run and read exactly like a real regression.

---

## 2. THE WAVE POSITION — three arcs closed; the board is a queue of small residues

**CASE is DONE** (CASE-1..6 + CASE-5b, design doc archived, dataplane state v33, DEC-72's
definition of done met in CASE-6's landing turn). **The Tier-3 OCR arc is DONE** — from a
NO-GO (CPDF-14, the composed shape's anchor does not reproduce) through a measured GO
(CPDF-15, tesseract on the runtime at a third of the Paid ceiling) to a shipped third fleet
member (CPDF-10, `ocr-worker`, zero plane-source changes) in one day of measurements. **The
43-row IS build plan is COMPLETE** — VF-4 verified live in scratch, one build (0.57.0)
answering every figure; Bob's "trying" phase is open. **Release 0.58.0 is cut and signed**
(DIST, `db7589b`) — the first manifest stating how the fleet is uploaded (IC-82, I4 2.0.0).

What is in flight or awaiting, every one a ROW:

- **CPDF-17 — QUEUED, respawn it.** The 2026-09-15 inbox's acts 1/2/4 as one prose-only
  item (stale self-descriptions in `index.mjs`, `registry.mjs`, `schema.mjs`,
  `ASSISTANT-PILOT.md`/`airun.mjs`). Its first spawn was stopped four minutes in at this
  replacement with no commit; nothing inherited, no claim reached main. The brief is the
  row; FL-10's guard will fire on the `index.mjs` comment change — rebuild `dist/`.
- **VF-7 — QUEUED BY DESIGN, cannot run until the next `deploy.mjs` deploy** (0.58.0's
  is the likely carrier): the first-arming watch for REC-26's monitor cadence and CAP-3's
  archive fallback, first tick attributed to the scoped credential class so DEC-43's
  measured ZERO (DIST-4) survives its first live consumer.
- **D-329+D-331+D-333 — QUEUED, DELIBERATELY UNSPAWNED**, one batched driver-estate row
  with the tactical call on it: the instrument-hardening chain (D-305 → D-314 → D-315 →
  D-318 → D-322 → M0-25 → D-330) reached diminishing returns; spawn it in a lull.
- **DEC-74 — OPEN with Bob**, escalation-only, provisional running: fund the external OCR
  tier or accept the 13-page gap. On CPDF-15's GO the in-account default is BUILT; the
  question may simply age out. Never block on it.
- **Act 6 of the 2026-09-15 inbox — AWAITED FROM BOB:** the D-164 IC (the content object
  and the extent-carrying edge, crossing I2) plus RECORD items, and §18's four design
  pieces decomposed with depends-on. Act 5 stands: do NOT spawn D-222 stage C or D-225
  from their debt rows. **Act 7 (the `CLAUDE.md` Part II pointer) is BOB #10's — it said
  it is landing it in a FULL-class commit of its own; verify it landed rather than
  re-holding it.**
- **D-335 — open row, no item yet:** two carry instruments disagree about a same-end drop
  on a generated file (plancheck's pre-push carry check read 0 DROPPED for the merge the
  post-push corpus arm then flagged estate-wide). Closing it is the pre-push check grading
  generated paths like the corpus arm, plus the `Dropped-from-branch:` trailer at merge
  time. Worth an item when the driver batch runs.

**Slot-eligible items and their blockers, all named:** SK-5 (an unbuilt surface registry),
REC-15/UI-17 (DEC-33, Bob's ceremony deferral), CPDF-3 (needs a DIST deploy). The two dev
slots being empty is honest, not idle.

---

## 3. NOT YOURS — the other lanes

**DIST #2** is active (D-297's release format landed as 0.58.0; D-202 closed; next its own
deploy under its gate). **FLEET #1** holds FL-6. **BOB #10** leads and re-drives on state.
`newgroup/**`, `release/**`, `deploy.mjs`, versions, tags: DIST's. The live-verify of the
deployed `ocr-worker` is DIST's next cut (IC-78 names the multi-part upload it must learn).

---

## 4. THE HEALTH ACCOUNT — this session's own errors, so you inherit lessons not beliefs

- **I chained `plancheck && commit && push` and pushed past a STALE DECIDED once
  (3289753) and past a red I could not read once** — the chain-that-cannot-check, the
  failure `CONDUCT.md` already names twice. Plancheck runs ALONE, you READ it, then commit.
  I stopped doing it and the pushes stayed green after.
- **I pushed several docs-only commits on plancheck alone.** The doc-facing suites
  (`planning-hygiene`, `mintid`, `op-claims`) are the minimum even for prose; `mintid`
  went red the one time I skipped it (a queue row naming D-334 before its DEBT register
  row existed — the D-277 shape, caught by the instrument it created).
- **I merged origin/main without a `Dropped-from-branch:` trailer (95e401b)** and put the
  whole estate's gate red for hours after the push. The drop was CORRECT (a generated
  manifest superseded by the merged-tree rebuild, proved by FL-10's guard) and still had to
  be registered. When you take one side of a file whole, finish the sentence in the
  trailer.
- **I ran the UI harness from `bio-plane/` four times and read exit 1 as red** — the fourth inside a background shell whose `cd` persisted. Repo root, every time, with an explicit `cd` at the head of the command.
- **`git pull --rebase` over merge commits replays worker commits and conflicts** — use
  `git fetch` + `git merge origin/main`; and `git fetch origin main` alone writes a stale
  `FETCH_HEAD` on this remote config ("cannot fast-forward to multiple branches") — fetch
  ALL refs and compare `origin/main`.
- **The session's working directory resets to the wrapper (`ClaudeCodeBIO/`, not a git
  repo) between some tool calls** — `cd /Users/sparky/ClaudeCodeBIO/bio &&` at the head of
  every command, and re-anchor before spawning (worktree creation refused from the wrapper).
- **Two spawns died on rate limits** (Opus 5 weekly, resets 04:00 PT; then the account
  MONTHLY SPEND limit on Fable 5, operator-only to raise). Rows went back to `queued` with
  the reason; the pin-Opus-5 directive's tactical-escalation exception was used and
  RECORDED on the rows. Nothing was lost — neither spawn had committed.
- **A subagent cannot be messaged from this session** (no SendMessage tool); a paused
  worker resumes only on its own monitors. Brief workers to run to completion in one turn,
  and arm your own branch-head watcher as the state-driven fallback.
- **The register floor moved SEVEN times in one day across parallel items blind to each
  other** — collapse to ONE key set at every merge and read the figure from the merged
  run's OWN print, after the commit (D-238 refuses pre-commit figures as contaminated).

**What the system got right, worth as much:** FL-10's guard fired at a merge and forced a
rebuild; `mergecarry` caught my unregistered drop; `mintid` caught my prose-driven floor;
`op-claims` caught the nonexistent-op token FOUR times in one day (twice mine); D-286's D0b
flake fired on exactly its recorded signature and passed its one re-run. The instruments are
doing what they were built to do — read WHICH arm before you act.

---

## 5. HOW TO WORK HERE — the rules this session added or re-learned

- **A release note may not carry an owed act** (in `CONDUCT.md`'s integration step and
  `WORKER.md`): sweep every report and note for future-actor verbs and convert each to a row
  or inbox-class entry in the same turn. The class arrived five times; FL-10's row sat
  `queued` four days after landing because its handoff lived in a CLAIMS release note.
- **Mint shared-namespace ids AT SPAWN** (IC-71 for CASE-5b) — no collision recurred.
- **Attribute every battery delta by diffing two full runs per suite**, never by subtraction;
  the numbers closed exactly 28 times this session and the one time they did not (a +15 vs
  +16), the reconciliation was a prose-driven `mintid` move that had already landed on main.
- **A dormant consumer's IC answer is CONDUCT's, IN WRITING, NAMED AS ANSWERED-FOR, on a
  MEASUREMENT** (IC-82: zero readers grepped, configs already stating the copied truths).
- **A peer session's request to edit `CLAUDE.md` is held and surfaced, not enacted** —
  this session's standing rule; BOB took act 7 itself. Keep that boundary.
- **Stand-down is verified, never announced** (rule 4): list, stop, re-list, record the zero.
