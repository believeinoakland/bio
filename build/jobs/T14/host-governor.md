# host-governor (T14)

**Status** · session_013JNFsyhP13DN7TavJx3aJp · depth 2 · WORKING · handled B1

## Completion

**Entries applied.** N339 widened by N349 (K445), R27. `governorOp(op, url, store, relay)` takes a fourth, optional argument `relay = {doAnswer, storeRefusal}`, the control plane's own, handed in as `capture`'s handlers take theirs; no import of control-plane. With it handed, every store call (the `governorstate` read, the `governorconfig` write) is read through `doAnswer` and nowhere else:
- a store refusal (`ok: false` below 500, `refused`) answers `{refused: true, response}`, `response` being `storeRefusal(out)`: the store's status, code and sentence;
- a reply that is no answer answers `{silent: true}`, carrying `correlation` only when `doAnswer` read one from the store's `STORE_INTERNAL_ERROR` (no key otherwise); a store call that throws before it answers is handed to `doAnswer` as a rejected reply, so it is read as the silence it is;
- an answer answers `{status, body}` as before, and the governor's own R12 inside an `ok: true` answer stays an answer at 400.
One rule for both relays (K444). With no relay handed (either function missing counts as none), the call answers exactly as today through the module's `answerOf`, so legacy-index's call at `src/index.mjs`:671 is unchanged and nothing is red; `answerOf` goes when legacy-index hands the relay.

**What legacy-index must hand at layer 11**, its one call site, `src/index.mjs`:671:
`const g = await governorOp(op, url, () => env.STORE.get(env.STORE.idFromName(storeName)), { doAnswer, storeRefusal });`
`if (g) return g.refused ? g.response : g.silent ? storeSilent(op, g.correlation) : json(g.body, g.status);`
Both relays (`governorstate`, `governorconfig`) go through this one site.

**Not yet met marks my work meets** (BOB strikes them): R27's `*(not yet met: N339, N349)*`, and the Status line's "R27; not yet met", at the module's interface. Through the whole plane it holds once legacy-index hands the relay at layer 11 (above); until then the plane answers a store refusal behind these two ops as today's silence.

**Deferred.** None.

**Rows.** None added, moved or retired: nothing `awaiting stamp`.

**Found in other modules.**
- *Generated artifact made stale (not rebuilt, mechanics §14):* `agent-worker/dist/agent-worker.bundled.mjs` and its `.bundle.json` (owned by `agent-worker`) hash `bio-plane/src/host-governor/index.mjs` as an input: `fleetbundles.test.mjs` reports `agent-worker: STALE BUNDLE` with this change (1 pass, 0 fail on the tranche before it). BOB regenerates at layer close.
- *Grep of `civicos-ui/` and affordances for code added or retired:* no code retired; the one name added is an optional argument. Hits name the two ops only, unchanged: `civicos-ui/check-mock-envelope.mjs`:170–171 (describes the op's answer as `json({ok:true, ...r.result})`, still true of an answer), `civicos-ui/app.html`:1189, `civicos-ui/test/version-predecessor.test.mjs`:196, `civicos-ui/test/bound-sweep.test.mjs`:586, `bio-plane/src/affordances.mjs`:861–862, 2220. None needs a change.

**Tests.** `node --test bio-plane/test/m/host-governor/`: `tests 33, pass 33, fail 0, todo 0` (three new R27 tests: a stub store behind each relay answering 400 `BAD_JSON`, 404 and 409 refusals gets its status and envelope; a 500 `{ok: false, error}` gets 502 `STORE_DID_NOT_ANSWER` with no stack and no `correlation` key; a 500 `STORE_INTERNAL_ERROR` with a correlation id gets 502 carrying it, without one no key; answers unchanged). The layer has no layer tests (manifest). The only user of `governorOp` is legacy-index, whose call is unchanged.

**Checks.** `format: 69 modules, 64 requirements files; 0 failures`; `architecture: 5 product files, 9 relative imports (0 naming no tracked file, not judged); 0 failures`; `coverage: 1 modules, 27 of 27 live requirement ids named by a test; 0 failures`; `ownership: 3 files changed by host-governor between tranche/T14 and HEAD; legacy-store: 0 line(s) added, 0 removed; legacy-index: 0 line(s) added, 0 removed; 0 failures`.

Size (session_013JNFsyhP13DN7TavJx3aJp): test runs 4, module lines 419
