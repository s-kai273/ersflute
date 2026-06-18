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
    viewMode: settings.viewMode,
  };
}
