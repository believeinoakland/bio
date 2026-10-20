# The walk's stall: named (T51, K4161 group E)

Status: the cause is proven by a targeted reproduction (no full walk) and the fix is proven without the walk. The first write-up (`../diag/walk-slow.md`) placed the onset at R22's first Home load and ranked a plane read (A), the walk's own process (B) and a clock (C). The onset was mislocated; the cause is B, in one place.

## 1. The onset was R27, not R22

`signin.door` `state` lines are one per signed-in page boot. The first write-up counted them as if R22 followed R16 directly. It does not: R22 and R25 add about 10 lines, and the R7 sweep with her handle held (`run.mjs`:146, `sweepAsFounder`, 74 screens at ~2.3 s) adds about 70 more. In my instrumented run the same prefix is 40 lines to the end of R25 and about 110 after the sweep. Line 108 of the 40-minute run (23:51:29, 5 m 41 s after its first line) is therefore the end of the sweep, the start of **R27, the pseudo-locale walk** (`run.mjs`:148-163), and the slow phase is lines 108 to ~241 (134 lines, 36 min). R27 loads 74 screens at 2 widths, so 148 loads: 148 x ~15 s is the slow phase. R22, R25 and the sweep ran at normal pace, in the same run, which also explains why "every later page is slow whether new context or old": there was only R27 after the onset. R13 after it is short (14 s in my run).

## 2. Reproduction and evidence

Script: `repro.mjs` (this directory). It builds the local world with `localWorld()`, composes the walk's sequence as `runLocal` does (journey 28, journey 3, R9, R10 not-ready, R16, R22, R25), then R27's sign-in and first screens, and instruments each page: `request`/`requestfinished`/`requestfailed` with times, console and page errors, an event-loop lag probe (500 ms timer) in the walk's Node process, and wrappers on `page.waitForLoadState`/`waitForFunction` that dump at each `settle()` timeout. Nothing tracked was edited. Logs: `repro5.log` (stall, tracked code), `repro7.log` (full R27 with the fix). Runs without R27 (`repro.log`, `repro2.log`, `repro3.log` with a 200 s sleep so the walk passed 6 minutes, `repro4.log` with the whole sweep): zero settle timeouts, 133 steps in 393 s. So it is not time-of-day, not the 5-minute version poll, not R22's Home, not the plane's state, not the sweep.

First R27 step ("R27 sign in", the first page the pseudo context loads), `repro5.log`:

```
206.4 STEP> #60 R27 sign in
221.2 LAG node event loop late by 12202 ms
221.5 FIN  /api/?op=interfacewords took 12811 ms
222.0 FIN  whoami, infolevel, accountreference, subscriptionsignin, groupkeystate, groupidentity, assistantstate, queue  each took ~13290 ms
234.3 LAG node event loop late by 11643 ms
235.7 SETTLE-TIMEOUT waitForFunction(no loading) after 14024 ms
   in flight (23): groupidentity, queue, infolevel, assistantstate, accountreference, subscriptionsignin, groupkeystate,
                   /version, projectlist, startfrom, lookedsince, browse, publishedlist, peopledirectory, clocksrunning, memberlist ... each 13.2 s
   loading elements: p.cs-state "[Šţïļļ ļöåðïñĝ ƥáđƥ]" in #cs-main (the pseudo of "Still loading this page")
```

Every request of the page, including trivial ones the plane answers in 4 to 125 ms, is "in flight" for the same 13 s and finishes at the same instant: the walk's Node process was not running the route handlers. Its event loop was blocked for 12.2 s, then again for 11.6 s (and 13.1 s later), once per `interfacewords` answer (plus the 3.5 MB document, 0.1 s). `settle()` runs while the loop is blocked, so networkidle and the loading state both time out: that is the ~15 s per step. In the 40-minute run the plane's `ms_total` stayed at 4 to 125 ms for the same reason: the plane was never slow.

## 3. Cause (file:line)

`bio-plane/src/journey-check/pseudo.mjs`:

