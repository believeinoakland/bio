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

## Bob, 2026-09-30, later (to record)

- **Priority:** Bob is content with where the Action design stands, and asks that completing it, and the development BOB manages from it, be given priority high enough that Action-related development catches up with the rest of CivicOS and keeps up with it.
- **`BIO_Action_v0_1.md` is canon (whole):** place it at `docs/architecture/`, list it in `requirements/README.md` (narrowing Case Making's canon part as its §6 says), add System Design §3 row 16, and apply its §6 canon edits.
- **The requirement drafts** (`drafts/action-plans.md`, `drafts/deltas.md`) are "correct and complete enough" (Bob); staged under K591.
- **UX:** the plan-page view (`views/plan-page.html`) is approved; `UX-ANSWERS.md` is approved: OQ-8, OQ-9, OQ-25 answered, and OQ-14 answered by the earlier rulings DEC-10, DEC-69 and DEC-70, which the drafts now cite instead of restating.
- **UX (Bob, 2026-10-01, DEC-115):** `start-and-send.html` binds the redesign's content, step order and wording, as the plan page does: the refusal shown before anything runs, the reason asked in place, approving kept separate from recording the sending. In `surfaces.html`, the Tier 2 filing draft and the counsel packet (Tier 3) panels bind likewise. `matter-page.html`, and the standards list and the queue items of `surfaces.html`, are examples the designer may rework within the requirements. Look and layout stay Design's. Where a bound sketch predates a later ruling, the ruling wins: "Matter" for the start sketch's "Subject 1" and "subject 3" (DEC-114); every approved template version offered, the latest by default, and a filing written without one (K921, K924; the Tier 2 panel's "from the profile's template").

## 2026-09-30 · Bob's words on reminders and nagging (recorded at K615's request)

**What this session holds, verbatim.** Searched for "nag" and "remind": Bob's only words on the subject in ACTION_DESIGN #1 are these, answering the proposal that the queue carry one reminder per occurrence, never repeated:

> *"We've addressed questions related to 'nagging' already. Refer to those answers rather than us risking conflicting responses."*

Bob's other words in this session that bear on reminders: approving the plan page, and *"The action requirements drafts appear to be correct and complete enough"* (both 2026-09-30).

**What this session does not hold.** The points Bob recalls (choosing an action includes setting its reminder schedule, with defaults; responding to a deadline notice offers another reminder or none; the litigation hold not repeated unless asked, cleared when responding, else open until cleared; the filing-template library, with the assistant drafting one where none fits and a derivative kept) were not stated in this session's messages. They reach this session through Bob's words in BOB #74's session (K613) and through DEC-94 (Bob, 2026-09-29; PR #4), and are recorded and cited from there, not quoted as this session's. Nothing here should be read as a second, possibly conflicting, statement of them.

**Folded at `drafts/`** (commits `2b1fe7b967`, `682f0b96b1`): `action-plans` R29 (reminders set when a dated option is chosen, from defaults the member sees; fired as asked; another reminder or none on response; nearing is display only; overdue notifies once; no outside channel); `actions`' member-set reminders; the queue's kinds on DEC-94, the overdue clock a CONDITION (K611); the litigation-hold item not repeated unless asked and open until cleared, clearing being its disposing door (K613 (2)); `filings`' template library, assistant drafts a member adopts (K613 (3)). Cited: DEC-10 (at D-125), DEC-69, DEC-70 and DEC-94 (K615). Requirement numbers follow K611's fold.

## Found on the way (BOB's to plan)

- Monitoring's `deadlineRecheck` has no caller outside tests, and the queue has no kind for an overdue clock or a due stage: `monitoring` R34–R35 never reach a member.
- Filing drafts and counsel-packet exports carry no in-band stamp (Publication §3 rule 9), though `publication` R16 provides it.
- The real profile has no Tier 1–2 templates (every draft refused `KIND_NO_TEMPLATE`) and no holidays.
- The old interface's action intake writes `{state: named, name}`, which `actions` R9 refuses (read, not run).
- A member-created `breach: true` action through promote was reported refused in T9; probably fixed, not pinned by a test.
- Stale "not yet met" marks: `actions` R4–R11, R22, R28–R33, R40, R41; `monitoring` R34–R35; `publication` R36–R37. `next.md` still lists N61, N129, N130. DEC-1–DEC-67 are readable only on `coord`.
