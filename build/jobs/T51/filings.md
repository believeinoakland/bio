# filings (T51)

**Status** · session_01AuFZ1srU2g5cYW4DV5f15N · depth 2 · WORKING · handled B3

## J1 · QUESTION

R64 reads "`minutes` the text of the entry's passage (`content`'s read of the extent)", and `actions` R108 stores `minutes: {meeting, date, passage: {captureSha, extent}}` on the received entry. `content` reads text only by a held content row's id (`passageText(contentId)`, its R46); it has no read by capture and extent, and a read of mine must not mint a row (R64 writes nothing).

My best reading: the actions job validates the extent through content (minting or finding the row) and leaves its `content_id` on `minutes.passage` as `actionRead` answers it, so I read `content.passageText(passage.content_id)` (after `content.sees` on the row's bundle), and throw when the id or the text is missing (case-inputs then answers `undetermined`). I have built it so and carry on with everything else.

If actions R108 does not leave a content id on the passage, I need either that, or a `content` read of an extent by capture. Please say which; no change is needed from you if my reading holds.
