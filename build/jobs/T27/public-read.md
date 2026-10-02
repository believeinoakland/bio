# public-read (T27)

**Status** · session_01RxP8D4FZ4YPUucNfhaQQx2 · depth 2 · COMPLETE · handled B5

**Completion** (PUBLIC-READ #8, 2026-10-02; `docket` merged into `tranche/T27` by K1278 and merged into this branch)

*Entries applied* (`build/plan/current.md` T27 L8, N520, DEC-116 with DEC-100):
- **R20.** `publishedCase` answers `withdrawn` at the top: the stamp of the docket withdrawal naming the answered edition, `{seq, date, reason, entry: {seq, id, digest, docket}}`, read from `docket.withdrawalOf` (its R12), or null. Each case edition's row in `edition_index` carries its own stamp or null; a loose bundle's rows are unchanged. The edition is otherwise answered exactly as before. `docket_last_entry` is read from `docket.lastEntryOf` (its R14, K1276), so `publishedCase` stays synchronous and reads no capture bytes. J1's readings were confirmed (K1272); `entry.id` (the docket's `<case>#<seq>`) was added when B3 gave it.
- **R21.** `op=docketpublic&case=` (`docket.docketPublic`, its R14) and `op=docketfeed&case=` (`docket.docketFeed`, its R15) are added to the store ops (`publicReadOps`) and the door (`publicReadDoorOp`, through `publicReadDoorDocket`). Neither takes a credential, only `case` is forwarded and no header is. The feed is served as its own bytes under `application/atom+xml` (`docket`'s `ATOM_MEDIA_TYPE`), with CORS open. A missing `case` is the required-argument refusal (400). A case the docket answers null for is `publishedCase`'s own `NOT_PUBLISHED`, taken from `publishedCase({})`, so C-98.8 keeps its one site and its `where`, and it is relayed at 404 with the same bytes as `op=publishedcase`. `docketpublic` and `docketfeed` join `PUBLIC_READ_OWN_OPS`, so no registered read (R18) can take their names.
- **R10, R16.** The docket reads read only `docket`'s public answers. This module reaches `docket` only through `withdrawalOf`, `lastEntryOf`, `docketPublic` and `docketFeed`; by default it is `docketOf(host)` (K61), and a test may inject another. It writes nothing.
- **Uses wording (B4, K1276):** this module now also uses `docket`'s `lastEntryOf` (its R14, amended), beside `withdrawalOf`, `docketPublic` and `docketFeed`; the Uses line in `build/requirements/public-read.md` should name it.

*Catalogue rows added:* none (R21 reuses C-98.8), so none read `awaiting stamp`.

*Deferred:* nothing.

*Found in other modules* (reported to BOB):
- `control-plane`: `test/m/control-plane/families.test.mjs` R22 is red on `tranche/T27` as merged, with or without this branch. `CHECK_FAMILIES` does not reach `docket`'s new `DOCKET_CHECKS` family (`docket/checks.mjs`, re-exported by `docket/index.mjs`). That is `control-plane`'s L11 share of N520.
- `control-plane` R48 and `op-declarations` R13 (L11): route and declare `docketpublic` and `docketfeed` as public (`classes: null`) to this module's door; until then the plane does not reach them.
- `docket`: its `docketAddress` and `feedAddress` (`docket/feed.mjs`) begin with `?` (`?op=docketpublic&case=`), while this module's links (`op=publishedbytes&sha256=`, and R20's `entry.docket`, `op=docketpublic&case=`) do not. Two spellings of one address; not a defect against either module's requirements.
- Generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`) is stale by this change to the plane's source; BOB regenerates it at the layer's close.

*Tests and checks run:*
- `node --test bio-plane/test/m/public-read/`: 95 pass, 0 fail (new: `docket.test.mjs`, 7 tests over `docket`'s interface; `docket-real.test.mjs`, 2 tests over the real `docket` on its own fixture world).
- Tests of every module that uses `public-read`: `network-notices` 62 pass, 0 fail; `ratification` 199 pass, 0 fail; `filings` 60 pass, 0 fail; `plane` 55 pass, 0 fail, plus `test/system/migrate-released.test.mjs` 1 pass, 0 fail; `control-plane` 127 pass, 1 fail (R22 above, red on the tranche branch too). Also `review` 35 pass, `publication` 98 pass, `docket` 37 pass, each 0 fail.
- No layer tests are named in `build/manifest.md`.
- Checks (process repository): `format: 92 modules, 91 requirements files; 0 failures`; `architecture: 31 product files, 93 relative imports (0 naming no tracked file, not judged); 0 failures`; `coverage: 1 modules, 21 of 21 live requirement ids named by a test; 0 failures`; `ownership: 11 files changed by public-read between tranche/T27 and HEAD; 0 failures`.

Size (session_01RxP8D4FZ4YPUucNfhaQQx2): test runs 16, module lines 2509

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
