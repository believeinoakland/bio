# reader-container's image (R1-R5, R8): LibreOffice for conversion, ImageMagick with libheif and OpenJPEG for pictures,
# ExifTool for a picture's facts, 7-Zip, bzip2 and xz for archives; its server is container/server.mjs.
# Build (the release; never in a session, K1898): docker build --platform linux/amd64 -f Dockerfile -t <repository>:<version> reader-container
# The base is pinned by digest, as file-scanner's (node:22-bookworm-slim, linux/amd64, read 2026-10-06). The packages are
# those packages.json states, pinned, from the dated Debian snapshots (bundler R27).
FROM node:22-bookworm-slim@sha256:efd0ab5780c2d9ab1f0f869571a00d5edb17793bff4cce4a2792e3eb0ffc7562
RUN mkdir -p /etc/ssl/certs \
 && node -e "process.stdout.write(require('tls').rootCertificates.join('\n') + '\n')" > /etc/ssl/certs/ca-certificates.crt \
 && rm -f /etc/apt/sources.list.d/debian.sources \
 && echo "deb [check-valid-until=no] https://snapshot.debian.org/archive/debian/20261006T000000Z bookworm main" > /etc/apt/sources.list.d/snapshot.list \
 && echo "deb [check-valid-until=no] https://snapshot.debian.org/archive/debian-security/20261006T000000Z bookworm-security main" >> /etc/apt/sources.list.d/snapshot.list \
 && apt-get update \
 && apt-get install -y --no-install-recommends \
      libreoffice-core=4:7.4.7-1+deb12u14 libreoffice-writer=4:7.4.7-1+deb12u14 libreoffice-calc=4:7.4.7-1+deb12u14 libreoffice-impress=4:7.4.7-1+deb12u14 \
      fonts-dejavu-core=2.37-6 fonts-liberation2=2.1.5-1 imagemagick=8:6.9.11.60+dfsg-1.6+deb12u13 libheif1=1.15.1-1+deb12u1 libopenjp2-7=2.5.0-2+deb12u3 \
      libimage-exiftool-perl=12.57+dfsg-1 p7zip-full=16.02+really26.02+dfsg-0+deb12u1 bzip2=1.0.8-5+b1 xz-utils=5.4.1-1+deb12u2 \
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
