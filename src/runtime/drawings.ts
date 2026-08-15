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

  lineNew(bar: number, extra?: Record<string, unknown>): number {
    return this.push("line", bar, { extra, cap: this.maxLines });
  }

  labelNew(bar: number, text?: string): number {
    return this.push("label", bar, { text, cap: this.maxLabels });
  }

  boxNew(bar: number): number {
    return this.push("box", bar, { cap: this.maxBoxes });
  }

  tableNew(bar: number): number {
    return this.push("table", bar);
  }

  polylineNew(bar: number): number {
    return this.push("polyline", bar, { cap: this.maxPolylines });
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
