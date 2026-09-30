# ratification (T16)

**Status** · session_01WThj1yrmjFsd1tK4dDXbRh · depth 2 · WORKING · handled B1

## J1 · QUESTION

R18's shape and five readings. I am building on these now; case-authoring can code against the shape today. Tell me if any is wrong.

1. **Shape.** `ratificationOf(host).caseRatifyPreflight({text, signer, viewer})` answers `{ok: true, ready, refusals}`. `refusals` lists every refusal that holds, each asked on its own (not stopping at the first), in R18's order. `ready` is true when the list is empty. Each entry is the act's own refusal body, built by the same function the act now calls. The one difference: the act's trailing envelope `store` and `tokenClass` (as appended after C-53.12, C-92.10, C-92.11, NO_SIGNERS and GATE_REFUSED) is not included, because the Durable Object side does not know the store's name. The gate's entry is the act's `{ok: false, reason: "GATE_REFUSED", gateVersion, findings}`. If something unexpected fails, the answer is `{ok: false, reason: "PREFLIGHT_UNDETERMINED", detail}`, never a throw.
2. **C-32.13 / C-32.15 from `viewer`.** R18 is given no credential class, so I read it from the control plane's viewer stamp. `class:ai` or `class:ai/<id>` is an agent credential: C-32.13, and C-32.15 also holds, both with `tokenClass: "ai"`. Any other machine identity `class:<cls>` gives C-32.15 with `tokenClass: <cls>`. A member's or the founder's session viewer gives neither. A null viewer is an internal caller and is not asked.
3. **`signer`.** A member id or its `member:<id>` spelling (case-authoring's `author`). `NO_ATTESTING_KEY` holds when no row of `membership.attestingKeys()` has that `member_id`. Like `NO_SIGNERS`, it has no catalogue row: `{ok:false, reason, code, signer, detail, remedy}`, where `remedy` names registering one's own key (`op=signerregister`, membership R89). If you want a C-row for it, say which one; promotion stamps it.
4. **CASE_SIGNER_NOT_AN_OWNER.** Asked through `membership.caseAuthority` with the deliverer not asked. R18's list names only the signer arm, and the deliverer is fixed only when the act is delivered.
5. **C-65.1 and the gate.** Both read the given text, not a stored row. C-65.1 compares the conclusion against this text through the act's one comparison (ratifyCaseDocument now passes the stored `doc.text` to the same function, so behaviour is unchanged). The gate is `runCaseGate` with `priorCase` read from `published_cases` (publication R40's read contract) and `memberBasis` from `record-core.textAtSha` at each `case_roles` pin, as publication's `caseDocumentFacts` builds them.

## J2 · REPORT

**R18 is met and tested at `b89c9dbab9` on `job/T16/ratification`. Please merge it early for case-authoring (K425).** The shape is J1's reading 1: `ratificationOf(host).caseRatifyPreflight({text, signer, viewer})` answers `{ok: true, ready, refusals}`, or `{ok: false, reason: "PREFLIGHT_UNDETERMINED", detail}`. It is tested in `test/m/ratification/preflight.test.mjs`: each entry deep-equals the act's own refusal (the Worker half's body less `store`/`tokenClass`, or the commit's), the full order is covered, nothing is written, and it never throws. R19 is pinned there too. The rest of the job (N354, N361) is also in that commit. My record and the remaining reports follow before COMPLETE.

Two things BOB should know now:
- **Six rows' `where` moved** (for promotion's stamp, N318). C-32.13, C-32.15, C-53.12, C-92.10, C-92.11 and C-65.1 now name builders in the new `src/ratification/refusals.mjs` (`machineCaseRefusal`, `operatorCaseRefusal`, `testimonyCaseRefusal`, `attributionUnchosenRefusal`, `attributionStaleRefusal`, `conclusionMovedRefusal`), with their regions moved with them. Codes, ids and translations are unchanged. The act and the pre-flight both answer through these builders, so each code keeps one literal site, as the DEC-49 guard's arm G requires. The act's wire bytes are unchanged; the module's existing act tests pass unmodified.
- **New code `NO_ATTESTING_KEY`**, the pre-flight's own. It has no catalogue row, as `NO_SIGNERS` has none (J1 item 3).
