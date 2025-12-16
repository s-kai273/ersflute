import { DbDiagram } from "@/features/dbDiagram";
import { EntryScreen } from "@/features/entryScreen";
import { Toolbar } from "@/features/toolbar";
import { useErmFileStore } from "@/stores/ermFileStore";
import { useSetupMenu } from "./useSetupMenu";
import "./index.css";
import { ErrorBoundary } from "./errorBoundary";

function App() {
  useSetupMenu();
  const { isLoaded } = useErmFileStore();
  return (
    <ErrorBoundary>
      {isLoaded ? (
        <div className="flex h-screen w-screen bg-slate-100">
          <Toolbar />
          <main className="flex flex-1">
            <DbDiagram />
          </main>
        </div>
      ) : (
        <EntryScreen />
      )}
    </ErrorBoundary>
  );
}

export default App;
