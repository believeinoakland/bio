# N824 email capture: what changed for C9 and C12 (moved from section 7 of `N824-email-capture.md`, which keeps the pointer)

**Read whole:** `build/requirements/README.md`; PROCESS-MECHANICS §3, §7; K2425, K2434, K2449, K2452, K1485, K2334 (2); `capture.md` R86, R92, R93, R103, R107-R115 and its Uses; `provenance.md` R42, R51, R59, R62, R63; `doorbell.md` header, R2, R3, R10-R19; `acquisition.md` R10, R114; the stewards Mail note; installer R6, R47, R84, R85; `next.md` N824, N1159, N1266, N1267; the Intake Doctrine's doorbell paragraph.
**Not read whole:** `capture.md`, `provenance.md`, `doorbell.md`, `acquisition.md`, the Intake Doctrine, `BIO_Communications_Platforms.md` (grepped: nothing on inbound mail); no Cloudflare page (the C7 reviewer checked the facts at developers.cloudflare.com on 2026-10-27; each is marked UNVERIFIED as drafted, with the page and what it says).

- **Altered here:** mail-door's header (uses, layer arrangement, no `instance-setup` edge), R1 (domain read through `deps.settings()`), R6 (`clearWaitingMail`, consumer `mail-clear`), R10 (four facts, `nesting_depth`), R12 (the `email()` export), R13 (`MAIL_NO_STATEMENT` is C-118.12; mail-door's codes a new family); `capture` R116 (C-118.12; `member` rows), R117 (rewritten to the container-member job); `provenance` R83 (pinned sentences re-pointed to keys); `runtime-limits` R37 (new keys, `doorbell` `discard_days`); sections 2 (item 1), 3 (FILES), 5 (item 3), B5.
- **New there:** `acquisition` R136 (amends R38, R116); `store-assembly` R102 (amends R64, R74, R75, R81); `test-support` R29 (amends R27); `doorbell` R29 (fills R3); `scheduler` R35 (amends R5, R8); measurement M1.
- **Changed for C12:** here: section 2 item 1 and section 5 item 3 (M1 on Civicsmith's own account), section 3 (FILES: `mail-reader` is ML1 to ML6, additions A1 to A5), R10 (cites A2, A4); there: `mail-reader` R1 to R4 deleted, `acquisition` R136, M1, `doorbell` R29, sections E and F.
- **Unchanged:** R2-R5, R7-R9, R11, R14, R118, `provenance` R82 and R84, `instance-setup` R114, `doc-clean` R13.

## Changed for K5504-K5506 and K5527

- **K5504-K5506:** B1 (K5504), B2 (K5505) and B3 (K5506) marked ANSWERED, their "decision wanted" lines replaced by the rulings; mail-door R1 and R2 (no member's own email address kept; `envelope_from` kept nowhere), R3 (owner alone sees it; the address says who forwarded it; not in the record until the statement), R12 (upload of a saved email stays available whatever the door), `instance-setup` R114 (the team's own domain, about $10-15 a year, free email routing); section 6's shared-inbox suggestion marked not taken. Unchanged: R4-R11, R13, R14 (R5 and R6 already say that mail waits for the statement and for how long; the rate figures remain proposals). The doorbell's discard clearing (`doorbell` R29, in the companion) concerns knocks, not forwarded mail: see its section C.1 and E.
- **K5527 (1), (2):** B2's ruling adds that Civicsmith never asks for, stores as a field or uses a member's email address and that a forwarded message is kept whole, headers included, as its source (R1 and R2 tests, R5); B5 is ANSWERED for the wait: 14 days is final (R6, runtime-limits R37, the companion's section G), after which the mail is removed and the member is told (R6, with a test; the companion's `scheduler` R35 test). The rate and size figures stay proposals.

## Suggestions (moved from section 6) (bind nothing)

- Name the module's table `mail_waiting`; key its private bytes `bio/mail/<sha256>`.
- A member's private address digest: SHA-256 of the full address under the instance key, as `doorbell` R12 keys sources.
- Show "sent to your private address" on each waiting message so a member knows which of her addresses it came to.
- A team-wide shared inbox (S1) was not taken (K5505).

## Changed for K5527 (2) and K5530

- **R6:** the 14-day notice is final, its notice kind `mail_cleared` a proposed name (UNVERIFIED removed). **B4:** bracketed on Bob's C31 (since answered, K5534, below). **B6, section 4.1, the companion's layer arrangement:** `member-roster` added to `mail-door`'s uses (K5530 G: a new layer-3 module after `doorbell`, packaging K5504-K5506's capability, K2008).

## Changed for K5534 (B4)

- **B4:** ANSWERED K5534 (Bob's own words, not a listed option); the bracket on C31 removed; options P1 to P3 shortened to one line. **R7, doc-clean R13:** a published copy shows the text, attachments and From, To, Cc, Date and Subject, never a technical header or an email address; names only where the author marks them material, one by one, else "withheld"; the marking recorded; tests and controls aligned; the raw message stays whole (K5527 (1)). **Section 3, UX-DESIGN need (e):** the author's per-name marking.
