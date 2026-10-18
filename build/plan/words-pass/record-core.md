# record-core: the words check after the conversion (K3949)

Layer 2. 89 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/record-core/record-core.test.mjs:2185` [?] ops: allocid, audit, digestcensus, ... (7 of 7 not the module's own)
- inline `bio-plane/src/record-core/index.mjs:634` "identity (token:<class>). An unnamed writer cannot hold the courtes..."
- testcopy `bio-plane/test/m/record-core/record-core.test.mjs:1338` [part] "Your team's Civicsmith could not find a free identifier for this, s..." — part test copy
- testcopy `bio-plane/test/m/record-core/record-core.test.mjs:1339` [part] "was issued. Identifiers are drawn at random so that none of them sa..." — part test copy
- testcopy `bio-plane/test/m/record-core/record-core.test.mjs:1340` [part] "already taken. Trying again may succeed; if it keeps happening, tel..."
- testcopy `bio-plane/test/m/record-core/record-core.test.mjs:1426` [part] "A part of your team's Civicsmith tried to report a figure another p..." — part test copy
- testcopy `bio-plane/test/m/record-core/record-core.test.mjs:1427` [part] "register its figures twice, so the second registration was refused ..." — part test copy
- testcopy `bio-plane/test/m/record-core/record-core.test.mjs:1428` [part] "your team's Civicsmith was built, not in the record, and nothing in..." — part test copy
- testcopy `bio-plane/test/m/record-core/record-core.test.mjs:1429` [part] "A part of your team's Civicsmith tried to register its figures with..." — part test copy
- testcopy `bio-plane/test/m/record-core/record-core.test.mjs:1430` [part] "or a function to count them, so nothing was registered. This is a f..." — part test copy
- testcopy `bio-plane/test/m/record-core/record-core.test.mjs:1431` [part] "in the record, and nothing in the record changed."
- testcopy `bio-plane/test/m/record-core/record-core.test.mjs:1589` [part] "Ids of this kind are given by the record when the thing itself is c..." — part test copy
- testcopy `bio-plane/test/m/record-core/record-core.test.mjs:1590` [part] "advance. Create the project, case, draft, grant or task through its..."
- testcopy `bio-plane/test/m/record-core/record-core.test.mjs:1599` [part] "A part of your team's Civicsmith tried to register its audit check ..." — part test copy
- testcopy `bio-plane/test/m/record-core/record-core.test.mjs:1600` [part] "starts, so the second was refused and the first still runs." — part test copy
- testcopy `bio-plane/test/m/record-core/record-core.test.mjs:1601` [part] "A part of your team's Civicsmith tried to register an audit check w..."
- testcopy `bio-plane/test/m/record-core/record-core.test.mjs:1603` [part] "One of the checks the audit runs over this document stopped with an..." — part test copy
- testcopy `bio-plane/test/m/record-core/record-core.test.mjs:1604` [part] "counted as having an error rather than as clean. The error is in th..." — part test copy
- testcopy `bio-plane/test/m/record-core/record-core.test.mjs:1605` [part] "The audit changes nothing in the record."
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:148` [part] "Your team's Civicsmith could not find a free identifier for this" — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:149` [part] "if it keeps happening, tell whoever hosts your team's Civicsmith." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:150` [part] "A part of your team's Civicsmith tried to report a figure another p..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:151` [part] "This is a fault in how your team's Civicsmith was built" — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:152` [part] "A part of your team's Civicsmith tried to register its figures with..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:153` [part] "This is a fault in how your team's Civicsmith was built, not in the" — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:154` [part] "A part of your team's Civicsmith tried to register its audit check ..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:155` [part] "A part of your team's Civicsmith tried to register an audit check w..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:156` [part] "A part of your team's Civicsmith tried to register a document gramm..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:157` [part] "A part of your team's Civicsmith tried to register a document gramm..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:158` [part] "A part of your team's Civicsmith tried to supply its figures when a..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:159` [part] "A part of your team's Civicsmith tried to supply its figures withou..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:160` [part] "A part of your team's Civicsmith tried to reserve an identifier wit..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:161` [part] "if it keeps happening, tell whoever hosts your team's Civicsmith." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:162` [part] "A part of your team's Civicsmith tried to reserve an identifier out..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:163` [part] "A part of your team's Civicsmith tried to name the identifiers it h..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:164` [part] "A part of your team's Civicsmith tried to name the identifiers it h..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:165` [part] "A part of your team's Civicsmith tried to declare a table without s..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:166` [part] "A part of your team's Civicsmith tried to declare a table with a cl..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:167` [part] "A part of your team's Civicsmith tried to declare a table whose name," — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:168` [part] "A part of your team's Civicsmith tried to declare a table that is a..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:169` [part] "A part of your team's Civicsmith tried to register the checks of a ..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:170` [part] "A part of your team's Civicsmith tried to register or run the check..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:171` [part] "If it keeps happening, tell whoever hosts your team's Civicsmith."
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:178` [part] "Your team's Civicsmith could not find a free identifier for this, s..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:179` [part] "Identifiers are drawn at random so that none of them says how many ..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:180` [part] "Trying again may succeed; if it keeps happening, tell whoever hosts..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:181` [part] "A part of your team's Civicsmith tried to report a figure another p..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:182` [part] "twice, so the second registration was refused and the first still s..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:183` [part] "A part of your team's Civicsmith tried to register its figures with..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:184` [part] "count them, so nothing was registered." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:185` [part] "A part of your team's Civicsmith tried to register its audit check ..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:186` [part] "when it starts, so the second was refused and the first still runs." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:187` [part] "A part of your team's Civicsmith tried to register an audit check w..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:188` [part] "to run, so nothing was registered." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:189` [part] "A part of your team's Civicsmith tried to register a document gramm..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:190` [part] "part's grammar already claims, so the second registration was refus..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:191` [part] "A part of your team's Civicsmith tried to register a document gramm..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:192` [part] "over or a function to run, or claimed only part of one of the recor..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:193` [part] "A part of your team's Civicsmith tried to supply its figures when a..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:194` [part] "second was refused and the first still stands." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:195` [part] "A part of your team's Civicsmith tried to supply its figures withou..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:196` [part] "count them, so nothing was registered." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:197` [part] "A part of your team's Civicsmith tried to reserve an identifier wit..."
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:199` [part] "That identifier has already been used, so it was not given out agai..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:200` [part] "thing only, even after what it named is gone. Trying again gives th..."
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:202` [part] "A part of your team's Civicsmith tried to reserve an identifier out..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:203` [part] "nothing was reserved: a reservation is kept only with the change it..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:204` [part] "A part of your team's Civicsmith tried to name the identifiers it h..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:205` [part] "and the first still stands." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:206` [part] "A part of your team's Civicsmith tried to name the identifiers it h..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:207` [part] "to read them that is not a table and a column, so nothing was regis..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:208` [part] "A part of your team's Civicsmith tried to declare a table without s..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:209` [part] "seen, derived or versioned, so nothing was declared." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:210` [part] "A part of your team's Civicsmith tried to declare a table with a cl..."
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:212` [part] "A part of your team's Civicsmith tried to declare a table whose nam..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:213` [part] "is not a plain name, so nothing was declared." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:214` [part] "A part of your team's Civicsmith tried to declare a table that is a..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:215` [part] "the second declaration was refused and the first still stands." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:216` [part] "A part of your team's Civicsmith tried to register the checks of a ..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:217` [part] "registration was refused and the first still runs." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:218` [part] "A part of your team's Civicsmith tried to register or run the check..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:219` [part] "it declared or a check to run, so nothing was registered and nothin..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:220` [part] "One of the checks the record runs before saving this stopped with a..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:221` [part] "saved. The error is in the check and says nothing yet about what yo..."
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:32` [part] "An edit is held only under the name of whoever is editing, and this..." — part test copy
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:33` [part] "was held, ended or changed."
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:84` [part] "A part of your team's Civicsmith tried to record a setting without ..."
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:86` [part] "A part of your team's Civicsmith tried to record a setting without ..."
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:88` [part] "A part of your team's Civicsmith tried to record a setting without ..."

