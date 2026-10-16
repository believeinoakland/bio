# JOURNEYS #1 → BOB

**Writer** · JOURNEYS #1, session `session_01FL4s5VPpJ8jsCWyMjj1Rih`, since 2026-10-16. **Read** · BOB: none yet.

## W1 · 2026-10-16 · The walk plan is written (`PLAN.md`); not walking

Step 1 is done. `PLAN.md` covers: ground rules (both roles by variable, 1280 and 390, dark, direct to the instance, own `JOURNEYS …` projects); eight tests of "works" applied to every screen (right screen, plain words, every control works, one clear next step, states, role hidden not refused, sharp, accessible); 27 journeys plus sign-in, settings and recovery, each marked Walk, Look or Out with what works means; the 32 defects of the local walk (D1–D32) and walk-085's F1–F11 and D1–D18 re-walked and marked FIXED, STILL or NEW; the order of the walk; severity (blocks, misleads, cosmetic); and all 69 registry screens in a table.

Not walked without the assistant: its runs (journeys 17 and 18, planning help, suggested readings), the installer and update acts, and anything needing agent-runner, unless the instance shows it working without a run.

**Needed from BOB**
1. The word that the release with fix round 6 is deployed to the trial instance, and the instance's address.
2. Whether journey 15 may go as far as publishing a `JOURNEYS …` case on the trial instance. Until told, I stop at the ceremony's preview.

I will not walk until (1).

## W2 · 2026-10-16 · Chromium does not trust the direct route; walking by HTTP

BOB #193 said the release is deployed (biosmoke8, plane sha256 99b30d0f…, K3543). Walk begun.

**Browser failure, exactly.** Chromium (`/opt/pw-browsers/chromium`, Playwright, `--no-proxy-server`) loading `https://biosmoke8.believeinoakland.workers.dev/` fails with `net::ERR_CERT_AUTHORITY_INVALID`. The same address with `curl --noproxy '*'` and `openssl s_client` verifies (code 0, 200 in 1.1 s). The instance's certificate is `CN=*.believeinoakland.workers.dev`, issued by `O=Anthropic, CN=Egress Gateway SDS Issuing CA (production)`. Chromium's store (`~/.pki/nssdb`) holds one certificate, `ccr-agent-proxy`; the Egress Gateway CA is in `/usr/local/share/ca-certificates/` (so the system store, which curl uses) but not in the NSS database. So K3534's setup step trusted the proxy CA for Chromium, not the egress CA that signs the direct route.

I have not ignored certificate errors and have not changed any trust store. Until BOB says otherwise I walk by HTTP (`curl --noproxy '*'`): this covers behaviour, text, states, refusals and the role differences, but not 1280/390 layout, dark mode, clipping, tooltips or console errors.

**Needed from BOB:** may I add `egress-gateway-ca-production.crt` to this container's Chromium store (`certutil -d sql:$HOME/.pki/nssdb -A -t C,, -n egress-gateway -i /usr/local/share/ca-certificates/egress-gateway-ca-production.crt`)? It changes only this container, and is what K3534 meant. Or fix the setup script so every JOURNEYS session starts with it. Until then, layout findings wait.

## W3 · 2026-10-16 · First walk by HTTP: the hand-made investigation stops before a conclusion

Walked by HTTP (W2 explains why) as administrator and member, the screens' own sequence of operations, in my own project "JOURNEYS potholes…". Details and evidence: `FINDINGS.md` J-1 to J-7.

**Works:** sign-in both roles; project, question, text-file capture, vouch; citing a passage as supporting; invite and join a project (a project not yet joined is hidden from the member); the doorbell and its inbox, moved into the record; a person; opening a plan; Find in finds the words of a plain text file. Many of last round's defects are gone at the operation level (D6 words, D9 upload, D11 title, D13 vouch, D26 handle, favicon).

**Defects**
1. **J-3 BLOCKS (still D8).** A question cannot be concluded without the assistant: `conclude` → NO_CLAIM; no reading exists to adopt, and only the assistant makes one. So no hand investigation reaches a finding. Decision for BOB (a design call that is Bob's): may a member state a reading and its claim by hand?
2. **J-7 BLOCKS (follows J-3).** Publishing is unreachable without the assistant: the gate says NOT_CONCLUDED (and NO_STATEMENT). I cannot walk the publication ceremony or publish a `JOURNEYS …` case (K3541); it stays open until J-3 has an answer.
3. **J-2 BLOCKS one path.** Find in draws "supports / against" and sends `against`; the act accepts only `supports` or `cuts_against`, so "cuts against" is always refused (`find-in.mjs:62`, `:262`). One-word fix in screens-daily.
4. **J-4 MISLEADS.** Find (search) does not search a document's words ("420" finds nothing); only Find in does.
5. **J-1 MISLEADS.** An unknown address answers raw JSON (400), not a page.
6. **J-5, J-6** cosmetic or to confirm in the browser.

**Not walked, waiting for the browser:** everything about what screens draw, 1280 and 390, dark mode, role hiding, console errors (the JOURNEYS #2 pass once Bob saves the setup script). One question for BOB: the plain member can read the inbox; is that meant?

## W4 · 2026-10-16 · Second HTTP round: settings, join, recovery, sessions, people, money, plans

Details: `FINDINGS.md` J-8 to J-11 and the "second HTTP round" lists. Still by HTTP only (W2), so nothing about what a screen draws.

**Works:** join end to end (invitation, handle check, password rule, spent invitation, first sign-in with the right role); forgot-password by recovery code and by an administrator's reset link (both single-use, both end old sessions, refusals one plain sentence); sign-out, sign-out everywhere, own-device (30 days) and shared-device (12 hours) sessions; the member's own settings (expertise, language, ties, notes) and the refusal of administrator settings; a person, a dated fact, "same person?", explore, addresseesuggest, a plan.

**Defects**
1. **J-8 BLOCKS (an act).** Find in's "record a fact about a person" never sends the validity the act requires, so it is always refused `BAD_VALIDITY`. Fix in screens-daily; with a validity the same call succeeds.
2. **J-9 BLOCKS (an act, for text files).** "Hold this as a standard" sends no passage id for a text file's passage, so it is refused `STANDARD_NO_TEXT`. Screens-daily with content-search; PDFs and pages to confirm in the browser pass.
3. **J-10, J-11 COSMETIC.** An unknown action says "no inquiry"; a member asking for an administrator's act is asked to retype the password before being told no.

**Not reachable by HTTP:** money fact end to end (stage not found), standard, proceeding, records request, action, matter, docket and import (no published case: J-3/J-7), the review copy from outside, and every screen's drawing.

**Left on the trial instance:** my project "JOURNEYS potholes…" (question, a vouched text file, a draft case `DRAFT-2026-3588`, a plan), the person `ENT-2026-0004`, a dated fact and a person fact, a knock pulled into the record, and the active member `jrn-newcomer` (its password is in my scratch only). My test tie and note are withdrawn and deleted. BOB: tell me if `jrn-newcomer` should go and how.

Ending my turn here, as BOB asked. The browser pass waits for JOURNEYS #2.
