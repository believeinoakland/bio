// The one connection a conversation runs on: a WebSocket (RFC 6455) server side, text frames only, written here so
// the image's only npm dependencies stay the Agent SDK and its peers. A caller's frames are masked; ours are not.
import { createHash } from 'node:crypto';

const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
export const MAX_MESSAGE = 16 * 1024 * 1024;

export function isUpgrade(req) {
  return /\bwebsocket\b/i.test(req.headers.upgrade || '') && typeof req.headers['sec-websocket-key'] === 'string';
}

// Completes the handshake on `socket` and answers a connection: `send(obj)`, `close(code)`, and the callbacks
// `onMessage(text)` and `onClose()` the caller sets.
export function accept(req, socket, head) {
  const key = createHash('sha1').update(req.headers['sec-websocket-key'] + GUID).digest('base64');
  socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n'
    + `Sec-WebSocket-Accept: ${key}\r\n\r\n`);
  socket.setNoDelay(true);
  const conn = { open: true, onMessage: () => {}, onClose: () => {} };
  let buf = head && head.length ? Buffer.from(head) : Buffer.alloc(0);
  let parts = [], partsLen = 0;

  const frame = (op, payload) => {
    const n = payload.length;
    const hdr = n < 126 ? Buffer.from([0x80 | op, n])
      : n < 65536 ? Buffer.from([0x80 | op, 126, n >> 8, n & 255])
        : Buffer.concat([Buffer.from([0x80 | op, 127]), (() => { const b = Buffer.alloc(8); b.writeBigUInt64BE(BigInt(n)); return b; })()]);
    socket.write(Buffer.concat([hdr, payload]));
  };
  const ended = () => { if (conn.open) { conn.open = false; conn.onClose(); } };
  conn.send = (obj) => { if (conn.open) frame(1, Buffer.from(JSON.stringify(obj))); };
  conn.close = (code = 1000) => {
    if (!conn.open) return;
    const b = Buffer.alloc(2); b.writeUInt16BE(code);
    frame(8, b); socket.end(); ended();
  };

  const parse = () => {
    while (buf.length >= 2) {
      const fin = buf[0] & 0x80, op = buf[0] & 0x0f, masked = buf[1] & 0x80;
      let len = buf[1] & 0x7f, off = 2;
      if (len === 126) { if (buf.length < 4) return; len = buf.readUInt16BE(2); off = 4; }
      else if (len === 127) { if (buf.length < 10) return; len = Number(buf.readBigUInt64BE(2)); off = 10; }
      if (!masked || len > MAX_MESSAGE) return conn.close(!masked ? 1002 : 1009);
      if (buf.length < off + 4 + len) return;
      const mask = buf.subarray(off, off + 4);
      const data = Buffer.from(buf.subarray(off + 4, off + 4 + len));
      for (let i = 0; i < data.length; i++) data[i] ^= mask[i & 3];
      buf = buf.subarray(off + 4 + len);
      if (op === 8) return conn.close(1000);
      if (op === 9) { frame(10, data); continue; }
      if (op === 10) continue;
      if (op !== 0 && op !== 1) return conn.close(1003);          // binary frames are not this protocol
      parts.push(data); partsLen += data.length;
      if (partsLen > MAX_MESSAGE) return conn.close(1009);
      if (fin) {
        const text = Buffer.concat(parts).toString('utf8');
        parts = []; partsLen = 0;
        conn.onMessage(text);
      }
    }
  };
  socket.on('data', (d) => { buf = Buffer.concat([buf, d]); if (conn.open) parse(); });
  socket.on('close', ended);
  socket.on('end', ended);
  socket.on('error', ended);
  queueMicrotask(() => { if (buf.length) parse(); });
  return conn;
}
