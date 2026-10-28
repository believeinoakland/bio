#!/usr/bin/env node
// A stand-in converter for `soffice`: answers the PDF of the pages it was asked for of a source that says how long it is,
// so a test chooses what the converter returns (a document of n pages, whether it honours the `PageRange` it is given).
// The source holds `PAGES:<n>` (and `IGNORE_RANGE` when the converter is to ignore the range and convert everything).
// Each conversion is recorded in $SOFFICE_LOG as `{convert, outdir, pages, settings}`.
import { readFileSync, writeFileSync, mkdirSync, appendFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
if (args.includes('--version')) { console.log('LibreOffice 7.4.7.2 40(Build:2)'); process.exit(0); }
const spec = args[args.indexOf('--convert-to') + 1];
const outdir = args[args.indexOf('--outdir') + 1];
const profile = (args.find((a) => a.startsWith('-env:UserInstallation=file://')) || '').slice('-env:UserInstallation=file://'.length);
const xcu = join(profile, 'user', 'registrymodifications.xcu');
const settings = profile && existsSync(xcu) ? readFileSync(xcu, 'utf8') : null;
const source = readFileSync(args[args.length - 1]).toString('latin1');
const n = Number((/PAGES:(\d+)/.exec(source) || [])[1]);
const range = /"value":"(\d+)-(\d+)"/.exec(spec);
const pages = /IGNORE_RANGE/.test(source) || !range ? n : Math.max(0, Math.min(n, Number(range[2])) - Number(range[1]) + 1);
const objs = ['<< /Type /Catalog /Pages 2 0 R >>', `<< /Type /Pages /Kids [${Array.from({ length: pages }, (_, i) => `${3 + 2 * i} 0 R`).join(' ')}] /Count ${pages} >>`];
for (let i = 0; i < pages; i++) {
  objs.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 200] /Contents ${4 + 2 * i} 0 R /Resources << >> >>`);
  const text = `0 0 300 200 re S BT /F1 12 Tf 20 100 Td (page ${i + 1}) Tj ET`;
  objs.push(`<< /Length ${text.length} >>\nstream\n${text}\nendstream`);
}
let pdf = '%PDF-1.4\n';
const offsets = objs.map((o, i) => { const at = pdf.length; pdf += `${i + 1} 0 obj\n${o}\nendobj\n`; return at; });
const xref = pdf.length;
pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
mkdirSync(outdir, { recursive: true });
if (pages) writeFileSync(join(outdir, 'source.pdf'), pdf, 'latin1');
if (process.env.SOFFICE_LOG) appendFileSync(process.env.SOFFICE_LOG, `${JSON.stringify({ convert: spec, outdir: outdir.split('/').pop(), pages, settings })}\n`);
