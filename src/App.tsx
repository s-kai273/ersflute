import { useState } from "react";
import "./App.css";
import "@xyflow/react/dist/style.css";
import { ReactFlowProvider } from "@xyflow/react";
import { Toolbar } from "./components/molecules/toolbar";
import { DbDiagram } from "./components/organisms/dbDiagram";
import { DiagramMode } from "./types/diagramMode";
import type { DiagramMode as DiagramModeValue } from "./types/diagramMode";

function App() {
  const [activeMode, setActiveMode] = useState<DiagramModeValue>(
    DiagramMode.Select,
  );

  return (
    <div className="flex h-screen w-screen bg-slate-100">
      <Toolbar activeMode={activeMode} onModeChange={setActiveMode} />
      <main className="flex flex-1">
        <ReactFlowProvider>
          <DbDiagram activeMode={activeMode} />
        </ReactFlowProvider>
      </main>
    </div>
  );
}

export default App;
