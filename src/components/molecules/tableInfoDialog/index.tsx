import { useEffect, useMemo, useRef, useState } from "react";
import { KeyIcon } from "@heroicons/react/16/solid";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Column, TableNodeData } from "../tableNode/types";
import { TableInfoDialogProps } from "./types";

type EditableColumn = Column & {
  logicalName?: string;
  columnType?: string;
  length?: number;
  referredColumn?: string;
  unique?: boolean;
};

function toEditableColumns(columns?: Column[]): EditableColumn[] {
  if (!columns) {
    return [];
  }

  return columns.map((column) => ({
    ...column,
    logicalName: column.logicalName ?? "",
    columnType: column.columnType ?? "",
    referredColumn: column.referredColumn ?? "",
    unique: column.unique ?? false,
  }));
}

export function TableInfoDialog({
  data,
  onApply,
  onCancel,
  ...props
}: TableInfoDialogProps) {
  const { open, onOpenChange, ...dialogProps } = props;
  const [tableData, setTableData] = useState<TableNodeData>({
    ...data,
    columns: toEditableColumns(data.columns),
  });
  const [selectedColumnIndex, setSelectedColumnIndex] = useState<number | null>(
    null,
  );
  const [attributeView, setAttributeView] = useState<"list" | "detail">("list");
  const [description, setDescription] = useState("");
  const [shouldFocusColumnDetails, setShouldFocusColumnDetails] =
    useState(false);
  const columnPhysicalNameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSelectedColumnIndex(null);
    setAttributeView("list");
    setDescription("");
  }, [data, open]);

  useEffect(() => {
    if (
      attributeView === "detail" &&
      shouldFocusColumnDetails &&
      columnPhysicalNameInputRef.current
    ) {
      columnPhysicalNameInputRef.current.focus();
      columnPhysicalNameInputRef.current.select();
      setShouldFocusColumnDetails(false);
    }
  }, [attributeView, shouldFocusColumnDetails]);

  const selectedColumn = useMemo(
    () =>
      selectedColumnIndex != null
        ? tableData?.columns?.[selectedColumnIndex]
        : undefined,
    [tableData, selectedColumnIndex],
  );

  const openColumnDetail = (index: number, focus = true) => {
    setSelectedColumnIndex(index);
    setAttributeView("detail");
    if (focus) {
      setShouldFocusColumnDetails(true);
    }
  };

  const handleAddColumn = () => {
    const newColumn: EditableColumn = {
      physicalName: "",
      logicalName: "",
      columnType: "",
      length: undefined,
      notNull: false,
      primaryKey: false,
      referredColumn: "",
      unique: false,
    };

    const nextColumns = [
      ...(tableData && tableData.columns ? tableData.columns : []),
      newColumn,
    ];
    setTableData({
      ...tableData,
      columns: nextColumns,
    });
    openColumnDetail(nextColumns.length - 1);
  };

  const handleEditColumn = () => {
    if (selectedColumnIndex == null) {
      return;
    }

    openColumnDetail(selectedColumnIndex);
  };

  const handleDeleteColumn = () => {
    if (selectedColumnIndex == null) {
      return;
    }

    const columnIndex = selectedColumnIndex;
    setTableData((current) => {
      const nextColumns = current.columns?.filter(
        (_, index) => index !== columnIndex,
      );
      if (nextColumns && nextColumns.length === 0) {
        setSelectedColumnIndex(null);
      } else {
        const nextIndex = Math.min(
          columnIndex,
          nextColumns ? nextColumns.length - 1 : 0,
        );
        setSelectedColumnIndex(nextIndex);
      }
      return {
        ...current,
        columns: nextColumns,
      };
    });
    setAttributeView("list");
  };

  const moveColumn = (direction: "up" | "down") => {
    if (!(tableData && tableData.columns) || selectedColumnIndex == null) {
      return;
    }

    const targetIndex =
      direction === "up" ? selectedColumnIndex - 1 : selectedColumnIndex + 1;

    if (targetIndex < 0 || targetIndex >= tableData.columns.length) {
      return;
    }

    setTableData((current) => {
      const nextColumns = [
        ...(current && current.columns ? current.columns : []),
      ];
      const [removed] = nextColumns.splice(selectedColumnIndex, 1);
      nextColumns.splice(targetIndex, 0, removed);
      return {
        ...current,
        columns: nextColumns,
      };
    });
    setSelectedColumnIndex(targetIndex);
  };

  const handleBackToColumnList = () => {
    setAttributeView("list");
  };

  const updateSelectedColumn = <Key extends keyof EditableColumn>(
    key: Key,
    value: EditableColumn[Key],
  ) => {
    if (selectedColumnIndex == null) {
      return;
    }

    setTableData((current) => {
      const nextColumns = [
        ...(current && current.columns ? current.columns : []),
      ];
      nextColumns[selectedColumnIndex] = {
        ...nextColumns[selectedColumnIndex],
        [key]: value,
      };
      return {
        ...current,
        columns: nextColumns,
      };
    });
  };

  const handleApply = () => {
    const columns = tableData.columns || [];
    const preparedColumns = columns.map<Column>((column) => ({
      physicalName: column.physicalName.trim(),
      logicalName: column.logicalName?.trim()
        ? column.logicalName.trim()
        : undefined,
      columnType: column.columnType?.trim()
        ? column.columnType.trim()
        : undefined,
      length: column.length,
      notNull: column.notNull,
      primaryKey: column.primaryKey,
      referredColumn: column.referredColumn?.trim()
        ? column.referredColumn.trim()
        : undefined,
      unique: column.unique,
    }));

    onApply?.({
      ...data,
      physicalName: tableData.physicalName.trim(),
      logicalName: tableData?.logicalName?.trim()
        ? tableData?.logicalName.trim()
        : undefined,
      columns: preparedColumns,
    });
    onOpenChange?.(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange?.(false);
  };

  const typeDisplay = (column: EditableColumn) => {
    if (!column.columnType) {
      return "";
    }

    if (column.length != null && column.length >= 0) {
      return `${column.columnType}(${column.length})`;
    }

    return column.columnType;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...dialogProps}>
      <DialogContent className="max-w-[1000px] sm:max-w-[1000px] sm:h-[650px] sm:max-h-[80vh] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Table Information</DialogTitle>
        </DialogHeader>
        <Tabs
          defaultValue="attribute"
          className="flex h-full flex-col gap-2 overflow-hidden"
        >
          <TabsList className="rounded-md border border-slate-200 bg-white p-0.5">
            <TabsTrigger className="px-3" value="attribute">
              Attribute
            </TabsTrigger>
            <TabsTrigger className="px-3" value="description">
              Description
            </TabsTrigger>
            <TabsTrigger className="px-3" value="constraint-option">
              Constraint/Option
            </TabsTrigger>
            <TabsTrigger className="px-3" value="compound-unique-key">
              Compound Unique Key
            </TabsTrigger>
            <TabsTrigger className="px-3" value="index">
              Index
            </TabsTrigger>
            <TabsTrigger className="px-3" value="advanced-settings">
              Advanced Settings
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="attribute"
            className="flex flex-1 flex-col gap-1 overflow-y-auto pr-2"
          >
            <section className="flex-none rounded-md border border-slate-200 bg-white">
              <div className="grid grid-cols-[140px_1fr_140px_1fr] items-center gap-3 border-b border-slate-200 px-4 py-3 text-sm">
                <label
                  className="font-medium text-slate-600"
                  htmlFor="table-info-physical-name"
                >
                  Physical Name
                </label>
                <input
                  id="table-info-physical-name"
                  className="h-8 rounded border border-slate-300 px-2 text-sm shadow-inner focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-200"
                  type="text"
                  value={tableData.physicalName}
                  onChange={(event) =>
                    setTableData({
                      ...tableData,
                      physicalName: event.target.value,
                    })
                  }
                />
                <label
                  className="font-medium text-slate-600"
                  htmlFor="table-info-logical-name"
                >
                  Logical Name
                </label>
                <input
                  id="table-info-logical-name"
                  className="h-8 rounded border border-slate-300 px-2 text-sm shadow-inner focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-200"
                  type="text"
                  value={tableData.logicalName}
                  onChange={(event) =>
                    setTableData({
                      ...tableData,
                      logicalName: event.target.value,
                    })
                  }
                />
              </div>
            </section>

            {attributeView === "list" ? (
              <section className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm">
                <div className="h-[150px] overflow-y-auto rounded border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                      <tr>
                        <th className="w-10 px-2 py-2 text-center">PK</th>
                        <th className="w-10 px-2 py-2 text-center">FK</th>
                        <th className="px-2 py-2 text-left">Physical Name</th>
                        <th className="px-2 py-2 text-left">Logical Name</th>
                        <th className="px-2 py-2 text-left">Type</th>
                        <th className="w-24 px-2 py-2 text-center">NOT NULL</th>
                        <th className="w-20 px-2 py-2 text-center">UNIQUE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
                      {tableData?.columns?.map((column, index) => {
                        const isSelected = selectedColumnIndex === index;
                        return (
                          <tr
                            key={`${column.physicalName}-${index}`}
                            className={cn(
                              "cursor-pointer transition-colors hover:bg-blue-50",
                              isSelected && "bg-blue-100/70",
                            )}
                            onClick={() => setSelectedColumnIndex(index)}
                            onDoubleClick={() => openColumnDetail(index)}
                          >
                            <td className="px-2 py-2 text-center">
                              {column.primaryKey && (
                                <KeyIcon
                                  aria-label="Primary key"
                                  className="mx-auto h-4 w-4 text-amber-500"
                                />
                              )}
                            </td>
                            <td className="px-2 py-2 text-center">
                              {column.referredColumn ? "✓" : ""}
                            </td>
                            <td className="px-2 py-2 font-medium">
                              {column.physicalName}
                            </td>
                            <td className="px-2 py-2">{column.logicalName}</td>
                            <td className="px-2 py-2">{typeDisplay(column)}</td>
                            <td className="px-2 py-2 text-center">
                              <input
                                aria-label={`Column ${column.physicalName} is not null`}
                                type="checkbox"
                                checked={column.notNull}
                                readOnly
                                className="pointer-events-none accent-blue-500"
                              />
                            </td>
                            <td className="px-2 py-2 text-center">
                              <input
                                aria-label={`Column ${column.physicalName} is unique`}
                                type="checkbox"
                                checked={column.unique ?? false}
                                readOnly
                                className="pointer-events-none accent-blue-500"
                              />
                            </td>
                          </tr>
                        );
                      })}
                      {tableData?.columns?.length === 0 && (
                        <tr>
                          <td
                            className="px-4 py-6 text-center text-sm text-slate-400"
                            colSpan={7}
                          >
                            Columns will appear here once added.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddColumn}
                  >
                    Add
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleEditColumn}
                    disabled={selectedColumnIndex == null}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteColumn}
                    disabled={selectedColumnIndex == null}
                  >
                    Delete
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => moveColumn("up")}
                    disabled={
                      selectedColumnIndex == null || selectedColumnIndex === 0
                    }
                  >
                    Up
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => moveColumn("down")}
                    disabled={
                      selectedColumnIndex == null ||
                      !tableData?.columns ||
                      selectedColumnIndex === tableData.columns.length - 1
                    }
                  >
                    Down
                  </Button>
                </div>
              </section>
            ) : (
              <section
                role="region"
                aria-labelledby="table-info-column-details-heading"
                className="flex flex-1 flex-col overflow-hidden rounded-md border border-slate-200 bg-white px-4 py-4 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleBackToColumnList}
                    >
                      Back to Columns
                    </Button>
                    <h3
                      id="table-info-column-details-heading"
                      className="text-base font-semibold text-slate-600"
                    >
                      Column Details
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => moveColumn("up")}
                      disabled={
                        selectedColumnIndex == null || selectedColumnIndex === 0
                      }
                    >
                      Move Up
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => moveColumn("down")}
                      disabled={
                        selectedColumnIndex == null ||
                        !tableData?.columns ||
                        selectedColumnIndex === tableData.columns.length - 1
                      }
                    >
                      Move Down
                    </Button>
                  </div>
                </div>

                {selectedColumn ? (
                  <>
                    <div className="mt-4 flex-1 overflow-y-auto pr-1">
                      <div className="grid gap-3 text-sm sm:grid-cols-2">
                        <label
                          className="flex flex-col gap-1"
                          htmlFor="table-info-column-physical-name"
                        >
                          <span className="font-medium text-slate-600">
                            Physical Name
                          </span>
                          <input
                            id="table-info-column-physical-name"
                            ref={columnPhysicalNameInputRef}
                            className="h-8 rounded border border-slate-300 px-2 shadow-inner focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-200"
                            type="text"
                            value={selectedColumn.physicalName}
                            onChange={(event) =>
                              updateSelectedColumn(
                                "physicalName",
                                event.target.value,
                              )
                            }
                          />
                        </label>
                        <label
                          className="flex flex-col gap-1"
                          htmlFor="table-info-column-logical-name"
                        >
                          <span className="font-medium text-slate-600">
                            Logical Name
                          </span>
                          <input
                            id="table-info-column-logical-name"
                            className="h-8 rounded border border-slate-300 px-2 shadow-inner focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-200"
                            type="text"
                            value={selectedColumn.logicalName ?? ""}
                            onChange={(event) =>
                              updateSelectedColumn(
                                "logicalName",
                                event.target.value,
                              )
                            }
                          />
                        </label>
                        <label
                          className="flex flex-col gap-1"
                          htmlFor="table-info-column-type"
                        >
                          <span className="font-medium text-slate-600">
                            Type
                          </span>
                          <input
                            id="table-info-column-type"
                            className="h-8 rounded border border-slate-300 px-2 shadow-inner focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-200"
                            type="text"
                            value={selectedColumn.columnType ?? ""}
                            onChange={(event) =>
                              updateSelectedColumn(
                                "columnType",
                                event.target.value,
                              )
                            }
                          />
                        </label>
                        <label
                          className="flex flex-col gap-1"
                          htmlFor="table-info-column-length"
                        >
                          <span className="font-medium text-slate-600">
                            Length
                          </span>
                          <input
                            id="table-info-column-length"
                            className="h-8 rounded border border-slate-300 px-2 shadow-inner focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-200"
                            type="number"
                            value={selectedColumn.length ?? ""}
                            onChange={(event) =>
                              updateSelectedColumn(
                                "length",
                                event.target.value === ""
                                  ? undefined
                                  : Number(event.target.value),
                              )
                            }
                          />
                        </label>
                        <label
                          className="flex items-center gap-2"
                          htmlFor="table-info-column-not-null"
                        >
                          <input
                            id="table-info-column-not-null"
                            className="h-4 w-4 rounded border border-slate-300 text-blue-500 focus:ring-blue-200"
                            type="checkbox"
                            checked={selectedColumn.notNull}
                            onChange={(event) =>
                              updateSelectedColumn(
                                "notNull",
                                event.target.checked,
                              )
                            }
                          />
                          <span className="text-sm font-medium text-slate-600">
                            Not Null
                          </span>
                        </label>
                        <label
                          className="flex items-center gap-2"
                          htmlFor="table-info-column-unique"
                        >
                          <input
                            id="table-info-column-unique"
                            className="h-4 w-4 rounded border border-slate-300 text-blue-500 focus:ring-blue-200"
                            type="checkbox"
                            checked={selectedColumn.unique ?? false}
                            onChange={(event) =>
                              updateSelectedColumn(
                                "unique",
                                event.target.checked,
                              )
                            }
                          />
                          <span className="text-sm font-medium text-slate-600">
                            Unique
                          </span>
                        </label>
                        <label
                          className="flex items-center gap-2"
                          htmlFor="table-info-column-primary-key"
                        >
                          <input
                            id="table-info-column-primary-key"
                            className="h-4 w-4 rounded border border-slate-300 text-blue-500 focus:ring-blue-200"
                            type="checkbox"
                            checked={selectedColumn.primaryKey ?? false}
                            onChange={(event) =>
                              updateSelectedColumn(
                                "primaryKey",
                                event.target.checked,
                              )
                            }
                          />
                          <span className="text-sm font-medium text-slate-600">
                            Primary Key
                          </span>
                        </label>
                        <label
                          className="flex flex-col gap-1 sm:col-span-2"
                          htmlFor="table-info-column-reference"
                        >
                          <span className="font-medium text-slate-600">
                            References
                          </span>
                          <input
                            id="table-info-column-reference"
                            className="h-8 rounded border border-slate-300 px-2 shadow-inner focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-200"
                            type="text"
                            value={selectedColumn.referredColumn ?? ""}
                            onChange={(event) =>
                              updateSelectedColumn(
                                "referredColumn",
                                event.target.value,
                              )
                            }
                          />
                        </label>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteColumn}
                        disabled={selectedColumnIndex == null}
                      >
                        Delete Column
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleBackToColumnList}
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="mt-4 text-sm text-slate-500">
                    Select a column to edit its details.
                  </p>
                )}
              </section>
            )}
          </TabsContent>
          <TabsContent
            value="description"
            className="rounded-md border border-slate-200 bg-white p-4"
          >
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-600">
                Table Description
              </span>
              <textarea
                className="min-h-[150px] rounded border border-slate-300 px-2 py-2 text-sm leading-5 shadow-inner focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-200"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </label>
          </TabsContent>
          <TabsContent
            value="constraint-option"
            className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500"
          >
            Constraint and option settings will be available in a future update.
          </TabsContent>
          <TabsContent
            value="compound-unique-key"
            className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500"
          >
            Manage compound unique keys here once configured.
          </TabsContent>
          <TabsContent
            value="index"
            className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500"
          >
            Index configuration will be implemented soon.
          </TabsContent>
          <TabsContent
            value="advanced-settings"
            className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500"
          >
            Advanced settings are not yet available for this table.
          </TabsContent>
        </Tabs>
        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={handleApply}>
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
