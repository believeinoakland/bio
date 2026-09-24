# DECISIONS: Bob's rulings in this lane

Dated, verbatim where possible, newest last. A ruling here governs this lane only. It reaches BIO when
Bob carries it there.

- **2026-09-24: the lane.** This lane studies the design of the BIO UX. It "runs separately from the
  BIO development process, at least for now."
- **2026-09-24: its home.** The study is done in Claude Code, because of the size of the scope ("a
  VERY challenging scope of work"). claude.ai is used for bounded rounds of divergent thinking, one
  question at a time.
- **2026-09-24: the home.** The lane lives on `ux-study`, a standalone branch of `believeinoakland/bio`
  that never merges into `main` ("ok, create ux-study in the bio repo"). A separate repo was
  preferred, but the Claude GitHub App cannot create repositories. The branch gives the same
  separation: `bio`'s `CLAUDE.md`, hooks and gates are not on it, CI runs only on `main`, and pruning
  touches only `land/*`.
