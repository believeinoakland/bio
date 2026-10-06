# agent-runner: the container in which a member's own Claude account runs one model conversation (R1–R11).
# Build (the release, T33-D1): docker build --platform linux/amd64 -t <repository>:<version> agent-runner
# The image is then named only by its digest, which the release writes into fleet-member.json and wrangler.jsonc (R7, R13).
# The base is pinned by digest (R13): node:22-bookworm-slim, its linux/amd64 manifest as read on 2026-10-06.
FROM node:22-bookworm-slim@sha256:efd0ab5780c2d9ab1f0f869571a00d5edb17793bff4cce4a2792e3eb0ffc7562
# NODE_EXTRA_CA_CERTS: Cloudflare's container CA, through which the Worker applies R10's egress to HTTPS (src/worker.mjs).
ENV NODE_ENV=production PORT=8080 NODE_EXTRA_CA_CERTS=/etc/cloudflare/certs/cloudflare-containers-ca.crt
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY src/entry.mjs src/runner.mjs src/ws.mjs ./src/
# Nothing of the image is writable to the runner but the temporary directory each conversation makes and removes (R9).
USER node
EXPOSE 8080
CMD ["node", "src/entry.mjs"]
