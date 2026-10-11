# local-facts (T45)

**Status** · session_01WsrEhcFfcP1igCUGdRgwEc · depth 2 · WORKING · handled B2

## J1 · QUESTION

Q1 (R10 `RULE_NO_SOURCE`, Uses). R10 takes `source` as `{captureSha, extent}` and refuses "an unseen capture answered as absent". To judge sight I need the capture's home bundle. `content` (my only new edge) gives no public capture→bundle or capture-sight read: its own `attestText` does it privately (`#readingBundle`), and `citationRefusals` / `contentContextFor` take a bundle or answer without a viewer. `events` R1 does the same check through `provenance.homeOf` (provenance's public R-line `homeOf(captureSha)`), plus its own sight over record-core's `bundles` with membership's `viewerPredicate`.

Options:
(a) Add the edge local-facts → `provenance` (L3, earlier: P4 holds) for `homeOf`; Uses amended in `local-facts.md` and `modules.json`. Source stays `{captureSha, extent}`; checks: `homeOf` null or bundle unseen → RULE_NO_SOURCE as absent; then `content.checkContentExtent(extent, content.contentContextFor(captureSha))`'s refusals.
(b) No new edge: `source` becomes `{bundleId, captureSha, extent}`; checked by `content.citationRefusals([{target: bundleId, extent, extent_capture: captureSha}])` (R27 → R11's held capture, R7's extent refusals), sight by `viewerPredicate` over record-core's `bundles` (both existing edges). Changes R10's wording.

My best reading / recommendation: (a), since it keeps R10's text. I am building everything else now and will write the source check to whichever you answer; meanwhile I code (a) behind the content check so only the `homeOf` call changes if you choose (b).

Also recorded as my own detail readings (tell me if any is wrong): rule ids `GR-<n>` (the draft row's sequence; local to the module, never reissued since the table is append-only and purged only whole... see below); the draft's validation profile holds the entry alone in its section plus the active view's `action_kinds`, `counterparties`, closure lists and `computation` so `applies_to`, `starter`, `closures` and `computation` can resolve, and only errors under that entry's path are answered; the basis supplied for validation is the draft's local day and status `researched`; in `governingView` a group rule's `basis` is `<confirmation local day> <rule id>` (R2's dated form with a qualifying word) and `status: "researched"`; R3's "office fact" is an office's `hours` and its own `time_zone` (a holiday entry naming offices keeps the profile's day).

## J2 · REPORT

REPORT (other modules, and two code names).

1. Two codes renamed, owner-prefixed as K231 does (your call to confirm; the requirement text needs it): R10/R13's `NO_REASON` is `RULE_NO_REASON` (bare `NO_REASON` is progressions' C-100.18; mine made answer-envelope's R7 test red, now green); R11/R13's `NO_SUCH_RULE` is `NO_SUCH_GROUP_RULE` (`action-clocks` answers a bare `NO_SUCH_RULE` for a profile deadline, which the envelope would have decorated with my row). Please amend R10, R11, R13 and the plan's row list (`NO_SUCH_RULE` → `NO_SUCH_GROUP_RULE`, add `RULE_NO_REASON`).
2. One code added, not in the text: `RULE_NOT_CONFIRMED` (C-126.16), `ruleOffer` of a rule that is drafted or withdrawn (R13 says "for a confirmed rule"; no code was named). Please add it to R13.
3. Rows C-126.6–.16 are new and `MACHINE_CANNOT_CONFIRM` (C-126.1)'s translation is widened to cover a rule's confirmation: all await the row stamp (plan rule 4 (2), until T46's).
4. New ops `ruledraft`, `ruleconfirm`, `rulewithdraw`, `ruleoffer` in `localFactsOps` (R10, R11 name the first two; the plan names all four for op-declarations). Two other modules' tests pin local-facts' op list and are red from my merge: `affordances` `catalogue.test.mjs` "R1 R12 R24: the op maps of filing-templates and local-facts hold exactly their ops…" and `plane` `compose.test.mjs` "R11, R5: every op of local-facts' and filing-templates' maps is in the route map…". Owners: affordances (NON_ACTS/rungs for the four writes) and plane/op-declarations (routing, T45-47). Please accept them as reds until those jobs, or route them. `groupRules` (R12) has no op: no requirement names one; members will need one to read the group's rules (suggestion for op-declarations, BOB's to word).
5. The test profile's fact list grows by two (office zones, `jurisdictions` R74): `factStatus` and `factsDue` without paths now list the Examiner of Accounts' and the `commitment_claim` venue's zones. Every user of local-facts' tests run: progressions, duties, retrieval, actions, action-clocks, queue-producers green; filings' one red is the accepted rule 4 (7) one; answer-envelope green after item 1.
6. `governingView()` answers `combine`'s shape `{ok, view, conflicts}` so readers swap `combine(ids)` for it; a confirmed rule whose key the view already holds (a profile activated later) is not added and is reported in `conflicts` (one value per key). Readers (action-clocks, filings, actions, duties) adopt it in their own jobs.
