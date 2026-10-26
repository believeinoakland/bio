# Diagnosis of the BROKEN rows of sitting 10b (K4426)

Record: `build/plan/walk-T51-final/10b-case.md` on `origin/prep/final-10b-case` (200 lines, read whole, plus its script `scripts/10b-case.test.mjs`). It was still running; fetched twice (same 200 lines: 22 BROKEN, 79 WORKS, 22 NOT REACHED). Earlier diagnoses cover none of these rows. `fix-round-10-T51.md` (whole) and `later-ux.md` place none of the causes except where "ALREADY PLACED" is written.

Product read at `origin/tranche/T51` `d0fdba3e63` (temporary worktree, removed; /home/user/bio untouched). I re-ran the walker's script unchanged there: the same 22 rows are BROKEN. A copy with extra dumps ("probe") gave the facts quoted below.

## Summary table

| # | rows (record 10b) | verdict | owning module | one-line cause |
|---|---|---|---|---|
| C1 | R95 recreate with the checker; R98 (b); R182 verify and recreate k = 2 | DEFECT (BLOCKER) | case-disclosures | `findingFacts` hands the `content` table's TEXT columns `extent`/`chain` into the signed `passages:` rows, so they are JSON strings and the checker's content-id recompute differs |
| C2 | R96 (g), the cross-case half | SPECIFIED (R28 hash rule) with a requirement defect for BOB's ruling | public-read | a removal order withholds by hash; two cases' case files share the byte-identical `criteria.json`, and a zip holding any withheld file is refused whole |
| C3 | R96 (g), the page half | DEFECT | public-read | a removed edition's finding rows are `{...fnd}` spreads that keep `case_excludes`, `strength`, `grounds`, `required` |
| C4 | R177 | DEFECT (summary) + SPECIFIED (archive copy, live only) | docket (screen unchanged works) | `docketFile` discards a reaction's filed summary; `docketPrepare` demands one; the screen's Post sends none |
| C5 | R94 (a); R94 (c); R94 (k); R96 (a); R95 (a) | DEFECT (screen), R94 (a) partly ALREADY PLACED, R95 (a) SPECIFIED as to `verify` | screens-publish | the published page never reads several fields `publishedcase` carries (unrated strength, bar sentence, `successor`, `lens.closing`, case id, hash, `verification`) |
| C6 | R98 imported-list and imported-case at 1280 and 390 (4 rows); OVERLAY (15), its "Imported case" ids | DEFECT | case-import (+ screens-publish test) | `importedCase` serves no case title and no finding title, so the screen can only draw the ids |
| C7 | R213 home 1280, 390, dark; queue-owner 1280, 390; OVERLAY (15) "ids" | DEFECT | queue-producers | a notice sentence names its holder with `#nameOf`, which finds titles only of bundles; a case holder is drawn as `CASE-…` |
| C8 | OVERLAY (15) "photos" | WORDS, ALREADY PLACED | UX design stream | "Vouch for the 6 photos you captured" for documents and pages: `later-ux.md:19` |
| C9 | (no row; D7 "no accessible name", reported on R213 rows) | WALKER-ERROR | none | the walker's check reads `innerText` of buttons inside closed `<details>`; the buttons carry their labels |
| C10 | R96 case-editor-next-edition 1280 and 390 | DEFECT (minor) | screens-publish | the editor always reads `casedocument` for the begun edition, which has no document yet: a 404 on a normal load |

22 of 22 rows placed (OVERLAY (15) under C6, C7, C8).

---

## C1. A case the product publishes is "Did not recreate" (R95 recreate, R98 (b), R182 k = 2). DEFECT, BLOCKER

Rows: R95 recreate; R98 (b); R182 k = 2. Same text in all three: `a passage of 4f80… ... does not recompute to the content id it states (5652…)`; `integrity.intact` true.

