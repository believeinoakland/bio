# BOB to capture (T41)

**Read** · handled J4

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T41), layer 3, capture: T41-8 and T41-8a. Read also K509, K2425, K2434, K2442 (their lines in `build/rulings.md`).
Your requirements: `build/requirements/capture.md` (read whole). Marked `*(not yet met: T41)*`: R86 `uploadCapture` (a member's upload of a file she holds: her required statement of origin, `UPLOAD_NO_STATEMENT` at the next free C-118 row, awaiting T42's stamp; `acquisition` R10's size limit and refusals; receipt `via: "upload"` at `upload:<sha256>`, method `uploaded`, attributed to her; held bytes answer `existed`; promoted `within` as R65). The op (`op=captureupload`), its route and help are L11's entries, not yours. Test R86 explicitly, each refusal with a negative control (K874).
A provided service of the same layer (§4): `provenance` R63 (PROVENANCE, this layer): code against its text; when BOB tells you provenance is merged, merge `tranche/T41` into your branch and run your tests against it before you record COMPLETE.
T41-8: D54 (Bob's "D54: B", K2408; built by membership in L2, K2442): an administrator, the founder included, neither invited nor joined to a HIDDEN project sees it only at `EXISTENCE` (its id, name and owners), never its contents; discoverable projects unchanged. Your tests `held` and `knocker.test.mjs`:685 assumed the old sight (rule 4 (11)); re-state them.
Reading set (mechanics §17): measured at this START: 716 KB by `build/plan/reading-sets.py`, an over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set, with your tests, first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no further split in T41; (3) read whole yourself your requirements, layer 3's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered (K2304). This step is required, not optional.
Merge order in L3: provenance, provenance-routes, capture-sources, acquisition, capture, file-safety (`modules.json` order; provenance provides R63 to capture).
Inherited reds: the plan's "Rules at the opening" rule 4 list as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · CHANGE

provenance R63 clarified (K2449) on tranche/T41: recordReceipt takes `by` and `statement` for via "upload" receipts; origin_statement is a top-level document field. Merge tranche/T41 into your branch and write R86's receipt with both.

## B3 · ANSWER · re J1

K2452. (1) Pass `by` and the statement to recordReceipt: provenance R63 now takes both for via "upload" (K2449, my B2 CHANGE), so test that a second sighting keeps its own uploader's statement. (2)–(5), (7) stand as you read them. (6) UPLOAD_WITHIN_FAILED stands (a distinct condition, K231). UPLOAD_MAX citing acquisition R10 stands for now; acquisition exporting CAPTURE_MAX is entered for T42 (one constant, one site).

## B4 · CHANGE

K2455. (1) Your narrowing of existed stands. (2) R76 amended on tranche/T41 (marked T41): a capture whose every receipt is a received route (doorbell, upload) answers null; build it with a test and negative control. Also: acquisition is merged and exports CAPTURE_MAX: import it in place of UPLOAD_MAX. Merge tranche/T41 into your branch now. (3) Noted: capture's split is N826 for T42. Provenance is not yet merged; I tell you when it is.

## B5 · CHANGE

provenance is merged (K2457). Merge tranche/T41 into your branch (capture's Uses now names provenance receiptsOfCapture), run your tests against it, and record COMPLETE.
