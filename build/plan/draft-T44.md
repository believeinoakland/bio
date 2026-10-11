# Draft: T44 requirement text for N868, N869 (with N859) and N870 — adopted by BOB #154 (K2719)

Sources:
- DEC-191 and `ux-substrate/screens/words.json` on `claude/gallant-brown-zg0wc1` (PR #25); U153, U154; B133, B134.
- K2650, K2689, K2691, K2698, K2701, K2702, K2703, K2708, K2713, K2717.
- The PDF-PIXELS #4 record (J2, Completion).
- The requirements of ai-use, notice-producers, extraction, plane (R24, R36), pdf-pixels, image-codecs, capture, doorbell (R12), admission (R21).
- The code on the tranche tip: `ai-use/checks.mjs`, `extraction/index.mjs`:1620–1690, `plane/transcribe.mjs`, `pdf-worker/src/picturepixels.mjs`, `capture/index.mjs`:505–545, `admission/window.mjs`:82.

DEC-191's parts are numbered (1)–(5) and are cited that way below.

Next free ids: ai-use R14, notice-producers R18, extraction R74, plane R39, pdf-pixels R44, image-codecs R11, capture R88. One new id is used (image-codecs R11). Everything else is an amendment appended to an existing requirement.

## N868: image-codecs, pdf-pixels (larger photos)

**(a)**
- image-codecs: R1 amended; **R11** new.
- pdf-pixels: R42 amended.
- No other module changes. Plane R36's call, `renderPictureToPixels(bytes, 0, {maxEdge: TRANSCRIBE_PICTURE_EDGE, grey: true})`, stays as it is.

**(b)**
- image-codecs **R1**, append: (T44; N868; K2702) `decodeBaselineJpeg` converts colour row by row from the subsampled planes, as libjpeg's context rows do. It never holds a full-size upsampled chroma plane beside its output. Its output is unchanged, bit-exact with libjpeg (R6). Its live set at 4:2:0 is at most about 4.5 bytes per pixel (PDF-PIXELS #4 J2's figure), and the job measures and records it for 4:2:0, 4:2:2, 4:4:4 and grey. *(not yet met: T44)*
- image-codecs **R11** (T44; N868; K2701, K2702) `decodeBaselineJpegRows(d, {expectComps, colorTransform, onRows})` decodes the same JPEGs as R1, with the same refusals (`DctRefusal`, the same codes and details), one MCU row at a time, top to bottom. It never rotates. It hands each strip's finished 8-bit rows to `onRows(rows, y0, count)` in order. Joined together, those rows equal R1's output with `rotate: 0`, byte for byte, for every sampling R1 decodes. It holds no full-size plane: its live set is the input, one MCU row of coefficients and samples per component with the context rows, and the strip being handed over. The job states that bound and measures it. *(not yet met: T44)*
- pdf-pixels **R42**, append: (T44; N868; K2701, K2702) A JPEG is decoded while it is reduced. It is read through `image-codecs` R11. Each strip is turned grey when `grey` and summed into the boxes of the reduced picture, so the full-size frame is never held.
  - The boxes are those of R42's reduction of the oriented picture, with R43's orientation applied as the boxes are mapped, so partial edge boxes fall where Pillow's fall.
  - The answer is unchanged: pixel-exact against Pillow (`exif_transpose`, `convert("L")`, `reduce(k)` over the full decode).
  - `PICTURE_FRAME_MAX` applies to the reduced frame, `ceil(width/k) × ceil(height/k) × components`.
  - The header's full frame is judged against a new exported `PICTURE_SOURCE_MAX`. The job measures it under the plane object's 128 MB and its CPU time. It admits at least the 48 MP phone frames (8000 × 6000 and 8064 × 6048) in either orientation, in colour. A frame over it is refused `IMAGE_TOO_LARGE` before any decode, its detail naming `bound: PICTURE_SOURCE_MAX`.
  - A PNG is judged as now: its full frame against `PICTURE_FRAME_MAX`, decoded whole by `image-codecs` R10.

  *(not yet met: T44)*

**(c) Tests.**
- image-codecs `test/codecs/`:
  - R1's existing libjpeg-turbo hashes still pass, unchanged.
  - R11: the joined rows equal R1's `rotate: 0` output for each DCT fixture variant (grey, 4:4:4, 4:2:2, 4:2:0), and every R1 refusal is raised the same way (control: a baseline fixture decodes).
