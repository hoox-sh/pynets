/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Stub drawing / alert book. Records line/label/box/alert/table/polyline/
 * linefill events; new() helpers return incrementing ids. Caps match Python
 * DrawingRegistry (default 50; lines/labels/boxes hard 500, polylines 100).
 * Alerts / tables / linefills are uncapped. Interpret wiring is out of scope.
 */

export type DrawingKind =
  | "line"
  | "label"
  | "box"
  | "alert"
  | "table"
  | "polyline"
  | "linefill";

export interface DrawingEvent {
  kind: DrawingKind;
  bar: number;
  text?: string;
  extra?: Record<string, unknown>;
  deleted?: boolean;
}

export interface DrawingLimits {
  max_lines_count?: number;
  max_labels_count?: number;
  max_boxes_count?: number;
  max_polylines_count?: number;
}

const DEFAULT_DRAWING_LIMIT = 50;
const HARD_CAP_LINES_LABELS_BOXES = 500;
const HARD_CAP_POLYLINES = 100;

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function clampLimit(value: unknown, fallback: number, hardCap: number): number {
  if (value == null || typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(1, Math.min(hardCap, Math.trunc(value)));
}

function safeBar(bar: unknown): number {
  return isFiniteNumber(bar) ? bar : 0;
}

function asExtra(extra: unknown): Record<string, unknown> | undefined {
  if (extra == null || typeof extra !== "object" || Array.isArray(extra)) return undefined;
  return { ...(extra as Record<string, unknown>) };
}

function setNum(extra: Record<string, unknown>, key: string, value: unknown): void {
  if (isFiniteNumber(value)) extra[key] = value;
}

function setAny(extra: Record<string, unknown>, key: string, value: unknown): void {
  extra[key] = value;
}

function cellKey(column: unknown, row: unknown): string | undefined {
  if (!isFiniteNumber(column) || !isFiniteNumber(row)) return undefined;
  return `${column},${row}`;
}

function asIndex(value: unknown): number | null {
  if (!isFiniteNumber(value)) return null;
  return Math.trunc(value);
}

function parseCellKey(key: string): { col: number; row: number } | undefined {
  const comma = key.indexOf(",");
  if (comma < 0) return undefined;
  const col = Number(key.slice(0, comma));
  const row = Number(key.slice(comma + 1));
  if (!isFiniteNumber(col) || !isFiniteNumber(row)) return undefined;
  return { col, row };
}

function cloneExtra(extra?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (extra == null) return undefined;
  const out: Record<string, unknown> = { ...extra };
  if (out.cells != null && typeof out.cells === "object" && !Array.isArray(out.cells)) {
    const cells: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(out.cells as Record<string, unknown>)) {
      cells[k] = v != null && typeof v === "object" && !Array.isArray(v) ? { ...(v as Record<string, unknown>) } : v;
    }
    out.cells = cells;
  }
  if (Array.isArray(out.points)) {
    out.points = out.points.map((p) => (p != null && typeof p === "object" ? { ...(p as Record<string, unknown>) } : p));
  }
  if (Array.isArray(out.merged)) out.merged = out.merged.slice();
  return out;
}

export class DrawingBook {
  readonly items: DrawingEvent[] = [];
  private readonly byId = new Map<number, DrawingEvent>();
  private nextId = 0;
  private maxLines = DEFAULT_DRAWING_LIMIT;
  private maxLabels = DEFAULT_DRAWING_LIMIT;
  private maxBoxes = DEFAULT_DRAWING_LIMIT;
  private maxPolylines = DEFAULT_DRAWING_LIMIT;

  constructor(limits?: DrawingLimits) {
    if (limits != null) this.configure(limits);
  }

