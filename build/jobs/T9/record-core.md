# record-core (T9)

**Status** · session_01PP6FLcFpU5dGkNser12SaQ · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

**N219 applied** (commit af30435b66). `releaseLease(bundleId, actor)` (R61) is a method of the instance.
- An empty or non-string actor is refused `ANONYMOUS_LEASE` by the same refusal `acquireLease` gives (R10). Both now go through one private helper, `#anonymousLease`: one refusal, one site. The refusal's text is unchanged.
- When `actor` holds the bundle's lease, live or expired, the lease row is deleted and the answer is `{ok: true, released: true}`. R11 then refuses no one on that bundle.
- A lease held by another actor, or no lease, is left as it is, and the answer is `released: false`. Actors are matched exactly.
- It never throws. A failing read or write rolls back its transaction, and the answer is `released: false`.

**N213 applied.** R37's widened contract needed no schema change: every column it now names was already there with its stated name, type and meaning. A new R37 test fixes these:
- the names, types and NOT NULL of `files.bytes`, `files.blob_sha`, `bundles.bundle_sha`, `row_version`, `created` and `last_updated`, `history.created`, and the `manifest` table's columns;
- their meaning, read back in a later module's own SQL: `bundle_sha` and `row_version` are R41's `bundleSha` and `rowVersion`; `bytes` and `blob_sha` are what `commit` recorded and what R13 answers; `history.created` is the archiving commit's time; a manifest row is R42's entry;
- `manifest.rowid` ranks a bundle's entries in the order they were recorded. It breaks a tie under `created` in write order, never by snap key; it equals R16's `seq`; and it keeps that order across a purge and a later commit.

**For BOB:** the requirement markers `*(not yet met: T9, N213)*` on R37 and `*(not yet met: T9, N219)*` on R61 can be cleared. Both now hold.

**Deferred:** nothing. (N250 is T10's, per B1.)

**Found in other modules:**
- `actions` still releases a lease with `acquireLease(id, who, 0)` (`bio-plane/src/actions/index.mjs:201`, `#releaseLease`). Its R16 now says to release through `releaseLease`. That change is for its next job (T10); `releaseLease` returns `{ok, released}`, so its `try` wrapper can go.
- Generated artifacts my change made stale, not rebuilt: `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`) and `agent-worker/dist/agent-worker.bundled.mjs`. Both manifests list record-core's source among their inputs. Regenerate at layer close.

**Tests** (`node --test bio-plane/test/m/record-core/`): 53 passed, 0 failed, 0 todo (was 49). Layer tests: none named in `build/manifest.md`. No existing service's behaviour changed, so no user's tests were run.

**Checks** (civicos-process):
- `format`: 69 modules, 64 requirements files; 0 failures
- `architecture record-core`: 4 product files, 6 relative imports; 0 failures
- `coverage record-core`: 61 of 61 live requirement ids named by a test; 0 failures
- `ownership record-core tranche/T9`: 3 files changed; legacy-store 0 lines added, 0 removed; 0 failures

Size (session_01PP6FLcFpU5dGkNser12SaQ): test runs 4, module lines 1039
