import { defaultSettings } from "@/domain/diagram/defaultSettings";
import { mapDiagramFromApi, mapDiagramToApi } from ".";

it("maps virtual diagrams from API values", () => {
  const result = mapDiagramFromApi({
    vdiagrams: [
      {
        vdiagramName: "Main",
        color: { r: 255, g: 255, b: 255 },
        vtables: [
          {
            tableId: "table.users",
            x: 100,
            y: 200,
            fontName: "Arial",
            fontSize: 12,
          },
        ],
        walkerNotes: {},
        walkerGroups: {},
      },
    ],
  });

  expect(result.vdiagrams).toEqual([
    {
      vdiagramName: "Main",
      color: { r: 255, g: 255, b: 255 },
      vtables: [
        {
          tableId: "table.users",
          x: 100,
          y: 200,
          fontName: "Arial",
          fontSize: 12,
        },
      ],
      walkerNotes: {},
      walkerGroups: {},
    },
  ]);
});

it("maps virtual diagrams to API values", () => {
  const result = mapDiagramToApi({
    settings: defaultSettings,
    tables: [],
    relationships: [],
    columnGroups: [],
    vdiagrams: [
      {
        vdiagramName: "Main",
        color: { r: 255, g: 255, b: 255 },
        vtables: [
          {
            tableId: "table.users",
            x: 100,
            y: 200,
            fontName: "Arial",
            fontSize: 12,
          },
        ],
        walkerNotes: {},
        walkerGroups: {},
      },
    ],
  });

  expect(result.vdiagrams).toEqual([
    {
      vdiagramName: "Main",
      color: { r: 255, g: 255, b: 255 },
      vtables: [
        {
          tableId: "table.users",
          x: 100,
          y: 200,
          fontName: "Arial",
          fontSize: 12,
        },
      ],
      walkerNotes: {},
      walkerGroups: {},
    },
  ]);
});
