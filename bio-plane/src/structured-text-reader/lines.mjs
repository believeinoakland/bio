/* structured-text-reader: the line formats, calendar (ICS), contact (VCF) and caption files (SRT, VTT), parsed a
 * window at a time (R2, R5, R6, R7). A line cut by a window is held as pieces and joined once, when its end arrives, so
 * no line is copied twice. A calendar event is a unit with its summary, start and attendees, cited by its start; a
 * contact is a unit with its name and addresses; a caption cue is a unit cited by its start time. A calendar of more
 * events than the limit refuses the file whole (R7). */
import { CALENDAR_EVENTS_MAX, NESTING_MAX, malformed, overEvents, overNesting } from "./limits.mjs";

/** Splits text into lines across windows; `onLine(line, number)` sees each complete line once. */
function lineSplitter(s, onLine) {
  return {
    feed(text) {
      let from = 0;
      const n = text.length;
      const last = s.part[s.part.length - 1];
      if (last !== undefined && last.endsWith("\r") && n > 0) {
        /* the held CR ends its line; a LF that follows it belongs to the same break */
        s.part[s.part.length - 1] = last.slice(0, -1);
        const line = s.part.join("");
        s.part = [];
        const nl = s.line;
        s.line++;
        from = text[0] === "\n" ? 1 : 0;
        onLine(line, nl);
      }
      for (;;) {
        let at = from;
        while (at < n && text[at] !== "\n" && text[at] !== "\r") at++;
        if (at >= n) break;
        if (text[at] === "\r" && at + 1 >= n) break; /* a CR at the window's end may be the first half of CRLF */
        s.part.push(text.slice(from, at));
        const line = s.part.length === 1 ? s.part[0] : s.part.join("");
        s.part = [];
        const nl = s.line;
        s.line++;
        from = at + (text[at] === "\r" && text[at + 1] === "\n" ? 2 : 1);
        onLine(line, nl);
      }
      if (from < n) s.part.push(text.slice(from));
    },
    end() {
      if (!s.part.length) return;
      let line = s.part.join("");
      s.part = [];
      if (line.endsWith("\r")) line = line.slice(0, -1);
      const nl = s.line;
      s.line++;
      onLine(line, nl);
    },
  };
}

/* ------------------------------------------------------------------ content lines (RFC 5545 §3.1, RFC 6350 §3.3) */

const unescapeValue = (v) => v.replace(/\\([nN,;\\])/g, (_, c) => (c === "n" || c === "N" ? "\n" : c));

/** `NAME;PARAM=a;PARAM="b:c":value` → `{name, params, value}`, or null when the line has no `:` outside quotes. */
export function contentLine(line) {
  let q = false, colon = -1;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') q = !q;
    else if (ch === ":" && !q) { colon = i; break; }
  }
  if (colon < 0) return null;
  const head = line.slice(0, colon);
  const parts = [];
  q = false;
  let from = 0;
  for (let i = 0; i <= head.length; i++) {
    if (i < head.length && head[i] === '"') q = !q;
    if (i === head.length || (head[i] === ";" && !q)) { parts.push(head.slice(from, i)); from = i + 1; }
  }
  const name = parts.shift().toUpperCase();
  if (!/^[A-Z0-9-]+(\.[A-Z0-9-]+)?$/.test(name)) return null;
  const params = {};
  for (const p of parts) {
    const eq = p.indexOf("=");
    const k = (eq < 0 ? p : p.slice(0, eq)).toUpperCase();
    const v = eq < 0 ? "" : p.slice(eq + 1).replace(/^"|"$/g, "");
    params[k] = v;
  }
  return { name: name.includes(".") ? name.slice(name.indexOf(".") + 1) : name, params, value: line.slice(colon + 1) };
}

/** An iCalendar date or date-time as ISO 8601 (`2026-11-01`, `2026-11-01T09:00:00Z`); the value as written when it is neither. */
export function isoDate(v) {
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/.exec(v.trim());
  if (!m) return v.trim();
  return m[4] ? `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}${m[7] ?? ""}` : `${m[1]}-${m[2]}-${m[3]}`;
}

