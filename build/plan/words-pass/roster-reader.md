# roster-reader: the words check after the conversion (K3949)

Layer 1. 2 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `roster-reader/org-chart.mjs:130` "{} reporting relation(s) stated in words;"
- inline `roster-reader/org-chart.mjs:98` "{} line(s) name a unit or a post and {} a holder alone, below the f..."

## Plain findings (K3957)

38 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('roster-reader.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `roster-reader/columns.mjs:16` "no header was given: a table's roles are named from its header cells, a list"
- plain `roster-reader/columns.mjs:26` "the column has no header text, so no role is named"
- plain `roster-reader/columns.mjs:31` "no header word in the view names a role for it"
- plain `roster-reader/columns.mjs:31` "the view supplies no roster header words, so no column's role can be named"
- plain `roster-reader/directory-refs.mjs:27` "the entry carries no line to read a name from"
- plain `roster-reader/directory-refs.mjs:31` "one name-shaped span remains on the entry's line once its address, phone numbers and st..."
- plain `roster-reader/directory-refs.mjs:35` "no name-shaped span remains on the entry's line once its address, phone numbers and sta..."
- plain `roster-reader/lines.mjs:23` "a an and are as at be by but for from has have he her his i if in is it its of on or ou..."
- plain `roster-reader/lines.mjs:39` "office division section unit bureau department dept agency program programme services c..."
- plain `roster-reader/lines.mjs:234` "the line states a two-digit year, which is not expanded"
- plain `roster-reader/org-chart.mjs:90` "no text was read, so there are no boxes to recognise"
- plain `roster-reader/org-chart.mjs:107` "it names itself, with the view's words, as a roster and not as a chart"
- plain `roster-reader/org-chart.mjs:115` "no short line names it a chart with the view's words, so it is read as a chart on its b..."
- plain `roster-reader/org-chart.mjs:135` "no line among the document's first eight, or beside its self-naming line, states a date"
- plain `roster-reader/org-chart.mjs:137` "neither its first line nor the line before its self-naming line is a heading that names..."
- plain `roster-reader/source.mjs:31` "held as a table, read by roster-reader"
- plain `roster-reader/source.mjs:44` "no read of the store was handed to roster-reader, so no held roster is read"
- plain `roster-reader/source.mjs:50` "the store's read answered later (a promise), and a roster source answers at once, so no..."
- plain `roster-reader/source.mjs:56` "the store's read answered no list of held rosters, so no held roster is read"
- plain `roster-reader/source.mjs:70` "no roster document or roster table of this organisation is held that the viewer may see"
- plain `roster-reader/source.mjs:79` "the item is not a held roster: it is not an object"
- plain `roster-reader/source.mjs:90` "the held document carries no text to read its rows from"
- plain `roster-reader/source.mjs:92` "no text was read from the held document, so it has no rows to read"
- plain `roster-reader/source.mjs:104` "an organisation chart: a row is a post whose holder is named on its own line; a box wit..."
- plain `roster-reader/source.mjs:105` "no post in the chart names its holder on its own line"
- plain `roster-reader/source.mjs:105` "no line of the document reads as a roster row"
- plain `roster-reader/source.mjs:113` "the held table carries no header, so its columns' roles cannot be named"
- plain `roster-reader/source.mjs:116` "the held table carries no rows"
- plain `roster-reader/source.mjs:146` "no row of the table carries a value in a roster column"
- plain `roster-reader/staff-roster.mjs:92` "the line does not divide into a post and the names after it: what follows its colon is ..."
- plain `roster-reader/staff-roster.mjs:104` "the line prints staff titles and names that do not divide into one name beside its titl..."
- plain `roster-reader/staff-roster.mjs:115` "the line opens with a name but what follows it is not one of the view's staff titles, s..."
- plain `roster-reader/staff-roster.mjs:183` "a staff or membership roster"
- plain `roster-reader/staff-roster.mjs:191` "no text was read, so there are no rows to recognise"
- plain `roster-reader/staff-roster.mjs:213` "it names itself, with the view's words, as a chart and not as a roster"
- plain `roster-reader/staff-roster.mjs:221` "no short line names it a roster with the view's words, so it is read as a roster on its..."
- plain `roster-reader/staff-roster.mjs:240` "no line among the document's first eight, or beside its self-naming line, states a date"
- plain `roster-reader/staff-roster.mjs:242` "neither its first line nor the line before its self-naming line is a heading that names..."
