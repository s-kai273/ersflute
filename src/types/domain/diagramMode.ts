export const DiagramMode = {
  Select: "Select",
  Table: "Table",
  OneToManyRelationship: "OneToManyRelationship",
  SelfRelationship: "SelfRelationship",
  Note: "Note",
  NoteConnection: "NoteConnection",
  TableGroup: "TableGroup",
  ImageOnDiagram: "ImageOnDiagram",
} as const;

export type DiagramMode = (typeof DiagramMode)[keyof typeof DiagramMode];
