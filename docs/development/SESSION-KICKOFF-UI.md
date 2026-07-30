# Paste-ready kickoff for the next session

Rewritten 2026-07-30 at the close of the session that closed the plane/UI gap
(link surface, capture honesty, U8; UI builds cbbade6bbd93 then 9a34a82fd0c8).
Bob pastes the block below verbatim and fills the three grant slots. Everything
the session needs it fetches for itself from the public repo; Bob attaches
nothing.

---

Kickoff. Fetch these from raw.githubusercontent.com/believeinoakland/bio/main and
read them before anything else: docs/development/UI-PLAN.md (the plan of record;
U1 through U8 are DONE and the standing dependencies section now names two plane
defects that make the link surface tell a member something untrue),
docs/development/CIVICOS_UI_STATE.md (read the newest entry only, v29),
docs/development/DEBT.md (D-57, D-58 and D-59 are the last session's and the first
two are this session's work), docs/development/LINK-FIDELITY.md (the link design
with my rulings marked RATIFIED inline), bio-plane/package.json and
bio-plane/scripts/deploy.mjs (the plane's release path), civicos-ui/test/run.mjs
(the UI test path).

This session, in order:

(1) Fix D-58 in the plane and release it. captured_locators is written only inside
the subresource branch of op=acquire, so a document captured the ordinary way is
not a resolvable link target and no verdict about it can ever be established. The
locator write needs nothing from the parser and belongs beside the register write,
unconditionally. Backfill what the store already holds if that is cheap, and say
plainly if it is not.

(2) Fix D-57 in the plane. resolveLinks describes a self-reference as a target
that CHANGED, naming one capture hash twice as both sides of its own bracket,
because before and after match the same row when the target IS the source. A
self-reference is a fourth BASIS and not a fourth verdict. The viewer prints the
plane's basis verbatim, so this is only fixable here.

(3) Measure D-59 across more hosts before deciding whether the identical-byte
bracket arm earns its complexity. Two captures of a Legistar page twelve minutes
apart hash differently on ASP.NET viewstate alone, so contemporaneous may be
unreachable for a large class of municipal sources. Report what you measure, not
what you expect.

(4) U9, triage and case-building: dispose on Focuses with reasons recorded, and
cite from a search selection into a Project with the note grammar's constraints
surfaced BEFORE refusal rather than after. The document page already shows the
source's own links, so a member can see what there is to cite from.

(5) Then the browser half of U8's acceptance, which needs a member or
administrator SESSION rather than a machine token: capture a live URL from the
form, watch the continuation drive, and confirm the new bundle appears collected
with its links and manifest on its own page.

(6) Deploy discipline, both planes. Plane: full suite, signed, tagged, deployed
byte-identical through scripts/deploy.mjs, audit clean after. UI: node
test/run.mjs bare, deploy, verify /build has converged, push source and docs
together.

(7) Update UI-PLAN.md, add a state doc entry, and rewrite this kickoff file for
the session after.

Grants for this session (sessions carry no secrets; paste all three even if
unchanged): Cloudflare deploy token: [PASTE]. GitHub fine-grained token for
believeinoakland/bio, Contents read/write: [PASTE]. Member token for post-deploy
verification: [PASTE]. Deploy target account id
20b533579290b9b93168345edd3b7f72 (biocloudflare), plane worker biosmoke7, UI
worker civicos. Work without asking me to confirm anything determinable from the
repo; decision items at the end only.
