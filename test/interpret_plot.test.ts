import { describe, expect, test } from "bun:test";
import { interpret, Runtime } from "../src/index.ts";

describe("interpret plot(close)", () => {
  test("5 bars of close 1..5", () => {
    const bars = [1, 2, 3, 4, 5].map((close) => ({ close }));
    const out = interpret(`indicator("t")\nplot(close)`, bars);
    expect(out.plots).toEqual([1, 2, 3, 4, 5]);
  });

  test("plot(close + 1) adds one", () => {
    const bars = [10, 20].map((close) => ({ close }));
    const out = interpret(`indicator("t")\nplot(close + 1)`, bars);
    expect(out.plots).toEqual([11, 21]);
  });

  test("Runtime.run envelope matches Python keys", () => {
    const bars = [{ close: 100.5 }, { close: 101.5 }];
    const out = new Runtime("TEST").run(
      `//@version=5\nindicator("pkg facade")\nplot(close, title="c")`,
      bars,
    );
    expect(out.error).toBeUndefined();
    expect(out.mode).toBe("interpret");
    expect(out.script_name).toBe("pkg facade");
    expect(out.series.c).toEqual([100.5, 101.5]);
    expect(out.plots).toEqual([100.5, 101.5]);
    expect(out.count).toBe(2);
  });

  test("positional title after series and colliding titles uniquify", () => {
    const out = new Runtime("TEST").run(
      `indicator("t")
plot(close, "a")
plot(close + 1, title="a")
plot(close + 2)`,
      [{ close: 1 }, { close: 2 }],
    );
    expect(out.error).toBeUndefined();
    expect(out.series.a).toEqual([1, 2]);
    expect(out.series.a_2).toEqual([2, 3]);
    expect(out.series.plot).toEqual([3, 4]);
  });
});
