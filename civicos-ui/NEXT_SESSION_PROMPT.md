CivicOS / BIO session. I'm Bob (Sparky informally). Bootstrap from the public
repo github.com/believeinoakland/bio, no credentials needed: fetch the source
tree and docs/. Read docs/BIO_DATAPLANE_STATE.md (the plane's current state) and
docs/CIVICOS_UI_STATE.md (the Layer 3 UI state), and look at civicos-ui/.

Where we are: the CivicOS UI runtime is built and live at
https://civicos.believeinoakland.workers.dev, reading the real 30-bundle record
from R2. It runs as a separate dev worker (civicos) that serves civicos-ui/app.html
and proxies /api to the signed plane (biosmoke7) via a PLANE service binding, so
the plane and its record stay untouched. tokens.css is the design source of truth.

Standing rules: no em dashes; deliver complete replacement files, never ask me to
edit files or use a CLI; lead with the finding; "Groundhog" is my correction
keyword; end with genuine decision items only. I supervise at a high level and do
not retain session detail, so make every point self-contained. Tokens are pasted
per session and never committed.

First task: keep building out the runtime. Wire the write actions, starting with
Review -> op=release (per-document, then the batch acknowledgment flow), and keep
refining the look against the storyboard. There is one open design decision waiting
in docs/CIVICOS_UI_STATE.md (record heading 34px vs the 22px token). To redeploy
the UI you'll need a Cloudflare deploy token; to read/verify against biosmoke7, a
throwaway MEMBER_TOKEN; to push, the GitHub token. I'll paste what you need.
