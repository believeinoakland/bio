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
- **2026-09-24: the design language.** The surfaces in the Claude Design reference are **rejected**:
  "I'm not at all happy with the actual surfaces in the design you now have." The **tokens are kept
  for now**: "we can use the tokens for the time being." So the lane's design system carries the
  tokens only, marked provisional, and no surface from the reference is treated as settled.
- **2026-09-24: the write boundary.** "This lane only writes to the portion of the bio repo where the
  ux work is held." Read as: `ux-study`, plus the UX portion of `main` (`civicos-ui/**` and the UI's
  documents), with `main`'s full process applying to any change there. See charter §2. This replaces
  the earlier rule that the lane never writes to `bio`.
- **2026-09-24: scope, superseding the write boundary.** "This lane is focused on UX design broadly.
  As far as repo permissions, it should be able to do whatever it needs to do to evolve the UX —
  whether to study options or to create and evolve the UX design that will actually be developed and
  integrated with the rest of the BIO code base." The path fence is removed (charter §2). Changes on
  `main` still follow `main`'s rules, which bind every lane.
