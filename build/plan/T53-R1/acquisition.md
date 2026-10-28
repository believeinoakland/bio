# T53 R1 · acquisition · rows

## plan-T53-draft.md

**acquisition**, **capture**
- T53 · K5513 (C22) · acquisition R36: a daemon fetches on the team's key only for the daily check of a court case a member follows, stopping at the last unfollow; else `NOT_PERMITTED` (credentials R29 unchanged: the words are R36's) · `planning/lines-K5513-daily-follow.md`
- T53 · N1266, N1267 · held-and-named filed whole with an owed reading (RF10), refused not filed (RF11), the refusal before any read (CC6) · `files/REQ-format-registry-beta.md` RF10-RF11
- T53 · DEC-455 · capture: an op reading a preview's next rows from `next_row` (`previewmore`, name BOB's) · DEC-455
- T53 · N824 (K2425, K5504-K5506, K5527 (1), (2)) · provenance's `email` origin, `emailCapture` with her statement, `fileMember` for a message's attachments and a ZIP's entries, discarded knocks cleared; new module **mail-door** after doorbell (K5530) (published copy per K5534) · `planning/plan-T53-capabilities.md` §A Layer 3
- T53 · N1259 (K4403, K5498, K5503, K5513) · `streamRegister`, `probeRegister`, the docket read for a followed case (R36, `planning/lines-K5513-daily-follow.md`), segments as captures · `planning/plan-T53-capabilities.md` §A Layer 3 (officers: registers R46, K5532; jurisdictions R130, R133 and guardrail R73 in `planning/lines-K5532-officers-guardrail-listing.md`)
**English in tests** (K5565) · every module with sites carries one conversion entry for its own, done in this tranche; 58 modules gain a job by it alone · `planning/plan-T53-tests-english.md`

## plan-T53-capabilities.md

**acquisition** (N1259-a R125-R133, c's R134, N1269 R135, N824 R136; no collision, BOB numbers in plan order; replaces the plan's Layer 3 `[owed: N1259 registers ...]` for these)
- T53 · N1259 (K4403 (2), (5), (7); K1485, K1492; K5498, K5513) · `streamRegister` stores only the reduced copy, in segments, input bounded by its own ceiling, resumable slices; `probeRegister` (size and change without a body); `sourceChanged`; the docket poll on the alarm for a followed case only (the same words as acquisition R36), the stated call limits counted in a durable ledger; fetch only from the definition's hosts; one capture per segment, `existed` on a repeat; segments' `origin` kind `named_request` (C-18.1 admits no new kind), capture grade stays R18's rule · N1259-a R125-R133 `[R126 waits: M-R7]`
- T53 · PLANNING (K5513) · acquisition R36 (`planning/lines-K5513-daily-follow.md`) uses N1259-c R41's purpose names (`docket-entries`, `standing`); with the key off `keyedFetch` answers `KEYED_SERVICE_OFF` and the follow falls back to re-reading the public page (c R41) · R36 and N1259-c R41 `[owed: a line filing a keyed answer as a capture attributed to the follow]`
- T53 · N1259 (K5498, K5513; G7) · keyed services off by default, key in no answer, daily alarm read for a followed case only · N1259-d R134 (test) (acquisition R137, `N1259-a2-additions.md`, C31, K5532)
- T53 · N1269 (K5446) · `limitsByKind` quoting `READ_BOUNDS` through `boundOf`; reads KIND-TABLE's plain names and limits (format-registry) so there is one source; `how_long` derived from the budget classes (PL1), not cited from `HELD_AT_CHECK_MAX` · N1269-N1272 R135
- T53 · N824 (C9 (2), CC5, ML4) · `fileMember`: job kind `member` serves a ZIP's entries and a message's attachments; amends R38; N824's receipt builder for `email-attachment` here (or provenance), writing the message receipt and the document of capture R117's rows; test (f) (R136) moved to store-assembly R102 · N824-container-member-job R136 `first: settle problem 1` (the builder placement above)

## plan-T53-journeys.md

