import '../../../bio-plane/test/sandbox.mjs';
// Imported first by a test file that scans with the stand-in `clamscan` (stubs/fake-clamscan.mjs): the image's server reads
// CLAMSCAN when it loads, so this runs before it does. The image runs `clamscan` with only PATH and HOME, so the stand-in
// is a one-line shell script that carries the log's path to the real one. The flags each run was given are in `FAKE_LOG`.
import { chmodSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const fake = new URL('./fake-clamscan.mjs', import.meta.url).pathname;
chmodSync(fake, 0o755);
const dir = mkdtempSync(join(tmpdir(), 'fake-clamscan-'));
export const FAKE_LOG = join(dir, 'runs.jsonl');
writeFileSync(FAKE_LOG, '');
const wrapper = join(dir, 'clamscan');
writeFileSync(wrapper, `#!/bin/sh\nFAKE_CLAMSCAN_LOG='${FAKE_LOG}' exec '${process.execPath}' '${fake}' "$@"\n`);
chmodSync(wrapper, 0o755);
process.env.CLAMSCAN = wrapper;
