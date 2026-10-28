/* mail-door's test fixture: capture's own (a Durable Object storage stand-in over node:sqlite with record-core's,
   membership's and credentials' tables, provenance's read contract and an evidence bucket; `test/m/capture/fixture.mjs`,
   capture being earlier in the order), with this module's instance made over the same storage and capture's instance,
   and the composition's settings (`deps.settings()`, instance-setup R114) as a value the test may change. Messages are
   mail-reader's test inputs (`test/m/mail-reader/fixtures.mjs`), generated when the test runs. */
import { fresh as captureFresh, bucket } from "../capture/fixture.mjs";
import { mailDoorOf } from "../../../src/mail-door/index.mjs";
import { eml, STANDARD } from "../mail-reader/fixtures.mjs";
export { sha, bucket } from "../capture/fixture.mjs";
export { eml, STANDARD, withAttachments, rfc822Part, attachmentPart } from "../mail-reader/fixtures.mjs";

export const DOMAIN = "mail.example.org";

/* A fresh mail door over a fresh store: the door on with a domain unless `on`/`domain` say otherwise. */
export function fresh({ on = true, domain = DOMAIN, env = {}, evidence = undefined } = {}) {
  const b = evidence === undefined ? bucket() : evidence;
  const f = captureFresh({ evidence: b, env: { INSTANCE_NAME: "inst", ...env } });
  const settings = { mail_domain: domain, mail_door: on };
  const d = mailDoorOf({ storage: f.s }, { capture: f.c, settings: () => settings });
  /* every table and row this store holds, to show an act wrote nothing */
  const everything = () => f.rows(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`).map((r) => r.name)
    .filter((t) => t !== "mail_tally").map((t) => [t, JSON.stringify(f.rows(`SELECT * FROM ${t}`))]);
  return { ...f, cap: f.c, d, b, settings, everything };
}

/* A plain message whose body is `text`. */
export const plain = (text = "hello", headers = STANDARD) => eml(headers, text);

/* A member's live private address. */
export async function addressFor(d, member) {
  const a = await d.mailAddressMake({ by: `member:${member}` });
  if (!a.ok) throw new Error(`addressFor: ${JSON.stringify(a)}`);
  return a.address;
}

/* A stream of `bytes` in `chunk`-byte pieces that counts what it handed out and whether it was cancelled. */
export function countingStream(bytes, chunk = 1024) {
  const seen = { pulled: 0, cancelled: false };
  let at = 0;
  const stream = new ReadableStream({
    pull(c) { if (at >= bytes.length) { c.close(); return; } const piece = bytes.subarray(at, at + chunk); at += piece.length; seen.pulled += piece.length; c.enqueue(piece); },
    cancel() { seen.cancelled = true; },
  }, { highWaterMark: 0 });
  return { stream, seen };
}

export const DAY = 86400000, HOUR = 3600000;
export const T0 = Date.parse("2026-10-06T12:00:00Z");
