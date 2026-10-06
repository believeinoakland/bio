# following (T33)

**Status** · session_01BkUvhz4itmkyoN9rN3Wowv · depth 2 · WORKING · handled B1

## J1 · QUESTION

Seam (Choices 7): no clean copy seam in monitoring; following is new code in `bio-plane/src/following/`, tests `bio-plane/test/m/following/`. I carry on with every reading below; none stops the build.

1. **R4/R5 the body's notice period.** The profile ties no `deadlines` entry to a body (Oakland holds three backward `starts: act` rules: 72 h, 24 h, 48 business hours). Reading: the per-meeting link (Suggestions 2, held here per K1505 (15)) is `perMeetingBody({address, body, notice, author, viewer})`, `notice` naming one `deadlines` rule of the view with `direction: backward` and a sourced `status` (researched/ruled, R44); the capture is due at `civil-time.evaluateRule({rule, anchor: meeting start})`. No `notice`, a rule absent, forward, or unsourced → `unscheduled` with its reason (R5). Refusals: R1's machine author, `NO_SUCH_ADDRESS` (not a `per_meeting` subject of monitoring the viewer sees), `NO_SUCH_BODY`.
2. **Where a follow lives (R17) and where its captures land.** No act names a project, but monitoring's `land` needs a bundle's project, and R17 needs a person query's follow to take its author's project's sight. Reading: every follow act takes an optional `home`, a bundle the author may see; the follow is seen as `home` is (`membership.inSight`), its captures land in `home`'s project; with no `home` the follow is group-wide. A person query (R9) requires `home` (refused `PERSON_QUERY_NOT_NAMED`, detail naming the missing project).
3. **R1 "a scheme the profile names for Legistar"** = an `identifier_schemes` entry with `body` in `entity_kinds` whose `systems` name an R4 origin with host `webapi.legistar.com`; the client (R18) is read from site data: the `<client>.legistar.com` host of that same origin, accepted only when the API system's `path` admits `/v1/<client>/`.
4. **R2 the reading events reads.** `events.followedImport` reads `extraction.readingOf`, so the tick lands each capture with its `legistar-reader` parse as the document's `reading` (`content_type: legistar_api`), which promotion's projection writes (extraction R20, recorded as the machine's assertion). Each R2 read is `capture.acquire`'s capture-request arm (`origin: named_request`, the follow as authority), class daemon.
5. **R4 the capture itself** is `monitoring.monitor({bundleId, actor: "class:daemon"})` of the watched bundle (its R1–R10), so the look, comparison and capture stay monitoring's; R6's lateness is the tick's instant less the due instant.
6. **Uses** final: record-grammar (machine test, public locator), record-core, membership, jurisdictions, civil-time, legistar-reader, entities, events, capture, monitoring; `acquisition` only through capture.
