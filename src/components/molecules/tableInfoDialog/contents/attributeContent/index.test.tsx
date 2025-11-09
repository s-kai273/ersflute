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
});
