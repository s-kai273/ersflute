import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ColumnType } from "@/types/columnType";
import { AttributeDetail } from ".";

describe("AttributeDetail", () => {
  it("focuses the physical name input and returns the latest column via the back action", async () => {
    const user = userEvent.setup();
    const onBack = jest.fn();

    render(
      <AttributeDetail
        column={{
          physicalName: "EMAIL",
          logicalName: "Email",
          columnType: ColumnType.VarCharN,
          length: 120,
          notNull: false,
          primaryKey: true,
          unique: false,
          autoIncrement: false,
          description: "contact email",
          defaultValue: "sample@example.com",
        }}
        onBack={onBack}
      />,
    );

    const physicalInput = screen.getByLabelText("Physical Name");
    expect(physicalInput).toHaveFocus();

    await user.clear(physicalInput);
    await user.type(physicalInput, "EMAIL_ADDRESS");

    const logicalInput = screen.getByLabelText("Logical Name");
    await user.clear(logicalInput);

    const notNullCheckbox = screen.getByLabelText("Not Null");
    await user.click(notNullCheckbox);

    const descriptionInput = screen.getByLabelText("Description");
    await user.type(descriptionInput, " - updated");

    await user.click(screen.getByRole("button", { name: "Back to Columns" }));

    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onBack).toHaveBeenCalledWith(
      expect.objectContaining({
        physicalName: "EMAIL_ADDRESS",
        logicalName: undefined,
        notNull: true,
        description: "contact email - updated",
      }),
    );
  });

  it("clears unsupported metadata when selecting a type without that support", async () => {
    const user = userEvent.setup();
    const onBack = jest.fn();

    render(
      <AttributeDetail
        column={{
          physicalName: "AMOUNT",
          columnType: ColumnType.FloatMD,
          length: 10,
          decimal: 4,
          unsigned: true,
          notNull: true,
        }}
        onBack={onBack}
      />,
    );

    const typeSelect = screen.getByLabelText("Type");
    const lengthInput = screen.getByLabelText(
      "Length",
    ) as HTMLInputElement;
    const decimalInput = screen.getByLabelText(
      "Decimal",
    ) as HTMLInputElement;
    const unsignedCheckbox = screen.getByLabelText("Unsigned");

    expect(lengthInput).toBeEnabled();
    expect(lengthInput.value).toBe("10");
    expect(decimalInput).toBeEnabled();
    expect(decimalInput.value).toBe("4");
    expect(unsignedCheckbox).toBeEnabled();
    expect(unsignedCheckbox).toBeChecked();

    await user.selectOptions(typeSelect, ColumnType.Char);

    expect(lengthInput).toBeDisabled();
    expect(lengthInput.value).toBe("");
    expect(decimalInput).toBeDisabled();
    expect(decimalInput.value).toBe("");
    expect(unsignedCheckbox).toBeDisabled();
    expect(unsignedCheckbox).not.toBeChecked();

    await user.click(screen.getByRole("button", { name: "Back to Columns" }));

    expect(onBack).toHaveBeenCalledWith(
      expect.objectContaining({
        columnType: ColumnType.Char,
        length: undefined,
        decimal: undefined,
        unsigned: undefined,
      }),
    );
  });

  it("only enables the enum args input for enum compatible types", async () => {
    const user = userEvent.setup();
    const onBack = jest.fn();

    render(
      <AttributeDetail
        column={{
          physicalName: "STATUS",
          columnType: ColumnType.Enum,
          enumArgs: "ACTIVE,INACTIVE",
          notNull: true,
        }}
        onBack={onBack}
      />,
    );

    const enumArgsInput = screen.getByLabelText(
      "Args of enum/set Type",
    ) as HTMLInputElement;
    const typeSelect = screen.getByLabelText("Type");

    expect(enumArgsInput).toBeEnabled();
    expect(enumArgsInput.value).toBe("ACTIVE,INACTIVE");

    await user.type(enumArgsInput, ",PENDING");
    expect(enumArgsInput.value).toBe("ACTIVE,INACTIVE,PENDING");

    await user.selectOptions(typeSelect, ColumnType.Int);

    expect(enumArgsInput).toBeDisabled();
    expect(enumArgsInput.value).toBe("");

    await user.click(screen.getByRole("button", { name: "Back to Columns" }));

    expect(onBack).toHaveBeenCalledWith(
      expect.objectContaining({
        columnType: ColumnType.Int,
        enumArgs: undefined,
      }),
    );
  });
});
