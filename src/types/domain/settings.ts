export const ViewMode = {
  Logical: 0,
  Physical: 1,
  LogicalPhysical: 2,
};

export type ViewMode = (typeof ViewMode)[keyof typeof ViewMode];

export type EmptySettings = Record<string, never>;

export type Settings = {
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
