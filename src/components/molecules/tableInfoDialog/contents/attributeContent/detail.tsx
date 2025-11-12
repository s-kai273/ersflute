import { useMemo, type RefObject } from "react";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";
import type { Column } from "@/components/molecules/tableNode/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  ColumnType,
  ColumnTypeConfigMap,
  parseColumnType,
} from "@/types/columnType";

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

type UpdateSelectedColumn = <Key extends keyof Column>(
  key: Key,
  value: Column[Key],
) => void;

type AttributeDetailProps = {
  selectedColumn?: Column;
  columnTypeValue?: ColumnType;
  columnLength?: number;
  columnDecimal?: number;
  columnUnsigned?: boolean;
  columnEnumArgs?: string;
  setColumnLength: (value: number | undefined) => void;
  setColumnDecimal: (value: number | undefined) => void;
  setColumnUnsigned: (value: boolean | undefined) => void;
  setColumnEnumArgs: (value: string | undefined) => void;
  onBack: () => void;
  updateSelectedColumn: UpdateSelectedColumn;
  columnPhysicalNameInputRef: RefObject<HTMLInputElement | null>;
};

export function AttributeDetail({
  selectedColumn,
  columnTypeValue,
  columnLength,
  columnDecimal,
  columnUnsigned,
  columnEnumArgs,
  setColumnLength,
  setColumnDecimal,
  setColumnUnsigned,
  setColumnEnumArgs,
  onBack,
  updateSelectedColumn,
  columnPhysicalNameInputRef,
}: AttributeDetailProps) {
  const typeSupportsLength = useMemo(
    () =>
      columnTypeValue
        ? ColumnTypeConfigMap[columnTypeValue].supportsLength !== false
        : false,
    [columnTypeValue],
  );
  const typeSupportsDecimal = useMemo(
    () =>
      columnTypeValue
        ? ColumnTypeConfigMap[columnTypeValue].supportsDecimal !== false
        : false,
    [columnTypeValue],
  );
  const typeSupportsUnsigned = useMemo(
    () =>
      columnTypeValue
        ? ColumnTypeConfigMap[columnTypeValue].supportsUnsigned !== false
        : false,
    [columnTypeValue],
  );
  const typeSupportsEnumArgs = useMemo(
    () =>
      columnTypeValue
        ? ColumnTypeConfigMap[columnTypeValue].supportsEnumArgs !== false
        : false,
    [columnTypeValue],
  );

  return (
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
            onClick={onBack}
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
                    updateSelectedColumn("physicalName", event.target.value)
                  }
                />
              </label>
              <label
                className="flex flex-col gap-1"
                htmlFor="table-info-column-logical-name"
              >
                <span className="font-medium text-slate-600">Logical Name</span>
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
                      updateSelectedColumn("length", length);
                      updateSelectedColumn("decimal", decimal);
                      updateSelectedColumn("unsigned", unsigned);
                      updateSelectedColumn("enumArgs", enumArgs);
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
                  <span className="font-medium text-slate-600">Length</span>
                  <Input
                    id="table-info-column-length"
                    className="h-8 rounded border border-slate-300 px-2 shadow-inner focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-200"
                    type="number"
                    value={columnLength ?? ""}
                    disabled={!typeSupportsLength}
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
                  <span className="font-medium text-slate-600">Decimal</span>
                  <Input
                    id="table-info-column-decimal"
                    className="h-8 rounded border border-slate-300 px-2 shadow-inner focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-200"
                    type="number"
                    value={columnDecimal ?? ""}
                    disabled={!typeSupportsDecimal}
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
                    disabled={!typeSupportsUnsigned}
                    onCheckedChange={(checked) => {
                      const isChecked = checked === true;
                      setColumnUnsigned(isChecked);
                      updateSelectedColumn("unsigned", isChecked);
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
                  disabled={!typeSupportsEnumArgs}
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
                <span className="font-medium text-slate-600">Description</span>
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
      ) : (
        <p className="mt-4 text-sm text-slate-500">
          Select a column to edit its details.
        </p>
      )}
    </section>
  );
}