## Plain findings (K3957)

1 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('record-core.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/record-core/index.mjs:121` "a draft of a new edition's statement of what changed"

## Test copies of code sentences (K3962)

12 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `bio-plane/test/m/record-core/record-core.test.mjs:1354` "\"your team's Civicsmith could not find a free\""
- testcopy `bio-plane/test/m/record-core/t33.test.mjs:171` "\"your team's Civicsmith could not find a free\""
- testcopy `bio-plane/test/m/record-core/t33.test.mjs:193` "\"your team's Civicsmith could not find a free\""
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:85` "\"a setting is recorded under a name, and none was given; nothing was...\""
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:87` "\"a setting is recorded with who set it, and no one was named; nothin...\""
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:89` "\"a setting is recorded with a value, and none was given; nothing was...\""
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:90` "\"The setting was not changed, because the value given is not one it ...\""
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:91` "\"follows are set as a list of profiles, each named once, in the orde...\""
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:92` "\"jurisdiction_profiles is an ordered list of distinct profile ids; n...\""
- testcopy `bio-plane/test/m/record-core/t35.test.mjs:264` "\"your team's Civicsmith could not find a free\""
- testcopy `bio-plane/test/m/record-core/t47.test.mjs:20` "\"A part of your team's Civicsmith tried to record a setting with a v...\""
- testcopy `bio-plane/test/m/record-core/t48.test.mjs:18` "\"your team's Civicsmith could not find a free\""
