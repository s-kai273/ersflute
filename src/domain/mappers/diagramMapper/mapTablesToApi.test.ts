import { defaultSettings } from "@/domain/diagram/defaultSettings";
import { ColumnType } from "@/types/domain/columnType";
import { Cardinality, ReferenceOperation } from "@/types/domain/relationship";
import { mapDiagramToApi } from ".";

it("maps table attributes and columns to API values", () => {
  const result = mapDiagramToApi({
    settings: defaultSettings,
    tables: [
      {
        identityKey: "table-members",
        x: 10,
        y: 20,
        width: 240,
        height: 120,
        fontName: "Arial",
        fontSize: 12,
        physicalName: "MEMBERS",
        logicalName: "Members",
        description: "Member table",
        color: { r: 1, g: 2, b: 3 },
        tableConstraint: "ENGINE=InnoDB",
        primaryKeyName: "PK_MEMBERS",
        option: "table option",
        columns: [
          {
            identityKey: "column-member-id",
            physicalName: "MEMBER_ID",
            logicalName: "Member ID",
            description: "Identifier",
            columnType: ColumnType.BigInt,
            length: 20,
            unsigned: true,
            notNull: true,
            unique: true,
            defaultValue: "0",
            primaryKey: true,
            autoIncrement: true,
            relationship: "FK_MEMBER_STATUS",
          },
          "COMMON",
        ],
        indexes: [
          {
            identityKey: "index-member-name",
            name: "IDX_MEMBER_NAME",
            indexType: "BTREE",
            description: "Name lookup",
            fullText: false,
            nonUnique: true,
            columns: [{ columnId: "MEMBER_NAME", desc: true }],
          },
        ],
        compoundUniqueKeys: [
          {
            identityKey: "unique-member-name",
            name: "UK_MEMBER_NAME",
            columns: ["MEMBER_NAME", "MEMBER_STATUS_CODE"],
          },
        ],
      },
    ],
    relationships: [],
    columnGroups: [],
    vdiagrams: [],
  });

  expect(result.diagramWalkers?.tables?.[0]).toMatchObject({
    identityKey: "table-members",
    physicalName: "MEMBERS",
    logicalName: "Members",
    description: "Member table",
    height: 120,
    width: 240,
    fontName: "Arial",
    fontSize: 12,
    x: 10,
    y: 20,
    color: { r: 1, g: 2, b: 3 },
    connections: { relationships: [] },
    tableConstraint: "ENGINE=InnoDB",
    primaryKeyName: "PK_MEMBERS",
    option: "table option",
    columns: {
      items: [
        {
          identityKey: "column-member-id",
          physicalName: "MEMBER_ID",
          logicalName: "Member ID",
          description: "Identifier",
          columnType: ColumnType.BigInt,
          length: 20,
          unsigned: true,
          notNull: true,
          uniqueKey: true,
          defaultValue: "0",
          primaryKey: true,
          autoIncrement: true,
          relationship: "FK_MEMBER_STATUS",
        },
        "COMMON",
      ],
    },
    indexes: [
      {
        identityKey: "index-member-name",
        name: "IDX_MEMBER_NAME",
        indexType: "BTREE",
        description: "Name lookup",
        fullText: false,
        nonUnique: true,
        columns: [{ columnId: "MEMBER_NAME", desc: true }],
      },
    ],
    compoundUniqueKeyList: {
      compoundUniqueKeys: [
        {
          identityKey: "unique-member-name",
          name: "UK_MEMBER_NAME",
          columns: [
            { columnId: "MEMBER_NAME" },
            { columnId: "MEMBER_STATUS_CODE" },
          ],
        },
      ],
    },
  });
});

it("places relationships on their target API table", () => {
  const result = mapDiagramToApi({
    settings: defaultSettings,
    tables: [
      {
        x: 0,
        y: 0,
        width: 100,
        height: 80,
        physicalName: "MEMBERS",
        logicalName: "Members",
        description: "",
        color: { r: 1, g: 2, b: 3 },
        columns: [{ physicalName: "MEMBER_ID", primaryKey: true }],
        compoundUniqueKeys: [{ name: "UK_MEMBER_CODE", columns: ["CODE"] }],
      },
      {
        x: 0,
        y: 0,
        width: 100,
        height: 80,
        physicalName: "PURCHASES",
        logicalName: "Purchases",
        description: "",
        color: { r: 1, g: 2, b: 3 },
      },
    ],
    relationships: [
      {
        identityKey: "relationship-purchase-member",
        name: "FK_PURCHASE_MEMBER",
        source: "table.MEMBERS",
        target: "table.PURCHASES",
        fkColumnNames: ["MEMBER_ID"],
        parentCardinality: Cardinality.One,
        childCardinality: Cardinality.ZeroN,
        referredColumn: "MEMBER_ID",
        referredColumnOptions: ["MEMBER_ID", "UK_MEMBER_CODE"],
        onDeleteAction: ReferenceOperation.Restrict,
        onUpdateAction: ReferenceOperation.Cascade,
      },
    ],
    columnGroups: [],
    vdiagrams: [],
  });

  expect(result.diagramWalkers?.tables?.[1].connections.relationships).toEqual([
    {
      identityKey: "relationship-purchase-member",
      name: "FK_PURCHASE_MEMBER",
      source: "table.MEMBERS",
      target: "table.PURCHASES",
      fkColumns: { fkColumn: [{ fkColumnName: "MEMBER_ID" }] },
      parentCardinality: Cardinality.One,
      childCardinality: Cardinality.ZeroN,
      referenceForPk: true,
      onDeleteAction: ReferenceOperation.Restrict,
      onUpdateAction: ReferenceOperation.Cascade,
      referredSimpleUniqueColumn: undefined,
      referredCompoundUniqueKey: undefined,
    },
  ]);
});

it("maps compound unique key relationships to API values", () => {
  const result = mapDiagramToApi({
    settings: defaultSettings,
    tables: [
      {
        x: 0,
        y: 0,
        width: 100,
        height: 80,
        physicalName: "MEMBERS",
        logicalName: "Members",
        description: "",
        color: { r: 1, g: 2, b: 3 },
        columns: [{ physicalName: "MEMBER_ID", primaryKey: true }],
        compoundUniqueKeys: [{ name: "UK_MEMBER_CODE", columns: ["CODE"] }],
      },
      {
        x: 0,
        y: 0,
        width: 100,
        height: 80,
        physicalName: "PURCHASES",
        logicalName: "Purchases",
        description: "",
        color: { r: 1, g: 2, b: 3 },
      },
    ],
    relationships: [
      {
        name: "FK_PURCHASE_MEMBER",
        source: "table.MEMBERS",
        target: "table.PURCHASES",
        fkColumnNames: ["MEMBER_CODE"],
        parentCardinality: Cardinality.One,
        childCardinality: Cardinality.ZeroN,
        referredColumn: "UK_MEMBER_CODE",
        referredColumnOptions: ["MEMBER_ID", "UK_MEMBER_CODE"],
      },
    ],
    columnGroups: [],
    vdiagrams: [],
  });

  expect(
    result.diagramWalkers?.tables?.[1].connections.relationships[0],
  ).toMatchObject({
    referenceForPk: false,
    referredSimpleUniqueColumn: undefined,
    referredCompoundUniqueKey: "UK_MEMBER_CODE",
  });
});
