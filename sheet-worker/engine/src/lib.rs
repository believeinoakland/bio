//! sheet-worker's engine: IronCalc, pinned, behind the calls the member makes (`../src/engine.mjs`).
//!
//! * `engine_commit()`: the IronCalc commit this wasm was built from.
//! * `inspect(bytes, max_unzipped, max_cells)`: reads the OOXML container WITHOUT loading it into the engine, so the
//!   member can refuse a file that is not a workbook, is over a bound, or links to another workbook before the engine
//!   sees it (R3 checks 2-4). It decompresses each part and counts what it really unzipped, stopping one byte past the
//!   bound, so a declared size that lies cannot pass.
//! * `Book::load(bytes)` then `Book::evaluate()`: IronCalc's own xlsx import, then a full evaluation, answering every
//!   formula cell's value. Macros are never run: IronCalc has no VBA interpreter, and a VBA part is never read.
//!
//! Every answer is JSON text; the member parses it. Nothing here keeps state between calls.

use std::collections::{HashMap, HashSet};
use std::io::{Cursor, Read};

use ironcalc_base::types::{Cell, FormulaValue};
use ironcalc_base::Model;
use serde_json::{json, Map, Value};
use wasm_bindgen::prelude::*;

/// The IronCalc commit the dependencies are pinned to (Cargo.toml). `../scripts/build-engine.mjs` refuses a build
/// where this, Cargo.toml and `../src/contract.mjs`'s ENGINE_VERSION disagree.
pub const ENGINE_COMMIT: &str = "4deab8f6e6a858744f8966f67f70f4ed8d29c78d";

/// Volatile functions (R6): recomputed on every calculation by a spreadsheet, so their value now is not the value
/// the file cached.
const VOLATILE: [&str; 8] = ["NOW", "TODAY", "RAND", "RANDBETWEEN", "OFFSET", "INDIRECT", "CELL", "INFO"];

const WORKBOOK_MAIN_TYPES: [&str; 4] = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml",
    "application/vnd.ms-excel.sheet.macroEnabled.main+xml",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml",
    "application/vnd.ms-excel.template.macroEnabled.main+xml",
];
const WORKSHEET_TYPE: &str = "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml";
const EXTERNAL_LINK_TYPE: &str = "application/vnd.openxmlformats-officedocument.spreadsheetml.externalLink+xml";
const VBA_TYPE: &str = "application/vnd.ms-office.vbaProject";

#[wasm_bindgen]
pub fn engine_commit() -> String {
    ENGINE_COMMIT.to_string()
}

// ---------------------------------------------------------------------------------------------------------------
// Formula text: function names, `@`, external references. Strings ("...") are skipped; quoted sheet names ('...')
// are names, never calls.
// ---------------------------------------------------------------------------------------------------------------

fn is_ident_char(c: char) -> bool {
    c.is_alphanumeric() || c == '_' || c == '.'
}

/// The functions a formula calls, upper-cased, with the `_xlfn.` / `_xlws.` storage prefixes removed.
fn functions_called(formula: &str) -> Vec<String> {
    let chars: Vec<char> = formula.chars().collect();
    let mut out = Vec::new();
    let mut i = 0;
    while i < chars.len() {
        let c = chars[i];
        if c == '"' {
            i += 1;
            while i < chars.len() {
                if chars[i] == '"' {
                    if i + 1 < chars.len() && chars[i + 1] == '"' {
                        i += 2;
                        continue;
                    }
                    break;
                }
                i += 1;
            }
            i += 1;
            continue;
        }
        if c == '\'' {
            i += 1;
            while i < chars.len() {
                if chars[i] == '\'' {
                    if i + 1 < chars.len() && chars[i + 1] == '\'' {
                        i += 2;
                        continue;
                    }
                    break;
                }
                i += 1;
            }
            i += 1;
            continue;
        }
        if c.is_alphabetic() || c == '_' {
            let start = i;
            while i < chars.len() && is_ident_char(chars[i]) {
                i += 1;
            }
            if i < chars.len() && chars[i] == '(' {
                let mut name: String = chars[start..i].iter().collect::<String>().to_uppercase();
                for prefix in ["_XLFN._XLWS.", "_XLFN.", "_XLWS."] {
                    if let Some(rest) = name.strip_prefix(prefix) {
                        name = rest.to_string();
                        break;
                    }
                }
                out.push(name);
            }
            continue;
        }
        i += 1;
    }
    out
}

