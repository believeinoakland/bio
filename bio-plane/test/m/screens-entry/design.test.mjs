/* screens-entry R12–R15 (T48-84; the L11 design fold of WALK-084 #2, K3250, K3254): the common line (every class a
   served stylesheet defines, every field the kit's, nothing empty and no zero drawn), `front`'s two columns and its name
   never the slug, the group's name asked first at setup, and the lede following the claimed state. */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { open, has, lacks, said, all, texts, FOUNDER, SCREENS } from "./kit.mjs";
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

// ---- every screen in its states, over a full plane and over an empty one ----
const CODES = ["AAAA-1111", "BBBB-2222"];
const FULL = {
  groupidentity: { ok: true, result: { ok: true, group: "river-town", display_name: "River Town", logo: false, domain: "rt.example", domain_verified_at: "2026-10-01" } },
  groupdescription: { ok: true, result: { description: { focus: "Leases", purpose: "Checking terms." } } },
  publishedlist: { ok: true, result: { bundles: [{ bundle_id: "F-1", title: "A finding", attestor_member: "dev" }], cases: [{ case_id: "C-1", edition: 1, findings: ["F-1"], signed_at: "2026-10-01" }] } },
  passwordresetlook: { ok: true, result: { ok: true, handle: "mai", until: "2026-10-21" } },
  bootstrap: { ok: true, result: { ok: true, claimed: false, bootstrapConfigured: true, part_scanner: true } },
  login: { ok: true, result: { ok: true, token: "tok-1" } },
  recoverycodesissue: { ok: true, result: { ok: true, codes: CODES } },
  profiles: { ok: true, result: { ok: true, profiles: [{ id: "p-a", name: "Profile A" }], choices: [{ id: "p-b", name: "Profile B" }] } },
  placewantedstate: { ok: true, result: { name: "A place" } },
  aikeepawaystate: { ok: true, result: { on: true, reason: "Tips" } },
  groupkeystate: { ok: true, result: { on: true, held: true } },
  courtnotice: { ok: true, result: { choice: "tell" } },
  hostingaccess: { ok: true, result: { current: { holders: "Someone" } } },
  securitytoolcatalogue: { ok: true, result: { offered: [{ provider_id: "s", name: "Scan Co", config: [{ name: "region", label: "Region" }], credentials: ["api_key"] }] } },
  securitytools: { ok: true, result: { tools: [{ name: "Scan Co" }] } },
  invitelook: { ok: true, result: { ok: true, cover: "Mai" } },
  grouplanguages: { ok: true, result: { languages: ["en", "es"] } },
  handlecheck: { ok: true, result: { ok: true, state: "free", handle: "mai" } },
};
const EMPTY = {
  groupidentity: { ok: true, result: { ok: true, group: "river-town", display_name: null } },
  groupdescription: { ok: true, result: { description: null } },
  publishedlist: { ok: true, result: { bundles: [], cases: [] } },
  bootstrap: { ok: true, result: { ok: true, claimed: false, bootstrapConfigured: true } },
  profiles: { ok: true, result: { ok: true, profiles: [], choices: [] } },
  placewantedstate: { ok: true, result: { name: null } },
  aikeepawaystate: { ok: true, result: { on: false } },
  groupkeystate: { ok: true, result: { on: false, held: false } },
  courtnotice: { ok: true, result: { choice: null } },
  hostingaccess: { ok: true, result: { current: null } },
  securitytoolcatalogue: { ok: true, result: null },
  securitytools: { ok: true, result: { tools: [] } },
  grouplanguages: { ok: true, result: { languages: [] } },
  invitelook: { ok: true, result: { ok: true } },
};
const STATES = [
  ["front", {}], ["front", { session: { state: "signedout", handle: "mai" } }], ["front", { session: { state: "locked", handle: "mai" } }],
  ...[1, 2, 3, 4, 5, 6].map((n) => ["tour", { subject: String(n) }]),
  ["forgot", {}], ["reset", { fragment: { reset: "rl" } }], ["reset", {}],
  ["setup", { fragment: { boot: "otp" } }], ["setup", { me: FOUNDER }],
  ["join", { fragment: { invite: "inv" } }], ["join", { fragment: { join: "jl" } }], ["join", {}],
];
// the states only an act reaches: the codes shown, a part done, a password set
const ACTED = [
  ["setup", { fragment: { boot: "otp" } }, "claim", { "su-pw": "a long password!", "su-pw2": "a long password!" }],
  ["setup", { me: FOUNDER, table: { memberadd: { ok: true, result: { ok: true, invite: "i", expires: "2026-10-21" } } } }, "memberadd", { "su-adm-id": "dev", "su-adm-cover": "Dev" }],
  ["forgot", { table: { recover: { ok: true, result: { ok: true, remaining: 3 } } } }, "recover", { "fg-handle": "mai", "fg-code": "C", "fg-pw": "a long password!", "fg-pw2": "a long password!" }],
  ["join", { fragment: { invite: "inv" }, table: { enroll: { ok: true, result: { ok: true, memberId: "mai" } } } }, "enroll", { "jn-handle": "mai", "jn-pw": "a long password!", "jn-pw2": "a long password!" }],
];
async function drawings(table) {
  const out = [];
  for (const [id, o] of STATES) out.push([id, await open(id, { table, ...o })]);
  for (const [id, o, op, values] of ACTED) {
    const s = await open(id, { ...o, table: { ...table, ...(o.table || {}) } });
    await s.press(op, { values });
    out.push([id + " after " + op, s]);
  }
  return out;
}
const classes = (s) => all(s.tree, (e) => e.attrs.class !== undefined).flatMap((e) => e.attrs.class.split(/\s+/).filter(Boolean));

