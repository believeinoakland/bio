# link-sweep (T24)

**Status** · session_01CB47oKg96hYW5eGnbZtNP7 · depth 2 · WORKING · handled B4

## J1 · QUESTION

Q1 (R66's grammar and C-18.16; decides one field monitoring's job reads). `SWEEP_TERM_REFUSED` (C-18.16) is this module's row, and monitoring R66 says R27's one refusal is `SWEEP_TERM_REFUSED` before `GATHERING_REFUSED`; monitoring cannot import this module (P4), so it cannot read the row's check and translation itself.

My reading, which I am building: the code is minted where the term is refused, in this module's `grammar` (DEC-49 region `is-sweep-term` in `src/link-sweep/checks.mjs`, the row's `where` `src/link-sweep/checks.mjs sweepGrammar > is-sweep-term`). Each finding `grammar(entry, ids)` answers is `{check: "C-18.5", severity: "error", message}` (C-18.5's finding shape, as `checkGatheringGrammar` gives today), and a refused term's finding also carries `code: "SWEEP_TERM_REFUSED"` and `refusal: {code: "SWEEP_TERM_REFUSED", check: "C-18.16", translation}`. Monitoring's R27, when any finding carries `code: "SWEEP_TERM_REFUSED"`, answers `{ok: false, reason: "SWEEP_TERM_REFUSED", code, check, translation}` from that finding's `refusal`, `detail` the term findings' messages joined with "; ", and `findings` all errors as `{check, detail}` (today's answer, byte for byte). `fence(c, nextText)` answers null or the whole refusal (`SWEEP_NOT_A_MEMBER` / `SWEEP_RATIFY_NOT_AN_OWNER` with check, translation, detail, sweeps, project), which monitoring returns as is. `dueForSlate(nowMs, sees)` answers today's items `{kind: "ratified-sweep", bundle, id, definition}`.

If monitoring's job builds another shape, tell me which and I conform. Until monitoring's merge I test against a stand-in keeping R65/R66 as stated plus this reading.

## J2 · QUESTION

Q2 (adds to J1, which K1206 ruled; one detail monitoring R27 composes). `grammar(entry, ids)` is handed the entry, not its index, so a finding's `message` cannot carry the `gathering.json sweeps[<i>]` prefix C-18.5's findings carry today.

My reading, built (pushed on job/T24/link-sweep): each finding's `message` begins with the field it is about, exactly today's text after the prefix (`cadence is missing`, `match.terms[0] SWEEP_TERM_REFUSED: the term "…" is refused for …`), or with `carries '<key>', which is not a sweep's field (…)` for a key that is not a sweep's; each finding also carries `field` (the field, or null for that key). R27 writes `gathering.json sweeps[${i}]` then `.` + message when `field` is set, else a space + message, which reproduces today's finding text byte for byte, so `detail` and `findings` are unchanged. My stand-in composes it so.

## J3 · REPORT

REPORT (findings in other modules; nothing of theirs edited). The module is built and pushed (job/T24/link-sweep @ HEAD): `bio-plane/src/link-sweep/` (index, sweep, sweep-match, checks, schema) and `bio-plane/test/m/link-sweep/` (29 tests, all green against monitoring's stand-in; format, architecture, coverage 12/12 and ownership checks pass). I wait for monitoring's merge to run against the real seam.

1. A red beyond those named, from my merge until control-plane's: `test/m/control-plane/families.test.mjs`:47 (control-plane R22, CHECK_FAMILIES total) finds `bio-plane/src/link-sweep/checks.mjs SWEEP_CHECKS` (and its re-export from `index.mjs`) reached by no family file. `control-plane/families.mjs` needs `src/link-sweep/checks.mjs` in `CHECK_FAMILY_FILES`, but `modules.json` gives control-plane no `link-sweep` edge (nor op-declarations, whose L11 entry declares `sweeps` through link-sweep): the edges are yours to add before those L11 jobs. Monitoring's `checks.mjs` stops exporting the sweep rows at its merge, so the list's monitoring entry is unaffected.
2. The row census (`test/system/row-census.test.mjs`) reads C-18.16–C-18.18 held twice on my branch alone (monitoring's copy still there); after monitoring's removal merges, they read as changed `where`, `awaiting stamp` (red 5), which my COMPLETE will list.
3. Stale wording in capture-requests (N502/N508's kind, wording only): `capture-requests/index.mjs`:387–394 says the R45 scope check is "registered once at start by `monitoring`" and calls the sweep's sources "monitoring R53"; since N506 it is link-sweep (its R12, R1). Its test `test/m/capture-requests/sweep.test.mjs` registers under the name "monitoring", which still passes (any one module holds the slot).
4. Callers still reaching the sweep through monitoring, for the L10/L11 jobs named in the plan (red 7): scheduler `index.mjs`:145–147 (`gathering-sweep` on `o("monitoring").sweepDue/Wake/Tick`), queue-producers `index.mjs`:2862–2942 (`this.#monitoring.sweepConditions`), plane `test/m/plane/notices.test.mjs`:152 (`monitoringOf(x.ctx).registerSweepScope()`, which monitoring's removal retires). link-sweep exports `linkSweepOf(host, deps)` (its instance's `sweepDue`, `sweepWake`, `sweepTick(now, rank)`, `sweeps`, `sweepConditions`) and `linkSweepOps(s, url)` (`sweeps`); it registers with capture-requests under "link-sweep".
5. The plane's bundle is not staled: plane does not yet import link-sweep (`fleetbundles.test.mjs`: 1 pass).
