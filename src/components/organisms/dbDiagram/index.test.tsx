import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { DbDiagram } from ".";
import { DiagramMode } from "../../../types/diagramMode";

jest.mock("@xyflow/react", () => ({
  Background: ({ children }: { children?: ReactNode }) => (
    <div data-testid="background">{children}</div>
  ),
  BackgroundVariant: { Lines: "Lines" },
  ReactFlow: ({
    children,
    className,
  }: {
    children?: ReactNode;
    className?: string;
  }) => (
    <div data-testid="reactflow" className={className}>
      {children}
    </div>
  ),
  useNodesState: (initial: unknown) => [
    initial,
    () => undefined,
    () => undefined,
  ],
}));

describe("DbDiagram", () => {
  it("shows the passed mode label, description, and applies the cursor class", () => {
    render(<DbDiagram activeMode={DiagramMode.Table} />);

    expect(screen.getByText(/Mode: Table/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Create a new table by clicking on the canvas\./i)
    ).toBeInTheDocument();

    expect(screen.getByTestId("reactflow")).toHaveClass("cursor-crosshair");
  });
});
