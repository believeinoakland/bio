#!/usr/bin/env node
// A stand-in for `clamscan` (the build machine has none), driven by each target's own bytes so a test chooses what ClamAV
// "says": it prints clamscan's output lines for every target, and records the flags it was run with in $FAKE_CLAMSCAN_LOG.
//   FAKE:FOUND:<name>;  `<path>: <name> FOUND`            FAKE:LIMIT:<Name>   `Heuristics.Limits.Exceeded.<Name> FOUND`
//   FAKE:ENC:<Type>     `Heuristics.Encrypted.<Type> FOUND`   /Encrypt   `Heuristics.Encrypted.PDF FOUND` (a PDF ClamAV cannot decrypt)
//   FAKE:HANG           never answers (a scan past its time)  anything else   `<path>: OK`
import { readFileSync, appendFileSync } from 'node:fs';

const args = process.argv.slice(2);
if (args.includes('--version')) { console.log('ClamAV 1.4.3/27800/Mon Oct  6 08:21:00 2026'); process.exit(0); }
const flags = args.filter((a) => a.startsWith('--'));
const files = args.filter((a) => !a.startsWith('--'));
if (process.env.FAKE_CLAMSCAN_LOG) appendFileSync(process.env.FAKE_CLAMSCAN_LOG, `${JSON.stringify({ flags, files: files.length })}\n`);
for (const f of files) {
  const text = readFileSync(f).toString('latin1');
  let m;
  if (text.includes('FAKE:HANG')) await new Promise((done) => setTimeout(done, 120_000));
  else if ((m = /FAKE:FOUND:([A-Za-z0-9.-]+);/.exec(text))) console.log(`${f}: ${m[1]} FOUND`);
  else if ((m = /FAKE:LIMIT:([A-Za-z]+)/.exec(text))) console.log(`${f}: Heuristics.Limits.Exceeded.${m[1]} FOUND`);
  else if ((m = /FAKE:ENC:([A-Za-z0-9]+)/.exec(text))) console.log(`${f}: Heuristics.Encrypted.${m[1]} FOUND`);
  else if (text.includes('/Encrypt')) console.log(`${f}: Heuristics.Encrypted.PDF FOUND`);
  else console.log(`${f}: OK`);
}
