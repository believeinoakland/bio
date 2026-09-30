# The UX substrate

What a member sees and works with, as the approved requirements and Bob's rulings define it, for Bob's UX redesign. The page opens with the decisions still Bob's to make, each with a brief (background, what is already fixed, the choices, a recommendation and ways to answer), then states what is settled as it now stands.

- `ux-substrate-v2.json`: the inventory (constructs with their acts and act weights, relationships, roles, display primitives, what is decided but not yet built, where canon and requirements disagree, old-interface divergence, working names, glossary, screens, and Bob's other rulings that shape what members see).
- `ux-experience.json`: audiences, use cases, step-by-step experience, screen rules, and the open questions (numbered; each open one carries a `brief`, each settled one a `ruled` entry stating the design as it stands).
- `build_ux2.py`: renders both into `ux-substrate.html` (run `python3 docs/development/ux-substrate/build_ux2.py` from the repository root). Published at https://claude.ai/artifact/JsPZAftab91EL9Ut91qWGx with `views/` beside it.
- `views/`: the Action design's screen sketches (`build/plan/action-design/*.html`), each with a document head so they publish beside the page; `plan-page.html` is approved (K608 (4)).
- `measures-map.html`: the approved measures map DEC-82 rests on (rendered at https://claude.ai/artifact/TfqcXNaJQ86SZzUA8Xn6Ni).
- `ux-substrate.json`, `build_ux.py`: the first inventory and its renderer, kept for reference.

**As of** `main` @ `ef7f089d2c` and `tranche/T18` @ `c40e7e09d6` (T11–T17 built; T18 open, building the Action layer, whose canon `BIO_Action_v0_1.md` and requirements are placed there); Bob's rulings DEC-1–DEC-95 and K-rulings to K627. The requirements (`build/requirements/`) win over this snapshot. When Bob closes a question the page lists, the page is updated in the same change that records the ruling (K438).