  configure(limits: DrawingLimits): void {
    if (limits == null || typeof limits !== "object") return;
    if (limits.max_lines_count !== undefined) {
      this.maxLines = clampLimit(limits.max_lines_count, this.maxLines, HARD_CAP_LINES_LABELS_BOXES);
    }
    if (limits.max_labels_count !== undefined) {
      this.maxLabels = clampLimit(limits.max_labels_count, this.maxLabels, HARD_CAP_LINES_LABELS_BOXES);
    }
    if (limits.max_boxes_count !== undefined) {
      this.maxBoxes = clampLimit(limits.max_boxes_count, this.maxBoxes, HARD_CAP_LINES_LABELS_BOXES);
    }
    if (limits.max_polylines_count !== undefined) {
      this.maxPolylines = clampLimit(limits.max_polylines_count, this.maxPolylines, HARD_CAP_POLYLINES);
    }
    this.gc("line", this.maxLines);
    this.gc("label", this.maxLabels);
    this.gc("box", this.maxBoxes);
    this.gc("polyline", this.maxPolylines);
  }

  get(id: number): DrawingEvent | undefined {
    return this.byId.get(id);
  }

  all(kind: DrawingKind): DrawingEvent[] {
    return this.items.filter((e) => e.kind === kind && !e.deleted);
  }

  /** Insertion-order ids of non-deleted objects of *kind* (Python `*.all`). */
  allIds(kind: DrawingKind): number[] {
    const ids: number[] = [];
    for (const [id, ev] of this.byId) {
      if (ev.kind === kind && !ev.deleted) ids.push(id);
    }
    return ids;
  }

  lineNew(bar: number, extra?: Record<string, unknown>): number {
    return this.push("line", bar, { extra, cap: this.maxLines });
  }

  labelNew(bar: number, text?: string, extra?: Record<string, unknown>): number {
    return this.push("label", bar, { text, extra, cap: this.maxLabels });
  }

  boxNew(bar: number, extra?: Record<string, unknown>): number {
    return this.push("box", bar, { extra, cap: this.maxBoxes });
  }

  tableNew(bar: number, extra?: Record<string, unknown>): number {
    return this.push("table", bar, { extra });
  }

  polylineNew(bar: number, extra?: Record<string, unknown>): number {
    return this.push("polyline", bar, { extra, cap: this.maxPolylines });
  }

  linefillNew(bar: number, extraOrId1?: Record<string, unknown> | number, id2?: number): number {
    const extra: Record<string, unknown> = {};
    const patch = asExtra(extraOrId1);
    if (patch != null) {
      Object.assign(extra, patch);
    } else {
      if (isFiniteNumber(extraOrId1)) extra.id1 = extraOrId1;
      if (isFiniteNumber(id2)) extra.id2 = id2;
    }
    return this.push("linefill", bar, { extra: Object.keys(extra).length ? extra : undefined });
  }

  alert(bar: number, message: string): void {
    this.items.push({
      kind: "alert",
      bar: safeBar(bar),
      text: message == null ? "" : String(message),
    });
  }

  lineSetXy(id: number, x1: number, y1: number, x2: number, y2: number): void {
    const extra = this.extraOf(id);
    if (!extra) return;
    setNum(extra, "x1", x1);
    setNum(extra, "y1", y1);
    setNum(extra, "x2", x2);
    setNum(extra, "y2", y2);
  }

  lineSetXy1(id: number, x1: number, y1: number): void {
    const extra = this.extraOf(id);
    if (!extra) return;
    setNum(extra, "x1", x1);
    setNum(extra, "y1", y1);
  }

  lineSetXy2(id: number, x2: number, y2: number): void {
    const extra = this.extraOf(id);
    if (!extra) return;
    setNum(extra, "x2", x2);
    setNum(extra, "y2", y2);
  }

  labelSetText(id: number, text: string): void {
    const ev = this.byId.get(id);
    if (!ev) return;
    ev.text = text == null ? "" : String(text);
  }

  labelSetXy(id: number, x: number, y: number): void {
    const extra = this.extraOf(id);
    if (!extra) return;
    setNum(extra, "x", x);
    setNum(extra, "y", y);
  }

  boxSet(id: number, extra?: Record<string, unknown>): void {
    const ev = this.byId.get(id);
    const patch = asExtra(extra);
    if (!ev || patch == null) return;
    ev.extra = { ...(ev.extra ?? {}), ...patch };
  }

  boxSetCorners(id: number, left: number, top: number, right: number, bottom: number): void {
    const extra = this.extraOf(id, "box");
    if (!extra) return;
    setNum(extra, "left", left);
    setNum(extra, "top", top);
    setNum(extra, "right", right);
    setNum(extra, "bottom", bottom);
  }

