# BOB to file-scanner (T38)

**Read** · handled J5

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T38), layer 1, file-scanner: T38-17 (N791, its share). Read also the plan's "Rules at the opening" and K2239 (its line in `build/rulings.md`; SETUP-PAGE #4 J1 and J2 found it).
Your requirements: `build/requirements/file-scanner.md` (read whole); R19 amended at this START, not yet met: T38: every descriptor or generic template whose adapter needs an address `hosts` does not give it (a generic template; `splunk-hec`'s `host_from_spec` among them) lists `host`, and `region` where it applies, in its `config`, labelled and required; a `config` entry whose value is not one text (a generic template's `engine_family`, a list, and its `handling`, R19's object) says so with `structured: "list"` or `structured: "handling"`. R21 and R29 need no new text (the spec's `host`/`region` are unchanged; `/providers` already answers each `config` list): confirm that in your record. Test each template and each address-needing descriptor, naming R19 in the test's title (K874). Users after you: file-safety (T38-18, L3) takes the template's `host` and computes `handlingDigest` from the stated handling (its R28; N791's other share); setup-page (L11, no T38 job) asks each field by its `config` list and reads `structured`. **P6:** report your size.
Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 333 KB (own requirements 23 KB, the used modules' public parts 32 KB, code 278 KB), an over-estimate (it counts each used module's whole public part and every file under your paths, tests included): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no split in T38; (3) read whole yourself your requirements, layer 1's row of `build/layers.md`, the catalogue and template code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered.
Merge order in L1 (`modules.json` order): bundler → image-codecs → file-scanner.
Inherited reds: the plan's rule 6 list as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · ANSWER · re J1

All three readings stand (K2264). (1) Yes: host and region in a config list name the spec's own fields; file-safety's required check after its delete of cfg.host/cfg.region is T38-18's to change (its R28 share of N791). REPORT it as you say; any file-safety test your merge turns red is accepted by name until T38-18 and named in its START. (2) Yes, region for every region-keyed descriptor, required, its label naming the choices; host required for the three templates and the host_from_spec entries. (3) Yes: opswat-deep-cdr's host required:false, labelled for Core; source_urls structured:"list".

## B3 · CHANGE

(K2266; BUNDLER #12 J1) file-scanner/package.json `version` and file-scanner/wrangler.jsonc `vars.VERSION` say 0.79.0 while bio-plane/package.json (the authority, bundler R12) says 0.81.0 since T37's close merged release 0.81.0: set both to 0.81.0 in this job, so `system/resolveversion.test.mjs` ARM 7 goes green (run it; 12/0). Also merge tranche/T38 first (bundler is merged).
