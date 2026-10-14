# extraction (T48)

**Status** · session_01DR3F2gmacwTzgiJBKny2vq · depth 2 · COMPLETE · handled B2

## J1 · COMPLETE

T48-18 complete on `job/T48/extraction` (tranche/T48 merged at B2, K3239; code commits 864c4d95cb, then the test commit after it).

**Reading (mechanics §17; K2032).** I read my requirements whole and my code whole: `index.mjs`, `checks.mjs`, `drift.mjs`, `filemembership.mjs`, `ops.mjs`, `schema.mjs` and `extractrun.mjs` (P20). The rest of the set was over the limit. Two helpers in this session read it whole and wrote me digests that cite each section:
- every file under `test/m/extraction/` (26 files, 352,755 bytes);
- the public parts of all 17 used modules, plus `ai-accounts`;
- layer 4's contract (its `layers.md` row and the T25 split sentence; `layers.md` has no separate layer 4 section; the helper read lines 1–60 and searched the rest);
- my plan entry and rule 5.

The sources stay binding. I read in full every test I edited. I read reading-pipeline's merged `tier4Extend` whole after the merge.

**Entries applied (T48-18).**
- The comment at `index.mjs`:1593, at the keep-away relay in `pageTranscribe`, now cites `ai-accounts.aiKeptAway`, its R7 as R22 and R34 amend it. It cited `credentials` R57.
- The transcriber stubs now hand `accounts: {accountFor}` instead of `credentials: {accountFor}`, in `pagetranscribe`:39, `t43`:23, `t44`:55 and `t46`:28. The "no account was read" checks (`pagetranscribe`:129, :169) now watch `accounts`.
- New `t48.test.mjs`:
  - **R72 R71:** a transcriber whose `accounts` refuses `NO_ACCOUNT` gets that refusal relayed as given (403; code, check, translation and detail; `says` is `transcribe.refused`). Nothing is sent or written, and `accounts` was asked for the act `transcribe`. Control: when `accounts` answers an account, pages [1, 2] are filled and written, and the AI is handed that same account.
  - **R72:** through T48, a transcription that hands only `credentials` is still read, its refusal and its account alike.
  - **R72:** when a transcription hands both, `accounts` is the service used and `credentials` is never asked. A control proves `accounts`' refusal wins over a `credentials` that would serve.
  - **R71:** this confirms the T48 wording. Each keep-away refusal in `ai-accounts`' shape is relayed as given before any byte is read or account asked: R7's `AI_KEPT_AWAY` (C-29.31), R22's `PROJECT_AI_KEPT_AWAY` (C-29.38), and R34's fail-closed `AI_KEPT_AWAY` with `keep_away`'s three fields null. Control: `null` transcribes. `ai-accounts` is in no `uses` of this module, so its answers are stood in for in its shape and never imported.
- **Negative check:** I stripped `accounts` from what `pageTranscribe` hands `tier4Extend`. The three `accounts` tests went red and the `credentials`-alias test stayed green, then I reverted.
- **No code change** beyond the comment: R72 needed none, because `pageTranscribe` hands the transcriber's answer to `tier4Extend` as given.

**Flaw fixed in this job (P8).** `pagetranscribe`:198 asserted `/page 3 the AI did not transcribe|did not transcribe/`, and its second branch made the first meaningless. It now asserts reading-pipeline's sentence, "page 3 the AI did not transcribe, and it stays unread".

**Deferred:** none. The digest's other notes are weaknesses, not failures; I record them for a later job of this module, and none is in T48-18's scope:
- some 4xx ranges accepted where exact statuses could be pinned (`t43`:114, `t44`:152);
- key-leak checks only in `pagetranscribe`;
- a `deployable` stub that is always true (`t43`:20).

**Found in other modules:** none. I made no generated artifact stale beyond rule 5 (5) and added no check row.

**Tests and checks run.**
- `node --test bio-plane/test/m/extraction/`: 172 pass, 0 fail (168 at START).
- `checks/format`: 0 failures.
- `checks/architecture extraction`: 0 failures.
- `checks/coverage extraction`: 51 of 51 live ids named, 0 failures.
- `checks/ownership extraction tranche/T48`: 7 files, 0 failures.
- `checks/run.mjs` over the product:
  - architecture: 3,277 product files, 0 failures;
  - format and channels: 0 failures;
  - coverage: 46 failures, none of them extraction's (other modules' T48 ids, rule 5 (1)).

Size (session_01DR3F2gmacwTzgiJBKny2vq): test runs 4, module lines 3277
