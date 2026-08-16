import { parseReference, stringifyReference } from "@/domain/parsers/referenceParser";
import type { NormalColumn, TableResponse } from "@/types/api/diagramWalkers";
import type {
  Column,
  ColumnTypeAttributes,
} from "@/types/domain/column";
import { parseColumnType } from "@/types/domain/columnType";
import type { Relationship } from "@/types/domain/relationship";
import type {
  CompoundUniqueKey,
  Index,
  IndexColumn,
  Table,
} from "@/types/domain/table";

function getReferredColumn(
  item: NormalColumn,
  tableResponses: TableResponse[],
): NormalColumn | undefined {
  if (item.referredColumn) {
    const { tableName, columnName } = parseReference(item.referredColumn);
    if (!tableName || !columnName) {
      return undefined;
    }
    const table = tableResponses.find(
      (table) => tableName === table.physicalName,
    );
    if (!table) {
      return undefined;
    }
    const items = table.columns.items;
    if (!items) {
      return undefined;
    }
    return items
      .filter((clm) => typeof clm !== "string")
      .find((clm) => columnName === clm.physicalName);
  }
  return undefined;
}

function getInheritedTypeAttributes(
  referredColumn: NormalColumn | undefined,
): ColumnTypeAttributes | undefined {
  const inheritedTypeAttributes = {
    columnType: referredColumn?.columnType
      ? parseColumnType(referredColumn.columnType)
      : undefined,
    length: referredColumn?.length,
    decimal: referredColumn?.decimal,
    enumArgs: referredColumn?.args,
    unsigned: referredColumn?.unsigned,
  } satisfies ColumnTypeAttributes;

  return Object.values(inheritedTypeAttributes).some(
    (value) => value !== undefined,
  )
    ? inheritedTypeAttributes
    : undefined;
}

export function mapTablesFromApi(tableResponses: TableResponse[]): Table[] {
  if (!tableResponses) {
    return [];
  }
  return tableResponses.map((table) => {
    return {
      identityKey: table.identityKey,
      color: {
        r: table.color.r,
        g: table.color.g,
        b: table.color.b,
      },
      x: table.x,
      y: table.y,
      width: table.width,
      height: table.height,
      fontName: table.fontName ?? "Ubuntu",
      fontSize: table.fontSize ?? 9,
      physicalName: table.physicalName,
      logicalName: table.logicalName,
      description: table.description,
      tableConstraint: table.tableConstraint,
      primaryKeyName: table.primaryKeyName,
      option: table.option,
      columns: table.columns.items?.map((item) => {
        if (typeof item === "string") {
          return item;
        }
        const referredColumn = getReferredColumn(item, tableResponses);
        const inheritedTypeAttributes =
          getInheritedTypeAttributes(referredColumn);
        return {
          identityKey: item.identityKey,
          physicalName: item.physicalName,
          logicalName: item.logicalName,
          description: item.description,
          columnType: item.columnType
            ? parseColumnType(item.columnType)
            : undefined,
          length: item.length,
          decimal: item.decimal,
          enumArgs: item.args,
          unsigned: item.unsigned,
          inheritedTypeAttributes,
          notNull: item.notNull,
          unique: item.uniqueKey,
          defaultValue: item.defaultValue,
          primaryKey: item.primaryKey,
          autoIncrement: item.autoIncrement,
          referredColumn: item.referredColumn,
          relationship: item.relationship,
        } satisfies Column;
      }),
      indexes: table.indexes?.map((index) => {
        return {
          identityKey: index.identityKey,
          name: index.name,
          indexType: index.indexType,
          description: index.description,
          fullText: index.fullText,
          nonUnique: index.nonUnique,
          columns: index.columns.map((column) => {
            return {
              columnId: column.columnId,
              desc: column.desc,
            } satisfies IndexColumn;
          }),
        } satisfies Index;
      }),
      compoundUniqueKeys: table.compoundUniqueKeyList.compoundUniqueKeys?.map(
        (uniqueKey) => {
          return {
            identityKey: uniqueKey.identityKey,
            name: uniqueKey.name,
            columns: uniqueKey.columns.map((column) => column.columnId),
          } satisfies CompoundUniqueKey;
        },
      ),
    } satisfies Table;
  });
}

function getPrimaryKey(source: string, tables: TableResponse[]): string {
  const { tableName } = parseReference(source);
  const sourceTable = tables.find((table) => table.physicalName === tableName)!;
  return sourceTable.columns
    .items!.filter((item) => typeof item !== "string")
    .find((item) => item.primaryKey)!.physicalName;
}

function getReferredColumnOptions(
  source: string,
  tables: TableResponse[],
): string[] {
  const { tableName } = parseReference(source);
  const sourceTable = tables.find((table) => table.physicalName === tableName)!;
  const columnNames =
    sourceTable.columns.items
      ?.filter((item) => typeof item !== "string")
      .filter((item) => item.primaryKey || item.uniqueKey)
      .map((item) => item.physicalName) ?? [];
  const coumpoundUniqueKeyNames =
    sourceTable.compoundUniqueKeyList.compoundUniqueKeys?.map(
      (uniqueKey) => uniqueKey.name,
    ) ?? [];
  return [...columnNames, ...coumpoundUniqueKeyNames];
}

