# local-facts (T51)

**Status** · session_012PieGczCfTTKCXgZH64nqx · depth 2 · WORKING · handled B3

## Completion (T51-158)

**Entries applied**
- R18: `ruleFields({section, viewer})` (`LocalFacts.ruleFields`, `rules.mjs` `RULE_FIELDS` frozen data, op `rulefields` in `localFactsOps`), fields in `jurisdictions`' order with `effective_from` last; choices from `jurisdictions`' own exported vocabularies (`UNITS`, `COUNTS`, `DIRECTIONS`, `STARTS`, `OWED_BY`, `LEGAL_FACT_TRIGGERS`) and the active view's `action_kinds` ids. Unknown or absent section: R17's one builder.
- R18 (DEC-341, K3938): `effective_from` required on a member-drafted rule (a real `YYYY-MM-DD`; else `RULE_ENTRY_INVALID` with an error at `<section>[0].effective_from`, no new code); kept on the rule's entry; `governingView` does not apply a confirmed rule until that local day in the view's zone, and does not carry the field into the view.
- R19: each `groupRules` row also answers `applies_to`, `tier` (R11's read, one `combine` per read) and `source`.
- Words (K3949): the 5 findings and the K3962 one fixed; checks.mjs's three RULE_* rows read `refusal.*` keys by `word` (`{errors}` left for the screen); tests compare with `word`; two `why` strings in `governingPath` now `localize`.

**My readings (BOB may overrule)**
1. `ruleFields` to a viewer naming no member answers `fields: []` (as `groupRules` answers none).
2. A deadline's `applies_to` choices are `claim` followed by the view's kind ids (`jurisdictions` accepts `claim`; omitting it forbids drafting claim rules). A legal fact's `applies_to` carries `many: true` (it is a list). `many` is an extra key beside the spec's `{field, required, kind, choices?}`.
3. Fields left out because no `kind` can draw them: deadline `starter`, `extension`, `tolling`, `observed`, `closures`, `computation`, `applies_on`, `roll`, `consequence`, `defends`; legal fact `threshold`. `starts` offers the seven starts the design draws, without `third_party` (BOB's B2, K3997).
4. `effective_from` is stripped from the entry when `governingView` applies a rule; `groupRules` and `ruleOffer` keep it (the entry as drafted).

**Found in other modules (caused by this change; theirs to fix, not touched)**
- `duties` R5 test "over the real local-facts" (`response.test.mjs`:346): its draft lacks `effective_from`.
- `affordances` `t45-backing.test.mjs`:153, :156 (R19): same; and its "op maps of filing-templates and local-facts hold exactly their ops" test lists the old ops (now also `rulefields`).
- `plane` `compose.test.mjs`:84 (R11, R5): the op list now also has `rulefields`; `op-declarations` T51-107 declares it.
- Baseline reds that are not mine and unchanged: duties 4, affordances 2, progressions 3, action-clocks 8, filings 2.
- Refusal `detail` strings in `index.mjs`/`rules.mjs` (e.g. "the act is one of confirm, correct, dispute.") are English diagnostics beside the keyed `translation`; `checks/words.mjs` finds none. Listed for BOB to settle with the design stream (K3944).

**Deferred**: none.

**B2 (CHANGE, K3997)**: `starts` choices are the seven (no `third_party`); tested in `t51.test.mjs`; readings 1, 2, 4 accepted.

**Tests and checks** (from `/home/user/bio` and the process repository):
- `node --test bio-plane/test/m/local-facts/`: 71 pass, 0 fail (new: `t51.test.mjs`, 8 tests naming R18, R19).
- `checks/run.mjs`: format 0 failures, architecture 0 failures; words: no finding in local-facts; coverage local-facts: 19 of 19 live ids named by a test.
- `setup-words/build.mjs --check`: stale-rows note only (`local-facts.rules.effective_from_is_a_day` and `local-facts.index.the_year_is_undetermined`, `local-facts.index.lines_is_not_reachable` are new `localize` ids awaiting BOB's regeneration).
- `checks/ownership.mjs`: 0 failures.

Size (session_01ST4CngevnjWcyxth5PJjXe): test runs 14, module lines 1449

## J1 · COMPLETE

T51-158 done on job/T51/local-facts: R18 ruleFields (+op rulefields) with effective_from, R19 rows (applies_to, tier, source), words findings fixed (words check clean for local-facts). Module tests 71 pass, coverage 19/19, format/architecture/ownership 0 failures. Record: build/jobs/T51/local-facts.md. Needs you: (1) four reds I caused in other modules' tests, not touched: duties R5 response.test.mjs:346 and affordances t45-backing.test.mjs:153,156 draft without effective_from; affordances op-map test and plane compose.test.mjs:84 list the ops without rulefields (T51-107 declares it). (2) readings in my record: starts offers third_party but starter has no drawable kind (deferred); claim added to a deadline's applies_to choices; extra many:true key; refusal detail strings are diagnostics for you to settle with the design (K3944). (3) setup-words rows stale for 3 new localize ids; regenerate at layer close.

## J2 · COMPLETE · re B2

B2 applied: ruleFields starts choices are the seven (no third_party), tested; deferral dropped from the record. Module tests 71 pass, coverage 19/19, format/architecture/ownership 0 failures, words clean for local-facts.

## J3 · COMPLETE · re B3

RW (words, K4015): done. `checks/words.mjs /home/user/bio local-facts` reads 0 failures (was 1 inline).

**Entries applied**
- The one finding, `rules.mjs` (the refusal `MACHINE_CANNOT_DRAFT_RULE`'s detail): the inline sentence is replaced by `word("refusal.MACHINE_CANNOT_DRAFT_RULE")`, the list's row already for it. Members now read the row's text: "Only a member drafts or withdraws your team's own rule. The assistant may draft one for you to read, but it enters only when you draft it yourself. Nothing was written." Please confirm at the regeneration (list wins, K3930).

**Other changes in this module (P8)**
- `index.mjs` governingPath: an undetermined `part_of` line's reason was a lines `{key, vars}` object, so a member read "[object Object]" in the sentence. It now goes through lines' `reasonText`, which lines exports for this.
- Tests: the sentence regexes in `governing`, `due`, `status`, `rows`, `rules` (K3964, K3965, K3974) now compare with `word(key, vars)` by equality. Two R6 governing tests, red at the start of this job on the changed rows, pass. `t46`'s `/\{errors\}/` is a placeholder check, not sentence text, and stays.

**Not reported:** no string judged unread by a member; nothing deferred.

**Tests and checks** (from `/home/user/bio`, process repository at `e8ac153`, which contains d424c32):
- `node --test bio-plane/test/m/local-facts/*.test.mjs`: 71 pass, 0 fail (before: 69 pass, 2 fail).
- `checks/run.mjs /home/user/bio`: format 0 failures, architecture 0 failures. Coverage, words and the rest report failures in other modules only (coverage 22, words 1629 across the tranche; none name local-facts).
- `checks/words.mjs /home/user/bio local-facts`: 0 failures.
- `checks/coverage.mjs /home/user/bio local-facts`: 19 of 19 live ids named.
- `bio-plane/src/setup-words/build.mjs --check`: rows and unreviewed list match words.json and the source.
- `checks/ownership.mjs /home/user/bio local-facts tranche/T51 job/T51/local-facts`: 0 failures.

Size (session_012PieGczCfTTKCXgZH64nqx): test runs 10, module lines 1450
