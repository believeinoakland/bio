import '../../../bio-plane/test/sandbox.mjs';
// Imported first by a test file that renders through LibreOffice 7.4.7's loading limits (stubs/soffice-74.mjs): the image's
// server reads SOFFICE when it loads, and runs the converter with only PATH and HOME, so the stand-in is a one-line script.
import { chmodSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const stub = new URL('./soffice-74.mjs', import.meta.url).pathname;
chmodSync(stub, 0o755);
const wrapper = join(mkdtempSync(join(tmpdir(), 'soffice74-')), 'soffice');
writeFileSync(wrapper, `#!/bin/sh\nexec '${process.execPath}' '${stub}' "$@"\n`);
chmodSync(wrapper, 0o755);
process.env.SOFFICE = wrapper;
