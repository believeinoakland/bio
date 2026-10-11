# local-facts (T45)

**Status** · session_01WsrEhcFfcP1igCUGdRgwEc · depth 2 · WORKING · handled B2

## J1 · QUESTION

Q1 (R10 `RULE_NO_SOURCE`, Uses). R10 takes `source` as `{captureSha, extent}` and refuses "an unseen capture answered as absent". To judge sight I need the capture's home bundle. `content` (my only new edge) gives no public capture→bundle or capture-sight read: its own `attestText` does it privately (`#readingBundle`), and `citationRefusals` / `contentContextFor` take a bundle or answer without a viewer. `events` R1 does the same check through `provenance.homeOf` (provenance's public R-line `homeOf(captureSha)`), plus its own sight over record-core's `bundles` with membership's `viewerPredicate`.

Options:
(a) Add the edge local-facts → `provenance` (L3, earlier: P4 holds) for `homeOf`; Uses amended in `local-facts.md` and `modules.json`. Source stays `{captureSha, extent}`; checks: `homeOf` null or bundle unseen → RULE_NO_SOURCE as absent; then `content.checkContentExtent(extent, content.contentContextFor(captureSha))`'s refusals.
(b) No new edge: `source` becomes `{bundleId, captureSha, extent}`; checked by `content.citationRefusals([{target: bundleId, extent, extent_capture: captureSha}])` (R27 → R11's held capture, R7's extent refusals), sight by `viewerPredicate` over record-core's `bundles` (both existing edges). Changes R10's wording.

My best reading / recommendation: (a), since it keeps R10's text. I am building everything else now and will write the source check to whichever you answer; meanwhile I code (a) behind the content check so only the `homeOf` call changes if you choose (b).

Also recorded as my own detail readings (tell me if any is wrong): rule ids `GR-<n>` (the draft row's sequence; local to the module, never reissued since the table is append-only and purged only whole... see below); the draft's validation profile holds the entry alone in its section plus the active view's `action_kinds`, `counterparties`, closure lists and `computation` so `applies_to`, `starter`, `closures` and `computation` can resolve, and only errors under that entry's path are answered; the basis supplied for validation is the draft's local day and status `researched`; in `governingView` a group rule's `basis` is `<confirmation local day> <rule id>` (R2's dated form with a qualifying word) and `status: "researched"`; R3's "office fact" is an office's `hours` and its own `time_zone` (a holiday entry naming offices keeps the profile's day).
