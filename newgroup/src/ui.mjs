/* The wizard's front page and the CSS shared with the progress and error
 * pages. One aesthetic across parts 1, 2, and 3: paper, ink, verdigris.
 *
 * R22 (N5, K262; DEC-124): every page names the product, Civicsmith (PRODUCT, the one place the name is written), and
 * speaks to the group installing it: by the name it chose once it has chosen one, as "your group" before. Each says the
 * installer is run by the publisher of Civicsmith releases (PUBLISHER, the line every page carries), and names no third
 * party. R23: the install page states the two prerequisites the install enforces. R35 (DEC-122 (3)): every page loads
 * nothing from another origin; its typefaces are the device's own (PAGE_CSS's stacks).
 */

import { list as heldProfiles } from "../../jurisdictions/index.mjs";

export const PRODUCT = "Civicsmith";
export const PUBLISHER = `This installer is run by the publisher of ${PRODUCT} releases.`;
/* The example name is not a place (R22): a group names itself for what it does. */
export const EXAMPLE_SLUG = "clean-water-coalition";
export const publisherFooter = () => `<p class="small publisher">${PUBLISHER}</p>`;

/* R21 (N10): the jurisdiction profiles an install offers, every held profile but the test ones, each by name and
   coverage. They are `jurisdictions`' data, shown as data (layers.md, "No jurisdiction in the product", rules 1–2): the
   installer's own words name no place (R31). */
export const PROFILE_CHOICES = Object.freeze(heldProfiles().filter((p) => p.test !== true)
  .map(({ id, name, covers }) => Object.freeze({ id, name, covers: Object.freeze([...covers]) })));
