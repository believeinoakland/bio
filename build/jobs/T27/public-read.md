# public-read (T27)

**Status** · session_01RxP8D4FZ4YPUucNfhaQQx2 · depth 2 · WAITING ON BOB (J2) · handled B5

## J1 · QUESTION

Four readings I am building on (best reading each; I carry on meanwhile and reconcile with `docket`'s code at its merge).

1. **R20, "for each edition a docket withdrawal names".** `publishedCase` answers `withdrawn` at the top for the answered edition (the stamp, or null when no withdrawal names it), and each row of `edition_index` carries its own `withdrawn` (stamp or null), so a reader of any edition sees which editions stand withdrawn. A loose (non-case) bundle answers `withdrawn: null` and `docket_last_entry: null`.
2. **R20's `entry`, "the stamp linked to the withdrawal entry".** `entry` is `{seq, digest, docket: "op=docketpublic&case=<case>"}`: the entry's identity (its `seq` and digest from `withdrawalOf`) and the fixed address it is served at. The stamp's words are the UX stream's; I add none.
3. **R21's answers.** `op=docketpublic&case=<c>` answers `{ok: true, case, ...docketPublic's answer}` at 200; `op=docketfeed&case=<c>` answers the feed's own bytes (I read `docketFeed` as answering the Atom document as a string) with `content-type: application/atom+xml`, CORS open as the other public reads. A missing `case` is the required-argument refusal (400). A case the docket answers null for is `publishedCase`'s own `NOT_PUBLISHED` answer, taken from `publishedCase` itself (one mint site, so `where` of C-98.8 is unchanged and no catalogue row moves), relayed at 404 as `op=publishedcase` relays it.
4. **Routing.** I add `docketpublic` and `docketfeed` to this module's door ops and store ops; `control-plane` (R48) and `op-declarations` (R13) route and declare them `classes: null` in L11. Until `docket` merges, `publicReadOf` takes `docket` as a dependency (tests inject one meeting `docket` R12, R14, R15); at the merge the default becomes `docketOf(host)`.

## J2 · QUESTION

On B3: `docketPublic` is async, and R20 makes `publishedCase` answer `docket_last_entry`, `docket` R14's `last_entry`. Read through `docketPublic`, `publishedCase` would have to become async. The plane's store frame awaits a promise, so the ops are unaffected. But `filings`' tests call `publicRead.publishedCase(...)` synchronously (`test/m/filings/reads.test.mjs:54`, `packet.test.mjs:344, 347`), and they would break. Also, `docketPublic` reads every listed capture's bytes, which is heavy for one date on every case read.

My best reading, and what I propose: `docket` also offers a synchronous, viewer-free `lastEntryOf({case})`, answering `docketPublic`'s `last_entry` (the latest public entry's `date`, or null) without reading bytes, named in its R14. `publishedCase` stays synchronous and calls it beside `withdrawalOf`. That is a change to `docket`'s provided services (yours to word, its job to build), and a `docket` entry in my Uses.

The alternative, if you prefer it: `publishedCase` becomes async, and `filings` re-points its three calls to `await` in its own next job. Until then its tests stay red.

I am building R21 (async `docketPublic` and `docketFeed`, B3's shapes, `docketOf(host)`) now; R20's `withdrawn` is unaffected (`withdrawalOf` is synchronous). Only `docket_last_entry` waits on this answer.
