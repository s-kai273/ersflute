import { clsx } from "clsx";
import { toolProfiles } from "./modes";
import { ToolbarProps } from "./types";

export const Toolbar = ({ activeMode, onModeChange }: ToolbarProps) => {
  return (
    <aside className="flex w-44 flex-col border-r border-slate-200 bg-white/95 py-3 shadow-sm backdrop-blur">
      <header className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Tools
      </header>
      <nav className="flex-1 space-y-0.5 px-2">
        {toolProfiles.map((tool) => {
          const Icon = tool.icon;
          const isActive = tool.id === activeMode;
          return (
            <button
              key={tool.id}
              type="button"
              className={clsx(
                "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition",
                isActive
                  ? "bg-slate-200 text-slate-900 shadow-inner"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
              onClick={() => onModeChange(tool.id)}
              aria-pressed={isActive}
              title={tool.description}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              <span className="font-medium">{tool.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