/// Whether the formula uses the implicit-intersection operator `@` outside a string or a quoted name.
fn has_implicit_intersection(formula: &str) -> bool {
    let mut in_string = false;
    let mut in_name = false;
    for c in formula.chars() {
        match c {
            '"' if !in_name => in_string = !in_string,
            '\'' if !in_string => in_name = !in_name,
            '@' if !in_string && !in_name => return true,
            _ => {}
        }
    }
    false
}

/// Whether formula or defined-name text refers to another workbook: a `[n]` book index (n > 0) opening a reference,
/// either bare (`[1]Sheet1!A1`) or inside a quoted name (`'[1]My Sheet'!A1`). A bracket opened after a name
/// (`Table1[Col]`) or inside one (`[[#This Row],[2019]]`) is a structured reference, not a book.
fn refers_to_other_workbook(text: &str) -> bool {
    let chars: Vec<char> = text.chars().collect();
    let book_index_at = |i: usize| -> bool {
        // chars[i] == '['
        let mut j = i + 1;
        let mut digits = String::new();
        while j < chars.len() && chars[j].is_ascii_digit() {
            digits.push(chars[j]);
            j += 1;
        }
        !digits.is_empty() && j < chars.len() && chars[j] == ']' && digits.trim_start_matches('0') != ""
    };
    let mut i = 0;
    let mut depth = 0usize;
    while i < chars.len() {
        let c = chars[i];
        if c == '"' {
            i += 1;
            while i < chars.len() {
                if chars[i] == '"' {
                    if i + 1 < chars.len() && chars[i + 1] == '"' {
                        i += 2;
                        continue;
                    }
                    break;
                }
                i += 1;
            }
            i += 1;
            continue;
        }
        if c == '\'' {
            if i + 1 < chars.len() && chars[i + 1] == '[' && book_index_at(i + 1) {
                return true;
            }
            i += 1;
            while i < chars.len() {
                if chars[i] == '\'' {
                    if i + 1 < chars.len() && chars[i + 1] == '\'' {
                        i += 2;
                        continue;
                    }
                    break;
                }
                i += 1;
            }
            i += 1;
            continue;
        }
        if c == '[' {
            let after_name = i > 0 && (is_ident_char(chars[i - 1]) || chars[i - 1] == ']');
            if depth == 0 && !after_name && book_index_at(i) {
                return true;
            }
            depth += 1;
        } else if c == ']' {
            depth = depth.saturating_sub(1);
        }
        i += 1;
    }
    false
}

// ---------------------------------------------------------------------------------------------------------------
// XML scanning, enough for counting and for the text of <f> and <definedName>. The parts are the file's own; a
// malformed part only changes a count, and the engine's own import is what decides whether the workbook loads.
// ---------------------------------------------------------------------------------------------------------------

/// Position just after an optional `prefix:` at `j`, if `bytes[j..]` starts with a qualified name.
fn skip_prefix(bytes: &[u8], j: usize) -> usize {
    let mut k = j;
    while k < bytes.len() && (bytes[k].is_ascii_alphanumeric() || bytes[k] == b'_' || bytes[k] == b'-') {
        k += 1;
    }
    if k < bytes.len() && bytes[k] == b':' && k > j {
        k + 1
    } else {
        j
    }
}

fn name_ends(bytes: &[u8], k: usize) -> bool {
    k >= bytes.len() || matches!(bytes[k], b' ' | b'\t' | b'\n' | b'\r' | b'>' | b'/')
}

/// Count of `<c>` elements (cells) in a worksheet part.
fn count_cells(xml: &[u8]) -> u64 {
    let mut n = 0u64;
    let mut i = 0;
    while i < xml.len() {
        if xml[i] == b'<' {
            let j = skip_prefix(xml, i + 1);
            if j < xml.len() && xml[j] == b'c' && name_ends(xml, j + 1) {
                n += 1;
            }
        }
        i += 1;
    }
    n
}

fn decode_entities(s: &str) -> String {
    s.replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&quot;", "\"")
        .replace("&apos;", "'")
        .replace("&amp;", "&")
}

