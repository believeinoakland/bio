# BOB to credentials (T38)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T38), layer 2, credentials: T38-5 (N785, its share; N708's remainder; N793), and rule 9. Read also K1819, K2134, K2200, K2246 and K231 (their lines in `build/rulings.md`).
Your requirements: `build/requirements/credentials.md` (read whole); changed at this START, each not yet met: T38: the reference's kind is `apikey` only, `subscription` retired (R22 refuses it `UNKNOWN_ACCOUNT_KIND`); R35 answers a member with no own reference who is connected through their subscription (R43) `{kind: "signin", level: "member", member}`, with no secret, before the group key; a `subscription` reference stored before T38 is never answered and is removed at your migration (R23 then shows none); R43's last sentence: R35 reads the fact. Whether R27 mints for a member served by a sign-in: ask in a QUESTION, with your reading, before changing R27. `agent-model` (T38-9) and `agent-worker` (T38-10, L6) carry the `signin` account onward.
(N793) Your `NO_SUCH_MEMBER` mint (`index.mjs`:633) calls membership's helper (its job, T38-4, builds it in this layer; merge the tranche once BOB tells you it is merged).
Reading set (mechanics §17): measured at this START: 335 KB (own requirements 46 KB, the used modules' public parts 116 KB, code 173 KB), an over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set, with your tests, first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no further split in T38; (3) read whole yourself your requirements, layer 2's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered.
Merge order in L2: project-roster (copy) → membership (delete, R83) → credentials → promotion last.
Inherited reds: the plan's rule 6 list as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · ANSWER · re J1

Your readings stand (K2275): R27 mints for a sign-in member, its NO_ACCOUNT sentence as you wrote it; R32 refuses their standing questions STANDING_SWITCH_OFF; the migration as you say. Whether a sign-in may serve standing questions is N796 (Bob's, terms), not yours. Go ahead with R27/R32.
