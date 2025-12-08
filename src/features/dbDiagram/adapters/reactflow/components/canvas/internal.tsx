import "@xyflow/react/dist/style.css";
import { useEffect } from "react";
import {
  Background,
  BackgroundVariant,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import {
  createEdges,
  createNodes,
} from "@/features/dbDiagram/adapters/reactflow/mapping";
import { modeSettings } from "@/features/dbDiagram/adapters/reactflow/modeSettings";
import { cn } from "@/lib/utils";
import { useDiagramStore } from "@/stores/diagramStore";
import { useViewModeStore } from "@/stores/viewModeStore";
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
  const tables = useDiagramStore((state) => state.tables);
  const relationships = useDiagramStore((state) => state.relationships);
  const [nodes, setNodes, onNodesChange] = useNodesState(createNodes(tables));
  const [edges, setEdges] = useEdgesState(createEdges(relationships));
  const settings = getSettings(isReadOnly, diagramMode);
  const { addNodes, screenToFlowPosition } = useReactFlow();
  useEffect(() => {
    setNodes(createNodes(tables));
    setEdges(createEdges(relationships));
  }, [tables, relationships]);
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
        edges={edges}
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
