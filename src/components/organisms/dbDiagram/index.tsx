import "@xyflow/react/dist/style.css";
import { useState } from "react";
import {
  ArrowPathRoundedSquareIcon,
  ArrowsRightLeftIcon,
  CursorArrowRaysIcon,
  DocumentTextIcon,
  LinkIcon,
  PhotoIcon,
  Square3Stack3DIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import {
  Background,
  BackgroundVariant,
  Edge,
  Node,
  ReactFlow,
  useNodesState,
} from "@xyflow/react";
import { Table } from "../../../types/table";
import { TableNode } from "../../molecules/tableNode";
import { CardinalityEdge } from "../../molecules/cardinalityEdge";
import { CardinalityEdgeData } from "../../molecules/cardinalityEdge/types";
import { tables } from "./testData";
import { Column, TableNodeData } from "../../molecules/tableNode/types";

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

const initialNodes = createNodes(tables);
const initialEdges = createEdges(tables);

const diagramTools = [
  {
    id: "select",
    label: "Select",
    icon: CursorArrowRaysIcon,
    description: "Select and move existing elements.",
  },
  {
    id: "table",
    label: "Table",
    icon: TableCellsIcon,
    description: "Create a new table by clicking on the canvas.",
  },
  {
    id: "oneToManyRelationship",
    label: "1:n Relationship",
    icon: ArrowsRightLeftIcon,
    description: "Draw a one-to-many relationship between two tables.",
  },
  {
    id: "selfRelationship",
    label: "Self Relationship",
    icon: ArrowPathRoundedSquareIcon,
    description: "Connect a table to itself.",
  },
  {
    id: "note",
    label: "Note",
    icon: DocumentTextIcon,
    description: "Add a note to the canvas.",
  },
  {
    id: "noteConnection",
    label: "Note Connection",
    icon: LinkIcon,
    description: "Link an existing note to a table.",
  },
  {
    id: "tableGroup",
    label: "Table Group",
    icon: Square3Stack3DIcon,
    description: "Group tables together for layout control.",
  },
  {
    id: "imageOnDiagram",
    label: "Image on Diagram",
    icon: PhotoIcon,
    description: "Place a reference image on the canvas.",
  },
] as const;

type DiagramMode = (typeof diagramTools)[number]["id"];

type ModeSettings = {
  cursorClass: string;
  nodesDraggable: boolean;
  nodesConnectable: boolean;
  elementsSelectable: boolean;
  selectionOnDrag: boolean;
};

const selectSettings: ModeSettings = {
  cursorClass: "cursor-default",
  nodesDraggable: true,
  nodesConnectable: true,
  elementsSelectable: true,
  selectionOnDrag: true,
};

const creationSettings: ModeSettings = {
  cursorClass: "cursor-crosshair",
  nodesDraggable: false,
  nodesConnectable: false,
  elementsSelectable: false,
  selectionOnDrag: false,
};

const connectionSettings: ModeSettings = {
  cursorClass: "cursor-crosshair",
  nodesDraggable: false,
  nodesConnectable: true,
  elementsSelectable: true,
  selectionOnDrag: false,
};

const modeSettings: Record<DiagramMode, ModeSettings> = {
  select: { ...selectSettings },
  table: { ...creationSettings },
  oneToManyRelationship: { ...connectionSettings },
  selfRelationship: { ...connectionSettings },
  note: { ...creationSettings },
  noteConnection: { ...connectionSettings },
  tableGroup: { ...creationSettings },
  imageOnDiagram: { ...creationSettings },
};

export const DbDiagram = () => {
  const [nodes, _, onNodesChange] = useNodesState(initialNodes);
  const [activeMode, setActiveMode] = useState<DiagramMode>("select");
  const activeTool = diagramTools.find((tool) => tool.id === activeMode)!;
  const activeModeSettings = modeSettings[activeMode];

  return (
    <div className="flex h-screen w-screen bg-slate-100">
      <aside className="flex w-44 flex-col border-r border-slate-200 bg-white/95 py-3 shadow-sm backdrop-blur">
        <header className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Tools
        </header>
        <nav className="flex-1 space-y-0.5 px-2">
          {diagramTools.map((tool) => {
            const Icon = tool.icon;
            const isActive = tool.id === activeMode;
            return (
              <button
                key={tool.id}
                type="button"
                className={clsx(
                  "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition",
                  isActive
                    ? "bg-slate-200 text-slate-900 shadow-inner"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
                onClick={() => setActiveMode(tool.id)}
                aria-pressed={isActive}
                title={tool.description}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden />
                <span className="font-medium">{tool.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
      <div className="relative flex flex-1">
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
          onNodesChange={onNodesChange}
          nodesDraggable={activeModeSettings.nodesDraggable}
          nodesConnectable={activeModeSettings.nodesConnectable}
          elementsSelectable={activeModeSettings.elementsSelectable}
          selectionOnDrag={activeModeSettings.selectionOnDrag}
          fitView
        >
          <Background variant={BackgroundVariant.Lines} gap={16} size={1} />
        </ReactFlow>
        <div className="pointer-events-none absolute bottom-4 left-4 rounded-md bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
          Mode: {activeTool.label}
          <span className="ml-1 text-[11px] text-slate-500">
            {activeTool.description}
          </span>
        </div>
      </div>
    </div>
  );
};
