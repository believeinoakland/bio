# stewards (T51)

**Status** · session_01UTbi5VPuYNMbViZaenQLKS · depth 2 · WORKING · handled B1

## J1 · QUESTION

stewards' modules.json uses is [test-support, instance-setup]; converting its 56 words findings needs localize from bio-plane/src/setup-words/index.mjs, in src and in tests, and checks/architecture.mjs rejects an import of a module not in uses. instance-setup does not re-export localize/word. My best reading: BOB adds setup-words to stewards' uses in build/modules.json and to its requirements' Uses section (the same edit every other converted module got). I am proceeding on that reading with the imports in place; the architecture check will name this one line until you add it. If you would rather route the words some other way, answer and I will follow.

## J2 · REPORT

Strings I judge no member reads, left as they are (BOB settles with the design stream, K3944): (1) stewards/src/ui.mjs:78, the Content-Security-Policy header value "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'": wire grammar sent to the browser, never shown. It is the one finding the words check still lists for stewards (plain arm); I did not reshape it to dodge the check. For the unkeyed list. (2) Not counted by the check, judged developer or identifier text: the console log lines in index.mjs ("stewards: a request failed", "stewards: notification failed for <ref>", the purge count line), which R4/R9/R14 only scan for leaks; scripts/deploy.mjs's own console lines (the deployer's terminal; the problems it prints are localized in config.mjs); the refusal JSON's field value "the whole report" for REPORT_BODY_TOO_LARGE (a field label like kind or concerns, a wire value, unchanged). Also: the 9 plain findings in config.mjs are deployer-facing sentences R2 requires "in words"; I converted all 8 to localize rather than list them. Architecture: stewards still needs setup-words in its uses (my J1 QUESTION).
