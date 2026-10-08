/* filing-templates: the grant digest's one channel (R27; N761, K2129, K2175), at the module's ops map. The control plane
   sets `secretSha` in the internal request's body (`control-plane` R64); a `secretSha` in the query is never read, so a
   digest there alone mints no grant and opens no door, and a call carrying it is answered exactly as the same call
   carrying none. `author`, `by` and `viewer` stay query stamps, never read from the body. One test per op. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, draft, V, MACHINE, TEXT, secret } from "./fixture.mjs";
import * as ft from "../../../src/filing-templates/index.mjs";

const A = V("alice"), B = V("bob");
const row = (c) => ft.FILING_TEMPLATE_CHECKS[c];
const op = (w, name, query, body = {}) =>
  ft.filingTemplatesOps(w.ft, new URL(`https://plane.example/op?${new URLSearchParams(query)}`), body)[name]();
const dead = JSON.stringify(ft.noTemplateGrant());
const same = (a, b, msg) => assert.equal(JSON.stringify(a), JSON.stringify(b), msg);

/* A draft in P with a live grant opened through the op, its digest in the body. */
function opened(w, s = "live") {
  const d = draft(w);
  const g = op(w, "templatereviewgrant", { author: A, viewer: A }, { version: d.version, recipient: "Pat Lawyer",
                                                                      organisation: "Legal Aid (test)", secretSha: secret(s) });
  assert.equal(g.ok, true, JSON.stringify(g));
  return { ...d, grant: g.grant };
}

test("R27 templatereviewgrant takes the new grant's secretSha from the body only: a digest only in the query is refused GRANT_NO_SECRET, writing nothing, as a call carrying none; with both, the body's is the grant's; by and viewer stay query stamps", () => {
  const w = seeded();
  const d = draft(w);
  const ask = (query, body = {}) => op(w, "templatereviewgrant", { author: A, viewer: A, ...query },
                                       { version: d.version, recipient: "R", organisation: "O", ...body });
  /* only in the query: refused, nothing written, byte-identical to the call with no digest at all */
  const before = w.snapshot();
  const onlyQuery = ask({ secretSha: secret("q") });
  assert.deepEqual([onlyQuery.ok, onlyQuery.reason, onlyQuery.check, onlyQuery.translation],
                   [false, "GRANT_NO_SECRET", row("GRANT_NO_SECRET").check, row("GRANT_NO_SECRET").translation]);
  same(onlyQuery, ask({}), "answered as the call carrying no secretSha");
  assert.deepEqual(w.snapshot(), before, "a query digest alone mints nothing");
  /* negative control: in the body it mints the grant, and that digest opens the door */
  const ok = ask({}, { secretSha: secret("b") });
  assert.equal(ok.ok, true, JSON.stringify(ok));
  assert.equal(w.rows(`SELECT secret_sha FROM tpl_grants`)[0].secret_sha, secret("b"));
  assert.equal(w.ft.templateRead({ secretSha: secret("b") }).version.id, d.version);
  /* both: the body's digest is the grant's; the query's is never read and opens nothing */
  const both = ask({ secretSha: secret("q2") }, { secretSha: secret("b2") });
  assert.equal(both.ok, true);
  assert.deepEqual(w.rows(`SELECT secret_sha FROM tpl_grants ORDER BY at, grant_id`).map((r) => r.secret_sha).sort(),
                   [secret("b"), secret("b2")].sort());
  same(w.ft.templateRead({ secretSha: secret("q2") }), JSON.parse(dead));
  /* by (the query's author) and viewer stay query stamps: a body's author, by or viewer is never honoured */
  const m = op(w, "templatereviewgrant", { author: MACHINE, viewer: MACHINE },
               { version: d.version, recipient: "R", organisation: "O", secretSha: secret("m"), author: A, by: A, viewer: A });
  assert.equal(m.reason, "MACHINE_CANNOT_DRAFT_TEMPLATE");
  const anon = op(w, "templatereviewgrant", {}, { version: d.version, recipient: "R", organisation: "O", secretSha: secret("m"), author: A, by: A });
  assert.equal(anon.reason, "MACHINE_CANNOT_DRAFT_TEMPLATE", "an unstamped call carries nobody, whatever its body says");
});

