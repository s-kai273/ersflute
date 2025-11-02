import { render, screen } from "@testing-library/react";
import { getStraightPath, useStore } from "@xyflow/react";
import { Cardinality } from "../../../types/table";
import { getEdgeParams } from "./edgeParams";
import { CardinalityEdge } from "./index";
import { buildSymbols, cardinalityToSymbolPartKinds } from "./symbol";

jest.mock("./symbol", () => ({
  buildSymbols: jest.fn(),
  cardinalityToSymbolPartKinds: jest.fn(),
}));

jest.mock("./edgeParams", () => ({
  getEdgeParams: jest.fn(),
}));

jest.mock("@xyflow/react", () => ({
  BaseEdge: jest.fn(({ id, path, style, markerEnd, children }: any) => (
    <div
      data-testid={`base-edge-${id}`}
      data-path={path}
      data-stroke={style?.stroke ?? ""}
      data-marker={markerEnd ?? ""}
    >
      {children}
    </div>
  )),
  getStraightPath: jest.fn(),
  useStore: jest.fn(),
}));

const mockedUseStore = jest.mocked(useStore);
const mockedGetEdgeParams = jest.mocked(getEdgeParams);
const mockedGetStraightPath = jest.mocked(getStraightPath);
const mockedBuildSymbols = jest.mocked(buildSymbols);
const mockedCardinalityToSymbolPartKinds = jest.mocked(
  cardinalityToSymbolPartKinds,
);

const baseProps = {
  id: "edge-1",
  source: "source-node",
  target: "target-node",
  data: {
    parentCardinality: Cardinality.One,
    childCardinality: Cardinality.One,
  },
  markerEnd: "url(#marker)",
  style: { stroke: "#123456" },
} as const;

function provideNodes(nodes: Record<string, unknown>) {
  const nodeLookup = new Map(Object.entries(nodes));
  mockedUseStore.mockImplementation((selector: any) =>
    selector({ nodeLookup } as never),
  );
}

