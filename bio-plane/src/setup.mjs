/* Part 3 of the installer: the instance's own setup page, served at /.
 *
 * Embedded in the module rather than shipped as a static asset, because the
 * OAuth install path uploads a single module and must not depend on the
 * asset-manifest upload machinery. Same origin as the API, so no CORS work.
 *
 * The page drives exactly three unauthenticated ops, each of which gates
 * itself: bootstrap (reveals only claimed or not), claim (requires the
 * one-time password and refuses once spent), login (requires the password).
 * The one-time password may arrive in the URL FRAGMENT from the wizard
 * handover. Fragments never leave the browser, and the page strips the hash
 * immediately so it cannot linger in the address bar or history entry.
 *
 * REC-163: the page is no longer served byte-for-byte as built. Its one line
 * saying whose record this is carries the record's own producing group, read
 * when the page is served — see `setupPage` below.
 */

/* R24: the record's document vocabulary and the inquiry title rule are record-grammar's (its R30, R32, R35), read
   there and never copied. */
import { STATES, HEADINGS } from "./record-grammar/document.mjs";
import { deriveInquiryTitle } from "./record-grammar/titles.mjs";
/* The Civicsmith agent's one composer is acquisition's (its R24), read there and never copied. */
import { civicsmithUserAgent } from "./acquisition/index.mjs";
/* R32 (N65 (3)): the risk tiers and their reader are action-grammar's, read there and never copied (its R1). */
import { RISK_TIERS, riskTierState } from "./action-grammar/index.mjs";
import { COUNTERPARTY_LEVELS, list as heldProfiles, get as heldProfile, combine as combineProfiles }
  from "../../jurisdictions/index.mjs";
import { recordOf, stampInstant } from "./record-core/index.mjs";
import { membershipOf, notAnAdmin } from "./membership/index.mjs";
import { promotionOf } from "./promotion/index.mjs";
import { governorOf } from "./host-governor/index.mjs";
import { schedulerOf } from "./scheduler/index.mjs";
import { captureOf } from "./capture/index.mjs";
import { entitiesOf } from "./entities/index.mjs";
import { linesOf, CAPACITIES as LINE_CAPACITIES } from "./lines/index.mjs";
import { provenanceOf } from "./provenance/index.mjs";
import { normAlias as termFold } from "./extraction/index.mjs";
import { parse as legistarParse, readPages as legistarPages, readBodyName as legistarBodyName, KEY as LEGISTAR_KEY,
         BASIS as LEGISTAR_BASIS } from "../../legistar-reader/index.mjs";
/* R65 (K1837): the no-added-fact check and the one row both assistant drafts answer until the model turn lands are
   wizard-scripts' (its R25, its rows), read there and never copied. */
import * as wizardScripts from "./wizard-scripts/index.mjs";
import { cpuProbe } from "./cpu.mjs";
import { liveToken } from "./tokens.mjs";
import { livefire } from "./livefire.mjs";
import { GROUP_SLUG_RE, FLEET_BINDINGS, hostingControlBlock } from "./setup-fleet.mjs";

/* The intake form obeys the record grammar's own tables (record-grammar R32, R35) rather than a copy of
   them. Injected at module load, so a grammar change moves the UI with it and
   drift is impossible rather than merely discouraged. The previous version
   carried a hand-written table that stamped `forming` on Problems and Actions,
   which is legal for neither, and the plane's own gate was too thin to notice
   (DEBT D-6, D-7). */
const FIRST_STATE_JSON = JSON.stringify(
  Object.fromEntries(Object.entries(STATES).map(([t, s]) => [t, s.legal[0]])));
const HEADINGS_JSON = JSON.stringify(HEADINGS);
/* D-483: the tier vocabulary, injected the way FIRST_STATE and HEADINGS are and for the same reason —
   the words a member is offered are the PLANE's words, read from the one map op=affordances publishes as
   vocabularies.risk_tiers (both read action-grammar's RISK_TIERS, never a copy of it), so a vocabulary
   change moves this control with it and a surface inventing a label is impossible rather than discouraged.
   riskTierState travels with the map because the page must not decide for itself WHICH keys a member may
   author: the settable tiers are exactly the values the plane reads back as themselves. */
const RISK_TIERS_JSON = JSON.stringify(RISK_TIERS);
/* R24: an office's level, the product's vocabulary (jurisdictions' COUNTERPARTY_LEVELS), offered as written. */
const COUNTERPARTY_LEVELS_OPTIONS = COUNTERPARTY_LEVELS
  .map((l) => '<option value="' + String(l).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]))
    + '">' + String(l).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])) + "</option>")
  .join("");

/* REC-163 / IC-174 — WHOSE RECORD THIS IS, STATED ON THE PAGE AND READ FROM THE RECORD.
 *
 * THE DEFECT. This page opened with one group's name written in as a literal: true of the instance it was written for
 * and false of every instance `newgroup` installs, so a sovereign group's front door, served publicly at `/`, claimed
 * to be another group's. D-436 made the producing group ONE recorded value (State Rules §3.1), and BOB #24 ruled what
 * a stranger may be shown (`BIO_Publication_v0_1.md` §7 point 1): THE SLUG IS PUBLIC. So the page carries the recorded
 * slug, or says that none is recorded, and invents nothing beside it. A display name and a verified domain are later
 * rows (§7 points 2 and 3), and nothing here may stand in for either — not even a slug dressed up in capitals.
 *
 * THE MECHANISM. The control plane reads the group when it SERVES the page (control-plane's `GET /` route hands
 * `setupPage` the public read's answer), so the statement is in the served BYTES, signed in or out: the line sits
 * above every section the script switches between, and the script never touches it. THREE states, and the difference
 * between the last two is the one that matters most:
 *   recorded — the slug as the record holds it, in its own case (the eyebrow's capitals are not applied to it);
 *   none     — the record answered and records no group: said in words, never a blank and never a default;
 *   unread   — the record did NOT answer: said as that, and never as "none" (REC-52 — a silence is not an absence).
 * The TEMPLATE carries the unread line, so a page served without a read says it did not read, and names nobody. */