1. Root cause.
   - The checker's rule, `bio-plane/src/case-checker/check.mjs:629`: `if (!HEX64.test(String(row.content_id ?? "")) || contentIdFor(cap, row.extent, row.chain ?? null) !== row.content_id) { differs.push(entry("passage", id, ... "does not recompute to the content id it states ..."` . `contentIdFor` (`bio-plane/src/content/extent.mjs:147`) takes the extent as an OBJECT and the chain as a value: `extent: canonicalExtent(extent)` (`:111-112`, `const e = isObj(extent) ? extent : {}`, so a string becomes `{}`) and `chain: chain == null ? null : canonicalJson(chain)` (a string is canonicalised again, double-encoded).
   - The producer, `bio-plane/src/case-disclosures/index.mjs:646-651` (`findingFacts`): ``for (const leg of this.#rows(`SELECT b.ord, c.content_id, c.capture_sha, c.extent, c.chain FROM inquiry_basis b JOIN content c ...``` then `passages.push({ finding: id, ord: Number(leg.ord), content_id: leg.content_id, capture_sha: leg.capture_sha, extent: leg.extent, chain: leg.chain ?? null, quoted: ... })`. `content.extent` and `content.chain` are TEXT columns holding canonical JSON (`bio-plane/src/content/schema.mjs:109`, `extent TEXT NOT NULL, -- the per-arm fields as canonical JSON`; `:111`, `chain TEXT`), so the row carries strings. The module's own line 649 even compares against the text: `canonicalJson(x.extent) === leg.extent`.
   - The strings travel unchanged: `case-grammar/facts.mjs:75-77` `passagesLines` writes `exact(r[f])`, `passagesOf` reads back the same string, and `public-read/casefile.mjs:159` writes them into `findings/<id>/passages.json` (the walker's file); the signed case document states the strings too.
   - Run here: `contentIdFor` of the object and of its JSON string differ (`2907d344…` vs `5f0a43eb…`); the chain likewise.
   - Spec (`src/case-checker/spec.mjs:45`, `:66`): `extent` "in the extent grammar's canonical form", each value "its canonical JSON in one single-quoted value", i.e. the object's canonical JSON, read back as an object.
   - Consequence: every published case resting on a document passage fails its own checker and every import acceptance is unreachable (`IMPORT_ACCEPT_NOT_RECREATED`). Editions already signed carry the strings and cannot be re-signed: whether the checker also parses a string-valued row is BOB's ruling.
2. Why the module tests missed it.
   - `bio-plane/test/m/case-disclosures/carries.test.mjs:291-292` PINS the defect: `assert.deepEqual(p.find(...), { ..., extent: canonicalJson({ kind: "doc-para", para: 1 }), chain: null, quoted: ... })`, the string form, and it builds its content row from the string (`w.content(cid, a, DOC, "paragraph 1", canonicalJson({...}))`, `:268`).
   - The checker's tests and public-read's use hand-built object rows: `test/m/case-checker/fixture.mjs:199` (`extent: passageExtent` an object, `content_id: contentIdFor(MINUTES_SHA, passageExtent, null)`), `test/m/public-read/casefile.test.mjs:72` (`extent: { kind: "document" }`). No test publishes through the plane and then runs the checker on the file it served 
3. Failing-first tests.
   - `bio-plane/test/m/case-disclosures/carries.test.mjs` (owning module's tests): in the R15 `findingFacts` test, for every `f.passages` row assert `typeof row.extent === "object"` and `contentIdFor(row.capture_sha, row.extent, row.chain) === row.content_id` (a chain, when present, an array); change the line-291 expectation to the object.
   - The walker's case through its real entry belongs to control-plane (the door): new `bio-plane/test/m/control-plane/walk10b-recreate.test.mjs` using `r8-kit.mjs` `makeKit` as `t51-round7-seam.test.mjs` does: upload a text, vouch, question, cite one sentence, conclude, draft, prepare, key, sign (`caseratify`), fetch `publishedbytes&format=zip` by the manifest hash, run `src/case-checker/check.mjs` (the served program's `check`) on the zip and assert the finding is `recreated`; then `caseimport` the same bytes into a second room and assert `recreation.findings[0].result` is `recreated`. Add the k = 2 form for R182.
4. Owner: `case-disclosures` (layer 8, `bio-plane/src/case-disclosures/`). It uses `content` (the table is `content`'s) but the fix is local: parse `leg.extent` and `leg.chain` (`JSON.parse`, chain null stays null). Depends on the platform: no (pure module logic over the SQL rows; only the control-plane test needs Miniflare). A followed CHANGE to `case-checker` only if BOB rules the legacy tolerance.

---

## C2. A removal order for one case withholds another case's case file (R96 (g), cross-case half). SPECIFIED by R28; a requirement defect for BOB

Row: R96 (g) "a 'remove' order on one case ... and another published case's case file".

1. Root cause (the code does what R28 says; the combination is the defect).
   - `bio-plane/src/public-read/index.mjs:1760-1763`: "R28 ... `bySha` each withheld hash with the orders that withhold it. A hash is one object, so bytes an order withholds under one edition are withheld wherever they would be served (J1 (5))." `#withheldIndex` (`:1766-1782`) builds `bySha` across EVERY stamped edition. `withholdingOf` (`courtorders.mjs:48-81`) for a `remove` with no `parts` sets `whole` and adds every item of the edition.
   - `bio-plane/src/publication/worker.mjs:722-728`: "R28: a zip carrying any file a court order withholds is not served: one with a piece missing is never handed over ... `const zOut = await withheldOf(stub, listedShas); ... if (Object.keys(zOut.withheld).length) return P.json(withheldByCourtOrder(shaParam, zOut.withheld), 451);`". `listedShas` is every sha the case's own manifest lists.
   - What the two cases share (probe, my copy of the script, manifests intersected before the order): `{"CASE-2026-3549": ["criteria.json"], "CASE-2026-8948": ["criteria.json"]}`, X has 12 files. The case file's `criteria.json` is the default criteria, byte-identical for any two cases of a team that declare none. The order's hash set therefore contains Y's `criteria.json`, and Y's zip is refused 451 while Y's manifest and capture copy still answer 200 . 
   - Specified: `public-read.md` R28 ("bytes an order withholds under one edition are withheld wherever they would be served", J1 (5)) and the pinned-finding test `test/m/public-read/court-orders.test.mjs:127` ("the same bytes are withheld wherever they would be served: a finding another case also pins"), which is right for a finding two cases both pin (content the order is about). It was never weighed for a file that carries no member's material.
2. Why the tests missed it: `court-orders.test.mjs` tests the shared finding at the `publishedcase` read and a zip of ONE case (`:93`, `:116` `bytesStatus(s, s.manifest, {format:"zip"})` 451); no test serves a second case's zip while another case is under an order, and no fixture has two cases with the same `criteria.json`.
3. Failing-first test (after BOB's ruling): `bio-plane/test/m/public-read/court-orders.test.mjs`, new test: assemble two cases of one team (two `assembled()` calls on one store, both with default criteria), stamp `remove` on case 1 only, and assert case 2's zip is 200 (and, per the ruling, that a finding both cases pin stays withheld in both). The through-the-door form (Worker route `worker.mjs:726`) is control-plane's: `bio-plane/test/m/control-plane/walk10b-court.test.mjs`.
4. Owner: `public-read` (its `paths` include `bio-plane/src/publication/worker.mjs`). Platform: the logic is pure (which hashes count); the Worker route and its `withheld` RPC are the platform part, tested through the door. Decision for BOB (the order's reach is his to say; K1480, K1493): (1) keep the rule: any removal order then silences every case of the team with default criteria; (2) count in a case's zip only files withheld by an order of THAT case (each `bySha` order carries its `case`) or content the case pins, exempting the case file's own scaffolding (`criteria.json`); (3) make scaffolding unique per case (a case-file format change; the checker refuses an unknown format). I recommend (2).

---

## C3. A removed edition's page still carries the case document's text in its finding rows (R96 (g), page half). DEFECT

Row: the same R96 (g) (D8). The walker's check counted `findings.length > 0` and called it BROKEN; the real fault is narrower than "findings readable".

1. Root cause. For a whole removal the answer is as `build/requirements/public-read.md` R28 says: "A whole edition withheld answers its identity, its editions and its orders, and none of its content", and `test/m/public-read/court-orders.test.mjs:66-75` asserts every top-level content key null. Probe (the stranger's `publishedcase` of the removed case, nulls dropped): `withheld: {whole: true, document: true, manifest: true, findings: [...], files: [12 paths]}`, `document: {withheld: true, doc_sha}`, `court_orders: [{effect: "remove", ...}]`. So the page is right at the top. But the finding row in the same answer still reads (probe): `"strength":[{"axis":"capture","state":"unrated",...,"detail":"Not graded yet on capture: ... Not counted yet: INFO-2026-0015-x9-minutes."},...],"grounds":[],"frozen_from":"case_document","case_excludes":"## What This Excludes\n\nThis case covers the stamp only; it leaves out the later amendments. ... Who wrote this statement. marlowe wrote this exclusion statement ..."`. That is the withheld document's own text. Code: `bio-plane/src/public-read/index.mjs:1177-1181` (`const by = withheldBy(fnd.bundle_sha); if (by) return { ...fnd, title: null, serves: [], names: [], unresolved: [], division: {...}, parts: ..., withheld: { orders: by, detail: WITHHELD_SENTENCE } };`): `...fnd` keeps what `caseEditionState` put on the row from the case document: `bio-plane/src/publication/index.mjs:2127-2134` (`strength: frozenHere ? frozenHere.strength : ...`, `grounds`, `frozen_from`, `case_excludes: frozenHere.excludes`, `required`).. `sig_armored`, `attestor`, `role` are identity facts; which of `strength`, `grounds`, `required` count as content is BOB's detail; `case_excludes` is plainly document text.
2. Why the tests missed it: the module test asserts only `[f.title, f.withheld.detail, f.withheld.orders[0].effect]` per finding and `typeof f.bundle_sha` (`court-orders.test.mjs:64-67`). No test lists the finding row's keys or asserts `case_excludes`/`strength` null under an order.
3. Failing-first test: `bio-plane/test/m/public-read/court-orders.test.mjs`, in the `remove` test: for each `c.findings` row assert `case_excludes === null` and that no string of the signed document (use the exclusion sentence) appears anywhere in `JSON.stringify(c)` except under `court_orders`/`withheld` words; same for a `seal` naming the finding (`:95-110`). Door form: in `walk10b-court.test.mjs` (C2) the stranger's `publishedcase` body after the order must not contain "This case covers the stamp only".
4. Owner: `public-read`. Platform: no.

---

## C4. A reaction elsewhere cannot be posted from the screens (R177). DEFECT (summary); archive copy SPECIFIED

Row: R177. Saw: `docketfile` with a summary and `public` filed (`DKT-2026-3640`), then `docketprepare` as the screen sends it (case, entry, kind): `DOCKET_NO_SUMMARY`; with a summary added by hand: `DOCKET_NO_ARCHIVE_COPY`.

1. Root cause.
   - The screen sends the act the way the walker did: `bio-plane/src/screens-publish/docket.mjs:197` `pr = P.value(await cs.call("docketprepare", { query: { case: caseId, entry: el.dataset.entry, kind: el.dataset.kind } }))`. The filing form does ask for a summary (`docket.mjs:89` `cs.field("dk-summary", "screen.docket.summary.label", ...)`, sent `:182` `summary: summary`), required to be non-empty (`:181`).
   - `docketFile` drops it for every kind but `outcome`: `bio-plane/src/docket/index.mjs:449-457`: `if (!oneParagraph(summary, SUMMARY_MAX)) return { refusal: refuse("DOCKET_NO_SUMMARY", ...` only inside the outcome branch, and the returned fields `outcome: outcomeRow, summary: outcomeRow ? summary.trim() : null`; the INSERT stores `x.summary` (`:477-480`), null.
   - `docketPrepare` for a `reaction` requires a summary as an ARGUMENT: `docket/index.mjs:647-649` `if ((shelf === "reactions" || hasSummary) && !oneParagraph(a.summary, SUMMARY_MAX)) return { refusal: refuse("DOCKET_NO_SUMMARY", ...`, called with `summary: kind === "outcome" ? null : summary` (`:749`), the prepare's own argument, not `rec.summary`. Spec `docket.md` R4: "a `reactions` entry requires `summary`, the group's words, one paragraph of at most 600 characters (`DOCKET_NO_SUMMARY`)"; R1 (the filing) says nothing of keeping a reaction's summary, though its form takes one (`docket.md` R1 fields; the op's `accepts` lists `summary`, `:1335`). So the member's typed summary is lost and the manager is never asked: the screens' own sequence ends in `DOCKET_NO_SUMMARY` for every reaction.
   - `DOCKET_NO_ARCHIVE_COPY` (`docket/index.mjs:650-652`) is SPECIFIED (R4: a capture whose co-archive succeeded); the walker's reaction was an upload, which has none offline. Not a defect.
2. Why the tests missed it: `test/m/docket/place.test.mjs:84-104` and `formats.test.mjs:81` always pass `summary` to `docketPrepare` directly (`prepare(w, { kind: "reaction", entry: r, shelf: "reactions", summary: "A column calling the case unfair." })`); `test/m/screens-publish/fixtures.mjs:127` stubs `docketprepare` with `ok(...)`, so neither side ever ran the other.
3. Failing-first test: `bio-plane/test/m/docket/place.test.mjs`: file a `reaction` through `docketFile` with `summary: "A column."` (the fixture's archived capture, `fixture.mjs`), then `docketPrepare({case, entry, kind: "reaction"})` with NO summary argument (what the screen sends) must be `ok` and the entry's statement must carry the filed summary; today `DOCKET_NO_SUMMARY`. Walker's exact case through the door (summary typed at filing, then prepare as the screen sends) belongs to control-plane: `bio-plane/test/m/control-plane/walk10b-docket.test.mjs` (with a captured, co-archived page; the offline upload cannot reach the archive half).
4. Owner: `docket` (fix: keep the filed `summary` for every kind that has one, use it as `docketPrepare`'s default; R1 and R4 amended; a detail, BOB's ruling). The screen needs no change. Platform: no.

---

## C5. The published page draws less than `publishedcase` carries (R94 (a), (c), (k); R96 (a); R95 (a)). DEFECT in the screen; the requirement text is thin

All five rows are the same: `screens-publish/published.mjs` reads only part of the answer. Grep over `screens-publish/published*.mjs`: no line reads `successor`, `what_changed`, `lens.closing`, `bar_detail`, `verification`, `delivered_by`, `caseId`/`basis` as text; `e.withdrawn` is read once (`published.mjs:70`).

- R94 (a) strengths and bar (D4). `published-parts.mjs:58-63` `gradeOf` returns a letter only for A to D (`/^[A-D]$/`); `:77-81` `strengthLine` joins only the role and those marks; `:108-122` `card` draws `meets` only when `standing.meets` is true/false. The finding has state `unrated` with the sentence "Not graded yet on capture: ..." (data) and the case has `bar.declared:false` with `bar_detail`; none is read. The page's own sentence `screen.published.howtoread` ("Each finding shows two strengths: how well its documents are held, and how firmly they are linked.") then says something the finding does not show. PARTLY ALREADY PLACED: `later-ux.md:11` "strength displays · `ungraded` not drawn (strength R6 serves it) · K4259" is this symptom class (I read it as the same item; it says "strength displays" without naming the published page). The "no bar declared" line is not placed anywhere.
- R96 (a) the older edition quotes the newer What-changed (D5). `published.mjs:60-65` draws the other editions as bare links `cs.w("screen.published.edition", { n })` and nothing of `e.successor` (data: `successor.statement`, public-read R3 `what_changed`, DEC-101). `screens-publish.md` has no clause for it (grep: `successor`, `banner` absent); canon DEC-101.
- R94 (c) the lens (D12). `published.mjs:130-132` draws `e.bias_acknowledgement` only; `lens.closing` ("Everyone who investigates looks through a lens ...", public-read R3 `closing`) and `lens.statements` are never read. DEC-103.
- R94 (k) the header (D12). `published.mjs:68-70` header is `cs.title(e.scope || e.project_reference || e.caseId)` plus `screen.published.dated` (edition, signed, published); the case id appears only as the title's last fallback, the manifest hash only in a `data-sha` (`:164`), and no basis-version name is drawn.
- R95 (a) (D11). `verify` answers `{ok, published, sha256, matches}` by `public-read.md` R1 ("`verifySha(sha)` (`op=verify`): `{published, sha256, matches: [...]}`"): SPECIFIED as to the op. The statement the walker wants exists in the data: `publishedcase.verification.detail` says the deliverer is "this team's Civicsmith's record, not covered by any signature" (`publication/worker.mjs:152` `VERIFY_TEXT`). The page never reads `verification`, so a reader never sees it. So the defect is the page, not `verify`.

2. Why the tests missed it: `test/m/screens-publish/fixtures.mjs:74,227` give graded letters only, no `unrated`, `bar`, `successor`, `lens.closing` or `verification`; the requirement does not state the drawing.
3. Failing-first tests, all in `bio-plane/test/m/screens-publish/public.test.mjs` (the published page's tests), over a fake `publishedcase` carrying the REAL shapes copied from the record: (a) a finding with both axes `state: "unrated"` and `bar.declared: false` draws a "not graded yet" line per axis and a "no bar declared" line; (b) edition 1 whose answer has `successor: {edition: 2, statement: "The newer reading ..."}` draws that statement beside the link; (c) `lens.closing` of two sentences draws both under the lens heading; (d) the header text holds the case id, the manifest hash and the basis-version name; (e) `verification.detail` is drawn. The sentences are the UX design stream's (P5).
4. Owner: `screens-publish`. Requirement text to add to `screens-publish.md` R6 by BOB. Platform: no.

---

## C6. The imported case and its findings are named by raw ids (R98 imported screens, 4 rows; OVERLAY (15) "Imported case"). DEFECT

Rows: R98 imported-list at 1280 and 390, imported-case at 1280 and 390 (BROKEN by the walker's id check; they were otherwise clean: overflow 0, no console errors).

1. Root cause. Probe: list "Another team's CASE-2026-3549 walk10b-a · Edition 1 ..."; case page heading "CASE-2026-3549", finding "INQ-2026-0001-did-the-clerk-stamp-the-contract-before". The screen asks for titles that never arrive:
   - `bio-plane/src/screens-publish/imported.mjs:24` `cs.title(c ? (c.case && (c.case.title || c.case.id)) || c.case || c.import : null, ...)`, `:40` `cs.esc(f.title || f.finding || "")`, `:133` `(x.case && (x.case.title || x.case.id)) || x.case || x.import`: each falls to the id.
   - The plane: `bio-plane/src/case-import/index.mjs:857-867` `importedCase` answers `case: i.case_id` (a string) and `#editionView` (`:912-950`) maps `findings` as `{ ...f, ref, against_own_bar, own_lens, origin }` from `#recreationView` with no `title`. The title helper exists but only for the rerun read: `case-import/index.mjs:1308-1314` `#findingTitle` ("R31: ... from the `title` of its file's front matter in the imported edition; null ... never the id"), used at `:1341` in `#rerunView`. `case-import.md` R4 lists the fields of `importedCase` and names no title or scope. So the screen has no source for a name; a raw id is a defect (the brief's rule), not words.
   - Not the placed `later-ux.md:9` (rerunread titles on the project page): a different op.
2. Why the tests missed it: the screen's fake plane hand-writes titles the real plane never sends: `test/m/screens-publish/fixtures.mjs:107-109` `case: "Port lease revenue"` (a title where the plane sends `CASE-…`) and `import: "IMP-2026-0001"`; `fix3.test.mjs:312-316` the same. `case-import` tests check `importedCase` rows without a title (R4 names none).
3. Failing-first tests. `bio-plane/test/m/case-import/` (owning tests): after `importCase` of a real case file, `importedCase(...)` finding rows carry `title` (the finding file's front-matter title, `#findingTitle`) and the answer carries the case's `scope` (the case document's, which is what `published` calls the case's name); today both absent. Then `screens-publish/fix3.test.mjs`: fixture in the real shape (`case: "CASE-…"`, `scope`, finding `title`); the page shows the scope and title and neither id.
4. Owner: `case-import` (add `scope` to `importedCase`/`importedCases` and `title` to each finding of `#editionView`; R4 amended: BOB's detail); then `screens-publish` `imported.mjs` reads `scope` (`c.scope`) in the three places above. Platform: no.

---

## C7. A notice sentence names a case by its raw id on Home and the Queue (R213 home 1280/390/dark, queue-owner 1280/390; OVERLAY (15) "ids"). DEFECT

Rows: the five R213 screen rows are BROKEN only by the walker's id check (`forbidden` regex in the script, `CASE-\d{4}-\d{4}`), plus the OVERLAY ids entry for Home and Queue.

1. Root cause. Probe, Home and Queue visible text: "NOTICED A newer version of Council notice may change a passage CASE-2026-4006 relies on A newer capture of what this reference points to was read as similar text, so the passage has changed." (the same notice drawn twice: its other instance reads "Did the clerk stamp the contract before the vote? relies on", a question title). The sentence is `queue.newer-capture-affects-reference.summary` ("A newer version of {target} may change a passage {holder} relies on"), filled at `bio-plane/src/queue-producers/index.mjs:1503-1505`: `say("queue.newer-capture-affects-reference.summary", { target: titleOfTarget, holder: this.#nameOf(n.holder) })`. `#nameOf` (`:233`) is `this.#titleOf(id) ?? String(id)` and `#titlesOf` (`:210-218`) reads only `SELECT bundle_id, title FROM bundles`. The holder of a reference may be a published case (`reevaluation.md` R14: "A published case's owners are told once per affected or undetermined cited part"); a case is not a bundle, so its title is null and the id is drawn. The comment on `#nameOf` says "its title, else its id" and the walker's own case is exactly the "else".
2. Why missed: `test/m/queue-producers/words.test.mjs:447-453` fills `holder` with a question's title only.
3. Failing-first test: `bio-plane/test/m/queue-producers/words.test.mjs` (or `noticed.test.mjs`): a notice whose `holder` is a published case id (a case row in the store) must produce a `summary` that contains the case's scope/name and not the `CASE-` id; today the id. Through the door: `bio-plane/test/m/control-plane/walk10b-notices.test.mjs`: publish a case citing a captured page, capture a newer version, read `queue`/`home` as the owner, assert no `CASE-\d{4}-\d{4}` in the item summaries.
4. Owner: `queue-producers` (layer 11). Name a case holder by its scope (the case's reading name, as `screens-publish` `identity`/`scope` do) via the store's `cases`/`published_cases` rows; sentence unchanged (design stream's). Depends on the platform: no.

---

## C8. "Vouch for the 6 photos you captured" for documents and web pages (OVERLAY (15), D6). WORDS, ALREADY PLACED

1. `bio-plane/src/screens-daily/todos.mjs` `rowOf` draws `cs.w("screen.home.todo.vouch.noplace", { count })` ("Vouch for the {count} photos you captured", rows.mjs:8615, "DEC-360 (B371 1) ... a held capture with no address (an upload)") and the act label `act.release.label.home` "Vouch for photos" (rows.mjs:17679). The count and mechanism are right (six held captures of the member's own); only the word "photos" is wrong for documents.
2. Placed: `build/plan/later-ux.md:19` "Vouch rows · say "photo" for web pages and name a knock by raw id · setup-team S-04 · 2026-10-21". Tests: words rows are the design stream's; nothing to add here.
3. Failing-first test: none for BOB's modules (the stream's rows).
4. Owner: UX design stream (words); `screens-daily` draws them unchanged.

---

## C9. "Controls with no accessible name" on Home and the Queue (D7). WALKER-ERROR

No BROKEN row depends on it: the script's verdict is `overflow || errs || outside || bad` (script ~line 952); `noName` is only reported. The detector (line 942) tests `e.innerText.trim()` of visible buttons. Probe, flagged wrappers: `<span class="mk-actwrap"><button ... data-act="queuesnooze" ... data-f="qa-0" ...>Snooze to a date</button>`, `... data-act="taskdecide" ... data-f="qr-3" ...>Record my answer<span class="w">...`; `adoptversion` and `release` likewise. They are the `data-f` buttons the screens draw inside a closed `<details class="mk-details">` (`screens-daily/queue.mjs:117-121`, `todos.mjs rowOf`, `home.mjs:146-148`); closed content is not rendered, so `innerText` is empty although the label is in the button (`browser.mjs:674-709`). No defect, no test. The walker's script should skip controls in a closed `<details>`.

---

## C10. The case editor's request for the begun edition fails with a 404 (D10, R96 case-editor-next-edition 1280 and 390). DEFECT, minor

1. `bio-plane/src/screens-publish/case-editor.mjs:127`: `const doc = caseOf && caseOf.case_id && edition ? P.later(cs, view, "document", "casedocument", { query: { case: caseOf.case_id, edition: edition } }) : null;` where `edition` is the draft's `case.edition` (`:46`), the edition BEGUN (3), which has no document until it is prepared. The plane answers `caseDocumentFacts` -> `noCaseDocument(id, ed)` (`bio-plane/src/publication/index.mjs:1965-1975`, no row in `case_documents`), HTTP 404, and the browser logs "Failed to load resource: 404 /api/?op=casedocument&case=CASE-…&edition=3" on a normal load (the walker's only console error; the page still draws).
2. Why missed: the fake plane answers `casedocument` for any edition.
3. Failing-first test: `bio-plane/test/m/screens-publish/case-editor.test.mjs`: open the editor on a draft whose `editions` show no prepared edition (`chosen.editions.prepared` false, `case.edition` 3) and assert no `casedocument` call is sent for it (assert on the recorded plane calls); today one is. The walker's entry stays the Chromium row.
4. Owner: `screens-publish`. Fix: send the read only when `chosen.editions.prepared` or `published` holds for that edition (the same field line 141 already reads), else `doc = null`. Platform: no.

---

## Note

D13 and D14 of the record are in rows that read WORKS; not diagnosed. Paths and lines are `origin/tranche/T51` `d0fdba3e63` (the walker ran `8efbe1c055`; the lines read the same).
