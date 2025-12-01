import { DbDiagram } from "@/features/dbDiagram";
import { Toolbar } from "@/features/toolbar";
import "./App.css";

function App() {
  return (
    <div className="flex h-screen w-screen bg-slate-100">
      <Toolbar />
      <main className="flex flex-1">
        <DbDiagram />
      </main>
    </div>
  );
}

export default App;
