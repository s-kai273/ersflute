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
      ...defaultSettings,
      database: "postgresql",
      capital: false,
      tableStyle: "standard",
      notation: "IE",
      notationLevel: 1,
      notationExpandGroup: false,
      viewMode: ViewMode.LogicalPhysical,
      outlineViewMode: 2,
      viewOrderBy: 3,
      autoImeChange: true,
      validatePhysicalName: false,
      useBezierCurve: true,
      suspendValidator: true,
      titleFontEm: 1.5,
      masterDataBasePath: "/tmp/master",
      useViewObject: true,
    },
    tables: [],
    relationships: [],
    columnGroups: [],
    vdiagrams: [],
  });

  expect(result.diagramSettings).toMatchObject({
    database: "postgresql",
    capital: false,
    tableStyle: "standard",
    notation: "IE",
    notationLevel: 1,
    notationExpandGroup: false,
    viewMode: ViewMode.LogicalPhysical,
    outlineViewMode: 2,
    viewOrderBy: 3,
    autoImeChange: true,
    validatePhysicalName: false,
    useBezierCurve: true,
    suspendValidator: true,
    titleFontEm: 1.5,
    masterDataBasePath: "/tmp/master",
    useViewObject: true,
  });
});
