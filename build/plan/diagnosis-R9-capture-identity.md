# Diagnosis R9 capture identity (G127c, K4833; read-only; diagnosis worker; tranche/T51 at bab227d868, control-plane's round-8 kit from origin/job/T51/control-plane 8d3245fff0)
Method: plan G127c read whole; `provenance/index.mjs` (#check 1640-1740, #project 600-650, schema.mjs:12), `screens-intake/capture.mjs:170-205`, `acquisition/index.mjs:1778`, `acquisition/unpack.mjs:162`; the round-8 kit (`r8-kit.mjs` `pdfOf` :90, `r8-seam-capture.mjs` `served` :38). Scratch test: `/tmp/claude-0/-home-user-bio/6246add5-e469-55ee-be1e-aa5a881c3837/scratchpad/g127c-repro.test.mjs` (copied to `bio-plane/test/m/control-plane/zz-g127c.test.mjs` of a throwaway worktree, with a temporary `console.log` at the refusal, `G127C-DIAG`; the worktree is removed). Real Worker, object, R2 under Miniflare; no live site.

## Cause: H1 CONFIRMED. A shared PART digest (the 8 MiB cut) is a register row keyed on `capture_sha`; the second bundle's part row finds the first bundle as its "home".
Not H2 (no whole equals a part), not H3 (`wholes` was `[]`; no subresource or receipt in the register list).

## Reproduction (three runs, same result each)
Command: `cd bio-plane && node --test test/m/control-plane/zz-g127c.test.mjs` (about 78 s). Inputs: the kit's `pdfOf(words, 10 MiB - 1.5k)`, called twice: `W1="R9 alpha the first page words"`, `W2="R9 betaa the other page words"` (same length, 29 chars). Both are the same size and carry the same filler stream (`pad`, seeded the same for every file of a size); only the page-words stream differs. Served by outbound upstream with `Content-Length`; two members (`person("g127c-ann")`, `person("g127c-bea")`, capability `contribute`) each `op=acquire` one; `LARGE_DECLARED` gives `fetch_pending`; the plane's alarm delivers and files (`promoteDocument`, the same register list as the Add screen).
- Digests (computed outside, `scratchpad/parts.mjs`): file 1 whole `cb29880c...`, part 1 `bcb2ffe7...`, part 2 `d5d736a4...`; file 2 whole `29165899...`, part 1 `cbffa9f0...`, part 2 `d5d736a4...`. The wholes differ; part 1 differs (the words sit at offset ~1000, inside the first 8 MiB); **part 2 (bytes 8 MiB to the end) is byte-equal** because same-length words leave every later offset unmoved.
- First member: `heldat` true, bundle `INFO-2026-0001-one-pdf`.
- Second member: `heldat` false; founder's `op=owedwork&sha=<session>`: `kind fetch`, `state final`, `attempts 1`, `why CAPTURE_HELD_BY_ANOTHER_BUNDLE`, `detail {}` (the owed row carries no sha, kind or holder).
- Refusal's inputs (the temporary log at `provenance/index.mjs:1727`): bundleId `INFO-2026-0002-two-pdf`; `shas` = [file 2 whole `29165899...`, file 2 part 1 `cbffa9f0...`, part 2 `d5d736a4...`] (all three from `regs`, keys `sha256,path,encoding,bytes`; `wholesOfFiles` empty); `homes` = [`{capture_sha: d5d736a4..., bundle_id: INFO-2026-0001-one-pdf}`]. The refusing digest is the shared PART 2.
- Control (same command, `W2 = "R9 betaa the other page words, longer"`, 8 bytes longer, so the filler is shifted and part 2 differs): both held, no refusal. A 3 MB pair never reaches the alarm path (answered inline, filed by the screen) and has one part equal to its whole: not a case.
- The plan's own wording (first 9 MB the same, part 1 shared) is the same mechanism with part 1; any shared part triggers it.

## Root cause with evidence
1. `screens-intake/capture.mjs:190` builds the promote `register` as the whole (:189) plus ONE ROW PER PART (`parts.map(... sha256: p.sha256 ...)`), and `files` carry the parts as paths with `blobSha` (:182). The parts come from `acquisition/index.mjs:1778` (`parts: parts.map(... snapshots/<name>.partNNN ...)`), cut by the 8 MiB `PART` (storeChunks, `acquisition/unpack.mjs:162`).
2. `provenance/schema.mjs:13`: `register.capture_sha TEXT PRIMARY KEY`. A part is a row in the same key space as a document.
3. `provenance/index.mjs:1719` `shas` = every `regs` entry (parts included) plus the wholes; :1721-1724 asks for any row of another existing bundle; :1729 refuses. The part 2 row of bundle 0001 is that row. The refusal text even says "capture d5d736a4... ... already registered under INFO-2026-0001" for what is not a document.
4. Were the refusal merely relaxed, `#project` (:629-646) upserts `bundle_id=excluded.bundle_id` on `capture_sha` and would MOVE part 2's row from bundle 0001 to 0002 (the comment at :600-624 says why D-179 exists). So the check is right to fire on a key that is not unique per document: the defect is that parts are keyed like wholes (N20's family, G127a).
5. Why N20 was not seen as this: N20/G127a say "a part shared by two documents"; here nobody shares a DOCUMENT; two different PDFs share only filler. It is the same register rule, hit at promotion (refusal) rather than at read (`NO_HOME` / first-wins).

