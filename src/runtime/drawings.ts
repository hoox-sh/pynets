/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Stub drawing / alert book. Records line/label/box/alert events; new()
 * helpers return incrementing ids. Interpret wiring is out of scope.
 */

export interface DrawingEvent {
  kind: "line" | "label" | "box" | "alert";
  bar: number;
  text?: string;
  extra?: Record<string, unknown>;
}

export class DrawingBook {
  readonly items: DrawingEvent[] = [];
  private nextId = 0;

  lineNew(bar: number, extra?: Record<string, unknown>): number {
    const id = this.nextId++;
    const ev: DrawingEvent = { kind: "line", bar };
    if (extra !== undefined) ev.extra = extra;
    this.items.push(ev);
    return id;
  }

  labelNew(bar: number, text?: string): number {
    const id = this.nextId++;
    const ev: DrawingEvent = { kind: "label", bar };
    if (text !== undefined) ev.text = text;
    this.items.push(ev);
    return id;
  }

  boxNew(bar: number): number {
    const id = this.nextId++;
    this.items.push({ kind: "box", bar });
    return id;
  }

  alert(bar: number, message: string): void {
    this.items.push({ kind: "alert", bar, text: message });
  }
}
