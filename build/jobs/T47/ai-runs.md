# ai-runs (T47)

**Status** · session_01WhvPxECaVfyVKTtYstmezH · depth 2 · WORKING · handled B2

## J1 · QUESTION

R18 (T47 clause): 'The segment then carries the minted token and its tokenId to agent-worker's /run (its R6 wire shape, as above)'. agent-worker R6's wire shape has `credential` (the token) and no tokenId field. My best reading, which I am building: the body is `{run_id, store, credential: <minted token>, account}` exactly as today; the tokenId is not sent, because R6 takes no such field and agent-worker looks the credential up by its hash (admission R10). If you want a `token_id` field added to the body, say so and I will add it (agent-worker would need to accept it). Nothing else waits on this.
