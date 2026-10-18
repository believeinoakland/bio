# instance-setup: the words check after the conversion (K3949)

Layer 11. 33 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/setup-fleet.mjs:27` [copy] "Before you choose a password: who controls your team's Civicsmith" — leaf: loads nothing
- inline `bio-plane/src/setup-fleet.mjs:29` "Whoever can sign in to the hosting account your team's Civicsmith r..." — leaf: loads nothing
- inline `bio-plane/src/setup-fleet.mjs:30` "They can replace the one-time password, claim it again, read everyt..." — leaf: loads nothing
- inline `bio-plane/src/setup-fleet.mjs:31` "and no vote of the team's administrators can stop them." — leaf: loads nothing
- inline `bio-plane/src/setup-fleet.mjs:32` [copy] "Use a team account for it, not anyone's personal login." — leaf: loads nothing
- inline `bio-plane/src/setup-fleet.mjs:33` [copy] "Add at least one other trusted person to that account." — leaf: loads nothing
- inline `bio-plane/src/setup-fleet.mjs:34` [copy] "Where possible, let someone other than the team's administrators ho..." — leaf: loads nothing
- inline `bio-plane/src/setup-fleet.mjs:35` "The same account is the way back in if the password you choose is l..." — leaf: loads nothing
- inline `bio-plane/src/setup-fleet.mjs:36` "your team's Civicsmith to be claimed again." — leaf: loads nothing
- inline `bio-plane/src/setup-fleet.mjs:39` "If the one-time password may have been seen, replace it: follow the..." — leaf: loads nothing
- inline `bio-plane/src/setup-fleet.mjs:40` "password” in your team's Civicsmith, on its first page and in its m..." — leaf: loads nothing
- inline `bio-plane/src/setup-fleet.mjs:41` [copy] "Replace the one-time password" — leaf: loads nothing
- inline `bio-plane/src/setup-fleet.mjs:47` "To open the way back in: sign in to the hosting account, replace th..." — leaf: loads nothing
- inline `bio-plane/src/setup-fleet.mjs:48` "value in this worker's settings, and your team's Civicsmith can be ..." — leaf: loads nothing
- inline `bio-plane/src/setup-fleet.mjs:54` [copy] "If you cannot sign in" — leaf: loads nothing
- inline `bio-plane/src/setup-fleet.mjs:56` [copy] "Your team's administrators can help you: ask one of them for a rese..." — leaf: loads nothing
- inline `bio-plane/src/setup-fleet.mjs:57` [copy] "If none of them can sign in either, whoever holds your team's hosti..." — leaf: loads nothing
- inline `bio-plane/src/setup.mjs:1130` "a name of {} characters"
- inline `bio-plane/src/setup.mjs:1225` "{} is not the JSON object your team's Civicsmith reads ({ instance,..."
- inline `bio-plane/src/setup.mjs:1314` "a stake of {} characters{} is not"
- inline `bio-plane/src/setup.mjs:1401` "'{}' is not one of"
- inline `bio-plane/src/setup.mjs:1401` "a list of {} names too many, and the languages are"
- inline `bio-plane/src/setup.mjs:1976` "Legistar also lists {} under the same name; they are held as"
- inline `bio-plane/src/setup.mjs:1977` "separate persons and never merged here: whether they are one person..."
- inline `bio-plane/src/setup.mjs:2133` "a name of {} characters"
- inline `bio-plane/src/setup.mjs:2352` "the answers are a list of at most {}"
- inline `bio-plane/src/setup.mjs:2353` "{question, text}, each text at most {} characters. Nothing was saved."
- inline `bio-plane/src/setup.mjs:2663` "the release ready to install is {}"
- inline `bio-plane/src/setup.mjs:2726` "a reason of {} characters{} is not"
- inline `bio-plane/src/setup.mjs:2834` "completed step's elapsed time and below what its next step would ha..."
- inline `bio-plane/src/setup.mjs:2835` "No run has been cut off yet, so the ceiling is above everything tried."
- testcopy `bio-plane/test/m/instance-setup/page.test.mjs:58` [part] "If the one-time password may have been seen, replace it: follow the..." — part test copy
- testcopy `bio-plane/test/m/instance-setup/page.test.mjs:59` [part] "in your team's Civicsmith, on its first page and in its members and..." — part test copy
