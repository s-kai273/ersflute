import type { Dispatch, SetStateAction } from "react";
import type { Edge, Node } from "@xyflow/react";
import { updateRelationAndRefs } from "@/domain/diagram/updateRelation";
import { stringifyReference } from "@/domain/parsers/referenceParser";
import { showErrorDialog } from "@/features/errorDialog";
import type { Relationship } from "@/types/domain/relationship";
import type { Table } from "@/types/domain/table";
import { saveCurrentDiagram } from "@/usecases/saveCurrentDiagram";

type TableInfoDialogNode = Node<Table>;
type RelationshipEdge = Edge<Relationship>;

type TableInfoDialogHandlerArgs = {
  tidNode: TableInfoDialogNode;
  updateTable: (table: Table, previousPhysicalName: string) => void;
  setNodes: Dispatch<SetStateAction<TableInfoDialogNode[]>>;
  setEdges: Dispatch<SetStateAction<RelationshipEdge[]>>;
  setTableInfoDialogOpen: (open: boolean) => void;
  clearTidNode: () => void;
  scheduleTidNodeClear: () => void;
};

export function createTableInfoDialogHandlers({
  tidNode,
  updateTable,
  setNodes,
  setEdges,
  setTableInfoDialogOpen,
  clearTidNode,
  scheduleTidNodeClear,
}: TableInfoDialogHandlerArgs) {
  const handleOpenChange = (open: boolean) => {
    setTableInfoDialogOpen(open);
    if (!open) {
      scheduleTidNodeClear();
    }
  };

  const handleApply = (updatedTable: Table) => {
    const previousTableName = tidNode.data.physicalName;
    const currentNodeId = tidNode.id;
    const nextNodeId = stringifyReference({
      tableName: updatedTable.physicalName,
    });

    updateTable(updatedTable, previousTableName);
    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        if (node.id !== currentNodeId) {
          return node;
        }
        return {
          ...node,
          id: nextNodeId,
          width: updatedTable.width,
          height: updatedTable.height,
          data: updatedTable,
        };
      }),
    );

    if (currentNodeId !== nextNodeId) {
      setEdges((currentEdges) =>
        currentEdges.map((edge) => {
          const source =
            edge.source === currentNodeId ? nextNodeId : edge.source;
          const target =
            edge.target === currentNodeId ? nextNodeId : edge.target;
          const nextData = edge.data
            ? updateRelationAndRefs({
                nextTableName: updatedTable.physicalName,
                relationship: edge.data,
                previousTableName: previousTableName,
              })
            : edge.data;

          if (
            source === edge.source &&
            target === edge.target &&
            nextData === edge.data
          ) {
            return edge;
          }

          return {
            ...edge,
            source,
            target,
            data: nextData,
          };
        }),
      );
    }

    setTableInfoDialogOpen(false);
    clearTidNode();
    void saveCurrentDiagram().catch((error: unknown) => {
      showErrorDialog(error, {
        title: "Failed to save diagram",
        message: "The table changes were applied, but the ERM file was not saved.",
      });
    });
  };

  const handleCancel = () => {
    setTableInfoDialogOpen(false);
    clearTidNode();
  };

  return {
    handleOpenChange,
    handleApply,
    handleCancel,
  };
}
