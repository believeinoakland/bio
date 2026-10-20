# BOB to retrieval (T51)

**Read** · handled J7

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T51), layer 5, retrieval: **T51-42 · retrieval** (read the entry line whole). Model: claude-sonnet-5-5.
Your requirements: `build/requirements/retrieval.md` (read whole); folded by K3841; the ids marked `*(not yet met: T51)*` are yours to meet (R87-R90); R73-R76 and R80-R86 are retired, moved to retrieval-browse.
BOB's notes for this job:
1. Read `build/extraction/retrieval-browse.md` whole. retrieval-browse (T51-29) is built by copy first in this layer; after it merges BOB tells you (CHANGE): merge the tranche, delete your copy of the moved code and delegate (R90: the old exports and ops answer byte-for-byte what the new module answers; under 4,000 lines). Until then do R87-R89 and the rest.
2. Each new id needs its own explicit test, R88 included (already named elsewhere, K874). R87 (`searchFields().scopes`, `scope` on `search` and `meaningRows`), R88 (`ROUTES_CROSSED`; if the parsed query cannot tell a term's route, post a QUESTION: query-language's job is running in this layer), R89 (existence-only projects listed, never counted; R29 stands, U353).
3. N1238's row field is retrieval-browse R8 now, not yours. The stale comment at `checks.mjs`:73.
4. `bio-plane/test/m/citation/recorded.test.mjs` imports `src/retrieval/findin.mjs` directly: it is citation's test; when your delete lands, keep `findin.mjs`' exports reachable by re-export from `retrieval/index.mjs` and REPORT that test's import so its owner re-points it.
5. Drop `civil-time` and `calc-grammar` from your `uses` only if nothing of yours still imports them (a REPORT to BOB, who edits `modules.json`).
6. Words (DEC-334, design @ 89c8969094 in the tranche, K3854): after the split retrieval keeps 49 keys and 7 unkeyed phrases in `words-reads-mod-3.json`; your words test asserts `WORD_KEYS` equals `modules["retrieval"].reads`.
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes; run your other tests without reading them. Your set is under the 600 KB budget (`reading-sets.py`). A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
Tests never copy a sentence people read (K3810): a test asserts the key (`hasWord`) or reads the expected text from the word table; a test of yours that copies such a sentence, met while you work, is converted. Every new id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry (none of K3543 or K3557 is yours). Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (architecture must show 0 failures for your files) and `node checks/ownership.mjs /home/user/bio retrieval tranche/T51 job/T51/retrieval`. Your Size line counts only your module's own code (K2513).

## B2 · ANSWER · re J1

