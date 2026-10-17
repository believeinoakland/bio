# entities (T50)

**Status** · session_01SZdSkPKdsPWvCmU3BMq2HD · depth 2 · WORKING · handled B2

## J1 · QUESTION

R55 reads 'kinds (person, office; another kind refused as R51 refuses it)'. Best reading: aliasesOf accepts any kind of the closed ENTITY_KINDS list (person and office are what retrieval asks) and refuses only NO_KIND / UNKNOWN_KIND exactly as R51 does, since refusing 'body' as UNKNOWN_KIND while naming a list that holds it would contradict itself. Alternative: only person and office are accepted. I proceed on the first; say if you want the second. Also: modules.json's entities row on tranche/T50 does not list setup-words in uses (K3632 says it was added); I need it for plan rule 6 (checks.mjs reads refusal.<CODE> by key). Not mine to edit; please add it.
