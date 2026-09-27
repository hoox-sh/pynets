/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Compile-path drawings. Wraps DrawingBook; extras go on `__drawings`.
 */
import { PineArray } from "../array.ts";
import { DrawingBook, type DrawingEvent, type DrawingKind } from "../drawings.ts";
import { naNum } from "./helpers.ts";

function n(v: unknown, fallback = 0): number {
  const x = naNum(v);
  return x == null ? fallback : x;
}

function idOf(v: unknown): number {
  return n(v, -1);
}

/** Null id stays null (id 0 is a real drawing). */
function idNum(v: unknown): number | null {
  if (typeof v === "boolean") return v ? 1 : 0;
  if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v);
  return null;
}

function putNum(extra: Record<string, unknown>, key: string, v: unknown): void {
  const x = naNum(v);
  if (x != null) extra[key] = x;
}

function pointsOf(v: unknown): unknown[] {
  if (v instanceof PineArray) return v.toValues().filter((p) => p != null);
  if (Array.isArray(v)) return v.filter((p) => p != null);
  return [];
}

type ChartPoint = {
  __chartPoint: true;
  index: number | null;
  time: number | null;
  x: number | null;
  y: number | null;
  price: number | null;
};

function isPoint(v: unknown): v is ChartPoint {
  return typeof v === "object" && v !== null && (v as ChartPoint).__chartPoint === true;
}

function makePoint(index: number | null, time: number | null, price: number | null): ChartPoint {
  return { __chartPoint: true, index, time, x: index ?? time, y: price, price };
}

function pointXY(v: unknown): { x: number; y: number } | null {
  if (!isPoint(v)) return null;
  return { x: v.index ?? v.time ?? v.x ?? 0, y: v.price ?? v.y ?? 0 };
}

function truthy(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return Number.isFinite(v) && v !== 0;
  return false;
}

function alertText(v: unknown, fallback: string): string {
  if (v == null) return fallback;
  if (typeof v === "string") return v;
  if (typeof v === "boolean") return v ? "1" : "0";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : fallback;
  return fallback;
}

const DRAW_KINDS = new Set<DrawingKind>(["line", "label", "box", "table", "polyline", "linefill"]);

export class CompileDraw {
  readonly book = new DrawingBook();
  private alertKeys = new Map<string, number>();

  label_new(bar: unknown, text?: unknown, x?: unknown, y?: unknown): number {
    const extra: Record<string, unknown> = {};
    putNum(extra, "x", x);
    putNum(extra, "y", y);
    const t = text == null ? "" : String(text);
    return this.book.labelNew(n(bar, 0), t, Object.keys(extra).length ? extra : undefined);
  }

  line_new(bar: unknown, x1?: unknown, y1?: unknown, x2?: unknown, y2?: unknown): number {
    const extra: Record<string, unknown> = {};
    putNum(extra, "x1", x1);
    putNum(extra, "y1", y1);
    putNum(extra, "x2", x2);
    putNum(extra, "y2", y2);
    return this.book.lineNew(n(bar, 0), Object.keys(extra).length ? extra : undefined);
  }

  box_new(bar: unknown, left?: unknown, top?: unknown, right?: unknown, bottom?: unknown): number {
    const extra: Record<string, unknown> = {};
    putNum(extra, "left", left);
    putNum(extra, "top", top);
    putNum(extra, "right", right);
    putNum(extra, "bottom", bottom);
    return this.book.boxNew(n(bar, 0), Object.keys(extra).length ? extra : undefined);
  }

  table_new(bar: unknown): number {
    return this.book.tableNew(n(bar, 0));
  }

  polyline_new(bar: unknown, points?: unknown): number {
    const pts = pointsOf(points);
    return this.book.polylineNew(n(bar, 0), pts.length ? { points: pts } : undefined);
  }

  linefill_new(bar: unknown, id1?: unknown, id2?: unknown, color?: unknown): number {
    const extra: Record<string, unknown> = {};
    const a = idNum(id1);
    const b = idNum(id2);
    if (a != null) extra.id1 = a;
    if (b != null) extra.id2 = b;
    if (color != null) extra.color = color;
    return this.book.linefillNew(n(bar, 0), Object.keys(extra).length ? extra : undefined);
  }

