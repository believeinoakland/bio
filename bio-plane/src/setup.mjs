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
 */

import { STATES, HEADINGS } from "../checks/bio-checks.mjs";

/* The intake form obeys the check catalog's own tables rather than a copy of
   them. Injected at module load, so a catalog change moves the UI with it and
   drift is impossible rather than merely discouraged. The previous version
   carried a hand-written table that stamped `forming` on Problems and Actions,
   which is legal for neither, and the plane's own gate was too thin to notice
   (DEBT D-6, D-7). */
const FIRST_STATE_JSON = JSON.stringify(
  Object.fromEntries(Object.entries(STATES).map(([t, s]) => [t, s.legal[0]])));
const HEADINGS_JSON = JSON.stringify(HEADINGS);

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
<p class="eyebrow">Believe in Oakland &middot; group instance</p>

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
  <div class="card"><p class="small" style="margin:0"><b>If you ever lose the
  password you choose here,</b> you are not locked out. Sign in to Cloudflare,
  replace the ADMIN_TOKEN value in this worker's settings, and this claim step
  starts over. Your Cloudflare sign-in is the way back in.</p></div>
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
    <div class="kv"><span class="k">Roles with passwords</span><span class="v" id="p-roles"></span></div>
    <div class="kv"><span class="k">Session expires</span><span class="v" id="p-expires"></span></div>
  </div>
  <div class="actions" style="margin:22px 0 6px">
    <button id="go-browse">Browse the record</button>
    <button id="go-new">Add something new</button>
    <button id="go-inbox">Review the inbox</button>
    <button id="go-members" hidden>Members and keys</button>
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
  <h2>Files in this bundle</h2>
  <div class="card" id="b-files"></div>
  <h2>History</h2>
  <p class="small">Every revision this bundle has ever had, oldest first. The
  record is append-only: nothing here can be edited or removed.</p>
  <div class="card" id="b-history"></div>
  <div id="b-ratify"></div>
</section>

<section id="s-new">
  <p class="crumb"><a class="crumb-home">This copy</a> &rsaquo; New</p>
  <h1>Add something new</h1>
  <p class="small">This creates a bundle in the working record. Nothing here is
  public: the working record has never been published and cannot be read by
  anyone without a password.</p>
  <label for="n-type">What kind of thing is this?</label>
  <select id="n-type">
    <option value="information">Information</option>
    <option value="focus">Focus</option>
    <option value="project">Project</option>
    <option value="action">Action</option>
  </select>
  <label for="n-title">Title</label>
  <input id="n-title" placeholder="what this is about">
  <label for="n-body">What do you know?</label>
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
  <div class="actions" style="margin-top:16px"><button id="n-save">Create it</button></div>
  <p class="err" id="n-err"></p>
</section>

<section id="s-edit">
  <p class="crumb"><a class="crumb-home">This copy</a> &rsaquo; <a id="e-back">Bundle</a> &rsaquo; Edit</p>
  <h1>Revise this</h1>
  <p class="small">Saving adds a revision. The version you are replacing stays in
  the history forever; nothing is overwritten and nothing is lost.</p>
  <div class="card"><div class="kv"><span class="k">Bundle</span><span class="v mono" id="e-id"></span></div></div>
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
    if (!l.result || !l.result.ok) {
      e.textContent = l.result && l.result.reason === "NO_SUCH_ROLE"
        ? "No member by that name has set a password on this copy yet."
        : "That name and password were not accepted."; return; }
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
let INVITE = null;
/* Everything section 5 hides, in ONE place, so a control cannot be added later
   in a screen that forgot to ask. Called before whoami answers as well as after,
   so the window between showing the panel and hearing back shows nothing the
   member may not use. */
function applyCaps(){
  $("#go-new").hidden = !can("contribute");
  const t = $("#n-type");
  if (t) for (const o of t.options) if (o.value === "project") o.hidden = !can("create_projects");
}

