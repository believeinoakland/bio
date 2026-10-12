# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #164 (`session_01UBLCpdUsHtrooH5Ji41yu4`, primary account, depth 1), 2026-10-12, on Bob's pause at 95% (K3046), amended at Bob's refresh (K3049).

## BOB #165's focus (Bob, K3049): a review, no development

Bob: "Refresh BOB. The focus of that session will be to review the state of CivicSmith development to better understand what we have and how far current development is from the system we've been designing." **No development, no job, no deploy until Bob says** (K3049). What prompted it: release 0.83.0 went live on `biosmoke7` (K3048); Bob opened https://biosmoke7.believeinoakland.workers.dev/ and found the old administrator setup page (`setup-page`, served at `/`), not the interface he designed; the built interface (`/app`: interface-shell and four screens modules, T46) opens only for a member session, so an administrator is bounced back to `/` silently (interface-shell R3). BOB #164 had told Bob the release was ready to use without checking what he would see: its error. Bob's design is the artifact **Civicsmith Screens**, https://claude.ai/artifact/PjJoJCxMe1LHjt3wPq6rfa (Bob's, about 550 KB; read it with the Artifact tool, `action: read`, through workers given the comparison task, P20). The review, read-only, its findings brought to Bob rendered (an Artifact) with options and a recommendation (P17): (1) what that document is against the repository's design files (`docs/development/ux-substrate/`, DECISIONS.md: same, older or newer); (2) what is built and deployed (`/`, `/app`, which of its screens exist, how sign-in and administration work), screen by screen against the document; (3) the gap and its causes (recorded rulings such as K2893 keeping the setup page, versus oversights in planning, e.g. no requirement for the front door or the administrator's path); (4) how far T47's plan (`build/plan/current.md`) closes it and what it misses. Bob's tokens are scarce: keep the review lean (workers read in bulk; BOB reads their summaries). Read `build/rulings-active.md` first; this BOB's rulings are K3026–K3046.

## Where things stand

- **T47 is open, paused in L3** (`tranche/T47`; plan `build/plan/current.md`, 76 entries after K3038–K3043). L1 closed (K3035), L2 closed (K3043). Requirements for every layer are folded (K3028, K3030, K3033, K3038, K3041), so each later START needs only its body (`build/plan/starts-T47/`, script form as BOB #164 used: entry line, BOB's notes, reading set, merge order).
- **L3 at the pause (all four sessions archived, K3046):** host-governor COMPLETE (its J1 unread by BOB: read it, run ownership, merge); capture, file-safety, sources mid-work, their pushes kept on `job/T47/<module>`: restart each as `<MODULE> #n+1` on its branch with the fixed prompt (§5.4's restart). sources has B2 (K3045's answer) to act on.
- **Release 0.83.0** (K3044): cut `dist/cut-0.83.0` @ f1c3a30deb; signing run 38256015203 waits on Bob's approval in the GitHub `release` environment; then steps 7 onward (verify controls and each deploy are Bob's approvals in session; trial §4 steps 15–17). A run left waiting may expire: re-dispatch `release-sign.yml` on the cut if so.
- **Channel:** BOB's Writer line is BOB #164's (primary). Posted B156, B157 (T47's hand-offs); UX-DESIGN read through B154. Lanes: investigation H43, actions H31, nothing new.
- **Not yet started from the opening's acts:** N943 (file-safety split map), N945 (bootstrap study), N996 (credentials split map), N898 (mail tool, process repo).

## Bob's rulings since the last handoff

- K3046: pause at 95% ("Pause development as soon as possible").

## Next steps after the review, only when Bob says to resume development

1. Take over (§5.1) on the account Bob names. On the secondary account: BOB #164 and the primary's sessions cannot be archived from there; leave them, no `BOB-final` row (account-switch rule); the `BOB` row of `build/channels.md` follows the account at T47's close.
2. Read host-governor's J1, merge it (§5.5); restart CAPTURE, FILE-SAFETY, SOURCES; arm backstop and WATCH.
3. Carry T47 through L5–L11 as planned; merge order notes are in each layer's line.
4. Release 0.83.0 from step 7 once Bob has approved the signing.

## Open with Bob

- Q1–Q4 (K3041, his UX): the welcome wizard's entry (A: offered on Home until finished), what People opens (A: Find for people and organisations), where readers see a published case (A: a new `/app/published/<case>` page beside legacy-ui's), signing in the new interface (A: open the existing signing page and paste back). Needed before L11's START.
- The 0.83.0 signing approval on GitHub (run 38256015203).
- His weekly meter: 95% at the pause (primary).
- ROOT #7 (the primary's ROOT #5 is past 300k tokens); on the secondary account ROOT #6 (`session_01FXbdTJZyPp3Bhcv7pfVSR1`) exists.
- The stewards' contact address (K2799).
