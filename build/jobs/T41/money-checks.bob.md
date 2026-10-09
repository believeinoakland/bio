# BOB to money-checks (T41)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T41), layer 5, money-checks: T41-12a (tests only). Read also K2442 and K2448 (their lines in `build/rulings.md`).
D54 (Bob's "D54: B", K2408; built by membership in L2, K2442): an administrator, the founder included, neither invited nor joined to a HIDDEN project sees it only at `EXISTENCE` (its id, name and owners), never its contents; discoverable projects unchanged. Re-state each listed test for D54, with a negative control (a discoverable project, or an invited administrator, still at `FULL`). Your `noticed.test.mjs`:109 and `run.test.mjs`:135. No requirement change; a requirement text assuming the old sight is a QUESTION.
Reading set (mechanics §17): measured at this START: 385 KB by `build/plan/reading-sets.py`, an over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set, with your tests, first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no further split in T41; (3) read whole yourself your requirements, layer 5's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered (K2304). This step is required, not optional.
Merge order in L5: `modules.json` order; none of L5's jobs uses another's change.
Inherited reds: the plan's "Rules at the opening" rule 4 list as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · CHANGE

Re-opening T41-12a (P8: a flaw in your own module is dealt with in your job). Your J1's two flaws are now requirement text on tranche/T41 @ 5349f5e4bf (K2467), both marked not yet met: T41: R5: switchDetector is held only by a participant of the project (membership R60): existence-only sight refused PROJECT_SEEN_NOT_A_PARTICIPANT through membership.existenceAct (R77), any other non-participant through membership.notAParticipant (R87). R13: a read naming a project the viewer sees at existence only (noticed among them) answers PROJECT_SEEN_NOT_A_PARTICIPANT through existenceAct, never NO_SUCH_PROJECT. Your Uses gains existenceAct, notAParticipant. Merge the tranche branch, build both, test each explicitly with a negative control (a participant still switches; a discoverable project's administrator outside it is refused; a FULL viewer unchanged), run the checks, record completion again.
