# answers (T51)

**Status** · session_01S1McqV7qoGLx6V9Y9QpaCn · depth 2 · WORKING · handled B1

## J1 · REPORT

Two of the five plain findings are not converted, and I list them for BOB to settle (K3957, K3944). Both are diagnostics that name a wire field of the model's answer, not a sentence a member reads:

- bio-plane/src/answers/check.mjs:59 "the summary names the sentences it rests on, as s<i>"
- bio-plane/src/answers/sentences.mjs:92 "a sentence's support names holdings, rule items or looks as h<i>, r<i>, l<i>"

Why: each is the `detail` of an ANSWER_MALFORMED refusal, raised when the model's output does not take the contract's shape. The member sees only that row's translation ("the assistant's answer was not in the form every answer must take ... nothing is shown"); the detail names a wire token (`s<i>`, `h<i>`, `r<i>`, `l<i>`) that exists for the model and the developer, never for the member. Converting them would give a wire grammar a translation.

Note for BOB: R29 says "every refusal's detail" is member-facing. These two are exceptions to that reading, and R29 may need the word "detail" narrowed to the refusals a member sees, or these two listed as `unkeyed`. I have not changed R29.
