/* screens-inquiry R76, R77 (T51-119): `project`, "Telling the network": an owner prepares, previews and signs a "working on"
 * notice (the signer kit, namespace `bio-working-on`), and sees it published with its level, its next check and "Change it or
 * stop it"; on interface-shell's served page over the real world (store-assembly's store with the real door; the project, its owner and the notice are
 * made by real acts, K5054), with a real key held on the device. Every expectation is a
 * word read by key (R44); dates through the same words as `cs.date`; a refusal by its `refusal.<CODE>` key. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { webcrypto, generateKeyPairSync } from "node:crypto";
import { ok, refusedIn, boot } from "../interface-shell/harness.mjs";
import { hasWord } from "../../../src/setup-words/index.mjs";
import { verifySshsig, NS_NOTICE } from "../../../src/sshsig.mjs";
import { noticePrepareRefusal } from "../network-notices/fixtures.mjs";
import { open, storeWorld, main, actsIn, fill, says, word, rawKeys, SCREENS, P } from "./fixtures.mjs";

/* every owner's declarations, registered once before the first read (test-support R17, K4245): the project's acts name ops its owners declare */


const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const day = (iso) => { const [y, m, d] = iso.slice(0, 10).split("-").map(Number); return word("date.daymonthyear", { day: String(d), month: word("date.month." + MONTHS[m - 1]), year: String(y) }); };
const DIGEST = "ab12" + "0".repeat(56) + "ef90";
const NID = "NOTICE-2026-0001-x1y2z3";
const WORDING = "Checking whether the city repairs reported potholes within its own seven-day rule";
const today = () => new Date().toISOString().slice(0, 10);
/* the real world: ann made the project and owns it. The team's Civicsmith holds a signing key of its own (the operator's binding, `RECEIPT_SIGNING_KEY`), without which a notice is never prepared. */
const OWN = { capabilities: ["contribute", "create_projects"] };
const INSTANCE_KEY = generateKeyPairSync("ed25519").privateKey.export({ format: "der", type: "pkcs8" }).toString("base64");
async function ownerWorld({ bound = true } = {}) {
  const world = await storeWorld(bound ? { env: { RECEIPT_SIGNING_KEY: INSTANCE_KEY } } : {});
  const ann = await world.signIn("ann", OWN);
  const project = await world.recipes.project(ann, "Pothole repairs");
  return { world, ann, project, at: "/app/project/" + project, since: new Date(world.now()).toISOString().slice(0, 10) };
}
/** The project's page as `as` reads it over the world's door (`plane` scripts only the ops it names; `idb` is the device's kept keys); `answers(op)` are the door's own answers, in order. */
async function pageOn(w, as, o = {}) {
  const { door, session } = w.world.boot(as);
  const kept = [];
  const p = await boot({ screens: SCREENS, door: async (req) => { const a = await door(req); kept.push([req.op, a]); return a; }, session, path: w.at, ...o });
  await p.settle();
  p.answers = (op) => kept.filter(([k]) => k === op).map(([, a]) => (a.json && a.json.result !== undefined ? a.json.result : a.json));
  p.w = w;
  return p;
}
const openOwner = async (o = {}, w = null) => { w = w || await ownerWorld(); return pageOn(w, w.ann, o); };
/** A notice opened by real acts: the owner prepares it (`noticeprepare`), signs the statement with her registered key and posts it (`noticepost`). Answers `{notice, revision, digest, statement, posted}`. */
async function openNotice(w, { wording = WORDING, body = "Using the city's own repair log", since = w.since, collaborate = true } = {}) {
  const key = await w.world.recipes.signer(w.ann);
  const prep = await w.ann.act("noticeprepare", { body: { project: w.project, wording, body, matter: "Pothole repair policy", since, collaborate } });
  const posted = await w.ann.act("noticepost", { body: { digest: prep.digest, signature: key.sign(prep.statement, NS_NOTICE), acknowledged: true } });
  return { notice: posted.notice, revision: posted.revision, digest: prep.digest, statement: prep.statement, posted };
}
/** Her device's kept key (`keptKey`), registered as hers by her own act, so what the page signs the world can check. */
const registerDevice = (w, key) => w.ann.act("signerregisterown", { body: { keyB64: key.line.split(" ")[1], comment: "this device" } });
const section = (p, key) => main(p).querySelectorAll("section").find((s) => s.querySelector("h2") && s.querySelector("h2").textContent === word(key));
const TELL = "screen.project.notice.heading";
const fold = (p) => main(p).querySelector('[data-fold="noticerefusal"]');
/* a prepared revision, as network-notices R2 answers it: exactly R3's fields, the statement over its digest */
const prepared = (rev, extra = {}) => ({ ok: true, revision: JSON.stringify(rev), digest: DIGEST, statement: `bio-working-on ${NID} ${rev.revision || 1} ${DIGEST}\n`,
  warning: "x", caution: null, expires: "2999-01-01T00:00:00Z", ...extra });
