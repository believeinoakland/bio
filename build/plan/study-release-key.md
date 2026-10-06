# STUDY · Who holds the release key, and should a second recovery key be armed?

Research worker for BOB, 2026-10-06, on `tranche/T34`, read-only (P18, not reviewed). Answers Bob's Q4 (K1874; security review F8,
`plan/draft-T35-security-review.md`:111). No secret value was printed or copied; locations and reach only.

## 1. Today

**The key.** One Ed25519 key, public line `ssh-ed25519 …N3Vl bio-release`, the only entry of `ARMED_SIGNERS`
(`newgroup/src/signers.mjs`:15–17). It signs the plane asset (namespace `bio-release`) and the fleet statement (`bio-release-fleet`),
which also carries the container image (installer R8, R11, R38). Armed in commit `6334d03aa4` (2026-07-24, "0.4.0: the write arc",
author `believeinoakland`, then in `newgroup/src/index.mjs`); moved to `signers.mjs` in `483ac38a2b` (2026-09-18).

**Who generated it.** Bob's account, in the browser signer page (`bio-plane/src/sign-release.html`, served at an instance's `/sign`,
`control-plane/index.mjs`:754), which mints both `bio-release` and `bio-ratify` as raw `BIOKEY-RAW1` envelopes and downloads
`bio-signing-keys.txt` (:409). The page labels them **development keys with no passphrase** and says "When Civicsmith goes to real
groups, generate fresh keys and protect them" (:398). The generate button never calls `wrapKey` (:261): it cannot mint a protected key.

**Where the private half is (locations only).**

| copy | reach | source |
|---|---|---|
| `~/Downloads/bio-signing-keys.txt` on Bob's Mac, mtime 2026-07-24, holding both release and ratify seeds, unencrypted | Bob, and anything running as him on that Mac | `6d4c1a7e0f` message (2026-08-05); not re-checked since |
| `.env` on the earlier Macs (gitignored, machine-local), which a session wrote from that file | sessions on those machines | `6d4c1a7e0f`; `docs/development/kickoffs/NEW-MACHINE.md`:160–170 |
| Environment variable `BIO_RELEASE_SEED` of the claude.ai cloud environment (present in this session) | **every cloud session in that environment**, and anyone who can edit the environment; it sits beside `CLOUDFLARE_API_TOKEN`, `GITHUB_TOKEN` (push and admin true) and `BIO_RATIFY_SEED` | `MEASUREMENTS.md`:18401 (M-99, 2026-09-22); K1705 (5) |

It is not a GitHub Actions secret (`.github/workflows/regression.yml` reads no secrets) and not a Cloudflare secret.

**How a release is signed.** A session runs `node bio-plane/scripts/release-assemble.mjs --version X --sign`, which reads
`BIO_RELEASE_SEED` (:445) and signs through `bio-plane/scripts/sign-sshsig.mjs` (signatures R33–R36, bundler R23); stock
`ssh-keygen -Y verify` controls follow (7/7). 0.79.0 (`dd324152c9`) and 0.80.0 (K1709) were signed this way by sessions, not Bob
(`draft-T33-release.md`:14, :64). Bob's browser path (`sign-release.html` over the payload) is the fallback.

**Who verifies.** Only the installer, `newgroup`: one Worker on our account (`newgroup.believeinoakland.workers.dev`,
`newgroup/src/index.mjs`:41) that groups open in a browser. It fetches `main/release/RELEASE.json` (:53), verifies `sig` and
`fleetSig` against the compiled `ARMED_SIGNERS` (:84–92, :815) and otherwise installs its embedded copy (R8). Installed copies never
check the release key and never update themselves: updates go through the same wizard's `/update` (`INSTALLER.md`:90–102).

**If the key is lost or stolen today.** There is no revocation, no second key, no rotation procedure (F8). But because the only
verifier is one Worker we deploy, a new key reaches every future install and update by one edit of `signers.mjs` plus one
`newgroup` deploy; groups hold nothing to change. Lost: repository releases are refused and the embedded copy installs (safe, stale)
until that redeploy. Stolen: the thief must also write `main` of `believeinoakland/bio` to be served; until the redeploy, any such
release passes. Releases already signed stay verifiable against the old public line.

## 2. Risks today

1. **No separation of powers.** The seed lives with the Cloudflare and GitHub admin tokens in one environment. Whoever has that
   environment (any session, a prompt-injected session, anyone editing it) can sign, push `main` and redeploy the installer. The
   signature then adds nothing over repository write access, which is the one thing it exists to add (`signers.mjs`:3–8).
2. **A development key in production.** Raw, unpassphrased, in a Downloads folder, generated with the ratify key in one file; the
   page that made it says to replace it before real groups.
