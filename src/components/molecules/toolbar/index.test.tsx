import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toolbar } from ".";
import { DiagramMode } from "../../../types/diagramMode";

describe("DiagramToolbar", () => {
  it("highlights the active mode and notifies on mode change", async () => {
    const handleModeChange = jest.fn();
    const user = userEvent.setup();

    render(
      <Toolbar
        activeMode={DiagramMode.Select}
        onModeChange={handleModeChange}
      />,
    );

    const selectButton = screen.getByRole("button", { name: /^Select$/i });
    expect(selectButton).toHaveAttribute("aria-pressed", "true");
    expect(selectButton).toHaveClass("bg-blue-200");

    const tableButton = screen.getByRole("button", { name: /^Table$/i });
    await user.click(tableButton);

    expect(handleModeChange).toHaveBeenCalledWith(DiagramMode.Table);
  });
});
