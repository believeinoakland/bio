# action-plans (T18)

**Status** · session_01EmH6oQtr3bJcfoBJpJtJPw · depth 2 · WORKING · handled B2

## J1 · QUESTION

Four readings I am building on now; answer only where you rule otherwise.

1. **An inquiry subject's project, sight and liveness (R1, R8).** An inquiry is "of the project" when the project cites it (`inquiry.projectsDrawingOn`, the project's `cites` reference not severed; there is no other project link for an inquiry). Sight: `membership.inSight(inquiry, author)`. Live states: `open`, `surfaced`, `deferred`; "closed" (`SUBJECT_NOT_LIVE`, R8's `closed`): `concluded`, `dismissed`, `divided` (and `published`, read never entered).
2. **`short` support (Terms, R2).** Derived on read for a determined subject: each finding the determination pins (its frozen pair, `conformance` R9) against `strength.projectBar(project)` per declared axis (A strongest). Any finding below the bar on a declared axis, or not graded on it, reads `short` with why; no bar declared, or every finding at or above it, reads `established`.
3. **R32's skill version and `work_kinds` "as they stood when the run opened".** `ai-runs.runFor` answers no skill version and the open check (R47) gets no run id, so: the skill version from `ai-runs.read` (its R19, async: `optionPropose` is therefore async, the store awaiting it as it does `op=airun`), and the `work_kinds` snapshot taken by an `ai-runs.onRunOpened` listener (its R43) for a plan-mode run, in this module's own table. Both are ai-runs services (in my uses) not named in my Uses list.
4. **A plan is a record object** (`PLN-` document through `promotion`, escalation's pattern: an append-only Plan Log, projected into my tables; R27's history). Note for R6/R25: `membership.viewerPredicate` admits every member to any non-project bundle, so the plan's document, like an escalation's, is readable by record-wide bundle reads to a member outside the project. This module's own reads answer `NO_SUCH_PLAN` by project sight (R6, R22), and no public viewer is admitted (R25 holds). If you want plans held in tables only (no bundle), say so before my first checkpoint.

Also, as decided (reported, not asked): `CONTACT_NOT_A_MEMBER` (R18) is relayed with `actions`' own row (its R45), not minted here; option ids are `opt-<n>` within a plan, proposal ids `<plan>/proposal/<n>`; a source naming an option is `<plan>#opt-<n>`.
