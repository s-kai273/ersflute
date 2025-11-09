import { render, screen } from "@testing-library/react";
import { ColumnType } from "@/types/columnType";
import { TableNode } from ".";
import type { TableNodeData } from "./types";

const mockSetNodes = jest.fn();

jest.mock("@xyflow/react", () => ({
  Handle: ({ type, position }: { type: string; position: string }) => (
    <div data-testid={`handle-${type}-${position}`} />
  ),
  Position: {
    Top: "top",
    Right: "right",
    Bottom: "bottom",
    Left: "left",
  },
  useReactFlow: () => ({
    setNodes: mockSetNodes,
  }),
}));

function renderTableNode(
  override?: Partial<TableNodeData>,
): ReturnType<typeof render> {
  const baseData: TableNodeData = {
    physicalName: "MEMBERS",
    color: { r: 120, g: 140, b: 200 },
    columns: [
      {
        physicalName: "MEMBER_ID",
        columnType: ColumnType.BigInt,
        notNull: true,
        primaryKey: true,
      },
    ],
  };

  return render(
    <TableNode
      id="table-node"
      type="table"
      width={240}
      height={120}
      data={{ ...baseData, ...override }}
      dragging={false}
      zIndex={0}
      selectable
      deletable
      selected={false}
      draggable
      isConnectable={false}
      positionAbsoluteX={0}
      positionAbsoluteY={0}
    />,
  );
}

describe("TableNode", () => {
  beforeEach(() => {
    mockSetNodes.mockReset();
  });

  it("renders the configured background color, size, and table name", () => {
    const { container } = renderTableNode();

    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveStyle({
      width: "240px",
      height: "120px",
      background: "rgb(120, 140, 200)",
    });
    expect(screen.getByText("MEMBERS")).toBeInTheDocument();
  });

  it("renders primary key and not-null icons per column configuration", () => {
    const { container } = renderTableNode({
      columns: [
        {
          physicalName: "MEMBER_ID",
          columnType: ColumnType.BigInt,
          notNull: true,
          primaryKey: true,
        },
        {
          physicalName: "EMAIL",
          columnType: ColumnType.VarCharN,
          notNull: true,
        },
        {
          physicalName: "NICKNAME",
          notNull: false,
        },
      ],
    });

    expect(screen.getByText("MEMBER_ID")).toBeInTheDocument();
    expect(screen.getByText("EMAIL")).toBeInTheDocument();
    expect(screen.getByText("NICKNAME")).toBeInTheDocument();

    expect(container.querySelectorAll(".text-yellow-500")).toHaveLength(1);
    expect(container.querySelectorAll(".text-green-400")).toHaveLength(2);
  });

  it("shows a colon only for columns that include type information", () => {
    renderTableNode({
      columns: [
        {
          physicalName: "EMAIL",
          columnType: ColumnType.VarCharN,
          notNull: true,
        },
        {
          physicalName: "MEMO",
          notNull: true,
        },
      ],
    });

    const emailText = screen.getByText("EMAIL").parentElement;
    const memoText = screen.getByText("MEMO").parentElement;
    expect(emailText).toHaveTextContent(/EMAIL\s*:\s*varchar\(n\)/);
    expect(memoText).not.toHaveTextContent(/MEMO\s*:\s*/);
  });

  it("renders four source and four target handles for each direction", () => {
    renderTableNode();

    ["Top", "Right", "Bottom", "Left"].forEach((position) => {
      expect(
        screen.getByTestId(`handle-source-${position.toLowerCase()}`),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`handle-target-${position.toLowerCase()}`),
      ).toBeInTheDocument();
    });
  });
});