test("R12 every class the six screens draw is one a served stylesheet defines (civicsmith.css, shell.css, the shell's STYLE) or a listed script hook (interface-shell R56)", async () => {
  for (const table of [FULL, EMPTY]) {
    for (const [id, s] of await drawings(table)) assert.ok(served(id, s.drawn()), id);
  }
  // and the real SCREENS compose under R56
  assert.match(SHELL.interfacePage(SCREENS), /<script nonce=/);
  // the design's own spellings, never the old cs- ones
  const front = await open("front", { table: FULL });
  for (const c of ["mk-fronthead", "mk-frontgrid", "mk-signin", "mk-acts", "mk-small"]) assert.ok(classes(front).includes(c), c);
  for (const [id, s] of await drawings(FULL)) {
    for (const c of ["cs-frontgrid", "cs-signin", "cs-fronthead", "cs-flogo", "cs-note", "cs-sub", "cs-small", "cs-steps", "cs-shown", "cs-form", "cs-actrow", "cs-list", "cs-codes"]) assert.ok(!classes(s).includes(c), `${id}: ${c}`);
  }
  // the recovery codes keep their hook as an attribute
  const codes = (await drawings(FULL)).filter(([id]) => /after (claim|enroll)/.test(id)).map(([, s]) => all(s.tree, (e) => e.tag === "pre" && "data-codes" in e.attrs).length);
  assert.deepEqual(codes, [1, 1]);
  // control: a class no stylesheet defines is refused, a design class composes
  assert.throws(() => served("control", '<div class="cs-nonesuch"></div>'), /cs-nonesuch/);
  assert.ok(served("control", '<div class="mk-door mk-frontgrid"></div>'));
});

test("R12 every labelled field is drawn with the kit's field: no cs-form, no bare <label> with .help, every text field and select inside a cs-field", async () => {
  for (const [id, s] of await drawings(FULL)) {
    assert.equal(all(s.tree, (e) => /\bcs-form\b/.test(e.attrs.class || "")).length, 0, id);
    const inField = (e) => { for (let p = e.parent; p; p = p.parent) if (p.tag === "div" && /\bcs-field\b/.test(p.attrs.class || "")) return true; return false; };
    for (const h of all(s.tree, (e) => /\bhelp\b/.test(e.attrs.class || ""))) assert.ok(inField(h), `${id}: a .help outside the kit's field`);
    for (const l of all(s.tree, (e) => e.tag === "label" && e.attrs.for)) assert.ok(inField(l), `${id}: a bare <label for=${l.attrs.for}>`);
    for (const f of all(s.tree, (e) => e.tag === "select" || e.tag === "textarea" || (e.tag === "input" && !["checkbox", "radio"].includes(e.attrs.type)))) assert.ok(inField(f), `${id}: ${f.attrs.id} drawn outside the kit's field`);
  }
});

