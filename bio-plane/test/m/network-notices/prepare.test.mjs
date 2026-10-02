/* network-notices: preparing a notice (R1, R2, R3, R27), at the module's interface. Every R1 refusal is shown with its
   negative control: the same call with only that condition put right is accepted. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, world, prepare, post, V, MACHINE, NOW, DAY, sha, day } from "./fixture.mjs";
import { NETWORK_NOTICE_CHECKS, NOTICE_FORMAT, OTHERS_WELCOME, DOORBELL_PATH, CAUTION_TWO_OPEN, OUTWARD_ACT_WARNING }
  from "../../../src/network-notices/index.mjs";
import { noticeStatement } from "../../../src/sshsig.mjs";
import { canonicalJson } from "../../../src/record-grammar/json.mjs";

const A = V("alice");
const rowOk = (r, code) => {
  assert.equal(r.ok, false);
  assert.equal(r.reason, code);
  assert.equal(r.code, code);
  assert.equal(r.check, NETWORK_NOTICE_CHECKS[code].check);
  assert.equal(r.translation, NETWORK_NOTICE_CHECKS[code].translation);
};
/* Refused, nothing written; then the control, accepted. */
async function refusedThenAccepted(w, bad, good, code) {
  const before = w.snapshot();
  const r = await bad();
  if (code.startsWith("NOTICE_") || code === "MACHINE_CANNOT_POST_NOTICE") rowOk(r, code); else assert.equal(r.reason, code);
  assert.deepEqual(w.snapshot(), before, `${code}: nothing written`);
  const ok = await good();
  assert.equal(ok.ok, true, `${code}'s control: ${JSON.stringify(ok).slice(0, 200)}`);
  return r;
}

test("R1 no project is the required-argument refusal; naming one is accepted", async () => {
  const w = seeded();
  const r = await refusedThenAccepted(w, () => prepare(w, { project: null }), () => prepare(w), "REQUIRED_ARGUMENT_MISSING");
  assert.equal(r.argument, "project");
});

test("R1 a project absent or invisible to `by` is membership's noSuchProject, the same answer either way", async () => {
  const w = seeded();
  const hidden = await prepare(w, { project: w.Q });                 /* alice takes no part in Q */
  const absent = await prepare(w, { project: "PROJ-2026-9999-none" });
  assert.equal(hidden.reason, "NO_SUCH_PROJECT");
  const strip = ({ project, ...x }) => x;
  assert.deepEqual(strip(hidden), strip(absent));
  /* control: Q's owner is answered */
  assert.equal((await w.nn.prepareNotice({ project: w.Q, wording: "x", since: "2026-02-01", by: V("dave"), viewer: V("dave") })).ok, true);
});

test("R1 R24 a machine or AI credential, or an operator token, is MACHINE_CANNOT_POST_NOTICE", async () => {
  const w = seeded();
  for (const who of [MACHINE, "token:operator", "class:admin", "", null]) {
    const r = await w.nn.prepareNotice({ project: w.P, wording: "x", since: "2026-02-01", by: who, viewer: MACHINE });   /* the control plane stamps a credential's class as its viewer */
    rowOk(r, "MACHINE_CANNOT_POST_NOTICE");
  }
  assert.equal((await prepare(w)).ok, true);
});

test("R1 R24 `by` not an owner of the project is NOTICE_NOT_THE_OWNER", async () => {
  const w = seeded();
  await refusedThenAccepted(w, () => prepare(w, {}, "carol"), () => prepare(w, {}, "bob"), "NOTICE_NOT_THE_OWNER");
});

test("R1 R11 a closed project is NOTICE_PROJECT_CLOSED, unless the call stops its open notice", async () => {
  const w = seeded();
  const posted = await post(w);
  w.close(w.P);
  await refusedThenAccepted(w, () => prepare(w, { notice: posted.notice, wording: "changed" }),
                            () => prepare(w, { notice: posted.notice, final: "stopped", handoff: "Taken up by another group" }),
                            "NOTICE_PROJECT_CLOSED");
  rowOk(await prepare(w), "NOTICE_PROJECT_CLOSED");   /* a first notice of a closed project */
});

