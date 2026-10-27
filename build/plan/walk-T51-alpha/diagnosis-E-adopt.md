# Diagnosis: E, "Record that a body adopted it" refused with no field named (re-walk 11, N-c, MAJOR)

Read-only; tip tranche/T51 cb868a0060. Reproduced in a module test (below); not needed live.

## Root cause
1. **The screen sends no `from`.** `bio-plane/src/screens-investigate/standard.mjs:338-340`: for a held act (not an `EVT-`), `from` is taken only from the act's own `period.from` (`later["std:"+act].value.period.from`); "an act that states none sends none". STD-2026-0001 states no start, so the body is `{standard, act, edition, mode, citation, reason}` (line 327 `base` plus citation). The form has no day field (lines 236-237: act, edition, mode only), so a member cannot supply one. 
2. **The owner requires `from`.** `bio-plane/src/standards/index.mjs` `adoptionRecord`, 1906: `if (!from) return refuseFieldInvalid("from", "is a date (YYYY-MM-DD) or an event {event, edge}")` -> code `STANDARD_FIELD_INVALID` (R40: `from` is a date or event). Its other checks (mode, edition, citation) pass in the walker's case. Without an edition the earlier `ADOPTION_NO_EDITION` fires first: that matches the walker's second observation. The edition values "2021", "2026", "Fourth edition" are all valid; the edition is not at fault.
3. **No adopting body is expected from the screen**: R40 says the body is the act's issuer (`index.mjs` ~1920, `actRow.issuer_entity ?? issuer`). So "no body" on the form is by design; "no day" is the real gap. (R64 of screens-investigate lists the fold's fields as act, edition, how, passage, reason; the day was left to the act.)

## Why no field is named (second cause, a different module)
`refuseFieldInvalid` (standards `index.mjs:2697`) does put the name in the answer: `data.field = "from"` and a detail "from is a date ...". But the shell draws the refusal by its code's translation, `refusal.STANDARD_FIELD_INVALID` (`standards/checks.mjs:104-106`, row at `bio-plane/src/setup-words/rows.mjs:16528`), a fixed sentence that says "The answer names the field" without any placeholder. Screens draw `cs.w("refusal." + code)` (e.g. `screens-inquiry/document.mjs:1517,1527`), dropping `data.field`. Owners: **setup-words** (the static sentence, owner of the row; `standards` owns the code and `data.field`) and the shell's refusal drawing (interface-shell / screens). The sentence promises something no layer delivers. This also hides every other `STANDARD_FIELD_INVALID` (law fields, family, designation, `amendments`).

## Why tests missed it
Every adoption test declares its adopting act with `period: {from: FROM}`: `standard-binds.test.mjs:15-16` (`laws()`), asserting `from: FROM` at line 124; `r66.test.mjs` sends `from` directly through the op (lines 32, 59) and the event arm with a dated event. No test declares an act without a period, which is what a walker does (`declareStandard` makes `period` optional, `world.mjs:71`). The module tests of `standards` (`t35.test.mjs`) call the op with an explicit `from`, so the missing-`from` refusal is tested only as the owner's refusal, never as a screen's body. The refusal test checks the key, not that the field is named.

## Smallest fix
1. screens-investigate (`standard.mjs`): add a date field `st-ad-from` to the adoption fold (after the edition, label key such as `screen.standard.f.adopted`, help: "The day the adoption took effect. Left blank, the act's own start is used."), and in `send` use the typed day when set, else the act's `period.from`, else the event's day; when none of these exists, refuse on the screen before sending, with a key naming the day (`{refuse: "screen.standard.adoption.nofrom"}`, as `lawrelate` does with `screen.standard.relate.effective`). New word rows in setup-words for the label, help and refusal.
2. Name the field: change the row `refusal.STANDARD_FIELD_INVALID` to a sentence with `{field}` ("The field {field} of this act is not in the form it takes. Nothing was written.") and have the refusal drawing pass `data.field`; or, smaller and local to this screen, have the act's refusal use `data.field`. Either way remove "The answer names the field" until it does.

## Red test at the walker's exact case
`bio-plane/test/m/screens-investigate/` (add to `standard-binds.test.mjs`, which has the helpers; shown whole as run, uncommitted): declare the adopting act with no `period`, open the policy, choose the act and its passage, edition "2021", mode by_reference, press `standardadoption`.
```js
const ord = await declareStandard(me, { cite: "Act A", kind: "ordinance", sha: doc.sha, extent: du[0].extent }); // no period
const pol = await declareStandard(me, { cite: "Policy B", kind: "policy", issuer: "Works", sha: memo.sha, extent: mu[0].extent });
const p = await openAs(world, me, `/app/standard/${pol}`);
fill(p, { "st-ad-act": ord }); p.fire(p.doc.getElementById("st-ad-act"), "change"); await settled(p);
const text = (await me.read("standard", { query: { id: ord } })).texts[0].content_id;
fill(p, { "st-ad-edition": "2021", "st-ad-mode": "by_reference", "st-ad-passage": text });
await press(p, "standardadoption", { reason: "The passage says so." }); await settled(p);
const sent = p.byOp("standardadoption")[0].body;
assert.ok("from" in sent);   // RED now: sent fields are standard,act,edition,mode,citation,reason
// after the fix also: fill "st-ad-from" and the adoption is recorded (editioninforce answers "2021"); and with no day anywhere the refusal names the day
```
Run (red now): `node --import ./bio-plane/test/platform-sqlite.mjs --test bio-plane/test/m/screens-investigate/standard-binds.test.mjs`. Observed without the assertion: the page shows exactly the walker's sentence "A field of this act (...) The answer names the field. Nothing was written."

## Confidence
High on cause 1-2 and the missing-name cause (reproduced end to end in the real world fixture, same body fields and same sentence). Not checked live.
