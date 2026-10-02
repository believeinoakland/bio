# reevaluation (T27)

**Status** · session_01KA6UG6rXYyJAWoe5sPuf8x · depth 2 · WORKING · handled B2

## J1 · QUESTION

R30's registration shape (docket R13 fills it; docket is built after me). R30 (a) needs, for a withdrawn edition, its member findings at the sha the edition pinned, and docket R13's `withdrawals` lists "case, owning project, the editions it names, the signing instant, its seq" with no findings. Nothing in my Uses maps a case edition to its members at their pins (`publishedCaseRegistry` carries editions only), so my best reading, which I am building now:

- `withdrawals({after, limit})` → `{withdrawals: [{case, project, editions: [n, …], findings: [{bundle_id, sha, edition}], at, seq, entry}], cursor}`: `findings` is each member finding of each withdrawn edition at its pin (`edition` the case edition it is a member of), `at` the signing instant, `entry` the docket entry's id (default `<case>#<seq>` when absent).
- `contested({after, limit})` → `{contested: [{case, edition, findings: [{bundle_id, sha}], at, entry}], cursor}`.
- `cursor` a string or null; a page is read until the cursor is null, repeats, or a page is empty (R26's `cases` pattern).

Other readings in this build:
- A leg rests on finding F "at the sha that edition pinned" when the edition of F it names (`target_edition`) was published with that `bundle_sha` (`publishedRegistry`), or, naming none, when F's live head is at that sha.
- `contested` is a cause on the member finding itself: its obligation's `target` is the finding, as R17's `weakened` is, so `recordReevaluation({dependent: F, target: F, source: "contested"})` closes it.
- `docket_absent` (with a why) is stated on every `reevaluations`, `changesOf` and `docketDependents` answer while nothing is registered, since both arms apply to any target. A failed page read states `docket_read: false`.
- `docketActed`'s dependents: for a withdrawal, the live legs on that entry's pinned findings (`{bundle_id, ord, role, state, target}`, the plane's view, R28's precedent); for a contesting entry, its member findings. R16's project half is not told there, because it is R16's cause and not R30's arm. An unknown kind tells nothing and answers `{ok: true, told: false}`.

If docket R13 should carry `findings` on a withdrawal, that is a requirement change for docket, not for me. Please confirm or correct the shape.
