import type { Node } from "@xyflow/react";
import { getEdgeParams } from "./edgeParams";

type NodeInit = {
  id: string;
  position: { x: number; y: number };
  width?: number;
  height?: number;
  measured?: { width?: number; height?: number };
};

function makeNode({ id, position, width, height, measured }: NodeInit): Node {
  return {
    id,
    position,
    width,
    height,
    measured,
    data: {},
    type: "default",
  } as unknown as Node;
}

describe("getEdgeParams", () => {
  it("returns edge intersections for horizontally aligned nodes", () => {
    const source = makeNode({
      id: "source",
      position: { x: 0, y: 0 },
      width: 100,
      height: 50,
    });
    const target = makeNode({
      id: "target",
      position: { x: 200, y: 0 },
      width: 80,
      height: 50,
    });

    const params = getEdgeParams(source, target);

    expect(params).toEqual({
      sx: 100,
      sy: 25,
      tx: 200,
      ty: 25,
    });
  });

  it("prefers measured dimensions when available", () => {
    const source = makeNode({
      id: "source",
      position: { x: 0, y: 0 },
      measured: { width: 80, height: 80 },
    });
    const target = makeNode({
      id: "target",
      position: { x: 100, y: 200 },
      measured: { width: 60, height: 60 },
    });

    const params = getEdgeParams(source, target);

    expect(params.sx).toBeCloseTo(58.947, 3);
    expect(params.sy).toBe(80);
    expect(params.tx).toBeCloseTo(115.789, 3);
    expect(params.ty).toBe(200);
  });

  it("handles overlapping node centers by returning the right edge", () => {
    const source = makeNode({
      id: "source",
      position: { x: 0, y: 0 },
      width: 100,
      height: 50,
    });
    const target = makeNode({
      id: "target",
      position: { x: 0, y: 0 },
      width: 100,
      height: 50,
    });

    const params = getEdgeParams(source, target);

    expect(params).toEqual({
      sx: 100,
      sy: 25,
      tx: 100,
      ty: 25,
    });
  });

  it("falls back to zero dimensions when neither width nor measured size exist", () => {
    const source = makeNode({
      id: "source",
      position: { x: 10, y: 10 },
    });
    const target = makeNode({
      id: "target",
      position: { x: 50, y: 10 },
    });

    const params = getEdgeParams(source, target);

    expect(params).toEqual({
      sx: 10,
      sy: 10,
      tx: 50,
      ty: 10,
    });
  });
});