const REV1 = { format: "civicsmith-working-on/1", group: "river-town", notice: NID, revision: 1, previous: null, wording: WORDING, body: "Using the city's own repair log",
  since: "2026-10-03", posted: "2026-10-17", collaborate: true, doorbell: "doorbell", status: "open" };
const NOTICE = (over = {}) => ({ notice: NID, status: "open", opened_at: "2026-10-17T09:00:00Z",
  revisions: [{ revision: 1, digest: DIGEST, json: { wording: WORDING, body: "Using the city's own repair log", since: "2026-10-03", posted: "2026-10-17", collaborate: true, status: "open" }, published_at: "2026-10-17T09:00:00Z" }],
  attestations: [{ kind: "monthly", as_of: "2026-10-17", json: { activity: { level: "Very active", as_of: "2026-10-17" }, cases: [{ case: "CASE-1", edition: 1 }] } }],
  level: { level: "Very active", as_of: "2026-10-17" }, next_monthly: "2026-11-01", lapse_date: null, missed_monthlies: [], ...over });
const notices = (...list) => ok({ ok: true, project: P, notices: list, sealed_weeks: [], methodVersion: "civicsmith-working-on-activity/1" });
const prepare = (rev, extra) => ({ noticeprepare: ok(prepared(rev, extra)) });

/** A signing key kept on this device (interface-shell R40's form), and its public line. */
async function keptKey() {
  const pair = await webcrypto.subtle.generateKey({ name: "Ed25519" }, false, ["sign", "verify"]);
  const raw32 = new Uint8Array(await webcrypto.subtle.exportKey("raw", pair.publicKey));
  const idb = new Map([["civicsmith-signer", new Map([["keys", new Map([["own", { priv: pair.privateKey, raw32: raw32.buffer.slice(0), label: "bio-ratify" }]])]])]]);
  const wire = new Uint8Array([0, 0, 0, 11, ...new TextEncoder().encode("ssh-ed25519"), 0, 0, 0, 32, ...raw32]);
  return { idb, line: "ssh-ed25519 " + Buffer.from(wire).toString("base64") + " bio-ratify" };
}
async function until(p, f) { for (let i = 0; i < 400 && !f(); i++) await new Promise((r) => setTimeout(r, 10)); await p.settle(); }
const signDialog = (p) => p.root().querySelector('[data-overlay="sign"]');
const btn = (p, op, mode) => main(p).querySelectorAll(`button[data-act="${op}"]`).find((b) => mode === undefined || b.getAttribute("data-mode") === mode);
const pressMode = async (p, op, mode) => { const b = btn(p, op, mode); assert.ok(b, `${op} ${mode}`); await p.click(b); await p.settle(); return b; };
/** The signed act: its own friction (signed weight), then the kit's "What your key signs, exactly" dialog, answered. */
async function pressSigned(p, yes = true, sent = "noticepost") {
  await p.click(btn(p, "noticepost"));
  const confirm = p.root().querySelector('[data-shell="confirm"]');
  if (confirm) await p.click(confirm);
  await until(p, () => signDialog(p));
  const lines = signDialog(p) ? signDialog(p).textContent : "";
  await p.click(`[data-shell="${yes ? "dialog-yes" : "dialog-no"}"]`);
  await until(p, () => (yes ? p.byOp(sent).length > 0 : !signDialog(p)));
  return lines;
}
const tick = async (p) => { const c = p.doc.getElementById("project-notice-ack"); c.checked = true; p.fire(c, "change"); await p.settle(); };
const FORM = { "project-notice-wording": WORDING, "project-notice-body": "Using the city's own repair log", "project-notice-matter": "Pothole repair policy", "project-notice-since": "2026-10-03" };
async function previewed(extra = {}, boot = {}) {
  const p = await openOwner({ plane: { ...prepare(REV1), ...extra }, ...boot });
  await pressMode(p, "noticeprepare", "open");
  fill(p, FORM);
  p.doc.getElementById("project-notice-collab-0").checked = true;
  await pressMode(p, "noticeprepare", "preview");
  return p;
}

/** The preview of a notice prepared by the world itself (the real `noticeprepare`), the owner's device key registered as hers so that what the page signs the world can check. */
async function previewedReal(w = null) {
  w = w || await ownerWorld();
  const key = await keptKey();
  await registerDevice(w, key);
  const p = await openOwner({ idb: key.idb }, w);
  await pressMode(p, "noticeprepare", "open");
  fill(p, { ...FORM, "project-notice-since": w.since });
  p.doc.getElementById("project-notice-collab-0").checked = true;
  await pressMode(p, "noticeprepare", "preview");
  return { p, w, key, answer: p.answers("noticeprepare")[0] };
}

