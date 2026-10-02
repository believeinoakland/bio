# docket (T27)

**Status** · session_01PJ5cMH43RbHxx4SXkb3E7X · depth 2 · WORKING · handled B2

## J1 · QUESTION

Readings I am building on (docket R1–R22); none changes a provided service's shape that public-read or network-notices use (`docketPublic`, `docketFeed`, `docketSigners`, `withdrawalOf`). Answer only where you rule otherwise.

1. **Catalogue family.** My rows use `C-128.n` (next after network-notices' C-127), each `awaiting stamp` until T28. Say if another number is reserved.
2. **Taking back a record entry (R11).** No op is named. Reading: `docketFile` takes an optional `takesBack: <record entry id>` with `reason` (no other form field). It runs R1's caller refusals (machine, `NO_SUCH_CASE`, `DOCKET_NOT_A_PARTICIPANT`), then `NO_SUCH_DOCKET_ENTRY` (names no record entry of the case), `DOCKET_ENTRY_SETTLED` (already placed, declined, receipted or taken back; a placed one is taken back publicly, by a `take-back` entry), then `DOCKET_NO_REASON`. It is held as a mark on the entry, which then reads `taken-back`.
3. **`disclosure` (R9 (c)).** R6 has no field naming the tension. Reading: `docketPrepare` takes `candidate`, published as `answers`. A missing candidate is refused `NO_SUCH_DOCKET_ENTRY`.
4. **`standing-withdrawn` (R10).** Reading: `docketPrepare` takes `grant` (the grant entry's `seq`), published as `answers`, with `holder` the grant's name. A grant that is absent is `NO_SUCH_DOCKET_ENTRY`; one already ended is `DOCKET_NO_STANDING`. A grant is live from the instant its entry is posted until the instant its `standing-withdrawn` entry is posted (`date` is the UTC day, for display).
5. **Kind and `from` (R1).** Under `DOCKET_KIND_UNKNOWN`: `response` and `statement` come only from the subject or a holder, `reaction` only from `other`, `outcome` from anyone.
6. **A placement's `edition`** is its record entry's own. A different `edition` passed is `DOCKET_NO_EDITION`. Kinds with no record entry (`edition`, `disclosure`, `withdrawal`, `standing-*`, `take-back`) name a ratified edition (`all` only for `withdrawal`). Every kind except `reaction` goes to `listed`.
7. **`receipt` (R8).** It places a record entry from the subject, or from a holder whose grant was live at its filing (else `DOCKET_NO_STANDING`). It needs the manager's words in `reason` (`DOCKET_NO_REASON`); the published reason is "names a private person: <words>". `capture` is null and no bytes are published.
8. **`docketDecline` and `docketInvitation` order.** The case comes from the entry, so an entry that is absent or invisible to `by` is `NO_SUCH_DOCKET_ENTRY`, after the machine refusal and before `DOCKET_NOT_THE_MANAGER`. `docketInvitation` answers only for a receipted entry (else `NO_SUCH_DOCKET_ENTRY`), with a code and a meaning; the words are the UX stream's.
9. **`docketOf`'s core (R3).** A full-sight member sees the case's core as its manager would. `coreDue` itself still answers only cases the viewer manages. Core kinds: `response`, `statement`, `edition`, `tension`, with `ref` the record entry id, the edition number or the candidate. A tension's `since` is the latest ratified edition's `ratified_at`.
10. **Ids.** A record entry id is an opaque id `DKT-YYYY-NNNN` minted in the filing's transaction. A public entry's id is `<case>#<seq>`, which `reevaluation` R30 already defaults to.
11. **`contested` (R13)** leaves out a contesting record entry that has been taken back.
12. **R14's bytes** are answered base64 under `captures: {<sha256>: <base64>}`, read from the evidence store through `provenance`.

## J2 · REPORT

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
