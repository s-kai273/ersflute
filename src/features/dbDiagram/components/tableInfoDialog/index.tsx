import { useEffect, useState } from "react";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Column, type Table } from "@/types/domain/table";
import { AttributeContent } from "./contents/attribute";
import { type TableInfoDialogProps } from "./types";

export function TableInfoDialog({
  data,
  onApply,
  onCancel,
  ...props
}: TableInfoDialogProps) {
  const { open, onOpenChange, ...dialogProps } = props;
  const [tableData, setTableData] = useState<Table>(data);
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setDescription("");
  }, [data, open]);

  const handleApply = () => {
    const columns = tableData.columns || [];
    const preparedColumns = columns.map<Column>((column) => ({
      physicalName: column.physicalName.trim(),
      logicalName: column.logicalName?.trim()
        ? column.logicalName.trim()
        : undefined,
      columnType: column.columnType ? column.columnType : undefined,
      length: column.length,
      notNull: column.notNull,
      primaryKey: column.primaryKey,
      referredColumn: column.referredColumn?.trim()
        ? column.referredColumn.trim()
        : undefined,
      unique: column.unique,
    }));

    onApply?.({
      ...data,
      physicalName: tableData.physicalName.trim(),
      logicalName: tableData?.logicalName?.trim()
        ? tableData?.logicalName.trim()
        : undefined,
      columns: preparedColumns,
    });
    onOpenChange?.(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...dialogProps}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-[1000px] sm:max-w-[1000px] sm:h-[650px] sm:max-h-[80vh] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden"
      >
        <DialogHeader>
          <DialogTitle>Table Information</DialogTitle>
        </DialogHeader>
        <Tabs
          defaultValue="attribute"
          className="flex h-full flex-col gap-2 overflow-hidden"
        >
          <TabsList className="rounded-md border border-slate-200 bg-white p-0.5">
            <TabsTrigger className="px-3" value="attribute">
              Attribute
            </TabsTrigger>
            <TabsTrigger className="px-3" value="description">
              Description
            </TabsTrigger>
            <TabsTrigger className="px-3" value="constraint-option">
              Constraint/Option
            </TabsTrigger>
            <TabsTrigger className="px-3" value="compound-unique-key">
              Compound Unique Key
            </TabsTrigger>
            <TabsTrigger className="px-3" value="index">
              Index
            </TabsTrigger>
            <TabsTrigger className="px-3" value="advanced-settings">
              Advanced Settings
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="attribute"
            className="flex flex-1 flex-col gap-1 overflow-y-auto pr-2"
          >
            <AttributeContent data={tableData} setData={setTableData} />
          </TabsContent>
          <TabsContent
            value="description"
            className="rounded-md border border-slate-200 bg-white p-4"
          >
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-600">
                Table Description
              </span>
              <textarea
                className="min-h-[150px] rounded border border-slate-300 px-2 py-2 text-sm leading-5 shadow-inner focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-200"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </label>
          </TabsContent>
          <TabsContent
            value="constraint-option"
            className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500"
          >
            Constraint and option settings will be available in a future update.
          </TabsContent>
          <TabsContent
            value="compound-unique-key"
            className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500"
          >
            Manage compound unique keys here once configured.
          </TabsContent>
          <TabsContent
            value="index"
            className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500"
          >
            Index configuration will be implemented soon.
          </TabsContent>
          <TabsContent
            value="advanced-settings"
            className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500"
          >
            Advanced settings are not yet available for this table.
          </TabsContent>
        </Tabs>
        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={handleApply}>
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
