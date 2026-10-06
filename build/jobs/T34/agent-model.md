# agent-model (T34)

**Status** · session_01PAru3fgq7yRoTJvbfx1aDq · depth 2 · WORKING · handled B0

## J1 · QUESTION

Shape of a subscription reference (R1, R2, Terms). agent-model's Terms say a subscription reference is `{kind: "subscription", token}`; credentials R35 says a member's own reference is answered as `{kind, level: "member", key}`, "the shape agent-model R1 reads", and its code (`accountFor`, index.mjs:1048) answers `key` for both kinds. Taken literally, agent-model refuses every subscription reference credentials hands out (`ACCOUNT_REFERENCE_UNUSABLE`, no `token`).

My best reading, on which I am carrying on: the Terms bind me as written (`apikey` → `key`, `subscription` → `token`), and the caller that turns `accountFor`'s answer into a reference (agent-worker) maps `key` to `token` for a subscription. The alternative I would prefer if BOB rules it: amend the Terms so a subscription reference's secret is `token` or `key` (one of them, non-empty; both present and different refused), matching R35, so no caller maps anything. Either is a few lines here; tell me which, and if the Terms change I apply it in this job.
