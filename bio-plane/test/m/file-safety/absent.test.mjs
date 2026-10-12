/* file-safety R42 (T46; N897 (4); DEC-149): SCANNER_ABSENT and RENDERER_ABSENT said in members' words wherever this
   module answers them. At the module's interface, with no scanner bound: each site answers its code and row as before,
   and a `detail` that names "your group's Civicsmith", holds none of "copy", "instance", "plane" or "server", and says
   what was not done. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, pdf, T0 } from "./fixture.mjs";
import { FILE_SAFETY_CHECKS, fileSafetyOps } from "../../../src/file-safety/index.mjs";
import { PROVIDERS } from "../../../../file-scanner/src/providers/catalogue.mjs";
import { canonicalJson, sha256HexSync } from "../../../src/record-grammar/index.mjs";

const NOT_MEMBER_WORDS = /copy|instance|plane|server/i;
const INSTALLATION = /^Your group's Civicsmith /;
/* C-140.2 and C-140.13 as they stand: their translations, numbers and `where`s unmoved (R42's control). */
const ROWS = {
  SCANNER_ABSENT: { check: "C-140.2", where: "src/file-safety/index.mjs scanBatch > is-scanner-bound",
    translation: "Your group's Civicsmith has no virus scanner installed, so no file was scanned and no note was written. "
      + "Whoever installed it can add the scanner; until then a file's checks say it was not scanned." },
  RENDERER_ABSENT: { check: "C-140.13", where: "src/file-safety/index.mjs renderBatch > is-renderer-bound",
    translation: "Your group's Civicsmith has no safe-view maker installed, so no safe view can be made. Whoever installed it "
      + "can add it." },
};

test("R42: with no scanner bound, each of the six sites (scanBatch, safeView, renderBatch, securityToolTest, requestSafeCopy, refreshReputationLists) answers SCANNER_ABSENT or RENDERER_ABSENT with its row as before and a detail naming \"your group's Civicsmith\", holding none of copy, instance, plane or server, and saying what was not done; R8's not_scanned and R14's check detail stay the code; control: the rows' translations unchanged", async () => {
  const n = world({ bound: false });
  const s = await n.capture(pdf(false, "absent"));
  /* a tool added (no scanner is needed to add one), and a CDR tool on, as R33 asks the first on */
  const digest = sha256HexSync(canonicalJson(PROVIDERS.find((d) => d.provider_id === "scanii").handling));
  const added = await n.fs.securityToolAdd({ providerId: "scanii", config: { region: "eu1" }, credentials: { api_key: "k", api_secret: "s" },
                                             handlingDigest: digest, by: "boss" });
  assert.equal(added.ok, true, JSON.stringify(added));
  n.exec(`INSERT INTO fs_tools (tool_id, provider_id, kinds, use, state, handling, handling_digest, monthly_limit, added_by, added_at, config, seq)
          VALUES ('cdr-1', 'glasswall-halo', '["cdr"]', 'on_request', 'on', '{}', 'x', 5, 'boss', 'T', '{}', 99)`);
  const sites = [
    ["scanBatch (R4)", "SCANNER_ABSENT", await n.fs.scanBatch({}), "No note was written."],
    ["safeView (R11)", "RENDERER_ABSENT", await n.fs.safeView({ captureSha: s, viewer: "member:m1" }), "Nothing was rendered."],
    ["renderBatch (R12)", "RENDERER_ABSENT", await n.fs.renderBatch({}), "Nothing was rendered."],
    ["securityToolTest (R29)", "SCANNER_ABSENT", await n.fs.securityToolTest({ toolId: added.tool_id, by: "boss" }), "so no tool can be tested"],
    ["requestSafeCopy (R33)", "SCANNER_ABSENT", await n.fs.requestSafeCopy({ captureSha: s, viewer: "member:m1" }), "so no tool can be asked"],
    ["refreshReputationLists (R41)", "SCANNER_ABSENT", await n.fs.refreshReputationLists({ at: new Date(T0).toISOString() }), "so no list was refreshed"],
  ];
  for (const [site, code, r, notDone] of sites) {
    assert.ok(!(r instanceof Response), site);
    assert.deepEqual({ ok: r.ok, code: r.code, check: r.check, translation: r.translation },
                     { ok: false, code, check: ROWS[code].check, translation: ROWS[code].translation }, site);
    assert.equal(typeof r.detail, "string", site);
    assert.match(r.detail, INSTALLATION, `${site}: names your group's Civicsmith`);
    assert.doesNotMatch(r.detail, NOT_MEMBER_WORDS, `${site}: ${r.detail}`);
    assert.ok(r.detail.includes(notDone), `${site}: says what was not done (${r.detail})`);
  }
  /* the same answers through the routes that reach them */
  const op = (name, body, query = "") => fileSafetyOps(n.fs, new URL(`http://x/${name}?viewer=member%3Am1&by=boss${query}`), body, n.env)[name]();
  for (const [name, body, query] of [["scanbatch", {}], ["renderbatch", {}], ["safeview", {}, `&capture=${s}`], ["safecopyrequest", {}, `&capture=${s}`],
                                     ["securitytooltest", { toolId: added.tool_id }]]) {
    const r = await op(name, body, query);
    assert.match(r.detail, INSTALLATION, name);
    assert.doesNotMatch(r.detail, NOT_MEMBER_WORDS, name);
  }
  /* nothing else changes: R8's stated not_scanned and R14's check detail stay the code */
  const opened = await n.fs.openOriginal({ captureSha: s, viewer: "member:m1" });
  assert.equal(opened.headers.get("x-file-safety-not-scanned"), "SCANNER_ABSENT");
  assert.equal((await n.fs.originalState({ captureSha: s, viewer: "member:m1" })).stated.not_scanned, "SCANNER_ABSENT");
  /* control: the rows themselves, unmoved */
  for (const code of Object.keys(ROWS)) assert.deepEqual({ ...FILE_SAFETY_CHECKS[code] }, ROWS[code], code);
  /* negative control: the words this test refuses are seen in the old details */
  for (const old of ["No scanner is bound beside this copy. No note was written.", "No safe-view maker is bound beside this copy."])
    assert.match(old, NOT_MEMBER_WORDS);
});

test("R42: a scanner bound, none of the six sites answers SCANNER_ABSENT or RENDERER_ABSENT (the refusal is the absence's alone)", async () => {
  const w = world();
  const s = await w.capture(pdf(false, "present"));
  const answers = [await w.fs.scanBatch({}), await w.fs.renderBatch({}), await w.fs.safeView({ captureSha: s, viewer: "member:m1" }),
                   await w.fs.refreshReputationLists({})];
  for (const r of answers) assert.ok(!["SCANNER_ABSENT", "RENDERER_ABSENT"].includes(r && r.code), JSON.stringify(r).slice(0, 200));
  const id = await w.tool("scanii");
  assert.equal((await w.fs.securityToolTest({ toolId: id, by: "boss" })).ok, true);
  await w.tool("glasswall-halo", { config: { host: "halo.example.org" } });
  assert.equal((await w.fs.requestSafeCopy({ captureSha: s, viewer: "member:m1" })).ok, true);
});
