import { useEffect, useMemo, useState } from "react";
import { Column } from "@/components/molecules/tableNode/types";
import { Input } from "@/components/ui/input";
import { AttributeDetail } from "./detail";
import { AttributeList } from "./list";
import { AttributeContentProps } from "./types";

export function AttributeContent({ data, setData }: AttributeContentProps) {
  const [attributeView, setAttributeView] = useState<"list" | "detail">("list");
  const [selectedColumnIndex, setSelectedColumnIndex] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    setSelectedColumnIndex(null);
    setAttributeView("list");
  }, [open]);

  const selectedColumn = useMemo(
    () =>
      selectedColumnIndex != null
        ? data?.columns?.[selectedColumnIndex]
        : undefined,
    [data, selectedColumnIndex],
  );
  const handleSelectColumn = (index: number) => {
    setSelectedColumnIndex(index);
  };

  const openColumnDetail = (index: number) => {
    setSelectedColumnIndex(index);
    setAttributeView("detail");
  };

  const handleAddColumn = () => {
    const newColumn: Column = {
      physicalName: "",
      notNull: false,
    };

    const nextColumns = [
      ...(data && data.columns ? data.columns : []),
      newColumn,
    ];
    setData({
      ...data,
      columns: nextColumns,
    });
    openColumnDetail(nextColumns.length - 1);
  };

  const handleEditColumn = () => {
    if (selectedColumnIndex == null) {
      return;
    }

    openColumnDetail(selectedColumnIndex);
  };

  const handleDeleteColumn = () => {
    if (selectedColumnIndex == null) {
      return;
    }

    const columnIndex = selectedColumnIndex;
    setData((current) => {
      const nextColumns = current.columns?.filter(
        (_, index) => index !== columnIndex,
      );
      if (nextColumns && nextColumns.length === 0) {
        setSelectedColumnIndex(null);
      } else {
        const nextIndex = Math.min(
          columnIndex,
          nextColumns ? nextColumns.length - 1 : 0,
        );
        setSelectedColumnIndex(nextIndex);
      }
      return {
        ...current,
        columns: nextColumns,
      };
    });
    setAttributeView("list");
  };

  const handleBackToColumnList = (column: Column) => {
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
  };

  return (
    <>
      <section className="flex-none rounded-md border border-slate-200 bg-white">
        <div className="grid grid-cols-[140px_1fr_140px_1fr] items-center gap-3 border-b border-slate-200 px-4 py-3 text-sm">
          <label
            className="font-medium text-slate-600"
            htmlFor="table-info-physical-name"
          >
            Physical Name
          </label>
          <Input
            id="table-info-physical-name"
            className="h-8 rounded border border-slate-300 px-2 text-sm shadow-inner focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-200"
            type="text"
            value={data.physicalName}
            onChange={(event) =>
              setData({
                ...data,
                physicalName: event.target.value,
              })
            }
          />
          <label
            className="font-medium text-slate-600"
            htmlFor="table-info-logical-name"
          >
            Logical Name
          </label>
          <Input
            id="table-info-logical-name"
            className="h-8 rounded border border-slate-300 px-2 text-sm shadow-inner focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-200"
            type="text"
            value={data.logicalName ?? ""}
            onChange={(event) =>
              setData({
                ...data,
                logicalName:
                  event.target.value === "" ? undefined : event.target.value,
              })
            }
          />
        </div>
      </section>

      {attributeView === "list" ? (
        <AttributeList
          data={data}
          selectedColumnIndex={selectedColumnIndex}
          onSelectColumn={handleSelectColumn}
          onOpenDetail={openColumnDetail}
          onAddColumn={handleAddColumn}
          onEditColumn={handleEditColumn}
          onDeleteColumn={handleDeleteColumn}
        />
      ) : (
        <AttributeDetail
          column={selectedColumn}
          onBack={handleBackToColumnList}
        />
      )}
    </>
  );
}
