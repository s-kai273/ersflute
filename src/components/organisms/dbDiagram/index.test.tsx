import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DbDiagram } from ".";

jest.mock("@xyflow/react", () => ({
  Background: ({ children }: { children?: ReactNode }) => (
    <div data-testid="background">{children}</div>
  ),
  BackgroundVariant: { Lines: "Lines" },
  ReactFlow: ({
    children,
    className,
  }: { children?: ReactNode; className?: string }) => (
    <div data-testid="reactflow" className={className}>
      {children}
    </div>
  ),
  useNodesState: (initial: unknown) => [initial, () => undefined, () => undefined],
}));

describe("DbDiagram", () => {
  it("shows the current mode and allows switching via the tool tray", async () => {
    const user = userEvent.setup();
    render(<DbDiagram />);

    expect(screen.getByText(/Mode: Select/i)).toBeInTheDocument();

    const tableButton = screen.getByRole("button", { name: /^Table$/i });
    await user.click(tableButton);

    expect(tableButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/Mode: Table/i)).toBeInTheDocument();
  });
});
