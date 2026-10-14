/* The installer's first page (`GET /`), its update page (`GET /update`), and the head and few layout rules every page it
 * serves shares, the progress page and the plain pages included (index.mjs).
 *
 * R53 (DEC-122 (3); K3100): every page uses `interface-assets`' stylesheet and faces, carried in this bundle and served by
 * the installer itself at `/app/assets/<name>` (index.mjs, `assetResponse`), the same path the group's Civicsmith serves
 * them at, so the stylesheet is used byte for byte; PAGE_CSS adds only the installer's own layout, in the stylesheet's
 * tokens. R35: nothing is named on another origin; the page's icon is an empty `data:` one, so a browser asks no
 * `/favicon.ico` (R1's 404).
 *
 * R50 (N1003; DEC-201 (4), DEC-206 (4)): the first page asks only the permanent short name (R41's dialog) and the places
 * (R21), with what is needed in one block (R23; doubt 7: civicsmith.org does not serve yet, so the block stays here);
 * then "Before Cloudflare" says in plain words what Cloudflare will be asked to allow, and R34's words (instance-setup's
 * HOSTING_CONTROL); "Continue to Cloudflare" sends `POST /begin`. R37's assistant paragraph and R45's optional Workers VPC
 * field sit there folded, closed by default: on the page, never one of its asks. R52 (DEC-201 (8)): the update page draws
 * the release your group's Civicsmith runs and the one this update installs, and says a stop leaves it running as it was.
 *
 * R22 (N5, K262; DEC-124): every page names the product, Civicsmith (PRODUCT), speaks to "your group", and says the
 * installer is run by the publisher of Civicsmith releases (PUBLISHER). R23: the first page's one block states the
 * prerequisites the install enforces, the Containers permission and what it installs, and (T46) the container parts the
 * carried release cannot install (LEFT_OUT). R41 (DEC-143): the act that chooses the short name carries the Irreversible
 * weight and opens a full dialog saying it is permanent. R42 (DEC-146): the one line saying what Civicsmith is, and its
 * second line, held here once. The words are the design stream's (`mock-screens.js` SCR.install, SCR.update) where it
 * gives them.
 */

import { list as heldProfiles } from "../../jurisdictions/index.mjs";
/* R23 (T46): the container images the release this installer carries names (recorded by the embed from its signed fleet
   statement), and the one statement of what cannot install yet. */
import { RELEASE_VERSION, RELEASE_CONTAINERS } from "./release.mjs";
import { leftOutNotice } from "./images.mjs";
/* R34, R50 (instance-setup R47, R83): who really controls your group's Civicsmith, in instance-setup's words, held there once. */
import { HOSTING_CONTROL } from "../../bio-plane/src/setup-fleet.mjs";

export const PRODUCT = "Civicsmith";
export const PUBLISHER = `This installer is run by the publisher of ${PRODUCT} releases.`;
/* The example name is not a place (R22): a group names itself for what it does. */
export const EXAMPLE_SLUG = "clean-water-coalition";
export const publisherFooter = () => `<p class="muted ng-small publisher">${PUBLISHER}</p>`;

/* R53: where the stylesheet is linked from (index.mjs serves it from `interface-assets`' ASSET_FILES), and the head every
   page carries: the stylesheet, the installer's layout, and an icon that loads nothing. */
