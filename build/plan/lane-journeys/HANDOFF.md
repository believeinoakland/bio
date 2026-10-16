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
