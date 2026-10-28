# proto-mem/1f (THROWAWAY probe): the smallest image for P-M17's cold-start baseline: the SAME node base as reader-container (pinned by digest, as its Dockerfile) and one dependency-free server.
# Build context = this directory. No apt, no network at build beyond the base pull. No internet at run (the class sets enableInternet false).
FROM node:22-bookworm-slim@sha256:efd0ab5780c2d9ab1f0f869571a00d5edb17793bff4cce4a2792e3eb0ffc7562
WORKDIR /app
COPY server.mjs ./
ENV NODE_ENV=production PORT=8080
USER node
EXPOSE 8080
CMD ["node", "server.mjs"]