- pdf-pixels `pagepixels.test.mjs` (R42):
  - A 48 MP JPEG (8064 × 6048, Pillow-made fixture, its reference hash beside it) at orientations 1, 3, 6 and 8, grey and colour, is pixel-exact against Pillow 12.3.0.
  - The 4032 × 3024 Orientation-6 photo is still 1008 × 1344 grey, 155,814 B, with the same hash.
  - A header one sample over `PICTURE_SOURCE_MAX` is refused `IMAGE_TOO_LARGE` before decode (control: one under passes).
  - A PNG over `PICTURE_FRAME_MAX` is still refused (control: an equal-size JPEG passes).
- The peak RSS and time of the 48 MP decode go in the job's record (as T43's measurement table), not in a test.
- ocr-worker's bundle is staled by `pagepixels.mjs` (§14) and regenerated at L1's close, as in T43.

**(d) Doubts.**
1. **DCT scaling or strip-wise box reduction.** N868 offers both. DCT scaling (libjpeg's 1/2, 1/4, 1/8 IDCT) is faster and smaller, but its pixels are not Pillow's `reduce(k)` over a full decode. Choosing it would change R42's reference, which is what R42 promises (pixel-exact against that reference). *Best reading:* strip-wise box reduction, which keeps R42's output byte for byte. DCT scaling would be a later, separate change to R42's reference, **for BOB** if ever wanted.
2. **The source bound's value.** It is technical, the same kind of bound as K2701's. *Reading:* BOB's, measured by the job. The ruling records it, and Bob is told as done. 200 MP frames (16320 × 12240) stay refused `IMAGE_TOO_LARGE` unless the measure admits them, and their sentence is `transcribe.picture.why.toolarge` (N869).
3. **PNG is not reduced as it is decoded.** A phone's photo is JPEG, or HEIC, which is still not read (K2691). *Reading:* PNG keeps the frame bound. Streaming `decodePng` (its filters need only the previous row) is a later entry if a measure shows large PNG photos.
4. **Partial edge boxes under orientations 5–8.** The transpose changes which source edge holds the partial boxes. *Reading:* the job maps the boxes from the oriented frame back to the source. The 6 and 8 tests pin it.

**(e) Dependencies.**
- image-codecs (R1, R11) merges before pdf-pixels (R42), both in L1.
- T43-5's measurement is the input. It has merged (K2702).

**(f) Doable:** yes, from T44's L1.

## N869 (with N859): ai-use, notice-producers, extraction, plane (DEC-191)

**(a)**
- ai-use: R8 and R13 amended.
- notice-producers: R16 and R17 amended.
- extraction: R71 and R27 amended.
- plane: R36 amended.
- Not touched, with the reason:
  - plane R24: the screens registry names no words.
  - credentials: `USE_DEFAULTS` already has `enquire`, `read` and `account` on. Its `ai.refused.off` leaves `{Use}` for the screen (its `AI_WORDS` note), so DEC-191 (2)'s "on by default" is already met.
  - queue: it writes no sentence holding a day.

**(b)**
- ai-use **R8**, append: (T44; N859, N869; K2650; DEC-191 (1)) Its codes also include `EXPLORE_OUT_OF_SCOPE` (C-143.5, R6) and `EXPLORE_ASK_INVALID` (C-143.6, R9). Each has its row in `checks.mjs` and a test. `EXPLORE_OUT_OF_SCOPE` carries `whose` (`group`, `project` or `own`), as `AI_LIMIT_REACHED` does. *(not yet met: T44)*
- ai-use **R13**, append: (T44; N859, N869; DEC-191 (1), (2))
  - `EXPLORE_OUT_OF_SCOPE` is read as `ai.refused.exploreoutofscope`, with `{whose}` filled from `ai.whose.*`.
  - `EXPLORE_ASK_INVALID` is read as `ai.refused.exploreaskinvalid`.
  - Neither row keeps a sentence of its own.
  - `{use}` and `{Use}` read `ai.use.<use>.inline` and `ai.use.<use>.name` for all nine uses.
  - This replaces "The `ai.use.*` keys for `enquire`, `read` and `account`, uses with no AI path in T43, are not required, and not tested, until the design stream names them (B133)."
  - `ai.use.suggestions` names a switch, not a use, and this module does not read it.

  *(not yet met: T44)*
- notice-producers **R16**, append: (T44; N869; DEC-191 (3)) `{date}` is `date.daymonth`. `{day}` is the day of the month of the local day `reached_at` falls on (`civil-time`), written as a number with no leading zero, and `{month}` is from `date.month.*`. This replaces ", its month named from `date.month.*`, until the design stream names its format (B133)". *(not yet met: T44)*
- notice-producers **R17**, append: (T44; N869; DEC-191 (3)) Every `{date}` in a kind's `summary` or `detail` is filled as R16's `{date}` is, from the source's local day. Today that is `queue.step-later-found.detail`, `queue.step-date-due.detail` and `queue.milestone-overdue.detail`. *(not yet met: T44)*
- plane **R36**, append: (T44; N869; DEC-191 (4), (5))
  - `NO_PAGE_RENDERED` carries `refused`: one `{page, reason, process?}` for each asked page not sent.
  - `reason` is the renderer's refusal (`pdf-pixels` R39's key), and `process` the JPEG process when the renderer's detail names one.
  - A page whose PNG is over `TRANSCRIBE_IMAGE_MAX_BYTES` is `reason: "IMAGE_TOO_LARGE"`.
  - A renderer that throws is `reason: "DECODE_FAILED"`.
  - No other field changes, and nothing is posted.

  *(not yet met: T44)*
