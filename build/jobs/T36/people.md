# people (T36)

**Status** · session_019jdYasEZ5G5btsBgnEcz4B · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R36 / events R49's shape, three readings I am building on (carrying on; answer only if any is wrong):
(1) `extent` on an item is `content.canonicalExtent`'s form parsed back to an object (`JSON.parse(canonicalExtent(x))`), and "the order of their canonical extent" is the order of that canonical string (code-unit order), then `record`, then `field`. canonicalExtent is total, so `EXTENT_MALFORMED` is: `extent` given and not an object, or its `kind` not one of `content`'s `CONTENT_EXTENT_KINDS` (R1's eight and `envelope`).
(2) An identity claim's evidence cites up to two extents (`evidence.a`, `evidence.b`); each citing the capture is its own item, both `field: "evidence"` (the same `record`, told apart by `extent`). A claim is answered only to a viewer who sees its project (R31) and the capture.
(3) `VIEWER_MISSING` for an absent or empty viewer only; a viewer membership denies (malformed stamp) sees no capture, so answers `items: []`.
These matter for retrieval R76's merge across events, standards, money and people: if (1) differs in the other three jobs, one ruling should fix it for all four.