  all(kind: unknown): PineArray {
    const arr = new PineArray();
    if (typeof kind === "string" && DRAW_KINDS.has(kind as DrawingKind)) {
      for (const id of this.book.allIds(kind as DrawingKind)) arr.push(id);
    }
    return arr;
  }

  copy(id: unknown): number | null {
    const i = idNum(id);
    if (i == null) return null;
    return this.book.copy(i);
  }

  label_set_text(id: unknown, text?: unknown): void {
    this.book.labelSetText(idOf(id), text == null ? "" : String(text));
  }

  label_set_xy(id: unknown, x?: unknown, y?: unknown): void {
    this.book.labelSetXy(idOf(id), n(x, 0), n(y, 0));
  }

  label_delete(id: unknown): void {
    this.book.labelDelete(idOf(id));
  }

  line_set_xy(id: unknown, x1?: unknown, y1?: unknown, x2?: unknown, y2?: unknown): void {
    this.book.lineSetXy(idOf(id), n(x1, 0), n(y1, 0), n(x2, 0), n(y2, 0));
  }

  line_delete(id: unknown): void {
    this.book.lineDelete(idOf(id));
  }

  line_set_xy1(id: unknown, x1?: unknown, y1?: unknown): void {
    this.book.lineSetXy1(idOf(id), n(x1, 0), n(y1, 0));
  }

  line_set_xy2(id: unknown, x2?: unknown, y2?: unknown): void {
    this.book.lineSetXy2(idOf(id), n(x2, 0), n(y2, 0));
  }

  line_set_color(id: unknown, color?: unknown): void {
    this.book.lineSetColor(idOf(id), color);
  }

  line_set_width(id: unknown, width?: unknown): void {
    this.book.lineSetWidth(idOf(id), width);
  }

  line_set_style(id: unknown, style?: unknown): void {
    this.book.lineSetStyle(idOf(id), style);
  }

  line_set_extend(id: unknown, extend?: unknown): void {
    this.book.lineSetExtend(idOf(id), extend);
  }

  line_get_price(id: unknown, x?: unknown): number | null {
    return this.book.lineGetPrice(idOf(id), x);
  }

  label_set_color(id: unknown, color?: unknown): void {
    this.book.labelSetColor(idOf(id), color);
  }

  label_set_style(id: unknown, style?: unknown): void {
    this.book.labelSetStyle(idOf(id), style);
  }

  label_set_size(id: unknown, size?: unknown): void {
    this.book.labelSetSize(idOf(id), size);
  }

  label_set_textalign(id: unknown, textalign?: unknown): void {
    this.book.labelSetTextalign(idOf(id), textalign);
  }

  label_set_tooltip(id: unknown, tooltip?: unknown): void {
    this.book.labelSetTooltip(idOf(id), tooltip);
  }

  label_get_x(id: unknown): number {
    const i = idNum(id);
    if (i == null) return 0;
    return this.book.labelGetX(i) ?? 0;
  }

  label_get_y(id: unknown): number {
    const i = idNum(id);
    if (i == null) return 0;
    return this.book.labelGetY(i) ?? 0;
  }

  label_get_text(id: unknown): string {
    const i = idNum(id);
    if (i == null) return "";
    return this.book.labelGetText(i) ?? "";
  }

  line_get_x1(id: unknown): number | null {
    const i = idNum(id);
    return i == null ? null : this.book.lineGetX1(i);
  }

  line_get_y1(id: unknown): number | null {
    const i = idNum(id);
    return i == null ? null : this.book.lineGetY1(i);
  }

  line_get_x2(id: unknown): number | null {
    const i = idNum(id);
    return i == null ? null : this.book.lineGetX2(i);
  }

  line_get_y2(id: unknown): number | null {
    const i = idNum(id);
    return i == null ? null : this.book.lineGetY2(i);
  }

  box_delete(id: unknown): void {
    this.book.boxDelete(idOf(id));
  }

  box_set(id: unknown, extra?: unknown): void {
    this.book.boxSet(idOf(id), extra as Record<string, unknown> | undefined);
  }

  box_set_corners(id: unknown, left?: unknown, top?: unknown, right?: unknown, bottom?: unknown): void {
    this.book.boxSetCorners(idOf(id), n(left, 0), n(top, 0), n(right, 0), n(bottom, 0));
  }

  box_set_bgcolor(id: unknown, bgcolor?: unknown): void {
    this.book.boxSetBgcolor(idOf(id), bgcolor);
  }

