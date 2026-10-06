# agent-runner: the container in which a member's own Claude account runs one model conversation (R1–R11).
# Build (the release, T33-D1): docker build --platform linux/amd64 -t <repository>:<version> agent-runner
# The image is then named only by its digest, which the release writes into fleet-member.json (R7).
FROM node:22-bookworm-slim
ENV NODE_ENV=production PORT=8080
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY src ./src
# Nothing of the image is writable to the runner but the temporary directory each conversation makes and removes (R9).
USER node
EXPOSE 8080
CMD ["node", "src/entry.mjs"]
