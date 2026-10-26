# action-producers: the words check after the conversion (K3949)

Layer 11. 26 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/action-producers/index.mjs:514` [copy] "An entry on this action's clock"
- inline `bio-plane/src/action-producers/index.mjs:514` [copy] "with no date"
- inline `bio-plane/src/action-producers/index.mjs:515` "for the same date, and are told here, once."
- inline `bio-plane/src/action-producers/index.mjs:747` [copy] "a clock entry"
- inline `bio-plane/src/action-producers/words.mjs:11` [table] "Noticed: no reply recorded by {date}" — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/action-producers/words.mjs:12` [copy] "Our deadline passed: {what}" — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/action-producers/words.mjs:13` [copy] "The date they gave has passed: {what}" — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/action-producers/words.mjs:14` [copy] "{member} left, with {n} dated items" — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/action-producers/words.mjs:15` [copy] "{member} is no longer in {place}, and these were routed to them: {i..." — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/action-producers/words.mjs:16` [copy] "Keep watching {what}?" — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/action-producers/words.mjs:17` [copy] "{plan} has closed, or its promises are all met. Keep this watch unt..." — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/action-producers/words.mjs:18` [copy] "Your team's deadline to {what} with {venue} was {date}, and nothing..." — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/action-producers/words.mjs:19` [copy] "Review due: {plan}" — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/action-producers/words.mjs:20` [copy] "Your team set {plan} to be reviewed every {rhythm}, and nothing has..." — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/action-producers/words.mjs:21` [copy] "Look again at {plan}"
- inline `bio-plane/src/action-producers/words.mjs:22` [copy] "A legal threat with no hold: {entry}" — ambiguous: 2 rows share this en (door.actioncorrespond, act.actioncorrespond.label.action)
- inline `bio-plane/src/action-producers/words.mjs:24` [copy] "Record a reply" — ambiguous: 2 rows share this en (door.itemtakeup, screen.plan.takeup)
- inline `bio-plane/src/action-producers/words.mjs:26` [copy] "Take this up"
- inline `bio-plane/src/action-producers/words.mjs:31` [copy] "Place a hold"
- inline `bio-plane/src/action-producers/words.mjs:61` [copy] "You left a request unsent: {what}" — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/action-producers/words.mjs:62` [copy] "A request was left unsent: {what}" — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/action-producers/words.mjs:63` [table] "Approved on {date}, not yet sent: nothing has gone to the office. P..."
- inline `bio-plane/src/action-producers/words.mjs:64` [table] "keep it for later, or drop it with a reason."
- inline `bio-plane/src/action-producers/words.mjs:66` [copy] "Pick up where you left off"
- testcopy `bio-plane/test/m/action-producers/t47.test.mjs:167` "Pick up where you left off" — ambiguous: 3 rows share this en (request-unsent.open, screen.action.pickup, screen.queue.unsent.pickup)
- testcopy `bio-plane/test/m/action-producers/templates.test.mjs:83` [part] "no member has confirmed it"
