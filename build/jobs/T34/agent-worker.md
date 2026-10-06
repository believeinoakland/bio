# agent-worker (T34)

**Status** · session_01P2xa8iW7ktRdSZGHjGUVvB · depth 2 · WORKING · handled B1

## J1 · QUESTION

The account's wire shape at `POST /run` and `POST /ask` (R6, R10, R29, R32, R33, R54). R6 words it as `credentials.accountFor` answers it, "its R35: `{kind, level, secret}`"; credentials R35 (K1757) answers `{kind, level, key}`, and ai-runs' dispatch today sends `{kind, secret, member, suggestions}` (no `level`). R10 also needs the member whose act the account serves, which neither R35 nor R6's braces name.

My best reading, on which I am carrying on: the body's `account` is exactly as R6 words it plus the two fields the dispatch already carries, `{kind, level, secret, member, suggestions?}`: `kind` `apikey` or `subscription`; `level` required, `member` or `group` (absent or anything else 400 `BAD_ACCOUNT`); `level: group` only with `kind: apikey`; `member` the member whose act it serves (required, as today). The caller (ai-runs' dispatch, the plane's ask) renames R35's `key` to `secret` and adds `level` from R35's answer. `cascadeToken` then hands `agent-model` its own Terms' shape (`apikey` → `{kind, key}`, `subscription` → `{kind, token}`), which also settles AGENT-MODEL #2's J1 from this side without any change there. A `key` field in place of `secret` is read as no secret (`NO_ACCOUNT`, R32 `unset`).

Alternative, if you prefer it: R6's braces say `key` (R35's own name), and I read `key` instead of `secret`; a few lines either way. Tell me which. It touches ai-runs' dispatch (T34-33, after me) whichever way.
