import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ColumnType } from "@/types/columnType";
import { AttributeList } from ".";

function getColumnRow(physicalName: string): HTMLTableRowElement {
  const cell = screen.getByText(physicalName);
  const row = cell.closest("tr");
  if (!row) {
    throw new Error(`Row for ${physicalName} not found`);
  }
  return row;
}

describe("AttributeList", () => {
  it("renders each column with its indicators", () => {
    render(
      <AttributeList
        columns={[
          {
            physicalName: "MEMBER_ID",
            logicalName: "Member",
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
        ]}
        selectedColumnIndex={0}
        onSelectColumn={jest.fn()}
        onOpenDetail={jest.fn()}
        onAddColumn={jest.fn()}
        onEditColumn={jest.fn()}
        onDeleteColumn={jest.fn()}
      />,
    );

    expect(screen.getByText("MEMBER_ID")).toBeInTheDocument();
    expect(screen.getByText("EMAIL")).toBeInTheDocument();
    expect(screen.getAllByLabelText("Primary key")).toHaveLength(1);
    expect(
      screen.getByRole("checkbox", {
        name: "Column MEMBER_ID is not null",
      }),
    ).toBeChecked();
    expect(
      screen.getByRole("checkbox", {
        name: "Column EMAIL is unique",
      }),
    ).not.toBeChecked();
  });

  it("invokes the provided callbacks for user actions", async () => {
    const user = userEvent.setup();
    const onSelectColumn = jest.fn();
    const onOpenDetail = jest.fn();
    const onAddColumn = jest.fn();
    const onEditColumn = jest.fn();
    const onDeleteColumn = jest.fn();

    render(
      <AttributeList
        columns={[
          {
            physicalName: "FIRST",
            columnType: ColumnType.Int,
            notNull: false,
          },
          {
            physicalName: "SECOND",
            columnType: ColumnType.Int,
            notNull: false,
          },
        ]}
        selectedColumnIndex={1}
        onSelectColumn={onSelectColumn}
        onOpenDetail={onOpenDetail}
        onAddColumn={onAddColumn}
        onEditColumn={onEditColumn}
        onDeleteColumn={onDeleteColumn}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(onAddColumn).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Edit" }));
    expect(onEditColumn).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(onDeleteColumn).toHaveBeenCalledTimes(1);

    const secondRow = getColumnRow("SECOND");
    await user.click(secondRow);
    expect(onSelectColumn).toHaveBeenCalledWith(1);

    await user.dblClick(secondRow);
    expect(onOpenDetail).toHaveBeenCalledWith(1);
  });

  it("renders the empty state message when no columns exist", () => {
    render(
      <AttributeList
        columns={[]}
        selectedColumnIndex={null}
        onSelectColumn={jest.fn()}
        onOpenDetail={jest.fn()}
        onAddColumn={jest.fn()}
        onEditColumn={jest.fn()}
        onDeleteColumn={jest.fn()}
      />,
    );

    expect(
      screen.getByText("Columns will appear here once added."),
    ).toBeInTheDocument();
  });

  it("formats the type cell based on length and decimal metadata", () => {
    render(
      <AttributeList
        columns={[
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
        ]}
        selectedColumnIndex={null}
        onSelectColumn={jest.fn()}
        onOpenDetail={jest.fn()}
        onAddColumn={jest.fn()}
        onEditColumn={jest.fn()}
        onDeleteColumn={jest.fn()}
      />,
    );

    expect(screen.getByText("decimal(10, 4)")).toBeInTheDocument();
    expect(screen.getByText("decimal(3)")).toBeInTheDocument();
    expect(screen.getByText("decimal")).toBeInTheDocument();

    const typelessRow = getColumnRow("TYPELESS");
    const typeCell = within(typelessRow).getAllByRole("cell")[4];
    expect(typeCell).toHaveTextContent("");
  });

  it("renders a checkmark for foreign key references", () => {
    render(
      <AttributeList
        columns={[
          {
            physicalName: "FK_COLUMN",
            columnType: ColumnType.Int,
            notNull: false,
            referredColumn: "OTHER_TABLE.ID",
          },
        ]}
        selectedColumnIndex={0}
        onSelectColumn={jest.fn()}
        onOpenDetail={jest.fn()}
        onAddColumn={jest.fn()}
        onEditColumn={jest.fn()}
        onDeleteColumn={jest.fn()}
      />,
    );

    const fkCell = getColumnRow("FK_COLUMN").querySelectorAll("td")[1];
    expect(fkCell).toHaveTextContent("✓");
  });
});
