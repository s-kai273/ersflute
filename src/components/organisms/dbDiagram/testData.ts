import { Cardinality, Table } from "../../../types/table";

export const tables: Table[] = [
  {
    physicalName: "MEMBERS",
    logicalName: "会員",
    description: "",
    height: 108,
    width: 194,
    fontName: "Ubuntu",
    fontSize: 9,
    x: 160,
    y: 106,
    color: {
      r: 128,
      g: 128,
      b: 192,
    },
    columns: {
      normalColumn: [
        {
          physicalName: "MEMBER_ID",
          logicalName: "会員ID",
          columnType: "bigint",
          notNull: true,
          primaryKey: true,
        },
        {
          physicalName: "LAST_NAME",
          logicalName: "苗字",
          columnType: "varchar(n)",
          length: 0,
          notNull: true,
        },
        {
          physicalName: "FIRST_NAME",
          logicalName: "名前",
          columnType: "varchar(n)",
          length: 0,
          notNull: true,
        },
      ],
    },
  },
  {
    physicalName: "MEMBER_PROFILES",
    logicalName: "会員プロフィール",
    description: "",
    height: 89,
    width: 245,
    fontName: "Ubuntu",
    fontSize: 9,
    x: 488,
    y: 113,
    color: {
      r: 128,
      g: 128,
      b: 192,
    },
    connections: {
      relationship: [
        {
          name: "FK_MEMBER_PROFILES_MEMBERS",
          source: "table.MEMBERS",
          target: "table.MEMBER_PROFILES",
          fkColumns: {
            fkColumn: [
              {
                fkColumnName: "MEMBER_ID",
              },
            ],
          },
          parentCardinality: Cardinality.ZeroN,
          childCardinality: Cardinality.OneN,
          referenceForPk: true,
          onDeleteAction: "RESTRICT",
          onUpdateAction: "RESTRICT",
        },
      ],
    },
    columns: {
      normalColumn: [
        {
          physicalName: "MEMBER_PROFILE_ID",
          logicalName: "会員プロフィールID",
          columnType: "bigint(n)",
          length: 0,
          notNull: true,
          primaryKey: true,
        },
        {
          physicalName: "MEMBER_ID",
          referredColumn: "table.MEMBERS.MEMBER_ID",
          relationship: "FK_MEMBER_PROFILES_MEMBERS",
          notNull: true,
        },
        {
          physicalName: "SELF_INTRODUCTION",
          logicalName: "自己紹介",
          columnType: "text",
          notNull: true,
        },
      ],
    },
  },
];
