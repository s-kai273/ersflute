import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-slate-300 placeholder:text-muted-foreground focus-visible:border-blue-500 focus-visible:ring-blue-200 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] md:text-sm",
        "read-only:bg-slate-100 text-foreground/80 read-only:dark:bg-slate-800/70 read-onlydark:text-foreground",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-foreground/70 disabled:opacity-100 disabled:dark:bg-slate-800 disabled:dark:text-foreground/60",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
