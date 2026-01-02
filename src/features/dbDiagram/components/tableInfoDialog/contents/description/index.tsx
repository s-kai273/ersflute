import { useViewModeStore } from "@/stores/viewModeStore";
import type { DescriptionContentProps } from "./types";

export function DescriptionContent({
  description,
  setDescription,
}: DescriptionContentProps) {
  const { isReadOnly } = useViewModeStore();
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-medium text-slate-600">Table Description</span>
      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        readOnly={isReadOnly}
        className="min-h-[150px] rounded border border-slate-300 px-2 py-2 text-sm leading-5 shadow-inner focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-200"
      />
    </label>
  );
}
