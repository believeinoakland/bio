# Review of the G57 entry (K4426)

Checked against the code on `tranche/T51`. Nothing was run. Every cited file:line was opened. Verdict: the cause (ratification's sweep copies materials only, so `FINDING_MISSING` repeats until a member re-sends op=ratify) is borne out by the code. The design has 3 DEFECTs: the platform bound, an unbuildable capture path, and the legacy-row fallback. Fix those first.

Line references that check out: `casefile.mjs:39-74` (59-61, 51), `record-core/index.mjs:708-718` (713), `:741-778`, `:972`, `:981`, `ratification/index.mjs:859`, `:869`, `:1084`, `finding.mjs:176-215`, `:375-381`, `ops.mjs:251-252`, `:432-433`, `:439-443`, `:507-510`, `:542`, `worker.mjs:171`, `:198`, `:230-236`, `public-read/casefile.mjs:56-57`, `:99-105`, `:266`, `public-read/index.mjs:1484-1491`, `publication/index.mjs:2335-2337`, `:2352-2387`, `:2136`. Test line references are right (`record-core.test.mjs:650-657` and `:1106`, `g54-attempt.test.mjs:83`, `g54-paths.test.mjs:429-469`).

## Findings

1. **DEFECT: the L figure "about 150 member findings" is wrong, and the heal can break the 10,000 subrequest limit.**
   - Evidence: `CASEFILE_FILES_MAX = 4000` (`publication/worker.mjs:162`). The assembly's estimate is `findings * 4 + ...` (`worker.mjs:507-512`). The largest allowed edition therefore has about 1,000 member findings, not 150.
   - At 5 parts each, the heal adds 5,000 `head`s. Re-verifying parts through `partsHeld` (`provenance/index.mjs:318-330`) adds a `head` per part, plus a `get` when the object carries no checksum. The assembly adds about 4,000 more. One edition then approaches or passes 10,000 (`wrangler.jsonc:175`).
   - The only in-edition stop in the entry is on bytes. The files check at `casefile.mjs:51` runs between editions only.
   - Change to the Bounds paragraph: "Inside one edition, copying also stops before a part when the tick's `files` already reach `CASEFILE_SWEEP_FILES`; an edition never examines more than the remaining tick budget." Change to (4): "the largest edition the assembly allows, 1,000 member findings (`CASEFILE_FILES_MAX` 4000 / 4), with the heal's and assembly's subrequests summed and shown under 10,000".
   - With finding 2 below applied, the heal costs at most one `head` per finding, which meets the bound.

2. **DEFECT: healing captures and capture parts cannot be built as written, and goes beyond the cause.**
   - The entry says captures are "streamed ... and the parts re-verified, exactly as `copyFinding` does". That needs `partShaSet` and `partedRows`.
   - Neither is derivable from the stored `parts` rows `{path, sha256, kind, bytes}`. `findingShas` (`finding.mjs:76-115`) gives a part the image files as its own blob the kind `capture`, not `capture_part`, yet it is in `partShaSet`. `copyFinding` puts a part with its digest (`finding.mjs:191-195`) and a whole capture without one.
   - `partsHeld` also needs per-part `file` and `bytes`, which are not all held.
   - The cause is only the finding's `bundle.md`: the assembly reads it alone (`public-read/casefile.mjs:99-105`).
   - The "one copy routine" refactor of `copyFinding` therefore touches the act's path (a risk to R6 and `g54-paths`) for no part of the cause.
   - Proposed change: cut the heal to each finding's `bundle` part (head, then `fileTextAtSha`, then put).
     - Delete from the Design the sentences on text kinds `file`, `capture`, `capture_part`, the evidence-store streaming, `incomplete`, the `copyFinding` refactor, and `incomplete` in `healed`.
     - Delete failing-first (d).
     - Rewrite (f) to use the files bound: an edition of at least 400 findings, whose heads reach the tick's file bound, so the second edition's assembly is called 0 times. The control is a small edition where both are taken.
     - Delete the third item of the L paragraph's capture figures ("a capture of about 300 KiB", bytes streamed).
   - State the other parts as follow-on, not part of G57: "a finding's non-bundle files that a copy left out are healed by a member's re-sent op=ratify (R6), as today".
   - Narrowing `fileTextAtSha` to bundle parts is not needed: it stays at any path (cheap, general). If BOB prefers the narrower provider, `textAtSha` already answers `bundle.md` at a pin and R89 and the record-core job are not needed at all.
     - Check this as a possible simplification. The pinned `bundle.md` is the part whose `sha256` is the row's `bundle_sha`, and `textAtSha(bundleId, bundle_sha)` returns exactly it (R60, `record-core/index.mjs:708`).
     - Ask: does the new provider add anything for the cause? If not, delete R89, the record-core owner and its test, and the cause is ratification-only. Make this the first decision in the entry's Owners paragraph. It removes a module, a requirement and a seam.
     - `fileTextAtSha`'s only extra reach is non-bundle text files, which finding 2 cuts.
   - Marked DEFECT because the entry as written is not buildable without a decision, and because it adds scope.

3. **DEFECT: R-OLD, a published row with no `parts`.**
   - `publication/index.mjs:2136` defaults `parts` to `[]`. The assembly falls back to `{path:"bundle.md", sha256: f.published.bundle_sha}` (`public-read/casefile.mjs:99-100`).
   - The entry's "Per finding, the `bundle` part first" reads `findings[].parts` only, so a finding with empty `parts` is never healed.
   - Add to the Design: "the bundle part of a finding is the entry of `parts` whose `sha256` equals the finding's `bundle_sha`, else `{path: 'bundle.md', sha256: bundle_sha}`, the assembly's own fallback (`public-read/casefile.mjs:99-100`)".
   - Add a failing-first case: a finding row with `parts` empty, bytes absent, built by the sweep (red today).

4. **GAP: the same-tick second assembly for a non-member finding inflates the backoff.**
   - `building` and `failed` each add one to `casefile_attempts` (`publication/index.mjs:2301`). Backoff is `15 s * 2^(n-1)` up to 1 h (`:169`, `:187`). The first assembly records `failed`, then the second records `building`, so one tick adds at least 3.
   - That makes the edition wait longer if the repair fails.
   - Reached non-members are published by their own op=ratify, and their own copy fails only in the same way as a member's (the same single-finding case).
   - Proposal: cut (g) and the non-member repair from G57 and give them one line under R-NOTMET as "not seen, not planned" (the entry already says "judged less likely"). If kept, state the attempts cost and add a control: a failed repair leaves the attempts at the count of one tick, not three.

5. **GAP: ordering and starvation if more than the bundle part is kept.** Moot after finding 2. If not cut: do the `bundle.md` of every finding first, then the other parts, so the byte bound cannot stop before a later finding's `bundle.md`. The assembly needs only those.

6. **GAP: how the sweep reaches record-core.**
   - `sweepCaseFiles` is a pure function with injected deps (`casefile.mjs:39`). The new read must be one more dep: `textAt(bundleId, sha)`, passed from `caseFileSweep` (`ratification/index.mjs:864-871`) as `(b, s) => this.record.fileTextAtSha?.(b, s) ?? null` (or `textAtSha` per finding 2).
   - State it, and the control "a world without the provider heals nothing and records `FINDING_MISSING` as today" (so `g54-paths.test.mjs` stays green before record-core merges).

7. **GAP: `prior.copy_error` short-circuits the materials information.** `assembleCaseContainer` returns at `worker.mjs:~208` on `copy_error` before reading `prior.materials_missing`. A tick with a heal error and a missing material records `BUCKET_FAILED`, not `MATERIAL_MISSING`, and does not advance the run count toward `stopped`. Say so in the Design (acceptable), and add it to control C5.

8. **GAP: failing-first (f) as written.** The part's published `bytes` is checked against the stored size by `partsHeld` (`provenance/index.mjs:324`). A "17 MiB" claim with a smaller object fails verification. The fixture must hold a real 17 MiB object. Moot after finding 2.

9. **GAP: faults must reach both buckets.**
   - In (a) the fault is injected into the act's `ctx` env, and the sweep's `worker.env` is a separate object in `g54-paths.test.mjs` (`house({worker:{env,...}})`).
   - Say the test uses ONE `PUBLISHED` map for both, with a `put` that throws once for the finding's key, as the shape of the entry's example requires.

10. **NOTE: line reference.** `publication/index.mjs:902` should read `:901` (the `JSON.stringify(shas.map(...))`).

11. **NOTE: `ratification.md:116` still says "(`textAtSha` not yet provided ...)".** If record-core's R89 is kept, BOB's Uses edit can fix the stale parenthesis in the same pass.

12. **NOTE: R89 is free** (highest record-core requirement is R88, `record-core.md`), and the plan has no other record-core R89 claim, so there is no collision.

13. **NOTE: R-OLD.** `stopped` editions (MATERIAL_MISSING) are not owed and so are not healed. State "an edition stopped for MATERIAL_MISSING is not touched" in R-OLD.

14. **NOTE: the "hourly" claim.** The backoff ceiling is `CASEFILE_BACKOFF_MAX_MS` 3,600,000 (`publication/index.mjs:169`), reached after about 9 attempts, so the cause paragraph's "hourly, for ever" is correct only after that.

15. **NOTE: the wake.** "Nothing recorded; the edition stays due" makes `caseFileWake` answer now (`publication` due is `attempted_at + backoff`, unchanged), so the alarm re-fires at once until the heal completes. The entry's "every tick copies at least one part" bound suffices. Add the control that a tick over a part that is never copyable (a put that throws for good) records `BUCKET_FAILED` once per tick and backs off, rather than spinning with no record.

## Tests

The red claims for (a), (b), (c), (e) hold on today's tree: the sweep calls the assembly, which reads the bucket by hash, so each ends `failed` `FINDING_MISSING` at step `build`. Tests (a), (c) and (e) can use the real `ratifyOp` and `caseRatifyOp` with real signatures (`g54-paths.test.mjs:185-197`). The R60 test pattern is at `record-core.test.mjs:1106`.

## Second review (revised entry)

(a) First review DEFECTs. 1 (bound, 150 vs 1,000 findings): resolved in the L paragraph; but the in-edition rule it introduced is a new DEFECT, see S1. 2 (capture healing): resolved by BOB's decision (bundle.md only, `textAtSha`, no record-core job). 3 (empty `parts`): resolved (fallback in the Design, test (d)). The non-member second assembly: resolved (not planned, stated, observed in L). Items 6, 7, 9, 10, 11, 13, 15 of the first review are all taken in.

(b) New cites checked and right: `worker.mjs:218-221` (copy_error early return), `:517-518` (estimate), `publication/index.mjs:177-186` (`caseFileWhy` keeps only code, step, error, detail, bytes, files, run), `:2301`, `:169`, `record-core/index.mjs:712-715`, `ratification/index.mjs:1038-1041`. No stale line found.

(c) Tests (a), (b), (c), (d), (e) are red today through the real acts (the sweep records `FINDING_MISSING`). (g), (h) are red (no heal, no `casefile_heal`). C1-C6 are green today. Test (f) is wrong, see S1.

(d) Buildability.

S1. **DEFECT: the in-edition files stop can livelock an edition of more than 400 findings.** The Bounds paragraph stops the heal "before a finding when the tick's `files` already reach 400", and each `head` of an already-present file counts. The next tick starts again at finding 1: the first 400 are present but cost 400 heads, so the budget is spent before finding 401 and the tick never gets past it. An edition of 401 to about 1,000 findings (the assembly allows 1,000) with an absent `bundle.md` late in the list is never healed. A healthy large edition may also stop short with the assembly "not run". Test (f) as written ("at least 400 member findings, all absent ... when complete, built") cannot pass. Change: the stop inside an edition is on puts and bytes only (for example, a cap of 200 puts and the 16 MiB bytes), never on heads of present files. Heads for one edition are at most 1,000 and are counted into `files` after the heal, so the existing check at `casefile.mjs:51` skips the second edition. Per tick this is at most 1,000 heads plus 4,000 assembly files, under 10,000, and L reports it. Rewrite (f): an edition of 450 findings, the last 3 absent, built in one tick (red today: `FINDING_MISSING`); a second owed edition is not taken in that tick; control: two small editions are both taken.

S2. NOTE: the head-before-put cost also falls on editions owed for other reasons (for example `MATERIAL_MISSING`) on every retry; it is at most 1,000 heads per try and is stated by L.

Remaining DEFECT: S1 only.
