import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Column } from "@/components/molecules/tableNode/types";
import { ColumnType } from "@/types/columnType";
import { AttributeDetail } from ".";

function createColumn(overrides?: Partial<Column>): Column {
  return {
    physicalName: "MEMBER_ID",
    logicalName: "Member Id",
    columnType: ColumnType.Int,
    notNull: true,
    primaryKey: true,
    autoIncrement: false,
    ...overrides,
  };
}

function createProps(
  overrides: Partial<React.ComponentProps<typeof AttributeDetail>> = {},
) {
  return {
    selectedColumn: createColumn(),
    columnTypeValue: ColumnType.Int,
    columnLength: undefined,
    columnDecimal: undefined,
    columnUnsigned: false,
    columnEnumArgs: undefined,
    setColumnLength: jest.fn(),
    setColumnDecimal: jest.fn(),
    setColumnUnsigned: jest.fn(),
    setColumnEnumArgs: jest.fn(),
    onBack: jest.fn(),
    updateSelectedColumn: jest.fn(),
    columnPhysicalNameInputRef: createRef<HTMLInputElement>(),
    ...overrides,
  };
}

describe("AttributeDetail", () => {
  it("renders a helper message when no column is selected", () => {
    const props = createProps({
      column: undefined,
    });
    render(<AttributeDetail {...props} />);

    expect(
      screen.getByText("Select a column to edit its details."),
    ).toBeInTheDocument();
  });

  it("calls onBack when the back button is clicked", async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<AttributeDetail {...props} />);

    await user.click(screen.getByRole("button", { name: "Back to Columns" }));
    expect(props.onBack).toHaveBeenCalledTimes(1);
  });

  it("disables advanced inputs when no column type is selected", () => {
    const props = createProps({ columnTypeValue: undefined });
    render(<AttributeDetail {...props} />);

    expect(screen.getByLabelText("Length")).toBeDisabled();
    expect(screen.getByLabelText("Decimal")).toBeDisabled();
    expect(screen.getByLabelText("Unsigned")).toBeDisabled();
    expect(screen.getByLabelText("Args of enum/set Type")).toBeDisabled();
  });

  it("enables advanced inputs for column types that support them", () => {
    const { rerender } = render(
      <AttributeDetail
        {...createProps({
          columnTypeValue: ColumnType.DecimalPS,
        })}
      />,
    );

    expect(screen.getByLabelText("Length")).not.toBeDisabled();
    expect(screen.getByLabelText("Decimal")).not.toBeDisabled();

    rerender(
      <AttributeDetail
        {...createProps({
          columnTypeValue: ColumnType.Int,
        })}
      />,
    );
    expect(screen.getByLabelText("Unsigned")).not.toBeDisabled();

    rerender(
      <AttributeDetail
        {...createProps({
          columnTypeValue: ColumnType.Enum,
        })}
      />,
    );
    expect(screen.getByLabelText("Args of enum/set Type")).not.toBeDisabled();
  });

  it("updates the selected column when editing basic fields and toggles", async () => {
    const user = userEvent.setup();
    const updateSelectedColumn = jest.fn();
    const props = createProps({ setColumn: updateSelectedColumn });
    render(<AttributeDetail {...props} />);

    const physicalInput = screen.getByLabelText("Physical Name");
    fireEvent.change(physicalInput, { target: { value: "ID" } });
    expect(updateSelectedColumn).toHaveBeenLastCalledWith("physicalName", "ID");

    const logicalInput = screen.getByLabelText("Logical Name");
    updateSelectedColumn.mockClear();
    fireEvent.change(logicalInput, { target: { value: "Identifier" } });
    expect(updateSelectedColumn).toHaveBeenLastCalledWith(
      "logicalName",
      "Identifier",
    );

    const descriptionInput = screen.getByLabelText("Description");
    updateSelectedColumn.mockClear();
    fireEvent.change(descriptionInput, {
      target: { value: "Some description" },
    });
    expect(updateSelectedColumn).toHaveBeenLastCalledWith(
      "description",
      "Some description",
    );

    const primaryKeyCheckbox = screen.getByLabelText("Primary Key");
    await user.click(primaryKeyCheckbox);
    expect(updateSelectedColumn).toHaveBeenLastCalledWith("primaryKey", false);
  });

  it("updates numeric fields and invokes setter helpers when the type changes", async () => {
    const user = userEvent.setup();
    const setColumnLength = jest.fn();
    const setColumnDecimal = jest.fn();
    const setColumnUnsigned = jest.fn();
    const setColumnEnumArgs = jest.fn();
    const updateSelectedColumn = jest.fn();
    const props = createProps({
      columnTypeValue: ColumnType.DecimalPS,
      setColumnLength,
      setColumnDecimal,
      setColumnUnsigned,
      setColumnEnumArgs,
      setColumn: updateSelectedColumn,
    });
    render(<AttributeDetail {...props} />);

    const lengthInput = screen.getByLabelText("Length");
    fireEvent.change(lengthInput, { target: { value: "12" } });
    expect(setColumnLength).toHaveBeenLastCalledWith(12);
    expect(updateSelectedColumn).toHaveBeenLastCalledWith("length", 12);

    const decimalInput = screen.getByLabelText("Decimal");
    updateSelectedColumn.mockClear();
    fireEvent.change(decimalInput, { target: { value: "2" } });
    expect(setColumnDecimal).toHaveBeenLastCalledWith(2);
    expect(updateSelectedColumn).toHaveBeenLastCalledWith("decimal", 2);

    await user.selectOptions(screen.getByLabelText("Type"), ColumnType.Int);
    expect(setColumnUnsigned).toHaveBeenCalled();
    expect(setColumnLength).toHaveBeenCalled();
    expect(setColumnDecimal).toHaveBeenCalled();
    expect(setColumnEnumArgs).toHaveBeenCalled();
  });

  it("updates the unsigned state when the column type supports it", async () => {
    const user = userEvent.setup();
    const updateSelectedColumn = jest.fn();
    const props = createProps({
      columnTypeValue: ColumnType.Int,
      setColumn: updateSelectedColumn,
    });
    render(<AttributeDetail {...props} />);

    const unsignedToggle = screen.getByLabelText("Unsigned");
    await user.click(unsignedToggle);
    expect(updateSelectedColumn).toHaveBeenLastCalledWith("unsigned", true);
  });

  it("updates enum arguments when available for the column type", async () => {
    const user = userEvent.setup();
    const updateSelectedColumn = jest.fn();
    const props = createProps({
      columnTypeValue: ColumnType.Enum,
      setColumn: updateSelectedColumn,
    });
    render(<AttributeDetail {...props} />);

    const enumArgsInput = screen.getByLabelText("Args of enum/set Type");
    fireEvent.change(enumArgsInput, { target: { value: "A,B" } });
    expect(updateSelectedColumn).toHaveBeenLastCalledWith("enumArgs", "A,B");
  });

  it("handles auto increment and default value changes", async () => {
    const user = userEvent.setup();
    const updateSelectedColumn = jest.fn();
    const props = createProps({
      setColumn: updateSelectedColumn,
      column: createColumn({ autoIncrement: false }),
    });
    render(<AttributeDetail {...props} />);

    const autoIncrement = screen.getByLabelText("Auto Increment");
    await user.click(autoIncrement);
    expect(updateSelectedColumn).toHaveBeenLastCalledWith(
      "autoIncrement",
      true,
    );

    const defaultInput = screen.getByLabelText("Default Value");
    fireEvent.change(defaultInput, { target: { value: "default" } });
    expect(updateSelectedColumn).toHaveBeenLastCalledWith(
      "defaultValue",
      "default",
    );
    fireEvent.change(defaultInput, { target: { value: "" } });
    expect(updateSelectedColumn).toHaveBeenLastCalledWith(
      "defaultValue",
      undefined,
    );
  });
});
