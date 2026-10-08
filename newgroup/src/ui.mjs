/* The wizard's front page and the CSS shared with the progress and error
 * pages. One aesthetic across parts 1, 2, and 3: paper, ink, verdigris.
 *
 * R22 (N5, K262; DEC-124): every page names the product, Civicsmith (PRODUCT, the one place the name is written), and
 * speaks to the group installing it: by the name it chose once it has chosen one, as "your group" before. Each says the
 * installer is run by the publisher of Civicsmith releases (PUBLISHER, the line every page carries), and names no third
 * party. R23: the install page states the two prerequisites the install enforces, and the Containers permission the
 * assistant's subscription path and the file scanner need. R37 (T36): the page says where the assistant's two settings
 * are made, and takes no choice. R45 (T36): the security tools are added inside the group's Civicsmith, and the
 * optional Workers VPC service is named here. R35 (DEC-122 (3)): every page loads
 * nothing from another origin; its typefaces are the device's own (PAGE_CSS's stacks). R41 (DEC-143): the act that chooses
 * the short name carries the Irreversible weight and opens a full dialog saying it is permanent. R42 (DEC-146): the one
 * line saying what Civicsmith is, and its second line, held here once.
 */

import { list as heldProfiles } from "../../jurisdictions/index.mjs";

export const PRODUCT = "Civicsmith";
export const PUBLISHER = `This installer is run by the publisher of ${PRODUCT} releases.`;
/* The example name is not a place (R22): a group names itself for what it does. */
export const EXAMPLE_SLUG = "clean-water-coalition";
export const publisherFooter = () => `<p class="small publisher">${PUBLISHER}</p>`;

/* R42 (DEC-146 (1)-(3)): what Civicsmith is, in one line, and the second line for where there is room; the same two lines
   as public-read R30's credit page, held here once rather than imported (an import would add the plane's code to this
   bundle). The invitation page (bio-plane/public/newgroup/index.html) carries the same two lines as static text. */
export const DESCRIPTION = "Free software for groups that check whether government keeps its own rules and promises.";
export const WHO = "Neighbourhood and issue groups, newsrooms, professional associations, and public offices checking their own work.";
const whatBlock = () => `<p class="what">${DESCRIPTION}</p>
<p class="small who">${WHO}</p>`;

/* R41 (DEC-143, DEC-87, DEC-88): an act that can never be undone shows the Irreversible weight on its button: the five
   pips of the visual language's acts, the weight's word always beside them. */
export const IRREVERSIBLE = `<span class="w"><span class="pips" aria-hidden="true"><i class="on"></i><i class="on"></i><i class="on"></i><i class="on"></i><i class="on"></i></span>Irreversible</span>`;
/* R41: the full dialog before /begin is sent in install mode. Its heading names the short name typed (filled in as text
   by the page's script); its words are the design stream's (layouts, the install screen), with the worker's name added
   as R41 states it. Only "Install with this short name" sends /begin; "Choose another name", or closing the dialog,
   sends nothing. */
export const PERMANENCE = "Your short name is in every address of your group's Civicsmith and beside every signature your "
  + "members make, and it becomes the name of its worker in your Cloudflare account. It can never be changed, by you or "
  + "anyone, without installing a new Civicsmith and starting again.";
const confirmDialog = () => `<dialog id="confirm" aria-labelledby="confirm-h">
<h2 id="confirm-h">&ldquo;<span class="mono" id="confirm-name"></span>&rdquo; is permanent</h2>
<p>${PERMANENCE}</p>
<div class="actions"><button type="button" id="confirm-yes">Install with this short name${IRREVERSIBLE}</button>
<button type="button" class="quiet" id="confirm-no">Choose another name</button></div>
</dialog>`;

/* R21 (N10): the jurisdiction profiles an install offers, every held profile but the test ones, each by name and
   coverage. They are `jurisdictions`' data, shown as data (layers.md, "No jurisdiction in the product", rules 1–2): the
   installer's own words name no place (R31). */
export const PROFILE_CHOICES = Object.freeze(heldProfiles().filter((p) => p.test !== true)
  .map(({ id, name, covers }) => Object.freeze({ id, name, covers: Object.freeze([...covers]) })));
