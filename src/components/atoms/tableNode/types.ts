import { NodeData } from "reaflow";
import { Table } from "../../../types/table";

export type TableNodeProps = Omit<NodeData, "data"> & { data: Table };
