import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeftIcon, KeyIcon } from "@heroicons/react/16/solid";
import { Column } from "@/components/molecules/tableNode/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ColumnType,
  ColumnTypeConfigMap,
  parseColumnType,
} from "@/types/columnType";
import { AttributeContentProps } from "./types";

const COLUMN_TYPE_LIST: ColumnType[] = [
  ColumnType.BigInt,
  ColumnType.BigIntN,
  ColumnType.Binary,
  ColumnType.BinaryN,
  ColumnType.Bit1,
  ColumnType.BitN,
  ColumnType.Blob,
  ColumnType.Boolean,
  ColumnType.Char,
  ColumnType.CharN,
  ColumnType.Date,
  ColumnType.Datetime,
  ColumnType.Decimal,
  ColumnType.DecimalP,
  ColumnType.DecimalPS,
  ColumnType.Decimal104,
  ColumnType.Decimal194,
  ColumnType.Double,
  ColumnType.DoubleMD,
  ColumnType.Enum,
  ColumnType.Float,
  ColumnType.FloatMD,
  ColumnType.FloatP,
  ColumnType.Geometry,
  ColumnType.Int,
  ColumnType.IntN,
  ColumnType.Json,
  ColumnType.LongBlob,
  ColumnType.LongText,
  ColumnType.MediumBlob,
  ColumnType.MediumInt,
  ColumnType.MediumIntN,
  ColumnType.MediumText,
  ColumnType.Numeric,
  ColumnType.NumericP,
  ColumnType.NumericPS,
  ColumnType.Real,
  ColumnType.RealMD,
  ColumnType.Set,
  ColumnType.SmallInt,
  ColumnType.SmallIntN,
  ColumnType.Text,
  ColumnType.Time,
  ColumnType.Timestamp,
  ColumnType.TinyBlob,
  ColumnType.TinyInt,
  ColumnType.TinyIntN,
  ColumnType.TinyText,
  ColumnType.VarBinaryN,
  ColumnType.VarCharN,
  ColumnType.Year2,
  ColumnType.Year4,
];

