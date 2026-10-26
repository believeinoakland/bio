# K4426 review of fix-round-6-T51.md against walk-T51-rewalk5 A.md and B.md

Fields: (1) cause with evidence; (2) why tests missed it, gap fixed; (3) failing-first test on the walker's exact case; (4) live-shape check where behaviour depends on the platform. "Unmet" means missing or only promised after the deploy. A-10 = A.md line 10.

## 1. Table: every row not FIXED

| Walker row | Plan placement | Unmet | Why |
|---|---|---|---|
| A-10 E1 10.3 MB PDF, never read | 2a "dead alarm", no cause id; G1 is only the cron | 1,2,3,4 | "Explained by" with no diagnosis file or reproduction. G1 proves there is no cron, not why the in-object alarm never ran a row due at once (attempts 0). The scheduler's cause is SCHEDULER #39's and outside this plan. No test on the walker's upload. Even with a tick, reading a 10 MB PDF in the object is unproven (G26 is empty). |
| A-11 E1 23.2 MB PDF | 2a | 1,2,3,4 | Same as A-10. |
| A-12 E1 12 MB text: "op=reading found:false, no ledger row" | G5, G13 | 1 | G5 calls found:false "not a defect" (never promoted) from code reading, not reproduced. The deferral, the test and the L read are present. |
| A-13 E1 old 0125/0127, "Read it" not repaired | G8 (and G6 for the part digest) | 3,4 | The repair row rides the same tick. The plan's own caveat is that a 23 MB PDF in the object killed 0111 eight times, so the repair may still end `final`. No test of that read at the real memory limit. P only at the re-walk. |
| A-14 E2/E10 0111 second capture 24.7 s, "existed:true" yet download 23.1 s | G2 | 1,3 | G2's cause is the first-capture body loop. Nothing explains why a held file is downloaded again on the second press. The "answers at once" test has no stated mechanism. |
| A-14 / A-20 E7 0111 reading never follows; row NO_HOME since 05:57 | 2a, then G26 ("named by the diagnosis") | 1,2,3,4 | G26 is a placeholder with no cause, no test and no platform check. The 2a line is "read, or stated after three interruptions", which is a check after the deploy. |
| A-15 E2/E10 15.3 MB 504 | G2 | none (clean) | Cause certain, tests and L run named. |
| A-17 E3 40 MB upload: 24.2 s; "Nothing here"; "Check again soon"; keep and reading rows owed though final | G6, G7 (words); time in G12 "what stays above 2 s (3)"; rows in 2a | 1,2,3,4 (time and rows) | Upload time is explained away ("bytes cannot be fetched in the background"), no job, 15 s bar unmet. Rows still owed after a final statement: 2a "rows end", no cause. The 40 MB `keep` memory watch is G26, empty. |
| A-18 E3 41.5 MB (old 0115): not stated by the capture; statement stored against the part, no size | G6, G7 | 1,3 | The walker saw `found:false` after both captures and no row. The plan shows the answer carries a reading, not that it is stored under the whole. 0115 already holds a final written against the part by the press. No repair entry (R-OLD), only "P: 0115 page at the re-walk". |
| A-21, A-22 E6 two 60-page scans, never read; "worse than rewalk4, inline first 24 pages gone" | 2a | 1,2,3,4 | The regression (the inline first pass is gone) is never examined. Whether a scan read by the tick fits the object (OCR, two-pass 24-page continuation) is untested. |
| A-23 E6 "Read it" returns 200, page stays Unread; ocr=1 gives 409 REEXTRACT_NOT_READ on the unread scan | 2a (nothing follows); 409 not placed | 1,3 | The 409 for a never-read scan is a screen/op mismatch left unaddressed. |
| A-24 E8 sagu: no second "as a visitor saw it" document; `subresources` owed | G3 for the 23.1 s; the second document in 2a | 1,3,4 | G3's tick "files the second document" is a seam test of the code, but why none was made on the walker's page is "dead alarm" with no reproduction. |
| A-25 E8 dena NEW 502 at 12.7 s; second document missing | G4, G27 | 1,2,3,4 | G4's cause is "unknown". The fix (`reading_pending` + `diag`) masks the symptom. G27's diagnosis does not exist. The test uses a scripted renderer, not the walker's page. |
| A-27 E12 `casedrafts` x5, `queue` x2, first sign-in load 49 requests | G12c (casedrafts) | 1,2,3,4 for `queue` x2 and the sign-in double load | `queue` x2 and the double-read first load are not placed ("heldcaptures x3 as ruled" is not a placement for `queue`). |
| A-28 E13 Held(project) 5.7-6.3 s; heldcaptures with project 300-400 ms/row | G12a | 1,3,4 | Cause labelled "circumstantial, read from outside". The plan dismisses the walker's per-row filter cost as "the walker's own big uploads" with no measurement. Expected times are "diagnosis estimates, not yet measured". |
| A-29 E10 Project 7.3 s (390), 5.6 s, Home/Queue 3.7-4.8 s | G12b/c, G12 "what stays above 2 s" | 1,3,4 | Expected 2.3-3 s unmeasured. The 2 s bar is conceded unmet for most screens; levers (a) and (b) are "not planned". |
| B-10 E1 23 MB: never read; "Read it" returns READING_PENDING and only moves next_try | 2a | 1,2,3,4 | Same as A-10. |
| B-11 E1 upload 16.2 s | Only G12 "(3) uploads" (explained away) | 1,3,4 | No job, no cause beyond "the browser sends the bytes". |
| B-13 E4 DOCUMENT_COPY_PENDING 20+ min on a 356-byte file | G9 (cause), G10 (`{document}`), alarm leg to #39 | 4 | G9's own text says "Not established: that the live worker binds the bucket and the evidence store", yet field 4 is "N". `copyNow` could fail on the real platform. |
| B-15 E4 evidence rows: `citations.rows` holds only the finding, no sha ("NOT PROVEN, BOB to judge") | Not placed | 1,2,3,4 | The plan never mentions this row. |
| B-17 E4 "time zone ()" and the key dialog said before pressed | G11 (zone); dialog line to later-ux (section 5) | 1,3 (dialog) | The zone fix is complete (step 0 about a time-zone door is open, but flagged). The dialog sentence is only a words line, no cause, no test. |
| B-19 E14 mixed plain and raw event words | Section 5 later-ux | 1,2,3 | A drawn control with wrong words, parked without a cause or test. |
| B-20 C59 Money: SOURCE raw fingerprint, "a adopted", bare "Nothing here"; Money 10.8 s | Section 5 last line: "already lines of round 5's section 5" | 1,2,3,4 | Not checked in this plan. Money speed is only G12's unmeasured "~1.8-2.5 s". |
| B-21 speed: 19-53 reads per screen; front page failed to draw in 20 s and 30 s | G12 | 1,3 (and the front page not placed) | "Front page HTML 0.6-9.3 s, failed to draw in 20 s once and 30 s once" appears nowhere in the plan. |
| B-22 acts over 2 s; web capture 7.4 s with `in-acquire` 1.8 s | G12 "what stays above 2 s (2)" | 1,3 | Explained as "2-5 sequential object calls", unmeasured. 5.6 s outside the object is unexplained. |
| B-23 C69 new item absent; old duplicates; "was read as." | 2a "one producer cycle after the deploy" | 1,3,4 | The walker's "likely the same cause as the ledger" is adopted as is. The duplicates and the missing grade are not researched. |
| B-24 C41 not exercised | "Carried with a dated check" | 3,4 | A check after the deploy; the plan does not say how it will be provoked. |
| B-25 C66 "Show the routes" changes nothing | Section 5 words line (cause named) | 3 | Treated as words; the extra `heldcaptures` re-read is a code path with no test. |
| B-26 C4/C89/C90 not exercised | Carried with a dated check | 1,3,4 | No method stated for touching only the walker's own project. |
| B-28 E9 not walked, "waits on Bob" | Re-walk list only | 1,3,4 | A check after the deploy, with no diagnosis. |
| A-37 (count line) re-captured held page shows the address as title | Section 5 later-ux | 1,2,3 | No cause, no test. |

