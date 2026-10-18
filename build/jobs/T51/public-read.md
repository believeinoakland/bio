# public-read (T51)

**Status** · session_018PacXfPZi6itmHMiic6QeW · depth 2 · COMPLETE · handled B1

## J1 · QUESTION

Two readings in R38 I took on my best judgement; I carry on with them and will change on your answer.

1. `pinned: false`. A case's pin names the finding edition by hash, so for a pinned member `finding.bundle_sha` equals `version_sha` by construction and `false` could never occur. My reading: when the pin names bytes nothing published holds, the case document's own stated member edition (`case_roles[].edition`) is used, if that edition is published at other bytes: the entry lists that edition as `finding` with `pinned: false` (the pin does not match the bytes published at the edition the case states). If the document states no published edition either, the case is not listed (it pins no published edition of the finding). Pin-less member (legacy) answers `pinned: null`.
2. `signed_by` is the signer of the case document of the edition (always, when a signed document is held), with `strength_from` saying whether the pair is stated in that document (`case_document`) or in the member's own signed bytes (`member_bytes`, a pre-/2 document); `finding_signed_by` is the finding's own signer. The two are never copied from each other.

Also: R38's `detail`, `strength_detail` and `signer_detail` are inline sentences in the module (as `NOT_PUBLISHED`'s are); I cannot add keys to the word table (`setup-words` is not mine).
