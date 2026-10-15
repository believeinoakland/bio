/* screens-intake R17–R20 (T48): the common line, the capture tab bar and act row, no empty Set aside, bare archive and
 * open-file, on the real served page. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { checkClasses } from "../../../src/interface-shell/index.mjs";
import { ASSET_FILES } from "../../../src/interface-assets/index.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";
import { open, html, text, main, btn, fill, press, ok, refused, word, says } from "./page.mjs";
import { pending } from "../interface-shell/harness.mjs";

const SHA = "a".repeat(64);

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
/* every counted phrase these screens draw, at zero */
const ZEROS = [["screen.archive.sum.filed", { count: 0 }], ["screen.archive.sum.held", { count: 0 }], ["screen.archive.sum.notfiled", { count: 0 }],
               ["screen.archive.sum.folders", { count: 0 }], ["screen.archive.facts.entries", { entries: 0 }], ["screen.open-file.status.queued", { count: 0 }],
               ["screen.open-file.status.overdue", { count: 0 }], ["screen.open-file.status.held", { count: 0 }], ["screen.held.archive.filed", { count: 0 }],
               ["screen.held.archive.notfiled", { count: 0 }]];
const PATHS = ["/app/capture/address", "/app/capture/file", "/app/capture/saw", "/app/held", `/app/archive/${SHA}`, `/app/open-file/${SHA}`,
               "/app/inbox", "/app/inbox/K-1", "/app/archive", "/app/open-file"];

test("R17 the module's real SCREENS compose under interface-shell R56", () => {
  assert.equal(checkClasses(SCREENS, null, ""), true);
});

test("R17 no cs-form, no bare label with help; every field is cs.field", async () => {
  for (const path of PATHS) for (const me of [undefined, { administer: true }]) {
    const p = await open(path, { plane: FULL, reachable: true, ...(me ? { me: { ...(await import("./page.mjs")).MEMBER, ...me } } : {}) });
    if (path.startsWith("/app/capture/address")) { fill(p, { "ci-address": "https://x.example/a" }); await press(p, "acquire"); }
    const h = html(p);
    assert.doesNotMatch(h, /class="[^"]*\bcs-form\b/, path);
    assert.doesNotMatch(h, /<label(?![^>]*\bfor=)(?![^>]*>\s*<input)/, `${path}: a bare label`);
    assert.doesNotMatch(h, /<label[^>]*>[^<]*<\/label><span class="help"(?! id=)/, path);
  }
});

test("R17 every screen drawn over an empty fixture shows no empty section and no zero; a failed read is still drawn failed (control)", async () => {
  for (const path of ["/app/held", `/app/archive/${SHA}`, `/app/open-file/${SHA}`, "/app/inbox"]) {
    const p = await open(path, { plane: { ...FULL, ...EMPTY }, me: { ...(await import("./page.mjs")).MEMBER, administer: true } });
    for (const [k, vars] of ZEROS) assert.ok(!text(p).includes(word(k, vars)), `${path}: ${k} drawn at zero`);
    assert.doesNotMatch(html(p), /<section[^>]*>\s*<h2>[^<]*<\/h2>\s*<\/section>/, `${path}: an empty section`);
  }
  const e = await open("/app/held", { plane: { ...FULL, ...EMPTY } });
  assert.ok(!says(e, "screen.held.setaside"), "an empty held screen draws its one empty state only");
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
  assert.ok(!says(p, "screen.capture.address.watch"));
  fill(p, { "ci-address": "https://x.example/a" });
  await press(p, "acquire");
  assert.equal(main(p).querySelectorAll(".mk-acts").length, 1, "still one act row");
  const row = main(p).querySelector(".mk-acts");
  for (const op of ["acquire", "capturerequest", "monitorset", "monitor"]) assert.ok(row.querySelector(`button[data-act="${op}"]`), `${op} in the act row`);
});

test("R19 an empty Set aside is not drawn; one that holds a row is; a failed read is drawn failed; a read that has not answered draws nothing for it", async () => {
  const held = FULL.heldcaptures;
  const none = await open("/app/held", { plane: { heldcaptures: (req) => (req.query.state === "set_aside" ? ok({ ok: true, held: [] }) : held(req)) } });
  assert.ok(!says(none, "screen.held.setaside"));
  const some = await open("/app/held", { plane: { heldcaptures: held } });
  assert.ok(says(some, "screen.held.setaside"));
  assert.ok(btn(some, "heldrestore"));
  const bad = await open("/app/held", { plane: { heldcaptures: (req) => (req.query.state === "set_aside" ? refused("STORE_SILENT", "x") : held(req)) } });
  assert.ok(main(bad).querySelector('[data-state="failed"]'));
  const slow = await open("/app/held", { plane: { heldcaptures: (req) => (req.query.state === "set_aside" ? pending : held(req)) } });
  assert.ok(!says(slow, "screen.held.setaside"));
});

test("R19 the held reads ask a bounded page, so the unfiltered read the walk saw stall is no longer asked for 200 rows with their archive listings", async () => {
  const p = await open("/app/held", { plane: FULL });
  assert.deepEqual(p.byOp("heldcaptures").map((r) => r.query.limit), ['50', '50']);
});

test("R20 archive and open-file opened bare draw the shell's \"Nothing is here\" with the way back, never \"Name an archive\" or \"Name a file\"", async () => {
  for (const path of ["/app/archive", "/app/open-file", "/app/archive/nope", "/app/open-file/nope"]) {
    const p = await open(path, { plane: FULL });
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
  for (const tab of ["address", "file", "saw"]) {
    const p = await open(`/app/capture/${tab}`, { plane: FULL, reachable: true });
    const body = main(p).querySelector(`[data-tab="${tab}"]`);
    assert.ok(body, `${tab}: a body is drawn`);
    assert.ok(body.querySelector("input, textarea"), `${tab}: with its fields`);
    for (let e = body; e && e !== main(p); e = e.parentNode)
      for (const c of (e.getAttribute && e.getAttribute("class") || "").split(/\s+/).filter(Boolean))
        assert.ok(!hiddenBy(c), `${tab}: class ${c} is hidden by a served stylesheet`);
  }
});
