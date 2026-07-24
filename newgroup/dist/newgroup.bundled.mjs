// src/ui.mjs
var PAGE_CSS = `
:root{
  --ink:#16232E; --paper:#EDEFE8; --paper-2:#E3E7DD;
  --verdigris:#2F6F62; --verdigris-dk:#1F4F45;
  --signal:#B3441E; --rule:#C6CBBF; --muted:#5C6B66;
  --body:system-ui,-apple-system,"Segoe UI",sans-serif;
  --mono:ui-monospace,Menlo,Consolas,monospace;
}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--body);
  font-size:17px;line-height:1.6;-webkit-font-smoothing:antialiased}
main{max-width:660px;margin:0 auto;padding:52px 22px 80px}
.eyebrow{font-family:var(--mono);font-size:11px;letter-spacing:.16em;
  text-transform:uppercase;color:var(--verdigris);margin:0 0 14px}
h1{font-family:Georgia,serif;font-weight:600;font-size:clamp(28px,4.2vw,40px);
  line-height:1.1;margin:0 0 16px;letter-spacing:-.01em}
h2{font-family:Georgia,serif;font-weight:600;font-size:20px;margin:26px 0 10px}
p{margin:0 0 15px;max-width:62ch}
a{color:var(--verdigris-dk)}
.small{font-size:14.5px;color:var(--muted)}
.mono{font-family:var(--mono);font-size:13.5px;word-break:break-all}
.card{border:1px solid var(--rule);background:#F6F7F2;padding:20px 22px;margin:0 0 18px}
.notice{border-left:3px solid var(--signal);background:#F8EFE9;padding:16px 18px;margin:16px 0 18px}
.notice h2{margin-top:0;font-size:18px;color:var(--signal)}
.okbox{border-left:3px solid var(--verdigris);background:#EDF3F0;padding:16px 18px;margin:0 0 18px}
label{display:block;font-weight:600;font-size:14.5px;margin:14px 0 6px}
input[type=text]{width:100%;padding:11px 13px;font-family:var(--mono);font-size:14.5px;
  border:1px solid var(--rule);background:#fff;color:var(--ink);border-radius:0}
input:focus-visible,button:focus-visible,a:focus-visible{outline:2px solid var(--verdigris);outline-offset:2px}
.hint{font-size:13.5px;color:var(--muted);margin:6px 0 0}
button,.btnlink{display:inline-block;margin-top:18px;padding:12px 22px;font-size:15.5px;font-weight:600;
  cursor:pointer;background:var(--verdigris);color:#fff;border:1px solid var(--verdigris-dk);
  text-decoration:none}
button:hover,.btnlink:hover{background:var(--verdigris-dk)}
button:disabled{opacity:.55;cursor:default}
button.copy{margin:0;padding:4px 10px;font-size:12.5px;font-weight:500;background:transparent;
  color:var(--verdigris-dk);border:1px solid var(--rule)}
button.copy:hover{border-color:var(--verdigris)}
.err{color:var(--signal);font-size:14.5px;margin-top:12px;min-height:1.4em}
.choice{display:block;border:1px solid var(--rule);background:#fff;padding:15px 17px;margin:0 0 10px;cursor:pointer}
.choice:hover{border-color:var(--verdigris)}
.choice input{margin-right:9px}
.kv{display:flex;gap:10px;align-items:baseline;padding:8px 0;border-top:1px solid var(--rule);font-size:14.5px}
.kv:first-child{border-top:0}
.kv .k{color:var(--muted);min-width:150px;flex-shrink:0}
.kv .v{font-family:var(--mono);font-size:13px;word-break:break-all;flex:1}
.log{margin:22px 0 8px}
.row{display:flex;gap:11px;align-items:baseline;padding:8px 0;font-size:15.5px;border-top:1px solid var(--rule)}
.row:first-child{border-top:0}
.row .dot{flex-shrink:0;width:10px;height:10px;border-radius:50%;background:var(--rule);position:relative;top:0}
.row.go .dot{background:var(--verdigris);animation:pulse 1.1s ease-in-out infinite}
.row.ok .dot{background:var(--verdigris)}
.row.no .dot{background:var(--signal)}
.row.ok span:last-child::before{content:""}
@keyframes pulse{50%{opacity:.35}}
.actions{margin-top:8px}
`;
function page({
  title,
  description,
  eyebrow,
  lede,
  blocks,
  slugLabel,
  slugHint,
  placeholder,
  buttonText,
  mode,
  footer
}) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<style>${PAGE_CSS}</style>
</head>
<body>
<main>
<p class="eyebrow">${eyebrow}</p>
<h1>${title}</h1>
<p class="lede">${lede}</p>

${blocks}

<label for="slug" id="slug-label">${slugLabel}</label>
<input id="slug" type="text" autocomplete="off" spellcheck="false" placeholder="${placeholder}">
<p class="hint" id="slug-hint">${slugHint}</p>

<button id="go">${buttonText}</button>
<p class="err" id="err"></p>

<p class="small">Pressing the button takes you to dash.cloudflare.com to
approve the permission, then brings you straight back here.</p>
${footer}
</main>
<script>
const $=s=>document.querySelector(s);
const slugify=v=>v.toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"").slice(0,40);
$("#slug").addEventListener("input",e=>{const p=e.target.selectionStart;e.target.value=slugify(e.target.value);
  try{e.target.setSelectionRange(p,p)}catch{}});
$("#go").addEventListener("click",async()=>{
  const err=$("#err");err.textContent="";
  const slug=slugify($("#slug").value);
  if(slug.length<3){err.textContent="The name needs at least 3 characters.";$("#slug").focus();return;}
  $("#go").disabled=true;
  try{
    const r=await fetch("/begin",{method:"POST",headers:{"content-type":"application/json"},
      body:JSON.stringify({slug,mode:"${mode}"})});
    const j=await r.json();
    if(!j.ok){err.textContent=j.error||"That name was not accepted.";return;}
    location.href=j.authorize;
  }catch(e){err.textContent="Could not start: "+e.message;}
  finally{$("#go").disabled=false;}
});
</script>
</body>
</html>`;
}
var WIZARD_HTML = page({
  mode: "install",
  title: "Set up your group's copy",
  description: "Install your group's own copy of the Believe in Oakland accountability record, into your own Cloudflare account.",
  eyebrow: "Believe in Oakland &middot; installer",
  lede: `In a few minutes your group will have its own copy of the
accountability record, running in your own Cloudflare account. Not an account
of ours: yours, under your control, from the first second.`,
  blocks: `<div class="card">
<p style="margin:0"><b>What you need:</b> a Cloudflare account, which is free
and takes an email address to create. No card is needed. If your account
happens to have large-file storage turned on, this copy will use it; if not,
everything still works and it can be added later.
<a href="https://dash.cloudflare.com/sign-up" rel="noopener">Create a
Cloudflare account</a> first if you do not have one, then come back.</p>
</div>

<h2>What happens when you press the button</h2>
<p>Cloudflare will show you a permission screen naming exactly what this
installer may do in your account: install the software, and set up its
storage. You approve it there, on Cloudflare's own page, and you can revoke
it any time from your Cloudflare dashboard. The permission passes through
this installer for the seconds the setup takes. This installer has no
database and nowhere to keep it, and it is never stored.</p>
<p class="small">Prefer to do everything by hand, with nothing passing
through us at all? The manual path is documented and permanently supported.
It is slower and uses the Cloudflare dashboard directly, and it exists so
that your group can stand up a copy even if Believe in Oakland disappears.</p>

<h2>Name your copy</h2>`,
  slugLabel: "A short name for your group",
  slugHint: `Lower-case letters, digits, and hyphens. It becomes part of your
web address, so pick something you are happy to say out loud.`,
  placeholder: "oakland-sewer-watch",
  buttonText: "Continue to Cloudflare",
  footer: `<p class="small" style="margin-top:34px;border-top:1px solid var(--rule);padding-top:16px">
Already running a copy and looking for the current release? That is
<a href="/update">a separate page</a>.</p>`
});
var UPDATE_HTML = page({
  mode: "update",
  title: "Update your copy",
  description: "Bring an existing group copy of the Believe in Oakland record up to the current software release.",
  eyebrow: "Believe in Oakland &middot; software update",
  lede: `This brings a copy your group already runs up to the current software
release. It changes the software and nothing else: your passwords, your
credentials, and your record are untouched, and that is enforced by how the
update is applied, not by promise.`,
  blocks: `<h2>What happens when you press the button</h2>
<p>Cloudflare shows you the same permission screen as at install. You approve
it on Cloudflare's own page, the new release is placed into your account, and
the permission is gone the moment it finishes. Nothing is stored here.</p>

<h2>Which copy</h2>`,
  slugLabel: "The name of the copy to update",
  slugHint: "The first part of your copy's address, before the first dot.",
  placeholder: "oakland-sewer-watch",
  buttonText: "Continue to Cloudflare",
  footer: `<p class="small" style="margin-top:34px;border-top:1px solid var(--rule);padding-top:16px">
