# duties (T48)

**Status** · session_01XVQxUC4jHBQE5EcYVKTZdU · depth 2 · RUNNING until 2026-10-14T13:07:29Z (the tests of the 20 modules that use duties) · handled B2

## J1 · QUESTION

R33's mapping, two paths that fit no code exactly; my best readings, on which I proceed: (1) a required response (R30) whose governing view holds SEVERAL deadlines a body owes the report's issuer and none named → `due_not_computed` (the profiles do hold rules, so `deadline_not_held`'s 'holds no rule' would be false; zero such deadlines → `deadline_not_held`). (2) no match held, and civil-time cannot settle whether asOf is past a due date held at a coarse precision without candidates (e.g. a commitment date of month precision) → `due_between_days` (the due date depends on a day the record does not settle); `order_unsettled` I keep for a matched event's comparison not settled by precision, and a matched event against a due with candidates (civil-time's POSSIBLY_OVERDUE) → `due_between_days`. A matched or measured occurrence whose due is undetermined takes the due's own code. Say if either should differ.
