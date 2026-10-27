# T53 R1 · mail-door · rows

## plan-T53-capabilities.md

**mail-door** (new, §B) (K5530: BOB's packaging; layer 3 after doorbell, `member-roster` in its uses)
- T53 · N824 (K5504-K5506, K5527) · a private address per member (digest only; no member email stored), mail waits 14 days privately, filed only with her statement, rate bounds, count-only tally, never AI, off by default; relays `mail-reader` ML10's nesting refusal (no `MAIL_TOO_NESTED`); runs `mail-reader` before accepting (R3, R10) · N824 R1-R14 `[waits: M1, R12 only]`
- T53 · N824 · R7, what of a message is published (K5534, C31: visible headers From, To, Cc, Date, Subject; never MIME or routing headers or any address; a recipient's name only where the author marks it material; CAPABILITIES applied it)
- T53 · N824 (R6) · the removal of a member's unconfirmed mail: `mail-clear` returns counts (cannot call layer 11) and a notice-producers line reads them (N824 R6 amended, C31)
- T53 · N824 · declares `mailaddress`, `mailwaiting`, `mailread`, `mailbringin`, `maildelete` in its own `DECLARED_OPS`, see op-declarations.