### Layer 11 modules named by the register that have no draft line of their own
- **people, hypotheses, filings, action-clocks, action-holds, action-replies, action-plans, plan-work, reading-guides, agent-steps, progressions, retrieval, reading-pipeline, credentials, ai-accounts, acquisition, attestation, instance-setup, setup-words, stewards**: named as co-owners in the register; the drafts write the line in the screen module and, only where the table above shows "(owner half)", in the owner module. The job for each reads the screen-module line's "owner" clause.

## plan-T53-tests-english.md

**The entry, the same for every module below** · T53 · K5565 · convert the module's English-in-test sites to the word key and its values: each assertion reads the key the product reads (and its placeholders' values), never a copied sentence; a B site (the text only in the module's own source) first gets its key in the module (a words row, UX-DESIGN's wording where it is shown to a member); a C site (in neither) is test input or a dead assertion: kept as input data, or removed with its reason; and every test the job touches for its other entries is converted with it (the words check refuses English in a new or changed test) · `tests-sweep/CENSUS.md`, `tests-sweep/CENSUS-RX.md` (the module's rows) · Test: the words check's baseline loses the module's files, and the module's suite is green.
**Literal sites** (CENSUS) are A / B files (A: already a `words.json` value; B: inline only). **Regex sites** (CENSUS-RX) are A / B / C sites (files). Counts are before TESTS-SWEEP's certain conversions, which remove 31 A literals and 34 A regexes. "only this · <model>": the job's model (BOB #324, K3518): `haiku-5-5` where the work is test-only, `sonnet-5-5` where a B site needs the module to give a key first (a source change). The module had no other T53 entry, so K5565 gives it a job in R1 (62 such modules before this file; four of them have carried entries the count missed, marked here without the note).
| layer | module | literal A / B files | regex A / B / C sites (files) | |
|---|---|---|---|---|
| 3 | acquisition | 0 / 0 | 9 / 18 / 28 (16) |  |

## build/rulings.md

- K5574 · 2026-10-27 · capture-requests, capture, acquisition (Bob's; requirement and UX) · Bob, 2026-10-27: "the UX should support a mechanism by which a challenge page or a CAPTCHA protection gets sent to the member to be involved in so that the capture can proceed." Recorded as his requirement. BOB's details (P17): (1) a challenge or CAPTCHA answer (Cloudflare's `cf-mitigated: challenge`, a challenge or CAPTCHA page in place of the document) is recognised at the fetch and is never filed as the document: the capture is refused with its own reason and counted per host; (2) bot protection is still never worked around (K3656): a member's pass is never carried to Civicsmith's server; the document comes from her browser; (3) how the member takes over (in-Civicsmith hand-off and adding the file, or a browser extension) is Bob's, asked as B4 on QUESTIONS.html; the entries are T53 entries (capture-requests, capture, acquisition, queue-producers, screens-intake), the hand-off's lines written once B4 is answered · P17, P19; K3656, BOB-3 (DEC-47)

## K5629: layer-1 findings folded (BOB #327)

- T53-526 · format-registry's finding (T53-42, R38, R39) · "known" is not `format !== "undetermined"`. Detail: detection now answers `text` (valid text), `unlisted` (held and named, or `named: null`) and `refused`, and the new kinds (`eml`, `json`, `ndjson`, `xml`, `svg`, `ics`, ...). `index.mjs:1813` and `:2148` read any answer but `undetermined` as a detected format; each is re-stated: `refused` is not filed (RF11), `unlisted` is held and named (RF10; T53-98), `text` is a text capture. Four tests change with it (the R101 controls and R17's R10 test) and read the answer's `format` by the kind, never by the one word. Before the change they passed; they fail after merge, so this entry waits on nothing.
- T53-527 · runtime-limits, `archive.uploaded_bytes` · CAPTURE_MAX is 500 MB. Detail: `acquire.test.mjs:308-309` and `:358-362` (R10: "CAPTURE_MAX ... is 256 MiB", maxBytes 256 * 1024 * 1024) pin the alpha figure; `CAPTURE_MAX` is `boundOf("archive", "uploaded_bytes")` (index.mjs:376, R114). Both tests read `boundOf("archive", "uploaded_bytes")` and the statement's figure, never a number; compare T53-510's rule for the readers' tests.
