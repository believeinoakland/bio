/* screens-intake R17–R20 (T48): the common line, the capture tab bar and act row, no empty Set aside, bare archive and
 * open-file, on the real served page. */
/* screens-intake R17–R20 (T48): the common line, the capture tab bar and act row, no empty Set aside, bare archive and
 * open-file, on the real served page. Fix round 10 (K5054): over the REAL store: the held document, the set-aside one, the opened archive, the knock at the
 * doorbell and the capture of the address are the members' and the doorbell's real acts, and the answers the pages draw are the owners' own. A fault (the
 * store silent, a read that has not answered) is the only scripted answer. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { checkClasses } from "../../../src/interface-shell/index.mjs";
import { ASSET_FILES } from "../../../src/interface-assets/index.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";
import { openWorld, members, html, text, main, btn, fill, press, ok, refused, word, says } from "./page.mjs";
import { pending } from "../interface-shell/harness.mjs";
import { makeZip } from "../../make-zip.mjs";

const CAN = ["contribute", "create_projects"];
const ADDRESS = "https://x.example/a";

/* a team of mai (who contributes) and ada (an administrator) with what each screen draws from: a held document, an opened ZIP, a document set aside, a knock;
   the paths of the pages that name them */
async function desk() {
  const t = await members({ mai: CAN });
  t.ada = await t.world.signIn("ada", { admin: true });
  const held = await t.world.recipes.hold(t.mai, "Notice", "The council met on a Tuesday.\n");
  const aside = await t.world.recipes.setAside(t.mai);
  const zip = makeZip([{ name: "01_Agenda.pdf", data: "Part 1 of the agenda packet.\n" }]);
  t.world.script("https://city.example/packet.zip", () => new Response(zip, { status: 200, headers: { "content-type": "application/zip" } }));
  const archive = (await t.mai.act("acquire", { body: { locator: "https://city.example/packet.zip" } })).document.capture.sha256;
  const knocked = await t.world.door({ url: "/api/?op=knock", init: { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ contentText: "A tip about the garage.", note: "n", knockerSecret: "the-secret" }) } });
  const knock = knocked.json.knockId;
  return { ...t, held, aside, archive, knock,
    paths: ["/app/capture/address", "/app/capture/file", "/app/capture/saw", "/app/held", `/app/archive/${archive}`, `/app/open-file/${held.sha}`,
            "/app/inbox", `/app/inbox/${knock}`, "/app/archive", "/app/open-file"] };
}
const at = (t, path, as = t.mai, plane = {}) => openWorld(path, { world: t.world, as, plane });
/* the owner's own answer, with a fault laid over the read the test names: `decide(req)` answers the scripted one, or nothing to let the real read through */
const over = (as, op, decide) => async (req) => { const mine = decide(req); if (mine) return mine; const { op: _op, ...query } = req.query; return ok(await as.read(op, { query })); };
/* every counted phrase these screens draw, at zero */
const ZEROS = [["screen.archive.sum.filed", { count: 0 }], ["screen.archive.sum.held", { count: 0 }], ["screen.archive.sum.notfiled", { count: 0 }],
               ["screen.archive.sum.folders", { count: 0 }], ["screen.archive.facts.entries", { entries: 0 }], ["screen.open-file.status.queued", { count: 0 }],
               ["screen.open-file.status.overdue", { count: 0 }], ["screen.open-file.status.held", { count: 0 }], ["screen.held.archive.filed", { count: 0 }],
               ["screen.held.archive.notfiled", { count: 0 }]];

test("R17 the module's real SCREENS compose under interface-shell R56", () => {
  assert.equal(checkClasses(SCREENS, null, ""), true);
});

test("R17 no cs-form, no bare label with help; every field is cs.field", async () => {
  const t = await desk();
  for (const path of t.paths) for (const as of [t.mai, t.ada]) {
    const p = await at(t, path, as);
    if (path.startsWith("/app/capture/address")) { fill(p, { "ci-address": ADDRESS }); t.world.script(ADDRESS, async () => new Response("<html><head><title>A page</title></head><body><p>x</p></body></html>", { status: 200, headers: { "content-type": "text/html" } })); await press(p, "acquire"); }
    const h = html(p);
    assert.doesNotMatch(h, /class="[^"]*\bcs-form\b/, path);
    assert.doesNotMatch(h, /<label(?![^>]*\bfor=)(?![^>]*>\s*<input)/, `${path}: a bare label`);
    assert.doesNotMatch(h, /<label[^>]*>[^<]*<\/label><span class="help"(?! id=)/, path);
  }
});

test("R17 every screen drawn over what the owners answer at zero shows no empty section and no zero; a failed read is still drawn failed (control)", async () => {
  /* the owners' real answers: the archive's and the file's counts that are zero (nothing held, none overdue, no folders), the held list and the inbox of a team with nothing */
  const t = await desk();
  const empty = await members({ mai: CAN });
  empty.ada = await empty.world.signIn("ada", { admin: true });
  for (const [w, path] of [[t, `/app/archive/${t.archive}`], [t, `/app/open-file/${t.held.sha}`], [empty, "/app/held"], [empty, "/app/inbox"]]) {
    const p = await at(w, path, w.ada);
    for (const [k, vars] of ZEROS) assert.ok(!text(p).includes(word(k, vars)), `${path}: ${k} drawn at zero`);
    assert.doesNotMatch(html(p), /<section[^>]*>\s*<h2>[^<]*<\/h2>\s*<\/section>/, `${path}: an empty section`);
  }
  const e = await at(empty, "/app/held");
  assert.ok(!says(e, "screen.held.setaside"), "an empty held screen draws its one empty state only");
  const f = await at(empty, "/app/held", empty.mai, { heldcaptures: refused("STORE_SILENT", "store silent (test fixture)") });
  assert.ok(main(f).querySelector('[data-state="failed"]'), "a failed read is drawn failed");
});

