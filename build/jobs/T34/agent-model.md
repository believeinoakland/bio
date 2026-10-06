# agent-model (T34)

**Status** · session_01PAru3fgq7yRoTJvbfx1aDq · depth 2 · WORKING · handled B2

## Completion

**Entries applied.** T34-38 (N588, K1621), R6: every `converse` answer that carries `usage` now carries `calls`. On the `apikey` path a request counts when its outcome reached the provider (carries `usage`: an answer, a refusal of any status, a non-JSON body); a request the meter stopped, or one whose `fetch` threw, counts none; stopped before any request, `calls` is 0. On the `subscription` path it is the sum of the runner's `num_turns` over the conversation's runner conversations (a model that ends without answering is asked again in a fresh one); a conversation that ended without stating it (socket closed, this side stopped it, an upgrade refused) makes it `null`, never 0; stopped before any connection, 0. A refusal before any call (R2, R11, `MODE_UNKNOWN`) carries neither; an `onTool` halt is returned as the caller's own, unchanged. The K1755 fold: R1 (the reference that serves the act, the member's own or the group's API key), R9 (unchanged behaviour, now tested with a group-level reference lacking a key), R11 (a `level` other than absent, `member` or `group` is refused `ACCOUNT_REFERENCE_UNUSABLE`, as is a `group` reference of any `kind` but `apikey`; a group key is sent exactly as a member's). The refusal's text names the group's API key. J1 answered by B2 (K1798): the Terms stand (`subscription` → `token`); agent-worker maps.

**Deferred.** None.

**Found in other modules (for BOB).**
- `agent-worker`'s generated bundle `agent-worker/dist/agent-worker.bundled.mjs` bundles agent-model's files and is now stale: agent-worker R45's two checks ("the static check finds nothing", "a fresh build is byte-identical to the committed bundle") fail on this branch and pass without my change. Regenerate at the layer close (mechanics §14); not written here.
- `agent-worker` (its R6, folded per K1798) must pass `calls` on to `ai-runs` as N588 wants; agent-worker's tests otherwise unchanged by this job: `ask.test.mjs` and `harness.test.mjs` fail identically with and without my change (inherited).

**Tests and checks.**
- `node --test agent-model/test/`: tests 12, pass 12, fail 0 (new tests named R6 (calls) and R11; R1 and R9 extended).
- `node --test agent-worker/test/` (the module that uses agent-model): tests 9, pass 6, fail 3; without my change pass 7, fail 2. The added red is `requirements.test.mjs` R45 ×2, the stale bundle above; `ask` and `harness` are inherited.
- Layer tests: none named in `build/manifest.md`.
- `format`: 126 modules, 125 requirements files; 0 failures. `architecture`: 5 product files, 6 relative imports; 0 failures. `coverage`: 11 of 11 live requirement ids named by a test; 0 failures. `ownership`: 5 files changed by agent-model between tranche/T34 and HEAD; 0 failures.

Size (session_01PAru3fgq7yRoTJvbfx1aDq): test runs 9, module lines 602

## J1 · QUESTION

Shape of a subscription reference (R1, R2, Terms). agent-model's Terms say a subscription reference is `{kind: "subscription", token}`; credentials R35 says a member's own reference is answered as `{kind, level: "member", key}`, "the shape agent-model R1 reads", and its code (`accountFor`, index.mjs:1048) answers `key` for both kinds. Taken literally, agent-model refuses every subscription reference credentials hands out (`ACCOUNT_REFERENCE_UNUSABLE`, no `token`).

My best reading, on which I am carrying on: the Terms bind me as written (`apikey` → `key`, `subscription` → `token`), and the caller that turns `accountFor`'s answer into a reference (agent-worker) maps `key` to `token` for a subscription. The alternative I would prefer if BOB rules it: amend the Terms so a subscription reference's secret is `token` or `key` (one of them, non-empty; both present and different refused), matching R35, so no caller maps anything. Either is a few lines here; tell me which, and if the Terms change I apply it in this job.
