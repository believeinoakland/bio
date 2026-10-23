# Moving the work to the third account (draft; K4614, K4781; BOB #268)

**Status** · Draft by BOB #268, 2026-10-23. Folded into `build/handoff.md` at the handoff that makes the move. The move happens when re-walk 7 and the whole suite have finished on the secondary account and their records and fix plan are committed (K4781), at a point where no job runs.

## What moves, and what stays

- **Moves:** the BOB lane. State lives in git (`tranche/T51`, the mail branches, civicos-process), so nothing is carried but the handoff. The successor BOB runs on the third account with the same repositories.
- **Stays, unreachable from the third account** (sessions on one account cannot see another's: no `get_session`, no doorbell, no archive): ROOT #8 (secondary), every lane session on the secondary account (PERFORMANCE #1, JOURNEYS #3, AI-DESIGN #1, INVESTIGATION-DESIGN #2) and UX-DESIGN #39 (primary). Their files are in git, so the new BOB still reads every `HANDOFF.md` and the channel; it cannot ring, archive or start sessions there. Each is left as it stands, with no `BOB-final` row for this account's BOBs (K1428): BOB #268's row is written by a successor on this account if one exists, else named as a P14 gap.
- **New on the third account:** ROOT #9 (started by Bob), BOB #269 (started by ROOT #9), and every session after: PERFORMANCE #2 (K4735), the offline final-pass walkers (own sessions, K4782), the live walkers at everyday load (K4783), fix-round jobs. A lane that must continue (JOURNEYS, PERFORMANCE) gets a successor started there by BOB.

## Records to change at the move (BOB, the first BOB on the third account)

- `build/manifest.md` "Starting a session": ROOT #9's id and account; ROOT #8 superseded.
- The plan's Status line and BOB's Writer line (`mail bob`; `xwriter --account third` if it warns).
- `build/channels.md`'s `BOB` row `account` → third: only at T51's close (K1897; §13.1 (1)); until then the Writer line names the account.
- `rulings-active.md`'s account-switch line names three accounts.

## Bob's acts (in plain steps, given to him at the move)

1. Confirm the third account's cloud environment holds what this one does: both repositories (`believeinoakland/bio`, `believeinoakland/civicos-process`) through the GitHub connection with push access; the Cloudflare connection (`api.cloudflare.com`, account `…7f72`); the variables `JOURNEY_ADMIN_HANDLE`, `JOURNEY_ADMIN_PASSWORD`, `JOURNEY_MEMBER_HANDLE`, `JOURNEY_MEMBER_PASSWORD`; network access as now. (BOB names each by reading `read_documentation` pages for the steps.)
2. Start ROOT #9 in that environment on `believeinoakland/bio`, branch `tranche/T51`, pasting the prompt the handoff gives ("You are ROOT #9 … read roles/ROOT.md whole …; then start BOB #269 on tranche/T51 @ <handoff commit>").
3. Later, in one sitting (K4752, Bob: "do it all at once"): the `ADMIN_TOKEN` replaced in the Cloudflare dashboard if the install's one-time password is lost, then the claim of biosmoke8's new room through `/app/setup#boot=…`.
4. After the final pass: approve 0.87.0's signature in the session that is refused (K1715, K4778).

## Order of work on the third account (from the handoff)

1. Takeover (§5.1), the channel and lanes read.
2. Re-walk 7's results into the fix round they need (planned whole, K4426, reviewed); its jobs; one redeploy; a targeted re-walk.
3. PERFORMANCE #2's quiet re-time (R-QUIET).
4. The room's re-creation (`deploy-test/biosmoke8/wnam-g2/deploy`), Bob's claim, the member made by script.
5. The final pass in substance (K4781-K4783): the coverage map `walk-coverage-T51.md` completed first (K4784: its sources read whole by helpers, then BOB's review), offline through the door, then live at everyday load (5 until Bob names a figure).
6. G90's 0.87.0 release, then T51's close (§5.7).