test("R18 before a capture the address tab has the underlined tab bar, one act row of acquire and capturerequest, and no watching section; after one, Watch and Check join that row", async () => {
  /* R49: `existed` alone files nothing; a new capture is promoted, then the watching acts join the row */
  const t = await members({ mai: CAN });
  t.world.script(ADDRESS, async () => new Response("<html><head><title>A page</title></head><body><p>x</p></body></html>", { status: 200, headers: { "content-type": "text/html" } }));
  const p = await at(t, "/app/capture/address");
  assert.ok(main(p).querySelector(".mk-tabs2"), "the design's tab bar");
  assert.equal(main(p).querySelectorAll('.mk-tabs2 [aria-selected="true"]').length, 1);
  assert.equal(main(p).querySelectorAll(".mk-tabs2 a[data-nav]").length, 3);
  /* R47 added a section of its own (the logins), whose act is not the capture's: the capture's acts are one row */
  const capRows = (q) => main(q).querySelectorAll(".mk-acts").filter((r) => r.querySelector('[data-act="acquire"]'));
  assert.equal(capRows(p).length, 1, "one act row");
  assert.ok(!btn(p, "monitorset") && !btn(p, "monitor"));
  assert.ok(!says(p, "screen.capture.address.watch"));
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  assert.equal(capRows(p).length, 1, "still one act row");
  const row = capRows(p)[0];
  for (const op of ["acquire", "capturerequest", "monitorset", "monitor"]) assert.ok(row.querySelector(`button[data-act="${op}"]`), `${op} in the act row`);
});

test("R19 an empty Set aside is not drawn; one that holds a row is; a failed read is drawn failed; a read that has not answered draws nothing for it", async () => {
  const t = await members({ mai: CAN });
  await t.world.recipes.hold(t.mai, "Notice", "The council met.\n");
  const none = await at(t, "/app/held");
  assert.ok(!says(none, "screen.held.setaside"));
  await t.world.recipes.setAside(t.mai);
  const some = await at(t, "/app/held");
  assert.ok(says(some, "screen.held.setaside"));
  assert.ok(btn(some, "heldrestore"));
  const aside = (req) => req.query.state === "set_aside";
  const bad = await at(t, "/app/held", t.mai, { heldcaptures: over(t.mai, "heldcaptures", (req) => (aside(req) ? refused("STORE_SILENT", "x") : null)) });
  assert.ok(main(bad).querySelector('[data-state="failed"]'));
  const slow = await at(t, "/app/held", t.mai, { heldcaptures: over(t.mai, "heldcaptures", (req) => (aside(req) ? pending : null)) });
  assert.ok(!says(slow, "screen.held.setaside"));
});

test("R19 the held reads ask a bounded page, so the unfiltered read the walk saw stall is no longer asked for 200 rows with their archive listings", async () => {
  const t = await desk();
  const p = await at(t, "/app/held");
  /* the picker page, the set-aside list and the full fields of the rows drawn (C14), each bounded to the page */
  assert.deepEqual(p.byOp("heldcaptures").map((r) => r.query.limit), ['50', '50', '50']);
});

test("R20 archive and open-file opened bare draw the shell's \"Nothing is here\" with the way back, never \"Name an archive\" or \"Name a file\"", async () => {
  const t = await desk();
  for (const path of ["/app/archive", "/app/open-file", "/app/archive/nope", "/app/open-file/nope"]) {
    const p = await at(t, path);
    assert.ok(says(p, "shell.unavailable.nothing.title"), path);
    assert.ok(main(p).querySelector('[data-unavailable="nothing"]'), path);
    assert.ok(main(p).querySelector('a[href="/app"][data-nav]'), `${path}: the way back`);
    assert.equal(p.byOp("archivelist").length + p.byOp("threatof").length, 0, `${path}: nothing read`);
  }
});

/* classes a served stylesheet hides: a rule whose selector ends in the class and whose block holds `display: none` */
const hiddenBy = (cls) => {
  const css = ASSET_FILES["civicsmith.css"].body + ASSET_FILES["shell.css"].body;
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].some(([, sel, block]) => /display\s*:\s*none/.test(block)
    && sel.split(",").some((x) => new RegExp(`\\.${cls}(?![\\w-])[^\\s>+~]*\\s*$`).test(x.trim())));
};

test("R18 each Add tab's body is visible under the served stylesheets: no class on it is one they hide (control: the design's st is hidden)", async () => {
  assert.ok(hiddenBy("st"), "control: the served shell.css hides the design's `st`");
  const t = await members({ mai: CAN });
  for (const tab of ["address", "file", "saw"]) {
    const p = await at(t, `/app/capture/${tab}`);
    const body = main(p).querySelector(`[data-tab="${tab}"]`);
    assert.ok(body, `${tab}: a body is drawn`);
    assert.ok(body.querySelector("input, textarea"), `${tab}: with its fields`);
    for (let e = body; e && e !== main(p); e = e.parentNode)
      for (const c of (e.getAttribute && e.getAttribute("class") || "").split(/\s+/).filter(Boolean))
        assert.ok(!hiddenBy(c), `${tab}: class ${c} is hidden by a served stylesheet`);
  }
});
