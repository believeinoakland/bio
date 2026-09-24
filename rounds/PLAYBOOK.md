# PLAYBOOK: one round between Claude Code and claude.ai

A **round** is one bounded question taken to claude.ai for divergent thinking and brought back to be
checked and recorded. Each round lives in `rounds/NN-slug/`.

Claude Code does every step except 2 and 3. Bob's part is to talk, then paste once.

## Step 0: the session (Claude Code)

- Work in a Claude Code session opened on `believeinoakland/bio` at branch **`ux-study`**. Its
  `CLAUDE.md` is this lane's charter.
- Get `main` for reading: `git fetch origin main` and `git worktree add ../bio-main origin/main`.
  Run `bio`'s tools from there (`node tools/status.mjs …`). They need node 26; if it is missing,
  run `main`'s `.claude/hooks/session-start.sh`.
  Read `CLAUDE.md` and `STUDY-NEXT.md` whole.
- Check that `main` is current: `git -C ../bio-main log -1`, and note the commit in the packet.

## Step 1: the packet (Claude Code)

Write `rounds/NN-slug/PACKET.md`. It must fit well inside claude.ai's context: **under 40k tokens,
including the screenshots**. It contains, in this order:

1. **The question.** One sentence, and why it matters, in doctrine terms.
2. **What claude.ai needs to know, and nothing more.** Corpus excerpts, quoted and cited by section.
3. **Current state.** What is BUILT, what is DESIGNED and what is UNDETERMINED for this topic.
   - Take it from `status.mjs` and `decided.mjs`, run that day, not from memory.
   - Give the date and the `bio` commit.
4. **Screens.** Screenshots of what a person sees today, named `NN-slug/screen-*.png`.
5. **Constraints.** Rulings that bind any answer.
6. **What to bring back.** Ideally a range of concepts and Bob's reactions to them, not a verdict.
7. **The closing prompt.** Copy it verbatim from `rounds/CLOSING-PROMPT.md`.

Send Bob the packet file and the screenshots. Tell him the round is ready, in one line.

## Step 2: the conversation (Bob, in claude.ai)

In the **BIO UX Study** project, start a new chat and drag in the packet and screenshots. Talk
freely. When done, paste the closing prompt that ends the packet.

## Step 3: the return (Bob)

Copy claude.ai's round summary and paste it into the Claude Code session. No explanation needed.

## Step 4: the intake (Claude Code)

1. Save it verbatim as `rounds/NN-slug/SUMMARY.md`.
2. **Check every claim it makes about the system** against `status.mjs`, `decided.mjs` and the
   corpus. Write the corrections in `rounds/NN-slug/INTAKE.md`. claude.ai saw only the packet, so it
   will have filled gaps with assumptions.
3. Tag each concept **PROPOSED**. Carry the strong ones into `journeys/` or `patterns/`.
4. Bob's stated preferences and rulings go to `DECISIONS.md`, quoted and dated.
5. Open questions go to `QUESTIONS.md`, each with a recommendation.
6. If a concept deserves one, build a prototype in `prototypes/` and publish it as an artifact.
7. Update `STUDY-NEXT.md`, then commit and push.
8. Tell Bob what the round produced and propose the next round.

## Step 5: improve this playbook

After each round, write one line in the log below: what went badly in the switching, and the change
made to this file because of it.

## Log

| round | date | what went badly | change made |
| --- | --- | --- | --- |