test("R1 no group slug recorded is NOTICE_NO_GROUP_SLUG: there are no anonymous notices", async () => {
  const bare = world({ slug: null });
  bare.member("alice");
  bare.P = bare.project("budget", "alice");
  rowOk(await prepare(bare), "NOTICE_NO_GROUP_SLUG");
  const w = seeded();
  assert.equal((await prepare(w)).ok, true);
});

test("R1 no instance key bound is NOTICE_NO_INSTANCE_KEY", async () => {
  const bare = world({ key: false });
  bare.member("alice");
  bare.P = bare.project("budget", "alice");
  const before = bare.snapshot();
  rowOk(await prepare(bare), "NOTICE_NO_INSTANCE_KEY");
  assert.deepEqual(bare.snapshot(), before);
  assert.equal((await prepare(seeded())).ok, true);
});

test("R1 wording, body, matter and handoff out of shape are NOTICE_WORDING_MALFORMED", async () => {
  const w = seeded();
  const bad = [{ wording: "" }, { wording: "two\nlines" }, { wording: "x".repeat(281) }, { body: "y".repeat(121) },
               { matter: "a\nb" }, { body: "a\rb" }, { handoff: "not stopping" },
               { final: "stopped", handoff: "z".repeat(281) }];
  for (const x of bad) rowOk(await prepare(w, x), "NOTICE_WORDING_MALFORMED");
  /* controls: at the bounds */
  for (const x of [{ wording: "x".repeat(280) }, { body: "y".repeat(120), matter: "m".repeat(120) }])
    assert.equal((await prepare(w, x)).ok, true);
});

test("R1 R27 a `since` that is not a date, back-dated before the project, or in the future is refused", async () => {
  const w = seeded();
  for (const since of ["2026-02-30", "yesterday", "2026-2-1", null]) rowOk(await prepare(w, { since }), "NOTICE_SINCE_MALFORMED");
  const back = await refusedThenAccepted(w, () => prepare(w, { since: "2026-01-04" }), () => prepare(w, { since: "2026-01-05" }),
                                         "NOTICE_SINCE_BEFORE_PROJECT");
  assert.equal(back.project_created, "2026-01-05");
  assert.match(back.detail, /2026-01-05/);
  await refusedThenAccepted(w, () => prepare(w, { since: day(NOW + DAY) }), () => prepare(w, { since: day(NOW) }),
                            "NOTICE_SINCE_IN_FUTURE");
});

test("R1 a first revision while the project has an open notice is NOTICE_ALREADY_OPEN, naming it; a change is a new revision of it", async () => {
  const w = seeded();
  const p = await post(w);
  const r = await refusedThenAccepted(w, () => prepare(w, { wording: "another" }),
                                      () => prepare(w, { notice: p.notice, wording: "another" }), "NOTICE_ALREADY_OPEN");
  assert.equal(r.notice, p.notice);
});

test("R1 refusals come in R1's order: a call breaking several conditions is answered by the earliest", async () => {
  const w = seeded();
  rowOk(await w.nn.prepareNotice({ project: w.P, wording: "", since: "x", by: V("carol"), viewer: V("carol") }), "NOTICE_NOT_THE_OWNER");
  rowOk(await prepare(w, { wording: "", since: "x" }), "NOTICE_WORDING_MALFORMED");
  rowOk(await prepare(w, { since: "2025-01-01" }), "NOTICE_SINCE_BEFORE_PROJECT");
  assert.equal((await w.nn.prepareNotice({ project: null, by: MACHINE })).reason, "REQUIRED_ARGUMENT_MISSING");
});