function quotedPrintable(v, charset) {
  const bytes = [];
  for (let i = 0; i < v.length; i++) {
    if (v[i] === "=" && /^[0-9A-Fa-f]{2}$/.test(v.slice(i + 1, i + 3))) { bytes.push(parseInt(v.slice(i + 1, i + 3), 16)); i += 2; }
    else bytes.push(v.charCodeAt(i) & 0xff);
  }
  try { return new TextDecoder(charset || "utf-8").decode(new Uint8Array(bytes)); } catch { return v; }
}

/** The unfolded logical lines of ICS and VCF: a line beginning with a space or a tab continues the one before. */
function unfolder(s, onLogical) {
  return {
    line(raw, number) {
      if (s.pend != null && (raw[0] === " " || raw[0] === "\t")) { s.pend.push(raw.slice(1)); return; }
      if (s.pend != null && s.qp && s.pend[s.pend.length - 1].endsWith("=")) {
        const last = s.pend.length - 1;
        s.pend[last] = s.pend[last].slice(0, -1);
        s.pend.push(raw);
        return;
      }
      flush();
      if (raw === "") return;
      s.pend = [raw];
      s.pendLine = number;
      s.qp = /^[^:]*;ENCODING=QUOTED-PRINTABLE/i.test(raw);
    },
    end: () => flush(),
  };
  function flush() {
    if (s.pend == null) return;
    const text = s.pend.join("");
    const at = s.pendLine;
    s.pend = null;
    s.qp = false;
    onLogical(text, at);
  }
}

/* ------------------------------------------------------------------ ICS */

const CAL_ITEMS = new Set(["VEVENT", "VTODO", "VJOURNAL"]);

function createIcs(saved) {
  const s = saved ?? { line: 1, part: [], pend: null, pendLine: 1, qp: false, stack: [], item: null, events: 0, items: 0, calendars: 0 };
  let emit = null;
  const unfold = unfolder(s, logical);
  const split = lineSplitter(s, (l, n) => unfold.line(l, n));

  function logical(text, n) {
    const cl = contentLine(text);
    if (!cl) throw malformed(n, "not_a_content_line");
    if (cl.name === "BEGIN") {
      const comp = cl.value.trim().toUpperCase();
      if (!s.stack.length && comp !== "VCALENDAR") throw malformed(n, "not_a_calendar");
      if (s.stack.length >= NESTING_MAX) throw overNesting(n);
      const up = s.stack[s.stack.length - 1];
      let i = 1;
      if (up) { const k = `~${comp}`; up.c[k] = (up.c[k] ?? 0) + 1; i = up.c[k]; } else i = ++s.calendars;
      s.stack.push({ n: comp, i, c: {} });
      if (CAL_ITEMS.has(comp) && !s.item) {
        if (comp === "VEVENT" && ++s.events > CALENDAR_EVENTS_MAX) throw overEvents(n);
        s.item = { kind: comp === "VEVENT" ? "event" : comp === "VTODO" ? "todo" : "journal", path: s.stack.map((f) => `${f.n}[${f.i}]`).join("/"),
          line: n, depth: s.stack.length, summary: null, start: null, start_tz: null, end: null, due: null, location: null,
          description: null, uid: null, status: null, organizer: null, attendees: [] };
      }
      return;
    }
    if (cl.name === "END") {
      const comp = cl.value.trim().toUpperCase();
      const top = s.stack[s.stack.length - 1];
      if (!top || top.n !== comp) throw malformed(n, "mismatched_end");
      if (s.item && s.item.depth === s.stack.length) {
        const it = s.item;
        s.item = null;
        s.items++;
        delete it.depth;
        const people = it.attendees.map((a) => a.name ?? a.address).filter(Boolean);
        const text = [it.summary, it.location, it.description, ...people].filter(Boolean).join("\n");
        emit?.({ ...it, text, cite: [it.start, it.summary].filter(Boolean).join(" ") || it.path });
      }
      s.stack.pop();
      return;
    }
    if (!s.stack.length) throw malformed(n, "outside_calendar");
    const it = s.item;
    if (!it || it.depth !== s.stack.length) return;
    const v = unescapeValue(cl.value);
    switch (cl.name) {
      case "SUMMARY": it.summary = v; break;
      case "DTSTART": it.start = isoDate(cl.value); it.start_tz = cl.params.TZID ?? null; break;
      case "DTEND": it.end = isoDate(cl.value); break;
      case "DUE": it.due = isoDate(cl.value); break;
      case "LOCATION": it.location = v; break;
      case "DESCRIPTION": it.description = v; break;
      case "UID": it.uid = v; break;
      case "STATUS": it.status = v; break;
      case "ORGANIZER": it.organizer = { name: cl.params.CN ?? null, address: cl.value.replace(/^mailto:/i, "") }; break;
      case "ATTENDEE": it.attendees.push({ name: cl.params.CN ?? null, address: cl.value.replace(/^mailto:/i, "") }); break;
      default: break;
    }
  }

  return {
    feed(text, sink) { emit = sink; split.feed(text); },
    end(sink) {
      emit = sink;
      split.end();
      unfold.end();
      if (s.stack.length) throw malformed(s.line, "ended_inside_component");
      if (!s.calendars) throw malformed(s.line, "no_calendar");
    },
    save: () => s,
    get line() { return s.line; },
    facts: () => ({ events: s.events, items: s.items }),
  };
}

