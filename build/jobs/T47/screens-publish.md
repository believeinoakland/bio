# screens-publish (T47)

**Status** · session_01H1xqnxGLp6rmKJGKxAwv2Z · depth 2 · WORKING · handled B1

## J1 · QUESTION

Three questions, each with my best reading; I carry on building on these readings and stop only if an answer changes what I build.

1. **Unmerged providers.** My screens rest on L11 work not yet merged: interface-shell R30 (public frame), R34 (password again), R40–R42 (`cs.signer`), R44; wizard-scripts R35 (the registry with `review-outside` and `ceremony`'s 11 acts, `signerregisterown`, `signrequest`, `publishatmove`, `publishatcancel`); op-declarations T47-53 (`statementack`, `reviewcomment`, `publishpreflight`, `publishtensions` in `SESSION_OPS.member`; `signrequest` in `OPS`); setup-words R7 (`signing.ceremony.*`, `screen.review-outside.*` and the new act labels). Best reading: I build to those requirements as written and test through interface-shell's harness; tests that need an unmerged provider fail until it merges; I merge `tranche/T47` at each CHANGE that announces one, and post COMPLETE only when everything passes. I build no stand-in for a provider's service.

2. **`cs.signer`'s interface** (interface-shell R40–R41 name the behaviour, not the methods). Best reading, for INTERFACE-SHELL #2 to confirm or correct through you: `cs.signer.sign([{label, bytes, namespace}])` answers a promise of `{ok: true, signatures: [armored SSHSIG, …]}` in list order, or `{ok: false, declined: true}`; `cs.signer.register({keep})` makes the key (kept only when `keep`) and answers `{ok: true, keyB64}`, the wire public key `signerregisterown` takes as `keyB64`; "Use a key file you already have" is the kit's own control inside `sign`. My ceremony draws the keep tick (`signing.ceremony.keepkey`) and sends `signerregisterown` with `register`'s `keyB64`.

3. **What the sitting signs (R13).** The case statement is `casedocument`'s `sign.statement` (namespace `bio-ratify`) for the edition `publish` prepared. Per finding: `ratifyStatement(target, bundleSha)` over `publish`'s `findings[]`. Per piece of evidence: no op answers a list with shas; best reading: the rows of `casedocument`'s `citations` (`{target, version}`), `version` the sha the edition pinned, each once and not already a finding. Then `caseratify`/`publishat` carry `members: [{id, sha, signature}]` (ratification R52 is merged, so no `ratify` re-point is needed: R13's "until R52 is merged" no longer applies), and the per-member answers are read from `sitting`.