  lineSetColor(id: number, color: unknown): void {
    const extra = this.extraOf(id, "line");
    if (!extra) return;
    setAny(extra, "color", color);
  }

  lineSetWidth(id: number, width: unknown): void {
    const extra = this.extraOf(id, "line");
    if (!extra) return;
    setNum(extra, "width", width);
  }

  lineSetStyle(id: number, style: unknown): void {
    const extra = this.extraOf(id, "line");
    if (!extra) return;
    setAny(extra, "style", style);
  }

  lineSetExtend(id: number, extend: unknown): void {
    const extra = this.extraOf(id, "line");
    if (!extra) return;
    setAny(extra, "extend", extend);
  }

  lineGetX1(id: number): number | null {
    return this.lineGetNum(id, "x1");
  }

  lineGetY1(id: number): number | null {
    return this.lineGetNum(id, "y1");
  }

  lineGetX2(id: number): number | null {
    return this.lineGetNum(id, "x2");
  }

  lineGetY2(id: number): number | null {
    return this.lineGetNum(id, "y2");
  }

  getX1(id: number): number | null {
    return this.extraNum(id, "x1");
  }

  getY1(id: number): number | null {
    return this.extraNum(id, "y1");
  }

  getX2(id: number): number | null {
    return this.extraNum(id, "x2");
  }

  getY2(id: number): number | null {
    return this.extraNum(id, "y2");
  }

  labelGetX(id: number): number | null {
    const ev = this.byId.get(id);
    if (!ev || ev.kind !== "label") return null;
    return this.extraNum(id, "x");
  }

  labelGetY(id: number): number | null {
    const ev = this.byId.get(id);
    if (!ev || ev.kind !== "label") return null;
    return this.extraNum(id, "y");
  }

  labelGetText(id: number): string | null {
    const ev = this.byId.get(id);
    if (!ev || ev.kind !== "label") return null;
    if (ev.text !== undefined) return ev.text;
    const t = ev.extra?.text;
    return t == null ? null : String(t);
  }

  lineGetPrice(id: number, x: unknown): number | null {
    if (!isFiniteNumber(x)) return null;
    const x1 = this.lineGetNum(id, "x1");
    const y1 = this.lineGetNum(id, "y1");
    const x2 = this.lineGetNum(id, "x2");
    const y2 = this.lineGetNum(id, "y2");
    if (x1 == null || y1 == null || x2 == null || y2 == null) return null;
    if (x1 === x2) return y1;
    const t = (x - x1) / (x2 - x1);
    return y1 + t * (y2 - y1);
  }

  labelSetColor(id: number, color: unknown): void {
    const extra = this.extraOf(id, "label");
    if (!extra) return;
    setAny(extra, "color", color);
  }

  labelSetStyle(id: number, style: unknown): void {
    const extra = this.extraOf(id, "label");
    if (!extra) return;
    setAny(extra, "style", style);
  }

  labelSetSize(id: number, size: unknown): void {
    const extra = this.extraOf(id, "label");
    if (!extra) return;
    setAny(extra, "size", size);
  }

  labelSetTextalign(id: number, textalign: unknown): void {
    const extra = this.extraOf(id, "label");
    if (!extra) return;
    setAny(extra, "textalign", textalign);
  }

  labelSetTooltip(id: number, tooltip: unknown): void {
    const extra = this.extraOf(id, "label");
    if (!extra) return;
    setAny(extra, "tooltip", tooltip);
  }

  boxSetBgcolor(id: number, bgcolor: unknown): void {
    const extra = this.extraOf(id, "box");
    if (!extra) return;
    setAny(extra, "bgcolor", bgcolor);
  }

  boxSetBorderColor(id: number, color: unknown): void {
    const extra = this.extraOf(id, "box");
    if (!extra) return;
    setAny(extra, "border_color", color);
  }

  boxSetText(id: number, text: unknown): void {
    const extra = this.extraOf(id, "box");
    if (!extra) return;
    setAny(extra, "text", text == null ? "" : String(text));
  }

