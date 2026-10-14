# screens-publish (T49)

**Status** · session_016LMFaLD8DrK4YxdZxPyQuM · depth 2 · WORKING · handled B4

## J1 · QUESTION

Q1 (screens-publish, T49-27). My best reading is in each item below. I carry on with it; the first two are the ones that may need BOB.

1. **Measured first** (START's item 1). On the composed public-read world:
   - `verify` by `sha256` answers as R22 reads it, public, with no credential: `{published, matches}`. It matches a finding's pinned hash (kind `bundle`) and an evidence file's hash (kind `document` or `observation`, `bundle_id` the evidence's).
   - `publishedcase` by `sha256` resolves only a finding's pinned hash. An evidence file's hash answers `NOT_PUBLISHED` (measured with a document's and an observation's capture hash). So R22's "{n} and {finding} from `publishedcase` read by that sha256" cannot name the finding for a file, which is the usual case.
   - `statementack` is admitted at the grant door (control-plane R20; `stamps.test.mjs` R20): the secret and the `reason` ride in the POST body, the draft in the query.
   - **My reading, built:** the page sends `verify` then `publishedcase`, each with only the hash. If `publishedcase` names a finding of the edition on the page, that is `{n}`/`{finding}`. If it does not (a file), the finding comes from the edition's own `files` (each part carries `sha256` and `finding`, public-read R3, R23). So "a pinned evidence hash draws the finding" holds on the real plane. If you would rather the plane resolve file hashes in `publishedcase` (a public-read change), say so and the fallback goes.
   - A hash `verify` finds that is no finding's file (for example the case document's hash) draws `published.check.no`; no key says "published, but not evidence". Tell me if one is wanted.
2. **Needs BOB: the shell's registry copy.** `interface-shell` `checkScreens` throws, for every page it serves, on an act that is not the registry's for that screen. Its `SCREEN_REGISTRY` (wizard-scripts' generated `screen-registry.mjs`, source commit `4664e8efd4`) lists `review-outside` with `["reviewcomment"]` only; the design's `registry.json` now in the tree lists `statementack` too (that is R10's red). R23 adds the act, so with my change `interfacePage` throws `screen review-outside's act statementack is not the registry's for it` until `screen-registry.mjs` is regenerated from the current `registry.json` (`build-data.mjs`). No T49 job owns wizard-scripts. I do not touch it. On my branch it passes only with that file patched in a scratch copy. Please regenerate it, or tell me who does, before this module merges.
3. **For the requirements.** `SCREEN_WORDS` is now an empty list (R24 removes the module's rows); the Provides line can drop it. Two sentences I used that R22/R23 do not name: a malformed fingerprint draws `published.check.field.help` (no "needed" key exists), and R23's empty note and `STATEMENT_ACK_NO_REASON` draw `screen.case-editor.ack.reason.needed`.
