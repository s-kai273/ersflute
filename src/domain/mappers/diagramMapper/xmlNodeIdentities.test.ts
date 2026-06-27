import type { Table } from "@/types/domain/table";
import {
  applyXmlNodeIdentities,
  collectXmlNodeIdentities,
} from "./xmlNodeIdentities";

function createTable(): Table {
  return {
    color: { r: 0, g: 0, b: 0 },
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    physicalName: "RENAMED_TABLE",
    logicalName: "Renamed table",
    description: "",
    columns: [
      {
        physicalName: "RENAMED_COLUMN",
      },
    ],
  };
}

test("loaded XML identities survive renamed domain values", () => {
  const table = createTable();
  const objects = {
    tables: [table],
    relationships: [],
    columnGroups: [],
    vdiagrams: [],
  };

  applyXmlNodeIdentities(
    {
      xmlNodeIds: [
        { id: "table-source-path", tag: "table", index: 0 },
        {
          id: "column-source-path",
          tag: "normal_column",
          parentId: "table-source-path",
          index: 0,
        },
      ],
    },
    objects,
  );

  expect(collectXmlNodeIdentities(objects)).toEqual([
    { id: "table-source-path", tag: "table", index: 0 },
    {
      id: "column-source-path",
      tag: "normal_column",
      parentId: "table-source-path",
      index: 0,
    },
  ]);
});

test("new domain elements are omitted from the source identity context", () => {
  const table = createTable();

  expect(
    collectXmlNodeIdentities({
      tables: [table],
      relationships: [],
      columnGroups: [],
      vdiagrams: [],
    }),
  ).toEqual([]);
});
