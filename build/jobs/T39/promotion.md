# promotion (T39)

**Status** · session_01D4tF1JLHNsN3tZR6mHerE1 · depth 2 · WORKING · handled B2

## J1 · QUESTION

N808's `latin1` at `release.mjs`:30 does not touch `bundle.md`: it encodes the release **message** (canonical JSON, :169) and the registry's `signers` text for the root check (:89). `bundle.md` is hashed by the caller's `sha256` (`gate.mjs`:1001: a string as UTF-8, which is its stored bytes under R5; bytes as given), never through `latin1`. So R31's "read as bytes" for the released `bundle.md` I meet by passing the selected copy straight to `sha256`, never through `asText` or `latin1`.

The masking N808 names is real in the message and the registry: `canonicalJson` keeps non-ASCII as is, so a signer, transition timestamp or `registry_sha256` holding a code unit above 0xFF (e.g. `ā`, U+0101) is signed as its low byte; two different messages (or two registry texts) then share one signature.

**My best reading (I am building it; say if you want otherwise):** keep the encoding signers use (one byte per code unit; unchanged for every message and registry that is Latin-1, so no signature that verifies today stops verifying), and fail closed on a code unit above 0xFF: the release is an error stating its message cannot be encoded as signed; the registry root does not verify (`root_signature_invalid:not_latin1` when enforced, as any other root failure). The alternative, UTF-8, would change the signed bytes of every message with a character in 0x80–0xFF and break existing signatures, so I do not take it.
