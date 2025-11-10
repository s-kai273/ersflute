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
  it("renders existing columns with their constraint indicators", () => {
    renderAttributeContent();

    expect(screen.getByText("MEMBER_ID")).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", {
        name: "Column MEMBER_ID is not null",
      }),
    ).toBeChecked();
    expect(
      screen.getByRole("checkbox", {
        name: "Column MEMBER_ID is unique",
      }),
    ).toBeChecked();

    expect(screen.getByText("EMAIL")).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", {
        name: "Column EMAIL is not null",
      }),
    ).not.toBeChecked();
    expect(
      screen.getByRole("checkbox", {
        name: "Column EMAIL is unique",
      }),
    ).not.toBeChecked();
  });

  it("allows adding a column and configuring it from the detail view", async () => {
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
    expect(within(newRow).getByText("VarCharN(20)")).toBeInTheDocument();
  });

  it("updates the list indicators when editing an existing column", async () => {
    const user = userEvent.setup();
    renderAttributeContent({
      columns: [
        {
          physicalName: "EMAIL",
          logicalName: "Email",
          columnType: ColumnType.VarCharN,
          length: 120,
          notNull: false,
          unique: false,
        },
      ],
    });

    const emailRow = screen.getByText("EMAIL").closest("tr");
    expect(emailRow).not.toBeNull();
    if (!emailRow) {
      throw new Error("Email row not found");
    }

    await user.dblClick(emailRow);

    const detailRegion = await screen.findByRole("region", {
      name: "Column Details",
    });
    await user.click(within(detailRegion).getByLabelText("Not Null"));
    await user.click(within(detailRegion).getByLabelText("Unique"));

    await user.click(screen.getByRole("button", { name: "Back to Columns" }));

    expect(
      screen.getByRole("checkbox", {
        name: "Column EMAIL is not null",
      }),
    ).toBeChecked();
    expect(
      screen.getByRole("checkbox", {
        name: "Column EMAIL is unique",
      }),
    ).toBeChecked();
  });

  it("opens the detail view via Edit and updates constraint toggles", async () => {
    const user = userEvent.setup();
    renderAttributeContent();

    const memberRow = getColumnRow("MEMBER_ID");
    await user.click(memberRow);
    await user.click(screen.getByRole("button", { name: "Edit" }));

    const detailRegion = await screen.findByRole("region", {
      name: "Column Details",
    });
    const primaryKey = within(detailRegion).getByLabelText("Primary Key");
    await user.click(primaryKey);
    const autoIncrement = within(detailRegion).getByLabelText("Auto Increment");
    await user.click(autoIncrement);

    await user.click(screen.getByRole("button", { name: "Back to Columns" }));

    expect(screen.queryByLabelText("Primary key")).not.toBeInTheDocument();

    await user.click(memberRow);
    await user.click(screen.getByRole("button", { name: "Edit" }));
    const reopenedRegion = await screen.findByRole("region", {
      name: "Column Details",
    });
    expect(
      within(reopenedRegion).getByLabelText("Auto Increment"),
    ).toBeChecked();
  });

  it("deletes the selected column and shows the empty state message", async () => {
    const user = userEvent.setup();
    renderAttributeContent({
      columns: [
        {
          physicalName: "ONLY_COLUMN",
          columnType: ColumnType.Int,
          notNull: false,
        },
      ],
    });

    const onlyRow = getColumnRow("ONLY_COLUMN");
    await user.click(onlyRow);
    const deleteButton = screen.getByRole("button", { name: "Delete" });
    await user.click(deleteButton);

    expect(
      screen.getByText("Columns will appear here once added."),
    ).toBeInTheDocument();
    expect(deleteButton).toBeDisabled();
  });

  it("formats the type column based on available length and decimal values", () => {
    renderAttributeContent({
      columns: [
        {
          physicalName: "FULL",
          columnType: ColumnType.Decimal,
          length: 10,
          decimal: 4,
          notNull: false,
        },
        {
          physicalName: "DECIMAL_ONLY",
          columnType: ColumnType.Decimal,
          decimal: 3,
          notNull: false,
        },
        {
          physicalName: "TYPE_ONLY",
          columnType: ColumnType.Decimal,
          notNull: false,
        },
        {
          physicalName: "TYPELESS",
          notNull: false,
        },
      ],
    });

    expect(screen.getByText("Decimal(10, 4)")).toBeInTheDocument();
    expect(screen.getByText("Decimal(3)")).toBeInTheDocument();
    expect(screen.getByText("Decimal")).toBeInTheDocument();

    const typelessRow = getColumnRow("TYPELESS");
    const typeCell = within(typelessRow).getAllByRole("cell")[4];
    expect(typeCell).toHaveTextContent("");
  });

  it("enables advanced inputs based on the selected column type", async () => {
    const user = userEvent.setup();
    renderAttributeContent({ columns: [] });

    await user.click(screen.getByRole("button", { name: "Add" }));
    const detailRegion = await screen.findByRole("region", {
      name: "Column Details",
    });

    const typeSelect = within(detailRegion).getByLabelText("Type");
    const lengthInput = within(detailRegion).getByLabelText("Length");
    const decimalInput = within(detailRegion).getByLabelText("Decimal");
    const unsignedToggle = within(detailRegion).getByLabelText("Unsigned");
    const enumArgsInput = within(detailRegion).getByLabelText(
      "Args of enum/set Type",
    );
    const defaultValueInput =
      within(detailRegion).getByLabelText("Default Value");
    const descriptionInput = within(detailRegion).getByLabelText("Description");

    expect(lengthInput).toBeDisabled();
    expect(decimalInput).toBeDisabled();
    expect(unsignedToggle).toBeDisabled();
    expect(enumArgsInput).toBeDisabled();

    await user.selectOptions(typeSelect, ColumnType.DecimalPS);
    expect(lengthInput).not.toBeDisabled();
    expect(decimalInput).not.toBeDisabled();
    await user.type(lengthInput, "12");
    await user.type(decimalInput, "2");

    await user.selectOptions(typeSelect, ColumnType.Int);
    expect(unsignedToggle).not.toBeDisabled();
    await user.click(unsignedToggle);

    await user.selectOptions(typeSelect, ColumnType.Enum);
    expect(enumArgsInput).not.toBeDisabled();
    await user.type(enumArgsInput, "A,B");

    await user.type(defaultValueInput, "default");
    await user.type(descriptionInput, "Some description");

    await user.click(screen.getByRole("button", { name: "Back to Columns" }));
    expect(screen.getByText("enum")).toBeInTheDocument();
  });
});
