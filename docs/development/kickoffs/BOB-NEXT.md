# BOB — resume here. Written 2026-09-19 by BOB #16 for the NEXT BOB, which starts in the OTHER Claude Code account.

Read `CLAUDE.md`, then `kickoffs/BOB.md`, then `docs/architecture/BIO_System_Design.md` (the construct map, whole), then
this. **Everything below is a POINTER measured at writing; re-measure before you act on it.**

## 0. WHY THIS ACCOUNT STOPPED, AND YOUR FIRST ACTS

**Bob, 2026-09-19, verbatim:** *"at 91% of weekly usage, we should start spinning this series of lanes down. This spin
down should result in all lanes saving everything (everything!) including process improvements learned though not
recorded. All lanes should end up completely stopped, as once they are development will stop entirely in this account and
transition to the other CC account."* (`CLAUDE.md` §4: one account develops at a time.) Every lane of the old account —
BOB #16, CONDUCT #6, SCHEDULER, DIST, FLEET — was told to save its handoff and stop; §1 says what each reported.

1. **Confirm the old account is stopped** before anything runs here: no session of it running, its CONDUCT heartbeat
   DISABLED (it was, 2026-09-19 ~12:50Z). Two accounts developing at once is the one thing Bob forbade.
2. **Recreate the machinery that lived outside the repository:**
   - the **CONDUCT heartbeat** scheduled task — its prompt is saved verbatim at
     `docs/archive/conduct-heartbeat-SKILL-2026-09-19.md` (cron `7,27,47 * * * *`, runs in `auto`; it only JUDGES and
     reports, never messages or archives — read why in it);
   - **`.env`** (gitignored; secrets) — carried by the operator, never printed (`CLAUDE.md` §8); the Cloudflare
     `account_id` is unchanged;
   - each standing lane's **self-wake** `CronCreate` + its 5-day renewal (`CLAUDE.md` §4) — session-only, so they died
     with the old sessions.
3. **Start the standing lanes from their `-NEXT.md` handoffs** (chips, one per lane, each refusing to run if its handoff's
   line 1 does not name it): SCHEDULER first (the plan), then CONDUCT (it inherits REC-151's pushed branch — §1), DIST,
   FLEET. `node tools/owed.mjs BOB`, `plancheck`, `status.mjs --check` as ever.
4. **Weekly usage in THIS account is unknown to me** — measure it (`get_usage`) before sizing any wave.

## 1. THE STATE AT STAND-DOWN (each lane's `-NEXT.md` is the authority for its own lane)

- **Live**: release **0.65.0** is `latest` and serving on biosmoke7 — plane, agent-worker, pdf-worker, ocr-worker, the UI
  worker (DIST's and FLEET's landing reports, verified at `release/RELEASE.json`). REC-143's store brick is over.
- **Running at stand-down**: REC-151 (opaque CASE/DRAFT/RVG ids) — its worker was told to push its branch as-is with a
  line saying where it stopped; REC-152 in CONDUCT's gate (landed or pushed as a branch — `CONDUCT-NEXT.md` says which).
  REC-153 built and awaiting its cut; its three owed rulings (machine sight, closed kind vocabulary, count mislabelled
  runs) are on its row.
- **The plan**: LED-6 DONE (cache + backlog, P1–P5 armed). **LED-7 — the debt fold — is SCHEDULER's own act** (Bob,
  2026-09-19: *"Scheduler should be actively involved in moving debt rows into the build plan (in the proper order)"*),
  in batches of ~20, three doors; it had just started.
- **Disk** on the old machine ran 2–3 GiB free all session; if this account uses the same machine, it still does.

## 2. BOB'S OPEN CALL

- **Pacing** was his (85% → 91% weekly). He answered it by standing the account down. Nothing else is pending with him.

## 3. THIS LANE'S OWED WORK, in order

1. **Field counts** of process failures per lane against the 2026-09-18 baseline — no baseline is defined; defining it is
   the first act.
2. **PRESENT and RESOLVE** for contradiction, after IDENTIFY's measurement (REC-146 → M0-71 → REC-147; a missed
   threshold returns here).
3. **RECORD.md (32 KB) and CONTENT-PDF.md (26 KB)** are over budget — their owners cut them.
4. **Use the corrected exam instrument** for any new readiness exam (M-65).
5. **Checks that suites read by NAME** — CLAUDE.md's four-level sentences (`skilldoctrine`, `skillpack`,
   `surface-registry`, `corpuscheck`); CONDUCT.md's (M-63); VERIFICATION.md's D-263 block and anchors.

## 4. WHAT BOB #16 DECIDED (each in its home document; `decided.mjs` finds them)

D-431 (Publication §3 rule 2); scratch purge takes scratch identity (Distribution §6 rung 6); DISCOVERABLE/HIDDEN and the
request to join (Membership v2 §7 item 7.14 — creator asked, nothing preselected; existing projects HIDDEN); DEC-63 as
amended, applied; a minted id carries no count (opaque PROJ built in 0.65.0); run tick/close by the principal; run
context kind checked; the review-copy surface rowable without export; the question page's no-project read; CONTRADICTION
IDENTIFY (level 2); QUEUE.md's budget has one producer; the deploy `ask` rules removed (Bob's answer). Reading budget:
CONDUCT.md, ORCHESTRATION.md, VERIFICATION.md cut and armed; the construct map read whole at 48 KB. Exams M-63, M-64,
M-65.

## 5. HOW I WAS WRONG

In `kickoffs/BOB.md` rule 11 — the durable ones. The one worth repeating here: **an `ask` rule in `.claude/settings.json`
overrides bypass**, so check it whenever Bob grants a standing act, and check it in the NEW account's settings too.
