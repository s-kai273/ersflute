import { CheckCircleIcon, KeyIcon } from "@heroicons/react/16/solid";
import { formatColumnType } from "@/features/dbDiagram/services/formatColumnType";
import { cn } from "@/lib/utils";
import { useViewModeStore } from "@/stores/viewModeStore";
import type { TableCardProps } from "./types";

export function TableCard({
  width,
  height,
  data,
  onHeaderDoubleClick,
}: TableCardProps) {
  const { isReadOnly } = useViewModeStore();
  return (
    <div
      className={cn(
        "flex flex-col min-h-0 rounded-sm",
        isReadOnly && "nopan nodrag cursor-default",
      )}
      style={{
        width,
        height,
        background: `rgb(${data.color.r}, ${data.color.g}, ${data.color.b})`,
      }}
    >
      <div
        onDoubleClick={onHeaderDoubleClick}
        className="flex items-center justify-center h-5 cursor-pointer"
      >
        <h1 className="text-sm">{data.physicalName}</h1>
      </div>
      <div className="nodrag flex-1 w-full px-1 pb-1">
        <div className="w-full h-full bg-white">
          {data.columns?.map((column) => (
            <p
              key={column.physicalName}
              className="flex items-center text-[0.625rem] leading-5 whitespace-nowrap"
            >
              <span className="flex items-center justify-center w-4 h-4">
                {column.primaryKey && (
                  <KeyIcon width={10} height={10} className="text-yellow-500" />
                )}
              </span>
              <span className="flex items-center justify-center w-4 h-4">
                {column.notNull && (
                  <CheckCircleIcon
                    width={10}
                    height={10}
                    className="text-green-400"
                  />
                )}
              </span>
              <span>
                {column.physicalName && <span>{column.physicalName}</span>}
                {column.columnType && <span>: {formatColumnType(column)}</span>}
              </span>
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
