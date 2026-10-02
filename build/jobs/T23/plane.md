# plane (T23)

**Status** · session_017NFraWSdSr3q7n2ieXDSvL · depth 2 · WORKING · handled B1

## J1 · QUESTION

One reading I am building on; nothing waits on it.

network-notices' three public reads (`activitymethod`, `noticespublic`, `groupkeyspublic`, public-read R18, K1150) are reachable today as `op=publicread&name=<name>` through `publicReadDoorOp`, which my `src/plane/door.mjs` calls. Public-read's record says they can also be reached as `op=<name>` when the plane hands `publicReadDoorOp` the declared names as `helpers.publicReads`, and that this needs op-declarations to declare each name `classes: null`.

My reading: no entry of mine asks for routing by name, so I leave `door.mjs` as it is, with the reads reached through `op=publicread&name=<name>` only. If op-declarations' or control-plane's L11 merge declares the three names, tell me in a CHANGE. I would then hand `publicReads` the names network-notices registered (`Object.keys(networkNoticesPublicReads(...))`, read through public-read's `publicReads()`, never a list of my own), and test one through the Worker door.
