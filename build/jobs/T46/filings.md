# filings (T46)

**Status** · session_01NcPWBYKgvduyuc1wKo7quz · depth 2 · WORKING · handled B0

## J1 · QUESTION

Two readings I am building on; neither blocks the job. Please confirm or correct.

1. R52 voice keys. Today the module answers a voice sentence only for `voice: "self"` (`voice_says`, key `filings.voice.self`). R52 lists `voice.group`, `voice.group.means`, `voice.self` and `voice.self.means`, and says "where each sentence is answered is unmoved". My reading: `voice_says` is answered for any text whose voice the member stated. It is `{key: "voice.<v>.means", text, voice: {key: "voice.<v>", text}}`, so a `group` text now carries `voice.group.means` and `voice.group` in the same place. A text that states no voice answers none.
   Likewise, `filings.secondapproval.given` had no site before. I answer it on `filingSecondApprove` (`given`) and on `filingsFor`'s `second_approval.given`. `filings.secondapproval.waiting` is not taken and has no site, so nothing is added for it.

2. R50 `second_needed`. It is true when R42's rule answers `needed` and no second approval is recorded. It is false for a draft already sent, and false for a `voice: "self"` text. In both cases `filingRecordSent` refuses (`ALREADY_SENT`, `NOT_THE_GROUPS_ACT`) before R42 would ask. An unapproved draft can still answer true.