  box_set_border_color(id: unknown, color?: unknown): void {
    this.book.boxSetBorderColor(idOf(id), color);
  }

  box_set_text(id: unknown, text?: unknown): void {
    this.book.boxSetText(idOf(id), text);
  }

  box_set_extend(id: unknown, extend?: unknown): void {
    this.book.boxSetExtend(idOf(id), extend);
  }

  table_cell(id: unknown, column?: unknown, row?: unknown, text?: unknown): void {
    this.book.tableCell(idOf(id), column, row, text);
  }

  table_cell_set_text(id: unknown, row?: unknown, column?: unknown, text?: unknown): null {
    const i = idNum(id);
    if (i == null) return null;
    this.book.tableCellSetText(i, column, row, text == null ? "" : String(text));
    return null;
  }

  table_cell_get_text(id: unknown, row?: unknown, column?: unknown): string {
    const i = idNum(id);
    if (i == null) return "";
    return this.book.tableCellGetText(i, column, row) ?? "";
  }

  table_set_position(id: unknown, position?: unknown): void {
    this.book.tableSetPosition(idOf(id), position);
  }

  linefill_set_color(id: unknown, color?: unknown): void {
    this.book.linefillSetColor(idOf(id), color);
  }

  alert(bar: unknown, message?: unknown): void {
    this.book.alert(n(bar, 0), message == null ? "" : String(message));
  }

  /** Interpret `fireAlertCondition`: truthy condition, once per bar, source tag. */
  alertcondition(bar: unknown, condition: unknown, title?: unknown, message?: unknown): null {
    if (!truthy(condition)) return null;
    const t = alertText(title, "Alert");
    const m = alertText(message, "Alert");
    const b = n(bar, 0);
    const key = `alertcondition|${t}|${m}|once_per_bar`;
    if (this.alertKeys.get(key) === b) return null;
    this.alertKeys.set(key, b);
    this.book.alert(b, m);
    const ev = this.book.items[this.book.items.length - 1];
    if (ev != null) ev.extra = { source: "alertcondition", title: t, freq: "once_per_bar" };
    return null;
  }

  line_set_x1(id: unknown, x?: unknown): null {
    return this.kindNum("lineSetX1", id, x);
  }

  line_set_y1(id: unknown, y?: unknown): null {
    return this.kindNum("lineSetY1", id, y);
  }

  line_set_x2(id: unknown, x?: unknown): null {
    return this.kindNum("lineSetX2", id, x);
  }

  line_set_y2(id: unknown, y?: unknown): null {
    return this.kindNum("lineSetY2", id, y);
  }

  line_set_xloc(id: unknown, xloc?: unknown): null {
    return this.kindAny("lineSetXloc", id, xloc);
  }

  line_set_first_point(id: unknown, point?: unknown): null {
    const i = idNum(id);
    const xy = pointXY(point);
    if (i != null && xy) this.book.lineSetXy1(i, xy.x, xy.y);
    return null;
  }

  line_set_second_point(id: unknown, point?: unknown): null {
    const i = idNum(id);
    const xy = pointXY(point);
    if (i != null && xy) this.book.lineSetXy2(i, xy.x, xy.y);
    return null;
  }

  label_set_x(id: unknown, x?: unknown): null {
    return this.kindAny("labelSetX", id, x);
  }

  label_set_y(id: unknown, y?: unknown): null {
    return this.kindAny("labelSetY", id, y);
  }

  label_set_textcolor(id: unknown, color?: unknown): null {
    return this.kindAny("labelSetTextcolor", id, color);
  }

  label_set_text_font_family(id: unknown, font?: unknown): null {
    return this.kindAny("labelSetTextFontFamily", id, font);
  }

  label_set_text_halign(id: unknown, halign?: unknown): null {
    return this.kindAny("labelSetTextHalign", id, halign);
  }

  label_set_text_valign(id: unknown, valign?: unknown): null {
    return this.kindAny("labelSetTextValign", id, valign);
  }

  label_set_text_size(id: unknown, size?: unknown): null {
    return this.kindAny("labelSetTextSize", id, size);
  }

  label_set_text_formatting(id: unknown, formatting?: unknown): null {
    return this.kindAny("labelSetTextFormatting", id, formatting);
  }

  label_set_border_color(id: unknown, color?: unknown): null {
    return this.kindAny("labelSetBorderColor", id, color);
  }

