import { Node, NodeProps } from "@xyflow/react";
import { Table } from "../../../types/table";
import { CheckCircleIcon, KeyIcon } from "@heroicons/react/16/solid";

export function TableNode({ width, height, data }: NodeProps<Node<Table>>) {
  return (
    <div
      className="flex flex-col min-h-0 rounded-sm"
      style={{
        width,
        height,
        background: `rgb(${data.color.r}, ${data.color.g}, ${data.color.b})`,
      }}
    >
      <div className="flex items-center justify-center h-5 pointer-events-none">
        <p className="text-sm">{data.physicalName}</p>
      </div>
      <div className="nodrag flex-1 w-full px-1 pb-1">
        <div className="w-full h-full bg-white">
          {data.columns?.normalColumn.map((column) => (
            <p className="flex items-center text-[0.625rem] leading-5 whitespace-nowrap">
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
              {column.physicalName && <span>{column.physicalName}</span>}
              {column.columnType && <span>: {column.columnType}</span>}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
