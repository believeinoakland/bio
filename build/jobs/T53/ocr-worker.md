# ocr-worker (T53)

**Status** · session_018BhceeL6Gsvfy3WXU2DyNM · depth 2 · WAITING: 9 of ocr-worker's 11 English-in-test sites assert localize keys absent from words.json (limit.ocr.frame_bytes, ocr-worker.member.this_member_transcribes_one_page, ocr-worker.member.unanchored_region_s_the_engine, ocr-worker.member.unrated_region_s_came_back; all unreviewed in words-unreviewed.json), so the words check's missingkey refuses them; the 11th (tessengine.mjs:61) is a plain string with no key. Reading: keep the English until the UX stream adds these rows to words.json; alternatively you say which keys to add. Test file reverted to HEAD, no change made.
**Sessions** · 1
