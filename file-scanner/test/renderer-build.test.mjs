// R36 (T52 completion round; U5; amends R8): `renderer_version` names the SafeViewRenderer's own code beside its packages,
// so a renderer fix (a streamed docx the old build could not load) moves it and `file-safety` R59 tries a render again.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { handle, rendererBuild } from '../src/handler.mjs';
import { depsWith } from './helpers.mjs';

const marker = JSON.parse(readFileSync(new URL('../fleet-member.json', import.meta.url), 'utf8'));
const packages = JSON.parse(readFileSync(new URL('../packages-renderer.json', import.meta.url), 'utf8'));
const versionOfPackage = (name) => packages.packages.find((p) => p.name === name).version;
const withRenderer = (patch) => ({ ...marker, containers: marker.containers.map((c) => (c.class_name === 'SafeViewRenderer' ? { ...c, image: { ...c.image, ...patch } } : c)) });
const served = async () => (await (await handle(new Request('https://file-scanner/version'), depsWith())).json()).renderer_version;

test('R36 two renderer builds that differ only in their code answer different build names; the same build the same one', () => {
  const a = withRenderer({ digest: `sha256:${'a'.repeat(64)}` });
  const b = withRenderer({ digest: `sha256:${'b'.repeat(64)}` });
  assert.notEqual(rendererBuild(a), rendererBuild(b));
  assert.equal(rendererBuild(a), rendererBuild(structuredClone(a)));
  // before the release publishes a digest, the hash of the files the image is built from names it
  const c = withRenderer({ digest: null, source_sha256: 'c'.repeat(64) });
  const d = withRenderer({ digest: null, source_sha256: 'd'.repeat(64) });
  assert.notEqual(rendererBuild(c), rendererBuild(d));
  assert.equal(rendererBuild(withRenderer({ digest: null, source_sha256: undefined })), 'not reported');
});

test('R36 /version states the renderer build with the packages\' versions, the same on every call', async () => {
  const first = await served();
  assert.equal(first, await served());
  assert.ok(first.includes(versionOfPackage('libreoffice-core')), 'control: the packages\' versions still appear');
  assert.ok(first.includes(versionOfPackage('poppler-utils')));
  assert.ok(first.endsWith(rendererBuild()));
});
