# Causes of walker B's Find and document findings (deployed code 7b5ace1d19, copy biosmoke8, measured 2026-10-26 ~07:0xZ)

All measurements are read-only calls as the member (sign-in screen, JOURNEY_MEMBER_* variables; no value printed). Local reproductions run in the scratch worktree /tmp/claude-0/-home-user-bio/511139f8-7e1c-5cba-bd58-747d5370d852/scratchpad/diag-find (detached at 7b5ace1d19), using the module's own kit (`bio-plane/test/m/retrieval/fixture.mjs`, whose storage already refuses more than 100 bound variables, `PLANE_VARIABLE_CEILING`, as workerd does). Repro tests: `bio-plane/test/m/retrieval/zz-repro.test.mjs`, `zz-repro2.test.mjs` (scratch only, not product).

Shared causes: F-B8 stands alone. F-B9 and F-B10 (first part) share one cause (the screen asks the passage question only for a plain-words query, and asks the widening only of the fields question). F-B11 and F-B14 share a class (a refusal/level sentence drawn raw from the plane, no screen-side member rewording), not a line. F-B14 and F-B15 are both in the safe-view path but have different causes.

---

## F-B8 BLOCKER: a common word answers 502 STORE_DID_NOT_ANSWER

**Cause.** `kindsOf` in module `retrieval`, `bio-plane/src/retrieval/units.mjs:12` (`IN_CHUNK = 100`) and `:29-31`: it reads each hit's part kind with `WHERE (capture_sha, extent_kind, extent) IN (VALUES (?,?,?), ...)` and binds THREE variables per unit, so a chunk of 100 units binds 300 variables. The plane's ceiling is 100 bound variables a statement (D-36; workerd). The chunk size was written for one-variable lists (`unitsByRowid`, `partialReads` at `:44`, `:73`, 100 x 1) and copied to a 3-variable tuple. It is called from `#namedRows` (`bio-plane/src/retrieval/index.mjs:1002`) on the rows of every `op=meaningrows&rows=passage` answer, after the count and rows statements have already succeeded; the SQL error throws out of the Durable Object, the store answers non-JSON/500, `doAnswer` (`bio-plane/src/answer-envelope/index.mjs:279-292`) turns it into `storeSilent` (`:305-308`), 502 `STORE_DID_NOT_ANSWER`. The screen asks `limit: "200"` (`bio-plane/src/screens-daily/finder-states.mjs:125`), so any word with 34 or more matched passages fails; 33 or fewer work. That is why "rare words work" (1 to 20 passages).

**Evidence, live (member, `op=meaningrows&q=passage:<w>&rows=passage`):**
- `budget` limit=200: 502 in 1172 ms (`meaningrows;dur=931`, `do-meaningrows;dur=761`); `council` 502 (668 ms); `alpha` 502 (234 ms); `ordinance` 502 (1127 ms). Always 502, `bytes-meaningrows=560` (the silence body).
- The same words with `limit=1`: 200, `meaningrows;dur` 155 to 217 ms; totals held: `budget` 1773 passages, `council` 1767, `ordinance` 1794, `alpha` 45 (the copy holds 83 documents with indexed text, `op=search&q=passage:*&mode=count` total 83; `budget` is in 60 documents).
- `budget` by limit: 20 -> 200 (`dur=275`, 20 rows), 30 -> 200, **33 -> 200 (`dur=309`, 33 rows)**, **34 -> 502**, 40, 60, 100 -> 502.
- `zzzqqq` (0 matches) limit=200: 200, `dur=157`.
- So no CPU, wall, subrequest or LIMIT bound ends it: failures come in 234 to 1172 ms (CPU bound is 300000 ms, `MEMBER_LIMITS`), and a call of 309 ms with 33 rows succeeds while a 335 ms call with 34 rows fails. The bound is the 100-variable ceiling: 34 x 3 = 102 > 100; 33 x 3 = 99.

