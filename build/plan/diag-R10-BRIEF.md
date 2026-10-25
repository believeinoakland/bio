# Brief: diagnosis of re-walk 9's causes (fix round 10 of T51; K5047)

**Status** · For the four study sessions DIAG-R10-A to D, written by BOB #287. Each session diagnoses only its groups. It changes no product code and no test, and writes only its own file `build/plan/diagnosis-R10-<a-d>.md` on its own branch `prep/diag-r10-<a-d>` (already pushed from the tranche; commit and push after each cause, never force).

## What you read
- `build/plan/fix-round-10-T51.md` §1: the causes R1-R39, grouped G1-G7, each naming the walk rows that show it.
- The walk records `build/plan/walk-T51-rewalk9/A.md` to `E.md`: read whole the records your causes cite (they are under 30 KB each).
- `build/modules.json` (who owns which file) and each owning module's `build/requirements/<module>.md` part your cause touches.
- The code at the cause, read in full around it; never guess from a name.

## What you write, for each cause (Bob's K4426; K4428, K4849)
1. **Root cause with evidence:** the file:line where the wrong behaviour is decided, the lines read, and why it gives what the walker saw. If several causes share one root, say so and merge them.
2. **Why the tests missed it:** the module tests that should have caught it and what they assert instead (often a hand-built answer: name it).
3. **A failing-first test at the walker's exact case through its real entry path:** the module that owns it, the test file, what it builds (the generator recipe the walker used, from the record) and what it asserts; reproduce it red where you can in-process (Node, the module's own fixtures, `bio-plane/test/m/plane/fixture.mjs` for the real store), and say whether you saw it red.
4. **The platform check:** where the cause depends on workerd, R2, the Durable Object or the proxy, the check at that real shape (Miniflare, or the live copy's reading) and what it must show.
5. **Owner:** the one module whose job fixes it (K4427: one owning job per cause); a requirement that is wrong or silent, quoted, for BOB.
6. "Unknown" only with a reproduction recorded at the cause's shape (K4428).

Wording of a sentence a member reads is the word table's (`setup-words`, `docs/development/ux-substrate/screens/words.json`): say which key is drawn and whether the defect is the key chosen (a module's) or the sentence itself (the design's, for UX-DESIGN).

## Groups
- **DIAG-R10-A:** G1 (R1-R5) and G7 (R35-R39).
- **DIAG-R10-B:** G2 (R6-R10) and G3 (R11-R18).
- **DIAG-R10-C:** G4 (R19-R23) and G6 (R29-R34).
- **DIAG-R10-D:** G5 (R24-R28). Also read `build/plan/lane-performance/HANDOFF.md` and the round-9 diagnoses `build/plan/diagnosis-R9-headofline.md`, `diagnosis-R8-speed.md`; the live copy biosmoke8 may be read (never written) through the environment's proxy with `JOURNEY_ADMIN_*` (Chromium `proxy: {server: HTTPS_PROXY}`; the direct route is never tried, K4733); one browser context at a time.

## Ending
Push the file, set its Status line to `COMPLETE`, and end the turn with one line: `DIAG-R10-<x> complete: <n> causes. Nothing for Bob to do.` Keep the session until BOB archives it. Before any test run: `for d in $(git ls-files '*package-lock.json' | xargs -n1 dirname); do [ -d $d/node_modules ] || (cd $d && npm ci --ignore-scripts --no-audit --no-fund); done` (K4113). Never print a secret.
