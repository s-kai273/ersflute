import { Node, NodeProps } from "reaflow";
import { Table } from "../../../types/table";

export const TableNode = (props: NodeProps) => {
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
        rx: 12, // 角丸
      }}
    >
      {(nodeProps) => (
        <foreignObject width={nodeProps.width} height={nodeProps.height}>
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
            }}
          >
            {nodeProps.node.text}
          </div>
        </foreignObject>
      )}
    </Node>
  );
};