  label_set_border_width(id: unknown, width?: unknown): null {
    return this.kindAny("labelSetBorderWidth", id, width);
  }

  label_set_border_style(id: unknown, style?: unknown): null {
    return this.kindAny("labelSetBorderStyle", id, style);
  }

  label_set_xloc(id: unknown, xloc?: unknown): null {
    return this.kindAny("labelSetXloc", id, xloc);
  }

  label_set_yloc(id: unknown, yloc?: unknown): null {
    return this.kindAny("labelSetYloc", id, yloc);
  }

  label_set_point(id: unknown, point?: unknown): null {
    const i = idNum(id);
    const xy = pointXY(point);
    if (i != null && xy) this.book.labelSetXy(i, xy.x, xy.y);
    return null;
  }

  box_get_left(id: unknown): number {
    return this.boxGet("boxGetLeft", id);
  }

  box_get_right(id: unknown): number {
    return this.boxGet("boxGetRight", id);
  }

  box_get_top(id: unknown): number {
    return this.boxGet("boxGetTop", id);
  }

  box_get_bottom(id: unknown): number {
    return this.boxGet("boxGetBottom", id);
  }

  box_set_left(id: unknown, left?: unknown): null {
    return this.kindAny("boxSetLeft", id, left);
  }

  box_set_right(id: unknown, right?: unknown): null {
    return this.kindAny("boxSetRight", id, right);
  }

  box_set_top(id: unknown, top?: unknown): null {
    return this.kindAny("boxSetTop", id, top);
  }

  box_set_bottom(id: unknown, bottom?: unknown): null {
    return this.kindAny("boxSetBottom", id, bottom);
  }

  box_set_border_width(id: unknown, width?: unknown): null {
    return this.kindAny("boxSetBorderWidth", id, width);
  }

  box_set_border_style(id: unknown, style?: unknown): null {
    return this.kindAny("boxSetBorderStyle", id, style);
  }

  box_set_closed(id: unknown, closed?: unknown): null {
    return this.kindAny("boxSetClosed", id, closed);
  }

  box_set_rightbottom(id: unknown, right?: unknown, bottom?: unknown): null {
    const i = idNum(id);
    if (i != null) this.book.boxSetRightBottom(i, right, bottom);
    return null;
  }

  box_set_text_color(id: unknown, color?: unknown): null {
    return this.kindAny("boxSetTextColor", id, color);
  }

  box_set_text_font_family(id: unknown, font?: unknown): null {
    return this.kindAny("boxSetTextFontFamily", id, font);
  }

  box_set_text_halign(id: unknown, halign?: unknown): null {
    return this.kindAny("boxSetTextHalign", id, halign);
  }

  box_set_text_valign(id: unknown, valign?: unknown): null {
    return this.kindAny("boxSetTextValign", id, valign);
  }

  box_set_text_size(id: unknown, size?: unknown): null {
    return this.kindAny("boxSetTextSize", id, size);
  }

  box_set_text_formatting(id: unknown, formatting?: unknown): null {
    return this.kindAny("boxSetTextFormatting", id, formatting);
  }

  box_set_text_wrap(id: unknown, wrap?: unknown): null {
    return this.kindAny("boxSetTextWrap", id, wrap);
  }

  box_set_xloc(id: unknown, left?: unknown, right?: unknown, xloc?: unknown): null {
    const i = idNum(id);
    if (i == null) return null;
    this.book.boxSetLeft(i, left);
    this.book.boxSetRight(i, right);
    this.book.boxSetXloc(i, xloc);
    return null;
  }

  box_set_top_left_point(id: unknown, point?: unknown): null {
    const i = idNum(id);
    const xy = pointXY(point);
    if (i != null && xy) this.book.boxSetLeftTop(i, xy.x, xy.y);
    return null;
  }

  box_set_bottom_right_point(id: unknown, point?: unknown): null {
    const i = idNum(id);
    const xy = pointXY(point);
    if (i != null && xy) this.book.boxSetRightBottom(i, xy.x, xy.y);
    return null;
  }

  table_delete(id: unknown): null {
    const i = idNum(id);
    if (i != null) this.book.tableDelete(i);
    return null;
  }

  table_set_bgcolor(id: unknown, color?: unknown): null {
    return this.kindAny("tableSetBgcolor", id, color);
  }