const escText = (s) => String(s).replace(/[&<>"']/g,
  (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const PROFILES_NONE = `Choosing none is allowed. Your group's Civicsmith then reads no jurisdiction's local facts
(identifier forms, publishing systems, laws and their deadlines): every fact that needs one says it is undetermined
rather than guessing. An administrator can choose profiles later on its setup page.`;
const profilesBlock = () => `<h2>Where your group works</h2>
<p>Your group's Civicsmith reads local facts from jurisdiction profiles. Choose the ones that cover where your group works, in the
order they should be read. None is chosen for you.</p>
<fieldset class="profiles" id="profiles">
<legend class="small">Jurisdiction profiles this installer holds</legend>
${PROFILE_CHOICES.map((p) => `<label class="choice"><input type="checkbox" name="profile" value="${escText(p.id)}">`
  + `<span class="pname">${escText(p.name)}</span> <span class="small pcovers">covers ${p.covers.map(escText).join(", ")}</span></label>`).join("\n")}
</fieldset>
<p class="hint">${PROFILES_NONE}</p>`;

/* R37 (T36; N721, DEC-172; K1957, K2063 (5)): the assistant is optional, and its two settings are made in the group's
   Civicsmith at its setup, separately, nothing preselected (setup-page R18): whether the group pays for it (its own
   Anthropic API key, set by an administrator there), and whether the group keeps its material away from AI (off unless
   an administrator turns it on, with a reason). A member may always connect their own account, serving only them,
   unless the group keeps its material away from AI; each member is told what goes to Anthropic before their first use
   (instance-setup R54; credentials R36). The installer takes no choice and binds no Claude credential (R36). */
export const ASSISTANT_OFFER = `The assistant is optional. Its two settings are made in your group's Civicsmith when it
is set up, separately, and neither is chosen for you: whether your group pays for it, with its own Anthropic API key,
which an administrator sets there; and whether your group keeps its material away from AI, which is off unless an
administrator turns it on, giving a reason. A member may always connect their own Claude subscription or API key,
which serves only them, unless your group keeps its material away from AI. Each member is told what goes to Anthropic
before their first use. This installer takes and binds no Claude account or key, and makes no choice about the
assistant.`;
const assistantBlock = () => `<h2>The assistant</h2>
<p>${ASSISTANT_OFFER}</p>`;

/* R45 (T36; N710, setup-page R30; K1946 T4): where the organization's own security tools are added, and that this
   installer takes none. Said on the install page, the final panel and the update's last screen. */
export const SECURITY_TOOLS = `Your organization's own security tools (file scanners, safe-copy makers, sandboxes, web
reputation, security log forwarding) are added in your group's Civicsmith by an administrator, at its setup or later.
This installer takes no tool and no tool's key.`;
/* R45: the optional Workers VPC service a tool reached through a tunnel needs, on the install and the update pages
   alike. Nothing is filled in for the operator. */
const vpcField = () => `<label for="vpc">Workers VPC service for a security tool reached through a tunnel (optional)</label>
<input id="vpc" type="text" autocomplete="off" spellcheck="false" placeholder="leave empty if you have none">
<p class="hint">Only if your organization will add a security tool that your group's Civicsmith reaches through a
Cloudflare Tunnel: the ID of the Workers VPC service for it, as Cloudflare shows it. The file scanner is connected to
it. Left empty, none is connected, and such a tool answers REACH_NOT_BOUND in your group's Civicsmith until the updater
is run with one.</p>`;
const securityBlock = () => `<h2>Your organization's security tools</h2>
<p>${SECURITY_TOOLS}</p>
${vpcField()}`;

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
.what{font-size:19px;margin:0 0 6px}
.who{margin:0 0 18px}
button .w{display:inline-flex;align-items:center;gap:6px;margin-left:12px;padding-left:12px;
  border-left:1px solid currentColor;font-size:12.5px;font-weight:500}
.pips{display:inline-flex;gap:2px}
.pips i{width:6px;height:6px;border-radius:50%;border:1.25px solid currentColor}
.pips i.on{background:currentColor}
button.quiet{background:transparent;color:var(--verdigris-dk);border-color:var(--rule);margin-left:8px}
button.quiet:hover{background:transparent;border-color:var(--verdigris)}
dialog{max-width:560px;border:1px solid var(--rule);border-left:3px solid var(--signal);background:#F6F7F2;
  color:var(--ink);padding:22px 24px}
dialog::backdrop{background:rgba(22,35,46,.45)}
dialog h2{margin-top:0}
`;

/* `confirm` (R41, the install page only): the button that chooses the short name carries the Irreversible weight, and
   pressing it opens the permanence dialog instead of sending /begin. `what` (R42): the page says what Civicsmith is. */
function page({ title, description, eyebrow, lede, blocks, slugLabel, slugHint,
  placeholder, buttonText, mode, footer, goNote, extra = "", confirm = false, what = false }) {
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
${what ? whatBlock() : ""}
<p class="lede">${lede}</p>

${blocks}

<label for="slug" id="slug-label">${slugLabel}</label>
<input id="slug" type="text" autocomplete="off" spellcheck="false" placeholder="${placeholder}">
<p class="hint" id="slug-hint">${slugHint}</p>
${extra}

<button id="go">${buttonText}${confirm ? IRREVERSIBLE : ""}</button>
<p class="err" id="err"></p>
${confirm ? confirmDialog() : ""}

<p class="small">${goNote}</p>
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
async function begin(slug){
  const err=$("#err");
  $("#go").disabled=true;
  try{
    const r=await fetch("/begin",{method:"POST",headers:{"content-type":"application/json"},
      body:JSON.stringify({slug,mode:"${mode}",...($("#profiles")?{profiles:chosen}:{}),...($("#vpc")&&$("#vpc").value.trim()?{securityVpc:$("#vpc").value.trim()}:{}),...($("#ai")&&$("#ai").value.trim()?{instanceAi:$("#ai").value.trim()}:{})})});
    const j=await r.json();
    if(!j.ok){err.textContent=j.error||"That name was not accepted.";return;}
    location.href=j.authorize;
  }catch(e){err.textContent="Could not start: "+e.message;}
  finally{$("#go").disabled=false;}
}
const dlg=$("#confirm");
$("#go").addEventListener("click",()=>{
  const err=$("#err");err.textContent="";
  const slug=slugify($("#slug").value);
  if(slug.length<3){err.textContent="The name needs at least 3 characters.";$("#slug").focus();return;}
  if(!dlg){begin(slug);return;}
  $("#confirm-name").textContent=slug;dlg.dataset.slug=slug;dlg.showModal();
});
if(dlg){
  $("#confirm-yes").addEventListener("click",()=>{const slug=dlg.dataset.slug;dlg.close();begin(slug);});
  $("#confirm-no").addEventListener("click",()=>dlg.close());
}
</script>
</body>
</html>`;
}

export const WIZARD_HTML = page({
  mode: "install",
  confirm: true,
  what: true,
  title: `Set up your group's ${PRODUCT}`,
  description: DESCRIPTION,
  eyebrow: `${PRODUCT} &middot; installer`,
  lede: `In a few minutes your group will have its own ${PRODUCT}, running in
your own Cloudflare account. Not an account of ours: yours, under your control,
from the first second.`,
  blocks: `<div class="card">
<p style="margin:0"><b>What you need:</b> a Cloudflare account with two
things turned on. First, the <b>Workers Paid plan</b> ($5 a month): your group's
Civicsmith does real work, reading documents and assembling evidence, and the free plan's
processing allowance is too small for it. Second, a <b>payment method</b> on
the account: Cloudflare requires one before it turns on the file storage your
group's Civicsmith keeps its evidence in. The installer checks both before it creates
anything, and stops, saying which is missing, if either is.
<a href="https://dash.cloudflare.com/sign-up" rel="noopener">Create a
Cloudflare account</a> first if you do not have one, then come back.</p>
<p style="margin:12px 0 0">The installer also asks the <b>Workers Containers
permission</b>, for two things that run in containers, which Workers Paid
includes. It installs the built-in file scanner and safe view: without it,
files are kept and shown but not scanned, and a high-risk file opens only in
its safe view once one can be made. And it serves the assistant through a
member's own Claude subscription: without it, the assistant is used only with
an API key: a member's own, or your group's. Everything else installs either way.</p>
</div>

<h2>What happens when you press the button</h2>
<p>Cloudflare will show you a permission screen naming exactly what this
installer may do in your account: install the software, set up its
storage, and set up its containers (the file scanner and the assistant's). You approve it there, on Cloudflare's own page, and you can revoke
it any time from your Cloudflare dashboard. The permission passes through
this installer for the seconds the setup takes. This installer has no
database and nowhere to keep it, and it is never stored.</p>
<p class="small">Prefer to do everything by hand, with nothing passing
through us at all? The manual path is documented and permanently supported.
It is slower and uses the Cloudflare dashboard directly, and it exists so
that your group can stand up its Civicsmith even if the publisher of ${PRODUCT} releases
disappears.</p>

${profilesBlock()}

${assistantBlock()}

${securityBlock()}

<h2>Name your group's Civicsmith</h2>`,
  slugLabel: "A short name for your group",
  slugHint: `Lower-case letters, digits, and hyphens. It becomes part of your
web address and is recorded beside every signature, and it can never be changed,
so pick something you are happy to say out loud.`,
  placeholder: EXAMPLE_SLUG,
  buttonText: "Continue with this short name",
  goNote: `Pressing the button asks you to confirm the short name, then takes you
to dash.cloudflare.com to approve the permission, and brings you straight back here.`,
  footer: `<p class="small" style="margin-top:34px;border-top:1px solid var(--rule);padding-top:16px">
Already running your group's Civicsmith and looking for the current release? That is
<a href="/update">a separate page</a>.</p>`,
});

export const UPDATE_HTML = page({
  mode: "update",
  title: `Update your group's ${PRODUCT}`,
  description: `Bring your group's existing ${PRODUCT} up to the current release.`,
  eyebrow: `${PRODUCT} &middot; software update`,
  lede: `This brings your group's ${PRODUCT} up to the current
release. It changes the software and nothing else: your passwords, your
credentials, and your record are untouched, and that is enforced by how the
update is applied, not by promise. The one exception is yours to choose: an
organisation AI credential you paste in the optional box below.`,
  blocks: `<h2>What happens when you press the button</h2>
<p>Cloudflare shows you the permission screen. If your group's Civicsmith was
installed before the containers existed, it asks one permission more than
before, <b>Workers Containers</b>, for the built-in file scanner and safe view and for
the assistant through a member's own Claude subscription. Without it, everything else
updates: files are kept and shown but not scanned, and a high-risk file opens only in
its safe view once one can be made; and the assistant is used only with an API key: a
member's own, or your group's. You approve it on Cloudflare's own page, the new release is placed into your account, and
the permission is gone the moment it finishes. Nothing is stored here.</p>

<h2>Which installation</h2>`,
  slugLabel: "The name your group's Civicsmith was installed under",
  slugHint: "The first part of its address, before the first dot.",
  /* DIST-9 (D-260): the optional organisation `ai` credential. A member mints it ON the copy, so it can only be given
     to an update of that copy; the installer never creates one. type=password: it is a secret, never shown back. */
  extra: `<label for="ai">Organisation AI credential (optional)</label>
<input id="ai" type="password" autocomplete="off" spellcheck="false" placeholder="leave empty to keep what it holds">
<p class="hint">Only if a member of your group minted an organisation AI credential inside your group's Civicsmith and
you want it to resume paused assistant runs on its own. It is stored there as a secret and never shown. Left empty,
the update sends none and keeps any it already holds. This installer never creates one.</p>
${securityBlock()}`,
  placeholder: EXAMPLE_SLUG,
  buttonText: "Continue to Cloudflare",
  goNote: `Pressing the button takes you to dash.cloudflare.com to
approve the permission, then brings you straight back here.`,
  footer: `<p class="small" style="margin-top:34px;border-top:1px solid var(--rule);padding-top:16px">
Setting up your group's Civicsmith for the first time instead? That is <a href="/">the setup page</a>.</p>`,
});
