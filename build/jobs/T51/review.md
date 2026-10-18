# review (T51)

**Status** · session_01DDca1CLodht7Fy36DU9DUp · depth 1 · WORKING · handled B1

## Completion record (T51-84)

COMPLETE for T51-84 · review. Branch job/T51/review.

**Entries applied**
- R35 (N1229, K3765): the member door's `copy` answer now carries `zone` at its top level (`index.mjs`), the same value as the grant part and roster rows (read once per copy), answered with or without a grant, `null` when none is held. The recipient door's copy is unchanged (its grant part carries `zone`).
- Explicit tests for R35's top level, with controls, in `zone-concluded.test.mjs`: a draft with no grant answers the zone; the profiles' fallback; no zone held is `null`, not UTC, at the top level; a draft with a grant answers the roster rows' zone; the recipient door has no top-level `zone`; the copy writes nothing. `copy.test.mjs` R11's key list gains `zone`.
- Stale comment `checks.mjs`:23–25 (the deleted `check-refusal-codes.mjs` guard and `civicos-ui/app.html`) restated for the code as it is; the same file's closing sentences on D-542 restated as past (the guard went with its walk). BOB's note named :25 and :23; both sit in one paragraph.
- A81 (DEC-330), confirmed: no new read. `reviewcopy` carries `last_change.at` (date), `updated_by` (author), `required_strength` (floors) and, with the control plane's in-band stamp (`control-plane` R20), the hash. The browser can assemble the stamped file from that answer. Note the in-band `hash` now covers the top-level `zone` for the member door.

**Deferred**: none.

**Found in other modules**: requirements text only, BOB's: `review.md` line 3 still marks R35 `*(not yet met: T51)*`; it is met now.
Generated artifacts made stale: `bio-plane/dist/bio-plane.bundled.mjs` and `release/bio-plane.bundled.mjs` embed `review/index.mjs` and `checks.mjs`; regenerate with the bundle command (manifest §14).

**Tests and checks**
- `node --test bio-plane/test/m/review/`: tests 61, pass 61, fail 0.
- Users of `reviewcopy` (publication, control-plane, screens-publish, case-authoring): 29 failing lines before and after my change, identical lists (diffed), so inherited reds, none caused by this job.
- format: 174 modules, 173 requirements files; 0 failures. architecture: 11 product files, 57 relative imports; 0 failures. coverage: 36 of 36 live requirement ids named by a test; 0 failures. ownership: 0 failures.

Size (session_01DDca1CLodht7Fy36DU9DUp): test runs 6, module lines 1430
