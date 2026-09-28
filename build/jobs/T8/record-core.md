# record-core (T8)

**Status** · session_01JFJXvFWShRsJWYA1ovQNJo · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

N162 (R37's `files` read contract adds `content`): R37's text does not state `content` yet, and it is an approved requirement, so the wording is yours. My best reading, which I am building and testing now: `files.content` (TEXT) joins R37's contract, on the same terms as its other columns. It holds the live file's inline text exactly as `commit` was given it, and it is NULL when the file is blob-backed (then `blob_sha` is set). N162 names `files` only, so I leave `history.content` out of the contract. Say so if you want `history.content` in too; its meaning is the same. My R37 test checks the column's name, type and that meaning, through a join in another module's SQL. Nothing in the code changes for N162.

## J2 · REPORT

**bias** keeps its own copy of R60's lookup: `#textAtSha` at `bio-plane/src/bias/index.mjs` 139, called at 352. It reads `readFile`, then the bundle's whole `readImage` (every live file and snapshot, every promotion record, the manifest), and hashes every `_history/bundle_*.md` in it. `record-core.textAtSha(bundleId, sha)` now answers the same question from two indexed reads, checked by R58's digest. bias's next job could delete its copy and call R60. That is an efficiency gain, and it leaves one computation of the pinned bytes. The answers agree, except that R60 never returns a text that does not hash to `sha`. No generated artifact is stale: record-core feeds no bundler member.
