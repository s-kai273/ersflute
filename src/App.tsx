import { useState } from "react";
import "./App.css";
import "@xyflow/react/dist/style.css";
import { Toolbar } from "./components/molecules/toolbar";
import { DiagramMode } from "./types/diagramMode";
import type { DiagramMode as DiagramModeValue } from "./types/diagramMode";
import { DbDiagram } from "./components/organisms/dbDiagram";

function App() {
  const [activeMode, setActiveMode] = useState<DiagramModeValue>(
    DiagramMode.Select
  );

  return (
    <div className="flex h-screen w-screen bg-slate-100">
      <Toolbar activeMode={activeMode} onModeChange={setActiveMode} />
      <main className="flex flex-1">
        <DbDiagram activeMode={activeMode} />
      </main>
    </div>
  );
}

export default App;
