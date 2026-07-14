import type { Identified } from "../identified";

type Column = {
  columnId: string;
  desc?: boolean;
};

type Index = Identified<{
  name: string;
  indexType: string;
  description?: string;
  fullText?: boolean;
  nonUnique?: boolean;
  columns: Column[];
}>;

export type Indexes = Index[];
