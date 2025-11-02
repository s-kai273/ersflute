import type { ReactFlowInstance } from "@xyflow/react";
import { TableNodeData } from "../../molecules/tableNode/types";

type AddNodes = ReactFlowInstance["addNodes"];
type ScreenToFlowPosition = ReactFlowInstance["screenToFlowPosition"];

export function createClickInTableModeHandler(
  addNodes: AddNodes,
  screenToFlowPosition: ScreenToFlowPosition,
) {
  return (clientX: number, clientY: number) => {
    const defaultTableName = "NEW_TABLE";
    addNodes({
      id: `table.${crypto.randomUUID()}`,
      type: "table",
      position: screenToFlowPosition({
        x: clientX,
        y: clientY,
      }),
      width: 120,
      height: 75,
      data: {
        color: {
          r: 128,
          g: 128,
          b: 192,
        },
        physicalName: defaultTableName,
        logicalName: defaultTableName,
      } satisfies TableNodeData,
    });
  };
}