  table_set_border_color(id: unknown, color?: unknown): null {
    return this.kindAny("tableSetBorderColor", id, color);
  }

  table_set_border_width(id: unknown, width?: unknown): null {
    return this.kindAny("tableSetBorderWidth", id, width);
  }

  table_set_frame_color(id: unknown, color?: unknown): null {
    return this.kindAny("tableSetFrameColor", id, color);
  }

  table_set_frame_width(id: unknown, width?: unknown): null {
    return this.kindAny("tableSetFrameWidth", id, width);
  }

  table_clear(id: unknown, startRow?: unknown, startCol?: unknown, endRow?: unknown, endCol?: unknown): null {
    const i = idNum(id);
    if (i == null) return null;
    if (arguments.length < 2) this.book.tableClear(i);
    else this.book.tableClear(i, startRow, startCol, endRow, endCol);
    return null;
  }

  table_merge_cells(id: unknown, startRow?: unknown, startCol?: unknown, endRow?: unknown, endCol?: unknown): null {
    const i = idNum(id);
    if (i != null) this.book.tableMergeCells(i, startRow, startCol, endRow, endCol);
    return null;
  }

  table_cell_set_text_color(id: unknown, row?: unknown, column?: unknown, value?: unknown): null {
    return this.cellField(id, column, row, "text_color", value);
  }

  table_cell_set_bgcolor(id: unknown, row?: unknown, column?: unknown, value?: unknown): null {
    return this.cellField(id, column, row, "bgcolor", value);
  }

  table_cell_set_border_color(id: unknown, row?: unknown, column?: unknown, value?: unknown): null {
    return this.cellField(id, column, row, "border_color", value);
  }

  table_cell_set_border_width(id: unknown, row?: unknown, column?: unknown, value?: unknown): null {
    return this.cellField(id, column, row, "border_width", value);
  }

  table_cell_set_tooltip(id: unknown, row?: unknown, column?: unknown, value?: unknown): null {
    return this.cellField(id, column, row, "tooltip", value);
  }

  table_cell_set_width(id: unknown, column?: unknown, row?: unknown, value?: unknown): null {
    return this.cellField(id, column, row, "width", value);
  }

  table_cell_set_height(id: unknown, column?: unknown, row?: unknown, value?: unknown): null {
    return this.cellField(id, column, row, "height", value);
  }

  table_cell_set_text_halign(id: unknown, column?: unknown, row?: unknown, value?: unknown): null {
    return this.cellField(id, column, row, "text_halign", value);
  }

  table_cell_set_text_valign(id: unknown, column?: unknown, row?: unknown, value?: unknown): null {
    return this.cellField(id, column, row, "text_valign", value);
  }

  table_cell_set_text_size(id: unknown, column?: unknown, row?: unknown, value?: unknown): null {
    return this.cellField(id, column, row, "text_size", value);
  }

  table_cell_set_text_font_family(id: unknown, column?: unknown, row?: unknown, value?: unknown): null {
    return this.cellField(id, column, row, "text_font_family", value);
  }

  table_cell_set_text_formatting(id: unknown, column?: unknown, row?: unknown, value?: unknown): null {
    return this.cellField(id, column, row, "text_formatting", value);
  }

  polyline_delete(id: unknown): null {
    const i = idNum(id);
    if (i != null) this.book.polylineDelete(i);
    return null;
  }

  polyline_get_points(id: unknown): PineArray {
    const arr = new PineArray();
    const i = idNum(id);
    if (i == null) return arr;
    for (const p of this.book.polylineGetPoints(i)) arr.push(p);
    return arr;
  }

  polyline_set_points(id: unknown, points?: unknown): null {
    const i = idNum(id);
    if (i != null) this.book.polylineSetPoints(i, pointsOf(points));
    return null;
  }

  polyline_set_line_color(id: unknown, color?: unknown): null {
    return this.kindAny("polylineSetLineColor", id, color);
  }

  polyline_set_line_width(id: unknown, width?: unknown): null {
    return this.kindAny("polylineSetLineWidth", id, width);
  }

  polyline_set_line_style(id: unknown, style?: unknown): null {
    return this.kindAny("polylineSetLineStyle", id, style);
  }

  polyline_set_fill_color(id: unknown, color?: unknown): null {
    return this.kindAny("polylineSetFillColor", id, color);
  }

