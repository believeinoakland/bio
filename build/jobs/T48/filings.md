# filings (T48)

**Status** · session_01QBnLDeNuXjJHKeLdZE7tem · depth 2 · WAITING ON BOB (J1) · handled B2

## J1 · REPORT

Entries T48-51 are built and pushed on `job/T48/filings` (commit after 34e45b9354); one part waits on `filing-templates`.

Built and tested (module suite 113 tests green, run against a local, uncommitted stub of filing-templates R33 written from its text, reverted before commit):
- R58: a Tier 2 filing answers `offers: ["counsel_packet"]` beside `advisory`; Tier 1 and communications answer none.
- R59: `filingRead` and `op=filingread` (a read): the stored draft or communication with text, blanks and sources, unfilled with why, the member's fills (labelled), template, advisory, offers, notices, label, action, approval, second approval and sending. Nothing re-filled, nothing written; absent, unseen action and unseen project all answer `NO_SUCH_FILING` alike.
- N1053: `NOT_A_PARTNER`'s words as `words.json` has them ("organization"); verified against words.json by key.
- R57 code: preparation adds `RFC_QUOTING_SENTENCE`, R6 asks `rfcQuotingRefusal(text, {filing})` and returns its refusal unchanged; the sentence, `KEYED["rfc.quoting"]`, C-115.47's row and its `FILINGS_WORDS` entry are gone from this module.

WAITING ON YOU: R57 imports `RFC_QUOTING_SENTENCE` and `rfcQuotingRefusal` from `filing-templates`, which has not merged them. Until it does, my branch's `filings` fails to link. Send a CHANGE when filing-templates is merged; I merge `tranche/T48`, rerun the module suite against the real provider, run the checks and COMPLETE.

For BOB, outside my module:
1. Adding `op=filingread` (R59) turns two tests red that belong to later jobs: `plane/split.test.mjs` ("layer 9's op maps hold exactly its 41 writes...") and `op-declarations/t45.test.mjs` ("filings: filingread has no spec"). Both pass on the tranche before my commit. They go green when op-declarations (its R67) and plane declare `filingread`.
2. `answer-envelope/families.test.mjs` fails with or without my change (playwright-core not installed here); not mine.
3. `answer-envelope/families.mjs` reads `FILINGS_CHECKS`; C-115.47 now lives in `filing-templates`' table (its R33), so the family listing needs it from there.
4. `setup-words` carries its own copies of `rfc.quoting` ("Your reply may be quoted, unless you say otherwise in it.") and `refusal.RFC_QUOTING_MISSING`, which differ from the sentence in `filing-templates` R33 (and its NOT_A_PARTNER copy needs checking against DEC-221's spelling). Not mine.
Checks so far: format 0 failures, architecture 0, coverage 58 of 58 ids, ownership 0.
