import { useEffect, useMemo, useRef, useState } from "react";
import { DialogTitle } from "@radix-ui/react-dialog";
import { KeyIcon } from "@heroicons/react/16/solid";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { TableInfoDialogProps } from "./types";
import { Column } from "../tableNode/types";

type EditableColumn = Column & {
  logicalName?: string;
  columnType?: string;
  length?: number;
  referredColumn?: string;
  unique?: boolean;
};

const buttonClass =
  "rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none";

const secondaryButtonClass =
  "rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50";

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
  const [physicalName, setPhysicalName] = useState(data.physicalName);
  const [logicalName, setLogicalName] = useState(data.logicalName ?? "");
  const [columns, setColumns] = useState<EditableColumn[]>(
    toEditableColumns(data.columns),
  );
  const [selectedColumnIndex, setSelectedColumnIndex] = useState<
    number | null
  >(null);
  const [description, setDescription] = useState("");
  const [groupName, setGroupName] = useState("");
  const [shouldFocusColumnDetails, setShouldFocusColumnDetails] =
    useState(false);
  const columnPhysicalNameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setPhysicalName(data.physicalName);
    setLogicalName(data.logicalName ?? "");
    setColumns(toEditableColumns(data.columns));
    setSelectedColumnIndex(null);
    setDescription("");
    setGroupName("");
  }, [data, open]);

  useEffect(() => {
    if (shouldFocusColumnDetails && columnPhysicalNameInputRef.current) {
      columnPhysicalNameInputRef.current.focus();
      columnPhysicalNameInputRef.current.select();
      setShouldFocusColumnDetails(false);
    }
  }, [shouldFocusColumnDetails]);

  const selectedColumn = useMemo(
    () =>
      selectedColumnIndex != null ? columns[selectedColumnIndex] : undefined,
    [columns, selectedColumnIndex],
  );

  const handleAddColumn = () => {
    const newColumn: EditableColumn = {
      physicalName: `COLUMN_${columns.length + 1}`,
      logicalName: "",
      columnType: "",
      length: undefined,
      notNull: false,
      primaryKey: false,
      referredColumn: "",
      unique: false,
    };

    setColumns((current) => [...current, newColumn]);
    setSelectedColumnIndex(columns.length);
    setShouldFocusColumnDetails(true);
  };

  const handleEditColumn = () => {
    if (selectedColumnIndex == null) {
      return;
    }

    setShouldFocusColumnDetails(true);
  };

  const handleDeleteColumn = () => {
    if (selectedColumnIndex == null) {
      return;
    }

    setColumns((current) =>
      current.filter((_, index) => index !== selectedColumnIndex),
    );
    setSelectedColumnIndex(null);
  };

  const moveColumn = (direction: "up" | "down") => {
    if (selectedColumnIndex == null) {
      return;
    }

    const targetIndex =
      direction === "up" ? selectedColumnIndex - 1 : selectedColumnIndex + 1;

    if (targetIndex < 0 || targetIndex >= columns.length) {
      return;
    }

    setColumns((current) => {
      const next = [...current];
      const [removed] = next.splice(selectedColumnIndex, 1);
      next.splice(targetIndex, 0, removed);
      return next;
    });
    setSelectedColumnIndex(targetIndex);
  };

  const updateSelectedColumn = <Key extends keyof EditableColumn>(
    key: Key,
    value: EditableColumn[Key],
  ) => {
    if (selectedColumnIndex == null) {
      return;
    }

    setColumns((current) => {
      const next = [...current];
      next[selectedColumnIndex] = {
        ...next[selectedColumnIndex],
        [key]: value,
      };
      return next;
    });
  };

  const handleApply = () => {
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
      physicalName: physicalName.trim(),
      logicalName: logicalName.trim() ? logicalName.trim() : undefined,
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
      <DialogContent className="max-w-[1000px] sm:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>Table Information</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="attribute" className="gap-4">
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
          <TabsContent value="attribute" className="flex flex-col gap-4">
            <section className="rounded-md border border-slate-200 bg-white">
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
                  value={physicalName}
                  onChange={(event) => setPhysicalName(event.target.value)}
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
                  value={logicalName}
                  onChange={(event) => setLogicalName(event.target.value)}
                />
              </div>

              <div className="px-4 pb-4 pt-3">
                <div className="overflow-hidden rounded border border-slate-200">
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
                      {columns.map((column, index) => {
                        const isSelected = selectedColumnIndex === index;
                        return (
                          <tr
                            key={`${column.physicalName}-${index}`}
                            className={cn(
                              "cursor-pointer transition-colors hover:bg-blue-50",
                              isSelected && "bg-blue-100/70",
                            )}
                            onClick={() => setSelectedColumnIndex(index)}
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
                      {columns.length === 0 && (
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
                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                  <button
                    type="button"
                    className={buttonClass}
                    onClick={handleAddColumn}
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    className={buttonClass}
                    onClick={handleEditColumn}
                    disabled={selectedColumnIndex == null}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={buttonClass}
                    onClick={handleDeleteColumn}
                    disabled={selectedColumnIndex == null}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    className={buttonClass}
                    onClick={() => moveColumn("up")}
                    disabled={
                      selectedColumnIndex == null || selectedColumnIndex === 0
                    }
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    className={buttonClass}
                    onClick={() => moveColumn("down")}
                    disabled={
                      selectedColumnIndex == null ||
                      selectedColumnIndex === columns.length - 1
                    }
                  >
                    Down
                  </button>
                </div>

                {selectedColumn && (
                  <div className="mt-4 rounded border border-slate-200 bg-slate-50 px-4 py-3">
                    <h3 className="text-sm font-semibold text-slate-600">
                      Column Details
                    </h3>
                    <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                      <label className="flex flex-col gap-1">
                        <span className="font-medium text-slate-600">
                          Physical Name
                        </span>
                        <input
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
                      <label className="flex flex-col gap-1">
                        <span className="font-medium text-slate-600">
                          Logical Name
                        </span>
                        <input
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
                      <label className="flex flex-col gap-1">
                        <span className="font-medium text-slate-600">
                          Type
                        </span>
                        <input
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
                      <label className="flex flex-col gap-1">
                        <span className="font-medium text-slate-600">
                          Length
                        </span>
                        <input
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
                      <label className="flex items-center gap-2">
                        <input
                          className="h-4 w-4 accent-blue-500"
                          type="checkbox"
                          checked={selectedColumn.notNull}
                          onChange={(event) =>
                            updateSelectedColumn("notNull", event.target.checked)
                          }
                        />
                        <span className="text-sm font-medium text-slate-600">
                          Not Null
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          className="h-4 w-4 accent-blue-500"
                          type="checkbox"
                          checked={selectedColumn.unique ?? false}
                          onChange={(event) =>
                            updateSelectedColumn("unique", event.target.checked)
                          }
                        />
                        <span className="text-sm font-medium text-slate-600">
                          Unique
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          className="h-4 w-4 accent-blue-500"
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
                      <label className="flex flex-col gap-1">
                        <span className="font-medium text-slate-600">
                          References
                        </span>
                        <input
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
                )}
              </div>
            </section>

            <section className="space-y-3 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm">
              <header className="font-medium text-slate-600">Group</header>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  className="h-8 flex-1 rounded border border-slate-300 px-2 shadow-inner focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-200"
                  type="text"
                  placeholder="Group name"
                  value={groupName}
                  onChange={(event) => setGroupName(event.target.value)}
                />
                <button type="button" className={buttonClass}>
                  Add the group item to the table
                </button>
              </div>
              <div className="overflow-hidden rounded border border-slate-200">
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
                  <tbody>
                    <tr>
                      <td
                        className="px-4 py-6 text-center text-sm text-slate-400"
                        colSpan={7}
                      >
                        No group items added.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <button type="button" className={secondaryButtonClass}>
                  Group Management
                </button>
              </div>
            </section>
          </TabsContent>
          <TabsContent value="description" className="rounded-md border border-slate-200 bg-white p-4">
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-600">Table Description</span>
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
          <button
            type="button"
            className={buttonClass}
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button type="button" className={buttonClass} onClick={handleApply}>
            OK
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
