# screens-publish (T48)

**Status** · session_01SX1xX1uwfBATDKqW7WH95V · depth 2 · WORKING · handled B0

## J1 · QUESTION

R18 needs the group's time zone and no read names it for review-copy. Best reading: review-copy also reads `publishpreflight` for the chosen draft (already in my Uses), takes `publish_at.zone` from it (case-authoring R75; the ceremony does the same), and computes the end of the chosen day in that zone in the browser (Intl) as a stamp-form instant. With `publish_at` null or `zone: null` (PUBLISH_AT_NO_ZONE) the screen refuses to share, with a new word of mine (`screen.review-copy.until.nozone`: "Set the group's time zone first, then share."), because a bare UTC end of day would silently end the link at the wrong hour. If you want a different source (a zone on `groupidentity`, UTC, the browser's zone), say which; I carry on with this reading.
Also, a note on R19: "Download the complete edition" through `publishedcase` with `cs.download`: `cs.download` saves only a non-JSON answer. If `publishedcase` answers JSON, nothing is saved and the screen draws the answer's refusal words or a "could not be downloaded" word of mine. I build it as written and will report what the test fixture shows.
