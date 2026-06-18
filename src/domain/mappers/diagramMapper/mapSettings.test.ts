import { defaultSettings } from "@/domain/diagram/defaultSettings";
import { ViewMode } from "@/types/domain/settings";
import { mapDiagramFromApi, mapDiagramToApi } from ".";

it("maps settings from API values with defaults", () => {
  const result = mapDiagramFromApi({
    diagramSettings: {
      ...defaultSettings,
      database: "mysql",
      viewMode: ViewMode.Physical,
    },
  });

  expect(result.settings).toEqual({
    ...defaultSettings,
    database: "mysql",
    viewMode: ViewMode.Physical,
  });
});

it("maps settings to API values", () => {
  const result = mapDiagramToApi({
    preservedXml: "<diagram />",
    settings: {
      database: "postgresql",
      viewMode: ViewMode.LogicalPhysical,
    },
    tables: [],
    relationships: [],
    columnGroups: [],
    vdiagrams: [],
  });

  expect(result.diagramSettings).toEqual({
    database: "postgresql",
    viewMode: ViewMode.LogicalPhysical,
  });
});
