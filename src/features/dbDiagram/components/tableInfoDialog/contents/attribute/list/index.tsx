import { CheckIcon, KeyIcon } from "@heroicons/react/16/solid";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatColumnType } from "@/features/dbDiagram/domain/formatColumnType";
import { getColumnsFromGroupName } from "@/features/dbDiagram/domain/getColumnsFromGroupName";
import { cn } from "@/lib/utils";
import { useDiagramStore } from "@/stores/diagramStore";
import { useViewModeStore } from "@/stores/viewModeStore";
import type { Column } from "@/types/domain/column";
import type { ColumnGroup } from "@/types/domain/columnGroup";
import { isColumnGroupName, type ColumnGroupName } from "@/types/domain/table";
import { type AttributeListProps } from "./types";

function flatColumnsFrom(
  columns: (Column | ColumnGroupName)[],
  columnGroups: ColumnGroup[],
): Column[] {
  return columns.flatMap((column) => {
    if (isColumnGroupName(column)) {
      return getColumnsFromGroupName(column, columnGroups);
    }
    return [column];
  });
}

export function AttributeList({
  columns,
  selectedColumnIndex,
  onSelectColumn,
  onOpenDetail,
  onAddColumn,
  onEditColumn,
  onDeleteColumn,
}: AttributeListProps) {
  const { isReadOnly } = useViewModeStore();
  const columnGroups = useDiagramStore((state) => state.columnGroups);
  return (
    <section className="h-95 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm">
      <div className="h-78 overflow-y-auto rounded border border-slate-200">
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
            {flatColumnsFrom(columns, columnGroups).map((column, index) => {
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
                    {!!column.referredColumn && (
                      <KeyIcon
                        aria-label="Foreign key"
                        className="mx-auto h-4 w-4 text-gray-400"
                      />
                    )}
                  </td>
                  <td className="px-2 py-2 font-medium">
                    {column.physicalName}
                  </td>
                  <td className="px-2 py-2">{column.logicalName ?? ""}</td>
                  <td className="px-2 py-2">{formatColumnType(column)}</td>
                  <td className="px-2 py-2 text-center">
                    <div className="flex justify-center">
                      {isReadOnly ? (
                        column.notNull && (
                          <CheckIcon
                            aria-label={`Column ${column.physicalName} is not null`}
                            className="h-4 w-4 text-blue-500"
                          />
                        )
                      ) : (
                        <Checkbox
                          aria-label={`Column ${column.physicalName} is not null`}
                          checked={column.notNull}
                          tabIndex={-1}
                          className="data-[state=checked]:border-blue-500"
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-2 text-center">
                    <div className="flex justify-center">
                      {isReadOnly ? (
                        column.unique && (
                          <CheckIcon
                            aria-label={`Column ${column.physicalName} is unique`}
                            className="h-4 w-4 text-blue-500"
                          />
                        )
                      ) : (
                        <Checkbox
                          aria-label={`Column ${column.physicalName} is unique`}
                          checked={column.unique ?? false}
                          tabIndex={-1}
                          className="data-[state=checked]:border-blue-500"
                        />
                      )}
                    </div>
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
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isReadOnly}
          onClick={onAddColumn}
        >
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
          disabled={isReadOnly || selectedColumnIndex == null}
        >
          Delete
        </Button>
      </div>
    </section>
  );
}