  boxSetExtend(id: number, extend: unknown): void {
    const extra = this.extraOf(id, "box");
    if (!extra) return;
    setAny(extra, "extend", extend);
  }

  tableCell(id: number, column: unknown, row: unknown, text?: unknown): void {
    this.upsertCell(id, column, row, text, text !== undefined);
  }

  tableCellSetText(id: number, column: unknown, row: unknown, text: unknown): void {
    this.upsertCell(id, column, row, text, true);
  }

  tableSetPosition(id: number, position: unknown): void {
    const extra = this.extraOf(id, "table");
    if (!extra) return;
    setAny(extra, "position", position);
  }

  linefillSetColor(id: number, color: unknown): void {
    const extra = this.extraOf(id, "linefill");
    if (!extra) return;
    setAny(extra, "color", color);
  }

  lineSetX1(id: number, x1: unknown): void {
    this.setKindNum(id, "line", "x1", x1);
  }

  lineSetY1(id: number, y1: unknown): void {
    this.setKindNum(id, "line", "y1", y1);
  }

  lineSetX2(id: number, x2: unknown): void {
    this.setKindNum(id, "line", "x2", x2);
  }

  lineSetY2(id: number, y2: unknown): void {
    this.setKindNum(id, "line", "y2", y2);
  }

  lineSetXloc(id: number, xloc: unknown): void {
    this.setKindAny(id, "line", "xloc", xloc);
  }

  boxGetLeft(id: number): number | null {
    return this.kindNum(id, "box", "left");
  }

  boxGetRight(id: number): number | null {
    return this.kindNum(id, "box", "right");
  }

  boxGetTop(id: number): number | null {
    return this.kindNum(id, "box", "top");
  }

  boxGetBottom(id: number): number | null {
    return this.kindNum(id, "box", "bottom");
  }

  boxSetLeft(id: number, left: unknown): void {
    this.setKindNum(id, "box", "left", left);
  }

  boxSetRight(id: number, right: unknown): void {
    this.setKindNum(id, "box", "right", right);
  }

  boxSetTop(id: number, top: unknown): void {
    this.setKindNum(id, "box", "top", top);
  }

  boxSetBottom(id: number, bottom: unknown): void {
    this.setKindNum(id, "box", "bottom", bottom);
  }

  boxSetLeftTop(id: number, left: unknown, top: unknown): void {
    const extra = this.extraOf(id, "box");
    if (!extra) return;
    setNum(extra, "left", left);
    setNum(extra, "top", top);
  }

  boxSetRightBottom(id: number, right: unknown, bottom: unknown): void {
    const extra = this.extraOf(id, "box");
    if (!extra) return;
    setNum(extra, "right", right);
    setNum(extra, "bottom", bottom);
  }

  boxSetBorderWidth(id: number, width: unknown): void {
    this.setKindNum(id, "box", "border_width", width);
  }

  boxSetBorderStyle(id: number, style: unknown): void {
    this.setKindAny(id, "box", "border_style", style);
  }

  boxSetXloc(id: number, xloc: unknown): void {
    this.setKindAny(id, "box", "xloc", xloc);
  }

  boxSetClosed(id: number, closed: unknown): void {
    this.setKindAny(id, "box", "closed", closed);
  }

  boxSetTextColor(id: number, color: unknown): void {
    this.setKindAny(id, "box", "text_color", color);
  }

  boxSetTextFontFamily(id: number, font: unknown): void {
    this.setKindAny(id, "box", "text_font_family", font);
  }

  boxSetTextHalign(id: number, halign: unknown): void {
    this.setKindAny(id, "box", "text_halign", halign);
  }

  boxSetTextValign(id: number, valign: unknown): void {
    this.setKindAny(id, "box", "text_valign", valign);
  }

  boxSetTextSize(id: number, size: unknown): void {
    this.setKindAny(id, "box", "text_size", size);
  }

  boxSetTextFormatting(id: number, formatting: unknown): void {
    this.setKindAny(id, "box", "text_formatting", formatting);
  }

  boxSetTextWrap(id: number, wrap: unknown): void {
    this.setKindAny(id, "box", "text_wrap", wrap);
  }

  labelSetX(id: number, x: unknown): void {
    this.setKindNum(id, "label", "x", x);
  }

