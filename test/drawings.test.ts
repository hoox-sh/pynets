/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { DrawingBook } from "../src/runtime/drawings.ts";

describe("DrawingBook", () => {
  test("ids increment", () => {
    const book = new DrawingBook();
    expect(book.lineNew(0)).toBe(0);
    expect(book.labelNew(1, "hi")).toBe(1);
    expect(book.boxNew(2)).toBe(2);
    expect(book.lineNew(3, { color: "red" })).toBe(3);
    expect(book.items).toEqual([
      { kind: "line", bar: 0 },
      { kind: "label", bar: 1, text: "hi" },
      { kind: "box", bar: 2 },
      { kind: "line", bar: 3, extra: { color: "red" } },
    ]);
  });

  test("alert recorded", () => {
    const book = new DrawingBook();
    book.lineNew(0);
    book.alert(4, "cross");
    expect(book.items).toHaveLength(2);
    expect(book.items[1]).toEqual({ kind: "alert", bar: 4, text: "cross" });
    expect(book.labelNew(5)).toBe(1);
  });

  test("setters update last event extra / text", () => {
    const book = new DrawingBook();
    const line = book.lineNew(0, { color: "red" });
    const label = book.labelNew(1, "hi");
    const box = book.boxNew(2);
    book.lineSetXy(line, 0, 1, 2, 3);
    book.lineSetXy1(line, 4, 5);
    book.lineSetXy2(line, 6, 7);
    book.labelSetText(label, "bye");
    book.labelSetXy(label, 8, 9);
    book.boxSet(box, { left: 1, top: 10, right: 3, bottom: 0 });
    expect(book.get(line)).toEqual({
      kind: "line",
      bar: 0,
      extra: { color: "red", x1: 4, y1: 5, x2: 6, y2: 7 },
    });
    expect(book.get(label)).toEqual({
      kind: "label",
      bar: 1,
      text: "bye",
      extra: { x: 8, y: 9 },
    });
    expect(book.get(box)?.extra).toEqual({ left: 1, top: 10, right: 3, bottom: 0 });
    expect(book.get(line)).toBe(book.items[0]);
  });

  test("delete flags history; all() skips deleted", () => {
    const book = new DrawingBook();
    const a = book.lineNew(0);
    const b = book.lineNew(1);
    const lab = book.labelNew(2, "x");
    const box = book.boxNew(3);
    book.lineDelete(a);
    book.labelDelete(lab);
    book.boxDelete(box);
    expect(book.get(a)?.deleted).toBe(true);
    expect(book.get(b)?.deleted).toBeUndefined();
    expect(book.items).toHaveLength(4);
    expect(book.all("line")).toEqual([{ kind: "line", bar: 1 }]);
    expect(book.all("label")).toEqual([]);
    expect(book.all("box")).toEqual([]);
    book.lineDelete(99);
    book.labelSetText(99, "nope");
    expect(book.get(99)).toBeUndefined();
  });

  test("table / polyline / linefill ids and all()", () => {
    const book = new DrawingBook();
    const l1 = book.lineNew(0);
    const l2 = book.lineNew(1);
    expect(book.tableNew(2)).toBe(2);
    expect(book.polylineNew(3)).toBe(3);
    expect(book.linefillNew(4, l1, l2)).toBe(4);
    expect(book.get(4)).toEqual({
      kind: "linefill",
      bar: 4,
      extra: { id1: l1, id2: l2 },
    });
    expect(book.all("table")).toEqual([{ kind: "table", bar: 2 }]);
    expect(book.all("polyline")).toEqual([{ kind: "polyline", bar: 3 }]);
    expect(book.all("linefill")).toHaveLength(1);
    book.alert(5, "ping");
    expect(book.all("alert")).toEqual([{ kind: "alert", bar: 5, text: "ping" }]);
    expect(book.lineNew(6)).toBe(5);
  });

  test("default max_lines_count drops oldest line", () => {
    const book = new DrawingBook();
    for (let i = 0; i < 51; i++) book.lineNew(i);
    expect(book.items.filter((e) => e.kind === "line")).toHaveLength(50);
    expect(book.items[0]).toEqual({ kind: "line", bar: 1 });
    expect(book.items.at(-1)).toEqual({ kind: "line", bar: 50 });
  });

  test("configure max_* counts is per kind; alerts are uncapped", () => {
    const book = new DrawingBook({
      max_lines_count: 2,
      max_labels_count: 1,
      max_boxes_count: 1,
    });
    book.lineNew(0);
    book.lineNew(1);
    book.lineNew(2);
    book.labelNew(0, "a");
    book.labelNew(1, "b");
    book.boxNew(0);
    book.boxNew(1);
    book.alert(0, "x");
    book.alert(1, "y");
    expect(book.items.filter((e) => e.kind === "line")).toHaveLength(2);
    expect(book.items.filter((e) => e.kind === "label")).toHaveLength(1);
    expect(book.items.filter((e) => e.kind === "box")).toHaveLength(1);
    expect(book.items.filter((e) => e.kind === "alert")).toHaveLength(2);
    expect(book.items.find((e) => e.kind === "label")?.text).toBe("b");
  });

  test("bad args do not throw", () => {
    const book = new DrawingBook();
    expect(() => book.lineNew(Number.NaN, "nope" as unknown as Record<string, unknown>)).not.toThrow();
    expect(() => book.labelNew(Number.POSITIVE_INFINITY, { x: 1 } as unknown as string)).not.toThrow();
    expect(() => book.boxNew(undefined as unknown as number)).not.toThrow();
    expect(() => book.alert(Number.NaN, null as unknown as string)).not.toThrow();
    expect(() => book.lineSetXy(99, Number.NaN, 1, 2, 3)).not.toThrow();
    expect(() => book.labelSetText(99, "nope")).not.toThrow();
    expect(() => book.boxSet(99, undefined)).not.toThrow();
    expect(book.items[0]).toEqual({ kind: "line", bar: 0 });
    expect(book.items[1]?.kind).toBe("label");
    expect(book.items[1]?.text).toBe("[object Object]");
    expect(book.items[2]).toEqual({ kind: "box", bar: 0 });
    expect(book.items[3]).toEqual({ kind: "alert", bar: 0, text: "" });
  });
});