test("R76 an owner is offered the entry (what a notice is, that it is public and names the team, never a member) and its act; opening it sends nothing and draws the form's fields", async () => {
  const p = await openOwner();
  const s = section(p, TELL);
  assert.ok(s, "drawn to an owner");
  assert.ok(says(s, "screen.project.notice.an.owner.can.publish.a") && says(s, "screen.project.notice.it.is.public.and.it"));
  assert.ok(says(btn(p, "noticeprepare", "open"), "screen.project.notice.tell.the.network.we.are"));
  assert.equal(p.byOp("notices")[0].query.project, p.w.project, "read for an owner");
  await pressMode(p, "noticeprepare", "open");
  assert.equal(p.byOp("noticeprepare").length, 0, "opening the form sends nothing");
  for (const id of ["project-notice-wording", "project-notice-body", "project-notice-matter", "project-notice-since", "project-notice-collab"]) assert.ok(p.doc.getElementById(id), id);
  assert.equal(p.doc.getElementById("project-notice-wording").value, "", "nothing filled from the project");
  assert.equal(p.doc.getElementById("project-notice-since").value, "", "no date filled in");
  assert.ok(says(main(p), "screen.project.notice.only.an.owner.can.do") && says(main(p), "screen.project.notice.what.the.notice.says"));
  assert.equal(p.doc.getElementById("project-notice-collab").querySelector("legend").textContent, word("screen.project.notice.legend.welcome"), "the tick's legend, by its key");
  assert.ok(says(section(p, "screen.project.notice.what.the.public.sees"), "screen.project.notice.work.by.the.assistant.is"), "what the public sees, and what the team's Civicsmith works out");
  assert.ok(says(btn(p, "noticeprepare", "preview"), "act.noticeprepare.label.project"));
  assert.ok(!btn(p, "noticepost"), "no sign button before a preview");
  assert.deepEqual(rawKeys(p.root()), []);
});

test("R76 controls: a member who is not an owner is drawn no section and sends no notices read; the project's own words are never filled into a notice", async () => {
  /* the real state: ann owns the project; mai joined it, invited by her, and owns nothing */
  const w = await ownerWorld();
  const mai = await w.world.signIn("mai", OWN);
  await w.ann.act("projectinvite", { query: { projectId: w.project, handle: "mai" }, body: {} });
  await mai.act("projectjoin", { query: { projectId: w.project }, body: {} });
  const m = await pageOn(w, mai);
  assert.equal(section(m, TELL), undefined);
  assert.ok(!actsIn(main(m)).includes("noticeprepare") && !actsIn(main(m)).includes("noticepost"));
  assert.equal(m.byOp("notices").length, 0);
  /* nothing of the project (its title, its objective) is in the form's fields */
  const p = await openOwner();
  await pressMode(p, "noticeprepare", "open");
  for (const id of ["project-notice-wording", "project-notice-body", "project-notice-matter"]) assert.equal(p.doc.getElementById(id).value, "");
});

test("R76 Preview sends noticeprepare with the fields and writes nothing; the answer is drawn as the outward ceremony: the exact wording, the date and openness, the warning in the design's words, the statement; the sign button is absent until the box is ticked", async () => {
  const p = await previewed();
  const q = p.byOp("noticeprepare")[0];
  assert.deepEqual(q.body, { project: p.w.project, wording: WORDING, body: "Using the city's own repair log", matter: "Pothole repair policy", since: "2026-10-03", collaborate: true });
  assert.equal(p.byOp("noticepost").length, 0, "nothing is published by a preview");
  const c = section(p, "screen.project.notice.once.you.preview.it");
  assert.ok(c, "the ceremony");
  assert.equal(c.querySelector('[data-notice="wording"]').textContent, WORDING, "the exact wording");
  assert.ok(says(c, "screen.project.notice.working.on.it.since.3", { date: day("2026-10-03") }) && says(c, "network-notices.others_working_welcome"), "the date and openness");
  assert.ok(c.querySelector(".cs-tag-outward") && says(c, "screen.connect.outward"), "the outward tag");
  assert.ok(says(c, "screen.project.notice.anyone.can.read.this.including") && says(c, "screen.project.notice.stopping.the.notice.later.ends"), "the warning, in the design's words");
  assert.ok(says(c, "screen.project.notice.i.understand.that.this.is"));
  assert.equal(c.querySelector("fieldset legend").textContent, word("screen.project.notice.legend.sign"), "the acknowledgement's legend, by its key");
  assert.ok(says(c, "network-notices.status.open"), "the notice's state, by its key");
  assert.equal(c.querySelector('[data-notice="statement"]').textContent, prepared(REV1).statement.trim(), "the statement the key will sign");
  assert.ok(says(c, "screen.project.notice.your.key.signs.this.exact") && says(c, "screen.project.notice.a.preview.is.good.for"));
  assert.ok(!c.querySelector('[data-notice="caution"]'), "no caution when none");
  assert.ok(!btn(p, "noticepost"), "the button is drawn only after the box is ticked");
  await tick(p);
  assert.ok(btn(p, "noticepost"), "ticked: the sign button");
  assert.ok(says(btn(p, "noticepost"), "act.noticepost.label.project"));
  /* control: unticking takes it away again */
  const box = p.doc.getElementById("project-notice-ack");
  box.checked = false; p.fire(box, "change"); await p.settle();
  assert.ok(!btn(p, "noticepost"));
  /* the caution (two open and no published work) is drawn, never refuses */
  const cautious = await previewed(prepare(REV1, { caution: "two_open_without_published_work" }));
  assert.ok(section(cautious, "screen.project.notice.once.you.preview.it").querySelector('[data-notice="caution"]'));
  assert.ok(says(section(cautious, "screen.project.notice.once.you.preview.it"), "screen.project.notice.your.team.has.two.other"), "the caution's fixed sentence, no fills");
  assert.ok(says(section(cautious, "screen.project.notice.once.you.preview.it"), "screen.project.notice.you.can.still.publish.readers"));
});

