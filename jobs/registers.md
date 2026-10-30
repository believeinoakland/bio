# registers (transient)

**Status** · REGISTERS #4 · session_01RAN5ekPTzwHFU3miqXtwqf · WAITING: R20's slow transactions at 1,000,000 rows are reading batches (250-617 ms) at every table size: measuring whether they are garbage-collection pauses; R23 passed at 27b860de; R12/R67 running at f69c2756 · PR #60
**Runs** · 1
**Owed** · none
**Model** · opus
**Review** · review · 4,300 added lines (round-1 code taken in whole), a large diff; thin evidence: R12, R20, R23, R67 marked met while their 1,000,000-row bound is unmeasured (suite runs 30,000), and R72 marked met with its packaged half a test.todo · concerns: new module (not on main); diff of 4358 lines (over 400); provided service changed (60 export line(s) differ) · gaps: 20 · 2026-10-30
**Reviews** · 1
