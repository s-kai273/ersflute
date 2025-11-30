import "@xyflow/react/dist/style.css";
import {
  Background,
  BackgroundVariant,
  ReactFlow,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import {
  createEdges,
  createNodes,
} from "@/features/dbdiagram/adapters/reactflow/mapping";
import { modeSettings } from "@/features/dbdiagram/adapters/reactflow/modeSettings";
import { cn } from "@/lib/utils";
import { useViewModeStore } from "@/stores/viewModeStore";
import { tables } from "@/test/testData";
import { DiagramMode } from "@/types/domain/diagramMode";
import { CardinalityEdge } from "../cardinalityEdge";
import { TableNode } from "../tableNode";
import { createClickInTableModeHandler } from "./handlers";

function getSettings(isReadOnly: boolean, diagramMode: DiagramMode | null) {
  if (isReadOnly || !diagramMode) {
    return {
      cursorClass: "cursor-default",
      nodesDraggable: true,
      nodesConnectable: false,
      elementsSelectable: false,
      selectionOnDrag: false,
    };
  }
  return modeSettings[diagramMode];
}

export const Internal = () => {
  const { isReadOnly, diagramMode } = useViewModeStore();
  const [nodes, _, onNodesChange] = useNodesState(createNodes(tables));
  const initialEdges = createEdges(tables);
  const settings = getSettings(isReadOnly, diagramMode);
  const { addNodes, screenToFlowPosition } = useReactFlow();
  const handleClickInTableMode = createClickInTableModeHandler(
    addNodes,
    screenToFlowPosition,
  );

  const handlePaneClick = (event: React.MouseEvent) => {
    if (isReadOnly) {
      return () => {};
    }
    switch (diagramMode) {
      case DiagramMode.Table:
        handleClickInTableMode(event.clientX, event.clientY);
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative flex h-full w-full">
      <ReactFlow
        className={cn("flex-1", settings.cursorClass)}
        style={{ width: "100%", height: "100%" }}
        nodes={nodes}
        edges={initialEdges}
        nodeTypes={{
          table: TableNode,
        }}
        edgeTypes={{
          cardinality: CardinalityEdge,
        }}
        onPaneClick={handlePaneClick}
        onNodesChange={onNodesChange}
        nodesDraggable={settings.nodesDraggable}
        nodesConnectable={settings.nodesConnectable}
        elementsSelectable={settings.elementsSelectable}
        selectionOnDrag={settings.selectionOnDrag}
        fitView
      >
        <Background variant={BackgroundVariant.Lines} gap={16} size={1} />
      </ReactFlow>
    </div>
  );
};
