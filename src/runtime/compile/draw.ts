/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Compile-path drawings. Wraps DrawingBook; extras go on `__drawings`.
 */
import { DrawingBook, type DrawingEvent } from "../drawings.ts";
import { naNum } from "./helpers.ts";

function n(v: unknown, fallback = 0): number {
  const x = naNum(v);
  return x == null ? fallback : x;
}

function idOf(v: unknown): number {
  return n(v, -1);
}

export class CompileDraw {
  readonly book = new DrawingBook();

  label_new(bar: unknown, text?: unknown): number {
    return this.book.labelNew(n(bar, 0), text == null ? undefined : String(text));
  }

  line_new(bar: unknown): number {
    return this.book.lineNew(n(bar, 0));
  }

  box_new(bar: unknown): number {
    return this.book.boxNew(n(bar, 0));
  }

  table_new(bar: unknown): number {
    return this.book.tableNew(n(bar, 0));
  }

  polyline_new(bar: unknown): number {
    return this.book.polylineNew(n(bar, 0));
  }

  linefill_new(bar: unknown, extra?: unknown): number {
    return this.book.linefillNew(n(bar, 0), extra as Record<string, unknown> | undefined);
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

  label_get_x(id: unknown): number | null {
    return this.book.labelGetX(idOf(id));
  }

  label_get_y(id: unknown): number | null {
    return this.book.labelGetY(idOf(id));
  }

  label_get_text(id: unknown): string | null {
    return this.book.labelGetText(idOf(id));
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

  table_cell_set_text(id: unknown, column?: unknown, row?: unknown, text?: unknown): void {
    this.book.tableCellSetText(idOf(id), column, row, text);
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

  extras(): { __drawings: DrawingEvent[] } {
    return { __drawings: this.book.items.slice() };
  }
}

export function createCompileDraw(): CompileDraw {
  return new CompileDraw();
}