describe("CardinalityEdge", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetStraightPath.mockReturnValue(["M 0 0 L 10 0", 0, 0, 0, 0]);
  });

  it("returns null when either node is missing", () => {
    provideNodes({});

    const { container } = render(<CardinalityEdge {...(baseProps as any)} />);

    expect(container.firstChild).toBeNull();
    expect(mockedGetEdgeParams).not.toHaveBeenCalled();
    expect(mockedBuildSymbols).not.toHaveBeenCalled();
  });

  it("renders a straight edge without symbols when the nodes overlap", () => {
    provideNodes({
      "source-node": {
        id: "source-node",
        position: { x: 0, y: 0 },
      },
      "target-node": {
        id: "target-node",
        position: { x: 0, y: 0 },
      },
    });
    mockedGetEdgeParams.mockReturnValue({
      sx: 50,
      sy: 75,
      tx: 50,
      ty: 75,
    });

    const { container } = render(<CardinalityEdge {...(baseProps as any)} />);

    expect(mockedBuildSymbols).not.toHaveBeenCalled();
    const baseEdge = screen.getByTestId("base-edge-edge-1");
    expect(baseEdge).toBeInTheDocument();
    expect(baseEdge).toHaveAttribute("data-path", "M 0 0 L 10 0");
    expect(
      container.querySelectorAll("[data-testid='source-symbol']"),
    ).toHaveLength(0);
  });

  it("renders symbols when the nodes are distinct", () => {
    provideNodes({
      "source-node": {
        id: "source-node",
        position: { x: 0, y: 0 },
      },
      "target-node": {
        id: "target-node",
        position: { x: 0, y: 30 },
      },
    });
    mockedGetEdgeParams.mockReturnValue({
      sx: 0,
      sy: 0,
      tx: 0,
      ty: 30,
    });
    mockedGetStraightPath.mockReturnValue(["M 0 0 L 0 30", 0, 0, 0, 0]);

    mockedCardinalityToSymbolPartKinds.mockImplementation((cardinality) => {
      if (cardinality === Cardinality.One) {
        return ["line"];
      }
      if (cardinality === Cardinality.OneN) {
        return ["crowfoot"];
      }
      return ["circle"];
    });

    mockedBuildSymbols
      .mockImplementationOnce(() => ({
        path: "S_PATH",
        elements: [<span data-testid="source-symbol" key="source-symbol" />],
      }))
      .mockImplementationOnce(() => ({
        path: "T_PATH",
        elements: [<span data-testid="target-symbol" key="target-symbol" />],
      }));

    const props = {
      ...baseProps,
      data: {
        parentCardinality: Cardinality.OneN,
        childCardinality: Cardinality.ZeroOne,
      },
      style: { stroke: "#999999" },
    };

    render(<CardinalityEdge {...(props as any)} />);

    expect(mockedCardinalityToSymbolPartKinds).toHaveBeenNthCalledWith(
      1,
      Cardinality.OneN,
    );
    expect(mockedCardinalityToSymbolPartKinds).toHaveBeenNthCalledWith(
      2,
      Cardinality.ZeroOne,
    );

    expect(mockedBuildSymbols).toHaveBeenCalledTimes(2);
    const [sourceCall, targetCall] = mockedBuildSymbols.mock.calls;

    expect(sourceCall).toEqual([
      0,
      0,
      0,
      1,
      ["crowfoot"],
      "source",
      30,
      "#999999",
    ]);

    expect(targetCall[0]).toBe(0);
    expect(targetCall[1]).toBe(30);
    expect(targetCall[2]).toBeCloseTo(0);
    expect(targetCall[3]).toBe(-1);
    expect(targetCall[4]).toEqual(["circle"]);
    expect(targetCall[5]).toBe("target");
    expect(targetCall[6]).toBe(30);
    expect(targetCall[7]).toBe("#999999");

    const baseEdge = screen.getByTestId("base-edge-edge-1");
    expect(baseEdge).toHaveAttribute("data-path", "M 0 0 L 0 30S_PATHT_PATH");
    expect(screen.getByTestId("source-symbol")).toBeInTheDocument();
    expect(screen.getByTestId("target-symbol")).toBeInTheDocument();
  });

  it("falls back to default stroke color and cardinalities when missing", () => {
    provideNodes({
      "source-node": {
        id: "source-node",
        position: { x: 0, y: 0 },
      },
      "target-node": {
        id: "target-node",
        position: { x: 40, y: 0 },
      },
    });
    mockedGetEdgeParams.mockReturnValue({
      sx: 0,
      sy: 0,
      tx: 40,
      ty: 0,
    });
    mockedGetStraightPath.mockReturnValue(["M 0 0 L 40 0", 0, 0, 0, 0]);

    mockedCardinalityToSymbolPartKinds.mockReturnValue(["line"]);

    mockedBuildSymbols
      .mockImplementationOnce(() => ({ path: "SRC", elements: [] }))
      .mockImplementationOnce(() => ({ path: "TGT", elements: [] }));

    const props = {
      ...baseProps,
      data: undefined,
      style: { stroke: 123 as unknown as string },
    };

    render(<CardinalityEdge {...(props as any)} />);

    expect(mockedCardinalityToSymbolPartKinds).toHaveBeenNthCalledWith(
      1,
      Cardinality.One,
    );
    expect(mockedCardinalityToSymbolPartKinds).toHaveBeenNthCalledWith(
      2,
      Cardinality.One,
    );

    expect(mockedBuildSymbols).toHaveBeenCalledTimes(2);
    const [sourceCall, targetCall] = mockedBuildSymbols.mock.calls;
    expect(sourceCall[7]).toBe("#111");
    expect(targetCall[7]).toBe("#111");

    const baseEdge = screen.getByTestId("base-edge-edge-1");
    expect(baseEdge).toHaveAttribute("data-path", "M 0 0 L 40 0SRCTGT");
  });
});
