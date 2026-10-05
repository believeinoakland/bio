# working extraction: BIO_Distribution_v0_1.txt (170 lines, read 1-170 in one chunk)

WHAT: v0.1 DRAFT 2026-09-14 BOB #11, level-1 home of construct 15 (distribution: installer, releases, fleet, multi-instance); "It RULES NOTHING" — restates D-297, D-292, D-106, D-108, D-118, DEC-42 etc.; mechanisms at 0.58.0; status as of 2026-09-25. Supersedes TAD v10 §9, §10.1, §10.5, §10.6 as live description (l.9).

TIME
- [DESIGN] §2 l.41 — "The instance keeps its own record current unattended on one reconciling alarm (construct 14)" — the only scheduler hook; SCHEDULER.md cited.
- [DESIGN] §1 l.35 — REC-64: "a sovereign instance on an older surface would freeze the sentence at ITS build, so two instances would tell a member different things" — version-in-force of product wording across instances.
- [DESIGN] §6 rung 5 l.95 — `confirmServing()` polls `/version` within a budget, "ROLLOUT NOT CONFIRMED"; "Durable-Object-routed ops can still lag after the Worker answers".
- [DESIGN] §5 l.75-83 — IC-172: copy records which group produces its record ONCE at store's first boot from `INSTANCE_NAME`; pre-0.71.0 copy refuses until done (`GROUP_UNDETERMINED`); "when that version is unknown the telling is conditional and says so".

ORGANISATIONS
- [DESIGN] §1 l.35 — "A group — as small as one person — installs its own sovereign instance into its own Cloudflare account"; "There is no hosted service, no central record, no operator who can read a group's evidence" (D-118). (The watchdog group as an organisation; not government bodies.)
- [DESIGN] §5 l.76-80 — the record names which GROUP produces it (`INSTANCE_NAME`, `op=instancegroupseed`); "a copy's worker name need not be its group's slug (this project's copy is `biosmoke7`; its group, `believe-in-oakland`)".
- [DESIGN] §6 rung 6 l.97-106 — scratch sweep takes identity (`members`, `admin_votes`); `#activeAdmins` and administrator-consensus count read `members`; "membership in the record is governed by `BIO_Membership_Architecture_v2.md`, never by eviction"; refused `memberadd` leaves `proposed` row by Membership v2 §4.7 design. (Group's internal roles, not government.)
- none on government bodies, positions, obligations or reporting lines.

LAW
- none in BIO_Distribution_v0_1.txt (no law/regulation content; DEC-42 is a pricing ruling, see QUESTIONS).

COURTS
- none in BIO_Distribution_v0_1.txt.

ANALYSIS
- [DOCTRINE] §3 l.47 — "A release is a signed statement about bytes, and nothing about a release is decided by what a tool said — only by what was read back."
- [DESIGN] §6 rung 4 l.94 — `deploy.mjs` "states UNDETERMINED — never a match — when the settings do not say"; rung 8 l.142 — a release whose plane predates the fields "states those builds UNDETERMINED — never a match" (verification derived values carry undetermined).
- [RULING] §6 rung 6 l.107-119 — D-506, IC-265, BOB #32 2026-09-24 06:07Z: `op=livefire` — "`ok` says THE OP ANSWERED, and `ok:false` is reserved for a catalogued refusal"; result is `verdict` (`pass`/`fail`) with failed assertions NAMED in `failing`.
- [EXAMPLE] §6 rung 6 l.101-102 — FLEET found "7 VF-4 member rows, 6 `proposed`, surviving a purge" — identity residue changes next run's "membership arithmetic" (counts used in governance computed from tables).

QUESTIONS (AI models, providers, cost, compute)
- [DESIGN] §4 l.56 — fleet members: `pdf-worker` (tier-2 text), `ocr-worker` (tier-3 OCR with tesseract-wasm), "`agent-worker` (the assistant's credential cascade and plane callback)".
- [DESIGN] §4 rule 4 l.63 — "an instance with no agent member has an assistant that says the capability is unavailable (`BIO_Assistant_and_AI_Roles_v0_1.md` §6). Degradation is per member, at install and at update, never silent (D-297)." A sovereign instance with no OCR member "claims nothing about a scan's text".
- [RULING] Incomplete §6 l.17-18 — D-260 RULED (BOB #22, 2026-09-21; Assistant §6): "an instance may hold ONE organisation-principal `ai` credential as a deploy secret, and it resumes only the runs that credential opened"; plane reads Worker secret `INSTANCE_AI_TOKEN`; "on a copy holding none, every wake says `NO_INSTANCE_AI_CREDENTIAL`"; NEVER GENERATED — "a member mints it on the copy (DS-3)"; carried through install/update (DIST-9 2026-09-24); reaches a group only with next release.
- [BUILT] §8 table l.164 — instance-held `ai` credential; woken run re-entered (IC-242 2026-09-23); install/update CARRY operator-supplied token.
- [DESIGN] §8 l.163 — DS-3 (account cascade configuration) row not marked done.
- [RULING] §2 l.41 — DEC-42: Workers Paid required: "$0/month plus a card becomes $5/month plus a card — not free becomes paid"; "a registered domain is NOT required." (compute/cost platform)
- [DESIGN] §6 rung 4 l.94 / Incomplete l.16 — plane's `limits.subrequests` (D-54, 2026-09-23) stated in wrangler.jsonc with reason; biosmoke7 reads back 10000 (2026-09-24); "never Cloudflare's default of the month"; NOT BUILT: carrying it at runtime from the signed release. (compute limit per request)
- [DESIGN] §6 rung 6 l.126-140 — D-463 (2026-09-24): `op=aicredentialmint` optional `confinedTo`; `ai_credentials.confined_to`; `confinedNamespaceGate` holds a minted AI credential's calls to `scratch`; BOB's ruling on whether doctrine owed (Incomplete l.13).
- [DESIGN] §6 rung 6 l.113 — "the catalogue-free `agent-worker`" reads `ok:false` as refusal.
- [GAP] §8 l.165 — "WARC/Memento interchange; capture-byte custody at scale — M6's absorbed debt (D-99; the R2 growth question) — not designed".
- [GAP] §7 l.146-149 — multi-instance isolation planned not built; shared stateless member (e.g. one OCR worker) acceptable if "structural isolation so that a shared worker is incapable of writing to the wrong partition" (Bob).

DOCTRINE
- [DOCTRINE] §1 l.35 — "The distribution model IS the product"; instance installed by a stranger "behaves exactly as the record describes and can prove it."
- [DOCTRINE] §2 l.43 — "a group's evidence never transits a server we run; a group can be left, mirrored and outlived (M6); and a stranger can verify what it published without the instance's cooperation".
- [DOCTRINE] §4 rule 4 l.63 — absent capability stated per member, never silent (same shape as UNDETERMINED).
- [DOCTRINE] §6 l.89 — D-108: "A deploy verified is not a build serving"; l.144 "If a live probe contradicts the suite, establish which build answered before believing either".
- [DESIGN] §3 l.51 — signing namespaces (`bio-release`, `bio-release-fleet`, `bio-ratify`) stop a ratification signature installing software.
