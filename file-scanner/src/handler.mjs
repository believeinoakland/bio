/* The member's surface (R1–R9, R19–R31), as the plane reaches it through its `FILE_SCANNER` binding. `handle` takes
 * the request and the member's dependencies (the bucket, the two images, the network, the clock), so the tests drive
 * it as the Worker does. */
import { BOUNDS } from './limits.mjs';
import { scan, mirror, signatureState } from './clamav.mjs';
import { render } from './render.mjs';
import { providerScan, sandboxSubmit, sandboxResult, providerCdr, providerReputation, providerRefresh, providerForward,
  providerTest, providersList } from './providers/routes.mjs';
import { reputationLists } from './providers/reputation.mjs';
import { PROVIDERS, REFUSED_PROVIDERS, HELD_PROVIDERS, CATALOGUE_READ_ON } from './providers/catalogue.mjs';
import scanner from '../packages-scanner.json' with { type: 'json' };
import renderer from '../packages-renderer.json' with { type: 'json' };

const reply = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
const UNKNOWN = () => reply(404, { ok: false, code: 'UNKNOWN' });
const versionOf = (list, name) => (list.packages.find((p) => p.name === name) || {}).version || 'not reported';

/** R8. */
async function version(deps) {
  return reply(200, { ok: true, name: 'file-scanner', version: deps.version || 'unknown',
    clamav_version: versionOf(scanner, 'clamav'),
    signatures: await signatureState(deps.bucket),
    providers: { catalogue_read_on: CATALOGUE_READ_ON, offered: PROVIDERS.map((d) => d.provider_id),
      refused: REFUSED_PROVIDERS.map((d) => d.provider_id), held: HELD_PROVIDERS.map((d) => d.provider_id) },
    reputation_lists: await reputationLists(deps.bucket),
    renderer_version: `libreoffice ${versionOf(renderer, 'libreoffice-core')}; poppler-utils ${versionOf(renderer, 'poppler-utils')}`,
    bounds: BOUNDS });
}

const POSTS = {
  '/scan': scan, '/render': render, '/provider/scan': providerScan, '/provider/sandbox': sandboxSubmit,
  '/provider/sandbox/result': sandboxResult, '/provider/cdr': providerCdr, '/provider/reputation': providerReputation,
  '/provider/refresh': providerRefresh, '/provider/forward': providerForward, '/provider/test': providerTest,
};

export async function handle(request, deps) {
  const { pathname } = new URL(request.url);
  if (request.method === 'GET' && pathname === '/version') return version(deps);
  if (request.method === 'GET' && pathname === '/providers') return providersList();
  if (request.method === 'POST' && pathname === '/mirror') return mirror(deps);
  const route = request.method === 'POST' && Object.hasOwn(POSTS, pathname) ? POSTS[pathname] : null;
  if (!route) return UNKNOWN();
  let body = null;
  try { body = await request.json(); } catch { body = null; }
  return route(deps, body && typeof body === 'object' && !Array.isArray(body) ? body : null);
}
