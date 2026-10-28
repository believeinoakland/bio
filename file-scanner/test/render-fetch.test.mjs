// R37 (T53; K5629; reader-container's finding): a render fetches nothing. A docx and an odt whose picture is linked to an
// address on a local test server are rendered by the image's real server and the real LibreOffice: no request reaches the
// address. Control: the same document converted with the profile's setting turned off makes the request.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { handle } from '../src/handler.mjs';
import { PROFILE_SETTINGS } from '../container/renderer.mjs';
import { makeZip } from '../../bio-plane/test/make-zip.mjs';
import { memoryBucket, putCapture, rendererImage, depsWith, post, rendererPresent } from './helpers.mjs';

const skip = !rendererPresent && 'LibreOffice and Poppler are not installed';

/** A local server that records each request path and answers a 1x1 PNG. */
async function listener() {
  const seen = [];
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  const server = createServer((req, res) => { seen.push(req.url); res.writeHead(200, { 'content-type': 'image/png' }); res.end(png); });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  server.unref();
  return { seen, server, url: (name) => `http://127.0.0.1:${server.address().port}/${name}` };
}

const ODT_MIME = 'application/vnd.oasis.opendocument.text';
const odt = (href) => makeZip([
  { name: 'mimetype', data: ODT_MIME, method: 0 },
  { name: 'META-INF/manifest.xml', method: 0, data: `<?xml version="1.0" encoding="UTF-8"?><manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2"><manifest:file-entry manifest:full-path="/" manifest:media-type="${ODT_MIME}"/><manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/></manifest:manifest>` },
  { name: 'content.xml', method: 0, data: `<?xml version="1.0" encoding="UTF-8"?><office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0" xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0" xmlns:xlink="http://www.w3.org/1999/xlink" office:version="1.2"><office:body><office:text><text:p>A linked picture<draw:frame draw:name="p" text:anchor-type="as-char" svg:width="2cm" svg:height="2cm"><draw:image xlink:href="${href}" xlink:type="simple" xlink:show="embed" xlink:actuate="onLoad"/></draw:frame></text:p></office:text></office:body></office:document-content>` },
]);

const docx = (href) => makeZip([
  { name: '[Content_Types].xml', method: 0, data: '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>' },
  { name: '_rels/.rels', method: 0, data: '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>' },
  { name: 'word/_rels/document.xml.rels', method: 0, data: `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId9" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="${href}" TargetMode="External"/></Relationships>` },
  { name: 'word/document.xml', method: 0, data: '<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body><w:p><w:r><w:t>A linked picture</w:t></w:r><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="720000" cy="720000"/><wp:docPr id="1" name="p"/><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="1" name="p"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:link="rId9"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="720000" cy="720000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p><w:sectPr/></w:body></w:document>' },
]);

/** The same conversion the image makes, in a private profile holding `settings`, not through the image. */
// Asynchronous: the listener lives in this process and must answer while the converter runs.
async function convertWith(settings, bytes, ext) {
  const dir = mkdtempSync(join(process.env.TMPDIR, 'fetch-'));
  mkdirSync(join(dir, 'profile', 'user'), { recursive: true });
  writeFileSync(join(dir, 'profile', 'user', 'registrymodifications.xcu'), settings);
  const src = join(dir, `in.${ext}`);
  writeFileSync(src, bytes);
  return promisify(execFile)('soffice', ['--headless', '--norestore', '--nolockcheck', '--nodefault', `-env:UserInstallation=file://${join(dir, 'profile')}`,
    '--convert-to', 'pdf', '--outdir', join(dir, 'out'), src], { env: { PATH: process.env.PATH, HOME: dir }, timeout: 120_000 });
}

for (const [kind, make] of [['docx', docx], ['odt', odt]]) {
  test(`R37 a ${kind} whose picture is linked to a local address is rendered with no request reaching it; control: with the setting off the request is made`, { skip }, async () => {
    const l = await listener();
    const bucket = memoryBucket();
    const image = await rendererImage();
    const deps = depsWith({ bucket, renderer: image.fetch });
    const r = await handle(post('/render', { store: 'bio', target: putCapture(bucket, make(l.url(`${kind}-rendered.png`))), route: 'office' }), deps);
    assert.equal(r.status, 200, r.status === 200 ? '' : JSON.stringify(await r.json()));
    await r.arrayBuffer();
    await new Promise((res) => setTimeout(res, 500));
    assert.deepEqual(l.seen, [], 'the render fetched nothing');

    // control: the converter does fetch the link when the setting is off, so the document does exercise it
    const off = PROFILE_SETTINGS.replace(/(BlockUntrustedRefererLinks" oor:op="fuse"><value>)true/, '$1false');
    assert.notEqual(off, PROFILE_SETTINGS);
    await convertWith(off, make(l.url(`${kind}-control.png`)), kind);
    assert.ok(l.seen.some((p) => p === `/${kind}-control.png`), `control: the request was made (${JSON.stringify(l.seen)})`);
    l.server.close();
  });
}