function panel(login, claimedAt){
  if (login && login.token) {
    SESSION = login.token;
    try { sessionStorage.setItem("bio-session", JSON.stringify({ t: login.token, e: login.expires || 0, c: claimedAt || "", w: WHO })); } catch {}
  }
  $("#go-members").hidden = WHO !== "admin";
  applyCaps();
  rec("whoami").then((r)=>{
    CAPS = new Set(r && r.result && Array.isArray(r.result.capabilities) ? r.result.capabilities : []);
    applyCaps();
  }).catch(()=>{ CAPS = new Set(); applyCaps(); });
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
const TYPES = [["information","Information"],["focus","Focuses"],["project","Projects"],["action","Actions"]];
const fmtWhen = (iso)=>{ const d=new Date(iso); return isNaN(d)?escH(iso):d.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"}); };
const chip = (st)=>'<span class="chip '+escH(st)+'">'+escH(st)+"</span>";

async function openBrowse(){
  show("#s-browse");
  let list;
  try { list = (await rec("list")).result || []; } catch { return; }
  const by = {};
  for (const b of list) (by[b.object_type] ||= []).push(b);
  $("#browse-summary").textContent = list.length + " bundles. Everything below is read-only; the record can only be changed through the gated tools.";
  let html = "";
  for (const [t, label] of TYPES){
    const rows = by[t] || []; delete by[t];
    if (!rows.length) continue;
    html += "<h2>"+label+" ("+rows.length+")</h2><table class=\\"rec\\"><tr><th>Bundle</th><th>State</th><th>Updated</th></tr>";
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
  if (!img){ $("#b-md").innerHTML = "<p>This bundle was not found.</p>"; return; }
  CURRENT = { id, img };
  renderBundle(id, img, null);
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
  entries = entries.slice().sort((a,b)=>String(a.key).localeCompare(String(b.key)));
  $("#b-history").innerHTML = entries.map(e=>{
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
    + '<div class="card"><div class="kv"><span class="k">Bundle</span><span class="v mono">'+escH(id)+"</span></div>"
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
  if (why === "RATIFY_STALE") return "Someone saved a newer revision while you were signing. Reload this bundle and sign the new hash.";
  if (why === "NO_SIGNERS") return "No keys are registered on this copy yet, so nothing can be published. An administrator registers keys under Members and keys.";
  if (why === "SIG_UNKNOWN_KEY") return "That signature was made with a key this group has not registered, or one that has been revoked.";
  if (why === "SIG_BAD_SIGNATURE") return "That signature does not match this bundle and hash. Sign the exact values shown above.";
  if (why === "SIG_NAMESPACE") return "That signature was made for something other than ratification. Use the Sign a ratification tab.";
  if (why === "MALFORMED") return "That does not look like a signature. Copy the whole block, including the BEGIN and END lines.";
  if (why === "GATE_REFUSED") return "The checks refused this bundle: "
    + (r.findings||[]).map(f=>f.check + (f.where ? " (" + f.where + ")" : "")).join(", ")
    + ". Publishing is blocked until those are fixed.";
  return "Refused: " + why;
}

/* ---- intake: writing into the working record from this page ----
   Every write below goes through the same gated API a machine caller uses.
   Authorship is stamped by the server from the session, so nothing typed
   here can claim to be someone else. */
const NL = String.fromCharCode(10);
const PREFIX = { information:"INFO", focus:"FOCUS", problem:"PROB", project:"PROJ", action:"ACTN" };
/* From the check catalog, not from memory. */
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
const SCHEMA_OF = { information:"information@1", focus:"focus@1", problem:"problem@1", project:"project@1", action:"action@1" };
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
const mdFor = (id, type, state, title, body, now, hasDoc)=>{
  const fm = ["---","id: "+id,"object_type: "+type,"schema: "+schemaFor(type, hasDoc),
    "title: "+JSON.stringify(title),"current_state: "+state,"prior_state: null",
    "created: "+now,"last_updated: "+now,
    "produced_by:","  mode: assisted","  capability_tier: session",
    "group: believe-in-oakland","references: []","state_history: []",
    "annotations_open: 0","reeval_pending:","  flag: false","  since: null",
    "  source: null","visuals: []"];
  if (type === "information") fm.push(
    "criticality: supporting","source_status: unchanged",
    "source:","  locator: in hand","  authority: member-entered","  retrieved: "+now,
    "monitoring:","  enabled: false","  frequency: none");
  if (type === "focus" || type === "problem") fm.push(
    "surfaced_by: human","recheck_triggers:","  - text: Revisit this",
    "    description: A member set no specific trigger at creation; replace this with a real one.");
  if (type === "project") fm.push("objective: "+JSON.stringify(title));
  if (type === "action") fm.push(
    "action_kind: other","risk_tier: 1","counterparty: to be named");
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
  const files = [{ path:"bundle.md", text, bytes:text.length, sha256:textSha }];
  if (!doc) return files;
  const prov = JSON.stringify({ documents: [doc] }, null, 1);
  files.push({ path:"data/provenance.json", text: prov, bytes: prov.length,
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
  if (why === "NO_AUTHORITY") return "Say who issued the document.";
  if (why === "SOURCE_REFUSED") return "The site answered with an error (" + a.status + "). The address may be wrong, or the document may no longer be published there.";
  if (why === "FETCH_FAILED") return "The site could not be reached just now. Nothing was written.";
  if (why === "EMPTY") return "The site returned an empty document, so there was nothing to keep.";
  if (why === "TOO_LARGE") return "That document is too large to capture this way (" + a.bytes + " bytes). Large documents are captured in parts.";
  return "The document could not be captured: " + why;
}

/* ---- create ---- */
$("#go-new").addEventListener("click", ()=>{ $("#n-err").textContent=""; show("#s-new"); });
$("#n-save").addEventListener("click", async ()=>{
  const e = $("#n-err"); e.textContent = "";
  const type = $("#n-type").value, title = $("#n-title").value.trim(), body = $("#n-body").value.trim();
  if (!title) { e.textContent = "Give it a title."; return; }
  if (!body) { e.textContent = "Write something in the body."; return; }
  $("#n-save").disabled = true;
  try {
    const year = String(new Date().getFullYear());
    const a = await rec("allocid", { prefix: PREFIX[type], year });
    const id = a.result.id + "-" + title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40);
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
    const text = mdFor(id, type, state, title, body, now, !!doc);
    const r = await post("promote", {
      bundleId: id, base: null, snapKey: stamp(), author: WHO,
      meta: { object_type:type, group:"believe-in-oakland", title, current_state:state, created:now, last_updated:now },
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
    if (typeof v === "string") out.push({ path, text: v, bytes: v.length, sha256: await sha256Text(v) });
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
      meta: { object_type: fmv.object_type, group:"believe-in-oakland", title: fmv.title || EDIT_ID,
              current_state: fmv.current_state, created: fmv.created || now, last_updated: now },
      files: [{ path:"bundle.md", text: revised, bytes: revised.length, sha256: await sha256Text(revised) },
              ...(await carryForward(EDIT_ID, "bundle.md"))],
      register: [],
    });
    if (!r.result || !r.result.ok) {
      const why = (r.result && r.result.reason) || r.error || "unknown";
      if (why === "FILES_DROPPED") {
        e.textContent = "Saving would have removed files this bundle holds ("
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
  $("#inbox-body").innerHTML = rows.map(k=>
    '<div class="card"><div class="kv"><span class="k mono">'+escH(k.knock_id)+'</span><span class="v">'
    + chip(k.status) + ' <span class="dim">' + fmtWhen(k.received) + "</span></span></div>"
    + '<div class="kv"><span class="k">Hash</span><span class="v mono">'+escH(k.sha256)+"</span></div>"
    + '<div class="kv"><span class="k">Size</span><span class="v">'+escH(k.bytes)+" bytes</span></div>"
    + (k.note ? '<div class="kv"><span class="k">Note</span><span class="v">'+escH(k.note)+"</span></div>" : "")
    + (k.contact ? '<div class="kv"><span class="k">Contact</span><span class="v">'+escH(k.contact)+"</span></div>" : "")
    + (k.resolved_by ? '<div class="kv"><span class="k">Handled by</span><span class="v">'+escH(k.resolved_by)+"</span></div>" : "")
    /* Reading the inbox is not gated; ACTING on it is. A member with view
       rights sees what arrived and cannot disposition it. */
    + (can("contribute")
      ? '<div class="actions" style="margin-top:10px">'
        + '<button class="ibtn" data-id="'+escH(k.knock_id)+'" data-to="pulled">Mark as taken up</button> '
        + '<button class="ibtn" data-id="'+escH(k.knock_id)+'" data-to="discarded">Set aside</button></div>'
      : "") + "</div>").join("");
  document.querySelectorAll("#inbox-body .ibtn").forEach(b=>b.addEventListener("click", async ()=>{
    await post("inboxresolve", { knockId: b.dataset.id, status: b.dataset.to });
    openInbox();
  }));
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
    + ' <button class="kbtn" data-key="'+escH(x.key_b64)+'" data-to="'
    + (x.status==="revoked"?"active":"revoked") + '">'
    + (x.status==="revoked"?"reinstate":"revoke") + "</button></span></div>").join("")
    : '<p class="small" style="margin:0">No keys registered. Until a key is registered, nothing can be published.</p>';
  document.querySelectorAll("#k-list .kbtn").forEach(b=>b.addEventListener("click", async ()=>{
    await post("signerset", { keyB64: b.dataset.key, status: b.dataset.to }); openMembers();
  }));
}
function memberWhy(res, wanted){
  const why = (res && res.reason) || "unknown";
  if (why === "BAD_MEMBER_ID") return "A member name is lowercase letters, digits and dashes, at least two characters. "
    + (wanted ? "Try " + wanted + "." : "");
  if (why === "NO_COVER") return "Give a cover as well as a sign-in name: a label you will recognise them by. It does not have to be their real name.";
  if (why === "EXISTS") return "There is already a member with that name.";
  if (why === "NO_SUCH_MEMBER") return "There is no member by that name. Add them first, then register their key.";
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
  const t = String(line||"").trim().split(" ").filter(function(x){ return x; });
  if (t.length < 2 || t[0] !== "ssh-ed25519" || !/^AAAA/.test(t[1]))
    return { ok:false, why:"That does not look like a public key line. It should be one line starting with ssh-ed25519." };
  const label = t.slice(2).join(" ");
  if (label === "bio-release")
    return { ok:false, why:"That is the RELEASE key, which signs software. This box wants the ratification key, the one labelled bio-ratify." };
  return { ok:true, label: label || "(no label)", fp: t[1].slice(0,16) };
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
  const r = await post("signeradd", { keyB64: $("#k-key").value.trim(),
    memberId: $("#k-who").value.trim().toLowerCase() });
  if (!r.result || !r.result.ok) {
    e.textContent = r.result && r.result.reason === "BAD_KEY"
      ? "That is not a public key this system can read. Copy the whole line from the signing page."
      : memberWhy(r.result);
    return; }
  $("#k-key").value = ""; $("#k-who").value = ""; openMembers();
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
