# instance-setup (T41)

**Status** · session_01WzRrJhZTNftXXEJ9mUKi9Q · depth 2 · WORKING · handled B3

## J1 · QUESTION

R65/R67 "a draft carries no project" (T40: N812, K2373), at this module's interface. My best reading, built and tested (`t41.test.mjs`); I carry on with it:
- The door resolves a draft's account with no project (credentials R56, store-door R10), so this module never reads a project. Its share is to hand on and answer none: `groupDescriptionDraft` hands its turn the door's `{kind, level}` with any `project` key dropped; and an account handed in that is a project's (`level: "project"`, or naming a non-null `project`) serves no draft: `ASSISTANT_DRAFT_UNAVAILABLE` (wizard-scripts' row), the turn never asked, nothing written; for `translationDraft` the same answer with no `words`, so the door has nothing to send. Its place: after NOT_AN_ADMIN / R67's first refusals and AI_KEPT_AWAY, before the answers' checks (beside the existing "door resolved no assistant" case).
- The door's AI_NO_ACCOUNT, AI_USE_SWITCHED_OFF, AI_LIMIT_REACHED (and the retired ceiling codes) are minted nowhere here; tested as never answered by any of the three draft entry points.
Wording point for BOB (no build change): R65's refusal list still names `ASSISTANT_OFF` (R55), which R55's T37 text retired for credentials' `AI_KEPT_AWAY`; the code and tests answer `AI_KEPT_AWAY`.
