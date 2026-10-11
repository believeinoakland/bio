# extraction (T44)

**Status** · session_018BewFdRoHKTRNejfX4TPW9 · depth 2 · COMPLETE · handled B1

## Completion (T44-5)

**Entries applied** (N869, N876; DEC-191 (4), (5), DEC-192 (1), (2), (6); K2713, K2719):
- R71: when nothing was filled, `says` is read by key from the transcriber's own answer (`unfilledOutcome`; `tier4Extend` keeps only a sentence of it):
  - `AGENT_WORKER_UNBOUND`, `EVIDENCE_ABSENT`, `NO_PAGE_RENDERED` give `transcribe.notsent` with `transcribe.why.*`.
  - A `jpeg`/`png` page whose `refused` names `IMAGE_TOO_LARGE`, or `UNSUPPORTED_JPEG_PROCESS` with a "progressive" `process`, gives `transcribe.picture.unprepared` with `transcribe.picture.why.*`. Any other refusal, and no `refused`, give `norender`.
  - `AGENT_WORKER_SILENT` gives `transcribe.failed` with `transcribe.why.silent`.
  - agent-worker R74's ending (`ending: silent|refused`, spelled `MODEL_SILENT`/`MODEL_REFUSED`) gives `transcribe.failed` with `transcribe.why.ended`.
  - Refusals keep their envelope (K2713) and gain `says` `transcribe.refused`, `{reason}` the translation as relayed, placeholders kept: `aiRefusal`, the `keptAway` refusal, and an agent-worker refusal after the post that carries its row's translation.
  - `transcribe.none` is said only for `ok: true` filling nothing. No `says` when the AI path was never called.
  - Built against plane R36's stated `refused` with a stub transcriber, since T44-13 has not landed.
- R27: a reading of a `jpeg`/`png` capture (its written capture format, else its `text_container`) with its one page unread says `capture.picture.unread` by key.
- `TRANSCRIBE_WORDS` gained 12 keys, verbatim from `words.json`. The T43 test checks each key against the file.

**My own code and tests read whole** (P20, K2730): `extractrun.mjs` and every file under `src/extraction/` and `test/m/extraction/`. Flaws found and fixed:
- `pageTranscribe`'s header still said "a stored PDF reading" (pictures since T43).
- `NO_POST_REASONS`' comment still said "until the design stream names their words (B133)"; replaced by the keyed table.

No other flaw found.

**Superseded T43 assertions re-worded:**
- `t43.test.mjs`: the T43 no-post / `AGENT_WORKER_SILENT` → `transcribe.none` arms are now T44's, in `t44.test.mjs`.
- `pagetranscribe.test.mjs`: the keep-away relay now also carries `says`.

**Reading set** (mechanics §17, 998 KB): I read my own requirements, code and tests whole. One helper agent read the used modules' public parts in full and wrote me a cited digest:
- reading-pipeline R29/R30 and `tier4Extend`;
- plane R36 with its T44 clause, and `plane/transcribe.mjs`;
- agent-worker R72, R74 and their codes;
- credentials R57;
- run-rules R19;
- `words.json`.

I read `tier4Extend` (reading-pipeline `index.mjs`:696–789) and `plane/transcribe.mjs`:60–115 myself.

**Found in other modules** (REPORT J2):
1. None of agent-worker's R72 refusal codes has a check row to translate it: `BAD_BODY`, `BAD_SHA`, `BAD_PAGES`, `NO_ACCOUNT` (agent-worker's own; credentials' C-29.20 is another site's row), `BAD_ACCOUNT`, `TRANSCRIBE_NEEDS_API_KEY`. Per R71, each is answered 200 `performed: false` with no `says` and no sentence of mine.
2. plane `transcribe.mjs` reads only `res.json()`, so agent-worker's HTTP status is lost. A relayed worker refusal with a row would take R71's default 403.
3. plane R36's `refused` is not built yet (T44-13). Without it, a photo's `NO_PAGE_RENDERED` reads `transcribe.why.norender` until L11.

**Deferred, with why:** a transcriber whose `transcribe` throws gets no `says`. No key states it, it may or may not have posted, and plane's transcriber never throws.

**Tests and checks:**
- extraction `node --test bio-plane/test/m/extraction/`: 162 pass, 0 fail (was 157).
- reading-pipeline (its `m/` tests, d606, tier2-wire, pdf-worker-binding): 112 pass, 0 fail.
- content: 132 pass, 0 fail.
- case-carriage: 70 pass, 0 fail.
- plane `m/plane/` and migrate-released: 191 pass, 0 fail.
- `format`: 0 failures.
- `architecture extraction`: 0 failures.
- `coverage extraction`: 49 of 49, 0 failures.
- `ownership extraction tranche/T44`: 0 failures.

Size (session_018BewFdRoHKTRNejfX4TPW9): test runs 8, module lines 3229

## J1 · REPORT

Found in other modules (record § Completion): (1) none of agent-worker's R72 refusal codes has a check row to translate it (BAD_BODY, BAD_SHA, BAD_PAGES, NO_ACCOUNT [agent-worker's own; credentials' C-29.20 is another site's], BAD_ACCOUNT, TRANSCRIBE_NEEDS_API_KEY); per R71 each is answered 200 performed:false with no says. (2) plane transcribe.mjs reads only res.json(), so agent-worker's HTTP status is lost; a relayed worker refusal with a row would take R71's default 403. (3) plane R36's refused is not built yet (T44-13): until L11, a photo's NO_PAGE_RENDERED reads transcribe.why.norender.
