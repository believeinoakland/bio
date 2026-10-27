# entities: the words check after the conversion (K3949)

Layer 5. 17 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/entities/ops.test.mjs:9` [?] ops: readingname, entitycreate, entityalias, ... (12 of 21 not the module's own) — handlist
- inline `bio-plane/src/entities/index.mjs:1068` "system one that issues or lists the scheme ({}), the row its own (K..."
- inline `bio-plane/src/entities/index.mjs:1169` "a proceeding is registered with its facet {forum, kind, number}, an..."
- inline `bio-plane/src/entities/index.mjs:1209` "a proceeding is registered with its facet {forum, kind, number}, an..."
- inline `bio-plane/src/entities/index.mjs:1385` "; its validity then is undetermined ({})"
- inline `bio-plane/src/entities/index.mjs:1777` "so a count taken from this list is a floor and never a total."
- inline `bio-plane/src/entities/index.mjs:1824` "this document's reading {} '{}', which is this subject's name '{}'"
- inline `bio-plane/src/entities/index.mjs:1825` "this document's reading {} '{}', which carries every word of this s..."
- inline `bio-plane/src/entities/index.mjs:1829` "; that name reaches {} of the {} references this reader can see at ..."
- inline `bio-plane/src/entities/index.mjs:1916` ". THIS IS THE FIRST {} AND NOT ALL OF THEM, so a count taken from i..."
- inline `bio-plane/src/entities/index.mjs:253` "the scheme names ({})"
- inline `bio-plane/src/entities/index.mjs:717` [copy] "a read names the member reading; an absent viewer is neither an adm..."
- testcopy `bio-plane/test/m/entities/registry.test.mjs:84` [part] "A subject is registered with a note in your own words saying who or..." — part test copy
- testcopy `bio-plane/test/m/entities/registry.test.mjs:85` [part] "in the registry, and this one has none. Nothing was written." — part test copy
- testcopy `bio-plane/test/m/entities/t33.test.mjs:355` "Registered from the captured document" — regex
- testcopy `bio-plane/test/m/entities/t48.test.mjs:11` [part] "This is asked of a proceeding, such as a case before a court or a b..." — part test copy
- testcopy `bio-plane/test/m/entities/t48.test.mjs:12` [part] "registered as another kind. Name the proceeding itself. Nothing was..." — part test copy

## Plain findings (K3957)

29 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('entities.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/entities/index.mjs:541` "an entity needs a canonical label, such as 'City Clerk'"
- plain `bio-plane/src/entities/index.mjs:549` "an entity needs a note in the declarer's own words saying who or what it is and why it ..."
- plain `bio-plane/src/entities/index.mjs:621` "this entity held that name and it was withdrawn; a withdrawn name stays on the record a..."
- plain `bio-plane/src/entities/index.mjs:636` "a relation names two entities by id: fromEntity and toEntity"
- plain `bio-plane/src/entities/index.mjs:637` "a relation is between two distinct entities"
- plain `bio-plane/src/entities/index.mjs:641` "a declared relation carries a justification, like a pattern statement (safeguard 4)"
- plain `bio-plane/src/entities/index.mjs:642` "a declared relation carries a citation, like a pattern statement (safeguard 4)"
- plain `bio-plane/src/entities/index.mjs:798` "labels are read for entity ids, a list of them"
- plain `bio-plane/src/entities/index.mjs:826` "the documents naming a subject only by an identifier are counted for entity ids, a list..."
- plain `bio-plane/src/entities/index.mjs:950` "a withdrawal says why the name was wrong; it is kept beside the name for as long as the..."
- plain `bio-plane/src/entities/index.mjs:955` "this entity holds no such name, so there is nothing to withdraw"
- plain `bio-plane/src/entities/index.mjs:968` "are kept and marked as resting on a withdrawn name, so a member can re-resolve them"
- plain `bio-plane/src/entities/index.mjs:974` "a relation is withdrawn by its id"
- plain `bio-plane/src/entities/index.mjs:977` "a withdrawal says why the relation was wrong; it is kept beside it for as long as the r..."
- plain `bio-plane/src/entities/index.mjs:1072` "an identifier is held on its cited source or a system's own row"
- plain `bio-plane/src/entities/index.mjs:1083` "this entity held that identifier and it was withdrawn; it stays on the record as withdrawn"
- plain `bio-plane/src/entities/index.mjs:1102` "a withdrawal says why the identifier was wrong; it is kept beside it for as long as the..."
- plain `bio-plane/src/entities/index.mjs:1110` "this entity holds no such identifier, so there is nothing to withdraw"
- plain `bio-plane/src/entities/index.mjs:1117` "the identifier matches nothing new; resolutions already made through it are kept"
- plain `bio-plane/src/entities/index.mjs:1458` "resolve a single reference by its raw kind:key, or omit ref to resolve all"
- plain `bio-plane/src/entities/index.mjs:1462` "this captured document's reading carries no such reference (nothing to resolve)"
- plain `bio-plane/src/entities/index.mjs:1501` "testimony names the raw reference (kind:key) the document carries"
- plain `bio-plane/src/entities/index.mjs:1505` "grade D is recorded testimony: it carries the member's stated basis, with an author and..."
- plain `bio-plane/src/entities/index.mjs:1508` "this captured document's reading carries no such reference to testify about"
- plain `bio-plane/src/entities/index.mjs:1545` "a defect report names the resolution's raw reference (kind:key)"
- plain `bio-plane/src/entities/index.mjs:1550` "a defect report says why the match is wrong; it is kept beside the resolution for as lo..."
- plain `bio-plane/src/entities/index.mjs:1557` "no resolution of that reference of that captured document to that entity is held"
- plain `bio-plane/src/entities/index.mjs:1579` "the report is kept beside the resolution; the grade, the resolution and every connectio..."
- plain `bio-plane/src/entities/index.mjs:1615` "document (framework 8.1 grade D); who testified is withheld, because the document sits ..."
