import type { ComponentProps } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TableInfoDialog } from ".";
import type { TableNodeData } from "../tableNode/types";

function createTableData(): TableNodeData {
  return {
    physicalName: "MEMBERS",
    logicalName: "会員",
    color: { r: 120, g: 140, b: 200 },
    columns: [
      {
        physicalName: "MEMBER_ID",
        logicalName: "会員ID",
        columnType: "bigint",
        notNull: true,
        primaryKey: true,
        unique: true,
      },
    ],
  };
}

function renderDialog(
  overrides?: Partial<ComponentProps<typeof TableInfoDialog>>,
) {
  const data = createTableData();
  return render(
    <TableInfoDialog
      open
      onOpenChange={() => {}}
      data={data}
      {...overrides}
    />,
  );
}

describe("TableInfoDialog", () => {
  it("renders table metadata in the Attribute tab", () => {
    renderDialog();

    expect(
      screen.getByLabelText("Physical Name", {
        selector: "input#table-info-physical-name",
      }),
    ).toHaveValue("MEMBERS");
    expect(
      screen.getByLabelText("Logical Name", {
        selector: "input#table-info-logical-name",
      }),
    ).toHaveValue("会員");

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
  });

  it("calls onApply with updated data when OK is pressed", async () => {
    const onApply = jest.fn();
    const user = userEvent.setup();
    renderDialog({ onApply });

    const tablePhysicalNameInput = screen.getByLabelText("Physical Name", {
      selector: "input#table-info-physical-name",
    });
    await user.clear(tablePhysicalNameInput);
    await user.type(tablePhysicalNameInput, "MEMBERS_NEW");

    await user.click(screen.getByRole("button", { name: "Add" }));

    const detailRegion = await screen.findByRole("region", {
      name: "Column Details",
    });

    const columnPhysicalNameInput = within(detailRegion).getByLabelText(
      "Physical Name",
    );
    await user.clear(columnPhysicalNameInput);
    await user.type(columnPhysicalNameInput, "LAST_NAME");

    const typeInput = within(detailRegion).getByLabelText("Type");
    await user.type(typeInput, "varchar");

    const lengthInput = within(detailRegion).getByLabelText("Length");
    await user.clear(lengthInput);
    await user.type(lengthInput, "20");

    await user.click(within(detailRegion).getByLabelText("Not Null"));
    await user.click(within(detailRegion).getByLabelText("Unique"));

    await user.click(screen.getByRole("button", { name: "OK" }));

    expect(onApply).toHaveBeenCalledTimes(1);
    const appliedValue = onApply.mock.calls[0][0] as TableNodeData;
    expect(appliedValue.physicalName).toBe("MEMBERS_NEW");
    expect(appliedValue.columns).toHaveLength(2);
    expect(appliedValue.columns?.[1]).toMatchObject({
      physicalName: "LAST_NAME",
      columnType: "varchar",
      length: 20,
      notNull: true,
      unique: true,
    });
  });
});