export function mapRelationshipsFromApi(
  tableResponses: TableResponse[],
): Relationship[] {
  return tableResponses
    .filter((table) => !!table.connections.relationships)
    .flatMap((table) => table.connections.relationships)
    .map((relationship) => {
      return {
        identityKey: relationship.identityKey,
        name: relationship.name,
        source: relationship.source,
        target: relationship.target,
        bendpoints: relationship.bendpoints,
        fkColumnNames: relationship.fkColumns.fkColumn.map(
          (column) => column.fkColumnName,
        ),
        parentCardinality: relationship.parentCardinality,
        childCardinality: relationship.childCardinality,
        referredColumn: relationship.referenceForPk
          ? getPrimaryKey(relationship.source, tableResponses)
          : (relationship.referredSimpleUniqueColumn ??
            relationship.referredCompoundUniqueKey!),
        referredColumnOptions: getReferredColumnOptions(
          relationship.source,
          tableResponses,
        ),
        onDeleteAction: relationship.onDeleteAction,
        onUpdateAction: relationship.onUpdateAction,
      } satisfies Relationship;
    });
}

function mapTableColumnToApi(column: Column): NormalColumn {
  return {
    identityKey: column.identityKey,
    physicalName: column.physicalName,
    logicalName: column.logicalName,
    description: column.description,
    columnType: column.columnType,
    length: column.length,
    decimal: column.decimal,
    args: column.enumArgs,
    unsigned: column.unsigned,
    notNull: column.notNull,
    uniqueKey: column.unique,
    defaultValue: column.defaultValue,
    primaryKey: column.primaryKey,
    autoIncrement: column.autoIncrement,
    referredColumn: column.referredColumn,
    relationship: column.relationship,
  };
}

function isReferenceForPrimaryKey(
  relationship: Relationship,
  tables: Table[],
): boolean {
  const { tableName } = parseReference(relationship.source);
  const sourceTable = tables.find((table) => table.physicalName === tableName);
  const primaryKey = sourceTable?.columns
    ?.filter((column) => typeof column !== "string")
    .find((column) => column.primaryKey);
  return primaryKey?.physicalName === relationship.referredColumn;
}

function isReferredCompoundUniqueKey(
  relationship: Relationship,
  tables: Table[],
): boolean {
  const { tableName } = parseReference(relationship.source);
  const sourceTable = tables.find((table) => table.physicalName === tableName);
  return (
    sourceTable?.compoundUniqueKeys?.some(
      (key) => key.name === relationship.referredColumn,
    ) ?? false
  );
}

function mapRelationshipToApi(
  relationship: Relationship,
  tables: Table[],
) {
  const referenceForPk = isReferenceForPrimaryKey(relationship, tables);
  const referredCompoundUniqueColumn =
    !referenceForPk && isReferredCompoundUniqueKey(relationship, tables)
      ? relationship.referredColumn
      : undefined;
  const referredSimpleUniqueColumn =
    !referenceForPk && !referredCompoundUniqueColumn
      ? relationship.referredColumn
      : undefined;

  return {
    identityKey: relationship.identityKey,
    name: relationship.name,
    source: relationship.source,
    target: relationship.target,
    bendpoints: relationship.bendpoints,
    fkColumns: {
      fkColumn: relationship.fkColumnNames.map((fkColumnName) => ({
        fkColumnName,
      })),
    },
    parentCardinality: relationship.parentCardinality,
    childCardinality: relationship.childCardinality,
    referenceForPk,
    onDeleteAction: relationship.onDeleteAction,
    onUpdateAction: relationship.onUpdateAction,
    referredSimpleUniqueColumn,
    referredCompoundUniqueKey: referredCompoundUniqueColumn,
  };
}

export function mapTablesToApi(
  tables: Table[],
  relationships: Relationship[],
): TableResponse[] {
  return tables.map((table) => {
    const tableId = stringifyReference({ tableName: table.physicalName });
    return {
      identityKey: table.identityKey,
      physicalName: table.physicalName,
      logicalName: table.logicalName,
      description: table.description,
      height: table.height,
      width: table.width,
      fontName: table.fontName ?? "Ubuntu",
      fontSize: table.fontSize ?? 9,
      x: table.x,
      y: table.y,
      color: table.color,
      connections: {
        relationships: relationships
          .filter((relationship) => relationship.target === tableId)
          .map((relationship) => mapRelationshipToApi(relationship, tables)),
      },
      tableConstraint: table.tableConstraint,
      primaryKeyName: table.primaryKeyName,
      option: table.option,
      columns: {
        items: table.columns?.map((column) => {
          if (typeof column === "string") {
            return column;
          }
          return mapTableColumnToApi(column);
        }),
      },
      indexes: table.indexes?.map((index) => ({
        identityKey: index.identityKey,
        name: index.name,
        indexType: index.indexType,
        description: index.description,
        fullText: index.fullText,
        nonUnique: index.nonUnique,
        columns: index.columns.map((column) => ({
          columnId: column.columnId,
          desc: column.desc,
        })),
      })),
      compoundUniqueKeyList: {
        compoundUniqueKeys: table.compoundUniqueKeys?.map((key) => ({
          identityKey: key.identityKey,
          name: key.name,
          columns: key.columns.map((columnId) => ({ columnId })),
        })),
      },
    };
  });
}
