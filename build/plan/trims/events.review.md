# events.md rewrite: review of gaps

Original: /home/user/civicsmith/build/requirements/events.md. Rewrite: scratchpad/trim/events.md. Each gap: the original's words, the rewrite's words, and the text that restores it.

## GAP 1: R27, limit is clamped, not refused
- Original: "`limit` is clamped to 1–500 (default 100), with `truncated` by reading one past."
- Rewrite: "`limit` 1–500 (default 100), `truncated` by one past."
- Restore: "`limit` clamped to 1–500 (default 100)". This also covers R29, R33, R53 and R57, which say "as R27". Without "clamped", an out-of-range limit could be read as refused.

## GAP 2: R46, limit is clamped
- Original: "`limit` clamped to 1–500 (default 100), `truncated` by reading one past."
- Rewrite: "`limit` 1–500 (default 100), `truncated` by one past"
- Restore: "`limit` clamped to 1–500 (default 100)".

## GAP 3: R46, what `count` holds
- Original: "`count` is the number answered, and the answer says these are the held uses this viewer may see"
- Rewrite: "`count`, stated as the held uses this viewer may see"
- Restore: "`count`, the number answered; the answer says these are the held uses this viewer may see".

## GAP 4: R49, limit is clamped
- Original: "`limit` is clamped to 1–500 (default 100), `truncated` by reading one past."
- Rewrite: "`limit` 1–500 (default 100), `truncated` by one past."
- Restore: "`limit` clamped to 1–500 (default 100)".

## GAP 5: R49, which refusals take the special shape
- Original: "`VIEWER_MISSING` and `EXTENT_MALFORMED` are answered `{ok: false, refused, code, reason, why}`"
- Rewrite: "Refusals, writing nothing: `VIEWER_MISSING` (...), `NO_SHA`, `EXTENT_MALFORMED` (...); these two answer `{ok: false, refused, code, reason, why}`". Three codes are listed, so "these two" could mean `NO_SHA` and `EXTENT_MALFORMED`.
- Restore: "`VIEWER_MISSING` and `EXTENT_MALFORMED` answer `{ok: false, refused, code, reason, why}`".

## GAP 6: R49, the no-catalogue-row rule is broadened
- Original: "add no catalogue row in any module reading in this shape (K231: one code, one row; K2116)"
- Rewrite: "no catalogue row in any module"
- Restore: "no catalogue row in any module reading in this shape".

## GAP 7: R50, the fields of each participant are lost
- Original: "`participants`, each participant of the event as R26 answers it (entity, role, vote value, attestation, and R12's two grades)"
- Rewrite: "`participants` (as R26 with R12's grades, ...)". R26 itself does not list these fields.
- Restore: "`participants` (as R26: entity, role, vote value, attestation, and R12's two grades, ...)".

## GAP 8: R51, how a `precedes` relation is cited
- Original: "It is cited as every relation is (R17: a capture extent stating the order, or a member's testimony, graded D)"
- Rewrite: "cited and graded as R17". R17 only requires an attestation, so a dated fact would now be allowed.
- Restore: "cited by a capture extent stating the order, or a member's testimony graded D (R17)".

## GAP 9: R54, test content not in the rule
- Original: "each answers `why` a `{key, vars}` whose `word(key, vars)` is non-empty; every kind R35 registers has a word that equals `word` of its `label.<set>.<value>` key"
- Rewrite: "Tests assert keys, never sentences." The rule no longer says that each key must resolve to a non-empty word, or that every kind R35 registers has a word.
- Restore: "Each such key's `word(key, vars)` is non-empty, and every kind R35 registers has a word equal to `word` of its `label.<set>.<value>` key."

## GAP 10: R59, what the absence rule means here
- Original: "R41's absence rule is unchanged (a row a later reading no longer states is not an event that ended, and no event is deleted)."
- Rewrite: "R41's absence rule stands." R41 does not say that no event is deleted.
- Restore: "R41's absence rule stands: a row a later reading no longer states is not an event that ended, and no event is deleted."
