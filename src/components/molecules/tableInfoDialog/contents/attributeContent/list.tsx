import { KeyIcon } from "@heroicons/react/16/solid";
import type {
  Column,
  TableNodeData,
} from "@/components/molecules/tableNode/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ColumnTypeConfigMap } from "@/types/columnType";

type AttributeListProps = {
  data: TableNodeData;
  selectedColumnIndex: number | null;
  onSelectColumn: (index: number) => void;
  onOpenDetail: (index: number) => void;
  onAddColumn: () => void;
  onEditColumn: () => void;
  onDeleteColumn: () => void;
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

export function AttributeList({
  data,
  selectedColumnIndex,
  onSelectColumn,
  onOpenDetail,
  onAddColumn,
  onEditColumn,
  onDeleteColumn,
}: AttributeListProps) {
  return (
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
                  onClick={() => onSelectColumn(index)}
                  onDoubleClick={() => onOpenDetail(index)}
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
                  <td className="px-2 py-2 font-medium">{column.physicalName}</td>
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
        <Button type="button" variant="outline" size="sm" onClick={onAddColumn}>
          Add
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onEditColumn}
          disabled={selectedColumnIndex == null}
        >
          Edit
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onDeleteColumn}
          disabled={selectedColumnIndex == null}
        >
          Delete
        </Button>
      </div>
    </section>
  );
}
