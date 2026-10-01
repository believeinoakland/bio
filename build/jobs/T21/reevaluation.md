# reevaluation (T21)

**Status** · session_01WehQaP3PPKJRJ5F5JBf8E4 · depth 2 · WORKING · handled B1

## J1 · REPORT

For BOB (nothing blocks; carried on, on my reading):
1. **Stale artifact.** My change is under `bio-plane/src/` (`reevaluation/index.mjs`), so the plane's bundle `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` are stale. I regenerated nothing (manifest, "Generated artifacts").
2. **Where R16's project cause can surface (a reading, no change asked).** A new basis leg naming a project is refused at the gate (C-2.8: "a leg rests on information or on another inquiry"). So `wp_retraction` reaches a dependent only through a leg the record already holds (a replayed, legacy leg; the tests lay one down that way), and otherwise through R9, `changesOf({findings: [<project>]})`, which answers the project's own causes. This is the same reach the old `workproduct_state` arm had. If R16 means the cause should also reach findings that rest on the case's members (not on the project), that would be a requirement change: yours to word.
3. **Pre-existing failures, not this job's.** `node --test test/m/` gives tests 4697, pass 4635, fail 42 (todo 20). The failing test titles are byte-identical with my change stashed (both runs: 43 `✖` lines). They are mostly `filings` (R1–R19), plus project-stage's "R1 R2 one project through the four stages" and control-plane's "R43, R22: every code decorated before the catalogue's end…" (control-plane: 92 pass, 1 fail, the same with or without my change).
4. **`workproduct_state` elsewhere.** It still appears in `record-grammar` (`bundle.mjs`, its test fixtures), `intent` (`checks.mjs`, `grammar.mjs`, `index.mjs`) and `gate.mjs`. These are those modules' own grammar, and K899 (3) retires the field. reevaluation no longer reads it; only a comment names it.
