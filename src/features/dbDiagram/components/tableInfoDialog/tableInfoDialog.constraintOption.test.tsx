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
    tableConstraint: "constraint_a\nconstraint_b",
    primaryKeyName: "PK_MEMBERS",
    option: "option_a\noption_b",
    ...overrides,
  };
}

function renderTableInfoDialog(overrides?: Partial<Table>) {
  const onApply = jest.fn();
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

async function openConstraintOptionTab(
  user: ReturnType<typeof userEvent.setup>,
) {
  await user.click(screen.getByRole("tab", { name: "Constraint/Option" }));
  return {
    tableConstraint: screen.getByLabelText("Constraint of Table"),
    primaryKeyName: screen.getByLabelText("Constraint Name for Primary Key"),
    option: screen.getByLabelText("Option"),
  };
}

beforeEach(() => {
  useViewModeStore.setState(initialViewModeState);
});

describe("when editing is allowed", () => {
  it("renders the constraint fields and allows editing the table constraint", async () => {
    const user = userEvent.setup();
    renderEditableTableInfoDialog();

    const { tableConstraint, primaryKeyName, option } =
      await openConstraintOptionTab(user);

    expect(tableConstraint).toHaveValue("constraint_a\nconstraint_b");
    expect(tableConstraint).not.toHaveAttribute("readonly");
    expect(primaryKeyName).toHaveValue("PK_MEMBERS");
    expect(option).toHaveValue("option_a\noption_b");

    await user.type(tableConstraint, "\nconstraint_c");

    expect(tableConstraint).toHaveValue(
      "constraint_a\nconstraint_b\nconstraint_c",
    );
  });

  it("allows editing the primary key name", async () => {
    const user = userEvent.setup();
    renderEditableTableInfoDialog();

    const { primaryKeyName } = await openConstraintOptionTab(user);

    await user.type(primaryKeyName, "_NEW");

    expect(primaryKeyName).toHaveValue("PK_MEMBERS_NEW");
  });

  it("allows editing the option field", async () => {
    const user = userEvent.setup();
    renderEditableTableInfoDialog();

    const { option } = await openConstraintOptionTab(user);

    await user.type(option, "\noption_c");

    expect(option).toHaveValue("option_a\noption_b\noption_c");
  });
});

describe("in read-only mode", () => {
  it("renders constraint values as read-only", async () => {
    const user = userEvent.setup();
    renderReadOnlyTableInfoDialog();

    const { tableConstraint, primaryKeyName, option } =
      await openConstraintOptionTab(user);

    expect(tableConstraint).toHaveValue("constraint_a\nconstraint_b");
    expect(tableConstraint).toHaveAttribute("readonly");
    expect(primaryKeyName).toHaveValue("PK_MEMBERS");
    expect(primaryKeyName).toHaveAttribute("readonly");
    expect(option).toHaveValue("option_a\noption_b");
    expect(option).toHaveAttribute("readonly");

    await user.type(tableConstraint, "\nconstraint_c");

    expect(tableConstraint).toHaveValue("constraint_a\nconstraint_b");
  });
});