/// The text content of every element with local name `local` (`<f>…</f>`, `<definedName …>…</definedName>`).
fn element_texts(xml: &[u8], local: &[u8]) -> Vec<String> {
    let mut out = Vec::new();
    let mut i = 0;
    while i < xml.len() {
        if xml[i] == b'<' {
            let j = skip_prefix(xml, i + 1);
            if xml.len() >= j + local.len() && &xml[j..j + local.len()] == local && name_ends(xml, j + local.len()) {
                // find the end of the start tag
                let mut k = j + local.len();
                while k < xml.len() && xml[k] != b'>' {
                    k += 1;
                }
                if k >= xml.len() {
                    break;
                }
                if xml[k - 1] == b'/' {
                    i = k + 1;
                    continue;
                }
                let start = k + 1;
                let mut e = start;
                while e < xml.len() && xml[e] != b'<' {
                    e += 1;
                }
                out.push(decode_entities(&String::from_utf8_lossy(&xml[start..e])));
                i = e;
                continue;
            }
        }
        i += 1;
    }
    out
}

/// The `name="value"` attribute of one start tag's text.
fn attr<'a>(tag: &'a str, name: &str) -> Option<&'a str> {
    let key = format!("{name}=");
    let mut from = 0;
    while let Some(p) = tag[from..].find(&key) {
        let at = from + p;
        let before_ok = at == 0 || tag.as_bytes()[at - 1].is_ascii_whitespace();
        let rest = &tag[at + key.len()..];
        if before_ok {
            if let Some(q) = rest.chars().next() {
                if q == '"' || q == '\'' {
                    if let Some(end) = rest[1..].find(q) {
                        return Some(&rest[1..1 + end]);
                    }
                }
            }
        }
        from = at + key.len();
    }
    None
}

/// `[Content_Types].xml`'s Override entries: part name (no leading slash) → content type.
fn overrides(xml: &str) -> HashMap<String, String> {
    let mut map = HashMap::new();
    for piece in xml.split('<').skip(1) {
        let name_end = piece.find(|c: char| c.is_whitespace() || c == '>' || c == '/').unwrap_or(piece.len());
        let local = piece[..name_end].rsplit(':').next().unwrap_or("");
        if local == "Override" {
            if let (Some(part), Some(ct)) = (attr(piece, "PartName"), attr(piece, "ContentType")) {
                map.insert(part.trim_start_matches('/').to_string(), ct.to_string());
            }
        }
    }
    map
}

fn as_number(n: u64) -> Value {
    Value::from(n)
}

