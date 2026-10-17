# standards (T50)

**Status** · session_01RDKpqZKsU8QiADDq4eKKT1 · depth 2 · WORKING · handled B1

## Completion (STANDARDS #15)

**Entry applied:** T50-41 (N1085, N1132, N1108's standards part, N1177; K3630). R58, R59, R60 met; every other requirement still met.
- **R58.** Each `proposalsFor` item carries `project` (the project asked; control: other projects' and project-less proposals are not listed, so none answers null).
- **R59.** `words.mjs` holds only keys: every sentence R45 names is read through `setup-words`' `word(key, vars)` by DEC-253's keys (force, criteria, access, held cited/absent with `standard.held.cited.by` and `standard.held.absent.searched`, binding with `standard.binding.body.none`, policy owner, not public with `standard.notpublic.releaseby`, withheld text, the read's note, `standard.inforce.known` with its source by `standard.source.capture`). `checks.mjs`' `REFUSAL_WORDS` reads its two keys through `word` too (N1132: the "words.json holds none of my words" check is now by key; `test/m/standards/words.mjs` is `setup-words`, no copy of `words.json`). No English for these sentences remains in the module; tests assert `hasWord` on each key and `says` equal `word(key, vars)`.
- **R60.** `standardDeclare` and `standardAdopt` run as one transaction; a found `{capture_sha, extent}` that `content` holds no row for is minted by the declaring member (`content.mint`, `mintedBy` the author, so `member_marked`) in a bundle holding the capture that the viewer may see (`provenance.homeOf`, else another bundle of the capture's `register` rows). A refusal after the mint takes it back (tested: a period refused after the mint leaves `content` unchanged). `STANDARD_TEXT_UNRESOLVED` stays for a capture not held, one the author cannot see, and an extent `content` refuses.

**Readings I built on (no answer needed unless wrong):**
1. R59's list has no copy sentence in `says` today; "a copy's state `label.standardcopy.<copy>`" is read as `says.copy`, on any read of a standard whose copy column is set. R59 gives no word for "cited by" or "searched" beside the held word, so those are new fields beside the existing ones: `says.cited_by_words`, `says.searched_words`, and for not public `says.release_by_words` (given only when an owner is named). Existing fields (`cited_by`, `searched`, `release_by`, `public`) are unchanged.
2. `standard.source.capture.whole` is read only as the fallback when an extent cannot be described (`describeExtent` always describes), so no interface test reaches it; its key is asserted by `hasWord`.
3. `standard.discretion.holder.none` likewise only when a holder's label is empty (a discretion's holder is a registered entity with a label), so also asserted by `hasWord` only.
4. The text withheld, the note and "known in force" now read the design's English (e.g. "Known to be in force through …", "team"), not the module's former English: that is R59's intent.

**Found in other modules (REPORT):**
- `conformance` `test/m/conformance/t36.test.mjs:55` asserts `/known in force through 2026-03-02/` on `standards.inForceAt(...).why`; the sentence is now `standard.inforce.known`'s ("Known to be in force through …"). It is the one new red downstream (28 vs 27 in the 27 other-module files that are red at the base). Fix by key (`word("standard.inforce.known", {...})`) at conformance's job.
- `docs/development/ux-substrate/screens/words-reads.json` (the design stream's) lists 54 `standards` reads; it lacks keys this module now reads: `label.standardforce.{requires,recommends,allows,mandatory}`, `label.standardcriteria.stated`, `label.standardcopy.*` (8), `standard.binding.body.none`, `standard.held.cited.by`, `standard.held.absent.searched`, `standard.notpublic.releaseby`, `standard.policy.owner`, `standard.source.capture`, `.whole`, `standard.text.withheld`. Not mine to edit.
- Reds in other modules' words-pin checks (plan rule 5 (10)) are unchanged by this job.

**Deferred:** none. I found no flaw in my own module needing a fix beyond the above.

**Tests and checks:**
- `node --test bio-plane/test/m/standards/`: 104 pass, 0 fail (new `t50.test.mjs`, 9 tests naming R58, R59, R60; the three t46 reds (the "none of my words" check) are green; t35/t36/t37/t46/t48/read tests re-read by key, R47's page-2 extent now mints so its unresolved control uses an extent `content` refuses).
- Users of `standards` (progressions, duties, retrieval, calculations, inquiry-grammar, leg-earning, inquiry, capture-requests, answers, reevaluation, publication, conformance, action-records, actions, action-clocks, filings, action-plans, following, affordances, notice-producers, op-declarations, answer-envelope, control-plane, plane, screens-investigate): 3,105 tests, 3,075 pass, 28 fail; run on the base commit the same files fail 27, all accepted reds of plan rule 5; the one added is the conformance line above.
- `format` 0 failures; `architecture standards` 0 failures; `coverage standards` 51 of 51 live ids named, 0 failures; `ownership standards tranche/T50` 0 failures; `checks/run.mjs`: architecture 0 failures, coverage reds are other modules' not-yet-met ids, none standards'.

Size (session_01RDKpqZKsU8QiADDq4eKKT1): test runs 9, module lines 3637