**Evidence, local (module's own kit, `withKindColumn()` as the live store, which has the `kind` column: `bio-plane/src/extraction/index.mjs:182`):** `meaningRows({q:"passage:budget", rows:"passage", limit:200})` over N matching units: N=10 ok, 33 ok, **34 throws "too many SQL variables"** (stack: `fixture.mjs:61` <- `retrieval/index.mjs:215 #rows` <- `retrieval/index.mjs:1002`), 50, 200, 300 throw. Same threshold as live. Without `withKindColumn()` (`hasKind` false, units.mjs:18) the query is never built, which is why every existing test passes: `withKindColumn` is used only by `t51-round9.test.mjs` with a handful of units.

**Owning module.** `retrieval` (units.mjs introduced by c45696fc36, 2026-10-24, T51 round 9, R94-R97). The screen (`screens-daily`) only asks for 200 rows, correctly.

**Smallest fix.** In `kindsOf`, chunk by 33 units (3 variables each; or bind a single `json_each(?)` value, the D-443 precedent at `publication/index.mjs:2824`), i.e. `const KIND_CHUNK = 32` for the tuple query; leave `IN_CHUNK = 100` for the one-variable reads. Nothing else changes.

**Test that would have caught it, at retrieval's interface.** `meaningRows({q:"passage:w", rows:"passage", limit:200})` over 200 and over 34 units in a world with `withKindColumn()`; assert `ok`, `count` equals the units, every row has `kind`. (Run on the kit whose storage refuses over 100 variables, which it already does.) Also a general guard: a retrieval test that runs every op at the maximum `limit` over more than the largest chunk, since a limit of 200 is what the screen sends.

---

## F-B9 MAJOR: `OR` and quoted phrases send no passage search

**Cause.** Module `screens-daily`, `bio-plane/src/screens-daily/finder-states.mjs`:
- `:8` `word()` accepts only a bare word and refuses `AND|OR|NOT|NEAR`; a quoted phrase token (`"alpha-B-1-p1-l1`) fails the pattern too.
- `:109` `plain = w.every(word)` is false for any query with `OR` or a quote.
- `:111` `written = plain ? null : (every token starts with "passage:") ? "passages" : "fields"` -> a query with no `passage:` term is "fields".
- `:112` `want = plain ? ["fields","passages","subjects"] : [written]` -> only `["fields"]`; `:125` the `meaningrows` call is started only when "passages" is wanted. `:205-213` then draws "Nothing your team holds matches ..." from the fields answer alone.
The query language is the plane's: the plane would answer these (measured below). The screen decides by itself, from the shape of the text, that a query is not a passage question.

**Evidence, live.** The screen sends only `op=search` for `ordinance OR zzzqqq` (200, fields: total 3, `widen` null) and `"alpha-B-1-p1-l1 council"` (200, total 0). The same intent asked of passages: `op=meaningrows&q=passage:ordinance OR passage:zzzqqq&rows=passage&limit=5` -> 200, total 1794; `q=passage:"alpha-B-1-p1-l1 council"&limit=5` -> 200, total 1, count 1 (the PDF passage walker B named). Even the bare `ordinance OR zzzqqq` with `rows=passage` -> 200, total 1794. The subjects route (`subjectsnamed`) is skipped the same way.

**Owning module.** `screens-daily`.

**Smallest fix.** In `routes()`: for a query with no field terms (no `name:value` token), start the passages (and subjects) routes too; build the passages query by prefixing each term and quoted phrase with `passage:` and keeping `AND/OR/NOT` and parentheses as they are (or send the text as is; `rows=passage` already reads bare terms as passage text, measured). Keep "fields" as is. Show a route that is skipped as such, never a false "nothing".

**Test at the module interface.** `screens-daily` finder state: for `q = "ordinance OR zzz"` and `q = '"a b"'` assert the call list contains `meaningrows` with a query holding the same operator/phrase; and that when fields answers 0 and passages answer n > 0 the screen does not draw `screen.finder.noresult`.

---

## F-B10 MAJOR: an AND that finds nothing offers no wider reading; NOT shows a count with nothing to open

Three causes.

(a) **Widening is asked of the wrong question.** `op=search` computes `widen` (the OR reading of an implicit AND) in `bio-plane/src/retrieval/index.mjs:896-903` for the fields/bundle question only. `meaningRows` (`:945-993`) has no widening at all. The screen reads only `f.value.widen` (`finder-states.mjs:209-210`, `f` = the fields route). A query whose words are only in passages (`alpha-B-6-u3-kbody zzzqqq`) has fields total 0 and the OR count over fields is 0, so `widen` is null (`:901` `if (n > 0)`), and the screen says plain "Nothing ... matches".
  Live: `op=search&q=alpha-B-6-u3-kbody zzzqqq` -> total 0, `widen` null; `ordinance zzzqqq` -> total 0, `widen` total 3 (the three documents whose titles/notes hold "ordinance", fields only; the 1794 passages holding it are not counted). Owner: `retrieval` (no passage-grain widening) and `screens-daily` (never asks). Requirement gap: `screens-daily` R78 (`build/requirements/screens-daily.md:207`) and `retrieval` R9 (`build/requirements/retrieval.md:38`) specify only a count and the partial sentence; neither says what the member can open, so BOB should say whether UC-001's "widening" must list the documents.

(b) **The count with nothing to open.** `finder-states.mjs:213` draws `screen.finder.widen` ("Documents holding at least one of the words: {n}.") as a note: no list, no button. Owner `screens-daily`. Smallest fix: draw a button "Show documents holding some of the words" that re-runs the three routes with the query's words joined by ` OR ` (which the plane already answers, see F-B9; `op=search` has no `implicitOp` parameter, `retrieval/index.mjs:1812-1821`, so the screen does the joining).

(c) **The NOT case's "109" does not narrow anything: it is the whole record.** `retrieval/index.mjs:897-898` re-compiles the query with `implicitOp: "or"`; `query.mjs:1388` (`{ op: implicitOp, kids }`) then ORs the `NOT zzzqqq` atom with the words, and `NOT x` matches every document. `widenable` (`query.mjs:2395-2396`) accepts a conjunction with a `not` kid. Owner: `query-language` (the OR reading must keep NOT as an exclusion, or `widenable` must be false when a kid is `not`), with `retrieval` calling it. 
  Live: `op=search&q=council NOT zzzqqq alpha-B-1-p1-l1` -> total 0, `widen.total` 124 (109 when walker B looked; the copy grows); the record's documents are all. Local (kit, 6 documents, 3 hold "council"): `council NOT zzzqqq alphaonly` -> total 0, `widen.total` 6 (every document); `council zzzqqq` -> `widen.total` 3 (correct).

**Smallest fix (c).** `widenable` false when any kid is a `not`; or build the OR reading as `(positives joined by OR) AND NOT (negated)`.

**Tests.** `query-language`: for "a NOT b c" the OR reading, run on a set where "a" is in half the documents, counts only documents holding a or c and not b. `retrieval`: `search` with an AND of two words found only in passages, assert a widening exists at passage grain (when the requirement says so). `screens-daily`: no result + widen 2 draws an act that opens them.

---

## F-B11 MAJOR: "What this search covered" shows `content:cited` / "the meaning level" / "rows"

**Cause.** The sentence is the plane's own, written in the retrieval module's words: `bio-plane/src/retrieval/levels.mjs:105` `{ state: "UNDETERMINED", why: say("retrieval.why.finding_rests_rows") }`, key listed at `bio-plane/src/retrieval/words.mjs:59`, text in `bio-plane/src/setup-words/rows.mjs:15470`: "whether any finding RESTS ON these rows is the meaning level. `content:cited` and `content:uncited` answer it over this same set, and the `cited` column on each row says it per row". The screen draws it unchanged as the row "Findings and connections": `bio-plane/src/screens-daily/finder-states.mjs:228` takes `levels.meaning.why`, `:231` draws it inside `state.undetermined` ("Undetermined, because {reason}"). The row (rows.mjs:15470) is marked `"design"` and `retrieval/levels.mjs` says it is "ONE SENTENCE a surface can render without composing it itself", but it is a developer sentence (query syntax in backticks, "rows", "the meaning level").
Live: `op=meaningrows&q=passage:budget&rows=passage&limit=1` `levels.meaning` = `{state:"UNDETERMINED", why:"whether any finding RESTS ON these rows is the meaning level. `content:cited` ..."}`, same text the walker saw.

**Owning module.** `retrieval` (the words row is its, "surface renders it as is"); `screens-daily` draws it with no guard. Other `why` rows of `levels.mjs` should be checked the same way.

**Smallest fix.** Reword `retrieval.why.finding_rests_rows` in member words (for example "nobody has yet said whether a finding rests on these passages; the Cited column on each passage says it for that passage") with no backticks, no query syntax and no level names; keep the machine-facing wording in a separate key for the op's consumers.

**Test.** `retrieval` (words test): no `why` of `levels` contains a backtick, a `field:value` token or the words "level"/"rows". `screens-daily`: the covered section drawn for a plane answer holds no backtick.

---

## F-B14 MAJOR: a Word file's safe view says "The reason is stated beside it" with no reason

Two parts.

**(1) Why the reason is not drawn.** `bio-plane/src/screens-intake/open-file.mjs:205-213` (module `screens-intake`): for `SAFE_VIEW_FAILED` the screen draws the refusal's `translation` alone (`words ? { text: words }`), and a figure sentence only when `renderer_reason` is `TOO_LARGE` or `PREVIEW_NOT_DRAWN` (`:212`). The translation itself is `refusal.SAFE_VIEW_FAILED`, `bio-plane/src/setup-words/rows.mjs:13470` ("The safe view of this file could not be made. The reason is stated beside it. The original is unchanged."), whose "beside it" is the refusal's `renderer_reason`/`renderer_detail` (`bio-plane/src/file-safety/index.mjs:1062`), which no line of the screen draws for any other reason. Owner of the missing drawing: `screens-intake`; owner of a sentence that promises something the caller must supply: `file-safety` (words).

**(2) Why the renderer refuses.** Measured on the copy (member, `op=safeview`):
- Both held Word files (captured 2026-10-25 05:36Z and 05:48Z): `SAFE_VIEW_FAILED`, `renderer_reason` `NOT_RENDERABLE`, `renderer_detail` null.
- The held PowerPoint (captured 2026-10-26 06:54Z, after the redeploy): `SAFE_VIEW_FAILED`, `NOT_RENDERABLE`, `renderer_detail` = "Warning: failed to launch javaldx - java may not function correctly / Error: source file could not be loaded". That is LibreOffice's own message (`bio-plane` stores it from `file-scanner/container/renderer.mjs:221-222`, `refuse(res, 422, 'NOT_RENDERABLE', msg)` when `soffice --convert-to` writes no PDF): LibreOffice 7.4.7 in the deployed renderer container (`op=scanstatus` as administrator: `renderer.version` "libreoffice 4:7.4.7-1+deb12u14; poppler-utils 22.12.0-2+deb12u3") cannot load the office file. The PDF route (poppler only) works: 12+ held PDFs and the scanned PDF return `application/pdf` safe views.
- The null detail of the two Word rows: `file-scanner/src/render.mjs:59` dropped a `NOT_RENDERABLE` message until commit eb487002ea (2026-10-25 09:17Z, "NOT_RENDERABLE message reaches the answer"); both Word rows were recorded before it, and a render failure is stored FINAL (`file-safety/index.mjs:1138 #renderFinal`, "never tried again"), so the old row without detail is still served. The other message-less path, `renderer.mjs:209` (`if (info.limit)`, message removed in 1a66336966), is not what happened: the generator's docx has 4 zip entries and a 1166-byte directory against bounds 10000 and 16 MiB; run locally through the renderer's own `officeInfo` it answers `{app:"writer"}` with no `limit`.
- Not reproduced: the same generator docx/pptx (`bio-plane/test/corpus.mjs`, kinds docx and pptx, size 10) converted locally with the renderer's exact argv (`soffice --headless --norestore --nolockcheck --nodefault -env:UserInstallation=... --convert-to pdf:writer_pdf_Export:{"PageRange":...}`, file renamed `source.docx`, `env -i PATH HOME=dir`) succeeds with LibreOffice 24.2.7 here. So the code of the renderer is right for these files; the failure is in the deployed container's LibreOffice 7.4.7 environment (`file-scanner/Dockerfile.renderer`: only `libreoffice-core`, `-writer`, `-impress`, installed `--no-install-recommends`, `USER node`). The proof of which missing piece needs one run of the pinned image (`docker.io/civicsmith/file-scanner-renderer@sha256:2e86dc54...`) on `g.docx`; I could not run the image in this session, so the in-container cause is **measured as "LibreOffice cannot load the file" and not further proven**.
- Walker B's own Word file (vouched, so no longer in Held) could not be listed; the conclusion rests on the two held Word rows and the PowerPoint.

**Owning modules.** Drawing: `screens-intake`. Words promise: `file-safety`. Renderer environment: `file-scanner` (Dockerfile.renderer / packages-renderer.json) with `bundler` for the pin. Stale final row: `file-safety` (a failure recorded without a detail under the older Worker is final and never retried).

**Smallest fix.** (i) `screens-intake`: for `SAFE_VIEW_FAILED` draw `renderer_reason` through a held word (`refusal.render.reason.*`, the table `screens-inquiry/document.mjs:537` already uses) and, when there is none, the sentence without "stated beside it"; (ii) `file-safety`: reword `refusal.SAFE_VIEW_FAILED` so it does not point at text that may not exist; retry once, on the next ask, a final row whose `render_detail` is null (so rows recorded before eb487002ea heal); (iii) `file-scanner`: run the pinned image on the corpus docx/pptx, find the missing piece (the install uses `--no-install-recommends`; compare with `libreoffice-writer`'s needs, fonts, and `HOME`/profile write), add it to `packages-renderer.json`, rebuild and redeploy the image.

**Test.** `screens-intake`: a `SAFE_VIEW_FAILED` answer with `renderer_reason: "NOT_RENDERABLE"` draws a reason and never the phrase "stated beside it" when none is drawn. `file-scanner`: the existing `render.test.mjs` cases run only `{ skip }` when LibreOffice is absent from the test machine; add a test that converts a generator docx and pptx in the built image (`rendererImage`) and that it is part of the release gate, since the unit test here passes with LibreOffice 24.2 and the shipped image has 7.4.7.

---

## F-B15 MAJOR: a picture says "Read it in the safe view below", then "no safe view"

**Cause.** Module `screens-intake`, `bio-plane/src/screens-intake/open-file.mjs`: the safe-view section is built unconditionally (`:108-111`, the "Show the safe view on this page" act whatever the file's format) and the "next" sentence `screen.open-file.next.yours` ("Read it in the safe view below. To open the original itself, ask for a deeper check first.", `setup-words/rows.mjs:5491`) is drawn for every "high" file the member added herself (`:123`, `yours` = `kind==="high"` and a `source_not_fetched` reason), with no look at the format. The plane knows the answer: `file-safety` `safeView` refuses `NO_SAFE_VIEW` for any format without a route and not UTF-8 text (`bio-plane/src/file-safety/index.mjs:1033-1035`; `ROUTE` table `file-safety/formats.mjs:30-33` lists only pdf, docx, pptx, odt, odp, xlsx, ods, csv), and the threat answer carries the `format` (`file-safety/index.mjs:837`). The screen only learns it after the button, `:213` -> `refusal.NO_SAFE_VIEW` (`rows.mjs:13350`: "... this file is none of them, so it has no safe view").
Live: a held PNG, `op=safeview` -> `NO_SAFE_VIEW`, `format: "image"`. By design pictures get no safe view (file-safety R11 refusal list), so the contradiction is in the screen's sentences, not in the plane. (Whether a picture should have a safe view is Bob's question; the requirement says no: `build/requirements/file-safety.md:43`.)

**Owning module.** `screens-intake`.

**Smallest fix.** When the threat answer's `format` has no route (image, html, other), do not draw the safe-view section's act or the "Read it in the safe view below" sentence; say in its place that this kind of file has no safe view and how to read it (ask for a deeper check; open on a device after the warning). Use the same table as the plane (ask the plane, `format` from `threatof`, rather than a copy of the list in the screen).

**Test.** `screens-intake` (open-file): for a threat answer with `format: "image"` and a `source_not_fetched` reason, the page holds no `screen.open-file.next.yours` and no `data-act="safeview"`; for `format: "docx"` it holds both.
