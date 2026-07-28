# CivicOS Layer 3 UI: state and next-session kickoff

v1, 2026-07-28. Follows plane **0.35.0** on biosmoke7 (see BIO_DATAPLANE_STATE.md).

**The Layer 3 UI runtime exists and is live, reading the real record from R2.**
Open https://civicos.believeinoakland.workers.dev and it serves the CivicOS
client, which loads the actual 30-bundle working record (the sewer-fund
evidence series, the auditor report, the ACFR statements, the OpenGov transfer
series) from the biosmoke7 plane. It is a real runtime wired to the live ops,
not a prototype. The signed plane and its record are untouched: `op=audit`
reads 30 checked, 30 clean.

## What runs where, and why the UI is a separate worker

The UI does **not** live in the plane. It runs as an isolated dev worker named
`civicos`, which serves `app.html` and forwards `/api/*` to the plane
(`biosmoke7`) through a Cloudflare **service binding** named `PLANE`. The plane
is signed and its deployed bytes are verified identical to the signed release;
injecting UI code into it would break that discipline and put the record within
reach of a deploy mistake. So the dev UI is a separate artifact. For production
the UI folds into the real domain as `believeinoakland.com/CivicOS` once that
zone is in place; the dev proxy worker is scaffolding, not the shipped shape.

The service binding is required, not a preference: a worker cannot HTTP-fetch
another worker on the same `*.workers.dev` zone (Cloudflare error 1042). The
binding routes worker-to-worker directly and avoids it.

## The design source of truth

`civicos-ui/tokens.css` is canonical (Bob's design foundation from the Claude
Design session; the handoff calls it the drop-in deliverable, do not fork the
values). Civic-ledger register: verdigris `#2F6F62` is the only signature
(primary action, verified fill), terracotta `#B3441E` is rationed to at most one
attention element per screen, working sits on `--paper`, published on `--sheet`.
Two spaces are set by `[data-space="working"|"published"]` on the document root.
The fence is a printer's double rule and appears nowhere else. Serif is
judgment, sans is plain speech, mono is machine fact. Chips are lowercase; the
only uppercase in the system is mono eyebrows. Radius ceiling is 2px, no pill.
The standing design brief is `docs/development/UI-KICKOFF.md`; requirements are
`docs/development/BIO_Design_Requirements_v2.md`. The full design-language
foundation (tokens plus the two register proofs) came from the Claude Design
session; `civicos-ui/tokens.css` is its committed, canonical output.

## The runtime (`civicos-ui/app.html`)

Self-contained client. It inlines `tokens.css` verbatim for standalone opening
(canonical remains `tokens.css`; when served, swap the inline block for
`<link rel="stylesheet" href="/tokens.css">`). Fonts load from Google Fonts for
dev convenience; production embeds the OFL WOFF2 faces under `/fonts/` per the
`@font-face` block already in `tokens.css`.

Connection: `const PLANE = { base:"", token, session, preview }`. Empty `base`
means same-origin, which is true when served by the `civicos` worker, so
`/api/...` calls reach the proxy and no CORS is involved. The gate offers three
ways in: sign in with `op=login` (member handle, or empty handle for the
administrator), paste a `MEMBER_TOKEN`, or "preview the design" with no data.

Wired to real ops and live on connect:
- Rail is capability-shaped from `op=whoami` (a capability the member lacks is
  absent, not greyed; Members & Keys hides for a non-admin).
- Record from `op=list`, leading with the human title (bundle id dropped from
  the row), lowercase chips, verdigris fill for verified.
- Bundle view from `op=image`, parsing the real nested YAML frontmatter into the
  facts card plus a mono provenance line, and rendering the prose and the
  append-only history.
- Search from `op=search` with a client-side fallback over `op=list`.
- Published space from `op=publishedmanifest` (public, currently empty).
- Members from `op=memberlist`.

## Op contracts (verified against biosmoke7 this session)

- Auth is a query param: `/api/?op=X&token=Y`. `op=login` is a POST of
  `{role, password}` returning `{ok, token}`; `role` is the member handle, empty
  is the administrator. The returned token is then passed as `token=`.