  labelSetY(id: number, y: unknown): void {
    this.setKindNum(id, "label", "y", y);
  }

  labelSetTextcolor(id: number, color: unknown): void {
    this.setKindAny(id, "label", "textcolor", color);
  }

  labelSetTextFontFamily(id: number, font: unknown): void {
    this.setKindAny(id, "label", "text_font_family", font);
  }

  labelSetTextHalign(id: number, halign: unknown): void {
    this.setKindAny(id, "label", "text_halign", halign);
  }

  labelSetTextValign(id: number, valign: unknown): void {
    this.setKindAny(id, "label", "text_valign", valign);
  }

  labelSetTextSize(id: number, size: unknown): void {
    this.setKindAny(id, "label", "text_size", size);
  }

  labelSetTextFormatting(id: number, formatting: unknown): void {
    this.setKindAny(id, "label", "text_formatting", formatting);
  }

  labelSetBorderColor(id: number, color: unknown): void {
    this.setKindAny(id, "label", "border_color", color);
  }

  labelSetBorderWidth(id: number, width: unknown): void {
    this.setKindNum(id, "label", "border_width", width);
  }

  labelSetBorderStyle(id: number, style: unknown): void {
    this.setKindAny(id, "label", "border_style", style);
  }

  labelSetXloc(id: number, xloc: unknown): void {
    this.setKindAny(id, "label", "xloc", xloc);
  }

  labelSetYloc(id: number, yloc: unknown): void {
    this.setKindAny(id, "label", "yloc", yloc);
  }

  tableCellGetText(id: number, column: unknown, row: unknown): string | null {
    const rec = this.cellRec(id, column, row);
    if (!rec) return null;
    if (rec.text === undefined) return null;
    return rec.text == null ? "" : String(rec.text);
  }

  tableCellSetField(id: number, column: unknown, row: unknown, field: string, value: unknown): void {
    this.upsertCell(id, column, row, undefined, false);
    const rec = this.cellRec(id, column, row);
    if (!rec) return;
    rec[field] = value;
  }

  tableSetBgcolor(id: number, color: unknown): void {
    this.setKindAny(id, "table", "bgcolor", color);
  }

  tableSetBorderColor(id: number, color: unknown): void {
    this.setKindAny(id, "table", "border_color", color);
  }

  tableSetBorderWidth(id: number, width: unknown): void {
    this.setKindNum(id, "table", "border_width", width);
  }

  tableSetFrameColor(id: number, color: unknown): void {
    this.setKindAny(id, "table", "frame_color", color);
  }

  tableSetFrameWidth(id: number, width: unknown): void {
    this.setKindNum(id, "table", "frame_width", width);
  }

  tableClear(
    id: number,
    startRow?: unknown,
    startCol?: unknown,
    endRow?: unknown,
    endCol?: unknown,
  ): void {
    const extra = this.extraOf(id, "table");
    if (!extra) return;
    if (startRow === undefined) {
      extra.cells = {};
      return;
    }
    const r0 = asIndex(startRow);
    const c0 = asIndex(startCol);
    const r1 = asIndex(endRow);
    const c1 = asIndex(endCol);
    if (r0 == null || c0 == null || r1 == null || c1 == null) return;
    const prev = extra.cells;
    if (prev == null || typeof prev !== "object" || Array.isArray(prev)) return;
    const cells = prev as Record<string, unknown>;
    for (const key of Object.keys(cells)) {
      const parsed = parseCellKey(key);
      if (parsed == null) continue;
      if (r0 <= parsed.row && parsed.row <= r1 && c0 <= parsed.col && parsed.col <= c1) {
        delete cells[key];
      }
    }
  }

  tableMergeCells(
    id: number,
    startRow: unknown,
    startCol: unknown,
    endRow: unknown,
    endCol: unknown,
  ): void {
    const extra = this.extraOf(id, "table");
    if (!extra) return;
    const r0 = asIndex(startRow);
    const c0 = asIndex(startCol);
    const r1 = asIndex(endRow);
    const c1 = asIndex(endCol);
    if (r0 == null || c0 == null || r1 == null || c1 == null) return;
    if (r1 < r0 || c1 < c0) return;
    const prev = extra.merged;
    const merged = Array.isArray(prev) ? prev : [];
    if (merged !== prev) extra.merged = merged;
    merged.push([r0, c0, r1, c1]);
  }

