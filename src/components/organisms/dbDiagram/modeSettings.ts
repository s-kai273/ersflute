import { DiagramMode } from "../../../types/diagramMode";

type ModeSettings = {
  cursorClass: string;
  nodesDraggable: boolean;
  nodesConnectable: boolean;
  elementsSelectable: boolean;
  selectionOnDrag: boolean;
};

const selectSettings: ModeSettings = {
  cursorClass: "cursor-default",
  nodesDraggable: true,
  nodesConnectable: true,
  elementsSelectable: true,
  selectionOnDrag: true,
};

const creationSettings: ModeSettings = {
  cursorClass: "cursor-crosshair",
  nodesDraggable: false,
  nodesConnectable: false,
  elementsSelectable: false,
  selectionOnDrag: false,
};

const connectionSettings: ModeSettings = {
  cursorClass: "cursor-crosshair",
  nodesDraggable: false,
  nodesConnectable: true,
  elementsSelectable: true,
  selectionOnDrag: false,
};

export const modeSettings: Record<DiagramMode, ModeSettings> = {
  [DiagramMode.Select]: { ...selectSettings },
  [DiagramMode.Table]: { ...creationSettings },
  [DiagramMode.OneToManyRelationship]: { ...connectionSettings },
  [DiagramMode.SelfRelationship]: { ...connectionSettings },
  [DiagramMode.Note]: { ...creationSettings },
  [DiagramMode.NoteConnection]: { ...connectionSettings },
  [DiagramMode.TableGroup]: { ...creationSettings },
  [DiagramMode.ImageOnDiagram]: { ...creationSettings },
};
