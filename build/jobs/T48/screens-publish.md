# screens-publish (T48)

**Status** · session_01SX1xX1uwfBATDKqW7WH95V · depth 2 · WORKING · handled B3

## J1 · QUESTION

R18 needs the group's time zone and no read names it for review-copy. Best reading: review-copy also reads `publishpreflight` for the chosen draft (already in my Uses), takes `publish_at.zone` from it (case-authoring R75; the ceremony does the same), and computes the end of the chosen day in that zone in the browser (Intl) as a stamp-form instant. With `publish_at` null or `zone: null` (PUBLISH_AT_NO_ZONE) the screen refuses to share, with a new word of mine (`screen.review-copy.until.nozone`: "Set the group's time zone first, then share."), because a bare UTC end of day would silently end the link at the wrong hour. If you want a different source (a zone on `groupidentity`, UTC, the browser's zone), say which; I carry on with this reading.
Also, a note on R19: "Download the complete edition" through `publishedcase` with `cs.download`: `cs.download` saves only a non-JSON answer. If `publishedcase` answers JSON, nothing is saved and the screen draws the answer's refusal words or a "could not be downloaded" word of mine. I build it as written and will report what the test fixture shows.

## J2 · QUESTION

This replaces J1 (same questions, one more, and my best reading of each).
1. Zone for R18. No read names the group's time zone for review-copy. Best reading: when the member presses "Share with a named reader", the screen calls `publishpreflight` for the draft (already in my Uses), takes `publish_at.zone` (case-authoring R75, as the ceremony does), and computes the end of the chosen day in that zone in the browser as a stamp-form UTC instant. With no zone (`PUBLISH_AT_NO_ZONE`) it refuses with a new word of mine (`screen.review-copy.until.nozone`), because a bare UTC end of day would end the link at the wrong hour. The rows read the same preflight to show the chosen day in that zone.
2. The outside reader's date. `cs.date` draws an instant's UTC day. For a group west of Greenwich the end of 20 October is already 21 October in UTC, so `review-outside` (no session, no zone) would show the day after the one the member chose. Best reading: `review`'s copy answer for the recipient carries the group's zone beside `grant.until` (a plane change, `review`'s, not mine); until then `review-outside` draws the UTC day and I note the off-by-one in my record. If you prefer, tell me to draw the date and time with "UTC" named.
3. "Download the complete edition" through `publishedcase`. `cs.download` hands the browser a file only for a non-JSON answer; `publishedcase` answers JSON, so nothing would be saved. Best reading: build as written (so it draws the answer's refusal words, or "could not be downloaded") and you correct me if the intended bytes are the case file, `publishedbytes` with `sha256=<manifest_sha>&format=zip` (public-read R5, R23), which `cs.download` does save. I would then use that.