test("R76 Sign and publish: the statement is signed in the shell signer in namespace bio-working-on; noticepost carries the digest, the signature and acknowledged: true; nothing is drawn as published before the answer", async () => {
  const { p, w, key, answer } = await previewedReal();
  assert.equal(answer.ok, true, "the world prepared it");
  await tick(p);
  const lines = await pressSigned(p);
  assert.ok(lines.includes(answer.statement.trim()), "what the key signs, exactly, is the prepared statement");
  const post = p.byOp("noticepost")[0];
  assert.deepEqual(Object.keys(post.body).sort(), ["acknowledged", "digest", "signature"]);
  assert.equal(post.body.digest, answer.digest);
  assert.equal(post.body.acknowledged, true);
  assert.equal(NS_NOTICE, "bio-working-on");
  const v = await verifySshsig(post.body.signature, new TextEncoder().encode(answer.statement), NS_NOTICE, [key.line]);
  assert.equal(v.ok, true, "a valid signature of exactly the statement, in the notice namespace");
  assert.equal((await verifySshsig(post.body.signature, new TextEncoder().encode(answer.statement), "bio-ratify", [key.line])).ok, false, "and in no other");
  assert.equal(p.byOp("noticeprepare").length, 1);
  assert.equal(p.answers("noticepost")[0].ok, true, "the world took the signature");
  const held = (await w.ann.read("notices", { query: { project: w.project } })).notices;
  assert.deepEqual(held.map((n) => n.status), ["open"], "the world holds the notice, open");
  assert.equal(held[0].revisions[0].digest, answer.digest);
  /* control: until it answers, the notice is not drawn as published */
  const slow = await previewed({ noticepost: { pending: true } }, { idb: (await keptKey()).idb });
  await tick(slow);
  await p.settle();
  await slow.click(btn(slow, "noticepost"));
  const confirm = slow.root().querySelector('[data-shell="confirm"]');
  if (confirm) await slow.click(confirm);
  await until(slow, () => signDialog(slow));
  await slow.click('[data-shell="dialog-yes"]');
  await until(slow, () => slow.byOp("noticepost").length > 0);
  assert.equal(main(slow).querySelectorAll('[data-notice="published"]').length, 0, "nothing drawn as published before the answer");
});

test("R76 a declined signing sends nothing; the text typed is kept", async () => {
  const { p, w } = await previewedReal();
  await tick(p);
  await pressSigned(p, false);
  assert.equal(p.byOp("noticepost").length, 0);
  assert.ok(says(p.root(), "signing.ceremony.declined"), "declined, said in words");
  assert.ok(btn(p, "noticepost"), "and the act stays, to sign again when she is ready");
  assert.equal(p.doc.getElementById("project-notice-wording").value, WORDING);
  assert.deepEqual((await w.ann.read("notices", { query: { project: w.project } })).notices, [], "the world holds no notice");
});

test("R76 a wording of 281 characters, a wording that is empty, a missing date and a future date are refused in place by their words, nothing sent, the text kept", async () => {
  const p = await openOwner({ plane: { ...prepare(REV1) } });
  await pressMode(p, "noticeprepare", "open");
  const attempt = async (values, code) => {
    fill(p, { ...FORM, ...values });
    await pressMode(p, "noticeprepare", "preview");
    assert.equal(p.byOp("noticeprepare").length, 0, code + ": nothing sent");
    assert.ok(says(p.root(), "refusal." + code), code);
    assert.equal(p.doc.getElementById("project-notice-wording").value, values["project-notice-wording"] ?? WORDING, "the text typed is kept");
  };
  await attempt({ "project-notice-wording": "x".repeat(281) }, "NOTICE_WORDING_MALFORMED");
  await attempt({ "project-notice-wording": "" }, "NOTICE_WORDING_MALFORMED");
  await attempt({ "project-notice-since": "" }, "NOTICE_SINCE_MALFORMED");
  const tomorrow = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
  await attempt({ "project-notice-since": tomorrow }, "NOTICE_SINCE_IN_FUTURE");
  /* controls: 280 characters is sent; today is a date the form takes */
  fill(p, { ...FORM, "project-notice-wording": "x".repeat(280), "project-notice-since": today() });
  await pressMode(p, "noticeprepare", "preview");
  assert.equal(p.byOp("noticeprepare").length, 1);
  assert.equal(p.byOp("noticeprepare")[0].body.wording.length, 280);
  assert.equal(p.byOp("noticeprepare")[0].body.collaborate, false, "Others welcome unticked is sent as false");
});

