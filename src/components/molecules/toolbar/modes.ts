import {
  ArrowPathRoundedSquareIcon,
  ArrowsRightLeftIcon,
  CursorArrowRaysIcon,
  DocumentTextIcon,
  LinkIcon,
  PhotoIcon,
  Square3Stack3DIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";
import { DiagramMode } from "../../../types/diagramMode";

export const toolProfiles = [
  {
    id: DiagramMode.Select,
    label: "Select",
    icon: CursorArrowRaysIcon,
    description: "Select and move existing elements.",
  },
  {
    id: DiagramMode.Table,
    label: "Table",
    icon: TableCellsIcon,
    description: "Create a new table by clicking on the canvas.",
  },
  {
    id: DiagramMode.OneToManyRelationship,
    label: "1:n Relationship",
    icon: ArrowsRightLeftIcon,
    description: "Draw a one-to-many relationship between two tables.",
  },
  {
    id: DiagramMode.SelfRelationship,
    label: "Self Relationship",
    icon: ArrowPathRoundedSquareIcon,
    description: "Connect a table to itself.",
  },
  {
    id: DiagramMode.Note,
    label: "Note",
    icon: DocumentTextIcon,
    description: "Add a note to the canvas.",
  },
  {
    id: DiagramMode.NoteConnection,
    label: "Note Connection",
    icon: LinkIcon,
    description: "Link an existing note to a table.",
  },
  {
    id: DiagramMode.TableGroup,
    label: "Table Group",
    icon: Square3Stack3DIcon,
    description: "Group tables together for layout control.",
  },
  {
    id: DiagramMode.ImageOnDiagram,
    label: "Image on Diagram",
    icon: PhotoIcon,
    description: "Place a reference image on the canvas.",
  },
] as const;

export const findToolProfile = (mode: DiagramMode) => {
  const tool = toolProfiles.find((item) => item.id === mode);
  if (!tool) {
    throw new Error(`Unknown diagram mode: ${mode}`);
  }
  return tool;
};