test("R27 templatereview's grant door takes secretSha from the body only: a live digest only in the query opens no door and is answered as the call carrying none; with both, the body's decides", () => {
  const w = seeded();
  const d = opened(w);
  w.ft.templateSubmit({ version: d.version, reviewers: ["frank"], author: A, viewer: A });
  const rv = (query, body = {}) => op(w, "templatereview", query, { version: d.version, outcome: "no_concerns", scope: "s", ...body });
  /* a stranger with the live digest only in the query: as one with none (unstamped, refused by shape), nothing written */
  const before = w.snapshot();
  const stranger = rv({ secretSha: secret("live") });
  same(stranger, rv({}), "as the call carrying no secretSha");
  assert.equal(stranger.reason, "MACHINE_CANNOT_REVIEW_TEMPLATE");
  assert.deepEqual(w.snapshot(), before, "no review recorded");
  /* a member with the live digest only in the query: answered as the member's own call, a member's review */
  const member = rv({ secretSha: secret("live"), author: B, viewer: B });
  assert.deepEqual([member.ok, member.review.kind, member.review.reviewer.id], [true, "member", "bob"]);
  const plain = rv({ author: B, viewer: B });
  same({ ...member }, { ...plain }, "the same answer as without it");
  assert.equal(w.rows(`SELECT 1 FROM tpl_reviews WHERE kind='professional'`).length, 0, "the grant reviewed nothing");
  /* negative control: in the body it is the grant's review */
  const pro = rv({}, { secretSha: secret("live") });
  assert.deepEqual([pro.ok, pro.review.kind, pro.review.reviewer.name], [true, "professional", "Pat Lawyer"]);
  /* both: the body decides; a dead body digest is the dead answer, a live query digest notwithstanding */
  same(rv({ secretSha: secret("live") }, { secretSha: secret("never") }), JSON.parse(dead));
  assert.equal(rv({ secretSha: secret("never") }, { secretSha: secret("live") }).review.kind, "professional");
  /* author and viewer stay query stamps: a body's author is never honoured */
  assert.equal(rv({}, { author: B, viewer: B }).reason, "MACHINE_CANNOT_REVIEW_TEMPLATE");
});

test("R27 templatecomment's grant door takes secretSha from the body only: a live digest only in the query opens no door and is answered as the call carrying none; with both, the body's decides", () => {
  const w = seeded();
  const d = opened(w);
  const c = (query, body = {}) => op(w, "templatecomment", query, { template: d.template, version: d.version, text: "note", ...body });
  const before = w.snapshot();
  const stranger = c({ secretSha: secret("live") });
  same(stranger, c({}), "as the call carrying no secretSha");
  assert.equal(stranger.reason, "NO_SUCH_TEMPLATE", "a stranger sees no template");
  assert.deepEqual(w.snapshot(), before, "no comment recorded");
  /* a member with the live digest only in the query: the member's comment, exactly as without it */
  const member = c({ secretSha: secret("live"), author: B, viewer: B });
  same(member, c({ author: B, viewer: B }));
  assert.deepEqual(member.comment.by, { kind: "member", id: "bob", name: "h_bob" });
  assert.equal(w.rows(`SELECT 1 FROM tpl_comments WHERE kind='grant'`).length, 0, "the grant wrote nothing");
  /* negative control: in the body it is the grant's comment */
  const g = c({}, { secretSha: secret("live") });
  assert.deepEqual([g.ok, g.comment.by.kind, g.comment.by.name], [true, "grant", "Pat Lawyer"]);
  same(c({ secretSha: secret("live") }, { secretSha: secret("never") }), JSON.parse(dead));
  assert.equal(c({ secretSha: secret("never") }, { secretSha: secret("live") }).comment.by.kind, "grant");
  assert.equal(c({ viewer: B }, { author: B }).reason, "COMMENT_REFUSED", "a body's author is never honoured: the call carries nobody");
});