test("R76 the plane's refusals of the preview are drawn in plain words in the one fold \"When a notice can't be prepared\", each by its key; NOTICE_SINCE_BEFORE_PROJECT names the date", async () => {
  const cases = [
    ["NOTICE_ALREADY_OPEN", ["screen.project.notice.this.project.already.has.an", "screen.project.notice.change.that.one.or.stop"], {}],
    ["NOTICE_SINCE_BEFORE_PROJECT", [], { project_created: "2026-10-03" }],
    ["NOTICE_NO_GROUP_SLUG", ["screen.project.notice.your.teams.public.address.or", "screen.project.notice.an.administrator.can.finish.setting"], {}],
    ["NOTICE_NO_INSTANCE_KEY", ["screen.project.notice.your.teams.public.address.or", "screen.project.notice.an.administrator.can.finish.setting"], {}],
    ["NOTICE_PROJECT_CLOSED", ["screen.project.notice.this.project.is.closed", "screen.project.notice.a.closed.project.can.only"], {}],
    ["NOTICE_SINCE_IN_FUTURE", ["refusal.NOTICE_SINCE_IN_FUTURE"], {}],
    ["NOTICE_WORDING_MALFORMED", ["refusal.NOTICE_WORDING_MALFORMED"], {}],
  ];
  /* the world's own refusal where an act of the world makes the state; the two it cannot make are network-notices' published answers, played back where the page sends the preview:
     NOTICE_NO_GROUP_SLUG (a project in a team that recorded no name: an older installation refuses every project, GROUP_UNDETERMINED, so none can be made there) and
     NOTICE_WORDING_MALFORMED past the page's own check (a wording the page lets through that the owner refuses) */
  const refusedBy = {
    NOTICE_ALREADY_OPEN: async () => { const w = await ownerWorld(); const p = await openOwner({}, w); await openNotice(w); return { p, since: w.since }; },
    NOTICE_SINCE_BEFORE_PROJECT: async () => { const w = await ownerWorld(); return { p: await openOwner({}, w), since: "2026-09-15", w }; },
    NOTICE_NO_INSTANCE_KEY: async () => { const w = await ownerWorld({ bound: false }); return { p: await openOwner({}, w), since: w.since }; },
    NOTICE_PROJECT_CLOSED: async () => { const w = await ownerWorld(); const p = await openOwner({}, w); await w.ann.act("projectclose", { body: { project: w.project, reason: "resolved" } }); return { p, since: w.since }; },
    NOTICE_SINCE_IN_FUTURE: async () => { const w = await ownerWorld(); return { p: await openOwner({}, w), since: "2026-10-10" }; },
  };
  for (const [code, keys, fields] of cases) {
    let p, since = "2026-10-03", created = "2026-10-03";
    if (refusedBy[code]) {
      ({ p, since } = await refusedBy[code]());
      await pressMode(p, "noticeprepare", "open");
      fill(p, { ...FORM, "project-notice-since": since });
    } else {
      p = await openOwner({ plane: { noticeprepare: ok(await noticePrepareRefusal(code)) } });
      await pressMode(p, "noticeprepare", "open");
      fill(p, FORM);
    }
    await pressMode(p, "noticeprepare", "preview");
    if (refusedBy[code]) assert.equal(p.answers("noticeprepare")[0].reason, code, code + ": the world's own refusal");
    if (code === "NOTICE_SINCE_BEFORE_PROJECT" && refusedBy[code]) created = p.answers("noticeprepare")[0].project_created;
    const f = fold(p);
    assert.ok(f, code + ": the fold");
    assert.ok(says(f.querySelector("summary"), "screen.project.notice.when.a.notice.cant.be"));
    for (const k of keys) assert.ok(says(f, k), `${code}: ${k}`);
    if (code === "NOTICE_SINCE_BEFORE_PROJECT") assert.ok(says(f, "screen.project.notice.the.date.is.before.the", { date: day(created) }));
    assert.equal(p.doc.getElementById("project-notice-wording").value, WORDING, "the text typed is kept");
    assert.deepEqual(rawKeys(p.root()), [], code);
  }
  /* control: a preview that is answered draws no fold */
  const fine = await previewed();
  assert.equal(fold(fine), null);
  const real = await previewedReal();
  assert.equal(fold(real.p), null, "and so does one the world answers");
});

test("R76 the signing refusals are drawn by their words: a stale preview (prepare again), a signature refused, no acknowledgement; each has a control", async () => {
  for (const code of ["NOTICE_STALE", "NOTICE_SIGNATURE_REFUSED", "NOTICE_WARNING_NOT_ACKNOWLEDGED", "NOTICE_NOT_THE_OWNER", "MACHINE_CANNOT_POST_NOTICE"]) {
    assert.ok(hasWord("refusal." + code), code);
    const p = await previewed({ noticepost: refusedIn(code) }, { idb: (await keptKey()).idb });
    await tick(p);
    await pressSigned(p);
    assert.ok(says(p.root(), "refusal." + code), code);
    assert.equal(main(p).querySelectorAll('[data-notice="published"]').length, 0, "nothing drawn as published on a refusal");
    assert.ok(section(p, "screen.project.notice.once.you.preview.it"), "the preview stays, to prepare again");
  }
});

