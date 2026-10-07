# signatures (T36)

**Status** · session_01L8Hyorky2d1Lrs1dqmDrCn · depth 2 · WORKING · handled B2

## J1 · QUESTION

Best readings for R43/R44 (details I take as yours to rule; I am building on them now and will bring the work in line with any answer):
1. The recovery key's envelope label and public-line comment are `bio-release-recovery` (`BIOKEY-RAW1.bio-release-recovery.…` / `BIOKEY1.bio-release-recovery.…`; `ssh-ed25519 … bio-release-recovery`), so its private and public text name it wherever they appear. Loading it arms the page's release slot (it signs `bio-release`, R31) and the page calls it "Recovery key". `seedFromEnvelope` (R34) already accepts any label, so nothing else changes.
2. The recovery key is made in its own section ("Make a recovery key"), apart from Generate, with its own passphrase field under R43's rule (optional, protected form when given). Making it does not arm it; its file is `bio-recovery-key.txt`, never mixed into `bio-signing-keys.txt`.
3. R43's one raw showing is offered for the release key only, not for the ratification key or the recovery key (Distribution §10: the recovery key is never in an environment).
4. A passphrase at Generate must be typed twice; a mismatch generates nothing.
