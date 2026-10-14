# action-records (T48)

**Status** · session_01LVQnBgSFhJSKKdXTojuwhw · depth 2 · WORKING · handled B0

## Completion record

**Read** (whole): `build/requirements/action-records.md`; my entry T48-47 in `build/plan/current.md` (with T48-46, -48, -81 for who calls the site); the Layer 9 contract in `build/layers.md`; `bio-plane/src/action-records/index.mjs` (R1–R15); of `actions`, `actionCorrespond`'s five conditions (`src/actions/index.mjs` 1620–1750) and `action-grammar/checks.mjs` rows for C-32.4 and C-33.6–.9. Tests run, not read: the module's other tests.

**Entries applied.** T48-47 / R16: `correspondFence(author, extra?)`, `correspondEntryRefusal({at, artifactSha, account, dateTime?}, extra?)` (module-level, pure) and `unregisteredArtifact(sha, extra?)` (instance method, reads `register`), also reachable on the instance as `correspondFence`/`correspondEntryRefusal`. `actionReceipt` answers the five conditions through them (`dateTime: true`), in R4's order, answers unchanged field for field (tested against R4's original sentences).

**Interface notes for `actions` (T48-48) and `action-holds` (T48-81).** `extra` carries the caller's fields; its `detail` is a sentence, or an object keyed by reason code (`{BAD_DATE: "...", ...}`) because one call can refuse with several codes and `actionCorrespond`'s sentences differ per code. `extra` never replaces `ok`, `reason`, `code`, `check` or `translation`. Without an `extra.detail` each function answers a default sentence. `actionCorrespond` passes `{detail: {...}}` (no `target` on `BAD_DATE`, to keep its present answer) and `dateTime: false`.
- Regions (the rows' `where`, for `action-grammar` R29 / T48-46): `is-machine-correspond` (C-32.4, `correspondFence`), `is-correspond-entry` (C-33.6–.8, `correspondEntryRefusal`), `is-correspond-artifact` (C-33.9, `unregisteredArtifact`), all in `bio-plane/src/action-records/index.mjs`. They carry the names `actions` uses today, so `actions` must delete its own copies of these regions when it calls the site (T48-48), or the same region name stands in two files.
- Note: `BAD_SHA` (a malformed hash) stays each caller's own, as before; it is not one of the five.

**Deferred**: none. **Found in other modules**: `build/requirements/action-records.md` still marks R16 `*(not yet met: T48)*`; BOB's to update.

**Tests and checks.** `node --test test/m/action-records/`: 23 pass, 0 fail (4 new R16 tests in `correspond.test.mjs`; the R4 test unchanged and green). `checks/format`: 0 failures. `checks/architecture action-records`: 0 failures. `checks/coverage action-records`: 16 of 16 live ids named. `checks/ownership action-records tranche/T48`: 0 failures. `checks/run.mjs` over the product: format, architecture and channels 0 failures; coverage's 28 failures are other modules' (none action-records).

Size (session_01LVQnBgSFhJSKKdXTojuwhw): test runs 5, module lines 911
