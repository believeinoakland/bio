# Handoff to BOB: the Action design, ready to fold

**Status** · Written by ACTION_DESIGN #1 (`session_01AvsM94TwTtNzadzkdQdU58`), 2026-09-30, for BOB #74 or its successor. Branch `claude/brave-johnson-5fqmix` (draft PR believeinoakland/bio#5); everything is under `docs/development/action-design/`, nothing in `build/`, product code or canon.

## What Bob ruled (to record in `build/rulings.md`, one line each)

- **2026-09-29, rulings 1–10** (`ACTION-PLAN.md`, "Bob's rulings"): the Action layer gets an action plan; no catalogue of response options; no budgets; one plan may address several related matters, an option serving several; a plan may start from a compliant or unclear determination; lobbying only to enforce or restore an existing requirement; unticked is undecided, declining is an optional act with a reason; up to three scenarios; categories mitigation, legal, awareness, journalistic, grassroots, other; a plan may open when an inquiry begins.
- **2026-09-30, D1–D6** (`MATRIX.md` §6, agreed as recommended): addressees beyond government offices, never a private individual (D1); the assistant drafts communications as proposals a member adopts (D2); `completed` joins the resolutions (D3); a project may declare its kind of work, shaping suggestions only (D4); a started option may name the group's contact (D5); any group may use CivicOS, disclosing a stake (D6).
- **2026-09-30:** a member closes a plan with a reason, a plan never closes itself (`action-plans` R20). Adding the `action-plans` module is BOB's, not Bob's ("a technical detail").

## What to fold (P18: preparation for the next tranche; touches no running job)

1. `drafts/action-plans.md` → `build/requirements/action-plans.md` (R1–R28; nothing open for Bob).
2. `drafts/deltas.md` → `build/layers.md` (layer-9 contract and row), `modules.json` (`action-plans`, `queue`'s new use), and the changes to `actions` (R7, R9 amended; R44–R46), `filings` (R22 in-band stamp, R23 communication drafts), `monitoring`/`scheduler`/`queue` wiring, `skills`, `jurisdictions` data; stale marks and `next.md` cleanup.
3. `drafts/tests.md`: the tests each requirement needs, with negative controls, for the jobs.
4. `PATH.md`: the member's path, for the UX work; and per K438, UX open question 9 (the action plan surface) is now answered by the rulings above, so the substrate page should be updated and republished.

5. `BIO_Action_v0_1.md` (added after the first ring; read the branch head): the proposed level-1 home of the Action layer. Its §6 canon edits and its listing in `requirements/README.md` wait on Bob's approval of §7.

## Found on the way (BOB's to plan)

- Monitoring's `deadlineRecheck` has no caller outside tests, and the queue has no kind for an overdue clock or a due stage: `monitoring` R34–R35 never reach a member.
- Filing drafts and counsel-packet exports carry no in-band stamp (Publication §3 rule 9), though `publication` R16 provides it.
- The real profile has no Tier 1–2 templates (every draft refused `KIND_NO_TEMPLATE`) and no holidays.
- The old interface's action intake writes `{state: named, name}`, which `actions` R9 refuses (read, not run).
- A member-created `breach: true` action through promote was reported refused in T9; probably fixed, not pinned by a test.
- Stale "not yet met" marks: `actions` R4–R11, R22, R28–R33, R40, R41; `monitoring` R34–R35; `publication` R36–R37. `next.md` still lists N61, N129, N130. DEC-1–DEC-67 are readable only on `coord`.