export function AttributeContent({ data, setData }: AttributeContentProps) {
  const [attributeView, setAttributeView] = useState<"list" | "detail">("list");
  const [selectedColumnIndex, setSelectedColumnIndex] = useState<number | null>(
    null,
  );
  const [shouldFocusColumnDetails, setShouldFocusColumnDetails] =
    useState(false);
  const columnPhysicalNameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSelectedColumnIndex(null);
    setAttributeView("list");
  }, [open]);

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
        ? data?.columns?.[selectedColumnIndex]
        : undefined,
    [data, selectedColumnIndex],
  );
  const [columnLength, setColumnLength] = useState<number | undefined>(
    selectedColumn?.length,
  );
  const [columnDecimal, setColumnDecimal] = useState<number | undefined>(
    selectedColumn?.decimal,
  );
  const [columnUnsigned, setColumnUnsigned] = useState<boolean | undefined>(
    selectedColumn?.unsigned,
  );
  const [columnEnumArgs, setColumnEnumArgs] = useState<string | undefined>(
    selectedColumn?.enumArgs,
  );

  const openColumnDetail = (index: number, focus = true) => {
    setSelectedColumnIndex(index);
    setAttributeView("detail");
    if (focus) {
      setShouldFocusColumnDetails(true);
    }
  };

  const handleAddColumn = () => {
    const newColumn: Column = {
      physicalName: "",
      notNull: false,
    };

    const nextColumns = [
      ...(data && data.columns ? data.columns : []),
      newColumn,
    ];
    setData({
      ...data,
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
    setData((current) => {
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

  const handleBackToColumnList = () => {
    setAttributeView("list");
  };

  const updateSelectedColumn = <Key extends keyof Column>(
    key: Key,
    value: Column[Key],
  ) => {
    if (selectedColumnIndex == null) {
      return;
    }

    setData((current) => {
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

  const typeDisplay = (column: Column) => {
    if (!column.columnType) {
      return "";
    }

    const labelWithougArgs =
      ColumnTypeConfigMap[column.columnType].labelWithoutArgs;
    if (column.length != null && column.length >= 0) {
      if (column.decimal != null && column.decimal >= 0) {
        return `${labelWithougArgs}(${column.length}, ${column.decimal})`;
      }
      return `${labelWithougArgs}(${column.length})`;
    }

    if (column.decimal != null && column.decimal >= 0) {
      return `${labelWithougArgs}(${column.decimal})`;
    }

    return ColumnTypeConfigMap[column.columnType].label;
  };

  const columnTypeValue = selectedColumn?.columnType;

  return (
    <>
      <section className="flex-none rounded-md border border-slate-200 bg-white">
        <div className="grid grid-cols-[140px_1fr_140px_1fr] items-center gap-3 border-b border-slate-200 px-4 py-3 text-sm">
          <label
            className="font-medium text-slate-600"
            htmlFor="table-info-physical-name"
          >
            Physical Name
          </label>
          <Input
            id="table-info-physical-name"
            className="h-8 rounded border border-slate-300 px-2 text-sm shadow-inner focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-200"
            type="text"
            value={data.physicalName}
            onChange={(event) =>
              setData({
                ...data,
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
          <Input
            id="table-info-logical-name"
            className="h-8 rounded border border-slate-300 px-2 text-sm shadow-inner focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-200"
            type="text"
            value={data.logicalName ?? ""}
            onChange={(event) =>
              setData({
                ...data,
                logicalName:
                  event.target.value === "" ? undefined : event.target.value,
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
                {data?.columns?.map((column, index) => {
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
                      <td className="px-2 py-2">{column.logicalName ?? ""}</td>
                      <td className="px-2 py-2">{typeDisplay(column)}</td>
                      <td className="px-2 py-2 text-center">
                        <div className="flex justify-center">
                          <Checkbox
                            aria-label={`Column ${column.physicalName} is not null`}
                            checked={column.notNull}
                            tabIndex={-1}
                            aria-readonly="true"
                            className="pointer-events-none data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500"
                          />
                        </div>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <div className="flex justify-center">
                          <Checkbox
                            aria-label={`Column ${column.physicalName} is unique`}
                            checked={column.unique ?? false}
                            tabIndex={-1}
                            aria-readonly="true"
                            className="pointer-events-none data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {data?.columns?.length === 0 && (
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
                size="icon"
                aria-label="Back to Columns"
                onClick={handleBackToColumnList}
              >
                <ArrowLeftIcon className="size-4" />
              </Button>
              <h3
                id="table-info-column-details-heading"
                className="text-base font-semibold text-slate-600"
              >
                Column Details
              </h3>
            </div>
            {selectedColumn && (
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
                <label
                  className="flex items-center gap-2"
                  htmlFor="table-info-column-primary-key"
                >
                  <Checkbox
                    id="table-info-column-primary-key"
                    className="border-slate-300"
                    checked={selectedColumn.primaryKey ?? false}
                    onCheckedChange={(checked) =>
                      updateSelectedColumn("primaryKey", checked === true)
                    }
                  />
                  <span>Primary Key</span>
                </label>
                <label
                  className="flex items-center gap-2"
                  htmlFor="table-info-column-not-null"
                >
                  <Checkbox
                    id="table-info-column-not-null"
                    className="border-slate-300"
                    checked={selectedColumn.notNull}
                    onCheckedChange={(checked) =>
                      updateSelectedColumn("notNull", checked === true)
                    }
                  />
                  <span>Not Null</span>
                </label>
                <label
                  className="flex items-center gap-2"
                  htmlFor="table-info-column-unique"
                >
                  <Checkbox
                    id="table-info-column-unique"
                    className="border-slate-300"
                    checked={selectedColumn.unique ?? false}
                    onCheckedChange={(checked) =>
                      updateSelectedColumn("unique", checked === true)
                    }
                  />
                  <span>Unique</span>
                </label>
                <label
                  className="flex items-center gap-2"
                  htmlFor="table-info-column-auto-increment"
                >
                  <Checkbox
                    id="table-info-column-auto-increment"
                    className="border-slate-300"
                    checked={selectedColumn.autoIncrement ?? false}
                    onCheckedChange={(checked) =>
                      updateSelectedColumn("autoIncrement", checked === true)
                    }
                  />
                  <span>Auto Increment</span>
                </label>
              </div>
            )}
          </div>

          {selectedColumn ? (
            <>
              <div className="mt-4 flex-1 overflow-y-auto pr-1">
                <div className="flex flex-col gap-4">
                  <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <label
                      className="flex flex-col gap-1"
                      htmlFor="table-info-column-physical-name"
                    >
                      <span className="font-medium text-slate-600">
                        Physical Name
                      </span>
                      <Input
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
                      <Input
                        id="table-info-column-logical-name"
                        className="h-8 rounded border border-slate-300 px-2 shadow-inner focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-200"
                        type="text"
                        value={selectedColumn.logicalName ?? ""}
                        onChange={(event) =>
                          updateSelectedColumn(
                            "logicalName",
                            event.target.value === ""
                              ? undefined
                              : event.target.value,
                          )
                        }
                      />
                    </label>
                    <div className="flex flex-wrap items-end gap-3 sm:col-span-2">
                      <label
                        className="flex flex-col gap-1"
                        htmlFor="table-info-column-type"
                      >
                        <span className="font-medium text-slate-600">Type</span>
                        <select
                          id="table-info-column-type"
                          className="h-8 rounded border border-slate-300 px-2 shadow-inner focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-200"
                          value={columnTypeValue}
                          onChange={(event) => {
                            const columnType =
                              event.target.value === ""
                                ? undefined
                                : parseColumnType(event.target.value);
                            const length =
                              columnType &&
                              ColumnTypeConfigMap[columnType].supportsLength
                                ? columnLength
                                : undefined;
                            const decimal =
                              columnType &&
                              ColumnTypeConfigMap[columnType].supportsDecimal
                                ? columnDecimal
                                : undefined;
                            const unsigned =
                              columnType &&
                              ColumnTypeConfigMap[columnType].supportsUnsigned
                                ? columnUnsigned
                                : undefined;
                            const enumArgs =
                              columnType &&
                              ColumnTypeConfigMap[columnType].supportsEnumArgs
                                ? columnEnumArgs
                                : undefined;
                            setColumnLength(length);
                            setColumnDecimal(decimal);
                            setColumnUnsigned(unsigned);
                            setColumnEnumArgs(enumArgs);
                            updateSelectedColumn("columnType", columnType);
                          }}
                        >
                          {COLUMN_TYPE_LIST.map((columnType) => (
                            <option key={columnType} value={columnType}>
                              {ColumnTypeConfigMap[columnType].label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label
                        className="flex flex-col gap-1"
                        htmlFor="table-info-column-length"
                      >
                        <span className="font-medium text-slate-600">
                          Length
                        </span>
                        <Input
                          id="table-info-column-length"
                          className="h-8 rounded border border-slate-300 px-2 shadow-inner focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-200"
                          type="number"
                          value={columnLength ?? ""}
                          disabled={
                            columnTypeValue
                              ? ColumnTypeConfigMap[columnTypeValue]
                                  .supportsLength === false
                              : true
                          }
                          onChange={(event) => {
                            const length =
                              event.target.value === ""
                                ? undefined
                                : Number(event.target.value);
                            setColumnLength(length);
                            updateSelectedColumn("length", length);
                          }}
                        />
                      </label>
                      <label
                        className="flex flex-col gap-1"
                        htmlFor="table-info-column-decimal"
                      >
                        <span className="font-medium text-slate-600">
                          Decimal
                        </span>
                        <Input
                          id="table-info-column-decimal"
                          className="h-8 rounded border border-slate-300 px-2 shadow-inner focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-200"
                          type="number"
                          value={columnDecimal ?? ""}
                          disabled={
                            columnTypeValue
                              ? ColumnTypeConfigMap[columnTypeValue]
                                  .supportsDecimal === false
                              : true
                          }
                          onChange={(event) => {
                            const decimal =
                              event.target.value === ""
                                ? undefined
                                : Number(event.target.value);
                            setColumnDecimal(decimal);
                            updateSelectedColumn("decimal", decimal);
                          }}
                        />
                      </label>
                      <label
                        className="flex items-center gap-2 pb-1"
                        htmlFor="table-info-column-unsigned"
                      >
                        <Checkbox
                          id="table-info-column-unsigned"
                          className="border-slate-300"
                          checked={columnUnsigned ?? false}
                          disabled={
                            columnTypeValue
                              ? ColumnTypeConfigMap[columnTypeValue]
                                  .supportsUnsigned === false
                              : true
                          }
                          onCheckedChange={(checked) => {
                            setColumnUnsigned(checked === true);
                            updateSelectedColumn("unsigned", checked === true);
                          }}
                        />
                        <span className="text-sm font-medium text-slate-600">
                          Unsigned
                        </span>
                      </label>
                    </div>
                    <label
                      className="flex flex-col gap-1 sm:col-span-1"
                      htmlFor="table-info-column-enum-args"
                    >
                      <span className="font-medium text-slate-600">
                        Args of enum/set Type
                      </span>
                      <Input
                        id="table-info-column-enum-args"
                        className="h-8 rounded border border-slate-300 px-2 shadow-inner focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-200"
                        type="text"
                        value={selectedColumn.enumArgs ?? ""}
                        disabled={
                          columnTypeValue
                            ? ColumnTypeConfigMap[columnTypeValue]
                                .supportsEnumArgs === false
                            : true
                        }
                        onChange={(event) =>
                          updateSelectedColumn(
                            "enumArgs",
                            event.target.value === ""
                              ? undefined
                              : event.target.value,
                          )
                        }
                      />
                    </label>
                    <label
                      className="flex flex-col gap-1 sm:col-span-1"
                      htmlFor="table-info-column-default-value"
                    >
                      <span className="font-medium text-slate-600">
                        Default Value
                      </span>
                      <Input
                        id="table-info-column-default-value"
                        className="h-8 rounded border border-slate-300 px-2 shadow-inner focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-200"
                        type="text"
                        value={selectedColumn.defaultValue ?? ""}
                        onChange={(event) =>
                          updateSelectedColumn(
                            "defaultValue",
                            event.target.value === ""
                              ? undefined
                              : event.target.value,
                          )
                        }
                      />
                    </label>
                    <label
                      className="flex flex-col gap-1 sm:col-span-2"
                      htmlFor="table-info-column-description"
                    >
                      <span className="font-medium text-slate-600">
                        Description
                      </span>
                      <textarea
                        id="table-info-column-description"
                        className="min-h-24 rounded border border-slate-300 px-2 py-2 shadow-inner focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-200"
                        value={selectedColumn.description ?? ""}
                        onChange={(event) =>
                          updateSelectedColumn(
                            "description",
                            event.target.value === ""
                              ? undefined
                              : event.target.value,
                          )
                        }
                      />
                    </label>
                  </div>
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
    </>
  );
}
