# plane (T37)

**Status** · session_01111XPFU4aFxj2noCaaE3nf · depth 2 · COMPLETE · handled B2

## Record

**Entries applied** (T37-48; N765's share; K2189, K2200 (3), K2226, K2236; B2 CHANGE K2238)
1. `worker.test.mjs` R6: its negative control `op=stats&token=adm-plane` re-pinned from 401 to admission's 400 `CREDENTIAL_IN_ADDRESS` (C-38.10; `ok`, `code`, `reason`, `check` named, no stats answered, the credential in no answer), and the same refused beside a valid `Authorization` header. Never loosened. Red 17's plane row 51 cleared.
2. The ask's gate (`plane/ask.mjs`): `askOnObject` and `draftOnObject` keep calling `instanceSetupOf(ctx, env).assistantGate()`, which instance-setup R55 (T37-30) makes answer `credentials.aiKeptAway()` as given; the comments at :51–54, :88–90 and :113 now say `AI_KEPT_AWAY`. `ask.test.mjs` B7 and R19's negative controls re-pinned from `ASSISTANT_OFF` to `AI_KEPT_AWAY` (C-29.31, `keep_away` with the reason, who and when, equal to credentials' refusal, `ASSISTANT_OFF` absent), each with a negative control.
3. `store.mjs`: the unused `assistantGate` dep handed to `answers` dropped.
4. R18 (K2226): `publication` built with `bucket: env.CAPTURES` and `store: () => this.#ownNamespace() || "bio"` (as record-core's evidence prefix reads it); `caseCarriageOps(publicationOf(ctx).caseCarriage, …)` routed directly after `publicationOps`. `maps.mjs` gained the `case-carriage` row. `disclosures.test.mjs`: case-disclosures has no map, case-carriage's is after publication's, its two ops answer as the instance does (with `MACHINE_CANNOT_MARK` as control); new end-to-end test: a photo in `CAPTURES`, marked through the route map, has its obscured copy held at `<ns>/obscured/<sha>` for `bio` and `scratch` (pixels checked, original unchanged); mutation-checked (dropping `store` or both fails it). `docket.test.mjs`: publication → case-carriage → case-tensions → docket in the declarations, case-carriage's purgeable tables exactly its marks tables, and a purge clears a mark.
5. K2236: `t36.test.mjs` R26 re-pinned to scheduler R24: the five `file-*` consumers registered; each firing runs exactly the batches file-safety R39's wakes say are due (scan and render here; deeper, forward, reputation not); negative control: no scanner, no scan wake, no scan run. Rule 6 item 24 cleared.
6. B2 (K2238): `draftOnObject` carries a translation draft: `{task: {op: "translationdraft", direction, language, words}, account, pack}`, no `told`, `grant` or `firsthand`, never a grant minted (run-rules R22); test for both directions with a writing-help draft as control.

**Also fixed in my module:** R29's `test.todo` made a test (capture R73 and acquisition R44 are merged): the reader is asked at each acquisition and its tool reaches the scanner's `/provider/reputation`; mutation-checked. `maps.mjs` used `acquisitionOf` without importing it (a ReferenceError for any test invoking `coarchive*`): imported. Stale comments: `screens.mjs` header (it is handed to answers; wizard-scripts registers its own `SCREEN_REGISTRY`, K1871), `wrangler.jsonc`'s AGENT_WORKER ("nothing reads it yet") and CAPTURES (now also derived files and obscured copies).

**Deferred:** `wrangler.jsonc`:57 cites `#monitorConfigured`, which no longer exists in `src/`; the paragraph is the OCR member's history and I left it rather than re-word history I cannot verify. `.dev.vars.example` lists `MEMBER_TOKEN` (retired, C-38.11) and lacks `DAEMON_TOKEN`, `OWN_HOSTS`, `RECEIPT_SIGNING_KEY`: no requirement names the file's contents; left for the installer's documentation.

**Interim reds (rule 4):** `ask.test.mjs` B7 and R19's negative controls are red on this branch until instance-setup (T37-30) merges, since `setup.mjs`' `assistantGate()` still mints `ASSISTANT_OFF`. Verified: with `assistantGate()` patched locally (not committed) to `return this.#credentials().aiKeptAway()`, `ask.test.mjs` runs 12/0 (13 with B2's test). I merge after instance-setup, so they clear at my merge. Red 7 (`release.test.mjs` R19, two tests) remains, not mine.

**For BOB (requirements, not mine to edit):**
- `plane.md` Uses (:49) still says case-carriage "none directly"; the root now imports `caseCarriageOps` (R18's own last paragraph).
- R29 can drop *(not yet met: T37)*: its test passes on this branch. The Status line's "every requirement met" then holds.
- R5 says "`control-plane`'s `dispatch`"; R1, R14 and Uses say store-door's (K2043). R6 has the self-reference "as R6's entry".
- In other modules: no flaw found that my change exposes. Several modules' getters (monitoring, case-authoring, review, filings, ratification, conformance, public-read, queue-producers, network-notices, docket) build `publication` bare if reached first; the root builds it at :229 before all of them, so the bucket holds, and if ever reordered case-carriage fails closed (no copy).

**Reading set:** over 300 KB (tests 292 KB + own requirements 22 KB alone), so mechanics §17's path: I read whole `plane.md`, layer 11's row of `layers.md`, `ask.mjs`, `store.mjs`, `worker.test.mjs`, `ask.test.mjs`, `disclosures.test.mjs`, `docket.test.mjs`, `t36.test.mjs`, instance-setup R53 and R55, admission R20, answers R19, the rulings named, plan entries T37-48 and rule 4/6, and case-carriage's factory and ops, publication's `caseCarriage` getter, credentials' `aiKeptAway`, capture R73's reader and acquisition's `addressReputation`. Two workers read in full the rest: (a) the other 7 `src/plane/` files and the config files, ~1,400 words, each statement citing file:line; (b) the other 22 test files and `migrate-released.test.mjs`, ~1,700 words, citing file:line. What they found that mattered is acted on above (the `maps.mjs` import, the stale comments, the requirements notes). They reported no test pinning `ASSISTANT_OFF`, the answers dep or a route order my addition changes; nothing they left out mattered to this entry.

**Tests and checks** (on `job/T37/plane`):
- `node --test test/m/plane/*.test.mjs`: tests 146, pass 142, fail 4 (the two interim N765 reds above; red 7's two).
- `node --test test/system/migrate-released.test.mjs`: pass 1, fail 0.
- `format`: 136 modules, 135 requirements files; 0 failures. `architecture`: 42 product files, 409 relative imports; 0 failures. `coverage`: 29 of 29 live requirement ids named by a test; 0 failures. `ownership` against `tranche/T37`: 11 files; 0 failures.
- Generated artifact `bio-plane/dist/bio-plane.bundled.mjs` is stale from `src/plane/` changes: BOB regenerates it at L11's close.

Size (session_01111XPFU4aFxj2noCaaE3nf): test runs 19, module lines 1361
