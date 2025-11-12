import { useEffect, useMemo, useRef, useState } from "react";
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
  const [shouldFocusColumnDetails, setShouldFocusColumnDetails] =
    useState(false);
  const columnPhysicalNameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSelectedColumnIndex(null);
    setAttributeView("list");
  }, [open]);

  useEffect(() => {
    if (
      attributeView === "detail" &&
      shouldFocusColumnDetails &&
      columnPhysicalNameInputRef.current
    ) {
      columnPhysicalNameInputRef.current.focus();
      columnPhysicalNameInputRef.current.select();
      setShouldFocusColumnDetails(false);
    }
  }, [attributeView, shouldFocusColumnDetails]);

  const selectedColumn = useMemo(
    () =>
      selectedColumnIndex != null
        ? data?.columns?.[selectedColumnIndex]
        : undefined,
    [data, selectedColumnIndex],
  );
  const [columnLength, setColumnLength] = useState<number | undefined>(
    selectedColumn?.length,
  );
  const [columnDecimal, setColumnDecimal] = useState<number | undefined>(
    selectedColumn?.decimal,
  );
  const [columnUnsigned, setColumnUnsigned] = useState<boolean | undefined>(
    selectedColumn?.unsigned,
  );
  const [columnEnumArgs, setColumnEnumArgs] = useState<string | undefined>(
    selectedColumn?.enumArgs,
  );
  const handleSelectColumn = (index: number) => {
    setSelectedColumnIndex(index);
  };
  const handleSetColumnLength = (value: number | undefined) => {
    setColumnLength(value);
  };
  const handleSetColumnDecimal = (value: number | undefined) => {
    setColumnDecimal(value);
  };
  const handleSetColumnUnsigned = (value: boolean | undefined) => {
    setColumnUnsigned(value);
  };
  const handleSetColumnEnumArgs = (value: string | undefined) => {
    setColumnEnumArgs(value);
  };

  const openColumnDetail = (index: number, focus = true) => {
    setSelectedColumnIndex(index);
    setAttributeView("detail");
    if (focus) {
      setShouldFocusColumnDetails(true);
    }
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

  const handleBackToColumnList = () => {
    setAttributeView("list");
  };

  const updateSelectedColumn = <Key extends keyof Column>(
    key: Key,
    value: Column[Key],
  ) => {
    if (selectedColumnIndex == null) {
      return;
    }

    setData((current) => {
      const nextColumns = [
        ...(current && current.columns ? current.columns : []),
      ];
      nextColumns[selectedColumnIndex] = {
        ...nextColumns[selectedColumnIndex],
        [key]: value,
      };
      return {
        ...current,
        columns: nextColumns,
      };
    });
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
          selectedColumn={selectedColumn}
          columnTypeValue={selectedColumn?.columnType}
          columnLength={columnLength}
          columnDecimal={columnDecimal}
          columnUnsigned={columnUnsigned}
          columnEnumArgs={columnEnumArgs}
          setColumnLength={handleSetColumnLength}
          setColumnDecimal={handleSetColumnDecimal}
          setColumnUnsigned={handleSetColumnUnsigned}
          setColumnEnumArgs={handleSetColumnEnumArgs}
          onBack={handleBackToColumnList}
          updateSelectedColumn={updateSelectedColumn}
          columnPhysicalNameInputRef={columnPhysicalNameInputRef}
        />
      )}
    </>
  );
}
