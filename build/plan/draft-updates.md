# Draft: update notices (N1047)

**Status** · BOB #169, 2026-10-14. Bob's requirement (K3158, his words): "The Civicsmith system should automatically check for update releases and notify admins when one is ready, say what the differences are (aka, release notes), and allow the admin to decide whether to update or not. Use secure best practices when designing this feature, and make the UX be consistent with the rest of the admin experience." Folded into requirements when T48's plan is written; screens owed to the design stream (HANDOFF). Everything below is BOB's detail (P17).

## What exists
- A release is cut and signed (`release/RELEASE.json`: version, sha256 of every asset, an `ssh-ed25519` signature by the `bio-release` key). The installer embeds a signed release and refuses an unsigned or mismatched one (`newgroup/scripts/embed-release.mjs`, `ARMED_SIGNERS`).
- An update is applied only from the installer's `GET /update` page (installer R1, R52, R54), through Cloudflare's own consent screen. Nothing tells a group a release exists.

## The design
1. **The release feed.** Each release publishes, beside its assets, a small signed notice: version, date, the sha256 of the release manifest, whether it carries a security fix, and its release notes in members' words (what changed for members, for administrators, and anything an administrator must do). It is signed by the same release key; the notes are part of what is signed. Published at one fixed public HTTPS address of the project's (the GitHub release assets).
2. **The check.** Each group's Civicsmith fetches the feed on its own schedule (once a day, at a time spread per group), a plain GET that sends no group name, member, cookie or credential. It accepts a notice only when the signature verifies against the release keys the running version carries, the version is higher than the running one (no downgrade, no replay of an old notice), and the notes are within a size cap and rendered as text only (no HTML, scripts or remote images). A failed or tampered fetch is logged and retried next day; it never reaches a member.
3. **The notice.** A verified newer release becomes one to-do for every administrator (the queue, as other administrator to-dos are), and an "Updates" section in Settings: the version running, the version ready, its date, the security mark when present, and the release notes. One item per release; a newer release replaces an unanswered older one.
4. **The decision is the administrator's.** Nothing updates on its own. The administrator chooses "Update" or "Not now" (snooze), or "Skip this version" with a reason (a reasoned act, recorded with who and when, so the group can see it). A security release shows its mark and comes back after a snooze; it is still never applied without the administrator's choice.
5. **Applying.** "Update" opens the installer's update page for this group, named with the version chosen. The group's Civicsmith holds no power to rewrite itself: the update runs only through Cloudflare's consent by someone who holds the group's Cloudflare account, and the installer installs only a signed release whose hashes match. An administrator without that account access gets "Pass it to whoever holds your Cloudflare account" with a link to copy. After the update, the running version answers the new one and the to-do leaves.

## Why this is the secure shape
Signed notes and signed code by one key the running version already trusts; no credential in the group's Civicsmith that could deploy code; no data sent on the check; no rendering of untrusted markup; no downgrade; every decision recorded.

## Modules (to be placed in T48's plan)
The release tooling (the signed notice and notes), the plane (the daily check and its verification), queue producers (the administrator to-do), screens-settings (Updates), installer (`/update` takes the chosen version, refuses any other), words.json (the design stream's words).
