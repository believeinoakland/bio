/* screens-entry R12–R15 (T48-84; the L11 design fold of WALK-084 #2, K3250, K3254): the common line (every class a
   served stylesheet defines, every field the kit's, nothing empty and no zero drawn), `front`'s two columns and its name
   never the slug, the group's name asked first at setup, and the lede following the claimed state. */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { open, has, lacks, said, all, texts, SCREENS, scenes, team, act, worldOf } from "./kit.mjs";
import * as SHELL from "../../../src/interface-shell/index.mjs";

// ---- the served stylesheets (interface-shell R56): its own check over what each screen draws, no stand-in ----
/* `checkClasses` throws for a class in a `class` attribute that civicsmith.css, shell.css and the shell's STYLE do not
   define and `HOOK_CLASSES` does not list; each drawing is handed to it as a screen holding that HTML. */
const served = (who, html) => { SHELL.checkClasses([{ id: who, html }], null, ""); return true; };

/* R13's two rules, read from the design page's `<style>`, which `interface-assets` serves as shell.css (its R7), so no
   module this one does not use is imported. */
const DESIGN = (path) => fs.readFileSync(new URL("../../../../docs/development/ux-substrate/" + path, import.meta.url), "utf8");
/* `shell.css` as interface-assets R7 generates it: the product rules of the design page's `<style>` (every selector
   naming an `mk-` or `cs-` class, none a mock-only or the page's own; a rule under the phone device's frame carried
   inside the 760 px query with that prefix removed). */
