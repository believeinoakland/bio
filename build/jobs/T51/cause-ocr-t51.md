# cause-ocr-t51 (T51)

**Status** · session_01Nph3bGm4XXYqa6u57T8hMS · depth 2 · WORKING · handled B2

## J1 · QUESTION

QUESTION (C18, two requirement lines the cause needs and that are not written; I carry on with the best reading below and will revert on your answer).

FOUND. R44 and R24 are already built and pass (266 ocr-worker tests, 0 fail), and the walk's hard photo is still read badly. I made the photo's twin (a full page, 231 words, 935 px wide = 110 dpi, 2.4 degree tilt, perspective, blur, noise, JPEG), measured through the real renderer and the real engine, words read in the page's own words:
 - R42 plain (no prepare): 0 percent (the engine boxes ONE passage: the walk's "first 60 words, the rest silent").
 - R44 as written (lines enlarged to 40 px): 38 percent. All 16 lines are found; the characters are poor because small blurred print enlarged 3.6 times stays blurred.
 - lines enlarged to 20 px instead: 52 percent (18 px 52, 24 px 49, 32 px 43, 40 px 38). Controls unchanged: the three existing photographs 99-100 percent at 20 px as at 40.
 - Tried and rejected, measured worse: binarising (31 percent), sharpening (34-40), deconvolution (38-44), heavier grain smoothing (42), no smoothing (15). Perspective is not the loss (91 percent with it, blur held); BLUR is: the same page at blur 0.6 reads 90 percent, at 0.8 84 percent, at 1.0 52 percent, and a smaller 800 px page at blur 1.3 reads under 10 percent. The information is gone from those pixels; no preparation brings it back, and the engine model is pinned by R19.

QUESTION 1 (pdf-pixels R44 (c)): change `PREPARE_LINE_PX` from 40 to 20 (R44's constants test [10, 0.1, 40, 4] becomes [10, 0.1, 20, 4], and its scale test "enlarged to 40 px" becomes 20 px). My floor on the hard page is then 45 percent (52 measured), the 90 percent floor of the three earlier photographs standing. Best reading: yes, it is the only preparation change that moved the hard photo.

QUESTION 2 (ocr-worker, the cause's "a picture the engine cannot read says so rather than returning a short text"): the engine's own line confidences tell the readable from the unreadable closely (share of words in lines rated 0.7 or more, against the true share read: 0.38 v 0.40, 0.01 v 0.10, 0.88 v 0.90, 1.00 v 1.00). Best reading, for a picture capture only (a PDF page unchanged): the answer carries `legibility: {words, confident_words, share}` (words of the regions, those in lines rated 0.7 or more, their ratio; basis the engine's, R17), the member says so in a `notes` sentence when the share is under 0.8, and a picture whose share is under 0.2 is refused `PICTURE_NOT_LEGIBLE` (200, ok:false, with the legibility figures) rather than answered with the junk text. This is also what screens C21 (FR-28) needs to say "N of M words read". Words keys I would add (en written once with localize, in ocr-worker's own source; rows by setup-words' build): ocr-worker.member.the_picture_is_only_partly_legible (the note) and ocr-worker.contract.the_picture_is_too_unclear_to_read (the refusal). The sentences are the module's refusal and note text like its existing ones, not a drawn screen's; tell me if the design stream must write them first.
