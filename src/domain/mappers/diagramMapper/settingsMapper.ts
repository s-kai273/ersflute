import { defaultSettings } from "@/domain/diagram/defaultSettings";
import { type DiagramSettingsResponse } from "@/types/api/diagramSettings";
import type { Settings } from "@/types/domain/settings";

export function mapSettingsFromApi(
  diagramSettings?: DiagramSettingsResponse,
): Settings {
  return {
    ...defaultSettings,
    ...diagramSettings,
  } satisfies Settings;
}

export function mapSettingsToApi(settings: Settings): DiagramSettingsResponse {
  return {
    database: settings.database,
    capital: settings.capital,
    tableStyle: settings.tableStyle,
    notation: settings.notation,
    notationLevel: settings.notationLevel,
    notationExpandGroup: settings.notationExpandGroup,
    viewMode: settings.viewMode,
    outlineViewMode: settings.outlineViewMode,
    viewOrderBy: settings.viewOrderBy,
    autoImeChange: settings.autoImeChange,
    validatePhysicalName: settings.validatePhysicalName,
    useBezierCurve: settings.useBezierCurve,
    suspendValidator: settings.suspendValidator,
    titleFontEm: settings.titleFontEm,
    masterDataBasePath: settings.masterDataBasePath,
    useViewObject: settings.useViewObject,
    exportSettings: settings.exportSettings,
    categorySettings: settings.categorySettings,
    modelProperties: settings.modelProperties,
    tableProperties: settings.tableProperties,
    environmentSettings: settings.environmentSettings,
    designSettings: settings.designSettings,
  };
}
