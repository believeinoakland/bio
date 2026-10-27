/* R1, R2: a legacy or macro Office file, or an RTF, converted by LibreOffice to the open format the existing readers
 * take. Each conversion runs in a fresh, private profile that disables every macro (Basic, VBA, scripts), never updates
 * a link and disables active content (OLE, DDE); the container itself has no network. The profile and the copies are
 * removed when the conversion ends: the container keeps nothing (R8). */
import { mkdtempSync, writeFileSync, readFileSync, readdirSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { run } from './run.mjs';

/* The private profile's settings (LibreOffice's registry): macros off and at the highest security level, active
 * content off, links never updated in Writer (2 = never) and Calc (1 = never), and every link from a document outside the
 * trusted locations blocked (BlockUntrustedRefererLinks: without it LibreOffice fetches a linked picture on load). */
export const PROFILE_SETTINGS = `<?xml version="1.0" encoding="UTF-8"?>
<oor:items xmlns:oor="http://openoffice.org/2001/registry" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<item oor:path="/org.openoffice.Office.Common/Security/Scripting"><prop oor:name="DisableMacrosExecution" oor:op="fuse"><value>true</value></prop></item>
<item oor:path="/org.openoffice.Office.Common/Security/Scripting"><prop oor:name="MacroSecurityLevel" oor:op="fuse"><value>3</value></prop></item>
<item oor:path="/org.openoffice.Office.Common/Security/Scripting"><prop oor:name="DisableActiveContent" oor:op="fuse"><value>true</value></prop></item>
<item oor:path="/org.openoffice.Office.Common/Security/Scripting"><prop oor:name="BlockUntrustedRefererLinks" oor:op="fuse"><value>true</value></prop></item>
<item oor:path="/org.openoffice.Office.Writer/Content/Update"><prop oor:name="Link" oor:op="fuse"><value>2</value></prop></item>
<item oor:path="/org.openoffice.Office.Calc/Content/Update"><prop oor:name="Link" oor:op="fuse"><value>1</value></prop></item>
<item oor:path="/org.openoffice.Office.Common/Misc"><prop oor:name="FirstRun" oor:op="fuse"><value>false</value></prop></item>
</oor:items>
`;

/* the export filter of each open format */
const FILTERS = Object.freeze({
  docx: 'docx:MS Word 2007 XML',
  xlsx: 'xlsx:Calc MS Excel 2007 XML',
  pptx: 'pptx:Impress MS PowerPoint 2007 XML',
});

export const soffice = () => process.env.READER_SOFFICE || 'soffice';

/* bytes of `kind` → { ok: true, bytes } in format `to`, or { ok: false, code, why } */
export async function convert(bytes, kind, to, { timeMs } = {}) {
  const filter = FILTERS[to];
  if (!filter) return { ok: false, code: 'UNREADABLE', why: `filter:${to}` };
  const dir = mkdtempSync(join(tmpdir(), 'rc-convert-'));
  try {
    const profile = join(dir, 'profile');
    mkdirSync(join(profile, 'user'), { recursive: true });
    writeFileSync(join(profile, 'user', 'registrymodifications.xcu'), PROFILE_SETTINGS);
    const input = join(dir, `in.${kind}`);
    writeFileSync(input, bytes);
    const out = join(dir, 'out');
    mkdirSync(out);
    const r = await run(soffice(), [`-env:UserInstallation=file://${profile}`, '--headless', '--norestore', '--nolockcheck', '--nodefault',
      '--convert-to', filter, '--outdir', out, input], { timeMs, cwd: dir });
    const made = readdirSync(out).find((f) => f.endsWith(`.${to}`));
    if (!made) return { ok: false, code: 'UNREADABLE', why: (r.stderr || r.stdout || `exit ${r.status}`).toString().slice(0, 300) };
    return { ok: true, bytes: new Uint8Array(readFileSync(join(out, made))) };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
