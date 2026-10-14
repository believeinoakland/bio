# screens-publish (T47)

**Status** · session_01H1xqnxGLp6rmKJGKxAwv2Z · depth 2 · WORKING · handled B8

## J1 · QUESTION

Three questions, each with my best reading; I carry on building on these readings and stop only if an answer changes what I build.

1. **Unmerged providers.** My screens rest on L11 work not yet merged: interface-shell R30 (public frame), R34 (password again), R40–R42 (`cs.signer`), R44; wizard-scripts R35 (the registry with `review-outside` and `ceremony`'s 11 acts, `signerregisterown`, `signrequest`, `publishatmove`, `publishatcancel`); op-declarations T47-53 (`statementack`, `reviewcomment`, `publishpreflight`, `publishtensions` in `SESSION_OPS.member`; `signrequest` in `OPS`); setup-words R7 (`signing.ceremony.*`, `screen.review-outside.*` and the new act labels). Best reading: I build to those requirements as written and test through interface-shell's harness; tests that need an unmerged provider fail until it merges; I merge `tranche/T47` at each CHANGE that announces one, and post COMPLETE only when everything passes. I build no stand-in for a provider's service.

2. **`cs.signer`'s interface** (interface-shell R40–R41 name the behaviour, not the methods). Best reading, for INTERFACE-SHELL #2 to confirm or correct through you: `cs.signer.sign([{label, bytes, namespace}])` answers a promise of `{ok: true, signatures: [armored SSHSIG, …]}` in list order, or `{ok: false, declined: true}`; `cs.signer.register({keep})` makes the key (kept only when `keep`) and answers `{ok: true, keyB64}`, the wire public key `signerregisterown` takes as `keyB64`; "Use a key file you already have" is the kit's own control inside `sign`. My ceremony draws the keep tick (`signing.ceremony.keepkey`) and sends `signerregisterown` with `register`'s `keyB64`.

3. **What the sitting signs (R13).** The case statement is `casedocument`'s `sign.statement` (namespace `bio-ratify`) for the edition `publish` prepared. Per finding: `ratifyStatement(target, bundleSha)` over `publish`'s `findings[]`. Per piece of evidence: no op answers a list with shas; best reading: the rows of `casedocument`'s `citations` (`{target, version}`), `version` the sha the edition pinned, each once and not already a finding. Then `caseratify`/`publishat` carry `members: [{id, sha, signature}]` (ratification R52 is merged, so no `ratify` re-point is needed: R13's "until R52 is merged" no longer applies), and the per-member answers are read from `sitting`.

## J2 · QUESTION

Five more points found while building, each with my best reading. This adds to J1 and replaces nothing. I build on these readings and stop only if an answer changes what I build.

