import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useViewModeStore } from "@/stores/viewModeStore";
import type { Table } from "@/types/domain/table";
import { TableInfoDialog } from ".";

const initialViewModeState = useViewModeStore.getState();

function createTableData(overrides?: Partial<Table>): Table {
  return {
    x: 0,
    y: 0,
    width: 240,
    height: 120,
    physicalName: "MEMBERS",
    logicalName: "Members",
    description: "This is Member table",
    color: { r: 80, g: 120, b: 200 },
    columns: [],
    ...overrides,
  };
}

function renderTableInfoDialog(overrides?: Partial<Table>) {
  const onApply = jest.fn<
    ReturnType<(data: Table) => void>,
    Parameters<(data: Table) => void>
  >();
  const onOpenChange = jest.fn();
  render(
    <TableInfoDialog
      open
      data={createTableData(overrides)}
      onApply={onApply}
      onOpenChange={onOpenChange}
    />,
  );
  return { onApply, onOpenChange };
}

function renderEditableTableInfoDialog(overrides?: Partial<Table>) {
  useViewModeStore.setState({ ...initialViewModeState, isReadOnly: false });
  return renderTableInfoDialog(overrides);
}

function renderReadOnlyTableInfoDialog(overrides?: Partial<Table>) {
  useViewModeStore.setState({ ...initialViewModeState, isReadOnly: true });
  return renderTableInfoDialog(overrides);
}

async function openDescriptionTab(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("tab", { name: "Description" }));
  return screen.getByLabelText("Table Description");
}

beforeEach(() => {
  useViewModeStore.setState(initialViewModeState);
});

describe("when editing is allowed", () => {
  it("renders the current description and lets the user edit it", async () => {
    const user = userEvent.setup();
    renderEditableTableInfoDialog();

    const descriptionInput = await openDescriptionTab(user);

    expect(descriptionInput).toHaveValue("This is Member table");
    expect(descriptionInput).not.toHaveAttribute("readonly");

    await user.clear(descriptionInput);
    await user.type(descriptionInput, "Updated description");

    expect(descriptionInput).toHaveValue("Updated description");
  });
});

describe("in read-only mode", () => {
  it("renders the description as read-only", async () => {
    const user = userEvent.setup();
    renderReadOnlyTableInfoDialog();

    const descriptionInput = await openDescriptionTab(user);

    expect(descriptionInput).toHaveValue("This is Member table");
    expect(descriptionInput).toHaveAttribute("readonly");

    await user.type(descriptionInput, "Cannot edit");

    expect(descriptionInput).toHaveValue("This is Member table");
  });
});
