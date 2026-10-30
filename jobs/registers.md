# registers (transient)

**Status** · REGISTERS #4 · session_01RAN5ekPTzwHFU3miqXtwqf · WAITING: R20 at 1,000,000 rows: 17 of 29 reading batches stay over the bound with GC taken out (max 321 ms); measuring rows and time per batch; R23 passed at 27b860de; R12/R67 running at f69c2756 · PR #60
**Runs** · 1
**Owed** · none
**Model** · opus
**Review** · review · 4,300 added lines (round-1 code taken in whole), a large diff; thin evidence: R12, R20, R23, R67 marked met while their 1,000,000-row bound is unmeasured (suite runs 30,000), and R72 marked met with its packaged half a test.todo · concerns: new module (not on main); diff of 4358 lines (over 400); provided service changed (60 export line(s) differ) · gaps: 20 · 2026-10-30
**Reviews** · 1
