/* mail-door R13: every refusal this module raises has its C-157 row and its words by key; the codes it relays are
   another module's rows. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { MAIL_CHECKS, rowOf } from "../../../src/mail-door/checks.mjs";
import { fresh, addressFor, plain } from "./fixture.mjs";

const RAISED = ["MAIL_OFF", "MAIL_NOT_SET_UP", "MAIL_NO_SUCH_ADDRESS", "MAIL_TOO_LARGE", "MAIL_EMPTY", "MAIL_RATE_MEMBER", "MAIL_RATE_TEAM", "MAIL_ALREADY_IN", "NO_SUCH_MAIL"];

test("R13 the table holds one C-157 row for each code mail-door raises, and no relayed code", () => {
  assert.deepEqual(Object.keys(MAIL_CHECKS).sort(), [...RAISED].sort());
  const ids = Object.values(MAIL_CHECKS).map((r) => r.check);
  assert.equal(new Set(ids).size, RAISED.length);
  for (const id of ids) assert.match(id, /^C-157\.\d+$/);
  for (const code of ["MAIL_NO_STATEMENT", "MAIL_WITHIN_FAILED", "MAIL_TOO_NESTED"]) assert.equal(MAIL_CHECKS[code], undefined, `${code} is not this module's row`);
});

test("R13 each translation is read by key and names no figure; each row's where names the function and DEC-49 region that raises it", () => {
  const src = readFileSync(new URL("../../../src/mail-door/index.mjs", import.meta.url), "utf8");
  for (const [code, row] of Object.entries(MAIL_CHECKS)) {
    assert.equal(typeof row.translation, "string");
    assert.ok(row.translation.length > 20, code);
    assert.doesNotMatch(row.translation, /\d/, `${code}: no figure in the translation`);
    const [, fn, region] = /^src\/mail-door\/index\.mjs (\S+) > (\S+)$/.exec(row.where) || [];
    assert.ok(fn && region, `${code}: where`);
    const open = src.indexOf(`DEC-49 REGION ${region} */`), close = src.indexOf(`END DEC-49 REGION ${region} */`);
    assert.ok(open > 0 && close > open, `${code}: region ${region}`);
    assert.ok(src.slice(open, close).includes(`"${code}"`), `${code} is raised inside ${region}`);
  }
});

test("R13 each code answers its row, and a missing row fails loud; control: a present row reads its word", async () => {
  const { d } = fresh({ on: false });
  const r = await d.receiveMail({ raw: plain(), envelope_to: "x@y.org" });
  assert.deepEqual([r.code, r.check, r.translation], ["MAIL_OFF", MAIL_CHECKS.MAIL_OFF.check, MAIL_CHECKS.MAIL_OFF.translation]);
  const kept = MAIL_CHECKS.MAIL_OFF;
  delete MAIL_CHECKS.MAIL_OFF;
  try {
    await assert.rejects(() => d.receiveMail({ raw: plain(), envelope_to: "x@y.org" }), /MAIL_OFF has no MAIL_CHECKS row/);
    assert.throws(() => rowOf("MAIL_OFF"));
  } finally { MAIL_CHECKS.MAIL_OFF = kept; }
  assert.equal(rowOf("MAIL_OFF").translation, kept.translation);
});

test("R13 the rate refusals carry their figures in `stated` only", async () => {
  const { d } = fresh();
  const to = await addressFor(d, "ann");
  let r;
  for (let i = 0; i < 21; i++) r = await d.receiveMail({ raw: plain(`x${i}`), envelope_to: to, now: 1000 });
  assert.equal(r.code, "MAIL_RATE_MEMBER");
  assert.match(r.stated, /20/);
  assert.doesNotMatch(r.translation, /20/);
});
