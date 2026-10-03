/* R49 (DEC-122 (3)): every page this module serves names no resource on another origin and uses only typefaces on the
   device or bundled with the plane. Read at the interface twice over: the bytes `setupPage` serves, in each of its group
   line's states (R20), and the page's script run in the fixture's sandbox through every section it draws (claim,
   sign-in, enrolment, the panel and profiles, the record browser, a record and its files, intake with a capture, the
   inbox, members and keys), every URL it fetches and every piece of markup it draws read the same way. A link the reader
   follows (`<a href>`) is not a load. The reading runs over pages that break it, so it is seen to fail. */
import test from "node:test";
import assert from "node:assert/strict";
import { setupPage, groupLine, SETUP_HTML } from "../../../src/setup.mjs";
import { pageOver } from "./fixture.mjs";

const ORIGIN = "https://copy.example";
const tick = () => new Promise((r) => setTimeout(r, 0));
const settle = async () => { for (let i = 0; i < 30; i++) await tick(); };

/* A reference that stays on the page's own origin: a fragment, or a URL that resolves to this origin. */
const ownOrigin = (ref) => {
  const v = String(ref).trim().replace(/^["']|["']$/g, "");
  if (v === "" || v.startsWith("#")) return true;
  try { return new URL(v, ORIGIN + "/").origin === ORIGIN; } catch { return false; }
};
/* CSS's generic families: a stack ending in one renders from the device whatever names precede it. */
const GENERIC = new Set(["serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui", "ui-serif", "ui-sans-serif",
  "ui-monospace", "ui-rounded", "math", "emoji", "fangsong", "inherit", "initial", "unset"]);

/** What in one piece of markup loads from another origin or names a typeface it does not carry, as a list (empty when
 *  it holds): a `src`, `srcset` or `href` on any element but a followed link, a style's `@import` or `url()`, a script
 *  naming an absolute or scheme-relative address, an `@font-face` (no typeface is bundled), and a font stack that does
 *  not end in a generic family. */
function outsideLoads(html) {
  const out = [];
  for (const [, tag, attrs] of String(html).matchAll(/<([a-zA-Z][\w-]*)\b([^>]*)>/g))
    for (const [, name, value] of attrs.matchAll(/\b(src|srcset|href)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi)) {
      if (tag.toLowerCase() === "a" && name.toLowerCase() === "href") continue;
      const refs = name.toLowerCase() === "srcset" ? value.replace(/^["']|["']$/g, "").split(",").map((x) => x.trim().split(/\s+/)[0]) : [value];
      for (const ref of refs) if (!ownOrigin(ref)) out.push(`<${tag} ${name}=${value}>`);
    }
  const styles = [...String(html).matchAll(/<style\b[^>]*>([^]*?)<\/style>/gi)].map((m) => m[1])
    .concat([...String(html).matchAll(/\bstyle\s*=\s*("[^"]*"|'[^']*')/gi)].map((m) => m[1]));
  for (const css of styles) {
    for (const [im] of css.matchAll(/@import\b[^;]*/gi)) out.push(im);
    for (const [u, ref] of css.matchAll(/url\(\s*([^)]*)\)/gi)) if (!ownOrigin(ref)) out.push(u);
    if (/@font-face\b/i.test(css)) out.push("@font-face");
    for (const [d, stack] of css.matchAll(/(?:font-family|--[\w-]+)\s*:\s*([^;}]*)/gi)) {
      if (/^--/.test(d) && !/font|body|mono|serif|sans/i.test(d.split(":")[0])) continue;
      const fams = stack.split(",").map((f) => f.trim().replace(/^["']|["']$/g, "").toLowerCase()).filter(Boolean);
      if (!fams.length || /^var\(/.test(fams.at(-1))) continue;
      if (!GENERIC.has(fams.at(-1))) out.push(d.trim());
    }
    for (const [d, v] of css.matchAll(/(?:^|[;{\s])font\s*:\s*([^;}]*)/gi))
      if (!/^(?:inherit|initial|unset)$/i.test(v.trim()) && !GENERIC.has(v.trim().split(",").at(-1).trim().toLowerCase())) out.push(d.trim());
  }
  for (const [, js] of String(html).matchAll(/<script\b[^>]*>([^]*?)<\/script>/gi))
    for (const [lit] of js.replace(/\/\*[^]*?\*\//g, "").matchAll(/(["'`])(?:https?:|wss?:)?\/\/[^"'`\s]*\1?/g))
      if (!ownOrigin(lit.replace(/^["'`]|["'`]$/g, ""))) out.push(`script ${lit}`);
  return out;
}

const hostile = { ok: true, group: "river-town", display_name: '<img src="https://evil.example/x.png">',
                  domain: "evil.example", domain_verified_at: "2026-10-03T00:00:00Z" };
const PAGES = [setupPage(undefined), setupPage({ answered: true, result: { ok: true, group: null } }),
  setupPage({ answered: true, result: { ok: true, group: "river-town" } }), setupPage({ answered: true, result: hostile })];

test("R49 the bytes served at /, in every state of the group line, name no resource on another origin in any src, href, @import, url() or script, and use only typefaces on the device: no @font-face, every font stack ending in a generic family", () => {
  for (const html of PAGES) assert.deepEqual(outsideLoads(html), []);
  /* not vacuous: the page does name resources and typefaces, and the reading sees them */
  assert.match(SETUP_HTML, /href="\/sign"/);
  assert.match(SETUP_HTML, /font-family:Georgia,serif/);
  assert.match(SETUP_HTML, /--body:system-ui,[^;]*,sans-serif;/);
  assert.match(groupLine({ answered: true, result: hostile }), /&lt;img src=&quot;https:\/\/evil/, "a name is text, never markup");
});

test("R49 negative controls: the same reading refuses a remote stylesheet, @import, a remote url(), a remote script, an image, a scheme-relative source, a fetch to another origin, a web font and a stack with no generic family; a followed link to another origin is not a load", () => {
  const inject = (where, what) => SETUP_HTML.replace(where, what + where);
  const BROKEN = {
    stylesheet: inject("</head>", '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter">'),
    preconnect: inject("</head>", '<link rel="preconnect" href="https://fonts.gstatic.com">'),
    import: inject("</style>", "@import url(https://fonts.googleapis.com/css2?family=Inter);"),
    url: inject("</style>", "body{background:url(https://cdn.example/bg.png)}"),
    script: inject("</body>", '<script src="https://cdn.example/x.js"></script>'),
    image: inject("</main>", "<img src='//cdn.example/pixel.gif'>"),
    srcset: inject("</main>", '<img src="/a.png" srcset="/a.png 1x, https://cdn.example/a2.png 2x">'),
    fetch: SETUP_HTML.replace("const $ = ", 'fetch("https://telemetry.example/hit");\nconst $ = '),
    fontface: inject("</style>", "@font-face{font-family:Inter;src:local(Inter)}"),
    stack: SETUP_HTML.replace("font-family:Georgia,serif", "font-family:Inter"),
  };
  for (const [name, html] of Object.entries(BROKEN)) assert.notDeepEqual(outsideLoads(html), [], name);
  assert.deepEqual(outsideLoads(inject("</main>", '<a href="https://elsewhere.example/">a link</a>')), []);
});

/* The page's script, signed in as an administrator who may contribute and publish, every op answered with what draws
   each section fully; `urls` holds every URL it fetched. */
function driven() {
  const urls = [];
  const blob = "a".repeat(64);
  const answers = {
    stats: { ok: true }, bootstrap: { claimed: true, version: "v1" },
    whoami: { result: { capabilities: ["read", "contribute", "create_projects", "publish"], administer: true } },
    profiles: { result: { ok: true, profiles: [{ id: "p-one", name: "Profile One", covers: ["Somewhere"] }], conflicts: [],
                          choices: [{ id: "p-one", name: "Profile One", covers: ["Somewhere"] }] } },
    list: { result: [{ bundle_id: "INFO-2026-0001-a", object_type: "information", current_state: "collected", title: "A",
                       last_updated: "2026-10-01T00:00:00Z" }] },
    image: { result: { "bundle.md": '---\nid: INFO-2026-0001-a\ntitle: "A"\n---\n\n## Summary\n\n![x](https://evil.example/p.png) <img src="https://evil.example/q.png">\n',
                       "captures/doc.pdf": { blobSha: blob, sha256: blob, bytes: 3 },
                       "_history/manifest.json": JSON.stringify({ entries: [{ key: "k1", seq: 1, kind: "create", author: "ada" }] }),
                       "_history/bundle_k1.md": "---\nid: INFO-2026-0001-a\n---\n" } },
    inbox: { result: { inbox: [{ knock_id: "KNOCK-1", status: "new", received: "2026-10-01T00:00:00Z", sha256: blob, bytes: 3,
                                 note: '<img src="https://evil.example/n.png">', contact: "https://evil.example/" }] } },
    memberlist: { result: { members: [{ member_id: "ada", cover: "volunteer-7", status: "active" }] } },
    signerlist: { result: { signers: [{ member_id: "ada", key_b64: "AAAAC3Nz", status: "active", attests: false, attests_why: "member_invited" }] } },
    memberadd: { result: { ok: true, invite: "tok-1" } },
    allocid: { result: { id: "INFO-2026-0002" } },
    acquire: { ok: true, document: { file: "captures/doc.pdf", capture: { sha256: blob, bytes: 3, encoding: "binary" } } },
    attest: { attempts: [] }, promote: { result: { ok: true } },
  };
  const fetch = async (url, init) => {
    urls.push(String(url));
    const op = new URL(url, ORIGIN).searchParams.get("op");
    return { ok: true, status: 200, json: async () => answers[op] ?? { result: { ok: true } } };
  };
  return { ...pageOver({ html: setupPage({ answered: true, result: hostile }), session: { t: "sess-1", e: 0, w: "admin" }, fetch }), urls };
}

const DRAWN = ["#browse-body", "#b-facts", "#b-md", "#b-files", "#b-history", "#b-ratify", "#inbox-body", "#m-list", "#k-list",
  "#m-invite", "#k-read", "#pf-active", "#pf-choices", "#n-risk-choices", "#en-who"];

test("R49 driven through every section the page draws, signed out and signed in: every URL its script fetches is on the page's own origin, and no markup it draws names a resource on another origin", async () => {
  const p = driven();
  await settle();
  await p.ui.openBrowse(); await settle();
  await p.ui.openBundle("INFO-2026-0001-a"); await settle();
  await p.ui.openInbox(); await settle();
  await p.el("#go-members").fire(); await settle();
  p.el("#m-id").value = "bea"; p.el("#m-name").value = "volunteer-2"; await p.el("#m-add").fire(); await settle();
  p.el("#k-key").value = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKGAY bio-ratify"; await p.el("#k-key").fire("input"); await settle();
  p.el("#n-type").value = "information"; p.el("#n-title").value = "Doc"; p.el("#n-body").value = "Body.";
  p.el("#n-loc").value = "https://records.example.org/doc.pdf"; p.el("#n-auth").value = "A records office";
  await p.el("#n-save").fire(); await settle();
  /* signed out: the claim, and an invitation */
  const out = pageOver({ html: SETUP_HTML, hash: "#boot=t", fetch: async (url) => { p.urls.push(String(url));
    return { ok: true, status: 200, json: async () => ({ claimed: false, bootstrapConfigured: true, result: { ok: true, cover: "c", role: "member" } }) }; } });
  await settle();
  out.el("#pw1").value = "twelve-chars-a"; out.el("#pw2").value = "twelve-chars-a";
  await out.el("#do-claim").fire(); await settle();
  out.el("#lpw").value = "twelve-chars-a"; await out.el("#do-login").fire(); await settle();
  const inv = pageOver({ html: SETUP_HTML, hash: "#invite=t", fetch: async (url) => { p.urls.push(String(url));
    return { ok: true, status: 200, json: async () => ({ result: { ok: true, cover: '<img src="https://evil.example/c.png">', role: "member" } }) }; } });
  await settle();
  /* the sections drew, and the page asked what each needs: the reading below is over real output */
  const ops = new Set(p.urls.map((u) => new URL(u, ORIGIN).searchParams.get("op")));
  for (const op of ["bootstrap", "claim", "login", "invitelook", "whoami", "profiles", "list", "image", "inbox", "memberlist", "signerlist",
                    "memberadd", "acquire", "attest", "promote"]) assert.ok(ops.has(op), op);
  for (const s of ["#browse-body", "#b-files", "#inbox-body", "#m-list", "#k-list", "#b-ratify", "#pf-active"])
    assert.notEqual(p.el(s).innerHTML, "", s);
  assert.match(p.el("#b-files").innerHTML, /href="\/api\/\?op=capture/);
  for (const u of p.urls) assert.ok(ownOrigin(u), u);
  for (const page of [p, out, inv]) for (const s of DRAWN) assert.deepEqual(outsideLoads(page.el(s).innerHTML), [], s);
});