- extraction **R71**, append: (T44; N869; DEC-191 (4), (5); K2713) When nothing was filled, `says` is read by key as follows. In each case a key the file lacks fails the test.
  - **Nothing was sent.** The transcriber answered `AGENT_WORKER_UNBOUND`, `EVIDENCE_ABSENT` or `NO_PAGE_RENDERED`. The answer stays 200 `transcription: {performed: false, written: false, why}`. `says` is `transcribe.notsent`, with `{why}` from `transcribe.why.unbound`, `transcribe.why.evidenceabsent` or `transcribe.why.norender` respectively.
  - **A photographed page that could not be prepared.** R73's detected format is `jpeg` or `png`, and the answer is `NO_PAGE_RENDERED` with its `refused` naming `IMAGE_TOO_LARGE`, or `UNSUPPORTED_JPEG_PROCESS` with a `process` that is progressive. `says` is `transcribe.picture.unprepared`, with `{why}` from `transcribe.picture.why.toolarge` or `transcribe.picture.why.progressive`. Any other refusal of a picture's page is the first case, with `transcribe.why.norender`.
  - **A relayed refusal.** This is `tier4Extend`'s `aiRefusal` (N853a), or the transcriber's `keptAway` refusal. The refusal is answered as now (its code, check, translation and status, K2713; nothing written), and it also carries `says`: `transcribe.refused`, with `{reason}` the refusal's `translation` as relayed.
  - `transcribe.none` stays only for an AI path that posted to `agent-worker` and filled nothing (K2689).
  - With the AI path never called, there is no `says` (K2713).

  It replaces, in R71's T43 (N862) clause: "a reason that posted nothing (`AGENT_WORKER_UNBOUND`, `EVIDENCE_ABSENT`, `NO_PAGE_RENDERED`) is answered with `performed: false` and its reason until the design stream names its words (B133)". It amends, without replacing, the T43 (N853a) clause "A `tier4Extend` answer carrying `aiRefusal` is answered as that refusal (…)": only `says` is added. *(not yet met: T44)*
- extraction **R27**, append: (T44; N869; DEC-191 (5); K2713) For a reading whose capture format is `jpeg` or `png` with its one page unread (`unread_pages: [0]`), `unread_says` is `capture.picture.unread`, read by key, in place of `document.unread.pages`. The T43 clause's "For a PDF reading" reads as K2713 adopted it: any reading with pages. *(not yet met: T44)*