function shellCss() {
  const page = DESIGN("screens/page.src.html");
  const src = page.slice(page.indexOf("<style>") + 7, page.indexOf("</style>")).replace(/\/\*[\s\S]*?\*\//g, "");
  const MOCK = /\.(mk-scaler|mk-mockctl|mk-osprompt|anat|asfig|viewer|vlist)\b/;
  const PHONE = /^\.mk-device\[data-device="phone"\]\s+/;
  const out = [];
  const rules = (text, media) => {
    let i = 0;
    while (i < text.length) {
      const open = text.indexOf("{", i);
      if (open < 0) break;
      const head = text.slice(i, open).trim();
      let depth = 1, j = open + 1;
      while (j < text.length && depth) { if (text[j] === "{") depth++; else if (text[j] === "}") depth--; j++; }
      const body = text.slice(open + 1, j - 1);
      if (head.startsWith("@media")) rules(body, head);
      else if (!head.startsWith("@")) {
        const sels = head.split(",").map((x) => x.trim());
        const phone = sels.every((x) => PHONE.test(x));
        const kept = sels.map((x) => x.replace(PHONE, ""));
        if (kept.every((x) => /\.(mk|cs)-/.test(x) && !MOCK.test(x) && !/\.mk-device\b/.test(x))) out.push((phone ? "@media (max-width: 760px) { " : media ? media + " { " : "") + kept.join(", ") + " {" + body + "}" + (phone || media ? " }" : ""));
      }
      i = j;
    }
  };
  rules(src, null);
  return out.join("\n");
}
const SHELL_CSS = shellCss();

// ---- every screen in its states, over the real store: a team with everything set and a team with nothing (kit `scenes`) ----
const drawings = async (full) => { const sc = await scenes(full); return [...sc.pages, ...sc.acted]; };
const classes = (s) => all(s.tree, (e) => e.attrs.class !== undefined).flatMap((e) => e.attrs.class.split(/\s+/).filter(Boolean));

test("R12 every class the six screens draw is one a served stylesheet defines (civicsmith.css, shell.css, the shell's STYLE) or a listed script hook (interface-shell R56)", async () => {
  for (const full of [true, false]) {
    for (const { label, o } of await drawings(full)) assert.ok(served(label, o.drawn()), label);
  }
  // and the real SCREENS compose under R56
  /* interface-shell R1, R2: one external script element loading the shell's versioned script, its integrity the hash of that
     script's source, and no inline script */
  const page = SHELL.interfacePage(SCREENS);
  const scripts = [...page.matchAll(/<script\b[^>]*>/gi)].map((m) => m[0]);
  assert.equal(scripts.length, 1, "one script element");
  assert.match(scripts[0], /^<script src="\/app\/shell-[^"]+\.js" integrity="sha256-[A-Za-z0-9+/=]+">$/);
  assert.ok(page.includes(`integrity="${SHELL.interfaceScriptHash(SCREENS)}"`), "integrity is the hash of the shell's script");
  assert.ok(SHELL.interfaceScript(SCREENS).length > 0);
  // the design's own spellings, never the old cs- ones
  const front = (await drawings(true)).find((d) => d.label === "front").o;
  for (const c of ["mk-fronthead", "mk-frontgrid", "mk-signin", "mk-acts", "mk-small"]) assert.ok(classes(front).includes(c), c);
  for (const { label, o: s } of await drawings(true)) {
    for (const c of ["cs-frontgrid", "cs-signin", "cs-fronthead", "cs-flogo", "cs-note", "cs-sub", "cs-small", "cs-steps", "cs-shown", "cs-form", "cs-actrow", "cs-list", "cs-codes"]) assert.ok(!classes(s).includes(c), `${label}: ${c}`);
  }
  // the recovery codes keep their hook as an attribute
  const codes = (await drawings(true)).filter(({ label }) => /after (claim|enroll)/.test(label)).map(({ o: s }) => all(s.tree, (e) => e.tag === "pre" && "data-codes" in e.attrs).length);
  assert.deepEqual(codes, [1, 1]);
  // control: a class no stylesheet defines is refused, a design class composes
  assert.throws(() => served("control", '<div class="cs-nonesuch"></div>'), /cs-nonesuch/);
  assert.ok(served("control", '<div class="mk-door mk-frontgrid"></div>'));
});

test("R12 every labelled field is drawn with the kit's field: no cs-form, no bare <label> with .help, every text field and select inside a cs-field", async () => {
  for (const { label: id, o: s } of await drawings(true)) {
    assert.equal(all(s.tree, (e) => /\bcs-form\b/.test(e.attrs.class || "")).length, 0, id);
    const inField = (e) => { for (let p = e.parent; p; p = p.parent) if (p.tag === "div" && /\bcs-field\b/.test(p.attrs.class || "")) return true; return false; };
    /* a .help belongs to the kit's field, or to an option of the design's choice (`.cs-choice`: radios with the words and the help of each) */
    const inChoice = (e) => { for (let p = e.parent; p; p = p.parent) if (p.tag === "fieldset" && /\bcs-choice\b/.test(p.attrs.class || "")) return true; return false; };
    for (const h of all(s.tree, (e) => /\bhelp\b/.test(e.attrs.class || ""))) assert.ok(inField(h) || inChoice(h), `${id}: a .help outside the kit's field`);
    for (const l of all(s.tree, (e) => e.tag === "label" && e.attrs.for)) assert.ok(inField(l), `${id}: a bare <label for=${l.attrs.for}>`);
    for (const f of all(s.tree, (e) => e.tag === "select" || e.tag === "textarea" || (e.tag === "input" && !["checkbox", "radio"].includes(e.attrs.type)))) assert.ok(inField(f), `${id}: ${f.attrs.id} drawn outside the kit's field`);
  }
});

test("R12 drawn over an empty team no screen shows an empty section, an empty state or a zero; the last recovery code spent says so without a count", async () => {
  for (const { label: id, o: s } of await drawings(false)) {
    assert.equal(all(s.tree, (e) => e.attrs["data-state"] === "empty").length, 0, `${id}: an empty state drawn`);
    for (const sec of all(s.tree, (e) => e.tag === "section")) assert.ok(texts(sec).length > 1 || all(sec, (e) => e.tag === "input" || e.tag === "button" || e.tag === "a").length, `${id}: an empty section`);
    assert.doesNotMatch(s.text, /(^|[^\w.-])0([^\w.:-]|$)/, `${id}: a zero drawn`);
  }
  const empty = (await drawings(false)).find((d) => d.label === "front").o;
  assert.deepEqual(empty.view.data.published.value, { bundles: [], cases: [] }, "the team has published nothing");
  lacks(empty, "screen.front.published");
  /* the ten recovery codes, spent one by one by the real `recover`: the page spends the last, and says so without a count; the page that
     spends one with codes left counts them */
  const spend = async (kept) => {
    const { world, admin } = await team({ name: null, description: null, logo: false });
    const codes = (await act(world, admin, "recoverycodesissue", { body: {} })).codes;
    for (let i = 0; i < kept; i++) await act(world, null, "recover", { body: { handle: "founder", code: codes[i], password: "a long new password" } });
    const f = await open("forgot", { world });
    await f.press("recover", { values: { "fg-handle": "founder", "fg-code": codes[kept], "fg-pw": "a long password!", "fg-pw2": "a long password!" } });
    return f;
  };
  const f = await spend(9);
  assert.equal(f.requests.at(-1).answer.value.remaining, 0, "the plane's own count");
  has(f, "screen.forgot.done.last");
  assert.doesNotMatch(f.text, /\b0\b/);
  // control: codes left are counted
  const g = await spend(5);
  assert.equal(g.requests.at(-1).answer.value.remaining, 4);
  has(g, "screen.forgot.done", { remaining: "4" });
});

test("R12 control: a read that failed is still drawn state.failed, never left out as empty", async () => {
  const sc = await scenes(false);
  const front = await open("front", { world: sc.world, table: { publishedlist: "none" } });
  assert.equal(all(front.tree, (e) => e.attrs["data-state"] === "failed").length, 1);
  has(front, "screen.front.published");
  const setup = await open("setup", { world: sc.world, as: sc.admin, table: { securitytoolcatalogue: "none" } });
  assert.equal(all(setup.tree, (e) => e.attrs["data-state"] === "failed").length, 1);
});

test("R13 front draws the design's two columns: the head, then the group's page on the left and the sign-in card on the right; one column at the phone width; nothing above the sign-in card but the head, so it lies above the fold at 1280 px", async () => {
  const s = (await drawings(true)).find((d) => d.label === "front").o;
  const top = s.tree.children.filter((c) => c.tag);
  assert.deepEqual(top.slice(0, 2).map((e) => e.attrs.class), ["mk-fronthead", "mk-frontgrid"], "the grid follows the head directly, nothing above the sign-in");
  const cols = top[1].children.filter((c) => c.tag);
  assert.equal(cols.length, 2);
  assert.equal(cols[1].attrs.class, "mk-signin");
  assert.ok(all(cols[1], (e) => e.attrs["data-act"] === "login").length === 1 && all(cols[1], (e) => e.attrs.id === "fs-pw").length === 1, "the sign-in card holds the form");
  assert.ok(all(cols[0], (e) => e.tag === "section").length >= 1, "the group's page on the left");
  // the served rules: two columns at desktop widths, one inside the 760 px query (shell.css, interface-assets R7)
  const flat = SHELL_CSS.replace(/\/\*[\s\S]*?\*\//g, "");
  assert.match(flat, /(^|[}\s])\.mk-frontgrid\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1\.6fr\)\s+minmax\(240px,\s*1fr\)/);
  assert.match(flat, /@media \(max-width: 760px\)\s*\{[^{}]*\.mk-frontgrid\s*\{[^}]*grid-template-columns:\s*1fr/);
});

test("R13 the head: the monogram (or the logo) and the group's name in the serif title, or 'Your group' while none is set; control: an unnamed group shows no slug", async () => {
  const named = (await drawings(true)).find((d) => d.label === "front").o;
  const h1 = all(named.tree, (e) => e.tag === "h1");
  assert.equal(h1.length, 1);
  assert.equal(h1[0].attrs.class, "grp");
  assert.equal(texts(h1[0]).join(""), "River Town");
  assert.deepEqual(all(named.tree, (e) => e.attrs.class === "mk-flogo").map((e) => [e.tag, texts(e).join("")]), [["div", "RT"]]);
  const withLogo = await team({ name: "River Town", description: null, logo: true });
  const logo = await open("front", { world: withLogo.world });
  assert.deepEqual(all(logo.tree, (e) => e.attrs.class === "mk-flogo").map((e) => e.tag), ["img"]);
  /* a team with no name set: the plane answers the short name as the group, and the page never draws it */
  const bare = await team({ name: null, description: null, logo: false });
  const invite = (await act(bare.world, bare.admin, "memberadd", { body: { memberId: "ann", cover: "Ann" } })).invite;
  const link = (await act(bare.world, bare.admin, "joinlinkenable", { body: { capabilities: ["contribute"], dailyCap: 5 } })).link;
  const u = await open("front", { world: bare.world });
  const slug = u.requests.find((r) => r.op === "groupidentity").answer.value.group;
  assert.equal(u.requests.find((r) => r.op === "groupidentity").answer.value.display_name, null);
  assert.ok(slug && !u.drawn().includes(slug), "no slug drawn");
  assert.equal(texts(all(u.tree, (e) => e.tag === "h1")[0]).join(""), said("screen.entry.group"));
  has(u, "screen.entry.uses", { group: said("screen.entry.group") });
  // the join screens name the group the same way
  for (const fragment of [{ invite }, { join: link }]) {
    const j = await open("join", { world: bare.world, fragment });
    assert.ok(!j.drawn().includes(slug), "join: no slug drawn");
  }
});

test("R14 setup's first part after the codes asks the team's name, before any other part, saying where the name shows", async () => {
  const o = (await drawings(false)).find((d) => d.label === "setup after claim").o;
  const parts = all(o.tree, (e) => e.attrs["data-part"]);
  assert.deepEqual(parts.slice(0, 2).map((e) => e.attrs["data-part"]), ["claim", "group"], "the codes, then the team's name");
  assert.ok(all(parts[0], (e) => e.tag === "pre" && "data-codes" in e.attrs).length === 1);
  // the name the first field of its part, with its act, open
  const name = parts[1];
  assert.equal(all(name, (e) => e.tag === "input" && e.attrs.type === "text")[0].attrs.id, "su-name");
  assert.ok(all(name, (e) => e.attrs["data-act"] === "groupnameset").length === 1);
  assert.ok("open" in name.attrs);
  has(o, "screen.setup.name.help");
  // no field of a later part comes before it
  const fields = all(o.tree, (e) => e.tag === "input" && e.attrs.type === "text").map((e) => e.attrs.id);
  assert.equal(fields[0], "su-name");
});

test("R14 control: a skipped name keeps its part open to do (not done, its state optional), and naming the team marks it done", async () => {
  const bare = await team({ name: null, description: null, logo: false });
  const o = await open("setup", { world: bare.world, as: bare.admin });
  const group = (s) => all(s.tree, (e) => e.attrs["data-part"] === "group")[0];
  o.fields["su-skip-group"] = true; await o.tick(300);
  // another part done meanwhile leaves it as it is (a place the plane does not know: the team names the one it wants)
  o.fields["su-pick"] = "other"; await o.tick(300);
  await o.press("placewanted", { values: { "su-place": "Somewhere" } });
  assert.equal(group(o).attrs["data-state"], "optional", "the name is not done");
  assert.equal(group(o).attrs["data-skipped"], "true");
  const sc = await scenes(true);
  const n = await open("setup", { world: sc.world, as: sc.admin });
  assert.equal(group(n).attrs["data-state"], "done");
  assert.ok(!("open" in group(n).attrs), "a done name is not opened");
});

test("R15 R20 a claimed instance's setup draws no lede, only its own 'Already claimed' box (state c); nor once claimed here or signed in", async () => {
  const lede = (s) => s.text.includes(said("screen.setup.lede"));
  const sc = await scenes(true);
  const taken = await open("setup", { fragment: { boot: "otp" }, world: sc.world });
  assert.ok(!lede(taken));
  has(taken, "setup.claimed.heading");
  assert.ok(!lede(await open("setup", { world: sc.world, as: sc.admin })), "signed in");
  const unclaimed = await worldOf({ claimed: false });
  // claimed here, the sign-in not served (unanswered: the harness's fault)
  const after = await open("setup", { fragment: { boot: "otp" }, world: unclaimed, table: { login: "none" } });
  await after.press("claim", { values: { "su-handle": "rivera", "su-pw": "a long password!", "su-pw2": "a long password!" } });
  has(after, "screen.setup.claimed.nosignin", { handle: "rivera" });
  assert.ok(!lede(after), "claimed here, not signed in");
  for (const answer of ["pending", "none"]) assert.ok(!lede(await open("setup", { world: unclaimed, table: { bootstrap: answer } })), "unknown: " + answer);
  // control: an unclaimed instance draws it
  assert.ok(lede(await open("setup", { fragment: { boot: "otp" }, world: await worldOf({ claimed: false }) })));
});
