# Situation: a round of fixes from a walk

**Status** · The product's own procedure, read whole by BOB when it writes a round from walk defects (the process's `roles/BOB.md` names this folder; the manifest lists each file). Bob's rulings it carries keep their source ids.

- Every defect understood before the next deploy (Bob, K4426: "...really fixed every issue before we do another deployment."; K4597). Each walk defect has, in the fix plan the day it is written, (1) its root cause with evidence; (2) why tests missed it, that gap fixed; (3) a test of the walker's exact case through its real entry, seen red then green; (4) if platform-dependent, a check at its real shape. "Unknown" only with a diagnosis file holding a reproduction at that shape (K4428). One owning job per cause, closed only on the walker's case (K4427). BOB reads the cited code before placing; a worker's "probable" is never adopted (K4849).
- A fix round is a round (mechanics §5.2): its plan is fixed when it opens, and defects found while it runs go to the running job of their module, else to the next round.
