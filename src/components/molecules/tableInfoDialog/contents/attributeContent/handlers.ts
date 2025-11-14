import { useCallback } from "react";
import type { Column } from "@/components/molecules/tableNode/types";
import type { AttributeContentProps } from "./types";

type UseAttributeContentHandlersParams = {
  columns: Column[];
  selectedColumnIndex: number | null;
  setSelectedColumnIndex: (index: number | null) => void;
  setAttributeView: (view: "list" | "detail") => void;
  setData: AttributeContentProps["setData"];
};

export function useAttributeContentHandlers({
  columns,
  selectedColumnIndex,
  setSelectedColumnIndex,
  setAttributeView,
  setData,
}: UseAttributeContentHandlersParams) {
  const handleSelectColumn = useCallback(
    (index: number) => {
      setSelectedColumnIndex(index);
    },
    [setSelectedColumnIndex],
  );

  const handleOpenDetail = useCallback(
    (index: number) => {
      setSelectedColumnIndex(index);
      setAttributeView("detail");
    },
    [setAttributeView, setSelectedColumnIndex],
  );

  const handleAddColumn = useCallback(() => {
    const newColumn: Column = {
      physicalName: "",
      notNull: false,
    };
    const nextColumns = [...columns, newColumn];

    setData((current) => ({
      ...current,
      columns: nextColumns,
    }));

    setSelectedColumnIndex(nextColumns.length - 1);
    setAttributeView("detail");
  }, [columns, setAttributeView, setData, setSelectedColumnIndex]);

  const handleEditColumn = useCallback(() => {
    if (selectedColumnIndex == null) {
      return;
    }
    setAttributeView("detail");
  }, [selectedColumnIndex, setAttributeView]);

  const handleDeleteColumn = useCallback(() => {
    if (selectedColumnIndex == null) {
      return;
    }

    const columnIndex = selectedColumnIndex;
    const nextColumns = columns.filter((_, index) => index !== columnIndex);
    setData((current) => ({
      ...current,
      columns: nextColumns,
    }));

    if (nextColumns.length === 0) {
      setSelectedColumnIndex(null);
    } else {
      const nextIndex = Math.min(columnIndex, nextColumns.length - 1);
      setSelectedColumnIndex(nextIndex);
    }
    setAttributeView("list");
  }, [columns, selectedColumnIndex, setAttributeView, setData, setSelectedColumnIndex]);

  const handleBackToColumnList = useCallback(
    (column: Column) => {
      setData((current) => {
        const nextColumns = current.columns?.map((col, index) => {
          if (index === selectedColumnIndex) {
            return column;
          }
          return col;
        });
        return {
          ...current,
          columns: nextColumns,
        };
      });
      setAttributeView("list");
    },
    [selectedColumnIndex, setAttributeView, setData],
  );

  return {
    handleSelectColumn,
    handleOpenDetail,
    handleAddColumn,
    handleEditColumn,
    handleDeleteColumn,
    handleBackToColumnList,
  };
}
