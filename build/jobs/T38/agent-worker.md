# agent-worker (T38)

**Status** · session_01FkkvLb4mMocNRN7xTn7DXk · depth 2 · WORKING · handled B1

## J1 · QUESTION

R6's `signin` "carried with `level` `member`, `suggestions` `false` and no `secret` (one present is refused `BAD_ACCOUNT`)". My reading, which I am building on: `accountOf` refuses `BAD_ACCOUNT` a `signin` account whose `level` is not `member`, which carries a `secret` key at all (any value, empty string included), or whose `suggestions` is present and not `false` (`true` refused; absent accepted and read as off, as R56 reads an absent switch). The cascade (R32) judges a `signin` account `available` exactly when its `member` is a non-empty string (the wire's `member`, the account itself being the wire object), never checks the published-hash list for it (no secret), and `cascadeToken` hands agent-model `{kind: "signin", member}`. `subscription` is dropped from `ACCOUNT_KINDS` (now `["apikey", "signin"]`), so a `subscription` account is refused `BAD_ACCOUNT`. If you want an absent `suggestions` refused too, say so.
