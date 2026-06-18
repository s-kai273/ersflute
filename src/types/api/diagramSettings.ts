import { type ViewMode } from "@/types/domain/settings";

export type EmptySettings = Record<string, never>;

export type DiagramSettingsResponse = {
  database: string;
  capital: boolean;
  tableStyle: string;
  notation: string;
  notationLevel: number;
  notationExpandGroup: boolean;
  viewMode: ViewMode;
  outlineViewMode: number;
  viewOrderBy: number;
  autoImeChange: boolean;
  validatePhysicalName: boolean;
  useBezierCurve: boolean;
  suspendValidator: boolean;
  titleFontEm?: number;
  masterDataBasePath?: string;
  useViewObject: boolean;
  exportSettings: EmptySettings;
  categorySettings: EmptySettings;
  modelProperties: EmptySettings;
  tableProperties: EmptySettings;
  environmentSettings?: EmptySettings;
  designSettings?: EmptySettings;
};
