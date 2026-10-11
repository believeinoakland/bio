# standards (T45)

**Status** · session_01Jg3rgoArLauFTLhqRQc2MS · depth 2 · WORKING · handled B1

## J1 · QUESTION

Readings of R52/R53 I built on (all within standards; tell me if any is wrong and I will change it):
1. R53 also applies to a commitment held `cited` whose `cited_by` is of the group's own sending (R53 says "every text row"; I read `cited_by` as the cited commitment's one row, parallel to R52's own two cases). Refused `COMMITMENT_OWN_LETTER`.
2. A commitment whose rows are all either members' authored observations or the group's own sending, with at least one of the latter, is refused `COMMITMENT_OWN_LETTER` (R52's "at least one text row from another capture" is what lets it land); all authored stays `COMMITMENT_AS_HEARD`. The refusal names `content_ids`, and for OWN_LETTER also `own_sending` and `as_heard`.
3. R52/R53 are asked last in R1's order (after R47's question), before anything is written; R10 reaches them through R1.
4. "An extent of a member's authored observation" is read as: the content row's `capture_sha` has a `register` row with `authored` = 1 (provenance R48 contract), any extent or chain over that capture.
5. The check is per host instance (as membership R125/R128), `standardsOf(host).registerOwnSendingCheck("actions", fn)`; a promise, a throw or any non-boolean answer reads true for that capture; asked once per distinct capture, only for a `commitment` held text or cited.
New rows C-112.63 `COMMITMENT_AS_HEARD`, C-112.64 `COMMITMENT_OWN_LETTER` (awaiting promotion's stamp, T46).

## J2 · COMPLETE

**Entries applied.** T45-7 (Actions D7; v0.2 §3 Standard), on my J1 readings:
- R52: R1 and R10 refuse `COMMITMENT_AS_HEARD` (C-112.63, naming `content_ids`) a `commitment` held `text` whose every text row is of a capture with `register.authored` = 1 (provenance R28/R48), or held `cited` whose `cited_by` is. One row from another capture lands. A proposal of such a commitment is stored and labelled as before; its adoption is refused.
- R53: `registerOwnSendingCheck(module, fn)` is one slot per instance, through `membership.listenerRefusal` (R125's form). `COMMITMENT_OWN_LETTER` (C-112.64) is answered when every row is of the group's own sending or authored, with at least one own sending. A throw, a promise or a non-boolean answer reads true (fail closed). With none registered, only R52's authored test applies.
- Code: `index.mjs` (`#commitmentRefusal`, `#authoredCapture`, `#ownSendingCapture`, `registerOwnSendingCheck`; header note), `checks.mjs` (two rows). No new file outside `paths`; no new op; no new edge (provenance via its `register` read contract, membership's `listenerRefusal`).

**R29 "the move to layer 5"** is green after merging `tranche/T45` at my start (T45-2's `MODULE_ORDER`).

**Read.** I read my requirements (whole), my code (`index.mjs`, `checks.mjs`, `schema.mjs`, `instrument.mjs`, `words.mjs`) and every test file under `bio-plane/test/m/standards/` whole (P20). I found no flaw needing a change. I also read the plan entry, draft-lower §2, K2780/K2781/K2787 and provenance R28/R48 and membership R81/R125/R128 directly.
- The other used modules' public parts were read whole by a helper session, which wrote me a digest citing each section (mechanics §17 (3)).
- I did not read `BIO_Action_v0_2.md` §3 myself beyond what the requirement and draft quote.

**Deferred.** None.

**Found in other modules.**
- For `actions` (T45-27): register `standardsOf(host).registerOwnSendingCheck("actions", ({captureSha}) => boolean)` at start. `plane` (T45-47) composes it.
- For `promotion` (T46): stamp C-112.63 and C-112.64; the row census is red for them until then (rule 4 (2)).
- `bio-plane/dist` bundle stale, as every merge makes it (rule 4 (5)).

**Tests and checks.**
- `node --test bio-plane/test/m/standards/*.test.mjs`: tests 85, pass 85, fail 0. New file `t45.test.mjs`: 7 tests naming R52 and R53, each refusal with a control.
- Users of the changed act: action-clocks 55/0, affordances 226/0, duties 49/0, conformance 89/0, law-relations 26/0. Filings 69 pass, 1 fail, the inherited "R9 the six sections" (rule 4 (7), until T45-31).
- format: 0 failures. architecture: 0 failures. coverage: 44 of 44, 0 failures. ownership: 0 failures.

Size (session_01Jg3rgoArLauFTLhqRQc2MS): test runs 9, module lines 3434