test("R12 drawn over an empty fixture no screen shows an empty section, an empty state or a zero; the last recovery code spent says so without a count", async () => {
  for (const [id, s] of await drawings(EMPTY)) {
    assert.equal(all(s.tree, (e) => e.attrs["data-state"] === "empty").length, 0, `${id}: an empty state drawn`);
    for (const sec of all(s.tree, (e) => e.tag === "section")) assert.ok(texts(sec).length > 1 || all(sec, (e) => e.tag === "input" || e.tag === "button" || e.tag === "a").length, `${id}: an empty section`);
    assert.doesNotMatch(s.text, /(^|[^\w.-])0([^\w.:-]|$)/, `${id}: a zero drawn`);
  }
  lacks(await open("front", { table: EMPTY }), "screen.front.published");
  const f = await open("forgot", { table: { recover: { ok: true, result: { ok: true, remaining: 0 } } } });
  await f.press("recover", { values: { "fg-handle": "mai", "fg-code": "C", "fg-pw": "a long password!", "fg-pw2": "a long password!" } });
  has(f, "screen.forgot.done.last");
  assert.doesNotMatch(f.text, /\b0\b/);
  // control: codes left are counted
  const g = await open("forgot", { table: { recover: { ok: true, result: { ok: true, remaining: 4 } } } });
  await g.press("recover", { values: { "fg-handle": "mai", "fg-code": "C", "fg-pw": "a long password!", "fg-pw2": "a long password!" } });
  has(g, "screen.forgot.done", { remaining: "4" });
});

test("R12 control: a read that failed is still drawn state.failed, never left out as empty", async () => {
  const front = await open("front", { table: { ...EMPTY, publishedlist: { ok: false, code: "DOOR_RATE_LIMITED" } } });
  assert.equal(all(front.tree, (e) => e.attrs["data-state"] === "failed").length, 1);
  has(front, "screen.front.published");
  const setup = await open("setup", { me: FOUNDER, table: { ...EMPTY, securitytoolcatalogue: "none" } });
  assert.equal(all(setup.tree, (e) => e.attrs["data-state"] === "failed").length, 1);
});

test("R13 front draws the design's two columns: the head, then the group's page on the left and the sign-in card on the right; one column at the phone width; nothing above the sign-in card but the head, so it lies above the fold at 1280 px", async () => {
  const s = await open("front", { table: FULL });
  const top = s.tree.children.filter((c) => c.tag);
  assert.deepEqual(top.slice(0, 2).map((e) => e.attrs.class), ["mk-fronthead", "mk-frontgrid"], "the grid follows the head directly, nothing above the sign-in");
  const cols = top[1].children.filter((c) => c.tag);
  assert.equal(cols.length, 2);
  assert.equal(cols[1].attrs.class, "mk-signin");
  assert.ok(all(cols[1], (e) => e.attrs["data-act"] === "login").length === 1 && all(cols[1], (e) => e.attrs.id === "fs-pw").length === 1, "the sign-in card holds the form");
  assert.ok(all(cols[0], (e) => e.tag === "section").length >= 2, "the group's page on the left");
  // the served rules: two columns at desktop widths, one inside the 760 px query (shell.css, interface-assets R7)
  const flat = SHELL_CSS.replace(/\/\*[\s\S]*?\*\//g, "");
  assert.match(flat, /(^|[}\s])\.mk-frontgrid\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1\.6fr\)\s+minmax\(240px,\s*1fr\)/);
  assert.match(flat, /@media \(max-width: 760px\)\s*\{[^{}]*\.mk-frontgrid\s*\{[^}]*grid-template-columns:\s*1fr/);
});

