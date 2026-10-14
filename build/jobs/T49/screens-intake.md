# screens-intake (T49)

**Status** · session_01DfJcVnWmWXDs839tKJcnve · depth 2 · COMPLETE · handled B6

## J1 · QUESTION

M-T49-5 measured (START line 1). Result: the project half can be done from what the screen writes; the "For which question" half (R25, and R22's "files it as `captured_for`") cannot. The provider line is owed through BOB (P9) before I build R25.

**1. Project placement (R22): works.** `heldcaptures` answers `project` from `bundles.project` (`capture/index.mjs`:970–1065). A promoted bundle's `bundles.project` is the top-level `project: <PROJ id>` line of its front matter (`promotion/index.mjs`:141–146, R53 `projectOf`; `record-core` `commit` writes it, line 960). So the screen puts `project: <the question's project, or the project opened as subject>` in `bundle.md`, and the held row shows it. I did not trace the project's Find `captures` count to its end; it reads the same column through membership's project fence, and I will assert it in a test against the real modules where the sandbox allows, else against a fake and say so.

**2. `lead_inquiry` and `captured_for` (R25): cannot, from what the screen writes.** Two independent reasons, both in `capture-requests`:
- R48's reader (`capture-requests/index.mjs`:1355–1371) answers `captured_for` only from requests with `target IS NOT NULL` and `state='captured'` and `capture_sha` among the document's captures. R48 says in terms: "`lead_inquiry` is not a question the document was captured for." So a `capturerequest` carrying only `lead_inquiry` can never make the held row name the question.
- A request becomes `captured` with its `capture_sha` only when the drain fetches it (R15, line 791). A member's own `acquire` just before or after never settles the request, and `drains: false` today (no unattended capture). So the immediate-`acquire` sequence cannot link the capture to the request at all, whichever field I send.

**Options (provider line):**
(a) `acquire` takes an optional `for` (a question id the member can see) and the capture side records it, so `captured_for` (capture R83) names that question for the document. The screen sends it, and sends no `capturerequest` for it. Smallest and truthful; `capture` and `acquisition` change.
(b) `capture-requests` settles a matching open member request when an `acquire` of the same address by the same member files a capture (sets `captured`, `capture_sha`), and R48 also reads `lead_inquiry`-only rows. Larger, two modules, and it keeps K3327's `lead_inquiry`.
(c) The screen sends `target` = the question instead of `lead_inquiry`. Fixes only the field; reason 2 still holds, so `captured_for` stays empty until the drain runs. Not enough alone.

Recommendation: (a). It is what Bob's DEC-245/246 need (the held row names the question; once vouched for it opens beside that question), and it keeps `capturerequest` as "Ask for this later" only.

**What I do meanwhile:** R21, R23, R24, R26, and R22's project filing by the front-matter line. I do not build "For which question" (R25 first part) or R22's `captured_for` expectation until you answer. R25's second part (refusals by key, `capture.fieldneeded`) I build now.

## J2 · QUESTION

Second question (it adds to J1, replaces nothing). R22 and R25 say the subject arrives as `/app/capture/<tab>?for=<id>`, and the result's "Cite a passage" opens `find-in` "with the question chosen". Neither can be done as written, from this module alone:

**1. The subject cannot be read.** A screen's `view` carries `subject` (the path after `/app/capture/`, which is the tab), `fragment` (sign-in tokens only) and nothing of the query string; the shell's `parse` reads the path alone (`interface-shell/browser.mjs`:714–720). My own tab links would drop a `?for=` as well. Options: (a) the subject rides the path: `/app/capture/<tab>/<id>`, so `view.subject` is `address/<id>`; no shell change; screens-inquiry R38 builds that link; the id says project or question by its prefix (`PROJ-`), as `find-in` already does. (b) the shell adds `view.query` and keeps it across routes (interface-shell change).

**2. `find-in` cannot be opened with a question chosen.** It takes its scope from its subject (a document id) and holds the chosen question in page memory (`find-in.mjs`:23, `ui.question`), lost on navigation. Options: (a) `/app/find-in/<document>/<question>`, screens-daily reads the second step into `ui.question` (a screens-daily change); (b) say nothing of the question and let the member choose it on `find-in`.

**My best reading, built meanwhile:** 1(a) and 2(a): `capture` reads `address/<id>` (and `file/<id>`, `saw/<id>`), keeps it on its tab links, and the result links `/app/find-in/<document>/<question>`. If you choose differently I change the one function that reads the subject and the one link.

**Words.** "Cite a passage" has no key for `capture`; `act.cite.label.question` and `act.cite.label.document` both hold that English. I draw it with `act.cite.label.document` (no key minted by me); say if the design wants a `capture` key instead.

## J3 · REPORT

Findings outside my module (none blocks COMPLETE; each is for the module or lane named). I built to the keys as `words.json` holds them at WORDS_COMMIT 8a54848a9e.

**1. `screen.archive.summary` cannot be drawn under R17 (design lane / words).** DEC-259 reworded it to hold all four counts in one sentence ("Opened when it was captured: {filed} files filed…, {held} already held, {notfiled} not filed, {folders} folders."). R17 forbids a count at zero, and an archive that opened often has zero in some of them. I draw the four `screen.archive.sum.*` phrases (each only above zero) joined, and do not read `screen.archive.summary`. Either the design gives a lead-in with a `{parts}` placeholder again, or R17 yields for this one sentence; your call.

**2. `screen.archive.alreadyheld` asks for `{name}` and `{date}`; `archivelist`'s `already_held` entry carries neither the earlier capture's name nor its date (acquisition R41, `unpack.mjs`:693).** I draw the sentence when the entry carries `held_at` (the earlier capture's instant) and otherwise "{count} already held" (`screen.archive.sum.held`, count 1). For the full sentence acquisition R41's `already_held` entry needs `held_at` (and the earlier capture's name if it differs from the entry's own); L3 is closed in T49, so this is for T50.

**3. `mark.gap.refused.means` in `words.json` is still the bare form** ("Refused: Civicsmith won't do this…"), not DEC-149's "your group's Civicsmith". `interface-shell` R5 kept a conformed override row in each drawing module until `WORD_ROWS` carries one; R26 removes mine, so the Refused mark now explains itself with the bare name. Design lane: conform the word.

**4. Two keys changed placeholders under DEC-259 and I conformed to them:** `screen.held.ineligible` now takes `{reason}` (filled with the class's sentence) and `screen.held.waiting` takes `{asker}` and `{capture}` (the set-aside document's title); the question's title is no longer drawn there. Retired (no longer read): `screen.capture.address.empty` (now `capture.fieldneeded`), `screen.capture.address.watch` (R18 drew no watching section), `screen.capture.refusal.BAD_LOCATOR/SOURCE_REFUSED/FETCH_FAILED/EMPTY/TOO_LARGE` (now `refusal.*`, R25), `screen.archive.summary` (item 1). Their rows can be dropped from the screens-intake `reads` list.

**5. A latent flaw in my own module, fixed:** `held` compared a row's `class` to lower-case "crucial"/"contested", while `ratification` answers `CRUCIAL_IN_BATCH`/`CONTESTED_IN_BATCH`, so every real refused row fell through to the catalogue's raw sentence (the very thing R23 forbids). It now reads the codes as they are served.

**6. Requirements wording for BOB (K3372, K3369):** R22 and R25 still say `/app/capture/<tab>?for=<id>`; as built the subject is the route's second step, `/app/capture/<tab>/<id>`. "Provides" still lists `SCREEN_WORDS`; the module no longer exports it (R26: no own sentences), and `words` on each screen are plain keys.

**7. `shell.unread`:** `interface-shell`'s own row reads "This could not be read." and `words.json` "This could not be read. Try again in a moment."; the shell's row wins today. My tests assert the failed state structurally for that reason. It resolves when the shell job drops its rows (its R70).

## J4 · COMPLETE

**Entries applied (T49-23).** Read whole: the requirements, the plan entry, the layer contract, all seven source files, `capture.test.mjs`, `held.test.mjs`, `page.mjs`, `common.test.mjs`, `archive.test.mjs`, `inbox.test.mjs`, `open-file.test.mjs`, `t48.test.mjs` (each carried English, so each was converted); of the used services, `setup-words`' `word`/`hasWord`, `interface-shell`'s `w`, `refusalOf`, `ref` and `SHELL_OPS`. The rest of the world was read only where an entry touched it (the sources named in J1).
- **R21** An upload's answer is promoted at `collected` by the one composition the address path uses (`promoteDocument`, a part of `capture`), "It waits" only once it answers; `existed: true` promotes nothing; a refusal, or one with no words (`shell.unread`), is drawn on the tab. Tests: the promote request over a real-shaped upload document; controls: refused promote, empty-worded refusal, nested `ok: false` (D29) at both steps.
- **R22 (project filing; `captured_for` waits for N1117, K3369)** The subject is the route's second step, `/app/capture/<tab>/<id>` (K3372), kept on every tab link. A project's id is filed as the bundle's top-level `project:` line; a question's project is read through `image` (its front matter). A question that states none files nowhere; one that cannot be read promotes nothing. The result offers "Cite a passage" (`act.cite.label.document`) to `/app/find-in/<document>/<question>`. Measured with the real modules in a scratch run (not committed): the promoted bundle's `record-core` `bundleInfo().project` is that project.
- **R23** The bundle carries `data/dataset.json`, a file under `snapshots/`, and a `content_hash` equal to the SHA-256 of the dataset's canonical JSON (capture grammar C-2.7 requires the match). Checked in a scratch run against the real `ratification` over the retrieval fixture: the composed upload bundle promotes and `release` answers `ok`; the same bundle without the dataset is refused `ENTRY_REQUIREMENTS` (the control). A held row's refusal is drawn from its class in the case `ratification` serves it (see J3 item 5), never the catalogue's text; `release`'s `CRUCIAL_IN_BATCH` and `ENTRY_REQUIREMENTS` are drawn by `refusal.*` with their `{count}`/`{offenders}` filled (the shell would have left the placeholders open).
- **R24** The result links the document (`cs.ref("document", bundle, title)`); no link for a refused promotion or an `existed` upload. Tested with a stand-in `document` screen so the reference is the link it is on the whole page.
- **R25 second part** `refusal.BAD_LOCATOR`, `SOURCE_REFUSED`, `FETCH_FAILED`, `EMPTY`, `TOO_LARGE` by key; an empty address draws `capture.fieldneeded` with the address label, on acquire, capturerequest, monitorset and monitor. **R25 first part ("For which question") not built** (not yet met: T50, K3369).
- **R26** `words.mjs` deleted; no `SCREEN_WORDS`; each screen's `words` is the frozen list of keys it reads (`SCREEN_KEYS`, 76/59/46/57/34), every one asserted with `hasWord`; no test holds a sentence's English (each asserts `word(key, vars)`). Left inline: the size units "B/KB/MB" (not sentences; the reads census counts none).
- **Rule 6:** N1068 nothing member-facing here (the words are the design's); `admin` grep: no founder id reaches a reader (the one hit is the `administer` capability gating `scanstatus`); N1073 `common:121`'s frame-ops list now reads `SHELL_OPS`; D29 by the controls above, no op of this module answers `started`/`dispatched: false`/`withheld`.
- **Flaws fixed in my own module (P8):** the lower-case class comparison in `held` (J3 item 5); a refusal with no words was drawn as nothing (a silent tab) and now draws as failed.

**Deferred.** Nothing in my module. R25 first part and R22's `captured_for` wait on N1117 (T50). Items 1–3 and 7 of J3 wait on the design lane or acquisition.

**Found in other modules.** J3 (REPORT), items 1–4, 6, 7.

**Tests and checks** (from the process repository, `/home/user/bio` as the product):
- `node --test bio-plane/test/m/screens-intake/`: tests 80, pass 80, fail 0, against the merged `setup-words` (WORDS_COMMIT 8a54848a9e). No layer tests are named for layer 11.
- `format`: 170 modules, 169 requirements files; 0 failures. `architecture screens-intake`: 14 product files, 36 relative imports; 0 failures. `coverage screens-intake`: 26 of 26 live requirement ids named by a test; 0 failures. `ownership screens-intake tranche/T49`: 14 files changed by screens-intake; 0 failures.
- `node checks/run.mjs`: architecture 3357 product files, 0 failures; coverage fails for 14 other modules (their own T49 ids, in progress); none for screens-intake.

Size (session_01DfJcVnWmWXDs839tKJcnve): test runs 16, module lines 1112

## J5 · COMPLETE

B5 processed: merged tranche/T49 (DEC-259–261 words). I draw none of the keys whose placeholders changed (archive.summary is still not read, J3 item 1; held.waiting's `{asker}`/`{capture}` is what I fill). Two tests followed the new words, no module code changed: a code that now has a `refusal.*` word (REQUIRED_ARGUMENT_MISSING) is drawn by it, so the shell-rule control uses a code with none; the shell's "nothing is here" sentence differs between its own row and `words.json` until the shell drops its rows, so that test checks the element, not the sentence. Tests 80 pass; coverage 26 of 26, ownership 0 failures.

Size (session_01DfJcVnWmWXDs839tKJcnve): test runs 18, module lines 1112