test("R2 the answer is the revision that would be published, with its digest, statement, warning, caution and expiry, and nothing changes", async () => {
  const w = seeded();
  const before = w.snapshot(), manifest = w.count("manifest");
  const r = await prepare(w, { body: "transfers", matter: "the fund" });
  assert.deepEqual(Object.keys(r).sort(), ["caution", "digest", "expires", "ok", "revision", "statement", "warning"]);
  const rev = JSON.parse(r.revision);
  assert.equal(r.revision, canonicalJson(rev), "canonical JSON");
  assert.equal(r.digest, sha(r.revision));
  assert.equal(r.statement, Buffer.from(noticeStatement(rev.notice, rev.revision, r.digest)).toString("utf8"));
  assert.deepEqual(r.warning, OUTWARD_ACT_WARNING);
  assert.equal(r.caution, null);
  assert.equal(r.expires, new Date(NOW + 3600000).toISOString().replace(/\.\d{3}Z$/, "Z"));
  assert.deepEqual(w.snapshot(), before, "this module's tables unchanged");
  assert.equal(w.count("manifest"), manifest, "no record written");
  /* the same inputs on the same day answer byte for byte */
  assert.equal(JSON.stringify(await prepare(w, { body: "transfers", matter: "the fund" })), JSON.stringify(r));
  w.clock.now += 60000;
  assert.equal(JSON.stringify(await prepare(w, { body: "transfers", matter: "the fund" })), JSON.stringify(r));
});

test("R2 the caution names two open notices with no published case edition, never refuses, and is null once the group has published", async () => {
  const w = seeded();
  w.R = w.project("third", "alice");
  await post(w);
  assert.equal((await prepare(w, { project: w.Q }, "dave")).caution, null, "one open notice: no caution");
  await post(w, { project: w.Q }, "dave");
  const third = await prepare(w, { project: w.R });
  assert.equal(third.ok, true);
  assert.equal(third.caution, CAUTION_TWO_OPEN);
  /* posting anyway is accepted */
  const r = await post(w, { project: w.R });
  assert.equal(r.ok, true);
  w.publish(w.P, "CASE-2026-0001-x");
  w.S = w.project("fourth", "alice");
  assert.equal((await prepare(w, { project: w.S })).caution, null, "published work: no caution");
});

test("R3 a revision carries exactly its fields, absent ones omitted, collaborate with its doorbell, and never a member", async () => {
  const w = seeded();
  const plain = JSON.parse((await prepare(w)).revision);
  assert.deepEqual(Object.keys(plain).sort(), ["collaborate", "format", "group", "notice", "others_welcome", "posted", "previous",
    "revision", "since", "status", "wording"]);
  assert.equal(plain.format, NOTICE_FORMAT);
  assert.equal(plain.group, "test-group");
  assert.match(plain.notice, /^NOTE-2026-\d{4}$/);
  assert.notEqual(plain.notice, w.P);
  assert.equal(plain.revision, 1);
  assert.equal(plain.previous, null);
  assert.equal(plain.collaborate, false);
  assert.equal(plain.status, "open");
  assert.equal(plain.posted, day(NOW));
  assert.equal(plain.others_welcome, OTHERS_WELCOME);
  const full = JSON.parse((await prepare(w, { body: "b", matter: "m", collaborate: true })).revision);
  assert.equal(full.collaborate, true);
  assert.equal(full.doorbell, DOORBELL_PATH);
  assert.equal(full.body, "b");
  assert.equal(full.matter, "m");
  assert.equal(JSON.parse((await prepare(w, { collaborate: "yes" })).revision).collaborate, false, "true only when chosen");
  for (const r of [plain, full]) assert.doesNotMatch(JSON.stringify(r), /alice|h_alice|Cover|member:/);
  /* never filled in from the project's contents */
  assert.equal(full.wording, "Tracing the budget transfers");
  /* a stop carries status stopped and its handoff */
  const p = await post(w);
  const stop = JSON.parse((await prepare(w, { notice: p.notice, final: "stopped", handoff: "See the other group" })).revision);
  assert.equal(stop.status, "stopped");
  assert.equal(stop.handoff, "See the other group");
  assert.equal(stop.previous, p.prepared.digest);
});

test("R27 every stored revision's since lies between the project's creation and the day it was signed", async () => {
  const w = seeded();
  const p = await post(w, { since: "2026-01-05" });
  await post(w, { notice: p.notice, since: day(NOW) });
  for (const r of w.rows(`SELECT json FROM nn_revisions`)) {
    const j = JSON.parse(r.json);
    assert.ok(j.since >= "2026-01-05" && j.since <= j.posted, JSON.stringify(j));
  }
});