/* ------------------------------------------------------------------ VCF */

function createVcf(saved) {
  const s = saved ?? { line: 1, part: [], pend: null, pendLine: 1, qp: false, card: null, cards: 0 };
  let emit = null;
  const unfold = unfolder(s, logical);
  const split = lineSplitter(s, (l, n) => unfold.line(l, n));

  function logical(text, n) {
    const cl = contentLine(text);
    if (!cl) throw malformed(n, "not_a_content_line");
    if (cl.name === "BEGIN") {
      if (cl.value.trim().toUpperCase() !== "VCARD" || s.card) throw malformed(n, "bad_begin");
      s.cards++;
      s.card = { kind: "contact", path: `VCARD[${s.cards}]`, line: n, name: null, structured_name: null, org: null, title: null,
        emails: [], phones: [], addresses: [], urls: [], note: null };
      return;
    }
    if (cl.name === "END") {
      if (cl.value.trim().toUpperCase() !== "VCARD" || !s.card) throw malformed(n, "mismatched_end");
      const c = s.card;
      s.card = null;
      const name = c.name ?? c.structured_name;
      const text = [name, c.org, c.title, ...c.emails, ...c.phones, ...c.addresses, c.note].filter(Boolean).join("\n");
      emit?.({ ...c, name, text, cite: name ?? c.path });
      return;
    }
    if (!s.card) throw malformed(n, "outside_card");
    const c = s.card;
    let raw = cl.value;
    if ((cl.params.ENCODING ?? "").toUpperCase() === "QUOTED-PRINTABLE") raw = quotedPrintable(raw, cl.params.CHARSET);
    const v = unescapeValue(raw);
    switch (cl.name) {
      case "FN": c.name = v; break;
      case "N": c.structured_name = raw.split(";").map(unescapeValue).filter(Boolean).reverse().join(" ") || null; break;
      case "ORG": c.org = raw.split(";").map(unescapeValue).filter(Boolean).join(", ") || null; break;
      case "TITLE": c.title = v; break;
      case "EMAIL": c.emails.push(v); break;
      case "TEL": c.phones.push(v); break;
      case "ADR": { const a = raw.split(";").map(unescapeValue).filter(Boolean).join(", "); if (a) c.addresses.push(a); break; }
      case "URL": c.urls.push(v); break;
      case "NOTE": c.note = v; break;
      default: break;
    }
  }

  return {
    feed(text, sink) { emit = sink; split.feed(text); },
    end(sink) {
      emit = sink;
      split.end();
      unfold.end();
      if (s.card) throw malformed(s.line, "ended_inside_card");
      if (!s.cards) throw malformed(s.line, "no_card");
    },
    save: () => s,
    get line() { return s.line; },
    facts: () => ({ contacts: s.cards }),
  };
}