test("R27 templatecomments' grant door takes secretSha from the body only, its arguments too (control-plane R59's POST): a live digest only in the query opens no door and is answered as the call carrying none; with both, the body's decides", () => {
  const w = seeded();
  const d = opened(w);
  w.ft.templateComment({ template: d.template, version: d.version, text: "first", author: B, viewer: B });
  const cs = (query, body = {}) => op(w, "templatecomments", query, body);
  /* a stranger with the live digest only in the query: as one with none */
  const stranger = cs({ secretSha: secret("live") });
  same(stranger, cs({}), "as the call carrying no secretSha");
  assert.equal(stranger.reason, "NO_SUCH_TEMPLATE");
  same(cs({ secretSha: secret("live"), template: d.template }), cs({ template: d.template }));
  /* a member with it only in the query: the member's read, exactly as without it */
  same(cs({ secretSha: secret("live"), viewer: A }, { template: d.template }), cs({ viewer: A }, { template: d.template }));
  /* negative control: in the body, the grant's own version's comments */
  const g = cs({}, { secretSha: secret("live") });
  assert.deepEqual([g.ok, g.version, g.comments.map((x) => x.text)], [true, d.version, ["first"]]);
  same(cs({ secretSha: secret("live") }, { secretSha: secret("never") }), JSON.parse(dead));
  assert.equal(cs({ secretSha: secret("never") }, { secretSha: secret("live") }).ok, true);
  /* the body's arguments are read on the door and by a member alike (a POST); the query's still are (a GET) */
  assert.equal(cs({}, { secretSha: secret("live"), template: d.template, version: d.version, limit: 1 }).limit, 1);
  same(cs({}, { secretSha: secret("live"), version: `${d.template}@9` }), JSON.parse(dead), "another version, through the door: dead");
  assert.equal(cs({ viewer: A }, { template: d.template, limit: 1 }).limit, 1);
  assert.equal(cs({ viewer: A, template: d.template }).comments.length, 1);
  assert.equal(cs({}, { template: d.template, viewer: A }).reason, "NO_SUCH_TEMPLATE", "a body's viewer is never honoured");
});

test("R27 templateread's grant door takes secretSha from the body only, its arguments too (control-plane R59's POST): a live digest only in the query opens no door and is answered as the call carrying none; with both, the body's decides", () => {
  const w = seeded();
  const d = opened(w);
  const rd = (query, body = {}) => op(w, "templateread", query, body);
  const stranger = rd({ secretSha: secret("live") });
  same(stranger, rd({}), "as the call carrying no secretSha");
  assert.equal(stranger.reason, "NO_SUCH_TEMPLATE");
  same(rd({ secretSha: secret("live"), template: d.template }), rd({ template: d.template }));
  same(rd({ secretSha: secret("live"), viewer: A }, { template: d.template }), rd({ viewer: A }, { template: d.template }),
       "a member with it only in the query: the member's read");
  /* negative control: in the body, the grant's own version */
  const g = rd({}, { secretSha: secret("live") });
  assert.deepEqual([g.ok, g.version.id, g.version.text], [true, d.version, TEXT]);
  same(rd({ secretSha: secret("live") }, { secretSha: secret("never") }), JSON.parse(dead));
  assert.equal(rd({ secretSha: secret("never") }, { secretSha: secret("live") }).version.id, d.version);
  /* the body's arguments, on the door and for a member; the query's still read */
  assert.equal(rd({}, { secretSha: secret("live"), template: d.template, version: d.version }).version.id, d.version);
  const other = draft(w, { name: "Other" });
  same(rd({}, { secretSha: secret("live"), template: other.template }), JSON.parse(dead), "another template, through the door: dead");
  assert.equal(rd({ viewer: A }, { template: other.template }).version.id, other.version);
  assert.equal(rd({ viewer: A, template: other.template }).version.id, other.version);
  assert.equal(rd({}, { template: d.template, viewer: A }).reason, "NO_SUCH_TEMPLATE", "a body's viewer is never honoured");
});