test("R76 (DEC-366 (4c)) NOTICE_SIGNATURE_REFUSED draws a reference to `account` by the register-key label, and no act of it; no other refusal does", async () => {
  for (const code of ["NOTICE_SIGNATURE_REFUSED", "NOTICE_STALE", "NOTICE_WARNING_NOT_ACKNOWLEDGED"]) {
    const p = await previewed({ noticepost: refusedIn(code) }, { idb: (await keptKey()).idb });
    await tick(p);
    await pressSigned(p);
    assert.ok(says(p.root(), "refusal." + code), code);
    const ref = main(p).querySelector('a[data-notice="registerkey"]');
    if (code === "NOTICE_SIGNATURE_REFUSED") {
      assert.ok(ref, "the reference is drawn");
      assert.equal(ref.getAttribute("href"), "/app/account");
      assert.equal(ref.textContent, word("act.signerregisterown.label.account"));
    } else assert.equal(ref, null, code);
    assert.equal(main(p).querySelectorAll('[data-act="signerregisterown"]').length, 0, "no act drawn on project");
  }
});

test("R77 an open notice is drawn to an owner as published: its wording, when, since, openness, the level the team's Civicsmith worked out and when, the next check, the cases published; Change it or stop it with both acts and the note that earlier versions are never deleted", async () => {
  const p = await openOwner({ plane: { notices: notices(NOTICE()) } });
  const s = section(p, TELL);
  const pub = s.querySelector('[data-notice="published"]');
  assert.ok(pub, "state g");
  assert.equal(pub.querySelector('[data-notice="wording"]').textContent, WORDING);
  assert.ok(says(pub, "state.item.published.name") && pub.textContent.includes(day("2026-10-17")), "published");
  assert.ok(says(pub, "screen.project.notice.working.on.it.since.3", { date: day("2026-10-03") }) && says(pub, "network-notices.others_working_welcome"));
  assert.equal(pub.querySelector('[data-notice="level"]').textContent, word("network-notices.level.very_active"), "the level of the five, in its words");
  assert.ok(says(pub, "network-notices.status.open"), "the notice's state, by its key");
  assert.ok(says(s, "screen.project.notice.thenotice"), "the notice's heading");
  assert.ok(says(pub, "screen.project.notice.as.the.teams.civicsmith.worked", { date: day("2026-10-17") }), "as worked out on its date");
  assert.ok(says(pub, "screen.project.notice.the.next.monthly.check.is", { date: day("2026-11-01") }), "the next monthly check");
  assert.ok(says(pub, "screen.project.notice.1.case.published.from.this", { n: "1" }), "the case published from this project");
  assert.ok(!says(pub, "screen.project.notice.a.notice.that.stays.dormant"), "no lapse running");
  assert.ok(says(s, "screen.project.notice.anyone.can.read.this.at") && says(s, "screen.project.notice.each.owner.of.the.project"));
  const c = section(p, "screen.project.notice.change.it.or.stop.it");
  assert.ok(c.querySelector("#project-notice-handoff") && says(c, "screen.project.notice.if.you.stop.where.the"));
  assert.deepEqual(c.querySelectorAll("button[data-act]").map((b) => [b.getAttribute("data-act"), b.getAttribute("data-mode")]), [["noticeprepare", "change"], ["noticeprepare", "stop"]]);
  assert.ok(says(btn(p, "noticeprepare", "change"), "screen.project.notice.change") && says(btn(p, "noticeprepare", "stop"), "screen.project.notice.stop"), "the two acts' labels by their keys");
  assert.ok(says(c, "screen.project.notice.a.change.is.a.new") && says(c, "screen.project.notice.a.stop.is.signed.too") && says(c, "screen.project.notice.neither.removes.what.was.published"));
  /* controls: no act removes or hides an earlier revision; the entry is not drawn beside a published notice; a read draws nothing written */
  assert.deepEqual([...new Set(actsIn(s).concat(actsIn(c)))], ["noticeprepare"]);
  assert.ok(!btn(p, "noticeprepare", "open"), "a second notice is not offered beside an open one");
  assert.equal(p.requests.filter((r) => ["noticepost", "noticeprepare"].includes(r.op)).length, 0, "nothing is written by drawing it");
  assert.deepEqual(rawKeys(p.root()), []);
});

