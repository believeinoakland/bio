// The Worker that hosts the container (R12, R13): the Container Durable Object class `AgentRunner`, which agent-worker's
// `RUNNER` binding names. Each instance runs this module's image and passes every request it receives to the image's
// one port unchanged, the conversation's WebSocket upgrade included, so R1–R6 answer exactly as the image answers
// them. It adds no route or answer of its own, holds no credential and passes the image no environment (R8), and has
// no binding but its own class's. Its one exception is the default export (R15): wrangler builds a module without one
// as a service worker and refuses its Durable Object, so the Worker carries a `fetch` handler that answers R6's 404 to
// anything reaching it other than through the class, reading no body and reaching no container.
//
// R10's egress is applied here from the member's own configuration (`fleet-member.json` `egress`): the container has
// no internet but the listed hosts, and its HTTPS goes through Cloudflare's outbound interception, whose CA the image
// trusts (`Dockerfile`, NODE_EXTRA_CA_CERTS).
import { Container, ContainerProxy } from '@cloudflare/containers';
import member from '../fleet-member.json' with { type: 'json' };

const UNKNOWN = JSON.stringify({ ok: false, code: 'UNKNOWN' });

// The library's outbound proxy, reachable only through `ctx.exports` (it is what applies `allowedHosts`).
export { ContainerProxy };

export class AgentRunner extends Container {
  defaultPort = member.image.port;
  // A conversation's instance (agent-model opens one per conversation) sleeps soon after its connection ends (R9). A
  // member's own instance sleeps too, and its disk, the stored sign-in on it included, is fresh after: the loss shows
  // as R19's `connected: false` and R2's `NOT_SIGNED_IN` (K2200).
  sleepAfter = '2m';
  enableInternet = false;
  allowedHosts = [...member.egress];
  interceptHttps = true;

  // Every request goes to the image's one port; a caller cannot pick another.
  async fetch(request) {
    return this.containerFetch(request, this.defaultPort);
  }
}

// R15: the module's default export, so wrangler deploys the class and its container. It holds no state.
export default {
  fetch() {
    return new Response(UNKNOWN, { status: 404, headers: { 'content-type': 'application/json' } });
  },
};