/* ------------------------------------------------------------------ captions */

const pad = (x, n) => String(x).padStart(n, "0");
/** A caption time (`1:02:03,4`, `02:03.400`) as `HH:MM:SS.mmm`, or null when it is not one. */
export function captionTime(t) {
  const m = /^(?:(\d{1,3}):)?(\d{1,2}):(\d{2})[,.](\d{1,3})$/.exec(t.trim());
  if (!m) return null;
  return `${pad(m[1] ?? 0, 2)}:${pad(m[2], 2)}:${m[3]}.${m[4].padEnd(3, "0")}`;
}
const TIMING = /^\s*(\S+)\s+-->\s+(\S+)(.*)$/;
const cueText = (lines) => lines.join("\n").replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();

function createCaptions(format, saved) {
  const s = saved ?? { line: 1, part: [], st: format === "vtt" ? "header" : "gap", cue: null, cues: 0, skipBlock: false };
  let emit = null;
  const split = lineSplitter(s, line);

  function closeCue() {
    const c = s.cue;
    if (!c) return;
    s.cue = null;
    const voice = /<v(?:\.[^\s>]*)?\s+([^>]+)>/.exec(c.lines.join("\n"));
    emit?.({ kind: "cue", path: `cue[${c.n}]`, id: c.id, start: c.start, end: c.end, ...(voice ? { voice: voice[1].trim() } : {}),
      text: cueText(c.lines), line: c.line, cite: c.start });
  }

  function timing(l, n, id, idLine) {
    const m = TIMING.exec(l);
    const start = m && captionTime(m[1]), end = m && captionTime(m[2]);
    if (!start || !end) throw malformed(n, "bad_cue_timing");
    s.cues++;
    s.cue = { n: s.cues, id, start, end, lines: [], line: idLine ?? n };
    s.st = "text";
  }

  function line(l, n) {
    if (s.st === "header") {
      if (!/^﻿?WEBVTT(?:[ \t].*)?$/.test(l)) throw malformed(n, "no_webvtt_header");
      s.st = "headerBlock";
      return;
    }
    if (s.st === "headerBlock") { if (l.trim() === "") s.st = "gap"; return; }
    if (s.st === "skip") { if (l.trim() === "") s.st = "gap"; return; }
    if (s.st === "text") {
      if (l.trim() === "") { closeCue(); s.st = "gap"; return; }
      s.cue.lines.push(l);
      return;
    }
    if (s.st === "gap") {
      if (l.trim() === "") return;
      if (format === "vtt" && /^(NOTE|STYLE|REGION)(?:[ \t]|$)/.test(l)) { s.st = "skip"; return; }
      if (l.includes("-->")) return timing(l, n, null, null);
      if (format === "srt" && !/^\s*\d+\s*$/.test(l)) throw malformed(n, "bad_cue_number");
      s.st = "timing"; s.id = l.trim(); s.idLine = n;
      return;
    }
    if (s.st === "timing") return timing(l, n, s.id, s.idLine);
  }

  return {
    feed(text, sink) { emit = sink; split.feed(text); },
    end(sink) {
      emit = sink;
      split.end();
      if (s.st === "header") throw malformed(s.line, "no_webvtt_header");
      if (s.st === "timing") throw malformed(s.line, "bad_cue_timing");
      closeCue();
    },
    save: () => s,
    get line() { return s.line; },
    facts: () => ({ cues: s.cues }),
  };
}

/** A new line-format parser, or one resumed from `saved`: `ics`, `vcf`, `srt` or `vtt`. */
export function createLinesParser(format, saved = null) {
  if (format === "ics") return createIcs(saved);
  if (format === "vcf") return createVcf(saved);
  return createCaptions(format, saved);
}
