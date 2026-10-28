# reader-container's image (R1-R5, R8): LibreOffice for conversion, ImageMagick with libheif and OpenJPEG for pictures,
# ExifTool for a picture's facts, 7-Zip, bzip2 and xz for archives; its server is container/server.mjs.
# Build (the release; never in a session, K1898): docker build --platform linux/amd64 -f Dockerfile -t <repository>:<version> reader-container
# The base is pinned by digest, as file-scanner's (node:22-bookworm-slim, linux/amd64, read 2026-10-06). The packages are
# those packages.json names, from the dated Debian snapshot; their versions are pinned by the release that first builds
# the image (packages.json `version` null until then, as a member's image digest is).
FROM node:22-bookworm-slim@sha256:efd0ab5780c2d9ab1f0f869571a00d5edb17793bff4cce4a2792e3eb0ffc7562
RUN mkdir -p /etc/ssl/certs \
 && node -e "process.stdout.write(require('tls').rootCertificates.join('\n') + '\n')" > /etc/ssl/certs/ca-certificates.crt \
 && rm -f /etc/apt/sources.list.d/debian.sources \
 && echo "deb [check-valid-until=no] https://snapshot.debian.org/archive/debian/20261006T000000Z bookworm main" > /etc/apt/sources.list.d/snapshot.list \
 && echo "deb [check-valid-until=no] https://snapshot.debian.org/archive/debian-security/20261006T000000Z bookworm-security main" >> /etc/apt/sources.list.d/snapshot.list \
 && apt-get update \
 && apt-get install -y --no-install-recommends \
      libreoffice-core libreoffice-writer libreoffice-calc libreoffice-impress fonts-dejavu-core fonts-liberation2 \
      imagemagick libheif1 libopenjp2-7 libimage-exiftool-perl p7zip-full bzip2 xz-utils \
 && rm -rf /var/lib/apt/lists/*
# Each request runs in its own temporary directory, removed when it ends; LibreOffice runs with a private profile that
# disables every macro and link update (container/convert.mjs). The container has no network.
ENV NODE_ENV=production PORT=8080
WORKDIR /app
COPY src/records.mjs ./src/
COPY container/ ./container/
USER node
EXPOSE 8080
CMD ["node", "container/server.mjs"]
