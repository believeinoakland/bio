# runtime-limits (T8)

**Status** · session_01A5CFL3k1MxyKAgWRcRPdu6 · depth 2 · WORKING · handled B1

## J1 · QUESTION

**R26's `bound` on a non-string value.** R26 says `bound` is true when `env.DAEMON_TOKEN` or `env.ADMIN_TOKEN` is "present and non-empty (presence only)". It does not say what a non-string value such as `5` or `true` is. Best reading, built: presence is truthiness, exactly legacy-store's `#monitorTokenBound()` (`!!(env.DAEMON_TOKEN || env.ADMIN_TOKEN)`), so monitoring keeps its arming behaviour byte for byte when it switches over. A Worker secret is always a string, so in practice this is "a non-empty string". `token()` never spends a non-string. My R26 test covers every state of a string binding (missing, empty, live, published), and non-string values for `token()` only. It does not pin `bound` for a non-string. If you want `bound` to be `typeof v === "string" && v.length > 0` instead, say so. It is a one-line change. Not blocking: I am COMPLETE on this reading.