  polyline_set_curved(id: unknown, curved?: unknown): null {
    return this.kindAny("polylineSetCurved", id, curved);
  }

  polyline_set_force_overlay(id: unknown, force?: unknown): null {
    return this.kindAny("polylineSetForceOverlay", id, force);
  }

  polyline_set_closed(id: unknown, closed?: unknown): null {
    return this.kindAny("polylineSetClosed", id, closed);
  }

  polyline_set_xloc(id: unknown, xloc?: unknown): null {
    return this.kindAny("polylineSetXloc", id, xloc);
  }

  linefill_delete(id: unknown): null {
    const i = idNum(id);
    if (i != null) this.book.linefillDelete(i);
    return null;
  }

  linefill_get_line1(id: unknown): number | null {
    const i = idNum(id);
    return i == null ? null : this.book.linefillGetLine1(i);
  }

  linefill_get_line2(id: unknown): number | null {
    const i = idNum(id);
    return i == null ? null : this.book.linefillGetLine2(i);
  }

  point_new(time: unknown, price: unknown): ChartPoint | null {
    const p = naNum(price);
    if (p == null) return null;
    return makePoint(null, naNum(time), p);
  }

  point_from_index(index: unknown, price: unknown): ChartPoint | null {
    const ix = naNum(index);
    const p = naNum(price);
    if (ix == null || p == null) return null;
    return makePoint(Math.trunc(ix), null, p);
  }

  point_now(bar: unknown, time: unknown, price: unknown): ChartPoint | null {
    const p = naNum(price);
    if (p == null) return null;
    const ix = naNum(bar);
    return makePoint(ix == null ? null : Math.trunc(ix), naNum(time), p);
  }

  point_copy(raw: unknown): ChartPoint {
    if (isPoint(raw)) return makePoint(raw.index, raw.time, raw.price);
    return makePoint(null, null, 0);
  }

  private kindNum(method: "lineSetX1" | "lineSetY1" | "lineSetX2" | "lineSetY2", id: unknown, value: unknown): null {
    const i = idNum(id);
    if (i != null) this.book[method](i, value);
    return null;
  }

  private kindAny(
    method:
      | "lineSetXloc"
      | "labelSetX"
      | "labelSetY"
      | "labelSetTextcolor"
      | "labelSetTextFontFamily"
      | "labelSetTextHalign"
      | "labelSetTextValign"
      | "labelSetTextSize"
      | "labelSetTextFormatting"
      | "labelSetBorderColor"
      | "labelSetBorderWidth"
      | "labelSetBorderStyle"
      | "labelSetXloc"
      | "labelSetYloc"
      | "boxSetLeft"
      | "boxSetRight"
      | "boxSetTop"
      | "boxSetBottom"
      | "boxSetBorderWidth"
      | "boxSetBorderStyle"
      | "boxSetClosed"
      | "boxSetTextColor"
      | "boxSetTextFontFamily"
      | "boxSetTextHalign"
      | "boxSetTextValign"
      | "boxSetTextSize"
      | "boxSetTextFormatting"
      | "boxSetTextWrap"
      | "tableSetBgcolor"
      | "tableSetBorderColor"
      | "tableSetBorderWidth"
      | "tableSetFrameColor"
      | "tableSetFrameWidth"
      | "polylineSetLineColor"
      | "polylineSetLineWidth"
      | "polylineSetLineStyle"
      | "polylineSetFillColor"
      | "polylineSetCurved"
      | "polylineSetForceOverlay"
      | "polylineSetClosed"
      | "polylineSetXloc",
    id: unknown,
    value: unknown,
  ): null {
    const i = idNum(id);
    if (i != null) this.book[method](i, value);
    return null;
  }

  private boxGet(
    method: "boxGetLeft" | "boxGetRight" | "boxGetTop" | "boxGetBottom",
    id: unknown,
  ): number {
    const i = idNum(id);
    if (i == null) return 0;
    return this.book[method](i) ?? 0;
  }

  private cellField(id: unknown, column: unknown, row: unknown, field: string, value: unknown): null {
    const i = idNum(id);
    if (i != null) this.book.tableCellSetField(i, column, row, field, value);
    return null;
  }

  extras(): { __drawings: DrawingEvent[] } {
    return { __drawings: this.book.items.slice() };
  }
}

export function createCompileDraw(): CompileDraw {
  return new CompileDraw();
}
