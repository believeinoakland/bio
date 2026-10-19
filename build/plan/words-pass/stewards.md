# stewards: the words check after the conversion (K3949)

Layer 11. 49 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `stewards/src/config.mjs:107` "is not the project's pinned Cloudflare account ({})" — leaf: loads nothing
- inline `stewards/src/index.mjs:173` "Subject: A report has arrived ({})" — leaf: loads nothing
- inline `stewards/src/index.mjs:286` "The service could not answer now." — leaf: loads nothing
- inline `stewards/src/index.mjs:39` "Reporting to Civicsmith's stewards is not yet open." — leaf: loads nothing
- inline `stewards/src/index.mjs:40` "The report is too large: it must be under 16 KiB in all." — leaf: loads nothing
- inline `stewards/src/index.mjs:41` "The request is too large." — leaf: loads nothing
- inline `stewards/src/index.mjs:42` "The kind of abuse must be one of: fabricated evidence, harassment, ..." — leaf: loads nothing
- inline `stewards/src/index.mjs:44` "The description must be from 1 to {} characters." — leaf: loads nothing
- inline `stewards/src/index.mjs:45` "The contact must be at most {} characters." — leaf: loads nothing
- inline `stewards/src/index.mjs:46` "Too many reports have been sent for now. Please try again later." — leaf: loads nothing
- inline `stewards/src/index.mjs:47` "The stewards have too many reports waiting to take another now. Ple..." — leaf: loads nothing
- inline `stewards/src/index.mjs:48` "The report could not be taken now. Nothing was kept. Please try aga..." — leaf: loads nothing
- inline `stewards/src/index.mjs:49` "That name and key do not sign in." — leaf: loads nothing
- inline `stewards/src/index.mjs:50` "Too many refused sign-ins. Try again later." — leaf: loads nothing
- inline `stewards/src/index.mjs:51` "Sign in as a steward first." — leaf: loads nothing
- inline `stewards/src/index.mjs:52` "Stewards' addresses carry nothing after a question mark; nothing wa..." — leaf: loads nothing
- inline `stewards/src/index.mjs:53` "This request did not come from the stewards' own pages; nothing was..." — leaf: loads nothing
- inline `stewards/src/index.mjs:54` "There is no such report." — leaf: loads nothing
- inline `stewards/src/index.mjs:55` "The decision must be dismiss or withdraw." — leaf: loads nothing
- inline `stewards/src/index.mjs:56` "A reason is required, at most {} characters." — leaf: loads nothing
- inline `stewards/src/index.mjs:57` "A withdrawal names one shared service (a shared profile, the templa..." — leaf: loads nothing
- inline `stewards/src/index.mjs:58` "No withdrawal of that shared service stands." — leaf: loads nothing
- inline `stewards/src/index.mjs:59` "There is no such page." — leaf: loads nothing
- inline `stewards/src/index.mjs:60` "That method is not allowed here." — leaf: loads nothing
- inline `stewards/src/ui.mjs:10` "What a team holds, and who could compel it Your team's Civicsmith k..." — leaf: loads nothing
- inline `stewards/src/ui.mjs:107` "What a team holds" — leaf: loads nothing
- inline `stewards/src/ui.mjs:109` "<p>To report abuse of Civicsmith itself, use <a href=\"/\">the report..." — leaf: loads nothing
- inline `stewards/src/ui.mjs:113` [stitched] "<h1>Shared services withdrawn by Civicsmith's stewards</h1> <p>Each..." — leaf: loads nothing
- inline `stewards/src/ui.mjs:115` [stitched] "<table><thead><tr><th>Shared service</th><th>Item</th><th>Since</th..." — leaf: loads nothing
- inline `stewards/src/ui.mjs:120` "<h1>Sign in, Civicsmith's stewards</h1> <form method=\"post\" action=..." — leaf: loads nothing
- inline `stewards/src/ui.mjs:125` "<h1>Civicsmith's stewards</h1><p>Signed in as {}.</p> <p><a href=\"/..." — leaf: loads nothing
- inline `stewards/src/ui.mjs:129` "<h1>Reports</h1><table><thead><tr><th>Reference</th><th>Kind</th><t..." — leaf: loads nothing
- inline `stewards/src/ui.mjs:135` [stitched] "<h1>Report {}</h1> <p>{} · received {} · {}</p> <p><strong>Concerns..." — leaf: loads nothing
- inline `stewards/src/ui.mjs:145` "<h2>Reinstate {} {}</h2><form method=\"post\" action=\"/steward/reinst..." — leaf: loads nothing
- inline `stewards/src/ui.mjs:151` "A report has arrived at Civicsmith's stewards' reporting service. R..." — leaf: loads nothing
- inline `stewards/src/ui.mjs:23` "What this reporting service holds" — leaf: loads nothing
- inline `stewards/src/ui.mjs:24` "This service, which Civicsmith's stewards run apart from every team..." — leaf: loads nothing
- inline `stewards/src/ui.mjs:25` "Civicsmith's stewards could be asked or compelled to hand those ove..." — leaf: loads nothing
- inline `stewards/src/ui.mjs:26` "This is not legal advice." — leaf: loads nothing
- inline `stewards/src/ui.mjs:33` "Other abuse of Civicsmith" — leaf: loads nothing
- inline `stewards/src/ui.mjs:37` "An item of the template library" — leaf: loads nothing
- inline `stewards/src/ui.mjs:57` "<p><a href=\"/\">Report abuse</a> · <a href=\"/guide\">What a team hold..." — leaf: loads nothing
- inline `stewards/src/ui.mjs:66` "<h1>Reporting to Civicsmith's stewards is not yet open</h1>" — leaf: loads nothing
- inline `stewards/src/ui.mjs:67` "<p>The service that receives reports of abuse of Civicsmith itself ..." — leaf: loads nothing
- inline `stewards/src/ui.mjs:68` "<p><a href=\"/guide\">What a team holds, and who could compel it</a></p>" — leaf: loads nothing
- inline `stewards/src/ui.mjs:7` "{} decide every report. {}, the publisher of Civicsmith, is respons..." — leaf: loads nothing
- inline `stewards/src/ui.mjs:73` "<h1>Report abuse of Civicsmith</h1> <section class=\"notice\" id=\"not..." — leaf: loads nothing
- inline `stewards/src/ui.mjs:73` "Report abuse of Civicsmith" — leaf: loads nothing
- inline `stewards/src/ui.mjs:95` "<h1>Your report has been received</h1> <p>Its reference is <strong ..." — leaf: loads nothing

## Plain findings (K3957)

9 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('stewards.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `stewards/src/config.mjs:86` "the deploy configuration could not be read"
- plain `stewards/src/config.mjs:88` "is not set: the stewards' contact address is missing"
- plain `stewards/src/config.mjs:89` "is not exactly one e-mail address"
- plain `stewards/src/config.mjs:91` "is not set: a retention period in days is missing"
- plain `stewards/src/config.mjs:92` "is not a whole number of days from 1 to 3650"
- plain `stewards/src/config.mjs:95` "is not among the Worker's secrets"
- plain `stewards/src/config.mjs:96` "must be a secret, never a plain variable"
- plain `stewards/src/config.mjs:105` "the deploy configuration could not be read"
- plain `stewards/src/ui.mjs:63` "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'"
