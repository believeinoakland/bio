# The UX substrate

What a member sees and works with, as the approved requirements and Bob's rulings define it, for Bob's UX redesign. The page opens with the decisions still Bob's to make, each with a brief (background, what is already fixed, the choices, a recommendation and ways to answer), then states what is settled as it now stands.

- `ux-substrate-v2.json`: the inventory (constructs with their acts and act weights, relationships, roles, display primitives, what is decided but not yet built, where canon and requirements disagree, old-interface divergence, working names, glossary, screens, and Bob's other rulings that shape what members see).
- `ux-experience.json`: audiences, use cases, step-by-step experience, screen rules, and the open questions (numbered; each open one carries a `brief`, each settled one a `ruled` entry stating the design as it stands).
- `build_ux2.py`: renders both into `ux-substrate.html` (run `python3 docs/development/ux-substrate/build_ux2.py` from the repository root). Published at https://claude.ai/artifact/JsPZAftab91EL9Ut91qWGx with `views/` beside it.
- `views/`: the Action design's screen sketches (`build/plan/action-design/*.html`), each with a document head so they publish beside the page; `plan-page.html` is approved (K608 (4)).
- `measures-map.html`: the approved measures map DEC-82 rests on (rendered at https://claude.ai/artifact/TfqcXNaJQ86SZzUA8Xn6Ni).
- `ux-substrate.json`, `build_ux.py`: the first inventory and its renderer, kept for reference.

**As of** `main` @ `c1a27e41a5` (T11–T19 built; the Action layer built at the plane, with no member screens yet); Bob's rulings DEC-1–DEC-95 and K-rulings to K859. The open-question briefs were checked against the same commit. The requirements (`build/requirements/`) win over this snapshot. When Bob closes a question the page lists, the page is updated in the same change that records the ruling (K438).

## Working alongside the development process

Bob runs two streams of work under two accounts, and neither can reach the other's sessions; they meet only in this repository.

- **The development process** (ROOT, BOB, module jobs, tranches) runs on Bob's **secondary account** (ROOT #3 onward, K742). BOB owns `build/` (requirements, plans, `build/rulings.md`, `next.md`) and records there the answers Bob gives it, as K-rulings; some of those settle UX questions (for example K899 (1) on "record", K903 (4) on hidden dependents).
- **The UX design session** and its successors run on Bob's **primary account** (this page's session: `session_01EhPoUTrVCgAqw2ktRyKjCU`). It owns this folder and records Bob's UX rulings in `docs/development/DECISIONS.md` (DEC entries, each naming the session and account in its `raised:` line), folds each into the canon document it changes, and updates and republishes this page in the same change.

**How the design session records, so the two never collide or contradict:**

1. Before recording a ruling, fetch `main` and read the K-rulings and DEC entries added since the last look. A ruling Bob made through the development process may settle or change the question; if so, the page cites it and says it was made there, and no second, possibly conflicting, ruling is recorded.
2. DEC numbers are taken from `main` and this branch together. Until this branch merges, a new DEC entry on `main` with the same number is renumbered on this branch (K473's practice), never on `main`.
3. The design session never writes BOB's ledgers (`build/rulings.md`, `build/plan/*`, `build/requirements/*`). What a ruling needs from the build is written in its DEC entry's `owed:` line and gathered in the pull request, which is the handoff: BOB reads them once the branch merges, places the work and records it as K-rulings.
4. The branch merges `main` in often and keeps its pull request mergeable, so the development process sees the design rulings as soon as Bob merges them.
5. Questions the development process defers to the design session (for example retraction of a published case, deferred from T21 on 1 October) are taken up here as briefs on this page.
