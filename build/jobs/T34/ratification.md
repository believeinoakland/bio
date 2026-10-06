# ratification (T34)

**Status** · session_01EQL9vA1G3VmWTpzuXvQNzy · depth 2 · WORKING · handled B1

## J1 · QUESTION

Three seams for T34-85. I'm carrying on with my best reading of each and won't stop for the answer.

1. **The publisher is async (R42, publication R67).** R42 checks the signature again at `now` with `verifySshsig`, which uses WebCrypto and is async. So `publishScheduled(entry, now)` returns a Promise, and publication's `publishDue` has to `await` it. R66's waiting entry also has to give the publisher the signature it holds beside the document. The shape R66 lists doesn't name it, so I read `entry.signature` (falling back to `entry.sig_armored`), plus `doc_sha`, `signer`, `delivered_by`, `checked` and `set_by`. Please pass both points to PUBLICATION #21: await the publisher, and put the held signature on the entry.

2. **The steps after commit, run inside the Durable Object (R42 → R6, R39).** Copying materials into the published bucket (R39) and assembling the container (R6) need the Worker's `env` (CAPTURES, PUBLISHED) and a stub that reaches the plane's own ops. `plane/store.mjs:237` builds `ratificationOf(ctx)` with neither. My choice, per the Suggestion: `ratificationOf` takes an optional `worker: {env, stub}`. When it has one, R42 copies and assembles in-process. Without one, R42's answer names both steps as not done, and a re-sent `op=caseratify` with the same signature converges them: its `existed` answer now also copies the materials and assembles a complete case that has no container yet. R37's `openSeals` runs in-process either way. Plane (L11) needs to pass `worker` for this to work in a deployed copy. I'll file that as a REPORT unless you rule otherwise.

3. **Which entities R41's `ties` asks about.** My reading of K1816: the `people:` rows' `person`; the `member_ties:` rows' `entity`; and the payer and payee (`money.readFact`, read as the signer) of every money fact the `people:` rows' `places` name as `money <MNY-id>`. The signed bytes name no other money fact; the calculations block carries input hashes, not fact ids. The ties are read as `people.tiesConcerning({entities, member, viewer: member:<signer>})`, one signer (the verified signature's member). Each tie is recorded as `{tie_id, entity, withdrawn: false}` in `tie_id` order, because `tiesConcerning` answers only ties not withdrawn.
