import { useState } from "react";
import {
  CheckIcon,
  ChevronDownIcon,
  KeyIcon,
  RectangleStackIcon,
} from "@heroicons/react/16/solid";
import { Checkbox } from "@/components/ui/checkbox";
import { formatColumnType } from "@/features/dbDiagram/domain/formatColumnType";
import { cn } from "@/lib/utils";
import type { ColumnGroupItemProps, ColumnItemProps } from "./types";

export function ColumnItem({
  column,
  isSelected,
  isReadOnly,
  onClick,
  onDoubleClick,
}: ColumnItemProps) {
  return (
    <tr
      className={cn(
        "cursor-pointer transition-colors hover:bg-blue-50",
        isSelected && "bg-blue-100/70",
      )}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
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
      <td className="px-2 py-2 font-medium">{column.physicalName}</td>
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
}

export function ColumnGroupItem({
  columnGroup,
  index,
  selectedIndex,
  selectedInGroupIndex,
  isReadOnly,
  onSelect,
}: ColumnGroupItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isGroupSelected =
    index === selectedIndex && selectedInGroupIndex === null;
  return (
    <>
      <tr
        className={cn(
          "cursor-pointer transition-colors hover:bg-blue-50",
          isGroupSelected && "bg-blue-100/70",
        )}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onClick={() => {
          onSelect(index, null);
          setIsOpen((prev) => !prev);
        }}
      >
        <td className="px-2 py-2 text-center">
          <ChevronDownIcon
            className={cn(
              "mx-auto h-4 w-4 text-slate-500 transition-transform",
              !isOpen && "-rotate-90",
            )}
          />
        </td>
        <td className="px-2 py-2 text-center">
          <RectangleStackIcon
            className="mx-auto h-4 w-4 text-slate-500"
            aria-hidden="true"
          />
        </td>
        <td className="px-2 py-2 font-medium">{columnGroup.columnGroupName}</td>
        <td className="px-2 py-2" />
        <td className="px-2 py-2" />
        <td className="px-2 py-2" />
        <td className="px-2 py-2" />
      </tr>
      {isOpen &&
        columnGroup.columns.map((column, colIndex) => (
          <ColumnItem
            key={`${column.physicalName}-${colIndex}`}
            column={column}
            isSelected={
              index === selectedIndex && colIndex === selectedInGroupIndex
            }
            isReadOnly={isReadOnly}
            onClick={() => onSelect(index, colIndex)}
          />
        ))}
    </>
  );
}
