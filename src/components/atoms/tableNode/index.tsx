import { DragEvent, Node, Position } from "reaflow";
import { Table } from "../../../types/table";
import { useRef, useState } from "react";
import { TableNodeProps } from "./types";

export function TableNode({
  x,
  y,
  onDragEnd,
  properties,
  ...props
}: TableNodeProps) {
  const [pos, setPos] = useState<Position>([x, y]);
  const dragStartPosRef = useRef<Position>(pos);
  const data: Table | undefined = properties.data;
  const handleDragStart = () => {
    dragStartPosRef.current = pos;
  };
  const handleDrag = (event: DragEvent) => {
    const startPos = dragStartPosRef.current;
    setPos([startPos[0] + event.movement[0], startPos[1] + event.movement[1]]);
  };
  if (!data) {
    return null;
  }
  return (
    <Node
      {...props}
      x={pos[0]}
      y={pos[1]}
      properties={properties}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      style={{
        fill: `rgb(${data.color.r}, ${data.color.g}, ${data.color.b})`,
        stroke: "#333",
        strokeWidth: 2,
      }}
    >
      {(nodeProps) => {
        const nodeData: Table = nodeProps.node.data;
        return (
          <foreignObject width={nodeProps.width} height={nodeProps.height}>
            <div className="h-5 pointer-events-none">
              <p className="text-3 text-center">{nodeData.physical_name}</p>
            </div>
            <div className="w-full h-full bg-white"></div>
          </foreignObject>
        );
      }}
    </Node>
  );
}
