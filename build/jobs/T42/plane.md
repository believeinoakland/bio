# plane (T42)

**Status** · session_019KPdWXgGFwpp8DJJjNuRry · depth 2 · WORKING · handled B0

## J1 · QUESTION

Two readings of R36, applied; the job carries on on them.

1. **The act's id.** R36: `transcription({member, project, at})` answers `act`, `transcribe:<captureSha prefix>:<instant>`. But extraction's `pageTranscribe` calls `transcription` before any digest reaches the transcriber (`extraction/index.mjs`: `reg.t.transcription({member: by, project, at})`), and the digest first arrives in the AI path's `transcribe({capture_sha, ...})`. Best reading: `act` is minted at `transcription` with the instant `at`, and its digest prefix (16 hex) is filled in when the AI path is asked for that capture: `act` is a getter, read by `countUsage` and by extraction after `tier4Extend`, so both see `transcribe:<16 hex>:<at>`. No module changes.
2. **Two outcomes R36 does not name.** (a) the capture's bytes are absent from the evidence store when the AI path runs (extraction checked them just before); (b) every asked page is refused by the renderer or over `TRANSCRIBE_IMAGE_MAX_BYTES`. Best reading: neither posts to agent-worker (no account leaves the object for nothing); each answers `{ok: false, reason}` as the unbound and silent cases do (`EVIDENCE_ABSENT`, `NO_PAGE_RENDERED`), which `tier4Extend` states as "the AI declined (<reason>)" in the reading's note. These are tier-4 seam answers, not catalogue refusals (R9 unchanged). The alternative, posting an empty `pages` for agent-worker's `BAD_PAGES`, sends the secret for nothing.
