#!/usr/bin/env node
// Runs the real LibreOffice and records each conversion it was asked for: its arguments and how many pages the PDF it made
// holds, in $SOFFICE_LOG. A `--version` is passed through unrecorded.
import { spawnSync, execFileSync } from 'node:child_process';
import { appendFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const r = spawnSync('soffice', args, { stdio: ['ignore', 'pipe', 'pipe'], env: process.env });
process.stdout.write(r.stdout); process.stderr.write(r.stderr);
const at = args.indexOf('--convert-to');
if (at >= 0 && process.env.SOFFICE_LOG) {
  const outdir = args[args.indexOf('--outdir') + 1];
  const pdf = join(outdir, 'source.pdf');
  let pages = 0;
  if (existsSync(pdf)) pages = Number((/^Pages:\s+(\d+)/m.exec(execFileSync('pdfinfo', [pdf]).toString()) || [])[1]) || 0;
  appendFileSync(process.env.SOFFICE_LOG, `${JSON.stringify({ convert: args[at + 1], outdir: outdir.split('/').pop(), pages })}\n`);
}
process.exit(r.status ?? 1);
