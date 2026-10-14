/* journey-check R5, R6: a fake plane over HTTP for the live arm, as a browser meets a test instance. Its front page signs a
   handle in with `login`; every `/app/<id>` draws screen `<id>` in a working frame (the test band across the frame, the
   tabs pinned to the viewport's foot, every class defined by its stylesheet) after `whoami`, which answers each handle's
   `administer` as `admins` says. The administrator is drawn `memberadd` on Members; both roles are drawn `testify`.
   `adminActs: false` draws the administrator nothing more than the member. `flaws` puts one flaw on one screen:
   {screen: "wide" | "tabs" | "band" | "class" | "words"}.
   R12: `projects`, `project`, `question` and `connect` draw just enough of R9's steps 2 to 4 to reach the sign-in:
   a project and a question opened by `promote`, and the subscription's sign-in (`subscriptionsignin`: a link to
   Anthropic's page, then the code typed), each drawing the words the walk asserts, through `word`. `codes` records each
   code the plane was sent. */
import { createServer } from "node:http";
import { word } from "../../../src/setup-words/index.mjs";

const WORDS = { empty: word("question.empty.heading"), connected: word("screen.connect.own.subscription", { plan: "Pro", date: "14 October 2026" }) };

const CSS = `body{margin:0;font:16px sans-serif}.cs-frame{display:block;width:100%}.cs-testband{display:block;padding:4px}
.cs-main{display:block;padding:16px 16px 80px}.cs-tabs{position:fixed;left:0;right:0;bottom:0;height:48px;display:flex;background:#eee}
.cs-tab{flex:1}.cs-btn{display:inline-block}.t-title{font-size:24px}.cs-signin{display:block}.cs-narrow{width:120px}
.cs-wide{width:2000px;height:10px}.cs-flow{position:static}`;
const FLAW = {
  wide: '<div class="cs-wide"></div>',
  class: '<p class="cs-unstyled">Read more</p>',
  words: "<p>Could not read this, because NO_CALC.</p>",
};

