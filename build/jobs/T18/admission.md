# admission (T18)

**Status** · session_017gC7c3PAjzGoFbwwxDzDiH · depth 2 · WORKING · handled B1

## J1 · QUESTION

Two Rs the bullet asks me to propose (my best readings; I build on them while waiting, and take my copy only after your CHANGE says op-declarations merged).

(1) `group-public` — who gets op=instancegroup's whole row. The decision is `caseReader` (control-plane `index.mjs`:681–712): "who is asking, for an op that answers anybody", built only of admission's pieces (classify, scopeFor, the agent credential's task scope, resolveSession). Reading: it is admission's, copied here as `readerOf(url, env, storeName, presented, doAnswer)` (control-plane's job re-points `caseReader` to it). Proposed R16: "**R16** `readerOf` answers who is asking for a public op that answers working material only to some (op=instancegroup's whole row, op=groupidentity's claim, an unsigned case document, a review copy without a secret), and never refuses: a binding class stands as `class:<cls>` exactly when `OPS.index` admits that class and R4 lands it in the store the op reads; a live session as its viewer (the founder's `admin`, else `member:<id>`); an agent credential as its principal when R10 admits it to `index`; anyone else, an unknown or expired credential included, as no one (`""`). A store that does not answer a lookup is a silence (R6), never a statement about the caller."

(2) `project-mint`, `d526-refusal-order` — NOT_CAPABLE for a project creation without `create_projects`. Today minted a second time in op=promote's stamp block (`index.mjs`:3082), from the payload. Reading: R11 gains it, and admission provides `projectCreationGate(caps)` returning the refusal, which the door calls in the promote block (one site of the code in this module). Proposed addition to R11: "A session creating a project (a promotion with no base whose promoted type is `project`) without `create_projects` is refused the same 403 `NOT_CAPABLE` (C-38.5), `needs: "create_projects"`, `held` sorted, whatever NEEDS says of `promote`."

## J2 · QUESTION

Replaces J1 (same two proposals, unchanged) and adds one `uses` edge.

(1) and (2): as J1 — R16 `readerOf` (group-public) and R11's project-creation arm (`projectCreationGate`), words as in J1.

(3) `uses`: admission needs `record-grammar` (layer 1) for `MACHINE_CLASS_PREFIX` (`class:`), the machine viewer stamp `readerOf` answers and the viewer N407 carries (`callerViewer`: a session's viewer, an `ai` caller's `{stamp: principal, aiCred}`, else `class:<cls>`). Reading: add the edge to `modules.json` (admission uses runtime-limits, membership, op-declarations, record-grammar), as the code imports it; the architecture check fails until it is there. I also use runtime-limits' `sha256hex` (R9) for the credential lookup's digest, no new edge.