/// R3 checks 2-4, before the engine sees the file. See the module comment.
#[wasm_bindgen]
pub fn inspect(bytes: &[u8], max_unzipped: f64, max_cells: f64) -> String {
    let refuse = |why: String| json!({"zip": false, "workbook": false, "why": why}).to_string();
    let mut archive = match zip::ZipArchive::new(Cursor::new(bytes)) {
        Ok(a) => a,
        Err(e) => return refuse(format!("the bytes are not a zip container: {e}")),
    };
    let max_unzipped = if max_unzipped.is_finite() && max_unzipped >= 0.0 { max_unzipped as u64 } else { 0 };
    let max_cells = if max_cells.is_finite() && max_cells >= 0.0 { max_cells as u64 } else { 0 };

    let names: Vec<String> = archive.file_names().map(|s| s.to_string()).collect();
    let name_set: HashSet<&str> = names.iter().map(|s| s.as_str()).collect();
    let not_workbook = |why: String| json!({"zip": true, "workbook": false, "why": why}).to_string();

    // [Content_Types].xml names the main part. Read it first, bounded like everything else.
    let mut total: u64 = 0;
    let read_part = |archive: &mut zip::ZipArchive<Cursor<&[u8]>>, name: &str, budget: u64| -> Result<(Vec<u8>, bool), String> {
        let file = archive.by_name(name).map_err(|e| format!("part {name} could not be opened: {e}"))?;
        let mut buf = Vec::new();
        file.take(budget.saturating_add(1)).read_to_end(&mut buf).map_err(|e| format!("part {name} could not be read: {e}"))?;
        let over = buf.len() as u64 > budget;
        Ok((buf, over))
    };
    if !name_set.contains("[Content_Types].xml") {
        return not_workbook("the zip has no [Content_Types].xml, so it is not an OOXML package".to_string());
    }
    let (ct_bytes, ct_over) = match read_part(&mut archive, "[Content_Types].xml", max_unzipped) {
        Ok(r) => r,
        Err(e) => return not_workbook(e),
    };
    let types = overrides(&String::from_utf8_lossy(&ct_bytes));
    let main_part = types
        .iter()
        .filter(|(_, ct)| WORKBOOK_MAIN_TYPES.contains(&ct.as_str()))
        .map(|(p, _)| p.clone())
        .min();
    let main_part = match main_part {
        Some(p) if name_set.contains(p.as_str()) => p,
        Some(p) => return not_workbook(format!("the package names its workbook part {p}, which is not in the zip")),
        None => return not_workbook("the package declares no spreadsheet workbook part".to_string()),
    };

    let mut over_unzipped = ct_over;
    total += ct_bytes.len() as u64;
    let mut cells: u64 = 0;
    let mut worksheets: u64 = 0;
    let mut external_parts: u64 = 0;
    let mut external_formulas: u64 = 0;
    let mut external_names: u64 = 0;
    let mut macros = false;

    for name in names.iter() {
        if over_unzipped {
            break;
        }
        if name == "[Content_Types].xml" {
            continue;
        }
        let ct = types.get(name.as_str()).map(|s| s.as_str()).unwrap_or("");
        let lower = name.to_lowercase();
        if ct == VBA_TYPE || lower.ends_with("vbaproject.bin") {
            macros = true;
        }
        let is_external = ct == EXTERNAL_LINK_TYPE
            || (lower.starts_with("xl/externallinks/") && lower.ends_with(".xml") && !lower.contains("/_rels/"));
        if is_external {
            external_parts += 1;
        }
        let budget = max_unzipped.saturating_sub(total);
        let (buf, over) = match read_part(&mut archive, name, budget) {
            Ok(r) => r,
            Err(e) => return not_workbook(e),
        };
        total += buf.len() as u64;
        if over {
            over_unzipped = true;
            break;
        }
        if ct == WORKSHEET_TYPE {
            worksheets += 1;
            cells += count_cells(&buf);
            external_formulas += element_texts(&buf, b"f").iter().filter(|f| refers_to_other_workbook(f)).count() as u64;
        } else if *name == main_part {
            external_names +=
                element_texts(&buf, b"definedName").iter().filter(|f| refers_to_other_workbook(f)).count() as u64;
        }
    }

    let mut out = Map::new();
    out.insert("zip".into(), Value::Bool(true));
    out.insert("workbook".into(), Value::Bool(true));
    out.insert("main_part".into(), Value::String(main_part));
    out.insert("unzipped_bytes".into(), as_number(total));
    out.insert("over_unzipped".into(), Value::Bool(over_unzipped));
    out.insert("max_unzipped_bytes".into(), as_number(max_unzipped));
    if over_unzipped {
        // Reading stopped one byte past the bound: what was counted is a floor, never the file's whole.
        out.insert("cells".into(), Value::Null);
        out.insert("over_cells".into(), Value::Null);
    } else {
        out.insert("cells".into(), as_number(cells));
        out.insert("over_cells".into(), Value::Bool(cells > max_cells));
    }
    out.insert("max_cells".into(), as_number(max_cells));
    out.insert("worksheets".into(), as_number(worksheets));
    out.insert(
        "external".into(),
        json!({"parts": external_parts, "formulas": external_formulas, "defined_names": external_names}),
    );
    out.insert("macros".into(), Value::Bool(macros));
    Value::Object(out).to_string()
}

// ---------------------------------------------------------------------------------------------------------------
// Load and evaluate.
// ---------------------------------------------------------------------------------------------------------------

#[wasm_bindgen]
pub struct Book {
    model: Model<'static>,
}

fn column_letters(mut column: i32) -> String {
    let mut s = Vec::new();
    while column > 0 {
        let r = ((column - 1) % 26) as u8;
        s.push(b'A' + r);
        column = (column - 1) / 26;
    }
    s.reverse();
    String::from_utf8(s).unwrap_or_default()
}

/// "Sheet1!C4" or "'My Sheet'!C4" → (sheet name, row, column).
fn parse_origin(o: &str) -> Option<(String, i32, i32)> {
    let bang = o.rfind('!')?;
    let mut sheet = o[..bang].to_string();
    if sheet.len() >= 2 && sheet.starts_with('\'') && sheet.ends_with('\'') {
        sheet = sheet[1..sheet.len() - 1].replace("''", "'");
    }
    let cell = o[bang + 1..].replace('$', "");
    let letters: String = cell.chars().take_while(|c| c.is_ascii_alphabetic()).collect();
    let digits: String = cell.chars().skip(letters.len()).collect();
    if letters.is_empty() || digits.is_empty() || !digits.chars().all(|c| c.is_ascii_digit()) {
        return None;
    }
    let mut column = 0i32;
    for c in letters.to_ascii_uppercase().bytes() {
        column = column.checked_mul(26)?.checked_add((c - b'A' + 1) as i32)?;
    }
    Some((sheet, digits.parse().ok()?, column))
}