Setting up a brand-new copy instead? That is <a href="/">the setup page</a>.</p>`
});

// src/release.mjs
var RELEASE_VERSION = "0.3.11";
var RELEASE_SOURCE = '// src/schema.mjs\nvar SCHEMA = `-- BIO store schema, draft 1, derived from the real bundle.md frontmatter and\n-- _history/manifest.json shapes in tree 0.1.94. The bundle format is\n-- authoritative; this is a projection of it and must never bend it.\n\nCREATE TABLE IF NOT EXISTS bundles (\n  bundle_id     TEXT PRIMARY KEY,\n  object_type   TEXT NOT NULL,\n  group_id      TEXT NOT NULL,\n  title         TEXT,\n  current_state TEXT NOT NULL,\n  prior_state   TEXT,\n  created       TEXT NOT NULL,\n  last_updated  TEXT NOT NULL,\n  criticality   TEXT,\n  classification TEXT,\n  bundle_sha    TEXT NOT NULL,\n  row_version   INTEGER NOT NULL DEFAULT 1\n);\nCREATE INDEX IF NOT EXISTS bundles_type_state ON bundles(object_type, current_state);\nCREATE INDEX IF NOT EXISTS bundles_updated ON bundles(last_updated);\n\n-- Live files. The storage rule is by ROLE, not by size:\n--   content   set when the file participates in the gate\'s byte comparisons\n--             (bundle.md, analysis, work product, manifests, data). Inline,\n--             because C-5 and C-12 compare live against history and the gate\n--             is byte-complete by necessity, so a whole-store pass must not\n--             pay a network round trip per file.\n--   blob_sha  set when the file is a registered capture, verified by\n--             capture.sha256 and never compared byte-wise by the gate. Lives\n--             in R2, content-addressed, edge-served, egress-free.\n-- Exactly one of the two is set.\n-- MEASURED BACKSTOP: Durable Object SQLite refuses a single value above\n-- roughly 2MiB with SQLITE_TOOBIG (2,098,176 B passed, 2,252,800 B failed).\n-- Spill to R2 at 1MB, which leaves a 2x margin, and enforce it at write.\nCREATE TABLE IF NOT EXISTS files (\n  bundle_id TEXT NOT NULL,\n  path      TEXT NOT NULL,\n  content   TEXT,\n  blob_sha  TEXT,\n  bytes     INTEGER NOT NULL,\n  sha256    TEXT NOT NULL,\n  PRIMARY KEY (bundle_id, path)\n);\n\n-- Append-only history snapshots. C-5 and C-12 compare live against these.\nCREATE TABLE IF NOT EXISTS history (\n  bundle_id TEXT NOT NULL,\n  snap_key  TEXT NOT NULL,\n  path      TEXT NOT NULL,\n  content   TEXT,\n  blob_sha  TEXT,\n  sha256    TEXT NOT NULL,\n  created   TEXT NOT NULL,\n  PRIMARY KEY (bundle_id, snap_key, path)\n);\nCREATE INDEX IF NOT EXISTS history_bundle ON history(bundle_id);\n\nCREATE TABLE IF NOT EXISTS manifest (\n  bundle_id  TEXT NOT NULL,\n  snap_key   TEXT NOT NULL,\n  kind       TEXT NOT NULL,\n  base       TEXT,\n  author     TEXT,\n  created    TEXT NOT NULL,\n  files_json TEXT NOT NULL,\n  PRIMARY KEY (bundle_id, snap_key)\n);\n\n-- References extracted from frontmatter, so C-6.2 is a join rather than a scan.\nCREATE TABLE IF NOT EXISTS refs (\n  bundle_id TEXT NOT NULL,\n  target_id TEXT NOT NULL,\n  kind      TEXT NOT NULL DEFAULT \'\',\n  PRIMARY KEY (bundle_id, target_id, kind)\n);\nCREATE INDEX IF NOT EXISTS refs_target ON refs(target_id);\n\n-- The register: the trust root. capture_sha is the only thing that proves bytes.\nCREATE TABLE IF NOT EXISTS register (\n  capture_sha TEXT PRIMARY KEY,\n  bundle_id   TEXT NOT NULL,\n  path        TEXT NOT NULL,\n  encoding    TEXT NOT NULL,\n  bytes       INTEGER NOT NULL,\n  registered  TEXT NOT NULL\n);\nCREATE INDEX IF NOT EXISTS register_bundle ON register(bundle_id);\n\nCREATE TABLE IF NOT EXISTS leases (\n  bundle_id  TEXT PRIMARY KEY,\n  actor      TEXT NOT NULL,\n  acquired   TEXT NOT NULL,\n  expires    TEXT NOT NULL,\n  base_sha   TEXT NOT NULL\n);\n\nCREATE TABLE IF NOT EXISTS seq (\n  scope TEXT PRIMARY KEY,\n  next  INTEGER NOT NULL\n);\n\n-- Credentials live here rather than in Worker secrets, because a Worker cannot\n-- rewrite its own secret. ADMIN_TOKEN is a bootstrap credential used once; the\n-- real password is chosen by the operator and only its hash is stored. Losing\n-- it is recoverable by overwriting ADMIN_TOKEN in the dashboard, which returns\n-- the instance to an unclaimed state.\nCREATE TABLE IF NOT EXISTS credentials (\n  role       TEXT PRIMARY KEY,\n  salt       TEXT NOT NULL,\n  hash       TEXT NOT NULL,\n  iterations INTEGER NOT NULL,\n  updated    TEXT NOT NULL\n);\n\n-- Sessions are DO-backed so a password login can be exchanged for a bearer\n-- token without the password travelling on every later request.\nCREATE TABLE IF NOT EXISTS sessions (\n  token   TEXT PRIMARY KEY,\n  role    TEXT NOT NULL,\n  expires INTEGER NOT NULL,\n  created TEXT NOT NULL\n);\nCREATE INDEX IF NOT EXISTS sessions_expires ON sessions(expires);\n\n-- One row, id=1. Records that the bootstrap credential has been spent.\nCREATE TABLE IF NOT EXISTS bootstrap (\n  id          INTEGER PRIMARY KEY CHECK (id = 1),\n  consumed_at TEXT,\n  token_fp    TEXT\n);\n`;\n\n// src/tokens.mjs\nvar PUBLISHED_TOKEN_HASHES = /* @__PURE__ */ new Set([\n  // dist/SECRETS.txt of the 0.2.0 test deployment\n  // ADMIN_TOKEN\n  "34451e5e855bf8d45e93d89fca560e6bd392cf1d0cc6832e3121614d1c68d9db",\n  // MEMBER_TOKEN\n  "7ecc5d014e25ce4c2e8457424afa0420288742c69182db1be5f4caccd63d4c91",\n  // PROBE_TOKEN\n  "5910ebbfe7816d9d5e2451012f9db8ac92aaa3f65a8f50da3f7255ab8bdb26ad"\n]);\nvar sha256hex = async (v) => {\n  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v));\n  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");\n};\nasync function liveToken(v) {\n  if (typeof v !== "string" || v.length === 0) return false;\n  return !PUBLISHED_TOKEN_HASHES.has(await sha256hex(v));\n}\n\n// src/livefire.mjs\nvar sha256 = async (s) => {\n  const b = await crypto.subtle.digest("SHA-256", typeof s === "string" ? new TextEncoder().encode(s) : s);\n  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");\n};\nasync function livefire(env, storeName) {\n  const t0 = Date.now();\n  const stub = env.STORE.get(env.STORE.idFromName(storeName));\n  const post = async (op, body) => {\n    const r = await stub.fetch(new Request("http://x/" + op, { method: "POST", body: JSON.stringify(body) }));\n    return (await r.json()).result;\n  };\n  const get = async (path) => {\n    const r = await stub.fetch(new Request("http://x/" + path));\n    return (await r.json()).result;\n  };\n  const A = [];\n  const assert = (name, got, want, note) => {\n    const ok = JSON.stringify(got) === JSON.stringify(want);\n    A.push({ name, ok, ...ok ? {} : { want, got }, ...note ? { note } : {} });\n    return ok;\n  };\n  const NONCE = crypto.randomUUID();\n  const id = `INFO-2026-9001-livefire-${NONCE.slice(0, 8)}`;\n  const md = (state, rev) => `---\nid: ${id}\nobject_type: information\ncurrent_state: ${state}\nnonce: ${NONCE}\n---\n\n## Summary\n\nrev ${rev}\n`;\n  const pkgFor = async (state, rev, extra = []) => {\n    const body = md(state, rev);\n    return {\n      bundleId: id,\n      snapKey: "20260723T190000Z_livefire",\n      author: "livefire",\n      meta: { object_type: "information", group: "believe-in-oakland", title: "livefire", current_state: state, created: "2026-01-01T00:00:00Z", last_updated: (/* @__PURE__ */ new Date()).toISOString() },\n      files: [{ path: "bundle.md", text: body, bytes: body.length, sha256: await sha256(body) }, ...extra],\n      refs: [],\n      register: []\n    };\n  };\n  const c1 = await post("promote", { ...await pkgFor("collected", 1), base: null });\n  assert("creation with base null succeeds", c1.ok, true);\n  const sha1 = c1.bundleSha;\n  assert("second creation refused", (await post("promote", { ...await pkgFor("collected", 2), base: null })).reason, "EXISTS");\n  const c3 = await post("promote", { ...await pkgFor("verified", 3), base: sha1 });\n  assert("update with correct base succeeds", c3.ok, true);\n  assert("row_version advanced", c3.rowVersion, 2);\n  const sha2 = c3.bundleSha;\n  assert(\n    "STALE base refused",\n    (await post("promote", { ...await pkgFor("ratified", 4), base: sha1 })).reason,\n    "CAS_STALE",\n    "the lost-update floor, on real storage"\n  );\n  assert("garbage base refused", (await post("promote", { ...await pkgFor("ratified", 5), base: "deadbeef" })).reason, "CAS_STALE");\n  const live = await get(`image?id=${id}`);\n  assert("live state is the winning revision", /rev 3/.test(live["bundle.md"]), true);\n  assert("history holds the superseded revision", /rev 1/.test(live["_history/20260723T190000Z_livefire/bundle.md"] || ""), true);\n  assert("manifest projected", "_history/manifest.json" in live, true);\n  const big = "x".repeat(1024 * 1024 + 1);\n  const overPkg = await pkgFor("verified", 6, [{ path: "big.md", text: big, bytes: big.length, sha256: await sha256(big) }]);\n  assert("oversize inline refused at the write", (await post("promote", { ...overPkg, base: sha2 })).reason, "OVERSIZE_INLINE");\n  assert(\n    "canary nonce survived the round trip",\n    new RegExp(NONCE).test(live["bundle.md"]),\n    true,\n    "proves the battery actually wrote and read real storage"\n  );\n  const y = "9001";\n  const a1 = await get(`allocid?prefix=LFIRE&year=${y}`);\n  const a2 = await get(`allocid?prefix=LFIRE&year=${y}`);\n  assert(\n    "allocid increments without gaps",\n    Number(a2.id.split("-").pop()) - Number(a1.id.split("-").pop()),\n    1\n  );\n  const l1 = await get(`lease?id=${id}&actor=probe-a`);\n  assert("lease returns live sha as edit base", l1.base, sha2);\n  const l2 = await get(`lease?id=${id}&actor=probe-b`);\n  assert("second actor denied while lease holds", l2.ok, false);\n  {\n    const names = ["ADMIN_TOKEN", "MEMBER_TOKEN", "PROBE_TOKEN", "PUBLIC_TOKEN"];\n    const configured = names.filter((n) => typeof env[n] === "string" && env[n].length > 0);\n    const published = [];\n    for (const n of configured) {\n      if (PUBLISHED_TOKEN_HASHES.has(await sha256(env[n]))) published.push(n);\n    }\n    assert("no configured token is a published repository value", published, []);\n    assert(\n      "no configured token is shorter than 16 characters",\n      configured.filter((n) => env[n].length < 16),\n      []\n    );\n  }\n  const r2 = { ok: true, sizes: [] };\n  const capturesBound = typeof env.CAPTURES?.get === "function";\n  const publishedBound = typeof env.PUBLISHED?.get === "function";\n  r2.configured = capturesBound && publishedBound;\n  if (!r2.configured) {\n    assert(\n      "R2 absence is symmetric: both buckets or neither",\n      capturesBound,\n      publishedBound,\n      "one bucket bound without the other breaks the fence"\n    );\n    assert("R2 not configured is declared, not silent", r2.configured, false);\n  } else try {\n    const key = `scratch/livefire-${NONCE}`;\n    const payload = new TextEncoder().encode("capture bytes " + NONCE);\n    await env.CAPTURES.put(key, payload, { sha256: await crypto.subtle.digest("SHA-256", payload) });\n    const back = await env.CAPTURES.get(key);\n    r2.roundTrip = (await back.text()).endsWith(NONCE);\n    const h = await env.CAPTURES.head(key);\n    r2.serverSideChecksum = h?.checksums?.sha256 ? [...new Uint8Array(h.checksums.sha256)].map((x) => x.toString(16).padStart(2, "0")).join("") === await sha256(payload) : "not returned";\n    const ranged = await env.CAPTURES.get(key, { range: { offset: 0, length: 7 } });\n    r2.rangeRead = await ranged.text() === "capture";\n    await env.CAPTURES.delete(key);\n    for (const mb of [0.1, 1, 8, 25]) {\n      const buf = new Uint8Array(Math.round(mb * 1024 * 1024)).fill(65);\n      const k = `scratch/t-${mb}-${NONCE}`;\n      const tp = Date.now();\n      await env.CAPTURES.put(k, buf);\n      const putMs = Date.now() - tp;\n      const tg = Date.now();\n      const g = await env.CAPTURES.get(k);\n      const bytes = (await g.arrayBuffer()).byteLength;\n      const getMs = Date.now() - tg;\n      await env.CAPTURES.delete(k);\n      if (bytes !== buf.length) {\n        r2.sizes.push({ sizeMB: mb, error: "length mismatch, NO NUMBER REPORTED" });\n        r2.ok = false;\n        continue;\n      }\n      r2.sizes.push({ sizeMB: mb, putMs, getMs, putMBps: +(mb / (putMs / 1e3)).toFixed(1), getMBps: +(mb / (getMs / 1e3)).toFixed(1) });\n    }\n    assert("R2 capture round trip through binding", r2.roundTrip, true);\n    assert("R2 range read", r2.rangeRead, true);\n  } catch (e) {\n    r2.ok = false;\n    r2.error = String(e && e.message || e);\n    assert("R2 exercised without error", false, true);\n  }\n  const tw = Date.now();\n  const stats = await get("stats");\n  const dang = await get("dangling");\n  const wholeMs = Date.now() - tw;\n  const passed = A.filter((a) => a.ok).length;\n  return {\n    ok: A.every((a) => a.ok) && r2.ok,\n    ranAt: (/* @__PURE__ */ new Date()).toISOString(),\n    store: storeName,\n    nonce: NONCE,\n    totalMs: Date.now() - t0,\n    summary: `${passed}/${A.length} assertions passed`,\n    assertions: A,\n    r2,\n    storeState: { ...stats, danglingRefs: dang.dangling.length, wholeStorePassMs: wholeMs },\n    note: "Confined to the scratch namespace. Live state is unreachable from this token class."\n  };\n}\n\n// src/setup.mjs\nvar SETUP_HTML = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<meta name="robots" content="noindex">\n<title>Your accountability record</title>\n<style>\n:root{\n  --ink:#16232E; --paper:#EDEFE8; --paper-2:#E3E7DD;\n  --verdigris:#2F6F62; --verdigris-dk:#1F4F45;\n  --signal:#B3441E; --rule:#C6CBBF; --muted:#5C6B66;\n  --body:system-ui,-apple-system,"Segoe UI",sans-serif;\n  --mono:ui-monospace,Menlo,Consolas,monospace;\n}\n*{box-sizing:border-box}\nbody{margin:0;background:var(--paper);color:var(--ink);font-family:var(--body);\n  font-size:17px;line-height:1.6;-webkit-font-smoothing:antialiased}\nmain{max-width:640px;margin:0 auto;padding:56px 22px 80px}\n.eyebrow{font-family:var(--mono);font-size:11px;letter-spacing:.16em;\n  text-transform:uppercase;color:var(--verdigris);margin:0 0 14px}\nh1{font-family:Georgia,serif;font-weight:600;font-size:clamp(28px,4.2vw,38px);\n  line-height:1.1;margin:0 0 16px;letter-spacing:-.01em}\nh2{font-family:Georgia,serif;font-weight:600;font-size:20px;margin:28px 0 10px}\np{margin:0 0 15px;max-width:60ch}\n.small{font-size:14.5px;color:var(--muted)}\n.card{border:1px solid var(--rule);background:#F6F7F2;padding:20px 22px;margin:0 0 18px}\n.notice{border-left:3px solid var(--signal);background:#F8EFE9;padding:16px 18px;margin:0 0 18px}\n.okbox{border-left:3px solid var(--verdigris);background:#EDF3F0;padding:16px 18px;margin:0 0 18px}\nlabel{display:block;font-weight:600;font-size:14.5px;margin:14px 0 6px}\ninput{width:100%;padding:11px 13px;font-family:var(--mono);font-size:14.5px;\n  border:1px solid var(--rule);background:#fff;color:var(--ink);border-radius:0}\ninput:focus-visible,button:focus-visible{outline:2px solid var(--verdigris);outline-offset:2px}\n.hint{font-size:13.5px;color:var(--muted);margin:6px 0 0}\nbutton{margin-top:18px;padding:12px 22px;font-size:15.5px;font-weight:600;cursor:pointer;\n  background:var(--verdigris);color:#fff;border:1px solid var(--verdigris-dk)}\nbutton:hover{background:var(--verdigris-dk)}\nbutton:disabled{opacity:.55;cursor:default}\n.err{color:var(--signal);font-size:14.5px;margin-top:12px;min-height:1.4em}\n.kv{display:flex;gap:10px;align-items:baseline;padding:7px 0;border-top:1px solid var(--rule);font-size:14.5px}\n.kv:first-of-type{border-top:0}\n.kv .k{color:var(--muted);min-width:150px}\n.kv .v{font-family:var(--mono);font-size:13.5px;word-break:break-all}\nsection{display:none} section.on{display:block}\nmain.wide{max-width:860px}\n.crumb{font-family:var(--mono);font-size:12.5px;margin:0 0 18px}\n.crumb a{color:var(--verdigris);text-decoration:none;cursor:pointer}\n.crumb a:hover{text-decoration:underline}\ntable.rec{width:100%;border-collapse:collapse;font-size:14.5px;margin:6px 0 22px}\ntable.rec th{font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;\n  color:var(--muted);text-align:left;font-weight:600;padding:6px 10px 6px 0;border-bottom:1px solid var(--rule)}\ntable.rec td{padding:9px 10px 9px 0;border-bottom:1px solid var(--rule);vertical-align:baseline}\ntable.rec tr.row{cursor:pointer}\ntable.rec tr.row:hover td{background:#F6F7F2}\n.bid{font-family:var(--mono);font-size:13px;color:var(--verdigris-dk)}\n.chip{display:inline-block;font-family:var(--mono);font-size:11px;letter-spacing:.08em;\n  text-transform:uppercase;padding:2px 8px;border:1px solid var(--rule);color:var(--muted);background:#F6F7F2}\n.chip.verified,.chip.ratified{color:#fff;background:var(--verdigris);border-color:var(--verdigris-dk)}\n.chip.elevated,.chip.forming{color:var(--signal);border-color:var(--signal);background:#F8EFE9}\n.md h2{font-size:19px;margin:26px 0 8px}\n.md h3{font-family:var(--body);font-weight:700;font-size:15.5px;margin:20px 0 6px}\n.md p{margin:0 0 12px}\n.md ul{margin:0 0 12px;padding-left:22px}\n.md li{margin:0 0 4px}\n.md code{font-family:var(--mono);font-size:13px;background:var(--paper-2);padding:1px 4px}\n.md .revnote{border-left:3px solid var(--signal);background:#F8EFE9;padding:10px 14px;margin:0 0 16px;font-size:14px}\n.filelink{color:var(--verdigris);text-decoration:none}\n.filelink:hover{text-decoration:underline}\n.histbtn{background:none;border:none;padding:0;margin:0;font:inherit;color:var(--verdigris);cursor:pointer;text-decoration:none}\n.histbtn:hover{text-decoration:underline}\n.mono{font-family:var(--mono);font-size:12.5px}\n.dim{color:var(--muted)}\n</style>\n</head>\n<body>\n<main>\n<p class="eyebrow">Believe in Oakland &middot; group instance</p>\n\n<section id="s-loading" class="on">\n  <h1>One moment</h1>\n  <p class="small">Checking the state of this copy.</p>\n</section>\n\n<section id="s-unarmed">\n  <h1>This copy has no one-time password yet</h1>\n  <p>Before anyone can claim it, a bootstrap credential has to exist. Sign in\n  to the Cloudflare account this copy runs in, open this worker\'s settings,\n  and set a long random value called <b>ADMIN_TOKEN</b>. Then reload this\n  page.</p>\n  <p class="small">If it was set but this page still says otherwise, the value\n  in place is one that has been published before and this software refuses to\n  accept it. Set a fresh one.</p>\n</section>\n\n<section id="s-claim">\n  <h1>Claim your copy</h1>\n  <p>This runs in your organization\'s own Cloudflare account. Claiming it\n  spends the one-time password and replaces it with a password you choose.\n  The one-time password stops working the moment this succeeds.</p>\n  <div id="rearm-note" class="notice" hidden>\n    <p style="margin:0"><b>Recovery mode.</b> The one-time password was\n    replaced in the Cloudflare dashboard, so the previous claim is retired and\n    this copy can be claimed again. Nothing stored in the record is affected.</p>\n  </div>\n  <label for="boot">One-time password</label>\n  <input id="boot" autocomplete="off" spellcheck="false">\n  <p class="hint">From the installer\'s final screen, or the ADMIN_TOKEN value\n  set in the Cloudflare dashboard.</p>\n  <label for="pw1">Choose your password</label>\n  <input id="pw1" type="password" autocomplete="new-password">\n  <p class="hint">At least 12 characters. Store it in a password manager.</p>\n  <label for="pw2">Type it again</label>\n  <input id="pw2" type="password" autocomplete="new-password">\n  <button id="do-claim">Claim this copy</button>\n  <p class="err" id="claim-err"></p>\n  <div class="card"><p class="small" style="margin:0"><b>If you ever lose the\n  password you choose here,</b> you are not locked out. Sign in to Cloudflare,\n  replace the ADMIN_TOKEN value in this worker\'s settings, and this claim step\n  starts over. Your Cloudflare sign-in is the way back in.</p></div>\n</section>\n\n<section id="s-login">\n  <h1>Sign in</h1>\n  <p>This copy is claimed. Sign in with the administrator password.</p>\n  <label for="lpw">Password</label>\n  <input id="lpw" type="password" autocomplete="current-password">\n  <button id="do-login">Sign in</button>\n  <p class="err" id="login-err"></p>\n  <p class="small">Lost the password? Sign in to Cloudflare, replace the\n  ADMIN_TOKEN value in this worker\'s settings, and reload this page to claim\n  the copy again.</p>\n</section>\n\n<section id="s-panel">\n  <h1>Your copy is healthy</h1>\n  <div class="okbox"><p style="margin:0" id="panel-lede">Signed in as\n  administrator.</p></div>\n  <div class="card">\n    <div class="kv"><span class="k">Software version</span><span class="v" id="p-version"></span></div>\n    <div class="kv"><span class="k">Claimed</span><span class="v" id="p-claimed"></span></div>\n    <div class="kv"><span class="k">Roles with passwords</span><span class="v" id="p-roles"></span></div>\n    <div class="kv"><span class="k">Session expires</span><span class="v" id="p-expires"></span></div>\n  </div>\n  <div class="actions" style="margin:22px 0 6px"><button id="go-browse">Browse the record</button></div>\n  <h2>What this page is, and is not</h2>\n  <p>This page proves the copy answers, is claimed, and that your password\n  works, and it opens the record for reading. Changing the record happens\n  through the tools your group connects to it, using the member and probe\n  credentials stored when this copy was installed. Those live in your\n  password manager and in this worker\'s settings in the Cloudflare\n  dashboard.</p>\n  <p class="small">To update the software later, return to the installer and\n  choose the update option. Updates never touch your passwords or your record.</p>\n</section>\n\n<section id="s-browse">\n  <p class="crumb"><a id="crumb-panel">This copy</a> &rsaquo; Record</p>\n  <h1>The record</h1>\n  <p class="small" id="browse-summary"></p>\n  <div id="browse-body"><p class="small">Loading the record&hellip;</p></div>\n</section>\n\n<section id="s-bundle">\n  <p class="crumb"><a id="crumb-panel2">This copy</a> &rsaquo; <a id="crumb-browse">Record</a> &rsaquo; <span id="crumb-id" class="mono"></span></p>\n  <h1 id="b-title" style="font-size:clamp(22px,3.4vw,30px)"></h1>\n  <div class="card" id="b-facts"></div>\n  <div id="b-md" class="md"></div>\n  <h2>Files in this bundle</h2>\n  <div class="card" id="b-files"></div>\n  <h2>History</h2>\n  <p class="small">Every revision this bundle has ever had, oldest first. The\n  record is append-only: nothing here can be edited or removed.</p>\n  <div class="card" id="b-history"></div>\n</section>\n\n</main>\n<script>\nconst $ = (s)=>document.querySelector(s);\nconst show = (id)=>{document.querySelectorAll("section").forEach(x=>x.classList.remove("on"));$(id).classList.add("on");};\nconst api = async (op, body)=>{\n  const r = await fetch("/api/?op="+op, body ? {method:"POST",body:JSON.stringify(body)} : undefined);\n  return r.json();\n};\nlet boot0 = null;\nasync function state(){\n  /* The wizard hands over with the one-time password in the URL fragment.\n     Fragments never reach any server. Strip it immediately either way. */\n  const m = location.hash.match(/boot=([^&]+)/);\n  if (m) boot0 = decodeURIComponent(m[1]);\n  if (location.hash) history.replaceState({}, "", location.pathname);\n  try {\n    const saved = JSON.parse(sessionStorage.getItem("bio-session") || "null");\n    if (saved && saved.t && (!saved.e || saved.e > Date.now())) {\n      SESSION = saved.t;\n      const probe = await fetch("/api/?op=stats&token="+saved.t);\n      if (probe.ok) {\n        const b2 = await api("bootstrap");\n        window.__ver = b2.version || "";\n        panel({ token: saved.t, expires: saved.e }, saved.c || b2.consumedAt);\n        return;\n      }\n      SESSION = null; sessionStorage.removeItem("bio-session");\n    }\n  } catch {}\n  let b;\n  try { b = await api("bootstrap"); }\n  catch(e){ $("#s-loading h1").textContent = "This copy is not answering";\n    $("#s-loading .small").textContent = "The page loaded but the record behind it did not respond. Wait a moment and reload."; return; }\n  window.__ver = b.version || "";\n  if (b.claimed) { show("#s-login"); return; }\n  if (!b.bootstrapConfigured) { show("#s-unarmed"); return; }\n  if (b.rearmed) $("#rearm-note").hidden = false;\n  if (boot0) $("#boot").value = boot0;\n  show("#s-claim");\n}\n$("#do-claim").addEventListener("click", async ()=>{\n  const e = $("#claim-err"); e.textContent = "";\n  const bootstrapToken = $("#boot").value.trim();\n  const p1 = $("#pw1").value, p2 = $("#pw2").value;\n  if (!bootstrapToken) { e.textContent = "The one-time password is empty."; return; }\n  if (p1.length < 12) { e.textContent = "The password needs at least 12 characters."; return; }\n  if (p1 !== p2) { e.textContent = "The two passwords do not match."; return; }\n  $("#do-claim").disabled = true;\n  try {\n    const r = await api("claim", { bootstrapToken, password: p1 });\n    if (r.error) { e.textContent = r.error + "."; return; }\n    if (r.result && r.result.ok === false) {\n      e.textContent = r.result.reason === "ALREADY_CLAIMED"\n        ? "This copy was already claimed. If that was not you, replace ADMIN_TOKEN in the Cloudflare dashboard and reload."\n        : "Refused: " + r.result.reason;\n      return;\n    }\n    const l = await api("login", { role: "admin", password: p1 });\n    panel(l.result, r.result.consumedAt);\n  } catch(err){ e.textContent = "The claim did not go through: " + err.message; }\n  finally { $("#do-claim").disabled = false; }\n});\n$("#do-login").addEventListener("click", async ()=>{\n  const e = $("#login-err"); e.textContent = "";\n  $("#do-login").disabled = true;\n  try {\n    const l = await api("login", { role: "admin", password: $("#lpw").value });\n    if (!l.result || !l.result.ok) { e.textContent = "That password was not accepted."; return; }\n    const b = await api("bootstrap");\n    panel(l.result, b.consumedAt);\n  } catch(err){ e.textContent = "Sign-in did not go through: " + err.message; }\n  finally { $("#do-login").disabled = false; }\n});\nlet SESSION = null;\nfunction panel(login, claimedAt){\n  if (login && login.token) {\n    SESSION = login.token;\n    try { sessionStorage.setItem("bio-session", JSON.stringify({ t: login.token, e: login.expires || 0, c: claimedAt || "" })); } catch {}\n  }\n  $("#p-version").textContent = window.__ver || "unknown";\n  $("#p-claimed").textContent = claimedAt ? new Date(claimedAt).toLocaleString() : "just now";\n  $("#p-roles").textContent = "admin";\n  $("#p-expires").textContent = login && login.expires ? new Date(login.expires).toLocaleString() : "";\n  show("#s-panel");\n}\n\n/* ---- the record, read-only through the signed-in session ---- */\nconst rec = async (op, params={})=>{\n  const q = new URLSearchParams({ op, token: SESSION, ...params });\n  const r = await fetch("/api/?"+q.toString());\n  if (r.status === 401) { SESSION = null; try{sessionStorage.removeItem("bio-session");}catch{}; show("#s-login"); throw new Error("signed out"); }\n  return r.json();\n};\nconst escH = (x)=>String(x??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");\nconst TYPES = [["information","Information"],["problem","Problems"],["project","Projects"],["action","Actions"]];\nconst fmtWhen = (iso)=>{ const d=new Date(iso); return isNaN(d)?escH(iso):d.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"}); };\nconst chip = (st)=>\'<span class="chip \'+escH(st)+\'">\'+escH(st)+"</span>";\n\nasync function openBrowse(){\n  show("#s-browse");\n  let list;\n  try { list = (await rec("list")).result || []; } catch { return; }\n  const by = {};\n  for (const b of list) (by[b.object_type] ||= []).push(b);\n  $("#browse-summary").textContent = list.length + " bundles. Everything below is read-only; the record can only be changed through the gated tools.";\n  let html = "";\n  for (const [t, label] of TYPES){\n    const rows = by[t] || []; delete by[t];\n    if (!rows.length) continue;\n    html += "<h2>"+label+" ("+rows.length+")</h2><table class=\\\\"rec\\\\"><tr><th>Bundle</th><th>State</th><th>Updated</th></tr>";\n    for (const b of rows)\n      html += \'<tr class="row" data-id="\'+escH(b.bundle_id)+\'"><td><span class="bid">\'+escH(b.bundle_id)+\'</span><br><span class="dim">\'+escH(b.title||"")+"</span></td><td>"+chip(b.current_state)+"</td><td class=\\\\"dim\\\\">"+fmtWhen(b.last_updated)+"</td></tr>";\n    html += "</table>";\n  }\n  for (const t of Object.keys(by)){\n    html += "<h2>"+escH(t)+" ("+by[t].length+")</h2><table class=\\\\"rec\\\\">";\n    for (const b of by[t]) html += \'<tr class="row" data-id="\'+escH(b.bundle_id)+\'"><td><span class="bid">\'+escH(b.bundle_id)+"</span></td><td>"+chip(b.current_state)+"</td><td class=\\\\"dim\\\\">"+fmtWhen(b.last_updated)+"</td></tr>";\n    html += "</table>";\n  }\n  $("#browse-body").innerHTML = html || "<p>The record is empty.</p>";\n  document.querySelectorAll("#browse-body tr.row").forEach(r=>r.addEventListener("click",()=>openBundle(r.dataset.id)));\n}\n\n/* Frontmatter split and a small, honest markdown rendering: headings, bold,\n   lists, code spans, paragraphs. Anything else stays visible as written. */\nfunction splitFm(text){\n  const m = /^---\\\\n([\\\\s\\\\S]*?)\\\\n---\\\\n?/.exec(text);\n  if (!m) return { fm:{}, body:text };\n  const fm = {};\n  for (const line of m[1].split("\\\\n")){\n    const kv = /^([A-Za-z_][A-Za-z0-9_]*):\\\\s*(.*)$/.exec(line);\n    if (kv) fm[kv[1]] = kv[2].replace(/^"|"$/g,"");\n  }\n  return { fm, body:text.slice(m[0].length) };\n}\nfunction mdRender(md){\n  const lines = md.split("\\\\n");\n  let out = "", inList = false, para = [];\n  const flush = ()=>{ if (para.length){ out += "<p>"+inline(para.join(" "))+"</p>"; para=[]; } };\n  const endList = ()=>{ if (inList){ out += "</ul>"; inList=false; } };\n  const inline = (t)=>escH(t).replace(/\\\\*\\\\*([^*]+)\\\\*\\\\*/g,"<b>$1</b>").replace(/\\`([^\\`]+)\\`/g,"<code>$1</code>");\n  for (const raw of lines){\n    const l = raw.replace(/\\\\s+$/,"");\n    if (/^###\\\\s+/.test(l)){ flush(); endList(); out += "<h3>"+inline(l.replace(/^###\\\\s+/,""))+"</h3>"; }\n    else if (/^##\\\\s+/.test(l)){ flush(); endList(); out += "<h2>"+inline(l.replace(/^##\\\\s+/,""))+"</h2>"; }\n    else if (/^[-*]\\\\s+/.test(l)){ flush(); if(!inList){ out += "<ul>"; inList=true; } out += "<li>"+inline(l.replace(/^[-*]\\\\s+/,""))+"</li>"; }\n    else if (l === ""){ flush(); endList(); }\n    else para.push(l);\n  }\n  flush(); endList();\n  return out;\n}\n\nlet CURRENT = { id:null, img:null };\nasync function openBundle(id){\n  show("#s-bundle");\n  $("#crumb-id").textContent = id;\n  $("#b-title").textContent = id;\n  $("#b-facts").innerHTML = ""; $("#b-md").innerHTML = "<p class=\\\\"small\\\\">Loading&hellip;</p>";\n  $("#b-files").innerHTML = ""; $("#b-history").innerHTML = "";\n  let img;\n  try { img = (await rec("image", { id })).result; } catch { return; }\n  if (!img){ $("#b-md").innerHTML = "<p>This bundle was not found.</p>"; return; }\n  CURRENT = { id, img };\n  renderBundle(id, img, null);\n}\nfunction renderBundle(id, img, revisionKey){\n  const liveText = typeof img["bundle.md"] === "string" ? img["bundle.md"] : "";\n  const revText = revisionKey && typeof img["_history/"+revisionKey+"/bundle.md"] === "string"\n    ? img["_history/"+revisionKey+"/bundle.md"] : null;\n  const { fm, body } = splitFm(revText ?? liveText);\n  $("#b-title").textContent = fm.title || id;\n  const facts = [["State", fm.current_state ? chip(fm.current_state) : ""],\n    ["Last updated", fm.last_updated ? fmtWhen(fm.last_updated) : ""],\n    ["Created", fm.created ? fmtWhen(fm.created) : ""],\n    ["Criticality", escH(fm.criticality||"")],["Classification", escH(fm.classification||"")]]\n    .filter(([,v])=>v);\n  $("#b-facts").innerHTML = facts.map(([k,v])=>\'<div class="kv"><span class="k">\'+k+\'</span><span class="v">\'+v+"</span></div>").join("");\n  $("#b-md").innerHTML =\n    (revText !== null ? \'<div class="revnote">Viewing a historical revision (\'+escH(revisionKey)+\'). <button class="histbtn" id="back-live">Back to the live record</button></div>\' : "")\n    + mdRender(body);\n  const bl = $("#back-live"); if (bl) bl.addEventListener("click",()=>renderBundle(id, img, null));\n\n  const files = Object.keys(img).filter(k=>!k.startsWith("_history/")).sort();\n  $("#b-files").innerHTML = files.map(k=>{\n    const v = img[k];\n    if (typeof v === "string")\n      return \'<div class="kv"><span class="k">\'+escH(k)+\'</span><span class="v dim">\'+v.length.toLocaleString()+" chars</span></div>";\n    const dl = k.split("/").pop();\n    return \'<div class="kv"><span class="k">\'+escH(k)+\'</span><span class="v"><a class="filelink" href="/api/?op=capture&sha256=\'+escH(v.blobSha||v.sha256)+"&token="+encodeURIComponent(SESSION)+"&dl="+encodeURIComponent(dl)+\'">download</a> <span class="dim mono">\'+escH((v.sha256||v.blobSha||"").slice(0,12))+"&hellip;</span></span></div>";\n  }).join("") || "<p class=\\\\"small\\\\" style=\\\\"margin:0\\\\">No files.</p>";\n\n  let entries = [];\n  try { entries = JSON.parse(img["_history/manifest.json"]||"{}").entries || []; } catch {}\n  entries = entries.slice().sort((a,b)=>String(a.key).localeCompare(String(b.key)));\n  $("#b-history").innerHTML = entries.map(e=>{\n    const viewable = typeof img["_history/"+e.key+"/bundle.md"] === "string";\n    return \'<div class="kv"><span class="k mono">\'+escH(e.key)+\'</span><span class="v">\'\n      + escH(e.kind||"") + " by " + escH(e.author||"unknown") + \' <span class="dim">\' + fmtWhen(e.created) + "</span> "\n      + (viewable ? \'<button class="histbtn" data-rev="\'+escH(e.key)+\'">view</button>\' : "")\n      + "</span></div>";\n  }).join("") || "<p class=\\\\"small\\\\" style=\\\\"margin:0\\\\">Created in a single revision; nothing has been superseded.</p>";\n  document.querySelectorAll("#b-history .histbtn[data-rev]").forEach(x=>x.addEventListener("click",()=>renderBundle(id, img, x.dataset.rev)));\n  document.querySelector("main").classList.add("wide");\n}\n$("#go-browse").addEventListener("click", openBrowse);\n$("#crumb-panel").addEventListener("click", ()=>{document.querySelector("main").classList.remove("wide");show("#s-panel");});\n$("#crumb-panel2").addEventListener("click", ()=>{document.querySelector("main").classList.remove("wide");show("#s-panel");});\n$("#crumb-browse").addEventListener("click", openBrowse);\nstate();\n</script>\n</body>\n</html>`;\n\n// src/store.mjs\nimport { DurableObject } from "cloudflare:workers";\nvar INLINE_MAX = 1024 * 1024;\nvar Store = class _Store extends DurableObject {\n  constructor(ctx, env) {\n    super(ctx, env);\n    this.ctx = ctx;\n    this.env = env;\n    this.sql = ctx.storage.sql;\n    ctx.blockConcurrencyWhile(async () => this.#migrate());\n  }\n  #migrate() {\n    const bare = (this.env.SCHEMA || SCHEMA || "").split("\\n").filter((l) => !l.trim().startsWith("--")).join("\\n");\n    for (const s of bare.split(";")) {\n      const t = s.trim();\n      if (t) this.sql.exec(t);\n    }\n  }\n  #rows(q, ...a) {\n    return [...this.sql.exec(q, ...a)];\n  }\n  #one(q, ...a) {\n    const r = this.#rows(q, ...a);\n    return r.length ? r[0] : null;\n  }\n  /* ---- reads: what storeReadAdapter_ did, without the re-resolution tax ---- */\n  readFile(bundleId, path) {\n    const r = this.#one(`SELECT content, blob_sha, bytes, sha256 FROM files WHERE bundle_id=? AND path=?`, bundleId, path);\n    if (!r) return null;\n    return r.content !== null ? { text: r.content, sha256: r.sha256 } : { blobSha: r.blob_sha, bytes: r.bytes, sha256: r.sha256 };\n  }\n  /** The byte-complete image the gate consumes. One bundle, one call, no\n   *  per-file resolution. This is the operation that cost ~43s on Drive. */\n  readImage(bundleId) {\n    const img = {};\n    for (const r of this.sql.exec(`SELECT path, content, blob_sha, sha256 FROM files WHERE bundle_id=?`, bundleId))\n      img[r.path] = r.content !== null ? r.content : { blobSha: r.blob_sha, sha256: r.sha256 };\n    for (const r of this.sql.exec(`SELECT snap_key, path, content, blob_sha, sha256 FROM history WHERE bundle_id=?`, bundleId))\n      img[`_history/${r.snap_key}/${r.path}`] = r.content !== null ? r.content : { blobSha: r.blob_sha, sha256: r.sha256 };\n    for (const r of this.sql.exec(`SELECT snap_key, kind, base, author, created, files_json FROM manifest WHERE bundle_id=?`, bundleId)) {\n      const key = "_history/manifest.json";\n      const m = img[key] ? JSON.parse(img[key]) : { entries: [] };\n      m.entries.push({ key: r.snap_key, kind: r.kind, base: r.base, author: r.author, created: r.created, files: JSON.parse(r.files_json) });\n      img[key] = JSON.stringify(m, null, 2);\n    }\n    return Object.keys(img).length ? img : null;\n  }\n  listBundles(filter = {}) {\n    let q = `SELECT bundle_id, object_type, current_state, title, last_updated, bundle_sha FROM bundles`;\n    const w = [], a = [];\n    if (filter.type) {\n      w.push(`object_type=?`);\n      a.push(filter.type);\n    }\n    if (filter.state) {\n      w.push(`current_state=?`);\n      a.push(filter.state);\n    }\n    if (w.length) q += ` WHERE ` + w.join(" AND ");\n    return this.#rows(q + ` ORDER BY bundle_id`, ...a);\n  }\n  /** The index projection. One stored artifact on Drive, one query here.\n   *  Note the absence of `locator`: there is no substrate path to leak. */\n  buildIndex() {\n    return {\n      generated: (/* @__PURE__ */ new Date()).toISOString(),\n      version: 2,\n      bundles: this.#rows(\n        `SELECT bundle_id AS id, object_type, current_state, title, last_updated, bundle_sha AS sha256 FROM bundles ORDER BY bundle_id`\n      )\n    };\n  }\n  /** C-6.2: every reference whose target does not exist. A join, not a scan. */\n  danglingRefs() {\n    return this.#rows(\n      `SELECT r.bundle_id, r.target_id FROM refs r\n       LEFT JOIN bundles b ON b.bundle_id=r.target_id WHERE b.bundle_id IS NULL`\n    );\n  }\n  /** Streaming whole-store pass. Peak memory is one image, measured at 37KB,\n   *  against 558MB if every image is materialised at once. */\n  *eachImage() {\n    for (const r of this.#rows(`SELECT bundle_id FROM bundles ORDER BY bundle_id`))\n      yield [r.bundle_id, this.readImage(r.bundle_id)];\n  }\n  /* ---- writes: promotion is the sole writer of live state ---- */\n  /**\n   * One transaction. Either the whole bundle advances or nothing does.\n   *\n   * base is the CAS. It must equal the current bundle_sha, or null when\n   * creating. A stale base is refused, which is the lost-update floor that\n   * manifest base-sha CAS provided on Drive.\n   */\n  promote(pkg) {\n    if (!pkg || typeof pkg !== "object") return { ok: false, reason: "NO_BODY", detail: "promote requires a POSTed package" };\n    const { bundleId, base, files, meta, snapKey, author, refs = [], register = [] } = pkg;\n    if (!bundleId || !Array.isArray(files) || !meta) return { ok: false, reason: "MALFORMED", detail: "bundleId, files and meta are required" };\n    return this.ctx.storage.transactionSync(() => {\n      const cur = this.#one(`SELECT bundle_sha, row_version FROM bundles WHERE bundle_id=?`, bundleId);\n      if (cur && base === null)\n        return { ok: false, reason: "EXISTS", detail: "creation attempted against an existing bundle" };\n      if (!cur && base !== null)\n        return { ok: false, reason: "ABSENT", detail: "update attempted against a bundle that does not exist" };\n      if (cur && cur.bundle_sha !== base)\n        return { ok: false, reason: "CAS_STALE", expected: cur.bundle_sha, got: base };\n      for (const f of files) {\n        if (f.text !== void 0 && f.text.length > INLINE_MAX)\n          return { ok: false, reason: "OVERSIZE_INLINE", path: f.path, bytes: f.text.length };\n      }\n      if (cur) {\n        for (const r of this.sql.exec(`SELECT path, content, blob_sha, sha256 FROM files WHERE bundle_id=?`, bundleId))\n          this.sql.exec(\n            `INSERT OR REPLACE INTO history (bundle_id,snap_key,path,content,blob_sha,sha256,created) VALUES (?,?,?,?,?,?,?)`,\n            bundleId,\n            snapKey,\n            r.path,\n            r.content,\n            r.blob_sha,\n            r.sha256,\n            (/* @__PURE__ */ new Date()).toISOString()\n          );\n        this.sql.exec(\n          `INSERT OR REPLACE INTO manifest (bundle_id,snap_key,kind,base,author,created,files_json) VALUES (?,?,?,?,?,?,?)`,\n          bundleId,\n          snapKey,\n          base === null ? "creation" : "direct_write",\n          base,\n          author,\n          (/* @__PURE__ */ new Date()).toISOString(),\n          JSON.stringify(files.map((f) => f.path))\n        );\n      }\n      this.sql.exec(`DELETE FROM files WHERE bundle_id=?`, bundleId);\n      for (const f of files)\n        this.sql.exec(\n          `INSERT INTO files (bundle_id,path,content,blob_sha,bytes,sha256) VALUES (?,?,?,?,?,?)`,\n          bundleId,\n          f.path,\n          f.text ?? null,\n          f.blobSha ?? null,\n          f.bytes,\n          f.sha256\n        );\n      const newSha = files.find((f) => f.path === "bundle.md")?.sha256;\n      if (!newSha) return { ok: false, reason: "NO_BUNDLE_MD" };\n      this.sql.exec(\n        `INSERT INTO bundles (bundle_id,object_type,group_id,title,current_state,prior_state,created,last_updated,criticality,classification,bundle_sha,row_version)\n         VALUES (?,?,?,?,?,?,?,?,?,?,?,COALESCE((SELECT row_version+1 FROM bundles WHERE bundle_id=?),1))\n         ON CONFLICT(bundle_id) DO UPDATE SET\n           object_type=excluded.object_type, title=excluded.title,\n           current_state=excluded.current_state, prior_state=excluded.prior_state,\n           last_updated=excluded.last_updated, criticality=excluded.criticality,\n           classification=excluded.classification, bundle_sha=excluded.bundle_sha,\n           row_version=bundles.row_version+1`,\n        bundleId,\n        meta.object_type,\n        meta.group,\n        meta.title,\n        meta.current_state,\n        meta.prior_state ?? null,\n        meta.created,\n        meta.last_updated,\n        meta.criticality ?? null,\n        meta.classification ?? null,\n        newSha,\n        bundleId\n      );\n      this.sql.exec(`DELETE FROM refs WHERE bundle_id=?`, bundleId);\n      for (const t of refs)\n        this.sql.exec(`INSERT OR REPLACE INTO refs (bundle_id,target_id,kind) VALUES (?,?,?)`, bundleId, t.target, t.kind ?? "");\n      for (const c of register)\n        this.sql.exec(\n          `INSERT OR REPLACE INTO register (capture_sha,bundle_id,path,encoding,bytes,registered) VALUES (?,?,?,?,?,?)`,\n          c.sha256,\n          bundleId,\n          c.path,\n          c.encoding ?? "utf8",\n          c.bytes,\n          (/* @__PURE__ */ new Date()).toISOString()\n        );\n      const after = this.#one(`SELECT bundle_sha, row_version FROM bundles WHERE bundle_id=?`, bundleId);\n      return { ok: true, bundleId, bundleSha: after.bundle_sha, rowVersion: after.row_version };\n    });\n  }\n  /* ---- coordination: what LockService and the nextSeq race did ---- */\n  allocId(prefix, year) {\n    return this.ctx.storage.transactionSync(() => {\n      const scope = `${prefix}-${year}`;\n      const cur = this.#one(`SELECT next FROM seq WHERE scope=?`, scope);\n      const n = cur ? cur.next : 1;\n      this.sql.exec(`INSERT INTO seq (scope,next) VALUES (?,?) ON CONFLICT(scope) DO UPDATE SET next=?`, scope, n + 1, n + 1);\n      return { id: `${prefix}-${year}-${String(n).padStart(4, "0")}` };\n    });\n  }\n  acquireLease(bundleId, actor, ttlMs) {\n    return this.ctx.storage.transactionSync(() => {\n      const now = Date.now();\n      const cur = this.#one(`SELECT actor, expires, base_sha FROM leases WHERE bundle_id=?`, bundleId);\n      if (cur && cur.actor !== actor && Date.parse(cur.expires) > now)\n        return { ok: false, heldBy: cur.actor, until: cur.expires };\n      const b = this.#one(`SELECT bundle_sha FROM bundles WHERE bundle_id=?`, bundleId);\n      const expires = new Date(now + ttlMs).toISOString();\n      this.sql.exec(\n        `INSERT INTO leases (bundle_id,actor,acquired,expires,base_sha) VALUES (?,?,?,?,?)\n         ON CONFLICT(bundle_id) DO UPDATE SET actor=excluded.actor, acquired=excluded.acquired, expires=excluded.expires, base_sha=excluded.base_sha`,\n        bundleId,\n        actor,\n        new Date(now).toISOString(),\n        expires,\n        b ? b.bundle_sha : ""\n      );\n      return { ok: true, actor, expires, base: b ? b.bundle_sha : null };\n    });\n  }\n  stats() {\n    const n = (t) => this.#one(`SELECT count(*) c FROM ${t}`).c;\n    return {\n      bundles: n("bundles"),\n      files: n("files"),\n      history: n("history"),\n      refs: n("refs"),\n      register: n("register"),\n      dbBytes: this.ctx.storage.sql.databaseSize\n    };\n  }\n  /* Eviction. The store is append-only by doctrine, so removal is deliberate,\n       never implicit, and admin-only at the control plane. Two modes: one bundle\n       with its whole lineage, or everything.\n  \n       seq is deliberately NOT reset. allocid must never reissue an identifier\n       that has already existed, so a purged store keeps counting from where it\n       stopped. A purge that reset the counter would make identifiers ambiguous\n       across the purge boundary, which is worse than a gap.\n  \n       R2 is untouched. Registered captures are immutable and content-addressed,\n       so orphaning them costs storage but cannot corrupt anything. Reclaiming\n       them is a separate sweep against the register, not part of this. */\n  purge({ bundleId = null } = {}) {\n    const TABLES = ["files", "history", "manifest", "refs", "register", "leases"];\n    const before = this.stats();\n    this.ctx.storage.transactionSync(() => {\n      if (bundleId) {\n        for (const t of TABLES) this.sql.exec(`DELETE FROM ${t} WHERE bundle_id=?`, bundleId);\n        this.sql.exec(`DELETE FROM bundles WHERE bundle_id=?`, bundleId);\n      } else {\n        for (const t of TABLES) this.sql.exec(`DELETE FROM ${t}`);\n        this.sql.exec(`DELETE FROM bundles`);\n      }\n    });\n    const after = this.stats();\n    const d = (k) => before[k] - after[k];\n    return {\n      ok: true,\n      scope: bundleId || "ALL",\n      before,\n      after,\n      removed: {\n        bundles: d("bundles"),\n        files: d("files"),\n        history: d("history"),\n        refs: d("refs"),\n        register: d("register")\n      }\n    };\n  }\n  /* ---- credentials ----\n  \n       A Worker cannot rewrite its own secret, so ADMIN_TOKEN is a bootstrap\n       credential rather than the credential. It is spent once, exchanging itself\n       for an operator-chosen password whose hash lives here. Recovery is to\n       overwrite ADMIN_TOKEN in the dashboard, which clears the consumed marker\n       and returns the instance to unclaimed. That makes the group\'s Cloudflare\n       login the root of trust, which is the only thing they reliably still have\n       when a password is lost. */\n  static #enc = new TextEncoder();\n  static async #derive(password, salt, iterations) {\n    const key = await crypto.subtle.importKey(\n      "raw",\n      _Store.#enc.encode(password),\n      "PBKDF2",\n      false,\n      ["deriveBits"]\n    );\n    const bits = await crypto.subtle.deriveBits(\n      { name: "PBKDF2", hash: "SHA-256", salt: _Store.#enc.encode(salt), iterations },\n      key,\n      256\n    );\n    return [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, "0")).join("");\n  }\n  static #rand(n = 32) {\n    return [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b.toString(16).padStart(2, "0")).join("");\n  }\n  bootstrapState(tokenFp = null) {\n    const b = this.#one(`SELECT consumed_at, token_fp FROM bootstrap WHERE id=1`);\n    const roles = this.#rows(`SELECT role, updated FROM credentials`);\n    const spent = !!(b && b.consumed_at);\n    const rearmed = spent && tokenFp !== null && b.token_fp !== tokenFp;\n    return {\n      claimed: spent && !rearmed,\n      rearmed,\n      consumedAt: rearmed ? null : b?.consumed_at || null,\n      roles\n    };\n  }\n  /* Spending the bootstrap credential. Refuses if already spent, so a leaked\n     ADMIN_TOKEN cannot silently re-claim a running instance. */\n  async claim({ role = "admin", password, tokenFp = null } = {}) {\n    if (typeof password !== "string" || password.length < 12)\n      return { ok: false, reason: "PASSWORD_TOO_SHORT", minimum: 12 };\n    const st = this.bootstrapState(tokenFp);\n    if (st.claimed)\n      return { ok: false, reason: "ALREADY_CLAIMED", consumedAt: st.consumedAt };\n    await this.setPassword({ role, password });\n    const now = (/* @__PURE__ */ new Date()).toISOString();\n    this.sql.exec(`INSERT INTO bootstrap (id, consumed_at, token_fp) VALUES (1, ?, ?)\n                   ON CONFLICT(id) DO UPDATE SET consumed_at=excluded.consumed_at,\n                     token_fp=excluded.token_fp`, now, tokenFp);\n    return { ok: true, role, consumedAt: now };\n  }\n  async setPassword({ role, password, iterations = 1e5 }) {\n    const salt = _Store.#rand(16);\n    const hash = await _Store.#derive(password, salt, iterations);\n    this.sql.exec(\n      `INSERT INTO credentials (role, salt, hash, iterations, updated) VALUES (?,?,?,?,?)\n       ON CONFLICT(role) DO UPDATE SET salt=excluded.salt, hash=excluded.hash,\n         iterations=excluded.iterations, updated=excluded.updated`,\n      role,\n      salt,\n      hash,\n      iterations,\n      (/* @__PURE__ */ new Date()).toISOString()\n    );\n    return { ok: true, role };\n  }\n  /* Exchanges a password for a bearer token so the password does not travel on\n     every later request. Constant-time comparison is not meaningful over a\n     network round trip at this granularity, but the derived-hash compare avoids\n     ever holding the password beyond this call. */\n  async login({ role = "admin", password, ttlSeconds = 43200 } = {}) {\n    const c = this.#one(`SELECT salt, hash, iterations FROM credentials WHERE role=?`, role);\n    if (!c) return { ok: false, reason: "NO_SUCH_ROLE" };\n    const got = await _Store.#derive(String(password ?? ""), c.salt, c.iterations);\n    if (got !== c.hash) return { ok: false, reason: "BAD_PASSWORD" };\n    const token = _Store.#rand(32);\n    const expires = Date.now() + ttlSeconds * 1e3;\n    this.sql.exec(`DELETE FROM sessions WHERE expires < ?`, Date.now());\n    this.sql.exec(\n      `INSERT INTO sessions (token, role, expires, created) VALUES (?,?,?,?)`,\n      token,\n      role,\n      expires,\n      (/* @__PURE__ */ new Date()).toISOString()\n    );\n    return { ok: true, role, token, expires };\n  }\n  session(token) {\n    if (!token) return null;\n    const s = this.#one(`SELECT role, expires FROM sessions WHERE token=?`, token);\n    if (!s) return null;\n    if (s.expires < Date.now()) {\n      this.sql.exec(`DELETE FROM sessions WHERE token=?`, token);\n      return null;\n    }\n    return { role: s.role, expires: s.expires };\n  }\n  async fetch(req) {\n    const url = new URL(req.url);\n    const op = url.pathname.slice(1);\n    const body = req.method === "POST" ? await req.json() : null;\n    const t = Date.now();\n    try {\n      const map = {\n        promote: () => this.promote(body),\n        allocid: () => this.allocId(url.searchParams.get("prefix"), url.searchParams.get("year")),\n        lease: () => this.acquireLease(url.searchParams.get("id"), url.searchParams.get("actor"), 3e5),\n        image: () => this.readImage(url.searchParams.get("id")),\n        file: () => this.readFile(url.searchParams.get("id"), url.searchParams.get("path")),\n        list: () => this.listBundles({ type: url.searchParams.get("type"), state: url.searchParams.get("state") }),\n        index: () => this.buildIndex(),\n        dangling: () => ({ dangling: this.danglingRefs() }),\n        stats: () => this.stats(),\n        bootstrap: () => this.bootstrapState(url.searchParams.get("fp")),\n        claim: () => this.claim({ ...body || {}, tokenFp: url.searchParams.get("fp") }),\n        login: () => this.login(body || {}),\n        setpassword: () => this.setPassword(body || {}),\n        session: () => ({ session: this.session(url.searchParams.get("t")) }),\n        purge: () => this.purge({ bundleId: url.searchParams.get("bundleId") })\n      };\n      if (!map[op]) return Response.json({ ok: false, error: "unknown op: " + op }, { status: 400 });\n      return Response.json({ ok: true, ms: Date.now() - t, result: await map[op]() });\n    } catch (e) {\n      return Response.json({ ok: false, error: String(e && e.stack || e) }, { status: 500 });\n    }\n  }\n};\n\n// src/index.mjs\nvar OPS = {\n  //  op          class allowed              mutating\n  selftest: { classes: ["admin", "member", "probe", "public"], mutating: false },\n  livefire: { classes: ["admin", "probe"], mutating: true },\n  index: { classes: ["admin", "member", "probe", "public"], mutating: false },\n  list: { classes: ["admin", "member", "probe"], mutating: false },\n  image: { classes: ["admin", "member", "probe"], mutating: false },\n  file: { classes: ["admin", "member", "probe"], mutating: false },\n  dangling: { classes: ["admin", "member", "probe"], mutating: false },\n  stats: { classes: ["admin", "member", "probe"], mutating: false },\n  promote: { classes: ["admin", "member", "probe"], mutating: true },\n  allocid: { classes: ["admin", "member", "probe"], mutating: true },\n  lease: { classes: ["admin", "member", "probe"], mutating: true },\n  purge: { classes: ["admin", "probe"], mutating: true },\n  capture: { classes: ["admin", "member", "probe"], mutating: true },\n  /* The bootstrap trio is the only unauthenticated surface. Each enforces its\n     own gate: bootstrap reveals nothing but claimed/unclaimed, claim requires\n     the bootstrap secret and refuses once spent, login requires the password. */\n  bootstrap: { classes: null, mutating: false },\n  claim: { classes: null, mutating: true },\n  login: { classes: null, mutating: false }\n};\nvar SCRATCH = "scratch";\nasync function fingerprint(v) {\n  if (!v) return null;\n  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v));\n  return [...new Uint8Array(b)].slice(0, 8).map((x) => x.toString(16).padStart(2, "0")).join("");\n}\nasync function classify(token, env) {\n  if (!token) return null;\n  if (token === env.ADMIN_TOKEN && await liveToken(env.ADMIN_TOKEN)) return "admin";\n  if (token === env.MEMBER_TOKEN && await liveToken(env.MEMBER_TOKEN)) return "member";\n  if (token === env.PROBE_TOKEN && await liveToken(env.PROBE_TOKEN)) return "probe";\n  if (token === env.PUBLIC_TOKEN && await liveToken(env.PUBLIC_TOKEN)) return "public";\n  return null;\n}\nfunction scopeFor(cls, url) {\n  const asked = url.searchParams.get("store");\n  if (cls === "probe") return asked && asked !== SCRATCH ? { error: `probe class is confined to the ${SCRATCH} namespace, refused request for ${JSON.stringify(asked)}` } : { name: SCRATCH };\n  return { name: asked === SCRATCH ? SCRATCH : "bio" };\n}\nvar json = (o, status = 200) => new Response(JSON.stringify(o, null, 1), {\n  status,\n  headers: { "content-type": "application/json", "access-control-allow-origin": "*" }\n});\nvar index_default = {\n  async fetch(req, env) {\n    const url = new URL(req.url);\n    if (req.method === "OPTIONS")\n      return new Response(null, { status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-methods": "GET, POST, OPTIONS", "access-control-allow-headers": "content-type" } });\n    if (req.method === "GET" && !url.pathname.startsWith("/api") && (url.pathname === "/" || url.pathname === "") && !url.searchParams.get("op"))\n      return new Response(SETUP_HTML, { headers: { "content-type": "text/html; charset=utf-8" } });\n    const path = url.pathname.replace(/^\\/api\\/?/, "/");\n    const op = url.searchParams.get("op") || path.slice(1) || "selftest";\n    const spec = OPS[op];\n    if (!spec) return json({ ok: false, error: "unknown op", op }, 400);\n    if (spec.classes === null) {\n      const fp = await fingerprint(env.ADMIN_TOKEN);\n      const stub2 = env.STORE.get(env.STORE.idFromName("bio"));\n      if (op === "claim") {\n        const body2 = await req.json().catch(() => ({}));\n        if (!env.ADMIN_TOKEN) return json({ ok: false, error: "instance has no bootstrap credential set" }, 409);\n        if (!await liveToken(env.ADMIN_TOKEN))\n          return json({ ok: false, error: "bootstrap credential is a published repository value and can never arm a claim; set a fresh ADMIN_TOKEN in the Cloudflare dashboard" }, 409);\n        if (body2.bootstrapToken !== env.ADMIN_TOKEN)\n          return json({ ok: false, error: "bootstrap credential does not match" }, 403);\n        const r2 = await stub2.fetch(new Request(`http://do/claim?fp=${fp}`, {\n          method: "POST",\n          body: JSON.stringify({ role: "admin", password: body2.password })\n        }));\n        return json(await r2.json(), 200);\n      }\n      if (op === "login") {\n        const body2 = await req.json().catch(() => ({}));\n        const r2 = await stub2.fetch(new Request("http://do/login", {\n          method: "POST",\n          body: JSON.stringify({ role: body2.role || "admin", password: body2.password })\n        }));\n        return json(await r2.json(), 200);\n      }\n      const r = await stub2.fetch(new Request(`http://do/bootstrap?fp=${fp}`));\n      const out = await r.json();\n      return json({\n        ok: true,\n        service: "bio-plane",\n        version: env.VERSION || "0.0.0",\n        bootstrapConfigured: await liveToken(env.ADMIN_TOKEN),\n        ...out.result\n      }, 200);\n    }\n    let cls = await classify(url.searchParams.get("token"), env);\n    let viaSession = false;\n    if (!cls) {\n      const t = url.searchParams.get("token");\n      if (t && /^[0-9a-f]{64}$/.test(t)) {\n        const st = env.STORE.get(env.STORE.idFromName("bio"));\n        const r = await (await st.fetch(`http://do/session?t=${t}`)).json();\n        const sess = r?.result?.session;\n        if (sess) {\n          if (spec.mutating && !(op === "capture" && req.method === "GET"))\n            return json({ ok: false, error: "a signed-in session can read the record but never write it; writes require a machine credential", op }, 403);\n          cls = sess.role === "admin" ? "admin" : "member";\n          viaSession = true;\n        }\n      }\n    }\n    if (!cls) return json({ ok: false, error: "unauthenticated" }, 401);\n    if (!spec.classes.includes(cls)) return json({ ok: false, error: "forbidden for token class", op, cls }, 403);\n    const scope = scopeFor(cls, url);\n    if (scope.error) return json({ ok: false, error: scope.error, tokenClass: cls }, 403);\n    const storeName = scope.name;\n    if (op === "selftest") {\n      const r2Configured = typeof env.CAPTURES?.get === "function" && typeof env.PUBLISHED?.get === "function";\n      const out = {\n        ok: true,\n        service: "bio-plane",\n        version: env.VERSION || "0.0.0",\n        time: (/* @__PURE__ */ new Date()).toISOString(),\n        tokenClass: cls,\n        bindings: {\n          STORE: typeof env.STORE?.idFromName === "function",\n          CAPTURES: typeof env.CAPTURES?.get === "function" ? true : "not configured",\n          PUBLISHED: typeof env.PUBLISHED?.get === "function" ? true : "not configured",\n          ADMIN_TOKEN: await liveToken(env.ADMIN_TOKEN),\n          MEMBER_TOKEN: await liveToken(env.MEMBER_TOKEN),\n          PROBE_TOKEN: await liveToken(env.PROBE_TOKEN)\n        },\n        r2Configured,\n        schemaChars: SCHEMA.length\n      };\n      if (typeof env.CAPTURES?.get === "function" !== (typeof env.PUBLISHED?.get === "function")) {\n        out.ok = false;\n        out.r2 = "MISCONFIGURED: one bucket bound without the other; the fence requires both or neither";\n      }\n      try {\n        const r = await env.STORE.get(env.STORE.idFromName(storeName)).fetch("http://x/stats");\n        out.store = (await r.json()).result;\n      } catch (e) {\n        out.ok = false;\n        out.store = "ERR " + String(e && e.message || e);\n      }\n      if (r2Configured) {\n        try {\n          const key = `${SCRATCH}/selftest-${Date.now()}`;\n          await env.CAPTURES.put(key, "ok");\n          const back = await env.CAPTURES.get(key);\n          out.captures = await back.text() === "ok" ? "read-write ok" : "MISMATCH";\n          await env.CAPTURES.delete(key);\n        } catch (e) {\n          out.ok = false;\n          out.captures = "ERR " + String(e && e.message || e);\n        }\n      } else {\n        out.captures = "not configured";\n      }\n      out.bindingsAllPresent = out.bindings.STORE === true && out.bindings.ADMIN_TOKEN === true && out.bindings.MEMBER_TOKEN === true && out.bindings.PROBE_TOKEN === true;\n      if (!out.bindingsAllPresent) out.ok = false;\n      return json(out, out.ok ? 200 : 500);\n    }\n    if (op === "purge") {\n      const confirm = url.searchParams.get("confirm");\n      if (confirm !== storeName)\n        return json({\n          ok: false,\n          error: "purge requires confirm=<store>",\n          expected: storeName,\n          got: confirm,\n          tokenClass: cls,\n          store: storeName\n        }, 400);\n    }\n    if (op === "livefire") {\n      const out = await livefire(env, storeName);\n      return json(out, out.ok ? 200 : 500);\n    }\n    if (op === "capture") {\n      if (typeof env.CAPTURES?.get !== "function")\n        return json({ ok: false, error: "R2 is not configured on this instance" }, 503);\n      const sha = (url.searchParams.get("sha256") || "").toLowerCase();\n      if (!/^[0-9a-f]{64}$/.test(sha))\n        return json({ ok: false, error: "capture requires sha256=<64 lowercase hex>" }, 400);\n      const key = `${storeName}/captures/${sha}`;\n      if (req.method === "PUT" || req.method === "POST") {\n        const body2 = new Uint8Array(await req.arrayBuffer());\n        const digest = [...new Uint8Array(await crypto.subtle.digest("SHA-256", body2))].map((x) => x.toString(16).padStart(2, "0")).join("");\n        if (digest !== sha)\n          return json({\n            ok: false,\n            reason: "INTEGRITY",\n            detail: "body hash does not match the sha256 parameter",\n            expected: sha,\n            got: digest,\n            store: storeName,\n            tokenClass: cls\n          }, 400);\n        const existing = await env.CAPTURES.head(key);\n        if (existing)\n          return json({ ok: true, sha256: sha, bytes: existing.size, existed: true, store: storeName, tokenClass: cls });\n        await env.CAPTURES.put(key, body2, { sha256: await crypto.subtle.digest("SHA-256", body2) });\n        return json({ ok: true, sha256: sha, bytes: body2.length, existed: false, store: storeName, tokenClass: cls });\n      }\n      const wantRange = req.headers.get("range");\n      const obj = await env.CAPTURES.get(key, wantRange ? { range: req.headers } : void 0);\n      const dl = (url.searchParams.get("dl") || "").replace(/[^\\w.\\- ]/g, "").slice(0, 120);\n      if (!obj)\n        return json({ ok: false, reason: "NOT_FOUND", sha256: sha, store: storeName, tokenClass: cls }, 404);\n      return new Response(obj.body, {\n        status: wantRange ? 206 : 200,\n        headers: {\n          "content-type": "application/octet-stream",\n          "access-control-allow-origin": "*",\n          "x-capture-sha256": sha,\n          ...dl ? { "content-disposition": `attachment; filename="${dl}"` } : {}\n        }\n      });\n    }\n    const stub = env.STORE.get(env.STORE.idFromName(storeName));\n    const inner = new URL("http://x/" + op);\n    for (const [k, v] of url.searchParams) if (k !== "token" && k !== "op") inner.searchParams.set(k, v);\n    const res = await stub.fetch(new Request(inner, {\n      method: req.method,\n      body: req.method === "POST" ? await req.text() : void 0\n    }));\n    const body = await res.json();\n    return json({ ...body, store: storeName, tokenClass: cls }, res.status);\n  }\n};\nexport {\n  PUBLISHED_TOKEN_HASHES,\n  Store,\n  index_default as default,\n  liveToken\n};\n';

