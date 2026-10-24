import '../../../bio-plane/test/sandbox.mjs';
// Imported first by a test file whose renderer converts with the stand-in (stubs/fake-soffice.mjs): the image's server reads SOFFICE when it loads.
// It runs LibreOffice with only PATH and HOME, so the recorder is a one-line shell script that carries the log's path.
import { chmodSync, mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const recorder = new URL('./fake-soffice.mjs', import.meta.url).pathname;
chmodSync(recorder, 0o755);
const dir = mkdtempSync(join(tmpdir(), 'soffice-'));
const log = join(dir, 'conversions.jsonl');
writeFileSync(log, '');
const wrapper = join(dir, 'soffice');
writeFileSync(wrapper, `#!/bin/sh\nSOFFICE_LOG='${log}' exec '${process.execPath}' '${recorder}' "$@"\n`);
chmodSync(wrapper, 0o755);
process.env.SOFFICE = wrapper;
/** The conversions made since the last call, each `{convert, outdir, pages}`. */
export const conversions = () => { const rows = readFileSync(log, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)); writeFileSync(log, ''); return rows; };