## Why the tests missed it
- Fixtures held one document per digest: the capture seam tests' PDFs were each unique, and r8-seam-capture.mjs:42-43 records that the author HIT this ("a delivery of a second file whose filler is the same is refused by the record (found at the first run)") and worked around it by randomising 20000 filler bytes per file (`served`, :44-45). The red was designed away, not filed as a cause.
- `pdfOf` (r8-kit.mjs:90) makes every file of a size share its filler; only different-length words moved it, so tests that varied word length passed by luck.
- Provenance module tests register at most one multipart capture or the same bundle; none promotes two different bundles with one equal part (G127a notes: "no fixture shares a part").
- Files under 8 MiB are one part equal to the whole, so the part rows never differ from whole rows: small fixtures cannot show it.
- The refusal reaches the member only as an owed `final` fetch row with `detail {}`; nothing asserted on the second member's held state.

## Failing-first tests
1. Owner provenance (module interface, L): `promote` as bundle A with register [whole A, partA1, partShared] and files naming the parts, then `promote` as bundle B with register [whole B, partB1, partShared]: B must be accepted, A's and B's `parts` rows each still read under their own bundle (no row moved), and `CAPTURE_HELD_BY_ANOTHER_BUNDLE` only when B registers A's WHOLE sha. Entry: `store.promote` -> `#check`/`#project`. Red today at :1729.
2. Owner control-plane (seam, `r9-seam-identity.test.mjs` on `makeKit`, the scratch test promoted): two members, two 10 MiB `pdfOf` of same-length words and SHARED filler (no randomising), both `heldat` true, each reads own document; plus the same file by two members refused for the whole only. The kit's `served` must stop randomising the filler for this test.
3. Capture (screen path): `promoteDocument` of a multipart document whose part equals another bundle's part.
Fix home (for BOB): the fix is G127a's (whole is the only key; parts a per-bundle child table, not `register` rows, and `homes` over wholes only); G127c adds no second mechanism. Do not relax :1729 alone (point 4). Logging: the refusal's detail should say `kind: whole|part` and the owed row should carry the refused sha.

## Platform check
- L (Miniflare, real Worker and provenance): reproduced three times, control passes (above).
- P (live): not run (no site contacted). The P in the plan holds: two small PDFs cannot show it; they must exceed 8 MiB (two 9-10 MB PDFs with same-length words and the same filler stream) on biosmoke8, read-only afterwards.
- N: not a platform limit: code defect, same under any runtime.
