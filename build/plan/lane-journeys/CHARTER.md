# Lane: the journeys walk (JOURNEYS)

**Status** · Open. Chartered by BOB #192, 2026-10-16, on Bob's proposal (K3539): "There are many, many Civicsmith features and journeys that need to be tested that don't require the use of the assistant." The lane tests; it changes no product code and decides nothing. Defects reach the plan only through BOB.

## The job
Walk every feature and journey of the live release that does not need the assistant, as administrator and as member, against the design, and report each defect with its evidence. The bar is Bob's: real users must understand the product and be comfortable with it; every screen is exactly what it needs to be, looks sharp and is fully functional (K3052); "I can install, sign in, the screens are usable, I can create a project … and work on a real investigation" (K3320).

## Work, in order
1. **The walk plan**, from the design (`docs/development/ux-substrate/`, the screens and words; `requirements/README.md`'s canon; `build/plan/draft-T49-walk.md` and the earlier walk notes `build/plan/walk-085*`): every journey (arrive, install, sign in, sign out, join, recover, home, and each journey a member or administrator takes: projects, intake and upload, records, questions without the assistant, people, settings, wizards, publication) and every screen, each with what "works" means for it. Write it before walking; it can be written before the release is deployed.
2. **Walk** the release on the trial instance once BOB says it is deployed, journey by journey, at 1280 and 390 wide, in a browser (Chromium with `--no-proxy-server`; the environment's setup script now trusts the egress CA, K3530, K3534; if the browser still fails, report that first). Use only `JOURNEY_ADMIN_*` and `JOURNEY_MEMBER_*` from the environment, by variable, never printed (rulings-active §4). Reach the instance directly (`--noproxy '*'`), never through the agent proxy.
3. **Report** each defect: the journey and screen, what the user sees (screenshot), what the design says, severity (blocks a journey, misleads, cosmetic), and, where it is plain, the module that owns it (`build/modules.json`). A missing screen is a defect.
4. Walk again after each fix round BOB names.

## How the lane works
- Its record is this folder on `tranche/T49` (then the open tranche branch): `PLAN.md`, `FINDINGS.md` (numbered `J-<n>`), screenshots under `shots/`. Commits only here; never `main`, product code, another lane's files, or `docs/development/ux-substrate/`.
- Its work on the instance stays in its own projects, named `JOURNEYS …`, and never touches another lane's records ("WALK-085 project" is the assistant's).
- Workers name model and effort (K3518): haiku at low for mechanical work, sonnet at medium for walks and reviews.
- It reports to BOB in `HANDOFF.md` (entries `W<n>`), read by BOB at takeover and each backstop check. BOB turns each defect into a plan entry: a fix round on the cut when it blocks the release, otherwise T50. Bob may work with the lane directly; a question for Bob goes with an explanation, options and a recommendation.
- An act refused by a permission or safety check is never worked around: the lane records it in `HANDOFF.md` for BOB.
