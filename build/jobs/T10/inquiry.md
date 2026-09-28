# inquiry (T10)

**Status** · session_01HRS6LAssjHFRPkTUcmR4Aq · depth 2 · WORKING · handled B2

## J1 · REPORT

Early push for N186, as B1 asks: `actNoBasis(detail, extra?)` is now exported from `bio-plane/src/inquiry/index.mjs` (R45), at 104a5ad087 on `job/T10/inquiry`. `extra` now joins first, so it can never replace the refusal's own fields (R45's text; it could before). Tested by `test/m/inquiry/nobasis.test.mjs`; the module's 52 tests pass. basis-versions can import it once you merge me. The rest of the job continues on this branch.

## J2 · QUESTION

**N149 (R44: recording `member_user_agent` at creation). Where it is recorded, and from what.**

The trouble with R44's words ("the member-browser agent the inquiry's document records ... recorded when the inquiry is created"): an inquiry is created by `promotion.promote` from bytes the caller wrote, and a promotion step (promotion R39) may check and project but never rewrite those bytes. So inquiry cannot put the agent *into the document* at creation; only the author (the UI) or the control plane could, and a document line the caller writes is a claim the caller can invent (the same reason `migrationReplay` and `assistantPrincipal` are the control plane's stamps).

My reading, which I am building now:
1. The control plane stamps `memberUserAgent` on the promotion package, like `migrationReplay`: deleted first from every caller's body, and set only for a creation that arrives through a member's session, from that request's `User-Agent` header (the member's browser). That is one line in `legacy-index` (`src/index.mjs`, beside `migrationReplay`), not mine: I will REPORT it.
2. inquiry's projection (R12), on the creation of an inquiry (no head) that is not a replay and carries the stamp (a non-empty string, trimmed, at most 512 characters), writes it to a new table of its own, `inquiry_member_agents (bundle_id PRIMARY KEY, user_agent, at)`, declared to purge (R36). Never overwritten by a later revision. A division's children carry their parent's recorded agent (they are the same question asked in the same browser).
3. `memberUserAgent(id)` answers the recorded stamp; else, for an inquiry created before this, the document's own `member_user_agent` as today; else null. Never a default, never throws.

Proposed R44 text: "`memberUserAgent(id)` answers the member-browser agent recorded when the inquiry was created: the control plane's `memberUserAgent` stamp on the creating promotion (SOURCE-ACCESS; trimmed, at most 512 characters), which a division's children carry from their parent; else the agent its document records (`member_user_agent`, trimmed); else null, never a default. It never throws." And R36 gains `inquiry_member_agents`.

The alternative is that the UI (or the control plane) writes `member_user_agent:` into the creating document's bytes, and inquiry changes nothing; then R44's "recorded at creation" is legacy-index's or the UI's to build, not mine.
