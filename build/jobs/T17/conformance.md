# conformance (T17)

**Status** · session_01RwskyQxg3ceF8pkWDxKg1f · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R21's `text` on a side with no content id. Contradiction's `candidatesFor` answers a claim or stance side (K2, K3, K5) with `text` = its claim and no content id; a leg or extent side (K1, K3's passage arm, K4) with a content id and `text: null`. R21 as worded (K569) says each side's `text` is `content.passageText` for its content id, `null` where it answers `null`.

My best reading, on which I am building: a side that names a content id carries `passageText(content_id)` as `text` (null where it answers null, including a stale row); a claim or stance side names no passage, so `passageText` is not asked and its `text` stays the claim's words as contradiction answers them (today's behaviour, which `fact()` passes through). Read literally, a claim or stance side would answer `text: null`, and R21's facts would then carry no words of the claim at all, since `fact()` does not copy `claim`.

If you want the literal reading (claim and stance sides `text: null`), say so and I change one line.
