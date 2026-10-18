# control-plane: the words check after the conversion (K3949)

Layer 11. 32 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/control-plane/doorbell.test.mjs:296` [?] ops: knocksof, pulledknocks, lateattestations, ... (7 of 8 not the module's own) — handlist
- handlist `bio-plane/test/m/control-plane/doorbell.test.mjs:514` [?] ops: sourceconsent, sourceconsentwithdraw, sourcedisclose, ... (9 of 10 not the module's own) — handlist
- handlist `bio-plane/test/m/control-plane/r48-routes.test.mjs:47` [?] ops: docketfile, docketpressure, docket, ... (7 of 7 not the module's own) — handlist
- handlist `bio-plane/test/m/control-plane/r53-routes.test.mjs:21` [?] ops: handlechange, captureupload, invitewithdraw, ... (13 of 13 not the module's own) — handlist
- handlist `bio-plane/test/m/control-plane/r53-routes.test.mjs:242` [?] ops: lawrelate, lawwithdraw, lawpropose, ... (5 of 5 not the module's own) — handlist
- handlist `bio-plane/test/m/control-plane/r53-routes.test.mjs:37` [?] ops: accountreferenceset, accountreferenceremove, accountreference, ... (20 of 20 not the module's own) — handlist
- handlist `bio-plane/test/m/control-plane/routes.test.mjs:38` [?] ops: contradictiondismiss, contradictionclarify, contradictiontakeup, ... (6 of 6 not the module's own) — handlist
- handlist `bio-plane/test/m/control-plane/stamps-action.test.mjs:99` [?] ops: templateapprove, templatedraft, templategrantrevoke, ... (6 of 7 not the module's own) — handlist
- handlist `bio-plane/test/m/control-plane/t34-routes.test.mjs:118` [?] ops: checkrequest, checktake, checkrecord, ... (5 of 5 not the module's own) — handlist
- handlist `bio-plane/test/m/control-plane/t34-routes.test.mjs:151` [?] ops: groupkeyset, groupkeyremove, groupkeyswitch, ... (6 of 6 not the module's own) — handlist
- handlist `bio-plane/test/m/control-plane/t34-routes.test.mjs:79` [?] ops: invitewithdraw, websitekeycreate, websitekeyset, ... (10 of 10 not the module's own) — handlist
- handlist `bio-plane/test/m/control-plane/t36-door.test.mjs:117` [?] ops: standardinforcethrough, standardinforcethroughwithdraw, inforcethroughof, ... (7 of 7 not the module's own) — handlist
- handlist `bio-plane/test/m/control-plane/t36-door.test.mjs:209` [?] ops: openoriginal, openwithwarning, deepercheck, ... (5 of 5 not the module's own) — handlist
- handlist `bio-plane/test/m/control-plane/t37-door.test.mjs:10` [?] ops: translationgrant, translationadopt, translationconfirm, ... (7 of 7 not the module's own) — handlist
- handlist `bio-plane/test/m/control-plane/t41-door.test.mjs:102` [?] ops: stepcreate, stepstart, stepend, ... (76 of 76 not the module's own) — handlist
- handlist `bio-plane/test/m/control-plane/t41-door.test.mjs:29` [?] ops: projectkeyset, projectsigninset, projectaccountremove, ... (16 of 16 not the module's own) — handlist
- handlist `bio-plane/test/m/control-plane/t46-door.test.mjs:268` [?] ops: airunverify, stepsrunai, grouptestset, ... (5 of 21 not the module's own) — handlist
- handlist `bio-plane/test/m/control-plane/t48-door.test.mjs:151` [?] ops: aiuseovertime, exploregraph, standardproposals, ... (7 of 7 not the module's own) — handlist
- handlist `bio-plane/test/m/control-plane/t48-door.test.mjs:289` [?] ops: accountreferenceset, accountreferenceremove, accountreference, ... (24 of 24 not the module's own) — handlist
- handlist `bio-plane/test/m/control-plane/t48-door.test.mjs:352` [?] ops: actionreplyquoting, proceedingdates, readtranslate, ... (16 of 16 not the module's own) — handlist
- handlist `bio-plane/test/m/control-plane/t49-door.test.mjs:141` [?] ops: accountreference, accountreferenceset, accountreferenceremove, ... (5 of 5 not the module's own) — handlist
- handlist `bio-plane/test/m/control-plane/t50-door.test.mjs:73` [?] ops: watchitem, secondlook, secondlookclear, ... (15 of 15 not the module's own) — handlist
- testcopy `bio-plane/test/m/control-plane/t34-routes.test.mjs:315` [part] "This team's Civicsmith has no operation by that name." — part test copy
- testcopy `bio-plane/test/m/control-plane/t34-routes.test.mjs:316` [part] "This team's Civicsmith could not consult its own records just now" — part test copy
- testcopy `bio-plane/test/m/control-plane/t34-routes.test.mjs:317` [part] "That is a fault in this team's Civicsmith," — part test copy
- testcopy `bio-plane/test/m/control-plane/t34-routes.test.mjs:318` [part] "This team's Civicsmith failed inside its own record" — part test copy
- testcopy `bio-plane/test/m/control-plane/t34-routes.test.mjs:319` [part] "Your team's Civicsmith is preserving records under a litigation hold" — part test copy
- testcopy `bio-plane/test/m/control-plane/t34-routes.test.mjs:320` [part] "Your team's Civicsmith has no administrator token set" — part test copy
- testcopy `bio-plane/test/m/control-plane/t34-routes.test.mjs:321` [part] "Whoever installed your team's Civicsmith sets a fresh one" — part test copy
- testcopy `bio-plane/test/m/control-plane/t34-routes.test.mjs:322` [part] "the one your team's Civicsmith holds, so it was not claimed" — part test copy
- testcopy `bio-plane/test/m/control-plane/t34-routes.test.mjs:323` [part] "your team's Civicsmith could not check that against the history it ..." — part test copy
- testcopy `bio-plane/test/m/control-plane/t46-door.test.mjs:186` [part] "a run is continued by its principal alone" — part test copy
