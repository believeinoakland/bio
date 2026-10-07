/* The fleet member's Worker (R10): the plane reaches its default export through the `FILE_SCANNER` service binding,
 * and it hosts the two container classes, `FileScanner` (ClamAV) and `SafeViewRenderer`, each with no internet at all
 * (R12): the Worker hands them every byte they work on. Its scheduled trigger runs the daily mirror (R6). Its bindings:
 * `CAPTURES` (the group's bucket), `SCANNER` and `RENDERER` (the classes), and `SECURITY_VPC` (a Workers VPC binding,
 * absent unless the installer adds it for a tunnelled tool, R21). */
import { Container, ContainerProxy } from '@cloudflare/containers';
import member from '../fleet-member.json' with { type: 'json' };
import { handle } from './handler.mjs';
import { runMirror } from './clamav.mjs';
import { MEMBER_LIMITS_STATEMENT } from './limits.mjs';

export { ContainerProxy };

const classOf = (name) => member.classes.find((c) => c.class_name === name);

export class FileScanner extends Container {
  defaultPort = classOf('FileScanner').image.port;
  sleepAfter = '10m';
  enableInternet = false;
  async fetch(request) { return this.containerFetch(request, this.defaultPort); }
}

export class SafeViewRenderer extends Container {
  defaultPort = classOf('SafeViewRenderer').image.port;
  sleepAfter = '5m';
  enableInternet = false;
  async fetch(request) { return this.containerFetch(request, this.defaultPort); }
}

/** A class's one instance, as a `(path, init)` fetch. */
function container(ns, name) {
  if (!ns) return async () => { throw new Error('container not bound'); };
  return (path, init = {}) => ns.get(ns.idFromName(name)).fetch(new Request(`http://container${path}`, init));
}

async function socketConnect(address, options) {
  const { connect } = await import('cloudflare:sockets');
  return connect(address, options);
}

export function depsOf(env) {
  return {
    bucket: env.CAPTURES || null, scanner: container(env.SCANNER, 'file-scanner'), renderer: container(env.RENDERER, 'safe-view'),
    fetch: (req) => fetch(req), connect: socketConnect, vpc: env.SECURITY_VPC || null, now: () => Date.now(),
    version: env.VERSION,
  };
}

export default {
  // installer R39: the member's limits, stated in the bundle a release signs.
  limits: MEMBER_LIMITS_STATEMENT,
  fetch(request, env) {
    return handle(request, depsOf(env));
  },
  scheduled(event, env, ctx) {
    ctx.waitUntil(runMirror(depsOf(env)));
  },
};
