# following (T33)

**Status** · session_01BkUvhz4itmkyoN9rN3Wowv · depth 2 · COMPLETE · handled B3


## Record (FOLLOWING #1, `session_01BkUvhz4itmkyoN9rN3Wowv`)

**Entries applied.** T33-79 whole (K1444, K1449, K1468, K1484), as requirements R1–R18 state it, on J1's six readings (accepted, K1665), and B3's CHANGE R19 `onFollowed` (K1666). New code beside `monitoring`, no copy (Choices 7: no clean seam). Code `bio-plane/src/following/` (`index.mjs` the service and ops; `schema.mjs` the five tables with their classes; `legistar.mjs` the Legistar scheme, client and addresses from the view; `meetings.mjs` the per-meeting schedule over `civil-time`; `snapshot.mjs` the portal key, dataset reader and keyed diff). Tests `bio-plane/test/m/following/` (21 tests, every R1–R19 named). Host factory `followingOf(host, deps)` (K1563 (1)); ops `followingOps`; for scheduler `followDue`, `followWake`, `followTick(now, rank?)`, `onFollowed`.
- Every tick runs under `monitoring.sweepHost()` (consumer `following`, epoch one hour), as link-sweep does. Each read is `capture.acquire`'s capture-request arm (class daemon, `heldSha` of the last capture at that address, so the same bytes land nothing); a new capture lands through the host's `land` at collected, with the Legistar parse as the document's `reading` (promotion's projection writes it, extraction R20) and is then handed to `events.followedImport`.
- R2: an open follow (no `until`) asks Legistar with no upper bound, so its addresses are stable and a re-read compares bytes. A body read makes at most 200 fetches per tick (`BODY_READ_FETCHES`), saying `truncated` past it. Items are read only for a changed events list, votes only for a changed items list.
- R3: a matter's enactment triple (number, date, status) is kept per matter; when it moves (or on first sight) the matter's own address `/matters/<id>` is captured as a new version there; nothing else.
- A failed read leaves the follow due (its `last_read` unmoved) and the epoch open.

**Deferred.** None.

**Found in other modules.**
- `events` (R22, R4's need): `followedImport` writes a Legistar meeting without linking it to the followed body (no `concerns`, no participant), so `eventsFor({entity: body, kinds: ["meeting"]})` never finds an imported meeting. following R4 reads a body's observed meetings that way, so today only member-recorded meetings concerning the body govern a recurrence instance; Legistar-observed ones cannot until events links the meeting to the `body` it was imported for (a `concerns` row is the smallest change). REPORT J2.
- `modules.json` uses: the product code imports exactly K1665's list; the test fixture also imports `extraction` (the `Extraction` whose projection joins the real promotion, so a landing writes its reading) and `provenance` (its register, where a landing's capture is homed and `events` finds it). Both are earlier layers; adding them clears the architecture check's two fixture lines.

**Tests and checks** (on `job/T33/following` after merging `tranche/T33` @ `8c434d321f`).
- `node --test bio-plane/test/m/following/`: 21 pass, 0 fail. No layer tests (`build/manifest.md`); no module uses this one yet (scheduler registers it in T33-80).
- `format.mjs`: 0 failures. `coverage.mjs`: 19 of 19 live ids named, 0 failures. `ownership.mjs` (vs `tranche/T33`): 0 failures. `architecture.mjs`: 0 failures in product code; 2 in the fixture until `extraction` and `provenance` join the uses (above). The last three run with my `paths`/`tests` set in a scratch copy of `modules.json` (not committed; BOB writes them at merge).

**For `modules.json`.** `paths` `["bio-plane/src/following/"]`; `tests` `["bio-plane/test/m/following/"]`; `uses` K1665's ten plus `provenance` and `extraction`: record-grammar, jurisdictions, civil-time, legistar-reader, record-core, membership, provenance, capture, extraction, entities, events, monitoring.

Size (session_01BkUvhz4itmkyoN9rN3Wowv): test runs 26, module lines 1035

## J1 · QUESTION

Seam (Choices 7): no clean copy seam in monitoring; following is new code in `bio-plane/src/following/`, tests `bio-plane/test/m/following/`. I carry on with every reading below; none stops the build.

1. **R4/R5 the body's notice period.** The profile ties no `deadlines` entry to a body (Oakland holds three backward `starts: act` rules: 72 h, 24 h, 48 business hours). Reading: the per-meeting link (Suggestions 2, held here per K1505 (15)) is `perMeetingBody({address, body, notice, author, viewer})`, `notice` naming one `deadlines` rule of the view with `direction: backward` and a sourced `status` (researched/ruled, R44); the capture is due at `civil-time.evaluateRule({rule, anchor: meeting start})`. No `notice`, a rule absent, forward, or unsourced → `unscheduled` with its reason (R5). Refusals: R1's machine author, `NO_SUCH_ADDRESS` (not a `per_meeting` subject of monitoring the viewer sees), `NO_SUCH_BODY`.
2. **Where a follow lives (R17) and where its captures land.** No act names a project, but monitoring's `land` needs a bundle's project, and R17 needs a person query's follow to take its author's project's sight. Reading: every follow act takes an optional `home`, a bundle the author may see; the follow is seen as `home` is (`membership.inSight`), its captures land in `home`'s project; with no `home` the follow is group-wide. A person query (R9) requires `home` (refused `PERSON_QUERY_NOT_NAMED`, detail naming the missing project).
3. **R1 "a scheme the profile names for Legistar"** = an `identifier_schemes` entry with `body` in `entity_kinds` whose `systems` name an R4 origin with host `webapi.legistar.com`; the client (R18) is read from site data: the `<client>.legistar.com` host of that same origin, accepted only when the API system's `path` admits `/v1/<client>/`.
4. **R2 the reading events reads.** `events.followedImport` reads `extraction.readingOf`, so the tick lands each capture with its `legistar-reader` parse as the document's `reading` (`content_type: legistar_api`), which promotion's projection writes (extraction R20, recorded as the machine's assertion). Each R2 read is `capture.acquire`'s capture-request arm (`origin: named_request`, the follow as authority), class daemon.
5. **R4 the capture itself** is `monitoring.monitor({bundleId, actor: "class:daemon"})` of the watched bundle (its R1–R10), so the look, comparison and capture stay monitoring's; R6's lateness is the tick's instant less the due instant.
6. **Uses** final: record-grammar (machine test, public locator), record-core, membership, jurisdictions, civil-time, legistar-reader, entities, events, capture, monitoring; `acquisition` only through capture.

## J2 · REPORT

events (R22, against following R4): followedImport writes a Legistar meeting without linking it to the followed body (no concerns row, no participant), so eventsFor({entity: body, kinds: [meeting]}) never returns an imported meeting. following R4 reads a body's observed meetings that way, so today only member-recorded meetings concerning the body govern a recurrence instance. Smallest fix in events: a concerns row from each imported meeting to the body it was imported for. Recorded in my record.