// src/index.mjs
var CFG = {
  CLIENT_ID: "1c2fdba3fc71cf88d26fcd7b90df95de",
  AUTHORIZE: "https://dash.cloudflare.com/oauth2/auth",
  TOKEN: "https://dash.cloudflare.com/oauth2/token",
  API: "https://api.cloudflare.com/client/v4",
  REDIRECT: "https://newgroup.believeinoakland.workers.dev/callback",
  /* Exactly the scopes registered on the OAuth client, nothing more. */
  SCOPES: ["workers-scripts.write", "workers-r2.write", "account-settings.read"],
  COOKIE: "bio_wiz",
  COOKIE_MAX_AGE_S: 900,
  /* Public releases: two committed files in the repo's release/ folder on
     main, readable without any API token or rate limit. RELEASE.json names
     the version and the asset's SHA-256, and nothing fetched is ever
     installed without passing that check. */
  RELEASE_LATEST: "https://raw.githubusercontent.com/believeinoakland/bio/main/release"
};
var hex = (buf) => [...new Uint8Array(buf)].map((x) => x.toString(16).padStart(2, "0")).join("");
var vcmp = (a, b) => {
  const A = String(a).split(".").map(Number), B = String(b).split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const d = (A[i] || 0) - (B[i] || 0);
    if (d) return d;
  }
  return 0;
};
var relHeaders = { "user-agent": "bio-installer" };
async function fetchRepoManifest() {
  const rj = await fetch(CFG.RELEASE_LATEST + "/RELEASE.json", { redirect: "follow", headers: relHeaders });
  if (!rj.ok) throw new Error("manifest http " + rj.status);
  return rj.json();
}
async function fetchRepoAsset(man) {
  const ra = await fetch(CFG.RELEASE_LATEST + "/" + (man.asset || "bio-plane.bundled.mjs"), { redirect: "follow", headers: relHeaders });
  if (!ra.ok) throw new Error("asset http " + ra.status);
  const bytes = new Uint8Array(await ra.arrayBuffer());
  const got = hex(await crypto.subtle.digest("SHA-256", bytes));
  if (got !== man.sha256) {
    const e = new Error("integrity");
    e.integrity = true;
    throw e;
  }
  return new TextDecoder().decode(bytes);
}
async function selectRelease(emit) {
  emit.step("rel", "Checking the public repository for the newest release");
  try {
    const man = await fetchRepoManifest();
    if (vcmp(man.version, RELEASE_VERSION) > 0) {
      const source = await fetchRepoAsset(man);
      emit.ok("rel", "The repository has " + man.version + ", newer than the built-in " + RELEASE_VERSION + ". Its integrity checked out, so that is what installs.");
      return { version: String(man.version), source, from: "repository" };
    }
    emit.ok("rel", "The built-in release (" + RELEASE_VERSION + ") is current.");
  } catch (e) {
    emit.ok("rel", e && e.integrity ? "The repository's copy did not pass its integrity check, so it was NOT used. The installer's own built-in release (" + RELEASE_VERSION + ") installs instead, which is safe. This is worth mentioning to Believe in Oakland." : "The public repository was not reachable just now, so the built-in release (" + RELEASE_VERSION + ") is used. That is fine.");
  }
  return { version: RELEASE_VERSION, source: RELEASE_SOURCE, from: "built-in" };
}
var enc = new TextEncoder();
var b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
var rand = (n) => b64url(crypto.getRandomValues(new Uint8Array(n)));
var s256 = async (s) => b64url(await crypto.subtle.digest("SHA-256", enc.encode(s)));
var json = (o, status = 200, headers = {}) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json", ...headers } });
var html = (s, status = 200, headers = {}) => new Response(s, { status, headers: { "content-type": "text/html; charset=utf-8", ...headers } });
var esc = (s) => String(s ?? "").replace(
  /[&<>"']/g,
  (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
);
var SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/;
var slugOk = (s) => typeof s === "string" && SLUG_RE.test(s) && s !== "newgroup";
var readCookie = (req, name) => {
  const raw = req.headers.get("cookie") || "";
  for (const part of raw.split(/;\s*/)) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i) === name) return part.slice(i + 1);
  }
  return null;
};
var setCookie = (v, maxAge) => `${CFG.COOKIE}=${v}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
async function exchange(code, verifier) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: CFG.REDIRECT,
    client_id: CFG.CLIENT_ID,
    code_verifier: verifier
  });
  const r = await fetch(CFG.TOKEN, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token)
    throw new Error(j.error_description || j.error || `HTTP ${r.status}`);
  return j.access_token;
}
async function cf(token, path, init = {}) {
  const r = await fetch(CFG.API + path, { ...init, headers: {
    authorization: "Bearer " + token,
    ...init.body instanceof FormData ? {} : { "content-type": "application/json" },
    ...init.headers || {}
  } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.success === false) {
    const e = new Error(j.errors?.[0]?.message || `HTTP ${r.status}`);
    e.code = j.errors?.[0]?.code;
    e.status = r.status;
    throw e;
  }
  return j.result;
}
async function scriptExists(token, acct, slug) {
  try {
    await cf(token, `/accounts/${acct}/workers/scripts/${slug}/settings`);
    return true;
  } catch (e) {
    if (e.status === 404) return false;
    throw e;
  }
}
async function ensureBuckets(token, acct) {
  for (const name of ["bio-captures", "bio-published"]) {
    try {
      await cf(token, `/accounts/${acct}/r2/buckets`, {
        method: "POST",
        body: JSON.stringify({ name })
      });
    } catch (e) {
      if (!/already exists/i.test(e.message)) throw e;
    }
  }
}
function uploadForm(meta, source) {
  const fd = new FormData();
  fd.append("metadata", new Blob([JSON.stringify(meta)], { type: "application/json" }));
  fd.append("index.mjs", new Blob([source], { type: "application/javascript+module" }), "index.mjs");
  return fd;
}
async function uploadInstall(token, acct, slug, secrets, release) {
  const meta = {
    main_module: "index.mjs",
    compatibility_date: "2026-07-01",
    compatibility_flags: ["nodejs_compat"],
    bindings: [
      { type: "durable_object_namespace", name: "STORE", class_name: "Store" },
      { type: "plain_text", name: "VERSION", text: release.version },
      { type: "secret_text", name: "ADMIN_TOKEN", text: secrets.boot },
      { type: "secret_text", name: "MEMBER_TOKEN", text: secrets.member },
      { type: "secret_text", name: "PROBE_TOKEN", text: secrets.probe },
      { type: "r2_bucket", name: "CAPTURES", bucket_name: "bio-captures" },
      { type: "r2_bucket", name: "PUBLISHED", bucket_name: "bio-published" }
    ],
    /* SQLite backend is the irreversible choice, made correctly, once. */
    migrations: { new_tag: "v1", new_sqlite_classes: ["Store"] }
  };
  return cf(
    token,
    `/accounts/${acct}/workers/scripts/${slug}`,
    { method: "PUT", body: uploadForm(meta, release.source) }
  );
}
async function uploadUpdate(token, acct, slug, withR2, release) {
  const meta = {
    main_module: "index.mjs",
    compatibility_date: "2026-07-01",
    compatibility_flags: ["nodejs_compat"],
    bindings: [
      { type: "plain_text", name: "VERSION", text: release.version },
      ...withR2 ? [
        { type: "r2_bucket", name: "CAPTURES", bucket_name: "bio-captures" },
        { type: "r2_bucket", name: "PUBLISHED", bucket_name: "bio-published" }
      ] : []
    ],
    keep_bindings: ["secret_text", "durable_object_namespace", ...withR2 ? [] : ["r2_bucket"]]
  };
  return cf(
    token,
    `/accounts/${acct}/workers/scripts/${slug}`,
    { method: "PUT", body: uploadForm(meta, release.source) }
  );
}
async function ensureSubdomain(token, acct, slug) {
  let sub = null;
  try {
    sub = (await cf(token, `/accounts/${acct}/workers/subdomain`))?.subdomain || null;
  } catch (e) {
    if (e.status !== 404) throw e;
  }
  let registered = null;
  if (!sub) {
    const candidates = [slug, `${slug}-${rand(3).toLowerCase().replace(/[^a-z0-9]/g, "x").slice(0, 4)}`];
    for (const c of candidates) {
      try {
        await cf(
          token,
          `/accounts/${acct}/workers/subdomain`,
          { method: "PUT", body: JSON.stringify({ subdomain: c }) }
        );
        sub = c;
        registered = c;
        break;
      } catch (e) {
        if (!/taken|exists|unavailable/i.test(e.message)) throw e;
      }
    }
    if (!sub) throw new Error("no workers.dev prefix is set on this account and the names tried were taken");
  }
  await cf(
    token,
    `/accounts/${acct}/workers/scripts/${slug}/subdomain`,
    { method: "POST", body: JSON.stringify({ enabled: true }) }
  );
  return { sub, registered };
}
async function verifyInstall(base, probe) {
  for (let i = 0; i < 10; i++) {
    try {
      const r = await fetch(`${base}/api/?op=selftest&token=${probe}`);
      const j = await r.json();
      if (j.ok === true && j.bindings?.STORE === true) return j;
    } catch {
    }
    await new Promise((res) => setTimeout(res, 3e3));
  }
  return null;
}
async function verifyUpdate(base, wantVersion) {
  for (let i = 0; i < 5; i++) {
    try {
      const r = await fetch(`${base}/api/?op=bootstrap`);
      const j = await r.json();
      if (j.version === wantVersion) return j;
    } catch {
    }
    await new Promise((res) => setTimeout(res, 2500));
  }
  return null;
}
function progressShell(title, slug) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>${esc(title)}</title><style>${PAGE_CSS}</style></head><body><main>
<p class="eyebrow">Believe in Oakland &middot; installer</p>
<h1>${esc(title)}</h1>
<p class="small">Reference: <span class="mono">${esc(slug)}</span>. Leave this page open. This usually takes under a minute.</p>
<div id="log" class="log"></div>
<div id="fail" class="notice" hidden><h2 id="fail-h"></h2><p id="fail-p"></p><p class="small mono" id="fail-d"></p></div>
<div id="done" hidden></div>
<script>
const $=s=>document.querySelector(s);const rows={};
function step(id,label){const d=document.createElement("div");d.className="row go";d.id="r-"+id;
 d.innerHTML='<span class="dot"></span><span></span>';d.lastChild.textContent=label;$("#log").appendChild(d);rows[id]=d;}
function ok(id,label){const d=rows[id];if(!d)return;d.className="row ok";if(label)d.lastChild.textContent=label;}
function no(id){const d=rows[id];if(!d)return;d.className="row no";}
function fail(h,p,d){$("#fail").hidden=false;$("#fail-h").textContent=h;$("#fail-p").textContent=p;$("#fail-d").textContent=d||"";}
function done(html){$("#done").innerHTML=html;$("#done").hidden=false;
 document.querySelectorAll("[data-copy]").forEach(b=>b.addEventListener("click",async()=>{
  await navigator.clipboard.writeText(document.getElementById(b.dataset.copy).textContent);
  const t=b.textContent;b.textContent="Copied";setTimeout(()=>b.textContent=t,1400);}));
 const h=$("#handover");if(h)h.addEventListener("click",()=>{location.href=h.dataset.url+"#boot="+encodeURIComponent(document.getElementById("out-boot").textContent);});}
</script>`;
}
var jsStr = (s) => JSON.stringify(String(s ?? ""));
function streamPage(headers, shell, run) {
  const { readable, writable } = new TransformStream();
  const w = writable.getWriter();
  const write = (s) => w.write(enc.encode(s));
  const emit = {
    step: (id, label) => write(`<script>step(${jsStr(id)},${jsStr(label)})</script>
`),
    ok: (id, label) => write(`<script>ok(${jsStr(id)}${label ? "," + jsStr(label) : ""})</script>
`),
    no: (id) => write(`<script>no(${jsStr(id)})</script>
`),
    fail: (h, p, d) => write(`<script>no();fail(${jsStr(h)},${jsStr(p)},${jsStr(d)})</script>
`),
    done: (inner) => write(`<script>done(${JSON.stringify(inner)})</script>
`)
  };
  (async () => {
    await write(shell);
    try {
      await run(emit);
    } catch (e) {
      await emit.fail(
        "Something went wrong that this page did not anticipate",
        "The step in progress did not finish. Nothing secret was stored anywhere.",
        String(e && e.message || e)
      );
    }
    await write("</body></html>");
    await w.close();
  })();
  return new Response(readable, { headers: { "content-type": "text/html; charset=utf-8", ...headers } });
}
async function runInstall(emit, code, saved) {
  const slug = saved.slug;
  let token;
  emit.step("auth", "Confirming your permission with Cloudflare");
  try {
    token = await exchange(code, saved.v);
    emit.ok("auth");
  } catch (e) {
    emit.no("auth");
    return emit.fail(
      "Cloudflare did not confirm the permission",
      "The sign-in came back but the final handshake failed, so nothing was created.",
      "Detail: " + e.message
    );
  }
  emit.step("acct", "Finding your account");
  let acct;
  try {
    const accts = await cf(token, "/accounts");
    if (!accts?.length) throw new Error("no accounts on this sign-in");
    acct = accts[0];
    emit.ok("acct", `Using the account "${acct.name}"`);
  } catch (e) {
    emit.no("acct");
    return emit.fail(
      "Could not read your account",
      "Permission was granted but the account list came back empty or refused. Nothing was created.",
      "Detail: " + e.message
    );
  }
  emit.step("fresh", "Checking the name is free on your account");
  try {
    if (await scriptExists(token, acct.id, slug)) {
      emit.no("fresh");
      return emit.fail(
        `A copy named "${slug}" already exists on your account`,
        "Nothing was changed. If you meant to update it to the current release, go back and choose the update option instead.",
        ""
      );
    }
    emit.ok("fresh");
  } catch (e) {
    emit.no("fresh");
    return emit.fail(
      "Could not check your account",
      "The check for an existing copy failed, so to be safe nothing was created.",
      "Detail: " + e.message
    );
  }
  emit.step("r2", "Setting up your evidence storage");
  try {
    await ensureBuckets(token, acct.id);
    emit.ok("r2");
  } catch (e) {
    emit.no("r2");
    return emit.fail(
      "One Cloudflare setting is needed first",
      "Your copy keeps captured documents (PDFs, web pages, timestamp certificates) in Cloudflare's file storage, and Cloudflare requires a payment method on the account before that storage can be turned on. Usage at a community group's size stays inside the free tier; the card is Cloudflare's requirement, not a charge. Nothing was installed, so there is nothing to clean up.",
      "To continue: sign in at dash.cloudflare.com with this same account, open Billing, add a card or PayPal, then come back here and run the installer again. (Cloudflare said: " + e.message + ")"
    );
  }
  const release = await selectRelease(emit);
  emit.step("gen", "Generating your credentials");
  const secrets = { boot: rand(32), member: rand(32), probe: rand(32) };
  emit.ok("gen");
  emit.step("install", "Installing the software into your account");
  try {
    await uploadInstall(token, acct.id, slug, secrets, release);
    emit.ok("install");
  } catch (e) {
    emit.no("install");
    return emit.fail(
      "The software did not install",
      "Your account was reachable but the install was refused, so there is nothing left behind to clean up.",
      "Detail: " + e.message
    );
  }
  emit.step("addr", "Turning on your web address");
  let base;
  try {
    const { sub, registered } = await ensureSubdomain(token, acct.id, slug);
    base = `https://${slug}.${sub}.workers.dev`;
    emit.ok("addr", registered ? `Your account had no web address prefix yet, so it is now "${registered}". Every future worker on this account shares that prefix.` : void 0);
  } catch (e) {
    emit.no("addr");
    return emit.fail(
      "Your copy installed but has no address yet",
      "The software is on your account. Only the public web address failed, which is fixable from the Cloudflare dashboard under Workers, without starting over.",
      "Detail: " + e.message
    );
  }
  emit.step("verify", "Checking that it answers");
  const st = await verifyInstall(base, secrets.probe);
  if (st) emit.ok("verify");
  else emit.no("verify");
  emit.done(successPanel(base, secrets, !!st));
}
function successPanel(base, secrets, verified) {
  const head = verified ? `<b>Your copy is running.</b> It lives in your
Cloudflare account, under your control. Believe in Oakland holds no key to it.` : `<b>Your copy is installed. Its new address has not woken up yet.</b> Brand-new
addresses can take a few minutes to start answering; everything else finished. Save the
credentials below now, then open your address. It lives in your Cloudflare account, under
your control. Believe in Oakland holds no key to it.`;
  return `<div class="okbox"><p style="margin:0">${head}</p></div>
<div class="card">
 <div class="kv"><span class="k">Your address</span><span class="v" id="out-url">${esc(base)}</span><button class="copy" data-copy="out-url">Copy</button></div>
 <div class="kv"><span class="k">One-time password</span><span class="v" id="out-boot">${secrets.boot}</span><button class="copy" data-copy="out-boot">Copy</button></div>
 <div class="kv"><span class="k">Member credential</span><span class="v" id="out-member">${secrets.member}</span><button class="copy" data-copy="out-member">Copy</button></div>
 <div class="kv"><span class="k">Probe credential</span><span class="v" id="out-probe">${secrets.probe}</span><button class="copy" data-copy="out-probe">Copy</button></div>
</div>
<p><b>Save the member and probe credentials in a password manager now.</b> This page is the
only time they are shown. The one-time password is spent in the next step, where you choose
a real password.</p>
<p class="small">If you lose the password you choose next, you are not locked out: replacing
the ADMIN_TOKEN value in your worker's Cloudflare settings starts the claim step over. Your
Cloudflare sign-in is the way back in.</p>
<div class="actions"><button id="handover" data-url="${esc(base)}/">Go to my copy and finish setup</button></div>`;
}
async function runUpdate(emit, code, saved) {
  const slug = saved.slug;
  let token;
  emit.step("auth", "Confirming your permission with Cloudflare");
  try {
    token = await exchange(code, saved.v);
    emit.ok("auth");
  } catch (e) {
    emit.no("auth");
    return emit.fail(
      "Cloudflare did not confirm the permission",
      "The sign-in came back but the final handshake failed. Your existing copy is untouched.",
      "Detail: " + e.message
    );
  }
  emit.step("acct", "Finding your account");
  let acct;
  try {
    const accts = await cf(token, "/accounts");
    if (!accts?.length) throw new Error("no accounts on this sign-in");
    acct = accts[0];
    emit.ok("acct", `Using the account "${acct.name}"`);
  } catch (e) {
    emit.no("acct");
    return emit.fail(
      "Could not read your account",
      "Permission was granted but the account list came back empty or refused. Your existing copy is untouched.",
      "Detail: " + e.message
    );
  }
  emit.step("find", `Finding your copy named "${slug}"`);
  try {
    if (!await scriptExists(token, acct.id, slug)) {
      emit.no("find");
      return emit.fail(
        `No copy named "${slug}" exists on your account`,
        "Nothing was changed. Check the name against your address: it is the first part, before the first dot.",
        ""
      );
    }
    emit.ok("find");
  } catch (e) {
    emit.no("find");
    return emit.fail(
      "Could not check your account",
      "The lookup failed, so to be safe nothing was changed.",
      "Detail: " + e.message
    );
  }
  let withR2 = false;
  try {
    await ensureBuckets(token, acct.id);
    withR2 = true;
  } catch {
  }
  const release = await selectRelease(emit);
  emit.step("up", `Updating the software to ${release.version}`);
  try {
    await uploadUpdate(token, acct.id, slug, withR2, release);
    emit.ok("up");
  } catch (e) {
    emit.no("up");
    return emit.fail(
      "The update was refused",
      "Your copy is still running the version it had before. Nothing about it changed.",
      "Detail: " + e.message
    );
  }
  emit.step("addr", "Finding your copy's address");
  let base = null;
  try {
    const sub = (await cf(token, `/accounts/${acct.id}/workers/subdomain`))?.subdomain;
    if (sub) base = `https://${slug}.${sub}.workers.dev`;
    emit.ok("addr");
  } catch {
    emit.ok("addr");
  }
  let confirmed = false;
  if (base) {
    emit.step("verify", "Checking the new version answers");
    confirmed = !!await verifyUpdate(base, release.version);
    emit.ok("verify", confirmed ? void 0 : "The address has not started answering with the new version yet. That is normal for a few minutes after an update and nothing needs fixing.");
  }
  emit.done(`<div class="okbox"><p style="margin:0"><b>Updated to ${esc(release.version)}.</b>
${confirmed ? "The new version is answering." : "The upload finished successfully. The address can take a few minutes to start serving the new version, so open your copy a little later and its page will show " + esc(release.version) + "."}
Your passwords, your credentials, and everything in the record are exactly as they were.
Updates never touch them.</p></div>` + (base ? `<div class="actions"><a class="btnlink" href="${esc(base)}/">Open your copy</a></div>` : ""));
}
var index_default = {
  async fetch(req) {
    const url = new URL(req.url);
    if (req.method === "GET" && (url.pathname === "/" || url.pathname === ""))
      return html(WIZARD_HTML);
    if (req.method === "GET" && url.pathname === "/update")
      return html(UPDATE_HTML);
    if (req.method === "POST" && url.pathname === "/begin") {
      const body = await req.json().catch(() => ({}));
      const mode = body.mode === "update" ? "update" : "install";
      const slug = String(body.slug || "").trim();
      if (!slugOk(slug))
        return json({ ok: false, error: "The name needs 3 to 40 characters: lower-case letters, digits, and hyphens, starting and ending with a letter or digit." }, 400);
      const v = rand(32), s = rand(16);
      const q = new URLSearchParams({
        response_type: "code",
        client_id: CFG.CLIENT_ID,
        redirect_uri: CFG.REDIRECT,
        scope: CFG.SCOPES.join(" "),
        state: s,
        code_challenge: await s256(v),
        code_challenge_method: "S256"
      });
      const cookie = b64url(enc.encode(JSON.stringify({ v, s, slug, mode, t: Date.now() })));
      return json(
        { ok: true, authorize: `${CFG.AUTHORIZE}?${q}` },
        200,
        { "set-cookie": setCookie(cookie, CFG.COOKIE_MAX_AGE_S) }
      );
    }
    if (req.method === "GET" && url.pathname === "/callback") {
      const clear = { "set-cookie": setCookie("deleted", 0) };
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      const err = url.searchParams.get("error");
      let saved = null;
      const raw = readCookie(req, CFG.COOKIE);
      if (raw) {
        try {
          saved = JSON.parse(new TextDecoder().decode(
            Uint8Array.from(atob(raw.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0))
          ));
        } catch {
          saved = null;
        }
      }
      if (err)
        return html(plainPage(
          "Permission was not granted",
          "Cloudflare did not approve the request, so nothing was created.",
          url.searchParams.get("error_description") || err
        ), 200, clear);
      if (!code || !saved || saved.s !== state || typeof saved.t !== "number" || Date.now() - saved.t > CFG.COOKIE_MAX_AGE_S * 1e3)
        return html(plainPage(
          "This sign-in could not be verified",
          "The reply from Cloudflare does not match a request this browser made recently. Nothing was created. Start again from the beginning, in this same tab.",
          ""
        ), 200, clear);
      const title = saved.mode === "update" ? "Updating your copy" : "Setting up your copy";
      return streamPage(
        clear,
        progressShell(title, saved.slug),
        (emit) => saved.mode === "update" ? runUpdate(emit, code, saved) : runInstall(emit, code, saved)
      );
    }
    return html(plainPage(
      "Nothing lives at this address",
      "The installer starts at the front page.",
      ""
    ), 404);
  }
};
function plainPage(head, what, detail) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>${esc(head)}</title><style>${PAGE_CSS}</style></head><body><main>
<p class="eyebrow">Believe in Oakland &middot; installer</p>
<h1>${esc(head)}</h1><p>${esc(what)}</p>
${detail ? `<p class="small mono">${esc(detail)}</p>` : ""}
<p><a href="/">Back to the start</a></p>
</main></body></html>`;
}
export {
  CFG,
  index_default as default
};
