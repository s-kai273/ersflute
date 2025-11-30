import "./App.css";
import "@xyflow/react/dist/style.css";
import { ReactFlowProvider } from "@xyflow/react";
import { DbDiagram } from "@/features/dbdiagram";
import { Toolbar } from "@/features/toolbar";

function App() {
  return (
    <div className="flex h-screen w-screen bg-slate-100">
      <Toolbar />
      <main className="flex flex-1">
        <ReactFlowProvider>
          <DbDiagram />
        </ReactFlowProvider>
      </main>
    </div>
  );
}

export default App;
