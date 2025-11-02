import "@xyflow/react/dist/style.css";
import { clsx } from "clsx";
import {
  Background,
  BackgroundVariant,
  Edge,
  Node,
  ReactFlow,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import { TableNode } from "../../molecules/tableNode";
import { CardinalityEdge } from "../../molecules/cardinalityEdge";
import { tables } from "./testData";
import { DbDiagramProps } from "./types";
import { modeSettings } from "./modeSettings";
import { DiagramMode } from "../../../types/diagramMode";
import { createClickInTableModeHandler } from "./handlers";
import { Table } from "../../../types/table";
import { Column, TableNodeData } from "../../molecules/tableNode/types";
import { CardinalityEdgeData } from "../../molecules/cardinalityEdge/types";

function createNodes(tables: Table[]): Node[] {
  return tables.map((table) => {
    return {
      id: `table.${table.physicalName}`,
      type: "table",
      position: {
        x: table.x,
        y: table.y,
      },
      width: table.width,
      height: table.height,
      data: {
        color: {
          r: table.color.r,
          g: table.color.g,
          b: table.color.b,
        },
        physicalName: table.physicalName,
        columns: table.columns?.normalColumn.map((column) => {
          return {
            physicalName: column.physicalName,
            logicalName: column.logicalName,
            columnType: column.columnType,
            length: column.length,
            notNull: column.notNull,
            primaryKey: column.primaryKey,
            referredColumn: column.referredColumn,
          } satisfies Column;
        }),
      } satisfies TableNodeData,
    } satisfies Node;
  });
}

function createEdges(tables: Table[]): Edge[] {
  return tables
    .filter((table) => !!table.connections && !!table.connections!.relationship)
    .flatMap((table) => table.connections!.relationship!)
    .map((relationship) => {
      const source = relationship.source;
      const target = relationship.target;
      return {
        id: relationship.name,
        type: "cardinality",
        source,
        target,
        data: {
          parentCardinality: relationship.parentCardinality,
          childCardinality: relationship.childCardinality,
        },
      } as Edge<CardinalityEdgeData>;
    });
}

export const DbDiagram = ({ activeMode }: DbDiagramProps) => {
  const [nodes, _, onNodesChange] = useNodesState(createNodes(tables));
  const initialEdges = createEdges(tables);
  const activeModeSettings = modeSettings[activeMode];
  const { addNodes, screenToFlowPosition } = useReactFlow();
  const handleClickInTableMode = createClickInTableModeHandler(
    addNodes,
    screenToFlowPosition
  );

  const handlePaneClick = (event: React.MouseEvent) => {
    switch (activeMode) {
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
        className={clsx("flex-1", activeModeSettings.cursorClass)}
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
        nodesDraggable={activeModeSettings.nodesDraggable}
        nodesConnectable={activeModeSettings.nodesConnectable}
        elementsSelectable={activeModeSettings.elementsSelectable}
        selectionOnDrag={activeModeSettings.selectionOnDrag}
        fitView
      >
        <Background variant={BackgroundVariant.Lines} gap={16} size={1} />
      </ReactFlow>
    </div>
  );
};
