# Second review of G84 (K4426, short) for BOB #266

Read: `diagnosis-R7-startup.md`, the G84 paragraph (K4753), file-safety R52, translations R2, bundler R42, the file-safety, translations and bundler STARTs, the G84 paragraph of `instance-setup.txt`. Source opened; nothing run or contacted.

## DEFECT

**D1 · R42 cannot be met as worded.** `deploy.mjs:450` prints `test deploy: ...` BEFORE the upload (`:512` is the PUT). The figure exists only after the answer. R42 and the START must say "a line printed after the upload answer" (the deploy's own `up:`/result line), plus the test must assert its position. `startup_time_ms` appears nowhere in the repo (`grep` over scripts, src, test): the field name is unverified, and the START's recorded answer shape is hand-written, against R-SEAM (the E4 lesson). The job must read the field from Cloudflare's upload-answer documentation (cite the page) and say in its record that the shape is the documentation's, not a real answer; BOB's read of the real log at the redeploy is the true check. Also the file's header lesson (`:342`): an answer the PUT gives is not believed for state; here it is only printed, which is fine, but say so.

**D2 · file-safety's test recipe fails as drafted.** `WORD_ROWS` is `Object.freeze(...)` (`setup-words/rows.mjs:?`, generated) and re-exported through `setup-words/index.mjs:6`; a "counting proxy" cannot replace an ES binding or add own methods to a frozen array without editing or mocking another module. Doable recipe, no other module touched: in a child process, BEFORE importing file-safety, patch `Array.prototype.some/filter/find/map/forEach/reduce/indexOf/includes/findIndex` and `[Symbol.iterator]` to count calls whose `this === WORD_ROWS` (imported first from `setup-words`), then import file-safety, assert count at most 1. Put this recipe in the START; as written a haiku job will stall or mock the wrong thing. (`WORD_KEYS` has no other module's duplicate: other `WORD_KEYS` are their own.)

## GAP

- **G1 · "Under 500" is not secured.** The diagnosis range is 509-632 ms; the passes are measured by replicas (about -42 ms), leaving about 480 with a 20 ms margin inside the noise. No job measures before and after. Add to file-safety's and translations' records: `measureStart` x5 before and after on the job branch (`fleet-bundle.mjs:1561`), and say plainly that R43 may stay marginal; BOB's round-end figure decides.
- **G2 · Deferral of items 3 and 4 and a blind figure.** If the upload answer carries no figure (`unreported`) there is no number to decide item 3 on. Rule now: `unreported` means BOB reads the account's script settings or the dashboard figure through the existing workflow only; if neither, item 3 is not started (the deploy succeeded, which proves under 1 s). Also say when item 3 would run: "in this tranche" after the redeploy means a second deployment, against K4428's one; name it as BOB's accepted cost.
- **G3 · Platform check field.** The three STARTs give "(3) L ... BOB's" and "(4) N". Say: L = the child-process import count; P = Cloudflare's `startup_time_ms` at the redeploy (BOB). The four fields are otherwise present (cause with file:line, why missed, failing-first, check); translations and file-safety give file:line; bundler gives none for where the figure is printed (D1).

## NOTE

- N1 · Importers of `INTERFACE_WORDS` (`git grep -n 'INTERFACE_WORDS\b'`), all covered: translations itself `index.mjs:36, 39, 401, 682, 730, 734` and seven of its tests (`declared-ops`, `draft-account`, `interface-words`, `module`, `reading`, `translations`, `words`; START: "your own tests", names none, list them); instance-setup `setup.mjs:61` and `test/m/instance-setup/t50.test.mjs:12, 14, 19, 54, 119` (line 119 asserts identity of the two constants: becomes `interfaceWords()` called through both paths). No other module's src or tests import it (store-door's `routes.test.mjs:220` already uses `WORD_ROWS`, K3696). Stale generated: `bio-plane/dist/bio-plane.bundled.mjs`, `release/bio-plane.bundled.mjs` (BOB). `requirements/instance-setup.md` still names the constant: BOB's wording.
- N2 · Order: translations merges before instance-setup, and instance-setup #28 is already running G83; its G84 paragraph is a second CHANGE to the same job, which is fine.
- N3 · Nothing of Bob's slipped in.

Counts: 2 DEFECT, 3 GAP, 3 NOTE.
