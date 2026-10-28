# AI catalogue key ceremony: route draft (worker for BOB; read at origin/tranche/T53 @ aba3b3c000)

Not a ruling. Nothing here is code; nothing was run against Bob's keys.

## 1. What must be produced

- **Two Ed25519 keys**, the catalogue signing key and the catalogue recovery key (signatures R50). Each is held as `BIOKEY-RAW1.<label>.<base64 of the 32-byte seed>` (R34's envelope, the only private form `sign-sshsig.mjs` reads), plus its public line `ssh-ed25519 <base64 wire key> <comment>` (R35).
- **Public lines go in one place**: `CATALOGUE_KEYS` (`bio-plane/src/sshsig.mjs:579` on T53, a frozen list holding test keys today). R50: a list of its own, no line equal to any `RELEASE_KEYS` line; "adding or removing a key is a requirement change made in this module alone, after the catalogue key ceremony (BOB's act)". `ai-catalogue`, `ai-issuer` and the test container read it and keep no copy. The new keys must differ from Bob's release/recovery keys of K2930 (a fresh key does).
- **What gets signed**: the seed payload (ai-catalogue R39), by the statement of signatures R51, exactly `bio-ai-catalogue/1\nseq N\nschema S\nissued <UTC>\nsha256 <hex>\nbytes B\n`, as an armored SSHSIG in namespace `bio-ai-catalogue` (R49), verified by `verifyAiCatalogue` (R53) and by stock `ssh-keygen -Y verify`. Later and with the same key: advisories (`bio-ai-advisory`, R52) and the issuer's seal-key document (R54). The seal key *pair* itself is a different custody (K5457, issuer option (b): off-Worker scorer) and is not part of this ceremony.
- Two acts, not one: **Act 1** (keys and public lines) is wanted now; **Act 2** (sign the seed) needs the seed payload, which is ai-catalogue's data job (layer 2, plan row `[waits: BOB's key ceremony and seed signing]`) and does not exist yet. The ruled step for the public lines is K5577 (5): BOB sends them to the signatures job "as a CHANGE". That job is already merged (K5607, with test keys), so the lines now arrive as a requirement-line change plus its test, routed by the handoff's rule (open job, else a not-started layer's START, else the completion round).

## 2. Candidate routes (none needs Bob to type a command)

**A. One-off local page, opened from a file on Bob's Mac, offline (recommended).** A single self-contained HTML file, no network call, WebCrypto Ed25519. It is the retired signer page (`bio-plane/src/sign-release.html` at 45c880ccd1, the K2922 sitting's page, 32 KB) cut to what the ceremony needs: make two keys with the catalogue's labels, optional passphrase (the `BIOKEY1.` protected form, as old R43/R44), copy/download buttons, "load a key" to prove the saved copy works, and one new "sign a catalogue seed" tab that takes the R51 statement text, shows its fields in words, signs only those bytes in `bio-ai-catalogue`.
- Fits: K2922 (a local page, keys and passphrases in Mac Passwords); Distribution §10 (offline, recovery key never in an environment, repository, workflow or session); K5457 ("offline signing key"); BOB never sees a secret (the page runs on Bob's Mac).
- Risks: (i) the page is new code that holds a key: it needs review and a test, and no module owns it (signatures lost its page at T51; control-plane R109 forbids one in the plane): ownership is **unruled**. (ii) How the file reaches Bob's Mac (K2922 says "opened locally" but the ruling does not say how he got it): a download link from a rendered page or a GitHub link; either is hosted code, so the page must be a reviewed, hashed file BOB states the SHA-256 of. (iii) Safari/Chrome must support WebCrypto Ed25519 (any 2025+ release does; the old page relied on it).

**B. The same page published as a claude.ai artifact, keys made in the browser tab.** Easiest delivery (Bob already reads rendered pages from BOB), clipboard and "save to Passwords" are the same clicks.
- Risks: not offline: the key is made in a page served by a hosted origin that can be republished at any time (the artifact's author is a session); an artifact sandbox may block clipboard or download; against the spirit of Distribution §10 ("offline") and K5457. Acceptable only for Act 1 if Bob wishes, never for loading the signing key to sign the seed. Not recommended.

**C. A GitHub Actions run Bob approves (like `release-sign.yml`, K2930's pattern), the key made and held as an environment secret.**
- Risks: the key would never appear to Bob, so it cannot go in Mac Passwords (breaks K2922); Distribution §10 forbids the recovery key in an environment or workflow; the runner and BOB's session handle the secret (BOB must never see or print one). Fine only as a *signing* route for the signing key if Bob later rules it (the release key sits so by K2930); never for key making or for the recovery key.

(D, refused: BOB or a worker generating the keys. A session would see the seed.)

## 3. Recommendation

Route A, in two sittings with Bob. Sitting 1 now: make both keys, store them in Passwords, hand back the two public lines. Sitting 2 when the seed payload exists: sign the seed with the same page. Recovery key: made at sitting 1, stored, never loaded again unless the signing key is lost or stolen; Bob keeps a second copy elsewhere (K2277 (1)).

## 4. Plain steps for Bob (Route A; the page and its link come from BOB, tested first; Passwords wording to be checked on his Mac)

Sitting 1, about 10 minutes.
1. Click the link BOB gives you. Click "Download the key page". A file named `catalogue-keys.html` lands in Downloads.
2. Turn Wi-Fi off (the Wi-Fi icon at the top of the screen, switch it off). Double-click the file; it opens in your browser. The top of the page says it works without a network.
3. Open the Passwords app. Click "+", make an entry named "BIO catalogue signing key"; click the password box and choose the strong password Passwords suggests; save. That is its passphrase. Do the same for "BIO catalogue recovery key".
4. Back on the page, type the first passphrase twice in the signing key's box and the second in the recovery key's box (copy each from Passwords). Click "Make the catalogue keys".
5. Under "Signing key", click "Copy". In Passwords open the signing-key entry, paste into its Notes, save. Do the same under "Recovery key" for the recovery entry. Then put one more copy of the recovery key somewhere else you control (an email to yourself that you keep, or a note in another account).
6. Prove it: reload the page (Cmd-R), click "Load a key", paste the signing key from Passwords, type its passphrase. The page shows its public line; it must match the one made in step 4. Do the same for the recovery key.
7. Click "Copy the two public lines" and paste them into the chat with BOB. These are safe to show.
8. Close the page, delete `catalogue-keys.html` from Downloads, turn Wi-Fi back on.

Sitting 2 (seed), about 5 minutes: BOB shows the seed's statement rendered in words and gives the same page link. Repeat steps 1-2, click "Sign a catalogue seed", paste the statement text, check the words read the same as BOB's, load the signing key as in step 6, click "Sign", copy the signature into the chat. BOB verifies it with `verifyAiCatalogue` and stock `ssh-keygen -Y verify` before anything is embedded.

BOB's side, after step 7: confirm both lines normalise as R2 reads them and differ from every `RELEASE_KEYS` line; write them into `CATALOGUE_KEYS` through the signatures change; run R50's test (controls included); record the ruling with the two lines (as K2930 did).

## 5. Rulings relied on (the line that matters)

- **K2922** (Bob): "I'll use the Mac Passwords for hold the keys" and a locally opened signer page; keys and passphrases kept in Passwords (amends K2277 (3)).
- **K2277** (Bob): (1) Bob alone acts, keeps a second copy of the recovery key in another place he controls; (3) passphrases and recovery key in his password manager (now Passwords).
- **K2930** (BOB's record): the release/recovery/ratify public lines made at Bob's sitting; precedent for recording the lines in a ruling and for the release key in the `release` environment (Bob the required reviewer).
- **K5457** (Bob via AI-DESIGN): the catalogue and the issuer each have an offline signing key, one custody decision; `CATALOGUE_KEYS` a list of its own, not the release key.
- **K5471**: third namespace `NS_AI_RUN` (not a ceremony key; run keys are throwaway in the container).
- **K5577 (5)**: layer 1 does not wait; the job builds `CATALOGUE_KEYS` with test keys; "Bob makes the catalogue signing and recovery keys on the signer page during layer 1 (as K2922), and BOB sends their public lines to the running signatures job as a CHANGE".
- **K3807 / K3814**: the signing page and `/sign` are deleted at T51; release key, recovery key and release signing are "release-operator tooling in `release-sign.yml` and BOB's command line, not a page".
- **control-plane R109**: "The signing page is not served"; no route, no `SIGN_HTML`; the plane holds no signing page.
- **signatures R49-R56** (K5457): namespaces, R50's list, R51's statement bytes, R53 verifier, R54 seal-key document; R34/R35 key formats; R50: "after the catalogue key ceremony (BOB's act)".
- **Distribution §10** (docs/architecture/BIO_Distribution_v0_1.md): the recovery key is "Bob alone, offline, passphrase-protected; never in an environment, a repository, a workflow or a session".
- **ai-catalogue R39** (draft-ai-catalogue.md, taken at layer 2): a release carries a seed payload verified as a pulled one; a bad signature leaves the copy `unavailable`.
- **CLAUDE.md P17**: Bob does not edit files or enter commands.

## Silent or conflicting points

1. **Conflict: K5577 (5) says "on the signer page ... (as K2922)"; the page is gone (K3807, K3814, R109).** It survives in git history only (45c880ccd1 and earlier), and it cannot sign `bio-ai-catalogue` (its tabs sign only release, ratification, notice and docket) and labels its keys `bio-release`. So the old page cannot be used as is; this draft's Route A needs a cut-down new page.
2. **Conflict, wording: R109/K3807 hand release-key and recovery-key work to "BOB's command line"**, while P17 says Bob types nothing. Read here as BOB's session, not Bob's Mac; the rulings do not say. I found no ruling on a terminal policy for Bob's Mac beyond P17.
3. **Silent: who owns a one-off ceremony page** (signatures has retired its page; control-plane must not serve one; no module's `paths` fits), and its test. A ruling or a lane is needed, or BOB keeps it outside the product as a tool file with a checked hash.
4. **Silent: how the file reaches Bob's Mac** (K2922 records "opened locally" only).
5. **Silent: labels and comments for the catalogue keys.** I propose `bio-ai-catalogue` and `bio-ai-catalogue-recovery`; R50's test only needs the lines to differ from the release lines.
6. **Silent: whether the catalogue signing key may ever sit in a GitHub environment** (K5457 says "offline"; the release key does by K2930). Matters because each advisory is "a person's act" (issuer R7 wants it quick): Bob may later rule route C for the signing key alone.
7. **Silent: what the catalogue recovery key signs** and when it replaces the signing key (R50 holds both lines as allowed signers; no ruling states the replacement act, unlike Distribution §10's release recovery rule).
8. Sitting 2 depends on the seed payload and its `seq`/`issued` values, which the ai-catalogue job does not yet produce; nothing in Act 1 depends on it.
9. Passwords-app screens and field names in step 3 and 5 are from general knowledge of macOS and not verified.
