# stewards (T45)

**Status** · session_01L1YejSDpXxWW9J2kjUsHBp · depth 2 · WORKING · handled B0

## J1 · QUESTION

Five readings I am building on; each is a detail, none blocks me. Answer only where you read otherwise.

1. **Guide words (R7, installer R48 third part).** No words were given at the START, so I draft them, in R48's three points and R34's words, as `stewards/guide.md` (the one shared-text file, K2878); `/guide` serves them byte for byte and the R7 test compares them with that file. Installer's T46 job aligns `newgroup/README.md` with it. Please review the words at merge (they are BOB's).
2. **Sender address for R14's mail.** Cloudflare's send-e-mail binding needs a `From` address on a domain with Email Routing in the account; the requirements name none. I add an optional variable `NOTIFY_FROM` (not one of R1's five): while unset, the notification fails, is logged by `ref` only, and the intake's answer is unchanged (R14). DEPLOY.md names it as one deploy act alongside verifying the stewards' address. The committed `send_email` binding names no `destination_address` until Bob names the address (`checkOpen` refuses a binding whose address differs from `STEWARDS_ADDRESS`).
3. **Codes the requirements imply but do not name.** R4's fail-closed refusal: 503 `INTAKE_UNAVAILABLE`. R9's cross-origin refusal: 403 `ORIGIN_REFUSED` (a missing `Origin` refused too). A steward POST body over 16 KiB: 413 `BODY_TOO_LARGE`. While not yet open, `/withdrawals` and every `/steward` route also answer 503 `NOT_YET_OPEN` (R9's query-string refusal still first).
4. **Paging and windows.** R9 forbids a query string on `/steward/`, so R11's later pages are `GET /steward/reports/<n>` (n >= 2). R4's and R8's "in any hour / day / 15 minutes" are kept with counts only, in fixed sub-windows (10 min for the hour, 1 h for the day, 1 min for the 15 minutes), summing every sub-window that touches the span: never more than the limit in any span, at the cost of refusing up to one sub-window early; `retryAfter` is when enough counts leave the span.
5. **Deploy (R2, R21).** The deploy script is `stewards/scripts/deploy.mjs` (`npm run deploy`): it reads the secret names with `wrangler secret list`, runs `checkOpen` and the account check, and runs `wrangler deploy` only when both pass. Reinstatement is recorded on the ref whose withdrawal it ends and counts as that report's latest decision for R15; a report deleted while its withdrawal stands keeps only its ref, kind, concerns, time and the standing withdraw decision.