test("R77 the level words: the five levels by their keys where the list holds them, none composed where it does not; a lapse running, a missed monthly and a case count of none each draw only what the answer holds", async () => {
  const levelOf = async (level) => section(await openOwner({ plane: { notices: notices(NOTICE({ level: { level, as_of: "2026-10-17" } })) } }), TELL).querySelector('[data-notice="level"]');
  assert.equal((await levelOf("Very active")).textContent, word("network-notices.level.very_active"));
  assert.equal((await levelOf("Some work")).textContent, word("network-notices.level.some_work"));
  assert.equal((await levelOf("Active")).textContent, word("network-notices.level.active"));
  assert.equal((await levelOf("Quiet")).textContent, word("network-notices.level.quiet"));
  assert.equal((await levelOf("Dormant")).textContent, word("network-notices.level.dormant"));
  assert.equal(await levelOf("Something else"), null, "a level the list does not hold names none (no word is composed here)");
  /* a lapse running names the rule; no cases draws no count */
  const lapsing = await openOwner({ plane: { notices: notices(NOTICE({ lapse_date: "2026-12-01", attestations: [] })) } });
  const pub = section(lapsing, TELL).querySelector('[data-notice="published"]');
  assert.ok(says(pub, "screen.project.notice.a.notice.that.stays.dormant"));
  assert.ok(!says(pub, "screen.project.notice.1.case.published.from.this", { n: "0" }) && !pub.textContent.includes(word("screen.project.notice.cases.published.from.this", { n: "0" })), "no count at zero");
  const many = await openOwner({ plane: { notices: notices(NOTICE({ attestations: [{ kind: "monthly", as_of: "2026-10-17", json: { cases: [{}, {}, {}] } }] })) } });
  assert.ok(says(section(many, TELL).querySelector('[data-notice="published"]'), "screen.project.notice.cases.published.from.this", { n: "3" }));
  /* a monthly missed for want of a key: the last attested level with its date stands, marked */
  const missed = await openOwner({ plane: { notices: notices(NOTICE({ missed_monthlies: [{ month: "2026-11", at: "2026-11-01T00:00:00Z" }] })) } });
  assert.equal(section(missed, TELL).querySelector('[data-notice="published"]').getAttribute("data-missed"), "1");
  assert.ok(says(section(missed, TELL), "screen.project.notice.missed", { level: word("network-notices.level.very_active"), date: day("2026-10-17") }), "the missed check, with the last level attested and its date");
  assert.ok(!section(lapsing, TELL).querySelector('[data-notice="missed"]'), "control: no missed line when none was missed");
  assert.ok(says(section(missed, TELL), "screen.project.notice.as.the.teams.civicsmith.worked", { date: day("2026-10-17") }));
});

test("R77 Change the notice: the form opens with the notice's words, the preview names the notice (a new revision of it), and is signed as the first; a change that alters nothing is refused NOTICE_UNCHANGED in words", async () => {
  const key = await keptKey();
  /* the real state: ann opened the notice by her acts, and the page signs with her device's key, registered as hers */
  const w = await ownerWorld();
  const opened = await openNotice(w);
  await registerDevice(w, key);
  const p = await openOwner({ idb: key.idb }, w);
  await pressMode(p, "noticeprepare", "change");
  assert.equal(p.byOp("noticeprepare").length, 0, "opening the change sends nothing");
  assert.equal(p.doc.getElementById("project-notice-wording").value, WORDING, "the notice's own words");
  assert.equal(p.doc.getElementById("project-notice-since").value, w.since);
  assert.equal(p.doc.getElementById("project-notice-collab-0").checked, true);
  fill(p, { "project-notice-wording": WORDING + ", and the work orders" });
  await pressMode(p, "noticeprepare", "preview");
  const q = p.byOp("noticeprepare")[0].body;
  assert.deepEqual([q.project, q.notice, q.wording, q.since, q.collaborate, q.final], [w.project, opened.notice, WORDING + ", and the work orders", w.since, true, undefined]);
  const rev2 = p.answers("noticeprepare")[0];
  assert.equal(rev2.ok, true, "the world prepared the new revision");
  await tick(p);
  const lines = await pressSigned(p);
  assert.ok(lines.includes(rev2.statement.trim()), "the new revision's statement is signed");
  assert.equal(p.byOp("noticepost")[0].body.acknowledged, true);
  const held = (await w.ann.read("notices", { query: { project: w.project } })).notices[0];
  assert.deepEqual(held.revisions.map((r) => r.revision), [1, 2], "the world holds both revisions of the one notice");
  /* a change that alters nothing */
  const w2 = await ownerWorld();
  await openNotice(w2);
  const same = await openOwner({}, w2);
  await pressMode(same, "noticeprepare", "change");
  await pressMode(same, "noticeprepare", "preview");
  assert.equal(same.answers("noticeprepare")[0].reason, "NOTICE_UNCHANGED", "the world's own refusal");
  assert.ok(says(fold(same), "refusal.NOTICE_UNCHANGED"), "refused in words");
  assert.equal(same.byOp("noticepost").length, 0);
  for (const code of ["NOTICE_NOT_OPEN", "NOTICE_SINCE_EARLIER"]) {
    const r = await openOwner({ plane: { notices: notices(NOTICE()), noticeprepare: refusedIn(code) } });
    await pressMode(r, "noticeprepare", "change");
    await pressMode(r, "noticeprepare", "preview");
    assert.ok(says(fold(r), "refusal." + code), code);
  }
});