- `op=list` -> `{result:[{bundle_id, object_type, title, current_state, last_updated}]}`.
- `op=image&id=X` -> `{result:{filename: content | {sha256, bytes, ...}}}`.
  `bundle.md` carries YAML frontmatter: top-level `current_state`,
  `criticality`, `classification`, `content_hash` (`sha256:...`),
  `source_status`, and a nested `source: { locator, authority, retrieved }`.
- `op=whoami` -> `{result:{tokenClass, session, member, handle, administer,
  capabilities, vocabulary}}`. A `MEMBER_TOKEN` returns `tokenClass:"member"`,
  `session:false`, `capabilities:null` (reads work; capability-shaping needs a
  member session via login).
- `op=publishedmanifest` is public, no token ->
  `{result:{published:[{bundle_id, bundle_sha, ratified_at, attestor_member,
  gate_version}], shas:[]}}`. Currently `published:[]`.
- The worker sets **no CORS headers**. That is the whole reason the UI must be
  same-origin (served or proxied) rather than a local file calling the plane.

## Build and deploy the dev worker

`civicos-ui/worker.template.mjs` is the proxy logic with an
`__APP_HTML_BASE64__` placeholder. To (re)deploy after any UI edit, from a shell
with a Cloudflare deploy token:

    # 1. embed the current app.html into a deployable worker.mjs
    python3 - <<'PY'
    import base64,re
    app=open("civicos-ui/app.html","rb").read()
    t=open("civicos-ui/worker.template.mjs").read()
    t=t.replace("__APP_HTML_BASE64__", base64.b64encode(app).decode())
    open("/tmp/worker.mjs","w").write(t)
    PY

    # 2. deploy the 'civicos' script (account + subdomain below)
    ACCT=20b533579290b9b93168345edd3b7f72        # from the credentials file
    curl -X PUT "https://api.cloudflare.com/client/v4/accounts/$ACCT/workers/scripts/civicos" \
      -H "Authorization: Bearer $CF_TOKEN" \
      -F 'metadata={"main_module":"worker.mjs","compatibility_date":"2026-07-01","bindings":[{"type":"service","name":"PLANE","service":"biosmoke7"}]};type=application/json' \
      -F 'worker.mjs=@/tmp/worker.mjs;type=application/javascript+module'

    # 3. first time only: enable the workers.dev URL
    curl -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCT/workers/scripts/civicos/subdomain" \
      -H "Authorization: Bearer $CF_TOKEN" -H "content-type: application/json" \
      --data '{"enabled":true,"previews_enabled":false}'

Account subdomain is `believeinoakland`, so the URL is
`https://civicos.believeinoakland.workers.dev`. The plane is never touched by
this.

## Done this session

Adopted the design foundation; built the runtime and wired it to the live ops;
stood up the `civicos` dev worker and verified it end to end against real R2
data; refined the record layout, wordmark, chips, and the bundle view to match
the storyboard.

## Next

1. **Wire the write actions.** Release, cite, capture, and triage are laid out
   but read-only. Start with Review -> `op=release` (per-document, plus the
   batch flow that records the homogeneity acknowledgment and mitigation). Then
   triage on Focuses (`op=dispose`), cite in Projects, capture in Add
   (`op=capture` / `op=promote`).
2. **Keep refining the look** against the storyboard as Bob drives real data.
3. **Production shape.** Decide whether to keep the dev proxy worker or fold the
   UI into the plane's own serving path for `believeinoakland.com/CivicOS`.
4. **Fonts.** Embed the OFL WOFF2 faces under `/fonts/` instead of Google Fonts.
5. **The published reading surface** (gap G1): no public op renders a ratified
   case-file body yet; the manifest and per-hash verify exist.

## Open decision for Bob

The record heading is set to 34px to match the storyboard's inviting register,
which is larger than `--t-rec` 22px in the token file. The token and the
storyboard disagree here. Keep 34px, or drop to the strict token value.

## Grants (pasted per session, never committed)

Same model as SESSION-KICKOFF.md. This work needs: a **Cloudflare deploy token**
(redeploy `civicos`), a throwaway **MEMBER_TOKEN** (read and verify against
biosmoke7), and the **GitHub token** (push). The account id and instance ids are
in the credentials file Bob pastes; no value is stored here.