3. **Unknown backups.** The record knows of the Mac file (as of 2026-08-05) and the environment variable; no offline copy. Losing both
   is survivable today (rotation is cheap) but undocumented.
4. **No stated custody or rotation rule** in Distribution, signatures, installer or bundler (F8).
5. **Cheap rotation is temporary.** If groups ever run their own installer, or a plane updates itself, every copy holds its own
   `ARMED_SIGNERS` and a lost key with no second key strands them. Then a recovery key must already be in those copies.

## 3. Options

| option | what Bob does (plain steps) | cost | product change |
|---|---|---|---|
| **A. Document only** | Nothing; optionally confirm the Downloads file still exists | none | Distribution gains a custody section (who holds, where, how to rotate: new key, edit `signers.mjs`, re-sign, redeploy `newgroup`) |
| **B. Arm an offline recovery key** | Once, ~10 min: open the signer page on `biosmoke7/sign`, press Generate, save the release key's private text to a password manager entry or a printed sheet kept at home (not Downloads), delete the downloaded file, tell the session the page's public line (public, safe to paste). To use it later: open the page, load the key, paste the payload a session gives, copy the signature back | free | one line in `signers.mjs`; installer R8/R11 already accept any listed key; Distribution states the recovery key is used only to sign a release that replaces a lost or stolen key |
| **C. Fresh, protected keys now** (the page's own instruction) | As B, twice: a new release key and a recovery key, each with a passphrase, kept apart (password manager vs. paper); then delete `bio-signing-keys.txt` | free; one release cycle | signatures: the signer page offers a passphrase at Generate (calls `wrapKey`), labels a recovery key; `ARMED_SIGNERS` replaced; `BIO_RELEASE_SEED` replaced by Bob in the environment settings |
| **D. Sign in a GitHub Actions environment with Bob's approval** | Once: in GitHub, Settings → Environments → new `release` environment, add himself as required reviewer, add the seed as its secret; in claude.ai, delete `BIO_RELEASE_SEED` from the environment; replace the session's `GITHUB_TOKEN` with one that lacks admin (so a session cannot edit the rule). Per release (at most one per tranche, K1501): open the e-mail link and press "Approve and deploy" | free (public repo) | bundler splits assemble (session) from sign (a new `release-sign.yml` workflow); R23 reworded; K1501 gains one Bob click per release; Distribution custody section. Only real separation of the options |
| **E. Sigstore keyless (GitHub OIDC)** | Nothing | free | large: installer must verify Fulcio certificates and Rekor entries (a second verifier against R29); trust becomes "whatever runs on `main`", i.e. repository write again. Does not fit |
| **F. Hardware key (YubiKey, `ed25519-sk`)** | Buy a key; touch it and run a command at each signing | ~$50–110 | `sshsig.mjs` accepts only `ssh-ed25519` (:82): verifier, signer page and installer change. Conflicts with "Bob enters no commands". Not now |
| **G. Full TUF (root/threshold, signed revocations)** | Hold root keys, sign key changes | high | new metadata model throughout. Only if installers become distributed |

A revocation list inside `RELEASE.json` is not worth adding now: the attacker it guards against writes that file. While the
installer is ours, revocation is removing the key from `ARMED_SIGNERS` and redeploying.

## 4. Recommendation

**Who holds it:** Bob generated it (2026-07-24) as a self-described development key; its private half is on Bob's Mac in
`~/Downloads/bio-signing-keys.txt` and in the cloud environment's `BIO_RELEASE_SEED`, which every BOB session reads and signs with.
In practice the sessions hold it.

**Second recovery key: yes, armed now (B), together with C**: replace the development key with a fresh passphrase-protected release
key and arm one offline recovery key kept on paper or in Bob's password manager. It costs Bob one ~15-minute browser sitting, costs the
product one `signers.mjs` line, a signer-page change (passphrase at Generate) and a Distribution custody section, and must be in every
installer before any installer runs outside our account (risk 5). On its own it does not fix risk 1; **D is the change that does**, and
should land before the first real group installs: the seed leaves the session environment, and each release waits for Bob's one click.
Until then, A's custody section records the facts above.

Sources: [TUF offline keys, thresholds and rotation (Foundries.io)](https://docs.foundries.io/92/reference-manual/security/offline-keys.html);
[GitHub: environments, required reviewers, environment secrets](https://docs.github.com/en/enterprise-server@3.9/actions/deployment/targeting-different-environments/using-environments-for-deployment);
[Sigstore keyless signing (Chainguard)](https://edu.chainguard.dev/open-source/sigstore/how-to-keyless-sign-a-container-with-sigstore).