  polylineGetPoints(id: number): unknown[] {
    const ev = this.byId.get(id);
    if (!ev || ev.kind !== "polyline" || ev.deleted) return [];
    const pts = ev.extra?.points;
    return Array.isArray(pts) ? pts.slice() : [];
  }

  polylineSetPoints(id: number, points: unknown): void {
    const extra = this.extraOf(id, "polyline");
    if (!extra) return;
    extra.points = Array.isArray(points) ? points.filter((p) => p != null) : [];
  }

  polylineSetLineColor(id: number, color: unknown): void {
    this.setKindAny(id, "polyline", "color", color);
  }

  polylineSetLineWidth(id: number, width: unknown): void {
    this.setKindNum(id, "polyline", "width", width);
  }

  polylineSetLineStyle(id: number, style: unknown): void {
    this.setKindAny(id, "polyline", "style", style);
  }

  polylineSetFillColor(id: number, color: unknown): void {
    this.setKindAny(id, "polyline", "fill_color", color);
  }

  polylineSetCurved(id: number, curved: unknown): void {
    this.setKindAny(id, "polyline", "curved", curved);
  }

  polylineSetForceOverlay(id: number, force: unknown): void {
    this.setKindAny(id, "polyline", "force_overlay", force);
  }

  polylineSetClosed(id: number, closed: unknown): void {
    this.setKindAny(id, "polyline", "closed", closed);
  }

  polylineSetXloc(id: number, xloc: unknown): void {
    this.setKindAny(id, "polyline", "xloc", xloc);
  }

  linefillGetLine1(id: number): number | null {
    return this.kindNum(id, "linefill", "id1");
  }

  linefillGetLine2(id: number): number | null {
    return this.kindNum(id, "linefill", "id2");
  }

  tableDelete(id: number): void {
    this.markDeleted(id);
  }

  polylineDelete(id: number): void {
    this.markDeleted(id);
  }

  linefillDelete(id: number): void {
    this.markDeleted(id);
  }

  /** Clone a drawing; missing id → null. New object is not marked deleted. */
  copy(id: number): number | null {
    const ev = this.byId.get(id);
    if (!ev) return null;
    const extra = cloneExtra(ev.extra);
    return this.push(ev.kind, ev.bar, { text: ev.text, extra, cap: this.capFor(ev.kind) });
  }

  /** Compact non-deleted items for RuntimeResult.drawings. */
  exportForApi(): Array<{
    kind: DrawingKind;
    bar: number;
    text?: string;
    extra?: Record<string, unknown>;
  }> {
    const out: Array<{
      kind: DrawingKind;
      bar: number;
      text?: string;
      extra?: Record<string, unknown>;
    }> = [];
    for (const ev of this.items) {
      if (ev.deleted) continue;
      const rec: {
        kind: DrawingKind;
        bar: number;
        text?: string;
        extra?: Record<string, unknown>;
      } = { kind: ev.kind, bar: ev.bar };
      if (ev.text !== undefined) rec.text = ev.text;
      if (ev.extra !== undefined) rec.extra = { ...ev.extra };
      out.push(rec);
    }
    return out;
  }

  lineDelete(id: number): void {
    this.markDeleted(id);
  }

  labelDelete(id: number): void {
    this.markDeleted(id);
  }

  boxDelete(id: number): void {
    this.markDeleted(id);
  }

  private push(
    kind: DrawingKind,
    bar: number,
    opts?: { text?: string; extra?: Record<string, unknown>; cap?: number },
  ): number {
    const id = this.nextId++;
    const ev: DrawingEvent = { kind, bar: safeBar(bar) };
    if (opts?.text !== undefined && opts.text !== null) ev.text = String(opts.text);
    const extra = asExtra(opts?.extra);
    if (extra !== undefined) ev.extra = extra;
    this.items.push(ev);
    this.byId.set(id, ev);
    if (opts?.cap != null) this.gc(kind, opts.cap);
    return id;
  }

