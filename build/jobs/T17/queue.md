# queue (T17)

**Status** · session_01XZjjzfxXvNbYmpNGGMed4o · depth 2 · WORKING · handled B1

## J1 · QUESTION

R12 and N375. R12 says an OBLIGATION's disposition is `available: false` with `instead` `biasdebtresolve` for bias-debt and `taskresolve` otherwise. The new OBLIGATION kind `signer-self-registered` (R1, N375; `queue-producers` R14) has no task row: it is keyed by the key (`OBLIGATION::signer-self-registered::<key>`) and leaves only when the key stops being `active`, through `membership.signerSet` (`op=signerset`, its R26). So `taskresolve` would name a door the item cannot go through (the defect REC-207 fixed for bias-debt).

My best reading, which I am building now: R12's `instead` is `signerset` for `signer-self-registered` (bias-debt `biasdebtresolve`, every other OBLIGATION `taskresolve`), tested at the feed. I leave R28's bridge as written (`instead` `queuemute` or `taskresolve` by class), since its text is explicit; if you want the bridge to name the same per-kind door (it would then say `biasdebtresolve` for a bias-debt key and `signerset` for a signer key), say so and I will change it and its test. The requirement's R12 wording would need your edit either way.
