# agent-worker (T49)

**Status** · session_01G85qgibprP8ncwoNcKSciB · depth 2 · WORKING · handled B0

## J1 · QUESTION

Doubt 11 (M-T49 note 2): agent-worker has NO configurable model address. The address is the constant `MODEL_ENDPOINT` in `agent-model/src/apikey.mjs`:13, used only by the API-key turn (`apikey.mjs`:56); agent-worker reads nothing of it from `env` (grepped: no `env.*MODEL*`). With API keys withdrawn (K3347), a subscription run reaches Claude through the `RUNNER` binding (a Durable Object namespace), not an HTTP address, so a fake model "over HTTP at agent-worker's model address" cannot be served by journey-check today.

Best reading and proposal (BOB's to place, since the address belongs to `agent-model`, not to me): either (a) journey-check serves a stub `RUNNER` binding, which agent-worker already accepts through `env.RUNNER` (no change needed, R35/R66), or (b) if an HTTP address is wanted, one line in `agent-model`: "the Messages API address is `env.MODEL_ENDPOINT` when it is an https URL, else the published one", and one in agent-worker: "it passes `env.MODEL_ENDPOINT` to every `agent-model` call". I build nothing for (b) unless you add it to this job. Carrying on with R89.
