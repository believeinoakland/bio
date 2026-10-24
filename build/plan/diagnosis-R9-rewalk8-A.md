# Diagnosis, round 9: re-walk 8, area A (G110, G114, G118 still; N1 new)

For BOB. Read: `build/plan/walk-T51-rewalk8/A.md` whole; `fix-round-8-T51.md` sections G110, G114, G118 whole; `build/jobs/T51/screens-intake.md` (B43). Code read on `origin/tranche/T51` at 04c5b6b4ce (the walked copy, commit 234c07d230, is its ancestor; no product file changed between them). Reproduced in a throwaway worktree (`/home/user/wt-diagA`, removed at the end) with temporary tests that were not kept. Nothing live was contacted. Paths below are under `bio-plane/src/` unless stated.

---

## 1. G110 STILL: the Document page draws the renderer's words (certain)

**(1) Root cause, certain (reproduced).** Round 8 fixed the wrong screen. The sentence the walker quotes, `89 / 241 · the renderer did not deliver ... ×152`, has the form `{kept} / {total} · {reason} ×{count}`. That is the Document screen's draw, not the Add screen's (the Add screen's form is "{kept} of {total} supporting files kept", `screens-intake/capture.mjs:360-375`). The plan (G110) named the Add screen's `supportingLine` and "screens-intake ALONE", although the row it quoted (rewalk7 A.md:24, G72) was already of the Document form.

The Document page draws it at `screens-inquiry/document.mjs:305-318` (G19, fix round 6):
- `document.mjs:308` reads the register document's `capture.supporting` (the same object acquisition writes: `acquisition/index.mjs:1767` into the capture's facts, built by `supportingOf` :2015-2049).
- `document.mjs:314`: `String(r.detail || r.reason || "") + " ×" + r.count`. `detail` first. Acquisition gives `BODY_NOT_KEPT` the browser's own words as `detail` (`acquisition/index.mjs:2031`, from `render.mjs:343` and `browserrender.mjs:233-237`). So 152 skipped bodies print the machine words verbatim.
- `document.mjs:313,315` also push `sup.not_walked` raw. It is a bare code (`stopped`, `acquisition/index.mjs:2033`, e.g. `RENDER_PENDING`, `PRIMARY_TOO_LARGE`), also drawn as a code.
- Round 8's fix (`supportingLine`, `capture.mjs:360-375`) is the sibling that was fixed; the Document draw has no shared code with it and was not touched. Elsewhere `supporting` is not drawn (grep over all screens).
- Why 152 not 90: only the number of bodies the renderer lost differs between records; the draw is identical.

Reproduction through the real screen (`screens-inquiry` fixtures, the provenance document holding `capture.supporting` with the real words from the table):
```
DRAWN: 89 / 241 · the renderer did not deliver this response's bytes (the browser would not give the body: CDP No resource with given identifier found), so none were kept ×152
✖ true !== false   (assert: no /CDP|No resource with given identifier|renderer did not deliver/)
```
That is the walker's line character for character.

**(2) Why round 8's tests missed it.** The G110 failing-first (`screens-intake/r8-supporting.test.mjs`) drives only the Add screen. The Document screen's own test, `screens-inquiry/fr6-document.test.mjs:198-207`, PINS the defect: it feeds `detail: "50 files were over the 8 MiB a file may be"` and asserts the page includes that text, and asserts `not_walked: "PRIMARY_TOO_LARGE"` is drawn as the code. The plan's G110 section also said no acquisition or Document test was needed. A grep of the screens for `supporting` would have found both draws.