  private capFor(kind: DrawingKind): number | undefined {
    if (kind === "line") return this.maxLines;
    if (kind === "label") return this.maxLabels;
    if (kind === "box") return this.maxBoxes;
    if (kind === "polyline") return this.maxPolylines;
    return undefined;
  }

  private setKindNum(id: number, kind: DrawingKind, key: string, value: unknown): void {
    const extra = this.extraOf(id, kind);
    if (!extra) return;
    setNum(extra, key, value);
  }

  private setKindAny(id: number, kind: DrawingKind, key: string, value: unknown): void {
    const extra = this.extraOf(id, kind);
    if (!extra) return;
    setAny(extra, key, value);
  }

  private kindNum(id: number, kind: DrawingKind, key: string): number | null {
    const ev = this.byId.get(id);
    if (!ev || ev.kind !== kind) return null;
    return this.extraNum(id, key);
  }

  private cellRec(id: number, column: unknown, row: unknown): Record<string, unknown> | undefined {
    const extra = this.extraOf(id, "table");
    const key = cellKey(column, row);
    if (!extra || key == null) return undefined;
    const prev = extra.cells;
    if (prev == null || typeof prev !== "object" || Array.isArray(prev)) return undefined;
    const cur = (prev as Record<string, unknown>)[key];
    if (cur == null || typeof cur !== "object" || Array.isArray(cur)) return undefined;
    return cur as Record<string, unknown>;
  }

  private extraOf(id: number, kind?: DrawingKind): Record<string, unknown> | undefined {
    const ev = this.byId.get(id);
    if (!ev) return undefined;
    if (kind != null && ev.kind !== kind) return undefined;
    if (ev.extra == null) ev.extra = {};
    return ev.extra;
  }

  private lineGetNum(id: number, key: "x1" | "y1" | "x2" | "y2"): number | null {
    const ev = this.byId.get(id);
    if (!ev || ev.kind !== "line") return null;
    const v = ev.extra?.[key];
    return isFiniteNumber(v) ? v : null;
  }

  private extraNum(id: number, key: string): number | null {
    const ev = this.byId.get(id);
    if (!ev) return null;
    const v = ev.extra?.[key];
    return isFiniteNumber(v) ? v : null;
  }

  private upsertCell(
    id: number,
    column: unknown,
    row: unknown,
    text: unknown,
    setText: boolean,
  ): void {
    const extra = this.extraOf(id, "table");
    const key = cellKey(column, row);
    if (!extra || key == null) return;
    const prev = extra.cells;
    const cells =
      prev != null && typeof prev === "object" && !Array.isArray(prev)
        ? (prev as Record<string, unknown>)
        : {};
    if (cells !== prev) extra.cells = cells;
    const cur = cells[key];
    const rec =
      cur != null && typeof cur === "object" && !Array.isArray(cur)
        ? (cur as Record<string, unknown>)
        : {};
    if (setText) rec.text = text == null ? "" : String(text);
    else if (rec.text === undefined) rec.text = "";
    cells[key] = rec;
  }

  private markDeleted(id: number): void {
    const ev = this.byId.get(id);
    if (!ev) return;
    ev.deleted = true;
  }

  /**
   * Drop oldest active objects of *kind* from `items` when over *cap*
   * so RuntimeResult.drawings stays bounded (Python marks deleted).
   */
  private gc(kind: DrawingKind, cap: number): void {
    const limit = cap > 0 ? cap : DEFAULT_DRAWING_LIMIT;
    let n = 0;
    for (const ev of this.items) {
      if (ev.kind === kind && !ev.deleted) n++;
    }
    let excess = n - limit;
    if (excess <= 0) return;
    for (let i = 0; i < this.items.length && excess > 0; ) {
      const ev = this.items[i]!;
      if (ev.kind === kind && !ev.deleted) {
        ev.deleted = true;
        this.items.splice(i, 1);
        this.forget(ev);
        excess--;
      } else {
        i++;
      }
    }
  }

  private forget(ev: DrawingEvent): void {
    for (const [id, item] of this.byId) {
      if (item === ev) {
        this.byId.delete(id);
        return;
      }
    }
  }
}