test("R77 Stop the notice: sends noticeprepare with final: stopped, the notice and the handoff, previewed and signed the same way; after it the notice is drawn as stopped and a new one is offered; nothing earlier is removed", async () => {
  const key = await keptKey();
  const handoff = "The seven-day finding is drafted; the work-order match is still open.";
  const w = await ownerWorld();
  const opened = await openNotice(w);
  await registerDevice(w, key);
  const p = await openOwner({ idb: key.idb }, w);
  fill(p, { "project-notice-handoff": handoff });
  await pressMode(p, "noticeprepare", "stop");
  const q = p.byOp("noticeprepare")[0].body;
  assert.deepEqual([q.project, q.notice, q.final, q.handoff, q.wording, q.since], [w.project, opened.notice, "stopped", handoff, WORDING, w.since]);
  const stopped = p.answers("noticeprepare")[0];
  assert.equal(stopped.ok, true, "the world prepared the stop");
  const c = section(p, "screen.project.notice.once.you.preview.it");
  assert.equal(c.querySelector('[data-notice="handoff"]').textContent, handoff, "the handoff is previewed with it");
  await tick(p);
  const lines = await pressSigned(p);
  assert.ok(lines.includes(stopped.statement.trim()), "the stop is signed too");
  await p.settle();
  assert.equal(p.byOp("notices").length, 2, "the notice is read again once posted");
  const last = section(p, TELL).querySelector('[data-notice="last"]');
  assert.equal(last.getAttribute("data-status"), "stopped", "drawn as stopped");
  assert.equal(last.querySelector('[data-notice="wording"]').textContent, WORDING, "its last words, with the date");
  assert.ok(btn(p, "noticeprepare", "open"), "a new notice is offered once it is stopped");
  assert.equal(main(p).querySelectorAll('[data-notice="published"]').length, 0);
  const held = (await w.ann.read("notices", { query: { project: w.project } })).notices[0];
  assert.deepEqual([held.status, held.revisions.map((r) => r.revision)], ["stopped", [1, 2]], "the world holds the stop, and the first revision still");
  /* a stop with a handoff over 280 characters is refused in place, nothing sent */
  const w2 = await ownerWorld();
  await openNotice(w2);
  const q2 = await openOwner({}, w2);
  fill(q2, { "project-notice-handoff": "x".repeat(281) });
  await pressMode(q2, "noticeprepare", "stop");
  assert.equal(q2.byOp("noticeprepare").length, 0);
  assert.ok(says(q2.root(), "refusal.NOTICE_WORDING_MALFORMED"));
  /* control: a stop with no handoff sends none */
  const w3 = await ownerWorld();
  await openNotice(w3);
  const q3 = await openOwner({}, w3);
  await pressMode(q3, "noticeprepare", "stop");
  assert.ok(!("handoff" in q3.byOp("noticeprepare")[0].body));
  assert.equal(q3.answers("noticeprepare")[0].ok, true, "the world prepared it");
});

test("R77 controls: a project with no notice draws only the entry; a read that fails is drawn failed, never as none; a notice stopped, lapsed or closed shows its last words and offers a new one", async () => {
  const none = await openOwner({ plane: { notices: notices() } });
  const s = section(none, TELL);
  assert.ok(says(s, "screen.project.notice.an.owner.can.publish.a") && btn(none, "noticeprepare", "open"));
  assert.equal(main(none).querySelectorAll('[data-notice="published"], [data-notice="last"]').length, 0);
  assert.equal(section(none, "screen.project.notice.change.it.or.stop.it"), undefined);
  const failed = await openOwner({ plane: { notices: refusedIn("SOME_REFUSAL", "Could not read it.") } });
  assert.ok(section(failed, TELL).querySelector('[data-state="failed"]'));
  assert.ok(!btn(failed, "noticeprepare", "open"), "an unread state is not offered a notice as if there were none");
  for (const status of ["stopped", "lapsed", "closed"]) {
    const p = await openOwner({ plane: { notices: notices(NOTICE({ status, lapse_date: status === "lapsed" ? "2026-12-01" : null })) } });
    assert.equal(section(p, TELL).querySelector('[data-notice="last"]').getAttribute("data-status"), status);
    assert.ok(says(section(p, TELL).querySelector('[data-notice="last"]'), "network-notices.status." + status), `${status}: its state by its key`);
    assert.equal(says(section(p, TELL), "screen.project.notice.lapsed.on", { date: day("2026-12-01") }), status === "lapsed", `${status}: the lapse date is said only for a lapsed notice`);
    assert.ok(btn(p, "noticeprepare", "open"), status);
    assert.equal(section(p, "screen.project.notice.change.it.or.stop.it"), undefined, `${status}: nothing to change or stop`);
  }
  /* no name of a member is drawn in the notice's part */
  const named = await openOwner({ plane: { notices: notices(NOTICE()) } });
  assert.ok(!/\bdev\b/.test(section(named, TELL).textContent));
});

test("R76 R77 every key the section draws is a word of the list, and the screen holds each", () => {
  const project = SCREENS.find((s) => s.id === "project");
  assert.ok(project.words.every((k) => hasWord(k)));
  for (const op of ["noticeprepare", "noticepost"]) assert.ok(project.acts.some((a) => a.op === op) && project.words.includes(`act.${op}.label.project`), op);
});
