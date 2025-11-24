import { useState } from "react";
import "./App.css";
import "@xyflow/react/dist/style.css";
import { ReactFlowProvider } from "@xyflow/react";
import { DiagramMode } from "@/types/domain/diagramMode";
import type { DiagramMode as DiagramModeValue } from "@/types/domain/diagramMode";
import { Toolbar } from "./components/molecules/toolbar";
import { DbDiagram } from "./components/organisms/dbDiagram";
import { ReadOnlyDiagram } from "./components/organisms/ReadOnlyDiagram";
import { useReadOnlyStore } from "./stores/readOnlyStore";

function App() {
  const isReadOnly = useReadOnlyStore((s) => s.isReadOnly);
  const [activeMode, setActiveMode] = useState<DiagramModeValue>(
    DiagramMode.Select,
  );

  return (
    <div className="flex h-screen w-screen bg-slate-100">
      {!isReadOnly && (
        <Toolbar activeMode={activeMode} onModeChange={setActiveMode} />
      )}
      <main className="flex flex-1">
        <ReactFlowProvider>
          {isReadOnly ? (
            <ReadOnlyDiagram />
          ) : (
            <DbDiagram activeMode={activeMode} />
          )}
        </ReactFlowProvider>
      </main>
    </div>
  );
}

export default App;
