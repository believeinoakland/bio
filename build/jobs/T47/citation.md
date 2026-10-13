# citation (T47)

**Status** · session_015r8XRY7Rnu53uAFBQvCPSA · depth 2 · WORKING · handled B2

## J1 · QUESTION

R15's last clause: "A `divided` or case-frozen inquiry (one whose document cannot be revised) is refused as any write to it is (`inquiry` R11, answered unchanged as R1 relays it)."

Found: the write path does not refuse a revision of a `divided` question. Driven through the real `inquiry` (booted on the host, `divide` accepted, the parent at `divided`), a `sever` of the parent's leg promotes and lands ok. No registered check (inquiry R11, promotion R1–R20) refuses it. So for `divided` there is nothing to relay. A case-frozen question would be refused once `basis-versions` registers its `VERSION_FROZEN` check (L6, after citation), which my relay already carries.

My best reading, which I am building: citation adds no refusal of its own. It relays the write's answer unchanged (tested with a registered step's refusal), exactly as R1 relays `inquiry` R11. Severing a `divided` question's leg therefore lands today. That is a gap in the write (a terminal question's document can be revised), which belongs to `inquiry` R11 or `promotion`, not to citation. I will also file it as a REPORT.

If you want citation itself to refuse a `divided` question (as `inquiry`'s `ground` does, `DIVIDED_CANNOT_RESTRUCTURE`), say which code and row. That would be a new code of this module's; R15 mints none today.

## J2 · REPORT

Two findings in other modules (B2 asked for the first).

1. **inquiry (N1012, per K3092): a `divided` question's document can still be revised.** Inquiry R1 and record-grammar R35 make `divided` terminal, and leg-earning's `restsOnLive` comment says a terminal question's leg "cannot be" severed. Yet no check of the write (inquiry R11, promotion R1–R20) refuses a revision of a `divided` question. Seen through the real `inquiry` booted on the host: `divide` accepted, the parent at `divided`, then citation's `sever` of the parent's leg promotes and answers ok. Against inquiry R11: a terminal question's document should not be revisable by a member's act. Citation relays the write unchanged (R15, K3092), so once the write refuses, `sever`/`reinstate` will relay that refusal with no change here.

2. **affordances: a red my merge opens.** `test/m/affordances/plane.test.mjs:423`, "R14 R9 R18: on an inquiry target, sever and reinstate track the case citations counted in cited_by_case…", asserts that `sever` through a question citing another question (`project=QY`, an inquiry) is refused (`assert.notEqual(..., "ok")`). That is R4 as it stood. R15 (T47) now lets `sever`/`reinstate` act on a question's own legs, so the act answers ok and the test fails. Before my change: affordances 243 pass, 2 fail. After: 242 pass, 3 fail; the one new red is this test. The other two are inherited (R48/R53 ACT_HELP counts) and unchanged. The offer side, offering sever/reinstate on a question's own legs, is affordances' help for R15 (requirements suggestion: "affordances' help for it is theirs"; T47-49). Please name it at my merge (K2704) until affordances' job.

No other user module moves. run-productions 58/0, answer-envelope 32/1, plane 221/2 and control-plane 242/0 have the same failures before and after. op-declarations has the same 11 inherited failures; it does not yet see `drawquestion`. op-grades is 79/0. R14's new op `drawquestion` is in `citationOps`, so the plane routes it by its spread. Its declaration and grade are op-declarations' and op-grades' (T47-48).
