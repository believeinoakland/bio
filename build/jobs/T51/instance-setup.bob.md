# BOB to instance-setup (T51)

**Read** · handled J7

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T51), layer 11 (L11), instance-setup: **T51-106** (read the entry line whole, and the plan's Sequence and rules 1, 10 and 11). Model: claude-sonnet-5-5.
Your requirements: `build/requirements/instance-setup.md` (read whole).
BOB's notes for this job:
1. Your words findings are what `node checks/words.mjs /home/user/bio instance-setup` lists after you merge `tranche/T51` (86 before L9's merges), with `build/plan/words-pass/instance-setup.md` if it exists (read whole; an item there the check no longer lists is already done). Fix every one by the words rule below; a string you judge no member ever reads (a diagnostic, wire grammar, an identifier) is not hidden: list it in a REPORT with why, and BOB settles it with the design stream (K3944); a copy of a row the design keeps on its unkeyed list is not counted (K4038). The ids you assign are `instance-setup.<file stem>.<slug>`, fixed once. A table key or any string code compares is an identifier, never a `localize` sentence (K3971). Cross-module test copies show only jointly: before COMPLETE also run the check over every L11 module together and fix any line naming your module (K3986).
2. Your entry carries more than words: read the entry line whole and apply every part of it; the requirement lines it names ("Text: fold") are on the tranche branch (K3861–K3869, K4040).
3. Reds you inherit (run at the tranche tip d8e14626bd, K4065): none; run your suite first after merging the tranche.
4. You merge in `modules.json` order with the plan's rule 1 (interface-assets and interface-shell before every screen; control-plane, then plane, then legacy-ui; installer-steps before installer; journey-check last).
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes, or that hold a finding; run your other tests without reading them. Your set is under the 600 KB budget. A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
The words rule (K3930, K3943, K3949; setup-words R13, R14): a sentence people read is read through `word(key[, vars])` (a `words.json` row) or `localize('<module>.<area>.<name>', en[, vars])`, both arguments string literals at the call; the list always wins. setup-words R13 binds every sentence a member reads, whatever the check counts (under five words, punctuated, a refusal's `detail`, or held in a test's regular expression or substring check): convert those too, in this job (K3964, K3965, K3974). A test never holds a sentence's text (K3810): it asserts the key (`hasWord`) or compares with `word`/`localize` by equality; `localize` answers its `en` while `rows.mjs` is stale. A hand-list of another module's ops, codes or words is assembled from that module's own declaration (K3268). `rows.mjs` and `words-unreviewed.json` are setup-words' generated artifacts: never edit or regenerate them; BOB regenerates them at the layer close. A word id needs no test of its own (K874 binds R ids; K3965).
Tests never copy a sentence people read; every new requirement id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9). Merge `tranche/T51` into your branch, never rebase or reset (K1991).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Coverage on your own not-yet-met ids is expected until you meet them.
Your context window is the `max_tokens` of `context_usage` in `get_session` (your own session id): read it, never assume a size; "half your window" (mechanics §6 (1)) is half of that number (K3987).
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (pull it first; format and architecture 0 failures; the words check shows no finding in your module), `node bio-plane/src/setup-words/build.mjs --check` (read-only; a stale-rows note is expected, a refusal naming your module is not) and `node checks/ownership.mjs /home/user/bio instance-setup tranche/T51 job/T51/instance-setup`. Your Size line counts only your module's own code (K2513).

## B2 · CHANGE

CHANGE (K4084): the design @ 709dbaec7a (DEC-360, DEC-361; U390, U391) is merged into tranche/T51 and rows.mjs regenerated: merge tranche/T51. Your rows, from the design's answer verbatim:

(3) livefire.mjs's 15 and setup.mjs:966/1012/1022 unkeyed; the 12 codemod rows minted as design rows `instance-setup.setup.<id>` with `{reason}` for `{String}` and `{next}` for `{v1}` (`{what}`, `{confirmed}` unchanged): the calls pass `reason:` and `next:`; the 23 other codemod ids no call names are the job's to drop from rows.mjs.

This re-opens your job (P10): the design minted the twelve codemod rows as `instance-setup.setup.<id>` with {reason} and {next}, so seven of your tests are red on the tranche now (WORD_VAR_MISSING, e.g. `instance-setup.setup.what_could_not_be_read needs {reason}`; accepted by name until you merge again): pass `reason:` and `next:` in those calls, drop the 23 codemod ids no call names, leave the unkeyed ones as the design lists them (words-reads-handoffs.json), and clear your 30 inline findings with the words rule. Then COMPLETE.

## B3 · START

Depth 2. Your entry: `build/plan/current.md` (T51), the completion round (§5.7 (0); P10 as amended, K3915): **CR-12 · instance-setup** (read the entry line whole). Model: claude-haiku-5-5.
Your requirements: `build/requirements/instance-setup.md` (read whole), R94 and R97 above all. Its three items:
BOB's notes for this job:
1. `credentials` R80 `lastActivity()` is merged on the tranche (K4116): `bootstrapfacts`' `last_used_at` reads it and your own `#lastActivity` (`bio-plane/src/setup.mjs`, near :2627) and its read of the `sessions` table go. Its answer is byte-identical to yours (`new Date(ms).toISOString()`, `null` when none or unreadable), so `last_used_at` does not change: test that it equals `credentials.lastActivity()`.
2. The leaf's twelve inline texts (`setup-fleet.mjs`:30, 32, 35–38, 42, 44, 55, 64, 66, 67) are read by key from rows the leaf's bundle carries (bundler R38's per-member rows; R97 keeps the leaf importing nothing, K405), so `checks/words.mjs` reads 0 for your module; their words are those `words.json` already holds for those keys, never new English. If a text has no row, REPORT it (BOB asks the design) rather than inventing one.
3. R94's eleven translation delegates and nine route lines go: `store-door` (T51-143) and `plane` (T51-125) call `translations` directly, both merged; confirm by search that no caller of a delegate remains before deleting it, and REPORT any that does.
4. The local walk (journey-check R1 (a)) runs once after this round and must find nothing (Bob, K4111): `setup` and the bootstrap facts are on it. Do not run the walk yourself; prove each change with your module's own tests.
Your layer has closed; this round runs as a layer (§5.3 to §5.6). Nothing found here waits for the next tranche (K3915): a flaw in your module is fixed in this job, one in another module is a REPORT.
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes; run your other tests without reading them. A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
Words (K3810, K3930): a test asserts the key or reads the text from the word table, never copies it. Every refusal a control. Report flaws in other modules to BOB (P9).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Never edit a generated artifact (manifest §14); report one you make stale.
Before any test run: every directory with a tracked `package-lock.json` has its `node_modules` (`for d in $(git ls-files '*package-lock.json' | xargs -n1 dirname); do [ -d $d/node_modules ] || (cd $d && npm ci --ignore-scripts --no-audit --no-fund); done`); a suite run without them fails for the container, not the code (K4113).
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (architecture and words must show 0 findings for your files) and `node checks/ownership.mjs /home/user/bio instance-setup tranche/T51 job/T51/instance-setup`. Your Size line counts only your module's own code (K2513).

## B4 · ANSWER · re J4

ANSWER (K4124) to J4, and CHANGE. Option C, BOB's (packaging and file ownership are BOB's; K405's reason, keeping the plane's store out of the installer's neutral bundle, is kept: `setup-words` pulls no store, and the installer already imports it). Your R98 is written on the tranche (merge it first): `setup-fleet.mjs` imports `setup-words`' `index.mjs` and nothing else, and gives each of the twelve texts as `word(key)` of R97's keys, so the leaf holds no sentence and the words check reads 0 for you; R97's "imports nothing", its byte-for-byte twin rule and its empty-import control are replaced by R98's test and control (the installer bundle holds no plane or store module). Check `installer` R34's reading still holds (the installer's last screen shows the same words, now through the leaf's `word`); if the installer's tests copy a leaf text, REPORT it.
J5 placed: plane's CR-24 (R67) re-points `ask.mjs`:369 to `translations` and sets `door.test.mjs`:142's count to 36, after you merge; then your R99 (the last delegate, `readingLanguage`, and `#translations()` go) comes to you by CHANGE. `door.test.mjs`:142 is accepted red by name until plane's CR-24 merges.
Post COMPLETE once R98 is met.

## B5 · CHANGE

CHANGE (K4142; your R99, K4124). plane's CR-24 is merged into `tranche/T51`: the ask reads `readingLanguage` from `translations`, so nothing calls your delegate any more.
1. Merge `origin/tranche/T51` into your branch.
2. Apply R99: `readingLanguage` and `#translations()` leave the module; no translation delegate remains. Test: the module exports no `readingLanguage` (naming R99); control: `translations`' `readingLanguage` still answers.
3. Run your module's tests (packages first, K4113), the checks (format, architecture, coverage, ownership, words 0 for the module), and post COMPLETE with your Size line. Do not run journey-check's walk (K4111).
