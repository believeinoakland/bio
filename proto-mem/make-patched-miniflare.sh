#!/bin/bash
# builds /home/user/mfp: symlinks to bio-plane's node_modules, except Miniflare's dist/src/index.js, a copy with one added line passing MF_V8_FLAGS (comma list) to workerd's config as v8Flags.
# use: MF_PATH=/home/user/mfp/node_modules/miniflare/dist/src/index.js MF_V8_FLAGS=--expose-gc node proto-mem/measure-chain.mjs ...
N=/home/user/bio/bio-plane/node_modules; M=/home/user/mfp
rm -rf $M; mkdir -p $M/node_modules/miniflare/dist/src
for e in $(ls -A $N); do case $e in miniflare|.bin|.package-lock.json) ;; *) ln -s $N/$e $M/node_modules/$e;; esac; done
for e in $(ls -A $N/miniflare); do [ $e = dist ] || ln -s $N/miniflare/$e $M/node_modules/miniflare/$e; done
for e in $(ls -A $N/miniflare/dist); do [ $e = src ] || ln -s $N/miniflare/dist/$e $M/node_modules/miniflare/dist/$e; done
for e in $(ls -A $N/miniflare/dist/src); do [ $e = index.js ] || ln -s $N/miniflare/dist/src/$e $M/node_modules/miniflare/dist/src/$e; done
python3 - <<'PY'
s=open('/home/user/bio/bio-plane/node_modules/miniflare/dist/src/index.js').read()
a="  const message = new Message();\n  const struct = message.initRoot(Config);\n  encodeCapnpStruct(config2, struct);"
assert s.count(a)==1
open('/home/user/mfp/node_modules/miniflare/dist/src/index.js','w').write(s.replace(a,"  if (process.env.MF_V8_FLAGS) config2 = { ...config2, v8Flags: process.env.MF_V8_FLAGS.split(\",\") };\n"+a))
PY
