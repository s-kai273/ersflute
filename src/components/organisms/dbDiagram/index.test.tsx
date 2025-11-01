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
  it("applies the cursor class without rendering a mode banner", () => {
    render(<DbDiagram activeMode={DiagramMode.Table} />);

    expect(screen.queryByText(/Mode:/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Create a new table by clicking on the canvas\./i)
    ).not.toBeInTheDocument();

    expect(screen.getByTestId("reactflow")).toHaveClass("cursor-crosshair");
  });
});
