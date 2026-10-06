# reading-pipeline (T34)

**Status** · session_0142QJow5hdFsVyMZKTNrq98 · depth 2 · WORKING · handled B2

## J1 · QUESTION

T34-66 (N615): where `read` takes the origin from. My best reading, which I am building now: the acquire document `read` is handed records no bytes-origin (acquisition hands `profileOf` `"fetch"` and stores no origin in the profile; the document's own `origin` field is the request's kind, `named_request`/`sweep`/`doorbell`, and a doorbell document's `capture.actor_class` is `"member"`, which K1776 says must read as `"fetch"`). Every document the plane produces today is a copy's fetch (K1775) or a knock (K1776), both `"fetch"`. So `read` hands `origin: "fetch"` to both of its `doctypeFor` passes (its own at R1, and `docprofile.readText`'s, which spreads its ctx into `doctypeFor`), never derived from `actor_class` or `origin.kind`; `ecourt_roa` can then never match through `read`, matching intake. No new option on `read` (R24's signature unchanged). When a member-supplied-bytes path (an upload) is built, its document will need to state the origin and `read` to read it; that is a requirement for that entry, not this one. If you would rather `read` take an optional `origin` option (R24 widened, extraction to pass it), say so.
