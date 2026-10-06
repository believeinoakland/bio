/* setup-page: the page at the root of a group's Civicsmith (claim, sign-in, enrolment, the healthy panel, the group's
 * settings sections and the record browser kept working, K102). Copied from `setup.mjs` 1–1636 by K1851 (K617, N622),
 * every name and spelling otherwise unchanged; `instance-setup` composes it (its R47 block in HOSTING_SLOT, R14) and
 * serves it through `control-plane`'s `/` route.
 *
 * Pure: it reads no table, writes nothing and registers nothing. Embedded as a string rather than shipped as a static
 * asset, because the OAuth install path uploads a single module and must not depend on the asset-manifest upload
 * machinery. Same origin as the API, so no CORS work.
 *
 * Before sign-in the page drives only public ops, each of which gates itself (R3): bootstrap (reveals only claimed or
 * not), claim (requires the one-time password and refuses once spent), login (requires the password), invitelook,
 * joinlinkinvite and enroll. The one-time password, an invitation and a join link may arrive in the URL FRAGMENT;
 * fragments never leave the browser, and the page strips the hash immediately so it cannot linger in the address bar
 * or history entry (R2).
 *
 * REC-163: the page is not served byte-for-byte as built. Its one line saying whose record this is carries the
 * record's own producing group, read when the page is served — see `pageOf` below.
 */

/* R5: the record's document vocabulary and the inquiry title rule are record-grammar's (its R30, R32, R35), read
   there and never copied. */
import { STATES, HEADINGS } from "../record-grammar/document.mjs";
import { deriveInquiryTitle } from "../record-grammar/titles.mjs";
/* R7 (N65 (3)): the risk tiers and their reader are action-grammar's, read there and never copied (its R1). */
import { RISK_TIERS, riskTierState } from "../action-grammar/index.mjs";
import { COUNTERPARTY_LEVELS } from "../../../jurisdictions/index.mjs";


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
/* R5: an office's level, the product's vocabulary (jurisdictions' COUNTERPARTY_LEVELS), offered as written. */
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
 * `pageOf`, through instance-setup's `setupPage`, the public read's answer), so the statement is in the served BYTES, signed in or out: the line sits
 * above every section the script switches between, and the script never touches it. THREE states, and the difference
 * between the last two is the one that matters most:
 *   recorded — the slug as the record holds it, in its own case (the eyebrow's capitals are not applied to it);
 *   none     — the record answered and records no group: said in words, never a blank and never a default;
 *   unread   — the record did NOT answer: said as that, and never as "none" (REC-52 — a silence is not an absence).
 * The TEMPLATE carries the unread line, so a page served without a read says it did not read, and names nobody. */
const escGroup = (x) => String(x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const GROUP_LINE_UNREAD = '<p class="eyebrow" id="instance-group" data-group="unread">'
  + "Which group this is could not be read just now</p>";
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
      + escGroup(r.group) + "</span> &middot; your group's Civicsmith"
      + (domain ? ' &middot; <span class="domain">' + escGroup(domain) + '</span> verified <time datetime="'
                  + escGroup(day) + '">' + escGroup(day) + "</time>" : "")
      + "</p>";
  }
  if (r && r.group === null)
    return '<p class="eyebrow" id="instance-group" data-group="none">No group is recorded here yet</p>';
  return GROUP_LINE_UNREAD;
}
/** The page as served: the template, its unread line replaced by what one read of the record said. */
export function pageOf(read) {
  return PAGE_HTML.replace(GROUP_LINE_UNREAD, () => groupLine(read));
}

/* R15, R17, R18: the claim section's three settings, the same acts the members and keys section offers an administrator
   at any time, so each block's markup is built once here and placed twice: `cl` in the claim section, `mk` in members
   and keys. Every id carries its prefix, so the script drives either with the same code. NOTHING IS PRESELECTED: no
   radio is checked, and leaving a block alone records nothing. The words are plain until the design stream gives its
   own (DEC-134 step 5, K1755). */
const hostingBlock = (p) => `<div class="card" id="${p}-ha">
    <p style="margin:0 0 10px"><b>Who holds the hosting account?</b> Name the people who can sign in to the
    Cloudflare account your group's Civicsmith runs in. The record keeps your group's answer as you give it.</p>
    <p class="small" id="${p}-ha-now"></p>
    <label for="${p}-ha-holders">Who holds it</label>
    <input id="${p}-ha-holders">
    <p class="hint">One or more people, named as your group knows them.</p>
    <label for="${p}-ha-note">A note (optional)</label>
    <input id="${p}-ha-note">
    <div class="actions"><button id="${p}-ha-set">Record who holds it</button></div>
    <p class="err" id="${p}-ha-err"></p>
  </div>`;
const courtBlock = (p) => `<div class="card" id="${p}-cn">
    <p style="margin:0 0 10px"><b>Are your members told what a court can reach?</b> Some work is unlikely ever to
    draw a court order. Journalists, lawyers and auditors may have protections others lack, such as shield laws or
    privilege. A group doing work that could draw one should make sure its members understand the risk.</p>
    <p class="small" id="${p}-cn-now"></p>
    <label style="display:flex;gap:8px;align-items:flex-start;font-weight:400">
      <input type="radio" name="${p}-cn" id="${p}-cn-tell" value="tell" style="width:auto;margin-top:4px">
      <span>Tell our members</span></label>
    <label style="display:flex;gap:8px;align-items:flex-start;font-weight:400">
      <input type="radio" name="${p}-cn" id="${p}-cn-dont" value="dont" style="width:auto;margin-top:4px">
      <span>Don't</span></label>
    <p class="hint">Leaving this unchosen records nothing, and reads as not telling.</p>
    <div class="actions"><button id="${p}-cn-set">Record this choice</button></div>
    <p class="err" id="${p}-cn-err"></p>
  </div>`;
const AI_CHOICES = [
  ["group", "<b>The group's API key.</b> One Anthropic API key, held by the group, serves every member who has no account of their own."],
  ["own", "<b>Members' own accounts.</b> Each member who wants the assistant connects their own Claude subscription or API key."],
  ["both", "<b>Both.</b> The group's API key serves members with no account of their own; members may connect their own."],
  ["none", "<b>No AI.</b> Your group's Civicsmith without the assistant."]];
