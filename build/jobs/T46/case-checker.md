# case-checker (T46)

**Status** · session_018KyvpjWpStPQKywDPCaAeL · depth 2 · WORKING · handled B0

## J1 · QUESTION

R24's T46 clause: "reads as supported ... whenever it cites anything that was read". Read literally, a sentence with nothing checkable that cites one held finding AND one thing not read is supported. Today's behaviour (which the entry says is kept) answers that sentence `ACCOUNT_SENTENCE_UNSUPPORTED`, naming the unread cite ("cites F9, which is not among what it may cite"): any cite not read is arm 1's departure, whatever else the sentence cites.

My best reading, which I am building on: "behaviour kept" governs, and "cites anything that was read" means its cites are all read (at least one). So: such a sentence citing only held things answers no departure; citing only what was not read, or anything not read beside what was, answers `ACCOUNT_SENTENCE_UNSUPPORTED` naming the unread cites. My test pins all three. If you mean the literal reading instead (a read cite excuses an unread one), say so and I change the code and the test; it would be a behaviour change for `filings` R34 and `case-account`, since a cite to something not read would no longer be refused.

Suggested re-wording, if you agree: "... whenever every thing it cites was read: ..." with the control extended "... citing only, or also, what was not read answers ACCOUNT_SENTENCE_UNSUPPORTED".
