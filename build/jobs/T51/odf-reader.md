# odf-reader (T51)

**Status** · session_013zPuS6aCiGt1Nqw5Gii5vD · depth 2 · WORKING · handled B1

## J1 · REPORT

Found in another module, not changed (ooxml, not odf-reader). The words check, `inline` arm, reads eight string literals in `bio-plane/src/ooxml.mjs` as sentences people read: lines 773, 834, 854, 927, 929, 933, 965 and 978 (for example "odf:{} is first but COMPRESSED (method {}, ODF requires stored)" and "odf:mimetype declares {}, but {} is ABSENT"). Lines 927, 933, 965 and 978 are the ODF mimetype diagnostics that odf-reader's detect and digest rely on through `discriminate`; the others are the OOXML part-declaration diagnostics. My read: these are developer or diagnostic signals, not member-facing text, so they may belong on the design's `unkeyed` list (K3944) rather than in `localize`. Please route to ooxml's owner. odf-reader does not depend on their wording, which its tests assert by behaviour.

Also seen, not mine: the repo-wide run reports 4839 failures (4844 before my change), all inherited from other modules' words and testcopy findings.
