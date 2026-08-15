/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import {
  EnumMember,
  EnumType,
  UdtInstance,
  type UdtMethod,
  UdtType,
  enumTypeFromNames,
  udtTypeFromAssigns,
} from "../src/runtime/udt.ts";

describe("UdtType.newInstance", () => {
  test("fills field defaults; missing default is na", () => {
    const Point = udtTypeFromAssigns("Point", [
      { name: "x", default: 0 },
      { name: "y", default: undefined },
    ]);
    const p = Point.newInstance();
    expect(p).toBeInstanceOf(UdtInstance);
    expect(p.typeName).toBe("Point");
    expect(p.get("x")).toBe(0);
    expect(p.get("y")).toBeNull();
  });

  test("preserves 0 / false / empty-string defaults", () => {
    const T = new UdtType("T", [
      { name: "n", default: 0 },
      { name: "ok", default: false },
      { name: "s", default: "" },
    ]);
    const v = T.newInstance();
    expect(v.get("n")).toBe(0);
    expect(v.get("ok")).toBe(false);
    expect(v.get("s")).toBe("");
  });

  test("overrides replace known fields only", () => {
    const Box = udtTypeFromAssigns("Box", [
      { name: "w", default: 1 },
      { name: "h", default: 2 },
    ]);
    const b = Box.newInstance({ w: 8, extra: 99 });
    expect(b.get("w")).toBe(8);
    expect(b.get("h")).toBe(2);
    expect(b.get("extra")).toBeNull();
  });
});

describe("UdtInstance field access", () => {
  test("get / set known fields", () => {
    const Point = new UdtType("Point", [
      { name: "x", default: null },
      { name: "y", default: null },
    ]);
    const p = Point.newInstance();
    p.set("x", 1.5);
    p.set("y", -2);
    expect(p.get("x")).toBe(1.5);
    expect(p.get("y")).toBe(-2);
  });

  test("unknown get is na; unknown set is a no-op", () => {
    const Point = new UdtType("Point", [{ name: "x", default: 1 }]);
    const p = Point.newInstance();
    expect(p.get("z")).toBeNull();
    p.set("z", 9);
    expect(p.get("z")).toBeNull();
    expect(p.get("x")).toBe(1);
  });

  test("instances are independent", () => {
    const Point = udtTypeFromAssigns("Point", [{ name: "x", default: 0 }]);
    const a = Point.newInstance();
    const b = Point.newInstance();
    a.set("x", 3);
    expect(b.get("x")).toBe(0);
  });
});

describe("UdtType methods", () => {
  test("addMethod + getMethod", () => {
    const Point = new UdtType("Point", [{ name: "x", default: 0 }]);
    const method: UdtMethod = {
      name: "move",
      params: [{ name: "dx" }, { name: "dy", default: 0 }],
      body: { kind: "FunctionDef" },
    };
    Point.addMethod("move", method);
    expect(Point.getMethod("move")).toBe(method);
    expect(Point.getMethod("move")?.params).toEqual([
      { name: "dx" },
      { name: "dy", default: 0 },
    ]);
  });

  test("missing method is undefined", () => {
    const Point = new UdtType("Point", [{ name: "x", default: 0 }]);
    expect(Point.getMethod("move")).toBeUndefined();
  });

  test("instance.getMethod sees type methods", () => {
    const Point = new UdtType("Point", [{ name: "x", default: 0 }]);
    const method: UdtMethod = { name: "len", params: [] };
    Point.addMethod("len", method);
    const p = Point.newInstance();
    expect(p.type).toBe(Point);
    expect(p.getMethod("len")).toBe(method);
    expect(p.getMethod("missing")).toBeUndefined();
  });

  test("isExported flag", () => {
    const Point = new UdtType("Point", [{ name: "x", default: 0 }]);
    expect(Point.isExported).toBe(false);
    Point.isExported = true;
    expect(Point.isExported).toBe(true);
  });
});

describe("EnumType / EnumMember", () => {
  test("enumTypeFromNames binds distinct members", () => {
    const Side = enumTypeFromNames("Side", ["long", "short"]);
    expect(Side).toBeInstanceOf(EnumType);
    expect(Side.name).toBe("Side");
    const long = Side.members.get("long");
    const short = Side.members.get("short");
    expect(long).toBeInstanceOf(EnumMember);
    expect(short).toBeInstanceOf(EnumMember);
    expect(long).not.toBe(short);
    expect(long!.enumName).toBe("Side");
    expect(long!.name).toBe("long");
    expect(long!.value).toBeUndefined();
  });

  test("equality is enumName + name, not object identity", () => {
    const a = new EnumMember("Side", "long");
    const b = new EnumMember("Side", "long");
    const c = new EnumMember("Side", "short");
    const d = new EnumMember("Dir", "long");
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
    expect(a.equals(d)).toBe(false);
    expect(a.equals("long")).toBe(false);
    expect(a.equals(null)).toBe(false);
    expect(a).not.toBe(b);
  });

  test("toString is the member name", () => {
    const m = new EnumMember("Side", "long", 1);
    expect(m.toString()).toBe("long");
    expect(String(m)).toBe("long");
    expect(`${m}`).toBe("long");
  });

  test("optional value is ignored for equality", () => {
    const a = new EnumMember("Side", "long", 1);
    const b = new EnumMember("Side", "long", 2);
    expect(a.equals(b)).toBe(true);
    expect(a.value).toBe(1);
    expect(b.value).toBe(2);
  });
});
