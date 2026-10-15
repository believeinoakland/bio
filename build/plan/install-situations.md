# Install situations: what early installs met, and what to expect

**Status** · Kept current by every BOB (K3456, Bob's direction). Every situation an install, update or deploy of a group's Civicsmith meets on a real account is added here the day it is seen, with what the installer must do so a non-technical founder never meets it. Situations not yet seen but foreseeable are listed too, so the installer is ready for them. Each row names the entry that makes the installer handle it; a row with no entry yet gets one in `next.md` in the same commit. The installer job of each tranche reads this file whole (its START names it).

**The bar (Bob, K3447, K3456):** the installer alone installs and keeps every part of a group's Civicsmith, with a seamless, non-technical experience, without fail. No founder deploys, retries by hand, reads a log, or meets a technical word.

## Seen in early installs

| id | seen | what happened | what the installer must do | entry |
| --- | --- | --- | --- | --- |
| S1 | K3432 | The account already held a Civicsmith installation; the installer stopped at "already installed". | Say what is there in plain words and offer the way forward (keep, update, or a guided removal). | N1148 (held to 2026-10-17, K3439) |
| S2 | K3440 | The read-back of the 21 MB plane exceeded a Worker's 128 MB and the page stopped with no next step and no error. | Every step within the platform's memory at real size, tested so; a step that dies is detected and named, never a silent stop. | N1149 (applied, R085-1) |
| S3 | K3445 | A fresh install from a new cut got no capability workers: the built-in release was paired with the older fleet manifest on `main`. | Install every part from the same release; the finished panel lists every part and its version. | N1150 |
| S4 | K3445 | Logpush could not be read (the OAuth grant lacked the scope). | Ask for every scope the install needs, up front. | N1151 |
| S5 | K3445 | "Checking that it answers" read NOT DONE because the new address had not woken yet. | Wait and retry with visible progress until the address answers, within a stated bound; never report a not-yet-ready step as failed. | new: N1157 |
| S6 | K3448 | Deploying a container member needs its image pulled and pushed; the session's Docker daemon was absent, and died again on a container restart (K3455). | The installer never depends on a local tool or daemon: images by digest from the public registry, every container step through Cloudflare's API from the installer itself. | N1150, N1157 |
| S7 | K3448 | A redeploy skipped itself as "byte-identical" while the bindings it should have set were missing. | Judge "already done" by the whole deployed state (bytes, bindings, secrets, routes), never the bytes alone. | N1157 |
| S8 | K3450 | A cold instance's first sign-in start missed its 30 s address wait (SIGNIN_UNAVAILABLE); a retry took 6.7 s. | Waits sized for a cold start, retried once by the system before the member sees anything. | N1155 note; N1157 |
| S9 | K3456 | A new container image deployed, but the running container kept serving the old image until it went idle. | After an update, confirm the new version is what answers (restart the instance if needed) before saying "done". | N1157 |
| S10 | K3445 | The one-time password page can be printed or saved (it reached a session as a PDF). | Tell the founder plainly it is one-time and not to share it; it is spent at the claim. | — (text, design stream) |

## Foreseeable, not yet seen

| id | situation | what the installer must do | entry |
| --- | --- | --- | --- |
| F1 | The founder closes the browser, loses connection or the laptop sleeps mid-install. | Every step idempotent and resumable: reopening continues where it stopped and says so. | N1157 |
| F2 | The account is not on Workers Paid, or Containers are not enabled. | Detect before anything is created; say exactly what to turn on, in plain clicks, and wait for it. | N1157 |
| F3 | An account limit is reached (workers, Durable Object classes, buckets, containers). | Check limits before starting; name what is in the way and the plain way out. | N1157 |
| F4 | Cloudflare's API answers slowly, rate-limits (429) or fails transiently (5xx). | Back off and retry within a bound, with visible progress; only a lasting failure reaches the founder, in plain words with one action. | N1157 |
| F5 | The image registry (GHCR) is slow or unavailable. | Retry; then say Civicsmith's software source is unavailable and to try later, nothing left half-installed. | N1157 |
| F6 | The OAuth grant expires or is revoked mid-install. | Ask the founder to approve again and continue. | N1157 |
| F7 | The chosen name is taken (workers.dev subdomain or worker name). | Say so before creating anything and offer a free name. | N1157 |
| F8 | A step partly succeeds (a worker created, its binding not). | Detect partial state on every run and complete or roll it back. | N1157 |
| F9 | Two installs or updates run at once on one account. | Hold one at a time; the second waits or says one is running. | N1157 |
| F10 | An update must replace running containers and Durable Object classes (migrations). | Run migrations in order and confirm every part serves the new version before "done" (S9). | N1157 |
