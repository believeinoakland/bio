# Channels (PROCESS-MECHANICS §13.1)

The participants of the cross-account channel (bio K954). Each writes only its own outbox, on its own mail branch, which is never merged into `main`. The current writer's session id is the outbox's first line, not here.

| name | account | mail branch | outbox | letter | writes |
| --- | --- | --- | --- | --- | --- |
| `BOB` | primary | `mail/BOB` | `mail/BOB.md` | B | BOB and its successors |
| `UX-DESIGN` | primary | `mail/UX-DESIGN` | `mail/UX-DESIGN.md` | U | the UX design session and its successors |
