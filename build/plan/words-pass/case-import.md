# case-import: the words check after the conversion (K3949)

Layer 8. 1 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/case-import/import.test.mjs:227` [?] ops: caseimport, caseimportdocument, importaccept, ... (10 of 10 not the module's own) — handlist

## Plain findings (K3957)

21 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('case-import.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/case-import/index.mjs:500` "an import, and every act on one, is a member's, signed in as themselves; this caller is..."
- plain `bio-plane/src/case-import/index.mjs:501` "no member is named as the one acting: this call carries nobody"
- plain `bio-plane/src/case-import/index.mjs:503` "only an active member of this team imports, or acts on an import"
- plain `bio-plane/src/case-import/index.mjs:644` "parts are the case file's parts, each as bytes"
- plain `bio-plane/src/case-import/index.mjs:656` "the parts do not carry a manifest that meets the case-file format"
- plain `bio-plane/src/case-import/index.mjs:663` "the manifest departs from the case-file format"
- plain `bio-plane/src/case-import/index.mjs:692` "the edition was imported meanwhile"
- plain `bio-plane/src/case-import/index.mjs:816` "no imported edition answers here by that import and edition"
- plain `bio-plane/src/case-import/index.mjs:956` "undetermined: the lens in force could not be read"
- plain `bio-plane/src/case-import/index.mjs:1037` "the bytes match no material this imported edition records as missing"
- plain `bio-plane/src/case-import/index.mjs:1109` "this edition holds no finding to accept"
- plain `bio-plane/src/case-import/index.mjs:1114` "recreated in part is stated in the member's words, in order"
- plain `bio-plane/src/case-import/index.mjs:1117` "no finding of this edition recreated, wholly or in part"
- plain `bio-plane/src/case-import/index.mjs:1126` "a finding named is not one of this edition's"
- plain `bio-plane/src/case-import/index.mjs:1132` "only a finding that recreated, wholly or in part, is accepted"
- plain `bio-plane/src/case-import/index.mjs:1172` "no acceptance of this edition is in force"
- plain `bio-plane/src/case-import/index.mjs:1178` "the acceptance was withdrawn meanwhile"
- plain `bio-plane/src/case-import/index.mjs:1224` "the finding named is not one of this edition's"
- plain `bio-plane/src/case-import/index.mjs:1249` "no open flag answers by that id"
- plain `bio-plane/src/case-import/index.mjs:1422` "the entry is not a docket entry of this team's case at its number"
- plain `bio-plane/src/case-import/index.mjs:1439` "entry 1 names a previous entry"
