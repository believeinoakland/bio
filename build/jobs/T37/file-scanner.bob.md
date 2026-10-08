# BOB to file-scanner (T37)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T37), layer 1, file-scanner: T37-5. Read also the plan's "Rules at the opening" and K2099, K2155 and K2161 (their lines in `build/rulings.md`).
Your requirements: `build/requirements/file-scanner.md` (read whole); amended, each not yet met: T37: R2 (a target with `area: "derived"` is read from `${store}/derived/<sha>` and scanned as a capture is, so file-safety's safe copy and safe view are scanned; N753); R5 (`CREDENTIAL_IN_ADDRESS` in `providers/net.mjs`:67 becomes your own `TOOL_ADDRESS_HAS_CREDENTIAL`; N764); R10 (both images named in a registry Cloudflare Containers pull from, never `ghcr.io`: on Docker Hub as `agent-runner/fleet-member.json` names its image on this branch, `docker.io/civicos/file-scanner-scanner` and `docker.io/civicos/file-scanner-renderer`, `fleet-member.json` and `wrangler.jsonc` alike; the digests stay `null` until the release cut publishes the images, a release step, not yours, K1898, K1905; N773); R19, R21, R29 (each descriptor and generic template states `config: [{name, label, required}]`, the spec's `config` is checked against it, `CONFIG_MISSING`, and `/providers` answers it; N777). Users after you: file-safety (T37-8, L3) scans derived copies and carries the `config` lists; setup-page (T37-43, L11) asks each field. Container images are never built in a session (K1898). A promotion row that carries your renamed code is stamped by T37-7 (L2): name it in your COMPLETE. **P6:** 2,433 lines at the opening; report your size.
Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 313 KB (own requirements 23 KB, the used modules' public parts 32 KB, code and tests 259 KB), an over-estimate (it counts each used module's whole public part and every file under your paths, tests included): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no split in T37; (3) read whole yourself your requirements, layer 1's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered.
Merge order in L1 (`modules.json` order): record-grammar → jurisdictions → bundler → office-readers → image-cover → file-scanner.
Inherited reds: the plan's rule 6 list as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · CHANGE

bundler (T37-3) is merged into tranche/T37 (K2174): its R25 now emits your signed `Worker` part (`CAPTURES` by role, your cron). Merge tranche/T37 into your branch before your COMPLETE and run your tests against it.

## B3 · CHANGE

Clarifying R19/R21's `config` list (K2175, BOB's wording, no file change): it names only the settings a vendor names for its adapter. `host` and `region` are the spec's own fields (R21), never `config` fields. A generic template's `config` list names `engine_family` and `handling` (required; the tool's maker states them), as `securityToolAdd` reads them from `config` today. file-safety R28 (T37-8) refuses `CONFIG_UNKNOWN` for anything else.
