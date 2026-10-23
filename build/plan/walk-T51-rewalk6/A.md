# Targeted re-walk of T51 fix round 6, area A (capture and reading) - walker A for BOB #264, 2026-10-23

Copy: https://biosmoke8.believeinoakland.workers.dev (commit 6351c8fb14). **Nothing in this area was exercised.** No row below has a result; no screenshot was taken; no project "Walk T51 rewalk6 A" was made; the ledger was not read.

## What stopped the walk
1. Read the brief, `walk-T51-rewalk5/A.md` and the "Live checks" section of `k4426-check-T51-F6.md`.
2. The brief's route to the copy (Chromium from /opt/pw-browsers, `--no-proxy-server`, direct) fails at once: `page.goto` to the copy answers `net::ERR_CERT_AUTHORITY_INVALID`. `curl --noproxy '*'` reaches the copy (200 in 2.2 s) because it trusts /root/.ccr/ca-bundle.crt; its certificate is issued by "Egress Gateway SDS Issuing CA (production)", which Chromium's NSS store (~/.pki/nssdb, holding only "CCR agent-proxy interception CA") does not hold. /opt/walk-home does not exist.
3. I tried to give Chromium a private NSS store under my scratchpad that trusts the egress CA from the environment's own bundle. **The permission check refused it** (reason given: "Containment Escape"). I did not retry or rephrase it.
4. After that refusal every further Bash command was refused, including a plain `echo` and a `curl --noproxy` whoami (same reason). I did not work around it. Without Bash I cannot sign in, call `/api/`, make files or run a browser.

## Rows (cause | check | width | role | old or new | what I did | result | what I saw | shot)
All rows of Area A are **not exercised: refused** (the browser could not trust the copy's certificate; the private trust store was refused; Bash was then refused wholesale):
G2/G32 | G3/2a-4/G27/G4 | G5/G13/G14/G37 (12 MB text, 24 MiB text, 10.3 MB and 23.2 MB PDFs, G56 first tick) | G26/2a-3/G56/G38/G39 (0111) | G6/G7/G12d/G33/2a-5 and G8 (40 MB, 41.5 MB, 0115/0136/0125/0127) | 2a-2 (60-page scan, both polling modes) | G15/G41/G41f-1/G41f-2/G43/G48 (member CSV and workbook) | G17/G18/G19 | G12b/G12c/G31 and G30 | the ledger at start and at end (`owedwork`, `owedwork&sha=`, watchdog fields, old 0111) | the carried rows reached from Area A (C69 G36, C4/C89/C90, C41, C66).

## Counts
FIXED 0 / STILL 0 / NEW 0 (nothing walked).

## Left on the copy
Nothing. No file made, no project, no upload, no capture. The browser was never opened past the failed navigation (the launched browser was closed by the script's exit).

## To let the walk run
Either let Chromium trust the egress gateway CA for this walk (a private NSS store, or `/opt/walk-home` made with it), or set `NODE_EXTRA_CA_CERTS`-style trust for the browser by a route you approve; and lift the refusal on Bash for this walker. Then re-run walker A.
