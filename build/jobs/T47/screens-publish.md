# screens-publish (T47)

**Status** · session_01H1xqnxGLp6rmKJGKxAwv2Z · depth 2 · COMPLETE · handled B11

## Completion (SCREENS-PUBLISH #1)

**Read whole:** `build/requirements/screens-publish.md`; the public parts of `interface-shell`, `setup-words` and `op-declarations` (my Uses); `build/layers.md`' layer-11 contract; my entry T47-63 and the plan's L11 rules; `draft-T47-interface.md`, and for the sections named `draft-T47-wayin.md`, `draft-T47-L11-fold.md` §B, C, D and `draft-T47-L6-connect.md` §3; `registry.json`, `words.json` and `mock-screens.js`/`mock-shell.js` for my eight screens; `interface-shell`'s `index.mjs`, `browser.mjs` and test harness (the kit I build on). Each op's inputs, answer and refusals were taken from its owner's handler by a helper's survey (file:line), cross-read where my screens depend on them (`case-inputs` R6, `case-disclosures` R29, `ratification` R52 and RATIFICATION #25 J2, `tasks` R19).

**Entries applied (T47-63, with K3145, K3147, K3150, K3153, K3165):** a new module, `bio-plane/src/screens-publish/`, eight registry screens on `interface-shell` R21's contract:
- `case-editor` (R1): the project's drafts; the chosen draft's ladder (`casecheck`, the copy's `gates`, published), scope and statement (`casedraft`), what it leaves out with each acknowledgement and its reason (`statementack`, `reasonField`), the people it names with their reason or "reason missing" (`attribute`), what changed (`whatchangeddrafts`, `whatchangedpropose` only while reachable, labelled machine work, `untested`); `writinghelp` under the scope and "what changed" only. The draft's text is read with `reviewcopy` (K3147 (5)).
- `review-copy` (R2): named readers with "Stop sharing"; "Share for review" (name, role, end date in the recipient line, K3147 (4)), outward, the secret shown once as `<origin>/app/review#grant=…` with "Civicsmith sends no email", page memory only, gone on leaving; comments and "Reply".
- `ceremony` (R3–R5, R12–R15): the ten steps, the current marked; the checks (`publishpreflight`, each refusal by its words, "Check again"); what is disclosed (`publishtensions`, the whole list on demand); the Photos step on `cs.image`/`cs.areas` (the original read by `openoriginal`, K3150), areas named person, plate or staff with a reason, "Nothing to obscure", marks withdrawn with a reason, the uncoverable format named; the Ties step's `publish` with `tieAttested: true`, Sign offered only after it answers; the Sign step with `signing.ceremony.who`, one button following "Now" or "At a set time" (`cs.choice` with `acts`), "What your key signs, exactly" listed, one sitting over the case statement (`casedocument`'s `sign`), each pinned finding and each cited piece of evidence, sent as one `caseratify`/`publishat` with `members` (ratification R52); declined, nothing sent; signed and waiting (`signedat`, `publishatmove`, `publishatcancel`) or published (`signednow`, the public page); `NO_ATTESTING_KEY` (and `NO_SIGNERS`, `SIG_UNKNOWN_KEY`) → `nokey` with the keep tick and `signerregisterown`; the phone sentence; `CASE_SIGNER_NOT_AN_OWNER` → `notowner` and `signrequest`. The wizard mark is the guide's (K3150 (3)).
- `published` (R6): public frame, no credential; the edition dated, its other editions (from `publishedcase`'s `editions`, K3147 (3)), whose work it is and how to read it, findings with two strengths and the bar, timeline, people named, evidence; "Check the signature" (`verify` on the manifest's sha), "Read the case".
- `imported` (R7): the imports, each finding recreated / in part / not, the four acts (the case file's bytes as one part).
- `docket` (R8, R16): entries drafted or posted; "File a docket entry" with the reason; "Post it, signed": `docketStatement` from `docketprepare`, prepared again past its hour, signed by `cs.signer` in `bio-docket`, posted with its digest.
- `doorbell` (R9): public frame, the group's public name, what happens to what is sent, file, note, secret phrase (a password field, cleared), `knock` with no credential, its refusals by this module's words, received said.
- `review-outside` (R17): published frame, `view.fragment.grant` (R46), the secret only in `reviewcopy`'s and `reviewcomment`'s bodies, the end date or "until the group stops sharing", "Send your comment".
- R10, R11: four read states everywhere (including the reads that wait on another, `parts.later`), re-reads after every act, nothing drawn prepared or signed before its answer; no secret in storage, an address or a later request.

**B10 (K3171; JOURNEY-CHECK #1 J4 (2)):** `case-editor`, `review-copy`, `ceremony`, `published` (and `docket`, by the same rule) opened with no subject in the address send no subject read and draw interface-shell R35's "Nothing is here" (`parts.subject`, `parts.nothing`, the shell's own words), one test per screen with its control. **B11 (K3179):** drawn as `shell.unavailable.nothing.title` over `shell.unavailable.nothing.says` alone, not under `screen.unavailable.name`; tested with that control.

**Readings (all answered):** J1 → K3145 (B2), J2 → K3147 (B3), J3 → K3150 (B5). Size: 1,494 module lines against an estimate of 2,600–3,200; the shell's kit carries more of the drawing than the estimate assumed.

**Deferred:** nothing of mine.

**Found in other modules:**
- `review` (R2's end date): `reviewgrant` takes no end date, so nothing ends a reader's link but "Stop sharing" (N1038, T48; K3147 (4)).
- `answer-envelope`: `img-src` lacks `blob:`, so `cs.image`'s photos are blocked in a browser until it is added (INTERFACE-SHELL #2 J4; it affects this module's Photos step).
- `screens-publish` R1 names no `reviewcopy` and R6 names `publishededitions` (not public): wording points, K3147 (3), (5).

**Files (for `modules.json`):** paths `bio-plane/src/screens-publish/` (`index.mjs`, `parts.mjs`, `words.mjs`, `case-editor.mjs`, `review-copy.mjs`, `ceremony.mjs`, `published.mjs`, `imported.mjs`, `docket.mjs`, `doorbell.mjs`, `review-outside.mjs`); tests `bio-plane/test/m/screens-publish/` (`fixtures.mjs`, `common.test.mjs`, `case-editor.test.mjs`, `review.test.mjs`, `ceremony.test.mjs`, `public.test.mjs`).

**Tests and checks** (on `job/T47/screens-publish` after merging `tranche/T47` at B11, no overlay): `node --test bio-plane/test/m/screens-publish/` 53 pass, 0 fail. With my paths in `modules.json`: `format` 0 failures; `architecture` (screens-publish) 17 product files, 0 failures; `coverage` 17 of 17; `ownership` 0 failures; `checks/run.mjs`: architecture 0 failures, format 0, channels 0; coverage's 2 failures are other modules' (none mine).

Size (session_01H1xqnxGLp6rmKJGKxAwv2Z): test runs 26, module lines 1,516

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

## J6 · COMPLETE

T47-63 is complete on `job/T47/screens-publish` (pushed): R1 to R17, each named by its tests. My record's "Completion" gives the entries, readings, findings and checks.

- **B9:** `tranche/T47` merged with interface-shell in it. With no overlay: screens-publish **48 of 48**.
- **Tightened for this merge:** the review-outside fragment is read only as R46's `view.fragment.grant`; `cs.fill` is called directly; the R4/R12 fallbacks were already gone.
- **Checks** (my paths registered in a local, uncommitted `modules.json`): format, architecture (17 files), ownership (18 files) 0 failures; coverage 17 of 17. In `checks/run.mjs`, architecture shows 0 failures; coverage's 12 failures are other modules'.
- **Files to add to `modules.json`:** paths `bio-plane/src/screens-publish/`, tests `bio-plane/test/m/screens-publish/` (each file is listed in the record).
- **Found elsewhere:**
  - `review`: no end date on a grant (N1038).
  - `answer-envelope`: `img-src` needs `blob:` for `cs.image` (INTERFACE-SHELL #2 J4); until then the ceremony's photos do not show in a browser.
  - Wording: R1 does not name `reviewcopy`, and R6 names `publishededitions`.
- **Size:** 1,494 module lines against the 2,600–3,200 estimate.

## J7 · COMPLETE

B10 (K3171) done and COMPLETE again on job/T47/screens-publish (pushed), tranche/T47 merged with control-plane in it. case-editor, review-copy, ceremony and published (and docket, by the same rule) opened with no subject in the address send no subject read and draw interface-shell R35's "Nothing is here"; one test per screen, each with its control (with the subject, it reads). Tests: screens-publish 53 of 53, no overlay. Checks: format, architecture, ownership 0 failures; coverage 17 of 17; checks/run.mjs architecture 0 (coverage's 2 failures are other modules'). Record's Completion updated.