**(3) Failing-first test (walker's exact case, real entry path).** `bio-plane/test/m/screens-inquiry/r9-supporting.test.mjs`, owner screens-inquiry: open `/app/document/<id>` on `interface-shell`'s served page (as `fr6-document.test.mjs` does) with a provenance document whose `capture.supporting` is `{kept: 89, skipped: 152, total: 241, reasons: [{reason: "BODY_NOT_KEPT", count: 152, detail: <the real word("render.renderer_deliver_response", ...) text>}, {reason: "CAP_REACHED", count: 3, limit: 400}, {reason: "TOO_LARGE", count: 2}], not_walked: "RENDER_PENDING"}`. Assert the drawn text holds `screen.capture.supporting.kept` and one sentence by code key per kind (the rows exist, `setup-words/rows.mjs:11179-11182`), and matches none of `CDP`, `No resource with given identifier`, `renderer did not deliver`, `RENDER_PENDING`. Red today (output above). The old `fr6-document.test.mjs:198-207` assertions on `detail` and on the raw code are amended in the same job (they pin the defect). Control: nothing skipped draws nothing.

**(4) Platform check N** (the screen is built in the test harness; the same function serves live). Owner: **screens-inquiry** (`screens-inquiry/document.mjs:305-318`). Shape for BOB: the code to sentence mapping is the Add screen's (`capture.mjs:367-373`); two copies is what let this slip, so one shared mapping in screens-intake that screens-inquiry already `uses` (modules.json) is the clean place. Wording for `not_walked` codes needs rows (`later-ux.md`), a stand-in until then.

---

## 2. G114 STILL: no cache headers on the words answer (certain, reproduced)

**(1) Root cause, certain.** It is not "this copy holds no translation". It is "the viewer has no language set": `result.language` is `null`. The owner's answer then is `{"ok":true,"result":{"ok":true,"language":null,"words_version":"0.0.0","words":[]},...}` (`translations/index.mjs:727-739`, `tag = null` when `#ownLanguage` is null; bootstrap states `language: null`, the walker's own words). The door's word-cache then touches nothing:
1. `control-plane/index.mjs:907` calls `interfaceWordsCache`.
2. `words-cache.mjs:48-56` `fieldsOf` finds a field only when its value is a JSON string (regex at :50, `("(?:[^"\\]|\\.)*")`). `"language":null` does not match, so `language` is `undefined`.
3. `words-cache.mjs:61`: `if (language === undefined || ...) return whole ? { kind: "other" } : null`. The answer is small (335 B), so the whole body is in the 8 KiB peek: `{kind: "other"}`.
4. `words-cache.mjs:86`: `if (seen.kind !== "words") return {res: new Response(body, {... headers: res.headers}), table: false}`. The answer leaves exactly as the object made it: no `cache-control`, no `etag`, no `vary`, not gzipped by the door; `table:false` so the tallies also read it whole (:142-163).
5. A second, independent barrier sits behind it. Had step 2 read null, `words-cache.mjs:88` (`stated` needs a string `language` matching `PART` = `^[^~\s]{1,64}$`, :17) rejects null/empty, so `key` is null (:89) and the answer would get only `private, no-cache` (:104), never the year. But the shell names an empty language part when the viewer has none: `v = <release>~~<stamp>` (`interface-shell/browser.mjs:2638-2639, 2663-2668`, `noteWords` stores `l: ""`; R127's own text, "the language an empty part when the viewer has none"). So the key the shell sends can never equal a key the door builds for such a viewer.

Reproduction (the real Worker under Miniflare, the plane's default export wrapped, a signed-in administrator with no language; `v` as the shell sends it):
```
BOOTSTRAP language= null words_version= "0.0.0"
v= 4.8.1~~0.0.0   status 200 cache-control= null vary= null etag= null body= {"ok":true,"result":{"ok":true,"language":null,"words_version":"0.0.0","words":[]},"store":"bio","tokenClass":"admin"}
v= 4.8.1          status 200 cache-control= null vary= null etag= null
(control: language=es, v=4.8.1~es~<stamp>: cache-control= private, max-age=31536000, immutable)
```
The walker's observation is reproduced exactly (no `cache-control`, `vary`, `etag`).

Could the browser cache it? No. With no `cache-control`, no `expires`, no `etag`, no `last-modified`, the browser has no freshness lifetime and nothing to revalidate with, so the next sign-in is a full 200 (what the walker saw: 505 B, "not from cache"). For a viewer WITH a language, the headers are right (control above), and the existing test proves it. So the fix is right for the case round 8 tested and absent for the case the walker's account is in. (The walker's note "`cs-words:` never stored" is not settled by reading: `noteWords` (`browser.mjs:2663-2670`) stores `{l:"", s:"0.0.0"}` when `bootstrap` states `words_version`; I did not run the shell. The door-side cause above stands whatever the shell stored.)

**(2) Why round 8's tests missed it.** `control-plane/r8-words-cache.test.mjs` builds every owner answer with `language = "es"` (its `wordsOf` default, :12) and its "no language" case (:78) only sends `v` with an empty part to an answer of `es` (to show it is not kept). `r8-words-door.test.mjs` sets `memberlanguageset es` first (:50-52). No test had a viewer with NO language, the state of a new member and of the journey administrator.

**(3) Failing-first test.** Two: (a) `control-plane/r9-words-no-language.test.mjs` (the unit seam beside `r8-words-cache.test.mjs`): owner answer `{ok:true, language:null, words_version:"0.0.0", words:[]}`; `v = <release>~~0.0.0` is answered `private, max-age=31536000, immutable` with an `etag` and `vary: Accept-Encoding`; the same `v` with `if-none-match` is a 304 with no body; `v` = release alone is `private, no-cache`; for the whole-body-in-peek AND for a body past 8 KiB. Red today: no headers at all. (b) the Miniflare door (beside `r8-words-door.test.mjs`): a member who has set no language, two sign-ins, same `v`, the second `if-none-match` answered 304. Red today (output above). The shell side (`interface-shell/r8-words-version.test.mjs`) is unchanged.

**(4) Platform check P** (a second sign-in of the journey administrator, who has no language, answered from cache on biosmoke) and **N** for the headers. Owner: **control-plane** (`words-cache.mjs:50, 61, 88-89`). BOB's detail to rule: a null language is the empty part in the key (`<release>~~<stamp>`), matching what the shell already sends. Requirement R127 should say so.

---

## 3. G118 STILL: the 60 s fleet keep misses (mechanism NOT settled; the scope of the keep is the cause class)

**(1) What is certain.**
- The keep exists and works in one isolate. `setup.mjs:160-186` (`keptParts`, a `WeakMap` keyed by the `env` object; `PARTS_KEPT_MS` 60 s, :159); a call finds the entry at :178-181 (`at - held.at < PARTS_KEPT_MS`) and `bootstrapReport` states `fleet;dur` as 0 when `kept` (:3189). Reproduced through the real Worker (Miniflare, fleet bindings answering after 300 ms), ten `op=bootstrap` calls 1 s apart:
```
0 wall 325 fleet: 309 facts: 1 asked {"agent-worker":1,"file-scanner":1}
1..9 wall 10-14   fleet: 0                    asked {"agent-worker":1,"file-scanner":1}   (never asked again)
```
- By the code, a call can report a non-zero `fleet` only if `keptParts.get(env)` held no live entry for the `env` it was handed (:178-181). Within 60 s of an earlier answer in the same environment that is impossible. The walker's ten calls spanned about 25 s and 6 reported 423-662 ms, 4 reported 0. So the 6 misses were calls to an environment that had not answered in the last 60 s: other isolates (or another `env` object). Because 4 calls did hit, the `env` object is stable within an isolate (`phase-clock.mjs:166-190` makes the clocked environment once per `env`); the misses are calls reaching isolates that held no entry.
- The keep is isolate memory. A Worker is served from many isolates (one or more per machine and colo, more under concurrent load; walker B's traffic was concurrent); each pays the fleet ask once. A per-isolate memory keep cannot make "at most once a minute" for the copy; it makes "at most once a minute per isolate".

**What I did not settle (so "cause unknown" in the strict sense for the mechanism).** I cannot show from code or from a local run how many isolates the platform used or whether a given call came from a fresh one: Miniflare has one isolate. `bootstrap` carries no isolate identity (`isolate_ms` is only in the `request_start`/`request_done` log lines for `acquire`/`captureupload`, `control-plane/index.mjs:883-892`, from `ISOLATE_STARTED`, `phase-clock.mjs:18`). Nothing stored from the walker's ten calls remains (`wA/bs.mjs` prints but does not save). What would settle it: `bootstrap`'s `Server-Timing` gains `isolate;desc=<random id made once at isolate start>` and `isolate;dur=<age>`; ten calls then show whether each non-zero `fleet` carries a new id (several isolates) or an old one (the entry was lost in one: an expiry or `env` fault). The fix below does not depend on the answer.

**(2) Why round 8's tests missed it.** `instance-setup/r8-parts-report.test.mjs` and `control-plane/r8-bootstrap-fanout.test.mjs` run in one isolate (one Miniflare Worker, two calls) and count calls; they can only show per-isolate memory works. Nothing models the platform's several isolates, and the plan's 60 s "at most once per minute" was tested as "per isolate".

**(3) Failing-first test.** The platform's shape cannot be had in Miniflare with one Worker, so the contract is stated on what a second isolate holds: `instance-setup/r9-parts-kept-outside-isolate.test.mjs`: two `partsReport` calls with two DIFFERENT `env` objects (two isolates) sharing one store stub, counting the `AGENT_WORKER` and `FILE_SCANNER` binding calls: the fleet is asked at most once in 60 s across the two (red: once each, so twice). Door confirmation beside `r8-bootstrap-fanout.test.mjs`: a second Miniflare Worker instance on the same persisted object (or the same test calling `bootstrap` through two `env`s) with a counted fleet: at most one ask in 60 s. The new logging (`isolate;desc`) has its own test (entry exists with its fields).

**(4) Platform check P** (R-QUIET: ten calls 2.5 s apart; `fleet;dur` 0 on every call after the first within a minute, whichever isolate answers; and with the isolate id, the number of isolates seen). **Owner: instance-setup** (`setup.mjs:160-186`); the keep must live where every isolate reads it: the Durable Object `bootstrap` already visits (`bootstrapReport` hop, `setup.mjs:3174`), or any store all isolates share. That is an architecture choice (where a shared 60 s value lives), BOB's. Certainty: the cause class (scope of the keep) is certain from the arithmetic above; the exact mechanism (several isolates vs a lost entry) is NOT settled and the isolate id would settle it.

---

## 4. N1 NEW: an old failed capture's sentence shown on every Add screen (certain, reproduced)

**(1) Root cause, certain.** The read is `opencaptures` (`screens-intake/capture.mjs:15`, `D.open`; the Held captures list is not involved). It is acquisition's `openCaptures` (`acquisition/index.mjs:2457-2486`). The path of the line:
1. A parked fetch whose delivery the record refuses for good (`CAPTURE_HELD_BY_ANOTHER_BUNDLE`) is ended by `owedFetch`, which on purpose KEEPS the session "for the member to read": it saves it with `queue: [{fetch: true}]` and `fetch_pending.failed = <code>` and `ttlMs: OWED_SESSION_TTL_MS` (`acquisition/index.mjs:2421-2425`; the first-try refusal branch :2399-2401 likewise). `OWED_SESSION_TTL_MS` is 30 days (:389), restarted at the failure.
2. `openCaptures` lists every live session of the member with `outstanding >= 1` (:2468-2476); the failed session has `queue.length` 1, so it is listed with `fetch_pending: {..., failed}` and its `locator` (:2482-2484). Nothing in the listing ends: it stays until expiry, about 30 days.
3. The screen draws it on every Add open: `capture.mjs:386-387` `const bad = c.fetch_pending.failed ...; if (bad) return failedLine(bad)`. `failedLine` (`capture.mjs:346`) takes the code alone: `refusalHtml(cs, {code})`. It draws the refusal's sentence (`refusal.CAPTURE_HELD_BY_ANOTHER_BUNDLE`, `setup-words/rows.mjs:15526`) with no address and no title, although `c.locator` is in the listing and the very next branch (the "Finish it" line, :389-391) names the capture by `title` (held title, else locator).
4. Nothing clears it. There is no act that drops a failed session: `dropCaptureSession` is called only on success, on a session that never parked (:1312), and in the render path (:2305, :2328, where a final refusal DROPS the session, unlike the fetch path). A re-press does not clear it either: `parkFetch` (:1299-1301) finds the failed session as the "twin" (same address, same opener, has `fetch_pending`) and answers it again as `fetch_pending`; no new fetch is owed (the ledger entry is final).

So both halves of N1 are code: it is shown with no document named (the screen omits the name it has) and it is shown for a month (the session outlives the ledger entry on purpose, nobody ends it).

Reproduction (the real `openCaptures` over a store holding the session, then the real Add screen, no press; the fixture is `r8-failed-listing.test.mjs`'s with a 30-day expiry):
```
LISTING {"session":"rs_held_elsewhere","locator":"https://www.govinfo.gov/.../BUDGET-2021-APP.pdf","primary_sha":null,...,"outstanding":1,"fetch_pending":{...,"failed":"CAPTURE_HELD_BY_ANOTHER_BUNDLE"}}
listed 28 days later: 1
FAILED LINE: The record already holds this document, under another record. A document has one home ... | data-state failed
mentions address or title: false
dismiss/clear acts: [acquire, capturerequest, capturecredentiallist, capturecredentialsupply, capturerequests]   (none ends it)
```
The walker's observation is reproduced exactly. The walker's session (started 2026-10-23T20:04Z) is by this code listed until about 2026-11-22.

**(2) Why round 8's tests missed it.** `screens-intake/r8-failed-listing.test.mjs` asserts the sentence appears and that "Finish it" does not (its third test), and never asks that the capture be named or that the line ever end; its fixture's expiry is one day, so listing past a day was never exercised; `acquisition`'s G105 tests assert the ledger entry ends, and the session being kept is stated as a requirement (R111), not tested as "ends sometime".

**(3) Failing-first tests.** (a) `screens-intake/r9-failed-named.test.mjs`: the real `openCaptures` listing (R-SEAM, as in `r8-failed-listing.test.mjs`) for a failed fetch; the Add screen opened with no press draws the refusal's sentence AND names the document (its address, as the unfinished line does; red: neither the address nor any title appears). The same beside a press of an unrelated address. (b) `acquisition/r9-failed-ends.test.mjs`: once a failed fetch session has been listed, it is not listed after the rule BOB decides (see below): e.g. a failed session is listed for a stated time or until the member dismisses it, then not by `openCaptures` (red today: still listed 28 days later, shown above). Owner of (a): **screens-intake** (`capture.mjs:346, 386-387`). Owner of (b): **acquisition** (`owedFetch` :2399-2425, `openCaptures` :2468). A control-plane act to dismiss would be a CHANGE to op-declarations and control-plane if BOB chooses the dismiss option.

**(4) Platform check N** (L would show it on the real object: a refused 41 MB press by a member who cannot see the home, then the next Add screen; P: the same on biosmoke). BOB's decision (detail, BOB's own, to rule): how long a stated refusal stays listed (until the member has seen it once and left the screen / until a day / until dismissed). It is the member-facing rule about what an Add screen carries; the recommendation is: the line names the document and is shown until the member leaves the Add screen once after reading it, or until a day after the failure, whichever comes first. Certainty: certain.

---

Also noted (not asked): the same pattern as item 1 (a code drawn raw because two screens each map it) is present in `document.mjs:313,315` (`not_walked`).
