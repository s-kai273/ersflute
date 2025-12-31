import { Button } from "@/components/ui/button";
import { findGroupFromName } from "@/features/dbDiagram/domain/findGroupFromName";
import { useDiagramStore } from "@/stores/diagramStore";
import { useViewModeStore } from "@/stores/viewModeStore";
import { isColumnGroupName } from "@/types/domain/table";
import { ColumnGroupItem, ColumnItem } from "./columnItem";
import { type AttributeListProps } from "./types";

export function AttributeList({
  columns,
  selectedColumnIndex,
  selectedInGroupIndex,
  onSelectColumn,
  onSelectColumnGroup,
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
        <table className="min-w-full table-fixed divide-y divide-slate-200 text-sm">
          <colgroup>
            <col className="w-10" />
            <col className="w-10" />
            <col className="w-40" />
            <col className="w-40" />
            <col className="w-36" />
            <col className="w-24" />
            <col className="w-20" />
          </colgroup>
          <thead className="sticky top-0 z-10 bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
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
              if (isColumnGroupName(column)) {
                const columnGroup = findGroupFromName(column, columnGroups);
                if (!columnGroup) {
                  return null;
                }
                return (
                  <ColumnGroupItem
                    key={`${columnGroup.columnGroupName}-${index}`}
                    index={index}
                    selectedIndex={selectedColumnIndex}
                    selectedInGroupIndex={selectedInGroupIndex}
                    columnGroup={columnGroup}
                    isReadOnly={isReadOnly}
                    onSelect={onSelectColumnGroup}
                  />
                );
              }
              return (
                <ColumnItem
                  key={`${column.physicalName}-${index}`}
                  column={column}
                  isSelected={isSelected}
                  isReadOnly={isReadOnly}
                  onClick={() => onSelectColumn(index)}
                  onDoubleClick={() => onOpenDetail(index)}
                />
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
