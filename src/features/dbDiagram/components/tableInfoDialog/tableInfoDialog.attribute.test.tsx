import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useViewModeStore } from "@/stores/viewModeStore";
import { ColumnType } from "@/types/domain/columnType";
import type { Table } from "@/types/domain/table";
import { TableInfoDialog } from ".";

// TODO: Add some lack test cases on https://github.com/s-kai273/ersflute/issues/16
const initialViewModeState = useViewModeStore.getState();

function createTableData(overrides?: Partial<Table>): Table {
  return {
    x: 0,
    y: 0,
    width: 240,
    height: 120,
    physicalName: "MEMBERS",
    logicalName: "Members",
    color: { r: 80, g: 120, b: 200 },
    columns: [
      {
        physicalName: "ID",
        logicalName: "Id",
        columnType: ColumnType.Int,
        notNull: true,
        primaryKey: true,
        unique: true,
      },
      {
        physicalName: "EMAIL",
        logicalName: "Email",
        columnType: ColumnType.VarCharN,
        length: 150,
        notNull: false,
        unique: false,
      },
    ],
    ...overrides,
  };
}

function renderAttributeTab(overrides?: Partial<Table>) {
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

function renderEditableAttributeTab(overrides?: Partial<Table>) {
  useViewModeStore.setState({ ...initialViewModeState, isReadOnly: false });
  return renderAttributeTab(overrides);
}

function renderReadOnlyAttributeTab(overrides?: Partial<Table>) {
  useViewModeStore.setState({ ...initialViewModeState, isReadOnly: true });
  return renderAttributeTab(overrides);
}

function renderEditableAttributeTabWithUser(overrides?: Partial<Table>) {
  const user = userEvent.setup();
  renderEditableAttributeTab(overrides);
  return user;
}

function getColumnRow(physicalName: string): HTMLTableRowElement {
  return screen.getByRole("row", {
    name: (_name, element) =>
      element instanceof HTMLElement &&
      element.tagName === "TR" &&
      within(element).queryByText(physicalName, { exact: true }) != null,
  });
}

async function openDetailFor(
  user: ReturnType<typeof userEvent.setup>,
  physicalName: string,
) {
  await user.dblClick(getColumnRow(physicalName));
  return screen.findByRole("region", { name: "Column Details" });
}

beforeEach(() => {
  useViewModeStore.setState(initialViewModeState);
});

describe("when editing is allowed", () => {
  it("renders the Attribute tab content with table metadata and columns", () => {
    renderEditableAttributeTab();

    const physicalNameInput = screen.getByLabelText("Physical Name");
    expect(physicalNameInput).toHaveValue("MEMBERS");
    expect(physicalNameInput).not.toHaveAttribute("readonly");

    const logicalNameInput = screen.getByLabelText("Logical Name");
    expect(logicalNameInput).toHaveValue("Members");
    expect(logicalNameInput).not.toHaveAttribute("readonly");

    const idRow = getColumnRow("ID");
    expect(idRow).toBeInTheDocument();
    expect(within(idRow).getByText("int")).toBeInTheDocument();
    expect(within(idRow).getByLabelText("Primary key")).toBeInTheDocument();
    expect(
      within(idRow).getByRole("checkbox", {
        name: "Column ID is not null",
      }),
    ).toBeChecked();
    expect(
      within(idRow).getByRole("checkbox", {
        name: "Column ID is unique",
      }),
    ).toBeChecked();

    const emailRow = getColumnRow("EMAIL");
    expect(emailRow).toBeInTheDocument();
    expect(
      within(emailRow).queryByLabelText("Primary key"),
    ).not.toBeInTheDocument();
    expect(within(emailRow).getByText("varchar(150)")).toBeInTheDocument();
    expect(
      within(emailRow).getByRole("checkbox", {
        name: "Column EMAIL is not null",
      }),
    ).not.toBeChecked();
    expect(
      within(emailRow).getByRole("checkbox", {
        name: "Column EMAIL is unique",
      }),
    ).not.toBeChecked();
  });

  it("opens the column detail view on double-click", async () => {
    const user = renderEditableAttributeTabWithUser();

    const detailRegion = await openDetailFor(user, "EMAIL");

    expect(within(detailRegion).getByLabelText("Physical Name")).toHaveValue(
      "EMAIL",
    );
  });

  it("returns to the list when back is clicked from the detail view", async () => {
    const user = renderEditableAttributeTabWithUser();
    await openDetailFor(user, "EMAIL");

    await user.click(screen.getByRole("button", { name: "Back to Columns" }));

    expect(
      screen.queryByRole("region", { name: "Column Details" }),
    ).not.toBeInTheDocument();
    expect(getColumnRow("EMAIL")).toBeInTheDocument();
  });

  it("shows a placeholder message when no columns are defined", () => {
    renderEditableAttributeTab({ columns: [] });

    expect(
      screen.getByText("Columns will appear here once added."),
    ).toBeInTheDocument();
  });

  it("shows a foreign key indicator when a referred column is set", () => {
    renderEditableAttributeTab({
      columns: [
        {
          physicalName: "PROFILE_ID",
          logicalName: "Profile Id",
          columnType: ColumnType.Int,
          referredColumn: "PROFILES.ID",
          notNull: false,
          primaryKey: false,
          unique: false,
        },
        {
          physicalName: "EMAIL",
          logicalName: "Email",
          columnType: ColumnType.VarCharN,
          length: 150,
          notNull: false,
          primaryKey: false,
          unique: false,
        },
      ],
    });

    const profileRow = getColumnRow("PROFILE_ID");
    expect(
      within(profileRow).getByLabelText("Foreign key"),
    ).toBeInTheDocument();

    const emailRow = getColumnRow("EMAIL");
    expect(
      within(emailRow).queryByLabelText("Foreign key"),
    ).not.toBeInTheDocument();
  });

  it("keeps Edit/Delete disabled before any row is selected", () => {
    renderEditableAttributeTab();

    expect(screen.getByRole("button", { name: "Add" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Edit" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
  });

  it("enables Edit/Delete after a row is selected", async () => {
    const user = renderEditableAttributeTabWithUser();

    await user.click(getColumnRow("EMAIL"));

    expect(screen.getByRole("button", { name: "Edit" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Delete" })).toBeEnabled();
  });

  it("opens the detail view when Add is clicked", async () => {
    const user = renderEditableAttributeTabWithUser();

    await user.click(screen.getByRole("button", { name: "Add" }));

    const detailRegion = await screen.findByRole("region", {
      name: "Column Details",
    });
    expect(within(detailRegion).getByLabelText("Physical Name")).toHaveValue(
      "",
    );
  });

  it("opens the detail view for the selected row when Edit is clicked", async () => {
    const user = renderEditableAttributeTabWithUser();
    await user.click(getColumnRow("EMAIL"));

    await user.click(screen.getByRole("button", { name: "Edit" }));

    const detailRegion = await screen.findByRole("region", {
      name: "Column Details",
    });
    expect(within(detailRegion).getByLabelText("Physical Name")).toHaveValue(
      "EMAIL",
    );
  });

  it("deletes the selected row when Delete is clicked", async () => {
    const user = renderEditableAttributeTabWithUser();
    await user.click(getColumnRow("EMAIL"));

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(screen.queryByText("EMAIL")).not.toBeInTheDocument();
    expect(getColumnRow("ID")).toBeInTheDocument();
  });
});

describe("in read-only mode", () => {
  it("renders the Attribute tab content with table metadata and columns", () => {
    renderReadOnlyAttributeTab();

    const physicalNameInput = screen.getByLabelText("Physical Name");
    expect(physicalNameInput).toHaveValue("MEMBERS");
    expect(physicalNameInput).toHaveAttribute("readonly");

    const logicalNameInput = screen.getByLabelText("Logical Name");
    expect(logicalNameInput).toHaveValue("Members");
    expect(logicalNameInput).toHaveAttribute("readonly");

    const idRow = getColumnRow("ID");
    expect(idRow).toBeInTheDocument();
    expect(within(idRow).getByText("int")).toBeInTheDocument();
    expect(
      within(idRow).getByLabelText("Column ID is not null"),
    ).toBeInTheDocument();
    expect(
      within(idRow).getByLabelText("Column ID is unique"),
    ).toBeInTheDocument();

    const emailRow = getColumnRow("EMAIL");
    expect(emailRow).toBeInTheDocument();
    expect(within(emailRow).getByText("varchar(150)")).toBeInTheDocument();
    expect(
      within(emailRow).queryByLabelText("Column EMAIL is not null"),
    ).not.toBeInTheDocument();
    expect(
      within(emailRow).queryByLabelText("Column EMAIL is unique"),
    ).not.toBeInTheDocument();
  });

  it("keeps Add/Delete disabled while enabling Edit after selection", async () => {
    const user = userEvent.setup();
    renderReadOnlyAttributeTab();

    await user.click(getColumnRow("EMAIL"));

    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Edit" })).toBeEnabled();
  });

  it("opens the detail view for the selected row when Edit is clicked", async () => {
    const user = userEvent.setup();
    renderReadOnlyAttributeTab();
    await user.click(getColumnRow("EMAIL"));

    await user.click(screen.getByRole("button", { name: "Edit" }));

    const detailRegion = await screen.findByRole("region", {
      name: "Column Details",
    });
    expect(within(detailRegion).getByLabelText("Physical Name")).toHaveValue(
      "EMAIL",
    );
  });
});
