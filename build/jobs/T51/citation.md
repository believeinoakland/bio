# citation (T51)

**Status** · session_018wkgQYFa889na4frSPWfKx · depth 2 · COMPLETE · handled B1

## J1 · REPORT

Flag for BOB (not changed here). `docs/development/ux-substrate/screens/words-reads.json` lists 61 citation strings as `unkeyed` (the design's list; `checks/words.mjs` does not count them, so `citation` has no failure). Several are member-read refusal `detail`s and session-log lines (for example "citations live on the citing object, and this is neither a case nor a question…", "the reasons appended to these citations would push bundle.md past the 1MB inline limit", the "Trigger: selection" and "Changes:" log lines). setup-words R13 names a refusal's `detail` among the sentences a member reads (K3964). I left them as the design's list has them: converting 61 member-facing refusal texts is a design call, not a check finding. Please settle with the design stream (K3944): convert them, or keep them unkeyed. Two lines I did key: the found-passage trigger and the every-member NOWHERE tail (citation.index.trigger_a_part_found_in_capture, citation.index.part_named_written_nowhere); rows.mjs is stale for them until the layer close, as setup-words --check notes.
