import type {
  DiagramResponse,
  XmlNodeIdentity,
} from "@/types/api/diagram";
import type { ColumnGroup } from "@/types/domain/columnGroup";
import type { Relationship } from "@/types/domain/relationship";
import {
  isColumnGroupName,
  type Table,
} from "@/types/domain/table";
import type { VirtualDiagram } from "@/types/domain/vdiagram";
import { stringifyReference } from "@/domain/parsers/referenceParser";

type DiagramObjects = {
  tables: Table[];
  relationships: Relationship[];
  columnGroups: ColumnGroup[];
  vdiagrams: VirtualDiagram[];
};

function findIdentity(
  identities: XmlNodeIdentity[],
  tag: string,
  parentId: string | undefined,
  index: number,
) {
  return identities.find(
    (identity) =>
      identity.tag === tag &&
      identity.parentId === parentId &&
      identity.index === index,
  )?.id;
}

export function applyXmlNodeIdentities(
  diagram: DiagramResponse,
  objects: DiagramObjects,
) {
  const identities = diagram.xmlNodeIds ?? [];
  const tableResponses = diagram.diagramWalkers?.tables ?? [];

  objects.tables.forEach((table, tableIndex) => {
    table.xmlNodeId = findIdentity(identities, "table", undefined, tableIndex);
    let columnIndex = 0;
    table.columns?.forEach((column) => {
      if (isColumnGroupName(column)) {
        return;
      }
      column.xmlNodeId = findIdentity(
        identities,
        "normal_column",
        table.xmlNodeId,
        columnIndex,
      );
      columnIndex += 1;
    });
    table.indexes?.forEach((index, indexPosition) => {
      index.xmlNodeId = findIdentity(
        identities,
        "index",
        table.xmlNodeId,
        indexPosition,
      );
    });
    table.compoundUniqueKeys?.forEach((key, keyIndex) => {
      key.xmlNodeId = findIdentity(
        identities,
        "compound_unique_key",
        table.xmlNodeId,
        keyIndex,
      );
    });

    tableResponses[tableIndex]?.connections.relationships?.forEach(
      (response, relationshipIndex) => {
        const relationship = objects.relationships.find(
          (candidate) => candidate.name === response.name,
        );
        if (relationship) {
          relationship.xmlNodeId = findIdentity(
            identities,
            "relationship",
            table.xmlNodeId,
            relationshipIndex,
          );
        }
      },
    );
  });

  objects.columnGroups.forEach((group, groupIndex) => {
    group.xmlNodeId = findIdentity(
      identities,
      "column_group",
      undefined,
      groupIndex,
    );
    group.columns.forEach((column, columnIndex) => {
      column.xmlNodeId = findIdentity(
        identities,
        "normal_column",
        group.xmlNodeId,
        columnIndex,
      );
    });
  });

  objects.vdiagrams.forEach((vdiagram, vdiagramIndex) => {
    vdiagram.xmlNodeId = findIdentity(
      identities,
      "vdiagram",
      undefined,
      vdiagramIndex,
    );
    vdiagram.vtables.forEach((vtable, vtableIndex) => {
      vtable.xmlNodeId = findIdentity(
        identities,
        "vtable",
        vdiagram.xmlNodeId,
        vtableIndex,
      );
    });
  });
}

export function collectXmlNodeIdentities({
  tables,
  relationships,
  columnGroups,
  vdiagrams,
}: DiagramObjects): XmlNodeIdentity[] {
  const identities: XmlNodeIdentity[] = [];
  const add = (
    id: string | undefined,
    tag: string,
    parentId: string | undefined,
    index: number,
  ) => {
    if (id) {
      identities.push({ id, tag, parentId, index });
    }
  };

  tables.forEach((table, tableIndex) => {
    add(table.xmlNodeId, "table", undefined, tableIndex);
    let columnIndex = 0;
    table.columns?.forEach((column) => {
      if (isColumnGroupName(column)) {
        return;
      }
      add(
        column.xmlNodeId,
        "normal_column",
        table.xmlNodeId,
        columnIndex,
      );
      columnIndex += 1;
    });
    table.indexes?.forEach((index, indexPosition) => {
      add(index.xmlNodeId, "index", table.xmlNodeId, indexPosition);
    });
    table.compoundUniqueKeys?.forEach((key, keyIndex) => {
      add(
        key.xmlNodeId,
        "compound_unique_key",
        table.xmlNodeId,
        keyIndex,
      );
    });
    const tableReference = stringifyReference({
      tableName: table.physicalName,
    });
    relationships
      .filter((relationship) => relationship.target === tableReference)
      .forEach((relationship, relationshipIndex) => {
        add(
          relationship.xmlNodeId,
          "relationship",
          table.xmlNodeId,
          relationshipIndex,
        );
      });
  });

  columnGroups.forEach((group, groupIndex) => {
    add(group.xmlNodeId, "column_group", undefined, groupIndex);
    group.columns.forEach((column, columnIndex) => {
      add(
        column.xmlNodeId,
        "normal_column",
        group.xmlNodeId,
        columnIndex,
      );
    });
  });

  vdiagrams.forEach((vdiagram, vdiagramIndex) => {
    add(vdiagram.xmlNodeId, "vdiagram", undefined, vdiagramIndex);
    vdiagram.vtables.forEach((vtable, vtableIndex) => {
      add(vtable.xmlNodeId, "vtable", vdiagram.xmlNodeId, vtableIndex);
    });
  });

  return identities;
}
