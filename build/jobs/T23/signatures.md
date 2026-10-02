# signatures (T23)

**Status** · session_01DPXkTEEtaiwXbkr5PTZn6f · depth 2 · WORKING · handled B2

## J1 · QUESTION

R38: "throws when `noticeId` is not an opaque id". No module states the opaque-id grammar as a pattern (record-grammar R1 states only BUNDLE_ID_RE; record-core R6 states the minter's output `<prefix>-<year>-DDDD<tail>`), and network-notices' prefix for a notice id is not named. signatures uses nothing, so it cannot import one.

My best reading, which I am building on: an opaque id is record-core R6's shape, `<PREFIX>-<4 digits>-<4 digits>` with an optional `-<slug>` tail (the tails in use today: none, or `-<slug>` as TASK and PROJ mint), PREFIX upper-case letters; that is `^[A-Z]+-\d{4}-\d{4}(?:-[a-z0-9]+(?:-[a-z0-9]+)*)?$`. Any prefix is accepted, so network-notices picks its own (e.g. `NOTE`). Anything else (spaces, a newline, lower-case prefix, wrong digit counts, a non-string) throws. If you or network-notices fix a prefix, or forbid the tail, say so and I narrow the check.
