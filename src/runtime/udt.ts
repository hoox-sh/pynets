/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Tiny Pine UDT / enum values. `null` is `na`. Unknown field get → na; unknown
 * set is a no-op. Python `UserDefinedType` / `ObjectInstance` / `visit_EnumDef`
 * remain the source of truth — interpret registers TypeDef / EnumDef later.
 */

export type UdtField = { name: string; default: unknown };

/** Stored method; `body` is opaque (interpret owns FunctionDef). */
export type UdtMethod = {
  name: string;
  params: Array<{ name: string; default?: unknown }>;
  body?: unknown;
  exported?: boolean;
};

export class UdtType {
  readonly fields: UdtField[];
  readonly methods = new Map<string, UdtMethod>();
  isExported = false;

  constructor(
    readonly name: string,
    fields: UdtField[],
  ) {
    this.fields = fields.map((f) => ({ name: f.name, default: f.default ?? null }));
  }

  addMethod(name: string, method: UdtMethod): void {
    this.methods.set(name, method);
  }

  getMethod(name: string): UdtMethod | undefined {
    return this.methods.get(name);
  }

  /** Shallow copy of fields + methods for library `export type`. */
  cloneType(): UdtType {
    const copy = new UdtType(
      this.name,
      this.fields.map((f) => ({ name: f.name, default: f.default })),
    );
    copy.isExported = this.isExported;
    for (const [name, method] of this.methods) copy.addMethod(name, method);
    return copy;
  }

  /** Pine `Type.new(...)` — defaults fill first; missing default is `na`. */
  newInstance(overrides?: Record<string, unknown>): UdtInstance {
    const inst = new UdtInstance(this);
    if (overrides) {
      for (const field of this.fields) {
        if (Object.hasOwn(overrides, field.name)) inst.set(field.name, overrides[field.name]);
      }
    }
    return inst;
  }
}

export class UdtInstance {
  readonly type: UdtType;
  readonly typeName: string;
  private readonly values = new Map<string, unknown>();

  constructor(type: UdtType) {
    this.type = type;
    this.typeName = type.name;
    for (const field of type.fields) this.values.set(field.name, field.default ?? null);
  }

  get(field: string): unknown {
    return this.values.has(field) ? this.values.get(field) : null;
  }

  set(field: string, value: unknown): void {
    if (!this.values.has(field)) return;
    this.values.set(field, value);
  }

  getMethod(name: string): UdtMethod | undefined {
    return this.type.getMethod(name);
  }
}

export class EnumMember {
  constructor(
    readonly enumName: string,
    readonly name: string,
    readonly value?: unknown,
  ) {}

  equals(other: unknown): boolean {
    return other instanceof EnumMember && other.enumName === this.enumName && other.name === this.name;
  }

  toString(): string {
    return this.name;
  }
}

export class EnumType {
  constructor(
    readonly name: string,
    readonly members: Map<string, EnumMember>,
  ) {}
}

export function udtTypeFromAssigns(name: string, fields: UdtField[]): UdtType {
  return new UdtType(name, fields);
}

export function enumTypeFromNames(name: string, members: string[]): EnumType {
  const map = new Map<string, EnumMember>();
  for (const member of members) map.set(member, new EnumMember(name, member));
  return new EnumType(name, map);
}
