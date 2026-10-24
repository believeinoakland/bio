# ooxml (T51)

**Status** · session_0189TCqWsfgZ58Dcm8TZihQh · depth 2 · WORKING · handled B2

## J1 · REPORT

T51-248 ooxml (words, K3949): the 8 findings are all diagnostic strings pushed into `discriminate`'s `signals` array. I changed no code: a member does not read these strings, so BOB's rule for unread strings applies (REPORT, not hidden, settled by the design's unkeyed list, K3944). Nothing else in ooxml's words file.

Findings (checks/run.mjs, words arm, ooxml):
1. ooxml.mjs:773 `declared-content-type:{} (not used for the determination)`. Pushed only when `discriminate` is given a `contentType`. No source caller passes one: docx, pptx, odf, formats-xlsx and doc-clean all call `discriminate(bytes)` with one argument. No member reads it.
2. ooxml.mjs:834 `part:{} parsed ({} defaults, {} overrides)`. Success-path signal. Its array goes out in the flavour result; no member reads the array.
3. ooxml.mjs:854 `ct:{} declared for {}, but the part is ABSENT`. Same: signal only; the member reads `why` (`declared_main_part_absent`).
4. ooxml.mjs:927 `odf:{} present but NOT the first archive member` (and 929, its second line `local-header offset {}, earliest {})`). Signal only; the member reads `why` (`odf_mimetype_not_first`).
5. ooxml.mjs:933 `odf:{} is first but COMPRESSED (method {}, ODF requires stored)`. Signal only; member reads `why` (`odf_mimetype_not_stored`).
6. ooxml.mjs:965 `odf:{} {} (first member, stored)`. Success-path signal; no member reads it.
7. ooxml.mjs:978 `odf:mimetype declares {}, but {} is ABSENT`. Signal only; member reads `why` (`declared_main_part_absent`).

Why no member reads them: `signals` leaves ooxml only inside the failure and flavour results of `discriminate`. docx.mjs:486-495, pptx.mjs:387-396, odf.mjs:648-672 and formats-xlsx.mjs:439-443 pass it on unchanged, and nothing in product source reads it: every consumer reads `why`. The two places that print signals as text, monitoring.mjs:930 (`sniffed.signals.join`) and drive.mjs:236, read the signals of formats.mjs `detectFormat`, which has its own strings and does not call `discriminate`. I traced this by grep; the chain is not exhaustive of every test fixture.

Options for BOB (my recommendation first):
A. Add these 8 ids to the design's `unkeyed` list (words-reads.json, K3944). No code change, no requirement change. Recommended.
B. Give them keys as `{key, vars}`. This changes R11's contract ("an array of strings") and touches four format entries and the signal consumers. Not recommended for diagnostics no member reads.
C. Import setup-words `localize`. This changes R23 (zero runtime dependency). Not recommended.

The job cannot reach COMPLETE on the words check until option A (or B/C) is settled, because the check counts these as findings until they are on the list. Everything else in ooxml is unchanged and the format, architecture and ownership checks read 0 failures.

## J2 · BLOCKED

Cause: needs Bob. The 8 ooxml words findings (see J1) are unread diagnostic strings. Their settlement is Bob's: option A (add the 8 ids to the design's unkeyed list, K3944) clears them; B or C changes R11 or R23. Until then checks/run.mjs keeps 8 ooxml findings and my COMPLETE would not meet the words rule. No code is changed; format, architecture and ownership read 0 failures. Waiting on your choice.

## J3 · COMPLETE

T51-248 ooxml (words, K3949): complete on BOB's ruling (B2, K3955).

Entries applied: T51-248. No code changed. The 8 `signals` strings of `discriminate` (ooxml.mjs:773, 834, 854, 927, 929, 933, 965, 978) are diagnostics no member reads, every consumer reads `why`. They are handed to the design stream for the `unkeyed` list (words-reads.json, ooxml) and accepted by name in K3955. Until that lands on tranche/T51, checks/run.mjs keeps these 8 as words findings.

Deferred: none. Found in another module: none.

Checks (civicos-process ebcc1a3, against /home/user/bio):
- format: 0 failures
- architecture: 0 failures
- ownership ooxml tranche/T51..job/T51/ooxml: 0 failures
- words: 8 ooxml findings, the 8 named above, accepted by name in K3955 pending the unkeyed list
- coverage: 33 failures repo-wide, none attributed to ooxml in the output

Tests: none run (no module code changed).

Size (session_01DQhDYhUjhzaGm67YZSpeDZ): test runs 0, module lines 0
