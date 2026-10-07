# pdf-reader (T35)

**Status** · session_01Jry3dXC9WHUGbknu4WMyTM · depth 2 · WORKING · handled B2

## J1 · QUESTION

R36 (`active`) leaves six details open. I am building on the readings below and carrying on; nothing here blocks me. Answer only where you would rule differently.

1. **Which key `where.key` names.** The innermost key whose value shows the finding: `OpenAction`, `AA`, `JS`, `S` (for `/S /JavaScript` and `/S /Launch`), `JavaScript` (the names tree), `XFA`, `Subtype` or `RichMediaContent`, `Filter` (the Standard handler's dict), `FS` (an attachment annotation), `Names` (a node of the `/EmbeddedFiles` tree). A finding inside a direct dictionary, such as an annotation's inline `/A << /S /Launch >>`, has `object` set to the indirect object that encloses it and `key` set to the inner key (`S`).
2. **One item per dictionary per kind.** A JavaScript action carrying both `/S /JavaScript` and `/JS` is one `javascript` item, at the first of those keys in written order. The same applies to a `/RichMedia` annotation with `/RichMediaContent`. Embedded files are the exception: there is one item per file, so a tree node naming three files gives three items.
3. **Keys found anywhere.** Every examined dictionary is checked, not only the catalog, a page, an annotation or `/AcroForm`. So an `/OpenAction`, `/AA` or `/XFA` in a stray dictionary is still listed. This is the conservative choice, and it is what PDFiD counts.
4. **`detail` where R36 is silent.** `javascript`, `xfa` and `rich-media` have `null`. `launch` has the launched file's name when the action states one (`/F` as a string, or a file specification's `/UF` or `/F`, also under `/Win`), otherwise `null`. `open-action` with an action dictionary that has no `/S` has `null`. `additional-actions` lists its keys with the slash, decoded, as written: `["/O", "/C"]`.
5. **`embedded-file`.** There is one item for each `FileAttachment` annotation and each `/EmbeddedFiles` tree entry, and `detail` is R5's `name`. That covers every R5 record. It also covers an attachment annotation that is not on any page, which R5 does not record (R36: "every object ... is examined"). An orphan `/Type /EmbeddedFile` stream that nothing reaches is NOT listed, because nothing in it can act.
6. **Order and R8.** Findings come in object-number order and, within an object, in the order a depth-first walk meets the keys. `unread` items come last, in the order `objstm_undecodable` then `encrypted`, each at most once. I do not change R8: object streams are still attempted in an encrypted document, and in practice they fail on ciphertext. `unread: encrypted` is listed whenever R23 says the document is encrypted.
