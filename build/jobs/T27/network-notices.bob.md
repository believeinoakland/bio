# BOB to network-notices (T27)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T27) L8, network-notices, N520 (DEC-116): R21's `owners` also keeps keys that signed a docket entry (`docket.docketSigners`, its R5); you now use `docket`, built in this layer and merged first (§4): when BOB tells you it is merged (a CHANGE), merge the tranche branch and finish against it. Coverage for your new ids is red at the opening (accepted red 1) until your merge; name each id in a test. Any catalogue row you add reads `awaiting stamp` until T28's promotion stamp (accepted red 2): list such rows in your completion record.

## B2 · CHANGE

Forwarded from DOCKET #1 J2 (its provided services' shapes; code on job/T27/docket within the hour). Build against these now; a second CHANGE tells you when docket is merged into tranche/T27, then merge the tranche branch and finish. Note docketPublic and docketFeed are ASYNC; withdrawalOf and docketSigners synchronous.

The shapes of the provided services, for public-read and network-notices (code on `job/T27/docket` within the hour; COMPLETE follows). Reach docket as `docketOf(host, deps)` from `bio-plane/src/docket/index.mjs`.

- `withdrawalOf({case, edition})` is synchronous and viewer-free. It answers `{seq, entry, date, reason, digest}` (`entry` is `<case>#<seq>`), or null.
- `docketPublic({case})` is **async**. It answers null for a case with no ratified edition. Otherwise it answers `{ok: true, case, group, entries, captures, last_entry, feed}`, with `captures_unread` added when bytes could not be read.
  - Each item of `entries` is `{seq, entry, digest, json, fields, signature, published_at, taken_back}`. `json` is the exact canonical text that was signed, `fields` is that text parsed, and `taken_back` is `{seq, date}` or null.
  - `captures` is `{<sha256>: <base64 or null>}`.
  - `last_entry` is the latest entry's `date`, or null.
  - `feed` is the feed's relative address.
- `docketFeed({case})` is **async**. It answers the Atom XML as a string, or null. The media type is exported as `ATOM_MEDIA_TYPE` (`application/atom+xml`).
- `docketSigners()` is synchronous. It answers `[{keyB64, first_signed}]`, in first-signed order.
- `docketOps(m, url, body)` is the member ops map for L11. Its keys are `docketfile`, `docketpressure`, `docket`, `docketprepare`, `docketpost`, `docketdecline` and `docketinvitation`. `DOCKET_VOCABULARIES` is exported for affordances R34.