export const ASSET_PREFIX = "/app/assets/";
export const STYLESHEET = `${ASSET_PREFIX}civicsmith.css`;
const escText = (s) => String(s).replace(/[&<>"']/g,
  (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const pageHead = (title, { description = null, noindex = false } = {}) => `<!doctype html>
<html lang="en" class="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${noindex ? `<meta name="robots" content="noindex">\n` : ""}<title>${title}</title>
${description ? `<meta name="description" content="${description}">\n` : ""}<link rel="icon" href="data:,">
<link rel="stylesheet" href="${STYLESHEET}">
<style>${PAGE_CSS}</style>
</head>`;
/* The wordmark every page opens with, as the setup frame's head draws it. */
export const pageMark = (what = "installer") => `<p class="ng-mark"><span class="ng-word">${PRODUCT}</span> <span class="eyebrow">${what}</span></p>`;

/* R42 (DEC-146 (1)-(3)): what Civicsmith is, in one line, and the second line for where there is room; the same two lines
   as public-read R30's credit page, held here once rather than imported (an import would add the plane's code to this
   bundle). The invitation page (bio-plane/public/newgroup/index.html) carries the same two lines as static text. */
export const DESCRIPTION = "Free software for groups that check whether government keeps its own rules and promises.";
export const WHO = "Neighbourhood and issue groups, newsrooms, professional associations, and public offices checking their own work.";
const whatBlock = () => `<p class="what">${DESCRIPTION}</p>
<p class="small who">${WHO}</p>`;

/* R41 (DEC-143, DEC-87, DEC-88): an act that can never be undone shows the Irreversible weight on its button: the five
   pips of the visual language's acts (`cs-pips`), the weight's word always beside them. */
export const IRREVERSIBLE = `<span class="w"><span class="cs-pips" aria-hidden="true"><i class="on"></i><i class="on"></i><i class="on"></i><i class="on"></i><i class="on"></i></span>Irreversible</span>`;
/* R41: the full dialog the short name's act opens. Its heading names the short name typed (filled in as text by the
   page's script); its words are the design stream's, with the worker's name added as R41 states it. Its confirming act
   draws "Before Cloudflare" (R50), whose "Continue to Cloudflare" alone sends /begin; "Choose another name", or closing
   the dialog, sends nothing. */
export const PERMANENCE = "Your short name is in every address of your group's Civicsmith and beside every signature your "
  + "members make, and it becomes the name of its worker in your Cloudflare account. It can never be changed, by you or "
  + "anyone, without installing a new Civicsmith and starting again.";
const confirmDialog = () => `<dialog id="confirm" class="cs-dialog" aria-labelledby="confirm-h">
<h2 id="confirm-h">&ldquo;<span class="id" id="confirm-name"></span>&rdquo; is permanent</h2>
<p class="ends">${PERMANENCE}</p>
<div class="ng-acts"><button type="button" class="cs-btn" data-tone="primary" id="confirm-yes">Continue with this short name${IRREVERSIBLE}</button>
<button type="button" class="cs-btn" data-tone="quiet" id="confirm-no">Choose another name</button></div>
</dialog>`;

/* R21 (N10): the jurisdiction profiles an install offers, every held profile but the test ones, each by name and
   coverage. They are `jurisdictions`' data, shown as data (layers.md, "No jurisdiction in the product", rules 1–2): the
   installer's own words name no place (R31). */
export const PROFILE_CHOICES = Object.freeze(heldProfiles().filter((p) => p.test !== true)
  .map(({ id, name, covers }) => Object.freeze({ id, name, covers: Object.freeze([...covers]) })));
export const PROFILES_NONE = `Choosing none is allowed. Your group's Civicsmith then reads no jurisdiction's local facts
(identifier forms, publishing systems, laws and their deadlines): every fact that needs one says it is undetermined
rather than guessing. An administrator can choose them later, in its settings under Places and offices.`;
const placesBlock = () => `<section class="cs-section ng-sec" id="places">
<h2>Your group's places</h2>
<p>The places whose rules apply. Each brings its deadlines, holidays, offices and records laws, each with its source.
Choose the ones that cover where your group works, in the order they should be read. None is chosen for you.</p>
<fieldset class="profiles" id="profiles">
<legend class="muted ng-small">Places this installer holds</legend>
${PROFILE_CHOICES.map((p) => `<label class="choice"><input type="checkbox" name="profile" value="${escText(p.id)}">`
  + `<span class="pname">${escText(p.name)}</span> <span class="small pcovers">covers ${p.covers.map(escText).join(", ")}</span></label>`).join("\n")}
</fieldset>
<p class="help">${PROFILES_NONE}</p>
</section>`;

/* R37 (T36; N721, DEC-172; K1957, K2063 (5)): the assistant is optional, and its two settings are made in the group's
   Civicsmith at its setup, separately, nothing preselected (`screens-entry`'s setup): whether the group pays for it (its
   own Anthropic API key, set by an administrator there), and whether the group keeps its material away from AI (off
   unless an administrator turns it on, with a reason). A member may always connect their own account, serving only them,
   unless the group keeps its material away from AI; each member is told what goes to Anthropic before their first use
   (instance-setup R54; credentials R36). The installer takes no choice and binds no Claude credential (R36). */
export const ASSISTANT_OFFER = `The assistant is optional. Its two settings are made in your group's Civicsmith when it
is set up, separately, and neither is chosen for you: whether your group pays for it, with its own Anthropic API key,
which an administrator sets there; and whether your group keeps its material away from AI, which is off unless an
administrator turns it on, giving a reason. A member may always connect their own Claude subscription or API key,
which serves only them, unless your group keeps its material away from AI. Each member is told what goes to Anthropic
before their first use. This installer takes and binds no Claude account or key, and makes no choice about the
assistant.`;
const assistantBlock = () => `<details class="ng-fold" id="about-assistant"><summary>About the assistant</summary>
<p>${ASSISTANT_OFFER}</p></details>`;

/* R45 (T36; N710; K1946 T4): where the organization's own security tools are added, and that this installer takes none.
   Said on the install page, the final panel and the update's last screen. */
export const SECURITY_TOOLS = `Your organization's own security tools (file scanners, safe-copy makers, sandboxes, web
reputation, security log forwarding) are added in your group's Civicsmith by an administrator, at its setup or later.
This installer takes no tool and no tool's key.`;
/* R45: the optional Workers VPC service a tool reached through a tunnel needs, on the install and the update pages
   alike, folded and closed by default (R50: never one of the first page's asks). Nothing is filled in for the operator. */
const securityBlock = () => `<details class="ng-fold" id="security-fold"><summary>For an organization with its own security tools (most groups skip this)</summary>
<p>${SECURITY_TOOLS}</p>
<div class="cs-field"><label for="vpc">Workers VPC service for a security tool reached through a tunnel (optional)</label>
<input id="vpc" class="cs-input id" type="text" autocomplete="off" spellcheck="false" placeholder="leave empty if you have none">
<p class="help">Only if your organization will add a security tool that your group's Civicsmith reaches through a
Cloudflare Tunnel: the ID of the Workers VPC service for it, as Cloudflare shows it. The file scanner is connected to
it. Left empty, none is connected, and such a tool answers REACH_NOT_BOUND in your group's Civicsmith until the updater
is run with one.</p></div></details>`;

/* R50 (and R2's five scopes): what Cloudflare will ask you to allow, in plain words, one line per scope, in R2's order. */
export const ALLOWED = Object.freeze([
  "Putting your group's Civicsmith's programs in your account.",
  "Making its storage for documents and evidence.",
  "Reading which plan your account is on.",
  "Running its containers: the built-in file scanner and safe view, and the assistant through a member's own Claude "
    + "subscription. Without them, files are kept and shown but not scanned, and a high-risk file opens only in its safe "
    + "view once one can be made.",
  "Joining its parts together inside your account, and to a private network service of your organization's only if you "
    + "name one below.",
]);
const allowedBlock = () => `<section class="cs-section ng-sec" id="allowed">
<h2>What Cloudflare will ask you to allow</h2>
<ul class="ng-list">${ALLOWED.map((l) => `<li>${l}</li>`).join("")}</ul>
<p>You approve it on Cloudflare's own page, and you can revoke it at any time from your Cloudflare dashboard. The
permission passes through this installer for the minutes the setup takes. This installer has no database and nowhere
to keep it, and it is never stored.</p>
</section>`;

/* R50 with R34 (DEC-109): who really controls your group's Civicsmith, in instance-setup's words (HOSTING_CONTROL), under
   the design stream's heading for this moment; the guide's sentence is the claim's and the final panel's. Nothing asks
   for or records an acknowledgement of it. */
export const BEFORE_CLOUDFLARE_CONTROL = "Whoever can sign in to this Cloudflare account controls your group's Civicsmith";
const controlBlock = () => `<section class="cs-sheet ng-block" id="control-before">
<h2>${BEFORE_CLOUDFLARE_CONTROL}</h2>
${HOSTING_CONTROL.sentences.map((s) => `<p>${escText(s)}</p>`).join("\n")}
</section>`;

/* R53: the installer's own layout, in the stylesheet's tokens (its colours, type and space); everything else is the
   stylesheet's own components (`cs-btn`, `cs-field`, `cs-input`, `cs-dialog`, `cs-sheet`, `cs-row`, `cs-gap`, `cs-pips`). */
export const PAGE_CSS = `
body{margin:0;min-height:100vh}
.ng{max-width:680px;margin:0 auto;padding:var(--s-6) var(--s-4) var(--s-8);display:grid;gap:var(--s-5)}
.ng[hidden],.ng [hidden]{display:none}
.ng h1{font:600 var(--t-2xl)/var(--lh-tight) var(--f-sans)}
.ng h2{font:600 var(--t-lg)/1.3 var(--f-sans)}
.ng p{margin:0;max-width:var(--measure);line-height:var(--lh-read)}
.ng-mark{display:flex;align-items:baseline;gap:var(--s-2);margin:0}
.ng-word{font:600 var(--t-xl)/1 var(--f-serif);color:var(--c-accent)}
.ng-stage{display:grid;gap:var(--s-5)}
.ng-sec{gap:var(--s-2)}
.ng-small,.small{font-size:var(--t-sm);color:var(--c-muted)}
.what{font-size:var(--t-lg)}
.lede{font-size:var(--t-lg);color:var(--c-ink-2)}
.ng-list{margin:0;padding-left:var(--s-5);display:grid;gap:var(--s-2);max-width:var(--measure)}
.ng-block{padding:var(--s-4);display:grid;gap:var(--s-2)}
.ng-acts{display:flex;flex-wrap:wrap;gap:var(--s-2);align-items:center}
.help{font-size:var(--t-sm);color:var(--c-muted)}
fieldset.profiles{border:0;padding:0;margin:0;display:grid;gap:var(--s-2)}
fieldset.profiles legend{padding:0;margin:0 0 var(--s-2)}
.choice{display:block;border:var(--hair);background:var(--c-surface);padding:var(--s-3) var(--s-4);cursor:pointer}
.choice:hover{border-color:var(--c-accent)}
.choice input{margin-right:var(--s-2)}
.ng-fold{border-top:var(--hair);padding-top:var(--s-3);display:grid;gap:var(--s-3)}
.ng-fold>summary{cursor:pointer;font-weight:600;color:var(--c-accent)}
.ng-fold[open]>*:not(summary){margin-top:var(--s-3)}
.err{color:var(--c-signal);font-size:var(--t-sm);min-height:1.4em}
.ng-log .cs-row .mk{font-size:var(--t-xs);font-weight:700;letter-spacing:var(--track-caps);text-transform:uppercase;min-width:4.5em}
.ng-log .cs-row[data-r="go"] .mk{color:var(--c-muted)}
.ng-log .cs-row[data-r="ok"] .mk{color:var(--c-ready)}
.ng-log .cs-row[data-r="no"] .mk{color:var(--c-signal)}
.ng-stop{display:grid;gap:var(--s-2);padding:var(--s-4);background:var(--c-signal-tint);border-left:3px solid var(--c-signal)}
.ng-stop[hidden]{display:none}
.notice{display:grid;gap:var(--s-2);padding:var(--s-4);background:var(--c-signal-tint);border-left:3px solid var(--c-signal)}
.okbox{display:grid;gap:var(--s-2);padding:var(--s-4);background:var(--c-accent-tint);border-left:3px solid var(--c-accent)}
.card{display:grid;gap:var(--s-2);padding:var(--s-4);background:var(--c-surface);border:var(--hair)}
.kv{display:flex;flex-wrap:wrap;gap:var(--s-2) var(--s-3);align-items:baseline;padding:var(--s-2) 0;border-top:var(--hair)}
.kv:first-child{border-top:0}
.kv .k{color:var(--c-muted);min-width:150px}
.kv .v{font-family:var(--f-mono);font-size:var(--t-sm);word-break:break-all;flex:1}
button.copy{font:600 var(--t-xs)/1.2 var(--f-sans);padding:4px 10px;background:transparent;color:var(--c-accent);
  border:var(--hair);border-radius:var(--r-1);cursor:pointer}
button.copy:hover{background:var(--c-accent-tint)}
.mono{font-family:var(--f-mono);font-size:.9em;word-break:break-all}
.publisher{border-top:var(--hair);padding-top:var(--s-4)}
dialog.cs-dialog{color:var(--c-ink)}
dialog.cs-dialog::backdrop{background:rgb(10 20 25 / .45)}
`;

/* R23 (T46; N897 (4)): before the install begins, the install and update pages say, per member, which container part
   the release this installer carries cannot install (its image is not where your Cloudflare account can pull it), and
   what your group's Civicsmith then lacks. Nothing when every image installs. */
export const LEFT_OUT = leftOutNotice(RELEASE_CONTAINERS, RELEASE_VERSION);

/* R23 (and doubt 7): what is needed, in the first page's one block. */
const needBlock = () => `<section class="cs-section ng-sec" id="need">
<h2>What you need</h2>
<ul class="ng-list">
<li>A Cloudflare account on the <b>Workers Paid plan</b> ($5 a month), with a <b>payment method on the account</b>, belonging
to your group rather than to one person. Your group's Civicsmith reads documents and assembles evidence, which the free
plan's processing allowance is too small for, and Cloudflare turns on the file storage it keeps its evidence in only once
a payment method is there. The installer checks both before it creates anything, and stops, saying which is missing, if
either is. <a href="https://dash.cloudflare.com/sign-up" rel="noopener">Create a Cloudflare account</a> first if you have none.</li>
<li>The <b>Workers Containers permission</b>, which the installer asks for, for two things that run in containers. It
installs the built-in file scanner and safe view: without it, files are kept and shown but not scanned, and a high-risk
file opens only in its safe view once one can be made. And it serves the assistant through a member's own Claude
subscription: without it, the assistant is used only with an API key: a member's own, or your group's. Everything else
installs either way.</li>
<li>About twenty minutes, at a computer. No Claude account: the assistant is optional.</li>
</ul>
${LEFT_OUT}
</section>`;

/* The pages' one script (R41, R50, R52). It touches only elements by id, and the profiles by name. On the first page the
   short name's act opens the permanence dialog; its confirming act draws "Before Cloudflare" and sends nothing; there,
   "Continue to Cloudflare" sends /begin with the name the dialog showed; "Back" returns. On the update page the one act
   sends /begin. */
const pageScript = (mode) => `<script>
const $=s=>document.querySelector(s);
const slugify=v=>v.toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"").slice(0,40);
const chosen=[];document.querySelectorAll('input[name="profile"]').forEach(b=>b.addEventListener("change",()=>{
  const i=chosen.indexOf(b.value);if(b.checked&&i<0)chosen.push(b.value);if(!b.checked&&i>=0)chosen.splice(i,1);}));
$("#slug").addEventListener("input",e=>{const p=e.target.selectionStart;e.target.value=slugify(e.target.value);
  try{e.target.setSelectionRange(p,p)}catch{}});
async function begin(slug,btn,err){
  btn.disabled=true;
  try{
    const r=await fetch("/begin",{method:"POST",headers:{"content-type":"application/json"},
      body:JSON.stringify({slug,mode:"${mode}",...($("#profiles")?{profiles:chosen}:{}),...($("#vpc")&&$("#vpc").value.trim()?{securityVpc:$("#vpc").value.trim()}:{}),...($("#ai")&&$("#ai").value.trim()?{instanceAi:$("#ai").value.trim()}:{})})});
    const j=await r.json();
    if(!j.ok){err.textContent=j.error||"That name was not accepted.";return;}
    location.href=j.authorize;
  }catch(e){err.textContent="Could not start: "+e.message;}
  finally{btn.disabled=false;}
}
const dlg=$("#confirm");
$("#go").addEventListener("click",()=>{
  const err=$("#err");err.textContent="";
  const slug=slugify($("#slug").value);
  if(slug.length<3){err.textContent="The short name needs at least 3 characters.";$("#slug").focus();return;}
  if(!dlg){begin(slug,$("#go"),err);return;}
  $("#confirm-name").textContent=slug;dlg.dataset.slug=slug;dlg.showModal();
});
if(dlg){
  $("#confirm-yes").addEventListener("click",()=>{const slug=dlg.dataset.slug;dlg.close();
    $("#chosen-name").textContent=slug;$("#stage-before").dataset.slug=slug;$("#stage-choose").hidden=true;$("#stage-before").hidden=false;});
  $("#confirm-no").addEventListener("click",()=>dlg.close());
  $("#back").addEventListener("click",()=>{$("#err2").textContent="";delete $("#stage-before").dataset.slug;$("#stage-before").hidden=true;$("#stage-choose").hidden=false;});
  $("#cloudflare").addEventListener("click",()=>{const err=$("#err2");err.textContent="";const slug=$("#stage-before").dataset.slug;
    if(!slug)return;begin(slug,$("#cloudflare"),err);});
}
</script>`;

/* `GET /`: R50's two stages in one page (the second hidden until the dialog's confirming act), then the publisher's line. */
export const INSTALL_TITLE = `Create your ${PRODUCT} group`;
export const WIZARD_HTML = `${pageHead(INSTALL_TITLE, { description: DESCRIPTION })}
<body class="cs">
<main class="cs-frame ng">
${pageMark()}
<div class="ng-stage" id="stage-choose">
<h1>Create your new ${PRODUCT} group</h1>
${whatBlock()}
<p class="lede">Two choices here, then Cloudflare. Your group's Civicsmith will run in your group's own Cloudflare
account: not an account of ours, yours, under your control from the first second.</p>
${needBlock()}
<section class="cs-section ng-sec" id="short-name">
<h2>Your group's short name</h2>
<p>Your group has two names. Its <b>name</b>, such as &ldquo;Lakeshore Tenants&rdquo;, is what people read; you choose
it in setup and can change it whenever you like. Its <b>short name</b>, chosen here, is the fixed label in its web
addresses and beside every signature, and can never change.</p>
<div class="cs-field"><label for="slug" id="slug-label">Short name</label>
<input id="slug" class="cs-input id" type="text" autocomplete="off" spellcheck="false" placeholder="${EXAMPLE_SLUG}">
<p class="help" id="slug-hint">Lower-case letters, digits and hyphens. It becomes the first part of your group's web
address and the name of its worker in your Cloudflare account. A group that wants to stay unnamed picks one that reveals
nothing.</p></div>
</section>
${placesBlock()}
<div class="ng-acts"><button id="go" class="cs-btn" data-tone="primary">Continue${IRREVERSIBLE}</button></div>
<p class="err" id="err" role="alert"></p>
</div>
${confirmDialog()}
<div class="ng-stage" id="stage-before" hidden>
<h1>Let this installer into your Cloudflare account</h1>
<p class="lede">Next you go to Cloudflare's own page, sign in there, and allow this installer to set up your group's
Civicsmith in your account, under the short name <b class="id" id="chosen-name"></b>. Civicsmith never sees your
Cloudflare password.</p>
${allowedBlock()}
${controlBlock()}
${assistantBlock()}
${securityBlock()}
<div class="ng-acts"><button id="cloudflare" class="cs-btn" data-tone="primary">Continue to Cloudflare</button>
<button type="button" id="back" class="cs-btn" data-tone="quiet">Back</button></div>
<p class="err" id="err2" role="alert"></p>
<p class="muted ng-small">Prefer to do everything by hand, with nothing passing through this installer at all? The manual
path is documented and permanently supported. It uses the Cloudflare dashboard directly, and it exists so that your
group can stand up its Civicsmith even if the publisher of ${PRODUCT} releases disappears.</p>
</div>
<p class="muted ng-small">Already running your group's Civicsmith and looking for the current release? That is
<a href="/update">the update page</a>.</p>
${publisherFooter()}
</main>
${pageScript("install")}
</body>
</html>`;

/* `GET /update` (R52): the release your group's Civicsmith runs is not known here (its address is the account's, which
   only Cloudflare's permission lets the installer read), so this page draws it as the line it becomes; the progress page
   and the last screen draw the version before and after once it is read (index.mjs, runUpdate). */
export const UPDATE_TITLE = `Update your group's ${PRODUCT}`;
export const UPDATE_KEEPS = "If a step stops, your group's Civicsmith keeps running as it was.";
export const UPDATE_HTML = `${pageHead(UPDATE_TITLE, { description: `Bring your group's existing ${PRODUCT} up to the current release.` })}
<body class="cs">
<main class="cs-frame ng">
${pageMark("update")}
<div class="ng-stage">
<h1>${UPDATE_TITLE}</h1>
<p class="lede">For whoever holds your group's Cloudflare account. An update keeps every record, member and setting; it
changes only Civicsmith's own programs. Your passwords, your credentials and your record are untouched, and that is
enforced by how the update is applied, not by promise.</p>
<div class="cs-sheet" id="versions">
<div class="cs-row" id="version-before"><span class="mk">Now</span><span>Your group's Civicsmith: the release it runs now is read once Cloudflare lets this installer find it, and shown as the update starts.</span><span></span></div>
<div class="cs-row" id="version-after"><span class="mk">Next</span><span>This update: release <b class="id">${escText(RELEASE_VERSION)}</b>, signed by Civicsmith, or a newer signed one if the public repository holds it.</span><span></span></div>
</div>
<p>You go to Cloudflare's page to allow it, as when it was set up. ${UPDATE_KEEPS}</p>
<section class="cs-section ng-sec">
<h2>What Cloudflare will ask you to allow</h2>
<p>The same permission as when your group's Civicsmith was set up. If it was set up before the containers existed, it
asks one permission more than before, <b>Workers Containers</b>, for the built-in file scanner and safe view and for the
assistant through a member's own Claude subscription. Without it, everything else updates: files are kept and shown but
not scanned, and a high-risk file opens only in its safe view once one can be made; and the assistant is used only with
an API key: a member's own, or your group's. The permission is gone the moment the update finishes. Nothing is stored
here.</p>
${LEFT_OUT}
</section>
<section class="cs-section ng-sec">
<h2>Which installation</h2>
<div class="cs-field"><label for="slug" id="slug-label">The name your group's Civicsmith was installed under</label>
<input id="slug" class="cs-input id" type="text" autocomplete="off" spellcheck="false" placeholder="${EXAMPLE_SLUG}">
<p class="help" id="slug-hint">Its short name: the first part of its address, before the first dot.</p></div>
</section>
<details class="ng-fold" id="ai-fold"><summary>An organisation AI credential (most groups skip this)</summary>
<div class="cs-field"><label for="ai">Organisation AI credential (optional)</label>
<input id="ai" type="password" class="cs-input" autocomplete="off" spellcheck="false" placeholder="leave empty to keep what it holds">
<p class="help">Only if a member of your group minted an organisation AI credential inside your group's Civicsmith and
you want it to resume paused assistant runs on its own. It is stored there as a secret and never shown. Left empty,
the update sends none and keeps any it already holds. This installer never creates one.</p></div></details>
${securityBlock()}
<div class="ng-acts"><button id="go" class="cs-btn" data-tone="primary">Continue to Cloudflare to update</button></div>
<p class="err" id="err" role="alert"></p>
</div>
<p class="muted ng-small">Setting up your group's Civicsmith for the first time instead? That is
<a href="/">the installer's first page</a>.</p>
${publisherFooter()}
</main>
${pageScript("update")}
</body>
</html>`;
