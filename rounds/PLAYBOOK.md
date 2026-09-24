# PLAYBOOK: one round with claude.ai

A round is one bounded question taken to claude.ai to diverge, then brought back here to be checked.
It lives in `rounds/NN-slug/`. Bob does steps 2 and 3; the lane does the rest.

## 0. Setup (lane)
Work in a checkout of the `ux-study` branch. Read `main` from a worktree:
`git worktree add ../bio-main origin/main`. Run `bio`'s tools there; they need node 26.

## 1. Packet (lane)
Write `PACKET.md`, under 40k tokens including the images. In this order:
1. The question, and why it matters in doctrine terms.
2. Only the corpus excerpts claude.ai needs, cited by section.
3. What is BUILT, DESIGNED and UNDETERMINED, from `status.mjs` and `decided.mjs` run today, with the
   `main` commit.
4. Screens, as `screen-*.png`.
5. Rulings that bind any answer.
6. What to bring back: a range of concepts and Bob's reactions, not a verdict.
7. `CLOSING-PROMPT.md`, verbatim.

Send Bob the files, with a one-line note.

## 2. Talk (Bob, in claude.ai)
In the BIO UX Study project, start a new chat, drop in the packet and the screens, and talk. When
done, paste the closing prompt.

## 3. Return (Bob)
Paste claude.ai's round summary, or a design's link, into the Claude Code session.

## 4. Intake (lane)
1. Save the summary as `SUMMARY.md`.
2. Check every claim claude.ai made about the system. Write the corrections in `INTAKE.md`.
3. Tag each concept PROPOSED, and carry the strong ones into `journeys/` or `patterns/`.
4. Bob's rulings go to `DECISIONS.md`; open questions go to `QUESTIONS.md`.
5. Build a prototype if a concept earns one.
6. Rewrite `STUDY-NEXT.md`, push, tell Bob the outcome, and propose the next round.

## 5. Improve
After each round, add one line here: what went badly, and what changed because of it.

| round | date | what went badly | change |
| --- | --- | --- | --- |