struct Entry {
    sheet: u32,
    row: i32,
    column: i32,
    formula: String,
    value: FormulaValue,
}

#[wasm_bindgen]
impl Book {
    /// IronCalc's own xlsx import. Locale "en", timezone "UTC" and language "en" are fixed: the answer names no
    /// place (R16), and a workbook stores its numbers and formulas independently of the locale that wrote it.
    pub fn load(bytes: &[u8]) -> Result<Book, JsError> {
        let workbook = ironcalc::import::load_from_xlsx_bytes(bytes, "workbook", "en", "UTC")
            .map_err(|e| JsError::new(&e.to_string()))?;
        let model = Model::from_workbook(workbook, "en").map_err(|e| JsError::new(&e))?;
        Ok(Book { model })
    }

    /// Evaluate every formula and answer each formula cell (R4-R6) as JSON.
    pub fn evaluate(&mut self) -> String {
        self.model.evaluate();
        let language = ironcalc_base::language::get_language("en").ok();
        let defined: HashSet<String> =
            self.model.workbook.defined_names.iter().map(|d| d.name.to_uppercase()).collect();
        let sheet_names: Vec<String> = self.model.workbook.worksheets.iter().map(|w| w.get_name()).collect();

        let mut entries: Vec<Entry> = Vec::new();
        let mut spill_cells: u64 = 0;
        for (index, sheet) in self.model.workbook.worksheets.iter().enumerate() {
            let mut cells: Vec<(i32, i32, FormulaValue)> = Vec::new();
            for (row, column, cell) in sheet.sheet_data.cells() {
                match cell {
                    Cell::CellFormula { v, .. } | Cell::ArrayFormula { v, .. } => cells.push((row, column, v.clone())),
                    Cell::SpillCell { .. } => spill_cells += 1,
                    _ => {}
                }
            }
            cells.sort_by_key(|(r, c, _)| (*r, *c));
            for (row, column, value) in cells {
                let formula = self
                    .model
                    .get_cell_formula(index as u32, row, column)
                    .ok()
                    .flatten()
                    .unwrap_or_default();
                entries.push(Entry { sheet: index as u32, row, column, formula, value });
            }
        }

        let position: HashMap<(u32, i32, i32), usize> =
            entries.iter().enumerate().map(|(i, e)| ((e.sheet, e.row, e.column), i)).collect();
        let sheet_index: HashMap<String, u32> =
            sheet_names.iter().enumerate().map(|(i, n)| (n.to_uppercase(), i as u32)).collect();

        let unknown_function = |formula: &str| -> Option<String> {
            let language = language?;
            functions_called(formula)
                .into_iter()
                .find(|name| language.functions.lookup(name).is_none() && !defined.contains(name))
        };
        // A cell's own cause, from its own formula and error code alone.
        let own_cause = |e: &Entry| -> Option<(String, Option<String>)> {
            let code = match &e.value {
                FormulaValue::Error { ei, .. } => ei.to_string(),
                _ => return None,
            };
            if let Some(name) = unknown_function(&e.formula) {
                return Some(("unsupported_function".into(), Some(name)));
            }
            match code.as_str() {
                "#CIRC!" => return Some(("circular".into(), None)),
                "#N/IMPL" | "#N/IMPL!" => return Some(("not_implemented".into(), None)),
                _ => {}
            }
            if has_implicit_intersection(&e.formula) {
                return Some(("implicit_intersection".into(), None));
            }
            None
        };

        let mut counts_errors = 0u64;
        let mut counts_volatile = 0u64;
        let mut out_cells = Vec::with_capacity(entries.len());
        for e in entries.iter() {
            let sheet = &sheet_names[e.sheet as usize];
            let cell = format!("{}{}", column_letters(e.column), e.row);
            let volatile = functions_called(&e.formula).iter().any(|f| VOLATILE.contains(&f.as_str()));
            if volatile {
                counts_volatile += 1;
            }
            let mut obj = Map::new();
            obj.insert("sheet".into(), Value::String(sheet.clone()));
            obj.insert("cell".into(), Value::String(cell));
            obj.insert("formula".into(), Value::String(e.formula.clone()));
            match &e.value {
                FormulaValue::Number(n) if n.is_finite() => {
                    obj.insert("type".into(), "number".into());
                    obj.insert("value".into(), Value::from(*n));
                }
                FormulaValue::Number(_) => {
                    // A non-finite result has no decimal form; it is not given one.
                    counts_errors += 1;
                    obj.insert("type".into(), "error".into());
                    obj.insert("value".into(), Value::Null);
                    obj.insert("error".into(), "non-finite".into());
                    obj.insert("cause".into(), "undetermined".into());
                }
                FormulaValue::Text(s) => {
                    obj.insert("type".into(), "text".into());
                    obj.insert("value".into(), Value::String(s.clone()));
                }
                FormulaValue::Boolean(b) => {
                    obj.insert("type".into(), "boolean".into());
                    obj.insert("value".into(), Value::Bool(*b));
                }
                FormulaValue::Unevaluated => {
                    counts_errors += 1;
                    obj.insert("type".into(), "error".into());
                    obj.insert("value".into(), Value::Null);
                    obj.insert("error".into(), "unevaluated".into());
                    obj.insert("cause".into(), "undetermined".into());
                }
                FormulaValue::Error { ei, o, m } => {
                    counts_errors += 1;
                    let code = ei.to_string();
                    obj.insert("type".into(), "error".into());
                    obj.insert("value".into(), Value::String(code.clone()));
                    obj.insert("error".into(), Value::String(code));
                    // The cause is this cell's own, else that of the cell the engine says the error came from,
                    // followed while each hop is another formula cell in error (at most 32 hops).
                    let mut cause = own_cause(e);
                    let mut via: Option<String> = None;
                    let mut origin = o.clone();
                    let mut hops = 0;
                    while cause.is_none() && hops < 32 {
                        hops += 1;
                        let Some((sname, row, column)) = parse_origin(&origin) else { break };
                        let Some(&si) = sheet_index.get(&sname.to_uppercase()) else { break };
                        let Some(&pi) = position.get(&(si, row, column)) else { break };
                        let src = &entries[pi];
                        if std::ptr::eq(src, e) && hops > 1 {
                            break;
                        }
                        if !std::ptr::eq(src, e) {
                            cause = own_cause(src);
                            if cause.is_some() {
                                via = Some(origin.clone());
                            }
                        }
                        match &src.value {
                            FormulaValue::Error { o: next, .. } if *next != origin => origin = next.clone(),
                            _ => break,
                        }
                    }
                    let (cause, function) = cause.unwrap_or(("undetermined".into(), None));
                    obj.insert("cause".into(), Value::String(cause));
                    if let Some(f) = function {
                        obj.insert("function".into(), Value::String(f));
                    }
                    if let Some(v) = via {
                        obj.insert("via".into(), Value::String(v));
                    }
                    if !m.is_empty() {
                        obj.insert("message".into(), Value::String(m.clone()));
                    }
                }
            }
            obj.insert("volatile".into(), Value::Bool(volatile));
            out_cells.push(Value::Object(obj));
        }

        json!({
            "sheets": sheet_names,
            "counts": {"formula_cells": entries.len(), "errors": counts_errors, "volatile": counts_volatile},
            "spill_cells": spill_cells,
            "cells": out_cells,
        })
        .to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn external_references() {
        assert!(refers_to_other_workbook("[1]Sheet1!A1"));
        assert!(refers_to_other_workbook("SUM('[2]My Sheet'!A1:B2)"));
        assert!(refers_to_other_workbook("=A1+[3]Data!$B$4"));
        assert!(!refers_to_other_workbook("Table1[Col]"));
        assert!(!refers_to_other_workbook("Table1[[#This Row],[2019]]"));
        assert!(!refers_to_other_workbook("\"[1]x\"&A1"));
        assert!(!refers_to_other_workbook("[0]Sheet1!A1"));
    }

    #[test]
    fn calls() {
        assert_eq!(functions_called("=SUM(A1)+_xlfn.CONCAT(\"NOW()\",B1)"), vec!["SUM", "CONCAT"]);
        assert_eq!(functions_called("='IF(x'!A1+now()"), vec!["NOW"]);
        assert!(has_implicit_intersection("=@B4:F4"));
        assert!(!has_implicit_intersection("=\"a@b\""));
    }

    #[test]
    fn cells_counted() {
        assert_eq!(count_cells(b"<sheetData><row><c r=\"A1\"/><c r=\"B1\"><v>1</v></c><col/><cfRule/></row></sheetData>"), 2);
        assert_eq!(count_cells(b"<x:c r=\"A1\"></x:c><x:cols/>"), 1);
    }
}
