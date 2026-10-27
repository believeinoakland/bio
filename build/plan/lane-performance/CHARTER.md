# Lane: performance (PERFORMANCE)

**Status** · Open. Chartered by BOB #241, 2026-10-21, on Bob's direction (K4351): "I want to open a new lane for looking at performance issues." The lane measures and diagnoses; it changes no product code and decides nothing. Its fixes reach the plan only through BOB.

## The job
Find why Civicsmith is slow for a member, measure it, trace each slowness to its root cause and the module that owns it, and propose the fix that removes the cause (not a patch per screen), with the gain it expects. Bob's long-term goals bind every proposal (K4164): an architecturally clean, non-fragile source tree; a fix lands in the module that owns the cause, and a cause needing edits across layers is fixed by moving ownership, never by spreading the edit.

**The bar** (Bob, K4354: "A for now, we may want to look at further reductions once the alpha-level workflow is done"): a screen is drawn within 2 s and an act answers within 2 s on the test copy at 1280 px; a web capture within 15 s. Every measure is stated against it.

## Work, in order
1. **Baseline**, on the live test copy (https://biosmoke8.believeinoakland.workers.dev; reached as `build/plan/walk-T51-build/BRIEF.md` says, never through the agent proxy; `JOURNEY_ADMIN_*`/`JOURNEY_MEMBER_*` by variable, never printed): for every screen of the registry (`docs/development/ux-substrate/`) and every act a journey presses, at 1280 and 390 px, as administrator and member: time to drawn, number of API requests (and how many are repeats), bytes, the slowest requests, and what the server spends (Cloudflare's own timing headers where present). Write `BASELINE.md`.
2. **Causes first for the running fix round.** The re-walk (`build/plan/walk-T51-rewalk/A.md`, `B.md`) already shows C14 (screens 5–10 s, 50–120 requests), C15 (`interfacewords` 6 MB, uncached, refetched on every load), C16 (one `projectquestions` per project on the document page), C12 (acts 5–7 s), C13 (the visitor render 3–17 s). Diagnose these first, from the source and live, and hand them to BOB as soon as each is clear (target: within the first two hours), so fix round 3 carries them.
3. **Then the rest:** the plane's own costs (Durable Object and SQL time per op, cold starts, the 30.4 MiB plane bundle against its 32 MiB limit, K2547), the capture and reading pipeline (acquire, render, attest, OCR), the fleet workers, and the client (the shell's start-up, word table, re-renders).
4. **Re-measure** after each redeploy BOB names, against the baseline.

## Each finding
`P<n>` in `HANDOFF.md`: what is slow and how slow (measured, with the method), the root cause (file and line), the owning module (`build/modules.json`), the proposed fix and what it changes in requirements if anything, the expected gain, and any risk. A fix that would change what a member sees or may do (for example dropping a feature to save time) is marked "Bob's" with options and a recommendation; everything technical is proposed to BOB.

## How the lane works
- Its record is this folder on the open tranche branch (`tranche/T51` today): `BASELINE.md`, `HANDOFF.md`, scripts under `tools/`, small screenshots or traces under `shots/`. It commits only here (pull before pushing; never force); never `main`, product code, requirements, another lane's files, or `docs/development/ux-substrate/`.
- On the copy it works only in its own projects, named `PERF …`, and never changes another lane's or walker's records. It never deploys and never load-tests beyond what one member would do (no flood of requests).
- Workers name model and effort (K3518): haiku low for mechanical work, sonnet medium for measuring, reading and diagnosis.
- It reports to BOB in `HANDOFF.md` (entries `P<n>`), read by BOB at takeover and at each backstop check; when a finding is ready it also rings BOB (a one-time routine into BOB's session, the plan's Status line names it, `run_once_at` the next whole minute, text `PERFORMANCE: P<n> in HANDOFF`). Bob may work with the lane directly; a question for Bob goes with an explanation, options and a recommendation.
- An act refused by a permission or safety check is never worked around: it is recorded in `HANDOFF.md` for BOB.
- Read in full, never scanned (P20); a body over about 50 KB is read by a worker told the task.
