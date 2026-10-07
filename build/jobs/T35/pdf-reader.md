# pdf-reader (T35)

**Status** · session_01Jry3dXC9WHUGbknu4WMyTM · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R36 (`active`) leaves six details open. I am building on the readings below and carrying on; nothing here blocks me. Answer only where you would rule differently.

1. **Which key `where.key` names.** The innermost key whose value shows the finding: `OpenAction`, `AA`, `JS`, `S` (for `/S /JavaScript` and `/S /Launch`), `JavaScript` (the names tree), `XFA`, `Subtype` or `RichMediaContent`, `Filter` (the Standard handler's dict), `FS` (an attachment annotation), `Names` (a node of the `/EmbeddedFiles` tree). A finding inside a direct dictionary, such as an annotation's inline `/A << /S /Launch >>`, has `object` set to the indirect object that encloses it and `key` set to the inner key (`S`).
2. **One item per dictionary per kind.** A JavaScript action carrying both `/S /JavaScript` and `/JS` is one `javascript` item, at the first of those keys in written order. The same applies to a `/RichMedia` annotation with `/RichMediaContent`. Embedded files are the exception: there is one item per file, so a tree node naming three files gives three items.
3. **Keys found anywhere.** Every examined dictionary is checked, not only the catalog, a page, an annotation or `/AcroForm`. So an `/OpenAction`, `/AA` or `/XFA` in a stray dictionary is still listed. This is the conservative choice, and it is what PDFiD counts.
4. **`detail` where R36 is silent.** `javascript`, `xfa` and `rich-media` have `null`. `launch` has the launched file's name when the action states one (`/F` as a string, or a file specification's `/UF` or `/F`, also under `/Win`), otherwise `null`. `open-action` with an action dictionary that has no `/S` has `null`. `additional-actions` lists its keys with the slash, decoded, as written: `["/O", "/C"]`.
5. **`embedded-file`.** There is one item for each `FileAttachment` annotation and each `/EmbeddedFiles` tree entry, and `detail` is R5's `name`. That covers every R5 record. It also covers an attachment annotation that is not on any page, which R5 does not record (R36: "every object ... is examined"). An orphan `/Type /EmbeddedFile` stream that nothing reaches is NOT listed, because nothing in it can act.
6. **Order and R8.** Findings come in object-number order and, within an object, in the order a depth-first walk meets the keys. `unread` items come last, in the order `objstm_undecodable` then `encrypted`, each at most once. I do not change R8: object streams are still attempted in an encrypted document, and in practice they fail on ciphertext. `unread: encrypted` is listed whenever R23 says the document is encrypted.

## Completion

**Entries applied.** T35-10 (K1888): R36 is met. `extractPdfStructure`'s answer has a top-level `active` (`bio-plane/src/pdfstructure.mjs`, `extractActive`), built on J1's six readings, which BOB confirmed in B2 (K1917 (5)). It examines every object R8's read reaches, in object-number order, and walks each one depth-first through its direct dictionaries and arrays. Names are compared after the parser has decoded their `#xx` escapes. It lists `open-action`, `additional-actions`, `javascript`, `xfa`, `rich-media`, `launch`, `embedded-file` (each R5 record, with R5's `name`, from a shared helper `embeddedName`) and `encryption` (R23's own test), then `unread` for `objstm_undecodable` and `encrypted`. It is read only: a script's text is never read, carried or run. No DEC-149 rows are this module's.

**Deferred.** Nothing.

**Found in another module.** `pdf-worker`: its generated artifact `pdf-worker/dist/pdf-worker.bundled.mjs` (mechanics §14; it inlines `pdfstructure.mjs`) is now stale, because it does not carry `active`. pdf-worker's `structure.test.mjs` compares the bundle's output with the live source, so its "R7 every other field is extractPdfStructure's own, unchanged" and "R10 the structure fields are kept" fail (81 pass, 2 fail; 83/0 on the tranche base). This needs no code change in pdf-worker: they pass again once BOB regenerates the bundle at L1's close. Reported in J2.

**Tests and checks.**
- `node --test bio-plane/test/m/pdf-reader/`: tests 67, pass 67, fail 0 (R36: 9 new tests in `active.test.mjs`; R2's key list now includes `active`).
- `node bio-plane/test/pdfstructure.test.mjs`: `pdfstructure: 170 passed, 0 failed`.
- Negative control: with `extractActive` forced to return `[]`, 8 of the 9 R36 tests fail. The one that holds is the `[]` arm, which asserts emptiness. Restored from a pristine copy.
- Oracle: PDFiD 0.2.x over R36's first two fixtures agrees on every key it counts (`/OpenAction`, `/AA`, `/JS`/`/JavaScript` as places, `/XFA`, `/Launch`, and its obfuscated `(n)` counts). There are two differences, both by R36's own definition: `embedded-file` counts R5 records (2) where PDFiD counts `/EmbeddedFile` streams (1), and `/RichMediaContent` is listed.
- Users' tests, since R2's answer changed (step 5): format-registry 27/27; budget-doctypes 27/27; doctypes (a user since the tranche's `modules.json`) 26/26; reading-pipeline (its `m/` tests, d606, tier2-wire, pdf-worker-binding) 88/88; pdf-worker and pdf-pixels' `pdf-worker/test/` 46/47, the one failing file being the stale-bundle arms above.
- `node checks/format.mjs`: 1 failure, the inherited red 13 (test-support's `make-zip.mjs`); none is this module's.
- `node checks/architecture.mjs … pdf-reader`: 0 failures.
- `node checks/coverage.mjs … pdf-reader`: 36 of 36 live ids named by a test; 0 failures.
- `node checks/ownership.mjs … pdf-reader tranche/T35`: 0 failures.

Size (session_01Jry3dXC9WHUGbknu4WMyTM): test runs 4, module lines 3108
