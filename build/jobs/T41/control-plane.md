# control-plane (T41)

**Status** · session_012E2H8wHkRtwkziNpUauYkj · depth 2 · WORKING · handled B0

## J1 · QUESTION

R73 (K2498): "`setIn`, the project the request names as the act's project context". No requirement or caller says how an `op=promote` request names that context, and promote's package has no such field today.

My best reading, on which I am building: the context is the request's `project` query parameter (`op=promote&project=<id>`), else a top-level `project` string in the promote body (as archive's promotions name theirs); trimmed, at most 200 characters; absent when neither is given. The caller's own `setIn` is always deleted first. `inquiry` then keeps it only for a project the author may see (its R54), so a named but unseen project records nothing.

Likewise `personWarningSeen`: `true` only when the request arrives by a member's own session AND the caller's body states `personWarningSeen: true` (her statement that she saw the warning); deleted for every other caller and value.

Nothing else depends on the answer; I carry on.