const aiBlock = (p) => `<div class="card" id="${p}-ai">
    <p style="margin:0 0 10px"><b>How do your group's members reach the assistant?</b> Nothing is chosen for you,
    whatever the installer recorded, and leaving this unchosen changes nothing.</p>
    <p class="small" id="${p}-ai-now"></p>
    ${AI_CHOICES.map(([v, words]) => `<label style="display:flex;gap:8px;align-items:flex-start;font-weight:400">
      <input type="radio" name="${p}-ai" id="${p}-ai-${v}" value="${v}" style="width:auto;margin-top:4px">
      <span>${words}</span></label>`).join("\n    ")}
    <div id="${p}-ai-keybox" hidden>
      <label for="${p}-ai-key">The group's Anthropic API key</label>
      <input id="${p}-ai-key" type="password" autocomplete="off" spellcheck="false">
      <p class="hint">Sent once, in the request's body only. It is held sealed and never shown again, not even here.</p>
    </div>
    <div class="actions"><button id="${p}-ai-set">Record this choice</button></div>
    <p class="err" id="${p}-ai-err"></p>
  </div>`;
/* R22: the language for the screens, offered on the healthy panel (the account screen, `ln`) and in members and keys
   (`mln`), filled from the device's setting until the member has chosen. */
const languageBlock = (p) => `<div class="card" id="${p}">
    <p class="small" style="margin:0 0 6px" id="${p}-now"></p>
    <label for="${p}-tag" style="margin-top:0">Language for the screens</label>
    <input id="${p}-tag" spellcheck="false" placeholder="en, es, zh-Hant">
    <p class="hint">A language tag. Each word is shown in it where a translation is held, and in English where none is.
    Leave it empty to follow your device's setting.</p>
    <div class="actions"><button id="${p}-set">Use this language</button></div>
    <p class="err" id="${p}-err"></p>
  </div>`;

/* R14 (DEC-109; K1851): the one slot in the claim section, before the password fields, where `instance-setup` places its
   R47 block (who really controls the group's Civicsmith) when it composes the page. The block's words are held once in
   `instance-setup`'s leaf for this page and the installer's last screen, so this module never imports them. */
export const HOSTING_SLOT = "<!--hosting-control-->";