- `pseudoRoute` (line 163; installed on the R27 context only, `run.mjs`:150) now routes every `fetch`/`xhr` of the copy through `fetchCopy` and calls `pseudoJson` on each JSON answer (line 182). Before CR-25 only documents were routed (`git show 2602fa6ad6~1:bio-plane/src/journey-check/pseudo.mjs`, lines 64-75).
- `pseudoString` (lines 123-134) tries, for every string of two or more words that is not an exact row, every one of the list's **6,039** sentence patterns, each a `^...(.+?)...$` regular expression, in turn (line 128-129), synchronously, with no cache.
- The shell reads `interfacewords` (`interface-shell/browser.mjs`:2304) on every page. Its answer is the whole word list: **5.66 MB, 67,373 strings** (22,457 rows x key, text, en, fallback). Of those, 12,558 reach the pattern loop (6,130 distinct). Measured offline on the captured answer (`answers/interfacewords.txt`, `bench.mjs`): `pseudoJson` takes **12.8 s** on every call. 148 loads x ~13 s of blocked event loop is the 36-minute stall.

Owning module: `journey-check` (`build/modules.json`: `bio-plane/src/journey-check/`, tests `bio-plane/test/m/journey-check/`). Its R29 (a) (answers made pseudo) is what CR-25 added. Not the plane, not interface-shell, not setup-words.

## 4. Minimal fix (in words)

In `pseudoString`, (1) remember the answer per input string in a module-level `Map` (strings recur: text and en are the same string for every fallback row, and every page reads the same list again), and (2) skip a pattern at once unless the string starts with the pattern's first literal part and ends with its last (kept on the pattern when `sentences()` builds it), since the regular expression cannot match otherwise; the result is unchanged. Measured with a patched copy (`pseudo-fixed.mjs`, same output byte for byte on the real answer): first call 1.5 s (incl. the one-off 0.4 s table), later calls 0.09 s. Optionally also drop the Node-side cost of the first call by building the table before the context is routed; not needed.

The first write-up's Fix 1 (settle notes and a `FAIL.SLOW` after 3 slow steps) is still worth doing, now as a bound on any future stall; it is not needed for this one. Its Fix 2 (memoise `pseudoString`) was correct and is this fix.

## 5. Test at the module's interface (fails today, passes after; no walk)

`pseudo-cost.test.mjs` (this directory) is the proposed addition to `bio-plane/test/m/journey-check/pseudo.test.mjs`, which already imports `pseudoJson` and `pseudoString`. Run as `node --test pseudo-cost.test.mjs`; `PSEUDO_MOD=<path>` selects the module.

1. A body shaped like `interfacewords` (`WORD_ROWS` as `{key, text, en, fallback}`, 67k strings) is passed to `pseudoJson` with `RegExp.prototype.exec` counted for the anchored sentence patterns: at most 1,000,000 tries (today the budget is exceeded within milliseconds of the 37 million it needs; after: 346,588), and a second call with the same body tries **none** and answers the same.
2. Equivalence: 300 sampled rows with placeholders, filled with a value, are still made pseudo (not left as they were; `escapedIn` finds nothing), and a non-sentence is left alone.

Result: tracked module, test 1 fails in 2.5 s ("1000001 sentence patterns tried for one answer"), test 2 passes; with the fixed copy both pass.

## 6. Does the walk then fit, and do the test timeouts change?

Measured with the fixed module (`repro7.log`, same world and sequence, R27 over all 74 screens at both widths, then R13): R27 incl. sign-in 480 s (6.5 s per screen), R13 14 s, zero settle timeouts, total 728 s without the R7 sweep; the sweep (handle held) alone took 183 s (`repro4.log`, 133 steps, 393 s with R22/R25). So the whole walk is about 910 s plus world start: **about 15 to 16 minutes** against the 2,400 s limit (2.6x margin; the first write-up's estimate holds). No change to journey-check's test timeouts is needed: every local-arm test carries `{ timeout: 2400000 }` and shares the memoised `local()` promise; the control worlds (`parts: []`) never reach R27 and ran at 122 to 137 s.

## 7. Cleanup and notes

All processes and browsers my scripts started are closed (each run ends in `finally` with `b.close()`, `world.close()`). Two idle `workerd` processes (pids 6805 and 6813, started 00:35:50, parent 1) predate this diagnosis and are not mine (left from the 40-minute run); they use no CPU. Scratch files here: `repro.mjs`, `repro*.log`, `bench.mjs`, `bench2.mjs`, `prof.mjs`, `count.mjs`, `pseudo-fixed.mjs`, `pseudo-cost.test.mjs`, `answers/` (captured plane answers, one of them 5.7 MB; the answers hold only the test world's words and fake data).