export async function fakePlane({ admins = {}, flaws = {}, adminActs = true } = {}) {
  const seen = [], codes = [];
  const sessions = new Map();
  const page = (body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>Civicsmith</title><link rel="stylesheet" href="/app/assets/civicsmith.css"></head><body>${body}</body></html>`;
  const front = page(`<main id="cs-main" class="cs-main" data-screen="front"><h1 class="t-title">Sign in</h1>
<div class="cs-signin"><label>Handle <input id="fs-handle"></label><label>Password <input id="fs-pw" type="password"></label>
<button class="cs-btn" data-act="login" type="button">Sign in</button></div></main>
<script>document.querySelector('[data-act="login"]').onclick = async () => {
  const r = await (await fetch("/api/?op=login", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ handle: document.getElementById("fs-handle").value, password: document.getElementById("fs-pw").value }) })).json();
  if (r.ok) { sessionStorage.setItem("t", r.token); location.href = "/app"; }
};</script>`);
  const app = page(`<div id="root"></div><script>(async () => {
  const id = location.pathname === "/app" ? "home" : location.pathname.slice(5).split("/")[0];
  const who = await (await fetch("/api/?op=whoami", { headers: { authorization: "Bearer " + sessionStorage.getItem("t") } })).json();
  const flaws = ${JSON.stringify(flaws)}, FLAW = ${JSON.stringify(FLAW)};
  const f = flaws[id];
  const acts = '<button class="cs-btn" data-act="testify" type="button">Testify</button>'
    + (${JSON.stringify(adminActs)} && who.result.administer && id === "members" ? '<button class="cs-btn" data-act="memberadd" type="button">Invite a member</button>' : "");
  document.getElementById("root").innerHTML = '<div class="cs-frame" id="cs-frame">'
    + '<div class="cs-testband' + (f === "band" ? " cs-narrow" : "") + '" role="note">A test instance</div>'
    + '<main class="cs-main" id="cs-main" data-screen="' + id + '">' + (STEPS[id] ? STEPS[id]() : '<h1 class="t-title">A screen</h1>' + acts + (FLAW[f] || "")) + '</main>'
    + '<nav class="cs-tabs' + (f === "tabs" ? " cs-flow" : "") + '"><a class="cs-tab" href="/app">Home</a><a class="cs-tab" href="/app/queue">Queue</a></nav></div>';
  const on = (op, fn) => { for (const b of document.querySelectorAll('[data-act="' + op + '"]')) b.onclick = fn; };
  on("promote", () => { const t = document.querySelector("#projects-title, #project-question");
    sessionStorage.setItem(t.id, t.value); location.href = t.id === "projects-title" ? "/app/project/P1" : "/app/question/Q1"; });
  on("subscriptionsignin", async (e) => {
    const code = document.getElementById("mc-code0").value;
    if (!code) { document.getElementById("mc-link").hidden = false; return; }
    const r = await (await fetch("/api/?op=subscriptionsignin", { method: "POST", body: JSON.stringify({ step: "code", code }) })).json();
    if (r.ok) document.getElementById("mc-done").hidden = false;
  });
})();
const W = ${JSON.stringify(WORDS)};
var STEPS = {
  projects: () => '<h1 class="t-title">Projects</h1><input id="projects-title"><button class="cs-btn" data-act="promote" type="button">Start a project</button>',
  project: () => '<h1 class="t-title">' + sessionStorage.getItem("projects-title") + '</h1><textarea id="project-question"></textarea><button class="cs-btn" data-act="promote" type="button">Open a question</button>',
  question: () => '<h1 class="t-title">' + sessionStorage.getItem("project-question") + '</h1><p>' + W.empty + '</p>',
  connect: () => '<h1 class="t-title">The assistant</h1><button class="cs-btn" data-act="subscriptionsignin" type="button">Open the sign-in page</button>'
    + '<p id="mc-link" hidden><a href="https://claude.ai/oauth/authorize?code=true" target="_blank">Open it in a new tab</a></p>'
    + '<input id="mc-code0" type="password"><button class="cs-btn" data-act="subscriptionsignin" type="button">Connect</button><p id="mc-done" hidden>' + W.connected + '</p>',
};</script>`);
  const server = createServer(async (req, res) => {
    const u = new URL(req.url, "http://x");
    seen.push(`${req.method} ${u.pathname}${u.search}`);
    const send = (status, type, body) => { res.writeHead(status, { "content-type": type }); res.end(body); };
    const json = (o) => send(200, "application/json", JSON.stringify(o));
    if (u.pathname === "/api/") {
      const op = u.searchParams.get("op");
      if (op === "bootstrap") return json({ ok: true, test_instance: true });
      if (op === "login") {
        let body = ""; for await (const c of req) body += c;
        const { handle } = JSON.parse(body);
        const token = "tok" + sessions.size;
        sessions.set(token, handle);
        return json({ ok: true, token });
      }
      if (op === "subscriptionsignin") {
        let body = ""; for await (const c of req) body += c;
        codes.push(JSON.parse(body).code);
        return json({ ok: true, result: { connected: true } });
      }
      if (op === "whoami") {
        const handle = sessions.get((req.headers.authorization || "").replace(/^Bearer /, ""));
        return json({ ok: true, result: { session: true, member: "m-" + handle, handle, administer: !!admins[handle] } });
      }
      return json({ ok: true });
    }
    if (u.pathname === "/app/assets/civicsmith.css") return send(200, "text/css", CSS);
    if (u.pathname === "/") return send(200, "text/html", front);
    if (u.pathname === "/app" || u.pathname.startsWith("/app/")) return send(200, "text/html", app);
    send(404, "text/plain", "not found");
  });
  await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
  return { base: `http://127.0.0.1:${server.address().port}`, seen, codes, close: () => new Promise((ok) => server.close(ok)) };
}