**(c) Keys, `en` verbatim from `words.json` (PR #25).**
- `ai.refused.exploreoutofscope`: "The assistant can't explore this question on {whose} account: it lies outside what the account's owners chose to explore."
- `ai.refused.exploreaskinvalid`: "Nothing was recorded: an ask to explore names the day and what is worth exploring that day." This equals the C-143.6 row's sentence today ("ai-use's sentence kept").
- `ai.use.enquire.name`: "Interviews and planning"; `ai.use.enquire.inline`: "interviews and planning"
- `ai.use.read.name`: "Reading inside documents"; `ai.use.read.inline`: "reading inside documents"
- `ai.use.account.name`: "A case's account"; `ai.use.account.inline`: "a case's account"
- `date.daymonth`: "{day} {month}"
- `transcribe.notsent`: "Nothing was sent to the assistant: {why}. The pages are as they were."
- `transcribe.why.unbound`: "the assistant can't be reached from your group's Civicsmith just now"
- `transcribe.why.evidenceabsent`: "the document's stored copy can't be read just now"
- `transcribe.why.norender`: "none of these pages could be turned into an image the assistant can read"
- `transcribe.refused`: "The assistant didn't read these pages: {reason}"
- `transcribe.picture.unprepared`: "This photo can't be prepared for the assistant: {why}. Take it again as an ordinary photo, or type its words yourself."
- `transcribe.picture.why.progressive`: "it is saved in a form the assistant can't open (a progressive JPEG)"
- `transcribe.picture.why.toolarge`: "it is too large"
- `capture.picture.unread`: "A photographed page, not read yet: its words can't be found or cited until the assistant reads it or a member types them."

**Tests.**
- ai-use:
  - `AI_USE_WORDS` equals `words.json` for every key above that it reads, plus the existing ones.
  - C-143.5 and C-143.6 rows read by key, each `where` naming its site.
  - `EXPLORE_OUT_OF_SCOPE` filled for `group`, `project` and `own` (control: an in-scope question passes).
  - R13 over all nine uses' `.name` and `.inline`.
- notice-producers:
  - `reached_at` on 7 October local reads "7 October".
  - An instant that is the 6th in local time but the 7th in UTC reads "6 October" (control).
  - Each of R17's three details is filled the same way.
- plane: R36 `refused` for a progressive JPEG, an oversized frame, and a PDF page refused `NOT_IMAGE_ONLY` (control: a rendered page posts, with no `refused`).
- extraction `pageTranscribe`, with a stub transcriber:
  - each no-post reason gives its `transcribe.notsent` sentence;
  - a picture `refused` gives each `transcribe.picture.why.*`, and a picture `DECODE_FAILED` gives `norender`;
  - `NO_ACCOUNT` relayed carries `ok: false` and `says` `transcribe.refused`;
  - control: posted and none filled gives `transcribe.none`;
  - R27: a picture with no reading text gives `capture.picture.unread`, and a PDF gives `document.unread.pages`.
- Row census: C-143.5 and C-143.6 translations re-worded with no record, stamped at T44's promotion.

**(d) Doubts.**
1. **Does `transcribe.refused` change the relayed refusal's envelope? For BOB.** next.md says DEC-191 *replaces* T43's "relayed-refusal answers". K2713 rules that a relayed refusal takes its row's status, never 200. DEC-191 gives only a sentence. *Best reading:* the envelope stays (K2713) and only `says` is added. Answering it as 200 `performed: false` would reverse a recorded ruling.
2. **`{reason}` may hold the refusal's own unfilled placeholders.** credentials leaves `{Use}`, `{whose}`, `{who}`, `{member}`, `{date}` and `{reason}` for the screen (`AI_USE_SWITCHED_OFF`, `PROJECT_AI_KEPT_AWAY`). *Best reading:* fill `{reason}` with the translation exactly as relayed, its placeholders left for the screen with the refusal's fields beside it, as credentials' rule says. The capital letter after the colon is the design stream's to judge, and a NOTICE notes both.
3. **Which refusals are "a refusal came back".** *Best reading:* the account and limit refusals tier 4 relays (`aiRefusal`) and the transcriber's `keptAway` refusal, never R71's own C-51 refusals. An `agent-worker` refusal or silence after posting (`AGENT_WORKER_SILENT`, a provider ending) still gets `transcribe.none`, which reads "The assistant read pages …", wrongly. Ask the design stream for a key, and meanwhile keep `transcribe.none` (K2689).
4. **"Progressive" in `process`.** R1 names `progressive-huffman`, `progressive-arithmetic` and the differential progressive processes. *Best reading:* any process whose name contains "progressive" gets `transcribe.picture.why.progressive`. Other unsupported processes (lossless, arithmetic sequential, 12-bit, CMYK samples) get `transcribe.why.norender`.
5. **`capture.picture.unread`'s reader. For BOB (the module, not the meaning).** DEC-191's owed line names `capture`. But capture knows nothing of readings: whether a page is unread is extraction's fact (R27, `unread_pages`). *Best reading:* extraction R27 reads the key, and the `capture.` prefix is the screen's grouping. If BOB wants capture's upload answer to say it too, that is a new capture line with no reading behind it.
6. **Other `{date}` fills outside N869's modules.** `ai.refused.projectkeptaway` (credentials leaves it for the screen) and `photo.withdraw.refused.already` hold `{date}`. DEC-191 (3) makes `date.daymonth` the one format, so these are the screen's or their modules'. notice-producers R13's DEC-145 (5) sentence ("captured on <date>") is not keyed. *Best reading:* not in N869. A later wording entry folds R13's `<date>` into `date.daymonth` when the design stream keys that sentence.
7. **`date.daymonth` has no year.** A step date a year away would read without one. This is word detail for the design stream, and not blocking.
8. **`ai.when.month` ("on {month} 1") orders month before day, against `date.daymonth`.** It is a keyed sentence read verbatim, so nothing changes here. Noted to the design stream.
9. **R73's "a detected format with no `structure`" has no key.** It still answers `why` alone, with no `says`. It is not in DEC-191.
10. **DEC-191's owed line also names credentials and queue.** Read as nothing owed: see (a).

**(e) Dependencies.**
- DEC-191 on `main`: PR #25 merges at T43's close (K945, K2703).
- T43-11 (ai-use) and T43-13 (notice-producers) merged.
- T43-10 (extraction, merged K2717) and T43-15 (plane R36's picture path) merged.
- In T44, extraction (L4) merges before plane (L11). Extraction reads `refused` when present, and when it is absent reads `transcribe.why.norender`, so the order holds without a held arm.

**(f) Doable:** yes, once T43 closes with PR #25 merged.

## N870: capture (its last held doorbell copy)

**(a)**
- capture: Status, R87 amended.
- doorbell R12 is unchanged and becomes the one fingerprint.
- admission R21 and its Uses are wording only (see (d)).

**(b)**
- capture **Status**, last sentence: "… the copy deleted in T43 (T43-8; N849; K625, K2607), its held `sourceFingerprint` in T44 (N870; K2708)."
- capture **R87**, append: (T44; N870; K2708) This module answers no source fingerprint. It creates, declares and reads no table of `doorbell`'s, `knock_key` included. The key and the digest are `doorbell` R12's alone. *(not yet met: T44)*
- The code to delete (`capture/index.mjs`):
  - the "HELD COPY" block, `#knockKey` and `sourceFingerprint` (:508–542);
  - the header's sentence on the held piece (:21–23);
  - any import (`te`, `hexOf`) left unused by the deletion.

**(c) Tests.**
- A new capture `t44.test.mjs`:
  - `captureOf(ctx).sourceFingerprint` is undefined;
  - a fresh storage after capture's `migrate` holds no `knock_key` (control: `doorbellOf(ctx)` creates it).
- No capture test calls `sourceFingerprint` today (checked).
- admission's `window.test.mjs`:29, 71, 92 and `t38.test.mjs`:27, 61, 69 call `w.capture.sourceFingerprint`. T43-21 must re-point them to doorbell. If it has not, they go red at this delete.

**(d) Doubts.**
1. **admission's text still names `capture` R56** (R21 twice, Uses: "`capture` (T35): the keyed fingerprint of its R56"). T43-21's entry changes code and the edge, not that text. *Best reading:* a wording fix to "`doorbell` R12", with no change in meaning. BOB makes it at T44's opening if T43-21 has not. The `modules.json` edge admission → capture is dropped then too, if admission uses nothing else of capture.
2. Whether the admission tests above were re-pointed by T43-21. The job checks at START: `grep -rn sourceFingerprint bio-plane/src bio-plane/test` outside `doorbell` finds nothing.

**(e) Dependencies.**
- T43-21 (admission, L11) merged: `window.mjs`:82 reads `doorbellOf(ctx).sourceFingerprint`, and its tests are re-pointed.
- In T44, capture's L3 job.

**(f) Doable:** yes, once T43-21 has merged (K2708).
