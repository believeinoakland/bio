# legistar-reader (T33)

**Status** · session_01Mr47bi897kmqem6V1yfAdg · depth 2 · WORKING · handled B0

## J1 · QUESTION

Two readings I am carrying on with; answer only if either is wrong.

1. R1 says a capture is "a JSON array of objects", but R16's 50 gold-event fixtures are `events/{id}` captures, which the API returns as ONE object. My reading: at an address ending `<endpoint>/<id>` a single object carrying that endpoint's id field is read as a one-row capture of that endpoint (`page: null`, no paging); a single object anywhere else does not match, with a reason.
2. R11's `nextPage(locator)` cannot tell 1,000 rows from fewer from the address alone. My reading: `nextPage(locator, page)` with `page` the parse's own `page` (absent: the address is advanced, as R11's first case); `parse` also gives `page.next`, the same answer. The rest of the query (`$filter`, `$top`) is kept byte for byte, `$skip` replaced or appended.
