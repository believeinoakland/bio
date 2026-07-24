/* The wizard's front page and the CSS shared with the progress and error
 * pages. One aesthetic across parts 1, 2, and 3: paper, ink, verdigris.
 */

export const PAGE_CSS = `
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

function page({ title, description, eyebrow, lede, blocks, slugLabel, slugHint,
  placeholder, buttonText, mode, footer }) {
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

export const WIZARD_HTML = page({
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
<a href="/update">a separate page</a>.</p>`,
});

export const UPDATE_HTML = page({
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
Setting up a brand-new copy instead? That is <a href="/">the setup page</a>.</p>`,
});