const escText = (s) => String(s).replace(/[&<>"']/g,
  (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const PROFILES_NONE = `Choosing none is allowed. Your copy then reads no jurisdiction's local facts (identifier
forms, publishing systems, laws and their deadlines): every fact that needs one says it is undetermined rather than
guessing. An administrator can choose profiles later on your copy's setup page.`;
const profilesBlock = () => `<h2>Where your group works</h2>
<p>Your copy reads local facts from jurisdiction profiles. Choose the ones that cover where your group works, in the
order they should be read. None is chosen for you.</p>
<fieldset class="profiles" id="profiles">
<legend class="small">Jurisdiction profiles this installer holds</legend>
${PROFILE_CHOICES.map((p) => `<label class="choice"><input type="checkbox" name="profile" value="${escText(p.id)}">`
  + `<span class="pname">${escText(p.name)}</span> <span class="small pcovers">covers ${p.covers.map(escText).join(", ")}</span></label>`).join("\n")}
</fieldset>
<p class="hint">${PROFILES_NONE}</p>`;

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
fieldset.profiles{border:0;padding:0;margin:0 0 6px}
fieldset.profiles legend{padding:0;margin:0 0 8px}
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
.publisher{margin-top:34px;border-top:1px solid var(--rule);padding-top:16px}
`;

function page({ title, description, eyebrow, lede, blocks, slugLabel, slugHint,
  placeholder, buttonText, mode, footer, extra = "" }) {
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
${extra}

<button id="go">${buttonText}</button>
<p class="err" id="err"></p>

<p class="small">Pressing the button takes you to dash.cloudflare.com to
approve the permission, then brings you straight back here.</p>
${footer}
${publisherFooter()}
</main>
<script>
const $=s=>document.querySelector(s);
const slugify=v=>v.toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"").slice(0,40);
const chosen=[];document.querySelectorAll('input[name="profile"]').forEach(b=>b.addEventListener("change",()=>{
  const i=chosen.indexOf(b.value);if(b.checked&&i<0)chosen.push(b.value);if(!b.checked&&i>=0)chosen.splice(i,1);}));
$("#slug").addEventListener("input",e=>{const p=e.target.selectionStart;e.target.value=slugify(e.target.value);
  try{e.target.setSelectionRange(p,p)}catch{}});
$("#go").addEventListener("click",async()=>{
  const err=$("#err");err.textContent="";
  const slug=slugify($("#slug").value);
  if(slug.length<3){err.textContent="The name needs at least 3 characters.";$("#slug").focus();return;}
  $("#go").disabled=true;
  try{
    const r=await fetch("/begin",{method:"POST",headers:{"content-type":"application/json"},
      body:JSON.stringify({slug,mode:"${mode}",...($("#profiles")?{profiles:chosen}:{}),...($("#ai")&&$("#ai").value.trim()?{instanceAi:$("#ai").value.trim()}:{})})});
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
  title: `Set up your group's copy of ${PRODUCT}`,
  description: `Install your group's own copy of ${PRODUCT}, the accountability record, into your own Cloudflare account.`,
  eyebrow: `${PRODUCT} &middot; installer`,
  lede: `In a few minutes your group will have its own copy of ${PRODUCT}, the
accountability record, running in your own Cloudflare account. Not an account
of ours: yours, under your control, from the first second.`,
  blocks: `<div class="card">
<p style="margin:0"><b>What you need:</b> a Cloudflare account with two
things turned on. First, the <b>Workers Paid plan</b> ($5 a month): your copy
does real work, reading documents and assembling evidence, and the free plan's
processing allowance is too small for it. Second, a <b>payment method</b> on
the account: Cloudflare requires one before it turns on the file storage your
copy keeps its evidence in. The installer checks both before it creates
anything, and stops, saying which is missing, if either is.
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
that your group can stand up a copy even if the publisher of ${PRODUCT} releases
disappears.</p>

${profilesBlock()}

<h2>Name your copy</h2>`,
  slugLabel: "A short name for your group",
  slugHint: `Lower-case letters, digits, and hyphens. It becomes part of your
web address, so pick something you are happy to say out loud.`,
  placeholder: EXAMPLE_SLUG,
  buttonText: "Continue to Cloudflare",
  footer: `<p class="small" style="margin-top:34px;border-top:1px solid var(--rule);padding-top:16px">
Already running a copy and looking for the current release? That is
<a href="/update">a separate page</a>.</p>`,
});

export const UPDATE_HTML = page({
  mode: "update",
  title: `Update your copy of ${PRODUCT}`,
  description: `Bring your group's existing copy of ${PRODUCT} up to the current release.`,
  eyebrow: `${PRODUCT} &middot; software update`,
  lede: `This brings the copy of ${PRODUCT} your group already runs up to the current
release. It changes the software and nothing else: your passwords, your
credentials, and your record are untouched, and that is enforced by how the
update is applied, not by promise. The one exception is yours to choose: an
organisation AI credential you paste in the optional box below.`,
  blocks: `<h2>What happens when you press the button</h2>
<p>Cloudflare shows you the same permission screen as at install. You approve
it on Cloudflare's own page, the new release is placed into your account, and
the permission is gone the moment it finishes. Nothing is stored here.</p>

<h2>Which copy</h2>`,
  slugLabel: "The name of the copy to update",
  slugHint: "The first part of your copy's address, before the first dot.",
  /* DIST-9 (D-260): the optional organisation `ai` credential. A member mints it ON the copy, so it can only be given
     to an update of that copy; the installer never creates one. type=password: it is a secret, never shown back. */
  extra: `<label for="ai">Organisation AI credential (optional)</label>
<input id="ai" type="password" autocomplete="off" spellcheck="false" placeholder="leave empty to keep what your copy has">
<p class="hint">Only if a member of your group minted an organisation AI credential on this copy and you want the copy
to resume paused assistant runs on its own. It is stored in your copy as a secret and never shown. Left empty, the
update sends none and keeps any your copy already holds. This installer never creates one.</p>`,
  placeholder: EXAMPLE_SLUG,
  buttonText: "Continue to Cloudflare",
  footer: `<p class="small" style="margin-top:34px;border-top:1px solid var(--rule);padding-top:16px">
Setting up a brand-new copy instead? That is <a href="/">the setup page</a>.</p>`,
});
