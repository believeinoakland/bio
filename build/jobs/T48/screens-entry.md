# screens-entry (T48)

**Status** · session_01BpeeBYLA4MHskJuB8Ac3T8 · depth 2 · WORKING · handled B0

## J1 · QUESTION

Two readings, one word, for BOB's ruling (I carry on with these meanwhile):

1. **Words (R12, "no count at zero").** `forgot`'s success sentence `screen.forgot.done` says "you have {remaining} left", which reads "you have 0 left" after the last code. I need a sentence for that arm; none is in `words.json`. My draft, for BOB's interim words (marked interim, for UX-DESIGN): `screen.forgot.done.last` = "Your new password is set. That was your last recovery code: once you are signed in, get new ones in Settings › Recovery codes. Every other sign-in of yours has ended. Sign in with your new password." Also one fill-only row, `screen.setup.security.field` = "{field}", so a security tool's own field names (record data) are drawn through `cs.field` (R12: every labelled field with `cs.field`). Please give the words or confirm these.

2. **R13 monogram.** I read "the logo or monogram" as: the logo when `groupidentity.logo` is true, else the display name's initials (two at most, `aria-hidden`); while no name is set, no monogram (initials of "Your group" would be no one's), only "Your group" in the serif title. **R14:** setup already asks the name first after the codes; I add `aria-current` on the first open step and keep "Name" open when skipped.
