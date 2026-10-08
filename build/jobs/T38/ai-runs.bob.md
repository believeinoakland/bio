# BOB to ai-runs (T38)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T38), layer 6, ai-runs: T38-28 (N708's remainder), test only. Read also K2283 and K2290 (their lines in `build/rulings.md`).
Your requirements: `build/requirements/ai-runs.md` (read whole); unchanged. Your work: `bio-plane/test/m/ai-runs/scheduler.test.mjs`:171–175 sets a `subscription` reference, refused `UNKNOWN_ACCOUNT_KIND` since T38-5 (credentials R22). Replace the case, do not drop it: a member connected through their subscription (credentials R43) with no reference is dispatched with the account `{kind: "signin", level: "member", member, suggestions: false}`, no `secret` key, as agent-worker R6 states it (K2290; agent-worker's job, T38-10, builds it in this layer). No `src/` change is expected; if one proves needed, ask in a QUESTION first. Clears plan rule 6 item 11's ai-runs share.
Reading set (mechanics §17): measured at this START by `build/plan/reading-sets.py`: 640 KB (own requirements 31 KB, the used modules' public parts 391 KB, code 219 KB), an over-estimate (it counts each used module's whole public part and every file under your paths, built bundles included): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no split in T38; (3) read whole yourself your requirements, layer 6's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered.
Merge order in L6: agent-model → agent-worker; ai-runs merges when complete.
Inherited reds: the plan's rule 6 list as it stands at your START; only item 11's `scheduler.test.mjs`:171–175 is yours.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.
