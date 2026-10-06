// The Worker that hosts the container (R12, R13): the Container Durable Object class `AgentRunner`, which agent-worker's
// `RUNNER` binding names. Each instance runs this module's image and passes every request it receives to the image's
// one port unchanged, the conversation's WebSocket upgrade included, so R1–R6 answer exactly as the image answers
// them. It adds no route or answer of its own (no default export), holds no credential and passes the image no
// environment (R8), and has no binding but its own class's.
//
// R10's egress is applied here from the member's own configuration (`fleet-member.json` `egress`): the container has
// no internet but the listed hosts, and its HTTPS goes through Cloudflare's outbound interception, whose CA the image
// trusts (`Dockerfile`, NODE_EXTRA_CA_CERTS).
import { Container, ContainerProxy } from '@cloudflare/containers';
import member from '../fleet-member.json' with { type: 'json' };

// The library's outbound proxy, reachable only through `ctx.exports` (it is what applies `allowedHosts`).
export { ContainerProxy };

export class AgentRunner extends Container {
  defaultPort = member.image.port;
  // A conversation's instance (agent-model opens one per conversation) sleeps soon after its connection ends (R9).
  sleepAfter = '2m';
  enableInternet = false;
  allowedHosts = [...member.egress];
  interceptHttps = true;

  // Every request goes to the image's one port; a caller cannot pick another.
  async fetch(request) {
    return this.containerFetch(request, this.defaultPort);
  }
}
