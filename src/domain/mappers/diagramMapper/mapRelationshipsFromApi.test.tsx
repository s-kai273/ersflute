import type { TableResponse } from "@/types/api/diagramWalkers";
import { Cardinality, ReferenceOperation } from "@/types/domain/relationship";
import { mapDiagramFromApi } from ".";

function createTableResponse(
  overrides?: Partial<TableResponse>,
): TableResponse {
  return {
    physicalName: "users",
    logicalName: "Users",
    description: "User table",
    height: 80,
    width: 120,
    fontName: "Arial",
    fontSize: 12,
    x: 10,
    y: 20,
    color: { r: 10, g: 20, b: 30 },
    connections: { relationships: [] },
    columns: { items: [] },
    indexes: [],
    compoundUniqueKeyList: {},
    ...overrides,
  };
}

it("maps API relationships that reference a primary key", () => {
  const result = mapDiagramFromApi({
    diagramWalkers: {
      tables: [
        createTableResponse({
          columns: {
            items: [
              {
                physicalName: "id",
                primaryKey: true,
              },
              {
                physicalName: "unique_title",
                uniqueKey: true,
              },
            ],
          },
        }),
        createTableResponse({
          physicalName: "comments",
          connections: {
            relationships: [
              {
                identityKey: "relationship-user-comments",
                name: "user_comments",
                source: "table.users",
                target: "table.comments",
                fkColumns: { fkColumn: [{ fkColumnName: "user_id" }] },
                parentCardinality: Cardinality.One,
                childCardinality: Cardinality.ZeroN,
                referenceForPk: true,
                onDeleteAction: ReferenceOperation.Cascade,
                onUpdateAction: ReferenceOperation.Cascade,
              },
            ],
          },
        }),
      ],
    },
  });

  expect(result.relationships).toEqual([
    {
      identityKey: "relationship-user-comments",
      name: "user_comments",
      source: "table.users",
      target: "table.comments",
      fkColumnNames: ["user_id"],
      parentCardinality: Cardinality.One,
      childCardinality: Cardinality.ZeroN,
      referredColumn: "id",
      referredColumnOptions: ["id", "unique_title"],
      onDeleteAction: ReferenceOperation.Cascade,
      onUpdateAction: ReferenceOperation.Cascade,
    },
  ]);
});

it("maps API relationships that reference a simple unique column", () => {
  const result = mapDiagramFromApi({
    diagramWalkers: {
      tables: [
        createTableResponse({
          physicalName: "accounts",
          columns: {
            items: [
              {
                physicalName: "id",
                primaryKey: true,
              },
              {
                physicalName: "email",
                uniqueKey: true,
              },
            ],
          },
        }),
        createTableResponse({
          physicalName: "logins",
          connections: {
            relationships: [
              {
                name: "account_logins",
                source: "table.accounts",
                target: "table.logins",
                fkColumns: { fkColumn: [{ fkColumnName: "account_email" }] },
                parentCardinality: Cardinality.One,
                childCardinality: Cardinality.ZeroN,
                referenceForPk: false,
                referredSimpleUniqueColumn: "email",
              },
            ],
          },
        }),
      ],
    },
  });

  expect(result.relationships[0]).toMatchObject({
    name: "account_logins",
    referredColumn: "email",
    referredColumnOptions: ["id", "email"],
  });
});

it("maps API relationships that reference a compound unique key", () => {
  const result = mapDiagramFromApi({
    diagramWalkers: {
      tables: [
        createTableResponse({
          physicalName: "projects",
          columns: {
            items: [
              {
                physicalName: "id",
                primaryKey: true,
              },
              {
                physicalName: "code",
                uniqueKey: true,
              },
            ],
          },
          compoundUniqueKeyList: {
            compoundUniqueKeys: [
              {
                name: "uq_project_tenant",
                columns: [{ columnId: "code" }, { columnId: "tenant_id" }],
              },
            ],
          },
        }),
        createTableResponse({
          physicalName: "issues",
          connections: {
            relationships: [
              {
                name: "project_issues",
                source: "table.projects",
                target: "table.issues",
                fkColumns: {
                  fkColumn: [
                    { fkColumnName: "project_code" },
                    { fkColumnName: "project_tenant_id" },
                  ],
                },
                parentCardinality: Cardinality.One,
                childCardinality: Cardinality.ZeroN,
                referenceForPk: false,
                referredCompoundUniqueKey: "uq_project_tenant",
              },
            ],
          },
        }),
      ],
    },
  });

  expect(result.relationships[0]).toMatchObject({
    name: "project_issues",
    fkColumnNames: ["project_code", "project_tenant_id"],
    referredColumn: "uq_project_tenant",
    referredColumnOptions: ["id", "code", "uq_project_tenant"],
  });
});
