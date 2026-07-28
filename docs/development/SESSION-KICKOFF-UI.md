# Next-session kickoff: plane 0.36.0 (capture fidelity), then U7

Bob: paste the prompt below to start the session, adding the two grants
where marked. The plane release needs both; if you only want UI work, omit
them and say so, and the session does U8 scaffolding against the live
plane instead.

---

Kickoff. Fetch these from
raw.githubusercontent.com/believeinoakland/bio/main and read them before
anything else: docs/development/UI-PLAN.md (the plan of record),
docs/development/CAPTURE-FIDELITY.md (this session's spec),
docs/development/CIVICOS_UI_STATE.md (read the newest two entries only),
docs/SESSION-KICKOFF.md (grant process), bio-plane/package.json (build and
test commands).

This session, in order: (1) implement CAPTURE-FIDELITY.md as plane release
0.36.0: op=acquire subresources, content-addressed subresource captures,
the derived script-stripped render companion and
data/snapshot-manifest.json, with tests in the plane suite; (2) release
discipline in full: npm run build, the whole test suite, sign with the
bio-release key, release/RELEASE.json, tag v0.36.0, deploy to biosmoke7
preserving bindings, verify deployed bytes hash-identical to the signed
asset, op=audit clean; (3) U7 in the UI: resolve snapshot manifests
through op=capture with per-part verification and render in the sandboxed
frame; acceptance is a captured page with stylesheets and images rendering
faithfully; (4) push everything, update UI-PLAN.md (mark U7), state doc
entry, and rewrite this kickoff file for the session after.

Grants for this session: Cloudflare deploy token: [PASTE]. GitHub
fine-grained token for believeinoakland/bio, Contents read/write, 7-day
expiry: [PASTE]. Deploy target account id 20b533579290b9b93168345edd3b7f72
(biocloudflare). Work without asking me to confirm anything determinable
from the repo; decision items at the end only.

---

After the session, Claude rewrites this file for the next one, so this
kickoff is always current.