const escGroup = (x) => String(x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const GROUP_LINE_UNREAD = '<p class="eyebrow" id="instance-group" data-group="unread">'
  + "This copy could not read its group just now</p>";
/* D-596 — THE DISPLAY NAME AND THE VERIFIED DOMAIN, ON THE SAME LINE AND UNDER THE SAME RULES AS THE PLANE'S.
 * The read is now op=groupidentity's PUBLIC projection (control-plane names `groupidentitypublic` for this page), so the
 * recorded state can carry `display_name`, `domain` and `domain_verified_at` beside the slug. `BIO_Publication_v0_1.md`
 * §7 points 2 and 3, rendered as UI-78 renders them in the member UI's header:
 *   - a display name is shown WITH the slug, never instead of it — "name · slug" — and only where a slug is shown;
 *   - a domain is shown only WITH the date of the verdict that verified it — "domain verified YYYY-MM-DD". The plane
 *     already withholds an unverified claim; this is the surface's own gate beside it, so a read that hands this line a
 *     domain with no dated verdict (an older plane, a hand-built answer) shows no domain rather than an undated one.
 * The name is member-supplied text on a PUBLIC page: every value is escaped (`escGroup`), the date included. */
const verifiedDay = (x) => (typeof x === "string" && /^\d{4}-\d\d-\d\d/.test(x) ? x.slice(0, 10) : null);
/** The group line for ONE read of the record — `{ answered, result }`, as the control plane's `doAnswer` returns it.
 *  Only an answer that says `group: null` is "none"; anything the line cannot read as an answer is "unread". */
export function groupLine(read) {
  const r = read && read.answered === true && read.result && read.result.ok === true ? read.result : null;
  if (r && typeof r.group === "string" && r.group) {
    const name = typeof r.display_name === "string" && r.display_name.trim() ? r.display_name : null;
    const day = verifiedDay(r.domain_verified_at);
    const domain = typeof r.domain === "string" && r.domain && day ? r.domain : null;
    return '<p class="eyebrow" id="instance-group" data-group="recorded">'
      + (name ? '<span class="name">' + escGroup(name) + "</span> &middot; " : "")
      + '<span class="slug">'
      + escGroup(r.group) + "</span> &middot; group instance"
      + (domain ? ' &middot; <span class="domain">' + escGroup(domain) + '</span> verified <time datetime="'
                  + escGroup(day) + '">' + escGroup(day) + "</time>" : "")
      + "</p>";
  }
  if (r && r.group === null)
    return '<p class="eyebrow" id="instance-group" data-group="none">No group is recorded for this copy yet</p>';
  return GROUP_LINE_UNREAD;
}
/** The page as served: the template, its unread line replaced by what one read of the record said. */
export function setupPage(read) {
  return SETUP_HTML.replace(GROUP_LINE_UNREAD, () => groupLine(read));
}

export const SETUP_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Your accountability record</title>
<style>
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
main{max-width:640px;margin:0 auto;padding:56px 22px 80px}
.eyebrow{font-family:var(--mono);font-size:11px;letter-spacing:.16em;
  text-transform:uppercase;color:var(--verdigris);margin:0 0 14px}
.eyebrow .slug,.eyebrow .name,.eyebrow .domain{text-transform:none;letter-spacing:.04em}
h1{font-family:Georgia,serif;font-weight:600;font-size:clamp(28px,4.2vw,38px);
  line-height:1.1;margin:0 0 16px;letter-spacing:-.01em}
h2{font-family:Georgia,serif;font-weight:600;font-size:20px;margin:28px 0 10px}
p{margin:0 0 15px;max-width:60ch}
.small{font-size:14.5px;color:var(--muted)}
.card{border:1px solid var(--rule);background:#F6F7F2;padding:20px 22px;margin:0 0 18px}
.notice{border-left:3px solid var(--signal);background:#F8EFE9;padding:16px 18px;margin:0 0 18px}
.okbox{border-left:3px solid var(--verdigris);background:#EDF3F0;padding:16px 18px;margin:0 0 18px}
label{display:block;font-weight:600;font-size:14.5px;margin:14px 0 6px}
input{width:100%;padding:11px 13px;font-family:var(--mono);font-size:14.5px;
  border:1px solid var(--rule);background:#fff;color:var(--ink);border-radius:0}
input:focus-visible,button:focus-visible{outline:2px solid var(--verdigris);outline-offset:2px}
.hint{font-size:13.5px;color:var(--muted);margin:6px 0 0}
button{margin-top:18px;padding:12px 22px;font-size:15.5px;font-weight:600;cursor:pointer;
  background:var(--verdigris);color:#fff;border:1px solid var(--verdigris-dk)}
button:hover{background:var(--verdigris-dk)}
button:disabled{opacity:.55;cursor:default}
.err{color:var(--signal);font-size:14.5px;margin-top:12px;min-height:1.4em}
.kv{display:flex;gap:10px;align-items:baseline;padding:7px 0;border-top:1px solid var(--rule);font-size:14.5px}
.kv:first-of-type{border-top:0}
.kv .k{color:var(--muted);min-width:150px}
.kv .v{font-family:var(--mono);font-size:13.5px;word-break:break-all}
section{display:none} section.on{display:block}
main.wide{max-width:860px}
.crumb{font-family:var(--mono);font-size:12.5px;margin:0 0 18px}
.crumb a{color:var(--verdigris);text-decoration:none;cursor:pointer}
.crumb a:hover{text-decoration:underline}
table.rec{width:100%;border-collapse:collapse;font-size:14.5px;margin:6px 0 22px}
table.rec th{font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;
  color:var(--muted);text-align:left;font-weight:600;padding:6px 10px 6px 0;border-bottom:1px solid var(--rule)}
table.rec td{padding:9px 10px 9px 0;border-bottom:1px solid var(--rule);vertical-align:baseline}
table.rec tr.row{cursor:pointer}
table.rec tr.row:hover td{background:#F6F7F2}
.bid{font-family:var(--mono);font-size:13px;color:var(--verdigris-dk)}
.chip{display:inline-block;font-family:var(--mono);font-size:11px;letter-spacing:.08em;
  text-transform:uppercase;padding:2px 8px;border:1px solid var(--rule);color:var(--muted);background:#F6F7F2}
.chip.verified,.chip.ratified{color:#fff;background:var(--verdigris);border-color:var(--verdigris-dk)}
.chip.elevated,.chip.forming{color:var(--signal);border-color:var(--signal);background:#F8EFE9}
.md h2{font-size:19px;margin:26px 0 8px}
.md h3{font-family:var(--body);font-weight:700;font-size:15.5px;margin:20px 0 6px}
.md p{margin:0 0 12px}
.md ul{margin:0 0 12px;padding-left:22px}
.md li{margin:0 0 4px}
.md code{font-family:var(--mono);font-size:13px;background:var(--paper-2);padding:1px 4px}
.md .revnote{border-left:3px solid var(--signal);background:#F8EFE9;padding:10px 14px;margin:0 0 16px;font-size:14px}
.filelink{color:var(--verdigris);text-decoration:none}
.filelink:hover{text-decoration:underline}
.histbtn{background:none;border:none;padding:0;margin:0;font:inherit;color:var(--verdigris);cursor:pointer;text-decoration:none}
.histbtn:hover{text-decoration:underline}
.mono{font-family:var(--mono);font-size:12.5px}
.dim{color:var(--muted)}
</style>
</head>
<body>
<main>
${GROUP_LINE_UNREAD}

<section id="s-loading" class="on">
  <h1>One moment</h1>
  <p class="small">Checking the state of this copy.</p>
</section>

<section id="s-unarmed">
  <h1>This copy has no one-time password yet</h1>
  <p>Before anyone can claim it, a bootstrap credential has to exist. Sign in
  to the Cloudflare account this copy runs in, open this worker's settings,
  and set a long random value called <b>ADMIN_TOKEN</b>. Then reload this
  page.</p>
  <p class="small">If it was set but this page still says otherwise, the value
  in place is one that has been published before and this software refuses to
  accept it. Set a fresh one.</p>
</section>

<section id="s-claim">
  <h1>Claim your copy</h1>
  <p>This runs in your organization's own Cloudflare account. Claiming it
  spends the one-time password and replaces it with a password you choose.
  The one-time password stops working the moment this succeeds.</p>
  <div id="rearm-note" class="notice" hidden>
    <p style="margin:0"><b>Recovery mode.</b> The one-time password was
    replaced in the Cloudflare dashboard, so the previous claim is retired and
    this copy can be claimed again. Nothing stored in the record is affected.</p>
  </div>
  <!-- R47 (DEC-109, K1038): who really controls this copy, said before a password is chosen, in the words held once
       in setup-fleet.mjs for this page and the installer's last screen. Nothing asks for or records an acknowledgement. -->
  ${hostingControlBlock("notice")}
  <label for="boot">One-time password</label>
  <input id="boot" autocomplete="off" spellcheck="false">
  <p class="hint">From the installer's final screen, or the ADMIN_TOKEN value
  set in the Cloudflare dashboard.</p>
  <label for="pw1">Choose your password</label>
  <input id="pw1" type="password" autocomplete="new-password">
  <p class="hint">At least 12 characters. Store it in a password manager.</p>
  <label for="pw2">Type it again</label>
  <input id="pw2" type="password" autocomplete="new-password">
  <button id="do-claim">Claim this copy</button>
  <p class="err" id="claim-err"></p>
</section>

<section id="s-login">
  <h1>Sign in</h1>
  <p>This copy is claimed. Members sign in with their own name and password.
  Leave the name empty to sign in as the administrator.</p>
  <label for="lwho">Your member name</label>
  <input id="lwho" autocomplete="username" placeholder="leave empty for administrator">
  <label for="lpw">Password</label>
  <input id="lpw" type="password" autocomplete="current-password">
  <button id="do-login">Sign in</button>
  <p class="err" id="login-err"></p>
  <p class="small">Lost the password? Sign in to Cloudflare, replace the
  ADMIN_TOKEN value in this worker's settings, and reload this page to claim
  the copy again.</p>
</section>

<section id="s-panel">
  <h1>Your copy is healthy</h1>
  <div class="okbox"><p style="margin:0" id="panel-lede">Signed in as
  administrator.</p></div>
  <div class="card">
    <div class="kv"><span class="k">Software version</span><span class="v" id="p-version"></span></div>
    <div class="kv"><span class="k">Claimed</span><span class="v" id="p-claimed"></span></div>
    <!-- REC-41, 2026-08-05: the label read "Roles with passwords" and the value
         has always been filled from WHO — the ONE role that is signed in, never
         a roster. It was a label describing op=bootstrap's roles field over a
         value that never came from it, and with that field now removed it could
         never become true. Corrected to what the row actually shows rather than
         deleted: a member seeing which identity this session holds is the point
         of the row. -->
    <div class="kv"><span class="k">Signed in as</span><span class="v" id="p-roles"></span></div>
    <div class="kv"><span class="k">Session expires</span><span class="v" id="p-expires"></span></div>
  </div>
  <div class="actions" style="margin:22px 0 6px">
    <button id="go-browse">Browse the record</button>
    <button id="go-new">Add something new</button>
    <button id="go-inbox">Review the inbox</button>
    <button id="go-members" hidden>Members and keys</button>
  </div>
  <!-- R15 (N10, K102): which jurisdiction profiles this copy reads its local facts from. Shown by name to every
       signed-in member; the choice is offered only to a session that administers, among every held profile that
       is not a test profile, with NOTHING PRESELECTED; the change is warned about before it is sent, and choosing
       none is allowed and says what it means. -->
  <h2>Where this copy's local facts come from</h2>
  <div class="card" id="pf-active"><p class="small" style="margin:0">Reading the profiles&hellip;</p></div>
  <div id="pf-choose" hidden>
    <p class="small">Choose the jurisdiction profiles this copy reads its local facts from, in the order they
    should be read. Nothing is chosen for you, and choosing none is allowed.</p>
    <div class="card" id="pf-choices"></div>
    <div class="actions"><button id="pf-review">Review this change</button></div>
    <div class="notice" id="pf-warn" hidden>
      <p id="pf-warn-text"></p>
      <button id="pf-confirm">Make this change</button> <button id="pf-cancel">Keep things as they are</button>
    </div>
    <p class="err" id="pf-err"></p>
  </div>
  <!-- R53 (K1502, K1478 (i)): the assistant is optional for the copy, off unless an administrator chooses it, offered
       here and changeable later. Enabling it binds no account: each member connects their own. -->
  <h2>The assistant</h2>
  <div class="card" id="as-state"><p class="small" style="margin:0">Reading whether the assistant is on&hellip;</p></div>
  <div id="as-choose" hidden>
    <p class="small">The assistant is optional. This copy holds no account for it: each member who wants it connects
    their own Claude account or API key, and is told first that their questions and the material read to answer them
    go to Anthropic under their own account. While it is off, no question is put to it and nothing runs.</p>
    <div class="actions"><button id="as-toggle"></button></div>
    <p class="err" id="as-err"></p>
  </div>
  <h2>What this page is, and is not</h2>
  <p>This page opens the record for reading, takes in new material, and
  publishes what the group has ratified. Signing in with a password lets you
  write into the working record. Publishing something to the world needs more
  than a password: it needs a signature from a key the group has registered,
  which you make on the signing page and paste in. Deleting anything is not
  possible from here at all.</p>
  <p class="small">To update the software later, return to the installer and
  choose the update option. Updates never touch your passwords or your record.</p>
</section>

<section id="s-browse">
  <p class="crumb"><a id="crumb-panel">This copy</a> &rsaquo; Record</p>
  <h1>The record</h1>
  <p class="small" id="browse-summary"></p>
  <div id="browse-body"><p class="small">Loading the record&hellip;</p></div>
</section>

<section id="s-bundle">
  <p class="crumb"><a id="crumb-panel2">This copy</a> &rsaquo; <a id="crumb-browse">Record</a> &rsaquo; <span id="crumb-id" class="mono"></span></p>
  <h1 id="b-title" style="font-size:clamp(22px,3.4vw,30px)"></h1>
  <div class="card" id="b-facts"></div>
  <div id="b-md" class="md"></div>
  <h2>Files in this record</h2>
  <div class="card" id="b-files"></div>
  <h2>History</h2>
  <p class="small">Every revision this record has ever had. The record is
  append-only: nothing here can be edited or removed.</p>
  <div class="card" id="b-history"></div>
  <div id="b-ratify"></div>
</section>

<section id="s-new">
  <p class="crumb"><a class="crumb-home">This copy</a> &rsaquo; New</p>
  <h1>Add something new</h1>
  <p class="small">This adds a record to the working record. Nothing here is
  public: the working record has never been published and cannot be read by
  anyone without a password.</p>
  <label for="n-type">What kind of thing is this?</label>
  <!-- The Action option is BACK, 2026-08-05 (UI-19). It was removed on
       2026-08-04 by UI-15 because REC-23 had stopped both intake surfaces
       writing a placeholder counterparty, which is the honest gate, and the
       consequence was that an action written from this form left the catalog
       with exactly one error - C-2.10 naming the counterparty nobody authored.
       Offering a kind whose every instance is refused is present-and-refused,
       which Membership Architecture v2 section 5 forbids. The condition that
       note set is now met: the fieldset below is REC-23's radio pair, a named
       counterparty or NOT DETERMINED YET with a written basis, no third option
       and no default, and mdFor takes the values from the member. An action
       written here draws zero findings; one written with nothing authored still
       draws exactly C-2.10, because this page will not invent an addressee to
       get past its own gate. BOTH INTAKE SURFACES OR NEITHER: app.html carries
       the same option and the same pair. -->
  <select id="n-type">
    <option value="information">Information</option>
    <option value="inquiry">Question</option>
    <option value="project">Project</option>
    <option value="action">Action</option>
  </select>
  <label for="n-title" id="n-title-label">Title</label>
  <input id="n-title" placeholder="what this is about">
  <label for="n-body" id="n-body-label">What do you know?</label>
  <textarea id="n-body" rows="14" placeholder="Write it plainly. Markdown headings and lists work."></textarea>
  <div id="n-src">
    <div class="card">
      <p style="margin:0 0 10px"><b>Is there a document behind this?</b> Give its web address and
      this copy will fetch it, hash it at the moment it arrives, keep the bytes, and record where
      it came from. Leave both blank if you are writing down something you know rather than
      capturing something published.</p>
      <label for="n-loc">Web address of the document</label>
      <input id="n-loc" placeholder="https://..." spellcheck="false">
      <p class="hint">Must be an https address on a public site. This copy will not fetch anything else.</p>
      <label for="n-auth">Who issued it?</label>
      <input id="n-auth" placeholder="City Auditor, Public Works Department, a named newspaper">
      <p class="hint">Who issued the document and how faithfully it was captured are two separate
      claims. Both get recorded, and neither stands in for the other.</p>
      <label style="display:flex;gap:8px;align-items:flex-start;font-weight:400;margin-top:14px">
        <input type="checkbox" id="n-arch" style="width:auto;margin-top:4px">
        <span>Also ask a public web archive to keep its own copy.
        <span class="dim">This is stronger evidence, because an archive nobody in this group controls
        can show what the page said. It is also public: anyone watching that archive can see that
        someone asked for this page. Leave it off if being seen to look would matter.</span></span>
      </label>
    </div>
  </div>
  <!-- UI-19 / REC-23: WHO THIS IS ADDRESSED TO. An action reaches outside this
       group and touches somebody who never agreed to be in it, so the record
       either names them or says plainly that it does not know yet. TWO options
       and no third, and NOTHING PRESELECTED - a default here would be this page
       answering the question on the member's behalf, which is the placeholder
       defect one field down and in a nicer coat. -->
  <div id="n-act">
    <div class="card">
      <p style="margin:0 0 10px"><b>Who is this addressed to?</b> An action asks something of somebody
      outside this group. The record either names them, or states that it does not know yet and says
      what is known so far. There is no third answer and nothing is filled in for you.</p>
      <label style="display:flex;gap:8px;align-items:flex-start;font-weight:400">
        <input type="radio" name="n-cp" id="n-cp-named" value="named" style="width:auto;margin-top:4px">
        <span>A named counterparty: an office</span></label>
      <!-- R24 (N235; actions R9, jurisdictions R24): a named counterparty is an OFFICE, stated by its official role
           and the body it belongs to, never a bare name and never a person. The level is optional and nothing is
           preselected: its words are the product's vocabulary of an office's level, injected, never written here. -->
      <div id="n-cp-name-box" hidden style="margin:6px 0 10px 26px">
        <label for="n-cp-role">The office: its official role</label>
        <input id="n-cp-role" placeholder="Clerk, Auditor, Director of Public Works">
        <label for="n-cp-body">The body that office belongs to</label>
        <input id="n-cp-body" placeholder="the council, the county, a named department">
        <label for="n-cp-level">Its level of government (optional)</label>
        <select id="n-cp-level"><option value="">Not stated</option>${COUNTERPARTY_LEVELS_OPTIONS}</select>
        <p class="hint">An office, never a person: whoever holds the role is reached through the role.</p>
      </div>
      <label style="display:flex;gap:8px;align-items:flex-start;font-weight:400">
        <input type="radio" name="n-cp" id="n-cp-undet" value="undetermined" style="width:auto;margin-top:4px">
        <span>Not determined yet, and here is why</span></label>
      <div id="n-cp-basis-box" hidden style="margin:6px 0 10px 26px">
        <label for="n-cp-basis">What is known so far, and what would settle it</label>
        <textarea id="n-cp-basis" rows="4"></textarea>
      </div>
      <p class="hint">This action will not be sent while this is undetermined.</p>
    </div>
    <!-- D-483 / D-182 (BIO_Case_Making_v0_1.md section 2, RULED by BOB #21): THE RISK TIER, ASKED
         RATHER THAN ASSUMED. This page wrote risk_tier: undetermined because it had no control to
         ask with, which is honest and is also a missing affordance: a member who HAS assessed the
         action had no way to say so here. The control is that way round and no further - NOTHING IS
         PRESELECTED, because a preselected tier is this page assessing legal exposure on the
         member's behalf, which is the overclaim D-182 exists to have removed. Leaving it alone still
         writes undetermined.
         THE CHOICES AND THEIR WORDS ARE NOT WRITTEN HERE. They are rendered from the injected
         vocabulary below (REC-38's pattern, as the counterparty pair is not): a tier's MEANING is
         the sentence, so a surface that wrote its own three labels would be deciding what 2 means.
         The container is empty in the source on purpose - if the vocabulary ever stops arriving, a
         member is offered nothing rather than offered a stale copy of it. -->
    <div class="card" id="n-risk">
      <p style="margin:0 0 10px"><b>How risky is it to file this?</b> This is the one field on an
      action that carries legal exposure, so only a member can set it and nothing is filled in for
      you. Choose one if you have assessed it, and leave it alone if you have not.</p>
      <div id="n-risk-choices"></div>
      <p class="hint" id="n-risk-unset"></p>
    </div>
  </div>
  <div class="actions" style="margin-top:16px"><button id="n-save">Create it</button></div>
  <p class="err" id="n-err"></p>
</section>

<section id="s-edit">
  <p class="crumb"><a class="crumb-home">This copy</a> &rsaquo; <a id="e-back">Record</a> &rsaquo; Edit</p>
  <h1>Revise this</h1>
  <p class="small">Saving adds a revision. The version you are replacing stays in
  the history forever; nothing is overwritten and nothing is lost.</p>
  <div class="card"><div class="kv"><span class="k">Record</span><span class="v mono" id="e-id"></span></div></div>
  <label for="e-body">The record</label>
  <textarea id="e-body" rows="20" spellcheck="false"></textarea>
  <div class="actions" style="margin-top:16px"><button id="e-save">Save a revision</button></div>
  <p class="err" id="e-err"></p>
</section>

<section id="s-inbox">
  <p class="crumb"><a class="crumb-home">This copy</a> &rsaquo; Inbox</p>
  <h1>The inbox</h1>
  <p class="small">Material left by people outside the group. Nothing here is part
  of the record, and nothing here has been examined. Treat every item as
  unverified until the group has checked it.</p>
  <div id="inbox-body"><p class="small">Loading&hellip;</p></div>
</section>

<section id="s-members">
  <p class="crumb"><a class="crumb-home">This copy</a> &rsaquo; Members</p>
  <h1>Members and keys</h1>
  <p class="small">Members sign in with a handle they choose and a password they
  choose. You assign each one a cover, which is the label you tell them apart by
  and is not a legal name. Only administrators see cover and handle together, and
  publishing the pairing is a separate decision either of you can make. Registered
  keys are what allow a member to publish; a password alone never can.</p>
  <h2>Members</h2>
  <div class="card" id="m-list"></div>
  <label for="m-id">Add a member: the name they will sign in with</label>
  <input id="m-id">
  <p class="hint">Lowercase, no spaces. Anything you type is tidied to fit.</p>
  <label for="m-name">A cover to tell them apart by</label>
  <input id="m-name">
  <p class="hint">This is a label for your own use, not a legal name, and it is not
  a form to fill in truthfully. "The CPA from Tuesday" and "volunteer-7" are as
  valid as anything else. Only administrators ever see it, and only they can see
  which handle it belongs to. If your group is working under any real pressure,
  choose covers that would tell an outsider nothing.</p>
  <div class="actions" style="margin-top:12px"><button id="m-add">Invite them</button></div>
  <p class="err" id="m-err"></p>
  <div id="m-invite"></div>
  <h2>Registered keys</h2>
  <div class="card" id="k-list"></div>
  <div class="card">
    <p style="margin:0 0 10px"><b>Where a key comes from.</b> Each member makes their own
    on this copy's signing page. It runs entirely in their browser and sends nothing
    anywhere. It gives them two things: a private key they keep, and a public key they
    hand to you for this box. You cannot sign anything with what goes in this box, which
    is why it is safe to email it or read it aloud.</p>
    <p style="margin:0"><a class="filelink" id="k-open" href="/sign" target="_blank" rel="noopener">Open the signing page</a>
    &middot; on it, press <b>Generate my keys</b>, then copy the <b>ratification</b> public key.</p>
  </div>
  <label for="k-key">Their ratification public key</label>
  <textarea id="k-key" rows="3" spellcheck="false"></textarea>
  <p class="hint">One line. It starts with <span class="mono">ssh-ed25519</span> and ends with
  <span class="mono">bio-ratify</span>.</p>
  <div id="k-read"></div>
  <label for="k-who">Belongs to which member</label>
  <input id="k-who">
  <div class="actions" style="margin-top:12px"><button id="k-add">Register this key</button></div>
  <p class="err" id="k-err"></p>
</section>

<section id="s-enroll">
  <h1>Join this group</h1>
  <p id="en-lede">You were invited. Choose the name the record will show, and a password.</p>
  <div class="card" id="en-who" hidden></div>
  <label for="en-handle">Your handle</label>
  <input id="en-handle" spellcheck="false" placeholder="lowercase letters, digits and dashes">
  <p class="hint">This is what the record shows: the author of anything you write, and the
  name other members see. It is yours, not the label the administrator used to invite you.</p>
  <label for="en-pw">Choose a password (12 characters or more)</label>
  <input id="en-pw" type="password" autocomplete="new-password">
  <div class="actions" style="margin-top:12px"><button id="en-go">Set it</button></div>
  <p class="err" id="en-err"></p>
</section>

</main>
<script>
const $ = (s)=>document.querySelector(s);
const show = (id)=>{document.querySelectorAll("section").forEach(x=>x.classList.remove("on"));$(id).classList.add("on");};
const api = async (op, body)=>{
  const r = await fetch("/api/?op="+op, body ? {method:"POST",body:JSON.stringify(body)} : undefined);
  return r.json();
};
let boot0 = null;
async function state(){
  /* The wizard hands over with the one-time password in the URL fragment.
     Fragments never reach any server. Strip it immediately either way. */
  const inv = location.hash.match(/invite=([^&]+)/);
  if (inv) {
    /* An invited member arrives by link. The code rides the fragment, which
       never reaches any server, and is stripped immediately either way. The
       screen this reveals existed since 0.4.0 with nothing able to show it
       (DEBT D-14). */
    /* The token IS the credential and carries nothing else. The previous link
       was memberId:code, so anyone who saw a leaked or archived one learned who
       had been invited. */
    INVITE = decodeURIComponent(inv[1]);
    history.replaceState({}, "", location.pathname);
    const look = await api("invitelook", { invite: INVITE });
    if (!look.result || !look.result.ok) {
      $("#en-lede").textContent = "This invitation link is not live. An invitation is used up the "
        + "moment someone joins with it. Ask whoever invited you for a new one.";
      document.querySelectorAll("#s-enroll label, #s-enroll input, #s-enroll .hint, #en-go")
        .forEach((x) => { x.hidden = true; });
      show("#s-enroll"); return;
    }
    const w = look.result;
    $("#en-who").hidden = false;
    $("#en-who").innerHTML = '<div class="kv"><span class="k">Invited as</span><span class="v">'
      + escH(w.cover) + '</span></div>'
      + '<div class="kv"><span class="k">Role</span><span class="v">' + escH(w.role) + '</span></div>'
      + '<div class="kv"><span class="k">You can</span><span class="v">'
      + escH((w.capabilities || []).join(", ") || "read") + '</span></div>';
    show("#s-enroll"); return;
  }
  const m = location.hash.match(/boot=([^&]+)/);
  if (m) boot0 = decodeURIComponent(m[1]);
  if (location.hash) history.replaceState({}, "", location.pathname);
  try {
    const saved = JSON.parse(sessionStorage.getItem("bio-session") || "null");
    if (saved && saved.t && (!saved.e || saved.e > Date.now())) {
      SESSION = saved.t;
      WHO = saved.w || "admin";
      const probe = await fetch("/api/?op=stats&token="+saved.t);
      if (probe.ok) {
        const b2 = await api("bootstrap");
        window.__ver = b2.version || "";
        panel({ token: saved.t, expires: saved.e }, saved.c || b2.consumedAt);
        return;
      }
      SESSION = null; sessionStorage.removeItem("bio-session");
    }
  } catch {}
  let b;
  try { b = await api("bootstrap"); }
  catch(e){ $("#s-loading h1").textContent = "This copy is not answering";
    $("#s-loading .small").textContent = "The page loaded but the record behind it did not respond. Wait a moment and reload."; return; }
  window.__ver = b.version || "";
  if (b.claimed) { show("#s-login"); return; }
  if (!b.bootstrapConfigured) { show("#s-unarmed"); return; }
  if (b.rearmed) $("#rearm-note").hidden = false;
  if (boot0) $("#boot").value = boot0;
  show("#s-claim");
}
$("#do-claim").addEventListener("click", async ()=>{
  const e = $("#claim-err"); e.textContent = "";
  const bootstrapToken = $("#boot").value.trim();
  const p1 = $("#pw1").value, p2 = $("#pw2").value;
  if (!bootstrapToken) { e.textContent = "The one-time password is empty."; return; }
  if (p1.length < 12) { e.textContent = "The password needs at least 12 characters."; return; }
  if (p1 !== p2) { e.textContent = "The two passwords do not match."; return; }
  $("#do-claim").disabled = true;
  try {
    const r = await api("claim", { bootstrapToken, password: p1 });
    if (r.error) { e.textContent = r.error + "."; return; }
    if (r.result && r.result.ok === false) {
      e.textContent = r.result.reason === "ALREADY_CLAIMED"
        ? "This copy was already claimed. If that was not you, replace ADMIN_TOKEN in the Cloudflare dashboard and reload."
        : "Refused: " + r.result.reason;
      return;
    }
    const l = await api("login", { role: "admin", password: p1 });
    panel(l.result, r.result.consumedAt);
  } catch(err){ e.textContent = "The claim did not go through: " + err.message; }
  finally { $("#do-claim").disabled = false; }
});
$("#do-login").addEventListener("click", async ()=>{
  const e = $("#login-err"); e.textContent = "";
  $("#do-login").disabled = true;
  try {
    const who = $("#lwho").value.trim();
    const role = who ? "member:" + who : "admin";
    const l = await api("login", { role, password: $("#lpw").value });
    /* REC-41, 2026-08-05. THIS BRANCH WAS THE DISCLOSURE, not a courtesy.
       It read the refusal's reason code and answered NO_SUCH_ROLE with "No
       member by that name has set a password on this copy yet." — which told
       any anonymous visitor, on the instance's own front door and in plainer
       words than the plane itself used, whether a guessed name holds a
       credential here. op=login's two codes are now one (SIGN_IN_REFUSED) and
       there is nothing left to branch on; this renders the plane's own
       sentence, which names both possibilities and says the record does not
       report which. DEC-8: a surface renders what it received and never
       composes a refusal of its own. The fallback is kept for a refusal that
       somehow arrives without a detail, and it is deliberately the LESS
       specific of the two old strings. */
    if (!l.result || !l.result.ok) {
      e.textContent = (l.result && l.result.detail)
        || "That name and password were not accepted."; return; }
    WHO = who || "admin";
    const b = await api("bootstrap");
    panel(l.result, b.consumedAt);
  } catch(err){ e.textContent = "Sign-in did not go through: " + err.message; }
  finally { $("#do-login").disabled = false; }
});
let SESSION = null;
let WHO = "admin";
/* Membership Architecture v2 section 5: a capability a member does not hold is
   ABSENT from their interface, not present and refused. The plane refuses it
   too, because a hidden control is a courtesy and not a boundary, but the
   absence is the part section 5 actually asks for.

   Read from op=whoami rather than kept as a second copy of the rules here. A
   copy would drift, and the one that drifted would be this one. Starts EMPTY so
   a failed or in-flight whoami hides everything rather than showing controls
   that will refuse: fail closed. */
let CAPS = new Set();
const can = (c)=>CAPS.has(c);
/* R23: whether this session ADMINISTERS, as op=whoami reports it (the founder and every enrolled administrator),
   never inferred from the name signed in with. Starts false, so the members section is absent until whoami says. */
let ADMIN = false;
let INVITE = null;
/* Everything section 5 hides, in ONE place, so a control cannot be added later
   in a screen that forgot to ask. Called before whoami answers as well as after,
   so the window between showing the panel and hearing back shows nothing the
   member may not use. */
function applyCaps(){
  $("#go-new").hidden = !can("contribute");
  $("#go-members").hidden = !ADMIN;
  const t = $("#n-type");
  if (t) for (const o of t.options) if (o.value === "project") o.hidden = !can("create_projects");
}

function panel(login, claimedAt){
  if (login && login.token) {
    SESSION = login.token;
    try { sessionStorage.setItem("bio-session", JSON.stringify({ t: login.token, e: login.expires || 0, c: claimedAt || "", w: WHO })); } catch {}
  }
  ADMIN = false;
  applyCaps();
  rec("whoami").then((r)=>{
    CAPS = new Set(r && r.result && Array.isArray(r.result.capabilities) ? r.result.capabilities : []);
    ADMIN = !!(r && r.result && r.result.administer === true);
    applyCaps();
    openProfiles();
    openAssistant();
  }).catch(()=>{ CAPS = new Set(); ADMIN = false; applyCaps(); openProfiles(); openAssistant(); });
  $("#panel-lede").textContent = WHO === "admin"
    ? "Signed in as administrator." : "Signed in as " + WHO + ".";
  $("#p-version").textContent = window.__ver || "unknown";
  $("#p-claimed").textContent = claimedAt ? new Date(claimedAt).toLocaleString() : "just now";
  $("#p-roles").textContent = WHO;
  $("#p-expires").textContent = login && login.expires ? new Date(login.expires).toLocaleString() : "";
  show("#s-panel");
}

/* ---- the record, read-only through the signed-in session ---- */
const rec = async (op, params={})=>{
  const q = new URLSearchParams({ op, token: SESSION, ...params });
  const r = await fetch("/api/?"+q.toString());
  if (r.status === 401) { SESSION = null; try{sessionStorage.removeItem("bio-session");}catch{}; show("#s-login"); throw new Error("signed out"); }
  return r.json();
};
const escH = (x)=>String(x??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const TYPES = [["information","Information"],["inquiry","Questions"],["project","Projects"],["action","Actions"]];
const fmtWhen = (iso)=>{ const d=new Date(iso); return isNaN(d)?escH(iso):d.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"}); };
const chip = (st)=>'<span class="chip '+escH(st)+'">'+escH(st)+"</span>";

async function openBrowse(){
  show("#s-browse");
  let list;
  try { list = (await rec("list")).result || []; } catch { return; }
  const by = {};
  for (const b of list) (by[b.object_type] ||= []).push(b);
  $("#browse-summary").textContent = list.length + " records. Everything below is read-only; the record can only be changed through the gated tools.";
  let html = "";
  for (const [t, label] of TYPES){
    const rows = by[t] || []; delete by[t];
    if (!rows.length) continue;
    html += "<h2>"+label+" ("+rows.length+")</h2><table class=\\"rec\\"><tr><th>Record</th><th>State</th><th>Updated</th></tr>";
    for (const b of rows)
      html += '<tr class="row" data-id="'+escH(b.bundle_id)+'"><td><span class="bid">'+escH(b.bundle_id)+'</span><br><span class="dim">'+escH(b.title||"")+"</span></td><td>"+chip(b.current_state)+"</td><td class=\\"dim\\">"+fmtWhen(b.last_updated)+"</td></tr>";
    html += "</table>";
  }
  for (const t of Object.keys(by)){
    html += "<h2>"+escH(t)+" ("+by[t].length+")</h2><table class=\\"rec\\">";
    for (const b of by[t]) html += '<tr class="row" data-id="'+escH(b.bundle_id)+'"><td><span class="bid">'+escH(b.bundle_id)+"</span></td><td>"+chip(b.current_state)+"</td><td class=\\"dim\\">"+fmtWhen(b.last_updated)+"</td></tr>";
    html += "</table>";
  }
  $("#browse-body").innerHTML = html || "<p>The record is empty.</p>";
  document.querySelectorAll("#browse-body tr.row").forEach(r=>r.addEventListener("click",()=>openBundle(r.dataset.id)));
}

/* Frontmatter split and a small, honest markdown rendering: headings, bold,
   lists, code spans, paragraphs. Anything else stays visible as written. */
function splitFm(text){
  const m = /^---\\n([\\s\\S]*?)\\n---\\n?/.exec(text);
  if (!m) return { fm:{}, body:text };
  const fm = {};
  for (const line of m[1].split("\\n")){
    const kv = /^([A-Za-z_][A-Za-z0-9_]*):\\s*(.*)$/.exec(line);
    if (kv) fm[kv[1]] = kv[2].replace(/^"|"$/g,"");
  }
  return { fm, body:text.slice(m[0].length) };
}
function mdRender(md){
  const lines = md.split("\\n");
  let out = "", inList = false, para = [];
  const flush = ()=>{ if (para.length){ out += "<p>"+inline(para.join(" "))+"</p>"; para=[]; } };
  const endList = ()=>{ if (inList){ out += "</ul>"; inList=false; } };
  const inline = (t)=>escH(t).replace(/\\*\\*([^*]+)\\*\\*/g,"<b>$1</b>").replace(/\`([^\`]+)\`/g,"<code>$1</code>");
  for (const raw of lines){
    const l = raw.replace(/\\s+$/,"");
    if (/^###\\s+/.test(l)){ flush(); endList(); out += "<h3>"+inline(l.replace(/^###\\s+/,""))+"</h3>"; }
    else if (/^##\\s+/.test(l)){ flush(); endList(); out += "<h2>"+inline(l.replace(/^##\\s+/,""))+"</h2>"; }
    else if (/^[-*]\\s+/.test(l)){ flush(); if(!inList){ out += "<ul>"; inList=true; } out += "<li>"+inline(l.replace(/^[-*]\\s+/,""))+"</li>"; }
    else if (l === ""){ flush(); endList(); }
    else para.push(l);
  }
  flush(); endList();
  return out;
}

let CURRENT = { id:null, img:null };
async function openBundle(id){
  show("#s-bundle");
  $("#crumb-id").textContent = id;
  $("#b-title").textContent = id;
  $("#b-facts").innerHTML = ""; $("#b-md").innerHTML = "<p class=\\"small\\">Loading&hellip;</p>";
  $("#b-files").innerHTML = ""; $("#b-history").innerHTML = "";
  let img;
  try { img = (await rec("image", { id })).result; } catch { return; }
  if (!img){ $("#b-md").innerHTML = "<p>This record was not found.</p>"; return; }
  CURRENT = { id, img };
  renderBundle(id, img, null);
}
/* R25 (D-719; State Rules section 6): the history reads in WRITE order, never the caller-chosen snap key, whose
   lexical order is not a clock. The image carries each entry's write-order rank as seq; when EVERY entry carries a
   distinct integer one the list follows it, else it is listed by key and the page says which order it shows. */
function historyOrder(raw){
  const list = Array.isArray(raw) ? raw.filter(e=>e && typeof e === "object") : [];
  const seqs = list.map(e=>e.seq);
  const write = list.length > 0 && seqs.every(v=>Number.isSafeInteger(v)) && new Set(seqs).size === list.length;
  return write ? { order:"write", entries: list.slice().sort((a,b)=>a.seq-b.seq) }
    : { order:"key", entries: list.slice().sort((a,b)=>String(a.key).localeCompare(String(b.key))) };
}
function renderBundle(id, img, revisionKey){
  const liveText = typeof img["bundle.md"] === "string" ? img["bundle.md"] : "";
  /* Canonical snapshot path: the key lives in the filename, not a directory. */
  const revPath = revisionKey ? "_history/bundle_"+revisionKey+".md" : null;
  const revText = revPath && typeof img[revPath] === "string" ? img[revPath] : null;
  const { fm, body } = splitFm(revText ?? liveText);
  $("#b-title").textContent = fm.title || id;
  const facts = [["State", fm.current_state ? chip(fm.current_state) : ""],
    ["Last updated", fm.last_updated ? fmtWhen(fm.last_updated) : ""],
    ["Created", fm.created ? fmtWhen(fm.created) : ""],
    ["Criticality", escH(fm.criticality||"")]]
    .filter(([,v])=>v);
  $("#b-facts").innerHTML = facts.map(([k,v])=>'<div class="kv"><span class="k">'+k+'</span><span class="v">'+v+"</span></div>").join("");
  $("#b-md").innerHTML =
    (revText !== null ? '<div class="revnote">Viewing a historical revision ('+escH(revisionKey)+'). <button class="histbtn" id="back-live">Back to the live record</button></div>' : "")
    + mdRender(body);
  const bl = $("#back-live"); if (bl) bl.addEventListener("click",()=>renderBundle(id, img, null));
  ratifyPanel(id, liveText, revText !== null);

  const files = Object.keys(img).filter(k=>!k.startsWith("_history/")).sort();
  $("#b-files").innerHTML = files.map(k=>{
    const v = img[k];
    if (typeof v === "string")
      return '<div class="kv"><span class="k">'+escH(k)+'</span><span class="v dim">'+v.length.toLocaleString()+" chars</span></div>";
    const dl = k.split("/").pop();
    return '<div class="kv"><span class="k">'+escH(k)+'</span><span class="v"><a class="filelink" href="/api/?op=capture&sha256='+escH(v.blobSha||v.sha256)+"&token="+encodeURIComponent(SESSION)+"&dl="+encodeURIComponent(dl)+'">download</a> <span class="dim mono">'+escH((v.sha256||v.blobSha||"").slice(0,12))+"&hellip;</span></span></div>";
  }).join("") || "<p class=\\"small\\" style=\\"margin:0\\">No files.</p>";

  let entries = [];
  try { entries = JSON.parse(img["_history/manifest.json"]||"{}").entries || []; } catch {}
  const hist = historyOrder(entries);
  entries = hist.entries;
  $("#b-history").innerHTML = (entries.length ? '<p class="small" style="margin-top:0">'
    + (hist.order === "write" ? "Listed in the order they were written, oldest first."
      : "Listed by snapshot key: this copy of the record does not carry the order they were written, and key order is not necessarily the order they were written.")
    + "</p>" : "") + entries.map(e=>{
    const viewable = typeof img["_history/bundle_"+e.key+".md"] === "string";
    return '<div class="kv"><span class="k mono">'+escH(e.key)+'</span><span class="v">'
      + escH(e.kind||"") + " by " + escH(e.author||"unknown") + ' <span class="dim">' + fmtWhen(e.created) + "</span> "
      + (viewable ? '<button class="histbtn" data-rev="'+escH(e.key)+'">view</button>' : "")
      + "</span></div>";
  }).join("") || "<p class=\\"small\\" style=\\"margin:0\\">Created in a single revision; nothing has been superseded.</p>";
  document.querySelectorAll("#b-history .histbtn[data-rev]").forEach(x=>x.addEventListener("click",()=>renderBundle(id, img, x.dataset.rev)));
  document.querySelector("main").classList.add("wide");
}
$("#go-browse").addEventListener("click", openBrowse);
$("#crumb-panel").addEventListener("click", ()=>{document.querySelector("main").classList.remove("wide");show("#s-panel");});
$("#crumb-panel2").addEventListener("click", ()=>{document.querySelector("main").classList.remove("wide");show("#s-panel");});
$("#crumb-browse").addEventListener("click", openBrowse);

/* ---- publishing: the one action a password alone cannot take ----
   Ratifying copies this exact revision into the published record, where
   anyone can check a hash against it. It needs a signature made with a
   registered key, so the authority to publish is held by people, not by
   whoever is holding a session. */
async function ratifyPanel(id, liveText, historical){
  const box = $("#b-ratify");
  if (historical) { box.innerHTML = ""; return; }
  /* No publish capability, no publish surface. Before this the panel was drawn
     for everyone and the member was stopped at the end of it, by the absence of
     a signing key rather than by the capability, which is the key doing the
     capability's job. */
  if (!can("publish")) { box.innerHTML = ""; return; }
  const sha = await sha256Text(liveText);
  box.innerHTML = "<h2>Publish this</h2>"
    + '<p class="small">Publishing puts this revision where the public can verify it by hash. '
    + "It cannot be undone: a published hash answers forever, even after later revisions.</p>"
    + '<div class="card"><div class="kv"><span class="k">Record</span><span class="v mono">'+escH(id)+"</span></div>"
    + '<div class="kv"><span class="k">This revision</span><span class="v mono">'+escH(sha)+"</span></div></div>"
    + '<p class="small">Open the <a class="filelink" href="/sign" target="_blank" rel="noopener">signing page</a>, '
    + "unlock your key, choose Sign a ratification, paste in those two values, and paste what it "
    + "hands back into the box below.</p>"
    + '<textarea id="r-sig" rows="6" spellcheck="false" placeholder="-----BEGIN SSH SIGNATURE-----"></textarea>'
    + '<div class="actions" style="margin-top:12px"><button id="r-go">Publish it</button>'
    + ' <button id="r-edit">Revise instead</button></div><p class="err" id="r-err"></p>';
  $("#r-edit").addEventListener("click", ()=>openEdit(id, liveText));
  $("#r-go").addEventListener("click", async ()=>{
    const e = $("#r-err"); e.textContent = "";
    const sig = $("#r-sig").value.trim();
    if (!sig) { e.textContent = "Paste the signature from the signing page."; return; }
    $("#r-go").disabled = true;
    try {
      const r = await post("ratify", { bundleId: id, expectedSha: sha, sig });
      if (r.ok) {
        box.innerHTML = '<div class="okbox"><p style="margin:0">Published, attested by '
          + escH(r.attestor||"a registered key") + ". " + escH(r.published.shas)
          + " hashes are now publicly verifiable.</p></div>";
        return; }
      e.textContent = ratifyWhy(r);
    } catch(err){ e.textContent = "That did not go through: " + err.message; }
    finally { const g=$("#r-go"); if (g) g.disabled = false; }
  });
}
function ratifyWhy(r){
  const why = r.reason || r.error || "unknown";
  if (why === "RATIFY_STALE") return "Someone saved a newer revision while you were signing. Reload this record and sign the new hash.";
  if (why === "NO_SIGNERS") return "No keys are registered on this copy yet, so nothing can be published. An administrator registers keys under Members and keys.";
  if (why === "SIG_UNKNOWN_KEY") return "That signature was made with a key this group has not registered, or one that has been revoked.";
  if (why === "SIG_BAD_SIGNATURE") return "That signature does not match this record and hash. Sign the exact values shown above.";
  if (why === "SIG_NAMESPACE") return "That signature was made for something other than ratification. Use the Sign a ratification tab.";
  if (why === "MALFORMED") return "That does not look like a signature. Copy the whole block, including the BEGIN and END lines.";
  if (why === "GATE_REFUSED") return "The checks refused this record: "
    + (r.findings||[]).map(f=>f.check + (f.where ? " (" + f.where + ")" : "")).join(", ")
    + ". Publishing is blocked until those are fixed.";
  return "Refused: " + why;
}

/* ---- intake: writing into the working record from this page ----
   Every write below goes through the same gated API a machine caller uses.
   Authorship is stamped by the server from the session, so nothing typed
   here can claim to be someone else. */
const NL = String.fromCharCode(10);
const PREFIX = { information:"INFO", inquiry:"INQ", focus:"FOCUS", problem:"PROB", project:"PROJ", action:"ACTN" };
/* From the record grammar's tables (record-grammar R32, R35), not from memory. */
const FIRST_STATE = ${FIRST_STATE_JSON};
const HEADINGS = ${HEADINGS_JSON};
/* information@1 for typed intake, deliberately. The @2 contract makes the
   intake provenance register mandatory (C-18.1), and a register describes
   captured DOCUMENTS: locator, authority, capture method, grade, hash. A member
   typing what they know has no document, so @2 would demand a register with
   nothing honest to put in it. Material arriving WITH a document is @2 and
   carries custody, which is the capture path (PLAN.md S-5), not this one. */
/* information@1 for a member writing down what they know, because the @2
   contract makes the intake provenance register mandatory and a register
   describes captured DOCUMENTS. The moment a document IS captured the bundle is
   @2 and carries the register, which is the honest distinction rather than a
   version preference. */
const SCHEMA_OF = { information:"information@1", inquiry:"inquiry@1", focus:"focus@1", problem:"problem@1", project:"project@1", action:"action@1" };
const schemaFor = (type, hasDoc)=> type === "information" && hasDoc ? "information@2" : SCHEMA_OF[type];
const post = async (op, body)=>{
  const r = await fetch("/api/?op="+op+"&token="+encodeURIComponent(SESSION),
    { method:"POST", body: JSON.stringify(body) });
  if (r.status === 401) { SESSION=null; try{sessionStorage.removeItem("bio-session");}catch{}; show("#s-login"); throw new Error("signed out"); }
  return r.json();
};
const sha256Text = async (text)=>{
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,"0")).join("");
};
/* REC-178: a file's bytes is the length of its UTF-8 encoding, never text.length (UTF-16 units). The plane
   computes it over what it holds and stores that; this sends the same figure. */
const utf8Len = (text)=> new TextEncoder().encode(text).length;
const stamp = ()=>{
  const d = new Date().toISOString().replace(/[-:]/g,"").split(".")[0] + "Z";
  let r = ""; const h = "0123456789abcdef";
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  for (const x of bytes) r += h[x>>4] + h[x&15];
  return d + "_" + r;
};
/* A conformant bundle.md. Fifteen core fields, because C-2.2 fires once per
   missing one and the previous version wrote four; the canonical heading set for
   the type, because C-3.1 refuses both a missing heading and an unexpected one;
   and the per-type extension fields each type's own check requires. The first
   prose section carries what the member wrote, and the rest are present and
   empty, which is what the catalog asks for. */
const mdFor = (id, type, state, title, body, now, hasDoc, src, act)=>{
  /* REC-141: a PROJECT's id is minted by the plane, which writes it into these bytes and refuses
     bytes already carrying one, so a project's document is sent with no id line (id is null). */
  /* D-436: and NO group line, for the same kind of reason. The producing group is the instance's
     one recorded value, and the plane writes it into every document it creates; this page wrote a
     literal slug here, true of one instance and false of every other. On a copy that records no
     group yet, the plane refuses the save by name (C-64.1) rather than supply one. */
  const fm = ["---",...(id === null ? [] : ["id: "+id]),"object_type: "+type,"schema: "+schemaFor(type, hasDoc),
    "title: "+JSON.stringify(title),"current_state: "+state,"prior_state: null",
    "created: "+now,"last_updated: "+now,
    "produced_by:","  mode: assisted","  capability_tier: session",
    "references: []","state_history: []",
    "annotations_open: 0","reeval_pending:","  flag: false","  since: null",
    "  source: null","visuals: []"];
  if (type === "information") fm.push(
    "criticality: supporting","source_status: unchanged",
    /* D-62: the captured document's own hash, in the frontmatter, because C-2.7
       makes a well-formed content_hash an ENTRY REQUIREMENT for verified and the
       release flow reads the frontmatter and nothing else. Found live: this
       mdFor omitted it even when a document was attached, so the first bundle a
       member wrote with a capture could never have been released, and its bytes
       were unfindable through the search layer's hash: facet, which reads this
       field (defeating the D-60 duplicate detection). Absent for typed intake,
       where there is no document and inventing one would be a lie. */
    ...(src && src.content_hash ? ["content_hash: sha256:"+src.content_hash] : []),
    "source:","  locator: in hand","  authority: member-entered","  retrieved: "+now,
    "monitoring:","  enabled: false","  frequency: none");
  if (type === "inquiry" || type === "focus" || type === "problem") fm.push(
    "surfaced_by: human","recheck_triggers:","  - text: Revisit this",
    "    description: A member set no specific trigger at creation; replace this with a real one.");
  if (type === "project") fm.push("objective: "+JSON.stringify(title));
  /* D-130 / REC-23 / UI-19, 2026-08-05. The counterparty placeholder used to be
     pushed here too - D-130 named only civicos-ui/app.html, this was the SECOND
     emission site - and REC-23 took it out, leaving the field ABSENT and the
     gate naming the gap. UI-19 gives
     this page the radio pair, so the value arrives FROM THE MEMBER through
     act.counterparty and nothing here invents one.

     CALLED WITHOUT act THIS ARM STILL WRITES NO COUNTERPARTY, permanently and
     on purpose: a bundle written by a caller that collected no answer draws
     exactly C-2.10, which is the honest one error, and the R24 test in
     test/m/instance-setup/page.test.mjs asserts BOTH directions so a future
     default cannot pass by inventing one.

     action_kind is "other" HERE ONLY, and it is not a chooser this page hides:
     "other" is the catalog's own token for an ask that is not one of the named
     kinds, which is exactly what a page offering no kind control has been told.
     The app's intake reads the published action_kind vocabulary and lets the
     member say; this page is the installer's minimal intake and does not.
     risk_tier is WRITTEN undetermined (D-182, BOB #21): this page asks no
     tier, so no member stated one, and the old default of 1 told a member the
     action was safe to file freely when nobody had assessed it. Only a
     member's authored act sets 1, 2 or 3; the words are the plane's, published
     as vocabularies.risk_tiers.
     (No backticks in this comment: it lives inside the SETUP_HTML template
     literal, and a stray pair here parses fine under node --check and then
     fails at Miniflare's module parse. CLAUDE.md's trap, met again.) */
  if (type === "action") {
    /* D-483: the tier the member chose, or undetermined when they chose none - and undetermined is
       WRITTEN either way, never omitted, because an absent key and a stated undetermined must read
       the same and only one of them says so in the bytes. riskTierState is the plane's own reader
       (injected above), so what is written here is what the plane will read back. */
    const tier = riskTierState(act && act.risk_tier !== null && act.risk_tier !== undefined
      ? act.risk_tier : undefined);
    fm.push("action_kind: other","risk_tier: " + (tier === null ? "undetermined" : tier));
    const cp = act && act.counterparty;
    /* The state the member chose is written even when the field beside it is
       empty: a member who answered "not determined yet" and wrote nothing has
       left a requirement unmet, and C-2.10 says so precisely. Dropping the
       block would hand them the vaguer refusal for a question they answered. */
    /* R24 (N235): a named counterparty is written as actions R9 requires, an office by its role and body and,
       when the member stated one, its level; never a bare name, which R9 refuses on creation. */
    if (cp && cp.state === "named")
      fm.push("counterparty:","  state: named",
              ...(String(cp.role || "").trim() ? ["  role: " + JSON.stringify(String(cp.role).trim())] : []),
              ...(String(cp.body || "").trim() ? ["  body: " + JSON.stringify(String(cp.body).trim())] : []),
              ...(String(cp.level || "").trim() ? ["  level: " + String(cp.level).trim()] : []));
    else if (cp && cp.state === "undetermined")
      fm.push("counterparty:","  state: undetermined",
              ...(String(cp.basis || "").trim() ? ["  basis: " + JSON.stringify(String(cp.basis).trim())] : []));
  }
  fm.push("---","");
  const heads = HEADINGS[type] || ["## Summary"];
  const out = fm.slice();
  heads.forEach((h,i)=>{ out.push(h,""); if (i===0) out.push(body,""); });
  return out.join(NL);
};

/* The bundle's files, with the captured document beside the record and the
   provenance register naming it. C-18.1 wants the register to point at a file
   that exists in the bundle, so the document is registered as a blob reference
   and the register entry names the same path. */
async function docFiles(text, doc, textSha){
  const files = [{ path:"bundle.md", text, bytes:utf8Len(text), sha256:textSha }];
  if (!doc) return files;
  const prov = JSON.stringify({ documents: [doc] }, null, 1);
  files.push({ path:"data/provenance.json", text: prov, bytes: utf8Len(prov),
               sha256: await sha256Text(prov) });
  if (Array.isArray(doc.parts) && doc.parts.length) {
    /* A parted document has no single file: each part is registered separately
       and the catalog verifies the whole by streaming them. Registering a
       phantom whole would name bytes the store does not hold. */
    for (const p of doc.parts)
      files.push({ path: p.file, blobSha: p.sha256, sha256: p.sha256, bytes: p.bytes });
  } else {
    files.push({ path: doc.file, blobSha: doc.capture.sha256, sha256: doc.capture.sha256,
                 bytes: doc.capture.bytes });
  }
  /* The timestamp token is evidence too, so it lives in the bundle rather than
     only in the store. A token nobody can find is a token nobody will check. */
  for (const a of (doc.attestations || []))
    files.push({ path: a.file, blobSha: a.sha256, sha256: a.sha256, bytes: a.bytes });
  return files;
}
function acquireWhy(a){
  const why = a.reason || a.error || "unknown";
  if (why === "BAD_LOCATOR") return "That address cannot be fetched. It must be an https address on a public site: not a plain http address, not an address on this machine, and not one carrying a username or password.";
  /* D-110: the mapping for a missing-authority refusal was deleted here. D-97
     (0.47.0) removed that refusal: a caller who cannot name the issuing party
     now leaves the capture honestly undetermined rather than being forced to
     invent an authority to get past the door. Explaining a refusal the plane no
     longer makes is a copy of an overturned rule in the surface a member reads,
     so no reason string for it survives — not even in this comment. */
  if (why === "SOURCE_REFUSED") return "The site answered with an error (" + a.status + "). The address may be wrong, or the document may no longer be published there.";
  if (why === "FETCH_FAILED") return "The site could not be reached just now. Nothing was written.";
  if (why === "EMPTY") return "The site returned an empty document, so there was nothing to keep.";
  if (why === "TOO_LARGE") return "That document is too large to capture this way (" + a.bytes + " bytes). Large documents are captured in parts.";
  return "The document could not be captured: " + why;
}

/* ---- create ---- */
/* C-16: a Question has ONE authored field, the question itself. No Title
   control and no second gating field: the title is DERIVED from the question
   (the rule is record-grammar's, R30, and is embedded verbatim below, so
   this page and the store's projection cannot drift), and a gate that
   pressures a member into writing what they do not know is a bug in the
   gate. */
const deriveInquiryTitle = ${deriveInquiryTitle.toString()};
/* D-483: the tier vocabulary and the plane's own reader of it, injected verbatim (the deriveInquiryTitle
   pattern one line up, for its reason: the page and the plane cannot drift if they are the same code).
   THE SETTABLE TIERS ARE DERIVED, NOT LISTED. A member may author exactly the values riskTierState reads
   back as themselves; undetermined is not among them, because it is what the record says when NO member
   has stated a tier, and offering it as a choice would let a member author the absence of their own
   assessment. If the catalogue ever grows a fourth tier this control grows with it; if it grew one the
   plane would refuse, this control would not offer it. */
const RISK_TIERS = ${RISK_TIERS_JSON};
const riskTierState = ${riskTierState.toString()};
const SETTABLE_TIERS = Object.keys(RISK_TIERS).filter((k)=> riskTierState(Number(k)) === Number(k));
/* The words are the vocabulary's, escaped because they are rendered as markup and nothing else about
   their provenance makes them safe to interpolate raw. */
const renderRiskTiers = ()=>{
  const box = $("#n-risk-choices");
  if (box) box.innerHTML = SETTABLE_TIERS.map((k)=>
    '<label style="display:flex;gap:8px;align-items:flex-start;font-weight:400">'
    + '<input type="radio" name="n-risk" id="n-risk-' + escH(k) + '" value="' + escH(k)
    + '" style="width:auto;margin-top:4px">'
    + '<span>' + escH(RISK_TIERS[k]) + '</span></label>').join("");
  /* What leaving it alone WILL write, in the plane's sentence for it rather than this page's. */
  const unset = $("#n-risk-unset");
  if (unset) unset.textContent = "Leave this alone and the record will say: " + RISK_TIERS.undetermined;
};
renderRiskTiers();
/* null means NO MEMBER CHOSE, which mdFor writes as undetermined. A value the vocabulary does not hold
   cannot arrive from the control above; if one ever did it would be nobody stating a tier the plane
   accepts, so it reads as no choice here rather than being passed through to the bytes. */
const chosenRiskTier = ()=>{
  const el = $("input[name=n-risk]:checked");
  const st = riskTierState(el ? Number(el.value) : undefined);
  return st === "undetermined" || st === null ? null : st;
};
const syncNewForm = ()=>{
  const t = $("#n-type").value;
  const isQ = t === "inquiry";
  $("#n-title").hidden = isQ; $("#n-title-label").hidden = isQ;
  $("#n-body-label").textContent = isQ ? "What do you want to know?" : "What do you know?";
  /* UI-19: the counterparty pair belongs to an action and to nothing else, and
     a document has no source panel to fill in when it is one. */
  if ($("#n-act")) $("#n-act").hidden = t !== "action";
  if ($("#n-src")) $("#n-src").hidden = t === "action";
  syncCounterparty();
};
/* The pair reveals exactly one field, and only after the member has answered.
   Neither is shown by default, because a visible empty field is a suggestion. */
const syncCounterparty = ()=>{
  const named = $("#n-cp-named") && $("#n-cp-named").checked;
  const undet = $("#n-cp-undet") && $("#n-cp-undet").checked;
  if ($("#n-cp-name-box")) $("#n-cp-name-box").hidden = !named;
  if ($("#n-cp-basis-box")) $("#n-cp-basis-box").hidden = !undet;
};
if ($("#n-cp-named")) $("#n-cp-named").addEventListener("change", syncCounterparty);
if ($("#n-cp-undet")) $("#n-cp-undet").addEventListener("change", syncCounterparty);
$("#n-type").addEventListener("change", syncNewForm);
$("#go-new").addEventListener("click", ()=>{ $("#n-err").textContent=""; syncNewForm(); show("#s-new"); });
$("#n-save").addEventListener("click", async ()=>{
  const e = $("#n-err"); e.textContent = "";
  const type = $("#n-type").value, body = $("#n-body").value.trim();
  const title = type === "inquiry" ? (deriveInquiryTitle(body) || "") : $("#n-title").value.trim();
  if (type === "inquiry") {
    if (!body) { e.textContent = "Ask the question."; return; }
  } else {
    if (!title) { e.textContent = "Give it a title."; return; }
    if (!body) { e.textContent = "Write something in the body."; return; }
  }
  /* UI-19: what THIS FORM has collected, never a rule about the record. C-2.10
     is the rule and it says so in its own words at the gate if anything gets
     past here; all this does is decline to send an action with the question
     unanswered, because an empty control has nothing to send. */
  let act = null;
  if (type === "action") {
    const named = $("#n-cp-named") && $("#n-cp-named").checked;
    const undet = $("#n-cp-undet") && $("#n-cp-undet").checked;
    const role = ($("#n-cp-role") ? $("#n-cp-role").value.trim() : "");
    const office = ($("#n-cp-body") ? $("#n-cp-body").value.trim() : "");
    const level = ($("#n-cp-level") ? $("#n-cp-level").value.trim() : "");
    const bs = ($("#n-cp-basis") ? $("#n-cp-basis").value.trim() : "");
    if (!named && !undet) { e.textContent = "Say who this is addressed to, or that it is not determined yet."; return; }
    if (named && (!role || !office)) { e.textContent = "Name the office: its official role and the body it belongs to."; return; }
    if (undet && !bs) { e.textContent = "Say what is known so far, and what would settle it."; return; }
    /* D-483: the tier goes with the counterparty because both are the member's answers and neither is
       this form's. No refusal beside it: a member who assessed nothing has answered honestly, and a gate
       that stopped them here would press them into stating the one value nobody assessed. */
    act = { counterparty: named ? { state:"named", role, body:office, ...(level ? { level } : {}) } : { state:"undetermined", basis:bs },
            risk_tier: chosenRiskTier() };
  }
  $("#n-save").disabled = true;
  try {
    const year = String(new Date().getFullYear());
    /* REC-141 (Membership v2 section 7): a new project names no id. The plane mints it and answers with
       it; a creation that names one is refused. Every other type still allocates its own. */
    const minted = type === "project";
    const a = minted ? null : await rec("allocid", { prefix: PREFIX[type], year });
    let id = minted ? null : a.result.id + "-" + title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40);
    const state = FIRST_STATE[type];
    const now = new Date().toISOString().split(".")[0] + "Z";
    /* Capture first, because a failed fetch should not leave a half-made bundle
       in the record. If the document cannot be had, nothing is written and the
       member is told what the source did. */
    const loc = ($("#n-loc") ? $("#n-loc").value.trim() : "");
    const auth = ($("#n-auth") ? $("#n-auth").value.trim() : "");
    let doc = null;
    if (loc) {
      if (!auth) { e.textContent = "Say who issued the document as well as where it lives."; return; }
      const acq = await post("acquire", { locator: loc, authority: auth });
      if (!acq.ok) { e.textContent = acquireWhy(acq); return; }
      doc = acq.document;
      /* Co-attestation happens now, while the capture is fresh, because a
         timestamp is a claim about WHEN and one obtained later says less. A
         failure here does not stop the bundle: the attempts are recorded either
         way, and a register showing a failed attempt is a different and more
         honest claim than one showing none. */
      const wantArchive = !!($("#n-arch") && $("#n-arch").checked);
      const att = await post("attest", { sha256: doc.capture.sha256, locator: loc, archive: wantArchive });
      doc.attestation_attempts = (att.attempts || []);
      if (att.attestation) doc.attestations = [att.attestation];
      if (att.archive) doc.co_archive = att.archive;
    }
    const text = mdFor(id, type, state, title, body, now, !!doc,
      doc && doc.capture ? { content_hash: doc.capture.sha256 } : null, act);
    const r = await post("promote", {
      ...(minted ? {} : { bundleId: id }), base: null, snapKey: stamp(), author: WHO,
      meta: { object_type:type, title, current_state:state, created:now, last_updated:now },
      files: await docFiles(text, doc, await sha256Text(text)),
      register: doc ? [...(Array.isArray(doc.parts) && doc.parts.length
                        ? doc.parts.map((p) => ({ sha256: p.sha256, path: p.file,
                                                  encoding: "binary", bytes: p.bytes }))
                        : [{ sha256: doc.capture.sha256, path: doc.file,
                             encoding: doc.capture.encoding, bytes: doc.capture.bytes }]),
                       ...(doc.attestations || []).map((a) => ({
                         sha256: a.sha256, path: a.file, encoding: "binary", bytes: a.bytes }))] : [],
    });
    if (!r.result || !r.result.ok) { e.textContent = "Refused: " + ((r.result&&r.result.reason)||r.error||"unknown"); return; }
    if (minted) id = r.result.bundleId;
    $("#n-title").value = ""; $("#n-body").value = "";
    if ($("#n-loc")) { $("#n-loc").value = ""; $("#n-auth").value = ""; }
    openBundle(id);
  } catch(err){ e.textContent = "That did not go through: " + err.message; }
  finally { $("#n-save").disabled = false; }
});

/* ---- revise ---- */
let EDIT_ID = null;
let EDIT_IMAGE = null;
async function openEdit(id, text){
  EDIT_ID = id; $("#e-err").textContent = "";
  $("#e-id").textContent = id; $("#e-body").value = text;
  show("#s-edit");
}
$("#e-back").addEventListener("click", ()=>openBundle(EDIT_ID));
/* Prepare a revision. Pure, so it can be tested against the check catalog
   without a browser.
 *
 * Three things the catalog requires of any revision, none of which the earlier
 * save path did:
 *   last_updated moves, in the DOCUMENT and not only in the promote metadata,
 *     because C-12.1 and C-13.1 read the frontmatter and nothing else;
 *   created is PRESERVED, because overwriting it with the save time destroys
 *     when the thing was actually created and no history holds it elsewhere;
 *   a Session Log entry is appended, because C-13.2 refuses a bundle whose
 *     last_updated moved with nothing recorded, and C-5.1 refuses one whose
 *     prior entries went missing, so the entry is added rather than replacing.
 */
function reviseText(text, who, now){
  const parts = splitFm(text);
  const lines = text.split(NL);
  let out = [], inFm = false, seenFence = 0, wroteUpdated = false;
  for (const line of lines){
    if (line === "---" && seenFence < 2){ seenFence++; inFm = seenFence === 1; out.push(line); continue; }
    if (seenFence === 1 && /^last_updated:/.test(line)){ out.push("last_updated: " + now); wroteUpdated = true; continue; }
    if (seenFence === 1 && /^created:/.test(line) && parts.fm.created){ out.push("created: " + parts.fm.created); continue; }
    out.push(line);
  }
  if (!wroteUpdated){
    /* No last_updated at all: put one at the end of the frontmatter rather than
       silently leaving the document unable to pass C-2.2. */
    const at = out.lastIndexOf("---");
    if (at > 0) out.splice(at, 0, "last_updated: " + now);
  }
  let body = out.join(NL);
  const entry = ["### Session " + now, "", "Revised by " + who + ".", ""].join(NL);
  const i = body.indexOf("## Session Log");
  if (i < 0){
    body = body + NL + "## Session Log" + NL + NL + entry;
  } else {
    /* Insert at the END of the Session Log section, before whatever heading
       follows it, so earlier entries keep their order and their place. */
    const rest = body.indexOf(NL + "## ", i + 1);
    const cut = rest === -1 ? body.length : rest + 1;
    body = body.slice(0, cut) + entry + body.slice(cut);
  }
  return body;
}

/* Every file the bundle has, other than the one being edited, handed back
   unchanged. promote writes a whole image, so a save that mentions only
   bundle.md deletes the provenance register and every capture beside it. */
async function carryForward(id, exclude){
  const img = (await rec("image", { id })).result || {};
  const out = [];
  for (const [path, v] of Object.entries(img)){
    if (path === exclude || path.indexOf("_history/") === 0) continue;
    if (typeof v === "string") out.push({ path, text: v, bytes: utf8Len(v), sha256: await sha256Text(v) });
    else out.push({ path, blobSha: v.blobSha, sha256: v.sha256, bytes: v.bytes });
  }
  return out;
}
$("#e-save").addEventListener("click", async ()=>{
  const e = $("#e-err"); e.textContent = "";
  const text = $("#e-body").value;
  const fmv = splitFm(text).fm;
  if (!fmv.id) { e.textContent = "The record must keep its heading block, including its id line."; return; }
  $("#e-save").disabled = true;
  try {
    const lease = await rec("lease", { id: EDIT_ID });
    if (!lease.result || lease.result.ok === false) {
      e.textContent = "Someone else is editing this right now (" + (lease.result&&lease.result.heldBy) + ")."; return; }
    const now = new Date().toISOString().split(".")[0] + "Z";
    const revised = reviseText(text, WHO, now);
    const r = await post("promote", {
      /* The lease returns a field named base. Reading baseSha sent undefined,
         which the store correctly refused as a stale write, so no revision
         through this page had ever succeeded. */
      bundleId: EDIT_ID, base: lease.result.base, snapKey: stamp(), author: WHO,
      meta: { object_type: fmv.object_type, title: fmv.title || EDIT_ID,
              current_state: fmv.current_state, created: fmv.created || now, last_updated: now },
      files: [{ path:"bundle.md", text: revised, bytes: utf8Len(revised), sha256: await sha256Text(revised) },
              ...(await carryForward(EDIT_ID, "bundle.md"))],
      register: [],
    });
    if (!r.result || !r.result.ok) {
      const why = (r.result && r.result.reason) || r.error || "unknown";
      if (why === "FILES_DROPPED") {
        e.textContent = "Saving would have removed files this record holds ("
          + (r.result.paths || []).join(", ") + "). Nothing was saved.";
        return; }
      e.textContent = (why === "CAS_STALE" || why === "STALE")
        ? "Someone saved a newer version while you were writing. Open it again and redo your change."
        : "Refused: " + why;
      return; }
    openBundle(EDIT_ID);
  } catch(err){ e.textContent = "That did not go through: " + err.message; }
  finally { $("#e-save").disabled = false; }
});

/* ---- the inbox ---- */
$("#go-inbox").addEventListener("click", openInbox);
async function openInbox(){
  show("#s-inbox");
  const r = await rec("inbox");
  const rows = (r.result && r.result.inbox) || [];
  if (!rows.length) { $("#inbox-body").innerHTML = '<p class="small">Nothing has been left at the door.</p>'; return; }
  $("#inbox-body").innerHTML = rows.map((k,i)=>
    '<div class="card"><div class="kv"><span class="k mono">'+escH(k.knock_id)+'</span><span class="v">'
    + chip(k.status) + ' <span class="dim">' + fmtWhen(k.received) + "</span></span></div>"
    + '<div class="kv"><span class="k">Hash</span><span class="v mono">'+escH(k.sha256)+"</span></div>"
    + '<div class="kv"><span class="k">Size</span><span class="v">'+escH(k.bytes)+" bytes</span></div>"
    + (k.note ? '<div class="kv"><span class="k">Note</span><span class="v">'+escH(k.note)+"</span></div>" : "")
    + (k.contact ? '<div class="kv"><span class="k">Contact</span><span class="v">'+escH(k.contact)+"</span></div>" : "")
    + (k.resolved_by ? '<div class="kv"><span class="k">Handled by</span><span class="v">'+escH(k.resolved_by)+"</span></div>" : "")
    /* Reading the inbox is not gated; ACTING on it is. A member with view
       rights sees what arrived and cannot disposition it. */
    /* R48 (DEC-88 (2); capture R32): handling a knock either way is the member's
       reasoned act, so each card asks for the reason beside its two buttons and
       sends it with the knock and the status. */
    + (can("contribute")
      ? '<label for="ir-'+i+'">Your reason for handling it this way</label>'
        + '<input id="ir-'+i+'" class="ireason">'
        + '<div class="actions" style="margin-top:10px">'
        + '<button class="ibtn" data-i="'+i+'" data-id="'+escH(k.knock_id)+'" data-to="pulled">Mark as taken up</button> '
        + '<button class="ibtn" data-i="'+i+'" data-id="'+escH(k.knock_id)+'" data-to="discarded">Set aside</button></div>'
        + '<p class="err" id="ierr-'+i+'"></p>'
      : "") + "</div>").join("");
  document.querySelectorAll("#inbox-body .ibtn").forEach(b=>b.addEventListener("click", ()=>inboxResolve(b.dataset)));
}
/* R48: nothing is posted without a reason; a refusal is shown in the plane's own
   words (its translation, else its detail) and the knock is left as it was. */
async function inboxResolve(d){
  const e = $("#ierr-"+d.i); e.textContent = "";
  const reason = $("#ir-"+d.i).value;
  if (!reason.trim()) { e.textContent = "Write your reason first. Taking a knock up or setting it aside is recorded with the reason you give."; return; }
  let r;
  try { r = await post("inboxresolve", { knockId: d.id, status: d.to, reason }); }
  catch(err){ e.textContent = "That did not go through: " + err.message; return; }
  const res = r && r.result && typeof r.result === "object" ? r.result : r;
  if (!r || r.ok === false || !res || res.ok === false) {
    const why = (res && (res.translation || res.detail)) || (r && (r.translation || r.detail || r.error));
    e.textContent = why || ("Refused: " + ((res && res.reason) || (r && r.reason) || "unknown"));
    return; }
  openInbox();
}

/* ---- members and keys ---- */
$("#go-members").addEventListener("click", openMembers);
async function openMembers(){
  show("#s-members"); $("#m-err").textContent=""; $("#k-err").textContent="";
  const m = await rec("memberlist");
  const rows = (m.result && m.result.members) || [];
  $("#m-list").innerHTML = rows.length ? rows.map(x=>
    '<div class="kv"><span class="k mono">'+escH(x.member_id)+'</span><span class="v">'
    + escH(x.cover||"") + " " + chip(x.status)
    + (x.invite_pending ? ' <span class="dim">invitation not used yet</span>' : "")
    + ' <button class="mbtn" data-id="'+escH(x.member_id)+'" data-to="'
    + (x.status==="revoked"?"active":"revoked") + '">'
    + (x.status==="revoked"?"reinstate":"revoke") + "</button></span></div>").join("")
    : '<p class="small" style="margin:0">No members yet.</p>';
  document.querySelectorAll("#m-list .mbtn").forEach(b=>b.addEventListener("click", async ()=>{
    await post("memberset", { memberId: b.dataset.id, status: b.dataset.to }); openMembers();
  }));
  const k = await rec("signerlist");
  const keys = (k.result && k.result.signers) || [];
  $("#k-list").innerHTML = keys.length ? keys.map(x=>
    '<div class="kv"><span class="k">'+escH(x.member_id)+'</span><span class="v"><span class="mono dim">'
    + escH(String(x.key_b64).slice(0,24)) + "&hellip;</span> " + chip(x.status)
    + (x.attests === false ? ' <span class="dim">' + escH(signerWhy(x)) + "</span>" : "")
    + ' <button class="kbtn" data-key="'+escH(x.key_b64)+'" data-to="'
    + (x.status==="revoked"?"active":"revoked") + '">'
    + (x.status==="revoked"?"reinstate":"revoke") + "</button></span></div>").join("")
    : '<p class="small" style="margin:0">No keys registered. Until a key is registered, nothing can be published.</p>';
  document.querySelectorAll("#k-list .kbtn").forEach(b=>b.addEventListener("click", async ()=>{
    await post("signerset", { keyB64: b.dataset.key, status: b.dataset.to }); openMembers();
  }));
}
/* D-158: this list renders the key's own status, which is the administrator's own
   revocation switch and NOT whether the key can sign. A key whose member never
   enrolled used to read active here while the instance refused everything signed
   with it — the page telling the administrator more than the plane would honour.
   op=signerlist now carries the derived fact and the stored one behind it, and
   each sentence below names a STORED fact rather than a state invented to cover
   it. The last line is the undetermined branch and says so out loud: an older
   plane sends no attests field at all, so this renders nothing rather than
   guessing, which is the caller-side of the same rule. */
function signerWhy(x){
  const w = x && x.attests_why;
  if (w === "key_revoked") return "revoked — cannot sign";
  if (w === "member_invited" || w === "member_proposed") return "this member has not enrolled yet, so this key cannot sign";
  if (w === "member_revoked") return "this member has been revoked, so this key cannot sign";
  if (w === "member_absent") return "no member on the roster holds this key, so it cannot sign";
  return "this key cannot sign, and this copy has not been told why";
}
function memberWhy(res, wanted){
  const why = (res && res.reason) || "unknown";
  if (why === "BAD_MEMBER_ID") return "A member name is lowercase letters, digits and dashes, at least two characters. "
    + (wanted ? "Try " + wanted + "." : "");
  if (why === "NO_COVER") return "Give a cover as well as a sign-in name: a label you will recognise them by. It does not have to be their real name.";
  if (why === "EXISTS") return "There is already a member with that name.";
  if (why === "NO_SUCH_MEMBER") return "There is no member by that name. Add them first, then register their key.";
  /* D-158, on UI-72's rule: a refusal carrying the plane's OWN canned sentence
     reaches the administrator in THAT sentence instead of as the bare code.
     Placed AFTER the four sentences above so nothing this page already says
     changes, and before the fallback so the next code with a translation needs
     no edit here. */
  if (res && typeof res.translation === "string" && res.translation) return res.translation;
  return "Refused: " + why;
}
$("#m-add").addEventListener("click", async ()=>{
  const e = $("#m-err"); e.textContent = ""; $("#m-invite").innerHTML = "";
  const wanted = $("#m-id").value.trim().toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"");
  $("#m-id").value = wanted;
  const r = await post("memberadd", { memberId: wanted, cover: $("#m-name").value.trim() });
  if (!r.result || !r.result.ok) { e.textContent = memberWhy(r.result, wanted); return; }
  /* A link, not a bare code. The code rides the URL fragment, which never
     reaches any server, and the enrolment screen it opens had no reachable
     path at all before this (DEBT D-14). */
  /* The token alone. Nothing about who it addresses rides in the URL, so a
     leaked or archived link reveals neither the group nor the invitee, and it
     resolves to nothing once it has been used. */
  const link = location.origin + location.pathname + "#invite="
    + encodeURIComponent(r.result.invite);
  $("#m-invite").innerHTML = '<div class="okbox"><p style="margin:0">Send '
    + escH(wanted) + ' this link. It works once, it is not shown again, and it '
    + 'goes nowhere after it has been used.</p>'
    + '<p class="mono" style="margin:8px 0 0;word-break:break-all">' + escH(link) + "</p></div>";
  $("#m-id").value = ""; $("#m-name").value = "";
  openMembers();
});
/* Echo the pasted key back in words. A person pasting 80 opaque characters
   deserves to be told what the machine thinks they just handed it, BEFORE
   they commit it. */
function describeKey(line){
  const t = String(line||"").trim().split(/\\s+/).filter(function(x){ return x; });
  if (t.length < 2 || t[0] !== "ssh-ed25519" || !/^AAAA/.test(t[1]))
    return { ok:false, why:"That does not look like a public key line. It should be one line starting with ssh-ed25519." };
  const label = t.slice(2).join(" ");
  if (label === "bio-release")
    return { ok:false, why:"That is the RELEASE key, which signs software. This box wants the ratification key, the one labelled bio-ratify." };
  return { ok:true, label: label || "(no label)", fp: t[1].slice(0,16) };
}
/* D-605: what op=signeradd is sent for a pasted key LINE. The op takes the line's
   base64 field alone as keyB64 (Store#signerAdd refuses anything else BAD_KEY), so
   the line is split, as the member UI's custodial dialog splits it (D-134): the
   second token is the key, and whatever follows it, the label, is the comment.
   Before D-605 the whole line went as keyB64 and every registration from this
   page was refused. Anything that is not such a line is sent as it was pasted,
   and the plane says what it makes of it. */
function signerAddBody(line, who){
  const raw = String(line||"").trim();
  const t = raw.split(/\\s+/).filter(function(x){ return x; });
  const isLine = t.length >= 2 && t[0] === "ssh-ed25519";
  const body = { keyB64: isLine ? t[1] : raw, memberId: String(who||"").trim().toLowerCase() };
  const label = isLine ? t.slice(2).join(" ") : "";
  if (label) body.comment = label;
  return body;
}
$("#k-key").addEventListener("input", ()=>{
  const v = $("#k-key").value.trim();
  if (!v) { $("#k-read").innerHTML = ""; return; }
  const d = describeKey(v);
  $("#k-read").innerHTML = d.ok
    ? '<p class="small" style="color:var(--verdigris-dk)">Reads as a ratification key labelled <b>'
      + escH(d.label) + '</b>, beginning <span class="mono">' + escH(d.fp) + "</span>.</p>"
    : '<p class="err" style="min-height:0">' + escH(d.why) + "</p>";
});
$("#k-add").addEventListener("click", async ()=>{
  const e = $("#k-err"); e.textContent = "";
  const d = describeKey($("#k-key").value);
  if (!d.ok) { e.textContent = d.why; return; }
  const r = await post("signeradd", signerAddBody($("#k-key").value, $("#k-who").value));
  if (!r.result || !r.result.ok) {
    e.textContent = r.result && r.result.reason === "BAD_KEY"
      ? "That is not a public key this system can read. Copy the whole line from the signing page."
      : memberWhy(r.result);
    return; }
  $("#k-key").value = ""; $("#k-who").value = ""; openMembers();
});

/* ---- the jurisdiction profiles (R12, R15) ----
   Shown by name to every signed-in member. The choice is offered only to a session that administers, with nothing
   preselected: the order a member ticks them is the order they are read. A change is warned about before it is
   sent, and choosing none is allowed and says what it means. */
let PF_ORDER = [];
async function openProfiles(){
  let r = null;
  try { r = await rec("profiles"); } catch { r = null; }
  const res = r && r.result;
  if (!res || res.ok !== true) {
    $("#pf-active").innerHTML = '<p class="small" style="margin:0">This copy could not read its jurisdiction profiles just now.</p>';
    $("#pf-choose").hidden = true; return;
  }
  const act = Array.isArray(res.profiles) ? res.profiles : [];
  $("#pf-active").innerHTML = (act.length
    ? act.map((p,i)=>'<div class="kv"><span class="k">'+(i+1)+'. '+escH(p.name || p.id)+'</span><span class="v">'
        + escH((p.covers||[]).join(", ")) + "</span></div>").join("")
    : '<p class="small" style="margin:0">No profile is active: this copy reads no local facts, and every one is answered as undetermined.'
        + (res.boot && res.boot.why ? " At install, " + escH(res.boot.why) + ", so nothing was recorded." : "") + "</p>")
    + ((res.conflicts||[]).length ? '<p class="small" style="margin:8px 0 0">The active profiles disagree on '
        + (res.conflicts.length) + " fact" + (res.conflicts.length === 1 ? "" : "s") + ", and each is left unread rather than chosen between.</p>" : "");
  if (!ADMIN) { $("#pf-choose").hidden = true; return; }
  PF_ORDER = [];
  $("#pf-warn").hidden = true; $("#pf-err").textContent = "";
  const choices = Array.isArray(res.choices) ? res.choices : [];
  $("#pf-choices").innerHTML = choices.length ? choices.map(p=>
    '<label style="display:flex;gap:8px;align-items:flex-start;font-weight:400">'
    + '<input type="checkbox" class="pf-pick" value="'+escH(p.id)+'" style="width:auto;margin-top:4px">'
    + '<span>'+escH(p.name || p.id)+' <span class="dim">'+escH((p.covers||[]).join(", "))+'</span></span></label>').join("")
    : '<p class="small" style="margin:0">This copy holds no profile to choose.</p>';
  document.querySelectorAll("#pf-choices .pf-pick").forEach(x=>x.addEventListener("change", ()=>{
    PF_ORDER = PF_ORDER.filter(v=>v !== x.value);
    if (x.checked) PF_ORDER.push(x.value);
    $("#pf-warn").hidden = true;
  }));
  $("#pf-choose").hidden = false;
}
function profilesWarning(order, choices){
  const name = (id)=>{ const p = (choices||[]).find(c=>c.id === id); return p && p.name ? p.name : id; };
  return order.length
    ? "From now on, this copy reads its local facts from " + order.map(name).join(", then ")
      + ". Local facts will read differently from then on: what the record already holds is unchanged, but anything read after this is read from these profiles."
    : "You chose no profile. From now on this copy reads no local facts, and every one is answered as undetermined. Local facts will read differently from then on.";
}
$("#pf-review").addEventListener("click", async ()=>{
  const r = await rec("profiles").catch(()=>null);
  $("#pf-warn-text").textContent = profilesWarning(PF_ORDER, r && r.result && r.result.choices);
  $("#pf-warn").hidden = false;
});
$("#pf-cancel").addEventListener("click", ()=>{ $("#pf-warn").hidden = true; });
$("#pf-confirm").addEventListener("click", async ()=>{
  const e = $("#pf-err"); e.textContent = "";
  $("#pf-confirm").disabled = true;
  try {
    const r = await post("profilesset", { profiles: PF_ORDER.slice() });
    const res = r && (r.result || r);
    if (!res || res.ok !== true) { e.textContent = (res && (res.translation || res.detail)) || (r && r.error) || "The change was not made."; return; }
    openProfiles();
  } catch(err){ e.textContent = "That did not go through: " + err.message; }
  finally { $("#pf-confirm").disabled = false; }
});

/* ---- the assistant (R53) ----
   Every signed-in member sees whether it is on; only a session that administers is offered the switch, which says
   what it will do before it is pressed. A read that did not answer says so and offers nothing. */
let AS_ON = null;
async function openAssistant(){
  let r = null;
  try { r = await rec("assistantstate"); } catch { r = null; }
  const res = r && r.result;
  if (!res || res.ok !== true || typeof res.on !== "boolean") {
    AS_ON = null;
    $("#as-state").innerHTML = '<p class="small" style="margin:0">This copy could not read whether the assistant is on just now.</p>';
    $("#as-choose").hidden = true; return;
  }
  AS_ON = res.on;
  $("#as-state").innerHTML = '<p class="small" style="margin:0">'
    + (res.on ? "The assistant is on for this copy." : "The assistant is off for this copy.")
    + (res.set_at ? " Last set by " + escH(res.set_by) + " on " + fmtWhen(res.set_at) + "." : "") + "</p>";
  if (!ADMIN) { $("#as-choose").hidden = true; return; }
  $("#as-err").textContent = "";
  $("#as-toggle").textContent = res.on ? "Switch the assistant off" : "Switch the assistant on";
  $("#as-choose").hidden = false;
}
$("#as-toggle").addEventListener("click", async ()=>{
  const e = $("#as-err"); e.textContent = "";
  if (AS_ON === null) return;
  $("#as-toggle").disabled = true;
  try {
    const r = await post("assistantset", { on: !AS_ON });
    const res = r && (r.result || r);
    if (!res || res.ok !== true) { e.textContent = (res && (res.translation || res.detail)) || (r && r.error) || "The change was not made."; return; }
    openAssistant();
  } catch(err){ e.textContent = "That did not go through: " + err.message; }
  finally { $("#as-toggle").disabled = false; }
});

/* ---- enrolment, for an invited member with no password yet ---- */
$("#en-go").addEventListener("click", async ()=>{
  const e = $("#en-err"); e.textContent = "";
  const r = await api("enroll", { invite: INVITE,
    handle: $("#en-handle").value.trim().toLowerCase(), password: $("#en-pw").value });
  if (!r.result || !r.result.ok) {
    const why = r.result && r.result.reason;
    e.textContent = why === "PASSWORD_TOO_SHORT" ? "The password needs at least 12 characters."
      : why === "HANDLE_TAKEN" ? "Someone already uses that handle. Choose another."
      : why === "NO_HANDLE" ? "Choose a handle. It is the name the record will show."
      : why === "BAD_HANDLE" ? "A handle is lowercase letters, digits and dashes, at least two characters."
      : "This invitation link is not live. Ask whoever invited you for a new one.";
    return; }
  $("#lwho").value = r.result.memberId; $("#lpw").value = "";
  show("#s-login");
});
document.querySelectorAll(".crumb-home").forEach(a=>a.addEventListener("click", ()=>{
  document.querySelector("main").classList.remove("wide"); show("#s-panel"); }));

state();
</script>
</body>
</html>`;

/* ============================================================================================================
 * THE INSTANCE: WHAT THIS COPY IS AND WHOSE IT IS (instance-setup R1–R42). Below the page, the module's own
 * store-side and Worker-side code, moved in from `legacy-store` and `legacy-index` at its extraction (K69, N38).
 * ============================================================================================================ */

/* The slug grammar and the fleet's binding names live in the import-free leaf the installer imports (N234, K405). */
export { GROUP_SLUG_RE, FLEET_BINDINGS };

/* D-116 — EACH FLEET MEMBER'S BUILD, READ BACK THROUGH THE BINDING THIS PLANE ACTUALLY HOLDS.
 *
 * A member versions and rolls out on its own (`BIO_Distribution_v0_1.md` §4 rule 1), and an installer that uploaded
 * one has only Cloudflare's word that it landed — never the member's, and never the PLANE's view of it, which is the
 * one that decides whether a group's PDFs, OCR and assistant do what every description of them says (D-115). So the
 * question is asked where it matters: over `env.<BINDING>`, `GET /version`, the route every member has served since
 * CPDF-9 / FL-2 / CPDF-10. Each answer is the MEMBER'S OWN reply — its `name` and `version` fields, copied — and never
 * this isolate's env.VERSION: a plane that filled these in from its own env would make every member agree for free.
 *
 * States, per member, each a first-class statement rather than a missing key:
 *   SERVING   the member answered through the binding, under its own name, with `version`.
 *   UNBOUND   this plane holds no binding by that name — the member is unreachable FROM HERE whatever the account holds.
 *   SILENT    bound, and it did not answer a readable version within the bound (`why` says what happened).
 *   MISNAMED  something answered through the binding, but under another name — the binding points at the wrong worker.
 * Read only on `op=bootstrap&members=1`, so the anonymous answer a browser polls does not fan out to three workers. */
const MEMBER_VERSION_WAIT_MS = 4000;
export async function memberVersions(env) {
  const out = {};
  await Promise.all(FLEET_BINDINGS.map(async ([member, binding]) => {
    const b = env[binding];
    if (!b || typeof b.fetch !== "function") { out[member] = { binding, state: "UNBOUND" }; return; }
    let timer;
    try {
      const r = await Promise.race([
        b.fetch(`https://${member}/version`, { method: "GET" }),
        new Promise((_, no) => { timer = setTimeout(() => no(new Error(`no answer within ${MEMBER_VERSION_WAIT_MS} ms`)),
                                                    MEMBER_VERSION_WAIT_MS); }),
      ]);
      const j = await r.json().catch(() => null);
      if (!r.ok || !j || typeof j.version !== "string" || !j.version) {
        out[member] = { binding, state: "SILENT", why: `answered HTTP ${r.status} without a version` };
      } else if (j.name !== member) {
        out[member] = { binding, state: "MISNAMED", name: typeof j.name === "string" ? j.name : null, version: j.version };
      } else {
        out[member] = { binding, state: "SERVING", version: j.version };
      }
    } catch (e) {
      out[member] = { binding, state: "SILENT", why: String(e && e.message || e).slice(0, 200) };
    } finally { clearTimeout(timer); }
  }));
  return out;
}

/* ============================================================================================================
 * THE CHECKS THIS MODULE HOLDS (R30, K6). C-64.2, C-64.3 and C-64.5–C-64.7 moved here from the catalogue's
 * `INSTANCE_GROUP_CHECKS`, code, condition and translation unmoved, their `where`s now this file's. C-64.1
 * (GROUP_UNDETERMINED, raised at the write) stays with the catalogue's family for `promotion`; C-64.4 (a bearer on
 * the two sets) is `control-plane`'s. C-119 is the jurisdiction profiles' (R14), a family of its own.
 * ============================================================================================================ */
export const INSTANCE_SETUP_CHECKS = Object.freeze({
  GROUP_SLUG_MALFORMED: {
    check: 'C-64.2',
    where: 'src/setup.mjs instanceGroupSeed > is-instance-group-seed',
    translation: 'A group is recorded by its short name, the same one the installer accepts: 3 to 40 lowercase '
      + 'letters, digits and hyphens, beginning and ending with a letter or a digit. Nothing was recorded.',
  },
  GROUP_ALREADY_RECORDED: {
    check: 'C-64.3',
    where: 'src/setup.mjs instanceGroupSeed > is-instance-group-seed',
    translation: 'Your group\'s Civicsmith has its group recorded already, and it is recorded once: the name travels inside every '
      + 'document the record has signed, so a second name would make those documents name a producer they were '
      + 'not written under. Nothing was changed.',
  },
  GROUP_IDENTITY_NOT_ADMIN: {
    check: 'C-64.5',
    where: 'src/setup.mjs #groupIdentityGate > is-group-identity-admin',
    translation: 'Only one of the group\'s administrators can set the name it shows the public or the web '
      + 'address it claims. The person signed in here is not one of its active administrators. Nothing was '
      + 'changed.',
  },
  GROUP_DISPLAY_NAME_MALFORMED: {
    check: 'C-64.6',
    where: 'src/setup.mjs groupNameSet > is-group-display-name',
    translation: 'A display name is the group\'s own words for itself: some text, at most 120 characters, on '
      + 'one line. It is always shown beside the group\'s short name and never instead of it. Nothing was '
      + 'changed.',
  },
  GROUP_DOMAIN_MALFORMED: {
    check: 'C-64.7',
    where: 'src/setup.mjs groupDomainSet > is-group-domain',
    translation: 'A web address is claimed by its bare domain name, like example.org: no https://, no path and '
      + 'no port. The claim is then checked by reading a file the domain itself serves, and the public sees '
      + 'the domain only while that check passes. Nothing was changed.',
  },
  /* R14 (N10, K102): the list of jurisdiction profiles this copy reads its local facts from. */
  PROFILES_NOT_ADMIN: {
    check: 'C-119.1',
    where: 'src/setup.mjs profilesSet > is-profiles-admin',
    translation: 'Only one of the group\'s administrators, signed in as themselves, can choose which jurisdiction '
      + 'profiles your group\'s Civicsmith reads its local facts from. Nothing was changed.',
  },
  NOT_A_LIST: {
    check: 'C-119.2',
    where: 'src/setup.mjs profilesSet > is-profiles-list',
    translation: 'The profiles are chosen as a list, in the order they are to be read, and an empty list means '
      + 'none. What was sent is not a list. Nothing was changed.',
  },
  UNKNOWN_PROFILE: {
    check: 'C-119.3',
    where: 'src/setup.mjs profilesSet > is-profiles-list',
    translation: 'Your group\'s Civicsmith holds no jurisdiction profile by that name, so it cannot read local facts from it. '
      + 'Choose among the profiles it offers. Nothing was changed.',
  },
  PROFILE_IS_TEST: {
    check: 'C-119.4',
    where: 'src/setup.mjs profilesSet > is-profiles-list',
    translation: 'That profile is made up for testing: its facts describe no real place, so no group\'s Civicsmith '
      + 'reads local facts from it. Nothing was changed.',
  },
  /* R53–R55 (K1502, K1478 (i), D311): the assistant, optional for the copy, and each member's disclosure. */
  ASSISTANT_OFF: {
    check: 'C-119.5',
    where: 'src/setup.mjs assistantGate > is-assistant-on',
    translation: 'The assistant is switched off for your group\'s Civicsmith, so no question is put to it and nothing runs. One of '
      + 'the group\'s administrators can switch it on. Nothing was asked.',
  },
  ASSISTANT_SWITCH_MALFORMED: {
    check: 'C-119.6',
    where: 'src/setup.mjs assistantSet > is-assistant-switch',
    translation: 'The assistant is switched on or off, and the request said neither. Nothing was changed.',
  },
  DISCLOSURE_NOT_THE_MEMBERS: {
    check: 'C-119.7',
    where: 'src/setup.mjs disclosureShown > is-disclosure-shown',
    translation: 'The assistant\'s disclosure is recorded as shown only to the member it was shown to, by their own '
      + 'act, never by another member or a machine on their behalf. Nothing was recorded.',
  },
  /* R51, R52: the captures a seeding reads. */
  SEED_CAPTURE_UNREADABLE: {
    check: 'C-119.9',
    where: 'src/setup.mjs seatsSeed > is-seed-capture',
    translation: 'Seats are seeded from captures the record holds of Legistar\'s bodies, persons and office records, '
      + 'and one of them is not named or cannot be read. Nothing was seeded.',
  },
  SEED_CAPTURE_NOT_LEGISTAR: {
    check: 'C-119.10',
    where: 'src/setup.mjs seatsSeed > is-seed-capture',
    translation: 'Seats are seeded only from Legistar\'s own lists of bodies, persons and office records, each named '
      + 'where it belongs, and this capture is not the list named. Nothing was seeded.',
  },
  DISCLOSURE_MALFORMED: {
    check: 'C-119.8',
    where: 'src/setup.mjs disclosureShown > is-disclosure-shown',
    translation: 'A shown disclosure is recorded with the member it was shown to and the version of its words. One '
      + 'of them is missing. Nothing was recorded.',
  },
  /* R60 (DEC-150 (1)): the name of a place the group works in that no held profile covers. */
  PLACE_NAME_MALFORMED: {
    check: 'C-64.8',
    where: 'src/setup.mjs placeWantedSet > is-place-name',
    translation: 'A place your group works in is named in plain words: some text, at most 200 characters, on one '
      + 'line. It is kept only in your group\'s Civicsmith and sent nowhere. Nothing was changed.',
  },
  /* R65 (DEC-152): the assistant's draft of the group's focus and purpose, from the administrator's answers. */
  GROUP_DRAFT_NO_ANSWERS: {
    check: 'C-64.9',
    where: 'src/setup.mjs groupDescriptionDraft > is-group-draft-answers',
    translation: 'Tell the assistant a little about your group first: it drafts only from what you tell it and what '
      + 'your group already holds. Nothing was saved.',
  },
  GROUP_DRAFT_ANSWERS_MALFORMED: {
    check: 'C-64.10',
    where: 'src/setup.mjs groupDescriptionDraft > is-group-draft-answers',
    translation: 'The assistant drafts from your answers to its questions: a short list of answers, each at most '
      + '1,000 characters. Nothing was saved.',
  },
  /* R64 (DEC-127 (1)): the language a member chooses for the screens, the member's own act. */
  MACHINE_CANNOT_SET_LANGUAGE: {
    check: 'C-119.11',
    where: 'src/setup.mjs memberLanguageSet > is-member-language',
    translation: 'The language your screens are shown in is your own choice, made from your own signed-in session, '
      + 'never by another member or a machine. Nothing was changed.',
  },
  LANGUAGE_MALFORMED: {
    check: 'C-119.12',
    where: 'src/setup.mjs memberLanguageSet > is-member-language',
    translation: 'A language is chosen by its standard tag, like en, es or zh-Hant, and what was sent is not one. '
      + 'Nothing was changed.',
  },
});

const refusal = (code, detail, extra) => {
  const row = INSTANCE_SETUP_CHECKS[code];
  return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...(extra || {}) };
};
/* R65: a refusal in one of wizard-scripts' rows (its R25's codes, and `ASSISTANT_DRAFT_UNAVAILABLE`), with its check and
   translation as that module holds them. */
const scriptRefusal = (code, detail) => {
  const row = (wizardScripts.WIZARD_SCRIPTS_CHECKS || {})[code] || {};
  return { ok: false, reason: code, code, check: row.check ?? null, translation: row.translation ?? null, detail };
};
const draftUnavailable = (detail) => scriptRefusal("ASSISTANT_DRAFT_UNAVAILABLE", detail);
const draftRefused = (checked) => (checked && typeof checked.code === "string"
  ? scriptRefusal(checked.code, "the draft did not pass the check that it adds no fact, so nothing is offered.")
  : draftUnavailable("the draft could not be checked, so nothing is offered."));

/* R60: the longest name a place is given, in characters. R65: the answers' bounds, and membership R109's limits on
   the focus and the purpose a draft must fit. R64: one BCP 47 tag, as `jurisdictions` R37 reads one (`Intl` reads no
   clock, store or network), at most 255 characters. */
export const PLACE_NAME_MAX = 200;
export const GROUP_DRAFT_ANSWERS_MAX = 20;
export const GROUP_DRAFT_ANSWER_MAX = 1000;
export const GROUP_FOCUS_MAX = 1000;
export const GROUP_PURPOSE_MAX = 4000;
export function isLanguageTag(v) {
  if (typeof v !== "string" || !v || v.length > 255 || /\s|,/.test(v)) return false;
  try { return Intl.getCanonicalLocales(v).length === 1; } catch { return false; }
}

/* ============================================================================================================
 * THE TABLES (K4, `build/layers.md` ruling 3: each module owns its tables), created by `migrate` at start. Every one
 * is declared to record-core exempt from purge, in both forms (R28, R41): the instance's identity and its
 * measurements of the runtime are not derived from the corpus, in the family of `seq` and the settings.
 * ============================================================================================================ */
export const INSTANCE_SETUP_TABLES = Object.freeze(["instance_group", "group_identity_history", "group_domain_checks",
  "runtime_observations", "cpu_probe_runs", "cpu_probe_steps", "assistant_switch", "assistant_disclosures",
  "place_wanted", "place_seen", "place_arrivals", "member_languages"]);
/* Each table's classes, declared explicitly through record-core's `declareTable` (its R21; plan T33, Rules (6)). Every
   one is exempt from purge (R28, R41); none is a cache of anything; the append-only ones keep every version (R26, R53,
   R54). A member's disclosure record is theirs and the group's, never exported (it names who connected an account). */
const TABLE_CLASSES = Object.freeze({
  instance_group: { export: "admin-only", version_chain: false },
  group_identity_history: { export: "admin-only", version_chain: true },
  group_domain_checks: { export: "admin-only", version_chain: true },
  runtime_observations: { export: "admin-only", version_chain: false },
  cpu_probe_runs: { export: "admin-only", version_chain: false },
  cpu_probe_steps: { export: "admin-only", version_chain: false },
  assistant_switch: { export: "admin-only", version_chain: true },
  assistant_disclosures: { export: "never", version_chain: true },
  /* R60, R62 (DEC-150): the place the group named, held only in its own Civicsmith, never exported (R60). */
  place_wanted: { export: "never", version_chain: true },
  place_seen: { export: "never", version_chain: false },
  place_arrivals: { export: "never", version_chain: true },
  /* R64 (DEC-127 (1)): each member's own choice of language, appended. */
  member_languages: { export: "admin-only", version_chain: true },
});
/* R50–R52: the seeding ledgers name entities and lines of the registry (`entities`, `lines`), which a whole-store purge
   clears, so a whole-store purge clears them with it and a later seeding starts afresh; a bundle's purge touches none. */
export const INSTANCE_SETUP_SEED_TABLES = Object.freeze(["seed_entities", "seed_lines", "seed_offices", "seed_bodies"]);
export const INSTANCE_SETUP_TABLE_DECLARATIONS = Object.freeze([
  ...INSTANCE_SETUP_TABLES.map((name) => Object.freeze({
    name, purge: "exempt", expunge: "none", sight: "group", derive: "stored", ...TABLE_CLASSES[name] })),
  ...INSTANCE_SETUP_SEED_TABLES.map((name) => Object.freeze({
    name, purge: "clear", expunge: "none", export: "admin-only", sight: "group", derive: "stored",
    version_chain: false })),
]);
export const INSTANCE_SETUP_SCHEMA = `
-- D-436 (State Rules v1.5 section 3.1, the core field group): THE PRODUCING GROUP'S SLUG, ONE VALUE FOR THE WHOLE
-- INSTANCE. Every bundle this instance writes names it as its group, in the bytes that get signed, and nothing else may
-- supply that name: not a literal in the code, and not a deploy-time variable, which a redeploy could move silently.
-- One row, id=1, WRITTEN ONCE: every writer is an INSERT that does nothing on conflict, and no statement anywhere
-- updates or deletes it (R26).
--   source  'bootstrap'  recorded at the store's FIRST BOOT (record-core's isFirstBoot, its R54), from the slug the
--                        installer bound as INSTANCE_NAME, read at that moment only (R2)
--           'seed'       recorded once by op=instancegroupseed, the root of trust's act, on a store that already held
--                        the schema when this table arrived (R4)
--   recorded_by  NULL for bootstrap, the server-stamped credential for a seed
CREATE TABLE IF NOT EXISTS instance_group (
  id           INTEGER PRIMARY KEY CHECK (id = 1),
  slug         TEXT NOT NULL,
  recorded_at  TEXT NOT NULL,
  source       TEXT NOT NULL,
  recorded_by  TEXT
);
-- REC-164: THE PUBLISHING GROUP'S DISPLAY NAME AND ITS DOMAIN (BIO_Publication_v0_1.md section 7 points 2 and 3). Two
-- durable values, each with a dated history: a value is the LATEST row for its field, and no statement updates or
-- deletes a row (R26), so every revision stays readable with its date and the administrator who made it.
--   field             'display_name' or 'domain'
--   set_by            the member the control plane stamped from the signed-in session, never a caller's statement
--   instance_address  a domain row only: the origin the administrator's session reached, stamped by the control
--                     plane, which the well-known file must name
CREATE TABLE IF NOT EXISTS group_identity_history (
  seq               INTEGER PRIMARY KEY AUTOINCREMENT,
  field             TEXT NOT NULL CHECK (field IN ('display_name','domain')),
  value             TEXT NOT NULL,
  set_at            TEXT NOT NULL,
  set_by            TEXT NOT NULL,
  instance_address  TEXT
);
-- Every verdict on a claimed domain, dated (R8). 'undetermined' is recorded as what it is and never as 'absent'.
--   trigger  'set' (the administrator's act) or 'alarm' (the reconciling re-check, R9)
CREATE TABLE IF NOT EXISTS group_domain_checks (
  seq         INTEGER PRIMARY KEY AUTOINCREMENT,
  domain      TEXT NOT NULL,
  verdict     TEXT NOT NULL CHECK (verdict IN ('verified','absent','mismatched','undetermined')),
  checked_at  TEXT NOT NULL,
  trigger     TEXT NOT NULL,
  status      INTEGER,
  detail      TEXT
);
-- What the runtime was observed to COST (R33, R34), measured rather than assumed. capture_limits (capture's) holds
-- ceilings found by being refused; this holds consumption found by measuring. The columns are named *_ms for the
-- metric that first wrote them; each metric carries its own UNIT, and a count of work is never read as a time.
CREATE TABLE IF NOT EXISTS runtime_observations (
  metric     TEXT PRIMARY KEY,
  peak_ms    REAL NOT NULL,
  peak_at    TEXT NOT NULL,
  peak_detail TEXT,
  last_ms    REAL NOT NULL,
  last_at    TEXT NOT NULL,
  samples    INTEGER NOT NULL DEFAULT 1,
  total_ms   REAL NOT NULL DEFAULT 0,
  unit       TEXT
);
-- The stepped CPU probe's durable trail (R35–R40), ONE RUN APART FROM ANOTHER. Exceeding the CPU limit TERMINATES the
-- isolate, so no run can record its own death: a run is started, each step it completes is written before the next
-- begins, and its end is written when it returns. A run with no end is one the isolate did not survive, and the
-- ceiling lies between its last completed step and the next, each timed from that run's own start.
CREATE TABLE IF NOT EXISTS cpu_probe_runs (
  run         TEXT PRIMARY KEY,
  started_at  TEXT NOT NULL,
  iterations  INTEGER,
  budget_ms   REAL,
  ended_at    TEXT,
  reason      TEXT,
  completed   INTEGER,
  elapsed_ms  REAL
);
CREATE TABLE IF NOT EXISTS cpu_probe_steps (
  run         TEXT NOT NULL,
  step        INTEGER NOT NULL,
  elapsed_ms  REAL NOT NULL,
  iterations  INTEGER NOT NULL,
  at          TEXT NOT NULL,
  PRIMARY KEY (run, step)
);
-- R53 (K1502): whether the assistant is enabled for this copy, each set appended with who and when; the switch is the
-- latest row, and with no row it is off. No row updates or deletes another.
CREATE TABLE IF NOT EXISTS assistant_switch (
  seq     INTEGER PRIMARY KEY AUTOINCREMENT,
  on_     INTEGER NOT NULL CHECK (on_ IN (0, 1)),
  set_by  TEXT NOT NULL,
  set_at  TEXT NOT NULL
);
-- R50–R52: what this module seeded, so a repeat is answered already and the offices it seeded can be named (K1683).
-- seed_entities: one row per scheme identifier this module seeded an entity under (or found one holding).
CREATE TABLE IF NOT EXISTS seed_entities (
  scheme     TEXT NOT NULL,
  id         TEXT NOT NULL,
  entity_id  TEXT NOT NULL,
  kind       TEXT NOT NULL,
  label      TEXT NOT NULL,
  source     TEXT NOT NULL,
  seeded_at  TEXT NOT NULL,
  PRIMARY KEY (scheme, id)
);
-- seed_lines: one row per line this module recorded, keyed by its kind, its ends and the source row it rests on.
CREATE TABLE IF NOT EXISTS seed_lines (
  key          TEXT PRIMARY KEY,
  kind         TEXT NOT NULL,
  from_entity  TEXT NOT NULL,
  to_entity    TEXT NOT NULL,
  line_id      TEXT NOT NULL,
  seeded_at    TEXT NOT NULL
);
-- seed_offices: each profile office (jurisdictions R24's counterparty) seeded, by its profile, role and body.
CREATE TABLE IF NOT EXISTS seed_offices (
  profile        TEXT NOT NULL,
  role           TEXT NOT NULL,
  body           TEXT NOT NULL,
  entry          TEXT NOT NULL,
  office_entity  TEXT NOT NULL,
  body_entity    TEXT NOT NULL,
  seeded_at      TEXT NOT NULL,
  PRIMARY KEY (profile, role, body)
);
-- R50, R51: each profile body seeded under the profile's own identifier for it (ids.body), with or without its office,
-- so R51 finds the body a Legistar body is matched to even where the profile gives its office no identifier.
CREATE TABLE IF NOT EXISTS seed_bodies (
  profile      TEXT NOT NULL,
  role         TEXT NOT NULL,
  body         TEXT NOT NULL,
  entry        TEXT NOT NULL,
  body_entity  TEXT NOT NULL,
  seeded_at    TEXT NOT NULL,
  PRIMARY KEY (profile, role, body)
);
-- R60 (DEC-150 (1)): the place the group works in that no held profile covers, named by an administrator; the latest row
-- is the name, and a row with name NULL clears it. Held only here: nothing reads it outward. Append-only.
CREATE TABLE IF NOT EXISTS place_wanted (
  seq     INTEGER PRIMARY KEY AUTOINCREMENT,
  name    TEXT,
  set_by  TEXT NOT NULL,
  set_at  TEXT NOT NULL
);
-- R62 (DEC-150 (3)): the held profiles as last compared (at the set of a name, then at each start), one row.
CREATE TABLE IF NOT EXISTS place_seen (
  id        INTEGER PRIMARY KEY CHECK (id = 1),
  profiles  TEXT NOT NULL,
  seen_at   TEXT NOT NULL
);
-- R62: each held profile found matching the named place that was not held before, recorded once per name (place_seq,
-- the place_wanted row it matched); it leaves when the profile is made active or the name is cleared or changed.
CREATE TABLE IF NOT EXISTS place_arrivals (
  seq        INTEGER PRIMARY KEY AUTOINCREMENT,
  place_seq  INTEGER NOT NULL,
  name       TEXT NOT NULL,
  profile    TEXT NOT NULL,
  found_at   TEXT NOT NULL,
  left_at    TEXT,
  left_why   TEXT,
  UNIQUE (place_seq, profile)
);
-- R64 (DEC-127 (1)): the language each member chose for the screens, by their own act; the latest row per member is the
-- choice, and a row with language NULL clears it. Append-only.
CREATE TABLE IF NOT EXISTS member_languages (
  seq       INTEGER PRIMARY KEY AUTOINCREMENT,
  member    TEXT NOT NULL,
  language  TEXT,
  set_at    TEXT NOT NULL
);
-- R54 (D311): each time the assistant's disclosure was shown to a member before they connected their own account: who,
-- the disclosure's version, who recorded it and when. Append-only.
CREATE TABLE IF NOT EXISTS assistant_disclosures (
  seq       INTEGER PRIMARY KEY AUTOINCREMENT,
  member    TEXT NOT NULL,
  version   TEXT NOT NULL,
  shown_by  TEXT NOT NULL,
  shown_at  TEXT NOT NULL
);
`;

/* R54 (D311): the assistant's disclosure. Its words are the design stream's (NOTICE to UX-DESIGN) and are shown by the
   surface; this module holds the version a shown disclosure is recorded against, and the meaning the words carry. A new
   version of the words is a new `version`, and a member shown only an earlier one reads `shown: false` until shown again. */
export const ASSISTANT_DISCLOSURE = Object.freeze({
  version: "D311-1",
  meaning: "your questions and the material read to answer them, people's facts included, go to Anthropic under your "
    + "own account",
});

/* R50–R52: the machine's stamp on what it seeds (DEC-52), and the Legistar schemes the profiles declare for a body's
   `BodyId`, a person's `PersonId` and a seat's `OfficeRecordId` (jurisdictions R52; K1682's reading 2). */
export const SEED_MACHINE = "class:admin";
/* A profile's zone (jurisdictions R41: `time_zone`, its `value` an IANA name), or null when it states none. */
const zoneOf = (p) => {
  const z = p && p.time_zone;
  const v = z && typeof z === "object" ? z.value : z;
  return typeof v === "string" && v.trim() ? v.trim() : null;
};
/* R53 (K1678): who set the switch when the installer's binding is recorded at the first boot. */
export const ASSISTANT_INSTALLER = "installer";
export const LEGISTAR_SCHEMES = Object.freeze({ body: "legistar_body_id", person: "legistar_person_id", seat: "legistar_office_record_id" });

/* The probe run the trail held before runs were kept apart (R40): its rows, keyed on the step alone, become one run. */
export const LEGACY_PROBE_RUN = "legacy";

/* A metric's unit, for the metrics that predate the unit column (R34): a `_bytes` metric counts bytes. */
const unitOfMetric = (metric) => (/_bytes$/.test(String(metric)) ? "bytes" : "ms");

/* =====================================================================
 * D-436 / IC-172 — THE PRODUCING GROUP, ONE RECORDED VALUE FOR THE WHOLE INSTANCE (R1–R4).
 *
 * State Rules v1.5 §3.1: every bundle.md carries `group`, the producing group's slug, and it travels with every
 * distributed copy — so it is in the SIGNED bytes. There is ONE value, the `instance_group` row, and every default and
 * every stamp reads it through `producingGroup()`, which this module registers with promotion as the fact
 * `producingGroup` (promotion R40, R1 here). Nothing in the plane names a group of its own.
 *
 * DECISION (a), WHERE IT COMES FROM (K102). It is written ONCE, at the store's FIRST BOOT (record-core's `isFirstBoot`,
 * its R54): on that boot and on no other, the slug the installer bound as INSTANCE_NAME is recorded, the worker name
 * the group chose (D-102), which `newgroup` binds in the SAME upload that creates the worker. It is checked against the
 * installer's own slug grammar first, and a missing or malformed name records NOTHING — the store then says so.
 *   NEVER A DEPLOY-TIME VARIABLE AS ITS SOURCE. INSTANCE_NAME is the channel the slug ARRIVES by, read at one moment;
 *   every later boot ignores it. So a redeploy that moves the binding moves nothing already recorded.
 *   WHY THE FIRST BOOT AND NOT op=claim. The scratch namespace is a Durable Object of its own that no claim ever
 *   reaches; the root of trust can write before anyone claims; and a claim is RE-ARMED by rotating ADMIN_TOKEN, so
 *   "the first claim" would need a witness of its own. The store's birth is witnessed by the schema itself.
 *
 * DECISION (b), A STORE THAT PREDATES THE VALUE. A store that already held the schema when this table arrived records
 * NOTHING at boot, even with INSTANCE_NAME bound: the binding and the record can disagree, and choosing between them is
 * a person's act, not a boot's. It is recorded ONCE by the root of trust (`instanceGroupSeed`), and refused a second
 * time. The documents already written are not rewritten: their bytes are signed.
 *
 * DECISION (c), NOTHING RECORDED. A write that must name the producing group is never given a default (C-64.1,
 * promotion's): the fact answers null, and the writer refuses by name.
 * ===================================================================== */

/* What a store recording no group SAYS, in ONE copy: the credentialed read and the public reads both answer with it. */
export const NO_GROUP_RECORDED = "no producing group is recorded for this store. A store records it once: at its first "
  + "boot, from the slug its installer bound, or — on a store that already held documents when the value "
  + "arrived — by one act of the root of trust (op=instancegroupseed). Until then a write that must "
  + "name its producing group is given no default: a caller's own statement of its group is kept "
  + "as the caller's, and a write stating none is refused.";

/* REC-164 — THE DISPLAY NAME AND THE DOMAIN (R5–R11): the bounds and the file. */
export const GROUP_DISPLAY_NAME_MAX = 120;
/* A bare lowercase host name with at least one dot, labels of 1-63 letters, digits and hyphens: no scheme, path, port
   or IP literal. The last label must begin with a letter, which is what excludes a dotted-quad. */
export const GROUP_DOMAIN_RE = /^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
/* R8 (DEC-124; K1365 (5)): the file a group publishes, and the one it published before T31, read only when the first is
   `absent` so a group that already published it stays verified. The second answer decides. */
export const GROUP_WELL_KNOWN_PATH = "/.well-known/civicsmith-group.json";
export const GROUP_WELL_KNOWN_PATH_BEFORE_T31 = "/.well-known/civicos-group.json";
export const GROUP_WELL_KNOWN_MAX_BYTES = 16384;
export const GROUP_DOMAIN_RECHECK_MS = 86_400_000;   // chosen, not measured: once a day
/* IC-246: the check log answered newest first, cut at a NAMED bound and the cut PUBLISHED (R11). */
export const GROUP_DOMAIN_CHECKS_MAX = 20;

/* The instance's own address as the control plane stamped it: an origin, lowercased, no trailing slash. */
function instanceAddress(origin) {
  try {
    const u = new URL(String(origin ?? ""));
    return (u.protocol === "https:" || u.protocol === "http:") ? `${u.protocol}//${u.host}`.toLowerCase() : null;
  } catch { return null; }
}

/* At most `max` bytes of a response body, decoded as UTF-8; the rest is never read (R8: at most 16 KiB). */
async function boundedText(res, max) {
  const body = res && res.body;
  if (!body || typeof body.getReader !== "function")
    return String(await res.text().catch(() => "")).slice(0, max);
  const reader = body.getReader();
  const parts = [];
  let held = 0;
  try {
    while (held < max) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = value instanceof Uint8Array ? value : new Uint8Array(value);
      parts.push(chunk.subarray(0, Math.min(chunk.length, max - held)));
      held += Math.min(chunk.length, max - held);
    }
  } catch { /* what was read stands */ }
  try { await reader.cancel(); } catch { /* already closed */ }
  const all = new Uint8Array(held);
  let at = 0;
  for (const p of parts) { all.set(p, at); at += p.length; }
  return new TextDecoder().decode(all);
}

/* =====================================================================
 * THE MODULE ON ONE DURABLE OBJECT'S STORAGE (K61): `instanceSetupOf(ctx, env, deps)`.
 * `deps` lets a test hand its own record-core, membership, promotion, governor, scheduler, capture, `fetch` and
 * `sleep`; each defaults to the module's own factory on the same `ctx`.
 * ===================================================================== */
export class InstanceSetup {
  #ctx; #env; #deps; #sql; #started = false;

  constructor(ctx, env = {}, deps = {}) {
    this.#ctx = ctx;
    this.#env = env || {};
    this.#deps = deps || {};
    this.#sql = (ctx && ctx.storage ? ctx.storage : ctx).sql;
  }

  #record() { return this.#deps.record ?? recordOf(this.#ctx); }
  #membership() { return this.#deps.membership ?? membershipOf(this.#ctx); }
  #promotion() { return this.#deps.promotion ?? promotionOf(this.#ctx); }
  #governor() { return this.#deps.governor ?? governorOf(this.#ctx); }
  #scheduler() { return this.#deps.scheduler ?? schedulerOf(this.#ctx, this.#env); }
  #capture() { return this.#deps.capture ?? captureOf(this.#ctx, { env: this.#env }); }
  #queueProducers() { return this.#deps.queueProducers ?? null; }
  #fetch(...a) { return (this.#deps.fetch ?? globalThis.fetch)(...a); }
  #sleep(ms) { return this.#deps.sleep ? this.#deps.sleep(ms) : new Promise((s) => setTimeout(s, ms)); }
  #now() { return this.#deps.now ? this.#deps.now() : Date.now(); }
  #iso() { return new Date(this.#now()).toISOString(); }

  #rows(q, ...a) { return [...this.#sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }

  /* ---- start (the Suggestions' "Factory and start") ---- */

  /** This module's tables, and the migrations of the two that predate a column (R34) or a key (R40). Idempotent. */
  migrate() {
    const bare = INSTANCE_SETUP_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
    for (const stmt of bare.split(";").map((x) => x.trim()).filter(Boolean)) this.#sql.exec(stmt);
    /* R34: a store written before the unit column holds its rows unit-less; each takes its metric's unit. */
    const cols = this.#rows(`PRAGMA table_info(runtime_observations)`).map((r) => r.name);
    if (!cols.includes("unit")) this.#sql.exec(`ALTER TABLE runtime_observations ADD COLUMN unit TEXT`);
    for (const r of this.#rows(`SELECT metric FROM runtime_observations WHERE unit IS NULL`))
      this.#sql.exec(`UPDATE runtime_observations SET unit = ? WHERE metric = ?`, unitOfMetric(r.metric), r.metric);
    /* R50: a body seeded with its office before the body ledger existed is held there too, so R51 finds it. */
    this.#sql.exec(`INSERT OR IGNORE INTO seed_bodies (profile, role, body, entry, body_entity, seeded_at)
                    SELECT profile, role, body, entry, body_entity, seeded_at FROM seed_offices`);
    /* R40: the trail that predates runs, keyed on the step alone, becomes one run of its own, and its table goes. */
    if (this.#rows(`PRAGMA table_info(cpu_probe)`).length) {
      const old = this.#rows(`SELECT step, elapsed_ms, iterations, at FROM cpu_probe ORDER BY step`);
      if (old.length && !this.#one(`SELECT run FROM cpu_probe_runs WHERE run = ?`, LEGACY_PROBE_RUN)) {
        this.#sql.exec(`INSERT INTO cpu_probe_runs (run, started_at, iterations, reason) VALUES (?, ?, ?, 'unrecorded')`,
                       LEGACY_PROBE_RUN, old[0].at, old[0].iterations);
        for (const r of old)
          this.#sql.exec(`INSERT OR IGNORE INTO cpu_probe_steps (run, step, elapsed_ms, iterations, at) VALUES (?, ?, ?, ?, ?)`,
                         LEGACY_PROBE_RUN, r.step, r.elapsed_ms, r.iterations, r.at);
      }
      this.#sql.exec(`DROP TABLE cpu_probe`);
    }
  }

  /** At start, once: the tables; the purge exemptions (R28, R41); the fact `producingGroup` (R1); the scheduler
   *  consumer `group-domain-recheck` (R9, scheduler R8); capture's compute listener (R42); at the first boot, R2 and R13;
   *  and last the scheduler's own `start` (its R11), so the reconcile sees this consumer and starts no probe. */
  async start({ firstBoot } = {}) {
    if (this.#started) return { ok: true, started: false, detail: "this module had already started on this storage" };
    this.#started = true;
    this.migrate();
    const out = { ok: true, started: true };
    out.purge = this.#record().declareTable("instance-setup", INSTANCE_SETUP_TABLE_DECLARATIONS.map((t) => ({ ...t })));
    out.fact = this.#promotion().registerFact("producingGroup", "instance-setup", () => this.producingGroup());
    out.consumer = this.#scheduler().register("instance-setup", { name: "group-domain-recheck", key: "groupdomain",
      due: () => this.groupDomainWake(), wake: () => this.groupDomainWake(), tick: () => this.groupDomainTick() });
    out.compute = this.#capture().on("compute", "instance-setup",
      (m) => this.recordRuntimeObservation({ metric: m && m.metric, ms: m && m.value, detail: m && m.detail,
                                            unit: unitOfMetric(m && m.metric) }));
    const first = firstBoot === undefined ? this.#record().isFirstBoot() : firstBoot === true;
    if (first) {
      out.group = this.#recordGroupAtFirstBoot();
      out.profiles = this.#recordProfilesAtFirstBoot();
      out.assistant = this.#recordAssistantAtFirstBoot();
      /* R50: at setup, the offices the profiles just recorded name are seeded (the machine's act, DEC-52). */
      if (out.profiles && out.profiles.recorded === true) {
        try { out.offices = this.officesSeed({ boot: true }); }
        catch (e) { out.offices = { ok: false, detail: `the offices could not be seeded at setup: ${String(e && e.message || e).slice(0, 200)}` }; }
      }
    }
    /* R62: at each start, with a place named, the profiles that arrived for it; and once, the read `queue-producers`
       raises the administrators' one Status item from (its R38), read as the plane. */
    try { out.places = this.#comparePlaces(); }
    catch (e) { out.places = { compared: false, detail: `the place could not be compared: ${String(e && e.message || e).slice(0, 200)}` }; }
    out.arrivals = this.#registerArrivals();
    /* The instance's start reconciles (scheduler R11), now that this consumer is registered: never `arm`, the producers'
       door, which would start the test seam's probe at every boot (K419). */
    try { out.armed = await this.#scheduler().start(); } catch { out.armed = null; /* the next arm reconciles */ }
    return out;
  }

  /* ---- R1–R4: the producing group ---- */

  /* R62: `placeArrivals` registered once with `queue-producers` (its R38; K31's pattern), read as the plane. */
  #registerArrivals() {
    const qp = this.#queueProducers();
    if (!qp || typeof qp.registerPlaceArrivals !== "function") return { ok: false, detail: "no producers to register with" };
    try { return qp.registerPlaceArrivals(({ viewer } = {}) => this.placeArrivals({ viewer })); }
    catch (e) { return { ok: false, detail: String(e && e.message || e).slice(0, 200) }; }
  }

  /** R1: THE ONE READER — the recorded slug, or null. It reads the store and nothing else, never `env`. */
  producingGroup() {
    const r = this.#one(`SELECT slug FROM instance_group WHERE id=1`);
    return r && typeof r.slug === "string" && r.slug ? r.slug : null;
  }

  /* R2: DECISION (a)'s write, at the first boot only. */
  #recordGroupAtFirstBoot() {
    const slug = String(this.#env.INSTANCE_NAME ?? "").trim();
    if (!GROUP_SLUG_RE.test(slug)) return { recorded: false };
    this.#sql.exec(`INSERT INTO instance_group (id, slug, recorded_at, source, recorded_by)
                    VALUES (1, ?, ?, 'bootstrap', NULL) ON CONFLICT(id) DO NOTHING`, slug, this.#iso());
    return { recorded: true, group: slug };
  }

  /* R53 (K1678): at the first boot, the installer's choice bound as ASSISTANT_ENABLED (`on` or `off`, installer R37),
     recorded with `by` the installer; no binding, or any other value, records nothing and the assistant stays off. */
  #recordAssistantAtFirstBoot() {
    const raw = this.#env.ASSISTANT_ENABLED;
    const v = typeof raw === "string" ? raw.trim().toLowerCase() : "";
    if (v !== "on" && v !== "off")
      return { recorded: false, bound: raw !== undefined && raw !== null && raw !== "",
               ...(raw !== undefined && raw !== null && raw !== "" ? { why: "the installer bound neither on nor off, so the assistant stays off" } : {}) };
    this.#sql.exec(`INSERT INTO assistant_switch (on_, set_by, set_at) VALUES (?, ?, ?)`, v === "on" ? 1 : 0, ASSISTANT_INSTALLER, this.#iso());
    return { recorded: true, on: v === "on" };
  }

  /** R3, op=instancegroup: what this store records — and when it records nothing, that it records nothing. */
  instanceGroup() {
    const r = this.#one(`SELECT slug, recorded_at, source, recorded_by FROM instance_group WHERE id=1`);
    if (r) return { ok: true, group: r.slug, recorded_at: r.recorded_at, source: r.source, recorded_by: r.recorded_by ?? null };
    return { ok: true, group: null, recorded_at: null, source: null, recorded_by: null, detail: NO_GROUP_RECORDED };
  }

  /** R3, REC-163 / IC-174: the PUBLIC projection (Publication §7 point 1: the slug is public, and nothing else in the
   *  row is). It reads through the one reader and selects nothing else. */
  instanceGroupPublic() {
    const slug = this.producingGroup();
    return slug ? { ok: true, group: slug } : { ok: true, group: null, detail: NO_GROUP_RECORDED };
  }

  /** R4, op=instancegroupseed: DECISION (b), the root of trust's one act. The control plane stamps `author`. */
  instanceGroupSeed({ slug = null, author = null } = {}) {
    const s = typeof slug === "string" ? slug.trim() : "";
    /* DEC-49 REGION is-instance-group-seed */
    if (!GROUP_SLUG_RE.test(s))
      return refusal("GROUP_SLUG_MALFORMED",
        `${s ? `'${s.slice(0, 60)}' is not` : "the request names no slug, and a group is recorded as"} a slug in the `
        + `installer's grammar (3 to 40 of a-z, 0-9 and '-', beginning and ending with a letter or digit). `
        + `Nothing was recorded.`);
    const held = this.#one(`SELECT slug, recorded_at, source FROM instance_group WHERE id=1`);
    if (held)
      return refusal("GROUP_ALREADY_RECORDED",
        `this store has recorded its producing group since ${held.recorded_at} (${held.source}), and it is `
        + `recorded once. Nothing was changed.`, { group: held.slug, recorded_at: held.recorded_at, source: held.source });
    /* END DEC-49 REGION is-instance-group-seed */
    const at = this.#iso();
    const who = typeof author === "string" && author.trim() ? author.trim() : null;
    this.#sql.exec(`INSERT INTO instance_group (id, slug, recorded_at, source, recorded_by)
                    VALUES (1, ?, ?, 'seed', ?) ON CONFLICT(id) DO NOTHING`, s, at, who);
    return { ok: true, group: s, recorded_at: at, source: "seed", recorded_by: who,
             note: "every document this store writes from now on names this group. Documents already written are "
                 + "NOT rewritten: whatever group their bytes name is what they were signed under." };
  }

  /* =====================================================================
   * REC-164 — THE PUBLISHING GROUP'S DISPLAY NAME AND ITS VERIFIED DOMAIN (R5–R11). `BIO_Publication_v0_1.md` §7
   * points 2 and 3, resting on point 1's public slug.
   *
   * TWO DURABLE VALUES, EACH WITH A DATED HISTORY: the value is the latest row for its field, and nothing updates or
   * deletes a row. Each is set by an ADMINISTRATOR'S SESSION ACT, and `by` is the control plane's stamp (R29), asked of
   * membership's `isAdministrator` (its R64) — a bearer is refused before this (C-64.4, control-plane's).
   *
   * THE DISPLAY NAME is presentation only (R27): it is written into no signed bytes, and the public read shows it WITH
   * the slug and never without one. THE DOMAIN is a CLAIM, shown publicly only while the latest verdict on the current
   * claim is `verified`. The verifier fetches the well-known file through the per-host governor at the set act and on
   * the reconciling alarm, because a check made once certifies a file the domain can change the next minute. Its
   * verdicts: `verified`, `absent`, `mismatched` and a FOURTH, `undetermined`, which says nothing about the domain and
   * is never recorded as `absent`.
   * ===================================================================== */

  #groupDomainRecheckMs() {
    const v = Number(this.#env.GROUP_DOMAIN_RECHECK_MS);
    return Number.isFinite(v) && v > 0 ? v : GROUP_DOMAIN_RECHECK_MS;
  }

  /* R5: WHO MAY SET EITHER VALUE — an administrator, named by the control plane's stamp, asked before anything is
     read or validated, so a caller with no standing learns nothing about what is recorded. */
  #groupIdentityGate(by) {
    /* DEC-49 REGION is-group-identity-admin */
    if (!by || !this.#membership().isAdministrator(by))
      return refusal("GROUP_IDENTITY_NOT_ADMIN",
        "setting the group's display name or claiming its domain is an administrator's act (Publication §7), and "
        + "your group's Civicsmith stamps who is asking from the signed-in session rather than taking it from the caller. This "
        + "caller is not one of the active administrators.", { by: by ?? null });
    /* END DEC-49 REGION is-group-identity-admin */
    return null;
  }

  #identityCurrent(field) {
    return this.#one(`SELECT value, set_at, set_by, instance_address FROM group_identity_history
                      WHERE field=? ORDER BY seq DESC LIMIT 1`, field) || null;
  }
  #identityHistory(field) {
    return this.#rows(`SELECT value, set_at, set_by FROM group_identity_history WHERE field=? ORDER BY seq`, field)
      .map((r) => ({ value: r.value, set_at: r.set_at, set_by: r.set_by }));
  }
  #domainLatestCheck(domain) {
    const r = this.#one(`SELECT domain, verdict, checked_at, trigger, status, detail FROM group_domain_checks
                         WHERE domain=? ORDER BY seq DESC LIMIT 1`, domain);
    return r ? { ...r } : null;
  }

  /** R6, op=groupnameset — §7 point 2. `by` is the control plane's stamp. */
  groupNameSet({ name = null, by = null } = {}) {
    const gate = this.#groupIdentityGate(by);
    if (gate) return gate;
    const s = typeof name === "string" ? name.trim() : "";
    const chars = [...s].length;
    /* DEC-49 REGION is-group-display-name */
    if (!s || chars > GROUP_DISPLAY_NAME_MAX || /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/.test(s))
      return refusal("GROUP_DISPLAY_NAME_MALFORMED",
        `${s ? `a name of ${chars} characters` : "the request names no display name, and it is set as"} `
        + `one line of 1 to ${GROUP_DISPLAY_NAME_MAX} characters with no control characters. Nothing was set.`);
    /* END DEC-49 REGION is-group-display-name */
    const at = this.#iso();
    this.#sql.exec(`INSERT INTO group_identity_history (field, value, set_at, set_by) VALUES ('display_name', ?, ?, ?)`,
                   s, at, by);
    return { ok: true, display_name: s, set_at: at, set_by: by, history: this.#identityHistory("display_name"),
             note: "presentation only: no signed bytes carry it, and every public surface shows it beside the slug." };
  }

  /** R7, op=groupdomainset — §7 point 3. `by` and `origin` are the control plane's stamps: `origin` is the address the
   *  administrator's session reached, which the domain's well-known file must name. Recorded, checked at once (R8),
   *  and the scheduler armed for the re-check (R9; scheduler R9: a later producer arms itself). */
  async groupDomainSet({ domain = null, by = null, origin = null } = {}) {
    const gate = this.#groupIdentityGate(by);
    if (gate) return gate;
    const d = typeof domain === "string" ? domain.trim().toLowerCase().replace(/\.$/, "") : "";
    /* DEC-49 REGION is-group-domain */
    if (!GROUP_DOMAIN_RE.test(d))
      return refusal("GROUP_DOMAIN_MALFORMED",
        `${d ? `'${d.slice(0, 80)}' is not` : "the request names no domain, and one is claimed as"} a bare host `
        + `name (letters, digits, hyphens and dots, with no scheme, path, port or IP address). Nothing was recorded.`);
    /* END DEC-49 REGION is-group-domain */
    const address = instanceAddress(origin);
    const at = this.#iso();
    this.#sql.exec(`INSERT INTO group_identity_history (field, value, set_at, set_by, instance_address)
                    VALUES ('domain', ?, ?, ?, ?)`, d, at, by, address);
    const check = await this.#checkGroupDomain("set");
    try { await this.#scheduler().arm(); } catch { /* the check above stands; the next arm reconciles */ }
    return { ok: true, domain: d, set_at: at, set_by: by, instance_address: address, check,
             shown_publicly: !!check && check.verdict === "verified", history: this.#identityHistory("domain") };
  }

  /** R8, THE VERIFIER: a governed fetch of the current claim's well-known file, the file from before T31 fetched the
   *  same way only when the first answer is `absent` (the second answer then decides), and one dated verdict. */
  async #checkGroupDomain(trigger) {
    const cur = this.#identityCurrent("domain");
    if (!cur) return null;
    const domain = cur.value;
    const slug = this.producingGroup();
    const address = cur.instance_address || null;
    let verdict = "undetermined", status = null, detail;
    if (!slug || !address) {
      detail = !slug ? "this store records no producing group, so there is no slug for the file to name"
                     : "the claim carries no instance address for the file to name";
    } else {
      const first = await this.#readWellKnown(domain, GROUP_WELL_KNOWN_PATH, address, slug);
      let answer = first;
      if (first.verdict === "absent") {
        const before = await this.#readWellKnown(domain, GROUP_WELL_KNOWN_PATH_BEFORE_T31, address, slug);
        answer = { ...before, detail: `${first.detail}; read instead: ${before.detail}` };
      }
      ({ verdict, status, detail } = answer);
    }
    const at = this.#iso();
    this.#sql.exec(`INSERT INTO group_domain_checks (domain, verdict, checked_at, trigger, status, detail)
                    VALUES (?, ?, ?, ?, ?, ?)`, domain, verdict, at, trigger, status, detail);
    return { domain, verdict, checked_at: at, trigger, status, detail };
  }

  /* R8: ONE governed read of one well-known file on the claimed domain (admit, then report the status), following no
     redirect and reading at most 16 KiB, answered as `{verdict, status, detail}`. */
  async #readWellKnown(domain, path, address, slug) {
    let g;
    try { g = this.#governor().governorAdmit({ host: domain }); }
    catch (e) { g = { admitted: false, reason: `the governor did not answer (${String(e && e.message || e).slice(0, 120)})` }; }
    if (!g || !g.admitted)
      return { verdict: "undetermined", status: null,
               detail: `the per-host governor held ${domain} (${g && g.reason}); this says nothing about the domain` };
    if (g.wait_ms) await this.#sleep(g.wait_ms);
    let res = null;
    try {
      res = await this.#fetch(`https://${domain}${path}`, { redirect: "manual",
        headers: { "user-agent": civicsmithUserAgent(this.#env.VERSION, this.#env.INSTANCE_NAME, "group-domain") } });
    } catch { res = null; }
    if (!res)
      return { verdict: "undetermined", status: null,
               detail: `the fetch of ${path} did not complete, and why was not recorded` };
    const status = res.status;
    try { this.#governor().governorReport({ host: domain, status }); } catch { /* an unrecorded outcome is not a verdict */ }
    if (status === 404 || status === 410 || (status >= 300 && status < 400))
      return { verdict: "absent", status,
               detail: status < 400 ? `the domain redirected ${path} (HTTP ${status}); the file is read on the claimed domain itself`
                                    : `the domain serves no ${path} (HTTP ${status})` };
    if (!(status >= 200 && status < 300))
      return { verdict: "undetermined", status,
               detail: `the domain answered ${path} with HTTP ${status}, which is neither the file nor its absence` };
    const text = await boundedText(res, GROUP_WELL_KNOWN_MAX_BYTES);
    let f = null;
    try { f = JSON.parse(text); } catch { f = null; }
    const isObject = !!f && typeof f === "object" && !Array.isArray(f);
    const inst = isObject && typeof f.instance === "string" ? instanceAddress(f.instance) : null;
    const grp = isObject && typeof f.group === "string" ? f.group.trim() : null;
    if (inst === address && grp === slug)
      return { verdict: "verified", status, detail: `${path} names your group's Civicsmith (${address}) and its slug (${slug})` };
    return { verdict: "mismatched", status,
             detail: !isObject
               ? `${path} is not the JSON object your group's Civicsmith reads ({ instance, group })`
               : `${path} names instance ${JSON.stringify(inst ?? f.instance ?? null).slice(0, 120)} and group `
                 + `${JSON.stringify(grp).slice(0, 60)}; your group's Civicsmith is ${address} and its slug is ${slug}` };
  }

  /** R9, the alarm consumer's two halves: the next re-check is due one interval after the current claim's latest
   *  verdict, and an instance claiming no domain holds no wake. */
  groupDomainWake() {
    const cur = this.#identityCurrent("domain");
    if (!cur) return null;
    const last = this.#domainLatestCheck(cur.value);
    const from = Date.parse((last && last.checked_at) || cur.set_at);
    return (Number.isFinite(from) ? from : 0) + this.#groupDomainRecheckMs();
  }
  async groupDomainTick() {
    return { groupdomain: await this.#checkGroupDomain("alarm") };
  }

  /** R10, op=groupidentity's PUBLIC projection: the slug, the display name only beside a slug, and the domain only
   *  while the latest verdict on the current claim is `verified`. */
  groupIdentityPublic() {
    const slug = this.producingGroup();
    const name = this.#identityCurrent("display_name");
    const dom = this.#identityCurrent("domain");
    const last = dom ? this.#domainLatestCheck(dom.value) : null;
    /* THE VERDICT GATE: the one line that decides whether a claimed domain reaches a stranger. */
    const verified = !!(slug && dom && last && last.verdict === "verified");
    return { ok: true, group: slug,
             display_name: slug && name ? name.value : null,
             domain: verified ? dom.value : null,
             domain_verified_at: verified ? last.checked_at : null,
             ...(slug ? {} : { detail: NO_GROUP_RECORDED }) };
  }

  /** R11, op=groupidentity for a credentialed reader: R10, and the claim, its state and both histories. */
  groupIdentity() {
    const pub = this.groupIdentityPublic();
    /* Read at `max + 1` so `truncated` is measured, never inferred from the count equalling the bound. */
    const max = GROUP_DOMAIN_CHECKS_MAX;
    const checks = this.#rows(`SELECT domain, verdict, checked_at, trigger, status, detail
                                 FROM group_domain_checks ORDER BY seq DESC LIMIT ?`, max + 1);
    const dom = this.#identityCurrent("domain");
    return { ...pub,
             display_name_recorded: this.#identityCurrent("display_name")?.value ?? null,
             display_name_history: this.#identityHistory("display_name"),
             domain_claim: dom ? { domain: dom.value, set_at: dom.set_at, set_by: dom.set_by,
                                   instance_address: dom.instance_address ?? null,
                                   latest: this.#domainLatestCheck(dom.value) } : null,
             domain_history: this.#identityHistory("domain"),
             domain_checks: checks.slice(0, max).map((r) => ({ ...r })),
             domain_checks_limit: max, domain_checks_truncated: checks.length > max };
  }

  /* =====================================================================
   * N10 — THE JURISDICTION PROFILES THIS COPY READS ITS LOCAL FACTS FROM (R12–R16). `build/layers.md`, "No
   * jurisdiction in the product", rule 2: an instance setting chosen at install. The list is record-core's setting
   * `jurisdiction_profiles` (its R26), which `extraction`, `monitoring`, `actions` and `standards` read; this module is
   * its one writer: at the first boot from the installer's binding (R13), and by an administrator's act (R14).
   * No profile is ever chosen for a group: an empty list is valid, and every consumer then answers undetermined.
   * ===================================================================== */

  /* The note R13 leaves when the installer's binding could not be recorded, so R12 can say why. */
  static PROFILES_BOOT_NOTE = "jurisdiction_profiles_boot";

  #checkProfileList(list) {
    const ids = list.map((v) => (typeof v === "string" ? v.trim() : v));
    const J = this.#juris();
    const unknown = ids.filter((id) => typeof id !== "string" || !id || !J.get(id));
    const tests = ids.filter((id) => typeof id === "string" && J.get(id) && J.get(id).test === true);
    return { ids, unknown, tests };
  }

  /* R13: at the first boot, the installer's comma-separated binding, recorded when every id is held and none is a
     test profile; otherwise nothing is recorded, and the note says why. */
  #recordProfilesAtFirstBoot() {
    const raw = this.#env.JURISDICTION_PROFILES;
    if (typeof raw !== "string" || !raw.trim()) return { recorded: false, bound: false };
    const { ids, unknown, tests } = this.#checkProfileList(raw.split(",").map((s) => s.trim()).filter(Boolean));
    const unique = [...new Set(ids)];
    let why = null;
    if (unknown.length) why = `the installer bound ${unknown.map((x) => JSON.stringify(x)).join(", ")}, which your group's Civicsmith does not hold`;
    else if (tests.length) why = `the installer bound ${tests.join(", ")}, a profile made up for testing`;
    const core = this.#record();
    if (why) {
      core.setSetting(InstanceSetup.PROFILES_BOOT_NOTE, { bound: raw, recorded: false, why, at: this.#iso() }, "bootstrap");
      return { recorded: false, bound: true, why };
    }
    const set = core.setSetting("jurisdiction_profiles", unique, "bootstrap");
    return set && set.ok ? { recorded: true, profiles: unique } : { recorded: false, bound: true, why: set && set.reason };
  }

  /** R12, R16: the active profiles, each with its name and what it covers, the conflicts `jurisdictions.combine`
   *  reports over them, the facts of their combined view `agent-worker` reads (`view`, N420), and the held profiles an
   *  administrator may choose among (R15), from the namespace addressed. */
  profiles() {
    const core = this.#record();
    const set = core.getSetting("jurisdiction_profiles");
    const ids = Array.isArray(set) ? set.filter((x) => typeof x === "string") : [];
    const J = this.#juris();
    const choices = J.list().filter((p) => p.test !== true).map((p) => ({ id: p.id, name: p.name, covers: p.covers }));
    const active = ids.map((id) => {
      const p = J.get(id);
      return p ? { id, name: p.name, covers: p.covers } : { id, name: null, covers: null, held: false };
    });
    const combined = ids.length ? J.combine(ids) : { ok: true, conflicts: [] };
    const out = { ok: true, profiles: active, conflicts: combined.ok ? combined.conflicts : [],
                  ...(combined.ok ? {} : { errors: combined.errors }), view: profileView(combined), choices };
    if (!ids.length) {
      out.detail = "no active profile: your group's Civicsmith reads no local facts, which is valid, and every fact that needs one "
        + "is answered as undetermined until an administrator chooses";
      const note = core.getSetting(InstanceSetup.PROFILES_BOOT_NOTE);
      if (note && note.recorded === false && typeof note.why === "string")
        out.boot = { recorded: false, why: note.why, bound: note.bound ?? null };
    }
    return out;
  }

  /** R14, op=profilesset: replaces the list. `by` is the control plane's stamp of an administrator's own session. */
  profilesSet({ profiles = undefined, by = null } = {}) {
    /* DEC-49 REGION is-profiles-admin */
    if (typeof by !== "string" || !by || !this.#membership().isAdministrator(by))
      return refusal("PROFILES_NOT_ADMIN",
        "choosing the jurisdiction profiles is an administrator's act, and your group's Civicsmith stamps who is asking from the "
        + "signed-in session. This caller is not one of the active administrators.", { by: by ?? null });
    /* END DEC-49 REGION is-profiles-admin */
    /* DEC-49 REGION is-profiles-list */
    if (!Array.isArray(profiles))
      return refusal("NOT_A_LIST", "the profiles are sent as a list of profile ids, in the order they are read; an "
        + "empty list chooses none. Nothing was changed.");
    const { ids, unknown, tests } = this.#checkProfileList(profiles);
    if (unknown.length)
      return refusal("UNKNOWN_PROFILE", `your group's Civicsmith holds no profile ${unknown.map((x) => JSON.stringify(x)).join(", ")}. `
        + "Nothing was changed.", { profiles: unknown });
    if (tests.length)
      return refusal("PROFILE_IS_TEST", `${tests.join(", ")} ${tests.length > 1 ? "are profiles" : "is a profile"} made up `
        + "for testing. Nothing was changed.", { profiles: tests });
    /* END DEC-49 REGION is-profiles-list */
    const unique = [...new Set(ids)];
    const set = this.#record().setSetting("jurisdiction_profiles", unique, by);
    if (!set || set.ok !== true) return set;
    /* R62: an arrival leaves when an administrator makes that profile active. */
    this.#leaveArrivals("the profile was made active", this.#iso(), unique);
    return { ...this.profiles(), set_by: by, ...(unique.length < ids.length ? { collapsed: true } : {}),
             note: unique.length
               ? "local facts are read from these profiles, in this order, from now on; what was recorded before is unchanged"
               : "no profile is active from now on: every local fact is answered as undetermined" };
  }

  /* =====================================================================
   * THE BRIDGE AND THE SEATS (R50–R52; A ORG 1a and 1b; K1443, K1468, K1485; K1682's readings 1–4).
   *
   * What the active profiles name is seeded into the registry as identified entities and dated lines, by the machine
   * (DEC-52: `class:admin`) from a system rule, never from a name match (lines R4): the profile's offices and bodies
   * (R50), the Legistar bodies matched to them after normalisation (R51), and the Council's and committees' seats and
   * holders from Legistar's own records (R52). Every entity is found or seeded under a scheme identifier the profile
   * declares (`identifier_schemes`), so a repeat is answered `already` and nothing is seeded twice; nothing is deleted,
   * and an office a profile stops naming keeps its lines as they stand. What cannot be seeded is said, with why: an
   * entry with no identifier seeds nothing, and a `MemberType` the profile does not map records no holder.
   * ===================================================================== */

  #juris() { return this.#deps.jurisdictions ?? { list: heldProfiles, get: heldProfile, combine: combineProfiles }; }
  #entities() { return this.#deps.entities ?? entitiesOf(this.#ctx); }
  #lines() { return this.#deps.lines ?? linesOf(this.#ctx); }

  /* The active profiles, in order, each with its held definition (none for an id no longer held). */
  #activeProfiles() {
    const set = this.#record().getSetting("jurisdiction_profiles");
    const ids = Array.isArray(set) ? set.filter((x) => typeof x === "string" && x) : [];
    return ids.map((id) => ({ id, p: this.#juris().get(id) || null })).filter((x) => x.p);
  }

  /* A profile's scheme by name (jurisdictions R52), or null. */
  static #scheme(p, name) {
    return (Array.isArray(p.identifier_schemes) ? p.identifier_schemes : [])
      .find((x) => x && typeof x === "object" && x.scheme === name) || null;
  }
  /* `{scheme, id}` as a profile states it, or null when it is not one. */
  static #ident(x) {
    return x && typeof x === "object" && typeof x.scheme === "string" && x.scheme.trim()
      && (typeof x.id === "string" ? x.id.trim() : Number.isFinite(x.id))
      ? { scheme: x.scheme.trim(), id: String(x.id).trim() } : null;
  }

  /* Why an identifier cannot hold an entity of `kind` under profile `p`, or null when it can (checked before anything is
     created, so a refusal leaves no entity behind it): the scheme is declared, it identifies that kind, and it names the
     system a machine's identifier rests on (entities R43, K1443). */
  static #identWhy(p, ident, kind) {
    const sch = InstanceSetup.#scheme(p, ident.scheme);
    if (!sch) return `the profile declares no identifier scheme ${ident.scheme}`;
    if (!(Array.isArray(sch.entity_kinds) && sch.entity_kinds.includes(kind)))
      return `the scheme ${ident.scheme} identifies ${(sch.entity_kinds || []).join(", ") || "no kind"}, not a ${kind}`;
    if (!(Array.isArray(sch.systems) && sch.systems.length))
      return `the scheme ${ident.scheme} names no system that issues it, which a machine's identifier rests on`;
    return null;
  }

  /* One entity found or seeded under one identifier: the entity already holding it (a member's, or this module's from
     an earlier run) is `already`; else it is created, machine-declared, and the identifier held on it with the
     system's row as its basis. Answers `{state: seeded | already | unseeded, entity_id?, why?}`. */
  #seedEntity({ p, ident, kind, label, note, row, source, sector }) {
    const why = InstanceSetup.#identWhy(p, ident, kind);
    if (why) return { state: "unseeded", why };
    const E = this.#entities();
    const mine = this.#one(`SELECT entity_id FROM seed_entities WHERE scheme = ? AND id = ?`, ident.scheme, ident.id);
    let held = null;
    try { held = E.entityByIdentifier({ scheme: ident.scheme, id: ident.id }); } catch { held = null; }
    if (held && held.undetermined)
      return { state: "unseeded", why: `more than one entity holds ${ident.scheme} ${ident.id}; which one is meant is a member's to settle`,
               candidates: held.candidates ?? [] };
    if (held && typeof held.entity_id === "string") {
      if (!mine) this.#ledgerEntity(ident, held.entity_id, kind, label, source);
      return { state: "already", entity_id: held.entity_id };
    }
    let entityId = mine ? mine.entity_id : null;
    if (!entityId) {
      const made = E.createEntity({ kind, label, note, declaredBy: SEED_MACHINE, ...(sector ? { sector } : {}) });
      if (!made || made.ok !== true) return { state: "unseeded", why: `the registry refused the entity: ${made && (made.reason || made.detail)}` };
      entityId = made.entity_id;
      this.#ledgerEntity(ident, entityId, kind, label, source);
    }
    const sch = InstanceSetup.#scheme(p, ident.scheme);
    const id = E.addIdentifier({ entityId, scheme: ident.scheme, id: ident.id, by: SEED_MACHINE,
                                 basis: { system: sch.systems[0], row } });
    if (!id || id.ok !== true)
      return { state: "unseeded", entity_id: entityId,
               why: `the registry refused the identifier ${ident.scheme} ${ident.id}: ${id && (id.reason || id.detail)}; the entity is kept and a later seeding holds it again` };
    return { state: id.already ? "already" : "seeded", entity_id: entityId };
  }
  #ledgerEntity(ident, entityId, kind, label, source) {
    this.#sql.exec(`INSERT INTO seed_entities (scheme, id, entity_id, kind, label, source, seeded_at) VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(scheme, id) DO NOTHING`, ident.scheme, ident.id, entityId, kind, label, JSON.stringify(source), this.#iso());
  }

  /* One line recorded once, keyed by its kind, its ends and the source row it rests on (`lines.recordLine`, machine
     from a system rule whose two ends the identifiers name, lines R4). Answers like `#seedEntity`. */
  #seedLine({ key, kind, from, to, capacity, valid, basis }) {
    const held = this.#one(`SELECT line_id FROM seed_lines WHERE key = ?`, key);
    if (held) return { state: "already", line_id: held.line_id };
    const r = this.#lines().recordLine({ kind, from, to, ...(capacity ? { capacity } : {}), ...(valid ? { valid } : {}),
                                         basis, by: SEED_MACHINE });
    if (!r || r.ok !== true) return { state: "unseeded", why: `the lines refused it: ${r && (r.reason || r.detail)}` };
    this.#sql.exec(`INSERT INTO seed_lines (key, kind, from_entity, to_entity, line_id, seeded_at) VALUES (?, ?, ?, ?, ?, ?)`,
                   key, kind, from, to, r.line_id, this.#iso());
    return { state: "seeded", line_id: r.line_id };
  }

  /** R50, op=officesseed: each office the active profiles name (jurisdictions R24) seeded as an `office`, its body as a
   *  `body`, each under the profile's identifier for it, with `post_in` from the office to its body and `part_of` from
   *  the body to the organisation the profile names it within. An administrator's act (`by`, the control plane's stamp);
   *  at setup the boot runs it once after R13 (`boot: true`). Answers what was seeded, already held, and could not be. */
  officesSeed({ by = null, boot = false } = {}) {
    if (!boot && (typeof by !== "string" || !by || !this.#membership().isAdministrator(by)))
      return notAnAdmin(by ?? null, "seeding the offices the jurisdiction profiles name");
    const out = { ok: true, seeded: [], already: [], unseeded: [], by: boot ? SEED_MACHINE : by };
    const put = (r, item) => { out[r.state === "seeded" ? "seeded" : r.state === "already" ? "already" : "unseeded"].push(
      { ...item, ...(r.entity_id ? { entity_id: r.entity_id } : {}), ...(r.line_id ? { line_id: r.line_id } : {}),
        ...(r.why ? { why: r.why } : {}), ...(r.candidates ? { candidates: r.candidates } : {}) }); };
    const active = this.#activeProfiles();
    if (!active.length) out.detail = "no profile is active, so no office is named and nothing is seeded";
    for (const { id: profile, p } of active) {
      const cps = Array.isArray(p.counterparties) ? p.counterparties : [];
      cps.forEach((cp, i) => {
        const entry = `counterparties[${i}]`;
        const role = cp && typeof cp.role === "string" ? cp.role.trim() : "";
        const body = cp && typeof cp.body === "string" ? cp.body.trim() : "";
        const where = { profile, entry, role, body };
        const ids = cp && cp.ids && typeof cp.ids === "object" ? cp.ids : {};
        const officeId = InstanceSetup.#ident(ids.office), bodyId = InstanceSetup.#ident(ids.body);
        const source = { profile, entry };
        const cite = `jurisdiction profile ${profile}, ${entry}${cp.basis ? ` (basis: ${cp.basis})` : ""}`;
        /* Each entity is seeded when, and only when, the profile gives its own identifier for it: the body under
           `ids.body` whether or not the office has one, the office under `ids.office` (K1682's reading 1; N613). */
        const noIdent = (what, field) => ({ state: "unseeded", why: `the profile names no identifier for this ${what} `
          + `(${field}), so it is not seeded: an entity is seeded only under the profile's own identifier, never by its name` });
        const b = bodyId ? this.#seedEntity({ p, ident: bodyId, kind: "body", label: body, sector: "government", source,
          row: `${profile}/${entry}/body`, note: `The body the office "${role}" belongs to, as the active ${cite} names it; seeded at setup.` })
          : noIdent("body", "ids.body");
        put(b, { what: "body", ...where, ...(bodyId ? { ident: bodyId } : {}) });
        const bodyHeld = !!b.entity_id && b.state !== "unseeded";
        if (bodyHeld)
          this.#sql.exec(`INSERT INTO seed_bodies (profile, role, body, entry, body_entity, seeded_at)
                          VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(profile, role, body) DO NOTHING`,
                         profile, role, body, entry, b.entity_id, this.#iso());
        const o = officeId ? this.#seedEntity({ p, ident: officeId, kind: "office", label: `${role}, ${body}`, source,
          row: `${profile}/${entry}/office`, note: `An office an action may be addressed to, as the active ${cite} names it; seeded at setup.` })
          : noIdent("office", "ids.office");
        put(o, { what: "office", ...where, ...(officeId ? { ident: officeId } : {}) });
        const officeHeld = !!o.entity_id && o.state !== "unseeded";
        /* K1683: the office's row names its body's entity, or '' when the body is not held under an identifier. */
        if (officeHeld)
          this.#sql.exec(`INSERT INTO seed_offices (profile, role, body, entry, office_entity, body_entity, seeded_at)
                          VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(profile, role, body) DO NOTHING`,
                         profile, role, body, entry, o.entity_id, bodyHeld ? b.entity_id : "", this.#iso());
        const zone = zoneOf(p) ? { zone: zoneOf(p) } : null;
        const rule = (ids2) => ({ rule: "a jurisdiction profile's office entry, seeded at setup", source, ids: ids2 });
        /* A line needs both its ends held under identifiers. Neither held: the two entities' answers say why, and no
           line is named; one held: the line is answered could-not-be-seeded, naming the end that is missing. */
        if (officeHeld && bodyHeld)
          put(this.#seedLine({ key: `post_in|${o.entity_id}|${b.entity_id}|${profile}`, kind: "post_in",
                               from: o.entity_id, to: b.entity_id, valid: zone, basis: rule({ from: officeId, to: bodyId }) }),
              { what: "post_in", ...where });
        else if (officeHeld || bodyHeld)
          put({ state: "unseeded", why: `its ${officeHeld ? "body" : "office"} is not held under an identifier, so the line has `
            + "only one identified end" }, { what: "post_in", ...where });
        if (!bodyHeld) return;
        const within = cp.within && typeof cp.within === "object" ? cp.within : null;
        const withinId = within ? InstanceSetup.#ident(within.ids) : null;
        if (!within) {
          put({ state: "unseeded", why: "the profile names no organisation this body is within, so no part_of line is seeded" },
              { what: "part_of", ...where });
          return;
        }
        const wLabel = typeof within.label === "string" && within.label.trim() ? within.label.trim() : null;
        const wKind = ["institution", "body", "movement"].includes(within.kind) ? within.kind : "institution";
        if (!withinId || !wLabel) {
          put({ state: "unseeded", why: `the profile names the organisation this body is within with no ${!wLabel ? "label" : "identifier (within.ids)"}, `
            + "so it is not seeded and no part_of line is" }, { what: "part_of", ...where });
          return;
        }
        const w = this.#seedEntity({ p, ident: withinId, kind: wKind, label: wLabel, sector: "government", source,
          row: `${profile}/${entry}/within`, note: `The organisation the body "${body}" is part of, as the active ${cite} names it; seeded at setup.` });
        put(w, { what: "organisation", ...where, label: wLabel, ident: withinId });
        if (!w.entity_id || w.state === "unseeded") {
          put({ state: "unseeded", why: "the organisation is not held under its identifier, so the line has no identified ends" },
              { what: "part_of", ...where });
          return;
        }
        put(this.#seedLine({ key: `part_of|${b.entity_id}|${w.entity_id}|${profile}`, kind: "part_of",
                             from: b.entity_id, to: w.entity_id, valid: zone, basis: rule({ from: bodyId, to: withinId }) }),
            { what: "part_of", ...where });
      });
    }
    out.counts = { seeded: out.seeded.length, already: out.already.length, unseeded: out.unseeded.length };
    return out;
  }

  /** K1683: the office a seeded office entity is, as `{role, body}` (with its profile), or null for an entity this
   *  module did not seed from a profile office (`profile` given: from that profile only). Writes nothing; never throws. */
  officeOf(entityId, profile = null) {
    try {
      if (typeof entityId !== "string" || !entityId) return null;
      const rows = this.#rows(`SELECT profile, role, body FROM seed_offices WHERE office_entity = ? ORDER BY profile, role, body`, entityId)
        .filter((r) => profile == null || r.profile === profile);
      return rows.length ? { role: rows[0].role, body: rows[0].body, profile: rows[0].profile } : null;
    } catch { return null; }
  }

  /** K1683: the office entity seeded for a profile office `{role, body}`, or null: none seeded, or more than one
   *  entity seeded under that role and body (two profiles naming it with different identifiers), which is not
   *  settled here. Writes nothing; never throws. */
  officeEntityOf({ role = null, body = null } = {}) {
    try {
      const r = typeof role === "string" ? role.trim() : "", b = typeof body === "string" ? body.trim() : "";
      if (!r || !b) return null;
      const ids = [...new Set(this.#rows(`SELECT office_entity FROM seed_offices WHERE role = ? AND body = ?`, r, b).map((x) => x.office_entity))];
      return ids.length === 1 ? ids[0] : null;
    } catch { return null; }
  }

  /* A held capture's text, locator and instant (`deps.readCapture`, else the record's evidence store and the receipt
     provenance holds for it), or null. */
  async #readCapture(sha) {
    if (typeof this.#deps.readCapture === "function") return this.#deps.readCapture(sha);
    const store = this.#record().evidenceStore ? this.#record().evidenceStore() : null;
    const obj = store ? await store.get(sha) : null;
    if (!obj) return null;
    const text = new TextDecoder().decode(new Uint8Array(await obj.arrayBuffer()));
    const got = provenanceOf(this.#ctx).receipts();
    const first = (got && Array.isArray(got.rows) ? got.rows : []).filter((r) => r && r.capture_sha === sha)
      .sort((a, b) => Date.parse(a.first_retrieved) - Date.parse(b.first_retrieved))[0];
    return first ? { text, locator: first.address, at: first.first_retrieved } : null;
  }

  /* R51: the profile bodies (the active profiles' counterparty bodies) matched to the Legistar bodies of one parsed
     `bodies` capture, by exact equality of normalised forms: a Legistar body's form is the organisation the
     body-variant map names for it, else its marker-stripped base name folded; a profile body's forms are its own name
     folded and, where its entry names one, its `organisation` key. One form's several `BodyId`s are one match. */
  #matchBodies(parsed, active) {
    const groups = new Map();
    for (const r of parsed.rows) {
      const f = r.facts || {};
      const form = typeof f.organisation === "string" && f.organisation ? `organisation:${f.organisation}`
        : `name:${termFold(f.base ?? f.name ?? "")}`;
      if (form === "name:") continue;
      if (!groups.has(form)) groups.set(form, []);
      groups.get(form).push({ BodyId: f.BodyId, name: f.name, source: r.source });
    }
    const out = [];
    for (const { id: profile, p } of active) {
      const view = { vocabulary: p.vocabulary || {} };
      (Array.isArray(p.counterparties) ? p.counterparties : []).forEach((cp, i) => {
        const body = cp && typeof cp.body === "string" ? cp.body.trim() : "";
        if (!body) return;
        const read = legistarBodyName(body, { view });
        const forms = new Set([`name:${termFold(read.base)}`, `name:${termFold(body)}`]);
        for (const o of [cp.organisation, read.organisation]) if (typeof o === "string" && o) forms.add(`organisation:${o}`);
        const hits = [...forms].filter((f) => groups.has(f));
        const entry = `counterparties[${i}]`;
        const role = typeof cp.role === "string" ? cp.role.trim() : "";
        /* R52: the body's organisation, for the MemberType map: the counterparty's own key, else the one its name reads as. */
        const organisation = [cp.organisation, read.organisation, hits.length === 1 && hits[0].startsWith("organisation:")
          ? hits[0].slice("organisation:".length) : null].find((o) => typeof o === "string" && o) ?? null;
        if (hits.length === 1) { out.push({ profile, entry, role, body, matched: true, form: hits[0], organisation, bodies: groups.get(hits[0]) }); return; }
        const terms = termFold(body).split(/[^\p{L}\p{N}]+/u).filter((t) => t.length > 2);
        const near = hits.length > 1 ? hits.flatMap((h) => groups.get(h))
          : [...groups.values()].flat().filter((g) => terms.length && terms.every((t) => termFold(g.name).includes(t)));
        out.push({ profile, entry, role, body, matched: false, candidates: near.slice(0, 20).map((g) => ({ BodyId: g.BodyId, name: g.name })),
          why: hits.length > 1 ? "its normalised forms equal more than one Legistar body's; it is never resolved by choosing one, and a member may match it by their own act"
                               : "no Legistar body's normalised form equals it; it is never matched by a near name, and a member may match it by their own act" });
      });
    }
    return out;
  }

  /** R51, R52, op=seatsseed: from held captures of the client's `bodies`, `persons` and `officerecords` (each a sha, the
   *  office records one or more pages), the profile bodies matched to Legistar bodies (R51), each match's `BodyId`s held
   *  on the body entity, and each seat on a matched body seeded with its holder (R52). An administrator's act. */
  async seatsSeed({ bodies = null, persons = null, officerecords = null, by = null } = {}) {
    if (typeof by !== "string" || !by || !this.#membership().isAdministrator(by))
      return notAnAdmin(by ?? null, "seeding the seats Legistar records");
    const active = this.#activeProfiles();
    const want = { bodies: [bodies], persons: [persons], officerecords: Array.isArray(officerecords) ? officerecords : [officerecords] };
    const parsed = {};
    for (const [endpoint, shas] of Object.entries(want)) {
      const list = shas.filter((x) => x !== null && x !== undefined);
      if (!list.length || list.some((x) => typeof x !== "string" || !x.trim()))
        return refusal("SEED_CAPTURE_UNREADABLE", `the request names no capture of Legistar's ${endpoint}. Nothing was seeded.`, { endpoint });
      const pages = [];
      for (const sha of list) {
        let cap = null;
        try { cap = await this.#readCapture(sha.trim().toLowerCase()); } catch { cap = null; }
        if (!cap || typeof cap.text !== "string")
          return refusal("SEED_CAPTURE_UNREADABLE", `the record holds no readable capture ${sha.slice(0, 64)}. Nothing was seeded.`,
                         { endpoint, capture: sha });
        let one = null;
        try {
          one = legistarParse({ locator: cap.locator, text: cap.text, at: cap.at ?? null,
                                view: { vocabulary: Object.assign({}, ...active.map(({ p }) => p.vocabulary || {})) } });
        } catch (e) { one = { why: String(e && e.message || e) }; }
        if (!one || one.why || one.endpoint !== endpoint)
          return refusal("SEED_CAPTURE_NOT_LEGISTAR", `capture ${sha.slice(0, 64)} is not a Legistar ${endpoint} list`
            + `${one && one.why ? ` (${one.why.slice(0, 200)})` : one && one.endpoint ? ` (it is ${one.endpoint})` : ""}. Nothing was seeded.`,
            { endpoint, capture: sha });
        pages.push({ ...one, sha: sha.trim().toLowerCase(), at: cap.at ?? null });
      }
      parsed[endpoint] = pages;
    }
    const out = { ok: true, matches: [], unmatched: [], seeded: [], already: [], unseeded: [], holders_undetermined: [],
                  bodies_without_records: [], same_names: [], by };
    const put = (r, item) => { out[r.state === "seeded" ? "seeded" : r.state === "already" ? "already" : "unseeded"].push(
      { ...item, ...(r.entity_id ? { entity_id: r.entity_id } : {}), ...(r.line_id ? { line_id: r.line_id } : {}),
        ...(r.why ? { why: r.why } : {}) }); };
    if (!active.length) { out.detail = "no profile is active, so no body is named and nothing is seeded"; return out; }
    const bodiesCap = parsed.bodies[0];
    const instant = (at) => (typeof at === "string" && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d/.test(at) ? `${at.slice(0, 19)}Z` : null);
    /* R51: the matches, each BodyId held on the profile's seeded body entity. */
    const seatBodies = new Map();   // BodyId → {entity, p, profile, label, ident}
    for (const m of this.#matchBodies(bodiesCap, active)) {
      if (!m.matched) { out.unmatched.push(m); continue; }
      const { p } = active.find((a) => a.id === m.profile);
      const sch = InstanceSetup.#scheme(p, LEGISTAR_SCHEMES.body);
      const office = this.#one(`SELECT body_entity FROM seed_bodies WHERE profile = ? AND role = ? AND body = ?`, m.profile, m.role, m.body);
      const match = { profile: m.profile, entry: m.entry, role: m.role, body: m.body, form: m.form,
                      bodies: m.bodies.map((b) => ({ BodyId: b.BodyId, name: b.name })) };
      out.matches.push(match);
      if (!office) { match.why = "the profile's body is not seeded (R50: the profile names no identifier for it, ids.body), so its BodyIds are held on no entity"; continue; }
      if (!sch) { match.why = `the profile declares no identifier scheme ${LEGISTAR_SCHEMES.body}, so its BodyIds are held on no entity`; continue; }
      for (const b of m.bodies) {
        const ident = { scheme: LEGISTAR_SCHEMES.body, id: String(b.BodyId) };
        const why = InstanceSetup.#identWhy(p, ident, "body");
        let r;
        if (why) r = { state: "unseeded", why };
        else {
          const got = this.#entities().addIdentifier({ entityId: office.body_entity, scheme: ident.scheme, id: ident.id, by: SEED_MACHINE,
                                                       basis: { system: sch.systems[0], row: `legistar:body:${b.BodyId}` } });
          r = got && got.ok === true ? { state: got.already ? "already" : "seeded", entity_id: office.body_entity }
            : { state: "unseeded", why: `the registry refused the identifier: ${got && (got.reason || got.detail)}` };
          if (r.state !== "unseeded") {
            this.#ledgerEntity(ident, office.body_entity, "body", m.body, { capture: bodiesCap.sha, row: b.source });
            seatBodies.set(b.BodyId, { entity: office.body_entity, p, profile: m.profile, label: m.body, ident,
                                       organisation: m.organisation });
          }
        }
        put(r, { what: "body_identifier", profile: m.profile, body: m.body, ident });
      }
    }
    /* R52: the seats of the matched bodies, and their holders. */
    const people = new Map();
    for (const r of parsed.persons[0].rows) people.set(r.facts.PersonId, r);
    const records = legistarPages(parsed.officerecords);
    const recRows = Array.isArray(records.rows) ? records.rows : [];
    out.records = { pages: records.pages, complete: records.complete, conflicts: records.conflicts, refused: records.refused,
                    ...(records.why ? { why: records.why } : {}) };
    const pageOf = (row) => parsed.officerecords.find((pg) => pg.rows.includes(row)) || parsed.officerecords[0];
    const seen = new Set();
    for (const row of recRows) {
      const f = row.facts || {};
      const sb = seatBodies.get(f.BodyId);
      if (!sb) continue;
      seen.add(f.BodyId);
      const page = pageOf(row) || parsed.officerecords[0];
      const recordedAt = instant(page.at);
      const seatIdent = { scheme: LEGISTAR_SCHEMES.seat, id: String(f.OfficeRecordId) };
      const memberType = typeof f.role === "string" ? f.role.trim() : "";
      const seat = this.#seedEntity({ p: sb.p, ident: seatIdent, kind: "office", label: `${memberType || "Seat"}, ${sb.label}`,
        source: { capture: page.sha, row: row.source }, row: row.key,
        note: `A seat on ${sb.label}, Legistar office record ${f.OfficeRecordId}, ${LEGISTAR_BASIS} (its MemberType: ${memberType || "not given"}).` });
      const where = { OfficeRecordId: f.OfficeRecordId, BodyId: f.BodyId, PersonId: f.PersonId ?? null };
      put(seat, { what: "seat", ...where });
      if (!seat.entity_id || seat.state === "unseeded") continue;
      const basis = (ids) => ({ rule: "a Legistar office record", source: page.sha, system: LEGISTAR_KEY, recorded_at: recordedAt,
                                row: row.source, ids });
      put(this.#seedLine({ key: `seat_on|${seat.entity_id}|${sb.entity}|${row.key}`, kind: "seat_on", from: seat.entity_id,
                           to: sb.entity, basis: basis({ from: seatIdent, to: sb.ident }) }), { what: "seat_on", ...where });
      const pr = people.get(f.PersonId);
      if (!Number.isInteger(f.PersonId) || !pr) {
        out.holders_undetermined.push({ ...where, why: Number.isInteger(f.PersonId)
          ? `the persons capture holds no PersonId ${f.PersonId}, so the holder is not seeded` : "the office record names no PersonId" });
        continue;
      }
      const name = pr.facts.name_normal || pr.facts.name || `Legistar person ${f.PersonId}`;
      const others = Array.isArray(pr.same_name_as) ? pr.same_name_as : [];
      const personIdent = { scheme: LEGISTAR_SCHEMES.person, id: String(f.PersonId) };
      const person = this.#seedEntity({ p: sb.p, ident: personIdent, kind: "person", label: name,
        source: { capture: parsed.persons[0].sha, row: pr.source }, row: pr.key,
        note: `Legistar person ${f.PersonId}, ${LEGISTAR_BASIS}.` + (others.length
          ? ` Legistar also lists ${others.map((x) => `PersonId ${x}`).join(", ")} under the same name; they are held as `
            + "separate persons and never merged here: whether they are one person is a member's claim." : "") });
      if (others.length && !out.same_names.some((s2) => s2.PersonId === f.PersonId))
        out.same_names.push({ PersonId: f.PersonId, name, same_name_as: others });
      put(person, { what: "person", ...where });
      if (!person.entity_id || person.state === "unseeded") continue;
      /* jurisdictions R60 (K1729): an entry for the seat's body's organisation is read before one for all bodies. */
      const types = (sb.p.vocabulary && Array.isArray(sb.p.vocabulary.member_types) ? sb.p.vocabulary.member_types : [])
        .filter((x) => x && x.member_type === memberType);
      const map = (sb.organisation ? types.find((x) => x.organisation === sb.organisation) : null)
        ?? types.find((x) => x.organisation === undefined || x.organisation === null);
      const capacity = map && LINE_CAPACITIES.includes(map.capacity) ? map.capacity : null;
      if (!capacity) {
        out.holders_undetermined.push({ ...where, person: person.entity_id, seat: seat.entity_id,
          why: `the profile maps no capacity for the MemberType ${JSON.stringify(memberType)}${sb.organisation ? ` on ${sb.organisation}` : " on this body"} `
            + "or on all bodies, so the holder's capacity is undetermined and no holds line is recorded" });
        continue;
      }
      const zone = zoneOf(sb.p) ?? undefined;
      put(this.#seedLine({ key: `holds|${person.entity_id}|${seat.entity_id}|${row.key}`, kind: "holds", from: person.entity_id,
                           to: seat.entity_id, capacity,
                           valid: { from: f.start ?? null, to: f.end ?? null, precision: "day", ...(zone ? { zone } : {}) },
                           basis: basis({ from: personIdent, to: seatIdent }) }),
          { what: "holds", ...where, capacity, start: f.start ?? null, end: f.end ?? null, dated: `${LEGISTAR_BASIS} on ${recordedAt}` });
    }
    for (const [bodyId, sb] of seatBodies)
      if (!seen.has(bodyId)) out.bodies_without_records.push({ BodyId: bodyId, body: sb.label,
        why: "Legistar holds no office record for this body (as for the boards and commissions), so no seat is seeded" });
    out.counts = { matched: out.matches.length, unmatched: out.unmatched.length, seeded: out.seeded.length,
                   already: out.already.length, unseeded: out.unseeded.length, holders_undetermined: out.holders_undetermined.length };
    return out;
  }

  /* =====================================================================
   * THE ASSISTANT, OPTIONAL FOR THE COPY, AND EACH MEMBER'S DISCLOSURE (R53–R55; K1502, K1478 (i), D311).
   *
   * The copy holds no Claude credential: enabling the assistant binds none, and each member who wants it connects their
   * own account (credentials R22). The switch is the administrator's (K1522), off unless chosen, and every set is
   * appended with who and when. While it is off, every ask and every run is refused by name (`ASSISTANT_OFF`) through
   * `assistantGate`, which the plane and `answers` read before any model turn; turning it off ends nothing recorded.
   * ===================================================================== */

  /** R53: the switch as recorded, off when nothing is. Writes nothing and never throws. */
  assistantState() {
    let r = null;
    try { r = this.#one(`SELECT on_, set_by, set_at FROM assistant_switch ORDER BY seq DESC LIMIT 1`); } catch { r = null; }
    return r ? { ok: true, on: r.on_ === 1, set_by: r.set_by, set_at: r.set_at }
             : { ok: true, on: false, set_by: null, set_at: null,
                 detail: "the assistant has never been switched on for your group's Civicsmith, so it is off" };
  }

  /** R53, op=assistantset: an administrator switches the assistant on or off for this copy. `by` is the control
   *  plane's stamp (R29). Each set is appended, a repeat of the current value included, so the history says who
   *  chose what and when. */
  assistantSet({ on = undefined, by = null } = {}) {
    if (typeof by !== "string" || !by || !this.#membership().isAdministrator(by))
      return notAnAdmin(by ?? null, "switching the assistant on or off for your group's Civicsmith");
    /* DEC-49 REGION is-assistant-switch */
    if (typeof on !== "boolean")
      return refusal("ASSISTANT_SWITCH_MALFORMED", "`on` is true (switch the assistant on) or false (switch it off). "
        + "Nothing was changed.");
    /* END DEC-49 REGION is-assistant-switch */
    const at = this.#iso();
    this.#sql.exec(`INSERT INTO assistant_switch (on_, set_by, set_at) VALUES (?, ?, ?)`, on ? 1 : 0, by, at);
    return { ok: true, on, set_by: by, set_at: at,
             history: this.#rows(`SELECT on_, set_by, set_at FROM assistant_switch ORDER BY seq`)
               .map((r) => ({ on: r.on_ === 1, set_by: r.set_by, set_at: r.set_at })),
             note: on
               ? "the assistant is on for your group's Civicsmith. Switching it on binds no account: each member who "
                 + "wants it is served by their own Claude account or API key, connected by their own act, or by the "
                 + "group's Anthropic API key, which an administrator sets, switches and removes; each is told first "
                 + "where their questions go."
               : "the assistant is off for your group's Civicsmith: no ask is put to it and no run starts. Nothing already recorded "
                 + "is changed or ended." };
  }

  /** R55: null while the assistant is on; otherwise the refusal every ask and every run answers, whoever asks and
   *  whatever account they hold. A standing question is not run while it is off. Writes nothing. */
  assistantGate() {
    const st = this.assistantState();
    if (st.on === true) return null;
    /* DEC-49 REGION is-assistant-on */
    return refusal("ASSISTANT_OFF", st.set_at
      ? `an administrator switched the assistant off for your group's Civicsmith on ${st.set_at}; no ask is put to it and no run starts.`
      : "the assistant has never been switched on for your group's Civicsmith; no ask is put to it and no run starts.",
      { set_by: st.set_by, set_at: st.set_at });
    /* END DEC-49 REGION is-assistant-on */
  }

  /** R54, op=disclosureshown: the disclosure was shown to `member` before they connected their own account. `by` is
   *  the control plane's stamp and must be that member's own session: no one records it on another's behalf. */
  disclosureShown({ member = null, version = null, by = null } = {}) {
    const m = typeof member === "string" ? member.trim() : "";
    const v = typeof version === "string" ? version.trim() : "";
    /* DEC-49 REGION is-disclosure-shown */
    if (!m || !v)
      return refusal("DISCLOSURE_MALFORMED", `${!m ? "the request names no member" : "the request names no version of "
        + "the disclosure's words"}. Nothing was recorded.`);
    if (typeof by !== "string" || by !== m || /^class:/.test(by))
      return refusal("DISCLOSURE_NOT_THE_MEMBERS", "the disclosure is recorded by the member it was shown to, from "
        + "their own signed-in session. Nothing was recorded.", { member: m, by: by ?? null });
    /* END DEC-49 REGION is-disclosure-shown */
    const at = this.#iso();
    this.#sql.exec(`INSERT INTO assistant_disclosures (member, version, shown_by, shown_at) VALUES (?, ?, ?, ?)`,
                   m, v.slice(0, 80), by, at);
    return { ok: true, member: m, version: v.slice(0, 80), shown_at: at, shown: v.slice(0, 80) === ASSISTANT_DISCLOSURE.version };
  }

  /** R54: whether the disclosure at the current version (or `version`) was recorded as shown to `member`. A member with
   *  none recorded is `shown: false`, never assumed. Writes nothing and never throws. */
  disclosureOf({ member = null, version = ASSISTANT_DISCLOSURE.version } = {}) {
    const m = typeof member === "string" ? member.trim() : "";
    const v = typeof version === "string" && version.trim() ? version.trim() : ASSISTANT_DISCLOSURE.version;
    let r = null;
    try {
      r = m ? this.#one(`SELECT version, shown_at FROM assistant_disclosures WHERE member = ? AND version = ?
                         ORDER BY seq DESC LIMIT 1`, m, v) : null;
    } catch { r = null; }
    return r ? { ok: true, member: m, version: v, shown: true, shown_at: r.shown_at }
             : { ok: true, member: m || null, version: v, shown: false, shown_at: null,
                 detail: m ? "no disclosure at this version is recorded as shown to this member"
                           : "the request names no member, so no disclosure is recorded as shown" };
  }

  /* =====================================================================
   * A PLACE NOT YET HELD (R60, R62; DEC-150). An administrator may name the place the group works in when no held
   * profile covers it. The name is held only here: no public read, notice, submission, edition, export or request to
   * another host carries it, and it is never a profile, a jurisdiction or a local fact. At each start, a held profile
   * that matches it and was not held before is recorded once as an arrival, which `queue-producers` (its R38) raises to
   * the administrators as one Status item through the read this module registers; it leaves when that profile is made
   * active (R14) or the name is cleared or changed.
   * ===================================================================== */

  #placeCurrent() {
    return this.#one(`SELECT seq, name, set_by, set_at FROM place_wanted ORDER BY seq DESC LIMIT 1`) || null;
  }
  /* The held profiles a place can arrive as: every held profile that is not a test profile, by id. */
  #heldPlaceIds() {
    return this.#juris().list().filter((p) => p && p.test !== true && typeof p.id === "string").map((p) => p.id);
  }
  #seePlaces(at) {
    this.#sql.exec(`INSERT INTO place_seen (id, profiles, seen_at) VALUES (1, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET profiles = excluded.profiles, seen_at = excluded.seen_at`,
                   JSON.stringify(this.#heldPlaceIds()), at);
  }
  #leaveArrivals(why, at, profiles = null) {
    for (const r of this.#rows(`SELECT seq, profile FROM place_arrivals WHERE left_at IS NULL`))
      if (!profiles || profiles.includes(r.profile))
        this.#sql.exec(`UPDATE place_arrivals SET left_at = ?, left_why = ? WHERE seq = ?`, at, why, r.seq);
  }
  /* R62: a profile matches the named place when its name or one of its covers, folded as extraction's term fold, is
     exactly the name folded the same way. */
  static #placeMatches(p, name) {
    const want = termFold(name);
    return !!want && [p && p.name, ...(p && Array.isArray(p.covers) ? p.covers : [])]
      .some((x) => typeof x === "string" && termFold(x) === want);
  }

  /** R60, op=placewanted: an administrator names the place the group works in that no held profile covers, or clears
   *  it with `name: null`. `by` is the control plane's stamp (R29). Each set or clear is appended with who and when. */
  placeWantedSet({ name = undefined, by = null } = {}) {
    if (typeof by !== "string" || !by || !this.#membership().isAdministrator(by))
      return notAnAdmin(by ?? null, "naming the place your group works in");
    let value = null;
    if (name !== null) {
      const s = typeof name === "string" ? name.trim() : "";
      const chars = [...s].length;
      /* DEC-49 REGION is-place-name */
      if (!s || chars > PLACE_NAME_MAX || /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/.test(s))
        return refusal("PLACE_NAME_MALFORMED", `${s ? `a name of ${chars} characters` : "the request names no place, and "
          + "one is named as"} one line of 1 to ${PLACE_NAME_MAX} characters with no control characters; null clears it. `
          + "Nothing was changed.");
      /* END DEC-49 REGION is-place-name */
      value = s;
    }
    const at = this.#iso();
    const before = this.#placeCurrent();
    this.#sql.exec(`INSERT INTO place_wanted (name, set_by, set_at) VALUES (?, ?, ?)`, value, by, at);
    /* R62: the open arrivals leave when the name is cleared or changed; the profiles held now are what a later start
       compares against, so a profile already held when the name is set is not an arrival. */
    if (before && before.name !== null && before.name !== value)
      this.#leaveArrivals(value === null ? "the name was cleared" : "the name was changed", at);
    this.#seePlaces(at);
    return { ok: true, name: value, set_by: by, set_at: at,
             history: this.#rows(`SELECT name, set_by, set_at FROM place_wanted ORDER BY seq`).map((r) => ({ ...r })),
             note: value === null
               ? "no place is named. Nothing about it was ever sent anywhere."
               : "the name is kept only in your group's Civicsmith and sent nowhere. When an installed update brings a "
                 + "profile for it, the administrators are told once and may choose it under Places." };
  }

  /** R60, op=placewantedstate: the named place, to an administrator only, with R62's open arrivals as `matches`. */
  placeWanted({ viewer = null } = {}) {
    if (typeof viewer !== "string" || !viewer || !this.#membership().isAdministrator(viewer))
      return notAnAdmin(viewer ?? null, "reading the place your group named");
    const cur = this.#placeCurrent();
    return { ok: true, name: cur ? cur.name : null, set_by: cur ? cur.set_by : null, set_at: cur ? cur.set_at : null,
             matches: this.placeArrivals({ viewer }) };
  }

  /** R62: the open arrivals (those that have not left), each with the profile's name and covers, to administrators
   *  only, and `[]` to anyone else. Writes nothing; never throws. */
  placeArrivals({ viewer = null } = {}) {
    try {
      if (typeof viewer !== "string" || !viewer || !this.#membership().isAdministrator(viewer)) return [];
      return this.#rows(`SELECT name, profile, found_at FROM place_arrivals WHERE left_at IS NULL ORDER BY seq`).map((r) => {
        const p = this.#juris().get(r.profile);
        return { name: r.name, profile: r.profile, profile_name: p ? p.name ?? null : null,
                 covers: p && Array.isArray(p.covers) ? [...p.covers] : [], found_at: r.found_at };
      });
    } catch { return []; }
  }

  /* R62, at each start with a place named: every held non-test profile matching the name, not held at the last compare
     (or at the set), and not active, is recorded once as an arrival; then the profiles held now are what the next start
     compares against. */
  #comparePlaces() {
    const cur = this.#placeCurrent();
    if (!cur || cur.name === null) return { compared: false };
    const at = this.#iso();
    const seenRow = this.#one(`SELECT profiles FROM place_seen WHERE id = 1`);
    let seen = null;
    try { seen = seenRow ? JSON.parse(seenRow.profiles) : null; } catch { seen = null; }
    const active = new Set(this.#activeIds());
    let found = 0;
    if (Array.isArray(seen))
      for (const id of this.#heldPlaceIds()) {
        if (seen.includes(id) || active.has(id) || !InstanceSetup.#placeMatches(this.#juris().get(id), cur.name)) continue;
        const r = this.#rows(`INSERT INTO place_arrivals (place_seq, name, profile, found_at) VALUES (?, ?, ?, ?)
                              ON CONFLICT(place_seq, profile) DO NOTHING RETURNING seq`, cur.seq, cur.name, id, at);
        found += r.length;
      }
    this.#seePlaces(at);
    return { compared: true, arrived: found };
  }
  #activeIds() {
    const set = this.#record().getSetting("jurisdiction_profiles");
    return Array.isArray(set) ? set.filter((x) => typeof x === "string") : [];
  }

  /* =====================================================================
   * A MEMBER'S LANGUAGE (R64; DEC-127 (1)). The language a member chooses for the screens, by their own act; the screens
   * show each word in it where a translation is held and in English where none is. `null` clears the choice.
   * ===================================================================== */

  /** R64, op=memberlanguageset: `by` (the control plane's stamp) is the member, and nobody sets it for another. */
  memberLanguageSet({ language = undefined, by = null } = {}) {
    const who = typeof by === "string" ? by.trim() : "";
    /* DEC-49 REGION is-member-language */
    if (!who || /^class:/.test(who))
      return refusal("MACHINE_CANNOT_SET_LANGUAGE", "the language of the screens is set by the member, from their own "
        + "signed-in session. Nothing was changed.", { by: by ?? null });
    let tag = null;
    if (language !== null) {
      tag = typeof language === "string" ? language.trim() : "";
      if (!isLanguageTag(tag))
        return refusal("LANGUAGE_MALFORMED", `${tag ? `'${tag.slice(0, 40)}' is not` : "the request names no language, and "
          + "one is chosen as"} one well-formed BCP 47 language tag (en, es, zh-Hant); null clears the choice. Nothing was changed.`);
    }
    /* END DEC-49 REGION is-member-language */
    const at = this.#iso();
    this.#sql.exec(`INSERT INTO member_languages (member, language, set_at) VALUES (?, ?, ?)`, who, tag, at);
    return { ok: true, member: who, language: tag, set_at: at,
             note: tag === null
               ? "no language is chosen: the screens follow your device's setting again."
               : "the screens show each word in this language where a translation is held, and in English where none is." };
  }

  /** R64, op=memberlanguage: the viewer's own choice, `{language, set_at}`, and nobody else's. Writes nothing. */
  memberLanguage({ viewer = null } = {}) {
    const who = typeof viewer === "string" ? viewer.trim() : "";
    let r = null;
    try {
      r = who && !/^class:/.test(who)
        ? this.#one(`SELECT language, set_at FROM member_languages WHERE member = ? ORDER BY seq DESC LIMIT 1`, who) : null;
    } catch { r = null; }
    return { ok: true, language: r ? r.language ?? null : null, set_at: r ? r.set_at : null };
  }

  /* =====================================================================
   * THE ASSISTANT DRAFTS THE GROUP'S DESCRIPTION (R65; DEC-152, K1818, K1837, K1841 (2)). On "Who your group is", an
   * administrator answers a few questions and asks for a labelled draft of the group's focus and purpose
   * (`membership` R109). It writes nothing: the words become the group's only when the administrator keeps them through
   * `op=groupdescriptionset`. The draft is built from the answers and, while the suggestions switch of the account that
   * serves the administrator is on, what the group holds, and it passes `wizard-scripts`' no-added-fact check. In T34
   * there is no model turn (N686): past every refusal the op answers `ASSISTANT_DRAFT_UNAVAILABLE`.
   * ===================================================================== */

  /** R65, op=groupdescriptiondraft. `by` and `assistant` (`{on, account}`, as the door resolves it, control-plane R57)
   *  are the control plane's stamps (R29). The refusals, in order: NOT_AN_ADMIN, ASSISTANT_OFF, the door's account and
   *  ceiling codes (answered there), GROUP_DRAFT_ANSWERS_MALFORMED or GROUP_DRAFT_NO_ANSWERS; then the draft, or, while
   *  no model turn exists, ASSISTANT_DRAFT_UNAVAILABLE. */
  async groupDescriptionDraft({ answers = undefined, assistant = null, by = null } = {}) {
    if (typeof by !== "string" || !by || !this.#membership().isAdministrator(by))
      return notAnAdmin(by ?? null, "asking the assistant to draft your group's description");
    const off = this.assistantGate();
    if (off) return off;
    if (assistant && typeof assistant === "object" && assistant.on === false)
      return refusal("ASSISTANT_OFF", "the assistant is not on for this request, so no question is put to it.");
    /* DEC-49 REGION is-group-draft-answers */
    const given = Array.isArray(answers) && answers.length <= GROUP_DRAFT_ANSWERS_MAX ? answers : null;
    if (!given || given.some((a) => !a || typeof a !== "object" || typeof a.question !== "string"
                                    || typeof a.text !== "string" || [...a.text].length > GROUP_DRAFT_ANSWER_MAX))
      return refusal("GROUP_DRAFT_ANSWERS_MALFORMED", `the answers are a list of at most ${GROUP_DRAFT_ANSWERS_MAX} `
        + `{question, text}, each text at most ${GROUP_DRAFT_ANSWER_MAX} characters. Nothing was saved.`);
    if (given.every((a) => !a.text.trim()))
      return refusal("GROUP_DRAFT_NO_ANSWERS", "every answer is empty, so there is nothing to draft from. Nothing was saved.");
    /* END DEC-49 REGION is-group-draft-answers */
    const unavailable = () => draftUnavailable("the assistant's turn that drafts the group's description is not built "
      + "yet, so nothing was drafted and the fields are as they were.");
    const turn = this.#deps.groupDraftTurn;
    if (typeof turn !== "function") return unavailable();
    const account = assistant && typeof assistant === "object" ? assistant.account ?? null : null;
    const suggestions = !!(account && account.suggestions === true);
    let got = null;
    try { got = await turn({ answers: given.map((a) => ({ question: a.question, text: a.text })), account, holdings: suggestions }); }
    catch { got = null; }
    if (!got || typeof got !== "object") return unavailable();
    const told = given.map((a) => a.text).join("\n");
    const readLog = Array.isArray(got.readLog) ? got.readLog : [];
    const label = { kind: "machine", asked_by: by };
    const out = { ok: true, withheld: [] };
    for (const [field, max] of [["focus", GROUP_FOCUS_MAX], ["purpose", GROUP_PURPOSE_MAX]]) {
      const text = typeof got[field] === "string" ? got[field] : "";
      const checked = wizardScripts.checkDraft(text, { told, readLog, firsthand: false, suggestions });
      if (!checked || checked.ok !== true) return draftRefused(checked);
      if ([...checked.text].length > max) return unavailable();
      out[field] = { text: checked.text, label };
      out.withheld.push(...(checked.withheld || []).map((w) => ({ field, ...w })));
    }
    out.note = "a draft: nothing is saved until you edit it and keep it, and then the words are your group's.";
    return out;
  }

  /* =====================================================================
   * THE INSTANCE'S OWN LIMITS (K98; R33–R40). What runs here COST, measured, and where the CPU ceiling lies, found
   * by walking into it. They are measurements of the runtime, not of the corpus (R41).
   * ===================================================================== */

  /** R33: record what a run cost. The peak is kept beside the last because the peak is the run that will die first
   *  and a mean would hide it. `unit` is the metric's (R34), fixed by its first observation. Never throws. */
  recordRuntimeObservation({ metric, ms, detail = null, at = null, unit = null } = {}) {
    try {
      if (typeof metric !== "string" || !metric || typeof ms !== "number" || !Number.isFinite(ms)) return { recorded: false };
      const now = at || stampInstant("second", this.#now());
      const cur = this.#one(`SELECT * FROM runtime_observations WHERE metric = ?`, metric);
      if (!cur) {
        this.#sql.exec(
          `INSERT INTO runtime_observations (metric, peak_ms, peak_at, peak_detail, last_ms, last_at, samples, total_ms, unit)
           VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`, metric, ms, now, detail, ms, now, ms,
          typeof unit === "string" && unit ? unit : unitOfMetric(metric));
        return { metric, peak_ms: ms, last_ms: ms, samples: 1, new_peak: true };
      }
      const isPeak = ms > cur.peak_ms;
      this.#sql.exec(
        `UPDATE runtime_observations SET last_ms = ?, last_at = ?, samples = samples + 1, total_ms = total_ms + ?
         ${isPeak ? ", peak_ms = ?, peak_at = ?, peak_detail = ?" : ""} WHERE metric = ?`,
        ...(isPeak ? [ms, now, ms, ms, now, detail, metric] : [ms, now, ms, metric]));
      return { metric, peak_ms: isPeak ? ms : cur.peak_ms, last_ms: ms, samples: cur.samples + 1, new_peak: isPeak };
    } catch { return { recorded: false }; }
  }

  /** R34: every metric in name order, each with the unit it was recorded in. A time is also given under its `_ms`
   *  names; a count of work never is, so a count is never described as a time. */
  runtimeObservations() {
    const metrics = this.#rows(`SELECT * FROM runtime_observations ORDER BY metric`).map((r) => {
      const unit = r.unit || unitOfMetric(r.metric);
      const mean = r.samples ? r.total_ms / r.samples : null;
      return { metric: r.metric, unit, peak: r.peak_ms, peak_at: r.peak_at, peak_detail: r.peak_detail ?? null,
               last: r.last_ms, last_at: r.last_at, samples: r.samples, total: r.total_ms, mean,
               ...(unit === "ms" ? { peak_ms: r.peak_ms, last_ms: r.last_ms, total_ms: r.total_ms, mean_ms: mean } : {}) };
    });
    return { metrics,
      note: "each metric is stated in its own unit. A metric in ms is measured wall time across synchronous compute "
          + "segments, not billed CPU time; a metric in bytes is a count of the work a run handled, not a time. peak "
          + "is the run that would die first if a ceiling were near; a mean would hide it." };
  }

  /** R40: a probe run begins. Its steps are numbered and timed from this run's own start. */
  recordCpuProbeStart({ run, iterations = null, budgetMs = null, at = null } = {}) {
    if (typeof run !== "string" || !run) return { recorded: false };
    this.#sql.exec(`INSERT INTO cpu_probe_runs (run, started_at, iterations, budget_ms) VALUES (?, ?, ?, ?)
                    ON CONFLICT(run) DO NOTHING`, run, at || stampInstant("second", this.#now()), iterations, budgetMs);
    return { run, recorded: true };
  }

  /** R35: one completed step of one run (`run`, R40): its number, its elapsed time from its run's start, its
   *  iterations and the instant. Never throws for a well-formed call. */
  recordCpuProbeStep({ run = LEGACY_PROBE_RUN, step, elapsedMs, iterations, at = null } = {}) {
    const now = at || stampInstant("second", this.#now());
    /* A step with no recorded start (a caller that names no run) belongs to a run whose end is not known either. */
    if (!this.#one(`SELECT run FROM cpu_probe_runs WHERE run = ?`, run))
      this.#sql.exec(`INSERT INTO cpu_probe_runs (run, started_at, iterations, reason) VALUES (?, ?, ?, 'unrecorded')`,
                     run, now, iterations);
    this.#sql.exec(
      `INSERT INTO cpu_probe_steps (run, step, elapsed_ms, iterations, at) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(run, step) DO UPDATE SET elapsed_ms = excluded.elapsed_ms, at = excluded.at`,
      run, step, elapsedMs, iterations, now);
    return { run, step, elapsed_ms: elapsedMs };
  }

  /** R40: a probe run returned, with what it completed and why it stopped. A run with no end is one cut off. */
  recordCpuProbeEnd({ run, completed = null, elapsedMs = null, reason = null, at = null } = {}) {
    if (typeof run !== "string" || !run) return { recorded: false };
    this.#sql.exec(`UPDATE cpu_probe_runs SET ended_at = ?, completed = ?, elapsed_ms = ?, reason = ? WHERE run = ?`,
                   at || stampInstant("second", this.#now()), completed, elapsedMs, reason, run);
    return { run, recorded: true };
  }

  /** R36, R40: where the probe got to, and so what is known about the ceiling. Writes nothing. */
  cpuProbeState() {
    const runs = this.#rows(`SELECT * FROM cpu_probe_runs ORDER BY started_at, run`);
    const steps = this.#rows(`SELECT run, step, elapsed_ms, iterations, at FROM cpu_probe_steps ORDER BY run, step`);
    const byRun = new Map(runs.map((r) => [r.run, []]));
    for (const s of steps) (byRun.get(s.run) || byRun.set(s.run, []).get(s.run)).push(s);
    const rows = [];
    let top = null;
    const runOut = runs.map((r) => {
      const own = (byRun.get(r.run) || []).map((s) => ({ step: s.step, elapsed_ms: s.elapsed_ms, iterations: s.iterations, at: s.at }));
      for (const s of own) {
        rows.push({ run: r.run, ...s });
        if (!top || s.elapsed_ms > top.elapsed_ms) top = s;
      }
      const last = own[own.length - 1] || null;
      const returned = r.ended_at ? true : r.reason === "unrecorded" ? null : false;
      return { run: r.run, started_at: r.started_at, iterations: r.iterations, budget_ms: r.budget_ms ?? null,
               steps: own, returned,
               ...(r.ended_at ? { ended: { at: r.ended_at, completed: r.completed, elapsed_ms: r.elapsed_ms, reason: r.reason } } : {}),
               ...(returned === false ? { bracket: { last_completed_step: last ? last.step : 0,
                                                     above_ms: last ? last.elapsed_ms : 0,
                                                     next_step: (last ? last.step : 0) + 1 } } : {}) };
    });
    const cut = runOut.filter((r) => r.returned === false && r.steps.length);
    return { steps: rows.length, highest_completed: top ? top.step : 0, elapsed_at_highest_ms: top ? top.elapsed_ms : 0,
      rows, runs: runOut,
      note: !rows.length
        ? "the probe has never run, so nothing is known about the ceiling by measurement"
        : `a run completed a step ${top.elapsed_ms} ms into its own isolate, so the ceiling lies above `
          + `elapsed_at_highest_ms. `
          + (cut.length ? "A run with no recorded end was cut off: the ceiling lies within its bracket, above its last "
                        + "completed step's elapsed time and below what its next step would have cost."
                        : "No run has been cut off yet, so the ceiling is above everything tried.") };
  }
}

/* R12 (N420): the three facts of the active profiles' combined view that `agent-worker` R51 reads: `deadlines` and
   `legal_organisations` as `jurisdictions.combine` gives them (its R29, R34), and `venues`, each `{kind, venue}` of a
   combined `action_kinds` entry that gives one (its R25, R29). A fact no active profile states, or that `combine`
   withholds (a conflict) or cannot give (its errors), is ABSENT, never an empty list: the reader then reads it
   undetermined, which is what it is. Nothing here chooses between profiles or supplies a default. */
function profileView(combined) {
  const view = {};
  const v = combined && combined.ok === true && combined.view && typeof combined.view === "object" ? combined.view : null;
  if (!v) return view;
  for (const fact of ["deadlines", "legal_organisations"])
    if (Array.isArray(v[fact]) && v[fact].length) view[fact] = v[fact];
  const venues = (Array.isArray(v.action_kinds) ? v.action_kinds : [])
    .filter((k) => k && typeof k.kind === "string" && k.venue && typeof k.venue === "object")
    .map((k) => ({ kind: k.kind, venue: k.venue }));
  if (venues.length) view.venues = venues;
  return view;
}

const INSTANCES = new WeakMap();

/** The one instance of this module for a Durable Object's storage (K61). `deps` is read on the first call only. */
export function instanceSetupOf(ctx, env = null, deps = {}) {
  const storage = ctx && ctx.storage ? ctx.storage : ctx;
  let m = INSTANCES.get(storage);
  if (!m) { m = new InstanceSetup(ctx, env || {}, deps); INSTANCES.set(storage, m); }
  return m;
}

/** This module's Durable Object routes (the `membershipOps` pattern). The stamps (`author`, `by`, `origin`) are the
 *  control plane's, read from the query AFTER the body is spread, so a body naming its own is overwritten (R29).
 *  The map joins `control-plane`'s one route map (its R35; N348), so every route passes its frame: R26's body read,
 *  R27's existence read, the envelope and R25's catch. This module keeps no door or Durable Object class of its own. */
/* R65: the door's `assistant` stamp (control-plane R57), JSON in the query; anything else is no stamp. */
const stampedJson = (v) => { try { const x = v ? JSON.parse(v) : null; return x && typeof x === "object" ? x : null; } catch { return null; } };
export function instanceSetupOps(m, url, body) {
  const q = (k) => url.searchParams.get(k);
  return {
    instancegroup: () => m.instanceGroup(),
    instancegrouppublic: () => m.instanceGroupPublic(),
    instancegroupseed: () => m.instanceGroupSeed({ ...(body || {}), author: q("author") }),
    groupnameset: () => m.groupNameSet({ ...(body || {}), by: q("by") }),
    groupdomainset: () => m.groupDomainSet({ ...(body || {}), by: q("by"), origin: q("origin") }),
    groupidentity: () => m.groupIdentity(),
    groupidentitypublic: () => m.groupIdentityPublic(),
    profiles: () => m.profiles(),
    profilesset: () => m.profilesSet({ ...(body || {}), by: q("by") }),
    runtimeobservations: () => m.runtimeObservations(),
    cpuprobestate: () => m.cpuProbeState(),
    cpuprobestart: () => m.recordCpuProbeStart(body || {}),
    recordcpuprobestep: () => m.recordCpuProbeStep(body || {}),
    cpuprobeend: () => m.recordCpuProbeEnd(body || {}),
    assistantstate: () => m.assistantState(),
    assistantset: () => m.assistantSet({ ...(body || {}), by: q("by") }),
    disclosureshown: () => m.disclosureShown({ ...(body || {}), by: q("by") }),
    disclosureof: () => m.disclosureOf({ member: q("member") ?? (body || {}).member, version: q("version") ?? (body || {}).version }),
    officesseed: () => m.officesSeed({ ...(body || {}), boot: false, by: q("by") }),
    seatsseed: () => m.seatsSeed({ ...(body || {}), by: q("by") }),
    placewanted: () => m.placeWantedSet({ ...(body || {}), by: q("by") }),
    placewantedstate: () => m.placeWanted({ viewer: q("viewer") }),
    memberlanguageset: () => m.memberLanguageSet({ ...(body || {}), by: q("by") }),
    memberlanguage: () => m.memberLanguage({ viewer: q("viewer") }),
    groupdescriptiondraft: () => m.groupDescriptionDraft({ ...(body || {}), by: q("by"), assistant: stampedJson(q("assistant")) }),
  };
}

/* ============================================================================================================
 * THE INSTANCE'S REPORTS, WORKER SIDE (R17–R19, R37, R38). The credential, the namespace and the envelope are the
 * control plane's: each function takes the `{json, storeSilent, doAnswer, storeRefusal}` it hands them (capture's
 * `knockOp` pattern) and the store it resolved, and answers a Response.
 * ============================================================================================================ */

/* R43 (N339, N349; control-plane R23, R25): what a relay answers for a store reply `doAnswer` did not read as an
   answer. The store's own refusal (`ok: false` below 500) is relayed with its status, code and sentence, through the
   plane's `storeRefusal` when it is handed one, else as that function answers it (`json(body, status)`); anything
   else is a silence, carrying the correlation id `doAnswer` read from the store's internal error, when it gave one.
   One rule for every relay, a sub-read inside a longer act included (K444). */
function notAnswered(out, op, { json, storeSilent, storeRefusal }) {
  if (out && out.refused === true && out.reply)
    return typeof storeRefusal === "function" ? storeRefusal(out) : json(out.reply.body, out.reply.status);
  return storeSilent(op, out ? out.correlation : undefined);
}

/* REC-163 / IC-174 / D-596 — THE PUBLIC READ OF THE PRODUCING GROUP, ONE READER FOR THE SURFACES THAT SHOW IT TO A
   STRANGER: op=instancegroup's and op=groupidentity's public arms and the setup page served at `/` (R3, R10, R20).
   Exactly two projections may be named; any other value is answered as a silence rather than forwarded, so a typo
   cannot reach a Durable Object path. An instance with no store binding cannot be asked, and that is a silence too. */
export const PUBLIC_GROUP_PROJECTIONS = Object.freeze(["instancegrouppublic", "groupidentitypublic"]);
export async function publicInstanceGroup(env, storeName, projection = "instancegrouppublic", doAnswer) {
  if (!PUBLIC_GROUP_PROJECTIONS.includes(projection)) return { answered: false, result: undefined };
  let stub = null;
  try { stub = env.STORE.get(env.STORE.idFromName(storeName)); } catch { stub = null; }
  if (!stub) return { answered: false, result: undefined };
  return doAnswer(stub.fetch(`http://do/${projection}`));
}

/** R3 over the wire: a credentialed reader (`viewer` set by the control plane) is answered the whole row; anybody
 *  else the public projection. A silence is a silence (REC-52), never "no group is recorded". */
export async function instanceGroupOp(env, storeName, { viewer = null, cls = null } = {}, io) {
  const { json, doAnswer } = io;
  if (viewer) {
    const out = await doAnswer(env.STORE.get(env.STORE.idFromName(storeName)).fetch("http://do/instancegroup"));
    if (!out.answered) return notAnswered(out, "instancegroup", io);
    return json({ ok: true, result: out.result, store: storeName, tokenClass: cls }, 200);
  }
  const pub = await publicInstanceGroup(env, storeName, "instancegrouppublic", doAnswer);
  if (!pub.answered) return notAnswered(pub, "instancegroup", io);
  return json({ ok: true, result: pub.result, store: storeName }, 200);
}

/** R10, R11 over the wire: the credentialed read (R11) or the public projection (R10). */
export async function groupIdentityOp(env, storeName, { viewer = null, cls = null } = {}, io) {
  const { json, doAnswer } = io;
  const out = await doAnswer(env.STORE.get(env.STORE.idFromName(storeName))
    .fetch(viewer ? "http://do/groupidentity" : "http://do/groupidentitypublic"));
  if (!out.answered) return notAnswered(out, "groupidentity", io);
  return json({ ok: true, result: out.result, store: storeName, ...(viewer ? { tokenClass: cls } : {}) }, 200);
}

/** R17, op=bootstrap: this isolate's `version`, `bootstrapConfigured` (a live ADMIN_TOKEN), membership's
 *  `bootstrapState` and the store's own `storeVersion` from the Durable Object's route, and with `members` each
 *  member's own build (D-116: THREE BUILDS, EACH READ FROM WHERE IT RUNS — `storeVersion` is never written here). */
export async function bootstrapReport(env, fp, { members = false, stub, json, storeSilent, doAnswer, storeRefusal }) {
  const out = await doAnswer(stub.fetch(new Request(`http://do/bootstrap?fp=${fp}`)));
  if (!out.answered) return notAnswered(out, "bootstrap", { json, storeSilent, storeRefusal });
  return json({ ok: true, service: "bio-plane", version: env.VERSION || "0.0.0",
                bootstrapConfigured: await liveToken(env.ADMIN_TOKEN), ...out.result,
                ...(members ? { memberVersions: await memberVersions(env) } : {}) }, 200);
}

/** R18, op=selftest: deployment health as JSON, so "did the deploy work" is a link rather than a command. It
 *  reports every binding, relays the store's stats (under op=stats' stamps: `capacity` for the admin class and the
 *  caller's `viewer`), and round-trips R2 under the scratch prefix; it never returns a secret. `ok` is false when
 *  exactly one bucket is bound, when the store does not answer, when the round trip fails, or when a required token
 *  binding is not live. */
export async function selftest(env, storeName, { cls = null, viewer = "", scratch = "scratch" } = {}, { json, doAnswer }) {
  /* R2 is optional by design: "not configured" is a first-class healthy state, distinct from "configured and
     broken", and the buckets are only ever added as a pair. */
  const r2Configured = typeof env.CAPTURES?.get === "function" && typeof env.PUBLISHED?.get === "function";
  const out = {
    ok: true, service: "bio-plane", version: env.VERSION || "0.0.0", time: new Date().toISOString(), tokenClass: cls,
    bindings: {
      STORE: typeof env.STORE?.idFromName === "function",
      CAPTURES: typeof env.CAPTURES?.get === "function" ? true : "not configured",
      PUBLISHED: typeof env.PUBLISHED?.get === "function" ? true : "not configured",
      ADMIN_TOKEN: await liveToken(env.ADMIN_TOKEN),
      MEMBER_TOKEN: await liveToken(env.MEMBER_TOKEN),
      PROBE_TOKEN: await liveToken(env.PROBE_TOKEN),
      /* REC-33: REPORTED, and deliberately NOT required: an instance that predates this class runs monitoring on the
         ADMIN_TOKEN fallback and is healthy. */
      DAEMON_TOKEN: (typeof env.DAEMON_TOKEN === "string" && env.DAEMON_TOKEN.length > 0)
        ? await liveToken(env.DAEMON_TOKEN) : "not configured",
    },
    r2Configured,
  };
  /* Half a fence is a defect, not an option. */
  if ((typeof env.CAPTURES?.get === "function") !== (typeof env.PUBLISHED?.get === "function")) {
    out.ok = false;
    out.r2 = "MISCONFIGURED: one bucket bound without the other; the fence requires both or neither";
  }
  try {
    /* REC-52: a store that answered `ok:false`, or did not answer, is a failure of the health check, never healthy. */
    const sOut = await doAnswer(env.STORE.get(env.STORE.idFromName(storeName))
      .fetch(`http://x/stats?capacity=${cls === "admin" ? "1" : "0"}&viewer=${encodeURIComponent(viewer ?? "")}`));
    if (!sOut.answered) { out.ok = false; out.store = "ERR the store did not answer /stats"; }
    else out.store = sOut.result;
  } catch (e) { out.ok = false; out.store = "ERR " + String(e && e.message || e); }
  if (r2Configured) {
    try {
      const key = `${scratch}/selftest-${Date.now()}`;
      await env.CAPTURES.put(key, "ok");
      const back = await env.CAPTURES.get(key);
      out.captures = (await back.text()) === "ok" ? "read-write ok" : "MISMATCH";
      if (out.captures !== "read-write ok") out.ok = false;
      await env.CAPTURES.delete(key);
    } catch (e) { out.ok = false; out.captures = "ERR " + String(e && e.message || e); }
  } else {
    out.captures = "not configured";
  }
  /* Required for health: the store and three live token bindings. R2 is reported but not required. */
  out.bindingsAllPresent = out.bindings.STORE === true && out.bindings.ADMIN_TOKEN === true
    && out.bindings.MEMBER_TOKEN === true && out.bindings.PROBE_TOKEN === true;
  if (!out.bindingsAllPresent) out.ok = false;
  return json(out, out.ok ? 200 : 500);
}

/* The sentence R37 states: the subrequest ceiling is known by being refused, the CPU ceiling by op=cpuprobe. */
export const RUNTIME_ASYMMETRY = "a refused subrequest throws and is caught, so the subrequest ceiling is known by "
  + "having hit it. Exceeding the CPU limit TERMINATES the isolate, so no run can report its own death: consumption "
  + "is measured on every run and the ceiling is found by op=cpuprobe, whose checkpoints survive the kill.";

/** R37, op=runtime: R34's measurements, R36's probe state and capture's subrequest ceiling (capture R23), through one
 *  surface. When any of the three reads does not answer, the op answers the store-silence refusal (REC-52); the first
 *  of them, in read order, that is the store's own refusal or a silence is relayed as R43 says (K444). */
export async function runtimeOp(stub, io) {
  const { json, doAnswer } = io;
  const obsOut = await doAnswer(stub.fetch("http://x/runtimeobservations"));
  const probeOut = await doAnswer(stub.fetch("http://x/cpuprobestate"));
  const limOut = await doAnswer(stub.fetch("http://x/capturelimit?runtime=subrequests"));
  const miss = [obsOut, probeOut, limOut].find((o) => !o.answered);
  if (miss) return notAnswered(miss, "runtime", io);
  return json({ ok: true, measured: obsOut.result, cpu_probe: probeOut.result, subrequests: limOut.result,
                asymmetry: RUNTIME_ASYMMETRY });
}

/** R38–R40, op=cpuprobe: find the CPU ceiling by walking into it. R36 is read first (a store that does not answer
 *  burns nothing); a new run is started under its own id, each completed step is written, and CONFIRMED, before the
 *  next begins (R39: an unconfirmed checkpoint ends the probe); its end is written when it returns. */
export async function cpuProbeOp(stub, { iterations = null, budget_ms = null, run = null, probe = cpuProbe } = {},
                                 io) {
  const { json, storeSilent, doAnswer } = io;
  const beforeOut = await doAnswer(stub.fetch("http://x/cpuprobestate"));
  if (!beforeOut.answered) return notAnswered(beforeOut, "cpuprobe", io);
  if (!beforeOut.result) return storeSilent("cpuprobe");
  const iters = Math.max(100000, Number(iterations) || 2000000);
  const budget = Math.max(50, Number(budget_ms) || 20000);
  const id = typeof run === "string" && run ? run
    : `${new Date().toISOString().slice(0, 19)}Z~${crypto.randomUUID().slice(0, 8)}`;
  const post = (path, body) => doAnswer(stub.fetch(`http://x/${path}`, { method: "POST",
    headers: { "content-type": "application/json" }, body: JSON.stringify(body) }));
  const started = await post("cpuprobestart", { run: id, iterations: iters, budgetMs: budget });
  if (!started.answered) return notAnswered(started, "cpuprobe", io);
  if (!started.result || started.result.recorded !== true) return storeSilent("cpuprobe");
  let confirmed = 0;
  const UNCONFIRMED = Symbol("unconfirmed");
  let r;
  try {
    r = await probe({
      startStep: 0, iterationsPerStep: iters, budgetMs: budget,
      checkpoint: async (step, elapsed) => {
        const w = await post("recordcpuprobestep", { run: id, step, elapsedMs: elapsed, iterations: iters });
        if (!w.answered || !w.result || w.result.step !== step) throw UNCONFIRMED;
        confirmed = step;
      },
    });
  } catch (e) {
    if (e !== UNCONFIRMED) throw e;
    r = null;
  }
  /* R39: a probe the store stopped confirming returned no result of its own; the trail says how far it got. */
  const complete = r !== null;
  if (!complete) r = { completed: confirmed, elapsed_ms: null, reason: null };
  if (complete) await post("cpuprobeend", { run: id, completed: r.completed, elapsedMs: r.elapsed_ms, reason: r.reason });
  const afterOut = await doAnswer(stub.fetch("http://x/cpuprobestate"));
  if (!afterOut.answered) return notAnswered(afterOut, "cpuprobe", io);
  return json({ ok: true, run: { ...r, id }, state: afterOut.result, trail_complete: complete,
    ...(complete ? {} : { last_confirmed_step: confirmed }),
    note: complete
      ? "this run RETURNED, so the ceiling is above its elapsed time. If a later run does not return, its last "
        + "recorded step is the last one that fit and the ceiling lies just above that step's elapsed_ms."
      : `the store did not confirm step ${confirmed + 1}, so the probe stopped there and burned nothing more: the `
        + `trail is incomplete, and the last step the store confirmed is ${confirmed}.` });
}

/* ============================================================================================================
 * THE REPORT OPS' DISPATCH (the legacy-index map's §4.4 plain move, K649 (7)): which of this module's Worker functions
 * answers each report op, moved out of `src/index.mjs`. The door resolves the store, the class and the viewer stamp
 * (`control-plane`'s) and hands them in; who may call each op is `op-declarations`' and `admission`'s.
 * ============================================================================================================ */

/* The admitted ops this module answers at the Worker. `bootstrap` is the public door's default answer (below). */
export const INSTANCE_SETUP_OPS = Object.freeze(["selftest", "livefire", "runtime", "cpuprobe"]);

/** One of INSTANCE_SETUP_OPS, answered. `storeName` is the namespace the door resolved, `cls` the caller's class,
 *  `viewer` the door's viewer stamp for that caller, `scratch` the rehearsal namespace's name. */
export async function instanceSetupOp(op, url, env, storeName, { cls = null, viewer = "", scratch = "scratch", json,
                                                                  doAnswer, storeSilent, storeRefusal } = {}) {
  const io = { json, doAnswer, storeSilent, storeRefusal };
  const store = () => env.STORE.get(env.STORE.idFromName(storeName));
  /* selftest reports deployment health as JSON, so "did the deploy work" is a
     link rather than a command. It asserts every binding is present and that
     the store answers, and it never returns a secret. */
  if (op === "selftest") return selftest(env, storeName, { cls, scratch, viewer }, { json, doAnswer });

  if (op === "livefire") {
    const out = await livefire(env, storeName, { capacity: cls === "admin", viewer });
    /* D-506 / IC-265, on BOB #32's ruling of 2026-09-24 06:07Z. This read `out.ok ? 200 : 500`, and
       `out.ok` WAS the canary's verdict — which is why a failing canary answered `ok:false` with no
       code of any kind to every consumer that reads `ok:false` as a refusal. `out.ok` is now
       `true` whenever the op answered, and the verdict lives in `out.verdict` / `out.failing`.
       THE STATUS IS KEYED TO THE VERDICT, so it is byte-for-byte what it was for every outcome: a
       DIST gate or a curl that reads the status alone loses nothing to this change, which is the
       whole point of moving the verdict to keys of its own rather than deleting it from the wire. */
    return json(out, out.verdict === "pass" ? 200 : 500);
  }

  /* What runs here have COST, measured. A read, and the honest counterpart to
     the store's `capturelimit` read — a DO PATH and not an op, M0-12; nothing
     on the control plane reaches it — : that one reports a ceiling found by
     being refused, this one reports consumption found by measuring, because
     CPU has no catchable refusal to find a ceiling with. */
  if (op === "runtime") return runtimeOp(store(), io);

  /* Find the CPU ceiling by walking into it. Each completed step is
     checkpointed durably BEFORE the next begins, so when the isolate is killed
     the trail shows the last step that finished and the ceiling is bracketed.
     Probe class only: it burns compute on purpose and belongs nowhere near a
     member's session. */
  if (op === "cpuprobe") return cpuProbeOp(store(),
    { iterations: url.searchParams.get("iterations"), budget_ms: url.searchParams.get("budget_ms") }, io);

  return null;
}

/** R17 at the public door: op=bootstrap, the default answer of an unauthenticated call. REC-52: the same spread as
 *  the store reads'. A store silence used to leave a `{ok:true}` carrying the service name, the version and the
 *  bootstrap flag and NOTHING the store knows — an instance answering "here is what I am" while unable to say
 *  anything about itself. The installer and `newgroup` both read this op, so the false success reached a caller
 *  deciding whether an instance was ready. `members=1` adds each member's own build. */
export function bootstrapOp(url, env, fp, { stub, json, storeSilent, storeRefusal, doAnswer }) {
  return bootstrapReport(env, fp, { members: url.searchParams.get("members") === "1", stub, json, storeSilent,
                                    storeRefusal, doAnswer });
}
