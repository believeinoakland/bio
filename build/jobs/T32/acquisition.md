# acquisition (T32)

**Status** · session_01YSPCBnvSnZ3tLVcBFfJatU · depth 2 · WORKING · handled B1

## J1 · QUESTION

R33 names `firstHopWho(instanceName)` but its answer `instance <name> (Civicsmith/<version>)` needs a version, and this module holds none of its own (both sites read the instance's `env.VERSION`). My reading, which I am building: `firstHopWho(instanceName, version)`, a missing or blank instance read as `unnamed` and a missing version as `0.0.0` (R24's defaults, so the existing R16 answers stay byte-identical); pure, never throws. Capture R65 then calls `firstHopWho(env.INSTANCE_NAME, env.VERSION)`. If you want the signature to stay one argument, say how the version reaches it.

Requirements wording, yours to fold (no change of meaning asked): (a) R33 and R34 sit inside R32's sub-bullet list, splitting it (R32's bullets now follow R34); (b) R24 still says the aliases "are also exported … until every user has re-pointed", which R34 retires: R24's last sentence should go with N539.
