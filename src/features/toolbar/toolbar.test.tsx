import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useViewModeStore } from "@/stores/viewModeStore";
import { DiagramMode } from "@/types/domain/diagramMode";
import { Toolbar } from ".";
import { toolProfiles } from "./toolProfile";

const initialState = useViewModeStore.getState();

beforeEach(() => {
  useViewModeStore.setState(initialState);
});

it("does not render anything in read-only mode", () => {
  useViewModeStore.setState({ isReadOnly: true });
  const { container } = render(<Toolbar />);

  expect(container.firstChild).toBeNull();
});

it("renders all tool buttons with their labels when editing is allowed", () => {
  useViewModeStore.setState({ isReadOnly: false });
  render(<Toolbar />);

  const navigation = screen.getByRole("navigation");
  const buttons = within(navigation).getAllByRole("button");
  expect(buttons).toHaveLength(toolProfiles.length);
  toolProfiles.forEach((tool) => {
    expect(
      screen.getByRole("button", { name: tool.label }),
    ).toBeInTheDocument();
  });
});

it("indicates the active diagram mode with aria-pressed and styling", () => {
  useViewModeStore.setState({
    isReadOnly: false,
    diagramMode: DiagramMode.Note,
  });
  render(<Toolbar />);

  const activeButton = screen.getByRole("button", { name: "Note" });
  const inactiveButton = screen.getByRole("button", { name: "Table" });
  expect(activeButton).toHaveAttribute("aria-pressed", "true");
  expect(inactiveButton).toHaveAttribute("aria-pressed", "false");
});

it("updates the diagram mode when a tool button is clicked", async () => {
  const user = userEvent.setup();
  useViewModeStore.setState({
    isReadOnly: false,
    diagramMode: DiagramMode.Select,
  });
  render(<Toolbar />);

  await user.click(screen.getByRole("button", { name: "Table" }));

  const activeButton = screen.getByRole("button", { name: "Table" });
  expect(activeButton).toHaveAttribute("aria-pressed", "true");
});
