import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { TableNodeData } from "@/components/molecules/tableNode/types";
import { ColumnType } from "@/types/columnType";
import { AttributeContent } from ".";

function createTableData(overrides?: Partial<TableNodeData>): TableNodeData {
  const baseColumns = [
    {
      physicalName: "MEMBER_ID",
      logicalName: "Member ID",
      columnType: ColumnType.BigInt,
      notNull: true,
      primaryKey: true,
      unique: true,
    },
    {
      physicalName: "EMAIL",
      logicalName: "Email",
      columnType: ColumnType.VarCharN,
      length: 120,
      notNull: false,
      unique: false,
    },
  ];

  const base: TableNodeData = {
    physicalName: "MEMBERS",
    logicalName: "Members",
    color: { r: 120, g: 140, b: 200 },
    columns: baseColumns,
  };

  return {
    ...base,
    ...overrides,
    columns:
      overrides?.columns ?? base.columns!.map((column) => ({ ...column })),
  };
}

function AttributeContentHarness({
  initialData,
}: {
  initialData: TableNodeData;
}) {
  const [data, setData] = useState<TableNodeData>(initialData);
  return <AttributeContent data={data} setData={setData} />;
}

function renderAttributeContent(overrides?: Partial<TableNodeData>) {
  const initialData = createTableData(overrides);
  return render(<AttributeContentHarness initialData={initialData} />);
}

function getColumnRow(physicalName: string): HTMLTableRowElement {
  const cell = screen.getByText(physicalName);
  const row = cell.closest("tr");
  if (!row) {
    throw new Error(`Row for ${physicalName} not found`);
  }
  return row;
}

describe("AttributeContent", () => {
  it("adds a column and persists the configured values", async () => {
    const user = userEvent.setup();
    renderAttributeContent();

    await user.click(screen.getByRole("button", { name: "Add" }));

    const detailRegion = await screen.findByRole("region", {
      name: "Column Details",
    });
    const physicalInput = within(detailRegion).getByLabelText("Physical Name");
    await user.type(physicalInput, "LAST_NAME");

    const logicalInput = within(detailRegion).getByLabelText("Logical Name");
    await user.type(logicalInput, "Last Name");

    const typeSelect = within(detailRegion).getByLabelText("Type");
    await user.selectOptions(typeSelect, ColumnType.VarCharN);

    const lengthInput = within(detailRegion).getByLabelText("Length");
    await user.type(lengthInput, "20");

    await user.click(within(detailRegion).getByLabelText("Not Null"));
    await user.click(within(detailRegion).getByLabelText("Unique"));

    await user.click(screen.getByRole("button", { name: "Back to Columns" }));

    const newRow = screen.getByText("LAST_NAME").closest("tr");
    expect(newRow).not.toBeNull();
    if (!newRow) {
      throw new Error("New column row not found");
    }

    expect(
      within(newRow).getByRole("checkbox", {
        name: "Column LAST_NAME is not null",
      }),
    ).toBeChecked();
    expect(
      within(newRow).getByRole("checkbox", {
        name: "Column LAST_NAME is unique",
      }),
    ).toBeChecked();
    expect(within(newRow).getByText("varchar(20)")).toBeInTheDocument();
  });

  it("updates the table logical name and clears it back to empty", async () => {
    const user = userEvent.setup();
    renderAttributeContent();

    const tableLogicalInput = screen.getByLabelText("Logical Name", {
      selector: "#table-info-logical-name",
    });

    await user.clear(tableLogicalInput);
    await user.type(tableLogicalInput, "Members View");
    expect(tableLogicalInput).toHaveValue("Members View");

    await user.clear(tableLogicalInput);
    expect(tableLogicalInput).toHaveValue("");
  });

  it("keeps a valid selection after deleting one column from many", async () => {
    const user = userEvent.setup();
    renderAttributeContent({
      columns: [
        { physicalName: "FIRST", columnType: ColumnType.Int, notNull: false },
        { physicalName: "SECOND", columnType: ColumnType.Int, notNull: false },
        { physicalName: "THIRD", columnType: ColumnType.Int, notNull: false },
      ],
    });

    await user.click(getColumnRow("SECOND"));
    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(screen.queryByText("SECOND")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).not.toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Edit" }));
    const detailRegion = await screen.findByRole("region", {
      name: "Column Details",
    });
    expect(
      within(detailRegion).getByLabelText("Physical Name"),
    ).toHaveValue("THIRD");
  });
});