1. **The kit has no screen-owned controls besides acts, links and fields.** The shell binds clicks only on `data-act`, `data-nav` and its own `data-shell`, with no change events and no pointer position. So R4's "the member draws rectangles on the photo" cannot be drawn, and neither can R12's "one button" that follows the choice of now or a set time. The photo itself also cannot be shown, because an `<img>` carries no `Authorization` header. Best reading for T47: R4's areas are typed in the photo's pixels (left, top, width, height, and what each covers), one area per `obscuremark`, plus "Nothing to obscure" (`areas: []`). R12 draws both buttons, "Sign and publish now" and "Sign now and publish at a set time", with the date and time fields beside the second. Drawing on the photo, and one button that switches, need an interface-shell kit addition (a later `CHANGE` or T48). I record this as found in interface-shell.
2. **review-outside's fragment (R17).** A screen's functions may not read `location`. Best reading: the shell takes `#grant=` off the address on load and hands it in as `view.fragment`, the raw fragment, kept in page memory only (interface-shell R9's `/app/review` route). That is an interface-shell point for INTERFACE-SHELL #2: please confirm the name or give the right one.
3. **`publishededitions` is not public** (`classes: ["admin","member","probe"]`), and its `id` is a finding's id. So R6's public page cannot call it with no credential. Best reading: `published` draws the edition list from `publishedcase`'s own `editions` and does not call `publishededitions`. R6's naming of it is then a wording point (BOB's).
4. **`reviewgrant` takes no end date.** It takes only `draft` and `recipient` (one line, at most 200 characters). R2 asks for a name, a role and an end date. Best reading: the screen sends `recipient` as "name · role · end date" and also `until` in the body (ignored today). Nothing enforces the end date, so the reader's link works until "Stop sharing". I record this as a finding in `review`, against R2 and DEC-100.
5. **The case editor's draft text.** R1 names `casedrafts`, `casedocument`, `casecheck` and `whatchangeddrafts`. None of these answers a draft's authored scope, what it leaves out, its acknowledgements or the people it names (`observations`). Best reading: the editor also reads `reviewcopy` for the chosen draft, which answers all of that for a member. R1's list is then a wording point. "Externally compliant" is read from that answer's `gates`.

## J3 · QUESTION

Answering K3147 raises two things for R49 and one for R3. Each has my best reading. Until the shell merges I keep the typed fallback, and the rest of the job goes on.

1. **R49's signatures, to be fixed with INTERFACE-SHELL #2.** My best reading:
   - `cs.image(op, params, {alt})` answers the HTML of the image.
   - `cs.areas(imageHtml, {id, areas, label})` answers the HTML of the control. Its rectangles are read at the act with `cs.value(id)` as `[{left, top, width, height}]`.
   - The kind of each area (a person, a number plate, a city staff member with a reason) is named in the screen's own fields beside it, one row per area. The control does not carry it.
   - `cs.choice(id, labelKey, options, {acts: {<value>: op}})` makes the one button follow the choice. For example `{now: "caseratify", at: "publishat"}`, with the date and time fields shown only while "at" is chosen.

   Please confirm these, or give the names INTERFACE-SHELL #2 builds.
2. **Which op `cs.image` reads for a photo.** The Photos step knows each photo by its capture sha (`photosOf`' `sha`, `ref`). Best reading: the member reads the original through the op `open-file` uses for a capture's bytes, with `{capture: sha}`. If the right op is another one, please name it.
3. **R3's wizard mark.** screens-wizards R7 says the ceremony "carries the required Publication ceremony as its wizard mark". Best reading: the shell or screens-wizards draws a screen's marks from `wizardsat` for the screen shown, and this module draws nothing for it. If instead each screen draws its own marks, I need the kit control that starts the guide, because `cs.wizard` starts it but answers no control. Please say which.

## J4 · REPORT

B4 done: `tranche/T47` (setup-words, instance-setup, wizard-scripts, op-grades) is merged into my branch and pushed. My tests against it: **1 of 48 pass.** Every other test stops at the same point: `interfacePage` refuses the ceremony because `OPS` has no `signrequest`. That is op-declarations T47-53, not yet merged.

To see what remains after that, I added `signrequest` to `OPS`, and `statementack`, `reviewcomment`, `publishpreflight` and `publishtensions` to `SESSION_OPS.member`, in my working tree only, then reverted. With that, **31 of 48 pass**. setup-words' words now carry every key my screens draw, and no own row shadows them. The other 17 wait on interface-shell:
- the public and published frames with no session (R30, R46): published, doorbell, review-outside;
- `view.fragment.grant` (R46): review-outside;
- `cs.signer` (R47): ceremony R13–R15, docket R16, R11's signature check.

Nothing in my own module is failing for a reason of its own. J3 (R49's names, the photo's op, R3's wizard mark) is still open.

## J5 · REPORT

B6–B8 done: `tranche/T47` is merged into my branch at K3157 and pushed. My tests on `tranche/T47` alone: **22 of 48 pass.** Each of the 26 failures needs interface-shell, which is not yet merged: the public and published frames, `view.fragment.grant`, R49's `cs.image`/`cs.areas`/`cs.choice` with `acts`, and `cs.signer`.

Over `tranche/T47` plus `job/T47/interface-shell` (INTERFACE-SHELL #2's J5 head), merged in a scratch worktree and never committed: **48 of 48 pass**, using the shell's real harness. That includes:
- B7's notes: `bootstrap`, the session record in localStorage, `{t, e, d, w}`;
- signing through the kit's own signer: a kept non-extractable key in the IndexedDB stand-in, its "What your key signs, exactly" dialog confirmed or declined, and real SSHSIG signatures;
- the areas drawn on the photo with the pointer;
- the one switching button.

Changes since J4:
- R4 and R12 now use R49 alone. The typed fallback is gone, as K3147 said.
- The photo is read through `openoriginal` `{capture}` (K3150).
- Nothing is drawn for R3's wizard mark (K3150 (3)).

Format: 0 failures. I post COMPLETE once interface-shell merges and the full checks run on the merged branch.

Noted, not mine: INTERFACE-SHELL #2's J4. `answer-envelope`'s `img-src` lacks `blob:`, so in a browser the ceremony's photos would not show until it is added.