export const PAGE_HTML = `<!doctype html>
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
  <p class="small">Checking the state of this group's Civicsmith.</p>
</section>

<section id="s-unarmed">
  <h1>This group's Civicsmith has no one-time password yet</h1>
  <p>Before anyone can claim it, a bootstrap credential has to exist. Sign in
  to the Cloudflare account this group's Civicsmith runs in, open this worker's settings,
  and set a long random value called <b>ADMIN_TOKEN</b>. Then reload this
  page.</p>
  <p class="small">If it was set but this page still says otherwise, the value
  in place is one that has been published before and this software refuses to
  accept it. Set a fresh one.</p>
</section>

<section id="s-claim">
  <h1>Claim this group's Civicsmith</h1>
  <p>This runs in your organization's own Cloudflare account. Claiming it
  spends the one-time password and replaces it with a password you choose.
  The one-time password stops working the moment this succeeds.</p>
  <div id="rearm-note" class="notice" hidden>
    <p style="margin:0"><b>Recovery mode.</b> The one-time password was
    replaced in the Cloudflare dashboard, so the previous claim is retired and
    this group's Civicsmith can be claimed again. Nothing stored in the record is affected.</p>
  </div>
  ${HOSTING_SLOT}
  <div id="claim-form">
  <label for="boot">One-time password</label>
  <input id="boot" autocomplete="off" spellcheck="false">
  <p class="hint">From the installer's final screen, or the ADMIN_TOKEN value
  set in the Cloudflare dashboard.</p>
  <label for="pw1">Choose your password</label>
  <input id="pw1" type="password" autocomplete="new-password">
  <p class="hint">At least 12 characters. Store it in a password manager.</p>
  <label for="pw2">Type it again</label>
  <input id="pw2" type="password" autocomplete="new-password">
  <button id="do-claim">Claim this group's Civicsmith</button>
  <p class="err" id="claim-err"></p>
  </div>
  <!-- R15–R18 (DEC-134, DEC-136 (1), K1755): once the claim succeeds, in the same section and only here, the
       recommendation of a second administrator with its statement of dependence (R16), then three choices the founder
       may leave unanswered: who holds the hosting account (R15), whether members are told what a court can reach
       (R17), and how members reach the assistant (R18). Nothing is gated on any of them. -->
  <div id="claim-after" hidden>
    <div class="okbox"><p style="margin:0">Claimed. The one-time password no longer works, and you are signed in
    as the administrator.</p></div>
    <div class="notice" id="cl-second">
      <p style="margin:0 0 8px"><b>We recommend adding a second administrator.</b> So your group is never stuck when
      one person is away, and so no one person holds everything, add at least one more administrator under Members and
      keys.</p>
      <p style="margin:0">While your group has one administrator, it depends on that person, and on whoever holds the
      hosting account.</p>
    </div>
    <p class="small">Three choices follow. Each can be left for later, and each can be changed at any time under
    Members and keys.</p>
    ${hostingBlock("cl")}
    ${courtBlock("cl")}
    ${aiBlock("cl")}
    <div class="actions"><button id="claim-on">Go on to your group's Civicsmith</button></div>
  </div>
</section>

<section id="s-login">
  <h1>Sign in</h1>
  <p>This group's Civicsmith is claimed. Members sign in with their own name and password.
  Leave the name empty to sign in as the administrator.</p>
  <label for="lwho">Your member name</label>
  <input id="lwho" autocomplete="username" placeholder="leave empty for administrator">
  <label for="lpw">Password</label>
  <input id="lpw" type="password" autocomplete="current-password">
  <button id="do-login">Sign in</button>
  <p class="err" id="login-err"></p>
  <p class="small">Lost the password? Sign in to Cloudflare, replace the
  ADMIN_TOKEN value in this worker's settings, and reload this page to claim
  it again.</p>
</section>

<section id="s-panel">
  <h1>Your group's Civicsmith is healthy</h1>
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
  ${languageBlock("ln")}
  <div class="actions" style="margin:22px 0 6px">
    <button id="go-browse">Browse the record</button>
    <button id="go-new">Add something new</button>
    <button id="go-inbox">Review the inbox</button>
    <button id="go-members" hidden>Members and keys</button>
  </div>
  <!-- R13 (N10, K102): which jurisdiction profiles this copy reads its local facts from. Shown by name to every
       signed-in member; the choice is offered only to a session that administers, among every held profile that
       is not a test profile, with NOTHING PRESELECTED; the change is warned about before it is sent, and choosing
       none is allowed and says what it means. -->
  <h2>Where your group's Civicsmith reads local facts from</h2>
  <div class="card" id="pf-active"><p class="small" style="margin:0">Reading the profiles&hellip;</p></div>
  <div id="pf-choose" hidden>
    <p class="small">Choose the jurisdiction profiles your group's Civicsmith reads its local facts from, in the order they
    should be read. Nothing is chosen for you, and choosing none is allowed.</p>
    <div class="card" id="pf-choices"></div>
    <div class="actions"><button id="pf-review">Review this change</button></div>
    <div class="notice" id="pf-warn" hidden>
      <p id="pf-warn-text"></p>
      <button id="pf-confirm">Make this change</button> <button id="pf-cancel">Keep things as they are</button>
    </div>
    <p class="err" id="pf-err"></p>
    <!-- R19 (DEC-150 (1)): a place no held profile covers, named by an administrator and held only here. -->
    <div class="card" id="pw">
      <p class="small" style="margin:0 0 6px" id="pw-now"></p>
      <label for="pw-name" style="margin-top:0">Name a place not yet listed</label>
      <input id="pw-name">
      <p class="hint">Where your group works, if no profile above covers it. It stays in your group's Civicsmith and is
      sent nowhere.</p>
      <div class="actions"><button id="pw-set">Name this place</button></div>
      <p class="err" id="pw-err"></p>
    </div>
  </div>
  <!-- R20 (DEC-150 (2)): when no active profile names an office, the offices section says why nothing is filled in and
       offers an administrator adding the group's own offices, each the administrator's act, marked as the group's. -->
  <div id="of" hidden>
    <h2>Offices</h2>
    <div class="card"><p class="small" style="margin:0" id="of-why"></p><div id="of-list"></div></div>
    <div id="of-add" hidden>
      <label for="of-label">Add an office: its name</label>
      <input id="of-label" placeholder="City Clerk, County Auditor">
      <label for="of-note">Who or what this office is, in your own words</label>
      <input id="of-note">
      <div class="actions"><button id="of-set">Add this office</button></div>
      <p class="err" id="of-err"></p>
    </div>
  </div>
  <!-- R24 (instance-setup R53; K1502, K1478 (i), K1755): whether the assistant is on, shown to every member; the switch
       only to an administrator, saying what it will do before it is pressed. -->
  <h2>The assistant</h2>
  <div class="card" id="as-state"><p class="small" style="margin:0">Reading whether the assistant is on&hellip;</p></div>
  <div id="as-choose" hidden>
    <p class="small">The assistant is optional. A member reaches it through their own Claude subscription or API key,
    or through the group's API key while an administrator has it on, and is told first that their questions and the
    material read to answer them go to Anthropic. While it is off, no question is put to it and nothing runs.</p>
    <p class="small" id="as-what"></p>
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
  <p class="crumb"><a id="crumb-panel">Your group's Civicsmith</a> &rsaquo; Record</p>
  <h1>The record</h1>
  <p class="small" id="browse-summary"></p>
  <div id="browse-body"><p class="small">Loading the record&hellip;</p></div>
</section>

<section id="s-bundle">
  <p class="crumb"><a id="crumb-panel2">Your group's Civicsmith</a> &rsaquo; <a id="crumb-browse">Record</a> &rsaquo; <span id="crumb-id" class="mono"></span></p>
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
  <p class="crumb"><a class="crumb-home">Your group's Civicsmith</a> &rsaquo; New</p>
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
      your group's Civicsmith will fetch it, hash it at the moment it arrives, keep the bytes, and record where
      it came from. Leave both blank if you are writing down something you know rather than
      capturing something published.</p>
      <label for="n-loc">Web address of the document</label>
      <input id="n-loc" placeholder="https://..." spellcheck="false">
      <p class="hint">Must be an https address on a public site. Your group's Civicsmith will not fetch anything else.</p>
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
      <!-- R5 (N235; actions R9, jurisdictions R24): a named counterparty is an OFFICE, stated by its official role
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
  <p class="crumb"><a class="crumb-home">Your group's Civicsmith</a> &rsaquo; <a id="e-back">Record</a> &rsaquo; Edit</p>
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
  <p class="crumb"><a class="crumb-home">Your group's Civicsmith</a> &rsaquo; Inbox</p>
  <h1>The inbox</h1>
  <p class="small">Material left by people outside the group. Nothing here is part
  of the record, and nothing here has been examined. Treat every item as
  unverified until the group has checked it.</p>
  <div id="inbox-body"><p class="small">Loading&hellip;</p></div>
</section>

<section id="s-members">
  <p class="crumb"><a class="crumb-home">Your group's Civicsmith</a> &rsaquo; Members</p>
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
    on the signing page of your group's Civicsmith. It runs entirely in their browser and sends nothing
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
  <!-- R15, R17, R18: the claim section's settings, each with its current record, offered to an administrator at any
       time. -->
  <h2>Your group's settings</h2>
  ${hostingBlock("mk")}
  ${courtBlock("mk")}
  ${aiBlock("mk")}
  <!-- R23 (DEC-152; K1837): who your group is, its focus and purpose (membership R109), with the assistant's help offered
       only while the assistant is on. A draft fills the fields with its label; nothing is kept until the administrator
       keeps it. -->
  <h2>Who your group is</h2>
  <div class="card" id="gd">
    <p class="small" style="margin:0 0 6px" id="gd-now"></p>
    <div id="gd-help" hidden>
      <p style="margin:0 0 6px"><b>Ask the assistant to help write this.</b> Answer a few questions; the assistant drafts
      your focus and purpose from your answers into the fields below. Nothing is kept until you keep it.</p>
      <label for="gd-q1">What does your group work on?</label>
      <textarea id="gd-q1" rows="2"></textarea>
      <label for="gd-q2">Who does your group work with, or for?</label>
      <textarea id="gd-q2" rows="2"></textarea>
      <label for="gd-q3">Why does your group exist: what do you want to change?</label>
      <textarea id="gd-q3" rows="2"></textarea>
      <div class="actions"><button id="gd-ask">Ask the assistant to help write this</button></div>
      <p class="err" id="gd-ask-err"></p>
    </div>
    <p class="small" id="gd-label" hidden></p>
    <label for="gd-focus">Your group's focus</label>
    <textarea id="gd-focus" rows="3"></textarea>
    <label for="gd-purpose">Why your group exists</label>
    <textarea id="gd-purpose" rows="5"></textarea>
    <div class="actions"><button id="gd-keep">Keep these words</button></div>
    <p class="err" id="gd-err"></p>
  </div>
  <h2>Your language</h2>
  ${languageBlock("mln")}
</section>

<section id="s-enroll">
  <h1>Join this group</h1>
  <p id="en-lede">You were invited. Choose the name the record will show, and a password.</p>
  <div class="card" id="en-who" hidden></div>
  <!-- R2 (DEC-133 (6); membership R104): a join link asks first the name the person chooses for the group to know them
       by, and sends it with the link in op=joinlinkinvite's body; the invitation answered opens the form below. -->
  <div id="en-join" hidden>
    <label for="jn-cover">The name you want this group to know you by</label>
    <input id="jn-cover" spellcheck="false">
    <p class="hint">It need not be your legal name. The group's administrators see it beside your handle.</p>
    <div class="actions" style="margin-top:12px"><button id="jn-go">Ask to join</button></div>
    <p class="err" id="jn-err"></p>
  </div>
  <div id="en-form">
  <label for="en-handle">Your handle</label>
  <input id="en-handle" spellcheck="false" placeholder="lowercase letters, digits and dashes">
  <p class="hint">This is what the record shows: the author of anything you write, and the
  name other members see. It is yours, not the label the administrator used to invite you.</p>
  <label for="en-pw">Choose a password (12 characters or more)</label>
  <input id="en-pw" type="password" autocomplete="new-password">
  <label for="en-pw2">Type it again</label>
  <input id="en-pw2" type="password" autocomplete="new-password">
  <!-- R22 (DEC-127 (1)): the language for the screens, chosen before joining and starting from the device's setting;
       sent once the new member is signed in. -->
  <label for="en-lang">Language for the screens</label>
  <input id="en-lang" spellcheck="false">
  <p class="hint">Filled in from your device's setting. Each word is shown in this language where a translation is
  held, and in English where none is. You can change it at any time.</p>
  <div class="actions" style="margin-top:12px"><button id="en-go">Set it</button></div>
  <p class="err" id="en-err"></p>
  </div>
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
/* R2: an enrolment that cannot go on states why, and the form is hidden. */
function enrolDead(words){
  $("#en-lede").textContent = words;
  document.querySelectorAll("#s-enroll label, #s-enroll input, #s-enroll .hint, #en-go, #en-form, #en-join, #jn-go")
    .forEach((x) => { x.hidden = true; });
  show("#s-enroll");
}
/* R2: the invitation an invitelook answered, shown as who the person was invited as, and the form opened. */
function enrolShow(w){
  $("#en-who").hidden = false;
  $("#en-who").innerHTML = '<div class="kv"><span class="k">Invited as</span><span class="v">'
    + escH(w.cover) + '</span></div>'
    + '<div class="kv"><span class="k">Role</span><span class="v">' + escH(w.role) + '</span></div>'
    + '<div class="kv"><span class="k">You can</span><span class="v">'
    + escH((w.capabilities || []).join(", ") || "read") + '</span></div>';
  $("#en-join").hidden = true;
  $("#en-form").hidden = false;
  /* R22: the language starts from the device's setting. */
  if (!$("#en-lang").value) $("#en-lang").value = (navigator && navigator.language) || "";
  show("#s-enroll");
}
const NOT_LIVE_INVITE = "This invitation link is not live. An invitation is used up the "
  + "moment someone joins with it. Ask whoever invited you for a new one.";
async function state(){
  /* The wizard hands over with the one-time password in the URL fragment.
     Fragments never reach any server. Strip it immediately either way. */
  const join = location.hash.match(/join=([^&]+)/);
  if (join) {
    /* R2 (DEC-133 (6)): a join link rides the fragment, is stripped at once, and leaves the browser only in
       op=joinlinkinvite's body, with the name the person chooses. */
    JOIN = decodeURIComponent(join[1]);
    history.replaceState({}, "", location.pathname);
    $("#en-lede").textContent = "You followed this group's join link. First, say what the group should call you.";
    $("#en-join").hidden = false;
    $("#en-form").hidden = true;
    show("#s-enroll"); return;
  }
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
    if (!look.result || !look.result.ok) { enrolDead(NOT_LIVE_INVITE); return; }
    enrolShow(look.result); return;
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
  catch(e){ $("#s-loading h1").textContent = "This group's Civicsmith is not answering";
    $("#s-loading .small").textContent = "The page loaded but the record behind it did not respond. Wait a moment and reload."; return; }
  window.__ver = b.version || "";
  if (b.claimed) { show("#s-login"); return; }
  if (!b.bootstrapConfigured) { show("#s-unarmed"); return; }
  if (b.rearmed) $("#rearm-note").hidden = false;
  if (boot0) $("#boot").value = boot0;
  show("#s-claim");
}
/* R2: the join link's one call, before sign-in: the link and the chosen name in the body, and the invitation answered
   opens enrolment as #invite= does. A refusal says the link is not live, or the group's daily limit is reached. */
$("#jn-go").addEventListener("click", async ()=>{
  const e = $("#jn-err"); e.textContent = "";
  const cover = $("#jn-cover").value.trim();
  if (!cover) { e.textContent = "Say what the group should call you. It need not be your legal name."; return; }
  $("#jn-go").disabled = true;
  try {
    const r = await api("joinlinkinvite", { link: JOIN, cover });
    const res = r && r.result;
    if (!res || res.ok === false || !res.invite) {
      const why = (res && res.reason) || (r && r.reason);
      if (why === "JOIN_LINK_DAILY_CAP") { enrolDead("This group has reached its daily limit for joining by link. "
        + "Try the link again tomorrow, or ask someone in the group for an invitation."); return; }
      if (why === "NO_COVER") { e.textContent = "Say what the group should call you. It need not be your legal name."; return; }
      enrolDead("This join link is not live. It may have been switched off or replaced. "
        + "Ask someone in the group for the current link or an invitation.");
      return; }
    INVITE = res.invite; JOIN = null;
    const look = await api("invitelook", { invite: INVITE });
    if (!look.result || !look.result.ok) { enrolDead(NOT_LIVE_INVITE); return; }
    $("#en-lede").textContent = "You can join. Choose the name the record will show, and a password.";
    enrolShow(look.result);
  } catch(err){ e.textContent = "That did not go through: " + err.message; }
  finally { $("#jn-go").disabled = false; }
});
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
        ? "This group's Civicsmith was already claimed. If that was not you, replace ADMIN_TOKEN in the Cloudflare dashboard and reload."
        : "Refused: " + r.result.reason;
      return;
    }
    const l = await api("login", { role: "admin", password: p1 });
    if (!l.result || !l.result.token) { panel(l.result, r.result.consumedAt); return; }
    /* R15–R18: signed in, and kept in the claim's section for its three choices and the one recommendation. */
    WHO = "admin";
    signIn(l.result, r.result.consumedAt);
    CLAIMED = { login: l.result, at: r.result.consumedAt };
    $("#claim-form").hidden = true;
    $("#claim-after").hidden = false;
    showSettings("cl");
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
let JOIN = null;
let CLAIMED = null;
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
/* R4: whether this session ADMINISTERS, as op=whoami reports it (the founder and every enrolled administrator),
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

/* The session kept for this tab, without showing the panel (the claim's section shows its choices first, R15). */
function signIn(login, claimedAt){
  if (login && login.token) {
    SESSION = login.token;
    try { sessionStorage.setItem("bio-session", JSON.stringify({ t: login.token, e: login.expires || 0, c: claimedAt || "", w: WHO })); } catch {}
  }
}
function panel(login, claimedAt){
  signIn(login, claimedAt);
  ADMIN = false;
  applyCaps();
  rec("whoami").then((r)=>{
    CAPS = new Set(r && r.result && Array.isArray(r.result.capabilities) ? r.result.capabilities : []);
    ADMIN = !!(r && r.result && r.result.administer === true);
    applyCaps();
    openProfiles();
    openAssistant();
    showLanguage("ln");
  }).catch(()=>{ CAPS = new Set(); ADMIN = false; applyCaps(); openProfiles(); openAssistant(); showLanguage("ln"); });
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
/* R6 (D-719; State Rules section 6): the history reads in WRITE order, never the caller-chosen snap key, whose
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
      : "Listed by snapshot key: your group's Civicsmith does not carry the order they were written, and key order is not necessarily the order they were written.")
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
  if (why === "NO_SIGNERS") return "No keys are registered in your group's Civicsmith yet, so nothing can be published. An administrator registers keys under Members and keys.";
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
     exactly C-2.10, which is the honest one error, and the R5 test in
     test/m/setup-page/page.test.mjs asserts BOTH directions so a future
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
     (No backticks in this comment: it lives inside the PAGE_HTML template
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
    /* R5 (N235): a named counterparty is written as actions R9 requires, an office by its role and body and,
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
    /* R11 (DEC-88 (2); capture R32): handling a knock either way is the member's
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
/* R11: nothing is posted without a reason; a refusal is shown in the plane's own
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
  showSettings("mk"); showGroupDescription(); showLanguage("mln");
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
  return "this key cannot sign, and your group's Civicsmith has not been told why";
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

/* ---- the jurisdiction profiles (R13; instance-setup R12, R14) ----
   Shown by name to every signed-in member. The choice is offered only to a session that administers, with nothing
   preselected: the order a member ticks them is the order they are read. A change is warned about before it is
   sent, and choosing none is allowed and says what it means. */
let PF_ORDER = [];
async function openProfiles(){
  let r = null;
  try { r = await rec("profiles"); } catch { r = null; }
  const res = r && r.result;
  if (!res || res.ok !== true) {
    $("#pf-active").innerHTML = '<p class="small" style="margin:0">Your group&#39;s Civicsmith could not read its jurisdiction profiles just now.</p>';
    $("#pf-choose").hidden = true; return;
  }
  const act = Array.isArray(res.profiles) ? res.profiles : [];
  $("#pf-active").innerHTML = (act.length
    ? act.map((p,i)=>'<div class="kv"><span class="k">'+(i+1)+'. '+escH(p.name || p.id)+'</span><span class="v">'
        + escH((p.covers||[]).join(", ")) + "</span></div>").join("")
    : '<p class="small" style="margin:0">No profile is active: your group&#39;s Civicsmith reads no local facts, and every one is answered as undetermined.'
        + (res.boot && res.boot.why ? " At install, " + escH(res.boot.why) + ", so nothing was recorded." : "") + "</p>")
    + ((res.conflicts||[]).length ? '<p class="small" style="margin:8px 0 0">The active profiles disagree on '
        + (res.conflicts.length) + " fact" + (res.conflicts.length === 1 ? "" : "s") + ", and each is left unread rather than chosen between.</p>" : "");
  /* R20: the offices section, when no active profile names an office; R19's place named in it. */
  if (profilesNameNoOffice(res)) { if (ADMIN) await showPlace(); showOffices(); } else $("#of").hidden = true;
  if (!ADMIN) { $("#pf-choose").hidden = true; return; }
  showPlace();
  PF_ORDER = [];
  $("#pf-warn").hidden = true; $("#pf-err").textContent = "";
  const choices = Array.isArray(res.choices) ? res.choices : [];
  $("#pf-choices").innerHTML = choices.length ? choices.map(p=>
    '<label style="display:flex;gap:8px;align-items:flex-start;font-weight:400">'
    + '<input type="checkbox" class="pf-pick" value="'+escH(p.id)+'" style="width:auto;margin-top:4px">'
    + '<span>'+escH(p.name || p.id)+' <span class="dim">'+escH((p.covers||[]).join(", "))+'</span></span></label>').join("")
    : '<p class="small" style="margin:0">Your group&#39;s Civicsmith holds no profile to choose.</p>';
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
    ? "From now on, your group's Civicsmith reads its local facts from " + order.map(name).join(", then ")
      + ". Local facts will read differently from then on: what the record already holds is unchanged, but anything read after this is read from these profiles."
    : "You chose no profile. From now on your group's Civicsmith reads no local facts, and every one is answered as undetermined. Local facts will read differently from then on.";
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

/* ---- the assistant (R24; instance-setup R53) ----
   Every signed-in member sees whether it is on; only a session that administers is offered the switch, which says
   what it will do before it is pressed. A read that did not answer says so and offers nothing. */
let AS_ON = null;
async function openAssistant(){
  let r = null;
  try { r = await rec("assistantstate"); } catch { r = null; }
  const res = r && r.result;
  if (!res || res.ok !== true || typeof res.on !== "boolean") {
    AS_ON = null;
    $("#as-state").innerHTML = '<p class="small" style="margin:0">Your group&#39;s Civicsmith could not read whether the assistant is on just now.</p>';
    $("#as-choose").hidden = true; return;
  }
  AS_ON = res.on;
  $("#gd-help").hidden = !res.on;
  $("#as-state").innerHTML = '<p class="small" style="margin:0">'
    + (res.on ? "The assistant is on for your group's Civicsmith." : "The assistant is off for your group's Civicsmith.")
    + (res.set_at ? " Last set by " + escH(res.set_by) + " on " + fmtWhen(res.set_at) + "." : "") + "</p>";
  if (!ADMIN) { $("#as-choose").hidden = true; return; }
  $("#as-err").textContent = "";
  $("#as-toggle").textContent = res.on ? "Switch the assistant off" : "Switch the assistant on";
  $("#as-what").textContent = res.on
    ? "Switching it off means no question is put to the assistant and nothing runs, for every member, until an administrator switches it on again."
    : "Switching it on lets every member reached by an account ask the assistant: their own, or the group's API key while it is on.";
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

/* ---- the group's settings: the claim section's acts (R15, R17, R18), offered again in members and keys ----
   One code for both places: P is the block's prefix, cl in the claim section and mk in members and keys. Each act is
   the signed-in administrator's own (the plane stamps who), each refusal is stated in the plane's own words, and a
   block left alone records nothing. */
const ID = (P, x)=>"#" + P + "-" + x;
/* A refusal's words, the plane's own (its translation, else its detail), or null when the answer is not a refusal. */
const refusalOf = (r)=>{
  const res = r && r.result && typeof r.result === "object" ? r.result : r;
  if (r && r.ok !== false && res && res.ok !== false) return null;
  return (res && (res.translation || res.detail)) || (r && (r.translation || r.detail || r.error))
    || ("Refused: " + ((res && res.reason) || (r && r.reason) || "unknown"));
};
const resultOf = (r)=> r && r.result && typeof r.result === "object" ? r.result : null;
const checkedOf = (name, values)=>{ for (const v of values) { const x = $("#" + name + "-" + v); if (x && x.checked) return v; } return null; };
/* R15: the current hosting-access record, or that none is recorded. */
async function showHosting(P){
  let h = null;
  try { h = resultOf(await rec("hostingaccess")); } catch { h = null; }
  const now = $(ID(P, "ha-now"));
  if (!h || h.ok === false) { now.textContent = "Who holds the hosting account could not be read just now."; return; }
  const c = h.current;
  now.textContent = c ? "Recorded: " + c.holders + (c.note ? " (" + c.note + ")" : "") + ", by " + (c.recorded_by || "an administrator")
    + (c.at ? " on " + new Date(c.at).toLocaleDateString() : "") + "." : "No one is recorded as holding the hosting account yet.";
}
async function hostingSet(P){
  const e = $(ID(P, "ha-err")); e.textContent = "";
  const note = $(ID(P, "ha-note")).value.trim();
  $(ID(P, "ha-set")).disabled = true;
  try {
    const r = await post("hostingaccessset", { holders: $(ID(P, "ha-holders")).value, note: note || null });
    const why = refusalOf(r);
    if (why) { e.textContent = why; return; }
    $(ID(P, "ha-holders")).value = ""; $(ID(P, "ha-note")).value = "";
    showHosting(P);
  } catch(err){ e.textContent = "That did not go through: " + err.message; }
  finally { $(ID(P, "ha-set")).disabled = false; }
}
/* R17: the current choice; unchosen reads as not telling. */
const COURT_NOW = { tell: "Your members are told what a court can reach.", dont: "Your members are not told what a court can reach." };
async function showCourt(P){
  let c = null;
  try { c = resultOf(await rec("courtnotice")); } catch { c = null; }
  $(ID(P, "cn-now")).textContent = !c || !("choice" in c) ? "Whether members are told could not be read just now."
    : COURT_NOW[c.choice] || "Nobody has chosen yet, which reads as not telling.";
}
async function courtSet(P){
  const e = $(ID(P, "cn-err")); e.textContent = "";
  const choice = checkedOf(P + "-cn", ["tell", "dont"]);
  if (!choice) { e.textContent = "Choose one, or leave this unchosen: nothing is recorded until you do."; return; }
  $(ID(P, "cn-set")).disabled = true;
  try {
    const why = refusalOf(await post("courtnoticeset", { choice }));
    if (why) { e.textContent = why; return; }
    showCourt(P);
  } catch(err){ e.textContent = "That did not go through: " + err.message; }
  finally { $(ID(P, "cn-set")).disabled = false; }
}
/* R18: the current state, from instance-setup's switch and the group key's state (never the key). */
async function showAi(P){
  let a = null, k = null;
  try { a = resultOf(await rec("assistantstate")); } catch { a = null; }
  try { k = resultOf(await rec("groupkeystate")); } catch { k = null; }
  const parts = [];
  parts.push(!a || typeof a.on !== "boolean" ? "Whether the assistant is on could not be read just now."
    : a.on ? "The assistant is on for your group's Civicsmith." : "The assistant is off for your group's Civicsmith.");
  if (k && typeof k.held === "boolean")
    parts.push(k.held ? "The group's API key is held, and " + (k.on ? "on" : "off") + "." : "No group API key is held.");
  else if (k && typeof k.on === "boolean") parts.push("The group's API key is " + (k.on ? "on" : "off") + ".");
  $(ID(P, "ai-now")).textContent = parts.join(" ");
}
function aiKeyBox(P){
  const c = checkedOf(P + "-ai", ["group", "own", "both", "none"]);
  $(ID(P, "ai-keybox")).hidden = !(c === "group" || c === "both");
}
async function aiSet(P){
  const e = $(ID(P, "ai-err")); e.textContent = "";
  const choice = checkedOf(P + "-ai", ["group", "own", "both", "none"]);
  if (!choice) { e.textContent = "Choose one, or leave this unchosen: nothing changes until you do."; return; }
  const wantsKey = choice === "group" || choice === "both";
  /* the key is read once and the field emptied at once: it is never shown again, not even here */
  const key = wantsKey ? $(ID(P, "ai-key")).value.trim() : "";
  $(ID(P, "ai-key")).value = "";
  if (wantsKey && !key) { e.textContent = "Paste the group's Anthropic API key to use it."; return; }
  $(ID(P, "ai-set")).disabled = true;
  try {
    let why = refusalOf(await post("assistantset", { on: choice !== "none" }));
    if (why) { e.textContent = why; return; }
    if (wantsKey) {
      why = refusalOf(await post("groupkeyset", { key }));
      if (why) { e.textContent = why; showAi(P); return; }
      why = refusalOf(await post("groupkeyswitch", { on: true }));
      if (why) { e.textContent = why; showAi(P); return; }
    }
    showAi(P);
    openAssistant();
  } catch(err){ e.textContent = "That did not go through: " + err.message; }
  finally { $(ID(P, "ai-set")).disabled = false; }
}
function showSettings(P){ showHosting(P); showCourt(P); showAi(P); }
for (const P of ["cl", "mk"]) {
  $(ID(P, "ha-set")).addEventListener("click", ()=>hostingSet(P));
  $(ID(P, "cn-set")).addEventListener("click", ()=>courtSet(P));
  $(ID(P, "ai-set")).addEventListener("click", ()=>aiSet(P));
  for (const v of ["group", "own", "both", "none"]) $(ID(P, "ai-" + v)).addEventListener("change", ()=>aiKeyBox(P));
}
$("#claim-on").addEventListener("click", ()=>{
  $("#claim-after").hidden = true; $("#claim-form").hidden = false;
  panel(CLAIMED && CLAIMED.login, CLAIMED && CLAIMED.at);
});

/* ---- a member's language for the screens (R22) ----
   The member's own act, on the panel (ln) and in members and keys (mln); the field starts from the device's setting
   until the member has chosen, and an empty field clears the choice so the device's setting governs again. */
async function showLanguage(P){
  let r = null;
  try { r = resultOf(await rec("memberlanguage")); } catch { r = null; }
  const now = $("#" + P + "-now");
  if (!r || !("language" in r)) { now.textContent = "Your language could not be read just now."; return; }
  now.textContent = r.language ? "Your screens use " + r.language + "." : "Your screens follow your device's setting.";
  $("#" + P + "-tag").value = r.language || (navigator && navigator.language) || "";
}
async function languageSet(P, tag){
  const e = $("#" + P + "-err"); e.textContent = "";
  const t = String(tag || "").trim();
  try {
    const why = refusalOf(await post("memberlanguageset", { language: t || null }));
    if (why) { e.textContent = why; return false; }
    showLanguage(P);
    return true;
  } catch(err){ e.textContent = "That did not go through: " + err.message; return false; }
}
for (const P of ["ln", "mln"]) $("#" + P + "-set").addEventListener("click", ()=>languageSet(P, $("#" + P + "-tag").value));

/* ---- Places: a place not yet listed (R19) ---- */
async function showPlace(){
  let r = null;
  try { r = resultOf(await rec("placewantedstate")); } catch { r = null; }
  PLACE = r && typeof r.name === "string" && r.name ? r.name : null;
  $("#pw-now").textContent = PLACE ? "Named: " + PLACE + ". Administrators will be told when an update brings it." : "";
  return PLACE;
}
let PLACE = null;
$("#pw-set").addEventListener("click", async ()=>{
  const e = $("#pw-err"); e.textContent = "";
  const name = $("#pw-name").value.trim();
  if (!name) { e.textContent = "Write the place's name."; return; }
  $("#pw-set").disabled = true;
  try {
    const why = refusalOf(await post("placewanted", { name }));
    if (why) { e.textContent = why; return; }
    $("#pw-name").value = "";
    await showPlace();
    if (!$("#of").hidden) showOffices();
  } catch(err){ e.textContent = "That did not go through: " + err.message; }
  finally { $("#pw-set").disabled = false; }
});

/* ---- the offices section (R20) ----
   Shown when no active profile names an office: it says nothing is filled in because Civicsmith does not hold the
   group's place yet, names the place an administrator named (R19), and offers an administrator adding the group's own
   offices through op=entitycreate, each the administrator's own act, with no profile as its basis. Every office added
   here is listed marked as added by the group. */
let OFFICES = [];
function profilesNameNoOffice(res){
  if (!res || res.ok !== true) return false;
  if (Array.isArray(res.offices)) return res.offices.length === 0;
  return !(Array.isArray(res.profiles) && res.profiles.length);
}
function showOffices(){
  $("#of").hidden = false;
  $("#of-why").textContent = "Nothing is filled in here because Civicsmith does not hold your group's place yet"
    + (PLACE ? " (" + PLACE + ")" : "") + ". "
    + (ADMIN ? "You can add your group's offices yourself; each is marked as added by your group."
             : "An administrator can add your group's offices; each is marked as added by your group.");
  $("#of-list").innerHTML = OFFICES.map((o)=>'<div class="kv"><span class="k">' + escH(o.label)
    + '</span><span class="v"><span class="chip">added by your group</span></span></div>').join("");
  $("#of-add").hidden = !ADMIN;
}
$("#of-set").addEventListener("click", async ()=>{
  const e = $("#of-err"); e.textContent = "";
  const label = $("#of-label").value.trim(), note = $("#of-note").value.trim();
  if (!label) { e.textContent = "Name the office."; return; }
  if (!note) { e.textContent = "Say in your own words who or what this office is."; return; }
  $("#of-set").disabled = true;
  try {
    const r = await post("entitycreate", { kind: "office", label, note });
    const why = refusalOf(r);
    if (why) { e.textContent = why; return; }
    const res = resultOf(r) || {};
    OFFICES.push({ entity_id: res.entity_id || null, label: res.label || label });
    $("#of-label").value = ""; $("#of-note").value = "";
    showOffices();
  } catch(err){ e.textContent = "That did not go through: " + err.message; }
  finally { $("#of-set").disabled = false; }
});

/* ---- who your group is (R23) ----
   The focus and purpose an administrator keeps (membership R109), and, only while the assistant is on, the act of
   asking it to help write them (op=groupdescriptiondraft): a draft fills the fields with its label and nothing is kept
   until the administrator keeps it. A refusal, ASSISTANT_DRAFT_UNAVAILABLE among them, is stated in its own words and
   the fields are left as they were. */
let GD_LAST = null;
async function showGroupDescription(){
  let r = null;
  try { r = resultOf(await rec("groupdescription")); } catch { r = null; }
  GD_LAST = r && r.description ? r.description : null;
  $("#gd-now").textContent = !r ? "Who your group is could not be read just now."
    : GD_LAST ? "Last kept by " + (GD_LAST.by || "an administrator") + (GD_LAST.at ? " on " + new Date(GD_LAST.at).toLocaleDateString() : "") + "."
    : "Nothing is written yet. It is optional.";
  $("#gd-focus").value = (GD_LAST && GD_LAST.focus) || "";
  $("#gd-purpose").value = (GD_LAST && GD_LAST.purpose) || "";
  $("#gd-label").hidden = true; $("#gd-label").textContent = "";
}
const GD_QUESTIONS = [["gd-q1", "What does your group work on?"], ["gd-q2", "Who does your group work with, or for?"],
  ["gd-q3", "Why does your group exist: what do you want to change?"]];
$("#gd-ask").addEventListener("click", async ()=>{
  const e = $("#gd-ask-err"); e.textContent = "";
  const answers = GD_QUESTIONS.map(([id, question])=>({ question, text: $("#" + id).value.trim() }));
  $("#gd-ask").disabled = true;
  try {
    const r = await post("groupdescriptiondraft", { answers });
    const why = refusalOf(r);
    if (why) { e.textContent = why; return; }
    const d = resultOf(r) || {};
    const f = d.focus && typeof d.focus.text === "string" ? d.focus : null;
    const pu = d.purpose && typeof d.purpose.text === "string" ? d.purpose : null;
    if (!f && !pu) { e.textContent = "The assistant answered no draft. Nothing was changed."; return; }
    if (f) $("#gd-focus").value = f.text;
    if (pu) $("#gd-purpose").value = pu.text;
    const by = (f && f.label && f.label.asked_by) || (pu && pu.label && pu.label.asked_by) || WHO;
    $("#gd-label").textContent = "Draft · the assistant's, asked by " + by;
    $("#gd-label").hidden = false;
  } catch(err){ e.textContent = "That did not go through: " + err.message; }
  finally { $("#gd-ask").disabled = false; }
});
$("#gd-keep").addEventListener("click", async ()=>{
  const e = $("#gd-err"); e.textContent = "";
  /* R109 appends a whole record: the kinds and the visibility already kept travel with the new words unchanged. */
  const last = GD_LAST || {};
  const body = { kinds: Array.isArray(last.kinds) ? last.kinds : [], otherKind: last.otherKind || null,
    visibility: last.visibility || "members", focus: $("#gd-focus").value, purpose: $("#gd-purpose").value };
  $("#gd-keep").disabled = true;
  try {
    const why = refusalOf(await post("groupdescriptionset", body));
    if (why) { e.textContent = why; return; }
    showGroupDescription();
  } catch(err){ e.textContent = "That did not go through: " + err.message; }
  finally { $("#gd-keep").disabled = false; }
});

/* ---- enrolment, for an invited member with no password yet ---- */
$("#en-go").addEventListener("click", async ()=>{
  const e = $("#en-err"); e.textContent = "";
  /* R3 (U77): the new password is asked twice, and nothing is sent while the two differ. */
  const pw = $("#en-pw").value;
  if (pw !== $("#en-pw2").value) { e.textContent = "The two passwords do not match."; return; }
  const r = await api("enroll", { invite: INVITE,
    handle: $("#en-handle").value.trim().toLowerCase(), password: pw });
  if (!r.result || !r.result.ok) {
    const why = r.result && r.result.reason;
    e.textContent = why === "PASSWORD_TOO_SHORT" ? "The password needs at least 12 characters."
      : why === "HANDLE_TAKEN" ? "Someone already uses that handle. Choose another."
      : why === "NO_HANDLE" ? "Choose a handle. It is the name the record will show."
      : why === "BAD_HANDLE" ? "A handle is lowercase letters, digits and dashes, at least two characters."
      : "This invitation link is not live. Ask whoever invited you for a new one.";
    return; }
  /* R22: signed in with the password just set, then the language chosen before joining is sent as the member's own
     act. If the sign-in does not go through, the sign-in form is shown with the handle filled in, as before. */
  const handle = r.result.memberId;
  let l = null;
  try { l = await api("login", { role: "member:" + handle, password: pw }); } catch { l = null; }
  if (!l || !l.result || !l.result.ok || !l.result.token) {
    $("#lwho").value = handle; $("#lpw").value = ""; show("#s-login"); return; }
  WHO = handle;
  const b = await api("bootstrap").catch(()=>({}));
  panel(l.result, b && b.consumedAt);
  await languageSet("ln", $("#en-lang").value);
});
document.querySelectorAll(".crumb-home").forEach(a=>a.addEventListener("click", ()=>{
  document.querySelector("main").classList.remove("wide"); show("#s-panel"); }));

state();
</script>
</body>
</html>`;
