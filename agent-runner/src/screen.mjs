// What a terminal would show for the binary's output (R27; START's measurement, K3068). `setup-token` is a terminal UI
// that writes only the cells that change: words are placed by cursor moves, and a character already on the screen at
// a cell is not sent again. Removing the escapes alone runs words together and drops letters, so the output is played
// onto a grid and read back as lines. Only cursor moves, erases, save/restore and printable text matter; every other
// sequence (modes, queries, hyperlinks) is skipped.
const CSI = /^\x1b\[([0-?]*)([ -/]*)([@-~])/;

export function screen(raw) {
  const s = Array.from(String(raw ?? ''));
  const rows = [[]];
  let r = 0, c = 0, saved = [0, 0];
  const row = (n) => { while (rows.length <= n) rows.push([]); return rows[n]; };
  const put = (ch) => { const line = row(r); while (line.length < c) line.push(' '); line[c] = ch; c += 1; };
  for (let i = 0; i < s.length;) {
    const ch = s[i];
    if (ch === '\x1b') {
      const next = s[i + 1];
      if (next === '[') {
        const m = CSI.exec(s.slice(i, i + 64).join(''));
        if (!m) { i += 2; continue; }
        i += Array.from(m[0]).length;
        const [, p, , f] = m;
        if (/^[?<=>]/.test(p)) continue;
        const n = (d) => { const v = parseInt(p, 10); return Number.isFinite(v) && v > 0 ? v : d; };
        const mode = parseInt(p, 10) || 0;
        if (f === 'A') r = Math.max(0, r - n(1));
        else if (f === 'B') r += n(1);
        else if (f === 'C') c += n(1);
        else if (f === 'D') c = Math.max(0, c - n(1));
        else if (f === 'G') c = n(1) - 1;
        else if (f === 'E') { r += n(1); c = 0; }
        else if (f === 'F') { r = Math.max(0, r - n(1)); c = 0; }
        else if (f === 'H' || f === 'f') { const [a, b] = p.split(';'); r = (parseInt(a, 10) || 1) - 1; c = (parseInt(b, 10) || 1) - 1; }
        else if (f === 'K') {
          const line = row(r);
          if (mode === 0) line.length = Math.min(line.length, c);
          else if (mode === 1) for (let k = 0; k <= c && k < line.length; k++) line[k] = ' ';
          else line.length = 0;
        } else if (f === 'J') {
          if (mode === 0) { row(r).length = Math.min(row(r).length, c); rows.length = r + 1; }
          else if (mode === 1) for (let k = 0; k < r; k++) rows[k] = [];
          else rows.splice(0, rows.length, []);
        }
        continue;
      }
      if (next === ']' || next === 'P' || next === '_' || next === '^') {      // OSC and other strings: to BEL or ST
        let j = i + 2;
        while (j < s.length && s[j] !== '\x07' && !(s[j] === '\x1b' && s[j + 1] === '\\')) j++;
        i = j < s.length ? (s[j] === '\x07' ? j + 1 : j + 2) : j;
        continue;
      }
      if (next === '7') saved = [r, c];
      else if (next === '8') [r, c] = saved;
      i += 2;
      continue;
    }
    i += 1;
    if (ch === '\r') c = 0;
    else if (ch === '\n') r += 1;
    else if (ch === '\b') c = Math.max(0, c - 1);
    else if (ch === '\t') c = (Math.floor(c / 8) + 1) * 8;
    else if (ch >= ' ' && ch !== '\x7f' && !/\p{Cc}/u.test(ch)) put(ch);
  }
  return rows.map((line) => line.map((x) => x ?? ' ').join('').trimEnd()).join('\n');
}
