import { Node, NodeProps } from "reaflow";
import { Table } from "../../../types/table";

export const TableNode = (props: NodeProps<Table>) => {
  const data: Table | undefined = props.properties.data;
  if (!data) {
    return null;
  }
  return (
    <Node
      {...props}
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
            <div className="h-5">
              <p className="text-3 text-center">{nodeData.physical_name}</p>
            </div>
            <div className="w-full h-full bg-white"></div>
          </foreignObject>
        );
      }}
    </Node>
  );
};
