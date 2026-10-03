# docket (T28)

**Status** · session_01Pn2VewSRXzbLW8i6uHf5Ds · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

**Entries applied** (plan L8, docket: N526, N525):
- **R2 (N526)**: the pressure mark's machine refusal is this module's own code `MACHINE_CANNOT_MARK_DOCKET_PRESSURE`, on the same row C-129.10 (a renamed code keeps its check id, as K238 and K823 did). Its where and words are unchanged. `MACHINE_CANNOT_MARK_PRESSURE` (action-grammar's C-117.14) is no longer a key of `DOCKET_CHECKS`, and nothing here answers it.
- **R23 (N525)**: `docketAddress` and `feedAddress` answer the house form `op=docketpublic&case=<case>` and `op=docketfeed&case=<case>`, with no `?`. That covers `docketPublic`'s `feed` and `docketInvitation`'s `invitation.docket`, the only two addresses the module answers. Inside the Atom feed, every `href` (the self link and each docket link) is `feedHref(address)` = `?op=…`, a query-only relative reference (RFC 3986 §4.2). New export: `feedHref`.

**Deferred:** none.

**Other modules:**
- **control-plane** (L11, already planned): the K1280 comment at `src/control-plane/families.mjs:66–70` is now stale, because docket's file no longer holds `MACHINE_CANNOT_MARK_PRESSURE`. Docket's family can take its module-order place in `CHECK_FAMILY_FILES` (N526).
- **affordances**: `test/m/affordances/catalogue.test.mjs:1140` lists `MACHINE_CANNOT_MARK_PRESSURE` among docket's codes that are not justification refusals. It still passes, since the code is in no list, but it no longer names a docket code. It should read `MACHINE_CANNOT_MARK_DOCKET_PRESSURE`.
- **Generated artifact (§14)**: `bio-plane/dist/bio-plane.bundled.mjs` is stale from this module's source. BOB regenerates it at L8's close.
- The UX substrate (`ux-substrate-v2.json:5336`) names `MACHINE_CANNOT_MARK_PRESSURE` for `actionpressure`, which is actions' code and correct. Nothing to do.

**Catalogue rows awaiting stamp** (accepted red 2, T29's promotion stamp):
- C-129.10, code changed from `MACHINE_CANNOT_MARK_PRESSURE` to `MACHINE_CANNOT_MARK_DOCKET_PRESSURE` (`src/docket/index.mjs docketPressure > is-docket-pressure`).
- The row census (`test/system/row-census.test.mjs`) reports exactly that arrival and departure for docket. Its other arrivals (C-21.3–.5) are accepted-work's.

**Tests and checks:**
- docket: 38 pass, 0 fail. New: R23's test (every answer walked for addresses, with an encoded case id, feed hrefs resolved against the feed's own address, and negative controls). R2's test now also asserts the refusal's own code and row, and that action-grammar's code and check are absent.
- Users' tests: public-read 95/0, network-notices 63/0, affordances 153/0, queue-producers 73/0, plane 65/0, migrate-released 1/0. control-plane 138/1: `families.test.mjs` R22 (K585 (1)) is accepted red 6 (accepted-work's family), and it fails the same way without this change. row-census 1/1 fails as accepted red 2 (above).
- Checks: format 0 failures (95 modules); architecture 0 (8 files); coverage 23 of 23 live ids, 0 failures; ownership 6 files, 0 failures.

Size (session_01Pn2VewSRXzbLW8i6uHf5Ds): test runs 4, module lines 1294
