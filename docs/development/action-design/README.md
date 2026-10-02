# Action design (ACTION_DESIGN sessions, week of 2026-09-29)

Design work on the Action layer (layer 9, `build/layers.md`). **The role (Bob, 2026-09-30):** the ACTION_DESIGN session owns the Action layer's requirements, architecture, UX and every other action-related piece of work. All development is managed by BOB: what this session produces is integrated into `main` in coordination with BOB, and BOB manages the resulting work (plans, jobs, tranches). **The working line (K592, on `tranche/T17`):** design only, with Bob (rulings, requirement drafts, the member's path, UX views), on this branch under this folder; never `build/`, product code, canon or `main`; never merge PR #5; start no jobs or sessions. After a new ruling or a revised draft, commit here and ring the BOB named in the Status line of `build/plan/current.md` on the running tranche with a one-time routine naming the commit; defects found in running code go in that same note, for BOB to confirm and plan (P9). BOB recorded the rulings so far as K590 and staged the drafts in `build/plan/action-design/` (K591). Nothing here is build state or canon until BOB folds it or Bob rules it.

| file | what |
| --- | --- |
| `INVENTORY.md` | step 1: what the canon, requirements and code say, tested against Bob's framing. Rendered as `inventory.html` (built by `build_view.py`), published at https://claude.ai/artifact/K1mwerFkcrw4izPWy1RUGq |
| `sources/` | the four cited inventories `INVENTORY.md` summarises |
| `ACTION-PLAN.md` | the action plan construct, with Bob's rulings of 2026-09-29. Rendered as `action-plan.html`, published at https://claude.ai/artifact/Rmh9hhK1Y3nMm9phNz1KRp |
| `MATRIX.md` | step 3: the completeness matrix (purposes × stages, actors, roles within a group), the changes it implies and Bob's decisions D1–D6. Rendered as `matrix.html`, published at https://claude.ai/artifact/L9L6yUJYKwTZFkFnmfj97c |
| `drafts/action-plans.md`, `drafts/deltas.md` | step 4: the requirement drafts for BOB to fold: the new `action-plans` module (R1–R28) and the changes to `layers.md`, `modules.json`, `actions`, `filings`, `monitoring`, `scheduler`, `queue`, `skills` and `jurisdictions`. Rendered together as `drafts.html`, published at https://claude.ai/artifact/SxCiFN8WMLRXd3xUEfL887 |
| `drafts/tests.md` | the tests each drafted requirement needs, with negative controls; included in `drafts.html` |
| `PATH.md` | step 5: the member's path through acting, from a young inquiry to a closed plan, on the substrate's surfaces. Rendered as `path.html` |
| `HANDOFF.md` | the handoff to BOB: Bob's rulings to record, what to fold, what was found on the way |
| `BIO_Action_v0_1.md` | the proposed level-1 home of the Action layer: purpose, contract, constructs, rules, the sixteen contradictions reconciled, the canon text to change, and six points still Bob's. Rendered as `action-home.html` |
| `UX-ANSWERS.md` | the UX substrate's open questions and use cases the Action rulings settle, with the text for BOB to enter (K438). Rendered as `ux-answers.html` |
| `views/plan-page.html` | APPROVED by Bob 2026-09-30. A UX view: an interactive design mock of the plan page with the bond-measure example as sample data |
| `views/start-and-send.html` | a UX view: starting an option (the ACT preview, the refusal and the override with its disclosure) and preparing, approving, stamping and recording what is sent |
| `views/matter-page.html` | a UX view: one matter: determination per standard, consequences, the escalation track with a proposed stage, attached actions, pressure recorded |
| `views/surfaces.html` | UX views: standards in force on a date, a Tier 2 filing draft with unfilled blanks and the advisory, the Tier 3 counsel packet, and the queue items |