Rows with any unmet field: **30 of 31** (A 17 rows, B 14; only A-15 is fully met). A-14 is listed twice (two findings) and counted once.

## 2. Rows explained away without a researched cause

- Section 2a: A-10, A-11, A-21, A-22, B-10 (never read), E7/0111, sagu/dena `subresources`, the 40 MB owed rows, C69, and the alarm leg of `DOCUMENT_COPY_PENDING`. "Explained by the dead alarm" and "check after the deploy" are what K4597 (1) forbids without a diagnosis file.
- G26 and G27 are named, not researched; no diagnosis file exists.
- G12 "what stays above 2 s" explains A-17 time, A-29, B-11, B-21, B-22 by assertion.
- G12a "circumstantial", G4 "unknown"; G9 field 4 "N" contradicts its own binding caveat.

## 3. Rows not placed at all

1. B-15 E4 evidence rows with no sha in `citations.rows`.
2. B-21 front page failing to draw in 20 s and 30 s.
3. A-27 `queue` x2 and the 49-request first sign-in load.
4. A-23 409 REEXTRACT_NOT_READ on an unread scan (the screen/op mismatch).
5. A-14 why a held 15.9 MB file is downloaded again on the second capture.
6. A-21 the regression "inline first 24 pages gone".
7. A-18 repair of 0115's statement stored against the part (no R-OLD entry).
