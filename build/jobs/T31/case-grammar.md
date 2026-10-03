# case-grammar (T31)

**Status** · session_01PgEhNJ94yAy3KBKUN6MKcr · depth 2 · WORKING · handled B1

## J1 · QUESTION

R14 says the complete edition "is always light ... declares only the light colour scheme" (DEC-122 (2), N528), and also that a `/6` (or earlier) case file renders byte for byte as before T31, with a test proving it (DEC-124, K1365 (1)). Adding `<meta name="color-scheme" content="light">` to a `/6` edition changes its bytes, so both cannot hold for `/6`.

My best reading, which I am building on: the light-only declaration is added to `/7` editions only; `/6` and earlier stay byte-identical. A `/6` edition already sets its own light colours (`color:#1b1b1b; background:#fff`) and has no `prefers-color-scheme` rule, so it is light-only in effect, just without the declaration. This keeps every published `/6` case file re-verifying byte for byte, which K1365 (1) gave as the reason for the format split. The test: a `/7` edition has the declaration and no `prefers-color-scheme` rule; a `/6` edition matches its pre-T31 bytes exactly.

The other choice, adding the declaration to every edition, would break the byte-identity test and every `/6` case file's complete-edition hash.
