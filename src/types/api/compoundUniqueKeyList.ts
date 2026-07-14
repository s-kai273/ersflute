import type { Identified } from "../identified";

type Column = {
  columnId: string;
};

type CompoundUniqueKey = Identified<{
  name: string;
  columns: Column[];
}>;

export type CompoundUniqueKeyList = {
  compoundUniqueKeys?: CompoundUniqueKey[];
};
