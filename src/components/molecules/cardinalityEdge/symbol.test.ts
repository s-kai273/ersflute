import { Cardinality } from "../../../types/table";
import { buildSymbols, cardinalityToSymbolPartKinds } from "./symbol";

describe("cardinalityToSymbolPartKinds", () => {
  it("maps each cardinality to the correct symbol sequence", () => {
    expect(cardinalityToSymbolPartKinds(Cardinality.One)).toEqual(["line"]);
    expect(cardinalityToSymbolPartKinds(Cardinality.ZeroOne)).toEqual([
      "circle",
      "line",
    ]);
    expect(cardinalityToSymbolPartKinds(Cardinality.OneN)).toEqual([
      "crowfoot",
      "line",
    ]);
    expect(cardinalityToSymbolPartKinds(Cardinality.ZeroN)).toEqual([
      "crowfoot",
      "circle",
    ]);
  });
});

describe("buildSymbols", () => {
  it("returns an empty spec when no symbol parts are provided", () => {
    const spec = buildSymbols(0, 0, 1, 0, [], "empty", 100, "#000");

    expect(spec).toEqual({ path: "", elements: [] });
  });

  it("returns an empty spec when the path cannot accommodate all symbols", () => {
    const spec = buildSymbols(
      0,
      0,
      1,
      0,
      ["line", "line", "line", "line"],
      "crowded",
      40,
      "#000"
    );

    expect(spec).toEqual({ path: "", elements: [] });
  });

  it("renders a single perpendicular line segment", () => {
    const spec = buildSymbols(0, 0, 1, 0, ["line"], "line", 100, "#123456");

    expect(spec.path).toBe(" M 16 5 L 16 -5");
    expect(spec.elements).toHaveLength(0);
  });

  it("renders a circle symbol with the correct position and styling", () => {
    const spec = buildSymbols(0, 0, 1, 0, ["circle"], "circle", 100, "#ff0000");

    expect(spec.path).toBe("");
    expect(spec.elements).toHaveLength(1);

    const circle = spec.elements[0];
    expect(circle.key).toBe("circle-circle-0");
    expect(circle.type).toBe("circle");
    expect(circle.props).toMatchObject({
      cx: 16,
      cy: 0,
      r: 3,
      fill: "#ff0000",
    });
  });

  it("renders crowfoot and circle symbols with adjacent spacing", () => {
    const spec = buildSymbols(
      0,
      0,
      1,
      0,
      ["crowfoot", "circle"],
      "combo",
      60,
      "#00ff00"
    );

    expect(spec.path).toBe(" M 6 6 L 16 0 L 6 -6");
    expect(spec.elements).toHaveLength(1);

    const circle = spec.elements[0];
    expect(circle.key).toBe("combo-circle-1");
    expect(circle.type).toBe("circle");
    expect(circle.props).toMatchObject({
      cx: 18,
      cy: 0,
      r: 3,
      fill: "#00ff00",
    });
  });

  it("uses standard spacing between non-adjacent-friendly symbols", () => {
    const spec = buildSymbols(
      0,
      0,
      1,
      0,
      ["line", "line"],
      "double-line",
      100,
      "#abcdef"
    );

    expect(spec.path).toBe(" M 16 5 L 16 -5 M 22 5 L 22 -5");
    expect(spec.elements).toHaveLength(0);
  });

  it("uses adjacent spacing when a circle precedes a crowfoot", () => {
    const spec = buildSymbols(
      0,
      0,
      1,
      0,
      ["circle", "crowfoot"],
      "circle-crowfoot",
      60,
      "#0088ff"
    );

    expect(spec.path).toBe(" M 8 6 L 18 0 L 8 -6");
    expect(spec.elements).toHaveLength(1);

    const circle = spec.elements[0];
    expect(circle.key).toBe("circle-crowfoot-circle-0");
    expect(circle.type).toBe("circle");
    expect(circle.props).toMatchObject({
      cx: 16,
      cy: 0,
      r: 3,
      fill: "#0088ff",
    });
  });
});