Confirmed: R88, R89 and the stale comment stand as you pushed them. Wait for my CHANGE after retrieval-browse merges; then merge the tranche branch, do R87 and R90 (delete the moved code, delegate byte-identically, words test to retrieval's 49 keys per DEC-334), and post COMPLETE. The words-test red is accepted until then.

## B3 · CHANGE

retrieval-browse is merged into tranche/T51 (K3865). Merge the tranche branch into yours, then apply R87 and R90: delete the moved code (build/extraction/retrieval-browse.md), delegate byte-identically to retrieval-browse through retrievalBrowseOf(deps) with the five host reads, keep the tests its COMPLETE names in retrieval (op=findin/op=browse through retrievalRoutes, selectionRead, findIn over a real selection, the real recordedBy test, BROWSE_ID_CHUNK === SELECTION_ID_CHUNK; R14's control is yours), your words test to retrieval's 49 keys (DEC-334), and stay under 4,000 lines. Then COMPLETE.

## B4 · CHANGE

K3872: (1) Done: retrieval's uses now gain retrieval-browse and drop civil-time and calc-grammar (build/modules.json on the tranche). (2) Keep bio-plane/src/retrieval/findin.mjs as a one-line re-export of retrieval-browse's findin (K3268: a split keeps the old module delegating; citation's recorded.test.mjs:7 re-points only when its own entry next touches it), so citation stays green. Merge the tranche branch, add the shim, rerun your tests, architecture and citation's recorded.test.mjs, then COMPLETE again. (3) The scope parameter is in T51-107's list; the 100-variable bound goes to query-language.

## B5 · START

Depth 2. Your entry: `build/plan/current.md` (T51), the re-run of layer 5 (R5), retrieval: **T51-203** (read the entry line whole, and the plan's Sequence and rule 11). Model: claude-haiku-5-5.
Your requirements: `build/requirements/retrieval.md` (read whole).
BOB's notes for this job:
1. Your words findings are in `build/plan/words-pass/retrieval.md` (read whole), in up to three sections: the conversion's left findings, "Plain findings (K3957)" and "Test copies of code sentences (K3962)". Fix every one by the words rule below; a string you judge no member ever reads (a diagnostic, wire grammar, an identifier) is not hidden: list it in a REPORT with why, and BOB settles it with the design stream (K3944). The ids you assign are `retrieval.<file stem>.<slug>`, fixed once. A table key or any string code compares is an identifier, never a `localize` sentence (K3971).
2. If your entry names red tests of yours (K3958: civil-time now answers an undetermined `why` as `{key, vars}`), they are accepted only until you merge: make them green against the keyed reasons, passing `{key, vars}` on where you relay a reason.
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes, or that hold a finding; run your other tests without reading them. Your set is under the 600 KB budget. A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
The words rule (K3930, K3943, K3949; setup-words R13, R14): a sentence people read is read through `word(key[, vars])` (a `words.json` row) or `localize('<module>.<area>.<name>', en[, vars])`, both arguments string literals at the call; the list always wins. setup-words R13 binds every sentence a member reads, whatever the check counts (under five words, punctuated, a refusal's `detail`, or held in a test's regular expression or substring check): convert those too, in this job (K3964, K3965, K3974). A test never holds a sentence's text (K3810): it asserts the key (`hasWord`) or compares with `word`/`localize` by equality; `localize` answers its `en` while `rows.mjs` is stale. A hand-list of another module's ops, codes or words is assembled from that module's own declaration (K3268). `rows.mjs` and `words-unreviewed.json` are setup-words' generated artifacts: never edit or regenerate them; BOB regenerates them at the layer close. A word id needs no test of its own (K874 binds R ids; K3965).
Tests never copy a sentence people read; every new requirement id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9). Merge `tranche/T51` into your branch, never rebase or reset (K1991).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Coverage on your own not-yet-met ids is expected until you meet them.
Your context window is the `max_tokens` of `context_usage` in `get_session` (your own session id): read it, never assume a size; "half your window" (mechanics §6 (1)) is half of that number (K3987).
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (pull it first; format and architecture 0 failures; the words check shows no finding in your module), `node bio-plane/src/setup-words/build.mjs --check` (read-only; a stale-rows note is expected, a refusal naming your module is not) and `node checks/ownership.mjs /home/user/bio retrieval tranche/T51 job/T51/retrieval`. Your Size line counts only your module's own code (K2513).

## B6 · CHANGE

K4002, on your J4: (1) The eight refusal details (index.mjs 296, 405, 1248, 1252, 1257, 1329/1348, 1350, 1471) and op=searchindexcheck's NO_FTS_ID detail (1073, an administrator reads it) are sentences a member or administrator can read wherever they travel (K3982; DEC-258 (3) governs what the shell draws, not who can read the detail): localize each, en byte-identical. (2) 'a registration names its module and its function' (293, 306, 318, 331, 367) is a start-up diagnostic no member reads: leave it; I send its full text to the design's unkeyed list with R5's batch and it is accepted by name until the list carries it. (3) The route-name pin against RETRIEVAL_ROUTE_OPS, the module's own list, is accepted (K3268). Re-run tests and checks (words: only the one registration sentence left), COMPLETE again.

## B7 · CHANGE

CHANGE (K4243): RETRIEVAL, depth 2 (BOB #235 is depth 1). Your branch is at the tranche's tip.
Entry: declare `list` (the bundle roster, R66) in your `DECLARED_OPS` in the round's shape (op-declarations R80, op-grades R49): classes, mutating and weight copied from its existing hand rows (`op-declarations` lists it read, admin/member/probe), its fields read from your arm whole (`type`, `state`, `after`, `limit`; the viewer is the control plane's stamp, not an accept). The `bias` screen will list a team's earlier offered sets with `list` `type: "bias"` (SCREENS-SETTINGS #10 J12; K4239 B19 (2)). Test with test-support's `declaredOpHolds` (only its requires; a field outside its accepts refused), naming the requirement id you write it under. No behaviour change. Requirement line for BOB in your COMPLETE.
Before tests: node_modules (K4113). Reading (K3678). Words (K3930). Model haiku, medium effort; workers haiku low.