test("R13 the head: the monogram (or the logo) and the group's name in the serif title, or 'Your group' while none is set; control: an unnamed group shows no slug", async () => {
  const named = await open("front", { table: FULL });
  const h1 = all(named.tree, (e) => e.tag === "h1");
  assert.equal(h1.length, 1);
  assert.equal(h1[0].attrs.class, "grp");
  assert.equal(texts(h1[0]).join(""), "River Town");
  assert.deepEqual(all(named.tree, (e) => e.attrs.class === "mk-flogo").map((e) => [e.tag, texts(e).join("")]), [["div", "RT"]]);
  const logo = await open("front", { table: { ...FULL, groupidentity: { ok: true, result: { group: "river-town", display_name: "River Town", logo: true } } } });
  assert.deepEqual(all(logo.tree, (e) => e.attrs.class === "mk-flogo").map((e) => e.tag), ["img"]);
  for (const display_name of [null, "", "  "]) {
    const u = await open("front", { table: { ...EMPTY, groupidentity: { ok: true, result: { group: "river-town", display_name } } } });
    assert.ok(!u.drawn().includes("river-town"), "no slug drawn");
    assert.equal(texts(all(u.tree, (e) => e.tag === "h1")[0]).join(""), said("screen.entry.group"));
    has(u, "screen.entry.uses", { group: said("screen.entry.group") });
    // the join screens name the group the same way
    for (const fragment of [{ invite: "inv" }, { join: "jl" }]) {
      const j = await open("join", { table: { ...FULL, groupidentity: { ok: true, result: { group: "river-town", display_name } } }, fragment });
      assert.ok(!j.drawn().includes("river-town"), "join: no slug drawn");
    }
  }
});

test("R14 setup's first part after the codes asks the group's name, before any other part, saying where the name shows", async () => {
  const o = await open("setup", { fragment: { boot: "otp" }, table: { ...EMPTY, login: FULL.login, recoverycodesissue: FULL.recoverycodesissue } });
  await o.press("claim", { values: { "su-pw": "a long password!", "su-pw2": "a long password!" } });
  const heads = all(o.tree, (e) => e.tag === "section").map((sec) => texts(all(sec, (e) => e.tag === "h2")[0]).join(""));
  assert.deepEqual(heads.slice(0, 2), [said("screen.entry.codes.heading"), said("screen.setup.name")]);
  const name = all(o.tree, (e) => e.tag === "section")[1];
  assert.ok(all(name, (e) => e.attrs.id === "su-name").length === 1 && all(name, (e) => e.attrs["data-act"] === "groupnameset").length === 1);
  has(o, "screen.setup.name.help");
  const current = all(o.tree, (e) => e.tag === "li" && e.attrs["aria-current"] === "step");
  assert.deepEqual(current.map((e) => texts(e)[0]), [said("screen.setup.step.name")]);
});

test("R14 control: a skipped name keeps its step open, and naming the group closes it", async () => {
  const table = { ...EMPTY, placewanted: { ok: true, result: { ok: true } } };
  const o = await open("setup", { me: FOUNDER, table });
  await o.press("placewanted", { values: { "su-place": "Somewhere" } });
  const step = (s) => all(s.tree, (e) => e.tag === "li" && texts(e)[0] === said("screen.setup.step.name"))[0];
  assert.equal(step(o).attrs.class, undefined, "Name is not done");
  assert.equal(step(o).attrs["aria-current"], "step");
  assert.ok(!o.drawn().includes("river-town"));
  const n = await open("setup", { me: FOUNDER, table: { ...table, groupidentity: { ok: true, result: { group: "river-town", display_name: "River Town" } } } });
  assert.equal(step(n).attrs.class, "done");
  assert.equal(step(n).attrs["aria-current"], undefined);
});

test("R15 a claimed instance's setup draws no lede, only its own 'already been claimed' box; nor once claimed here or signed in", async () => {
  const lede = (s) => s.text.includes(said("screen.setup.lede"));
  const taken = await open("setup", { table: { bootstrap: { ok: true, result: { ok: true, claimed: true } } } });
  assert.ok(!lede(taken));
  has(taken, "screen.setup.taken");
  assert.ok(!lede(await open("setup", { me: FOUNDER, table: FULL })), "signed in");
  const after = await open("setup", { fragment: { boot: "otp" }, table: { ...FULL, login: { ok: false, code: "SIGN_IN_REFUSED" } } });
  await after.press("claim", { values: { "su-pw": "a long password!", "su-pw2": "a long password!" } });
  has(after, "screen.setup.claimed.nosignin");
  assert.ok(!lede(after), "claimed here, not signed in");
  for (const answer of ["pending", "none"]) assert.ok(!lede(await open("setup", { table: { bootstrap: answer } })), "unknown: " + answer);
  // control: an unclaimed instance draws it
  assert.ok(lede(await open("setup", { fragment: { boot: "otp" }, table: FULL })));
});
