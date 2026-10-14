/* screens-intake R17–R20 (T48): the common line, the capture tab bar and act row, no empty Set aside, bare archive and
 * open-file, on the real served page. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { open, html, text, main, btn, fill, press, ok, refused } from "./page.mjs";
import { pending } from "../interface-shell/harness.mjs";

const SHA = "a".repeat(64);
const ROOT = new URL("../../../../", import.meta.url);
/* the served stylesheets: civicsmith.css, shell.css (the design page's product rules, interface-assets R7) and the shell's own STYLE */
const SERVED = ["docs/development/ux-substrate/visual-language/civicsmith.css", "docs/development/ux-substrate/screens/page.src.html",
                "bio-plane/src/interface-shell/browser.mjs", "bio-plane/src/interface-shell/index.mjs"]
  .map((f) => readFileSync(new URL(f, ROOT), "utf8")).join("\n");
const defined = (c) => new RegExp(`\\.${c.replace(/[-]/g, "\\-")}(?![\\w-])`).test(SERVED);
const classesOf = (h) => [...new Set([...h.matchAll(/\sclass="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/).filter(Boolean)))];
/* classes a script reads, never styles (interface-shell's HOOK_CLASSES), and the kit's own */
const HOOKS = new Set(["rec", "t-title"]);
/* drawn by the shell's own kit (`cs.rows`), renamed to the design's spelling by interface-shell's job (R17's list), not this module's */
const KIT = new Set(["cs-pickc"]);

const FULL = {
  heldcaptures: (req) => ok({ ok: true, held: [{ bundle_id: "INFO-1", title: "T", project: "P", age_days: 1, eligible: true, capture: { sha256: SHA, grade: { grade: "B", determined: true } },
    ...(req.query.state === "set_aside" ? { set_aside: { reason: "r", author: "mai", at: "2026-10-13T10:00:00Z" } } : {}),
    archive: { sha256: SHA, entries: 2, filed: 2, not_filed: 0 }, files: [{ document: "INFO-2", sha256: SHA, index: 1, name: "a.pdf", grade: "B", eligible: true }] }] }),
  threatof: ok({ ok: true, threat: "high", reasons: [], scan_hold: { names: ["N"] } }), originalstate: ok({ may_open: true, path: "warned" }),
  verdictnotes: ok({ ok: true, notes: [{ tool: "t", engine: "e", result: "clean" }] }), scanfindings: ok({ ok: true, findings: [] }),
  inbox: ok({ inbox: [{ knock_id: "K-1", bytes: 10, received: "2026-10-03T00:00:00Z", status: "new", note: "n", pseudonym: "p" }] }),
  inboxget: ok({ ok: true, item: { knock_id: "K-1", bytes: 10, status: "new", note: "n", capture_sha: SHA } }),
  sourceof: ok({ ok: true, sourceId: "SRC-1" }), sourcerung: ok({ ok: true, rung: "same_knocker" }),
  archivelist: ok({ ok: true, archive: { sha256: SHA, grade: { grade: "B", determined: true }, bytes: 10, entries: 1, opened: true, refused: null },
    summary: { filed: 1 }, entries: [{ index: 1, name: "a.pdf", state: "filed", sha256: SHA, bundle: "INFO-2" }] }),
  gradenote: ok({ ok: true, note: "A note." }),
  acquire: ok({ ok: true, existed: true, document: { capture: { sha256: SHA } }, bundleId: "INFO-9" }),
};
const EMPTY = { heldcaptures: ok({ ok: true, held: [] }), verdictnotes: ok({ ok: true, notes: [] }), inbox: ok({ inbox: [] }),
  archivelist: ok({ ok: true, archive: {}, summary: {}, entries: [] }), scanstatus: ok({ queued: 0, overdue: 0, held: 0 }) };
const PATHS = ["/app/capture/address", "/app/capture/file", "/app/capture/saw", "/app/held", `/app/archive/${SHA}`, `/app/open-file/${SHA}`,
               "/app/inbox", "/app/inbox/K-1", "/app/archive", "/app/open-file"];

test("R17 every class these screens draw is one a served stylesheet defines; no cs-form, no bare label with help; every field is cs.field", async () => {
  for (const path of PATHS) for (const me of [undefined, { administer: true }]) {
    const p = await open(path, { plane: FULL, reachable: true, ...(me ? { me: { ...(await import("./page.mjs")).MEMBER, ...me } } : {}) });
    if (path.startsWith("/app/capture/address")) { fill(p, { "ci-address": "https://x.example/a" }); await press(p, "acquire"); }
    const h = html(p);
    for (const c of classesOf(h)) assert.ok(HOOKS.has(c) || KIT.has(c) || defined(c), `${path}: class ${c} is defined by no served stylesheet`);
    assert.doesNotMatch(h, /class="[^"]*\bcs-form\b/, path);
    assert.doesNotMatch(h, /<label(?![^>]*\bfor=)(?![^>]*>\s*<input)/, `${path}: a bare label`);
    assert.doesNotMatch(h, /<label[^>]*>[^<]*<\/label><span class="help"(?! id=)/, path);
  }
});

test("R17 every screen drawn over an empty fixture shows no empty section and no zero; a failed read is still drawn failed (control)", async () => {
  for (const path of ["/app/held", `/app/archive/${SHA}`, `/app/open-file/${SHA}`, "/app/inbox"]) {
    const p = await open(path, { plane: { ...FULL, ...EMPTY }, me: { ...(await import("./page.mjs")).MEMBER, administer: true } });
    assert.doesNotMatch(text(p), /(^|[^\d.])0 (files|overdue|held|not filed|folders|entries)/, `${path}: a count at zero`);
    assert.doesNotMatch(html(p), /<section[^>]*>\s*<h2>[^<]*<\/h2>\s*<\/section>/, `${path}: an empty section`);
  }
  const e = await open("/app/held", { plane: { ...FULL, ...EMPTY } });
  assert.doesNotMatch(text(e), /Set aside/, "an empty held screen draws its one empty state only");
  const f = await open("/app/held", { plane: { heldcaptures: refused("STORE_SILENT", "The record did not answer.") } });
  assert.ok(main(f).querySelector('[data-state="failed"]'), "a failed read is drawn failed");
});

test("R18 before a capture the address tab has the underlined tab bar, one act row of acquire and capturerequest, and no watching section; after one, Watch and Check join that row", async () => {
  const p = await open("/app/capture/address", { plane: FULL });
  assert.ok(main(p).querySelector(".mk-tabs2"), "the design's tab bar");
  assert.equal(main(p).querySelectorAll('.mk-tabs2 [aria-selected="true"]').length, 1);
  assert.equal(main(p).querySelectorAll(".mk-tabs2 a[data-nav]").length, 3);
  assert.equal(main(p).querySelectorAll(".mk-acts").length, 1, "one act row");
  assert.ok(!btn(p, "monitorset") && !btn(p, "monitor"));
  assert.doesNotMatch(text(p), /Watching it for changes/);
  fill(p, { "ci-address": "https://x.example/a" });
  await press(p, "acquire");
  assert.equal(main(p).querySelectorAll(".mk-acts").length, 1, "still one act row");
  const row = main(p).querySelector(".mk-acts");
  for (const op of ["acquire", "capturerequest", "monitorset", "monitor"]) assert.ok(row.querySelector(`button[data-act="${op}"]`), `${op} in the act row`);
});

test("R19 an empty Set aside is not drawn; one that holds a row is; a failed read is drawn failed; a read that has not answered draws nothing for it", async () => {
  const held = FULL.heldcaptures;
  const none = await open("/app/held", { plane: { heldcaptures: (req) => (req.query.state === "set_aside" ? ok({ ok: true, held: [] }) : held(req)) } });
  assert.doesNotMatch(text(none), /Set aside/);
  const some = await open("/app/held", { plane: { heldcaptures: held } });
  assert.match(text(some), /Set aside/);
  assert.ok(btn(some, "heldrestore"));
  const bad = await open("/app/held", { plane: { heldcaptures: (req) => (req.query.state === "set_aside" ? refused("STORE_SILENT", "x") : held(req)) } });
  assert.ok(main(bad).querySelector('[data-state="failed"]'));
  const slow = await open("/app/held", { plane: { heldcaptures: (req) => (req.query.state === "set_aside" ? pending : held(req)) } });
  assert.doesNotMatch(text(slow), /Set aside/);
});

test("R19 the held reads ask a bounded page, so the unfiltered read the walk saw stall is no longer asked for 200 rows with their archive listings", async () => {
  const p = await open("/app/held", { plane: FULL });
  assert.deepEqual(p.byOp("heldcaptures").map((r) => r.query.limit), ['50', '50']);
});

test("R20 archive and open-file opened bare draw the shell's \"Nothing is here\" with the way back, never \"Name an archive\" or \"Name a file\"", async () => {
  for (const path of ["/app/archive", "/app/open-file", "/app/archive/nope", "/app/open-file/nope"]) {
    const p = await open(path, { plane: FULL });
    assert.match(text(p), /Nothing is here/, path);
    assert.doesNotMatch(text(p), /Name an archive|Name a file/, path);
    assert.ok(main(p).querySelector('a[href="/app"][data-nav]'), `${path}: the way back`);
    assert.equal(p.byOp("archivelist").length + p.byOp("threatof").length, 0, `${path}: nothing read`);
  }
});
